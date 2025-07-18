// Each element in the canvas is block
import { Node } from "./Tree";
import { BlockElements, BlockOptions, IBlock } from "./types";
import { CanvasRenderingContext2D } from "canvas";
import { Canvas } from "./Canvas";

// each Block is Node
export class Block<T> extends Node {
    options: IBlock<T>;
    __context: CanvasRenderingContext2D = new Canvas(200, 200).getCanvas();

    x: number = 0;
    y: number = 0;

    constructor(options: IBlock<T>) {
        super();
        this.options = options;
        this.x = options.x!;
        this.y = options.y!;
    }

    add(...block: BlockElements[]): void {
        this.addChild(...block);
    }

    #resizeBox(width: number, height: number, x: number, y: number) {}
}

// const block = new Block().add();
