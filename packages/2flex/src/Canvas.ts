import { BaseBlock, BlockPayload } from './BaseBlock'
import { CanvasScene } from './CanvasScene'
import { defaultBlocks } from './defaultBlocks'
import { CanvasDOMManager } from './DOMManager'
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
}

interface DefaultCanvasOptions extends Required<{
    [K in keyof CanvasOptions]-?: CanvasOptions[K]
}> {}

interface CanvasCurrentPosition {
    x: number
    y: number
    z: number
}

interface CanvasEventsFunc {
    func: CustomEvent<Event>
    zIndex: number
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

    #htmlCanvas?: HTMLCanvasElement
    #context?: CanvasRenderingContext2D | null
    #boundingClient?: DOMRect

    #currentPosition: CanvasCurrentPosition

    #canvasEvents: CanvasEvents
    #canvasAnimations: { [animationId: AnimationId]: Animator }

    isFocused: boolean
    isMouseEventAllowed: boolean
    #latestZIndex: number
    #invokedHigherZIndex?: number
    #currentCursor: string
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
            moveSpeed: 10,
            keyboardMovement: true,
            mouseMovement: true,
            positionX: 0,
            positionY: 0,
            positionZ: 1,
            fps: 60,
        }

        this.#currentPosition = { x: 0, y: 0, z: 1 }

        this.#canvasEvents = {}
        this.#canvasAnimations = {}
        this.#latestZIndex = 0
        this.isFocused = false
        this.isMouseEventAllowed = false
        this.#currentCursor = 'auto'
        this.#registeredBlocks = defaultBlocks

        if (this.options) this.#setOptions(this.options)
        this.#domCanvas = new CanvasDOMManager(
            this.canvasId,
            this.width,
            this.height
        )
        this.#queue = {}
        this.#scene = new CanvasScene()
        this.#history = new History(this.#defaultOptions.historySize)
        this.#scheduler = new RenderScheduler(this.options?.fps, (timestmap) =>
            this.#render(timestmap)
        )
        this.#scheduler.start()
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

        this.#currentPosition = {
            x: this.#defaultOptions.positionX,
            y: this.#defaultOptions.positionY,
            z: this.#defaultOptions.positionZ,
        }
    }

    #init() {
        this.#domCanvas.resetCanvas()
        this.#domCanvas.clearAllEvents()
        this.canvas
        this.context
        this.context?.save()

        if (this.options) this.#domCanvas.changeStyle(this.options)
        this.#canvasFocusHandler()
        this.#checkMousePositionInCanvas()
        this.#setCanvasPosition()
        this.#setCanvasZoom()
        if (this.#defaultOptions.history) this.#snapshotHandler()
        if (this.#defaultOptions.mouseMovement) this.#handMove()
        if (this.#defaultOptions.keyboardMovement) this.#keyboardMove()
        if (this.#defaultOptions.zoomType == 'point') this.#pointZoom()
        else if (this.#defaultOptions.zoomType == 'center') this.#centerZoom()
    }
    #setCanvasPosition() {
        this.#invokeChanges((block: BaseBlock) => {
            block.__translateX(this.#currentPosition.x)
            block.__translateY(this.#currentPosition.y)
        })
    }

    #setCanvasZoom() {
        this.#invokeChanges((block: BaseBlock) => {
            block.__scale(this.#currentPosition.z)
        })
    }
    #keyboardMove() {
        const moveSpeed = this.#defaultOptions.moveSpeed
        window.addEventListener(
            'wheel',
            (event: WheelEvent) => {
                if (!this.#defaultOptions.keyboardMovement || !this.isFocused)
                    return
                if (event.ctrlKey) return
                event.preventDefault()
                let inBound = false
                if (event.shiftKey) {
                    if (event.deltaY < 0) {
                        this.#invokeChanges((block: BaseBlock) => {
                            if (
                                block.checkInBound(event) &&
                                block.__isOverflowXScrollable
                            ) {
                                block.__overflowTranslateX(moveSpeed)
                                inBound = true
                            } else block.__translateX(moveSpeed)
                        })
                        if (!inBound) this.#currentPosition.x += moveSpeed
                    } else {
                        this.#invokeChanges((block: BaseBlock) => {
                            if (
                                block.checkInBound(event) &&
                                block.__isOverflowXScrollable
                            ) {
                                block.__overflowTranslateX(-moveSpeed)
                                inBound = true
                            } else block.__translateX(-moveSpeed)
                        })
                        if (!inBound) this.#currentPosition.x -= moveSpeed
                    }
                } else {
                    if (event.deltaY < 0) {
                        this.#invokeChanges((block: BaseBlock) => {
                            if (
                                block.checkInBound(event) &&
                                block.__isOverflowYScrollable
                            ) {
                                block.__overflowTranslateY(moveSpeed)
                                inBound = true
                            } else block.__translateY(moveSpeed)
                        })
                        if (!inBound) this.#currentPosition.y += moveSpeed
                    } else {
                        this.#invokeChanges((block: BaseBlock) => {
                            if (
                                block.checkInBound(event) &&
                                block.__isOverflowYScrollable
                            ) {
                                block.__overflowTranslateY(-moveSpeed)
                                inBound = true
                            } else block.__translateY(-moveSpeed)
                        })
                        if (!inBound) this.#currentPosition.y -= moveSpeed
                    }
                }
            },
            { passive: false }
        )
    }
    #handMove() {
        let initX = 0
        let initY = 0
        let beforeX = 0
        let beforeY = 0
        let isMouseDown = false
        let isKeyDown = false

        window.addEventListener('keydown', (event) => {
            if (!this.#defaultOptions.mouseMovement) return
            if (event.code == 'Space') {
                if (!isKeyDown) {
                    ;(this.#domCanvas as any).changeStyle({ cursor: 'grab' })
                    isKeyDown = true
                }
            }
        })

        window.addEventListener(
            'mousemove',
            (event: MouseEvent) => {
                if (!this.#defaultOptions.mouseMovement || !this.isFocused)
                    return
                event.preventDefault()

                if (event.buttons == 0) {
                    isMouseDown = false
                    if (isKeyDown)
                        (this.#domCanvas as any).changeStyle({
                            cursor: 'grab',
                        })
                }

                if (event.buttons == 1 && isKeyDown) {
                    if (!isMouseDown) {
                        initX = event.clientX
                        initY = event.clientY
                        beforeX = 0
                        beforeY = 0
                        isMouseDown = true
                    }
                    if (isMouseDown) {
                        ;(this.#domCanvas as any).changeStyle({
                            cursor: 'grabbing',
                        })
                        let diffX = event.clientX - initX
                        let diffY = event.clientY - initY
                        if (diffX !== 0) {
                            this.#invokeChanges((block: BaseBlock) => {
                                block.__translateX(diffX - beforeX)
                            })
                            this.#currentPosition.x += diffX
                            beforeX = diffX
                        }
                        if (diffY !== 0) {
                            this.#invokeChanges((block: BaseBlock) => {
                                block.__translateY(diffY - beforeY)
                            })
                            this.#currentPosition.y += diffY
                            beforeY = diffY
                        }
                    }
                }
            },
            { passive: false }
        )

        window.addEventListener('keyup', (event) => {
            if (!this.#defaultOptions.mouseMovement) return
            ;(this.#domCanvas as any).changeStyle({ cursor: 'auto' })
            isKeyDown = false
        })
    }

    #centerZoom() {
        window.addEventListener(
            'wheel',
            (event: WheelEvent) => {
                if (
                    this.#defaultOptions.zoomType !== 'center' ||
                    !this.isFocused
                )
                    return
                event.preventDefault()
                if (event.ctrlKey) {
                    let scale = this.#defaultOptions.zoomSpeed
                    let invScale = this.#defaultOptions.zoomInvSpeed

                    let beforeX = this.#currentPosition.x
                    let beforeY = this.#currentPosition.y
                    const x = this.boundingClientRect.right / 2
                    const y = this.boundingClientRect.bottom / 2
                    this.#invokeChanges((block: BaseBlock) => {
                        if (event.deltaY < 0) {
                            this.#currentPosition.x +=
                                (x - beforeX) *
                                ((this.#currentPosition.z * scale) /
                                    this.#currentPosition.z -
                                    1)

                            // this.#currentPosition.y +=
                            //     y / (this.#currentPosition.z * scale) -
                            //     y / this.#currentPosition.z;
                            block.__translateX(
                                beforeX - this.#currentPosition.x
                            )
                            block.__scale(scale)
                            this.#currentPosition.z *= scale
                        } else {
                            this.#currentPosition.x +=
                                x / (this.#currentPosition.z * invScale) -
                                x / this.#currentPosition.z

                            this.#currentPosition.y +=
                                y / (this.#currentPosition.z * invScale) -
                                y / this.#currentPosition.z

                            block.__translateX(
                                this.#currentPosition.x - beforeX
                            )
                            block.__translateY(
                                this.#currentPosition.y - beforeY
                            )

                            block.__scale(invScale)
                            this.#currentPosition.z *= invScale
                        }
                    })
                }
            },
            { passive: false }
        )
    }

    #pointZoom() {
        window.addEventListener(
            'wheel',
            (event: WheelEvent) => {
                if (
                    this.#defaultOptions.zoomType !== 'point' ||
                    !this.isFocused
                )
                    return
                if (event.ctrlKey) {
                    event.preventDefault()
                    const { x, y } = this.getCursorPosition(event)

                    let scale = this.#defaultOptions.zoomSpeed
                    let invScale = this.#defaultOptions.zoomInvSpeed

                    let beforeX = this.#currentPosition.x
                    let beforeY = this.#currentPosition.y

                    if (event.deltaY < 0) {
                        const scaleFactor =
                            (this.#currentPosition.z * scale) /
                            this.#currentPosition.z
                        this.#currentPosition.x += (x - beforeX) * scaleFactor
                        this.#currentPosition.y -= (y - beforeY) * scaleFactor

                        this.#invokeChanges((block) => {
                            block.__translateX(
                                this.#currentPosition.x - beforeX
                            )
                            block.__scale(scale)
                        })
                        this.#currentPosition.z *= scale
                    } else {
                        const scaleFactor =
                            (this.#currentPosition.z * invScale) /
                            (this.#currentPosition.z - 1)
                        this.#currentPosition.x -= (x - beforeX) * scaleFactor
                        this.#currentPosition.y -= (y - beforeY) * scaleFactor
                        this.#invokeChanges((block) => {
                            block.__translateX(
                                this.#currentPosition.x - beforeX
                            )
                            block.__translateY(
                                this.#currentPosition.y - beforeY
                            )
                            block.__scale(invScale)
                        })

                        this.#currentPosition.z *= invScale
                    }
                }
            },
            { passive: false }
        )
    }
    #invokeChanges(func?: (block: BaseBlock) => void) {
        const sortedBlocks = this.#scene.getSortedNodesByZIndex()
        for (const block of sortedBlocks) {
            func?.(block)
            this.demandInvoke(block)
        }
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
        this.#registerDomEvents()
        this.#buildAddedAnimations()
        this.#buildRemovedAnimations()
        this.#refreshHead()
        this.#invokeAnimations(timestamp)
        this.#buildDemandedHistory()
        this.#renderCachedBlocks()
        this.#drawCachedBlocks()
        this.#clearQueue()
    }
    #clearQueue() {
        this.#queue = {}
    }
    #refreshHead() {
        const isRefresh = this.#queue['canvas:refresh:head']
        if (isRefresh) {
            this.#scene.sortNodesByZIndex()
            this.#sortAllDomEventsByZIndex()
        }
    }
    #renderCachedBlocks() {
        const invokedBlocks = this.#queue['block:cache']
        if (invokedBlocks) {
            for (const block of invokedBlocks) {
                block.render()
            }
        }
    }
    #drawCachedBlocks() {
        const blocks = this.#scene.getSortedNodesByZIndex()
        if (blocks) {
            const context = this.context
            if (!context) return
            this.clearRect()
            for (const block of blocks) {
                if (block.cachedBitmap)
                    context.drawImage(
                        block.cachedBitmap,
                        block.boundingBox.topLeft.x,
                        block.boundingBox.topLeft.y
                    )
            }
        }
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
                    } else if (key === 'removeChild') {
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
        }
    }
    // IMPORTANT: if any of the zindex has changed in any block we need to trigger this with building event func
    #sortDomEventsByZIndex(eventName: string) {
        this.#canvasEvents[eventName].events = this.#canvasEvents[
            eventName
        ].events.sort((a, b) => Math.abs(a.zIndex) - Math.abs(b.zIndex))
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
                const canvasEvents = this.#canvasEvents[eventName].events
                this.#canvasEvents[eventName].events = [
                    ...canvasEvents,
                    ...events,
                ]
                this.#sortDomEventsByZIndex(eventName)
                this.#buildDomEventFunc(eventName)
            }
        }
    }
    #buildRemovedDomEvents() {
        const removedEvents = this.#queue['domEvent:remove']
        if (removedEvents) {
            for (const [eventName, events] of Object.entries(removedEvents)) {
                this.#canvasEvents[eventName].events = this.#canvasEvents[
                    eventName
                ].events.filter((i) => !events.includes(i.func))
                this.#sortDomEventsByZIndex(eventName)
                this.#buildDomEventFunc(eventName)
            }
        }
    }
    #registerDomEvents() {
        for (const key in this.#canvasEvents) {
            const func = this.#canvasEvents[key].func as CustomEvent<Event>
            if (func !== undefined) {
                const eventFunc = this.#domCanvas.getListener(key)
                if (eventFunc && !eventFunc.includes(func)) {
                    for (let i = 0, len = eventFunc.length; i < len; i++) {
                        this.#domCanvas.removeEventListener(key, eventFunc[i])
                    }
                }
                this.#domCanvas.addEventListener(key, func)
                this.#canvasEvents[key].func = undefined
            }
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
                // we can write another safety for already handled blocks??
                block.canvas = this
                this.#handleBlockOptions(block)
                this.#handleBlockZIndex(block)
                block.init()
            }
            this.#scene.buildSceneGraph()
            this.demandRefreshHead()
        }
    }
    #removedBlocks() {
        const removedBlocks = this.#queue['block:remove']
        if (removedBlocks) {
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

            for (const [key, { before, after }] of Object.entries(
                demandedHistory
            )) {
                const nodeId = Number(key)
                if (tailData) {
                    const existedData = tailData[nodeId]
                    if (existedData)
                        tailData[nodeId] = { ...existedData, ...before }
                }
                nextData[nodeId] = after
            }
            if (tailData) this.#history.updateTail(tailData)
            this.#history.add(nextData)
        }
    }
    #handleBlockOptions(block: BaseBlock) {
        // this.#handleBindOptions(block)
        for (const [key, value] of block.options) {
            getPrototype(block, key as string)?.value.call(
                block,
                value?.currentValue
            )
        }
    }
    #handleBlockZIndex(block: BaseBlock) {
        if (block.zIndex() === undefined) {
            block.setOptionCurrent('zIndex', this.#latestZIndex)
            this.#latestZIndex += 1
        }
    }
    add(...blocks: BaseBlock[]) {
        for (let i = 0, len = blocks.length; i < len; i++) {
            const block = blocks[len - i - 1]
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
        this.#scene.head.listOnlyChilds((block: BaseBlock) => {
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
    getCursorPosition(event: MouseEvent) {
        return {
            x: event.pageX - this.boundingClientRect.left,
            y: event.pageY - this.boundingClientRect.top,
        }
    }
    clearRect() {
        const clientRect = this.boundingClientRect
        this.context?.clearRect(0, 0, clientRect.width, clientRect.height)
    }
    changeCursor(cur?: string) {
        this.#currentCursor = cur || 'auto'
        return this.#domCanvas.changeStyle({
            cursor: cur,
        })
    }
    whoIsTheFirst(zIndex?: number) {
        return this.#invokedHigherZIndex === zIndex
    }
    registerZIndex(zIndex: number) {
        if (
            (this.#invokedHigherZIndex && zIndex > this.#invokedHigherZIndex) ||
            !this.#invokedHigherZIndex
        ) {
            this.#invokedHigherZIndex = zIndex
        }
    }
    unregisterZIndex(zIndex: number) {
        if (zIndex === this.#invokedHigherZIndex) {
            this.#invokedHigherZIndex = undefined
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
    demandAddEvent(event: string, func: CustomEvent<Event>, zIndex: number) {
        const events = (this.#queue['domEvent:add'] ??= {})
        ;(events[event] ??= []).push({ func: func, zIndex: zIndex })
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
