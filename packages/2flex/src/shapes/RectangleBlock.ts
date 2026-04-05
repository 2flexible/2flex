import { ShapeBlock } from '../ShapeBlock'
import type { FillStyle, IShapeOptions } from '../ShapeBlock'
import type { IBlock } from '../types'

export type BorderStyle = 'solid' | 'dotted' | undefined

export interface IRectangleOptions extends IShapeOptions{
    backgroundColor?: string
    // border-radius: [top-left, top-right, bottom-right, bottom-left]
    borderRadius?: number[]
    borderStyle?: BorderStyle
    borderWidth?: number
    borderColor?: string
    border?: string
    borderTop?: string
    borderBottom?: string
    borderLeft?: string
    borderRight?: string
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
        const radius = this.__valueHandler(opt, 'borderRadius', [0, 0, 0, 0])
        if (typeof radius === 'number') {
            return [radius, radius, radius, radius]
        }
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

    backgroundColor(opt?: FillStyle) {
        const bg = this.__valueHandler(opt, 'backgroundColor', 'black')
        super.fillStyle(bg)
        this.fill(true)
        return bg
    }

    border(opt?: string) {
        const border = this.__valueHandler(opt, 'border', undefined)
        if (border) {
            const { borderStyleArrWidth } = this.#borderParser(border)
            if (this.borderStyle() === 'dotted') {
                this.lineDash(borderStyleArrWidth)
            }
            this.stroke(true)
        }
        return border
    }
    borderWidth(opt?: number) {
        const borderWidth = this.__valueHandler(opt, 'borderWidth', undefined)
        super.lineWidth(borderWidth)
        return borderWidth
    }
    borderColor(opt?: string) {
        const borderColor = this.__valueHandler(opt, 'borderColor', undefined)
        super.strokeStyle(borderColor)
        return borderColor
    }
    borderStyle(opt?: BorderStyle): BorderStyle {
        return this.__valueHandler(opt, 'borderStyle', undefined)
    }
    borderTop(opt?: string) {
        const borderTop = this.__valueHandler(opt, 'borderTop', undefined)
        if (borderTop) {
            let { borderStyleArrWidth } = this.#borderParser(borderTop)
            borderStyleArrWidth.pop()
            if (this.borderStyle() === 'dotted') {
                this.lineDash([
                    ...borderStyleArrWidth,
                    this.getRealHeight * 2 + this.getRealWidth,
                ])
            } else {
                this.lineDash([
                    this.getRealWidth,
                    this.getRealWidth + 2 * this.getRealHeight,
                    0,
                    0,
                ])
            }
            this.stroke(true)
        }
        return borderTop
    }

    borderRight(opt?: string) {
        const borderRight = this.__valueHandler(opt, 'borderRight', undefined)
        if (borderRight) {
            const { borderStyleArrHeight } = this.#borderParser(borderRight)
            borderStyleArrHeight.pop()

            if (this.borderStyle() === 'dotted') {
                this.lineDash([
                    0,
                    this.getRealWidth,
                    ...borderStyleArrHeight,
                    this.getRealWidth + this.getRealHeight,
                ])
            } else if (this.borderStyle() === 'solid') {
                this.lineDash([
                    0,
                    this.getRealWidth,
                    this.getRealHeight,
                    this.getRealWidth + this.getRealHeight,
                ])
            }
            this.stroke(true)
        }
        return borderRight
    }
    borderBottom(opt?: string) {
        const borderBottom = this.__valueHandler(opt, 'borderBottom', undefined)
        if (borderBottom) {
            let { borderStyleArrWidth } = this.#borderParser(borderBottom)
            if (this.borderStyle() === 'dotted') {
                this.lineDash([
                    0,
                    this.getRealWidth + this.getRealHeight,
                    ...borderStyleArrWidth,
                ])
            } else if (this.borderStyle() === 'solid') {
                this.lineDash([
                    0,
                    this.getRealWidth + this.getRealHeight,
                    this.getRealWidth,
                    0,
                ])
            }
            this.stroke(true)
        }
        return borderBottom
    }
    borderLeft(opt?: string) {
        const borderLeft = this.__valueHandler(opt, 'borderLeft', undefined)
        if (borderLeft) {
            let { borderStyleArrHeight } = this.#borderParser(borderLeft)

            if (this.borderStyle() === 'dotted') {
                this.lineDash([
                    0,
                    this.getRealWidth * 2 + this.getRealHeight,
                    ...borderStyleArrHeight,
                ])
            } else if (this.borderStyle() === 'solid') {
                this.lineDash([
                    0,
                    this.getRealWidth * 2 + this.getRealHeight,
                    this.getRealHeight,
                    this.getRealWidth,
                ])
            }
            this.stroke(true)
        }
        return borderLeft
    }
    // border size, style(required), color
    #borderParser(obj?: string) {
        const border = obj?.split(' ') || []

        const borderWidth = this.__unitConverter<string, number>({
            val: border[0],
            widthRelated: true,
        })
        const borderStyle = border[1] as BorderStyle
        const borderColor = border[2]

        const borderStyleArrWidth = []
        const borderStyleArrHeight = []
        if (borderStyle === 'dotted') {
            let total = 0
            const step = this.getRealWidth / (this.getRealWidth / 4)
            while (total < this.getRealWidth) {
                borderStyleArrWidth.push(step, step)
                total += step * 2
            }

            total = 0
            const stepHeight = this.getRealHeight / (this.getRealHeight / 4)
            while (total < this.getRealHeight) {
                borderStyleArrHeight.push(
                    stepHeight,
                    stepHeight,
                    stepHeight,
                    stepHeight
                )
                total += stepHeight * 2
            }
        }
        if (this.borderWidth() === undefined) this.borderWidth(borderWidth)
        if (this.borderStyle() === undefined) this.borderStyle(borderStyle)
        if (this.borderColor() === undefined) this.borderColor(borderColor)
        return { borderStyleArrWidth, borderStyleArrHeight }
    }

    __clipShape() {
        this.__clipPath?.roundRect(
            this.getLeft.x + this.__leftSpace,
            this.getTop.y + this.__topSpace,
            this.getRealWidth - this.__widthSpaces,
            this.getRealHeight - this.__heightSpaces,
            this.borderRadius()
        )
    }
}
