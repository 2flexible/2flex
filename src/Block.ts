import { IText } from "./TextBlock";
import { Node } from "./Tree";

import {
    BlockElements,
    IBlock,
    CursorPos,
    ICustomEvents,
    BlockOptions,
    IStyle,
    MixOpt,
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
    strokeWidth: 0,
    padding: [0],
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
        x: 0,
        y: 0,
    };
    styleChanges: IStyle[] = [];

    constructor(options?: IBlock<BlockOptions>) {
        super();
        this.options = { ...defaultOpt, ...options };
        this.initCords.x = this.options.x;
        this.initCords.y = this.options.y;
    }

    __initSet() {}

    get context() {
        return this.canvas.context;
    }

    add(...block: BlockElements[]): void {
        this.addChild(block);
        this.__adjustCordinates();
    }

    __adjustCordinates(): void {
        this._childs?.forEach((item: any) => {
            if (item) {
                item.initCords.x = this.initCords.x + item.options.x + this.options.paddingLeft;
                item.initCords.y = this.initCords.y + item.options.y + this.options.paddingTop;
                item.__adjustCordinates();
            }
        });
    }

    x(opt?: number) {
        this.options.x = opt || this.options.x;
        return this.options.x;
    }

    y(opt?: number) {
        this.options.y = opt || this.options.y;
        return this.options.y;
    }

    width(opt?: number) {
        this.options.width = opt || this.options.width;
        return this.options.width;
    }

    height(opt?: number) {
        this.options.height = opt || this.options.height;
        return this.options.height;
    }

    padding(opt?: number[]) {
        this.options.padding = opt || this.options.padding;
        switch (this.options.padding.length) {
            case 1:
                this.options.paddingBottom =
                    this.options.paddingLeft =
                    this.options.paddingRight =
                        this.options.padding[0];
                break;
            case 2:
                this.options.paddingBottom = this.options.padding[0];
                this.options.paddingLeft = this.options.paddingRight =
                    this.options.padding[1];
                break;
            case 3:
                this.options.paddingBottom = this.options.padding[2];
                this.options.paddingLeft = this.options.paddingRight =
                    this.options.padding[1];
                break;
            case 4:
                this.options.paddingBottom = this.options.padding[1];
                this.options.paddingRight = this.options.padding[1];
                this.options.paddingLeft = this.options.padding[2];
                break;
        }
        this.options.paddingTop = this.options.padding[0];

        return this.options.padding;
    }

    clip_path() {
        this.canvas.clipping_path.addRect(
            this.initCords.x,
            this.initCords.y,
            this.options.width,
            this.options.height,
            this.options.borderRadius
        );
    }

    clip(opt?: boolean) {
        this.options.clip = opt || this.options.clip || false;

        if (this.options.clip) {
            this.clip_path();

            if (!this.options.fillRule) this.fillRule();

            this.context.clip(
                this.canvas.clipping_path.path,
                this.options.fillRule
            );
        }
        return this.options.clip;
    }

    fillRule(opt?: string) {
        this.options.fillRule = opt || this.options.fillRule || "nonzero";
        return this.options.fillRule;
    }

    zIndex(opt?: number) {
        this.options.zIndex = opt || this.options.zIndex;
        return this.options.zIndex;
    }

    set(options?: IBlock<BlockOptions>) {
        let cached = false;
        if (options)
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

    __cacheOption(option: MixOpt, def: MixOpt, opt?: any): any {
        opt = opt || option || def;
        return opt;
    }

    reset() {}

    rotate(opt: number) {
        this.options.rotate = opt || this.options.angle || 0;
        this.context.rotate(this.options.angle);
        return this.options.rotate;
    }
    // had to come first for block scaling
    scale(x: number, y: number) {
        this.context.scale(x, y);
    }
    bind(block: BlockElements[], options?: IBlock<BlockOptions>) {}

    find(queries?: IBlock<BlockOptions>) {
        return this.filterNodes(queries);
    }
    nthChild(opt?: number) {}
    checkInBound(_event: MouseEvent): boolean {
        const width = this.options.width;
        const height = this.options.height;

        const { x, y } = this.canvas.getCursorPosition(_event);

        // include broder or stroke for dragging within them
        const diffX = Math.abs(this.initCords.x!);
        const diffY = Math.abs(this.initCords.y!);
        if (
            x >= diffX &&
            x <= this.initCords.x! + width &&
            y >= diffY &&
            y <= this.initCords.y! + height
        ) {
            return true;
        }

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

    selectable(opt?: boolean): boolean {
        const duplicat = this.events.filter(
            (elem) => elem.eventType === "selectable"
        );

        if (!opt || duplicat.length >= 1) return false;

        this.events.push({
            eventType: "selectable",
            method: () => {},
        });

        // let old_color = this.options.borderColor;
        // this.mousemove((event) => {
        //     if (!this.options.mousedown && this.checkInBound(event)) {
        //         this.set({ color: "yellow" });
        //     } else {
        //         this.set({ color: old_color });
        //     }
        // });
        this.options.selectable = opt;

        return this.options.selectable;
    }
    dragX(opt?: boolean) {
        this.options.dragX = opt || this.options.dragX;
        return this.options.dragX;
    }
    dragY(opt?: boolean) {
        this.options.dragY = opt || this.options.dragY;
        return this.options.dragY;
    }
    draggable(opt?: boolean): boolean {
        const duplicat = this.events.filter(
            (elem) => elem.eventType === "draggable"
        );
        if (!opt || duplicat.length >= 1 || !this.options.selectable)
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
                    this.initCords.x = this.initCords.x
                        ? this.initCords.x
                        : this.options.x;
                    this.initCords.x += diffX - beforeX;
                    beforeX = diffX;
                }
                if (diffY !== 0 && this.options.dragY) {
                    this.initCords.y = this.initCords.y
                        ? this.initCords.y
                        : this.options.y;
                    this.initCords.y += diffY - beforeY;
                    beforeY = diffY;
                }
                this.__adjustCordinates();
                this.canvas.invokeChange?.call(this.canvas);
            }
        });

        this.mouseup((event) => {
            isMouseDown = false;
            this.options.mousedown = isMouseDown;
        });
        this.options.draggable = opt;
        return this.options.draggable;
    }
}
