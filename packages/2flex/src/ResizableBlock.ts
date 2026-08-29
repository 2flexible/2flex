import { BaseBlock, IBaseBlockOptions } from './BaseBlock'
import {
    initialCorners,
    OVERFLOW_X_SCROLL_RUNNING_EVENT,
    OVERFLOW_Y_SCROLL_RUNNING_EVENT,
    RESIZABLE_RUNNING_EVENT,
    SELECTABLE_RUNNING_EVENT,
} from './const'
import { BlockConstructor, HotCornerArea, XY } from './types'
import { checkInBound } from './Utils'

export interface IResizableOptions extends IBaseBlockOptions {
    resizable?: boolean
    resizableTop?: boolean
    resizableLeft?: boolean
    resizableRight?: boolean
    resizableBottom?: boolean
    resizableTopLeft?: boolean
    resizableTopRight?: boolean
    resizableBottomLeft?: boolean
    resizableBottomRight?: boolean
    hotResizableAreaTop?: HotCornerArea
    hotResizableAreaRight?: HotCornerArea
    hotResizableAreaLeft?: HotCornerArea
    hotResizableAreaBottom?: HotCornerArea
    hotResizableAreaTopLeft?: HotCornerArea
    hotResizableAreaTopRight?: HotCornerArea
    hotResizableAreaBottomLeft?: HotCornerArea
    hotResizableAreaBottomRight?: HotCornerArea
    onResizable?: (event: MouseEvent) => void
    horizontalFlipResize?: boolean
    verticalFlipResize?: boolean
    hotResizableAreaSize?: number
    hotResizableAreaGap?: number
}

