import { BaseBlock } from '../BaseBlock'
import {
    type ColorType,
    type OwnOptionAccessors,
    type BaseBlockOptions,
} from '../BaseBlock'
import {
    HOT_LINE_BLOCK_NAME,
    initialCorners,
    SELECTABLE_RUNNING_EVENT,
} from '../const'
import { type BlockConstructor, type HotCornerArea } from '../types'

export interface IHotLineOptions extends BaseBlockOptions {
    hotCornerSize?: number
    hotCornerRadius?: number
    hotCornerStrokeWidth?: number
    hotCornerStrokeColor?: ColorType
    hotCornerBackgroundColor?: ColorType
    hotLineStrokeWidth?: number
    hotLineStrokeColor?: ColorType
    hotLines?: boolean
}

interface HotLineBlockAccessors extends OwnOptionAccessors<
    IHotLineOptions,
    BaseBlockOptions
> {}

const DEFAULT_HOT_CORNER_SIZE = 10
const DEFAULT_HOT_CORNER_RADIUS = [0]
const DEFAULT_HOT_CORNER_BACKGROUND_COLOR = 'white'
const DEFAULT_HOT_LINE_STROKE_WIDTH = 2.5
const DEFAULT_HOT_CORNER_STROKE_WIDTH = 2.5
const DEFAULT_HOT_CORNER_STROKE_COLOR = 'blue'
const DEFAULT_HOT_LINE_STROKE_COLOR = 'blue'

export const HotLineBlock = <TBase extends BlockConstructor<BaseBlock>>(
    Base: TBase
) => {
    class HotLineBlock extends Base {
        #hotLineBlock?: BaseBlock
        #hotCornerCords: HotCornerArea

        constructor(...args: any[]) {
            super(...args)
            this.#hotCornerCords = initialCorners

            this.addProperty(
                'hotLines',
                false,
                false,
                (block: HotLineBlock, opt?: boolean) =>
                    this.#hotLines(block, opt)
            )
            this.addProperty('hotCornerSize', DEFAULT_HOT_CORNER_SIZE)
            this.addProperty('hotCornerRadius', DEFAULT_HOT_CORNER_RADIUS)
            this.addProperty(
                'hotCornerBackgroundColor',
                DEFAULT_HOT_CORNER_BACKGROUND_COLOR
            )
            this.addProperty(
                'hotLineStrokeWidth',
                DEFAULT_HOT_LINE_STROKE_WIDTH
            )
            this.addProperty(
                'hotCornerStrokeWidth',
                DEFAULT_HOT_CORNER_STROKE_WIDTH
            )
            this.addProperty(
                'hotCornerStrokeColor',
                DEFAULT_HOT_CORNER_STROKE_COLOR
            )
            this.addProperty(
                'hotLineStrokeColor',
                DEFAULT_HOT_LINE_STROKE_COLOR
            )
        }
        updateCords(): void {
            super.updateCords()
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
        #hotLines(block: HotLineBlock, opt?: boolean) {
            if (!block.#hotLineBlock && opt) {
                const hotLineBlock = block.#buildHotLines(block)
                block.addChild(hotLineBlock)
            }
        }
        #updateHotLineBlockParameters() {
            if (!this.#hotLineBlock) return
            const size = this.hotCornerSize()
            const strokeWidth = this.hotCornerStrokeWidth()
            this.#hotLineBlock.rotationCenterX(this.rotationCenterX())
            this.#hotLineBlock.rotationCenterY(this.rotationCenterY())
            this.#hotLineBlock.rotate(0)
            const bb = this.boundingBox
            const x = bb.topLeft.x
            const y = bb.topLeft.y
            const w = bb.bottomRight.x - bb.topLeft.x
            const h = bb.bottomRight.y - bb.topLeft.y
            this.#hotLineBlock.x(x - (size + strokeWidth) / 2)
            this.#hotLineBlock.y(y - (size + strokeWidth) / 2)
            this.#hotLineBlock.width(w + size + strokeWidth)
            this.#hotLineBlock.height(h + size + strokeWidth)
        }

        #buildHotLines(block: HotLineBlock) {
            block.#hotLineBlock = new BaseBlock({
                name: HOT_LINE_BLOCK_NAME,
                // absolute so the flexbox of the parent does not lay it out
                position: 'absolute',
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                rotate: 0,
                rotationCenterX: block.rotationCenterX(),
                rotationCenterY: block.rotationCenterY(),
            })
            block.#hotLineBlock.onRender((hotLineBlock: BaseBlock) => {
                if (
                    !block.__isRunningEventActive(SELECTABLE_RUNNING_EVENT) ||
                    !block.hotLines()
                )
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
                context.rotate(block.__rotation())
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
    interface HotLineBlock extends HotLineBlockAccessors {}
    return HotLineBlock
}
