import { type ICssProperties, type CustomEvent } from './types'

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
    #givenCanvas?: HTMLCanvasElement
    #domEvents: DomEvent = {}
    #ownedCanvas = false
    contextParams: ContextParamas = {
        alpha: true,
        colorSpace: 'srgb',
        colorType: 'unorm8',
        desynchronized: false,
        willReadFrequently: false,
    }

    constructor(
        canvasId: string,
        width: number,
        height: number,
        element?: HTMLCanvasElement
    ) {
        this.canvasId = canvasId
        this.width = width
        this.height = height
        this.#givenCanvas = element
        if (element) {
            this.#domCanvas = element
            this.#applySize(element)
        }
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
                this.#applySize(canvas)
            }
            this.#domCanvas = canvas
        }
        return this.#domCanvas as HTMLCanvasElement
    }

    #applySize(canvas: HTMLCanvasElement) {
        canvas.width = this.width * this.pixelRatio
        canvas.height = this.height * this.pixelRatio
        // the size of the element is only set when the manager owns it, an
        // element that was given to it is laid out by its owner
        if (!this.#givenCanvas) {
            canvas.style.width = this.width + 'px'
            canvas.style.height = this.height + 'px'
        }
    }

    /**
     * Resizes the canvas element to the size of the manager.
     */
    resize(width: number, height: number) {
        this.width = width
        this.height = height
        this.#applySize(this.canvas)
    }

    resetCanvas() {
        // an element that was given to the manager is kept, it is not looked
        // up in the document again
        this.#domCanvas = this.#givenCanvas
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
        this.#applySize(canvas)
        document.querySelector('body')?.appendChild(canvas)
        // the canvas was made by the manager, so the manager drops it too
        this.#ownedCanvas = true
        return canvas
    }

    changeStyle(options: ICssProperties) {
        for (const [key, value] of Object.entries(options)) {
            if (key in this.canvas.style)
                Object.assign(this.canvas.style, { [key]: value })
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

        this.canvas.addEventListener(_type, _func as EventListener, {
            passive: false,
        })
    }

    removeEventListener<E extends Event>(_type: string, _func: CustomEvent<E>) {
        if (!this.#domEvents[_type]) return
        this.#domEvents[_type] = this.#domEvents[_type].filter(
            (i) => i !== _func
        )
        this.canvas.removeEventListener(_type, _func as EventListener)
    }

    getListener(event: string) {
        return this.#domEvents[event]
    }
    clearAllEvents() {
        for (const [event, eventFuncs] of Object.entries(this.#domEvents)) {
            for (const func of eventFuncs) this.removeEventListener(event, func)
        }
    }

    /**
     * Releases the listeners of the canvas and drops the canvas element when
     * the manager created it.
     */
    destroy() {
        this.clearAllEvents()
        if (this.#ownedCanvas) {
            this.#domCanvas?.remove()
            this.#domCanvas = undefined
            this.#ownedCanvas = false
        }
    }
}
