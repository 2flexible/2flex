import { Node, NodeId } from './Node'
import { CanvasTree } from './CanvasTree'
import { CanvasDOMManager } from './DOMManager'
import { getPrototype, xIntersect, yIntersect } from './Utils'
import { Block } from './Block'
import type { IBlockOptions } from './Block'
import type {
    ICssProperties,
    SnapshotObject,
    CustomEvent,
    SnapshotSize,
    inOut,
    Animator,
} from './types'
import { defaultBlocks } from './defaultBlocks'
import { BaseBlock, BlockPayload } from './BaseBlock'
import { HOT_LINE_BLOCK_NAME, OVERFLOW_SCROLL_BAR_BLOCK_NAME } from './const'
import { DummyCanvas } from './DummyCanvas'

// Canvas options shouldn't be style properties
interface CanvasOptions {
    zoomSpeed?: number
    zoomInvSpeed?: number
    moveSpeed?: number
    zoomType?: 'center' | 'point'
    keyboardMovement?: boolean
    mouseMovement?: boolean
    history?: boolean
    historySize?: SnapshotSize
    positionX?: number
    positionY?: number
    positionZ?: number
    fps?: number
}

interface DefaultCanvasOptions extends Required<{
    [K in keyof CanvasOptions]-?: CanvasOptions[K]
}> {}

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

interface BlockAnimation {
    animations: Animator[]
    func?: Animator
}

interface CanvasAnimations {
    [key: string]: BlockAnimation
}
type BlockCanvasCache = {
    [key: number]: ImageBitmap
}

export class Canvas {
    canvasId: string
    width: number
    height: number
    options?: CanvasOptions & ICssProperties

    #context: CanvasRenderingContext2D | null
    #htmlCanvas?: HTMLCanvasElement
    #boundingClient?: DOMRect

    #domCanvas: CanvasDOMManager
    #tree: CanvasTree
    #canvasEvents: CanvasEvents
    #defaultOptions: DefaultCanvasOptions
    currentCursor: string
    #higherBlockZIndex?: number
    #handledNodes: { [key: number]: boolean }
    #initTime?: number
    isFocused = false
    #animations: CanvasAnimations
    #reservedAnimation?: number
    #registeredBlocks: any[]
    #latestZIndex: number

    #sortedBy?: string

    currentPosition: { x: number; y: number; z: number }

    #invokedBlocks: Set<BaseBlock>

    #blocksCanvasCache: BlockCanvasCache

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
        this.#context = null

        this.#blocksCanvasCache = []

