import type { IBlock } from '../types'
import { IShapeOptions, ShapeBlock } from '../ShapeBlock'

interface VideoOptions extends IShapeOptions {}

export class VideoBlock extends ShapeBlock<VideoOptions> {
    #cacheVideo?: HTMLVideoElement
    #events = {
        isPlaying: false,
        isPaused: false,
    }
    constructor(source: HTMLVideoElement, options: IBlock<VideoOptions>) {
        super(options)
        this.source(source)
    }

    draw(_func?: (context: CanvasRenderingContext2D) => void): void {
        if (!this.#cacheVideo) {
            this.#cacheVideo = this.source()
            if (this.#cacheVideo) this.#drawVideo()
        } else {
            this.context?.drawImage(
                this.#cacheVideo!,
                0,
                0,
                this.width(),
                this.height(),
                this.x(),
                this.y(),
                this.width(),
                this.height()
            )
        }
    }

    #drawVideo() {
        const videoPlayAnimator = (timestamp: number) => {
            if (!this.#cacheVideo) return
            if (this.isPlaying) this.onPlay()(timestamp)
        }
        this.__animationHandler(videoPlayAnimator)
    }
    source(opt?: HTMLVideoElement) {
        return this.__valueHandler(opt, 'source', undefined)
    }
    pause() {
        this.#cacheVideo?.pause()
        this.#events.isPlaying = false
        this.#events.isPaused = true
    }
    play() {
        this.#cacheVideo?.play()
        this.#events.isPlaying = true
        this.#events.isPaused = false
    }
    get isPlaying() {
        return this.#events.isPlaying
    }
    get isPaused() {
        return this.#events.isPaused
    }
    onPlay(func?: (timestamp: number) => undefined) {
        const onPlay = this.__valueHandler<
            (timestamp: number) => void,
            ((timestamp: number) => void) | undefined
        >(func, 'onPlay', undefined)
        return (timestamp: number) => {
            if (onPlay) onPlay?.(timestamp)
        }
    }
}
