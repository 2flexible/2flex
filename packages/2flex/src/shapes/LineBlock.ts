import { IShapeOptions, ShapeBlock } from '../ShapeBlock'
import type { Block, RelativeType } from '../Block'
import type { IBlock } from '../types'
import { checkInBound, cubicBezier, getPrototype } from '../Utils'

interface StickyLine {
    block?: Block
    x: number
    y: number
}

type LineType = 'line' | 'cubicBezier'

interface ILineOptions extends IShapeOptions {
    lineType: LineType
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
    lineWidth?: number
    lineColor?: string
    backgroundColor?: string
    closeLine?: boolean
    joinTo?: LineBlock
    controlPointsSize?: number
    editable?: boolean
    stickStart?: StickyLine
    stickEnd?: StickyLine
}

export class LineBlock extends ShapeBlock<ILineOptions> {
    path?: Path2D
    pathLine?: Path2D
    pathC1?: Path2D
    pathC2?: Path2D
    pathC3?: Path2D
    pathC4?: Path2D
    __joined = false
    __editable = false
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

    #oldCords = {
        x: this.ownOptions.x || 0,
        y: this.ownOptions.y || 0,
        width: this.ownOptions.width || 0,
        height: this.ownOptions.height || 0,
    }

    constructor(options: IBlock<ILineOptions>) {
        super(options)
    }
    render(): void {
        this.#boundingBox()
        this.#handleSticky()
        super.render()
        if (this.__runningEvents.selected || this.__editable) {
            this.__hotLines()
            if (this.joinTo() !== undefined) this.joinTo()!.__hotLines()
        }
        if (this.__editable) this.__runningEvents.selected = false
    }

    __initCordinates(): void {
        this.#boundingBox()
        this.ownOptions.x = this.#oldCords.x
        this.ownOptions.y = this.#oldCords.y
        this.ownOptions.width = this.#oldCords.width
        this.ownOptions.height = this.#oldCords.height
        super.__initCordinates()
    }

    joinTo(opt?: LineBlock) {
        const join = this.__valueHandler<LineBlock, LineBlock | undefined>(
            opt,
            'joinTo',
            undefined
        )
        if (join !== undefined) join.__joined = true
        return join
    }

    draw(_func?: (context: CanvasRenderingContext2D) => void): void {
        if (this.joinTo() !== undefined) {
            const joined = this.joinTo()
            this.path = joined!.path || new Path2D()
            this.startX(joined!.endX())
            this.startY(joined!.endY())
            this.zIndex(joined!.zIndex())
            this.__editable = joined!.__editable
        } else {
            this.path = new Path2D()
            this.path!.moveTo(this.startX(), this.startY())
        }

        if (this.lineType() === 'cubicBezier') {
            this.path!.bezierCurveTo(
                this.startControlX(),
                this.startControlY(),
                this.endControlX(),
                this.endControlY(),
                this.endX(),
                this.endY()
            )
        } else {
            this.path!.lineTo(this.endX(), this.endY())
        }
        if (this.closeLine()) this.path!.closePath()
        if (this.fill()) this.context?.fill(this.path!)
        if (this.stroke()) this.context?.stroke(this.path!)
    }

    __hotLines(): void {
        if (!this.context) return
        if (!this.__editable) {
            if (!this.__joined) super.__hotLines()
            return
        }

        this.context?.save()
        this.context?.translate(this.rotationCenterX(), this.rotationCenterY())
        this.context?.rotate(this.rotate())
        this.context?.translate(
            -this.rotationCenterX(),
            -this.rotationCenterY()
        )
        this.context.setLineDash([])

        this.beginPath()
        this.pathLine = new Path2D()
        this.pathLine.moveTo(this.startX(), this.startY())
        this.pathLine.bezierCurveTo(
            this.startControlX(),
            this.startControlY(),
            this.endControlX(),
            this.endControlY(),
            this.endX(),
            this.endY()
        )
        this.context.lineWidth = 1
        this.context.strokeStyle = 'blue'
        this.context.stroke(this.pathLine)

        this.beginPath()
        this.pathC1 = new Path2D()
        this.pathC1.arc(
            this.startX(),
            this.startY(),
            this.controlPointsSize(),
            0,
            Math.PI * 2
        )
        this.context.lineWidth = 2
        this.context.strokeStyle = 'blue'
        this.context.fillStyle = 'white'
        this.context.stroke(this.pathC1)
        this.context.fill(this.pathC1)
        this.beginPath()

        this.pathC4 = new Path2D()
        this.pathC4.arc(
            this.endX(),
            this.endY(),
            this.controlPointsSize(),
            0,
            Math.PI * 2
        )
        this.context.lineWidth = 2
        this.context.strokeStyle = 'blue'
        this.context.fillStyle = 'white'
        this.context.stroke(this.pathC4)
        this.context.fill(this.pathC4)

        if (this.startControllable() && this.lineType() === 'cubicBezier') {
            this.beginPath()
            this.context.moveTo(this.startX(), this.startY())
            this.context.lineTo(this.startControlX(), this.startControlY())
            this.pathC2 = new Path2D()
            this.pathC2.arc(
                this.startControlX(),
                this.startControlY(),
                this.controlPointsSize(),
                0,
                Math.PI * 2
            )
            this.context.lineWidth = 1
            this.context.strokeStyle = 'blue'
            this.context.fillStyle = 'white'
            this.context.stroke()
            this.context.stroke(this.pathC2)
            this.context.fill(this.pathC2)
        }

        if (this.endControllable() && this.lineType() === 'cubicBezier') {
            this.beginPath()
            this.context.moveTo(this.endX(), this.endY())
            this.context.lineTo(this.endControlX(), this.endControlY())
            this.pathC3 = new Path2D()
            this.pathC3.arc(
                this.endControlX(),
                this.endControlY(),
                this.controlPointsSize(),
                0,
                Math.PI * 2
            )
            this.context.lineWidth = 1
            this.context.strokeStyle = 'blue'
            this.context.fillStyle = 'white'
            this.context.stroke()
            this.context.stroke(this.pathC3)
            this.context.fill(this.pathC3)
        }
        this.context?.restore()
    }

    checkInBound(_event: MouseEvent): boolean {
        const { x, y } = this.canvas?.getCursorPosition(_event) || {
            x: 0,
            y: 0,
        }
        let inBound = false
        this.lineWidth()
        if (!this.__runningEvents.selected) {
            inBound = this.#pathInBound(x, y, this.path!)
        } else if (!this.__editable) {
            inBound = checkInBound(
                x,
                y,
                this.hotCornerTopLeft().x,
                this.hotCornerTopLeft().y,
                this.hotCornerTopRight().x,
                this.hotCornerTopRight().y,
                this.hotCornerBottomLeft().x,
                this.hotCornerBottomLeft().y,
                this.hotCornerBottomRight().x,
                this.hotCornerBottomRight().y
            )
        }
        if (inBound) this.canvas?.registerZIndex({ in: this.zIndex() })
        else this.canvas?.registerZIndex({ out: this.zIndex() })
        return inBound
    }

    lineType(opt?: LineType) {
        return this.__valueHandler(opt, 'type', 'line')
    }

    x(opt?: number | string): number {
        let cacheX = this.__unitConverter<RelativeType, number>({
            val: this.ownOptions.x || 0,
            widthRelated: false,
        })
        // this.ownOptions.x = this.#oldCords.x;
        const x = super.x(opt)
        const diffX = x - cacheX
        if (diffX !== 0) {
            this.startX(this.startX() + diffX)
            this.endX(this.endX() + diffX)
        }
        return x
    }
    y(opt?: number | string): number {
        let cacheY = this.__unitConverter<RelativeType, number>({
            val: this.ownOptions.y || 0,
            widthRelated: false,
        })
        // this.ownOptions.y = this.#oldCords.y;
        const y = super.y(opt)
        const diffY = y - cacheY
        if (diffY !== 0) {
            this.startY(this.startY() + diffY)
            this.endY(this.endY() + diffY)
        }
        return y
    }
    width(opt?: number | string): number {
        let cacheW = this.__unitConverter<RelativeType, number>({
            val: this.ownOptions.width || 0,
            widthRelated: false,
        })
        const w = super.width(opt)
        if (w < this.minWidth() && !this.horizontalFlipResize())
            return this.minWidth()
        const diffW = w - cacheW
        if (diffW !== 0) {
            const cR = this.rotate()
            this.rotate(0)
            const joined = this.joinTo()
            if (joined) {
                if (this.endX() > joined.startX()) {
                    this.endX(this.endX() + diffW)
                    joined.endX(joined.endX() + diffW)
                } else {
                    joined.startX(joined.startX() + diffW)
                    this.startX(this.startX() + diffW)
                }
            } else {
                if (this.endX() > this.startX()) this.endX(this.endX() + diffW)
                else this.startX(this.startX() + diffW)
            }
            // this.ownOptions.width = this.#oldCords.width;

            this.rotate(cR)
        }
        return w
    }
    height(opt?: number | string): number {
        const cacheH = this.__unitConverter<RelativeType, number>({
            val: this.ownOptions.height || 0,
            widthRelated: false,
        })
        const h = super.height(opt)

        if (h < this.minHeight() && !this.verticalFlipResize())
            return this.minHeight()

        const diffH = h - cacheH
        if (diffH !== 0) {
            const cR = this.rotate()
            this.rotate(0)
            const joined = this.joinTo()
            if (joined) {
                if (this.endY() > joined.startY()) {
                    this.endY(this.endY() + diffH)
                    joined.endY(joined.endY() + diffH)
                } else {
                    joined.startY(joined.startY() + diffH)
                    this.startY(this.startY() + diffH)
                }
            } else {
                if (this.endY() > this.startY()) this.endY(this.endY() + diffH)
                else this.startY(this.startY() + diffH)
            }
            // this.ownOptions.height = this.#oldCords.height;
            this.rotate(cR)
        }
        return h
    }

    startX(opt?: number) {
        const cacheX = this.__unitConverter<RelativeType, number>({
            val: this.ownOptions.startX || 0,
            widthRelated: false,
        })
        let x = this.__valueHandler<number, number | undefined>(
            opt,
            'startX',
            undefined
        )
        if (x === undefined) x = this.x()
        const diffX = x - cacheX
        if (diffX !== 0 && this.lineType() == 'cubicBezier')
            this.startControlX(this.startControlX() + diffX)
        return x
    }
    startY(opt?: number) {
        const cacheY = this.__unitConverter<RelativeType, number>({
            val: this.ownOptions.startY || 0,
            widthRelated: false,
        })
        let y = this.__valueHandler<number, number | undefined>(
            opt,
            'startY',
            undefined
        )
        if (y === undefined) y = this.y()
        const diffY = y - cacheY
        if (diffY !== 0 && this.lineType() == 'cubicBezier')
            this.startControlY(this.startControlY() + diffY)
        return y
    }
    endX(opt?: number) {
        const cacheX = this.__unitConverter<RelativeType, number>({
            val: this.ownOptions.endX || 0,
            widthRelated: false,
        })
        let x = this.__valueHandler<number, number | undefined>(
            opt,
            'endX',
            undefined
        )
        if (x === undefined) x = this.x() + this.width()
        const diffX = x - cacheX
        if (diffX !== 0 && this.lineType() == 'cubicBezier')
            this.endControlX(this.endControlX() + diffX)
        return x
    }
    endY(opt?: number) {
        const cacheY = this.__unitConverter<RelativeType, number>({
            val: this.ownOptions.endY || 0,
            widthRelated: false,
        })
        let y = this.__valueHandler<number, number | undefined>(
            opt,
            'endY',
            undefined
        )
        if (y === undefined) y = this.y() + this.height()
        const diffY = y - cacheY
        if (diffY !== 0 && this.lineType() == 'cubicBezier')
            this.endControlY(this.endControlY() + diffY)
        return y
    }
    startControlX(opt?: number) {
        const x = this.__valueHandler(opt, 'startControlX', undefined)
        if (x === undefined) return this.startX()
        return x
    }
    startControlY(opt?: number) {
        const y = this.__valueHandler(opt, 'startControlY', undefined)
        if (y === undefined) return this.startY()
        return y
    }
    endControlX(opt?: number) {
        const x = this.__valueHandler(opt, 'endControlX', undefined)
        if (x === undefined) return this.endX()
        return x
    }
    endControlY(opt?: number) {
        const y = this.__valueHandler(opt, 'endControlY', undefined)
        if (y === undefined) return this.endY()
        return y
    }
    stickStart(opt?: StickyLine): StickyLine {
        return this.__valueHandler(opt, 'stickStart', {
            block: undefined,
            x: 0,
            y: 0,
        })
    }
    stickEnd(opt?: StickyLine): StickyLine {
        return this.__valueHandler(opt, 'stickEnd', {
            block: undefined,
            x: 0,
            y: 0,
        })
    }
    startDraggable(opt?: boolean) {
        const draggable = this.__valueHandler(opt, 'startDraggable', false)
        if (draggable)
            this.#draggablePoints(
                'startX',
                'startY',
                'pathC1',
                'startDraggable'
            )
        return draggable
    }
    endDraggable(opt?: boolean) {
        const draggable = this.__valueHandler(opt, 'endDraggable', false)
        if (draggable)
            this.#draggablePoints('endX', 'endY', 'pathC4', 'endDraggable')
        return draggable
    }

    startControllable(opt?: boolean) {
        const draggable = this.__valueHandler(opt, 'startControllable', false)
        if (draggable && this.lineType() === 'cubicBezier')
            this.#draggablePoints(
                'startControlX',
                'startControlY',
                'pathC2',
                'startControllable'
            )
        return draggable
    }
    endControllable(opt?: boolean) {
        const draggable = this.__valueHandler(opt, 'endControllable', false)
        if (draggable && this.lineType() === 'cubicBezier')
            this.#draggablePoints(
                'endControlX',
                'endControlY',
                'pathC3',
                'endControllable'
            )
        return draggable
    }

    controlPointsSize(opt?: number) {
        return this.__valueHandler(opt, 'controlPointsSize', 4)
    }

    editable(opt?: boolean) {
        const editable = this.__valueHandler(opt, 'editable', false)
        if (!editable) return editable

        const dblclick = (event: MouseEvent) => {
            const { x, y } = this.canvas?.getCursorPosition(event) || {
                x: 0,
                y: 0,
            }
            if (this.#pathInBound(x, y, this.path!)) {
                this.__editable = true
                this.canvas?.invokeChange()
            }
        }
        const click = (event: MouseEvent) => {
            const { x, y } = this.canvas?.getCursorPosition(event) || {
                x: 0,
                y: 0,
            }
            let editable =
                !this.#pathInBound(x, y, this.path!) &&
                !this.#pathInBound(x, y, this.pathC1!) &&
                !this.#pathInBound(x, y, this.pathC2!) &&
                !this.#pathInBound(x, y, this.pathC3!) &&
                !this.#pathInBound(x, y, this.pathC4!)

            if (editable) {
                this.__editable = false
            }
            const join = this.joinTo()
            if (
                join !== undefined &&
                !this.#pathInBound(x, y, join!.pathC1!) &&
                !this.#pathInBound(x, y, join!.pathC2!) &&
                !this.#pathInBound(x, y, join!.pathC3!) &&
                !this.#pathInBound(x, y, join!.pathC4!) &&
                !this.#pathInBound(x, y, this.path!)
            ) {
                join.__editable = !editable
            }
        }
        this.eventHandler<MouseEvent>('click', click, 'editableClick')
        this.eventHandler<MouseEvent>('dblclick', dblclick, 'editableDlclick')
        return editable
    }

    #pathInBound(x: number, y: number, path: Path2D) {
        return (
            this.pointInStroke({ path: path, x: x, y: y }) ||
            this.pointInPath({ path: path, x: x, y: y })
        )
    }

    #draggablePoints(
        xPoint: string,
        yPoint: string,
        path: string,
        identify: string
    ) {
        let initCords = { x: 0, y: 0 }
        let beforeCords = { x: 0, y: 0 }
        let beforeValues: any = {}
        let isRunning = false
        const callX = getPrototype(this, xPoint)
        const callY = getPrototype(this, yPoint)

        const mousedown = (event: MouseEvent) => {
            isRunning = false
            const pointPaths: { [key: string]: Path2D } = {
                pathC1: this.pathC1!,
                pathC2: this.pathC2!,
                pathC3: this.pathC3!,
                pathC4: this.pathC4!,
            }
            const { x, y } = this.canvas?.getCursorPosition(event) || {
                x: 0,
                y: 0,
            }
            const inBound = this.#pathInBound(x, y, pointPaths[path])

            if (inBound) {
                initCords = { x: x, y: y }
                beforeCords = { x: 0, y: 0 }
                beforeValues[this.nodeId!] = {}
                beforeValues[this.nodeId!][xPoint] = callX?.value.call(this)
                beforeValues[this.nodeId!][yPoint] = callY?.value.call(this)
                isRunning = true
                this.canvas?.registerZIndex({ in: this.zIndex() })
            } else this.canvas?.registerZIndex({ out: this.zIndex() })
        }

        const mousemove = (event: MouseEvent) => {
            if (isRunning) {
                this.__runningEvents.drag = false
                if (this.joinTo() !== undefined)
                    this.joinTo()!.__runningEvents.drag = false
                this.canvas?.registerZIndex({ in: this.zIndex() })
                if (this.canvas?.whoIsTheFirst(this.zIndex())) {
                    const { x, y } = this.canvas?.getCursorPosition(event)
                    let diffX = x - initCords.x
                    let diffY = y - initCords.y
                    if (diffX !== 0) {
                        const diff = diffX - beforeCords.x
                        callX?.value.call(this, callX?.value.call(this) + diff)
                        beforeCords.x = diffX
                    }
                    if (diffY !== 0) {
                        const diff = diffY - beforeCords.y
                        callY?.value.call(this, callY?.value.call(this) + diff)
                        beforeCords.y = diffY
                    }
                    this.canvas?.invokeChange()
                }
            }
        }
        const mouseup = () => {
            if (isRunning) {
                isRunning = false
                if (beforeCords.x !== 0 || beforeCords.y !== 0) {
                    const after: any = {}
                    after[this.nodeId!] = {}
                    after[this.nodeId!][xPoint] = callX?.value.call(this)
                    after[this.nodeId!][yPoint] = callY?.value.call(this)
                    this.canvas?.takeSnapshot(beforeValues, after)
                    this.canvas?.invokeChange()
                }
            }
        }
        this.eventHandler<MouseEvent>('mousedown', mousedown, `${identify}Down`)
        this.eventHandler<MouseEvent>('mousemove', mousemove, `${identify}Move`)
        this.eventHandler<MouseEvent>('mouseup', mouseup, `${identify}Up`)
    }

    #handleSticky() {
        if (
            this.stickStart() !== undefined &&
            this.stickStart().block !== undefined
        ) {
            const b = this.stickStart().block

            if (this.__stickyStartBlock.x !== undefined) {
                this.stickStart().x += b!.x() - this.__stickyStartBlock.x
            }
            if (this.__stickyStartBlock.y !== undefined) {
                this.stickStart().y += b!.y() - this.__stickyStartBlock.y
            }

            if (this.__stickyStartBlock.width !== undefined) {
                this.stickStart().x +=
                    b!.width() - this.__stickyStartBlock.width
            }
            if (this.__stickyStartBlock.height !== undefined) {
                this.stickStart().y +=
                    b!.height() - this.__stickyStartBlock.height
            }
            this.__stickyStartBlock.x = b!.x()
            this.__stickyStartBlock.y = b!.y()
            this.__stickyStartBlock.width = b!.width()
            this.__stickyStartBlock.height = b!.height()

            this.startX(this.stickStart().x)
            this.startY(this.stickStart().y)
        }

        if (
            this.stickEnd() !== undefined &&
            this.stickEnd().block !== undefined
        ) {
            const b = this.stickEnd().block

            if (this.__stickyEndBlock.x !== undefined) {
                this.stickEnd().x += b!.x() - this.__stickyEndBlock.x
            }
            if (this.__stickyEndBlock.y !== undefined) {
                this.stickEnd().y += b!.y() - this.__stickyEndBlock.y
            }

            if (this.__stickyEndBlock.width !== undefined) {
                this.stickEnd().x += b!.width() - this.__stickyEndBlock.width
            }
            if (this.__stickyEndBlock.height !== undefined) {
                this.stickEnd().y += b!.height() - this.__stickyEndBlock.height
            }
            this.__stickyEndBlock.x = b!.x()
            this.__stickyEndBlock.y = b!.y()
            this.__stickyEndBlock.width = b!.width()
            this.__stickyEndBlock.height = b!.height()

            this.endX(this.stickEnd().x)
            this.endY(this.stickEnd().y)
        }
    }

    #boundingBox() {
        const c1 = this.#findMinMax(
            this.startX(),
            this.startControlX(),
            this.endControlX(),
            this.endX()
        )
        const c2 = this.#findMinMax(
            this.startY(),
            this.startControlY(),
            this.endControlY(),
            this.endY()
        )
        this.__points.x = [this.startX(), this.endX(), ...c1]
        this.__points.y = [this.startY(), this.endY(), ...c2]
        const joined = this.joinTo()
        if (joined !== undefined) {
            this.__points.x = [...this.__points.x, ...joined.__points.x]
            this.__points.y = [...this.__points.y, ...joined.__points.y]
        }
        const xMin = Math.min(...this.__points.x)
        const yMin = Math.min(...this.__points.y)
        const xMax = Math.max(...this.__points.x)
        const yMax = Math.max(...this.__points.y)

        this.#oldCords.x = xMin
        this.#oldCords.y = yMin

        this.#oldCords.width = xMax - xMin
        this.#oldCords.height = yMax - yMin

        this.hotCornerTopLeft({
            x: xMin,
            y: yMin,
        })
        this.hotCornerTopRight({
            x: xMax,
            y: yMin,
        })
        this.hotCornerBottomLeft({
            x: xMin,
            y: yMax,
        })
        this.hotCornerBottomRight({
            x: xMax,
            y: yMax,
        })
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

    closeLine(opt?: boolean): boolean {
        return this.__valueHandler(opt, 'closeLine', false)
    }
    lineColor(opt?: string) {
        const lineColor = this.__valueHandler(opt, 'lineColor', undefined)
        if (lineColor) {
            super.strokeStyle(lineColor)
            this.stroke(true)
        }

        return lineColor
    }
    backgroundColor(opt?: string) {
        const backgroundColor = this.__valueHandler(
            opt,
            'backgroundColor',
            undefined
        )
        if (backgroundColor) {
            super.fillStyle(backgroundColor)
            this.fill(true)
        }
        return backgroundColor
    }

    scale(opt?: number): void {
        super.scale(opt)
        this.lineWidth(this.lineWidth() * (opt || 1))
    }
}
