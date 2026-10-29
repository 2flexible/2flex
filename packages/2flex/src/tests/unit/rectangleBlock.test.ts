import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { page } from 'vitest/browser'
import { Block, Canvas, RectangleBlock, ShapeBlock } from '@2flexible/2flex'
import type { IRectangleOptions } from '../../shapes/RectangleBlock'
import { SELECTABLE_RUNNING_EVENT } from '../../const'
import { flush, removeCanvasElements } from './helpers'

let rectangle: RectangleBlock
let canvas: Canvas

type StrokeState = {
    lineWidth: number
    strokeStyle: string
    dash: number[]
    lineCap: CanvasLineCap
    lineJoin: CanvasLineJoin
}

// the drawing happens on the context of the block, so an own offscreen
// canvas is used to capture the state of every stroke
const createDrawingContext = (size = 200) => {
    const offscreen = new OffscreenCanvas(size, size)
    const context = offscreen.getContext('2d')!
    const strokes: StrokeState[] = []
    const stroke = context.stroke.bind(context) as (path?: Path2D) => void
    vi.spyOn(context, 'stroke').mockImplementation((path?: Path2D) => {
        strokes.push({
            lineWidth: context.lineWidth,
            strokeStyle: context.strokeStyle as string,
            dash: context.getLineDash(),
            lineCap: context.lineCap,
            lineJoin: context.lineJoin,
        })
        stroke(path)
    })
    return { context, strokes }
}

const pixelAt = (
    context: OffscreenCanvasRenderingContext2D,
    x: number,
    y: number
) => Array.from(context.getImageData(x, y, 1, 1).data)

