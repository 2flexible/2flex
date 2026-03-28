import { Node } from "./Node";
import { CanvasTree } from "./CanvasTree";
import { CanvasDOMManager } from "./DOMManager";
import { getPrototype, xIntersect, yIntersect } from "./Utils";
import type { Block, IBlockOptions, BlockPayload, Animator } from "./Block";
import type {
    ICssProperties,
    SnapshotObject,
    CustomEvent,
    SnapshotSize,
    inOut,
} from "./types";
import { defaultBlocks } from "./defaultBlocks";

export type Composite =
    | "source-over"
    | "source-in"
    | "source-out"
    | "source-atop"
    | "destination-over"
    | "destination-in"
    | "destination-out"
    | "destination-atop"
    | "lighter"
    | "copy"
    | "xor"
    | "multiply"
    | "screen"
    | "overlay"
    | "darken"
    | "lighten"
    | "color-dodge"
    | "color-burn"
    | "hard-light"
    | "soft-light"
    | "difference"
    | "exclusion"
    | "hue"
    | "saturation"
    | "color"
    | "luminosity";

interface CanvasOptions {
    zoomSpeed?: number;
    zoomInvSpeed?: number;
    moveSpeed?: number;
    zoom?: "center" | "point";
    keyboardMovement?: boolean;
    mouseMovement?: boolean;
    history?: boolean;
    historySize?: SnapshotSize;
    x?: number;
    y?: number;
    z?: number;
    fps?: number;
    alpha?: number;
    composite?: Composite;
}

interface DefaultCanvasOptions
    extends Required<{
        [K in keyof CanvasOptions]-?: CanvasOptions[K];
    }> {}

interface CanvasEvent {
    func?: CustomEvent<Event>;
    events: CustomEvent<Event>[];
}

type CanvasEvents = { [key: string]: CanvasEvent };

interface CanvasPayload {
    canvasId: string;
    width: number;
    height: number;
    options: (CanvasOptions & ICssProperties) | undefined;
}

interface Payload {
    canvas: CanvasPayload;
    blocks: BlockPayload[];
}

interface BlockAnimation {
    animations: Animator[];
    func?: Animator;
}

interface CanvasAnimations {
    [key: string]: BlockAnimation;
}

export class Canvas {
    canvasId: string;
    width: number;
    height: number;
    options?: CanvasOptions & ICssProperties;

    #context?: CanvasRenderingContext2D;
    #htmlCanvas?: HTMLCanvasElement;
    #boundingClient?: DOMRect;

    #domCanvas: CanvasDOMManager;
    #tree: CanvasTree;
    #canvasEvents: CanvasEvents;
    #defaultOptions: DefaultCanvasOptions;
    currentCursor: string;
    #higherBlockZIndex: number;
    #handledNodes: { [key: number]: boolean };
    #initTime?: number;
    #isFocused = false;
    #animations: CanvasAnimations;
    #reservedAnimation?: number;

    __positionCords: { x: number; y: number; z: number };

    constructor(
        canvasId?: string,
        width?: number,
        height?: number,
        options?: CanvasOptions & ICssProperties
    ) {
        this.canvasId = canvasId || "canvas";
        this.options = options;
        this.width = width || 300;
        this.height = height || 300;

        this.currentCursor = "auto";
        this.#higherBlockZIndex = 0;
        this.#handledNodes = {};
        this.#canvasEvents = {};
        this.#defaultOptions = {
            history: true,
            historySize: 100,
            zoom: "center",
            zoomSpeed: 1.2,
            zoomInvSpeed: 0.8,
            moveSpeed: 10,
            keyboardMovement: true,
            mouseMovement: true,
            x: 0,
            y: 0,
            z: 1,
            fps: 60,
            composite: "source-over",
            alpha: 1.0,
        };
        this.#animations = {};

        this.__positionCords = { x: 0, y: 0, z: 1 };

        if (this.options) this.setOptions();
        this.#tree = new CanvasTree(this.#defaultOptions.historySize);

