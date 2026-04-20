import { Block, RelativeType } from './Block'
import type { IBlock, XY } from './types'

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

export type DrawFunc = (context: CanvasRenderingContext2D) => void

export type DropShadow = [RelativeType, RelativeType, RelativeType, FillStyle][]

export interface IShapeOptions {
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
    font?: Font;
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
export class ShapeBlock<T> extends Block<T | IShapeOptions> {
    #gradient?: CanvasGradient
    #pattern?: CanvasPattern | null
    #filters: ShapeFilters = {}
    #filterStr?: string

    constructor(options: IBlock<IShapeOptions>) {
        super(options)
    }
    render(): void {
        this.__childClipping?.(this)
        this.__childAdjustment?.(this)

        this.position()

        this.__clippingPath()
        this.__adjustChildBlocks()

        if (this.__isHidden) return

        this.beginPath()
        this.context?.save()
        this.context?.translate(this.rotationCenterX(), this.rotationCenterY())
        this.context?.rotate(this.rotate())
        // @TODO: add features for vertical or horizantal flipping
        // this.context?.setTransform(
        //     this.__isHorizontalFlipped ? -1 : 1,
        //     0,
        //     0,
        //     this.__isVerticalFlipped ? -1 : 1,
        //     !this.__isHorizontalFlipped ? this.rotationCenterX() : 0,
        //     !this.__isVerticalFlipped ? this.rotationCenterY() : 0
        // );

        this.context?.translate(
            -this.rotationCenterX(),
            -this.rotationCenterY()
        )
        this.#contextFilter()
        if (this.ownOptions.lineDash !== undefined) this.lineDash()
        if (this.ownOptions.lineWidth !== undefined) this.lineWidth()
        if (this.ownOptions.lineCap !== undefined) this.lineCap()
        if (this.ownOptions.shadowBlur !== undefined) this.shadowBlur()
        if (this.ownOptions.shadowColor !== undefined) this.shadowColor()
        if (this.ownOptions.fillStyle !== undefined) this.fillStyle()
        if (this.ownOptions.fillRect !== undefined) this.fillRect()
        if (this.ownOptions.rect !== undefined) this.rect()
        if (this.ownOptions.imageSmoothingEnabled !== undefined)
            this.imageSmoothingEnabled()
        if (this.ownOptions.imageSmoothingQuality !== undefined)
            this.imageSmoothingQuality()
        if (this.ownOptions.strokeStyle !== undefined) this.strokeStyle()
        if (this.ownOptions.clip !== undefined) this.clip()

        this.draw()

        if (this.ownOptions.fill) this.fill()
        if (this.ownOptions.stroke) this.stroke()
        this.context?.restore()

        this.__isSelected()
        this.onRender()?.()
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
    clip(opt?: Clip) {
        const cords = this.__valueHandler<Clip, Clip | undefined>(
            opt,
            'clip',
            undefined
        )
        if (cords) {
            const fillRule = cords.fillRule || 'nonzero'
            if (cords.path) this.context?.clip(cords.path, fillRule)
            else this.context?.clip(fillRule)
        }
        return cords
    }
    fill(opt?: Fill) {
        const fill = this.__valueHandler<Fill, Fill | undefined>(
            opt,
            'fill',
            undefined
        )
        if (fill && fill.fill) {
            const fillRule = (fill.fillRule || 'nonzero') as CanvasFillRule
            if (fill.path) this.context?.fill(fill.path, fillRule)
            else this.context?.fill(fillRule)
        }
        return fill
    }
    fillStyle(opt?: FillStyle) {
        const fillStyle = this.__valueHandler(opt, 'fillStyle', undefined)
        if (this.context && fillStyle)
            this.context.fillStyle =
                this.#gradient || this.#pattern || fillStyle
        return fillStyle
    }

    conicGradient(opt?: ConicGradient) {
        const cords = this.__valueHandler<
            ConicGradient,
            ConicGradient | undefined
        >(opt, 'conicGradient', undefined)
        if (cords)
            this.#gradient = this.context?.createConicGradient(
                cords.angle,
                cords.x,
                cords.y
            )
        return cords
    }
    radialGradient(opt?: RadialGradient) {
        const cords = this.__valueHandler<
            RadialGradient,
            RadialGradient | undefined
        >(opt, 'radialGradient', undefined)
        if (cords)
            this.#gradient = this.context?.createRadialGradient(
                cords.x0,
                cords.y0,
                cords.r0,
                cords.x1,
                cords.y1,
                cords.r1
            )
        return cords
    }
    linearGradient(opt?: LinearGradient) {
        const cords = this.__valueHandler<
            LinearGradient,
            LinearGradient | undefined
        >(opt, 'linearGradient', undefined)
        if (cords)
            this.#gradient = this.context?.createLinearGradient(
                cords.x0,
                cords.y0,
                cords.x1,
                cords.y1
            )
        return cords
    }
    colorStops(opt?: GradientStops[]) {
        const stops = this.__valueHandler<
            GradientStops[],
            GradientStops[] | undefined
        >(opt, 'colorStops', undefined)
        if (stops) {
            for (let stop of stops) {
                this.#gradient?.addColorStop(stop.stop, stop.color)
                stop.gradient?.addColorStop(stop.stop, stop.color)
            }
        }
        return stops
    }
    stroke(opt?: Stroke) {
        const stroke = this.__valueHandler<Stroke, Stroke | undefined>(
            opt,
            'stroke',
            undefined
        )
        if (stroke && stroke.stroke) {
            if (stroke.path) this.context?.stroke(stroke.path)
            else this.context?.stroke()
        }
        return stroke
    }
    strokeStyle(opt?: StrokeStyle) {
        const strokeStyle = this.__valueHandler(opt, 'strokeStyle', undefined)
        if (this.context && strokeStyle)
            this.context.strokeStyle =
                this.#gradient || this.#pattern || strokeStyle
        return strokeStyle
    }
    lineCap(opt?: CanvasLineCap) {
        const lineCap = this.__valueHandler(opt, 'lineCap', undefined)
        if (this.context && lineCap) this.context.lineCap = lineCap
        return lineCap
    }
    lineWidth(opt?: RelativeType) {
        const lineWidth = this.__valueHandler(opt, 'lineWidth', undefined)
        if (this.context && lineWidth !== undefined)
            this.context.lineWidth = lineWidth
        return lineWidth
    }
    shadowBlur(opt?: RelativeType) {
        const shadowBlur = this.__valueHandler(opt, 'shadowBlur', undefined)
        if (this.context && shadowBlur !== undefined)
            this.context.shadowBlur = shadowBlur
        return shadowBlur
    }
    shadowColor(opt?: string) {
        const shadowColor = this.__valueHandler(opt, 'shadowColor', undefined)
        if (this.context && shadowColor) this.context.shadowColor = shadowColor
        return shadowColor
    }
    shadowOffsetX(opt?: RelativeType) {
        const shadowOffsetX = this.__valueHandler(opt, 'shadowOffsetX', 0)
        if (this.context && shadowOffsetX !== undefined)
            this.context.shadowOffsetX = shadowOffsetX
        return shadowOffsetX
    }
    shadowOffsetY(opt?: RelativeType) {
        const shadowOffsetY = this.__valueHandler(opt, 'shadowOffsetY', 0)
        if (this.context && shadowOffsetY !== undefined)
            this.context.shadowOffsetY = shadowOffsetY
        return shadowOffsetY
    }
    lineDash(opt?: LineDash) {
        const lineDash = this.__valueHandler(opt, 'lineDash', undefined)
        if (lineDash) this.context?.setLineDash(lineDash)
        return lineDash
    }
    lineDashOffset(opt?: CanvasPathDrawingStyles['lineDashOffset']) {
        const lineDash = this.__valueHandler(opt, 'lineDash', undefined)
        if (this.context && lineDash !== undefined)
            this.context.lineDashOffset = lineDash
        return lineDash
    }
    lineTo(opt?: XY) {
        const cords = this.__valueHandler<XY, XY | undefined>(
            opt,
            'lineTo',
            undefined
        )
        if (cords) this.context?.lineTo(cords.x, cords.y)
        return cords
    }
    quadraticCurveTo(opt?: QuadraticCurveToOpt) {
        const cords = this.__valueHandler<
            QuadraticCurveToOpt,
            QuadraticCurveToOpt | undefined
        >(opt, 'quadraticCurveTo', undefined)
        if (cords)
            this.context?.quadraticCurveTo(
                cords.cpx1,
                cords.cpy1,
                cords.endX,
                cords.endY
            )
        return cords
    }
    bezierCurveTo(opt?: BezierCurveToOpt) {
        const cords = this.__valueHandler<
            BezierCurveToOpt,
            BezierCurveToOpt | undefined
        >(opt, 'bezierCurveTo', undefined)
        if (cords)
            this.context?.bezierCurveTo(
                cords.cpx1,
                cords.cpy1,
                cords.cpx2,
                cords.cpy2,
                cords.endX,
                cords.endY
            )
        return cords
    }
    fillRect(opt?: RectOpt) {
        const { x, y, width, height } = this.__valueHandler(opt, 'fillRect', {
            x: this.x(),
            y: this.y(),
            width: this.width(),
            height: this.height(),
        })
        this.context?.fillRect(
            this.x() + x,
            this.y() + y,
            this.width() - width,
            this.height() - height
        )
    }
    rect(opt?: RectOpt) {
        const cords = this.__valueHandler<RectOpt, RectOpt | undefined>(
            opt,
            'rect',
            undefined
        )
        if (cords)
            this.context?.rect(
                this.x() + cords.x,
                this.y() + cords.y,
                cords.width,
                cords.height
            )
        return cords
    }
    roundRect(opt?: RoundRectOpt) {
        const cords = this.__valueHandler<
            RoundRectOpt,
            RoundRectOpt | undefined
        >(opt, 'roundRect', undefined)
        if (cords) {
            this.context?.roundRect(
                this.x() + cords.x,
                this.y() + cords.y,
                cords.width,
                cords.height,
                cords.borderRadius
            )
        }
        return cords
    }
    strokeRect(opt?: RectOpt) {
        const cords = this.__valueHandler<RectOpt, RectOpt | undefined>(
            opt,
            'strokeRect',
            undefined
        )
        if (cords) {
            this.context?.strokeRect(
                this.x() + cords.x,
                this.y() + cords.y,
                cords.width,
                cords.height
            )
        }
        return cords
    }

    arc(opt?: Arc) {
        const cords = this.__valueHandler<Arc, Arc | undefined>(
            opt,
            'arc',
            undefined
        )
        if (cords)
            this.context?.arc(
                cords.x,
                cords.y,
                cords.radius,
                cords.startAngle,
                cords.endAngle,
                cords.counterclockwise
            )
        return cords
    }

    arcTo(opt?: ArcTo) {
        const cords = this.__valueHandler<ArcTo, ArcTo | undefined>(
            opt,
            'arcTo',
            undefined
        )
        if (cords)
            this.context?.arcTo(
                cords.x1,
                cords.y1,
                cords.x2,
                cords.y2,
                cords.radius
            )
        return cords
    }

    ellipse(opt?: Ellipse) {
        const cords = this.__valueHandler<Ellipse, Ellipse | undefined>(
            opt,
            'ellipse',
            undefined
        )
        if (cords)
            this.context?.ellipse(
                cords.x,
                cords.y,
                cords.radiusX,
                cords.radiusY,
                cords.rotation,
                cords.startAngle,
                cords.endAngle,
                cords.counterclockwise || false
            )
        return cords
    }

    moveTo(opt?: XY) {
        const cords = this.__valueHandler<XY, XY | undefined>(
            opt,
            'moveTo',
            undefined
        )
        if (cords) this.context?.moveTo(this.x() + cords.x, this.y() + cords.y)
        return cords
    }
    lineJoin(opt?: CanvasLineJoin) {
        const lineJoin = this.__valueHandler(opt, 'lineJoin', undefined)
        if (this.context && lineJoin) this.context.lineJoin = lineJoin
        return lineJoin
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

    font(opt?: Font) {
        const font = this.__valueHandler(opt, 'font', undefined)
        if (this.context && font) this.context.font = font
        return font
    }

    fillText(opt?: DrawText) {
        const cords = this.__valueHandler<DrawText, DrawText | undefined>(
            opt,
            'fillText',
            undefined
        )
        if (cords)
            if (cords.maxWidth)
                this.context?.fillText(
                    cords.text,
                    cords.x,
                    cords.y,
                    cords.maxWidth
                )
            else this.context?.fillText(cords.text, cords.x, cords.y)
        return cords
    }

    strokeText(opt?: DrawText) {
        const cords = this.__valueHandler<DrawText, DrawText | undefined>(
            opt,
            'strokeText',
            undefined
        )
        if (cords)
            if (cords.maxWidth)
                this.context?.strokeText(
                    cords.text,
                    cords.x,
                    cords.y,
                    cords.maxWidth
                )
            else this.context?.strokeText(cords.text, cords.x, cords.y)
        return cords
    }

    fontStretch(opt?: CanvasFontStretch) {
        const fontStretch = this.__valueHandler(opt, 'fontStretch', undefined)
        if (this.context && fontStretch) this.context.fontStretch = fontStretch
        return fontStretch
    }

    fontKerning(opt?: CanvasFontKerning) {
        const fontKerning = this.__valueHandler(opt, 'fontKerning', undefined)
        if (this.context && fontKerning) this.context.fontKerning = fontKerning
        return fontKerning
    }

    fontVariantCaps(opt?: CanvasFontVariantCaps) {
        const fontVariantCaps = this.__valueHandler(
            opt,
            'fontVariantCaps',
            undefined
        )
        if (this.context && fontVariantCaps)
            this.context.fontVariantCaps = fontVariantCaps
        return fontVariantCaps
    }

    wordSpacing(opt?: RelativeType) {
        const wordSpacing = this.__valueHandler(opt, 'wordSpacing', undefined)
        if (this.context && wordSpacing !== undefined)
            this.context.wordSpacing = `${wordSpacing}px`
        return wordSpacing
    }

    direction(opt?: CanvasDirection) {
        const direction = this.__valueHandler(opt, 'direction', undefined)
        if (this.context && direction) this.context.direction = direction
        return direction
    }

    letterSpacing(opt?: RelativeType) {
        const letterSpacing = this.__valueHandler(
            opt,
            'letterSpacing',
            undefined
        )
        if (this.context && letterSpacing !== undefined)
            this.context.letterSpacing = `${letterSpacing}px`
        return letterSpacing
    }

    textAlign(opt?: CanvasTextAlign) {
        const textAlign = this.__valueHandler(opt, 'textAlign', 'start')
        if (this.context) this.context.textAlign = textAlign
        return textAlign
    }

    miterLimit(opt?: CanvasPathDrawingStyles['miterLimit']) {
        const miterLimit = this.__valueHandler(opt, 'miterLimit', undefined)
        if (this.context && miterLimit !== undefined)
            this.context.miterLimit = miterLimit
        return miterLimit
    }

    textBaseline(opt?: CanvasTextBaseline) {
        const textBaseline = this.__valueHandler(opt, 'textBaseline', undefined)
        if (this.context && textBaseline)
            this.context.textBaseline = textBaseline
        return textBaseline
    }

    textRendering(opt?: CanvasTextRendering) {
        const textRendering = this.__valueHandler(
            opt,
            'textRendering',
            undefined
        )
        if (this.context && textRendering)
            this.context.textRendering = textRendering
        return textRendering
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

    blur(opt?: RelativeType) {
        const blur = this.__valueHandler(opt, 'blur', undefined)
        this.#filterHandler('blur', blur)
        return blur
    }
    brightness(opt?: RelativeType) {
        const brightness = this.__valueHandler(opt, 'brightness', undefined)
        this.#filterHandler('brightness', brightness)
        return brightness
    }
    contrast(opt?: RelativeType) {
        const contrast = this.__valueHandler(opt, 'contrast', undefined)
        this.#filterHandler('contrast', contrast)
        return contrast
    }
    dropShadow(opt?: DropShadow) {
        const dropShadow = this.__valueHandler(opt, 'dropShadow', undefined)
        this.#filterHandler('drop-shadow', dropShadow)
        return dropShadow
    }
    grayscale(opt?: RelativeType) {
        const grayscale = this.__valueHandler(opt, 'grayscale', undefined)
        this.#filterHandler('grayscale', grayscale)
        return grayscale
    }
    hueRotate(opt?: RelativeType) {
        const hueRotate = this.__valueHandler(opt, 'hueRotate', undefined)
        this.#filterHandler('hue-rotate', hueRotate)
        return hueRotate
    }
    opacity(opt?: RelativeType) {
        const opacity = this.__valueHandler(opt, 'opacity', undefined)
        this.#filterHandler('opacity', opacity)
        return opacity
    }
    saturate(opt?: RelativeType) {
        const saturate = this.__valueHandler(opt, 'saturate', undefined)

        this.#filterHandler('saturate', saturate)
        return saturate
    }
    sepia(opt?: RelativeType) {
        const sepia = this.__valueHandler(opt, 'sepia', undefined)
        this.#filterHandler('sepia', sepia)
        return sepia
    }

    drawImage(opt?: DrawImage) {
        const cords = this.__valueHandler<DrawImage, DrawImage | undefined>(
            opt,
            'drawImage',
            undefined
        )
        if (cords && cords.source)
            this.context?.drawImage(
                cords.source,
                cords.clipX || 0,
                cords.clipY || 0,
                cords.clipWidth || this.width(),
                cords.clipHeight || this.height(),
                cords.x || this.x(),
                cords.y || this.y(),
                cords.width || this.width(),
                cords.height || this.height()
            )
        return cords
    }
    pattern(opt?: Pattern) {
        const pattern = this.__valueHandler(opt, 'pattern', {
            image: undefined,
            repetition: 'repeat',
        })
        if (pattern.image && pattern.repetition)
            this.#pattern = this.context?.createPattern(
                pattern.image,
                pattern.repetition
            )
        return pattern
    }

    imageSmoothingEnabled(opt?: boolean) {
        const enabled = this.__valueHandler(opt, 'smoothing', undefined)
        if (this.context && enabled !== undefined)
            this.context.imageSmoothingEnabled = enabled
        return enabled
    }
    imageSmoothingQuality(opt?: ImageSmoothingQuality) {
        const quality = this.__valueHandler(opt, 'smoothingQuality', undefined)
        if (this.context && quality)
            this.context.imageSmoothingQuality = quality
        return quality
    }

    globalCompositeOperation(opt?: GlobalCompositeOperation) {
        const composite = this.__valueHandler(
            opt,
            'globalCompsiteOperation',
            'source-out'
        )
        if (this.context && composite)
            this.context.globalCompositeOperation = composite
        return composite
    }
    globalAlpha(opt?: number) {
        const alpha = this.__valueHandler(opt, 'globalCompsiteOperation', 1.0)
        if (this.context && alpha) this.context.globalAlpha = alpha
        return alpha
    }
}
