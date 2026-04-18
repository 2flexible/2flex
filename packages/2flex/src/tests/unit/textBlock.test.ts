import { describe, it, expect, beforeEach } from 'vitest'
import { Block, TextBlock } from '@2flexible/2flex'
import { getPrototype } from '../../Utils'

let block: Block<any>

const textOptions = {
    text: { value: 'hello world', default: '' },
    color: { value: 'rgba(34, 197, 94, 1)', default: undefined },
    strokeWidth: { value: 4, default: 0 },
    strokeColor: { value: 'rgba(22, 101, 52, 1)', default: undefined },
    fontFamily: { value: 'serif', default: 'sans-serif' },
    fontSize: { value: 18, default: 0 },
    fontWeight: { value: 'bold', default: 'normal' },
    fontStyle: { value: 'italic', default: 'normal' },
    fontVariant: { value: 'small-caps', default: 'normal' },
    resizeLineHeight: { value: true, default: false },
    wrap: { value: 'word', default: 'nowrap' },
    onEdit: { value: () => {}, default: undefined },
}

beforeEach(() => {
    block = new TextBlock()
})

describe('TextBlock', () => {
    describe('Constructor', () => {
        it('creates a TextBlock instance', () => {
            expect(block).toBeInstanceOf(TextBlock)
        })

        it('should not throw when creating a TextBlock with options', () => {
            expect(
                () => new TextBlock('hello', { x: 12, y: 24, width: 140, height: 80 })
            ).not.toThrow()
        })
    })

    describe('All options test', () => {
        for (const [key, val] of Object.entries(textOptions)) {
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

    describe('scale', () => {
        it('scales fontSize together with block scale', () => {
            block.fontSize(12)
            block.scale(2)
            expect(block.fontSize()).toBe(24)
        })
    })

    describe('generatePayload', () => {
        it('includes text as additional param', () => {
            block.text('payload text')
            const payload = block.generatePayload()
            expect(payload.additionalParams).toStrictEqual(['payload text'])
        })
    })
})
