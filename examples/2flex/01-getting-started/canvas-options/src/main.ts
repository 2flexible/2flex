/**
 * The options of the canvas.
 *
 * The options configure the viewport, the input and the history. The style
 * properties of the element are set with the same object, so the canvas and
 * its element are configured in one place.
 */
import { Canvas, RectangleBlock } from '@2flexible/2flex'

const initCanvas = new Canvas('canvas', 800, 600, {
    // the zoom is multiplied by this factor on every step of the wheel
    zoomSpeed: 1.2,
    // and by this one while zooming out
    zoomInvSpeed: 0.8,
    // the zoom is centred on the canvas, or on the pointer
    zoomType: 'center',
    // the number of pixels the viewport moves on every step of the wheel
    moveSpeed: 100,
    // the canvas can be moved with the arrow keys
    keyboardMovement: true,
    // and by dragging its background, while the space key is pressed
    mouseMovement: true,
    // the actions of the canvas are stored in its history
    history: true,
    // the history keeps the last hundred actions
    historySize: 100,
    // the viewport starts at the top left corner, in the zoom of one
    positionX: 0,
    positionY: 0,
    positionZ: 1,
    // the canvas draws sixty frames in a second
    fps: 60,
    // the canvas is divided into tiles of 256 pixels
    tileSize: 256,
    // the style properties are applied to the element
    backgroundColor: '#111827',
    cursor: 'default',
})

initCanvas.add(
    new RectangleBlock({
        width: 200,
        height: 120,
        backgroundColor: '#3b82f6',
    })
)
