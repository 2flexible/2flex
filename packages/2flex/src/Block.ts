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
    radianToDegree,
    bezierEasing,
    lerp,
    linear,
    steps,
    hexToRgba,
    colorToRgba,
    rgbaRepresenter,
    getPrototype,
    rotateCordinates,
    inRange,
    namedColors,
    hslToRgba,
    rgbaToArray,
    clamp,
} from './Utils'
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
    | RelativeType

export type PaddingType =
    | [RelativeType, RelativeType, RelativeType, RelativeType]
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
    hotCornerTopLeft?: XY
    hotCornerTopRight?: XY
    hotCornerBottomLeft?: XY
    hotCornerBottomRight?: XY
    hotRotCornerTopLeft?: XY
    hotRotCornerTopRight?: XY
    hotRotCornerBottomLeft?: XY
    hotRotCornerBottomRight?: XY
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

export interface BlockPayload {
    nodeId: NodeId
    name: string
    options: IBlockOptions
    ownOptions: IBlockOptions
    childs: BlockPayload[]
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
type Flipped = { vertical: boolean; horizontal: boolean }

export type Animator = (timestamp: number) => void
export type CallbackAnimator = (timestamp: number, easing: number) => void

interface OverflowCords extends XY {
    width: number
    height: number
}

interface OverflowInnerScrollCordinates extends HotCornerArea {}
interface OverflowOuterScrollCordinates {
    x: number
    y: number
    width: number
    height: number
}

interface OverflowScrollBar {
    block?: Block<any>
    innerBarCordinates: OverflowInnerScrollCordinates
    outerBarCordinates: OverflowOuterScrollCordinates
}

const OVERFLOW_SCROLL_BAR_BLOCK_NAME = '__overflow_scroll_bar_hidden'
const OVERFLOW_SCROLL_BAR_MIN_SIZE = 15
const OVERFLOW_AREA_GAP = 15
const OVERFLOW_INNER_AREA_GAP = 3
const OVERFLOW_INNER_AREA_SIZE = 10
const OVERFLOW_INNER_AREA_RADIUS = 10

export class Block<T = IBlockOptions> extends Node {
    declare parentNode?: Block
    declare childNodes: Block[]

    canvas?: Canvas
    ownOptions: IBlock<T>
    options: IBlock<T>

    __hidden = false
    __bindOptions: BindOptions[]

    __runningEvents: RunningEvents
    __events: BlockEvent

    #rotationCorners: HotCornerArea
    __overflowCords: OverflowCords

    #keyframeIterations: KeyframeIterations
    __animations: Animator[]

    #lastOrder: number

    __clipPath?: Path2D
    __childClipping?: (b: Block<T>) => void

    __childAdjustment?: (b: Block<T>) => void

    #changedCache: {
        [key: string]: { oldValue: any }
    }

    #overflowXscrollBar: OverflowScrollBar
    #overflowYscrollBar: OverflowScrollBar

