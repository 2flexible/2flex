import { BaseBlock, BaseBlockOptions } from '../BaseBlock'
import type { OwnOptionAccessors } from '../BaseBlock'
import { SELECTABLE_RUNNING_EVENT } from '../const'
import { BlockConstructor } from '../types'

export interface ISelectableOptions extends BaseBlockOptions {
    selectable?: boolean
}

interface SelectableBlockAccessors extends OwnOptionAccessors<
    ISelectableOptions,
    BaseBlockOptions
> {}

export const SelectableBlock = <TBase extends BlockConstructor<BaseBlock>>(
    Base: TBase
) => {
    class SelectableBlock extends Base {
        #isSelectable: boolean
        #eventsAdded = false

        constructor(...args: any[]) {
            super(...args)
            this.#isSelectable = false
            this.addProperty(
                'selectable',
                false,
                false,
                (block: SelectableBlock, opt?: boolean) => {
                    this.#selectable(block, opt)
                }
            )
        }
        #selectable(block: SelectableBlock, opt?: boolean) {
            if (opt === undefined || block.#isSelectable === opt) return
            block.#isSelectable = opt
            if (!opt) {
                block.__updateRunningEvent(SELECTABLE_RUNNING_EVENT, false)
                return
            }
            if (block.#eventsAdded) return
            block.#eventsAdded = true

            const mouseDownEvent = (event: MouseEvent) => {
                if (!block.#isSelectable) return
                const isSelected = block.__isRunningEventActive(
                    SELECTABLE_RUNNING_EVENT
                )
                if (block.checkInBound(event) && block.isMouseEventAllowed) {
                    block.__registerZIndex()
                    if (block.__ImFirst()) {
                        block.__updateRunningEvent(
                            SELECTABLE_RUNNING_EVENT,
                            true
                        )
                    } else {
                        block.__unregisterZIndex()
                        block.__updateRunningEvent(
                            SELECTABLE_RUNNING_EVENT,
                            false
                        )
                    }
                } else {
                    block.__unregisterZIndex()
                    block.__updateRunningEvent(SELECTABLE_RUNNING_EVENT, false)
                }

                if (
                    isSelected !==
                    block.__isRunningEventActive(SELECTABLE_RUNNING_EVENT)
                ) {
                    block.__invokeChange()
                    block.canvas?.demandInvoke(block)
                }
            }

            const mouseUpEvent = () => {
                if (!block.#isSelectable) return
                block.__unregisterZIndex()
            }

            block.__addEvent('mousedown', mouseDownEvent)
            block.__addEvent('mouseup', mouseUpEvent)
        }
    }
    interface SelectableBlock extends SelectableBlockAccessors {}
    return SelectableBlock
}
