import { IShapeOptions } from '../ShapeBlock'
import { MediaLayoutBlock } from './MediaLayoutBlock'
type OnPlayCallback = (timestamp: number) => void
interface VideoOptions extends IShapeOptions {
    autoPlay?: boolean
    onPlay?: OnPlayCallback
}

export class VideoBlock extends MediaLayoutBlock {
    #events = {
        isPlaying: false,
        isPaused: false,
    }
    constructor(options: VideoOptions) {
        super(options)
        this.#defineProperties()
    }

    #defineProperties() {
        this.addProperty('autoPlay', false)
        this.addProperty('onPlay', undefined)
    }
    init(): void {
        super.init()
        this.#buildVideo()
    }
    #buildVideo() {
        this.mediaSource = this.source()
        if (this.mediaSource) {
            ;(this.mediaSource as HTMLVideoElement).muted = true
            if (this.autoPlay()) this.play()
            const animationId = String(new Date().getTime())
            const videoPlayAnimator = (timestamp: number) => {
                if (!this.mediaSource) return
                if (this.isPlaying) this.onPlay()?.(timestamp)
                this.__invokeChange()
            }
            this.__addAnimation(animationId, videoPlayAnimator)
        }
    }
    pause() {
        (this.mediaSource as HTMLVideoElement).pause()
        this.#events.isPlaying = false
        this.#events.isPaused = true
    }
    play() {
        (this.mediaSource as HTMLVideoElement).play()
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
