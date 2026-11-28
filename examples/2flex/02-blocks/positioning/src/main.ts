/**
 * The positioning of a block.
 *
 * A block is placed with `x` and `y`, or with the edges of its parent. The
 * value of `position` decides how the edges are read.
 */
import { Canvas, RectangleBlock } from '@2flexible/2flex'

const initCanvas = new Canvas('canvas', 600, 400)

// `relative` is the default, the block is placed by its offset
const relative = new RectangleBlock({
    x: 20,
    y: 20,
    width: 100,
    height: 60,
    backgroundColor: '#3b82f6',
})

// `absolute` takes the block out of the layout of its parent, the edges are
// read against the canvas
const absolute = new RectangleBlock({
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 100,
    height: 60,
    backgroundColor: '#ef4444',
})

// `fixed` keeps the block in the same place of the viewport, while the
// viewport is moved or zoomed
const fixed = new RectangleBlock({
    position: 'fixed',
    top: 20,
    left: 20,
    width: 100,
    height: 60,
    backgroundColor: '#22c55e',
})

initCanvas.add(relative, absolute, fixed)
