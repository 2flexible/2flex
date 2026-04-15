import { describe, it, expect, beforeEach, beforeAll } from 'vitest'
import {
    Canvas,
    Block,
    LayoutBlock,
    ShapeBlock,
    RectangleBlock,
    CircleBlock,
    TextBlock,
    LineBlock,
    ImageBlock,
    VideoBlock,
} from '@2flexible/2flex'

const canvasId = 'myCanvas'
const canvasWidth = 400
const canvasHeight = 600
const defaultOptions = {
    history: false,
    historySize: 40,
    zoom: 'point',
    zoomSpeed: 1.5,
    zoomInvSpeed: 1.8,
    moveSpeed: 20,
    keyboardMovement: false,
    mouseMovement: false,
    positionX: 200,
    positionY: 300,
    positionZ: 400,
    fps: 20,
}

const canvasStyling = {
    backgroundColor: 'red',
    width: '400px',
}

class MyCustomBlock extends Block {
    constructor(options: any) {
        super(options)
        this.hello()
    }
    hello() {
        return 'hello'
    }
}
const commonBlockConfig = { x: 0, y: 0, width: 20, height: 20 }

function constructDefaultBlocks() {
    const block = new Block(commonBlockConfig)
    const layoutBlock = new LayoutBlock(commonBlockConfig)
    const shapeBlock = new ShapeBlock(commonBlockConfig)
    const rectBlock = new RectangleBlock(commonBlockConfig)
    const circleBlock = new CircleBlock(commonBlockConfig)
    const lineBlock = new LineBlock(commonBlockConfig)
    const textBlock = new TextBlock('Hello World', commonBlockConfig)
    const imageBlock = new ImageBlock('', commonBlockConfig)

    const videoElement = document.createElement('video')
    const videoBlock = new VideoBlock(videoElement, commonBlockConfig)

    return [
        block,
        layoutBlock,
        shapeBlock,
        rectBlock,
        circleBlock,
        lineBlock,
        textBlock,
        imageBlock,
        videoBlock,
    ]
}

beforeEach(() => {
    const existing = document.getElementById(canvasId)
    existing?.remove()
})

