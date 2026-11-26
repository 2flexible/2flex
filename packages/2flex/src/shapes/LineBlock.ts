import { type ColorType, type OwnOptionAccessors } from '../BaseBlock'
import { type DrawFunc, type ShapeBlockOptions } from '../ShapeBlock'
import { FillStyle, ShapeBlock } from '../ShapeBlock'
import {
    getPrototype,
    invalidArgument,
    requireRecord,
    stationaryPoints,
} from '../Utils'
import { type RelativeType } from '../types'
import { type Block } from '../Block'
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
    [key: string]: number | boolean | StickTo | undefined
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

export interface LineBlockOptions extends ShapeBlockOptions {
    controlPoints?: ControlPoint[]
    lineColor?: ColorType
    fillColor?: ColorType
    closeLine?: boolean
    controlPointsSize?: RelativeType
    controlLineWidth?: number
    controlPointBackgroundColor?: ColorType
    controlPointStrokeColor?: ColorType
    editable?: boolean
    // every control point registers its own options, which are named after
    // the point they belong to, so the keys of the options are dynamic
    [key: `${(typeof CONTROLPOINT_PROPERTY_NAMES)[number]}-${number}`]:
        | number
        | boolean
        | StickTo
        | undefined
}

interface LineBlockAccessors extends OwnOptionAccessors<
    LineBlockOptions,
    ShapeBlockOptions
