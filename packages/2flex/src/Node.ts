import { NodeId } from './types'

export class Node {
    childNodes: Set<Node>
    parentNode?: Node
    nodeId?: NodeId

    constructor() {
        this.childNodes = new Set()
    }

    addChild(node: this) {
        if (!this.childNodes.has(node)) {
            node.parentNode = this
            this.childNodes.add(node)
        }
    }
    removeChild(child: this) {
        const remove = (node: Node): boolean => {
            if (node.childNodes.has(child)) {
                node.childNodes.delete(child)
                return true
            }
            for (const child of node.childNodes) {
                if (remove(child)) return true
            }
            return false
        }
        remove(this)
    }
}
