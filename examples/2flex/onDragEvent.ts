import { Canvas, RectangleBlock } from '@2flexible/2flex'

function onDragCallback() {
    console.log('Dragging...')
}
const initCanvas = new Canvas('canvas', 600, 300)

const dragRectangel = new RectangleBlock({
    width: 60,
    height: 60,
    backgroundColor: 'blue',
    onDrag: onDragCallback,
})

initCanvas.add(dragRectangel)