    constructor(options: IBlock<T>) {
        super()
        this.options = { ...options }
        this.ownOptions = { ...options }
        this.__bindOptions = []
        this.__runningEvents = {
            drag: false,
            rotate: false,
            resize: false,
            selected: false,
        }
        this.__events = {}

        this.#changedCache = {}

        this.#rotationCorners = {
            topLeft: { x: 0, y: 0 },
            bottomLeft: { x: 0, y: 0 },
            topRight: { x: 0, y: 0 },
            bottomRight: { x: 0, y: 0 },
        }
        this.__overflowCords = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        }

        this.#overflowXscrollBar = {
            innerBarCordinates: {
                topLeft: { x: 0, y: 0 },
                bottomLeft: { x: 0, y: 0 },
                topRight: { x: 0, y: 0 },
                bottomRight: { x: 0, y: 0 },
            },
            outerBarCordinates: {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
            },
        }

        this.#overflowYscrollBar = {
            innerBarCordinates: {
                topLeft: { x: 0, y: 0 },
                bottomLeft: { x: 0, y: 0 },
                topRight: { x: 0, y: 0 },
                bottomRight: { x: 0, y: 0 },
            },
            outerBarCordinates: {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
            },
        }

        this.__animations = []
        this.#keyframeIterations = {}

        this.#lastOrder = 0

        this.setChangeCache('isVerticalFlipped', false)
        this.setChangeCache('isHorizontalFlipped', false)

        this.setChangeCache('clipWdith', 0)
        this.setChangeCache('clipHeight', 0)
        this.setChangeCache('clipX', 0)
        this.setChangeCache('clipY', 0)

        // permenant
        this.setChangeCache('setInBound', false)

        // In first paddings assignment need to change width and heights realtive to paddings
        if (this.paddingLeft()) this.width(this.width() + this.paddingLeft())
        if (this.paddingRight()) this.width(this.width() + this.paddingRight())
        if (this.paddingTop()) this.height(this.height() + this.paddingTop())
        if (this.paddingBottom())
            this.height(this.height() + this.paddingBottom())
    }

    get context(): CanvasRenderingContext2D | undefined | null {
        return this.canvas?.context
    }

    render() {
        this.__childClipping?.(this)
        this.__childAdjustment?.(this)

        this.position()

        this.__clippingPath()
        this.__adjustChildBlocks()

        if (this.__isHidden) return

        this.__isSelected()
        this.__isOverflowAreaVisible()
        this.onRender()?.()
    }

    name(opt?: string) {
        return this.__valueHandler(opt, 'name', undefined)
    }

    onRender(opt?: () => void) {
        const renderFunc = this.__valueHandler<
            () => void,
            (() => void) | undefined
        >(opt, 'onRender', undefined)

        return renderFunc
    }
    __isSelected() {
        if (this.__runningEvents.selected && this.hotLines()) {
            if (this.ImFirst) this.__hotLines()
            else this.__runningEvents.selected = false
        }
    }

    __isOverflowAreaVisible() {
        if (this.__isOverflowXScroll || this.__isOverflowXAuto)
            this.__overflowXScrollBar()
        else this.#overflowXscrollBar.block = undefined

        if (this.__isOverflowYScroll || this.__isOverflowYAuto)
            this.__overflowYScrollBar()
        else this.#overflowYscrollBar.block = undefined
    }

    __updateOverflowXCords() {
        const currentWidth = this.width() + this.__overflowCords.width

        const areaWidth = clamp(
            currentWidth,
            OVERFLOW_SCROLL_BAR_MIN_SIZE,
            this.width()
        )

        //  while inner scroll bar in minimum width need to calculate correct cordiantes
        let xPer = 1
        if (currentWidth < 0) {
            xPer = this.__overflowCords.width / -(this.width() - areaWidth)
        }
        const topLeftX = this.__getLeft.x - this.__overflowCords.x / xPer
        const topLeftY =
            this.__getBottom.y - OVERFLOW_AREA_GAP + OVERFLOW_INNER_AREA_GAP

        const topRightX =
            this.__getLeft.x + this.__overflowCords.x / xPer + areaWidth
        const bottomRightY =
            this.__getBottom.y -
            OVERFLOW_AREA_GAP +
            OVERFLOW_INNER_AREA_GAP +
            OVERFLOW_INNER_AREA_SIZE

        this.#overflowXscrollBar.innerBarCordinates.topLeft.x = topLeftX
        this.#overflowXscrollBar.innerBarCordinates.topLeft.y = topLeftY

        this.#overflowXscrollBar.innerBarCordinates.topRight.x = topRightX
        this.#overflowXscrollBar.innerBarCordinates.topRight.y = topLeftY

        this.#overflowXscrollBar.innerBarCordinates.bottomLeft.x = topLeftX
        this.#overflowXscrollBar.innerBarCordinates.bottomLeft.y = bottomRightY

        this.#overflowXscrollBar.innerBarCordinates.bottomRight.x = topRightX
        this.#overflowXscrollBar.innerBarCordinates.bottomRight.y = bottomRightY
    }

    __overflowXScrollBar() {
        if (!this.#overflowXscrollBar.block) {
            // Intilizating overflow block and its realted cordinates
            this.#overflowXscrollBar.block = new Block({
                name: OVERFLOW_SCROLL_BAR_BLOCK_NAME,
                width: this.width(),
                height: OVERFLOW_AREA_GAP,
                position: 'fixed',
                left: this.x(),
                top: this.height() - OVERFLOW_AREA_GAP,
                selectable: true,
                // Showing overflow scroll bar block on top of the child blocks
                zIndex: (this.zIndex() || 1) + this.childNodes.length,
                hotLines: false,
            })
            this.__updateOverflowXCords()
            this.#overflowXscrollBar.outerBarCordinates.x = this.__getLeft.x
            this.#overflowXscrollBar.outerBarCordinates.y =
                this.__getBottom.y - OVERFLOW_AREA_GAP
            this.#overflowXscrollBar.outerBarCordinates.width = this.width()
            this.#overflowXscrollBar.outerBarCordinates.height =
                this.height() < OVERFLOW_AREA_GAP
                    ? this.height()
                    : OVERFLOW_AREA_GAP

            // moving overflow scrollbar
            let initCords = { x: 0, y: 0 }
            let beforeCords = { x: 0, y: 0 }
            let isMouseDown = false
            const mousedown = (event: MouseEvent) => {
                initCords =
                    this.#overflowXscrollBar.block?.canvas?.getCursorPosition(
                        event
                    ) || {
                        x: 0,
                        y: 0,
                    }
                if (
                    checkInBound(
                        initCords.x,
                        initCords.y,
                        this.#overflowXscrollBar.innerBarCordinates.topLeft.x,
                        this.#overflowXscrollBar.innerBarCordinates.topLeft.y,
                        this.#overflowXscrollBar.innerBarCordinates.topRight.x,
                        this.#overflowXscrollBar.innerBarCordinates.topRight.y,
                        this.#overflowXscrollBar.innerBarCordinates.bottomLeft
                            .x,
                        this.#overflowXscrollBar.innerBarCordinates.bottomLeft
                            .y,
                        this.#overflowXscrollBar.innerBarCordinates.bottomRight
                            .x,
                        this.#overflowXscrollBar.innerBarCordinates.bottomRight
                            .y
                    )
                ) {
                    beforeCords = { x: 0, y: 0 }
                    isMouseDown = true
                } else
                    this.#overflowXscrollBar.block?.registerZIndex({
                        out: this.#overflowXscrollBar.block?.zIndex(),
                    })
            }

            const mousemove = (event: MouseEvent) => {
                const { x, y } =
                    this.#overflowXscrollBar.block?.canvas?.getCursorPosition(
                        event
                    ) || {
                        x: 0,
                        y: 0,
                    }
                // checking cursor cause resize area overlaps with the overflow area
                if (
                    !isMouseDown &&
                    checkInBound(
                        x,
                        y,
                        this.#overflowXscrollBar.innerBarCordinates.topLeft.x,
                        this.#overflowXscrollBar.innerBarCordinates.topLeft.y,
                        this.#overflowXscrollBar.innerBarCordinates.topRight.x,
                        this.#overflowXscrollBar.innerBarCordinates.topRight.y,
                        this.#overflowXscrollBar.innerBarCordinates.bottomLeft
                            .x,
                        this.#overflowXscrollBar.innerBarCordinates.bottomLeft
                            .y,
                        this.#overflowXscrollBar.innerBarCordinates.bottomRight
                            .x,
                        this.#overflowXscrollBar.innerBarCordinates.bottomRight
                            .y
                    ) &&
                    !(this.__isOverflowXAuto && this.__overflowCords.width > 0)
                ) {
                    this.canvas?.changeCursor('auto')
                }

                if (isMouseDown && this.__isOverflowXScrollable) {
                    this.#overflowXscrollBar.block?.registerZIndex({
                        in: this.#overflowXscrollBar.block?.zIndex(),
                    })
                    if (this.#overflowXscrollBar.block?.ImFirst) {
                        let diffX = x - initCords.x
                        if (diffX !== 0) {
                            const diff = diffX - beforeCords.x
                            this.__overflowTranslate({ x: -diff, y: 0 })
                            beforeCords.x = diffX
                        }
                        this.#overflowXscrollBar.block?.invokeChange()
                    }
                }
            }
            const mouseup = () => {
                if (isMouseDown) isMouseDown = false
            }
            this.eventHandler<MouseEvent>(
                'mousedown',
                mousedown,
                'overflowMouseDown'
            )

            this.#overflowXscrollBar.block.eventHandler<MouseEvent>(
                'mousemove',
                mousemove,
                'overflowMouseMove'
            )
            this.#overflowXscrollBar.block.eventHandler<MouseEvent>(
                'mouseup',
                mouseup,
                'overflowMouseUp'
            )
            this.#overflowXscrollBar.block.onRender(() => {
                if (this.__isOverflowXAuto && this.__overflowCords.width > 0)
                    return

                const areaWidth = clamp(
                    this.width() + this.__overflowCords.width,
                    OVERFLOW_SCROLL_BAR_MIN_SIZE,
                    this.width()
                )

                const topleft = rotateCordinates(
                    this.#overflowXscrollBar.innerBarCordinates.topLeft.x,
                    this.#overflowXscrollBar.innerBarCordinates.topLeft.y,
                    this.__getRealCenterX,
                    this.__getRealCenterY,
                    -this.rotate()
                )

                this.#buildOverflowScrollAreaBar(
                    this.#overflowXscrollBar.block!,
                    this.#overflowXscrollBar.outerBarCordinates.x,
                    this.#overflowXscrollBar.outerBarCordinates.y,
                    this.#overflowXscrollBar.outerBarCordinates.width,
                    this.#overflowXscrollBar.outerBarCordinates.height,
                    topleft.x,
                    topleft.y,
                    areaWidth,
                    OVERFLOW_INNER_AREA_SIZE,
                    OVERFLOW_INNER_AREA_RADIUS
                )
            })
            if (!this.childNodes.includes(this.#overflowXscrollBar.block)) {
                this.childNodes.push(this.#overflowXscrollBar.block)
            }
        } else {
            this.#overflowXscrollBar.block.rotationCenterX(
                this.__getRealCenterX
            )
            this.#overflowXscrollBar.block.rotationCenterY(
                this.__getRealCenterY
            )
            this.#overflowXscrollBar.block.rotate(this.rotate())
            this.#overflowXscrollBar.block.left(this.x())
            this.#overflowXscrollBar.block.top(
                this.y() + this.height() - OVERFLOW_AREA_GAP
            )
            this.#overflowXscrollBar.block.width(this.width())
            this.#overflowXscrollBar.block.height(OVERFLOW_AREA_GAP)

            // Showing overflow scroll bar block on top of the child blocks
            this.#overflowXscrollBar.block.zIndex(
                (this.zIndex() || 1) + this.childNodes.length
            )
        }
    }

    __updateOverflowYCords() {
        const currentHeight =
            this.height() +
            (this.__overflowCords.height - this.#overflowScrollYHeightCut)
        const areaHeight = clamp(
            currentHeight,
            OVERFLOW_SCROLL_BAR_MIN_SIZE,
            this.height() - this.#overflowScrollYHeightCut
        )
        let yPer = 1
        if (currentHeight < 0) {
            yPer =
                this.__overflowCords.height /
                -(this.height() - areaHeight - this.#overflowScrollYHeightCut)
        }
        const topLeftX =
            this.__getRight.x - OVERFLOW_AREA_GAP + OVERFLOW_INNER_AREA_GAP
        const topLeftY = this.__getTop.y - this.__overflowCords.y / yPer

        const topRightX = this.__getRight.x - OVERFLOW_INNER_AREA_GAP
        const bottomRightY = topLeftY + areaHeight

        this.#overflowYscrollBar.innerBarCordinates.topLeft.x = topLeftX
        this.#overflowYscrollBar.innerBarCordinates.topLeft.y = topLeftY
        this.#overflowYscrollBar.innerBarCordinates.topRight.x = topRightX
        this.#overflowYscrollBar.innerBarCordinates.topRight.y = topLeftY
        this.#overflowYscrollBar.innerBarCordinates.bottomLeft.x = topLeftX
        this.#overflowYscrollBar.innerBarCordinates.bottomLeft.y = bottomRightY
        this.#overflowYscrollBar.innerBarCordinates.bottomRight.x = topRightX
        this.#overflowYscrollBar.innerBarCordinates.bottomRight.y = bottomRightY
    }

    __overflowYScrollBar() {
        if (!this.#overflowYscrollBar.block) {
            this.#overflowYscrollBar.block = new Block({
                name: OVERFLOW_SCROLL_BAR_BLOCK_NAME,
                width: OVERFLOW_AREA_GAP,
                height: this.height() - this.#overflowScrollYHeightCut,
                position: 'fixed',
                left: this.x() + this.width() - OVERFLOW_AREA_GAP,
                top: this.y(),
                selectable: true,
                // Showing overflow scroll bar block on top of the child blocks
                zIndex: (this.zIndex() || 1) + this.childNodes.length,
                hotLines: false,
            })
            this.__updateOverflowYCords()
            this.#overflowYscrollBar.outerBarCordinates.x =
                this.__getRight.x - OVERFLOW_AREA_GAP
            this.#overflowYscrollBar.outerBarCordinates.y = this.__getTop.y
            this.#overflowYscrollBar.outerBarCordinates.width =
                this.width() < OVERFLOW_AREA_GAP
                    ? this.width()
                    : OVERFLOW_AREA_GAP
            this.#overflowYscrollBar.outerBarCordinates.height =
                this.height() - this.#overflowScrollYHeightCut

            // moving overflow scrollbar
            let initCords = { x: 0, y: 0 }
            let beforeCords = { x: 0, y: 0 }
            let isMouseDown = false
            const mousedown = (event: MouseEvent) => {
                initCords =
                    this.#overflowYscrollBar.block?.canvas?.getCursorPosition(
                        event
                    ) || {
                        x: 0,
                        y: 0,
                    }
                if (
                    checkInBound(
                        initCords.x,
                        initCords.y,
                        this.#overflowYscrollBar.innerBarCordinates.topLeft.x,
                        this.#overflowYscrollBar.innerBarCordinates.topLeft.y,
                        this.#overflowYscrollBar.innerBarCordinates.topRight.x,
                        this.#overflowYscrollBar.innerBarCordinates.topRight.y,
                        this.#overflowYscrollBar.innerBarCordinates.bottomLeft
                            .x,
                        this.#overflowYscrollBar.innerBarCordinates.bottomLeft
                            .y,
                        this.#overflowYscrollBar.innerBarCordinates.bottomRight
                            .x,
                        this.#overflowYscrollBar.innerBarCordinates.bottomRight
                            .y
                    ) &&
                    !(this.__isOverflowYAuto && this.__overflowCords.height > 0)
                ) {
                    beforeCords = { x: 0, y: 0 }
                    isMouseDown = true
                } else
                    this.#overflowYscrollBar.block?.registerZIndex({
                        out: this.#overflowYscrollBar.block?.zIndex(),
                    })
            }
            const mousemove = (event: MouseEvent) => {
                const { x, y } =
                    this.#overflowYscrollBar.block?.canvas?.getCursorPosition(
                        event
                    ) || {
                        x: 0,
                        y: 0,
                    }

                // checking cursor cause resize area overlaps with the overflow area
                if (
                    !isMouseDown &&
                    checkInBound(
                        x,
                        y,
                        this.#overflowYscrollBar.innerBarCordinates.topLeft.x,
                        this.#overflowYscrollBar.innerBarCordinates.topLeft.y,
                        this.#overflowYscrollBar.innerBarCordinates.topRight.x,
                        this.#overflowYscrollBar.innerBarCordinates.topRight.y,
                        this.#overflowYscrollBar.innerBarCordinates.bottomLeft
                            .x,
                        this.#overflowYscrollBar.innerBarCordinates.bottomLeft
                            .y,
                        this.#overflowYscrollBar.innerBarCordinates.bottomRight
                            .x,
                        this.#overflowYscrollBar.innerBarCordinates.bottomRight
                            .y
                    ) &&
                    !(this.__isOverflowYAuto && this.__overflowCords.height > 0)
                ) {
                    this.canvas?.changeCursor('auto')
                }
                if (isMouseDown && this.__isOverflowYScrollable) {
                    this.#overflowYscrollBar.block?.registerZIndex({
                        in: this.#overflowYscrollBar.block?.zIndex(),
                    })
                    if (this.#overflowYscrollBar.block?.ImFirst) {
                        let diffY = y - initCords.y
                        if (diffY !== 0) {
                            const diff = diffY - beforeCords.y
                            this.__overflowTranslate({ x: 0, y: -diff })
                            beforeCords.y = diffY
                        }
                        this.#overflowYscrollBar.block?.invokeChange()
                    }
                }
            }
            const mouseup = () => {
                if (isMouseDown) isMouseDown = false
            }
            this.eventHandler<MouseEvent>(
                'mousedown',
                mousedown,
                'overflowYMouseDown'
            )
            this.#overflowYscrollBar.block.eventHandler<MouseEvent>(
                'mousemove',
                mousemove,
                'overflowYMouseMove'
            )
            this.#overflowYscrollBar.block.eventHandler<MouseEvent>(
                'mouseup',
                mouseup,
                'overflowYMouseUp'
            )
            this.#overflowYscrollBar.block.onRender(() => {
                if (this.__isOverflowYAuto && this.__overflowCords.height > 0)
                    return

                const areaHeight = clamp(
                    this.height() +
                        (this.__overflowCords.height -
                            this.#overflowScrollYHeightCut),
                    OVERFLOW_SCROLL_BAR_MIN_SIZE,
                    this.height() - this.#overflowScrollYHeightCut
                )

                const topleft = rotateCordinates(
                    this.#overflowYscrollBar.innerBarCordinates.topLeft.x,
                    this.#overflowYscrollBar.innerBarCordinates.topLeft.y,
                    this.__getRealCenterX,
                    this.__getRealCenterY,
                    -this.rotate()
                )

                this.#buildOverflowScrollAreaBar(
                    this.#overflowYscrollBar.block!,
                    this.#overflowYscrollBar.outerBarCordinates.x,
                    this.#overflowYscrollBar.outerBarCordinates.y,
                    this.#overflowYscrollBar.outerBarCordinates.width,
                    this.#overflowYscrollBar.outerBarCordinates.height,
                    topleft.x,
                    topleft.y,
                    OVERFLOW_INNER_AREA_SIZE,
                    areaHeight,
                    OVERFLOW_INNER_AREA_RADIUS
                )
            })
            if (!this.childNodes.includes(this.#overflowYscrollBar.block)) {
                this.childNodes.push(this.#overflowYscrollBar.block)
            }
        } else {
            this.#overflowYscrollBar.block.rotationCenterX(
                this.__getRealCenterX
            )
            this.#overflowYscrollBar.block.rotationCenterY(
                this.__getRealCenterY
            )
            this.#overflowYscrollBar.block.rotate(this.rotate())
            this.#overflowYscrollBar.block.left(
                this.x() + this.width() - OVERFLOW_AREA_GAP
            )
            this.#overflowYscrollBar.block.top(this.y())
            this.#overflowYscrollBar.block.width(OVERFLOW_AREA_GAP)
            this.#overflowYscrollBar.block.height(
                this.height() - this.#overflowScrollYHeightCut
            )
            // Showing overflow scroll bar block on top of the child blocks
            this.#overflowYscrollBar.block.zIndex(
                (this.zIndex() || 1) + this.childNodes.length
            )
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
        this.context?.translate(this.rotationCenterX(), this.rotationCenterY())
        this.context?.rotate(this.rotate())
        this.context?.translate(
            -this.rotationCenterX(),
            -this.rotationCenterY()
        )
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
    }

    // Overrided default listing methods for filter out unwanted child classes
    listOnlyChilds<B>(
        _func: (node: B, currIdx: number, arrLen: number) => void,
        sort?: string,
        nodes?: Node[]
    ): void {
        const listingFunc = (node: B, currIdx: number, arrLen: number) => {
            if ((node as Block).name() !== OVERFLOW_SCROLL_BAR_BLOCK_NAME) {
                _func(node, currIdx, arrLen)
            }
        }
        super.listOnlyChilds(listingFunc, sort, nodes)
    }

    listAllChilds<T>(_func: (node: T) => void): void {
        const listingFunc = (node: T) => {
            if ((node as Block).name() !== OVERFLOW_SCROLL_BAR_BLOCK_NAME) {
                _func(node)
            }
        }
        super.listAllChilds(listingFunc)
    }

    __generatePayload(): BlockPayload {
        const childs: BlockPayload[] = []
        this.listOnlyChilds((b: Block) => {
            childs.push(b.__generatePayload())
        })
        return {
            nodeId: this.nodeId,
            name: this.constructor.name,
            options: this.options,
            ownOptions: this.ownOptions,
            childs: childs,
            additionalParams: [],
        }
    }

    addChild(...blocks: Block<any>[]): void {
        this.setChangeCache('childNodes', this.childNodes.length)
        const exists = blocks.filter((r) => !this.childNodes.includes(r))
        let before: any = {}
        before[this.nodeId!] = {
            childNodes: [...this.childNodes],
        }
        super.addChild(...exists)
        if (exists.length === 0) return
        let z = this.zIndex() || 1

        this.canvas?.invokeNodeListing()
        this.listOnlyChilds((b: Block) => {
            if (b.order() === undefined) {
                b.order(this.#lastOrder)
                this.#lastOrder += 1
            }
            z += 1
            if (b.zIndex() == undefined) b.zIndex(z)
            this.canvas?.__handleOptions(b)
            this.canvas?.__collectEvents(b)
            this.canvas?.__collectAnimations(b)
            b.__initCordinates()
            this.canvas?.__takeInitSnaphshot(before)
            this.canvas?.__takeBlockSnapshot(this, before)
        })
        this.invokeChange()
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

    findChilds(queries: IBlockOptions) {
        let blocks: Block[] = []
        this.listAllChilds((block: Block) => {
            for (const [k, v] of Object.entries(queries)) {
                if (block.ownOptions[k] === v) blocks.push(block)
            }
        })
        return blocks
    }

    __clippingPath() {
        const left = this.__getLeft.x + this.__leftSpace
        const right = this.__getRealWidth - this.__widthSpaces
        const top = this.__getTop.y + this.__topSpace
        const bottom = this.__getRealHeight - this.__heightSpaces
        if (
            !this.__isOverflowVisible &&
            (this.optionHasChanged('clipX', left) ||
                this.optionHasChanged('clipY', top) ||
                this.optionHasChanged('clipWdith', right) ||
                this.optionHasChanged('clipHeight', bottom))
        ) {
            this.__clipPath = new Path2D()
            this.__clipShape()
        }
    }

    __clipShape() {
        this.__clipPath?.rect(
            this.x(),
            this.y(),
            this.width(),
            this.height(),
        )
    }

    __hotLines() {
        if (!this.context) return
        const size = this.hotCornerSize()
        const radius = this.hotCornerRadius()
        const strokeWidth = this.hotCornerStrokeWidth()
        const strokeColor = this.hotCornerStrokeColor()
        const background = this.hotCornerBackgroundColor()
        const lineWidth = this.hotLineStrokeWidth()
        const lineColor = this.hotLineStrokeColor()
        this.context.save()
        this.context.setLineDash([])
        this.context.beginPath()
        this.context.moveTo(
            this.hotCornerTopLeft().x,
            this.hotCornerTopLeft().y
        )
        if (!this.hotTopFunc()) {
            this.context.lineTo(
                this.hotCornerTopRight().x,
                this.hotCornerTopRight().y
            )
            this.context.lineWidth = lineWidth
            this.context.strokeStyle = lineColor
            this.context.stroke()
        } else this.hotTopFunc()?.(this.context)

        this.context.beginPath()
        this.context.moveTo(
            this.hotCornerTopLeft().x,
            this.hotCornerTopLeft().y
        )
        if (!this.hotLeftFunc()) {
            this.context.lineTo(
                this.hotCornerBottomLeft().x,
                this.hotCornerBottomLeft().y
            )
            this.context.lineWidth = lineWidth
            this.context.strokeStyle = lineColor
            this.context.stroke()
        } else this.hotLeftFunc()?.(this.context)

        this.context.beginPath()
        this.context.moveTo(
            this.hotCornerBottomLeft().x,
            this.hotCornerBottomLeft().y
        )
        if (!this.hotBottomFunc()) {
            this.context.lineTo(
                this.hotCornerBottomRight().x,
                this.hotCornerBottomRight().y
            )
            this.context.lineWidth = lineWidth
            this.context.strokeStyle = lineColor
            this.context.stroke()
        } else this.hotBottomFunc()?.(this.context)

        this.context.beginPath()
        this.context.moveTo(
            this.hotCornerBottomRight().x,
            this.hotCornerBottomRight().y
        )
        if (!this.hotRightFunc()) {
            this.context.lineTo(
                this.hotCornerTopRight().x,
                this.hotCornerTopRight().y
            )
            this.context.lineWidth = lineWidth
            this.context.strokeStyle = lineColor
            this.context.stroke()
        } else this.hotRightFunc()?.(this.context)

        this.context.beginPath()
        if (!this.hotCornerTopLeftFunc()) {
            this.context.roundRect(
                this.hotCornerTopLeft().x - size / 2,
                this.hotCornerTopLeft().y - size / 2,
                size,
                size,
                radius
            )
            this.context.lineWidth = strokeWidth
            this.context.strokeStyle = strokeColor
            this.context.fillStyle = background
            this.context.fill()
            this.context.stroke()
        } else {
            this.hotCornerTopLeftFunc()?.(this.context)
        }

        this.context.beginPath()
        if (!this.hotCornerTopRightFunc()) {
            this.context.roundRect(
                this.hotCornerTopRight().x - size / 2,
                this.hotCornerTopRight().y - size / 2,
                size,
                size,
                radius
            )
            this.context.lineWidth = strokeWidth
            this.context.strokeStyle = strokeColor
            this.context.fillStyle = background
            this.context.fill()
            this.context.stroke()
        } else {
            this.hotCornerTopRightFunc()?.(this.context)
        }

        this.context.beginPath()
        if (!this.hotCornerBottomLeftFunc()) {
            this.context.roundRect(
                this.hotCornerBottomLeft().x - size / 2,
                this.hotCornerBottomLeft().y - size / 2,
                size,
                size,
                radius
            )
            this.context.lineWidth = strokeWidth
            this.context.strokeStyle = strokeColor
            this.context.fillStyle = background
            this.context.fill()
            this.context.stroke()
        } else {
            this.hotCornerBottomLeftFunc()?.(this.context)
        }

        this.context.beginPath()
        if (!this.hotCornerBottomRightFunc()) {
            this.context.roundRect(
                this.hotCornerBottomRight().x - size / 2,
                this.hotCornerBottomRight().y - size / 2,
                size,
                size,
                radius
            )
            this.context.lineWidth = strokeWidth
            this.context.strokeStyle = strokeColor
            this.context.fillStyle = background
            this.context.fill()
            this.context.stroke()
        } else {
            this.hotCornerBottomRightFunc()?.(this.context)
        }

        this.context.restore()
    }

    hotLines(opt?: boolean) {
        return this.__valueHandler(opt, 'hotLines', true)
    }

    __adjustChildBlocks(): void {
        if (this.childNodes.length !== 0 || !this.useCacheAdjust) {
            const cacheR = this.rotate()
            this.rotate(0)

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
                if (b.position() === 'absolute') return
                b.rotate(0)

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

                const x =
                    startX +
                    cornerLeftX +
                    this.__overflowCords.x +
                    pPaddingLeft +
                    blockMarginLeft
                const y =
                    startY +
                    cornerTopY +
                    this.__overflowCords.y +
                    pPaddingTop +
                    blockMarginTop

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

                b.__childAdjustment = (b: Block) => {
                    b.hidden(this.hidden())
                    if (b.rotationCenter() === 'parent') {
                        b.rotationCenterX(centerX)
                        b.rotationCenterY(centerY)
                    }
                    b.rotate(cacheR)
                    b.x(x)
                    b.y(y)
                    b.width(blockW)
                    b.height(blockH)
                }

                if (this.__clipPath) {
                    b.__childClipping = (b: Block) => {
                        // in rotate of partent clipping also need to be rotated
                        b.context?.translate(
                            this.__getRealCenterX,
                            this.__getRealCenterY
                        )
                        b.context?.rotate(this.rotate())
                        b.context?.translate(
                            -this.__getRealCenterX,
                            -this.__getRealCenterY
                        )
                        b.context?.clip(this.__clipPath!, 'nonzero')

                        // after clip need to reset to its default rotation
                        b.context?.translate(
                            this.__getRealCenterX,
                            this.__getRealCenterY
                        )
                        b.context?.rotate(-this.rotate())
                        b.context?.translate(
                            -this.__getRealCenterX,
                            -this.__getRealCenterY
                        )
                    }
                }
            })

            const beforeWidth = this.__overflowCords.width
            const beforeHeight =
                this.__overflowCords.height || this.#overflowScrollYHeightCut
            this.__overflowCords.width = pWidthSpaces - blocksContainerWidth
            this.__overflowCords.height =
                pHeightSpaces -
                this.#overflowScrollYHeightCut -
                blocksContainerHeight

            // If overflow area cursor on the right need to adjust it to left for correcting overflow cordinate
            const diffW = this.__overflowCords.width - beforeWidth
            if (diffW > 0)
                if (this.__overflowCords.x < 0) this.__overflowCords.x += diffW
                else this.__overflowCords.x = 0

            // If overflow area cursor on the bottom need to adjust it to top for correcting overflow cordinate
            const diffH = this.__overflowCords.height - beforeHeight
            if (diffH > 0)
                if (this.__overflowCords.y < 0) this.__overflowCords.y += diffH
                else this.__overflowCords.y = 0

            if (this.#overflowXscrollBar.block) this.__updateOverflowXCords()
            if (this.#overflowYscrollBar.block) this.__updateOverflowYCords()

            this.rotate(cacheR)
        }
    }

    get useCacheAdjust() {
        if (
            this.optionHasChanged('childNodes', this.childNodes.length) ||
            this.optionHasChanged('x') ||
            this.optionHasChanged('y') ||
            this.optionHasChanged('width') ||
            this.optionHasChanged('height') ||
            this.optionHasChanged('minWidth') ||
            this.optionHasChanged('minHeight') ||
            this.optionHasChanged('maxWidth') ||
            this.optionHasChanged('maxHeight') ||
            this.optionHasChanged('zIndex') ||
            this.optionHasChanged('paddingLeft') ||
            this.optionHasChanged('paddingRight') ||
            this.optionHasChanged('paddingBottom') ||
            this.optionHasChanged('paddingTop') ||
            this.optionHasChanged('marginLeft') ||
            this.optionHasChanged('marginRight') ||
            this.optionHasChanged('marginBottom') ||
            this.optionHasChanged('marginTop') ||
            this.optionHasChanged('rotationCenterX') ||
            this.optionHasChanged('rotationCenterY') ||
            this.optionHasChanged('rotate') ||
            this.optionHasChanged('hidden')
        )
            return false
        return true
    }

    __initCordinates() {
        this.padding()
        this.margin()

        this.cornerTopLeft({
            x: this.x(),
            y: this.y(),
        })
        this.cornerTopRight({
            x: this.x() + this.width(),
            y: this.y(),
        })
        this.cornerBottomLeft({
            x: this.x(),
            y: this.y() + this.height(),
        })
        this.cornerBottomRight({
            x: this.x() + this.width(),
            y: this.y() + this.height(),
        })

        const centerX = this.__getRealCenterX
        const centerY = this.__getRealCenterY

        this.rotationCenterX(centerX)
        this.rotationCenterY(centerY)

        this.hotCornerTopLeft({
            x: this.cornerTopLeft().x - this.hotAreaGap(),
            y: this.cornerTopLeft().y - this.hotAreaGap(),
        })
        this.hotCornerTopRight({
            x: this.cornerTopRight().x + this.hotAreaGap(),
            y: this.cornerTopRight().y - this.hotAreaGap(),
        })
        this.hotCornerBottomLeft({
            x: this.cornerBottomLeft().x - this.hotAreaGap(),
            y: this.cornerBottomLeft().y + this.hotAreaGap(),
        })
        this.hotCornerBottomRight({
            x: this.cornerBottomRight().x + this.hotAreaGap(),
            y: this.cornerBottomRight().y + this.hotAreaGap(),
        })

        this.hotRotCornerTopLeft({
            x: this.hotCornerTopLeft().x - this.hotAreaSize(),
            y: this.hotCornerTopLeft().y - this.hotAreaSize(),
        })
        this.hotRotCornerTopRight({
            x: this.hotCornerTopRight().x + this.hotAreaSize(),
            y: this.hotCornerTopRight().y - this.hotAreaSize(),
        })
        this.hotRotCornerBottomLeft({
            x: this.hotCornerBottomLeft().x - this.hotAreaSize(),
            y: this.hotCornerBottomLeft().y + this.hotAreaSize(),
        })
        this.hotRotCornerBottomRight({
            x: this.hotCornerBottomRight().x + this.hotAreaSize(),
            y: this.hotCornerBottomRight().y + this.hotAreaSize(),
        })

        this.hotRotatableAreaTopLeft({
            topLeft: {
                x: this.hotRotCornerTopLeft().x,
                y: this.hotRotCornerTopLeft().y,
            },
            topRight: {
                x: this.hotRotCornerTopLeft().x + this.hotAreaSize(),
                y: this.hotRotCornerTopLeft().y,
            },
            bottomLeft: {
                x: this.hotRotCornerTopLeft().x,
                y: this.hotRotCornerTopLeft().y + this.hotAreaSize(),
            },
            bottomRight: {
                x: this.hotRotCornerTopLeft().x + this.hotAreaSize(),
                y: this.hotRotCornerTopLeft().y + this.hotAreaSize(),
            },
        })
        this.hotRotatableAreaTopRight({
            topLeft: {
                x: this.hotRotCornerTopRight().x - this.hotAreaSize(),
                y: this.hotRotCornerTopRight().y,
            },
            topRight: {
                x: this.hotRotCornerTopRight().x,
                y: this.hotRotCornerTopRight().y,
            },
            bottomLeft: {
                x: this.hotRotCornerTopRight().x - this.hotAreaSize(),
                y: this.hotRotCornerTopRight().y + this.hotAreaSize(),
            },
            bottomRight: {
                x: this.hotRotCornerTopRight().x,
                y: this.hotRotCornerTopRight().y + this.hotAreaSize(),
            },
        })
        this.hotRotatableAreaBottomLeft({
            topLeft: {
                x: this.hotRotCornerBottomLeft().x,
                y: this.hotRotCornerBottomLeft().y - this.hotAreaSize(),
            },
            topRight: {
                x: this.hotRotCornerBottomLeft().x + this.hotAreaSize(),
                y: this.hotRotCornerBottomLeft().y - this.hotAreaSize(),
            },
            bottomLeft: {
                x: this.hotRotCornerBottomLeft().x,
                y: this.hotRotCornerBottomLeft().y,
            },
            bottomRight: {
                x: this.hotRotCornerBottomLeft().x + this.hotAreaSize(),
                y: this.hotRotCornerBottomLeft().y,
            },
        })
        this.hotRotatableAreaBottomRight({
            topLeft: {
                x: this.hotRotCornerBottomRight().x - this.hotAreaSize(),
                y: this.hotRotCornerBottomRight().y - this.hotAreaSize(),
            },
            topRight: {
                x: this.hotRotCornerBottomRight().x,
                y: this.hotRotCornerBottomRight().y - this.hotAreaSize(),
            },
            bottomLeft: {
                x: this.hotRotCornerBottomRight().x - this.hotAreaSize(),
                y: this.hotRotCornerBottomRight().y,
            },
            bottomRight: {
                x: this.hotRotCornerBottomRight().x,
                y: this.hotRotCornerBottomRight().y,
            },
        })

        this.hotResizableAreaTopLeft({
            topLeft: {
                x: this.hotCornerTopLeft().x,
                y: this.hotCornerTopLeft().y,
            },
            topRight: {
                x: this.hotCornerTopLeft().x + this.hotAreaSize(),
                y: this.hotCornerTopLeft().y,
            },
            bottomLeft: {
                x: this.hotCornerTopLeft().x,
                y: this.hotCornerTopLeft().y + this.hotAreaSize(),
            },
            bottomRight: {
                x: this.hotCornerTopLeft().x + this.hotAreaSize(),
                y: this.hotCornerTopLeft().y + this.hotAreaSize(),
            },
        })
        this.hotResizableAreaTopRight({
            topLeft: {
                x: this.hotCornerTopRight().x - this.hotAreaSize(),
                y: this.hotCornerTopRight().y,
            },
            topRight: {
                x: this.hotCornerTopRight().x,
                y: this.hotCornerTopRight().y,
            },
            bottomLeft: {
                x: this.hotCornerTopRight().x - this.hotAreaSize(),
                y: this.hotCornerTopRight().y + this.hotAreaSize(),
            },
            bottomRight: {
                x: this.hotCornerTopRight().x,
                y: this.hotCornerTopRight().y + this.hotAreaSize(),
            },
        })
        this.hotResizableAreaBottomLeft({
            topLeft: {
                x: this.hotCornerBottomLeft().x,
                y: this.hotCornerBottomLeft().y - this.hotAreaSize(),
            },
            topRight: {
                x: this.hotCornerBottomLeft().x + this.hotAreaSize(),
                y: this.hotCornerBottomLeft().y - this.hotAreaSize(),
            },
            bottomLeft: {
                x: this.hotCornerBottomLeft().x,
                y: this.hotCornerBottomLeft().y,
            },
            bottomRight: {
                x: this.hotCornerBottomLeft().x + this.hotAreaSize(),
                y: this.hotCornerBottomLeft().y,
            },
        })
        this.hotResizableAreaBottomRight({
            topLeft: {
                x: this.hotCornerBottomRight().x - this.hotAreaSize(),
                y: this.hotCornerBottomRight().y - this.hotAreaSize(),
            },
            topRight: {
                x: this.hotCornerBottomRight().x,
                y: this.hotCornerBottomRight().y - this.hotAreaSize(),
            },
            bottomLeft: {
                x: this.hotCornerBottomRight().x - this.hotAreaSize(),
                y: this.hotCornerBottomRight().y,
            },
            bottomRight: {
                x: this.hotCornerBottomRight().x,
                y: this.hotCornerBottomRight().y,
            },
        })
        this.hotResizableAreaTop({
            topLeft: {
                x: this.hotCornerTopLeft().x,
                y: this.hotCornerTopLeft().y,
            },
            topRight: {
                x: this.hotCornerTopRight().x,
                y: this.hotCornerTopRight().y,
            },
            bottomLeft: {
                x: this.hotCornerTopLeft().x,
                y: this.hotCornerTopLeft().y + this.hotAreaSize(),
            },
            bottomRight: {
                x: this.hotCornerTopRight().x,
                y: this.hotCornerTopRight().y + this.hotAreaSize(),
            },
        })
        this.hotResizableAreaRight({
            topLeft: {
                x: this.hotCornerTopRight().x - this.hotAreaSize(),
                y: this.hotCornerTopRight().y,
            },
            topRight: {
                x: this.hotCornerTopRight().x,
                y: this.hotCornerTopRight().y,
            },
            bottomLeft: {
                x: this.hotCornerBottomRight().x - this.hotAreaSize(),
                y: this.hotCornerBottomRight().y,
            },
            bottomRight: {
                x: this.hotCornerBottomRight().x,
                y: this.hotCornerBottomRight().y,
            },
        })
        this.hotResizableAreaLeft({
            topLeft: {
                x: this.hotCornerTopLeft().x,
                y: this.hotCornerTopLeft().y,
            },
            topRight: {
                x: this.hotCornerTopLeft().x + this.hotAreaSize(),
                y: this.hotCornerTopLeft().y,
            },
            bottomLeft: {
                x: this.hotCornerBottomLeft().x,
                y: this.hotCornerBottomLeft().y,
            },
            bottomRight: {
                x: this.hotCornerBottomLeft().x + this.hotAreaSize(),
                y: this.hotCornerBottomLeft().y,
            },
        })
        this.hotResizableAreaBottom({
            topLeft: {
                x: this.hotCornerBottomLeft().x,
                y: this.hotCornerBottomLeft().y - this.hotAreaSize(),
            },
            topRight: {
                x: this.hotCornerBottomRight().x,
                y: this.hotCornerBottomRight().y - this.hotAreaSize(),
            },
            bottomLeft: {
                x: this.hotCornerBottomLeft().x,
                y: this.hotCornerBottomLeft().y,
            },
            bottomRight: {
                x: this.hotCornerBottomRight().x,
                y: this.hotCornerBottomRight().y,
            },
        })

        this.#rotationCorners = {
            topLeft: { ...this.hotRotCornerTopLeft() },
            bottomLeft: { ...this.hotRotCornerBottomLeft() },
            topRight: { ...this.hotRotCornerTopRight() },
            bottomRight: { ...this.hotRotCornerBottomRight() },
        }

        this.#updateCornerByRot(this.rotate())
    }

    get __isHidden() {
        return this.hidden() || this.__hidden
    }

    get __isHorizontalFlipped() {
        let topLeft = this.cornerTopLeft()
        let topRight = this.cornerTopRight()
        let bottomLeft = this.cornerBottomLeft()
        let bottomRight = this.cornerBottomRight()
        if (this.rotate() !== 0) {
            topLeft = this.__rotateCorners(
                this.cornerTopLeft().x,
                this.cornerTopLeft().y,
                0
            )
            topRight = this.__rotateCorners(
                this.cornerTopRight().x,
                this.cornerTopRight().y,
                0
            )
            bottomLeft = this.__rotateCorners(
                this.cornerBottomLeft().x,
                this.cornerBottomLeft().y,
                0
            )
            bottomRight = this.__rotateCorners(
                this.cornerBottomRight().x,
                this.cornerBottomRight().y,
                0
            )
        }
        if (topLeft.x > topRight.x || bottomLeft.x > bottomRight.x) return true
        return false
    }
    get __isVerticalFlipped() {
        let topLeft = this.cornerTopLeft()
        let topRight = this.cornerTopRight()
        let bottomLeft = this.cornerBottomLeft()
        let bottomRight = this.cornerBottomRight()
        if (this.rotate() !== 0) {
            topLeft = this.__rotateCorners(
                this.cornerTopLeft().x,
                this.cornerTopLeft().y,
                0
            )
            topRight = this.__rotateCorners(
                this.cornerTopRight().x,
                this.cornerTopRight().y,
                0
            )
            bottomLeft = this.__rotateCorners(
                this.cornerBottomLeft().x,
                this.cornerBottomLeft().y,
                0
            )
            bottomRight = this.__rotateCorners(
                this.cornerBottomRight().x,
                this.cornerBottomRight().y,
                0
            )
        }
        if (topLeft.y > bottomLeft.y || topRight.y > bottomRight.y) return true
        return false
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
                } else if (val.endsWith('vh') && widthRelated === false)
                    return (fromVH(
                        Number(val.split('vh')[0]),
                        this.canvas?.height || 1
                    ) - space) as O
                else if (val.endsWith('vw') && widthRelated === true)
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
        const important =
            this.ownOptions.important?.[option] !== undefined
                ? this.ownOptions.important?.[option]
                : opt
        const oldVal = this.ownOptions[option]
        const cached = this.__cacheOption(important, option, defaultOpt)
        let val = this.__unitConverter<T, O>({
            val: cached as any,
            widthRelated: widthRelated,
        })
        this.setChangeCache(option, oldVal)
        return val
    }

    __cacheOption<T, O>(
        opt: T,
        option: keyof IBlock<IBlockOptions>,
        defaultOpt: O
    ) {
        // @Todo: fix type issue over the generic readonly a.k.a (as any)
        if (opt !== undefined) (this.ownOptions[option] as any) = opt
        else if (this.ownOptions[option] === undefined)
            (this.ownOptions[option] as any) = defaultOpt
        return this.ownOptions[option]
    }

    setChangeCache(option: string, old?: any) {
        this.#changedCache[option] = { oldValue: old }
    }

    getCacheValue(option: string) {
        return this.#changedCache[option]?.oldValue
    }

    optionHasChanged(option: string, currentVal?: any) {
        if (this.#changedCache[option]) {
            if (Object.hasOwn(this.ownOptions, option))
                currentVal = this.ownOptions[option]
            const changed = this.#changedCache[option].oldValue !== currentVal
            this.setChangeCache(option, currentVal)
            return changed
        }
        return false
    }

    get cacheChanges() {
        return this.#changedCache
    }

    x(opt?: RelativeType): number {
        let cacheX = this.__unitConverter<RelativeType, number>({
            val: this.ownOptions.x || 0,
            widthRelated: true,
        })
        const x = this.__valueHandler(opt, 'x', 0, true)
        const diffX = x - cacheX
        if (diffX !== 0) {
            const cacheR = this.rotate()
            this.rotate(0)
            this.rotationCenterX(this.rotationCenterX() + diffX)
            this.cornerTopLeft({
                x: this.cornerTopLeft().x + diffX,
                y: this.cornerTopLeft().y,
            })
            this.cornerTopRight({
                x: this.cornerTopRight().x + diffX,
                y: this.cornerTopRight().y,
            })
            this.cornerBottomLeft({
                x: this.cornerBottomLeft().x + diffX,
                y: this.cornerBottomLeft().y,
            })
            this.cornerBottomRight({
                x: this.cornerBottomRight().x + diffX,
                y: this.cornerBottomRight().y,
            })
            if (this.#overflowXscrollBar.block)
                this.#overflowXscrollBar.outerBarCordinates.x += diffX
            if (this.#overflowYscrollBar.block)
                this.#overflowYscrollBar.outerBarCordinates.x += diffX
            this.rotate(cacheR)
        }
        return x
    }

    y(opt?: RelativeType): number {
        let cacheY = this.__unitConverter<RelativeType, number>({
            val: this.ownOptions.y || 0,
            widthRelated: false,
        })
        const y = this.__valueHandler(opt, 'y', 0, false)
        const diffY = y - cacheY
        if (cacheY !== y && diffY !== 0) {
            const cacheR = this.rotate()
            this.rotate(0)
            this.rotationCenterY(this.rotationCenterY() + diffY)
            this.cornerTopLeft({
                x: this.cornerTopLeft().x,
                y: this.cornerTopLeft().y + diffY,
            })
            this.cornerTopRight({
                x: this.cornerTopRight().x,
                y: this.cornerTopRight().y + diffY,
            })
            this.cornerBottomLeft({
                x: this.cornerBottomLeft().x,
                y: this.cornerBottomLeft().y + diffY,
            })
            this.cornerBottomRight({
                x: this.cornerBottomRight().x,
                y: this.cornerBottomRight().y + diffY,
            })
            if (this.#overflowXscrollBar.block)
                this.#overflowXscrollBar.outerBarCordinates.y += diffY
            if (this.#overflowYscrollBar.block)
                this.#overflowYscrollBar.outerBarCordinates.y += diffY
            this.rotate(cacheR)
        }
        return y
    }

    width(opt?: RelativeType): number {
        let cacheW = this.__unitConverter<RelativeType, number>({
            val: this.ownOptions.width || 0,
            widthRelated: true,
        })

        let w = this.__valueHandler(opt, 'width', 0, true)
        if (w < this.minWidth() && !this.horizontalFlipResize())
            return this.minWidth()
        if (w > this.maxWidth()) w = this.ownOptions.width = this.maxWidth()

        const diffW = w - cacheW
        if (diffW !== 0) {
            const cacheR = this.rotate()
            this.rotate(0)
            this.rotationCenterX(this.rotationCenterX() + diffW / 2)
            this.cornerTopRight({
                x: this.cornerTopRight().x + diffW,
                y: this.cornerTopRight().y,
            })
            this.cornerBottomRight({
                x: this.cornerBottomRight().x + diffW,
                y: this.cornerBottomRight().y,
            })
            if (this.#overflowXscrollBar.block)
                this.#overflowXscrollBar.outerBarCordinates.width += diffW
            if (this.#overflowYscrollBar.block) {
                this.#overflowYscrollBar.outerBarCordinates.x += diffW
                this.#overflowYscrollBar.outerBarCordinates.width =
                    w < OVERFLOW_AREA_GAP ? w : OVERFLOW_AREA_GAP
            }
            this.rotate(cacheR)
        }
        return w
    }

    height(opt?: RelativeType): number {
        let cacheH = this.__unitConverter<RelativeType, number>({
            val: this.ownOptions.height || 0,
            widthRelated: false,
        })
        let h = this.__valueHandler(opt, 'height', 0, false)
        if (h < this.minHeight() && !this.verticalFlipResize())
            return this.minHeight()
        if (h > this.maxHeight()) h = this.ownOptions.height = this.maxHeight()

        const diffH = h - cacheH
        if (diffH !== 0) {
            const cacheR = this.rotate()
            this.rotate(0)
            this.rotationCenterY(this.rotationCenterY() + diffH / 2)
            this.cornerBottomLeft({
                x: this.cornerBottomLeft().x,
                y: this.cornerBottomLeft().y + diffH,
            })
            this.cornerBottomRight({
                x: this.cornerBottomRight().x,
                y: this.cornerBottomRight().y + diffH,
            })
            if (this.#overflowXscrollBar.block) {
                this.#overflowXscrollBar.outerBarCordinates.y += diffH
                this.#overflowXscrollBar.outerBarCordinates.height =
                    h < OVERFLOW_AREA_GAP ? h : OVERFLOW_AREA_GAP
            }
            if (this.#overflowYscrollBar.block)
                this.#overflowYscrollBar.outerBarCordinates.height += diffH
            this.rotate(cacheR)
        }
        return h
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
        // @TODO: z index has no effect on the static
        const pos = this.__valueHandler<Position, Position | undefined>(
            opt,
            'position',
            undefined
        )
        if (pos === 'fixed') {
            if (this.top() !== undefined) this.y(this.top()!)
            else if (this.bottom() !== undefined)
                this.y(
                    Math.abs((this.canvas?.height || 1) - this.height()) -
                        this.bottom()!
                )
            if (this.left() !== undefined) this.x(this.left()!)
            else if (this.right() !== undefined)
                this.x(
                    +Math.abs((this.canvas?.width || 1) - this.width()) -
                        this.right()!
                )
        } else if (pos === 'sticky') {
            if (this.top() !== undefined && this.__getTop.y <= this.top()!) {
                this.y(this.top())
            } else if (
                this.bottom() !== undefined &&
                this.__getBottom.y >=
                    (this.canvas?.height || 1) - this.bottom()!
            ) {
                this.y(
                    Math.abs((this.canvas?.height || 1) - this.height()) -
                        this.bottom()!
                )
            }
            if (this.left() !== undefined && this.__getLeft.x <= this.left()!) {
                this.x(this.left())
            } else if (
                this.right() !== undefined &&
                this.__getRight.x >= (this.canvas?.width || 1) - this.right()!
            ) {
                this.x(
                    Math.abs((this.canvas?.width || 1) - this.width()) -
                        this.right()!
                )
            }
        } else if (pos === 'absolute') {
            if (this.left() !== undefined) this.x(this.left()!)
            else if (this.right() !== undefined)
                this.x(
                    Math.abs((this.canvas?.width || 1) - this.width()) -
                        this.right()!
                )
            if (this.top() !== undefined) {
                this.y(this.top())
            } else if (this.bottom() !== undefined)
                this.y(
                    Math.abs((this.canvas?.height || 1) - this.height()) -
                        this.bottom()!
                )
        } else if (pos === 'relative') {
            const parent = this.#hasParentBlock
            if (this.left() !== undefined) {
                const leftX = parent ? this.x() : 0
                this.x(leftX + this.left()!)
            } else if (this.right() !== undefined) {
                let rightX = 0
                if (!parent)
                    rightX =
                        Math.abs(this.__parentWidth - this.width()) -
                        this.right()!
                else
                    rightX =
                        this.x() +
                        (Math.abs(
                            this.__parentWidth -
                                (this.width() + this.parentNode!.__widthSpaces)
                        ) -
                            this.right()!)
                this.x(rightX)
            }
            if (this.top() !== undefined) {
                const topY = parent ? this.y() : 0
                this.y(topY + this.top()!)
            } else if (this.bottom() !== undefined) {
                let bottomY = 0
                if (!parent)
                    bottomY =
                        Math.abs(this.__parentHeight - this.height()) -
                        this.bottom()!
                else
                    bottomY =
                        this.y() +
                        (Math.abs(
                            this.__parentHeight -
                                (this.height() +
                                    this.parentNode!.__heightSpaces)
                        ) -
                            this.bottom()!)
                this.y(bottomY)
            }
        }

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
    padding(opt?: PaddingType): number[] {
        const padding = this.__valueHandler(opt, 'padding', [])
        if (typeof padding === 'number') {
            this.paddingTop(padding)
            this.paddingBottom(padding)
            this.paddingLeft(padding)
            this.paddingRight(padding)
            return padding
        }
        if (padding[0] !== undefined) this.paddingTop(padding[0] || 0)

        switch (padding.length) {
            case 1:
                if (padding[0] !== undefined) {
                    this.paddingBottom(padding[0])
                    this.paddingLeft(padding[0])
                    this.paddingRight(padding[0])
                }
                break
            case 2:
                if (padding[0] !== undefined) this.paddingBottom(padding[0])
                if (padding[1] !== undefined) {
                    this.paddingLeft(padding[1])
                    this.paddingRight(padding[1])
                }
                break
            case 3:
                if (padding[1] !== undefined) {
                    this.paddingLeft(padding[1])
                    this.paddingRight(padding[1])
                }
                if (padding[2] !== undefined) this.paddingBottom(padding[2])
                break
            case 4:
                if (padding[1] !== undefined) this.paddingRight(padding[1])
                if (padding[2] !== undefined) this.paddingBottom(padding[2])
                if (padding[3] !== undefined) this.paddingLeft(padding[3])
                break
        }
        return padding
    }
    paddingTop(opt?: RelativeType) {
        const cacheP =
            this.__unitConverter<RelativeType, number>({
                val: this.ownOptions.paddingTop,
                widthRelated: false,
            }) || 0
        const p = this.__valueHandler(opt, 'paddingTop', 0, false)
        const diffP = p - cacheP
        if (diffP !== 0) this.height(this.height() + diffP)
        return p
    }
    paddingBottom(opt?: RelativeType) {
        const cacheP =
            this.__unitConverter<RelativeType, number>({
                val: this.ownOptions.paddingBottom,
                widthRelated: false,
            }) || 0
        const p = this.__valueHandler(opt, 'paddingBottom', 0, false)
        const diffP = p - cacheP
        if (diffP !== 0) this.height(this.height() + diffP)
        return p
    }
    paddingLeft(opt?: RelativeType) {
        const cacheP =
            this.__unitConverter<RelativeType, number>({
                val: this.ownOptions.paddingLeft,
                widthRelated: false,
            }) || 0
        const p = this.__valueHandler(opt, 'paddingLeft', 0, false)
        const diffP = p - cacheP
        if (diffP !== 0) this.width(this.width() + diffP)
        return p
    }
    paddingRight(opt?: RelativeType) {
        const cacheP =
            this.__unitConverter<RelativeType, number>({
                val: this.ownOptions.paddingRight,
                widthRelated: false,
            }) || 0
        const p = this.__valueHandler(opt, 'paddingRight', 0, false)
        const diffP = p - cacheP
        if (diffP !== 0) this.width(this.width() + diffP)
        return p
    }
    margin(opt?: MarginType): number[] {
        const margin = this.__valueHandler(opt, 'margin', [])
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
        return margin
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
        const cacheCords = this.ownOptions.cornerTopLeft || { x: 0, y: 0 }
        const corner = this.__valueHandler(opt, 'cornerTopLeft', {
            x: 0,
            y: 0,
        })
        const diffX = corner.x - cacheCords.x
        if (diffX !== 0) {
            this.hotCornerTopLeft({
                x: this.hotCornerTopLeft().x + diffX,
                y: this.hotCornerTopLeft().y,
            })
            this.hotRotCornerTopLeft({
                x: this.hotRotCornerTopLeft().x + diffX,
                y: this.hotRotCornerTopLeft().y,
            })
        }
        const diffY = corner.y - cacheCords.y
        if (diffY !== 0) {
            this.hotCornerTopLeft({
                x: this.hotCornerTopLeft().x,
                y: this.hotCornerTopLeft().y + diffY,
            })
            this.hotRotCornerTopLeft({
                x: this.hotRotCornerTopLeft().x,
                y: this.hotRotCornerTopLeft().y + diffY,
            })
        }
        return corner
    }

    cornerTopRight(opt?: XY) {
        const cacheCords = this.ownOptions.cornerTopRight || { x: 0, y: 0 }
        const corner = this.__valueHandler(opt, 'cornerTopRight', {
            x: 0,
            y: 0,
        })
        const diffX = corner.x - cacheCords.x
        if (diffX !== 0) {
            this.hotCornerTopRight({
                x: this.hotCornerTopRight().x + diffX,
                y: this.hotCornerTopRight().y,
            })
            this.hotRotCornerTopRight({
                x: this.hotRotCornerTopRight().x + diffX,
                y: this.hotRotCornerTopRight().y,
            })
        }
        const diffY = corner.y - cacheCords.y
        if (diffY !== 0) {
            this.hotCornerTopRight({
                x: this.hotCornerTopRight().x,
                y: this.hotCornerTopRight().y + diffY,
            })
            this.hotRotCornerTopRight({
                x: this.hotRotCornerTopRight().x,
                y: this.hotRotCornerTopRight().y + diffY,
            })
        }
        return corner
    }

    cornerBottomLeft(opt?: XY) {
        const cacheCords = this.ownOptions.cornerBottomLeft || { x: 0, y: 0 }
        const corner = this.__valueHandler(opt, 'cornerBottomLeft', {
            x: 0,
            y: 0,
        })
        const diffX = corner.x - cacheCords.x
        if (diffX !== 0) {
            this.hotCornerBottomLeft({
                x: this.hotCornerBottomLeft().x + diffX,
                y: this.hotCornerBottomLeft().y,
            })
            this.hotRotCornerBottomLeft({
                x: this.hotRotCornerBottomLeft().x + diffX,
                y: this.hotRotCornerBottomLeft().y,
            })
        }
        const diffY = corner.y - cacheCords.y
        if (diffY !== 0) {
            this.hotCornerBottomLeft({
                x: this.hotCornerBottomLeft().x,
                y: this.hotCornerBottomLeft().y + diffY,
            })
            this.hotRotCornerBottomLeft({
                x: this.hotRotCornerBottomLeft().x,
                y: this.hotRotCornerBottomLeft().y + diffY,
            })
        }
        return corner
    }

    cornerBottomRight(opt?: XY) {
        const cacheCords = this.ownOptions.cornerBottomRight || { x: 0, y: 0 }
        const corner = this.__valueHandler(opt, 'cornerBottomRight', {
            x: 0,
            y: 0,
        })
        const diffX = corner.x - cacheCords.x
        if (diffX !== 0) {
            this.hotCornerBottomRight({
                x: this.hotCornerBottomRight().x + diffX,
                y: this.hotCornerBottomRight().y,
            })
            this.hotRotCornerBottomRight({
                x: this.hotRotCornerBottomRight().x + diffX,
                y: this.hotRotCornerBottomRight().y,
            })
        }
        const diffY = corner.y - cacheCords.y
        if (diffY !== 0) {
            this.hotCornerBottomRight({
                x: this.hotCornerBottomRight().x,
                y: this.hotCornerBottomRight().y + diffY,
            })
            this.hotRotCornerBottomRight({
                x: this.hotRotCornerBottomRight().x,
                y: this.hotRotCornerBottomRight().y + diffY,
            })
        }
        return corner
    }

    hotCornerTopLeft(opt?: XY) {
        const cacheCords = this.ownOptions.hotCornerTopLeft || { x: 0, y: 0 }
        const corner = this.__valueHandler(opt, 'hotCornerTopLeft', {
            x: 0,
            y: 0,
        })
        const diffX = corner.x - cacheCords.x
        if (diffX !== 0) {
            this.#updateAreaCordX('hotResizableAreaTopLeft', diffX)
            if (this.ownOptions.hotResizableAreaTop) {
                this.ownOptions.hotResizableAreaTop.topLeft.x += diffX
                this.ownOptions.hotResizableAreaTop.bottomLeft.x += diffX
            }
            if (this.ownOptions.hotResizableAreaLeft) {
                this.ownOptions.hotResizableAreaLeft.topLeft.x += diffX
                this.ownOptions.hotResizableAreaLeft.topRight.x += diffX
            }
        }
        const diffY = corner.y - cacheCords.y
        if (diffY !== 0) {
            this.#updateAreaCordY('hotResizableAreaTopLeft', diffY)
            if (this.ownOptions.hotResizableAreaTop) {
                this.ownOptions.hotResizableAreaTop.topLeft.y += diffY
                this.ownOptions.hotResizableAreaTop.bottomLeft.y += diffY
            }
            if (this.ownOptions.hotResizableAreaLeft) {
                this.ownOptions.hotResizableAreaLeft.topLeft.y += diffY
                this.ownOptions.hotResizableAreaLeft.topRight.y += diffY
            }
        }
        return corner
    }

    hotCornerTopRight(opt?: XY) {
        const cacheCords = this.ownOptions.hotCornerTopRight || { x: 0, y: 0 }
        const corner = this.__valueHandler(opt, 'hotCornerTopRight', {
            x: 0,
            y: 0,
        })
        const diffX = corner.x - cacheCords.x
        if (diffX !== 0) {
            this.#updateAreaCordX('hotResizableAreaTopRight', diffX)
            if (this.ownOptions.hotResizableAreaTop) {
                this.ownOptions.hotResizableAreaTop.topRight.x += diffX
                this.ownOptions.hotResizableAreaTop.bottomRight.x += diffX
            }
            if (this.ownOptions.hotResizableAreaRight) {
                this.ownOptions.hotResizableAreaRight.topRight.x += diffX
                this.ownOptions.hotResizableAreaRight.topLeft.x += diffX
            }
        }
        const diffY = corner.y - cacheCords.y
        if (diffY !== 0) {
            this.#updateAreaCordY('hotResizableAreaTopRight', diffY)
            if (this.ownOptions.hotResizableAreaTop) {
                this.ownOptions.hotResizableAreaTop.topRight.y += diffY
                this.ownOptions.hotResizableAreaTop.bottomRight.y += diffY
            }
            if (this.ownOptions.hotResizableAreaRight) {
                this.ownOptions.hotResizableAreaRight.topRight.y += diffY
                this.ownOptions.hotResizableAreaRight.topLeft.y += diffY
            }
        }
        return corner
    }

    hotCornerBottomLeft(opt?: XY) {
        const cacheCords = this.ownOptions.hotCornerBottomLeft || {
            x: 0,
            y: 0,
        }
        const corner = this.__valueHandler(opt, 'hotCornerBottomLeft', {
            x: 0,
            y: 0,
        })
        const diffX = corner.x - cacheCords.x
        if (diffX !== 0) {
            this.#updateAreaCordX('hotResizableAreaBottomLeft', diffX)
            if (this.ownOptions.hotResizableAreaBottom) {
                this.ownOptions.hotResizableAreaBottom.topLeft.x += diffX
                this.ownOptions.hotResizableAreaBottom.bottomLeft.x += diffX
            }
            if (this.ownOptions.hotResizableAreaLeft) {
                this.ownOptions.hotResizableAreaLeft.bottomLeft.x += diffX
                this.ownOptions.hotResizableAreaLeft.bottomRight.x += diffX
            }
        }
        const diffY = corner.y - cacheCords.y
        if (diffY !== 0) {
            this.#updateAreaCordY('hotResizableAreaBottomLeft', diffY)
            if (this.ownOptions.hotResizableAreaBottom) {
                this.ownOptions.hotResizableAreaBottom.topLeft.y += diffY
                this.ownOptions.hotResizableAreaBottom.bottomLeft.y += diffY
            }
            if (this.ownOptions.hotResizableAreaLeft) {
                this.ownOptions.hotResizableAreaLeft.bottomLeft.y += diffY
                this.ownOptions.hotResizableAreaLeft.bottomRight.y += diffY
            }
        }
        return corner
    }

    hotCornerBottomRight(opt?: XY) {
        const cacheCords = this.ownOptions.hotCornerBottomRight || {
            x: 0,
            y: 0,
        }
        const corner = this.__valueHandler(opt, 'hotCornerBottomRight', {
            x: 0,
            y: 0,
        })
        const diffX = corner.x - cacheCords.x
        if (diffX !== 0) {
            this.#updateAreaCordX('hotResizableAreaBottomRight', diffX)
            if (this.ownOptions.hotResizableAreaBottom) {
                this.ownOptions.hotResizableAreaBottom.topRight.x += diffX
                this.ownOptions.hotResizableAreaBottom.bottomRight.x += diffX
            }
            if (this.ownOptions.hotResizableAreaRight) {
                this.ownOptions.hotResizableAreaRight.bottomRight.x += diffX
                this.ownOptions.hotResizableAreaRight.bottomLeft.x += diffX
            }
        }
        const diffY = corner.y - cacheCords.y
        if (diffY !== 0) {
            this.#updateAreaCordY('hotResizableAreaBottomRight', diffY)
            if (this.ownOptions.hotResizableAreaBottom) {
                this.ownOptions.hotResizableAreaBottom.topRight.y += diffY
                this.ownOptions.hotResizableAreaBottom.bottomRight.y += diffY
            }
            if (this.ownOptions.hotResizableAreaRight) {
                this.ownOptions.hotResizableAreaRight.bottomRight.y += diffY
                this.ownOptions.hotResizableAreaRight.bottomLeft.y += diffY
            }
        }
        return corner
    }

    hotRotCornerTopLeft(opt?: XY) {
        const cacheCorner = this.ownOptions.hotRotCornerTopLeft || {
            x: 0,
            y: 0,
        }
        const corner = this.__valueHandler(opt, 'hotRotCornerTopLeft', {
            x: 0,
            y: 0,
        })
        const diffX = corner.x - cacheCorner.x
        if (diffX !== 0) {
            this.#updateAreaCordX('hotRotatableAreaTopLeft', diffX)
            this.#rotationCorners.topLeft.x = corner.x
        }
        const diffY = corner.y - cacheCorner.y
        if (diffY !== 0) {
            this.#updateAreaCordY('hotRotatableAreaTopLeft', diffY)
            this.#rotationCorners.topLeft.y = corner.y
        }
        return corner
    }

    hotRotCornerTopRight(opt?: XY) {
        const cacheCorner = this.ownOptions.hotRotCornerTopRight || {
            x: 0,
            y: 0,
        }
        const corner = this.__valueHandler(opt, 'hotRotCornerTopRight', {
            x: 0,
            y: 0,
        })
        const diffX = corner.x - cacheCorner.x
        if (diffX !== 0) {
            this.#updateAreaCordX('hotRotatableAreaTopRight', diffX)
            this.#rotationCorners.topRight.x = corner.x
        }
        const diffY = corner.y - cacheCorner.y
        if (diffY !== 0) {
            this.#updateAreaCordY('hotRotatableAreaTopRight', diffY)
            this.#rotationCorners.topRight.y = corner.y
        }
        return corner
    }

    hotRotCornerBottomLeft(opt?: XY) {
        const cacheCorner = this.ownOptions.hotRotCornerBottomLeft || {
            x: 0,
            y: 0,
        }
        const corner = this.__valueHandler(opt, 'hotRotCornerBottomLeft', {
            x: 0,
            y: 0,
        })
        const diffX = corner.x - cacheCorner.x
        if (diffX !== 0) {
            this.#updateAreaCordX('hotRotatableAreaBottomLeft', diffX)
            this.#rotationCorners.bottomLeft.x = corner.x
        }
        const diffY = corner.y - cacheCorner.y
        if (diffY !== 0) {
            this.#updateAreaCordY('hotRotatableAreaBottomLeft', diffY)
            this.#rotationCorners.bottomLeft.y = corner.y
        }
        return corner
    }

    hotRotCornerBottomRight(opt?: XY) {
        const cacheCorner = this.ownOptions.hotRotCornerBottomRight || {
            x: 0,
            y: 0,
        }
        const corner = this.__valueHandler(opt, 'hotRotCornerBottomRight', {
            x: 0,
            y: 0,
        })
        const diffX = corner.x - cacheCorner.x
        if (diffX !== 0) {
            this.#updateAreaCordX('hotRotatableAreaBottomRight', diffX)
            this.#rotationCorners.bottomRight.x = corner.x
        }
        const diffY = corner.y - cacheCorner.y
        if (diffY !== 0) {
            this.#updateAreaCordY('hotRotatableAreaBottomRight', diffY)
            this.#rotationCorners.bottomRight.y = corner.y
        }
        return corner
    }

    hotRotatableAreaTopLeft(opt?: HotCornerArea) {
        return this.__valueHandler(opt, 'hotRotatableAreaTopLeft', {
            topLeft: {
                x: 0,
                y: 0,
            },
            topRight: {
                x: 0,
                y: 0,
            },
            bottomLeft: {
                x: 0,
                y: 0,
            },
            bottomRight: {
                x: 0,
                y: 0,
            },
        })
    }

    hotRotatableAreaTopRight(opt?: HotCornerArea) {
        return this.__valueHandler(opt, 'hotRotatableAreaTopRight', {
            topLeft: {
                x: 0,
                y: 0,
            },
            topRight: {
                x: 0,
                y: 0,
            },
            bottomLeft: {
                x: 0,
                y: 0,
            },
            bottomRight: {
                x: 0,
                y: 0,
            },
        })
    }

    hotRotatableAreaBottomLeft(opt?: HotCornerArea) {
        return this.__valueHandler(opt, 'hotRotatableAreaBottomLeft', {
            topLeft: {
                x: 0,
                y: 0,
            },
            topRight: {
                x: 0,
                y: 0,
            },
            bottomLeft: {
                x: 0,
                y: 0,
            },
            bottomRight: {
                x: 0,
                y: 0,
            },
        })
    }

    hotRotatableAreaBottomRight(opt?: HotCornerArea) {
        return this.__valueHandler(opt, 'hotRotatableAreaBottomRight', {
            topLeft: {
                x: 0,
                y: 0,
            },
            topRight: {
                x: 0,
                y: 0,
            },
            bottomLeft: {
                x: 0,
                y: 0,
            },
            bottomRight: {
                x: 0,
                y: 0,
            },
        })
    }

    hotResizableAreaTopLeft(opt?: HotCornerArea) {
        return this.__valueHandler(opt, 'hotResizableAreaTopLeft', {
            topLeft: {
                x: 0,
                y: 0,
            },
            topRight: {
                x: 0,
                y: 0,
            },
            bottomLeft: {
                x: 0,
                y: 0,
            },
            bottomRight: {
                x: 0,
                y: 0,
            },
        })
    }

    hotResizableAreaTopRight(opt?: HotCornerArea) {
        return this.__valueHandler(opt, 'hotResizableAreaTopRight', {
            topLeft: {
                x: 0,
                y: 0,
            },
            topRight: {
                x: 0,
                y: 0,
            },
            bottomLeft: {
                x: 0,
                y: 0,
            },
            bottomRight: {
                x: 0,
                y: 0,
            },
        })
    }

    hotResizableAreaBottomLeft(opt?: HotCornerArea) {
        return this.__valueHandler(opt, 'hotResizableAreaBottomLeft', {
            topLeft: {
                x: 0,
                y: 0,
            },
            topRight: {
                x: 0,
                y: 0,
            },
            bottomLeft: {
                x: 0,
                y: 0,
            },
            bottomRight: {
                x: 0,
                y: 0,
            },
        })
    }

    hotResizableAreaBottomRight(opt?: HotCornerArea) {
        return this.__valueHandler(opt, 'hotResizableAreaBottomRight', {
            topLeft: {
                x: 0,
                y: 0,
            },
            topRight: {
                x: 0,
                y: 0,
            },
            bottomLeft: {
                x: 0,
                y: 0,
            },
            bottomRight: {
                x: 0,
                y: 0,
            },
        })
    }

    hotResizableAreaTop(opt?: HotCornerArea) {
        return this.__valueHandler(opt, 'hotResizableAreaTop', {
            topLeft: {
                x: 0,
                y: 0,
            },
            topRight: {
                x: 0,
                y: 0,
            },
            bottomLeft: {
                x: 0,
                y: 0,
            },
            bottomRight: {
                x: 0,
                y: 0,
            },
        })
    }

    hotResizableAreaBottom(opt?: HotCornerArea) {
        return this.__valueHandler(opt, 'hotResizableAreaBottom', {
            topLeft: {
                x: 0,
                y: 0,
            },
            topRight: {
                x: 0,
                y: 0,
            },
            bottomLeft: {
                x: 0,
                y: 0,
            },
            bottomRight: {
                x: 0,
                y: 0,
            },
        })
    }

    hotResizableAreaLeft(opt?: HotCornerArea) {
        return this.__valueHandler(opt, 'hotResizableAreaLeft', {
            topLeft: {
                x: 0,
                y: 0,
            },
            topRight: {
                x: 0,
                y: 0,
            },
            bottomLeft: {
                x: 0,
                y: 0,
            },
            bottomRight: {
                x: 0,
                y: 0,
            },
        })
    }

    hotResizableAreaRight(opt?: HotCornerArea) {
        return this.__valueHandler(opt, 'hotResizableAreaRight', {
            topLeft: {
                x: 0,
                y: 0,
            },
            topRight: {
                x: 0,
                y: 0,
            },
            bottomLeft: {
                x: 0,
                y: 0,
            },
            bottomRight: {
                x: 0,
                y: 0,
            },
        })
    }

    hotTopFunc(opt?: (context: CanvasRenderingContext2D) => void) {
        return this.__valueHandler<typeof opt, typeof opt>(
            opt,
            'hotTopFunc',
            undefined
        )
    }
    hotLeftFunc(opt?: (context: CanvasRenderingContext2D) => void) {
        return this.__valueHandler<typeof opt, typeof opt>(
            opt,
            'hotLeftFunc',
            undefined
        )
    }
    hotRightFunc(opt?: (context: CanvasRenderingContext2D) => void) {
        return this.__valueHandler<typeof opt, typeof opt>(
            opt,
            'hotRightFunc',
            undefined
        )
    }
    hotBottomFunc(opt?: (context: CanvasRenderingContext2D) => void) {
        return this.__valueHandler<typeof opt, typeof opt>(
            opt,
            'hotBottomFunc',
            undefined
        )
    }
    hotCornerTopLeftFunc(opt?: (context: CanvasRenderingContext2D) => void) {
        return this.__valueHandler<typeof opt, typeof opt>(
            opt,
            'hotCornerTopLeftFunc',
            undefined
        )
    }
    hotCornerTopRightFunc(opt?: (context: CanvasRenderingContext2D) => void) {
        return this.__valueHandler<typeof opt, typeof opt>(
            opt,
            'hotCornerTopRightFunc',
            undefined
        )
    }
    hotCornerBottomLeftFunc(opt?: (context: CanvasRenderingContext2D) => void) {
        return this.__valueHandler<typeof opt, typeof opt>(
            opt,
            'hotCornerBottomLeftFunc',
            undefined
        )
    }
    hotCornerBottomRightFunc(
        opt?: (context: CanvasRenderingContext2D) => void
    ) {
        return this.__valueHandler<typeof opt, typeof opt>(
            opt,
            'hotCornerBottomRightFunc',
            undefined
        )
    }

    hotAreaSize(opt?: number) {
        return this.__valueHandler(opt, 'hotAreaSize', 15)
    }
    rotationCenter(opt?: SelfType) {
        return this.__valueHandler(opt, 'rotationCenter', 'self', true)
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
            { ...this.ownOptions.important, ...opt },
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

    zIndex(opt?: number): number | undefined {
        const cacheZ = this.ownOptions.zIndex || undefined
        const z = this.__valueHandler(opt, 'zIndex', undefined)
        if (z !== cacheZ) this.canvas?.refreshHead()
        return z
    }

    set(options: IBlock<IBlockOptions | T>): void {
        let before: any = {}
        let after: any = {}
        for (const [key, value] of Object.entries(options)) {
            const obj = getPrototype(this, key)
            let beforeValue = obj?.value.call(this)
            obj?.value.call(this, value)
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
        const scale = this.__valueHandler(opt, 'scale', 1)
        this.width(this.width() * scale)
        this.height(this.height() * scale)
    }
    __translate(t: { x: number; y: number }) {
        if (
            this.ownOptions.position === 'fixed' ||
            this.ownOptions.position === 'sticky'
        )
            return
        this.x(this.x() + t.x)
        this.y(this.y() + t.y)
        if (
            this.ownOptions.position == 'absolute' ||
            this.ownOptions.position === 'relative'
        ) {
            if (
                this.ownOptions.position === 'relative' &&
                this.#hasParentBlock
            ) {
                if (this.left() !== undefined) this.left(0)
                else if (this.right() !== undefined) this.right(0)
                if (this.top() !== undefined) this.top(0)
                else if (this.bottom() !== undefined) this.bottom(0)
            } else {
                if (this.left() !== undefined) this.left(this.left()! + t.x)
                else if (this.right() !== undefined)
                    this.right(this.right()! - t.x)
                if (this.top() !== undefined) this.top(this.top()! + t.y)
                else if (this.bottom() !== undefined)
                    this.bottom(this.bottom()! - t.y)
            }
        }
    }
    __overflowTranslate(t: { x: number; y: number }) {
        const currentHeight =
            this.height() +
            (this.__overflowCords.height - this.#overflowScrollYHeightCut)
        const currentWidth = this.width() + this.__overflowCords.width

        let xPer = 1
        let yPer = 1
        if (currentHeight < 0)
            yPer = this.__overflowCords.height / -this.height()
        if (currentWidth < 0) xPer = this.__overflowCords.width / -this.width()

        const xPos = this.__overflowCords.x + t.x * xPer
        const yPos = this.__overflowCords.y + t.y * yPer

        if (this.__overflowCords.width < 0) {
            if (xPos < 0)
                this.__overflowCords.x = -clamp(
                    Math.abs(xPos),
                    0,
                    Math.abs(this.__overflowCords.width)
                )
            else this.__overflowCords.x = 0
        }
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

    bind(block: Block, options: (keyof IBlockOptions)[]) {
        this.__bindOptions.push({ bindTo: block, options: options })
    }

    rotate(opt?: number): number {
        const cacheRotate = this.ownOptions['rotate'] || 0
        const rotate = this.__valueHandler(opt, 'rotate', 0)
        const diffR = rotate - cacheRotate
        if (diffR !== 0) this.#updateCornerByRot(diffR)
        return rotate
    }

    #updateCornerByRot(radian: number) {
        this.#updateCornerbyRot('cornerTopLeft', radian)
        this.#updateCornerbyRot('cornerTopRight', radian)
        this.#updateCornerbyRot('cornerBottomLeft', radian)
        this.#updateCornerbyRot('cornerBottomRight', radian)

        this.#updateCornerbyRot('hotCornerTopLeft', radian)
        this.#updateCornerbyRot('hotCornerTopRight', radian)
        this.#updateCornerbyRot('hotCornerBottomLeft', radian)
        this.#updateCornerbyRot('hotCornerBottomRight', radian)

        this.#updateCornerbyRot('hotRotCornerTopLeft', radian)
        this.#updateCornerbyRot('hotRotCornerTopRight', radian)
        this.#updateCornerbyRot('hotRotCornerBottomLeft', radian)
        this.#updateCornerbyRot('hotRotCornerBottomRight', radian)

        this.#updateCornerAreabyRot('hotResizableAreaTopLeft', radian)
        this.#updateCornerAreabyRot('hotResizableAreaTopRight', radian)
        this.#updateCornerAreabyRot('hotResizableAreaBottomLeft', radian)
        this.#updateCornerAreabyRot('hotResizableAreaBottomRight', radian)
        this.#updateCornerAreabyRot('hotResizableAreaTop', radian)
        this.#updateCornerAreabyRot('hotResizableAreaRight', radian)
        this.#updateCornerAreabyRot('hotResizableAreaLeft', radian)
        this.#updateCornerAreabyRot('hotResizableAreaBottom', radian)

        this.#updateCornerAreabyRot('hotRotatableAreaTopLeft', radian)
        this.#updateCornerAreabyRot('hotRotatableAreaTopRight', radian)
        this.#updateCornerAreabyRot('hotRotatableAreaBottomLeft', radian)
        this.#updateCornerAreabyRot('hotRotatableAreaBottomRight', radian)

        if (this.#overflowXscrollBar.block)
            this.#updateOverflowInnerCordsByRotate(
                this.#overflowXscrollBar,
                radian
            )
        if (this.#overflowYscrollBar.block)
            this.#updateOverflowInnerCordsByRotate(
                this.#overflowYscrollBar,
                radian
            )
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

    #updateCornerbyRot(corner: string, diffR: number) {
        const cordsArea = this.ownOptions[corner] as XY
        if (!cordsArea) return
        const c = this.__rotateCorners(cordsArea.x, cordsArea.y, diffR)
        cordsArea.x = c.x
        cordsArea.y = c.y
    }

    #updateCornerAreabyRot(corner: string, diffR: number) {
        const cordsArea = this.ownOptions[corner] as HotCornerArea
        if (!cordsArea) return
        const a = this.__rotateCorners(
            cordsArea.topLeft.x,
            cordsArea.topLeft.y,
            diffR
        )
        const b = this.__rotateCorners(
            cordsArea?.topRight.x,
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

        cordsArea.topLeft = { x: a.x, y: a.y }
        cordsArea.topRight = { x: b.x, y: b.y }
        cordsArea.bottomLeft = { x: c.x, y: c.y }
        cordsArea.bottomRight = { x: d.x, y: d.y }
    }

    #updateOverflowInnerCordsByRotate(
        overflowScrollBar: OverflowScrollBar,
        radian: number
    ) {
        const centerX = this.__getRealCenterX
        const centerY = this.__getRealCenterY

        const topleft = rotateCordinates(
            overflowScrollBar.innerBarCordinates.topLeft.x,
            overflowScrollBar.innerBarCordinates.topLeft.y,
            centerX,
            centerY,
            radian
        )
        const topRight = rotateCordinates(
            overflowScrollBar.innerBarCordinates.topRight.x,
            overflowScrollBar.innerBarCordinates.topRight.y,
            centerX,
            centerY,
            radian
        )
        const bottomLeft = rotateCordinates(
            overflowScrollBar.innerBarCordinates.bottomLeft.x,
            overflowScrollBar.innerBarCordinates.bottomLeft.y,
            centerX,
            centerY,
            radian
        )
        const bottomRight = rotateCordinates(
            overflowScrollBar.innerBarCordinates.bottomRight.x,
            overflowScrollBar.innerBarCordinates.bottomRight.y,
            centerX,
            centerY,
            radian
        )
        overflowScrollBar.innerBarCordinates.topLeft = {
            x: topleft.x,
            y: topleft.y,
        }
        overflowScrollBar.innerBarCordinates.topRight = {
            x: topRight.x,
            y: topRight.y,
        }
        overflowScrollBar.innerBarCordinates.bottomLeft = {
            x: bottomLeft.x,
            y: bottomLeft.y,
        }
        overflowScrollBar.innerBarCordinates.bottomRight = {
            x: bottomRight.x,
            y: bottomRight.y,
        }
    }

    #updateAreaCordX(corner: string, x: number) {
        const cordsArea = this.ownOptions[corner] as HotCornerArea
        if (!cordsArea) return
        cordsArea.topLeft.x += x
        cordsArea.topRight.x += x
        cordsArea.bottomLeft.x += x
        cordsArea.bottomRight.x = cordsArea.bottomRight.x + x
    }

    #updateAreaCordY(corner: string, y: number) {
        const cordsArea = this.ownOptions[corner] as HotCornerArea
        if (!cordsArea) return
        cordsArea.topLeft.y += y
        cordsArea.topRight.y += y
        cordsArea.bottomLeft.y += y
        cordsArea.bottomRight.y += y
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

                const easing = this.#easingHanndler(anime.easing)(
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

    #easingHanndler(easing: Easing): (t: number, duration: number) => number {
        if (easing === 'linear') return linear(0, 1)
        else if (easing == 'step-start') return steps(1, 'jump-start')
        else if (easing == 'step-end') return steps(1, 'jump-end')
        else if (easing == 'ease') return bezierEasing(0.25, 0.1, 0.25, 1)
        else if (easing == 'ease-in') return bezierEasing(0.42, 0, 1, 1)
        else if (easing == 'ease-out') return bezierEasing(0, 0, 0.58, 1)
        else if (easing == 'ease-in-out') return bezierEasing(0.42, 0, 0.58, 1)
        else return easing
    }

    checkInBound(event: MouseEvent): boolean {
        const { x, y } = this.canvas?.getCursorPosition(event) || {
            x: 0,
            y: 0,
        }
        const topLeft = {
            x: this.cornerTopLeft().x,
            y: this.cornerTopLeft().y,
        }
        const topRight = {
            x: this.cornerTopRight().x,
            y: this.cornerTopRight().y,
        }
        const bottomLeft = {
            x: this.cornerBottomLeft().x,
            y: this.cornerBottomLeft().y,
        }
        const bottomRight = {
            x: this.cornerBottomRight().x,
            y: this.cornerBottomRight().y,
        }

        if (this.__isHorizontalFlipped) {
            topLeft.x = this.cornerTopRight().x
            topLeft.y = this.cornerTopRight().y
            topRight.x = this.cornerTopLeft().x
            topRight.y = this.cornerTopLeft().y

            bottomLeft.x = this.cornerBottomRight().x
            bottomLeft.y = this.cornerBottomRight().y
            bottomRight.x = this.cornerBottomLeft().x
            bottomRight.y = this.cornerBottomLeft().y
        }

        if (this.__isVerticalFlipped) {
            if (this.__isHorizontalFlipped) {
                topLeft.x = this.cornerBottomRight().x
                topLeft.y = this.cornerBottomRight().y
                topRight.x = this.cornerBottomLeft().x
                topRight.y = this.cornerBottomLeft().y

                bottomLeft.x = this.cornerTopRight().x
                bottomLeft.y = this.cornerTopRight().y
                bottomRight.x = this.cornerTopLeft().x
                bottomRight.y = this.cornerTopLeft().y
            } else {
                topLeft.x = this.cornerBottomLeft().x
                topLeft.y = this.cornerBottomLeft().y
                topRight.x = this.cornerBottomRight().x
                topRight.y = this.cornerBottomRight().y

                bottomLeft.x = this.cornerTopLeft().x
                bottomLeft.y = this.cornerTopLeft().y
                bottomRight.x = this.cornerTopRight().x
                bottomRight.y = this.cornerTopRight().y
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
            this.canvas?.registerEvent(type, func as CustomEvent<Event>)
        else this.__events[type]['funcs'].push(func)
    }
    selectable(opt?: boolean): boolean {
        const selectable = this.__valueHandler(opt, 'selectable', false)
        if (!selectable) return false

        const click = (e: MouseEvent) => {
            const { x, y } = this.canvas?.getCursorPosition(e) || {
                x: 0,
                y: 0,
            }
            let inBound
            if (this.__runningEvents.selected) {
                inBound = checkInBound(
                    x,
                    y,
                    this.hotCornerTopLeft().x,
                    this.hotCornerTopLeft().y,
                    this.hotCornerTopRight().x,
                    this.hotCornerTopRight().y,
                    this.hotCornerBottomLeft().x,
                    this.hotCornerBottomLeft().y,
                    this.hotCornerBottomRight().x,
                    this.hotCornerBottomRight().y
                )
            } else inBound = this.checkInBound(e)

            if (inBound) {
                this.registerZIndex({ in: this.zIndex() })
                if (this.ImFirst) this.__runningEvents.selected = true
            } else {
                this.registerZIndex({ out: this.zIndex() })
                this.__runningEvents.selected = false
            }
            // Todo: permanent fix, need to fix caching for invokeChange
            if (this.optionHasChanged('setInBound', inBound)) {
                this.invokeChange()
            }
            this.setChangeCache('setInBound', inBound)
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

            let { x, y } = this.canvas?.getCursorPosition(event) || {
                x: 0,
                y: 0,
            }
            if (!this.__runningEvents.rotate) {
                let cursor: string | undefined = undefined
                if (
                    checkInBound(
                        x,
                        y,
                        this.hotRotatableAreaTopLeft().topLeft.x,
                        this.hotRotatableAreaTopLeft().topLeft.y,
                        this.hotRotatableAreaTopLeft().topRight.x,
                        this.hotRotatableAreaTopLeft().topRight.y,
                        this.hotRotatableAreaTopLeft().bottomLeft.x,
                        this.hotRotatableAreaTopLeft().bottomLeft.y,
                        this.hotRotatableAreaTopLeft().bottomRight.x,
                        this.hotRotatableAreaTopLeft().bottomRight.y
                    ) &&
                    this.rotatableTopLeft()
                ) {
                    cursor = 'cell'
                    topMove = true
                    leftMove = true
                } else if (
                    checkInBound(
                        x,
                        y,
                        this.hotRotatableAreaTopRight().topLeft.x,
                        this.hotRotatableAreaTopRight().topLeft.y,
                        this.hotRotatableAreaTopRight().topRight.x,
                        this.hotRotatableAreaTopRight().topRight.y,
                        this.hotRotatableAreaTopRight().bottomLeft.x,
                        this.hotRotatableAreaTopRight().bottomLeft.y,
                        this.hotRotatableAreaTopRight().bottomRight.x,
                        this.hotRotatableAreaTopRight().bottomRight.y
                    ) &&
                    this.rotatableTopRight()
                ) {
                    cursor = 'cell'
                    topMove = true
                    leftMove = false
                } else if (
                    checkInBound(
                        x,
                        y,
                        this.hotRotatableAreaBottomLeft().topLeft.x,
                        this.hotRotatableAreaBottomLeft().topLeft.y,
                        this.hotRotatableAreaBottomLeft().topRight.x,
                        this.hotRotatableAreaBottomLeft().topRight.y,
                        this.hotRotatableAreaBottomLeft().bottomLeft.x,
                        this.hotRotatableAreaBottomLeft().bottomLeft.y,
                        this.hotRotatableAreaBottomLeft().bottomRight.x,
                        this.hotRotatableAreaBottomLeft().bottomRight.y
                    ) &&
                    this.rotatableBottomLeft()
                ) {
                    cursor = 'cell'
                    topMove = false
                    leftMove = true
                } else if (
                    checkInBound(
                        x,
                        y,
                        this.hotRotatableAreaBottomRight().topLeft.x,
                        this.hotRotatableAreaBottomRight().topLeft.y,
                        this.hotRotatableAreaBottomRight().topRight.x,
                        this.hotRotatableAreaBottomRight().topRight.y,
                        this.hotRotatableAreaBottomRight().bottomLeft.x,
                        this.hotRotatableAreaBottomRight().bottomLeft.y,
                        this.hotRotatableAreaBottomRight().bottomRight.x,
                        this.hotRotatableAreaBottomRight().bottomRight.y
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
                    if (topMove && leftMove) {
                        this.rotate(
                            radian -
                                Math.atan2(
                                    this.#rotationCorners.topLeft.y -
                                        this.__getRealCenterY,
                                    this.#rotationCorners.topLeft.x -
                                        this.__getRealCenterX
                                )
                        )
                    } else if (topMove && !leftMove) {
                        this.rotate(
                            radian -
                                Math.atan2(
                                    this.#rotationCorners.topRight.y -
                                        this.__getRealCenterY,
                                    this.#rotationCorners.topRight.x -
                                        this.__getRealCenterX
                                )
                        )
                    } else if (!topMove && !leftMove) {
                        this.rotate(
                            radian -
                                Math.atan2(
                                    this.#rotationCorners.bottomRight.y -
                                        this.__getRealCenterY,
                                    this.#rotationCorners.bottomRight.x -
                                        this.__getRealCenterX
                                )
                        )
                    } else if (!topMove && leftMove) {
                        this.rotate(
                            radian -
                                Math.atan2(
                                    this.#rotationCorners.bottomLeft.y -
                                        this.__getRealCenterY,
                                    this.#rotationCorners.bottomLeft.x -
                                        this.__getRealCenterX
                                )
                        )
                    }
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
                initCords = this.canvas?.getCursorPosition(event) || {
                    x: 0,
                    y: 0,
                }
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

            const { x, y } = this.canvas?.getCursorPosition(event) || {
                x: 0,
                y: 0,
            }
            if (!this.__runningEvents.resize) {
                let cursor: string | undefined = undefined
                bottomResize = rightResize = topResize = leftResize = false
                if (
                    this.resizableLeft() &&
                    (checkInBound(
                        x,
                        y,
                        this.hotResizableAreaLeft().topLeft.x,
                        this.hotResizableAreaLeft().topLeft.y,
                        this.hotResizableAreaLeft().topRight.x,
                        this.hotResizableAreaLeft().topRight.y,
                        this.hotResizableAreaLeft().bottomLeft.x,
                        this.hotResizableAreaLeft().bottomLeft.y,
                        this.hotResizableAreaLeft().bottomRight.x,
                        this.hotResizableAreaLeft().bottomRight.y
                    ) ||
                        checkInBound(
                            x,
                            y,
                            this.hotResizableAreaLeft().bottomLeft.x,
                            this.hotResizableAreaLeft().bottomLeft.y,
                            this.hotResizableAreaLeft().bottomRight.x,
                            this.hotResizableAreaLeft().bottomRight.y,
                            this.hotResizableAreaLeft().topLeft.x,
                            this.hotResizableAreaLeft().topLeft.y,
                            this.hotResizableAreaLeft().topRight.x,
                            this.hotResizableAreaLeft().topRight.y
                        ))
                ) {
                    leftResize = true
                    cursor = 'ew-resize'
                } else if (
                    this.resizableRight() &&
                    (checkInBound(
                        x,
                        y,
                        this.hotResizableAreaRight().topLeft.x,
                        this.hotResizableAreaRight().topLeft.y,
                        this.hotResizableAreaRight().topRight.x,
                        this.hotResizableAreaRight().topRight.y,
                        this.hotResizableAreaRight().bottomLeft.x,
                        this.hotResizableAreaRight().bottomLeft.y,
                        this.hotResizableAreaRight().bottomRight.x,
                        this.hotResizableAreaRight().bottomRight.y
                    ) ||
                        checkInBound(
                            x,
                            y,
                            this.hotResizableAreaRight().bottomLeft.x,
                            this.hotResizableAreaRight().bottomLeft.y,
                            this.hotResizableAreaRight().bottomRight.x,
                            this.hotResizableAreaRight().bottomRight.y,
                            this.hotResizableAreaRight().topLeft.x,
                            this.hotResizableAreaRight().topLeft.y,
                            this.hotResizableAreaRight().topRight.x,
                            this.hotResizableAreaRight().topRight.y
                        ))
                ) {
                    rightResize = true
                    cursor = 'ew-resize'
                } else if (
                    this.resizableTop() &&
                    (checkInBound(
                        x,
                        y,
                        this.hotResizableAreaTop().topLeft.x,
                        this.hotResizableAreaTop().topLeft.y,
                        this.hotResizableAreaTop().topRight.x,
                        this.hotResizableAreaTop().topRight.y,
                        this.hotResizableAreaTop().bottomLeft.x,
                        this.hotResizableAreaTop().bottomLeft.y,
                        this.hotResizableAreaTop().bottomRight.x,
                        this.hotResizableAreaTop().bottomRight.y
                    ) ||
                        checkInBound(
                            x,
                            y,

                            this.hotResizableAreaTop().topRight.x,
                            this.hotResizableAreaTop().topRight.y,
                            this.hotResizableAreaTop().topLeft.x,
                            this.hotResizableAreaTop().topLeft.y,
                            this.hotResizableAreaTop().bottomRight.x,
                            this.hotResizableAreaTop().bottomRight.y,
                            this.hotResizableAreaTop().bottomLeft.x,
                            this.hotResizableAreaTop().bottomLeft.y
                        ))
                ) {
                    topResize = true
                    cursor = 'ns-resize'
                } else if (
                    this.resizableBottom() &&
                    (checkInBound(
                        x,
                        y,
                        this.hotResizableAreaBottom().topLeft.x,
                        this.hotResizableAreaBottom().topLeft.y,
                        this.hotResizableAreaBottom().topRight.x,
                        this.hotResizableAreaBottom().topRight.y,
                        this.hotResizableAreaBottom().bottomLeft.x,
                        this.hotResizableAreaBottom().bottomLeft.y,
                        this.hotResizableAreaBottom().bottomRight.x,
                        this.hotResizableAreaBottom().bottomRight.y
                    ) ||
                        checkInBound(
                            x,
                            y,
                            this.hotResizableAreaBottom().topRight.x,
                            this.hotResizableAreaBottom().topRight.y,
                            this.hotResizableAreaBottom().topLeft.x,
                            this.hotResizableAreaBottom().topLeft.y,
                            this.hotResizableAreaBottom().bottomRight.x,
                            this.hotResizableAreaBottom().bottomRight.y,
                            this.hotResizableAreaBottom().bottomLeft.x,
                            this.hotResizableAreaBottom().bottomLeft.y
                        ))
                ) {
                    cursor = 'ns-resize'
                    bottomResize = true
                }

                if (
                    this.resizableTopLeft() &&
                    checkInBound(
                        x,
                        y,
                        this.hotResizableAreaTopLeft().topLeft.x,
                        this.hotResizableAreaTopLeft().topLeft.y,
                        this.hotResizableAreaTopLeft().topRight.x,
                        this.hotResizableAreaTopLeft().topRight.y,
                        this.hotResizableAreaTopLeft().bottomLeft.x,
                        this.hotResizableAreaTopLeft().bottomLeft.y,
                        this.hotResizableAreaTopLeft().bottomRight.x,
                        this.hotResizableAreaTopLeft().bottomRight.y
                    )
                ) {
                    topResize = true
                    leftResize = true
                    cursor = 'nwse-resize'
                }
                if (
                    this.resizableTopRight() &&
                    checkInBound(
                        x,
                        y,
                        this.hotResizableAreaTopRight().topLeft.x,
                        this.hotResizableAreaTopRight().topLeft.y,
                        this.hotResizableAreaTopRight().topRight.x,
                        this.hotResizableAreaTopRight().topRight.y,
                        this.hotResizableAreaTopRight().bottomLeft.x,
                        this.hotResizableAreaTopRight().bottomLeft.y,
                        this.hotResizableAreaTopRight().bottomRight.x,
                        this.hotResizableAreaTopRight().bottomRight.y
                    )
                ) {
                    topResize = true
                    rightResize = true
                    cursor = 'nesw-resize'
                }
                if (
                    this.resizableBottomLeft() &&
                    checkInBound(
                        x,
                        y,
                        this.hotResizableAreaBottomLeft().topLeft.x,
                        this.hotResizableAreaBottomLeft().topLeft.y,
                        this.hotResizableAreaBottomLeft().topRight.x,
                        this.hotResizableAreaBottomLeft().topRight.y,
                        this.hotResizableAreaBottomLeft().bottomLeft.x,
                        this.hotResizableAreaBottomLeft().bottomLeft.y,
                        this.hotResizableAreaBottomLeft().bottomRight.x,
                        this.hotResizableAreaBottomLeft().bottomRight.y
                    )
                ) {
                    bottomResize = true
                    leftResize = true
                    cursor = 'nesw-resize'
                }
                if (
                    this.resizableBottomRight() &&
                    checkInBound(
                        x,
                        y,
                        this.hotResizableAreaBottomRight().topLeft.x,
                        this.hotResizableAreaBottomRight().topLeft.y,
                        this.hotResizableAreaBottomRight().topRight.x,
                        this.hotResizableAreaBottomRight().topRight.y,
                        this.hotResizableAreaBottomRight().bottomLeft.x,
                        this.hotResizableAreaBottomRight().bottomLeft.y,
                        this.hotResizableAreaBottomRight().bottomRight.x,
                        this.hotResizableAreaBottomRight().bottomRight.y
                    )
                ) {
                    bottomResize = true
                    rightResize = true
                    cursor = 'nwse-resize'
                }
                if (cursor) {
                    inBound = true
                    cursor = this.#chooseCursor(cursor)
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
                    const rightC = this.#rightCornerRad
                    const reverseX =
                        (rightC > 70 && rightC < 180) ||
                        (rightC < -60 && rightC > -180)
                            ? -1
                            : 1
                    const reverseY =
                        (rightC > 70 && rightC < 180) ||
                        (rightC < -60 && rightC > -180)
                            ? -1
                            : 1

                    let diffW = 0
                    let diffH = 0
                    if (diffX !== 0) {
                        diffW = diffX - beforeCords.x
                        beforeCords.x = diffX
                    }
                    if (diffY !== 0) {
                        diffH = diffY - beforeCords.y
                        beforeCords.y = diffY
                    }

                    let diffDx = 0
                    let diffDy = 0

                    if (this.canvas?.currentCursor === 'ew-resize') {
                        diffDx = diffW
                        diffDy = -diffW
                    } else if (this.canvas?.currentCursor === 'ns-resize') {
                        diffDx = diffH
                        diffDy = diffH
                    } else if (
                        this.canvas?.currentCursor === 'nwse-resize' ||
                        this.canvas?.currentCursor === 'nesw-resize'
                    ) {
                        diffDx = diffW
                        diffDy = diffH
                    }
                    if (leftResize) {
                        const widthR = this.width() - diffDx * reverseX
                        if (
                            widthR < this.maxWidth() &&
                            ((widthR > this.minWidth() &&
                                !this.horizontalFlipResize()) ||
                                this.horizontalFlipResize())
                        ) {
                            this.x(this.x() + diffDx * reverseX)
                            this.width(this.width() - diffDx * reverseX)
                        }
                    } else if (rightResize) {
                        const widthR = this.width() + diffDx * reverseX
                        if (
                            widthR < this.maxWidth() &&
                            ((widthR > this.minWidth() &&
                                !this.horizontalFlipResize()) ||
                                this.horizontalFlipResize())
                        ) {
                            this.width(widthR)
                        }
                    }
                    if (topResize) {
                        const heightR = this.height() - diffDy * reverseY
                        if (
                            heightR < this.maxHeight() &&
                            ((heightR > this.minHeight() &&
                                !this.verticalFlipResize()) ||
                                this.verticalFlipResize())
                        ) {
                            this.y(this.y() + diffDy * reverseY)
                            this.height(heightR)
                        }
                    } else if (bottomResize) {
                        const heightR = this.height() + diffDy * reverseY
                        if (
                            heightR < this.maxHeight() &&
                            ((heightR > this.minHeight() &&
                                !this.verticalFlipResize()) ||
                                this.verticalFlipResize())
                        ) {
                            this.height(heightR)
                        }
                    }
                    this.#adjustCordsToFLip()
                    this.onResize()?.(event)
                    this.invokeChange()
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

    #adjustCordsToFLip() {
        const hFlip = this.getCacheValue('isHorizontalFlipped')
        if (this.__isHorizontalFlipped !== hFlip) {
            this.setChangeCache('isHorizontalFlipped', !hFlip)
            this.#areaHorizontalFlip('hotResizableAreaLeft', !hFlip)
            this.#areaHorizontalFlip('hotResizableAreaRight', hFlip)
            this.#areaHorizontalFlip('hotResizableAreaTopLeft', !hFlip)
            this.#areaHorizontalFlip('hotResizableAreaTopRight', hFlip)
            this.#areaHorizontalFlip('hotResizableAreaBottomLeft', !hFlip)
            this.#areaHorizontalFlip('hotResizableAreaBottomRight', hFlip)
            this.#areaHorizontalFlip('hotRotatableAreaBottomLeft', hFlip)
            this.#areaHorizontalFlip('hotRotatableAreaBottomRight', !hFlip)
            this.#areaHorizontalFlip('hotRotatableAreaTopRight', !hFlip)
            this.#areaHorizontalFlip('hotRotatableAreaTopLeft', hFlip)

            // this.ownOptions["hotResizableAreaTop"]!.topLeft.x =
            //     this.cornerTopRight().x - this.hotAreaSize();

            // this.ownOptions["hotResizableAreaTop"]!.bottomLeft.x =
            //     this.cornerBottomRight().x - this.hotAreaSize();

            // this.ownOptions["hotResizableAreaTop"]!.topRight.x =
            //     this.cornerTopLeft().x + this.hotAreaSize();

            // this.ownOptions["hotResizableAreaTop"]!.bottomRight.x =
            //     this.cornerBottomLeft().x + this.hotAreaSize();
        }

        const vFlip = this.getCacheValue('isVerticalFlipped')
        if (this.__isVerticalFlipped !== vFlip) {
            this.setChangeCache('isVerticalFlipped', !vFlip)

            this.#areaVerticalFlip('hotResizableAreaTop', !vFlip)
            this.#areaVerticalFlip('hotResizableAreaBottom', vFlip)
            this.#areaVerticalFlip('hotResizableAreaTopLeft', !vFlip)
            this.#areaVerticalFlip('hotResizableAreaTopRight', !vFlip)
            this.#areaVerticalFlip('hotResizableAreaBottomLeft', vFlip)
            this.#areaVerticalFlip('hotResizableAreaBottomRight', vFlip)
            this.#areaVerticalFlip('hotRotatableAreaBottomLeft', !vFlip)
            this.#areaVerticalFlip('hotRotatableAreaBottomRight', !vFlip)
            this.#areaVerticalFlip('hotRotatableAreaTopRight', vFlip)
            this.#areaVerticalFlip('hotRotatableAreaTopLeft', vFlip)
        }
    }

    #areaHorizontalFlip(area: string, reverse: boolean) {
        const cornerArea = this.ownOptions[area] as HotCornerArea
        let flipArea = cornerArea.topLeft.x - cornerArea.topRight.x
        if (reverse) flipArea = -flipArea
        cornerArea.topLeft.x += flipArea
        cornerArea.topRight.x += flipArea
        cornerArea.bottomLeft.x += flipArea
        cornerArea.bottomRight.x += flipArea
    }

    #areaVerticalFlip(area: string, reverse: boolean) {
        const cornerArea = this.ownOptions[area] as HotCornerArea
        let flipArea = cornerArea.topLeft.y - cornerArea.bottomLeft.y
        if (reverse) flipArea = -flipArea
        cornerArea.topLeft.y += flipArea
        cornerArea.topRight.y += flipArea
        cornerArea.bottomLeft.y += flipArea
        cornerArea.bottomRight.y += flipArea
    }

    #chooseCursor(defaultCursor: string) {
        const cursors: { [key: string]: string[] } = {
            'ew-resize': ['nwse-resize', 'ns-resize', 'nesw-resize'],
            'ns-resize': ['nesw-resize', 'ew-resize', 'nwse-resize'],
            'nesw-resize': ['ew-resize', 'nwse-resize', 'ns-resize'],
            'nwse-resize': ['ns-resize', 'nesw-resize', 'ew-resize'],
        }

        const angle = this.#rightCornerRad
        if (inRange(angle, -125, -85) || inRange(angle, 45, 70))
            return cursors[defaultCursor][1]
        else if (inRange(angle, -105, -20) || inRange(angle, 70, 105))
            return cursors[defaultCursor][2]
        else if (
            inRange(angle, -180, -125) ||
            inRange(angle, 145, 180) ||
            inRange(angle, 15, 45)
        )
            return cursors[defaultCursor][0]
        return defaultCursor
    }

    get #rightCornerRad() {
        return radianToDegree(
            Math.atan2(
                this.cornerTopRight().y +
                    Math.abs(
                        this.cornerTopRight().y - this.cornerBottomRight().y
                    ) /
                        2 -
                    this.rotationCenterY(),
                this.cornerTopRight().x - this.rotationCenterX()
            )
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
            initCords = this.canvas?.getCursorPosition(event) || { x: 0, y: 0 }
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
                    const { x, y } = this.canvas?.getCursorPosition(event) || {
                        x: 0,
                        y: 0,
                    }
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
