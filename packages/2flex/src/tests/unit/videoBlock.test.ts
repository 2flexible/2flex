import { describe, it, expect, afterEach, vi } from 'vitest'
import { Block, ShapeBlock, VideoBlock } from '@2flexible/2flex'
import { MediaLayoutBlock } from '../../shapes/MediaLayoutBlock'

const createVideo = () => {
    const video = document.createElement('video')
    vi.spyOn(video, 'play').mockResolvedValue(undefined)
    vi.spyOn(video, 'pause').mockImplementation(() => undefined)
    return video
}

describe('VideoBlock', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('constructor', () => {
        it('should create a VideoBlock instance', () => {
            expect(new VideoBlock({})).toBeInstanceOf(VideoBlock)
        })

        it('should create a MediaLayoutBlock instance', () => {
            expect(new VideoBlock({})).toBeInstanceOf(MediaLayoutBlock)
        })

        it('should create a ShapeBlock instance', () => {
            expect(new VideoBlock({})).toBeInstanceOf(ShapeBlock)
        })

        it('should create a Block instance', () => {
            expect(new VideoBlock({})).toBeInstanceOf(Block)
        })

        it('should keep the options it was created with', () => {
            const onPlay = vi.fn()
            const block = new VideoBlock({
                x: 12,
                y: 24,
                width: 140,
                height: 80,
                autoPlay: true,
                onPlay,
            })

            expect(block.x()).toBe(12)
            expect(block.y()).toBe(24)
            expect(block.width()).toBe(140)
            expect(block.height()).toBe(80)
            expect(block.autoPlay()).toBe(true)
            expect(block.onPlay()).toBe(onPlay)
        })
    })

    describe('option defaults', () => {
        it('should default autoPlay to false', () => {
            expect(new VideoBlock({}).autoPlay()).toBe(false)
        })

        it('should default onPlay to undefined', () => {
            expect(new VideoBlock({}).onPlay()).toBeUndefined()
        })
    })

    describe('initialization', () => {
        it('should use the configured video as its media source', () => {
            const video = createVideo()
            const block = new VideoBlock({ source: video })

            block.init()

            expect(block.mediaSource).toBe(video)
        })

        it('should mute the configured video', () => {
            const video = createVideo()
            const block = new VideoBlock({ source: video })

            block.init()

            expect(video.muted).toBe(true)
        })

        it('should not register an animation without a video', () => {
            const block = new VideoBlock({})
            const addAnimation = vi.spyOn(block, '__addAnimation')

            block.init()

            expect(addAnimation).not.toHaveBeenCalled()
        })

        it('should register a numeric animation id for a video', () => {
            const video = createVideo()
            const block = new VideoBlock({ source: video })
            const addAnimation = vi.spyOn(block, '__addAnimation')

            block.init()

            expect(addAnimation).toHaveBeenCalledTimes(1)
            expect(addAnimation.mock.calls[0][0]).toMatch(/^\d+$/)
        })

        it('should not play the video when autoPlay is disabled', () => {
            const video = createVideo()
            const block = new VideoBlock({ source: video })

            block.init()

            expect(video.play).not.toHaveBeenCalled()
            expect(block.isPlaying).toBe(false)
        })

        it('should play the video when autoPlay is enabled', () => {
            const video = createVideo()
            const block = new VideoBlock({ source: video, autoPlay: true })

            block.init()

            expect(video.play).toHaveBeenCalledTimes(1)
            expect(block.isPlaying).toBe(true)
            expect(block.isPaused).toBe(false)
        })
    })

    describe('playback', () => {
        it('should start with the video paused', () => {
            const video = createVideo()
            const block = new VideoBlock({ source: video })

            block.init()

            expect(block.isPlaying).toBe(false)
            expect(block.isPaused).toBe(false)
        })

        it('should play the video and update its state', () => {
            const video = createVideo()
            const block = new VideoBlock({ source: video })
            block.init()

            block.play()

            expect(video.play).toHaveBeenCalledTimes(1)
            expect(block.isPlaying).toBe(true)
            expect(block.isPaused).toBe(false)
        })

        it('should pause the video and update its state', () => {
            const video = createVideo()
            const block = new VideoBlock({ source: video })
            block.init()
            block.play()

            block.pause()

            expect(video.pause).toHaveBeenCalledTimes(1)
            expect(block.isPlaying).toBe(false)
            expect(block.isPaused).toBe(true)
        })
    })

    describe('animation', () => {
        it('should call onPlay with the animation timestamp', () => {
            const video = createVideo()
            const onPlay = vi.fn()
            const block = new VideoBlock({ source: video, onPlay })
            const addAnimation = vi.spyOn(block, '__addAnimation')
            block.init()
            const animator = addAnimation.mock.calls[0][1]
            block.play()

            animator(123)

            expect(onPlay).toHaveBeenCalledWith(123)
        })

        it('should invoke a change on every animation frame', () => {
            const video = createVideo()
            const block = new VideoBlock({ source: video })
            const addAnimation = vi.spyOn(block, '__addAnimation')
            const invokeChange = vi
                .spyOn(block, '__invokeChange')
                .mockImplementation(() => undefined)
            block.init()
            const animator = addAnimation.mock.calls[0][1]

            animator(123)

            expect(invokeChange).toHaveBeenCalledTimes(1)
        })

        it('should not call onPlay while the video is paused', () => {
            const video = createVideo()
            const onPlay = vi.fn()
            const block = new VideoBlock({ source: video, onPlay })
            const addAnimation = vi.spyOn(block, '__addAnimation')
            block.init()
            const animator = addAnimation.mock.calls[0][1]
            block.pause()

            animator(123)

            expect(onPlay).not.toHaveBeenCalled()
        })

        it('should stop the animation when the media source is removed', () => {
            const video = createVideo()
            const onPlay = vi.fn()
            const block = new VideoBlock({ source: video, onPlay })
            const addAnimation = vi.spyOn(block, '__addAnimation')
            const invokeChange = vi
                .spyOn(block, '__invokeChange')
                .mockImplementation(() => undefined)
            block.init()
            const animator = addAnimation.mock.calls[0][1]
            block.mediaSource = undefined

            animator(123)

            expect(onPlay).not.toHaveBeenCalled()
            expect(invokeChange).not.toHaveBeenCalled()
        })

        it('should animate without an onPlay callback', () => {
            const video = createVideo()
            const block = new VideoBlock({ source: video })
            const addAnimation = vi.spyOn(block, '__addAnimation')
            block.init()
            const animator = addAnimation.mock.calls[0][1]
            block.play()

            expect(() => animator(123)).not.toThrow()
        })
    })
})
