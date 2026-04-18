import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { Block, ImageBlock } from '@2flexible/2flex'
import { getPrototype } from '../../Utils'

let block: Block<any>

const imageOptions = {
    source: {
        value: 'https://example.com/other.png',
        default: 'https://example.com/image.png',
    },
    clipX: { value: 12, default: 0 },
    clipY: { value: 24, default: 0 },
    clipWidth: { value: 80, default: 120 },
    clipHeight: { value: 60, default: 80 },
    objectFit: { value: 'contain', default: undefined },
    repeatX: { value: 3, default: undefined },
    repeatY: { value: 'fill', default: undefined },
}

beforeEach(() => {
    block = new ImageBlock('https://example.com/image.png', { x: 0, y: 0, width: 120, height: 80 })
})

describe('ImageBlock', () => {
    describe('Constructor', () => {
        it('creates an ImageBlock instance', () => {
            expect(block).toBeInstanceOf(ImageBlock)
        })

        it('should not throw when creating an ImageBlock with options', () => {
            expect(
                () => new ImageBlock('https://example.com/image.png', { x: 12, y: 24, width: 140, height: 80 })
            ).not.toThrow()
        })
    })

    describe('All options test', () => {
        for (const [key, val] of Object.entries(imageOptions)) {
            it(`option ${key} defaults to ${val.default}`, () => {
                const currentVal = getPrototype(block, key)?.value.call(block)
                expect(currentVal).toStrictEqual(val.default)
            })

            it(`option ${key} can be set to ${val.value}`, () => {
                const currentVal = getPrototype(block, key)?.value.call(block, val.value)
                expect(currentVal).toStrictEqual(val.value)
            })
        }
    })

    describe('isRepeat', () => {
        it('is false when repeatX and repeatY are undefined', () => {
            expect(block.isRepeat).toBe(false)
        })

        it('is true when repeatX is set', () => {
            block.repeatX(2)
            expect(block.isRepeat).toBe(true)
        })

        it('is true when repeatY is set', () => {
            block.repeatY(2)
            expect(block.isRepeat).toBe(true)
        })
    })
    
})
