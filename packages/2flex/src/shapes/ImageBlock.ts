import { IShapeOptions } from '../ShapeBlock'
import { MediaLayoutBlock } from './MediaLayoutBlock'

interface ImageOptions extends IShapeOptions {}

export class ImageBlock extends MediaLayoutBlock {
    constructor(options: ImageOptions) {
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