describe('RectangleBlock', () => {
    afterEach(() => {
        removeCanvasElements()
    })

    describe('constructor', () => {
        it('should create a RectangleBlock instance', () => {
            rectangle = new RectangleBlock({})
            expect(rectangle).toBeInstanceOf(RectangleBlock)
        })
        it('should create a ShapeBlock instance', () => {
            rectangle = new RectangleBlock({})
            expect(rectangle).toBeInstanceOf(ShapeBlock)
        })
        it('should create a Block instance', () => {
            rectangle = new RectangleBlock({})
            expect(rectangle).toBeInstanceOf(Block)
        })
        it('should not throw when created with options', () => {
            expect(
                () =>
                    new RectangleBlock({
                        x: 12,
                        y: 24,
                        width: 140,
                        height: 80,
                        backgroundColor: 'red',
                    })
            ).not.toThrow()
        })
        it('should keep the options it was created with', () => {
            rectangle = new RectangleBlock({
                x: 12,
                y: 24,
                width: 140,
                height: 80,
            })
            expect(rectangle.x()).toBe(12)
            expect(rectangle.y()).toBe(24)
            expect(rectangle.width()).toBe(140)
            expect(rectangle.height()).toBe(80)
        })
    })

    describe('option defaults', () => {
        const defaults: [string, unknown][] = [
            ['backgroundColor', 'white'],
            ['borderRadius', [0, 0, 0, 0]],
            ['borderWidth', 0],
            ['borderColor', 'white'],
            ['borderStyle', 'solid'],
            ['border', undefined],
            ['borderTop', undefined],
            ['borderBottom', undefined],
            ['borderLeft', undefined],
            ['borderRight', undefined],
        ]

        for (const [option, value] of defaults) {
            it(`should default ${option} to ${value}`, () => {
                const block = new RectangleBlock({})
                expect(block[option]()).toStrictEqual(value)
            })
        }
    })

    describe('option values', () => {
        it('should convert a named background color', () => {
            const block = new RectangleBlock({})
            expect(block.backgroundColor('red')).toBe('rgba(255, 0, 0, 1)')
        })
        it('should convert a hexadecimal background color', () => {
            const block = new RectangleBlock({})
            expect(block.backgroundColor('#00ff00')).toBe('rgba(0, 255, 0, 1)')
        })
        it('should convert a named border color', () => {
            const block = new RectangleBlock({})
            expect(block.borderColor('blue')).toBe('rgba(0, 0, 255, 1)')
        })
        it('should keep the border style', () => {
            const block = new RectangleBlock({})
            expect(block.borderStyle('dotted')).toBe('dotted')
        })
        it('should keep a numeric border width', () => {
            const block = new RectangleBlock({})
            expect(block.borderWidth(4)).toBe(4)
        })
        it('should convert the border width', () => {
            const block = new RectangleBlock({})
            expect(block.borderWidth('2px')).toBe(2)
        })
    })

    describe('border radius', () => {
        beforeEach(() => {
            rectangle = new RectangleBlock({})
        })

        it('should expand a numeric radius to four corners', () => {
            expect(rectangle.borderRadius(10)).toEqual([10, 10, 10, 10])
        })
        it('should expand a single value radius', () => {
            expect(rectangle.borderRadius([6])).toEqual([6, 6, 6, 6])
        })
        it('should expand a two value radius', () => {
            // the radius follows the css shorthand order
            // [top-left, top-right, bottom-right, bottom-left]
            expect(rectangle.borderRadius([10, 4])).toEqual([10, 4, 10, 4])
        })
        it('should expand a three value radius', () => {
            expect(rectangle.borderRadius([8, 3, 1])).toEqual([8, 3, 1, 3])
        })
        it('should keep a four value radius', () => {
            expect(rectangle.borderRadius([1, 2, 3, 4])).toEqual([1, 2, 3, 4])
        })
        it('should convert a string radius', () => {
            expect(rectangle.borderRadius('10px')).toEqual([10, 10, 10, 10])
        })
        it('should convert the values of a string radius', () => {
            expect(rectangle.borderRadius(['10px', '20px'])).toEqual([
                10, 20, 10, 20,
            ])
        })
        it('should keep the default radius', () => {
            expect(rectangle.borderRadius()).toEqual([0, 0, 0, 0])
        })
    })

    describe('border options', () => {
        beforeEach(() => {
            rectangle = new RectangleBlock({})
        })

        it('should parse a css like border string', () => {
            expect(rectangle.border('3 solid #ff0000')).toEqual([
                3,
                'solid',
                'rgba(255, 0, 0, 1)',
            ])
        })
        it('should parse a dotted border string', () => {
            expect(rectangle.border('2 dotted #ff0000')).toEqual([
                2,
                'dotted',
                'rgba(255, 0, 0, 1)',
            ])
        })
        it('should parse a border tuple', () => {
            expect(rectangle.border([2, 'solid', 'red'])).toEqual([
                2,
                'solid',
                'rgba(255, 0, 0, 1)',
            ])
        })
        it('should parse a border tuple with a unit width', () => {
            expect(rectangle.border(['2px', 'dotted', '#aabbcc'])).toEqual([
                2,
                'dotted',
                'rgba(170, 187, 204, 1)',
            ])
        })
        it('should parse the top border', () => {
            expect(rectangle.borderTop('2 solid #111111')).toEqual([
                2,
                'solid',
                'rgba(17, 17, 17, 1)',
            ])
        })
        it('should parse the bottom border', () => {
            expect(rectangle.borderBottom('3 dotted #333333')).toEqual([
                3,
                'dotted',
                'rgba(51, 51, 51, 1)',
            ])
        })
        it('should parse the left border', () => {
            expect(rectangle.borderLeft('4 solid #444444')).toEqual([
                4,
                'solid',
                'rgba(68, 68, 68, 1)',
            ])
        })
        it('should parse the right border', () => {
            expect(rectangle.borderRight('2 solid #334455')).toEqual([
                2,
                'solid',
                'rgba(51, 68, 85, 1)',
            ])
        })
        it('should keep an undefined border', () => {
            expect(rectangle.border()).toBeUndefined()
            expect(rectangle.borderTop()).toBeUndefined()
            expect(rectangle.borderBottom()).toBeUndefined()
            expect(rectangle.borderLeft()).toBeUndefined()
            expect(rectangle.borderRight()).toBeUndefined()
        })
    })

    describe('drawing', () => {
        let context: OffscreenCanvasRenderingContext2D
        let strokes: StrokeState[]

        beforeEach(() => {
            rectangle = new RectangleBlock({
                x: 20,
                y: 20,
                width: 100,
                height: 100,
            })
            const drawing = createDrawingContext()
            context = drawing.context
            strokes = drawing.strokes
            rectangle.context = context
        })

        it('should not draw without a context', () => {
            const block = new RectangleBlock({
                x: 0,
                y: 0,
                width: 10,
                height: 10,
            })
            expect(() => block.draw()).not.toThrow()
        })
        it('should fill the rectangle with the background color', () => {
            const fill = vi.spyOn(context, 'fill')
            rectangle.draw()
            expect(fill).toHaveBeenCalledTimes(1)
            expect(context.fillStyle).toBe('#ffffff')
        })
        it('should stroke the whole border', () => {
            rectangle.border('4 solid #ff0000')
            rectangle.draw()
            expect(strokes).toHaveLength(1)
            expect(strokes[0].lineWidth).toBe(4)
            expect(strokes[0].strokeStyle).toBe('#ff0000')
            expect(strokes[0].dash).toEqual([])
            expect(strokes[0].lineCap).toBe('butt')
        })
        it('should draw a dotted border with a dash pattern', () => {
            rectangle.border('4 dotted #ff0000')
            rectangle.draw()
            expect(strokes).toHaveLength(1)
            expect(strokes[0].dash).toEqual([4, 4])
        })
        it('should not stroke the whole border when a side border is set', () => {
            rectangle.border('4 solid #ff0000')
            rectangle.borderTop('4 solid #00ff00')
            rectangle.draw()
            expect(strokes).toHaveLength(1)
            expect(strokes[0].strokeStyle).toBe('#00ff00')
        })
        it('should stroke every side on its own', () => {
            rectangle.borderTop('4 solid red')
            rectangle.borderBottom('4 solid blue')
            rectangle.borderLeft('4 solid yellow')
            rectangle.borderRight('4 solid green')
            rectangle.draw()
            expect(strokes).toHaveLength(4)
            expect(strokes.map((stroke) => stroke.strokeStyle)).toEqual([
                '#ff0000',
                '#0000ff',
                '#ffff00',
                '#008000',
            ])
        })
        it('should draw a dotted side with a dash pattern of its length', () => {
            rectangle.borderTop('4 dotted red')
            rectangle.draw()
            expect(strokes).toHaveLength(1)
            // the top side is as long as the width of the rectangle
            expect(strokes[0].dash).toEqual([25, 25])
        })
        it('should draw the sides with a round line join', () => {
            rectangle.borderTop('4 solid red')
            rectangle.draw()
            expect(strokes[0].lineJoin).toBe('round')
        })
        it('should draw a side without adjacent borders with a butt line cap', () => {
            rectangle.borderTop('4 solid red')
            rectangle.draw()
            expect(strokes[0].lineCap).toBe('butt')
        })
        it('should draw a side with an adjacent border with a square line cap', () => {
            rectangle.borderTop('4 solid red')
            rectangle.borderLeft('4 solid blue')
            rectangle.draw()
            expect(strokes[0].lineCap).toBe('square')
        })
        it('should draw a side with rounded corners with a butt line cap', () => {
            rectangle.borderRadius(10)
            rectangle.borderTop('4 solid red')
            rectangle.borderLeft('4 solid blue')
            rectangle.draw()
            expect(strokes[0].lineCap).toBe('butt')
        })
    })

    describe('pixels', () => {
        let context: OffscreenCanvasRenderingContext2D

        beforeEach(() => {
            rectangle = new RectangleBlock({
                x: 20,
                y: 20,
                width: 100,
                height: 100,
            })
            context = createDrawingContext().context
            rectangle.context = context
        })

        it('should paint the background color', () => {
            rectangle.backgroundColor('red')
            rectangle.draw()
            expect(pixelAt(context, 70, 70)).toEqual([255, 0, 0, 255])
        })
        it('should paint the border on the edge of the rectangle', () => {
            rectangle.backgroundColor('red')
            rectangle.border('4 solid blue')
            rectangle.draw()
            expect(pixelAt(context, 70, 20)).toEqual([0, 0, 255, 255])
        })
        it('should not paint a border on a side without a border', () => {
            rectangle.backgroundColor('red')
            rectangle.borderTop('4 solid blue')
            rectangle.draw()
            expect(pixelAt(context, 70, 20)).toEqual([0, 0, 255, 255])
            expect(pixelAt(context, 70, 119)).toEqual([255, 0, 0, 255])
        })
        it('should keep the rounded corner empty', () => {
            rectangle.backgroundColor('red')
            rectangle.borderRadius(20)
            rectangle.draw()
            expect(pixelAt(context, 70, 70)).toEqual([255, 0, 0, 255])
            expect(pixelAt(context, 21, 21)).toEqual([0, 0, 0, 0])
        })
    })

    describe('bounding box', () => {
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            rectangle = new RectangleBlock({
                x: 20,
                y: 20,
                width: 100,
                height: 100,
            })
            canvas.add(rectangle)
            await flush()
        })

        it('should expand the bounding box by the hot line stroke width', () => {
            // the hot line stroke width is 2.5 by default
            expect(rectangle.boundingBox.topLeft).toEqual({
                x: 18.75,
                y: 18.75,
            })
            expect(rectangle.boundingBox.topRight).toEqual({
                x: 121.25,
                y: 18.75,
            })
            expect(rectangle.boundingBox.bottomLeft).toEqual({
                x: 18.75,
                y: 121.25,
            })
            expect(rectangle.boundingBox.bottomRight).toEqual({
                x: 121.25,
                y: 121.25,
            })
        })
        it('should expand the bounding box by the border width', async () => {
            rectangle.border('10 solid red')
            canvas.demandInvoke(rectangle)
            await flush()
            // (2.5 + 10) / 2 = 6.25
            expect(rectangle.boundingBox.topLeft).toEqual({
                x: 13.75,
                y: 13.75,
            })
            expect(rectangle.boundingBox.bottomRight).toEqual({
                x: 126.25,
                y: 126.25,
            })
        })
    })

    describe('clip shape', () => {
        beforeEach(() => {
            rectangle = new RectangleBlock({
                x: 20,
                y: 20,
                width: 100,
                height: 100,
            })
        })

        it('should clip the rectangle without a border', () => {
            const clipPath = new Path2D()
            const rect = vi.spyOn(clipPath, 'rect')
            rectangle.__clipPath = clipPath
            rectangle.__clipShape()
            expect(rect).toHaveBeenCalledWith(20, 20, 100, 100)
        })
        it('should expand the clip by half of the border width', () => {
            rectangle.border('10 solid red')
            const clipPath = new Path2D()
            const rect = vi.spyOn(clipPath, 'rect')
            rectangle.__clipPath = clipPath
            rectangle.__clipShape()
            expect(rect).toHaveBeenCalledWith(15, 15, 110, 110)
        })
    })

    describe('hit testing', () => {
        beforeEach(async () => {
            window.scrollTo(0, 0)
            canvas = new Canvas('myCanvas', 400, 500)
            rectangle = new RectangleBlock({
                x: 20,
                y: 20,
                width: 100,
                height: 100,
                border: '10 solid red',
            })
            canvas.add(rectangle)
            await flush()
        })

        const mouseAt = (x: number, y: number) => {
            const rect = canvas.canvas.getBoundingClientRect()
            return new MouseEvent('mousedown', {
                clientX: rect.left + x,
                clientY: rect.top + y,
            })
        }

        it('should find a point inside the rectangle', () => {
            expect(rectangle.checkInBound(mouseAt(70, 70))).toBe(true)
        })
        it('should not find a point outside the rectangle', () => {
            expect(rectangle.checkInBound(mouseAt(10, 10))).toBe(false)
        })
        it('should find a point on the border', () => {
            // the border is 10 wide, so it reaches 5 out of the rectangle
            expect(rectangle.checkInBound(mouseAt(17, 70))).toBe(true)
        })
        it('should not find a point inside the bounding box but outside the shape', () => {
            // the bounding box reaches 6.25 out, the border stroke 5
            expect(rectangle.checkInBound(mouseAt(14, 70))).toBe(false)
        })
        it('should use the corners while the selecting event is active', () => {
            rectangle.__updateRunningEvent(SELECTABLE_RUNNING_EVENT, true)
            expect(rectangle.checkInBound(mouseAt(17, 70))).toBe(false)
        })
    })

    describe('visual', () => {
        beforeEach(() => {
            // a small canvas keeps the screenshots focused on the drawn rectangle
            canvas = new Canvas('myCanvas', 160, 100)
        })

        const drawRectangle = async (options: IRectangleOptions) => {
            rectangle = new RectangleBlock({
                x: 20,
                y: 20,
                width: 120,
                height: 60,
                ...options,
            })
            canvas.add(rectangle)
            await flush()
        }

        // the drawings of a table are captured one by one
        const capture = (drawings: [string, string, IRectangleOptions][]) => {
            for (const [label, name, options] of drawings)
                it(`should draw ${label}`, async () => {
                    await drawRectangle(options)
                    await expect(
                        page.elementLocator(canvas.canvas)
                    ).toMatchScreenshot(name)
                })
        }

        capture([
            [
                'the filled rectangle',
                'rectangle-filled',
                { backgroundColor: 'red' },
            ],
            [
                'the rounded rectangle',
                'rectangle-rounded',
                { backgroundColor: 'red', borderRadius: 20 },
            ],
            [
                'the solid border',
                'rectangle-border',
                { backgroundColor: 'red', border: '4 solid blue' },
            ],
            [
                'the dotted border',
                'rectangle-dotted-border',
                { backgroundColor: 'red', border: '4 dotted blue' },
            ],
            [
                'the top border',
                'rectangle-border-top',
                { backgroundColor: 'red', borderTop: '4 solid blue' },
            ],
            [
                'the left border',
                'rectangle-border-left',
                { backgroundColor: 'red', borderLeft: '4 solid blue' },
            ],
            [
                'the border with rounded corners',
                'rectangle-border-rounded',
                {
                    backgroundColor: 'red',
                    borderRadius: 20,
                    border: '4 solid blue',
                },
            ],
        ])
    })
})
