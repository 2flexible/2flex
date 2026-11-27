/**
 * The rectangle.
 *
 * A rectangle is filled with `backgroundColor` and outlined with `border`.
 * The radius of the corners is set with `borderRadius`, and every side can
 * have its own outline.
 */
import { Canvas, RectangleBlock } from '@2flexible/2flex'

const initCanvas = new Canvas('canvas', 600, 400)

// a filled rectangle
const filled = new RectangleBlock({
    x: 20,
    y: 20,
    width: 140,
    height: 100,
    backgroundColor: '#3b82f6',
})

// a rectangle with rounded corners, the radius is the same on every corner
const rounded = new RectangleBlock({
    x: 180,
    y: 20,
    width: 140,
    height: 100,
    backgroundColor: '#ef4444',
    borderRadius: 24,
})

// a rectangle whose corners have their own radius, the order is
// top-left, top-right, bottom-right, bottom-left
const corners = new RectangleBlock({
    x: 340,
    y: 20,
    width: 140,
    height: 100,
    backgroundColor: '#22c55e',
    borderRadius: [40, 4, 40, 4],
})

// a rectangle with an outline
const outlined = new RectangleBlock({
    x: 20,
    y: 150,
    width: 140,
    height: 100,
    // the border is a width, a style and a colour
    border: [3, 'solid', '#e5e7eb'],
    borderRadius: 12,
})

// a rectangle whose top edge has its own outline
const topBorder = new RectangleBlock({
    x: 180,
    y: 150,
    width: 140,
    height: 100,
    borderTop: [6, 'solid', '#eab308'],
    borderRadius: 12,
})

// a rectangle with a dotted outline
const dotted = new RectangleBlock({
    x: 340,
    y: 150,
    width: 140,
    height: 100,
    borderWidth: 3,
    borderStyle: 'dotted',
    borderColor: '#94a3b8',
    borderRadius: 12,
})

initCanvas.add(filled, rounded, corners, outlined, topBorder, dotted)
