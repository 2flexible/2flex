import { Tree } from "./Tree";
import {
    BlockElements,
    CursorPos,
    ICustomEvents,
    IStyle,
    IRemovedEvents,
    ICssProperties,
    BlockOptions,
    IBlock,
} from "./types";
import { CanvasDOMManager } from "./DOMManager";
import { IText } from "./TextBlock";

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
        this.#domCanvas.changeStyle(this.options);
        this.zoom(this.#zoomInOut());
        this.move(this.#canvasMoves());
    }
    getBoundingClientRect() {
        return this.canvas.getBoundingClientRect();
    }

    add(...block: BlockElements[]) {
        this.#tree.addNodes(block);
        const rect = this.getBoundingClientRect();

        this.#tree.preOrderTraversal((element: any) => {
            element.canvas = this;
            // element.options.x = Math.abs(rect.left - element.options.x);
            // element.options.y = Math.abs(rect.top - element.options.y);
            this.#handleStyleChanges(element);
            element.__initSet();
            this.#canvasEvents.push(...element.events);
        });
        this.#handleEvents();
    }

    getCursorPosition(event: { clientX: number; clientY: number }) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const cursor: CursorPos = { x, y };
        return cursor;
    }

    #handleEvents() {
        // created events for every same type events beacuse canvas is same, but coridanets changing
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
                // const cursor = this.getCursorPosition(event);
                elem.methods?.forEach((_method: any) => {
                    _method(event);
                });
            });
        });
    }

    #handleStyleChanges(block: BlockElements): void {
        for (const [key, value] of Object.entries(block.options)) {
            const proto = Object.getPrototypeOf(block);
            const obj = Object.getOwnPropertyDescriptor(proto, key);
            obj?.value.call(block, value);
        }
    }

    invokeChange() {
        this.clearRect();
        this.#tree.checkNodes((element: any) => {
            this.#handleStyleChanges(element);
            element.__initSet();
        });
    }
    // we can do this later as and || or
    find(queries: IBlock<BlockOptions & IText>) {
        return this.#tree.filterNodes(queries);
    }

    zoom(_func: (event: any) => void) {
        this.#domCanvas.removeEventListener("wheel", this.#zoomInOut);
        this.#domCanvas.addEventListener("wheel", (event) => _func(event));
    }

    #zoomInOut() {
        return (event: WheelEvent) => {
            if (event.ctrlKey) {
                this.clearRect();
                if (event.deltaY < 0) {
                    this.#tree.checkNodes((element: any) => {
                        this.context.scale(1.02, 1.02);
                        this.#handleStyleChanges(element);
                    });
                } else {
                    this.#tree.checkNodes((element: any) => {
                        this.context.scale(0.95, 0.95);
                        this.#handleStyleChanges(element);
                    });
                }
            }
        };
    }
    clearRect() {
        // const rect = this.canvas.getBoundingClientRect();
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
            this.clearRect();
            if (event.shiftKey) {
                if (event.deltaY < 0) {
                    this.#tree.checkNodes((element: any) => {
                        element.options.x += 10;
                        // this.context.translate(
                        //     element.options.x + 5,
                        //     element.options.y
                        // );
                        this.#handleStyleChanges(element);
                    });
                } else {
                    this.#tree.checkNodes((element: any) => {
                        element.options.x -= 10;
                        this.#handleStyleChanges(element);
                    });
                }
            } else {
                if (event.deltaY < 0) {
                    this.#tree.checkNodes((element: any) => {
                        element.options.y += 10;
                        this.#handleStyleChanges(element);
                    });
                } else {
                    this.#tree.checkNodes((element: any) => {
                        element.options.y -= 10;
                        this.#handleStyleChanges(element);
                    });
                }
            }
        };
    }
}
