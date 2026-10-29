import { Block } from './Block'
import { LayoutBlock } from './LayoutBlock'
import { ShapeBlock } from './ShapeBlock'
import { RectangleBlock, CircleBlock, TextBlock, LineBlock, ImageBlock, VideoBlock } from './shapes'

// @Todo: fix type issue
export const defaultBlocks = [
    Block,
    LayoutBlock,
    ShapeBlock,
    RectangleBlock,
    CircleBlock,
    ImageBlock,
    VideoBlock,
    TextBlock,
    LineBlock
] as any[]
