import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { page } from 'vitest/browser'
import { Block, Canvas } from '@2flexible/2flex'
import {
    OVERFLOW_X_SCROLL_BAR_BLOCK_NAME,
    OVERFLOW_Y_SCROLL_BAR_BLOCK_NAME,
} from '../../const'
import { drawFilledBlock, flush, removeCanvasElements } from './helpers'

let block: Block
let childBlock: Block
let canvas: Canvas

describe('OverflowBlock', () => {
    afterEach(() => {
        removeCanvasElements()
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
            expect([middleBlock.x(), middleBlock.y()]).toStrictEqual([170, 170])
            await expect(page.elementLocator(canvas.canvas)).toMatchScreenshot(
                'child-clipped-by-ancestors'
            )
        })
    })
})
