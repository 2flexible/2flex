/**
 * The size of a block.
 *
 * A block takes the size it is given, and it is limited by the minimum and
 * the maximum it is allowed to have. A block without a size takes the size of
 * its children.
 */
import { Canvas, RectangleBlock } from '@2flexible/2flex'

const initCanvas = new Canvas('canvas', 600, 400)

// a block with a fixed size
const fixed = new RectangleBlock({
    x: 20,
    y: 20,
    width: 160,
    height: 100,
    backgroundColor: '#3b82f6',
})

// a block that never grows past its limits
const limited = new RectangleBlock({
    x: 220,
    y: 20,
    width: 160,
    height: 100,
    minWidth: 80,
    minHeight: 40,
    maxWidth: 220,
    maxHeight: 140,
    backgroundColor: '#ef4444',
})

// a block that takes its size from the canvas
const relative = new RectangleBlock({
    x: 20,
    y: 160,
    width: '45%',
    height: '30%',
    backgroundColor: '#22c55e',
})

initCanvas.add(fixed, limited, relative)

// the size of a block is written like every other option
fixed.width(200)
console.log(fixed.realWidth, fixed.realHeight)
