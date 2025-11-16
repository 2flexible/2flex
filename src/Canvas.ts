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
export class Canvas {
    #domCanvas: CanvasDOMManager;
    options: ICssProperties | undefined;
    #canvasEvents: any[] = [];
    canvasId: string;
    width: number;
    height: number;
    clipping_path: Path;
    #tree = new Tree();
    #cords = { x: 0, y: 0 };
    zoomSpeed?: number = 1.02;
    zoomInvSpeed?: number = 0.95;

    constructor(
        canvasId?: string,
        width?: number,
        height?: number,
        zoomSpeed?: number,
        zoomInvSpeed?: number,
        options: ICssProperties | undefined = undefined
    ) {
        this.canvasId = canvasId || "canvas";
        this.options = options;
        this.width = width || 300;
        this.height = height || 300;
        this.zoomSpeed = zoomSpeed;
        this.zoomSpeed = zoomInvSpeed;
        this.clipping_path = new Path();

        this.#domCanvas = new CanvasDOMManager(
            this.canvasId,
            this.width,
            this.height
        );
        this.#initCanvas();
    }

    get context(): CanvasRenderingContext2D {
        return this.#domCanvas.context;
    }

    get canvas(): HTMLCanvasElement {
        return this.#domCanvas.canvas;
    }

    #initCanvas() {
        this.canvas;
        this.context.save();

        this.move(this.#canvasMoves());
        window.onload = () => {
            this.#domCanvas.changeStyle(this.options);
            this.zoom(this.#zoomInOut());
        };
    }

    add(...block: BlockElements[]) {
        this.#tree.addNodes(block);

        this.#tree.preOrderTraversal((element: any) => {
            element.canvas = this;
            this.#handleOptions(element);
            element.__initSet();

            this.#canvasEvents.push(...element.events);
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
        let uniqeEvents: any[] = [];

        for (const item of this.#canvasEvents) {
            const tempUniqe = uniqeEvents?.filter(
                (_item) => _item.eventType === item.eventType
            );
            if (tempUniqe[0]) {
                const idx = uniqeEvents.indexOf(tempUniqe[0]);
                uniqeEvents.splice(idx, 1);
                tempUniqe[0].methods.push(item.method);
                uniqeEvents = [...uniqeEvents, tempUniqe[0]];
            } else {
                uniqeEvents.push({
                    eventType: item.eventType,
                    methods: [item.method],
                });
            }
        }
        this.#canvasEvents = uniqeEvents;

        this.#canvasEvents?.forEach((elem: any) => {
            this.#domCanvas.addEventListener(elem.eventType, (event) => {
                elem.methods?.forEach((_method: any) => {
                    _method(event);
                });
            });
        });
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
        this.context.translate(this.#cords.x, this.#cords.y);

        const ignore = [
            "layout",
            "alignItems",
            "justifyContent",
            "justifyItems",
            "alignContent",
            "gridTemplateColumns",
            "gridTemplateRows",
        ];

        this.#tree.checkNodes((element: any) => {
            if (_func) _func(element);
            this.#handleOptions(element, ignore);
            if (!(element instanceof Layout)) element.__initSet();
        });
    }
    // we can do this later as and || or
    find(queries: IBlock<BlockOptions>) {
        return this.#tree.filterNodes(queries);
    }

    zoom(_func: (event: any) => void) {
        this.#domCanvas.removeEventListener("wheel", this.#zoomInOut);
        this.#domCanvas.addEventListener("wheel", (event) => _func(event));
    }

    #zoomInOut() {
        let scale = this.zoomSpeed as number;
        let invScale = this.zoomInvSpeed as number;
        return (event: WheelEvent) => {
            if (event.ctrlKey) {
                if (event.deltaY < 0) {
                    this.context.scale(scale, scale);
                    this.invokeChange((elem) => {
                        elem.canvasInit.x = elem.canvasInit.x * scale;
                        elem.canvasInit.y = elem.canvasInit.y * scale;
                        elem.canvasInit.width *= scale;
                        elem.canvasInit.height *= scale;
                    });
                } else {
                    this.context.scale(invScale, invScale);
                    this.invokeChange((elem) => {
                        elem.canvasInit.x = elem.canvasInit.x * invScale;
                        elem.canvasInit.y = elem.canvasInit.y * invScale;
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
        this.#domCanvas.removeEventListener("wheel", this.#canvasMoves);
        this.#domCanvas.addEventListener("wheel", (event) => _func(event));
    }
    #canvasMoves() {
        return (event: WheelEvent) => {
            let invoke = false;
            if (event.ctrlKey) {
                return;
            }
            if (event.shiftKey) {
                if (event.deltaY < 0) {
                    this.#cords.x -= 10;
                    invoke = true;
                } else {
                    this.#cords.x += 10;
                    invoke = true;
                }
            } else {
                if (event.deltaY < 0) {
                    this.#cords.y += 10;
                    invoke = true;
                } else {
                    this.#cords.y -= 10;
                    invoke = true;
                }
            }
            if (invoke) this.invokeChange();
        };
    }
}
