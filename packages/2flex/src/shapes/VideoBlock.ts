import { type MediaLayoutBlockOptions } from './MediaLayoutBlock'
import { MediaLayoutBlock } from './MediaLayoutBlock'
import { type OwnOptionAccessors } from '../BaseBlock'
type OnPlayCallback = (timestamp: number) => void
export interface VideoBlockOptions extends MediaLayoutBlockOptions {
    autoPlay?: boolean
    onPlay?: OnPlayCallback
}

interface VideoBlockAccessors extends OwnOptionAccessors<
    VideoBlockOptions,
    MediaLayoutBlockOptions
> {}

export class VideoBlock<
    T extends VideoBlockOptions = VideoBlockOptions,
> extends MediaLayoutBlock<T> {
    #events = {
        isPlaying: false,
        isPaused: false,
    }
    constructor(options: VideoBlockOptions) {
        super(options as T)
        this.#defineProperties()
    }

    set(options: T): void {
        super.set(options)
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
        // a video block draws a video element, a url is not resolved here
        this.mediaSource = this.source() as CanvasImageSource | undefined
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
        ;(this.mediaSource as HTMLVideoElement).pause()
        this.#events.isPlaying = false
        this.#events.isPaused = true
    }
    play() {
        ;(this.mediaSource as HTMLVideoElement).play()
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

export interface VideoBlock extends VideoBlockAccessors {}
