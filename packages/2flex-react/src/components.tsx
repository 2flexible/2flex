import {
    Block as BlockBlock,
    CircleBlock,
    ImageBlock,
    LayoutBlock,
    LineBlock,
    RectangleBlock,
    TextBlock,
    VideoBlock,
} from '@2flexible/2flex'
import { makeBlockComponent } from './makeBlockComponent'

/**
 * A block without visuals of its own.
 *
 * It is the base of every block, it brings the transformations, the events
 * and the animation of the library.
 */
export const Block = makeBlockComponent(BlockBlock)

/**
 * A block that lays its children out.
 *
 * The children are placed in a row or in a column, or in a grid.
 */
export const Layout = makeBlockComponent(LayoutBlock)

/**
 * A rectangle with a fill, an outline and rounded corners.
 */
export const Rectangle = makeBlockComponent(RectangleBlock)

/**
 * A circle, an ellipse, an arc or a pie slice.
 */
export const Circle = makeBlockComponent(CircleBlock)

/**
 * A text that is drawn onto the canvas.
 */
export const Text = makeBlockComponent(TextBlock)

/**
 * A straight or a curved line with editable control points.
 */
export const Line = makeBlockComponent(LineBlock)

/**
 * An image that is drawn onto the canvas.
 */
export const Image = makeBlockComponent(ImageBlock)

/**
 * A video that is drawn onto the canvas.
 */
export const Video = makeBlockComponent(VideoBlock)
