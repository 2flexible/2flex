import { DrawFunc, FillStyle, IShapeOptions, ShapeBlock } from '../ShapeBlock'
import { getPrototype, stationaryPoints } from '../Utils'
import type { RelativeType } from '../types'
import type { Block } from '../Block'
import {
    SELECTABLE_RUNNING_EVENT,
    DRAGGABLE_RUNNING_EVENT,
    RESIZABLE_RUNNING_EVENT,
    ROTATABLE_RUNNING_EVENT,
} from '../const'

interface StickTo {
    block: Block
    x?: number
    y?: number
}

interface ControlPoint {
    [key: string]: any
    startX?: number
    startY?: number
    endX?: number
    endY?: number
    startControlX?: number
    startControlY?: number
    endControlX?: number
    endControlY?: number
    startDraggable?: boolean
    endDraggable?: boolean
    startControllable?: boolean
    endControllable?: boolean
    stickyStart?: StickTo
    stickyEnd?: StickTo
}

class PointNode {
    id?: number
    prev?: PointNode
    next?: PointNode
    startX?: number
    startY?: number
    endX?: number
    endY?: number
    startControlX?: number
    startControlY?: number
    endControlX?: number
    endControlY?: number
    startDraggable?: boolean
    endDraggable?: boolean
    startControllable?: boolean
    endControllable?: boolean
    stickyStart?: StickTo
    stickyEnd?: StickTo
    constructor(id: number) {
        this.id = id
    }
}

type WalkFunc = (letterNode: PointNode) => void

export interface ILineOptions extends IShapeOptions {
    controlPoints?: ControlPoint[]
    lineColor?: FillStyle
    fillColor?: FillStyle
    closeLine?: boolean
    controlPointsSize?: RelativeType
    editable?: boolean
}
type CustomPointEvents = {
    [key: string]: {
        mousedown?: CustomEvent<MouseEvent>
        mousemove?: CustomEvent<MouseEvent>
        mouseup?: CustomEvent<MouseEvent>
    }
}
type PointsPath = { [key: string]: Path2D }
const CONTROLS_POINT_SIZE = 5
const CONTROLS_LINE_WIDTH = 2
const CONTROLS_POINT_BACKGROUND_COLOR = 'white'
const CONTROLS_POINT_STROKE_COLOR = 'blue'
const EDITABLE_RUNNING_EVENT = 'editable'

const START_DRAGGABLE_PATH = 'startDraggable'
const END_DRAGGABLE_PATH = 'endDraggable'
const START_CONTROLLABLE_PATH = 'startControllable'
const END_CONTROLLABLE_PATH = 'endControllable'

const CONTROLPOINT_PROPERTY_NAMES = [
    'startX',
    'startY',
    'endX',
    'endY',
    'startControlX',
    'startControlY',
    'endControlX',
    'endControlY',
    'startDraggable',
    'endDraggable',
    'startControllable',
    'endControllable',
    'stickyStart',
    'stickyEnd',
]

export class LineBlock extends ShapeBlock {
    // @TODO: we should hide the paths also
    path?: Path2D
    #pointsPath: PointsPath

    #headPointNode?: PointNode
    #tailPointNode?: PointNode

    #editableDbClickEvent?: CustomEvent<MouseEvent>
    #editableClickEvent?: CustomEvent<MouseEvent>

    #controlPointEvents: CustomPointEvents

    #cacheX?: number
    #cacheY?: number
    #cacheWidth?: number
    #cacheHeight?: number

    #points: { x: number[]; y: number[] } = { x: [], y: [] }

    constructor(options: ILineOptions) {
        super(options)
        this.#controlPointEvents = {}
        this.#pointsPath = {}
        this.#defineOptions()
    }

