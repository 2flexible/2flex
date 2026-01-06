import type { Canvas } from "./Canvas";
import { Node } from "./Tree";
import {
    checkInBound,
    degreeToRadian,
    fromCm,
    fromEm,
    fromIn,
    fromMm,
    fromPc,
    fromPercentage,
    fromPt,
    fromQ,
    fromRem,
    fromVH,
    fromVW,
    getRadiusByWH,
    radianToDegree,
    cubicBezier,
    lerp,
    linear,
    steps,
    hexToRgba,
    colorToRgba,
    rgbaRepresenter,
    getProperty,
    rotateCordinates,
} from "./Utils";
import { CubicBezier, IBlock, LinearEasing, RGBA, StepsEasing } from "./types";

export type IMouseEvents =
    | "click"
    | "dblclick"
    | "mousedown"
    | "mouseup"
    | "mousemove"
    | "mouseenter"
    | "mouseleave"
    | "mouseout"
    | "mouseover"
    | "draggable"
    | "selectable";

export type Easing =
    | "linear"
    | "ease"
    | "ease-in"
    | "ease-out"
    | "ease-in-out"
    | "step-start"
    | "step-end"
    | LinearEasing
    | CubicBezier
    | StepsEasing;

export type Direction =
    | "normal"
    | "reverse"
    | "alternate"
    | "alternate-reverse";

export type Composite = "replace" | "add" | "accumulate";
export type Delay = number;
export type Iterations = number;
export type Duration = number;
export type IterationStart = number;
export type PlaybackRate = number;
export type AutoStart = boolean;

export interface KeyFrame {
    autoStart: AutoStart;
    iterations?: Iterations;
    delay?: Delay;
    direction?: Direction;
    duration?: Duration;
    easing?: Easing;
    composite?: Composite;
    iterationStart?: IterationStart;
    playbackRate?: PlaybackRate;
    onFinish?: () => void;
}

interface BlockFilters {
    [key: string]: string | undefined;
    blur?: string;
    brightness?: string;
    contrast?: string;
    dropShadow?: string;
    grayscale?: string;
    hueRotate?: string;
    saturate?: string;
    sepia?: string;
}

export type AlignSelf =
    | "normal"
    | "auto"
    | "center"
    | "start"
    | "end"
    | "stertch";
export type JustifySelf =
    | "normal"
    | "auto"
    | "center"
    | "start"
    | "end"
    | "stertch"
    // for rtl, ltr writind mode
    | "left"
    | "right";
export type FlexGrow = number;
export type FlexShrink = number;
export type FlexBasis = number | string;
export type Flex = [FlexGrow, FlexShrink, FlexBasis];
export type PlaceSelf = AlignSelf & JustifySelf;
export type Position = "static" | "relative" | "absolute" | "sticky" | "fixed";

export type BaseFilters =
    | "blur"
    | "brightness"
    | "contrast"
    | "drop-shadow"
    | "grayscale"
    | "hue-rotate"
    | "opacity"
    | "saturate"
    | "sepia";

export interface BlockOptions {
    [key: string]: any;
    x: number;
    y: number;
    width: number;
    height: number;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    position?: Position;
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    selectable?: boolean;
    padding?: [number, number, number, number];
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    margin?: [number, number, number, number];
    marginTop?: number;
    marginRight?: number;
    marginBottom?: number;
    marginLeft?: number;
    fillRule?: string;
    zIndex?: number;
    draggable?: boolean;
    onDrag?: (event: MouseEvent) => void;
    dragX?: boolean;
    dragY?: boolean;
    visible?: boolean;
    rotate?: number;
    onRotate?: (event: MouseEvent) => void;
    order?: number;
    blur?: number;
    brightness?: number;
    contrast?: number;
    dropShadow?: number;
    grayscale?: number;
    hueRotate?: number;
    saturate?: number;
    sepia?: number;
    alignSelf?: AlignSelf;
    justifySelf?: JustifySelf;
    flexShrink?: FlexShrink;
    flexBasis?: FlexBasis;
    flexGrow?: FlexGrow;
    // grid-row: grid-row-start / grid-row-end;
    gridRow?: number[];
    gridRowStart?: number;
    gridRowEnd?: number;
    // grid-column: grid-column-start / grid-column-end
    gridColumn?: number[];
    gridColumnStart?: number;
    gridColumnEnd?: number;
    // grid-area: grid-row-start / grid-column-start / grid-row-end / grid-column-end | itemname
    gridArea?: number[];
    hotAreaGap?: number;
    hotCornerSize?: number;
    hotCornerRadius?: number;
    hotCornerStrokeWidth?: number;
    hotCornerStrokeColor?: string;
    hotCornerBackgroundColor?: string;
    hotLineStrokeWidth?: number;
    hotLineStrokeColor?: string;
    rotationRadius?: number;
    rotationTopLeft?: boolean;
    rotationTopRight?: boolean;
    rotationBottomLeft?: boolean;
    rotationBottomRight?: boolean;
    resizeTopLeft?: boolean;
    resizeTopRight?: boolean;
    resizeBottomLeft?: boolean;
    resizeBottomRight?: boolean;
    resizeTop?: boolean;
    resizeLeft?: boolean;
    resizeRight?: boolean;
    resizeBottom?: boolean;
    horizontalFlipResize?: boolean;
    verticalFlipResize?: boolean;
    resizable?: boolean;
    onResize?: (event: MouseEvent) => void;
    hidden?: boolean;
    cornerX1?: number;
    cornerY1?: number;
    cornerX2?: number;
    cornerY2?: number;
    cornerX3?: number;
    cornerY3?: number;
    cornerX4?: number;
    cornerY4?: number;
    hotCornerX1?: number;
    hotCornerY1?: number;
    hotCornerX2?: number;
    hotCornerY2?: number;
    hotCornerX3?: number;
    hotCornerY3?: number;
    hotCornerX4?: number;
    hotCornerY4?: number;
    hotRotCornerX1?: number;
    hotRotCornerY1?: number;
    hotRotCornerX2?: number;
    hotRotCornerY2?: number;
    hotRotCornerX3?: number;
    hotRotCornerY3?: number;
    hotRotCornerX4?: number;
    hotRotCornerY4?: number;
}

