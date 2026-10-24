import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { page } from 'vitest/browser'
import { Block, Canvas, CircleBlock, ShapeBlock } from '@2flexible/2flex'
import { SELECTABLE_RUNNING_EVENT } from '../../const'
import { flush, removeCanvasElements } from './helpers'

let circle: CircleBlock
let canvas: Canvas

type CircleOptions = ConstructorParameters<typeof CircleBlock>[0]

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

describe('CircleBlock', () => {
    afterEach(() => {
        vi.restoreAllMocks()
        removeCanvasElements()
    })

    describe('constructor', () => {
        it('should create a CircleBlock instance', () => {
            circle = new CircleBlock({})
            expect(circle).toBeInstanceOf(CircleBlock)
        })
        it('should create a ShapeBlock instance', () => {
            circle = new CircleBlock({})
            expect(circle).toBeInstanceOf(ShapeBlock)
        })
        it('should create a Block instance', () => {
            circle = new CircleBlock({})
            expect(circle).toBeInstanceOf(Block)
        })
        it('should not throw when created with options', () => {
            expect(
                () =>
                    new CircleBlock({
                        x: 12,
                        y: 24,
                        width: 140,
                        height: 80,
                        backgroundColor: 'red',
                        border: '2 solid blue',
                    })
            ).not.toThrow()
        })
        it('should keep the options it was created with', () => {
            circle = new CircleBlock({
                x: 12,
                y: 24,
                width: 140,
                height: 80,
            })
            expect(circle.x()).toBe(12)
            expect(circle.y()).toBe(24)
            expect(circle.width()).toBe(140)
            expect(circle.height()).toBe(80)
        })
        it('should draw with a round line join and line cap', () => {
            circle = new CircleBlock({})
            expect(circle.lineJoin()).toBe('round')
            expect(circle.lineCap()).toBe('round')
        })
    })

    describe('option defaults', () => {
        const defaults: [string, unknown][] = [
            ['innerRadius', 0],
            ['startAngle', 0],
            ['endAngle', Math.PI * 2],
            ['backgroundColor', undefined],
            ['borderWidth', 0],
            ['borderColor', 'black'],
            ['borderStyle', 'solid'],
            ['border', undefined],
        ]

        for (const [option, value] of defaults) {
            it(`should default ${option} to ${value}`, () => {
                const block = new CircleBlock({})
                expect(block[option]()).toStrictEqual(value)
            })
        }
    })

    describe('option values', () => {
        it('should convert a named background color', () => {
            const block = new CircleBlock({})
            expect(block.backgroundColor('red')).toBe('rgba(255, 0, 0, 1)')
        })
        it('should convert a hexadecimal background color', () => {
            const block = new CircleBlock({})
            expect(block.backgroundColor('#00ff00')).toBe('rgba(0, 255, 0, 1)')
        })
        it('should convert a named border color', () => {
            const block = new CircleBlock({})
            expect(block.borderColor('blue')).toBe('rgba(0, 0, 255, 1)')
        })
        it('should keep the border style', () => {
            const block = new CircleBlock({})
            expect(block.borderStyle('dotted')).toBe('dotted')
        })
        it('should keep a numeric border width', () => {
            const block = new CircleBlock({})
            expect(block.borderWidth(4)).toBe(4)
        })
        it('should convert the border width', () => {
            const block = new CircleBlock({})
            expect(block.borderWidth('2px')).toBe(2)
        })
        it('should keep the start angle', () => {
            const block = new CircleBlock({})
            expect(block.startAngle(Math.PI)).toBe(Math.PI)
        })
        it('should keep the end angle', () => {
            const block = new CircleBlock({})
            expect(block.endAngle(Math.PI)).toBe(Math.PI)
        })
        it('should keep the inner radius', () => {
            const block = new CircleBlock({})
            expect(block.innerRadius(20)).toBe(20)
        })
        it('should convert the inner radius', () => {
            const block = new CircleBlock({})
            expect(block.innerRadius('20px')).toBe(20)
        })
    })

    describe('border options', () => {
        beforeEach(() => {
            circle = new CircleBlock({})
        })

        it('should parse a css like border string', () => {
            circle.border('3 solid #ff0000')
            expect(circle.borderWidth()).toBe(3)
            expect(circle.borderStyle()).toBe('solid')
            expect(circle.borderColor()).toBe('rgba(255, 0, 0, 1)')
        })
        it('should parse a dotted border string', () => {
            circle.border('2 dotted #ff0000')
            expect(circle.borderWidth()).toBe(2)
            expect(circle.borderStyle()).toBe('dotted')
            expect(circle.borderColor()).toBe('rgba(255, 0, 0, 1)')
        })
        it('should parse a border tuple', () => {
            circle.border([2, 'solid', 'red'])
            expect(circle.borderWidth()).toBe(2)
            expect(circle.borderStyle()).toBe('solid')
            expect(circle.borderColor()).toBe('rgba(255, 0, 0, 1)')
        })
        it('should parse a border tuple with a unit width', () => {
            circle.border(['2px', 'dotted', '#aabbcc'])
            expect(circle.borderWidth()).toBe(2)
            expect(circle.borderStyle()).toBe('dotted')
            expect(circle.borderColor()).toBe('rgba(170, 187, 204, 1)')
        })
        it('should keep an undefined border', () => {
            expect(circle.border()).toBeUndefined()
            expect(circle.borderWidth()).toBe(0)
            expect(circle.borderStyle()).toBe('solid')
            expect(circle.borderColor()).toBe('black')
        })
    })

    describe('drawing', () => {
        let context: OffscreenCanvasRenderingContext2D
        let strokes: StrokeState[]

        beforeEach(async () => {
            // the canvas calculates the real center of the circle, which the
            // drawing is built around
            canvas = new Canvas('myCanvas', 400, 500)
            circle = new CircleBlock({
                x: 20,
                y: 20,
                width: 100,
                height: 100,
            })
            canvas.add(circle)
            await flush()
            const drawing = createDrawingContext()
            context = drawing.context
            strokes = drawing.strokes
            circle.context = context
        })

        it('should not draw without a context', () => {
            const block = new CircleBlock({
                x: 0,
                y: 0,
                width: 10,
                height: 10,
            })
            expect(() => block.draw()).not.toThrow()
        })
        it('should fill the circle with the background color', () => {
            const fill = vi.spyOn(context, 'fill')
            circle.backgroundColor('red')
            circle.draw()
            expect(fill).toHaveBeenCalledTimes(1)
            expect(context.fillStyle).toBe('#ff0000')
        })
        it('should keep the fill style of the context without a background color', () => {
            // the background color is undefined, so the fill style of the
            // context is left untouched
            circle.draw()
            expect(context.fillStyle).toBe('#000000')
        })
        it('should stroke the border with its width and color', () => {
            circle.border('4 solid #ff0000')
            circle.draw()
            expect(strokes).toHaveLength(1)
            expect(strokes[0].lineWidth).toBe(4)
            expect(strokes[0].strokeStyle).toBe('#ff0000')
        })
        it('should stroke the border with the default color', () => {
            circle.draw()
            expect(strokes).toHaveLength(1)
            expect(strokes[0].strokeStyle).toBe('#000000')
            // a border width of zero is ignored by the context, so its line
            // width is kept
            expect(strokes[0].lineWidth).toBe(1)
        })
        it('should not apply a dash pattern to a dotted border', () => {
            // the border style is kept on the block, but it is never turned
            // into a dash pattern of the context
            circle.border('4 dotted #ff0000')
            circle.draw()
            expect(circle.borderStyle()).toBe('dotted')
            expect(strokes[0].dash).toEqual([])
        })
        it('should use the nonzero fill rule for a circle', () => {
            const fill = vi.spyOn(context, 'fill')
            circle.draw()
            expect(fill).toHaveBeenCalledWith(expect.any(Path2D), 'nonzero')
        })
        it('should use the evenodd fill rule for a circle with an inner radius', () => {
            const fill = vi.spyOn(context, 'fill')
            circle.innerRadius(20)
            circle.draw()
            expect(fill).toHaveBeenCalledWith(expect.any(Path2D), 'evenodd')
        })
        it('should use the nonzero fill rule for a partial circle', () => {
            const fill = vi.spyOn(context, 'fill')
            circle.endAngle(Math.PI)
            circle.draw()
            expect(fill).toHaveBeenCalledWith(expect.any(Path2D), 'nonzero')
        })
        it('should build the outer ellipse inset by the hot line stroke width', () => {
            const ellipse = vi.spyOn(Path2D.prototype, 'ellipse')
            circle.draw()
            // the hot line stroke width is 2.5 by default
            expect(ellipse).toHaveBeenCalledWith(
                70,
                70,
                47.5,
                47.5,
                0,
                0,
                Math.PI * 2
            )
        })
        it('should build the inner arc of a circle with an inner radius', () => {
            const arc = vi.spyOn(Path2D.prototype, 'arc')
            circle.innerRadius(20)
            circle.draw()
            expect(arc).toHaveBeenCalledWith(70, 70, 20, 0, Math.PI * 2)
        })
        it('should build a partial circle with an ellipse and a closing path', () => {
            const ellipse = vi.spyOn(Path2D.prototype, 'ellipse')
            const closePath = vi.spyOn(Path2D.prototype, 'closePath')
            circle.endAngle(Math.PI)
            circle.draw()
            expect(ellipse).toHaveBeenCalledWith(
                70,
                70,
                47.5,
                47.5,
                0,
                Math.PI,
                0,
                true
            )
            expect(closePath).toHaveBeenCalled()
        })
    })

    describe('pixels', () => {
        let context: OffscreenCanvasRenderingContext2D

        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            circle = new CircleBlock({
                x: 20,
                y: 20,
                width: 100,
                height: 100,
            })
            canvas.add(circle)
            await flush()
            context = createDrawingContext().context
            circle.context = context
        })

        it('should paint the background color', () => {
            circle.backgroundColor('red')
            circle.draw()
            expect(pixelAt(context, 70, 70)).toEqual([255, 0, 0, 255])
        })
        it('should paint the border on the edge of the circle', () => {
            circle.backgroundColor('red')
            circle.border('4 solid blue')
            circle.draw()
            expect(pixelAt(context, 70, 22)).toEqual([0, 0, 255, 255])
        })
        it('should not paint outside of the circle', () => {
            circle.backgroundColor('red')
            circle.border('4 solid blue')
            circle.draw()
            expect(pixelAt(context, 70, 19)).toEqual([0, 0, 0, 0])
            expect(pixelAt(context, 22, 22)).toEqual([0, 0, 0, 0])
        })
        it('should keep the inner radius empty', () => {
            circle.backgroundColor('red')
            circle.innerRadius(20)
            circle.draw()
            expect(pixelAt(context, 70, 70)).toEqual([0, 0, 0, 0])
            expect(pixelAt(context, 70, 45)).toEqual([255, 0, 0, 255])
        })
        it('should paint the lower half of a partial circle', () => {
            // the angles of the canvas run clockwise, so a circle from 0 to pi
            // is closed on the lower half
            circle.backgroundColor('red')
            circle.endAngle(Math.PI)
            circle.draw()
            expect(pixelAt(context, 70, 95)).toEqual([255, 0, 0, 255])
            expect(pixelAt(context, 70, 45)).toEqual([0, 0, 0, 0])
        })
    })

    describe('bounding box', () => {
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            circle = new CircleBlock({
                x: 20,
                y: 20,
                width: 100,
                height: 100,
            })
            canvas.add(circle)
            await flush()
        })

        it('should expand the bounding box by the hot line stroke width', () => {
            // the hot line stroke width is 2.5 by default
            expect(circle.boundingBox.topLeft).toEqual({ x: 18.75, y: 18.75 })
            expect(circle.boundingBox.topRight).toEqual({ x: 121.25, y: 18.75 })
            expect(circle.boundingBox.bottomLeft).toEqual({
                x: 18.75,
                y: 121.25,
            })
            expect(circle.boundingBox.bottomRight).toEqual({
                x: 121.25,
                y: 121.25,
            })
        })
        it('should expand the bounding box by the border width', async () => {
            circle.border('10 solid red')
            canvas.demandInvoke(circle)
            await flush()
            // (2.5 + 10) / 2 = 6.25
            expect(circle.boundingBox.topLeft).toEqual({ x: 13.75, y: 13.75 })
            expect(circle.boundingBox.bottomRight).toEqual({
                x: 126.25,
                y: 126.25,
            })
        })
    })

    describe('clip shape', () => {
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            circle = new CircleBlock({
                x: 20,
                y: 20,
                width: 100,
                height: 100,
            })
            canvas.add(circle)
            await flush()
        })

        it('should clip the circle', () => {
            const clipPath = new Path2D()
            const ellipse = vi.spyOn(clipPath, 'ellipse')
            circle.__clipPath = clipPath
            circle.__clipShape()
            expect(ellipse).toHaveBeenCalledWith(
                70,
                70,
                50,
                50,
                0,
                0,
                Math.PI * 2
            )
        })
        it('should clip a partial circle with its angles', () => {
            circle.endAngle(Math.PI)
            const clipPath = new Path2D()
            const ellipse = vi.spyOn(clipPath, 'ellipse')
            circle.__clipPath = clipPath
            circle.__clipShape()
            expect(ellipse).toHaveBeenCalledWith(70, 70, 50, 50, 0, 0, Math.PI)
        })
    })

    describe('hit testing', () => {
        beforeEach(async () => {
            window.scrollTo(0, 0)
            canvas = new Canvas('myCanvas', 400, 500)
            circle = new CircleBlock({
                x: 20,
                y: 20,
                width: 100,
                height: 100,
                border: '10 solid red',
            })
            canvas.add(circle)
            await flush()
        })

        const mouseAt = (x: number, y: number) => {
            const rect = canvas.canvas.getBoundingClientRect()
            return new MouseEvent('mousedown', {
                clientX: rect.left + x,
                clientY: rect.top + y,
            })
        }

        it('should find a point inside the circle', () => {
            expect(circle.checkInBound(mouseAt(70, 70))).toBe(true)
        })
        it('should not find a point outside the circle', () => {
            expect(circle.checkInBound(mouseAt(10, 10))).toBe(false)
        })
        it('should find a point on the border', () => {
            // the border is 10 wide, so it reaches 5 out of the circle
            expect(circle.checkInBound(mouseAt(70, 20))).toBe(true)
        })
        it('should not find a point inside the bounding box but outside the shape', () => {
            // the bounding box reaches 6.25 out, the border stroke 5
            expect(circle.checkInBound(mouseAt(70, 17))).toBe(false)
        })
        it('should use the corners while the selecting event is active', () => {
            circle.__updateRunningEvent(SELECTABLE_RUNNING_EVENT, true)
            expect(circle.checkInBound(mouseAt(25, 25))).toBe(true)
        })
    })

    describe('visual', () => {
        beforeEach(() => {
            // a small canvas keeps the screenshots focused on the drawn circle
            canvas = new Canvas('myCanvas', 160, 160)
        })

        const drawCircle = async (options: CircleOptions) => {
            circle = new CircleBlock({
                x: 20,
                y: 20,
                width: 120,
                height: 120,
                ...options,
            })
            canvas.add(circle)
            await flush()
        }

        // the drawings of a table are captured one by one
        const capture = (drawings: [string, string, CircleOptions][]) => {
            for (const [label, name, options] of drawings)
                it(`should draw ${label}`, async () => {
                    await drawCircle(options)
                    await expect(
                        page.elementLocator(canvas.canvas)
                    ).toMatchScreenshot(name)
                })
        }

        capture([
            ['the filled circle', 'circle-filled', { backgroundColor: 'red' }],
            [
                'the circle with a border',
                'circle-border',
                { backgroundColor: 'red', border: '4 solid blue' },
            ],
            [
                'the circle with an inner radius',
                'circle-donut',
                { backgroundColor: 'red', innerRadius: 40 },
            ],
            [
                'the partial circle',
                'circle-half',
                { backgroundColor: 'red', endAngle: Math.PI },
            ],
        ])
    })
})
