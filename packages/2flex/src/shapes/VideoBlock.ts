import { DrawFunc, IShapeOptions, ShapeBlock } from '../ShapeBlock'
type OnPlayCallback = (timestamp: number) => void
interface VideoOptions extends IShapeOptions {
    autoPlay?: boolean
    onPlay?: OnPlayCallback
}

export class VideoBlock extends ShapeBlock {
    #cacheVideo?: HTMLVideoElement
    #events = {
        isPlaying: false,
        isPaused: false,
    }
    constructor(options: VideoOptions) {
        super(options)
        this.#defineProperties()
    }

    #defineProperties() {
        this.addProperty('source', undefined)
        this.addProperty('autoPlay', false)
        this.addProperty('onPlay', undefined)
    }
    init(): void {
        super.init()
        this.#buildVideo()
    }
    draw(_func?: DrawFunc): void {
        this.#drawVideo()
    }
    #buildVideo() {
        this.#cacheVideo = this.source()
        if (this.#cacheVideo) {
            ;(this.#cacheVideo as HTMLVideoElement).muted = true
            if (this.autoPlay()) this.play()
            const animationId = String(new Date().getTime())
            const videoPlayAnimator = (timestamp: number) => {
                if (!this.#cacheVideo) return
                if (this.isPlaying) this.onPlay()?.(timestamp)
                this.__invokeChange()
            }
            this.__addAnimation(animationId, videoPlayAnimator)
        }
    }
    #drawVideo() {
        const context = this.context
        const cacheVideo = this.#cacheVideo
        if (!context || !cacheVideo) return
        const x = this.x()
        const y = this.y()
        const width = this.width()
        const height = this.height()
        context.drawImage(cacheVideo, 0, 0, width, height, x, y, width, height)
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
}
