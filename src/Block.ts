import { Node } from "./Tree";

import {
    BlockElements,
    IBlock,
    ICustomEvents,
    BlockOptions,
    IStyle,
    AlignSelf,
    JustifySelf,
    Flex,
    FlexGrow,
    FlexShrink,
    FlexBasis,
    Position,
} from "./types";

interface CanvasInit {
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex?: number;
}

// Each element in the canvas is block
// each Block is Node
export class Block extends Node {
    canvas: any;
    options: BlockOptions;
    events: ICustomEvents[] = [];
    canvasInit: CanvasInit = { x: 0, y: 0, width: 0, height: 0, zIndex: 0 };
    styleChanges: IStyle[] = [];
    beforeInit = { x: 0, y: 0, width: 0, height: 0 };
    #isPosApplied = false;

    constructor(options: BlockOptions) {
        super();
        this.options = options;
        this.padding();
        this.margin();
        this.canvasInit = {
            x: this.x() + this.marginLeft(),
            y: this.y() + this.marginTop(),
            width: this.width() + this.paddingLeft() + this.paddingRight(),
            height: this.height() + this.paddingTop() + this.paddingBottom(),
        };
        this.beforeInit = {
            x: this.canvasInit.x,
            y: this.canvasInit.y,
            width: this.canvasInit.width,
            height: this.canvasInit.height,
        };
    }

    __initSet() {
        const pos = this.position();
        if (pos === "fixed" && !this.options.draggable) {
            if (this.options.top) {
                this.canvasInit.y =
                    -this.canvas.__positionCords.y + this.options.top;
            } else if (this.options.bottom) {
                this.canvasInit.y =
                    -this.canvas.__positionCords.y +
                    Math.abs(this.canvas.height - this.canvasInit.height);
                -this.options.bottom;
            }

            if (this.options.left) {
                this.canvasInit.x =
                    -this.canvas.__positionCords.x + this.left();
            } else if (this.options.right) {
                this.canvasInit.x =
                    -this.canvas.__positionCords.x +
                    Math.abs(this.canvas.width - this.canvasInit.width) -
                    this.options.right;
            }
        }
        if (pos === "sticky" && !this.options.draggable) {
            if (this.canvas.__positionCords.y < 0) {
                if (
                    this.options.top &&
                    this.canvas.__positionCords.y <=
                        Math.abs(this.canvas.height - this.canvasInit.height) -
                            this.canvasInit.y
                ) {
                    this.canvasInit.y =
                        -this.canvas.__positionCords.y + this.options.top;
                }
            } else {
                if (
                    this.options.bottom &&
                    this.canvas.__positionCords.y + this.options.bottom >=
                        Math.abs(this.canvas.height - this.canvasInit.height) -
                            Math.abs(this.canvasInit.y)
                ) {
                    this.canvasInit.y =
                        -this.canvas.__positionCords.y +
                        Math.abs(this.canvas.height - this.canvasInit.height) -
                        this.options.bottom;
                }
            }
            if (this.canvas.__positionCords.x < 0) {
                if (
                    this.options.left &&
                    this.canvas.__positionCords.x <=
                        Math.abs(this.canvas.width - this.canvasInit.width) -
                            this.canvasInit.x
                ) {
                    this.canvasInit.x =
                        -this.canvas.__positionCords.x + this.options.left;
                }
            } else {
                const diffX = Math.abs(
                    this.canvas.width - this.canvasInit.width
                );
                if (
                    this.options.right &&
                    this.canvas.__positionCords.x + this.options.right >=
                        diffX - Math.abs(this.canvasInit.x)
                ) {
                    this.canvasInit.x =
                        -this.canvas.__positionCords.x +
                        diffX -
                        this.options.right;
                }
            }
        }
        if (pos === "absolute" && !this.#isPosApplied) {
            if (this.options.left !== undefined)
                this.canvasInit.x = this.options.left;
            else if (this.options.right !== undefined)
                this.canvasInit.x =
                    Math.abs(this.canvas.width - this.width()) -
                    this.options.right;
            if (this.options.top !== undefined)
                this.canvasInit.y = this.options.top;
            else if (this.options.bottom !== undefined)
                this.canvasInit.y =
                    Math.abs(this.canvas.height - this.height()) -
                    this.options.bottom;
            this.#isPosApplied = true;
        }
        if (pos === "relative" && !this.#isPosApplied) {
            if (this.options.left !== undefined)
                this.canvasInit.x += this.options.left;
            else if (this.options.right !== undefined)
                this.canvasInit.x -= this.options.right;
            if (this.options.top !== undefined)
                this.canvasInit.y += this.options.top;
            else if (this.options.bottom !== undefined)
                this.canvasInit.y -= this.options.bottom;
            this.#isPosApplied = true;
        }
    }

