/**
 * The first scene.
 *
 * A canvas is bound to a `canvas` element of the page, and the blocks are
 * added to it. The blocks are laid out and drawn on the next frame.
 */
import { Canvas, RectangleBlock } from '@2flexible/2flex'

const initCanvas = new Canvas('canvas', 600, 400)

const block = new RectangleBlock({
    x: 0,
    y: 0,
    width: 40,
    height: 40,
    backgroundColor: 'red',
})

initCanvas.add(block)