        this.currentCursor = 'auto'
        this.#handledNodes = {}
        this.#canvasEvents = {}
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
            fps: 0,
        }
        this.#animations = {}
        this.#invokedBlocks = new Set()

        this.currentPosition = { x: 0, y: 0, z: 1 }

        if (this.options) this.#setOptions()
        this.#tree = new CanvasTree(this.#defaultOptions.historySize)

        this.#domCanvas = new CanvasDOMManager(
            this.canvasId,
            this.width,
            this.height
        )
        this.#initTime = new Date().getTime()
        this.#registeredBlocks = defaultBlocks
        this.#latestZIndex = 1
        this.#initCanvas()
        this.#checkMousePositionInCanvas()
        this.#render()
    }

    get context(): CanvasRenderingContext2D | null {
        if (!this.#context) this.#context = this.#domCanvas.context
        return this.#context
    }

    get canvas(): HTMLCanvasElement {
        if (!this.#htmlCanvas) this.#htmlCanvas = this.#domCanvas.canvas
        return this.#htmlCanvas
    }

    #setOptions() {
        if (this.options?.history)
            this.#defaultOptions.history = this.options.history
        if (this.options?.zoomType)
            this.#defaultOptions.zoomType = this.options.zoomType
        if (this.options?.zoomSpeed)
            this.#defaultOptions.zoomSpeed = this.options.zoomSpeed

        if (this.options?.zoomInvSpeed)
            this.#defaultOptions.zoomInvSpeed = this.options.zoomInvSpeed
        if (this.options?.moveSpeed)
            this.#defaultOptions.moveSpeed = this.options.moveSpeed
        if (this.options?.keyboardMovement)
            this.#defaultOptions.keyboardMovement =
                this.options.keyboardMovement
        if (this.options?.mouseMovement)
            this.#defaultOptions.mouseMovement = this.options.mouseMovement
        if (this.options?.positionX)
            this.#defaultOptions.positionX = this.options.positionX
        if (this.options?.positionY)
            this.#defaultOptions.positionY = this.options.positionY
        if (this.options?.positionZ)
            this.#defaultOptions.positionZ = this.options.positionZ
        if (this.options?.fps) this.#defaultOptions.fps = this.options.fps
        if (this.options?.historySize)
            this.#defaultOptions.historySize = this.options.historySize

        this.currentPosition = {
            x: this.#defaultOptions.positionX,
            y: this.#defaultOptions.positionY,
            z: this.#defaultOptions.positionZ,
        }
    }

    #initCanvas() {
        this.#domCanvas.resetCanvas()
        this.canvas
        this.context
        this.context?.save()

        window.onload = () => {
            if (this.options) {
                let styleOptions: { [key: string]: string | number } = {}
                for (let [key, value] of Object.entries(this.options)) {
                    if (!Object.hasOwn(this.#defaultOptions, key))
                        styleOptions[key] = value
                }
                this.#domCanvas.changeStyle(this.options)
            }
            if (this.#defaultOptions.history) this.#snapshotHandler()
            if (this.#defaultOptions.mouseMovement) this.#handMove()
            if (this.#defaultOptions.keyboardMovement) this.#keyboardMove()
            if (this.#defaultOptions.zoomType == 'point') this.#pointZoom()
            else if (this.#defaultOptions.zoomType == 'center')
                this.#centerZoom()
            this.canvas.addEventListener('focusin', () => {
                this.isFocused = true
            })
            this.canvas.addEventListener('focusout', () => {
                this.isFocused = false
            })
            this.#setCanvasPosition()
            this.#setCanvasZoom()
        }
    }
    add(...blocks: Block[]) {
        for (let i = 0, len = blocks.length; i < len; i++) {
            this.#tree.addNode(blocks[len - i - 1])
        }
        this.__demandAddBlock()
        this.#initCacheBlocks()
    }
    __demandAddBlock() {
        this.#initTime = new Date().getTime()
        this.#tree.preOrderTraversal<Block>((b: Block) => {
            if (b.nodeId && !this.#handledNodes[b.nodeId]) {
                this.__handleOptions(b)
                this.__collectEvents(b)
                this.__collectAnimations(b)
                this.__takeInitSnaphshot(b)
                b.init()
                if (b.parentNode) b.__refreshHeadBlock()
                b.updateBlockCords()
                b.__hidden = !this.inBoundBlock(b)
                b.render()
            }
        })
        this.invokeNodeListing()
    }
    remove(block: Block) {
        this.#tree.head.removeChild(block)
        this.__demandRemoveBlock(block)
        // @Todo: take snapshot for this
    }
    __demandRemoveBlock(block: BaseBlock) {
        this.__clearEvents(block)
        this.__clearAnimations(block)
        this.invokeNodeListing()
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
        this.#tree.head.listOnlyChilds((block: Block) => {
            payload.blocks.push(block.__generatePayload())
        })
        return JSON.stringify(payload)
    }

    load(payload: string) {
        const parsedPayload = JSON.parse(payload) as Payload
        const canvasOpt = parsedPayload.canvas
        this.canvasId = canvasOpt.canvasId
        this.options = canvasOpt.options
        this.width = canvasOpt.width
        this.height = canvasOpt.height
        if (this.options) this.#setOptions()
        this.#initCanvas()

        const blocks = parsedPayload.blocks
        const constructedBlocks: Block[] = []

        const checkBlock = (block: BlockPayload) => {
            const exists = this.find({ nodeId: block.nodeId })
            const childs: Block[] = []
            let foundBlock
            if (exists && exists[0]) {
                foundBlock = exists[0]
            } else {
                const found = this.#registeredBlocks.filter(
                    (b) => b.name === block.name
                )
                let invokeClass = found[0]
                if (invokeClass)
                    if (block.additionalParams.length !== 0)
                        foundBlock = new invokeClass(
                            ...block.additionalParams,
                            block.options || {}
                        )
                    else {
                        foundBlock = new invokeClass(block.options || {})
                    }
            }
            foundBlock.options = block.options || block.options
            if (block.childs?.length !== 0)
                for (let i = 0, len = block.childs!.length; i < len; i++) {
                    const childBlock = checkBlock(block.childs![i])
                    if (childBlock) childs.push(childBlock)
                }
            foundBlock.addChild(...childs)
            return foundBlock
        }

        for (let i = 0, len = blocks.length; i < len; i++) {
            const b = checkBlock(blocks[i])
            if (b) constructedBlocks.push(b)
        }
        this.add(...constructedBlocks)
    }

    registerBlocks(...blocks: Block[]) {
        this.#registeredBlocks.push(blocks)
    }

    find(queries: IBlockOptions): Block[] {
        let blocks: Block[] = []
        this.#tree.head.listAllChilds((block: Block) => {
            for (const [k, v] of Object.entries(queries)) {
                if (
                    block.getOptionCurrent(k)?.currentValue === v ||
                    (k === 'nodeId' && block.nodeId === v)
                )
                    blocks.push(block)
            }
        })
        return blocks
    }

    get canvasBounding() {
        if (!this.#boundingClient)
            this.#boundingClient = this.canvas.getBoundingClientRect()
        return this.#boundingClient
    }

    getCursorPosition(event: MouseEvent) {
        return {
            x: event.pageX - this.canvasBounding.left,
            y: event.pageY - this.canvasBounding.top,
        }
    }

    whoIsTheFirst(zIndex?: number) {
        return this.#higherBlockZIndex === zIndex
    }

    registerZIndex(inOutZ: inOut) {
        let inBlock = inOutZ['in']
        let outBlock = inOutZ['out']
        if (
            inBlock &&
            ((this.#higherBlockZIndex && inBlock > this.#higherBlockZIndex) ||
                !this.#higherBlockZIndex)
        ) {
            this.#higherBlockZIndex = inBlock
        } else if (outBlock && outBlock === this.#higherBlockZIndex) {
            this.#higherBlockZIndex = undefined
        }
    }

    __handleOptions(block: BaseBlock): void {
        if (
            !block.nodeId ||
            !block.options ||
            (block.nodeId && this.#handledNodes[block.nodeId])
        )
            return
        block.canvas = this
        this.#handledNodes[block.nodeId] = true
        this.#handleBindOptions(block)
        for (const [key, value] of block.options) {
            getPrototype(block, key as string)?.value.call(
                block,
                value?.currentValue
            )
        }
        if (block.zIndex() === undefined) {
            block.setOptionCurrent('zIndex', this.#latestZIndex)
            this.#latestZIndex += 1
        }
    }

    #handleBindOptions(block: BaseBlock) {
        if (block.__bindOptions.length !== 0) {
            for (const opt of block.__bindOptions) {
                for (const key of opt.options) {
                    getPrototype(block, key as any)?.value.call(
                        block,
                        opt.block.getOptionCurrent(key)
                    )
                }
            }
        }
    }

    __takeInitSnaphshot(block: BaseBlock) {
        const dummy: any = {}
        dummy[block.nodeId!] = { ...block.options }
        this.#tree.takeSanpshot(this.#initTime!, null, dummy)
    }

    __takeBlockSnapshot<T>(parentBlock: BaseBlock, before: any) {
        const after: any = {}
        after[parentBlock.nodeId!] = {
            childNodes: [...parentBlock.childNodes],
        }
        this.#tree.takeSanpshot(this.#initTime!, before, after)
    }

    __collectAnimations(block: BaseBlock) {
        for (const func of block.__animations) {
            if (block.nodeId) this.registerAnimation(block.nodeId, func)
        }
    }

    __clearAnimations(block: BaseBlock) {
        if (block.nodeId) this.removeAnimation(block.nodeId)
    }

    registerAnimation(nodeId: number, func: Animator) {
        if (!this.#animations[nodeId])
            this.#animations[nodeId] = { animations: [] }
        this.#animations[nodeId].animations.push(func)
        this.#buildAnimatonFunc(nodeId, this.#animations[nodeId].animations)
    }

    #buildAnimatonFunc(nodeId: number, animations: Animator[]) {
        this.#animations[nodeId].func = (timestamp: number) => {
            for (const func of animations) func(timestamp)
        }
    }

    removeAnimation(nodeId: number) {
        delete this.#animations[nodeId]
    }

    __collectEvents(block: BaseBlock) {
        for (const key in block.__events) {
            for (const event of block.__events[key]['funcs'])
                this.registerEvent(
                    key,
                    event,
                    block.zIndex() || block.nodeId || 1
                )
        }
    }

    __clearEvents<T>(block: BaseBlock) {
        for (const key in block.__events) {
            for (const event of block.__events[key]['funcs'])
                this.removeEvent(key, event)
        }
    }

    #sortRegisteredDomEvents() {
        for (const key in this.#canvasEvents) {
            const events = this.#canvasEvents[key].events.sort(
                (a, b) => Math.abs(a.zIndex) - Math.abs(b.zIndex)
            )
            this.#buildEventFunc(key, events)
        }
        this.#registerDomEvent()
    }

    // need to fix type: CustomEvent<Event> in register event usage
    registerEvent(event: string, callFunc: CustomEvent<Event>, zIndex: number) {
        if (!this.#canvasEvents[event])
            this.#canvasEvents[event] = { func: undefined, events: [] }

        const funcIncludes = this.#canvasEvents[event].events.filter(
            (i) => i.func == callFunc
        )
        if (funcIncludes.length !== 0 || typeof callFunc !== 'function') return
        this.#canvasEvents[event].events.push({
            func: callFunc,
            zIndex: zIndex,
        })
        const events = this.#canvasEvents[event].events.sort(
            (a, b) => Math.abs(a.zIndex) - Math.abs(b.zIndex)
        )
        this.#buildEventFunc(event, events)
        this.#registerDomEvent()
    }
    removeEvent(event: string, callFunc: CustomEvent<Event>) {
        if (!this.#canvasEvents[event]) return
        const funcIncludes = this.#canvasEvents[event].events.filter(
            (i) => i.func == callFunc
        )
        if (
            (this.#canvasEvents[event] && funcIncludes.length === 0) ||
            typeof callFunc !== 'function'
        )
            return
        this.#canvasEvents[event].events = this.#canvasEvents[
            event
        ].events.filter((i) => i.func !== callFunc)
        const events = this.#canvasEvents[event].events
        this.#buildEventFunc(event, events)
        this.#registerDomEvent()
    }

    #buildEventFunc(eventName: string, events: CanvasEventsFunc[]) {
        this.#canvasEvents[eventName].func = (e: Event) => {
            for (const event of events) event.func(e)
        }
    }
    #registerDomEvent() {
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
    #checkMousePositionInCanvas() {
        this.canvas.addEventListener('mouseleave', (event) => {
            this.invokeChange((b) => {
                b.__disableRunningEvents()
            })
        })
    }

    invokeChange(_func?: (block: Block) => void) {}
    #renderFromCache() {
        if (this.#invokedBlocks.size === 0) return
        this.#cacheInvokedBlocks()
        const ctx = this.context
        if (!ctx) return
        this.clearRect()

        const nodes = this.#tree.nodes
        for (let i = 0, len = nodes.length; i < len; i++) {
            const node = nodes[i]
            if (node.nodeId === undefined) continue
            const bitmap = this.#blocksCanvasCache[node.nodeId]
            if (!bitmap) continue
            const b = node as Block
            ctx.drawImage(
                bitmap,
                b.boundingBox.topLeft.x,
                b.boundingBox.topLeft.y
            )
        }
    }

    #initCacheBlocks() {
        const nodes = this.#tree.nodes
        for (let i = 0, len = nodes.length; i < len; i++) {
            const n = nodes[i] as Block
            if (n.nodeId !== undefined && !this.#blocksCanvasCache[n.nodeId]) {
                this.#createBlocksCache(n)
            }
        }
    }

    #cacheInvokedBlocks() {
        for (const block of this.#invokedBlocks) {
            this.#createBlocksCache(block)
        }
    }

    #createBlocksCache(block: BaseBlock) {
        if (
            block.nodeId === undefined ||
            (block.nodeId && !this.#handledNodes[block.nodeId])
        )
            return

        if (block.__isHidden) {
            const old = this.#blocksCanvasCache[block.nodeId]
            if (old) {
                old.close()
                delete this.#blocksCanvasCache[block.nodeId]
            }
            return
        }

        const old = this.#blocksCanvasCache[block.nodeId]
        if (old) old.close()

        const w = Math.abs(block.realWidth)
        const h = Math.abs(block.realHeight)
        const dummyCanvas = new DummyCanvas(w, h)

        const ctx = dummyCanvas.context
        if (!ctx) return

        block.context = ctx

        ctx.save()
        block.updateBlockCords()
        this.#handleBindOptions(block)
        ctx.translate(
            -block.boundingBox.topLeft.x,
            -block.boundingBox.topLeft.y
        )
        block.render()

        ctx.restore()

        const snapshot = dummyCanvas.transferToImageBitmap()
        if (snapshot) this.#blocksCanvasCache[block.nodeId] = snapshot
    }

    __demandInvoke(block: BaseBlock) {
        this.#invokedBlocks.add(block)
    }

    #render() {
        let lastFrame = 0
        const framer = (timestamp: number) => {
            requestAnimationFrame(framer)
            if (lastFrame === 0) lastFrame = timestamp
            // getting true frame per second
            const delta = timestamp - lastFrame
            const frameDuration = 1000 / this.#defaultOptions.fps
            if (this.#defaultOptions.fps && delta < frameDuration) return
            const obj = Object.entries(this.#animations)
            for (let [nodeId, anime] of obj) {
                const b = this.find({ nodeId: Number(nodeId) })
                anime.func?.(timestamp)
                b[0]?.__invokeChange()
            }
            this.#renderFromCache()
            // cache and render
            const execTime = delta % frameDuration
            lastFrame = timestamp - execTime
            this.#invokedBlocks.clear()
        }
        requestAnimationFrame(framer)
    }

    #sortNodesByZIndex() {
        const sortedNodes = this.#tree.nodes
        if (this.#sortedBy === undefined) {
            this.#tree.nodes = sortedNodes.sort(
                (a: any, b: any) =>
                    a.options.get('zIndex') - b.options.get('zIndex')
            )
            this.#sortedBy = 'zIndex'
        }
    }

    invokeNodeListing() {
        this.#initTime = new Date().getTime()
        this.#tree.preOrderTraversal()
        this.refreshHead()
    }

    refreshHead() {
        this.#sortedBy = undefined
        this.#sortRegisteredDomEvents()
        this.#sortNodesByZIndex()
    }

    takeSnapshot(before: SnapshotObject, after: SnapshotObject) {
        if (this.#defaultOptions.history)
            this.#tree.takeSanpshot(new Date().getTime(), before, after)
    }

    inBoundBlock(block: Block) {
        const x = xIntersect(
            { left: 0, right: this.canvasBounding.width },
            {
                left: Math.min(
                    block.getOptionCurrent('cornerTopLeft')?.x || 0,
                    block.getOptionCurrent('cornerTopRight')?.x || 0,
                    block.getOptionCurrent('cornerBottomLeft')?.x || 0,
                    block.getOptionCurrent('cornerBottomRight')?.x || 0
                ),
                right: Math.max(
                    block.getOptionCurrent('cornerTopLeft')?.x || 0,
                    block.getOptionCurrent('cornerTopRight')?.x || 0,
                    block.getOptionCurrent('cornerBottomLeft')?.x || 0,
                    block.getOptionCurrent('cornerBottomRight')?.x || 0
                ),
            }
        )
        const y = yIntersect(
            { top: 0, bottom: this.canvasBounding.height },
            {
                top: Math.min(
                    block.getOptionCurrent('cornerTopLeft')?.y || 0,
                    block.getOptionCurrent('cornerTopRight')?.y || 0,
                    block.getOptionCurrent('cornerBottomLeft')?.y || 0,
                    block.getOptionCurrent('cornerBottomRight')?.y || 0
                ),
                bottom: Math.max(
                    block.getOptionCurrent('cornerTopLeft')?.y || 0,
                    block.getOptionCurrent('cornerTopRight')?.y || 0,
                    block.getOptionCurrent('cornerBottomLeft')?.y || 0,
                    block.getOptionCurrent('cornerBottomRight')?.y || 0
                ),
            }
        )
        if (x * y <= 0) return false
        return true
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

                    let beforeX = this.currentPosition.x
                    let beforeY = this.currentPosition.y

                    if (event.deltaY < 0) {
                        const scaleFactor =
                            (this.currentPosition.z * scale) /
                            this.currentPosition.z
                        this.currentPosition.x += (x - beforeX) * scaleFactor
                        this.currentPosition.y -= (y - beforeY) * scaleFactor

                        this.invokeChange((block) => {
                            block.__translateX(this.currentPosition.x - beforeX)
                            block.__scale(scale)
                        })
                        this.currentPosition.z *= scale
                    } else {
                        const scaleFactor =
                            (this.currentPosition.z * invScale) /
                            (this.currentPosition.z - 1)
                        this.currentPosition.x -= (x - beforeX) * scaleFactor
                        this.currentPosition.y -= (y - beforeY) * scaleFactor
                        this.invokeChange((block) => {
                            block.__translateX(this.currentPosition.x - beforeX)
                            block.__translateY(this.currentPosition.y - beforeY)
                            block.__scale(invScale)
                        })

                        this.currentPosition.z *= invScale
                    }
                }
            },
            { passive: false }
        )
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

                    let beforeX = this.currentPosition.x
                    let beforeY = this.currentPosition.y
                    const x = this.canvasBounding.right / 2
                    const y = this.canvasBounding.bottom / 2
                    this.invokeChange((block: Block) => {
                        if (event.deltaY < 0) {
                            this.currentPosition.x +=
                                (x - beforeX) *
                                ((this.currentPosition.z * scale) /
                                    this.currentPosition.z -
                                    1)

                            // this.currentPosition.y +=
                            //     y / (this.currentPosition.z * scale) -
                            //     y / this.currentPosition.z;
                            block.__translateX(beforeX - this.currentPosition.x)
                            block.__scale(scale)
                            this.currentPosition.z *= scale
                        } else {
                            this.currentPosition.x +=
                                x / (this.currentPosition.z * invScale) -
                                x / this.currentPosition.z

                            this.currentPosition.y +=
                                y / (this.currentPosition.z * invScale) -
                                y / this.currentPosition.z

                            block.__translateX(this.currentPosition.x - beforeX)
                            block.__translateY(this.currentPosition.y - beforeY)

                            block.__scale(invScale)
                            this.currentPosition.z *= invScale
                        }
                    })
                }
            },
            { passive: false }
        )
    }
    clearRect() {
        this.context?.clearRect(
            0,
            0,
            this.canvasBounding.width,
            this.canvasBounding.height
        )
    }

    changeCursor(cur?: string) {
        cur = cur || 'auto'
        this.currentCursor = cur
        return this.#domCanvas.changeStyle({
            cursor: cur,
        } as any)
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
                            this.invokeChange((block: Block) => {
                                block.__translateX(diffX - beforeX)
                            })
                            this.currentPosition.x += diffX
                            beforeX = diffX
                        }
                        if (diffY !== 0) {
                            this.invokeChange((block: Block) => {
                                block.__translateY(diffY - beforeY)
                            })
                            this.currentPosition.y += diffY
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

    #setCanvasPosition() {
        this.invokeChange((block: Block) => {
            block.__translateX(this.currentPosition.x)
            block.__translateY(this.currentPosition.y)
        })
    }

    #setCanvasZoom() {
        this.invokeChange((block) => {
            block.__scale(this.currentPosition.z)
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
                        this.invokeChange((block: Block) => {
                            if (
                                block.checkInBound(event) &&
                                block.__isOverflowXScrollable
                            ) {
                                block.__overflowTranslateX(moveSpeed)
                                inBound = true
                            } else block.__translateX(moveSpeed)
                        })
                        if (!inBound) this.currentPosition.x += moveSpeed
                    } else {
                        this.invokeChange((block: Block) => {
                            if (
                                block.checkInBound(event) &&
                                block.__isOverflowXScrollable
                            ) {
                                block.__overflowTranslateX(-moveSpeed)
                                inBound = true
                            } else block.__translateX(-moveSpeed)
                        })
                        if (!inBound) this.currentPosition.x -= moveSpeed
                    }
                } else {
                    if (event.deltaY < 0) {
                        this.invokeChange((block: Block) => {
                            if (
                                block.checkInBound(event) &&
                                block.__isOverflowYScrollable
                            ) {
                                block.__overflowTranslateY(moveSpeed)
                                inBound = true
                            } else block.__translateY(moveSpeed)
                        })
                        if (!inBound) this.currentPosition.y += moveSpeed
                    } else {
                        this.invokeChange((block: Block) => {
                            if (
                                block.checkInBound(event) &&
                                block.__isOverflowYScrollable
                            ) {
                                block.__overflowTranslateY(-moveSpeed)
                                inBound = true
                            } else block.__translateY(-moveSpeed)
                        })
                        if (!inBound) this.currentPosition.y -= moveSpeed
                    }
                }
            },
            { passive: false }
        )
    }

    undo() {
        const obj = this.#tree.snapshotInBack()
        this.#invokeHistory(obj)
    }

    redo() {
        const obj = this.#tree.snapshotInFuture()
        this.#invokeHistory(obj)
    }

    #invokeHistory(obj: SnapshotObject) {
        this.invokeChange((b: Block) => {
            if (Object.keys(obj).includes(String(b.nodeId))) {
                for (let [key, value] of Object.entries(obj[b.nodeId!])) {
                    if (key === 'childNodes') {
                        if (b.childNodes.length !== (value as []).length) {
                            if ((value as []).length > b.childNodes.length) {
                                for (let i = 0; i < (value as []).length; i++) {
                                    if (
                                        !(value as Node[]).includes(
                                            b.childNodes[i]
                                        )
                                    ) {
                                        b.__addChildInternal((value as [])[i])
                                        this.#tree.assignNodeId(
                                            (value as [])[i]
                                        )
                                        this.__handleOptions((value as [])[i])
                                    }
                                }
                            } else {
                                for (let i = 0; i < b.childNodes.length; i++) {
                                    if (
                                        !b.childNodes.includes((value as [])[i])
                                    ) {
                                        b.childNodes[i].nodeId = undefined
                                        b.__removeChildInternal(b.childNodes[i])
                                    }
                                }
                            }
                            this.invokeNodeListing()

                            this.invokeChange()
                            return
                        }
                    } else getPrototype(b, key)?.value.call(b, value)
                }
            }
        })
        this.invokeChange()
    }

    #snapshotHandler() {
        window.addEventListener('keydown', (e: KeyboardEvent) => {
            if (!this.#defaultOptions.history || !this.isFocused) return
            if (e.key === 'Z' && e.ctrlKey) this.redo()
            else if (e.key === 'z' && e.ctrlKey) this.undo()
        })
    }
}