    get context() {
        return this.canvas?.context;
    }

    add(...block: BlockElements[]): void {
        this.addChild(block);
        this.__adjustSpaces();
        this.__adjustCordinates();
    }
    __adjustSpaces() {
        this._childs?.forEach((item: any) => {
            if (item) {
                item.canvasInit.x +=
                    this.marginLeft() +
                    this.x() +
                    this.paddingLeft() -
                    this.paddingRight();
                item.canvasInit.y +=
                    this.marginTop() +
                    this.y() +
                    this.paddingTop() -
                    this.paddingBottom();
            }
        });
    }
    __adjustCordinates(before?: any): void {
        before = before || this.beforeInit;
        this._childs?.forEach((item: any) => {
            if (item) {
                item.canvasInit.x += this.canvasInit.x - before.x;
                item.canvasInit.y += this.canvasInit.y - before.y;
                item.__adjustCordinates(before);
            }
        });
    }

    x(opt?: number): number {
        const x = this.__cacheOption(opt, "x", 0);
        if (opt !== undefined) this.canvasInit.x = x;
        return x;
    }

    y(opt?: number): number {
        const y = this.__cacheOption(opt, "y", 0);
        if (opt !== undefined) this.canvasInit.y = y;
        return y;
    }

    width(opt?: number): number {
        const width = this.__cacheOption(opt, "width", 0);
        if (opt) this.canvasInit.width = width;
        return width;
    }

    height(opt?: number): number {
        const height = this.__cacheOption(opt, "height", 0);
        if (opt) this.canvasInit.height = height;
        return height;
    }
    position(opt?: Position) {
        return this.__cacheOption(opt, "position", "static");
    }
    top(opt?: number) {
        if (this.position() === "static") opt = 0;
        return this.__cacheOption(opt, "top", 0);
    }
    bottom(opt?: number) {
        if (this.position() === "static") opt = 0;
        return this.__cacheOption(opt, "bottom", 0);
    }
    left(opt?: number) {
        if (this.position() === "static") opt = 0;
        return this.__cacheOption(opt, "left", 0);
    }
    right(opt?: number) {
        if (this.position() === "static") opt = 0;
        return this.__cacheOption(opt, "right", 0);
    }

    padding(opt?: number[]) {
        const padding = this.__cacheOption(opt, "padding", undefined);
        if (!padding) return padding;
        this.paddingTop(padding[0]);
        switch (padding.length) {
            case 1:
                this.paddingBottom(padding[0]);
                this.paddingLeft(padding[0]);
                this.paddingRight(padding[0]);
                break;
            case 2:
                this.paddingBottom(padding[0]);
                this.paddingLeft(padding[1]);
                this.paddingRight(padding[1]);
                break;
            case 3:
                this.paddingLeft(padding[1]);
                this.paddingRight(padding[1]);
                this.paddingBottom(padding[2]);
                break;
            case 4:
                this.paddingRight(padding[1]);
                this.paddingBottom(padding[2]);
                this.paddingLeft(padding[3]);
                break;
        }
        return padding;
    }
    paddingTop(opt?: number) {
        return this.__cacheOption(opt, "paddingTop", 0);
    }
    paddingBottom(opt?: number) {
        return this.__cacheOption(opt, "paddingBottom", 0);
    }
    paddingLeft(opt?: number) {
        return this.__cacheOption(opt, "paddingLeft", 0);
    }
    paddingRight(opt?: number) {
        return this.__cacheOption(opt, "paddingRight", 0);
    }
    margin(opt?: number[]) {
        const margin = this.__cacheOption(opt, "margin", undefined);
        if (!margin) return margin;
        this.marginTop(margin[0]);
        switch (margin.length) {
            case 1:
                this.marginBottom(margin[0]);
                this.marginLeft(margin[0]);
                this.marginRight(margin[0]);
                break;
            case 2:
                this.marginBottom(margin[0]);
                this.marginLeft(margin[1]);
                this.marginRight(margin[1]);
                break;
            case 3:
                this.marginLeft(margin[1]);
                this.marginRight(margin[1]);
                this.marginBottom(margin[2]);
                break;
            case 4:
                this.marginRight(margin[1]);
                this.marginBottom(margin[2]);
                this.marginLeft(margin[3]);
                break;
        }
        return margin;
    }
    marginTop(opt?: number) {
        return this.__cacheOption(opt, "marginTop", 0);
    }
    marginBottom(opt?: number) {
        return this.__cacheOption(opt, "marginBottom", 0);
    }
    marginLeft(opt?: number) {
        return this.__cacheOption(opt, "marginLeft", 0);
    }
    marginRight(opt?: number) {
        return this.__cacheOption(opt, "marginRight", 0);
    }
    flex(opt?: Flex) {
        const flex = this.__cacheOption(opt, "flex", [
            this.flexGrow(),
            this.flexShrink(),
            this.flexBasis(),
        ]);
        this.flexGrow(flex[0] as FlexGrow);
        this.flexShrink(flex[1] as FlexShrink);
        this.flexBasis(flex[2]) as FlexBasis;
        return flex;
    }

