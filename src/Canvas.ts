import { Tree } from "./Tree";
import {
    BlockElements,
    CursorPos,
    ICssProperties,
    BlockOptions,
    IBlock,
} from "./types";
import { CanvasDOMManager } from "./DOMManager";
import { IText } from "./TextBlock";
import { Path } from "./Path";

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

    constructor(
        canvasId?: string,
        width?: number,
        height?: number,
        options: ICssProperties | undefined = undefined
    ) {
        this.canvasId = canvasId || "canvas";
        this.options = options;
        this.width = width || 300;
        this.height = height || 300;
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

        window.onload = () => {
            this.#domCanvas.changeStyle(this.options);
            this.zoom(this.#zoomInOut());
            this.move(this.#canvasMoves());
        };
    }

    add(...block: BlockElements[]) {
        block = block.reverse();

        this.#tree.addNodes(block);

        this.#tree.preOrderTraversal((element: any) => {
            element.canvas = this;

            this.#handleOptions(element);
            element.__initSet();

            this.#canvasEvents.push(...element.events);
        });

        let zIndex = 0;

        this.#tree.checkNodes((el: any) => {
            el.options.zIndex += zIndex;
            zIndex += 1;
        });

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
        // created events for every same type events beacuse canvas is same, but events changing
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

    #handleOptions(block: BlockElements): void {
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

    invokeChange(_func?: (element: any) => void) {
        this.clipping_path.createPath();
        this.context.restore();
        this.context.save();

        this.clearRect();

        this.#tree.checkNodes((element: any) => {
            if (_func) _func(element);
            this.#handleOptions(element);
            element.__initSet();
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

    // not workign correctyly due to x and y cordinates
    #zoomInOut() {
        let scale = 1.02;
        let invScale = 0.95;
        let xx: any = undefined;
        let yy: any = undefined;
        return (event: WheelEvent) => {
            if (event.ctrlKey) {
                if (event.deltaY < 0) {
                    this.invokeChange((elem) => {
                        // const diffX = elem.options.x * scale - elem.options.x;
                        // elem.options.width += this.width * scale - this.width;
                        elem.options.width *= scale;

                        if (!xx) {
                            xx = elem.options.x;
                        }
                        if (!yy) {
                            yy = elem.options.y;
                        }
                        xx *= scale;
                        yy *= scale;
                        console.log("xx");
                        console.log(xx);
                        elem.initX = xx;
                        elem.initY = yy;
                        this.context.scale(1.02, 1.02);
                    });
                } else {
                    this.invokeChange((elem) => {
                        this.width /= invScale;
                        this.height /= invScale;
                        elem.options.width *= invScale;
                        elem.options.height *= invScale;
                        elem.options.x *= invScale;
                        elem.options.y *= invScale;
                        // invScale *= 0.95;
                        this.context.scale(invScale, invScale);
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
            if (event.ctrlKey) {
                return;
            }

            if (event.shiftKey) {
                if (event.deltaY < 0) {
                    this.invokeChange((element) => (element.options.x += 10));
                } else {
                    this.invokeChange((element) => (element.options.x -= 10));
                }
            } else {
                if (event.deltaY < 0) {
                    this.invokeChange((element) => (element.options.y += 10));
                } else {
                    this.invokeChange((element) => (element.options.y -= 10));
                }
            }
        };
    }
}
