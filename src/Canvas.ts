import { Tree } from "./Tree";
import { BlockElements, CursorPos } from "./types";
import { CanvasDOMManager } from "./DOMManager";

export class Canvas {
    width: number;
    height: number;
    domCanvas: CanvasDOMManager;
    #tree = new Tree();

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.domCanvas = new CanvasDOMManager();
    }

    get context() {
        return this.canvas.getContext("2d");
    }

    get canvas() {
        return this.domCanvas.canvas;
    }

    add(...block: BlockElements[]) {
        const context = this.context;

        // Traversal alghorithm for all Nodes
        block.forEach((element) => {
            element._context = context;
            this.#handleStyleChanges(element);
            this.#handleEvents(element);
        });

        this.#tree.addNode(...block);
    }

    getCursorPosition(event: { clientX: number; clientY: number }) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const cursor: CursorPos = { x, y };
        return cursor;
    }

    #handleEvents(element: BlockElements) {
        element.events.forEach((elem: any) => {
            this.canvas.addEventListener(elem.type, (event) => {
                const cursor = this.getCursorPosition(event);
                elem.method(event, cursor);
            });
        });
    }

    #handleStyleChanges(block: BlockElements): void {
        for (const option in block.options) {
            const proto = Object.getPrototypeOf(block);
            const obj = Object.getOwnPropertyDescriptor(proto, option);
            obj?.value.call(block);
        }
    }
}
