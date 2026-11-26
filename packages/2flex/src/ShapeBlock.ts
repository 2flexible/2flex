import { invalidArgument, isRecord, requireCallback } from './Utils'
import { type BlockOptions } from './Block'
import { Block } from './Block'
import {
    type ColorType,
    type OwnOptionAccessors,
    type ResolvedAs,
    type TextType,
} from './BaseBlock'
import { type RelativeType, type XY } from './types'

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

export type DropShadow = [RelativeType, RelativeType, RelativeType, FillStyle]

export interface ShapeBlockOptions extends BlockOptions {
    /**
     * The style the shape is filled with.
     */
    fill?: Fill
    /**
     * The way a shape is filled.
     */
    fillStyle?: ResolvedAs<FillStyle, FillStyle | undefined>

    /**
     * The style the outline of the shape is drawn with.
     */
    stroke?: Stroke
    /**
     * The way an outline is drawn.
     */
    strokeStyle?: ResolvedAs<StrokeStyle, StrokeStyle | undefined>

    /**
     * The point a line is drawn to.
     */
    lineTo?: XY
    /**
     * The width of the line.
     */
    lineWidth?: RelativeType
    /**
     * The dashes the line is drawn with.
     */
    lineDash?: LineDash
    /**
     * The way the ends of the line are drawn.
     */
    lineCap?: CanvasLineCap
    /**
     * The distance the dashes are moved by.
     */
    lineDashOffset?: CanvasPathDrawingStyles['lineDashOffset']
    /**
     * The way the corners of the line are drawn.
     */
    lineJoin?: CanvasLineJoin

    /**
     * The limit of the length of the corners of the line.
     */
    miterLimit?: CanvasPathDrawingStyles['miterLimit']

    /**
     * The arc or the circle that is drawn.
     */
    arc?: Arc
    /**
     * The arc that is drawn to the corner between two lines.
     */
    arcTo?: ArcTo
    /**
     * The ellipse that is drawn.
     */
    ellipse?: Ellipse

    /**
     * The curve of a Bézier that is drawn.
     */
    bezierCurveTo?: BezierCurveToOpt
    /**
     * The curve of a quadratic Bézier that is drawn.
     */
    quadraticCurveTo?: QuadraticCurveToOpt

    /**
     * The rectangle that is drawn.
     */
    rect?: RectOpt
    /**
     * The rectangle with rounded corners that is drawn.
     */
    roundRect?: RoundRectOpt
    /**
     * The rectangle that is filled.
     */
    fillRect?: RectOpt
    /**
     * The rectangle whose outline is drawn.
     */
    strokeRect?: RectOpt

    /**
     * The point that is tested against the path of the shape.
     */
    pointInPath?: PointInPath
    /**
     * The point that is tested against the outline of the shape.
     */
    pointInStroke?: PointInStroke

    /**
     * The point the path of the shape starts at.
     */
    moveTo?: XY

    /**
     * The radial gradient that is used to fill the shape.
     */
    radialGradient?: RadialGradient
    /**
     * The linear gradient that is used to fill the shape.
     */
    linearGradient?: LinearGradient
    /**
     * The conic gradient that is used to fill the shape.
     */
    conicGradient?: ConicGradient
    /**
     * The stops of the gradient.
     */
    colorStops?: GradientStops[]

    /**
     * The blur that is applied to the shape.
     */
    blur?: RelativeType | RelativeType[]
    /**
     * The brightness that is applied to the shape.
     */
    brightness?: RelativeType | RelativeType[]
    /**
     * The contrast that is applied to the shape.
     */
    contrast?: RelativeType | RelativeType[]
    /**
     * The shadow that is dropped behind the shape.
     */
    dropShadow?: DropShadow | DropShadow[]
    /**
     * The amount of gray the shape is drawn with.
     */
    grayscale?: RelativeType | RelativeType[]
    /**
     * The shift of the colors of the shape.
     */
    hueRotate?: RelativeType | RelativeType[]
    /**
     * The amount of color the shape is drawn with.
     */
    saturate?: RelativeType | RelativeType[]
    /**
     * The amount of sepia the shape is drawn with.
     */
    sepia?: RelativeType | RelativeType[]

