/**
 * The image.
 *
 * An image is drawn onto the canvas. The source is a url, an image element or
 * a factory that returns one. The fit of the image in the block is decided
 * by `objectFit`, and the image can be clipped or tiled.
 */
import { Canvas, ImageBlock } from '@2flexible/2flex'

const initCanvas = new Canvas('canvas', 600, 400)

// an image that fills the block
const filled = new ImageBlock({
    x: 20,
    y: 20,
    width: 180,
    height: 140,
    source: 'https://picsum.photos/id/1015/360/280',
    objectFit: 'fill',
})

// an image that keeps its proportions and is cut at the edge of the block
const covered = new ImageBlock({
    x: 220,
    y: 20,
    width: 180,
    height: 140,
    source: 'https://picsum.photos/id/1016/360/280',
    objectFit: 'cover',
})

// an image that keeps its proportions and fits in the block
const contained = new ImageBlock({
    x: 420,
    y: 20,
    width: 160,
    height: 140,
    source: 'https://picsum.photos/id/1018/360/280',
    objectFit: 'contain',
})

// an image that is cut to a part of itself
const clipped = new ImageBlock({
    x: 20,
    y: 190,
    width: 180,
    height: 140,
    source: 'https://picsum.photos/id/1024/360/280',
    objectFit: 'cover',
    clipX: 20,
    clipY: 20,
    clipWidth: 120,
    clipHeight: 90,
})

// an image that is tiled across the block
const tiled = new ImageBlock({
    x: 220,
    y: 190,
    width: 180,
    height: 140,
    source: 'https://picsum.photos/id/1039/120/120',
    objectFit: 'cover',
    repeatX: 3,
    repeatY: 2,
})

initCanvas.add(filled, covered, contained, clipped, tiled)
