export type NodeId = number | undefined;

export class Node {
    childNodes: Node[];
    parentNode?: Node;
    nodeId?: NodeId;
    #sortedBy?: string;

    constructor() {
        this.childNodes = [];
    }

    addChild(...node: Node[]) {
        for (let i = 0; i < node.length; i++) {
            if (!this.childNodes.includes(node[i])) {
                node[i].parentNode = this;
                this.childNodes.push(node[i]);
            }
        }
        this.#sortedBy = undefined;
    }

    listAllChilds<T>(_func: (element: T) => void) {
        const Q: Node[] = [this];
        while (Q.length > 0) {
            let current: Node | undefined = Q.shift();
            if (current && current !== this) _func(current as T);
            if (current?.childNodes) Q.unshift(...current.childNodes);
        }
    }

    listOnlyChilds<B>(
        _func: (element: B, currIdx: number, arrLen: number) => void,
        sort?: string,
        nodes?: Node[]
    ) {
        const sortedNodes = nodes || this.childNodes ;
        if (sort && this.#sortedBy !== sort) {
            sortedNodes.sort(
                (a: any, b: any) => a.ownOptions[sort] - b.ownOptions[sort]
            );
            this.#sortedBy = sort;
        }
        for (let i = 0, len = sortedNodes.length; i < len; i++) {
            _func(sortedNodes[i] as B, i, sortedNodes.length);
        }
    }

    removeChild(child: Node) {
        const getChild = (topNode: Node, child: Node) => {
            topNode.listOnlyChilds((n: Node) => {
                if (n.nodeId === (child as Node).nodeId) {
                    (child as Node).parentNode = undefined;
                    topNode.childNodes = topNode.childNodes.filter(
                        (n) => n.nodeId !== (child as Node).nodeId
                    );
                    return;
                }
                getChild(n, child);
            });
        };
        getChild(this, child);
    }
}