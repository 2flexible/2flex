import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Block, Canvas } from '@2flexible/2flex'
import { SELECTABLE_RUNNING_EVENT } from '../../const'
import { defaultBlocks } from '../../defaultBlocks'
import { flush, removeCanvasElements } from './helpers'

let canvas: Canvas
let block: Block

// the wheel is the only way the canvas view is moved and zoomed, so the
// events are dispatched on the real element instead of calling handlers
const wheel = (target: Canvas, init: WheelEventInit) =>
    target.canvas.dispatchEvent(
        new WheelEvent('wheel', {
            bubbles: true,
            cancelable: true,
            ...init,
        })
    )

const keydown = (target: Window | HTMLElement, init: KeyboardEventInit) =>
    target.dispatchEvent(
        new KeyboardEvent('keydown', { bubbles: true, ...init })
    )

const keyup = (target: Window | HTMLElement, init: KeyboardEventInit) =>
    target.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, ...init }))

// the space key is what turns the mouse into a hand move, it is watched on
// the window instead of the canvas and stays down until it is released
const grabCanvas = (target: Window | HTMLElement) =>
    keydown(target, { key: ' ', code: 'Space' })

const releaseCanvas = (target: Window | HTMLElement) =>
    keyup(target, { key: ' ', code: 'Space' })

// a block which paints itself, so the canvas pixels can be asserted on
const filledBlock = (block: Block) => {
    block.set({
        onRender: () => {
            const context = block.context
            if (!context) return
            context.beginPath()
            context.fillStyle = 'red'
            context.fillRect(
                block.x(),
                block.y(),
                block.width(),
                block.height()
            )
        },
    })
}

const pixelAt = (target: Canvas, x: number, y: number) =>
    Array.from(target.context!.getImageData(x, y, 1, 1).data)

