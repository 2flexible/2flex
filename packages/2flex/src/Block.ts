import { HotLineBlock, IHotLineOptions } from './mixins/HotLineBlock'
import { BaseBlock, IBaseBlockOptions, onRender } from './BaseBlock'
import { AnimationBlock, IAnimationBlock } from './mixins/AnimationBlock'
import { DraggableBlock, IDraggableOptions } from './mixins/DraggableBlock'
import { IOverflowOptions, OverflowBlock } from './mixins/OverflowBlock'
import { IResizableOptions, ResizableBlock } from './mixins/ResizableBlock'
import { IRotatableOptions, RotatableBlock } from './mixins/RotatableBlock'
import { SelectableBlock, ISelectableOptions } from './mixins/SelectableBlock'

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
    render() {
        super.render()
        this.__childClipping?.(this)
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
        const overflowXSign = blockHorizontalFlip ? -1 : 1
        const overflowYSign = blockVerticalFlip ? -1 : 1

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

        const overflowPositionX = this.overflowPositionX()
        const overflowPositionY = this.overflowPositionY()

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

            const blockInitW = b.__unitConverter({
                val: b.initWidth,
                widthRelated: true,
            }) as number
            const blockInitH = b.__unitConverter({
                val: b.initHeight,
                widthRelated: false,
            }) as number

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
            if (wrapWidth > pWidthSpaces) {
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

            if (currIdx == arrLen - 1) blocksContainerHeight += containerH

            blockW = blockInitW
            blockH = blockInitH

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
