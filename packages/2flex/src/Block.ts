import type { Canvas } from './Canvas'
import { Node, NodeId } from './Node'
import {
    checkInBound,
    fromCm,
    fromEm,
    fromIn,
    fromMm,
    fromPc,
    fromPercentage,
    fromPt,
    fromQ,
    fromRem,
    fromVH,
    fromVW,
    lerp,
    hexToRgba,
    colorToRgba,
    rgbaRepresenter,
    getPrototype,
    rotateCordinates,
    namedColors,
    hslToRgba,
    rgbaToArray,
    clamp,
    chooseBoxCursorInAgle,
    easingHanndler,
} from './Utils'
import { initalXY, initialCorners, intiBoxCords } from './const'
import type {
    CubicBezier,
    IBlock,
    LinearEasing,
    RGBA,
    StepsEasing,
    CustomEvent,
    inOut,
    XY,
} from './types'

export type Easing =
    | 'linear'
    | 'ease'
    | 'ease-in'
    | 'ease-out'
    | 'ease-in-out'
    | 'step-start'
    | 'step-end'
    | LinearEasing
    | CubicBezier
    | StepsEasing

export type Direction = 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'

export type Composite = 'replace' | 'add' | 'accumulate'
export type Delay = number
export type Iterations = number
export type Duration = number
export type IterationStart = number
export type PlaybackRate = number
export type AutoStart = boolean

export type AlignSelf =
    | 'normal'
    | 'auto'
    | 'center'
    | 'start'
    | 'end'
    | 'stertch'
export type JustifySelf =
    | 'normal'
    | 'auto'
    | 'center'
    | 'start'
    | 'end'
    | 'stertch'
    // for rtl, ltr writind mode
    | 'left'
    | 'right'
export type FlexGrow = number
export type FlexShrink = number
export type FlexBasis = RelativeType | 'auto'
export type Flex = [FlexGrow, FlexShrink, FlexBasis]
export type PlaceSelf = AlignSelf & JustifySelf
export type Position = 'relative' | 'absolute' | 'sticky' | 'fixed'

export interface HotCornerArea {
    topLeft: XY
    topRight: XY
    bottomLeft: XY
    bottomRight: XY
}

export type Overflow = 'visible' | 'hidden' | 'scroll' | 'auto'

export type RelativeType = number | string

interface RunningEvents {
    drag: boolean
    rotate: boolean
    resize: boolean
    selected: boolean
}

export type SelfType = 'self' | 'parent'

export type MarginType =
    | [RelativeType, RelativeType, RelativeType, RelativeType]
    | [RelativeType, RelativeType, RelativeType]
    | [RelativeType, RelativeType]
    | [RelativeType]
    | RelativeType

export type PaddingType =
    | [RelativeType, RelativeType, RelativeType, RelativeType]
    | [RelativeType, RelativeType, RelativeType]
    | [RelativeType, RelativeType]
    | [RelativeType]
    | RelativeType

export interface IBlockOptions {
    // @Todo: fix any type issue
    [key: string]: any
    name?: string
    x?: RelativeType
    y?: RelativeType
    width?: RelativeType
    height?: RelativeType
    minWidth?: RelativeType
    minHeight?: RelativeType
    maxWidth?: RelativeType
    maxHeight?: RelativeType
    scale?: RelativeType
    position?: Position
    top?: RelativeType
    bottom?: RelativeType
    left?: RelativeType
    right?: RelativeType
    overflow?: Overflow
    overflowX?: Overflow
    overflowY?: Overflow
    selectable?: boolean
    padding?: PaddingType
    paddingTop?: RelativeType
    paddingRight?: RelativeType
    paddingBottom?: RelativeType
    paddingLeft?: RelativeType
    margin?: MarginType
    marginTop?: RelativeType
    marginRight?: RelativeType
    marginBottom?: RelativeType
    marginLeft?: RelativeType
    zIndex?: number
    draggable?: boolean
    onDrag?: (event: MouseEvent) => void
    draggableX?: boolean
    draggableY?: boolean
    rotate?: number
    onRotate?: (event: MouseEvent) => void
    order?: number
    // alignSelf?: AlignSelf
    // justifySelf?: JustifySelf
    // flexShrink?: FlexShrink
    flexBasis?: FlexBasis
    // flexGrow?: FlexGrow
    // grid-row: grid-row-start / grid-row-end;
    // gridRow?: number[]
    // gridRowStart?: number
    // gridRowEnd?: number
    // grid-column: grid-column-start / grid-column-end
    // gridColumn?: number[]
    // gridColumnStart?: number
    // gridColumnEnd?: number
    // grid-area: grid-row-start / grid-column-start / grid-row-end / grid-column-end | itemname
    // gridArea?: number[]
    hotAreaGap?: number
    hotCornerSize?: number
    hotCornerRadius?: number
    hotCornerStrokeWidth?: number
    hotCornerStrokeColor?: string
    hotCornerBackgroundColor?: string
    hotLineStrokeWidth?: number
    hotLineStrokeColor?: string
    hotLines?: boolean
    rotatableTopLeft?: boolean
    rotatableTopRight?: boolean
    rotatableBottomLeft?: boolean
    rotatableBottomRight?: boolean
    resizableTopLeft?: boolean
    resizableTopRight?: boolean
    resizableBottomLeft?: boolean
    resizableBottomRight?: boolean
    resizableTop?: boolean
    resizableLeft?: boolean
    resizableRight?: boolean
    resizableBottom?: boolean
    horizontalFlipResize?: boolean
    verticalFlipResize?: boolean
    resizable?: boolean
    onResize?: (event: MouseEvent) => void
    hidden?: boolean
    important?: IBlock<any>
    rotationCenterX?: RelativeType
    rotationCenterY?: RelativeType
    rotationCenter?: SelfType
    cornerTopLeft?: XY
    cornerTopRight?: XY
    cornerBottomLeft?: XY
    cornerBottomRight?: XY
    rotatable?: boolean
    hotRotatableAreaTopLeft?: HotCornerArea
    hotRotatableAreaTopRight?: HotCornerArea
    hotRotatableAreaBottomLeft?: HotCornerArea
    hotRotatableAreaBottomRight?: HotCornerArea
    hotResizableAreaTopLeft?: HotCornerArea
    hotResizableAreaTopRight?: HotCornerArea
    hotResizableAreaBottomLeft?: HotCornerArea
    hotResizableAreaBottomRight?: HotCornerArea
    hotResizableAreaTop?: HotCornerArea
    hotResizableAreaRight?: HotCornerArea
    hotResizableAreaLeft?: HotCornerArea
    hotResizableAreaBottom?: HotCornerArea
    onRender?: () => void
}

type BlockOptionKeys<T> = keyof IBlock<T>

export type OptionsMap<T> = Map<keyof IBlock<T>, any>

export interface BlockPayload<T> {
    nodeId: NodeId
    name: string
    options: OptionsMap<T>
    cacheOptions: OptionsMap<T>
    childs: BlockPayload<any>[]
    additionalParams: any[]
}

type BlockEvent = {
    [key: string]: { funcs: CustomEvent<any>[]; identified: string[] }
}

export interface BindOptions {
    bindTo: Block
    options: (keyof IBlockOptions)[]
}

export type IteratableOpts = { [K in keyof IBlockOptions]: IBlockOptions[K][] }

export interface KeyFrame {
    [key: string]: KeyFrame[keyof KeyFrame]
    id?: string
    autoStart?: AutoStart
    iterations?: Iterations
    delay?: Delay
    direction?: Direction
    duration?: Duration
    composite?: Composite
    easing?: Easing
    iterationStart?: IterationStart
    playbackRate?: PlaybackRate
    onFinish?: () => void
}

export type AnimationKeyframe = KeyFrame & IteratableOpts

interface KeyframesConfig {
    currentIdx?: number
    currentVal?: IBlockOptions[keyof IBlockOptions]
    breakPoints?: IteratableOpts
    iterDirection?: number
    invoker?: any
    category: IBlockOptions[keyof IBlockOptions]
}

interface KeyframeIterationConfigs {
    isRunning: boolean
    isFinished: boolean
    isReverse: boolean
    startTime: number
    iter: number
    currentOptIdx: number
    maxKeyframeLen: number
    // need to fix this any type KeyframesConfig
    keyframes?: {}
}
type AnimationId = string
interface KeyframeIterations {
    [key: AnimationId]: KeyframeIterationConfigs &
        Required<{ [K in keyof KeyFrame]-?: KeyFrame[K] }>
}

export type Animator = (timestamp: number) => void
export type CallbackAnimator = (timestamp: number, easing: number) => void

interface OverflowCords extends XY {
    width: number
    height: number
}

export const HOT_LINE_BLOCK_NAME = '__hot_line_hidden'

export const OVERFLOW_SCROLL_BAR_BLOCK_NAME = '__overflow_scroll_bar_hidden'

// these const values should be customizable options
const OVERFLOW_SCROLL_BAR_MIN_SIZE = 15
const OVERFLOW_AREA_GAP = 15
const OVERFLOW_INNER_AREA_GAP = 3
const OVERFLOW_INNER_AREA_SIZE = 10
const OVERFLOW_INNER_AREA_RADIUS = 10

export class Block<T = IBlockOptions> extends Node {
    declare parentNode?: Block
    declare childNodes: Block[]

    canvas?: Canvas
    options: OptionsMap<T>
    cacheOptions: OptionsMap<T>

    __hidden = false
    __bindOptions: BindOptions[]

    __runningEvents: RunningEvents
    __events: BlockEvent

    __overflowCords: OverflowCords

    #keyframeIterations: KeyframeIterations
    __animations: Animator[]

    #lastOrder: number

    __clipPath?: Path2D
    __childClipping?: (b: Block<T>) => void

    __childAdjustment?: (b: Block<T>) => void

    #overflowXscrollBarBlock?: Block<any>
    #overflowYscrollBarBlock?: Block<any>

    #hotLineBlock?: Block<any>
    #hotCornerCords: HotCornerArea

    #isZIndexPredefined: boolean

    #upperMostZIndex: number
    #childsCount: number

    __isHorizontalFlipped: boolean
    __isVerticalFlipped: boolean

    constructor(options: IBlock<T>) {
        super()
        this.options = new Map()
        this.cacheOptions = new Map()
        this.#buildOptions(options)

        this.__bindOptions = []
        this.__runningEvents = {
            drag: false,
            rotate: false,
            resize: false,
            selected: false,
        }
        this.__events = {}

        this.__overflowCords = intiBoxCords

        this.#hotCornerCords = initialCorners
        this.__animations = []
        this.#keyframeIterations = {}

        this.#lastOrder = 0
        this.#isZIndexPredefined = false
        this.#upperMostZIndex = 0
        this.#childsCount = 0
        this.__isHorizontalFlipped = false
        this.__isVerticalFlipped = false
    }

    get context(): CanvasRenderingContext2D | undefined | null {
        return this.canvas?.context
    }

    render() {
        const currentRotate = this.getOptionCurrentVal('rotate') || 0
        const cacheRotate = this.getOptionCacheVal('rotate') || 0
        const diffR = currentRotate - cacheRotate
        this.__updateCordinatesByRot(-cacheRotate)
        this.__hasZIndexChanged()
        this.__childAdjustment?.(this)
        this.__updateCordinates()
        this.__adjustChildBlocks()
        this.__updateCordinatesByRot(cacheRotate + diffR)
        this.__updateOptionsCache()
        this.__clippingPath()

        if (this.__isHidden) return
        this.context?.save()
        // need to clip child before restore if its exist
        this.__childClipping?.(this)
        this.context?.restore()

        this.__isSelected()
        this.__isOverflowAreaVisible()
        this.__findHighestChildZIndex()
        this.onRender()?.()
    }

    __hasZIndexChanged() {
        if (
            this.getOptionCacheVal('zIndex') !==
            this.getOptionCurrentVal('zIndex')
        )
            this.canvas?.refreshHead()
    }

