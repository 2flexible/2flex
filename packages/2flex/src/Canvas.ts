import { Node } from './Node'
import { CanvasTree } from './CanvasTree'
import { CanvasDOMManager } from './DOMManager'
import { getPrototype, xIntersect, yIntersect } from './Utils'
import type { Block, IBlockOptions, BlockPayload, Animator } from './Block'
import type {
    ICssProperties,
    SnapshotObject,
    CustomEvent,
    SnapshotSize,
    inOut,
} from './types'
import { defaultBlocks } from './defaultBlocks'

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

    currentPosition: { x: number; y: number; z: number }

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
            fps: 60,
        }
        this.#animations = {}

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
        this.#initCanvas()
        this.#checkMousePositionInCanvas()
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
    add(...block: Block<any>[]) {
        this.#tree.addNodes(block)
        this.#initTime = new Date().getTime()
        this.#tree.preOrderTraversal<Block>((b: Block) => {
            if (b.nodeId && !this.#handledNodes[b.nodeId]) {
                this.__handleOptions(b)
                this.__collectEvents(b)
                this.__collectAnimations(b)
                this.__takeInitSnaphshot(b)
                b.__initCordinates()
                b.__hidden = !this.inBoundBlock(b)
                b.render()
            }
        })
    }

    remove(block: Block<any>) {
        this.#tree.head.removeChild(block)
        this.__clearEvents(block)
        this.__clearAnimations(block)
        this.invokeNodeListing()
        // @Todo: take snapshot for this
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
        const constructedBlocks: Block<any>[] = []

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
            foundBlock.ownOptions = block.ownOptions || block.options
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
                    block.ownOptions[k] === v ||
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

    whoIsTheFirst(zIndex: number) {
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

    __handleOptions(block: Block): void {
        if (
            !block.nodeId ||
            !block.ownOptions ||
            (block.nodeId && this.#handledNodes[block.nodeId])
        )
            return
        block.canvas = this
        this.#handleBindOptions(block)
        for (const [key, value] of Object.entries(block.ownOptions)) {
            getPrototype(block, key)?.value.call(block, value)
        }
        if (block.zIndex() === undefined) {
            block.ownOptions.zIndex = block.nodeId
        }
        this.#handledNodes[block.nodeId] = true
    }

    #handleBindOptions(block: Block) {
        if (block.__bindOptions.length !== 0) {
            for (const opt of block.__bindOptions) {
                for (const key of opt.options) {
                    getPrototype(block, key as string)?.value.call(
                        block,
                        opt.bindTo.ownOptions[key]
                    )
                }
            }
        }
    }

    __takeInitSnaphshot(block: Block) {
        const dummy: any = {}
        dummy[block.nodeId!] = { ...block.ownOptions }
        this.#tree.takeSanpshot(this.#initTime!, null, dummy)
    }

    __takeBlockSnapshot<T>(parentBlock: Block<T>, before: any) {
        const after: any = {}
        after[parentBlock.nodeId!] = {
            childNodes: [...parentBlock.childNodes],
        }
        this.#tree.takeSanpshot(this.#initTime!, before, after)
    }

    __collectAnimations(block: Block) {
        for (const func of block.__animations) {
            if (block.nodeId) this.registerAnimation(block.nodeId, func)
        }
    }

    __clearAnimations(block: Block) {
        if (block.nodeId) this.removeAnimation(block.nodeId)
    }

    registerAnimation(nodeId: number, func: Animator) {
        if (!this.#animations[nodeId])
            this.#animations[nodeId] = { animations: [] }
        this.#animations[nodeId].animations.push(func)
        this.#buildAnimatonFunc(nodeId, this.#animations[nodeId].animations)
        this.#handleAnimation()
    }

    #buildAnimatonFunc(nodeId: number, animations: Animator[]) {
        this.#animations[nodeId].func = (timestamp: number) => {
            for (const func of animations) func(timestamp)
        }
    }

    removeAnimation(nodeId: number) {
        delete this.#animations[nodeId]
        this.#handleAnimation()
    }

    __collectEvents(block: Block) {
        for (const key in block.__events) {
            for (const event of block.__events[key]['funcs'])
                this.registerEvent(
                    key,
                    event,
                    block.zIndex() || block.nodeId || 1
                )
        }
    }

    __clearEvents<T>(block: Block<T>) {
        for (const key in block.__events) {
            for (const event of block.__events[key]['funcs'])
                this.removeEvent(key, event)
        }
    }

    #sortRegisteredDomEvents() {
        for (const key in this.#canvasEvents) {
            const events = this.#canvasEvents[key].events.sort(
                (a, b) => a.zIndex - b.zIndex
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
            (a, b) => a.zIndex - b.zIndex
        )
        this.#buildEventFunc(event, events)
        this.#registerDomEvent()
    }
    removeEvent(event: string, callFunc: CustomEvent<Event>) {
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
    }

    #buildEventFunc(event: string, events: CanvasEventsFunc[]) {
        this.#canvasEvents[event].func = (e: Event) => {
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
                b.resetRunningEvents()
            })
        })
    }

    invokeChange(_func?: (block: Block<any>) => void) {
        this.context?.restore()
        this.context?.save()
        this.clearRect()
        this.#tree.head.listOnlyChilds(
            (b: Block<any>) => {
                if (this.#handledNodes[b.nodeId!]) {
                    this.#handleBindOptions(b)
                    if (_func) _func(b)
                    b.__hidden = !this.inBoundBlock(b)
                    b.render()
                }
            },
            'zIndex',
            this.#tree.nodes
        )
    }

    invokeNodeListing() {
        this.#initTime = new Date().getTime()
        this.#tree.preOrderTraversal<Block>()
    }

    refreshHead() {
        this.#tree.head.resetSort()
        this.#sortRegisteredDomEvents()
    }

    takeSnapshot(before: SnapshotObject, after: SnapshotObject) {
        if (this.#defaultOptions.history)
            this.#tree.takeSanpshot(new Date().getTime(), before, after)
    }

    inBoundBlock(block: Block<any>) {
        const x = xIntersect(
            { left: 0, right: this.canvasBounding.width },
            {
                left: Math.min(
                    block.ownOptions.cornerTopLeft?.x || 0,
                    block.ownOptions.cornerTopRight?.x || 0,
                    block.ownOptions.cornerBottomLeft?.x || 0,
                    block.ownOptions.cornerBottomRight?.x || 0
                ),
                right: Math.max(
                    block.ownOptions.cornerTopLeft?.x || 0,
                    block.ownOptions.cornerTopRight?.x || 0,
                    block.ownOptions.cornerBottomLeft?.x || 0,
                    block.ownOptions.cornerBottomRight?.x || 0
                ),
            }
        )
        const y = yIntersect(
            { top: 0, bottom: this.canvasBounding.height },
            {
                top: Math.min(
                    block.ownOptions.cornerTopLeft?.y || 0,
                    block.ownOptions.cornerTopRight?.y || 0,
                    block.ownOptions.cornerBottomLeft?.y || 0,
                    block.ownOptions.cornerBottomRight?.y || 0
                ),
                bottom: Math.max(
                    block.ownOptions.cornerTopLeft?.y || 0,
                    block.ownOptions.cornerTopRight?.y || 0,
                    block.ownOptions.cornerBottomLeft?.y || 0,
                    block.ownOptions.cornerBottomRight?.y || 0
                ),
            }
        )
        if (x * y <= 0) return false
        return true
    }

    #handleAnimation() {
        if (
            Object.entries(this.#animations).length !== 0 &&
            this.#reservedAnimation === undefined
        )
            this.#animationInvoker()
        else if (
            Object.entries(this.#animations).length === 0 &&
            this.#reservedAnimation !== undefined
        ) {
            cancelAnimationFrame(this.#reservedAnimation)
        }
    }

    #animationInvoker() {
        let lastFrame = 0
        const framer = (timestamp: number) => {
            const obj = Object.entries(this.#animations)
            if (obj.length === 0) return
            requestAnimationFrame(framer)
            // getting true frame per second
            const delta = timestamp - lastFrame
            if (lastFrame && delta < this.#defaultOptions.fps / 1000) return
            for (let [nodeId, anime] of obj) {
                anime.func?.(timestamp)
            }
            const execTime = delta % this.#defaultOptions.fps
            lastFrame = timestamp - execTime
            this.invokeChange()
        }
        this.#reservedAnimation = requestAnimationFrame(framer)
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
                            block.__translate({
                                x: this.currentPosition.x - beforeX,
                                y: 0,
                            })
                            block.scale(scale)
                        })
                        this.currentPosition.z *= scale
                    } else {
                        const scaleFactor =
                            (this.currentPosition.z * invScale) /
                            (this.currentPosition.z - 1)
                        this.currentPosition.x -= (x - beforeX) * scaleFactor
                        this.currentPosition.y -= (y - beforeY) * scaleFactor
                        this.invokeChange((block) => {
                            block.__translate({
                                x: this.currentPosition.x - beforeX,
                                y: this.currentPosition.y - beforeY,
                            })
                            block.scale(invScale)
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

                            console.log(this.currentPosition.x)
                            // this.currentPosition.y +=
                            //     y / (this.currentPosition.z * scale) -
                            //     y / this.currentPosition.z;
                            block.__translate({
                                x: beforeX - this.currentPosition.x,
                                y: 0,
                            })
                            block.scale(scale)
                            this.currentPosition.z *= scale
                        } else {
                            this.currentPosition.x +=
                                x / (this.currentPosition.z * invScale) -
                                x / this.currentPosition.z

                            this.currentPosition.y +=
                                y / (this.currentPosition.z * invScale) -
                                y / this.currentPosition.z

                            block.__translate({
                                x: this.currentPosition.x - beforeX,
                                y: this.currentPosition.y - beforeY,
                            })
                            block.scale(invScale)
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
                                block.__translate({ x: diffX - beforeX, y: 0 })
                            })
                            this.currentPosition.x += diffX
                            beforeX = diffX
                        }
                        if (diffY !== 0) {
                            this.invokeChange((block: Block) => {
                                block.__translate({ x: 0, y: diffY - beforeY })
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
            block.__translate({
                x: this.currentPosition.x,
                y: this.currentPosition.y,
            })
        })
    }

    #setCanvasZoom() {
        this.invokeChange((block) => {
            block.scale(this.currentPosition.z)
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
                                block.__overflowTranslate({
                                    x: moveSpeed,
                                    y: 0,
                                })
                                inBound = true
                            } else block.__translate({ x: moveSpeed, y: 0 })
                        })
                        if (!inBound) this.currentPosition.x += moveSpeed
                    } else {
                        this.invokeChange((block: Block) => {
                            if (
                                block.checkInBound(event) &&
                                block.__isOverflowXScrollable
                            ) {
                                block.__overflowTranslate({
                                    x: -moveSpeed,
                                    y: 0,
                                })
                                inBound = true
                            } else block.__translate({ x: -moveSpeed, y: 0 })
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
                                block.__overflowTranslate({
                                    x: 0,
                                    y: moveSpeed,
                                })
                                inBound = true
                            } else block.__translate({ x: 0, y: moveSpeed })
                        })
                        if (!inBound) this.currentPosition.y += moveSpeed
                    } else {
                        this.invokeChange((block: Block) => {
                            if (
                                block.checkInBound(event) &&
                                block.__isOverflowYScrollable
                            ) {
                                block.__overflowTranslate({
                                    x: 0,
                                    y: -moveSpeed,
                                })
                                inBound = true
                            } else block.__translate({ x: 0, y: -moveSpeed })
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
