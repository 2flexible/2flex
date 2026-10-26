import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { page } from 'vitest/browser'
import { Block, Canvas, ShapeBlock, TextBlock } from '@2flexible/2flex'
import type { ITextOptions } from '../../shapes/TextBlock'
import { SELECTABLE_RUNNING_EVENT } from '../../const'
import { flush, removeCanvasElements, waitFor } from './helpers'

let text: TextBlock
let canvas: Canvas

// the running events of the text editing are private to the text block
const TEXT_EDITABLE_RUNNING_EVENT = 'text-editable'
const TEXT_EDITING_RUNNING_EVENT = 'text-editing'

type LetterCall = [string, number, number, number]

interface LetterSpy {
    mock: { calls: unknown[][] }
}

// the drawing happens on the context of the block, so an own offscreen
// canvas is used to capture the state of every drawn letter
const prepareDrawing = (block: TextBlock) => {
    const offscreen = new OffscreenCanvas(400, 400)
    const context = offscreen.getContext('2d')!
    block.context = context
    return context
}

// the letters are drawn one by one, so the calls of the context tell which
// text was really rendered
const letterCalls = (spy: LetterSpy): LetterCall[] =>
    spy.mock.calls.map((call) => [
        call[0],
        call[1],
        call[2],
        call[3],
    ]) as LetterCall[]

const drawnText = (spy: LetterSpy) =>
    letterCalls(spy)
        .map((call) => call[0])
        .join('')

// every line of a text starts at the left edge of the block, so the starts
// of the lines can be found by the horizontal position of the letters
const lineStarts = (calls: LetterCall[], left: number) => {
    const starts: number[] = []
    calls.forEach((call, index) => {
        if (Math.abs(call[1] - left) < 0.01) starts.push(index)
    })
    return starts
}

const mouseAt = (type: string, x: number, y: number) => {
    const rect = canvas.canvas.getBoundingClientRect()
    return new MouseEvent(type, {
        clientX: rect.left + x,
        clientY: rect.top + y,
        bubbles: true,
        cancelable: true,
    })
}

const keyDown = (key: string, options: KeyboardEventInit = {}) => {
    canvas.canvas.dispatchEvent(
        new KeyboardEvent('keydown', {
            key,
            bubbles: true,
            cancelable: true,
            ...options,
        })
    )
}

const createTextBlock = async (options: ITextOptions = {}) => {
    canvas = new Canvas('myCanvas', 400, 500)
    text = new TextBlock({
        x: 20,
        y: 20,
        width: 200,
        height: 60,
        fontSize: 20,
        color: 'black',
        text: 'hello',
        ...options,
    })
    canvas.add(text)
    await flush()
    return text
}

// the state of the context is restored after the drawing, so it has to be
// captured while the drawing is running
const captureStrokes = (context: OffscreenCanvasRenderingContext2D) => {
    const strokes: { strokeStyle: string; lineWidth: number }[] = []
    const stroke = context.stroke.bind(context) as (path?: Path2D) => void
    vi.spyOn(context, 'stroke').mockImplementation((path?: Path2D) => {
        strokes.push({
            strokeStyle: context.strokeStyle as string,
            lineWidth: context.lineWidth,
        })
        if (path) stroke(path)
        else stroke()
    })
    return strokes
}

const captureFills = (context: OffscreenCanvasRenderingContext2D) => {
    const fills: { fillStyle: string; rect: number[] }[] = []
    const fillRect = context.fillRect.bind(context)
    vi.spyOn(context, 'fillRect').mockImplementation(
        (x: number, y: number, width: number, height: number) => {
            fills.push({
                fillStyle: context.fillStyle as string,
                rect: [x, y, width, height],
            })
            fillRect(x, y, width, height)
        }
    )
    return fills
}

