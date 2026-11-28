/**
 * The nesting of the blocks.
 *
 * A block can hold other blocks. The children are laid out by their parent,
 * and they are removed with it when it leaves the scene.
 */
import {
    Canvas,
    LayoutBlock,
    RectangleBlock,
    TextBlock,
} from '@2flexible/2flex'

const initCanvas = new Canvas('canvas', 600, 400)

// the parent places its children in a row
const panel = new RectangleBlock({
    x: 20,
    y: 20,
    width: 300,
    height: 200,
    backgroundColor: '#1f2937',
    borderRadius: 16,
})

// the layout of the children is held by a block without a shape
const row = new LayoutBlock({
    padding: 16,
    layout: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
})

// the first child
const left = new RectangleBlock({
    width: 90,
    height: 90,
    backgroundColor: '#3b82f6',
    borderRadius: 16,
})

// the second child holds a block of its own
const right = new RectangleBlock({
    width: 130,
    height: 110,
    backgroundColor: '#374151',
    borderRadius: 12,
})

const label = new TextBlock({
    text: 'Nested',
    color: 'white',
    fontSize: 18,
})

const badge = new RectangleBlock({
    width: 40,
    height: 40,
    backgroundColor: '#22c55e',
    borderRadius: 20,
})

// the label and the badge are placed in a column
const column = new LayoutBlock({
    padding: 12,
    layout: 'flex',
    flexDirection: 'column',
    gap: 8,
})

column.addChild(label)
column.addChild(badge)

right.addChild(column)
row.addChild(left)
row.addChild(right)
panel.addChild(row)

initCanvas.add(panel)

// the children are found by walking the tree of the parent
panel.listAllChilds((child) => {
    console.log(child.name() ?? child.constructor.name)
})
