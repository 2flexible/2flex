import { BaseBlock, IBaseBlockOptions } from './BaseBlock'
import {
    DRAGGABLE_RUNNING_EVENT,
    OVERFLOW_X_SCROLL_RUNNING_EVENT,
    OVERFLOW_Y_SCROLL_RUNNING_EVENT,
    RESIZABLE_RUNNING_EVENT,
    ROTATABLE_RUNNING_EVENT,
} from './const'
import { BlockConstructor } from './types'

export interface IDraggableOptions extends IBaseBlockOptions {
    draggable?: boolean
    draggableX?: boolean
    draggableY?: boolean
    onDraggable?: (event: MouseEvent) => void
}

export const DraggableBlock = <TBase extends BlockConstructor<BaseBlock>>(
    Base: TBase
) =>
    class extends Base {
        #isDraggable: boolean
        #mouseDownEvent?: CustomEvent<MouseEvent>
        #mouseMoveEvent?: CustomEvent<MouseEvent>
        #mouseUpEvent?: CustomEvent<MouseEvent>

        constructor(...args: any[]) {
            super(...args)
            this.#isDraggable = false
            this.addProperty(
                'draggable',
                false,
                false,
                (block: any, opt?: boolean) => this.#draggable(block, opt)
            )
            this.addProperty('onDraggable', undefined)
            this.addProperty('draggableX', true)
            this.addProperty('draggableY', true)
        }
        #draggable(block: any, opt?: boolean) {
            if (opt === undefined || block.#isDraggable === opt) return
            if (!opt) {
                block.__removeEvent('mousedown', block.#mouseDownEvent)
                block.__removeEvent('mousemove', block.#mouseMoveEvent)
                block.__removeEvent('mouseup', block.#mouseUpEvent)
                block.__updateRunningEvent(DRAGGABLE_RUNNING_EVENT, false)
                block.#mouseDownEvent = undefined
                block.#mouseMoveEvent = undefined
                block.#mouseUpEvent = undefined
                return
            }
            block.#isDraggable = opt

            let initCords = { x: 0, y: 0 }
            let beforeCords = { x: 0, y: 0 }
            let beforeValues: any = {}
            block.#mouseDownEvent = (event: MouseEvent) => {
                if (!block.selectable()) return
                if (block.checkInBound(event)) {
                    block.__registerZIndex({ in: block.zIndex() })
                    if (block.__ImFirst()) {
                        initCords = block.canvas?.getCursorPosition(event)!
                        beforeCords = { x: 0, y: 0 }
                        beforeValues[block.nodeId!] = {
                            x: block.x(),
                            y: block.y(),
                        }
                        block.__updateRunningEvent(
                            DRAGGABLE_RUNNING_EVENT,
                            true
                        )
                    }
                }
            }
            block.#mouseMoveEvent = (event: MouseEvent) => {
                if (
                    block.__isRunningEventActive(RESIZABLE_RUNNING_EVENT) ||
                    block.__isRunningEventActive(ROTATABLE_RUNNING_EVENT) ||
                    block.__isRunningEventActive(
                        OVERFLOW_X_SCROLL_RUNNING_EVENT
                    ) ||
                    block.__isRunningEventActive(
                        OVERFLOW_Y_SCROLL_RUNNING_EVENT
                    )
                )
                    return

                if (
                    block.__isRunningEventActive(DRAGGABLE_RUNNING_EVENT) &&
                    block.__ImFirst()
                ) {
                    const { x, y } = block.canvas?.getCursorPosition(event)!
                    let diffX = x - initCords.x
                    let diffY = y - initCords.y
                    if (diffX !== 0 && block.draggableX()) {
                        const diff = diffX - beforeCords.x
                        block.__translateX(diff)
                        beforeCords.x = diffX
                    }
                    if (diffY !== 0 && block.draggableY()) {
                        const diff = diffY - beforeCords.y
                        block.__translateY(diff)
                        beforeCords.y = diffY
                    }
                    block.onDraggable()?.(block)
                    block.__invokeChange()
                }
            }
            block.#mouseUpEvent = () => {
                if (block.__isRunningEventActive(DRAGGABLE_RUNNING_EVENT)) {
                    block.__registerZIndex({ out: block.zIndex() })
                    block.__updateRunningEvent(DRAGGABLE_RUNNING_EVENT, false)
                    if (beforeCords.x !== 0 || beforeCords.y !== 0) {
                        const after: any = {}
                        after[block.nodeId!] = {
                            x: block.x(),
                            y: block.y(),
                        }
                        block.canvas?.takeSnapshot(beforeValues, after)
                        block.__invokeChange()
                    }
                }
            }
            block.__addEvent('mousedown', block.#mouseDownEvent)
            block.__addEvent('mousemove', block.#mouseMoveEvent)
            block.__addEvent('mouseup', block.#mouseUpEvent)
        }
    }
