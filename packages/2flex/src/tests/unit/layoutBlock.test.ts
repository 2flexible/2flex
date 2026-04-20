import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Block, LayoutBlock, Canvas } from '@2flexible/2flex'
import { getPrototype } from '../../Utils'

let block: LayoutBlock
const canvas = new Canvas('myCanvas', 400, 400)

const layoutOptions = {
    layout: { value: 'grid', default: 'flex' },
    flexDirection: { value: 'column', default: 'row' },
    flexWrap: { value: 'wrap', default: 'nowrap' },
    flexFlow: { value: ['row-reverse', 'wrap'], default: ['row', 'nowrap'] },
    justifyContent: { value: 'center', default: 'normal' },
    justifyItems: { value: 'center', default: 'normal' },
    alignContent: { value: 'start', default: 'normal' },
    alignItems: { value: 'end', default: 'normal' },
    placeContent: { value: 'end', default: 'start' },
    placeItems: { value: 'center', default: 'start' },
    gap: { value: [8, 16], default: 0 },
    gapColumn: { value: 10, default: 0 },
    gapRow: { value: 12, default: 0 },
    gridTemplate: { value: [100, 100], default: [] },
    gridTemplateColumns: { value: [100, 'auto'], default: [0] },
    gridTemplateRows: { value: [40, 'auto'], default: [] },
    gridAutoFlow: { value: 'column', default: 'row' },
}

beforeEach(() => {
    block = new LayoutBlock({})
})

