/**
 * The rotating of a block.
 *
 * A rotatable block shows the handles of its corners. The rotation happens
 * around the centre of the block, and the corners can be turned on and off
 * one by one.
 */
import { Canvas, RectangleBlock, degreeToRadian } from '@2flexible/2flex'

const initCanvas = new Canvas('canvas', 600, 400)

// a block that is rotated around its own centre
const free = new RectangleBlock({
    x: 40,
    y: 40,
    width: 140,
    height: 100,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    rotatable: true,
    rotationCenter: 'self',
    onRotatable: (event) => {
        console.log('rotating at', event.clientX, event.clientY)
    },
})

// a block that is rotated by the corner at the top left only
const oneCorner = new RectangleBlock({
    x: 240,
    y: 40,
    width: 140,
    height: 100,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    rotatable: true,
    rotatableTopRight: false,
    rotatableBottomLeft: false,
    rotatableBottomRight: false,
})

// a block that is already rotated
const rotated = new RectangleBlock({
    x: 420,
    y: 40,
    width: 140,
    height: 100,
    backgroundColor: '#22c55e',
    borderRadius: 12,
    rotatable: true,
    rotate: degreeToRadian(15),
    rotationCenter: 'self',
})

// a block whose handles are bigger
const custom = new RectangleBlock({
    x: 40,
    y: 220,
    width: 140,
    height: 100,
    backgroundColor: '#eab308',
    borderRadius: 12,
    rotatable: true,
    hotRotatableAreaSize: 24,
})

initCanvas.add(free, oneCorner, rotated, custom)

// the angle of the rotation is written like every other option
rotated.rotate(degreeToRadian(30))
