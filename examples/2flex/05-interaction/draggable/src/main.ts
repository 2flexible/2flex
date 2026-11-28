/**
 * The dragging of a block.
 *
 * A draggable block follows the pointer. The drag is told apart from a click
 * by the movement of the pointer, and the action is kept in the history.
 */
import { Canvas, RectangleBlock } from '@2flexible/2flex'

const initCanvas = new Canvas('canvas', 600, 400)

// a block that is moved with the pointer
const free = new RectangleBlock({
    x: 40,
    y: 40,
    width: 120,
    height: 90,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    draggable: true,
    onDraggable: (event) => {
        console.log('dragging at', event.clientX, event.clientY)
    },
})

// a block that is moved on the horizontal axis only
const horizontal = new RectangleBlock({
    x: 220,
    y: 40,
    width: 120,
    height: 90,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    draggable: true,
    draggableY: false,
})

// a block that is moved on the vertical axis only
const vertical = new RectangleBlock({
    x: 400,
    y: 40,
    width: 120,
    height: 90,
    backgroundColor: '#22c55e',
    borderRadius: 12,
    draggable: true,
    draggableX: false,
})

initCanvas.add(free, horizontal, vertical)

// the position of a block is written like every other option
free.x(60)
free.y(200)
