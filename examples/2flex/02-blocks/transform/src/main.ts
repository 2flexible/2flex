/**
 * The transformation of a block.
 *
 * A block is rotated around a centre, mirrored on its axes and scaled. The
 * angle of the rotation is given in radians.
 */
import { Canvas, RectangleBlock, degreeToRadian } from '@2flexible/2flex'

const initCanvas = new Canvas('canvas', 600, 400)

// a block that is rotated around its own centre
const rotated = new RectangleBlock({
    x: 30,
    y: 40,
    width: 140,
    height: 90,
    backgroundColor: '#3b82f6',
    rotate: degreeToRadian(20),
    // the centre of the rotation is the centre of the block
    rotationCenter: 'self',
})

// a block that is mirrored on its vertical axis
const flipped = new RectangleBlock({
    x: 220,
    y: 40,
    width: 140,
    height: 90,
    backgroundColor: '#ef4444',
    horizontalFlip: true,
})

// a block that is scaled down to a half of its size
const scaled = new RectangleBlock({
    x: 30,
    y: 220,
    width: 140,
    height: 90,
    backgroundColor: '#22c55e',
    scale: 0.5,
})

initCanvas.add(rotated, flipped, scaled)

// the rotation is read and written like every other option
console.log(rotated.rotate())
rotated.rotate(degreeToRadian(45))
