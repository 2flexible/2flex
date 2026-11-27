/**
 * The units and the utilities.
 *
 * A size or a position can be a number of pixels or a relative value, for
 * example `50%`, `2rem` or `10vh`. The helpers of the library resolve the
 * relative values on their own, and they are exported for the code that needs
 * them outside of a block.
 */
import {
    Canvas,
    RectangleBlock,
    TextBlock,
    clamp,
    clampSize,
    colorToRgba,
    degreeToRadian,
    fromPercentage,
    fromRem,
    fromVH,
    fromVW,
    hexToRgba,
    hslToRgba,
    lerp,
    radianToDegree,
} from '@2flexible/2flex'

const initCanvas = new Canvas('canvas', 800, 600)

// a block whose size is a fraction of the canvas
const relative = new RectangleBlock({
    width: '50%',
    height: '25%',
    backgroundColor: '#3b82f6',
})

// a block whose position is given in the units of the root font size
const offset = new RectangleBlock({
    x: '2rem',
    y: '1rem',
    width: 120,
    height: 60,
    backgroundColor: '#ef4444',
})

initCanvas.add(relative, offset)

// the same units can be resolved by hand
console.log({
    half: fromPercentage(50, 800),
    fontSize: fromRem(2, 16),
    viewportWidth: fromVW(10, 1200),
    viewportHeight: fromVH(10, 900),
})

// the colors are resolved to rgba, so they can be compared and blended
console.log(hexToRgba('#3b82f6'))
console.log(hslToRgba('hsl(220, 83%, 60%)'))
console.log(colorToRgba('teal'))

// the angles are converted between degrees and radians
const radians = degreeToRadian(45)
console.log(radians, radianToDegree(radians))

// the numbers are clamped into a range, and interpolated between two ends
console.log(clamp(120, 0, 100))
console.log(clampSize(200))
console.log(lerp(0, 100, 0.25))

// a text block measures itself, so its size is not given
initCanvas.add(
    new TextBlock({
        x: 20,
        y: 320,
        text: 'The units are resolved against the parent',
        color: 'white',
        fontSize: 16,
    })
)
