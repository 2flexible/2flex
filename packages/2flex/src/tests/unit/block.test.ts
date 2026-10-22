import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { Block, Canvas } from '@2flexible/2flex'
import { rgbaToArray } from '../../Utils'
import {
    OVERFLOW_X_SCROLL_BAR_BLOCK_NAME,
    OVERFLOW_Y_SCROLL_BAR_BLOCK_NAME,
} from '../../const'

let block: Block
let childBlock: Block
let canvas: Canvas

// the canvas applies every queued change (block init, option recalculation,
// dom event registration, drawing) inside its render loop which is driven by
// requestAnimationFrame, so tests have to let frames pass before asserting
const flush = async (frames = 2) => {
    for (let i = 0; i < frames; i++)
        await new Promise<void>((resolve) =>
            requestAnimationFrame(() => resolve())
        )
}

// mouse events are only dispatched to blocks while the pointer is considered
// inside the canvas, which is tracked by a real mouseenter event
const allowMouse = (target: Canvas) =>
    target.canvas.dispatchEvent(new MouseEvent('mouseenter'))

// animations are driven by the render loop in real time, so finishing ones
// have to be waited for instead of being flushed a fixed amount of frames
const waitFor = async (predicate: () => boolean, timeout = 3000) => {
    const start = performance.now()
    while (!predicate()) {
        if (performance.now() - start > timeout) return false
        await new Promise((resolve) => setTimeout(resolve, 16))
    }
    return true
}