// the position of a letter is taken from the drawing, so a click can be
// placed right on it
const clickOnLetter = (index: number, type = 'mousedown') => {
    const context = prepareDrawing(text)
    const fillText = vi.spyOn(context, 'fillText')
    text.draw()
    const [letter, x, y, width] = letterCalls(fillText)[index]
    const height = context.measureText(letter).actualBoundingBoxAscent
    canvas.canvas.dispatchEvent(
        mouseAt(type, x + (width ?? 0) * 0.75, y - height / 2)
    )
}

describe('TextBlock', () => {
    afterEach(() => {
        vi.restoreAllMocks()
        removeCanvasElements()
    })

    describe('constructor', () => {
        it('should create a TextBlock instance', () => {
            text = new TextBlock({})
            expect(text).toBeInstanceOf(TextBlock)
        })
        it('should create a ShapeBlock instance', () => {
            text = new TextBlock({})
            expect(text).toBeInstanceOf(ShapeBlock)
        })
        it('should create a Block instance', () => {
            text = new TextBlock({})
            expect(text).toBeInstanceOf(Block)
        })
        it('should not throw when created with options', () => {
            expect(
                () =>
                    new TextBlock({
                        x: 12,
                        y: 24,
                        width: 140,
                        height: 80,
                        text: 'hello',
                        fontSize: 20,
                        color: 'red',
                    })
            ).not.toThrow()
        })
        it('should keep the options it was created with', () => {
            text = new TextBlock({
                x: 12,
                y: 24,
                width: 140,
                height: 80,
            })
            expect(text.x()).toBe(12)
            expect(text.y()).toBe(24)
            expect(text.width()).toBe(140)
            expect(text.height()).toBe(80)
        })
    })

    describe('option defaults', () => {
        const defaults: [string, unknown][] = [
            ['text', undefined],
            ['color', undefined],
            ['strokeColor', undefined],
            ['strokeWidth', undefined],
            ['fontFamily', 'sans-serif'],
            ['fontSize', 0],
            ['fontWeight', 'normal'],
            ['fontStyle', 'normal'],
            ['fontVariant', 'normal'],
            ['lineHeight', 0],
            ['letterSpacing', 0],
            ['wrap', 'nowrap'],
            ['editable', undefined],
            ['onEditable', undefined],
            ['caret', true],
        ]

        for (const [option, value] of defaults) {
            it(`should default ${option} to ${value}`, () => {
                const block = new TextBlock({})
                expect(block[option]()).toStrictEqual(value)
            })
        }
    })

    describe('option values', () => {
        it('should convert a named color', () => {
            const block = new TextBlock({})
            expect(block.color('red')).toBe('rgba(255, 0, 0, 1)')
        })
        it('should convert a hexadecimal color', () => {
            const block = new TextBlock({})
            expect(block.color('#00ff00')).toBe('rgba(0, 255, 0, 1)')
        })
        it('should convert a named stroke color', () => {
            const block = new TextBlock({})
            expect(block.strokeColor('blue')).toBe('rgba(0, 0, 255, 1)')
        })
        it('should keep the stroke width', () => {
            const block = new TextBlock({})
            expect(block.strokeWidth(4)).toBe(4)
        })
        it('should keep the font family', () => {
            const block = new TextBlock({})
            expect(block.fontFamily('monospace')).toBe('monospace')
        })
        it('should keep the font weight', () => {
            const block = new TextBlock({})
            expect(block.fontWeight('bold')).toBe('bold')
        })
        it('should keep the font style', () => {
            const block = new TextBlock({})
            expect(block.fontStyle('italic')).toBe('italic')
        })
        it('should keep the font variant', () => {
            const block = new TextBlock({})
            expect(block.fontVariant('small-caps')).toBe('small-caps')
        })
        it('should convert the font size', () => {
            const block = new TextBlock({})
            expect(block.fontSize('20px')).toBe(20)
        })
        it('should keep a numeric font size', () => {
            const block = new TextBlock({})
            expect(block.fontSize(20)).toBe(20)
        })
        it('should convert the letter spacing', () => {
            const block = new TextBlock({})
            expect(block.letterSpacing('2px')).toBe(2)
        })
        it('should keep the wrap mode', () => {
            const block = new TextBlock({})
            expect(block.wrap('word')).toBe('word')
        })
        it('should keep a numeric line height', () => {
            const block = new TextBlock({})
            expect(block.lineHeight(1.5)).toBe(1.5)
        })
        it('should convert a percentage line height', () => {
            const block = new TextBlock({})
            expect(block.lineHeight('150%')).toBe(1.5)
        })
        it('should convert a numeric line height', () => {
            const block = new TextBlock({})
            expect(block.lineHeight('2')).toBe(2)
        })
        it('should fall back to the default line height for an empty value', () => {
            const block = new TextBlock({})
            expect(block.lineHeight('')).toBe(0)
        })
        it('should fall back to the default line height for an invalid value', () => {
            const block = new TextBlock({})
            expect(block.lineHeight('abc')).toBe(0)
        })
    })

    describe('text', () => {
        it('should keep the text that was set', () => {
            const block = new TextBlock({})
            block.text('hello')
            expect(block.text()).toBe('hello')
        })
        it('should replace the text that was set before', () => {
            const block = new TextBlock({})
            block.text('hello')
            block.text('bye')
            expect(block.text()).toBe('bye')
        })
        it('should not change the text when it is read', async () => {
            await createTextBlock()
            const context = prepareDrawing(text)
            const fillText = vi.spyOn(context, 'fillText')
            text.draw()
            expect(drawnText(fillText)).toBe('hello')
            // reading the option must not touch the letters
            text.text()
            fillText.mockClear()
            text.draw()
            expect(drawnText(fillText)).toBe('hello')
        })
        it('should draw a letter for every character', async () => {
            await createTextBlock()
            const context = prepareDrawing(text)
            const fillText = vi.spyOn(context, 'fillText')
            text.draw()
            expect(drawnText(fillText)).toBe('hello')
            expect(fillText).toHaveBeenCalledTimes(5)
        })
        it('should draw the text that was set before', async () => {
            await createTextBlock()
            text.text('bye')
            const context = prepareDrawing(text)
            const fillText = vi.spyOn(context, 'fillText')
            text.draw()
            expect(drawnText(fillText)).toBe('bye')
        })
        it('should not draw anything without a text', async () => {
            await createTextBlock({ text: undefined })
            const context = prepareDrawing(text)
            const fillText = vi.spyOn(context, 'fillText')
            text.draw()
            expect(fillText).not.toHaveBeenCalled()
        })
        it('should draw the text that is set after a deletion', async () => {
            await createTextBlock({ editable: true })
            text.__updateRunningEvent(TEXT_EDITABLE_RUNNING_EVENT, true)
            keyDown('Backspace')
            text.text('bye')
            const context = prepareDrawing(text)
            const fillText = vi.spyOn(context, 'fillText')
            text.draw()
            expect(drawnText(fillText)).toBe('bye')
        })
        it('should measure the text with the context', async () => {
            await createTextBlock()
            expect(text.measureText('a')?.width).toBeGreaterThan(0)
        })
        it('should not measure without a context', () => {
            const block = new TextBlock({})
            expect(block.measureText('a')).toBeUndefined()
        })
    })

    describe('drawing', () => {
        it('should fill every letter with the color', async () => {
            await createTextBlock()
            text.color('red')
            const context = prepareDrawing(text)
            const fillText = vi.spyOn(context, 'fillText')
            text.draw()
            expect(fillText).toHaveBeenCalledTimes(5)
            expect(context.fillStyle).toBe('#ff0000')
        })
        it('should stroke every letter with the stroke color', async () => {
            await createTextBlock()
            text.strokeColor('blue')
            text.strokeWidth(3)
            const context = prepareDrawing(text)
            const strokeText = vi.spyOn(context, 'strokeText')
            text.draw()
            expect(strokeText).toHaveBeenCalledTimes(5)
            expect(context.strokeStyle).toBe('#0000ff')
            expect(context.lineWidth).toBe(3)
        })
        it('should not fill without a color', async () => {
            await createTextBlock({ color: undefined })
            const context = prepareDrawing(text)
            const fillText = vi.spyOn(context, 'fillText')
            text.draw()
            expect(fillText).not.toHaveBeenCalled()
        })
        it('should not stroke without a stroke color', async () => {
            await createTextBlock()
            const context = prepareDrawing(text)
            const strokeText = vi.spyOn(context, 'strokeText')
            text.draw()
            expect(strokeText).not.toHaveBeenCalled()
        })
        it('should apply the font to the context', async () => {
            await createTextBlock()
            text.fontFamily('monospace')
            text.fontWeight('bold')
            text.fontSize(20)
            const context = prepareDrawing(text)
            text.draw()
            expect(context.font).toContain('bold')
            expect(context.font).toContain('20px monospace')
        })
        it('should not throw without a context', () => {
            const block = new TextBlock({ text: 'hello' })
            expect(() => block.draw()).not.toThrow()
        })
        it('should draw the caret while the text is editable', async () => {
            await createTextBlock()
            text.__updateRunningEvent(TEXT_EDITABLE_RUNNING_EVENT, true)
            const context = prepareDrawing(text)
            const strokes = captureStrokes(context)
            text.draw()
            expect(strokes).toHaveLength(1)
            expect(strokes[0].strokeStyle).toBe('#ffffff')
            expect(strokes[0].lineWidth).toBe(2)
        })
        it('should draw the caret after the last letter', async () => {
            await createTextBlock()
            text.__updateRunningEvent(TEXT_EDITABLE_RUNNING_EVENT, true)
            const context = prepareDrawing(text)
            const fillText = vi.spyOn(context, 'fillText')
            const moveTo = vi.spyOn(context, 'moveTo')
            text.draw()
            const calls = letterCalls(fillText)
            const last = calls[calls.length - 1]
            expect(moveTo).toHaveBeenCalledWith(
                last[1] + (last[3] ?? 0),
                expect.any(Number)
            )
        })
        it('should not draw the caret when the caret option is off', async () => {
            await createTextBlock()
            text.caret(false)
            text.__updateRunningEvent(TEXT_EDITABLE_RUNNING_EVENT, true)
            const context = prepareDrawing(text)
            const strokes = captureStrokes(context)
            text.draw()
            expect(strokes).toHaveLength(0)
        })
        it('should fill the selection with the highlight color', async () => {
            await createTextBlock({ editable: true })
            text.__updateRunningEvent(TEXT_EDITABLE_RUNNING_EVENT, true)
            keyDown('a', { ctrlKey: true })
            const context = prepareDrawing(text)
            const fills = captureFills(context)
            text.draw()
            expect(fills).toHaveLength(1)
            expect(fills[0].fillStyle).toBe('rgba(0, 13, 255, 0.47)')
        })
        it('should not fill a highlight without a selection', async () => {
            await createTextBlock({ editable: true })
            text.__updateRunningEvent(TEXT_EDITABLE_RUNNING_EVENT, true)
            const context = prepareDrawing(text)
            const fills = captureFills(context)
            text.draw()
            expect(fills).toHaveLength(0)
        })
    })

    describe('layout', () => {
        it('should draw the letters from left to right', async () => {
            await createTextBlock()
            const context = prepareDrawing(text)
            const fillText = vi.spyOn(context, 'fillText')
            text.draw()
            const calls = letterCalls(fillText)
            expect(calls[0][1]).toBe(text.x())
            expect(calls[1][1]).toBeGreaterThan(calls[0][1])
            expect(calls[4][1]).toBeGreaterThan(calls[3][1])
        })
        it('should keep the letters on one line without a wrap', async () => {
            await createTextBlock({ text: 'abcdefgh', width: 40 })
            const context = prepareDrawing(text)
            const fillText = vi.spyOn(context, 'fillText')
            text.draw()
            const calls = letterCalls(fillText)
            expect(lineStarts(calls, text.x())).toHaveLength(1)
        })
        it('should wrap the letters onto a second line', async () => {
            await createTextBlock({
                text: 'abcdefgh',
                width: 40,
                wrap: 'letter',
            })
            const context = prepareDrawing(text)
            const fillText = vi.spyOn(context, 'fillText')
            text.draw()
            const calls = letterCalls(fillText)
            const starts = lineStarts(calls, text.x())
            expect(starts.length).toBeGreaterThan(1)
            expect(calls[calls.length - 1][2]).toBeGreaterThan(calls[0][2])
        })
        it('should break a word with a letter wrap', async () => {
            await createTextBlock({
                text: 'aa bbbb',
                width: 60,
                wrap: 'letter',
            })
            const context = prepareDrawing(text)
            const fillText = vi.spyOn(context, 'fillText')
            text.draw()
            const calls = letterCalls(fillText)
            const starts = lineStarts(calls, text.x())
            expect(starts.length).toBeGreaterThan(1)
            // the second line starts in the middle of the word
            expect(calls[starts[1] - 1][0]).not.toBe(' ')
        })
        it('should keep a word together with a word wrap', async () => {
            await createTextBlock({
                text: 'aa bbbb',
                width: 60,
                wrap: 'word',
            })
            const context = prepareDrawing(text)
            const fillText = vi.spyOn(context, 'fillText')
            text.draw()
            const calls = letterCalls(fillText)
            const starts = lineStarts(calls, text.x())
            expect(starts.length).toBeGreaterThan(1)
            // the second line starts with the first letter of the word
            expect(calls[starts[1] - 1][0]).toBe(' ')
        })
        it('should increase the line distance with the line height', async () => {
            await createTextBlock({ text: 'aa bbbb', width: 60, wrap: 'word' })
            const context = prepareDrawing(text)
            const fillText = vi.spyOn(context, 'fillText')
            text.draw()
            const withoutLineHeight = letterCalls(fillText).at(-1)![2]
            text.lineHeight(2)
            fillText.mockClear()
            text.draw()
            const withLineHeight = letterCalls(fillText).at(-1)![2]
            expect(withLineHeight).toBeGreaterThan(withoutLineHeight)
        })
    })

    describe('bounding box', () => {
        it('should start at the left edge of the first letter', async () => {
            await createTextBlock()
            expect(text.boundingBox.topLeft.x).toBeCloseTo(text.x(), 5)
        })
        it('should end at the right edge of the last letter', async () => {
            await createTextBlock()
            const context = prepareDrawing(text)
            const fillText = vi.spyOn(context, 'fillText')
            text.draw()
            const calls = letterCalls(fillText)
            const last = calls[calls.length - 1]
            expect(text.boundingBox.topRight.x).toBeCloseTo(
                last[1] + (last[3] ?? 0),
                5
            )
        })
        it('should start at the top of the letters', async () => {
            await createTextBlock()
            expect(text.boundingBox.topLeft.y).toBeCloseTo(text.y(), 5)
        })
        it('should not have a box without a text', async () => {
            await createTextBlock({ text: undefined })
            expect(text.boundingBox.topLeft).toEqual({ x: 0, y: 0 })
            expect(text.boundingBox.bottomRight).toEqual({ x: 0, y: 0 })
        })
        it('should turn the bounding box of a rotated text', async () => {
            await createTextBlock()
            const plain = {
                width:
                    text.boundingBox.bottomRight.x - text.boundingBox.topLeft.x,
                height:
                    text.boundingBox.bottomRight.y - text.boundingBox.topLeft.y,
            }
            text.rotate(Math.PI / 2)
            canvas.demandInvoke(text)
            await flush()
            const rotated = {
                width:
                    text.boundingBox.bottomRight.x - text.boundingBox.topLeft.x,
                height:
                    text.boundingBox.bottomRight.y - text.boundingBox.topLeft.y,
            }
            // the text is turned, so its box is turned as well
            expect(rotated.width).toBeCloseTo(plain.height, 5)
            expect(rotated.height).toBeCloseTo(plain.width, 5)
        })
    })

    describe('hit testing', () => {
        it('should find a point on a letter', async () => {
            await createTextBlock()
            const context = prepareDrawing(text)
            const fillText = vi.spyOn(context, 'fillText')
            text.draw()
            const [letter, x, y, width] = letterCalls(fillText)[0]
            const height = context.measureText(letter).actualBoundingBoxAscent
            const event = mouseAt(
                'mousedown',
                x + (width ?? 0) * 0.75,
                y - height / 2
            )
            expect(text.checkInBound(event)).toBe(true)
        })
        it('should not find a point outside of the letters', async () => {
            await createTextBlock()
            expect(text.checkInBound(mouseAt('mousedown', 5, 5))).toBe(false)
        })
        it('should use the corners while the selecting event is active', async () => {
            await createTextBlock()
            text.__updateRunningEvent(SELECTABLE_RUNNING_EVENT, true)
            expect(text.checkInBound(mouseAt('mousedown', 25, 25))).toBe(true)
        })
    })

    describe('editing', () => {
        beforeEach(async () => {
            await createTextBlock({ editable: true })
        })

        it('should register the editing events while it is editable', async () => {
            const addEventListener = vi.spyOn(canvas.canvas, 'addEventListener')
            await createTextBlock({ editable: true })
            const types = addEventListener.mock.calls.map(
                (call: unknown[]) => call[0]
            )
            expect(types).toContain('dblclick')
            expect(types).toContain('mousedown')
            expect(types).toContain('mousemove')
            expect(types).toContain('mouseup')
            expect(types).toContain('keydown')
        })
        it('should not handle the keys while it is not editable anymore', async () => {
            text.editable(false)
            await flush()
            text.__updateRunningEvent(TEXT_EDITABLE_RUNNING_EVENT, true)
            keyDown('x')
            const context = prepareDrawing(text)
            const fillText = vi.spyOn(context, 'fillText')
            text.draw()
            expect(drawnText(fillText)).toBe('hello')
        })
        it('should enter the editable mode on a double click on a letter', async () => {
            clickOnLetter(0, 'dblclick')
            expect(
                text.__isRunningEventActive(TEXT_EDITABLE_RUNNING_EVENT)
            ).toBe(true)
        })
        it('should ignore a double click outside of the letters', async () => {
            canvas.canvas.dispatchEvent(mouseAt('dblclick', 5, 5))
            expect(
                text.__isRunningEventActive(TEXT_EDITABLE_RUNNING_EVENT)
            ).toBe(false)
        })
        it('should select the whole text on a double click', async () => {
            clickOnLetter(0, 'dblclick')
            const context = prepareDrawing(text)
            const fills = captureFills(context)
            text.draw()
            expect(fills).toHaveLength(1)
        })
        it('should insert a typed character at the caret', async () => {
            text.__updateRunningEvent(TEXT_EDITABLE_RUNNING_EVENT, true)
            keyDown('x')
            const context = prepareDrawing(text)
            const fillText = vi.spyOn(context, 'fillText')
            text.draw()
            expect(drawnText(fillText)).toBe('hellox')
        })
        it('should delete the character before the caret on backspace', async () => {
            text.__updateRunningEvent(TEXT_EDITABLE_RUNNING_EVENT, true)
            keyDown('Backspace')
            const context = prepareDrawing(text)
            const fillText = vi.spyOn(context, 'fillText')
            text.draw()
            expect(drawnText(fillText)).toBe('hell')
        })
        it('should delete the character after the caret on delete', async () => {
            text.__updateRunningEvent(TEXT_EDITABLE_RUNNING_EVENT, true)
            keyDown('ArrowLeft')
            keyDown('Delete')
            const context = prepareDrawing(text)
            const fillText = vi.spyOn(context, 'fillText')
            text.draw()
            expect(drawnText(fillText)).toBe('hell')
        })
        it('should select everything with the ctrl and the a key', async () => {
            text.__updateRunningEvent(TEXT_EDITABLE_RUNNING_EVENT, true)
            keyDown('a', { ctrlKey: true })
            const context = prepareDrawing(text)
            const fills = captureFills(context)
            text.draw()
            expect(fills).toHaveLength(1)
        })
        it('should replace the selection with a typed character', async () => {
            text.__updateRunningEvent(TEXT_EDITABLE_RUNNING_EVENT, true)
            keyDown('a', { ctrlKey: true })
            keyDown('x')
            const context = prepareDrawing(text)
            const fillText = vi.spyOn(context, 'fillText')
            text.draw()
            expect(drawnText(fillText)).toBe('x')
        })
        it('should place the caret before the deleted letters', async () => {
            text.__updateRunningEvent(TEXT_EDITABLE_RUNNING_EVENT, true)
            keyDown('a', { ctrlKey: true })
            keyDown('Backspace')
            keyDown('x')
            const context = prepareDrawing(text)
            const fillText = vi.spyOn(context, 'fillText')
            text.draw()
            expect(drawnText(fillText)).toBe('x')
        })
        it('should copy the selection to the clipboard', async () => {
            const writeText = vi
                .spyOn(navigator.clipboard, 'writeText')
                .mockResolvedValue(undefined)
            text.__updateRunningEvent(TEXT_EDITABLE_RUNNING_EVENT, true)
            keyDown('a', { ctrlKey: true })
            keyDown('c', { ctrlKey: true })
            expect(writeText).toHaveBeenCalledWith('hello')
        })
        it('should cut the selection to the clipboard', async () => {
            const writeText = vi
                .spyOn(navigator.clipboard, 'writeText')
                .mockResolvedValue(undefined)
            text.__updateRunningEvent(TEXT_EDITABLE_RUNNING_EVENT, true)
            keyDown('a', { ctrlKey: true })
            keyDown('x', { ctrlKey: true })
            expect(writeText).toHaveBeenCalledWith('hello')
            const context = prepareDrawing(text)
            const fillText = vi.spyOn(context, 'fillText')
            text.draw()
            expect(drawnText(fillText)).toBe('')
        })
        it('should paste the content of the clipboard', async () => {
            vi.spyOn(navigator.clipboard, 'readText').mockResolvedValue('!')
            text.__updateRunningEvent(TEXT_EDITABLE_RUNNING_EVENT, true)
            keyDown('v', { ctrlKey: true })
            await flush()
            const context = prepareDrawing(text)
            const fillText = vi.spyOn(context, 'fillText')
            text.draw()
            expect(drawnText(fillText)).toBe('hello!')
        })
        it('should move the caret with the arrow keys', async () => {
            text.__updateRunningEvent(TEXT_EDITABLE_RUNNING_EVENT, true)
            keyDown('ArrowLeft')
            keyDown('x')
            const context = prepareDrawing(text)
            const fillText = vi.spyOn(context, 'fillText')
            text.draw()
            expect(drawnText(fillText)).toBe('hellxo')
        })
        it('should move the caret to the end of the text', async () => {
            text.__updateRunningEvent(TEXT_EDITABLE_RUNNING_EVENT, true)
            keyDown('ArrowLeft')
            keyDown('End')
            keyDown('x')
            const context = prepareDrawing(text)
            const fillText = vi.spyOn(context, 'fillText')
            text.draw()
            expect(drawnText(fillText)).toBe('hellox')
        })
        it('should extend the selection with the shift and the arrow keys', async () => {
            text.__updateRunningEvent(TEXT_EDITABLE_RUNNING_EVENT, true)
            keyDown('ArrowLeft', { shiftKey: true })
            const context = prepareDrawing(text)
            const fills = captureFills(context)
            text.draw()
            expect(fills).toHaveLength(1)
        })
        it('should insert a line break on enter', async () => {
            text.__updateRunningEvent(TEXT_EDITABLE_RUNNING_EVENT, true)
            keyDown('Enter')
            const context = prepareDrawing(text)
            const fillText = vi.spyOn(context, 'fillText')
            text.draw()
            expect(drawnText(fillText)).toBe('hello\n')
        })
        it('should insert spaces on tab', async () => {
            text.__updateRunningEvent(TEXT_EDITABLE_RUNNING_EVENT, true)
            keyDown('Tab')
            const context = prepareDrawing(text)
            const fillText = vi.spyOn(context, 'fillText')
            text.draw()
            expect(drawnText(fillText)).toBe('hello    ')
        })
        it('should leave the editable mode on escape', async () => {
            text.__updateRunningEvent(TEXT_EDITABLE_RUNNING_EVENT, true)
            keyDown('Escape')
            expect(
                text.__isRunningEventActive(TEXT_EDITABLE_RUNNING_EVENT)
            ).toBe(false)
        })
        it('should call the onEditable callback with the block', async () => {
            const onEditable = vi.fn()
            await createTextBlock({ editable: true, onEditable })
            text.__updateRunningEvent(TEXT_EDITABLE_RUNNING_EVENT, true)
            keyDown('x')
            expect(onEditable).toHaveBeenCalledWith(text)
        })
    })

    describe('caret animation', () => {
        it('should blink the caret while the text is editable', async () => {
            await createTextBlock({ editable: true })
            text.__updateRunningEvent(TEXT_EDITABLE_RUNNING_EVENT, true)
            canvas.demandInvoke(text)
            expect(await waitFor(() => text.caret() === false, 3000)).toBe(true)
        })
        it('should release the editing event after the hold duration', async () => {
            await createTextBlock({ editable: true })
            text.__updateRunningEvent(TEXT_EDITABLE_RUNNING_EVENT, true)
            keyDown('x')
            expect(
                text.__isRunningEventActive(TEXT_EDITING_RUNNING_EVENT)
            ).toBe(true)
            expect(
                await waitFor(
                    () =>
                        !text.__isRunningEventActive(
                            TEXT_EDITING_RUNNING_EVENT
                        ),
                    3000
                )
            ).toBe(true)
        })
    })

    describe('visual', () => {
        beforeEach(() => {
            // a small canvas keeps the screenshots focused on the drawn text
            canvas = new Canvas('myCanvas', 200, 120)
        })

        const drawText = async (options: ITextOptions) => {
            text = new TextBlock({
                x: 20,
                y: 20,
                width: 160,
                height: 60,
                fontSize: 20,
                text: 'hello',
                ...options,
            })
            canvas.add(text)
            await flush()
        }

        // the drawings of a table are captured one by one
        const capture = (drawings: [string, string, ITextOptions][]) => {
            for (const [label, name, options] of drawings)
                it(`should draw ${label}`, async () => {
                    await drawText(options)
                    await expect(
                        page.elementLocator(canvas.canvas)
                    ).toMatchScreenshot(name)
                })
        }

        capture([
            ['the text', 'text-plain', { color: 'black' }],
            [
                'the text with a stroke',
                'text-stroke',
                { color: 'black', strokeColor: 'red', strokeWidth: 1 },
            ],
            [
                'the wrapped text',
                'text-wrapped',
                {
                    color: 'black',
                    width: 60,
                    wrap: 'word',
                    text: 'hello world',
                },
            ],
        ])
    })
})
