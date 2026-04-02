import { ShapeBlock } from '../ShapeBlock'
import type { IBlock } from '../types'
export type BorderStyle = 'solid' | 'dotted'

interface ICircleOptions {
    radius?: number
    radiusX?: number
    radiusY?: number
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
            this.radiusX() / 2,
            this.radiusY() / 2,
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

    radius(opt?: number) {
        const radius = this.__valueHandler(opt, 'radius', 0)
        this.radiusX(radius)
        this.radiusY(radius)
        return radius
    }
    radiusX(opt?: number) {
        const cacheR = this.rotate()
        this.rotate(0)
        const r = this.__valueHandler(opt, 'radiusX', 0, true)
        const diffR = this.width() - r
        this.rotate(cacheR)
        if (diffR !== 0) return r + diffR
        return r
    }
    radiusY(opt?: number) {
        const cacheR = this.rotate()
        this.rotate(0)
        const r = this.__valueHandler(opt, 'radiusY', 0)
        const diffR = this.height() - r
        this.rotate(cacheR)
        if (diffR !== 0) return r + diffR
        return r
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
    borderWidth(opt?: number) {
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

    border(opt?: string) {
        const border = this.__valueHandler<string, string | undefined>(
            opt,
            'border',
            undefined
        )
        if (border) {
            const borderParsed = border.split(' ') || []

            const borderWidth = this.__unitConverter<string, number>({
                val: borderParsed[0],
                widthRelated: true,
            })

            this.borderWidth(borderWidth)
            this.borderStyle(borderParsed[1] as BorderStyle)
            this.borderColor(borderParsed[2])
            this.stroke(true)
        }
        return border
    }
    __clipShape() {
        this.__clipPath?.ellipse(
            this.getCenterX,
            this.getCenterY,
            this.radiusX() / 2,
            this.radiusY() / 2,
            0,
            this.startAngle(),
            this.endAngle()
        )
    }
}
