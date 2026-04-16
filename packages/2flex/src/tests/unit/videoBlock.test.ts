// src/__tests__/videoBlock.test.ts
import { describe, it, expect, vi } from 'vitest'
import { VideoBlock } from '@2flexible/2flex'
const videoOptions = {
    // ── Core Video Source & Playback ───
    source: {
        value: document.createElement('video') as HTMLVideoElement,
        default: undefined,
    },
    autoPlay: { value: true, default: false },

    // ── Callbacks ───
    onPlay: {
        value: (timestamp: number) =>
            console.log(`Video playing at ${timestamp}`),
        default: undefined,
    },
}
function makeVideoElement(): HTMLVideoElement {
    const v = document.createElement('video')
    // Stub play/pause because jsdom doesn't support media playback
    v.play = vi.fn().mockResolvedValue(undefined)
    v.pause = vi.fn()
    return v
}

function makeVideo(opts = {}) {
    const videoEl = makeVideoElement()
    return new VideoBlock(videoEl, {
        x: 0,
        y: 0,
        width: 320,
        height: 240,
        ...opts,
    })
}

describe('VideoBlock', () => {
    describe('constructor', () => {
        it('creates a VideoBlock instance', () => {
            expect(makeVideo()).toBeInstanceOf(VideoBlock)
        })
    })

    // ─── source ────────────────────────────────────────────────────────────────
    describe('source', () => {
        it('source is the HTMLVideoElement passed to constructor', () => {
            const videoEl = makeVideoElement()
            const b = new VideoBlock(videoEl, {
                x: 0,
                y: 0,
                width: 320,
                height: 240,
            })
            expect(b.source()).toBe(videoEl)
        })

        it('source defaults to undefined when not provided', () => {
            const b = new VideoBlock(undefined, {
                x: 0,
                y: 0,
                width: 320,
                height: 240,
            })
            expect(b.source()).toBeUndefined()
        })
    })

    // ─── autoPlay ──────────────────────────────────────────────────────────────
    describe('autoPlay', () => {
        it('autoPlay defaults to false', () => {
            expect(makeVideo().autoPlay()).toBe(false)
        })

        it('sets autoPlay to true', () => {
            const b = makeVideo({ autoPlay: true })
            expect(b.autoPlay()).toBe(true)
        })

        it('toggles autoPlay via method', () => {
            const b = makeVideo()
            b.autoPlay(true)
            expect(b.autoPlay()).toBe(true)
            b.autoPlay(false)
            expect(b.autoPlay()).toBe(false)
        })
    })

    // ─── onPlay ────────────────────────────────────────────────────────────────
    describe('onPlay', () => {
        it('onPlay defaults to undefined', () => {
            expect(makeVideo().onPlay()).toBeUndefined()
        })

        it('sets onPlay callback', () => {
            const b = makeVideo()
            const cb = vi.fn()
            b.onPlay(cb)
            expect(b.onPlay()).toBe(cb)
        })
    })

    // ─── play() / pause() methods ──────────────────────────────────────────────
    describe('play() / pause() methods', () => {
        it('play() does not throw', () => {
            const b = makeVideo()
            expect(() => b.play()).not.toThrow()
        })

        it('pause() does not throw', () => {
            const b = makeVideo()
            expect(() => b.pause()).not.toThrow()
        })
    })

    // ─── Inherited Block options sanity check ──────────────────────────────────
    describe('inherited Block options', () => {
        it('x and y set from constructor', () => {
            const b = makeVideo({ x: 50, y: 60 })
            expect(b.x()).toBe(50)
            expect(b.y()).toBe(60)
        })

        it('width and height set from constructor', () => {
            const b = makeVideo({ width: 640, height: 480 })
            expect(b.width()).toBe(640)
            expect(b.height()).toBe(480)
        })

        it('hidden defaults to false', () => {
            expect(makeVideo().hidden()).toBe(false)
        })
    })
})
