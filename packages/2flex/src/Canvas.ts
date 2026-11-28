import { type BaseBlockOptions, type BlockPayload } from './BaseBlock'
import { BaseBlock } from './BaseBlock'
import { CanvasScene } from './CanvasScene'
import { type BlockQuery } from './CanvasScene'
import { defaultBlocks } from './defaultBlocks'
import { CanvasDOMManager } from './DOMManager'
import { CanvasGrid } from './CanvasGrid'
import { History } from './History'
import { RenderScheduler } from './Scheduler'
import {
    type Animator,
    type ICssProperties,
    type Timestamp,
    type CustomEvent,
    type SnapshotData,
    type AnimationId,
    type ScrollableBlock,
} from './types'
import {
    getPrototype,
    invalidArgument,
    isRecord,
    requireRecord,
    validateBlockArguments,
    validateBlockConstructors,
    validateBlockOption,
    validateCanvasSettings,
    validateCanvasSize,
    validateLoadBlocks,
} from './Utils'
import {
    HOT_LINE_BLOCK_NAME,
    OVERFLOW_X_SCROLL_BAR_BLOCK_NAME,
    OVERFLOW_Y_SCROLL_BAR_BLOCK_NAME,
} from './const'

// Canvas options shouldn't be style properties
export interface CanvasOptions {
    /**
     * The multiplier that is applied to the zoom on every step of the wheel.
     *
     * @defaultValue 1.2
     */
    zoomSpeed?: number
    /**
     * The multiplier that is applied to the zoom on every step of the wheel
     * while zooming out.
     *
     * @defaultValue 0.8
     */
    zoomInvSpeed?: number
    /**
     * The number of pixels the viewport moves on every step of a key.
     *
     * @defaultValue 100
     */
    moveSpeed?: number
    /**
     * Whether the zoom is centred on the canvas or on the pointer.
     *
     * With `center` the canvas only zooms to the centre of the canvas. With
     * `point` the canvas zooms to the place the mouse points at.
     *
     * @defaultValue 'center'
     */
    zoomType?: 'center' | 'point'
    /**
     * Whether the canvas can be moved with the arrow keys.
     *
     * @defaultValue true
     */
    keyboardMovement?: boolean
    /**
     * Whether the canvas can be moved by dragging its background.
     *
     * The movement starts when the space key is pressed.
     *
     * @defaultValue true
     */
    mouseMovement?: boolean
    /**
     * Whether the actions of the canvas are stored in its history.
     *
     * @defaultValue true
     */
    history?: boolean
    /**
     * The number of actions the history of the canvas keeps.
     *
     * When the history is full the oldest action is dropped to make room for
     * the new one.
     *
     * @defaultValue 100
     */
    historySize?: number
    /**
     * The horizontal offset of the viewport at the start.
     *
     * @defaultValue 0
     */
    positionX?: number
    /**
     * The vertical offset of the viewport at the start.
     *
     * @defaultValue 0
     */
    positionY?: number
    /**
     * The zoom level of the viewport at the start.
     *
     * @defaultValue 1
     */
    positionZ?: number
    /**
     * The number of frames the canvas draws in a second.
     *
     * @defaultValue 60
     */
    fps?: number
    /**
     * The size of the tiles the canvas is divided into, in pixels.
     *
     * A smaller tile uses less memory, a bigger tile renders faster.
     *
     * @defaultValue 256
     */
    tileSize?: number
    /**
     * The number of milliseconds the canvas waits before it draws a frame in
     * a higher quality after the zoom came to a stop.
     *
     * @defaultValue 150
     */
    qualitySettleDelay?: number
    /**
     * The highest quality the canvas draws in.
     *
     * @defaultValue 2
     */
    maxQuality?: number
}

interface DefaultCanvasOptions extends Required<{
    [K in keyof CanvasOptions]-?: CanvasOptions[K]
}> {}

interface CanvasCurrentPosition {
    x: number
    y: number
    z: number
}

export interface CanvasView {
    tx: number
    ty: number
    scale: number
}

interface CanvasEventsFunc {
    func: CustomEvent<Event>
    block: BaseBlock
}

interface CanvasEvent {
    func?: CustomEvent<Event>
    events: CanvasEventsFunc[]
}

type CanvasEvents = { [key: string]: CanvasEvent }

interface CanvasPayload {
    canvasId: string
    width: number
    height: number
    options: (CanvasOptions & ICssProperties) | undefined
}

interface Payload {
    canvas: CanvasPayload
    blocks: BlockPayload[]
}

export type QueuePayloadMap = {
    'canvas:refresh:head': boolean
    'block:add': Set<BaseBlock>
    'block:remove': Set<BaseBlock>
    'block:cache': Set<BaseBlock>
    'block:history': {
        [nodeId: number]: {
            before: Record<string, unknown>
            after: Record<string, unknown>
        }
    }
    'animation:add': { [animationId: AnimationId]: Animator }
    'animation:remove': AnimationId[]
    'domEvent:add': { [event: string]: CanvasEventsFunc[] }
    'domEvent:remove': { [event: string]: CustomEvent<Event>[] }
}

/**
 * The surface the blocks are drawn on.
 *
 * The canvas owns the viewport, the scene, the render loop, the history and
 * the handling of the input. One canvas is bound to one `canvas` element.
 *
 * ```ts
 * const canvas = new Canvas('scene', 800, 600)
 * ```
 */
export class Canvas {
    /**
     * The id of the canvas element the instance is bound to.
     */
    canvasId: string
    /**
     * The width of the canvas in pixels.
     */
    width: number
    /**
     * The height of the canvas in pixels.
     */
    height: number
    /**
     * The options of the canvas, including the style properties.
     */
    options?: CanvasOptions & ICssProperties
    #defaultOptions: DefaultCanvasOptions

