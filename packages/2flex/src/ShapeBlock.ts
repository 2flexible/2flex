import { Block, IBlockOptions } from './Block'
import type { RelativeType, XY } from './types'

export type GradientType = 'linear' | 'conic' | 'radial'
export type LineDash = number[]

export interface Fill {
    fill: boolean
    path?: Path2D
    fillRule?: CanvasFillRule
}
export interface Stroke {
    stroke: boolean
    path?: Path2D
}

export type FillStyle = CanvasFillStrokeStyles['fillStyle']
export type StrokeStyle = CanvasFillStrokeStyles['strokeStyle']

export type Font = string

export interface DrawText {
    text: string
    x: number
    y: number
    maxWidth?: number
}

export type FontWeight =
    | 'normal'
    | 'bold'
    | 'bolder'
    | 'lighter'
    | 100
    | 200
    | 300
    | 400
    | 500
    | 600
    | 700
    | 800
    | 900

export type FontStyle = 'normal' | 'italic' | 'oblique'
export type FontVariant = 'normal' | 'small-caps'

export interface GradientStops {
    gradient?: CanvasGradient
    stop: number
    color: string
}
export interface QuadraticCurveToOpt {
    cpx1: number
    cpy1: number
    endX: number
    endY: number
}
export interface BezierCurveToOpt extends QuadraticCurveToOpt {
    cpx2: number
    cpy2: number
}
export interface RadialGradient {
    x0: number
    y0: number
    r0: number
    x1: number
    y1: number
    r1: number
}
export interface LinearGradient {
    x0: number
    y0: number
    x1: number
    y1: number
}

export interface ConicGradient {
    angle: number
    x: number
    y: number
}
export interface RectOpt extends XY {
    x: number
    y: number
    width: number
    height: number
}
export interface RoundRectOpt extends RectOpt {
    // border-radius: [top-left, top-right, bottom-right, bottom-left]
    borderRadius: number[]
}
export interface PointInPath extends XY {
    path?: Path2D
    fillRule?: CanvasFillRule
}
export interface PointInStroke extends XY {
    path?: Path2D
}

export interface Clip {
    path?: Path2D
    fillRule?: CanvasFillRule
}

interface ShapeFilters {
    [key: string]: string | undefined
    blur?: string
    brightness?: string
    contrast?: string
    dropShadow?: string
    grayscale?: string
    hueRotate?: string
    saturate?: string
    sepia?: string
}

interface Arc {
    x: number
    y: number
    radius: number
    startAngle: number
    endAngle: number
    counterclockwise?: boolean
}

interface ArcTo {
    x1: number
    y1: number
    x2: number
    y2: number
    radius: number
}

interface Ellipse {
    x: number
    y: number
    radiusX: number
    radiusY: number
    rotation: number
    startAngle: number
    endAngle: number
    counterclockwise?: boolean
}
interface DrawImage {
    source: CanvasImageSource
    x: number
    y: number
    width: number
    height: number
    clipX: number
    clipY: number
    clipWidth: number
    clipHeight: number
}

interface Pattern {
    image:
        | HTMLImageElement
        | SVGImageElement
        | HTMLVideoElement
        | HTMLCanvasElement
        | ImageBitmap
        | OffscreenCanvas
        | VideoFrame
    repetition: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat'
}

export type DrawFunc = (context: OffscreenCanvasRenderingContext2D) => void

export type DropShadow = [RelativeType, RelativeType, RelativeType, FillStyle][]

export interface IShapeOptions extends IBlockOptions {
    fill?: Fill
    fillStyle?: FillStyle

    stroke?: Stroke
    strokeStyle?: StrokeStyle

    lineTo?: XY
    lineWidth?: RelativeType
    lineDash?: LineDash[]
    lineCap?: CanvasLineCap
    lineDashOffset?: CanvasPathDrawingStyles['lineDashOffset']
    lineJoin?: CanvasLineJoin

    miterLimit?: CanvasPathDrawingStyles['miterLimit']