    __updateCordinates() {
        this.__handleMarginChange()
        this.__handlePaddingChange()

        let currentX = this.getOptionCurrentVal('x')
        let currentY = this.getOptionCurrentVal('y')
        const cacheX = this.getOptionCacheVal('x')
        const cacheY = this.getOptionCacheVal('y')

        let currentWidth = this.getOptionCurrentVal('width')
        let currentHeight = this.getOptionCurrentVal('height')
        const cacheWidth = this.getOptionCacheVal('width')
        const cacheHeight = this.getOptionCacheVal('height')

        const minWidth = this.getOptionCurrentVal('minWidth')
        const maxWidth = this.getOptionCurrentVal('maxWidth')
        const minHeight = this.getOptionCurrentVal('minHeight')
        const maxHeight = this.getOptionCurrentVal('maxHeight')

        const rotationCenterX = this.getOptionCurrentVal('rotationCenterX')
        const rotationCenterY = this.getOptionCurrentVal('rotationCenterY')

        const position = this.getOptionCurrentVal('position')
        const top = this.getOptionCurrentVal('top')
        const bottom = this.getOptionCurrentVal('bottom')
        const left = this.getOptionCurrentVal('left')
        const right = this.getOptionCurrentVal('right')

        const cornerTopLeftCache = this.getOptionCacheVal('cornerTopLeft')
        const cornerTopRightCache = this.getOptionCacheVal('cornerTopRight')
        const cornerBottomLeftCache = this.getOptionCacheVal('cornerBottomLeft')
        const cornerBottomRightCache =
            this.getOptionCacheVal('cornerBottomRight')
        let cornerTopLeftCurrent = this.getOptionCurrentVal('cornerTopLeft')
        let cornerTopRightCurrent = this.getOptionCurrentVal('cornerTopRight')
        let cornerBottomLeftCurrent =
            this.getOptionCurrentVal('cornerBottomLeft')
        let cornerBottomRightCurrent =
            this.getOptionCurrentVal('cornerBottomRight')

        const diffScale =
            (this.getOptionCurrentVal('scale') || 0) -
            (this.getOptionCacheVal('scale') || 0)

        const diffPaddingTop =
            this.getOptionCurrentVal('paddingTop') -
            this.getOptionCacheVal('paddingTop')
        const diffPaddingBottom =
            this.getOptionCurrentVal('paddingBottom') -
            this.getOptionCacheVal('paddingBottom')
        const diffPaddingLeft =
            this.getOptionCurrentVal('paddingLeft') -
            this.getOptionCacheVal('paddingLeft')
        const diffPaddingRight =
            this.getOptionCurrentVal('paddingRight') -
            this.getOptionCacheVal('paddingRight')

        if (diffPaddingRight || diffPaddingLeft)
            currentWidth = currentWidth + diffPaddingRight + diffPaddingLeft
        if (diffPaddingTop || diffPaddingBottom)
            currentHeight = currentHeight + diffPaddingTop + diffPaddingBottom

        if (diffScale) {
            currentWidth *= diffScale
            currentHeight *= diffScale
        }

        if (currentWidth < minWidth && !this.horizontalFlipResize())
            currentWidth = minWidth
        else if (currentWidth > maxWidth) currentWidth = maxWidth
        if (currentHeight < minHeight && !this.verticalFlipResize())
            currentHeight = minHeight
        else if (currentHeight > maxHeight) currentHeight = maxHeight

        if (position === 'fixed' || position === 'absolute') {
            if (top !== undefined) currentY = top
            else if (bottom !== undefined)
                currentY =
                    Math.abs((this.canvas?.height || 1) - currentHeight) -
                    bottom
            if (left !== undefined) currentX = left
            else if (right !== undefined)
                currentX =
                    Math.abs((this.canvas?.width || 1) - currentWidth) - right
        } else if (position === 'sticky' && !this.#hasParentBlock) {
            if (top !== undefined && currentY < top) {
                currentY = top
            } else if (
                bottom !== undefined &&
                currentY + currentHeight > (this.canvas?.height || 1) - bottom
            ) {
                currentY =
                    Math.abs((this.canvas?.height || 1) - currentHeight) -
                    bottom
            }
            if (left !== undefined && currentX < left) {
                currentX = left
            } else if (
                right !== undefined &&
                currentX + currentWidth > (this.canvas?.width || 1) - right
            ) {
                currentX =
                    Math.abs((this.canvas?.width || 1) - currentWidth) - right
            }
        } else if (position === 'relative' && !this.#hasParentBlock) {
            if (left !== undefined) currentX = left
            else if (right !== undefined) currentX = -right
            if (top !== undefined) currentY = top
            else if (bottom !== undefined) currentY = -bottom
        }

        const diffX = currentX - cacheX
        const diffY = currentY - cacheY
        const diffW = currentWidth - cacheWidth
        const diffH = currentHeight - cacheHeight
        const dX = diffX + diffW
        const dY = diffY + diffH

        cornerTopLeftCurrent = {
            x: cornerTopLeftCurrent.x + diffX,
            y: cornerTopLeftCurrent.y + diffY,
        }
        cornerTopRightCurrent = {
            x: cornerTopRightCurrent.x + dX,
            y: cornerTopRightCurrent.y + diffY,
        }
        cornerBottomLeftCurrent = {
            x: cornerBottomLeftCurrent.x + diffX,
            y: cornerBottomLeftCurrent.y + dY,
        }
        cornerBottomRightCurrent = {
            x: cornerBottomRightCurrent.x + dX,
            y: cornerBottomRightCurrent.y + dY,
        }
        const diffCornerTopLeft = {
            x: cornerTopLeftCurrent.x - cornerTopLeftCache.x,
            y: cornerTopLeftCurrent.y - cornerTopLeftCache.y,
        }
        const diffCornerTopRight = {
            x: cornerTopRightCurrent.x - cornerTopRightCache.x,
            y: cornerTopRightCurrent.y - cornerTopRightCache.y,
        }
        const diffCornerBottomLeft = {
            x: cornerBottomLeftCurrent.x - cornerBottomLeftCache.x,
            y: cornerBottomLeftCurrent.y - cornerBottomLeftCache.y,
        }
        const diffCornerBottomRight = {
            x: cornerBottomRightCurrent.x - cornerBottomRightCache.x,
            y: cornerBottomRightCurrent.y - cornerBottomRightCache.y,
        }

        const horizontalFlipped = this.__isHorizontalFlipped
        const verticalFlipped = this.__isVerticalFlipped
        if (
            cornerTopLeftCurrent.x > cornerTopRightCurrent.x ||
            cornerBottomLeftCurrent.x > cornerBottomRightCurrent.x
        )
            this.__isHorizontalFlipped = true
        else this.__isHorizontalFlipped = false
        if (
            cornerTopLeftCurrent.y > cornerBottomLeftCurrent.y ||
            cornerTopRightCurrent.y > cornerBottomRightCurrent.y
        )
            this.__isVerticalFlipped = true
        else this.__isVerticalFlipped = false

        if (
            horizontalFlipped !== this.__isHorizontalFlipped ||
            verticalFlipped !== this.__isVerticalFlipped
        ) {
            const hotAreaGap = this.hotAreaGap()
            const topLeftCorner = {
                x: cornerTopLeftCurrent.x - hotAreaGap,
                y: cornerTopLeftCurrent.y - hotAreaGap,
            }
            const topRightCorner = {
                x: cornerTopRightCurrent.x + hotAreaGap,
                y: cornerTopRightCurrent.y - hotAreaGap,
            }
            const bottomLeftCorner = {
                x: cornerBottomLeftCurrent.x - hotAreaGap,
                y: cornerBottomLeftCurrent.y + hotAreaGap,
            }
            const bottomRightCorner = {
                x: cornerBottomRightCurrent.x + hotAreaGap,
                y: cornerBottomRightCurrent.y + hotAreaGap,
            }
            this.#initHotLineArea(
                topLeftCorner,
                topRightCorner,
                bottomLeftCorner,
                bottomRightCorner
            )
        } else {
            this.#updateAreaCords(
                'hotResizableAreaTopLeft',
                diffCornerTopLeft,
                diffCornerTopLeft,
                diffCornerTopLeft,
                diffCornerTopLeft
            )
            this.#updateAreaCords(
                'hotResizableAreaTopRight',
                diffCornerTopRight,
                diffCornerTopRight,
                diffCornerTopRight,
                diffCornerTopRight
            )
            this.#updateAreaCords(
                'hotResizableAreaBottomLeft',
                diffCornerBottomLeft,
                diffCornerBottomLeft,
                diffCornerBottomLeft,
                diffCornerBottomLeft
            )
            this.#updateAreaCords(
                'hotResizableAreaBottomRight',
                diffCornerBottomRight,
                diffCornerBottomRight,
                diffCornerBottomRight,
                diffCornerBottomRight
            )
            if (this.__isHorizontalFlipped) {
                this.#updateAreaCords(
                    'hotResizableAreaTop',
                    diffCornerTopRight,
                    diffCornerTopLeft,
                    diffCornerTopRight,
                    diffCornerTopLeft
                )
                this.#updateAreaCords(
                    'hotResizableAreaBottom',
                    diffCornerBottomRight,
                    diffCornerBottomLeft,
                    diffCornerBottomRight,
                    diffCornerBottomLeft
                )
            } else {
                this.#updateAreaCords(
                    'hotResizableAreaTop',
                    diffCornerTopLeft,
                    diffCornerTopRight,
                    diffCornerTopLeft,
                    diffCornerTopRight
                )
                this.#updateAreaCords(
                    'hotResizableAreaBottom',
                    diffCornerBottomLeft,
                    diffCornerBottomRight,
                    diffCornerBottomLeft,
                    diffCornerBottomRight
                )
            }
            if (this.__isVerticalFlipped) {
                this.#updateAreaCords(
                    'hotResizableAreaLeft',
                    diffCornerBottomLeft,
                    diffCornerBottomLeft,
                    diffCornerTopLeft,
                    diffCornerTopLeft
                )
                this.#updateAreaCords(
                    'hotResizableAreaRight',
                    diffCornerBottomRight,
                    diffCornerBottomRight,
                    diffCornerTopRight,
                    diffCornerTopRight
                )
            } else {
                this.#updateAreaCords(
                    'hotResizableAreaLeft',
                    diffCornerTopLeft,
                    diffCornerTopLeft,
                    diffCornerBottomLeft,
                    diffCornerBottomLeft
                )
                this.#updateAreaCords(
                    'hotResizableAreaRight',
                    diffCornerTopRight,
                    diffCornerTopRight,
                    diffCornerBottomRight,
                    diffCornerBottomRight
                )
            }
            this.#updateAreaCords(
                'hotRotatableAreaTopLeft',
                diffCornerTopLeft,
                diffCornerTopLeft,
                diffCornerTopLeft,
                diffCornerTopLeft
            )
            this.#updateAreaCords(
                'hotRotatableAreaTopRight',
                diffCornerTopRight,
                diffCornerTopRight,
                diffCornerTopRight,
                diffCornerTopRight
            )
            this.#updateAreaCords(
                'hotRotatableAreaBottomLeft',
                diffCornerBottomLeft,
                diffCornerBottomLeft,
                diffCornerBottomLeft,
                diffCornerBottomLeft
            )
            this.#updateAreaCords(
                'hotRotatableAreaBottomRight',
                diffCornerBottomRight,
                diffCornerBottomRight,
                diffCornerBottomRight,
                diffCornerBottomRight
            )
        }
        this.setOptionCurrentVal(
            'rotationCenterX',
            rotationCenterX + diffX + diffW / 2
        )
        this.setOptionCurrentVal(
            'rotationCenterY',
            rotationCenterY + diffY + diffH / 2
        )
        this.#hotCornerCords = {
            topLeft: cornerTopLeftCurrent,
            topRight: cornerTopRightCurrent,
            bottomLeft: cornerBottomLeftCurrent,
            bottomRight: cornerBottomRightCurrent,
        }
        this.setOptionCurrentVal('x', currentX)
        this.setOptionCurrentVal('y', currentY)
        this.setOptionCurrentVal('width', currentWidth)
        this.setOptionCurrentVal('height', currentHeight)
        this.setOptionCurrentVal('cornerTopLeft', cornerTopLeftCurrent)
        this.setOptionCurrentVal('cornerTopRight', cornerTopRightCurrent)
        this.setOptionCurrentVal('cornerBottomLeft', cornerBottomLeftCurrent)
        this.setOptionCurrentVal('cornerBottomRight', cornerBottomRightCurrent)
    }
    __updateOptionsCache() {
        const options = this.options
        const cacheOptions = this.cacheOptions
        for (const [key, value] of options) {
            cacheOptions.set(key, value)
        }
    }
    #buildOptions(options: IBlock<T>) {
        const ownOptions = this.options
        for (const [key, value] of Object.entries(options)) {
            ownOptions.set(key, value)
        }
    }
    __handleMarginChange() {
        const currentMargin = this.getOptionCurrentVal('margin') as MarginType
        const cacheMargin = this.getOptionCacheVal('margin') as MarginType
        if (currentMargin instanceof Array && cacheMargin instanceof Array) {
            if (
                currentMargin[0] !== cacheMargin[0] ||
                currentMargin[1] !== cacheMargin[1] ||
                currentMargin[2] !== cacheMargin[2] ||
                currentMargin[3] !== cacheMargin[3]
            )
                this.#parseMargin(currentMargin)
        } else if (currentMargin !== cacheMargin)
            this.#parseMargin(currentMargin)
    }
    #parseMargin(margin: MarginType) {
        if (typeof margin === 'number') {
            this.marginTop(margin)
            this.marginBottom(margin)
            this.marginLeft(margin)
            this.marginRight(margin)
            return margin
        }
        if (margin[0] !== undefined) this.marginTop(margin[0])
        switch (margin.length) {
            case 1:
                if (margin[0] !== undefined) {
                    this.marginBottom(margin[0])
                    this.marginLeft(margin[0])
                    this.marginRight(margin[0])
                }
                break
            case 2:
                if (margin[0] !== undefined) this.marginBottom(margin[0])
                if (margin[1] !== undefined) {
                    this.marginLeft(margin[1])
                    this.marginRight(margin[1])
                }
                break
            case 3:
                if (margin[1] !== undefined) {
                    this.marginLeft(margin[1])
                    this.marginRight(margin[1])
                }
                if (margin[2] !== undefined) this.marginBottom(margin[2])
                break
            case 4:
                if (margin[1] !== undefined) this.marginRight(margin[1])
                if (margin[2] !== undefined) this.marginBottom(margin[2])
                if (margin[3] !== undefined) this.marginLeft(margin[3])
                break
        }
    }
    __handlePaddingChange() {
        const currentPadding = this.getOptionCurrentVal(
            'padding'
        ) as PaddingType
        const cachePadding = this.getOptionCacheVal('padding') as PaddingType
        if (currentPadding instanceof Array && cachePadding instanceof Array) {
            if (
                currentPadding[0] !== cachePadding[0] ||
                currentPadding[1] !== cachePadding[1] ||
                currentPadding[2] !== cachePadding[2] ||
                currentPadding[3] !== cachePadding[3]
            )
                this.#parsePadding(currentPadding)
        } else if (currentPadding !== cachePadding)
            this.#parsePadding(currentPadding)
    }
    #parsePadding(padding: PaddingType) {
        if (typeof padding === 'number') {
            this.paddingTop(padding)
            this.paddingBottom(padding)
            this.paddingLeft(padding)
            this.paddingRight(padding)
            return padding
        }
        this.paddingTop(padding[0] || 0)
        switch (padding.length) {
            case 1:
                this.paddingBottom(padding[0])
                this.paddingLeft(padding[0])
                this.paddingRight(padding[0])
                break
            case 2:
                this.paddingBottom(padding[0])
                this.paddingLeft(padding[1])
                this.paddingRight(padding[1])
                break
            case 3:
                this.paddingLeft(padding[1])
                this.paddingRight(padding[1])
                this.paddingBottom(padding[2])
                break
            case 4:
                this.paddingRight(padding[1])
                this.paddingBottom(padding[2])
                this.paddingLeft(padding[3])
                break
        }
    }

    getOptionCacheVal(key: string) {
        return this.cacheOptions.get(key)
    }
    getOptionCurrentVal(key: BlockOptionKeys<T>) {
        return this.options.get(key)
    }
    setOptionCacheVal(key: BlockOptionKeys<T>, value: any) {
        this.cacheOptions.set(key, value)
    }
    setOptionCurrentVal(key: BlockOptionKeys<T>, value: any) {
        this.options.set(key, value)
    }
    name(opt?: string) {
        return this.__cacheOption(opt, 'name', undefined)
    }
    onRender(opt?: () => void) {
        const renderFunc = this.__valueHandler<
            () => void,
            (() => void) | undefined
        >(opt, 'onRender', undefined)

        return renderFunc
    }
    __isSelected() {
        if (this.__runningEvents.selected) {
            if (this.hotLines()) {
                if (this.ImFirst) this.__buildHotLines()
                else this.__runningEvents.selected = false
            } else {
                if (this.#hotLineBlock) this.removeChild(this.#hotLineBlock)
                this.#hotLineBlock = undefined
            }
        }
    }

    __isOverflowAreaVisible() {
        if (this.__isOverflowXScroll || this.__isOverflowXAuto)
            this.__overflowXScrollBar()
        else {
            if (this.#overflowXscrollBarBlock)
                this.removeChild(this.#overflowXscrollBarBlock)
            this.#overflowXscrollBarBlock = undefined
        }

        if (this.__isOverflowYScroll || this.__isOverflowYAuto)
            this.__overflowYScrollBar()
        else {
            if (this.#overflowYscrollBarBlock)
                this.removeChild(this.#overflowYscrollBarBlock)
            this.#overflowYscrollBarBlock = undefined
        }
    }
    __overflowXScrollBar() {
        if (!this.#overflowXscrollBarBlock) {
            // Intilizating overflow block and its realted cordinates
            this.#overflowXscrollBarBlock = new Block({
                name: OVERFLOW_SCROLL_BAR_BLOCK_NAME,
                width: this.width(),
                height: OVERFLOW_AREA_GAP,
                position: 'fixed',
                left: this.x(),
                top: this.height() - OVERFLOW_AREA_GAP,
                selectable: true,
                // Showing overflow scroll bar block on top of the child blocks
                zIndex: 1 + this.#upperMostZIndex,
                rotationCenterX: this.rotationCenterX(),
                rotationCenterY: this.rotationCenterY(),
                rotate: this.rotate(),
                hotLines: false,
            })
            // moving overflow scrollbar
            let initCords = { x: 0, y: 0 }
            let beforeCords = { x: 0, y: 0 }
            const mousedown = (event: MouseEvent) => {
                const cornerTopLeft =
                    this.#overflowXscrollBarBlock?.cornerTopLeft()!
                const cornerTopRight =
                    this.#overflowXscrollBarBlock?.cornerTopRight()!
                const cornerBottomLeft =
                    this.#overflowXscrollBarBlock?.cornerBottomLeft()!
                const cornerBottomRight =
                    this.#overflowXscrollBarBlock?.cornerBottomRight()!
                initCords =
                    this.#overflowXscrollBarBlock?.canvas?.getCursorPosition(
                        event
                    )!
                if (
                    checkInBound(
                        initCords.x,
                        initCords.y,
                        cornerTopLeft.x,
                        cornerTopLeft.y,
                        cornerTopRight.x,
                        cornerTopRight.y,
                        cornerBottomLeft.x,
                        cornerBottomLeft.y,
                        cornerBottomRight.x,
                        cornerBottomRight.y
                    ) &&
                    !(this.__isOverflowXAuto && this.__overflowCords.width > 0)
                ) {
                    beforeCords = { x: 0, y: 0 }
                    this.#overflowXscrollBarBlock!.__runningEvents.drag = true
                    this.#overflowXscrollBarBlock!.registerZIndex({
                        in: this.#overflowXscrollBarBlock?.zIndex(),
                    })
                    this.__runningEvents.resize = false
                    this.__runningEvents.drag = false
                    this.__runningEvents.rotate = false
                } else
                    this.#overflowXscrollBarBlock!.registerZIndex({
                        out: this.#overflowXscrollBarBlock?.zIndex(),
                    })
            }

            const mousemove = (event: MouseEvent) => {
                const { x, y } =
                    this.#overflowXscrollBarBlock!.canvas?.getCursorPosition(
                        event
                    )!
                const cornerTopLeft =
                    this.#overflowXscrollBarBlock?.cornerTopLeft()!
                const cornerTopRight =
                    this.#overflowXscrollBarBlock?.cornerTopRight()!
                const cornerBottomLeft =
                    this.#overflowXscrollBarBlock?.cornerBottomLeft()!
                const cornerBottomRight =
                    this.#overflowXscrollBarBlock?.cornerBottomRight()!
                // checking cursor cause resize area overlaps with the overflow area
                if (
                    !this.#overflowXscrollBarBlock?.__runningEvents.drag &&
                    checkInBound(
                        x,
                        y,
                        cornerTopLeft.x,
                        cornerTopLeft.y,
                        cornerTopRight.x,
                        cornerTopRight.y,
                        cornerBottomLeft.x,
                        cornerBottomLeft.y,
                        cornerBottomRight.x,
                        cornerBottomRight.y
                    ) &&
                    !(this.__isOverflowXAuto && this.__overflowCords.width > 0)
                ) {
                    this.canvas?.changeCursor('auto')
                }

                if (
                    this.#overflowXscrollBarBlock?.__runningEvents.drag &&
                    this.__isOverflowXScrollable
                ) {
                    this.#overflowXscrollBarBlock?.registerZIndex({
                        in: this.#overflowXscrollBarBlock?.zIndex(),
                    })
                    if (this.#overflowXscrollBarBlock?.ImFirst) {
                        let diffX = x - initCords.x
                        let diffY = y - initCords.y

                        if (diffX !== 0 || diffY !== 0) {
                            const dxX = diffX - beforeCords.x
                            const dxY = diffY - beforeCords.y
                            const angle = this.__getRealRotate

                            const horizontalFlipped = this.__isHorizontalFlipped
                            const verticalFlipped = this.__isVerticalFlipped
                            let inverse = 1
                            if (
                                (horizontalFlipped || verticalFlipped) &&
                                horizontalFlipped !== verticalFlipped
                            )
                                inverse = -1

                            this.__overflowTranslateX(
                                -(
                                    Math.cos(angle) * inverse * dxX +
                                    Math.sin(angle) * inverse * dxY
                                ) * inverse
                            )
                            beforeCords.x = diffX
                            beforeCords.y = diffY
                            this.#overflowXscrollBarBlock?.invokeChange()
                        }
                    }
                }
            }
            const mouseup = () => {
                if (this.#overflowXscrollBarBlock!.__runningEvents.drag) {
                    this.#overflowXscrollBarBlock!.__runningEvents.drag = false
                    this.#overflowXscrollBarBlock?.registerZIndex({
                        out: this.#overflowXscrollBarBlock?.zIndex(),
                    })
                    this.#overflowXscrollBarBlock?.invokeChange()
                }
            }
            this.#overflowXscrollBarBlock.eventHandler<MouseEvent>(
                'mousedown',
                mousedown,
                'overflowMouseDown'
            )

            this.#overflowXscrollBarBlock.eventHandler<MouseEvent>(
                'mousemove',
                mousemove,
                'overflowMouseMove'
            )
            this.#overflowXscrollBarBlock.eventHandler<MouseEvent>(
                'mouseup',
                mouseup,
                'overflowMouseUp'
            )
            this.#overflowXscrollBarBlock.onRender(() => {
                if (
                    (this.__isOverflowXAuto &&
                        this.__overflowCords.width > 0) ||
                    !this.#overflowXscrollBarBlock
                )
                    return

                const width = Math.abs(this.width())
                const areaWidth = clamp(
                    Math.abs(width) + this.__overflowCords.width,
                    OVERFLOW_SCROLL_BAR_MIN_SIZE,
                    Math.abs(width)
                )
                const currentWidth = width + this.__overflowCords.width

                //  while inner scroll bar in minimum width need to calculate correct cordiantes
                let xPer = 1
                if (currentWidth < 0) {
                    xPer = this.__overflowCords.width / -(width - areaWidth)
                }
                let bottomLeftCorner = this.cornerBottomLeft()
                bottomLeftCorner = this.__rotateCorners(
                    bottomLeftCorner.x,
                    bottomLeftCorner.y,
                    -this.rotate()
                )
                const innerCordX =
                    bottomLeftCorner.x - this.__overflowCords.x / xPer
                const innerCordY =
                    bottomLeftCorner.y -
                    OVERFLOW_AREA_GAP +
                    OVERFLOW_INNER_AREA_GAP

                this.#buildOverflowScrollAreaBar(
                    this.#overflowXscrollBarBlock!,
                    this.#overflowXscrollBarBlock!.x(),
                    this.#overflowXscrollBarBlock!.y(),
                    this.#overflowXscrollBarBlock!.width(),
                    this.#overflowXscrollBarBlock!.height(),
                    innerCordX,
                    innerCordY,
                    areaWidth,
                    OVERFLOW_INNER_AREA_SIZE,
                    OVERFLOW_INNER_AREA_RADIUS
                )
            })
            this.addChild(this.#overflowXscrollBarBlock)
        } else {
            this.#overflowXscrollBarBlock.rotationCenterX(
                this.rotationCenterX()
            )
            this.#overflowXscrollBarBlock.rotationCenterY(
                this.rotationCenterY()
            )
            this.#overflowXscrollBarBlock.rotate(this.rotate())
            this.#overflowXscrollBarBlock.left(this.x())
            this.#overflowXscrollBarBlock.top(
                this.y() + this.height() - OVERFLOW_AREA_GAP
            )
            this.#overflowXscrollBarBlock.width(this.width())
            this.#overflowXscrollBarBlock.height(OVERFLOW_AREA_GAP)
            // Showing overflow scroll bar block on top of the child blocks
            this.#overflowXscrollBarBlock.zIndex(1 + this.#upperMostZIndex)
        }
    }

    __overflowYScrollBar() {
        if (!this.#overflowYscrollBarBlock) {
            this.#overflowYscrollBarBlock = new Block({
                name: OVERFLOW_SCROLL_BAR_BLOCK_NAME,
                width: OVERFLOW_AREA_GAP,
                height: this.height() - this.#overflowScrollYHeightCut,
                position: 'fixed',
                left: this.x() + this.width() - OVERFLOW_AREA_GAP,
                top: this.y(),
                selectable: true,
                // Showing overflow scroll bar block on top of the child blocks
                zIndex: 1 + this.#upperMostZIndex,
                rotationCenterX: this.rotationCenterX(),
                rotationCenterY: this.rotationCenterY(),
                rotate: this.rotate(),
                hotLines: false,
            })

            // moving overflow scrollbar
            let initCords = { x: 0, y: 0 }
            let beforeCords = { x: 0, y: 0 }
            const mousedown = (event: MouseEvent) => {
                const cornerTopLeft =
                    this.#overflowYscrollBarBlock?.cornerTopLeft()!
                const cornerTopRight =
                    this.#overflowYscrollBarBlock?.cornerTopRight()!
                const cornerBottomLeft =
                    this.#overflowYscrollBarBlock?.cornerBottomLeft()!
                const cornerBottomRight =
                    this.#overflowYscrollBarBlock?.cornerBottomRight()!

                initCords =
                    this.#overflowYscrollBarBlock!.canvas?.getCursorPosition(
                        event
                    )!
                if (
                    checkInBound(
                        initCords.x,
                        initCords.y,
                        cornerTopLeft.x,
                        cornerTopLeft.y,
                        cornerTopRight.x,
                        cornerTopRight.y,
                        cornerBottomLeft.x,
                        cornerBottomLeft.y,
                        cornerBottomRight.x,
                        cornerBottomRight.y
                    ) &&
                    !(this.__isOverflowYAuto && this.__overflowCords.height > 0)
                ) {
                    beforeCords = { x: 0, y: 0 }
                    this.#overflowYscrollBarBlock!.__runningEvents.drag = true
                    this.#overflowYscrollBarBlock!.registerZIndex({
                        in: this.#overflowYscrollBarBlock!.zIndex(),
                    })
                    this.__runningEvents.resize = false
                    this.__runningEvents.drag = false
                    this.__runningEvents.rotate = false
                } else
                    this.#overflowYscrollBarBlock!.registerZIndex({
                        out: this.#overflowYscrollBarBlock!.zIndex(),
                    })
            }
            const mousemove = (event: MouseEvent) => {
                const { x, y } =
                    this.#overflowYscrollBarBlock!.canvas?.getCursorPosition(
                        event
                    )!
                const cornerTopLeft =
                    this.#overflowYscrollBarBlock?.cornerTopLeft()!
                const cornerTopRight =
                    this.#overflowYscrollBarBlock?.cornerTopRight()!
                const cornerBottomLeft =
                    this.#overflowYscrollBarBlock?.cornerBottomLeft()!
                const cornerBottomRight =
                    this.#overflowYscrollBarBlock?.cornerBottomRight()!
                // checking cursor cause resize area overlaps with the overflow area
                if (
                    !this.#overflowYscrollBarBlock!.__runningEvents.drag &&
                    checkInBound(
                        x,
                        y,
                        cornerTopLeft.x,
                        cornerTopLeft.y,
                        cornerTopRight.x,
                        cornerTopRight.y,
                        cornerBottomLeft.x,
                        cornerBottomLeft.y,
                        cornerBottomRight.x,
                        cornerBottomRight.y
                    ) &&
                    !(this.__isOverflowYAuto && this.__overflowCords.height > 0)
                ) {
                    this.canvas?.changeCursor('auto')
                }
                if (
                    this.#overflowYscrollBarBlock!.__runningEvents.drag &&
                    this.__isOverflowYScrollable
                ) {
                    this.#overflowYscrollBarBlock!.registerZIndex({
                        in: this.#overflowYscrollBarBlock!.zIndex(),
                    })
                    if (this.#overflowYscrollBarBlock!.ImFirst) {
                        let diffX = x - initCords.x
                        let diffY = y - initCords.y

                        if (diffY !== 0 || diffX !== 0) {
                            const dxX = diffX - beforeCords.x
                            const dxY = diffY - beforeCords.y
                            const angle = this.__getRealRotate

                            const horizontalFlipped = this.__isHorizontalFlipped
                            const verticalFlipped = this.__isVerticalFlipped

                            let inverse = 1
                            if (
                                (horizontalFlipped || verticalFlipped) &&
                                horizontalFlipped !== verticalFlipped
                            )
                                inverse = -1

                            this.__overflowTranslateY(
                                -(
                                    -Math.sin(angle) * inverse * dxX +
                                    Math.cos(angle) * inverse * dxY
                                )
                            )
                            beforeCords.x = diffX
                            beforeCords.y = diffY
                            this.#overflowYscrollBarBlock!.invokeChange()
                        }
                    }
                }
            }
            const mouseup = () => {
                if (this.#overflowYscrollBarBlock!.__runningEvents.drag) {
                    this.#overflowYscrollBarBlock!.__runningEvents.drag = false
                    this.#overflowYscrollBarBlock!.registerZIndex({
                        out: this.#overflowYscrollBarBlock!.zIndex(),
                    })
                    this.#overflowYscrollBarBlock!.invokeChange()
                }
            }
            this.#overflowYscrollBarBlock.eventHandler<MouseEvent>(
                'mousedown',
                mousedown,
                'overflowYMouseDown'
            )
            this.#overflowYscrollBarBlock.eventHandler<MouseEvent>(
                'mousemove',
                mousemove,
                'overflowYMouseMove'
            )
            this.#overflowYscrollBarBlock.eventHandler<MouseEvent>(
                'mouseup',
                mouseup,
                'overflowYMouseUp'
            )
            this.#overflowYscrollBarBlock.onRender(() => {
                if (
                    (this.__isOverflowYAuto &&
                        this.__overflowCords.height > 0) ||
                    !this.#overflowYscrollBarBlock
                )
                    return
                const height = Math.abs(this.height())
                const areaHeight = clamp(
                    height +
                        (this.__overflowCords.height -
                            this.#overflowScrollYHeightCut),
                    OVERFLOW_SCROLL_BAR_MIN_SIZE,
                    height - this.#overflowScrollYHeightCut
                )
                const currentHeight =
                    height +
                    (this.__overflowCords.height -
                        this.#overflowScrollYHeightCut)
                //  while inner scroll bar in minimum width need to calculate correct cordiantes
                let yPer = 1
                if (currentHeight < 0) {
                    yPer =
                        this.__overflowCords.height /
                        -(height - areaHeight - this.#overflowScrollYHeightCut)
                }

                let topRightCorner = this.cornerTopRight()
                topRightCorner = this.__rotateCorners(
                    topRightCorner.x,
                    topRightCorner.y,
                    -this.rotate()
                )
                const innerCordX =
                    topRightCorner.x -
                    OVERFLOW_AREA_GAP +
                    OVERFLOW_INNER_AREA_GAP
                const innerCordY =
                    topRightCorner.y - this.__overflowCords.y / yPer

                this.#buildOverflowScrollAreaBar(
                    this.#overflowYscrollBarBlock!,
                    this.#overflowYscrollBarBlock!.x(),
                    this.#overflowYscrollBarBlock!.y(),
                    this.#overflowYscrollBarBlock!.width(),
                    this.#overflowYscrollBarBlock!.height(),
                    innerCordX,
                    innerCordY,
                    OVERFLOW_INNER_AREA_SIZE,
                    areaHeight,
                    OVERFLOW_INNER_AREA_RADIUS
                )
            })
            this.addChild(this.#overflowYscrollBarBlock)
        } else {
            this.#overflowYscrollBarBlock.rotationCenterX(
                this.rotationCenterX()
            )
            this.#overflowYscrollBarBlock.rotationCenterY(
                this.rotationCenterY()
            )
            this.#overflowYscrollBarBlock.rotate(this.rotate())
            this.#overflowYscrollBarBlock.left(
                this.x() + this.width() - OVERFLOW_AREA_GAP
            )
            this.#overflowYscrollBarBlock.top(this.y())
            this.#overflowYscrollBarBlock.width(OVERFLOW_AREA_GAP)
            this.#overflowYscrollBarBlock.height(
                this.height() - this.#overflowScrollYHeightCut
            )
            // Showing overflow scroll bar block on top of the child blocks
            this.#overflowYscrollBarBlock.zIndex(1 + this.#upperMostZIndex)
        }
    }

    // need to resize height for not overlapping overflow x and y cordinates
    get #overflowScrollYHeightCut() {
        return this.__isOverflowXScrollable ? OVERFLOW_AREA_GAP : 0
    }

    #buildOverflowScrollAreaBar(
        block: Block,
        coverAreaX: number,
        coverAreaY: number,
        coverAreaWidth: number,
        coverAreaHeight: number,
        innerScrollX: number,
        innerScrollY: number,
        innerScrollWidth: number,
        innerScrollHeight: number,
        innerScrollRadius: number
    ) {
        if (!block.context) return

        block.context.save()
        block.context?.translate(this.rotationCenterX(), this.rotationCenterY())
        block.context?.rotate(this.rotate())
        block.context?.translate(
            -this.rotationCenterX(),
            -this.rotationCenterY()
        )

        // need to clip overflow area too
        this.__childClipping?.(this)

        block.context.setLineDash([])
        block.context.beginPath()
        block.context.roundRect(
            coverAreaX,
            coverAreaY,
            coverAreaWidth,
            coverAreaHeight,
            0
        )
        block.context.fillStyle = 'white'
        block.context.fill()
        block.context.stroke()
        block.context.beginPath()

        block.context.roundRect(
            innerScrollX,
            innerScrollY,
            innerScrollWidth,
            innerScrollHeight,
            innerScrollRadius
        )

        block.context.fillStyle = 'gray'
        block.context.fill()
        block.context.restore()
    }

    resetRunningEvents() {
        // Only need to reset transformation events
        this.__runningEvents.drag = false
        this.__runningEvents.rotate = false
        this.__runningEvents.resize = false
        if (this.#overflowXscrollBarBlock)
            this.#overflowXscrollBarBlock.__runningEvents.drag = false
        if (this.#overflowYscrollBarBlock)
            this.#overflowYscrollBarBlock.__runningEvents.drag = false
    }

    // Overrided default listing methods for filter out unwanted child classes
    listOnlyChilds<B>(
        _func: (node: B, currIdx: number, arrLen: number) => void
    ): void {
        // for correct array length need to extract additonall overflow blocks
        let arrLenExt = 0
        if (this.#overflowXscrollBarBlock) arrLenExt -= 1
        if (this.#overflowYscrollBarBlock) arrLenExt -= 1
        if (this.#hotLineBlock) arrLenExt -= 1
        const listingFunc = (node: B, currIdx: number, arrLen: number) => {
            if (
                (node as Block).name() !== OVERFLOW_SCROLL_BAR_BLOCK_NAME &&
                (node as Block).name() !== HOT_LINE_BLOCK_NAME
            ) {
                _func(node, currIdx, arrLen + arrLenExt)
            }
        }
        super.listOnlyChilds(listingFunc)
    }

    listAllChilds<T>(_func: (node: T) => void): void {
        const listingFunc = (node: T) => {
            if (
                (node as Block).name() !== OVERFLOW_SCROLL_BAR_BLOCK_NAME &&
                (node as Block).name() !== HOT_LINE_BLOCK_NAME
            ) {
                _func(node)
            }
        }
        super.listAllChilds(listingFunc)
    }

    __generatePayload(): BlockPayload<T> {
        const childs: BlockPayload<any>[] = []
        this.listOnlyChilds((b: Block) => {
            childs.push(b.__generatePayload())
        })
        return {
            nodeId: this.nodeId,
            name: this.constructor.name,
            options: this.options,
            cacheOptions: this.cacheOptions,
            childs: childs,
            additionalParams: [],
        }
    }

    addChild(...blocks: Block<any>[]): void {
        const exists = blocks.filter((r) => !this.childNodes.includes(r))
        if (exists.length === 0) return
        let before: any = {}
        before[this.nodeId!] = {
            childNodes: [...this.childNodes],
        }
        super.addChild(...exists)
        this.canvas?.invokeNodeListing()
        let z = this.zIndex() || 1
        for (let i = 0, len = exists.length; i < len; i++) {
            const b = exists[i]
            if (b.order() === undefined) {
                b.order(this.#lastOrder)
                this.#lastOrder += 1
            }
            if (b.zIndex() == undefined && !b.#isZIndexPredefined) {
                z += 1
                b.zIndex(z)
                b.#isZIndexPredefined = true
                // need to handle z index of before added childs of the child block
                b.#handleChildZIndex()
            }
            this.canvas?.__handleOptions(b)
            this.canvas?.__collectEvents(b)
            this.canvas?.__collectAnimations(b)
            b.__initCordinates()
            this.canvas?.__takeInitSnaphshot(before)
            this.canvas?.__takeBlockSnapshot(this, before)
        }
        this.invokeChange()
    }

    #handleChildZIndex() {
        let z = this.zIndex() || 1
        this.listOnlyChilds((b: Block) => {
            if (b.zIndex() == undefined || b.#isZIndexPredefined) {
                z += 1
                b.zIndex(z)
                b.#handleChildZIndex()
            }
        })
    }

    removeChild(child: Block<any>): void {
        if (!this.childNodes.includes(child)) return
        let before: any = {}
        before[this.nodeId!] = {
            childNodes: [...this.childNodes],
        }
        super.removeChild(child)
        child.__childAdjustment = undefined
        child.__childClipping = undefined
        this.canvas?.invokeNodeListing()
        this.canvas?.__clearEvents(child)
        this.canvas?.__takeBlockSnapshot(this, before)
    }

    __addChildInternal(...node: Block[]) {
        super.addChild(...node)
    }
    __removeChildInternal(child: Block): void {
        super.removeChild(child)
    }

    __findHighestChildZIndex() {
        if (this.#childsCount !== this.childsCount) {
            this.#upperMostZIndex = this.zIndex() || 0
            this.listAllChilds((b: Block) => {
                const bZIndex = b.zIndex()
                if (bZIndex !== undefined && bZIndex > this.#upperMostZIndex) {
                    this.#upperMostZIndex = bZIndex
                }
            })
            this.#childsCount = this.childsCount
        }
    }

    findChilds(queries: IBlockOptions) {
        let blocks: Block[] = []
        this.listAllChilds((block: Block) => {
            for (const [k, v] of Object.entries(queries)) {
                if (this.getOptionCurrentVal(k) === v) blocks.push(block)
            }
        })
        return blocks
    }

    __clippingPath() {
        if (!this.__isOverflowVisible) {
            this.__clipPath = new Path2D()
            this.__clipShape()
        }
    }
    __clipShape() {
        this.__clipPath?.rect(this.x(), this.y(), this.width(), this.height())
    }

    __buildHotLines() {
        if (!this.#hotLineBlock) {
            this.#hotLineBlock = new Block({
                name: HOT_LINE_BLOCK_NAME,
                x: this.x(),
                y: this.y(),
                width: Math.abs(this.width()),
                height: Math.abs(this.height()),
                rotate: this.rotate(),
                rotationCenterX: this.rotationCenterX(),
                rotationCenterY: this.rotationCenterY(),
                zIndex:
                    1 +
                    this.#upperMostZIndex +
                    (this.__isOverflowExists ? 1 : 0),
                hotLines: false,
            })

            this.#hotLineBlock.onRender(() => {
                if (this.#hotLineBlock !== undefined) {
                    if (
                        !this.#hotLineBlock!.context ||
                        !this.__runningEvents.selected
                    )
                        return
                    const size = this.hotCornerSize()
                    const radius = this.hotCornerRadius()
                    const strokeWidth = this.hotCornerStrokeWidth()
                    const strokeColor = this.hotCornerStrokeColor()
                    const background = this.hotCornerBackgroundColor()
                    const lineWidth = this.hotLineStrokeWidth()
                    const lineColor = this.hotLineStrokeColor()

                    this.#hotLineBlock.context.save()
                    this.context?.translate(
                        this.rotationCenterX(),
                        this.rotationCenterY()
                    )
                    this.context?.rotate(this.rotate())
                    this.context?.translate(
                        -this.rotationCenterX(),
                        -this.rotationCenterY()
                    )
                    this.#hotLineBlock.context.setLineDash([])
                    this.#hotLineBlock.context.beginPath()

                    // need to clip hot line area too
                    this.__childClipping?.(this)

                    // Draw Lines first
                    this.#hotLineBlock.context.moveTo(
                        this.#hotCornerCords.topLeft.x,
                        this.#hotCornerCords.topLeft.y
                    )
                    this.#hotLineBlock.context.lineTo(
                        this.#hotCornerCords.topRight.x,
                        this.#hotCornerCords.topRight.y
                    )

                    this.#hotLineBlock.context.lineTo(
                        this.#hotCornerCords.bottomRight.x,
                        this.#hotCornerCords.bottomRight.y
                    )
                    this.#hotLineBlock.context.lineTo(
                        this.#hotCornerCords.bottomLeft.x,
                        this.#hotCornerCords.bottomLeft.y
                    )
                    this.#hotLineBlock.context.closePath()
                    this.#hotLineBlock.context.lineWidth = lineWidth
                    this.#hotLineBlock.context.strokeStyle = lineColor
                    this.#hotLineBlock.context.stroke()

                    // Draw corner boxes
                    this.#hotLineBlock.context.beginPath()
                    this.#hotLineBlock.context.roundRect(
                        this.#hotCornerCords.topLeft.x - size / 2,
                        this.#hotCornerCords.topLeft.y - size / 2,
                        size,
                        size,
                        radius
                    )
                    this.#hotLineBlock.context.roundRect(
                        this.#hotCornerCords.topRight.x - size / 2,
                        this.#hotCornerCords.topRight.y - size / 2,
                        size,
                        size,
                        radius
                    )
                    this.#hotLineBlock.context.roundRect(
                        this.#hotCornerCords.bottomLeft.x - size / 2,
                        this.#hotCornerCords.bottomLeft.y - size / 2,
                        size,
                        size,
                        radius
                    )
                    this.#hotLineBlock.context.roundRect(
                        this.#hotCornerCords.bottomRight.x - size / 2,
                        this.#hotCornerCords.bottomRight.y - size / 2,
                        size,
                        size,
                        radius
                    )
                    this.#hotLineBlock.context.lineWidth = strokeWidth
                    this.#hotLineBlock.context.strokeStyle = strokeColor
                    this.#hotLineBlock.context.fillStyle = background
                    this.#hotLineBlock.context.fill()
                    this.#hotLineBlock.context.stroke()
                    this.#hotLineBlock.context.restore()
                }
            })
            this.addChild(this.#hotLineBlock)
        } else {
            this.#hotLineBlock.rotationCenterX(this.rotationCenterX())
            this.#hotLineBlock.rotationCenterY(this.rotationCenterY())
            this.#hotLineBlock.rotate(this.rotate())
            this.#hotLineBlock.x(this.x())
            this.#hotLineBlock.y(this.y())
            this.#hotLineBlock.width(Math.abs(this.width()))
            this.#hotLineBlock.height(Math.abs(this.height()))
            this.#hotLineBlock.zIndex(
                1 + this.#upperMostZIndex + (this.__isOverflowExists ? 1 : 0)
            )
        }
    }

    hotLines(opt?: boolean) {
        return this.__valueHandler(opt, 'hotLines', true)
    }

    __adjustChildBlocks(): void {
        if (this.childsCount !== 0) {
            const pWidth = this.width()
            const pHeight = this.height()

            const pPaddingLeft = this.paddingLeft()
            const pPaddingRight = this.paddingRight()
            const pPaddingTop = this.paddingTop()
            const pPaddingBottom = this.paddingBottom()

            const pWidthSpaces = pWidth - (pPaddingLeft + pPaddingRight)
            const pHeightSpaces = pHeight - (pPaddingTop + pPaddingBottom)

            const centerX = this.rotationCenterX()
            const centerY = this.rotationCenterY()

            const pCurrentRotate = this.getOptionCurrentVal('rotate')
            const pCacheRotate = this.getOptionCacheVal('rotate')

            const cornerLeftX = this.__getLeft.x
            const cornerTopY = this.__getTop.y

            let startX = 0
            let startY = 0
            let containerW = 0
            let containerH = 0
            let wrapWidth = 0

            let blocksContainerWidth = 0
            let blocksContainerHeight = 0

            this.listOnlyChilds((b: Block, currIdx, arrLen) => {
                const blockPosition = b.position()
                if (blockPosition === 'absolute' || blockPosition === 'fixed')
                    return

                const blockMarginTop = b.marginTop()
                const blockMarginBottom = b.marginBottom()
                const blockMarginLeft = b.marginLeft()
                const blockMarginRight = b.marginRight()

                let blockW = b.width()
                let blockH = b.height()

                const blockWidthSpaces =
                    blockW + blockMarginLeft + blockMarginRight
                const blockHeightSpaces =
                    blockH + blockMarginTop + blockMarginBottom

                wrapWidth += blockWidthSpaces
                if (wrapWidth > pWidthSpaces) {
                    startX = 0
                    blocksContainerHeight += containerH
                    wrapWidth = blockWidthSpaces
                    startY += containerH

                    containerW = 0
                    containerH = 0
                }

                const blockXStart = startX + pPaddingLeft + blockMarginLeft
                const blockYStart = startY + pPaddingTop + blockMarginTop

                let x = blockXStart + cornerLeftX + this.__overflowCords.x
                let y = blockYStart + cornerTopY + this.__overflowCords.y

                if (blockPosition === 'relative') {
                    if (b.left() !== undefined) x += b.left()!
                    else if (b.right() !== undefined) x -= b.right()!

                    if (b.top() !== undefined) y += b.top()!
                    else if (b.bottom() !== undefined) y -= b.bottom()!
                } else if (blockPosition === 'sticky') {
                    if (this.__isOverflowYScroll) {
                        if (
                            b.top() !== undefined &&
                            Math.abs(this.__overflowCords.y) >=
                                blockYStart - b.top()!
                        ) {
                            y += b.top()! - (this.__overflowCords.y + startY)
                        } else if (
                            b.bottom() !== undefined &&
                            Math.abs(this.__overflowCords.y) <=
                                blockYStart +
                                    b.bottom()! -
                                    Math.abs(pHeight - blockH)
                        ) {
                            y +=
                                -b.bottom()! -
                                (this.__overflowCords.y + startY) +
                                Math.abs(pHeight - blockH)
                        }
                    }
                    if (this.__isOverflowXScroll) {
                        if (
                            b.left() !== undefined &&
                            Math.abs(this.__overflowCords.x) >=
                                blockXStart - b.left()!
                        ) {
                            x += b.left()! - (this.__overflowCords.x + startX)
                        } else if (
                            b.right() !== undefined &&
                            Math.abs(this.__overflowCords.x) <=
                                blockXStart -
                                    b.right()! -
                                    Math.abs(pWidth - blockW)
                        ) {
                            x +=
                                b.right()! -
                                (this.__overflowCords.x + startX) +
                                Math.abs(pWidth - blockW)
                        }
                    }
                }

                startX += blockWidthSpaces
                containerW += blockWidthSpaces

                if (containerH < blockHeightSpaces)
                    containerH = blockHeightSpaces

                if (containerW > blocksContainerWidth)
                    blocksContainerWidth = containerW

                if (currIdx == arrLen - 1) blocksContainerHeight += containerH

                const blockMaxWidth =
                    b.maxWidth() !== Infinity ? b.maxWidth() : undefined
                const blockMaxHeight =
                    b.maxHeight() !== Infinity ? b.maxHeight() : undefined

                if (
                    blockMaxWidth !== undefined &&
                    ((pWidthSpaces < blockW && pWidth > b.minWidth()) ||
                        blockW < blockMaxWidth)
                )
                    blockW += pWidthSpaces - blockW

                if (
                    blockMaxHeight !== undefined &&
                    ((pHeightSpaces < blockH && pHeight > b.minHeight()) ||
                        blockH < blockMaxHeight)
                ) {
                    blockH += pHeightSpaces - blockH
                }
                b.setOptionCurrentVal('rotate', pCurrentRotate)
                b.setOptionCacheVal('rotate', pCacheRotate)
                b.__childAdjustment = (b: Block) => {
                    b.hidden(this.hidden())
                    if (b.rotationCenter() === 'parent') {
                        b.rotationCenterX(centerX)
                        b.rotationCenterY(centerY)
                    }
                    b.x(x)
                    b.y(y)
                    b.width(blockW)
                    b.height(blockH)
                    // parent block taking care all transformations of child block
                    b.__runningEvents.drag = false
                    b.__runningEvents.resize = false
                    b.__runningEvents.rotate = false
                }

                if (this.__clipPath || this.parentNode?.__clipPath) {
                    b.__childClipping = (b: Block) => {
                        // in rotate of partent clipping also need to be rotated
                        b.context?.translate(centerX, centerY)
                        b.context?.rotate(pCurrentRotate)
                        b.context?.translate(-centerX, -centerY)
                        // if parent clipping exists need to add another clip for it too
                        if (this.__clipPath!)
                            b.context?.clip(this.__clipPath!, 'nonzero')
                        if (this.parentNode?.__clipPath)
                            b.context?.clip(
                                this.parentNode?.__clipPath,
                                'nonzero'
                            )

                        // after clip need to reset to its default rotation
                        b.context?.translate(centerX, centerY)
                        b.context?.rotate(-pCurrentRotate)
                        b.context?.translate(-centerX, -centerY)
                    }
                }
            })

            if (!this.__isOverflowVisible) {
                const beforeWidth = this.__overflowCords.width
                const beforeHeight =
                    this.__overflowCords.height ||
                    this.#overflowScrollYHeightCut

                const reverseX = this.__isHorizontalFlipped ? -1 : 1
                this.__overflowCords.width =
                    reverseX * pWidthSpaces - blocksContainerWidth
                const reverseY = this.__isVerticalFlipped ? -1 : 1
                this.__overflowCords.height =
                    reverseY * pHeightSpaces -
                    this.#overflowScrollYHeightCut -
                    blocksContainerHeight

                // If overflow area cursor on the right need to adjust it to left for correcting overflow cordinate
                const diffW = this.__overflowCords.width - beforeWidth
                if (diffW > 0)
                    if (this.__overflowCords.x < 0)
                        this.__overflowCords.x += diffW
                    else this.__overflowCords.x = 0

                // If overflow area cursor on the bottom need to adjust it to top for correcting overflow cordinate
                const diffH = this.__overflowCords.height - beforeHeight
                if (diffH > 0)
                    if (this.__overflowCords.y < 0)
                        this.__overflowCords.y += diffH
                    else this.__overflowCords.y = 0
            }
        }
    }

    __initCordinates() {
        const padding = this.getOptionCurrentVal('padding')
        const margin = this.getOptionCurrentVal('margin')
        if (padding !== undefined) this.#parsePadding(padding)
        if (margin !== undefined) this.#parseMargin(margin)
        const x = this.x()
        const y = this.y()
        let scale: number | undefined = this.scale()
        scale = scale !== undefined ? scale : 1
        const width = this.width(
            (this.width() + this.paddingLeft() + this.paddingRight()) * scale
        )
        const height = this.height(
            (this.height() + this.paddingTop() + this.paddingBottom()) * scale
        )
        if (this.getOptionCurrentVal('cornerTopLeft') === undefined)
            this.setOptionCurrentVal('cornerTopLeft', {
                x: x,
                y: y,
            })
        if (this.getOptionCurrentVal('cornerTopRight') === undefined)
            this.setOptionCurrentVal('cornerTopRight', {
                x: x + width,
                y: y,
            })
        if (this.getOptionCurrentVal('cornerBottomLeft') === undefined)
            this.setOptionCurrentVal('cornerBottomLeft', {
                x: x,
                y: y + height,
            })
        if (this.getOptionCurrentVal('cornerBottomRight') === undefined)
            this.setOptionCurrentVal('cornerBottomRight', {
                x: x + width,
                y: y + height,
            })
        if (this.getOptionCurrentVal('rotationCenterX') === undefined)
            this.setOptionCurrentVal('rotationCenterX', this.__getRealCenterX)
        if (this.getOptionCurrentVal('rotationCenterY') === undefined)
            this.setOptionCurrentVal('rotationCenterY', this.__getRealCenterY)
        const hotAreaGap = this.hotAreaGap()
        const topLeftCorner = {
            x: this.cornerTopLeft().x - hotAreaGap,
            y: this.cornerTopLeft().y - hotAreaGap,
        }
        const topRightCorner = {
            x: this.cornerTopRight().x + hotAreaGap,
            y: this.cornerTopRight().y - hotAreaGap,
        }
        const bottomLeftCorner = {
            x: this.cornerBottomLeft().x - hotAreaGap,
            y: this.cornerBottomLeft().y + hotAreaGap,
        }
        const bottomRightCorner = {
            x: this.cornerBottomRight().x + hotAreaGap,
            y: this.cornerBottomRight().y + hotAreaGap,
        }
        this.#initHotLineArea(
            topLeftCorner,
            topRightCorner,
            bottomLeftCorner,
            bottomRightCorner
        )
        this.__updateOptionsCache()
        this.__updateCordinatesByRot(this.rotate())
    }

    #initHotLineArea(
        topLeftCorner: XY,
        topRightCorner: XY,
        bottomLeftCorner: XY,
        bottomRightCorner: XY
    ) {
        const hotAreaSize = this.hotAreaSize()
        const hotResizableAreaTopLeft = (corner: XY) => {
            return {
                topLeft: {
                    x: corner.x,
                    y: corner.y,
                },
                topRight: {
                    x: corner.x + hotAreaSize,
                    y: corner.y,
                },
                bottomLeft: {
                    x: corner.x,
                    y: corner.y + hotAreaSize,
                },
                bottomRight: {
                    x: corner.x + hotAreaSize,
                    y: corner.y + hotAreaSize,
                },
            }
        }
        const hotResizableAreaTopRight = (corner: XY) => {
            return {
                topLeft: {
                    x: corner.x - hotAreaSize,
                    y: corner.y,
                },
                topRight: {
                    x: corner.x,
                    y: corner.y,
                },
                bottomLeft: {
                    x: corner.x - hotAreaSize,
                    y: corner.y + hotAreaSize,
                },
                bottomRight: {
                    x: corner.x,
                    y: corner.y + hotAreaSize,
                },
            }
        }
        const hotResizableAreaBottomLeft = (corner: XY) => {
            return {
                topLeft: {
                    x: corner.x,
                    y: corner.y - hotAreaSize,
                },
                topRight: {
                    x: corner.x + hotAreaSize,
                    y: corner.y - hotAreaSize,
                },
                bottomLeft: {
                    x: corner.x,
                    y: corner.y,
                },
                bottomRight: {
                    x: corner.x + hotAreaSize,
                    y: corner.y,
                },
            }
        }
        const hotResizableAreaBottomRight = (corner: XY) => {
            return {
                topLeft: {
                    x: corner.x - hotAreaSize,
                    y: corner.y - hotAreaSize,
                },
                topRight: {
                    x: corner.x,
                    y: corner.y - hotAreaSize,
                },
                bottomLeft: {
                    x: corner.x - hotAreaSize,
                    y: corner.y,
                },
                bottomRight: {
                    x: corner.x,
                    y: corner.y,
                },
            }
        }
        const hotResizableAreaVertical = (corner1: XY, corner2: XY) => {
            return {
                topLeft: {
                    x: corner1.x + hotAreaSize,
                    y: corner1.y - hotAreaSize / 2,
                },
                topRight: {
                    x: corner2.x - hotAreaSize,
                    y: corner2.y - hotAreaSize / 2,
                },
                bottomLeft: {
                    x: corner1.x + hotAreaSize,
                    y: corner1.y + hotAreaSize / 2,
                },
                bottomRight: {
                    x: corner2.x - hotAreaSize,
                    y: corner2.y + hotAreaSize / 2,
                },
            }
        }
        const hotResizableAreaHorizontal = (corner1: XY, corner2: XY) => {
            return {
                topLeft: {
                    x: corner1.x - hotAreaSize / 2,
                    y: corner1.y + hotAreaSize,
                },
                topRight: {
                    x: corner1.x + hotAreaSize / 2,
                    y: corner1.y + hotAreaSize,
                },
                bottomLeft: {
                    x: corner2.x - hotAreaSize / 2,
                    y: corner2.y - hotAreaSize,
                },
                bottomRight: {
                    x: corner2.x + hotAreaSize / 2,
                    y: corner2.y - hotAreaSize,
                },
            }
        }
        const hotRotatableAreaTopLeft = (corner: XY) => {
            return {
                topLeft: {
                    x: corner.x - hotAreaSize,
                    y: corner.y - hotAreaSize,
                },
                topRight: {
                    x: corner.x,
                    y: corner.y - hotAreaSize,
                },
                bottomLeft: {
                    x: corner.x - hotAreaSize,
                    y: corner.y,
                },
                bottomRight: {
                    x: corner.x,
                    y: corner.y,
                },
            }
        }
        const hotRotatableAreaTopRight = (corner: XY) => {
            return {
                topLeft: {
                    x: corner.x,
                    y: corner.y - hotAreaSize,
                },
                topRight: {
                    x: corner.x + hotAreaSize,
                    y: corner.y - hotAreaSize,
                },
                bottomLeft: {
                    x: corner.x,
                    y: corner.y,
                },
                bottomRight: {
                    x: corner.x + hotAreaSize,
                    y: corner.y,
                },
            }
        }
        const hotRotatableAreaBottomLeft = (corner: XY) => {
            return {
                topLeft: {
                    x: corner.x - hotAreaSize,
                    y: corner.y,
                },
                topRight: {
                    x: corner.x,
                    y: corner.y,
                },
                bottomLeft: {
                    x: corner.x - hotAreaSize,
                    y: corner.y + hotAreaSize,
                },
                bottomRight: {
                    x: corner.x,
                    y: corner.y + hotAreaSize,
                },
            }
        }
        const hotRotatableAreaBottomRight = (corner: XY) => {
            return {
                topLeft: {
                    x: corner.x,
                    y: corner.y,
                },
                topRight: {
                    x: corner.x + hotAreaSize,
                    y: corner.y,
                },
                bottomLeft: {
                    x: corner.x,
                    y: corner.y + hotAreaSize,
                },
                bottomRight: {
                    x: corner.x + hotAreaSize,
                    y: corner.y + hotAreaSize,
                },
            }
        }

        if (this.__isHorizontalFlipped && this.__isVerticalFlipped) {
            this.setOptionCurrentVal(
                'hotResizableAreaTopLeft',
                hotResizableAreaBottomRight(topLeftCorner)
            )
            this.setOptionCurrentVal(
                'hotResizableAreaTopRight',
                hotResizableAreaBottomLeft(topRightCorner)
            )
            this.setOptionCurrentVal(
                'hotResizableAreaBottomLeft',
                hotResizableAreaTopRight(bottomLeftCorner)
            )
            this.setOptionCurrentVal(
                'hotResizableAreaBottomRight',
                hotResizableAreaTopLeft(bottomRightCorner)
            )
            this.setOptionCurrentVal(
                'hotResizableAreaTop',
                hotResizableAreaVertical(topRightCorner, topLeftCorner)
            )
            this.setOptionCurrentVal(
                'hotResizableAreaBottom',
                hotResizableAreaVertical(bottomRightCorner, bottomLeftCorner)
            )
            this.setOptionCurrentVal(
                'hotResizableAreaLeft',
                hotResizableAreaHorizontal(bottomLeftCorner, topLeftCorner)
            )
            this.setOptionCurrentVal(
                'hotResizableAreaRight',
                hotResizableAreaHorizontal(bottomRightCorner, topRightCorner)
            )
            this.setOptionCurrentVal(
                'hotRotatableAreaTopLeft',
                hotRotatableAreaBottomRight(topLeftCorner)
            )
            this.setOptionCurrentVal(
                'hotRotatableAreaTopRight',
                hotRotatableAreaBottomLeft(topRightCorner)
            )
            this.setOptionCurrentVal(
                'hotRotatableAreaBottomLeft',
                hotRotatableAreaTopRight(bottomLeftCorner)
            )
            this.setOptionCurrentVal(
                'hotRotatableAreaBottomRight',
                hotRotatableAreaTopLeft(bottomRightCorner)
            )
        } else if (this.__isHorizontalFlipped) {
            this.setOptionCurrentVal(
                'hotResizableAreaTopLeft',
                hotResizableAreaTopRight(topLeftCorner)
            )
            this.setOptionCurrentVal(
                'hotResizableAreaTopRight',
                hotResizableAreaTopLeft(topRightCorner)
            )
            this.setOptionCurrentVal(
                'hotResizableAreaBottomLeft',
                hotResizableAreaBottomRight(bottomLeftCorner)
            )
            this.setOptionCurrentVal(
                'hotResizableAreaBottomRight',
                hotResizableAreaBottomLeft(bottomRightCorner)
            )
            this.setOptionCurrentVal(
                'hotResizableAreaTop',
                hotResizableAreaVertical(topRightCorner, topLeftCorner)
            )
            this.setOptionCurrentVal(
                'hotResizableAreaBottom',
                hotResizableAreaVertical(bottomRightCorner, bottomLeftCorner)
            )
            this.setOptionCurrentVal(
                'hotResizableAreaLeft',
                hotResizableAreaHorizontal(topLeftCorner, bottomLeftCorner)
            )
            this.setOptionCurrentVal(
                'hotResizableAreaRight',
                hotResizableAreaHorizontal(topRightCorner, bottomRightCorner)
            )
            this.setOptionCurrentVal(
                'hotRotatableAreaTopLeft',
                hotRotatableAreaTopRight(topLeftCorner)
            )
            this.setOptionCurrentVal(
                'hotRotatableAreaTopRight',
                hotRotatableAreaTopLeft(topRightCorner)
            )
            this.setOptionCurrentVal(
                'hotRotatableAreaBottomLeft',
                hotRotatableAreaBottomRight(bottomLeftCorner)
            )
            this.setOptionCurrentVal(
                'hotRotatableAreaBottomRight',
                hotRotatableAreaBottomLeft(bottomRightCorner)
            )
        } else if (this.__isVerticalFlipped) {
            this.setOptionCurrentVal(
                'hotResizableAreaTopLeft',
                hotResizableAreaBottomLeft(topLeftCorner)
            )
            this.setOptionCurrentVal(
                'hotResizableAreaTopRight',
                hotResizableAreaBottomRight(topRightCorner)
            )
            this.setOptionCurrentVal(
                'hotResizableAreaBottomLeft',
                hotResizableAreaTopLeft(bottomLeftCorner)
            )
            this.setOptionCurrentVal(
                'hotResizableAreaBottomRight',
                hotResizableAreaTopRight(bottomRightCorner)
            )
            this.setOptionCurrentVal(
                'hotResizableAreaTop',
                hotResizableAreaVertical(topLeftCorner, topRightCorner)
            )
            this.setOptionCurrentVal(
                'hotResizableAreaBottom',
                hotResizableAreaVertical(bottomLeftCorner, bottomRightCorner)
            )
            this.setOptionCurrentVal(
                'hotResizableAreaLeft',
                hotResizableAreaHorizontal(bottomLeftCorner, topLeftCorner)
            )
            this.setOptionCurrentVal(
                'hotResizableAreaRight',
                hotResizableAreaHorizontal(bottomRightCorner, topRightCorner)
            )
            this.setOptionCurrentVal(
                'hotRotatableAreaTopLeft',
                hotRotatableAreaBottomLeft(topLeftCorner)
            )
            this.setOptionCurrentVal(
                'hotRotatableAreaTopRight',
                hotRotatableAreaBottomRight(topRightCorner)
            )
            this.setOptionCurrentVal(
                'hotRotatableAreaBottomLeft',
                hotRotatableAreaTopLeft(bottomLeftCorner)
            )
            this.setOptionCurrentVal(
                'hotRotatableAreaBottomRight',
                hotRotatableAreaTopRight(bottomRightCorner)
            )
        } else {
            this.setOptionCurrentVal(
                'hotResizableAreaTopLeft',
                hotResizableAreaTopLeft(topLeftCorner)
            )
            this.setOptionCurrentVal(
                'hotResizableAreaTopRight',
                hotResizableAreaTopRight(topRightCorner)
            )
            this.setOptionCurrentVal(
                'hotResizableAreaBottomLeft',
                hotResizableAreaBottomLeft(bottomLeftCorner)
            )
            this.setOptionCurrentVal(
                'hotResizableAreaBottomRight',
                hotResizableAreaBottomRight(bottomRightCorner)
            )
            this.setOptionCurrentVal(
                'hotResizableAreaTop',
                hotResizableAreaVertical(topLeftCorner, topRightCorner)
            )
            this.setOptionCurrentVal(
                'hotResizableAreaBottom',
                hotResizableAreaVertical(bottomLeftCorner, bottomRightCorner)
            )
            this.setOptionCurrentVal(
                'hotResizableAreaLeft',
                hotResizableAreaHorizontal(topLeftCorner, bottomLeftCorner)
            )
            this.setOptionCurrentVal(
                'hotResizableAreaRight',
                hotResizableAreaHorizontal(topRightCorner, bottomRightCorner)
            )
            this.setOptionCurrentVal(
                'hotRotatableAreaTopLeft',
                hotRotatableAreaTopLeft(topLeftCorner)
            )
            this.setOptionCurrentVal(
                'hotRotatableAreaTopRight',
                hotRotatableAreaTopRight(topRightCorner)
            )
            this.setOptionCurrentVal(
                'hotRotatableAreaBottomLeft',
                hotRotatableAreaBottomLeft(bottomLeftCorner)
            )
            this.setOptionCurrentVal(
                'hotRotatableAreaBottomRight',
                hotRotatableAreaBottomRight(bottomRightCorner)
            )
        }
    }

    get __isHidden() {
        return this.hidden() || this.__hidden
    }

    __unitConverter<T, O>({
        val,
        widthRelated,
    }: {
        val?: T
        widthRelated?: boolean
    }): O {
        if (val && typeof val === 'string') {
            if (namedColors[val]) {
                return colorToRgba(val) as O
            } else if (val.startsWith('#')) {
                return hexToRgba(val) as O
            } else if (val.startsWith('hsl')) {
                return hslToRgba(val) as O
            } else if (/^\d/.test(val)) {
                const size = widthRelated
                    ? this.__parentWidth
                    : this.__parentHeight
                const space = widthRelated
                    ? this.__widthSpaces
                    : this.__heightSpaces
                if (val.endsWith('px')) return Number(val.split('px')[0]) as O
                else if (val.endsWith('%')) {
                    return (fromPercentage(
                        Number(val.split('%')[0]),
                        size || 1
                    ) - space) as O
                } else if (val.endsWith('rem'))
                    return (fromRem(
                        Number(val.split('rem')[0]),
                        this.canvas?.width || 1
                    ) - space) as O
                else if (val.endsWith('em')) {
                    return (fromEm(Number(val.split('em')[0]), size || 1) -
                        space) as O
                } else if (val.endsWith('vh') && !widthRelated)
                    return (fromVH(
                        Number(val.split('vh')[0]),
                        this.canvas?.height || 1
                    ) - space) as O
                else if (val.endsWith('vw') && widthRelated)
                    return (fromVW(
                        Number(val.split('vw')[0]),
                        this.canvas?.width || 1
                    ) - space) as O
                else if (val.endsWith('cm'))
                    return fromCm(Number(val.split('cm')[0])) as O
                else if (val.endsWith('mm'))
                    return fromMm(Number(val.split('mm')[0])) as O
                else if (val.endsWith('q'))
                    return fromQ(Number(val.split('q')[0])) as O
                else if (val.endsWith('in'))
                    return fromIn(Number(val.split('in')[0])) as O
                else if (val.endsWith('pc'))
                    return fromPc(Number(val.split('pc')[0])) as O
                else if (val.endsWith('pt'))
                    return fromPt(Number(val.split('pt')[0])) as O
                else return Number(val) as O
            }
        } else if (val instanceof Array) {
            const vals = []
            for (let i = 0, len = val.length; i < len; i++) {
                vals.push(this.__unitConverter({ val: val[i] }))
            }
            return vals as O
        }
        return val as O
    }

    get __parentWidth(): number {
        if (this.#hasParentBlock) return this.parentNode?.width?.() || 1
        return this.canvas?.width || 1
    }

    get __parentHeight(): number {
        if (this.#hasParentBlock) return this.parentNode?.height?.() || 1
        return this.canvas?.height || 1
    }

    get #hasParentBlock() {
        if (
            this.parentNode &&
            Object.getPrototypeOf(this.parentNode).constructor.name !== 'Node'
        )
            return true
        return false
    }

    get __leftSpace() {
        return this.marginLeft()
    }

    get __rightSpace() {
        return this.paddingRight() + this.marginRight()
    }

    get __topSpace() {
        return this.marginTop()
    }

    get __bottomSpace() {
        return this.paddingBottom() + this.marginBottom()
    }

    get __widthSpaces() {
        return this.__leftSpace + this.__rightSpace
    }
    get __heightSpaces() {
        return this.__topSpace + this.__bottomSpace
    }
    __valueHandler<T, O>(
        opt: T | undefined,
        option: string,
        defaultOpt: O,
        widthRelated?: boolean
    ): O {
        let currentValue: any = opt
        const important = this.getOptionCurrentVal('important')
        if (important && Object.hasOwn(important, option))
            currentValue = important[option]
        currentValue = this.__unitConverter<T, O>({
            val: currentValue,
            widthRelated: widthRelated,
        })
        return this.__cacheOption(currentValue, option, defaultOpt)
    }

    __cacheOption<I, O>(opt: I, option: keyof IBlock<T>, defaultOpt: O) {
        const value = this.getOptionCurrentVal(option)
        if (opt !== undefined) {
            this.setOptionCurrentVal(option, opt)
            return opt
        } else if (value === undefined) {
            this.setOptionCurrentVal(option, defaultOpt)
            return defaultOpt
        }
        return value
    }

    x(opt?: RelativeType): number {
        return this.__valueHandler(opt, 'x', 0, true)
    }
    y(opt?: RelativeType): number {
        return this.__valueHandler(opt, 'y', 0, false)
    }
    width(opt?: RelativeType): number {
        return this.__valueHandler(opt, 'width', 0, true)
    }
    height(opt?: RelativeType): number {
        return this.__valueHandler(opt, 'height', 0, false)
    }
    minWidth(opt?: RelativeType): number {
        return this.__valueHandler(opt, 'minWidth', 0, true)
    }
    minHeight(opt?: RelativeType): number {
        return this.__valueHandler(opt, 'minHeight', 0, false)
    }
    maxWidth(opt?: RelativeType): number {
        return this.__valueHandler(opt, 'maxWidth', Infinity, true)
    }
    maxHeight(opt?: RelativeType): number {
        return this.__valueHandler(opt, 'maxHeight', Infinity, false)
    }
    position(opt?: Position) {
        const pos = this.__valueHandler<Position, Position | undefined>(
            opt,
            'position',
            undefined
        )
        return pos
    }
    top(opt?: RelativeType) {
        return this.__valueHandler(opt, 'top', undefined, false)
    }
    bottom(opt?: RelativeType) {
        return this.__valueHandler(opt, 'bottom', undefined, false)
    }
    left(opt?: RelativeType) {
        return this.__valueHandler(opt, 'left', undefined, true)
    }
    right(opt?: RelativeType) {
        return this.__valueHandler(opt, 'right', undefined, true)
    }
    padding(opt?: PaddingType): PaddingType | undefined {
        return this.__valueHandler(opt, 'padding', undefined)
    }
    paddingTop(opt?: RelativeType) {
        return this.__valueHandler(opt, 'paddingTop', 0, false)
    }
    paddingBottom(opt?: RelativeType) {
        return this.__valueHandler(opt, 'paddingBottom', 0, false)
    }
    paddingLeft(opt?: RelativeType) {
        return this.__valueHandler(opt, 'paddingLeft', 0, false)
    }
    paddingRight(opt?: RelativeType) {
        return this.__valueHandler(opt, 'paddingRight', 0, false)
    }
    margin(opt?: MarginType): MarginType | undefined {
        return this.__valueHandler(opt, 'margin', undefined)
    }
    marginTop(opt?: RelativeType) {
        return this.__valueHandler(opt, 'marginTop', 0, false)
    }
    marginBottom(opt?: RelativeType) {
        return this.__valueHandler(opt, 'marginBottom', 0, false)
    }
    marginLeft(opt?: RelativeType) {
        return this.__valueHandler(opt, 'marginLeft', 0, true)
    }
    marginRight(opt?: RelativeType) {
        return this.__valueHandler(opt, 'marginRight', 0, true)
    }
    overflow(opt?: Overflow): Overflow {
        return this.__valueHandler(opt, 'overflow', 'visible', false)
    }

    overflowX(opt?: Overflow) {
        return this.__valueHandler(opt, 'overflowX', 'visible', false)
    }

    overflowY(opt?: Overflow) {
        return this.__valueHandler(opt, 'overflowY', 'visible', false)
    }

    cornerTopLeft(opt?: XY) {
        return this.__valueHandler(opt, 'cornerTopLeft', initalXY)
    }

    cornerTopRight(opt?: XY) {
        return this.__valueHandler(opt, 'cornerTopRight', initalXY)
    }

    cornerBottomLeft(opt?: XY) {
        return this.__valueHandler(opt, 'cornerBottomLeft', initalXY)
    }

    cornerBottomRight(opt?: XY) {
        return this.__valueHandler(opt, 'cornerBottomRight', initalXY)
    }

    hotRotatableAreaTopLeft(opt?: HotCornerArea) {
        return this.__valueHandler(
            opt,
            'hotRotatableAreaTopLeft',
            initialCorners
        )
    }

    hotRotatableAreaTopRight(opt?: HotCornerArea) {
        return this.__valueHandler(
            opt,
            'hotRotatableAreaTopRight',
            initialCorners
        )
    }

    hotRotatableAreaBottomLeft(opt?: HotCornerArea) {
        return this.__valueHandler(
            opt,
            'hotRotatableAreaBottomLeft',
            initialCorners
        )
    }

    hotRotatableAreaBottomRight(opt?: HotCornerArea) {
        return this.__valueHandler(
            opt,
            'hotRotatableAreaBottomRight',
            initialCorners
        )
    }

    hotResizableAreaTopLeft(opt?: HotCornerArea) {
        return this.__valueHandler(
            opt,
            'hotResizableAreaTopLeft',
            initialCorners
        )
    }

    hotResizableAreaTopRight(opt?: HotCornerArea) {
        return this.__valueHandler(
            opt,
            'hotResizableAreaTopRight',
            initialCorners
        )
    }

    hotResizableAreaBottomLeft(opt?: HotCornerArea) {
        return this.__valueHandler(
            opt,
            'hotResizableAreaBottomLeft',
            initialCorners
        )
    }

    hotResizableAreaBottomRight(opt?: HotCornerArea) {
        return this.__valueHandler(
            opt,
            'hotResizableAreaBottomRight',
            initialCorners
        )
    }

    hotResizableAreaTop(opt?: HotCornerArea) {
        return this.__valueHandler(opt, 'hotResizableAreaTop', initialCorners)
    }

    hotResizableAreaBottom(opt?: HotCornerArea) {
        return this.__valueHandler(
            opt,
            'hotResizableAreaBottom',
            initialCorners
        )
    }

    hotResizableAreaLeft(opt?: HotCornerArea) {
        return this.__valueHandler(opt, 'hotResizableAreaLeft', initialCorners)
    }

    hotResizableAreaRight(opt?: HotCornerArea) {
        return this.__valueHandler(opt, 'hotResizableAreaRight', initialCorners)
    }

    hotAreaSize(opt?: number) {
        return this.__valueHandler(opt, 'hotAreaSize', 15)
    }
    rotationCenter(opt?: SelfType) {
        return this.__valueHandler(opt, 'rotationCenter', 'parent', true)
    }
    rotationCenterX(opt?: RelativeType) {
        return this.__valueHandler(opt, 'rotationCenterX', 0, true)
    }
    rotationCenterY(opt?: RelativeType) {
        return this.__valueHandler(opt, 'rotationCenterY', 0, false)
    }
    rotatableTopLeft(opt?: boolean) {
        return this.__valueHandler(opt, 'rotatableTopLeft', true)
    }
    rotatableTopRight(opt?: boolean) {
        return this.__valueHandler(opt, 'rotatableTopRight', true)
    }
    rotatableBottomLeft(opt?: boolean) {
        return this.__valueHandler(opt, 'rotatableBottomLeft', true)
    }
    rotatableBottomRight(opt?: boolean) {
        return this.__valueHandler(opt, 'rotatableBottomRight', true)
    }
    resizableTopLeft(opt?: boolean) {
        return this.__valueHandler(opt, 'resizableTopLeft', true)
    }
    resizableTopRight(opt?: boolean) {
        return this.__valueHandler(opt, 'resizableTopRight', true)
    }
    resizableBottomLeft(opt?: boolean) {
        return this.__valueHandler(opt, 'resizableBottomLeft', true)
    }
    resizableBottomRight(opt?: boolean) {
        return this.__valueHandler(opt, 'resizableBottomRight', true)
    }
    resizableTop(opt?: boolean) {
        return this.__valueHandler(opt, 'resizableTop', true)
    }
    resizableLeft(opt?: boolean) {
        return this.__valueHandler(opt, 'resizableLeft', true)
    }
    resizableRight(opt?: boolean) {
        return this.__valueHandler(opt, 'resizableRight', true)
    }
    resizableBottom(opt?: boolean) {
        return this.__valueHandler(opt, 'resizableBottom', true)
    }
    horizontalFlipResize(opt?: boolean) {
        return this.__valueHandler(opt, 'horizontalFlipResize', false)
    }
    verticalFlipResize(opt?: boolean) {
        return this.__valueHandler(opt, 'verticalFlipResize', false)
    }
    draggableX(opt?: boolean) {
        return this.__valueHandler(opt, 'draggableX', true)
    }
    draggableY(opt?: boolean): boolean {
        return this.__valueHandler(opt, 'draggableY', true)
    }
    hotCornerSize(opt?: number) {
        return this.__valueHandler(opt, 'hotCornerSize', 5)
    }
    hotCornerRadius(opt?: number[]) {
        return this.__valueHandler(opt, 'hotCornerRadius', [0])
    }
    hotCornerStrokeWidth(opt?: number) {
        return this.__valueHandler(opt, 'hotCornerStrokeWidth', 0)
    }
    hotCornerStrokeColor(opt?: string) {
        return this.__valueHandler(opt, 'hotCornerStrokeColor', 'blue')
    }
    hotCornerBackgroundColor(opt?: string) {
        return this.__valueHandler(opt, 'hotCornerBackgroundColor', 'white')
    }
    hotLineStrokeWidth(opt?: number) {
        return this.__valueHandler(opt, 'hotTopStrokeWidth', 1.5)
    }
    hotLineStrokeColor(opt?: string) {
        return this.__valueHandler(opt, 'hotTopStrokeColor', 'blue')
    }
    hotAreaGap(opt?: number) {
        return this.__valueHandler(opt, 'hotAreaGap', 0)
    }
    hidden(opt?: boolean) {
        return this.__valueHandler(opt, 'hidden', false)
    }
    important(opt?: IBlock<T>) {
        return this.__valueHandler<IBlock<T>, IBlock<T> | {}>(
            { ...this.getOptionCurrentVal('important'), ...opt },
            'important',
            {}
        )
    }
    flex(opt?: Flex) {
        const flex = this.__valueHandler(opt, 'flex', [
            this.flexGrow(),
            this.flexShrink(),
            this.flexBasis(),
        ])
        this.flexGrow(flex[0] as FlexGrow)
        this.flexShrink(flex[1] as FlexShrink)
        this.flexBasis(flex[2]) as FlexBasis
        return flex
    }

    flexBasis(opt?: FlexBasis): FlexBasis {
        return this.__valueHandler(opt, 'flexBasis', 'auto')
    }

    flexShrink(opt?: FlexShrink): FlexShrink {
        return this.__valueHandler(opt, 'flexShrink', 0)
    }

    flexGrow(opt?: FlexGrow) {
        return this.__valueHandler(opt, 'flexGrow', 0)
    }

    order(opt?: number): number | undefined {
        return this.__valueHandler(opt, 'order', undefined)
    }

    alignSelf(opt?: AlignSelf) {
        return this.__valueHandler(opt, 'alignSelf', 'auto')
    }
    justifySelf(opt?: JustifySelf) {
        return this.__valueHandler(opt, 'justifySelf', 'auto')
    }
    gridRow(opt?: number[]) {
        return this.__valueHandler(opt, 'gridRow', [])
    }
    gridRowStart(opt?: RelativeType) {
        return this.__valueHandler(opt, 'gridRowStart', 0)
    }
    gridRowEnd(opt?: RelativeType) {
        return this.__valueHandler(opt, 'gridRowEnd', 0)
    }
    gridColumn(opt?: number[]) {
        return this.__valueHandler(opt, 'gridColumn', [])
    }
    gridColumnStart(opt?: RelativeType) {
        return this.__valueHandler(opt, 'gridColumnStart', 0)
    }
    gridColumnEnd(opt?: RelativeType) {
        return this.__valueHandler(opt, 'gridColumnEnd', 0)
    }
    gridArea(opt?: number[] | string) {
        const gridArea = this.__valueHandler(opt, 'gridArea', [])
        this.gridRowStart(gridArea[0] || 'auto')
        this.gridColumnStart(gridArea[1] || 'auto')
        this.gridRowEnd(gridArea[2] || 'auto')
        this.gridColumnEnd(gridArea[3] || 'auto')
        return gridArea
    }

    zIndex(opt?: number) {
        return this.__valueHandler(opt, 'zIndex', undefined)
    }

    set(options: IBlock<IBlockOptions | T>): void {
        let before: any = {}
        let after: any = {}
        for (const [key, value] of Object.entries(options)) {
            const obj = getPrototype(this, key)
            let beforeValue = obj?.value.call(this)
            const handledVal = obj?.value.call(this, value)
            this.setOptionCurrentVal(
                key,
                value === undefined ? undefined : handledVal
            )
            before[this.nodeId!] = {}
            after[this.nodeId!] = {}
            before[this.nodeId!][key] = beforeValue
            after[this.nodeId!][key] = value
        }
        if (Object.keys(before).length !== 0) {
            this.canvas?.takeSnapshot(before, after)
            this.invokeChange()
        }
    }
    scale(opt?: number) {
        return this.__valueHandler(opt, 'scale', undefined)
    }
    __translate(t: { x: number; y: number }) {
        const position = this.position()
        if (position === 'fixed') return
        this.x(this.x() + t.x)
        this.y(this.y() + t.y)
        if (
            position === 'absolute' ||
            (position === 'relative' && !this.#hasParentBlock)
        ) {
            if (this.left() !== undefined) this.left(this.left()! + t.x)
            else if (this.right() !== undefined) this.right(this.right()! - t.x)
            if (this.top() !== undefined) this.top(this.top()! + t.y)
            else if (this.bottom() !== undefined)
                this.bottom(this.bottom()! - t.y)
        }
    }
    __scale(scale: number) {
        this.width(this.width() * scale)
        this.height(this.height() * scale)
    }

    __overflowTranslateX(x: number) {
        const currentWidth = this.width() + this.__overflowCords.width
        let xPer = 1
        if (currentWidth < 0) xPer = this.__overflowCords.width / -this.width()
        const reverseX = this.__isHorizontalFlipped ? -1 : 1
        const xPos = this.__overflowCords.x + x * xPer * reverseX
        if (this.__overflowCords.width < 0) {
            if (xPos < 0) {
                this.__overflowCords.x = -clamp(
                    Math.abs(xPos),
                    0,
                    Math.abs(this.__overflowCords.width)
                )
            } else this.__overflowCords.x = 0
        }
    }
    __overflowTranslateY(y: number) {
        const currentHeight =
            this.height() +
            (this.__overflowCords.height - this.#overflowScrollYHeightCut)
        let yPer = 1
        if (currentHeight < 0)
            yPer = this.__overflowCords.height / -this.height()
        const reverseY = this.__isVerticalFlipped ? -1 : 1
        const yPos = this.__overflowCords.y + y * yPer * reverseY
        if (this.__overflowCords.height < 0) {
            if (yPos < 0) {
                this.__overflowCords.y = -clamp(
                    Math.abs(yPos),
                    0,
                    Math.abs(this.__overflowCords.height)
                )
            } else this.__overflowCords.y = 0
        }
    }

    get __isOverflowXScroll() {
        return this.overflow() === 'scroll' || this.overflowX() === 'scroll'
    }
    get __isOverflowYScroll() {
        return this.overflow() === 'scroll' || this.overflowY() === 'scroll'
    }

    get __isOverflowXAuto() {
        return this.overflow() === 'auto' || this.overflowX() === 'auto'
    }
    get __isOverflowYAuto() {
        return this.overflow() === 'auto' || this.overflowY() === 'auto'
    }

    get __isOverflowExists() {
        return (
            this.overflow() === 'scroll' ||
            this.overflowY() === 'scroll' ||
            this.overflowX() === 'scroll' ||
            this.overflow() === 'auto' ||
            this.overflowY() === 'auto' ||
            this.overflowX() === 'auto'
        )
    }

    get __isOverflowXAutoAllowScrool() {
        return this.__isOverflowXAuto && this.__overflowCords.width < 0
    }

    get __isOverflowYAutoAllowScrool() {
        return this.__isOverflowYAuto && this.__overflowCords.height < 0
    }

    get __isOverflowXScrollable() {
        return this.__isOverflowXScroll || this.__isOverflowXAutoAllowScrool
    }

    get __isOverflowYScrollable() {
        return this.__isOverflowYScroll || this.__isOverflowYAutoAllowScrool
    }

    get __isOverflowVisible() {
        return (
            this.overflow() === 'visible' &&
            this.overflowX() === 'visible' &&
            this.overflowY() === 'visible'
        )
    }

    bindTo(block: Block<any>, options: (keyof IBlockOptions)[]) {
        this.__bindOptions.push({ bindTo: block, options: options })
    }

    rotate(opt?: number): number {
        return this.__valueHandler(opt, 'rotate', 0)
    }

    __updateCordinatesByRot(radian: number) {
        this.#updateAllCornesByRot(radian)
        this.#updateAllResizableAreaCornesByRot(radian)
        this.#updateAllRotatableAreaCornesByRot(radian)
    }

    get __getTop() {
        return {
            x: Math.min(
                this.cornerTopLeft().x,
                this.cornerTopRight().x,
                this.cornerBottomLeft().x,
                this.cornerBottomRight().x
            ),
            y: Math.min(
                this.cornerTopLeft().y,
                this.cornerTopRight().y,
                this.cornerBottomLeft().y,
                this.cornerBottomRight().y
            ),
        }
    }

    get __getBottom() {
        return {
            x: Math.max(
                this.cornerTopLeft().x,
                this.cornerTopRight().x,
                this.cornerBottomLeft().x,
                this.cornerBottomRight().x
            ),
            y: Math.max(
                this.cornerTopLeft().y,
                this.cornerTopRight().y,
                this.cornerBottomLeft().y,
                this.cornerBottomRight().y
            ),
        }
    }

    get __getLeft() {
        return {
            x: Math.min(
                this.cornerTopLeft().x,
                this.cornerTopRight().x,
                this.cornerBottomLeft().x,
                this.cornerBottomRight().x
            ),
            y: Math.min(
                this.cornerTopLeft().y,
                this.cornerTopRight().y,
                this.cornerBottomLeft().y,
                this.cornerBottomRight().y
            ),
        }
    }

    get __getRight() {
        return {
            x: Math.max(
                this.cornerTopLeft().x,
                this.cornerTopRight().x,
                this.cornerBottomLeft().x,
                this.cornerBottomRight().x
            ),
            y: Math.max(
                this.cornerTopLeft().y,
                this.cornerTopRight().y,
                this.cornerBottomLeft().y,
                this.cornerBottomRight().y
            ),
        }
    }

    get __getRealWidth() {
        return this.__getRight.x - this.__getLeft.x
    }
    get __getRealHeight() {
        return this.__getBottom.y - this.__getTop.y
    }
    get __getRealCenterX() {
        return this.__getTop.x + this.__getRealWidth / 2
    }
    get __getRealCenterY() {
        return this.__getTop.y + this.__getRealHeight / 2
    }
    get __getRotateCornerX() {
        return (
            this.cornerTopRight().x +
            (this.cornerBottomRight().x - this.cornerTopRight().x) / 2
        )
    }
    get __getRotateCornerY() {
        return (
            this.cornerTopRight().y +
            (this.cornerBottomRight().y - this.cornerTopRight().y) / 2
        )
    }
    get __getRealRotate() {
        return Math.atan2(
            this.__getRotateCornerY - this.rotationCenterY(),
            this.__getRotateCornerX - this.rotationCenterX()
        )
    }

    #updateCornerbyRot(corner: string, diffR: number) {
        const cordsAreaCurrent = this.getOptionCurrentVal(corner)
        const cordsAreaCache = this.getOptionCacheVal(corner)
        const currentCords = this.__rotateCorners(
            cordsAreaCurrent.x,
            cordsAreaCurrent.y,
            diffR
        )
        const cacheCords = this.__rotateCorners(
            cordsAreaCache.x,
            cordsAreaCache.y,
            diffR
        )
        this.setOptionCurrentVal(corner, currentCords)
        this.setOptionCacheVal(corner, cacheCords)
    }

    #updateAllCornesByRot(radian: number) {
        this.#updateCornerbyRot('cornerTopLeft', radian)
        this.#updateCornerbyRot('cornerTopRight', radian)
        this.#updateCornerbyRot('cornerBottomLeft', radian)
        this.#updateCornerbyRot('cornerBottomRight', radian)
    }
    #updateAllResizableAreaCornesByRot(radian: number) {
        this.#updateCornerAreabyRot('hotResizableAreaTopLeft', radian)
        this.#updateCornerAreabyRot('hotResizableAreaTopRight', radian)
        this.#updateCornerAreabyRot('hotResizableAreaBottomLeft', radian)
        this.#updateCornerAreabyRot('hotResizableAreaBottomRight', radian)
        this.#updateCornerAreabyRot('hotResizableAreaTop', radian)
        this.#updateCornerAreabyRot('hotResizableAreaRight', radian)
        this.#updateCornerAreabyRot('hotResizableAreaLeft', radian)
        this.#updateCornerAreabyRot('hotResizableAreaBottom', radian)
    }
    #updateAllRotatableAreaCornesByRot(radian: number) {
        this.#updateCornerAreabyRot('hotRotatableAreaTopLeft', radian)
        this.#updateCornerAreabyRot('hotRotatableAreaTopRight', radian)
        this.#updateCornerAreabyRot('hotRotatableAreaBottomLeft', radian)
        this.#updateCornerAreabyRot('hotRotatableAreaBottomRight', radian)
    }

    #updateCornerAreabyRot(corner: string, diffR: number) {
        const cordsArea = this.getOptionCurrentVal(corner)
        const a = this.__rotateCorners(
            cordsArea.topLeft.x,
            cordsArea.topLeft.y,
            diffR
        )
        const b = this.__rotateCorners(
            cordsArea.topRight.x,
            cordsArea.topRight.y,
            diffR
        )
        const c = this.__rotateCorners(
            cordsArea.bottomLeft.x,
            cordsArea.bottomLeft.y,
            diffR
        )
        const d = this.__rotateCorners(
            cordsArea.bottomRight.x,
            cordsArea.bottomRight.y,
            diffR
        )
        this.setOptionCurrentVal(corner, {
            topLeft: a,
            topRight: b,
            bottomLeft: c,
            bottomRight: d,
        })
    }

    #updateAreaCords(
        corner: string,
        topLeft: XY,
        topRight: XY,
        bottomLeft: XY,
        bottomRight: XY
    ) {
        const cornerCords = this.getOptionCurrentVal(corner)
        this.setOptionCurrentVal(corner, {
            topLeft: {
                x: cornerCords.topLeft.x + topLeft.x,
                y: cornerCords.topLeft.y + topLeft.y,
            },
            topRight: {
                x: cornerCords.topRight.x + topRight.x,
                y: cornerCords.topRight.y + topRight.y,
            },
            bottomLeft: {
                x: cornerCords.bottomLeft.x + bottomLeft.x,
                y: cornerCords.bottomLeft.y + bottomLeft.y,
            },
            bottomRight: {
                x: cornerCords.bottomRight.x + bottomRight.x,
                y: cornerCords.bottomRight.y + bottomRight.y,
            },
        })
    }

    __rotateCorners(x: number, y: number, radian: number) {
        return rotateCordinates(
            x,
            y,
            this.rotationCenterX(),
            this.rotationCenterY(),
            radian
        )
    }

    animate(keyframes: AnimationKeyframe, callback?: CallbackAnimator) {
        const dumyFunc = () => {}
        const {
            id,
            autoStart,
            iterations,
            delay,
            direction,
            duration,
            easing,
            iterationStart,
            playbackRate,
            onFinish,
            composite,
            ...options
        } = keyframes
        const animationId = id || String(new Date().getTime())

        this.#keyframeIterations[animationId] = {
            id: animationId,
            isRunning: true,
            isFinished: false,
            isReverse: false,
            iter: 0,
            startTime: 0,
            currentOptIdx: 0,
            maxKeyframeLen: 0,

            autoStart: autoStart || false,
            iterations: iterations || Infinity,
            delay: delay || 0,
            direction: direction || 'normal',
            composite: composite || 'replace',
            duration: duration || 1000,
            easing: easing || 'linear',
            iterationStart: iterationStart || 0.0,
            playbackRate: playbackRate || 1,
            onFinish: onFinish || dumyFunc,
        }
        this.#keyframeIterations[animationId]['keyframes'] = {}

        const keyframeIterations = this.#keyframeIterations[animationId]
        let maxBreakPointLen = 0
        for (let [key, keyframe] of Object.entries(options)) {
            const obj = getPrototype(this, key)
            if (!obj) continue
            let validKeyframe = keyframe
            const keyframes = keyframe.map((i: any) =>
                this.__unitConverter({ val: i })
            )
            // fix type issue
            let category: any = typeof validKeyframe
            if (
                typeof keyframes[0] === 'string' &&
                (keyframes as any)[0].includes('rgba')
            ) {
                validKeyframe = keyframes.map((i: any) => rgbaToArray(i))
                category = 'color'
            }
            if (
                keyframeIterations.direction === 'reverse' ||
                keyframeIterations.direction === 'alternate-reverse'
            )
                validKeyframe.reverse()

            let iterDirection = 1

            const idx = Math.round(
                keyframeIterations.iterationStart * (validKeyframe.length - 1)
            )

            let currentVal: RGBA | number = 0

            let nextValue = validKeyframe[idx]
            if (validKeyframe[idx + 1] !== undefined)
                nextValue = validKeyframe[idx + 1]
            else if (validKeyframe[idx - 1] !== undefined)
                nextValue = validKeyframe[idx - 1]

            if (category === 'color') {
                const R =
                    validKeyframe[idx][0] +
                    nextValue[0] * keyframeIterations.iterationStart
                const G =
                    validKeyframe[idx][1] +
                    nextValue[1] * keyframeIterations.iterationStart

                const B =
                    validKeyframe[idx][2] +
                    nextValue[2] * keyframeIterations.iterationStart
                const A =
                    validKeyframe[idx][3] +
                    nextValue[3] * keyframeIterations.iterationStart
                currentVal = [R, G, B, A]
            } else {
                currentVal =
                    validKeyframe[idx] +
                    nextValue * keyframeIterations.iterationStart
            }

            if (idx === validKeyframe.length - 1) iterDirection *= -1

            if (validKeyframe.length > maxBreakPointLen)
                maxBreakPointLen = (validKeyframe as any).length as number
                // fix type issue
            ;(this.#keyframeIterations[animationId]['keyframes'] as any)[key] =
                {
                    currentIdx: idx,
                    currentVal: currentVal,
                    breakPoints: validKeyframe,
                    iterDirection: iterDirection,
                    category: category,
                    invoker: obj,
                }
        }
        this.#keyframeIterations[animationId]['maxKeyframeLen'] =
            maxBreakPointLen
        // console.log(keyframeIterations)
        const animator: Animator = (timestamp: number) => {
            const anime = this.#keyframeIterations[animationId]
            if (anime.autoStart === false || !anime.keyframes) return
            let isFinished = anime.isFinished

            if (anime.delay <= timestamp && !isFinished && anime.isRunning) {
                const playBackRate = anime.playbackRate
                const direction = anime.direction
                const currentOptIdx = anime.currentOptIdx

                if (!anime.startTime) {
                    anime.iter -= 1
                    anime.startTime = timestamp + anime.delay
                }
                if (
                    anime.iterations !== Infinity &&
                    anime.iter === anime.iterations
                ) {
                    isFinished = true
                    this.animationFinish(animationId)
                    if (anime.onFinish) anime.onFinish()
                }

                const easing = easingHanndler(anime.easing)(
                    clamp((timestamp - anime.startTime) / anime.duration, 0, 1),
                    1 / anime.duration
                )
                if (
                    easing === 1 &&
                    (anime.direction == 'alternate' ||
                        anime.direction == 'alternate-reverse')
                ) {
                    anime.startTime = timestamp
                }
                if (callback) callback(timestamp, easing)

                for (let [idx, [key, value]] of Object.entries(
                    Object.entries(anime.keyframes)
                )) {
                    if (
                        anime.composite == 'replace' &&
                        currentOptIdx !== Number(idx)
                    )
                        continue
                    let valueT = value as any

                    if (isFinished) {
                        let lastIdx = valueT.breakPoints.length - 1
                        if (
                            anime.direction === 'reverse' ||
                            anime.direction === 'alternate-reverse'
                        )
                            lastIdx = 0

                        valueT.invoker?.value.call(
                            this,
                            valueT.breakPoints[lastIdx]
                        )
                        continue
                    }
                    let currentIdx = valueT.currentIdx
                    let iterDirection = valueT.iterDirection
                    let nextIdx = currentIdx + iterDirection

                    let startVal = valueT.breakPoints[currentIdx]
                    let endVal = valueT.breakPoints[nextIdx]
                    let currentVal = valueT.currentVal

                    let statement = null

                    if (valueT.category === 'color') {
                        valueT.invoker?.value.call(
                            this,
                            rgbaRepresenter(currentVal)
                        )
                        const cancelOutR =
                            startVal[0] < endVal[0] ? startVal[0] : endVal[0]
                        const cancelOutG =
                            startVal[1] < endVal[1] ? startVal[1] : endVal[1]
                        const cancelOutB =
                            startVal[2] < endVal[2] ? startVal[2] : endVal[2]
                        const cancelOutA =
                            startVal[3] < endVal[3] ? startVal[3] : endVal[3]

                        const R =
                            (lerp(startVal[0], endVal[0], easing) -
                                cancelOutR) *
                                playBackRate +
                            cancelOutR
                        const G =
                            (lerp(startVal[1], endVal[1], easing) -
                                cancelOutG) *
                                playBackRate +
                            cancelOutG
                        const B =
                            (lerp(startVal[2], endVal[2], easing) -
                                cancelOutB) *
                                playBackRate +
                            cancelOutB
                        const A =
                            (lerp(startVal[3], endVal[3], easing) -
                                cancelOutA) *
                                playBackRate +
                            cancelOutA

                        currentVal = [
                            currentVal[0] + R,
                            currentVal[1] + G,
                            currentVal[2] + B,
                            currentVal[3] + A,
                        ]
                        statement =
                            (currentVal[0] > endVal[0] &&
                                currentVal[1] > endVal[1] &&
                                currentVal[2] > endVal[2] &&
                                currentVal[3] > endVal[3]) ||
                            (currentVal[0] < endVal[0] &&
                                currentVal[1] < endVal[1] &&
                                currentVal[2] < endVal[2] &&
                                currentVal[3] < endVal[3])
                        // statement =
                        //     ((startVal[0] <= endVal[0] &&
                        //         currentVal[0] >= endVal[0]) ||
                        //         (startVal[0] >= endVal[0] &&
                        //             currentVal[0] <= endVal[0])) &&
                        //     ((startVal[1] <= endVal[1] &&
                        //         currentVal[1] >= endVal[1]) ||
                        //         (startVal[1] >= endVal[1] &&
                        //             currentVal[1] <= endVal[1])) &&
                        //     ((startVal[2] <= endVal[2] &&
                        //         currentVal[2] >= endVal[2]) ||
                        //         (startVal[2] >= endVal[2] &&
                        //             currentVal[2] <= endVal[2])) &&
                        //     ((startVal[3] <= endVal[3] &&
                        //         currentVal[3] >= endVal[3]) ||
                        //         (startVal[3] >= endVal[3] &&
                        //             currentVal[3] <= endVal[3]))

                        // statement =
                        //     (startVal[0] >= endVal[0] &&
                        //         currentVal[0] <= endVal[0]) ||
                        //     (startVal[0] <= endVal[0] &&
                        //         currentVal[0] >= endVal[0])

                        //    Block.ts:3056 (4) [255, 0, 0, 1] (4) [0, 0, 255, 1] (4) [23079.564632861664, 0, 74075.43536713833, 381]
                    } else {
                        valueT.invoker?.value.call(this, currentVal)
                        const cancelOut = startVal < endVal ? startVal : endVal
                        currentVal =
                            (lerp(startVal, endVal, easing) - cancelOut) *
                                playBackRate +
                            cancelOut
                        statement =
                            (startVal <= endVal && currentVal >= endVal) ||
                            (startVal >= endVal && currentVal <= endVal)
                    }
                    if (statement) {
                        currentIdx += iterDirection
                        const lastIdx = valueT.breakPoints.length - 1
                        if (currentIdx === lastIdx) {
                            anime.currentOptIdx += 1
                            if (anime.composite === 'accumulate') {
                                for (const [idx, val] of Object.entries(
                                    valueT.breakPoints
                                )) {
                                    if (valueT.category === 'color') {
                                        valueT.breakPoints[idx][0] =
                                            (val as RGBA)[0] +
                                            valueT.breakPoints[lastIdx][0]
                                        valueT.breakPoints[idx][1] =
                                            (val as RGBA)[1] +
                                            valueT.breakPoints[lastIdx][1]
                                        valueT.breakPoints[idx][2] =
                                            (val as RGBA)[2] +
                                            valueT.breakPoints[lastIdx][2]
                                        valueT.breakPoints[idx][3] =
                                            (val as RGBA)[3] +
                                            valueT.breakPoints[lastIdx][3]
                                    } else {
                                        valueT.breakPoints[idx] =
                                            val + valueT.breakPoints[lastIdx]
                                    }
                                }
                            }
                        }
                        if (
                            nextIdx === valueT.breakPoints.length - 1 ||
                            nextIdx === 0
                        ) {
                            if (
                                direction === 'normal' ||
                                direction === 'reverse'
                            ) {
                                currentIdx = 0
                                currentVal = valueT.breakPoints[0]
                            } else if (
                                direction == 'alternate' ||
                                direction == 'alternate-reverse'
                            ) {
                                valueT.iterDirection *= -1
                            }
                        }
                        anime.startTime = timestamp
                        valueT.currentIdx = currentIdx
                    }

                    valueT.currentVal = currentVal
                }

                if (
                    anime.startTime &&
                    anime.startTime === timestamp + anime.delay
                ) {
                    anime.iter += 1
                }

                if (
                    anime.currentOptIdx >=
                    Object.entries(anime.keyframes).length
                )
                    anime.currentOptIdx = 0
            }
        }
        this.animationHandler(animator)
        return animationId
    }
    animationHandler(animator: Animator) {
        if (!this.canvas) this.__animations.push(animator)
        else if (this.nodeId !== undefined)
            this.canvas.registerAnimation(this.nodeId, animator)
    }

    animationStart(animationId: AnimationId) {
        const anime = this.#keyframeIterations[animationId]
        anime['isFinished'] = false
        anime['autoStart'] = true
        anime['isRunning'] = true
        anime.iter = 0
        anime.startTime = 0
    }
    animationStop(animationId: AnimationId) {
        this.#keyframeIterations[animationId]['isRunning'] = false
        this.#keyframeIterations[animationId]['autoStart'] = false
    }
    animationFinish(animationId: AnimationId) {
        this.#keyframeIterations[animationId]['isFinished'] = true
        this.#keyframeIterations[animationId]['isRunning'] = false
        this.#keyframeIterations[animationId]['autoStart'] = false
    }
    animationReverse(animationId: AnimationId) {
        const anime = this.#keyframeIterations[animationId]
        anime['isReverse'] = true
        if (anime['direction'] === 'normal') anime['direction'] = 'reverse'
        else if (anime['direction'] === 'reverse') anime['direction'] = 'normal'
        else if (anime['direction'] === 'alternate')
            anime['direction'] = 'alternate-reverse'
        else if (anime['direction'] === 'alternate-reverse')
            anime['direction'] = 'alternate'
        for (const [key, value] of anime.keyframes as any) {
            ;(anime['keyframes'] as any)[key].breakPoints =
                value.breakPoints.reverse()
        }
    }
    animationDelay(animationId: AnimationId, value: Delay) {
        this.#keyframeIterations[animationId]['delay'] = value
    }
    animationPlaybackRate(animationId: AnimationId, value: PlaybackRate) {
        this.#keyframeIterations[animationId]['playbackRate'] = value
    }
    animationDirection(animationId: AnimationId, value: Direction) {
        this.#keyframeIterations[animationId]['direction'] = value
    }
    animationDuration(animationId: AnimationId, value: Duration) {
        this.#keyframeIterations[animationId]['duration'] = value
    }
    animationIterationStart(animationId: AnimationId, value: IterationStart) {
        this.#keyframeIterations[animationId]['iterationStart'] = value
    }
    animationIterations(animationId: AnimationId, value: Iterations) {
        this.#keyframeIterations[animationId]['iterations'] = value
    }
    animationAutoStart(animationId: AnimationId, value: AutoStart) {
        this.#keyframeIterations[animationId]['autoStart'] = value
    }

    checkInBound(event: MouseEvent): boolean {
        const { x, y } = this.canvas?.getCursorPosition(event)!
        let topLeft = this.cornerTopLeft()
        let topRight = this.cornerTopRight()
        let bottomLeft = this.cornerBottomLeft()
        let bottomRight = this.cornerBottomRight()
        if (this.__isVerticalFlipped !== this.__isHorizontalFlipped) {
            if (this.__isVerticalFlipped) {
                topLeft = this.cornerBottomLeft()
                topRight = this.cornerBottomRight()
                bottomLeft = this.cornerTopLeft()
                bottomRight = this.cornerTopRight()
            } else if (this.__isHorizontalFlipped) {
                topLeft = this.cornerTopRight()
                topRight = this.cornerTopLeft()
                bottomLeft = this.cornerBottomRight()
                bottomRight = this.cornerBottomLeft()
            }
        }
        let inBound = checkInBound(
            x,
            y,
            topLeft.x,
            topLeft.y,
            topRight.x,
            topRight.y,
            bottomLeft.x,
            bottomLeft.y,
            bottomRight.x,
            bottomRight.y
        )
        if (inBound) this.registerZIndex({ in: this.zIndex() })
        else this.registerZIndex({ out: this.zIndex() })
        return inBound
    }

    registerZIndex(inOut: inOut) {
        if (this.selectable()) this.canvas?.registerZIndex(inOut)
    }

    get ImFirst() {
        const zIndex = this.zIndex()
        if (zIndex !== undefined) return this.canvas?.whoIsTheFirst(zIndex)
    }
    get inBound() {
        return this.canvas?.inBoundBlock(this)
    }
    invokeChange() {
        this.canvas?.invokeChange()
    }

    contextMenu(_func: (event: MouseEvent) => void) {
        const out = (event: MouseEvent) => {
            if (this.checkInBound(event) && this.ImFirst) {
                _func(event)
                this.invokeChange()
            }
        }
        this.eventHandler<MouseEvent>('contextmenu', out)
    }

    click(_func: (event: MouseEvent) => void) {
        const out = (event: MouseEvent) => {
            if (this.checkInBound(event) && this.ImFirst) {
                _func(event)
                this.invokeChange()
            }
        }
        this.eventHandler<MouseEvent>('click', out)
    }

    dblclick(_func: (event: MouseEvent) => void) {
        const out = (event: MouseEvent) => {
            if (this.checkInBound(event) && this.ImFirst) {
                _func(event)
                this.invokeChange()
            }
        }
        this.eventHandler<MouseEvent>('dblclick', out)
    }

    mousedown(_func: (event: MouseEvent) => void) {
        const out = (event: MouseEvent) => {
            if (this.checkInBound(event) && this.ImFirst) {
                _func(event)
                this.invokeChange()
            }
        }
        this.eventHandler<MouseEvent>('mousedown', out)
    }

    mouseup(_func: (event: MouseEvent) => void) {
        const out = (event: MouseEvent) => {
            if (this.checkInBound(event) && this.ImFirst) {
                _func(event)
                this.invokeChange()
            }
        }
        this.eventHandler<MouseEvent>('mouseup', out)
    }

    mousemove(_func: (event: MouseEvent) => void) {
        const out = (event: MouseEvent) => {
            if (this.checkInBound(event) && this.ImFirst) {
                _func(event)
                this.invokeChange()
            }
        }
        this.eventHandler<MouseEvent>('mousemove', out)
    }

    mouseenter(_func: (event: MouseEvent) => void) {
        let isMouseEnter = false
        const enter = (event: MouseEvent) => {
            if (this.checkInBound(event)) {
                if (this.ImFirst && !isMouseEnter) {
                    _func(event)
                    this.invokeChange()
                    isMouseEnter = true
                }
            } else isMouseEnter = false
        }
        this.eventHandler<MouseEvent>('mousemove', enter)
    }

    mouseleave(_func: (event: MouseEvent) => void) {
        let isMouseLeave = false
        const leave = (event: MouseEvent) => {
            if (!this.checkInBound(event)) {
                if (!this.ImFirst && !isMouseLeave) {
                    _func(event)
                    this.invokeChange()
                    isMouseLeave = true
                }
            } else isMouseLeave = false
        }
        this.eventHandler<MouseEvent>('mousemove', leave)
    }
    /** @Todo
     mouseover and mouseout
     has little bug when two chidls cross each other there are isMouse over happens to be true but one is under so check in bound checks it under the higher z index element
    */
    mouseover(_func: (event: MouseEvent) => void) {
        const mouseOver: any = {}
        let isMouseOver = false
        let inBound = false
        const over = (event: MouseEvent) => {
            this.listAllChilds((b: Block) => {
                if (mouseOver[b.nodeId!] == undefined)
                    mouseOver[b.nodeId!] = b.checkInBound(event)

                if (!b.checkInBound(event)) {
                    if (mouseOver[b.nodeId!]) {
                        mouseOver[b.nodeId!] = false
                        isMouseOver = false
                    }
                } else if (mouseOver[b.nodeId!] === false) {
                    mouseOver[b.nodeId!] = true
                    isMouseOver = true
                }
            })
            if (this.checkInBound(event)) {
                if (!inBound) {
                    inBound = true
                    isMouseOver = true
                }
            } else {
                inBound = false
                isMouseOver = false
            }

            if (isMouseOver) {
                _func(event)
                this.invokeChange()
                isMouseOver = false
            }
        }
        this.eventHandler<MouseEvent>('mousemove', over)
    }
    mouseout(_func: (event: MouseEvent) => void) {
        const mouseLeave: any = {}
        let isMouseLeave = false
        let outBound = false
        const out = (event: MouseEvent) => {
            if (!this.checkInBound(event)) {
                if (!outBound) {
                    outBound = true
                    isMouseLeave = true
                }
            } else {
                outBound = false
                isMouseLeave = false
            }
            this.listAllChilds((b: Block) => {
                if (mouseLeave[b.nodeId!] == undefined)
                    mouseLeave[b.nodeId!] = b.checkInBound(event)
                if (b.checkInBound(event)) {
                    if (mouseLeave[b.nodeId!]) {
                        mouseLeave[b.nodeId!] = false
                        isMouseLeave = true
                    }
                } else if (mouseLeave[b.nodeId!] == false) {
                    mouseLeave[b.nodeId!] = true
                    isMouseLeave = true
                }
            })

            if (isMouseLeave) {
                _func(event)
                this.invokeChange()
                isMouseLeave = false
            }
        }
        this.eventHandler<MouseEvent>('mousemove', out)
    }

    keydown(_func: (event: KeyboardEvent) => void) {
        const down = (event: KeyboardEvent) => {
            if (this.canvas?.isFocused) {
                event.preventDefault()
                _func(event)
                this.invokeChange()
            }
        }
        this.eventHandler<KeyboardEvent>('keydown', down)
    }

    keyup(_func: (event: KeyboardEvent) => void) {
        const up = (event: KeyboardEvent) => {
            if (this.canvas?.isFocused) {
                event.preventDefault()
                _func(event)
                this.invokeChange()
            }
        }
        this.eventHandler<KeyboardEvent>('keyup', up)
    }

    wheel(_func: (event: WheelEvent) => void) {
        const wheel = (event: WheelEvent) => {
            if (this.canvas?.isFocused) {
                event.preventDefault()
                _func(event)
                this.invokeChange()
            }
        }
        this.eventHandler<WheelEvent>('wheel', wheel)
    }

    eventHandler<E extends Event>(
        type: string,
        func: CustomEvent<E>,
        identify?: string
    ) {
        if (!this.__events[type])
            this.__events[type] = { funcs: [], identified: [] }
        if (identify) {
            if (this.__events[type]['identified'].includes(identify)) return
            else this.__events[type]['identified'].push(identify)
        }
        if (this.canvas)
            this.canvas?.registerEvent(
                type,
                func as CustomEvent<Event>,
                this.zIndex() || this.nodeId || 1
            )
        else this.__events[type]['funcs'].push(func)
    }
    selectable(opt?: boolean): boolean {
        const selectable = this.__valueHandler(opt, 'selectable', false)
        if (!selectable) return false

        const click = (e: MouseEvent) => {
            const { x, y } = this.canvas?.getCursorPosition(e)!
            let inBound
            const cacheSelected = this.__runningEvents.selected
            if (this.__runningEvents.selected) {
                inBound = checkInBound(
                    x,
                    y,
                    this.cornerTopLeft().x,
                    this.cornerTopLeft().y,
                    this.cornerTopRight().x,
                    this.cornerTopRight().y,
                    this.cornerBottomLeft().x,
                    this.cornerBottomLeft().y,
                    this.cornerBottomRight().x,
                    this.cornerBottomRight().y
                )
            } else inBound = this.checkInBound(e)

            if (inBound) {
                this.registerZIndex({ in: this.zIndex() })
                if (this.ImFirst) this.__runningEvents.selected = true
            } else {
                this.registerZIndex({ out: this.zIndex() })
                this.__runningEvents.selected = false
            }
            if (cacheSelected !== this.__runningEvents.selected)
                this.invokeChange()
        }
        this.eventHandler('click', click, 'selectable')
        return selectable
    }

    onRotate(opt?: (event: MouseEvent) => void) {
        const rotateE = this.__valueHandler<
            (event: MouseEvent) => void,
            ((event: MouseEvent) => void) | undefined
        >(opt, 'onRotate', undefined)
        return rotateE
    }

    rotatable(opt?: boolean) {
        const rotatable = this.__valueHandler(opt, 'rotatable', false)
        if (!rotatable) return rotatable

        let topMove = false
        let leftMove = false
        const beforeValues: any = {}
        let inBound = false

        const mousedown = (event: MouseEvent) => {
            if (this.__runningEvents.resize || this.__runningEvents.drag) return
            if (inBound) {
                this.__runningEvents.rotate = true
                beforeValues[this.nodeId!] = {
                    rotate: this.rotate(),
                }
                this.registerZIndex({ in: this.zIndex() })
            } else this.registerZIndex({ out: this.zIndex() })
        }

        const mousemove = (event: MouseEvent) => {
            if (
                !this.__runningEvents.selected ||
                this.__runningEvents.resize ||
                this.__runningEvents.drag
            )
                return

            let { x, y } = this.canvas?.getCursorPosition(event)!
            if (!this.__runningEvents.rotate) {
                let cursor: string | undefined = undefined
                if (
                    this.__checkCornersInBound(
                        x,
                        y,
                        'hotRotatableAreaTopLeft'
                    ) &&
                    this.rotatableTopLeft()
                ) {
                    cursor = 'cell'
                    topMove = true
                    leftMove = true
                } else if (
                    this.__checkCornersInBound(
                        x,
                        y,
                        'hotRotatableAreaTopRight'
                    ) &&
                    this.rotatableTopRight()
                ) {
                    cursor = 'cell'
                    topMove = true
                    leftMove = false
                } else if (
                    this.__checkCornersInBound(
                        x,
                        y,
                        'hotRotatableAreaBottomLeft'
                    ) &&
                    this.rotatableBottomLeft()
                ) {
                    cursor = 'cell'
                    topMove = false
                    leftMove = true
                } else if (
                    this.__checkCornersInBound(
                        x,
                        y,
                        'hotRotatableAreaBottomRight'
                    ) &&
                    this.rotatableBottomRight()
                ) {
                    cursor = 'cell'
                    topMove = false
                    leftMove = false
                }
                if (cursor) {
                    inBound = true
                    this.canvas?.changeCursor(cursor)
                } else {
                    inBound = false
                    if (
                        this.canvas?.currentCursor &&
                        ![
                            'ew-resize',
                            'ns-resize',
                            'nwse-resize',
                            'nesw-resize',
                        ].includes(this.canvas?.currentCursor)
                    ) {
                        this.canvas?.changeCursor(cursor)
                    }
                }
            }

            if (this.__runningEvents.rotate) {
                this.registerZIndex({ in: this.zIndex() })
                if (this.ImFirst || this.__runningEvents.rotate) {
                    let radian = Math.atan2(
                        y - this.rotationCenterY(),
                        x - this.rotationCenterX()
                    )
                    let currentRotate = this.getOptionCurrentVal('rotate')
                    if (topMove && leftMove) {
                        const topLeftCorner = this.cornerTopLeft()
                        const topLeft = this.__rotateCorners(
                            topLeftCorner.x,
                            topLeftCorner.y,
                            -currentRotate
                        )
                        currentRotate =
                            radian -
                            Math.atan2(
                                topLeft.y - this.__getRealCenterY,
                                topLeft.x - this.__getRealCenterX
                            )
                    } else if (topMove && !leftMove) {
                        const topRightCorner = this.cornerTopRight()
                        const topRight = this.__rotateCorners(
                            topRightCorner.x,
                            topRightCorner.y,
                            -currentRotate
                        )
                        currentRotate =
                            radian -
                            Math.atan2(
                                topRight.y - this.__getRealCenterY,
                                topRight.x - this.__getRealCenterX
                            )
                    } else if (!topMove && !leftMove) {
                        const bottomRightCorner = this.cornerBottomRight()
                        const bottomRight = this.__rotateCorners(
                            bottomRightCorner.x,
                            bottomRightCorner.y,
                            -currentRotate
                        )
                        currentRotate =
                            radian -
                            Math.atan2(
                                bottomRight.y - this.__getRealCenterY,
                                bottomRight.x - this.__getRealCenterX
                            )
                    } else if (!topMove && leftMove) {
                        const bottomLeftCorner = this.cornerBottomLeft()
                        const bottomLeft = this.__rotateCorners(
                            bottomLeftCorner.x,
                            bottomLeftCorner.y,
                            -currentRotate
                        )
                        currentRotate =
                            radian -
                            Math.atan2(
                                bottomLeft.y - this.__getRealCenterY,
                                bottomLeft.x - this.__getRealCenterX
                            )
                    }
                    this.setOptionCurrentVal('rotate', currentRotate)
                    this.onRotate()?.(event)
                    this.invokeChange()
                }
            }
        }

        const mouseup = () => {
            if (this.__runningEvents.rotate) {
                this.__runningEvents.rotate = false
                this.canvas?.changeCursor('auto')
                inBound = false
                const dummy: any = {}
                dummy[this.nodeId!] = { rotate: this.rotate() }
                this.canvas?.takeSnapshot(beforeValues, dummy)
            }
        }
        this.eventHandler('mousedown', mousedown, 'rotatableDown')
        this.eventHandler('mousemove', mousemove, 'rotatableMove')
        this.eventHandler('mouseup', mouseup, 'rotatableUp')
        return rotatable
    }

    onResize(opt?: (event: MouseEvent) => void) {
        const resizeE = this.__valueHandler<
            (event: MouseEvent) => void,
            ((event: MouseEvent) => void) | undefined
        >(opt, 'onResize', undefined)
        return resizeE
    }

    resizable(opt?: boolean): boolean {
        const resizable = this.__valueHandler(opt, 'resizable', false)
        if (!resizable) return resizable
        let initCords = { x: 0, y: 0 }
        let beforeCords = { x: 0, y: 0 }
        let beforeValues: any = {}
        let topResize = false
        let leftResize = false
        let bottomResize = false
        let rightResize = false
        let inBound = false
        const mousedown = (event: MouseEvent) => {
            if (this.__runningEvents.rotate) return
            beforeCords = { x: 0, y: 0 }
            if (inBound) {
                initCords = this.canvas?.getCursorPosition(event)!
                this.__runningEvents.resize = true
                beforeValues[this.nodeId!] = {
                    x: this.x(),
                    y: this.y(),
                    width: this.width(),
                    height: this.height(),
                }
                this.registerZIndex({ in: this.zIndex() })
            } else this.registerZIndex({ out: this.zIndex() })
        }
        const mousemove = (event: MouseEvent) => {
            if (!this.__runningEvents.selected || this.__runningEvents.rotate)
                return

            const { x, y } = this.canvas?.getCursorPosition(event)!
            if (!this.__runningEvents.resize) {
                let cursor: string | undefined = undefined
                bottomResize = rightResize = topResize = leftResize = false
                if (
                    this.resizableLeft() &&
                    (this.__checkCornersInBound(x, y, 'hotResizableAreaLeft') ||
                        this.__checkCornersInBoundReverseX(
                            x,
                            y,
                            'hotResizableAreaLeft'
                        ))
                ) {
                    leftResize = true
                    cursor = 'ew-resize'
                } else if (
                    this.resizableRight() &&
                    (this.__checkCornersInBound(
                        x,
                        y,
                        'hotResizableAreaRight'
                    ) ||
                        this.__checkCornersInBoundReverseX(
                            x,
                            y,
                            'hotResizableAreaRight'
                        ))
                ) {
                    rightResize = true
                    cursor = 'ew-resize'
                } else if (
                    this.resizableTop() &&
                    (this.__checkCornersInBound(x, y, 'hotResizableAreaTop') ||
                        this.__checkCornersInBoundReverseY(
                            x,
                            y,
                            'hotResizableAreaTop'
                        ))
                ) {
                    topResize = true
                    cursor = 'ns-resize'
                } else if (
                    this.resizableBottom() &&
                    (this.__checkCornersInBound(
                        x,
                        y,
                        'hotResizableAreaBottom'
                    ) ||
                        this.__checkCornersInBoundReverseY(
                            x,
                            y,
                            'hotResizableAreaBottom'
                        ))
                ) {
                    cursor = 'ns-resize'
                    bottomResize = true
                }

                if (
                    this.resizableTopLeft() &&
                    this.__checkCornersInBound(x, y, 'hotResizableAreaTopLeft')
                ) {
                    topResize = true
                    leftResize = true
                    cursor = 'nwse-resize'
                }
                if (
                    this.resizableTopRight() &&
                    this.__checkCornersInBound(x, y, 'hotResizableAreaTopRight')
                ) {
                    topResize = true
                    rightResize = true
                    cursor = 'nesw-resize'
                }
                if (
                    this.resizableBottomLeft() &&
                    this.__checkCornersInBound(
                        x,
                        y,
                        'hotResizableAreaBottomLeft'
                    )
                ) {
                    bottomResize = true
                    leftResize = true
                    cursor = 'nesw-resize'
                }
                if (
                    this.resizableBottomRight() &&
                    this.__checkCornersInBound(
                        x,
                        y,
                        'hotResizableAreaBottomRight'
                    )
                ) {
                    bottomResize = true
                    rightResize = true
                    cursor = 'nwse-resize'
                }
                if (cursor) {
                    inBound = true
                    const horizontalFlipped = this.__isHorizontalFlipped
                    const verticalFlipped = this.__isVerticalFlipped
                    if (
                        (horizontalFlipped || verticalFlipped) &&
                        horizontalFlipped !== verticalFlipped
                    ) {
                        if (cursor === 'nwse-resize') cursor = 'nesw-resize'
                        else if (cursor === 'nesw-resize')
                            cursor = 'nwse-resize'
                    }
                    cursor = chooseBoxCursorInAgle(cursor, this.__getRealRotate)
                    this.canvas?.changeCursor(cursor)
                } else {
                    inBound = false
                    if (this.canvas?.currentCursor !== 'cell') {
                        this.canvas?.changeCursor(cursor)
                    }
                }
            }
            if (this.__runningEvents.resize) {
                this.registerZIndex({ in: this.zIndex() })
                if (this.ImFirst || this.__runningEvents.resize) {
                    let diffX = x - initCords.x
                    let diffY = y - initCords.y
                    if (diffX !== 0 || diffY !== 0) {
                        const cacheRotate = this.getOptionCacheVal('rotate')
                        const horizontalFlipped = this.__isHorizontalFlipped
                        let diffW = diffX - beforeCords.x
                        let diffH = diffY - beforeCords.y
                        let angle = this.__getRealRotate
                        let currentX = this.x()
                        let currentY = this.y()
                        let currentWidth = this.width()
                        let currentHeight = this.height()
                        let rotationCenterX = this.rotationCenterX()
                        let rotationCenterY = this.rotationCenterY()
                        this.#updateAllCornesByRot(-cacheRotate)
                        let cornerTopLeft = this.cornerTopLeft()
                        let cornerTopRight = this.cornerTopRight()
                        let cornerBottomLeft = this.cornerBottomLeft()
                        let cornerBottomRight = this.cornerBottomRight()

                        if (leftResize || rightResize) {
                            let Cos = Math.cos(angle)
                            let Sin = Math.sin(angle)
                            if (horizontalFlipped) {
                                Cos = -Cos
                                Sin = -Sin
                            }
                            const increaseX = Cos * diffW + Sin * diffH
                            const cx = increaseX * Cos
                            const cy = increaseX * Sin
                            const increaseW = increaseX * (leftResize ? 1 : -1)
                            const widthR = currentWidth - increaseW
                            if (
                                widthR < this.maxWidth() &&
                                ((widthR > this.minWidth() &&
                                    !this.horizontalFlipResize()) ||
                                    this.horizontalFlipResize())
                            ) {
                                currentY += cy / 2
                                currentWidth = widthR
                                rotationCenterX += cx / 2
                                rotationCenterY += cy / 2
                                if (leftResize) {
                                    const adjustX = ((increaseX + cx) /
                                        2) as any
                                    cornerTopLeft.x += increaseX
                                    cornerBottomLeft.x += increaseX
                                    currentX += adjustX
                                } else if (rightResize) {
                                    const adjustX = ((increaseX - cx) /
                                        2) as any
                                    currentX -= adjustX
                                    cornerTopRight.x += increaseX
                                    cornerBottomRight.x += increaseX
                                }
                            }
                        }
                        if (topResize || bottomResize) {
                            let Cos = Math.cos(-angle)
                            let Sin = Math.sin(-angle)
                            if (horizontalFlipped) {
                                Cos = -Cos
                                Sin = -Sin
                            }
                            const increaseY = Sin * diffW + Cos * diffH
                            const cx = increaseY * Sin
                            const cy = increaseY * Cos
                            const increaseH = increaseY * (topResize ? 1 : -1)
                            const heightR = currentHeight - increaseH
                            if (
                                heightR < this.maxHeight() &&
                                ((heightR > this.minHeight() &&
                                    !this.verticalFlipResize()) ||
                                    this.verticalFlipResize())
                            ) {
                                currentX += cx / 2
                                currentHeight = heightR
                                rotationCenterX += cx / 2
                                rotationCenterY += cy / 2
                                if (topResize) {
                                    const adjustY = ((increaseY + cy) /
                                        2) as any
                                    currentY += adjustY
                                    cornerTopLeft.y += increaseY
                                    cornerTopRight.y += increaseY
                                } else if (bottomResize) {
                                    const adjustY = (increaseY - cy) / 2
                                    currentY -= adjustY
                                    cornerBottomRight.y += increaseY
                                    cornerBottomLeft.y += increaseY
                                }
                            }
                        }
                        this.setOptionCurrentVal('cornerTopLeft', cornerTopLeft)
                        this.setOptionCurrentVal(
                            'cornerTopRight',
                            cornerTopRight
                        )
                        this.setOptionCurrentVal(
                            'cornerBottomLeft',
                            cornerBottomLeft
                        )
                        this.setOptionCurrentVal(
                            'cornerBottomRight',
                            cornerBottomRight
                        )
                        this.#updateAllCornesByRot(cacheRotate)
                        this.setOptionCurrentVal('x', currentX)
                        this.setOptionCurrentVal('y', currentY)
                        this.setOptionCurrentVal('width', currentWidth)
                        this.setOptionCurrentVal('height', currentHeight)
                        this.setOptionCacheVal('x', currentX)
                        this.setOptionCacheVal('y', currentY)
                        this.setOptionCacheVal('width', currentWidth)
                        this.setOptionCacheVal('height', currentHeight)
                        this.setOptionCurrentVal(
                            'rotationCenterX',
                            rotationCenterX
                        )
                        this.setOptionCurrentVal(
                            'rotationCenterY',
                            rotationCenterY
                        )
                        beforeCords.x = diffX
                        beforeCords.y = diffY
                        this.onResize()?.(event)
                        this.invokeChange()
                    }
                }
            }
        }
        const mouseup = () => {
            if (this.__runningEvents.resize) {
                this.canvas?.changeCursor('auto')
                this.__runningEvents.resize = false
                if (beforeCords.x !== 0 || beforeCords.y !== 0) {
                    const after: any = {}
                    after[this.nodeId!] = {
                        x: this.x(),
                        y: this.y(),
                        width: this.width(),
                        height: this.height(),
                    }
                    this.canvas?.takeSnapshot(beforeValues, after)
                }
            }
        }
        this.eventHandler('mousedown', mousedown, 'resizableDown')
        this.eventHandler('mousemove', mousemove, 'resizableMove')
        this.eventHandler('mouseup', mouseup, 'resizableUp')
        return resizable
    }
    __checkCornersInBound(x: number, y: number, cornerName: string) {
        const corner = this.getOptionCurrentVal(cornerName)
        return checkInBound(
            x,
            y,
            corner.topLeft.x,
            corner.topLeft.y,
            corner.topRight.x,
            corner.topRight.y,
            corner.bottomLeft.x,
            corner.bottomLeft.y,
            corner.bottomRight.x,
            corner.bottomRight.y
        )
    }
    __checkCornersInBoundReverseX(x: number, y: number, cornerName: string) {
        const corner = this.getOptionCurrentVal(cornerName)
        return checkInBound(
            x,
            y,
            corner.bottomLeft.x,
            corner.bottomLeft.y,
            corner.bottomRight.x,
            corner.bottomRight.y,
            corner.topLeft.x,
            corner.topLeft.y,
            corner.topRight.x,
            corner.topRight.y
        )
    }
    __checkCornersInBoundReverseY(x: number, y: number, cornerName: string) {
        const corner = this.getOptionCurrentVal(cornerName)
        checkInBound(
            x,
            y,
            corner.topRight.x,
            corner.topRight.y,
            corner.topLeft.x,
            corner.topLeft.y,
            corner.bottomRight.x,
            corner.bottomRight.y,
            corner.bottomLeft.x,
            corner.bottomLeft.y
        )
    }
    onDrag(opt?: (event: MouseEvent) => void) {
        const dragE = this.__valueHandler<
            (event: MouseEvent) => void,
            ((event: MouseEvent) => void) | undefined
        >(opt, 'onDrag', undefined)
        return dragE
    }

    draggable(opt?: boolean): boolean {
        const draggable = this.__valueHandler(opt, 'draggable', false)
        if (!draggable) return draggable
        let initCords = { x: 0, y: 0 }
        let beforeCords = { x: 0, y: 0 }
        let beforeValues: any = {}
        this.mousedown((event) => {
            if (this.__runningEvents.resize || this.__runningEvents.rotate)
                return
            initCords = this.canvas?.getCursorPosition(event)!
            beforeCords = { x: 0, y: 0 }
            beforeValues[this.nodeId!] = {
                x: this.x(),
                y: this.y(),
            }
            this.__runningEvents.drag = true
        })
        const mousemove = (event: MouseEvent) => {
            if (this.__runningEvents.resize || this.__runningEvents.rotate)
                return
            if (this.__runningEvents.drag) {
                this.registerZIndex({ in: this.zIndex() })
                if (this.ImFirst || this.__runningEvents.drag) {
                    const { x, y } = this.canvas?.getCursorPosition(event)!
                    let diffX = x - initCords.x
                    let diffY = y - initCords.y
                    if (diffX !== 0 && this.draggableX()) {
                        const diff = diffX - beforeCords.x
                        this.__translate({ x: diff, y: 0 })
                        beforeCords.x = diffX
                    }
                    if (diffY !== 0 && this.draggableY()) {
                        const diff = diffY - beforeCords.y
                        this.__translate({ x: 0, y: diff })
                        beforeCords.y = diffY
                    }
                    this.onDrag()?.(event)
                    this.invokeChange()
                }
            }
        }
        const mouseup = () => {
            if (this.__runningEvents.drag) {
                this.__runningEvents.drag = false
                if (beforeCords.x !== 0 || beforeCords.y !== 0) {
                    const after: any = {}
                    after[this.nodeId!] = {
                        x: this.x(),
                        y: this.y(),
                    }
                    this.canvas?.takeSnapshot(beforeValues, after)
                    this.invokeChange()
                }
            }
        }
        this.eventHandler<MouseEvent>('mousemove', mousemove, 'draggableMove')
        this.eventHandler<MouseEvent>('mouseup', mouseup, 'draggableUp')
        return draggable
    }
}
