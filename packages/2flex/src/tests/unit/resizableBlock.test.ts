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