    arc?: Arc
    arcTo?: ArcTo
    ellipse?: Ellipse

    bezierCurveTo?: BezierCurveToOpt
    quadraticCurveTo?: QuadraticCurveToOpt

    rect?: RectOpt
    roundRect?: RoundRectOpt
    strokeRect?: RectOpt

    pointInPath?: PointInPath
    pointInStroke?: PointInStroke

    moveTo?: XY

    radialGradient?: RadialGradient
    linearGradient?: LinearGradient
    conicGradient?: ConicGradient
    colorStops?: GradientStops[]

    blur?: RelativeType
    brightness?: RelativeType
    contrast?: RelativeType
    dropShadow?: DropShadow
    grayscale?: RelativeType
    hueRotate?: RelativeType
    saturate?: RelativeType
    sepia?: RelativeType

    shadowBlur?: RelativeType
    shadowColor?: string
    shadowOffsetX?: RelativeType
    shadowOffsetY?: RelativeType

    fillText?: DrawText
    strokeText?: DrawText
    font?: Font
    fontStretch?: CanvasFontStretch
    fontKerning?: CanvasFontKerning
    fontVariantCaps?: CanvasFontVariantCaps
    textBaseline?: CanvasTextBaseline
    textRendering?: CanvasTextRendering
    wordSpacing?: string
    letterSpacing?: string
    direction?: CanvasDirection
    textAlign?: CanvasTextAlign

    clip?: Clip

    drawImage?: DrawImage
    imageSmoothingEnabled?: boolean
    imageSmoothingQuality?: ImageSmoothingQuality

    globalCompositeOperation?: GlobalCompositeOperation
    globalAlpha?: number
}
export class ShapeBlock extends Block {
    #gradient?: CanvasGradient
    #canvasPattern?: CanvasPattern | null
    #filters: ShapeFilters = {}
    #filterStr?: string