    #defineOptions() {
        this.addProperty(
            'controlPoints',
            [],
            false,
            (block: LineBlock, opt: ControlPoint[]) =>
                this.#controlPoints(block, opt)
        )
        this.addProperty('stickyStart', undefined)
        this.addProperty('stickyEnd', undefined)
        this.addProperty('controlPointsSize', CONTROLS_POINT_SIZE)
        this.addProperty('controlLineWidth', CONTROLS_LINE_WIDTH)
        this.addProperty(
            'controlPointBackgroundColor',
            CONTROLS_POINT_BACKGROUND_COLOR
        )
        this.addProperty('controlPointStrokeColor', CONTROLS_POINT_STROKE_COLOR)
        this.addProperty('closeLine', undefined)
        this.addProperty('lineColor', undefined)
        this.addProperty('fillColor', undefined)
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
        this.#handleRunningEditable()
    }
    draw(_func?: DrawFunc) {
        this.path = this.#buildPath()
        const context = this.context
        if (!context) return

        context.fillStyle = this.fillColor()
        context.strokeStyle = this.lineColor()
        context.lineWidth = this.lineWidth() ?? 0
        context.fill(this.path)
        context.stroke(this.path)

        this.#buildInlineHotLines()
    }
    #handleRunningEditable() {
        const isEditable = this.__isRunningEventActive(EDITABLE_RUNNING_EVENT)
        this.hotLines(!isEditable)
        if (isEditable) this.__selectCursor('auto')
    }
    #getCurrentPoint(point: string, pointId: number) {
        const pointName = this.#formatPointName(point, pointId)
        return this.getOptionCurrent(pointName)
    }
    #getCachePoint(point: string, pointId: number) {
        const pointName = this.#formatPointName(point, pointId)
        return this.getOptionCache(pointName)
    }
    #setCurrentPoint(point: string, pointId: number, value: number) {
        const pointName = this.#formatPointName(point, pointId)
        return this.setOptionCurrent(pointName, value)
    }
    #setCachePoint(point: string, pointId: number, value: number) {
        const pointName = this.#formatPointName(point, pointId)
        return this.setOptionCache(pointName, value)
    }
    updateCordinates(): void {
        super.updateCordinates()
        const currentX = this.getOptionCurrent('x')
        const currentY = this.getOptionCurrent('y')
        const currentWidth = this.getOptionCurrent('width')
        const currentHeight = this.getOptionCurrent('height')

        let prevEndX: number
        let prevEndY: number
        let endDiffX: number
        let endDiffY: number
        this.#walkPointNodes((point: PointNode) => {
            const pointId = point.id!
            const stickyStart = this.#getCurrentPoint('stickyStart', pointId)
            const sticktEnd = this.#getCurrentPoint('stickyEnd', pointId)

            let startX = this.#getCurrentPoint('startX', pointId)
            let cacheStartX = this.#getCachePoint('startX', pointId)
            let startY = this.#getCurrentPoint('startY', pointId)
            let cacheStartY = this.#getCachePoint('startY', pointId)
            let endX = this.#getCurrentPoint('endX', pointId)
            let cacheEndX = this.#getCachePoint('endX', pointId)
            let endY = this.#getCurrentPoint('endY', pointId)
            let cacheEndY = this.#getCachePoint('endY', pointId)

            let startControlX = this.#getCurrentPoint('startControlX', pointId)
            let startControlY = this.#getCurrentPoint('startControlY', pointId)
            let endControlX = this.#getCurrentPoint('endControlX', pointId)
            let endControlY = this.#getCurrentPoint('endControlY', pointId)
            let cacheStartControlX = this.#getCachePoint(
                'startControlX',
                pointId
            )
            let cacheStartControlY = this.#getCachePoint(
                'startControlY',
                pointId
            )
            let cacheEndControlX = this.#getCachePoint('endControlX', pointId)
            let cacheEndControlY = this.#getCachePoint('endControlY', pointId)

            let cacheX = this.#cacheX
            let cacheY = this.#cacheY
            if (cacheX === undefined) cacheX = currentX
            if (cacheY === undefined) cacheY = currentY

            let cacheWidth = this.#cacheWidth
            let cacheHeight = this.#cacheHeight
            if (cacheWidth === undefined) cacheWidth = currentWidth
            if (cacheHeight === undefined) cacheHeight = currentHeight
            if (startX === undefined && point.prev === undefined) {
                this.#setCurrentPoint('startX', pointId, currentX)
                startX = currentX
                cacheStartX = currentX
            }
            if (startY === undefined && point.prev === undefined) {
                this.#setCurrentPoint('startY', pointId, currentY)
                startY = currentY
                cacheStartY = currentY
            }
            if (endX === undefined && point.next === undefined) {
                this.#setCurrentPoint('endX', pointId, currentWidth)
                endX = currentWidth
                cacheEndX = currentWidth
            }
            if (endY === undefined && point.next === undefined) {
                this.#setCurrentPoint('endY', pointId, currentHeight)
                endY = currentHeight
                cacheEndY = currentHeight
            }
            if (startControlX === undefined) {
                this.#setCurrentPoint('startControlX', pointId, startX)
                cacheStartControlX = startX
            }
            if (startControlY === undefined) {
                this.#setCurrentPoint('startControlY', pointId, startY)
                cacheStartControlY = startY
            }
            if (endControlX === undefined) {
                this.#setCurrentPoint('endControlX', pointId, endX)
                cacheEndControlX = endX
            }
            if (endControlY === undefined) {
                this.#setCurrentPoint('endControlY', pointId, endY)
                cacheEndControlY = endY
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

            if (stickyStart !== undefined) {
                const currX = stickyStart.block?.getOptionCurrent('x')
                const currY = stickyStart.block?.getOptionCurrent('y')
                startX = currX + (stickyStart.x ?? 0)
                startY = currY + (stickyStart.y ?? 0)
            }

            if (sticktEnd !== undefined) {
                const currX = sticktEnd.block?.getOptionCurrent('x')
                const currY = sticktEnd.block?.getOptionCurrent('y')
                endX = currX + (sticktEnd.x ?? 0)
                endY = currY + (sticktEnd.y ?? 0)
            }

            const startXDiff = endDiffX ?? startX - cacheStartX
            const startYDiff = endDiffY ?? startY - cacheStartY
            const endXDiff = endX - cacheEndX
            const endYDiff = endY - cacheEndY

            if (startXDiff !== 0) {
                this.#setCurrentPoint(
                    'startControlX',
                    pointId,
                    cacheStartControlX + startXDiff
                )
            }
            if (startYDiff !== 0) {
                this.#setCurrentPoint(
                    'startControlY',
                    pointId,
                    cacheStartControlY + startYDiff
                )
            }
            if (endXDiff !== 0) {
                this.#setCurrentPoint(
                    'endControlX',
                    pointId,
                    cacheEndControlX + endXDiff
                )
            }
            if (endYDiff !== 0) {
                this.#setCurrentPoint(
                    'endControlY',
                    pointId,
                    cacheEndControlY + endYDiff
                )
            }
            endDiffX = endXDiff
            endDiffY = endYDiff

            if (prevEndX !== undefined) {
                this.#setCurrentPoint('startX', pointId, prevEndX)
            } else this.#setCurrentPoint('startX', pointId, startX)
            if (prevEndY !== undefined) {
                this.#setCurrentPoint('startY', pointId, prevEndY)
            } else this.#setCurrentPoint('startY', pointId, startY)

            this.#setCurrentPoint('endX', pointId, endX)
            this.#setCurrentPoint('endY', pointId, endY)
            prevEndX = cacheEndX
            prevEndY = cacheEndY
        })

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
    addControlPoint(point: ControlPoint, index: number) {
        let foundPoint = this.#findPointNode((p) => p.id == index)
        if (!foundPoint) foundPoint = this.#tailPointNode
        const newPoint = this.#createPointNode(this.#nextPointId(), point)
        this.#addPointAfter(newPoint, foundPoint)
    }
    removeControlPoint(index: number) {
        const foundPoint = this.#findPointNode((p) => p.id == index)
        if (foundPoint) this.#removePoint(foundPoint)
    }
    addControlPointToTail(point: ControlPoint) {
        const newPoint = this.#createPointNode(this.#nextPointId(), point)
        this.#addPointAfter(newPoint, this.#tailPointNode)
    }
    addControlPointToHead(point: ControlPoint) {
        const newPoint = this.#createPointNode(this.#nextPointId(), point)
        this.#addPointBefore(newPoint, this.#headPointNode)
    }
    removeControlPointTail() {
        if (this.#tailPointNode) this.#removePoint(this.#tailPointNode)
    }
    removeControlPointHead() {
        if (this.#headPointNode) this.#removePoint(this.#headPointNode)
    }
    #buildPoints(points: ControlPoint[]) {
        for (let i = 0, len = points.length; i < len; i++) {
            const controlPoint = this.#createPointNode(i, points[i])
            this.#addPointAfter(controlPoint, this.#tailPointNode)
        }
    }
    #resetPoints() {
        let node = this.#headPointNode
        this.#headPointNode = undefined
        this.#tailPointNode = undefined
        while (node) {
            const next = node.next
            this.#removePointProperties(node.id!)
            this.#removeStickyDependentBlock(node)
            node.prev = undefined
            node.next = undefined
            node = next
        }
    }
    #removePointProperties(id: number) {
        for (const key of CONTROLPOINT_PROPERTY_NAMES) {
            const propertyName = this.#formatPointName(key, id)
            this.removeProperty(propertyName)
        }
    }
    #removeStickyDependentBlock(point: PointNode) {
        const stickyStart = point.stickyStart
        const stickyEnd = point.stickyEnd
        if (stickyStart) stickyStart.block.removeDependency(this)
        if (stickyEnd) stickyEnd.block.removeDependency(this)
    }
    #stickyDependentBlocks(point: ControlPoint) {
        const stickyStart = point.stickyStart
        const stickyEnd = point.stickyEnd
        if (stickyStart) stickyStart.block.addDependecy(this)
        if (stickyEnd) stickyEnd.block.addDependecy(this)
    }
    #createPointNode(id: number, point: ControlPoint): PointNode {
        const controlPoint = new PointNode(id)
        this.#addPointProperties(id)
        this.#initPoints(id, point)
        controlPoint.startX = point.startX
        controlPoint.startY = point.startY
        controlPoint.endX = point.endX
        controlPoint.endY = point.endY
        controlPoint.startControlX = point.startControlX
        controlPoint.startControlY = point.startControlY
        controlPoint.endControlX = point.endControlX
        controlPoint.endControlY = point.endControlY
        controlPoint.startDraggable = point.startDraggable
        controlPoint.endDraggable = point.endDraggable
        controlPoint.startControllable = point.startControllable
        controlPoint.endControllable = point.endControllable
        controlPoint.stickyStart = point.stickyStart
        controlPoint.stickyEnd = point.stickyEnd
        this.#stickyDependentBlocks(point)
        return controlPoint
    }
    #nextPointId(): number {
        let maxId = -1
        this.#walkPointNodes((point) => {
            if (point.id !== undefined && point.id > maxId) maxId = point.id
        })
        return maxId + 1
    }
    #initPoints(id: number, point: ControlPoint) {
        for (const key of CONTROLPOINT_PROPERTY_NAMES) {
            const propertyName = this.#formatPointName(key, id)
            getPrototype(this, propertyName)?.value.call(this, point[key])
        }
    }

    #controlPoints(block: LineBlock, opt?: ControlPoint[]) {
        if (opt !== undefined) {
            block.#resetPoints()
            block.#buildPoints(opt)
        }
    }
    #addPointProperties(id: number) {
        const startX = this.#formatPointName('startX', id)
        const startY = this.#formatPointName('startY', id)
        const endX = this.#formatPointName('endX', id)
        const endY = this.#formatPointName('endY', id)
        const startControlX = this.#formatPointName('startControlX', id)
        const startControlY = this.#formatPointName('startControlY', id)
        const endControlX = this.#formatPointName('endControlX', id)
        const endControlY = this.#formatPointName('endControlY', id)
        const startDraggable = this.#formatPointName('startDraggable', id)
        const endDraggable = this.#formatPointName('endDraggable', id)
        const startControllable = this.#formatPointName('startControllable', id)
        const endControllable = this.#formatPointName('endControllable', id)
        const startDraggablePath = this.#formatPointName(
            START_DRAGGABLE_PATH,
            id
        )
        const endDraggablePath = this.#formatPointName(END_DRAGGABLE_PATH, id)
        const startControllablePath = this.#formatPointName(
            START_CONTROLLABLE_PATH,
            id
        )
        const endControllablePath = this.#formatPointName(
            END_CONTROLLABLE_PATH,
            id
        )
        const stickyStart = this.#formatPointName('stickyStart', id)
        const stickyEnd = this.#formatPointName('stickyEnd', id)

        this.addProperty(startX, undefined, true)
        this.addProperty(startY, undefined)
        this.addProperty(endX, undefined, true)
        this.addProperty(endY, undefined)
        this.addProperty(startControlX, undefined, true)
        this.addProperty(startControlY, undefined)
        this.addProperty(endControlX, undefined, true)
        this.addProperty(endControlY, undefined)
        this.addProperty(
            startDraggable,
            undefined,
            false,
            (block: LineBlock, opt: boolean) =>
                this.#draggablePoints(
                    block,
                    opt,
                    startDraggable,
                    startX,
                    startY,
                    startDraggablePath
                )
        )
        this.addProperty(
            endDraggable,
            undefined,
            false,
            (block: LineBlock, opt: boolean) =>
                this.#draggablePoints(
                    block,
                    opt,
                    endDraggable,
                    endX,
                    endY,
                    endDraggablePath
                )
        )
        this.addProperty(
            startControllable,
            undefined,
            false,
            (block: LineBlock, opt: boolean) =>
                this.#draggablePoints(
                    block,
                    opt,
                    startControllable,
                    startControlX,
                    startControlY,
                    startControllablePath
                )
        )
        this.addProperty(
            endControllable,
            undefined,
            false,
            (block: LineBlock, opt: boolean) =>
                this.#draggablePoints(
                    block,
                    opt,
                    endControllable,
                    endControlX,
                    endControlY,
                    endControllablePath
                )
        )
        this.addProperty(stickyStart, undefined)
        this.addProperty(stickyEnd, undefined)
    }
    #addPointAfter(point: PointNode, tail?: PointNode) {
        if (tail) {
            point.next = tail.next
            if (point.next) point.next.prev = point
            tail.next = point
            point.prev = tail
        }
        if (!this.#headPointNode) this.#headPointNode = point
        if (!this.#tailPointNode) this.#tailPointNode = point
        if (this.#tailPointNode === tail) {
            this.#tailPointNode = point
        }
    }
    #addPointBefore(point: PointNode, head?: PointNode) {
        if (head) {
            if (head.prev) head.prev.next = point
            point.next = head
            point.prev = head.prev
            head.prev = point
        }
        if (!this.#headPointNode) this.#headPointNode = point
        if (!this.#tailPointNode) this.#tailPointNode = point
        if (this.#headPointNode === head) {
            this.#headPointNode = point
        }
    }
    #removePoint(point: PointNode) {
        let head = this.#headPointNode
        if (!head) return
        if (head === point) {
            const nextHead = this.#headPointNode?.next
            if (nextHead) nextHead.prev = undefined
            this.#headPointNode = nextHead
            if (this.#tailPointNode === point) this.#tailPointNode = undefined
            point.prev = undefined
            point.next = undefined
            return
        }
        while (head && head !== point) {
            head = head.next
        }
        if (!head) return
        const nextLetter = head.next
        const previusLetter = head.prev
        if (nextLetter) nextLetter.prev = previusLetter
        if (previusLetter) previusLetter.next = nextLetter
        if (this.#tailPointNode === point) this.#tailPointNode = previusLetter
        point.prev = undefined
        point.next = undefined
    }
    #findPointNode(statementFunc: (pointNode: PointNode) => boolean) {
        let pointNode: undefined | PointNode = this.#headPointNode
        while (pointNode) {
            if (statementFunc(pointNode)) {
                return pointNode
            }
            pointNode = pointNode.next
        }
    }
    #walkPointNodes(_func: WalkFunc) {
        let pointNode: undefined | PointNode = this.#headPointNode
        while (pointNode) {
            _func(pointNode)
            pointNode = pointNode.next
        }
    }
    #formatPointName(name: string, id: number) {
        return `${name}-${id}`
    }
    #adjsutBoundingBox() {
        const rotate = this.rotate() || 0
        const rot = (x: number, y: number) =>
            this.__rotateCordiantesByCenter(x, y, rotate)

        let xs: number[] = []
        let ys: number[] = []

        for (let i = 0; i < this.#points.x.length; i++) {
            const x = this.#points.x[i]
            const y = this.#points.y[i]
            if (x === undefined || y === undefined) continue
            const p = rot(x, y)
            xs.push(p.x)
            ys.push(p.y)
        }

        this.#walkPointNodes((point: PointNode) => {
            const pointId = point.id!
            const startControlXName = this.#formatPointName(
                'startControlX',
                pointId
            )
            const startControlYName = this.#formatPointName(
                'startControlY',
                pointId
            )
            const endControlXName = this.#formatPointName(
                'endControlX',
                pointId
            )
            const endControlYName = this.#formatPointName(
                'endControlY',
                pointId
            )
            const startControlX = this.getOptionCurrent(startControlXName)
            const startControlY = this.getOptionCurrent(startControlYName)
            const endControlX = this.getOptionCurrent(endControlXName)
            const endControlY = this.getOptionCurrent(endControlYName)
            if (
                startControlX !== undefined &&
                startControlY !== undefined &&
                endControlX !== undefined &&
                endControlY !== undefined
            ) {
                const pairs: [number, number][] = [
                    [startControlX, startControlY],
                    [endControlX, endControlY],
                ]
                for (const [x, y] of pairs) {
                    const p = rot(x, y)
                    xs.push(p.x)
                    ys.push(p.y)
                }
            }
        })
        this.boundingBox = {
            topLeft: { x: Math.min(...xs), y: Math.min(...ys) },
            topRight: { x: Math.max(...xs), y: Math.min(...ys) },
            bottomLeft: { x: Math.min(...xs), y: Math.max(...ys) },
            bottomRight: { x: Math.max(...xs), y: Math.max(...ys) },
        }
    }
    #adjustBlockCordinates() {
        this.#points.x = []
        this.#points.y = []

        this.#walkPointNodes((point: PointNode) => {
            const pointId = point.id!
            const startX = this.getOptionCurrent(
                this.#formatPointName('startX', pointId)
            )
            const startY = this.getOptionCurrent(
                this.#formatPointName('startY', pointId)
            )
            const endX = this.getOptionCurrent(
                this.#formatPointName('endX', pointId)
            )
            const endY = this.getOptionCurrent(
                this.#formatPointName('endY', pointId)
            )
            const startControlXName = this.#formatPointName(
                'startControlX',
                pointId
            )
            const startControlYName = this.#formatPointName(
                'startControlY',
                pointId
            )
            const endControlXName = this.#formatPointName(
                'endControlX',
                pointId
            )
            const endControlYName = this.#formatPointName(
                'endControlY',
                pointId
            )
            const startControlX = this.getOptionCurrent(startControlXName)
            const startControlY = this.getOptionCurrent(startControlYName)
            const endControlX = this.getOptionCurrent(endControlXName)
            const endControlY = this.getOptionCurrent(endControlYName)
            if (
                startX !== undefined &&
                startControlX !== undefined &&
                endControlX !== undefined &&
                endX !== undefined
            ) {
                const c1 = stationaryPoints(
                    startX,
                    startControlX,
                    endControlX,
                    endX
                )
                this.#points.x.push(...c1)
            }
            if (
                startY !== undefined &&
                startControlY !== undefined &&
                endControlY !== undefined &&
                endY !== undefined
            ) {
                const c2 = stationaryPoints(
                    startY,
                    startControlY,
                    endControlY,
                    endY
                )
                this.#points.y.push(...c2)
            }
            if (startX !== undefined) this.#points.x.push(startX)
            if (endX !== undefined) this.#points.x.push(endX)
            if (startY !== undefined) this.#points.y.push(startY)
            if (endY !== undefined) this.#points.y.push(endY)
        })
        const xMin = Math.min(...this.#points.x)
        const yMin = Math.min(...this.#points.y)
        const xMax = Math.max(...this.#points.x)
        const yMax = Math.max(...this.#points.y)
        const controlLineWidth = this.controlLineWidth() / 2
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

    #resetDefaultRunningEvents() {
        if (this.__isRunningEventActive(EDITABLE_RUNNING_EVENT)) {
            this.__updateRunningEvent(RESIZABLE_RUNNING_EVENT, false)
            this.__updateRunningEvent(DRAGGABLE_RUNNING_EVENT, false)
            this.__updateRunningEvent(ROTATABLE_RUNNING_EVENT, false)
        }
    }

    #buildPath(): Path2D {
        const path = new Path2D()
        this.#walkPointNodes((point: PointNode) => {
            const pointId = point.id!
            const startX = this.getOptionCurrent(
                this.#formatPointName('startX', pointId)
            )
            const startY = this.getOptionCurrent(
                this.#formatPointName('startY', pointId)
            )
            if (point.prev === undefined) {
                path.moveTo(startX, startY)
            }
            const endX = this.getOptionCurrent(
                this.#formatPointName('endX', pointId)
            )
            const endY = this.getOptionCurrent(
                this.#formatPointName('endY', pointId)
            )
            const startControlXName = this.#formatPointName(
                'startControlX',
                pointId
            )
            const startControlYName = this.#formatPointName(
                'startControlY',
                pointId
            )
            const endControlXName = this.#formatPointName(
                'endControlX',
                pointId
            )
            const endControlYName = this.#formatPointName(
                'endControlY',
                pointId
            )
            const startControlX = this.getOptionCurrent(startControlXName)
            const startControlY = this.getOptionCurrent(startControlYName)
            const endControlX = this.getOptionCurrent(endControlXName)
            const endControlY = this.getOptionCurrent(endControlYName)
            if (
                startControlX !== undefined &&
                startControlY !== undefined &&
                endControlX !== undefined &&
                endControlY !== undefined
            ) {
                path.bezierCurveTo(
                    startControlX,
                    startControlY,
                    endControlX,
                    endControlY,
                    endX,
                    endY
                )
            } else if (endX !== undefined && endY !== undefined) {
                path.lineTo(endX, endY)
            }
        })
        if (this.closeLine()) path.closePath()
        return path
    }
    #controllerPointsNotInBound(x: number, y: number) {
        let inBounds: boolean[] = []
        this.#walkPointNodes((point: PointNode) => {
            const pointId = point.id!

            const startDraggablePath = this.#formatPointName(
                START_DRAGGABLE_PATH,
                pointId
            )
            const endDraggablePath = this.#formatPointName(
                END_DRAGGABLE_PATH,
                pointId
            )
            const startControllablePath = this.#formatPointName(
                START_CONTROLLABLE_PATH,
                pointId
            )
            const endControllablePath = this.#formatPointName(
                END_CONTROLLABLE_PATH,
                pointId
            )
            const pathC1 = this.#pointsPath[startDraggablePath]
            const pathC2 = this.#pointsPath[startControllablePath]
            const pathC3 = this.#pointsPath[endDraggablePath]
            const pathC4 = this.#pointsPath[endControllablePath]
            const inBound =
                !this.#pathInBound(x, y, pathC1) &&
                !this.#pathInBound(x, y, pathC2) &&
                !this.#pathInBound(x, y, pathC3) &&
                !this.#pathInBound(x, y, pathC4)
            inBounds.push(inBound)
        })
        return inBounds.every(Boolean)
    }

    #buildInlineHotLines(): void {
        const context = this.context
        if (!this.__isRunningEventActive(EDITABLE_RUNNING_EVENT) || !context) {
            return
        }
        context.save()
        context.setLineDash([])
        const controlPointSize = this.controlPointsSize()
        const controlLineWidth = this.controlLineWidth()
        const controlPointBackgroundColor = this.controlPointBackgroundColor()
        const controlPointStrokeColor = this.controlPointStrokeColor()

        this.#walkPointNodes((point: PointNode) => {
            const pointId = point.id!
            const startX = this.getOptionCurrent(
                this.#formatPointName('startX', pointId)
            )
            const startY = this.getOptionCurrent(
                this.#formatPointName('startY', pointId)
            )
            const endX = this.getOptionCurrent(
                this.#formatPointName('endX', pointId)
            )
            const endY = this.getOptionCurrent(
                this.#formatPointName('endY', pointId)
            )
            const startControlXName = this.#formatPointName(
                'startControlX',
                pointId
            )
            const startControlYName = this.#formatPointName(
                'startControlY',
                pointId
            )
            const endControlXName = this.#formatPointName(
                'endControlX',
                pointId
            )
            const endControlYName = this.#formatPointName(
                'endControlY',
                pointId
            )
            const startControlX = this.getOptionCurrent(startControlXName)
            const startControlY = this.getOptionCurrent(startControlYName)
            const endControlX = this.getOptionCurrent(endControlXName)
            const endControlY = this.getOptionCurrent(endControlYName)
            const startDraggablePath = this.#formatPointName(
                START_DRAGGABLE_PATH,
                pointId
            )
            const endDraggablePath = this.#formatPointName(
                END_DRAGGABLE_PATH,
                pointId
            )
            const startControllablePath = this.#formatPointName(
                START_CONTROLLABLE_PATH,
                pointId
            )
            const endControllablePath = this.#formatPointName(
                END_CONTROLLABLE_PATH,
                pointId
            )

            this.beginPath()
            const pathLine = new Path2D()
            pathLine.moveTo(startX, startY)
            if (
                startControlX !== undefined &&
                startControlY !== undefined &&
                endControlX !== undefined &&
                endControlY !== undefined
            )
                pathLine.bezierCurveTo(
                    startControlX,
                    startControlY,
                    endControlX,
                    endControlY,
                    endX,
                    endY
                )
            else pathLine.lineTo(endX, endY)
            context.lineWidth = controlLineWidth
            context.strokeStyle = controlPointStrokeColor
            context.stroke(pathLine)

            if (startControlX !== undefined && startControlY !== undefined) {
                this.beginPath()
                const pathC2 = new Path2D()
                this.#pointsPath[startControllablePath] = pathC2
                pathC2.moveTo(startX, startY)
                pathC2.lineTo(startControlX, startControlY)
                pathC2.moveTo(startControlX, startControlY)
                pathC2.arc(
                    startControlX,
                    startControlY,
                    controlPointSize,
                    0,
                    Math.PI * 2
                )
                context.lineWidth = controlLineWidth
                context.strokeStyle = controlPointStrokeColor
                context.fillStyle = controlPointBackgroundColor
                context.stroke(pathC2)
                context.fill(pathC2)
            }
            if (endControlX !== undefined && endControlY !== undefined) {
                this.beginPath()
                const pathC3 = new Path2D()
                this.#pointsPath[endControllablePath] = pathC3
                pathC3.moveTo(endX, endY)
                pathC3.lineTo(endControlX, endControlY)
                pathC3.moveTo(endControlX, endControlY)
                pathC3.arc(
                    endControlX,
                    endControlY,
                    controlPointSize,
                    0,
                    Math.PI * 2
                )
                context.lineWidth = controlLineWidth
                context.strokeStyle = controlPointStrokeColor
                context.fillStyle = controlPointBackgroundColor
                context.stroke(pathC3)
                context.fill(pathC3)
            }

            this.beginPath()
            const pathC1 = new Path2D()
            this.#pointsPath[startDraggablePath] = pathC1
            pathC1.arc(startX, startY, controlPointSize, 0, Math.PI * 2)
            context.lineWidth = controlLineWidth
            context.strokeStyle = controlPointStrokeColor
            context.fillStyle = controlPointBackgroundColor
            context.stroke(pathC1)
            context.fill(pathC1)

            this.beginPath()
            const pathC4 = new Path2D()
            this.#pointsPath[endDraggablePath] = pathC4
            pathC4.arc(endX, endY, controlPointSize, 0, Math.PI * 2)
            context.lineWidth = controlLineWidth
            context.strokeStyle = controlPointStrokeColor
            context.fillStyle = controlPointBackgroundColor
            context.stroke(pathC4)
            context.fill(pathC4)
        })
        context.restore()
    }

    #pathInBound(x: number, y: number, path: Path2D, lineWidth?: number) {
        const context = this.context
        if (!context || !path) return false
        const centerX = this.rotationCenterX()
        const centerY = this.rotationCenterY()
        context.save()
        context.translate(centerX, centerY)
        context.rotate(this.rotate())
        context.translate(-centerX, -centerY)
        context.lineWidth = lineWidth ?? this.lineWidth()
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
                    block.#controllerPointsNotInBound(x, y)
                if (editable) {
                    block.__updateRunningEvent(EDITABLE_RUNNING_EVENT, false)
                    block.__resetCursor('auto')
                }
                block.__invokeChange()
            }
            block.#editableDbClickEvent = dblclick as any
            block.#editableClickEvent = click as any
            // @TODO: fix any issues
            block.__addEvent('dblclick', dblclick as any)
            block.__addEvent('click', click as any)
        }
    }
    #draggablePoints(
        block: LineBlock,
        opt: boolean,
        point: string,
        pointX: string,
        pointY: string,
        pathName: string
    ) {
        if (opt === undefined) return
        const mousedown = block.#controlPointEvents[point]?.mousedown
        const mousemove = block.#controlPointEvents[point]?.mousemove
        const mouseup = block.#controlPointEvents[point]?.mouseup
        if (!opt) {
            block.__updateRunningEvent(point, false)
            // @TODO: fix any issues
            if (mousedown) block.__removeEvent('mousedown', mousedown as any)
            if (mousemove) block.__removeEvent('mousemove', mousemove as any)
            if (mouseup) block.__removeEvent('mouseup', mouseup as any)
            block.#controlPointEvents[point].mousedown = undefined
            block.#controlPointEvents[point].mousemove = undefined
            block.#controlPointEvents[point].mouseup = undefined
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
            const mousedown = (event: MouseEvent) => {
                if (!block.__isRunningEventActive(EDITABLE_RUNNING_EVENT))
                    return
                const { x, y } = block.canvas?.getCursorPosition(event)!
                const path = block.#pointsPath[pathName]
                const inBound = path ? block.#pathInBound(x, y, path) : false
                if (inBound) {
                    block.__registerZIndex()
                    if (block.__ImFirst()) {
                        initCords = { x: x, y: y }
                        beforeCords = { x: 0, y: 0 }
                        const pointXCord = this.getOptionCurrent(pointX)
                        const pointYCord = this.getOptionCurrent(pointY)
                        beforeValues[pointX] = pointXCord
                        beforeValues[pointY] = pointYCord
                        block.__updateRunningEvent(point, true)
                    }
                }
            }

            const mousemove = (event: MouseEvent) => {
                if (block.__isRunningEventActive(point)) {
                    block.__updateRunningEvent(DRAGGABLE_RUNNING_EVENT, false)
                    const { x, y } = block.canvas?.getCursorPosition(event)!
                    let diffX = x - initCords.x
                    let diffY = y - initCords.y
                    const incX = diffX - beforeCords.x
                    const incY = diffY - beforeCords.y
                    if (incX !== 0 || incY !== 0) {
                        const angle = -block.rotate()
                        const cos = Math.cos(angle)
                        const sin = Math.sin(angle)
                        const pointIncX = incX * cos - incY * sin
                        const pointIncY = incX * sin + incY * cos
                        const pointXCord = this.getOptionCurrent(pointX)
                        const pointYCord = this.getOptionCurrent(pointY)
                        if (pointIncX !== 0)
                            block.setOptionCurrent(
                                pointX,
                                pointXCord + pointIncX
                            )
                        if (pointIncY !== 0)
                            block.setOptionCurrent(
                                pointY,
                                pointYCord + pointIncY
                            )
                        beforeCords.x = diffX
                        beforeCords.y = diffY
                    }
                    block.__invokeChange()
                }
            }
            const mouseup = () => {
                if (
                    block.__isRunningEventActive(point) &&
                    block.isMouseEventAllowed
                ) {
                    block.__unregisterZIndex()
                    block.__updateRunningEvent(point, false)
                    if (beforeCords.x !== 0 || beforeCords.y !== 0) {
                        const pointXCord = this.getOptionCurrent(pointX)
                        const pointYCord = this.getOptionCurrent(pointY)
                        const after: any = {}
                        after[pointX] = pointXCord
                        after[pointY] = pointYCord
                        block.__invokeHistory(beforeValues, after)
                        block.__invokeChange()
                    }
                }
            }
            block.#controlPointEvents[point] = {
                mousedown: mousedown as any,
                mousemove: mousemove as any,
                mouseup: mouseup as any,
            }
            block.__addEvent('mousedown', mousedown as any)
            block.__addEvent('mousemove', mousemove as any)
            block.__addEvent('mouseup', mouseup as any)
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
