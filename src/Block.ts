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

export interface defaultBlockOptions {
    [key: string]: any;
    x: number;
    y: number;
    width: number;
    height: number;
    selectable: boolean;
}

const defaultOpt: defaultBlockOptions = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    selectable: true,
};

// each Block is Node
export class Block extends Node {
    options: defaultBlockOptions;
    canvas: any;
    events: ICustomEvents[] = [];
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

    checkInBound(_event: MouseEvent): boolean {
        const width = this.options.width;
        const height = this.options.height;

        const { x, y } = this.canvas.getCursorPosition(_event);

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
            method: (event: MouseEvent) => {
                _func(event);
            },
        });
    }

    mousedown(_func: (event: MouseEvent) => void) {
        this.events.push({
            eventType: "mousedown",
            method: (event: MouseEvent) => {
                _func(event);
            },
        });
    }

    mouseup(_func: (event: MouseEvent) => void) {
        this.events.push({
            eventType: "mouseup",
            method: (event: MouseEvent) => {
                _func(event);
            },
        });
    }

    mousemove(_func: (event: MouseEvent) => void) {
        this.events.push({
            eventType: "mousemove",
            method: (event: MouseEvent) => {
                _func(event);
            },
        });
    }

    mouseover(_func: (event: MouseEvent) => void) {
        this.events.push({
            eventType: "mouseover",
            method: (event: MouseEvent) => {
                _func(event);
            },
        });
    }

    selectable(option?: boolean) {
        if (option === false) return;

        let old_color = this.options.color;

        this.mousemove((event) => {
            if (this.checkInBound(event)) {
                this.set({ color: "yellow" });
            } else {
                this.set({ color: old_color });
            }
        });
    }

    draggable(option: boolean = true) {
        const duplicat = this.events.filter(
            (elem) => elem.eventType === "mousedown"
        );
        if (option === false) return;
        if (duplicat.length > 1) return;

        let isMouseDown = false;

        let initX = 0;
        let initY = 0;

        let beforeX = 0;
        let beforeY = 0;

        this.mousedown((event) => {
            if (this.checkInBound(event)) {
                const { x, y } = this.canvas.getCursorPosition(event);
                initX = x;
                initY = y;
                if (event.button === 0) {
                    isMouseDown = true;
                    beforeX = 0;
                    beforeY = 0;
                }
            }
        });

        this.mousemove((event) => {
            if (isMouseDown) {
                const { x, y } = this.canvas.getCursorPosition(event);

                let diffX = x - initX;
                let diffY = y - initY;

                if (diffX !== 0) {
                    this.options.x += diffX - beforeX;
                    beforeX = diffX;
                }
                if (diffY !== 0) {
                    this.options.y += diffY - beforeY;
                    beforeY = diffY;
                }
                if (diffX !== 0 || diffY !== 0) {
                    this.canvas.invokeChange?.call(this.canvas);
                }
            }
        });

        this.mouseup((event) => {
            if (this.checkInBound(event)) {
            }
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
            this.canvas.invokeChange?.call(this.canvas);
        }
    }
}