    constructor(options: IShapeOptions) {
        super(options)
        this.addProperty(
            'clip',
            undefined,
            false,
            (block: ShapeBlock, opt?: Clip) => this.#clip(block, opt)
        )
        this.addProperty(
            'fill',
            undefined,
            false,
            (block: ShapeBlock, opt?: Fill) => this.#fill(block, opt)
        )
        this.addProperty(
            'fillStyle',
            undefined,
            false,
            (block: ShapeBlock, opt?: FillStyle) => this.#fillStyle(block, opt)
        )
        this.addProperty(
            'conicGradient',
            undefined,
            false,
            (block: ShapeBlock, opt?: ConicGradient) =>
                this.#conicGradient(block, opt)
        )
        this.addProperty(
            'radialGradient',
            undefined,
            false,
            (block: ShapeBlock, opt?: RadialGradient) =>
                this.#radialGradient(block, opt)
        )
        this.addProperty(
            'linearGradient',
            undefined,
            false,
            (block: ShapeBlock, opt?: LinearGradient) =>
                this.#linearGradient(block, opt)
        )
        this.addProperty(
            'colorStops',
            undefined,
            false,
            (block: ShapeBlock, opt?: GradientStops[]) =>
                this.#colorStops(block, opt)
        )
        this.addProperty(
            'stroke',
            undefined,
            false,
            (block: ShapeBlock, opt?: Stroke) => this.#stroke(block, opt)
        )
        this.addProperty(
            'strokeStyle',
            undefined,
            false,
            (block: ShapeBlock, opt?: StrokeStyle) =>
                this.#strokeStyle(block, opt)
        )
        this.addProperty(
            'lineCap',
            undefined,
            false,
            (block: ShapeBlock, opt?: CanvasLineCap) =>
                this.#lineCap(block, opt)
        )
        this.addProperty(
            'lineWidth',
            undefined,
            true,
            (block: ShapeBlock, opt?: RelativeType) =>
                this.#lineWidth(block, opt)
        )
        this.addProperty(
            'shadowBlur',
            undefined,
            false,
            (block: ShapeBlock, opt?: RelativeType) =>
                this.#shadowBlur(block, opt)
        )
        this.addProperty(
            'shadowColor',
            undefined,
            false,
            (block: ShapeBlock, opt?: string) => this.#shadowColor(block, opt)
        )
        this.addProperty(
            'shadowOffsetX',
            0,
            false,
            (block: ShapeBlock, opt?: RelativeType) =>
                this.#shadowOffsetX(block, opt)
        )
        this.addProperty(
            'shadowOffsetY',
            0,
            false,
            (block: ShapeBlock, opt?: RelativeType) =>
                this.#shadowOffsetY(block, opt)
        )
        this.addProperty(
            'lineDash',
            undefined,
            false,
            (block: ShapeBlock, opt?: LineDash) => this.#lineDash(block, opt)
        )
        this.addProperty(
            'lineDashOffset',
            undefined,
            false,
            (
                block: ShapeBlock,
                opt?: CanvasPathDrawingStyles['lineDashOffset']
            ) => this.#lineDashOffset(block, opt)
        )
        this.addProperty(
            'lineTo',
            undefined,
            false,
            (block: ShapeBlock, opt?: XY) => this.#lineTo(block, opt)
        )
        this.addProperty(
            'quadraticCurveTo',
            undefined,
            false,
            (block: ShapeBlock, opt?: QuadraticCurveToOpt) =>
                this.#quadraticCurveTo(block, opt)
        )
        this.addProperty(
            'bezierCurveTo',
            undefined,
            false,
            (block: ShapeBlock, opt?: BezierCurveToOpt) =>
                this.#bezierCurveTo(block, opt)
        )
        this.addProperty(
            'fillRect',
            undefined,
            true,
            (block: ShapeBlock, opt?: RectOpt) => this.#fillRect(block, opt)
        )
        this.addProperty(
            'rect',
            undefined,
            true,
            (block: ShapeBlock, opt?: RectOpt) => this.#rect(block, opt)
        )
        this.addProperty(
            'roundRect',
            undefined,
            true,
            (block: ShapeBlock, opt?: RoundRectOpt) =>
                this.#roundRect(block, opt)
        )
        this.addProperty(
            'strokeRect',
            undefined,
            true,
            (block: ShapeBlock, opt?: RectOpt) => this.#strokeRect(block, opt)
        )
        this.addProperty(
            'arc',
            undefined,
            false,
            (block: ShapeBlock, opt?: Arc) => this.#arc(block, opt)
        )
        this.addProperty(
            'arcTo',
            undefined,
            false,
            (block: ShapeBlock, opt?: ArcTo) => this.#arcTo(block, opt)
        )
        this.addProperty(
            'ellipse',
            undefined,
            false,
            (block: ShapeBlock, opt?: Ellipse) => this.#ellipse(block, opt)
        )
        this.addProperty(
            'moveTo',
            undefined,
            false,
            (block: ShapeBlock, opt?: XY) => this.#moveTo(block, opt)
        )
        this.addProperty(
            'lineJoin',
            undefined,
            false,
            (block: ShapeBlock, opt?: CanvasLineJoin) =>
                this.#lineJoin(block, opt)
        )
        this.addProperty(
            'font',
            undefined,
            false,
            (block: ShapeBlock, opt?: Font) => this.#font(block, opt)
        )
        this.addProperty(
            'fillText',
            undefined,
            false,
            (block: ShapeBlock, opt?: DrawText) => this.#fillText(block, opt)
        )
        this.addProperty(
            'strokeText',
            undefined,
            false,
            (block: ShapeBlock, opt?: DrawText) => this.#strokeText(block, opt)
        )
        this.addProperty(
            'fontStretch',
            undefined,
            false,
            (block: ShapeBlock, opt?: CanvasFontStretch) =>
                this.#fontStretch(block, opt)
        )
        this.addProperty(
            'fontKerning',
            undefined,
            false,
            (block: ShapeBlock, opt?: CanvasFontKerning) =>
                this.#fontKerning(block, opt)
        )
        this.addProperty(
            'fontVariantCaps',
            undefined,
            false,
            (block: ShapeBlock, opt?: CanvasFontVariantCaps) =>
                this.#fontVariantCaps(block, opt)
        )
        this.addProperty(
            'wordSpacing',
            undefined,
            false,
            (block: ShapeBlock, opt?: RelativeType) =>
                this.#wordSpacing(block, opt)
        )
        this.addProperty(
            'direction',
            undefined,
            false,
            (block: ShapeBlock, opt?: CanvasDirection) =>
                this.#direction(block, opt)
        )
        this.addProperty(
            'letterSpacing',
            undefined,
            false,
            (block: ShapeBlock, opt?: RelativeType) =>
                this.#letterSpacing(block, opt)
        )
        this.addProperty(
            'textAlign',
            undefined,
            false,
            (block: ShapeBlock, opt?: CanvasTextAlign) =>
                this.#textAlign(block, opt)
        )
        this.addProperty(
            'miterLimit',
            undefined,
            false,
            (block: ShapeBlock, opt?: CanvasPathDrawingStyles['miterLimit']) =>
                this.#miterLimit(block, opt)
        )
        this.addProperty(
            'textBaseline',
            undefined,
            false,
            (block: ShapeBlock, opt?: CanvasTextBaseline) =>
                this.#textBaseline(block, opt)
        )
        this.addProperty(
            'textRendering',
            undefined,
            false,
            (block: ShapeBlock, opt?: CanvasTextRendering) =>
                this.#textRendering(block, opt)
        )
        this.addProperty(
            'blur',
            undefined,
            false,
            (block: ShapeBlock, opt?: RelativeType) => this.#blur(block, opt)
        )
        this.addProperty(
            'brightness',
            undefined,
            false,
            (block: ShapeBlock, opt?: RelativeType) =>
                this.#brightness(block, opt)
        )
        this.addProperty(
            'contrast',
            undefined,
            false,
            (block: ShapeBlock, opt?: RelativeType) =>
                this.#contrast(block, opt)
        )
        this.addProperty(
            'dropShadow',
            undefined,
            false,
            (block: ShapeBlock, opt?: DropShadow) =>
                this.#dropShadow(block, opt)
        )
        this.addProperty(
            'grayscale',
            undefined,
            false,
            (block: ShapeBlock, opt?: RelativeType) =>
                this.#grayscale(block, opt)
        )
        this.addProperty(
            'hueRotate',
            undefined,
            false,
            (block: ShapeBlock, opt?: RelativeType) =>
                this.#hueRotate(block, opt)
        )
        this.addProperty(
            'saturate',
            undefined,
            false,
            (block: ShapeBlock, opt?: RelativeType) =>
                this.#saturate(block, opt)
        )
        this.addProperty(
            'sepia',
            undefined,
            false,
            (block: ShapeBlock, opt?: RelativeType) => this.#sepia(block, opt)
        )
        this.addProperty(
            'drawImage',
            undefined,
            false,
            (block: ShapeBlock, opt?: DrawImage) => this.#drawImage(block, opt)
        )
        this.addProperty(
            'pattern',
            undefined,
            false,
            (block: ShapeBlock, opt?: Pattern) => this.#pattern(block, opt)
        )
        this.addProperty(
            'imageSmoothingEnabled',
            undefined,
            false,
            (block: ShapeBlock, opt?: boolean) =>
                this.#imageSmoothingEnabled(block, opt)
        )
        this.addProperty(
            'imageSmoothingQuality',
            undefined,
            false,
            (block: ShapeBlock, opt?: ImageSmoothingQuality) =>
                this.#imageSmoothingQuality(block, opt)
        )
        this.addProperty(
            'globalCompositeOperation',
            undefined,
            false,
            (block: ShapeBlock, opt?: GlobalCompositeOperation) =>
                this.#globalCompositeOperation(block, opt)
        )
        this.addProperty(
            'globalAlpha',
            undefined,
            false,
            (block: ShapeBlock, opt?: number) => this.#globalAlpha(block, opt)
        )
    }
    render(): void {
        super.render()
        if (this.__isHidden) return
        this.beginPath()
        this.context?.save()

        // need to clip child before restore if its exist
        this.__childClipping?.(this)
        this.context?.translate(this.rotationCenterX(), this.rotationCenterY())
        this.context?.rotate(this.rotate())
        // @TODO: add features for vertical or horizantal flipping
        // this.context?.setTransform(
        //     this.horizontalFlip() ? -1 : 1,
        //     0,
        //     0,
        //     this.verticalFlip() ? -1 : 1,
        //     !this.horizontalFlip() ? this.rotationCenterX() : 0,
        //     !this.verticalFlip() ? this.rotationCenterY() : 0
        // );

        this.context?.translate(
            -this.rotationCenterX(),
            -this.rotationCenterY()
        )
        this.#contextFilter()
        if (this.getOptionCurrent('lineDash') !== undefined) this.lineDash()
        if (this.getOptionCurrent('lineWidth') !== undefined) this.lineWidth()
        if (this.getOptionCurrent('lineCap') !== undefined) this.lineCap()
        if (this.getOptionCurrent('shadowBlur') !== undefined) this.shadowBlur()
        if (this.getOptionCurrent('shadowColor') !== undefined)
            this.shadowColor()
        if (this.getOptionCurrent('fillStyle') !== undefined) this.fillStyle()
        if (this.getOptionCurrent('fillRect') !== undefined) this.fillRect()
        if (this.getOptionCurrent('rect') !== undefined) this.rect()
        if (this.getOptionCurrent('imageSmoothingEnabled') !== undefined)
            this.imageSmoothingEnabled()
        if (this.getOptionCurrent('imageSmoothingQuality') !== undefined)
            this.imageSmoothingQuality()
        if (this.getOptionCurrent('strokeStyle') !== undefined)
            this.strokeStyle()
        if (this.getOptionCurrent('clip') !== undefined) this.clip()

        this.draw()

        if (this.getOptionCurrent('fill')) this.fill()
        if (this.getOptionCurrent('stroke')) this.stroke()

        this.onRender()?.(this)
        this.context?.restore()
    }

