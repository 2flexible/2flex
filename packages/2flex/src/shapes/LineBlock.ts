import { DrawFunc, FillStyle, IShapeOptions, ShapeBlock } from '../ShapeBlock'
import { cubicBezier } from '../Utils'
import type { RelativeType } from '../types'
import type { Block } from '../Block'
import {
    SELECTABLE_RUNNING_EVENT,
    DRAGGABLE_RUNNING_EVENT,
    RESIZABLE_RUNNING_EVENT,
    ROTATABLE_RUNNING_EVENT,
} from '../const'

interface StickyLine {
    block: Block
    x: number
    y: number
}

type LineType = 'line' | 'cubicBezier'

export interface ILineOptions extends IShapeOptions {
    lineType?: LineType
    startX?: RelativeType
    startY?: RelativeType
    endX?: RelativeType
    endY?: RelativeType
    startControlX?: RelativeType
    startControlY?: RelativeType
    endControlX?: RelativeType
    endControlY?: RelativeType
    startDraggable?: boolean
    endDraggable?: boolean
    startControllable?: boolean
    endControllable?: boolean
    lineColor?: FillStyle
    fillColor?: FillStyle
    closeLine?: boolean
    controlPointsSize?: RelativeType
    editable?: boolean
    stickStart?: StickyLine
    stickEnd?: StickyLine
}
type CustomPointEvents = {
    mousedown?: CustomEvent<MouseEvent>
    mousemove?: CustomEvent<MouseEvent>
    mouseup?: CustomEvent<MouseEvent>
}
interface ControlPointEvents {
    start: CustomPointEvents
    end: CustomPointEvents
    startControl: CustomPointEvents
    endControl: CustomPointEvents
}

const CONTROLS_POINT_SIZE = 5
const CONTROLS_LINE_WIDTH = 2
const CONTROLS_POINT_BACKGROUND_COLOR = 'white'
const CONTROLS_POINT_STROKE_COLOR = 'blue'
const EDITABLE_RUNNING_EVENT = 'editable'
const POINT_DRAGGING_RUNNING_EVENT_MAP: Record<
    keyof ControlPointEvents,
    string
> = {
    start: 'startDragable',
    end: 'endDragable',
    startControl: 'startControlDragable',
    endControl: 'endControlDragable',
}

export class LineBlock extends ShapeBlock {
    path?: Path2D
    pathLine?: Path2D
    pathC1?: Path2D
    pathC2?: Path2D
    pathC3?: Path2D
    pathC4?: Path2D

    #editableDbClickEvent?: CustomEvent<MouseEvent>
    #editableClickEvent?: CustomEvent<MouseEvent>

    #controlPointEvents: ControlPointEvents

    #cacheX?: number
    #cacheY?: number
    #cacheWidth?: number
    #cacheHeight?: number

    __points: { x: number[]; y: number[] } = { x: [], y: [] }
    __stickyStartBlock: {
        x?: number
        y?: number
        width?: number
        height?: number
    } = {
        x: undefined,
        y: undefined,
        width: undefined,
        height: undefined,
    }
    __stickyEndBlock: {
        x?: number
        y?: number
        width?: number
        height?: number
    } = {
        x: undefined,
        y: undefined,
        width: undefined,
        height: undefined,
    }

