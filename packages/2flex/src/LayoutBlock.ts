import { BaseBlock } from './BaseBlock'
import { Block, BlockOptions } from './Block'
import { RelativeType } from './types'

type JustifyContent =
    | 'normal'
    | 'space-evenly'
    | 'space-around'
    | 'space-between'
    | 'center'
    | 'start'
    | 'end'
    // only applies to grid
    | 'stretch'

// for grid, inline-grid systems only
type JustifyItems =
    | 'normal'
    | 'stretch'
    | 'start'
    | 'end'
    | 'center'
    // for ltr rtl writing mode
    | 'left'
    | 'right'

type AlignContent =
    | 'normal'
    | 'space-evenly'
    | 'space-around'
    | 'space-between'
    | 'center'
    | 'start'
    | 'end'
    // only applies to grid
    | 'stretch'

type AlignItems = 'normal' | 'start' | 'center' | 'end' | 'stretch'

type PlaceContent = AlignContent & JustifyContent

type PlaceItems = AlignItems & JustifyItems

type FlexDirecton = 'column' | 'column-reverse' | 'row' | 'row-reverse'
// @TODO: need to impliment 'wrap-reverse'
type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse'
type FlexFlow = [FlexDirecton, FlexWrap]

type GridAutoFlow = 'row' | 'column' | 'dense' | 'row dense' | 'column dense'

type TypeContent =
    | 'justifyContent'
    | 'justifyItems'
    | 'alignContent'
    | 'alignItems'

interface FlexLayout {
    flexDirection?: FlexDirecton
    flexWrap?: FlexWrap
    flexFlow?: FlexFlow
}

type Gap = RelativeType | [RelativeType, RelativeType]

type Grid = number[]
type GridTemplateAreas = string[]
type GridTemplateColumns = number[] | number
type GridTemplateRows = number[] | number
type GridAutoRows = number[]
type GridAutoColumns = number[]

type GridTemplate = number[][]

interface GridLayout {
    // grid-template-rows / grid-template-columns|grid-template-areas|grid-template-rows / [grid-auto-flow] grid-auto-columns|[grid-auto-flow] grid-auto-rows / grid-template-columns
    grid?: Grid
    // @Todo?: add Name assignamed to each grid
    gridTemplateAreas?: GridTemplateAreas
    // gridTemplate?: grid-template-rows / grid-template-columns
    gridTemplate?: GridTemplate
    gridTemplateColumns?: GridTemplateColumns
    gridTemplateRows?: GridTemplateRows

    gridAutoRows?: GridAutoRows
    gridAutoColumns?: GridAutoColumns

    // @Todo: need to impliment
    gridAutoFlow?: GridAutoFlow

    justifyItems?: JustifyItems
}
type ILayout = 'flex' | 'inline-flex' | 'grid' | 'inline-grid'

interface ChildSize {
    width: number
    height: number
}

export interface LayoutBlockOptions
    extends BlockOptions, GridLayout, FlexLayout {
    layout?: ILayout
    justifyContent?: JustifyContent
    alignContent?: AlignContent
    alignItems?: AlignItems
    placeContent?: PlaceContent
    placeItems?: PlaceItems
    gap?: Gap
    gapColumn?: RelativeType
    gapRow?: RelativeType
}

export class LayoutBlock extends Block {
    #containerX?: number
    #containerY?: number

    #startXPos: number[]
    #startYPos: number[]

    #columnsGap: number[]
    #rowsGap: number[]

    #blocksWidth: number[]
    #blocksHeight: number[]

    #layoutCols: number[]
    #layoutRows: number[]

    #childs: BaseBlock[]
    #latestOrder: number

    #childSizes: Map<BaseBlock, ChildSize>

    #invokerLayout?: () => void
    #justifyInvoker?: () => void
    #justifyItemsInvoker?: () => void
    #alignInvoker?: () => void
    #alignItemsInvoker?: () => void

    constructor(options: LayoutBlockOptions) {
        super(options)

        this.#startXPos = []
        this.#startYPos = []
        this.#columnsGap = []
        this.#rowsGap = []
        this.#blocksWidth = []
        this.#blocksHeight = []
        this.#layoutCols = []
        this.#layoutRows = []
        this.#childs = []
        this.#latestOrder = 1
        this.#childSizes = new Map()
        this.layout()
    }
    updateCords(): void {
        this.#updateOrdering()
        this.#updateLayout()
        super.updateCords()
    }

    #updateOrdering() {
        const latestOrder = this.__getdHighestChildOrder()
        if (latestOrder !== this.#latestOrder) this.#assingOrdering()
        this.#orderChilds()
        this.#latestOrder = latestOrder ?? 0
    }

    #assingOrdering() {
        for (const child of this.childNodes) {
            const order = child.getOptionCurrent('order')
            if (order === undefined) {
                child.setOptionCurrent('order', this.#latestOrder)
                this.#latestOrder += 1
            }
        }
    }

