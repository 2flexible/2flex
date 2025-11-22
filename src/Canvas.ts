import { Tree } from "./Tree";
import {
    BlockElements,
    CursorPos,
    ICssProperties,
    BlockOptions,
    IBlock,
} from "./types";
import { CanvasDOMManager } from "./DOMManager";
import { Path } from "./Path";
import { Layout } from "./Layout";

/*
@Todo
make checkpoint for canvas to load
export canvas model
make import model for canvas
*/

interface CanvasOptions {
    zoomSpeed?: number;
    zoomInvSpeed?: number;
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
    #tree = new Tree();
    __positionCords = { x: 0, y: 0 };

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

        this.move(this.#canvasMoves());
        window.onload = () => {
            this.__domCanvas.changeStyle(this.options);
            this.zoom(this.#zoomInOut());
        };
    }

    add(...block: BlockElements[]) {
        this.#tree.addNodes(block);

        this.#tree.preOrderTraversal((element: any) => {
            element.canvas = this;
            this.#handleOptions(element);
            element.__initSet();
            for (const key in element.__events) {
                this.#canvasEvents[key].push(...element.__events[key]);
            }
        });

        let zIndex = 0;
        this.#tree.checkNodes((el: any) => {
            if (el.options) {
                el.canvasInit.zIndex = el.options.zIndex || 0 + zIndex;
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
        const cursor: CursorPos = { x, y };
        return cursor;
    }

    #handleEvents() {
        // added unique events because canvas is same, but events changing
        for (const key in this.#canvasEvents) {
            if (this.#canvasEvents[key].length !== 0) {
                this.__domCanvas.addEventListener(key, (event) => {
                    for (const func of this.#canvasEvents[key]) {
                        func(event);
                    }
                });
            }
        }
    }

    #handleOptions(block: BlockElements, ignore?: string[]): void {
        if (!block.options) return;
        for (const [key, value] of Object.entries(block.options)) {
            const proto = Object.getPrototypeOf(block);
            const obj = Object.getOwnPropertyDescriptor(proto, key);
            if (ignore && ignore.includes(key)) return;
            if (obj) {
                obj.value.call(block, value);
            } else {
                block.options[key] = value;
            }
        }
    }

    invokeChange(_func?: (element: any) => void) {
        // need to make for invidiual change rather than creating this path
        this.clipping_path.createPath();
        this.context.restore();
        this.context.save();

        this.clearRect();
        this.context.translate(this.__positionCords.x, this.__positionCords.y);

        const ignore = [
            "layout",
            "alignItems",
            "justifyContent",
            "justifyItems",
            "alignContent",
            "gridTemplateColumns",
            "gridTemplateRows",
            "resizable",
            "click",
            "dblclick",
            "mousedown",
            "mouseup",
            "mousemove",
            "mouseenter",
            "mouseleave",
            "mouseout",
            "mouseover",
            "draggable",
            "selectable",
        ];

        this.#tree.checkNodes((element: any) => {
            if (_func) _func(element);
            this.#handleOptions(element, ignore);
            element.__initSet();
        });
    }
    // we can do this later as and || or
    find(queries: IBlock<BlockOptions>) {
        return this.#tree.filterNodes(queries);
    }

    zoom(_func: (event: any) => void) {
        this.__domCanvas.removeEventListener("wheel", this.#zoomInOut);
        this.__domCanvas.addEventListener("wheel", (event) => _func(event));
    }

    #zoomInOut() {
        let scale = this.options?.zoomSpeed || 1.2;
        let invScale = this.options?.zoomInvSpeed || 0.8;
        return (event: WheelEvent) => {
            if (event.ctrlKey) {
                if (event.deltaY < 0) {
                    this.context.scale(scale, scale);
                    this.invokeChange((elem) => {
                        elem.canvasInit.width *= scale;
                        elem.canvasInit.height *= scale;
                    });
                } else {
                    this.context.scale(invScale, invScale);
                    this.invokeChange((elem) => {
                        elem.canvasInit.width *= invScale;
                        elem.canvasInit.height *= invScale;
                    });
                }
            }
        };
    }
    clearRect() {
        this.context.clearRect(0, 0, this.width, this.height);
    }

    move(_func: (event: any) => void) {
        this.__domCanvas.removeEventListener("wheel", this.#canvasMoves);
        this.__domCanvas.addEventListener("wheel", (event) => _func(event));
    }
    #canvasMoves() {
        return (event: WheelEvent) => {
            if (event.ctrlKey) {
                return;
            }
            if (event.shiftKey) {
                if (event.deltaY < 0) {
                    this.__positionCords.x -= 10;
                } else {
                    this.__positionCords.x += 10;
                }
            } else {
                if (event.deltaY < 0) {
                    this.__positionCords.y += 10;
                } else {
                    this.__positionCords.y -= 10;
                }
            }
            this.invokeChange();
        };
    }
}
