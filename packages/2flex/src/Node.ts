import { NodeId } from './types'

export class Node {
    childNodes: Node[]
    parentNode?: Node
    nodeId?: NodeId

    constructor() {
        this.childNodes = []
    }

    addChild(node: Node) {
        if (!this.childNodes.includes(node)) {
            node.parentNode = this
            this.childNodes.push(node)
        }
    }
    removeChild(child: Node) {
        const getChild = (topNode: Node, child: Node) => {
            for (let i = 0, len = this.childNodes.length; i < len; i++) {
                const node = this.childNodes[i]
                if (node.nodeId === (child as Node).nodeId) {
                    ;(child as Node).parentNode = undefined
                    topNode.childNodes = topNode.childNodes.filter(
                        (n) => n.nodeId !== (child as Node).nodeId
                    )
                    return
                }
                getChild(node, child)
            }
        }
        getChild(this, child)
    }
}