// let canvas
// beforeAll(() => {
//     const existing = document.getElementById(canvasId)
//     existing?.remove()
//     canvas = new Canvas(canvasId, canvasWidth, canvasHeight)
// })
describe('Canvas', () => {
    describe('CanvasInitialize', () => {
        it('creates a Canvas instance with width and height', () => {
            const canvas = new Canvas(canvasId, canvasWidth, canvasHeight)
            expect(canvas).toBeDefined()
        })

        it('should create html canvas', () => {
            const canvas = new Canvas(canvasId, canvasWidth, canvasHeight)
            expect(canvas.canvas).toBeDefined()
        })

        it('should use already have html canvas element by id', () => {
            const canvas = document.createElement('canvas')
            canvas.id = canvasId
            canvas.style.width = canvasWidth + 'px'
            canvas.style.height = canvasHeight + 'px'
            canvas.width = canvasWidth
            canvas.height = canvasHeight
            canvas.tabIndex = 0

            document.querySelector('body')?.appendChild(canvas)
            const flexCanvas = new Canvas(canvasId, canvasWidth, canvasHeight)
            expect(flexCanvas.canvas).toEqual(canvas)
        })

        it('should set canvas default optons', () => {
            const canvas = new Canvas(
                canvasId,
                canvasWidth,
                canvasHeight,
                defaultOptions
            )
            expect(() => canvas).not.toThrow()
            expect(canvas).toBeDefined()
        })

        it('should set canvas position', () => {
            const positions = {
                x: 21,
                y: 212,
                z: 60,
            }
            const canvas = new Canvas(canvasId, canvasWidth, canvasHeight, {
                positionX: positions.x,
                positionY: positions.y,
                positionZ: positions.z,
            })
            expect(canvas.currentPosition.x).toBe(positions.x)
            expect(canvas.currentPosition.y).toBe(positions.y)
            expect(canvas.currentPosition.z).toBe(positions.z)
        })

        it('should set canvas style optons', () => {
            const canvas = new Canvas(
                canvasId,
                canvasWidth,
                canvasHeight,
                canvasStyling
            )
            expect(() => canvas).not.toThrow()
            expect(canvas).toBeDefined()
        })

        it('does not throw when constructed with zero dimensions', () => {
            expect(() => new Canvas(canvasId, 0, 0)).not.toThrow()
        })
    })

    describe('Dom Canvas', () => {
        it('should give dom context', () => {
            const canvas = new Canvas('canvasId', canvasWidth, canvasHeight)
            expect(canvas.context).toBeDefined()
            expect(canvas.context).not.toBeNull()
        })

        it('should change cursor position', () => {
            const canvas = new Canvas('canvasId', canvasWidth, canvasHeight)
            const cursor = 'pointer'
            canvas.changeCursor(cursor)
            expect(canvas.currentCursor).toBe(cursor)
        })
        it('should get current cursor position')
        it('should get boundings')
        it('should be focused')
    })

    describe('Rendering blocks', () => {
        it('should add a block to the canvas without throwing', () => {
            const canvas = new Canvas(canvasId, 800, 600)
            const block = new RectangleBlock(commonBlockConfig)
            expect(() => canvas.add(block)).not.toThrow()
        })

        it('should add all defined blocks to canvas without throwing', () => {
            const canvas = new Canvas(canvasId, 800, 600)
            const blocks = constructDefaultBlocks()
            expect(() => {
                canvas.add(...blocks)
            }).not.toThrow()
        })

        it('should remove block', () => {
            const canvas = new Canvas(canvasId, 800, 600)
            const block = new RectangleBlock(commonBlockConfig)
            canvas.add(block)
            expect(() => canvas.remove(block)).not.toThrow()
        })

        it('should find added block', () => {
            const canvas = new Canvas(canvasId, 800, 600)
            const block = new RectangleBlock(commonBlockConfig)
            canvas.add(block)
            expect(canvas.find({ nodeId: block.nodeId })).toStrictEqual([block])
        })

        it('should register custom block', () => {
            const canvas = new Canvas(canvasId, 800, 600)
            const customBlock = new MyCustomBlock({ hello: 'hi' })
            canvas.add(customBlock)

            expect(() => canvas.registerBlocks(customBlock)).not.toThrow()
            expect(canvas.find({ nodeId: customBlock.nodeId })).toStrictEqual([
                customBlock,
            ])
        })

        it('should check if block in bound')

        it('should invoke changes', () => {
            const canvas = new Canvas(canvasId, 800, 600)
            const blocks = constructDefaultBlocks()
            canvas.add(...blocks)
            expect(() => canvas.invokeChange()).not.toThrow()
        })
    })

    describe('Histoyr/Snapshot handling', () => {
        it('should take snapshot')
        it('should redo history')
        it('should undo history')
    })

    describe('Payload handling', () => {
        it('should export payload with defined blocks', () => {
            const canvas = new Canvas(canvasId, 800, 600)
            const blocks = constructDefaultBlocks()
            canvas.add(...blocks)
            const payload = canvas.export()
            expect(payload).toMatchSnapshot()
        })
        it('should load payload', () => {
            const canvas = new Canvas(canvasId, 800, 600)
            const blocks = constructDefaultBlocks()
            canvas.add(...blocks)
            const payload = canvas.export()
            expect(() => canvas.load(payload)).not.toThrow()
        })
        it('should export and import with custom block', () => {
            const canvas = new Canvas(canvasId, 800, 600)
            const customBlock = new MyCustomBlock({ hello: 'hi' })
            const blocks = constructDefaultBlocks()
            canvas.registerBlocks(customBlock)
            canvas.add(...blocks, customBlock)

            expect(() => canvas.export()).not.toThrow()

            let payload = canvas.export()
            expect(payload).toMatchSnapshot()
            expect(() => canvas.load(payload)).not.toThrow()
        })
    })

    describe('Handling animations', () => {
        it('should register animaton', () => {
            const canvas = new Canvas(canvasId, 800, 600)
            const block = new RectangleBlock(commonBlockConfig)
            canvas.add(block)
            expect(() => {
                if (block.nodeId)
                    canvas.registerAnimation(block.nodeId, () => {})
            }).not.toThrow()
        })
        it('should remove already registered animaton', () => {
            const canvas = new Canvas(canvasId, 800, 600)
            const block = new RectangleBlock(commonBlockConfig)
            canvas.add(block)
            if (block.nodeId !== undefined) {
                canvas.registerAnimation(block.nodeId, () => {})
                expect(() => {
                    if (block.nodeId !== undefined)
                        canvas.removeAnimation(block.nodeId)
                }).not.toThrow()
            }
        })
        it('should invoke animation', () => {
            const canvas = new Canvas(canvasId, 800, 600)
            const block = new RectangleBlock(commonBlockConfig)
            canvas.add(block)
            if (block.nodeId) canvas.registerAnimation(block.nodeId, () => {})
            expect(() => canvas.animationInvoker()).not.toThrow()
        })
    })

    describe('Handling events', () => {
        it('should register event', () => {
            const canvas = new Canvas(canvasId, 800, 600)
            expect(() => canvas.registerEvent('click', () => {})).not.toThrow()
        })
        it('should remove already registered event', () => {
            const canvas = new Canvas(canvasId, 800, 600)
            const dummyFunc = () => {}
            canvas.registerEvent('click', dummyFunc)
            expect(() => canvas.removeEvent('click', dummyFunc)).not.toThrow()
        })
        it.todo('should use only one event for every block', () => {
            const canvas = new Canvas(canvasId, 800, 600)
            canvas.registerEvent('click', () => {})
            canvas.registerEvent('click', () => {})
            canvas.registerEvent('click', () => {})
        })
        it('should higher z index block work', () => {
            const canvas = new Canvas(canvasId, 800, 600)
            const block1 = new RectangleBlock({
                ...commonBlockConfig,
                zIndex: 1,
            })
            const block2 = new RectangleBlock({
                ...commonBlockConfig,
                zIndex: 2,
            })
            canvas.add(block1, block2)
            expect(() => {
                canvas.registerZIndex({ in: block1.nodeId })
                canvas.registerZIndex({ in: block2.nodeId })
            }).not.toThrow()

            if (block1.nodeId)
                expect(canvas.whoIsTheFirst(block1.nodeId)).toBeFalsy()
            if (block2.nodeId)
                expect(canvas.whoIsTheFirst(block2.nodeId)).toBeTruthy()
        })
    })
    describe('Transforamtions', () => {
        it('should move with keyboard')
        it('should move with handmove')
        // ...
    })
})
