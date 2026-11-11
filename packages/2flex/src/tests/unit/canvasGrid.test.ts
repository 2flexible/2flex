import { describe, it, expect } from 'vitest'
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
})
