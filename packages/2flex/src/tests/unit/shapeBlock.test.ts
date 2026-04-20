import { describe, it, expect, beforeEach } from 'vitest'
import { ShapeBlock, Canvas } from '@2flexible/2flex'
import { getPrototype } from '../../Utils'

let block: ShapeBlock

const shapeOptions = {
    fill: { value: { fill: true }, default: undefined },
    fillStyle: { value: 'rgba(34, 197, 94, 1)', default: undefined },
    stroke: { value: { stroke: true }, default: undefined },
    strokeStyle: { value: 'rgba(22, 101, 52, 1)', default: undefined },
    lineTo: { value: { x: 10, y: 20 }, default: undefined },
    lineWidth: { value: 4, default: undefined },
    lineDash: { value: [4, 2], default: undefined },
    lineCap: { value: 'round', default: undefined },
    lineDashOffset: { value: 2, default: undefined },
    lineJoin: { value: 'bevel', default: undefined },
    arc: {
        value: { x: 10, y: 10, radius: 5, startAngle: 0, endAngle: Math.PI },
        default: undefined,
    },
    arcTo: {
        value: { x1: 1, y1: 2, x2: 3, y2: 4, radius: 5 },
        default: undefined,
    },
    ellipse: {
        value: {
            x: 10,
            y: 10,
            radiusX: 6,
            radiusY: 4,
            rotation: 0,
            startAngle: 0,
            endAngle: Math.PI,
            counterclockwise: false,
        },
        default: undefined,
    },
    bezierCurveTo: {
        value: { cpx1: 1, cpy1: 2, cpx2: 3, cpy2: 4, endX: 5, endY: 6 },
        default: undefined,
    },
    quadraticCurveTo: {
        value: { cpx1: 1, cpy1: 2, endX: 5, endY: 6 },
        default: undefined,
    },
    rect: { value: { x: 2, y: 3, width: 40, height: 50 }, default: undefined },
    roundRect: {
        value: {
            x: 2,
            y: 3,
            width: 40,
            height: 50,
            borderRadius: [4, 4, 4, 4],
        },
        default: undefined,
    },
    strokeRect: {
        value: { x: 2, y: 3, width: 40, height: 50 },
        default: undefined,
    },
    moveTo: { value: { x: 3, y: 7 }, default: undefined },
    radialGradient: {
        value: { x0: 0, y0: 0, r0: 1, x1: 20, y1: 20, r1: 10 },
        default: undefined,
    },
    linearGradient: {
        value: { x0: 0, y0: 0, x1: 20, y1: 20 },
        default: undefined,
    },
    conicGradient: { value: { angle: 0, x: 10, y: 10 }, default: undefined },
    colorStops: {
        value: [
            { stop: 0, color: '#000000' },
            { stop: 1, color: '#ffffff' },
        ],
        default: undefined,
    },
    blur: { value: 4, default: undefined },
    brightness: { value: 120, default: undefined },
    contrast: { value: 125, default: undefined },
    dropShadow: { value: [[2, 2, 4, 'rgba(0,0,0,0.4)']], default: undefined },
    grayscale: { value: 60, default: undefined },
    hueRotate: { value: 90, default: undefined },
    saturate: { value: 110, default: undefined },
    sepia: { value: 35, default: undefined },
    shadowBlur: { value: 8, default: undefined },
    shadowColor: { value: 'rgba(0, 0, 0, 0.5)', default: undefined },
    shadowOffsetX: { value: 6, default: 0 },
    shadowOffsetY: { value: 7, default: 0 },
    font: { value: 'normal normal 400 16px sans-serif', default: undefined },
    fillText: {
        value: { text: 'shape', x: 10, y: 20, maxWidth: 80 },
        default: undefined,
    },
    strokeText: {
        value: { text: 'shape', x: 10, y: 20, maxWidth: 80 },
        default: undefined,
    },
    fontStretch: { value: 'expanded', default: undefined },
    fontKerning: { value: 'normal', default: undefined },
    fontVariantCaps: { value: 'small-caps', default: undefined },
    textBaseline: { value: 'middle', default: undefined },
    textRendering: { value: 'optimizeSpeed', default: undefined },
    wordSpacing: { value: 4, default: undefined },
    letterSpacing: { value: 2, default: undefined },
    direction: { value: 'rtl', default: undefined },
    textAlign: { value: 'center', default: 'start' },
    clip: { value: { fillRule: 'evenodd' }, default: undefined },
    drawImage: {
        value: {
            source: {} as CanvasImageSource,
            x: 0,
            y: 0,
            width: 10,
            height: 10,
            clipX: 0,
            clipY: 0,
            clipWidth: 10,
            clipHeight: 10,
        },
        default: undefined,
    },
    imageSmoothingEnabled: { value: true, default: undefined },
    imageSmoothingQuality: { value: 'high', default: undefined },
    globalCompositeOperation: { value: 'source-over', default: 'source-out' },
    globalAlpha: { value: 0.5, default: 1.0 },
}

