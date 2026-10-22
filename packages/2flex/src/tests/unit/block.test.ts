import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { Block, Canvas } from '@2flexible/2flex'
import {
    allowMouse,
    dispatchMouse,
    drawFilledBlock,
    flush,
    removeCanvasElements,
} from './helpers'

let block: Block
let canvas: Canvas

describe('Block', () => {
    afterEach(() => {
        removeCanvasElements()
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
    describe('block geometry', () => {
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
                [
                    childBlocks[0].x(),
                    childBlocks[0].y(),
                    childBlocks[0].height(),
                ],
                [
                    childBlocks[1].x(),
                    childBlocks[1].y(),
                    childBlocks[1].height(),
                ],
                [
                    childBlocks[2].x(),
                    childBlocks[2].y(),
                    childBlocks[2].height(),
                ],
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
            ]).toStrictEqual([block.rotationCenterX(), block.rotationCenterY()])
        })
        it('should inherit rotation of parent in current and cache', async () => {
            block = new Block({
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                rotate: 0.6,
            })
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
            expect([movedChild.x(), movedChild.width()]).toStrictEqual([
                100, 40,
            ])
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
            expect(scrollingChild.y()).toBe(
                block.y() + block.overflowPositionY()
            )
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
})
