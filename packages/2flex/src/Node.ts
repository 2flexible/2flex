export type NodeId = number | undefined

export class Node {
    childNodes: Node[]
    parentNode?: Node
    nodeId?: NodeId
    childsCount: number

    constructor() {
        this.childNodes = []
        this.childsCount = 0
    }

    addChild(...node: Node[]) {
        const childsNodes = this.childNodes
        for (let i = 0; i < node.length; i++) {
            if (!childsNodes.includes(node[i])) {
                node[i].parentNode = this
                childsNodes.push(node[i])
            }
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
            topNode.listOnlyChilds((n: Node) => {
                if (n.nodeId === (child as Node).nodeId) {
                    ;(child as Node).parentNode = undefined
                    topNode.childNodes = topNode.childNodes.filter(
                        (n) => n.nodeId !== (child as Node).nodeId
                    )
                    return
                }
                getChild(n, child)
            })
        }
        getChild(this, child)
    }
}
