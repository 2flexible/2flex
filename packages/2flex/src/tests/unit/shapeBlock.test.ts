// src/__tests__/shapeBlock.test.ts
import { describe, it, expect, vi } from 'vitest'
import { ShapeBlock, RectangleBlock } from '@2flexible/2flex'

const shapeOptions = {
    // ── Geometry / Path ───
    draw: {
        value: (ctx: CanvasRenderingContext2D) => {
            ctx.beginPath()
            ctx.rect(0, 0, 100, 100)
        },
        default: undefined,
    },
    moveTo: { value: { x: 50, y: 30 }, default: undefined },
    lineTo: { value: { x: 150, y: 80 }, default: undefined },
    bezierCurveTo: {
        value: { cpx1: 60, cpy1: 20, cpx2: 120, cpy2: 40, endX: 180, endY: 90 },
        default: undefined,
    },
    quadraticCurveTo: {
        value: { cpx1: 70, cpy1: 25, endX: 160, endY: 85 },
        default: undefined,
    },
    arc: {
        value: {
            x: 100,
            y: 60,
            radius: 40,
            startAngle: 0,
            endAngle: Math.PI * 2,
        },
        default: undefined,
    },
    arcTo: {
        value: { x1: 30, y1: 40, x2: 120, y2: 70, radius: 25 },
        default: undefined,
    },
    ellipse: {
        value: {
            x: 100,
            y: 70,
            radiusX: 50,
            radiusY: 30,
            rotation: 0,
            startAngle: 0,
            endAngle: Math.PI * 2,
        },
        default: undefined,
    },
    rect: {
        value: { x: 20, y: 20, width: 160, height: 100 },
        default: undefined,
    },
    roundRect: {
        value: {
            x: 30,
            y: 30,
            width: 140,
            height: 90,
            borderRadius: [10, 20, 15, 25],
        },
        default: undefined,
    },
    strokeRect: {
        value: { x: 40, y: 40, width: 120, height: 80 },
        default: undefined,
    },

    // ── Fill / Stroke ───
    fill: { value: { fill: true, fillRule: 'nonzero' }, default: undefined },
    stroke: { value: { stroke: true }, default: undefined },
    fillStyle: { value: '#3b82f6', default: undefined },
    strokeStyle: { value: '#1e40af', default: undefined },

    // ── Line Style ───
    lineWidth: { value: 6, default: undefined },
    lineDash: { value: [12, 8, 4], default: undefined },
    lineDashOffset: { value: 5, default: undefined },
    lineCap: { value: 'round', default: undefined },
    lineJoin: { value: 'round', default: undefined },

    // ── Gradients ───
    linearGradient: {
        value: { x0: 0, y0: 0, x1: 200, y1: 150 },
        default: undefined,
    },
    radialGradient: {
        value: { x0: 100, y0: 80, r0: 10, x1: 120, y1: 90, r1: 80 },
        default: undefined,
    },
    conicGradient: {
        value: { angle: Math.PI / 4, x: 100, y: 70 },
        default: undefined,
    },
    colorStops: {
        value: [
            { stop: 0, color: '#ef4444' },
            { stop: 1, color: '#3b82f6' },
        ],
        default: undefined,
    },

    // ── Shadow / Filter ───
    shadowBlur: { value: 12, default: undefined },
    shadowColor: { value: 'rgba(0, 0, 0, 0.4)', default: undefined },
    shadowOffsetX: { value: 8, default: undefined },
    shadowOffsetY: { value: 8, default: undefined },
    blur: { value: 4, default: undefined },
    brightness: { value: 1.1, default: undefined },
    contrast: { value: 1.2, default: undefined },
    dropShadow: { value: [6, 6, 10, 'rgba(0,0,0,0.5)'], default: undefined },
    grayscale: { value: 0.3, default: undefined },
    hueRotate: { value: 45, default: undefined },
    saturate: { value: 1.4, default: undefined },
    sepia: { value: 0.2, default: undefined },

    // ── Text ───
    fillText: {
        value: { text: 'ShapeBlock', x: 50, y: 80, maxWidth: 180 },
        default: undefined,
    },
    strokeText: {
        value: { text: 'Outline', x: 55, y: 85 },
        default: undefined,
    },
    textAlign: { value: 'center', default: undefined },
    textBaseline: { value: 'middle', default: undefined },
    fontStretch: { value: 'normal', default: undefined },
    fontKerning: { value: 'auto', default: undefined },
    fontVariantCaps: { value: 'normal', default: undefined },
    textRendering: { value: 'optimizeLegibility', default: undefined },
    wordSpacing: { value: '2px', default: undefined },
    letterSpacing: { value: '1px', default: undefined },
    direction: { value: 'ltr', default: undefined },

    // ── Compositing & Others ───
    globalAlpha: { value: 0.95, default: undefined },
    globalCompositeOperation: { value: 'source-over', default: undefined },
    clip: { value: { fillRule: 'nonzero' }, default: undefined },
    drawImage: {
        value: {
            source: new Image(),
            x: 10,
            y: 10,
            width: 100,
            height: 80,
            clipX: 0,
            clipY: 0,
            clipWidth: 100,
            clipHeight: 80,
        },
        default: undefined,
    },
    imageSmoothingEnabled: { value: true, default: undefined },
    imageSmoothingQuality: { value: 'high', default: undefined },
}

