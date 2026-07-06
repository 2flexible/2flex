import type { ICssProperties, CustomEvent } from './types'

interface ContextParamas {
    alpha?: boolean
    colorSpace?: 'srgb' | 'display-p3'
    colorType?: 'unorm8' | 'float16'
    desynchronized?: boolean
    willReadFrequently?: boolean
}

interface DomEvent {
    [key: string]: CustomEvent[]
}

export class CanvasDOMManager {
    canvasId: string
    width: number
    height: number
    #domCanvas?: HTMLCanvasElement
    #domEvents: DomEvent = {}
    contextParams: ContextParamas = {
        alpha: true,
        colorSpace: 'srgb',
        colorType: 'unorm8',
        desynchronized: false,
        willReadFrequently: false,
    }

    constructor(canvasId: string, width: number, height: number) {
        this.canvasId = canvasId
        this.width = width
        this.height = height
    }

    get canvas(): HTMLCanvasElement {
        if (!this.#domCanvas) {
            let canvas = document.getElementById(
                this.canvasId
            ) as HTMLCanvasElement

            if (!canvas) {
                canvas = this.createCanvas()
            } else {
                canvas.tabIndex = 0
                canvas.width = this.width * this.pixelRatio
                canvas.height = this.height * this.pixelRatio
                canvas.style.width = this.width + 'px'
                canvas.style.height = this.height + 'px'
            }
            this.#domCanvas = canvas
        }
        return this.#domCanvas as HTMLCanvasElement
    }

    resetCanvas() {
        this.#domCanvas = undefined
    }

    get context(): CanvasRenderingContext2D | null {
        return this.canvas.getContext('2d', this.contextParams)
    }

    get pixelRatio() {
        return window.devicePixelRatio || 1
    }

    createCanvas() {
        const canvas = document.createElement('canvas') as HTMLCanvasElement
        canvas.id = this.canvasId
        // need to test this
        canvas.tabIndex = 0
        canvas.width = this.width * this.pixelRatio
        canvas.height = this.height * this.pixelRatio
        canvas.style.width = this.width + 'px'
        canvas.style.height = this.height + 'px'
        document.querySelector('body')?.appendChild(canvas)
        return canvas
    }

    changeStyle(options: ICssProperties) {
        for (const [key, value] of Object.entries(options)) {
            if (key in this.canvas.style)
                // @FIX: type error in canvas style for key
                (this.canvas.style as any)[key] = value
        }
    }

    addEventListener<E extends Event>(_type: string, _func: CustomEvent<E>) {
        if (
            (this.#domEvents[_type] &&
                this.#domEvents[_type].includes(_func as CustomEvent<Event>)) ||
            !_func
        )
            return
        if (!this.#domEvents[_type]) this.#domEvents[_type] = []
        this.#domEvents[_type].push(_func as CustomEvent<Event>)

        this.canvas.addEventListener(_type, _func as any, { passive: false })
    }

    removeEventListener<E extends Event>(_type: string, _func: CustomEvent<E>) {
        if (!this.#domEvents[_type]) return
        this.#domEvents[_type] = this.#domEvents[_type].filter(
            (i) => i !== _func
        )
        this.canvas.removeEventListener(_type, _func as any)
    }

    getListener(event: string) {
        return this.#domEvents[event]
    }
}
