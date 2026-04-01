import { Block } from './Block'
import { LayoutBlock } from './LayoutBlock'
import { ShapeBlock } from './ShapeBlock'
import { CircleBlock } from './shapes/CircleBlock'
import { ImageBlock } from './shapes/ImageBlock'
import { LineBlock } from './shapes/LineBlock'
import { RectangleBlock } from './shapes/RectangleBlock'
import { TextBlock } from './shapes/TextBlock'
import { VideoBlock } from './shapes/VideoBlock'

// @Todo: fix type issue
export const defaultBlocks = [
    Block,
    LayoutBlock,
    ShapeBlock,
    RectangleBlock,
    CircleBlock,
    LineBlock,
    TextBlock,
    ImageBlock,
    VideoBlock,
] as any[]
