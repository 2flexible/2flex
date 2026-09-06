import { BaseBlock, IBaseBlockOptions } from './BaseBlock'
import {
    HOT_LINE_BLOCK_NAME,
    initialCorners,
    SELECTABLE_RUNNING_EVENT,
} from './const'
import { BlockConstructor, HotCornerArea } from './types'

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
        __hotLineBlock?: BaseBlock
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
            this.#updateHotLineBlockParameters()
            super.render()
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
            return 1 + (this.higherZIndex ?? 0) + higherZindex
        }

        #hotLines(block: any, opt?: boolean) {
            if (!block.__hotLineBlock && opt) {
                const hotLineBlock = block.#buildHotLines(block)
                block.addChild(hotLineBlock)
            } else if (block.__hotLineBlock && !opt) {
                block.removeChild(block.__hotLineBlock)
                block.__hotLineBlock = undefined
            }
        }
        #updateHotLineBlockParameters() {
            if (!this.__hotLineBlock) return
            const size = this.hotCornerSize()
            const strokeWidth = this.hotCornerStrokeWidth()
            this.__hotLineBlock.rotationCenterX(this.rotationCenterX())
            this.__hotLineBlock.rotationCenterY(this.rotationCenterY())
            this.__hotLineBlock.rotate(this.rotate())
            this.__hotLineBlock.x(this.x() - (size + strokeWidth) / 2)
            this.__hotLineBlock.y(this.y() - (size + strokeWidth) / 2)
            this.__hotLineBlock.width(
                Math.abs(this.width()) + size + strokeWidth
            )
            this.__hotLineBlock.height(
                Math.abs(this.height()) + size + strokeWidth
            )
            this.__hotLineBlock.zIndex(this.#getHigherZindex())
        }

        #buildHotLines(block: any) {
            const size = block.hotCornerSize() / 2
            block.__hotLineBlock = new BaseBlock({
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
            block.__hotLineBlock.onRender((hotLineBlock: BaseBlock) => {
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

                // need to clip hot line area too
                block.__childClipping?.(hotLineBlock)

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
            return block.__hotLineBlock
        }
    }
