import type { Canvas } from './Canvas'
import { Node } from './Node'
import { initialCorners } from './const'
import {
    RelativeType,
    ShortHandRelativeType,
    XY,
    CustomEvent,
    Animator,
    HotCornerArea,
    NodeId,
    AnimationId,
} from './types'
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
    hexToRgba,
    colorToRgba,
    getPrototype,
    rotateCordinatesByRadian,
    namedColors,
    hslToRgba,
    shortHandParser,
    xIntersect,
    yIntersect,
    clamp,
    preOrderTraversal,
} from './Utils'

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
export type Flex = [FlexGrow, FlexShrink, FlexBasis]
export type PlaceSelf = AlignSelf & JustifySelf
export type Position = 'relative' | 'absolute' | 'sticky' | 'fixed'
export type MarginType = ShortHandRelativeType
export type PaddingType = ShortHandRelativeType
export type FlexBasis = RelativeType | 'auto'
export type SelfType = 'self' | 'parent'
export type onRender = (block: BaseBlock) => void

export interface IBaseBlockOptions {
    [key: string]: any
    name?: string
    x?: RelativeType
    y?: RelativeType
    cornerTopLeft?: XY
    cornerTopRight?: XY
    cornerBottomLeft?: XY
    cornerBottomRight?: XY
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
    rotate?: RelativeType
    rotationCenterX?: RelativeType
    rotationCenterY?: RelativeType
    rotationCenter?: SelfType
    horizontalFlip?: boolean
    verticallFlip?: boolean
    zIndex?: number
    order?: number
    hidden?: boolean
    important?: IBaseBlockOptions
    // flex: Flex
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
    onRender?: onRender
}
type BlockOptionKeys = keyof IBaseBlockOptions

export type OptionsMap = Map<BlockOptionKeys, any>

export interface BindOptions {
    block: BaseBlock
    options: BlockOptionKeys[]
}

type BlockEvent = {
    [key: string]: CustomEvent<Event>[]
}

export interface BlockPayload {
    nodeId: NodeId
    name: string
    options: OptionsMap
    cacheOptions: OptionsMap
    childs: BlockPayload[]
    additionalParams: any[]
}

type RunningEvents = { [key: string]: boolean }

export interface Pending {
    'events:add': BlockEvent
    'events:remove': BlockEvent
    'animations:add': { [animationId: AnimationId]: Animator }
    'animations:remove': AnimationId[]
    addedChilds: BaseBlock[]
    removedChilds: BaseBlock[]
}

export interface ChildsContainer {
    width: number
    height: number
}
export class BaseBlock extends Node {
    [key: string]: any

    declare parentNode?: BaseBlock
    declare childNodes: Set<BaseBlock>

    canvas?: Canvas
    context?: OffscreenCanvasRenderingContext2D | null
    options: OptionsMap
    cacheOptions: OptionsMap

    initWidth?: RelativeType
    initHeight?: RelativeType
    realWidth: number
    realHeight: number
    realCenterX: number
    realCenterY: number
    boundingBox: HotCornerArea
    #higestChildZIndex?: number

    __childAdjustment?: (b: BaseBlock) => void
    __childsContainer: ChildsContainer

    #zIndex?: number
    #pending: Pending
    #runningEvents: RunningEvents
    #bindOptions: BindOptions[]

