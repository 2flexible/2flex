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
})
