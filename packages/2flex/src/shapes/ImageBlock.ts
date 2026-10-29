import { MediaLayoutBlock, MediaLayoutBlockOptions } from './MediaLayoutBlock'

export interface ImageBlockOptions extends MediaLayoutBlockOptions {}

export class ImageBlock extends MediaLayoutBlock {
    constructor(options: ImageBlockOptions) {
        super(options)
    }
    init(): void {
        super.init()
        this.#buildImage()
    }
    #buildImage() {
        if (typeof this.source() === 'string') {
            this.mediaSource = new Image()
            this.mediaSource.src = this.source()!
        } else
            this.mediaSource = this.source()(
                this.mediaSource as HTMLImageElement
            ).addEventListener('load', () => {
                this.__invokeChange()
                this.__drawMedia()
            })
    }
}
