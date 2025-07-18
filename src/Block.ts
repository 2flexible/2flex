// Each element in the canvas is block
import { Node } from "./Tree";
import { BlockElements, BlockOptions, IBlock } from "./types";
import { Canvas } from "./Canvas";
import { CanvasDOMManager } from "./DOMManager";

type Event = "click";

// type CanvasContext = typeof CanvasRenderingContext2D;

// each Block is Node
export class Block<T> extends Node {
    options: IBlock<T>;
    _canvas: HTMLCanvasElement | any;
    _context: any;

    x: number = 0;
    y: number = 0;

    constructor(options: IBlock<T>) {
        super();
        this.options = options;
        this.x = options.x ? options.x : this.x;
        this.y = options.y ? options.y : this.y;
    }

    add(...block: BlockElements[]): void {
        this.addChild(...block);
    }

    getCursorPosition(event: { clientX: number; clientY: number }) {
        const rect = this._canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        return { x, y };
    }

    click(_func: () => void) {
        const width = this.options.width || 0;
        const height = this.options.height || 0;

        this._canvas.addEventListener("click", (_event: MouseEvent) => {
            const { x, y } = this.getCursorPosition(_event);
            if (
                x > this.x &&
                x < this.x + width &&
                y > this.y &&
                x < this.y + height
            ) {
                _func();
            }
        });
    }

    #resizeBox(width: number, height: number, x: number, y: number) {}
}
