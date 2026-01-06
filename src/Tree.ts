import type { Block } from "./Block";
import { SnapshotObject, Timestamp } from "./types";

export class Node {
    child_nodes: Node[];
    parentNode?: Node;
    nodeId?: number;

    constructor() {
        this.child_nodes = [];
        this.nodeId = undefined;
    }

    addChild(...node: Node[]) {
        this.child_nodes.push(...node);
        this.listOnlyChilds((n: Node) => {
            n.parentNode = this;
        });
    }

    listAllChilds<T>(_func: (element: T) => void) {
        const Q: Node[] = [this];
        while (Q.length > 0) {
            let current: Node | undefined = Q.shift();
            if (current && current !== this) _func(current as T);
            if (current?.child_nodes) Q.unshift(...current.child_nodes);
        }
    }

    listOnlyChilds(
        _func: (element: Block, currIdx: number, arrLen: number) => void
    ) {
        for (let i = 0, len = this.child_nodes.length; i < len; i++) {
            _func(this.child_nodes[i] as Block, i, this.child_nodes.length);
        }
    }

    removeChild<T>(child: T) {
        const getChild = (topNode: Node, child: T) => {
            topNode.listOnlyChilds((n: Node) => {
                if (n.nodeId === (child as Node).nodeId) {
                    topNode.child_nodes = topNode.child_nodes.filter(
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
    snapshotSize: number | undefined;

    constructor(snapshotSize?: number) {
        this.head = new Node();
        this.snapshotSize = snapshotSize;
    }

    addNodes(node: Node[]) {
        this.head.addChild(...node);
    }

    preOrderTraversal<T>(head: undefined | Node, _func: (node: T) => void) {
        const Q = [head || this.head];
        let nodeId = 1;
        while (Q.length > 0) {
            let current: Node | undefined = Q.shift();
            if (
                current &&
                Object.getPrototypeOf(current).constructor.name !== "Node"
            ) {
                _func(current as T);
                if (!current.nodeId) {
                    current.nodeId = nodeId;
                    nodeId += 1;
                } else nodeId = current.nodeId;
            }
            if (current?.child_nodes) Q.unshift(...current.child_nodes);
        }
    }

    takeSanpshot(
        timestamp: Timestamp,
        before: SnapshotObject,
        after: SnapshotObject
    ) {
        for (const key of Object.keys(this.#snapshots)) {
            if (Number(key) > this.#currentSnapshot)
                delete this.#snapshots[key];
        }
        if (this.#snapshots[timestamp])
            this.#snapshots[timestamp] = {
                ...this.#snapshots[timestamp],
                ...after,
            };
        else this.#snapshots[timestamp] = after;

        this.#currentSnapshot = timestamp;
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
