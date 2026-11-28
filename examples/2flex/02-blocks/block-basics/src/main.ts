/**
 * The basics of a block.
 *
 * Every option of a block is a pair of a getter and a setter. Calling it
 * without a value reads the option, calling it with a value writes it. The
 * method `set` writes a group of options at once, and it keeps the history.
 */
import { Canvas, RectangleBlock } from '@2flexible/2flex'

const initCanvas = new Canvas('canvas', 600, 400)

const block = new RectangleBlock({
    width: 120,
    height: 80,
    backgroundColor: '#3b82f6',
})

initCanvas.add(block)

// an option is read by calling it
console.log(block.width(), block.backgroundColor())

// and written by calling it with a value
block.width(200)
block.backgroundColor('#ef4444')

// `set` writes a group of options at once
block.set({
    x: 40,
    y: 40,
    borderRadius: 12,
})

// the name of a block is used to find it in the scene
block.name('my-block')

// the position and the size are known in pixels
console.log(block.x(), block.y(), block.realWidth, block.realHeight)
