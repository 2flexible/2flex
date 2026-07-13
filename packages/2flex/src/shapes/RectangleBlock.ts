import { RelativeType } from '../Block'
import { ShapeBlock } from '../ShapeBlock'
import type { FillStyle, IShapeOptions } from '../ShapeBlock'
import type { IBlock } from '../types'

export type BorderStyle = 'solid' | 'dotted'
export type BorderWidth = RelativeType
export type BorderColor = FillStyle
export type RectangleBorder = [BorderWidth, BorderStyle, BorderColor]

export interface IRectangleOptions extends IShapeOptions {
    backgroundColor?: FillStyle
    // border-radius: [top-left, top-right, bottom-right, bottom-left]
    borderRadius?: number[]
    borderStyle?: BorderStyle
    borderWidth?: BorderWidth
    borderColor?: BorderColor
    border?: RectangleBorder | string
    borderTop?: RectangleBorder | string
    borderBottom?: RectangleBorder | string
    borderLeft?: RectangleBorder | string
    borderRight?: RectangleBorder | string
}

export class RectangleBlock extends ShapeBlock<IRectangleOptions> {
    constructor(options: IBlock<IRectangleOptions>) {
        super(options)
    }

    draw(
        _func?: ((context: CanvasRenderingContext2D) => void) | undefined
    ): void {
        const cacheR = this.rotate()
        this.rotate(0)
        this.context?.roundRect(
            this.x(),
            this.y(),
            this.width(),
            this.height(),
            this.borderRadius()
        )
        this.border()
        this.borderBottom()
        this.borderTop()
        this.borderLeft()
        this.borderRight()
        this.rotate(cacheR)
    }
    borderRadius(opt?: number[] | number): number[] {
        const radius = this.__valueHandler<
            number[] | number,
            number[] | number
        >(opt, 'borderRadius', [0, 0, 0, 0])
        if (typeof radius === 'number') {
            return [radius, radius, radius, radius]
        } else if (radius instanceof Array) {
            let defRadius: number[] = radius
            switch (radius.length) {
                case 1:
                    defRadius = [radius[0], radius[0], radius[0], radius[0]]
                    break
                case 2:
                    defRadius = [radius[0], radius[0], radius[1], radius[1]]
                    break
                case 3:
                    defRadius = [radius[0], radius[0], radius[1], radius[2]]
                    break
            }
            return defRadius
        }
        return radius
    }

    backgroundColor(opt?: FillStyle) {
        const bg = this.__valueHandler(opt, 'backgroundColor', undefined)
        if (bg) {
            super.fillStyle(bg)
            this.fill({ fill: true })
        }
        return bg
    }

    border(opt?: RectangleBorder | string) {
        if (opt && typeof opt === 'string') opt = this.#borderConvert(opt)
        const border = this.__valueHandler(opt, 'border', undefined)
        if (border) {
            const { borderStyleArrWidth } = this.#borderParser(border)
            if (this.borderStyle() === 'dotted') {
                this.lineDash(borderStyleArrWidth)
            }
            this.stroke({ stroke: true })
        }
        return border
    }
    borderWidth(opt?: RelativeType) {
        const borderWidth = this.__valueHandler(opt, 'borderWidth', 0)
        super.lineWidth(borderWidth)
        return borderWidth
    }
    borderColor(opt?: FillStyle) {
        const borderColor = this.__valueHandler(opt, 'borderColor', 'black')
        super.strokeStyle(borderColor)
        return borderColor
    }
    borderStyle(opt?: BorderStyle): BorderStyle {
        return this.__valueHandler(opt, 'borderStyle', 'solid')
    }
    borderTop(opt?: RectangleBorder | string) {
        if (opt && typeof opt === 'string') opt = this.#borderConvert(opt)
        const borderTop = this.__valueHandler(opt, 'borderTop', undefined)
        if (borderTop) {
            let { borderStyleArrWidth } = this.#borderParser(borderTop)
            borderStyleArrWidth.pop()
            if (this.borderStyle() === 'dotted') {
                this.lineDash([
                    ...borderStyleArrWidth,
                    this.__getRealHeight * 2 + this.__getRealWidth,
                ])
            } else {
                this.lineDash([
                    this.__getRealWidth,
                    this.__getRealWidth + 2 * this.__getRealHeight,
                    0,
                    0,
                ])
            }
            this.stroke({ stroke: true })
        }
        return borderTop
    }