describe('LayoutBlock', () => {
    describe('Constructor', () => {
        it('creates a LayoutBlock instance', () => {
            expect(block).toBeInstanceOf(LayoutBlock)
        })

        it('should not throw when creating a LayoutBlock with options', () => {
            expect(
                () => new LayoutBlock({ x: 12, y: 24, width: 140, height: 80 })
            ).not.toThrow()
        })
    })

    describe('All options test', () => {
        for (const [key, val] of Object.entries(layoutOptions)) {
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

    describe('Shorthands', () => {
        it('sets rows and columns from gridTemplate', () => {
            block.gridTemplate([
                [30, 60],
                [120, 240],
            ])
            expect(block.gridTemplateRows()).toStrictEqual([30, 60])
            expect(block.gridTemplateColumns()).toStrictEqual([120, 240])
        })
        it('placeContent', () => {
            block.placeContent('center')
            expect(block.justifyContent()).toBe('center')
            expect(block.alignContent()).toBe('center')
        })
        it('placeItems', () => {
            block.placeItems('center')
            expect(block.justifyItems()).toBe('center')
            expect(block.alignItems()).toBe('center')
        })
        it('flexFlow', () => {
            block.flexFlow(['column', 'wrap'])
            expect(block.flexDirection()).toBe('column')
            expect(block.flexWrap()).toBe('wrap')
        })
        it('gridTemplateAreas')
        it('gridAutoColumns')
        it('gridAutoRows')
    })

    describe('Flex layout aligning', () => {
        let flexLayout: LayoutBlock

        let firstChild: Block<any>
        let secondChild: Block<any>
        let thirdChild: Block<any>
        let fourthChild: Block<any>

        beforeEach(() => {
            flexLayout = new LayoutBlock({
                x: 0,
                y: 0,
                width: 200,
                height: 100,
                layout: 'flex',
            })

            firstChild = new Block({ width: 40, height: 30 })
            secondChild = new Block({ width: 20, height: 40 })
            thirdChild = new Block({ width: 80, height: 50 })
            fourthChild = new Block({ width: 30, height: 50 })

            flexLayout.addChild(
                firstChild,
                secondChild,
                thirdChild,
                fourthChild
            )
            canvas.add(flexLayout)
        })

        afterEach(() => {
            canvas.remove(flexLayout)
        })

        describe('Directon: row', () => {
            beforeEach(() => {
                flexLayout.set({ flexDirection: 'row' })
            })

            describe('FlexWrap: nowrap', () => {
                beforeEach(() => {
                    flexLayout.set({ flexWrap: 'nowrap' })
                })

                it('places children sequentially along the x-axis and aligns children to start of y-axis', () => {
                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(40)
                    expect(thirdChild.x()).toBe(60)
                    expect(fourthChild.x()).toBe(140)

                    expect(firstChild.y()).toBe(0)
                    expect(secondChild.y()).toBe(0)
                    expect(thirdChild.y()).toBe(0)
                    expect(fourthChild.y()).toBe(0)
                })

                it('gapColumn', () => {
                    flexLayout.set({ gapColumn: 20 })
                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(60)
                    expect(thirdChild.x()).toBe(100)
                    expect(fourthChild.x()).toBe(200)
                })

                it('justifyContent: start', () => {
                    flexLayout.set({ justifyContent: 'start' })

                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(40)
                    expect(thirdChild.x()).toBe(60)
                    expect(fourthChild.x()).toBe(140)
                })

                it('justifyContent: center', () => {
                    flexLayout.set({ justifyContent: 'center' })

                    expect(firstChild.x()).toBe(15)
                    expect(secondChild.x()).toBe(55)
                    expect(thirdChild.x()).toBe(75)
                    expect(fourthChild.x()).toBe(155)
                })

                it('justifyContent: end', () => {
                    flexLayout.set({ justifyContent: 'end' })

                    expect(firstChild.x()).toBe(30)
                    expect(secondChild.x()).toBe(70)
                    expect(thirdChild.x()).toBe(90)
                    expect(fourthChild.x()).toBe(170)
                })

                it('justifyContent: space-between', () => {
                    flexLayout.set({ justifyContent: 'space-between' })

                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(50)
                    expect(thirdChild.x()).toBe(80)
                    expect(fourthChild.x()).toBe(170)
                })

                it('justifyContent: space-around', () => {
                    flexLayout.set({ justifyContent: 'space-around' })

                    expect(firstChild.x()).toBe(3.75)
                    expect(secondChild.x()).toBe(51.25)
                    expect(thirdChild.x()).toBe(78.75)
                    expect(fourthChild.x()).toBe(166.25)
                })

                it('justifyContent: space-evenly', () => {
                    flexLayout.set({ justifyContent: 'space-evenly' })

                    expect(firstChild.x()).toBe(6)
                    expect(secondChild.x()).toBe(52)
                    expect(thirdChild.x()).toBe(78)
                    expect(fourthChild.x()).toBe(164)
                })

                it('alignItems: start', () => {
                    flexLayout.set({ alignItems: 'start' })
                    expect(firstChild.y()).toBe(0)
                    expect(secondChild.y()).toBe(0)
                    expect(thirdChild.y()).toBe(0)
                    expect(fourthChild.y()).toBe(0)
                })

                it('alignItems: center', () => {
                    flexLayout.set({ alignItems: 'center' })

                    expect(firstChild.y()).toBe(35)
                    expect(secondChild.y()).toBe(30)
                    expect(thirdChild.y()).toBe(25)
                    expect(fourthChild.y()).toBe(25)
                })

                it('alignItems: end', () => {
                    flexLayout.set({ alignItems: 'end' })

                    expect(firstChild.y()).toBe(70)
                    expect(secondChild.y()).toBe(60)
                    expect(thirdChild.y()).toBe(50)
                    expect(fourthChild.y()).toBe(50)
                })
            })

            describe('FlexWrap: wrap', () => {
                beforeEach(() => {
                    flexLayout.set({
                        flexWrap: 'wrap',
                        width: 120,
                        height: 200,
                    })
                })

                it('places children sequentially along the x-axis and aligns children to start of y-axis', () => {
                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(40)
                    expect(thirdChild.x()).toBe(0)
                    expect(fourthChild.x()).toBe(80)

                    expect(firstChild.y()).toBe(0)
                    expect(secondChild.y()).toBe(0)
                    expect(thirdChild.y()).toBe(40)
                    expect(fourthChild.y()).toBe(40)
                })

                it('gapColumn', () => {
                    flexLayout.set({ gapColumn: 20 })
                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(60)
                    expect(thirdChild.x()).toBe(0)
                    expect(fourthChild.x()).toBe(0)
                })

                it('gapRow', () => {
                    flexLayout.set({ gapRow: 20 })

                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(40)
                    expect(thirdChild.x()).toBe(0)
                    expect(fourthChild.x()).toBe(80)

                    expect(firstChild.y()).toBe(0)
                    expect(secondChild.y()).toBe(0)
                    expect(thirdChild.y()).toBe(60)
                    expect(fourthChild.y()).toBe(60)
                })

                it('justifyContent: start', () => {
                    flexLayout.set({ justifyContent: 'start' })

                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(40)
                    expect(thirdChild.x()).toBe(0)
                    expect(fourthChild.x()).toBe(80)

                    expect(firstChild.y()).toBe(0)
                    expect(secondChild.y()).toBe(0)
                    expect(thirdChild.y()).toBe(40)
                    expect(fourthChild.y()).toBe(40)
                })

                it('justifyContent: center', () => {
                    flexLayout.set({ justifyContent: 'center' })

                    expect(firstChild.x()).toBe(30)
                    expect(secondChild.x()).toBe(70)
                    expect(thirdChild.x()).toBe(5)
                    expect(fourthChild.x()).toBe(85)

                    expect(firstChild.y()).toBe(0)
                    expect(secondChild.y()).toBe(0)
                    expect(thirdChild.y()).toBe(40)
                    expect(fourthChild.y()).toBe(40)
                })

                it('justifyContent: end', () => {
                    flexLayout.set({ justifyContent: 'end' })

                    expect(firstChild.x()).toBe(60)
                    expect(secondChild.x()).toBe(100)
                    expect(thirdChild.x()).toBe(10)
                    expect(fourthChild.x()).toBe(90)

                    expect(firstChild.y()).toBe(0)
                    expect(secondChild.y()).toBe(0)
                    expect(thirdChild.y()).toBe(40)
                    expect(fourthChild.y()).toBe(40)
                })

                it('justifyContent: space-between', () => {
                    flexLayout.set({ justifyContent: 'space-between' })

                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(100)
                    expect(thirdChild.x()).toBe(0)
                    expect(fourthChild.x()).toBe(90)

                    expect(firstChild.y()).toBe(0)
                    expect(secondChild.y()).toBe(0)
                    expect(thirdChild.y()).toBe(40)
                    expect(fourthChild.y()).toBe(40)
                })

                it('justifyContent: space-around', () => {
                    flexLayout.set({ justifyContent: 'space-around' })

                    expect(firstChild.x()).toBe(15)
                    expect(secondChild.x()).toBe(85)
                    expect(thirdChild.x()).toBe(2.5)
                    expect(fourthChild.x()).toBe(87.5)

                    expect(firstChild.y()).toBe(0)
                    expect(secondChild.y()).toBe(0)
                    expect(thirdChild.y()).toBe(40)
                    expect(fourthChild.y()).toBe(40)
                })

                it('justifyContent: space-evenly', () => {
                    flexLayout.set({ justifyContent: 'space-evenly' })

                    expect(firstChild.x()).toBe(20)
                    expect(secondChild.x()).toBe(80)
                    expect(thirdChild.x()).toBe(3.3333333333333335)
                    expect(fourthChild.x()).toBe(86.66666666666666)

                    expect(firstChild.y()).toBe(0)
                    expect(secondChild.y()).toBe(0)
                    expect(thirdChild.y()).toBe(40)
                    expect(fourthChild.y()).toBe(40)
                })

                it('alignItems: start', () => {
                    flexLayout.set({ alignItems: 'start' })

                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(40)
                    expect(thirdChild.x()).toBe(0)
                    expect(fourthChild.x()).toBe(80)

                    expect(firstChild.y()).toBe(0)
                    expect(secondChild.y()).toBe(0)
                    expect(thirdChild.y()).toBe(40)
                    expect(fourthChild.y()).toBe(40)
                })

                it('alignItems: center', () => {
                    flexLayout.set({ alignItems: 'center' })

                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(40)
                    expect(thirdChild.x()).toBe(0)
                    expect(fourthChild.x()).toBe(80)

                    expect(firstChild.y()).toBe(41.666666666666664)
                    expect(secondChild.y()).toBe(36.666666666666664)
                    expect(thirdChild.y()).toBe(76.66666666666666)
                    expect(fourthChild.y()).toBe(76.66666666666666)
                })

                it('alignItems: end', () => {
                    flexLayout.set({ alignItems: 'end' })

                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(40)
                    expect(thirdChild.x()).toBe(0)
                    expect(fourthChild.x()).toBe(80)

                    expect(firstChild.y()).toBe(120)
                    expect(secondChild.y()).toBe(110)
                    expect(thirdChild.y()).toBe(150)
                    expect(fourthChild.y()).toBe(150)
                })

                it('alignContent: start', () => {
                    flexLayout.set({ alignContent: 'start' })

                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(40)
                    expect(thirdChild.x()).toBe(0)
                    expect(fourthChild.x()).toBe(80)

                    expect(firstChild.y()).toBe(0)
                    expect(secondChild.y()).toBe(0)
                    expect(thirdChild.y()).toBe(40)
                    expect(fourthChild.y()).toBe(40)
                })

                it('alignContent: center', () => {
                    flexLayout.set({ alignContent: 'center' })

                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(40)
                    expect(thirdChild.x()).toBe(0)
                    expect(fourthChild.x()).toBe(80)

                    expect(firstChild.y()).toBe(36.666666666666664)
                    expect(secondChild.y()).toBe(36.666666666666664)
                    expect(thirdChild.y()).toBe(76.66666666666666)
                    expect(fourthChild.y()).toBe(76.66666666666666)
                })

                it('alignContent: end', () => {
                    flexLayout.set({ alignContent: 'end' })

                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(40)
                    expect(thirdChild.x()).toBe(0)
                    expect(fourthChild.x()).toBe(80)

                    expect(firstChild.y()).toBe(110)
                    expect(secondChild.y()).toBe(110)
                    expect(thirdChild.y()).toBe(150)
                    expect(fourthChild.y()).toBe(150)
                })

                it('alignContent: space-between', () => {
                    flexLayout.set({ alignContent: 'space-between' })

                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(40)
                    expect(thirdChild.x()).toBe(0)
                    expect(fourthChild.x()).toBe(80)

                    expect(firstChild.y()).toBe(0)
                    expect(secondChild.y()).toBe(0)
                    expect(thirdChild.y()).toBe(150)
                    expect(fourthChild.y()).toBe(150)
                })

                it('alignContent: space-around', () => {
                    flexLayout.set({ alignContent: 'space-around' })

                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(40)
                    expect(thirdChild.x()).toBe(0)
                    expect(fourthChild.x()).toBe(80)

                    expect(firstChild.y()).toBe(27.5)
                    expect(secondChild.y()).toBe(27.5)
                    expect(thirdChild.y()).toBe(122.5)
                    expect(fourthChild.y()).toBe(122.5)
                })

                it('alignContent: space-evenly', () => {
                    flexLayout.set({ alignContent: 'space-evenly' })

                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(40)
                    expect(thirdChild.x()).toBe(0)
                    expect(fourthChild.x()).toBe(80)

                    expect(firstChild.y()).toBe(36.666666666666664)
                    expect(secondChild.y()).toBe(36.666666666666664)
                    expect(thirdChild.y()).toBe(113.33333333333331)
                    expect(fourthChild.y()).toBe(113.33333333333331)
                })

                it('alignItems: start -- alignConten: *', () => {
                    flexLayout.set({ alignItems: 'start' })
                    flexLayout.set({ alignContent: 'start' })
                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(40)
                    expect(thirdChild.x()).toBe(0)
                    expect(fourthChild.x()).toBe(80)

                    expect(firstChild.y()).toBe(0)
                    expect(secondChild.y()).toBe(0)
                    expect(thirdChild.y()).toBe(40)
                    expect(fourthChild.y()).toBe(40)

                    flexLayout.set({ alignContent: 'center' })
                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(40)
                    expect(thirdChild.x()).toBe(0)
                    expect(fourthChild.x()).toBe(80)

                    expect(firstChild.y()).toBe(36.666666666666664)
                    expect(secondChild.y()).toBe(36.666666666666664)
                    expect(thirdChild.y()).toBe(76.66666666666666)
                    expect(fourthChild.y()).toBe(76.66666666666666)

                    flexLayout.set({ alignContent: 'end' })
                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(40)
                    expect(thirdChild.x()).toBe(0)
                    expect(fourthChild.x()).toBe(80)

                    expect(firstChild.y()).toBe(110)
                    expect(secondChild.y()).toBe(110)
                    expect(thirdChild.y()).toBe(150)
                    expect(fourthChild.y()).toBe(150)

                    flexLayout.set({ alignContent: 'space-between' })
                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(40)
                    expect(thirdChild.x()).toBe(0)
                    expect(fourthChild.x()).toBe(80)

                    expect(firstChild.y()).toBe(0)
                    expect(secondChild.y()).toBe(0)
                    expect(thirdChild.y()).toBe(150)
                    expect(fourthChild.y()).toBe(150)

                    flexLayout.set({ alignContent: 'space-around' })
                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(40)
                    expect(thirdChild.x()).toBe(0)
                    expect(fourthChild.x()).toBe(80)

                    expect(firstChild.y()).toBe(27.5)
                    expect(secondChild.y()).toBe(27.5)
                    expect(thirdChild.y()).toBe(122.5)
                    expect(fourthChild.y()).toBe(122.5)

                    flexLayout.set({ alignContent: 'space-evenly' })
                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(40)
                    expect(thirdChild.x()).toBe(0)
                    expect(fourthChild.x()).toBe(80)

                    expect(firstChild.y()).toBe(36.666666666666664)
                    expect(secondChild.y()).toBe(36.666666666666664)
                    expect(thirdChild.y()).toBe(113.33333333333331)
                    expect(fourthChild.y()).toBe(113.33333333333331)
                })

                it('alignItems: center -- alignConten: *', () => {
                    flexLayout.set({ alignItems: 'center' })
                    flexLayout.set({ alignContent: 'start' })
                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(40)
                    expect(thirdChild.x()).toBe(0)
                    expect(fourthChild.x()).toBe(80)

                    expect(firstChild.y()).toBe(41.666666666666664)
                    expect(secondChild.y()).toBe(36.666666666666664)
                    expect(thirdChild.y()).toBe(76.66666666666666)
                    expect(fourthChild.y()).toBe(76.66666666666666)

                    flexLayout.set({ alignContent: 'center' })
                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(40)
                    expect(thirdChild.x()).toBe(0)
                    expect(fourthChild.x()).toBe(80)

                    expect(firstChild.y()).toBe(41.666666666666664)
                    expect(secondChild.y()).toBe(36.666666666666664)
                    expect(thirdChild.y()).toBe(76.66666666666666)
                    expect(fourthChild.y()).toBe(76.66666666666666)

                    flexLayout.set({ alignContent: 'end' })
                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(40)
                    expect(thirdChild.x()).toBe(0)
                    expect(fourthChild.x()).toBe(80)

                    expect(firstChild.y()).toBe(41.666666666666664)
                    expect(secondChild.y()).toBe(36.666666666666664)
                    expect(thirdChild.y()).toBe(76.66666666666666)
                    expect(fourthChild.y()).toBe(76.66666666666666)

                    flexLayout.set({ alignContent: 'space-between' })
                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(40)
                    expect(thirdChild.x()).toBe(0)
                    expect(fourthChild.x()).toBe(80)

                    expect(firstChild.y()).toBe(41.666666666666664)
                    expect(secondChild.y()).toBe(36.666666666666664)
                    expect(thirdChild.y()).toBe(186.66666666666666)
                    expect(fourthChild.y()).toBe(186.66666666666666)

                    flexLayout.set({ alignContent: 'space-around' })
                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(40)
                    expect(thirdChild.x()).toBe(0)
                    expect(fourthChild.x()).toBe(80)

                    expect(firstChild.y()).toBe(41.666666666666664)
                    expect(secondChild.y()).toBe(36.666666666666664)
                    expect(thirdChild.y()).toBe(131.66666666666666)
                    expect(fourthChild.y()).toBe(131.66666666666666)

                    flexLayout.set({ alignContent: 'space-evenly' })
                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(40)
                    expect(thirdChild.x()).toBe(0)
                    expect(fourthChild.x()).toBe(80)

                    expect(firstChild.y()).toBe(41.666666666666664)
                    expect(secondChild.y()).toBe(36.666666666666664)
                    expect(thirdChild.y()).toBe(113.33333333333331)
                    expect(fourthChild.y()).toBe(113.33333333333331)
                })

                it('alignItems: end -- alignConten: *', () => {
                    flexLayout.set({ alignItems: 'end' })
                    flexLayout.set({ alignContent: 'start' })
                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(40)
                    expect(thirdChild.x()).toBe(0)
                    expect(fourthChild.x()).toBe(80)

                    expect(firstChild.y()).toBe(10)
                    expect(secondChild.y()).toBe(0)
                    expect(thirdChild.y()).toBe(40)
                    expect(fourthChild.y()).toBe(40)

                    flexLayout.set({ alignContent: 'center' })
                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(40)
                    expect(thirdChild.x()).toBe(0)
                    expect(fourthChild.x()).toBe(80)

                    expect(firstChild.y()).toBe(46.666666666666664)
                    expect(secondChild.y()).toBe(36.666666666666664)
                    expect(thirdChild.y()).toBe(76.66666666666666)
                    expect(fourthChild.y()).toBe(76.66666666666666)

                    flexLayout.set({ alignContent: 'end' })
                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(40)
                    expect(thirdChild.x()).toBe(0)
                    expect(fourthChild.x()).toBe(80)

                    expect(firstChild.y()).toBe(120)
                    expect(secondChild.y()).toBe(110)
                    expect(thirdChild.y()).toBe(150)
                    expect(fourthChild.y()).toBe(150)

                    flexLayout.set({ alignContent: 'space-between' })
                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(40)
                    expect(thirdChild.x()).toBe(0)
                    expect(fourthChild.x()).toBe(80)

                    expect(firstChild.y()).toBe(10)
                    expect(secondChild.y()).toBe(0)
                    expect(thirdChild.y()).toBe(150)
                    expect(fourthChild.y()).toBe(150)

                    flexLayout.set({ alignContent: 'space-around' })
                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(40)
                    expect(thirdChild.x()).toBe(0)
                    expect(fourthChild.x()).toBe(80)

                    expect(firstChild.y()).toBe(37.5)
                    expect(secondChild.y()).toBe(27.5)
                    expect(thirdChild.y()).toBe(122.5)
                    expect(fourthChild.y()).toBe(122.5)

                    flexLayout.set({ alignContent: 'space-evenly' })
                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(40)
                    expect(thirdChild.x()).toBe(0)
                    expect(fourthChild.x()).toBe(80)

                    expect(firstChild.y()).toBe(46.666666666666664)
                    expect(secondChild.y()).toBe(36.666666666666664)
                    expect(thirdChild.y()).toBe(113.33333333333331)
                    expect(fourthChild.y()).toBe(113.33333333333331)
                })
            })
        })
        describe('Directon: column', () => {
            beforeEach(() => {
                flexLayout.set({
                    flexDirection: 'column',
                    width: 200,
                    height: 200,
                })
            })

            describe('FlexWrap: nowrap', () => {
                beforeEach(() => {
                    flexLayout.set({
                        flexWrap: 'nowrap',
                    })
                })

                it('places children sequentially along the y-axis and aligns children to start of x-axis', () => {
                    expect(firstChild.y()).toBe(0)
                    expect(secondChild.y()).toBe(30)
                    expect(thirdChild.y()).toBe(70)
                    expect(fourthChild.y()).toBe(120)

                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(0)
                    expect(thirdChild.x()).toBe(0)
                    expect(fourthChild.x()).toBe(0)
                })

                it('gapRow', () => {
                    flexLayout.set({ gapRow: 20 })
                    expect(firstChild.y()).toBe(0)
                    expect(secondChild.y()).toBe(50)
                    expect(thirdChild.y()).toBe(110)
                    expect(fourthChild.y()).toBe(180)
                })

                it('justifyContent: start', () => {
                    flexLayout.set({ justifyContent: 'start' })

                    expect(firstChild.y()).toBe(0)
                    expect(secondChild.y()).toBe(30)
                    expect(thirdChild.y()).toBe(70)
                    expect(fourthChild.y()).toBe(120)
                })

                it('justifyContent: center', () => {
                    flexLayout.set({ justifyContent: 'center' })
                    expect(firstChild.y()).toBe(15)
                    expect(secondChild.y()).toBe(45)
                    expect(thirdChild.y()).toBe(85)
                    expect(fourthChild.y()).toBe(135)
                })

                it('justifyContent: end', () => {
                    flexLayout.set({ justifyContent: 'end' })

                    expect(firstChild.y()).toBe(30)
                    expect(secondChild.y()).toBe(60)
                    expect(thirdChild.y()).toBe(100)
                    expect(fourthChild.y()).toBe(150)
                })

                it('justifyContent: space-between', () => {
                    flexLayout.set({ justifyContent: 'space-between' })

                    expect(firstChild.y()).toBe(0)
                    expect(secondChild.y()).toBe(40)
                    expect(thirdChild.y()).toBe(90)
                    expect(fourthChild.y()).toBe(150)
                })

                it('justifyContent: space-around', () => {
                    flexLayout.set({ justifyContent: 'space-around' })

                    expect(firstChild.y()).toBe(3.75)
                    expect(secondChild.y()).toBe(41.25)
                    expect(thirdChild.y()).toBe(88.75)
                    expect(fourthChild.y()).toBe(146.25)
                })

                it('justifyContent: space-evenly', () => {
                    flexLayout.set({ justifyContent: 'space-evenly' })

                    expect(firstChild.y()).toBe(6)
                    expect(secondChild.y()).toBe(42)
                    expect(thirdChild.y()).toBe(88)
                    expect(fourthChild.y()).toBe(144)
                })

                it('alignItems: start', () => {
                    flexLayout.set({ alignItems: 'start' })

                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(0)
                    expect(thirdChild.x()).toBe(0)
                    expect(fourthChild.x()).toBe(0)
                })

                it('alignItems: center', () => {
                    flexLayout.set({ alignItems: 'center' })

                    expect(firstChild.x()).toBe(80)
                    expect(secondChild.x()).toBe(90)
                    expect(thirdChild.x()).toBe(60)
                    expect(fourthChild.x()).toBe(85)
                })

                it('alignItems: end', () => {
                    flexLayout.set({ alignItems: 'end' })

                    expect(firstChild.x()).toBe(160)
                    expect(secondChild.x()).toBe(180)
                    expect(thirdChild.x()).toBe(120)
                    expect(fourthChild.x()).toBe(170)
                })
            })

            describe('FlexWrap: wrap', () => {
                beforeEach(() => {
                    flexLayout.set({
                        flexWrap: 'wrap',
                        height: 100,
                    })
                })

                it('places children sequentially along the y-axis and aligns children to start of x-axis', () => {
                    expect(firstChild.y()).toBe(0)
                    expect(secondChild.y()).toBe(30)
                    expect(thirdChild.y()).toBe(0)
                    expect(fourthChild.y()).toBe(50)

                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(0)
                    expect(thirdChild.x()).toBe(40)
                    expect(fourthChild.x()).toBe(40)
                })

                it('gapRow', () => {
                    flexLayout.set({ gapRow: 20 })

                    expect(firstChild.y()).toBe(0)
                    expect(secondChild.y()).toBe(50)
                    expect(thirdChild.y()).toBe(0)
                    expect(fourthChild.y()).toBe(0)
                })

                it('gapColumn', () => {
                    flexLayout.set({ gapColumn: 20 })

                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(0)
                    expect(thirdChild.x()).toBe(60)
                    expect(fourthChild.x()).toBe(60)
                })

                it('justifyContent: start', () => {
                    flexLayout.set({ justifyContent: 'start' })

                    expect(firstChild.y()).toBe(0)
                    expect(secondChild.y()).toBe(30)
                    expect(thirdChild.y()).toBe(0)
                    expect(fourthChild.y()).toBe(50)
                })

                it('justifyContent: center', () => {
                    flexLayout.set({ justifyContent: 'center' })

                    expect(firstChild.y()).toBe(15)
                    expect(secondChild.y()).toBe(45)
                    expect(thirdChild.y()).toBe(0)
                    expect(fourthChild.y()).toBe(50)
                })

                it('justifyContent: end', () => {
                    flexLayout.set({ justifyContent: 'end' })

                    expect(firstChild.y()).toBe(30)
                    expect(secondChild.y()).toBe(60)
                    expect(thirdChild.y()).toBe(0)
                    expect(fourthChild.y()).toBe(50)
                })

                it('justifyContent: space-between', () => {
                    flexLayout.set({ justifyContent: 'space-between' })

                    expect(firstChild.y()).toBe(0)
                    expect(secondChild.y()).toBe(60)
                    expect(thirdChild.y()).toBe(0)
                    expect(fourthChild.y()).toBe(50)
                })

                it('justifyContent: space-around', () => {
                    flexLayout.set({ justifyContent: 'space-around' })

                    expect(firstChild.y()).toBe(7.5)
                    expect(secondChild.y()).toBe(52.5)
                    expect(thirdChild.y()).toBe(0)
                    expect(fourthChild.y()).toBe(50)
                })

                it('justifyContent: space-evenly', () => {
                    flexLayout.set({ justifyContent: 'space-evenly' })

                    expect(firstChild.y()).toBe(10)
                    expect(secondChild.y()).toBe(50)
                    expect(thirdChild.y()).toBe(0)
                    expect(fourthChild.y()).toBe(50)
                })

                it('alignItems: start', () => {
                    flexLayout.set({ alignItems: 'start' })

                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(0)
                    expect(thirdChild.x()).toBe(40)
                    expect(fourthChild.x()).toBe(40)
                })

                it('alignItems: center', () => {
                    flexLayout.set({ alignItems: 'center' })

                    expect(firstChild.x()).toBe(26.666666666666668)
                    expect(secondChild.x()).toBe(36.66666666666667)
                    expect(thirdChild.x()).toBe(66.66666666666667)
                    expect(fourthChild.x()).toBe(91.66666666666667)
                })

                it('alignItems: end', () => {
                    flexLayout.set({ alignItems: 'end' })

                    expect(firstChild.x()).toBe(80)
                    expect(secondChild.x()).toBe(100)
                    expect(thirdChild.x()).toBe(120)
                    expect(fourthChild.x()).toBe(170)
                })

                it('alignContent: start', () => {
                    flexLayout.set({ alignContent: 'start' })

                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(0)
                    expect(thirdChild.x()).toBe(40)
                    expect(fourthChild.x()).toBe(40)
                })

                it('alignContent: center', () => {
                    flexLayout.set({ alignContent: 'center' })

                    expect(firstChild.x()).toBe(26.666666666666668)
                    expect(secondChild.x()).toBe(26.666666666666668)
                    expect(thirdChild.x()).toBe(66.66666666666667)
                    expect(fourthChild.x()).toBe(66.66666666666667)
                })

                it('alignContent: end', () => {
                    flexLayout.set({ alignContent: 'end' })

                    expect(firstChild.x()).toBe(80)
                    expect(secondChild.x()).toBe(80)
                    expect(thirdChild.x()).toBe(120)
                    expect(fourthChild.x()).toBe(120)
                })

                it('alignContent: space-between', () => {
                    flexLayout.set({ alignContent: 'space-between' })

                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(0)
                    expect(thirdChild.x()).toBe(120)
                    expect(fourthChild.x()).toBe(120)
                })

                it('alignContent: space-around', () => {
                    flexLayout.set({ alignContent: 'space-around' })

                    expect(firstChild.x()).toBe(20)
                    expect(secondChild.x()).toBe(20)
                    expect(thirdChild.x()).toBe(100)
                    expect(fourthChild.x()).toBe(100)
                })

                it('alignContent: space-evenly', () => {
                    flexLayout.set({ alignContent: 'space-evenly' })

                    expect(firstChild.x()).toBe(26.666666666666668)
                    expect(secondChild.x()).toBe(26.666666666666668)
                    expect(thirdChild.x()).toBe(93.33333333333334)
                    expect(fourthChild.x()).toBe(93.33333333333334)
                })

                it('alignItems: start -- alignContent: *', () => {
                    flexLayout.set({ alignItems: 'start' })
                    flexLayout.set({ alignContent: 'start' })
                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(0)
                    expect(thirdChild.x()).toBe(40)
                    expect(fourthChild.x()).toBe(40)

                    flexLayout.set({ alignContent: 'center' })
                    expect(firstChild.x()).toBe(26.666666666666668)
                    expect(secondChild.x()).toBe(26.666666666666668)
                    expect(thirdChild.x()).toBe(66.66666666666667)
                    expect(fourthChild.x()).toBe(66.66666666666667)

                    flexLayout.set({ alignContent: 'end' })
                    expect(firstChild.x()).toBe(80)
                    expect(secondChild.x()).toBe(80)
                    expect(thirdChild.x()).toBe(120)
                    expect(fourthChild.x()).toBe(120)

                    flexLayout.set({ alignContent: 'space-between' })
                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(0)
                    expect(thirdChild.x()).toBe(120)
                    expect(fourthChild.x()).toBe(120)

                    flexLayout.set({ alignContent: 'space-around' })
                    expect(firstChild.x()).toBe(20)
                    expect(secondChild.x()).toBe(20)
                    expect(thirdChild.x()).toBe(100)
                    expect(fourthChild.x()).toBe(100)

                    flexLayout.set({ alignContent: 'space-evenly' })
                    expect(firstChild.x()).toBe(26.666666666666668)
                    expect(secondChild.x()).toBe(26.666666666666668)
                    expect(thirdChild.x()).toBe(93.33333333333334)
                    expect(fourthChild.x()).toBe(93.33333333333334)
                })

                it('alignItems: center -- alignContent: *', () => {
                    flexLayout.set({ alignItems: 'center' })
                    flexLayout.set({ alignContent: 'start' })
                    expect(firstChild.x()).toBe(26.666666666666668)
                    expect(secondChild.x()).toBe(36.66666666666667)
                    expect(thirdChild.x()).toBe(66.66666666666667)
                    expect(fourthChild.x()).toBe(91.66666666666667)

                    flexLayout.set({ alignContent: 'center' })
                    expect(firstChild.x()).toBe(26.666666666666668)
                    expect(secondChild.x()).toBe(36.66666666666667)
                    expect(thirdChild.x()).toBe(66.66666666666667)
                    expect(fourthChild.x()).toBe(91.66666666666667)

                    flexLayout.set({ alignContent: 'end' })
                    expect(firstChild.x()).toBe(26.666666666666668)
                    expect(secondChild.x()).toBe(36.66666666666667)
                    expect(thirdChild.x()).toBe(66.66666666666667)
                    expect(fourthChild.x()).toBe(91.66666666666667)

                    flexLayout.set({ alignContent: 'space-between' })
                    expect(firstChild.x()).toBe(26.666666666666668)
                    expect(secondChild.x()).toBe(36.66666666666667)
                    expect(thirdChild.x()).toBe(146.66666666666666)
                    expect(fourthChild.x()).toBe(171.66666666666666)

                    flexLayout.set({ alignContent: 'space-around' })
                    expect(firstChild.x()).toBe(26.666666666666668)
                    expect(secondChild.x()).toBe(36.66666666666667)
                    expect(thirdChild.x()).toBe(106.66666666666667)
                    expect(fourthChild.x()).toBe(131.66666666666669)

                    flexLayout.set({ alignContent: 'space-evenly' })
                    expect(firstChild.x()).toBe(26.666666666666668)
                    expect(secondChild.x()).toBe(36.66666666666667)
                    expect(thirdChild.x()).toBe(93.33333333333334)
                    expect(fourthChild.x()).toBe(118.33333333333334)
                })

                it('alignItems: end -- alignContent: *', () => {
                    flexLayout.set({ alignItems: 'end' })
                    flexLayout.set({ alignContent: 'start' })
                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(20)
                    expect(thirdChild.x()).toBe(40)
                    expect(fourthChild.x()).toBe(90)

                    flexLayout.set({ alignContent: 'center' })
                    expect(firstChild.x()).toBe(26.666666666666668)
                    expect(secondChild.x()).toBe(46.66666666666667)
                    expect(thirdChild.x()).toBe(66.66666666666667)
                    expect(fourthChild.x()).toBe(116.66666666666667)

                    flexLayout.set({ alignContent: 'end' })
                    expect(firstChild.x()).toBe(80)
                    expect(secondChild.x()).toBe(100)
                    expect(thirdChild.x()).toBe(120)
                    expect(fourthChild.x()).toBe(170)

                    flexLayout.set({ alignContent: 'space-between' })
                    expect(firstChild.x()).toBe(0)
                    expect(secondChild.x()).toBe(20)
                    expect(thirdChild.x()).toBe(120)
                    expect(fourthChild.x()).toBe(170)

                    flexLayout.set({ alignContent: 'space-around' })
                    expect(firstChild.x()).toBe(20)
                    expect(secondChild.x()).toBe(40)
                    expect(thirdChild.x()).toBe(100)
                    expect(fourthChild.x()).toBe(150)

                    flexLayout.set({ alignContent: 'space-evenly' })
                    expect(firstChild.x()).toBe(26.666666666666668)
                    expect(secondChild.x()).toBe(46.66666666666667)
                    expect(thirdChild.x()).toBe(93.33333333333334)
                    expect(fourthChild.x()).toBe(143.33333333333334)
                })
            })
        })

        describe.todo('Directon: row-reverse', () => {})
        describe.todo('Directon: column-reverse', () => {})
    })

    describe.todo('Grid layout aligning', () => {
        let gridLayout: LayoutBlock
        let firstChild: Block<any>
        let secondChild: Block<any>
        let thirdChild: Block<any>
        let fourthChild: Block<any>

        beforeEach(() => {
            gridLayout = new LayoutBlock({
                x: 0,
                y: 0,
                width: 200,
                height: 200,
                layout: 'grid',
            })

            firstChild = new Block({ width: 10, height: 5 })
            secondChild = new Block({ width: 10, height: 5 })
            thirdChild = new Block({ width: 10, height: 5 })
            fourthChild = new Block({ width: 10, height: 5 })

            gridLayout.addChild(
                firstChild,
                secondChild,
                thirdChild,
                fourthChild
            )
            gridLayout.render()
        })
    })
})