        this.#domCanvas = new CanvasDOMManager(
            this.canvasId,
            this.width,
            this.height
        );
        this.#initTime = new Date().getTime();
        this.#initCanvas();
    }

    get context(): CanvasRenderingContext2D {
        if (!this.#context) this.#context = this.#domCanvas.context;
        return this.#context;
    }

    get canvas(): HTMLCanvasElement {
        if (!this.#htmlCanvas) this.#htmlCanvas = this.#domCanvas.canvas;
        return this.#htmlCanvas;
    }

    setOptions() {
        if (this.options?.history)
            this.#defaultOptions.history = this.options.history;
        if (this.options?.zoom) this.#defaultOptions.zoom = this.options.zoom;
        if (this.options?.zoomSpeed)
            this.#defaultOptions.zoomSpeed = this.options.zoomSpeed;

        if (this.options?.zoomInvSpeed)
            this.#defaultOptions.zoomInvSpeed = this.options.zoomInvSpeed;
        if (this.options?.moveSpeed)
            this.#defaultOptions.moveSpeed = this.options.moveSpeed;
        if (this.options?.keyboardMovement)
            this.#defaultOptions.keyboardMovement =
                this.options.keyboardMovement;
        if (this.options?.mouseMovement)
            this.#defaultOptions.mouseMovement = this.options.mouseMovement;
        if (this.options?.x) this.#defaultOptions.x = this.options.x;
        if (this.options?.y) this.#defaultOptions.y = this.options.y;
        if (this.options?.z) this.#defaultOptions.z = this.options.z;
        if (this.options?.fps) this.#defaultOptions.fps = this.options.fps;
        if (this.options?.historySize)
            this.#defaultOptions.historySize = this.options.historySize;

        this.__positionCords = {
            x: this.#defaultOptions.x,
            y: this.#defaultOptions.y,
            z: this.#defaultOptions.z,
        };
    }

    #initCanvas() {
        this.canvas;
        this.context.save();

        window.onload = () => {
            if (this.options) {
                this.context.globalCompositeOperation =
                    this.options.composite ||
                    (this.#defaultOptions
                        .composite as GlobalCompositeOperation);
                this.context.globalAlpha =
                    this.options.alpha || this.#defaultOptions.alpha;

                let styleOptions: { [key: string]: string | number } = {};
                for (let [key, value] of Object.entries(this.options)) {
                    if (!Object.hasOwn(this.#defaultOptions, key))
                        styleOptions[key] = value;
                }
                this.#domCanvas.changeStyle(this.options);
            }
            if (this.#defaultOptions.history) this.#snapshotHandler();
            if (this.#defaultOptions.mouseMovement) this.#handMove();
            if (this.#defaultOptions.keyboardMovement) this.#keyboardMove();
            if (this.#defaultOptions.zoom == "point") this.#pointZoom();
            else if (this.#defaultOptions.zoom == "center") this.#centerZoom();
            this.canvas.addEventListener("focusin", () => {
                this.#isFocused = true;
            });
            this.canvas.addEventListener("focusout", () => {
                this.#isFocused = false;
            });
            this.#setCanvasPosition();
            this.#setCanvasZoom();
        };
    }
    add(...block: Block[]) {
        this.#tree.addNodes(block);
        this.#initTime = new Date().getTime();
        this.#tree.preOrderTraversal<Block>((b: Block) => {
            if (!this.#handledNodes[b.nodeId!]) {
                this.__handleOptions(b);
                this.__collectEvents(b);
                this.__collectAnimations(b);
                this.__takeInitSnaphshot(b);
                b.__initCordinates();
                b.__hidden = !this.inBoundElement(b);
                b.render();
            }
        });
        this.#registerDomEvent();
    }

    remove(block: Block) {
        this.#tree.head.removeChild(block);
        this.__clearEvents(block);
        this.__clearAnimations(block);
        this.invokeNodeListing();
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
        };
        this.#tree.head.listOnlyChilds((block: Block) => {
            payload.blocks.push(block.generatePayload());
        });
        return JSON.stringify(payload);
    }

    load(payload: string) {
        const parsedPayload = JSON.parse(payload) as Payload;
        const canvasOpt = parsedPayload.canvas;
        this.canvasId = canvasOpt.canvasId;
        this.options = canvasOpt.options;
        this.width = canvasOpt.width;
        this.height = canvasOpt.height;
        if (this.options) this.setOptions();
        this.#initCanvas();

        const blocks = parsedPayload.blocks;
        const constructedBlocks: Block[] = [];

        const checkBlock = (block: BlockPayload) => {
            const exists = this.find({ nodeId: block.nodeId });
            const childs: Block[] = [];
            let foundBlock;
            if (exists && exists[0]) {
                foundBlock = exists[0];
            } else {
                const found = defaultBlocks.filter(
                    (b) => b.name === block.name
                );
                let invokeClass = found[0];
                if (invokeClass)
                    if (block.additionalParams.length !== 0)
                        foundBlock = new invokeClass(
                            ...block.additionalParams,
                            block.options || {}
                        );
                    else {
                        foundBlock = new invokeClass(block.options || {});
                    }
            }
            foundBlock.ownOptions = block.ownOptions || block.options;
            if (block.childs?.length !== 0)
                for (let i = 0, len = block.childs!.length; i < len; i++) {
                    const childBlock = checkBlock(block.childs![i]);
                    if (childBlock) childs.push(childBlock);
                }
            foundBlock.addChild(...childs);
            return foundBlock;
        };

        for (let i = 0, len = blocks.length; i < len; i++) {
            const b = checkBlock(blocks[i]);
            if (b) constructedBlocks.push(b);
        }
        this.add(...constructedBlocks);
    }

    find(queries: IBlockOptions): Block[] {
        let blocks: Block[] = [];
        this.#tree.head.listAllChilds((block: Block) => {
            for (const [k, v] of Object.entries(queries)) {
                if (
                    block.ownOptions[k] === v ||
                    (k === "nodeId" && block.nodeId === v)
                )
                    blocks.push(block);
            }
        });
        return blocks;
    }

    get canvasBounding() {
        if (!this.#boundingClient)
            this.#boundingClient = this.canvas.getBoundingClientRect();
        return this.#boundingClient;
    }

    get isFocused() {
        return this.#isFocused;
    }

    getCursorPosition(event: { clientX: number; clientY: number }) {
        return {
            x: event.clientX - this.canvasBounding.left,
            y: event.clientY - this.canvasBounding.top,
        };
    }

    whoIsTheFirst(zIndex?: number) {
        return this.#higherBlockZIndex === zIndex;
    }

    registerZIndex(inOutZ: inOut) {
        let inBlock = inOutZ["in"];
        let outBlock = inOutZ["out"];
        if (inBlock && inBlock > this.#higherBlockZIndex) {
            this.#higherBlockZIndex = inBlock;
        } else if (outBlock && outBlock === this.#higherBlockZIndex) {
            this.#higherBlockZIndex = 0;
        }
    }

    __handleOptions(block: Block): void {
        if (!block.ownOptions || this.#handledNodes[block.nodeId!]) return;
        block.canvas = this;
        this.#handleBindOptions(block);
        for (const [key, value] of Object.entries(block.ownOptions)) {
            getPrototype(block, key)?.value.call(block, value);
        }
        if (block.zIndex() === undefined) {
            block.ownOptions.zIndex = block.nodeId;
        }
        this.#handledNodes[block.nodeId!] = true;
    }

    #handleBindOptions(block: Block) {
        if (block.__bindOptions.length !== 0) {
            for (const opt of block.__bindOptions) {
                for (const key of opt.options) {
                    getPrototype(block, key as string)?.value.call(
                        block,
                        opt.bindTo.ownOptions[key]
                    );
                }
            }
        }
    }

    __takeInitSnaphshot(block: Block) {
        const dummy: any = {};
        dummy[block.nodeId!] = { ...block.ownOptions };
        this.#tree.takeSanpshot(this.#initTime!, null, dummy);
    }

    __takeBlockSnapshot<T>(parentBlock: Block<T>, before: any) {
        const after: any = {};
        after[parentBlock.nodeId!] = {
            childNodes: [...parentBlock.childNodes],
        };
        this.#tree.takeSanpshot(this.#initTime!, before, after);
    }

    __collectAnimations(block: Block) {
        for (const func of block.__animations) {
            this.registerAnimation(String(block.nodeId), func);
        }
    }

    __clearAnimations(block: Block) {
        this.removeAnimation(String(block.nodeId));
    }

    registerAnimation(nodeId: string, func: Animator) {
        if (!this.#animations[nodeId])
            this.#animations[nodeId] = { animations: [] };
        this.#animations[nodeId].animations.push(func);
        this.#buildAnimatonFunc(nodeId, this.#animations[nodeId].animations);
        this.#handleAnimation();
    }

    #buildAnimatonFunc(nodeId: string, animations: Animator[]) {
        this.#animations[nodeId].func = (timestamp: number) => {
            for (const func of animations) func(timestamp);
        };
    }

    removeAnimation(nodeId: string) {
        delete this.#animations[nodeId];
        this.#handleAnimation();
    }

    __collectEvents(block: Block) {
        for (const key in block.__events) {
            for (const event of block.__events[key]["funcs"])
                this.registerEvent(key, event);
        }
    }

    __clearEvents<T>(block: Block<T>) {
        for (const key in block.__events) {
            for (const event of block.__events[key]["funcs"])
                this.removeEvent(key, event);
        }
    }

    registerEvent(event: string, callFunc: CustomEvent<Event>) {
        if (!this.#canvasEvents[event])
            this.#canvasEvents[event] = { func: undefined, events: [] };
        if (
            this.#canvasEvents[event].events.includes(callFunc) ||
            typeof callFunc !== "function"
        )
            return;
        this.#canvasEvents[event].events.push(callFunc);
        const events = this.#canvasEvents[event].events;
        this.#buildEventFunc(event, events);
    }
    removeEvent(event: string, callFunc: CustomEvent<Event>) {
        if (
            (this.#canvasEvents[event] &&
                !this.#canvasEvents[event].events.includes(callFunc)) ||
            typeof callFunc !== "function"
        )
            return;
        this.#canvasEvents[event].events = this.#canvasEvents[
            event
        ].events.filter((i) => i !== callFunc);
        const events = this.#canvasEvents[event].events;
        this.#buildEventFunc(event, events);
    }

    #buildEventFunc(event: string, events: CustomEvent<Event>[]) {
        this.#canvasEvents[event].func = (e: Event) => {
            for (const func of events) func(e);
        };
    }
    #registerDomEvent() {
        for (const key in this.#canvasEvents) {
            const func = this.#canvasEvents[key].func as CustomEvent<Event>;
            if (func !== undefined) {
                const eventFunc = this.#domCanvas.getListener(key);
                if (eventFunc && !eventFunc.includes(func)) {
                    for (let i = 0, len = eventFunc.length; i < len; i++) {
                        this.#domCanvas.removeEventListener(key, eventFunc[i]);
                    }
                }
                this.#domCanvas.addEventListener(key, func);
                this.#canvasEvents[key].func = undefined;
            }
        }
    }
    invokeChange(_func?: (block: Block) => void) {
        this.context.restore();
        this.context.save();
        this.clearRect();
        this.#registerDomEvent();
        this.#tree.head.listOnlyChilds(
            (b: Block) => {
                if (this.#handledNodes[b.nodeId!]) {
                    this.#handleBindOptions(b);
                    if (_func) _func(b);
                    b.__hidden = !this.inBoundElement(b);
                    b.render();
                }
            },
            "zIndex",
            this.#tree.nodes
        );
    }

    invokeNodeListing() {
        this.#initTime = new Date().getTime();
        this.#tree.preOrderTraversal<Block>();
    }

    refreshHead() {
        this.#tree.head.resetSort();
    }

    takeSnapshot(before: SnapshotObject, after: SnapshotObject) {
        if (this.#defaultOptions.history)
            this.#tree.takeSanpshot(new Date().getTime(), before, after);
    }

    inBoundElement(element: Block) {
        const x = xIntersect(
            { left: 0, right: this.canvasBounding.width },
            {
                left: Math.min(
                    element.ownOptions.cornerTopLeft?.x || 0,
                    element.ownOptions.cornerTopRight?.x || 0,
                    element.ownOptions.cornerBottomLeft?.x || 0,
                    element.ownOptions.cornerBottomRight?.x || 0
                ),
                right: Math.max(
                    element.ownOptions.cornerTopLeft?.x || 0,
                    element.ownOptions.cornerTopRight?.x || 0,
                    element.ownOptions.cornerBottomLeft?.x || 0,
                    element.ownOptions.cornerBottomRight?.x || 0
                ),
            }
        );
        const y = yIntersect(
            { top: 0, bottom: this.canvasBounding.height },
            {
                top: Math.min(
                    element.ownOptions.cornerTopLeft?.y || 0,
                    element.ownOptions.cornerTopRight?.y || 0,
                    element.ownOptions.cornerBottomLeft?.y || 0,
                    element.ownOptions.cornerBottomRight?.y || 0
                ),
                bottom: Math.max(
                    element.ownOptions.cornerTopLeft?.y || 0,
                    element.ownOptions.cornerTopRight?.y || 0,
                    element.ownOptions.cornerBottomLeft?.y || 0,
                    element.ownOptions.cornerBottomRight?.y || 0
                ),
            }
        );
        if (x * y <= 0) return false;
        return true;
    }

    #handleAnimation() {
        if (
            Object.entries(this.#animations).length !== 0 &&
            this.#reservedAnimation === undefined
        )
            this.animationInvoker();
        else if (
            Object.entries(this.#animations).length === 0 &&
            this.#reservedAnimation !== undefined
        ) {
            cancelAnimationFrame(this.#reservedAnimation);
        }
    }

    animationInvoker() {
        let lastFrame = 0;
        const framer = (timestamp: number) => {
            const obj = Object.entries(this.#animations);
            if (obj.length === 0) return;
            requestAnimationFrame(framer);
            // getting true frame per second
            const delta = timestamp - lastFrame;
            if (lastFrame && delta < this.#defaultOptions.fps / 1000) return;
            for (let [nodeId, anime] of obj) {
                anime.func?.(timestamp);
            }
            const execTime = delta % this.#defaultOptions.fps;
            lastFrame = timestamp - execTime;
            this.invokeChange();
        };
        this.#reservedAnimation = requestAnimationFrame(framer);
    }
    #pointZoom() {
        window.addEventListener(
            "wheel",
            (event: WheelEvent) => {
                if (this.#defaultOptions.zoom !== "point" || !this.#isFocused)
                    return;
                if (event.ctrlKey) {
                    event.preventDefault();
                    const { x, y } = this.getCursorPosition(event);

                    let scale = this.#defaultOptions.zoomSpeed;
                    let invScale = this.#defaultOptions.zoomInvSpeed;

                    let beforeX = this.__positionCords.x;
                    let beforeY = this.__positionCords.y;

                    if (event.deltaY < 0) {
                        const scaleFactor =
                            (this.__positionCords.z * scale) /
                            this.__positionCords.z;
                        this.__positionCords.x += (x - beforeX) * scaleFactor;
                        this.__positionCords.y -= (y - beforeY) * scaleFactor;

                        this.invokeChange((block) => {
                            block.__translate({
                                x: this.__positionCords.x - beforeX,
                                y: 0,
                            });
                            block.scale(scale);
                        });
                        this.__positionCords.z *= scale;
                    } else {
                        const scaleFactor =
                            (this.__positionCords.z * invScale) /
                            (this.__positionCords.z - 1);
                        this.__positionCords.x -= (x - beforeX) * scaleFactor;
                        this.__positionCords.y -= (y - beforeY) * scaleFactor;
                        this.invokeChange((block) => {
                            block.__translate({
                                x: this.__positionCords.x - beforeX,
                                y: this.__positionCords.y - beforeY,
                            });
                            block.scale(invScale);
                        });

                        this.__positionCords.z *= invScale;
                    }
                }
            },
            { passive: false }
        );
    }

    #centerZoom() {
        window.addEventListener(
            "wheel",
            (event: WheelEvent) => {
                if (this.#defaultOptions.zoom !== "center" || !this.#isFocused)
                    return;
                event.preventDefault();
                if (event.ctrlKey) {
                    let scale = this.#defaultOptions.zoomSpeed;
                    let invScale = this.#defaultOptions.zoomInvSpeed;

                    let beforeX = this.__positionCords.x;
                    let beforeY = this.__positionCords.y;
                    const x = this.canvasBounding.right / 2;
                    const y = this.canvasBounding.bottom / 2;
                    this.invokeChange((block: Block) => {
                        if (event.deltaY < 0) {
                            this.__positionCords.x +=
                                (x - beforeX) *
                                ((this.__positionCords.z * scale) /
                                    this.__positionCords.z -
                                    1);

                            console.log(this.__positionCords.x);
                            // this.__positionCords.y +=
                            //     y / (this.__positionCords.z * scale) -
                            //     y / this.__positionCords.z;
                            block.__translate({
                                x: beforeX - this.__positionCords.x,
                                y: 0,
                            });
                            block.scale(scale);
                            this.__positionCords.z *= scale;
                        } else {
                            this.__positionCords.x +=
                                x / (this.__positionCords.z * invScale) -
                                x / this.__positionCords.z;

                            this.__positionCords.y +=
                                y / (this.__positionCords.z * invScale) -
                                y / this.__positionCords.z;

                            block.__translate({
                                x: this.__positionCords.x - beforeX,
                                y: this.__positionCords.y - beforeY,
                            });
                            block.scale(invScale);
                            this.__positionCords.z *= invScale;
                        }
                    });
                }
            },
            { passive: false }
        );
    }
    clearRect() {
        this.context.clearRect(0, 0, this.width, this.height);
    }

    changeCursor(cur?: string) {
        cur = cur || "auto";
        this.currentCursor = cur;
        return this.#domCanvas.changeStyle({
            cursor: cur,
        } as any);
    }

    #handMove() {
        let initX = 0;
        let initY = 0;
        let beforeX = 0;
        let beforeY = 0;
        let isMouseDown = false;
        let isKeyDown = false;

        window.addEventListener("keydown", (event) => {
            if (!this.#defaultOptions.mouseMovement) return;
            if (event.code == "Space") {
                if (!isKeyDown) {
                    (this.#domCanvas as any).changeStyle({ cursor: "grab" });
                    isKeyDown = true;
                }
            }
        });

        window.addEventListener(
            "mousemove",
            (event: MouseEvent) => {
                if (!this.#defaultOptions.mouseMovement || !this.#isFocused)
                    return;
                event.preventDefault();

                if (event.buttons == 0) {
                    isMouseDown = false;
                    if (isKeyDown)
                        (this.#domCanvas as any).changeStyle({
                            cursor: "grab",
                        });
                }

                if (event.buttons == 1 && isKeyDown) {
                    if (!isMouseDown) {
                        initX = event.clientX;
                        initY = event.clientY;
                        beforeX = 0;
                        beforeY = 0;
                        isMouseDown = true;
                    }
                    if (isMouseDown) {
                        (this.#domCanvas as any).changeStyle({
                            cursor: "grabbing",
                        });
                        let diffX = event.clientX - initX;
                        let diffY = event.clientY - initY;
                        if (diffX !== 0) {
                            this.invokeChange((block: Block) => {
                                block.__translate({ x: diffX - beforeX, y: 0 });
                            });
                            this.__positionCords.x += diffX;
                            beforeX = diffX;
                        }
                        if (diffY !== 0) {
                            this.invokeChange((block: Block) => {
                                block.__translate({ x: 0, y: diffY - beforeY });
                            });
                            this.__positionCords.y += diffY;
                            beforeY = diffY;
                        }
                    }
                }
            },
            { passive: false }
        );

        window.addEventListener("keyup", (event) => {
            if (!this.#defaultOptions.mouseMovement) return;
            (this.#domCanvas as any).changeStyle({ cursor: "auto" });
            isKeyDown = false;
        });
    }

    #setCanvasPosition() {
        this.invokeChange((block: Block) => {
            block.__translate({
                x: block.x() + this.__positionCords.x,
                y: block.y() + this.__positionCords.y,
            });
        });
    }

    #setCanvasZoom() {
        this.invokeChange((block) => {
            block.scale(this.#defaultOptions.z);
        });
    }

    #keyboardMove() {
        const moveSpeed = this.#defaultOptions.moveSpeed;
        window.addEventListener(
            "wheel",
            (event: WheelEvent) => {
                if (!this.#defaultOptions.keyboardMovement || !this.#isFocused)
                    return;
                if (event.ctrlKey) return;
                event.preventDefault();
                let inBound = false;
                if (event.shiftKey) {
                    if (event.deltaY < 0) {
                        this.invokeChange((block: Block) => {
                            if (
                                block.checkInBound(event) &&
                                block.isOverflowXScroll
                            ) {
                                block.__overflowTranslate({
                                    x: -moveSpeed,
                                    y: 0,
                                });
                                inBound = true;
                            } else block.__translate({ x: -moveSpeed, y: 0 });
                        });
                        if (!inBound) this.__positionCords.x -= moveSpeed;
                    } else {
                        this.invokeChange((block: Block) => {
                            if (
                                block.checkInBound(event) &&
                                block.isOverflowXScroll
                            ) {
                                block.__overflowTranslate({
                                    x: moveSpeed,
                                    y: 0,
                                });
                                inBound = true;
                            } else block.__translate({ x: moveSpeed, y: 0 });
                        });
                        if (!inBound) this.__positionCords.x += moveSpeed;
                    }
                } else {
                    if (event.deltaY < 0) {
                        this.invokeChange((block: Block) => {
                            if (
                                block.checkInBound(event) &&
                                block.isOverflowYScroll
                            ) {
                                block.__overflowTranslate({
                                    x: 0,
                                    y: moveSpeed,
                                });
                                inBound = true;
                            } else block.__translate({ x: 0, y: moveSpeed });
                        });
                        if (!inBound) this.__positionCords.y += moveSpeed;
                    } else {
                        this.invokeChange((block: Block) => {
                            if (
                                block.checkInBound(event) &&
                                block.isOverflowYScroll
                            ) {
                                block.__overflowTranslate({
                                    x: 0,
                                    y: -moveSpeed,
                                });
                                inBound = true;
                            } else block.__translate({ x: 0, y: -moveSpeed });
                        });
                        if (!inBound) this.__positionCords.y -= moveSpeed;
                    }
                }
            },
            { passive: false }
        );
    }

    undo() {
        const obj = this.#tree.snapshotInBack();
        console.log(obj);
        this.#invokeHistory(obj);
    }

    redo() {
        const obj = this.#tree.snapshotInFuture();
        this.#invokeHistory(obj);
    }

    #invokeHistory(obj: SnapshotObject) {
        this.invokeChange((b: Block) => {
            if (Object.keys(obj).includes(String(b.nodeId))) {
                for (let [key, value] of Object.entries(obj[b.nodeId!])) {
                    if (key === "childNodes") {
                        if (b.childNodes.length !== (value as []).length) {
                            if ((value as []).length > b.childNodes.length) {
                                for (let i = 0; i < (value as []).length; i++) {
                                    if (
                                        !(value as Node[]).includes(
                                            b.childNodes[i]
                                        )
                                    ) {
                                        b.__addChildInternal((value as [])[i]);
                                        this.#tree.assignNodeId(
                                            (value as [])[i]
                                        );
                                        this.__handleOptions((value as [])[i]);
                                    }
                                }
                            } else {
                                for (let i = 0; i < b.childNodes.length; i++) {
                                    if (
                                        !b.childNodes.includes((value as [])[i])
                                    ) {
                                        b.childNodes[i].nodeId = undefined;
                                        b.__removeChildInternal(
                                            b.childNodes[i]
                                        );
                                    }
                                }
                            }
                            this.invokeNodeListing();

                            this.invokeChange();
                            return;
                        }
                    } else getPrototype(b, key)?.value.call(b, value);
                }
            }
        });
        this.invokeChange();
    }

    #snapshotHandler() {
        window.addEventListener("keydown", (e: KeyboardEvent) => {
            if (!this.#defaultOptions.history || !this.#isFocused) return;
            if (e.key === "Z" && e.ctrlKey) this.redo();
            else if (e.key === "z" && e.ctrlKey) this.undo();
        });
    }
}
