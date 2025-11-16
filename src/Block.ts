import { Node } from "./Tree";

import {
    BlockElements,
    IBlock,
    ICustomEvents,
    BlockOptions,
    IStyle,
    AlignSelf,
    JustifySelf,
} from "./types";

interface CanvasInit {
    x: number;
    y: number;
    width: number;
    height: number;
}

// Each element in the canvas is block
// each Block is Node
export class Block extends Node {
    canvas: any;
    options: BlockOptions;
    events: ICustomEvents[] = [];
    canvasInit: CanvasInit = { x: 0, y: 0, width: 0, height: 0 };
    styleChanges: IStyle[] = [];
    beforeCords = { x: 0, y: 0 };
    constructor(options: BlockOptions) {
        super();
        this.options = options;
        this.canvasInit = {
            x: this.x(),
            y: this.y(),
            width: this.width(),
            height: this.height(),
        };
        this.beforeCords = {
            x: this.canvasInit.x,
            y: this.canvasInit.y,
        };
    }

    __initSet() {}

    get context() {
        return this.canvas?.context;
    }

    add(...block: BlockElements[]): void {
        this.addChild(block);
        this.__adjustCordinates();
    }

    __adjustCordinates(before?: any): void {
        before = before ? before : this.beforeCords;
        this._childs?.forEach((item: any) => {
            if (item) {
                item.canvasInit.x +=
                    this.x() + this.canvasInit.x - before.x + this.paddingLeft();
                item.canvasInit.y +=
                this.y() + 
                    this.canvasInit.y - before.y + this.paddingTop();
                item.__adjustCordinates(before);
            }
        });
    }

    x(opt?: number): number {
        return this.__cacheOption(opt, this.options?.x, 0);
    }

    y(opt?: number): number {
        return this.__cacheOption(opt, this.options?.y, 0);
    }

    width(opt?: number): number {
        const width = this.__cacheOption(opt, this.options?.width, 0);
        this.canvasInit.width = width;
        return width;
    }

    height(opt?: number): number {
        const height = this.__cacheOption(opt, this.options?.height, 0);
        this.canvasInit.height = height;
        return height;
    }

    padding(opt?: number[]) {
        this.options.padding = opt || this.options.padding || [];
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
    paddingTop(opt?: number) {
        return this.__cacheOption(opt, this.options.paddingTop, 0);
    }
    paddingBottom(opt?: number) {
        return this.__cacheOption(opt, this.options.paddingBottom, 0);
    }
    paddingLeft(opt?: number) {
        return this.__cacheOption(opt, this.options.paddingLeft, 0);
    }
    paddingRight(opt?: number) {
        return this.__cacheOption(opt, this.options.paddingRight, 0);
    }

    flexBasis(opt?: number | string): number | string {
        return this.__cacheOption(opt, this.options.flexBasis, "auto");
    }

    flexShrink(opt?: number): number {
        return this.__cacheOption(opt, this.options.flexShrink, 0);
    }

    flexGrow(opt?: number) {
        return this.__cacheOption(opt, this.options.flexGrow, 0);
    }

    order(opt?: number): undefined | number {
        return this.__cacheOption(opt, this.options.order, undefined);
    }

    alignSelf(opt?: AlignSelf) {
        return this.__cacheOption(opt, this.options.alignSelf, "auto");
    }
    justifySelf(opt?: JustifySelf) {
        return this.__cacheOption(opt, this.options.justifySelf, "auto");
    }
    gridRow(opt?: number[]) {
        return this.__cacheOption(opt, this.options.gridRow, []);
    }
    gridRowStart(opt?: number | string) {
        return this.__cacheOption(opt, this.options.gridRowStart, 0);
    }
    gridRowEnd(opt?: number | string) {
        return this.__cacheOption(opt, this.options.gridRowEnd, 0);
    }
    gridColumn(opt?: number[]) {
        return this.__cacheOption(opt, this.options.gridColumn, []);
    }
    gridColumnStart(opt?: number | string) {
        return this.__cacheOption(opt, this.options.gridColumnStart, 0);
    }
    gridColumnEnd(opt?: number | string) {
        return this.__cacheOption(opt, this.options.gridColumnEnd, 0);
    }
    gridArea(opt?: number[] | string) {
        const gridArea = this.__cacheOption(opt, this.options.gridArea, []);
        this.gridRowStart(gridArea[0] || "auto");
        this.gridColumnStart(gridArea[1] || "auto");
        this.gridRowEnd(gridArea[2] || "auto");
        this.gridColumnEnd(gridArea[3] || "auto");
        return gridArea;
    }
    clip_path() {
        this.canvas.clipping_path.addRect(
            this.canvasInit.x,
            this.canvasInit.y,
            this.width(),
            this.height()
            // this.borderRadius()
        );
    }

    clip(opt?: boolean) {
        const clip = this.__cacheOption(opt, this.options.clip, false);
        if (clip) {
            this.clip_path();

            if (!this.fillRule()) this.fillRule();

            this.context.clip(this.canvas.clipping_path.path, this.fillRule());
        }
        return clip;
    }

    fillRule(opt?: string) {
        return this.__cacheOption(opt, this.options.fillRule, "nonzero");
    }

    zIndex(opt?: number): number | undefined {
        return this.__cacheOption(opt, this.options.zIndex, undefined);
    }

    set(options?: IBlock<BlockOptions>): void {
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

    __cacheOption<T>(
        opt: T | undefined,
        option: T | undefined,
        defaultOpt: T
    ): T {
        option = opt || option || defaultOpt;
        return option;
    }

    reset() {}

    rotate(opt?: number): number {
        const rotate = this.__cacheOption(opt, this.options.rotate, 0);
        this.context.rotate(rotate);
        return rotate;
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
        const { x, y } = this.canvas.getCursorPosition(_event);

        // include broder or stroke for dragging within them
        if (
            x >= this.canvasInit.x &&
            x <= this.canvasInit.x + this.width() &&
            y >= this.canvasInit.y &&
            y <= this.canvasInit.y + this.height()
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
        if (!opt && duplicat.length >= 1) return false;

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
        this.options.selectable = this.__cacheOption(
            opt,
            this.options.selectable,
            true
        );
        return this.options.selectable;
    }
    dragX(opt?: boolean) {
        return this.__cacheOption(opt, this.options.dragX, true);
    }
    dragY(opt?: boolean): boolean {
        return this.__cacheOption(opt, this.options.dragY, true);
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
                this.beforeCords.x = this.canvasInit.x;
                if (diffX !== 0 && this.dragX()) {
                    this.canvasInit.x += diffX - beforeX;
                    beforeX = diffX;
                }
                this.beforeCords.y = this.canvasInit.y;
                if (diffY !== 0 && this.dragY()) {
                    this.canvasInit.y += diffY - beforeY;
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
