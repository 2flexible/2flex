/**
 * The line.
 *
 * A line is drawn between the points of the block. Every point holds the
 * place of an end of the line, and the control points of a point bend the
 * line into a curve.
 */
import { Canvas, LineBlock } from '@2flexible/2flex'

const initCanvas = new Canvas('canvas', 600, 400)

// a straight line, the points are given in the coordinates of the block
const straight = new LineBlock({
    x: 30,
    y: 40,
    width: 220,
    height: 40,
    lineColor: '#3b82f6',
    lineWidth: 4,
    // the path of a line is filled as well, so an open line is filled with a
    // transparent colour
    fillColor: 'transparent',
})

straight.addControlPointToHead({
    startX: 0,
    startY: 0,
    endX: 220,
    endY: 0,
})

// a curve, the control points of the first point bend the line
const curved = new LineBlock({
    x: 30,
    y: 130,
    width: 240,
    height: 140,
    lineColor: '#ef4444',
    lineWidth: 4,
    fillColor: 'transparent',
})

curved.addControlPointToHead({
    startX: 0,
    startY: 120,
    endX: 240,
    endY: 120,
    startControlX: 70,
    startControlY: 0,
    endControlX: 170,
    endControlY: 0,
})

// a line whose points can be dragged, a double click starts the editing
const editable = new LineBlock({
    x: 320,
    y: 60,
    width: 220,
    height: 200,
    lineColor: '#22c55e',
    lineWidth: 4,
    fillColor: 'transparent',
    editable: true,
    controlPointsSize: 8,
    controlPointBackgroundColor: '#ffffff',
    controlPointStrokeColor: '#22c55e',
})

editable.addControlPointToHead({
    startX: 0,
    startY: 180,
    endX: 220,
    endY: 180,
    startControlX: 60,
    startControlY: 20,
    endControlX: 160,
    endControlY: 30,
    startDraggable: true,
    endDraggable: true,
    startControllable: true,
    endControllable: true,
})

// a closed line, the path is drawn back to its start and it is filled
const closed = new LineBlock({
    x: 320,
    y: 280,
    width: 220,
    height: 80,
    lineColor: '#eab308',
    lineWidth: 4,
    fillColor: 'rgba(234, 179, 8, 0.35)',
    closeLine: true,
})

closed.addControlPointToHead({
    startX: 0,
    startY: 70,
    endX: 220,
    endY: 70,
    startControlX: 60,
    startControlY: 0,
    endControlX: 160,
    endControlY: 0,
})

initCanvas.add(straight, curved, editable, closed)