// Use RectangleBlock as a concrete ShapeBlock; all ShapeBlock options are inherited.
function makeShape(opts = {}) {
    return new RectangleBlock({ x: 0, y: 0, width: 100, height: 100, ...opts })
}

describe('ShapeBlock (via RectangleBlock)', () => {
    // ─── draw ──────────────────────────────────────────────────────────────────
    describe('draw', () => {
        it('draw defaults to undefined', () => {
            expect(makeShape().draw()).toBeUndefined()
        })

        it('sets a draw callback', () => {
            const b = makeShape()
            const cb = vi.fn()
            b.draw(cb)
            expect(b.draw()).toBe(cb)
        })
    })

    // ─── fillStyle / strokeStyle ───────────────────────────────────────────────
    describe('fillStyle / strokeStyle', () => {
        it('fillStyle defaults to undefined', () => {
            expect(makeShape().fillStyle()).toBeUndefined()
        })

        it('sets fillStyle to a color string', () => {
            const b = makeShape()
            b.fillStyle('rgba(255,0,0,0.5)')
            expect(b.fillStyle()).toBe('rgba(255,0,0,0.5)')
        })

        it('strokeStyle defaults to undefined', () => {
            expect(makeShape().strokeStyle()).toBeUndefined()
        })

        it('sets strokeStyle', () => {
            const b = makeShape()
            b.strokeStyle('#00ff00')
            expect(b.strokeStyle()).toBe('#00ff00')
        })
    })

    // ─── line properties ──────────────────────────────────────────────────────
    describe('line properties', () => {
        it('lineWidth defaults to undefined', () => {
            expect(makeShape().lineWidth()).toBeUndefined()
        })

        it('sets lineWidth', () => {
            const b = makeShape()
            b.lineWidth(3)
            expect(b.lineWidth()).toBe(3)
        })

        it('lineDash defaults to undefined', () => {
            expect(makeShape().lineDash()).toBeUndefined()
        })

        it('sets lineDash', () => {
            const b = makeShape()
            b.lineDash([5, 10])
            expect(b.lineDash()).toEqual([5, 10])
        })

        it('lineDashOffset defaults to undefined', () => {
            expect(makeShape().lineDashOffset()).toBeUndefined()
        })

        it('sets lineDashOffset', () => {
            const b = makeShape()
            b.lineDashOffset(2)
            expect(b.lineDashOffset()).toBe(2)
        })

        it('lineCap defaults to undefined', () => {
            expect(makeShape().lineCap()).toBeUndefined()
        })

        it("sets lineCap to 'round'", () => {
            const b = makeShape()
            b.lineCap('round')
            expect(b.lineCap()).toBe('round')
        })

        it("sets lineCap to 'square'", () => {
            const b = makeShape()
            b.lineCap('square')
            expect(b.lineCap()).toBe('square')
        })

        it('lineJoin defaults to undefined', () => {
            expect(makeShape().lineJoin()).toBeUndefined()
        })

        it("sets lineJoin to 'round'", () => {
            const b = makeShape()
            b.lineJoin('round')
            expect(b.lineJoin()).toBe('round')
        })

        it("sets lineJoin to 'bevel'", () => {
            const b = makeShape()
            b.lineJoin('bevel')
            expect(b.lineJoin()).toBe('bevel')
        })
    })

    // ─── shadow ────────────────────────────────────────────────────────────────
    describe('shadow', () => {
        it('shadowBlur defaults to undefined', () => {
            expect(makeShape().shadowBlur()).toBeUndefined()
        })

        it('sets shadowBlur', () => {
            const b = makeShape()
            b.shadowBlur(10)
            expect(b.shadowBlur()).toBe(10)
        })

        it('shadowColor defaults to undefined', () => {
            expect(makeShape().shadowColor()).toBeUndefined()
        })

        it('sets shadowColor', () => {
            const b = makeShape()
            b.shadowColor('rgba(0,0,0,0.5)')
            expect(b.shadowColor()).toBe('rgba(0,0,0,0.5)')
        })

        it('shadowOffsetX defaults to undefined', () => {
            expect(makeShape().shadowOffsetX()).toBeUndefined()
        })

        it('sets shadowOffsetX', () => {
            const b = makeShape()
            b.shadowOffsetX(5)
            expect(b.shadowOffsetX()).toBe(5)
        })

        it('shadowOffsetY defaults to undefined', () => {
            expect(makeShape().shadowOffsetY()).toBeUndefined()
        })

        it('sets shadowOffsetY', () => {
            const b = makeShape()
            b.shadowOffsetY(5)
            expect(b.shadowOffsetY()).toBe(5)
        })
    })

    // ─── filters ───────────────────────────────────────────────────────────────
    describe('CSS filters', () => {
        it('blur defaults to undefined', () => {
            expect(makeShape().blur()).toBeUndefined()
        })

        it('sets blur', () => {
            const b = makeShape()
            b.blur(4)
            expect(b.blur()).toBe(4)
        })

        it('brightness defaults to undefined', () => {
            expect(makeShape().brightness()).toBeUndefined()
        })

        it('sets brightness', () => {
            const b = makeShape()
            b.brightness(1.5)
            expect(b.brightness()).toBe(1.5)
        })

        it('contrast defaults to undefined', () => {
            expect(makeShape().contrast()).toBeUndefined()
        })

        it('sets contrast', () => {
            const b = makeShape()
            b.contrast(2)
            expect(b.contrast()).toBe(2)
        })

        it('grayscale defaults to undefined', () => {
            expect(makeShape().grayscale()).toBeUndefined()
        })

        it('sets grayscale', () => {
            const b = makeShape()
            b.grayscale(0.8)
            expect(b.grayscale()).toBe(0.8)
        })

        it('hueRotate defaults to undefined', () => {
            expect(makeShape().hueRotate()).toBeUndefined()
        })

        it('sets hueRotate', () => {
            const b = makeShape()
            b.hueRotate(90)
            expect(b.hueRotate()).toBe(90)
        })

        it('saturate defaults to undefined', () => {
            expect(makeShape().saturate()).toBeUndefined()
        })

        it('sets saturate', () => {
            const b = makeShape()
            b.saturate(2)
            expect(b.saturate()).toBe(2)
        })

        it('sepia defaults to undefined', () => {
            expect(makeShape().sepia()).toBeUndefined()
        })

        it('sets sepia', () => {
            const b = makeShape()
            b.sepia(0.5)
            expect(b.sepia()).toBe(0.5)
        })

        it('dropShadow defaults to undefined', () => {
            expect(makeShape().dropShadow()).toBeUndefined()
        })

        it('sets dropShadow', () => {
            const b = makeShape()
            b.dropShadow([2, 2, 4, 'black'])
            expect(b.dropShadow()).toEqual([2, 2, 4, 'black'])
        })
    })

    // ─── globalAlpha / globalCompositeOperation ────────────────────────────────
    describe('globalAlpha / globalCompositeOperation', () => {
        it('globalAlpha defaults to undefined', () => {
            expect(makeShape().globalAlpha()).toBeUndefined()
        })

        it('sets globalAlpha', () => {
            const b = makeShape()
            b.globalAlpha(0.5)
            expect(b.globalAlpha()).toBe(0.5)
        })

        it('globalCompositeOperation defaults to undefined', () => {
            expect(makeShape().globalCompositeOperation()).toBeUndefined()
        })

        it("sets globalCompositeOperation to 'multiply'", () => {
            const b = makeShape()
            b.globalCompositeOperation('multiply')
            expect(b.globalCompositeOperation()).toBe('multiply')
        })

        it("sets globalCompositeOperation to 'screen'", () => {
            const b = makeShape()
            b.globalCompositeOperation('screen')
            expect(b.globalCompositeOperation()).toBe('screen')
        })
    })

    // ─── imageSmoothingEnabled / imageSmoothingQuality ─────────────────────────
    describe('image smoothing', () => {
        it('imageSmoothingEnabled defaults to undefined', () => {
            expect(makeShape().imageSmoothingEnabled()).toBeUndefined()
        })

        it('sets imageSmoothingEnabled to true', () => {
            const b = makeShape()
            b.imageSmoothingEnabled(true)
            expect(b.imageSmoothingEnabled()).toBe(true)
        })

        it('imageSmoothingQuality defaults to undefined', () => {
            expect(makeShape().imageSmoothingQuality()).toBeUndefined()
        })

        it("sets imageSmoothingQuality to 'high'", () => {
            const b = makeShape()
            b.imageSmoothingQuality('high')
            expect(b.imageSmoothingQuality()).toBe('high')
        })
    })

    // ─── text rendering options ────────────────────────────────────────────────
    describe('text rendering options', () => {
        it('textAlign defaults to undefined', () => {
            expect(makeShape().textAlign()).toBeUndefined()
        })

        it("sets textAlign to 'center'", () => {
            const b = makeShape()
            b.textAlign('center')
            expect(b.textAlign()).toBe('center')
        })

        it('textBaseline defaults to undefined', () => {
            expect(makeShape().textBaseline()).toBeUndefined()
        })

        it("sets textBaseline to 'middle'", () => {
            const b = makeShape()
            b.textBaseline('middle')
            expect(b.textBaseline()).toBe('middle')
        })

        it('direction defaults to undefined', () => {
            expect(makeShape().direction()).toBeUndefined()
        })

        it("sets direction to 'ltr'", () => {
            const b = makeShape()
            b.direction('ltr')
            expect(b.direction()).toBe('ltr')
        })

        it('letterSpacing defaults to undefined', () => {
            expect(makeShape().letterSpacing()).toBeUndefined()
        })

        it('wordSpacing defaults to undefined', () => {
            expect(makeShape().wordSpacing()).toBeUndefined()
        })

        it('fontKerning defaults to undefined', () => {
            expect(makeShape().fontKerning()).toBeUndefined()
        })

        it("sets fontKerning to 'none'", () => {
            const b = makeShape()
            b.fontKerning('none')
            expect(b.fontKerning()).toBe('none')
        })

        it('fontStretch defaults to undefined', () => {
            expect(makeShape().fontStretch()).toBeUndefined()
        })

        it('fontVariantCaps defaults to undefined', () => {
            expect(makeShape().fontVariantCaps()).toBeUndefined()
        })

        it('textRendering defaults to undefined', () => {
            expect(makeShape().textRendering()).toBeUndefined()
        })
    })

    // ─── path drawing options ──────────────────────────────────────────────────
    describe('path drawing options', () => {
        it('moveTo defaults to undefined', () => {
            expect(makeShape().moveTo()).toBeUndefined()
        })

        it('sets moveTo', () => {
            const b = makeShape()
            b.moveTo({ x: 10, y: 20 })
            expect(b.moveTo()).toEqual({ x: 10, y: 20 })
        })

        it('lineTo defaults to undefined', () => {
            expect(makeShape().lineTo()).toBeUndefined()
        })

        it('sets lineTo', () => {
            const b = makeShape()
            b.lineTo({ x: 50, y: 60 })
            expect(b.lineTo()).toEqual({ x: 50, y: 60 })
        })

        it('arc defaults to undefined', () => {
            expect(makeShape().arc()).toBeUndefined()
        })

        it('sets arc', () => {
            const b = makeShape()
            const arcOpts = {
                x: 50,
                y: 50,
                radius: 30,
                startAngle: 0,
                endAngle: Math.PI * 2,
                counterclockwise: false,
            }
            b.arc(arcOpts)
            expect(b.arc()).toMatchObject({ radius: 30 })
        })

        it('rect defaults to undefined', () => {
            expect(makeShape().rect()).toBeUndefined()
        })

        it('sets rect', () => {
            const b = makeShape()
            b.rect({ x: 0, y: 0, width: 50, height: 50 })
            expect(b.rect()).toEqual({ x: 0, y: 0, width: 50, height: 50 })
        })

        it('roundRect defaults to undefined', () => {
            expect(makeShape().roundRect()).toBeUndefined()
        })

        it('strokeRect defaults to undefined', () => {
            expect(makeShape().strokeRect()).toBeUndefined()
        })

        it('sets strokeRect', () => {
            const b = makeShape()
            b.strokeRect({ x: 5, y: 5, width: 40, height: 40 })
            expect(b.strokeRect()).toEqual({
                x: 5,
                y: 5,
                width: 40,
                height: 40,
            })
        })

        it('bezierCurveTo defaults to undefined', () => {
            expect(makeShape().bezierCurveTo()).toBeUndefined()
        })

        it('quadraticCurveTo defaults to undefined', () => {
            expect(makeShape().quadraticCurveTo()).toBeUndefined()
        })

        it('ellipse defaults to undefined', () => {
            expect(makeShape().ellipse()).toBeUndefined()
        })
    })

    // ─── gradient helpers ──────────────────────────────────────────────────────
    describe('gradient helpers', () => {
        it('colorStops defaults to undefined', () => {
            expect(makeShape().colorStops()).toBeUndefined()
        })

        it('sets colorStops', () => {
            const b = makeShape()
            b.colorStops([
                { stop: 0, color: 'red' },
                { stop: 1, color: 'blue' },
            ])
            expect(b.colorStops()).toHaveLength(2)
        })
    })

    // ─── fillText / strokeText ─────────────────────────────────────────────────
    describe('fillText / strokeText', () => {
        it('fillText defaults to undefined', () => {
            expect(makeShape().fillText()).toBeUndefined()
        })

        it('sets fillText', () => {
            const b = makeShape()
            b.fillText({ text: 'Hello', x: 10, y: 20, maxWidth: undefined })
            expect(b.fillText()?.text).toBe('Hello')
        })

        it('strokeText defaults to undefined', () => {
            expect(makeShape().strokeText()).toBeUndefined()
        })

        it('sets strokeText', () => {
            const b = makeShape()
            b.strokeText({ text: 'Outline', x: 10, y: 30, maxWidth: 100 })
            expect(b.strokeText()?.text).toBe('Outline')
        })
    })
})
