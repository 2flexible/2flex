interface NodeProps {
    child_nodes: Node[];
    next: Node | undefined;
    addChild(node: Node[]): void;
}

export class Node implements NodeProps {
    child_nodes: Node[];
    next: undefined | Node;
    constructor() {
        this.child_nodes = [];
        this.next = undefined;
    }

    addChild(node: Node[]) {
        this.next = node.shift();
        this.child_nodes.push(...node);
    }
}

export class Tree {
    #nodes: Node[];
    #head: Node;

    constructor() {
        this.#nodes = [];
        this.#head = new Node();
    }

    addNodes(node: Node[]) {
        if (this.#head.next === undefined) {
            this.#head.addChild(node);
        }
        this.#nodes.push(...node);
    }

    pre_order_traversal(_func: (element: any) => void) {
        const Q = [];
        Q.push(this.#head);
        // const S = [];

        while (Q.length > 0) {
            let current: Node | undefined = Q.shift();
            _func(current);
            // S.push(current);

            if (current?.child_nodes) {
                Q.unshift(...current.child_nodes);
            }

            if (current?.next) {
                Q.unshift(current.next);
            }
        }
        // return S;
    }
}
