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

describe('DraggableBlock', () => {
    afterEach(() => {
        removeCanvasElements()
    })
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
