import { type BaseBlock } from './BaseBlock'
import { Block } from './Block'
import { LayoutBlock } from './LayoutBlock'
import { ShapeBlock } from './ShapeBlock'
import {
    RectangleBlock,
    CircleBlock,
    TextBlock,
    LineBlock,
    ImageBlock,
    VideoBlock,
} from './shapes'

export const defaultBlocks = [
    Block,
    LayoutBlock,
    ShapeBlock,
    RectangleBlock,
    CircleBlock,
    ImageBlock,
    VideoBlock,
    TextBlock,
    LineBlock,
] as unknown as (typeof BaseBlock)[]
