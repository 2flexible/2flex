// Each element in the canvas is block
import { Node } from "./Tree";

import {
    BlockElements,
    IBlock,
    CursorPos,
    ICustomEvents,
    BlockOptions,
    IStyle,
    IRemovedEvents,
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
    invoker: (() => void) | undefined = undefined;
    eventInvoker: ((event?: any) => void) | undefined = undefined;
    canvas: any;
    events: ICustomEvents[] = [];
    removedEvents: any[] = [];
    styleChanges: IStyle[] = [];

    constructor(options: IBlock<BlockOptions> | undefined = undefined) {
        super();
        this.options = { ...defaultOpt, ...options };
    }

    __initSet() {}

    add(...block: BlockElements[]): void {
        this.addChild(block);
    }
    registerStyle(styles: IStyle[]) {
        this.styleChanges.push(...styles);
    }

    checkInBound(_event: MouseEvent, cursor: CursorPos): boolean {
        const width = this.options.width;
        const height = this.options.height;

        const { x, y } = cursor;

        if (
            x >= this.options.x &&
            x <= this.options.x + width &&
            y >= this.options.y &&
            y <= this.options.y + height
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

    mousedown(_func: (event: MouseEvent) => void) {
        this.events.push({
            eventType: "mousedown",
            method: (event: MouseEvent, cursor: CursorPos) => {
                if (this.checkInBound(event, cursor)) {
                    _func(event);
                }
            },
        });
    }

    mouseup(_func: (event: MouseEvent) => void) {
        this.events.push({
            eventType: "mouseup",
            method: (event: MouseEvent, cursor: CursorPos) => {
                _func(event);
            },
        });
    }

    mousemove(_func: (event: MouseEvent) => void) {
        this.events.push({
            eventType: "mousemove",
            method: (event: MouseEvent, cursor: CursorPos) => {
                if (this.checkInBound(event, cursor)) {
                    _func(event);
                }
            },
        });
    }

    select() {}

    draggable(option: boolean = true) {
        const duplicat = this.events.filter(
            (elem) => elem.eventType === "mousedown"
        );
        if (option === false) return;
        if (duplicat.length > 1) return;

        let initX = 0;
        let initY = 0;
        let isMouseDown = false;

        this.mousedown((event) => {
            initX = event.clientX;
            initY = event.clientX;
            if (event.button === 0) {
                isMouseDown = true;
            }
        });
        this.mousemove((event) => {
            if (isMouseDown) {
                let diffX = event.clientX - initX;
                let diffY = initY - event.clientY;
                // console.log(initX, event.clientX, diffX);
                if (diffX !== 0) {
                    console.log(
                        this.options.x - Math.abs(this.options.x - diffX)
                    );
                    if (this.options.x > diffX) {
                        this.options.x +=
                            this.options.x - Math.abs(this.options.x - diffX);
                    }
                    this.options.x += diffX - this.options.x;
                }
                // if (diffY !== 0) {
                //     this.options.y += diffY;
                // }
                if (diffX !== 0 || diffY !== 0) {
                    this.invoker?.call(this.canvas);
                }
            }
        });
        this.mouseup(() => {
            isMouseDown = false;
        });
    }

    set(options: IBlock<BlockOptions>) {
        let cached = false;
        // this.styleChanges.forEach((change: IStyle) => {
        //     const option = options[change.styleType];
        //     const beforeOption = this.options[change.styleType];

        //     if (option) {
        //         if (option !== beforeOption) {
        //             change.method.call(this, option);
        //         } else {
        //             cached = true;
        //         }
        //     }
        // });

        for (const [key, value] of Object.entries(options)) {
            const proto = Object.getPrototypeOf(this);
            const obj = Object.getOwnPropertyDescriptor(proto, key);

            const beforeOption = this.options[key];

            if (value) {
                if (value !== beforeOption) {
                    obj?.value.call(this, value);
                } else {
                    cached = true;
                }
            }
        }

        if (!cached) {
            this.invoker?.call(this.canvas);
        }
    }
}
