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
    #blocks: BaseBlock[]
    #nodeIdIndex: Map<number, BaseBlock>

    constructor(snapshotSize?: number) {
        this.head = new Node()
        this.snapshotSize = snapshotSize || 0
        this.#latestNodeId = 1
        this.#blocks = []
        this.#nodeIdIndex = new Map()
    }

    addBlock(block: BaseBlock) {
        this.head.addChild(block)
    }
    removeBlock(block: BaseBlock) {
        this.head.removeChild(block)
    }
    find(queries: IBlockOptions): BaseBlock[] {
        const keys = Object.keys(queries)
        if (keys.length === 1 && keys[0] === 'nodeId') {
            const block = this.#nodeIdIndex.get(queries.nodeId as number)
            return block ? [block] : []
        }
        const blocks: BaseBlock[] = []
        this.preOrderTraversal((block: BaseBlock) => {
            for (const k of keys) {
                if (block.getOptionCurrent(k) !== queries[k]) return
            }
            blocks.push(block)
        })
        return blocks
    }
    getSortedBlocksByZIndex() {
        return this.#blocks
    }
    sortBlocksByZIndex() {
        this.#blocks = this.#blocks.sort(
            (a: any, b: any) =>
                a.options.get('zIndex') - b.options.get('zIndex')
        )
    }
    getByNodeId(nodeId: number) {
        return this.#nodeIdIndex.get(nodeId)
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
        this.#nodeIdIndex = new Map()
        this.preOrderTraversal((block: BaseBlock) => {
            this.#assignNodeId(block)
            this.#blocks.push(block)
            if (block.nodeId !== undefined) {
                this.#nodeIdIndex.set(block.nodeId, block)
            }
        })
    }
    #assignNodeId(node: Node) {
        if (node.nodeId === undefined) {
            node.nodeId = this.#latestNodeId
            this.#latestNodeId += 1
        }
    }
}
