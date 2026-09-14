import { BaseBlock } from './BaseBlock'
import { DummyCanvas } from './DummyCanvas'
import { HotCornerArea } from './types'

export class GridTile {
    col: number
    row: number
    tileSize: number
    blocks: Set<BaseBlock>
    dummyCanvas: DummyCanvas
    context?: OffscreenCanvasRenderingContext2D | null
    bitmap?: ImageBitmap
    dirty: boolean

    constructor(col: number, row: number, tileSize: number) {
        this.col = col
        this.row = row
        this.tileSize = tileSize
        this.dummyCanvas = new DummyCanvas(tileSize, tileSize)
        this.blocks = new Set()
        this.dirty = true
        this.context = this.dummyCanvas.context
    }

    paint(sortedBlocks: BaseBlock[]) {
        this.context?.clearRect(0, 0, this.tileSize, this.tileSize)
        const ox = this.col * this.tileSize
        const oy = this.row * this.tileSize
        for (const block of sortedBlocks) {
            if (!this.blocks.has(block) || !this.context) continue
            block.context = this.context
            this.context.save()
            this.context.translate(-ox, -oy)
            block.render()
            this.context.restore()
        }
        this.bitmap?.close()
        this.bitmap = this.dummyCanvas.transferToImageBitmap()
        this.dirty = false
    }
}

export class CanvasGrid {
    tileSize: number
    cols: number
    rows: number
    #tiles: GridTile[]
    #blockTiles: Map<number, Set<number>>

    constructor(
        canvasWidth: number,
        canvasHeight: number,
        tileSize: number = 256
    ) {
        this.tileSize = tileSize
        this.cols = Math.max(1, Math.ceil(canvasWidth / tileSize))
        this.rows = Math.max(1, Math.ceil(canvasHeight / tileSize))
        this.#tiles = []
        this.#blockTiles = new Map()
        this.#buildTiles()
    }

    #buildTiles() {
        this.#tiles = []
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                this.#tiles.push(new GridTile(c, r, this.tileSize))
            }
        }
    }

    resize(canvasWidth: number, canvasHeight: number) {
        const newCols = Math.max(1, Math.ceil(canvasWidth / this.tileSize))
        const newRows = Math.max(1, Math.ceil(canvasHeight / this.tileSize))
        if (newCols === this.cols && newRows === this.rows) {
            this.markAllDirty()
            return
        }
        this.cols = newCols
        this.rows = newRows
        this.#blockTiles.clear()
        this.#buildTiles()
    }

    getTileId(x: number, y: number): number {
        const c = Math.max(
            0,
            Math.min(this.cols - 1, Math.floor(x / this.tileSize))
        )
        const r = Math.max(
            0,
            Math.min(this.rows - 1, Math.floor(y / this.tileSize))
        )
        return r * this.cols + c
    }

    tilesForBBox(bbox: HotCornerArea) {
        const minX = Math.min(
            bbox.topLeft.x,
            bbox.topRight.x,
            bbox.bottomLeft.x,
            bbox.bottomRight.x
        )
        const maxX = Math.max(
            bbox.topLeft.x,
            bbox.topRight.x,
            bbox.bottomLeft.x,
            bbox.bottomRight.x
        )
        const minY = Math.min(
            bbox.topLeft.y,
            bbox.topRight.y,
            bbox.bottomLeft.y,
            bbox.bottomRight.y
        )
        const maxY = Math.max(
            bbox.topLeft.y,
            bbox.topRight.y,
            bbox.bottomLeft.y,
            bbox.bottomRight.y
        )
        const c0 = Math.max(0, Math.floor(minX / this.tileSize))
        const c1 = Math.min(this.cols - 1, Math.floor(maxX / this.tileSize))
        const r0 = Math.max(0, Math.floor(minY / this.tileSize))
        const r1 = Math.min(this.rows - 1, Math.floor(maxY / this.tileSize))

        const ids: Set<number> = new Set()
        for (let r = r0; r <= r1; r++) {
            for (let c = c0; c <= c1; c++) {
                ids.add(r * this.cols + c)
            }
        }
        return ids
    }

    addBlock(block: BaseBlock) {
        if (block.nodeId === undefined) return
        const ids = this.tilesForBBox(block.boundingBox)
        this.#blockTiles.set(block.nodeId, ids)
        for (const id of ids) {
            const tile = this.#tiles[id]
            if (tile) {
                tile.blocks.add(block)
                tile.dirty = true
            }
        }
    }

    removeBlock(block: BaseBlock) {
        if (block.nodeId === undefined) return
        const ids = this.#blockTiles.get(block.nodeId)
        if (!ids) return
        for (const id of ids) {
            const tile = this.#tiles[id]
            if (tile) {
                if (tile.blocks.delete(block)) tile.dirty = true
            }
        }
        this.#blockTiles.delete(block.nodeId)
    }

    updateBlock(block: BaseBlock) {
        if (block.nodeId === undefined) return
        const newIds = this.tilesForBBox(block.boundingBox)
        const oldIds = this.#blockTiles.get(block.nodeId)
        if (oldIds) {
            for (const id of oldIds) {
                const tile = this.#tiles[id]
                if (tile) {
                    tile.blocks.delete(block)
                    tile.dirty = true
                }
            }
        }
        for (const id of newIds) {
            const tile = this.#tiles[id]
            if (tile) {
                tile.blocks.add(block)
                tile.dirty = true
            }
        }
        this.#blockTiles.set(block.nodeId, newIds)
    }

    markAllDirty() {
        for (const tile of this.#tiles) tile.dirty = true
    }

    getDirtyTiles(): GridTile[] {
        return this.#tiles.filter((t) => t.dirty)
    }

    resetFromBlocks(blocks: BaseBlock[]) {
        for (const tile of this.#tiles) tile.blocks.clear()
        this.#blockTiles.clear()
        for (const block of blocks) this.addBlock(block)
    }

    clearBlocks() {
        for (const tile of this.#tiles) tile.blocks.clear()
        this.#blockTiles.clear()
    }
}
