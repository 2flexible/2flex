import { BaseBlock, IBaseBlockOptions } from './BaseBlock'
import { SELECTABLE_RUNNING_EVENT } from './const'
import { BlockConstructor, CustomEvent } from './types'

export interface ISelectableOptions extends IBaseBlockOptions {
    selectable?: boolean
}

export const SelectableBlock = <TBase extends BlockConstructor<BaseBlock>>(
    Base: TBase
) =>
    class extends Base {
        #isSelectable: boolean
        #mouseDownEvent?: CustomEvent<MouseEvent>
        #mouseUpEvent?: CustomEvent<MouseEvent>

        constructor(...args: any[]) {
            super(...args)
            this.#isSelectable = false
            this.addProperty(
                'selectable',
                false,
                false,
                (block: any, opt?: boolean) => {
                    this.#selectable(block, opt)
                }
            )
        }
        #selectable(block: any, opt?: boolean) {
            if (opt === undefined || block.#isSelectable === opt) return
            if (!opt) {
                block.__removeEvent('mousedown', block.#mouseDownEvent)
                block.__removeEvent('mouseup', block.#mouseUpEvent)
                block.__updateRunningEvent(SELECTABLE_RUNNING_EVENT, false)
                block.#mouseDownEvent = undefined
                block.#mouseUpEvent = undefined
                return
            }
            block.#isSelectable = opt

            block.#mouseDownEvent = (event: MouseEvent) => {
                if (block.checkInBound(event)) {
                    block.__registerZIndex({ in: block.zIndex() })
                    if (block.__ImFirst()) {
                        block.__updateRunningEvent(
                            SELECTABLE_RUNNING_EVENT,
                            true
                        )
                    } else {
                        block.__registerZIndex({ out: block.zIndex() })
                        block.__updateRunningEvent(
                            SELECTABLE_RUNNING_EVENT,
                            false
                        )
                    }
                } else {
                    block.__registerZIndex({ out: block.zIndex() })
                    block.__updateRunningEvent(SELECTABLE_RUNNING_EVENT, false)
                }
                block.__invokeChange()
            }

            block.#mouseUpEvent = (event: MouseEvent) => {
                block.__registerZIndex({ out: block.zIndex() })
            }

            block.__addEvent('mousedown', block.#mouseDownEvent)
            block.__addEvent('mouseup', block.#mouseUpEvent)
        }
    }
