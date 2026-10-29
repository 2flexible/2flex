import { describe, it, expect, afterEach, vi } from 'vitest'
import { Block, ImageBlock, ShapeBlock } from '@2flexible/2flex'
import { MediaLayoutBlock } from '../../shapes/MediaLayoutBlock'

const imageSource =
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='

describe('ImageBlock', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('constructor', () => {
        it('should create an ImageBlock instance', () => {
            expect(new ImageBlock({})).toBeInstanceOf(ImageBlock)
        })

        it('should create a MediaLayoutBlock instance', () => {
            expect(new ImageBlock({})).toBeInstanceOf(MediaLayoutBlock)
        })

        it('should create a ShapeBlock instance', () => {
            expect(new ImageBlock({})).toBeInstanceOf(ShapeBlock)
        })

        it('should create a Block instance', () => {
            expect(new ImageBlock({})).toBeInstanceOf(Block)
        })

        it('should keep the options it was created with', () => {
            const block = new ImageBlock({
                x: 12,
                y: 24,
                width: 140,
                height: 80,
                source: imageSource,
            })

            expect(block.x()).toBe(12)
            expect(block.y()).toBe(24)
            expect(block.width()).toBe(140)
            expect(block.height()).toBe(80)
            expect(block.source()).toBe(imageSource)
        })
    })

    describe('initialization', () => {
        it('should create an image from a string source', () => {
            const block = new ImageBlock({ source: imageSource })

            expect(block.mediaSource).toBeUndefined()

            block.init()

            expect(block.mediaSource).toBeInstanceOf(HTMLImageElement)
            expect((block.mediaSource as HTMLImageElement).src).toBe(
                imageSource
            )
        })

        it('should use a source factory instead of creating an image', () => {
            const source = vi.fn(() => new Image())
            const block = new ImageBlock({ source })

            block.init()

            expect(source).toHaveBeenCalledTimes(1)
        })

        it('should pass the current media source to the source factory', () => {
            const image = document.createElement('img')
            const source = vi.fn(() => image)
            const block = new ImageBlock({ source })

            block.init()

            expect(source).toHaveBeenCalledWith(undefined)
        })

        it('should redraw the media after the image loads', () => {
            const image = document.createElement('img')
            const source = vi.fn(() => image)
            const block = new ImageBlock({ source })
            const invokeChange = vi
                .spyOn(block, '__invokeChange')
                .mockImplementation(() => undefined)
            const drawMedia = vi
                .spyOn(block, '__drawMedia')
                .mockImplementation(() => undefined)

            block.init()
            image.dispatchEvent(new Event('load'))

            expect(invokeChange).toHaveBeenCalledTimes(1)
            expect(drawMedia).toHaveBeenCalledTimes(1)
        })
    })
})
