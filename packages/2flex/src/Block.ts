import { HotLineBlock, IHotLineBlockOptions } from './mixins/HotLineBlock'
import { BaseBlock, BaseBlockOptions, onRender } from './BaseBlock'
import { AnimationBlock, IAnimationBlock } from './mixins/AnimationBlock'
import { DraggableBlock, IDraggableOptions } from './mixins/DraggableBlock'
import { IOverflowOptions, OverflowBlock } from './mixins/OverflowBlock'
import { IResizableOptions, ResizableBlock } from './mixins/ResizableBlock'
import { IRotatableOptions, RotatableBlock } from './mixins/RotatableBlock'
import { SelectableBlock, ISelectableOptions } from './mixins/SelectableBlock'
import { clampSize } from './Utils'

export interface BlockOptions
    extends
        BaseBlockOptions,
        IOverflowOptions,
        IHotLineBlockOptions,
        ISelectableOptions,
        IResizableOptions,
        IRotatableOptions,
        IDraggableOptions,
        IAnimationBlock {}

export class Block extends OverflowBlock(
    HotLineBlock(
        SelectableBlock(
            ResizableBlock(
                RotatableBlock(DraggableBlock(AnimationBlock(BaseBlock)))
            )
        )
    )
) {
    #userOnRender?: onRender
    #onRenderWrapper?: onRender
    constructor(options: BlockOptions) {
        super(options)
        this.addProperty(
            'onRender',
            undefined,
            false,
            (block: Block, opt?: onRender) => this.#onRender(block, opt)
        )
    }
    render() {
        super.render()
        this.__childClipping?.(this)
    }
    #onRender(thisBlock: Block, opt?: onRender) {
        // getter call returns already wrapped value, so it must not be
        // registered as a new user callback or it would wrap itself forever
        if (opt !== undefined && opt !== thisBlock.#onRenderWrapper)
            thisBlock.#userOnRender = opt

        if (thisBlock.#onRenderWrapper === undefined) {
            thisBlock.#onRenderWrapper = (block: any) => {
                thisBlock.context?.save()
                // need to clip child before restore if its exist
                block.__childClipping?.(thisBlock)
                thisBlock.#userOnRender?.(block)
                thisBlock.context?.restore()
            }
        }
        // set() writes the raw option value back, so wrapper always must be stored
        if (
            thisBlock.getOptionCurrent('onRender') !==
            thisBlock.#onRenderWrapper
        )
            thisBlock.setOptionCurrent('onRender', thisBlock.#onRenderWrapper)
    }
    updateChildsCordinate(): void {
        const blockHorizontalFlip = this.horizontalFlip()
        const blockVerticalFlip = this.verticalFlip()
        const overflowXSign = blockHorizontalFlip ? -1 : 1
        const overflowYSign = blockVerticalFlip ? -1 : 1

        const pWidth = Math.abs(this.width())
        const pHeight = Math.abs(this.height())

        const pPaddingLeft = this.paddingLeft()
        const pPaddingTop = this.paddingTop()

        const centerX = this.rotationCenterX()
        const centerY = this.rotationCenterY()

        const pCurrentRotate = this.__rotation()

        const cornerLeftX = this.cornerTopLeft().x
        const cornerTopY = this.cornerTopLeft().y

        const overflowPositionX = this.overflowPositionX()
        const overflowPositionY = this.overflowPositionY()

        let startX = 0
        let startY = 0
        let containerW = 0
        let containerH = 0
        let wrapWidth = 0

        let blocksContainerWidth = 0
        let blocksContainerHeight = 0
        let laidOutCount = 0

        this.listOnlyChilds((b: BaseBlock) => {
            const blockPosition = b.position()
            b.__parentHidden = this.__isHidden()
            if (blockPosition === 'absolute' || blockPosition === 'fixed') {
                b.__childAdjustment = undefined
                b.__resetParentRotation()
                b.canvas?.demandInvoke(b)
                return
            }
            laidOutCount++
            let blockW = Math.abs(b.__boxWidth())
            let blockH = Math.abs(b.__boxHeight())

            const blockInitW = b.__initResolved('width') as number
            const blockInitH = b.__initResolved('height') as number
            // a child without a size keeps the size it measured for itself
            const blockOwnsWidth = blockInitW === undefined
            const blockOwnsHeight = blockInitH === undefined

            const blockMarginTop = b.marginTop()
            const blockMarginBottom = b.marginBottom()
            const blockMarginLeft = b.marginLeft()
            const blockMarginRight = b.marginRight()

            const top = b.top()
            const bottom = b.bottom()
            const left = b.left()
            const right = b.right()

            const blockWidthSpaces = blockW + blockMarginLeft + blockMarginRight
            const blockHeightSpaces =
                blockH + blockMarginTop + blockMarginBottom

            wrapWidth += blockWidthSpaces
            if (wrapWidth > pWidth) {
                startX = 0
                blocksContainerHeight += containerH
                wrapWidth = blockWidthSpaces
                startY += containerH * (blockVerticalFlip ? -1 : 1)

                containerW = 0
                containerH = 0
            }

            const blockXStart =
                startX + pPaddingLeft + blockMarginLeft * overflowXSign
            const blockYStart =
                startY + pPaddingTop + blockMarginTop * overflowYSign

            let x =
                blockXStart + cornerLeftX + overflowPositionX * overflowXSign
            let y = blockYStart + cornerTopY + overflowPositionY * overflowYSign

            if (blockPosition === 'relative') {
                if (left !== undefined) x += left
                else if (right !== undefined) x -= right
                if (top !== undefined) y += top
                else if (bottom !== undefined) y -= bottom
            } else if (blockPosition === 'sticky') {
                if (this.__isOverflowYScroll) {
                    if (
                        top !== undefined &&
                        Math.abs(overflowPositionY) >= blockYStart - top
                    ) {
                        y += top - (overflowPositionY * overflowYSign + startY)
                    } else if (
                        bottom !== undefined &&
                        Math.abs(overflowPositionY) <=
                            blockYStart + bottom - Math.abs(pHeight - blockH)
                    ) {
                        y +=
                            -bottom -
                            (overflowPositionY * overflowYSign + startY) +
                            Math.abs(pHeight - blockH)
                    }
                }
                if (this.__isOverflowXScroll) {
                    if (
                        left !== undefined &&
                        Math.abs(overflowPositionX) >= blockXStart - left
                    ) {
                        x += left - (overflowPositionX * overflowXSign + startX)
                    } else if (
                        right !== undefined &&
                        Math.abs(overflowPositionX) <=
                            blockXStart - right - Math.abs(pWidth - blockW)
                    ) {
                        x +=
                            right -
                            (overflowPositionX * overflowXSign + startX) +
                            Math.abs(pWidth - blockW)
                    }
                }
            }
            startX += blockWidthSpaces * (blockHorizontalFlip ? -1 : 1)
            containerW += blockWidthSpaces

            if (containerH < blockHeightSpaces) containerH = blockHeightSpaces

            if (containerW > blocksContainerWidth)
                blocksContainerWidth = containerW

            blockW = blockInitW !== undefined ? blockInitW : blockW
            blockH = blockInitH !== undefined ? blockInitH : blockH

            b.__parentRotate = pCurrentRotate
            b.__childAdjustment = (b: BaseBlock) => {
                if (b.rotationCenter() === 'parent') {
                    b.setOptionCurrent('rotationCenterX', centerX)
                    b.setOptionCurrent('rotationCenterY', centerY)
                }
                b.setOptionCurrent('x', x)
                b.setOptionCurrent('y', y)
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
        if (laidOutCount > 0) blocksContainerHeight += containerH
        this.__childsContainer = {
            width: blocksContainerWidth,
            height: blocksContainerHeight,
        }
    }
    __overflowTranslateX(x: number) {
        this.overflowPositionX(this.overflowPositionX() + x)
    }
    __overflowTranslateY(y: number) {
        this.overflowPositionY(this.overflowPositionY() + y)
    }
}
