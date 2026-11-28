/**
 * The query of the scene.
 *
 * The blocks of the scene are found by their options. The name of a block
 * is the easiest one to search with, and the id of a node finds one block.
 */
import { Canvas, RectangleBlock } from '@2flexible/2flex'

const initCanvas = new Canvas('canvas', 600, 400)

const header = new RectangleBlock({
    name: 'header',
    x: 40,
    y: 40,
    width: 200,
    height: 80,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
})

const card = new RectangleBlock({
    name: 'card',
    x: 40,
    y: 150,
    width: 200,
    height: 80,
    backgroundColor: '#ef4444',
    borderRadius: 12,
})

const other = new RectangleBlock({
    name: 'other',
    x: 280,
    y: 150,
    width: 200,
    height: 80,
    backgroundColor: '#22c55e',
    borderRadius: 12,
})

initCanvas.add(header, card, other)

// a block is found by its name
const found = initCanvas.find({ name: 'card' })
console.log('the block named card was found', found.length === 1)

// every block of the same size is found as well
const sameSize = initCanvas.find({ width: 200 })
console.log('the blocks of two hundred pixels wide are', sameSize.length)

// the blocks are found by the id of their node
const first = initCanvas.find({ nodeId: header.nodeId })
console.log('the block of the node is the header', first[0] === header)

// the name of a block is the option that is used to find it
console.log(card.name(), other.name())
