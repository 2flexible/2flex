import { describe, it, expect, afterEach, vi } from 'vitest'
import { Block, Canvas, ImageBlock, ShapeBlock } from '@2flexible/2flex'
import { MediaLayoutBlock } from '../../shapes/MediaLayoutBlock'
import { flush, removeCanvasElements, waitFor } from './helpers'

const imageSource =
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='

const brokenImage = 'data:image/png;base64,bm90YW5pbWFnZQ=='

const createImage = (width: number, height: number, color: string) => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')!
    context.fillStyle = color
    context.fillRect(0, 0, width, height)
    return canvas.toDataURL()
}

const pixelAt = (target: Canvas, x: number, y: number) =>
    Array.from(target.context!.getImageData(x, y, 1, 1).data)

describe('ImageBlock', () => {
    afterEach(() => {
        vi.restoreAllMocks()
        removeCanvasElements()
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

        it('should keep the image returned by the source factory', () => {
            const image = document.createElement('img')
            const source = vi.fn(() => image)
            const block = new ImageBlock({ source })

            block.init()

            expect(block.mediaSource).toBe(image)
        })

        it('should keep a source which is already a canvas image source', () => {
            const source = new OffscreenCanvas(20, 10)
            const block = new ImageBlock({ source })

            block.init()

            expect(block.mediaSource).toBe(source)
        })

        it('should not fail without a source', () => {
            const block = new ImageBlock({})

            expect(() => block.init()).not.toThrow()
            expect(block.mediaSource).toBeUndefined()
        })
    })

    describe('rendering', () => {
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
            expect(drawMedia).not.toHaveBeenCalled()
        })

        it('should redraw the media after the image failed to load', () => {
            const image = document.createElement('img')
            const source = vi.fn(() => image)
            const block = new ImageBlock({ source })
            const invokeChange = vi
                .spyOn(block, '__invokeChange')
                .mockImplementation(() => undefined)

            block.init()
            image.dispatchEvent(new Event('error'))

            expect(invokeChange).toHaveBeenCalledTimes(1)
        })

        it('should redraw the media of a string source after it loaded', () => {
            const block = new ImageBlock({ source: imageSource })
            const invokeChange = vi
                .spyOn(block, '__invokeChange')
                .mockImplementation(() => undefined)

            block.init()
            invokeChange.mockClear()
            ;(block.mediaSource as HTMLImageElement).dispatchEvent(
                new Event('load')
            )

            expect(invokeChange).toHaveBeenCalledTimes(1)
        })

        it('should redraw the media of an already loaded image', () => {
            const image = document.createElement('img')
            const source = vi.fn(() => image)
            const block = new ImageBlock({ source })
            const invokeChange = vi
                .spyOn(block, '__invokeChange')
                .mockImplementation(() => undefined)

            Object.defineProperty(image, 'complete', { value: true })
            Object.defineProperty(image, 'naturalWidth', { value: 20 })
            Object.defineProperty(image, 'naturalHeight', { value: 10 })

            block.init()

            expect(invokeChange).toHaveBeenCalledTimes(1)
        })

        it('should redraw the media of a source which is drawable right away', () => {
            const block = new ImageBlock({
                source: new OffscreenCanvas(20, 10),
            })
            const invokeChange = vi
                .spyOn(block, '__invokeChange')
                .mockImplementation(() => undefined)

            block.init()

            expect(invokeChange).toHaveBeenCalledTimes(1)
        })
    })

    describe('rendering on a canvas', () => {
        it('should draw the image without any interaction', async () => {
            const canvas = new Canvas('myCanvas', 200, 200)
            const block = new ImageBlock({
                source: createImage(40, 30, 'red'),
                x: 0,
                y: 0,
                width: 100,
                height: 80,
            })

            canvas.add(block)

            const drawn = await waitFor(() => pixelAt(canvas, 50, 40)[3] > 0)

            expect(drawn).toBe(true)
            expect(pixelAt(canvas, 50, 40)).toEqual([255, 0, 0, 255])
        })

        it('should draw the image of a source factory', async () => {
            const canvas = new Canvas('myCanvas', 200, 200)
            const image = new Image()
            image.src = createImage(40, 30, 'red')
            const block = new ImageBlock({
                source: () => image,
                x: 0,
                y: 0,
                width: 100,
                height: 80,
            })

            canvas.add(block)

            const drawn = await waitFor(() => pixelAt(canvas, 50, 40)[3] > 0)

            expect(drawn).toBe(true)
            expect(pixelAt(canvas, 50, 40)).toEqual([255, 0, 0, 255])
        })

        it('should draw an image which is already loaded', async () => {
            const canvas = new Canvas('myCanvas', 200, 200)
            const image = new Image()
            image.src = createImage(40, 30, 'red')
            await image.decode()
            const block = new ImageBlock({
                source: image,
                x: 0,
                y: 0,
                width: 100,
                height: 80,
            })

            canvas.add(block)
            await flush(3)

            expect(pixelAt(canvas, 50, 40)).toEqual([255, 0, 0, 255])
        })

        it('should keep rendering when an image failed to load', async () => {
            const canvas = new Canvas('myCanvas', 200, 200)
            const block = new ImageBlock({
                source: brokenImage,
                x: 0,
                y: 0,
                width: 100,
                height: 80,
            })

            canvas.add(block)
            await flush(5)

            expect(pixelAt(canvas, 50, 40)).toEqual([0, 0, 0, 0])

            const working = new ImageBlock({
                source: createImage(40, 30, 'blue'),
                x: 0,
                y: 100,
                width: 100,
                height: 80,
            })

            canvas.add(working)

            const drawn = await waitFor(() => pixelAt(canvas, 50, 140)[3] > 0)

            expect(drawn).toBe(true)
            expect(pixelAt(canvas, 50, 140)).toEqual([0, 0, 255, 255])
        })
    })
})
