import { BaseBlock, IBaseBlockOptions } from './BaseBlock'
import {
    DRAGGABLE_RUNNING_EVENT,
    initialCorners,
    OVERFLOW_X_SCROLL_RUNNING_EVENT,
    OVERFLOW_Y_SCROLL_RUNNING_EVENT,
    RESIZABLE_RUNNING_EVENT,
    ROTATABLE_RUNNING_EVENT,
    SELECTABLE_RUNNING_EVENT,
} from './const'
import { BlockConstructor, HotCornerArea, XY } from './types'
import { checkInBound } from './Utils'

export interface IRotatableOptions extends IBaseBlockOptions {
    rotatable?: boolean
    rotatableTopLeft?: boolean
    rotatableTopRight?: boolean
    rotatableBottomLeft?: boolean
    rotatableBottomRight?: boolean
    hotRotatableAreaTopLeft?: HotCornerArea
    hotRotatableAreaTopRight?: HotCornerArea
    hotRotatableAreaBottomLeft?: HotCornerArea
    hotRotatableAreaBottomRight?: HotCornerArea
    onRotatable?: (event: MouseEvent) => void
    hotRotatableAreaSize?: number
    hotRotatableAreaGap?: number
}

export const RotatableBlock = <TBase extends BlockConstructor<BaseBlock>>(
    Base: TBase
) =>
    class extends Base {
        #isRotatable: boolean
        #mouseDownEvent?: CustomEvent<MouseEvent>
        #mouseMoveEvent?: CustomEvent<MouseEvent>
        #mouseUpEvent?: CustomEvent<MouseEvent>

        constructor(...args: any[]) {
            super(...args)
            this.#isRotatable = false
            this.addProperty(
                'rotatable',
                false,
                false,
                (block: any, opt?: boolean) => {
                    this.#rotatable(block, opt)
                }
            )
            this.addProperty('rotatableTopLeft', initialCorners)
            this.addProperty('rotatableTopRight', initialCorners)
            this.addProperty('rotatableBottomLeft', initialCorners)
            this.addProperty('rotatableBottomRight', initialCorners)
            this.addProperty('hotRotatableAreaTopLeft', initialCorners)
            this.addProperty('hotRotatableAreaTopRight', initialCorners)
            this.addProperty('hotRotatableAreaBottomLeft', initialCorners)
            this.addProperty('hotRotatableAreaBottomRight', initialCorners)
            this.addProperty('hotRotatableAreaSize', 15)
            this.addProperty('hotRotatableAreaGap', 0)
            this.addProperty('onRotatable', undefined)
        }
        updateCordinates(): void {
            super.updateCordinates()

            const hotRotatableAreaGap = this.hotRotatableAreaGap()
            const hotRotatableAreaSize = this.hotRotatableAreaSize()

            const topLeftCorner = {
                x: this.cornerTopLeft().x - hotRotatableAreaGap,
                y: this.cornerTopLeft().y - hotRotatableAreaGap,
            }
            const topRightCorner = {
                x: this.cornerTopRight().x + hotRotatableAreaGap,
                y: this.cornerTopRight().y - hotRotatableAreaGap,
            }
            const bottomLeftCorner = {
                x: this.cornerBottomLeft().x - hotRotatableAreaGap,
                y: this.cornerBottomLeft().y + hotRotatableAreaGap,
            }
            const bottomRightCorner = {
                x: this.cornerBottomRight().x + hotRotatableAreaGap,
                y: this.cornerBottomRight().y + hotRotatableAreaGap,
            }

            const hotRotatableAreaTopLeft = (corner: XY) => {
                return {
                    topLeft: {
                        x: corner.x - hotRotatableAreaSize,
                        y: corner.y - hotRotatableAreaSize,
                    },
                    topRight: {
                        x: corner.x,
                        y: corner.y - hotRotatableAreaSize,
                    },
                    bottomLeft: {
                        x: corner.x - hotRotatableAreaSize,
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
                        y: corner.y - hotRotatableAreaSize,
                    },
                    topRight: {
                        x: corner.x + hotRotatableAreaSize,
                        y: corner.y - hotRotatableAreaSize,
                    },
                    bottomLeft: {
                        x: corner.x,
                        y: corner.y,
                    },
                    bottomRight: {
                        x: corner.x + hotRotatableAreaSize,
                        y: corner.y,
                    },
                }
            }
            const hotRotatableAreaBottomLeft = (corner: XY) => {
                return {
                    topLeft: {
                        x: corner.x - hotRotatableAreaSize,
                        y: corner.y,
                    },
                    topRight: {
                        x: corner.x,
                        y: corner.y,
                    },
                    bottomLeft: {
                        x: corner.x - hotRotatableAreaSize,
                        y: corner.y + hotRotatableAreaSize,
                    },
                    bottomRight: {
                        x: corner.x,
                        y: corner.y + hotRotatableAreaSize,
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
                        x: corner.x + hotRotatableAreaSize,
                        y: corner.y,
                    },
                    bottomLeft: {
                        x: corner.x,
                        y: corner.y + hotRotatableAreaSize,
                    },
                    bottomRight: {
                        x: corner.x + hotRotatableAreaSize,
                        y: corner.y + hotRotatableAreaSize,
                    },
                }
            }

            if (this.horizontalFlip() && this.verticalFlip()) {
                this.setOptionCurrent(
                    'hotRotatableAreaTopLeft',
                    hotRotatableAreaBottomRight(topLeftCorner)
                )
                this.setOptionCurrent(
                    'hotRotatableAreaTopRight',
                    hotRotatableAreaBottomLeft(topRightCorner)
                )
                this.setOptionCurrent(
                    'hotRotatableAreaBottomLeft',
                    hotRotatableAreaTopRight(bottomLeftCorner)
                )
                this.setOptionCurrent(
                    'hotRotatableAreaBottomRight',
                    hotRotatableAreaTopLeft(bottomRightCorner)
                )
            } else if (this.horizontalFlip()) {
                this.setOptionCurrent(
                    'hotRotatableAreaTopLeft',
                    hotRotatableAreaTopRight(topLeftCorner)
                )
                this.setOptionCurrent(
                    'hotRotatableAreaTopRight',
                    hotRotatableAreaTopLeft(topRightCorner)
                )
                this.setOptionCurrent(
                    'hotRotatableAreaBottomLeft',
                    hotRotatableAreaBottomRight(bottomLeftCorner)
                )
                this.setOptionCurrent(
                    'hotRotatableAreaBottomRight',
                    hotRotatableAreaBottomLeft(bottomRightCorner)
                )
            } else if (this.verticalFlip()) {
                this.setOptionCurrent(
                    'hotRotatableAreaTopLeft',
                    hotRotatableAreaBottomLeft(topLeftCorner)
                )
                this.setOptionCurrent(
                    'hotRotatableAreaTopRight',
                    hotRotatableAreaBottomRight(topRightCorner)
                )
                this.setOptionCurrent(
                    'hotRotatableAreaBottomLeft',
                    hotRotatableAreaTopLeft(bottomLeftCorner)
                )
                this.setOptionCurrent(
                    'hotRotatableAreaBottomRight',
                    hotRotatableAreaTopRight(bottomRightCorner)
                )
            } else {
                this.setOptionCurrent(
                    'hotRotatableAreaTopLeft',
                    hotRotatableAreaTopLeft(topLeftCorner)
                )
                this.setOptionCurrent(
                    'hotRotatableAreaTopRight',
                    hotRotatableAreaTopRight(topRightCorner)
                )
                this.setOptionCurrent(
                    'hotRotatableAreaBottomLeft',
                    hotRotatableAreaBottomLeft(bottomLeftCorner)
                )
                this.setOptionCurrent(
                    'hotRotatableAreaBottomRight',
                    hotRotatableAreaBottomRight(bottomRightCorner)
                )
            }
        }
        #rotateRotatableAreaCordinates(corner: string, diffR: number) {
            const cordsArea = this.getOptionCurrent(corner)
            const a = this.__rotateCordiantesByCenter(
                cordsArea.topLeft.x,
                cordsArea.topLeft.y,
                diffR
            )
            const b = this.__rotateCordiantesByCenter(
                cordsArea.topRight.x,
                cordsArea.topRight.y,
                diffR
            )
            const c = this.__rotateCordiantesByCenter(
                cordsArea.bottomLeft.x,
                cordsArea.bottomLeft.y,
                diffR
            )
            const d = this.__rotateCordiantesByCenter(
                cordsArea.bottomRight.x,
                cordsArea.bottomRight.y,
                diffR
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
            this.#rotateRotatableAreaCordinates(
                'hotRotatableAreaTopLeft',
                radian
            )
            this.#rotateRotatableAreaCordinates(
                'hotRotatableAreaTopRight',
                radian
            )
            this.#rotateRotatableAreaCordinates(
                'hotRotatableAreaBottomLeft',
                radian
            )
            this.#rotateRotatableAreaCordinates(
                'hotRotatableAreaBottomRight',
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
        #isTopLeftRotatable(x: number, y: number) {
            return (
                this.rotatableTopLeft() &&
                this.#checkCornerInBound(x, y, 'hotRotatableAreaTopLeft')
            )
        }
        #isTopRightRotatable(x: number, y: number) {
            return (
                this.rotatableTopRight() &&
                this.#checkCornerInBound(x, y, 'hotRotatableAreaTopRight')
            )
        }
        #isBottomLeftRotatable(x: number, y: number) {
            return (
                this.rotatableBottomLeft() &&
                this.#checkCornerInBound(x, y, 'hotRotatableAreaBottomLeft')
            )
        }
        #isBottomRightRotatable(x: number, y: number) {
            return (
                this.rotatableBottomRight() &&
                this.#checkCornerInBound(x, y, 'hotRotatableAreaBottomRight')
            )
        }
        #rotatable(block: any, opt?: boolean) {
            if (opt === undefined || block.#isRotatable === opt) return
            if (!opt) {
                block.__removeEvent('mousedown', block.#mouseDownEvent)
                block.__removeEvent('mousemove', block.#mouseMoveEvent)
                block.__removeEvent('mouseup', block.#mouseUpEvent)
                block.__updateRunningEvent(ROTATABLE_RUNNING_EVENT, false)
                block.#mouseDownEvent = undefined
                block.#mouseMoveEvent = undefined
                block.#mouseUpEvent = undefined
                return
            }
            block.#isRotatable = opt

            let topMove = false
            let leftMove = false
            const beforeValues: any = {}
            let inBound = false

            block.#mouseDownEvent = (event: MouseEvent) => {
                if (inBound) {
                    block.__updateRunningEvent(ROTATABLE_RUNNING_EVENT, true)
                    beforeValues[block.nodeId!] = {
                        rotate: block.rotate(),
                    }
                    block.__registerZIndex({ in: block.zIndex() })
                }
            }

            block.#mouseMoveEvent = (event: MouseEvent) => {
                if (
                    block.__isRunningEventActive(RESIZABLE_RUNNING_EVENT) ||
                    block.__isRunningEventActive(DRAGGABLE_RUNNING_EVENT) ||
                    block.__isRunningEventActive(
                        OVERFLOW_X_SCROLL_RUNNING_EVENT
                    ) ||
                    block.__isRunningEventActive(
                        OVERFLOW_Y_SCROLL_RUNNING_EVENT
                    )
                )
                    return

                let { x, y } = block.canvas?.getCursorPosition(event)!
                if (
                    !block.__isRunningEventActive(ROTATABLE_RUNNING_EVENT) &&
                    block.__isRunningEventActive(SELECTABLE_RUNNING_EVENT)
                ) {
                    let cursor: string | undefined = undefined
                    if (block.#isTopLeftRotatable(x, y)) {
                        cursor = 'cell'
                        topMove = true
                        leftMove = true
                    } else if (block.#isTopRightRotatable(x, y)) {
                        cursor = 'cell'
                        topMove = true
                        leftMove = false
                    } else if (block.#isBottomLeftRotatable(x, y)) {
                        cursor = 'cell'
                        topMove = false
                        leftMove = true
                    } else if (block.#isBottomRightRotatable(x, y)) {
                        cursor = 'cell'
                        topMove = false
                        leftMove = false
                    }
                    if (cursor) {
                        inBound = true
                        block.canvas?.changeCursor(cursor)
                    } else {
                        inBound = false
                        if (
                            block.canvas?.currentCursor &&
                            ![
                                'ew-resize',
                                'ns-resize',
                                'nwse-resize',
                                'nesw-resize',
                            ].includes(block.canvas?.currentCursor)
                        ) {
                            block.canvas?.changeCursor(cursor)
                        }
                    }
                }

                if (block.__isRunningEventActive(ROTATABLE_RUNNING_EVENT)) {
                    if (
                        block.ImFirst ||
                        block.__isRunningEventActive(ROTATABLE_RUNNING_EVENT)
                    ) {
                        let radian = Math.atan2(
                            y - block.rotationCenterY(),
                            x - block.rotationCenterX()
                        )
                        let currentRotate = block.getOptionCurrent('rotate')
                        if (topMove && leftMove) {
                            const topLeftCorner = block.cornerTopLeft()
                            const topLeft = block.__rotateCordiantesByCenter(
                                topLeftCorner.x,
                                topLeftCorner.y,
                                -currentRotate
                            )
                            currentRotate =
                                radian -
                                Math.atan2(
                                    topLeft.y - block.realCenterY,
                                    topLeft.x - block.realCenterX
                                )
                        } else if (topMove && !leftMove) {
                            const topRightCorner = block.cornerTopRight()
                            const topRight = block.__rotateCordiantesByCenter(
                                topRightCorner.x,
                                topRightCorner.y,
                                -currentRotate
                            )
                            currentRotate =
                                radian -
                                Math.atan2(
                                    topRight.y - block.realCenterY,
                                    topRight.x - block.realCenterX
                                )
                        } else if (!topMove && !leftMove) {
                            const bottomRightCorner = block.cornerBottomRight()
                            const bottomRight =
                                block.__rotateCordiantesByCenter(
                                    bottomRightCorner.x,
                                    bottomRightCorner.y,
                                    -currentRotate
                                )
                            currentRotate =
                                radian -
                                Math.atan2(
                                    bottomRight.y - block.realCenterY,
                                    bottomRight.x - block.realCenterX
                                )
                        } else if (!topMove && leftMove) {
                            const bottomLeftCorner = block.cornerBottomLeft()
                            const bottomLeft = block.__rotateCordiantesByCenter(
                                bottomLeftCorner.x,
                                bottomLeftCorner.y,
                                -currentRotate
                            )
                            currentRotate =
                                radian -
                                Math.atan2(
                                    bottomLeft.y - block.realCenterY,
                                    bottomLeft.x - block.realCenterX
                                )
                        }
                        block.setOptionCurrent('rotate', currentRotate)
                        block.onRotatable()?.(block)
                        block.__invokeChange()
                    }
                }
            }

            block.#mouseUpEvent = () => {
                if (block.__isRunningEventActive(ROTATABLE_RUNNING_EVENT)) {
                    block.canvas?.changeCursor('auto')
                    block.__updateRunningEvent(ROTATABLE_RUNNING_EVENT, false)
                    block.__registerZIndex({ out: block.zIndex() })
                    inBound = false
                    const dummy: any = {}
                    dummy[block.nodeId!] = { rotate: block.rotate() }
                    block.canvas?.takeSnapshot(beforeValues, dummy)
                }
            }
            block.__addEvent('mousedown', block.#mouseDownEvent)
            block.__addEvent('mousemove', block.#mouseMoveEvent)
            block.__addEvent('mouseup', block.#mouseUpEvent)
        }
    }
