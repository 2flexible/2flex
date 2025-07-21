// Each element in the canvas is block
import { Node } from "./Tree";
import { BlockElements, IBlock, CursorPos, ICustomEvents } from "./types";

// each Block is Node
export class Block<T> extends Node {
    options: IBlock<T>;
    _context: any;
    events: ICustomEvents[] = [];
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

    checkInBound(_event: MouseEvent, cursor: CursorPos): boolean {
        const width = this.options.width || 0;
        const height = this.options.height || 0;

        const { x, y } = cursor;

        if (
            x > this.x &&
            x < this.x + width &&
            y > this.y &&
            x < this.y + height
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

    set(options: IBlock<T>) {
        for (const [key, value] of Object.entries(options)) {
            if (key in Object.keys(this.options)) {
            } else {
                return;
            }
        }
        this.options = { ...this.options, ...options };
    }

    // addEvent(_type: Events, _func: (_event: MouseEvent) => void) {
    //     if (this.checkInBound(_event)) {
    //         this.events.push({ type: _type, method: _func(_event) });
    //     }
    // }

    #resizeBox(width: number, height: number, x: number, y: number) {}
}
