import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { page } from 'vitest/browser'
import { Block, Canvas, ShapeBlock } from '@2flexible/2flex'
import type { IShapeOptions } from '../../ShapeBlock'
import { flush, removeCanvasElements } from './helpers'

let shape: ShapeBlock
let canvas: Canvas

// the tiles are drawn into the canvas element one to one, so the pixels are
// addressed in the same coordinates as the blocks
const pixelAt = (x: number, y: number) =>
    Array.from(canvas.context!.getImageData(x, y, 1, 1).data)

// tells if anything was painted inside the given area
const paintedArea = (x: number, y: number, width: number, height: number) => {
    const pixels = canvas.context!.getImageData(x, y, width, height).data
    for (let i = 3; i < pixels.length; i += 4) if (pixels[i] !== 0) return true
    return false
}

// the option methods are added to the prototype while the block is created,
// so they are reached through a loose index
const optionValue = (block: ShapeBlock, option: string) =>
    (block as unknown as Record<string, () => unknown>)[option]()

const setOptionValue = (block: ShapeBlock, option: string, value: unknown) =>
    (block as unknown as Record<string, (value: unknown) => unknown>)[option](
        value
    )

// an image source for the image drawing
const createSource = (color = 'red') => {
    const source = document.createElement('canvas')
    source.width = 10
    source.height = 10
    const context = source.getContext('2d')!
    context.fillStyle = color
    context.fillRect(0, 0, 10, 10)
    return source
}

// an image source with a fine detail, so the scaling of it is visible
const createDetailSource = () => {
    const source = document.createElement('canvas')
    source.width = 10
    source.height = 10
    const context = source.getContext('2d')!
    context.fillStyle = 'white'
    context.fillRect(0, 0, 10, 10)
    context.strokeStyle = 'black'
    context.lineWidth = 2
    context.beginPath()
    context.moveTo(0, 10)
    context.lineTo(10, 0)
    context.stroke()
    return source
}

// an image source with a corner, so the repetition of a pattern is visible
const createPatternSource = () => {
    const source = document.createElement('canvas')
    source.width = 10
    source.height = 10
    const context = source.getContext('2d')!
    context.fillStyle = 'white'
    context.fillRect(0, 0, 10, 10)
    context.fillStyle = 'red'
    context.fillRect(0, 0, 5, 5)
    return source
}

// the styles are applied to the context before the shape draws itself, so the
// state of the context has to be captured while it draws
const captureContext = (block: ShapeBlock) => {
    const captured: Record<string, unknown> = {}
    block.draw = () => {
        const context = block.context!
        captured.filter = context.filter
        captured.fillStyle = context.fillStyle
        captured.strokeStyle = context.strokeStyle
        captured.globalAlpha = context.globalAlpha
        captured.lineWidth = context.lineWidth
    }
    return captured
}

