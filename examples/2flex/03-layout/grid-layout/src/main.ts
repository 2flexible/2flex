/**
 * The grid layout.
 *
 * A `LayoutBlock` places its children in a grid. The columns and the rows
 * are described by the template, and the children are placed in the order
 * they are added to the block.
 */
import {
    Canvas,
    LayoutBlock,
    RectangleBlock,
    TextBlock,
} from '@2flexible/2flex'

const initCanvas = new Canvas('canvas', 600, 400)

// a grid of two columns
const grid = new LayoutBlock({
    x: 20,
    y: 20,
    width: 320,
    height: 200,
    layout: 'grid',
    gridTemplateColumns: [1, 1],
    gridAutoRows: [80],
    gap: 10,
})

const cellOne = new RectangleBlock({
    backgroundColor: '#3b82f6',
    borderRadius: 8,
})

const cellTwo = new RectangleBlock({
    backgroundColor: '#ef4444',
    borderRadius: 8,
})

const cellThree = new RectangleBlock({
    backgroundColor: '#22c55e',
    borderRadius: 8,
})

const cellFour = new RectangleBlock({
    backgroundColor: '#a855f7',
    borderRadius: 8,
})

grid.addChild(cellOne)
grid.addChild(cellTwo)
grid.addChild(cellThree)
grid.addChild(cellFour)

// a grid of three columns with rows of a fixed height
const wide = new LayoutBlock({
    x: 370,
    y: 20,
    width: 200,
    height: 200,
    layout: 'grid',
    gridTemplateColumns: [1, 1, 1],
    gridTemplateRows: [60, 60, 60],
    gap: 8,
})

for (const color of [
    '#0ea5e9',
    '#14b8a6',
    '#eab308',
    '#f97316',
    '#ec4899',
    '#f43f5e',
]) {
    wide.addChild(
        new RectangleBlock({
            backgroundColor: color,
            borderRadius: 6,
        })
    )
}

// a caption under the grids
const caption = new TextBlock({
    x: 20,
    y: 250,
    text: 'A grid of two columns, and a grid of three columns.',
    color: '#9ca3af',
    fontSize: 14,
})

initCanvas.add(grid, wide, caption)