    #domCanvas: CanvasDOMManager
    #scene: CanvasScene
    #queue: { [K in keyof QueuePayloadMap]?: QueuePayloadMap[K] }
    #history: History
    #scheduler: RenderScheduler
    #grid: CanvasGrid

    #htmlCanvas?: HTMLCanvasElement
    #context?: CanvasRenderingContext2D | null
    #boundingClient?: DOMRect

    /**
     * The transform of the viewport.
     */
    view: CanvasView

    #renderScale: number
    #targetRenderScale: number
    #lastZoomTime: number

    #canvasEvents: CanvasEvents
    #canvasAnimations: { [animationId: AnimationId]: Animator }

    /**
     * Whether the canvas has the focus.
     */
    isFocused: boolean
    /**
     * Whether the mouse events are delivered to the canvas.
     */
    isMouseEventAllowed: boolean
    #registeredZIndexes: Map<number, number | undefined>
    #registeredCursors: Map<number, string[]>
    #registeredBlocks: (typeof BaseBlock)[]
    #windowListeners: { type: string; func: EventListener }[] = []
    #destroyed = false

    /**
     * Creates a canvas and binds it to an element of the page.
     *
     * @param canvasId - The id of the `canvas` element to draw on.
     * @param width - The width of the canvas in pixels.
     * @param height - The height of the canvas in pixels.
     * @param options - The options of the canvas and the style properties
     * that are applied to the element.
     */
    constructor(
        canvasId: string,
        width: number,
        height: number,
        options?: CanvasOptions & ICssProperties,
        element?: HTMLCanvasElement
    ) {
        // an element that was given to the canvas is used as it is
        if (!element)
            validateCanvasSettings(
                'new Canvas()',
                '',
                canvasId,
                width,
                height,
                options
            )
        else validateCanvasSize('new Canvas()', width, height)
        this.canvasId = canvasId
        this.options = options
        this.width = width
        this.height = height

        this.#defaultOptions = {
            history: true,
            historySize: 100,
            zoomType: 'center',
            zoomSpeed: 1.2,
            zoomInvSpeed: 0.8,
            moveSpeed: 100,
            keyboardMovement: true,
            mouseMovement: true,
            positionX: 0,
            positionY: 0,
            positionZ: 1,
            fps: 60,
            tileSize: 256,
            qualitySettleDelay: 150,
            maxQuality: 2,
        }

        this.view = { tx: 0, ty: 0, scale: 1 }

        this.#renderScale = 1
        this.#targetRenderScale = 1
        this.#lastZoomTime = 0

        this.#canvasEvents = {}
        this.#canvasAnimations = {}
        this.#registeredZIndexes = new Map()
        this.#registeredCursors = new Map()
        this.isFocused = false
        this.isMouseEventAllowed = false
        this.#registeredBlocks = defaultBlocks

