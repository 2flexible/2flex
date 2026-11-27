/**
 * The history and the saving of the scene.
 *
 * The actions of the canvas are kept in its history, so they can be undone
 * and redone. The whole scene can also be written to a string and read back
 * later.
 */
import { Canvas, RectangleBlock } from '@2flexible/2flex'

const initCanvas = new Canvas('canvas', 600, 400, {
    // the actions of the canvas are kept
    history: true,
    // the history holds the last hundred actions
    historySize: 100,
})

const block = new RectangleBlock({
    x: 40,
    y: 40,
    width: 120,
    height: 90,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
})

initCanvas.add(block)

// the last action is undone, and it is applied again
setTimeout(() => {
    block.x(200)
    console.log('the block was moved')
}, 1000)

setTimeout(() => {
    initCanvas.undo()
    console.log('the action was undone')
}, 2000)

setTimeout(() => {
    initCanvas.redo()
    console.log('the action was applied again')
}, 3000)

// the scene is written to a string
setTimeout(() => {
    const saved = initCanvas.export()
    console.log('the scene was saved,', saved.length, 'characters')
}, 4000)

// and it is read back, which replaces the scene of the canvas
setTimeout(() => {
    const saved = initCanvas.export()
    initCanvas.load(saved)
    console.log('the scene was loaded again')
}, 5000)
