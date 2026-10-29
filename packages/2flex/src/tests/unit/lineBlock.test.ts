import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { page } from 'vitest/browser'
import {
    Block,
    Canvas,
    LineBlock,
    RectangleBlock,
    ShapeBlock,
} from '@2flexible/2flex'
import type { ILineOptions } from '../../shapes/LineBlock'
import {
    DRAGGABLE_RUNNING_EVENT,
    RESIZABLE_RUNNING_EVENT,
    ROTATABLE_RUNNING_EVENT,
    SELECTABLE_RUNNING_EVENT,
} from '../../const'
import { allowMouse, flush, removeCanvasElements } from './helpers'

let line: LineBlock
let canvas: Canvas

// the editable mode of the line is private to the line block
const EDITABLE_RUNNING_EVENT = 'editable'

type PointOptions = NonNullable<ILineOptions['controlPoints']>[number]

type DrawState = {
    lineWidth: number
    strokeStyle: string
    fillStyle: string
}

// the drawing happens on the context of the block, so an own offscreen
// canvas is used to capture the state of every stroke and fill
const createDrawingContext = (size = 300) => {
    const offscreen = new OffscreenCanvas(size, size)
    const context = offscreen.getContext('2d')!
    const strokes: DrawState[] = []
    const fills: DrawState[] = []
    const stroke = context.stroke.bind(context) as (path?: Path2D) => void
    const fill = context.fill.bind(context) as (path?: Path2D) => void
    vi.spyOn(context, 'stroke').mockImplementation((path?: Path2D) => {
        strokes.push({
            lineWidth: context.lineWidth,
            strokeStyle: context.strokeStyle as string,
            fillStyle: context.fillStyle as string,
        })
        stroke(path)
    })
    vi.spyOn(context, 'fill').mockImplementation((path?: Path2D) => {
        fills.push({
            lineWidth: context.lineWidth,
            strokeStyle: context.strokeStyle as string,
            fillStyle: context.fillStyle as string,
        })
        fill(path)
    })
    return { context, strokes, fills }
}

const pixelAt = (
    context: OffscreenCanvasRenderingContext2D,
    x: number,
    y: number
) => Array.from(context.getImageData(x, y, 1, 1).data)

// the mouse events are placed on the canvas, so the position of the canvas
// on the page has to be taken into account
const mouseAt = (type: string, x: number, y: number) => {
    const rect = canvas.canvas.getBoundingClientRect()
    return new MouseEvent(type, {
        clientX: rect.left + x,
        clientY: rect.top + y,
        bubbles: true,
        cancelable: true,
    })
}

const dispatchMouse = (type: string, x: number, y: number) =>
    canvas.canvas.dispatchEvent(mouseAt(type, x, y))

// the points of a line are only built when they are read, so the block has
// to be added to a canvas to get its coordinates calculated
const createLine = async (options: ILineOptions = {}) => {
    canvas = new Canvas('myCanvas', 400, 500)
    line = new LineBlock({
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        ...options,
    })
    canvas.add(line)
    await flush()
    return line
}

