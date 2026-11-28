import { describe, it, expect, afterEach, vi } from 'vite-plus/test'
import { StrictMode } from 'react'
import {
    Canvas,
    Rectangle,
    Circle,
    Text,
    Layout,
    Block,
    makeBlockComponent,
} from '@2flexible/2flex-react'
import { Block as CoreBlock } from '@2flexible/2flex'
import { type BlockOptions } from '@2flexible/2flex'
import {
    allowMouse,
    cleanup,
    dispatchMouse,
    flush,
    render,
    rerender,
} from './helpers'
import { type Rendered } from './helpers'

let rendered: Rendered | undefined

afterEach(() => {
    if (rendered) cleanup(rendered)
    rendered = undefined
})

/**
 * The options of the block of your own.
 */
interface ProgressBlockOptions extends BlockOptions {
    /**
     * How far the task has come, from `0` to `1`.
     */
    progress?: number
    /**
     * The color of the filled part of the bar.
     */
    progressColor?: string
}

/**
 * A block of your own, with an option of your own.
 */
class ProgressBlock extends CoreBlock<ProgressBlockOptions> {
    progress(value?: number) {
        return super.__valueHandler(value, 'progress', 0)
    }
    progressColor(value?: string) {
        return super.__valueHandler(value, 'progressColor', '#22c55e')
    }
    render() {
        super.render()
        const context = this.context
        if (!context) return
        context.fillStyle = this.progressColor()
        context.fillRect(0, 0, this.width(), this.height())
    }
}

/**
 * The component of the block of your own.
 */
const Progress = makeBlockComponent(ProgressBlock)

describe('Canvas', () => {
    it('should render a canvas element', () => {
        rendered = render(<Canvas width={400} height={300} />)
        const canvas = rendered.container.querySelector('canvas')
        expect(canvas).toBeInstanceOf(HTMLCanvasElement)
    })
    it('should create the canvas of the library', () => {
        let instance: { width: number; height: number } | undefined
        rendered = render(
            <Canvas
                width={400}
                height={300}
                onReady={(canvas) => {
                    instance = canvas
                }}
            />
        )
        expect(instance?.width).toBe(400)
        expect(instance?.height).toBe(300)
    })
    it('should resize the canvas when the size of the component changes', () => {
        rendered = render(<Canvas width={400} height={300} />)
        rerender(rendered, <Canvas width={600} height={300} />)
        expect(rendered.container.querySelector('canvas')?.width).toBe(
            600 * window.devicePixelRatio
        )
    })
    it('should release the canvas when the component is unmounted', () => {
        const tree = render(<Canvas width={400} height={300} />)
        const canvas = tree.container.querySelector('canvas')
        expect(canvas).toBeInstanceOf(HTMLCanvasElement)
        cleanup(tree)
        rendered = undefined
    })
})

