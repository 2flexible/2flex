import { Tree } from "./Tree";
import { BlockElements, CursorPos } from "./types";
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
    width: 200,
    heigth: 200,
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
        this.width = width;
        this.height = height;
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
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        // this.canvas.style.background = this.options.color;
    }

    add(...block: BlockElements[]) {
        // Traversal alghorithm for all Nodes
        this.#tree.addNodes(block);
        this.#tree.pre_order_traversal((element: any) => {
            element._context = this.context;
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
        element.events?.forEach((elem: any) => {
            this.canvas.addEventListener(elem.type, (event) => {
                const cursor = this.getCursorPosition(event);
                elem.method(event, cursor);
            });
        });
    }

    #handleStyleChanges(block: BlockElements): void {
        const proto = Object.getPrototypeOf(block);

        for (const option in block.options) {
            block.initSet();
            const obj = Object.getOwnPropertyDescriptor(proto, `__${option}`);
            obj?.value.call(block);
        }
    }
}
