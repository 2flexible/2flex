interface NodeProps {
    child_nodes: Node[];
    next: Node | undefined;
    addChild(node: Node[]): void;
}

export class Node implements NodeProps {
    child_nodes: Node[];
    next: undefined | Node;
    // listed_child_nodes: Node[];
    constructor() {
        this.child_nodes = [];
        this.next = undefined;
        // this.listed_child_nodes = [];
    }

    addChild(node: Node[]) {
        this.child_nodes.push(...node);
        this.next = node.shift();
    }

    filterNodes(queries: any) {
        // const listed_nodes = this.listNodes();

        const Q = [];
        const S = [];
        Q.push(this);
        // need a fix
        while (Q.length > 0) {
            let current: any = Q.shift();
            if (current) {
                for (const [key, query] of Object.entries(queries)) {
                    if (
                        current.options.hasOwnProperty(key) &&
                        Object.values(current.options).includes(query)
                    ) {
                        S.push(current);
                        Q.pop();
                    }
                }
            }

            if (current?.child_nodes) {
                Q.unshift(...current.child_nodes);
            }

            if (current?.next) {
                Q.unshift(current.next);
            }
        }
        return S;
    }
    // listNodes() {
    //     const Q = [];
    //     Q.push(this);

    //     while (Q.length > 0) {
    //         let current: Node | undefined = Q.shift();

    //         if (current) {
    //             this.listed_child_nodes.push(current);
    //         }

    //         if (current?.child_nodes) {
    //             Q.unshift(...current.child_nodes);
    //         }

    //         if (current?.next) {
    //             Q.unshift(current.next);
    //         }
    //     }
    // }
}

export class Tree {
    #nodes: Node[];
    #head: Node;
    #listed_nodes: Node[] = [];

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

        while (Q.length > 0) {
            let current: Node | undefined = Q.shift();
            if (Object.getPrototypeOf(current).constructor.name !== "Node") {
                _func(current);
                if (current) {
                    this.#listed_nodes.push(current);
                }
            }

            if (current?.child_nodes) {
                Q.unshift(...current.child_nodes);
            }

            if (current?.next) {
                Q.unshift(current.next);
            }
        }
    }

    filter_nodes(queries: any) {
        return this.#listed_nodes.filter((item: any) => {
            for (const [key, query] of Object.entries(queries)) {
                if (
                    item.options.hasOwnProperty(key) &&
                    Object.values(item.options).includes(query)
                )
                    return item;
            }
        });
    }
}
