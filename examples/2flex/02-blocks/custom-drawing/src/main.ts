/**
 * Drawing on the canvas.
 *
 * `ShapeBlock` gives the block the whole surface of the Canvas 2D API. The
 * callback of `draw` is called every time the block is painted, and it
 * receives the context of the canvas.
 */
import { Canvas, ShapeBlock } from '@2flexible/2flex'

const initCanvas = new Canvas('canvas', 600, 400)

// a shape that draws a triangle
const triangle = new ShapeBlock({
    x: 30,
    y: 30,
    width: 160,
    height: 140,
})

triangle.draw((context) => {
    context.beginPath()
    context.moveTo(0, 140)
    context.lineTo(80, 0)
    context.lineTo(160, 140)
    context.closePath()
    context.fillStyle = '#3b82f6'
    context.fill()
})

// a shape that draws a gradient
const gradient = new ShapeBlock({
    x: 230,
    y: 30,
    width: 160,
    height: 140,
})

gradient.draw((context) => {
    const fill = context.createLinearGradient(0, 0, 160, 140)
    fill.addColorStop(0, '#22c55e')
    fill.addColorStop(1, '#3b82f6')
    context.fillStyle = fill
    context.fillRect(0, 0, 160, 140)
})

// a shape that draws a stroked path
const stroke = new ShapeBlock({
    x: 30,
    y: 210,
    width: 160,
    height: 140,
})

stroke.draw((context) => {
    context.beginPath()
    context.moveTo(10, 130)
    context.bezierCurveTo(50, 10, 110, 10, 150, 130)
    context.strokeStyle = '#ef4444'
    context.lineWidth = 4
    context.lineCap = 'round'
    context.stroke()
})

initCanvas.add(triangle, gradient, stroke)

// the path of a shape can also be described with the options of the block
const path = new ShapeBlock({
    x: 230,
    y: 210,
    width: 160,
    height: 140,
    moveTo: { x: 0, y: 0 },
    lineTo: { x: 160, y: 140 },
    stroke: { stroke: true },
    strokeStyle: '#a855f7',
    lineWidth: 4,
})

initCanvas.add(path)
