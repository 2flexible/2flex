// Each element in the canvas is block
import { IText } from "./TextBlock";
import { Node } from "./Tree";

import {
    BlockElements,
    IBlock,
    CursorPos,
    ICustomEvents,
    BlockOptions,
    IStyle,
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
    draggable: true,
};

// each Block is Node
export class Block extends Node {
    initX: undefined | number;
    initY: undefined | number;
    canvas: any;
    options: defaultBlockOptions;
    // too much events pushing
    events: ICustomEvents[] = [];
    styleChanges: IStyle[] = [];

    constructor(options?: IBlock<BlockOptions>) {
        super();
        this.options = { ...defaultOpt, ...options };
    }

    __initSet() {}

    get context() {
        return this.canvas.context;
    }

    add(...block: BlockElements[]): void {
        this.addChild(block);
    }

    registerStyle(styles: IStyle[]) {
        this.styleChanges.push(...styles);
    }

    x(option?: number) {
        this.options.x = option || this.options.x;
        return this.options.x;
    }

    y(option?: number) {
        this.options.y = option || this.options.y;
        return this.options.y;
    }

    width(option?: number) {
        this.options.width = option || this.options.width;
        return this.options.width;
    }

    height(option?: number) {
        this.options.height = option || this.options.height;
        return this.options.height;
    }

    color(option?: string) {
        this.options.color = option || this.options.color || "black";
        this.context.fillStyle = this.options.color;
        return this.options.color;
    }

    strokeColor(option?: string) {
        this.options.strokeColor =
            option || this.options.strokeColor || "black";
        this.context.strokeStyle = this.options.strokeColor;
        return this.options.strokeColor;
    }

    stroke(option?: number) {
        this.options.stroke = option || this.options.stroke || 10;
        this.context.lineWidth = this.options.stroke;
        return this.options.stroke;
    }

    fill() {
        this.context.fill();
    }

    set(options: IBlock<BlockOptions>) {
        let cached = false;

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
            this.canvas?.invokeChange.call(this.canvas);
        }
    }

    find(queries: IBlock<BlockOptions & IText> | undefined = undefined) {
        return this.filterNodes(queries);
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
                if (this.checkInBound(event)) {
                    _func(event);
                }
            },
        });
    }
    dbclick(_func: (event: MouseEvent) => void) {
        this.events.push({
            eventType: "dblclick",
            method: (event: MouseEvent) => {
                if (this.checkInBound(event)) {
                    _func(event);
                }
            },
        });
    }

    mousedown(_func: (event: MouseEvent) => void) {
        this.events.push({
            eventType: "mousedown",
            method: (event: MouseEvent) => {
                if (this.checkInBound(event)) {
                    _func(event);
                }
            },
        });
    }

    mouseup(_func: (event: MouseEvent) => void) {
        this.events.push({
            eventType: "mouseup",
            method: (event: MouseEvent) => {
                if (this.checkInBound(event)) {
                    _func(event);
                }
            },
        });
    }
    // unexcpected behavier due to not implimenting checkInbound
    mousemove(_func: (event: MouseEvent) => void) {
        this.events.push({
            eventType: "mousemove",
            method: (event: MouseEvent) => {
                _func(event);
            },
        });
    }

    mouseenter(_func: (event: MouseEvent) => void) {
        this.options.mouseenter = true;
        this.mousemove((event) => {
            if (this.checkInBound(event)) {
                if (this.options.mouseenter) {
                    this.options.mouseenter = false;
                    _func(event);
                }
            } else {
                this.options.mouseenter = true;
            }
        });
    }

    mouseleave(_func: (event: MouseEvent) => void) {
        this.options.mouseleave = false;
        this.mousemove((event) => {
            if (!this.checkInBound(event)) {
                if (this.options.mouseleave) {
                    _func(event);
                    this.options.mouseleave = false;
                }
            } else {
                this.options.mouseleave = true;
            }
        });
    }

    mouseout(_func: (event: MouseEvent) => void) {
        this.mousemove((event) => {
            if (!this.checkInBound(event)) {
                _func(event);
            }
        });
    }

    mouseover(_func: (event: MouseEvent) => void) {
        this.mousemove((event) => {
            if (this.checkInBound(event)) {
                _func(event);
            }
        });
    }

    selectable(option?: boolean): boolean {
        const duplicat = this.events.filter(
            (elem) => elem.eventType === "selectable"
        );

        if (!option || duplicat.length >= 1) return false;

        this.events.push({
            eventType: "selectable",
            method: () => {},
        });

        let old_color = this.options.color;

        this.mousemove((event) => {
            if (this.checkInBound(event)) {
                this.set({ color: "yellow" });
            } else {
                this.set({ color: old_color });
            }
        });
        this.options.selectable = option;

        return this.options.selectable;
    }

    draggable(option?: boolean): boolean {
        const duplicat = this.events.filter(
            (elem) => elem.eventType === "draggable"
        );
        if (!option || duplicat.length >= 1 || !this.options.selectable)
            return false;

        this.events.push({
            eventType: "draggable",
            method: () => {},
        });

        let isMouseDown = false;

        let initX = 0;
        let initY = 0;

        let beforeX = 0;
        let beforeY = 0;

        this.mousedown((event) => {
            const { x, y } = this.canvas.getCursorPosition(event);
            initX = x;
            initY = y;
            if (event.button === 0) {
                isMouseDown = true;
                beforeX = 0;
                beforeY = 0;
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
            isMouseDown = false;
        });
        this.options.draggable = option;
        return this.options.draggable;
    }
}