export const ResizableBlock = <TBase extends BlockConstructor<BaseBlock>>(
    Base: TBase
) =>
    class extends Base {
        #isResizable: boolean
        #mouseDownEvent?: CustomEvent<MouseEvent>
        #mouseMoveEvent?: CustomEvent<MouseEvent>
        #mouseUpEvent?: CustomEvent<MouseEvent>

        constructor(...args: any[]) {
            super(...args)
            this.#isResizable = false
            this.addProperty(
                'resizable',
                false,
                false,
                (block: typeof ResizableBlock, opt?: boolean) =>
                    this.#resizable(block, opt)
            )
            this.addProperty('resizableTop', initialCorners)
            this.addProperty('resizableLeft', initialCorners)
            this.addProperty('resizableRight', initialCorners)
            this.addProperty('resizableBottom', initialCorners)
            this.addProperty('resizableTopLeft', initialCorners)
            this.addProperty('resizableTopRight', initialCorners)
            this.addProperty('resizableBottomLeft', initialCorners)
            this.addProperty('resizableBottomRight', initialCorners)
            this.addProperty('hotResizableAreaTop', initialCorners)
            this.addProperty('hotResizableAreaRight', initialCorners)
            this.addProperty('hotResizableAreaLeft', initialCorners)
            this.addProperty('hotResizableAreaBottom', initialCorners)
            this.addProperty('hotResizableAreaTopLeft', initialCorners)
            this.addProperty('hotResizableAreaTopRight', initialCorners)
            this.addProperty('hotResizableAreaBottomLeft', initialCorners)
            this.addProperty('hotResizableAreaBottomRight', initialCorners)
            this.addProperty('onResizable', undefined)
            this.addProperty('horizontalFlipResize', undefined)
            this.addProperty('verticalFlipResize', undefined)
            this.addProperty('hotResizableAreaSize', 15)
            this.addProperty('hotResizableAreaGap', 0)
        }
        updateCordinates(): void {
            super.updateCordinates()

            const hotResizableAreaGap = this.hotResizableAreaGap()
            const hotResizableAreaSize = this.hotResizableAreaSize()

            const topLeftCorner = {
                x: this.cornerTopLeft().x - hotResizableAreaGap,
                y: this.cornerTopLeft().y - hotResizableAreaGap,
            }
            const topRightCorner = {
                x: this.cornerTopRight().x + hotResizableAreaGap,
                y: this.cornerTopRight().y - hotResizableAreaGap,
            }
            const bottomLeftCorner = {
                x: this.cornerBottomLeft().x - hotResizableAreaGap,
                y: this.cornerBottomLeft().y + hotResizableAreaGap,
            }
            const bottomRightCorner = {
                x: this.cornerBottomRight().x + hotResizableAreaGap,
                y: this.cornerBottomRight().y + hotResizableAreaGap,
            }

            const hotResizableAreaTopLeft = (corner: XY) => {
                return {
                    topLeft: {
                        x: corner.x,
                        y: corner.y,
                    },
                    topRight: {
                        x: corner.x + hotResizableAreaSize,
                        y: corner.y,
                    },
                    bottomLeft: {
                        x: corner.x,
                        y: corner.y + hotResizableAreaSize,
                    },
                    bottomRight: {
                        x: corner.x + hotResizableAreaSize,
                        y: corner.y + hotResizableAreaSize,
                    },
                }
            }
            const hotResizableAreaTopRight = (corner: XY) => {
                return {
                    topLeft: {
                        x: corner.x - hotResizableAreaSize,
                        y: corner.y,
                    },
                    topRight: {
                        x: corner.x,
                        y: corner.y,
                    },
                    bottomLeft: {
                        x: corner.x - hotResizableAreaSize,
                        y: corner.y + hotResizableAreaSize,
                    },
                    bottomRight: {
                        x: corner.x,
                        y: corner.y + hotResizableAreaSize,
                    },
                }
            }
            const hotResizableAreaBottomLeft = (corner: XY) => {
                return {
                    topLeft: {
                        x: corner.x,
                        y: corner.y - hotResizableAreaSize,
                    },
                    topRight: {
                        x: corner.x + hotResizableAreaSize,
                        y: corner.y - hotResizableAreaSize,
                    },
                    bottomLeft: {
                        x: corner.x,
                        y: corner.y,
                    },
                    bottomRight: {
                        x: corner.x + hotResizableAreaSize,
                        y: corner.y,
                    },
                }
            }
            const hotResizableAreaBottomRight = (corner: XY) => {
                return {
                    topLeft: {
                        x: corner.x - hotResizableAreaSize,
                        y: corner.y - hotResizableAreaSize,
                    },
                    topRight: {
                        x: corner.x,
                        y: corner.y - hotResizableAreaSize,
                    },
                    bottomLeft: {
                        x: corner.x - hotResizableAreaSize,
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
                        x: corner1.x + hotResizableAreaSize,
                        y: corner1.y - hotResizableAreaSize / 2,
                    },
                    topRight: {
                        x: corner2.x - hotResizableAreaSize,
                        y: corner2.y - hotResizableAreaSize / 2,
                    },
                    bottomLeft: {
                        x: corner1.x + hotResizableAreaSize,
                        y: corner1.y + hotResizableAreaSize / 2,
                    },
                    bottomRight: {
                        x: corner2.x - hotResizableAreaSize,
                        y: corner2.y + hotResizableAreaSize / 2,
                    },
                }
            }
            const hotResizableAreaHorizontal = (corner1: XY, corner2: XY) => {
                return {
                    topLeft: {
                        x: corner1.x - hotResizableAreaSize / 2,
                        y: corner1.y + hotResizableAreaSize,
                    },
                    topRight: {
                        x: corner1.x + hotResizableAreaSize / 2,
                        y: corner1.y + hotResizableAreaSize,
                    },
                    bottomLeft: {
                        x: corner2.x - hotResizableAreaSize / 2,
                        y: corner2.y - hotResizableAreaSize,
                    },
                    bottomRight: {
                        x: corner2.x + hotResizableAreaSize / 2,
                        y: corner2.y - hotResizableAreaSize,
                    },
                }
            }

            if (this.horizontalFlip() && this.verticalFlip()) {
                this.setOptionCurrent(
                    'hotResizableAreaTopLeft',
                    hotResizableAreaBottomRight(topLeftCorner)
                )
                this.setOptionCurrent(
                    'hotResizableAreaTopRight',
                    hotResizableAreaBottomLeft(topRightCorner)
                )
                this.setOptionCurrent(
                    'hotResizableAreaBottomLeft',
                    hotResizableAreaTopRight(bottomLeftCorner)
                )
                this.setOptionCurrent(
                    'hotResizableAreaBottomRight',
                    hotResizableAreaTopLeft(bottomRightCorner)
                )
                this.setOptionCurrent(
                    'hotResizableAreaTop',
                    hotResizableAreaVertical(topRightCorner, topLeftCorner)
                )
                this.setOptionCurrent(
                    'hotResizableAreaBottom',
                    hotResizableAreaVertical(
                        bottomRightCorner,
                        bottomLeftCorner
                    )
                )
                this.setOptionCurrent(
                    'hotResizableAreaLeft',
                    hotResizableAreaHorizontal(bottomLeftCorner, topLeftCorner)
                )
                this.setOptionCurrent(
                    'hotResizableAreaRight',
                    hotResizableAreaHorizontal(
                        bottomRightCorner,
                        topRightCorner
                    )
                )
            } else if (this.horizontalFlip()) {
                this.setOptionCurrent(
                    'hotResizableAreaTopLeft',
                    hotResizableAreaTopRight(topLeftCorner)
                )
                this.setOptionCurrent(
                    'hotResizableAreaTopRight',
                    hotResizableAreaTopLeft(topRightCorner)
                )
                this.setOptionCurrent(
                    'hotResizableAreaBottomLeft',
                    hotResizableAreaBottomRight(bottomLeftCorner)
                )
                this.setOptionCurrent(
                    'hotResizableAreaBottomRight',
                    hotResizableAreaBottomLeft(bottomRightCorner)
                )
                this.setOptionCurrent(
                    'hotResizableAreaTop',
                    hotResizableAreaVertical(topRightCorner, topLeftCorner)
                )
                this.setOptionCurrent(
                    'hotResizableAreaBottom',
                    hotResizableAreaVertical(
                        bottomRightCorner,
                        bottomLeftCorner
                    )
                )
                this.setOptionCurrent(
                    'hotResizableAreaLeft',
                    hotResizableAreaHorizontal(topLeftCorner, bottomLeftCorner)
                )
                this.setOptionCurrent(
                    'hotResizableAreaRight',
                    hotResizableAreaHorizontal(
                        topRightCorner,
                        bottomRightCorner
                    )
                )
            } else if (this.verticalFlip()) {
                this.setOptionCurrent(
                    'hotResizableAreaTopLeft',
                    hotResizableAreaBottomLeft(topLeftCorner)
                )
                this.setOptionCurrent(
                    'hotResizableAreaTopRight',
                    hotResizableAreaBottomRight(topRightCorner)
                )
                this.setOptionCurrent(
                    'hotResizableAreaBottomLeft',
                    hotResizableAreaTopLeft(bottomLeftCorner)
                )
                this.setOptionCurrent(
                    'hotResizableAreaBottomRight',
                    hotResizableAreaTopRight(bottomRightCorner)
                )
                this.setOptionCurrent(
                    'hotResizableAreaTop',
                    hotResizableAreaVertical(topLeftCorner, topRightCorner)
                )
                this.setOptionCurrent(
                    'hotResizableAreaBottom',
                    hotResizableAreaVertical(
                        bottomLeftCorner,
                        bottomRightCorner
                    )
                )
                this.setOptionCurrent(
                    'hotResizableAreaLeft',
                    hotResizableAreaHorizontal(bottomLeftCorner, topLeftCorner)
                )
                this.setOptionCurrent(
                    'hotResizableAreaRight',
                    hotResizableAreaHorizontal(
                        bottomRightCorner,
                        topRightCorner
                    )
                )
            } else {
                this.setOptionCurrent(
                    'hotResizableAreaTopLeft',
                    hotResizableAreaTopLeft(topLeftCorner)
                )
                this.setOptionCurrent(
                    'hotResizableAreaTopRight',
                    hotResizableAreaTopRight(topRightCorner)
                )
                this.setOptionCurrent(
                    'hotResizableAreaBottomLeft',
                    hotResizableAreaBottomLeft(bottomLeftCorner)
                )
                this.setOptionCurrent(
                    'hotResizableAreaBottomRight',
                    hotResizableAreaBottomRight(bottomRightCorner)
                )
                this.setOptionCurrent(
                    'hotResizableAreaTop',
                    hotResizableAreaVertical(topLeftCorner, topRightCorner)
                )
                this.setOptionCurrent(
                    'hotResizableAreaBottom',
                    hotResizableAreaVertical(
                        bottomLeftCorner,
                        bottomRightCorner
                    )
                )
                this.setOptionCurrent(
                    'hotResizableAreaLeft',
                    hotResizableAreaHorizontal(topLeftCorner, bottomLeftCorner)
                )
                this.setOptionCurrent(
                    'hotResizableAreaRight',
                    hotResizableAreaHorizontal(
                        topRightCorner,
                        bottomRightCorner
                    )
                )
            }
        }
        #rotateResizableAreaCordinates(corner: string, radian: number) {
            const cordsArea = this.getOptionCurrent(corner)
            const a = this.__rotateCordiantesByCenter(
                cordsArea.topLeft.x,
                cordsArea.topLeft.y,
                radian
            )
            const b = this.__rotateCordiantesByCenter(
                cordsArea.topRight.x,
                cordsArea.topRight.y,
                radian
            )
            const c = this.__rotateCordiantesByCenter(
                cordsArea.bottomLeft.x,
                cordsArea.bottomLeft.y,
                radian
            )
            const d = this.__rotateCordiantesByCenter(
                cordsArea.bottomRight.x,
                cordsArea.bottomRight.y,
                radian
            )
            this.setOptionCurrent(corner, {
                topLeft: a,
                topRight: b,
                bottomLeft: c,
                bottomRight: d,
            })
        }
        rotateCordinates(radian: number): void {
            super.rotateCordinates(radian)
            this.#rotateResizableAreaCordinates(
                'hotResizableAreaTopLeft',
                radian
            )
            this.#rotateResizableAreaCordinates(
                'hotResizableAreaTopRight',
                radian
            )
            this.#rotateResizableAreaCordinates(
                'hotResizableAreaBottomLeft',
                radian
            )
            this.#rotateResizableAreaCordinates(
                'hotResizableAreaBottomRight',
                radian
            )
            this.#rotateResizableAreaCordinates('hotResizableAreaTop', radian)
            this.#rotateResizableAreaCordinates('hotResizableAreaRight', radian)
            this.#rotateResizableAreaCordinates('hotResizableAreaLeft', radian)
            this.#rotateResizableAreaCordinates(
                'hotResizableAreaBottom',
                radian
            )
        }
        #checkCornerInBound(x: number, y: number, cornerName: string) {
            const corner = this.getOptionCurrent(cornerName)
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
        #isTopResizable(x: number, y: number) {
            return (
                this.resizableTop() &&
                this.#checkCornerInBound(x, y, 'hotResizableAreaTop')
            )
        }
        #isBottomResizable(x: number, y: number) {
            return (
                this.resizableBottom() &&
                this.#checkCornerInBound(x, y, 'hotResizableAreaBottom')
            )
        }
        #isLeftResizable(x: number, y: number) {
            return (
                this.resizableLeft() &&
                this.#checkCornerInBound(x, y, 'hotResizableAreaLeft')
            )
        }
        #isRightResizable(x: number, y: number) {
            return (
                this.resizableRight() &&
                this.#checkCornerInBound(x, y, 'hotResizableAreaRight')
            )
        }
        #isTopLeftResizable(x: number, y: number) {
            return (
                this.resizableTopLeft() &&
                this.#checkCornerInBound(x, y, 'hotResizableAreaTopLeft')
            )
        }
        #isTopRightResizable(x: number, y: number) {
            return (
                this.resizableTopRight() &&
                this.#checkCornerInBound(x, y, 'hotResizableAreaTopRight')
            )
        }
        #isBottomLeftResizable(x: number, y: number) {
            return (
                this.resizableBottomLeft() &&
                this.#checkCornerInBound(x, y, 'hotResizableAreaBottomLeft')
            )
        }
        #isBottomRightResizable(x: number, y: number) {
            return (
                this.resizableBottomRight() &&
                this.#checkCornerInBound(x, y, 'hotResizableAreaBottomRight')
            )
        }
        #chooseBoxCursorInAgle(defaultCursor: string, radian: number) {
            const cursors: { [key: string]: string[] } = {
                'ew-resize': ['nwse-resize', 'ns-resize', 'nesw-resize'],
                'ns-resize': ['nesw-resize', 'ew-resize', 'nwse-resize'],
                'nesw-resize': ['ew-resize', 'nwse-resize', 'ns-resize'],
                'nwse-resize': ['ns-resize', 'nesw-resize', 'ew-resize'],
            }

            // 22.5° to 67.5° (45° rotation)
            if (radian >= 0.3927 && radian < 1.1781) {
                return cursors[defaultCursor][0]
            }
            // 67.5° to 112.5° (90° rotation)
            else if (radian >= 1.1781 && radian < 1.9635) {
                return cursors[defaultCursor][1]
            }
            // 112.5° to 157.5° (135° rotation)
            else if (radian >= 1.9635 && radian < 2.7489) {
                return cursors[defaultCursor][2]
            }
            // -157.5° to -112.5° (-135° rotation)
            else if (radian >= -2.7489 && radian < -1.9635) {
                return cursors[defaultCursor][0]
            }
            // -112.5° to -67.5° (-90° rotation)
            else if (radian >= -1.9635 && radian < -1.1781) {
                return cursors[defaultCursor][1]
            }
            // -67.5° to -22.5° (-45° rotation)
            else if (radian >= -1.1781 && radian < -0.3927) {
                return cursors[defaultCursor][2]
            }
            // 0° to 22.5°, 157.5° to 180°, -22.5° to 0°, -180° to -157.5°
            return defaultCursor
        }
        #resizable(block: any, opt?: boolean) {
            if (opt === undefined || block.#isResizable === opt) return
            if (!opt) {
                block.__removeEvent('mousedown', block.#mouseDownEvent)
                block.__removeEvent('mousemove', block.#mouseMoveEvent)
                block.__removeEvent('mouseup', block.#mouseUpEvent)
                block.__updateRunningEvent(RESIZABLE_RUNNING_EVENT, false)
                block.#mouseDownEvent = undefined
                block.#mouseMoveEvent = undefined
                block.#mouseUpEvent = undefined
                return
            }
            block.#isResizable = opt

            let initCords = { x: 0, y: 0 }
            let beforeCords = { x: 0, y: 0 }
            let beforeValues: any = {}
            let topResize = false
            let leftResize = false
            let bottomResize = false
            let rightResize = false
            let inBound = false
            block.#mouseDownEvent = (event: MouseEvent) => {
                beforeCords = { x: 0, y: 0 }
                if (inBound) {
                    initCords = block.canvas?.getCursorPosition(event)!
                    block.__updateRunningEvent(RESIZABLE_RUNNING_EVENT, true)
                    beforeValues[block.nodeId!] = {
                        x: block.x(),
                        y: block.y(),
                        width: block.width(),
                        height: block.height(),
                    }
                    block.__registerZIndex({ in: block.zIndex() })
                }
            }
            block.#mouseMoveEvent = (event: MouseEvent) => {
                const { x, y } = block.canvas?.getCursorPosition(event)!
                if (
                    block.__isRunningEventActive(
                        OVERFLOW_X_SCROLL_RUNNING_EVENT
                    ) ||
                    block.__isRunningEventActive(
                        OVERFLOW_Y_SCROLL_RUNNING_EVENT
                    )
                )
                    return
                if (
                    !block.__isRunningEventActive(RESIZABLE_RUNNING_EVENT) &&
                    block.__isRunningEventActive(SELECTABLE_RUNNING_EVENT)
                ) {
                    let cursor: string | undefined = undefined
                    bottomResize = rightResize = topResize = leftResize = false
                    if (block.#isLeftResizable(x, y)) {
                        leftResize = true
                        cursor = 'ew-resize'
                    } else if (block.#isRightResizable(x, y)) {
                        rightResize = true
                        cursor = 'ew-resize'
                    } else if (block.#isTopResizable(x, y)) {
                        topResize = true
                        cursor = 'ns-resize'
                    } else if (block.#isBottomResizable(x, y)) {
                        cursor = 'ns-resize'
                        bottomResize = true
                    } else if (block.#isTopLeftResizable(x, y)) {
                        topResize = true
                        leftResize = true
                        cursor = 'nwse-resize'
                    } else if (block.#isTopRightResizable(x, y)) {
                        topResize = true
                        rightResize = true
                        cursor = 'nesw-resize'
                    } else if (block.#isBottomLeftResizable(x, y)) {
                        bottomResize = true
                        leftResize = true
                        cursor = 'nesw-resize'
                    } else if (block.#isBottomRightResizable(x, y)) {
                        bottomResize = true
                        rightResize = true
                        cursor = 'nwse-resize'
                    }
                    if (cursor) {
                        inBound = true
                        const horizontalFlipped = block.horizontalFlip()
                        const verticalFlipped = block.verticalFlip()
                        if (
                            (horizontalFlipped || verticalFlipped) &&
                            horizontalFlipped !== verticalFlipped
                        ) {
                            if (cursor === 'nwse-resize') cursor = 'nesw-resize'
                            else if (cursor === 'nesw-resize')
                                cursor = 'nwse-resize'
                        }
                        cursor = block.#chooseBoxCursorInAgle(
                            cursor,
                            block.rotate()
                        )
                        block.canvas?.changeCursor(cursor)
                    } else {
                        inBound = false
                        if (block.canvas?.currentCursor !== 'cell') {
                            block.canvas?.changeCursor(cursor)
                        }
                    }
                }
                if (
                    block.__isRunningEventActive(RESIZABLE_RUNNING_EVENT) &&
                    block.__ImFirst()
                ) {
                    let diffX = x - initCords.x
                    let diffY = y - initCords.y
                    if (diffX !== 0 || diffY !== 0) {
                        const cacheRotate = block.getOptionCache('rotate')
                        const diffW = diffX - beforeCords.x
                        const diffH = diffY - beforeCords.y
                        const angle = block.rotate()
                        let currentX = block.x()
                        let currentY = block.y()
                        let currentWidth = block.width()
                        let currentHeight = block.height()
                        const maxWidth = block.maxWidth() ?? Infinity
                        const minWidth = block.minWidth() ?? 0
                        const maxHeight = block.maxHeight() ?? Infinity
                        const minHeight = block.minHeight() ?? 0

                        let rotationCenterX = block.rotationCenterX()
                        let rotationCenterY = block.rotationCenterY()

                        let cornerTopLeft = block.cornerTopLeft()
                        let cornerTopRight = block.cornerTopRight()
                        let cornerBottomLeft = block.cornerBottomLeft()
                        let cornerBottomRight = block.cornerBottomRight()

                        cornerTopLeft = block.__rotateCordiantesByCenter(
                            cornerTopLeft.x,
                            cornerTopLeft.y,
                            -cacheRotate
                        )
                        cornerTopRight = block.__rotateCordiantesByCenter(
                            cornerTopRight.x,
                            cornerTopRight.y,
                            -cacheRotate
                        )
                        cornerBottomLeft = block.__rotateCordiantesByCenter(
                            cornerBottomLeft.x,
                            cornerBottomLeft.y,
                            -cacheRotate
                        )
                        cornerBottomRight = block.__rotateCordiantesByCenter(
                            cornerBottomRight.x,
                            cornerBottomRight.y,
                            -cacheRotate
                        )

                        if (leftResize || rightResize) {
                            let Cos = Math.cos(angle)
                            let Sin = Math.sin(angle)
                            const increaseX = Cos * diffW + Sin * diffH
                            const cx = increaseX * Cos
                            const cy = increaseX * Sin
                            const increaseW = increaseX * (leftResize ? 1 : -1)
                            const widthR = currentWidth - increaseW

                            if (
                                widthR < maxWidth &&
                                ((widthR > minWidth &&
                                    !block.horizontalFlipResize()) ||
                                    block.horizontalFlipResize())
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
                            const increaseY = Sin * diffW + Cos * diffH
                            const cx = increaseY * Sin
                            const cy = increaseY * Cos
                            const increaseH = increaseY * (topResize ? 1 : -1)
                            const heightR = currentHeight - increaseH
                            if (
                                heightR < maxHeight &&
                                ((heightR > minHeight &&
                                    !block.verticalFlipResize()) ||
                                    block.verticalFlipResize())
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

                        cornerTopLeft = block.__rotateCordiantesByCenter(
                            cornerTopLeft.x,
                            cornerTopLeft.y,
                            cacheRotate
                        )
                        cornerTopRight = block.__rotateCordiantesByCenter(
                            cornerTopRight.x,
                            cornerTopRight.y,
                            cacheRotate
                        )
                        cornerBottomLeft = block.__rotateCordiantesByCenter(
                            cornerBottomLeft.x,
                            cornerBottomLeft.y,
                            cacheRotate
                        )
                        cornerBottomRight = block.__rotateCordiantesByCenter(
                            cornerBottomRight.x,
                            cornerBottomRight.y,
                            cacheRotate
                        )
                        block.setOptionCurrent('cornerTopLeft', cornerTopLeft)
                        block.setOptionCurrent('cornerTopRight', cornerTopRight)
                        block.setOptionCurrent(
                            'cornerBottomLeft',
                            cornerBottomLeft
                        )
                        block.setOptionCurrent(
                            'cornerBottomRight',
                            cornerBottomRight
                        )
                        block.setOptionCurrent('x', currentX)
                        block.setOptionCurrent('y', currentY)
                        block.setOptionCache('x', currentX)
                        block.setOptionCache('y', currentY)
                        block.setOptionCurrent('width', currentWidth)
                        block.setOptionCurrent('height', currentHeight)
                        block.setOptionCache('width', currentWidth)
                        block.setOptionCache('height', currentHeight)
                        block.setOptionCurrent(
                            'rotationCenterX',
                            rotationCenterX
                        )
                        block.setOptionCurrent(
                            'rotationCenterY',
                            rotationCenterY
                        )
                        beforeCords.x = diffX
                        beforeCords.y = diffY
                        block.onResizable()?.(block)
                        block.__invokeChange()
                    }
                }
            }
            block.#mouseUpEvent = () => {
                if (block.__isRunningEventActive(RESIZABLE_RUNNING_EVENT)) {
                    block.canvas?.changeCursor('auto')
                    block.__updateRunningEvent(RESIZABLE_RUNNING_EVENT, false)
                    block.__registerZIndex({ out: block.zIndex() })
                    if (beforeCords.x !== 0 || beforeCords.y !== 0) {
                        const after: any = {}
                        after[block.nodeId!] = {
                            x: block.x(),
                            y: block.y(),
                            width: block.width(),
                            height: block.height(),
                        }
                        block.canvas?.takeSnapshot(beforeValues, after)
                    }
                }
            }
            block.__addEvent('mousedown', block.#mouseDownEvent)
            block.__addEvent('mousemove', block.#mouseMoveEvent)
            block.__addEvent('mouseup', block.#mouseUpEvent)
        }
    }
