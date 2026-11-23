import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
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

describe('SelectableBlock', () => {
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
    it('does not select non-selectable block', async () => {
        block.set({ selectable: false })
        await flush()
        const targetLocator = page.elementLocator(canvas.canvas)
        const element = (await targetLocator.element()) as HTMLElement

        dispatchMouse(element, 'mousedown', 10, 10, 1)

        expect(canvas.whoIsTheFirst(block.nodeId!)).toBeFalsy()
    })
    it('adds events once and ignores them when selectable is toggled false then true', async () => {
        const freshBlock = new Block({
            x: 150,
            y: 150,
            width: 100,
            height: 100,
        })
        canvas.add(freshBlock)
        await flush()

        const addEventSpy = vi.spyOn(freshBlock, '__addEvent')
        const removeEventSpy = vi.spyOn(freshBlock, '__removeEvent')

        freshBlock.set({ selectable: true })
        await flush()
        expect(addEventSpy).toHaveBeenCalledTimes(2)
        expect(removeEventSpy).not.toHaveBeenCalled()

        freshBlock.set({ selectable: false })
        await flush()
        expect(removeEventSpy).not.toHaveBeenCalled()

        const targetLocator = page.elementLocator(canvas.canvas)
        const element = (await targetLocator.element()) as HTMLElement
        dispatchMouse(element, 'mousedown', 160, 160, 1)
        dispatchMouse(element, 'mouseup', 160, 160)
        expect(canvas.whoIsTheFirst(freshBlock.nodeId!)).toBeFalsy()

        freshBlock.set({ selectable: true })
        await flush()
        expect(addEventSpy).toHaveBeenCalledTimes(2)
        expect(removeEventSpy).not.toHaveBeenCalled()

        dispatchMouse(element, 'mousedown', 160, 160, 1)
        expect(canvas.whoIsTheFirst(freshBlock.nodeId!)).toBeTruthy()
    })
})
