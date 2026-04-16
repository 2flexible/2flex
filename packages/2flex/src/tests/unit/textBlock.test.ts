// src/__tests__/textBlock.test.ts
import { describe, it, expect, vi } from 'vitest'
import { TextBlock } from '@2flexible/2flex'

function makeText(text = 'Hello', opts = {}) {
    return new TextBlock(text, { x: 0, y: 0, width: 200, height: 50, ...opts })
}

const textOptions = {
    // ── Core Text Content ───
    text: { value: 'Hello, Grok! This is a sample TextBlock.', default: '' },

    // ── Color & Stroke ───
    color: { value: '#1e40af', default: undefined },
    strokeWidth: { value: 3, default: 0 },
    strokeColor: { value: '#ef4444', default: undefined },

    // ── Typography ───
    fontFamily: {
        value: 'Inter, system-ui, sans-serif',
        default: 'sans-serif',
    },
    fontSize: { value: 42, default: 0 },
    fontWeight: { value: 700, default: 'normal' },
    fontStyle: { value: 'italic', default: 'normal' },
    fontVariant: { value: 'small-caps', default: 'normal' },

    // ── Behavior & Editing ───
    editable: { value: true, default: false },
    onEdit: {
        value: () => console.log('Text was edited!'),
        default: undefined,
    },
    resizeLineHeight: { value: true, default: false },
    wrap: { value: 'word', default: 'nowrap' },

    // ── Inherited from ShapeBlock (commonly useful with Text) ───
    fillStyle: { value: '#3b82f6', default: undefined },
    strokeStyle: { value: '#1e3a8a', default: undefined },
    lineWidth: { value: 4, default: undefined },
    shadowBlur: { value: 8, default: undefined },
    shadowColor: { value: 'rgba(0, 0, 0, 0.3)', default: undefined },
    shadowOffsetX: { value: 3, default: undefined },
    shadowOffsetY: { value: 5, default: undefined },
    globalAlpha: { value: 0.97, default: undefined },

    // ── Geometry (commonly paired with TextBlock) ───
    x: { value: 90, default: 0 },
    y: { value: 140, default: 0 },
    width: { value: 320, default: 0 },
    height: { value: 120, default: 0 },
}

describe('TextBlock', () => {
    describe('constructor', () => {
        it('creates a TextBlock instance', () => {
            expect(makeText()).toBeInstanceOf(TextBlock)
        })

        it('sets text from first argument', () => {
            const b = makeText('World')
            expect(b.text()).toBe('World')
        })
    })

    describe('text', () => {
        it('text defaults to empty string when constructed empty', () => {
            const b = new TextBlock('', { x: 0, y: 0, width: 100, height: 30 })
            expect(b.text()).toBe('')
        })

        it('sets text via method', () => {
            const b = makeText('initial')
            b.text('updated')
            expect(b.text()).toBe('updated')
        })
    })

    describe('color', () => {
        it('color defaults to undefined', () => {
            expect(makeText().color()).toBeUndefined()
        })

        it('sets color', () => {
            const b = makeText()
            b.color('red')
            expect(b.color()).toBe('red')
        })
    })

    describe('stroke', () => {
        it('strokeWidth defaults to 0', () => {
            expect(makeText().strokeWidth()).toBe(0)
        })

        it('sets strokeWidth', () => {
            const b = makeText()
            b.strokeWidth(2)
            expect(b.strokeWidth()).toBe(2)
        })

        it('strokeColor defaults to undefined', () => {
            expect(makeText().strokeColor()).toBeUndefined()
        })

        it('sets strokeColor', () => {
            const b = makeText()
            b.strokeColor('black')
            expect(b.strokeColor()).toBe('black')
        })
    })

    describe('font properties', () => {
        it("fontFamily defaults to 'sans-serif'", () => {
            expect(makeText().fontFamily()).toBe('sans-serif')
        })

        it('sets fontFamily', () => {
            const b = makeText()
            b.fontFamily('Arial')
            expect(b.fontFamily()).toBe('Arial')
        })

        it("fontWeight defaults to 'normal'", () => {
            expect(makeText().fontWeight()).toBe('normal')
        })

        it("sets fontWeight to 'bold'", () => {
            const b = makeText()
            b.fontWeight('bold')
            expect(b.fontWeight()).toBe('bold')
        })

        it('sets fontWeight to numeric 700', () => {
            const b = makeText()
            b.fontWeight(700)
            expect(b.fontWeight()).toBe(700)
        })

        it('fontSize defaults to 0', () => {
            expect(makeText().fontSize()).toBe(0)
        })

        it('sets fontSize', () => {
            const b = makeText()
            b.fontSize(16)
            expect(b.fontSize()).toBe(16)
        })

        it("fontStyle defaults to 'normal'", () => {
            expect(makeText().fontStyle()).toBe('normal')
        })

        it("sets fontStyle to 'italic'", () => {
            const b = makeText()
            b.fontStyle('italic')
            expect(b.fontStyle()).toBe('italic')
        })

        it("fontVariant defaults to 'normal'", () => {
            expect(makeText().fontVariant()).toBe('normal')
        })

        it("sets fontVariant to 'small-caps'", () => {
            const b = makeText()
            b.fontVariant('small-caps')
            expect(b.fontVariant()).toBe('small-caps')
        })
    })

    describe('editable', () => {
        it('editable defaults to false', () => {
            expect(makeText().editable()).toBe(false)
        })

        it('enables editable', () => {
            const b = makeText()
            b.editable(true)
            expect(b.editable()).toBe(true)
        })

        it('onEdit defaults to undefined', () => {
            expect(makeText().onEdit()).toBeUndefined()
        })

        it('sets onEdit callback', () => {
            const b = makeText()
            const cb = vi.fn()
            b.onEdit(cb)
            expect(b.onEdit()).toBe(cb)
        })
    })

    describe('wrap', () => {
        it("wrap defaults to 'nowrap'", () => {
            expect(makeText().wrap()).toBe('nowrap')
        })

        it("sets wrap to 'word'", () => {
            const b = makeText()
            b.wrap('word')
            expect(b.wrap()).toBe('word')
        })

        it("sets wrap to 'letter'", () => {
            const b = makeText()
            b.wrap('letter')
            expect(b.wrap()).toBe('letter')
        })
    })

    describe('resizeLineHeight', () => {
        it('resizeLineHeight defaults to false', () => {
            expect(makeText().resizeLineHeight()).toBe(false)
        })

        it('enables resizeLineHeight', () => {
            const b = makeText()
            b.resizeLineHeight(true)
            expect(b.resizeLineHeight()).toBe(true)
        })
    })
})