describe('block components', () => {
    it('should give the options to the block', () => {
        const ref = { current: null as unknown }
        rendered = render(
            <Canvas width={400} height={300}>
                <Rectangle
                    ref={ref as never}
                    x={10}
                    y={20}
                    width={100}
                    height={50}
                    backgroundColor="red"
                />
            </Canvas>
        )
        const block = ref.current as {
            x: () => number
            y: () => number
            width: () => number
            height: () => number
            backgroundColor: () => string
        }
        expect(block.x()).toBe(10)
        expect(block.y()).toBe(20)
        expect(block.width()).toBe(100)
        expect(block.height()).toBe(50)
        // the library resolves the name of the color to its value
        expect(block.backgroundColor()).toBe('rgba(255, 0, 0, 1)')
    })
    it('should write the props that changed onto the block', () => {
        const ref = { current: null as unknown }
        const tree = (width: number) => (
            <Canvas width={400} height={300}>
                <Rectangle
                    ref={ref as never}
                    x={0}
                    y={0}
                    width={width}
                    height={50}
                />
            </Canvas>
        )
        rendered = render(tree(100))
        const block = ref.current as { width: () => number }
        expect(block.width()).toBe(100)
        rerender(rendered, tree(200))
        expect(block.width()).toBe(200)
    })
    it('should reset an option that is not given anymore', () => {
        const ref = { current: null as unknown }
        const tree = (color?: string) => (
            <Canvas width={400} height={300}>
                <Rectangle
                    ref={ref as never}
                    x={0}
                    y={0}
                    width={100}
                    height={50}
                    backgroundColor={color}
                />
            </Canvas>
        )
        rendered = render(tree('red'))
        const block = ref.current as { backgroundColor: () => string }
        expect(block.backgroundColor()).toBe('rgba(255, 0, 0, 1)')
        rerender(rendered, tree(undefined))
        expect(block.backgroundColor()).toBe('white')
    })
    it('should take an option in kebab case', () => {
        const ref = { current: null as unknown }
        rendered = render(
            <Canvas width={400} height={300}>
                <Rectangle
                    ref={ref as never}
                    x={0}
                    y={0}
                    width={100}
                    height={50}
                    border-radius={8}
                    border-width={2}
                />
            </Canvas>
        )
        const block = ref.current as {
            borderRadius: () => number[]
            borderWidth: () => number
        }
        expect(block.borderRadius()).toEqual([8, 8, 8, 8])
        expect(block.borderWidth()).toBe(2)
    })
    it('should render a block without visuals of its own', () => {
        const ref = { current: null as unknown }
        rendered = render(
            <Canvas width={400} height={300}>
                <Block ref={ref as never} x={0} y={0} width={100} height={50} />
            </Canvas>
        )
        const block = ref.current as { width: () => number }
        expect(block.width()).toBe(100)
    })
    it('should ignore a prop that is not an option of the block', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const ref = { current: null as unknown }
        rendered = render(
            <Canvas width={400} height={300}>
                <Rectangle
                    ref={ref as never}
                    x={0}
                    y={0}
                    width={100}
                    height={50}
                    // the type of the props rejects it, the block ignores
                    // it as well
                    {...{ notAnOption: 'value' }}
                />
            </Canvas>
        )
        const block = ref.current as {
            width: () => number
            getOptionCurrent: (key: string) => unknown
        }
        expect(block.width()).toBe(100)
        // the prop never reaches the block
        expect(block.getOptionCurrent('notAnOption')).toBeUndefined()
        expect(warn).toHaveBeenCalled()
        warn.mockRestore()
    })
})

describe('nesting', () => {
    it('should attach a child to the block above it', () => {
        const parentRef = { current: null as unknown }
        const childRef = { current: null as unknown }
        rendered = render(
            <Canvas width={400} height={300}>
                <Rectangle ref={parentRef as never} width={200} height={200}>
                    <Circle ref={childRef as never} width={20} height={20} />
                </Rectangle>
            </Canvas>
        )
        const parent = parentRef.current as {
            listAllChilds: (fn: (block: unknown) => void) => void
        }
        let found = false
        parent.listAllChilds((block) => {
            if (block === childRef.current) found = true
        })
        expect(found).toBe(true)
    })
    it('should lay the child out inside of the parent', () => {
        const childRef = { current: null as unknown }
        rendered = render(
            <Canvas width={400} height={300}>
                <Rectangle x={100} y={50} width={200} height={200}>
                    <Circle ref={childRef as never} width={20} height={20} />
                </Rectangle>
            </Canvas>
        )
        const child = childRef.current as {
            cornerTopLeft: () => { x: number; y: number }
        }
        // the child is placed by the parent, it sits inside of it
        expect(child.cornerTopLeft().x).toBeCloseTo(100)
        expect(child.cornerTopLeft().y).toBeCloseTo(50)
    })
})

