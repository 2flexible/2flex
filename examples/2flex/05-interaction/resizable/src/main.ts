/**
 * The resizing of a block.
 *
 * A resizable block shows the handles of its edges and of its corners. The
 * handles can be turned on and off one by one, and the size of the block is
 * limited by its minimum and its maximum.
 */
import { Canvas, RectangleBlock } from '@2flexible/2flex'

const initCanvas = new Canvas('canvas', 600, 400)

// a block that is resized by its handles
const full = new RectangleBlock({
    x: 30,
    y: 30,
    width: 180,
    height: 130,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    resizable: true,
    onResizable: (event) => {
        console.log('resizing at', event.clientX, event.clientY)
    },
})

// a block that is only resized by its corners
const cornersOnly = new RectangleBlock({
    x: 260,
    y: 30,
    width: 180,
    height: 130,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    resizable: true,
    resizableTop: false,
    resizableBottom: false,
    resizableLeft: false,
    resizableRight: false,
})

// a block that stays between its limits
const limited = new RectangleBlock({
    x: 30,
    y: 210,
    width: 180,
    height: 130,
    backgroundColor: '#22c55e',
    borderRadius: 12,
    resizable: true,
    minWidth: 100,
    minHeight: 80,
    maxWidth: 240,
    maxHeight: 180,
})

// a block whose handles are bigger and drawn in another colour
const custom = new RectangleBlock({
    x: 260,
    y: 210,
    width: 180,
    height: 130,
    backgroundColor: '#a855f7',
    borderRadius: 12,
    resizable: true,
    hotCornerSize: 14,
    hotCornerBackgroundColor: '#ffffff',
    hotCornerStrokeColor: '#a855f7',
    hotCornerStrokeWidth: 2,
})

initCanvas.add(full, cornersOnly, limited, custom)