    flexBasis(opt?: FlexBasis): FlexBasis {
        return this.__cacheOption(opt, "flexBasis", "auto");
    }

    flexShrink(opt?: FlexShrink): FlexShrink {
        return this.__cacheOption(opt, "flexShrink", 0);
    }

    flexGrow(opt?: FlexGrow) {
        return this.__cacheOption(opt, "flexGrow", 0);
    }

    order(opt?: number): undefined | number {
        return this.__cacheOption(opt, "order", undefined);
    }

    alignSelf(opt?: AlignSelf) {
        return this.__cacheOption(opt, "alignSelf", "auto");
    }
    justifySelf(opt?: JustifySelf) {
        return this.__cacheOption(opt, "justifySelf", "auto");
    }
    gridRow(opt?: number[]) {
        return this.__cacheOption(opt, "gridRow", []);
    }
    gridRowStart(opt?: number | string) {
        return this.__cacheOption(opt, "gridRowStart", 0);
    }
    gridRowEnd(opt?: number | string) {
        return this.__cacheOption(opt, "gridRowEnd", 0);
    }
    gridColumn(opt?: number[]) {
        return this.__cacheOption(opt, "gridColumn", []);
    }
    gridColumnStart(opt?: number | string) {
        return this.__cacheOption(opt, "gridColumnStart", 0);
    }
    gridColumnEnd(opt?: number | string) {
        return this.__cacheOption(opt, "gridColumnEnd", 0);
    }
    gridArea(opt?: number[] | string) {
        const gridArea = this.__cacheOption(opt, "gridArea", []);
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
        const clip = this.__cacheOption(opt, "clip", false);
        if (clip) {
            this.clip_path();

            if (!this.fillRule()) this.fillRule();

            this.context.clip(this.canvas.clipping_path.path, this.fillRule());
        }
        return clip;
    }

    fillRule(opt?: string) {
        return this.__cacheOption(opt, "fillRule", "nonzero");
    }

    zIndex(opt?: number): number | undefined {
        return this.__cacheOption(opt, "zIndex", undefined);
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

    __cacheOption<T>(opt: T | undefined, option: string, defaultOpt: T): T {
        if (this.options) {
            if (opt !== undefined) this.options[option] = opt;
            else if (this.options[option] !== undefined)
                return this.options[option];
            else this.options[option] = defaultOpt;
            return this.options[option];
        }
        return undefined as T;
    }

    reset() {}

    rotate(opt?: number): number {
        const rotate = this.__cacheOption(opt, "rotate", 0);
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

        const borderWidth = this.options.borderWidth || 0;
        if (
            x >=
                this.canvasInit.x -
                    borderWidth +
                    this.canvas.__positionCords.x &&
            x <=
                this.canvasInit.x +
                    this.canvasInit.width +
                    borderWidth +
                    this.canvas.__positionCords.x &&
            y >=
                this.canvasInit.y -
                    borderWidth +
                    this.canvas.__positionCords.y &&
            y <=
                this.canvasInit.y +
                    this.canvasInit.height +
                    borderWidth +
                    this.canvas.__positionCords.y
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
        const selectable = this.__cacheOption(opt, "selectable", true);

        let old_color = this.options.borderColor;
        this.mousemove((event) => {
            // if (!this.options.mousedown && this.checkInBound(event)) {
            //     this.set({ color: "yellow" });
            // } else {
            //     this.set({ color: old_color });
            // }
        });
        return selectable;
    }
    dragX(opt?: boolean) {
        return this.__cacheOption(opt, "dragX", true);
    }
    dragY(opt?: boolean): boolean {
        return this.__cacheOption(opt, "dragY", true);
    }
    draggable(opt?: boolean): boolean {
        const draggable = this.__cacheOption(opt, "draggable", true);
        if (!draggable) return false;
        if (!this.selectable()) return false;

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
                this.beforeInit.x = this.canvasInit.x;
                if (diffX !== 0 && this.dragX()) {
                    this.canvasInit.x += diffX - beforeX;
                    beforeX = diffX;
                }
                this.beforeInit.y = this.canvasInit.y;
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
        });
        return draggable;
    }
}
