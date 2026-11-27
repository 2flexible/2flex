/**
 * The overflow of a block.
 *
 * A block hides the children that do not fit in it, and it can show a scroll
 * bar for them. The children are laid out as usual, they are only cut at
 * the border of the block.
 */
import { Canvas, LayoutBlock, RectangleBlock } from '@2flexible/2flex'

const initCanvas = new Canvas('canvas', 600, 400)

// a block that hides the children that do not fit in it
const hidden = new LayoutBlock({
    x: 20,
    y: 20,
    width: 200,
    height: 120,
    overflow: 'hidden',
    layout: 'flex',
    flexDirection: 'row',
    gap: 8,
    padding: 8,
})

for (const color of ['#3b82f6', '#ef4444', '#22c55e', '#eab308']) {
    hidden.addChild(
        new RectangleBlock({
            width: 80,
            height: 60,
            backgroundColor: color,
            borderRadius: 8,
            flexShrink: 0,
        })
    )
}

// a block that shows a scroll bar for the children that do not fit in it
const scrollable = new LayoutBlock({
    x: 250,
    y: 20,
    width: 200,
    height: 120,
    overflow: 'scroll',
    layout: 'flex',
    flexDirection: 'row',
    gap: 8,
    padding: 8,
})

for (const color of ['#3b82f6', '#ef4444', '#22c55e', '#eab308']) {
    scrollable.addChild(
        new RectangleBlock({
            width: 80,
            height: 60,
            backgroundColor: color,
            borderRadius: 8,
            flexShrink: 0,
        })
    )
}

// a block that scrolls on the vertical axis only
const column = new LayoutBlock({
    x: 480,
    y: 20,
    width: 100,
    height: 120,
    overflowY: 'auto',
    overflowX: 'hidden',
    layout: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: 8,
})

for (const color of ['#3b82f6', '#ef4444', '#22c55e']) {
    column.addChild(
        new RectangleBlock({
            width: 60,
            height: 40,
            backgroundColor: color,
            borderRadius: 8,
            flexShrink: 0,
        })
    )
}

initCanvas.add(hidden, scrollable, column)
