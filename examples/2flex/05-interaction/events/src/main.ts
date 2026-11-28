/**
 * The events of a block.
 *
 * A block handles the events of the pointer and of the keyboard. A handler
 * is only called when the event lands on the drawn shape of the block, and
 * only the topmost block of the stacking order receives it.
 */
import { Canvas, RectangleBlock, TextBlock } from '@2flexible/2flex'

const initCanvas = new Canvas('canvas', 600, 400)

const block = new RectangleBlock({
    x: 40,
    y: 40,
    width: 180,
    height: 120,
    backgroundColor: '#3b82f6',
    borderRadius: 16,
})

const label = new TextBlock({
    x: 40,
    y: 180,
    text: 'Click, double click, hover and press a key.',
    color: '#9ca3af',
    fontSize: 14,
})

initCanvas.add(block, label)

// the pointer is pressed over the block
block.mousedown((event) => {
    console.log('mousedown', event.clientX, event.clientY)
})

// the pointer is released over the block
block.mouseup(() => {
    console.log('mouseup')
})

// the pointer is moved over the block
block.mousemove((event) => {
    console.log('mousemove', event.clientX, event.clientY)
})

// the pointer enters the block, it fires once
block.mouseenter(() => {
    console.log('the pointer entered the block')
    block.backgroundColor('#22c55e')
})

// the pointer leaves the block, it fires once
block.mouseleave(() => {
    console.log('the pointer left the block')
    block.backgroundColor('#3b82f6')
})

// the block is clicked
block.click(() => {
    console.log('clicked')
})

// the block is clicked twice in a row
block.dblclick(() => {
    console.log('double clicked')
})

// the right button of the pointer is pressed over the block
block.contextMenu((event) => {
    event.preventDefault()
    console.log('the context menu is open')
})

// the wheel is turned over the block
block.wheel((event) => {
    event.preventDefault()
    console.log('the wheel was turned', event.deltaY)
})

// a key is pressed while the block has the focus
block.keydown((event) => {
    console.log('the key', event.key, 'was pressed')
})

// a key is released while the block has the focus
block.keyup((event) => {
    console.log('the key', event.key, 'was released')
})

// the position of the pointer is known in the coordinates of the canvas
block.click((event) => {
    const position = initCanvas.getCursorPosition(event)
    console.log('the block was clicked at', position)
})
