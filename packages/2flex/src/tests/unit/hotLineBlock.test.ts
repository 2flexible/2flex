import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { page } from 'vitest/browser'
import { Block, Canvas } from '@2flexible/2flex'
import { HOT_LINE_BLOCK_NAME } from '../../const'
import {
    allowMouse,
    dispatchMouse,
    flush,
    removeCanvasElements,
} from './helpers'

let block: Block
let canvas: Canvas

describe('HotLineBlock', () => {
    afterEach(() => {
        removeCanvasElements()
    })
    // the hot lines are drawn by an internal block which is added to the
    // canvas scene next to the block itself
    const hotLineBlock = () => canvas.find({ name: HOT_LINE_BLOCK_NAME })[0]
    const selectBlock = async () => {
        const element = (await page
            .elementLocator(canvas.canvas)
            .element()) as HTMLElement
        // the pointer has to land inside the block, which starts at 50, 50
        dispatchMouse(element, 'mousedown', 60, 60, 1)
        dispatchMouse(element, 'mouseup', 60, 60)
        await flush()
    }
    describe('hot lines', () => {
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                x: 50,
                y: 50,
                width: 100,
                height: 100,
                selectable: true,
            })
            canvas.add(block)
            allowMouse(canvas)
            await flush()
        })
        it('should not create the hot line block while hotLines is off', () => {
            // reading the option is what triggers the creation of the block
            expect(block.hotLines()).toBe(false)
            expect(canvas.find({ name: HOT_LINE_BLOCK_NAME })).toHaveLength(0)
        })
        it('should create the hot line block while hotLines is on', () => {
            block.set({ hotLines: true })
            expect(block.hotLines()).toBe(true)
            expect(canvas.find({ name: HOT_LINE_BLOCK_NAME })).toHaveLength(1)
        })
        it('should keep a single hot line block across reads', () => {
            block.set({ hotLines: true })
            block.hotLines()
            block.hotLines()
            expect(canvas.find({ name: HOT_LINE_BLOCK_NAME })).toHaveLength(1)
        })
        it('should keep the hot line block out of the child nodes', () => {
            block.set({ hotLines: true })
            block.hotLines()
            expect([...block.childNodes]).toHaveLength(0)
            expect(canvas.find({ name: HOT_LINE_BLOCK_NAME })).toHaveLength(1)
        })
        it('should size the hot line block by hotCornerSize and hotCornerStrokeWidth', async () => {
            block.set({
                hotLines: true,
                hotCornerSize: 20,
                hotCornerStrokeWidth: 4,
            })
            block.hotLines()
            await flush()
            // the hot lines have to stick out of the bounding box by half of
            // the corner size plus the stroke around it
            const boundingBox = block.boundingBox
            expect(hotLineBlock().x()).toBeCloseTo(boundingBox.topLeft.x - 12)
            expect(hotLineBlock().y()).toBeCloseTo(boundingBox.topLeft.y - 12)
            expect(hotLineBlock().width()).toBeCloseTo(
                boundingBox.bottomRight.x - boundingBox.topLeft.x + 24
            )
            expect(hotLineBlock().height()).toBeCloseTo(
                boundingBox.bottomRight.y - boundingBox.topLeft.y + 24
            )
        })
        it('should follow the block while it moves and resizes', async () => {
            block.set({ hotLines: true })
            block.hotLines()
            await flush()
            const before = hotLineBlock()
            expect(before.x()).toBeCloseTo(block.boundingBox.topLeft.x - 6.25)

            block.set({ x: 120, y: 80, width: 200, height: 150 })
            await flush()

            expect(hotLineBlock().x()).toBeCloseTo(
                block.boundingBox.topLeft.x - 6.25
            )
            expect(hotLineBlock().y()).toBeCloseTo(
                block.boundingBox.topLeft.y - 6.25
            )
            expect(hotLineBlock().width()).toBeCloseTo(
                block.boundingBox.bottomRight.x -
                    block.boundingBox.topLeft.x +
                    12.5
            )
            // the very same block instance is reused, not recreated
            expect(hotLineBlock()).toBe(before)
        })
    })
    describe('hot line drawing', () => {
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                x: 50,
                y: 50,
                width: 100,
                height: 100,
                hotLines: true,
                selectable: true,
            })
            canvas.add(block)
            allowMouse(canvas)
            await flush()
        })
        it('should not draw hot lines while the block is unselected', async () => {
            block.hotLines()
            await flush()
            await expect(page.elementLocator(canvas.canvas)).toMatchScreenshot(
                'hot-lines-not-drawn-while-unselected'
            )
        })
        it('should draw hot lines with the default styles once selected', async () => {
            await selectBlock()
            await expect(page.elementLocator(canvas.canvas)).toMatchScreenshot(
                'hot-lines-drawn-while-selected'
            )
        })
        it('should draw hot lines with customized styles', async () => {
            block.set({
                hotCornerRadius: [8],
                hotCornerBackgroundColor: 'red',
                hotCornerStrokeColor: 'green',
                hotCornerStrokeWidth: 4,
                hotLineStrokeColor: 'purple',
                hotLineStrokeWidth: 6,
            })
            await selectBlock()
            await expect(page.elementLocator(canvas.canvas)).toMatchScreenshot(
                'hot-corners-custom-styles'
            )
        })
        it('should accept a numeric hotCornerRadius', async () => {
            block.set({ hotCornerRadius: 6 })
            await selectBlock()
            block.hotLines()
            expect(() => hotLineBlock().render()).not.toThrow()
        })
        it('should stop drawing hot lines after hotLines is turned off', async () => {
            await selectBlock()
            block.set({ hotLines: false })
            await flush()
            expect(block.hotLines()).toBe(false)
            await expect(page.elementLocator(canvas.canvas)).toMatchScreenshot(
                'hot-lines-not-drawn-after-disabled'
            )
        })
    })
})
