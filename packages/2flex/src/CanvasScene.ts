import { BaseBlock } from './BaseBlock'
import { IBlockOptions } from './Block'
import { Node } from './Node'
import {
    postOrderTraversal,
    preOrderTraversal,
    reversePostOrderTraversal,
} from './Utils'

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
        this.preOrderTraversal((block: BaseBlock) => {
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
        const func = (block: BaseBlock) => {
            if (block === this.head) return
            if (_func) _func(block)
        }
        preOrderTraversal(this.head as BaseBlock, func)
    }
    postOrderTraversal(_func?: (block: BaseBlock) => void) {
        const func = (block: BaseBlock) => {
            if (block === this.head) return
            if (_func) _func(block)
        }
        postOrderTraversal(this.head as BaseBlock, func)
    }
    reversePostOrderTraversal(_func?: (block: BaseBlock) => void) {
        const func = (block: BaseBlock) => {
            if (block === this.head) return
            if (_func) _func(block)
        }
        reversePostOrderTraversal(this.head as BaseBlock, func)
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