> {}
type CustomPointEvents = {
    [key: string]: {
        enabled: boolean
        added: boolean
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

export class LineBlock<
    T extends LineBlockOptions = LineBlockOptions,
> extends ShapeBlock<T> {
    #path?: Path2D
    #pointsPath: PointsPath

    #headPointNode?: PointNode
    #tailPointNode?: PointNode

    #isEditable: boolean = false
    #editableEventsAdded: boolean = false

    #controlPointEvents: CustomPointEvents

    #cacheX?: number
    #cacheY?: number
    #cacheWidth?: number
    #cacheHeight?: number

    #points: { x: number[]; y: number[] } = { x: [], y: [] }

    #stickyDependencies: Map<Block, number> = new Map()

    constructor(options: LineBlockOptions) {
        super(options as T)
        this.#controlPointEvents = {}
        this.#pointsPath = {}
        this.#defineOptions()
    }

    set(options: T): void {
        super.set(options)
    }

    #defineOptions() {
        this.addProperty(
            'controlPoints',
            [],
            false,
            (block: LineBlock, opt: ControlPoint[]) =>
                this.#controlPoints(block, opt)
        )
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
        this.#path = this.#buildPath()
        const context = this.context
        if (!context) return

        context.fillStyle = this.fillColor()
        context.strokeStyle = this.lineColor()
        context.lineWidth = this.lineWidth() ?? 0
        context.fill(this.#path)
        context.stroke(this.#path)

        this.#buildInlineHotLines()
    }
    #handleRunningEditable() {
        const isEditable = this.__isRunningEventActive(EDITABLE_RUNNING_EVENT)
        this.hotLines(!isEditable)
        if (isEditable) this.__selectCursor('auto')
    }
    #getCurrentPoint<V = number>(point: string, pointId: number) {
        const pointName = this.#formatPointName(point, pointId)
        return this.getOptionCurrent<V>(pointName)
    }
    #getCachePoint<V = number>(point: string, pointId: number) {
        const pointName = this.#formatPointName(point, pointId)
        return this.getOptionCache<V>(pointName)
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
        const currentX = this.getOptionCurrent('x') ?? 0
        const currentY = this.getOptionCurrent('y') ?? 0
        const currentWidth = this.__boxWidth()
        const currentHeight = this.__boxHeight()

        let prevEndX: number
        let prevEndY: number
        let endDiffX: number
        let endDiffY: number
        this.#walkPointNodes((point: PointNode) => {
            const pointId = point.id!
            const stickyStart = this.#getCurrentPoint<StickTo>(
                'stickyStart',
                pointId
            )
            const sticktEnd = this.#getCurrentPoint<StickTo>(
                'stickyEnd',
                pointId
            )

            let startX = this.#getCurrentPoint('startX', pointId)
            let cacheStartX = this.#getCachePoint('startX', pointId) ?? 0
            let startY = this.#getCurrentPoint('startY', pointId)
            let cacheStartY = this.#getCachePoint('startY', pointId) ?? 0
            let endX = this.#getCurrentPoint('endX', pointId)
            let cacheEndX = this.#getCachePoint('endX', pointId) ?? 0
            let endY = this.#getCurrentPoint('endY', pointId)
            let cacheEndY = this.#getCachePoint('endY', pointId) ?? 0

            const startControlX = this.#getCurrentPoint(
                'startControlX',
                pointId
            )
            const startControlY = this.#getCurrentPoint(
                'startControlY',
                pointId
            )
            const endControlX = this.#getCurrentPoint('endControlX', pointId)
            const endControlY = this.#getCurrentPoint('endControlY', pointId)
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
                this.#setCurrentPoint('startControlX', pointId, startX ?? 0)
                cacheStartControlX = startX
            }
            if (startControlY === undefined) {
                this.#setCurrentPoint('startControlY', pointId, startY ?? 0)
                cacheStartControlY = startY
            }
            if (endControlX === undefined) {
                this.#setCurrentPoint('endControlX', pointId, endX ?? 0)
                cacheEndControlX = endX
            }
            if (endControlY === undefined) {
                this.#setCurrentPoint('endControlY', pointId, endY ?? 0)
                cacheEndControlY = endY
            }
            const diffX = currentX - cacheX!
            const diffY = currentY - cacheY!
            const diffW = currentWidth - cacheWidth!
            const diffH = currentHeight - cacheHeight!
            const dX = diffX + diffW
            const dY = diffY + diffH
            let resolvedStartX = startX ?? 0
            let resolvedEndX = endX ?? 0
            let resolvedStartY = startY ?? 0
            let resolvedEndY = endY ?? 0
            if (resolvedEndX > resolvedStartX) {
                resolvedStartX += diffX
                resolvedEndX += dX
            } else {
                resolvedStartX += dX
                resolvedEndX += diffX
            }

            if (resolvedEndY > resolvedStartY) {
                resolvedStartY += diffY
                resolvedEndY += dY
            } else {
                resolvedStartY += dY
                resolvedEndY += diffY
            }

            if (stickyStart !== undefined) {
                const currX = stickyStart.block?.getOptionCurrent('x') ?? 0
                const currY = stickyStart.block?.getOptionCurrent('y') ?? 0
                resolvedStartX = currX + (stickyStart.x ?? 0)
                resolvedStartY = currY + (stickyStart.y ?? 0)
            }

            if (sticktEnd !== undefined) {
                const currX = sticktEnd.block?.getOptionCurrent('x') ?? 0
                const currY = sticktEnd.block?.getOptionCurrent('y') ?? 0
                resolvedEndX = currX + (sticktEnd.x ?? 0)
                resolvedEndY = currY + (sticktEnd.y ?? 0)
            }

            const startXDiff = endDiffX ?? resolvedStartX - cacheStartX
            const startYDiff = endDiffY ?? resolvedStartY - cacheStartY
            const endXDiff = resolvedEndX - cacheEndX
            const endYDiff = resolvedEndY - cacheEndY

            if (startXDiff !== 0) {
                this.#setCurrentPoint(
                    'startControlX',
                    pointId,
                    (cacheStartControlX ?? 0) + startXDiff
                )
            }
            if (startYDiff !== 0) {
                this.#setCurrentPoint(
                    'startControlY',
                    pointId,
                    (cacheStartControlY ?? 0) + startYDiff
                )
            }
            if (endXDiff !== 0) {
                this.#setCurrentPoint(
                    'endControlX',
                    pointId,
                    (cacheEndControlX ?? 0) + endXDiff
                )
            }
            if (endYDiff !== 0) {
                this.#setCurrentPoint(
                    'endControlY',
                    pointId,
                    (cacheEndControlY ?? 0) + endYDiff
                )
            }
            endDiffX = endXDiff
            endDiffY = endYDiff

            if (prevEndX !== undefined) {
                this.#setCurrentPoint('startX', pointId, prevEndX)
            } else this.#setCurrentPoint('startX', pointId, resolvedStartX)
            if (prevEndY !== undefined) {
                this.#setCurrentPoint('startY', pointId, prevEndY)
            } else this.#setCurrentPoint('startY', pointId, resolvedStartY)

            this.#setCurrentPoint('endX', pointId, resolvedEndX)
            this.#setCurrentPoint('endY', pointId, resolvedEndY)
            prevEndX = cacheEndX
            prevEndY = cacheEndY
        })

        this.#adjustBlockCordinates()

        this.#cacheX = this.x()
        this.#cacheY = this.y()
        this.#cacheWidth = this.__boxWidth()
        this.#cacheHeight = this.__boxHeight()
    }

    updateCords(): void {
        super.updateCords()
        this.#adjsutBoundingBox()
    }
    // a line sizes itself from its points, so it does not take the size of its childs
    __deriveSizeFromChilds(): boolean {
        return false
    }
    addControlPoint(point: ControlPoint, index: number) {
        requireRecord(
            `${this.constructor.name}.addControlPoint()`,
            'point',
            point
        )
        if (!Number.isInteger(index))
            invalidArgument(
                `${this.constructor.name}.addControlPoint()`,
                'index',
                'an integer',
                index
            )
        let foundPoint = this.#findPointNode((p) => p.id === index)
        if (!foundPoint) foundPoint = this.#tailPointNode
        const newPoint = this.#createPointNode(this.#nextPointId(), point)
        this.#addPointAfter(newPoint, foundPoint)
    }
    removeControlPoint(index: number) {
        if (!Number.isInteger(index))
            invalidArgument(
                `${this.constructor.name}.removeControlPoint()`,
                'index',
                'an integer',
                index
            )
        const foundPoint = this.#findPointNode((p) => p.id === index)
        if (foundPoint) this.#removePoint(foundPoint)
    }
    addControlPointToTail(point: ControlPoint) {
        requireRecord(
            `${this.constructor.name}.addControlPointToTail()`,
            'point',
            point
        )
        const newPoint = this.#createPointNode(this.#nextPointId(), point)
        this.#addPointAfter(newPoint, this.#tailPointNode)
    }
    addControlPointToHead(point: ControlPoint) {
        requireRecord(
            `${this.constructor.name}.addControlPointToHead()`,
            'point',
            point
        )
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
        const blocks = new Set<Block>()
        while (node) {
            const next = node.next
            if (node.stickyStart?.block) blocks.add(node.stickyStart.block)
            if (node.stickyEnd?.block) blocks.add(node.stickyEnd.block)
            this.#removePointProperties(node.id!)
            node.prev = undefined
            node.next = undefined
            node = next
        }
        for (const block of blocks) this.removeDependency(block)
    }
    #removePointProperties(id: number) {
        for (const key of CONTROLPOINT_PROPERTY_NAMES) {
            const propertyName = this.#formatPointName(key, id)
            this.removeProperty(propertyName)
        }
    }
    #holdStickyDependency(block: Block) {
        const held = (this.#stickyDependencies.get(block) ?? 0) + 1
        this.#stickyDependencies.set(block, held)
        this.addDependency(block)
    }
    #releaseStickyDependency(block: Block) {
        const held = this.#stickyDependencies.get(block) ?? 0
        if (held <= 1) {
            this.#stickyDependencies.delete(block)
            this.removeDependency(block)
            return
        }
        this.#stickyDependencies.set(block, held - 1)
    }
    #releasePointStickyDependencies(point: PointNode) {
        const blocks = new Set(
            [point.stickyStart?.block, point.stickyEnd?.block].filter(
                (block): block is Block => block !== undefined
            )
        )
        for (const block of blocks) this.#releaseStickyDependency(block)
    }
    #restickDependentBlock(
        block: LineBlock,
        pointId: number,
        property: 'stickyStart' | 'stickyEnd',
        opt?: StickTo
    ) {
        const point = this.#findPointNode((p) => p.id === pointId)
        const previous =
            property === 'stickyStart'
                ? point?.stickyStart?.block
                : point?.stickyEnd?.block
        const next = opt?.block
        if (point) {
            if (property === 'stickyStart') point.stickyStart = opt
            else point.stickyEnd = opt
        }
        if (previous === next) return
        if (previous) block.#releaseStickyDependency(previous)
        if (next) block.#holdStickyDependency(next)
    }
    #createPointNode(id: number, point: ControlPoint): PointNode {
        const controlPoint = new PointNode(id)
        this.#addPointProperties(id)
        controlPoint.stickyStart = point.stickyStart
        controlPoint.stickyEnd = point.stickyEnd
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
            (block: LineBlock, opt?: boolean) =>
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
            (block: LineBlock, opt?: boolean) =>
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
            (block: LineBlock, opt?: boolean) =>
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
            (block: LineBlock, opt?: boolean) =>
                this.#draggablePoints(
                    block,
                    opt,
                    endControllable,
                    endControlX,
                    endControlY,
                    endControllablePath
                )
        )
        this.addProperty(
            stickyStart,
            undefined,
            false,
            (block: LineBlock, opt?: StickTo) =>
                this.#restickDependentBlock(block, id, 'stickyStart', opt)
        )
        this.addProperty(
            stickyEnd,
            undefined,
            false,
            (block: LineBlock, opt?: StickTo) =>
                this.#restickDependentBlock(block, id, 'stickyEnd', opt)
        )
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
            this.#detachPoint(point)
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
        this.#detachPoint(point)
    }
    #detachPoint(point: PointNode) {
        const pointId = point.id
        if (pointId !== undefined) this.#releasePointStickyDependencies(point)
        if (pointId !== undefined) this.#removePointProperties(pointId)
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
        const rotate = this.__rotation() || 0
        const rot = (x: number, y: number) =>
            this.__rotateCordiantesByCenter(x, y, rotate)

        const xs: number[] = []
        const ys: number[] = []

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
            const startControlX =
                this.getOptionCurrent<number>(startControlXName)
            const startControlY =
                this.getOptionCurrent<number>(startControlYName)
            const endControlX = this.getOptionCurrent<number>(endControlXName)
            const endControlY = this.getOptionCurrent<number>(endControlYName)
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
        if (xs.length === 0 || ys.length === 0) {
            this.boundingBox = this.#boundingBoxFromCorners()
            return
        }
        const minX = Math.min(...xs)
        const minY = Math.min(...ys)
        const maxX = Math.max(...xs)
        const maxY = Math.max(...ys)
        if (
            !Number.isFinite(minX) ||
            !Number.isFinite(minY) ||
            !Number.isFinite(maxX) ||
            !Number.isFinite(maxY)
        ) {
            this.boundingBox = this.#boundingBoxFromCorners()
            return
        }
        this.boundingBox = {
            topLeft: { x: minX, y: minY },
            topRight: { x: maxX, y: minY },
            bottomLeft: { x: minX, y: maxY },
            bottomRight: { x: maxX, y: maxY },
        }
    }
    #boundingBoxFromCorners() {
        const cornerTopLeft = this.getOptionCurrent('cornerTopLeft')
        const cornerTopRight = this.getOptionCurrent('cornerTopRight')
        const cornerBottomLeft = this.getOptionCurrent('cornerBottomLeft')
        const cornerBottomRight = this.getOptionCurrent('cornerBottomRight')
        const corners = [
            cornerTopLeft,
            cornerTopRight,
            cornerBottomLeft,
            cornerBottomRight,
        ]
        const valid = corners.filter(
            (corner): corner is { x: number; y: number } =>
                !!corner &&
                Number.isFinite(corner.x) &&
                Number.isFinite(corner.y)
        )
        if (valid.length === 0) {
            return {
                topLeft: { x: 0, y: 0 },
                topRight: { x: 0, y: 0 },
                bottomLeft: { x: 0, y: 0 },
                bottomRight: { x: 0, y: 0 },
            }
        }
        const minX = Math.min(...valid.map((corner) => corner.x))
        const minY = Math.min(...valid.map((corner) => corner.y))
        const maxX = Math.max(...valid.map((corner) => corner.x))
        const maxY = Math.max(...valid.map((corner) => corner.y))
        return {
            topLeft: { x: minX, y: minY },
            topRight: { x: maxX, y: minY },
            bottomLeft: { x: minX, y: maxY },
            bottomRight: { x: maxX, y: maxY },
        }
    }
    #adjustBlockCordinates() {
        this.#points.x = []
        this.#points.y = []

        this.#walkPointNodes((point: PointNode) => {
            const pointId = point.id!
            const startX = this.getOptionCurrent<number>(
                this.#formatPointName('startX', pointId)
            )!
            const startY = this.getOptionCurrent<number>(
                this.#formatPointName('startY', pointId)
            )!
            const endX = this.getOptionCurrent<number>(
                this.#formatPointName('endX', pointId)
            )!
            const endY = this.getOptionCurrent<number>(
                this.#formatPointName('endY', pointId)
            )!
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
            const startControlX =
                this.getOptionCurrent<number>(startControlXName)
            const startControlY =
                this.getOptionCurrent<number>(startControlYName)
            const endControlX = this.getOptionCurrent<number>(endControlXName)
            const endControlY = this.getOptionCurrent<number>(endControlYName)
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
        if (this.#points.x.length === 0 || this.#points.y.length === 0) {
            this.#keepBlockCordinatesWithoutPoints()
            return
        }
        const xMin = Math.min(...this.#points.x)
        const yMin = Math.min(...this.#points.y)
        const xMax = Math.max(...this.#points.x)
        const yMax = Math.max(...this.#points.y)
        if (
            !Number.isFinite(xMin) ||
            !Number.isFinite(yMin) ||
            !Number.isFinite(xMax) ||
            !Number.isFinite(yMax)
        ) {
            this.#keepBlockCordinatesWithoutPoints()
            return
        }
        const controlLineWidth = this.controlLineWidth() / 2
        this.setOptionCurrent('x', xMin - controlLineWidth)
        this.setOptionCurrent('y', yMin - controlLineWidth)
        this.setOptionCurrent(
            'width',
            xMax -
                xMin +
                controlLineWidth -
                this.paddingLeft() -
                this.paddingRight()
        )
        this.setOptionCurrent(
            'height',
            yMax -
                yMin +
                controlLineWidth -
                this.paddingTop() -
                this.paddingBottom()
        )
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

    #keepBlockCordinatesWithoutPoints() {
        const x = this.getOptionCurrent('x')
        const y = this.getOptionCurrent('y')
        const width = this.getOptionCurrent('width')
        const height = this.getOptionCurrent('height')
        const safeX = x !== undefined && Number.isFinite(x) ? x : 0
        const safeY = y !== undefined && Number.isFinite(y) ? y : 0
        const safeWidth =
            width !== undefined && Number.isFinite(width) ? width : 0
        const safeHeight =
            height !== undefined && Number.isFinite(height) ? height : 0
        this.setOptionCurrent('x', safeX)
        this.setOptionCurrent('y', safeY)
        this.setOptionCurrent('width', safeWidth)
        this.setOptionCurrent('height', safeHeight)
        this.setOptionCurrent('cornerTopLeft', { x: safeX, y: safeY })
        this.setOptionCurrent('cornerTopRight', {
            x: safeX + safeWidth,
            y: safeY,
        })
        this.setOptionCurrent('cornerBottomLeft', {
            x: safeX,
            y: safeY + safeHeight,
        })
        this.setOptionCurrent('cornerBottomRight', {
            x: safeX + safeWidth,
            y: safeY + safeHeight,
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
            const startX = this.getOptionCurrent<number>(
                this.#formatPointName('startX', pointId)
            )!
            const startY = this.getOptionCurrent<number>(
                this.#formatPointName('startY', pointId)
            )!
            if (point.prev === undefined) {
                path.moveTo(startX, startY)
            }
            const endX = this.getOptionCurrent<number>(
                this.#formatPointName('endX', pointId)
            )!
            const endY = this.getOptionCurrent<number>(
                this.#formatPointName('endY', pointId)
            )!
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
            const startControlX =
                this.getOptionCurrent<number>(startControlXName)
            const startControlY =
                this.getOptionCurrent<number>(startControlYName)
            const endControlX = this.getOptionCurrent<number>(endControlXName)
            const endControlY = this.getOptionCurrent<number>(endControlYName)
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
        const inBounds: boolean[] = []
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
            const startX = this.getOptionCurrent<number>(
                this.#formatPointName('startX', pointId)
            )!
            const startY = this.getOptionCurrent<number>(
                this.#formatPointName('startY', pointId)
            )!
            const endX = this.getOptionCurrent<number>(
                this.#formatPointName('endX', pointId)
            )!
            const endY = this.getOptionCurrent<number>(
                this.#formatPointName('endY', pointId)
            )!
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
            const startControlX =
                this.getOptionCurrent<number>(startControlXName)
            const startControlY =
                this.getOptionCurrent<number>(startControlYName)
            const endControlX = this.getOptionCurrent<number>(endControlXName)
            const endControlY = this.getOptionCurrent<number>(endControlYName)
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
        context.rotate(this.__rotation())
        context.translate(-centerX, -centerY)
        context.lineWidth = lineWidth ?? this.lineWidth()
        const inStroke = context.isPointInStroke(path, x, y)
        const inPath = context.isPointInPath(path, x, y)
        context.restore()
        return inStroke || inPath
    }
    #editable(block: LineBlock, opt?: boolean) {
        if (opt === undefined || block.#isEditable === opt) return
        block.#isEditable = opt
        if (!opt) {
            block.__updateRunningEvent(EDITABLE_RUNNING_EVENT, false)
            return
        }
        if (block.#editableEventsAdded) return
        block.#editableEventsAdded = true

        const dblclick = (event: MouseEvent) => {
            if (!block.#isEditable || !block.selectable()) return
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
            if (!block.#isEditable) return
            const { x, y } = block.canvas?.getCursorPosition(event)!
            const editable =
                !block.#pathInBound(x, y, block.#buildPath()) &&
                block.#controllerPointsNotInBound(x, y)
            if (editable) {
                block.__updateRunningEvent(EDITABLE_RUNNING_EVENT, false)
                block.__resetCursor('auto')
            }
            block.__invokeChange()
        }
        block.__addEvent<MouseEvent>('dblclick', dblclick)
        block.__addEvent<MouseEvent>('click', click)
    }
    #draggablePoints(
        block: LineBlock,
        opt: boolean | undefined,
        point: string,
        pointX: string,
        pointY: string,
        pathName: string
    ) {
        if (opt === undefined) return
        const state = (block.#controlPointEvents[point] ??= {
            enabled: false,
            added: false,
        })
        if (state.enabled === opt) return
        state.enabled = opt
        if (!opt) {
            block.__updateRunningEvent(point, false)
            return
        }
        if (state.added) return
        state.added = true

        let initCords = { x: 0, y: 0 }
        let beforeCords = { x: 0, y: 0 }
        const beforeValues: Record<string, unknown> = {}
        const mousedown = (event: MouseEvent) => {
            if (
                !state.enabled ||
                !block.__isRunningEventActive(EDITABLE_RUNNING_EVENT)
            )
                return
            const { x, y } = block.canvas?.getCursorPosition(event)!
            const path = block.#pointsPath[pathName]
            const inBound = path ? block.#pathInBound(x, y, path) : false
            if (inBound) {
                block.__registerZIndex()
                if (block.__ImFirst()) {
                    initCords = { x: x, y: y }
                    beforeCords = { x: 0, y: 0 }
                    const pointXCord = this.getOptionCurrent<number>(pointX)
                    const pointYCord = this.getOptionCurrent<number>(pointY)
                    beforeValues[pointX] = pointXCord
                    beforeValues[pointY] = pointYCord
                    block.__updateRunningEvent(point, true)
                }
            }
        }

        const mousemove = (event: MouseEvent) => {
            if (!state.enabled) return
            if (block.__isRunningEventActive(point)) {
                block.__updateRunningEvent(DRAGGABLE_RUNNING_EVENT, false)
                const { x, y } = block.canvas?.getCursorPosition(event)!
                const diffX = x - initCords.x
                const diffY = y - initCords.y
                const incX = diffX - beforeCords.x
                const incY = diffY - beforeCords.y
                if (incX !== 0 || incY !== 0) {
                    const angle = -block.__rotation()
                    const cos = Math.cos(angle)
                    const sin = Math.sin(angle)
                    const pointIncX = incX * cos - incY * sin
                    const pointIncY = incX * sin + incY * cos
                    const pointXCord =
                        this.getOptionCurrent<number>(pointX) ?? 0
                    const pointYCord =
                        this.getOptionCurrent<number>(pointY) ?? 0
                    if (pointIncX !== 0)
                        block.setOptionCurrent(pointX, pointXCord + pointIncX)
                    if (pointIncY !== 0)
                        block.setOptionCurrent(pointY, pointYCord + pointIncY)
                    beforeCords.x = diffX
                    beforeCords.y = diffY
                }
                block.__invokeChange()
            }
        }
        const mouseup = () => {
            if (!state.enabled) return
            if (
                block.__isRunningEventActive(point) &&
                block.isMouseEventAllowed
            ) {
                block.__unregisterZIndex()
                block.__updateRunningEvent(point, false)
                if (beforeCords.x !== 0 || beforeCords.y !== 0) {
                    const pointXCord = this.getOptionCurrent<number>(pointX)
                    const pointYCord = this.getOptionCurrent<number>(pointY)
                    const after: Record<string, unknown> = {}
                    after[pointX] = pointXCord
                    after[pointY] = pointYCord
                    block.__invokeHistory(beforeValues, after)
                    block.__invokeChange()
                }
            }
        }
        block.__addEvent<MouseEvent>('mousedown', mousedown)
        block.__addEvent<MouseEvent>('mousemove', mousemove)
        block.__addEvent<MouseEvent>('mouseup', mouseup)
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

export interface LineBlock extends LineBlockAccessors {}
