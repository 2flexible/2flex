import { Tree } from "./Tree";
import { BlockElements, ICssProperties, BlockOptions, IBlock } from "./types";
import { CanvasDOMManager } from "./DOMManager";
import { Path } from "./Path";
import { Block } from "./Block";

interface CanvasOptions {
    zoomSpeed?: number;
    zoomInvSpeed?: number;
    moveSpeed?: number;
    zoom?: "center" | "point";
    move?: "auto" | "keyboard" | "mouse";
    takeSnapshot: boolean;
    fps: number;
    snapshotSize: number;
}
export class Canvas {
    __domCanvas: CanvasDOMManager;
    options?: CanvasOptions & ICssProperties;
    #canvasEvents: any = {
        click: [],
        dbclick: [],
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
    clipping_path: Path;
    #tree: Tree;
    #zoomSpeed = 1.2;
    #zoomInvSpeed = 0.8;
    #moveSpeed = 10;
    #animationStarted = false;
    currentCursor: string = "auto";
    __positionCords = { x: 0, y: 0 };
    #animations: any = [];
    #takeSnapshot = true;
    #snapshotSize = 50;
    #fps = 60;
    #elements: number[] = [];

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
        this.clipping_path = new Path();
        this.#snapshotSize = this.options?.snapshotSize || 50;
        this.#takeSnapshot = this.options?.takeSnapshot || true;
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
                if (this.#takeSnapshot) this.#snapshotHandler();

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

    add(...block: BlockElements[]) {
        this.#tree.addNodes(block);
        this.#tree.preOrderTraversal(this.#tree.head, (element: any) => {
            element.canvas = this;
            this.#handleOptions(element);
            if (this.inBoundElement(element)) element.__initSet();
            this.#animations.push(...element.__animationOn);
            for (const key in element.__events) {
                this.#canvasEvents[key].push(...element.__events[key]);
            }
        });
        if (this.#animations.length !== 0)
            this.animationInvoker(this.#animations);

        let zIndex = 0;
        let time = new Date().getTime();
        this.#tree.checkNodes((el: any) => {
            if (el.options) {
                el.canvasInit.zIndex = el.options.zIndex || 0 + zIndex;
                el.nodeId = zIndex;
                const dummy: any = {};
                dummy[el.nodeId] = { ...el.options };
                this.takeSnapshot(time, dummy);
                zIndex += 1;
            }
        }, true);
        this.#handleEvents();
    }

    get canvasBounding() {
        return this.canvas.getBoundingClientRect();
    }

    getCursorPosition(event: { clientX: number; clientY: number }) {
        const rect = this.canvasBounding;

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        return { x, y };
    }

    #handleEvents() {
        // added unique events because canvas is same, but events changing
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

    #handleOptions(block: BlockElements, opt?: BlockOptions): void {
        if (!block.options) return;
        if (block.options["hidden"]) {
            const proto = Object.getPrototypeOf(block);
            const obj = Object.getOwnPropertyDescriptor(proto, "hidden");
            obj?.value.call(block, block.options["hidden"]);
            return;
        }
        for (const [key, value] of Object.entries(block.options)) {
            const proto = Object.getPrototypeOf(block);
            const obj = Object.getOwnPropertyDescriptor(proto, key);
            if (obj) {
                obj.value.call(block, value);
            } else {
                block.options[key] = value;
            }
        }
    }
    // not need to invoke every options, need to take a considiration of the mouse events also
    invokeChange(obj?: any, _func?: (element: any) => void) {
        // need to make for invidiual change rather than creating this path
        this.clipping_path?.createPath();
        this.context.restore();
        this.context.save();

        this.clearRect();
        this.context.translate(this.__positionCords.x, this.__positionCords.y);

        this.#tree.checkNodes((element: any) => {
            if (_func) _func(element);
            if (obj && Object.keys(obj).includes(String(element.nodeId))) {
                for (const [key, value] of Object.entries(
                    obj[element.nodeId]
                )) {
                    const proto = Object.getPrototypeOf(element);
                    const obj = Object.getOwnPropertyDescriptor(proto, key);
                    if (obj) obj?.value.call(element, value);
                }
            }

            if (this.inBoundElement(element)) element.__initSet();
        });
    }

    takeSnapshot(timestamp: number, change: any) {
        this.#tree.takeSanpshot(timestamp, change);
    }

    inBoundElement(element: Block) {
        if (
            element.x() >= this.canvasBounding.width ||
            element.y() >= this.canvasBounding.height ||
            element.x() + element.width() <= 0 ||
            element.y() + element.height() <= 0
        ) {
            console.log(false);
            return false;
        }
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
    // we can do this later as and || or
    find(queries: IBlock<BlockOptions>) {
        return this.#tree.filterNodes(queries);
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
                        elem.canvasInit.width *= scale;
                        elem.canvasInit.height *= scale;
                    });
                } else {
                    this.invokeChange(undefined, (elem) => {
                        elem.canvasInit.width *= invScale;
                        elem.canvasInit.height *= invScale;
                    });
                }
                if (this.canvas.width / 2 < x && this.__positionCords.x < x)
                    this.__positionCords.x -= moveSpeed;
                else this.__positionCords.x += moveSpeed;
                if (this.canvas.height / 2 < y && this.__positionCords.y < y)
                    this.__positionCords.y -= moveSpeed;
                else this.__positionCords.y += moveSpeed;
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
                    this.__positionCords.x -= moveSpeed;
                    this.__positionCords.y -= moveSpeed;
                    this.invokeChange(undefined, (elem) => {
                        elem.canvasInit.width *= scale;
                        elem.canvasInit.height *= scale;
                    });
                } else {
                    this.__positionCords.x += moveSpeed;
                    this.__positionCords.y += moveSpeed;
                    this.invokeChange(undefined, (elem) => {
                        elem.canvasInit.width *= invScale;
                        elem.canvasInit.height *= invScale;
                    });
                }
            }
        });
    }
    clearRect() {
        this.context.clearRect(0, 0, this.width, this.height);
    }

    chageCursor(cur: string) {
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

        this.__domCanvas.canvas.focus();
        this.__domCanvas.addEventListener("keydown", (event) => {
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
                    if (diffX !== 0) {
                        this.__positionCords.x += diffX - beforeX;
                        beforeX = diffX;
                    }
                    if (diffY !== 0) {
                        this.__positionCords.y += diffY - beforeY;
                        beforeY = diffY;
                    }

                    this.invokeChange();
                }
            }
        });

        this.__domCanvas.addEventListener("keyup", (event) => {
            (this.__domCanvas as any).changeStyle({ cursor: "auto" });
            isKeyDown = false;
        });
    }

    #keyboardMove() {
        const moveSpeed = this.options?.moveSpeed || this.#moveSpeed;

        this.__domCanvas.addEventListener("wheel", (event: WheelEvent) => {
            if (event.ctrlKey) {
                return;
            }
            if (event.shiftKey) {
                if (event.deltaY < 0) {
                    this.__positionCords.x -= moveSpeed;
                } else {
                    this.__positionCords.x += moveSpeed;
                }
            } else {
                if (event.deltaY < 0) {
                    this.__positionCords.y += moveSpeed;
                } else {
                    this.__positionCords.y -= moveSpeed;
                }
            }
            this.invokeChange();
        });
    }

    #snapshotHandler() {
        this.__domCanvas.addEventListener("keydown", (e: KeyboardEvent) => {
            let obj;
            if (e.key === "Z" && e.ctrlKey) obj = this.#tree.snapshotInFuture();
            else if (e.key === "z" && e.ctrlKey)
                obj = this.#tree.snapshotInBack();
            if (obj) this.invokeChange(obj);
        });
    }
}