describe('Canvas', () => {
    afterEach(() => {
        canvas.isFocused = false
        removeCanvasElements()
    })

    describe('constructor', () => {
        it('should expose the given id and size', () => {
            canvas = new Canvas('myCanvas', 400, 500)
            expect(canvas.canvasId).toBe('myCanvas')
            expect(canvas.width).toBe(400)
            expect(canvas.height).toBe(500)
        })
        it('should append a focusable canvas element to the document', () => {
            canvas = new Canvas('myCanvas', 400, 500)
            const element = canvas.canvas
            expect(element.id).toBe('myCanvas')
            // a tab index is needed to receive the keyboard events
            expect(element.tabIndex).toBe(0)
            expect(document.body.contains(element)).toBe(true)
        })
        it('should size the element by css and scale the buffer up', () => {
            canvas = new Canvas('myCanvas', 400, 500)
            const element = canvas.canvas
            expect(element.style.width).toBe('400px')
            expect(element.style.height).toBe('500px')
            // the backing store is scaled by the device pixel ratio to stay sharp
            expect(element.width).toBe(400 * window.devicePixelRatio)
            expect(element.height).toBe(500 * window.devicePixelRatio)
        })
        it('should reuse an existing element with the same id', () => {
            const existing = document.createElement('canvas')
            existing.id = 'myCanvas'
            document.body.appendChild(existing)
            canvas = new Canvas('myCanvas', 400, 500)
            expect(canvas.canvas).toBe(existing)
        })
        it('should start with an identity view', () => {
            canvas = new Canvas('myCanvas', 400, 500)
            expect(canvas.view).toEqual({ tx: 0, ty: 0, scale: 1 })
            expect(canvas.currentPosition).toEqual({ x: 0, y: 0, z: 1 })
        })
        it('should apply the initial position options to the view', () => {
            canvas = new Canvas('myCanvas', 400, 500, {
                positionX: 20,
                positionY: 30,
                positionZ: 2,
            })
            expect(canvas.view).toEqual({ tx: 20, ty: 30, scale: 2 })
        })
        it('should apply style options to the element', () => {
            canvas = new Canvas('myCanvas', 400, 500, {
                backgroundColor: 'red',
            })
            expect(canvas.canvas.style.backgroundColor).toBe('red')
            expect(canvas.options).toEqual({ backgroundColor: 'red' })
        })
        it('should ignore options which are not canvas options or styles', () => {
            canvas = new Canvas('myCanvas', 400, 500, {
                moveSpeed: 30,
                backgroundColor: 'red',
            })
            expect(canvas.canvas.style.backgroundColor).toBe('red')
        })
    })

    describe('getters', () => {
        beforeEach(() => {
            canvas = new Canvas('myCanvas', 400, 500)
        })
        it('should return the canvas element', () => {
            expect(canvas.canvas).toBe(document.getElementById('myCanvas'))
            expect(canvas.canvas.tagName).toBe('CANVAS')
        })
        it('should return a 2d context and keep it', () => {
            const context = canvas.context
            expect(context).toBeInstanceOf(CanvasRenderingContext2D)
            expect(canvas.context).toBe(context)
        })
        it('should return the bounding client rect and keep it', () => {
            const rect = canvas.boundingClientRect
            expect(rect.width).toBe(400)
            expect(rect.height).toBe(500)
            expect(canvas.boundingClientRect).toBe(rect)
        })
        it('should fall back to auto while no cursor is set', () => {
            expect(canvas.currentCursor).toBe('auto')
        })
        it('should report the view as the current position', async () => {
            canvas.isFocused = true
            wheel(canvas, { deltaY: -100 })
            expect(canvas.currentPosition).toEqual({ x: 0, y: 100, z: 1 })
        })
        it('should convert page coordinates into world coordinates', () => {
            const rect = canvas.boundingClientRect
            const event = new MouseEvent('mousemove', {
                clientX: rect.left + 100,
                clientY: rect.top + 50,
            })
            expect(canvas.getCursorPosition(event)).toEqual({ x: 100, y: 50 })
        })
        it('should account for the view while converting coordinates', () => {
            canvas = new Canvas('myCanvas', 400, 500, {
                positionX: 40,
                positionY: 10,
                positionZ: 2,
            })
            const rect = canvas.boundingClientRect
            const event = new MouseEvent('mousemove', {
                clientX: rect.left + 140,
                clientY: rect.top + 110,
            })
            expect(canvas.getCursorPosition(event)).toEqual({ x: 50, y: 50 })
        })
    })

    describe('blocks', () => {
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({ x: 10, y: 20, width: 100, height: 100 })
            canvas.add(block)
            await flush()
        })
        it('should attach the block to the canvas', () => {
            expect(block.canvas).toBe(canvas)
        })
        it('should give the block a node id', () => {
            expect(block.nodeId).toBeTypeOf('number')
        })
        it('should build up the z index of blocks without one', async () => {
            const second = new Block({ width: 10, height: 10 })
            canvas.add(second)
            await flush()
            expect(block.zIndex()).toBe(0)
            // the counter of the canvas restarts on every head refresh, so a
            // block which is added later runs into the z index of the previous
            // one instead of being stacked on top of it
            expect(second.zIndex()).toBe(0)
        })
        it.todo(
            'should stack a block which is added later above the previous one'
        )
        it('should keep the given z index of a block', async () => {
            const upper = new Block({ width: 10, height: 10, zIndex: 7 })
            canvas.add(upper)
            await flush()
            expect(upper.zIndex()).toBe(7)
        })
        it('should find a block by its node id', () => {
            const found = canvas.find({ nodeId: block.nodeId })
            expect(found).toHaveLength(1)
            expect(found[0]).toBe(block)
        })
        it('should find a block by its options', async () => {
            const target = new Block({ width: 10, height: 10, name: 'target' })
            canvas.add(target)
            await flush()
            const found = canvas.find({ name: 'target' })
            expect(found).toHaveLength(1)
            expect(found[0]).toBe(target)
            expect(canvas.find({ name: 'missing' })).toHaveLength(0)
        })
        it('should find a block by several options at once', async () => {
            const target = new Block({
                width: 10,
                height: 10,
                name: 'a',
                zIndex: 5,
            })
            canvas.add(target)
            await flush()
            expect(canvas.find({ name: 'a', zIndex: 5 })).toHaveLength(1)
            expect(canvas.find({ name: 'a', zIndex: 6 })).toHaveLength(0)
        })
        it('should find child blocks of an added block', async () => {
            const child = new Block({ width: 10, height: 10 })
            block.addChild(child)
            await flush()
            const found = canvas.find({ nodeId: child.nodeId })
            expect(found).toHaveLength(1)
            expect(found[0]).toBe(child)
        })
        it('should remove a block from the scene', async () => {
            canvas.remove(block)
            await flush()
            expect(canvas.find({ nodeId: block.nodeId })).toHaveLength(0)
        })
    })

    describe('export and load', () => {
        let parent: Block
        let child: Block

        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            parent = new Block({ x: 10, y: 20, width: 200, height: 200 })
            child = new Block({ x: 5, y: 5, width: 50, height: 50 })
            parent.addChild(child)
            canvas.add(parent)
            await flush()
        })
        it('should export the canvas options', () => {
            const payload = JSON.parse(canvas.export())
            expect(payload.canvas.canvasId).toBe('myCanvas')
            expect(payload.canvas.width).toBe(400)
            expect(payload.canvas.height).toBe(500)
        })
        it('should export the block options as a plain object', () => {
            const payload = JSON.parse(canvas.export())
            expect(payload.blocks[0].options.x).toBe(10)
            expect(payload.blocks[0].options.y).toBe(20)
            expect(payload.blocks[0].options.width).toBe(200)
        })
        it('should export only the root blocks and nest the childs', () => {
            const payload = JSON.parse(canvas.export())
            expect(payload.blocks).toHaveLength(1)
            expect(payload.blocks[0].nodeId).toBe(parent.nodeId)
            expect(payload.blocks[0].name).toBe('Block')
            expect(payload.blocks[0].childs).toHaveLength(1)
            expect(payload.blocks[0].childs[0].nodeId).toBe(child.nodeId)
        })
        it('should reconstruct the blocks on another canvas', async () => {
            const target = new Canvas('otherCanvas', 400, 500)
            target.load(canvas.export())
            await flush()

            const loadedParent = target.find({ nodeId: parent.nodeId })
            const loadedChild = target.find({ nodeId: child.nodeId })
            expect(loadedParent).toHaveLength(1)
            expect(loadedChild).toHaveLength(1)
            expect(loadedParent[0]).not.toBe(parent)
            expect(loadedParent[0]).toBeInstanceOf(Block)
            expect(loadedParent[0].canvas).toBe(target)
        })
        it('should restore the block options and the child tree', async () => {
            const target = new Canvas('otherCanvas', 400, 500)
            target.load(canvas.export())
            await flush()

            const loadedParent = target.find({ nodeId: parent.nodeId })[0]
            const loadedChild = target.find({ nodeId: child.nodeId })[0]
            expect(loadedParent.x()).toBe(10)
            expect(loadedParent.width()).toBe(200)
            expect([...loadedParent.childNodes]).toEqual([loadedChild])
        })
        it('should reuse the blocks which are already in the scene', async () => {
            canvas.load(canvas.export())
            await flush()

            const found = canvas.find({ nodeId: block?.nodeId })
            const loadedParent = canvas.find({ nodeId: parent.nodeId })
            expect(loadedParent).toHaveLength(1)
            expect(loadedParent[0]).toBe(parent)
            expect(loadedParent[0].x()).toBe(10)
            expect(found).toBeDefined()
        })
        it('should skip blocks of an unregistered name', async () => {
            const payload = JSON.stringify({
                canvas: { canvasId: 'myCanvas', width: 400, height: 500 },
                blocks: [
                    {
                        nodeId: 7,
                        name: 'NotRegistered',
                        options: {},
                        childs: [],
                    },
                ],
            })
            canvas.load(payload)
            await flush()

            expect(canvas.find({ nodeId: 7 })).toHaveLength(0)
        })
        it('should construct registered custom block classes', async () => {
            class MyBlock extends Block {
                constructor(options: any) {
                    super(options)
                }
            }
            canvas.registerBlocks(MyBlock)
            expect(defaultBlocks).toContain(MyBlock)

            const custom = new MyBlock({ x: 5, y: 5, width: 20, height: 20 })
            canvas.add(custom)
            await flush()

            const target = new Canvas('otherCanvas', 400, 500)
            target.load(canvas.export())
            await flush()

            const found = target.find({ nodeId: custom.nodeId })
            expect(found).toHaveLength(1)
            expect(found[0]).toBeInstanceOf(MyBlock)
            expect(found[0].x()).toBe(5)
        })
        it('should take the canvas size and options from the payload', async () => {
            const target = new Canvas('otherCanvas', 400, 500)
            // the element of the source canvas has to go, otherwise the target
            // adopts it through its id and keeps its old size
            canvas.canvas.remove()
            target.load(
                JSON.stringify({
                    canvas: {
                        canvasId: 'otherCanvas',
                        width: 300,
                        height: 200,
                        options: { positionX: 25, backgroundColor: 'red' },
                    },
                    blocks: [],
                })
            )
            await flush()

            expect(target.width).toBe(300)
            expect(target.height).toBe(200)
            expect(target.view).toEqual({ tx: 25, ty: 0, scale: 1 })
            expect(target.canvas.style.backgroundColor).toBe('red')
            expect(target.canvas.width).toBe(300 * window.devicePixelRatio)
            expect(target.canvas.style.width).toBe('300px')
        })
    })

    describe('history', () => {
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({ x: 0, y: 0, width: 100, height: 100 })
            canvas.add(block)
            await flush()
            block.set({ x: 100 })
            await flush()
        })
        it('should undo a change of a block', () => {
            canvas.undo()
            expect(block.x()).toBe(0)
        })
        it('should redo an undone change', () => {
            canvas.undo()
            canvas.redo()
            expect(block.x()).toBe(100)
        })
        it('should undo while ctrl and z are pressed', () => {
            canvas.isFocused = true
            keydown(window, { key: 'z', ctrlKey: true })
            expect(block.x()).toBe(0)
        })
        it('should redo while ctrl and a capital z are pressed', () => {
            canvas.isFocused = true
            keydown(window, { key: 'Z', ctrlKey: true })
            expect(block.x()).toBe(100)
        })
        it('should not undo while the canvas is not focused', () => {
            keydown(window, { key: 'z', ctrlKey: true })
            expect(block.x()).toBe(100)
        })
        it('should not record anything while history is off', async () => {
            const target = new Canvas('otherCanvas', 400, 500, {
                history: false,
            })
            const other = new Block({ x: 0, y: 0, width: 100, height: 100 })
            target.add(other)
            await flush()
            other.set({ x: 100 })
            await flush()

            target.undo()
            expect(other.x()).toBe(100)
            target.redo()
            expect(other.x()).toBe(100)
        })
    })

    describe('dom events', () => {
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({ x: 0, y: 0, width: 100, height: 100 })
            canvas.add(block)
            await flush()
        })
        const click = () =>
            canvas.canvas.dispatchEvent(
                new MouseEvent('click', { bubbles: true })
            )

        it('should invoke a demanded event', async () => {
            const onClick = vi.fn()
            canvas.demandAddEvent(block, 'click', onClick)
            await flush()
            click()
            expect(onClick).toHaveBeenCalledTimes(1)
        })
        it('should invoke every demanded event of a type', async () => {
            const calls: string[] = []
            canvas.demandAddEvent(block, 'click', () => calls.push('first'))
            canvas.demandAddEvent(block, 'click', () => calls.push('second'))
            await flush()
            click()
            expect(calls).toEqual(['first', 'second'])
        })
        it('should stop invoking a removed event', async () => {
            const onClick = vi.fn()
            const other = vi.fn()
            canvas.demandAddEvent(block, 'click', onClick)
            canvas.demandAddEvent(block, 'click', other)
            await flush()
            canvas.demandRemoveEvent('click', onClick)
            await flush()

            click()
            expect(onClick).not.toHaveBeenCalled()
            expect(other).toHaveBeenCalledTimes(1)
        })
        it('should invoke the events from the highest z index down', async () => {
            const calls: string[] = []
            const lower = new Block({
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                zIndex: 1,
            })
            const upper = new Block({
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                zIndex: 5,
            })
            canvas.add(lower, upper)
            await flush()
            canvas.demandAddEvent(lower, 'click', () => calls.push('lower'))
            canvas.demandAddEvent(upper, 'click', () => calls.push('upper'))
            await flush()
            click()
            expect(calls).toEqual(['upper', 'lower'])

            // the head has to be refreshed to sort them again
            upper.set({ zIndex: 0 })
            canvas.demandRefreshHead()
            await flush()
            calls.length = 0
            click()
            expect(calls).toEqual(['lower', 'upper'])
        })
    })

    describe('animations', () => {
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({ x: 0, y: 0, width: 100, height: 100 })
            canvas.add(block)
            await flush()
        })
        it('should invoke a demanded animation on every frame', async () => {
            const animator = vi.fn()
            canvas.demandAddAnimation('my-animation', animator)
            await flush(3)
            expect(animator.mock.calls.length).toBeGreaterThanOrEqual(1)
        })
        it('should pass the frame timestamp to the animation', async () => {
            const timestamps: number[] = []
            canvas.demandAddAnimation('timestamped', (timestamp: number) =>
                timestamps.push(timestamp)
            )
            await flush(2)
            expect(timestamps.length).toBeGreaterThanOrEqual(1)
            expect(typeof timestamps[0]).toBe('number')
        })
        it('should stop invoking a removed animation', async () => {
            const animator = vi.fn()
            canvas.demandAddAnimation('my-animation', animator)
            await flush(2)
            canvas.demandRemoveAnimation('my-animation')
            await flush()

            const callsBefore = animator.mock.calls.length
            await flush(3)
            expect(animator.mock.calls.length).toBe(callsBefore)
        })
    })

    describe('cursors', () => {
        beforeEach(() => {
            canvas = new Canvas('myCanvas', 400, 500)
        })
        it('should change and reset the cursor', () => {
            canvas.changeCursor('pointer')
            expect(canvas.currentCursor).toBe('pointer')
            canvas.resetCursor()
            expect(canvas.currentCursor).toBe('auto')
        })
        it('should apply the cursor of a registered node', () => {
            // a cursor is only resolved for a node with a known z index
            canvas.registerZIndex(1, 3)
            canvas.registerCursor(1, 'pointer')
            expect(canvas.currentCursor).toBe('pointer')
        })
        it('should prefer the cursor of the highest z index', () => {
            canvas.registerZIndex(1, 3)
            canvas.registerZIndex(2, 7)
            canvas.registerCursor(1, 'pointer')
            canvas.registerCursor(2, 'crosshair')
            expect(canvas.currentCursor).toBe('crosshair')
        })
        it('should fall back to the cursor below on unregister', () => {
            canvas.registerZIndex(1, 3)
            canvas.registerZIndex(2, 7)
            canvas.registerCursor(1, 'pointer')
            canvas.registerCursor(2, 'crosshair')

            canvas.unregisterCursor(2, 'crosshair')
            expect(canvas.currentCursor).toBe('pointer')
        })
        it('should reset the cursor once the last one is unregistered', () => {
            canvas.registerCursor(1, 'pointer')
            canvas.unregisterCursor(1, 'pointer')
            expect(canvas.currentCursor).toBe('auto')
        })
        it('should release the canvas cursor to auto without registrations', () => {
            canvas.changeCursor('grabbing')
            canvas.__releaseCanvasCursor()
            expect(canvas.currentCursor).toBe('auto')
        })
        it('should resolve the registered cursor on release', () => {
            canvas.registerZIndex(1, 3)
            canvas.registerCursor(1, 'pointer')
            canvas.changeCursor('grabbing')
            canvas.__releaseCanvasCursor()
            expect(canvas.currentCursor).toBe('pointer')
        })
    })

    describe('z index registration', () => {
        beforeEach(() => {
            canvas = new Canvas('myCanvas', 400, 500)
        })
        it('should report the highest z index as the first one', () => {
            canvas.registerZIndex(1, 3)
            canvas.registerZIndex(2, 7)
            expect(canvas.whoIsTheFirst(2)).toBe(true)
            expect(canvas.whoIsTheFirst(1)).toBe(false)
        })
        it('should report an unknown node as not first', () => {
            canvas.registerZIndex(1, 3)
            expect(canvas.whoIsTheFirst(99)).toBe(false)
        })
        it('should hand the first place over when the top unregisters', () => {
            canvas.registerZIndex(1, 3)
            canvas.registerZIndex(2, 7)
            canvas.unregisterZIndex(2)
            expect(canvas.whoIsTheFirst(1)).toBe(true)
        })
        it('should ignore the unregister of an unknown node', () => {
            canvas.registerZIndex(1, 3)
            canvas.unregisterZIndex(99)
            expect(canvas.whoIsTheFirst(1)).toBe(true)
        })
        it('should register the z index of a block which takes the pointer', async () => {
            block = new Block({
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                selectable: true,
            })
            canvas.add(block)
            canvas.canvas.dispatchEvent(new MouseEvent('mouseenter'))
            await flush()

            const rect = canvas.canvas.getBoundingClientRect()
            canvas.canvas.dispatchEvent(
                new MouseEvent('mousedown', {
                    clientX: rect.left + 10,
                    clientY: rect.top + 10,
                    button: 0,
                    buttons: 1,
                    bubbles: true,
                    cancelable: true,
                })
            )
            expect(canvas.whoIsTheFirst(block.nodeId!)).toBe(true)

            // releasing the pointer gives the registration up again
            canvas.canvas.dispatchEvent(
                new MouseEvent('mouseup', { bubbles: true })
            )
            expect(canvas.whoIsTheFirst(block.nodeId!)).toBe(false)
        })
    })

    describe('wheel movement', () => {
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            canvas.isFocused = true
            await flush()
        })
        it('should move the view down while the wheel turns backwards', () => {
            wheel(canvas, { deltaY: 100 })
            expect(canvas.view).toEqual({ tx: 0, ty: -100, scale: 1 })
        })
        it('should move the view up while the wheel turns forwards', () => {
            wheel(canvas, { deltaY: -100 })
            expect(canvas.view).toEqual({ tx: 0, ty: 100, scale: 1 })
        })
        it('should move the view sideways while shift is held', () => {
            wheel(canvas, { deltaY: -100, shiftKey: true })
            expect(canvas.view).toEqual({ tx: 100, ty: 0, scale: 1 })
        })
        it('should move by the given move speed', async () => {
            canvas = new Canvas('otherCanvas', 400, 500, { moveSpeed: 30 })
            canvas.isFocused = true
            await flush()
            wheel(canvas, { deltaY: -100 })
            expect(canvas.view.ty).toBe(30)
        })
        it('should not move while the canvas is not focused', () => {
            canvas.isFocused = false
            wheel(canvas, { deltaY: 100 })
            expect(canvas.view).toEqual({ tx: 0, ty: 0, scale: 1 })
        })
        it('should not move while ctrl is held', () => {
            // ctrl belongs to the zoom, which does move the view, but not by
            // the move speed
            wheel(canvas, { deltaY: 100, ctrlKey: true })
            expect(canvas.view.scale).toBe(0.8)
        })
        it('should not move while keyboard movement is off', async () => {
            canvas = new Canvas('otherCanvas', 400, 500, {
                keyboardMovement: false,
            })
            canvas.isFocused = true
            await flush()
            wheel(canvas, { deltaY: 100 })
            expect(canvas.view).toEqual({ tx: 0, ty: 0, scale: 1 })
        })
    })

    describe('zoom', () => {
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            canvas.isFocused = true
            await flush()
        })
        it('should zoom in around the center by default', () => {
            wheel(canvas, { deltaY: -100, ctrlKey: true })
            // the canvas center stays in place while scaling
            expect(canvas.view.scale).toBe(1.2)
            expect(canvas.view.tx).toBe(200 - 200 * 1.2)
            expect(canvas.view.ty).toBe(250 - 250 * 1.2)
        })
        it('should zoom out by the inverse speed', () => {
            wheel(canvas, { deltaY: 100, ctrlKey: true })
            expect(canvas.view.scale).toBe(0.8)
            expect(canvas.view.tx).toBe(200 - 200 * 0.8)
            expect(canvas.view.ty).toBe(250 - 250 * 0.8)
        })
        it('should zoom by the given zoom speed', async () => {
            canvas = new Canvas('otherCanvas', 400, 500, { zoomSpeed: 3 })
            canvas.isFocused = true
            await flush()
            wheel(canvas, { deltaY: -100, ctrlKey: true })
            expect(canvas.view.scale).toBe(3)
            expect(canvas.view.tx).toBe(200 - 200 * 3)
        })
        it('should not zoom while the canvas is not focused', () => {
            canvas.isFocused = false
            wheel(canvas, { deltaY: -100, ctrlKey: true })
            expect(canvas.view.scale).toBe(1)
        })
        it('should zoom around the pointer while zoomType is point', async () => {
            canvas = new Canvas('otherCanvas', 400, 500, { zoomType: 'point' })
            canvas.isFocused = true
            await flush()
            const rect = canvas.boundingClientRect
            wheel(canvas, {
                deltaY: -100,
                ctrlKey: true,
                clientX: rect.left + 100,
                clientY: rect.top + 50,
            })
            // the pointer stays in place instead of the center
            expect(canvas.view.scale).toBe(1.2)
            expect(canvas.view.tx).toBe(100 - 100 * 1.2)
            expect(canvas.view.ty).toBe(50 - 50 * 1.2)
        })
        it('should zoom around the center while zoomType is center', () => {
            wheel(canvas, {
                deltaY: -100,
                ctrlKey: true,
                clientX: 10,
                clientY: 10,
            })
            expect(canvas.view.tx).toBe(200 - 200 * 1.2)
            expect(canvas.view.ty).toBe(250 - 250 * 1.2)
        })
    })

    describe('hand movement', () => {
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            canvas.isFocused = true
            await flush()
        })
        const mouse = (type: string, x: number, y: number, buttons = 1) => {
            const rect = canvas.canvas.getBoundingClientRect()
            canvas.canvas.dispatchEvent(
                new MouseEvent(type, {
                    clientX: rect.left + x,
                    clientY: rect.top + y,
                    button: 0,
                    buttons,
                    bubbles: true,
                    cancelable: true,
                })
            )
        }

        it('should show a grab cursor while space is held', () => {
            keydown(window, { key: ' ', code: 'Space' })
            expect(canvas.currentCursor).toBe('grab')
        })
        it('should show a grabbing cursor while dragging', () => {
            grabCanvas(window)
            mouse('mousedown', 10, 10)
            expect(canvas.currentCursor).toBe('grabbing')
            expect(canvas.isMouseEventAllowed).toBe(false)
        })
        it('should move the view by the mouse delta', () => {
            grabCanvas(window)
            mouse('mousedown', 10, 10)
            mouse('mousemove', 40, 60)
            expect(canvas.view).toEqual({ tx: 30, ty: 50, scale: 1 })
        })
        it('should allow the mouse again after the drag', () => {
            grabCanvas(window)
            mouse('mousedown', 10, 10)
            mouse('mousemove', 40, 60)
            mouse('mouseup', 40, 60, 0)
            expect(canvas.isMouseEventAllowed).toBe(true)
        })
        it('should reset the cursor once space is released', () => {
            grabCanvas(window)
            mouse('mousedown', 10, 10)
            mouse('mouseup', 10, 10, 0)
            releaseCanvas(window)
            expect(canvas.currentCursor).toBe('auto')
        })
        it('should not move the view without space', () => {
            mouse('mousedown', 10, 10)
            mouse('mousemove', 40, 60)
            expect(canvas.view).toEqual({ tx: 0, ty: 0, scale: 1 })
        })
        it('should not move the view while the canvas is not focused', () => {
            grabCanvas(window)
            canvas.isFocused = false
            mouse('mousedown', 10, 10)
            mouse('mousemove', 40, 60)
            expect(canvas.view).toEqual({ tx: 0, ty: 0, scale: 1 })
        })
        it('should not grab while mouse movement is off', async () => {
            canvas = new Canvas('otherCanvas', 400, 500, {
                mouseMovement: false,
            })
            canvas.isFocused = true
            await flush()
            keydown(window, { key: ' ', code: 'Space' })
            expect(canvas.currentCursor).toBe('auto')
        })
    })

    describe('focus and mouse tracking', () => {
        beforeEach(() => {
            canvas = new Canvas('myCanvas', 400, 500)
        })
        it('should track the focus of the element', () => {
            canvas.canvas.dispatchEvent(new FocusEvent('focusin'))
            expect(canvas.isFocused).toBe(true)
            canvas.canvas.dispatchEvent(new FocusEvent('focusout'))
            expect(canvas.isFocused).toBe(false)
        })
        it('should track the pointer over the element', () => {
            canvas.canvas.dispatchEvent(new MouseEvent('mouseleave'))
            expect(canvas.isMouseEventAllowed).toBe(false)
            canvas.canvas.dispatchEvent(new MouseEvent('mouseenter'))
            expect(canvas.isMouseEventAllowed).toBe(true)
        })
        it('should disable the running events of the blocks on mouseleave', async () => {
            block = new Block({
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                selectable: true,
            })
            canvas.add(block)
            canvas.canvas.dispatchEvent(new MouseEvent('mouseenter'))
            await flush()

            const rect = canvas.canvas.getBoundingClientRect()
            canvas.canvas.dispatchEvent(
                new MouseEvent('mousedown', {
                    clientX: rect.left + 10,
                    clientY: rect.top + 10,
                    button: 0,
                    buttons: 1,
                    bubbles: true,
                    cancelable: true,
                })
            )
            expect(block.__isRunningEventActive(SELECTABLE_RUNNING_EVENT)).toBe(
                true
            )

            canvas.canvas.dispatchEvent(new MouseEvent('mouseleave'))
            expect(block.__isRunningEventActive(SELECTABLE_RUNNING_EVENT)).toBe(
                false
            )
        })
        it('should forget the registered cursors on mouseleave', () => {
            canvas.registerZIndex(1, 3)
            canvas.registerCursor(1, 'pointer')
            canvas.canvas.dispatchEvent(new MouseEvent('mouseleave'))
            // nothing is registered anymore, so the canvas cursor is given up
            canvas.__releaseCanvasCursor()
            expect(canvas.currentCursor).toBe('auto')
        })
    })

    describe('rendering', () => {
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({ x: 10, y: 10, width: 100, height: 100 })
            filledBlock(block)
            canvas.add(block)
            await flush(4)
        })
        it('should paint a block onto the element', () => {
            expect(pixelAt(canvas, 20, 20)).toEqual([255, 0, 0, 255])
        })
        it('should leave the area around a block empty', () => {
            expect(pixelAt(canvas, 5, 5)).toEqual([0, 0, 0, 0])
        })
        it('should clear the element', () => {
            canvas.clearRect()
            expect(pixelAt(canvas, 20, 20)).toEqual([0, 0, 0, 0])
        })
        it('should move the painted block along with the view', async () => {
            canvas.isFocused = true
            wheel(canvas, { deltaY: -100, shiftKey: true })
            await flush(3)
            expect(pixelAt(canvas, 120, 20)).toEqual([255, 0, 0, 255])
            expect(pixelAt(canvas, 220, 20)).toEqual([0, 0, 0, 0])
        })
        it('should render a demanded block again', async () => {
            const onRender = vi.fn()
            block.set({ onRender })
            await flush(2)
            const callsWhileIdle = onRender.mock.calls.length
            await flush(2)
            expect(onRender.mock.calls.length).toBe(callsWhileIdle)

            canvas.demandInvoke(block)
            await flush(2)
            expect(onRender.mock.calls.length).toBeGreaterThan(callsWhileIdle)
        })
        it('should stop rendering a removed block', async () => {
            const onRender = vi.fn()
            block.set({ onRender })
            await flush(2)

            canvas.demandRemoveBlock(block)
            await flush(2)
            const callsAfterRemove = onRender.mock.calls.length
            await flush(3)
            expect(onRender.mock.calls.length).toBe(callsAfterRemove)
            expect(pixelAt(canvas, 20, 20)).toEqual([0, 0, 0, 0])
        })
    })
})