    #orderChilds() {
        this.#childs = [...this.childNodes].sort(
            (a, b) => a.order() - b.order()
        )
    }

    addChild(block: BaseBlock): void {
        super.addChild(block)
        this.#assingOrdering()
        this.#orderChilds()
        this.canvas?.demandInvoke(this)
    }

    listOnlyChilds<T extends BaseBlock>(
        _func: (block: T, currIdx: number, arrLen: number) => void
    ): void {
        const childNodes = this.#childs
        for (let i = 0, len = childNodes.length; i < len; i++) {
            _func(childNodes[i] as T, i, len)
        }
    }

    removeChild(block: BaseBlock): void {
        super.removeChild(block)
        this.#assingOrdering()
        this.#orderChilds()
        this.canvas?.demandInvoke(this)
    }

    #childWidth(block: BaseBlock): number {
        const size = this.#childSizes.get(block)
        if (size) return size.width
        return Math.abs(block.__boxWidth())
    }

    #childHeight(block: BaseBlock): number {
        const size = this.#childSizes.get(block)
        if (size) return size.height
        return Math.abs(block.__boxHeight())
    }

    #resolveChildSizes(): void {
        this.#childSizes.clear()

        const realW = this.#contentW
        const realH = this.#contentH

        const widthSpaces = this.marginLeft() + this.marginRight()
        const heightSpaces = this.marginTop() + this.marginBottom()

        const overflowXSign = this.horizontalFlip() ? -1 : 1
        const overflowYSign = this.verticalFlip() ? -1 : 1

        const childs = this.#flowingChilds
        for (let i = 0, len = childs.length; i < len; i++) {
            const block = childs[i]

            let width = Math.abs(block.__boxWidth())
            let height = Math.abs(block.__boxHeight())

            const blockWidthSpaces = block.marginLeft() + block.marginRight()
            const blockHeightSpaces = block.marginTop() + block.marginBottom()

            const blockWidthPaddings =
                block.paddingLeft() + block.paddingRight()
            const blockHeightPaddings =
                block.paddingTop() + block.paddingBottom()

            const blockInitW = block.__valueConverter({
                val: block.initWidth,
                widthRelated: true,
            }) as number
            const blockInitH = block.__valueConverter({
                val: block.initHeight,
                widthRelated: false,
            }) as number

            const availableW = realW - widthSpaces - blockWidthSpaces
            const availableH = realH - heightSpaces - blockHeightSpaces

            if (!this.#isGrid) {
                if (block.flexBasis() !== 'auto') {
                    if (this.#isFlexCol) height = block.flexBasis() as number
                    else width = block.flexBasis() as number
                }

                if (this.#isFlexCol) {
                    if (this.#isWrap) {
                        if (
                            blockInitH +
                                blockHeightSpaces +
                                blockHeightPaddings >=
                            realH
                        )
                            height = availableH * overflowYSign
                        // @TODO: need to adjust width
                    } else {
                        if (
                            blockInitW +
                                blockWidthSpaces +
                                blockWidthPaddings >=
                            realW
                        )
                            width = availableW * overflowXSign
                        // @TODO: need to adjust height
                    }
                } else {
                    if (this.#isWrap) {
                        if (
                            blockInitW +
                                blockWidthSpaces +
                                blockWidthPaddings >=
                            realW
                        )
                            width = availableW * overflowXSign
                        // @TODO: need to adjust height
                    } else {
                        // @TODO: need to adjust width

                        if (
                            blockInitH +
                                blockHeightSpaces +
                                blockHeightPaddings >=
                            realH
                        )
                            height = availableH * overflowYSign
                    }
                }
            }

            if (height < 0 && !this.verticalFlip()) height = 0
            if (width < 0 && !this.horizontalFlip()) width = 0

            this.#childSizes.set(block, { width, height })
        }
    }

    updateChildsCordinate(): void {
        this.#resolveChildSizes()
        this.#invokerLayout?.()
        this.#justifyInvoker?.()
        if (this.#isGrid) this.#justifyItemsInvoker?.()
        this.#alignInvoker?.()
        this.#alignItemsInvoker?.()
        this.#invokerLayout?.()

        const realW = this.#contentW
        const realH = this.#contentH

        const pPaddingLeft = this.paddingLeft()
        const pPaddingRight = this.paddingRight()
        const pPaddingTop = this.paddingTop()
        const pPaddingBottom = this.paddingBottom()

        const centerX = this.rotationCenterX()
        const centerY = this.rotationCenterY()

        const pCurrentRotate = this.__rotation()

        const cornerLeftX = this.cornerTopLeft().x
        const cornerTopY = this.cornerTopLeft().y

        const blockHorizontalFlip = this.horizontalFlip()
        const blockVerticalFlip = this.verticalFlip()

        const overflowXSign = blockHorizontalFlip ? -1 : 1
        const overflowYSign = blockVerticalFlip ? -1 : 1

        const containerW = this.#containerW
        const containerH = this.#containerH

        const widthSpaces = this.marginLeft() + this.marginRight()
        const heightSpaces = this.marginTop() + this.marginBottom()

        const overflowPositionX = this.overflowPositionX()
        const overflowPositionY = this.overflowPositionY()

        let adjustedW = 0
        let adjustedH = 0

        if (this.#isGrid) {
            adjustedW =
                (realW - containerW) / (this.#layoutCols[0] || 1) -
                    (widthSpaces + this.gapColumn()) /
                        (this.#layoutCols[0] || 1) || 1

            adjustedH =
                (realH - containerH) / (this.#layoutRows[0] || 1) -
                    (heightSpaces + this.gapRow()) /
                        (this.#layoutRows[0] || 1) || 1
        } else {
            // @TODO: need to fix adjustW and adjustH for gaps
            const childsCount = this.#flowingChilds.length
            adjustedW =
                (realW - containerW) / childsCount -
                (widthSpaces + this.gapColumn() * (childsCount - 1)) /
                    childsCount
            adjustedH =
                (realH - containerH) / childsCount -
                (heightSpaces + this.gapRow() * (childsCount - 1)) / childsCount
        }
        this.listOnlyChilds((b: BaseBlock, currIdx, arrLen) => {
            const blockPosition = b.position()
            b.__parentHidden = this.__isHidden()
            if (blockPosition === 'absolute' || blockPosition === 'fixed') {
                b.__childAdjustment = undefined
                b.__resetParentRotation()
                b.canvas?.demandInvoke(b)
                return
            }

            b.__childAdjustment?.(b)

            const blockX = b.x()
            const blockY = b.y()

            const childSize = this.#childSizes.get(b)
            const blockW = childSize
                ? childSize.width
                : Math.abs(b.__boxWidth())
            const blockH = childSize
                ? childSize.height
                : Math.abs(b.__boxHeight())

            const blockMarginTop = b.marginTop()
            const blockMarginBottom = b.marginBottom()
            const blockMarginLeft = b.marginLeft()
            const blockMarginRight = b.marginRight()

            const blockPaddingTop = b.paddingTop()
            const blockPaddingBottom = b.paddingBottom()
            const blockPaddingLeft = b.paddingLeft()
            const blockPaddingRight = b.paddingRight()

            let blockXStart =
                blockX +
                pPaddingLeft +
                blockMarginLeft * overflowXSign +
                cornerLeftX +
                overflowPositionX * overflowXSign

            let blockYStart =
                blockY +
                pPaddingTop +
                blockMarginTop * overflowYSign +
                cornerTopY +
                overflowPositionY * overflowYSign

            if (blockPosition === 'relative') {
                if (b.left() !== undefined) blockXStart += b.left()!
                else if (b.right() !== undefined) blockXStart -= b.right()!

                if (b.top() !== undefined) blockYStart += b.top()!
                else if (b.bottom() !== undefined) blockYStart -= b.bottom()!
            } else if (blockPosition === 'sticky') {
                if (this.__isOverflowYScroll) {
                    if (
                        b.top() !== undefined &&
                        Math.abs(overflowPositionY) >= blockYStart - b.top()!
                    ) {
                        blockYStart +=
                            b.top()! -
                            (overflowPositionY * overflowYSign + blockYStart)
                    } else if (
                        b.bottom() !== undefined &&
                        Math.abs(overflowPositionY) <=
                            blockYStart + b.bottom()! - Math.abs(realH - blockH)
                    ) {
                        blockYStart +=
                            -b.bottom()! -
                            (overflowPositionY * overflowYSign + blockYStart) +
                            Math.abs(realH - blockH)
                    }
                }
                if (this.__isOverflowXScroll) {
                    if (
                        b.left() !== undefined &&
                        Math.abs(overflowPositionX) >= blockXStart - b.left()!
                    ) {
                        blockXStart +=
                            b.left()! -
                            (overflowPositionX * overflowXSign + blockXStart)
                    } else if (
                        b.right() !== undefined &&
                        Math.abs(overflowPositionX) <=
                            blockXStart - b.right()! - Math.abs(realW - blockW)
                    ) {
                        blockXStart +=
                            b.right()! -
                            (overflowPositionX * overflowXSign + blockXStart) +
                            Math.abs(realW - blockW)
                    }
                }
            }

            b.__parentRotate = pCurrentRotate
            b.__childAdjustment = (b: BaseBlock) => {
                if (b.rotationCenter() === 'parent') {
                    b.setOptionCurrent('rotationCenterX', centerX)
                    b.setOptionCurrent('rotationCenterY', centerY)
                }
                b.x(blockXStart)
                b.y(blockYStart)
                const childPaddingW = blockPaddingLeft + blockPaddingRight
                const childPaddingH = blockPaddingTop + blockPaddingBottom
                let borderW = blockW
                let borderH = blockH
                if (blockHorizontalFlip) borderW = -borderW
                if (blockVerticalFlip) borderH = -borderH
                b.width(borderW - childPaddingW)
                b.height(borderH - childPaddingH)
            }
            b.__childClipping = (b: BaseBlock) => {
                const context = b.context
                if (!context) return
                // in rotate of partent clipping also need to be rotated
                context.translate(centerX, centerY)
                context.rotate(pCurrentRotate)
                context.translate(-centerX, -centerY)
                if (this.__clipPath) context.clip(this.__clipPath, 'nonzero')
                // if any other upper parent has clipping need to add another clip for it too
                const getParentClip = (parent: BaseBlock) => {
                    if (parent.__clipPath)
                        context.clip(parent.__clipPath, 'nonzero')
                    if (parent.__hasParentBlock && parent.parentNode)
                        getParentClip(parent.parentNode)
                }
                getParentClip(this)
                // after clip need to reset to its default rotation
                context.translate(centerX, centerY)
                context.rotate(-pCurrentRotate)
                context.translate(-centerX, -centerY)
            }
            b.canvas?.demandInvoke(b)
        })

        this.__childsContainer = {
            width: containerW,
            height: containerH,
        }
        this.#blocksWidth = []
        this.#blocksHeight = []
        this.#layoutCols = []
        this.#layoutRows = []
        this.#startXPos = []
        this.#startYPos = []
        this.#containerX = 0
        this.#containerY = 0
        this.#columnsGap = []
        this.#rowsGap = []
    }
    layout(opt?: ILayout) {
        const layout = this.__valueHandler<ILayout, ILayout>(
            opt,
            'layout',
            'flex'
        )
        if (layout == 'inline-flex' || layout == 'inline-grid') {
            if (!this.#childs.length) return layout
            const isFlexCol = this.#isFlexCol
            const widths = this.#childs.map((child) => child.__boxWidth())
            const heights = this.#childs.map((child) => child.__boxHeight())

            if (!this.getOptionCurrent('width'))
                this.width(
                    isFlexCol
                        ? Math.max(...widths)
                        : widths.reduce((prev, curr) => prev + curr, 0)
                )

            if (!this.getOptionCurrent('height'))
                this.height(
                    isFlexCol
                        ? heights.reduce((prev, curr) => prev + curr, 0)
                        : Math.max(...heights)
                )
        }
        return layout
    }
    #updateLayout() {
        if (this.layout() === 'flex' || this.layout() == 'inline-flex') {
            switch (this.flexDirection()) {
                case 'column':
                    this.#invokerLayout = this.#flexColumn
                    break
                case 'column-reverse':
                    this.#invokerLayout = this.#flexColumnReverse
                    break
                case 'row':
                    this.#invokerLayout = this.#flexRow
                    break
                case 'row-reverse':
                    this.#invokerLayout = this.#flexRowReverse
                    break
                default:
                    this.#invokerLayout = this.#flexRow
                    break
            }
        } else if (this.layout() == 'grid' || this.layout() == 'inline-grid') {
            this.#invokerLayout = this.#gridLayout
        }
    }
    flexFlow(opt?: FlexFlow) {
        const flexFlow = this.__valueHandler(opt, 'flexFlow', [
            this.flexDirection(),
            this.flexWrap(),
        ])
        this.flexDirection(flexFlow[0] as FlexDirecton)
        this.flexWrap(flexFlow[1] as FlexWrap)
        return flexFlow
    }
    flexDirection(opt?: FlexDirecton) {
        return this.__valueHandler(opt, 'flexDirection', 'row')
    }
    flexWrap(opt?: FlexWrap) {
        return this.__valueHandler(opt, 'flexWrap', 'nowrap')
    }
    placeContent(opt?: PlaceContent) {
        const content = this.__valueHandler(opt, 'placeContent', 'start')
        this.alignContent(content)
        this.justifyContent(content)
        return content
    }
    placeItems(opt?: PlaceItems) {
        const items = this.__valueHandler(opt, 'placeItems', 'start')
        this.alignItems(items)
        this.justifyItems(items)
        return items
    }
    gap(opt?: Gap) {
        const gap = this.__valueHandler<Gap, Gap>(opt, 'gap', 0)
        let gapRow, gapColumn
        gapRow = gapColumn = gap
        if (typeof gap === 'object') {
            gapRow = gap[0]
            gapColumn = gap[1]
        }
        this.gapRow(gapRow as number)
        this.gapColumn(gapColumn as number)
        return gap
    }
    gridTemplate(opt?: GridTemplate) {
        const gridTemplate = this.__valueHandler(opt, 'gridTemplate', [])
        if (gridTemplate[0]) this.gridTemplateRows(gridTemplate[0])
        if (gridTemplate[1]) this.gridTemplateColumns(gridTemplate[1])
        return gridTemplate
    }
    gridAutoFlow(opt?: GridAutoFlow) {
        return this.__valueHandler(opt, 'gridAutoFlow', 'row')
    }
    gridTemplateColumns(opt?: number[] | string[]): number[] | string[] {
        return this.__valueHandler(opt, 'gridTemplateColumns', [0])
    }
    gridTemplateRows(opt?: number[] | string[]): number[] | string[] {
        return this.__valueHandler(opt, 'gridTemplateRows', [])
    }
    gapColumn(opt?: RelativeType) {
        return this.__valueHandler(opt, 'gapColumn', 0)
    }
    gapRow(opt?: RelativeType) {
        return this.__valueHandler(opt, 'gapRow', 0)
    }
    columnStart(opt?: number) {
        return this.__valueHandler(opt, 'columnStart', 1)
    }
    columnEnd(opt?: number) {
        return this.__valueHandler(opt, 'columnEnd', 0)
    }
    justifyContent(opt?: JustifyContent) {
        const justifyContent = this.__valueHandler<
            JustifyContent,
            JustifyContent
        >(opt, 'justifyContent', 'normal')
        const justify = 'justifyContent'
        switch (justifyContent) {
            case 'space-evenly':
                this.#spaceEvenly(justify)
                break
            case 'space-around':
                this.#spaceAround(justify)
                break
            case 'space-between':
                this.#spaceBetween(justify)
                break
            case 'center':
                this.#center(justify)
                break
            case 'start':
                this.#start(justify)
                break
            case 'end':
                this.#end(justify)
                break
            // only for grid
            case 'stretch':
                break
            default:
                break
        }
        return justifyContent
    }
    // only works for grid layout
    justifyItems(opt?: JustifyItems) {
        const justifyItems = this.__valueHandler<JustifyItems, JustifyItems>(
            opt,
            'justifyItems',
            'normal'
        )
        const justify = 'justifyItems'
        switch (justifyItems) {
            case 'center':
                this.#center(justify)
                break
            case 'start':
                this.#start(justify)
                break
            case 'end':
                this.#end(justify)
                break
            // only for grid
            case 'stretch':
                break
            default:
                break
        }
        return justifyItems
    }
    // in flexbox works with wrap option
    alignContent(opt?: AlignContent) {
        const alignContent = this.__valueHandler<AlignContent, AlignContent>(
            opt,
            'alignContent',
            'normal'
        )
        if (!this.#isWrap && !this.#isGrid) return alignContent

        const align = 'alignContent'
        switch (alignContent) {
            case 'space-evenly':
                this.#spaceEvenly(align)
                break
            case 'space-around':
                this.#spaceAround(align)
                break
            case 'space-between':
                this.#spaceBetween(align)
                break
            case 'center':
                this.#center(align)
                break
            case 'start':
                this.#start(align)
                break
            case 'end':
                this.#end(align)
                break
            // only for grid
            case 'stretch':
                break
            default:
                break
        }
        return alignContent
    }
    alignItems(opt?: AlignItems) {
        const alignItems = this.__valueHandler<AlignItems, AlignItems>(
            opt,
            'alignItems',
            'normal'
        )

        const align = 'alignItems'

        switch (alignItems) {
            case 'center':
                this.#center(align)
                break
            case 'start':
                this.#start(align)
                break
            case 'end':
                this.#end(align)
                break
            // only for grid
            case 'stretch':
                break
            default:
                break
        }
        return alignItems
    }
    get #isFlexCol() {
        if (
            this.flexDirection() === 'column' ||
            this.flexDirection() === 'column-reverse'
        )
            return true
        return false
    }
    get #isGrid() {
        if (this.layout() === 'grid' || this.layout() === 'inline-grid')
            return true
        return false
    }
    get #isWrap() {
        return this.flexWrap() === 'nowrap' ? false : true
    }
    get #flowingChilds() {
        const childs: BaseBlock[] = []
        for (const child of this.#childs) {
            const position = child.position()
            if (position === 'absolute' || position === 'fixed') continue
            childs.push(child)
        }
        return childs
    }

    get #contentW() {
        return Math.abs(this.width())
    }
    get #contentH() {
        return Math.abs(this.height())
    }

    get #containerW() {
        if (!this.#blocksWidth.length) return 0
        if (this.#isGrid) return this.#blocksWidth.reduce((p, c) => p + c, 0)
        if (this.#isFlexCol) {
            if (this.#isWrap)
                return this.#blocksWidth.reduce((p, c) => p + c, 0)
            return Math.max(...this.#blocksWidth)
        } else {
            if (this.#isWrap) return Math.max(...this.#blocksWidth)
            return this.#blocksWidth.reduce((p, c) => p + c, 0)
        }
    }
    get #containerH() {
        if (!this.#blocksHeight.length) return 0
        if (this.#isGrid) return this.#blocksHeight.reduce((p, c) => p + c, 0)
        if (this.#isFlexCol) {
            if (this.#isWrap) return Math.max(...this.#blocksHeight)
            return this.#blocksHeight.reduce((p, c) => p + c, 0)
        } else {
            if (this.#isWrap)
                return this.#blocksHeight.reduce((p, c) => p + c, 0)
            return Math.max(...this.#blocksHeight)
        }
    }
    #checkLayoutType(
        _type: TypeContent,
        _justify_cont_func?: () => void,
        _align_cont_func?: () => void,
        _justify_func?: () => void,
        _align_func?: () => void
    ) {
        switch (_type) {
            case 'justifyContent':
                this.#justifyInvoker = _justify_cont_func
                break
            case 'alignContent':
                this.#alignInvoker = _align_cont_func
                break
            case 'justifyItems':
                this.#justifyItemsInvoker = _justify_func
                break
            case 'alignItems':
                this.#alignItemsInvoker = _align_func
                break
            default:
                break
        }
    }
    #start(_type: TypeContent) {
        const _justify_cont_func = () => {
            if (this.#isGrid) this.#containerX = 0
            else {
                if (this.#isFlexCol) this.#containerY = 0
                else this.#containerX = 0
            }
        }
        const _align_cont_func = () => {
            if (this.#isGrid) this.#containerY = 0
            else {
                if (this.#isFlexCol) this.#containerX = 0
                else if (this.#isWrap) this.#containerY = 0
            }
        }
        const _justify_func = () => {
            const childsCount = this.#flowingChilds.length
            for (let i = 0; i < childsCount; i++) {
                this.#startXPos.push(0)
            }
        }
        const _align_func = () => {
            const childsCount = this.#flowingChilds.length
            for (let i = 0; i < childsCount; i++) {
                if (this.#isFlexCol) this.#startXPos.push(0)
                else this.#startYPos.push(0)
            }
        }
        this.#checkLayoutType(
            _type,
            _justify_cont_func,
            _align_cont_func,
            _justify_func,
            _align_func
        )
    }
    #end(_type: TypeContent) {
        const _justify_cont_func = () => {
            if (this.#isGrid) {
                this.#containerX = Math.abs(this.#contentW - this.#containerW)
            } else {
                if (this.#isFlexCol) {
                    if (this.#isWrap) {
                        for (
                            let i = 0, len = this.#blocksHeight.length;
                            i < len;
                            i++
                        ) {
                            const startY =
                                this.#contentH - this.#blocksHeight[i]
                            this.#startYPos.push(startY > 0 ? startY : 0)
                        }
                    } else {
                        const startY = this.#contentH - this.#containerH
                        this.#containerY = startY > 0 ? startY : 0
                    }
                } else {
                    if (this.#isWrap) {
                        for (
                            let i = 0, len = this.#blocksWidth.length;
                            i < len;
                            i++
                        ) {
                            let startX = this.#contentW - this.#blocksWidth[i]
                            this.#startXPos.push(startX > 0 ? startX : 0)
                        }
                    } else {
                        const startX = this.#contentW - this.#containerW
                        this.#containerX = startX > 0 ? startX : 0
                    }
                }
            }
        }
        const _align_cont_func = () => {
            if (this.#isGrid) {
                this.#containerY = Math.abs(this.#contentH - this.#containerH)
            } else {
                if (!this.#isWrap) return
                if (this.#isFlexCol) {
                    const startX = this.#contentW - this.#containerW
                    this.#containerX = startX > 0 ? startX : 0
                } else {
                    const startY = this.#contentH - this.#containerH
                    this.#containerY = startY > 0 ? startY : 0
                }
            }
        }
        const _justify_func = () => {
            const childs = this.#flowingChilds
            const colsCount = this.#blocksWidth.length
            for (let i = 0, len = childs.length; i < len; i++) {
                const col = colsCount ? i % colsCount : 0
                this.#startXPos.push(
                    (this.#blocksWidth[col] || 0) - this.#childWidth(childs[i])
                )
            }
        }
        const _align_func = () => {
            const childs = this.#flowingChilds
            if (this.#isGrid) {
                const colsCount = this.#layoutCols[0] || 1
                for (let i = 0, len = childs.length; i < len; i++) {
                    const row = Math.floor(i / colsCount)
                    this.#startYPos.push(
                        (this.#blocksHeight[row] || 0) -
                            this.#childHeight(childs[i])
                    )
                }
            } else {
                if (this.#isFlexCol) {
                    let containerW = this.#contentW - this.#containerW
                    if (this.alignContent() !== 'normal')
                        containerW = (this.#containerX || 0) - containerW
                    containerW = containerW > 0 ? containerW : 0
                    for (
                        let i = 0, rows = 0, len = this.#blocksWidth.length;
                        i < len;
                        rows += this.#layoutRows[i], i++
                    ) {
                        let colW = containerW
                        for (let j = 0; j < this.#layoutRows[i]; j++) {
                            if (colW !== 0 && this.alignContent() !== 'normal')
                                colW = (i + 1) * containerW
                            this.#startXPos.push(
                                colW +
                                    (this.#blocksWidth[i] -
                                        this.#childWidth(childs[j + rows]))
                            )
                        }
                    }
                } else {
                    let containerH = this.#contentH - this.#containerH
                    if (this.alignContent() !== 'normal')
                        containerH = (this.#containerY || 0) - containerH
                    containerH = containerH > 0 ? containerH : 0
                    for (
                        let i = 0, cols = 0, len = this.#blocksHeight.length;
                        i < len;
                        cols += this.#layoutCols[i], i++
                    ) {
                        let colH = containerH
                        for (let l = 0; l < this.#layoutCols[i]; l++) {
                            if (colH !== 0 && this.alignContent() !== 'normal')
                                colH = (i + 1) * containerH
                            this.#startYPos.push(
                                colH +
                                    (this.#blocksHeight[i] -
                                        this.#childHeight(childs[l + cols]))
                            )
                        }
                    }
                }
            }
        }
        this.#checkLayoutType(
            _type,
            _justify_cont_func,
            _align_cont_func,
            _justify_func,
            _align_func
        )
    }
    #center(_type: TypeContent) {
        const _justify_cont_func = () => {
            if (this.#isGrid) {
                let startX = this.#contentW / 2 - this.#containerW / 2
                this.#containerX = startX > 0 ? startX : 0
            } else {
                if (this.#isFlexCol) {
                    if (this.#isWrap) {
                        for (
                            let i = 0, len = this.#blocksHeight.length;
                            i < len;
                            i++
                        ) {
                            let startY = this.#contentH - this.#blocksHeight[i]
                            this.#startYPos.push((startY > 0 ? startY : 0) / 2)
                        }
                    } else {
                        const startY = this.#contentH - this.#containerH
                        this.#containerY = startY > 0 ? startY / 2 : 0
                    }
                } else {
                    if (this.#isWrap) {
                        for (
                            let i = 0, len = this.#blocksWidth.length;
                            i < len;
                            i++
                        ) {
                            let startX = this.#contentW - this.#blocksWidth[i]
                            this.#startXPos.push((startX > 0 ? startX : 0) / 2)
                        }
                    } else {
                        const startX = this.#contentW - this.#containerW
                        this.#containerX = startX > 0 ? startX / 2 : 0
                    }
                }
            }
        }
        const _align_cont_func = () => {
            if (this.#isGrid) {
                const startY = this.#contentH - this.#containerH
                this.#containerY = startY > 0 ? startY / 2 : 0
            } else {
                if (!this.#isWrap) return
                if (this.#isFlexCol) {
                    const startX = this.#contentW - this.#containerW
                    this.#containerX =
                        startX > 0 ? startX / (this.#layoutCols.length + 1) : 0
                } else {
                    const startY = this.#contentH - this.#containerH
                    this.#containerY =
                        startY > 0 ? startY / (this.#layoutRows.length + 1) : 0
                }
            }
        }
        const _justify_func = () => {
            const childs = this.#flowingChilds
            const colsCount = this.#blocksWidth.length
            for (let i = 0, len = childs.length; i < len; i++) {
                const col = colsCount ? i % colsCount : 0
                this.#startXPos.push(
                    (this.#blocksWidth[col] || 0) / 2 -
                        this.#childWidth(childs[i]) / 2
                )
            }
        }
        const _align_func = () => {
            const childs = this.#flowingChilds
            if (this.#isGrid) {
                const colsCount = this.#layoutCols[0] || 1
                for (let i = 0, len = childs.length; i < len; i++) {
                    const row = Math.floor(i / colsCount)
                    this.#startYPos.push(
                        (this.#blocksHeight[row] || 0) / 2 -
                            this.#childHeight(childs[i]) / 2
                    )
                }
            } else {
                if (this.#isFlexCol) {
                    const startX = this.#contentW - this.#containerW
                    this.#containerX =
                        startX > 0 ? startX / (this.#layoutCols.length + 1) : 0
                    for (
                        let i = 0, row = 0, len = this.#blocksWidth.length;
                        i < len;
                        row += this.#layoutRows[i], i++
                    ) {
                        for (let j = 0; j < this.#layoutRows[i]; j++) {
                            this.#startXPos.push(
                                (this.#blocksWidth[i] -
                                    this.#childWidth(childs[j + row])) /
                                    2
                            )
                        }
                    }
                } else {
                    const startY = this.#contentH - this.#containerH
                    this.#containerY =
                        startY > 0 ? startY / (this.#layoutRows.length + 1) : 0

                    for (
                        let i = 0, col = 0, len = this.#blocksHeight.length;
                        i < len;
                        col += this.#layoutCols[i], i++
                    ) {
                        for (let j = 0; j < this.#layoutCols[i]; j++) {
                            this.#startYPos.push(
                                (this.#blocksHeight[i] -
                                    this.#childHeight(childs[j + col])) /
                                    2
                            )
                        }
                    }
                }
            }
        }
        this.#checkLayoutType(
            _type,
            _justify_cont_func,
            _align_cont_func,
            _justify_func,
            _align_func
        )
    }
    #spaceBetween(_type: TypeContent) {
        const _justify_cont_func = () => {
            if (this.#isGrid) {
                let gap = this.#contentW - this.#containerW
                const nCols =
                    this.#layoutCols[0] - 1 !== 0 ? this.#layoutCols[0] - 1 : 1
                this.gapColumn(gap > 0 ? gap / nCols : 0)
            } else {
                if (this.#isFlexCol) {
                    if (this.#isWrap) {
                        for (
                            let i = 0, len = this.#blocksHeight.length;
                            i < len;
                            i++
                        ) {
                            let gap = this.#contentH - this.#blocksHeight[i]
                            gap =
                                gap > 0
                                    ? gap / (this.#layoutRows[i] - 1 || 1)
                                    : 0
                            if (this.gapRow() > gap) gap = this.gapRow()
                            this.#rowsGap.push(gap)
                        }
                    } else {
                        let gap = this.#contentH - this.#containerH
                        gap =
                            gap > 0
                                ? gap / (this.#flowingChilds.length - 1 || 1)
                                : 0
                        this.gapRow(gap)
                    }
                } else {
                    if (this.#isWrap) {
                        for (
                            let i = 0, len = this.#blocksWidth.length;
                            i < len;
                            i++
                        ) {
                            let gap = this.#contentW - this.#blocksWidth[i]
                            gap =
                                gap > 0
                                    ? gap / (this.#layoutCols[i] - 1 || 1)
                                    : 0
                            if (this.gapColumn() > gap) gap = this.gapColumn()
                            this.#columnsGap.push(gap)
                        }
                    } else {
                        let gap = this.#contentW - this.#containerW
                        this.gapColumn(
                            gap > 0
                                ? gap / (this.#flowingChilds.length - 1 || 1)
                                : 0
                        )
                    }
                }
            }
        }
        const _align_cont_func = () => {
            if (this.#isGrid) {
                // the free space goes into the gaps between the rows, there is
                // one less of them than there are rows
                let gap = this.#contentH - this.#containerH
                this.gapRow(
                    gap > 0 ? gap / ((this.#layoutRows[0] || 1) - 1 || 1) : 0
                )
            } else {
                if (!this.#isWrap) return
                if (this.#isFlexCol) {
                    let gap = this.#contentW - this.#containerW
                    this.gapColumn(
                        gap > 0 ? gap / (this.#layoutCols.length - 1 || 1) : 0
                    )
                    this.#containerX = 0
                } else {
                    let gap = this.#contentH - this.#containerH
                    this.gapRow(
                        gap > 0 ? gap / (this.#layoutRows.length - 1 || 1) : 0
                    )
                    this.#containerY = 0
                }
            }
        }

        this.#checkLayoutType(_type, _justify_cont_func, _align_cont_func)
    }
    #spaceAround(_type: TypeContent) {
        const _justify_cont_func = () => {
            if (this.#isGrid) {
                let gap = this.#contentW - this.#containerW
                gap = gap > 0 ? gap / this.#layoutCols[0] : 0
                this.gapColumn(gap)
                this.#containerX = gap / 2
            } else {
                if (this.#isFlexCol) {
                    if (this.#isWrap) {
                        for (
                            let i = 0, len = this.#blocksHeight.length;
                            i < len;
                            i++
                        ) {
                            let gap = this.#contentH - this.#blocksHeight[i]
                            gap = gap > 0 ? gap / (this.#layoutRows[i] || 1) : 0
                            if (this.gapRow() > gap) gap = this.gapRow()
                            this.#rowsGap.push(gap)
                            this.#startYPos.push(gap / 2)
                        }
                    } else {
                        let gap = this.#contentH - this.#containerH
                        gap = gap > 0 ? gap / this.#flowingChilds.length : 0
                        this.gapRow(gap)
                        this.#containerY = gap / 2
                    }
                } else {
                    if (this.#isWrap) {
                        for (
                            let i = 0, len = this.#blocksWidth.length;
                            i < len;
                            i++
                        ) {
                            let gap = this.#contentW - this.#blocksWidth[i]
                            gap = gap > 0 ? gap / (this.#layoutCols[i] || 1) : 0
                            if (this.gapColumn() > gap) gap = this.gapColumn()
                            this.#columnsGap.push(gap)
                            this.#startXPos.push(gap / 2)
                        }
                    } else {
                        let gap = this.#contentW - this.#containerW
                        gap = gap > 0 ? gap / this.#flowingChilds.length : 0
                        this.gapColumn(gap)
                        this.#containerX = gap / 2
                    }
                }
            }
        }
        const _align_cont_func = () => {
            if (this.#isGrid) {
                let gap = this.#contentH - this.#containerH
                gap = gap > 0 ? gap / this.#layoutRows[0] : 0
                this.gapRow(gap)
                this.#containerY = gap / 2
            } else {
                if (!this.#isWrap) return
                if (this.#isFlexCol) {
                    let gap = this.#contentW - this.#containerW
                    gap = gap > 0 ? gap / this.#layoutCols.length : 0
                    this.gapColumn(gap)
                    this.#containerX = gap / 2
                } else {
                    let gap = this.#contentH - this.#containerH
                    gap = gap > 0 ? gap / this.#layoutRows.length : 0
                    this.gapRow(gap)
                    this.#containerY = gap / 2
                }
            }
        }

        this.#checkLayoutType(_type, _justify_cont_func, _align_cont_func)
    }
    #spaceEvenly(_type: TypeContent) {
        const _justify_cont_func = () => {
            if (this.#isGrid) {
                let gap = this.#contentW - this.#containerW
                gap = gap > 0 ? gap / (this.#layoutCols[0] + 1) : 0
                this.gapColumn(gap)
                this.#containerX = gap
            } else {
                if (this.#isFlexCol) {
                    if (this.#isWrap) {
                        for (
                            let i = 0, len = this.#blocksHeight.length;
                            i < len;
                            i++
                        ) {
                            let gap = this.#contentH - this.#blocksHeight[i]
                            gap = gap > 0 ? gap / (this.#layoutRows[i] + 1) : 0
                            if (this.gapRow() > gap) gap = this.gapRow()
                            this.#rowsGap.push(gap)
                            this.#startYPos.push(gap)
                        }
                    } else {
                        let gap = this.#contentH - this.#containerH
                        gap =
                            gap > 0 ? gap / (this.#flowingChilds.length + 1) : 0
                        this.gapRow(gap)
                        this.#containerY = gap
                    }
                } else {
                    if (this.#isWrap) {
                        for (
                            let i = 0, len = this.#blocksWidth.length;
                            i < len;
                            i++
                        ) {
                            let gap = this.#contentW - this.#blocksWidth[i]
                            gap =
                                gap > 0
                                    ? gap / (this.#layoutCols[i] + 1 || 1)
                                    : 0
                            if (this.gapColumn() > gap) gap = this.gapColumn()
                            this.#columnsGap.push(gap)
                            this.#startXPos.push(gap)
                        }
                    } else {
                        let gap = this.#contentW - this.#containerW
                        gap =
                            gap > 0 ? gap / (this.#flowingChilds.length + 1) : 0
                        this.gapColumn(gap)
                        this.#containerX = gap
                    }
                }
            }
        }
        const _align_cont_func = () => {
            if (this.#isGrid) {
                let gap = this.#contentH - this.#containerH
                gap = gap > 0 ? gap / (this.#layoutRows[0] + 1) : 0
                this.gapRow(gap)
                this.#containerY = gap
            } else {
                if (!this.#isWrap) return
                if (this.#isFlexCol) {
                    let gap = this.#contentW - this.#containerW
                    gap = gap > 0 ? gap / (this.#layoutCols.length + 1 || 1) : 0
                    this.gapColumn(gap)
                    this.#containerX = gap
                } else {
                    let gap = this.#contentH - this.#containerH
                    gap = gap > 0 ? gap / (this.#layoutRows.length + 1 || 1) : 0
                    this.gapRow(gap)
                    this.#containerY = gap
                }
            }
        }

        this.#checkLayoutType(_type, _justify_cont_func, _align_cont_func)
    }

    #flexRow() {
        this.#blocksWidth = []
        this.#blocksHeight = []
        this.#layoutCols = []
        this.#layoutRows = []

        let colIdx = 0
        let rowIdx = 0
        let containerW = 0
        let containerH = 0
        let wrapWidth = 0

        let startX =
            this.#startXPos[rowIdx] !== undefined
                ? this.#startXPos[rowIdx]
                : this.#containerX || 0

        let startY = this.#containerY || 0

        let gapCol =
            this.#columnsGap[rowIdx] !== undefined
                ? this.#columnsGap[rowIdx]
                : this.gapColumn()
        let gapRow =
            this.#rowsGap[rowIdx] !== undefined
                ? this.#rowsGap[rowIdx]
                : this.gapRow()

        const layoutWidth = this.#contentW
        const childs = this.#flowingChilds
        for (let i = 0, len = childs.length; i < len; i++) {
            const block = childs[i] as Block
            const blockWidthSpaces = block.marginLeft() + block.marginRight()
            const blockHeightSpaces = block.marginTop() + block.marginBottom()

            const childSize = this.#childSizes.get(block)
            const blockW = childSize ? childSize.width : block.__boxWidth()
            const blockH =
                (childSize ? childSize.height : block.__boxHeight()) +
                blockHeightSpaces

            if (this.#isWrap) {
                wrapWidth += blockW + blockWidthSpaces
                if (wrapWidth > layoutWidth) {
                    rowIdx += 1
                    startY += containerH + gapRow
                    startX =
                        this.#startXPos[rowIdx] !== undefined
                            ? this.#startXPos[rowIdx]
                            : this.#containerX || 0
                    gapCol =
                        this.#columnsGap[rowIdx] !== undefined
                            ? this.#columnsGap[rowIdx]
                            : this.gapColumn()

                    this.#blocksWidth.push(containerW)
                    this.#blocksHeight.push(containerH)
                    this.#layoutCols.push(colIdx)
                    this.#layoutRows.push(1)

                    containerW = 0
                    containerH = 0
                    colIdx = 0

                    wrapWidth = blockW + blockWidthSpaces
                }
            }
            const x = startX
            const y = startY + (this.#startYPos[i] || 0)

            if (containerH < blockH) containerH = blockH

            block.__childAdjustment = (b: BaseBlock) => {
                b.x(x)
                b.y(y)
                b.width(blockW - block.paddingLeft() - block.paddingRight())
            }
            wrapWidth += gapCol
            startX += gapCol + blockW + blockWidthSpaces
            containerW += blockW + blockWidthSpaces
            colIdx += 1
        }
        this.#blocksWidth.push(containerW)
        this.#blocksHeight.push(containerH)
        this.#layoutCols.push(colIdx)
        this.#layoutRows.push(1)
    }

    #flexColumn() {
        this.#blocksWidth = []
        this.#blocksHeight = []
        this.#layoutCols = []
        this.#layoutRows = []

        let colIdx = 0
        let rowIdx = 0
        let containerW = 0
        let containerH = 0
        let wrapHeight = 0

        let startX = this.#containerX || 0

        let startY =
            this.#startYPos[colIdx] !== undefined
                ? this.#startYPos[colIdx]
                : this.#containerY || 0

        let gapCol =
            this.#columnsGap[colIdx] !== undefined
                ? this.#columnsGap[colIdx]
                : this.gapColumn()
        let gapRow =
            this.#rowsGap[colIdx] !== undefined
                ? this.#rowsGap[colIdx]
                : this.gapRow()

        const layoutHeight = this.#contentH
        const childs = this.#flowingChilds
        for (let i = 0, len = childs.length; i < len; i++) {
            const block = childs[i] as Block
            const blockWidthSpaces = block.marginLeft() + block.marginRight()
            const blockHeightSpaces = block.marginTop() + block.marginBottom()

            const childSize = this.#childSizes.get(block)
            const blockH = childSize ? childSize.height : block.__boxHeight()
            const blockW =
                (childSize ? childSize.width : block.__boxWidth()) +
                blockWidthSpaces

            if (this.#isWrap) {
                wrapHeight += blockH + blockHeightSpaces
                if (wrapHeight > layoutHeight) {
                    colIdx += 1
                    startX += containerW + gapCol

                    startY =
                        this.#startYPos[colIdx] !== undefined
                            ? this.#startYPos[colIdx]
                            : this.#containerY || 0
                    gapRow =
                        this.#rowsGap[colIdx] !== undefined
                            ? this.#rowsGap[colIdx]
                            : this.gapRow()

                    this.#blocksWidth.push(containerW)
                    this.#blocksHeight.push(containerH)
                    this.#layoutCols.push(1)
                    this.#layoutRows.push(rowIdx)

                    containerW = 0
                    containerH = 0
                    rowIdx = 0

                    wrapHeight = blockH + blockHeightSpaces
                }
            }

            const x = startX + (this.#startXPos[i] || 0)
            const y = startY

            if (containerW < blockW) containerW = blockW

            block.__childAdjustment = (b: BaseBlock) => {
                b.x(x)
                b.y(y)
                b.height(blockH - block.paddingTop() - block.paddingBottom())
            }
            wrapHeight += gapRow
            startY += gapRow + blockH + blockHeightSpaces
            containerH += blockH + blockHeightSpaces
            rowIdx += 1
        }
        this.#blocksWidth.push(containerW)
        this.#blocksHeight.push(containerH)
        this.#layoutCols.push(1)
        this.#layoutRows.push(rowIdx)
    }

    #flexRowReverse() {
        // @Todo need to add alghorithm
        this.#flexRow()
    }
    #flexColumnReverse() {
        // @Todo need to add alghorithm
        this.#flexColumn()
    }
    #gridLayout() {
        this.#blocksWidth = []
        this.#blocksHeight = []
        this.#layoutCols = []
        this.#layoutRows = []
        const childNodes = this.#flowingChilds

        const cols = this.gridTemplateColumns()
        const rows = this.gridTemplateRows()

        const autoWidths = cols.filter((item: any) => item !== 'auto')
        let rWidth = (autoWidths as number[]).reduce(
            (p: number, c: number) => p + c,
            0
        )

        const diffCol = Math.abs(cols.length - autoWidths.length)

        if (diffCol) rWidth = (this.#contentW - rWidth) / diffCol
        else rWidth = this.#contentW / cols.length

        const autoHeights = this.gridTemplateRows().filter(
            (item: any) => item !== 'auto'
        )
        const nRows = Math.ceil(childNodes.length / cols.length)

        let rHeight = (autoHeights as number[]).reduce(
            (p: number, c: number) => p + c,
            0
        )
        const diffRow = Math.abs(nRows - autoHeights.length)
        if (diffRow) rHeight = (this.#contentH - rHeight) / diffRow
        else rHeight = this.#contentH / nRows

        const maxColWidths: number[] = []
        const maxRowHeights: number[] = []
        const colTrackWidths: number[] = new Array(cols.length)
        const rowTrackHeights: number[] = new Array(nRows)

        this.#layoutRows = [nRows]
        this.#layoutCols = [cols.length]

        let startY = this.#containerY || 0
        let rowCount = 0
        let rowIdx = 0
        while (rowIdx < this.#layoutRows[0]) {
            let startX = this.#containerX || 0
            if (rowIdx == 0) {
                startY = this.#containerY || 0
                rowCount = 0
            }

            for (let colIdx = 0; colIdx < this.#layoutCols[0]; colIdx++) {
                let colStart = 0
                let rowStart = 0

                const idx =
                    (this.#layoutCols[0] - 1) * rowCount + rowCount + colIdx

                const block = childNodes[idx]
                if (!block) continue
                const blockW = block.__boxWidth()
                const blockH = block.__boxHeight()
                if (maxColWidths[colIdx]) {
                    if (Math.round(maxColWidths[colIdx]) < Math.round(blockW)) {
                        maxColWidths[colIdx] = blockW
                        rowIdx -= rowIdx + 1
                    } else if (
                        !this.justifyContent() &&
                        rWidth > maxColWidths[colIdx]
                    )
                        maxColWidths[colIdx] = rWidth
                } else maxColWidths.push(blockW || 0)

                if (maxRowHeights[rowCount]) {
                    if (
                        Math.round(maxRowHeights[rowCount]) < Math.round(blockH)
                    )
                        maxRowHeights[rowCount] = blockH
                    else if (
                        !this.alignContent() &&
                        rHeight > maxRowHeights[rowCount]
                    )
                        maxRowHeights[rowCount] = rHeight
                } else maxRowHeights.push(blockH || 0)

                let endX = blockW
                if (cols[colIdx] === 'auto' || !cols[colIdx]) {
                    if (endX) colStart = maxColWidths[colIdx]
                    else colStart = endX = rWidth
                } else {
                    colStart = cols[colIdx] as number
                    if (!endX) endX = colStart
                }

                let endY = blockH
                if (rows[rowCount] === 'auto' || !rows[rowCount]) {
                    if (endY) rowStart = maxRowHeights[rowCount]
                    else rowStart = endY = rHeight
                } else {
                    rowStart = rows[rowCount] as number
                    if (!endY) endY = rowStart
                }
                if (
                    colTrackWidths[colIdx] === undefined ||
                    colStart > colTrackWidths[colIdx]
                )
                    colTrackWidths[colIdx] = colStart
                if (
                    rowTrackHeights[rowCount] === undefined ||
                    rowStart > rowTrackHeights[rowCount]
                )
                    rowTrackHeights[rowCount] = rowStart
                const x = startX + (this.#startXPos[idx] || 0)
                const y = startY + (this.#startYPos[idx] || 0)

                block.__childAdjustment = (b: BaseBlock) => {
                    b.width(endX - block.paddingLeft() - block.paddingRight())
                    b.height(endY - block.paddingTop() - block.paddingBottom())
                    b.x(x)
                    b.y(y)
                }

                startX += colStart + this.gapColumn()
            }
            let startYD =
                !rows[rowCount] || rows[rowCount] === 'auto'
                    ? maxRowHeights[rowCount]
                    : rows[rowCount]
            startY += (startYD as number) + this.gapRow()
            rowCount += 1
            rowIdx += 1
        }
        this.#blocksWidth = colTrackWidths
        this.#blocksHeight = rowTrackHeights
    }
}
