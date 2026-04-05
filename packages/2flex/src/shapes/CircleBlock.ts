import { RelativeType } from '../Block'
import { IShapeOptions, ShapeBlock } from '../ShapeBlock'
import type { IBlock } from '../types'
export type BorderStyle = 'solid' | 'dotted'
export type CircleBorder = [string | number, BorderStyle, string] | string

interface ICircleOptions extends IShapeOptions {
    startAngle?: number
    endAngle?: number
    backgroundColor?: number
    border?: string
    borderStyle?: BorderStyle
    borderWidth?: number
    borderColor?: string
    innerRadius?: number
}

export class CircleBlock extends ShapeBlock<ICircleOptions> {
    constructor(options: IBlock<ICircleOptions>) {
        super(options)
        this.lineJoin('round')
        this.lineCap('round')
    }
    draw(_func?: (context: CanvasRenderingContext2D) => void): void {
        if (!this.#isAngleEmpty) {
            this.context?.arc(
                this.getCenterX,
                this.getCenterY,
                this.innerRadius(),
                this.endAngle(),
                this.startAngle(),
                true
            )
        }
        this.context?.ellipse(
            this.getCenterX,
            this.getCenterY,
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
        this.context?.arc(
            this.getCenterX,
            this.getCenterY,
            this.innerRadius(),
            this.endAngle(),
            this.startAngle(),
            true
        )
        this.fillStyle('transparent')
        this.fill(true)
    }

    get #isAngleEmpty() {
        if (this.startAngle() === 0 && this.endAngle() === Math.PI * 2)
            return true
        return false
    }

    innerRadius(opt?: number) {
        return this.__valueHandler(opt, 'innerRadius', 0)
    }
    startAngle(opt?: number) {
        return this.__valueHandler(opt, 'startAngle', 0)
    }
    endAngle(opt?: number) {
        return this.__valueHandler(opt, 'endAngle', Math.PI * 2)
    }
    backgroundColor(opt?: string) {
        const backgroundColor = this.__valueHandler(
            opt,
            'backgroundColor',
            'black'
        )
        super.fillStyle(backgroundColor)
        this.fill(true)
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

    border(opt?: CircleBorder) {
        if (opt && typeof opt === 'string') opt = this.#borderConvert(opt)
        const border = this.__valueHandler<
            CircleBorder | undefined,
            CircleBorder | undefined
        >(opt, 'border', undefined)
        if (border) {
            this.borderWidth(border[0])
            this.borderStyle(border[1] as BorderStyle)
            this.borderColor(border[2])
            this.stroke(true)
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
            this.getCenterX,
            this.getCenterY,
            this.width() / 2,
            this.height() / 2,
            0,
            this.startAngle(),
            this.endAngle()
        )
    }
}