    borderRight(opt?: RectangleBorder | string) {
        if (opt && typeof opt === 'string') opt = this.#borderConvert(opt)
        const borderRight = this.__valueHandler(opt, 'borderRight', undefined)
        if (borderRight) {
            const { borderStyleArrHeight } = this.#borderParser(borderRight)
            borderStyleArrHeight.pop()

            if (this.borderStyle() === 'dotted') {
                this.lineDash([
                    0,
                    this.__getRealWidth,
                    ...borderStyleArrHeight,
                    this.__getRealWidth + this.__getRealHeight,
                ])
            } else if (this.borderStyle() === 'solid') {
                this.lineDash([
                    0,
                    this.__getRealWidth,
                    this.__getRealHeight,
                    this.__getRealWidth + this.__getRealHeight,
                ])
            }
            this.stroke({ stroke: true })
        }
        return borderRight
    }
    borderBottom(opt?: RectangleBorder | string) {
        if (opt && typeof opt === 'string') opt = this.#borderConvert(opt)
        const borderBottom = this.__valueHandler(opt, 'borderBottom', undefined)
        if (borderBottom) {
            let { borderStyleArrWidth } = this.#borderParser(borderBottom)
            if (this.borderStyle() === 'dotted') {
                this.lineDash([
                    0,
                    this.__getRealWidth + this.__getRealHeight,
                    ...borderStyleArrWidth,
                ])
            } else if (this.borderStyle() === 'solid') {
                this.lineDash([
                    0,
                    this.__getRealWidth + this.__getRealHeight,
                    this.__getRealWidth,
                    0,
                ])
            }
            this.stroke({ stroke: true })
        }
        return borderBottom
    }
    borderLeft(opt?: RectangleBorder | string) {
        if (opt && typeof opt === 'string') opt = this.#borderConvert(opt)
        const borderLeft = this.__valueHandler(opt, 'borderLeft', undefined)
        if (borderLeft) {
            let { borderStyleArrHeight } = this.#borderParser(borderLeft)

            if (this.borderStyle() === 'dotted') {
                this.lineDash([
                    0,
                    this.__getRealWidth * 2 + this.__getRealHeight,
                    ...borderStyleArrHeight,
                ])
            } else if (this.borderStyle() === 'solid') {
                this.lineDash([
                    0,
                    this.__getRealWidth * 2 + this.__getRealHeight,
                    this.__getRealHeight,
                    this.__getRealWidth,
                ])
            }
            this.stroke({ stroke: true })
        }
        return borderLeft
    }

    #borderConvert(opt: string): RectangleBorder {
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

    // border size, style(required), color
    #borderParser(obj: RectangleBorder) {
        const borderWidth = obj[0]
        const borderStyle = obj[1]
        const borderColor = obj[2]

        const borderStyleArrWidth = []
        const borderStyleArrHeight = []
        if (borderStyle === 'dotted') {
            let total = 0
            const step = this.__getRealWidth / (this.__getRealWidth / 4)
            while (total < this.__getRealWidth) {
                borderStyleArrWidth.push(step, step)
                total += step * 2
            }

            total = 0
            const stepHeight = this.__getRealHeight / (this.__getRealHeight / 4)
            while (total < this.__getRealHeight) {
                borderStyleArrHeight.push(
                    stepHeight,
                    stepHeight,
                    stepHeight,
                    stepHeight
                )
                total += stepHeight * 2
            }
        }
        this.borderWidth(borderWidth)
        this.borderStyle(borderStyle)
        this.borderColor(borderColor)
        return { borderStyleArrWidth, borderStyleArrHeight }
    }

    __clipShape() {
        this.__clipPath?.roundRect(
            this.__getLeft.x + this.__leftSpace,
            this.__getTop.y + this.__topSpace,
            this.__getRealWidth + this.__widthSpaces,
            this.__getRealHeight + this.__heightSpaces,
            this.borderRadius()
        )
    }
}
