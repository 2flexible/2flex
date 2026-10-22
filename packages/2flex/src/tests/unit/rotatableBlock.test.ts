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
