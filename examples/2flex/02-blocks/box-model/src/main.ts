/**
 * The box model of a block.
 *
 * The padding is the space between the border of a block and its children,
 * the margin is the space around it. Both of them accept the shorthand of
 * the CSS, so one, two, three or four values can be given.
 */
import { Canvas, LayoutBlock, RectangleBlock } from '@2flexible/2flex'

const initCanvas = new Canvas('canvas', 600, 400)

// a container that holds two blocks apart from each other
const container = new LayoutBlock({
    x: 20,
    y: 20,
    width: 260,
    height: 160,
    // four values: top, right, bottom, left
    padding: [16, 24, 16, 24],
    layout: 'flex',
    flexDirection: 'row',
    gap: 12,
})

const first = new RectangleBlock({
    width: 80,
    height: 60,
    backgroundColor: '#3b82f6',
})

const second = new RectangleBlock({
    width: 80,
    height: 60,
    backgroundColor: '#ef4444',
})

container.addChild(first)
container.addChild(second)

// the margin is the space around the block itself
const spaced = new RectangleBlock({
    x: 320,
    y: 20,
    width: 120,
    height: 80,
    backgroundColor: '#22c55e',
    // two values: vertical, horizontal
    margin: [20, 12],
})

initCanvas.add(container, spaced)