const dispatchMouse = (
    element: HTMLElement,
    type: string,
    x: number,
    y: number,
    buttons = 0
) => {
    const rect = element.getBoundingClientRect()
    element.dispatchEvent(
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

// makes a block paint its own box, so what ends up on the canvas can be
// asserted by screenshot
const drawFilledBlock = (block: Block) => {
    block.set({
        onRender: () => {
            const context = block.context
            if (!context) return
            context.beginPath()
            context.fillStyle = 'red'
            context.fillRect(block.x(), block.y(), block.width(), block.height())
        },
    })
}

describe('Block', () => {
    afterEach(() => {
        document
            .querySelectorAll('canvas')
            .forEach((element) => element.remove())
    })

    describe('Constructor', () => {
        it('creates a Block instance', () => {
            block = new Block({
                x: 20,
                y: 10,
                width: 100,
                height: 100,
            })
            expect(block).toBeDefined()
        })
        it('does not throw when creating with options', () => {
            expect(
                () => new Block({ x: 100, y: 100, width: 300, height: 500 })
            ).not.toThrow()
        })
    })
    describe('option values', () => {
        beforeEach(() => {
            block = new Block({
                x: 20,
                y: 10,
                width: 100,
                height: 100,
            })
        })
        it('should get default when value is undefined', () => {
            expect(block.__valueHandler(undefined, 'customValue', 0)).toBe(0)
        })
        it('should convert px to number', () => {
            expect(block.__valueHandler('20px', 'customValue', 0, true)).toBe(
                20
            )
        })
        it('should convert % to number relative to parent width and height', async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            canvas.add(block)
            await flush()
            expect(block.__valueHandler('20%', 'customValue', 0, true)).toBe(80)
        })
        it('should convert rem to number relative to canvas size', async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            canvas.add(block)
            await flush()
            expect(block.__valueHandler('1.6rem', 'customValue', 0, true)).toBe(
                640
            )
        })
        it('should convert em to number relative to parent size', () => {
            const childBlock = new Block({ width: 400, height: 300 })
            block.addChild(childBlock)
            expect(
                childBlock.__valueHandler('2em', 'customValue', 0, true)
            ).toBe(200)
        })
        it('should convert vw to number relative to canvas width', async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            canvas.add(block)
            await flush()
            expect(block.__valueHandler('20vw', 'customValue', 0, true)).toBe(
                80
            )
        })
        it('should convert vh to number relative to canvas height', async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            canvas.add(block)
            await flush()
            expect(block.__valueHandler('20vh', 'customValue', 0, false)).toBe(
                100
            )
        })
        it('should convert centimeters to pixel', () => {
            expect(block.__valueHandler('20cm', 'customValue', 0)).toBe(756)
        })
        it('should convert millimeters to pixel', () => {
            expect(block.__valueHandler('20mm', 'customValue', 0)).toBe(75.6)
        })
        it('should convert quarter-millimeters to pixel', () => {
            expect(block.__valueHandler('20q', 'customValue', 0)).toBe(18.9)
        })
        it('should convert inches to pixel', () => {
            expect(block.__valueHandler('20in', 'customValue', 0)).toBe(1920.24)
        })
        it('should convert picas to pixel', () => {
            expect(block.__valueHandler('20pc', 'customValue', 0)).toBe(
                320.03999999999996
            )
        })
        it('should convert points to pixel', () => {
            expect(block.__valueHandler('20pt', 'customValue', 0)).toBe(
                26.669999999999998
            )
        })
        it('should convert color to rgba', () => {
            expect(block.__valueHandler('green', 'customValue', 0)).toBe(
                'rgba(0, 128, 0, 1)'
            )
        })
        it('should convert hexadecimal to rgba', () => {
            expect(block.__valueHandler('#800080', 'customValue', 0)).toBe(
                'rgba(128, 0, 128, 1)'
            )
        })
        it('should HSL(Hue, Saturation, Lightness) to rgba', () => {
            expect(
                block.__valueHandler('hsl(0, 0%, 50%)', 'customValue', 0)
            ).toBe('rgba(128, 128, 128, 1)')
        })
        it('should convert array of values to correct value', () => {
            expect(
                block.__valueHandler(['20px', '10', 'white'], 'customValue', 0)
            ).toEqual([20, 10, 'rgba(255, 255, 255, 1)'])
        })
        it('should use set method for setting option value', () => {
            expect(() => block.set({ x: 20 })).not.toThrow()
            expect(block.x()).toBe(20)
        })
        it('should convert list of params to list of correct type', () => {
            expect(
                block.__valueHandler([20, '20in', 'green'], 'customValue', [])
            ).toStrictEqual([20, 1920.24, 'rgba(0, 128, 0, 1)'])
        })
        it('should only output important value', () => {
            block.set({ important: { x: 40 } })
            expect(block.x()).toBe(40)
        })
        it('should set current value of block options', () => {
            block.setOptionCurrent('x', 10)
            expect(block.getOptionCurrent('x')).toBe(10)
        })
        it('should set cache value of block options', () => {
            block.setOptionCache('x', 10)
            expect(block.getOptionCache('x')).toBe(10)
        })
        it('should set method set options of block', () => {
            block.set({ x: 10 })
            expect(block.x()).toBe(10)
        })
        it('should bind options of block', async () => {
            block.set({ x: 100 })
            const bindBlock = new Block({ x: 50, y: 10 })
            bindBlock.bindTo(block, ['x'])
            canvas.add(bindBlock)
            await flush()
            expect(bindBlock.x()).toBe(100)
        })
    })
    describe('block transformations', () => {
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                x: 20,
                y: 30,
                width: 100,
                height: 100,
            })
            canvas.add(block)
            await flush()
        })
        it('should set initial coordinates', () => {
            expect([
                block.cornerTopLeft(),
                block.cornerTopRight(),
                block.cornerBottomLeft(),
                block.cornerBottomRight(),
            ]).toMatchSnapshot()
            expect([
                block.hotRotatableAreaTopLeft(),
                block.hotRotatableAreaTopRight(),
                block.hotRotatableAreaBottomLeft(),
                block.hotRotatableAreaBottomRight(),
            ]).toMatchSnapshot()
            expect([
                block.hotResizableAreaTopLeft(),
                block.hotResizableAreaTopRight(),
                block.hotResizableAreaBottomLeft(),
                block.hotResizableAreaBottomRight(),
                block.hotResizableAreaTop(),
                block.hotResizableAreaLeft(),
                block.hotResizableAreaBottom(),
                block.hotResizableAreaRight(),
            ]).toMatchSnapshot()
        })
        it('should change x coordinate', async () => {
            block.set({ x: 120 })
            await flush()
            expect([
                block.cornerTopLeft(),
                block.cornerTopRight(),
                block.cornerBottomLeft(),
                block.cornerBottomRight(),
            ]).toMatchSnapshot()
            expect([
                block.hotRotatableAreaTopLeft(),
                block.hotRotatableAreaTopRight(),
                block.hotRotatableAreaBottomLeft(),
                block.hotRotatableAreaBottomRight(),
            ]).toMatchSnapshot()
            expect([
                block.hotResizableAreaTopLeft(),
                block.hotResizableAreaTopRight(),
                block.hotResizableAreaBottomLeft(),
                block.hotResizableAreaBottomRight(),
                block.hotResizableAreaTop(),
                block.hotResizableAreaLeft(),
                block.hotResizableAreaBottom(),
                block.hotResizableAreaRight(),
            ]).toMatchSnapshot()
        })
        it('should change y coordinate', async () => {
            block.set({ y: 20 })
            await flush()
            expect([
                block.cornerTopLeft(),
                block.cornerTopRight(),
                block.cornerBottomLeft(),
                block.cornerBottomRight(),
            ]).toMatchSnapshot()
            expect([
                block.hotRotatableAreaTopLeft(),
                block.hotRotatableAreaTopRight(),
                block.hotRotatableAreaBottomLeft(),
                block.hotRotatableAreaBottomRight(),
            ]).toMatchSnapshot()
            expect([
                block.hotResizableAreaTopLeft(),
                block.hotResizableAreaTopRight(),
                block.hotResizableAreaBottomLeft(),
                block.hotResizableAreaBottomRight(),
                block.hotResizableAreaTop(),
                block.hotResizableAreaLeft(),
                block.hotResizableAreaBottom(),
                block.hotResizableAreaRight(),
            ]).toMatchSnapshot()
        })
        it('should resize width', async () => {
            block.set({ width: 50 })
            await flush()
            expect([
                block.cornerTopLeft(),
                block.cornerTopRight(),
                block.cornerBottomLeft(),
                block.cornerBottomRight(),
            ]).toMatchSnapshot()
            expect([
                block.hotRotatableAreaTopLeft(),
                block.hotRotatableAreaTopRight(),
                block.hotRotatableAreaBottomLeft(),
                block.hotRotatableAreaBottomRight(),
            ]).toMatchSnapshot()
            expect([
                block.hotResizableAreaTopLeft(),
                block.hotResizableAreaTopRight(),
                block.hotResizableAreaBottomLeft(),
                block.hotResizableAreaBottomRight(),
                block.hotResizableAreaTop(),
                block.hotResizableAreaLeft(),
                block.hotResizableAreaBottom(),
                block.hotResizableAreaRight(),
            ]).toMatchSnapshot()
        })
        it('should resize height', async () => {
            block.set({ height: 50 })
            await flush()
            expect([
                block.cornerTopLeft(),
                block.cornerTopRight(),
                block.cornerBottomLeft(),
                block.cornerBottomRight(),
            ]).toMatchSnapshot()
            expect([
                block.hotRotatableAreaTopLeft(),
                block.hotRotatableAreaTopRight(),
                block.hotRotatableAreaBottomLeft(),
                block.hotRotatableAreaBottomRight(),
            ]).toMatchSnapshot()
            expect([
                block.hotResizableAreaTopLeft(),
                block.hotResizableAreaTopRight(),
                block.hotResizableAreaBottomLeft(),
                block.hotResizableAreaBottomRight(),
                block.hotResizableAreaTop(),
                block.hotResizableAreaLeft(),
                block.hotResizableAreaBottom(),
                block.hotResizableAreaRight(),
            ]).toMatchSnapshot()
        })
        it('should scale width and height', async () => {
            block.set({ scale: 3 })
            await flush()
            expect(block.width()).toBe(300)
        })
        it('should rotate block', async () => {
            block.set({ rotate: 1.2 })
            await flush()
            expect([
                block.cornerTopLeft(),
                block.cornerTopRight(),
                block.cornerBottomLeft(),
                block.cornerBottomRight(),
            ]).toMatchSnapshot()
            expect([
                block.hotRotatableAreaTopLeft(),
                block.hotRotatableAreaTopRight(),
                block.hotRotatableAreaBottomLeft(),
                block.hotRotatableAreaBottomRight(),
            ]).toMatchSnapshot()
            expect([
                block.hotResizableAreaTopLeft(),
                block.hotResizableAreaTopRight(),
                block.hotResizableAreaBottomLeft(),
                block.hotResizableAreaBottomRight(),
                block.hotResizableAreaTop(),
                block.hotResizableAreaLeft(),
                block.hotResizableAreaBottom(),
                block.hotResizableAreaRight(),
            ]).toMatchSnapshot()
        })
        it('should change rotation center x', async () => {
            block.set({
                rotationCenterX: block.x() + block.width(),
                rotate: 1.2,
            })
            await flush()
            expect([
                block.cornerTopLeft(),
                block.cornerTopRight(),
                block.cornerBottomLeft(),
                block.cornerBottomRight(),
            ]).toMatchSnapshot()
        })
        it('should change rotation center y', async () => {
            block.set({
                rotationCenterY: block.y() + block.height(),
                rotate: 1.2,
            })
            await flush()
            expect([
                block.cornerTopLeft(),
                block.cornerTopRight(),
                block.cornerBottomLeft(),
                block.cornerBottomRight(),
            ]).toMatchSnapshot()
        })
        it('should change coordinates on horizontal flip', async () => {
            block.set({
                horizontalFlipResize: true,
                width: -100,
            })
            await flush()
            expect([
                block.cornerTopLeft(),
                block.cornerTopRight(),
                block.cornerBottomLeft(),
                block.cornerBottomRight(),
            ]).toMatchSnapshot()
            expect([
                block.hotRotatableAreaTopLeft(),
                block.hotRotatableAreaTopRight(),
                block.hotRotatableAreaBottomLeft(),
                block.hotRotatableAreaBottomRight(),
            ]).toMatchSnapshot()
            expect([
                block.hotResizableAreaTopLeft(),
                block.hotResizableAreaTopRight(),
                block.hotResizableAreaBottomLeft(),
                block.hotResizableAreaBottomRight(),
                block.hotResizableAreaTop(),
                block.hotResizableAreaLeft(),
                block.hotResizableAreaBottom(),
                block.hotResizableAreaRight(),
            ]).toMatchSnapshot()
        })
        it('should change coordinates on vertical flip', async () => {
            block.set({
                verticalFlipResize: true,
                height: -100,
            })
            await flush()
            expect([
                block.cornerTopLeft(),
                block.cornerTopRight(),
                block.cornerBottomLeft(),
                block.cornerBottomRight(),
            ]).toMatchSnapshot()
            expect([
                block.hotRotatableAreaTopLeft(),
                block.hotRotatableAreaTopRight(),
                block.hotRotatableAreaBottomLeft(),
                block.hotRotatableAreaBottomRight(),
            ]).toMatchSnapshot()
            expect([
                block.hotResizableAreaTopLeft(),
                block.hotResizableAreaTopRight(),
                block.hotResizableAreaBottomLeft(),
                block.hotResizableAreaBottomRight(),
                block.hotResizableAreaTop(),
                block.hotResizableAreaLeft(),
                block.hotResizableAreaBottom(),
                block.hotResizableAreaRight(),
            ]).toMatchSnapshot()
        })
        it('should change coordinates on horizontal and vertical flip', async () => {
            block.set({
                horizontalFlipResize: true,
                verticalFlipResize: true,
                width: -100,
                height: -100,
            })
            await flush()
            expect([
                block.cornerTopLeft(),
                block.cornerTopRight(),
                block.cornerBottomLeft(),
                block.cornerBottomRight(),
            ]).toMatchSnapshot()
            expect([
                block.hotRotatableAreaTopLeft(),
                block.hotRotatableAreaTopRight(),
                block.hotRotatableAreaBottomLeft(),
                block.hotRotatableAreaBottomRight(),
            ]).toMatchSnapshot()
            expect([
                block.hotResizableAreaTopLeft(),
                block.hotResizableAreaTopRight(),
                block.hotResizableAreaBottomLeft(),
                block.hotResizableAreaBottomRight(),
                block.hotResizableAreaTop(),
                block.hotResizableAreaLeft(),
                block.hotResizableAreaBottom(),
                block.hotResizableAreaRight(),
            ]).toMatchSnapshot()
        })
    })
    describe('child blocks', () => {
        it('should add child blocks before canvas init', () => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                x: 20,
                y: 30,
                width: 100,
                height: 100,
            })
            const childBlock = new Block({})
            block.addChild(childBlock)
            canvas.add(block)
            expect([...block.childNodes][0]).toBe(childBlock)
        })
        it('should add child blocks after canvas init', () => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                x: 20,
                y: 30,
                width: 100,
                height: 100,
            })
            const childBlock = new Block({})
            canvas.add(block)
            block.addChild(childBlock)
            expect([...block.childNodes][0]).toBe(childBlock)
        })
        it('should remove child blocks before canvas init', () => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                x: 20,
                y: 30,
                width: 100,
                height: 100,
            })
            const childBlock = new Block({})
            block.addChild(childBlock)
            block.removeChild(childBlock)
            canvas.add(block)
            expect([...block.childNodes][0]).toBe(undefined)
        })
        it('should find child blocks after canvas init', () => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                x: 20,
                y: 30,
                width: 100,
                height: 100,
            })
            const childBlock = new Block({})
            block.addChild(childBlock)
            canvas.add(block)
            block.removeChild(childBlock)
            expect([...block.childNodes][0]).toBe(undefined)
        })
        it('should list child blocks', () => {
            block = new Block({
                x: 70,
                y: 90,
                width: 100,
                height: 100,
                hotLines: true,
                overflow: 'scroll',
            })
            const childBlocks = [new Block({}), new Block({}), new Block({})]
            block.addChild(childBlocks[0])
            block.addChild(childBlocks[1])
            block.addChild(childBlocks[2])
            // listing childs should also ignore overflow and hotline blocks which is created internally
            block.listOnlyChilds((block, currIdx, arrLen) => {
                expect(childBlocks[currIdx]).toBe(block)
                expect(arrLen).not.toBe(currIdx)
            })
        })
        it('should list all child blocks', () => {
            // listing childs should also ignore overflow and hotline blocks which is created internally
            block = new Block({
                x: 70,
                y: 90,
                width: 100,
                height: 100,
                hotLines: true,
                overflow: 'scroll',
            })
            const headBlock = block
            const childBlocks = [new Block({}), new Block({}), new Block({})]
            block.addChild(childBlocks[0])
            block.addChild(childBlocks[1])
            block.addChild(childBlocks[2])
            let currIdx = 0
            // listAllChilds traverses the tree starting from the block itself,
            // so the first visited node is the block and not one of its childs
            block.listAllChilds((child) => {
                if (child === headBlock) return
                expect(childBlocks[currIdx]).toBe(child)
                currIdx++
            })
            expect(currIdx).toBe(childBlocks.length)
        })
        it('should adjust coordinates of child blocks', async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                x: 70,
                y: 90,
                width: 100,
                height: 100,
                rotate: 1.2,
            })
            const childBlocks = [
                new Block({ x: 20, y: 20, width: 40, height: 50 }),
                new Block({ x: 12, y: 0, width: 50, height: 30 }),
                new Block({ x: 2, y: 10, width: 55, height: 32 }),
            ]
            block.addChild(childBlocks[0])
            block.addChild(childBlocks[1])
            block.addChild(childBlocks[2])
            canvas.add(block)
            await flush()
            expect([
                childBlocks[0].x(),
                childBlocks[0].y(),
                childBlocks[0].width(),
                childBlocks[0].height(),
                childBlocks[0].rotate(),
            ]).toEqual([
                expect.closeTo(70),
                expect.closeTo(90),
                expect.closeTo(40),
                expect.closeTo(50),
                expect.closeTo(1.2),
            ])

            expect([
                childBlocks[1].x(),
                childBlocks[1].y(),
                childBlocks[1].width(),
                childBlocks[1].height(),
                childBlocks[0].rotate(),
            ]).toEqual([
                expect.closeTo(110),
                expect.closeTo(90),
                expect.closeTo(50),
                expect.closeTo(30),
                expect.closeTo(1.2),
            ])

            expect([
                childBlocks[2].x(),
                childBlocks[2].y(),
                childBlocks[2].width(),
                childBlocks[2].height(),
                childBlocks[0].rotate(),
            ]).toEqual([
                expect.closeTo(70),
                expect.closeTo(140),
                expect.closeTo(55),
                expect.closeTo(32),
                expect.closeTo(1.2),
            ])
        })
        it('should adjust child rotation center to self', async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                x: 70,
                y: 90,
                width: 100,
                height: 100,
                rotationCenter: 'self',
            })
            const childBlock = new Block({
                x: 20,
                y: 20,
                width: 40,
                height: 50,
                rotationCenter: 'self',
            })
            block.addChild(childBlock)
            canvas.add(block)
            await flush()
            expect([
                childBlock.rotationCenterX(),
                childBlock.rotationCenterY(),
            ]).toStrictEqual([90, 115])
        })
        it('should hide child block', async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                x: 70,
                y: 90,
                width: 100,
                height: 100,
                hidden: true,
            })
            const childBlock = new Block({
                x: 20,
                y: 20,
                width: 40,
                height: 50,
            })
            drawFilledBlock(childBlock)
            block.addChild(childBlock)
            canvas.add(block)
            await flush()
            expect(childBlock.hidden()).toBe(true)
            // a hidden block is not painted at all
            await expect(page.elementLocator(canvas.canvas)).toMatchScreenshot(
                'child-not-drawn-while-parent-is-hidden'
            )
        })
        it('should draw child block of a visible parent', async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                x: 70,
                y: 90,
                width: 100,
                height: 100,
            })
            const childBlock = new Block({
                x: 20,
                y: 20,
                width: 40,
                height: 50,
            })
            drawFilledBlock(childBlock)
            block.addChild(childBlock)
            canvas.add(block)
            await flush()
            expect(childBlock.hidden()).toBe(false)
            // the child is laid out by its parent and painted on top of it
            expect([childBlock.x(), childBlock.y()]).toStrictEqual([70, 90])
            await expect(page.elementLocator(canvas.canvas)).toMatchScreenshot(
                'child-drawn-while-parent-is-visible'
            )
        })
        it('should show a child which is hidden on its own', async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                x: 70,
                y: 90,
                width: 100,
                height: 100,
            })
            const childBlock = new Block({
                width: 40,
                height: 50,
                hidden: true,
            })
            drawFilledBlock(childBlock)
            block.addChild(childBlock)
            canvas.add(block)
            await flush()
            // visibility always comes from the parent, so the child is drawn
            expect(childBlock.hidden()).toBe(false)
            await expect(page.elementLocator(canvas.canvas)).toMatchScreenshot(
                'child-hidden-by-itself-is-drawn'
            )
        })
    })
    describe('child layout', () => {
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            await flush()
        })
        it('should wrap childs into a new row when parent runs out of width', async () => {
            block = new Block({ x: 0, y: 0, width: 100, height: 100 })
            const childBlocks = [
                new Block({ width: 40, height: 20 }),
                new Block({ width: 40, height: 20 }),
                new Block({ width: 40, height: 20 }),
            ]
            childBlocks.forEach((child) => block.addChild(child))
            canvas.add(block)
            await flush()
            // two of them fit into a row, the third one starts a new row
            expect([
                [childBlocks[0].x(), childBlocks[0].y()],
                [childBlocks[1].x(), childBlocks[1].y()],
                [childBlocks[2].x(), childBlocks[2].y()],
            ]).toStrictEqual([
                [0, 0],
                [40, 0],
                [0, 20],
            ])
            expect(block.__childsContainer).toStrictEqual({
                width: 80,
                height: 40,
            })
        })
        it('should measure childs container with their margins', async () => {
            block = new Block({ x: 0, y: 0, width: 400, height: 400 })
            const childBlocks = [
                new Block({ width: 100, height: 40 }),
                new Block({ width: 130, height: 40, margin: 30 }),
                new Block({ width: 100, height: 40 }),
            ]
            childBlocks.forEach((child) => block.addChild(child))
            canvas.add(block)
            await flush()
            expect([
                [childBlocks[0].x(), childBlocks[0].y()],
                [childBlocks[1].x(), childBlocks[1].y()],
                [childBlocks[2].x(), childBlocks[2].y()],
            ]).toStrictEqual([
                [0, 0],
                [130, 30],
                [290, 0],
            ])
            // margins belong to the space a child takes in the parent
            expect(block.__childsContainer).toStrictEqual({
                width: 390,
                height: 100,
            })
        })
        it('should lay childs out backwards when parent is horizontally flipped', async () => {
            block = new Block({
                x: 0,
                y: 0,
                width: -100,
                height: 100,
                horizontalFlipResize: true,
            })
            const childBlocks = [
                new Block({ width: 40, height: 40 }),
                new Block({ width: 40, height: 40 }),
            ]
            childBlocks.forEach((child) => block.addChild(child))
            canvas.add(block)
            await flush()
            expect(block.horizontalFlip()).toBe(true)
            expect([
                [childBlocks[0].x(), childBlocks[0].width()],
                [childBlocks[1].x(), childBlocks[1].width()],
            ]).toStrictEqual([
                [0, -40],
                [-40, -40],
            ])
        })
        it('should lay childs out backwards when parent is vertically flipped', async () => {
            block = new Block({
                x: 0,
                y: 0,
                width: 100,
                height: -100,
                verticalFlipResize: true,
            })
            const childBlocks = [
                new Block({ width: 40, height: 40 }),
                new Block({ width: 40, height: 40 }),
                new Block({ width: 40, height: 40 }),
            ]
            childBlocks.forEach((child) => block.addChild(child))
            canvas.add(block)
            await flush()
            expect(block.verticalFlip()).toBe(true)
            // childs of a row stay on the same line with a flipped height, only
            // the row which does not fit anymore starts upwards
            expect([
                [childBlocks[0].x(), childBlocks[0].y(), childBlocks[0].height()],
                [childBlocks[1].x(), childBlocks[1].y(), childBlocks[1].height()],
                [childBlocks[2].x(), childBlocks[2].y(), childBlocks[2].height()],
            ]).toStrictEqual([
                [0, 0, -40],
                [40, 0, -40],
                [0, -40, -40],
            ])
        })
        it('should keep absolute and fixed childs out of the flow', async () => {
            block = new Block({ x: 0, y: 0, width: 100, height: 100 })
            const absoluteChild = new Block({
                width: 500,
                height: 20,
                position: 'absolute',
            })
            const flowingChild = new Block({ width: 80, height: 20 })
            block.addChild(absoluteChild)
            block.addChild(flowingChild)
            canvas.add(block)
            await flush()
            // the absolute child neither moves nor pushes the flowing one
            expect([absoluteChild.x(), absoluteChild.y()]).toStrictEqual([0, 0])
            expect([flowingChild.x(), flowingChild.y()]).toStrictEqual([0, 0])
            expect(block.__childsContainer).toStrictEqual({
                width: 80,
                height: 20,
            })
        })
        it('should reconvert child initial size on every parent layout', async () => {
            block = new Block({ x: 0, y: 0, width: 200, height: 100 })
            const percentChild = new Block({ width: '50%', height: 20 })
            block.addChild(percentChild)
            canvas.add(block)
            await flush()
            expect(percentChild.width()).toBe(100)
            block.set({ width: 400 })
            await flush()
            // a relative size is resolved against the parent again
            expect(percentChild.width()).toBe(200)
        })
        it('should give childs the rotation center of their parent', async () => {
            block = new Block({ x: 70, y: 90, width: 100, height: 100 })
            const centerChild = new Block({ width: 40, height: 50 })
            block.addChild(centerChild)
            canvas.add(block)
            await flush()
            expect(centerChild.rotationCenter()).toBe('parent')
            expect([
                centerChild.rotationCenterX(),
                centerChild.rotationCenterY(),
            ]).toStrictEqual([
                block.rotationCenterX(),
                block.rotationCenterY(),
            ])
        })
        it('should inherit rotation of parent in current and cache', async () => {
            block = new Block({ x: 0, y: 0, width: 100, height: 100, rotate: 0.6 })
            const rotatedChild = new Block({ width: 40, height: 50 })
            block.addChild(rotatedChild)
            canvas.add(block)
            await flush()
            expect(rotatedChild.rotate()).toBeCloseTo(0.6)
            expect(rotatedChild.getOptionCurrent('rotate')).toBeCloseTo(0.6)
            expect(rotatedChild.getOptionCache('rotate')).toBeCloseTo(0.6)
            block.set({ rotate: 1.2 })
            await flush()
            expect(rotatedChild.getOptionCurrent('rotate')).toBeCloseTo(1.2)
            expect(rotatedChild.getOptionCache('rotate')).toBeCloseTo(1.2)
        })
        it('should move already laid out childs when parent changes', async () => {
            block = new Block({ x: 0, y: 0, width: 200, height: 100 })
            const movedChild = new Block({ width: 40, height: 20 })
            block.addChild(movedChild)
            canvas.add(block)
            await flush()
            expect([movedChild.x(), movedChild.y()]).toStrictEqual([0, 0])
            block.set({ x: 100, y: 50 })
            await flush()
            expect([movedChild.x(), movedChild.y()]).toStrictEqual([100, 50])
            // resizing the parent does not resize the child
            block.set({ width: 300 })
            await flush()
            expect([movedChild.x(), movedChild.width()]).toStrictEqual([100, 40])
        })
        it('should show childs again when parent becomes visible', async () => {
            block = new Block({
                x: 70,
                y: 90,
                width: 200,
                height: 100,
                hidden: true,
            })
            const hiddenChild = new Block({ width: 40, height: 20 })
            drawFilledBlock(hiddenChild)
            block.addChild(hiddenChild)
            canvas.add(block)
            await flush()
            expect(hiddenChild.hidden()).toBe(true)
            block.set({ hidden: false })
            await flush()
            expect(hiddenChild.hidden()).toBe(false)
            await expect(page.elementLocator(canvas.canvas)).toMatchScreenshot(
                'child-drawn-after-parent-is-shown'
            )
        })
        it('should keep sticky child pinned to the parent edge on scroll', async () => {
            block = new Block({
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                overflowY: 'scroll',
            })
            const scrollingChild = new Block({ width: 20, height: 200 })
            const stickyChild = new Block({
                width: 20,
                height: 20,
                position: 'sticky',
                top: 10,
            })
            block.addChild(scrollingChild)
            block.addChild(stickyChild)
            canvas.add(block)
            await flush()
            // there is nothing scrolled yet, both childs sit at the top
            expect(scrollingChild.y()).toBe(block.y())
            expect(stickyChild.y() - block.y()).toBe(10)

            block.__overflowTranslateY(-60)
            block.__invokeChange()
            await flush(3)
            // the regular child scrolls away while the sticky one stays put
            expect(scrollingChild.y()).toBe(block.y() + block.overflowPositionY())
            expect(stickyChild.y() - block.y()).toBe(10)
        })
    })
    describe('spacing', () => {
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                width: 400,
                height: 400,
            })
            canvas.add(block)
            await flush()
        })
        it('padding should parse values', () => {
            block.set({ padding: 20 })
            expect([
                block.paddingTop(),
                block.paddingBottom(),
                block.paddingLeft(),
                block.paddingRight(),
            ]).toStrictEqual([20, 20, 20, 20])

            // parse four array values
            block.set({ padding: [30, 20, 80, 10] })
            expect([
                block.paddingTop(),
                block.paddingRight(),
                block.paddingBottom(),
                block.paddingLeft(),
            ]).toStrictEqual([30, 20, 80, 10])

            // parse three array values
            block.set({ padding: [30, 10, 20] })
            expect([
                block.paddingTop(),
                block.paddingRight(),
                block.paddingBottom(),
                block.paddingLeft(),
            ]).toStrictEqual([30, 10, 20, 10])

            // parse two array values
            block.set({ padding: [30, 10] })
            expect([
                block.paddingTop(),
                block.paddingRight(),
                block.paddingBottom(),
                block.paddingLeft(),
            ]).toStrictEqual([30, 10, 30, 10])

            // parse one array values
            block.set({ padding: [30] })
            expect([
                block.paddingTop(),
                block.paddingRight(),
                block.paddingBottom(),
                block.paddingLeft(),
            ]).toStrictEqual([30, 30, 30, 30])
        })
        it('padding should adjust width and height of block', async () => {
            const blockWidth = block.width()
            const blockHeight = block.height()
            const paddingRight = 30
            const paddingBottom = 40
            block.set({
                paddingRight: paddingRight,
                paddingBottom: paddingBottom,
            })
            await flush()
            expect(block.width()).toBe(paddingRight + blockWidth)
            expect(block.height()).toBe(paddingBottom + blockHeight)
        })
        it('padding should add spacing around itself', async () => {
            const padding = 30
            const childBlocks = [
                new Block({ width: 100, height: 40 }),
                new Block({ width: 130, height: 40 }),
                new Block({ width: 100, height: 40 }),
            ]
            block.addChild(childBlocks[0])
            block.addChild(childBlocks[1])
            block.addChild(childBlocks[2])
            block.set({ padding: padding })
            await flush()
            expect(childBlocks[0].x()).toBe(padding)
            expect(childBlocks[1].x()).toBe(childBlocks[0].width() + padding)
            expect(childBlocks[2].x()).toBe(
                childBlocks[1].width() + childBlocks[0].width() + padding
            )
        })
        it('margin should parse values', () => {
            block.set({ margin: 20 })
            expect([
                block.marginTop(),
                block.marginBottom(),
                block.marginLeft(),
                block.marginRight(),
            ]).toStrictEqual([20, 20, 20, 20])

            // parse four array values
            block.set({ margin: [30, 20, 80, 10] })
            expect([
                block.marginTop(),
                block.marginRight(),
                block.marginBottom(),
                block.marginLeft(),
            ]).toStrictEqual([30, 20, 80, 10])

            // parse three array values
            block.set({ margin: [30, 10, 20] })
            expect([
                block.marginTop(),
                block.marginRight(),
                block.marginBottom(),
                block.marginLeft(),
            ]).toStrictEqual([30, 10, 20, 10])

            // parse two array values
            block.set({ margin: [30, 10] })
            expect([
                block.marginTop(),
                block.marginRight(),
                block.marginBottom(),
                block.marginLeft(),
            ]).toStrictEqual([30, 10, 30, 10])

            // parse one array values
            block.set({ margin: [30] })
            expect([
                block.marginTop(),
                block.marginRight(),
                block.marginBottom(),
                block.marginLeft(),
            ]).toStrictEqual([30, 30, 30, 30])
        })
        it('margin should add spacing around itself', async () => {
            const margin = 30
            const childBlocks = [
                new Block({ width: 100, height: 40 }),
                new Block({ width: 130, height: 40, margin: margin }),
                new Block({ width: 100, height: 40 }),
            ]
            block.addChild(childBlocks[0])
            block.addChild(childBlocks[1])
            block.addChild(childBlocks[2])
            // nothing is set on the parent here, so it has to be demanded
            // explicitly to lay its childs out
            block.__invokeChange()
            await flush()
            expect(childBlocks[0].x()).toBe(0)
            expect(childBlocks[1].x()).toBe(childBlocks[0].width() + margin)
            expect(childBlocks[2].x()).toBe(
                childBlocks[1].width() + childBlocks[0].width() + margin * 2
            )
        })
    })
    describe('min and max size', () => {
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                width: 400,
                height: 400,
            })
            canvas.add(block)
            await flush()
        })
        it('should limit width by maxWidth', async () => {
            block.set({ maxWidth: 120 })
            await flush()
            expect(block.width()).toBe(120)
        })
        it('should limit height by maxHeight', async () => {
            block.set({ maxHeight: 120 })
            await flush()
            expect(block.height()).toBe(120)
        })
        it('should enforce minWidth', async () => {
            block.set({ minWidth: 50, width: 20 })
            await flush()
            expect(block.width()).toBe(50)
        })
        it('should enforce minHeight', async () => {
            block.set({ minHeight: 50, height: 20 })
            await flush()
            expect(block.height()).toBe(50)
        })
        it('should resize children respecting min and max size', async () => {
            const childBlocks = [
                new Block({
                    width: 100,
                    height: 40,
                    maxWidth: 120,
                    minWidth: 20,
                }),
                new Block({
                    width: 130,
                    height: 40,
                    maxWidth: 90,
                    minWidth: 0,
                }),
                new Block({
                    width: 100,
                    height: 40,
                    maxWidth: 120,
                    minWidth: 40,
                }),
            ]
            block.addChild(childBlocks[0])
            block.addChild(childBlocks[1])
            block.addChild(childBlocks[2])
            block.set({ width: 200 })
            await flush()

            // a child is always laid out by its parent and keeps its initial
            // size, so maxWidth can only shrink it and never grow it
            expect([
                childBlocks[0].x(),
                childBlocks[0].y(),
                childBlocks[0].width(),
            ]).toStrictEqual([0, 0, 100])

            expect([
                childBlocks[1].x(),
                childBlocks[1].y(),
                childBlocks[1].width(),
            ]).toStrictEqual([100, 0, 90])
            expect([
                childBlocks[2].x(),
                childBlocks[2].y(),
                childBlocks[2].width(),
            ]).toStrictEqual([0, 40, 100])
        })
    })
    describe('positioning', () => {
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                width: 120,
                height: 120,
            })
            canvas.add(block)
            await flush()
        })
        it('should set fixed position', async () => {
            block.set({
                position: 'fixed',
                left: 40,
                top: 30,
            })
            await flush()
            expect([block.x(), block.y()]).toStrictEqual([40, 30])
            block.set({
                position: 'fixed',
                left: undefined,
                top: undefined,
                right: 120,
                bottom: 30,
            })
            await flush()
            expect([block.x(), block.y()]).toStrictEqual([160, 350])
        })
        it('should set absolute position', async () => {
            block.set({
                position: 'absolute',
                left: 40,
                top: 30,
            })
            await flush()
            expect([block.x(), block.y()]).toStrictEqual([40, 30])

            block.set({
                position: 'absolute',
                right: 120,
                bottom: 30,
                left: undefined,
                top: undefined,
            })
            await flush()
            expect([block.x(), block.y()]).toStrictEqual([160, 350])
        })
        it('should set sticky position', async () => {
            block.set({
                position: 'sticky',
                left: 40,
                top: 30,
                x: 10,
                y: 10,
            })
            await flush()
            expect([block.x(), block.y()]).toStrictEqual([40, 30])

            block.set({
                position: 'sticky',
                right: 120,
                bottom: 200,
                x: 230,
                y: 210,
                left: undefined,
                top: undefined,
            })
            await flush()
            expect([block.x(), block.y()]).toStrictEqual([160, 180])
        })
        it('should set relative position', async () => {
            block.set({
                position: 'relative',
                left: 40,
                top: 30,
            })
            await flush()
            expect([block.x(), block.y()]).toStrictEqual([40, 30])

            block.set({
                position: 'relative',
                right: 120,
                bottom: 200,
                left: undefined,
                top: undefined,
            })
            await flush()
            expect([block.x(), block.y()]).toStrictEqual([-120, -200])
        })
        it('does not adjust fixed positioned child', async () => {
            const childBlock = new Block({
                position: 'fixed',
                left: 100,
                top: 50,
            })
            block.addChild(childBlock)
            await flush()
            expect([childBlock.x(), childBlock.y()]).toStrictEqual([100, 50])
        })
        it('does not adjust absolute positioned child', async () => {
            const childBlock = new Block({
                position: 'absolute',
                left: 100,
                top: 50,
            })
            block.addChild(childBlock)
            await flush()
            expect([childBlock.x(), childBlock.y()]).toStrictEqual([100, 50])
        })
        it('should position relative child', async () => {
            block.set({ x: 100, y: 100 })
            const childBlock = new Block({
                position: 'relative',
                bottom: 100,
                right: 100,
            })
            block.addChild(childBlock)
            await flush()
            expect([childBlock.x(), childBlock.y()]).toStrictEqual([0, 0])

            childBlock.set({
                top: 100,
                left: 100,
                bottom: undefined,
                right: undefined,
            })
            await flush()
            expect([childBlock.x(), childBlock.y()]).toStrictEqual([200, 200])
        })
        it('should position sticky child', async () => {
            block.set({ x: 100, y: 100, overflow: 'scroll' })
            const childBlock = new Block({
                width: 20,
                height: 20,
                position: 'sticky',
                top: 10,
                left: 10,
            })
            const childBlockSecond = new Block({
                width: 20,
                height: 20,
            })

            block.addChild(childBlock)
            block.addChild(childBlockSecond)
            await flush()
            expect([childBlock.x(), childBlock.y()]).toStrictEqual([110, 110])

            childBlockSecond.set({
                bottom: 120,
                right: 120,
                top: undefined,
                left: undefined,
            })
            await flush()
            expect([childBlockSecond.x(), childBlockSecond.y()]).toStrictEqual([
                120, 100,
            ])
        })
    })
    describe('overflow', () => {
        // scroll bars are separate blocks added to the canvas scene, so they
        // are looked up by the side specific name they are created with
        const xScrollBars = () =>
            canvas.find({ name: OVERFLOW_X_SCROLL_BAR_BLOCK_NAME })
        const yScrollBars = () =>
            canvas.find({ name: OVERFLOW_Y_SCROLL_BAR_BLOCK_NAME })
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                selectable: true,
            })
            canvas.add(block)
            await flush()
        })
        afterEach(() => {
            canvas.isFocused = false
        })
        it('should hide overflow', async () => {
            block.set({ overflow: 'hidden' })
            const childBlock = new Block({
                width: 300,
                height: 300,
                backgroundColor: 'red',
            })
            drawFilledBlock(childBlock)
            block.addChild(childBlock)
            await flush()
            await expect(page.elementLocator(canvas.canvas)).toMatchScreenshot(
                'overflow-hidden'
            )
        })
        it('should show overflow', async () => {
            block.set({ overflow: 'visible' })
            const childBlock = new Block({
                width: 300,
                height: 300,
                backgroundColor: 'red',
            })
            drawFilledBlock(childBlock)
            block.addChild(childBlock)
            await flush()
            await expect(page.elementLocator(canvas.canvas)).toMatchScreenshot(
                'overflow-visible'
            )
        })
        it('should create scroll bar for overflowX scroll', async () => {
            expect(xScrollBars()).toHaveLength(0)
            block.set({ overflowX: 'scroll' })
            await flush()
            expect(xScrollBars()).toHaveLength(1)
            expect(yScrollBars()).toHaveLength(0)
        })
        it('should create scroll bar for overflowY scroll', async () => {
            expect(yScrollBars()).toHaveLength(0)
            block.set({ overflowY: 'scroll' })
            await flush()
            expect(yScrollBars()).toHaveLength(1)
            expect(xScrollBars()).toHaveLength(0)
        })
        it('should create scroll bar for overflowX auto', async () => {
            expect(xScrollBars()).toHaveLength(0)
            block.set({ overflowX: 'auto' })
            await flush()
            expect(xScrollBars()).toHaveLength(1)
            expect(yScrollBars()).toHaveLength(0)
        })
        it('should create scroll bar for overflowY auto', async () => {
            expect(yScrollBars()).toHaveLength(0)
            block.set({ overflowY: 'auto' })
            await flush()
            expect(yScrollBars()).toHaveLength(1)
            expect(xScrollBars()).toHaveLength(0)
        })
        it('should scroll on wheel along x axis', async () => {
            const childBlock = new Block({ width: 150, height: 50 })
            block.addChild(childBlock)
            block.set({ overflowX: 'scroll' })
            await flush()

            canvas.isFocused = true

            // the wheel listener is registered on the canvas element itself
            canvas.canvas.dispatchEvent(
                new WheelEvent('wheel', {
                    shiftKey: true,
                    deltaY: 100,
                    clientX: 10,
                    clientY: 10,
                    bubbles: true,
                    cancelable: true,
                })
            )
            await flush()
            expect(childBlock.x()).toBe(-20)
        })
        it('should scroll on wheel along y axis', async () => {
            const childBlock = new Block({ width: 50, height: 150 })
            block.addChild(childBlock)
            block.set({ overflowY: 'scroll' })
            await flush()

            canvas.isFocused = true

            canvas.canvas.dispatchEvent(
                new WheelEvent('wheel', {
                    deltaY: 100,
                    clientX: 10,
                    clientY: 10,
                    bubbles: true,
                    cancelable: true,
                })
            )
            await flush()
            expect(childBlock.y()).toBe(-20)
        })
    })
    describe('overflow translation', () => {
        // translating only stores the new offset, the canvas clamps it back on
        // the next layout of the block, so the change has to be demanded
        const translateX = async (target: Block, x: number) => {
            target.__overflowTranslateX(x)
            target.__invokeChange()
            await flush(3)
        }
        const translateY = async (target: Block, y: number) => {
            target.__overflowTranslateY(y)
            target.__invokeChange()
            await flush(3)
        }
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                overflowX: 'scroll',
            })
            childBlock = new Block({ width: 300, height: 20 })
            block.addChild(childBlock)
            canvas.add(block)
            await flush()
        })
        it('should accumulate overflow translation on x', async () => {
            await translateX(block, -30)
            expect(block.overflowPositionX()).toBe(-30)
            await translateX(block, -30)
            expect(block.overflowPositionX()).toBe(-60)
        })
        it('should scroll back to the start of the overflow area on x', async () => {
            await translateX(block, -30)
            expect(block.overflowPositionX()).toBe(-30)
            // past the start of the area there is nothing left to scroll to
            await translateX(block, 50)
            expect(block.overflowPositionX()).toBe(0)
        })
        it('should clamp overflow translation on x to the overflowed childs', async () => {
            await translateX(block, -999)
            // the childs are 300 wide inside a 100 wide parent
            expect(block.overflowPositionX()).toBe(-200)
        })
        it('should not translate overflow position on x when childs fit', async () => {
            block.set({ width: 400 })
            await flush()
            await translateX(block, -50)
            expect(block.overflowPositionX()).toBe(0)
        })
        it('should accumulate and clamp overflow translation on y', async () => {
            const tallBlock = new Block({
                x: 0,
                y: 200,
                width: 100,
                height: 100,
                overflowY: 'scroll',
            })
            const tallChild = new Block({ width: 20, height: 300 })
            tallBlock.addChild(tallChild)
            canvas.add(tallBlock)
            await flush()
            await translateY(tallBlock, -30)
            expect(tallBlock.overflowPositionY()).toBe(-30)
            await translateY(tallBlock, -999)
            expect(tallBlock.overflowPositionY()).toBe(-200)
        })
        it('should not translate overflow position on y when childs fit', async () => {
            await translateY(block, -50)
            expect(block.overflowPositionY()).toBe(0)
        })
        it('should move childs by the overflow position', async () => {
            expect(childBlock.x()).toBe(0)
            await translateX(block, -20)
            expect(childBlock.x()).toBe(-20)
        })
    })
    describe('onRender', () => {
        // the canvas renders blocks in its own loop, which would call the
        // callback on every frame, so render is driven manually here
        beforeEach(() => {
            block = new Block({ x: 20, y: 10, width: 100, height: 100 })
        })
        it('should call the user callback with the block on render', () => {
            const onRender = vi.fn()
            block.set({ onRender })
            block.render()
            expect(onRender).toHaveBeenCalledTimes(1)
            expect(onRender).toHaveBeenCalledWith(block)
        })
        it('should call the callback given through the constructor options', () => {
            const onRender = vi.fn()
            const blockWithRender = new Block({
                width: 50,
                height: 50,
                onRender,
            })
            blockWithRender.render()
            expect(onRender).toHaveBeenCalledWith(blockWithRender)
        })
        it('should not call the callback while the block is hidden', () => {
            const onRender = vi.fn()
            block.set({ hidden: true, onRender })
            block.render()
            expect(onRender).not.toHaveBeenCalled()
        })
        it('should store the render wrapper as the current option value', () => {
            block.set({ onRender: () => {} })
            // the raw option value is only resolved by the first call, the
            // wrapper replaces it in the options right afterwards
            block.onRender()
            const wrapper = block.onRender()
            expect(block.onRender()).toBe(wrapper)
            expect(block.getOptionCurrent('onRender')).toBe(wrapper)
        })
        it('should not register the wrapper as the user callback', () => {
            const onRender = vi.fn()
            block.set({ onRender })
            // reading the option resolves the wrapper, reading it again has to
            // keep it as a wrapper instead of a new user callback
            block.onRender()
            block.onRender()
            block.render()
            expect(onRender).toHaveBeenCalledTimes(1)
        })
        it('should keep the wrapper and replace the user callback on set', () => {
            const first = vi.fn()
            const second = vi.fn()
            block.set({ onRender: first })
            block.onRender()
            const wrapper = block.onRender()

            block.set({ onRender: second })
            block.onRender()
            expect(block.onRender()).toBe(wrapper)
            block.render()
            expect(first).not.toHaveBeenCalled()
            expect(second).toHaveBeenCalledTimes(1)
        })
        it('should render a block which has no context to clip', async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            const clippingParent = new Block({
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                overflow: 'hidden',
            })
            const onRender = vi.fn()
            const contextlessChild = new Block({ width: 200, height: 200 })
            clippingParent.addChild(contextlessChild)
            contextlessChild.set({ onRender })
            canvas.add(clippingParent)
            await flush()
            const context = contextlessChild.context
            contextlessChild.context = undefined
            expect(() => contextlessChild.render()).not.toThrow()
            contextlessChild.context = context
            expect(onRender).toHaveBeenCalled()
        })
    })
    describe('child clipping', () => {
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            await flush()
        })
        it('should clip a child by its parent', async () => {
            block = new Block({
                x: 50,
                y: 50,
                width: 100,
                height: 100,
                overflow: 'hidden',
            })
            childBlock = new Block({ width: 300, height: 300 })
            drawFilledBlock(childBlock)
            block.addChild(childBlock)
            canvas.add(block)
            await flush()
            await expect(page.elementLocator(canvas.canvas)).toMatchScreenshot(
                'child-clipped-by-parent'
            )
        })
        it('should clip a child by a rotated parent', async () => {
            block = new Block({
                x: 150,
                y: 150,
                width: 100,
                height: 100,
                rotate: 0.8,
                overflow: 'hidden',
            })
            childBlock = new Block({ width: 300, height: 300 })
            drawFilledBlock(childBlock)
            block.addChild(childBlock)
            canvas.add(block)
            await flush()
            await expect(page.elementLocator(canvas.canvas)).toMatchScreenshot(
                'child-clipped-by-rotated-parent'
            )
        })
        it('should clip a grandchild by every clipping parent', async () => {
            block = new Block({
                x: 20,
                y: 20,
                width: 200,
                height: 200,
                overflow: 'hidden',
            })
            // the margin moves the middle block out of the outer one, so both
            // of their clip paths have to be applied to the red child
            const middleBlock = new Block({
                width: 100,
                height: 100,
                margin: 150,
                overflow: 'hidden',
            })
            const grandChildBlock = new Block({ width: 200, height: 200 })
            drawFilledBlock(grandChildBlock)
            block.addChild(middleBlock)
            middleBlock.addChild(grandChildBlock)
            canvas.add(block)
            await flush()
            expect([
                middleBlock.x(),
                middleBlock.y(),
            ]).toStrictEqual([170, 170])
            await expect(page.elementLocator(canvas.canvas)).toMatchScreenshot(
                'child-clipped-by-ancestors'
            )
        })
    })
    describe('transformations', () => {
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                selectable: true,
            })
            canvas.add(block)
            allowMouse(canvas)
            await flush()
        })
        it('should resize block by dragging', async () => {
            block.set({ resizable: true })
            await flush()
            const targetLocator = page.elementLocator(canvas.canvas)
            const element = (await targetLocator.element()) as HTMLElement

            // select the block so the resize handles become active
            dispatchMouse(element, 'mousedown', 10, 10)
            dispatchMouse(element, 'mouseup', 10, 10)
            await flush()

            // hover the right resizable edge to arm the resize handle
            dispatchMouse(element, 'mousemove', 100, 50)

            dispatchMouse(element, 'mousedown', 100, 50, 1)

            dispatchMouse(element, 'mousemove', 200, 50, 1)

            dispatchMouse(element, 'mouseup', 200, 50)
            expect(block.width()).toBe(200)
            expect(block.x()).toBe(0)
            expect(block.y()).toBe(0)
            expect(block.height()).toBe(100)
        })
        it('should resize from specified corners', async () => {
            block.set({ resizable: true })
            await flush()
            const targetLocator = page.elementLocator(canvas.canvas)
            const element = (await targetLocator.element()) as HTMLElement

            // select the block so the resize handles become active
            dispatchMouse(element, 'mousedown', 10, 10)
            dispatchMouse(element, 'mouseup', 10, 10)
            await flush()

            // hover the top-left resizable corner to arm the corner handle
            dispatchMouse(element, 'mousemove', 5, 5)

            dispatchMouse(element, 'mousedown', 5, 5, 1)

            dispatchMouse(element, 'mousemove', 20, 20, 1)

            dispatchMouse(element, 'mouseup', 20, 20)

            expect(block.x()).toBe(15)
            expect(block.y()).toBe(15)
            expect(block.width()).toBe(85)
            expect(block.height()).toBe(85)
        })
        it('should call onResize while resizing', async () => {
            let isResizingOn = false
            const onResizeFunc = () => {
                isResizingOn = true
            }
            block.set({
                resizable: true,
                onResizable: onResizeFunc,
            })
            await flush()
            const targetLocator = page.elementLocator(canvas.canvas)
            const element = (await targetLocator.element()) as HTMLElement

            dispatchMouse(element, 'mousedown', 10, 10)
            dispatchMouse(element, 'mouseup', 10, 10)
            await flush()

            dispatchMouse(element, 'mousemove', 100, 50)

            dispatchMouse(element, 'mousedown', 100, 50, 1)

            dispatchMouse(element, 'mousemove', 200, 50, 1)

            dispatchMouse(element, 'mouseup', 200, 50)

            expect(isResizingOn).toBeTruthy()
        })

        it('should rotate block by dragging', async () => {
            block.set({ rotatable: true })
            await flush()
            const targetLocator = page.elementLocator(canvas.canvas)
            const element = (await targetLocator.element()) as HTMLElement

            // select the block so the rotation handles become active
            dispatchMouse(element, 'mousedown', 10, 10)
            dispatchMouse(element, 'mouseup', 10, 10)
            await flush()

            // hover the bottom-right rotatable corner to arm the handle
            dispatchMouse(element, 'mousemove', 105, 105)

            dispatchMouse(element, 'mousedown', 105, 105, 1)

            dispatchMouse(element, 'mousemove', 150, 50, 1)

            dispatchMouse(element, 'mouseup', 150, 50)

            expect(block.rotate()).toBeCloseTo(-Math.PI / 4, 10)
        })
        it('should rotate from specified corners', async () => {
            block.set({ rotatable: true })
            await flush()
            const targetLocator = page.elementLocator(canvas.canvas)
            const element = (await targetLocator.element()) as HTMLElement

            dispatchMouse(element, 'mousedown', 10, 10)
            dispatchMouse(element, 'mouseup', 10, 10)
            await flush()

            // hover the top-left rotatable corner to arm the handle
            dispatchMouse(element, 'mousemove', -7, -7)

            dispatchMouse(element, 'mousedown', -7, -7, 1)

            dispatchMouse(element, 'mousemove', 150, 50, 1)

            dispatchMouse(element, 'mouseup', 150, 50)

            expect(block.rotate()).toBeCloseTo((3 * Math.PI) / 4, 10)
        })
        it('should call onRotate while rotating', async () => {
            let isRotatingOn = false
            const onRotateFunc = () => {
                isRotatingOn = true
            }
            block.set({
                rotatable: true,
                onRotatable: onRotateFunc,
            })
            await flush()
            const targetLocator = page.elementLocator(canvas.canvas)
            const element = (await targetLocator.element()) as HTMLElement

            dispatchMouse(element, 'mousedown', 10, 10)
            dispatchMouse(element, 'mouseup', 10, 10)
            await flush()

            dispatchMouse(element, 'mousemove', 105, 105)

            dispatchMouse(element, 'mousedown', 105, 105, 1)

            dispatchMouse(element, 'mousemove', 150, 50, 1)

            dispatchMouse(element, 'mouseup', 150, 50)

            expect(isRotatingOn).toBeTruthy()
        })

        it('should drag block', async () => {
            block.set({ draggable: true })
            await flush()
            const targetLocator = page.elementLocator(canvas.canvas)
            const element = (await targetLocator.element()) as HTMLElement

            dispatchMouse(element, 'mousedown', 10, 10, 1)

            dispatchMouse(element, 'mousemove', 100, 100, 1)
            expect(block.x()).toBe(90)
            expect(block.y()).toBe(90)
        })
        it('should drag block only along x axis', async () => {
            block.set({ draggable: true, draggableY: false })
            await flush()
            const targetLocator = page.elementLocator(canvas.canvas)
            const element = (await targetLocator.element()) as HTMLElement
            dispatchMouse(element, 'mousedown', 10, 10, 1)
            dispatchMouse(element, 'mousemove', 100, 100, 1)
            expect(block.x()).toBe(90)
            expect(block.y()).toBe(0)
        })
        it('should drag block only along y axis', async () => {
            block.set({ draggable: true, draggableX: false })
            await flush()
            const targetLocator = page.elementLocator(canvas.canvas)
            const element = (await targetLocator.element()) as HTMLElement
            dispatchMouse(element, 'mousedown', 10, 10, 1)
            dispatchMouse(element, 'mousemove', 100, 100, 1)
            expect(block.x()).toBe(0)
            expect(block.y()).toBe(90)
        })
        it('should call onDrag while dragging', async () => {
            let isDraggingOn = false
            const onDragFunc = () => {
                isDraggingOn = true
            }
            block.set({
                draggable: true,
                draggableX: false,
                onDraggable: onDragFunc,
            })
            await flush()
            const targetLocator = page.elementLocator(canvas.canvas)
            const element = (await targetLocator.element()) as HTMLElement
            dispatchMouse(element, 'mousedown', 10, 10, 1)
            dispatchMouse(element, 'mousemove', 100, 100, 1)
            expect(isDraggingOn).toBeTruthy()
        })
    })
    describe('events', () => {
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                selectable: true,
            })
            canvas.add(block)
            allowMouse(canvas)
            await flush()
        })
        it('should trigger click event', async () => {
            const currentCanvas = page.elementLocator(canvas.canvas)
            let isClicked = false
            block.click(() => {
                isClicked = true
            })
            await flush()
            await userEvent.click(currentCanvas, { position: { x: 10, y: 10 } })
            expect(isClicked).toBeTruthy()
        })
        it('should trigger dblclick event', async () => {
            const currentCanvas = page.elementLocator(canvas.canvas)
            let isClicked = false
            block.dblclick(() => {
                isClicked = true
            })
            await flush()
            await userEvent.dblClick(currentCanvas, {
                position: { x: 10, y: 10 },
            })
            expect(isClicked).toBeTruthy()
        })
        it('should trigger contextmenu event on right click', async () => {
            const currentCanvas = page.elementLocator(canvas.canvas)
            let isClicked = false
            block.contextMenu(() => {
                isClicked = true
            })
            await flush()
            await userEvent.click(currentCanvas, {
                position: { x: 10, y: 10 },
                button: 'right',
            })
            expect(isClicked).toBeTruthy()
        })
        it('should trigger mousedown event', async () => {
            const currentCanvas = page.elementLocator(canvas.canvas)
            const element = (await currentCanvas.element()) as HTMLElement

            let isMouseDown = false
            block.mousedown(() => {
                isMouseDown = true
            })
            await flush()
            dispatchMouse(element, 'mousedown', 10, 10, 1)
            expect(isMouseDown).toBeTruthy()
        })
        it('should trigger mouseup event', async () => {
            const currentCanvas = page.elementLocator(canvas.canvas)
            const element = (await currentCanvas.element()) as HTMLElement

            let isMouseUp = false
            block.mouseup(() => {
                isMouseUp = true
            })
            await flush()
            dispatchMouse(element, 'mouseup', 10, 10)
            expect(isMouseUp).toBeTruthy()
        })
        it('should trigger mousemove event', async () => {
            const currentCanvas = page.elementLocator(canvas.canvas)
            const element = (await currentCanvas.element()) as HTMLElement

            let isMouseMove = false
            block.mousemove(() => {
                isMouseMove = true
            })
            await flush()
            dispatchMouse(element, 'mousemove', 10, 10, 1)
            expect(isMouseMove).toBeTruthy()
        })
        it('should trigger mouseenter event', async () => {
            const currentCanvas = page.elementLocator(canvas.canvas)
            const element = (await currentCanvas.element()) as HTMLElement

            let isMouseEnter = false
            block.mouseenter(() => {
                isMouseEnter = true
            })
            await flush()

            dispatchMouse(element, 'mousemove', 10, 10)

            expect(isMouseEnter).toBeTruthy()
        })
        it('should trigger mouseleave event', async () => {
            const currentCanvas = page.elementLocator(canvas.canvas)
            const element = (await currentCanvas.element()) as HTMLElement

            // leaving is only reported when another block is registered above
            // the one under the pointer, otherwise the block always stays the
            // first one, so the pointer has to move over a second block
            const upperBlock = new Block({
                x: 300,
                y: 300,
                width: 50,
                height: 50,
                zIndex: 1,
            })
            upperBlock.mousemove(() => {})
            canvas.add(upperBlock)
            await flush()

            let isMouseLeave = false
            block.mouseleave(() => {
                isMouseLeave = true
            })
            await flush()

            // move the pointer out of the block and over the upper block
            dispatchMouse(element, 'mousemove', 320, 320)

            expect(isMouseLeave).toBeTruthy()
        })
        it.todo('should trigger mouseover event', async () => {})
        it.todo('should trigger mouseout event', async () => {})
        it('should trigger keyup event', async () => {
            const currentCanvas = page.elementLocator(canvas.canvas)
            const element = (await currentCanvas.element()) as HTMLElement

            let isKeyUp = false
            block.keyup(() => {
                isKeyUp = true
            })
            await flush()

            canvas.isFocused = true
            element.dispatchEvent(
                new KeyboardEvent('keyup', {
                    key: 'Enter',
                    code: 'Enter',
                    bubbles: true,
                    cancelable: true,
                })
            )
            expect(isKeyUp).toBeTruthy()
        })
        it('should trigger keydown event', async () => {
            const currentCanvas = page.elementLocator(canvas.canvas)
            const element = (await currentCanvas.element()) as HTMLElement

            let isKeyDown = false
            block.keydown(() => {
                isKeyDown = true
            })
            await flush()

            canvas.isFocused = true
            element.dispatchEvent(
                new KeyboardEvent('keydown', {
                    key: 'Enter',
                    code: 'Enter',
                    bubbles: true,
                    cancelable: true,
                })
            )
            expect(isKeyDown).toBeTruthy()
        })
        it('should trigger wheel event', async () => {
            const currentCanvas = page.elementLocator(canvas.canvas)
            const element = (await currentCanvas.element()) as HTMLElement

            let isWheeled = false
            block.wheel(() => {
                isWheeled = true
            })
            await flush()

            canvas.isFocused = true
            element.dispatchEvent(
                new WheelEvent('wheel', {
                    deltaY: 100,
                    clientX: 10,
                    clientY: 10,
                    bubbles: true,
                    cancelable: true,
                })
            )

            expect(isWheeled).toBeTruthy()
        })
        it('does not select non-selectable block', async () => {
            block.set({ selectable: false })
            await flush()
            const currentCanvas = page.elementLocator(canvas.canvas)
            const element = (await currentCanvas.element()) as HTMLElement

            dispatchMouse(element, 'mousedown', 10, 10, 1)

            expect(canvas.whoIsTheFirst(block.nodeId!)).toBeFalsy()
        })
        it('registers events before adding block to canvas', async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                selectable: true,
            })
            const currentCanvas = page.elementLocator(canvas.canvas)
            let isClicked = false
            block.click(() => {
                isClicked = true
            })
            canvas.add(block)
            allowMouse(canvas)
            await flush()
            await userEvent.click(currentCanvas, { position: { x: 10, y: 10 } })
            expect(isClicked).toBeTruthy()
        })
    })
    describe('Customizing')
    describe('Animations', () => {
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                x: 0,
                y: 0,
                width: 100,
                height: 100,
            })
            canvas.add(block)
            await flush()
        })
        it('should generate a unique id for every animation', () => {
            const first = block.animate({ id: undefined, x: [0, 100] })
            const second = block.animate({ id: undefined, x: [0, 100] })
            expect(first).not.toBe(second)
        })
        it('should generate a unique id across blocks on the same canvas', () => {
            const otherBlock = new Block({ width: 50, height: 50 })
            canvas.add(otherBlock)
            expect(block.animate({ id: undefined, x: [0, 100] })).not.toBe(
                otherBlock.animate({ id: undefined, x: [0, 100] })
            )
        })
        it('should use the given animation id', () => {
            expect(block.animate({ id: 'myAnimation', x: [0, 100] })).toBe(
                'myAnimation'
            )
        })
        it('should apply the final keyframe value on animationFinish', () => {
            const animationId = block.animate({ id: 'finish', x: [0, 100] })
            block.animationFinish(animationId)
            expect(block.x()).toBe(100)
        })
        it('should use the first keyframe when direction is reverse', () => {
            const animationId = block.animate({ id: 'direction', x: [40, 100] })
            block.animationDirection(animationId, 'reverse')
            block.animationFinish(animationId)
            expect(block.x()).toBe(40)
        })
        it('should resolve the last of several keyframes', () => {
            const animationId = block.animate({
                id: 'multiple',
                x: [0, 50, 200],
            })
            block.animationFinish(animationId)
            expect(block.x()).toBe(200)
        })
        it('should add the keyframe value to the underlying one', async () => {
            block.set({ x: 50 })
            await flush()
            const animationId = block.animate({
                id: 'composite',
                composite: 'add',
                x: [0, 100],
            })
            block.animationFinish(animationId)
            expect(block.x()).toBe(150)
        })
        it('should interpolate a discrete value only at the end', async () => {
            const animationId = block.animate({
                id: 'discrete',
                x: [0, 100],
                hidden: [false, true],
            })
            block.animationStart(animationId)
            await flush(3)
            expect(block.hidden()).toBe(false)

            block.animationFinish(animationId)
            expect(block.hidden()).toBe(true)
        })
        it('should not run before it is started', async () => {
            const animationId = block.animate({ id: 'auto', x: [0, 100] })
            await flush(4)
            expect(block.x()).toBe(0)
            expect(animationId).toBe('auto')
        })
        it('should animate after animationStart', async () => {
            const animationId = block.animate({ id: 'start', x: [0, 100] })
            await flush()
            block.animationStart(animationId)
            await flush(4)
            expect(block.x()).toBeGreaterThan(0)
            expect(block.x()).toBeLessThan(100)
        })
        it('should run on its own with autoStart', async () => {
            block.animate({ id: 'autoStart', autoStart: true, x: [0, 100] })
            await flush(4)
            expect(block.x()).toBeGreaterThan(0)
            expect(block.x()).toBeLessThan(100)
        })
        it('should freeze the value while stopped', async () => {
            const animationId = block.animate({ id: 'stop', x: [0, 100] })
            block.animationStart(animationId)
            await flush(4)

            block.animationStop(animationId)
            const stoppedAt = block.x()
            expect(stoppedAt).toBeGreaterThan(0)

            await flush(4)
            expect(block.x()).toBe(stoppedAt)
        })
        it('should continue after being restarted', async () => {
            const animationId = block.animate({ id: 'restart', x: [0, 100] })
            block.animationStart(animationId)
            await flush(3)

            block.animationStop(animationId)
            const stoppedAt = block.x()

            block.animationStart(animationId)
            await flush(4)
            expect(block.x()).toBeGreaterThan(stoppedAt)
        })
        it('should finish and call onFinish when iterations are reached', async () => {
            let isFinished = false
            block.animate({
                id: 'iterations',
                autoStart: true,
                duration: 40,
                iterations: 1,
                onFinish: () => {
                    isFinished = true
                },
                x: [0, 100],
            })
            expect(await waitFor(() => isFinished)).toBe(true)
            expect(block.x()).toBe(100)
        })
        it('should stop updating after removeAnimation', async () => {
            const animationId = block.animate({
                id: 'remove',
                autoStart: true,
                x: [0, 100],
            })
            await flush(3)

            block.removeAnimation(animationId)
            await flush()
            const removedAt = block.x()

            await flush(4)
            expect(block.x()).toBe(removedAt)
        })
        // keyframes go through the value converter of the animated option, so
        // every kind of value it accepts can be used as a breakpoint
        describe('keyframe value kinds', () => {
            it('should animate a number keyframe', () => {
                const animationId = block.animate({
                    id: 'number',
                    x: [0, 120],
                })
                block.animationFinish(animationId)
                expect(block.x()).toBe(120)
            })
            it('should animate a px keyframe', () => {
                const animationId = block.animate({
                    id: 'px',
                    x: ['0px', '75px'],
                })
                block.animationFinish(animationId)
                expect(block.x()).toBe(75)
            })
            it('should animate a percentage keyframe', () => {
                // 50% of the 400 wide canvas
                const animationId = block.animate({
                    id: 'percentage',
                    x: ['0%', '50%'],
                })
                block.animationFinish(animationId)
                expect(block.x()).toBe(200)
            })
            it('should animate a centimeter keyframe', () => {
                const animationId = block.animate({
                    id: 'centimeter',
                    x: ['1cm', '2cm'],
                })
                block.animationFinish(animationId)
                expect(block.x()).toBe(75.6)
            })
            it('should animate a color keyframe', () => {
                const animationId = block.animate({
                    id: 'color',
                    hotCornerBackgroundColor: ['red', 'blue'],
                })
                block.animationFinish(animationId)
                expect(block.hotCornerBackgroundColor()).toBe(
                    'rgba(0, 0, 255, 1)'
                )
            })
            it('should interpolate a color keyframe', async () => {
                const animationId = block.animate({
                    id: 'colorLerp',
                    autoStart: true,
                    hotCornerBackgroundColor: ['red', 'blue'],
                })
                await flush(4)

                const [r, , b] = rgbaToArray(
                    block.hotCornerBackgroundColor()
                ) as number[]
                expect(r).toBeLessThan(255)
                expect(b).toBeGreaterThan(0)
            })
            it('should animate a boolean keyframe', () => {
                const animationId = block.animate({
                    id: 'boolean',
                    hidden: [true, false],
                })
                block.animationFinish(animationId)
                expect(block.hidden()).toBe(false)
            })
            it('should animate a string keyframe', () => {
                const animationId = block.animate({
                    id: 'string',
                    name: ['first', 'last'],
                })
                block.animationFinish(animationId)
                expect(block.name()).toBe('last')
            })
            it('should animate an array keyframe', () => {
                const animationId = block.animate({
                    id: 'array',
                    hotCornerRadius: [
                        [10, 20],
                        [30, 40],
                    ],
                })
                block.animationFinish(animationId)
                expect(block.hotCornerRadius()).toEqual([30, 40])
            })
            it('should interpolate every item of an array keyframe', async () => {
                const animationId = block.animate({
                    id: 'arrayLerp',
                    autoStart: true,
                    hotCornerRadius: [
                        [0, 100],
                        [100, 200],
                    ],
                })
                await flush(4)

                const [first, second] = block.hotCornerRadius() as number[]
                expect(first).toBeGreaterThan(0)
                expect(first).toBeLessThan(100)
                expect(second).toBeGreaterThan(100)
                expect(second).toBeLessThan(200)
            })
            it('should pad array keyframes to the same arity', () => {
                const animationId = block.animate({
                    id: 'arrayArity',
                    hotCornerRadius: [[10], [20, 30, 40]],
                })
                block.animationFinish(animationId)
                expect(block.hotCornerRadius()).toEqual([20, 30, 40])
            })
            it('should animate an object keyframe', () => {
                const animationId = block.animate({
                    id: 'object',
                    rotatableTopLeft: [
                        { x: 0, y: 0 },
                        { x: 40, y: 60 },
                    ],
                })
                block.animationFinish(animationId)
                expect(block.rotatableTopLeft()).toEqual({ x: 40, y: 60 })
            })
            it('should interpolate every key of an object keyframe', async () => {
                const animationId = block.animate({
                    id: 'objectLerp',
                    autoStart: true,
                    rotatableTopLeft: [
                        { x: 0, y: 0 },
                        { x: 100, y: 200 },
                    ],
                })
                await flush(4)

                const { x, y } = block.rotatableTopLeft() as {
                    x: number
                    y: number
                }
                expect(x).toBeGreaterThan(0)
                expect(x).toBeLessThan(100)
                expect(y).toBeGreaterThan(0)
                expect(y).toBeLessThan(200)
            })
            it('should animate multiple options at once', () => {
                const animationId = block.animate({
                    id: 'multipleOptions',
                    x: [10, 20],
                    y: [30, 40],
                    rotate: [0, 1.2],
                })
                block.animationFinish(animationId)
                expect(block.x()).toBe(20)
                expect(block.y()).toBe(40)
                expect(block.rotate()).toBe(1.2)
            })
        })
    })
})
