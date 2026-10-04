import { SELECTABLE_RUNNING_EVENT } from '../const'
import { ShapeBlock } from '../ShapeBlock'
import type { DrawFunc, FillStyle, IShapeOptions } from '../ShapeBlock'
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

type BorderSide = 'top' | 'right' | 'bottom' | 'left'

export class RectangleBlock extends ShapeBlock {
    #rectPath?: Path2D

    constructor(options: IRectangleOptions) {
        super(options)
        this.#rectPath = new Path2D()
        this.#defineOptions()
    }

    #defineOptions() {
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
            'border',
            undefined,
            false,
            undefined,
            (block: RectangleBlock, opt?: RectangleBorder) =>
                this.#border(block, opt)
        )
        this.addProperty(
            'borderTop',
            undefined,
            false,
            undefined,
            (block: RectangleBlock, opt?: RectangleBorder) =>
                this.#borderTop(block, opt)
        )
        this.addProperty(
            'borderBottom',
            undefined,
            false,
            undefined,
            (block: RectangleBlock, opt?: RectangleBorder) =>
                this.#borderBottom(block, opt)
        )
        this.addProperty(
            'borderLeft',
            undefined,
            false,
            undefined,
            (block: RectangleBlock, opt?: RectangleBorder) =>
                this.#borderLeft(block, opt)
        )
        this.addProperty(
            'borderRight',
            undefined,
            false,
            undefined,
            (block: RectangleBlock, opt?: RectangleBorder) =>
                this.#borderRight(block, opt)
        )
    }

    draw(_func?: DrawFunc): void {
        const x = this.x()
        const y = this.y()
        const w = this.width()
        const h = this.height()
        const radius = this.borderRadius()

        const rectPath = new Path2D()
        rectPath.roundRect(x, y, w, h, radius)
        this.#rectPath = rectPath

        const bg = this.backgroundColor()
        if (bg !== undefined) {
            this.fillStyle(bg)
            this.context?.fill(rectPath)
        }

        this.border(this.border())
        this.borderTop(this.borderTop())
        this.borderBottom(this.borderBottom())
        this.borderLeft(this.borderLeft())
        this.borderRight(this.borderRight())
    }

    #borderRadius(block: RectangleBlock, radius?: BorderRadius) {
        if (radius !== undefined) return shortHandParser(radius)
    }
    #backgroundColor(block: RectangleBlock, bg: FillStyle) {
        if (bg !== undefined) {
            block.fillStyle(bg)
        }
    }
    #borderWidth(block: RectangleBlock, opt?: RelativeType) {
        if (opt !== undefined) block.lineWidth(opt)
    }
    #borderColor(block: RectangleBlock, opt?: FillStyle) {
        if (opt !== undefined) block.strokeStyle(opt)
    }

    #border(block: RectangleBlock, opt?: RectangleBorder) {
        if (opt === undefined) return opt
        if (
            block.#isBorderSet('borderTop') ||
            block.#isBorderSet('borderRight') ||
            block.#isBorderSet('borderBottom') ||
            block.#isBorderSet('borderLeft')
        ) {
            return opt
        }
        if (typeof opt === 'string') opt = block.#borderConvert(opt)
        const ctx = block.context
        if (!ctx) return opt
        const [width, style, color] = opt
        ctx.save()
        ctx.lineWidth = width as number
        ctx.strokeStyle = color as string
        if (style === 'dotted') {
            ctx.setLineDash([4, 4])
            ctx.lineCap = 'butt'
        } else {
            ctx.setLineDash([])
            ctx.lineCap = 'butt'
        }
        if (block.#rectPath) ctx.stroke(block.#rectPath)
        ctx.restore()
        return opt
    }

    #borderTop(block: RectangleBlock, opt?: RectangleBorder) {
        return block.#borderSide('top', opt)
    }
    #borderRight(block: RectangleBlock, opt?: RectangleBorder) {
        return block.#borderSide('right', opt)
    }
    #borderBottom(block: RectangleBlock, opt?: RectangleBorder) {
        return block.#borderSide('bottom', opt)
    }
    #borderLeft(block: RectangleBlock, opt?: RectangleBorder) {
        return block.#borderSide('left', opt)
    }

    #borderSide(
        side: BorderSide,
        opt?: RectangleBorder
    ): RectangleBorder | undefined {
        if (opt === undefined) return opt
        if (typeof opt === 'string') opt = this.#borderConvert(opt)
        const [width, style, color] = opt as [
            BorderWidth,
            BorderStyle,
            BorderColor,
        ]
        const ctx = this.context
        if (!ctx) return opt
        const path = this.#sidePath(side, width as number)
        const r = this.#resolvedRadius()
        const sideHasArcs =
            (side === 'top' && (r[0] > 0 || r[1] > 0)) ||
            (side === 'right' && (r[1] > 0 || r[2] > 0)) ||
            (side === 'bottom' && (r[2] > 0 || r[3] > 0)) ||
            (side === 'left' && (r[3] > 0 || r[0] > 0))
        ctx.save()
        ctx.lineWidth = width as number
        ctx.strokeStyle = color as string
        ctx.lineJoin = 'round'
        if (style === 'dotted') {
            const edgeLength = this.#sideLength(side)
            const step = Math.max(1, edgeLength / 4)
            ctx.setLineDash([step, step])
            ctx.lineCap = 'butt'
        } else {
            ctx.setLineDash([])
            ctx.lineCap =
                !sideHasArcs && this.#hasAdjacentBorder(side)
                    ? 'square'
                    : 'butt'
        }
        ctx.stroke(path)
        ctx.restore()
        return opt
    }

    #hasAdjacentBorder(side: BorderSide): boolean {
        const neighbors: Record<BorderSide, [string, string]> = {
            top: ['borderLeft', 'borderRight'],
            right: ['borderTop', 'borderBottom'],
            bottom: ['borderRight', 'borderLeft'],
            left: ['borderBottom', 'borderTop'],
        }
        const [a, b] = neighbors[side]
        const va = this.getOptionCurrent(a)
        const vb = this.getOptionCurrent(b)
        return (
            (Array.isArray(va) && typeof va[0] === 'number') ||
            (Array.isArray(vb) && typeof vb[0] === 'number')
        )
    }

    #sideLength(side: BorderSide): number {
        return side === 'left' || side === 'right'
            ? this.height()
            : this.width()
    }

    #sidePath(side: BorderSide, borderWidth: number): Path2D {
        const x = this.x()
        const y = this.y()
        const w = this.width()
        const h = this.height()
        const r = this.#resolvedRadius()
        const path = new Path2D()
        const [tlR, trR, brR, blR] = r
        const lwHalf = borderWidth / 2
        const extendStart = (cornerR: number) => cornerR > 0 && cornerR < lwHalf
        const extendEnd = (cornerR: number) => cornerR > 0 && cornerR < lwHalf
        switch (side) {
            case 'top':
                if (this.#isBorderSet('borderLeft')) {
                    path.moveTo(x + tlR, y)
                } else if (extendStart(tlR)) {
                    path.moveTo(x, y)
                    path.lineTo(x, y + tlR)
                    if (tlR > 0) path.arcTo(x, y, x + tlR, y, tlR)
                } else {
                    path.moveTo(x, y + tlR)
                    if (tlR > 0) path.arcTo(x, y, x + tlR, y, tlR)
                }
                path.lineTo(x + w - trR, y)
                if (trR > 0) path.arcTo(x + w, y, x + w, y + trR, trR)
                if (!this.#isBorderSet('borderRight') && extendEnd(trR)) {
                    path.lineTo(x + w, y)
                }
                break
            case 'right':
                if (this.#isBorderSet('borderTop')) {
                    path.moveTo(x + w, y + trR)
                } else if (extendStart(trR)) {
                    path.moveTo(x + w, y)
                    path.lineTo(x + w - trR, y)
                    if (trR > 0) path.arcTo(x + w, y, x + w, y + trR, trR)
                } else {
                    path.moveTo(x + w - trR, y)
                    if (trR > 0) path.arcTo(x + w, y, x + w, y + trR, trR)
                }
                path.lineTo(x + w, y + h - brR)
                if (brR > 0) path.arcTo(x + w, y + h, x + w - brR, y + h, brR)
                if (!this.#isBorderSet('borderBottom') && extendEnd(brR)) {
                    path.lineTo(x + w, y + h)
                }
                break
            case 'bottom':
                if (this.#isBorderSet('borderRight')) {
                    path.moveTo(x + w - brR, y + h)
                } else if (extendStart(brR)) {
                    path.moveTo(x + w, y + h)
                    path.lineTo(x + w, y + h - brR)
                    if (brR > 0)
                        path.arcTo(x + w, y + h, x + w - brR, y + h, brR)
                } else {
                    path.moveTo(x + w, y + h - brR)
                    if (brR > 0)
                        path.arcTo(x + w, y + h, x + w - brR, y + h, brR)
                }
                path.lineTo(x + blR, y + h)
                if (blR > 0) path.arcTo(x, y + h, x, y + h - blR, blR)
                if (!this.#isBorderSet('borderLeft') && extendEnd(blR)) {
                    path.lineTo(x, y + h)
                }
                break
            case 'left':
                if (this.#isBorderSet('borderBottom')) {
                    path.moveTo(x, y + h - blR)
                } else if (extendStart(blR)) {
                    path.moveTo(x, y + h)
                    path.lineTo(x + blR, y + h)
                    if (blR > 0) path.arcTo(x, y + h, x, y + h - blR, blR)
                } else {
                    path.moveTo(x + blR, y + h)
                    if (blR > 0) path.arcTo(x, y + h, x, y + h - blR, blR)
                }
                path.lineTo(x, y + tlR)
                if (tlR > 0) path.arcTo(x, y, x + tlR, y, tlR)
                if (!this.#isBorderSet('borderTop') && extendEnd(tlR)) {
                    path.lineTo(x, y)
                }
                break
        }
        return path
    }

    #isBorderSet(key: string): boolean {
        const v = this.getOptionCurrent(key)
        return Array.isArray(v) && typeof v[0] === 'number'
    }

    #resolvedRadius(): [number, number, number, number] {
        const r = this.borderRadius()
        const parsed = shortHandParser(r as any) as any
        if (!Array.isArray(parsed) || parsed.length !== 4) {
            const n = (typeof r === 'number' ? r : 0) || 0
            return [n, n, n, n]
        }
        let [tlR, trR, brR, blR] = parsed
        const w = this.width()
        const h = this.height()
        const topSum = tlR + trR
        if (topSum > 0 && topSum > w) {
            const f = w / topSum
            tlR *= f
            trR *= f
        }
        const bottomSum = blR + brR
        if (bottomSum > 0 && bottomSum > w) {
            const f = w / bottomSum
            blR *= f
            brR *= f
        }
        const leftSum = tlR + blR
        if (leftSum > 0 && leftSum > h) {
            const f = h / leftSum
            tlR *= f
            blR *= f
        }
        const rightSum = trR + brR
        if (rightSum > 0 && rightSum > h) {
            const f = h / rightSum
            trR *= f
            brR *= f
        }
        return [tlR, trR, brR, blR]
    }

    #borderConvert(opt: string): RectangleBorder {
        const splitted = opt.split(' ')
        const borderWidth = this.__unitConverter(splitted[0], true)
        const borderStyle = splitted[1] as BorderStyle
        const borderColor = this.__colorConverter(splitted[2]) as string
        return [borderWidth, borderStyle, borderColor]
    }

    #maxBorderWidth(): number {
        const candidates: number[] = []
        const bw = this.getOptionCurrent('borderWidth')
        if (typeof bw === 'number') candidates.push(bw)
        for (const key of [
            'borderTop',
            'borderRight',
            'borderBottom',
            'borderLeft',
        ] as const) {
            const v = this.getOptionCurrent(key)
            if (Array.isArray(v) && typeof v[0] === 'number') {
                candidates.push(v[0])
            }
        }
        const b = this.getOptionCurrent('border')
        if (Array.isArray(b) && typeof b[0] === 'number') candidates.push(b[0])
        return candidates.length > 0 ? Math.max(...candidates) : 0
    }

    __clipShape() {
        const maxLW = this.#maxBorderWidth()
        const x = this.x() - maxLW / 2
        const y = this.y() - maxLW / 2
        const w = this.width() + maxLW
        const h = this.height() + maxLW
        this.__clipPath?.rect(x, y, w, h)
    }

    #pathInBound(x: number, y: number) {
        const context = this.context
        const path = this.#rectPath
        if (!context || !path) return false
        const centerX = this.rotationCenterX()
        const centerY = this.rotationCenterY()
        context.save()
        context.translate(centerX, centerY)
        context.rotate(this.rotate())
        context.translate(-centerX, -centerY)
        context.lineWidth = this.#maxBorderWidth()
        const inStroke = context.isPointInStroke(path, x, y)
        const inPath = context.isPointInPath(path, x, y)
        context.restore()
        return inStroke || inPath
    }

    checkInBound(event: MouseEvent): boolean {
        if (!this.__isRunningEventActive(SELECTABLE_RUNNING_EVENT)) {
            if (!this.#rectPath) return super.checkInBound(event)
            const { x, y } = this.canvas?.getCursorPosition(event)!
            return this.#pathInBound(x, y)
        }
        return super.checkInBound(event)
    }
}