beforeEach(() => {
    block = new ShapeBlock({})
})

describe('ShapeBlock', () => {
    describe('Constructor', () => {
        it('creates a ShapeBlock instance', () => {
            expect(block).toBeInstanceOf(ShapeBlock)
        })

        it('should not throw when creating a ShapeBlock with options', () => {
            expect(
                () => new ShapeBlock({ x: 12, y: 24, width: 140, height: 80 })
            ).not.toThrow()
        })
    })

    describe('All options test', () => {
        for (const [key, val] of Object.entries(shapeOptions)) {
            it(`option ${key} defaults to ${val.default}`, () => {
                const currentVal = getPrototype(block, key)?.value.call(block)
                expect(currentVal).toStrictEqual(val.default)
            })
            it(`option ${key} can be set to ${val.value}`, () => {
                const currentVal = getPrototype(block, key)?.value.call(
                    block,
                    val.value
                )
                expect(currentVal).toStrictEqual(val.value)
            })
        }
    })

    describe('point checks', () => {
        it('pointInPath returns false without context', () => {
            expect(block.pointInPath({ x: 0, y: 0 })).toBe(false)
        })

        it('pointInStroke returns false without context', () => {
            expect(block.pointInStroke({ x: 0, y: 0 })).toBe(false)
        })
    })

    describe('path and text helpers', () => {
        it('beginPath calls canvas context beginPath', () => {
            expect(() => block.beginPath()).not.toThrow()
        })

        it('closePath calls canvas context closePath', () => {
            expect(() => block.closePath()).not.toThrow()
        })

        it('measureText returns value from canvas context', () => {
            const textShape = new ShapeBlock({
                fillText: { text: 'shape text', x: 10, y: 20, maxWidth: 80 },
                textAlign: 'center',
                fontKerning: 'normal',
                font: 'normal normal 400 16px sans-serif',
            })
            const canvas = new Canvas('myCanvas', 300, 400)
            canvas.add(textShape)

            const expected = {
                width: 73.828125,
                actualBoundingBoxAscent: 12,
                actualBoundingBoxDescent: 3,
                actualBoundingBoxLeft: 36.9140625,
                actualBoundingBoxRight: 37.46875,
                fontBoundingBoxAscent: 14,
                fontBoundingBoxDescent: 3,
            }

            const content = textShape.fillText()?.text || ''
            const result = textShape.measureText(content)

            expect(result).toBeDefined()
            expect(result?.width).toBeCloseTo(expected.width, 2)
            expect(result?.actualBoundingBoxAscent).toEqual(
                expected.actualBoundingBoxAscent
            )
            expect(result?.actualBoundingBoxDescent).toEqual(
                expected.actualBoundingBoxDescent
            )
            expect(result?.actualBoundingBoxLeft).toEqual(
                expected.actualBoundingBoxLeft
            )
            expect(result?.actualBoundingBoxRight).toEqual(
                expected.actualBoundingBoxRight
            )
            expect(result?.fontBoundingBoxAscent).toEqual(
                expected.fontBoundingBoxAscent
            )
            expect(result?.fontBoundingBoxDescent).toEqual(
                expected.fontBoundingBoxDescent
            )
        })
    })
})
