import { SELECTABLE_RUNNING_EVENT } from '../const'
import type { ColorType, OwnOptionAccessors } from '../BaseBlock'
import { ShapeBlockOptions, ShapeBlock } from '../ShapeBlock'
import type { DrawFunc, FillStyle } from '../ShapeBlock'
import { RelativeType } from '../types'

export type BorderStyle = 'solid' | 'dotted'
export type BorderWidth = RelativeType
export type BorderColor = string
export type CircleBorder = [BorderWidth, BorderStyle, BorderColor]

export interface CircleBlockOptions extends ShapeBlockOptions {
    startAngle?: RelativeType
    endAngle?: RelativeType
    innerRadius?: RelativeType
    backgroundColor?: ColorType
    border?: CircleBorder | string
    borderStyle?: BorderStyle
    borderWidth?: BorderWidth
    borderColor?: ColorType
}

interface CircleBlockAccessors extends OwnOptionAccessors<
    CircleBlockOptions,
    ShapeBlockOptions
> {}

const DEFAULT_END_ANGLE = Math.PI * 2
const DEFAULT_BORDER_COLOR = 'black'
const DEFAULT_BORDER_STYLE: BorderStyle = 'solid'
const DEFAULT_LINE_JOIN: CanvasLineJoin = 'round'
const DEFAULT_LINE_CAP: CanvasLineCap = 'round'

export class CircleBlock<
    T extends CircleBlockOptions = CircleBlockOptions,
> extends ShapeBlock<T> {
    #circlePath?: Path2D

    constructor(options: CircleBlockOptions) {
        super(options as T)
        this.lineJoin(DEFAULT_LINE_JOIN)
        this.lineCap(DEFAULT_LINE_CAP)
        this.#circlePath = new Path2D()
        this.#defineProperties()
    }

    set(options: T): void {
        super.set(options)
    }

    #defineProperties() {
        this.addProperty('innerRadius', 0)
        this.addProperty('startAngle', 0)
        this.addProperty('endAngle', DEFAULT_END_ANGLE)
        this.addProperty('backgroundColor', undefined)
        this.addProperty('borderWidth', 0, true)
        this.addProperty('borderColor', DEFAULT_BORDER_COLOR)
        this.addProperty('borderStyle', DEFAULT_BORDER_STYLE)
        this.addProperty(
            'border',
            undefined,
            false,
            undefined,
            (block: CircleBlock, opt: CircleBorder | string) =>
                this.#border(block, opt)
        )
    }
    draw(_func?: DrawFunc): void {
        const context = this.context
        if (!context) return
        const cx = this.realCenterX
        const cy = this.realCenterY
        const startAngle = this.startAngle()
        const endAngle = this.endAngle()
        const innerR = this.innerRadius()
        const outerRX = this.__boxWidth() / 2 - this.hotLineStrokeWidth()
        const outerRY = this.__boxHeight() / 2 - this.hotLineStrokeWidth()

        const path = new Path2D()

        if (startAngle === 0 && endAngle === Math.PI * 2) {
            path.moveTo(cx + outerRX, cy)
            path.ellipse(cx, cy, outerRX, outerRY, 0, 0, Math.PI * 2)
            if (innerR > 0) {
                path.moveTo(cx + innerR, cy)
                path.arc(cx, cy, innerR, 0, Math.PI * 2)
            }
        } else {
            path.moveTo(
                cx + innerR * Math.cos(startAngle),
                cy + innerR * Math.sin(startAngle)
            )
            path.arc(cx, cy, innerR, startAngle, endAngle, false)
            path.lineTo(
                cx + outerRX * Math.cos(endAngle),
                cy + outerRY * Math.sin(endAngle)
            )
            path.ellipse(
                cx,
                cy,
                outerRX,
                outerRY,
                0,
                endAngle,
                startAngle,
                true
            )
            path.closePath()
        }

        this.#circlePath = path

        context.fillStyle = this.backgroundColor()
        context.lineWidth = this.borderWidth()
        context.strokeStyle = this.borderColor()
        const useEvenodd =
            startAngle === 0 && endAngle === Math.PI * 2 && innerR > 0
        context.fill(path, useEvenodd ? 'evenodd' : 'nonzero')
        context.stroke(path)
    }
    #border(block: CircleBlock, opt?: CircleBorder | string) {
        if (opt === undefined) return
        if (typeof opt === 'string') opt = block.#borderConvert(opt)
        block.borderWidth(opt[0])
        block.borderStyle(opt[1] as BorderStyle)
        block.borderColor(opt[2])
    }
    updateCords(): void {
        super.updateCords()
        this.#adjustBoundingBox()
    }
    #adjustBoundingBox(): void {
        const borderWidth =
            (this.getOptionCurrent('borderWidth') as number) ?? 0
        const strokeWidth = this.hotLineStrokeWidth()
        // a width which is not finite would spread into the whole box
        const extra =
            Number.isFinite(borderWidth) && Number.isFinite(strokeWidth)
                ? (strokeWidth + borderWidth) / 2
                : 0

        const { topLeft, topRight, bottomLeft, bottomRight } = this.boundingBox

        this.boundingBox = {
            topLeft: { x: topLeft.x - extra, y: topLeft.y - extra },
            topRight: { x: topRight.x + extra, y: topRight.y - extra },
            bottomLeft: {
                x: bottomLeft.x - extra,
                y: bottomLeft.y + extra,
            },
            bottomRight: {
                x: bottomRight.x + extra,
                y: bottomRight.y + extra,
            },
        }
    }
    #borderConvert(opt: string): CircleBorder {
        const splitted = opt.split(' ')
        const borderWidth = this.__unitConverter(splitted[0], true)
        const borderStyle = splitted[1] as BorderStyle
        const borderColor = this.__colorConverter(splitted[2]) as string
        return [borderWidth, borderStyle, borderColor]
    }
    #pathInBound(x: number, y: number) {
        const context = this.context
        const path = this.#circlePath
        if (!context || !path) return false
        const centerX = this.rotationCenterX()
        const centerY = this.rotationCenterY()
        context.save()
        context.translate(centerX, centerY)
        context.rotate(this.__rotation())
        context.translate(-centerX, -centerY)
        context.lineWidth = this.borderWidth()
        const inStroke = context.isPointInStroke(path, x, y)
        const inPath = context.isPointInPath(path, x, y)
        context.restore()
        return inStroke || inPath
    }
    checkInBound(event: MouseEvent): boolean {
        if (!this.__isRunningEventActive(SELECTABLE_RUNNING_EVENT)) {
            const { x, y } = this.canvas?.getCursorPosition(event)!
            return this.#pathInBound(x, y)
        } else return super.checkInBound(event)
    }
    __clipShape() {
        this.__clipPath?.ellipse(
            this.realCenterX,
            this.realCenterY,
            this.__boxWidth() / 2,
            this.__boxHeight() / 2,
            0,
            this.startAngle(),
            this.endAngle()
        )
    }
}

export interface CircleBlock extends CircleBlockAccessors {}