    constructor(options: IBaseBlockOptions) {
        super()
        this.options = new Map()
        this.cacheOptions = new Map()
        this.#buildOptions(options)
        this.#defineProperties()

        this.initWidth = options.width
        this.initHeight = options.height
        this.realWidth = 0
        this.realHeight = 0
        this.realCenterX = 0
        this.realCenterY = 0

        this.boundingBox = initialCorners
        this.__childsContainer = { width: 0, height: 0 }

        this.#bindOptions = []

        this.#runningEvents = {}

        this.#pending = {
            'events:add': {},
            'events:remove': {},
            'animations:add': {},
            'animations:remove': [],
            addedChilds: [],
            removedChilds: [],
        }
    }
    render() {
        if (this.hidden()) return
        this.onRender()?.(this)
    }
    updateCords() {
        const currentRotate = this.getOptionCurrent('rotate') || 0
        const cacheRotate = this.getOptionCache('rotate') || 0
        const diffR = currentRotate - cacheRotate
        // reset rotation to before value
        if (currentRotate !== 0 || cacheRotate !== 0)
            this.rotateCordinates(-cacheRotate)
        this.__childAdjustment?.(this)
        this.updateCordinates()
        this.updateChildsCordinate()
        // after cordiantes calculated restore rotation
        if (currentRotate !== 0 || cacheRotate !== 0)
            this.rotateCordinates(cacheRotate + diffR)
        this.#calculateBoundingBox()
        this.#calculateRealWidth()
        this.#calculateRealHeight()
        this.#calculateRealCenterX()
        this.#calculateRealCenterY()
        this.#updateOptionsCache()
        this.#handleBindOptions()
    }
    init() {
        this.#initializeCordinates()
        this.#updateOptionsCache()
        this.updateCordinates()
        this.rotateCordinates(this.rotate())
        // need to again take cache after updating cordiantes
        this.#updateOptionsCache()
        this.#calculateBoundingBox()
        this.#calculateRealWidth()
        this.#calculateRealHeight()
        this.#calculateRealCenterX()
        this.#calculateRealCenterY()
        this.#collectQueueAddEvents()
        this.#collectQueueRemoveEvents()
        this.#collectQueueAddAnimations()
        this.#collectQueueRemoveAnimations()
        this.#collectQueueAddedChilds()
        this.#collectQueueRemovedChilds()
        this.#clearPendings()
        this.__refreshHeadBlock()
    }
    #buildOptions(options: IBaseBlockOptions) {
        const ownOptions = this.options
        for (const [key, value] of Object.entries(options)) {
            ownOptions.set(key, value)
        }
    }
    #defineProperties() {
        this.addProperty('x', 0, true)
        this.addProperty('y', 0, false)
        this.addProperty('cornerTopLeft', undefined)
        this.addProperty('cornerTopRight', undefined)
        this.addProperty('cornerBottomLeft', undefined)
        this.addProperty('cornerBottomRight', undefined)
        this.addProperty('width', 0, true, (block: BaseBlock, opt: number) =>
            this.#width(block, opt)
        )
        this.addProperty('height', 0, false, (block: BaseBlock, opt: number) =>
            this.#height(block, opt)
        )
        this.addProperty('minWidth', undefined, true)
        this.addProperty('minHeight', undefined, false)
        this.addProperty('maxWidth', undefined, true)
        this.addProperty('maxHeight', undefined, false)
        this.addProperty('scale', undefined)
        this.addProperty('position', undefined)
        this.addProperty('top', undefined, false)
        this.addProperty('bottom', undefined, false)
        this.addProperty('left', undefined, true)
        this.addProperty('right', undefined, true)
        this.addProperty(
            'padding',
            undefined,
            false,
            (block: BaseBlock, opt?: PaddingType) =>
                this.#parsePadding(block, opt)
        )
        this.addProperty('paddingTop', 0, false)
        this.addProperty('paddingBottom', 0, false)
        this.addProperty('paddingLeft', 0, false)
        this.addProperty('paddingRight', 0, false)
        this.addProperty(
            'margin',
            undefined,
            false,
            (block: BaseBlock, opt?: MarginType) =>
                this.#parseMargin(block, opt)
        )
        this.addProperty('marginTop', 0, false)
        this.addProperty('marginBottom', 0, false)
        this.addProperty('marginLeft', 0, true)
        this.addProperty('marginRight', 0, true)
        this.addProperty('rotate', 0)
        this.addProperty('rotationCenterX', undefined, true)
        this.addProperty('rotationCenterY', undefined, false)
        this.addProperty('rotationCenter', 'parent', true)
        this.addProperty('horizontalFlip', false)
        this.addProperty('verticalFlip', false)
        this.addProperty(
            'zIndex',
            undefined,
            false,
            (block: BaseBlock, zIndex: number) =>
                this.#hasZIndexChanged(block, zIndex)
        )
        this.addProperty('order', undefined)
        this.addProperty('hidden', false)
        this.addProperty('important', {})
        // this.addProperty('flex', [])
        // this.addProperty('alignSelf', 'auto')
        // this.addProperty('justifySelf', 'auto')
        // this.addProperty('flexShrink', 0)
        this.addProperty('flexBasis', 'auto')
        // this.addProperty('flexGrow', 0)
        // this.addProperty('gridRow', [])
        // this.addProperty('gridRowStart', 0)
        // this.addProperty('gridRowEnd', 0)
        // this.addProperty('gridColumn', [])
        // this.addProperty('gridColumnStart', 0)
        // this.addProperty('gridColumnEnd', 0)
        // this.addProperty('gridArea', [])
        this.addProperty('onRender', undefined)
    }
    #updateOptionsCache() {
        const options = this.options
        const cacheOptions = this.cacheOptions
        for (const [key, value] of options) {
            cacheOptions.set(key, value)
        }
    }
    #initializeCordinates() {
        // calling some requried options to be initialized
        const x = this.x()
        const y = this.y()
        let width = this.width()
        let height = this.height()
        let scale: number | undefined = this.scale()
        const padding = this.padding()
        const margin = this.margin()

        if (padding !== undefined) this.#parsePadding(this, padding)
        if (margin !== undefined) this.#parseMargin(this, margin)
        scale = scale !== undefined ? scale : 1
        width = this.width(
            (width + this.paddingLeft() + this.paddingRight()) * scale
        )
        height = this.height(
            (height + this.paddingTop() + this.paddingBottom()) * scale
        )
        if (this.getOptionCurrent('cornerTopLeft') === undefined)
            this.setOptionCurrent('cornerTopLeft', {
                x: x,
                y: y,
            })
        if (this.getOptionCurrent('cornerTopRight') === undefined)
            this.setOptionCurrent('cornerTopRight', {
                x: x + width,
                y: y,
            })
        if (this.getOptionCurrent('cornerBottomLeft') === undefined)
            this.setOptionCurrent('cornerBottomLeft', {
                x: x,
                y: y + height,
            })
        if (this.getOptionCurrent('cornerBottomRight') === undefined)
            this.setOptionCurrent('cornerBottomRight', {
                x: x + width,
                y: y + height,
            })
        this.#calculateBoundingBox()
        this.#calculateRealWidth()
        this.#calculateRealHeight()
        this.#calculateRealCenterX()
        this.#calculateRealCenterY()
        if (this.getOptionCurrent('rotationCenterX') === undefined)
            this.setOptionCurrent('rotationCenterX', this.realCenterX)
        if (this.getOptionCurrent('rotationCenterY') === undefined)
            this.setOptionCurrent('rotationCenterY', this.realCenterY)
    }
    #collectQueueAddEvents() {
        const events = this.#pending['events:add']
        if (events) {
            for (const [event, eventFuncts] of Object.entries(events)) {
                for (const func of eventFuncts) {
                    this.canvas?.demandAddEvent(this, event, func)
                }
            }
        }
    }
    #collectQueueRemoveEvents() {
        const events = this.#pending['events:remove']
        if (events) {
            for (const [event, eventFuncts] of Object.entries(events)) {
                for (const func of eventFuncts) {
                    this.canvas?.demandRemoveEvent(event, func)
                }
            }
        }
    }
    #collectQueueAddAnimations() {
        const animations = this.#pending['animations:add']
        if (animations) {
            for (const [animationId, func] of Object.entries(animations)) {
                this.canvas?.demandAddAnimation(animationId, func)
            }
        }
    }
    #collectQueueRemoveAnimations() {
        const animations = this.#pending['animations:remove']
        if (animations) {
            for (const animationId of animations) {
                this.canvas?.demandRemoveAnimation(animationId)
            }
        }
    }
    #collectQueueAddedChilds() {
        const childs = this.#pending['addedChilds']
        if (childs) {
            for (const child of childs) {
                this.canvas?.demandAddBlock(child)
            }
        }
    }
    #collectQueueRemovedChilds() {
        const childs = this.#pending['removedChilds']
        if (childs) {
            for (const child of childs) {
                this.canvas?.demandRemoveBlock(child)
            }
        }
    }
    #clearPendings() {
        this.#pending = {
            'events:add': {},
            'events:remove': {},
            'animations:add': {},
            'animations:remove': [],
            addedChilds: [],
            removedChilds: [],
        }
    }
    #handleBindOptions() {
        for (const opt of this.#bindOptions) {
            for (const key of opt.options) {
                getPrototype(this, key as any)?.value.call(
                    this,
                    opt.block.getOptionCurrent(key)
                )
            }
        }
    }
    __getHighestChildZIndex() {
        if (this.#higestChildZIndex === undefined) {
            this.#higestChildZIndex = this.zIndex() ?? 0
            this.listAllChilds((block: BaseBlock) => {
                const bZIndex = block.zIndex()
                if (
                    bZIndex !== undefined &&
                    bZIndex > this.#higestChildZIndex!
                ) {
                    this.#higestChildZIndex = bZIndex
                }
            })
        }
        return this.#higestChildZIndex
    }
    #calculateRealWidth() {
        this.realWidth =
            this.boundingBox.topRight.x - this.boundingBox.topLeft.x
    }
    #calculateRealHeight() {
        this.realHeight =
            this.boundingBox.bottomLeft.y - this.boundingBox.topLeft.y
    }
    #calculateRealCenterX() {
        this.realCenterX = this.boundingBox.topLeft.x + this.realWidth / 2
    }
    #calculateRealCenterY() {
        this.realCenterY = this.boundingBox.topLeft.y + this.realHeight / 2
    }
    #calculateBoundingBox() {
        const topLeftCorner = this.cornerTopLeft()
        const topRightCorner = this.cornerTopRight()
        const bottomLeftCorner = this.cornerBottomLeft()
        const bottomRightCorner = this.cornerBottomRight()
        const minCordX = Math.min(
            topLeftCorner.x,
            topRightCorner.x,
            bottomLeftCorner.x,
            bottomRightCorner.x
        )
        const minCordY = Math.min(
            topLeftCorner.y,
            topRightCorner.y,
            bottomLeftCorner.y,
            bottomRightCorner.y
        )
        const maxCordX = Math.max(
            topLeftCorner.x,
            topRightCorner.x,
            bottomLeftCorner.x,
            bottomRightCorner.x
        )
        const maxCordY = Math.max(
            topLeftCorner.y,
            topRightCorner.y,
            bottomLeftCorner.y,
            bottomRightCorner.y
        )
        this.boundingBox = {
            topLeft: {
                x: minCordX,
                y: minCordY,
            },
            topRight: {
                x: maxCordX,
                y: minCordY,
            },
            bottomLeft: {
                x: minCordX,
                y: maxCordY,
            },
            bottomRight: {
                x: maxCordX,
                y: maxCordY,
            },
        }
    }
    #width(block: BaseBlock, value: number) {
        block.setOptionCurrent(
            'width',
            value > 0 ? clamp(value, 1, 4096) : clamp(value, -4096, -1)
        )
    }
    #height(block: BaseBlock, value: number) {
        block.setOptionCurrent(
            'height',
            value > 0 ? clamp(value, 1, 4096) : clamp(value, -4096, -1)
        )
    }
    #parseMargin(block: BaseBlock, margin: MarginType | undefined) {
        if (margin === undefined) return
        const parsedShortHand = shortHandParser(margin)
        block.marginTop(parsedShortHand[0])
        block.marginRight(parsedShortHand[1])
        block.marginBottom(parsedShortHand[2])
        block.marginLeft(parsedShortHand[3])
    }
    #parsePadding(block: BaseBlock, padding: PaddingType | undefined) {
        if (padding === undefined) return
        const parsedShortHand = shortHandParser(padding)
        block.paddingTop(parsedShortHand[0])
        block.paddingRight(parsedShortHand[1])
        block.paddingBottom(parsedShortHand[2])
        block.paddingLeft(parsedShortHand[3])
    }
    // @TODO: need to impliment in layout
    // #parseFlex() {
    //     const flex = this.flex()
    //     this.flexGrow(flex[0])
    //     this.flexShrink(flex[1])
    //     this.flexBasis(flex[2])
    // }
    // #parseGridArea() {
    //     const gridArea = this.gridArea()
    //     this.gridRowStart(gridArea[0] || 'auto')
    //     this.gridColumnStart(gridArea[1] || 'auto')
    //     this.gridRowEnd(gridArea[2] || 'auto')
    //     this.gridColumnEnd(gridArea[3] || 'auto')
    // }
    #hasZIndexChanged(block: BaseBlock, zIndex: number) {
        if (block.#zIndex !== zIndex) {
            block.canvas?.demandRefreshHead()
            block.__refreshHeadBlock()
        }
        block.#zIndex = zIndex
    }
    updateCordinates() {
        let currentX = this.getOptionCurrent('x')
        let currentY = this.getOptionCurrent('y')
        const cacheX = this.getOptionCache('x')
        const cacheY = this.getOptionCache('y')

        let currentWidth = this.getOptionCurrent('width')
        let currentHeight = this.getOptionCurrent('height')
        const cacheWidth = this.getOptionCache('width')
        const cacheHeight = this.getOptionCache('height')

        const blockInitW = this.__unitConverter({
            val: this.initWidth,
            widthRelated: true,
        }) as number
        const blockInitH = this.__unitConverter({
            val: this.initHeight,
            widthRelated: false,
        }) as number

        const minWidth = this.getOptionCurrent('minWidth')
        const maxWidth = this.getOptionCurrent('maxWidth')
        const minHeight = this.getOptionCurrent('minHeight')
        const maxHeight = this.getOptionCurrent('maxHeight')

        const rotationCenterX = this.getOptionCurrent('rotationCenterX')
        const rotationCenterY = this.getOptionCurrent('rotationCenterY')

        const position = this.getOptionCurrent('position')
        const top = this.getOptionCurrent('top')
        const bottom = this.getOptionCurrent('bottom')
        const left = this.getOptionCurrent('left')
        const right = this.getOptionCurrent('right')

        let cornerTopLeftCurrent = this.getOptionCurrent('cornerTopLeft')
        let cornerTopRightCurrent = this.getOptionCurrent('cornerTopRight')
        let cornerBottomLeftCurrent = this.getOptionCurrent('cornerBottomLeft')
        let cornerBottomRightCurrent =
            this.getOptionCurrent('cornerBottomRight')

        const diffScale =
            (this.getOptionCurrent('scale') || 0) -
            (this.getOptionCache('scale') || 0)

        const diffPaddingTop =
            this.getOptionCurrent('paddingTop') -
            this.getOptionCache('paddingTop')
        const diffPaddingBottom =
            this.getOptionCurrent('paddingBottom') -
            this.getOptionCache('paddingBottom')
        const diffPaddingLeft =
            this.getOptionCurrent('paddingLeft') -
            this.getOptionCache('paddingLeft')
        const diffPaddingRight =
            this.getOptionCurrent('paddingRight') -
            this.getOptionCache('paddingRight')

        if (diffPaddingRight || diffPaddingLeft)
            currentWidth = currentWidth + diffPaddingRight + diffPaddingLeft
        if (diffPaddingTop || diffPaddingBottom)
            currentHeight = currentHeight + diffPaddingTop + diffPaddingBottom

        if (diffScale) {
            currentWidth *= diffScale
            currentHeight *= diffScale
        }
        if (maxWidth !== undefined)
            currentWidth = Math.min(blockInitW, maxWidth)
        if (minWidth !== undefined)
            currentWidth = Math.max(minWidth, currentWidth)

        if (maxHeight !== undefined)
            currentHeight = Math.min(blockInitH, maxHeight)
        if (minHeight !== undefined)
            currentHeight = Math.max(minHeight, currentHeight)

        if (position === 'fixed' || position === 'absolute') {
            const tx = this.canvas?.view.tx ?? 0
            const ty = this.canvas?.view.ty ?? 0
            const scale = this.canvas?.view.scale ?? 1
            const invScale = 1 / scale
            if (top !== undefined) currentY = (top - ty) * invScale
            else if (bottom !== undefined)
                currentY =
                    ((Math.abs((this.canvas?.height || 1) - currentHeight) -
                        bottom -
                        ty) *
                        invScale) /
                    1
            if (left !== undefined) currentX = (left - tx) * invScale
            else if (right !== undefined)
                currentX =
                    ((Math.abs((this.canvas?.width || 1) - currentWidth) -
                        right -
                        tx) *
                        invScale) /
                    1
        } else if (position === 'sticky' && !this.__hasParentBlock) {
            const tx = this.canvas?.view.tx ?? 0
            const ty = this.canvas?.view.ty ?? 0
            const scale = this.canvas?.view.scale ?? 1
            const invScale = 1 / scale
            const canvasH = this.canvas?.height || 1
            const canvasW = this.canvas?.width || 1
            if (top !== undefined && currentY * scale + ty < top) {
                currentY = (top - ty) * invScale
            } else if (
                bottom !== undefined &&
                (currentY + currentHeight) * scale + ty > canvasH - bottom
            ) {
                currentY =
                    ((canvasH - currentHeight - bottom - ty) * invScale) / 1
            }
            if (left !== undefined && currentX * scale + tx < left) {
                currentX = (left - tx) * invScale
            } else if (
                right !== undefined &&
                (currentX + currentWidth) * scale + tx > canvasW - right
            ) {
                currentX =
                    ((canvasW - currentWidth - right - tx) * invScale) / 1
            }
        } else if (position === 'relative' && !this.__hasParentBlock) {
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

        if (
            cornerTopLeftCurrent.x > cornerTopRightCurrent.x ||
            cornerBottomLeftCurrent.x > cornerBottomRightCurrent.x
        )
            this.horizontalFlip(true)
        else this.horizontalFlip(false)
        if (
            cornerTopLeftCurrent.y > cornerBottomLeftCurrent.y ||
            cornerTopRightCurrent.y > cornerBottomRightCurrent.y
        )
            this.verticalFlip(true)
        else this.verticalFlip(false)

        const shouldTrackOwnCenter =
            this.rotationCenter() !== 'parent' || !this.__hasParentBlock
        if (shouldTrackOwnCenter) {
            this.setOptionCurrent(
                'rotationCenterX',
                rotationCenterX + diffX + diffW / 2
            )
            this.setOptionCurrent(
                'rotationCenterY',
                rotationCenterY + diffY + diffH / 2
            )
        }
        this.setOptionCurrent('x', currentX)
        this.setOptionCurrent('y', currentY)
        this.setOptionCurrent('width', currentWidth)
        this.setOptionCurrent('height', currentHeight)
        this.setOptionCurrent('cornerTopLeft', cornerTopLeftCurrent)
        this.setOptionCurrent('cornerTopRight', cornerTopRightCurrent)
        this.setOptionCurrent('cornerBottomLeft', cornerBottomLeftCurrent)
        this.setOptionCurrent('cornerBottomRight', cornerBottomRightCurrent)
    }
    updateChildsCordinate() {
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

        const pCurrentRotate = this.getOptionCurrent('rotate')
        const pCacheRotate = this.getOptionCache('rotate')

        const cornerLeftX = this.cornerTopLeft().x
        const cornerTopY = this.cornerTopLeft().y

        const blockHorizontalFlip = this.horizontalFlip()
        const blockVerticalFlip = this.verticalFlip()

        const horiztionalFlipSign = blockHorizontalFlip ? -1 : 1
        const verticalFlipSign = blockVerticalFlip ? -1 : 1

        let startX = 0
        let startY = 0
        let containerW = 0
        let containerH = 0
        let wrapWidth = 0

        let blocksContainerWidth = 0
        let blocksContainerHeight = 0

        this.listOnlyChilds((b: BaseBlock, currIdx, arrLen) => {
            const blockPosition = b.position()
            if (blockPosition === 'absolute' || blockPosition === 'fixed')
                return

            const blockMarginTop = b.marginTop() * verticalFlipSign
            const blockMarginBottom = b.marginBottom() * verticalFlipSign
            const blockMarginLeft = b.marginLeft() * horiztionalFlipSign
            const blockMarginRight = b.marginRight() * horiztionalFlipSign
            
            const blockInitW = b.__unitConverter({
                val: b.initWidth,
                widthRelated: true,
            }) as number
            const blockInitH = b.__unitConverter({
                val: b.initHeight,
                widthRelated: false,
            }) as number

            let blockW = Math.abs(b.width())
            let blockH = Math.abs(b.height())

            const blockWidthSpaces = blockW + blockMarginLeft + blockMarginRight
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

            let blockXStart =
                startX + pPaddingLeft + blockMarginLeft + cornerLeftX
            let blockYStart = startY + pPaddingTop + blockMarginTop + cornerTopY

            if (blockPosition === 'relative') {
                if (b.left() !== undefined) blockXStart += b.left()!
                else if (b.right() !== undefined) blockXStart -= b.right()!

                if (b.top() !== undefined) blockYStart += b.top()!
                else if (b.bottom() !== undefined) blockYStart -= b.bottom()!
            }

            startX += blockWidthSpaces
            containerW += blockWidthSpaces

            if (containerH < blockHeightSpaces) containerH = blockHeightSpaces
            if (containerW > blocksContainerWidth)
                blocksContainerWidth = containerW

            if (currIdx == arrLen - 1) blocksContainerHeight += containerH

            blockW = blockInitW
            blockH = blockInitH

            b.setOptionCurrent('rotate', pCurrentRotate)
            b.setOptionCache('rotate', pCacheRotate)
            b.__childAdjustment = (b: BaseBlock) => {
                b.hidden(this.hidden())
                if (b.rotationCenter() === 'parent') {
                    b.setOptionCurrent('rotationCenterX', centerX)
                    b.setOptionCurrent('rotationCenterY', centerY)
                }
                b.x(blockXStart)
                b.y(blockYStart)
                if (blockHorizontalFlip) blockW = -blockW
                if (blockVerticalFlip) blockH = -blockH
                b.width(blockW)
                b.height(blockH)
            }
            b.canvas?.demandInvoke(b)
        })
        this.__childsContainer = {
            width: blocksContainerWidth,
            height: blocksContainerHeight,
        }
    }
    #rotateCornerCordinates(corner: string, diffR: number) {
        const cordsAreaCurrent = this.getOptionCurrent(corner)
        const cordsAreaCache = this.getOptionCache(corner)
        const currentCords = this.__rotateCordiantesByCenter(
            cordsAreaCurrent.x,
            cordsAreaCurrent.y,
            diffR
        )
        const cacheCords = this.__rotateCordiantesByCenter(
            cordsAreaCache.x,
            cordsAreaCache.y,
            diffR
        )
        this.setOptionCurrent(corner, currentCords)
        this.setOptionCache(corner, cacheCords)
    }
    rotateCordinates(radian: number) {
        this.#rotateCornerCordinates('cornerTopLeft', radian)
        this.#rotateCornerCordinates('cornerTopRight', radian)
        this.#rotateCornerCordinates('cornerBottomLeft', radian)
        this.#rotateCornerCordinates('cornerBottomRight', radian)
    }
    addProperty(
        method: string,
        defaultValue: any,
        widthRelated?: boolean,
        func?: (block: any, opt?: any) => void
    ): void {
        ;(BaseBlock.prototype as Record<string, any>)[method] = function (
            this: BaseBlock,
            opt?: any
        ) {
            const value = this.__valueHandler(
                opt,
                method,
                defaultValue,
                widthRelated
            )
            func?.(this, value)
            return value
        }
    }
    getOptionCache(key: string) {
        return this.cacheOptions.get(key)
    }
    getOptionCurrent(key: BlockOptionKeys) {
        return this.options.get(key)
    }
    setOptionCache(key: BlockOptionKeys, value: any) {
        this.cacheOptions.set(key, value)
    }
    setOptionCurrent(key: BlockOptionKeys, value: any) {
        this.options.set(key, value)
    }
    __refreshHeadBlock() {
        if (this.__hasParentBlock) this.parentNode?.__refreshHeadBlock()
        this.#higestChildZIndex = undefined
    }
    get isMouseEventAllowed() {
        return this.canvas?.isMouseEventAllowed || false
    }
    get __hasParentBlock() {
        if (
            this.parentNode &&
            Object.getPrototypeOf(this.parentNode).constructor.name !== 'Node'
        )
            return true
        return false
    }
    get __parentWidth(): number {
        if (this.__hasParentBlock) return this.parentNode?.width?.() || 1
        return this.canvas?.width || 1
    }
    get __parentHeight(): number {
        if (this.__hasParentBlock) return this.parentNode?.height?.() || 1
        return this.canvas?.height || 1
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
        const important = this.getOptionCurrent('important')
        if (important && Object.hasOwn(important, option))
            currentValue = important[option]
        currentValue = this.__unitConverter<T, O>({
            val: currentValue,
            widthRelated: widthRelated,
        })
        return this.__cacheOption(currentValue, option, defaultOpt)
    }
    __cacheOption<I, O>(opt: I, option: BlockOptionKeys, defaultOpt: O) {
        const value = this.getOptionCurrent(option)
        if (opt !== undefined) {
            this.setOptionCurrent(option, opt)
            return opt
        } else if (value === undefined) {
            this.setOptionCurrent(option, defaultOpt)
            return defaultOpt
        }
        return value
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
    __translateX(x: number) {
        const position = this.position()
        if (position === 'fixed') return
        this.x(this.x() + x)
        if (position === 'absolute' || position === 'relative') {
            if (this.left() !== undefined) this.left(this.left()! + x)
            else if (this.right() !== undefined) this.right(this.right()! - x)
        }
    }
    __translateY(y: number) {
        const position = this.position()
        if (position === 'fixed') return
        this.y(this.y() + y)
        if (position === 'absolute' || position === 'relative') {
            if (this.top() !== undefined) this.top(this.top()! + y)
            else if (this.bottom() !== undefined)
                this.bottom(this.bottom()! - y)
        }
    }
    __addEvent<E extends Event>(type: string, func: CustomEvent<E>) {
        if (this.canvas) {
            this.canvas.demandAddEvent(this, type, func as CustomEvent<Event>)
        } else
            (this.#pending['events:add'][type] ??= []).push(
                func as CustomEvent<Event>
            )
    }
    __removeEvent<E extends Event>(type: string, func: CustomEvent<E>) {
        if (this.canvas) {
            this.canvas.demandRemoveEvent(type, func as CustomEvent<Event>)
        } else
            (this.#pending['events:remove'][type] ??= []).push(
                func as CustomEvent<Event>
            )
    }
    __addAnimation(animationId: AnimationId, animator: Animator) {
        if (this.canvas) this.canvas.demandAddAnimation(animationId, animator)
        else this.#pending['animations:add'][animationId] = animator
    }
    __removeAnimation(animationId: AnimationId) {
        if (this.canvas) this.canvas.demandRemoveAnimation(animationId)
        else this.#pending['animations:remove'].push(animationId)
    }
    __registerZIndex(zIndex: number) {
        if (this.nodeId) this.canvas?.registerZIndex(this.nodeId, zIndex)
    }
    __unregisterZIndex() {
        if (this.nodeId) this.canvas?.unregisterZIndex(this.nodeId)
    }
    __ImFirst() {
        if (this.nodeId) return this.canvas?.whoIsTheFirst(this.nodeId)
        return false
    }
    __addChildInternal(block: this) {
        super.addChild(block)
    }
    __removeChildInternal(block: this): void {
        super.removeChild(block)
        block.__childAdjustment = undefined
    }
    __invokeChange() {
        if (this.__hasParentBlock) {
            this.parentNode?.__invokeChange()
            return
        }
        this.canvas?.demandInvoke(this)
    }
    __selectCursor(cursor: string) {
        if (this.nodeId !== undefined)
            this.canvas?.registerCursor(this.nodeId, cursor)
    }
    __resetCursor(cursor: string) {
        if (this.nodeId !== undefined)
            this.canvas?.unregisterCursor(this.nodeId, cursor)
    }
    __invokeHistory(before: any, after: any) {
        if (this.nodeId) this.canvas?.demandHistory(this.nodeId, before, after)
    }
    __generatePayload(): BlockPayload {
        const childs: BlockPayload[] = []
        this.listOnlyChilds((b: BaseBlock) => {
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
    __updateRunningEvent(event: string, isActive: boolean) {
        this.#runningEvents[event] = isActive
    }
    __isRunningEventActive(event: string) {
        return this.#runningEvents[event] || false
    }
    __disableRunningEvents() {
        for (const key of Object.keys(this.#runningEvents)) {
            this.#runningEvents[key] = false
        }
    }
    __rotateCordiantesByCenter(x: number, y: number, radian: number) {
        return rotateCordinatesByRadian(
            x,
            y,
            this.rotationCenterX(),
            this.rotationCenterY(),
            radian
        )
    }
    checkInBound(event: MouseEvent): boolean {
        const { x, y } = this.canvas?.getCursorPosition(event)!
        let topLeft = this.cornerTopLeft()
        let topRight = this.cornerTopRight()
        let bottomLeft = this.cornerBottomLeft()
        let bottomRight = this.cornerBottomRight()
        if (this.verticalFlip() !== this.horizontalFlip()) {
            if (this.verticalFlip()) {
                topLeft = this.cornerBottomLeft()
                topRight = this.cornerBottomRight()
                bottomLeft = this.cornerTopLeft()
                bottomRight = this.cornerTopRight()
            } else if (this.horizontalFlip()) {
                topLeft = this.cornerTopRight()
                topRight = this.cornerTopLeft()
                bottomLeft = this.cornerBottomRight()
                bottomRight = this.cornerBottomLeft()
            }
        }
        return checkInBound(
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
    }
    listOnlyChilds<T extends BaseBlock>(
        _func: (block: T, currIdx: number, arrLen: number) => void
    ): void {
        const childNodes = [...this.childNodes]
        for (let i = 0, len = childNodes.length; i < len; i++) {
            _func(childNodes[i] as T, i, len)
        }
    }
    listAllChilds(_func: (block: BaseBlock) => void): void {
        preOrderTraversal(this, _func)
    }
    set(options: IBaseBlockOptions): void {
        let before: any = {}
        let after: any = {}
        for (const [key, value] of Object.entries(options)) {
            const obj = getPrototype(this, key)
            let beforeValue = obj?.value.call(this)
            const handledVal = obj?.value.call(this, value)
            this.setOptionCurrent(
                key,
                value === undefined ? undefined : handledVal
            )
            before[key] = beforeValue
            after[key] = value
        }
        if (Object.keys(before).length !== 0) {
            this.__invokeHistory(before, after)
            this.__invokeChange()
        }
    }
    bindTo(block: BaseBlock, options: BlockOptionKeys[]) {
        block.#bindOptions.push({ block: block, options: options })
    }
    unbind(block: BaseBlock) {
        block.#bindOptions = block.#bindOptions.filter((i) => i.block !== block)
    }
    findChilds<T extends IBaseBlockOptions>(queries: T) {
        let blocks: BaseBlock[] = []
        this.listAllChilds((block: BaseBlock) => {
            for (const [k, v] of Object.entries(queries)) {
                if (this.getOptionCurrent(k) === v) blocks.push(block)
            }
        })
        return blocks
    }
    addChild(block: this): void {
        super.addChild(block)
        if (this.canvas) this.canvas.demandAddBlock(block)
        else this.#pending['addedChilds'].push(block)
        this.__invokeHistory({ removeChild: block }, { addChild: block })
    }
    removeChild(block: this): void {
        super.removeChild(block)
        block.__childAdjustment = undefined
        if (this.canvas) this.canvas.demandRemoveBlock(block)
        else this.#pending['removedChilds'].push(block)
        this.__invokeHistory({ addChild: block }, { removeChild: block })
    }
    name(opt?: string) {
        return this.__cacheOption(opt, 'name', undefined)
    }
    contextMenu(_func: (event: MouseEvent) => void) {
        const out = (event: MouseEvent) => {
            if (this.checkInBound(event) && this.isMouseEventAllowed) {
                this.__registerZIndex(this.zIndex())
                if (this.__ImFirst()) {
                    _func(event)
                    this.__invokeChange()
                }
            } else this.__unregisterZIndex()
        }
        this.__addEvent<MouseEvent>('contextmenu', out)
    }
    click(_func: (event: MouseEvent) => void) {
        const out = (event: MouseEvent) => {
            if (this.checkInBound(event) && this.isMouseEventAllowed) {
                this.__registerZIndex(this.zIndex())
                if (this.__ImFirst()) {
                    _func(event)
                    this.__invokeChange()
                }
            } else this.__unregisterZIndex()
        }
        this.__addEvent<MouseEvent>('click', out)
    }
    dblclick(_func: (event: MouseEvent) => void) {
        const out = (event: MouseEvent) => {
            if (this.checkInBound(event) && this.isMouseEventAllowed) {
                this.__registerZIndex(this.zIndex())
                if (this.__ImFirst()) {
                    _func(event)
                    this.__invokeChange()
                }
            } else this.__unregisterZIndex()
        }
        this.__addEvent<MouseEvent>('dblclick', out)
    }
    mousedown(_func: (event: MouseEvent) => void) {
        const out = (event: MouseEvent) => {
            if (this.checkInBound(event) && this.isMouseEventAllowed) {
                this.__registerZIndex(this.zIndex())
                if (this.__ImFirst()) {
                    _func(event)
                    this.__invokeChange()
                }
            } else this.__unregisterZIndex()
        }
        this.__addEvent<MouseEvent>('mousedown', out)
    }
    mouseup(_func: (event: MouseEvent) => void) {
        const out = (event: MouseEvent) => {
            if (this.checkInBound(event) && this.isMouseEventAllowed) {
                this.__registerZIndex(this.zIndex())
                if (this.__ImFirst()) {
                    _func(event)
                    this.__invokeChange()
                }
            } else this.__unregisterZIndex()
        }
        this.__addEvent<MouseEvent>('mouseup', out)
    }
    mousemove(_func: (event: MouseEvent) => void) {
        const out = (event: MouseEvent) => {
            if (this.checkInBound(event) && this.isMouseEventAllowed) {
                this.__registerZIndex(this.zIndex())
                if (this.__ImFirst()) {
                    _func(event)
                    this.__invokeChange()
                }
            } else this.__unregisterZIndex()
        }
        this.__addEvent<MouseEvent>('mousemove', out)
    }
    mouseenter(_func: (event: MouseEvent) => void) {
        let isMouseEnter = false
        const enter = (event: MouseEvent) => {
            if (this.checkInBound(event) && this.isMouseEventAllowed) {
                this.__registerZIndex(this.zIndex())
                if (this.__ImFirst() && !isMouseEnter) {
                    _func(event)
                    this.__invokeChange()
                    isMouseEnter = true
                }
            } else {
                isMouseEnter = false
                this.__unregisterZIndex()
            }
        }
        this.__addEvent<MouseEvent>('mousemove', enter)
    }
    mouseleave(_func: (event: MouseEvent) => void) {
        let isMouseLeave = false
        const leave = (event: MouseEvent) => {
            if (!this.checkInBound(event) && this.isMouseEventAllowed) {
                this.__registerZIndex(this.zIndex())

                if (!this.__ImFirst() && !isMouseLeave) {
                    _func(event)
                    this.__invokeChange()
                    isMouseLeave = true
                }
            } else {
                isMouseLeave = false
                this.__unregisterZIndex()
            }
        }
        this.__addEvent<MouseEvent>('mousemove', leave)
    }
    /** @Todo
        mouseover and mouseout has little bug when two chidls cross each other there are isMouse over happens to be true but one is under so check in bound checks it under the higher z index element
    */
    mouseover(_func: (event: MouseEvent) => void) {
        const mouseOver: any = {}
        let isMouseOver = false
        let inBound = false
        const over = (event: MouseEvent) => {
            this.listAllChilds((b: BaseBlock) => {
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
                this.__invokeChange()
                isMouseOver = false
            }
        }
        this.__addEvent<MouseEvent>('mousemove', over)
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
            this.listAllChilds((b: BaseBlock) => {
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
                this.__invokeChange()
                isMouseLeave = false
            }
        }
        this.__addEvent<MouseEvent>('mousemove', out)
    }
    keydown(_func: (event: KeyboardEvent) => void) {
        const down = (event: KeyboardEvent) => {
            if (this.canvas?.isFocused) {
                event.preventDefault()
                _func(event)
                this.__invokeChange()
            }
        }
        this.__addEvent<KeyboardEvent>('keydown', down)
    }
    keyup(_func: (event: KeyboardEvent) => void) {
        const up = (event: KeyboardEvent) => {
            if (this.canvas?.isFocused) {
                event.preventDefault()
                _func(event)
                this.__invokeChange()
            }
        }
        this.__addEvent<KeyboardEvent>('keyup', up)
    }
    wheel(_func: (event: WheelEvent) => void) {
        const wheel = (event: WheelEvent) => {
            if (this.canvas?.isFocused) {
                event.preventDefault()
                _func(event)
                this.__invokeChange()
            }
        }
        this.__addEvent<WheelEvent>('wheel', wheel)
    }
}
