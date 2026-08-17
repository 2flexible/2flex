import { SnapshotObject, Timestamp } from './types'
import { Node } from './Node'

export interface Snapshots {
    [key: number]: SnapshotObject
}

export class CanvasTree {
    head: Node
    #currentSnapshot
    #snapshots: Snapshots
    snapshotSize: number
    #latestNodeId
    nodes: Node[]

    constructor(snapshotSize?: number) {
        this.head = new Node()
        this.snapshotSize = snapshotSize || 0
        this.#currentSnapshot = 0
        this.#snapshots = {}
        this.#latestNodeId = 1
        this.nodes = []
    }

    addNodes(node: Node[]) {
        this.head.addChild(...node)
    }

    preOrderTraversal<T>(_func?: (node: T) => void) {
        this.cleanNodes()
        this.head.listAllChilds((current: Node) => {
            if (current === this.head) return
            this.assignNodeId(current)
            if (_func) _func(current as T)
            this.nodes.push(current)
        })
    }

    cleanNodes() {
        this.nodes = []
    }

    assignNodeId(node: Node) {
        if (node.nodeId === undefined) {
            node.nodeId = this.#latestNodeId
            this.#latestNodeId += 1
        }
    }

    takeSanpshot(
        timestamp: Timestamp,
        before: SnapshotObject | null,
        after: SnapshotObject
    ) {
        for (const key of Object.keys(this.#snapshots)) {
            if (Number(key) > this.#currentSnapshot)
                delete this.#snapshots[Number(key)]
        }
        for (const key of Object.keys(this.#snapshots)) {
            if (this.snapshotSize < Object.entries(this.#snapshots).length) {
                delete this.#snapshots[Number(key)]
            } else break
        }
        if (this.#snapshots[timestamp])
            this.#snapshots[timestamp] = {
                ...this.#snapshots[timestamp],
                ...after,
            }
        else this.#snapshots[timestamp] = after

        this.#currentSnapshot = timestamp
        if (before)
            for (const key of Object.keys(this.#snapshots).reverse()) {
                if (Number(key) < this.#currentSnapshot) {
                    for (let [kk, value] of Object.entries(before)) {
                        this.#snapshots[Number(key)][kk] = {
                            ...this.#snapshots[Number(key)][kk],
                            ...value,
                        }
                    }
                    break
                }
            }
    }

    snapshotInBack() {
        for (const key of Object.keys(this.#snapshots).reverse()) {
            if (Number(key) < this.#currentSnapshot) {
                this.#currentSnapshot = Number(key)
                break
            }
        }
        console.log(this.#currentSnapshot, this.#snapshots)
        return this.#snapshots[this.#currentSnapshot]
    }

    snapshotInFuture() {
        for (const key of Object.keys(this.#snapshots)) {
            if (Number(key) > this.#currentSnapshot) {
                this.#currentSnapshot = Number(key)
                break
            }
        }
        return this.#snapshots[this.#currentSnapshot]
    }
}