describe('ShapeBlock', () => {
    afterEach(() => {
        removeCanvasElements()
    })

    describe('constructor', () => {
        it('should create a ShapeBlock instance', () => {
            shape = new ShapeBlock({})
            expect(shape).toBeInstanceOf(ShapeBlock)
        })
        it('should create a Block instance', () => {
            shape = new ShapeBlock({})
            expect(shape).toBeInstanceOf(Block)
        })
        it('should not throw when created with options', () => {
            expect(
                () =>
                    new ShapeBlock({
                        x: 10,
                        y: 20,
                        width: 100,
                        height: 100,
                        fill: { fill: true },
                        fillStyle: 'red',
                    })
            ).not.toThrow()
        })
        it('should keep the options it was created with', () => {
            shape = new ShapeBlock({ fillStyle: 'red' })
            expect(shape.fillStyle()).toBe('red')
        })
    })

    describe('option values', () => {
        const defaults: [string, unknown][] = [
            ['clip', undefined],
            ['fill', undefined],
            ['fillStyle', undefined],
            ['stroke', undefined],
            ['strokeStyle', undefined],
            ['lineWidth', undefined],
            ['lineCap', undefined],
            ['lineJoin', undefined],
            ['miterLimit', undefined],
            ['lineDash', undefined],
            ['lineDashOffset', undefined],
            ['moveTo', undefined],
            ['lineTo', undefined],
            ['quadraticCurveTo', undefined],
            ['bezierCurveTo', undefined],
            ['rect', undefined],
            ['roundRect', undefined],
            ['fillRect', undefined],
            ['strokeRect', undefined],
            ['arc', undefined],
            ['arcTo', undefined],
            ['ellipse', undefined],
            ['linearGradient', undefined],
            ['radialGradient', undefined],
            ['conicGradient', undefined],
            ['colorStops', undefined],
            ['pattern', undefined],
            ['blur', undefined],
            ['brightness', undefined],
            ['contrast', undefined],
            ['dropShadow', undefined],
            ['grayscale', undefined],
            ['hueRotate', undefined],
            ['saturate', undefined],
            ['sepia', undefined],
            ['shadowBlur', undefined],
            ['shadowColor', undefined],
            ['shadowOffsetX', 0],
            ['shadowOffsetY', 0],
            ['font', undefined],
            ['fillText', undefined],
            ['strokeText', undefined],
            ['fontStretch', undefined],
            ['fontKerning', undefined],
            ['fontVariantCaps', undefined],
            ['textBaseline', undefined],
            ['textRendering', undefined],
            ['wordSpacing', undefined],
            ['letterSpacing', undefined],
            ['direction', undefined],
            ['textAlign', undefined],
            ['drawImage', undefined],
            ['imageSmoothingEnabled', undefined],
            ['imageSmoothingQuality', undefined],
            ['globalCompositeOperation', undefined],
            ['globalAlpha', undefined],
        ]

        for (const [option, value] of defaults) {
            it(`should default ${option} to ${value}`, () => {
                const block = new ShapeBlock({})
                expect(optionValue(block, option)).toStrictEqual(value)
            })
        }

        const values: [string, unknown][] = [
            ['clip', { fillRule: 'evenodd' }],
            ['fill', { fill: true }],
            ['fillStyle', 'rgba(255, 0, 0, 1)'],
            ['stroke', { stroke: true }],
            ['strokeStyle', 'rgba(0, 0, 255, 1)'],
            ['lineWidth', 4],
            ['lineCap', 'round'],
            ['lineJoin', 'bevel'],
            ['miterLimit', 10],
            ['lineDash', [4, 2]],
            ['lineDashOffset', 2],
            ['moveTo', { x: 3, y: 7 }],
            ['lineTo', { x: 10, y: 20 }],
            ['quadraticCurveTo', { cpx1: 1, cpy1: 2, endX: 5, endY: 6 }],
            [
                'bezierCurveTo',
                { cpx1: 1, cpy1: 2, cpx2: 3, cpy2: 4, endX: 5, endY: 6 },
            ],
            ['rect', { x: 2, y: 3, width: 40, height: 50 }],
            [
                'roundRect',
                {
                    x: 2,
                    y: 3,
                    width: 40,
                    height: 50,
                    borderRadius: [4, 4, 4, 4],
                },
            ],
            ['fillRect', { x: 2, y: 3, width: 40, height: 50 }],
            ['strokeRect', { x: 2, y: 3, width: 40, height: 50 }],
            [
                'arc',
                { x: 10, y: 10, radius: 5, startAngle: 0, endAngle: Math.PI },
            ],
            ['arcTo', { x1: 1, y1: 2, x2: 3, y2: 4, radius: 5 }],
            [
                'ellipse',
                {
                    x: 10,
                    y: 10,
                    radiusX: 6,
                    radiusY: 4,
                    rotation: 0,
                    startAngle: 0,
                    endAngle: Math.PI,
                },
            ],
            ['linearGradient', { x0: 0, y0: 0, x1: 20, y1: 20 }],
            ['radialGradient', { x0: 0, y0: 0, r0: 1, x1: 20, y1: 20, r1: 10 }],
            ['conicGradient', { angle: 0, x: 10, y: 10 }],
            [
                'colorStops',
                [
                    { stop: 0, color: 'red' },
                    { stop: 1, color: 'blue' },
                ],
            ],
            ['blur', 4],
            ['brightness', 120],
            ['contrast', 125],
            ['dropShadow', [2, 2, 4, 'rgba(0, 0, 0, 0.4)']],
            ['grayscale', 60],
            ['hueRotate', 90],
            ['saturate', 110],
            ['sepia', 35],
            ['shadowBlur', 8],
            ['shadowColor', 'rgba(0, 0, 0, 0.5)'],
            ['shadowOffsetX', 6],
            ['shadowOffsetY', 7],
            ['font', 'normal normal 400 16px sans-serif'],
            ['fillText', { text: 'shape', x: 10, y: 20 }],
            ['strokeText', { text: 'shape', x: 10, y: 20 }],
            ['fontStretch', 'expanded'],
            ['fontKerning', 'normal'],
            ['fontVariantCaps', 'small-caps'],
            ['textBaseline', 'middle'],
            ['textRendering', 'optimizeSpeed'],
            ['wordSpacing', 4],
            ['letterSpacing', 2],
            ['direction', 'rtl'],
            ['textAlign', 'center'],
            ['imageSmoothingEnabled', true],
            ['imageSmoothingQuality', 'high'],
            ['globalCompositeOperation', 'multiply'],
            ['globalAlpha', 0.5],
        ]

        for (const [option, value] of values) {
            it(`should set ${option} to the given value`, () => {
                const block = new ShapeBlock({})
                expect(setOptionValue(block, option, value)).toStrictEqual(
                    value
                )
                expect(optionValue(block, option)).toStrictEqual(value)
            })
        }

        it('should convert a named color', () => {
            const block = new ShapeBlock({})
            expect(setOptionValue(block, 'fillStyle', 'red')).toBe(
                'rgba(255, 0, 0, 1)'
            )
        })
        it('should convert a hexadecimal color', () => {
            const block = new ShapeBlock({})
            expect(setOptionValue(block, 'strokeStyle', '#800080')).toBe(
                'rgba(128, 0, 128, 1)'
            )
        })
    })

    describe('without a context', () => {
        beforeEach(() => {
            shape = new ShapeBlock({ x: 0, y: 0, width: 100, height: 100 })
        })
        it('should not find a point in the path', () => {
            expect(shape.pointInPath({ x: 0, y: 0 })).toBe(false)
        })
        it('should not find a point in the stroke', () => {
            expect(shape.pointInStroke({ x: 0, y: 0 })).toBe(false)
        })
        it('should not measure a text', () => {
            expect(shape.measureText('shape text')).toBeUndefined()
        })
        it('should not throw on the path helpers', () => {
            expect(() => {
                shape.beginPath()
                shape.closePath()
            }).not.toThrow()
        })
        it('should not throw while the options are set', () => {
            expect(() => {
                shape.fill({ fill: true })
                shape.fillStyle('rgba(255, 0, 0, 1)')
                shape.stroke({ stroke: true })
                shape.strokeStyle('rgba(0, 0, 255, 1)')
                shape.lineWidth(4)
                shape.lineCap('round')
                shape.lineJoin('bevel')
                shape.miterLimit(10)
                shape.lineDash([4, 2])
                shape.lineDashOffset(2)
                shape.moveTo({ x: 1, y: 2 })
                shape.lineTo({ x: 3, y: 4 })
                shape.quadraticCurveTo({
                    cpx1: 1,
                    cpy1: 2,
                    endX: 3,
                    endY: 4,
                })
                shape.bezierCurveTo({
                    cpx1: 1,
                    cpy1: 2,
                    cpx2: 3,
                    cpy2: 4,
                    endX: 5,
                    endY: 6,
                })
                shape.rect({ x: 0, y: 0, width: 10, height: 10 })
                shape.roundRect({
                    x: 0,
                    y: 0,
                    width: 10,
                    height: 10,
                    borderRadius: [2, 2, 2, 2],
                })
                shape.fillRect({ x: 0, y: 0, width: 10, height: 10 })
                shape.strokeRect({ x: 0, y: 0, width: 10, height: 10 })
                shape.arc({
                    x: 1,
                    y: 2,
                    radius: 3,
                    startAngle: 0,
                    endAngle: Math.PI,
                })
                shape.arcTo({ x1: 1, y1: 2, x2: 3, y2: 4, radius: 5 })
                shape.ellipse({
                    x: 1,
                    y: 2,
                    radiusX: 3,
                    radiusY: 2,
                    rotation: 0,
                    startAngle: 0,
                    endAngle: Math.PI,
                })
                shape.clip({ fillRule: 'evenodd' })
                shape.shadowBlur(4)
                shape.shadowColor('rgba(0, 0, 0, 0.5)')
                shape.shadowOffsetX(2)
                shape.shadowOffsetY(3)
                shape.font('16px sans-serif')
                shape.fillText({ text: 'shape', x: 1, y: 2 })
                shape.strokeText({ text: 'shape', x: 1, y: 2 })
                shape.textAlign('center')
                shape.textBaseline('middle')
                shape.wordSpacing(4)
                shape.letterSpacing(2)
                shape.imageSmoothingEnabled(true)
                shape.imageSmoothingQuality('high')
                shape.globalAlpha(0.5)
                shape.globalCompositeOperation('multiply')
                shape.blur(4)
                shape.brightness(120)
                shape.contrast(125)
                shape.grayscale(60)
                shape.hueRotate(90)
                shape.saturate(110)
                shape.sepia(35)
                shape.dropShadow([2, 2, 4, 'rgba(0, 0, 0, 0.4)'])
            }).not.toThrow()
        })
    })

    describe('with a context', () => {
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            shape = new ShapeBlock({ x: 0, y: 0, width: 100, height: 100 })
            canvas.add(shape)
            await flush()
        })

        it('should get a rendering context', () => {
            expect(shape.context).toBeDefined()
            expect(shape.context).toBeInstanceOf(
                OffscreenCanvasRenderingContext2D
            )
        })

        describe('styles', () => {
            it('should apply the fill style', () => {
                shape.fillStyle('rgba(255, 0, 0, 1)')
                expect(shape.context!.fillStyle).toBe('#ff0000')
            })
            it('should apply the stroke style', () => {
                shape.strokeStyle('rgba(0, 0, 255, 1)')
                expect(shape.context!.strokeStyle).toBe('#0000ff')
            })
            it('should apply the line width', () => {
                shape.lineWidth(4)
                expect(shape.context!.lineWidth).toBe(4)
            })
            it('should apply the line cap', () => {
                shape.lineCap('round')
                expect(shape.context!.lineCap).toBe('round')
            })
            it('should apply the line join', () => {
                shape.lineJoin('bevel')
                expect(shape.context!.lineJoin).toBe('bevel')
            })
            it('should apply the miter limit', () => {
                shape.miterLimit(10)
                expect(shape.context!.miterLimit).toBe(10)
            })
            it('should apply the line dash', () => {
                shape.lineDash([4, 2])
                expect(shape.context!.getLineDash()).toEqual([4, 2])
            })
            it('should apply the line dash offset', () => {
                shape.lineDashOffset(2)
                expect(shape.context!.lineDashOffset).toBe(2)
            })
            it('should apply the shadow blur', () => {
                shape.shadowBlur(8)
                expect(shape.context!.shadowBlur).toBe(8)
            })
            it('should apply the shadow color', () => {
                shape.shadowColor('rgba(0, 0, 0, 0.5)')
                expect(shape.context!.shadowColor).toBe('rgba(0, 0, 0, 0.5)')
            })
            it('should apply the shadow offsets', () => {
                shape.shadowOffsetX(6)
                shape.shadowOffsetY(7)
                expect(shape.context!.shadowOffsetX).toBe(6)
                expect(shape.context!.shadowOffsetY).toBe(7)
            })
            it('should apply the image smoothing', () => {
                shape.imageSmoothingEnabled(false)
                shape.imageSmoothingQuality('high')
                expect(shape.context!.imageSmoothingEnabled).toBe(false)
                expect(shape.context!.imageSmoothingQuality).toBe('high')
            })
            it('should apply the compositing', () => {
                shape.globalAlpha(0.5)
                shape.globalCompositeOperation('multiply')
                expect(shape.context!.globalAlpha).toBe(0.5)
                expect(shape.context!.globalCompositeOperation).toBe('multiply')
            })
            it('should resolve a relative line width', () => {
                shape.lineWidth('20%')
                expect(shape.lineWidth()).toBe(80)
            })
        })

        describe('text styles', () => {
            it('should apply the font', () => {
                shape.font('normal normal 400 16px sans-serif')
                expect(shape.context!.font).toContain('16px')
            })
            it('should apply the font stretch', () => {
                shape.fontStretch('expanded')
                expect(shape.context!.fontStretch).toBe('expanded')
            })
            it('should apply the font kerning', () => {
                shape.fontKerning('normal')
                expect(shape.context!.fontKerning).toBe('normal')
            })
            it('should apply the font variant caps', () => {
                shape.fontVariantCaps('small-caps')
                expect(shape.context!.fontVariantCaps).toBe('small-caps')
            })
            it('should apply the text align', () => {
                shape.textAlign('center')
                expect(shape.context!.textAlign).toBe('center')
            })
            it('should apply the text baseline', () => {
                shape.textBaseline('middle')
                expect(shape.context!.textBaseline).toBe('middle')
            })
            it('should apply the text rendering', () => {
                shape.textRendering('optimizeSpeed')
                expect(shape.context!.textRendering).toBe('optimizeSpeed')
            })
            it('should apply the direction', () => {
                shape.direction('rtl')
                expect(shape.context!.direction).toBe('rtl')
            })
            it('should apply the word spacing', () => {
                shape.wordSpacing(4)
                expect(shape.context!.wordSpacing).toBe('4px')
            })
            it('should apply the letter spacing', () => {
                shape.letterSpacing(2)
                expect(shape.context!.letterSpacing).toBe('2px')
            })
            it('should measure a text', () => {
                const metrics = shape.measureText('shape text')
                expect(metrics).toBeDefined()
                expect(metrics!.width).toBeGreaterThan(0)
            })
        })

        describe('gradients and patterns', () => {
            it('should use the linear gradient as fill style', () => {
                shape.linearGradient({ x0: 0, y0: 0, x1: 20, y1: 20 })
                shape.fillStyle('rgba(255, 0, 0, 1)')
                const style = shape.context!.fillStyle as unknown
                expect(typeof (style as CanvasGradient).addColorStop).toBe(
                    'function'
                )
            })
            it('should use the radial gradient as fill style', () => {
                shape.radialGradient({
                    x0: 0,
                    y0: 0,
                    r0: 1,
                    x1: 20,
                    y1: 20,
                    r1: 10,
                })
                shape.fillStyle('rgba(255, 0, 0, 1)')
                const style = shape.context!.fillStyle as unknown
                expect(typeof (style as CanvasGradient).addColorStop).toBe(
                    'function'
                )
            })
            it('should use the conic gradient as fill style', () => {
                shape.conicGradient({ angle: 0, x: 10, y: 10 })
                shape.fillStyle('rgba(255, 0, 0, 1)')
                const style = shape.context!.fillStyle as unknown
                expect(typeof (style as CanvasGradient).addColorStop).toBe(
                    'function'
                )
            })
            it('should use the pattern as fill style', () => {
                shape.pattern({
                    image: createSource(),
                    repetition: 'repeat',
                })
                shape.fillStyle('rgba(255, 0, 0, 1)')
                const style = shape.context!.fillStyle as unknown
                expect(typeof (style as CanvasPattern).setTransform).toBe(
                    'function'
                )
            })
            it('should paint the gradient of the color stops', async () => {
                const gradient = new ShapeBlock({
                    x: 0,
                    y: 0,
                    width: 100,
                    height: 50,
                    linearGradient: { x0: 0, y0: 0, x1: 50, y1: 0 },
                    colorStops: [
                        { stop: 0, color: 'red' },
                        { stop: 1, color: 'blue' },
                    ],
                    fillStyle: 'rgba(255, 0, 0, 1)',
                    fill: { fill: true },
                    rect: { x: 0, y: 0, width: 50, height: 50 },
                })
                canvas.add(gradient)
                await flush()
                const left = pixelAt(2, 25)
                const right = pixelAt(47, 25)
                expect(left[0]).toBeGreaterThan(200)
                expect(left[2]).toBeLessThan(60)
                expect(right[2]).toBeGreaterThan(200)
                expect(right[0]).toBeLessThan(60)
            })
        })

        describe('filters', () => {
            it('should apply the filters to the context', async () => {
                const captured = captureContext(shape)
                shape.blur(4)
                shape.brightness(120)
                canvas.demandInvoke(shape)
                await flush()
                expect(captured.filter).toContain('blur(4px)')
                expect(captured.filter).toContain('brightness(120%)')
            })
            it('should apply every filter to the context', async () => {
                const captured = captureContext(shape)
                shape.blur(4)
                shape.brightness(120)
                shape.contrast(125)
                shape.grayscale(60)
                shape.hueRotate(90)
                shape.saturate(110)
                shape.sepia(35)
                shape.dropShadow([2, 2, 4, 'rgba(0, 0, 0, 0.4)'])
                canvas.demandInvoke(shape)
                await flush()
                expect(captured.filter).toContain('blur(4px)')
                expect(captured.filter).toContain('brightness(120%)')
                expect(captured.filter).toContain('contrast(125%)')
                expect(captured.filter).toContain('grayscale(60%)')
                expect(captured.filter).toContain('hue-rotate(90deg)')
                expect(captured.filter).toContain('saturate(110%)')
                expect(captured.filter).toContain('sepia(35%)')
                expect(captured.filter).toContain(
                    'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.4))'
                )
            })
        })

        describe('paths', () => {
            it('should find a point inside the path', () => {
                shape.beginPath()
                shape.rect({ x: 0, y: 0, width: 50, height: 50 })
                expect(shape.pointInPath({ x: 10, y: 10 })).toBe(true)
                expect(shape.pointInPath({ x: 100, y: 100 })).toBe(false)
            })
            it('should find a point inside a given path', () => {
                const path = new Path2D()
                path.rect(0, 0, 50, 50)
                expect(shape.pointInPath({ x: 10, y: 10, path })).toBe(true)
                expect(shape.pointInPath({ x: 100, y: 100, path })).toBe(false)
            })
            it('should find a point on the stroke', () => {
                shape.beginPath()
                shape.moveTo({ x: 0, y: 25 })
                shape.lineTo({ x: 50, y: 25 })
                expect(shape.pointInStroke({ x: 25, y: 25 })).toBe(true)
                expect(shape.pointInStroke({ x: 25, y: 40 })).toBe(false)
            })
            it('should paint the filled shape', async () => {
                const filled = new ShapeBlock({
                    x: 0,
                    y: 0,
                    width: 100,
                    height: 100,
                    fill: { fill: true },
                    fillStyle: 'rgba(255, 0, 0, 1)',
                    rect: { x: 0, y: 0, width: 50, height: 50 },
                })
                canvas.add(filled)
                await flush()
                expect(pixelAt(10, 10)).toEqual([255, 0, 0, 255])
                expect(pixelAt(60, 10)).toEqual([0, 0, 0, 0])
            })
            it('should not paint a shape without fill', async () => {
                const unfilled = new ShapeBlock({
                    x: 0,
                    y: 0,
                    width: 100,
                    height: 100,
                    fill: { fill: false },
                    fillStyle: 'rgba(255, 0, 0, 1)',
                    rect: { x: 0, y: 0, width: 50, height: 50 },
                })
                canvas.add(unfilled)
                await flush()
                expect(pixelAt(10, 10)).toEqual([0, 0, 0, 0])
            })
            it('should paint the stroked shape', async () => {
                const stroked = new ShapeBlock({
                    x: 0,
                    y: 0,
                    width: 100,
                    height: 100,
                    stroke: { stroke: true },
                    strokeStyle: 'rgba(0, 0, 255, 1)',
                    lineWidth: 4,
                    rect: { x: 0, y: 0, width: 50, height: 50 },
                })
                canvas.add(stroked)
                await flush()
                expect(pixelAt(1, 1)).toEqual([0, 0, 255, 255])
                expect(pixelAt(25, 25)).toEqual([0, 0, 0, 0])
            })
            it('should not paint a shape without stroke', async () => {
                const unstroked = new ShapeBlock({
                    x: 0,
                    y: 0,
                    width: 100,
                    height: 100,
                    stroke: { stroke: false },
                    strokeStyle: 'rgba(0, 0, 255, 1)',
                    lineWidth: 4,
                    rect: { x: 0, y: 0, width: 50, height: 50 },
                })
                canvas.add(unstroked)
                await flush()
                expect(pixelAt(1, 1)).toEqual([0, 0, 0, 0])
            })
            it('should paint only inside the clip path', async () => {
                const path = new Path2D()
                path.rect(0, 0, 20, 20)
                const clipped = new ShapeBlock({
                    x: 0,
                    y: 0,
                    width: 100,
                    height: 100,
                    fill: { fill: true },
                    fillStyle: 'rgba(255, 0, 0, 1)',
                    rect: { x: 0, y: 0, width: 50, height: 50 },
                    clip: { path },
                })
                canvas.add(clipped)
                await flush()
                expect(pixelAt(10, 10)).toEqual([255, 0, 0, 255])
                expect(pixelAt(30, 30)).toEqual([0, 0, 0, 0])
            })
            it('should paint with the global alpha', async () => {
                const translucent = new ShapeBlock({
                    x: 0,
                    y: 0,
                    width: 100,
                    height: 100,
                    globalAlpha: 0.5,
                    fill: { fill: true },
                    fillStyle: 'rgba(255, 0, 0, 1)',
                    rect: { x: 0, y: 0, width: 50, height: 50 },
                })
                canvas.add(translucent)
                await flush()
                const pixel = pixelAt(10, 10)
                expect(pixel[0]).toBe(255)
                expect(pixel[3]).toBeGreaterThan(100)
                expect(pixel[3]).toBeLessThan(155)
            })
        })

        describe('text', () => {
            it('should paint the filled text', async () => {
                const text = new ShapeBlock({
                    x: 0,
                    y: 0,
                    width: 200,
                    height: 50,
                    font: 'normal normal 400 20px sans-serif',
                    fillStyle: 'rgba(0, 0, 0, 1)',
                    fillText: { text: 'Hi', x: 5, y: 25 },
                })
                canvas.add(text)
                await flush()
                expect(paintedArea(0, 0, 60, 40)).toBe(true)
            })
            it('should paint the stroked text', async () => {
                const text = new ShapeBlock({
                    x: 0,
                    y: 0,
                    width: 200,
                    height: 50,
                    font: 'normal normal 400 20px sans-serif',
                    strokeStyle: 'rgba(0, 0, 0, 1)',
                    lineWidth: 2,
                    strokeText: { text: 'Hi', x: 5, y: 25 },
                })
                canvas.add(text)
                await flush()
                expect(paintedArea(0, 0, 60, 40)).toBe(true)
            })
        })

        describe('images', () => {
            it('should paint the drawn image', async () => {
                const image = new ShapeBlock({
                    x: 0,
                    y: 0,
                    width: 100,
                    height: 100,
                    drawImage: {
                        source: createSource(),
                        x: 0,
                        y: 0,
                        width: 20,
                        height: 20,
                        clipX: 0,
                        clipY: 0,
                        clipWidth: 10,
                        clipHeight: 10,
                    },
                })
                canvas.add(image)
                await flush()
                expect(pixelAt(10, 10)).toEqual([255, 0, 0, 255])
            })
        })

        describe('rendering', () => {
            it('should call the given draw function with the context', () => {
                const draw = vi.fn()
                shape.draw(draw)
                expect(draw).toHaveBeenCalledTimes(1)
                expect(draw).toHaveBeenCalledWith(shape.context)
            })
            it('should apply the styles before it draws', async () => {
                const captured = captureContext(shape)
                shape.fillStyle('rgba(255, 0, 0, 1)')
                shape.strokeStyle('rgba(0, 0, 255, 1)')
                shape.lineWidth(6)
                shape.globalAlpha(0.5)
                canvas.demandInvoke(shape)
                await flush()
                expect(captured.fillStyle).toBe('#ff0000')
                expect(captured.strokeStyle).toBe('#0000ff')
                expect(captured.lineWidth).toBe(6)
                expect(captured.globalAlpha).toBe(0.5)
            })
            it('should not draw a hidden shape', async () => {
                const draw = vi.fn()
                shape.draw = draw
                canvas.demandInvoke(shape)
                await flush()
                // the shape is drawn while it is visible
                expect(draw).toHaveBeenCalled()
                draw.mockClear()
                shape.set({ hidden: true })
                await flush()
                expect(draw).not.toHaveBeenCalled()
            })
        })
    })

    describe('visual', () => {
        beforeEach(() => {
            // a small canvas keeps the screenshots focused on the drawn shape
            canvas = new Canvas('myCanvas', 160, 100)
        })

        // the shape is placed inside the canvas, the options are given in its
        // own coordinates
        const drawShape = async (options: IShapeOptions) => {
            shape = new ShapeBlock({
                x: 20,
                y: 20,
                width: 120,
                height: 60,
                ...options,
            })
            canvas.add(shape)
            await flush()
            // the filters are collected while the shape is drawn, so it has to
            // be drawn twice for them to reach the context
            canvas.demandInvoke(shape)
            await flush()
        }

        const expectDrawing = async (name: string, options: IShapeOptions) => {
            await drawShape(options)
            await expect(page.elementLocator(canvas.canvas)).toMatchScreenshot(
                name
            )
        }

        // the drawings of a table are captured one by one
        const capture = (drawings: [string, string, IShapeOptions][]) => {
            for (const [label, name, options] of drawings)
                it(`should draw ${label}`, async () => {
                    await expectDrawing(name, options)
                })
        }

        const strokeOf = (color = 'black', width = 3) => ({
            stroke: { stroke: true },
            strokeStyle: color,
            lineWidth: width,
        })
        const fillOf = (color = 'red') => ({
            fill: { fill: true },
            fillStyle: color,
        })
        const textOf = (text: string, x = 5, y = 30) => ({
            font: 'normal normal 400 20px sans-serif',
            fillStyle: 'black',
            fillText: { text, x, y },
        })
        const rect = { x: 0, y: 0, width: 60, height: 40 }

        describe('paths', () => {
            capture([
                [
                    'a line',
                    'path-line',
                    {
                        ...strokeOf(),
                        moveTo: { x: 0, y: 30 },
                        lineTo: { x: 60, y: 30 },
                    },
                ],
                [
                    'a quadratic curve',
                    'path-quadratic-curve',
                    {
                        ...strokeOf(),
                        moveTo: { x: 0, y: 40 },
                        quadraticCurveTo: {
                            cpx1: 30,
                            cpy1: -20,
                            endX: 60,
                            endY: 40,
                        },
                    },
                ],
                [
                    'a bezier curve',
                    'path-bezier-curve',
                    {
                        ...strokeOf(),
                        moveTo: { x: 0, y: 40 },
                        bezierCurveTo: {
                            cpx1: 20,
                            cpy1: -20,
                            cpx2: 40,
                            cpy2: -20,
                            endX: 60,
                            endY: 40,
                        },
                    },
                ],
                [
                    'an arc',
                    'path-arc',
                    {
                        ...strokeOf(),
                        arc: {
                            x: 30,
                            y: 25,
                            radius: 20,
                            startAngle: 0,
                            endAngle: Math.PI,
                        },
                    },
                ],
                [
                    'a rounded corner',
                    'path-arc-to',
                    {
                        ...strokeOf(),
                        moveTo: { x: 0, y: 40 },
                        arcTo: { x1: 30, y1: 0, x2: 60, y2: 40, radius: 10 },
                    },
                ],
                [
                    'an ellipse',
                    'path-ellipse',
                    {
                        ...strokeOf(),
                        ellipse: {
                            x: 30,
                            y: 20,
                            radiusX: 25,
                            radiusY: 15,
                            rotation: 0,
                            startAngle: 0,
                            endAngle: Math.PI * 2,
                        },
                    },
                ],
                ['a rectangle', 'path-rect', { ...strokeOf(), rect }],
                [
                    'a rounded rectangle',
                    'path-round-rect',
                    {
                        ...strokeOf(),
                        roundRect: { ...rect, borderRadius: [10, 10, 10, 10] },
                    },
                ],
                [
                    'a filled rectangle',
                    'path-fill-rect',
                    { ...fillOf(), fillRect: rect },
                ],
                [
                    'a stroked rectangle',
                    'path-stroke-rect',
                    { ...strokeOf('red'), strokeRect: rect },
                ],
            ])
        })

        describe('paint', () => {
            capture([
                ['the filled shape', 'paint-fill', { ...fillOf(), rect }],
                [
                    'the stroked shape',
                    'paint-stroke',
                    { ...strokeOf('blue', 4), rect },
                ],
                [
                    'the fill style',
                    'paint-fill-style',
                    { ...fillOf('green'), rect },
                ],
                [
                    'the stroke style',
                    'paint-stroke-style',
                    { ...strokeOf('purple', 4), rect },
                ],
                [
                    'the line width',
                    'paint-line-width',
                    {
                        ...strokeOf('black', 10),
                        moveTo: { x: 10, y: 20 },
                        lineTo: { x: 50, y: 20 },
                    },
                ],
                [
                    'the line cap',
                    'paint-line-cap',
                    {
                        ...strokeOf('black', 12),
                        lineCap: 'round',
                        moveTo: { x: 15, y: 20 },
                        lineTo: { x: 45, y: 20 },
                    },
                ],
                [
                    'the line join',
                    'paint-line-join',
                    {
                        ...strokeOf('black', 8),
                        lineJoin: 'bevel',
                        moveTo: { x: 0, y: 40 },
                        lineTo: { x: 30, y: 5 },
                        quadraticCurveTo: {
                            cpx1: 45,
                            cpy1: 5,
                            endX: 60,
                            endY: 40,
                        },
                    },
                ],
                [
                    'the miter limit',
                    'paint-miter-limit',
                    {
                        ...strokeOf('black', 8),
                        miterLimit: 1,
                        moveTo: { x: 0, y: 40 },
                        lineTo: { x: 30, y: 5 },
                        quadraticCurveTo: {
                            cpx1: 45,
                            cpy1: 5,
                            endX: 60,
                            endY: 40,
                        },
                    },
                ],
                [
                    'the line dash',
                    'paint-line-dash',
                    {
                        ...strokeOf('black', 3),
                        lineDash: [8, 4],
                        moveTo: { x: 0, y: 20 },
                        lineTo: { x: 60, y: 20 },
                    },
                ],
                [
                    'the line dash offset',
                    'paint-line-dash-offset',
                    {
                        ...strokeOf('black', 3),
                        lineDash: [8, 4],
                        lineDashOffset: 4,
                        moveTo: { x: 0, y: 20 },
                        lineTo: { x: 60, y: 20 },
                    },
                ],
            ])
        })

        describe('gradients and patterns', () => {
            capture([
                [
                    'the linear gradient',
                    'gradient-linear',
                    {
                        linearGradient: { x0: 0, y0: 0, x1: 60, y1: 0 },
                        colorStops: [
                            { stop: 0, color: 'red' },
                            { stop: 1, color: 'blue' },
                        ],
                        ...fillOf(),
                        rect,
                    },
                ],
                [
                    'the radial gradient',
                    'gradient-radial',
                    {
                        radialGradient: {
                            x0: 30,
                            y0: 20,
                            r0: 0,
                            x1: 30,
                            y1: 20,
                            r1: 25,
                        },
                        colorStops: [
                            { stop: 0, color: 'red' },
                            { stop: 1, color: 'blue' },
                        ],
                        ...fillOf(),
                        rect,
                    },
                ],
                [
                    'the conic gradient',
                    'gradient-conic',
                    {
                        conicGradient: { angle: 0, x: 30, y: 20 },
                        colorStops: [
                            { stop: 0, color: 'red' },
                            { stop: 1, color: 'blue' },
                        ],
                        ...fillOf(),
                        rect,
                    },
                ],
                [
                    'the color stops',
                    'gradient-color-stops',
                    {
                        linearGradient: { x0: 0, y0: 0, x1: 60, y1: 0 },
                        colorStops: [
                            { stop: 0, color: 'red' },
                            { stop: 0.5, color: 'green' },
                            { stop: 1, color: 'blue' },
                        ],
                        ...fillOf(),
                        rect,
                    },
                ],
                [
                    'the pattern',
                    'pattern',
                    {
                        pattern: {
                            image: createPatternSource(),
                            repetition: 'repeat',
                        },
                        ...fillOf(),
                        rect,
                    },
                ],
            ])
        })

        describe('filters', () => {
            capture([
                ['the blur', 'filter-blur', { blur: 4, ...fillOf(), rect }],
                [
                    'the brightness',
                    'filter-brightness',
                    {
                        brightness: 150,
                        ...fillOf('rgb(100, 100, 100)'),
                        rect,
                    },
                ],
                [
                    'the contrast',
                    'filter-contrast',
                    {
                        contrast: 150,
                        ...fillOf('rgb(100, 100, 100)'),
                        rect,
                    },
                ],
                [
                    'the drop shadow',
                    'filter-drop-shadow',
                    {
                        dropShadow: [2, 2, 4, 'rgba(0, 0, 0, 0.6)'],
                        ...fillOf(),
                        rect,
                    },
                ],
                [
                    'the grayscale',
                    'filter-grayscale',
                    { grayscale: 100, ...fillOf(), rect },
                ],
                [
                    'the hue rotate',
                    'filter-hue-rotate',
                    { hueRotate: 120, ...fillOf(), rect },
                ],
                [
                    'the saturate',
                    'filter-saturate',
                    { saturate: 30, ...fillOf(), rect },
                ],
                ['the sepia', 'filter-sepia', { sepia: 80, ...fillOf(), rect }],
            ])
        })

        describe('shadows', () => {
            capture([
                [
                    'the shadow blur',
                    'shadow-blur',
                    { shadowBlur: 8, ...fillOf(), rect },
                ],
                [
                    'the shadow color',
                    'shadow-color',
                    {
                        shadowColor: 'blue',
                        shadowBlur: 4,
                        shadowOffsetX: 4,
                        shadowOffsetY: 4,
                        ...fillOf(),
                        rect,
                    },
                ],
                [
                    'the shadow offset',
                    'shadow-offset',
                    { shadowOffsetX: 8, shadowOffsetY: 8, ...fillOf(), rect },
                ],
            ])
        })

        describe('text', () => {
            capture([
                ['the filled text', 'text-fill', { ...textOf('Hi') }],
                [
                    'the stroked text',
                    'text-stroke',
                    {
                        font: 'normal normal 400 20px sans-serif',
                        strokeStyle: 'black',
                        lineWidth: 2,
                        strokeText: { text: 'Hi', x: 5, y: 30 },
                    },
                ],
                [
                    'the font',
                    'text-font',
                    {
                        font: 'italic normal 700 24px serif',
                        fillStyle: 'black',
                        fillText: { text: 'Hi', x: 5, y: 30 },
                    },
                ],
                [
                    'the font stretch',
                    'text-font-stretch',
                    { fontStretch: 'condensed', ...textOf('Hi') },
                ],
                [
                    'the font kerning',
                    'text-font-kerning',
                    { fontKerning: 'none', ...textOf('AV') },
                ],
                [
                    'the font variant caps',
                    'text-font-variant-caps',
                    { fontVariantCaps: 'small-caps', ...textOf('hi') },
                ],
                [
                    'the text align',
                    'text-align',
                    { textAlign: 'center', ...textOf('Hi', 60, 30) },
                ],
                [
                    'the text baseline',
                    'text-baseline',
                    { textBaseline: 'bottom', ...textOf('Hi', 5, 40) },
                ],
                [
                    'the text rendering',
                    'text-rendering',
                    { textRendering: 'optimizeSpeed', ...textOf('Hi') },
                ],
                [
                    'the word spacing',
                    'text-word-spacing',
                    { wordSpacing: '10', ...textOf('Hi there') },
                ],
                [
                    'the letter spacing',
                    'text-letter-spacing',
                    { letterSpacing: '6', ...textOf('Hi') },
                ],
                [
                    'the direction',
                    'text-direction',
                    { direction: 'rtl', ...textOf('Hi', 60, 30) },
                ],
            ])
        })

        describe('images', () => {
            const detail = {
                source: createDetailSource(),
                x: 0,
                y: 0,
                width: 60,
                height: 60,
                clipX: 0,
                clipY: 0,
                clipWidth: 10,
                clipHeight: 10,
            }
            capture([
                [
                    'the image',
                    'image-draw-image',
                    {
                        drawImage: {
                            source: createSource(),
                            x: 0,
                            y: 0,
                            width: 40,
                            height: 40,
                            clipX: 0,
                            clipY: 0,
                            clipWidth: 10,
                            clipHeight: 10,
                        },
                    },
                ],
                [
                    'the image smoothing',
                    'image-smoothing-enabled',
                    { imageSmoothingEnabled: true, drawImage: detail },
                ],
                [
                    'the disabled image smoothing',
                    'image-smoothing-disabled',
                    { imageSmoothingEnabled: false, drawImage: detail },
                ],
                [
                    'the image smoothing quality',
                    'image-smoothing-quality',
                    { imageSmoothingQuality: 'low', drawImage: detail },
                ],
            ])
        })

        describe('compositing', () => {
            capture([
                [
                    'the global alpha',
                    'composite-global-alpha',
                    { globalAlpha: 0.5, ...fillOf(), rect },
                ],
            ])
            it('should draw the shape with the global composite operation', async () => {
                // the canvas paints the block which was added first on top, so
                // the blended shape has to be added first to blend with the one
                // below it
                const blended = new ShapeBlock({
                    x: 50,
                    y: 30,
                    width: 60,
                    height: 40,
                    globalCompositeOperation: 'multiply',
                    ...fillOf('blue'),
                    rect,
                })
                canvas.add(blended)
                const under = new ShapeBlock({
                    x: 20,
                    y: 20,
                    width: 60,
                    height: 40,
                    ...fillOf('red'),
                    rect,
                })
                canvas.add(under)
                await flush()
                await expect(
                    page.elementLocator(canvas.canvas)
                ).toMatchScreenshot('composite-operation-multiply')
            })
        })

        describe('clip', () => {
            it('should draw the shape inside the clip path', async () => {
                const path = new Path2D()
                path.rect(0, 0, 30, 30)
                await expectDrawing('clip-path', {
                    ...fillOf(),
                    rect,
                    clip: { path },
                })
            })
            it('should draw the shape inside the clip path with the evenodd fill rule', async () => {
                const path = new Path2D()
                path.moveTo(25, 20)
                path.arc(25, 20, 15, 0, Math.PI * 2)
                path.moveTo(45, 20)
                path.arc(45, 20, 15, 0, Math.PI * 2)
                await expectDrawing('clip-fill-rule-evenodd', {
                    ...fillOf(),
                    rect,
                    clip: { path, fillRule: 'evenodd' },
                })
            })
            it('should draw the shape inside the clip path with the nonzero fill rule', async () => {
                const path = new Path2D()
                path.moveTo(25, 20)
                path.arc(25, 20, 15, 0, Math.PI * 2)
                path.moveTo(45, 20)
                path.arc(45, 20, 15, 0, Math.PI * 2)
                await expectDrawing('clip-fill-rule-nonzero', {
                    ...fillOf(),
                    rect,
                    clip: { path, fillRule: 'nonzero' },
                })
            })
            it('should draw the shape inside the current path', async () => {
                await expectDrawing('clip-current-path', {
                    ...fillOf(),
                    rect,
                    clip: {},
                })
            })
        })

        describe('transforms', () => {
            // the shape is asymmetric, so a flip of it is visible
            const shapePath = {
                moveTo: { x: 0, y: 0 },
                lineTo: { x: 30, y: 0 },
                quadraticCurveTo: { cpx1: 30, cpy1: 30, endX: 0, endY: 30 },
            }
            capture([
                [
                    'the rotated shape',
                    'shape-rotated',
                    { rotate: Math.PI / 6, ...fillOf(), rect },
                ],
                [
                    'the horizontally flipped shape',
                    'shape-flipped',
                    {
                        important: { horizontalFlip: true },
                        ...strokeOf(),
                        ...shapePath,
                    },
                ],
                [
                    'the vertically flipped shape',
                    'shape-vertical-flipped',
                    {
                        important: { verticalFlip: true },
                        ...strokeOf(),
                        ...shapePath,
                    },
                ],
            ])
        })
    })
})
