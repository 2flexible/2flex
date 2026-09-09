import { SnapshotData } from './types'

class Snapshot {
    prev?: Snapshot
    next?: Snapshot
    data?: SnapshotData
    constructor(data?: SnapshotData) {
        this.data = data
    }
}

type WalkFunc = (snapshot: Snapshot) => void

export class History {
    #head?: Snapshot
    #tail?: Snapshot
    #currentSize: number
    historySize: number

    constructor(historySize: number) {
        this.historySize = historySize
        this.#currentSize = 0
    }
    #updateCurrentSize() {
        let size = 0
        this.walk(() => (size += 1))
        this.#currentSize = size
    }
    updateTail(data: SnapshotData) {
        if (this.#tail) this.#tail.data = data
    }
    tailData() {
        return this.#tail?.data || this.#head?.data
    }
    add(object: SnapshotData) {
        if (this.#currentSize > this.historySize) return
        const current = new Snapshot(object)
        current.prev = this.#tail
        if (!this.#head) {
            this.#head = this.#tail = current
        }
        this.#tail!.next = current
        this.#tail = current
        this.#updateCurrentSize()
    }
    remove(object: SnapshotData) {
        let head = this.#head
        if (!head) return

        if (head.data === object) {
            this.#head = this.#head?.next
            return
        }

        while (head.next && head.data !== object) {
            head = head.next
        }
        const next_snapshot = head.next
        const previus_snapshot = head.prev
        if (next_snapshot) next_snapshot.prev = previus_snapshot
        if (previus_snapshot) previus_snapshot.next = next_snapshot
        this.#updateCurrentSize()
    }

    toBack() {
        if (this.#tail && this.#tail.prev) this.#tail = this.#tail.prev
        return this.#tail
    }
    toFuture() {
        if (this.#tail && this.#tail.next) this.#tail = this.#tail.next
        return this.#tail
    }
    walk(_func: WalkFunc) {
        let snapshot: undefined | Snapshot = this.#head
        while (snapshot) {
            _func(snapshot)
            snapshot = snapshot.next
        }
    }
}
