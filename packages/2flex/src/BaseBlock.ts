import type { Canvas } from './Canvas'
import { Node } from './Node'
import { initialCorners, RELATIVE_VALUE_PATTERN } from './const'
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
    clampSize,
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
export type Dependencies = BaseBlock[]

export interface BaseBlockOptions {
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
    important?: BaseBlockOptions
    // flex: Flex
    // alignSelf?: AlignSelf
    // justifySelf?: JustifySelf
    flexShrink?: number
    flexBasis?: FlexBasis
    flexGrow?: number
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
    dependencies?: Dependencies
}
type BlockOptionKeys = keyof BaseBlockOptions

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
    options: Partial<Record<BlockOptionKeys, any>>
    cacheOptions: Partial<Record<BlockOptionKeys, any>>
    childs: BlockPayload[]
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

export type ValueConverterFunc<T, O> = (block: any, value: T) => O

type PropertyFunc = {
    (this: BaseBlock, opt?: any): any
    valueConverter?: ValueConverterFunc<any, any>
}

export class BaseBlock extends Node {
    [key: string]: any

    declare parentNode?: BaseBlock
    declare childNodes: Set<BaseBlock>

    canvas?: Canvas
    context?: OffscreenCanvasRenderingContext2D | null
    options: OptionsMap
    cacheOptions: OptionsMap
    initOptions: OptionsMap

    realWidth: number
    realHeight: number
    realCenterX: number
    realCenterY: number
    boundingBox: HotCornerArea
    #higestChildOrder?: number

    __childAdjustment?: (b: BaseBlock) => void
    __childsContainer: ChildsContainer
    __parentHidden = false
    __parentRotate = 0
    __rotateCache = 0

    #zIndex?: number
    #order?: number
    #pending: Pending
    #runningEvents: RunningEvents
    #bindOptions: BindOptions[]
    #dependendBlocks: Set<BaseBlock>
    #lastHidden: boolean | undefined = false

