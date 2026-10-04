import { SELECTABLE_RUNNING_EVENT } from '../const'
import { IShapeOptions, ShapeBlock } from '../ShapeBlock'
import type { DrawFunc, FillStyle } from '../ShapeBlock'
import { RelativeType } from '../types'

export type BorderStyle = 'solid' | 'dotted'
export type BorderWidth = RelativeType
export type BorderColor = string
export type CircleBorder = [BorderWidth, BorderStyle, BorderColor]

interface ICircleOptions extends IShapeOptions {
    startAngle?: RelativeType
    endAngle?: RelativeType
    innerRadius?: RelativeType
    backgroundColor?: FillStyle
    border?: CircleBorder | string
    borderStyle?: BorderStyle
    borderWidth?: BorderWidth
    borderColor?: BorderColor
}

export class CircleBlock extends ShapeBlock {
    #circlePath?: Path2D

    constructor(options: ICircleOptions) {
        super(options)
        this.lineJoin('round')
        this.lineCap('round')
        this.#circlePath = new Path2D()
        this.#defineProperties()
    }

    #defineProperties() {
        this.addProperty('innerRadius', 0)
        this.addProperty('startAngle', 0)
        this.addProperty('endAngle', Math.PI * 2)
        this.addProperty('backgroundColor', undefined)
        this.addProperty('borderWidth', 0, true)
        this.addProperty('borderColor', 'black')
        this.addProperty('borderStyle', 'solid')
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
        const outerRX = this.width() / 2 - this.hotLineStrokeWidth()
        const outerRY = this.height() / 2 - this.hotLineStrokeWidth()

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
        const extra = (this.hotLineStrokeWidth() + borderWidth) / 2

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
        context.rotate(this.rotate())
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
            this.width() / 2,
            this.height() / 2,
            0,
            this.startAngle(),
            this.endAngle()
        )
    }
}
