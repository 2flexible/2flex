import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Block, Canvas, LayoutBlock } from '@2flexible/2flex'
import { flush, removeCanvasElements } from './helpers'

let canvas: Canvas
let layout: LayoutBlock

// a layout block only hands out the coordinates to its childs on the next
// pass of the canvas, so a single flush is not always enough to read a
// settled result
const settle = async (block: LayoutBlock) => {
    block.__invokeChange()
    await flush(2)
}

const positions = (blocks: Block[]) =>
    blocks.map((block) => [block.x(), block.y()])

const childBlocksOf = (block: LayoutBlock) => {
    const childs: Block[] = []
    block.listOnlyChilds((child: Block) => childs.push(child))
    return childs
}

// the blocks of a layout point back at their parent, so a deep comparison of a
// reordered list walks through the whole canvas instead of comparing the order
const expectOrder = (block: LayoutBlock, expected: Block[]) => {
    const childs = childBlocksOf(block)
    expect(childs).toHaveLength(expected.length)
    childs.forEach((child, index) => expect(child).toBe(expected[index]))
}

const createChilds = (count: number, width: number, height: number) =>
    Array.from({ length: count }, () => new Block({ width, height }))

describe('LayoutBlock', () => {
    afterEach(() => {
        removeCanvasElements()
    })

    describe('layout type', () => {
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            await flush()
        })
        it('should lay out childs in a row by default', async () => {
            layout = new LayoutBlock({ width: 300, height: 200 })
            const [first, second] = createChilds(2, 50, 50)
            layout.addChild(first)
            layout.addChild(second)
            canvas.add(layout)
            await flush()
            expect(layout.layout()).toBe('flex')
            expect(layout.flexDirection()).toBe('row')
            expect(layout.flexWrap()).toBe('nowrap')
            expect(positions([first, second])).toStrictEqual([
                [0, 0],
                [50, 0],
            ])
        })
        it('should set direction and wrap by flex flow', async () => {
            layout = new LayoutBlock({ width: 300, height: 200 })
            expect(layout.flexFlow(['column', 'wrap'])).toStrictEqual([
                'column',
                'wrap',
            ])
            expect(layout.flexDirection()).toBe('column')
            expect(layout.flexWrap()).toBe('wrap')
        })
        it('should read the current direction and wrap by flex flow', () => {
            layout = new LayoutBlock({
                width: 300,
                height: 200,
                flexDirection: 'column',
                flexWrap: 'wrap',
            })
            expect(layout.flexFlow()).toStrictEqual(['column', 'wrap'])
        })
        it('should switch to a grid layout', async () => {
            layout = new LayoutBlock({
                width: 200,
                height: 200,
                gridTemplateColumns: [100, 100],
            })
            const childs = createChilds(4, 50, 50)
            childs.forEach((child) => layout.addChild(child))
            canvas.add(layout)
            await flush()
            // without a grid the childs share a single row
            expect(layout.layout()).toBe('flex')
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [50, 0],
                [100, 0],
                [150, 0],
            ])
            layout.set({ layout: 'grid' })
            await settle(layout)
            expect(layout.layout()).toBe('grid')
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [100, 0],
                [0, 50],
                [100, 50],
            ])
        })
        it('should size an inline-flex layout block to its childs', async () => {
            layout = new LayoutBlock({ layout: 'inline-flex' })
            const childs = createChilds(3, 50, 40)
            childs.forEach((child) => layout.addChild(child))
            canvas.add(layout)
            await flush()
            expect([layout.width(), layout.height()]).toStrictEqual([150, 40])
        })
        it('should size an inline-grid layout block to its childs', async () => {
            layout = new LayoutBlock({ layout: 'inline-grid' })
            const childs = createChilds(3, 50, 40)
            childs.forEach((child) => layout.addChild(child))
            canvas.add(layout)
            await flush()
            expect([layout.width(), layout.height()]).toStrictEqual([150, 40])
        })
        it('should lay out a grid back as a row', async () => {
            layout = new LayoutBlock({
                width: 200,
                height: 200,
                layout: 'grid',
                gridTemplateColumns: [100, 100],
            })
            const childs = createChilds(4, 50, 50)
            childs.forEach((child) => layout.addChild(child))
            canvas.add(layout)
            await flush()
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [100, 0],
                [0, 50],
                [100, 50],
            ])
            layout.set({ layout: 'flex' })
            await settle(layout)
            // the tracks of the template are ignored once it is a row again
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [50, 0],
                [100, 0],
                [150, 0],
            ])
            expect(layout.__childsContainer).toStrictEqual({
                width: 200,
                height: 50,
            })
        })
        it('should size an inline-flex column to its childs', async () => {
            layout = new LayoutBlock({
                layout: 'inline-flex',
                flexDirection: 'column',
            })
            const childs = createChilds(3, 40, 30)
            childs.forEach((child) => layout.addChild(child))
            canvas.add(layout)
            await flush()
            // a column takes the widest of its childs and sums up their heights
            expect([layout.width(), layout.height()]).toStrictEqual([40, 90])
        })
        it('should size an inline-grid to the tracks of its template', async () => {
            layout = new LayoutBlock({
                layout: 'inline-grid',
                gridTemplateColumns: [100, 100],
            })
            const childs = createChilds(4, 50, 50)
            childs.forEach((child) => layout.addChild(child))
            canvas.add(layout)
            await flush()
            // the tracks are summed up, so the second row of childs is not
            // taken into the height
            expect([layout.width(), layout.height()]).toStrictEqual([200, 50])
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [100, 0],
                [0, 50],
                [100, 50],
            ])
        })
        it('should keep an explicit size of an inline layout block', async () => {
            layout = new LayoutBlock({
                layout: 'inline-flex',
                width: 300,
                height: 200,
            })
            const childs = createChilds(3, 50, 40)
            childs.forEach((child) => layout.addChild(child))
            canvas.add(layout)
            await flush()
            expect([layout.width(), layout.height()]).toStrictEqual([300, 200])
        })
    })

    describe('child ordering', () => {
        let childs: Block[]
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            layout = new LayoutBlock({ width: 300, height: 200 })
            childs = createChilds(3, 50, 50)
            childs.forEach((child) => layout.addChild(child))
            canvas.add(layout)
            await flush()
        })
        it('should keep the order the childs were added in', () => {
            expect(childBlocksOf(layout)).toStrictEqual(childs)
            expect(childs.map((child) => child.order())).toStrictEqual([
                1, 2, 3,
            ])
        })
        it('should lay childs out by their order', async () => {
            const [first, second, third] = childs
            first.set({ order: 3 })
            second.set({ order: 1 })
            third.set({ order: 2 })
            await settle(layout)
            expect(childBlocksOf(layout)).toStrictEqual([second, third, first])
            // the child with the lowest order takes the first place of the row
            expect(positions(childs)).toStrictEqual([
                [100, 0],
                [0, 0],
                [50, 0],
            ])
        })
        it('should move a child which got the highest order to the end', async () => {
            const [first, second, third] = childs
            expect(childBlocksOf(layout)).toStrictEqual([first, second, third])
            second.set({ order: 10 })
            await settle(layout)
            expect(childBlocksOf(layout)).toStrictEqual([first, third, second])
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [100, 0],
                [50, 0],
            ])
        })
        it('should lay out a child which was added later', async () => {
            const later = new Block({ width: 50, height: 50 })
            layout.addChild(later)
            await flush()
            expect(childBlocksOf(layout)).toStrictEqual([...childs, later])
            expect([later.x(), later.y()]).toStrictEqual([150, 0])
            expect(layout.__childsContainer).toStrictEqual({
                width: 200,
                height: 50,
            })
        })
        it('should lay out the remaining childs after a removal', async () => {
            const [first, second, third] = childs
            layout.removeChild(second)
            await flush()
            expect(childBlocksOf(layout)).toStrictEqual([first, third])
            expect(positions([first, third])).toStrictEqual([
                [0, 0],
                [50, 0],
            ])
        })
        it('should keep the order of a child around the removed one', async () => {
            const [first, second, third] = childs
            second.set({ order: 9 })
            await settle(layout)
            expect(childBlocksOf(layout)).toStrictEqual([first, third, second])
            layout.removeChild(second)
            await flush()
            // the remaining childs keep the orders they were given
            expect([first.order(), third.order()]).toStrictEqual([1, 3])
            expectOrder(layout, [first, third])
        })
        it('should lay out a child which was added with its own order', async () => {
            const [first, second, third] = childs
            const first2 = new Block({ width: 50, height: 50, order: 0 })
            layout.addChild(first2)
            await flush()
            expectOrder(layout, [first2, first, second, third])
            expect(positions([first2, first, second, third])).toStrictEqual([
                [0, 0],
                [50, 0],
                [100, 0],
                [150, 0],
            ])
        })
        it('should lay out a child with a negative order first', async () => {
            const [first, second, third] = childs
            first.set({ order: -1 })
            second.set({ order: 5 })
            await settle(layout)
            expect([
                first.order(),
                second.order(),
                third.order(),
            ]).toStrictEqual([-1, 5, 3])
            expectOrder(layout, [first, third, second])
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [100, 0],
                [50, 0],
            ])
        })
        it('should keep the given order of childs with an equal order', async () => {
            childs.forEach((child) => child.set({ order: 2 }))
            await settle(layout)
            expectOrder(layout, childs)
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [50, 0],
                [100, 0],
            ])
        })
    })

    describe('flex row', () => {
        let childs: Block[]
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            layout = new LayoutBlock({ width: 300, height: 200 })
            childs = createChilds(3, 50, 50)
            childs.forEach((child) => layout.addChild(child))
            canvas.add(layout)
            await flush()
        })
        it('should place the childs next to each other', () => {
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [50, 0],
                [100, 0],
            ])
        })
        it('should measure the childs container', () => {
            expect(layout.__childsContainer).toStrictEqual({
                width: 150,
                height: 50,
            })
        })
        it('should add the column gap between the childs', async () => {
            layout.set({ gap: 10 })
            await settle(layout)
            expect([layout.gapColumn(), layout.gapRow()]).toStrictEqual([
                10, 10,
            ])
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [60, 0],
                [120, 0],
            ])
        })
        it('should take the margins of a child into account', async () => {
            layout.removeChild(childs[1])
            layout.removeChild(childs[2])
            childs[0].set({ margin: 10 })
            const second = new Block({ width: 50, height: 50 })
            layout.addChild(second)
            await flush()
            // the margin of the first child is the space it takes in the row
            expect([childs[0].x(), second.x()]).toStrictEqual([10, 70])
        })
        it('should place the next child by the flex basis', async () => {
            childs[0].set({ flexBasis: 80 })
            await settle(layout)
            // the basis is the size the child takes up in the row
            expect([childs[0].width(), childs[1].x()]).toStrictEqual([80, 80])
        })
        it('should shrink a child which is taller than the layout block', async () => {
            const tallChild = new Block({ width: 50, height: 300 })
            layout.addChild(tallChild)
            await flush()
            expect([tallChild.x(), tallChild.height()]).toStrictEqual([
                150, 200,
            ])
        })
        it('should keep a child which fits into the layout block height', () => {
            expect(childs.map((child) => child.height())).toStrictEqual([
                50, 50, 50,
            ])
        })
    })

    describe('flex column', () => {
        let childs: Block[]
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            layout = new LayoutBlock({
                width: 300,
                height: 200,
                flexDirection: 'column',
            })
            childs = createChilds(3, 50, 50)
            childs.forEach((child) => layout.addChild(child))
            canvas.add(layout)
            await flush()
        })
        it('should place the childs below each other', () => {
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [0, 50],
                [0, 100],
            ])
        })
        it('should measure the childs container', () => {
            expect(layout.__childsContainer).toStrictEqual({
                width: 50,
                height: 150,
            })
        })
        it('should add the row gap between the childs', async () => {
            layout.set({ gap: 10 })
            await settle(layout)
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [0, 60],
                [0, 120],
            ])
        })
        it('should shrink a child which is wider than the layout block', async () => {
            const wideChild = new Block({ width: 400, height: 50 })
            layout.addChild(wideChild)
            await flush()
            expect([wideChild.y(), wideChild.width()]).toStrictEqual([150, 300])
        })
        it('should place the next child by the flex basis', async () => {
            childs[0].set({ flexBasis: 80 })
            await settle(layout)
            // the basis is the size the child takes up in the column
            expect([childs[0].height(), childs[1].y()]).toStrictEqual([80, 80])
        })
    })

    describe('reversed directions', () => {
        // the reverse directions are accepted but not reversed yet, they lay
        // their childs out like their normal counterparts do
        let childs: Block[]
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            layout = new LayoutBlock({
                width: 300,
                height: 200,
                flexDirection: 'row-reverse',
            })
            childs = createChilds(3, 50, 50)
            childs.forEach((child) => layout.addChild(child))
            canvas.add(layout)
            await flush()
        })
        it('should read a reversed direction', () => {
            expect(layout.flexDirection()).toBe('row-reverse')
        })
        it('should lay a reversed row out from its start', () => {
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [50, 0],
                [100, 0],
            ])
        })
        it('should keep the order the childs were added in', () => {
            expect(childBlocksOf(layout)).toStrictEqual(childs)
        })
        it('should center a reversed row', async () => {
            layout.set({ justifyContent: 'center' })
            await settle(layout)
            expect(positions(childs)).toStrictEqual([
                [75, 0],
                [125, 0],
                [175, 0],
            ])
        })
        it('should lay a reversed column out from its start', async () => {
            layout.set({ flexDirection: 'column-reverse' })
            await settle(layout)
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [0, 50],
                [0, 100],
            ])
        })
    })

    describe('flex wrap', () => {
        it('should wrap a row into the next line', async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            layout = new LayoutBlock({
                width: 100,
                height: 200,
                flexWrap: 'wrap',
            })
            const childs = createChilds(3, 50, 50)
            childs.forEach((child) => layout.addChild(child))
            canvas.add(layout)
            await flush()
            // two of them fit into a row, the third one starts a new one
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [50, 0],
                [0, 50],
            ])
            expect(layout.__childsContainer).toStrictEqual({
                width: 100,
                height: 100,
            })
        })
        it('should wrap a column into the next line', async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            layout = new LayoutBlock({
                width: 300,
                height: 100,
                flexDirection: 'column',
                flexWrap: 'wrap',
            })
            const childs = createChilds(3, 50, 50)
            childs.forEach((child) => layout.addChild(child))
            canvas.add(layout)
            await flush()
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [0, 50],
                [50, 0],
            ])
        })
        it('should add the gap between the wrapped lines', async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            layout = new LayoutBlock({
                width: 120,
                height: 200,
                flexWrap: 'wrap',
                gap: 10,
            })
            const childs = createChilds(3, 50, 50)
            childs.forEach((child) => layout.addChild(child))
            canvas.add(layout)
            await flush()
            // two childs and their gap still fit into the row
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [60, 0],
                [0, 60],
            ])
        })
    })

    describe('flex wrap distribution', () => {
        // 3 of the 4 childs fill the 150 wide first line, so only the last line
        // has free space to distribute its child in
        let childs: Block[]
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            layout = new LayoutBlock({
                width: 150,
                height: 200,
                flexWrap: 'wrap',
            })
            childs = createChilds(4, 50, 50)
            childs.forEach((child) => layout.addChild(child))
            canvas.add(layout)
            await flush()
        })
        it('should fill every line but the last one', () => {
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [50, 0],
                [100, 0],
                [0, 50],
            ])
            expect(layout.__childsContainer).toStrictEqual({
                width: 150,
                height: 100,
            })
        })
        it('should align the childs of a line to its start', async () => {
            layout.set({ justifyContent: 'start' })
            await settle(layout)
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [50, 0],
                [100, 0],
                [0, 50],
            ])
        })
        it('should center the childs of every line', async () => {
            layout.set({ justifyContent: 'center' })
            await settle(layout)
            // the first line is full, so only the child of the last line moves
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [50, 0],
                [100, 0],
                [50, 50],
            ])
        })
        it('should align the childs of every line to its end', async () => {
            layout.set({ justifyContent: 'end' })
            await settle(layout)
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [50, 0],
                [100, 0],
                [100, 50],
            ])
        })
        it('should spread the childs of every line between its edges', async () => {
            layout.set({ justifyContent: 'space-between' })
            await settle(layout)
            // the gaps of the lines are kept apart from the gap option, so a
            // line of a single child keeps it at its start
            expect(layout.gapColumn()).toBe(0)
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [50, 0],
                [100, 0],
                [0, 50],
            ])
        })
        it('should spread the childs of every line around each other', async () => {
            layout.set({ justifyContent: 'space-around' })
            await settle(layout)
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [50, 0],
                [100, 0],
                [50, 50],
            ])
        })
        it('should spread the childs of every line evenly', async () => {
            layout.set({ justifyContent: 'space-evenly' })
            await settle(layout)
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [50, 0],
                [100, 0],
                [50, 50],
            ])
        })
        it('should center the wrapped lines', async () => {
            layout.set({ alignContent: 'center' })
            await settle(layout)
            // the 100 of free space is shared around the 2 lines
            expect(childs.map((child) => child.y())).toStrictEqual([
                100 / 3,
                100 / 3,
                100 / 3,
                100 / 3 + 50,
            ])
        })
        it('should spread the wrapped lines between the edges', async () => {
            layout.set({ alignContent: 'space-between' })
            await settle(layout)
            // the free space goes into the single gap between the 2 lines
            expect(layout.gapRow()).toBe(100)
            expect(childs.map((child) => child.y())).toStrictEqual([
                0, 0, 0, 150,
            ])
        })
        it('should spread the wrapped lines around each other', async () => {
            layout.set({ alignContent: 'space-around' })
            await settle(layout)
            expect(layout.gapRow()).toBe(50)
            expect(childs.map((child) => child.y())).toStrictEqual([
                25, 25, 25, 125,
            ])
        })
        it('should spread the wrapped lines evenly', async () => {
            layout.set({ alignContent: 'space-evenly' })
            await settle(layout)
            // the 100 of free space is split into the 3 gaps around 2 lines
            expect(layout.gapRow()).toBe(100 / 3)
            expect(childs[0].y()).toBeCloseTo(100 / 3)
            expect(childs[3].y()).toBeCloseTo(100 / 3 + 50 + 100 / 3)
        })
        it('should align the childs of a line to its cross axis start', async () => {
            layout.set({ alignItems: 'start' })
            await settle(layout)
            expect(childs.map((child) => child.y())).toStrictEqual([
                0, 0, 0, 50,
            ])
        })
        it('should center the childs of a wrapped line', async () => {
            childs[1].set({ height: 20 })
            await settle(layout)
            layout.set({ alignItems: 'center' })
            await settle(layout)
            // a short child is centered inside its own line, but the lines
            // themselves are spread over the cross axis like alignContent does
            expect(childs[0].y()).toBeCloseTo(100 / 3)
            expect(childs[1].y()).toBeCloseTo(100 / 3 + 15)
            expect(childs[3].y()).toBeCloseTo(100 / 3 + 50)
        })
        it('should align the childs of a wrapped line to its cross axis end', async () => {
            childs[1].set({ height: 20 })
            await settle(layout)
            layout.set({ alignItems: 'end' })
            await settle(layout)
            // the free space of the cross axis is handed to the lines as a
            // whole, so the childs end up below their own line instead of at
            // the end of it
            expect(childs[0].y()).toBe(100)
            expect(childs[1].y()).toBe(130)
            expect(childs[3].y()).toBe(150)
        })
        it('should not hand the free space to the lines when align content is set', async () => {
            layout.set({ alignContent: 'start', alignItems: 'end' })
            await settle(layout)
            // an explicit alignContent cancels the alignItems line offset
            expect(childs.map((child) => child.y())).toStrictEqual([
                0, 0, 0, 50,
            ])
        })
        it('should wrap a reverse row like a normal one', async () => {
            layout.set({ flexWrap: 'wrap-reverse' })
            await settle(layout)
            // the reverse wrapping is accepted but not reversed yet
            expect(layout.flexWrap()).toBe('wrap-reverse')
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [50, 0],
                [100, 0],
                [0, 50],
            ])
        })
        it('should keep a gap as the minimum of a distributed line', async () => {
            layout.set({ gap: 60, justifyContent: 'space-between' })
            await settle(layout)
            // the 60 of gap is wider than the free space of a line, so no two
            // childs fit into a line anymore and every one of them gets its own
            expect(layout.gapColumn()).toBe(60)
            expect(childs.map((child) => child.y())).toStrictEqual([
                0, 110, 220, 330,
            ])
        })
    })

    describe('wrapped column distribution', () => {
        // the first column is filled by 3 of the 4 childs, so only the second
        // column has free space left to distribute
        let childs: Block[]
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            layout = new LayoutBlock({
                width: 300,
                height: 150,
                flexDirection: 'column',
                flexWrap: 'wrap',
            })
            childs = createChilds(4, 50, 50)
            childs.forEach((child) => layout.addChild(child))
            canvas.add(layout)
            await flush()
        })
        it('should fill every column but the last one', () => {
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [0, 50],
                [0, 100],
                [50, 0],
            ])
            expect(layout.__childsContainer).toStrictEqual({
                width: 100,
                height: 150,
            })
        })
        it('should center the childs of every column', async () => {
            layout.set({ justifyContent: 'center' })
            await settle(layout)
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [0, 50],
                [0, 100],
                [50, 50],
            ])
        })
        it('should align the childs of every column to its end', async () => {
            layout.set({ justifyContent: 'end' })
            await settle(layout)
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [0, 50],
                [0, 100],
                [50, 100],
            ])
        })
        it('should spread the childs of every column between its edges', async () => {
            layout.set({ justifyContent: 'space-between' })
            await settle(layout)
            // the first column is full, so only the second one gets a gap
            expect(layout.gapRow()).toBe(0)
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [0, 50],
                [0, 100],
                [50, 0],
            ])
        })
        it('should spread the childs of every column around each other', async () => {
            layout.set({ justifyContent: 'space-around' })
            await settle(layout)
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [0, 50],
                [0, 100],
                [50, 50],
            ])
        })
        it('should spread the childs of every column evenly', async () => {
            layout.set({ justifyContent: 'space-evenly' })
            await settle(layout)
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [0, 50],
                [0, 100],
                [50, 50],
            ])
        })
        it('should center the wrapped columns', async () => {
            layout.set({ alignContent: 'center' })
            await settle(layout)
            // the 200 of free space is shared around the 2 columns
            expect(layout.gapColumn()).toBe(0)
            expect(childs.map((child) => child.x())).toStrictEqual([
                200 / 3,
                200 / 3,
                200 / 3,
                200 / 3 + 50,
            ])
        })
        it('should spread the wrapped columns between the edges', async () => {
            layout.set({ alignContent: 'space-between' })
            await settle(layout)
            expect(layout.gapColumn()).toBe(200)
            expect(childs.map((child) => child.x())).toStrictEqual([
                0, 0, 0, 250,
            ])
        })
        it('should spread the wrapped columns around each other', async () => {
            layout.set({ alignContent: 'space-around' })
            await settle(layout)
            expect(layout.gapColumn()).toBe(100)
            expect(childs.map((child) => child.x())).toStrictEqual([
                50, 50, 50, 200,
            ])
        })
        it('should spread the wrapped columns evenly', async () => {
            layout.set({ alignContent: 'space-evenly' })
            await settle(layout)
            expect(layout.gapColumn()).toBe(200 / 3)
            expect(childs[0].x()).toBeCloseTo(200 / 3)
            expect(childs[3].x()).toBeCloseTo(200 / 3 + 50 + 200 / 3)
        })
        it('should align the childs of a column to its cross axis start', async () => {
            layout.set({ alignItems: 'start' })
            await settle(layout)
            expect(childs.map((child) => child.x())).toStrictEqual([
                0, 0, 0, 50,
            ])
        })
        it('should center the childs of a wrapped column', async () => {
            layout.set({ alignItems: 'center' })
            await settle(layout)
            expect(childs[0].x()).toBeCloseTo(200 / 3)
            expect(childs[3].x()).toBeCloseTo(200 / 3 + 50)
        })
        it('should push the childs of a wrapped column out of their column', async () => {
            layout.set({ alignItems: 'end' })
            await settle(layout)
            // the free space of the cross axis is added to the start of every
            // child instead of the free space inside its own column
            expect(childs.map((child) => child.x())).toStrictEqual([
                200, 200, 200, 250,
            ])
        })
        it('should not push the childs out when align content is set', async () => {
            layout.set({ alignContent: 'start', alignItems: 'end' })
            await settle(layout)
            expect(childs.map((child) => child.x())).toStrictEqual([
                0, 0, 0, 50,
            ])
        })
    })

    describe('justify content', () => {
        let childs: Block[]
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            layout = new LayoutBlock({ width: 300, height: 200 })
            childs = createChilds(3, 50, 50)
            childs.forEach((child) => layout.addChild(child))
            canvas.add(layout)
            await flush()
        })
        it('should align a row to its start by default', () => {
            expect(layout.justifyContent()).toBe('normal')
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [50, 0],
                [100, 0],
            ])
        })
        it('should align a row to its start', async () => {
            layout.set({ justifyContent: 'start' })
            await settle(layout)
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [50, 0],
                [100, 0],
            ])
        })
        it('should center a row', async () => {
            layout.set({ justifyContent: 'center' })
            await settle(layout)
            expect(positions(childs)).toStrictEqual([
                [75, 0],
                [125, 0],
                [175, 0],
            ])
        })
        it('should align a row to its end', async () => {
            layout.set({ justifyContent: 'end' })
            await settle(layout)
            expect(positions(childs)).toStrictEqual([
                [150, 0],
                [200, 0],
                [250, 0],
            ])
        })
        it('should spread a row between its edges', async () => {
            layout.set({ justifyContent: 'space-between' })
            await settle(layout)
            // the free space of 150 is split into the 2 gaps between 3 childs
            expect(layout.gapColumn()).toBe(75)
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [125, 0],
                [250, 0],
            ])
        })
        it('should spread a row around its childs', async () => {
            layout.set({ justifyContent: 'space-around' })
            await settle(layout)
            expect(positions(childs)).toStrictEqual([
                [25, 0],
                [125, 0],
                [225, 0],
            ])
        })
        it('should spread a row evenly', async () => {
            layout.set({ justifyContent: 'space-evenly' })
            await settle(layout)
            expect(positions(childs)).toStrictEqual([
                [37.5, 0],
                [125, 0],
                [212.5, 0],
            ])
        })
        it('should not move a row which fills its layout block', async () => {
            layout.set({ width: 150, justifyContent: 'center' })
            await settle(layout)
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [50, 0],
                [100, 0],
            ])
        })
        it('should set both axes by place content', async () => {
            layout.set({ placeContent: 'center' })
            await settle(layout)
            expect([
                layout.justifyContent(),
                layout.alignContent(),
            ]).toStrictEqual(['center', 'center'])
        })
        it('should center a column', async () => {
            layout.set({ flexDirection: 'column', justifyContent: 'center' })
            await settle(layout)
            expect(positions(childs)).toStrictEqual([
                [0, 25],
                [0, 75],
                [0, 125],
            ])
        })
        it('should align a column to its end', async () => {
            layout.set({ flexDirection: 'column', justifyContent: 'end' })
            await settle(layout)
            expect(positions(childs)).toStrictEqual([
                [0, 50],
                [0, 100],
                [0, 150],
            ])
        })
        it('should spread a column between its edges', async () => {
            layout.set({
                flexDirection: 'column',
                justifyContent: 'space-between',
            })
            await settle(layout)
            expect(layout.gapRow()).toBe(25)
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [0, 75],
                [0, 150],
            ])
        })
        it('should spread a column evenly', async () => {
            layout.set({
                flexDirection: 'column',
                justifyContent: 'space-evenly',
            })
            await settle(layout)
            expect(positions(childs)).toStrictEqual([
                [0, 12.5],
                [0, 75],
                [0, 137.5],
            ])
        })
    })

    describe('align items', () => {
        let childs: Block[]
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            layout = new LayoutBlock({ width: 300, height: 200 })
            childs = createChilds(3, 50, 50)
            childs.forEach((child) => layout.addChild(child))
            canvas.add(layout)
            await flush()
        })
        it('should align a row to its cross axis start by default', () => {
            expect(layout.alignItems()).toBe('normal')
            expect(childs.map((child) => child.y())).toStrictEqual([0, 0, 0])
        })
        it('should align a row to its cross axis start', async () => {
            layout.set({ alignItems: 'start' })
            await settle(layout)
            expect(childs.map((child) => child.y())).toStrictEqual([0, 0, 0])
        })
        it('should center a row on its cross axis', async () => {
            layout.set({ alignItems: 'center' })
            await settle(layout)
            // the 150 of free space is shared above and below the childs
            expect(childs.map((child) => child.y())).toStrictEqual([75, 75, 75])
        })
        it('should align a row to its cross axis end', async () => {
            layout.set({ alignItems: 'end' })
            await settle(layout)
            expect(childs.map((child) => child.y())).toStrictEqual([
                150, 150, 150,
            ])
        })
        it('should center a column on its cross axis', async () => {
            layout.set({ flexDirection: 'column', alignItems: 'center' })
            await settle(layout)
            expect(childs.map((child) => child.x())).toStrictEqual([
                125, 125, 125,
            ])
        })
        it('should align a column to its cross axis end', async () => {
            layout.set({ flexDirection: 'column', alignItems: 'end' })
            await settle(layout)
            expect(childs.map((child) => child.x())).toStrictEqual([
                250, 250, 250,
            ])
        })
        it('should set both axes by place items', async () => {
            layout.set({ layout: 'grid', placeItems: 'center' })
            await settle(layout)
            expect([layout.alignItems(), layout.justifyItems()]).toStrictEqual([
                'center',
                'center',
            ])
        })
    })

    describe('align content', () => {
        it('should be ignored without wrapped lines', async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            layout = new LayoutBlock({ width: 300, height: 200 })
            const childs = createChilds(3, 50, 50)
            childs.forEach((child) => layout.addChild(child))
            canvas.add(layout)
            await flush()
            layout.set({ alignContent: 'center' })
            await settle(layout)
            expect(layout.alignContent()).toBe('center')
            expect(childs.map((child) => child.y())).toStrictEqual([0, 0, 0])
        })
        it('should not spread the lines without free space', async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            layout = new LayoutBlock({ width: 300, height: 200 })
            const childs = createChilds(3, 50, 50)
            childs.forEach((child) => layout.addChild(child))
            canvas.add(layout)
            await flush()
            layout.set({ alignContent: 'space-between' })
            await settle(layout)
            // every spacing value is kept without wrapping lines
            expect(layout.alignContent()).toBe('space-between')
            expect(layout.gapRow()).toBe(0)
            expect(childs.map((child) => child.y())).toStrictEqual([0, 0, 0])
        })
        it('should move the wrapped lines to their cross axis end', async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            layout = new LayoutBlock({
                width: 100,
                height: 200,
                flexWrap: 'wrap',
            })
            const childs = createChilds(3, 50, 50)
            childs.forEach((child) => layout.addChild(child))
            canvas.add(layout)
            await flush()
            layout.set({ alignContent: 'end' })
            await settle(layout)
            // the two lines are 100 high and packed below the 100 of free space
            expect(positions(childs)).toStrictEqual([
                [0, 100],
                [50, 100],
                [0, 150],
            ])
        })
    })

    describe('gap', () => {
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            await flush()
        })
        it('should set both axes by a single value', () => {
            layout = new LayoutBlock({ width: 300, height: 200 })
            expect(layout.gap(10)).toBe(10)
            expect([layout.gapColumn(), layout.gapRow()]).toStrictEqual([
                10, 10,
            ])
        })
        it('should set the row and the column by a pair', () => {
            layout = new LayoutBlock({ width: 300, height: 200 })
            expect(layout.gap([10, 20])).toStrictEqual([10, 20])
            expect([layout.gapRow(), layout.gapColumn()]).toStrictEqual([
                10, 20,
            ])
        })
        it('should convert the units of a gap', () => {
            layout = new LayoutBlock({ width: 300, height: 200 })
            expect(layout.gap(['10px', '20px'])).toStrictEqual([10, 20])
            expect([layout.gapRow(), layout.gapColumn()]).toStrictEqual([
                10, 20,
            ])
        })
        it('should reset a gap pair to zero', () => {
            layout = new LayoutBlock({ width: 300, height: 200, gap: [10, 20] })
            expect(layout.gap()).toStrictEqual([10, 20])
            expect([layout.gapRow(), layout.gapColumn()]).toStrictEqual([
                10, 20,
            ])
        })
    })

    describe('grid layout', () => {
        let childs: Block[]
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            layout = new LayoutBlock({
                width: 200,
                height: 200,
                layout: 'grid',
                gridTemplateColumns: [100, 100],
            })
            childs = createChilds(4, 50, 50)
            childs.forEach((child) => layout.addChild(child))
            canvas.add(layout)
            await flush()
        })
        it('should place the childs in rows by the number of columns', () => {
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [100, 0],
                [0, 50],
                [100, 50],
            ])
        })
        it('should measure the childs container by the tracks', () => {
            // both columns of the template are 100 wide, the rows are as high
            // as their tallest child
            expect(layout.__childsContainer).toStrictEqual({
                width: 200,
                height: 100,
            })
        })
        it('should place the rows by the row template', async () => {
            layout.set({ gridTemplateRows: [80, 80] })
            await settle(layout)
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [100, 0],
                [0, 80],
                [100, 80],
            ])
        })
        it('should add the grid gaps', async () => {
            layout.set({ gap: [10, 20] })
            await settle(layout)
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [120, 0],
                [0, 60],
                [120, 60],
            ])
        })
        it('should center the whole grid', async () => {
            // the tracks of the template are 200 wide, so the grid can only be
            // moved inside a wider layout block
            layout.set({ width: 300 })
            await settle(layout)
            layout.set({ justifyContent: 'center' })
            await settle(layout)
            expect(positions(childs)).toStrictEqual([
                [50, 0],
                [150, 0],
                [50, 50],
                [150, 50],
            ])
        })
        it('should not move a grid which fills its layout block', async () => {
            layout.set({ justifyContent: 'center' })
            await settle(layout)
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [100, 0],
                [0, 50],
                [100, 50],
            ])
        })
        it('should not move a child inside its own column and row by default', async () => {
            childs[2].set({ width: 20, height: 20 })
            await settle(layout)
            expect([layout.justifyItems(), layout.alignItems()]).toStrictEqual([
                'normal',
                'normal',
            ])
            expect(childs[2].x()).toBe(0)
            expect(childs[2].y()).toBe(50)
        })
        it('should align a child to the start of its own column', async () => {
            childs[2].set({ width: 20 })
            await settle(layout)
            layout.set({ justifyItems: 'start' })
            await settle(layout)
            expect(childs[2].x()).toBe(0)
        })
        it('should center a child inside its own column', async () => {
            // the second child of the column is 20 wide inside a 100 wide one
            childs[2].set({ width: 20 })
            await settle(layout)
            layout.set({ justifyItems: 'center' })
            await settle(layout)
            expect(childs[2].x()).toBe(40)
        })
        it('should align a child to the end of its own column', async () => {
            childs[2].set({ width: 20 })
            await settle(layout)
            layout.set({ justifyItems: 'end' })
            await settle(layout)
            expect(childs[2].x()).toBe(80)
        })
        it('should align a child to the start of its own row', async () => {
            childs[1].set({ height: 20 })
            await settle(layout)
            layout.set({ alignItems: 'start' })
            await settle(layout)
            expect(childs[1].y()).toBe(0)
        })
        it('should center a child inside its own row', async () => {
            // the second child of the row is 20 high inside a 50 high one
            childs[1].set({ height: 20 })
            await settle(layout)
            layout.set({ alignItems: 'center' })
            await settle(layout)
            expect(childs[1].y()).toBe(15)
        })
        it('should align a child to the end of its own row', async () => {
            childs[1].set({ height: 20 })
            await settle(layout)
            layout.set({ alignItems: 'end' })
            await settle(layout)
            expect(childs[1].y()).toBe(30)
        })
        it('should set both item axes by place items', async () => {
            layout.set({ placeItems: 'end' })
            await settle(layout)
            expect([layout.justifyItems(), layout.alignItems()]).toStrictEqual([
                'end',
                'end',
            ])
            childs[2].set({ width: 20, height: 20 })
            await settle(layout)
            // the child is pushed to the far corner of its own grid cell
            expect([childs[2].x(), childs[2].y()]).toStrictEqual([80, 80])
        })
    })

    describe('grid justify content', () => {
        let childs: Block[]
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            // the columns of the template are 200 wide, so a wider layout block
            // leaves room to distribute them in
            layout = new LayoutBlock({
                width: 300,
                height: 200,
                layout: 'grid',
                gridTemplateColumns: [100, 100],
            })
            childs = createChilds(4, 50, 50)
            childs.forEach((child) => layout.addChild(child))
            canvas.add(layout)
            await flush()
        })
        it('should align the columns to their start by default', () => {
            expect(layout.justifyContent()).toBe('normal')
            expect(childs.map((child) => child.x())).toStrictEqual([
                0, 100, 0, 100,
            ])
        })
        it('should align the columns to their start', async () => {
            layout.set({ justifyContent: 'start' })
            await settle(layout)
            expect(childs.map((child) => child.x())).toStrictEqual([
                0, 100, 0, 100,
            ])
        })
        it('should center the columns', async () => {
            layout.set({ justifyContent: 'center' })
            await settle(layout)
            // the 100 of free space is shared around the 200 wide grid
            expect(childs.map((child) => child.x())).toStrictEqual([
                50, 150, 50, 150,
            ])
        })
        it('should align the columns to their end', async () => {
            layout.set({ justifyContent: 'end' })
            await settle(layout)
            expect(childs.map((child) => child.x())).toStrictEqual([
                100, 200, 100, 200,
            ])
        })
        it('should spread the columns between the edges', async () => {
            layout.set({ justifyContent: 'space-between' })
            await settle(layout)
            expect(layout.gapColumn()).toBe(100)
            expect(childs.map((child) => child.x())).toStrictEqual([
                0, 200, 0, 200,
            ])
        })
        it('should spread the columns around each other', async () => {
            layout.set({ justifyContent: 'space-around' })
            await settle(layout)
            expect(layout.gapColumn()).toBe(50)
            expect(childs.map((child) => child.x())).toStrictEqual([
                25, 175, 25, 175,
            ])
        })
        it('should spread the columns evenly', async () => {
            layout.set({ justifyContent: 'space-evenly' })
            await settle(layout)
            // the 100 of free space is split into the 3 gaps around 2 columns
            expect(layout.gapColumn()).toBeCloseTo(100 / 3)
            expect(childs[0].x()).toBeCloseTo(100 / 3)
            expect(childs[1].x()).toBeCloseTo(100 / 3 + 100 + 100 / 3)
            expect(childs[2].x()).toBeCloseTo(100 / 3)
            expect(childs[3].x()).toBeCloseTo(100 / 3 + 100 + 100 / 3)
        })
        it('should set both content axes by place content', async () => {
            layout.set({ placeContent: 'end' })
            await settle(layout)
            expect([
                layout.justifyContent(),
                layout.alignContent(),
            ]).toStrictEqual(['end', 'end'])
            expect(childs[0].x()).toBe(100)
        })
    })

    describe('grid align content', () => {
        let childs: Block[]
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            // 6 childs in 2 columns make 3 rows of 50, so a taller layout block
            // leaves room to distribute them in
            layout = new LayoutBlock({
                width: 200,
                height: 300,
                layout: 'grid',
                gridTemplateColumns: [100, 100],
            })
            childs = createChilds(6, 50, 50)
            childs.forEach((child) => layout.addChild(child))
            canvas.add(layout)
            await flush()
        })
        it('should align the rows to their start by default', () => {
            expect(layout.alignContent()).toBe('normal')
            expect(childs.map((child) => child.y())).toStrictEqual([
                0, 0, 50, 50, 100, 100,
            ])
        })
        it('should align the rows to their start', async () => {
            layout.set({ alignContent: 'start' })
            await settle(layout)
            expect(childs.map((child) => child.y())).toStrictEqual([
                0, 0, 50, 50, 100, 100,
            ])
        })
        it('should center the rows', async () => {
            layout.set({ alignContent: 'center' })
            await settle(layout)
            // the 150 of free space is shared above and below the 3 rows
            expect(childs.map((child) => child.y())).toStrictEqual([
                75, 75, 125, 125, 175, 175,
            ])
        })
        it('should align the rows to their end', async () => {
            layout.set({ alignContent: 'end' })
            await settle(layout)
            expect(childs.map((child) => child.y())).toStrictEqual([
                150, 150, 200, 200, 250, 250,
            ])
        })
        it('should spread the rows between the edges', async () => {
            layout.set({ alignContent: 'space-between' })
            await settle(layout)
            // the free space goes into the 2 gaps between the 3 rows
            expect(layout.gapRow()).toBe(75)
            expect(childs.map((child) => child.y())).toStrictEqual([
                0, 0, 125, 125, 250, 250,
            ])
        })
        it('should spread the rows around each other', async () => {
            layout.set({ alignContent: 'space-around' })
            await settle(layout)
            expect(layout.gapRow()).toBe(50)
            expect(childs.map((child) => child.y())).toStrictEqual([
                25, 25, 125, 125, 225, 225,
            ])
        })
        it('should spread the rows evenly', async () => {
            layout.set({ alignContent: 'space-evenly' })
            await settle(layout)
            // the 150 of free space is split into the 4 gaps of 3 rows
            expect(layout.gapRow()).toBe(37.5)
            expect(childs.map((child) => child.y())).toStrictEqual([
                37.5, 37.5, 125, 125, 212.5, 212.5,
            ])
        })
        it('should not move rows which fill the layout block', async () => {
            layout.set({ height: 150, alignContent: 'center' })
            await settle(layout)
            expect(childs.map((child) => child.y())).toStrictEqual([
                0, 0, 50, 50, 100, 100,
            ])
        })
    })

    describe('grid edge cases', () => {
        const gridOptions = {
            width: 200,
            height: 200,
            layout: 'grid' as const,
            gridTemplateColumns: [100, 100],
        }
        const setupGrid = async (
            options: any,
            count: number,
            width = 50,
            height = 50
        ) => {
            canvas = new Canvas('myCanvas', 400, 500)
            layout = new LayoutBlock(options)
            const childs = createChilds(count, width, height)
            childs.forEach((child) => layout.addChild(child))
            canvas.add(layout)
            await flush()
            return childs
        }
        it('should fill the columns of a partial last row', async () => {
            const childs = await setupGrid(gridOptions, 3)
            // the third child takes the first cell of the second row and the
            // rest of the row stays empty
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [100, 0],
                [0, 50],
            ])
            expect(layout.__childsContainer).toStrictEqual({
                width: 200,
                height: 100,
            })
        })
        it('should add a row for every full row of childs', async () => {
            const childs = await setupGrid(gridOptions, 5)
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [100, 0],
                [0, 50],
                [100, 50],
                [0, 100],
            ])
            expect(layout.__childsContainer).toStrictEqual({
                width: 200,
                height: 150,
            })
        })
        it('should measure the childs container by the used tracks only', async () => {
            await setupGrid(gridOptions, 1)
            expect(layout.__childsContainer).toStrictEqual({
                width: 100,
                height: 50,
            })
        })
        it('should not measure a column which is not used', async () => {
            const childs = await setupGrid(
                {
                    width: 200,
                    height: 200,
                    layout: 'grid',
                    gridTemplateColumns: [100, 100],
                    gridTemplateRows: [80],
                },
                4
            )
            // only the first row is given by the template, the second one is as
            // high as its childs
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [100, 0],
                [0, 80],
                [100, 80],
            ])
            expect(layout.__childsContainer).toStrictEqual({
                width: 200,
                height: 130,
            })
        })
        it('should size an auto column by its childs', async () => {
            const childs = await setupGrid(
                {
                    width: 200,
                    height: 200,
                    layout: 'grid',
                    gridTemplateColumns: ['auto', 100] as any,
                },
                4
            )
            // an auto track takes the width of its childs, which drops the
            // 100 of the given track next to it
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [50, 0],
                [0, 50],
                [50, 50],
            ])
            expect(layout.__childsContainer).toStrictEqual({
                width: 150,
                height: 100,
            })
        })
        it('should size a single auto column by its childs', async () => {
            const childs = await setupGrid(
                {
                    width: 200,
                    height: 200,
                    layout: 'grid',
                    gridTemplateColumns: ['auto'] as any,
                },
                2
            )
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [0, 50],
            ])
            expect(layout.__childsContainer).toStrictEqual({
                width: 50,
                height: 100,
            })
        })
        it('should not spread a single column between the edges', async () => {
            const childs = await setupGrid(
                {
                    width: 300,
                    height: 200,
                    layout: 'grid',
                    gridTemplateColumns: [100],
                },
                3
            )
            layout.set({ justifyContent: 'space-between' })
            await settle(layout)
            // the free space lands in the gap of the column although there is
            // no second column to spread it between
            expect(layout.gapColumn()).toBe(200)
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [0, 50],
                [0, 100],
            ])
        })
        it('should push a single column to the center', async () => {
            const childs = await setupGrid(
                {
                    width: 300,
                    height: 200,
                    layout: 'grid',
                    gridTemplateColumns: [100],
                },
                3
            )
            layout.set({ justifyContent: 'space-around' })
            await settle(layout)
            // half of the free space stays in front of the only column
            expect(layout.gapColumn()).toBe(200)
            expect(positions(childs)).toStrictEqual([
                [100, 0],
                [100, 50],
                [100, 100],
            ])
        })
        it('should not spread a single child between the edges', async () => {
            const childs = await setupGrid(gridOptions, 1)
            layout.set({ justifyContent: 'space-between' })
            await settle(layout)
            expect(layout.gapColumn()).toBe(100)
            expect(positions(childs)).toStrictEqual([[0, 0]])
        })
        it('should relayout the childs on a changed template', async () => {
            const childs = await setupGrid(gridOptions, 4)
            layout.set({ gridTemplateColumns: [50, 50, 50] })
            await settle(layout)
            // the third column takes the child which used to be the first one
            // of the second row
            expect(positions(childs)).toStrictEqual([
                [0, 0],
                [50, 0],
                [100, 0],
                [0, 50],
            ])
            expect(layout.__childsContainer).toStrictEqual({
                width: 150,
                height: 100,
            })
        })
    })

    describe('grid options', () => {
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            layout = new LayoutBlock({ width: 200, height: 200 })
            await flush()
        })
        it('should set the rows and the columns by the template', () => {
            expect(layout.gridTemplate([[80], [60, 40]])).toStrictEqual([
                [80],
                [60, 40],
            ])
            expect(layout.gridTemplateRows()).toStrictEqual([80])
            expect(layout.gridTemplateColumns()).toStrictEqual([60, 40])
        })
        it('should default the grid template', () => {
            expect(layout.gridTemplateColumns()).toStrictEqual([0])
            expect(layout.gridTemplateRows()).toStrictEqual([])
        })
        it('should read and set the grid auto flow', () => {
            expect(layout.gridAutoFlow()).toBe('row')
            expect(layout.gridAutoFlow('column dense')).toBe('column dense')
        })
        it('should read and set the column start and end', () => {
            expect(layout.columnStart()).toBe(1)
            expect(layout.columnEnd()).toBe(0)
            expect(layout.columnStart(2)).toBe(2)
            expect(layout.columnEnd(3)).toBe(3)
        })
        it('should read and set the gaps on their own', () => {
            expect([layout.gapColumn(), layout.gapRow()]).toStrictEqual([0, 0])
            expect(layout.gapColumn(20)).toBe(20)
            expect(layout.gapRow(10)).toBe(10)
            expect([layout.gapColumn(), layout.gapRow()]).toStrictEqual([
                20, 10,
            ])
        })
    })

    describe('unsupported options', () => {
        let childs: Block[]
        const setupGrid = async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            layout = new LayoutBlock({
                width: 200,
                height: 200,
                layout: 'grid',
                gridTemplateColumns: [100, 100],
            })
            childs = createChilds(4, 50, 50)
            childs.forEach((child) => layout.addChild(child))
            canvas.add(layout)
            await flush()
        }
        describe('stretch', () => {
            beforeEach(async () => {
                await setupGrid()
                childs[2].set({ width: 20, height: 20 })
                await settle(layout)
            })
            it('should accept a stretch which does nothing', async () => {
                layout.set({
                    justifyContent: 'stretch',
                    alignContent: 'stretch',
                    justifyItems: 'stretch',
                    alignItems: 'stretch',
                })
                await settle(layout)
                expect([
                    layout.justifyContent(),
                    layout.alignContent(),
                    layout.justifyItems(),
                    layout.alignItems(),
                ]).toStrictEqual(['stretch', 'stretch', 'stretch', 'stretch'])
                // none of them pulls a child into its track
                expect(positions(childs)).toStrictEqual([
                    [0, 0],
                    [100, 0],
                    [0, 50],
                    [100, 50],
                ])
                expect([childs[2].width(), childs[2].height()]).toStrictEqual([
                    20, 20,
                ])
            })
        })
        describe('justify items', () => {
            beforeEach(async () => {
                await setupGrid()
                childs[2].set({ width: 20 })
                await settle(layout)
            })
            it('should accept a left and a right without moving a child', async () => {
                layout.set({ justifyItems: 'right' })
                await settle(layout)
                expect(layout.justifyItems()).toBe('right')
                expect(childs[2].x()).toBe(0)
                layout.set({ justifyItems: 'left' })
                await settle(layout)
                expect(layout.justifyItems()).toBe('left')
                expect(childs[2].x()).toBe(0)
            })
        })
        describe('column lines', () => {
            beforeEach(async () => {
                await setupGrid()
            })
            it('should read and set the column lines without moving a child', async () => {
                layout.set({ columnStart: 2, columnEnd: 3 })
                await settle(layout)
                expect([
                    layout.columnStart(),
                    layout.columnEnd(),
                ]).toStrictEqual([2, 3])
                // the grid does not place its childs by these lines yet
                expect(positions(childs)).toStrictEqual([
                    [0, 0],
                    [100, 0],
                    [0, 50],
                    [100, 50],
                ])
            })
        })
        describe('grid auto flow', () => {
            beforeEach(async () => {
                await setupGrid()
            })
            it('should not fill the rows by a column', async () => {
                layout.set({ gridAutoFlow: 'column' })
                await settle(layout)
                expect(layout.gridAutoFlow()).toBe('column')
                // the flow is not implemented yet, the childs still fill the
                // rows
                expect(positions(childs)).toStrictEqual([
                    [0, 0],
                    [100, 0],
                    [0, 50],
                    [100, 50],
                ])
            })
        })
    })

    describe('out of flow childs', () => {
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            await flush()
        })
        it('should not move an absolute child', async () => {
            layout = new LayoutBlock({ x: 10, y: 20, width: 300, height: 200 })
            const absoluteChild = new Block({
                x: 5,
                y: 6,
                width: 50,
                height: 50,
                position: 'absolute',
            })
            const flowingChild = new Block({ width: 50, height: 50 })
            layout.addChild(absoluteChild)
            layout.addChild(flowingChild)
            canvas.add(layout)
            await flush()
            expect([absoluteChild.x(), absoluteChild.y()]).toStrictEqual([5, 6])
        })
        it('should not let an absolute child take up space', async () => {
            layout = new LayoutBlock({ width: 300, height: 200 })
            const absoluteChild = new Block({
                width: 100,
                height: 100,
                position: 'absolute',
            })
            const flowingChild = new Block({ width: 50, height: 50 })
            layout.addChild(absoluteChild)
            layout.addChild(flowingChild)
            canvas.add(layout)
            await flush()
            expect([flowingChild.x(), flowingChild.y()]).toStrictEqual([0, 0])
            expect(layout.__childsContainer).toStrictEqual({
                width: 50,
                height: 50,
            })
        })
        it('should not let a fixed child take up space', async () => {
            layout = new LayoutBlock({ width: 300, height: 200 })
            const fixedChild = new Block({
                width: 100,
                height: 100,
                position: 'fixed',
            })
            const flowingChild = new Block({ width: 50, height: 50 })
            layout.addChild(fixedChild)
            layout.addChild(flowingChild)
            canvas.add(layout)
            await flush()
            expect([flowingChild.x(), flowingChild.y()]).toStrictEqual([0, 0])
            expect(layout.__childsContainer).toStrictEqual({
                width: 50,
                height: 50,
            })
        })
        it('should spread the flowing childs between the edges', async () => {
            layout = new LayoutBlock({ width: 300, height: 200 })
            const absoluteChild = new Block({
                width: 100,
                height: 100,
                position: 'absolute',
            })
            const first = new Block({ width: 50, height: 50 })
            const second = new Block({ width: 50, height: 50 })
            layout.addChild(absoluteChild)
            layout.addChild(first)
            layout.addChild(second)
            canvas.add(layout)
            await flush()
            layout.set({ justifyContent: 'space-between' })
            await settle(layout)
            // the free space is split between the two childs which are in flow
            expect(layout.gapColumn()).toBe(200)
            expect(positions([first, second])).toStrictEqual([
                [0, 0],
                [250, 0],
            ])
        })
    })

    describe('box model and flow', () => {
        beforeEach(async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            await flush()
        })
        describe('padding', () => {
            it('should offset the childs by the padding of the layout block', async () => {
                layout = new LayoutBlock({
                    width: 300,
                    height: 200,
                    padding: [10],
                })
                const childs = createChilds(3, 50, 50)
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                expect(positions(childs)).toStrictEqual([
                    [10, 10],
                    [60, 10],
                    [110, 10],
                ])
                // the padding is not taken off the childs container
                expect(layout.__childsContainer).toStrictEqual({
                    width: 150,
                    height: 50,
                })
            })
            it('should distribute the childs inside the whole width', async () => {
                layout = new LayoutBlock({
                    width: 300,
                    height: 200,
                    padding: [10],
                })
                const childs = createChilds(3, 50, 50)
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                layout.set({ justifyContent: 'end' })
                await settle(layout)
                // the free space is measured without the padding, so the last
                // child reaches past the right edge of the layout block
                expect(positions(childs)).toStrictEqual([
                    [180, 10],
                    [230, 10],
                    [280, 10],
                ])
            })
        })
        describe('spacing of a child', () => {
            it('should not shrink a padded child to the layout block', async () => {
                layout = new LayoutBlock({ width: 60, height: 200 })
                const childs = createChilds(2, 50, 50)
                childs[0].set({ padding: [10] })
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                // the padding makes the child wider than the layout block and
                // it is kept as it is instead of being shrunk
                expect([childs[0].width(), childs[0].height()]).toStrictEqual([
                    70, 70,
                ])
                expect([childs[1].x(), childs[1].y()]).toStrictEqual([70, 0])
            })
            it('should add the margin of a child to a column', async () => {
                layout = new LayoutBlock({
                    width: 300,
                    height: 200,
                    flexDirection: 'column',
                })
                const childs = createChilds(3, 50, 50)
                childs[0].set({ margin: 10 })
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                await settle(layout)
                // the margin of the first child is the space it takes up
                expect(positions(childs)).toStrictEqual([
                    [10, 10],
                    [0, 70],
                    [0, 120],
                ])
                expect(layout.__childsContainer).toStrictEqual({
                    width: 70,
                    height: 170,
                })
            })
            it('should move a margined child without reserving its space in a grid', async () => {
                layout = new LayoutBlock({
                    width: 200,
                    height: 200,
                    layout: 'grid',
                    gridTemplateColumns: [100, 100],
                })
                const childs = createChilds(4, 50, 50)
                childs[0].set({ margin: 10 })
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                await settle(layout)
                // only the margined child moves, the tracks stay the same
                expect(positions(childs)).toStrictEqual([
                    [10, 10],
                    [100, 0],
                    [0, 50],
                    [100, 50],
                ])
                expect(layout.__childsContainer).toStrictEqual({
                    width: 200,
                    height: 100,
                })
            })
            it('should place a wrapped row by a flex basis with a margin', async () => {
                layout = new LayoutBlock({
                    width: 150,
                    height: 200,
                    flexWrap: 'wrap',
                })
                const childs = createChilds(4, 50, 50)
                childs[0].set({ flexBasis: 60, margin: 10 })
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                await settle(layout)
                expect([childs[0].width(), childs[1].x()]).toStrictEqual([
                    60, 80,
                ])
            })
        })
        describe('flex basis', () => {
            it('should wrap a row around a flex basis', async () => {
                layout = new LayoutBlock({
                    width: 150,
                    height: 200,
                    flexWrap: 'wrap',
                })
                const childs = createChilds(4, 50, 50)
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                childs[0].set({ flexBasis: 80 })
                await settle(layout)
                // the wider child pushes the third one into the second line
                expect(positions(childs)).toStrictEqual([
                    [0, 0],
                    [80, 0],
                    [0, 50],
                    [50, 50],
                ])
                expect(childs[0].width()).toBe(80)
                expect(layout.__childsContainer).toStrictEqual({
                    width: 130,
                    height: 100,
                })
            })
            it('should wrap a column around a flex basis', async () => {
                layout = new LayoutBlock({
                    width: 300,
                    height: 150,
                    flexDirection: 'column',
                    flexWrap: 'wrap',
                })
                const childs = createChilds(4, 50, 50)
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                childs[0].set({ flexBasis: 80 })
                await settle(layout)
                // the taller child pushes the third one into the second column
                expect(positions(childs)).toStrictEqual([
                    [0, 0],
                    [0, 80],
                    [50, 0],
                    [50, 50],
                ])
                expect(childs[0].height()).toBe(80)
                expect(layout.__childsContainer).toStrictEqual({
                    width: 100,
                    height: 130,
                })
            })
        })
        describe('without flowing childs', () => {
            it('should not measure a layout block without childs', async () => {
                layout = new LayoutBlock({ width: 300, height: 200 })
                canvas.add(layout)
                await flush()
                expect(layout.__childsContainer).toStrictEqual({
                    width: 0,
                    height: 0,
                })
            })
            it('should not measure a layout block of absolute childs only', async () => {
                layout = new LayoutBlock({ width: 300, height: 200 })
                const absoluteChild = new Block({
                    width: 100,
                    height: 100,
                    position: 'absolute',
                })
                layout.addChild(absoluteChild)
                canvas.add(layout)
                await flush()
                expect(layout.__childsContainer).toStrictEqual({
                    width: 0,
                    height: 0,
                })
                expect([absoluteChild.x(), absoluteChild.y()]).toStrictEqual([
                    0, 0,
                ])
            })
        })
        describe('over constrained', () => {
            it('should not shrink a child which overflows the layout block', async () => {
                layout = new LayoutBlock({ width: 50, height: 200 })
                const childs = createChilds(2, 50, 50)
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                expect(positions(childs)).toStrictEqual([
                    [0, 0],
                    [50, 0],
                ])
                expect(childs.map((child) => child.width())).toStrictEqual([
                    50, 50,
                ])
            })
            it('should not spread childs which overflow the layout block', async () => {
                layout = new LayoutBlock({ width: 50, height: 200 })
                const childs = createChilds(2, 50, 50)
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                layout.set({ justifyContent: 'space-between' })
                await settle(layout)
                // there is no free space to spread, so the gap stays empty
                expect(layout.gapColumn()).toBe(0)
                expect(positions(childs)).toStrictEqual([
                    [0, 0],
                    [50, 0],
                ])
            })
            it('should not spread a single child between the edges', async () => {
                layout = new LayoutBlock({ width: 300, height: 200 })
                const childs = createChilds(1, 50, 50)
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                layout.set({ justifyContent: 'space-between' })
                await settle(layout)
                // the whole free space ends up in a gap which has no second
                // child to be shared with
                expect(layout.gapColumn()).toBe(250)
                expect(positions(childs)).toStrictEqual([[0, 0]])
            })
        })
        describe('changes after the layout', () => {
            it('should distribute a child which was added later', async () => {
                layout = new LayoutBlock({ width: 300, height: 200 })
                const childs = createChilds(2, 50, 50)
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                layout.set({ justifyContent: 'space-between' })
                await settle(layout)
                const later = new Block({ width: 50, height: 50 })
                layout.addChild(later)
                await flush()
                // the gap is shared between the 3 childs now
                expect(layout.gapColumn()).toBe(75)
                expect(positions([...childs, later])).toStrictEqual([
                    [0, 0],
                    [125, 0],
                    [250, 0],
                ])
            })
            it('should move the childs together with the layout block', async () => {
                layout = new LayoutBlock({ width: 300, height: 200 })
                const childs = createChilds(3, 50, 50)
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                layout.set({ x: 100, y: 50 })
                await settle(layout)
                expect(positions(childs)).toStrictEqual([
                    [100, 50],
                    [150, 50],
                    [200, 50],
                ])
            })
            it('should not shrink the childs when the layout block shrinks', async () => {
                layout = new LayoutBlock({ width: 300, height: 200 })
                const childs = createChilds(3, 50, 50)
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                layout.set({ width: 100 })
                await settle(layout)
                // the childs keep their place and reach past the new edge
                expect(positions(childs)).toStrictEqual([
                    [0, 0],
                    [50, 0],
                    [100, 0],
                ])
                expect(layout.__childsContainer).toStrictEqual({
                    width: 150,
                    height: 50,
                })
            })
            it('should not shrink a nested layout block', async () => {
                layout = new LayoutBlock({ width: 60, height: 200 })
                const column = new LayoutBlock({ width: 200, height: 100 })
                const child = new Block({ width: 50, height: 50 })
                column.addChild(child)
                layout.addChild(column)
                canvas.add(layout)
                await flush()
                expect([column.width(), column.height()]).toStrictEqual([
                    200, 100,
                ])
                expect([child.x(), child.y()]).toStrictEqual([0, 0])
            })
        })
    })

    describe('combined alignment', () => {
        describe('flex', () => {
            it('should align the lines and their childs on the main axis', async () => {
                const canvas = new Canvas('myCanvas', 400, 500)
                const layout = new LayoutBlock({
                    width: 150,
                    height: 200,
                    flexWrap: 'wrap',
                })
                const childs = createChilds(4, 50, 50)
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                layout.set({ justifyContent: 'end', alignItems: 'center' })
                await settle(layout)
                // the last line is at its end while every child is centered
                // inside its own line
                expect(positions(childs)).toStrictEqual([
                    [0, 100 / 3],
                    [50, 100 / 3],
                    [100, 100 / 3],
                    [100, 100 / 3 + 50],
                ])
            })
            it('should center the columns and their childs on the main axis', async () => {
                const canvas = new Canvas('myCanvas', 400, 500)
                const layout = new LayoutBlock({
                    width: 300,
                    height: 150,
                    flexDirection: 'column',
                    flexWrap: 'wrap',
                })
                const childs = createChilds(4, 50, 50)
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                layout.set({ justifyContent: 'center', alignContent: 'end' })
                await settle(layout)
                // the second column is pushed to the cross axis end while its
                // single child is centered inside the column
                expect(positions(childs)).toStrictEqual([
                    [200, 0],
                    [200, 50],
                    [200, 100],
                    [250, 50],
                ])
            })
            it('should not align the childs of a row into a cell', async () => {
                const canvas = new Canvas('myCanvas', 400, 500)
                const layout = new LayoutBlock({ width: 300, height: 200 })
                const childs = createChilds(3, 50, 50)
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                layout.set({ justifyItems: 'end' })
                await settle(layout)
                // the childs of a row have no cell of their own to be aligned
                // in, only the childs of a grid have
                expect(layout.justifyItems()).toBe('end')
                expect(positions(childs)).toStrictEqual([
                    [0, 0],
                    [50, 0],
                    [100, 0],
                ])
            })
            it('should center a row on both axes in one pass', async () => {
                const canvas = new Canvas('myCanvas', 400, 500)
                const layout = new LayoutBlock({ width: 300, height: 200 })
                const childs = createChilds(3, 50, 50)
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                layout.set({ justifyContent: 'center', alignItems: 'end' })
                await settle(layout)
                expect(positions(childs)).toStrictEqual([
                    [75, 150],
                    [125, 150],
                    [175, 150],
                ])
            })
            it('should spread a row and center it on the cross axis', async () => {
                const canvas = new Canvas('myCanvas', 400, 500)
                const layout = new LayoutBlock({ width: 300, height: 200 })
                const childs = createChilds(3, 50, 50)
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                layout.set({
                    justifyContent: 'space-between',
                    alignItems: 'center',
                })
                await settle(layout)
                expect(layout.gapColumn()).toBe(75)
                expect(positions(childs)).toStrictEqual([
                    [0, 75],
                    [125, 75],
                    [250, 75],
                ])
            })
            it('should align a row to its end and its cross axis start', async () => {
                const canvas = new Canvas('myCanvas', 400, 500)
                const layout = new LayoutBlock({ width: 300, height: 200 })
                const childs = createChilds(3, 50, 50)
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                layout.set({ justifyContent: 'end', alignItems: 'start' })
                await settle(layout)
                expect(positions(childs)).toStrictEqual([
                    [150, 0],
                    [200, 0],
                    [250, 0],
                ])
            })
            it('should overwrite an explicit gap by a distributed one', async () => {
                const canvas = new Canvas('myCanvas', 400, 500)
                const layout = new LayoutBlock({ width: 300, height: 200 })
                const childs = createChilds(3, 50, 50)
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                layout.set({
                    gap: 200,
                    justifyContent: 'space-between',
                    alignItems: 'end',
                })
                await settle(layout)
                // without wrapped lines the computed gap replaces the gap which
                // was set by hand
                expect(layout.gapColumn()).toBe(75)
                expect(positions(childs)).toStrictEqual([
                    [0, 150],
                    [125, 150],
                    [250, 150],
                ])
            })
            it('should align a column to its end and center it on the cross axis', async () => {
                const canvas = new Canvas('myCanvas', 400, 500)
                const layout = new LayoutBlock({
                    width: 300,
                    height: 200,
                    flexDirection: 'column',
                })
                const childs = createChilds(3, 50, 50)
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                layout.set({ justifyContent: 'end', alignItems: 'center' })
                await settle(layout)
                expect(positions(childs)).toStrictEqual([
                    [125, 50],
                    [125, 100],
                    [125, 150],
                ])
            })
            it('should center a column and ignore a cross axis content', async () => {
                const canvas = new Canvas('myCanvas', 400, 500)
                const layout = new LayoutBlock({
                    width: 300,
                    height: 200,
                    flexDirection: 'column',
                })
                const childs = createChilds(3, 50, 50)
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                layout.set({ justifyContent: 'center', alignContent: 'end' })
                await settle(layout)
                // without wrapped columns there is nothing to align
                expect(positions(childs)).toStrictEqual([
                    [0, 25],
                    [0, 75],
                    [0, 125],
                ])
            })
            it('should move the lines and their childs together', async () => {
                const canvas = new Canvas('myCanvas', 400, 500)
                const layout = new LayoutBlock({
                    width: 150,
                    height: 200,
                    flexWrap: 'wrap',
                })
                const childs = createChilds(4, 50, 50)
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                layout.set({ alignContent: 'center', alignItems: 'end' })
                await settle(layout)
                // the lines are moved by alignContent, the full lines have
                // nothing left to align inside of them
                expect(childs.map((child) => child.y())).toStrictEqual([
                    100 / 3,
                    100 / 3,
                    100 / 3,
                    100 / 3 + 50,
                ])
            })
            it('should spread the lines and align their childs', async () => {
                const canvas = new Canvas('myCanvas', 400, 500)
                const layout = new LayoutBlock({
                    width: 150,
                    height: 200,
                    flexWrap: 'wrap',
                })
                const childs = createChilds(4, 50, 50)
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                layout.set({
                    alignContent: 'space-between',
                    alignItems: 'start',
                })
                await settle(layout)
                expect(layout.gapRow()).toBe(100)
                expect(childs.map((child) => child.y())).toStrictEqual([
                    0, 0, 0, 150,
                ])
            })
            it('should let align items overwrite the line offset of align content', async () => {
                const canvas = new Canvas('myCanvas', 400, 500)
                const layout = new LayoutBlock({
                    width: 150,
                    height: 200,
                    flexWrap: 'wrap',
                })
                const childs = createChilds(4, 50, 50)
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                layout.set({ alignContent: 'end', alignItems: 'center' })
                await settle(layout)
                // alignItems spreads the lines on its own, so the lines end up
                // centered instead of at the cross axis end
                expect(childs.map((child) => child.y())).toStrictEqual([
                    100 / 3,
                    100 / 3,
                    100 / 3,
                    100 / 3 + 50,
                ])
            })
            it('should align a line and its childs on the main axis', async () => {
                const canvas = new Canvas('myCanvas', 400, 500)
                const layout = new LayoutBlock({
                    width: 150,
                    height: 200,
                    flexWrap: 'wrap',
                })
                const childs = createChilds(4, 50, 50)
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                layout.set({ justifyContent: 'end', alignContent: 'center' })
                await settle(layout)
                // the last line is at its end while both lines are centered
                expect(positions(childs)).toStrictEqual([
                    [0, 100 / 3],
                    [50, 100 / 3],
                    [100, 100 / 3],
                    [100, 100 / 3 + 50],
                ])
            })
            it('should center wrapped columns and their childs', async () => {
                const canvas = new Canvas('myCanvas', 400, 500)
                const layout = new LayoutBlock({
                    width: 300,
                    height: 150,
                    flexDirection: 'column',
                    flexWrap: 'wrap',
                })
                const childs = createChilds(4, 50, 50)
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                layout.set({ alignContent: 'center', alignItems: 'end' })
                await settle(layout)
                // the columns are moved by alignContent, alignItems has nothing
                // left to align inside of the full ones
                expect(childs.map((child) => child.x())).toStrictEqual([
                    200 / 3,
                    200 / 3,
                    200 / 3,
                    200 / 3 + 50,
                ])
            })
            it('should spread wrapped columns and align their childs', async () => {
                const canvas = new Canvas('myCanvas', 400, 500)
                const layout = new LayoutBlock({
                    width: 300,
                    height: 150,
                    flexDirection: 'column',
                    flexWrap: 'wrap',
                })
                const childs = createChilds(4, 50, 50)
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                layout.set({
                    alignContent: 'space-between',
                    alignItems: 'start',
                })
                await settle(layout)
                expect(layout.gapColumn()).toBe(200)
                expect(childs.map((child) => child.x())).toStrictEqual([
                    0, 0, 0, 250,
                ])
            })
            it('should set both axes of a grid by place content and items', async () => {
                const canvas = new Canvas('myCanvas', 400, 500)
                const layout = new LayoutBlock({
                    width: 200,
                    height: 200,
                    layout: 'grid',
                    gridTemplateColumns: [100, 100],
                })
                const childs = createChilds(4, 50, 50)
                childs[2].set({ width: 20, height: 20 })
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                await settle(layout)
                layout.set({ placeContent: 'center', placeItems: 'end' })
                await settle(layout)
                // the whole grid is centered between its rows while every child
                // sits in the far corner of its own cell
                expect([
                    layout.justifyContent(),
                    layout.alignContent(),
                    layout.justifyItems(),
                    layout.alignItems(),
                ]).toStrictEqual(['center', 'center', 'end', 'end'])
                expect(positions(childs)).toStrictEqual([
                    [50, 50],
                    [150, 50],
                    [80, 130],
                    [150, 100],
                ])
            })
            it('should align the grid and its childs in a cell', async () => {
                const canvas = new Canvas('myCanvas', 400, 500)
                const layout = new LayoutBlock({
                    width: 200,
                    height: 200,
                    layout: 'grid',
                    gridTemplateColumns: [100, 100],
                })
                const childs = createChilds(4, 50, 50)
                childs[2].set({ width: 20, height: 20 })
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                await settle(layout)
                layout.set({ justifyItems: 'center', alignItems: 'center' })
                await settle(layout)
                // every child is centered inside its own cell, the short one
                // moves on both axes
                expect(positions(childs)).toStrictEqual([
                    [25, 0],
                    [125, 0],
                    [40, 65],
                    [125, 50],
                ])
            })
            it('should move the rows and the childs inside their columns', async () => {
                const canvas = new Canvas('myCanvas', 400, 500)
                const layout = new LayoutBlock({
                    width: 200,
                    height: 200,
                    layout: 'grid',
                    gridTemplateColumns: [100, 100],
                })
                const childs = createChilds(4, 50, 50)
                childs[2].set({ width: 20 })
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                await settle(layout)
                layout.set({ alignContent: 'center', justifyItems: 'center' })
                await settle(layout)
                // the rows are centered between the free space while every
                // child is centered inside its own column
                expect(positions(childs)).toStrictEqual([
                    [25, 50],
                    [125, 50],
                    [40, 100],
                    [125, 100],
                ])
            })
            it('should move the whole grid and its childs in a cell', async () => {
                const canvas = new Canvas('myCanvas', 400, 500)
                const layout = new LayoutBlock({
                    width: 200,
                    height: 200,
                    layout: 'grid',
                    gridTemplateColumns: [100, 100],
                })
                const childs = createChilds(4, 50, 50)
                childs[2].set({ width: 20, height: 20 })
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                await settle(layout)
                layout.set({ justifyContent: 'end', justifyItems: 'center' })
                await settle(layout)
                // the grid fills its layout block, so it stays where it is
                // while every child is centered inside its column
                expect(positions(childs)).toStrictEqual([
                    [25, 0],
                    [125, 0],
                    [40, 50],
                    [125, 50],
                ])
            })
            it('should move all four axes of a grid at once', async () => {
                const canvas = new Canvas('myCanvas', 400, 500)
                const layout = new LayoutBlock({
                    width: 200,
                    height: 200,
                    layout: 'grid',
                    gridTemplateColumns: [100, 100],
                })
                const childs = createChilds(4, 50, 50)
                childs[2].set({ width: 20, height: 20 })
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                await settle(layout)
                layout.set({
                    justifyContent: 'end',
                    alignContent: 'end',
                    justifyItems: 'end',
                    alignItems: 'end',
                })
                await settle(layout)
                // the grid fills its width, so only the rows move down, and
                // every child sits in the far corner of its own cell
                expect(positions(childs)).toStrictEqual([
                    [50, 100],
                    [150, 100],
                    [80, 180],
                    [150, 150],
                ])
            })
            it('should move the rows and their childs inside a grid', async () => {
                const canvas = new Canvas('myCanvas', 400, 500)
                const layout = new LayoutBlock({
                    width: 200,
                    height: 200,
                    layout: 'grid',
                    gridTemplateColumns: [100, 100],
                })
                const childs = createChilds(4, 50, 50)
                childs[2].set({ width: 20, height: 20 })
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                await settle(layout)
                layout.set({ alignContent: 'end', alignItems: 'end' })
                await settle(layout)
                // the rows are packed below the free space and every child sits
                // at the end of its own row
                expect(positions(childs)).toStrictEqual([
                    [0, 100],
                    [100, 100],
                    [0, 180],
                    [100, 150],
                ])
            })
            it('should overwrite a gap by the one of a distributed grid', async () => {
                const canvas = new Canvas('myCanvas', 400, 500)
                const layout = new LayoutBlock({
                    width: 200,
                    height: 200,
                    layout: 'grid',
                    gridTemplateColumns: [100, 100],
                })
                const childs = createChilds(4, 50, 50)
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                layout.set({ gap: 20 })
                await settle(layout)
                layout.set({
                    justifyContent: 'space-between',
                    justifyItems: 'end',
                })
                await settle(layout)
                // the tracks fill the whole width, so the column gap of the
                // distribution drops the gap which was set by hand while the
                // row gap stays
                expect(layout.gapColumn()).toBe(0)
                expect(layout.gapRow()).toBe(20)
                expect(positions(childs)).toStrictEqual([
                    [50, 0],
                    [150, 0],
                    [50, 70],
                    [150, 70],
                ])
            })
            it('should not pull a child into its track by a stretch', async () => {
                const canvas = new Canvas('myCanvas', 400, 500)
                const layout = new LayoutBlock({
                    width: 200,
                    height: 200,
                    layout: 'grid',
                    gridTemplateColumns: [100, 100],
                })
                const childs = createChilds(4, 50, 50)
                childs[2].set({ width: 20, height: 20 })
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                await settle(layout)
                layout.set({ alignItems: 'stretch', justifyContent: 'center' })
                await settle(layout)
                // the stretch does nothing while the distribution of a full
                // grid keeps it in place
                expect(positions(childs)).toStrictEqual([
                    [0, 0],
                    [100, 0],
                    [0, 50],
                    [100, 50],
                ])
                expect([childs[2].width(), childs[2].height()]).toStrictEqual([
                    20, 20,
                ])
            })
        })
        describe('place content against a single axis', () => {
            let childs: Block[]
            beforeEach(async () => {
                canvas = new Canvas('myCanvas', 400, 500)
                layout = new LayoutBlock({
                    width: 150,
                    height: 200,
                    flexWrap: 'wrap',
                })
                childs = createChilds(4, 50, 50)
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
            })
            it('should move the cross axis by align content only', async () => {
                layout.set({ placeContent: 'center' })
                await settle(layout)
                layout.set({ alignContent: 'end' })
                await settle(layout)
                expect(positions(childs)).toStrictEqual([
                    [0, 100],
                    [50, 100],
                    [100, 100],
                    [50, 150],
                ])
            })
            it('should move the main axis by justify content only', async () => {
                layout.set({ placeContent: 'center' })
                await settle(layout)
                layout.set({ justifyContent: 'end' })
                await settle(layout)
                expect(positions(childs)).toStrictEqual([
                    [0, 100 / 3],
                    [50, 100 / 3],
                    [100, 100 / 3],
                    [100, 100 / 3 + 50],
                ])
            })
        })
        describe('place items against a single axis', () => {
            let childs: Block[]
            beforeEach(async () => {
                canvas = new Canvas('myCanvas', 400, 500)
                layout = new LayoutBlock({
                    width: 200,
                    height: 200,
                    layout: 'grid',
                    gridTemplateColumns: [100, 100],
                })
                childs = createChilds(4, 50, 50)
                childs[2].set({ width: 20 })
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                await settle(layout)
            })
            it('should align the childs to the end of their columns', async () => {
                layout.set({ placeItems: 'end' })
                await settle(layout)
                expect(childs[2].x()).toBe(80)
            })
            it('should move only the child axis by align items', async () => {
                layout.set({ placeItems: 'end' })
                await settle(layout)
                const atEnd = positions(childs)
                // a child which fills its whole row has nothing to align, so it
                // gets shorter to make the change visible
                childs[2].set({ height: 20 })
                await settle(layout)
                layout.set({ alignItems: 'center' })
                await settle(layout)
                expect(positions(childs)).not.toStrictEqual(atEnd)
                expect(childs[2].x()).toBe(80)
                expect(childs[0].y()).toBe(0)
                expect(childs[2].y()).toBe(65)
            })
            it('should move only the column axis by justify items', async () => {
                layout.set({ placeItems: 'end' })
                await settle(layout)
                layout.set({ justifyItems: 'center' })
                await settle(layout)
                expect(childs[2].x()).toBe(40)
            })
        })
        describe('precedence of a setter which shares an axis', () => {
            let childs: Block[]
            beforeEach(async () => {
                canvas = new Canvas('myCanvas', 400, 500)
                layout = new LayoutBlock({ width: 300, height: 200 })
                childs = createChilds(3, 50, 50)
                childs.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
            })
            it('should let the setter which comes last win the main axis', async () => {
                layout.set({ placeContent: 'center', justifyContent: 'end' })
                await settle(layout)
                expect([
                    layout.justifyContent(),
                    layout.alignContent(),
                ]).toStrictEqual(['end', 'center'])
                expect(positions(childs)).toStrictEqual([
                    [150, 0],
                    [200, 0],
                    [250, 0],
                ])
            })
            it('should let the setter which comes first lose the main axis', async () => {
                layout.set({ justifyContent: 'end', placeContent: 'center' })
                await settle(layout)
                expect([
                    layout.justifyContent(),
                    layout.alignContent(),
                ]).toStrictEqual(['center', 'center'])
                expect(positions(childs)).toStrictEqual([
                    [75, 0],
                    [125, 0],
                    [175, 0],
                ])
            })
            it('should reset both axes when place content is read', async () => {
                layout.set({ justifyContent: 'end' })
                await settle(layout)
                expect(positions(childs)).toStrictEqual([
                    [150, 0],
                    [200, 0],
                    [250, 0],
                ])
                // reading it without a value hands its own default to both axes
                expect(layout.placeContent()).toBe('start')
                await settle(layout)
                expect([
                    layout.justifyContent(),
                    layout.alignContent(),
                ]).toStrictEqual(['start', 'start'])
                expect(positions(childs)).toStrictEqual([
                    [0, 0],
                    [50, 0],
                    [100, 0],
                ])
            })
            it('should reset both axes when place items is read', async () => {
                canvas = new Canvas('myCanvas', 400, 500)
                layout = new LayoutBlock({
                    width: 200,
                    height: 200,
                    layout: 'grid',
                    gridTemplateColumns: [100, 100],
                })
                const gridChilds = createChilds(4, 50, 50)
                gridChilds[2].set({ height: 20 })
                gridChilds.forEach((child) => layout.addChild(child))
                canvas.add(layout)
                await flush()
                layout.set({ alignItems: 'end' })
                await settle(layout)
                // the short child is at the end of the second row
                expect(gridChilds[2].y()).toBe(80)
                expect(layout.placeItems()).toBe('start')
                await settle(layout)
                expect([
                    layout.alignItems(),
                    layout.justifyItems(),
                ]).toStrictEqual(['start', 'start'])
                expect(gridChilds[2].y()).toBe(50)
            })
        })
    })

    describe('nested layouts', () => {
        it('should lay out child layouts by their own direction', async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            layout = new LayoutBlock({ width: 300, height: 200 })
            const column = new LayoutBlock({
                width: 100,
                height: 100,
                flexDirection: 'column',
            })
            const first = new Block({ width: 50, height: 20 })
            const second = new Block({ width: 50, height: 20 })
            column.addChild(first)
            column.addChild(second)
            layout.addChild(column)
            canvas.add(layout)
            await flush()
            expect([column.x(), column.y()]).toStrictEqual([0, 0])
            expect(positions([first, second])).toStrictEqual([
                [0, 0],
                [0, 20],
            ])
        })
        it('should lay out a child grid by its own template', async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            layout = new LayoutBlock({
                x: 10,
                y: 20,
                width: 300,
                height: 200,
            })
            const grid = new LayoutBlock({
                width: 100,
                height: 100,
                layout: 'grid',
                gridTemplateColumns: [50, 50],
            })
            const first = new Block({ width: 50, height: 50 })
            const second = new Block({ width: 50, height: 50 })
            grid.addChild(first)
            grid.addChild(second)
            layout.addChild(grid)
            canvas.add(layout)
            await flush()
            // the childs of the grid are placed by its own template and are
            // coordinates of the canvas
            expect([grid.x(), grid.y()]).toStrictEqual([10, 20])
            expect(positions([first, second])).toStrictEqual([
                [10, 20],
                [60, 20],
            ])
        })
        it('should lay out an inline child layout by its own childs', async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            layout = new LayoutBlock({ width: 300, height: 200 })
            const inline = new LayoutBlock({ layout: 'inline-flex' })
            const first = new Block({ width: 50, height: 40 })
            const second = new Block({ width: 50, height: 40 })
            inline.addChild(first)
            inline.addChild(second)
            const sibling = new Block({ width: 50, height: 50 })
            layout.addChild(inline)
            layout.addChild(sibling)
            canvas.add(layout)
            await flush()
            // the child layout sizes itself and takes the room of its own
            // childs in the row of its parent
            expect([inline.width(), inline.height()]).toStrictEqual([100, 40])
            expect(positions([first, second])).toStrictEqual([
                [0, 0],
                [50, 0],
            ])
            expect([sibling.x(), sibling.y()]).toStrictEqual([100, 0])
        })
        it('should lay out a grandchild layout on its own place', async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            const root = new LayoutBlock({ width: 300, height: 200 })
            const column = new LayoutBlock({
                width: 100,
                height: 100,
                flexDirection: 'column',
            })
            const cell = new LayoutBlock({
                width: 60,
                height: 60,
                justifyContent: 'center',
                alignItems: 'center',
            })
            const block = new Block({ width: 20, height: 20 })
            cell.addChild(block)
            column.addChild(cell)
            root.addChild(column)
            canvas.add(root)
            await flush()
            expect([column.x(), column.y()]).toStrictEqual([0, 0])
            expect([cell.x(), cell.y()]).toStrictEqual([0, 0])
            // the deepest child is centered inside the cell of its own parent
            expect([block.x(), block.y()]).toStrictEqual([20, 20])
        })
    })
})
