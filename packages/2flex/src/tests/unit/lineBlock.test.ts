// src/__tests__/lineBlock.test.ts
import { describe, it, expect } from 'vitest'
import { LineBlock, RectangleBlock } from '@2flexible/2flex'

const lineOptions = {
    // ── Core Line Geometry & Type ───
    lineType: { value: 'cubicBezier', default: 'line' },
    startX: { value: 80, default: undefined },
    startY: { value: 120, default: undefined },
    endX: { value: 320, default: undefined },
    endY: { value: 280, default: undefined },
    startControlX: { value: 140, default: undefined },
    startControlY: { value: 80, default: undefined },
    endControlX: { value: 260, default: undefined },
    endControlY: { value: 220, default: undefined },
    controlPointsSize: { value: 8, default: 5 },

    // ── Editing & Interaction ───
    editable: { value: true, default: false },
    startDraggable: { value: true, default: false },
    endDraggable: { value: true, default: false },
    startControllable: { value: true, default: false },
    endControllable: { value: true, default: false },

    // ── Appearance ───
    lineColor: { value: 0x3b82f6, default: undefined },
    backgroundColor: { value: '#22c55e', default: undefined },
    closeLine: { value: true, default: false },

    // ── Sticking & Joining ───
    stickStart: {
        value: { block: null as any, x: 20, y: 30 },
        default: undefined,
    },
    stickEnd: {
        value: { block: null as any, x: 40, y: 50 },
        default: undefined,
    },
    joinTo: { value: null as any, default: undefined },

    // ── Inherited from ShapeBlock (most useful for lines) ───
    strokeStyle: { value: '#1e40af', default: undefined },
    lineWidth: { value: 6, default: undefined },
    lineCap: { value: 'round', default: undefined },
    lineJoin: { value: 'round', default: undefined },
    lineDash: { value: [10, 5], default: undefined },
    shadowBlur: { value: 12, default: undefined },
    shadowColor: { value: 'rgba(0, 0, 0, 0.35)', default: undefined },
    shadowOffsetX: { value: 4, default: undefined },
    shadowOffsetY: { value: 6, default: undefined },
    globalAlpha: { value: 0.95, default: undefined },
}

function makeLine(opts = {}) {
    return new LineBlock({
        startX: 0,
        startY: 0,
        endX: 100,
        endY: 100,
        ...opts,
    })
}

