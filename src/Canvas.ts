import { Tree } from "./Tree";
import { CanvasDOMManager } from "./DOMManager";
import { getPrototype, xIntersect, yIntersect } from "./Utils";
import type { Block, BlockOptions } from "./Block";
import type { ICssProperties, SnapshotObject } from "./types";
import { Rectangle } from "./shapes/Rectangle";
import { Shape } from "./Shape";
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
    move?: "auto" | "keyboard" | "mouse";
    takeSnapshot: boolean;
    fps: number;
    snapshotSize: number;
    alpha?: number;
    composite?: Composite;
    history?: boolean;
    zoomSet?: number;
    x: number;
    y: number;
}
export class Canvas {
    __domCanvas: CanvasDOMManager;
    options?: CanvasOptions & ICssProperties;
    #canvasEvents: any = {
        click: [],
        dblclick: [],
        mousedown: [],
        mouseup: [],
        mousemove: [],
        mouseenter: [],
        mouseleave: [],
        mouseout: [],
        mouseover: [],
    };
    canvasId: string;
    width: number;
    height: number;
    #tree: Tree;
    #zoomSpeed = 1.2;
    #zoomInvSpeed = 0.8;
    #moveSpeed = 10;
    currentCursor: string = "auto";
    #animations: any = [];
    #snapshotSize = 50;
    #fps = 60;
    #history = true;
    #elements: number[] = [];
    __positionCords: { x: number; y: number } = { x: 0, y: 0 };

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
        this.__positionCords = {
            x: this.options?.x || this.__positionCords.x,
            y: this.options?.y || this.__positionCords.y,
        };
        this.#snapshotSize = this.options?.snapshotSize || 50;
        this.#tree = new Tree(this.#snapshotSize);
        this.__domCanvas = new CanvasDOMManager(
            this.canvasId,
            this.width,
            this.height
        );
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
                if (this.options.move == "mouse") {
                    this.#handMove();
                } else if (this.options.move == "keyboard") {
                    this.#keyboardMove();
                } else {
                    this.#keyboardMove();
                    this.#handMove();
                }

                if (this.options.zoom == "point") {
                    this.#pointZoom();
                } else this.#centerZoom();
            }
        };
    }

    add(...block: Block[]) {
        let zIndex = 1;
        this.#tree.addNodes(block);
        this.#tree.preOrderTraversal<Block>(this.#tree.head, (b: Block) => {
            b.canvas = this;

            b.zIndex(zIndex);
            zIndex += 1;

            this.#handleOptions(b);
            this.#setCanvasPosition();
            this.#setCanvasZoom()
            b.__adjustBlocks();

            if (this.inBoundElement(b)) b.render();

            this.#animations.push(...b.__animationOn);

            for (const key in b.__events) {
                this.#canvasEvents[key].push(...b.__events[key]);
            }
            const dummy: any = {};
            dummy[b.nodeId!] = { ...b.ownOptions };
            this.takeSnapshot(dummy, dummy);
        });
        if (this.#animations.length !== 0)
            this.animationInvoker(this.#animations);

        this.#handleEvents();
    }

    find(queries: BlockOptions) {
        let blocks: Block[] = [];
        this.#tree.preOrderTraversal(this.#tree.head, (block: Block) => {
            for (const [k, v] of Object.entries(queries)) {
                if (block.ownOptions[k] === v) blocks.push(block);
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

    #handleEvents() {
        for (const key in this.#canvasEvents) {
            if (this.#canvasEvents[key].length !== 0) {
                this.__domCanvas.addEventListener(key, (event) => {
                    for (const func of this.#canvasEvents[key]) func(event);
                });
            }
        }
    }

    whoIsTheFirst(zIndex: number) {
        return Math.max(...this.#elements) === zIndex;
    }

    takeRegister(inOutZ: any) {
        let m = inOutZ["in"];
        if (m && !this.#elements.includes(m)) this.#elements.push(m);
        else this.#elements = this.#elements.filter((i) => i !== inOutZ["out"]);
    }

    #handleOptions(block: Block): void {
        if (!block.ownOptions) return;
        for (const opt of block.__bindOptions) {
            for (const key of opt.options) {
                getPrototype(block, key as string)?.value.call(
                    block,
                    opt.bindTo.ownOptions[key]
                );
            }
        }
        if (block.ownOptions["hidden"]) {
            getPrototype(block, "hidden")?.value.call(
                block,
                block.ownOptions["hidden"]
            );
            return;
        }
        for (const [key, value] of Object.entries(block.ownOptions)) {
            getPrototype(block, key)?.value.call(block, value);
        }
    }
    invokeChange(obj?: any, _func?: (element: Block) => void) {
        this.context.restore();
        this.context.save();
        this.clearRect();

        this.#tree.preOrderTraversal(undefined, (b: Block) => {
            if (obj && Object.keys(obj).includes(String(b.nodeId))) {
                for (const [key, value] of Object.entries(obj[b.nodeId!])) {
                    getPrototype(b, key)?.value.call(b, value);
                }
            }
            for (const opt of b.__bindOptions) {
                for (const key of opt.options) {
                    getPrototype(b, key as string)?.value.call(
                        b,
                        opt.bindTo.ownOptions[key]
                    );
                }
            }
            if (_func) _func(b);
            b.__adjustBlocks();
            if (this.inBoundElement(b)) b.render();
        });
    }

    takeSnapshot(before: SnapshotObject, after: SnapshotObject) {
        if (this.#history) {
            this.#tree.takeSanpshot(new Date().getTime(), before, after);
        }
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
        const moveSpeed = this.options?.moveSpeed || this.#moveSpeed;
        this.__domCanvas.addEventListener("wheel", (event: WheelEvent) => {
            if (event.ctrlKey) {
                const { x, y } = this.getCursorPosition(event);
                let scale = this.options?.zoomSpeed || this.#zoomSpeed;
                let invScale = this.options?.zoomInvSpeed || this.#zoomInvSpeed;
                if (event.deltaY < 0) {
                    this.invokeChange(undefined, (elem) => {
                        elem.width(elem.width() * scale);
                        elem.height(elem.height() * scale);
                    });
                } else {
                    this.invokeChange(undefined, (elem) => {
                        elem.width(elem.width() * invScale);
                        elem.height(elem.height() * invScale);
                    });
                }
                if (this.canvas.width / 2 < x)
                    this.invokeChange(undefined, (block: Block) =>
                        block.x(block.x() - moveSpeed)
                    );
                else
                    this.invokeChange(undefined, (block: Block) =>
                        block.x(block.x() + moveSpeed)
                    );
                if (this.canvas.height / 2 < y)
                    this.invokeChange(undefined, (block: Block) =>
                        block.y(block.y() - moveSpeed)
                    );
                else
                    this.invokeChange(undefined, (block: Block) =>
                        block.y(block.y() + moveSpeed)
                    );
            }
        });
    }

    #centerZoom() {
        const moveSpeed = this.options?.moveSpeed || this.#moveSpeed;

        this.__domCanvas.addEventListener("wheel", (event: WheelEvent) => {
            if (event.ctrlKey) {
                let scale = this.options?.zoomSpeed || this.#zoomSpeed;
                let invScale = this.options?.zoomInvSpeed || this.#zoomInvSpeed;
                if (event.deltaY < 0) {
                    this.invokeChange(undefined, (block: Block) => {
                        block.x(block.x() - moveSpeed);
                        block.y(block.y() - moveSpeed);
                        block.width(block.width() * scale);
                        block.height(block.height() * scale);
                    });
                } else {
                    this.invokeChange(undefined, (block: Block) => {
                        block.x(block.x() + moveSpeed);
                        block.y(block.y() + moveSpeed);
                        block.width(block.width() * invScale);
                        block.height(block.height() * invScale);
                    });
                }
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

        this.__domCanvas.addEventListener("mousemove", (event) => {
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
                    this.invokeChange(undefined, (block: Block) => {
                        if (diffX !== 0) {
                            block.x(block.x() + (diffX - beforeX));
                            beforeX = diffX;
                        }
                        if (diffY !== 0) {
                            block.y(block.y() + (diffY - beforeY));
                            beforeY = diffY;
                        }
                    });
                }
            }
        });

        this.__domCanvas.addEventListener("keyup", (event) => {
            (this.__domCanvas as any).changeStyle({ cursor: "auto" });
            isKeyDown = false;
        });
    }

    #setCanvasPosition() {
        
        this.invokeChange(undefined, (block: Block) => {
            block.x(block.x() + this.__positionCords.x);
            block.y(block.y() + this.__positionCords.y);
        });
    }

    #setCanvasZoom() {
        this.invokeChange(undefined, (elem) => {
            elem.width(elem.width() * (this.options?.zoomSet || 1));
            elem.height(elem.height() * (this.options?.zoomSet || 1));
        });
    }

    #keyboardMove() {
        const moveSpeed = this.options?.moveSpeed || this.#moveSpeed;

        this.__domCanvas.addEventListener("wheel", (event: WheelEvent) => {
            if (event.ctrlKey) {
                return;
            }
            this.invokeChange(undefined, (block: Block) => {
                if (event.shiftKey) {
                    if (event.deltaY < 0) {
                        block.x(block.x() - moveSpeed);
                        this.__positionCords.x -= moveSpeed;
                    } else {
                        block.x(block.x() + moveSpeed);
                        this.__positionCords.x += moveSpeed;
                    }
                } else {
                    if (event.deltaY < 0) {
                        block.y(block.y() + moveSpeed);
                        this.__positionCords.y += moveSpeed;
                    } else {
                        block.y(block.y() - moveSpeed);
                        this.__positionCords.y -= moveSpeed;
                    }
                }
            });
        });
    }

    #snapshotHandler() {
        window.addEventListener("keydown", (e: KeyboardEvent) => {
            let obj;
            if (e.key === "Z" && e.ctrlKey) obj = this.#tree.snapshotInFuture();
            else if (e.key === "z" && e.ctrlKey)
                obj = this.#tree.snapshotInBack();
            if (obj) this.invokeChange(obj);
        });
    }
}
