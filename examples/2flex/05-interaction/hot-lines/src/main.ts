/**
 * The hot lines.
 *
 * The hot lines are the outline that is drawn around a block while it is
 * selected. Their colour, their width and the handles on their corners are
 * options of the block.
 */
import { Canvas, RectangleBlock } from '@2flexible/2flex'

const initCanvas = new Canvas('canvas', 600, 400)

// a block with the default hot lines
const plain = new RectangleBlock({
    x: 30,
    y: 30,
    width: 160,
    height: 110,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    selectable: true,
})

// a block whose hot lines are drawn in another colour
const colored = new RectangleBlock({
    x: 230,
    y: 30,
    width: 160,
    height: 110,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    selectable: true,
    hotLineStrokeColor: '#ef4444',
    hotLineStrokeWidth: 3,
})

// a block whose handles are bigger and rounded
const handles = new RectangleBlock({
    x: 430,
    y: 30,
    width: 140,
    height: 110,
    backgroundColor: '#22c55e',
    borderRadius: 12,
    selectable: true,
    hotCornerSize: 16,
    hotCornerRadius: 8,
    hotCornerBackgroundColor: '#ffffff',
    hotCornerStrokeColor: '#22c55e',
    hotCornerStrokeWidth: 3,
})

// a block that draws its hot lines all the time
const always = new RectangleBlock({
    x: 30,
    y: 200,
    width: 160,
    height: 110,
    backgroundColor: '#a855f7',
    borderRadius: 12,
    hotLines: true,
})

initCanvas.add(plain, colored, handles, always)
