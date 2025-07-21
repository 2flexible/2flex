// Each element in the canvas is block
import { Node } from "./Tree";
import {
    BlockElements,
    IBlock,
    CursorPos,
    ICustomEvents,
    BlockOptions,
} from "./types";

const defaultOpt = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
};

export interface defaultBlockOptions {
    [key: string]: any;
    x: number;
    y: number;
    width: number;
    height: number;
}

// each Block is Node
export class Block extends Node {
    options: defaultBlockOptions;
    _context: any;
    events: ICustomEvents[] = [];

    constructor(options: IBlock<BlockOptions> | undefined) {
        super();
        this.options = { ...defaultOpt, ...options };
    }

    initSet() {}

    add(...block: BlockElements[]): void {
        this.addChild(block);
    }

    checkInBound(_event: MouseEvent, cursor: CursorPos): boolean {
        const width = this.options.width;
        const height = this.options.height;

        const { x, y } = cursor;

        if (
            x > this.options.x &&
            x < this.options.x + width &&
            y > this.options.y &&
            x < this.options.y + height
        )
            return true;

        return false;
    }

    click(_func: (event: MouseEvent) => void) {
        this.events.push({
            eventType: "click",
            method: (event: MouseEvent, cursor: CursorPos) => {
                if (this.checkInBound(event, cursor)) {
                    _func(event);
                }
            },
        });
    }

    set(options: IBlock<BlockOptions>) {
        for (const [key, value] of Object.entries(options)) {
            if (key in Object.keys(this.options!)) {
            } else {
                return;
            }
        }
        this.options = { ...this.options, ...options };
    }

    #resizeBox(width: number, height: number, x: number, y: number) {}
}
