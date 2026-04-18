import { describe, it, expect, beforeEach } from 'vitest'
import { Block, LineBlock } from '@2flexible/2flex'
import { getPrototype } from '../../Utils'

let block: Block<any>

const lineOptions = {
    lineType: { value: 'cubicBezier', default: 'line' },
    closeLine: { value: true, default: false },
    lineColor: { value: 'rgba(22, 101, 52, 1)', default: undefined },
    backgroundColor: { value: 'rgba(34, 197, 94, 1)', default: undefined },
    controlPointsSize: { value: 8, default: 5 },
    editable: { value: true, default: false },
    startDraggable: { value: true, default: false },
    endDraggable: { value: true, default: false },
    startControllable: { value: true, default: false },
    endControllable: { value: true, default: false },
}

beforeEach(() => {
    block = new LineBlock({})
})

describe('LineBlock', () => {
    describe('Constructor', () => {
        it('creates a LineBlock instance', () => {
            expect(block).toBeInstanceOf(LineBlock)
        })

        it('should not throw when creating a LineBlock with options', () => {
            expect(
                () => new LineBlock({ x: 12, y: 24, width: 140, height: 80 })
            ).not.toThrow()
        })
    })

    describe('All options test', () => {
        for (const [key, val] of Object.entries(lineOptions)) {
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

    describe('joinTo', () => {
        it('returns the joined line instance', () => {
            const joined = new LineBlock({})
            block.joinTo(joined)
            expect(block.joinTo()).toBe(joined)
        })
    })

    describe('style and scale side effects', () => {
        it('backgroundColor sets fillStyle and enables fill', () => {
            const fillColor = 'rgba(34, 197, 94, 1)'
            block.backgroundColor(fillColor)

            expect(block.backgroundColor()).toBe(fillColor)
            expect(block.fillStyle()).toBe(fillColor)
            expect(block.fill()).toStrictEqual({ fill: true })
        })

        it('lineColor sets strokeStyle and enables stroke', () => {
            const strokeColor = 'rgba(22, 101, 52, 1)'
            block.lineColor(strokeColor)

            expect(block.lineColor()).toBe(strokeColor)
            expect(block.strokeStyle()).toBe(strokeColor)
            expect(block.stroke()).toStrictEqual({ stroke: true })
        })

        it('scale updates lineWidth proportionally', () => {
            block.lineWidth(2)
            block.scale(3)

            expect(block.lineWidth()).toBe(6)
        })
    })
})
