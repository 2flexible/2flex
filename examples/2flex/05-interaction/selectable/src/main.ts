/**
 * The selecting of a block.
 *
 * A selectable block is selected by a click on it, and it is drawn on top of
 * the blocks that are below it. The selection is what makes the handles of
 * the resizing and of the rotating show up.
 */
import { Canvas, RectangleBlock } from '@2flexible/2flex'

const initCanvas = new Canvas('canvas', 600, 400)

// a block that is selected by a click
const selectable = new RectangleBlock({
    x: 40,
    y: 40,
    width: 180,
    height: 120,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    selectable: true,
})

// a block that is selected and can also be moved
const draggable = new RectangleBlock({
    x: 260,
    y: 40,
    width: 180,
    height: 120,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    selectable: true,
    draggable: true,
})

// a block that is selected and can also be resized and rotated
const full = new RectangleBlock({
    x: 40,
    y: 210,
    width: 180,
    height: 120,
    backgroundColor: '#22c55e',
    borderRadius: 12,
    selectable: true,
    resizable: true,
    rotatable: true,
    rotationCenter: 'self',
})

initCanvas.add(selectable, draggable, full)

// the selection is read with the running event of the block
setInterval(() => {
    console.log(
        'the block is selected:',
        selectable.__isRunningEventActive('selecting')
    )
}, 1000)
