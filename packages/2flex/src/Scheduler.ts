import { Timestamp } from './types'

type SchedulerFunc = (timestamp: Timestamp) => void

export class RenderScheduler {
    #requestId?: number
    scheduleFunc?: SchedulerFunc
    fps?: number
    constructor(fps?: number, scheduleFunc?: SchedulerFunc) {
        this.fps = fps
        this.scheduleFunc = scheduleFunc
    }
    start() {
        if (this.#requestId === undefined) this.#scheduler()
    }
    stop() {
        if (this.#requestId !== undefined) cancelAnimationFrame(this.#requestId)
        this.#requestId = undefined
    }
    #frameDuration(fps?: number) {
        if (fps === undefined) return 0
        return 1000 / fps
    }
    #scheduler() {
        let lastFrame = 0
        const framer = (timestamp: Timestamp) => {
            this.#requestId = requestAnimationFrame(framer)
            if (lastFrame === 0) lastFrame = timestamp
            // getting true frame per second
            const delta = timestamp - lastFrame
            const frameDuration = this.#frameDuration(this.fps)

            if (this.fps && delta < frameDuration) return

            const execTime = delta % frameDuration
            lastFrame = timestamp - execTime

            this.scheduleFunc?.(timestamp)
        }
        this.#requestId = requestAnimationFrame(framer)
    }
}
