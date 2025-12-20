import { BlockOptions } from "./types";

export class Node {
    child_nodes: Node[];
    next: undefined | Node;
    #listed_child_nodes: Node[];
    _childs: Node[] = [];
    parentNode: undefined | Node;
    nodeId: number;

    constructor(id?: number) {
        this.child_nodes = [];
        this.next = undefined;
        this.#listed_child_nodes = [];
        this.nodeId = id || 0;
    }

    addChild(node: Node[]) {
        this._childs.push(...node);
        let startId = this.nodeId;
        node.forEach((i) => {
            i.parentNode = this;
            startId += 1;
            i.nodeId = startId;
        });

        this.next = node.shift();
        this.child_nodes.push(...node);
    }

    filterNodes(queries: any) {
        if (this.#listed_child_nodes.length === 0) {
            this.#listNodes();
        }
        if (queries) {
            this.#listed_child_nodes.filter((item: any) => {
                for (const [key, query] of Object.entries(queries)) {
                    if (
                        item.options.hasOwnProperty(key) &&
                        Object.values(item.options).includes(query)
                    ) {
                        return item;
                    }
                }
            });
        } else {
            return this.#listed_child_nodes;
        }
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
export type Snapshot = { timestamp: { nodeId: BlockOptions } };

export class Tree {
    head: Node;
    #listed_nodes: Node[] = [];
    #currentSnapshot = 0;
    #snapshots: Snapshot | any = {};
    snapshotSize: number | undefined;

    constructor(snapshotSize?: number) {
        this.head = new Node(0);
        this.snapshotSize = snapshotSize;
    }

    addNodes(node: Node[]) {
        this.head.addChild(node);
    }

    preOrderTraversal(head: undefined | Node, _func: (element: any) => void) {
        const Q = [head || this.head];
        while (Q.length > 0) {
            let current: Node | undefined = Q.shift();
            if (
                current &&
                Object.getPrototypeOf(current).constructor.name !== "Node"
            ) {
                _func(current);
                if (this.head === head) this.#listed_nodes.push(current);
            }
            if (current?.child_nodes) Q.unshift(...current.child_nodes);
            if (current?.next) Q.unshift(current.next);
        }
    }

    checkNodes(_func: (element: any) => void, reverse?: boolean) {
        let nodes = this.#listed_nodes;
        if (reverse) nodes = [...this.#listed_nodes].reverse();
        nodes.forEach((item) => {
            _func(item);
        });
    }

    takeSanpshot(timestamp: number, change: any) {
        // this.#snapshots.splice(this.#currentSnapshot + 1, this.snapshotSize);
        for (const [key, value] of Object.entries(this.#snapshots)) {
            if (Number(key) > this.#currentSnapshot)
                delete this.#snapshots[key];
        }
        if (this.#snapshots[timestamp])
            this.#snapshots[timestamp] = {
                ...this.#snapshots[timestamp],
                ...change,
            };
        else this.#snapshots[timestamp] = change;
        console.log(this.#snapshots);
        this.#currentSnapshot = timestamp;
    }

    snapshotInBack() {
        for (const [key, value] of Object.entries(this.#snapshots).reverse()) {
            if (Number(key) < this.#currentSnapshot) {
                this.#currentSnapshot = Number(key);
                break;
            }
        }
        return this.#snapshots[this.#currentSnapshot];
    }

    snapshotInFuture() {
        for (const [key, value] of Object.entries(this.#snapshots)) {
            if (Number(key) > this.#currentSnapshot) {
                this.#currentSnapshot = Number(key);
                break;
            }
        }
        return this.#snapshots[this.#currentSnapshot];
    }

    filterNodes(queries: any) {
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
