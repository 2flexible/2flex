/**
 * The viewport of the canvas.
 *
 * The viewport is the part of the scene that is seen. It is moved by the
 * wheel and the arrow keys, and it is zoomed with the wheel while the
 * control key is held down.
 */
import { Canvas, RectangleBlock } from '@2flexible/2flex'

const initCanvas = new Canvas('canvas', 600, 400, {
    // the viewport is zoomed on the pointer
    zoomType: 'point',
    // the viewport moves a hundred pixels on every step
    moveSpeed: 100,
    keyboardMovement: true,
    mouseMovement: true,
})

// a row of blocks that shows that the scene is larger than the canvas
for (let i = 0; i < 12; i++) {
    initCanvas.add(
        new RectangleBlock({
            x: i * 140,
            y: 40,
            width: 100,
            height: 100,
            backgroundColor: i % 2 === 0 ? '#3b82f6' : '#ef4444',
            borderRadius: 12,
        })
    )
}

// the place of the viewport is read and written
console.log(initCanvas.currentPosition)
initCanvas.view.tx = 100
initCanvas.view.ty = 60

// the zoom of the viewport is read from the scale of the view
console.log('the zoom is', initCanvas.view.scale)

// the cursor of the canvas is changed
initCanvas.changeCursor('grab')
setTimeout(() => {
    initCanvas.resetCursor()
}, 2000)
