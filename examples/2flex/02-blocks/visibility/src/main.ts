/**
 * The visibility and the order of the blocks.
 *
 * A hidden block is not drawn, and its children are not drawn either. The
 * `zIndex` decides which block is drawn on top of the others, and the
 * `order` decides the order of the blocks in their parent.
 */
import { Canvas, RectangleBlock } from '@2flexible/2flex'

const initCanvas = new Canvas('canvas', 600, 400)

// a block that is in the scene, but that is not drawn
const hidden = new RectangleBlock({
    x: 20,
    y: 20,
    width: 120,
    height: 80,
    backgroundColor: '#6b7280',
    hidden: true,
})

// two blocks that overlap, the one with the higher z index is drawn on top
const below = new RectangleBlock({
    x: 140,
    y: 40,
    width: 160,
    height: 120,
    backgroundColor: '#3b82f6',
    zIndex: 1,
})

const above = new RectangleBlock({
    x: 200,
    y: 80,
    width: 160,
    height: 120,
    backgroundColor: '#ef4444',
    zIndex: 2,
})

initCanvas.add(hidden, below, above)

// a hidden block is shown again
setTimeout(() => {
    hidden.hidden(false)
}, 1500)

// a block is taken out of the scene with `remove`
setTimeout(() => {
    initCanvas.remove(above)
}, 3000)