        if (this.options) this.#setOptions(this.options)
        this.#domCanvas = new CanvasDOMManager(
            this.canvasId,
            this.width,
            this.height,
            element
        )
        this.#grid = new CanvasGrid(
            this.width,
            this.height,
            this.#defaultOptions.tileSize
        )
        this.#targetRenderScale = this.#computeRenderScale()
        this.#renderScale = this.#targetRenderScale
        this.#grid.setRenderScale(this.#renderScale)
        this.#queue = {}
        this.#scene = new CanvasScene()
        this.#history = new History(this.#defaultOptions.historySize)
        this.#scheduler = new RenderScheduler(this.options?.fps, (timestmap) =>
            this.#render(timestmap)
        )
        this.#init()
        this.#scheduler.start()
    }

    /**
     * Creates a canvas and binds it to a `canvas` element of the page.
     *
     * The element is used as it is, it is not moved into the document and it
     * is not dropped when the canvas is destroyed.
     *
     * @param element - The `canvas` element to draw on.
     * @param width - The width of the canvas in pixels.
     * @param height - The height of the canvas in pixels.
     * @param options - The options of the canvas and the style properties
     * that are applied to the element.
     */
    static fromElement(
        element: HTMLCanvasElement,
        width: number,
        height: number,
        options?: CanvasOptions & ICssProperties
    ): Canvas {
        const method = 'Canvas.fromElement()'
        if (!(element instanceof HTMLCanvasElement))
            invalidArgument(method, 'element', 'a canvas element', element)
        validateCanvasSize(method, width, height)
        return new Canvas(element.id, width, height, options, element)
    }

    #setOptions(options: CanvasOptions) {
        if (options.history !== undefined)
            this.#defaultOptions.history = options.history
        if (options.zoomType !== undefined)
            this.#defaultOptions.zoomType = options.zoomType
        if (options.zoomSpeed !== undefined)
            this.#defaultOptions.zoomSpeed = options.zoomSpeed
        if (options.zoomInvSpeed !== undefined)
            this.#defaultOptions.zoomInvSpeed = options.zoomInvSpeed
        if (options.moveSpeed !== undefined)
            this.#defaultOptions.moveSpeed = options.moveSpeed
        if (options.keyboardMovement !== undefined)
            this.#defaultOptions.keyboardMovement = options.keyboardMovement
        if (options.mouseMovement !== undefined)
            this.#defaultOptions.mouseMovement = options.mouseMovement
        if (options.positionX !== undefined)
            this.#defaultOptions.positionX = options.positionX
        if (options.positionY !== undefined)
            this.#defaultOptions.positionY = options.positionY
        if (options.positionZ !== undefined)
            this.#defaultOptions.positionZ = options.positionZ
        if (options.fps !== undefined) this.#defaultOptions.fps = options.fps
        if (options.historySize !== undefined)
            this.#defaultOptions.historySize = options.historySize
        if (options.tileSize !== undefined) {
            this.#defaultOptions.tileSize = options.tileSize
            this.#grid?.resize(this.width, this.height)
        }
        if (options.qualitySettleDelay !== undefined)
            this.#defaultOptions.qualitySettleDelay = options.qualitySettleDelay
        if (options.maxQuality !== undefined)
            this.#defaultOptions.maxQuality = options.maxQuality

        this.view = {
            tx: this.#defaultOptions.positionX,
            ty: this.#defaultOptions.positionY,
            scale: this.#defaultOptions.positionZ,
        }
    }
    #init() {
        this.#domCanvas.resetCanvas()
        this.#domCanvas.clearAllEvents()
        this.canvas
        this.context
        this.context?.save()
        if (this.options) this.#domCanvas.changeStyle(this.options)
        this.#primeGrid()
        this.#canvasFocusHandler()
        this.#checkMousePositionInCanvas()
        if (this.#defaultOptions.history) this.#snapshotHandler()
        if (this.#defaultOptions.mouseMovement) this.#handMove()
        if (this.#defaultOptions.keyboardMovement) this.#keyboardMove()
        if (this.#defaultOptions.zoomType === 'point') this.#pointZoom()
        else if (this.#defaultOptions.zoomType === 'center') this.#centerZoom()
    }
    #primeGrid() {
        const v = this.view
        const vw = this.width / v.scale
        const vh = this.height / v.scale
        const wMinX = -v.tx / v.scale
        const wMinY = -v.ty / v.scale
        const wMaxX = wMinX + vw
        const wMaxY = wMinY + vh
        this.#grid.expandByViewport(wMinX, wMinY, wMaxX, wMaxY)
    }
    #keyboardMove() {
        const moveSpeed = this.#defaultOptions.moveSpeed
        this.canvas.addEventListener(
            'wheel',
            (event: WheelEvent) => {
                if (!this.isFocused || event.ctrlKey) return
                event.preventDefault()
                const move = event.deltaY < 0 ? moveSpeed : -moveSpeed
                if (event.shiftKey) {
                    const overflow = this.#overflowUnder(event, 'x')
                    if (overflow) {
                        overflow.__overflowTranslateX(move / 5)
                        this.demandInvoke(overflow)
                    } else {
                        this.view.tx += move
                        this.#demandInvokeExplicitBlocks()
                    }
                } else {
                    const overflow = this.#overflowUnder(event, 'y')
                    if (overflow) {
                        overflow.__overflowTranslateY(move / 5)
                        this.demandInvoke(overflow)
                    } else {
                        this.view.ty += move
                        this.#demandInvokeExplicitBlocks()
                    }
                }
            },
            { passive: false }
        )
    }
    #overflowUnder(event: WheelEvent, axis: 'x' | 'y') {
        const pointerEvent = {
            pageX: event.pageX,
            pageY: event.pageY,
            clientX: event.clientX,
            clientY: event.clientY,
        } as MouseEvent
        const targets = this.#scene.getSortedBlocksByZIndex()
        for (let i = targets.length - 1; i >= 0; i--) {
            const block = targets[i] as ScrollableBlock
            if (block.checkInBound(pointerEvent)) {
                if (axis === 'x' && block.__isOverflowXScrollable) return block
                if (axis === 'y' && block.__isOverflowYScrollable) return block
            }
        }
    }
    #handMove() {
        let isDragging = false
        let lastX = 0
        let lastY = 0
        let isSpaceDown = false
        this.#addWindowListener('keydown', (event: KeyboardEvent) => {
            if (event.code === 'Space' && this.isFocused) {
                if (!isSpaceDown) this.changeCursor('grab')
                isSpaceDown = true
            }
        })
        this.#addWindowListener('keyup', () => {
            if (isSpaceDown && this.isFocused) {
                isSpaceDown = false
                isDragging = false
                this.resetCursor()
                this.isMouseEventAllowed = true
                this.__releaseCanvasCursor()
            }
        })
        this.canvas.addEventListener('mousedown', (event: MouseEvent) => {
            if (!this.isFocused || !isSpaceDown || event.button !== 0) return
            isDragging = true
            lastX = event.clientX
            lastY = event.clientY
            this.changeCursor('grabbing')
            this.isMouseEventAllowed = false
            event.preventDefault()
        })
        this.canvas.addEventListener('mousemove', (event: MouseEvent) => {
            if (isDragging && isSpaceDown && this.isFocused) {
                if (event.buttons === 0) this.changeCursor('grab')
                event.preventDefault()
                const dx = event.clientX - lastX
                const dy = event.clientY - lastY
                if (dx !== 0 || dy !== 0) {
                    this.view.tx += dx
                    this.view.ty += dy
                    lastX = event.clientX
                    lastY = event.clientY
                    this.#demandInvokeExplicitBlocks()
                }
            }
        })
        this.canvas.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false
                this.changeCursor(isSpaceDown ? 'grab' : 'auto')
                this.isMouseEventAllowed = true
                this.__releaseCanvasCursor()
            }
        })
    }
    #centerZoom() {
        this.canvas.addEventListener(
            'wheel',
            (event: WheelEvent) => {
                if (!this.isFocused || !event.ctrlKey) return
                event.preventDefault()
                const k =
                    event.deltaY < 0
                        ? this.#defaultOptions.zoomSpeed
                        : this.#defaultOptions.zoomInvSpeed
                const cx = this.width / 2
                const cy = this.height / 2
                this.view.tx = cx - (cx - this.view.tx) * k
                this.view.ty = cy - (cy - this.view.ty) * k
                this.view.scale *= k
                this.#markZoomActivity()
                this.#primeGrid()
                this.#demandInvokeExplicitBlocks()
            },
            { passive: false }
        )
    }
    #pointZoom() {
        this.canvas.addEventListener(
            'wheel',
            (event: WheelEvent) => {
                if (!this.isFocused || !event.ctrlKey) return
                event.preventDefault()
                const { x, y } = this.getCursorPosition(event)
                const k =
                    event.deltaY < 0
                        ? this.#defaultOptions.zoomSpeed
                        : this.#defaultOptions.zoomInvSpeed
                this.view.tx = x - (x - this.view.tx) * k
                this.view.ty = y - (y - this.view.ty) * k
                this.view.scale *= k
                this.#markZoomActivity()
                this.#primeGrid()
                this.#demandInvokeExplicitBlocks()
            },
            { passive: false }
        )
    }
    #canvasFocusHandler() {
        this.canvas.addEventListener('focusin', () => {
            this.isFocused = true
        })
        this.canvas.addEventListener('focusout', () => {
            this.isFocused = false
        })
    }
    #snapshotHandler() {
        this.#addWindowListener('keydown', (e: KeyboardEvent) => {
            if (!this.#defaultOptions.history || !this.isFocused) return
            if (e.key === 'Z' && e.ctrlKey) this.redo()
            else if (e.key === 'z' && e.ctrlKey) this.undo()
        })
    }
    #addWindowListener<E extends Event>(
        type: string,
        func: (event: E) => void
    ) {
        const listener = func as EventListener
        window.addEventListener(type, listener)
        this.#windowListeners.push({ type, func: listener })
    }
    #checkMousePositionInCanvas() {
        this.canvas.addEventListener('mouseenter', () => {
            this.isMouseEventAllowed = true
        })
        this.canvas.addEventListener('mouseleave', () => {
            this.isMouseEventAllowed = false
            this.#resetActiveRunningEventsBlocks()
        })
    }
    #render(timestamp: Timestamp) {
        this.#addedBlocks()
        this.#removedBlocks()
        this.#buildAddedDomEvents()
        this.#buildRemovedDomEvents()
        this.#buildAddedAnimations()
        this.#buildRemovedAnimations()
        this.#invokeAnimations(timestamp)
        this.#renderCachedBlocks()
        this.#refreshHead()
        this.#applyPendingQuality(timestamp)
        this.#drawCachedBlocks()
        this.#buildDemandedHistory()
        this.#clearQueue()
    }
    #computeRenderScale(): number {
        const maxQuality = this.#defaultOptions.maxQuality
        const target = this.view.scale * this.#domCanvas.pixelRatio
        if (!Number.isFinite(target)) return 1
        return Math.min(Math.max(target, 1), maxQuality)
    }
    #markZoomActivity() {
        this.#lastZoomTime = performance.now()
        this.#targetRenderScale = this.#computeRenderScale()
    }
    #applyPendingQuality(timestamp: Timestamp) {
        if (this.#targetRenderScale === this.#renderScale) return
        const settleDelay = this.#defaultOptions.qualitySettleDelay
        if (timestamp - this.#lastZoomTime < settleDelay) return
        this.#renderScale = this.#targetRenderScale
        // the cached pixels belong to the previous density
        this.#grid.setRenderScale(this.#renderScale)
    }
    #clearQueue() {
        this.#queue = {}
    }
    #refreshHead() {
        const isRefresh = this.#queue['canvas:refresh:head']
        if (isRefresh) {
            this.#scene.sortBlocksByZIndex()
            this.#sortAllDomEventsByZIndex()
            this.#registerDomEvents()
        }
    }
    #renderCachedBlocks() {
        const invokedBlocks = this.#queue['block:cache']
        if (!invokedBlocks) return
        for (const block of invokedBlocks) {
            block.updateCords()
            this.#grid.updateBlock(block)
        }
    }
    #drawCachedBlocks() {
        const context = this.context
        if (!context) return
        const tiles = this.#grid.allTiles
        if (tiles.length === 0) return
        const v = this.view
        const dpr = this.#domCanvas.pixelRatio

        context.save()
        context.setTransform(1, 0, 0, 1, 0, 0)
        context.clearRect(0, 0, this.width * dpr, this.height * dpr)

        const vw = this.width / v.scale
        const vh = this.height / v.scale
        const wMinX = -v.tx / v.scale
        const wMinY = -v.ty / v.scale
        const wMaxX = wMinX + vw
        const wMaxY = wMinY + vh

        context.setTransform(
            v.scale * dpr,
            0,
            0,
            v.scale * dpr,
            v.tx * dpr,
            v.ty * dpr
        )
        const sortedBlocks = this.#scene.getSortedBlocksByZIndex()
        const tileSize = this.#grid.tileSize
        for (const tile of tiles) {
            if (tile.dirty) tile.paint(sortedBlocks)
            if (!tile.bitmap) continue
            const tx = tile.col * tileSize
            const ty = tile.row * tileSize
            if (
                tx + tileSize < wMinX ||
                tx > wMaxX ||
                ty + tileSize < wMinY ||
                ty > wMaxY
            )
                continue
            context.drawImage(tile.bitmap, tx, ty, tileSize, tileSize)
        }
        context.setTransform(1, 0, 0, 1, 0, 0)
        context.restore()
    }
    #demandInvokeExplicitBlocks() {
        const sortedBlocks = this.#scene.getSortedBlocksByZIndex()
        const explicitBlocks = sortedBlocks.filter((block) => {
            const position = block.getOptionCurrent('position')
            const name = block.getOptionCurrent('name')
            return (
                (position === 'fixed' || position === 'sticky') &&
                name !== OVERFLOW_X_SCROLL_BAR_BLOCK_NAME &&
                name !== OVERFLOW_Y_SCROLL_BAR_BLOCK_NAME &&
                name !== HOT_LINE_BLOCK_NAME
            )
        })
        for (const block of explicitBlocks) this.demandInvoke(block)
    }
    #resetActiveRunningEventsBlocks() {
        const blocks = this.#scene.getSortedBlocksByZIndex()
        for (const block of blocks) {
            block.__disableRunningEvents()
        }
        this.#registeredCursors = new Map()
    }
    #invokeAnimations(timestamp: Timestamp) {
        for (const animeFunc of Object.values(this.#canvasAnimations)) {
            animeFunc?.(timestamp)
        }
    }
    #invokeHistory() {
        const tailData = this.#history.tailData()
        if (!tailData) return
        for (const [key, options] of Object.entries(tailData)) {
            const foundNode = this.#scene.find({ nodeId: Number(key) })?.[0]
            if (foundNode) {
                for (const [key, option] of Object.entries(options)) {
                    if (key === 'addChild') {
                        if (option.parentNode)
                            option.parentNode.__addChildInternal(option)
                        else foundNode.__addChildInternal(option)
                        this.demandAddBlock(option)
                    } else if (key === 'removeChild') {
                        if (option.parentNode)
                            option.parentNode.__removeChildInternal(option)
                        else foundNode.__removeChildInternal(option)
                        this.demandRemoveBlock(option)
                    } else {
                        getPrototype(foundNode, key)?.value.call(
                            foundNode,
                            option
                        )
                    }
                }
                // the block and the parents of it are laid out again, so a
                // restored value is used by the layout of its parent
                foundNode.__invokeChange()
            }
        }
    }
    #sortAllDomEventsByZIndex() {
        for (const event of Object.keys(this.#canvasEvents)) {
            this.#sortDomEventsByZIndex(event)
            this.#buildDomEventFunc(event)
        }
    }
    #sortDomEventsByZIndex(eventName: string) {
        this.#canvasEvents[eventName].events = this.#canvasEvents[
            eventName
        ].events.sort((a, b) => {
            const aIndex = this.#scene.getPaintIndex(a.block.nodeId!)
            const bIndex = this.#scene.getPaintIndex(b.block.nodeId!)
            if (aIndex === bIndex) return 0
            return bIndex - aIndex
        })
    }
    #buildDomEventFunc(eventName: string) {
        this.#canvasEvents[eventName].func = (e: Event) => {
            for (const event of this.#canvasEvents[eventName].events)
                event.func(e)
        }
    }
    #buildAddedDomEvents() {
        const addedEvents = this.#queue['domEvent:add']
        if (addedEvents) {
            for (const [eventName, events] of Object.entries(addedEvents)) {
                const canvasEvents = (this.#canvasEvents[eventName] ??= {
                    events: [],
                    func: undefined,
                })?.events
                this.#canvasEvents[eventName].events = [
                    ...canvasEvents,
                    ...events,
                ]
                this.#sortDomEventsByZIndex(eventName)
                this.#buildDomEventFunc(eventName)
            }
            this.#registerDomEvents()
        }
    }
    #buildRemovedDomEvents() {
        const removedEvents = this.#queue['domEvent:remove']
        if (removedEvents) {
            for (const [eventName, events] of Object.entries(removedEvents)) {
                this.#canvasEvents[eventName].events = this.#canvasEvents[
                    eventName
                ]?.events.filter((i) => !events.includes(i.func))
                this.#sortDomEventsByZIndex(eventName)
                this.#buildDomEventFunc(eventName)
            }
            this.#registerDomEvents()
        }
    }
    #registerDomEvents() {
        for (const key in this.#canvasEvents) {
            const func = this.#canvasEvents[key].func as CustomEvent<Event>
            const eventFunc = this.#domCanvas.getListener(key)
            if (eventFunc && !eventFunc.includes(func)) {
                for (let i = 0, len = eventFunc.length; i < len; i++) {
                    this.#domCanvas.removeEventListener(key, eventFunc[i])
                }
            }
            this.#domCanvas.addEventListener(key, func)
        }
    }
    #buildAddedAnimations() {
        const addedAnimations = this.#queue['animation:add']
        if (addedAnimations) {
            for (const [animationId, func] of Object.entries(addedAnimations)) {
                this.#canvasAnimations[animationId] = func
            }
        }
    }
    #buildRemovedAnimations() {
        const removedAnimations = this.#queue['animation:remove']
        if (removedAnimations) {
            for (const animationId of removedAnimations) {
                delete this.#canvasAnimations[animationId]
            }
        }
    }
    #addedBlocks() {
        const addedBlocks = this.#queue['block:add']
        if (addedBlocks) {
            for (const block of addedBlocks) {
                block.canvas = this
                block.init()
                this.demandInvoke(block)
            }
            this.#scene.buildSceneGraph()
            for (const block of addedBlocks) this.#grid.addBlock(block)
            this.demandRefreshHead()
        }
    }
    #removedBlocks() {
        const removedBlocks = this.#queue['block:remove']
        if (removedBlocks) {
            for (const [eventName, obj] of Object.entries(this.#canvasEvents)) {
                this.#canvasEvents[eventName].events = obj.events.filter(
                    (i) => ![...removedBlocks].includes(i.block)
                )
            }
            for (const block of removedBlocks) {
                this.#grid.removeBlock(block)
                this.#scene.removeBlock(block)
            }
            this.#scene.buildSceneGraph()
            this.demandRefreshHead()
        }
    }
    #buildDemandedHistory() {
        if (!this.#defaultOptions.history) return
        const demandedHistory = this.#queue['block:history']
        if (demandedHistory) {
            const tailData = this.#history.tailData()
            const nextData: SnapshotData = {}
            const initTail: SnapshotData = {}

            for (const [key, { before, after }] of Object.entries(
                demandedHistory
            )) {
                if (tailData) {
                    const existedData = tailData[key] || {}
                    tailData[key] = { ...existedData, ...before }
                } else {
                    initTail[key] = before
                }
                nextData[key] = after
            }
            if (tailData) this.#history.updateTail(tailData)
            else this.#history.add(initTail)
            this.#history.add(nextData)
        }
    }
    /**
     * Adds one or more blocks to the scene.
     *
     * The blocks are added to the scene on the next frame.
     */
    add(...blocks: BaseBlock[]) {
        validateBlockArguments('Canvas.add()', blocks, BaseBlock)
        for (let i = 0, len = blocks.length; i < len; i++) {
            const block = blocks[i]
            this.#scene.addBlock(block)
            this.demandAddBlock(block)
        }
    }
    /**
     * Removes one or more blocks from the scene.
     *
     * The blocks are removed from the scene on the next frame.
     */
    remove(...blocks: BaseBlock[]) {
        validateBlockArguments('Canvas.remove()', blocks, BaseBlock)
        for (let i = 0, len = blocks.length; i < len; i++) {
            const block = blocks[i]
            this.#scene.removeBlock(block)
            this.demandRemoveBlock(block)
        }
    }
    /**
     * Serializes the scene into a JSON string.
     *
     * The payload holds the blocks of the scene and their options. A block
     * that was written by a custom class can only be restored when the class
     * is registered with {@link Canvas.registerBlocks}.
     */
    export(): string {
        const payload: Payload = {
            canvas: {
                canvasId: this.canvasId,
                width: this.width,
                height: this.height,
                options: this.options,
            },
            blocks: [],
        }
        for (const block of this.#scene.head.childNodes) {
            payload.blocks.push((block as BaseBlock).__generatePayload())
        }
        return JSON.stringify(payload)
    }
    /**
     * Restores a scene from a payload that was made by
     * {@link Canvas.export}.
     *
     * The payload replaces the current scene. Register the custom block
     * classes with {@link Canvas.registerBlocks} before the payload is
     * loaded, so the blocks can be restored.
     */
    load(payload: string) {
        const method = 'Canvas.load()'
        if (typeof payload !== 'string')
            invalidArgument(method, 'payload', 'a JSON string', payload)
        let parsed: unknown
        try {
            parsed = JSON.parse(payload)
        } catch (cause) {
            throw new SyntaxError(
                '[2flex] Canvas.load() expected valid JSON at payload.',
                { cause }
            )
        }
        if (!isRecord(parsed))
            invalidArgument(method, 'payload', 'an object', parsed)
        const settings = parsed.canvas
        if (!isRecord(settings))
            invalidArgument(method, 'canvas', 'an object', settings)
        validateCanvasSettings(
            method,
            'canvas.',
            settings.canvasId,
            settings.width,
            settings.height,
            settings.options
        )
        validateLoadBlocks(parsed.blocks, 'blocks', new Set())
        const parsedPayload = parsed as unknown as Payload
        const canvasOpt = parsedPayload.canvas
        const blocksPayload = parsedPayload.blocks

        interface PreparedBlock {
            block: BaseBlock
            options: BlockPayload['options']
            children: PreparedBlock[]
        }

        const unregistered = new Map<string, string>()
        const prepareBlock = (
            payload: BlockPayload,
            path: string
        ): PreparedBlock | undefined => {
            const existing =
                payload.nodeId === undefined
                    ? undefined
                    : this.#scene.find({ nodeId: payload.nodeId })[0]
            const blockClass = this.#registeredBlocks.find(
                (block) => block.name === payload.name
            )
            if (!existing && !blockClass) {
                if (!unregistered.has(payload.name))
                    unregistered.set(payload.name, path)
                return
            }

            const options = payload.options ?? {}
            for (const [key, value] of Object.entries(options))
                validateBlockOption(
                    method,
                    `${path}.options.${key}`,
                    key,
                    value,
                    BaseBlock
                )
            let block = existing
            if (!block && blockClass) {
                try {
                    block = new blockClass(options as BaseBlockOptions)
                } catch (cause) {
                    throw new Error(
                        `[2flex] ${method} could not construct "${payload.name}" at ${path}.`,
                        { cause }
                    )
                }
            }
            if (!block) return

            const children: PreparedBlock[] = []
            for (const [index, child] of payload.childs.entries()) {
                const childPath = `${path}.childs[${index}]`
                const prepared = prepareBlock(child, childPath)
                if (!prepared) continue
                for (
                    let ancestor: BaseBlock | undefined = block;
                    ancestor;
                    ancestor = ancestor.parentNode
                ) {
                    if (ancestor === prepared.block)
                        throw new TypeError(
                            `[2flex] ${method} cannot add an ancestor as a child at ${childPath}.`
                        )
                }
                children.push(prepared)
            }
            return { block, options, children }
        }
        const preparedBlocks: PreparedBlock[] = []
        for (const [index, payload] of blocksPayload.entries()) {
            const prepared = prepareBlock(payload, `blocks[${index}]`)
            if (prepared) preparedBlocks.push(prepared)
        }

        this.canvasId = canvasOpt.canvasId
        this.options = canvasOpt.options
        this.width = canvasOpt.width
        this.height = canvasOpt.height
        this.#domCanvas.canvasId = canvasOpt.canvasId
        this.#domCanvas.width = canvasOpt.width
        this.#domCanvas.height = canvasOpt.height

        if (this.options) this.#setOptions(this.options)
        this.#init()

        this.#scheduler.stop()
        this.#scheduler.start()

        const applyBlock = ({ block, options, children }: PreparedBlock) => {
            for (const [key, value] of Object.entries(options))
                block.options.set(key, value)
            for (const child of children) block.addChild(applyBlock(child))
            return block
        }
        this.add(...preparedBlocks.map(applyBlock))
        for (const [name, path] of unregistered) {
            console.warn(
                `[2flex] Canvas.load() skipped unregistered block "${name}" at ${path}. Register its class with Canvas.registerBlocks() before loading.`
            )
        }
    }
    /**
     * Registers the custom block classes of the scene.
     *
     * The classes are needed to restore a scene that was serialized while it
     * held blocks of a custom class.
     */
    registerBlocks(...blocks: (typeof BaseBlock)[]) {
        validateBlockConstructors(blocks, BaseBlock)
        this.#registeredBlocks.push(...blocks)
    }
    /**
     * Searches the scene and returns every block that matches the query.
     *
     * @param queries - The options the blocks are matched against.
     */
    find(queries: BlockQuery): BaseBlock[] {
        requireRecord('Canvas.find()', 'queries', queries)
        return this.#scene.find(queries)
    }
    /**
     * Applies the changes that are waiting in the queue of the canvas.
     *
     * The canvas applies the queued changes inside of its render loop, this
     * method runs the same work right away.
     */
    flush() {
        if (this.#destroyed) return
        this.#render(performance.now())
    }
    /**
     * Changes the size of the canvas.
     *
     * The element of the canvas is resized too and the scene is laid out
     * again.
     *
     * @param width - The width of the canvas in pixels.
     * @param height - The height of the canvas in pixels.
     */
    resize(width: number, height: number) {
        const method = 'Canvas.resize()'
        validateCanvasSize(method, width, height)
        if (this.#destroyed) return
        this.width = width
        this.height = height
        this.#domCanvas.resize(width, height)
        this.#grid?.resize(width, height)
        this.#targetRenderScale = this.#computeRenderScale()
        this.#renderScale = this.#targetRenderScale
        this.#grid?.setRenderScale(this.#renderScale)
        this.#primeGrid()
        this.#demandInvokeExplicitBlocks()
    }
    /**
     * Releases the canvas.
     *
     * The render loop is stopped, the listeners are removed and the scene is
     * dropped. The element of the canvas is kept when it was given to the
     * canvas, it belongs to whoever owns it.
     */
    destroy() {
        if (this.#destroyed) return
        this.#destroyed = true
        this.#scheduler.stop()
        for (const { type, func } of this.#windowListeners)
            window.removeEventListener(type, func)
        this.#windowListeners = []
        this.#domCanvas.destroy()
        this.#scene.head.childNodes.clear()
    }
    /**
     * Reverts the last action of the history.
     */
    undo() {
        if (!this.#defaultOptions.history) return
        this.#history.toBack()
        this.#invokeHistory()
    }
    /**
     * Applies the last action that was reverted.
     */
    redo() {
        if (!this.#defaultOptions.history) return
        this.#history.toFuture()
        this.#invokeHistory()
    }
    /**
     * The rendering context of the canvas element.
     */
    get context(): CanvasRenderingContext2D | null {
        if (!this.#context) this.#context = this.#domCanvas.context
        return this.#context
    }
    /**
     * The canvas element the instance is bound to.
     */
    get canvas(): HTMLCanvasElement {
        if (!this.#htmlCanvas) this.#htmlCanvas = this.#domCanvas.canvas
        return this.#htmlCanvas
    }
    /**
     * The rectangle of the canvas element in the coordinates of the page.
     */
    get boundingClientRect() {
        if (!this.#boundingClient)
            this.#boundingClient = this.canvas.getBoundingClientRect()
        return this.#boundingClient
    }
    /**
     * The cursor that is applied to the canvas element.
     *
     * The value is `auto` when no cursor is applied.
     */
    get currentCursor(): string {
        return (this.canvas.style.cursor as string) || 'auto'
    }
    /**
     * The position of the viewport in the coordinates of the canvas.
     */
    get currentPosition(): CanvasCurrentPosition {
        return { x: this.view.tx, y: this.view.ty, z: this.view.scale }
    }
    /**
     * The scale the canvas draws in.
     *
     * The scale is raised while the canvas is zoomed to keep the details
     * sharp. It falls back to `1` when the canvas came to a rest.
     */
    get renderScale(): number {
        return this.#renderScale
    }
    /**
     * Converts the position of an event into the coordinates of the canvas.
     *
     * @param event - The event the position is read from.
     */
    getCursorPosition(event: MouseEvent | WheelEvent) {
        if (
            !event ||
            typeof event.pageX !== 'number' ||
            typeof event.pageY !== 'number'
        )
            invalidArgument(
                'Canvas.getCursorPosition()',
                'event',
                'an event with numeric pageX and pageY',
                event
            )
        const r = this.boundingClientRect
        const px = (event as MouseEvent).pageX - r.left
        const py = (event as MouseEvent).pageY - r.top
        return {
            x: (px - this.view.tx) / this.view.scale,
            y: (py - this.view.ty) / this.view.scale,
        }
    }
    /**
     * Removes every block from the scene.
     */
    clearRect() {
        const clientRect = this.boundingClientRect
        this.context?.clearRect(0, 0, clientRect.width, clientRect.height)
    }
    /**
     * Sets the cursor of the canvas element.
     *
     * @param cur - The value of the CSS property `cursor`.
     */
    changeCursor(cur?: string) {
        if (cur !== undefined && typeof cur !== 'string')
            invalidArgument('Canvas.changeCursor()', 'cursor', 'a string', cur)
        return this.#domCanvas.changeStyle({
            cursor: cur,
        })
    }
    /**
     * Restores the default cursor of the canvas element.
     */
    resetCursor() {
        this.changeCursor('auto')
    }
    /**
     * Registers a cursor for a block.
     *
     * The cursor is applied when the pointer is over the block.
     *
     * @param nodeId - The id of the block.
     * @param cursor - The value of the CSS property `cursor`.
     */
    registerCursor(nodeId: number, cursor: string) {
        let currentCursor = this.#registeredCursors.get(nodeId)
        currentCursor ??= []
        if (currentCursor && !currentCursor.includes(cursor))
            currentCursor.push(cursor)
        this.#registeredCursors.set(nodeId, currentCursor)
        this.#resolveCursor()
    }
    /**
     * Removes a cursor that was registered for a block.
     *
     * @param nodeId - The id of the block.
     * @param cursor - The value of the CSS property `cursor`.
     */
    unregisterCursor(nodeId: number, cursor: string) {
        let currentCursor = this.#registeredCursors.get(nodeId)
        if (currentCursor) {
            currentCursor = currentCursor.filter((i) => i !== cursor)
            this.#registeredCursors.set(nodeId, currentCursor)
        }
        if (
            !currentCursor ||
            (currentCursor && (currentCursor as []).length === 0)
        ) {
            this.resetCursor()
            this.#registeredCursors.delete(nodeId)
        }
        this.#resolveCursor()
    }
    __releaseCanvasCursor() {
        if (this.#registeredCursors.size === 0)
            this.#domCanvas.changeStyle({ cursor: 'auto' })
        else this.#resolveCursor()
    }
    #resolveCursor() {
        let cursor: string | undefined
        let highPaintIndex = -1
        let highZIndex: number | undefined = undefined
        for (const [id, cur] of this.#registeredCursors) {
            const paintIndex = this.#scene.getPaintIndex(id)
            if (paintIndex >= 0) {
                if (paintIndex > highPaintIndex) {
                    highPaintIndex = paintIndex
                    cursor = cur[0]
                }
                continue
            }
            const zIndex = this.#registeredZIndexes.get(id)
            if (zIndex === undefined) continue
            if (highZIndex === undefined || zIndex > highZIndex) {
                highZIndex = zIndex
                cursor = cur[0]
            }
        }
        this.#domCanvas.changeStyle({ cursor: cursor })
    }
    /**
     * Tells whether a block is the topmost one of the stacking order.
     *
     * @param nodeId - The id of the block.
     */
    whoIsTheFirst(nodeId: number) {
        if (!this.#registeredZIndexes.has(nodeId)) return false
        let highPaintIndex = -1
        let highZIndex: number | undefined = undefined
        for (const id of this.#registeredZIndexes.keys()) {
            const paintIndex = this.#scene.getPaintIndex(id)
            if (paintIndex >= 0) {
                if (paintIndex > highPaintIndex) highPaintIndex = paintIndex
                continue
            }
            const zIndex = this.#registeredZIndexes.get(id)
            if (zIndex === undefined) continue
            if (highZIndex === undefined || zIndex > highZIndex)
                highZIndex = zIndex
        }
        const paintIndex = this.#scene.getPaintIndex(nodeId)
        if (paintIndex >= 0) return paintIndex === highPaintIndex
        const zIndex = this.#registeredZIndexes.get(nodeId)
        if (zIndex === undefined || highZIndex === undefined) return false
        return zIndex === highZIndex
    }
    /**
     * Registers the z index of a block.
     *
     * The block takes part in the stacking order of the scene.
     *
     * @param nodeId - The id of the block.
     * @param zIndex - The z index of the block.
     */
    registerZIndex(nodeId: number, zIndex?: number) {
        this.#registeredZIndexes.set(nodeId, zIndex)
    }
    /**
     * Removes the z index that was registered for a block.
     *
     * @param nodeId - The id of the block.
     */
    unregisterZIndex(nodeId: number) {
        this.#registeredZIndexes.delete(nodeId)
    }
    demandInvoke(block: BaseBlock) {
        const set = (this.#queue['block:cache'] ??= new Set())
        set.add(block)
    }
    demandAddBlock(block: BaseBlock) {
        const set = (this.#queue['block:add'] ??= new Set())
        set.add(block)
    }
    demandRemoveBlock(block: BaseBlock) {
        const set = (this.#queue['block:remove'] ??= new Set())
        set.add(block)
    }
    demandHistory(
        nodeId: number,
        before: Record<string, unknown>,
        after: Record<string, unknown>
    ) {
        const historyObj = (this.#queue['block:history'] ??= {})
        historyObj[nodeId] = { before: before, after: after }
    }
    demandAddEvent(block: BaseBlock, event: string, func: CustomEvent<Event>) {
        const events = (this.#queue['domEvent:add'] ??= {})
        ;(events[event] ??= []).push({
            func: func,
            block: block,
        })
    }
    demandRemoveEvent(event: string, func: CustomEvent<Event>) {
        const events = (this.#queue['domEvent:remove'] ??= {})
        ;(events[event] ??= []).push(func)
    }
    /**
     * Schedules an animation to be registered.
     *
     * @param animationId - The id of the animation.
     * @param animation - The function that draws a frame of the animation.
     */
    demandAddAnimation(animationId: AnimationId, animation: Animator) {
        const animations = (this.#queue['animation:add'] ??= {})
        animations[animationId] = animation
    }
    /**
     * Schedules an animation to be removed.
     *
     * @param animationId - The id of the animation.
     */
    demandRemoveAnimation(animationId: AnimationId) {
        const animations = (this.#queue['animation:remove'] ??= [])
        animations.push(animationId)
    }
    /**
     * Schedules the topmost block of the stacking order to be drawn again.
     */
    demandRefreshHead() {
        this.#queue['canvas:refresh:head'] = true
    }
}
