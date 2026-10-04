import { DrawFunc, IShapeOptions, ShapeBlock } from '../ShapeBlock'
import type { RelativeType } from '../types'

type ObjectFit = 'contain' | 'cover' | 'fill' | 'scale-down'
type Repeat = number | 'fill'

interface ImageOptions extends IShapeOptions {
    clipX?: RelativeType
    clipY?: RelativeType
    clipWidth?: RelativeType
    clipHeight?: RelativeType
    objectFit?: ObjectFit
    repeatX?: Repeat
    repeatY?: Repeat
}

export class ImageBlock extends ShapeBlock {
    #cacheImage?: HTMLImageElement
    constructor(options: ImageOptions) {
        super(options)
        this.#defineProperties()
    }

    #defineProperties() {
        this.addProperty('source', undefined)
        this.addProperty('repeatX', undefined)
        this.addProperty('repeatY', undefined)
        this.addProperty('clipX', 0)
        this.addProperty('clipY', 0)
        this.addProperty('clipWidth', undefined)
        this.addProperty('clipHeight', undefined)
        this.addProperty('objectFit', 'scale-down')
    }

    draw(_func?: DrawFunc): void {
        if (!this.#cacheImage) {
            this.#buildImage()
        } else this.#drawImage()
    }

    #buildImage() {
        if (typeof this.source() === 'string') {
            this.#cacheImage = new Image()
            this.#cacheImage.src = this.source()!
        } else this.#cacheImage = this.source()
        this.#cacheImage?.addEventListener('load', () => {
            this.__invokeChange()
            this.#drawImage()
        })
    }

    #drawImage() {
        const cacheImage = this.#cacheImage
        const context = this.context
        if (!cacheImage || !context) return
        const fit = this.objectFit()
        const x = this.x()
        const y = this.y()
        const realWidth = this.width()
        const realHeight = this.height()

        const clipX = this.clipX()
        const clipY = this.clipY()
        const clipWidth = this.clipWidth()
        const clipHeight = this.clipHeight()
        const repeatX = this.repeatX()
        const repeatY = this.repeatY()

        const imgWidth = cacheImage.width
        const imgHeight = cacheImage.height

        let wrapW = 0
        let wrapH = 0

        let clipW = clipWidth ?? realWidth
        let clipH = clipHeight ?? realHeight
        if (!(repeatX !== undefined || repeatY !== undefined)) {
            let imgAdjustedWidth = imgWidth
            let imgAdjustedHeight = imgHeight
            let drawX = x
            let drawY = y
            let imgClipX = clipX
            let imgClipY = clipY
            if (fit === 'scale-down') {
                const blockRatio = Math.min(
                    realWidth / imgWidth,
                    realHeight / imgHeight
                )
                const ratio = Math.min(blockRatio, 1)
                const scaledW = imgWidth * ratio
                const scaledH = imgHeight * ratio
                imgAdjustedWidth = scaledW
                imgAdjustedHeight = scaledH
                clipW = imgWidth
                clipH = imgHeight
                drawX = x + (realWidth - scaledW) / 2
                drawY = y + (realHeight - scaledH) / 2
            } else if (fit === 'contain') {
                clipW = imgWidth
                clipH = imgHeight
                if (imgHeight > realHeight) {
                    const aspectH = imgHeight / realHeight
                    clipH *= aspectH
                    clipW *= aspectH
                }
                if (imgWidth > realWidth) {
                    const aspectW = imgWidth / realWidth
                    clipW *= aspectW
                    clipH *= aspectW
                }
            } else if (fit === 'cover') {
                const ratio = Math.max(
                    realWidth / imgWidth,
                    realHeight / imgHeight
                )
                imgAdjustedWidth = realWidth
                imgAdjustedHeight = realHeight
                const visibleSrcW = realWidth / ratio
                const visibleSrcH = realHeight / ratio
                clipW = visibleSrcW
                clipH = visibleSrcH
                imgClipX = (imgWidth - visibleSrcW) / 2
                imgClipY = (imgHeight - visibleSrcH) / 2
            } else if (fit === 'fill') {
                imgAdjustedWidth = realWidth
                imgAdjustedHeight = realHeight
                clipW = imgWidth
                clipH = imgHeight
            }

            context.drawImage(
                cacheImage,
                imgClipX,
                imgClipY,
                clipW,
                clipH,
                drawX,
                drawY,
                imgAdjustedWidth,
                imgAdjustedHeight
            )
        } else {
            if (imgWidth <= 0 || imgHeight <= 0) return
            let wPerImage = realWidth
            let hPerImage = realHeight
            let xPerImage = x
            let yPerImage = y
            if (repeatX !== undefined) {
                if (repeatX === 'fill')
                    wPerImage = imgWidth > realWidth ? realWidth : imgWidth
                else wPerImage = realWidth / repeatX
            }

            if (repeatY !== undefined) {
                if (repeatY === 'fill')
                    hPerImage = imgHeight > realHeight ? realHeight : imgHeight
                else hPerImage = realHeight / repeatY!
            }

            while (realHeight > Math.ceil(wrapH)) {
                while (realWidth > Math.ceil(wrapW)) {
                    if (
                        xPerImage + wPerImage <= x + realWidth &&
                        yPerImage + hPerImage <= y + realHeight
                    ) {
                        context.drawImage(
                            cacheImage,
                            clipX,
                            clipY,
                            imgWidth - clipX,
                            imgHeight - clipY,
                            xPerImage,
                            yPerImage,
                            wPerImage,
                            hPerImage
                        )
                    }
                    wrapW += wPerImage
                    xPerImage += wPerImage
                }
                wrapH += hPerImage
                yPerImage += hPerImage
                wrapW = 0
                xPerImage = x
            }
        }
    }
    get #isRepeat() {
        return this.repeatX() !== undefined || this.repeatY() !== undefined
    }
}