export class Block<T = BlockOptions> extends Node {
    canvas: Canvas | any;
    parent: Block | undefined = this.parentNode as Block;
    ownOptions: IBlock<T>;
    options: IBlock<T>;
    __bindOptions: { bindTo: Block; options: (keyof BlockOptions)[] }[] = [];
    #runningEvents = {
        drag: false,
        rotate: false,
        resize: false,
        selected: false,
    };
    __events: any = {
        click: [],
        dbclick: [],
        mousedown: [],
        mouseup: [],
        mousemove: [],
        mouseenter: [],
        mouseleave: [],
        mouseout: [],
        mouseover: [],
    };
    __filters: BlockFilters = {
        blur: undefined,
        brightness: undefined,
        contrast: undefined,
        dropShadow: undefined,
        grayscale: undefined,
        hueRotate: undefined,
        saturate: undefined,
        sepia: undefined,
    };
    __animationOn: any = [];
    #keyframeIterations: any = {};

    #beforeRotDegree: number = 0;

    constructor(options: IBlock<T>) {
        super();
        this.options = { ...options };
        this.ownOptions = { ...options };

        this.__initCorners();
    }

    get context(): CanvasRenderingContext2D {
        return this.canvas?.context;
    }

    render() {
        if (this.hidden()) {
            this.listAllChilds((n: Block) => {
                n.hidden(true);
            });
            return;
        }
        this.#contextFilter();
        this.__handleRotation()
        if (this.#runningEvents.selected) this.__hotLines();
    }

    addChild(...node: Node[]): void {
        super.addChild(...node);
    }

    removeChild<T>(child: T): void {
        super.removeChild(child);
        this.canvas.invokeChange(this.canvas);
    }

    findChilds(queries: BlockOptions) {
        let blocks: Block[] = [];
        this.listAllChilds((block: Block) => {
            for (const [k, v] of Object.entries(queries)) {
                if (block.ownOptions[k] === v) blocks.push(block);
            }
        });
        return blocks;
    }

    __hotLines() {
        const size = this.hotCornerSize();
        const radius = this.hotCornerRadius();
        const strokeWidth = this.hotCornerStrokeWidth();
        const strokeColor = this.hotCornerStrokeColor();
        const background = this.hotCornerBackgroundColor();
        const lineWidth = this.hotLineStrokeWidth();
        const lineColor = this.hotLineStrokeColor();

        this.context.beginPath();
        this.context.moveTo(this.hotCornerX1(), this.hotCornerY1());
        if (!this.hotTop()) {
            this.context.lineTo(this.hotCornerX2(), this.hotCornerY2());
            this.context.lineWidth = lineWidth;
            this.context.strokeStyle = lineColor;
            this.context.stroke();
        } else this.hotTop()?.(this.context);

        this.context.beginPath();
        this.context.moveTo(this.hotCornerX1(), this.hotCornerY1());
        if (!this.hotLeft()) {
            this.context.lineTo(this.hotCornerX3(), this.hotCornerY3());
            this.context.lineWidth = lineWidth;
            this.context.strokeStyle = lineColor;
            this.context.stroke();
        } else this.hotLeft()?.(this.context);

        this.context.beginPath();
        this.context.moveTo(this.hotCornerX3(), this.hotCornerY3());
        if (!this.hotBottom()) {
            this.context.lineTo(this.hotCornerX4(), this.hotCornerY4());
            this.context.lineWidth = lineWidth;
            this.context.strokeStyle = lineColor;
            this.context.stroke();
        } else this.hotBottom()?.(this.context);

        this.context.beginPath();
        this.context.moveTo(this.hotCornerX4(), this.hotCornerY4());
        if (!this.hotRight()) {
            this.context.lineTo(this.hotCornerX2(), this.hotCornerY2());
            this.context.lineWidth = lineWidth;
            this.context.strokeStyle = lineColor;
            this.context.stroke();
        } else this.hotRight()?.(this.context);

        this.context.beginPath();
        if (!this.hotCornerTopLeft()) {
            this.context.roundRect(
                this.hotCornerX1() - size / 2,
                this.hotCornerY1() - size / 2,
                size,
                size,
                radius
            );
            this.context.lineWidth = strokeWidth;
            this.context.strokeStyle = strokeColor;
            this.context.fillStyle = background;
            this.context.fill();
            this.context.stroke();
        } else {
            this.hotCornerTopLeft()?.(this.context);
        }

        this.context.beginPath();
        if (!this.hotCornerTopRight()) {
            this.context.roundRect(
                this.hotCornerX2() - size / 2,
                this.hotCornerY2() - size / 2,
                size,
                size,
                radius
            );
            this.context.lineWidth = strokeWidth;
            this.context.strokeStyle = strokeColor;
            this.context.fillStyle = background;
            this.context.fill();
            this.context.stroke();
        } else {
            this.hotCornerTopRight()?.(this.context);
        }

        this.context.beginPath();
        if (!this.hotCornerBottomLeft()) {
            this.context.roundRect(
                this.hotCornerX3() - size / 2,
                this.hotCornerY3() - size / 2,
                size,
                size,
                radius
            );
            this.context.lineWidth = strokeWidth;
            this.context.strokeStyle = strokeColor;
            this.context.fillStyle = background;
            this.context.fill();
            this.context.stroke();
        } else {
            this.hotCornerBottomLeft()?.(this.context);
        }

        this.context.beginPath();
        if (!this.hotCornerBottomRight()) {
            this.context.roundRect(
                this.hotCornerX4() - size / 2,
                this.hotCornerY4() - size / 2,
                size,
                size,
                radius
            );
            this.context.lineWidth = strokeWidth;
            this.context.strokeStyle = strokeColor;
            this.context.fillStyle = background;
            this.context.fill();
            this.context.stroke();
        } else {
            this.hotCornerBottomRight()?.(this.context);
        }
    }

    __handlePosition() {
        if (this.#runningEvents.resize || this.#runningEvents.drag) return;
        const pos = this.position();

        if (pos === "fixed") {
            if (this.top() !== undefined)
                this.y(-this.canvas.__positionCords.y + this.top()!);
            else if (this.bottom() !== undefined)
                this.y(
                    -this.canvas.__positionCords.y +
                        Math.abs(this.canvas.height - this.height()) -
                        this.bottom()!
                );
            if (this.left() !== undefined)
                this.x(-this.canvas.__positionCords.x + this.left()!);
            else if (this.right())
                this.x(
                    -this.canvas.__positionCords.x +
                        Math.abs(this.canvas.width - this.width()) -
                        this.right()!
                );
        } else if (pos === "sticky") {
            if (this.canvas.__positionCords.y < 0) {
                if (
                    this.top() &&
                    this.canvas.__positionCords.y <=
                        Math.abs(this.canvas.height - this.height()) - this.y()
                ) {
                    this.y(-this.canvas.__positionCords.y + this.top()!);
                }
            } else {
                if (
                    this.bottom() &&
                    this.canvas.__positionCords.y + this.bottom() >=
                        Math.abs(this.canvas.height - this.height()) -
                            Math.abs(this.y())
                ) {
                    this.y(
                        -this.canvas.__positionCords.y +
                            Math.abs(this.canvas.height - this.height()) -
                            this.bottom()!
                    );
                }
            }
            if (this.canvas.__positionCords.x < 0) {
                if (
                    this.left() &&
                    this.canvas.__positionCords.x <=
                        Math.abs(this.canvas.width - this.width()) - this.x()
                ) {
                    this.x(-this.canvas.__positionCords.x + this.left()!);
                }
            } else {
                const diffX = Math.abs(this.canvas.width - this.width());
                if (
                    this.right() &&
                    this.canvas.__positionCords.x + this.right() >=
                        diffX - Math.abs(this.x())
                ) {
                    this.x(
                        -this.canvas.__positionCords.x + diffX - this.right()!
                    );
                }
            }
        } else if (pos === "absolute") {
            this.x(0);
            this.y(0);
            if (this.left() !== undefined) this.x(this.left());
            else if (this.right() !== undefined)
                this.x(
                    Math.abs(this.canvas.width - this.width()) - this.right()!
                );
            if (this.top() !== undefined) {
                this.y(this.top());
            } else if (this.bottom() !== undefined)
                this.y(
                    Math.abs(this.canvas.height - this.height()) -
                        this.bottom()!
                );
        } else if (pos === "relative") {
            if (this.left() !== undefined) this.x(this.x() + this.left()!);
            else if (this.right() !== undefined)
                this.x(this.x() - this.right()!);
            if (this.top() !== undefined) this.y(this.y() + this.top()!);
            else if (this.bottom() !== undefined)
                this.y(this.y() + this.bottom()!);
        }
    }

    __adjustBlocks(): void {
        this.__handlePosition();
        this.listOnlyChilds((b: Block) => {
            b.x(
                (b.options.x || 0) +
                    this.x() +
                    this.marginLeft() +
                    this.paddingLeft()
            );
            b.y(
                (b.options.y || 0) +
                    this.y() +
                    this.marginTop() +
                    this.paddingTop()
            );
            if (b.maxWidth() !== b.options.width!) b.width(b.maxWidth());
            if (b.maxHeight() !== b.options.height!) b.width(b.maxHeight());
            if (!this.__isHorizontalFlipped) {
                if (
                    this.width() - (this.paddingRight() + this.paddingLeft()) <
                        b.width() ||
                    b.width() < b.maxWidth()
                )
                    b.width(
                        b.width() +
                            -(
                                b.width() -
                                (this.width() -
                                    (this.paddingRight() + this.paddingLeft()))
                            )
                    );
            } else if (b.__isHorizontalFlipped) {
                if (b.width() < b.maxWidth()) {
                    b.width(
                        b.width() +
                            -(
                                b.width() -
                                (this.width() -
                                    (this.paddingRight() + this.paddingLeft()))
                            )
                    );
                }
            } else b.width(0);

            b.cornerX1(this.x());
            b.cornerX2(this.x() + this.width());
            b.cornerX3(this.x());
            b.cornerX4(this.x() + this.width());

            if (
                (!this.__isVerticalFlipped &&
                    this.height() - (this.paddingTop() + this.paddingBottom()) <
                        b.height()) ||
                b.height() < b.maxHeight()
            ) {
                let oldHeight = b.height();
                b.height(
                    b.height() +
                        -(
                            b.height() -
                            (this.height() -
                                (this.paddingTop() + this.paddingBottom()))
                        )
                );
                if (b.minHeight() > b.height()) b.height(oldHeight);
            }
            b.__adjustBlocks();
        });
    }

    __initCorners() {
        this.cornerX1(this.x());
        this.cornerY1(this.y());
        this.cornerX2(this.x() + this.width());
        this.cornerY2(this.y());
        this.cornerX3(this.x());
        this.cornerY3(this.y() + this.height());
        this.cornerX4(this.x() + this.width());
        this.cornerY4(this.y() + this.height());

        this.hotCornerX1(this.cornerX1() - this.hotAreaGap());
        this.hotCornerY1(this.cornerY1() - this.hotAreaGap());
        this.hotCornerX2(this.cornerX2() + this.hotAreaGap());
        this.hotCornerY2(this.cornerY2() - this.hotAreaGap());
        this.hotCornerX3(this.cornerX3() - this.hotAreaGap());
        this.hotCornerY3(this.cornerY3() + this.hotAreaGap());
        this.hotCornerX4(this.cornerX4() + this.hotAreaGap());
        this.hotCornerY4(this.cornerY4() + this.hotAreaGap());

        this.hotRotCornerX1(this.hotCornerX1() - this.hotAreaGap());
        this.hotRotCornerY1(this.hotCornerY1() - this.hotAreaGap());
        this.hotRotCornerX2(this.hotCornerX2() + this.hotAreaGap());
        this.hotRotCornerY2(this.hotCornerY2() - this.hotAreaGap());
        this.hotRotCornerX3(this.hotCornerX3() - this.hotAreaGap());
        this.hotRotCornerY3(this.hotCornerY3() + this.hotAreaGap());
        this.hotRotCornerX4(this.hotCornerX4() + this.hotAreaGap());
        this.hotRotCornerY4(this.hotCornerY4() + this.hotAreaGap());
    }

    #contextFilter() {
        let allStr = "";
        for (const [key, value] of Object.entries(this.__filters)) {
            if (value) allStr += ` ${key + value}`;
        }
        this.context.filter = allStr;
    }

    get __isHorizontalFlipped() {
        if (
            (this.horizontalFlipResize() &&
                this.cornerX1() > this.cornerX2()) ||
            this.cornerX3() > this.cornerX4()
        )
            return true;
        return false;
    }
    get __isVerticalFlipped() {
        if (
            this.cornerY1() > this.cornerY3() ||
            this.cornerY2() > this.cornerY4()
        )
            return true;
        return false;
    }
    __unitConverter<T, O>({
        val,
        widthRelated,
    }: {
        val?: T;
        widthRelated?: boolean;
    }): O {
        if (val && typeof val === "string") {
            if (val.endsWith("px")) return Number(val.split("px")[0]) as O;
            else if (val.endsWith("%"))
                return fromPercentage(
                    Number(val.split("%")[0]),
                    this.parent?.width() || this.width()
                ) as O;
            else if (val.endsWith("rem"))
                return fromRem(
                    Number(val.split("rem")[0]),
                    this.canvas.width
                ) as O;
            else if (val.endsWith("em"))
                return fromEm(
                    Number(val.split("em")[0]),
                    this.parent?.width() || this.width()
                ) as O;
            else if (
                val.endsWith("vh") &&
                widthRelated !== undefined &&
                widthRelated === false
            )
                return fromVH(
                    Number(val.split("vh")[0]),
                    this.canvas.height
                ) as O;
            else if (
                val.endsWith("vw") &&
                widthRelated !== undefined &&
                widthRelated === true
            )
                return fromVW(
                    Number(val.split("vw")[0]),
                    this.canvas.width
                ) as O;
            else if (val.endsWith("cm"))
                return fromCm(Number(val.split("cm")[0])) as O;
            else if (val.endsWith("mm"))
                return fromMm(Number(val.split("mm")[0])) as O;
            else if (val.endsWith("q"))
                return fromQ(Number(val.split("q")[0])) as O;
            else if (val.endsWith("in"))
                return fromIn(Number(val.split("in")[0])) as O;
            else if (val.endsWith("pc"))
                return fromPc(Number(val.split("pc")[0])) as O;
            else if (val.endsWith("pt"))
                return fromPt(Number(val.split("pt")[0])) as O;
        }
        return val as O;
    }

    __valueHandler<T, O>(
        opt: T | undefined,
        option: string,
        defaultOpt: O,
        widthRelated?: boolean
    ): O {
        const val = this.__unitConverter<T, O>({
            val: opt,
            widthRelated: widthRelated,
        });
        return this.__cacheOptions(val, option, defaultOpt);
    }

    __cacheOptions<T>(
        opt: T | undefined,
        option: keyof IBlock<BlockOptions>,
        defaultOpt: T
    ): T {
        // @Todo: fix type issue over the generic readonly
        if (opt !== undefined) (this.ownOptions[option] as any) = opt;
        else if (this.ownOptions[option] === undefined)
            (this.ownOptions[option] as any) = defaultOpt;
        return this.ownOptions[option];
    }

    x(opt?: number | string) {
        return this.__valueHandler(opt, "x", 0, true);
    }

    y(opt?: number | string): number {
        return this.__valueHandler(opt, "y", 0, true);
    }

    width(opt?: number | string): number {
        return this.__valueHandler(opt, "width", 0, true);
    }

    height(opt?: number | string): number {
        return this.__valueHandler(opt, "height", 0, false);
    }
    minWidth(opt?: number | string): number {
        return this.__valueHandler(opt, "minWidth", 0, true);
    }
    minHeight(opt?: number | string): number {
        return this.__valueHandler(opt, "minHeight", 0, true);
    }
    maxWidth(opt?: number | string): number {
        return this.__valueHandler(
            opt,
            "maxWidth",
            this.options.width || 0,
            true
        );
    }
    maxHeight(opt?: number | string): number {
        return this.__valueHandler(
            opt,
            "maxHeight",
            this.options.height || 0,
            false
        );
    }
    position(opt?: Position) {
        return this.__valueHandler(opt, "position", "static");
    }
    top(opt?: number | string) {
        return this.__valueHandler(opt, "top", undefined, false);
    }
    bottom(opt?: number | string) {
        return this.__valueHandler(opt, "bottom", undefined, false);
    }
    left(opt?: number | string) {
        return this.__valueHandler(opt, "left", undefined, true);
    }
    right(opt?: number | string) {
        return this.__valueHandler(opt, "right", undefined, true);
    }
    padding(opt?: number[]): number[] {
        const padding = this.__valueHandler(opt, "padding", []);
        this.paddingTop(padding[0] || 0);
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
    paddingTop(opt?: number | string) {
        return this.__valueHandler(opt, "paddingTop", 0, false);
    }
    paddingBottom(opt?: number | string) {
        return this.__valueHandler(opt, "paddingBottom", 0, false);
    }
    paddingLeft(opt?: number | string) {
        return this.__valueHandler(opt, "paddingLeft", 0, true);
    }
    paddingRight(opt?: number | string) {
        return this.__valueHandler(opt, "paddingRight", 0, true);
    }
    margin(opt?: number[]): number[] {
        const margin = this.__valueHandler(opt, "margin", []);
        this.marginTop(margin[0] || 0);
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
    marginTop(opt?: number | string) {
        return this.__valueHandler(opt, "marginTop", 0, false);
    }
    marginBottom(opt?: number | string) {
        return this.__valueHandler(opt, "marginBottom", 0, false);
    }
    marginLeft(opt?: number | string) {
        return this.__valueHandler(opt, "marginLeft", 0, true);
    }
    marginRight(opt?: number | string) {
        return this.__valueHandler(opt, "marginRight", 0, true);
    }
    cornerX1(opt?: number | string) {
        return this.__valueHandler(opt, "cornerX1", 0, true);
    }
    cornerY1(opt?: number | string) {
        return this.__valueHandler(opt, "cornerY1", 0, false);
    }
    cornerX2(opt?: number | string) {
        return this.__valueHandler(opt, "cornerX2", 0, true);
    }
    cornerY2(opt?: number | string) {
        return this.__valueHandler(opt, "cornerY2", 0, false);
    }
    cornerX3(opt?: number | string) {
        return this.__valueHandler(opt, "cornerX3", 0, true);
    }
    cornerY3(opt?: number | string) {
        return this.__valueHandler(opt, "cornerY3", 0, false);
    }
    cornerX4(opt?: number | string) {
        return this.__valueHandler(opt, "cornerX4", 0, true);
    }
    cornerY4(opt?: number | string) {
        return this.__valueHandler(opt, "cornerY4", 0, false);
    }

    hotCornerX1(opt?: number | string) {
        return this.__valueHandler(opt, "hotCornerX1", 0, true);
    }
    hotCornerY1(opt?: number | string) {
        return this.__valueHandler(opt, "hotCornerY1", 0, false);
    }
    hotCornerX2(opt?: number | string) {
        return this.__valueHandler(opt, "hotCornerX2", 0, true);
    }
    hotCornerY2(opt?: number | string) {
        return this.__valueHandler(opt, "hotCornerY2", 0, false);
    }
    hotCornerX3(opt?: number | string) {
        return this.__valueHandler(opt, "hotCornerX3", 0, true);
    }
    hotCornerY3(opt?: number | string) {
        return this.__valueHandler(opt, "hotCornerY3", 0, false);
    }
    hotCornerX4(opt?: number | string) {
        return this.__valueHandler(opt, "hotCornerX4", 0, true);
    }
    hotCornerY4(opt?: number | string) {
        return this.__valueHandler(opt, "hotCornerY4", 0, false);
    }
    hotRotCornerX1(opt?: number | string) {
        return this.__valueHandler(opt, "hotRotCornerX1", 0, true);
    }
    hotRotCornerY1(opt?: number | string) {
        return this.__valueHandler(opt, "hotRotCornerY1", 0, false);
    }
    hotRotCornerX2(opt?: number | string) {
        return this.__valueHandler(opt, "hotRotCornerX2", 0, true);
    }
    hotRotCornerY2(opt?: number | string) {
        return this.__valueHandler(opt, "hotRotCornerY2", 0, false);
    }
    hotRotCornerX3(opt?: number | string) {
        return this.__valueHandler(opt, "hotRotCornerX3", 0, true);
    }
    hotRotCornerY3(opt?: number | string) {
        return this.__valueHandler(opt, "hotRotCornerY3", 0, false);
    }
    hotRotCornerX4(opt?: number | string) {
        return this.__valueHandler(opt, "hotRotCornerX4", 0, true);
    }
    hotRotCornerY4(opt?: number | string) {
        return this.__valueHandler(opt, "hotRotCornerY4", 0, false);
    }

    hotTop(opt?: (context: CanvasRenderingContext2D) => void) {
        return this.__valueHandler<typeof opt, typeof opt>(
            opt,
            "hotTop",
            undefined
        );
    }
    hotLeft(opt?: (context: CanvasRenderingContext2D) => void) {
        return this.__valueHandler<typeof opt, typeof opt>(
            opt,
            "hotLeft",
            undefined
        );
    }
    hotRight(opt?: (context: CanvasRenderingContext2D) => void) {
        return this.__valueHandler<typeof opt, typeof opt>(
            opt,
            "hotRight",
            undefined
        );
    }
    hotBottom(opt?: (context: CanvasRenderingContext2D) => void) {
        return this.__valueHandler<typeof opt, typeof opt>(
            opt,
            "hotBottom",
            undefined
        );
    }
    hotCornerTopLeft(opt?: (context: CanvasRenderingContext2D) => void) {
        return this.__valueHandler<typeof opt, typeof opt>(
            opt,
            "hotCornerTopLeft",
            undefined
        );
    }
    hotCornerTopRight(opt?: (context: CanvasRenderingContext2D) => void) {
        return this.__valueHandler<typeof opt, typeof opt>(
            opt,
            "hotCornerTopRight",
            undefined
        );
    }
    hotCornerBottomLeft(opt?: (context: CanvasRenderingContext2D) => void) {
        return this.__valueHandler<typeof opt, typeof opt>(
            opt,
            "hotCornerBottomLeft",
            undefined
        );
    }
    hotCornerBottomRight(opt?: (context: CanvasRenderingContext2D) => void) {
        return this.__valueHandler<typeof opt, typeof opt>(
            opt,
            "hotCornerBottomRight",
            undefined
        );
    }

    rotationCenterX(opt?: number | string) {
        return this.__valueHandler(
            opt,
            "rotationCenterX",
            this.x() + this.width() / 2,
            true
        );
    }
    rotationCenterY(opt?: number | string) {
        return this.__valueHandler(
            opt,
            "rotationCenterY",
            this.y() + this.height() / 2,
            false
        );
    }
    rotationTopLeft(opt?: boolean) {
        return this.__valueHandler(opt, "rotationTopLeft", true);
    }
    rotationTopRight(opt?: boolean) {
        return this.__valueHandler(opt, "rotationTopRight", true);
    }
    rotationBottomLeft(opt?: boolean) {
        return this.__valueHandler(opt, "rotationBottomLeft", true);
    }
    rotationBottomRight(opt?: boolean) {
        return this.__valueHandler(opt, "rotationBottomRight", true);
    }

    resizeTopLeft(opt?: boolean) {
        return this.__valueHandler(opt, "resizeTopLeft", true);
    }
    resizeTopRight(opt?: boolean) {
        return this.__valueHandler(opt, "resizeTopRight", true);
    }
    resizeBottomLeft(opt?: boolean) {
        return this.__valueHandler(opt, "resizeBottomLeft", true);
    }
    resizeBottomRight(opt?: boolean) {
        return this.__valueHandler(opt, "resizeBottomRight", true);
    }
    resizeTop(opt?: boolean) {
        return this.__valueHandler(opt, "resizeTop", true);
    }
    resizeLeft(opt?: boolean) {
        return this.__valueHandler(opt, "resizeLeft", true);
    }
    resizeRight(opt?: boolean) {
        return this.__valueHandler(opt, "resizeRight", true);
    }
    resizeBottom(opt?: boolean) {
        return this.__valueHandler(opt, "resizeBottom", true);
    }
    horizontalFlipResize(opt?: boolean) {
        return this.__valueHandler(opt, "horizontalFlipResize", false);
    }
    verticalFlipResize(opt?: boolean) {
        return this.__valueHandler(opt, "verticalFlipResize", false);
    }
    dragX(opt?: boolean) {
        return this.__valueHandler(opt, "dragX", true);
    }
    dragY(opt?: boolean): boolean {
        return this.__valueHandler(opt, "dragY", true);
    }

    hotCornerSize(opt?: number) {
        return this.__valueHandler(opt, "hotCornerSize", 5);
    }
    hotCornerRadius(opt?: number[]) {
        return this.__valueHandler(opt, "hotCornerRadius", [0]);
    }
    hotCornerStrokeWidth(opt?: number) {
        return this.__valueHandler(opt, "hotCornerStrokeWidth", 0);
    }
    hotCornerStrokeColor(opt?: string) {
        return this.__valueHandler(opt, "hotCornerStrokeColor", "black");
    }
    hotCornerBackgroundColor(opt?: string) {
        return this.__valueHandler(opt, "hotCornerBackgroundColor", "white");
    }
    hotLineStrokeWidth(opt?: number) {
        return this.__valueHandler(opt, "hotTopStrokeWidth", 1);
    }
    hotLineStrokeColor(opt?: string) {
        return this.__valueHandler(opt, "hotTopStrokeColor", "blue");
    }
    hotAreaGap(opt?: number) {
        return this.__valueHandler(opt, "hotAreaGap", 5);
    }

    #filterHandler(filter?: BaseFilters, value?: string | number | number[]) {
        if (value === undefined || filter == undefined) return;
        switch (filter) {
            case "blur":
                value = value + "px";
                break;
            case "brightness":
                value = value + "%";
                break;
            case "contrast":
                value = value + "%";
                break;
            case "drop-shadow":
                let _s = "";
                (value as number[]).forEach((i) => {
                    if (typeof i == "string") _s += `${i}px`;
                    else _s += i;
                });
                value = _s;
                break;
            case "grayscale":
                value = value + "%";
                break;
            case "hue-rotate":
                value = value + "deg";
                break;
            case "opacity":
                value = value + "%";
                break;
            case "saturate":
                value = value + "%";
                break;
            case "sepia":
                value = value + "%";
                break;
        }
        this.__filters[filter] = `(${value})`;
    }

    blur(opt?: number) {
        const blur = this.__valueHandler(opt, "blur", undefined);
        this.#filterHandler("blur", blur);
        return blur;
    }
    brightness(opt?: number) {
        const brightness = this.__valueHandler(opt, "brightness", undefined);
        this.#filterHandler("brightness", brightness);
        return brightness;
    }
    contrast(opt?: number) {
        const contrast = this.__valueHandler(opt, "contrast", undefined);
        this.#filterHandler("contrast", contrast);
        return contrast;
    }
    dropShadow(opt?: [number, number, number, string][]) {
        const dropShadow = this.__valueHandler(opt, "dropShadow", []);
        this.#filterHandler("drop-shadow", dropShadow);
        return dropShadow;
    }
    grayscale(opt?: number) {
        const grayscale = this.__valueHandler(opt, "grayscale", undefined);
        this.#filterHandler("grayscale", grayscale);
        return grayscale;
    }
    hueRotate(opt?: number) {
        const hueRotate = this.__valueHandler(opt, "hueRotate", undefined);
        this.#filterHandler("hue-rotate", hueRotate);
        return hueRotate;
    }
    opacity(opt?: number) {
        const opacity = this.__valueHandler(opt, "opacity", undefined);

        this.#filterHandler("opacity", opacity);
        return opacity;
    }
    saturate(opt?: number) {
        const saturate = this.__valueHandler(opt, "saturate", undefined);

        this.#filterHandler("saturate", saturate);
        return saturate;
    }
    sepia(opt?: number) {
        const sepia = this.__valueHandler(opt, "sepia", undefined);
        this.#filterHandler("sepia", sepia);
        return sepia;
    }

    hidden(opt?: boolean) {
        return this.__valueHandler(opt, "hidden", false);
    }

    flex(opt?: Flex) {
        const flex = this.__valueHandler(opt, "flex", [
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
        return this.__valueHandler(opt, "flexBasis", "auto");
    }

    flexShrink(opt?: FlexShrink): FlexShrink {
        return this.__valueHandler(opt, "flexShrink", 0);
    }

    flexGrow(opt?: FlexGrow) {
        return this.__valueHandler(opt, "flexGrow", 0);
    }

    order(opt?: number): number | undefined {
        return this.__valueHandler(opt, "order", undefined);
    }

    alignSelf(opt?: AlignSelf) {
        return this.__valueHandler(opt, "alignSelf", "auto");
    }
    justifySelf(opt?: JustifySelf) {
        return this.__valueHandler(opt, "justifySelf", "auto");
    }
    gridRow(opt?: number[]) {
        return this.__valueHandler(opt, "gridRow", []);
    }
    gridRowStart(opt?: number | string) {
        return this.__valueHandler(opt, "gridRowStart", 0);
    }
    gridRowEnd(opt?: number | string) {
        return this.__valueHandler(opt, "gridRowEnd", 0);
    }
    gridColumn(opt?: number[]) {
        return this.__valueHandler(opt, "gridColumn", []);
    }
    gridColumnStart(opt?: number | string) {
        return this.__valueHandler(opt, "gridColumnStart", 0);
    }
    gridColumnEnd(opt?: number | string) {
        return this.__valueHandler(opt, "gridColumnEnd", 0);
    }
    gridArea(opt?: number[] | string) {
        const gridArea = this.__valueHandler(opt, "gridArea", []);
        this.gridRowStart(gridArea[0] || "auto");
        this.gridColumnStart(gridArea[1] || "auto");
        this.gridRowEnd(gridArea[2] || "auto");
        this.gridColumnEnd(gridArea[3] || "auto");
        return gridArea;
    }

    fillRule(opt?: CanvasFillRule): CanvasFillRule {
        return this.__valueHandler(opt, "fillRule", "nonzero");
    }

    zIndex(opt?: number): number {
        return this.__valueHandler(opt, "zIndex", 1);
    }

    set(options: IBlock<BlockOptions>): void {
        let before: any = {};
        let after: any = {};
        for (const [key, value] of Object.entries(options)) {
            const obj = getProperty(this, key);
            let beforeValue = obj?.value.call(this);
            if (beforeValue !== value) {
                obj?.value.call(this, value);
                before[this.nodeId!] = {};
                after[this.nodeId!] = {};
                before[this.nodeId!][key] = beforeValue;
                after[this.nodeId!][key] = value;
            }
        }
        if (Object.keys(before).length !== 0) {
            this.canvas?.takeSnapshot(new Date().getTime(), before, after);
            this.canvas?.invokeChange.call(this.canvas);
        }
    }
    scale(s: number) {
        this.width(this.width() * s);
        this.height(this.height() * s);
    }
    bind(block: Block, ...options: (keyof BlockOptions)[]) {
        this.__bindOptions.push({ bindTo: block, options: options });
    }
    reset() {
        this.ownOptions = this.options;
    }
    rotate(opt?: number): number {
        return this.__valueHandler(opt, "rotate", 0);
    }

    animate(keyframes: KeyFrame[], callback?: (timestamp: number) => void) {
        const animationId = new Date().getTime();
        this.#keyframeIterations[animationId] = {
            isRunning: true,
            isFinished: false,
            isReverse: false,
        };
        for (let [index, keyframe] of Object.entries(keyframes)) {
            const composite = keyframe.composite || "replace";

            let maxLen = 0;
            for (let [key, value] of Object.entries(keyframe)) {
                if (key in this.options) {
                    if (composite === "add" && maxLen < value.length)
                        maxLen = value.length;
                    else if (composite === "accumulate") {
                        let prevVal = 0;
                        (keyframe as any)[key] = value.map(
                            (item: number, index: number) => {
                                if (!(index in [0, 1])) {
                                    item += prevVal;
                                } else {
                                    prevVal += item;
                                }
                                return item;
                            }
                        );
                    }
                }
            }
            let direction = keyframe["direction"] || "normal";
            const iterationStart = keyframe["iterationStart"] || 0.0;

            for (let [key, value] of Object.entries(keyframe)) {
                if (key in this.options) {
                    const obj = getProperty(this, key);
                    this.#keyframeIterations[animationId][index] = {
                        iter: 1,
                        initValues: {},
                        prevTime: 0,
                        elapsedTime: 0,
                    };
                    this.#keyframeIterations[animationId][index]["initValues"][
                        key
                    ] = obj?.value.call(this);
                    for (
                        let i = value.length, maxVal = value[i - 1];
                        i < maxLen;
                        i++
                    )
                        value.push(maxVal);
                    if (
                        direction === "reverse" ||
                        direction === "alternate-reverse"
                    )
                        value.reverse();

                    let currentVal = value[0];
                    let idx = 0;
                    let iterDirection = 1;
                    if (iterationStart) {
                        idx = Math.round(iterationStart * value.length - 1);
                        if (direction === "normal" || direction === "reverse")
                            idx = 0;
                        currentVal = value[idx];
                        if (idx === value.length - 1) iterDirection *= -1;
                    }
                    if (key.includes("color") || key.includes("Color")) {
                        value = value.map((i: string) => this.#colorHandler(i));
                    }
                    this.#keyframeIterations[animationId][index][key] = {
                        currentIdx: idx,
                        currentVal: currentVal,
                        breakPoints: value,
                        iterDirection: iterDirection,
                        invoker: obj,
                    };
                } else {
                    this.#keyframeIterations[animationId][index][key] = value;
                }
            }
            const animator = (timestamp: number) => {
                const anime = this.#keyframeIterations[animationId];
                const keyF = anime[index];
                if (keyF.auotStart && keyF.autoStart === false) return;
                let isFinished = anime["isFinished"];
                const delay = keyF.delay || 0;

                if (callback) callback(timestamp);

                if (delay <= timestamp && !isFinished && anime["isRunning"]) {
                    const playBackRate = keyF.playbackRate || 1;
                    const direction = keyF.direction || "normal";
                    const duration = keyF.duration || 0;
                    const iterations = keyF.iterations || undefined;
                    const iter = keyF.iter;
                    const elapsedTime = anime["elapsedTime"];
                    const prevTime = anime["prevTime"];

                    this.#keyframeIterations[animationId]["elapsedTime"] =
                        timestamp - prevTime;
                    this.#keyframeIterations[animationId]["prevTime"] =
                        timestamp;

                    if (!anime["isRunning"]) return;
                    if (iter === iterations + 1)
                        isFinished = this.#keyframeIterations[animationId][
                            "isFinished"
                        ] = true;

                    if (
                        iterations !== undefined &&
                        iterations !== Infinity &&
                        Math.floor((duration * iter) / 1000) ===
                            Math.floor(timestamp / 1000)
                    )
                        this.#keyframeIterations[animationId][index][
                            "iter"
                        ] += 1;
                    const easing = this.easingHanndler(keyF.easing || "ease")(
                        elapsedTime / duration || 0,
                        duration
                    );
                    for (let [key, value] of Object.entries(keyF)) {
                        if (!(key in this.options)) continue;
                        let valueT = value as any;

                        if (isFinished) {
                            if (keyF.onFinish) keyF.onFinish();
                            valueT.invoker?.value.call(
                                this,
                                valueT["breakPoints"][0]
                            );
                            continue;
                        }

                        let currentIdx = valueT["currentIdx"];
                        let iterDirection = valueT["iterDirection"];
                        let nextIdx = currentIdx + iterDirection;

                        let startVal = valueT["breakPoints"][currentIdx];
                        let endVal = valueT["breakPoints"][nextIdx];
                        let currentVal = valueT["currentVal"];
                        let statement = null;

                        if (key.includes("color") || key.includes("Color")) {
                            currentVal = this.#colorHandler(currentVal);

                            const R =
                                lerp(startVal[0], endVal[0], easing) -
                                startVal[0];
                            const G =
                                lerp(startVal[1], endVal[1], easing) -
                                startVal[1];
                            const B =
                                lerp(startVal[2], endVal[2], easing) -
                                startVal[2];
                            const A =
                                lerp(startVal[3], endVal[3], easing) -
                                startVal[3];

                            currentVal = [
                                currentVal[0] + R,
                                currentVal[1] + G,
                                currentVal[2] + B,
                                currentVal[3] + A,
                            ];
                            statement =
                                ((startVal[0] <= endVal[0] &&
                                    currentVal[0] >= endVal[0]) ||
                                    (startVal[0] >= endVal[0] &&
                                        currentVal[0] <= endVal[0])) &&
                                ((startVal[1] <= endVal[1] &&
                                    currentVal[1] >= endVal[1]) ||
                                    (startVal[1] >= endVal[1] &&
                                        currentVal[1] <= endVal[1])) &&
                                ((startVal[2] <= endVal[2] &&
                                    currentVal[2] >= endVal[2]) ||
                                    (startVal[2] >= endVal[2] &&
                                        currentVal[2] <= endVal[2])) &&
                                ((startVal[3] <= endVal[3] &&
                                    currentVal[3] >= endVal[3]) ||
                                    (startVal[3] >= endVal[3] &&
                                        currentVal[3] <= endVal[3]));
                        } else {
                            currentVal +=
                                (lerp(startVal, endVal, easing) - startVal) *
                                playBackRate;
                            statement =
                                (startVal <= endVal && currentVal >= endVal) ||
                                (startVal >= endVal && currentVal <= endVal);
                        }

                        if (statement) {
                            currentIdx += iterDirection;
                            if (
                                nextIdx === valueT["breakPoints"].length - 1 ||
                                nextIdx === 0
                            ) {
                                if (
                                    direction == "normal" ||
                                    direction === "reverse"
                                ) {
                                    currentIdx = 0;
                                    currentVal = valueT["breakPoints"][0];
                                    this.#keyframeIterations[animationId][
                                        index
                                    ]["time"] = 0;
                                } else if (
                                    direction == "alternate" ||
                                    direction == "alternate-reverse"
                                ) {
                                    iterDirection *= -1;
                                    this.#keyframeIterations[animationId][
                                        index
                                    ]["time"] = 0;
                                }
                            }
                            this.#keyframeIterations[animationId][index][key][
                                "currentIdx"
                            ] = currentIdx;
                        }
                        if (key.includes("color") || key.includes("Color"))
                            currentVal = rgbaRepresenter(currentVal);
                        this.#keyframeIterations[animationId][index][key][
                            "currentVal"
                        ] = currentVal;
                        this.#keyframeIterations[animationId][index][key][
                            "iterDirection"
                        ] = iterDirection;
                        valueT.invoker?.value.call(this, currentVal);
                    }
                }
                this.render();
            };
            this.__animationOn.push(animator);
        }
        return animationId;
    }

    #colorHandler(color: string): RGBA {
        if (color.startsWith("rgb") || color.startsWith("rgba")) {
            const splitted = color.split(/[,()\s]+/);
            return [
                Number(splitted[1]),
                Number(splitted[2]),
                Number(splitted[3]),
                Number(splitted[4]),
            ];
        } else if (color.startsWith("#")) {
            return hexToRgba(color);
        } else if (color.startsWith("hsl")) {
        } else {
            return colorToRgba(color);
        }
        return [0, 0, 0, 0];
    }

    animationStart(animationId: number) {
        this.#keyframeIterations[animationId]["isFinished"] = false;
        this.#keyframeIterations[animationId]["isRunning"] = true;
    }
    animationStop(animationId: number) {
        this.#keyframeIterations[animationId]["isRunning"] = false;
    }
    animationFinish(animationId: number) {
        this.#keyframeIterations[animationId]["isFinished"] = true;
    }
    animationReverse(animationId: number) {
        this.#keyframeIterations[animationId]["isFinished"] = false;
        this.#keyframeIterations[animationId]["isReverse"] = true;
    }
    animationUpdateDelay(
        animationId: number,
        keyFrameCount: number,
        value: Delay
    ) {
        this.#keyframeIterations[animationId][keyFrameCount]["updateDelay"] =
            value;
    }
    animationPlaybackRate(
        animationId: number,
        keyFrameCount: number,
        value: PlaybackRate
    ) {
        this.#keyframeIterations[animationId][keyFrameCount]["playbackRate"] =
            value;
    }
    animationDirection(
        animationId: number,
        keyFrameCount: number,
        value: Direction
    ) {
        this.#keyframeIterations[animationId][keyFrameCount]["direction"] =
            value;
    }
    animationDuration(
        animationId: number,
        keyFrameCount: number,
        value: Duration
    ) {
        this.#keyframeIterations[animationId][keyFrameCount]["duration"] =
            value;
    }
    animationIterationStart(
        animationId: number,
        keyFrameCount: number,
        value: IterationStart
    ) {
        this.#keyframeIterations[animationId][keyFrameCount]["iterationStart"] =
            value;
    }
    animationComposite(
        animationId: number,
        keyFrameCount: number,
        value: Composite
    ) {
        this.#keyframeIterations[animationId][keyFrameCount]["composite"] =
            value;
    }
    animationIterations(
        animationId: number,
        keyFrameCount: number,
        value: Iterations
    ) {
        this.#keyframeIterations[animationId][keyFrameCount]["iterations"] =
            value;
    }

    animationAutoStart(
        animationId: number,
        keyFrameCount: number,
        value: AutoStart
    ) {
        this.#keyframeIterations[animationId][keyFrameCount]["autoStart"] =
            value;
    }

    easingHanndler(easing: Easing): (t: number, duration: number) => number {
        if (easing === "linear") return linear(0, 1);
        else if (easing == "step-start") return steps(1, "jump-start");
        else if (easing == "step-end") return steps(1, "jump-end");
        else if (easing == "ease") return cubicBezier(0.25, 0.1, 0.25, 1);
        else if (easing == "ease-in") return cubicBezier(0.42, 0, 1, 1);
        else if (easing == "ease-out") return cubicBezier(0, 0, 0.58, 1);
        else if (easing == "ease-in-out") return cubicBezier(0.42, 0, 0.58, 1);
        else return easing;
    }

    checkInBound(_event: any): boolean {
        const { x, y } = this.canvas?.getCursorPosition(_event) || {
            x: 0,
            y: 0,
        };
        const inBound = checkInBound(
            x,
            y,
            this.cornerX1(),
            this.cornerY1(),
            this.cornerX2(),
            this.cornerY2(),
            this.cornerX3(),
            this.cornerY3(),
            this.cornerX4(),
            this.cornerY4()
        );
        if (inBound) this.canvas?.takeRegister({ in: this.zIndex() });
        else this.canvas?.takeRegister({ out: this.zIndex() });
        return inBound;
    }

    click(_func: (event: MouseEvent) => void) {
        const out = (event: MouseEvent) => {
            if (
                this.checkInBound(event) &&
                this.canvas?.whoIsTheFirst(this.zIndex())
            ) {
                _func(event);
                this.canvas?.invokeChange.call(this.canvas);
            }
        };
        this.#eventHandler<MouseEvent>("click", out);
    }

    dbclick(_func: (event: MouseEvent) => void) {
        const out = (event: MouseEvent) => {
            if (
                this.checkInBound(event) &&
                this.canvas?.whoIsTheFirst(this.zIndex())
            ) {
                _func(event);
                this.canvas?.invokeChange.call(this.canvas);
            }
        };
        this.#eventHandler<MouseEvent>("dblclick", out);
    }

    mousedown(_func: (event: MouseEvent) => void) {
        const out = (event: MouseEvent) => {
            if (
                this.checkInBound(event) &&
                this.canvas?.whoIsTheFirst(this.zIndex())
            ) {
                _func(event);
                this.canvas?.invokeChange.call(this.canvas);
            }
        };
        this.#eventHandler<MouseEvent>("mousedown", out);
    }

    mouseup(_func: (event: MouseEvent) => void) {
        const out = (event: MouseEvent) => {
            if (
                this.checkInBound(event) &&
                this.canvas?.whoIsTheFirst(this.zIndex())
            ) {
                _func(event);
                this.canvas?.invokeChange.call(this.canvas);
            }
        };
        this.#eventHandler<MouseEvent>("mouseup", out);
    }

    mousemove(_func: (event: MouseEvent) => void) {
        const out = (event: MouseEvent) => {
            if (
                this.checkInBound(event) &&
                this.canvas?.whoIsTheFirst(this.zIndex())
            ) {
                _func(event);
                this.canvas?.invokeChange.call(this.canvas);
            }
        };
        this.#eventHandler<MouseEvent>("mousemove", out);
    }

    mouseenter(_func: (event: MouseEvent) => void) {
        let isMouseEnter = false;
        const enter = (event: MouseEvent) => {
            if (this.checkInBound(event)) {
                if (
                    this.canvas?.whoIsTheFirst(this.zIndex()) &&
                    !isMouseEnter
                ) {
                    _func(event);
                    this.canvas?.invokeChange.call(this.canvas);
                    isMouseEnter = true;
                }
            } else isMouseEnter = false;
        };
        this.#eventHandler<MouseEvent>("mousemove", enter);
    }

    mouseleave(_func: (event: MouseEvent) => void) {
        let isMouseLeave = false;
        const leave = (event: MouseEvent) => {
            if (!this.checkInBound(event)) {
                if (
                    !this.canvas?.whoIsTheFirst(this.zIndex()) &&
                    !isMouseLeave
                ) {
                    _func(event);
                    this.canvas?.invokeChange.call(this.canvas);
                    isMouseLeave = true;
                }
            } else isMouseLeave = false;
        };
        this.#eventHandler<MouseEvent>("mousemove", leave);
    }
    /** @Todo
     mouseover and mouseout
     has little bug when two chidls cross each other there are isMouse over happens to be true but one is under so check in bound checks it under the higher z index element
    */
    mouseover(_func: (event: MouseEvent) => void) {
        const mouseOver: any = {};
        let isMouseOver = false;
        let inBound = false;
        const over = (event: MouseEvent) => {
            this.listAllChilds((b: Block) => {
                if (mouseOver[b.nodeId!] == undefined)
                    mouseOver[b.nodeId!] = b.checkInBound(event);

                if (!b.checkInBound(event)) {
                    if (mouseOver[b.nodeId!]) {
                        mouseOver[b.nodeId!] = false;
                        isMouseOver = false;
                    }
                } else if (mouseOver[b.nodeId!] === false) {
                    mouseOver[b.nodeId!] = true;
                    isMouseOver = true;
                }
            });
            if (this.checkInBound(event)) {
                if (!inBound) {
                    inBound = true;
                    isMouseOver = true;
                }
            } else {
                inBound = false;
                isMouseOver = false;
            }

            if (isMouseOver) {
                _func(event);
                this.canvas?.invokeChange.call(this.canvas);
                isMouseOver = false;
            }
        };
        this.#eventHandler<MouseEvent>("mousemove", over);
    }
    mouseout(_func: (event: MouseEvent) => void) {
        const mouseLeave: any = {};
        let isMouseLeave = false;
        let outBound = false;
        const out = (event: MouseEvent) => {
            if (!this.checkInBound(event)) {
                if (!outBound) {
                    outBound = true;
                    isMouseLeave = true;
                }
            } else {
                outBound = false;
                isMouseLeave = false;
            }
            this.listAllChilds((b: Block) => {
                if (mouseLeave[b.nodeId!] == undefined)
                    mouseLeave[b.nodeId!] = b.checkInBound(event);
                if (b.checkInBound(event)) {
                    if (mouseLeave[b.nodeId!]) {
                        mouseLeave[b.nodeId!] = false;
                        isMouseLeave = true;
                    }
                } else if (mouseLeave[b.nodeId!] == false) {
                    mouseLeave[b.nodeId!] = true;
                    isMouseLeave = true;
                }
            });

            if (isMouseLeave) {
                _func(event);
                this.canvas?.invokeChange.call(this.canvas);
                isMouseLeave = false;
            }
        };
        this.#eventHandler<MouseEvent>("mousemove", out);
    }

    #eventHandler<E>(type: IMouseEvents, _func: (event: E) => void) {
        this.__events[type].push(_func);
    }

    selectable(opt?: boolean): boolean {
        const selectable = this.__valueHandler(opt, "selectable", false);
        if (
            !selectable ||
            this.position() === "fixed" ||
            this.position() === "sticky"
        )
            return false;
        const click = (e: MouseEvent) => {
            const { x, y } = this.canvas?.getCursorPosition(e) || {
                x: 0,
                y: 0,
            };
            let inBound;
            if (this.#runningEvents.selected) {
                inBound = checkInBound(
                    x,
                    y,
                    this.hotCornerX1(),
                    this.hotCornerY1(),
                    this.hotCornerX2(),
                    this.hotCornerY2(),
                    this.hotCornerX3(),
                    this.hotCornerY3(),
                    this.hotCornerX4(),
                    this.hotCornerY4()
                );
                if (inBound) this.canvas?.takeRegister({ in: this.zIndex() });
                else this.canvas?.takeRegister({ out: this.zIndex() });
            } else inBound = this.checkInBound(e);

            if (inBound && this.canvas?.whoIsTheFirst(this.zIndex())) {
                this.#runningEvents.selected = true;
            } else this.#runningEvents.selected = false;
            this.canvas.invokeChange(this);
        };
        this.#eventHandler("click", click);
        return selectable;
    }

    onRotate(opt?: (event: MouseEvent) => void) {
        const rotateE = this.__cacheOptions(opt, "onRotate", undefined);
        return (event: MouseEvent) => {
            rotateE?.(event);
        };
    }

    rotatable(opt?: boolean) {
        const rotatable = this.__valueHandler(opt, "rotatable", false);
        if (!rotatable) return false;

        let topMove = false;
        let leftMove = false;

        let inBound = false;

        const mousedown = (event: MouseEvent) => {
            if (this.#runningEvents.resize || this.#runningEvents.drag) return;
            console.log(inBound)
            if (inBound) {
                this.#runningEvents.rotate = true;
                this.canvas?.takeRegister({ in: this.zIndex() });
            } else {
                this.canvas?.takeRegister({ out: this.zIndex() });
            }
        };

        const mousemove = (event: MouseEvent) => {
            if (
                !this.#runningEvents.selected ||
                this.#runningEvents.drag ||
                this.#runningEvents.resize
            )
                return;

            let cursor: string = "auto";
            let { x, y } = this.canvas.getCursorPosition(event);
            if (!this.#runningEvents.rotate) {
                const ltx = this.hotCornerX1();
                const lty = this.hotCornerY1();
                const rtx = this.hotCornerX2();
                const rty = this.hotCornerY2();
                const lbx = this.hotCornerX3();
                const lby = this.hotCornerY3();
                const rbx = this.hotCornerX4();
                const rby = this.hotCornerY4();

                const hltx = this.hotRotCornerX1();
                const hlty = this.hotRotCornerY1();
                const hrtx = this.hotRotCornerX2();
                const hrty = this.hotRotCornerY2();
                const hlbx = this.hotRotCornerX3();
                const hlby = this.hotRotCornerY3();
                const hrbx = this.hotRotCornerX4();
                const hrby = this.hotRotCornerY4();

                if (
                    checkInBound(
                        x,
                        y,
                        hltx,
                        hlty,
                        ltx,
                        hlty,
                        hltx,
                        lty,
                        ltx,
                        lty
                    ) &&
                    this.rotationTopLeft()
                ) {
                    cursor = "cell";
                    topMove = true;
                    leftMove = true;
                } else if (
                    checkInBound(
                        x,
                        y,
                        rtx,
                        hrty,
                        hrtx,
                        hrty,
                        rtx,
                        rty,
                        hrtx,
                        rty
                    ) &&
                    this.rotationTopRight()
                ) {
                    cursor = "cell";
                    topMove = true;
                    leftMove = false;
                } else if (
                    checkInBound(
                        x,
                        y,
                        hlbx,
                        lby,
                        lbx,
                        lby,
                        hlbx,
                        hlby,
                        lbx,
                        lby
                    ) &&
                    this.rotationBottomLeft()
                ) {
                    cursor = "cell";
                    topMove = false;
                    leftMove = true;
                } else if (
                    checkInBound(
                        x,
                        y,
                        rbx,
                        rby,
                        hrbx,
                        rby,
                        rbx,
                        hrby,
                        hrbx,
                        hrby
                    ) &&
                    this.rotationBottomRight()
                ) {
                    cursor = "cell";
                    topMove = false;
                    leftMove = false;
                }
                console.log(cursor)
                if (cursor !== "auto") inBound = true;
                else inBound = false;
                this.canvas.changeCursor(cursor);
            }
            if (
                this.#runningEvents.rotate &&
                this.canvas?.whoIsTheFirst(this.zIndex())
            ) {
                let radian = Math.atan2(
                    y - this.rotationCenterY(),
                    x - this.rotationCenterX()
                );
                this.#beforeRotDegree = this.rotate()
                if (topMove && leftMove) {
                    this.rotate(radian + degreeToRadian(135));
                } else if (topMove && !leftMove) {
                    this.rotate(radian + degreeToRadian(45));
                } else if (!topMove && !leftMove) {
                    this.rotate(radian - degreeToRadian(45));
                } else if (!topMove && leftMove) {
                    this.rotate(radian - degreeToRadian(135));
                }
                this.onRotate()(event);
                this.canvas.invokeChange();
            }
        };

        const mouseup = () => {
            if (this.#runningEvents.rotate) {
                this.#runningEvents.rotate = false;
                let dummy: any = {};
                dummy[this.nodeId!] = {};
                this.canvas?.takeSnapshot(new Date().getTime(), dummy);
            }
        };

        this.#eventHandler("mousedown", mousedown);
        this.#eventHandler("mousemove", mousemove);
        this.#eventHandler("mouseup", mouseup);

        return rotatable;
    }

    __handleRotation() {
        const corner1 = this.__rotateCorners(this.cornerX1(), this.cornerY1());
        const corner2 = this.__rotateCorners(this.cornerX2(), this.cornerY2());
        const corner3 = this.__rotateCorners(this.cornerX3(), this.cornerY3());
        const corner4 = this.__rotateCorners(this.cornerX4(), this.cornerY4());
        this.cornerX1(corner1.x);
        this.cornerY1(corner1.y);
        this.cornerX2(corner2.x);
        this.cornerY2(corner2.y);
        this.cornerX3(corner3.x);
        this.cornerY3(corner3.y);
        this.cornerX4(corner4.x);
        this.cornerY4(corner4.y);

        const hotCorner1 = this.__rotateCorners(
            this.hotCornerX1(),
            this.hotCornerY1()
        );
        const hotCorner2 = this.__rotateCorners(
            this.hotCornerX2(),
            this.hotCornerY2()
        );
        const hotCorner3 = this.__rotateCorners(
            this.hotCornerX3(),
            this.hotCornerY3()
        );
        const hotCorner4 = this.__rotateCorners(
            this.hotCornerX4(),
            this.hotCornerY4()
        );
        this.hotCornerX1(hotCorner1.x);
        this.hotCornerY1(hotCorner1.y);
        this.hotCornerX2(hotCorner2.x);
        this.hotCornerY2(hotCorner2.y);
        this.hotCornerX3(hotCorner3.x);
        this.hotCornerY3(hotCorner3.y);
        this.hotCornerX4(hotCorner4.x);
        this.hotCornerY4(hotCorner4.y);

        const hotRotCorner1 = this.__rotateCorners(
            this.hotRotCornerX1(),
            this.hotRotCornerY1()
        );
        const hotRotCorner2 = this.__rotateCorners(
            this.hotRotCornerX2(),
            this.hotRotCornerY2()
        );
        const hotRotCorner3 = this.__rotateCorners(
            this.hotRotCornerX3(),
            this.hotRotCornerY3()
        );
        const hotRotCorner4 = this.__rotateCorners(
            this.hotRotCornerX4(),
            this.hotRotCornerY4()
        );
        this.hotRotCornerX1(hotRotCorner1.x);
        this.hotRotCornerY1(hotRotCorner1.y);
        this.hotRotCornerX2(hotRotCorner2.x);
        this.hotRotCornerY2(hotRotCorner2.y);
        this.hotRotCornerX3(hotRotCorner3.x);
        this.hotRotCornerY3(hotRotCorner3.y);
        this.hotRotCornerX4(hotRotCorner4.x);
        this.hotRotCornerY4(hotRotCorner4.y);
    }

    __rotateCorners(x: number, y: number) {
        return rotateCordinates(
            x,
            y,
            this.rotationCenterX(),
            this.rotationCenterY(),
            this.rotate() - this.#beforeRotDegree
        );
    }

    onResize(opt?: (event: MouseEvent) => void) {
        const resizeE = this.__cacheOptions(opt, "onResize", undefined);
        return (event: MouseEvent) => {
            resizeE?.(event);
        };
    }

    resizable(opt?: boolean): boolean {
        const resizable = this.__valueHandler(opt, "resizable", false);
        if (!resizable) return false;

        let initCords = { x: 0, y: 0 };
        let beforeCords = { x: 0, y: 0 };
        let beforeValues: any = {};

        let topResize = false;
        let leftResize = false;
        let widthResize = false;
        let heightResize = false;
        let isLeft = false;
        let isTop = false;

        let inBound = false;

        let originX = this.x();
        let originY = this.y();

        const mousedown = (event: MouseEvent) => {
            if (this.#runningEvents.drag || this.#runningEvents.rotate) return;

            if (inBound) {
                originX = this.x();
                originY = this.y();
                initCords = this.canvas.getCursorPosition(event);
                this.#runningEvents.resize = true;
                beforeCords = { x: 0, y: 0 };
                beforeValues[this.nodeId!] = {
                    x: this.x(),
                    y: this.y(),
                    width: this.width(),
                    height: this.height(),
                    cornerX1: this.cornerX1(),
                    cornerX2: this.cornerX2(),
                    cornerX3: this.cornerX3(),
                    cornerX4: this.cornerX4(),
                    cornerY1: this.cornerY1(),
                    cornerY2: this.cornerY2(),
                    cornerY3: this.cornerY3(),
                    cornerY4: this.cornerY4(),
                    hotCornerX1: this.hotCornerX1(),
                    hotCornerX2: this.hotCornerX2(),
                    hotCornerX3: this.hotCornerX3(),
                    hotCornerX4: this.hotCornerX4(),
                    hotCornerY1: this.hotCornerY1(),
                    hotCornerY2: this.hotCornerY2(),
                    hotCornerY3: this.hotCornerY3(),
                    hotCornerY4: this.hotCornerY4(),
                };
            }
        };

        const mousemove = (event: MouseEvent) => {
            if (!this.#runningEvents.selected) return;

            const { x, y } = this.canvas.getCursorPosition(event);
            if (!this.#runningEvents.resize) {
                let cursor: string | undefined = undefined;
                isTop =
                    isLeft =
                    widthResize =
                    heightResize =
                    leftResize =
                    topResize =
                        false;
                let ltx = this.cornerX1();
                let lty = this.cornerY1();
                let rtx = this.cornerX2();
                let rty = this.cornerY2();
                let lbx = this.cornerX3();
                let lby = this.cornerY3();
                let rbx = this.cornerX4();
                let rby = this.cornerY4();

                let hltx = this.hotCornerX1();
                let hlty = this.hotCornerY1();
                let hrtx = this.hotCornerX2();
                let hrty = this.hotCornerY2();
                let hlbx = this.hotCornerX3();
                let hlby = this.hotCornerY3();
                let hrbx = this.hotCornerX4();
                let hrby = this.hotCornerY4();
                if (
                    checkInBound(
                        x,
                        y,
                        hltx,
                        hlty,
                        ltx,
                        lty,
                        hlbx,
                        hlby,
                        lbx,
                        lby
                    )
                ) {
                    isLeft = ltx >= hltx || lbx >= hlby ? true : false;
                    widthResize = true;
                    leftResize = true;
                    cursor = "w-resize";
                } else if (
                    checkInBound(
                        x,
                        y,
                        rtx,
                        rty,
                        hrtx,
                        hrty,
                        rbx,
                        rby,
                        hrbx,
                        hrby
                    )
                ) {
                    isLeft = rtx >= hrtx || rbx >= hrbx ? true : false;
                    widthResize = true;
                    cursor = "w-resize";
                } else if (
                    checkInBound(
                        x,
                        y,
                        hltx,
                        hlty,
                        hrtx,
                        hrty,
                        ltx,
                        lty,
                        rtx,
                        rty
                    )
                ) {
                    isTop = lty >= hlty || rty >= hrty ? true : false;
                    heightResize = true;
                    topResize = true;
                    cursor = "n-resize";
                } else if (
                    checkInBound(
                        x,
                        y,
                        lbx,
                        lby,
                        rbx,
                        rby,
                        hlbx,
                        hlby,
                        hrbx,
                        hrby
                    )
                ) {
                    isTop = lby >= hlby || rby >= hrby ? true : false;
                    heightResize = true;
                    cursor = "n-resize";
                }

                if (checkInBound(x, y, hltx, hlty, ltx, lty, 0, 0, 0, 0)) {
                    isLeft = ltx >= hltx ? true : false;
                    isTop = lty >= hlty ? true : false;
                    topResize = true;
                    leftResize = true;
                    widthResize = true;
                    heightResize = true;
                    cursor = "nw-resize";
                }
                if (checkInBound(x, y, hrtx, hrty, rtx, rty, 0, 0, 0, 0)) {
                    isLeft = rtx >= hrtx ? true : false;
                    isTop = rty >= hrty ? true : false;
                    topResize = true;
                    leftResize = false;
                    widthResize = true;
                    heightResize = true;
                    cursor = "nesw-resize";
                }
                if (checkInBound(x, y, lbx, lby, hlbx, hlby, 0, 0, 0, 0)) {
                    isLeft = lbx >= hlbx ? true : false;
                    isTop = lby >= hlby ? true : false;
                    topResize = false;
                    leftResize = true;
                    widthResize = true;
                    heightResize = true;
                    cursor = "nesw-resize";
                }
                if (checkInBound(x, y, rbx, rby, hrbx, hrby, 0, 0, 0, 0)) {
                    isLeft = rbx >= hrbx ? true : false;
                    isTop = rby >= hrby ? true : false;
                    topResize = false;
                    leftResize = false;
                    widthResize = true;
                    heightResize = true;
                    cursor = "nw-resize";
                }
                if (cursor) inBound = true;
                else inBound = false;
                this.canvas.changeCursor(cursor);
            }

            if (this.#runningEvents.resize) {
                let diffX = x - initCords.x;
                let diffY = y - initCords.y;

                if (diffX !== 0 && widthResize) {
                    let diff = diffX - beforeCords.x;
                    let fliped;

                    if (isLeft) {
                        fliped =
                            this.width() - diff <= 0
                                ? this.horizontalFlipResize()
                                : true;
                    } else {
                        fliped =
                            this.width() + diff <= 0
                                ? this.horizontalFlipResize()
                                : true;
                    }
                    if (fliped) {
                        if (this.__isHorizontalFlipped) {
                            if (isLeft) {
                                this.x(this.x() + diff);
                                this.width(this.width() - diff);
                            } else {
                                this.x(originX);
                                this.width(this.width() + diff);
                            }
                        } else {
                            if (isLeft) {
                                this.x(this.x() + diff);
                                this.width(this.width() - diff);
                            } else {
                                this.x(originX);
                                this.width(this.width() + diff);
                            }
                        }

                        // @BUG: when resizing inverse these cordinates not updating correctly
                        if (leftResize) {
                            this.cornerX1(this.cornerX1() + diff);
                            this.cornerX3(this.cornerX3() + diff);
                            this.hotCornerX1(this.hotCornerX1() + diff);
                            this.hotCornerX3(this.hotCornerX3() + diff);
                        } else {
                            this.cornerX2(this.cornerX2() + diff);
                            this.cornerX4(this.cornerX4() + diff);
                            this.hotCornerX2(this.hotCornerX2() + diff);
                            this.hotCornerX4(this.hotCornerX4() + diff);
                        }
                        beforeCords.x = diffX;
                    }
                }
                if (diffY !== 0 && heightResize) {
                    const diff = diffY - beforeCords.y;

                    if (!this.__isVerticalFlipped) {
                        if (isTop) {
                            this.y(this.y() + diff);
                            this.height(this.height() - diff);
                        } else {
                            this.y(originY);
                            this.height(this.height() + diff);
                        }
                    } else {
                        if (isTop) {
                            this.y(this.y() - diff);
                            this.height(this.height() + diff);
                        } else {
                            // this.y(originY);
                            // this.height(this.height() + diff);
                        }
                    }

                    if (topResize) {
                        this.cornerY1(this.cornerY1() + diff);
                        this.cornerY2(this.cornerY2() + diff);
                        this.hotCornerY1(this.hotCornerY1() + diff);
                        this.hotCornerY2(this.hotCornerY2() + diff);
                    } else {
                        this.cornerY4(this.cornerY4() + diff);
                        this.cornerY3(this.cornerY3() + diff);
                        this.hotCornerY4(this.hotCornerY4() + diff);
                        this.hotCornerY3(this.hotCornerY3() + diff);
                    }
                    if (this.height() >= 0 || this.__isVerticalFlipped) {
                        beforeCords.y = diffY;
                    }
                }
                this.onResize()(event);
                this.canvas.invokeChange();
            }
        };

        const mouseup = () => {
            if (this.#runningEvents.resize) {
                this.canvas.changeCursor("auto");
                this.#runningEvents.resize = false;
                isTop =
                    isLeft =
                    widthResize =
                    heightResize =
                    leftResize =
                    topResize =
                        false;
                if (beforeCords.x !== 0 || beforeCords.y !== 0) {
                    let after: any = {};
                    after[this.nodeId!] = {
                        x: this.x(),
                        y: this.y(),
                        width: this.width(),
                        height: this.height(),
                        cornerX1: this.cornerX1(),
                        cornerY1: this.cornerY1(),
                        cornerX2: this.cornerX2(),
                        cornerY2: this.cornerY2(),
                        cornerX3: this.cornerX3(),
                        cornerY3: this.cornerY3(),
                        cornerX4: this.cornerX4(),
                        cornerY4: this.cornerY4(),
                        hotCornerY1: this.hotCornerY1(),
                        hotCornerX2: this.hotCornerX2(),
                        hotCornerY2: this.hotCornerY2(),
                        hotCornerX3: this.hotCornerX3(),
                        hotCornerY3: this.hotCornerY3(),
                        hotCornerX4: this.hotCornerX4(),
                        hotCornerY4: this.hotCornerY4(),
                    };
                    this.canvas?.takeSnapshot(
                        new Date().getTime(),
                        beforeValues,
                        after
                    );
                    this.canvas.invokeChange();
                }
            }
        };

        this.#eventHandler("mousedown", mousedown);
        this.#eventHandler("mousemove", mousemove);
        this.#eventHandler("mouseup", mouseup);
        return resizable;
    }

    onDrag(opt?: (event: MouseEvent) => void) {
        const rotateE = this.__cacheOptions(opt, "onDrag", undefined);
        return (event: MouseEvent) => {
            rotateE?.(event);
        };
    }

    draggable(opt?: boolean): boolean {
        const draggable = this.__valueHandler(opt, "draggable", false);
        if (!draggable) return false;

        let initCords = { x: 0, y: 0 };
        let beforeCords = { x: 0, y: 0 };
        let beforeValues: any = {};

        this.mousedown((event) => {
            if (this.#runningEvents.resize || this.#runningEvents.rotate)
                return;
            initCords = this.canvas.getCursorPosition(event);
            beforeCords = { x: 0, y: 0 };
            beforeValues[this.nodeId!] = {
                x: this.x(),
                y: this.y(),
                cornerX1: this.cornerX1(),
                cornerX2: this.cornerX2(),
                cornerX3: this.cornerX3(),
                cornerX4: this.cornerX4(),
                cornerY1: this.cornerY1(),
                cornerY2: this.cornerY2(),
                cornerY3: this.cornerY3(),
                cornerY4: this.cornerY4(),
                hotCornerX1: this.hotCornerX1(),
                hotCornerX2: this.hotCornerX2(),
                hotCornerX3: this.hotCornerX3(),
                hotCornerX4: this.hotCornerX4(),
                hotCornerY1: this.hotCornerY1(),
                hotCornerY2: this.hotCornerY2(),
                hotCornerY3: this.hotCornerY3(),
                hotCornerY4: this.hotCornerY4(),
                rotationCenterX: this.rotationCenterX(),
                rotationCenterY: this.rotationCenterY(),
            };
            this.#runningEvents.drag = true;
        });

        const mousemove = (event: MouseEvent) => {
            if (
                this.#runningEvents.resize ||
                this.#runningEvents.rotate ||
                !this.#runningEvents.drag ||
                this.position() === "fixed" ||
                this.position() === "sticky"
            )
                return;
            if (this.canvas?.whoIsTheFirst(this.zIndex())) {
                const { x, y } = this.canvas.getCursorPosition(event);
                let diffX = x - initCords.x;
                let diffY = y - initCords.y;
                if (diffX !== 0 && this.dragX()) {
                    const diff = diffX - beforeCords.x;
                    this.x(this.x() + diff);

                    this.cornerX1(this.cornerX1() + diff);
                    this.cornerX2(this.cornerX2() + diff);
                    this.cornerX3(this.cornerX3() + diff);
                    this.cornerX4(this.cornerX4() + diff);

                    this.hotCornerX1(this.hotCornerX1() + diff);
                    this.hotCornerX2(this.hotCornerX2() + diff);
                    this.hotCornerX3(this.hotCornerX3() + diff);
                    this.hotCornerX4(this.hotCornerX4() + diff);

                    this.hotRotCornerX1(this.hotRotCornerX1() + diff);
                    this.hotRotCornerX2(this.hotRotCornerX2() + diff);
                    this.hotRotCornerX3(this.hotRotCornerX3() + diff);
                    this.hotRotCornerX4(this.hotRotCornerX4() + diff);

                    this.rotationCenterX(this.rotationCenterX() + diff);

                    beforeCords.x = diffX;
                }
                if (diffY !== 0 && this.dragY()) {
                    const diff = diffY - beforeCords.y;
                    this.y(this.y() + diff);

                    this.cornerY1(this.cornerY1() + diff);
                    this.cornerY2(this.cornerY2() + diff);
                    this.cornerY3(this.cornerY3() + diff);
                    this.cornerY4(this.cornerY4() + diff);

                    this.hotCornerY1(this.hotCornerY1() + diff);
                    this.hotCornerY2(this.hotCornerY2() + diff);
                    this.hotCornerY3(this.hotCornerY3() + diff);
                    this.hotCornerY4(this.hotCornerY4() + diff);

                    this.hotRotCornerY1(this.hotRotCornerY1() + diff);
                    this.hotRotCornerY2(this.hotRotCornerY2() + diff);
                    this.hotRotCornerY3(this.hotRotCornerY3() + diff);
                    this.hotRotCornerY4(this.hotRotCornerY4() + diff);

                    this.rotationCenterY(this.rotationCenterY() + diff);

                    beforeCords.y = diffY;
                }
                this.onDrag()(event);
                this.canvas?.invokeChange();
            }
        };
        const mouseup = () => {
            if (this.#runningEvents.drag) {
                this.#runningEvents.drag = false;
                if (beforeCords.x !== 0 || beforeCords.y !== 0) {
                    const after: any = {};
                    after[this.nodeId!] = {
                        x: this.x(),
                        y: this.y(),
                        cornerX1: this.cornerX1(),
                        cornerX2: this.cornerX2(),
                        cornerX3: this.cornerX3(),
                        cornerX4: this.cornerX4(),
                        cornerY1: this.cornerY1(),
                        cornerY2: this.cornerY2(),
                        cornerY3: this.cornerY3(),
                        cornerY4: this.cornerY4(),
                        hotCornerX1: this.hotCornerX1(),
                        hotCornerX2: this.hotCornerX2(),
                        hotCornerX3: this.hotCornerX3(),
                        hotCornerX4: this.hotCornerX4(),
                        hotCornerY1: this.hotCornerY1(),
                        hotCornerY2: this.hotCornerY2(),
                        hotCornerY3: this.hotCornerY3(),
                        hotCornerY4: this.hotCornerY4(),
                        rotationCenterX: this.rotationCenterX(),
                        rotationCenterY: this.rotationCenterY(),
                    };
                    this.canvas.takeSnapshot(
                        new Date().getTime(),
                        beforeValues,
                        after
                    );
                    this.canvas.invokeChange();
                }
            }
        };
        this.#eventHandler<MouseEvent>("mousemove", mousemove);
        this.#eventHandler<MouseEvent>("mouseup", mouseup);

        return draggable;
    }
}
