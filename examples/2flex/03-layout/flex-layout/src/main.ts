/**
 * The flex layout.
 *
 * A `LayoutBlock` places its children with a subset of Flexbox. The direction
 * is the axis the children are placed on, and the alignment decides where
 * they sit on the other axis.
 */
import { Canvas, LayoutBlock, RectangleBlock } from '@2flexible/2flex'

const initCanvas = new Canvas('canvas', 600, 400)

// a row of three blocks
const row = new LayoutBlock({
    x: 20,
    y: 20,
    width: 300,
    height: 90,
    layout: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
})

const first = new RectangleBlock({
    width: 70,
    height: 50,
    backgroundColor: '#3b82f6',
})

const second = new RectangleBlock({
    width: 70,
    height: 70,
    backgroundColor: '#ef4444',
})

const third = new RectangleBlock({
    width: 70,
    height: 40,
    backgroundColor: '#22c55e',
})

row.addChild(first)
row.addChild(second)
row.addChild(third)

// a column of two blocks
const column = new LayoutBlock({
    x: 360,
    y: 20,
    width: 160,
    height: 120,
    layout: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 12,
})

const top = new RectangleBlock({
    width: 120,
    height: 30,
    backgroundColor: '#a855f7',
})

const bottom = new RectangleBlock({
    width: 120,
    height: 30,
    backgroundColor: '#eab308',
})

column.addChild(top)
column.addChild(bottom)

// a row that wraps into two lines
const wrapped = new LayoutBlock({
    x: 20,
    y: 160,
    width: 220,
    height: 120,
    layout: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
})

for (let i = 0; i < 5; i++) {
    wrapped.addChild(
        new RectangleBlock({
            width: 60,
            height: 40,
            backgroundColor: '#0ea5e9',
        })
    )
}

// a child that grows to fill the space that is left
const growing = new LayoutBlock({
    x: 20,
    y: 310,
    width: 300,
    height: 60,
    layout: 'flex',
    flexDirection: 'row',
    gap: 8,
})

growing.addChild(
    new RectangleBlock({
        width: 60,
        height: 40,
        backgroundColor: '#64748b',
        flexShrink: 0,
    })
)

growing.addChild(
    new RectangleBlock({
        width: 60,
        height: 40,
        backgroundColor: '#14b8a6',
        flexGrow: 1,
    })
)

initCanvas.add(row, column, wrapped, growing)
