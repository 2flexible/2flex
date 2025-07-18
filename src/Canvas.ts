import { Tree } from "./Tree";
import { BlockElements } from "./types";
import { Block } from ".";
import { TextBlock } from "./TextBlock";
import { CanvasDOMManager } from "./DOMManager";
// @Todo canvas can be from DOM, rather than node canvas
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
            element._canvas = this.canvas;

            this.#handleChanges(element);
        });

        this.#tree.addNode(...block);
    }

    

    #handleChanges(block: BlockElements): void {
        for (const option in block.options) {
            const proto = Object.getPrototypeOf(block);
            const obj = Object.getOwnPropertyDescriptor(proto, option);
            obj?.value.call(block);
        }
    }

    #handleEvents(block: BlockElements) {}
}