describe('LineBlock', () => {
    describe('constructor', () => {
        it('creates a LineBlock instance', () => {
            expect(makeLine()).toBeInstanceOf(LineBlock)
        })
    })

    describe('lineType', () => {
        it("lineType defaults to 'line'", () => {
            expect(makeLine().lineType()).toBe('line')
        })

        it("sets lineType to 'cubicBezier'", () => {
            const b = makeLine()
            b.lineType('cubicBezier')
            expect(b.lineType()).toBe('cubicBezier')
        })
    })

    describe('start/end points', () => {
        it('startX set via constructor', () => {
            expect(makeLine({ startX: 10 }).startX()).toBe(10)
        })

        it('sets startX via method', () => {
            const b = makeLine()
            b.startX(20)
            expect(b.startX()).toBe(20)
        })

        it('startY set via constructor', () => {
            expect(makeLine({ startY: 5 }).startY()).toBe(5)
        })

        it('sets startY via method', () => {
            const b = makeLine()
            b.startY(15)
            expect(b.startY()).toBe(15)
        })

        it('endX set via constructor', () => {
            expect(makeLine({ endX: 200 }).endX()).toBe(200)
        })

        it('sets endX via method', () => {
            const b = makeLine()
            b.endX(150)
            expect(b.endX()).toBe(150)
        })

        it('endY set via constructor', () => {
            expect(makeLine({ endY: 300 }).endY()).toBe(300)
        })

        it('sets endY via method', () => {
            const b = makeLine()
            b.endY(250)
            expect(b.endY()).toBe(250)
        })
    })

    describe('cubic bezier control points', () => {
        it('startControlX defaults to undefined', () => {
            expect(makeLine().startControlX()).toBeUndefined()
        })

        it('sets startControlX', () => {
            const b = makeLine()
            b.startControlX(30)
            expect(b.startControlX()).toBe(30)
        })

        it('startControlY defaults to undefined', () => {
            expect(makeLine().startControlY()).toBeUndefined()
        })

        it('sets startControlY', () => {
            const b = makeLine()
            b.startControlY(30)
            expect(b.startControlY()).toBe(30)
        })

        it('endControlX defaults to undefined', () => {
            expect(makeLine().endControlX()).toBeUndefined()
        })

        it('sets endControlX', () => {
            const b = makeLine()
            b.endControlX(80)
            expect(b.endControlX()).toBe(80)
        })

        it('endControlY defaults to undefined', () => {
            expect(makeLine().endControlY()).toBeUndefined()
        })

        it('sets endControlY', () => {
            const b = makeLine()
            b.endControlY(80)
            expect(b.endControlY()).toBe(80)
        })
    })

    describe('controlPointsSize', () => {
        it('controlPointsSize defaults to 5', () => {
            expect(makeLine().controlPointsSize()).toBe(5)
        })

        it('sets controlPointsSize', () => {
            const b = makeLine()
            b.controlPointsSize(10)
            expect(b.controlPointsSize()).toBe(10)
        })
    })

    describe('editable / draggable flags', () => {
        it('editable defaults to false', () => {
            expect(makeLine().editable()).toBe(false)
        })

        it('enables editable', () => {
            const b = makeLine()
            b.editable(true)
            expect(b.editable()).toBe(true)
        })

        it('startDraggable defaults to false', () => {
            expect(makeLine().startDraggable()).toBe(false)
        })

        it('enables startDraggable', () => {
            const b = makeLine()
            b.startDraggable(true)
            expect(b.startDraggable()).toBe(true)
        })

        it('endDraggable defaults to false', () => {
            expect(makeLine().endDraggable()).toBe(false)
        })

        it('enables endDraggable', () => {
            const b = makeLine()
            b.endDraggable(true)
            expect(b.endDraggable()).toBe(true)
        })

        it('startControllable defaults to false', () => {
            expect(makeLine().startControllable()).toBe(false)
        })

        it('endControllable defaults to false', () => {
            expect(makeLine().endControllable()).toBe(false)
        })
    })

    describe('lineColor / backgroundColor', () => {
        it('lineColor defaults to undefined', () => {
            expect(makeLine().lineColor()).toBeUndefined()
        })

        it('sets lineColor', () => {
            const b = makeLine()
            b.lineColor('red')
            expect(b.lineColor()).toBe('red')
        })

        it('backgroundColor defaults to undefined', () => {
            expect(makeLine().backgroundColor()).toBeUndefined()
        })

        it('sets backgroundColor', () => {
            const b = makeLine()
            b.backgroundColor('blue')
            expect(b.backgroundColor()).toBe('blue')
        })
    })

    describe('closeLine', () => {
        it('closeLine defaults to false', () => {
            expect(makeLine().closeLine()).toBe(false)
        })

        it('enables closeLine', () => {
            const b = makeLine()
            b.closeLine(true)
            expect(b.closeLine()).toBe(true)
        })
    })

    describe('stickStart / stickEnd', () => {
        it('stickStart defaults to undefined', () => {
            expect(makeLine().stickStart()).toBeUndefined()
        })

        it('sets stickStart with a block reference', () => {
            const b = makeLine()
            const target = new RectangleBlock({
                x: 0,
                y: 0,
                width: 50,
                height: 50,
            })
            b.stickStart({ block: target, x: 0, y: 0 })
            expect(b.stickStart()).toBeDefined()
            expect(b.stickStart()?.block).toBe(target)
        })

        it('stickEnd defaults to undefined', () => {
            expect(makeLine().stickEnd()).toBeUndefined()
        })

        it('sets stickEnd with a block reference', () => {
            const b = makeLine()
            const target = new RectangleBlock({
                x: 50,
                y: 50,
                width: 50,
                height: 50,
            })
            b.stickEnd({ block: target, x: 1, y: 1 })
            expect(b.stickEnd()).toBeDefined()
        })
    })

    describe('joinTo', () => {
        it('joinTo defaults to undefined', () => {
            expect(makeLine().joinTo()).toBeUndefined()
        })

        it('sets joinTo another LineBlock', () => {
            const b1 = makeLine()
            const b2 = makeLine({
                startX: 100,
                startY: 100,
                endX: 200,
                endY: 200,
            })
            b1.joinTo(b2)
            expect(b1.joinTo()).toBe(b2)
        })
    })
})
