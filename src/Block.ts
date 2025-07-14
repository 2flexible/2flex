// Each element in the canvas is block
import { Node } from "./Tree";
import { BlockElements, BlockOptions, IBlock } from "./types";
import { CanvasRenderingContext2D } from "canvas";

// each Block is Node
export class Block<T> extends Node {
    options: IBlock<T>;
    context: CanvasRenderingContext2D | undefined = undefined;

    x: number = 0;
    y: number = 0;

    constructor(options: IBlock<T>) {
        super();
        this.options = options;
        this.x = options.x;
        this.y = options.y;
    }

    add(...block: BlockElements[]): void {
        this.addChild(...block);
    }

    __handleChanges(): void {
        for (const option in this.options) {
            const proto = Block.prototype;
            if (option in proto) {
                const obj = Object.getOwnPropertyDescriptor(proto, option);
                obj?.value();
            }
        }
    }

    #resizeBox(width: number, height: number, x: number, y: number) {}
}

// const block = new Block().add();
