type BlobCallFunc = (blob: Blob) => void

export class DummyCanvas {
    width: number
    height: number
    #context?: OffscreenCanvasRenderingContext2D | null
    #offscreenCanvas?: OffscreenCanvas

    constructor(width: number, height: number) {
        this.#context = null
        this.width = width
        this.height = height
        this.#offscreenCanvas = new OffscreenCanvas(width, height)
    }
    get context() {
        if (!this.#context)
            this.#context = this.#offscreenCanvas?.getContext('2d')
        return this.#context
    }
    get canvas() {
        return this.#offscreenCanvas
    }
    restore() {
        this.context?.restore()
    }
    save() {
        this.context?.save()
    }
    clearRect() {
        this.context?.clearRect(0, 0, this.width, this.height)
    }
    transferToImageBitmap() {
        return this.canvas?.transferToImageBitmap()
    }
}
