import { BaseBlock } from './BaseBlock'
import { DummyCanvas } from './DummyCanvas'
import { HotCornerArea } from './types'
import { worldTileKey } from './Utils'

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
    originCol: number
    originRow: number
    #tiles: Map<string, GridTile>
    #blockTiles: Map<number, Set<string>>

    constructor(
        canvasWidth: number,
        canvasHeight: number,
        tileSize: number = 256
    ) {
        this.tileSize = tileSize
        this.originCol = 0
        this.originRow = 0
        this.cols = Math.max(1, Math.ceil(canvasWidth / tileSize))
        this.rows = Math.max(1, Math.ceil(canvasHeight / tileSize))
        this.#tiles = new Map()
        this.#blockTiles = new Map()
        this.#buildTiles()
    }

    #buildTiles() {
        this.#tiles.clear()
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const worldCol = this.originCol + c
                const worldRow = this.originRow + r
                this.#tiles.set(
                    worldTileKey(worldCol, worldRow),
                    new GridTile(worldCol, worldRow, this.tileSize)
                )
            }
        }
    }

    resize(canvasWidth: number, canvasHeight: number) {
        const minEndCol = Math.max(
            0,
            Math.ceil(canvasWidth / this.tileSize) - 1
        )
        const minEndRow = Math.max(
            0,
            Math.ceil(canvasHeight / this.tileSize) - 1
        )
        const newOriginCol = Math.min(this.originCol, 0)
        const newOriginRow = Math.min(this.originRow, 0)
        const newEndCol = Math.max(this.originCol + this.cols - 1, minEndCol)
        const newEndRow = Math.max(this.originRow + this.rows - 1, minEndRow)

        if (
            newOriginCol === this.originCol &&
            newOriginRow === this.originRow &&
            newEndCol === this.originCol + this.cols - 1 &&
            newEndRow === this.originRow + this.rows - 1
        ) {
            this.markAllDirty()
            return
        }

        this.originCol = newOriginCol
        this.originRow = newOriginRow
        this.cols = newEndCol - newOriginCol + 1
        this.rows = newEndRow - newOriginRow + 1
        this.#buildTiles()
        this.#blockTiles.clear()
    }

    expand(bbox: HotCornerArea): void {
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
        this.#expandRange(
            Math.floor(minX / this.tileSize),
            Math.floor(maxX / this.tileSize),
            Math.floor(minY / this.tileSize),
            Math.floor(maxY / this.tileSize)
        )
    }

    expandByViewport(
        viewMinX: number,
        viewMinY: number,
        viewMaxX: number,
        viewMaxY: number
    ): void {
        this.#expandRange(
            Math.floor(viewMinX / this.tileSize),
            Math.floor(viewMaxX / this.tileSize),
            Math.floor(viewMinY / this.tileSize),
            Math.floor(viewMaxY / this.tileSize)
        )
    }

    #expandRange(cMin: number, cMax: number, rMin: number, rMax: number) {
        const newOriginCol = Math.min(this.originCol, cMin)
        const newOriginRow = Math.min(this.originRow, rMin)
        const newEndCol = Math.max(this.originCol + this.cols - 1, cMax)
        const newEndRow = Math.max(this.originRow + this.rows - 1, rMax)

        if (
            newOriginCol === this.originCol &&
            newOriginRow === this.originRow &&
            newEndCol === this.originCol + this.cols - 1 &&
            newEndRow === this.originRow + this.rows - 1
        ) {
            return
        }

        for (let r = newOriginRow; r <= newEndRow; r++) {
            for (let c = newOriginCol; c <= newEndCol; c++) {
                const key = worldTileKey(c, r)
                if (!this.#tiles.has(key)) {
                    this.#tiles.set(key, new GridTile(c, r, this.tileSize))
                }
            }
        }

        this.originCol = newOriginCol
        this.originRow = newOriginRow
        this.cols = newEndCol - newOriginCol + 1
        this.rows = newEndRow - newOriginRow + 1

        const allBlocks = new Set<BaseBlock>()
        for (const tile of this.#tiles.values()) {
            for (const block of tile.blocks) allBlocks.add(block)
        }
        for (const block of allBlocks) {
            const newKeys = this.tilesForBBox(block.boundingBox)
            for (const key of newKeys) {
                const tile = this.#tiles.get(key)
                if (tile && !tile.blocks.has(block)) {
                    tile.blocks.add(block)
                    tile.dirty = true
                }
            }
            if (block.nodeId !== undefined) {
                this.#blockTiles.set(block.nodeId, newKeys)
            }
        }
    }

    getTileId(x: number, y: number): string {
        return worldTileKey(
            Math.floor(x / this.tileSize),
            Math.floor(y / this.tileSize)
        )
    }

    tilesForBBox(bbox: HotCornerArea): Set<string> {
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
        const c0 = Math.floor(minX / this.tileSize)
        const c1 = Math.floor(maxX / this.tileSize)
        const r0 = Math.floor(minY / this.tileSize)
        const r1 = Math.floor(maxY / this.tileSize)

        const ids: Set<string> = new Set()
        for (let r = r0; r <= r1; r++) {
            for (let c = c0; c <= c1; c++) {
                ids.add(worldTileKey(c, r))
            }
        }
        return ids
    }

    addBlock(block: BaseBlock) {
        if (block.nodeId === undefined) return
        this.expand(block.boundingBox)
        const ids = this.tilesForBBox(block.boundingBox)
        this.#blockTiles.set(block.nodeId, ids)
        for (const key of ids) {
            const tile = this.#tiles.get(key)
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
        for (const key of ids) {
            const tile = this.#tiles.get(key)
            if (tile) {
                if (tile.blocks.delete(block)) tile.dirty = true
            }
        }
        this.#blockTiles.delete(block.nodeId)
    }

    updateBlock(block: BaseBlock) {
        if (block.nodeId === undefined) return
        this.expand(block.boundingBox)
        const newIds = this.tilesForBBox(block.boundingBox)
        const oldIds = this.#blockTiles.get(block.nodeId)
        if (oldIds) {
            for (const key of oldIds) {
                const tile = this.#tiles.get(key)
                if (tile) {
                    tile.blocks.delete(block)
                    tile.dirty = true
                }
            }
        }
        for (const key of newIds) {
            const tile = this.#tiles.get(key)
            if (tile) {
                tile.blocks.add(block)
                tile.dirty = true
            }
        }
        this.#blockTiles.set(block.nodeId, newIds)
    }

    markAllDirty() {
        for (const tile of this.#tiles.values()) tile.dirty = true
    }

    getDirtyTiles(): GridTile[] {
        return Array.from(this.#tiles.values()).filter((t) => t.dirty)
    }

    get allTiles(): GridTile[] {
        return Array.from(this.#tiles.values())
    }

    resetFromBlocks(blocks: BaseBlock[]) {
        for (const tile of this.#tiles.values()) tile.blocks.clear()
        this.#blockTiles.clear()
        for (const block of blocks) this.addBlock(block)
    }

    clearBlocks() {
        for (const tile of this.#tiles.values()) tile.blocks.clear()
        this.#blockTiles.clear()
    }
}
