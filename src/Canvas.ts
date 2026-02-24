import { Tree, Node } from "./Tree";
import { CanvasDOMManager } from "./DOMManager";
import { getPrototype, xIntersect, yIntersect } from "./Utils";
import type { Block, IBlockOptions } from "./Block";
import type { ICssProperties, SnapshotObject, CustomEvent } from "./types";

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
    fps: number;
    alpha?: number;
    composite?: Composite;
    historySize: number;
    history?: boolean;
    zoomSet?: number;
    x: number;
    y: number;
}

interface CanvasEvents {
    func?: CustomEvent<Event>;
    events: CustomEvent<Event>[];
}

export class Canvas {
    __domCanvas: CanvasDOMManager;
    options?: CanvasOptions & ICssProperties;
    #canvasEvents: { [key: string]: CanvasEvents } = {
        click: { func: undefined, events: [] },
        dblclick: { func: undefined, events: [] },
        mousedown: { func: undefined, events: [] },
        mouseup: { func: undefined, events: [] },
        mousemove: { func: undefined, events: [] },
        mouseenter: { func: undefined, events: [] },
        mouseleave: { func: undefined, events: [] },
        mouseout: { func: undefined, events: [] },
        mouseover: { func: undefined, events: [] },
    };
    canvasId: string;
    width: number;
    height: number;
    #tree: Tree;
    #zoomSpeed = 1.2;
    #zoomInvSpeed = 0.8;
    #moveSpeed = 10;
    currentCursor: string = "auto";
    __animations: any = [];
    #fps = 60;
    #history = true;
    #elements: number[] = [];
    #mouseMovement = true;
    #keyboardMovement = true;
    #zoomOption = "center";
    #handledNodes: number[] = [];
    #initTime?: number;
    #highZIndex = 1;

    __positionCords: { x: number; y: number; z: number } = { x: 0, y: 0, z: 1 };

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
        this.#history = this.options?.history || this.#history;
        this.#zoomOption = this.options?.zoom || "center";
        this.__positionCords = {
            x: this.options?.x || 0,
            y: this.options?.y || 0,
            z: this.options?.zoomSet || 1,
        };
        this.#tree = new Tree(this.options?.historySize);
        this.__domCanvas = new CanvasDOMManager(
            this.canvasId,
            this.width,
            this.height
        );
        this.#initTime = new Date().getTime();
        this.#initCanvas();
    }

    get context(): CanvasRenderingContext2D {
        return this.__domCanvas.context;
    }

    get canvas(): HTMLCanvasElement {
        return this.__domCanvas.canvas;
    }

    #initCanvas() {
        this.canvas;
        this.context.save();

        window.onload = () => {
            if (this.options) {
                this.context.globalCompositeOperation =
                    this.options.composite || "source-over";
                this.context.globalAlpha = this.options.alpha || 1.0;

                if (this.#history) this.#snapshotHandler();

                this.__domCanvas.changeStyle(this.options);

                if (this.#mouseMovement) this.#handMove();
                if (this.#keyboardMovement) this.#keyboardMove();

                if (this.#zoomOption == "point") this.#pointZoom();
                else if (this.#zoomOption == "center") this.#centerZoom();
            }
        };
    }

    add(...block: Block[]) {
        this.#tree.addNodes(block);
        this.#initTime = new Date().getTime();
        this.#tree.preOrderTraversal<Block>(this.#tree.head, (b: Block) => {
            this.__handleOptions(b);
            this.__collectEvents(b);
            this.__takeInitSnaphshot(b);
            if (this.inBoundElement(b)) b.render();
            this.__animations.push(...b.__animationOn);
        });
        if (this.__animations.length !== 0)
            this.animationInvoker(this.__animations);

        this.#registerDomEvent();
        this.#setCanvasPosition();
        this.#setCanvasZoom();
    }

    remove(block: Block) {
        this.#tree.head.removeChild(block);
        this.__clearEvents(block);
        this.invokeNodeListing();
        // @Todo: take snapshot for this
    }

    find(queries: IBlockOptions) {
        let blocks: Block[] = [];
        this.#tree.listSortedChilds((block: Block) => {
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
        return this.canvas.getBoundingClientRect();
    }

    getCursorPosition(event: { clientX: number; clientY: number }) {
        return {
            x: event.clientX - this.canvasBounding.left,
            y: event.clientY - this.canvasBounding.top,
        };
    }

    whoIsTheFirst(zIndex: number) {
        return Math.max(...this.#elements) === zIndex;
    }

    takeRegister(inOutZ: any) {
        let m = inOutZ["in"];
        if (m && !this.#elements.includes(m)) this.#elements.push(m);
        else this.#elements = this.#elements.filter((i) => i !== inOutZ["out"]);
    }

    __handleOptions(block: Block): void {
        if (!block.ownOptions || this.#handledNodes.includes(block.nodeId!))
            return;
        block.canvas = this;
        this.#handleBindOptions(block);
        for (const [key, value] of Object.entries(block.ownOptions)) {
            getPrototype(block, key)?.value.call(block, value);
        }
        if (!block.ownOptions.zIndex) {
            block.ownOptions.zIndex = this.#highZIndex;
        }
        if (block.ownOptions.zIndex > this.#highZIndex)
            this.#highZIndex = block.ownOptions.zIndex + 1;
        else this.#highZIndex += 1;

        this.#handledNodes.push(block.nodeId!);
    }

    #handleBindOptions(block: Block) {
        for (const opt of block.__bindOptions) {
            for (const key of opt.options) {
                getPrototype(block, key as string)?.value.call(
                    block,
                    opt.bindTo.ownOptions[key]
                );
            }
        }
    }

    __takeInitSnaphshot(block: Block) {
        const dummy: any = {};
        dummy[block.nodeId!] = { ...block.ownOptions };
        this.#tree.takeSanpshot(this.#initTime!, null, dummy);
    }

    __takeBlockSnapshot(parentBlock: Block, before: any) {
        const after: any = {};
        after[parentBlock.nodeId!] = {
            childNodes: [...parentBlock.childNodes],
        };
        this.#tree.takeSanpshot(this.#initTime!, before, after);
    }

    __collectEvents(block: Block) {
        for (const key in block.__events) {
            for (const event of block.__events[key])
                this.registerEvent(key, event);
        }
    }

    __clearEvents(block: Block) {
        for (const key in block.__events) {
            this.removeEvent(key, block.__events[key]);
        }
    }

    registerEvent(event: string, callFunc: CustomEvent<Event>) {
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
            !this.#canvasEvents[event].events.includes(callFunc) ||
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
            if (func === undefined) continue;
            const eventFunc = this.__domCanvas.getListener(key);
            if (eventFunc && !eventFunc.includes(func)) {
                for (let i = 0, len = eventFunc.length; i < len; i++) {
                    this.__domCanvas.removeEventListener(key, eventFunc[i]);
                }
            }
            this.__domCanvas.addEventListener(key, func);
        }
    }
    invokeChange(_func?: (block: Block) => void) {
        this.context.restore();
        this.context.save();
        this.clearRect();
        this.#tree.listSortedChilds((b: Block) => {
            if (b.nodeId && this.#handledNodes.includes(b.nodeId)) {
                this.#registerDomEvent();
                this.#handleBindOptions(b);
                if (_func) _func(b);
                b.__adjustBlocks();
                b.position();
                if (this.inBoundElement(b)) b.render();
            }
        }, "zIndex");
    }

    invokeNodeListing() {
        this.#initTime = new Date().getTime();
        this.#tree.preOrderTraversal<Block>(this.#tree.head);
    }

    takeSnapshot(before: SnapshotObject, after: SnapshotObject) {
        if (this.#history)
            this.#tree.takeSanpshot(new Date().getTime(), before, after);
    }

    inBoundElement(element: Block) {
        const x = xIntersect(
            { left: 0, right: this.canvasBounding.width },
            {
                left: Math.min(
                    element.cornerTopLeft().x,
                    element.cornerTopRight().x,
                    element.cornerBottomLeft().x,
                    element.cornerBottomRight().x
                ),
                right: Math.max(
                    element.cornerTopLeft().x,
                    element.cornerTopRight().x,
                    element.cornerBottomLeft().x,
                    element.cornerBottomRight().x
                ),
            }
        );
        const y = yIntersect(
            { top: 0, bottom: this.canvasBounding.height },
            {
                top: Math.min(
                    element.cornerTopLeft().y,
                    element.cornerTopRight().y,
                    element.cornerBottomLeft().y,
                    element.cornerBottomRight().y
                ),
                bottom: Math.max(
                    element.cornerTopLeft().y,
                    element.cornerTopRight().y,
                    element.cornerBottomLeft().y,
                    element.cornerBottomRight().y
                ),
            }
        );
        if (x * y <= 0) return false;
        return true;
    }

    animationInvoker(animations: any) {
        let lastFrame = 0;
        const framer = (timestamp: number) => {
            requestAnimationFrame(framer);
            // getting true frame per second
            const delta = timestamp - lastFrame;
            if (lastFrame && delta < this.#fps / 1000) return;
            this.context.restore();
            this.context.save();
            this.clearRect();
            for (let anime of animations) {
                anime(timestamp);
            }
            const execTime = delta % this.#fps;
            lastFrame = timestamp - execTime;
        };
        requestAnimationFrame(framer);
    }
    #pointZoom() {
        window.addEventListener("wheel", (event: WheelEvent) => {
            if (event.ctrlKey) {
                const { x, y } = this.getCursorPosition(event);

                let scale = this.options?.zoomSpeed || this.#zoomSpeed;
                let invScale = this.options?.zoomInvSpeed || this.#zoomInvSpeed;

                let beforeX = this.__positionCords.x;
                let beforeY = this.__positionCords.y;

                if (event.deltaY < 0) {
                    this.__positionCords.x -=
                        x / (this.__positionCords.z * scale) -
                        x / this.__positionCords.z;

                    this.__positionCords.y -=
                        y / (this.__positionCords.z * scale) -
                        y / this.__positionCords.z;
                    this.invokeChange((block) => {
                        block.x(block.x() - (this.__positionCords.x - beforeX));
                        block.y(block.y() - (this.__positionCords.y - beforeY));
                        block.scale(scale);
                    });
                    this.__positionCords.z *= scale;
                } else {
                    this.__positionCords.x -=
                        x / (this.__positionCords.z * invScale) -
                        x / this.__positionCords.z;

                    this.__positionCords.y -=
                        y / (this.__positionCords.z * invScale) -
                        y / this.__positionCords.z;

                    this.invokeChange((block) => {
                        block.x(block.x() - (this.__positionCords.x - beforeX));
                        block.y(block.y() - (this.__positionCords.y - beforeY));
                        block.scale(invScale);
                    });

                    this.__positionCords.z *= invScale;
                }
            }
        });
    }

    #centerZoom() {
        window.addEventListener("wheel", (event: WheelEvent) => {
            if (event.ctrlKey) {
                let scale = this.options?.zoomSpeed || this.#zoomSpeed;
                let invScale = this.options?.zoomInvSpeed || this.#zoomInvSpeed;
                this.invokeChange((block: Block) => {
                    if (event.deltaY < 0) {
                        const cacheR = block.rotate();
                        block.rotate(0);
                        const scaleW = block.width() * scale - block.width();
                        const scaleH = block.height() * scale - block.height();
                        block.x((block.x() || 1) + scaleW);
                        block.y((block.y() || 1) + scaleH);
                        // block.width((block.width() || 1) * scale);
                        // block.height((block.height() || 1) * scale);
                        block.scale(scale);
                        block.rotate(cacheR);
                        this.__positionCords.z *= scale;
                    } else {
                        const cacheR = block.rotate();
                        block.rotate(0);
                        const scaleW = block.width() * invScale - block.width();
                        const scaleH =
                            block.height() * invScale - block.height();
                        block.x((block.x() || 1) + scaleW);
                        block.y((block.y() || 1) + scaleH);
                        block.scale(invScale);
                        // block.width((block.width() || 1) * invScale);
                        // block.height((block.height() || 1) * invScale);
                        block.rotate(cacheR);
                        this.__positionCords.z *= invScale;
                    }
                });
            }
        });
    }
    clearRect() {
        this.context.clearRect(0, 0, this.width, this.height);
    }

    changeCursor(cur: string) {
        cur = cur || "auto";
        return this.__domCanvas.changeStyle({
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
            if (event.code == "Space") {
                if (!isKeyDown) {
                    (this.__domCanvas as any).changeStyle({ cursor: "grab" });
                    isKeyDown = true;
                }
            }
        });

        window.addEventListener("mousemove", (event: MouseEvent) => {
            if (event.buttons == 0) {
                isMouseDown = false;
                if (isKeyDown)
                    (this.__domCanvas as any).changeStyle({ cursor: "grab" });
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
                    (this.__domCanvas as any).changeStyle({
                        cursor: "grabbing",
                    });
                    let diffX = event.clientX - initX;
                    let diffY = event.clientY - initY;
                    if (diffX !== 0) {
                        this.invokeChange((block: Block) => {
                            block.translate({ x: diffX - beforeX, y: 0 });
                        });
                        this.__positionCords.x += diffX;
                        beforeX = diffX;
                    }
                    if (diffY !== 0) {
                        this.invokeChange((block: Block) => {
                            block.translate({ x: 0, y: diffY - beforeY });
                        });
                        this.__positionCords.y += diffY;
                        beforeY = diffY;
                    }
                }
            }
        });

        window.addEventListener("keyup", (event) => {
            (this.__domCanvas as any).changeStyle({ cursor: "auto" });
            isKeyDown = false;
        });
    }

    #setCanvasPosition() {
        this.invokeChange((block: Block) => {
            block.x(block.x() + this.__positionCords.x);
            block.y(block.y() + this.__positionCords.y);
        });
    }

    #setCanvasZoom() {
        this.invokeChange((elem) => {
            elem.width(elem.width() * (this.options?.zoomSet || 1));
            elem.height(elem.height() * (this.options?.zoomSet || 1));
        });
    }

    #keyboardMove() {
        const moveSpeed = this.options?.moveSpeed || this.#moveSpeed;
        window.addEventListener("wheel", (event: WheelEvent) => {
            if (event.ctrlKey) return;
            if (event.shiftKey) {
                if (event.deltaY < 0) {
                    this.invokeChange((block: Block) => {
                        block.translate({ x: -moveSpeed, y: 0 });
                    });
                    this.__positionCords.x -= moveSpeed;
                } else {
                    this.invokeChange((block: Block) => {
                        block.translate({ x: moveSpeed, y: 0 });
                    });
                    this.__positionCords.x += moveSpeed;
                }
            } else {
                if (event.deltaY < 0) {
                    this.invokeChange((block: Block) => {
                        block.translate({ x: 0, y: moveSpeed });
                    });
                    this.__positionCords.y += moveSpeed;
                } else {
                    this.invokeChange((block: Block) => {
                        block.translate({ x: 0, y: -moveSpeed });
                    });
                    this.__positionCords.y -= moveSpeed;
                }
            }
        });
    }

    #snapshotHandler() {
        window.addEventListener("keydown", (e: KeyboardEvent) => {
            let obj;
            if (e.key === "Z" && e.ctrlKey) obj = this.#tree.snapshotInFuture();
            else if (e.key === "z" && e.ctrlKey)
                obj = this.#tree.snapshotInBack();
            console.log(obj);
            if (obj)
                this.invokeChange((b: Block) => {
                    if (Object.keys(obj).includes(String(b.nodeId))) {
                        for (let [key, value] of Object.entries(
                            obj[b.nodeId!]
                        )) {
                            if (key === "childNodes") {
                                if (
                                    b.childNodes.length !== (value as []).length
                                ) {
                                    if (
                                        (value as []).length >
                                        b.childNodes.length
                                    ) {
                                        for (
                                            let i = 0;
                                            i < (value as []).length;
                                            i++
                                        ) {
                                            if (
                                                !(value as Node[]).includes(
                                                    b.childNodes[i]
                                                )
                                            ) {
                                                b.__addChildInternal(
                                                    (value as [])[i]
                                                );
                                                this.#tree.assignNodeId(
                                                    (value as [])[i]
                                                );
                                                this.__handleOptions(
                                                    (value as [])[i]
                                                );
                                            }
                                        }
                                    } else {
                                        for (
                                            let i = 0;
                                            i < b.childNodes.length;
                                            i++
                                        ) {
                                            if (
                                                !b.childNodes.includes(
                                                    (value as [])[i]
                                                )
                                            ) {
                                                b.childNodes[i].nodeId =
                                                    undefined;
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
        });
    }
}
