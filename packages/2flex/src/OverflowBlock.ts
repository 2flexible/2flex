import { BaseBlock, IBaseBlockOptions } from './BaseBlock'
import {
    DRAGGABLE_RUNNING_EVENT,
    OVERFLOW_SCROLL_BAR_BLOCK_NAME,
    OVERFLOW_X_SCROLL_RUNNING_EVENT,
    OVERFLOW_Y_SCROLL_RUNNING_EVENT,
    RESIZABLE_RUNNING_EVENT,
    ROTATABLE_RUNNING_EVENT,
} from './const'
import { BlockConstructor } from './types'
import { clamp, checkInBound } from './Utils'

export type Overflow = 'visible' | 'hidden' | 'scroll' | 'auto'

export interface IOverflowOptions extends IBaseBlockOptions {
    overflow?: Overflow
    overflowX?: Overflow
    overflowY?: Overflow
    overflowPositionX?: number
    overflowPositionY?: number
}

// these const values should be customizable options
const OVERFLOW_SCROLL_BAR_MIN_SIZE = 15
const OVERFLOW_AREA_GAP = 15
const OVERFLOW_INNER_AREA_GAP = 3
const OVERFLOW_INNER_AREA_SIZE = 10
const OVERFLOW_INNER_AREA_RADIUS = 10

