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

describe('RotatableBlock', () => {
    afterEach(() => {
        removeCanvasElements()
    })
    describe('hot rotatable areas', () => {
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
            block.hotRotatableAreaTopLeft(),
            block.hotRotatableAreaTopRight(),
            block.hotRotatableAreaBottomLeft(),
            block.hotRotatableAreaBottomRight(),
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
    describe('hot rotatable area customizing', () => {
        // every hot area is a size x size square placed on the corner of the
        // block, pushed further away from it by the configured gap
        const topLeftAreaSize = () => {
            const area = block.hotRotatableAreaTopLeft()
            return {
                width: area.topRight.x - area.topLeft.x,
                height: area.bottomLeft.y - area.topLeft.y,
            }
        }
        const topLeftAreaOffset = () => {
            const corner = block.cornerTopLeft()
            const area = block.hotRotatableAreaTopLeft()
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
            expect(block.hotRotatableAreaSize()).toBe(15)
            expect(block.hotRotatableAreaGap()).toBe(0)
            expect(topLeftAreaSize()).toStrictEqual({ width: 15, height: 15 })
            expect(topLeftAreaOffset()).toStrictEqual({ x: -15, y: -15 })
        })
        it('should grow the hot area by hotRotatableAreaSize', async () => {
            block.set({ hotRotatableAreaSize: 30 })
            await flush()
            expect(topLeftAreaSize()).toStrictEqual({ width: 30, height: 30 })
        })
        it('should move the hot area outwards by hotRotatableAreaGap', async () => {
            block.set({ hotRotatableAreaSize: 30, hotRotatableAreaGap: 10 })
            await flush()
            expect(topLeftAreaSize()).toStrictEqual({ width: 30, height: 30 })
            // the area hangs outside of the corner, so the gap is added to the
            // size on both axes
            expect(topLeftAreaOffset()).toStrictEqual({ x: -40, y: -40 })
        })
        it('should convert a hot area size given in px', async () => {
            block.set({ hotRotatableAreaSize: '30px' })
            await flush()
            expect(block.hotRotatableAreaSize()).toBe(30)
            expect(topLeftAreaSize()).toStrictEqual({ width: 30, height: 30 })
        })
    })
    describe('rotating', () => {
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
    })
})
