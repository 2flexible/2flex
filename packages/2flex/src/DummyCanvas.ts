export class DummyCanvas {
    width: number
    height: number
    #context?: OffscreenCanvasRenderingContext2D | null
    #offscreenCanvas?: OffscreenCanvas

    constructor(width: number, height: number) {
        this.#context = null
        // an offscreen canvas needs at least a pixel in every dimension
        this.width = DummyCanvas.#dimension(width)
        this.height = DummyCanvas.#dimension(height)
        this.#offscreenCanvas = new OffscreenCanvas(this.width, this.height)
    }
    static #dimension(size: number): number {
        if (!Number.isFinite(size)) return 1
        const rounded = Math.floor(size)
        return rounded > 0 ? rounded : 1
    }
    resize(width: number, height: number) {
        const nextWidth = DummyCanvas.#dimension(width)
        const nextHeight = DummyCanvas.#dimension(height)
        if (nextWidth === this.width && nextHeight === this.height) return
        this.width = nextWidth
        this.height = nextHeight
        this.#context = null
        this.#offscreenCanvas = new OffscreenCanvas(nextWidth, nextHeight)
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