    constructor(options: ILineOptions) {
        super(options)
        this.#controlPointEvents = {
            start: {},
            end: {},
            startControl: {},
            endControl: {},
        }
        this.#defineOptions()
    }

    #defineOptions() {
        this.addProperty('lineType', 'line')
        this.addProperty('startX', undefined, true)
        this.addProperty('startY', undefined)
        this.addProperty('endX', undefined, true)
        this.addProperty('endY', undefined)

        this.addProperty('startControlX', undefined, true)
        this.addProperty('startControlY', undefined)
        this.addProperty('endControlX', undefined, true)
        this.addProperty('endControlY', undefined)

        this.addProperty('stickStart', undefined)
        this.addProperty('stickEnd', undefined)

        this.addProperty(
            'startDraggable',
            undefined,
            false,
            (block: LineBlock, opt: boolean) => this.#startDraggable(block, opt)
        )
        this.addProperty(
            'endDraggable',
            undefined,
            false,
            (block: LineBlock, opt: boolean) => this.#endDraggable(block, opt)
        )
        this.addProperty(
            'startControllable',
            undefined,
            false,
            (block: LineBlock, opt: boolean) =>
                this.#startControllable(block, opt)
        )
        this.addProperty(
            'endControllable',
            undefined,
            false,
            (block: LineBlock, opt: boolean) =>
                this.#endControllable(block, opt)
        )

        this.addProperty('controlPointsSize', CONTROLS_POINT_SIZE)
        this.addProperty('controlLineWidth', CONTROLS_LINE_WIDTH)
        this.addProperty(
            'controlPointBackgroundColor',
            CONTROLS_POINT_BACKGROUND_COLOR
        )
        this.addProperty('controlPointStrokeColor', CONTROLS_POINT_STROKE_COLOR)

        this.addProperty('closeLine', undefined)
        this.addProperty(
            'lineColor',
            undefined,
            false,
            (block: LineBlock, opt: string) => this.#lineColor(block, opt)
        )
        this.addProperty(
            'fillColor',
            undefined,
            false,
            (block: LineBlock, opt: string) => this.#fillColor(block, opt)
        )

        this.addProperty(
            'editable',
            false,
            false,
            (block: LineBlock, opt: boolean) => this.#editable(block, opt)
        )
    }

    render(): void {
        super.render()
        this.#resetDefaultRunningEvents()
    }
