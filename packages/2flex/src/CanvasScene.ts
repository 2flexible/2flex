import { BaseBlock } from './BaseBlock'
import { IBlockOptions } from './Block'
import { Node } from './Node'

export class CanvasScene {
    head: Node
    snapshotSize: number
    #latestNodeId
    #cacheLatesNodeId?: number
    #blocks: BaseBlock[]

    constructor(snapshotSize?: number) {
        this.head = new Node()
        this.snapshotSize = snapshotSize || 0
        this.#latestNodeId = 1
        this.#blocks = []
    }

    addBlock(block: BaseBlock) {
        this.head.addChild(block)
    }
    removeBlock(block: BaseBlock) {
        this.head.removeChild(block)
    }
    find(queries: IBlockOptions): BaseBlock[] {
        let blocks: BaseBlock[] = []
        this.head.listAllChilds((block: BaseBlock) => {
            for (const [k, v] of Object.entries(queries)) {
                if (
                    block.getOptionCurrent(k)?.currentValue === v ||
                    (k === 'nodeId' && block.nodeId === v)
                )
                    blocks.push(block)
            }
        })
        return blocks
    }
    getSortedNodesByZIndex() {
        if (this.#cacheLatesNodeId !== this.#latestNodeId) {
            this.sortNodesByZIndex()
        }
        this.#cacheLatesNodeId = this.#latestNodeId
        return this.#blocks
    }
    sortNodesByZIndex() {
        this.#blocks = this.#blocks.sort(
            (a: any, b: any) =>
                a.options.get('zIndex') - b.options.get('zIndex')
        )
    }
    getByNodeId(nodeId: number) {
        for (const block of this.#blocks) {
            if (block.nodeId && block.nodeId == nodeId) {
                return block
            }
        }
    }
    preOrderTraversal(_func?: (block: BaseBlock) => void) {
        this.head.listAllChilds((current: BaseBlock) => {
            if (current === this.head) return
            if (_func) _func(current)
        })
    }
    buildSceneGraph() {
        this.#blocks = []
        this.preOrderTraversal((block: BaseBlock) => {
            this.#assignNodeId(block)
            this.#blocks.push(block)
        })
    }
    #assignNodeId(node: Node) {
        if (node.nodeId === undefined) {
            node.nodeId = this.#latestNodeId
            this.#latestNodeId += 1
        }
    }
}
