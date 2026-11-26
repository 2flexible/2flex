import { describe, it, expect } from 'vite-plus/test'
import { BaseBlock } from '../../BaseBlock'
import { CanvasGrid } from '../../CanvasGrid'

const makeBlock = (nodeId: number, x: number, y: number, size = 10) => {
    const block = new BaseBlock({})
    block.nodeId = nodeId
    block.boundingBox = {
        topLeft: { x, y },
        topRight: { x: x + size, y },
        bottomLeft: { x, y: y + size },
        bottomRight: { x: x + size, y: y + size },
    }
    return block
}

const tileAt = (grid: CanvasGrid, col: number, row: number) =>
    grid.allTiles.find((tile) => tile.col === col && tile.row === row)

describe('CanvasGrid', () => {
    it('should keep a block in every tile it overlaps', () => {
        const grid = new CanvasGrid(400, 400, 256)
        const block = makeBlock(1, 250, 10)
        grid.addBlock(block)

        expect(tileAt(grid, 0, 0)!.blocks.has(block)).toBe(true)
        expect(tileAt(grid, 1, 0)!.blocks.has(block)).toBe(true)
    })
    it('should drop a block from the tiles it left', () => {
        const grid = new CanvasGrid(400, 400, 256)
        const block = makeBlock(1, 10, 10)
        grid.addBlock(block)
        expect(tileAt(grid, 0, 0)!.blocks.has(block)).toBe(true)

        // the block moves so far away that the grid has to grow, which
        // re-buckets every block of the grid
        block.boundingBox = makeBlock(1, 1000, 1000).boundingBox
        grid.updateBlock(block)

        expect(tileAt(grid, 0, 0)!.blocks.has(block)).toBe(false)
        expect(tileAt(grid, 3, 3)!.blocks.has(block)).toBe(true)
    })
    it('should drop a block from the tiles it left when it is added again', () => {
        const grid = new CanvasGrid(400, 400, 256)
        const block = makeBlock(1, 10, 10)
        grid.addBlock(block)

        block.boundingBox = makeBlock(1, 1000, 1000).boundingBox
        grid.addBlock(block)

        expect(tileAt(grid, 0, 0)!.blocks.has(block)).toBe(false)
        expect(tileAt(grid, 3, 3)!.blocks.has(block)).toBe(true)
    })
    it('should not grow endlessly when a block has infinite bounds', () => {
        const grid = new CanvasGrid(400, 400, 256)
        const block = makeBlock(1, 10, 10)
        block.boundingBox = {
            topLeft: { x: -Infinity, y: -Infinity },
            topRight: { x: Infinity, y: -Infinity },
            bottomLeft: { x: -Infinity, y: Infinity },
            bottomRight: { x: Infinity, y: Infinity },
        }

        // the grid must not hang on the infinite range
        grid.addBlock(block)

        expect(grid.allTiles.length).toBeGreaterThan(0)
    })
    it('should not grow endlessly when a block has nan bounds', () => {
        const grid = new CanvasGrid(400, 400, 256)
        const block = makeBlock(1, 10, 10)
        block.boundingBox = {
            topLeft: { x: NaN, y: NaN },
            topRight: { x: NaN, y: NaN },
            bottomLeft: { x: NaN, y: NaN },
            bottomRight: { x: NaN, y: NaN },
        }

        grid.addBlock(block)

        expect(grid.allTiles.length).toBeGreaterThan(0)
    })
    it('should rasterize the tiles at one by default', () => {
        const grid = new CanvasGrid(400, 400, 256)

        expect(grid.allTiles.every((tile) => tile.renderScale === 1)).toBe(true)
    })
    it('should mark the tiles dirty when the render scale changes', () => {
        const grid = new CanvasGrid(400, 400, 256)
        const tile = tileAt(grid, 0, 0)!
        tile.dirty = false

        grid.setRenderScale(2)

        expect(tile.renderScale).toBe(2)
        expect(tile.dirty).toBe(true)
    })
    it('should keep the tiles clean when the render scale stays the same', () => {
        const grid = new CanvasGrid(400, 400, 256)
        const tile = tileAt(grid, 0, 0)!
        tile.dirty = false

        grid.setRenderScale(1)

        expect(tile.renderScale).toBe(1)
        expect(tile.dirty).toBe(false)
    })
    it('should grow the tile buffer with the render scale', () => {
        const grid = new CanvasGrid(400, 400, 256)
        const tile = tileAt(grid, 0, 0)!

        grid.setRenderScale(2)
        tile.paint([])

        // the tile holds two pixels per world unit
        expect(tile.dummyCanvas.width).toBe(512)
        expect(tile.dummyCanvas.height).toBe(512)
    })
    it('should draw the world coordinates into the tile pixels', () => {
        const grid = new CanvasGrid(400, 400, 256)
        const block = makeBlock(1, 10, 20)
        grid.addBlock(block)

        const mapped: { x: number; y: number }[] = []
        block.render = () => {
            const context = block.context
            if (!context) return
            const point = new DOMPoint(10, 20).matrixTransform(
                context.getTransform()
            )
            mapped.push({ x: point.x, y: point.y })
        }

        const tile = tileAt(grid, 0, 0)!
        tile.paint([block])
        // one world unit is one pixel
        expect(mapped[0]).toEqual({ x: 10, y: 20 })

        grid.setRenderScale(2)
        tile.paint([block])
        // one world unit is two pixels now
        expect(mapped[1]).toEqual({ x: 20, y: 40 })
    })
    it('should draw a block relative to the origin of its tile', () => {
        const grid = new CanvasGrid(400, 400, 256)
        const block = makeBlock(1, 300, 300)
        grid.addBlock(block)

        const mapped: { x: number; y: number }[] = []
        block.render = () => {
            const context = block.context
            if (!context) return
            const point = new DOMPoint(300, 300).matrixTransform(
                context.getTransform()
            )
            mapped.push({ x: point.x, y: point.y })
        }

        // the second tile starts at world (256, 256)
        const tile = tileAt(grid, 1, 1)!
        tile.paint([block])
        expect(mapped[0]).toEqual({ x: 44, y: 44 })

        grid.setRenderScale(2)
        tile.paint([block])
        expect(mapped[1]).toEqual({ x: 88, y: 88 })
    })
})
