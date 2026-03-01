import type { IBlock } from "../types";
import { Shape } from "../Shape";

interface VideoOptions {}

export class VideoBlock extends Shape<VideoOptions> {
    source: HTMLVideoElement;
    #cacheVideo?: HTMLVideoElement;
    #events = {
        isPlaying: false,
        isPaused: false,
    };
    constructor(source: HTMLVideoElement, options: IBlock<VideoOptions>) {
        super(options);
        this.source = source;
    }

    draw(_func?: (context: CanvasRenderingContext2D) => void): void {
        if (!this.#cacheVideo) {
            this.#cacheVideo = this.source;
            this.#drawVideo();
        }
    }

    #drawVideo() {
        const videoPlayAnimator = (timestamp: number) => {
            if (!this.#cacheVideo) return;
            if (this.isPlaying) this.onPlay()(timestamp);
            this.context?.drawImage(
                this.#cacheVideo,
                0,
                0,
                400,
                400,
                0,
                0,
                400,
                400
            );
            this.render();
        };

        this.__animationOn.push(videoPlayAnimator);
    }
    pause() {
        this.#cacheVideo?.pause();
        this.#events.isPlaying = false;
        this.#events.isPaused = true;
    }
    play() {
        this.#cacheVideo?.play();
        this.#events.isPlaying = true;
        this.#events.isPaused = false;
    }
    get isPlaying() {
        return this.#events.isPlaying;
    }
    get isPaused() {
        return this.#events.isPaused;
    }
    onPlay(func?: (timestamp: number) => undefined) {
        const onPlay = this.__valueHandler<
            (timestamp: number) => void,
            ((timestamp: number) => void) | undefined
        >(func, "onPlay", undefined);
        return (timestamp: number) => {
            if (onPlay) onPlay?.(timestamp);
        };
    }
}
