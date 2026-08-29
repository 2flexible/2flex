import { AnimationBlock, IAnimationBlock } from './AnimationBlock'
import { BaseBlock, IBaseBlockOptions, onRender } from './BaseBlock'
import { DraggableBlock, IDraggableOptions } from './DraggableBlock'
import { HotLineBlock, IHotLineOptions } from './HotLineBlock'
import { IOverflowOptions, OverflowBlock } from './OverflowBlock'
import { IResizableOptions, ResizableBlock } from './ResizableBlock'
import { IRotatableOptions, RotatableBlock } from './RotatableBlock'
import { SelectableBlock, ISelectableOptions } from './SelectableBlock'

export interface IBlockOptions
    extends
        IBaseBlockOptions,
        IOverflowOptions,
        IHotLineOptions,
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
    constructor(options: IBlockOptions) {
        super(options)
        this.addProperty(
            'onRender',
            undefined,
            false,
            (block: BaseBlock, opt?: onRender) => this.#onRender(block, opt)
        )
    }
    #onRender(thisBlock: BaseBlock, opt?: onRender) {
        const onRender = (block: any) => {
            thisBlock.context?.save()
            // need to clip child before restore if its exist
            block.__childClipping?.(thisBlock)
            opt?.(block)
            thisBlock.context?.restore()
        }
        thisBlock.setOptionCurrent('onRender', onRender)
    }
    updateChildsCordinate(): void {
        const blockHorizontalFlip = this.horizontalFlip()
        const blockVerticalFlip = this.verticalFlip()

        const pWidth = Math.abs(this.width())
        const pHeight = Math.abs(this.height())

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

            let blockW = Math.abs(b.width())
            let blockH = Math.abs(b.height())

            const blockMaxWidth = b.maxWidth()
            const blockMaxHeight = b.maxHeight()
            const blockMinWidth = b.minWidth() || 0
            const blockMinHeight = b.minHeight() || 0

            const blockMarginTop = b.marginTop()
            const blockMarginBottom = b.marginBottom()
            const blockMarginLeft = b.marginLeft()
            const blockMarginRight = b.marginRight()

            const blockWidthSpaces = blockW + blockMarginLeft + blockMarginRight
            const blockHeightSpaces =
                blockH + blockMarginTop + blockMarginBottom

            wrapWidth += blockWidthSpaces
            if (wrapWidth > pWidthSpaces) {
                startX = 0
                blocksContainerHeight += containerH
                wrapWidth = blockWidthSpaces
                startY += containerH * (blockVerticalFlip ? -1 : 1)

                containerW = 0
                containerH = 0
            }

            const blockXStart = startX + pPaddingLeft + blockMarginLeft
            const blockYStart = startY + pPaddingTop + blockMarginTop

            let x = blockXStart + cornerLeftX + this.overflowPositionX()
            let y = blockYStart + cornerTopY + this.overflowPositionY()

            if (blockPosition === 'relative') {
                if (b.left() !== undefined) x += b.left()!
                else if (b.right() !== undefined) x -= b.right()!

                if (b.top() !== undefined) y += b.top()!
                else if (b.bottom() !== undefined) y -= b.bottom()!
            } else if (blockPosition === 'sticky') {
                if (this.__isOverflowYScroll) {
                    if (
                        b.top() !== undefined &&
                        Math.abs(this.overflowPositionY()) >=
                            blockYStart - b.top()!
                    ) {
                        y += b.top()! - (this.overflowPositionY() + startY)
                    } else if (
                        b.bottom() !== undefined &&
                        Math.abs(this.overflowPositionY()) <=
                            blockYStart +
                                b.bottom()! -
                                Math.abs(pHeight - blockH)
                    ) {
                        y +=
                            -b.bottom()! -
                            (this.overflowPositionY() + startY) +
                            Math.abs(pHeight - blockH)
                    }
                }
                if (this.__isOverflowXScroll) {
                    if (
                        b.left() !== undefined &&
                        Math.abs(this.overflowPositionX()) >=
                            blockXStart - b.left()!
                    ) {
                        x += b.left()! - (this.overflowPositionX() + startX)
                    } else if (
                        b.right() !== undefined &&
                        Math.abs(this.overflowPositionX()) <=
                            blockXStart - b.right()! - Math.abs(pWidth - blockW)
                    ) {
                        x +=
                            b.right()! -
                            (this.overflowPositionX() + startX) +
                            Math.abs(pWidth - blockW)
                    }
                }
            }
            startX += blockWidthSpaces * (blockHorizontalFlip ? -1 : 1)
            containerW += blockWidthSpaces

            if (containerH < blockHeightSpaces) containerH = blockHeightSpaces

            if (containerW > blocksContainerWidth)
                blocksContainerWidth = containerW

            if (currIdx == arrLen - 1) blocksContainerHeight += containerH

            if (
                blockMaxWidth !== undefined &&
                ((pWidthSpaces < blockW && pWidth > blockMinWidth) ||
                    blockW < blockMaxWidth)
            )
                blockW += pWidthSpaces - blockW
            if (
                blockMaxHeight !== undefined &&
                ((pHeightSpaces < blockH && pHeight > blockMinHeight) ||
                    blockH < blockMaxHeight)
            ) {
                blockH += pHeightSpaces - blockH
            }
            console.log(b.options.get('backgroundColor'), blockW)

            b.setOptionCurrent('rotate', pCurrentRotate)
            b.setOptionCache('rotate', pCacheRotate)
            b.__childAdjustment = (b: BaseBlock) => {
                b.hidden(this.hidden())
                if (b.rotationCenter() === 'parent') {
                    b.rotationCenterX(centerX)
                    b.rotationCenterY(centerY)
                }
                b.x(x)
                b.y(y)
                if (blockHorizontalFlip) blockW = -blockW
                if (blockVerticalFlip) blockH = -blockH
                b.width(blockW)
                b.height(blockH)
            }

            if (this.__clipPath || this.parentNode?.__clipPath) {
                b.__childClipping = (b: BaseBlock) => {
                    // in rotate of partent clipping also need to be rotated
                    b.context?.translate(centerX, centerY)
                    b.context?.rotate(pCurrentRotate)
                    b.context?.translate(-centerX, -centerY)
                    // if parent clipping exists need to add another clip for it too
                    if (this.__clipPath!)
                        b.context?.clip(this.__clipPath!, 'nonzero')
                    if (this.parentNode?.__clipPath)
                        b.context?.clip(this.parentNode?.__clipPath, 'nonzero')

                    // after clip need to reset to its default rotation
                    b.context?.translate(centerX, centerY)
                    b.context?.rotate(-pCurrentRotate)
                    b.context?.translate(-centerX, -centerY)
                }
            }
        })
        this.__childsContainer = {
            width: blocksContainerWidth,
            height: blocksContainerHeight,
        }
    }
    removeChild(child: BaseBlock): void {
        super.removeChild(child)
        child.__childClipping = undefined
    }
    __overflowTranslateX(x: number) {
        this.overflowPositionX(this.overflowPositionX() + x)
    }
    __overflowTranslateY(y: number) {
        this.overflowPositionY(this.overflowPositionY() + y)
    }
}
