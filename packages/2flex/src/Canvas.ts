import { BaseBlock, BlockPayload } from './BaseBlock'
import { CanvasScene } from './CanvasScene'
import { defaultBlocks } from './defaultBlocks'
import { CanvasDOMManager } from './DOMManager'
import { CanvasGrid } from './CanvasGrid'
import { History } from './History'
import { RenderScheduler } from './Scheduler'
import {
    Animator,
    ICssProperties,
    Timestamp,
    CustomEvent,
    SnapshotData,
    AnimationId,
} from './types'
import { getPrototype } from './Utils'

// Canvas options shouldn't be style properties
interface CanvasOptions {
    zoomSpeed?: number
    zoomInvSpeed?: number
    moveSpeed?: number
    zoomType?: 'center' | 'point'
    keyboardMovement?: boolean
    mouseMovement?: boolean
    history?: boolean
    historySize?: number
    positionX?: number
    positionY?: number
    positionZ?: number
    fps?: number
    tileSize?: number
}

interface DefaultCanvasOptions extends Required<{
    [K in keyof CanvasOptions]-?: CanvasOptions[K]
}> {}

interface CanvasCurrentPosition {
    x: number
    y: number
    z: number
}

interface CanvasView {
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
            before: any
            after: any
        }
    }
    'animation:add': { [animationId: AnimationId]: Animator }
    'animation:remove': AnimationId[]
    'domEvent:add': { [event: string]: CanvasEventsFunc[] }
    'domEvent:remove': { [event: string]: CustomEvent<Event>[] }
}

export class Canvas {
    canvasId: string
    width: number
    height: number
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

    #view: CanvasView

    #canvasEvents: CanvasEvents
    #canvasAnimations: { [animationId: AnimationId]: Animator }

    isFocused: boolean
    isMouseEventAllowed: boolean
    #latestBlockZIndex: number
    #highestZIndex?: number
    #registeredZIndexes: Map<number, number>
    #registeredBlocks: (typeof BaseBlock)[]

    constructor(
        canvasId: string,
        width: number,
        height: number,
        options?: CanvasOptions & ICssProperties
    ) {
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
        }

        this.#view = { tx: 0, ty: 0, scale: 1 }

        this.#canvasEvents = {}
        this.#canvasAnimations = {}
        this.#latestBlockZIndex = 0
        this.#registeredZIndexes = new Map()
        this.isFocused = false
        this.isMouseEventAllowed = false
        this.#registeredBlocks = defaultBlocks

