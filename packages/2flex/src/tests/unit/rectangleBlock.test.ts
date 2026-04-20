import { describe, it, expect, beforeEach } from 'vitest'
import { Canvas, RectangleBlock } from '@2flexible/2flex'
import { getPrototype } from '../../Utils'

let block: RectangleBlock
let canvas: Canvas

const rectangleOptions = {
    // Core Rectangle Appearance
    backgroundColor: { value: 'rgba(34, 197, 94, 1)', default: undefined },
    borderRadius: { value: [16, 8, 24, 12], default: [0, 0, 0, 0] },
    borderWidth: { value: 4, default: 0 },
    borderColor: { value: 'rgba(22, 101, 52, 1)', default: 'rgba(0, 0, 0, 1)' },
    borderStyle: { value: 'dotted', default: 'solid' },

    // Border shorthands
    border: { value: [6, 'solid', 'rgba(30, 58, 138, 1)'], default: undefined },
    borderTop: {
        value: [3, 'solid', 'rgba(239, 68, 68, 1)'],
        default: undefined,
    },
    borderBottom: {
        value: [5, 'dotted', 'rgba(234, 179, 8, 1)'],
        default: undefined,
    },
    borderLeft: {
        value: [8, 'solid', 'rgba(59, 130, 246, 1)'],
        default: undefined,
    },
    borderRight: {
        value: [2, 'solid', 'rgba(139, 92, 246, 1)'],
        default: undefined,
    },
}

beforeEach(() => {
    block = new RectangleBlock({})
    canvas = new Canvas('', 200, 300)
    canvas.add(block)
})

describe('RectangleBlock', () => {
    describe('Constructor', () => {
        it('creates a RectangleBlock instance', () => {
            expect(block).toBeInstanceOf(RectangleBlock)
        })

        it('should not throw when creating a RectangleBlock with options', () => {
            expect(
                () =>
                    new RectangleBlock({ x: 12, y: 24, width: 140, height: 80 })
            ).not.toThrow()
        })
    })

    describe('All options test', () => {
        for (const [key, val] of Object.entries(rectangleOptions)) {
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

    describe('borderRadius', () => {
        it('expands numeric radius to 4 corners', () => {
            expect(block.borderRadius(10)).toEqual([10, 10, 10, 10])
        })

        it('expands [a] to [a, a, a, a]', () => {
            expect(block.borderRadius([6])).toEqual([6, 6, 6, 6])
        })

        it('expands [a, b] to [a, a, b, b]', () => {
            expect(block.borderRadius([10, 4])).toEqual([10, 10, 4, 4])
        })

        it('expands [a, b, c] to [a, a, b, c]', () => {
            expect(block.borderRadius([8, 3, 1])).toEqual([8, 8, 3, 1])
        })

        it('keeps [a, b, c, d] unchanged', () => {
            expect(block.borderRadius([1, 2, 3, 4])).toEqual([1, 2, 3, 4])
        })
    })

    describe('border shorthands', () => {
        it('accepts tuple for border()', () => {
            expect(block.border([2, 'solid', '#00000'])).toEqual([
                2,
                'solid',
                'rgba(0, 0, 0, 1)',
            ])
        })

        it('accepts CSS-like string for border()', () => {
            expect(block.border('3 solid #ff0000')).toEqual([
                3,
                'solid',
                'rgba(255, 0, 0, 1)',
            ])
        })

        it('accepts tuple for borderTop()', () => {
            expect(block.borderTop([1, 'solid', '#111111'])).toEqual([
                1,
                'solid',
                'rgba(17, 17, 17, 1)',
            ])
        })
        it('accepts CSS-like string for borderTop()', () => {
            expect(block.borderTop('2 dotted #aabbcc')).toEqual([
                2,
                'dotted',
                'rgba(170, 187, 204, 1)',
            ])
        })

        it('accepts tuple for borderRight()', () => {
            expect(block.borderRight([2, 'dotted', '#222222'])).toEqual([
                2,
                'dotted',
                'rgba(34, 34, 34, 1)',
            ])
        })
        it('accepts CSS-like string for borderRight()', () => {
            expect(block.borderRight('4 solid #ddeeff')).toEqual([
                4,
                'solid',
                'rgba(221, 238, 255, 1)',
            ])
        })

        it('accepts tuple for borderBottom()', () => {
            expect(block.borderBottom([3, 'solid', '#333333'])).toEqual([
                3,
                'solid',
                'rgba(51, 51, 51, 1)',
            ])
        })
        it('accepts CSS-like string for borderBottom()', () => {
            expect(block.borderBottom('5 dotted #112233')).toEqual([
                5,
                'dotted',
                'rgba(17, 34, 51, 1)',
            ])
        })

        it('accepts tuple for borderLeft()', () => {
            expect(block.borderLeft([4, 'dotted', '#444444'])).toEqual([
                4,
                'dotted',
                'rgba(68, 68, 68, 1)',
            ])
        })
        it('accepts CSS-like string for borderLeft()', () => {
            expect(block.borderLeft('2 solid #334455')).toEqual([
                2,
                'solid',
                'rgba(51, 68, 85, 1)',
            ])
        })
    })
})
