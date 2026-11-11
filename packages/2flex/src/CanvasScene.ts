import { BaseBlock } from './BaseBlock'
import { BlockOptions } from './Block'
import { HELPER_BLOCK_NAMES, HOT_LINE_BLOCK_NAME } from './const'
import { Node } from './Node'
import {
    postOrderTraversal,
    preOrderTraversal,
    reversePostOrderTraversal,
} from './Utils'

export interface StackingContext {
    owner?: BaseBlock
    participants: BaseBlock[]
}

export class CanvasScene {
    head: Node
    snapshotSize: number
    #latestNodeId
    #blocks: BaseBlock[]
    #nodeIdIndex: Map<number, BaseBlock>
    #treeOrder: Map<number, number>
    #contextOf: Map<number, StackingContext>
    #nestedContextOf: Map<number, StackingContext>
    #paintContextOf: Map<number, StackingContext>
    #paintOrder: BaseBlock[]
    #paintIndex: Map<number, number>

    constructor(snapshotSize?: number) {
        this.head = new Node()
        this.snapshotSize = snapshotSize || 0
        this.#latestNodeId = 1
        this.#blocks = []
        this.#nodeIdIndex = new Map()
        this.#treeOrder = new Map()
        this.#contextOf = new Map()
        this.#nestedContextOf = new Map()
        this.#paintContextOf = new Map()
        this.#paintOrder = []
        this.#paintIndex = new Map()
    }

    addBlock(block: BaseBlock) {
        this.head.addChild(block)
    }
    removeBlock(block: BaseBlock) {
        this.head.removeChild(block)
    }
    find(queries: BlockOptions): BaseBlock[] {
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
        return this.#paintOrder
    }
    sortBlocksByZIndex() {
        const rootContext: StackingContext = { participants: [] }
        this.#contextOf.clear()
        this.#nestedContextOf.clear()
        this.#paintContextOf.clear()
        this.#paintIndex.clear()
        this.#buildContexts(undefined, rootContext)
        this.#paintOrder = []
        this.#paintContext(rootContext)
    }
    #opensContext(block: BaseBlock) {
        return block.__opensStackingContext()
    }
    #orderedParticipants(context: StackingContext) {
        const negatives: BaseBlock[] = []
        const inFlow: BaseBlock[] = []
        const positives: BaseBlock[] = []
        for (const block of context.participants) {
            const zIndex = block.__zIndex()
            // the helper blocks belong to the layer of their owner, so they
            // never paint above a block which is above the owner
            if (zIndex === undefined || this.#isHelperBlock(block))
                inFlow.push(block)
            else if (zIndex < 0) negatives.push(block)
            else positives.push(block)
        }
        negatives.sort((a, b) => this.#compareByZIndex(a, b))
        positives.sort((a, b) => this.#compareByZIndex(a, b))
        inFlow.sort((a, b) => this.#compareByTreeOrder(a, b))
        return [...negatives, ...inFlow, ...positives]
    }
    // the blocks with the same z index keep their tree order
    #compareByZIndex(a: BaseBlock, b: BaseBlock) {
        const diff = a.__zIndex()! - b.__zIndex()!
        if (diff !== 0) return diff
        return this.#compareByTreeOrder(a, b)
    }
    #compareByTreeOrder(a: BaseBlock, b: BaseBlock) {
        if (this.#isHelperBlock(a) && this.#isHelperBlock(b)) {
            const aRank = this.#helperRank(a)
            const bRank = this.#helperRank(b)
            if (aRank !== bRank) return aRank - bRank
        }
        return this.#treeOrder.get(a.nodeId!)! - this.#treeOrder.get(b.nodeId!)!
    }
   
    #isHelperBlock(block: BaseBlock) {
        return HELPER_BLOCK_NAMES.includes(block.getOptionCurrent('name'))
    }
    #helperRank(block: BaseBlock) {
        return block.getOptionCurrent('name') === HOT_LINE_BLOCK_NAME ? 1 : 0
    }
    #buildContexts(owner: BaseBlock | undefined, context: StackingContext) {
        const children = owner
            ? [...(owner.childNodes as Set<BaseBlock>)]
            : [...(this.head.childNodes as Set<BaseBlock>)]
        for (const child of children) {
            context.participants.push(child)
            this.#contextOf.set(child.nodeId!, context)
            if (this.#opensContext(child)) {
                const childContext: StackingContext = {
                    owner: child,
                    participants: [],
                }
                this.#nestedContextOf.set(child.nodeId!, childContext)
                this.#buildContexts(child, childContext)
            } else {
                // a block without a context of its own shares the context
                // of its parent
                this.#buildContexts(child, context)
            }
        }
    }
    #paintContext(context: StackingContext, skipNegatives = false) {
        const ordered = this.#orderedParticipants(context)
        for (const block of ordered) {
            if (skipNegatives && block.__zIndex()! < 0) continue
            this.#paintBlock(block, context)
        }
    }
    #paintBlock(block: BaseBlock, context: StackingContext) {
        const nestedContext = this.#nestedContextOf.get(block.nodeId!)
        if (nestedContext) {
            // the negative children paint below the content of their parent
            for (const child of this.#orderedParticipants(nestedContext)) {
                if (child.__zIndex()! >= 0) continue
                this.#paintBlock(child, context)
            }
            this.#pushPaint(block, context)
            this.#paintContext(nestedContext, true)
            return
        }
        this.#pushPaint(block, context)
    }
    #pushPaint(block: BaseBlock, context: StackingContext) {
        this.#paintIndex.set(block.nodeId!, this.#paintOrder.length)
        this.#paintOrder.push(block)
        this.#paintContextOf.set(block.nodeId!, context)
    }
    getPaintIndex(nodeId: number) {
        return this.#paintIndex.get(nodeId) ?? -1
    }
    getContextOf(nodeId: number) {
        return this.#contextOf.get(nodeId)
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
        this.#treeOrder.clear()
        let treeOrder = 0
        this.preOrderTraversal((block: BaseBlock) => {
            this.#assignNodeId(block)
            this.#blocks.push(block)
            this.#treeOrder.set(block.nodeId!, treeOrder++)
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
