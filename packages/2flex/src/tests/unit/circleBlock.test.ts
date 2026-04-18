import { describe, it, expect, beforeEach } from 'vitest'
import { Block, CircleBlock } from '@2flexible/2flex'
import { getPrototype } from '../../Utils'

let block: Block<any>

const circleOptions = {
    // Core Circle Appearance
    startAngle: { value: Math.PI / 4, default: 0 },
    endAngle: { value: Math.PI, default: Math.PI * 2 },
    innerRadius: { value: 18, default: 0 },
    backgroundColor: { value: 'rgba(34, 197, 94, 1)', default: undefined },
    borderWidth: { value: 4, default: 0 },
    borderColor: { value: 'rgba(22, 101, 52, 1)', default: 'rgba(0, 0, 0, 1)' },
    borderStyle: { value: 'dotted', default: 'solid' },

    // Border shorthand
    border: { value: [6, 'solid', 'rgba(30, 58, 138, 1)'], default: undefined },
}

beforeEach(() => {
    block = new CircleBlock({})
})

describe('CircleBlock', () => {
    describe('Constructor', () => {
        it('creates a CircleBlock instance', () => {
            expect(block).toBeInstanceOf(CircleBlock)
        })

        it('should not throw when creating a CircleBlock with options', () => {
            expect(() => new CircleBlock({ x: 12, y: 24, width: 140, height: 80 })).not.toThrow()
        })
    })

    describe('All options test', () => {
        for (const [key, val] of Object.entries(circleOptions)) {
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

    describe('border shorthand', () => {
        it('accepts tuple for border()', () => {
            expect(block.border([2, 'solid', '#00000'])).toEqual([2, 'solid', 'rgba(0, 0, 0, 1)'])
        })

        it('accepts CSS-like string for border()', () => {
            expect(block.border('3 solid #ff0000')).toEqual([3, 'solid', 'rgba(255, 0, 0, 1)'])
        })
    })
})
