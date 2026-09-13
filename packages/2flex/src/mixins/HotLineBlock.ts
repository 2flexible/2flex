import { BaseBlock, IBaseBlockOptions } from '../BaseBlock'
import {
    HOT_LINE_BLOCK_NAME,
    initialCorners,
    SELECTABLE_RUNNING_EVENT,
} from '../const'
import { BlockConstructor, HotCornerArea } from '../types'

export interface IHotLineOptions extends IBaseBlockOptions {
    hotCornerSize?: number
    hotCornerRadius?: number
    hotCornerStrokeWidth?: number
    hotCornerStrokeColor?: string
    hotCornerBackgroundColor?: string
    hotLineStrokeWidth?: number
    hotLineStrokeColor?: string
    hotLines?: boolean
}

export const HotLineBlock = <TBase extends BlockConstructor<BaseBlock>>(
    Base: TBase
) =>
    class extends Base {
        #hotLineBlock?: BaseBlock
        #hotCornerCords: HotCornerArea

        constructor(...args: any[]) {
            super(...args)
            this.#hotCornerCords = initialCorners

            this.addProperty(
                'hotLines',
                false,
                false,
                (block: any, opt?: boolean) => this.#hotLines(block, opt)
            )
            this.addProperty('hotCornerSize', 10)
            this.addProperty('hotCornerRadius', [0])
            this.addProperty('hotCornerBackgroundColor', 'white')
            this.addProperty('hotLineStrokeWidth', 2.5)
            this.addProperty('hotCornerStrokeWidth', 2.5)
            this.addProperty('hotCornerStrokeColor', 'blue')
            this.addProperty('hotLineStrokeColor', 'blue')
        }
        render() {
            super.render()
            this.#updateHotLineBlockParameters()
            this.#hotLineBlock?.__invokeChange()
        }
        updateCordinates(): void {
            super.updateCordinates()
            this.#hotCornerCords = {
                topLeft: this.cornerTopLeft(),
                topRight: this.cornerTopRight(),
                bottomLeft: this.cornerBottomLeft(),
                bottomRight: this.cornerBottomRight(),
            }
        }
        #getHigherZindex() {
            let higherZindex = 0
            if (this.__isOverflowExists) higherZindex = 2
            else {
                if (this.__isOverflowXExists) higherZindex += 1
                if (this.__isOverflowYExists) higherZindex += 1
            }
            return 1 + (this.__getHighestChildZIndex() ?? 0) + higherZindex
        }

        #hotLines(block: any, opt?: boolean) {
            if (!block.#hotLineBlock && opt) {
                const hotLineBlock = block.#buildHotLines(block)
                block.canvas?.add(hotLineBlock)
            } else if (block.#hotLineBlock && !opt) {
                block.canvas?.remove(block.#hotLineBlock)
                block.#hotLineBlock = undefined
            }
        }
        #updateHotLineBlockParameters() {
            if (!this.#hotLineBlock) return
            const size = this.hotCornerSize()
            const strokeWidth = this.hotCornerStrokeWidth()
            this.#hotLineBlock.rotationCenterX(this.rotationCenterX())
            this.#hotLineBlock.rotationCenterY(this.rotationCenterY())
            this.#hotLineBlock.rotate(this.rotate())
            const x = this.horizontalFlip()
                ? Math.abs(this.x() + this.width())
                : this.x()
            const y = this.verticalFlip()
                ? Math.abs(this.y() + this.height())
                : this.y()
            this.#hotLineBlock.x(x - (size + strokeWidth) / 2)
            this.#hotLineBlock.y(y - (size + strokeWidth) / 2)
            this.#hotLineBlock.width(
                Math.abs(this.width()) + size + strokeWidth
            )
            this.#hotLineBlock.height(
                Math.abs(this.height()) + size + strokeWidth
            )
            this.#hotLineBlock.zIndex(this.#getHigherZindex())
        }

        #buildHotLines(block: any) {
            const size = block.hotCornerSize() / 2
            block.#hotLineBlock = new BaseBlock({
                name: HOT_LINE_BLOCK_NAME,
                x: block.x() - size,
                y: block.y() - size,
                width: Math.abs(block.width()) + size,
                height: Math.abs(block.height()) + size,
                rotate: block.rotate(),
                rotationCenterX: block.rotationCenterX(),
                rotationCenterY: block.rotationCenterY(),
                zIndex: block.#getHigherZindex(),
            })
            block.#hotLineBlock.onRender((hotLineBlock: BaseBlock) => {
                if (!block.__isRunningEventActive(SELECTABLE_RUNNING_EVENT))
                    return
                const size = block.hotCornerSize()
                const radius = block.hotCornerRadius()
                const strokeWidth = block.hotCornerStrokeWidth()
                const strokeColor = block.hotCornerStrokeColor()
                const background = block.hotCornerBackgroundColor()
                const lineWidth = block.hotLineStrokeWidth()
                const lineColor = block.hotLineStrokeColor()
                const context = hotLineBlock?.context
                if (!context) return
                context.save()
                // need to clip hot line area too
                block.__childClipping?.(hotLineBlock)

                context.translate(
                    block.rotationCenterX(),
                    block.rotationCenterY()
                )
                context.rotate(block.rotate())
                context.translate(
                    -block.rotationCenterX(),
                    -block.rotationCenterY()
                )
                context.setLineDash([])

                // Draw Lines first
                context.beginPath()
                context.moveTo(
                    block.#hotCornerCords.topLeft.x,
                    block.#hotCornerCords.topLeft.y
                )
                context.lineTo(
                    block.#hotCornerCords.topRight.x,
                    block.#hotCornerCords.topRight.y
                )

                context.lineTo(
                    block.#hotCornerCords.bottomRight.x,
                    block.#hotCornerCords.bottomRight.y
                )
                context.lineTo(
                    block.#hotCornerCords.bottomLeft.x,
                    block.#hotCornerCords.bottomLeft.y
                )
                context.closePath()
                context.lineWidth = lineWidth
                context.strokeStyle = lineColor
                context.stroke()

                // Draw corner boxes
                context.beginPath()
                context.roundRect(
                    block.#hotCornerCords.topLeft.x - size / 2,
                    block.#hotCornerCords.topLeft.y - size / 2,
                    size,
                    size,
                    radius
                )
                context.roundRect(
                    block.#hotCornerCords.topRight.x - size / 2,
                    block.#hotCornerCords.topRight.y - size / 2,
                    size,
                    size,
                    radius
                )
                context.roundRect(
                    block.#hotCornerCords.bottomLeft.x - size / 2,
                    block.#hotCornerCords.bottomLeft.y - size / 2,
                    size,
                    size,
                    radius
                )
                context.roundRect(
                    block.#hotCornerCords.bottomRight.x - size / 2,
                    block.#hotCornerCords.bottomRight.y - size / 2,
                    size,
                    size,
                    radius
                )
                context.lineWidth = strokeWidth
                context.strokeStyle = strokeColor
                context.fillStyle = background
                context.fill()
                context.stroke()
                context.restore()
            })
            return block.#hotLineBlock
        }
    }
