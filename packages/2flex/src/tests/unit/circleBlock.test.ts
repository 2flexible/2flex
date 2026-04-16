// src/__tests__/circleBlock.test.ts
import { describe, it, expect } from 'vitest'
import { CircleBlock } from '@2flexible/2flex'

function makeCircle(opts = {}) {
    return new CircleBlock({ x: 0, y: 0, width: 80, height: 80, ...opts })
}

const circleOptions = {
    // ── Core Circle Geometry ───
    startAngle: { value: Math.PI / 4, default: 0 },
    endAngle: { value: Math.PI * 1.75, default: Math.PI * 2 },
    innerRadius: { value: 35, default: 0 },

    // ── Appearance ───
    backgroundColor: { value: '#22c55e', default: undefined },
    borderStyle: { value: 'dotted', default: 'solid' },
    borderWidth: { value: 7, default: 0 },
    borderColor: { value: '#166534', default: 'black' },
    border: { value: [8, 'solid', '#1e40af'], default: undefined },

    // ── Inherited from ShapeBlock (most useful for circles) ───
    fillStyle: { value: '#eab308', default: undefined },
    strokeStyle: { value: '#3b82f6', default: undefined },
    lineWidth: { value: 6, default: undefined },
    lineCap: { value: 'round', default: undefined },
    lineJoin: { value: 'round', default: undefined },
    shadowBlur: { value: 18, default: undefined },
    shadowColor: { value: 'rgba(0, 0, 0, 0.4)', default: undefined },
    shadowOffsetX: { value: 4, default: undefined },
    shadowOffsetY: { value: 9, default: undefined },
    globalAlpha: { value: 0.96, default: undefined },

    // ── Geometry (commonly used with CircleBlock) ───
    x: { value: 160, default: 0 },
    y: { value: 160, default: 0 },
    width: { value: 220, default: 0 },
    height: { value: 220, default: 0 },
}

describe('CircleBlock', () => {
    describe('constructor', () => {
        it('creates a CircleBlock instance', () => {
            expect(makeCircle()).toBeInstanceOf(CircleBlock)
        })

        it('accepts initial options', () => {
            const b = makeCircle({ backgroundColor: 'blue' })
            expect(b.backgroundColor()).toBe('blue')
        })
    })

    describe('startAngle', () => {
        it('startAngle defaults to 0', () => {
            expect(makeCircle().startAngle()).toBe(0)
        })

        it('sets startAngle', () => {
            const b = makeCircle()
            b.startAngle(Math.PI / 2)
            expect(b.startAngle()).toBeCloseTo(Math.PI / 2)
        })
    })

    describe('endAngle', () => {
        it('endAngle defaults to Math.PI * 2', () => {
            expect(makeCircle().endAngle()).toBeCloseTo(Math.PI * 2)
        })

        it('sets endAngle', () => {
            const b = makeCircle()
            b.endAngle(Math.PI)
            expect(b.endAngle()).toBeCloseTo(Math.PI)
        })
    })

    describe('innerRadius', () => {
        it('innerRadius defaults to 0', () => {
            expect(makeCircle().innerRadius()).toBe(0)
        })

        it('sets innerRadius (donut shape)', () => {
            const b = makeCircle()
            b.innerRadius(20)
            expect(b.innerRadius()).toBe(20)
        })
    })

    describe('backgroundColor', () => {
        it('backgroundColor defaults to undefined', () => {
            expect(makeCircle().backgroundColor()).toBeUndefined()
        })

        it('sets backgroundColor', () => {
            const b = makeCircle()
            b.backgroundColor('green')
            expect(b.backgroundColor()).toBe('green')
        })
    })

    describe('border', () => {
        it("borderStyle defaults to 'solid'", () => {
            expect(makeCircle().borderStyle()).toBe('solid')
        })

        it("sets borderStyle to 'dotted'", () => {
            const b = makeCircle()
            b.borderStyle('dotted')
            expect(b.borderStyle()).toBe('dotted')
        })

        it('borderWidth defaults to 0', () => {
            expect(makeCircle().borderWidth()).toBe(0)
        })

        it('sets borderWidth', () => {
            const b = makeCircle()
            b.borderWidth(3)
            expect(b.borderWidth()).toBe(3)
        })

        it("borderColor defaults to 'black'", () => {
            expect(makeCircle().borderColor()).toBe('black')
        })

        it('sets borderColor', () => {
            const b = makeCircle()
            b.borderColor('orange')
            expect(b.borderColor()).toBe('orange')
        })

        it('border shorthand defaults to undefined', () => {
            expect(makeCircle().border()).toBeUndefined()
        })

        it('sets border shorthand', () => {
            const b = makeCircle()
            b.border([2, 'solid', 'red'])
            expect(b.border()).toEqual([2, 'solid', 'red'])
        })
    })

    describe('inherited Block options', () => {
        it('hidden defaults to false', () => {
            expect(makeCircle().hidden()).toBe(false)
        })

        it('selectable defaults to false', () => {
            expect(makeCircle().selectable()).toBe(false)
        })
    })
})
