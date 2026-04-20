import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Block, VideoBlock } from '@2flexible/2flex'
import { getPrototype } from '../../Utils'

let block: VideoBlock

function createHtmlVideoElement(): HTMLVideoElement {
    const video = document.createElement('video')
    video.muted = false
    video.width = 300
    video.height = 150
    return video
}

const videoOptions = {
    source: { value: {}, default: undefined },
    autoPlay: { value: true, default: false },
    onPlay: { value: () => {}, default: undefined },
}
const source = createHtmlVideoElement()
beforeEach(() => {
    block = new VideoBlock(source, {})
})

describe('VideoBlock', () => {
    describe('Constructor', () => {
        it('creates a VideoBlock instance', () => {
            expect(block).toBeInstanceOf(VideoBlock)
        })

        it('should not throw when creating a VideoBlock with options', () => {
            expect(
                () =>
                    new VideoBlock(source, {
                        x: 12,
                        y: 24,
                        width: 140,
                        height: 80,
                    })
            ).not.toThrow()
        })
    })

    describe('All options test', () => {
        for (const [key, val] of Object.entries(videoOptions)) {
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

    describe('play / pause', () => {
        it('play() updates internal state', () => {
            block.play()
            expect(block.isPlaying).toBe(true)
            expect(block.isPaused).toBe(false)
        })

        it('pause() updates internal state', () => {
            block.play()
            block.pause()
            expect(block.isPlaying).toBe(false)
            expect(block.isPaused).toBe(true)
        })
    })
})
