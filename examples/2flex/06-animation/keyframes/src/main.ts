/**
 * The keyframes of an animation.
 *
 * A block animates its own options. The reserved keys configure the
 * animation, and every other key is an option of the block with a list of
 * the breakpoints it takes.
 */
import { Canvas, RectangleBlock, degreeToRadian } from '@2flexible/2flex'

const initCanvas = new Canvas('canvas', 600, 400)

// a block that moves from the left to the right and back
const moving = new RectangleBlock({
    x: 40,
    y: 40,
    width: 80,
    height: 80,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
})

moving.animate({
    // the reserved keys configure the animation
    duration: 2000,
    easing: 'ease-in-out',
    iterations: Infinity,
    // the other keys are the options of the block
    x: [40, 400, 40],
})

// a block that changes its colour and its size
const growing = new RectangleBlock({
    x: 40,
    y: 180,
    width: 80,
    height: 80,
    backgroundColor: '#ef4444',
    borderRadius: 12,
})

growing.animate({
    duration: 1500,
    easing: 'ease-out',
    iterations: 3,
    direction: 'alternate',
    width: [80, 160],
    height: [80, 160],
    backgroundColor: ['#ef4444', '#22c55e'],
})

// a block that turns around its own centre
const spinning = new RectangleBlock({
    x: 260,
    y: 180,
    width: 90,
    height: 90,
    backgroundColor: '#22c55e',
    borderRadius: 12,
    rotationCenter: 'self',
})

spinning.animate({
    duration: 2500,
    easing: 'linear',
    iterations: Infinity,
    rotate: [0, degreeToRadian(360)],
})

initCanvas.add(moving, growing, spinning)
