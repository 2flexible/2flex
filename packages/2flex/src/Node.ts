export type NodeId = number | undefined

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

    listAllChilds<T>(_func: (node: T) => void) {
        const Q: Node[] = [this]
        while (Q.length > 0) {
            let current: Node | undefined = Q.shift()
            if (current && current !== this) _func(current as T)
            if (current?.childNodes) Q.unshift(...current.childNodes)
        }
    }

    listOnlyChilds<B>(
        _func: (node: B, currIdx: number, arrLen: number) => void
    ) {
        const childNodes = this.childNodes
        for (let i = 0, len = childNodes.length; i < len; i++) {
            _func(childNodes[i] as B, i, len)
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
