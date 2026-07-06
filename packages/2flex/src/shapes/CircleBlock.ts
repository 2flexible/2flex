import { RelativeType } from '../Block'
import { IShapeOptions, ShapeBlock } from '../ShapeBlock'
import type { FillStyle } from '../ShapeBlock'
import type { IBlock } from '../types'

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

export class CircleBlock extends ShapeBlock<ICircleOptions> {
    constructor(options: IBlock<ICircleOptions>) {
        super(options)
        this.lineJoin('round')
        this.lineCap('round')
    }
    draw(_func?: (context: CanvasRenderingContext2D) => void): void {
        if (!this.context) return
        if (!this.#isAngleEmpty) {
            this.context?.arc(
                this.__getRealCenterX,
                this.__getRealCenterY,
                this.innerRadius(),
                this.endAngle(),
                this.startAngle(),
                true
            )
        }
        this.context?.ellipse(
            this.__getRealCenterX,
            this.__getRealCenterY,
            this.width() / 2 - this.hotLineStrokeWidth(),
            this.height() / 2 - this.hotLineStrokeWidth(),
            0,
            this.startAngle(),
            this.endAngle()
        )
        this.fillStyle(this.backgroundColor())
        this.fill()
        this.stroke()
        if (this.#isAngleEmpty) this.beginPath()
        if (!this.#isAngleEmpty)
            this.context?.arc(
                this.__getRealCenterX,
                this.__getRealCenterY,
                this.innerRadius(),
                this.endAngle(),
                this.startAngle(),
                true
            )
        this.fillStyle('transparent')
        this.fill({ fill: true })
    }

    get #isAngleEmpty() {
        if (this.startAngle() === 0 && this.endAngle() === Math.PI * 2)
            return true
        return false
    }

    innerRadius(opt?: RelativeType) {
        return this.__valueHandler(opt, 'innerRadius', 0)
    }
    startAngle(opt?: RelativeType) {
        return this.__valueHandler(opt, 'startAngle', 0)
    }
    endAngle(opt?: RelativeType) {
        return this.__valueHandler(opt, 'endAngle', Math.PI * 2)
    }
    backgroundColor(opt?: string) {
        const backgroundColor = this.__valueHandler(
            opt,
            'backgroundColor',
            undefined
        )
        if (backgroundColor) {
            super.fillStyle(backgroundColor)
            this.fill({ fill: true })
        }
        return backgroundColor
    }
    borderWidth(opt?: RelativeType) {
        const borderWidth = this.__valueHandler(opt, 'borderWidth', 0)
        super.lineWidth(borderWidth)
        return borderWidth
    }
    borderColor(opt?: string) {
        const borderColor = this.__valueHandler(opt, 'borderColor', 'black')
        super.strokeStyle(borderColor)
        return borderColor
    }
    borderStyle(opt?: BorderStyle): BorderStyle {
        return this.__valueHandler(opt, 'borderStyle', 'solid')
    }

    border(opt?: CircleBorder | string) {
        if (opt && typeof opt === 'string') opt = this.#borderConvert(opt)
        const border = this.__valueHandler(opt, 'border', undefined)
        if (border) {
            this.borderWidth(border[0])
            this.borderStyle(border[1] as BorderStyle)
            this.borderColor(border[2])
            this.stroke({ stroke: true })
        }
        return border
    }

    #borderConvert(opt: string): CircleBorder {
        const splitted = opt.split(' ')
        const borderWidth = this.__unitConverter<string | number, number>({
            val: splitted[0],
            widthRelated: true,
        })
        const borderStyle = this.__unitConverter<
            string | undefined,
            BorderStyle
        >({
            val: splitted[1],
            widthRelated: false,
        })
        const borderColor = this.__unitConverter<string, string>({
            val: splitted[2],
            widthRelated: false,
        })
        return [borderWidth, borderStyle, borderColor]
    }
    __clipShape() {
        this.__clipPath?.ellipse(
            this.__getRealCenterX,
            this.__getRealCenterY,
            this.width() / 2,
            this.height() / 2,
            0,
            this.startAngle(),
            this.endAngle()
        )
    }
}
