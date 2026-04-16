const blockOptions = {
    // ── Layout Type ───
    layout: { value: 'grid', default: undefined },

    // ── Alignment (Content) ───
    justifyContent: { value: 'space-between', default: 'normal' },
    alignContent: { value: 'stretch', default: 'normal' },
    placeContent: {
        value: ['center', 'space-around'],
        default: ['normal', 'normal'],
    },

    // ── Alignment (Items) ───
    alignItems: { value: 'baseline', default: 'normal' },
    placeItems: { value: ['end', 'start'], default: ['normal', 'normal'] },
    justifyItems: { value: 'stretch', default: 'normal' },

    // ── Flex Properties ───
    flexDirection: { value: 'column-reverse', default: 'row' },
    flexWrap: { value: 'wrap-reverse', default: 'nowrap' },
    flexFlow: { value: 'column wrap', default: 'row nowrap' },

    // ── Spacing ───
    gap: { value: 24, default: 0 },
    columnGap: { value: '2rem', default: 0 },
    rowGap: { value: 16, default: 0 },

    // ── Grid Properties ───
    gridAutoRows: { value: 'minmax(100px, auto)', default: 'auto' },
    gridAutoColumns: { value: '1fr', default: 'auto' },
    gridAutoFlow: { value: 'dense', default: 'row' },
    gridTemplateAreas: {
        value: '"header header" "sidebar content" "footer footer"',
        default: undefined,
    },
    gridTemplate: { value: '100px 1fr / 200px 1fr', default: undefined },
    gridTemplateColumns: { value: 'repeat(3, 1fr)', default: undefined },
    gridTemplateRows: { value: 'auto 200px', default: undefined },
    grid: { value: '200px / auto-flow dense', default: undefined },
}

// src/__tests__/layoutBlock.test.ts
import { describe, it, expect } from 'vitest'
import { LayoutBlock, RectangleBlock } from '@2flexible/2flex'

function makeLayout(opts = {}) {
    return new LayoutBlock({ x: 0, y: 0, width: 400, height: 300, ...opts })
}

