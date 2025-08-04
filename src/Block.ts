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

export interface DefaultBlockOpt {
    [key: string]: any;
    x: number;
    y: number;
    width: number;
    height: number;
    selectable: boolean;
    zIndex: number;
}

const defaultOpt: DefaultBlockOpt = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    selectable: true,
    draggable: true,
    dragX: true,
    dragY: true,
    zIndex: 0,
};

interface InitCords {
    x: number | undefined;
    y: number | undefined;
}

// Each element in the canvas is block
// each Block is Node
export class Block extends Node {
    canvas: any;
    options: DefaultBlockOpt;
    events: ICustomEvents[] = [];
    initCords: InitCords = {
        x: undefined,
        y: undefined,
    };
    styleChanges: IStyle[] = [];

    constructor(options?: IBlock<BlockOptions>) {
        super();
        this.options = { ...defaultOpt, ...options };
    }

    __initSet() {
        if (!this.initCords.x) {
            this.initCords.x = this.options.x;
        }
        if (!this.initCords.y) {
            this.initCords.y = this.options.y;
        }
    }

    get context() {
        return this.canvas.context;
    }

    add(...block: BlockElements[]): void {
        this.addChild(block);
        this.#adjustCordinates();
    }

    #adjustCordinates(): void {
        this.initCords.x =
            this.options.x !== this.initCords.x
                ? this.options.x
                : this.initCords.x;

        this.initCords.y =
            this.options.y !== this.initCords.y
                ? this.options.y
                : this.initCords.y;

        this._childs?.forEach((item: any) => {
            item.initCords.x = this.initCords.x + item.options.x;
            item.initCords.y = this.initCords.y + item.options.y;
        });
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

    strokeWidth(option?: number) {
        this.options.strokeWidth = option || this.options.strokeWidth || 10;
        this.context.lineWidth = this.options.strokeWidth;
        return this.options.strokeWidth;
    }

    stroke(option?: boolean) {
        this.options.stroke = option || this.options.stroke || false;
        if (this.options.stroke) {
            this.context.stroke();
        }
        return this.options.stroke;
    }

    clip(option?: boolean) {
        this.options.clip = option || this.options.clip || false;

        if (this.options.clip) {
            this.canvas.clipping_path.addRect(
                this.initCords.x,
                this.initCords.y,
                this.options.width,
                this.options.height,
                this.options.borderRadius
            );

            if (!this.options.fillRule) this.fillRule();

            this.context.clip(
                this.canvas.clipping_path.path,
                this.options.fillRule
            );
        }
        return this.options.clip;
    }

    fillRule(option?: string) {
        this.options.fillRule = option || this.options.fillRule || "nonzero";
        return this.options.fillRule;
    }

    zIndex(option?: number) {
        this.options.zIndex = option || this.options.zIndex;
        return this.options.zIndex;
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
            x >= this.initCords.x! &&
            x <= this.initCords.x! + width &&
            y >= this.initCords.y! &&
            y <= this.initCords.y! + height
        )
            return true;
        return false;
    }

    click(_func: (event: MouseEvent) => void) {
        this.events.push({
            eventType: "click",
            method: (event: MouseEvent) => {
                if (this.options.selectable && this.checkInBound(event)) {
                    _func(event);
                }
            },
        });
    }

    dbclick(_func: (event: MouseEvent) => void) {
        this.events.push({
            eventType: "dblclick",
            method: (event: MouseEvent) => {
                if (this.options.selectable && this.checkInBound(event)) {
                    _func(event);
                }
            },
        });
    }

    mousedown(_func: (event: MouseEvent) => void) {
        this.events.push({
            eventType: "mousedown",
            method: (event: MouseEvent) => {
                if (this.options.selectable && this.checkInBound(event)) {
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
            if (this.options.selectable && this.checkInBound(event)) {
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
            if (this.options.selectable && this.checkInBound(event)) {
                _func(event);
            }
        });
    }

    selectableAction(_func: (event: MouseEvent) => void) {
        this.events.push({
            eventType: "mousemove",
            method: (event: MouseEvent) => {
                if (!this.options.mousedown && this.checkInBound(event)) {
                    _func(event);
                }
            },
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
            if (!this.options.mousedown && this.checkInBound(event)) {
                this.set({ color: "yellow" });
            } else {
                this.set({ color: old_color });
            }
        });
        this.options.selectable = option;

        return this.options.selectable;
    }
    dragX(option?: boolean) {
        this.options.dragX = option || this.options.dragX;
        return this.options.dragX;
    }
    dragY(option?: boolean) {
        this.options.dragY = option || this.options.dragY;
        return this.options.dragY;
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
                this.options.mousedown = isMouseDown;
            }
        });

        this.mousemove((event) => {
            if (isMouseDown) {
                const { x, y } = this.canvas.getCursorPosition(event);

                let diffX = x - initX;
                let diffY = y - initY;
                if (diffX !== 0 && this.options.dragX) {
                    this.options.x += diffX - beforeX;

                    beforeX = diffX;
                }
                if (diffY !== 0 && this.options.dragY) {
                    this.options.y += diffY - beforeY;
                    beforeY = diffY;
                }
                this.#adjustCordinates();
                this.canvas.invokeChange?.call(this.canvas);
            }
        });

        this.mouseup((event) => {
            isMouseDown = false;
            this.options.mousedown = isMouseDown;
        });
        this.options.draggable = option;
        return this.options.draggable;
    }
}
