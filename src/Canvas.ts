import { createCanvas } from "canvas";
import { Tree } from "./Tree";
import { BlockElements } from "./types";
import { Block } from ".";
import { TextBlock } from "./TextBlock";

// @Todo canvas can be from DOM, rather than node canvas
export class Canvas {
    width: number;
    height: number;

    #tree = new Tree();

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    getCanvas() {
        const canvas = createCanvas(this.width, this.height);
        const ctx = canvas.getContext("2d");
        return ctx;
    }

    add(...block: BlockElements[]) {
        const context = this.getCanvas();

        // Traversal alghorithm for all Nodes
        block.forEach((element) => {
            element.__context = context;
            this.__handleChanges(element);
        });

        this.#tree.addNode(...block);
    }

    __handleChanges(block: BlockElements): void {
        for (const option in block.options) {
            const proto = Object.getPrototypeOf(block);
            const obj = Object.getOwnPropertyDescriptor(proto, option);
            obj?.value.call(block);
        }
    }
}