        if (this.options) this.#setOptions(this.options)
        this.#domCanvas = new CanvasDOMManager(
            this.canvasId,
            this.width,
            this.height
        )
        this.#grid = new CanvasGrid(
            this.width,
            this.height,
            this.#defaultOptions.tileSize
        )
        this.#queue = {}
        this.#scene = new CanvasScene()
        this.#history = new History(this.#defaultOptions.historySize)
        this.#scheduler = new RenderScheduler(this.options?.fps, (timestmap) =>
            this.#render(timestmap)
        )
        this.#scheduler.start()
        this.#init()
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

        this.#view = {
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
        if (this.#defaultOptions.zoomType == 'point') this.#pointZoom()
        else if (this.#defaultOptions.zoomType == 'center') this.#centerZoom()
    }
    #primeGrid() {
        const v = this.#view
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
                        this.#view.tx += move
                    }
                } else {
                    const overflow = this.#overflowUnder(event, 'y')
                    if (overflow) {
                        overflow.__overflowTranslateY(move / 5)
                        this.demandInvoke(overflow)
                    } else {
                        this.#view.ty += move
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
            const block = targets[i]
            if (block.checkInBound(pointerEvent)) {
                if (axis === 'x' && block.__isOverflowXScrollable) return block
                if (axis === 'y' && block.__isOverflowYScrollable) return block
            }
        }
        return undefined
    }
    #handMove() {
        let isDragging = false
        let lastX = 0
        let lastY = 0
        let isSpaceDown = false
        window.addEventListener('keydown', (event) => {
            if (!this.isFocused) return
            if (event.code == 'Space') {
                if (!isSpaceDown) this.changeCursor('grab')
                isSpaceDown = true
            }
        })
        window.addEventListener('keyup', () => {
            if (!this.isFocused) return
            if (isSpaceDown) {
                isSpaceDown = false
                isDragging = false
                this.resetCursor()
                this.isMouseEventAllowed = true
            }
        })
        this.canvas.addEventListener('mousedown', (event: MouseEvent) => {
            if (!this.isFocused) return
            if (!isSpaceDown || event.button !== 0) return
            isDragging = true
            lastX = event.clientX
            lastY = event.clientY
            this.changeCursor('grabbing')
            this.isMouseEventAllowed = false
            event.preventDefault()
        })
        this.canvas.addEventListener('mousemove', (event: MouseEvent) => {
            if (!this.isFocused) return
            if (event.buttons === 0 && isSpaceDown) {
                this.changeCursor('grab')
            }
            if (!isDragging || !isSpaceDown) return
            event.preventDefault()
            const dx = event.clientX - lastX
            const dy = event.clientY - lastY
            if (dx === 0 && dy === 0) return
            this.#view.tx += dx
            this.#view.ty += dy
            lastX = event.clientX
            lastY = event.clientY
        })
        this.canvas.addEventListener('mouseup', () => {
            if (!isDragging) return
            isDragging = false
            this.changeCursor(isSpaceDown ? 'grab' : 'auto')
            this.isMouseEventAllowed = true
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
                this.#view.tx = cx - (cx - this.#view.tx) * k
                this.#view.ty = cy - (cy - this.#view.ty) * k
                this.#view.scale *= k
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
                this.#view.tx = x - (x - this.#view.tx) * k
                this.#view.ty = y - (y - this.#view.ty) * k
                this.#view.scale *= k
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
        window.addEventListener('keydown', (e: KeyboardEvent) => {
            if (!this.#defaultOptions.history || !this.isFocused) return
            if (e.key === 'Z' && e.ctrlKey) this.redo()
            else if (e.key === 'z' && e.ctrlKey) this.undo()
        })
    }
    #checkMousePositionInCanvas() {
        this.canvas.addEventListener('mouseenter', () => {
            this.isMouseEventAllowed = true
        })
        this.canvas.addEventListener('mouseleave', () => {
            this.isMouseEventAllowed = false
        })
    }
    #render(timestamp: Timestamp) {
        this.#addedBlocks()
        this.#removedBlocks()
        this.#buildAddedDomEvents()
        this.#buildRemovedDomEvents()
        this.#buildAddedAnimations()
        this.#buildRemovedAnimations()
        this.#renderCachedBlocks()
        this.#refreshHead()
        this.#drawCachedBlocks()
        this.#invokeAnimations(timestamp)
        this.#buildDemandedHistory()
        this.#clearQueue()
    }
    #clearQueue() {
        this.#queue = {}
    }
    #refreshHead() {
        const isRefresh = this.#queue['canvas:refresh:head']
        if (isRefresh) {
            this.#buildBlocksZIndex()
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
        const v = this.#view

        context.save()
        context.setTransform(1, 0, 0, 1, 0, 0)
        context.clearRect(0, 0, this.width, this.height)

        const vw = this.width / v.scale
        const vh = this.height / v.scale
        const wMinX = -v.tx / v.scale
        const wMinY = -v.ty / v.scale
        const wMaxX = wMinX + vw
        const wMaxY = wMinY + vh

        context.setTransform(v.scale, 0, 0, v.scale, v.tx, v.ty)
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
                this.demandInvoke(foundNode)
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
        ].events.sort(
            (a, b) =>
                b.block.getOptionCurrent('zIndex') -
                a.block.getOptionCurrent('zIndex')
        )
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
                this.#canvasAnimations[Number(animationId)] = func
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
                this.#handleBlockOptions(block)
                block.init()
                this.demandInvoke(block)
            }
            this.#scene.buildSceneGraph()
            for (const block of addedBlocks) this.#grid.addBlock(block)
            this.#buildBlocksZIndex()
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
            this.#buildBlocksZIndex()
            this.demandRefreshHead()
        }
    }
    #buildBlocksZIndex() {
        this.#latestBlockZIndex = 0
        this.#scene.reversePostOrderTraversal((block: BaseBlock) => {
            const zIndex = block.getOptionCurrent('zIndex')
            if (zIndex === undefined) {
                block.setOptionCurrent('zIndex', this.#latestBlockZIndex)
                this.#latestBlockZIndex += 1
            }
        })
    }
    #buildDemandedHistory() {
        if (!this.#defaultOptions.history) return
        const demandedHistory = this.#queue['block:history']
        if (demandedHistory) {
            const tailData = this.#history.tailData()
            const nextData: SnapshotData = {}
            let initTail: SnapshotData = {}

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
    #handleBlockOptions(block: BaseBlock) {
        for (const [key, value] of block.options) {
            getPrototype(block, key as string)?.value.call(
                block,
                value?.currentValue
            )
        }
    }
    add(...blocks: BaseBlock[]) {
        for (let i = 0, len = blocks.length; i < len; i++) {
            const block = blocks[i]
            this.#scene.addBlock(block)
            this.demandAddBlock(block)
        }
    }
    remove(...blocks: BaseBlock[]) {
        for (let i = 0, len = blocks.length; i < len; i++) {
            const block = blocks[i]
            this.#scene.removeBlock(block)
            this.demandRemoveBlock(block)
        }
    }
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
        this.#scene.preOrderTraversal((block: BaseBlock) => {
            payload.blocks.push(block.__generatePayload())
        })
        return JSON.stringify(payload)
    }
    load(payload: string) {
        const parsedPayload = JSON.parse(payload) as Payload
        const canvasOpt = parsedPayload.canvas
        const blocksPayload = parsedPayload.blocks

        this.canvasId = canvasOpt.canvasId
        this.options = canvasOpt.options
        this.width = canvasOpt.width
        this.height = canvasOpt.height

        if (this.options) this.#setOptions(this.options)
        this.#init()

        this.#scheduler.stop()
        this.#scheduler.start()

        const constructedBlocks: BaseBlock[] = []

        const checkBlock = (blockPaylaod: BlockPayload) => {
            const exists = this.#scene.find({
                nodeId: blockPaylaod.nodeId,
            })?.[0]
            let foundBlock: BaseBlock | undefined
            // first need to check if this block already in our tree
            // otherwise construct new block
            if (exists) {
                foundBlock = exists
            } else {
                const foundClass = this.#registeredBlocks.filter(
                    (b) => b.name === blockPaylaod.name
                )?.[0]

                if (foundClass) {
                    // @TODO: fix any issue
                    foundBlock =
                        blockPaylaod.additionalParams.length !== 0
                            ? new (foundClass as any)(
                                  ...blockPaylaod.additionalParams,
                                  blockPaylaod.options || {}
                              )
                            : new foundClass(blockPaylaod.options || {})
                }
            }
            if (foundBlock) {
                foundBlock.options = blockPaylaod.options
                for (
                    let i = 0, len = blockPaylaod.childs.length;
                    i < len;
                    i++
                ) {
                    const childBlock = checkBlock(blockPaylaod.childs[i])
                    if (childBlock) foundBlock.addChild(childBlock)
                }
            }
            return foundBlock
        }

        for (let i = 0, len = blocksPayload.length; i < len; i++) {
            const b = checkBlock(blocksPayload[i])
            if (b) constructedBlocks.push(b)
        }

        this.add(...constructedBlocks)
    }
    registerBlocks(...blocks: (typeof BaseBlock)[]) {
        this.#registeredBlocks.push(...blocks)
    }

    undo() {
        if (!this.#defaultOptions.history) return
        this.#history.toBack()
        this.#invokeHistory()
    }
    redo() {
        if (!this.#defaultOptions.history) return
        this.#history.toFuture()
        this.#invokeHistory()
    }
    get context(): CanvasRenderingContext2D | null {
        if (!this.#context) this.#context = this.#domCanvas.context
        return this.#context
    }
    get canvas(): HTMLCanvasElement {
        if (!this.#htmlCanvas) this.#htmlCanvas = this.#domCanvas.canvas
        return this.#htmlCanvas
    }
    get boundingClientRect() {
        if (!this.#boundingClient)
            this.#boundingClient = this.canvas.getBoundingClientRect()
        return this.#boundingClient
    }
    get grid() {
        return this.#grid
    }
    get view(): CanvasView {
        return { tx: this.#view.tx, ty: this.#view.ty, scale: this.#view.scale }
    }
    get currentPosition(): CanvasCurrentPosition {
        return { x: this.#view.tx, y: this.#view.ty, z: this.#view.scale }
    }
    getCursorPosition(event: MouseEvent | WheelEvent) {
        const r = this.boundingClientRect
        const px = (event as MouseEvent).pageX - r.left
        const py = (event as MouseEvent).pageY - r.top
        return {
            x: (px - this.#view.tx) / this.#view.scale,
            y: (py - this.#view.ty) / this.#view.scale,
        }
    }
    clearRect() {
        const clientRect = this.boundingClientRect
        this.context?.clearRect(0, 0, clientRect.width, clientRect.height)
    }
    changeCursor(cur?: string) {
        return this.#domCanvas.changeStyle({
            cursor: cur,
        })
    }
    resetCursor() {
        this.changeCursor('auto')
    }
    whoIsTheFirst(nodeId: number) {
        const zIndex = this.#registeredZIndexes.get(nodeId)
        return zIndex !== undefined && zIndex === this.#highestZIndex
    }
    registerZIndex(nodeId: number, zIndex: number) {
        this.#registeredZIndexes.set(nodeId, zIndex)
        if (
            this.#highestZIndex === undefined ||
            zIndex > this.#highestZIndex
        ) {
            this.#highestZIndex = zIndex
        }
    }
    unregisterZIndex(nodeId: number, zIndex: number) {
        const current = this.#registeredZIndexes.get(nodeId)
        if (current === undefined) return
        this.#registeredZIndexes.delete(nodeId)
        if (this.#highestZIndex !== undefined && current === this.#highestZIndex) {
            let max: number | undefined = undefined
            for (const z of this.#registeredZIndexes.values()) {
                if (max === undefined || z > max) max = z
            }
            this.#highestZIndex = max
        }
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
    demandHistory(nodeId: number, before: any, after: any) {
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
    demandAddAnimation(animationId: AnimationId, animation: Animator) {
        const animations = (this.#queue['animation:add'] ??= {})
        animations[animationId] = animation
    }
    demandRemoveAnimation(animationId: AnimationId) {
        const animations = (this.#queue['animation:remove'] ??= [])
        animations.push(animationId)
    }
    demandRefreshHead() {
        this.#queue['canvas:refresh:head'] = true
    }
}
