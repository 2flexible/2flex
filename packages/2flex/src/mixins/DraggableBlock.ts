import { BaseBlock, BaseBlockOptions } from '../BaseBlock'
import type { OwnOptionAccessors } from '../BaseBlock'
import {
    DRAGGABLE_RUNNING_EVENT,
    OVERFLOW_X_SCROLL_RUNNING_EVENT,
    OVERFLOW_Y_SCROLL_RUNNING_EVENT,
    RESIZABLE_RUNNING_EVENT,
    ROTATABLE_RUNNING_EVENT,
} from '../const'
import { BlockConstructor } from '../types'

export interface IDraggableOptions extends BaseBlockOptions {
    draggable?: boolean
    draggableX?: boolean
    draggableY?: boolean
    onDraggable?: (event: MouseEvent) => void
}

interface DraggableBlockAccessors extends OwnOptionAccessors<
    IDraggableOptions,
    BaseBlockOptions
> {}

export const DraggableBlock = <TBase extends BlockConstructor<BaseBlock>>(
    Base: TBase
) => {
    class DraggableBlock extends Base {
        #isDraggable: boolean
        #eventsAdded = false

        constructor(...args: any[]) {
            super(...args)
            this.#isDraggable = false
            this.addProperty(
                'draggable',
                false,
                false,
                (block: DraggableBlock, opt?: boolean) =>
                    this.#draggable(block, opt)
            )
            this.addProperty('onDraggable', undefined)
            this.addProperty('draggableX', true)
            this.addProperty('draggableY', true)
        }
        #draggable(block: DraggableBlock, opt?: boolean) {
            if (opt === undefined || block.#isDraggable === opt) return
            block.#isDraggable = opt
            if (!opt) {
                block.__updateRunningEvent(DRAGGABLE_RUNNING_EVENT, false)
                return
            }
            if (block.#eventsAdded) return
            block.#eventsAdded = true

            let initCords = { x: 0, y: 0 }
            let beforeCords = { x: 0, y: 0 }
            let beforeValues = {}
            const mouseDownEvent = (event: MouseEvent) => {
                const isSelectable =
                    (block as { selectable?: () => boolean }).selectable?.() ??
                    true
                if (!block.#isDraggable || !isSelectable) return
                if (block.checkInBound(event) && block.isMouseEventAllowed) {
                    block.__registerZIndex()
                    if (block.__ImFirst()) {
                        initCords = block.canvas?.getCursorPosition(event)!
                        beforeCords = { x: 0, y: 0 }
                        beforeValues = {
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
            const mouseMoveEvent = (event: MouseEvent) => {
                if (!block.#isDraggable) return
                if (
                    block.__isRunningEventActive(RESIZABLE_RUNNING_EVENT) ||
                    block.__isRunningEventActive(ROTATABLE_RUNNING_EVENT) ||
                    block.__isRunningEventActive(
                        OVERFLOW_X_SCROLL_RUNNING_EVENT
                    ) ||
                    block.__isRunningEventActive(
                        OVERFLOW_Y_SCROLL_RUNNING_EVENT
                    ) ||
                    !block.isMouseEventAllowed
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
                    block.onDraggable()?.(event)
                    block.__invokeChange()
                }
            }
            const mouseUpEvent = () => {
                if (!block.#isDraggable) return
                if (
                    block.__isRunningEventActive(DRAGGABLE_RUNNING_EVENT) &&
                    block.isMouseEventAllowed
                ) {
                    block.__unregisterZIndex()
                    block.__updateRunningEvent(DRAGGABLE_RUNNING_EVENT, false)
                    if (beforeCords.x !== 0 || beforeCords.y !== 0) {
                        const after: Record<string, unknown> = {
                            x: block.x(),
                            y: block.y(),
                        }
                        block.__invokeHistory(beforeValues, after)
                        block.__invokeChange()
                    }
                }
            }
            block.__addEvent('mousedown', mouseDownEvent)
            block.__addEvent('mousemove', mouseMoveEvent)
            block.__addEvent('mouseup', mouseUpEvent)
        }
    }
    interface DraggableBlock extends DraggableBlockAccessors {}
    return DraggableBlock
}