export const OverflowBlock = <TBase extends BlockConstructor<BaseBlock>>(
    Base: TBase
) =>
    class extends Base {
        #overflowXscrollBarBlock?: BaseBlock
        #overflowYscrollBarBlock?: BaseBlock
        #overflowWidth: number
        #overflowHeight: number
        __clipPath?: Path2D
        clipChild?: (b: BaseBlock) => void

        constructor(...args: any[]) {
            super(...args)
            this.#overflowWidth = 0
            this.#overflowHeight = 0
            this.addProperty('overflow', 'visible', false, (block: BaseBlock) =>
                this.#overflowXY(block)
            )
            this.addProperty(
                'overflowX',
                'visible',
                false,
                (block: BaseBlock) => this.#overflowX(block)
            )
            this.addProperty(
                'overflowY',
                'visible',
                false,
                (block: BaseBlock) => this.#overflowY(block)
            )
            this.addProperty('overflowPositionX', 0, true)
            this.addProperty('overflowPositionY', 0, false)
        }
        render() {
            this.#updateOverflowXBlockParameters()
            this.#updateOverflowYBlockParameters()
            super.render()
            this.#updateOverflowCordinates()
            this.#clippingPath()
        }
        #overflowX(block: any) {
            if (
                (block.__isOverflowXScroll || block.__isOverflowXAuto) &&
                !block.#overflowXscrollBarBlock
            ) {
                const scrollBar = block.#overflowXScrollBar(block)
                block.addChild(scrollBar)
            } else if (block.#overflowXscrollBarBlock) {
                block.removeChild(block.#overflowXscrollBarBlock)
                block.#overflowXscrollBarBlock = undefined
            }
        }
        #overflowY(block: any) {
            if (
                (block.__isOverflowYScroll || block.__isOverflowYAuto) &&
                !block.#overflowYscrollBarBlock
            ) {
                const scrollBar = block.#overflowYScrollBar(block)
                block.addChild(scrollBar)
            } else if (block.#overflowYscrollBarBlock) {
                block.removeChild(block.#overflowYscrollBarBlock)
                block.#overflowYscrollBarBlock = undefined
            }
        }
        #overflowXY(block: any) {
            block.#overflowX(block)
            block.#overflowY(block)
        }
        #updateOverflowXBlockParameters() {
            if (!this.#overflowXscrollBarBlock) return
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
            this.#overflowXscrollBarBlock.zIndex(1 + (this.higherZIndex ?? 0))
        }
        #updateOverflowYBlockParameters() {
            if (!this.#overflowYscrollBarBlock) return
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
            this.#overflowYscrollBarBlock.zIndex(1 + (this.higherZIndex ?? 0))
        }
        #updateOverflowCordinates() {
            if (!this.__isOverflowVisible) {
                const beforeWidth = this.#overflowWidth
                const beforeHeight =
                    this.#overflowHeight || this.#overflowScrollYHeightCut

                const reverseX = this.horizontalFlip() ? -1 : 1
                this.#overflowWidth =
                    reverseX * this.width() - this.__childsContainer.width
                const reverseY = this.verticalFlip() ? -1 : 1
                this.#overflowHeight =
                    reverseY * this.height() -
                    this.#overflowScrollYHeightCut -
                    this.__childsContainer.height

                // If overflow area cursor on the right need to adjust it to left for correcting overflow cordinate
                const diffW = this.#overflowWidth - beforeWidth
                if (diffW > 0)
                    if (this.overflowPositionX() < 0)
                        this.overflowPositionX(this.overflowPositionX() + diffW)
                    else this.overflowPositionX(0)

                // If overflow area cursor on the bottom need to adjust it to top for correcting overflow cordinate
                const diffH = this.#overflowHeight - beforeHeight
                if (diffH > 0)
                    if (this.overflowPositionY() < 0)
                        this.overflowPositionY(this.overflowPositionY() + diffH)
                    else this.overflowPositionY(0)
            }
        }
        #clampOverflowX() {
            const pos = this.overflowPositionX()
            if (this.#overflowWidth < 0) {
                if (pos < 0) {
                    this.overflowPositionX(
                        -clamp(Math.abs(pos), 0, Math.abs(this.#overflowWidth))
                    )
                } else this.overflowPositionX(0)
            } else this.overflowPositionX(0)
        }
        #clampOverflowY() {
            const pos = this.overflowPositionY()
            if (this.#overflowHeight < 0) {
                if (pos < 0) {
                    this.overflowPositionY(
                        -clamp(
                            Math.abs(pos),
                            0,
                            Math.abs(this.#overflowHeight)
                        )
                    )
                } else this.overflowPositionY(0)
            } else this.overflowPositionY(0)
        }
        updateCordinates(): void {
            super.updateCordinates()
            this.#clampOverflowX()
            this.#clampOverflowY()
        }
        __clipShape() {
            this.__clipPath?.rect(
                this.x(),
                this.y(),
                this.width(),
                this.height()
            )
        }
        #clippingPath() {
            if (!this.__isOverflowVisible) {
                this.__clipPath = new Path2D()
                this.__clipShape()
            }
        }
        get __isOverflowXScroll() {
            const overflow = this.getOptionCurrent('overflow') || 'visible'
            const overflowX = this.getOptionCurrent('overflowX') || 'visible'
            return overflow === 'scroll' || overflowX === 'scroll'
        }
        get __isOverflowYScroll() {
            const overflow = this.getOptionCurrent('overflow') || 'visible'
            const overflowY = this.getOptionCurrent('overflowY') || 'visible'
            return overflow === 'scroll' || overflowY === 'scroll'
        }
        get __isOverflowXAuto() {
            const overflow = this.getOptionCurrent('overflow') || 'visible'
            const overflowX = this.getOptionCurrent('overflowX') || 'visible'
            return overflow === 'auto' || overflowX === 'auto'
        }
        get __isOverflowYAuto() {
            const overflow = this.getOptionCurrent('overflow') || 'visible'
            const overflowY = this.getOptionCurrent('overflowY') || 'visible'
            return overflow === 'auto' || overflowY === 'auto'
        }
        get __isOverflowXAutoAllowScrool() {
            return this.__isOverflowXAuto && this.#overflowWidth < 0
        }
        get __isOverflowYAutoAllowScrool() {
            return this.__isOverflowYAuto && this.#overflowHeight < 0
        }
        get __isOverflowXScrollable() {
            return this.__isOverflowXScroll || this.__isOverflowXAutoAllowScrool
        }
        get __isOverflowYScrollable() {
            return this.__isOverflowYScroll || this.__isOverflowYAutoAllowScrool
        }
        get __isOverflowExists() {
            const overflow = this.getOptionCurrent('overflow') || 'visible'
            const overflowX = this.getOptionCurrent('overflowX') || 'visible'
            const overflowY = this.getOptionCurrent('overflowY') || 'visible'
            return (
                overflow === 'scroll' ||
                overflowX === 'scroll' ||
                overflowY === 'scroll' ||
                overflow === 'auto' ||
                overflowX === 'auto' ||
                overflowY === 'auto'
            )
        }
        get __isOverflowVisible() {
            const overflow = this.getOptionCurrent('overflow') || 'visible'
            const overflowX = this.getOptionCurrent('overflowX') || 'visible'
            const overflowY = this.getOptionCurrent('overflowY') || 'visible'
            return (
                overflow === 'visible' &&
                overflowX === 'visible' &&
                overflowY === 'visible'
            )
        }
        // need to resize height for not overlapping overflow x and y cordinates
        get #overflowScrollYHeightCut() {
            return this.__isOverflowXScrollable ? OVERFLOW_AREA_GAP : 0
        }
        get #overflowXScrollPer() {
            const width = Math.abs(this.width())
            const areaWidth = clamp(
                width + this.#overflowWidth,
                OVERFLOW_SCROLL_BAR_MIN_SIZE,
                width
            )
            const currentWidth = width + this.#overflowWidth
            if (currentWidth < 0)
                return this.#overflowWidth / -(width - areaWidth)
            return 1
        }
        get #overflowYScrollPer() {
            const height = Math.abs(this.height())
            const areaHeight = clamp(
                height +
                    (this.#overflowHeight - this.#overflowScrollYHeightCut),
                OVERFLOW_SCROLL_BAR_MIN_SIZE,
                height - this.#overflowScrollYHeightCut
            )
            const currentHeight =
                height + (this.#overflowHeight - this.#overflowScrollYHeightCut)
            if (currentHeight < 0)
                return (
                    this.#overflowHeight /
                    -(height - areaHeight - this.#overflowScrollYHeightCut)
                )
            return 1
        }
        #buildOverflowScrollAreaBar(
            block: BaseBlock,
            hotLineBlock: BaseBlock,
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
            const context = block.context
            if (!context) return
            context.save()
            context.translate(block.rotationCenterX(), block.rotationCenterY())
            context.rotate(block.rotate())
            context.translate(
                -block.rotationCenterX(),
                -block.rotationCenterY()
            )
            // need to clip overflow area too
            block.__childClipping?.(hotLineBlock)
            context.setLineDash([])
            context.beginPath()
            context.roundRect(
                coverAreaX,
                coverAreaY,
                coverAreaWidth,
                coverAreaHeight,
                0
            )
            context.fillStyle = 'white'
            context.fill()
            context.stroke()
            context.beginPath()
            context.roundRect(
                innerScrollX,
                innerScrollY,
                innerScrollWidth,
                innerScrollHeight,
                innerScrollRadius
            )
            context.fillStyle = 'gray'
            context.fill()
            context.restore()
        }
        #overflowXScrollBar(block: any) {
            if (block.#overflowXscrollBarBlock)
                return block.#overflowXscrollBarBlock
            // Intilizating overflow block and its realted cordinates
            block.#overflowXscrollBarBlock = new BaseBlock({
                name: OVERFLOW_SCROLL_BAR_BLOCK_NAME,
                width: block.width(),
                height: OVERFLOW_AREA_GAP,
                position: 'fixed',
                left: block.x(),
                top: block.height() - OVERFLOW_AREA_GAP,
                // Showing overflow scroll bar block on top of the child blocks
                zIndex: 1 + (block.higherZIndex ?? 0),
                rotationCenterX: block.rotationCenterX(),
                rotationCenterY: block.rotationCenterY(),
                rotate: block.rotate(),
            })
            // moving overflow scrollbar
            let initCords = { x: 0, y: 0 }
            let beforeCords = { x: 0, y: 0 }
            const mousedown = (event: MouseEvent) => {
                const cornerTopLeft =
                    block.#overflowXscrollBarBlock?.cornerTopLeft()!
                const cornerTopRight =
                    block.#overflowXscrollBarBlock?.cornerTopRight()!
                const cornerBottomLeft =
                    block.#overflowXscrollBarBlock?.cornerBottomLeft()!
                const cornerBottomRight =
                    block.#overflowXscrollBarBlock?.cornerBottomRight()!
                initCords =
                    block.#overflowXscrollBarBlock?.canvas?.getCursorPosition(
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
                    !(block.__isOverflowXAuto && block.#overflowWidth > 0)
                ) {
                    beforeCords = { x: 0, y: 0 }
                    block.#overflowXscrollBarBlock!.__registerZIndex({
                        in: block.#overflowXscrollBarBlock?.zIndex(),
                    })
                    block.__updateRunningEvent(
                        OVERFLOW_X_SCROLL_RUNNING_EVENT,
                        true
                    )
                } else
                    block.#overflowXscrollBarBlock!.__registerZIndex({
                        out: block.#overflowXscrollBarBlock?.zIndex(),
                    })
            }
            const mousemove = (event: MouseEvent) => {
                if (
                    block.__isRunningEventActive(
                        OVERFLOW_X_SCROLL_RUNNING_EVENT
                    ) &&
                    block.__isOverflowXScrollable
                ) {
                    block.#overflowXscrollBarBlock.__registerZIndex({
                        in: block.#overflowXscrollBarBlock.zIndex(),
                    })
                    if (block.#overflowXscrollBarBlock.__ImFirst()) {
                        const { x, y } =
                            block.#overflowXscrollBarBlock!.canvas?.getCursorPosition(
                                event
                            )!

                        let diffX = x - initCords.x
                        let diffY = y - initCords.y

                        if (diffX !== 0 || diffY !== 0) {
                            const dxX = diffX - beforeCords.x
                            const dxY = diffY - beforeCords.y
                            const angle = block.rotate()

                            const horizontalFlipped = block.horizontalFlip()
                            const verticalFlipped = block.verticalFlip()
                            let inverse = 1
                            if (
                                (horizontalFlipped || verticalFlipped) &&
                                horizontalFlipped !== verticalFlipped
                            )
                                inverse = -1
                            const scrollDeltaX =
                                (Math.cos(angle) * inverse * dxX +
                                    Math.sin(angle) * inverse * dxY) *
                                inverse
                            block.overflowPositionX(
                                block.overflowPositionX() -
                                    scrollDeltaX * block.#overflowXScrollPer
                            )
                            beforeCords.x = diffX
                            beforeCords.y = diffY
                            block.#overflowXscrollBarBlock.__invokeChange()
                        }
                    }
                }
            }
            const mouseup = () => {
                if (
                    block.__isRunningEventActive(
                        OVERFLOW_X_SCROLL_RUNNING_EVENT
                    )
                ) {
                    block.__updateRunningEvent(
                        OVERFLOW_X_SCROLL_RUNNING_EVENT,
                        false
                    )
                    block.#overflowXscrollBarBlock?.__registerZIndex({
                        out: block.#overflowXscrollBarBlock?.zIndex(),
                    })
                    block.#overflowXscrollBarBlock?.__invokeChange()
                }
            }
            block.#overflowXscrollBarBlock?.__addEvent('mousedown', mousedown)

            block.#overflowXscrollBarBlock?.__addEvent('mousemove', mousemove)
            block.#overflowXscrollBarBlock?.__addEvent('mouseup', mouseup)
            block.#overflowXscrollBarBlock.onRender(
                (overflowXScrollBar: BaseBlock) => {
                    if (
                        (block.__isOverflowXAuto && block.#overflowWidth > 0) ||
                        !overflowXScrollBar
                    )
                        return

                    const width = Math.abs(block.width())
                    const areaWidth = clamp(
                        Math.abs(width) + block.#overflowWidth,
                        OVERFLOW_SCROLL_BAR_MIN_SIZE,
                        Math.abs(width)
                    )
                    //  while inner scroll bar in minimum width need to calculate correct cordiantes
                    const xPer = block.#overflowXScrollPer
                    let bottomLeftCorner = block.cornerBottomLeft() || {
                        x: 0,
                        y: 0,
                    }
                    bottomLeftCorner = block.__rotateCordiantesByCenter(
                        bottomLeftCorner.x,
                        bottomLeftCorner.y,
                        -block.rotate()
                    )
                    const innerCordX =
                        bottomLeftCorner.x - block.overflowPositionX() / xPer
                    const innerCordY =
                        bottomLeftCorner.y -
                        OVERFLOW_AREA_GAP +
                        OVERFLOW_INNER_AREA_GAP

                    block.#buildOverflowScrollAreaBar(
                        block,
                        overflowXScrollBar,
                        overflowXScrollBar.x(),
                        overflowXScrollBar.y(),
                        overflowXScrollBar.width(),
                        overflowXScrollBar.height(),
                        innerCordX,
                        innerCordY,
                        areaWidth,
                        OVERFLOW_INNER_AREA_SIZE,
                        OVERFLOW_INNER_AREA_RADIUS
                    )
                }
            )
            return block.#overflowXscrollBarBlock
        }
        #overflowYScrollBar(block: any) {
            if (block.#overflowYscrollBarBlock)
                return block.#overflowYscrollBarBlock
            block.#overflowYscrollBarBlock = new BaseBlock({
                name: OVERFLOW_SCROLL_BAR_BLOCK_NAME,
                width: OVERFLOW_AREA_GAP,
                height: block.height() - block.#overflowScrollYHeightCut,
                position: 'fixed',
                left: block.x() + block.width() - OVERFLOW_AREA_GAP,
                top: block.y(),
                // Showing overflow scroll bar block on top of the child blocks
                zIndex: 1 + (block.higherZIndex ?? 0),
                rotationCenterX: block.rotationCenterX(),
                rotationCenterY: block.rotationCenterY(),
                rotate: block.rotate(),
            })

            // moving overflow scrollbar
            let initCords = { x: 0, y: 0 }
            let beforeCords = { x: 0, y: 0 }
            const mousedown = (event: MouseEvent) => {
                const cornerTopLeft =
                    block.#overflowYscrollBarBlock?.cornerTopLeft()!
                const cornerTopRight =
                    block.#overflowYscrollBarBlock?.cornerTopRight()!
                const cornerBottomLeft =
                    block.#overflowYscrollBarBlock?.cornerBottomLeft()!
                const cornerBottomRight =
                    block.#overflowYscrollBarBlock?.cornerBottomRight()!

                initCords =
                    block.#overflowYscrollBarBlock!.canvas?.getCursorPosition(
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
                    !(block.__isOverflowYAuto && block.#overflowHeight > 0)
                ) {
                    beforeCords = { x: 0, y: 0 }
                    block.#overflowYscrollBarBlock!.__registerZIndex({
                        in: block.#overflowYscrollBarBlock!.zIndex(),
                    })
                    block.__updateRunningEvent(
                        OVERFLOW_Y_SCROLL_RUNNING_EVENT,
                        true
                    )
                    block.__updateRunningEvent(RESIZABLE_RUNNING_EVENT, false)
                    block.__updateRunningEvent(DRAGGABLE_RUNNING_EVENT, false)
                    block.__updateRunningEvent(ROTATABLE_RUNNING_EVENT, false)
                } else
                    block.#overflowYscrollBarBlock!.__registerZIndex({
                        out: block.#overflowYscrollBarBlock!.zIndex(),
                    })
            }
            const mousemove = (event: MouseEvent) => {
                const { x, y } =
                    block.#overflowYscrollBarBlock!.canvas?.getCursorPosition(
                        event
                    )!
                const cornerTopLeft =
                    block.#overflowYscrollBarBlock?.cornerTopLeft()
                const cornerTopRight =
                    block.#overflowYscrollBarBlock?.cornerTopRight()
                const cornerBottomLeft =
                    block.#overflowYscrollBarBlock?.cornerBottomLeft()
                const cornerBottomRight =
                    block.#overflowYscrollBarBlock?.cornerBottomRight()
                // checking cursor cause resize area overlaps with the overflow area
                if (
                    !block.__isRunningEventActive(
                        OVERFLOW_Y_SCROLL_RUNNING_EVENT
                    ) &&
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
                    !(block.__isOverflowYAuto && block.#overflowHeight > 0)
                ) {
                    block.canvas?.changeCursor('auto')
                }
                if (
                    block.__isRunningEventActive(
                        OVERFLOW_Y_SCROLL_RUNNING_EVENT
                    ) &&
                    block.__isOverflowYScrollable
                ) {
                    block.#overflowYscrollBarBlock!.__registerZIndex({
                        in: block.#overflowYscrollBarBlock!.zIndex(),
                    })
                    if (block.#overflowYscrollBarBlock!.__ImFirst()) {
                        let diffX = x - initCords.x
                        let diffY = y - initCords.y

                        if (diffY !== 0 || diffX !== 0) {
                            const dxX = diffX - beforeCords.x
                            const dxY = diffY - beforeCords.y
                            const angle = block.rotate()

                            const horizontalFlipped = block.horizontalFlip()
                            const verticalFlipped = block.verticalFlip()

                            let inverse = 1
                            if (
                                (horizontalFlipped || verticalFlipped) &&
                                horizontalFlipped !== verticalFlipped
                            )
                                inverse = -1
                            const scrollDeltaY =
                                -Math.sin(angle) * inverse * dxX +
                                Math.cos(angle) * inverse * dxY
                            block.overflowPositionY(
                                block.overflowPositionY() -
                                    scrollDeltaY * block.#overflowYScrollPer
                            )
                            beforeCords.x = diffX
                            beforeCords.y = diffY
                            block.#overflowYscrollBarBlock!.__invokeChange()
                        }
                    }
                }
            }
            const mouseup = () => {
                if (
                    block.__isRunningEventActive(
                        OVERFLOW_Y_SCROLL_RUNNING_EVENT
                    )
                ) {
                    block.__updateRunningEvent(
                        OVERFLOW_Y_SCROLL_RUNNING_EVENT,
                        false
                    )
                    block.#overflowYscrollBarBlock!.__registerZIndex({
                        out: block.#overflowYscrollBarBlock!.zIndex(),
                    })
                    block.#overflowYscrollBarBlock!.__invokeChange()
                }
            }
            block.#overflowYscrollBarBlock.__addEvent('mousedown', mousedown)
            block.#overflowYscrollBarBlock.__addEvent('mousemove', mousemove)
            block.#overflowYscrollBarBlock.__addEvent('mouseup', mouseup)
            block.#overflowYscrollBarBlock.onRender(
                (overflowYScrollBar: BaseBlock) => {
                    if (
                        (block.__isOverflowYAuto &&
                            block.#overflowHeight > 0) ||
                        !overflowYScrollBar
                    )
                        return

                    const height = Math.abs(block.height())
                    const areaHeight = clamp(
                        height +
                            (block.#overflowHeight -
                                block.#overflowScrollYHeightCut),
                        OVERFLOW_SCROLL_BAR_MIN_SIZE,
                        height - block.#overflowScrollYHeightCut
                    )
                    //  while inner scroll bar in minimum width need to calculate correct cordiantes
                    const yPer = block.#overflowYScrollPer

                    let topRightCorner = block.cornerTopRight() || {
                        x: 0,
                        y: 0,
                    }
                    topRightCorner = block.__rotateCordiantesByCenter(
                        topRightCorner.x,
                        topRightCorner.y,
                        -block.rotate()
                    )
                    const innerCordX =
                        topRightCorner.x -
                        OVERFLOW_AREA_GAP +
                        OVERFLOW_INNER_AREA_GAP
                    const innerCordY =
                        topRightCorner.y - block.overflowPositionY() / yPer

                    block.#buildOverflowScrollAreaBar(
                        block,
                        overflowYScrollBar,
                        overflowYScrollBar.x(),
                        overflowYScrollBar.y(),
                        overflowYScrollBar.width(),
                        overflowYScrollBar.height(),
                        innerCordX,
                        innerCordY,
                        OVERFLOW_INNER_AREA_SIZE,
                        areaHeight,
                        OVERFLOW_INNER_AREA_RADIUS
                    )
                }
            )
            return block.#overflowYscrollBarBlock
        }
    }