describe('LineBlock', () => {
    afterEach(() => {
        vi.restoreAllMocks()
        removeCanvasElements()
    })

    describe('constructor', () => {
        it('should create a LineBlock instance', () => {
            line = new LineBlock({})
            expect(line).toBeInstanceOf(LineBlock)
        })
        it('should create a ShapeBlock instance', () => {
            line = new LineBlock({})
            expect(line).toBeInstanceOf(ShapeBlock)
        })
        it('should create a Block instance', () => {
            line = new LineBlock({})
            expect(line).toBeInstanceOf(Block)
        })
        it('should not throw when created with options', () => {
            expect(
                () =>
                    new LineBlock({
                        x: 12,
                        y: 24,
                        width: 140,
                        height: 80,
                        lineColor: 'red',
                        lineWidth: 2,
                    })
            ).not.toThrow()
        })
        it('should keep the options it was created with', () => {
            line = new LineBlock({
                x: 12,
                y: 24,
                width: 140,
                height: 80,
            })
            expect(line.x()).toBe(12)
            expect(line.y()).toBe(24)
            expect(line.width()).toBe(140)
            expect(line.height()).toBe(80)
        })
    })

    describe('option defaults', () => {
        const defaults: [string, unknown][] = [
            ['controlPoints', []],
            ['stickyStart', undefined],
            ['stickyEnd', undefined],
            ['controlPointsSize', 5],
            ['controlLineWidth', 2],
            ['controlPointBackgroundColor', 'white'],
            ['controlPointStrokeColor', 'blue'],
            ['closeLine', undefined],
            ['lineColor', undefined],
            ['fillColor', undefined],
            ['editable', false],
        ]

        for (const [option, value] of defaults) {
            it(`should default ${option} to ${value}`, () => {
                const block = new LineBlock({})
                expect(block[option]()).toStrictEqual(value)
            })
        }
    })

    describe('option values', () => {
        it('should convert a named line color', () => {
            const block = new LineBlock({})
            expect(block.lineColor('red')).toBe('rgba(255, 0, 0, 1)')
        })
        it('should convert a hexadecimal line color', () => {
            const block = new LineBlock({})
            expect(block.lineColor('#00ff00')).toBe('rgba(0, 255, 0, 1)')
        })
        it('should convert a named fill color', () => {
            const block = new LineBlock({})
            expect(block.fillColor('blue')).toBe('rgba(0, 0, 255, 1)')
        })
        it('should keep an undefined line color', () => {
            const block = new LineBlock({})
            expect(block.lineColor()).toBeUndefined()
        })
        it('should convert the control point size', () => {
            const block = new LineBlock({})
            expect(block.controlPointsSize('10px')).toBe(10)
        })
        it('should keep the control line width', () => {
            const block = new LineBlock({})
            expect(block.controlLineWidth(4)).toBe(4)
        })
        it('should convert a named control point background color', () => {
            const block = new LineBlock({})
            expect(block.controlPointBackgroundColor('red')).toBe(
                'rgba(255, 0, 0, 1)'
            )
        })
        it('should convert a named control point stroke color', () => {
            const block = new LineBlock({})
            expect(block.controlPointStrokeColor('#0000ff')).toBe(
                'rgba(0, 0, 255, 1)'
            )
        })
    })

    describe('control points', () => {
        it('should create an option for every property of a point', async () => {
            await createLine({
                controlPoints: [{ startX: 0, startY: 0, endX: 100, endY: 100 }],
            })
            expect(line.getOptionCurrent('startX-0')).toBe(0)
            expect(line.getOptionCurrent('startY-0')).toBe(0)
            expect(line.getOptionCurrent('endX-0')).toBe(100)
            expect(line.getOptionCurrent('endY-0')).toBe(100)
        })
        it('should calculate the control points of a point', async () => {
            await createLine({
                controlPoints: [{ startX: 0, startY: 0, endX: 100, endY: 100 }],
            })
            // the control points follow the ends of the line by default
            expect(line.getOptionCurrent('startControlX-0')).toBe(0)
            expect(line.getOptionCurrent('startControlY-0')).toBe(0)
            expect(line.getOptionCurrent('endControlX-0')).toBe(100)
            expect(line.getOptionCurrent('endControlY-0')).toBe(100)
        })
        it('should keep the given control points of a point', async () => {
            await createLine({
                controlPoints: [
                    {
                        startX: 0,
                        startY: 0,
                        endX: 100,
                        endY: 100,
                        startControlX: 0,
                        startControlY: 50,
                        endControlX: 100,
                        endControlY: 50,
                    },
                ],
            })
            expect(line.getOptionCurrent('startControlY-0')).toBe(50)
            expect(line.getOptionCurrent('endControlY-0')).toBe(50)
        })
        it('should start the next point at the end of the previous one', async () => {
            await createLine({
                controlPoints: [
                    { startX: 0, startY: 0, endX: 60, endY: 0 },
                    { startX: 0, startY: 0, endX: 100, endY: 50 },
                ],
            })
            expect(line.getOptionCurrent('endX-0')).toBe(60)
            expect(line.getOptionCurrent('startX-1')).toBe(60)
        })
        it('should add a control point to the tail', async () => {
            await createLine({
                controlPoints: [{ startX: 0, startY: 0, endX: 50, endY: 0 }],
            })
            line.addControlPointToTail({
                startX: 50,
                startY: 0,
                endX: 100,
                endY: 50,
            })
            await flush()
            expect(line.getOptionCurrent('endX-1')).toBe(100)
            expect(line.getOptionCurrent('endY-1')).toBe(50)
        })
        it('should add a control point to the head', async () => {
            await createLine({
                controlPoints: [{ startX: 50, startY: 0, endX: 100, endY: 0 }],
            })
            line.addControlPointToHead({
                startX: 0,
                startY: 0,
                endX: 50,
                endY: 0,
            })
            await flush()
            expect(line.getOptionCurrent('endX-1')).toBe(50)
        })
        it('should add a control point after the given one', async () => {
            await createLine({
                controlPoints: [
                    { startX: 0, startY: 0, endX: 50, endY: 0 },
                    { startX: 50, startY: 0, endX: 100, endY: 0 },
                ],
            })
            line.addControlPoint(
                { startX: 25, startY: 25, endX: 75, endY: 25 },
                0
            )
            await flush()
            // the new point gets the next free id
            expect(line.getOptionCurrent('endX-2')).toBe(75)
            expect(line.getOptionCurrent('endY-2')).toBe(25)
        })
        it('should add a control point to the tail without a known index', async () => {
            await createLine({
                controlPoints: [{ startX: 0, startY: 0, endX: 50, endY: 0 }],
            })
            line.addControlPoint(
                { startX: 50, startY: 0, endX: 100, endY: 0 },
                99
            )
            await flush()
            expect(line.getOptionCurrent('endX-1')).toBe(100)
        })
        it('should remove a control point', async () => {
            await createLine({
                controlPoints: [
                    { startX: 0, startY: 0, endX: 50, endY: 0 },
                    { startX: 50, startY: 0, endX: 100, endY: 0 },
                ],
            })
            line.removeControlPoint(0)
            await flush()
            const bezier = vi.spyOn(Path2D.prototype, 'bezierCurveTo')
            line.draw()
            // the line is built of the remaining point only
            expect(bezier).toHaveBeenCalledTimes(1)
        })
        it('should remove the control point of the tail', async () => {
            await createLine({
                controlPoints: [
                    { startX: 0, startY: 0, endX: 50, endY: 0 },
                    { startX: 50, startY: 0, endX: 100, endY: 0 },
                ],
            })
            line.removeControlPointTail()
            await flush()
            const bezier = vi.spyOn(Path2D.prototype, 'bezierCurveTo')
            line.draw()
            expect(bezier).toHaveBeenCalledTimes(1)
        })
        it('should remove the control point of the head', async () => {
            await createLine({
                controlPoints: [
                    { startX: 0, startY: 0, endX: 50, endY: 0 },
                    { startX: 50, startY: 0, endX: 100, endY: 0 },
                ],
            })
            line.removeControlPointHead()
            await flush()
            const bezier = vi.spyOn(Path2D.prototype, 'bezierCurveTo')
            line.draw()
            expect(bezier).toHaveBeenCalledTimes(1)
        })
        it('should replace the control points of the line', async () => {
            await createLine({
                controlPoints: [{ startX: 0, startY: 0, endX: 50, endY: 0 }],
            })
            line.controlPoints([{ startX: 10, startY: 10, endX: 20, endY: 20 }])
            await flush()
            expect(line.getOptionCurrent('startX-0')).toBe(10)
            expect(line.getOptionCurrent('endX-0')).toBe(20)
        })
    })

    describe('coordinates', () => {
        it('should calculate the box of the block from its points', async () => {
            await createLine({
                controlPoints: [{ startX: 0, startY: 0, endX: 100, endY: 100 }],
            })
            // the control line width of 2 expands the box on every side
            expect(line.x()).toBe(-1)
            expect(line.y()).toBe(-1)
            expect(line.width()).toBe(101)
            expect(line.height()).toBe(101)
        })
        it('should calculate the bounding box from its points', async () => {
            await createLine({
                controlPoints: [{ startX: 0, startY: 0, endX: 100, endY: 100 }],
            })
            expect(line.boundingBox.topLeft).toEqual({ x: 0, y: 0 })
            expect(line.boundingBox.topRight).toEqual({ x: 100, y: 0 })
            expect(line.boundingBox.bottomLeft).toEqual({ x: 0, y: 100 })
            expect(line.boundingBox.bottomRight).toEqual({ x: 100, y: 100 })
        })
        it('should calculate the bounding box of a curved line', async () => {
            await createLine({
                controlPoints: [
                    {
                        startX: 0,
                        startY: 0,
                        endX: 100,
                        endY: 0,
                        startControlX: 0,
                        startControlY: 100,
                        endControlX: 100,
                        endControlY: 100,
                    },
                ],
            })
            // the control points are part of the box of the line
            expect(line.boundingBox.topLeft).toEqual({ x: 0, y: 0 })
            expect(line.boundingBox.bottomRight).toEqual({ x: 100, y: 100 })
        })
        it('should start the line at the position of the block', async () => {
            await createLine({
                x: 20,
                y: 30,
                width: 100,
                height: 100,
                controlPoints: [{}],
            })
            expect(line.getOptionCurrent('startX-0')).toBe(20)
            expect(line.getOptionCurrent('startY-0')).toBe(30)
            expect(line.getOptionCurrent('endX-0')).toBe(100)
            expect(line.getOptionCurrent('endY-0')).toBe(100)
        })
    })

    describe('drawing', () => {
        let context: OffscreenCanvasRenderingContext2D
        let strokes: DrawState[]
        let fills: DrawState[]

        beforeEach(async () => {
            await createLine({
                controlPoints: [{ startX: 0, startY: 0, endX: 100, endY: 100 }],
            })
            const drawing = createDrawingContext()
            context = drawing.context
            strokes = drawing.strokes
            fills = drawing.fills
            line.context = context
        })

        it('should not draw without a context', () => {
            const block = new LineBlock({})
            expect(() => block.draw()).not.toThrow()
        })
        it('should keep the path of the line', () => {
            line.draw()
            expect(line.path).toBeInstanceOf(Path2D)
        })
        it('should build the path of the line', () => {
            const moveTo = vi.spyOn(Path2D.prototype, 'moveTo')
            const bezier = vi.spyOn(Path2D.prototype, 'bezierCurveTo')
            line.draw()
            expect(moveTo).toHaveBeenCalledWith(0, 0)
            // the control points follow the ends of the line by default
            expect(bezier).toHaveBeenCalledWith(0, 0, 100, 100, 100, 100)
        })
        it('should build the path of a curved line', () => {
            line.setOptionCurrent('startControlY-0', 50)
            line.setOptionCurrent('endControlY-0', 50)
            const bezier = vi.spyOn(Path2D.prototype, 'bezierCurveTo')
            line.draw()
            expect(bezier).toHaveBeenCalledWith(0, 50, 100, 50, 100, 100)
        })
        it('should draw a straight line without calculated control points', () => {
            const block = new LineBlock({})
            block.controlPoints([
                { startX: 0, startY: 0, endX: 100, endY: 100 },
            ])
            const lineTo = vi.spyOn(Path2D.prototype, 'lineTo')
            block.draw()
            expect(lineTo).toHaveBeenCalledWith(100, 100)
        })
        it('should stroke the line with its color', () => {
            line.lineColor('red')
            line.draw()
            expect(strokes).toHaveLength(1)
            expect(strokes[0].strokeStyle).toBe('#ff0000')
        })
        it('should fill the line with its color', () => {
            line.fillColor('blue')
            line.draw()
            expect(fills).toHaveLength(1)
            expect(fills[0].fillStyle).toBe('#0000ff')
        })
        it('should stroke the line with its width', () => {
            line.lineWidth(4)
            line.draw()
            expect(strokes[0].lineWidth).toBe(4)
        })
        it('should close the path of a closed line', () => {
            const closePath = vi.spyOn(Path2D.prototype, 'closePath')
            line.closeLine(true)
            line.draw()
            expect(closePath).toHaveBeenCalled()
        })
        it('should not close the path of an open line', () => {
            const closePath = vi.spyOn(Path2D.prototype, 'closePath')
            line.draw()
            expect(closePath).not.toHaveBeenCalled()
        })
    })

    describe('pixels', () => {
        it('should paint the line with its color', () => {
            const block = new LineBlock({})
            block.controlPoints([
                { startX: 0, startY: 0, endX: 100, endY: 100 },
            ])
            block.lineColor('red')
            block.lineWidth(4)
            const context = createDrawingContext().context
            block.context = context
            block.draw()
            expect(pixelAt(context, 50, 50)).toEqual([255, 0, 0, 255])
        })
        it('should fill the closed line with its color', () => {
            const block = new LineBlock({})
            block.controlPoints([
                {
                    startX: 0,
                    startY: 0,
                    endX: 100,
                    endY: 0,
                    startControlX: 0,
                    startControlY: 100,
                    endControlX: 100,
                    endControlY: 100,
                },
            ])
            block.fillColor('blue')
            block.closeLine(true)
            const context = createDrawingContext().context
            block.context = context
            block.draw()
            expect(pixelAt(context, 50, 50)).toEqual([0, 0, 255, 255])
        })
        it('should not paint outside of the line', () => {
            const block = new LineBlock({})
            block.controlPoints([
                { startX: 0, startY: 0, endX: 100, endY: 100 },
            ])
            block.lineColor('red')
            block.lineWidth(4)
            const context = createDrawingContext().context
            block.context = context
            block.draw()
            expect(pixelAt(context, 50, 30)).toEqual([0, 0, 0, 0])
        })
    })

    describe('hit testing', () => {
        beforeEach(async () => {
            window.scrollTo(0, 0)
            await createLine({
                lineWidth: 4,
                controlPoints: [
                    { startX: 20, startY: 20, endX: 120, endY: 120 },
                ],
            })
        })

        it('should find a point on the line', () => {
            expect(line.checkInBound(mouseAt('mousedown', 70, 70))).toBe(true)
        })
        it('should not find a point away from the line', () => {
            expect(line.checkInBound(mouseAt('mousedown', 70, 30))).toBe(false)
        })
        it('should use the corners while the selecting event is active', () => {
            line.__updateRunningEvent(SELECTABLE_RUNNING_EVENT, true)
            expect(line.checkInBound(mouseAt('mousedown', 70, 30))).toBe(true)
        })
    })

    describe('editing', () => {
        beforeEach(async () => {
            await createLine({
                selectable: true,
                editable: true,
                lineWidth: 4,
                controlPoints: [
                    { startX: 20, startY: 20, endX: 120, endY: 120 },
                ],
            })
            allowMouse(canvas)
        })

        it('should register the editing events while it is editable', async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            const addEventListener = vi.spyOn(canvas.canvas, 'addEventListener')
            line = new LineBlock({
                editable: true,
                controlPoints: [
                    { startX: 20, startY: 20, endX: 120, endY: 120 },
                ],
            })
            canvas.add(line)
            await flush()
            const types = addEventListener.mock.calls.map(
                (call: unknown[]) => call[0]
            )
            expect(types).toContain('dblclick')
            expect(types).toContain('click')
        })
        it('should enter the editable mode on a double click on the line', () => {
            dispatchMouse('dblclick', 70, 70)
            expect(line.__isRunningEventActive(EDITABLE_RUNNING_EVENT)).toBe(
                true
            )
        })
        it('should ignore a double click away from the line', () => {
            dispatchMouse('dblclick', 70, 30)
            expect(line.__isRunningEventActive(EDITABLE_RUNNING_EVENT)).toBe(
                false
            )
        })
        it('should leave the editable mode on a click away from the line', () => {
            dispatchMouse('dblclick', 70, 70)
            expect(line.__isRunningEventActive(EDITABLE_RUNNING_EVENT)).toBe(
                true
            )
            dispatchMouse('click', 300, 300)
            expect(line.__isRunningEventActive(EDITABLE_RUNNING_EVENT)).toBe(
                false
            )
        })
        it('should keep the editable mode on a click on the line', () => {
            dispatchMouse('dblclick', 70, 70)
            dispatchMouse('click', 70, 70)
            expect(line.__isRunningEventActive(EDITABLE_RUNNING_EVENT)).toBe(
                true
            )
        })
        it('should hide the hot lines while it is editable', async () => {
            expect(line.hotLines()).toBe(true)
            dispatchMouse('dblclick', 70, 70)
            canvas.demandInvoke(line)
            await flush()
            expect(line.hotLines()).toBe(false)
        })
        it('should disable the resizable, draggable and rotatable events while it is editable', async () => {
            dispatchMouse('dblclick', 70, 70)
            line.__updateRunningEvent(RESIZABLE_RUNNING_EVENT, true)
            line.__updateRunningEvent(DRAGGABLE_RUNNING_EVENT, true)
            line.__updateRunningEvent(ROTATABLE_RUNNING_EVENT, true)
            canvas.demandInvoke(line)
            await flush()
            expect(line.__isRunningEventActive(RESIZABLE_RUNNING_EVENT)).toBe(
                false
            )
            expect(line.__isRunningEventActive(DRAGGABLE_RUNNING_EVENT)).toBe(
                false
            )
            expect(line.__isRunningEventActive(ROTATABLE_RUNNING_EVENT)).toBe(
                false
            )
        })
        it('should draw the control points while it is editable', async () => {
            dispatchMouse('dblclick', 70, 70)
            canvas.demandInvoke(line)
            await flush()
            const drawing = createDrawingContext()
            line.context = drawing.context
            line.draw()
            // the line itself and its four control point handles are drawn
            expect(drawing.strokes).toHaveLength(6)
            expect(drawing.fills).toHaveLength(5)
        })
        it('should draw the control points with their colors', async () => {
            dispatchMouse('dblclick', 70, 70)
            canvas.demandInvoke(line)
            await flush()
            const drawing = createDrawingContext()
            line.context = drawing.context
            line.draw()
            expect(drawing.strokes[1].strokeStyle).toBe('#0000ff')
            expect(drawing.fills[1].fillStyle).toBe('#ffffff')
        })
    })

    describe('dragging the control points', () => {
        beforeEach(async () => {
            await createLine({
                selectable: true,
                editable: true,
                lineWidth: 4,
                controlPoints: [
                    {
                        startX: 20,
                        startY: 20,
                        endX: 120,
                        endY: 120,
                        startDraggable: true,
                    },
                ],
            })
            allowMouse(canvas)
            dispatchMouse('dblclick', 70, 70)
            // the control points are only built while the line is drawn
            canvas.demandInvoke(line)
            await flush()
        })

        it('should start the drag on a mousedown on the control point', () => {
            dispatchMouse('mousedown', 20, 20)
            expect(line.__isRunningEventActive('startDraggable-0')).toBe(true)
        })
        it('should not start the drag away from the control point', () => {
            dispatchMouse('mousedown', 70, 20)
            expect(line.__isRunningEventActive('startDraggable-0')).toBe(false)
        })
        it('should move the control point with the mouse', () => {
            dispatchMouse('mousedown', 20, 20)
            dispatchMouse('mousemove', 70, 20)
            expect(line.getOptionCurrent('startX-0')).toBe(70)
            expect(line.getOptionCurrent('startY-0')).toBe(20)
        })
        it('should end the drag on a mouseup', () => {
            dispatchMouse('mousedown', 20, 20)
            dispatchMouse('mousemove', 70, 20)
            dispatchMouse('mouseup', 70, 20)
            expect(line.__isRunningEventActive('startDraggable-0')).toBe(false)
        })
    })

    describe('sticky points', () => {
        let target: RectangleBlock

        beforeEach(async () => {
            target = new RectangleBlock({
                x: 50,
                y: 60,
                width: 20,
                height: 20,
            })
            canvas = new Canvas('myCanvas', 400, 500)
            canvas.add(target)
            await flush()
        })

        it('should stick the start of a point to another block', async () => {
            await createLine({
                controlPoints: [
                    {
                        startX: 0,
                        startY: 0,
                        endX: 100,
                        endY: 100,
                        stickyStart: { block: target, x: 5, y: 5 },
                    },
                ],
            })
            expect(line.getOptionCurrent('startX-0')).toBe(55)
            expect(line.getOptionCurrent('startY-0')).toBe(65)
        })
        it('should stick the end of a point to another block', async () => {
            await createLine({
                controlPoints: [
                    {
                        startX: 0,
                        startY: 0,
                        endX: 100,
                        endY: 100,
                        stickyEnd: { block: target, x: 5, y: 5 },
                    },
                ],
            })
            expect(line.getOptionCurrent('endX-0')).toBe(55)
            expect(line.getOptionCurrent('endY-0')).toBe(65)
        })
        it('should follow the block it is stuck to', async () => {
            await createLine({
                controlPoints: [
                    {
                        startX: 0,
                        startY: 0,
                        endX: 100,
                        endY: 100,
                        stickyStart: { block: target, x: 5, y: 5 },
                    },
                ],
            })
            target.set({ x: 100 })
            await flush()
            expect(line.getOptionCurrent('startX-0')).toBe(105)
            expect(line.getOptionCurrent('startY-0')).toBe(65)
        })
    })

    describe('visual', () => {
        beforeEach(() => {
            // a small canvas keeps the screenshots focused on the drawn line
            canvas = new Canvas('myCanvas', 160, 160)
        })

        const drawLine = async (options: ILineOptions) => {
            line = new LineBlock({
                x: 20,
                y: 20,
                width: 120,
                height: 120,
                lineWidth: 2,
                lineColor: 'red',
                ...options,
            })
            canvas.add(line)
            await flush()
        }

        // the drawings of a table are captured one by one
        const capture = (drawings: [string, string, ILineOptions][]) => {
            for (const [label, name, options] of drawings)
                it(`should draw ${label}`, async () => {
                    await drawLine(options)
                    await expect(
                        page.elementLocator(canvas.canvas)
                    ).toMatchScreenshot(name)
                })
        }

        capture([
            [
                'the straight line',
                'line-straight',
                {
                    controlPoints: [
                        { startX: 20, startY: 20, endX: 140, endY: 140 },
                    ],
                },
            ],
            [
                'the curved line',
                'line-curve',
                {
                    controlPoints: [
                        {
                            startX: 20,
                            startY: 140,
                            endX: 140,
                            endY: 140,
                            startControlX: 20,
                            startControlY: 20,
                            endControlX: 140,
                            endControlY: 20,
                        },
                    ],
                },
            ],
            [
                'the closed line',
                'line-closed',
                {
                    fillColor: 'blue',
                    closeLine: true,
                    controlPoints: [
                        {
                            startX: 20,
                            startY: 140,
                            endX: 140,
                            endY: 140,
                            startControlX: 20,
                            startControlY: 20,
                            endControlX: 140,
                            endControlY: 20,
                        },
                    ],
                },
            ],
        ])
    })
})