    /**
     * The blur of the shadow of the shape.
     */
    shadowBlur?: RelativeType
    /**
     * The color of the shadow of the shape.
     */
    shadowColor?: ResolvedAs<ColorType, ColorType | undefined>
    /**
     * The horizontal offset of the shadow of the shape.
     */
    shadowOffsetX?: RelativeType
    /**
     * The vertical offset of the shadow of the shape.
     */
    shadowOffsetY?: RelativeType

    /**
     * The text that is filled into the shape.
     */
    fillText?: DrawText
    /**
     * The text whose outline is drawn.
     */
    strokeText?: DrawText
    /**
     * The font the text is drawn with.
     */
    font?: TextType
    /**
     * The width of the font.
     */
    fontStretch?: CanvasFontStretch
    /**
     * The way the letters of the font are placed.
     */
    fontKerning?: CanvasFontKerning
    /**
     * The way the capitals of the font are drawn.
     */
    fontVariantCaps?: CanvasFontVariantCaps
    /**
     * The line the text is placed on.
     */
    textBaseline?: CanvasTextBaseline
    /**
     * The way the text is drawn.
     */
    textRendering?: CanvasTextRendering
    /**
     * The space between the words of the text.
     */
    wordSpacing?: RelativeType
    /**
     * The space between the letters of the text.
     */
    letterSpacing?: RelativeType
    /**
     * The direction the text is written in.
     */
    direction?: CanvasDirection
    /**
     * The way the text is aligned in its block.
     */
    textAlign?: CanvasTextAlign

    /**
     * The path the children of the block are clipped with.
     */
    clip?: Clip

    /**
     * The image that is drawn.
     */
    drawImage?: DrawImage
    /**
     * The pattern the shape is filled with.
     */
    pattern?: Pattern
    /**
     * Whether the image is smoothed while it is scaled.
     */
    imageSmoothingEnabled?: boolean
    /**
     * The quality of the smoothing of the image.
     */
    imageSmoothingQuality?: ImageSmoothingQuality

    /**
     * The way the shape is drawn onto the canvas.
     */
    globalCompositeOperation?: GlobalCompositeOperation
    /**
     * The opacity the shape is drawn with.
     */
    globalAlpha?: number
}

/**
 * A block that draws onto the canvas.
 *
 * The class gives a block access to the rendering context of the canvas. The
 * options of the block are the calls of the context, they are written to it
 * before the block is drawn.
 */
export class ShapeBlock<
    T extends ShapeBlockOptions = ShapeBlockOptions,
