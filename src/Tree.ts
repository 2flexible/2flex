export class Node {
    child_nodes: Node[];
    next: undefined | Node;
    #listed_child_nodes: Node[];

    constructor() {
        this.child_nodes = [];
        this.next = undefined;
        this.#listed_child_nodes = [];
    }

    addChild(node: Node[]) {
        this.next = node.shift();
        this.child_nodes.push(...node);
    }

    filterNodes(queries: any) {
        if (this.#listed_child_nodes.length === 0) {
            this.#listNodes();
        }
        return this.#listed_child_nodes.filter((item: any) => {
            for (const [key, query] of Object.entries(queries)) {
                if (
                    item.options.hasOwnProperty(key) &&
                    Object.values(item.options).includes(query)
                ) {
                    return item;
                }
            }
        });
    }

    #listNodes() {
        const Q = [];
        Q.push(this);

        while (Q.length > 0) {
            let current: Node | undefined = Q.shift();

            if (current) {
                this.#listed_child_nodes.push(current);
            }

            if (current?.child_nodes) {
                Q.unshift(...current.child_nodes);
            }

            if (current?.next) {
                Q.unshift(current.next);
            }
        }
        this.#listed_child_nodes.shift();
    }
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

    // need a change
    pre_order_traversal(_func: (element: any) => void) {
        const Q = [];
        Q.push(this.#head);
        while (Q.length > 0) {
            let current: Node | undefined = Q.shift();
            if (Object.getPrototypeOf(current).constructor.name !== "Node") {
                if (current) {
                    _func(current);
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
        console.log(this.#listed_nodes);
    }

    checkNodes(_func: (element: any) => void) {
        this.#listed_nodes.forEach((item) => {
            _func(item);
        });
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
