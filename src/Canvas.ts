import { Tree } from "./Tree";
import { BlockElements, CursorPos, ICustomEvents, IStyle } from "./types";
import { CanvasDOMManager } from "./DOMManager";

export interface CanvasOptions {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    color?: string;
    stroke?: string;
    margin?: string;
}

const defaultCanvasOpt = {
    x: 0,
    y: 0,
    color: "#FFFFFF",
};

export class Canvas {
    width: number;
    height: number;
    domCanvas: CanvasDOMManager;
    options: CanvasOptions;
    #tree = new Tree();

    constructor(
        width: number,
        height: number,
        options: CanvasOptions | undefined = undefined
    ) {
        this.width = width || 200;
        this.height = height || 200;
        this.options = { ...options, ...defaultCanvasOpt };
        this.domCanvas = new CanvasDOMManager();
        this.#initCanvas();
    }

    get context() {
        return this.domCanvas.context;
    }

    get canvas() {
        return this.domCanvas.canvas;
    }

    #initCanvas() {
        this.canvas;
    }

    add(...block: BlockElements[]) {
        this.#tree.addNodes(block);

        this.#tree.pre_order_traversal((element: any) => {
            element._context = this.context;
            element.canvas = this;
            element.__initSet();
            element.invoker = this.invokeChange;
            this.#handleStyleChanges(element);
            this.#handleEvents(element);
        });
    }

    getCursorPosition(event: { clientX: number; clientY: number }) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const cursor: CursorPos = { x, y };
        return cursor;
    }

    #handleEvents(element: BlockElements) {
        element.events?.forEach((elem: ICustomEvents) => {
            this.domCanvas.addEventListener(elem.eventType, (event) => {
                const cursor = this.getCursorPosition(event);
                elem.method(event, cursor);
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
        console.log("cached");
        this.context?.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.#tree.pre_order_traversal((element: any) => {
            this.#handleStyleChanges(element);
        });
    }
}