> extends Block<T> {
    #gradient?: CanvasGradient
    #canvasPattern?: CanvasPattern | null
    #filters: ShapeFilters = {}
    #filterStr?: string

    constructor(options: ShapeBlockOptions) {
        super(options as T)
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
            (block: ShapeBlock, opt?: TextType) => this.#font(block, opt)
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
    set(options: T): void {
        super.set(options)
    }
    render(): void {
        super.render()
        const context = this.context
        if (this.__isHidden() || !context) return
        const centerX = this.rotationCenterX()
        const centerY = this.rotationCenterY()
        const verticalFlipRotate = this.verticalFlip() ? -1 : 1
        const horizontalFlipRotate = this.horizontalFlip() ? -1 : 1

        this.beginPath()
        context.save()
        // need to clip child before restore if its exist
        this.__childClipping?.(this)
        context.translate(centerX, centerY)
        // vertical or horizantal flipping
        context.scale(horizontalFlipRotate, verticalFlipRotate)
        context.rotate(
            this.__rotation() * verticalFlipRotate * horizontalFlipRotate
        )
        context.translate(-centerX, -centerY)
        this.#contextFilter()
        this.#applyContexttStyles(context)
        this.draw()
        context.restore()
    }

    #applyContexttStyles(context: OffscreenCanvasRenderingContext2D) {
        context.save()
        context.translate(this.x(), this.y())
        if (this.getOptionCurrent('globalAlpha') !== undefined)
            this.globalAlpha()
        if (this.getOptionCurrent('globalCompositeOperation') !== undefined)
            this.globalCompositeOperation()

        if (this.getOptionCurrent('blur') !== undefined) this.blur()
        if (this.getOptionCurrent('brightness') !== undefined) this.brightness()
        if (this.getOptionCurrent('contrast') !== undefined) this.contrast()
        if (this.getOptionCurrent('dropShadow') !== undefined) this.dropShadow()
        if (this.getOptionCurrent('grayscale') !== undefined) this.grayscale()
        if (this.getOptionCurrent('hueRotate') !== undefined) this.hueRotate()
        if (this.getOptionCurrent('saturate') !== undefined) this.saturate()
        if (this.getOptionCurrent('sepia') !== undefined) this.sepia()

        if (this.getOptionCurrent('conicGradient') !== undefined)
            this.conicGradient()
        if (this.getOptionCurrent('radialGradient') !== undefined)
            this.radialGradient()
        if (this.getOptionCurrent('linearGradient') !== undefined)
            this.linearGradient()
        if (this.getOptionCurrent('colorStops') !== undefined) this.colorStops()
        if (this.getOptionCurrent('pattern') !== undefined) this.pattern()

        if (this.getOptionCurrent('shadowBlur') !== undefined) this.shadowBlur()
        if (this.getOptionCurrent('shadowColor') !== undefined)
            this.shadowColor()
        if (this.getOptionCurrent('shadowOffsetX') !== undefined)
            this.shadowOffsetX()
        if (this.getOptionCurrent('shadowOffsetY') !== undefined)
            this.shadowOffsetY()
        if (this.getOptionCurrent('fillStyle') !== undefined) this.fillStyle()

        if (this.getOptionCurrent('lineWidth') !== undefined) this.lineWidth()
        if (this.getOptionCurrent('lineCap') !== undefined) this.lineCap()
        if (this.getOptionCurrent('lineJoin') !== undefined) this.lineJoin()
        if (this.getOptionCurrent('miterLimit') !== undefined) this.miterLimit()
        if (this.getOptionCurrent('lineDash') !== undefined) this.lineDash()
        if (this.getOptionCurrent('lineDashOffset') !== undefined)
            this.lineDashOffset()
        if (this.getOptionCurrent('strokeStyle') !== undefined)
            this.strokeStyle()

        if (this.getOptionCurrent('imageSmoothingEnabled') !== undefined)
            this.imageSmoothingEnabled()
        if (this.getOptionCurrent('imageSmoothingQuality') !== undefined)
            this.imageSmoothingQuality()

        if (this.getOptionCurrent('font') !== undefined) this.font()
        if (this.getOptionCurrent('fontStretch') !== undefined)
            this.fontStretch()
        if (this.getOptionCurrent('fontKerning') !== undefined)
            this.fontKerning()
        if (this.getOptionCurrent('fontVariantCaps') !== undefined)
            this.fontVariantCaps()
        if (this.getOptionCurrent('wordSpacing') !== undefined)
            this.wordSpacing()
        if (this.getOptionCurrent('direction') !== undefined) this.direction()
        if (this.getOptionCurrent('textAlign') !== undefined) this.textAlign()
        if (this.getOptionCurrent('textBaseline') !== undefined)
            this.textBaseline()
        if (this.getOptionCurrent('textRendering') !== undefined)
            this.textRendering()
        if (this.getOptionCurrent('letterSpacing') !== undefined)
            this.letterSpacing()

        if (this.getOptionCurrent('moveTo') !== undefined) this.moveTo()
        if (this.getOptionCurrent('lineTo') !== undefined) this.lineTo()
        if (this.getOptionCurrent('quadraticCurveTo') !== undefined)
            this.quadraticCurveTo()
        if (this.getOptionCurrent('bezierCurveTo') !== undefined)
            this.bezierCurveTo()
        if (this.getOptionCurrent('arc') !== undefined) this.arc()
        if (this.getOptionCurrent('arcTo') !== undefined) this.arcTo()
        if (this.getOptionCurrent('ellipse') !== undefined) this.ellipse()
        if (this.getOptionCurrent('rect') !== undefined) this.rect()
        if (this.getOptionCurrent('roundRect') !== undefined) this.roundRect()
        if (this.getOptionCurrent('fillRect') !== undefined) this.fillRect()
        if (this.getOptionCurrent('strokeRect') !== undefined) this.strokeRect()

        if (this.getOptionCurrent('fillText') !== undefined) this.fillText()
        if (this.getOptionCurrent('strokeText') !== undefined) this.strokeText()
        if (this.getOptionCurrent('drawImage') !== undefined) this.drawImage()

        if (this.getOptionCurrent('clip') !== undefined) this.clip()

        if (this.getOptionCurrent('fill') !== undefined) this.fill()
        if (this.getOptionCurrent('stroke') !== undefined) this.stroke()
        context.restore()
    }

    draw(_func?: DrawFunc) {
        if (_func !== undefined)
            requireCallback(
                `${this.constructor.name}.draw()`,
                'callback',
                _func
            )
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
        const context = block.context
        if (!opt || !context) return
        const fillRule = opt.fillRule || 'nonzero'
        if (opt.path) block.context?.clip(opt.path, fillRule)
        else block.context?.clip(fillRule)
    }
    #fill(block: ShapeBlock, opt?: Fill) {
        const context = block.context
        if (!opt || !opt.fill || !context) return
        const fillRule = (opt.fillRule || 'nonzero') as CanvasFillRule
        if (opt.path) context.fill(opt.path, fillRule)
        else context.fill(fillRule)
    }
    #fillStyle(block: ShapeBlock, opt?: FillStyle) {
        const context = block.context
        if (!context || !opt) return
        context.fillStyle = block.#gradient || block.#canvasPattern || opt
    }

    #conicGradient(block: ShapeBlock, opt?: ConicGradient) {
        if (!opt) return
        block.#gradient = block.context?.createConicGradient(
            opt.angle,
            opt.x,
            opt.y
        )
    }
    #radialGradient(block: ShapeBlock, opt?: RadialGradient) {
        if (!opt) return
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
        if (!opt) return
        block.#gradient = block.context?.createLinearGradient(
            opt.x0,
            opt.y0,
            opt.x1,
            opt.y1
        )
    }
    #colorStops(block: ShapeBlock, opt?: GradientStops[]) {
        if (!opt) return
        for (const stop of opt) {
            block.#gradient?.addColorStop(stop.stop, stop.color)
            stop.gradient?.addColorStop(stop.stop, stop.color)
        }
    }
    #stroke(block: ShapeBlock, opt?: Stroke) {
        const context = block.context
        if (!opt || !opt.stroke || !context) return
        if (opt.path) context.stroke(opt.path)
        else context.stroke()
    }
    #strokeStyle(block: ShapeBlock, opt?: StrokeStyle) {
        const context = block.context
        if (!context || !opt) return
        context.strokeStyle = block.#gradient || block.#canvasPattern || opt
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
        if (opt) block.context?.fillRect(opt.x, opt.y, opt.width, opt.height)
    }
    #rect(block: ShapeBlock, opt?: RectOpt) {
        if (opt) block.context?.rect(opt.x, opt.y, opt.width, opt.height)
    }
    #roundRect(block: ShapeBlock, opt?: RoundRectOpt) {
        if (opt) block.context?.roundRect(opt.x, opt.y, opt.width, opt.height)
    }
    #strokeRect(block: ShapeBlock, opt?: RectOpt) {
        if (opt) block.context?.strokeRect(opt.x, opt.y, opt.width, opt.height)
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
        if (opt) block.context?.moveTo(opt.x, opt.y)
    }
    #lineJoin(block: ShapeBlock, opt?: CanvasLineJoin) {
        if (block.context && opt) block.context.lineJoin = opt
    }
    pointInPath(point: PointInPath): boolean {
        if (
            !isRecord(point) ||
            typeof point.x !== 'number' ||
            typeof point.y !== 'number'
        )
            invalidArgument(
                `${this.constructor.name}.pointInPath()`,
                'point',
                'a point with numeric x and y',
                point
            )
        if (point.path)
            return (
                this.context?.isPointInPath(
                    point.path,
                    point.x,
                    point.y,
                    point.fillRule || 'nonzero'
                ) || false
            )
        return (
            this.context?.isPointInPath(
                point.x,
                point.y,
                point.fillRule || 'nonzero'
            ) || false
        )
    }
    pointInStroke(point: PointInStroke): boolean | undefined {
        if (
            !isRecord(point) ||
            typeof point.x !== 'number' ||
            typeof point.y !== 'number'
        )
            invalidArgument(
                `${this.constructor.name}.pointInStroke()`,
                'point',
                'a point with numeric x and y',
                point
            )
        if (point.path)
            return (
                this.context?.isPointInStroke(point.path, point.x, point.y) ||
                false
            )
        return this.context?.isPointInStroke(point.x, point.y) || false
    }

    #font(block: ShapeBlock, opt?: TextType) {
        if (block.context && opt) block.context.font = opt
    }

    #fillText(block: ShapeBlock, opt?: DrawText) {
        if (!opt) return
        if (opt.maxWidth)
            block.context?.fillText(opt.text, opt.x, opt.y, opt.maxWidth)
        else block.context?.fillText(opt.text, opt.x, opt.y)
    }

    #strokeText(block: ShapeBlock, opt?: DrawText) {
        if (!opt) return
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
        if (typeof text !== 'string')
            invalidArgument(
                `${this.constructor.name}.measureText()`,
                'text',
                'a string',
                text
            )
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
        filter: keyof ShapeFilters,
        value: string | number | number[] | DropShadow
    ) {
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
                    if (typeof i === 'string') _s += i
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

    #blur(block: ShapeBlock, opt?: RelativeType | RelativeType[]) {
        if (!opt) return
        if (opt instanceof Array)
            for (const val of opt) block.#filterHandler('blur', val)
        else block.#filterHandler('blur', opt)
    }
    #brightness(block: ShapeBlock, opt?: RelativeType | RelativeType[]) {
        if (!opt) return
        if (opt instanceof Array)
            for (const val of opt) block.#filterHandler('brightness', val)
        else block.#filterHandler('brightness', opt)
    }
    #contrast(block: ShapeBlock, opt?: RelativeType | RelativeType[]) {
        if (!opt) return
        if (opt instanceof Array)
            for (const val of opt) block.#filterHandler('contrast', val)
        else block.#filterHandler('contrast', opt)
    }
    #dropShadow(block: ShapeBlock, opt?: DropShadow | DropShadow[]) {
        if (!opt) return
        if (opt[0] instanceof Array)
            for (const val of opt as DropShadow[])
                block.#filterHandler('drop-shadow', val)
        else block.#filterHandler('drop-shadow', opt as DropShadow)
    }
    #grayscale(block: ShapeBlock, opt?: RelativeType | RelativeType[]) {
        if (!opt) return
        if (opt instanceof Array)
            for (const val of opt) block.#filterHandler('grayscale', val)
        else block.#filterHandler('grayscale', opt)
    }
    #hueRotate(block: ShapeBlock, opt?: RelativeType | RelativeType[]) {
        if (!opt) return
        if (opt instanceof Array)
            for (const val of opt) block.#filterHandler('hue-rotate', val)
        else block.#filterHandler('hue-rotate', opt)
    }
    #saturate(block: ShapeBlock, opt?: RelativeType | RelativeType[]) {
        if (!opt) return
        if (opt instanceof Array)
            for (const val of opt) block.#filterHandler('saturate', val)
        else block.#filterHandler('saturate', opt)
    }
    #sepia(block: ShapeBlock, opt?: RelativeType | RelativeType[]) {
        if (!opt) return
        if (opt instanceof Array)
            for (const val of opt) block.#filterHandler('sepia', val)
        else block.#filterHandler('sepia', opt)
    }
    #drawImage(block: ShapeBlock, opt?: DrawImage) {
        if (opt && opt.source)
            block.context?.drawImage(
                opt.source,
                opt.clipX,
                opt.clipY,
                opt.clipWidth,
                opt.clipHeight,
                opt.x,
                opt.y,
                opt.width,
                opt.height
            )
    }
    #pattern(block: ShapeBlock, opt?: Pattern) {
        if (opt)
            block.#canvasPattern = block.context?.createPattern(
                opt.image,
                opt.repetition
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

export interface ShapeBlock extends Omit<
    OwnOptionAccessors<ShapeBlockOptions, BlockOptions>,
    'pointInPath' | 'pointInStroke'
> {}
