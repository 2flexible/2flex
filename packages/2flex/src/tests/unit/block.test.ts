import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { Block, Canvas, RectangleBlock } from '@2flexible/2flex'
import { OVERFLOW_SCROLL_BAR_BLOCK_NAME } from '../../Block'

let block: Block<any>
let canvas: Canvas

describe('Block', () => {
    describe('Constructor', () => {
        it('creates a Block instance', () => {
            block = new Block({
                x: 20,
                y: 10,
                width: 100,
                height: 100,
            })
            expect(block).toBeDefined()
        })
        it('does not throw when creating with options', () => {
            expect(
                () => new Block({ x: 100, y: 100, width: 300, height: 500 })
            ).not.toThrow()
        })
    })
    describe('option values', () => {
        beforeEach(() => {
            block = new Block({
                x: 20,
                y: 10,
                width: 100,
                height: 100,
            })
        })
        it('should get default when value is undefined', () => {
            expect(block.__valueHandler(undefined, 'customValue', 0)).toBe(0)
        })
        it('should convert px to number', () => {
            expect(block.__valueHandler('20px', 'customValue', 0, true)).toBe(
                20
            )
        })
        it('should convert % to number relative to parent width and height', () => {
            canvas = new Canvas('myCanvas', 400, 500)
            canvas.add(block)
            expect(block.__valueHandler('20%', 'customValue', 0, true)).toBe(80)
        })
        it('should convert rem to number relative to canvas size', () => {
            canvas = new Canvas('myCanvas', 400, 500)
            canvas.add(block)
            expect(block.__valueHandler('1.6rem', 'customValue', 0, true)).toBe(
                640
            )
        })
        it('should convert em to number relative to parent size', () => {
            const childBlock = new Block({ width: 400, height: 300 })
            block.addChild(childBlock)
            expect(
                childBlock.__valueHandler('2em', 'customValue', 0, true)
            ).toBe(200)
        })
        it('should convert vw to number relative to canvas width', () => {
            canvas = new Canvas('myCanvas', 400, 500)
            canvas.add(block)
            expect(block.__valueHandler('20vw', 'customValue', 0, true)).toBe(
                80
            )
        })
        it('should convert vh to number relative to canvas height', () => {
            canvas = new Canvas('myCanvas', 400, 500)
            canvas.add(block)
            expect(block.__valueHandler('20vh', 'customValue', 0, false)).toBe(
                100
            )
        })
        it('should convert centimeters to pixel', () => {
            expect(block.__valueHandler('20cm', 'customValue', 0)).toBe(756)
        })
        it('should convert millimeters to pixel', () => {
            expect(block.__valueHandler('20mm', 'customValue', 0)).toBe(75.6)
        })
        it('should convert quarter-millimeters to pixel', () => {
            expect(block.__valueHandler('20q', 'customValue', 0)).toBe(18.9)
        })
        it('should convert inches to pixel', () => {
            expect(block.__valueHandler('20in', 'customValue', 0)).toBe(1920.24)
        })
        it('should convert picas to pixel', () => {
            expect(block.__valueHandler('20pc', 'customValue', 0)).toBe(
                320.03999999999996
            )
        })
        it('should convert points to pixel', () => {
            expect(block.__valueHandler('20pt', 'customValue', 0)).toBe(
                26.669999999999998
            )
        })
        it('should convert color to rgba', () => {
            expect(block.__valueHandler('green', 'customValue', 0)).toBe(
                'rgba(0, 128, 0, 1)'
            )
        })
        it('should convert hexadecimal to rgba', () => {
            expect(block.__valueHandler('#800080', 'customValue', 0)).toBe(
                'rgba(128, 0, 128, 1)'
            )
        })
        it('should HSL(Hue, Saturation, Lightness) to rgba', () => {
            expect(
                block.__valueHandler('hsl(0, 0%, 50%)', 'customValue', 0)
            ).toBe('rgba(128, 128, 128, 1)')
        })
        it('should convert array of values to correct value', () => {
            expect(
                block.__valueHandler(['20px', '10', 'white'], 'customValue', 0)
            ).toEqual([20, 10, 'rgba(255, 255, 255, 1)'])
        })
        it('should use set method for setting option value', () => {
            expect(() => block.set({ x: 20 })).not.toThrow()
            expect(block.x()).toBe(20)
        })
        it('should convert list of params to list of correct type', () => {
            expect(
                block.__valueHandler([20, '20in', 'green'], 'customValue', [])
            ).toStrictEqual([20, 1920.24, 'rgba(0, 128, 0, 1)'])
        })
        it('should only output important value', () => {
            block.set({ important: { x: 40 } })
            expect(block.x()).toBe(40)
        })
        it('should set current value of block options', () => {
            block.setOptionCurrentVal('x', 10)
            expect(block.getOptionCurrentVal('x')).toBe(10)
        })
        it('should set cache value of block options', () => {
            block.setOptionCacheVal('x', 10)
            expect(block.getOptionCacheVal('x')).toBe(10)
        })
        it('should set method set options of block', () => {
            block.set({ x: 10 })
            expect(block.x()).toBe(10)
        })
        it('should bind options of block', () => {
            block.set({ x: 100 })
            const bindBlock = new Block({ x: 50, y: 10 })
            bindBlock.bindTo(block, ['x'])
            canvas.add(bindBlock)
            expect(bindBlock.x()).toBe(100)
        })
    })
    describe('block transformations', () => {
        beforeEach(() => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                x: 20,
                y: 30,
                width: 100,
                height: 100,
            })
            canvas.add(block)
        })
        it('should set initial coordinates', () => {
            expect([
                block.cornerTopLeft(),
                block.cornerTopRight(),
                block.cornerBottomLeft(),
                block.cornerBottomRight(),
            ]).toMatchSnapshot()
            expect([
                block.hotRotatableAreaTopLeft(),
                block.hotRotatableAreaTopRight(),
                block.hotRotatableAreaBottomLeft(),
                block.hotRotatableAreaBottomRight(),
            ]).toMatchSnapshot()
            expect([
                block.hotResizableAreaTopLeft(),
                block.hotResizableAreaTopRight(),
                block.hotResizableAreaBottomLeft(),
                block.hotResizableAreaBottomRight(),
                block.hotResizableAreaTop(),
                block.hotResizableAreaLeft(),
                block.hotResizableAreaBottom(),
                block.hotResizableAreaRight(),
            ]).toMatchSnapshot()
        })
        it('should change x coordinate', () => {
            block.set({ x: 120 })
            expect([
                block.cornerTopLeft(),
                block.cornerTopRight(),
                block.cornerBottomLeft(),
                block.cornerBottomRight(),
            ]).toMatchSnapshot()
            expect([
                block.hotRotatableAreaTopLeft(),
                block.hotRotatableAreaTopRight(),
                block.hotRotatableAreaBottomLeft(),
                block.hotRotatableAreaBottomRight(),
            ]).toMatchSnapshot()
            expect([
                block.hotResizableAreaTopLeft(),
                block.hotResizableAreaTopRight(),
                block.hotResizableAreaBottomLeft(),
                block.hotResizableAreaBottomRight(),
                block.hotResizableAreaTop(),
                block.hotResizableAreaLeft(),
                block.hotResizableAreaBottom(),
                block.hotResizableAreaRight(),
            ]).toMatchSnapshot()
        })
        it('should change y coordinate', () => {
            block.set({ y: 20 })
            expect([
                block.cornerTopLeft(),
                block.cornerTopRight(),
                block.cornerBottomLeft(),
                block.cornerBottomRight(),
            ]).toMatchSnapshot()
            expect([
                block.hotRotatableAreaTopLeft(),
                block.hotRotatableAreaTopRight(),
                block.hotRotatableAreaBottomLeft(),
                block.hotRotatableAreaBottomRight(),
            ]).toMatchSnapshot()
            expect([
                block.hotResizableAreaTopLeft(),
                block.hotResizableAreaTopRight(),
                block.hotResizableAreaBottomLeft(),
                block.hotResizableAreaBottomRight(),
                block.hotResizableAreaTop(),
                block.hotResizableAreaLeft(),
                block.hotResizableAreaBottom(),
                block.hotResizableAreaRight(),
            ]).toMatchSnapshot()
        })
        it('should resize width', () => {
            block.set({ width: 50 })
            expect([
                block.cornerTopLeft(),
                block.cornerTopRight(),
                block.cornerBottomLeft(),
                block.cornerBottomRight(),
            ]).toMatchSnapshot()
            expect([
                block.hotRotatableAreaTopLeft(),
                block.hotRotatableAreaTopRight(),
                block.hotRotatableAreaBottomLeft(),
                block.hotRotatableAreaBottomRight(),
            ]).toMatchSnapshot()
            expect([
                block.hotResizableAreaTopLeft(),
                block.hotResizableAreaTopRight(),
                block.hotResizableAreaBottomLeft(),
                block.hotResizableAreaBottomRight(),
                block.hotResizableAreaTop(),
                block.hotResizableAreaLeft(),
                block.hotResizableAreaBottom(),
                block.hotResizableAreaRight(),
            ]).toMatchSnapshot()
        })
        it('should resize height', () => {
            block.set({ height: 50 })
            expect([
                block.cornerTopLeft(),
                block.cornerTopRight(),
                block.cornerBottomLeft(),
                block.cornerBottomRight(),
            ]).toMatchSnapshot()
            expect([
                block.hotRotatableAreaTopLeft(),
                block.hotRotatableAreaTopRight(),
                block.hotRotatableAreaBottomLeft(),
                block.hotRotatableAreaBottomRight(),
            ]).toMatchSnapshot()
            expect([
                block.hotResizableAreaTopLeft(),
                block.hotResizableAreaTopRight(),
                block.hotResizableAreaBottomLeft(),
                block.hotResizableAreaBottomRight(),
                block.hotResizableAreaTop(),
                block.hotResizableAreaLeft(),
                block.hotResizableAreaBottom(),
                block.hotResizableAreaRight(),
            ]).toMatchSnapshot()
        })
        it('should scale width and height', () => {
            block.set({ scale: 3 })
            expect(block.width()).toBe(300)
        })
        it('should rotate block', () => {
            block.set({ rotate: 1.2 })
            expect([
                block.cornerTopLeft(),
                block.cornerTopRight(),
                block.cornerBottomLeft(),
                block.cornerBottomRight(),
            ]).toMatchSnapshot()
            expect([
                block.hotRotatableAreaTopLeft(),
                block.hotRotatableAreaTopRight(),
                block.hotRotatableAreaBottomLeft(),
                block.hotRotatableAreaBottomRight(),
            ]).toMatchSnapshot()
            expect([
                block.hotResizableAreaTopLeft(),
                block.hotResizableAreaTopRight(),
                block.hotResizableAreaBottomLeft(),
                block.hotResizableAreaBottomRight(),
                block.hotResizableAreaTop(),
                block.hotResizableAreaLeft(),
                block.hotResizableAreaBottom(),
                block.hotResizableAreaRight(),
            ]).toMatchSnapshot()
        })
        it('should change rotation center x', () => {
            block.set({
                rotationCenterX: block.x() + block.width(),
                rotate: 1.2,
            })
            expect([
                block.cornerTopLeft(),
                block.cornerTopRight(),
                block.cornerBottomLeft(),
                block.cornerBottomRight(),
            ]).toMatchSnapshot()
        })
        it('should change rotation center y', () => {
            block.set({
                rotationCenterY: block.y() + block.height(),
                rotate: 1.2,
            })
            expect([
                block.cornerTopLeft(),
                block.cornerTopRight(),
                block.cornerBottomLeft(),
                block.cornerBottomRight(),
            ]).toMatchSnapshot()
        })
        it('should change coordinates on horizontal flip', () => {
            block.set({
                horizontalFlipResize: true,
                width: -100,
            })
            expect([
                block.cornerTopLeft(),
                block.cornerTopRight(),
                block.cornerBottomLeft(),
                block.cornerBottomRight(),
            ]).toMatchSnapshot()
            expect([
                block.hotRotatableAreaTopLeft(),
                block.hotRotatableAreaTopRight(),
                block.hotRotatableAreaBottomLeft(),
                block.hotRotatableAreaBottomRight(),
            ]).toMatchSnapshot()
            expect([
                block.hotResizableAreaTopLeft(),
                block.hotResizableAreaTopRight(),
                block.hotResizableAreaBottomLeft(),
                block.hotResizableAreaBottomRight(),
                block.hotResizableAreaTop(),
                block.hotResizableAreaLeft(),
                block.hotResizableAreaBottom(),
                block.hotResizableAreaRight(),
            ]).toMatchSnapshot()
        })
        it('should change coordinates on vertical flip', () => {
            block.set({
                verticalFlipResize: true,
                height: -100,
            })
            expect([
                block.cornerTopLeft(),
                block.cornerTopRight(),
                block.cornerBottomLeft(),
                block.cornerBottomRight(),
            ]).toMatchSnapshot()
            expect([
                block.hotRotatableAreaTopLeft(),
                block.hotRotatableAreaTopRight(),
                block.hotRotatableAreaBottomLeft(),
                block.hotRotatableAreaBottomRight(),
            ]).toMatchSnapshot()
            expect([
                block.hotResizableAreaTopLeft(),
                block.hotResizableAreaTopRight(),
                block.hotResizableAreaBottomLeft(),
                block.hotResizableAreaBottomRight(),
                block.hotResizableAreaTop(),
                block.hotResizableAreaLeft(),
                block.hotResizableAreaBottom(),
                block.hotResizableAreaRight(),
            ]).toMatchSnapshot()
        })
        it('should change coordinates on horizontal and vertical flip', () => {
            block.set({
                horizontalFlipResize: true,
                verticalFlipResize: true,
                width: -100,
                height: -100,
            })
            expect([
                block.cornerTopLeft(),
                block.cornerTopRight(),
                block.cornerBottomLeft(),
                block.cornerBottomRight(),
            ]).toMatchSnapshot()
            expect([
                block.hotRotatableAreaTopLeft(),
                block.hotRotatableAreaTopRight(),
                block.hotRotatableAreaBottomLeft(),
                block.hotRotatableAreaBottomRight(),
            ]).toMatchSnapshot()
            expect([
                block.hotResizableAreaTopLeft(),
                block.hotResizableAreaTopRight(),
                block.hotResizableAreaBottomLeft(),
                block.hotResizableAreaBottomRight(),
                block.hotResizableAreaTop(),
                block.hotResizableAreaLeft(),
                block.hotResizableAreaBottom(),
                block.hotResizableAreaRight(),
            ]).toMatchSnapshot()
        })
    })
    describe('child blocks', () => {
        it('should add child blocks before canvas init', () => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                x: 20,
                y: 30,
                width: 100,
                height: 100,
            })
            const childBlock = new Block({})
            block.addChild(childBlock)
            canvas.add(block)
            expect(block.childNodes[0]).toBe(childBlock)
        })
        it('should add child blocks after canvas init', () => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                x: 20,
                y: 30,
                width: 100,
                height: 100,
            })
            const childBlock = new Block({})
            canvas.add(block)
            block.addChild(childBlock)
            expect(block.childNodes[0]).toBe(childBlock)
        })
        it('should remove child blocks before canvas init', () => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                x: 20,
                y: 30,
                width: 100,
                height: 100,
            })
            const childBlock = new Block({})
            block.addChild(childBlock)
            block.removeChild(childBlock)
            canvas.add(block)
            expect(block.childNodes[0]).toBe(undefined)
        })
        it('should find child blocks after canvas init', () => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                x: 20,
                y: 30,
                width: 100,
                height: 100,
            })
            const childBlock = new Block({})
            block.addChild(childBlock)
            canvas.add(block)
            block.removeChild(childBlock)
            expect(block.childNodes[0]).toBe(undefined)
        })
        it('should list child blocks', () => {
            block = new Block({
                x: 70,
                y: 90,
                width: 100,
                height: 100,
                hotLines: true,
                overflow: 'scroll',
            })
            const childBlocks = [new Block({}), new Block({}), new Block({})]
            block.addChild(...childBlocks)
            // listing childs should also ignore overflow and hotline blocks which is created internally
            block.listOnlyChilds((block, currIdx, arrLen) => {
                expect(childBlocks[currIdx]).toBe(block)
                expect(arrLen).not.toBe(currIdx)
            })
        })
        it('should list all child blocks', () => {
            // listing childs should also ignore overflow and hotline blocks which is created internally
            block = new Block({
                x: 70,
                y: 90,
                width: 100,
                height: 100,
                hotLines: true,
                overflow: 'scroll',
            })
            const childBlocks = [new Block({}), new Block({}), new Block({})]
            block.addChild(...childBlocks)
            let currIdx = 0
            block.listAllChilds((block) => {
                expect(childBlocks[currIdx]).toBe(block)
                currIdx++
            })
        })
        it('should adjust coordinates of child blocks', () => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                x: 70,
                y: 90,
                width: 100,
                height: 100,
                rotate: 1.2,
            })
            const childBlocks = [
                new Block({ x: 20, y: 20, width: 40, height: 50 }),
                new Block({ x: 12, y: 0, width: 50, height: 30 }),
                new Block({ x: 2, y: 10, width: 55, height: 32 }),
            ]
            block.addChild(...childBlocks)
            canvas.add(block)
            expect([
                childBlocks[0].x(),
                childBlocks[0].y(),
                childBlocks[0].width(),
                childBlocks[0].height(),
                childBlocks[0].rotate(),
            ]).toStrictEqual([70, 90, 40, 50, 1.2])
            expect([
                childBlocks[1].x(),
                childBlocks[1].y(),
                childBlocks[1].width(),
                childBlocks[1].height(),
                childBlocks[0].rotate(),
            ]).toStrictEqual([110, 90, 50, 30, 1.2])
            expect([
                childBlocks[2].x(),
                childBlocks[2].y(),
                childBlocks[2].width(),
                childBlocks[2].height(),
                childBlocks[0].rotate(),
            ]).toStrictEqual([70, 140, 55, 32, 1.2])
        })
        it('should adjust child rotation center to self', () => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                x: 70,
                y: 90,
                width: 100,
                height: 100,
                rotationCenter: 'self',
            })
            const childBlock = new Block({
                x: 20,
                y: 20,
                width: 40,
                height: 50,
                rotationCenter: 'self',
            })
            block.addChild(childBlock)
            canvas.add(block)
            expect([
                childBlock.rotationCenterX(),
                childBlock.rotationCenterY(),
            ]).toStrictEqual([90, 115])
        })
        it('should hide child block', () => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                x: 70,
                y: 90,
                width: 100,
                height: 100,
                hidden: true,
            })
            const childBlock = new Block({
                x: 20,
                y: 20,
                width: 40,
                height: 50,
            })
            block.addChild(childBlock)
            canvas.add(block)
            expect(childBlock.hidden()).toBe(true)
        })
    })
    describe('spacing', () => {
        beforeEach(() => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                width: 400,
                height: 400,
            })
            canvas.add(block)
        })
        it('padding should parse values', () => {
            block.set({ padding: 20 })
            expect([
                block.paddingTop(),
                block.paddingBottom(),
                block.paddingLeft(),
                block.paddingRight(),
            ]).toStrictEqual([20, 20, 20, 20])

            // parse four array values
            block.set({ padding: [30, 20, 80, 10] })
            expect([
                block.paddingTop(),
                block.paddingRight(),
                block.paddingBottom(),
                block.paddingLeft(),
            ]).toStrictEqual([30, 20, 80, 10])

            // parse three array values
            block.set({ padding: [30, 10, 20] })
            expect([
                block.paddingTop(),
                block.paddingRight(),
                block.paddingBottom(),
                block.paddingLeft(),
            ]).toStrictEqual([30, 10, 20, 10])

            // parse two array values
            block.set({ padding: [30, 10] })
            expect([
                block.paddingTop(),
                block.paddingRight(),
                block.paddingBottom(),
                block.paddingLeft(),
            ]).toStrictEqual([30, 10, 30, 10])

            // parse one array values
            block.set({ padding: [30] })
            expect([
                block.paddingTop(),
                block.paddingRight(),
                block.paddingBottom(),
                block.paddingLeft(),
            ]).toStrictEqual([30, 30, 30, 30])
        })
        it('padding should adjust width and height of block', () => {
            const blockWidth = block.width()
            const blockHeight = block.height()
            const paddingRight = 30
            const paddingBottom = 40
            block.set({
                paddingRight: paddingRight,
                paddingBottom: paddingBottom,
            })
            expect(block.width()).toBe(paddingRight + blockWidth)
            expect(block.height()).toBe(paddingBottom + blockHeight)
        })
        it('padding should add spacing around itself', () => {
            const padding = 30
            const childBlocks = [
                new Block({ width: 100, height: 40 }),
                new Block({ width: 130, height: 40 }),
                new Block({ width: 100, height: 40 }),
            ]
            block.set({ padding: padding })
            block.addChild(...childBlocks)
            expect(childBlocks[0].x()).toBe(padding)
            expect(childBlocks[1].x()).toBe(childBlocks[0].width() + padding)
            expect(childBlocks[2].x()).toBe(
                childBlocks[1].width() + childBlocks[0].width() + padding
            )
        })
        it('margin should parse values', () => {
            block.set({ margin: 20 })
            expect([
                block.marginTop(),
                block.marginBottom(),
                block.marginLeft(),
                block.marginRight(),
            ]).toStrictEqual([20, 20, 20, 20])

            // parse four array values
            block.set({ margin: [30, 20, 80, 10] })
            expect([
                block.marginTop(),
                block.marginRight(),
                block.marginBottom(),
                block.marginLeft(),
            ]).toStrictEqual([30, 20, 80, 10])

            // parse three array values
            block.set({ margin: [30, 10, 20] })
            expect([
                block.marginTop(),
                block.marginRight(),
                block.marginBottom(),
                block.marginLeft(),
            ]).toStrictEqual([30, 10, 20, 10])

            // parse two array values
            block.set({ margin: [30, 10] })
            expect([
                block.marginTop(),
                block.marginRight(),
                block.marginBottom(),
                block.marginLeft(),
            ]).toStrictEqual([30, 10, 30, 10])

            // parse one array values
            block.set({ margin: [30] })
            expect([
                block.marginTop(),
                block.marginRight(),
                block.marginBottom(),
                block.marginLeft(),
            ]).toStrictEqual([30, 30, 30, 30])
        })
        it('margin should add spacing around itself', () => {
            const margin = 30
            const childBlocks = [
                new Block({ width: 100, height: 40 }),
                new Block({ width: 130, height: 40, margin: margin }),
                new Block({ width: 100, height: 40 }),
            ]
            block.addChild(...childBlocks)
            expect(childBlocks[0].x()).toBe(0)
            expect(childBlocks[1].x()).toBe(childBlocks[0].width() + margin)
            expect(childBlocks[2].x()).toBe(
                childBlocks[1].width() + childBlocks[0].width() + margin * 2
            )
        })
    })
    describe('min and max size', () => {
        beforeEach(() => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                width: 400,
                height: 400,
            })
            canvas.add(block)
        })
        it('should limit width by maxWidth', () => {
            block.set({ maxWidth: 120 })
            expect(block.width()).toBe(120)
        })
        it('should limit height by maxHeight', () => {
            block.set({ maxHeight: 120 })
            expect(block.height()).toBe(120)
        })
        it('should enforce minWidth', () => {
            block.set({ minWidth: 50, width: 20 })
            expect(block.width()).toBe(50)
        })
        it('should enforce minHeight', () => {
            block.set({ minHeight: 50, height: 20 })
            expect(block.height()).toBe(50)
        })
        it('should resize children respecting min and max size', () => {
            const childBlocks = [
                new Block({
                    width: 100,
                    height: 40,
                    maxWidth: 120,
                    minWidth: 20,
                }),
                new Block({
                    width: 130,
                    height: 40,
                    maxWidth: 90,
                    minWidth: 0,
                }),
                new Block({
                    width: 100,
                    height: 40,
                    maxWidth: 120,
                    minWith: 40,
                }),
            ]
            block.addChild(...childBlocks)
            block.set({ width: 200 })
            expect([
                childBlocks[0].x(),
                childBlocks[0].y(),
                childBlocks[0].width(),
            ]).toStrictEqual([0, 0, 120])

            expect([
                childBlocks[1].x(),
                childBlocks[1].y(),
                childBlocks[1].width(),
            ]).toStrictEqual([0, 40, 90])
            expect([
                childBlocks[2].x(),
                childBlocks[2].y(),
                childBlocks[2].width(),
            ]).toStrictEqual([0, 80, 120])
        })
    })
    describe('positioning', () => {
        beforeEach(() => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                width: 120,
                height: 120,
            })
            canvas.add(block)
        })
        it('should set fixed position', () => {
            block.set({
                position: 'fixed',
                left: 40,
                top: 30,
            })
            expect([block.x(), block.y()]).toStrictEqual([40, 30])
            block.set({
                position: 'fixed',
                left: undefined,
                top: undefined,
                right: 120,
                bottom: 30,
            })
            expect([block.x(), block.y()]).toStrictEqual([160, 350])
        })
        it('should set absolute position', () => {
            block.set({
                position: 'absolute',
                left: 40,
                top: 30,
            })
            expect([block.x(), block.y()]).toStrictEqual([40, 30])

            block.set({
                position: 'absolute',
                right: 120,
                bottom: 30,
                left: undefined,
                top: undefined,
            })
            expect([block.x(), block.y()]).toStrictEqual([160, 350])
        })
        it('should set sticky position', () => {
            block.set({
                position: 'sticky',
                left: 40,
                top: 30,
                x: 10,
                y: 10,
            })
            expect([block.x(), block.y()]).toStrictEqual([40, 30])

            block.set({
                position: 'sticky',
                right: 120,
                bottom: 200,
                x: 230,
                y: 210,
                left: undefined,
                top: undefined,
            })
            expect([block.x(), block.y()]).toStrictEqual([160, 180])
        })
        it('should set relative position', () => {
            block.set({
                position: 'relative',
                left: 40,
                top: 30,
            })
            expect([block.x(), block.y()]).toStrictEqual([40, 30])

            block.set({
                position: 'relative',
                right: 120,
                bottom: 200,
                left: undefined,
                top: undefined,
            })
            expect([block.x(), block.y()]).toStrictEqual([-120, -200])
        })
        it('does not adjust fixed positioned child', () => {
            const childBlock = new Block({
                position: 'fixed',
                left: 100,
                top: 50,
            })
            block.addChild(childBlock)
            expect([childBlock.x(), childBlock.y()]).toStrictEqual([100, 50])
        })
        it('does not adjust absolute positioned child', () => {
            const childBlock = new Block({
                position: 'absolute',
                left: 100,
                top: 50,
            })
            block.addChild(childBlock)
            expect([childBlock.x(), childBlock.y()]).toStrictEqual([100, 50])
        })
        it('should position relative child', () => {
            block.set({ x: 100, y: 100 })
            const childBlock = new Block({
                position: 'relative',
                bottom: 100,
                right: 100,
            })
            block.addChild(childBlock)
            expect([childBlock.x(), childBlock.y()]).toStrictEqual([0, 0])

            childBlock.set({
                top: 100,
                left: 100,
                bottom: undefined,
                right: undefined,
            })
            expect([childBlock.x(), childBlock.y()]).toStrictEqual([200, 200])
        })
        it('should position sticky child', () => {
            block.set({ x: 100, y: 100, overflow: 'scroll' })
            const childBlock = new Block({
                width: 20,
                height: 20,
                position: 'sticky',
                top: 10,
                left: 10,
            })
            const childBlockSecond = new Block({
                width: 20,
                height: 20,
            })

            block.addChild(childBlock, childBlockSecond)
            block.__overflowTranslateX(100)
            block.__overflowTranslateY(100)
            expect([childBlock.x(), childBlock.y()]).toStrictEqual([110, 110])

            childBlockSecond.set({
                bottom: 120,
                right: 120,
                top: undefined,
                left: undefined,
            })
            expect([childBlockSecond.x(), childBlockSecond.y()]).toStrictEqual([
                120, 100,
            ])
        })
    })
    describe('overflow', () => {
        beforeEach(() => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                selectable: true,
            })
            canvas.add(block)
        })
        afterEach(() => {
            canvas.isFocused = false
        })
        it('should hide overflow', async () => {
            block.set({ overflow: 'hidden' })
            const childBlock = new Block({
                width: 300,
                height: 300,
                backgroundColor: 'red',
            })
            const onRenderChildDraw = () => {
                const context = childBlock.context
                if (!context) return
                context.beginPath()
                context.fillStyle = 'red'
                context.fillRect(
                    childBlock.x(),
                    childBlock.y(),
                    childBlock.width(),
                    childBlock.height()
                )
            }
            childBlock.set({ onRender: onRenderChildDraw })
            block.addChild(childBlock)
            await expect(page.elementLocator(canvas.canvas)).toMatchScreenshot(
                'overflow-hidden'
            )
        })
        it('should show overflow', async () => {
            block.set({ overflow: 'visible' })
            block.addChild(
                new RectangleBlock({
                    width: 300,
                    height: 300,
                    backgroundColor: 'red',
                })
            )
            await expect(page.elementLocator(canvas.canvas)).toMatchScreenshot(
                'overflow-visible'
            )
        })
        it('should create scroll bar for overflowX scroll', () => {
            block.set({ overflowX: 'scroll' })
            expect(block.childNodes[0].name()).toBe(
                OVERFLOW_SCROLL_BAR_BLOCK_NAME
            )
        })
        it('should create scroll bar for overflowY scroll', () => {
            block.set({ overflowY: 'scroll' })
            expect(block.childNodes[0].name()).toBe(
                OVERFLOW_SCROLL_BAR_BLOCK_NAME
            )
        })
        it('should create scroll bar for overflowX auto', () => {
            block.set({ overflowX: 'auto' })
            expect(block.childNodes[0].name()).toBe(
                OVERFLOW_SCROLL_BAR_BLOCK_NAME
            )
        })
        it('should create scroll bar for overflowY auto', () => {
            block.set({ overflowY: 'auto' })
            expect(block.childNodes[0].name()).toBe(
                OVERFLOW_SCROLL_BAR_BLOCK_NAME
            )
        })
        it('should scroll on wheel along x axis', () => {
            const childBlock = new Block({ width: 150, height: 50 })
            block.addChild(childBlock)
            block.set({ overflowX: 'scroll' })

            // the canvas registers its wheel listener on window load, which
            // already fired in the test environment, so trigger it manually
            window.onload?.(new Event('load'))
            canvas.isFocused = true

            window.dispatchEvent(
                new WheelEvent('wheel', {
                    shiftKey: true,
                    deltaY: 100,
                    clientX: 10,
                    clientY: 10,
                    bubbles: true,
                    cancelable: true,
                })
            )
            expect(childBlock.x()).toBe(-10)
        })
        it('should scroll on wheel along y axis', () => {
            const childBlock = new Block({ width: 50, height: 150 })
            block.addChild(childBlock)
            block.set({ overflowY: 'scroll' })

            window.onload?.(new Event('load'))
            canvas.isFocused = true

            window.dispatchEvent(
                new WheelEvent('wheel', {
                    deltaY: 100,
                    clientX: 10,
                    clientY: 10,
                    bubbles: true,
                    cancelable: true,
                })
            )
            expect(childBlock.y()).toBe(-10)
        })
    })
    describe('transformations', () => {
        beforeEach(() => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                selectable: true,
            })
            canvas.add(block)
        })
        it('should resize block by dragging', async () => {
            block.set({ resizable: true })
            const targetLocator = page.elementLocator(canvas.canvas)
            const element = await targetLocator.element()

            // select the block so the resize handles become active
            element.dispatchEvent(
                new MouseEvent('click', {
                    clientX: 10,
                    clientY: 10,
                    button: 0,
                    bubbles: true,
                    cancelable: true,
                })
            )

            // hover the right resizable edge to arm the resize handle
            element.dispatchEvent(
                new MouseEvent('mousemove', {
                    clientX: 100,
                    clientY: 50,
                    button: 0,
                    buttons: 0,
                    bubbles: true,
                    cancelable: true,
                })
            )

            element.dispatchEvent(
                new MouseEvent('mousedown', {
                    clientX: 100,
                    clientY: 50,
                    button: 0,
                    buttons: 1,
                    bubbles: true,
                    cancelable: true,
                })
            )

            element.dispatchEvent(
                new MouseEvent('mousemove', {
                    clientX: 200,
                    clientY: 50,
                    button: 0,
                    buttons: 1,
                    bubbles: true,
                    cancelable: true,
                })
            )

            element.dispatchEvent(
                new MouseEvent('mouseup', {
                    clientX: 200,
                    clientY: 50,
                    button: 0,
                    bubbles: true,
                    cancelable: true,
                })
            )

            expect(block.width()).toBe(200)
            expect(block.x()).toBe(0)
            expect(block.y()).toBe(0)
            expect(block.height()).toBe(100)
        })
        it('should resize from specified corners', async () => {
            block.set({ resizable: true })
            const targetLocator = page.elementLocator(canvas.canvas)
            const element = await targetLocator.element()

            // select the block so the resize handles become active
            element.dispatchEvent(
                new MouseEvent('click', {
                    clientX: 10,
                    clientY: 10,
                    button: 0,
                    bubbles: true,
                    cancelable: true,
                })
            )

            // hover the top-left resizable corner to arm the corner handle
            element.dispatchEvent(
                new MouseEvent('mousemove', {
                    clientX: 5,
                    clientY: 5,
                    button: 0,
                    buttons: 0,
                    bubbles: true,
                    cancelable: true,
                })
            )

            element.dispatchEvent(
                new MouseEvent('mousedown', {
                    clientX: 5,
                    clientY: 5,
                    button: 0,
                    buttons: 1,
                    bubbles: true,
                    cancelable: true,
                })
            )

            element.dispatchEvent(
                new MouseEvent('mousemove', {
                    clientX: 20,
                    clientY: 20,
                    button: 0,
                    buttons: 1,
                    bubbles: true,
                    cancelable: true,
                })
            )

            element.dispatchEvent(
                new MouseEvent('mouseup', {
                    clientX: 20,
                    clientY: 20,
                    button: 0,
                    bubbles: true,
                    cancelable: true,
                })
            )

            expect(block.x()).toBe(15)
            expect(block.y()).toBe(15)
            expect(block.width()).toBe(85)
            expect(block.height()).toBe(85)
        })
        it('should call onResize while resizing', async () => {
            let isResizingOn = false
            const onResizeFunc = () => {
                isResizingOn = true
            }
            block.set({
                resizable: true,
                onResize: onResizeFunc,
            })
            const targetLocator = page.elementLocator(canvas.canvas)
            const element = await targetLocator.element()

            element.dispatchEvent(
                new MouseEvent('click', {
                    clientX: 10,
                    clientY: 10,
                    button: 0,
                    bubbles: true,
                    cancelable: true,
                })
            )

            element.dispatchEvent(
                new MouseEvent('mousemove', {
                    clientX: 100,
                    clientY: 50,
                    button: 0,
                    buttons: 0,
                    bubbles: true,
                    cancelable: true,
                })
            )

            element.dispatchEvent(
                new MouseEvent('mousedown', {
                    clientX: 100,
                    clientY: 50,
                    button: 0,
                    buttons: 1,
                    bubbles: true,
                    cancelable: true,
                })
            )

            element.dispatchEvent(
                new MouseEvent('mousemove', {
                    clientX: 200,
                    clientY: 50,
                    button: 0,
                    buttons: 1,
                    bubbles: true,
                    cancelable: true,
                })
            )

            element.dispatchEvent(
                new MouseEvent('mouseup', {
                    clientX: 200,
                    clientY: 50,
                    button: 0,
                    bubbles: true,
                    cancelable: true,
                })
            )

            expect(isResizingOn).toBeTruthy()
        })

        it('should rotate block by dragging', async () => {
            block.set({ rotatable: true })
            const targetLocator = page.elementLocator(canvas.canvas)
            const element = await targetLocator.element()

            // select the block so the rotation handles become active
            element.dispatchEvent(
                new MouseEvent('click', {
                    clientX: 10,
                    clientY: 10,
                    button: 0,
                    bubbles: true,
                    cancelable: true,
                })
            )

            // hover the bottom-right rotatable corner to arm the handle
            element.dispatchEvent(
                new MouseEvent('mousemove', {
                    clientX: 105,
                    clientY: 105,
                    button: 0,
                    buttons: 0,
                    bubbles: true,
                    cancelable: true,
                })
            )

            element.dispatchEvent(
                new MouseEvent('mousedown', {
                    clientX: 105,
                    clientY: 105,
                    button: 0,
                    buttons: 1,
                    bubbles: true,
                    cancelable: true,
                })
            )

            element.dispatchEvent(
                new MouseEvent('mousemove', {
                    clientX: 150,
                    clientY: 50,
                    button: 0,
                    buttons: 1,
                    bubbles: true,
                    cancelable: true,
                })
            )

            element.dispatchEvent(
                new MouseEvent('mouseup', {
                    clientX: 150,
                    clientY: 50,
                    button: 0,
                    bubbles: true,
                    cancelable: true,
                })
            )

            expect(block.rotate()).toBeCloseTo(-Math.PI / 4, 10)
        })
        it('should rotate from specified corners', async () => {
            block.set({ rotatable: true })
            const targetLocator = page.elementLocator(canvas.canvas)
            const element = await targetLocator.element()

            element.dispatchEvent(
                new MouseEvent('click', {
                    clientX: 10,
                    clientY: 10,
                    button: 0,
                    bubbles: true,
                    cancelable: true,
                })
            )

            // hover the top-left rotatable corner to arm the handle
            element.dispatchEvent(
                new MouseEvent('mousemove', {
                    clientX: -7,
                    clientY: -7,
                    button: 0,
                    buttons: 0,
                    bubbles: true,
                    cancelable: true,
                })
            )

            element.dispatchEvent(
                new MouseEvent('mousedown', {
                    clientX: -7,
                    clientY: -7,
                    button: 0,
                    buttons: 1,
                    bubbles: true,
                    cancelable: true,
                })
            )

            element.dispatchEvent(
                new MouseEvent('mousemove', {
                    clientX: 150,
                    clientY: 50,
                    button: 0,
                    buttons: 1,
                    bubbles: true,
                    cancelable: true,
                })
            )

            element.dispatchEvent(
                new MouseEvent('mouseup', {
                    clientX: 150,
                    clientY: 50,
                    button: 0,
                    bubbles: true,
                    cancelable: true,
                })
            )

            expect(block.rotate()).toBeCloseTo((3 * Math.PI) / 4, 10)
        })
        it('should call onRotate while rotating', async () => {
            let isRotatingOn = false
            const onRotateFunc = () => {
                isRotatingOn = true
            }
            block.set({
                rotatable: true,
                onRotate: onRotateFunc,
            })
            const targetLocator = page.elementLocator(canvas.canvas)
            const element = await targetLocator.element()

            element.dispatchEvent(
                new MouseEvent('click', {
                    clientX: 10,
                    clientY: 10,
                    button: 0,
                    bubbles: true,
                    cancelable: true,
                })
            )

            element.dispatchEvent(
                new MouseEvent('mousemove', {
                    clientX: 105,
                    clientY: 105,
                    button: 0,
                    buttons: 0,
                    bubbles: true,
                    cancelable: true,
                })
            )

            element.dispatchEvent(
                new MouseEvent('mousedown', {
                    clientX: 105,
                    clientY: 105,
                    button: 0,
                    buttons: 1,
                    bubbles: true,
                    cancelable: true,
                })
            )

            element.dispatchEvent(
                new MouseEvent('mousemove', {
                    clientX: 150,
                    clientY: 50,
                    button: 0,
                    buttons: 1,
                    bubbles: true,
                    cancelable: true,
                })
            )

            element.dispatchEvent(
                new MouseEvent('mouseup', {
                    clientX: 150,
                    clientY: 50,
                    button: 0,
                    bubbles: true,
                    cancelable: true,
                })
            )

            expect(isRotatingOn).toBeTruthy()
        })

        it('should drag block', async () => {
            block.set({ draggable: true })
            const targetLocator = page.elementLocator(canvas.canvas)
            const element = await targetLocator.element()

            element.dispatchEvent(
                new MouseEvent('mousedown', {
                    clientX: 10,
                    clientY: 10,
                    button: 0,
                    buttons: 1,
                    bubbles: true,
                    cancelable: true,
                })
            )

            element.dispatchEvent(
                new MouseEvent('mousemove', {
                    clientX: 100,
                    clientY: 100,
                    button: 0,
                    buttons: 1,
                    bubbles: true,
                    cancelable: true,
                })
            )
            expect(block.x()).toBe(90)
            expect(block.y()).toBe(90)
        })
        it('should drag block only along x axis', async () => {
            block.set({ draggable: true, draggableY: false })
            const targetLocator = page.elementLocator(canvas.canvas)
            const element = await targetLocator.element()
            element.dispatchEvent(
                new MouseEvent('mousedown', {
                    clientX: 10,
                    clientY: 10,
                    button: 0,
                    buttons: 1,
                    bubbles: true,
                    cancelable: true,
                })
            )
            element.dispatchEvent(
                new MouseEvent('mousemove', {
                    clientX: 100,
                    clientY: 100,
                    button: 0,
                    buttons: 1,
                    bubbles: true,
                    cancelable: true,
                })
            )
            expect(block.x()).toBe(90)
            expect(block.y()).toBe(0)
        })
        it('should drag block only along y axis', async () => {
            block.set({ draggable: true, draggableX: false })
            const targetLocator = page.elementLocator(canvas.canvas)
            const element = await targetLocator.element()
            element.dispatchEvent(
                new MouseEvent('mousedown', {
                    clientX: 10,
                    clientY: 10,
                    button: 0,
                    buttons: 1,
                    bubbles: true,
                    cancelable: true,
                })
            )
            element.dispatchEvent(
                new MouseEvent('mousemove', {
                    clientX: 100,
                    clientY: 100,
                    button: 0,
                    buttons: 1,
                    bubbles: true,
                    cancelable: true,
                })
            )
            expect(block.x()).toBe(0)
            expect(block.y()).toBe(90)
        })
        it('should call onDrag while dragging', async () => {
            let isDraggingOn = false
            const onDragFunc = () => {
                isDraggingOn = true
            }
            block.set({
                draggable: true,
                draggableX: false,
                onDrag: onDragFunc,
            })
            const targetLocator = page.elementLocator(canvas.canvas)
            const element = await targetLocator.element()
            element.dispatchEvent(
                new MouseEvent('mousedown', {
                    clientX: 10,
                    clientY: 10,
                    button: 0,
                    buttons: 1,
                    bubbles: true,
                    cancelable: true,
                })
            )
            element.dispatchEvent(
                new MouseEvent('mousemove', {
                    clientX: 100,
                    clientY: 100,
                    button: 0,
                    buttons: 1,
                    bubbles: true,
                    cancelable: true,
                })
            )
            expect(isDraggingOn).toBeTruthy()
        })
    })
    describe('events', () => {
        beforeEach(() => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                selectable: true,
            })
            canvas.add(block)
        })
        it('should trigger click event', async () => {
            const currentCanvas = page.elementLocator(canvas.canvas)
            let isClicked = false
            block.click(() => {
                isClicked = true
            })
            await userEvent.click(currentCanvas, { position: { x: 10, y: 10 } })
            expect(isClicked).toBeTruthy()
        })
        it('should trigger dblclick event', async () => {
            const currentCanvas = page.elementLocator(canvas.canvas)
            let isClicked = false
            block.dblclick(() => {
                isClicked = true
            })
            await userEvent.dblClick(currentCanvas, {
                position: { x: 10, y: 10 },
            })
            expect(isClicked).toBeTruthy()
        })
        it('should trigger contextmenu event on right click', async () => {
            const currentCanvas = page.elementLocator(canvas.canvas)
            let isClicked = false
            block.contextMenu(() => {
                isClicked = true
            })
            await userEvent.click(currentCanvas, {
                position: { x: 10, y: 10 },
                button: 'right',
            })
            expect(isClicked).toBeTruthy()
        })
        it('should trigger mousedown event', async () => {
            const currentCanvas = page.elementLocator(canvas.canvas)
            const element = await currentCanvas.element()

            let isMouseDown = false
            block.mousedown(() => {
                isMouseDown = true
            })
            element.dispatchEvent(
                new MouseEvent('mousedown', {
                    clientX: 10,
                    clientY: 10,
                    button: 0,
                    buttons: 1,
                    bubbles: true,
                    cancelable: true,
                })
            )
            expect(isMouseDown).toBeTruthy()
        })
        it('should trigger mouseup event', async () => {
            const currentCanvas = page.elementLocator(canvas.canvas)
            const element = await currentCanvas.element()

            let isMouseUp = false
            block.mouseup(() => {
                isMouseUp = true
            })
            element.dispatchEvent(
                new MouseEvent('mouseup', {
                    clientX: 10,
                    clientY: 10,
                    button: 0,
                    buttons: 1,
                    bubbles: true,
                    cancelable: true,
                })
            )
            expect(isMouseUp).toBeTruthy()
        })
        it('should trigger mousemove event', async () => {
            const currentCanvas = page.elementLocator(canvas.canvas)
            const element = await currentCanvas.element()

            let isMouseMove = false
            block.mousemove(() => {
                isMouseMove = true
            })
            element.dispatchEvent(
                new MouseEvent('mousemove', {
                    clientX: 10,
                    clientY: 10,
                    button: 0,
                    buttons: 1,
                    bubbles: true,
                    cancelable: true,
                })
            )
            expect(isMouseMove).toBeTruthy()
        })
        it('should trigger mouseenter event', async () => {
            const currentCanvas = page.elementLocator(canvas.canvas)
            const element = await currentCanvas.element()

            let isMouseEnter = false
            block.mouseenter(() => {
                isMouseEnter = true
            })

            // select the block so it becomes the top-most block
            element.dispatchEvent(
                new MouseEvent('click', {
                    clientX: 10,
                    clientY: 10,
                    button: 0,
                    bubbles: true,
                    cancelable: true,
                })
            )

            element.dispatchEvent(
                new MouseEvent('mousemove', {
                    clientX: 10,
                    clientY: 10,
                    bubbles: true,
                    cancelable: true,
                })
            )

            expect(isMouseEnter).toBeTruthy()
        })
        it('should trigger mouseleave event', async () => {
            const currentCanvas = page.elementLocator(canvas.canvas)
            const element = await currentCanvas.element()

            let isMouseLeave = false
            block.mouseleave(() => {
                isMouseLeave = true
            })

            element.dispatchEvent(
                new MouseEvent('mousemove', {
                    clientX: 320,
                    clientY: 320,
                    bubbles: true,
                    cancelable: true,
                })
            )

            expect(isMouseLeave).toBeTruthy()
        })
        it.todo('should trigger mouseover event', async () => {})
        it.todo('should trigger mouseout event', async () => {})
        it('should trigger keyup event', async () => {
            const currentCanvas = page.elementLocator(canvas.canvas)
            const element = await currentCanvas.element()

            let isKeyUp = false
            block.keyup(() => {
                isKeyUp = true
            })

            canvas.isFocused = true
            element.dispatchEvent(
                new KeyboardEvent('keyup', {
                    key: 'Enter',
                    code: 'Enter',
                    bubbles: true,
                    cancelable: true,
                })
            )
            expect(isKeyUp).toBeTruthy()
        })
        it('should trigger keydown event', async () => {
            const currentCanvas = page.elementLocator(canvas.canvas)
            const element = await currentCanvas.element()

            let isKeyDown = false
            block.keydown(() => {
                isKeyDown = true
            })

            canvas.isFocused = true
            element.dispatchEvent(
                new KeyboardEvent('keydown', {
                    key: 'Enter',
                    code: 'Enter',
                    bubbles: true,
                    cancelable: true,
                })
            )
            expect(isKeyDown).toBeTruthy()
        })
        it('should trigger wheel event', async () => {
            const currentCanvas = page.elementLocator(canvas.canvas)
            const element = await currentCanvas.element()

            let isWheeled = false
            block.wheel(() => {
                isWheeled = true
            })

            canvas.isFocused = true
            element.dispatchEvent(
                new WheelEvent('wheel', {
                    deltaY: 100,
                    clientX: 10,
                    clientY: 10,
                    bubbles: true,
                    cancelable: true,
                })
            )

            expect(isWheeled).toBeTruthy()
        })
        it('does not trigger events on non-selectable block', async () => {
            block.set({ selectable: false })
            const currentCanvas = page.elementLocator(canvas.canvas)
            let isClicked = false
            block.click(() => {
                isClicked = true
            })
            await userEvent.click(currentCanvas, { position: { x: 10, y: 10 } })
            expect(isClicked).toBeFalsy()
        })
        it('registers events before adding block to canvas', async () => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                selectable: true,
            })
            const currentCanvas = page.elementLocator(canvas.canvas)
            let isClicked = false
            block.click(() => {
                isClicked = true
            })
            canvas.add(block)
            await userEvent.click(currentCanvas, { position: { x: 10, y: 10 } })
            expect(isClicked).toBeTruthy()
        })
    })
    describe('Customizing')
    describe('Animations')
})
