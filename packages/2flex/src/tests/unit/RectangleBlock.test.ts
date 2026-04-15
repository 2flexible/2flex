// src/__tests__/rectangleBlock.test.ts
import { describe, it, expect } from 'vitest'
import { RectangleBlock } from '@2flexible/2flex'

function makeRect(opts = {}) {
    return new RectangleBlock({ x: 0, y: 0, width: 100, height: 100, ...opts })
}

describe('RectangleBlock', () => {
    // ─── Constructor ─────────────────────────────────────────────────────────────
    describe('constructor', () => {
        it('creates a RectangleBlock instance', () => {
            expect(makeRect()).toBeInstanceOf(RectangleBlock)
        })

        it('accepts initial options', () => {
            const b = makeRect({
                x: 10,
                y: 20,
                width: 80,
                height: 60,
                backgroundColor: 'red',
            })
            expect(b.x()).toBe(10)
            expect(b.y()).toBe(20)
            expect(b.width()).toBe(80)
            expect(b.height()).toBe(60)
            expect(b.backgroundColor()).toBe('red')
        })
    })

    // ─── backgroundColor ─────────────────────────────────────────────────────────
    describe('backgroundColor', () => {
        it('defaults to undefined', () => {
            expect(makeRect().backgroundColor()).toBeUndefined()
        })

        it('sets backgroundColor', () => {
            const b = makeRect()
            b.backgroundColor('blue')
            expect(b.backgroundColor()).toBe('blue')
        })

        it('sets backgroundColor via constructor', () => {
            const b = makeRect({ backgroundColor: '#ff0000' })
            expect(b.backgroundColor()).toBe('#ff0000')
        })
    })

    // ─── borderRadius ────────────────────────────────────────────────────────────
    describe('borderRadius', () => {
        it('defaults to 0 (or an array of zeros)', () => {
            const br = makeRect().borderRadius()
            const flat = Array.isArray(br) ? br[0] : br
            expect(flat).toBe(0)
        })

        it('sets borderRadius as a number', () => {
            const b = makeRect()
            b.borderRadius(10)
            const br = b.borderRadius()
            const flat = Array.isArray(br) ? br[0] : br
            expect(flat).toBe(10)
        })

        it('sets borderRadius as an array', () => {
            const b = makeRect()
            b.borderRadius([5, 10, 5, 10])
            expect(b.borderRadius()).toEqual([5, 10, 5, 10])
        })
    })

    // ─── borderStyle ─────────────────────────────────────────────────────────────
    describe('borderStyle', () => {
        it("defaults to 'solid'", () => {
            expect(makeRect().borderStyle()).toBe('solid')
        })

        it("sets borderStyle to 'dotted'", () => {
            const b = makeRect()
            b.borderStyle('dotted')
            expect(b.borderStyle()).toBe('dotted')
        })
    })

    // ─── borderWidth ─────────────────────────────────────────────────────────────
    describe('borderWidth', () => {
        it('defaults to 0', () => {
            expect(makeRect().borderWidth()).toBe(0)
        })

        it('sets borderWidth as number', () => {
            const b = makeRect()
            b.borderWidth(2)
            expect(b.borderWidth()).toBe(2)
        })

        it('sets borderWidth via constructor', () => {
            const b = makeRect({ borderWidth: 4 })
            expect(b.borderWidth()).toBe(4)
        })
    })

    // ─── borderColor ─────────────────────────────────────────────────────────────
    describe('borderColor', () => {
        it("defaults to 'black'", () => {
            expect(makeRect().borderColor()).toBe('black')
        })

        it('sets borderColor', () => {
            const b = makeRect()
            b.borderColor('red')
            expect(b.borderColor()).toBe('red')
        })
    })

    // ─── border shorthand ────────────────────────────────────────────────────────
    describe('border shorthand', () => {
        it('border defaults to undefined', () => {
            expect(makeRect().border()).toBeUndefined()
        })

        it('sets border as array [width, style, color]', () => {
            const b = makeRect()
            b.border([2, 'solid', 'black'])
            expect(b.border()).toEqual([2, 'solid', 'black'])
        })

        it('setting border updates borderWidth', () => {
            const b = makeRect()
            b.border([3, 'solid', 'green'])
            expect(b.borderWidth()).toBe(3)
        })

        it('setting border updates borderStyle', () => {
            const b = makeRect()
            b.border([1, 'dotted', 'gray'])
            expect(b.borderStyle()).toBe('dotted')
        })

        it('setting border updates borderColor', () => {
            const b = makeRect()
            b.border([1, 'solid', 'purple'])
            expect(b.borderColor()).toBe('purple')
        })
    })

    // ─── per-side borders ────────────────────────────────────────────────────────
    describe('per-side borders', () => {
        it('borderTop defaults to undefined', () => {
            expect(makeRect().borderTop()).toBeUndefined()
        })

        it('sets borderTop', () => {
            const b = makeRect()
            b.borderTop([2, 'solid', 'red'])
            expect(b.borderTop()).toEqual([2, 'solid', 'red'])
        })

        it('borderBottom defaults to undefined', () => {
            expect(makeRect().borderBottom()).toBeUndefined()
        })

        it('sets borderBottom', () => {
            const b = makeRect()
            b.borderBottom([1, 'dotted', 'blue'])
            expect(b.borderBottom()).toEqual([1, 'dotted', 'blue'])
        })

        it('borderLeft defaults to undefined', () => {
            expect(makeRect().borderLeft()).toBeUndefined()
        })

        it('sets borderLeft', () => {
            const b = makeRect()
            b.borderLeft([3, 'solid', 'green'])
            expect(b.borderLeft()).toEqual([3, 'solid', 'green'])
        })

        it('borderRight defaults to undefined', () => {
            expect(makeRect().borderRight()).toBeUndefined()
        })

        it('sets borderRight', () => {
            const b = makeRect()
            b.borderRight([2, 'solid', 'yellow'])
            expect(b.borderRight()).toEqual([2, 'solid', 'yellow'])
        })
    })

    // ─── Inherited base options sanity check ─────────────────────────────────────
    describe('inherited Block options', () => {
        it('draggable defaults to false', () => {
            expect(makeRect().draggable()).toBe(false)
        })

        it('selectable defaults to false', () => {
            expect(makeRect().selectable()).toBe(false)
        })

        it('hidden defaults to false', () => {
            expect(makeRect().hidden()).toBe(false)
        })
    })
})
