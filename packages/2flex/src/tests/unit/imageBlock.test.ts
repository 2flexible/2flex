// src/__tests__/imageBlock.test.ts
import { describe, it, expect, vi } from 'vitest'
import { ImageBlock } from '@2flexible/2flex'
const imageOptions = {
    // ── Core Image Source & Clipping ───
    clipX: { value: 40, default: 0 },
    clipY: { value: 30, default: 0 },
    clipWidth: { value: 280, default: 'width' },
    clipHeight: { value: 180, default: 'height' },

    // ── Image Fitting & Repeating ───
    objectFit: { value: 'cover', default: undefined },
    repeatX: { value: 'fill', default: undefined },
    repeatY: { value: 3, default: undefined },

    // ── Inherited from ShapeBlock (most useful for images) ───
    backgroundColor: { value: '#111827', default: undefined },
    fillStyle: { value: '#22c55e', default: undefined },
    strokeStyle: { value: '#1e40af', default: undefined },
    lineWidth: { value: 3, default: undefined },
    lineCap: { value: 'round', default: undefined },
    lineJoin: { value: 'round', default: undefined },
    shadowBlur: { value: 14, default: undefined },
    shadowColor: { value: 'rgba(0, 0, 0, 0.45)', default: undefined },
    shadowOffsetX: { value: 5, default: undefined },
    shadowOffsetY: { value: 8, default: undefined },
    globalAlpha: { value: 0.98, default: undefined },

    // ── Geometry (commonly used with ImageBlock) ───
    x: { value: 100, default: 0 },
    y: { value: 90, default: 0 },
    width: { value: 360, default: 0 },
    height: { value: 240, default: 0 },
}
function makeImage(opts = {}) {
    // ImageBlock first argument is an image path string or HTMLImageElement
    return new ImageBlock('/fake/image.png', {
        x: 0,
        y: 0,
        width: 200,
        height: 150,
        ...opts,
    })
}

describe('ImageBlock', () => {
    describe('constructor', () => {
        it('creates an ImageBlock instance', () => {
            expect(makeImage()).toBeInstanceOf(ImageBlock)
        })

        it('accepts an HTMLImageElement as first argument', () => {
            const img = new Image()
            expect(
                () =>
                    new ImageBlock(img, { x: 0, y: 0, width: 100, height: 100 })
            ).not.toThrow()
        })
    })

    // ─── clipX / clipY ─────────────────────────────────────────────────────────
    describe('clipX / clipY', () => {
        it('clipX defaults to 0', () => {
            expect(makeImage().clipX()).toBe(0)
        })

        it('sets clipX', () => {
            const b = makeImage()
            b.clipX(20)
            expect(b.clipX()).toBe(20)
        })

        it('clipY defaults to 0', () => {
            expect(makeImage().clipY()).toBe(0)
        })

        it('sets clipY', () => {
            const b = makeImage()
            b.clipY(30)
            expect(b.clipY()).toBe(30)
        })
    })

    // ─── clipWidth / clipHeight ────────────────────────────────────────────────
    describe('clipWidth / clipHeight', () => {
        it('clipWidth defaults to block width', () => {
            expect(makeImage({ width: 200 }).clipWidth()).toBe(200)
        })

        it('sets clipWidth', () => {
            const b = makeImage()
            b.clipWidth(100)
            expect(b.clipWidth()).toBe(100)
        })

        it('clipHeight defaults to block height', () => {
            expect(makeImage({ height: 150 }).clipHeight()).toBe(150)
        })

        it('sets clipHeight', () => {
            const b = makeImage()
            b.clipHeight(80)
            expect(b.clipHeight()).toBe(80)
        })
    })

    // ─── objectFit ─────────────────────────────────────────────────────────────
    describe('objectFit', () => {
        it('objectFit defaults to undefined', () => {
            expect(makeImage().objectFit()).toBeUndefined()
        })

        it("sets objectFit to 'cover'", () => {
            const b = makeImage()
            b.objectFit('cover')
            expect(b.objectFit()).toBe('cover')
        })

        it("sets objectFit to 'contain'", () => {
            const b = makeImage()
            b.objectFit('contain')
            expect(b.objectFit()).toBe('contain')
        })

        it("sets objectFit to 'fill'", () => {
            const b = makeImage()
            b.objectFit('fill')
            expect(b.objectFit()).toBe('fill')
        })
    })

    // ─── repeatX / repeatY ────────────────────────────────────────────────────
    describe('repeatX / repeatY', () => {
        it('repeatX defaults to undefined', () => {
            expect(makeImage().repeatX()).toBeUndefined()
        })

        it('sets repeatX to a number', () => {
            const b = makeImage()
            b.repeatX(3)
            expect(b.repeatX()).toBe(3)
        })

        it("sets repeatX to 'fill'", () => {
            const b = makeImage()
            b.repeatX('fill')
            expect(b.repeatX()).toBe('fill')
        })

        it('repeatY defaults to undefined', () => {
            expect(makeImage().repeatY()).toBeUndefined()
        })

        it('sets repeatY to a number', () => {
            const b = makeImage()
            b.repeatY(2)
            expect(b.repeatY()).toBe(2)
        })

        it("sets repeatY to 'fill'", () => {
            const b = makeImage()
            b.repeatY('fill')
            expect(b.repeatY()).toBe('fill')
        })
    })

    // ─── Inherited Block options sanity check ──────────────────────────────────
    describe('inherited Block options', () => {
        it('x and y set from constructor', () => {
            const b = makeImage({ x: 10, y: 20 })
            expect(b.x()).toBe(10)
            expect(b.y()).toBe(20)
        })

        it('hidden defaults to false', () => {
            expect(makeImage().hidden()).toBe(false)
        })

        it('selectable defaults to false', () => {
            expect(makeImage().selectable()).toBe(false)
        })
    })
})
