// src/__tests__/block.test.ts
import { describe, it, expect, vi } from 'vitest'
import { Block, RectangleBlock } from '@2flexible/2flex'

// RectangleBlock extends ShapeBlock which extends Block.
// We use RectangleBlock as a concrete instantiatable Block for base tests.
function makeBlock(opts = {}) {
    return new RectangleBlock({ x: 0, y: 0, width: 100, height: 100, ...opts })
}

describe('Block – options', () => {
    // ─── Geometry ────────────────────────────────────────────────────────────────
    describe('position properties', () => {
        it('x defaults to 0', () => {
            expect(makeBlock().x()).toBe(0)
        })

        it('sets x', () => {
            const b = makeBlock()
            b.x(42)
            expect(b.x()).toBe(42)
        })

        it('y defaults to 0', () => {
            expect(makeBlock().y()).toBe(0)
        })

        it('sets y', () => {
            const b = makeBlock()
            b.y(99)
            expect(b.y()).toBe(99)
        })

        it('width defaults to constructor value', () => {
            expect(makeBlock({ width: 200 }).width()).toBe(200)
        })

        it('sets width via method', () => {
            const b = makeBlock()
            b.width(250)
            expect(b.width()).toBe(250)
        })

        it('height defaults to constructor value', () => {
            expect(makeBlock({ height: 150 }).height()).toBe(150)
        })

        it('sets height via method', () => {
            const b = makeBlock()
            b.height(300)
            expect(b.height()).toBe(300)
        })
    })

    describe('min/max constraints', () => {
        it('minWidth defaults to 0', () => {
            expect(makeBlock().minWidth()).toBe(0)
        })

        it('sets minWidth', () => {
            const b = makeBlock()
            b.minWidth(20)
            expect(b.minWidth()).toBe(20)
        })

        it('minHeight defaults to 0', () => {
            expect(makeBlock().minHeight()).toBe(0)
        })

        it('sets minHeight', () => {
            const b = makeBlock()
            b.minHeight(20)
            expect(b.minHeight()).toBe(20)
        })

        it('maxWidth defaults to block width', () => {
            const b = makeBlock({ width: 100 })
            expect(b.maxWidth()).toBe(100)
        })

        it('sets maxWidth', () => {
            const b = makeBlock()
            b.maxWidth(500)
            expect(b.maxWidth()).toBe(500)
        })

        it('maxHeight defaults to block height', () => {
            const b = makeBlock({ height: 100 })
            expect(b.maxHeight()).toBe(100)
        })

        it('sets maxHeight', () => {
            const b = makeBlock()
            b.maxHeight(500)
            expect(b.maxHeight()).toBe(500)
        })
    })

    // ─── name ───────────────────────────────────────────────────────────────────
    describe('name', () => {
        it('name defaults to undefined', () => {
            expect(makeBlock().name()).toBeUndefined()
        })

        it('sets name', () => {
            const b = makeBlock({ name: 'myBlock' })
            expect(b.name()).toBe('myBlock')
        })

        it('updates name via method', () => {
            const b = makeBlock()
            b.name('updated')
            expect(b.name()).toBe('updated')
        })
    })

    // ─── Padding ────────────────────────────────────────────────────────────────
    describe('padding', () => {
        it('paddingTop defaults to 0', () => {
            expect(makeBlock().paddingTop()).toBe(0)
        })

        it('paddingRight defaults to 0', () => {
            expect(makeBlock().paddingRight()).toBe(0)
        })

        it('paddingBottom defaults to 0', () => {
            expect(makeBlock().paddingBottom()).toBe(0)
        })

        it('paddingLeft defaults to 0', () => {
            expect(makeBlock().paddingLeft()).toBe(0)
        })

        it('sets individual padding sides', () => {
            const b = makeBlock()
            b.paddingTop(10)
            b.paddingRight(5)
            b.paddingBottom(10)
            b.paddingLeft(5)
            expect(b.paddingTop()).toBe(10)
            expect(b.paddingRight()).toBe(5)
            expect(b.paddingBottom()).toBe(10)
            expect(b.paddingLeft()).toBe(5)
        })

        it('sets padding as shorthand array', () => {
            const b = makeBlock()
            b.padding([10, 20, 10, 20])
            expect(b.padding()).toEqual([10, 20, 10, 20])
        })
    })

    // ─── Margin ─────────────────────────────────────────────────────────────────
    describe('margin', () => {
        it('marginTop defaults to 0', () => {
            expect(makeBlock().marginTop()).toBe(0)
        })

        it('marginRight defaults to 0', () => {
            expect(makeBlock().marginRight()).toBe(0)
        })

        it('marginBottom defaults to 0', () => {
            expect(makeBlock().marginBottom()).toBe(0)
        })

        it('marginLeft defaults to 0', () => {
            expect(makeBlock().marginLeft()).toBe(0)
        })

        it('sets margin shorthand', () => {
            const b = makeBlock()
            b.margin([5, 10, 5, 10])
            expect(b.margin()).toEqual([5, 10, 5, 10])
        })
    })

    // ─── Position type ───────────────────────────────────────────────────────────
    describe('position type', () => {
        it('position defaults to undefined', () => {
            expect(makeBlock().position()).toBeUndefined()
        })

        it("sets position to 'absolute'", () => {
            const b = makeBlock()
            b.position('absolute')
            expect(b.position()).toBe('absolute')
        })

        it("sets position to 'relative'", () => {
            const b = makeBlock()
            b.position('relative')
            expect(b.position()).toBe('relative')
        })

        it("sets position to 'sticky'", () => {
            const b = makeBlock()
            b.position('sticky')
            expect(b.position()).toBe('sticky')
        })

        it("sets position to 'fixed'", () => {
            const b = makeBlock()
            b.position('fixed')
            expect(b.position()).toBe('fixed')
        })
    })

    // ─── top / bottom / left / right ────────────────────────────────────────────
    describe('directional offsets', () => {
        it('top defaults to 0', () => {
            expect(makeBlock().top()).toBe(0)
        })

        it('sets top', () => {
            const b = makeBlock()
            b.top(15)
            expect(b.top()).toBe(15)
        })

        it('bottom defaults to 0', () => {
            expect(makeBlock().bottom()).toBe(0)
        })

        it('sets bottom', () => {
            const b = makeBlock()
            b.bottom(15)
            expect(b.bottom()).toBe(15)
        })

        it('left defaults to 0', () => {
            expect(makeBlock().left()).toBe(0)
        })

        it('sets left', () => {
            const b = makeBlock()
            b.left(15)
            expect(b.left()).toBe(15)
        })

        it('right defaults to 0', () => {
            expect(makeBlock().right()).toBe(0)
        })

        it('sets right', () => {
            const b = makeBlock()
            b.right(15)
            expect(b.right()).toBe(15)
        })
    })

    // ─── zIndex ──────────────────────────────────────────────────────────────────
    describe('zIndex', () => {
        it('zIndex defaults to undefined', () => {
            expect(makeBlock().zIndex()).toBeUndefined()
        })

        it('sets zIndex', () => {
            const b = makeBlock()
            b.zIndex(10)
            expect(b.zIndex()).toBe(10)
        })
    })

    // ─── selectable ──────────────────────────────────────────────────────────────
    describe('selectable', () => {
        it('selectable defaults to false', () => {
            expect(makeBlock().selectable()).toBe(false)
        })

        it('enables selectable', () => {
            const b = makeBlock({ selectable: true })
            expect(b.selectable()).toBe(true)
        })

        it('toggles selectable via method', () => {
            const b = makeBlock()
            b.selectable(true)
            expect(b.selectable()).toBe(true)
            b.selectable(false)
            expect(b.selectable()).toBe(false)
        })
    })

    // ─── draggable ───────────────────────────────────────────────────────────────
    describe('draggable', () => {
        it('draggable defaults to false', () => {
            expect(makeBlock().draggable()).toBe(false)
        })

        it('enables draggable', () => {
            const b = makeBlock({ draggable: true })
            expect(b.draggable()).toBe(true)
        })

        it('dragX defaults to true', () => {
            expect(makeBlock().dragX()).toBe(true)
        })

        it('dragY defaults to true', () => {
            expect(makeBlock().dragY()).toBe(true)
        })

        it('sets dragX to false', () => {
            const b = makeBlock()
            b.dragX(false)
            expect(b.dragX()).toBe(false)
        })

        it('sets dragY to false', () => {
            const b = makeBlock()
            b.dragY(false)
            expect(b.dragY()).toBe(false)
        })

        it('sets onDrag callback', () => {
            const b = makeBlock()
            const cb = vi.fn()
            b.onDrag(cb)
            expect(b.onDrag()).toBe(cb)
        })
    })

    // ─── rotate / rotatable ──────────────────────────────────────────────────────
    describe('rotation', () => {
        it('rotate defaults to 0', () => {
            expect(makeBlock().rotate()).toBe(0)
        })

        it('sets rotate', () => {
            const b = makeBlock()
            b.rotate(Math.PI / 4)
            expect(b.rotate()).toBeCloseTo(Math.PI / 4)
        })

        it('rotatable defaults to false', () => {
            expect(makeBlock().rotatable()).toBe(false)
        })

        it('enables rotatable', () => {
            const b = makeBlock({ rotatable: true })
            expect(b.rotatable()).toBe(true)
        })

        it('rotationCenterX defaults to 0', () => {
            expect(makeBlock().rotationCenterX()).toBe(0)
        })

        it('rotationCenterY defaults to 0', () => {
            expect(makeBlock().rotationCenterY()).toBe(0)
        })

        it('sets rotationCenterX and rotationCenterY', () => {
            const b = makeBlock()
            b.rotationCenterX(50)
            b.rotationCenterY(50)
            expect(b.rotationCenterX()).toBe(50)
            expect(b.rotationCenterY()).toBe(50)
        })

        it('sets onRotate callback', () => {
            const b = makeBlock()
            const cb = vi.fn()
            b.onRotate(cb)
            expect(b.onRotate()).toBe(cb)
        })
    })

    // ─── resizable ───────────────────────────────────────────────────────────────
    describe('resizable', () => {
        it('resizable defaults to false', () => {
            expect(makeBlock().resizable()).toBe(false)
        })

        it('enables resizable', () => {
            const b = makeBlock({ resizable: true })
            expect(b.resizable()).toBe(true)
        })

        it('resize corner flags default to true', () => {
            const b = makeBlock()
            expect(b.resizeTopLeft()).toBe(true)
            expect(b.resizeTopRight()).toBe(true)
            expect(b.resizeBottomLeft()).toBe(true)
            expect(b.resizeBottomRight()).toBe(true)
        })

        it('resize edge flags default to true', () => {
            const b = makeBlock()
            expect(b.resizeTop()).toBe(true)
            expect(b.resizeRight()).toBe(true)
            expect(b.resizeBottom()).toBe(true)
            expect(b.resizeLeft()).toBe(true)
        })

        it('horizontalFlipResize defaults to false', () => {
            expect(makeBlock().horizontalFlipResize()).toBe(false)
        })

        it('verticalFlipResize defaults to false', () => {
            expect(makeBlock().verticalFlipResize()).toBe(false)
        })

        it('sets onResize callback', () => {
            const b = makeBlock()
            const cb = vi.fn()
            b.onResize(cb)
            expect(b.onResize()).toBe(cb)
        })
    })

    // ─── hidden ──────────────────────────────────────────────────────────────────
    describe('hidden', () => {
        it('hidden defaults to false', () => {
            expect(makeBlock().hidden()).toBe(false)
        })

        it('hides block', () => {
            const b = makeBlock()
            b.hidden(true)
            expect(b.hidden()).toBe(true)
        })
    })

    // ─── order / flexBasis ───────────────────────────────────────────────────────
    describe('order and flexBasis', () => {
        it('order defaults to undefined', () => {
            expect(makeBlock().order()).toBeUndefined()
        })

        it('sets order', () => {
            const b = makeBlock()
            b.order(3)
            expect(b.order()).toBe(3)
        })

        it("flexBasis defaults to 'auto'", () => {
            expect(makeBlock().flexBasis()).toBe('auto')
        })

        it('sets flexBasis to a number', () => {
            const b = makeBlock()
            b.flexBasis(200)
            expect(b.flexBasis()).toBe(200)
        })
    })

    // ─── hot area / corner config ────────────────────────────────────────────────
    describe('hot area configuration', () => {
        it('hotAreaGap defaults to 0', () => {
            expect(makeBlock().hotAreaGap()).toBe(0)
        })

        it('sets hotAreaGap', () => {
            const b = makeBlock()
            b.hotAreaGap(5)
            expect(b.hotAreaGap()).toBe(5)
        })

        it('hotCornerSize defaults to 5', () => {
            expect(makeBlock().hotCornerSize()).toBe(5)
        })

        it('sets hotCornerSize', () => {
            const b = makeBlock()
            b.hotCornerSize(10)
            expect(b.hotCornerSize()).toBe(10)
        })

        it("hotCornerStrokeColor defaults to 'blue'", () => {
            expect(makeBlock().hotCornerStrokeColor()).toBe('blue')
        })

        it('sets hotCornerStrokeColor', () => {
            const b = makeBlock()
            b.hotCornerStrokeColor('red')
            expect(b.hotCornerStrokeColor()).toBe('red')
        })

        it("hotCornerBackgroundColor defaults to 'white'", () => {
            expect(makeBlock().hotCornerBackgroundColor()).toBe('white')
        })

        it("hotLineStrokeColor defaults to 'blue'", () => {
            expect(makeBlock().hotLineStrokeColor()).toBe('blue')
        })

        it('hotLineStrokeWidth defaults to 1.5', () => {
            expect(makeBlock().hotLineStrokeWidth()).toBe(1.5)
        })
    })

    // ─── onRender callback ────────────────────────────────────────────────────────
    describe('onRender', () => {
        it('onRender defaults to undefined', () => {
            expect(makeBlock().onRender()).toBeUndefined()
        })

        it('sets onRender callback', () => {
            const cb = vi.fn()
            const b = makeBlock({ onRender: cb })
            expect(b.onRender()).toBe(cb)
        })
    })
})

// ─── Block.set() ─────────────────────────────────────────────────────────────
describe('Block.set()', () => {
    it('updates multiple options at once via set()', () => {
        const b = makeBlock()
        b.set({ x: 10, y: 20, width: 50, height: 60 })
        expect(b.x()).toBe(10)
        expect(b.y()).toBe(20)
        expect(b.width()).toBe(50)
        expect(b.height()).toBe(60)
    })
})

// ─── Block.bind() ────────────────────────────────────────────────────────────
describe('Block.bind()', () => {
    it('bind() does not throw', () => {
        const b1 = makeBlock({ x: 0, y: 0 })
        const b2 = makeBlock({ x: 0, y: 0 }) as Block
        expect(() => b1.bind(b2, ['x', 'y'])).not.toThrow()
    })
})

// ─── Block.important() ───────────────────────────────────────────────────────
describe('Block.important()', () => {
    it('important defaults to undefined', () => {
        expect(makeBlock().important()).toBeUndefined()
    })

    it('sets important options', () => {
        const b = makeBlock()
        b.important({ x: 50, y: 50 })
        const imp = b.important()
        expect(imp).toBeDefined()
        expect(imp?.x).toBe(50)
        expect(imp?.y).toBe(50)
    })
})