    draw(_func?: DrawFunc) {
        const func = this.__valueHandler<DrawFunc, DrawFunc | undefined>(
            _func,
            'drawFunc',
            undefined
        )
        if (func && this.context) func(this.context)
    }

    beginPath() {
        this.context?.beginPath()
    }
    closePath(): void {
        this.context?.closePath()
    }
    #clip(block: ShapeBlock, opt?: Clip) {
        if (opt) {
            const fillRule = opt.fillRule || 'nonzero'
            if (opt.path) block.context?.clip(opt.path, fillRule)
            else block.context?.clip(fillRule)
        }
    }
    #fill(block: ShapeBlock, opt?: Fill) {
        if (opt && opt.fill) {
            const fillRule = (opt.fillRule || 'nonzero') as CanvasFillRule
            if (opt.path) block.context?.fill(opt.path, fillRule)
            else block.context?.fill(fillRule)
        }
    }
    #fillStyle(block: ShapeBlock, opt?: FillStyle) {
        if (block.context && opt)
            block.context.fillStyle =
                block.#gradient || block.#canvasPattern || opt
    }

    #conicGradient(block: ShapeBlock, opt?: ConicGradient) {
        if (opt)
            block.#gradient = block.context?.createConicGradient(
                opt.angle,
                opt.x,
                opt.y
            )
    }
    #radialGradient(block: ShapeBlock, opt?: RadialGradient) {
        if (opt)
            block.#gradient = block.context?.createRadialGradient(
                opt.x0,
                opt.y0,
                opt.r0,
                opt.x1,
                opt.y1,
                opt.r1
            )
    }
    #linearGradient(block: ShapeBlock, opt?: LinearGradient) {
        if (opt)
            block.#gradient = block.context?.createLinearGradient(
                opt.x0,
                opt.y0,
                opt.x1,
                opt.y1
            )
    }
    #colorStops(block: ShapeBlock, opt?: GradientStops[]) {
        if (opt) {
            for (let stop of opt) {
                block.#gradient?.addColorStop(stop.stop, stop.color)
                stop.gradient?.addColorStop(stop.stop, stop.color)
            }
        }
    }
    #stroke(block: ShapeBlock, opt?: Stroke) {
        if (opt && opt.stroke) {
            if (opt.path) block.context?.stroke(opt.path)
            else block.context?.stroke()
        }
    }
    #strokeStyle(block: ShapeBlock, opt?: StrokeStyle) {
        if (block.context && opt)
            block.context.strokeStyle =
                block.#gradient || block.#canvasPattern || opt
    }
    #lineCap(block: ShapeBlock, opt?: CanvasLineCap) {
        if (block.context && opt) block.context.lineCap = opt
    }
    #lineWidth(block: ShapeBlock, opt?: RelativeType) {
        if (block.context && opt !== undefined)
            block.context.lineWidth = opt as number
    }
    #shadowBlur(block: ShapeBlock, opt?: RelativeType) {
        if (block.context && opt !== undefined)
            block.context.shadowBlur = opt as number
    }
    #shadowColor(block: ShapeBlock, opt?: string) {
        if (block.context && opt) block.context.shadowColor = opt
    }
    #shadowOffsetX(block: ShapeBlock, opt?: RelativeType) {
        if (block.context && opt !== undefined)
            block.context.shadowOffsetX = opt as number
    }
    #shadowOffsetY(block: ShapeBlock, opt?: RelativeType) {
        if (block.context && opt !== undefined)
            block.context.shadowOffsetY = opt as number
    }
    #lineDash(block: ShapeBlock, opt?: LineDash) {
        if (opt) block.context?.setLineDash(opt)
    }
    #lineDashOffset(
        block: ShapeBlock,
        opt?: CanvasPathDrawingStyles['lineDashOffset']
    ) {
        if (block.context && opt !== undefined)
            block.context.lineDashOffset = opt
    }
    #lineTo(block: ShapeBlock, opt?: XY) {
        if (opt) block.context?.lineTo(opt.x, opt.y)
    }
    #quadraticCurveTo(block: ShapeBlock, opt?: QuadraticCurveToOpt) {
        if (opt)
            block.context?.quadraticCurveTo(
                opt.cpx1,
                opt.cpy1,
                opt.endX,
                opt.endY
            )
    }
    #bezierCurveTo(block: ShapeBlock, opt?: BezierCurveToOpt) {
        if (opt)
            block.context?.bezierCurveTo(
                opt.cpx1,
                opt.cpy1,
                opt.cpx2,
                opt.cpy2,
                opt.endX,
                opt.endY
            )
    }
    #fillRect(block: ShapeBlock, opt?: RectOpt) {
        const { x, y, width, height } = block.__valueHandler(opt, 'fillRect', {
            x: block.x(),
            y: block.y(),
            width: block.width(),
            height: block.height(),
        })
        block.context?.fillRect(
            block.x() + x,
            block.y() + y,
            block.width() - width,
            block.height() - height
        )
    }
    #rect(block: ShapeBlock, opt?: RectOpt) {
        if (opt)
            block.context?.rect(
                block.x() + opt.x,
                block.y() + opt.y,
                opt.width,
                opt.height
            )
    }
    #roundRect(block: ShapeBlock, opt?: RoundRectOpt) {
        if (opt) {
            block.context?.roundRect(
                block.x() + opt.x,
                block.y() + opt.y,
                opt.width,
                opt.height,
                opt.borderRadius
            )
        }
    }
    #strokeRect(block: ShapeBlock, opt?: RectOpt) {
        if (opt) {
            block.context?.strokeRect(
                block.x() + opt.x,
                block.y() + opt.y,
                opt.width,
                opt.height
            )
        }
    }

    #arc(block: ShapeBlock, opt?: Arc) {
        if (opt)
            block.context?.arc(
                opt.x,
                opt.y,
                opt.radius,
                opt.startAngle,
                opt.endAngle,
                opt.counterclockwise
            )
    }

    #arcTo(block: ShapeBlock, opt?: ArcTo) {
        if (opt)
            block.context?.arcTo(opt.x1, opt.y1, opt.x2, opt.y2, opt.radius)
    }

    #ellipse(block: ShapeBlock, opt?: Ellipse) {
        if (opt)
            block.context?.ellipse(
                opt.x,
                opt.y,
                opt.radiusX,
                opt.radiusY,
                opt.rotation,
                opt.startAngle,
                opt.endAngle,
                opt.counterclockwise || false
            )
    }

    #moveTo(block: ShapeBlock, opt?: XY) {
        if (opt) block.context?.moveTo(block.x() + opt.x, block.y() + opt.y)
    }
    #lineJoin(block: ShapeBlock, opt?: CanvasLineJoin) {
        if (block.context && opt) block.context.lineJoin = opt
    }
    pointInPath(point: PointInPath): boolean {
        if (point.path)
            return (
                this.context?.isPointInPath(
                    point.path,
                    point.x,
                    point.y,
                    point.fillRule || 'nonzero'
                ) || false
            )
        else
            return (
                this.context?.isPointInPath(
                    point.x,
                    point.y,
                    point.fillRule || 'nonzero'
                ) || false
            )
    }
    pointInStroke(point: PointInStroke): boolean | undefined {
        if (point.path)
            return (
                this.context?.isPointInStroke(point.path, point.x, point.y) ||
                false
            )
        else return this.context?.isPointInStroke(point.x, point.y) || false
    }

    #font(block: ShapeBlock, opt?: Font) {
        if (block.context && opt) block.context.font = opt
    }

    #fillText(block: ShapeBlock, opt?: DrawText) {
        if (opt)
            if (opt.maxWidth)
                block.context?.fillText(opt.text, opt.x, opt.y, opt.maxWidth)
            else block.context?.fillText(opt.text, opt.x, opt.y)
    }

    #strokeText(block: ShapeBlock, opt?: DrawText) {
        if (opt)
            if (opt.maxWidth)
                block.context?.strokeText(opt.text, opt.x, opt.y, opt.maxWidth)
            else block.context?.strokeText(opt.text, opt.x, opt.y)
    }

    #fontStretch(block: ShapeBlock, opt?: CanvasFontStretch) {
        if (block.context && opt) block.context.fontStretch = opt
    }

    #fontKerning(block: ShapeBlock, opt?: CanvasFontKerning) {
        if (block.context && opt) block.context.fontKerning = opt
    }

    #fontVariantCaps(block: ShapeBlock, opt?: CanvasFontVariantCaps) {
        if (block.context && opt) block.context.fontVariantCaps = opt
    }

    #wordSpacing(block: ShapeBlock, opt?: RelativeType) {
        if (block.context && opt !== undefined)
            block.context.wordSpacing = `${opt}px`
    }

    #direction(block: ShapeBlock, opt?: CanvasDirection) {
        if (block.context && opt) block.context.direction = opt
    }

    #letterSpacing(block: ShapeBlock, opt?: RelativeType) {
        if (block.context && opt !== undefined)
            block.context.letterSpacing = `${opt}px`
    }

    #textAlign(block: ShapeBlock, opt?: CanvasTextAlign) {
        if (block.context && opt !== undefined) block.context.textAlign = opt
    }

    #miterLimit(
        block: ShapeBlock,
        opt?: CanvasPathDrawingStyles['miterLimit']
    ) {
        if (block.context && opt !== undefined) block.context.miterLimit = opt
    }

    #textBaseline(block: ShapeBlock, opt?: CanvasTextBaseline) {
        if (block.context && opt) block.context.textBaseline = opt
    }

    #textRendering(block: ShapeBlock, opt?: CanvasTextRendering) {
        if (block.context && opt) block.context.textRendering = opt
    }

    measureText(text: string): TextMetrics | undefined {
        return this.context?.measureText(text)
    }

    #contextFilter() {
        if (!this.#filterStr) {
            const entries = Object.entries(this.#filters)
            if (entries.length !== 0) {
                let allStr = ''
                for (const [key, value] of Object.entries(this.#filters)) {
                    if (value) allStr += ` ${key + value}`
                }
                this.#filterStr = allStr
            }
        }
        if (this.context && this.#filterStr) {
            this.context.filter = this.#filterStr
        }
    }

    #filterHandler(
        filter?: keyof ShapeFilters,
        value?: string | number | number[]
    ) {
        if (value === undefined || filter == undefined) return
        switch (filter) {
            case 'blur':
                value = value + 'px'
                break
            case 'brightness':
                value = value + '%'
                break
            case 'contrast':
                value = value + '%'
                break
            case 'drop-shadow':
                let _s = ''
                ;(value as number[]).forEach((i, idx, arr) => {
                    if (typeof i == 'string') _s += i
                    else {
                        _s += `${i}px`
                    }
                    if (idx !== arr.length - 1) _s += ' '
                })
                value = _s
                break
            case 'grayscale':
                value = value + '%'
                break
            case 'hue-rotate':
                value = value + 'deg'
                break
            case 'opacity':
                value = value + '%'
                break
            case 'saturate':
                value = value + '%'
                break
            case 'sepia':
                value = value + '%'
                break
        }
        this.#filters[filter] = `(${value})`
        this.#filterStr = undefined
    }

    #blur(block: ShapeBlock, opt?: RelativeType) {
        block.#filterHandler('blur', opt)
    }
    #brightness(block: ShapeBlock, opt?: RelativeType) {
        block.#filterHandler('brightness', opt)
    }
    #contrast(block: ShapeBlock, opt?: RelativeType) {
        block.#filterHandler('contrast', opt)
    }
    #dropShadow(block: ShapeBlock, opt?: DropShadow) {
        block.#filterHandler('drop-shadow', opt as any)
    }
    #grayscale(block: ShapeBlock, opt?: RelativeType) {
        block.#filterHandler('grayscale', opt)
    }
    #hueRotate(block: ShapeBlock, opt?: RelativeType) {
        block.#filterHandler('hue-rotate', opt)
    }
    #saturate(block: ShapeBlock, opt?: RelativeType) {
        block.#filterHandler('saturate', opt)
    }
    #sepia(block: ShapeBlock, opt?: RelativeType) {
        block.#filterHandler('sepia', opt)
    }

    #drawImage(block: ShapeBlock, opt?: DrawImage) {
        if (opt && opt.source)
            block.context?.drawImage(
                opt.source,
                opt.clipX || 0,
                opt.clipY || 0,
                opt.clipWidth || block.width(),
                opt.clipHeight || block.height(),
                opt.x || block.x(),
                opt.y || block.y(),
                opt.width || block.width(),
                opt.height || block.height()
            )
    }
    #pattern(block: ShapeBlock, opt?: Pattern) {
        const pattern = block.__valueHandler(opt, 'pattern', {
            image: undefined,
            repetition: 'repeat',
        })
        if (pattern.image && pattern.repetition)
            block.#canvasPattern = block.context?.createPattern(
                pattern.image,
                pattern.repetition
            )
    }

    #imageSmoothingEnabled(block: ShapeBlock, opt?: boolean) {
        if (block.context && opt !== undefined)
            block.context.imageSmoothingEnabled = opt
    }
    #imageSmoothingQuality(block: ShapeBlock, opt?: ImageSmoothingQuality) {
        if (block.context && opt) block.context.imageSmoothingQuality = opt
    }

    #globalCompositeOperation(
        block: ShapeBlock,
        opt?: GlobalCompositeOperation
    ) {
        if (block.context && opt) block.context.globalCompositeOperation = opt
    }
    #globalAlpha(block: ShapeBlock, opt?: number) {
        if (block.context && opt) block.context.globalAlpha = opt
    }
}