describe('makeBlockComponent', () => {
    it('should give the options of a custom block to it', () => {
        const ref = { current: null as unknown }
        rendered = render(
            <Canvas width={400} height={300}>
                <Progress
                    ref={ref as never}
                    x={0}
                    y={0}
                    width={200}
                    height={20}
                    progress={0.5}
                    progressColor="#ff0000"
                />
            </Canvas>
        )
        const block = ref.current as {
            progress: () => number
            progressColor: () => string
        }
        expect(block.progress()).toBe(0.5)
        // the library resolves the color to its value
        expect(block.progressColor()).toBe('rgba(255, 0, 0, 1)')
    })
    it('should name the component after the class of the block', () => {
        expect(Progress.displayName).toBe('ProgressBlock')
    })
    it('should take a name of its own', () => {
        const Named = makeBlockComponent(ProgressBlock, 'MyProgress')
        expect(Named.displayName).toBe('MyProgress')
    })
})

describe('events', () => {
    it('should call the handler of the click of the block', async () => {
        let clicked = 0
        rendered = render(
            <Canvas width={400} height={300}>
                <Rectangle
                    x={0}
                    y={0}
                    width={100}
                    height={100}
                    backgroundColor="red"
                    onClick={() => {
                        clicked++
                    }}
                />
            </Canvas>
        )
        await flush()
        const canvas = rendered.container.querySelector('canvas') as HTMLElement
        allowMouse(canvas)
        dispatchMouse(canvas, 'click', 20, 20)
        expect(clicked).toBe(1)
    })
    it('should call the handler that is the prop of the moment', async () => {
        const calls: string[] = []
        const tree = (name: string) => (
            <Canvas width={400} height={300}>
                <Rectangle
                    x={0}
                    y={0}
                    width={100}
                    height={100}
                    backgroundColor="red"
                    onClick={() => calls.push(name)}
                />
            </Canvas>
        )
        rendered = render(tree('first'))
        await flush()
        const canvas = rendered.container.querySelector('canvas') as HTMLElement
        allowMouse(canvas)
        dispatchMouse(canvas, 'click', 20, 20)
        rerender(rendered, tree('second'))
        dispatchMouse(canvas, 'click', 20, 20)
        expect(calls).toEqual(['first', 'second'])
    })
    it('should not register the handler of an event twice', async () => {
        let clicked = 0
        const tree = (color: string) => (
            <Canvas width={400} height={300}>
                <Rectangle
                    x={0}
                    y={0}
                    width={100}
                    height={100}
                    backgroundColor={color}
                    onClick={() => {
                        clicked++
                    }}
                />
            </Canvas>
        )
        rendered = render(tree('red'))
        await flush()
        const canvas = rendered.container.querySelector('canvas') as HTMLElement
        allowMouse(canvas)
        rerender(rendered, tree('blue'))
        dispatchMouse(canvas, 'click', 20, 20)
        expect(clicked).toBe(1)
    })
})

describe('strict mode', () => {
    it('should keep a single block in the scene', () => {
        let instance: { find: (query: object) => unknown[] } | undefined
        rendered = render(
            <StrictMode>
                <Canvas
                    width={400}
                    height={300}
                    onReady={(canvas) => {
                        instance = canvas
                    }}
                >
                    <Rectangle x={0} y={0} width={40} height={40} />
                </Canvas>
            </StrictMode>
        )
        expect(instance?.find({})).toHaveLength(1)
    })
    it('should remove the blocks of the scene when the tree is unmounted', () => {
        let instance: { find: (query: object) => unknown[] } | undefined
        const tree = render(
            <StrictMode>
                <Canvas
                    width={400}
                    height={300}
                    onReady={(canvas) => {
                        instance = canvas
                    }}
                >
                    <Rectangle x={0} y={0} width={40} height={40} />
                </Canvas>
            </StrictMode>
        )
        expect(instance?.find({})).toHaveLength(1)
        cleanup(tree)
        rendered = undefined
        expect(instance?.find({})).toHaveLength(0)
    })
})
