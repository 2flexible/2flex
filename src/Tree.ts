import { SnapshotObject, Timestamp } from "./types";

export type NodeId = number | undefined;

export class Node {
    childNodes: Node[];
    parentNode?: Node;
    nodeId?: NodeId;
    __sortedNodes: Node[] = [];
    __sortedBy?: string;

    constructor() {
        this.childNodes = [];
        this.nodeId = undefined;
    }

    addChild(...node: Node[]) {
        for (let i = 0; i < node.length; i++) {
            if (!this.childNodes.includes(node[i])) {
                node[i].parentNode = this;
                this.childNodes.push(node[i]);
            }
        }
        this.__sortedNodes = this.childNodes;
    }

    listAllChilds<T>(_func: (element: T) => void) {
        const Q: Node[] = [this];
        this.__sortedNodes = [];
        while (Q.length > 0) {
            let current: Node | undefined = Q.shift();
            if (current && current !== this) {
                _func(current as T);
                this.__sortedNodes.push(current);
            }
            if (current?.childNodes) Q.unshift(...current.childNodes);
        }
        this.__sortedBy = undefined;
    }

    listOnlyChilds<B>(
        _func: (element: B, currIdx: number, arrLen: number) => void
    ) {
        for (let i = 0, len = this.childNodes.length; i < len; i++) {
            _func(this.childNodes[i] as B, i, this.childNodes.length);
        }
    }

    listSortedChilds<T>(_func: (element: T) => void, sort?: string) {
        const sortedNodes = this.__sortedNodes;
        if (sort && this.__sortedBy !== sort) {
            sortedNodes.sort(
                (a: any, b: any) => a.ownOptions[sort] - b.ownOptions[sort]
            );
            this.__sortedNodes = sortedNodes;
            this.__sortedBy = sort;
        }
        for (let i = 0, len = sortedNodes.length; i < len; i++) {
            _func(sortedNodes[i] as T);
        }
    }

    removeChild<T>(child: T) {
        const getChild = (topNode: Node, child: T) => {
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
export type Snapshots = { timestamp: SnapshotObject };

export class Tree {
    head: Node;
    #currentSnapshot = 0;
    #snapshots: Snapshots | any = {};
    snapshotSize: number = 0;
    #latestNodeId = 1;

    constructor(snapshotSize?: number) {
        this.head = new Node();
        this.snapshotSize = snapshotSize || this.snapshotSize;
    }

    addNodes(node: Node[]) {
        this.head.addChild(...node);
    }

    preOrderTraversal<T>(_func?: (node: T) => void) {
        this.head.listAllChilds((current: Node) => {
            this.assignNodeId(current);
            if (_func) _func(current as T);
        });
    }

    assignNodeId(node: Node) {
        if (node.nodeId === undefined) {
            node.nodeId = this.#latestNodeId;
            this.#latestNodeId += 1;
        }
    }

    takeSanpshot(
        timestamp: Timestamp,
        before: SnapshotObject | null,
        after: SnapshotObject
    ) {
        for (const key of Object.keys(this.#snapshots)) {
            if (Number(key) > this.#currentSnapshot)
                delete this.#snapshots[key];
        }
        for (const key of Object.keys(this.#snapshots)) {
            if (this.snapshotSize < Object.entries(this.#snapshots).length) {
                delete this.#snapshots[key];
            } else break;
        }
        if (this.#snapshots[timestamp])
            this.#snapshots[timestamp] = {
                ...this.#snapshots[timestamp],
                ...after,
            };
        else this.#snapshots[timestamp] = after;

        this.#currentSnapshot = timestamp;
        if (before)
            for (const key of Object.keys(this.#snapshots).reverse()) {
                if (Number(key) < this.#currentSnapshot) {
                    for (let [kk, value] of Object.entries(before)) {
                        this.#snapshots[Number(key)][kk] = {
                            ...this.#snapshots[Number(key)][kk],
                            ...value,
                        };
                    }
                    break;
                }
            }
    }

    snapshotInBack() {
        for (const key of Object.keys(this.#snapshots).reverse()) {
            if (Number(key) < this.#currentSnapshot) {
                this.#currentSnapshot = Number(key);
                break;
            }
        }
        return this.#snapshots[this.#currentSnapshot];
    }

    snapshotInFuture() {
        for (const key of Object.keys(this.#snapshots)) {
            if (Number(key) > this.#currentSnapshot) {
                this.#currentSnapshot = Number(key);
                break;
            }
        }
        return this.#snapshots[this.#currentSnapshot];
    }
}
