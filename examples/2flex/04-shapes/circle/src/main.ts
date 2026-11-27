/**
 * The circle.
 *
 * A circle is filled with `backgroundColor`. The angles cut it into an arc or
 * a pie slice, and the inner radius turns it into a ring.
 */
import { Canvas, CircleBlock } from '@2flexible/2flex'

const initCanvas = new Canvas('canvas', 600, 400)

// a whole circle
const full = new CircleBlock({
    x: 20,
    y: 20,
    width: 120,
    height: 120,
    backgroundColor: '#3b82f6',
})

// an ellipse, the width and the height are different
const ellipse = new CircleBlock({
    x: 160,
    y: 20,
    width: 160,
    height: 100,
    backgroundColor: '#ef4444',
})

// a half circle, the angles are given in radians
const half = new CircleBlock({
    x: 340,
    y: 20,
    width: 120,
    height: 120,
    backgroundColor: '#22c55e',
    startAngle: 0,
    endAngle: Math.PI,
})

// a pie slice, the inner radius cuts the middle out
const slice = new CircleBlock({
    x: 20,
    y: 170,
    width: 120,
    height: 120,
    backgroundColor: '#a855f7',
    startAngle: 0,
    endAngle: Math.PI * 0.75,
    innerRadius: 40,
})

// a ring, the inner radius is the size of the hole
const ring = new CircleBlock({
    x: 160,
    y: 170,
    width: 120,
    height: 120,
    backgroundColor: '#eab308',
    innerRadius: 40,
})

// a circle with an outline
const outlined = new CircleBlock({
    x: 340,
    y: 170,
    width: 120,
    height: 120,
    border: [4, 'solid', '#e5e7eb'],
    borderColor: '#e5e7eb',
    borderWidth: 4,
})

initCanvas.add(full, ellipse, half, slice, ring, outlined)
