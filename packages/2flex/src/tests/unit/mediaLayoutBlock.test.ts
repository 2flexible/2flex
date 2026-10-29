import { describe, it, expect, afterEach, vi } from 'vitest'
import { Block, ShapeBlock } from '@2flexible/2flex'
import { MediaLayoutBlock } from '../../shapes/MediaLayoutBlock'

type MediaOptions = ConstructorParameters<typeof MediaLayoutBlock>[0]

const createSource = (width: number, height: number) =>
    new OffscreenCanvas(width, height)

const createDrawingContext = () => {
    const offscreen = new OffscreenCanvas(400, 400)
    const context = offscreen.getContext('2d')!
    const drawImage = vi
        .spyOn(context, 'drawImage')
        .mockImplementation(() => undefined)
    return { context, drawImage }
}

const createBlock = (
    context: OffscreenCanvasRenderingContext2D,
    options: Partial<MediaOptions> = {},
    source: CanvasImageSource = createSource(200, 100)
) => {
    const block = new MediaLayoutBlock({
        x: 10,
        y: 20,
        width: 100,
        height: 100,
        ...options,
    })
    block.context = context
    block.mediaSource = source
    return block
}

describe('MediaLayoutBlock', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('constructor', () => {
        it('should create a MediaLayoutBlock instance', () => {
            expect(new MediaLayoutBlock({})).toBeInstanceOf(MediaLayoutBlock)
        })

        it('should create a ShapeBlock instance', () => {
            expect(new MediaLayoutBlock({})).toBeInstanceOf(ShapeBlock)
        })

        it('should create a Block instance', () => {
            expect(new MediaLayoutBlock({})).toBeInstanceOf(Block)
        })

        it('should keep the options it was created with', () => {
            const block = new MediaLayoutBlock({
                x: 12,
                y: 24,
                width: 140,
                height: 80,
                source: 'image.png',
                repeatX: 2,
                repeatY: 3,
                clipX: 4,
                clipY: 5,
                clipWidth: 60,
                clipHeight: 70,
                objectFit: 'cover',
            })

            expect(block.x()).toBe(12)
            expect(block.y()).toBe(24)
            expect(block.width()).toBe(140)
            expect(block.height()).toBe(80)
            expect(block.source()).toBe('image.png')
            expect(block.repeatX()).toBe(2)
            expect(block.repeatY()).toBe(3)
            expect(block.clipX()).toBe(4)
            expect(block.clipY()).toBe(5)
            expect(block.clipWidth()).toBe(60)
            expect(block.clipHeight()).toBe(70)
            expect(block.objectFit()).toBe('cover')
        })
    })

    describe('option defaults', () => {
        const defaults: [string, unknown][] = [
            ['source', undefined],
            ['repeatX', undefined],
            ['repeatY', undefined],
            ['clipX', 0],
            ['clipY', 0],
            ['clipWidth', undefined],
            ['clipHeight', undefined],
            ['objectFit', 'scale-down'],
        ]

        for (const [option, value] of defaults) {
            it(`should default ${option} to ${value}`, () => {
                const block = new MediaLayoutBlock({})
                expect(block[option]()).toStrictEqual(value)
            })
        }
    })

    describe('drawing', () => {
        it('should not draw without a media source', () => {
            const { context, drawImage } = createDrawingContext()
            const block = createBlock(context)
            block.mediaSource = undefined

            block.draw()

            expect(drawImage).not.toHaveBeenCalled()
        })

        it('should not draw without a context', () => {
            const block = new MediaLayoutBlock({
                width: 100,
                height: 100,
            })
            block.mediaSource = createSource(200, 100)

            expect(() => block.draw()).not.toThrow()
        })

        it('should draw a scale-down image centered in the block', () => {
            const { context, drawImage } = createDrawingContext()
            const source = createSource(200, 100)
            const block = createBlock(
                context,
                { objectFit: 'scale-down' },
                source
            )

            block.draw()

            expect(drawImage).toHaveBeenCalledWith(
                source,
                0,
                0,
                200,
                100,
                10,
                45,
                100,
                50
            )
        })

        it('should draw a contained image with the source crop', () => {
            const { context, drawImage } = createDrawingContext()
            const source = createSource(200, 100)
            const block = createBlock(context, { objectFit: 'contain' }, source)

            block.draw()

            expect(drawImage).toHaveBeenCalledWith(
                source,
                0,
                0,
                400,
                200,
                10,
                20,
                200,
                100
            )
        })

        it('should draw a covered image with a centered source crop', () => {
            const { context, drawImage } = createDrawingContext()
            const source = createSource(200, 100)
            const block = createBlock(context, { objectFit: 'cover' }, source)

            block.draw()

            expect(drawImage).toHaveBeenCalledWith(
                source,
                50,
                0,
                100,
                100,
                10,
                20,
                100,
                100
            )
        })

        it('should draw a filled image across the whole block', () => {
            const { context, drawImage } = createDrawingContext()
            const source = createSource(200, 100)
            const block = createBlock(context, { objectFit: 'fill' }, source)

            block.draw()

            expect(drawImage).toHaveBeenCalledWith(
                source,
                0,
                0,
                200,
                100,
                10,
                20,
                100,
                100
            )
        })

        it('should use the clip coordinates as the source origin', () => {
            const { context, drawImage } = createDrawingContext()
            const source = createSource(200, 100)
            const block = createBlock(
                context,
                { objectFit: 'fill', clipX: 5, clipY: 7 },
                source
            )

            block.draw()

            expect(drawImage).toHaveBeenCalledWith(
                source,
                5,
                7,
                200,
                100,
                10,
                20,
                100,
                100
            )
        })
    })

    describe('repetition', () => {
        it('should repeat an image horizontally', () => {
            const { context, drawImage } = createDrawingContext()
            const source = createSource(20, 20)
            const block = createBlock(context, { repeatX: 2 }, source)

            block.draw()

            expect(drawImage).toHaveBeenCalledTimes(2)
            expect(drawImage).toHaveBeenNthCalledWith(
                1,
                source,
                0,
                0,
                20,
                20,
                10,
                20,
                50,
                100
            )
            expect(drawImage).toHaveBeenNthCalledWith(
                2,
                source,
                0,
                0,
                20,
                20,
                60,
                20,
                50,
                100
            )
        })

        it('should repeat an image vertically', () => {
            const { context, drawImage } = createDrawingContext()
            const source = createSource(20, 20)
            const block = createBlock(context, { repeatY: 2 }, source)

            block.draw()

            expect(drawImage).toHaveBeenCalledTimes(2)
            expect(drawImage).toHaveBeenNthCalledWith(
                1,
                source,
                0,
                0,
                20,
                20,
                10,
                20,
                100,
                50
            )
            expect(drawImage).toHaveBeenNthCalledWith(
                2,
                source,
                0,
                0,
                20,
                20,
                10,
                70,
                100,
                50
            )
        })

        it('should repeat an image on both axes', () => {
            const { context, drawImage } = createDrawingContext()
            const source = createSource(20, 20)
            const block = createBlock(
                context,
                { repeatX: 2, repeatY: 2 },
                source
            )

            block.draw()

            expect(drawImage).toHaveBeenCalledTimes(4)
        })

        it('should repeat an image at its source size for fill', () => {
            const { context, drawImage } = createDrawingContext()
            const source = createSource(20, 20)
            const block = createBlock(context, { repeatX: 'fill' }, source)

            block.draw()

            expect(drawImage).toHaveBeenCalledTimes(5)
            expect(drawImage).toHaveBeenLastCalledWith(
                source,
                0,
                0,
                20,
                20,
                90,
                20,
                20,
                100
            )
        })

        it('should use the clip coordinates for repeated source crops', () => {
            const { context, drawImage } = createDrawingContext()
            const source = createSource(20, 20)
            const block = createBlock(
                context,
                { repeatX: 2, clipX: 4, clipY: 3 },
                source
            )

            block.draw()

            expect(drawImage).toHaveBeenCalledWith(
                source,
                4,
                3,
                16,
                17,
                10,
                20,
                50,
                100
            )
        })

        it('should not repeat an image with no dimensions', () => {
            const { context, drawImage } = createDrawingContext()
            const source = createSource(0, 20)
            const block = createBlock(context, { repeatX: 2 }, source)

            block.draw()

            expect(drawImage).not.toHaveBeenCalled()
        })
    })

    describe('source dimensions', () => {
        it('should use the intrinsic dimensions of a video', () => {
            const { context, drawImage } = createDrawingContext()
            const video = document.createElement('video')
            Object.defineProperties(video, {
                videoWidth: { value: 320 },
                videoHeight: { value: 180 },
            })
            const block = createBlock(context, { objectFit: 'fill' }, video)

            block.draw()

            expect(drawImage).toHaveBeenCalledWith(
                video,
                0,
                0,
                320,
                180,
                10,
                20,
                100,
                100
            )
        })

        it('should use the display dimensions of a video frame', () => {
            const { context, drawImage } = createDrawingContext()
            const frame = new VideoFrame(new Uint8Array(40 * 30 * 4), {
                format: 'RGBA',
                codedWidth: 40,
                codedHeight: 30,
                timestamp: 0,
            })
            const block = createBlock(context, { objectFit: 'fill' }, frame)

            block.draw()
            frame.close()

            expect(drawImage).toHaveBeenCalledWith(
                frame,
                0,
                0,
                40,
                30,
                10,
                20,
                100,
                100
            )
        })

        it('should use the intrinsic dimensions of an SVG image', () => {
            const { context, drawImage } = createDrawingContext()
            const image = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'image'
            ) as SVGImageElement
            image.width.baseVal.value = 120
            image.height.baseVal.value = 80
            const block = createBlock(context, { objectFit: 'fill' }, image)

            block.draw()

            expect(drawImage).toHaveBeenCalledWith(
                image,
                0,
                0,
                120,
                80,
                10,
                20,
                100,
                100
            )
        })

        it('should fall back to the rendered dimensions of an SVG image', () => {
            const { context, drawImage } = createDrawingContext()
            const image = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'image'
            ) as SVGImageElement
            vi.spyOn(image, 'getBoundingClientRect').mockReturnValue(
                new DOMRect(0, 0, 90, 60)
            )
            const block = createBlock(context, { objectFit: 'fill' }, image)

            block.draw()

            expect(drawImage).toHaveBeenCalledWith(
                image,
                0,
                0,
                90,
                60,
                10,
                20,
                100,
                100
            )
        })
    })
})
