import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { page } from 'vitest/browser'
import { Block, Canvas } from '@2flexible/2flex'
import {
    allowMouse,
    dispatchMouse,
    flush,
    removeCanvasElements,
} from './helpers'

let block: Block
let canvas: Canvas

describe('ResizableBlock', () => {
    afterEach(() => {
        removeCanvasElements()
    })
    describe('hot resizable areas', () => {
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
        // the hot areas are only stored as corners, so every test covers all of
        // them at once to keep them comparable with each other
        const hotAreas = () => [
            block.hotResizableAreaTopLeft(),
            block.hotResizableAreaTopRight(),
            block.hotResizableAreaBottomLeft(),
            block.hotResizableAreaBottomRight(),
            block.hotResizableAreaTop(),
            block.hotResizableAreaLeft(),
            block.hotResizableAreaBottom(),
            block.hotResizableAreaRight(),
        ]
        it('should set initial coordinates', () => {
            expect(hotAreas()).toMatchSnapshot()
        })
        it('should change x coordinate', async () => {
            block.set({ x: 120 })
            await flush()
            expect(hotAreas()).toMatchSnapshot()
        })
        it('should change y coordinate', async () => {
            block.set({ y: 20 })
            await flush()
            expect(hotAreas()).toMatchSnapshot()
        })
        it('should resize width', async () => {
            block.set({ width: 50 })
            await flush()
            expect(hotAreas()).toMatchSnapshot()
        })
        it('should resize height', async () => {
            block.set({ height: 50 })
            await flush()
            expect(hotAreas()).toMatchSnapshot()
        })
        it('should rotate block', async () => {
            block.set({ rotate: 1.2 })
            await flush()
            expect(hotAreas()).toMatchSnapshot()
        })
        it('should change coordinates on horizontal flip', async () => {
            block.set({
                horizontalFlipResize: true,
                width: -100,
            })
            await flush()
            expect(hotAreas()).toMatchSnapshot()
        })
        it('should change coordinates on vertical flip', async () => {
            block.set({
                verticalFlipResize: true,
                height: -100,
            })
            await flush()
            expect(hotAreas()).toMatchSnapshot()
        })
        it('should change coordinates on horizontal and vertical flip', async () => {
            block.set({
                horizontalFlipResize: true,
                verticalFlipResize: true,
                width: -100,
                height: -100,
            })
            await flush()
            expect(hotAreas()).toMatchSnapshot()
        })
    })
    describe('hot resizable area customizing', () => {
        // every hot area is a size x size square placed on the corner of the
        // block, pushed further away from it by the configured gap
        const topLeftAreaSize = () => {
            const area = block.hotResizableAreaTopLeft()
            return {
                width: area.topRight.x - area.topLeft.x,
                height: area.bottomLeft.y - area.topLeft.y,
            }
        }
        const topLeftAreaOffset = () => {
            const corner = block.cornerTopLeft()
            const area = block.hotResizableAreaTopLeft()
            return {
                x: area.topLeft.x - corner.x,
                y: area.topLeft.y - corner.y,
            }
        }
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                x: 50,
                y: 50,
                width: 100,
                height: 100,
            })
            canvas.add(block)
            await flush()
        })
        it('should use the default hot area size', () => {
            expect(block.hotResizableAreaSize()).toBe(15)
            expect(block.hotResizableAreaGap()).toBe(0)
            expect(topLeftAreaSize()).toStrictEqual({ width: 15, height: 15 })
            expect(topLeftAreaOffset()).toStrictEqual({ x: 0, y: 0 })
        })
        it('should grow the hot area by hotResizableAreaSize', async () => {
            block.set({ hotResizableAreaSize: 30 })
            await flush()
            expect(topLeftAreaSize()).toStrictEqual({ width: 30, height: 30 })
        })
        it('should move the hot area outwards by hotResizableAreaGap', async () => {
            block.set({ hotResizableAreaSize: 30, hotResizableAreaGap: 10 })
            await flush()
            expect(topLeftAreaSize()).toStrictEqual({ width: 30, height: 30 })
            expect(topLeftAreaOffset()).toStrictEqual({ x: -10, y: -10 })
        })
        it('should convert a hot area size given in px', async () => {
            block.set({ hotResizableAreaSize: '30px' })
            await flush()
            expect(block.hotResizableAreaSize()).toBe(30)
            expect(topLeftAreaSize()).toStrictEqual({ width: 30, height: 30 })
        })
    })
    describe('resizing', () => {
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
    })
})