draw(_func?: DrawFunc) {
        this.path = this.#buildPath()

        const isEditable = this.__isRunningEventActive(EDITABLE_RUNNING_EVENT)
        this.hotLines(!isEditable)
        if (isEditable) this.__selectCursor('auto')

        if (this.fill()) this.context?.fill(this.path)
        if (this.stroke()) this.context?.stroke(this.path)

        this.#buildInlineHotLines()
    }

    updateCordinates(): void {
        super.updateCordinates()
        this.#handleSticky()

        const lineType = this.getOptionCurrent('lineType')

        let startX = this.getOptionCurrent('startX')
        let cacheStartX = this.getOptionCache('startX')
        let startY = this.getOptionCurrent('startY')
        let cacheStartY = this.getOptionCache('startY')
        let endX = this.getOptionCurrent('endX')
        let cacheEndX = this.getOptionCache('endX')
        let endY = this.getOptionCurrent('endY')
        let cacheEndY = this.getOptionCache('endY')

        let startControlX = this.getOptionCurrent('startControlX')
        let startControlY = this.getOptionCurrent('startControlY')
        let endControlX = this.getOptionCurrent('endControlX')
        let endControlY = this.getOptionCurrent('endControlY')
        let cacheStartControlX = this.getOptionCache('startControlX')
        let cacheStartControlY = this.getOptionCache('startControlY')
        let cacheEndControlX = this.getOptionCache('endControlX')
        let cacheEndControlY = this.getOptionCache('endControlY')

        const currentX = this.getOptionCurrent('x')
        const currentY = this.getOptionCurrent('y')
        let cacheX = this.#cacheX
        let cacheY = this.#cacheY
        if (cacheX === undefined) cacheX = currentX
        if (cacheY === undefined) cacheY = currentY

        const currentWidth = this.getOptionCurrent('width')
        const currentHeight = this.getOptionCurrent('height')

        let cacheWidth = this.#cacheWidth
        let cacheHeight = this.#cacheHeight
        if (cacheWidth === undefined) cacheWidth = currentWidth
        if (cacheHeight === undefined) cacheHeight = currentHeight

        if (startX === undefined) {
            startX = this.startX(currentX)
            cacheStartX = startX
        }
        if (startY === undefined) {
            startY = this.startY(currentY)
            cacheStartY = startY
        }
        if (endX === undefined) {
            endX = this.endX(currentWidth)
            cacheEndX = endX
        }
        if (endY === undefined) {
            endY = this.endY(currentHeight)
            cacheEndY = endY
        }

        if (startControlX === undefined) {
            startControlX = this.startControlX(startX)
            cacheStartControlX = startControlX
        }
        if (startControlY === undefined) {
            startControlY = this.startControlY(startY)
            cacheStartControlY = startControlY
        }
        if (endControlX === undefined) {
            endControlX = this.endControlX(endX)
            cacheEndControlX = endControlX
        }
        if (endControlY === undefined) {
            endControlY = this.endControlY(endY)
            cacheEndControlY = endControlY
        }

        const diffX = currentX - cacheX!
        const diffY = currentY - cacheY!
        const diffW = currentWidth - cacheWidth!
        const diffH = currentHeight - cacheHeight!
        const dX = diffX + diffW
        const dY = diffY + diffH

        if (endX > startX) {
            startX += diffX
            endX += dX
        } else {
            startX += dX
            endX += diffX
        }

        if (endY > startY) {
            startY += diffY
            endY += dY
        } else {
            startY += dY
            endY += diffY
        }

        const startXDiff = startX - cacheStartX
        const startYDiff = startY - cacheStartY
        const endXDiff = endX - cacheEndX
        const endYDiff = endY - cacheEndY

        if (lineType === 'cubicBezier') {
            if (startXDiff !== 0)
                this.setOptionCurrent(
                    'startControlX',
                    cacheStartControlX + startXDiff
                )
            if (startYDiff !== 0)
                this.setOptionCurrent(
                    'startControlY',
                    cacheStartControlY + startYDiff
                )
        }
        if (lineType === 'cubicBezier') {
            if (endXDiff !== 0)
                this.setOptionCurrent(
                    'endControlX',
                    cacheEndControlX + endXDiff
                )
            if (endYDiff !== 0)
                this.setOptionCurrent(
                    'endControlY',
                    cacheEndControlY + endYDiff
                )
        }
        this.setOptionCurrent('startX', startX)
        this.setOptionCurrent('startY', startY)
        this.setOptionCurrent('endX', endX)
        this.setOptionCurrent('endY', endY)

        this.#adjustBlockCordinates()

        this.#cacheX = this.x()
        this.#cacheY = this.y()
        this.#cacheWidth = this.width()
        this.#cacheHeight = this.height()
    }

    updateCords(): void {
        super.updateCords()
        this.#adjsutBoundingBox()
    }
    #adjsutBoundingBox() {
        let c1: number[] = []
        let c2: number[] = []
        if (this.#isLineTypeCubicBezier) {
            c1 = [this.startControlX(), this.endControlX()]
            c2 = [this.startControlY(), this.endControlY()]
        }
        const xMinB = Math.min(...this.__points.x, ...c1)
        const yMinB = Math.min(...this.__points.y, ...c2)
        const xMaxB = Math.max(...this.__points.x, ...c1)
        const yMaxB = Math.max(...this.__points.y, ...c2)
        this.boundingBox = {
            topLeft: {
                x: xMinB,
                y: yMinB,
            },
            topRight: {
                x: xMaxB,
                y: yMinB,
            },
            bottomLeft: {
                x: xMinB,
                y: yMaxB,
            },
            bottomRight: {
                x: xMaxB,
                y: yMaxB,
            },
        }
    }

    #adjustBlockCordinates() {
        let c1: number[] = []
        let c2: number[] = []
        if (this.#isLineTypeCubicBezier) {
            c1 = this.#findMinMax(
                this.startX(),
                this.startControlX(),
                this.endControlX(),
                this.endX()
            )
            c2 = this.#findMinMax(
                this.startY(),
                this.startControlY(),
                this.endControlY(),
                this.endY()
            )
        }

        this.__points.x = [this.startX(), this.endX(), ...c1]
        this.__points.y = [this.startY(), this.endY(), ...c2]

        const xMin = Math.min(...this.__points.x)
        const yMin = Math.min(...this.__points.y)
        const xMax = Math.max(...this.__points.x)
        const yMax = Math.max(...this.__points.y)

        const controlLineWidth = this.lineWidth() / 2
        this.setOptionCurrent('x', xMin - controlLineWidth)
        this.setOptionCurrent('y', yMin - controlLineWidth)
        this.setOptionCurrent('width', xMax - xMin + controlLineWidth)
        this.setOptionCurrent('height', yMax - yMin + controlLineWidth)
        this.setOptionCurrent('cornerTopLeft', {
            x: xMin - controlLineWidth,
            y: yMin - controlLineWidth,
        })
        this.setOptionCurrent('cornerTopRight', {
            x: xMax + controlLineWidth,
            y: yMin - controlLineWidth,
        })
        this.setOptionCurrent('cornerBottomLeft', {
            x: xMin - controlLineWidth,
            y: yMax + controlLineWidth,
        })
        this.setOptionCurrent('cornerBottomRight', {
            x: xMax + controlLineWidth,
            y: yMax + controlLineWidth,
        })
    }

    get #isLineTypeCubicBezier() {
        return this.lineType() === 'cubicBezier'
    }

    #findMinMax(p0: number, p1: number, p2: number, p3: number) {
        const a = 3 * (-p0 + 3 * p1 - 3 * p2 + p3)
        const b = 6 * (p0 - 2 * p1 + p2)
        const c = 3 * (p1 - p0)

        const points = []
        const D = Math.pow(b, 2) - 4 * a * c
        if (D == 0) {
            cubicBezier
            const t = -b / (2 * a)
            if (t >= 0 && t <= 1) points.push(t)
        } else if (D > 0) {
            const base = Math.sqrt(D)
            const t1 = (-b + base) / (2 * a)
            const t2 = (-b - base) / (2 * a)
            if (t1 >= 0 && t1 <= 1) points.push(t1)
            if (t2 >= 0 && t2 <= 1) points.push(t2)
        }
        return points.map((i) => {
            return cubicBezier(p0, p1, p2, p3, i)
        })
    }

    #resetDefaultRunningEvents() {
        if (this.__isRunningEventActive(EDITABLE_RUNNING_EVENT)) {
            this.__updateRunningEvent(RESIZABLE_RUNNING_EVENT, false)
            this.__updateRunningEvent(DRAGGABLE_RUNNING_EVENT, false)
            this.__updateRunningEvent(ROTATABLE_RUNNING_EVENT, false)
        }
    }

    #buildPath(): Path2D {
        const path = new Path2D()
        path.moveTo(this.startX(), this.startY())
        if (this.lineType() === 'cubicBezier') {
            path.bezierCurveTo(
                this.startControlX(),
                this.startControlY(),
                this.endControlX(),
                this.endControlY(),
                this.endX(),
                this.endY()
            )
        } else {
            path.lineTo(this.endX(), this.endY())
        }
        if (this.closeLine()) path.closePath()
        return path
    }

    #buildInlineHotLines(): void {
        const context = this.context
        if (!this.__isRunningEventActive(EDITABLE_RUNNING_EVENT) || !context) {
            return
        }
        const lineType = this.lineType()
        const startX = this.startX()
        const startY = this.startY()
        const endX = this.endX()
        const endY = this.endY()
        const startControlX = this.startControlX()
        const startControlY = this.startControlY()
        const endControlX = this.endControlX()
        const endControlY = this.endControlY()
        const controlPointSize = this.controlPointsSize()
        const controlLineWidth = this.controlLineWidth()
        const controlPointBackgroundColor = this.controlPointBackgroundColor()
        const controlPointStrokeColor = this.controlPointStrokeColor()

        context.save()
        context.translate(this.rotationCenterX(), this.rotationCenterY())
        context.rotate(this.rotate())
        context.translate(-this.rotationCenterX(), -this.rotationCenterY())
        context.setLineDash([])

        this.beginPath()
        this.pathLine = new Path2D()
        this.pathLine.moveTo(startX, startY)
        if (lineType === 'cubicBezier')
            this.pathLine.bezierCurveTo(
                startControlX,
                startControlY,
                endControlX,
                endControlY,
                endX,
                endY
            )
        else this.pathLine.lineTo(endX, endY)
        context.lineWidth = controlLineWidth
        context.strokeStyle = controlPointStrokeColor
        context.stroke(this.pathLine)

        this.beginPath()
        this.pathC1 = new Path2D()
        this.pathC1.arc(startX, startY, controlPointSize, 0, Math.PI * 2)
        context.lineWidth = controlLineWidth
        context.strokeStyle = controlPointStrokeColor
        context.fillStyle = controlPointBackgroundColor
        context.stroke(this.pathC1)
        context.fill(this.pathC1)

        this.beginPath()
        this.pathC4 = new Path2D()
        this.pathC4.arc(endX, endY, controlPointSize, 0, Math.PI * 2)
        context.lineWidth = controlLineWidth
        context.strokeStyle = controlPointStrokeColor
        context.fillStyle = controlPointBackgroundColor
        context.stroke(this.pathC4)
        context.fill(this.pathC4)

        if (this.startControllable() && lineType === 'cubicBezier') {
            this.beginPath()
            this.pathC2 = new Path2D()
            this.pathC2.moveTo(startX, startY)
            this.pathC2.lineTo(startControlX, startControlY)
            this.pathC2.moveTo(startControlX, startControlY)
            this.pathC2.arc(
                startControlX,
                startControlY,
                controlPointSize,
                0,
                Math.PI * 2
            )
            context.lineWidth = controlLineWidth
            context.strokeStyle = controlPointStrokeColor
            context.fillStyle = controlPointBackgroundColor
            context.stroke(this.pathC2)
            context.fill(this.pathC2)
        }
        if (this.endControllable() && lineType === 'cubicBezier') {
            this.beginPath()
            this.pathC3 = new Path2D()
            this.pathC3.moveTo(endX, endY)
            this.pathC3.lineTo(endControlX, endControlY)
            this.pathC3.moveTo(endControlX, endControlY)
            this.pathC3.arc(
                endControlX,
                endControlY,
                controlPointSize,
                0,
                Math.PI * 2
            )
            context.lineWidth = controlLineWidth
            context.strokeStyle = controlPointStrokeColor
            context.fillStyle = controlPointBackgroundColor
            context.stroke(this.pathC3)
            context.fill(this.pathC3)
        }

        context.restore()
    }
    #handleSticky() {
        const stickyStart = this.stickStart()
        const stickyEnd = this.stickEnd()
        if (stickyStart !== undefined) {
            if (this.__stickyStartBlock.x !== undefined) {
                stickyStart.x +=
                    stickyStart.block.x() - this.__stickyStartBlock.x
            }
            if (this.__stickyStartBlock.y !== undefined) {
                stickyStart.y +=
                    stickyStart.block.y() - this.__stickyStartBlock.y
            }

            if (this.__stickyStartBlock.width !== undefined) {
                stickyStart.x +=
                    stickyStart.block.width() - this.__stickyStartBlock.width
            }
            if (this.__stickyStartBlock.height !== undefined) {
                stickyStart.y +=
                    stickyStart.block.height() - this.__stickyStartBlock.height
            }
            this.__stickyStartBlock.x = stickyStart.block.x()
            this.__stickyStartBlock.y = stickyStart.block.y()
            this.__stickyStartBlock.width = stickyStart.block.width()
            this.__stickyStartBlock.height = stickyStart.block.height()

            this.startX(stickyStart.x)
            this.startY(stickyStart.y)
        }
        if (stickyEnd !== undefined) {
            if (this.__stickyEndBlock.x !== undefined) {
                stickyEnd.x += stickyEnd.block.x() - this.__stickyEndBlock.x
            }
            if (this.__stickyEndBlock.y !== undefined) {
                stickyEnd.y += stickyEnd.block.y() - this.__stickyEndBlock.y
            }
            if (this.__stickyEndBlock.width !== undefined) {
                stickyEnd.x +=
                    stickyEnd.block.width() - this.__stickyEndBlock.width
            }
            if (this.__stickyEndBlock.height !== undefined) {
                stickyEnd.y +=
                    stickyEnd.block.height() - this.__stickyEndBlock.height
            }
            this.__stickyEndBlock.x = stickyEnd.block.x()
            this.__stickyEndBlock.y = stickyEnd.block.y()
            this.__stickyEndBlock.width = stickyEnd.block.width()
            this.__stickyEndBlock.height = stickyEnd.block.height()

            this.endX(stickyEnd.x)
            this.endY(stickyEnd.y)
        }
    }

    #pathInBound(x: number, y: number, path: Path2D) {
        const context = this.context
        if (!context || !path) return false
        context.save()
        context.translate(this.rotationCenterX(), this.rotationCenterY())
        context.rotate(this.rotate())
        context.translate(-this.rotationCenterX(), -this.rotationCenterY())
        context.lineWidth = this.lineWidth()
        const inStroke = context.isPointInStroke(path, x, y)
        const inPath = context.isPointInPath(path, x, y)
        context.restore()
        return inStroke || inPath
    }
    #editable(block: LineBlock, opt?: boolean) {
        if (opt === undefined) return
        if (!opt) {
            const dblclick = block.#editableDbClickEvent
            const click = block.#editableClickEvent
            // @TODO: fix any issues
            if (dblclick) block.__removeEvent('dblclick', dblclick as any)
            if (click) block.__removeEvent('click', click as any)
            block.__updateRunningEvent(EDITABLE_RUNNING_EVENT, false)
            block.#editableDbClickEvent = undefined
            block.#editableClickEvent = undefined
            return
        }

        if (
            block.#editableDbClickEvent === undefined &&
            block.#editableClickEvent === undefined
        ) {
            const dblclick = (event: MouseEvent) => {
                if (!block.selectable()) return
                const { x, y } = block.canvas?.getCursorPosition(event)!
                if (
                    block.#pathInBound(x, y, block.#buildPath()) &&
                    block.isMouseEventAllowed
                ) {
                    block.__registerZIndex()
                    if (block.__ImFirst()) {
                        block.__updateRunningEvent(EDITABLE_RUNNING_EVENT, true)
                    }
                }
            }
            const click = (event: MouseEvent) => {
                const { x, y } = block.canvas?.getCursorPosition(event)!
                let editable =
                    !block.#pathInBound(x, y, block.#buildPath()) &&
                    !block.#pathInBound(x, y, block.pathC1!) &&
                    !block.#pathInBound(x, y, block.pathC2!) &&
                    !block.#pathInBound(x, y, block.pathC3!) &&
                    !block.#pathInBound(x, y, block.pathC4!)
                if (editable) {
                    block.__updateRunningEvent(EDITABLE_RUNNING_EVENT, false)
                    block.__resetCursor('auto')
                }
                block.__invokeChange()
            }
            // @TODO: fix any issues
            block.__addEvent('dblclick', dblclick as any)
            block.__addEvent('click', click as any)
        }
    }
    #startDraggable(block: LineBlock, opt: boolean) {
        if (opt !== undefined) block.#draggablePoints(opt, 'start')
    }
    #endDraggable(block: LineBlock, opt: boolean) {
        if (opt !== undefined) block.#draggablePoints(opt, 'end')
    }
    #startControllable(block: LineBlock, opt: boolean) {
        if (opt !== undefined) block.#draggablePoints(opt, 'startControl')
    }
    #endControllable(block: LineBlock, opt: boolean) {
        if (opt !== undefined) block.#draggablePoints(opt, 'endControl')
    }
    get #pointsMap() {
        return {
            start: {
                x: this.getOptionCurrent('startX'),
                y: this.getOptionCurrent('startY'),
            },
            end: {
                x: this.getOptionCurrent('endX'),
                y: this.getOptionCurrent('endY'),
            },
            startControl: {
                x: this.getOptionCurrent('startControlX'),
                y: this.getOptionCurrent('startControlY'),
            },
            endControl: {
                x: this.getOptionCurrent('endControlX'),
                y: this.getOptionCurrent('endControlY'),
            },
        }
    }

    get #pointsPath() {
        return {
            start: this.pathC1,
            end: this.pathC4,
            startControl: this.pathC2,
            endControl: this.pathC3,
        }
    }
    #draggablePoints(opt: boolean, point: keyof ControlPointEvents) {
        const mousedown = this.#controlPointEvents[point].mousedown
        const mousemove = this.#controlPointEvents[point].mousemove
        const mouseup = this.#controlPointEvents[point].mouseup
        if (!opt) {
            this.__updateRunningEvent(
                POINT_DRAGGING_RUNNING_EVENT_MAP[point],
                false
            )
            // @TODO: fix any issues
            if (mousedown) this.__removeEvent('mousedown', mousedown as any)
            if (mousemove) this.__removeEvent('mousemove', mousemove as any)
            if (mouseup) this.__removeEvent('mouseup', mouseup as any)
            this.#controlPointEvents[point].mousedown = undefined
            this.#controlPointEvents[point].mousedown = undefined
            this.#controlPointEvents[point].mousedown = undefined
            return
        }

        if (
            mousedown === undefined &&
            mouseup === undefined &&
            mousemove === undefined
        ) {
            let initCords = { x: 0, y: 0 }
            let beforeCords = { x: 0, y: 0 }
            let beforeValues: any = {}
            const xPointName = `${point}X`
            const yPointName = `${point}Y`

            const mousedown = (event: MouseEvent) => {
                if (!this.__isRunningEventActive(EDITABLE_RUNNING_EVENT)) return
                const pointsMap = this.#pointsMap[point]
                const { x, y } = this.canvas?.getCursorPosition(event)!
                const path = this.#pointsPath[point]
                const inBound = path ? this.#pathInBound(x, y, path) : false
                if (inBound) {
                    this.__registerZIndex()
                    if (this.__ImFirst()) {
                        initCords = { x: x, y: y }
                        beforeCords = { x: 0, y: 0 }
                        beforeValues[xPointName] = pointsMap.x
                        beforeValues[yPointName] = pointsMap.y
                        this.__updateRunningEvent(
                            POINT_DRAGGING_RUNNING_EVENT_MAP[point],
                            true
                        )
                    }
                }
            }

            const mousemove = (event: MouseEvent) => {
                if (
                    this.__isRunningEventActive(
                        POINT_DRAGGING_RUNNING_EVENT_MAP[point]
                    ) &&
                    this.__ImFirst()
                ) {
                    const pointsMap = this.#pointsMap[point]
                    this.__updateRunningEvent(DRAGGABLE_RUNNING_EVENT, false)
                    const { x, y } = this.canvas?.getCursorPosition(event)!
                    let diffX = x - initCords.x
                    let diffY = y - initCords.y
                    if (diffX !== 0) {
                        const diff = diffX - beforeCords.x
                        this.setOptionCurrent(xPointName, pointsMap.x + diff)
                        beforeCords.x = diffX
                    }
                    if (diffY !== 0) {
                        const diff = diffY - beforeCords.y
                        this.setOptionCurrent(yPointName, pointsMap.y + diff)
                        beforeCords.y = diffY
                    }
                    this.__invokeChange()
                }
            }
            const mouseup = () => {
                if (
                    this.__isRunningEventActive(
                        POINT_DRAGGING_RUNNING_EVENT_MAP[point]
                    ) &&
                    this.isMouseEventAllowed
                ) {
                    const pointsMap = this.#pointsMap[point]
                    this.__unregisterZIndex()
                    this.__updateRunningEvent(
                        POINT_DRAGGING_RUNNING_EVENT_MAP[point],
                        false
                    )
                    if (beforeCords.x !== 0 || beforeCords.y !== 0) {
                        const after: any = {}
                        after[xPointName] = pointsMap.x
                        after[yPointName] = pointsMap.y
                        this.__invokeHistory(beforeValues, after)
                        this.__invokeChange()
                    }
                }
            }
            this.__addEvent('mousedown', mousedown as any)
            this.__addEvent('mousemove', mousemove as any)
            this.__addEvent('mouseup', mouseup as any)
        }
    }
    #lineColor(block: LineBlock, opt: string) {
        if (opt !== undefined) {
            block.strokeStyle(opt)
            block.stroke({ stroke: true })
        }
    }
    #fillColor(block: LineBlock, opt: string) {
        if (opt !== undefined) {
            block.fillStyle(opt)
            block.fill({ fill: true })
        }
    }

    checkInBound(event: MouseEvent): boolean {
        if (!this.__isRunningEventActive(SELECTABLE_RUNNING_EVENT)) {
            const { x, y } = this.canvas?.getCursorPosition(event)!
            return this.#pathInBound(x, y, this.#buildPath())
        } else if (!this.__isRunningEventActive(EDITABLE_RUNNING_EVENT)) {
            return super.checkInBound(event)
        }
        return false
    }
}
