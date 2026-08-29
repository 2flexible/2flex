import { ShapeBlock } from '../ShapeBlock'
import type { FillStyle, IShapeOptions } from '../ShapeBlock'
import type { RelativeType, ShortHandRelativeType } from '../types'
import { shortHandParser } from '../Utils'

export type BorderStyle = 'solid' | 'dotted'
export type BorderWidth = RelativeType
export type BorderColor = FillStyle
export type RectangleBorder = [BorderWidth, BorderStyle, BorderColor] | string
export type BorderRadius = ShortHandRelativeType

export interface IRectangleOptions extends IShapeOptions {
    backgroundColor?: FillStyle
    // border-radius: [top-left, top-right, bottom-right, bottom-left]
    borderRadius?: number[]
    borderStyle?: BorderStyle
    borderWidth?: BorderWidth
    borderColor?: BorderColor
    border?: RectangleBorder
    borderTop?: RectangleBorder
    borderBottom?: RectangleBorder
    borderLeft?: RectangleBorder
    borderRight?: RectangleBorder
}

export class RectangleBlock extends ShapeBlock {
    constructor(options: IRectangleOptions) {
        super(options)
        this.addProperty(
            'backgroundColor',
            'white',
            false,
            (block: RectangleBlock, opt: FillStyle) =>
                this.#backgroundColor(block, opt)
        )
        this.addProperty(
            'borderRadius',
            [0, 0, 0, 0],
            false,
            (block: RectangleBlock, opt?: BorderRadius) =>
                this.#borderRadius(block, opt)
        )
        this.addProperty(
            'border',
            undefined,
            false,
            (block: RectangleBlock, opt?: RectangleBorder) =>
                this.#border(block, opt)
        )
        this.addProperty(
            'borderWidth',
            0,
            false,
            (block: RectangleBlock, opt?: RelativeType) =>
                this.#borderWidth(block, opt)
        )
        this.addProperty(
            'borderColor',
            'white',
            false,
            (block: RectangleBlock, opt?: FillStyle) =>
                this.#borderColor(block, opt)
        )
        this.addProperty('borderStyle', 'solid')
        this.addProperty(
            'borderTop',
            undefined,
            false,
            (block: RectangleBlock, opt?: RectangleBorder) =>
                this.#borderTop(block, opt)
        )
        this.addProperty(
            'borderBottom',
            undefined,
            false,
            (block: RectangleBlock, opt?: RectangleBorder) =>
                this.#borderBottom(block, opt)
        )
        this.addProperty(
            'borderLeft',
            undefined,
            false,
            (block: RectangleBlock, opt?: RectangleBorder) =>
                this.#borderLeft(block, opt)
        )
        this.addProperty(
            'borderRight',
            undefined,
            false,
            (block: RectangleBlock, opt?: RectangleBorder) =>
                this.#borderRight(block, opt)
        )
    }

    draw(
        _func?: ((context: CanvasRenderingContext2D) => void) | undefined
    ): void {
        // const cacheR = this.rotate()
        // this.rotate(0)
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
        // this.rotate(cacheR)
    }
    #borderRadius(block: RectangleBlock, radius?: BorderRadius) {
        if (radius !== undefined) return shortHandParser(radius)
    }
    #backgroundColor(block: RectangleBlock, bg: FillStyle) {
        if (bg !== undefined) {
            block.fillStyle(bg)
            block.fill({ fill: true })
        }
    }
    #border(block: RectangleBlock, border?: RectangleBorder) {
        if (border) {
            if (typeof border === 'string') block.#borderConvert(border)
            if (border instanceof Array) {
                const { borderStyleArrWidth } = block.#borderParser(border)
                if (block.borderStyle() === 'dotted') {
                    block.lineDash(borderStyleArrWidth)
                }
                block.stroke({ stroke: true })
            }
        }
    }
    #borderWidth(block: RectangleBlock, opt?: RelativeType) {
        if (opt !== undefined) super.lineWidth(opt)
    }
    #borderColor(block: RectangleBlock, opt?: FillStyle) {
        if (opt !== undefined) super.strokeStyle(opt)
    }
    #borderTop(block: RectangleBlock, opt?: RectangleBorder) {
        if (opt !== undefined) {
            if (typeof opt === 'string') opt = block.#borderConvert(opt)
            else if (opt instanceof Array) {
                let { borderStyleArrWidth } = block.#borderParser(opt)
                borderStyleArrWidth.pop()
                if (block.borderStyle() === 'dotted') {
                    block.lineDash([
                        ...borderStyleArrWidth,
                        block.realHeight * 2 + block.realWidth,
                    ])
                } else {
                    block.lineDash([
                        block.realWidth,
                        block.realWidth + 2 * block.realHeight,
                        0,
                        0,
                    ])
                }
                block.stroke({ stroke: true })
            }
        }
    }
    #borderRight(block: RectangleBlock, opt?: RectangleBorder) {
        if (opt !== undefined) {
            if (typeof opt === 'string') opt = block.#borderConvert(opt)
            else if (opt instanceof Array) {
                const { borderStyleArrHeight } = block.#borderParser(opt)
                borderStyleArrHeight.pop()

                if (block.borderStyle() === 'dotted') {
                    block.lineDash([
                        0,
                        block.realWidth,
                        ...borderStyleArrHeight,
                        block.realWidth + block.realHeight,
                    ])
                } else if (block.borderStyle() === 'solid') {
                    block.lineDash([
                        0,
                        block.realWidth,
                        block.realHeight,
                        block.realWidth + block.realHeight,
                    ])
                }
                block.stroke({ stroke: true })
            }
        }
    }
    #borderBottom(block: RectangleBlock, opt?: RectangleBorder) {
        if (opt !== undefined) {
            if (typeof opt === 'string') opt = block.#borderConvert(opt)
            else if (opt instanceof Array) {
                let { borderStyleArrWidth } = block.#borderParser(opt)
                if (block.borderStyle() === 'dotted') {
                    block.lineDash([
                        0,
                        block.realWidth + block.realHeight,
                        ...borderStyleArrWidth,
                    ])
                } else if (block.borderStyle() === 'solid') {
                    block.lineDash([
                        0,
                        block.realWidth + block.realHeight,
                        block.realWidth,
                        0,
                    ])
                }
                block.stroke({ stroke: true })
            }
        }
    }
    #borderLeft(block: RectangleBlock, opt?: RectangleBorder) {
        if (opt !== undefined) {
            if (typeof opt === 'string') opt = block.#borderConvert(opt)
            else if (opt instanceof Array) {
                let { borderStyleArrHeight } = block.#borderParser(opt)

                if (block.borderStyle() === 'dotted') {
                    block.lineDash([
                        0,
                        block.realWidth * 2 + block.realHeight,
                        ...borderStyleArrHeight,
                    ])
                } else if (block.borderStyle() === 'solid') {
                    block.lineDash([
                        0,
                        block.realWidth * 2 + block.realHeight,
                        block.realHeight,
                        block.realWidth,
                    ])
                }
                block.stroke({ stroke: true })
            }
        }
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
            const step = this.realWidth / (this.realWidth / 4)
            while (total < this.realWidth) {
                borderStyleArrWidth.push(step, step)
                total += step * 2
            }

            total = 0
            const stepHeight = this.realHeight / (this.realHeight / 4)
            while (total < this.realHeight) {
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
            this.x(),
            this.y(),
            this.width(),
            this.height(),
            this.borderRadius()
        )
    }
}
