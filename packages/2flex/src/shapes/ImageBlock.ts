import { MediaLayoutBlock, MediaLayoutBlockOptions } from './MediaLayoutBlock'

export interface ImageBlockOptions extends MediaLayoutBlockOptions {}

type ImageSourceFactory = (mediaSource?: HTMLImageElement) => HTMLImageElement
type ImageBlockSource = string | ImageSourceFactory | CanvasImageSource

export class ImageBlock extends MediaLayoutBlock {
    #watchedImage?: HTMLImageElement
    #onImageSettled?: () => void

    constructor(options: ImageBlockOptions) {
        super(options)
    }
    init(): void {
        super.init()
        this.#buildImage()
    }
    #buildImage() {
        const source = this.source() as ImageBlockSource | undefined
        if (source === undefined || source === null) return

        this.mediaSource = this.#resolveSource(source)

        const mediaSource = this.mediaSource
        if (mediaSource instanceof HTMLImageElement) {
            this.#watchImage(mediaSource)
            return
        }

        // the first paint happened before the source was known
        this.__invokeChange()
    }
    #resolveSource(source: ImageBlockSource): CanvasImageSource {
        if (typeof source === 'string') {
            const image = new Image()
            image.src = source
            return image
        }
        if (typeof source === 'function')
            return source(this.mediaSource as HTMLImageElement)
        return source
    }
    // an image is drawn asynchronously, so the block has to redraw itself once the image is ready
    #watchImage(image: HTMLImageElement) {
        this.#unwatchImage()
        const onSettled = () => {
            this.__invokeChange()
        }
        this.#watchedImage = image
        this.#onImageSettled = onSettled
        image.addEventListener('load', onSettled)
        image.addEventListener('error', onSettled)
        // an already loaded image never fires the load event again
        if (image.complete && image.naturalWidth > 0) onSettled()
    }
    #unwatchImage() {
        if (this.#watchedImage && this.#onImageSettled) {
            this.#watchedImage.removeEventListener('load', this.#onImageSettled)
            this.#watchedImage.removeEventListener(
                'error',
                this.#onImageSettled
            )
        }
        this.#watchedImage = undefined
        this.#onImageSettled = undefined
    }
}