    constructor(options: BaseBlockOptions) {
        super()
        this.options = new Map()
        this.cacheOptions = new Map()
        this.initOptions = new Map()
        this.#buildOptions(options)
        this.#defineProperties()

        this.realWidth = 0
        this.realHeight = 0
        this.realCenterX = 0
        this.realCenterY = 0

        this.boundingBox = initialCorners
        this.__childsContainer = { width: 0, height: 0 }

        this.#bindOptions = []
        this.#dependendBlocks = new Set()

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
        if (this.__isHidden()) return
        this.onRender()?.(this)
    }
    updateCords() {
        const currentRotate = this.__rotation()
        const cacheRotate = this.__rotationCache()
        const diffR = currentRotate - cacheRotate
        // reset rotation to before value
        if (currentRotate !== 0 || cacheRotate !== 0)
            this.rotateCordinates(-cacheRotate)
        this.#resolveInitOptions()
        this.__childAdjustment?.(this)
        this.updateCordinates()
        this.updateChildsCordinate()
        // after cordiantes calculated restore rotation
        if (currentRotate !== 0 || cacheRotate !== 0)
            this.rotateCordinates(cacheRotate + diffR)
        this.__rotateCache = currentRotate
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
        this.rotateCordinates(this.__rotation())
        this.__rotateCache = this.__rotation()
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
    #buildOptions(options: BaseBlockOptions) {
        const ownOptions = this.options
        const initOptions = this.initOptions
        for (const [key, value] of Object.entries(options)) {
            ownOptions.set(key, value)
            initOptions.set(key, value)
        }
    }
    #defineProperties() {
        this.addProperty('name', undefined, false, undefined, (block, val) => {
            return val
        })
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
            undefined,
            (block: BaseBlock, opt?: PaddingType) => {
                block.#parsePadding(block, opt)
                return opt
            }
        )
        this.addProperty('paddingTop', 0, false)
        this.addProperty('paddingBottom', 0, false)
        this.addProperty('paddingLeft', 0, true)
        this.addProperty('paddingRight', 0, true)
        this.addProperty(
            'margin',
            undefined,
            false,
            undefined,
            (block: BaseBlock, opt?: MarginType) => {
                block.#parseMargin(block, opt)
                return opt
            }
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
                this.#hasZIndexChanged(block, zIndex),
            (block: any, value: any) => this.#zIndexConverter(value)
        )
        this.addProperty(
            'order',
            undefined,
            false,
            (block: BaseBlock, order: number) =>
                this.#hasOrderChanged(block, order)
        )
        this.addProperty(
            'hidden',
            false,
            false,
            (block: BaseBlock, opt?: boolean) =>
                this.#onHiddenChanged(block, opt)
        )
        this.addProperty(
            'important',
            {},
            false,
            (block: BaseBlock, opt?: BaseBlockOptions) => {
                if (!opt) return
                for (const [key, value] of Object.entries(opt))
                    block.initOptions.set(key, value)
            }
        )
        // this.addProperty('flex', [])
        // this.addProperty('alignSelf', 'auto')
        // this.addProperty('justifySelf', 'auto')
        this.addProperty('flexShrink', 1)
        this.addProperty('flexBasis', 'auto')
        this.addProperty('flexGrow', 0)
        // this.addProperty('gridRow', [])
        // this.addProperty('gridRowStart', 0)
        // this.addProperty('gridRowEnd', 0)
        // this.addProperty('gridColumn', [])
        // this.addProperty('gridColumnStart', 0)
        // this.addProperty('gridColumnEnd', 0)
        // this.addProperty('gridArea', [])
        this.addProperty('onRender', undefined)
        this.addProperty(
            'dependencies',
            [],
            false,
            (block: BaseBlock, opt: Dependencies) =>
                this.#dependency(block, opt)
        )
    }
    #onHiddenChanged(block: BaseBlock, opt?: boolean) {
        const hidden = !!opt
        if (block.#lastHidden === hidden) return
        block.#lastHidden = hidden
        block.__invokeChange()
    }
    __isHidden(): boolean {
        return !!(this.hidden() || this.__parentHidden)
    }
    #updateOptionsCache() {
        const options = this.options
        const cacheOptions = this.cacheOptions
        for (const [key, value] of options) {
            cacheOptions.set(key, value)
        }
    }
    #resolveInitOptions() {
        const scale = this.getOptionCurrent('scale') ?? 1
        const scaleChanged =
            (this.getOptionCurrent('scale') || 0) !==
            (this.getOptionCache('scale') || 0)
        for (const [key, value] of this.initOptions) {
            if (!this.#isRelativeValue(value)) continue
            if (key === 'width' || key === 'height') {
                if (scaleChanged) continue
                if (!this.#ownsItsSize()) continue
            }
            const resolved = this.__initResolved(key as string)
            if (resolved === undefined) continue
            if (key === 'width')
                this.setOptionCurrent('width', clampSize(resolved * scale))
            else if (key === 'height')
                this.setOptionCurrent('height', clampSize(resolved * scale))
        }
    }
    #isRelativeValue(value: any): boolean {
        if (typeof value === 'string') return RELATIVE_VALUE_PATTERN.test(value)
        if (value instanceof Array)
            return value.some(
                (item) =>
                    typeof item === 'string' &&
                    RELATIVE_VALUE_PATTERN.test(item)
            )
        return false
    }
    #ownsItsSize(): boolean {
        if (!this.__hasParentBlock) return true
        const position = this.position()
        return position === 'absolute' || position === 'fixed'
    }
    #initializeCordinates() {
        // calling some requried options to be initialized
        const x = this.x()
        const y = this.y()
        let scale: number | undefined = this.scale()
        const padding = this.padding()
        const margin = this.margin()

        if (padding !== undefined) this.#parsePadding(this, padding)
        if (margin !== undefined) this.#parseMargin(this, margin)
        scale = scale !== undefined ? scale : 1
        const contentWidth = this.getOptionCurrent('width') ?? 0
        const contentHeight = this.getOptionCurrent('height') ?? 0
        this.setOptionCurrent('width', clampSize(contentWidth * scale))
        this.setOptionCurrent('height', clampSize(contentHeight * scale))
        const width = this.__boxWidth()
        const height = this.__boxHeight()
        // a corner which was given by the user can be malformed, so it is only
        // kept when both of its coordinates are finite
        const isValidCorner = (corner: any) =>
            !!corner &&
            typeof corner.x === 'number' &&
            typeof corner.y === 'number' &&
            Number.isFinite(corner.x) &&
            Number.isFinite(corner.y)
        if (!isValidCorner(this.getOptionCurrent('cornerTopLeft')))
            this.setOptionCurrent('cornerTopLeft', {
                x: x,
                y: y,
            })
        if (!isValidCorner(this.getOptionCurrent('cornerTopRight')))
            this.setOptionCurrent('cornerTopRight', {
                x: x + width,
                y: y,
            })
        if (!isValidCorner(this.getOptionCurrent('cornerBottomLeft')))
            this.setOptionCurrent('cornerBottomLeft', {
                x: x,
                y: y + height,
            })
        if (!isValidCorner(this.getOptionCurrent('cornerBottomRight')))
            this.setOptionCurrent('cornerBottomRight', {
                x: x + width,
                y: y + height,
            })
        this.#calculateBoundingBox()
        this.#calculateRealWidth()
        this.#calculateRealHeight()
        this.#calculateRealCenterX()
        this.#calculateRealCenterY()
        if (
            this.getOptionCurrent('rotationCenterX') === undefined ||
            !Number.isFinite(this.getOptionCurrent('rotationCenterX'))
        )
            this.setOptionCurrent('rotationCenterX', this.realCenterX)
        if (
            this.getOptionCurrent('rotationCenterY') === undefined ||
            !Number.isFinite(this.getOptionCurrent('rotationCenterY'))
        )
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
    #zIndexConverter(value: any) {
        if (value === undefined || value === null) return undefined
        const numeric = typeof value === 'number' ? value : Number(value)
        return Number.isNaN(numeric) ? undefined : numeric
    }
    __zIndex() {
        return this.#zIndexConverter(this.getOptionCurrent('zIndex'))
    }
    __opensStackingContext() {
        return this.__zIndex() !== undefined
    }
    __getdHighestChildOrder() {
        if (this.#higestChildOrder === undefined) {
            this.#higestChildOrder ??= 0
            this.listAllChilds((block: BaseBlock) => {
                const bOrder = block.order()
                if (bOrder !== undefined && bOrder > this.#higestChildOrder!) {
                    this.#higestChildOrder = bOrder
                }
            })
        }
        return this.#higestChildOrder
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
        // a corner which is not finite would spread into the whole box, so the
        // last box which was calculated is kept instead
        if (
            !Number.isFinite(minCordX) ||
            !Number.isFinite(minCordY) ||
            !Number.isFinite(maxCordX) ||
            !Number.isFinite(maxCordY)
        ) {
            return
        }
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
        block.setOptionCurrent('width', clampSize(value))
    }
    #height(block: BaseBlock, value: number) {
        block.setOptionCurrent('height', clampSize(value))
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
    #hasOrderChanged(block: BaseBlock, order: number) {
        if (block.#order !== order) {
            block.__refreshHeadBlock()
        }
        block.#order = order
    }
    #dependency(block: BaseBlock, dependencies: Dependencies) {
        if (dependencies) block.#dependendBlocks = new Set(dependencies)
    }
    #invokeDependencies() {
        const canvas = this.canvas
        if (!canvas) return
        for (const dependend of this.#dependendBlocks) {
            canvas.demandInvoke(dependend)
        }
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
        const minWidth = this.getOptionCurrent('minWidth')
        const maxWidth = this.getOptionCurrent('maxWidth')
        const minHeight = this.getOptionCurrent('minHeight')
        const maxHeight = this.getOptionCurrent('maxHeight')

        const rotationCenterX = this.getOptionCurrent('rotationCenterX')
        const rotationCenterY = this.getOptionCurrent('rotationCenterY')

        // a position which is not finite would spread into every corner of the
        // block, so it falls back to the last known finite position
        if (!Number.isFinite(currentX))
            currentX = Number.isFinite(cacheX) ? cacheX : 0
        if (!Number.isFinite(currentY))
            currentY = Number.isFinite(cacheY) ? cacheY : 0

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

        if (diffScale) {
            currentWidth *= diffScale
            currentHeight *= diffScale
        }
        if (maxWidth !== undefined)
            currentWidth = Math.min(currentWidth, maxWidth)
        if (minWidth !== undefined)
            currentWidth = Math.max(minWidth, currentWidth)

        if (maxHeight !== undefined)
            currentHeight = Math.min(currentHeight, maxHeight)
        if (minHeight !== undefined)
            currentHeight = Math.max(minHeight, currentHeight)

        const borderWidth =
            currentWidth + this.paddingLeft() + this.paddingRight()
        const borderHeight =
            currentHeight + this.paddingTop() + this.paddingBottom()

        if (position === 'fixed') {
            const tx = this.canvas?.view.tx ?? 0
            const ty = this.canvas?.view.ty ?? 0
            const scale = this.canvas?.view.scale ?? 1
            const invScale = 1 / scale
            if (top !== undefined) currentY = (top - ty) * invScale
            else if (bottom !== undefined)
                currentY =
                    ((Math.abs((this.canvas?.height || 1) - borderHeight) -
                        bottom -
                        ty) *
                        invScale) /
                    1
            if (left !== undefined) currentX = (left - tx) * invScale
            else if (right !== undefined)
                currentX =
                    ((Math.abs((this.canvas?.width || 1) - borderWidth) -
                        right -
                        tx) *
                        invScale) /
                    1
        } else if (position === 'absolute') {
            if (top !== undefined) currentY = top
            else if (bottom !== undefined)
                currentY =
                    Math.abs((this.canvas?.height || 1) - borderHeight) - bottom
            if (left !== undefined) currentX = left
            else if (right !== undefined)
                currentX =
                    Math.abs((this.canvas?.width || 1) - borderWidth) - right
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
                (currentY + borderHeight) * scale + ty > canvasH - bottom
            ) {
                currentY =
                    ((canvasH - borderHeight - bottom - ty) * invScale) / 1
            }
            if (left !== undefined && currentX * scale + tx < left) {
                currentX = (left - tx) * invScale
            } else if (
                right !== undefined &&
                (currentX + borderWidth) * scale + tx > canvasW - right
            ) {
                currentX = ((canvasW - borderWidth - right - tx) * invScale) / 1
            }
        } else if (position === 'relative' && !this.__hasParentBlock) {
            if (left !== undefined) currentX = left
            else if (right !== undefined) currentX = -right
            if (top !== undefined) currentY = top
            else if (bottom !== undefined) currentY = -bottom
        }
        const diffX = currentX - cacheX
        const diffY = currentY - cacheY
        const diffW =
            borderWidth -
            (cacheWidth +
                (this.getOptionCache('paddingLeft') ?? 0) +
                (this.getOptionCache('paddingRight') ?? 0))
        const diffH =
            borderHeight -
            (cacheHeight +
                (this.getOptionCache('paddingTop') ?? 0) +
                (this.getOptionCache('paddingBottom') ?? 0))
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
            this.setOptionCurrent('horizontalFlip', true)
        else this.setOptionCurrent('horizontalFlip', false)
        if (
            cornerTopLeftCurrent.y > cornerBottomLeftCurrent.y ||
            cornerTopRightCurrent.y > cornerBottomRightCurrent.y
        )
            this.setOptionCurrent('verticalFlip', true)
        else this.setOptionCurrent('verticalFlip', false)

        const shouldTrackOwnCenter =
            this.rotationCenter() !== 'parent' || !this.__hasParentBlock
        if (shouldTrackOwnCenter) {
            const centerX = Number.isFinite(rotationCenterX)
                ? rotationCenterX
                : currentX + currentWidth / 2
            const centerY = Number.isFinite(rotationCenterY)
                ? rotationCenterY
                : currentY + currentHeight / 2
            this.setOptionCurrent(
                'rotationCenterX',
                centerX + diffX + diffW / 2
            )
            this.setOptionCurrent(
                'rotationCenterY',
                centerY + diffY + diffH / 2
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
        const pPaddingTop = this.paddingTop()

        const centerX = this.rotationCenterX()
        const centerY = this.rotationCenterY()

        const pCurrentRotate = this.__rotation()

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
            b.__parentHidden = this.__isHidden()
            if (blockPosition === 'absolute' || blockPosition === 'fixed') {
                b.__childAdjustment = undefined
                b.__resetParentRotation()
                b.canvas?.demandInvoke(b)
                return
            }

            const blockMarginTop = b.marginTop() * verticalFlipSign
            const blockMarginBottom = b.marginBottom() * verticalFlipSign
            const blockMarginLeft = b.marginLeft() * horiztionalFlipSign
            const blockMarginRight = b.marginRight() * horiztionalFlipSign

            let blockW = Math.abs(b.__boxWidth())
            let blockH = Math.abs(b.__boxHeight())

            const blockInitW = b.__initResolved('width') as number
            const blockInitH = b.__initResolved('height') as number
            // a child without a size keeps the size it measured for itself
            const blockOwnsWidth = blockInitW === undefined
            const blockOwnsHeight = blockInitH === undefined

            const blockWidthSpaces = blockW + blockMarginLeft + blockMarginRight
            const blockHeightSpaces =
                blockH + blockMarginTop + blockMarginBottom

            wrapWidth += blockWidthSpaces
            if (wrapWidth > pWidth) {
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

            blockW = blockInitW !== undefined ? blockInitW : blockW
            blockH = blockInitH !== undefined ? blockInitH : blockH

            b.__parentRotate = pCurrentRotate
            b.__childAdjustment = (b: BaseBlock) => {
                if (b.rotationCenter() === 'parent') {
                    b.setOptionCurrent('rotationCenterX', centerX)
                    b.setOptionCurrent('rotationCenterY', centerY)
                }
                b.setOptionCurrent('x', blockXStart)
                b.setOptionCurrent('y', blockYStart)
                const childPaddingW = b.paddingLeft() + b.paddingRight()
                const childPaddingH = b.paddingTop() + b.paddingBottom()
                // the size of the child is read again, it may have measured
                // itself after the parent measured it
                const childW = blockOwnsWidth ? Math.abs(b.width()) : blockW
                const childH = blockOwnsHeight ? Math.abs(b.height()) : blockH
                let borderW = childW + childPaddingW
                let borderH = childH + childPaddingH
                if (blockHorizontalFlip) borderW = -borderW
                if (blockVerticalFlip) borderH = -borderH
                b.setOptionCurrent('width', clampSize(borderW - childPaddingW))
                b.setOptionCurrent('height', clampSize(borderH - childPaddingH))
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
        func?: (block: any, opt?: any) => void,
        valueConverter?: ValueConverterFunc<any, any>
    ): void {
        const property = function (this: BaseBlock, opt?: any) {
            const value = this.__valueHandler(
                opt,
                method,
                defaultValue,
                widthRelated,
                valueConverter
            )
            func?.(this, value)
            return value
        } as PropertyFunc
        property.valueConverter = valueConverter
        ;(this.constructor.prototype as Record<string, any>)[method] = property
    }
    removeProperty(method: string): void {
        delete (this.constructor.prototype as Record<string, any>)[method]
        this.options.delete(method as BlockOptionKeys)
        this.cacheOptions.delete(method as BlockOptionKeys)
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
        this.#higestChildOrder = undefined
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
    __boxWidth(): number {
        return this.width() + this.paddingLeft() + this.paddingRight()
    }
    __boxHeight(): number {
        return this.height() + this.paddingTop() + this.paddingBottom()
    }
    get __parentWidth(): number {
        if (this.__hasParentBlock) return this.parentNode?.width?.() || 1
        return this.canvas?.width || 1
    }
    get __parentHeight(): number {
        if (this.__hasParentBlock) return this.parentNode?.height?.() || 1
        return this.canvas?.height || 1
    }
    __valueHandler<T, O>(
        opt: T | undefined,
        option: string,
        defaultOpt: O,
        widthRelated?: boolean,
        valueConverter?: ValueConverterFunc<T, O>
    ): O {
        let currentValue: any = opt
        const important = this.getOptionCurrent('important')
        if (important && Object.hasOwn(important, option))
            currentValue = important[option]
        if (opt !== undefined) this.initOptions.set(option, currentValue)
        if (valueConverter === undefined) {
            currentValue = this.__valueConverter<T, O>({
                val: currentValue,
                widthRelated: widthRelated,
            })
        } else currentValue = valueConverter?.(this, currentValue)
        return this.__cacheOption(currentValue, option, defaultOpt)
    }
    __initResolved(key: string): any {
        const value = this.initOptions.get(key)
        if (value === undefined) return undefined
        const property = getPrototype(this, key)?.value as
            | PropertyFunc
            | undefined
        if (!property || property.valueConverter) return undefined
        return property.call(this, value)
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
    __valueConverter<T, O>({
        val,
        widthRelated,
    }: {
        val?: T
        widthRelated?: boolean
    }): O {
        if (typeof val === 'string') {
            if (/^\d/.test(val)) {
                return this.__unitConverter(val, widthRelated) as O
            } else {
                return this.__colorConverter(val) as O
            }
        } else if (val instanceof Array) {
            const vals = []
            for (let i = 0, len = val.length; i < len; i++) {
                vals.push(this.__valueConverter({ val: val[i], widthRelated }))
            }
            return vals as O
        }
        return val as O
    }
    __unitConverter(value: string, widthRelated?: boolean) {
        const size = widthRelated ? this.__parentWidth : this.__parentHeight
        if (value.endsWith('px')) return Number(value.split('px')[0])
        else if (value.endsWith('%'))
            return fromPercentage(Number(value.split('%')[0]), size || 1)
        else if (value.endsWith('rem'))
            return fromRem(
                Number(value.split('rem')[0]),
                this.canvas?.width || 1
            )
        else if (value.endsWith('em'))
            return fromEm(Number(value.split('em')[0]), size || 1)
        else if (value.endsWith('vh'))
            return fromVH(
                Number(value.split('vh')[0]),
                this.canvas?.height || 1
            )
        else if (value.endsWith('vw'))
            return fromVW(Number(value.split('vw')[0]), this.canvas?.width || 1)
        else if (value.endsWith('cm'))
            return fromCm(Number(value.split('cm')[0]))
        else if (value.endsWith('mm'))
            return fromMm(Number(value.split('mm')[0]))
        else if (value.endsWith('q')) return fromQ(Number(value.split('q')[0]))
        else if (value.endsWith('in'))
            return fromIn(Number(value.split('in')[0]))
        else if (value.endsWith('pc'))
            return fromPc(Number(value.split('pc')[0]))
        else if (value.endsWith('pt'))
            return fromPt(Number(value.split('pt')[0]))
        else return Number(value)
    }
    __colorConverter(value: string) {
        if (namedColors[value]) {
            return colorToRgba(value)
        } else if (value.startsWith('#')) {
            return hexToRgba(value)
        } else if (value.startsWith('hsl')) {
            return hslToRgba(value)
        }
        return value
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
    __registerZIndex() {
        if (this.nodeId) this.canvas?.registerZIndex(this.nodeId, this.zIndex())
    }
    __unregisterZIndex() {
        if (this.nodeId) this.canvas?.unregisterZIndex(this.nodeId)
    }
    __ImFirst() {
        if (this.nodeId) return this.canvas?.whoIsTheFirst(this.nodeId)
        return false
    }
    __addChildInternal(block: BaseBlock) {
        super.addChild(block)
    }
    __removeChildInternal(block: BaseBlock): void {
        super.removeChild(block)
        block.__childAdjustment = undefined
        block.__resetParentRotation()
    }
    __invokeChange() {
        if (this.__hasParentBlock) {
            this.parentNode?.__invokeChange()
            return
        }
        this.#invokeDependencies()
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
            options: Object.fromEntries(this.options),
            cacheOptions: Object.fromEntries(this.cacheOptions),
            childs: childs,
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
    __rotation(): number {
        return this.rotate() + this.__parentRotate
    }
    __rotationCache(): number {
        return this.__rotateCache
    }
    __resetParentRotation() {
        this.__parentRotate = 0
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
    set(options: BaseBlockOptions): void {
        let before: any = {}
        let after: any = {}
        for (const [key, value] of Object.entries(options)) {
            const obj = getPrototype(this, key)
            const beforeValue =
                this.initOptions.get(key) ?? obj?.value.call(this)
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
    addDependecy(block: BaseBlock) {
        this.#dependendBlocks.add(block)
    }
    removeDependency(block: BaseBlock) {
        this.#dependendBlocks.delete(block)
    }
    bindTo(block: BaseBlock, options: BlockOptionKeys[]) {
        this.#bindOptions.push({ block, options })
    }
    unbind(block: BaseBlock) {
        this.#bindOptions = this.#bindOptions.filter((i) => i.block !== block)
    }
    findChilds<T extends BaseBlockOptions>(queries: T) {
        let blocks: BaseBlock[] = []
        this.listAllChilds((block: BaseBlock) => {
            for (const [k, v] of Object.entries(queries)) {
                if (block.getOptionCurrent(k) === v) blocks.push(block)
            }
        })
        return blocks
    }
    addChild(block: BaseBlock): void {
        super.addChild(block)
        block.__parentHidden = this.__isHidden()
        if (this.canvas) this.canvas.demandAddBlock(block)
        else this.#pending['addedChilds'].push(block)
        this.__invokeHistory({ removeChild: block }, { addChild: block })
    }
    removeChild(block: BaseBlock): void {
        super.removeChild(block)
        block.__childAdjustment = undefined
        block.__resetParentRotation()
        block.__parentHidden = false
        if (this.canvas) this.canvas.demandRemoveBlock(block)
        else this.#pending['removedChilds'].push(block)
        this.__invokeHistory({ addChild: block }, { removeChild: block })
    }
    contextMenu(_func: (event: MouseEvent) => void) {
        const out = (event: MouseEvent) => {
            if (this.checkInBound(event) && this.isMouseEventAllowed) {
                this.__registerZIndex()
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
                this.__registerZIndex()
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
                this.__registerZIndex()
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
                this.__registerZIndex()
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
                this.__registerZIndex()
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
                this.__registerZIndex()
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
                this.__registerZIndex()
                if (this.__ImFirst()) {
                    if (!isMouseEnter) {
                        _func(event)
                        this.__invokeChange()
                        isMouseEnter = true
                    }
                } else {
                    this.__unregisterZIndex()
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
                this.__unregisterZIndex()
                if (!isMouseLeave) {
                    _func(event)
                    this.__invokeChange()
                    isMouseLeave = true
                }
            } else {
                isMouseLeave = false
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