describe('LayoutBlock', () => {
    describe('constructor', () => {
        it('creates a LayoutBlock instance', () => {
            expect(makeLayout()).toBeInstanceOf(LayoutBlock)
        })

        it('accepts initial options', () => {
            const b = makeLayout({ layout: 'grid' })
            expect(b.layout()).toBe('grid')
        })
    })

    // ─── layout ────────────────────────────────────────────────────────────────
    describe('layout', () => {
        it("layout defaults to 'flex'", () => {
            expect(makeLayout().layout()).toBe('flex')
        })

        it("sets layout to 'inline-flex'", () => {
            const b = makeLayout()
            b.layout('inline-flex')
            expect(b.layout()).toBe('inline-flex')
        })

        it("sets layout to 'grid'", () => {
            const b = makeLayout()
            b.layout('grid')
            expect(b.layout()).toBe('grid')
        })

        it("sets layout to 'inline-grid'", () => {
            const b = makeLayout()
            b.layout('inline-grid')
            expect(b.layout()).toBe('inline-grid')
        })
    })

    // ─── flexDirection ─────────────────────────────────────────────────────────
    describe('flexDirection', () => {
        it("flexDirection defaults to 'column'", () => {
            expect(makeLayout().flexDirection()).toBe('column')
        })

        it("sets flexDirection to 'row'", () => {
            const b = makeLayout()
            b.flexDirection('row')
            expect(b.flexDirection()).toBe('row')
        })

        it("sets flexDirection to 'column-reverse'", () => {
            const b = makeLayout()
            b.flexDirection('column-reverse')
            expect(b.flexDirection()).toBe('column-reverse')
        })

        it("sets flexDirection to 'row-reverse'", () => {
            const b = makeLayout()
            b.flexDirection('row-reverse')
            expect(b.flexDirection()).toBe('row-reverse')
        })
    })

    // ─── flexWrap ──────────────────────────────────────────────────────────────
    describe('flexWrap', () => {
        it("flexWrap defaults to 'nowrap'", () => {
            expect(makeLayout().flexWrap()).toBe('nowrap')
        })

        it("sets flexWrap to 'wrap'", () => {
            const b = makeLayout()
            b.flexWrap('wrap')
            expect(b.flexWrap()).toBe('wrap')
        })

        it("sets flexWrap to 'wrap-reverse'", () => {
            const b = makeLayout()
            b.flexWrap('wrap-reverse')
            expect(b.flexWrap()).toBe('wrap-reverse')
        })
    })

    // ─── flexFlow shorthand ────────────────────────────────────────────────────
    describe('flexFlow', () => {
        it("flexFlow defaults to ['row', 'nowrap']", () => {
            expect(makeLayout().flexFlow()).toEqual(['row', 'nowrap'])
        })

        it('sets flexFlow', () => {
            const b = makeLayout()
            b.flexFlow(['column', 'wrap'])
            expect(b.flexFlow()).toEqual(['column', 'wrap'])
        })
    })

    // ─── justifyContent ────────────────────────────────────────────────────────
    describe('justifyContent', () => {
        it("justifyContent defaults to 'normal'", () => {
            expect(makeLayout().justifyContent()).toBe('normal')
        })

        it("sets justifyContent to 'center'", () => {
            const b = makeLayout()
            b.justifyContent('center')
            expect(b.justifyContent()).toBe('center')
        })

        it("sets justifyContent to 'space-between'", () => {
            const b = makeLayout()
            b.justifyContent('space-between')
            expect(b.justifyContent()).toBe('space-between')
        })

        it("sets justifyContent to 'space-around'", () => {
            const b = makeLayout()
            b.justifyContent('space-around')
            expect(b.justifyContent()).toBe('space-around')
        })

        it("sets justifyContent to 'space-evenly'", () => {
            const b = makeLayout()
            b.justifyContent('space-evenly')
            expect(b.justifyContent()).toBe('space-evenly')
        })

        it("sets justifyContent to 'start'", () => {
            const b = makeLayout()
            b.justifyContent('start')
            expect(b.justifyContent()).toBe('start')
        })

        it("sets justifyContent to 'end'", () => {
            const b = makeLayout()
            b.justifyContent('end')
            expect(b.justifyContent()).toBe('end')
        })

        it("sets justifyContent to 'stretch'", () => {
            const b = makeLayout()
            b.justifyContent('stretch')
            expect(b.justifyContent()).toBe('stretch')
        })
    })

    // ─── alignItems ────────────────────────────────────────────────────────────
    describe('alignItems', () => {
        it("alignItems defaults to 'normal'", () => {
            expect(makeLayout().alignItems()).toBe('normal')
        })

        it("sets alignItems to 'center'", () => {
            const b = makeLayout()
            b.alignItems('center')
            expect(b.alignItems()).toBe('center')
        })

        it("sets alignItems to 'start'", () => {
            const b = makeLayout()
            b.alignItems('start')
            expect(b.alignItems()).toBe('start')
        })

        it("sets alignItems to 'end'", () => {
            const b = makeLayout()
            b.alignItems('end')
            expect(b.alignItems()).toBe('end')
        })

        it("sets alignItems to 'stretch'", () => {
            const b = makeLayout()
            b.alignItems('stretch')
            expect(b.alignItems()).toBe('stretch')
        })
    })

    // ─── alignContent ──────────────────────────────────────────────────────────
    describe('alignContent', () => {
        it("alignContent defaults to 'normal'", () => {
            expect(makeLayout().alignContent()).toBe('normal')
        })

        it("sets alignContent to 'center'", () => {
            const b = makeLayout()
            b.alignContent('center')
            expect(b.alignContent()).toBe('center')
        })
    })

    // ─── placeContent / placeItems ─────────────────────────────────────────────
    describe('placeContent', () => {
        it("placeContent defaults to ['normal', 'normal']", () => {
            expect(makeLayout().placeContent()).toEqual(['normal', 'normal'])
        })

        it('sets placeContent', () => {
            const b = makeLayout()
            b.placeContent(['center', 'center'])
            expect(b.placeContent()).toEqual(['center', 'center'])
        })
    })

    describe('placeItems', () => {
        it("placeItems defaults to ['normal', 'normal']", () => {
            expect(makeLayout().placeItems()).toEqual(['normal', 'normal'])
        })

        it('sets placeItems', () => {
            const b = makeLayout()
            b.placeItems(['center', 'center'])
            expect(b.placeItems()).toEqual(['center', 'center'])
        })
    })

    // ─── justifyItems ──────────────────────────────────────────────────────────
    describe('justifyItems', () => {
        it("justifyItems defaults to 'normal'", () => {
            expect(makeLayout().justifyItems()).toBe('normal')
        })

        it("sets justifyItems to 'center'", () => {
            const b = makeLayout()
            b.justifyItems('center')
            expect(b.justifyItems()).toBe('center')
        })
    })

    // ─── gap ───────────────────────────────────────────────────────────────────
    describe('gap', () => {
        it('gap defaults to 0', () => {
            const g = makeLayout().gap()
            expect(g === 0 || (Array.isArray(g) && g[0] === 0)).toBe(true)
        })

        it('sets gap as number', () => {
            const b = makeLayout()
            b.gap(10)
            expect(b.gap()).toBe(10)
        })

        it('sets gap as array', () => {
            const b = makeLayout()
            b.gap([10, 20])
            expect(b.gap()).toEqual([10, 20])
        })

        it('columnGap defaults to 0', () => {
            expect(makeLayout().columnGap()).toBe(0)
        })

        it('sets columnGap', () => {
            const b = makeLayout()
            b.columnGap(15)
            expect(b.columnGap()).toBe(15)
        })

        it('rowGap defaults to 0', () => {
            expect(makeLayout().rowGap()).toBe(0)
        })

        it('sets rowGap', () => {
            const b = makeLayout()
            b.rowGap(8)
            expect(b.rowGap()).toBe(8)
        })
    })

    // ─── Grid options ──────────────────────────────────────────────────────────
    describe('grid options', () => {
        it('gridAutoRows defaults to []', () => {
            expect(makeLayout().gridAutoRows()).toEqual([])
        })

        it('sets gridAutoRows', () => {
            const b = makeLayout()
            b.gridAutoRows([100, 200])
            expect(b.gridAutoRows()).toEqual([100, 200])
        })

        it('gridAutoColumns defaults to []', () => {
            expect(makeLayout().gridAutoColumns()).toEqual([])
        })

        it('sets gridAutoColumns', () => {
            const b = makeLayout()
            b.gridAutoColumns([50, 50, 100])
            expect(b.gridAutoColumns()).toEqual([50, 50, 100])
        })

        it("gridAutoFlow defaults to 'row'", () => {
            expect(makeLayout().gridAutoFlow()).toBe('row')
        })

        it("sets gridAutoFlow to 'column'", () => {
            const b = makeLayout()
            b.gridAutoFlow('column')
            expect(b.gridAutoFlow()).toBe('column')
        })

        it("sets gridAutoFlow to 'dense'", () => {
            const b = makeLayout()
            b.gridAutoFlow('dense')
            expect(b.gridAutoFlow()).toBe('dense')
        })

        it('gridTemplateColumns defaults to []', () => {
            expect(makeLayout().gridTemplateColumns()).toEqual([])
        })

        it('sets gridTemplateColumns', () => {
            const b = makeLayout()
            b.gridTemplateColumns([100, 200, 100])
            expect(b.gridTemplateColumns()).toEqual([100, 200, 100])
        })

        it('gridTemplateRows defaults to 0 or []', () => {
            const r = makeLayout().gridTemplateRows()
            expect(r === 0 || (Array.isArray(r) && r.length === 0)).toBe(true)
        })

        it('sets gridTemplateRows', () => {
            const b = makeLayout()
            b.gridTemplateRows([50, 100])
            expect(b.gridTemplateRows()).toEqual([50, 100])
        })

        it('gridTemplateAreas defaults to []', () => {
            expect(makeLayout().gridTemplateAreas()).toEqual([])
        })

        it('sets gridTemplateAreas', () => {
            const b = makeLayout()
            b.gridTemplateAreas(['header header', 'sidebar content'])
            expect(b.gridTemplateAreas()).toEqual([
                'header header',
                'sidebar content',
            ])
        })
    })

    // ─── Child block management ────────────────────────────────────────────────
    describe('adding child blocks', () => {
        it('can add a child block without throwing', () => {
            const layout = makeLayout()
            const child = new RectangleBlock({
                x: 0,
                y: 0,
                width: 50,
                height: 50,
            })
            expect(() => layout.add(child)).not.toThrow()
        })

        it('can add multiple child blocks', () => {
            const layout = makeLayout()
            const c1 = new RectangleBlock({ x: 0, y: 0, width: 50, height: 50 })
            const c2 = new RectangleBlock({ x: 0, y: 0, width: 50, height: 50 })
            const c3 = new RectangleBlock({ x: 0, y: 0, width: 50, height: 50 })
            expect(() => {
                layout.add(c1)
                layout.add(c2)
                layout.add(c3)
            }).not.toThrow()
        })
    })

    // ─── Inherited Block options sanity check ──────────────────────────────────
    describe('inherited Block options', () => {
        it('hidden defaults to false', () => {
            expect(makeLayout().hidden()).toBe(false)
        })

        it('x/y set from constructor', () => {
            const b = makeLayout({ x: 10, y: 20 })
            expect(b.x()).toBe(10)
            expect(b.y()).toBe(20)
        })
    })
})
