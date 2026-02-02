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
    radianToDegree,
    cubicBezier,
    lerp,
    linear,
    steps,
    hexToRgba,
    colorToRgba,
    rgbaRepresenter,
    getPrototype,
    rotateCordinates,
    inRange,
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
export type XY = { x: number; y: number };

export interface HotCornerArea {
    topLeft: XY;
    topRight: XY;
    bottomLeft: XY;
    bottomRight: XY;
}

export interface BlockOptions {
    [key: string]: any;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
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
    rotationCenterX?: number;
    rotationCenterY?: number;
    cornerTopLeft?: XY;
    cornerTopRight?: XY;
    cornerBottomLeft?: XY;
    cornerBottomRight?: XY;
    hotCornerTopLeft?: XY;
    hotCornerTopRight?: XY;
    hotCornerBottomLeft?: XY;
    hotCornerBottomRight?: XY;
    hotRotCornerTopLeft?: XY;
    hotRotCornerTopRight?: XY;
    hotRotCornerBottomLeft?: XY;
    hotRotCornerBottomRight?: XY;
    hotRotatableAreaTopLeft?: XY;
    hotRotatableAreaTopRight?: XY;
    hotRotatableAreaBottomLeft?: XY;
    hotRotatableAreaBottomRight?: XY;
    hotResizableAreaTopLeft?: XY;
    hotResizableAreaTopRight?: XY;
    hotResizableAreaBottomLeft?: XY;
    hotResizableAreaBottomRight?: XY;
    hotResizableAreaTop?: XY;
    hotResizableAreaRight?: XY;
    hotResizableAreaLeft?: XY;
    hotResizableAreaBottom?: XY;
}

export class Block<T = BlockOptions> extends Node {
    canvas: Canvas | any;
    parent: Block | undefined = this.parentNode as Block;
    ownOptions: IBlock<T>;
    options: IBlock<T>;
    __bindOptions: { bindTo: Block; options: (keyof BlockOptions)[] }[] = [];
    __runningEvents = {
        drag: false,
        rotate: false,
        resize: false,
        selected: false,
    };
    __events: any = {
        click: [],
        dblclick: [],
        mousedown: [],
        mouseup: [],
        mousemove: [],
        mouseenter: [],
        mouseleave: [],
        mouseout: [],
        mouseover: [],
    };
    __animationOn: any = [];
    #cursor: string | undefined;

    #keyframeIterations: any = {};

    constructor(options: IBlock<T>) {
        super();
        this.options = { ...options };
        this.ownOptions = { ...options };
        this.__initCordinates();
    }

    get context(): CanvasRenderingContext2D {
        return this.canvas?.context;
    }

    render() {
        this.__adjustBlocks();
        if (this.hidden()) {
            this.listAllChilds((n: Block) => {
                n.hidden(true);
            });
            return;
        }
        // this.showHotAreas();
        if (this.__runningEvents.selected) this.__hotLines();
    }

    // @Todo remove this
    showHotAreas() {
        this.context.beginPath();
        this.context.moveTo(
            this.hotResizableAreaTopLeft().topLeft.x,
            this.hotResizableAreaTopLeft().topLeft.y
        );

        this.context.lineTo(
            this.hotResizableAreaTopLeft().topRight.x,
            this.hotResizableAreaTopLeft().topRight.y
        );

        this.context.lineTo(
            this.hotResizableAreaTopLeft().bottomRight.x,
            this.hotResizableAreaTopLeft().bottomRight.y
        );

        this.context.lineTo(
            this.hotResizableAreaTopLeft().bottomLeft.x,
            this.hotResizableAreaTopLeft().bottomLeft.y
        );

        this.context.lineTo(
            this.hotResizableAreaTopLeft().topLeft.x,
            this.hotResizableAreaTopLeft().topLeft.y
        );

        this.context.moveTo(
            this.hotResizableAreaTopRight().topLeft.x,
            this.hotResizableAreaTopRight().topLeft.y
        );

        this.context.lineTo(
            this.hotResizableAreaTopRight().topRight.x,
            this.hotResizableAreaTopRight().topRight.y
        );

        this.context.lineTo(
            this.hotResizableAreaTopRight().bottomRight.x,
            this.hotResizableAreaTopRight().bottomRight.y
        );

        this.context.lineTo(
            this.hotResizableAreaTopRight().bottomLeft.x,
            this.hotResizableAreaTopRight().bottomLeft.y
        );

        this.context.lineTo(
            this.hotResizableAreaTopRight().topLeft.x,
            this.hotResizableAreaTopRight().topLeft.y
        );

        this.context.moveTo(
            this.hotResizableAreaBottomLeft().topLeft.x,
            this.hotResizableAreaBottomLeft().topLeft.y
        );

        this.context.lineTo(
            this.hotResizableAreaBottomLeft().topRight.x,
            this.hotResizableAreaBottomLeft().topRight.y
        );

        this.context.lineTo(
            this.hotResizableAreaBottomLeft().bottomRight.x,
            this.hotResizableAreaBottomLeft().bottomRight.y
        );

        this.context.lineTo(
            this.hotResizableAreaBottomLeft().bottomLeft.x,
            this.hotResizableAreaBottomLeft().bottomLeft.y
        );

        this.context.lineTo(
            this.hotResizableAreaBottomLeft().topLeft.x,
            this.hotResizableAreaBottomLeft().topLeft.y
        );

        this.context.moveTo(
            this.hotResizableAreaBottomRight().topLeft.x,
            this.hotResizableAreaBottomRight().topLeft.y
        );

        this.context.lineTo(
            this.hotResizableAreaBottomRight().topRight.x,
            this.hotResizableAreaBottomRight().topRight.y
        );

        this.context.lineTo(
            this.hotResizableAreaBottomRight().bottomRight.x,
            this.hotResizableAreaBottomRight().bottomRight.y
        );

        this.context.lineTo(
            this.hotResizableAreaBottomRight().bottomLeft.x,
            this.hotResizableAreaBottomRight().bottomLeft.y
        );

        this.context.lineTo(
            this.hotResizableAreaBottomRight().topLeft.x,
            this.hotResizableAreaBottomRight().topLeft.y
        );
        this.context.fillStyle = "red";
        this.context.fill();

        this.context.beginPath();
        this.context.moveTo(
            this.hotResizableAreaTop().topLeft.x,
            this.hotResizableAreaTop().topLeft.y
        );

        this.context.lineTo(
            this.hotResizableAreaTop().topRight.x,
            this.hotResizableAreaTop().topRight.y
        );

        this.context.lineTo(
            this.hotResizableAreaTop().bottomRight.x,
            this.hotResizableAreaTop().bottomRight.y
        );

        this.context.lineTo(
            this.hotResizableAreaTop().bottomLeft.x,
            this.hotResizableAreaTop().bottomLeft.y
        );

        this.context.lineTo(
            this.hotResizableAreaTop().topLeft.x,
            this.hotResizableAreaTop().topLeft.y
        );

        //
        this.context.moveTo(
            this.hotResizableAreaLeft().topLeft.x,
            this.hotResizableAreaLeft().topLeft.y
        );

        this.context.lineTo(
            this.hotResizableAreaLeft().topRight.x,
            this.hotResizableAreaLeft().topRight.y
        );

        this.context.lineTo(
            this.hotResizableAreaLeft().bottomRight.x,
            this.hotResizableAreaLeft().bottomRight.y
        );

        this.context.lineTo(
            this.hotResizableAreaLeft().bottomLeft.x,
            this.hotResizableAreaLeft().bottomLeft.y
        );

        this.context.lineTo(
            this.hotResizableAreaLeft().topLeft.x,
            this.hotResizableAreaLeft().topLeft.y
        );

        //
        this.context.moveTo(
            this.hotResizableAreaBottom().topLeft.x,
            this.hotResizableAreaBottom().topLeft.y
        );

        this.context.lineTo(
            this.hotResizableAreaBottom().topRight.x,
            this.hotResizableAreaBottom().topRight.y
        );

        this.context.lineTo(
            this.hotResizableAreaBottom().bottomRight.x,
            this.hotResizableAreaBottom().bottomRight.y
        );

        this.context.lineTo(
            this.hotResizableAreaBottom().bottomLeft.x,
            this.hotResizableAreaBottom().bottomLeft.y
        );

        this.context.lineTo(
            this.hotResizableAreaBottom().topLeft.x,
            this.hotResizableAreaBottom().topLeft.y
        );

        //
        this.context.moveTo(
            this.hotResizableAreaRight().topLeft.x,
            this.hotResizableAreaRight().topLeft.y
        );

        this.context.lineTo(
            this.hotResizableAreaRight().topRight.x,
            this.hotResizableAreaRight().topRight.y
        );

        this.context.lineTo(
            this.hotResizableAreaRight().bottomRight.x,
            this.hotResizableAreaRight().bottomRight.y
        );

        this.context.lineTo(
            this.hotResizableAreaRight().bottomLeft.x,
            this.hotResizableAreaRight().bottomLeft.y
        );

        this.context.lineTo(
            this.hotResizableAreaRight().topLeft.x,
            this.hotResizableAreaRight().topLeft.y
        );

        this.context.fillStyle = "aqua";
        this.context.fill();

        this.context.beginPath();
        this.context.moveTo(
            this.hotRotatableAreaTopLeft().topLeft.x,
            this.hotRotatableAreaTopLeft().topLeft.y
        );

        this.context.lineTo(
            this.hotRotatableAreaTopLeft().topRight.x,
            this.hotRotatableAreaTopLeft().topRight.y
        );

        this.context.lineTo(
            this.hotRotatableAreaTopLeft().bottomRight.x,
            this.hotRotatableAreaTopLeft().bottomRight.y
        );

        this.context.lineTo(
            this.hotRotatableAreaTopLeft().bottomLeft.x,
            this.hotRotatableAreaTopLeft().bottomLeft.y
        );

        this.context.lineTo(
            this.hotRotatableAreaTopLeft().topLeft.x,
            this.hotRotatableAreaTopLeft().topLeft.y
        );

        this.context.moveTo(
            this.hotRotatableAreaTopRight().topLeft.x,
            this.hotRotatableAreaTopRight().topLeft.y
        );

        this.context.lineTo(
            this.hotRotatableAreaTopRight().topRight.x,
            this.hotRotatableAreaTopRight().topRight.y
        );

        this.context.lineTo(
            this.hotRotatableAreaTopRight().bottomRight.x,
            this.hotRotatableAreaTopRight().bottomRight.y
        );

        this.context.lineTo(
            this.hotRotatableAreaTopRight().bottomLeft.x,
            this.hotRotatableAreaTopRight().bottomLeft.y
        );

        this.context.lineTo(
            this.hotRotatableAreaTopRight().topLeft.x,
            this.hotRotatableAreaTopRight().topLeft.y
        );

        this.context.moveTo(
            this.hotRotatableAreaBottomLeft().topLeft.x,
            this.hotRotatableAreaBottomLeft().topLeft.y
        );

        this.context.lineTo(
            this.hotRotatableAreaBottomLeft().topRight.x,
            this.hotRotatableAreaBottomLeft().topRight.y
        );

        this.context.lineTo(
            this.hotRotatableAreaBottomLeft().bottomRight.x,
            this.hotRotatableAreaBottomLeft().bottomRight.y
        );

        this.context.lineTo(
            this.hotRotatableAreaBottomLeft().bottomLeft.x,
            this.hotRotatableAreaBottomLeft().bottomLeft.y
        );

        this.context.lineTo(
            this.hotRotatableAreaBottomLeft().topLeft.x,
            this.hotRotatableAreaBottomLeft().topLeft.y
        );

        this.context.moveTo(
            this.hotRotatableAreaBottomRight().topLeft.x,
            this.hotRotatableAreaBottomRight().topLeft.y
        );

        this.context.lineTo(
            this.hotRotatableAreaBottomRight().topRight.x,
            this.hotRotatableAreaBottomRight().topRight.y
        );

        this.context.lineTo(
            this.hotRotatableAreaBottomRight().bottomRight.x,
            this.hotRotatableAreaBottomRight().bottomRight.y
        );

        this.context.lineTo(
            this.hotRotatableAreaBottomRight().bottomLeft.x,
            this.hotRotatableAreaBottomRight().bottomLeft.y
        );

        this.context.lineTo(
            this.hotRotatableAreaBottomRight().topLeft.x,
            this.hotRotatableAreaBottomRight().topLeft.y
        );
        this.context.fillStyle = "yellow";
        this.context.fill();
    }

    addChild(...node: Node[]): void {
        super.addChild(...node);
    }

    removeChild<T>(child: T): void {
        super.removeChild(child);
        this.canvas?.invokeChange(this.canvas);
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
        this.context.moveTo(
            this.hotCornerTopLeft().x,
            this.hotCornerTopLeft().y
        );
        if (!this.hotTopFunc()) {
            this.context.lineTo(
                this.hotCornerTopRight().x,
                this.hotCornerTopRight().y
            );
            this.context.lineWidth = lineWidth;
            this.context.strokeStyle = lineColor;
            this.context.stroke();
        } else this.hotTopFunc()?.(this.context);

        this.context.beginPath();
        this.context.moveTo(
            this.hotCornerTopLeft().x,
            this.hotCornerTopLeft().y
        );
        if (!this.hotLeftFunc()) {
            this.context.lineTo(
                this.hotCornerBottomLeft().x,
                this.hotCornerBottomLeft().y
            );
            this.context.lineWidth = lineWidth;
            this.context.strokeStyle = lineColor;
            this.context.stroke();
        } else this.hotLeftFunc()?.(this.context);

        this.context.beginPath();
        this.context.moveTo(
            this.hotCornerBottomLeft().x,
            this.hotCornerBottomLeft().y
        );
        if (!this.hotBottomFunc()) {
            this.context.lineTo(
                this.hotCornerBottomRight().x,
                this.hotCornerBottomRight().y
            );
            this.context.lineWidth = lineWidth;
            this.context.strokeStyle = lineColor;
            this.context.stroke();
        } else this.hotBottomFunc()?.(this.context);

        this.context.beginPath();
        this.context.moveTo(
            this.hotCornerBottomRight().x,
            this.hotCornerBottomRight().y
        );
        if (!this.hotRightFunc()) {
            this.context.lineTo(
                this.hotCornerTopRight().x,
                this.hotCornerTopRight().y
            );
            this.context.lineWidth = lineWidth;
            this.context.strokeStyle = lineColor;
            this.context.stroke();
        } else this.hotRightFunc()?.(this.context);

        this.context.beginPath();
        if (!this.hotCornerTopLeftFunc()) {
            this.context.roundRect(
                this.hotCornerTopLeft().x - size / 2,
                this.hotCornerTopLeft().y - size / 2,
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
            this.hotCornerTopLeftFunc()?.(this.context);
        }

        this.context.beginPath();
        if (!this.hotCornerTopRightFunc()) {
            this.context.roundRect(
                this.hotCornerTopRight().x - size / 2,
                this.hotCornerTopRight().y - size / 2,
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
            this.hotCornerTopRightFunc()?.(this.context);
        }

        this.context.beginPath();
        if (!this.hotCornerBottomLeftFunc()) {
            this.context.roundRect(
                this.hotCornerBottomLeft().x - size / 2,
                this.hotCornerBottomLeft().y - size / 2,
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
            this.hotCornerBottomLeftFunc()?.(this.context);
        }

        this.context.beginPath();
        if (!this.hotCornerBottomRightFunc()) {
            this.context.roundRect(
                this.hotCornerBottomRight().x - size / 2,
                this.hotCornerBottomRight().y - size / 2,
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
            this.hotCornerBottomRightFunc()?.(this.context);
        }
    }

    __adjustBlocks(): void {
        this.position();
        const cacheR = this.rotate();
        this.rotate(0);
        this.listOnlyChilds((b: Block) => {
            b.rotate(cacheR);
            b.x(
                (b.options.x || 0) +
                    this.#getLeft.x +
                    this.marginLeft() +
                    this.paddingLeft()
            );
            b.y(
                (b.options.y || 0) +
                    this.#getTop.y +
                    this.marginTop() +
                    this.paddingTop()
            );
            b.__adjustBlocks();
        });
        this.rotate(cacheR);
    }

    __initCordinates() {
        this.cornerTopLeft({
            x: this.x(),
            y: this.y(),
        });
        this.cornerTopRight({
            x: this.x() + this.width(),
            y: this.y(),
        });
        this.cornerBottomLeft({ x: this.x(), y: this.y() + this.height() });
        this.cornerBottomRight({
            x: this.x() + this.width(),
            y: this.y() + this.height(),
        });

        this.rotationCenterX(this.#getCenterX);
        this.rotationCenterY(this.#getCenterY);

        this.hotCornerTopLeft({
            x: this.cornerTopLeft().x - this.hotAreaGap(),
            y: this.cornerTopLeft().y - this.hotAreaGap(),
        });
        this.hotCornerTopRight({
            x: this.cornerTopRight().x + this.hotAreaGap(),
            y: this.cornerTopRight().y - this.hotAreaGap(),
        });
        this.hotCornerBottomLeft({
            x: this.cornerBottomLeft().x - this.hotAreaGap(),
            y: this.cornerBottomLeft().y + this.hotAreaGap(),
        });
        this.hotCornerBottomRight({
            x: this.cornerBottomRight().x + this.hotAreaGap(),
            y: this.cornerBottomRight().y + this.hotAreaGap(),
        });

        this.hotRotCornerTopLeft({
            x: this.hotCornerTopLeft().x - this.hotAreaSize(),
            y: this.hotCornerTopLeft().y - this.hotAreaSize(),
        });
        this.hotRotCornerTopRight({
            x: this.hotCornerTopRight().x + this.hotAreaSize(),
            y: this.hotCornerTopRight().y - this.hotAreaSize(),
        });
        this.hotRotCornerBottomLeft({
            x: this.hotCornerBottomLeft().x - this.hotAreaSize(),
            y: this.hotCornerBottomLeft().y + this.hotAreaSize(),
        });
        this.hotRotCornerBottomRight({
            x: this.hotCornerBottomRight().x + this.hotAreaSize(),
            y: this.hotCornerBottomRight().y + this.hotAreaSize(),
        });

        this.hotRotatableAreaTopLeft({
            topLeft: {
                x: this.hotRotCornerTopLeft().x,
                y: this.hotRotCornerTopLeft().y,
            },
            topRight: {
                x: this.hotRotCornerTopLeft().x + this.hotAreaSize(),
                y: this.hotRotCornerTopLeft().y,
            },
            bottomLeft: {
                x: this.hotRotCornerTopLeft().x,
                y: this.hotRotCornerTopLeft().y + this.hotAreaSize(),
            },
            bottomRight: {
                x: this.hotRotCornerTopLeft().x + this.hotAreaSize(),
                y: this.hotRotCornerTopLeft().y + this.hotAreaSize(),
            },
        });
        this.hotRotatableAreaTopRight({
            topLeft: {
                x: this.hotRotCornerTopRight().x - this.hotAreaSize(),
                y: this.hotRotCornerTopRight().y,
            },
            topRight: {
                x: this.hotRotCornerTopRight().x,
                y: this.hotRotCornerTopRight().y,
            },
            bottomLeft: {
                x: this.hotRotCornerTopRight().x - this.hotAreaSize(),
                y: this.hotRotCornerTopRight().y + this.hotAreaSize(),
            },
            bottomRight: {
                x: this.hotRotCornerTopRight().x,
                y: this.hotRotCornerTopRight().y + this.hotAreaSize(),
            },
        });
        this.hotRotatableAreaBottomLeft({
            topLeft: {
                x: this.hotRotCornerBottomLeft().x,
                y: this.hotRotCornerBottomLeft().y - this.hotAreaSize(),
            },
            topRight: {
                x: this.hotRotCornerBottomLeft().x + this.hotAreaSize(),
                y: this.hotRotCornerBottomLeft().y - this.hotAreaSize(),
            },
            bottomLeft: {
                x: this.hotRotCornerBottomLeft().x,
                y: this.hotRotCornerBottomLeft().y,
            },
            bottomRight: {
                x: this.hotRotCornerBottomLeft().x + this.hotAreaSize(),
                y: this.hotRotCornerBottomLeft().y,
            },
        });
        this.hotRotatableAreaBottomRight({
            topLeft: {
                x: this.hotRotCornerBottomRight().x - this.hotAreaSize(),
                y: this.hotRotCornerBottomRight().y - this.hotAreaSize(),
            },
            topRight: {
                x: this.hotRotCornerBottomRight().x,
                y: this.hotRotCornerBottomRight().y - this.hotAreaSize(),
            },
            bottomLeft: {
                x: this.hotRotCornerBottomRight().x - this.hotAreaSize(),
                y: this.hotRotCornerBottomRight().y,
            },
            bottomRight: {
                x: this.hotRotCornerBottomRight().x,
                y: this.hotRotCornerBottomRight().y,
            },
        });

        this.hotResizableAreaTopLeft({
            topLeft: {
                x: this.hotCornerTopLeft().x,
                y: this.hotCornerTopLeft().y,
            },
            topRight: {
                x: this.hotCornerTopLeft().x + this.hotAreaSize(),
                y: this.hotCornerTopLeft().y,
            },
            bottomLeft: {
                x: this.hotCornerTopLeft().x,
                y: this.hotCornerTopLeft().y + this.hotAreaSize(),
            },
            bottomRight: {
                x: this.hotCornerTopLeft().x + this.hotAreaSize(),
                y: this.hotCornerTopLeft().y + this.hotAreaSize(),
            },
        });
        this.hotResizableAreaTopRight({
            topLeft: {
                x: this.hotCornerTopRight().x - this.hotAreaSize(),
                y: this.hotCornerTopRight().y,
            },
            topRight: {
                x: this.hotCornerTopRight().x,
                y: this.hotCornerTopRight().y,
            },
            bottomLeft: {
                x: this.hotCornerTopRight().x - this.hotAreaSize(),
                y: this.hotCornerTopRight().y + this.hotAreaSize(),
            },
            bottomRight: {
                x: this.hotCornerTopRight().x,
                y: this.hotCornerTopRight().y + this.hotAreaSize(),
            },
        });
        this.hotResizableAreaBottomLeft({
            topLeft: {
                x: this.hotCornerBottomLeft().x,
                y: this.hotCornerBottomLeft().y - this.hotAreaSize(),
            },
            topRight: {
                x: this.hotCornerBottomLeft().x + this.hotAreaSize(),
                y: this.hotCornerBottomLeft().y - this.hotAreaSize(),
            },
            bottomLeft: {
                x: this.hotCornerBottomLeft().x,
                y: this.hotCornerBottomLeft().y,
            },
            bottomRight: {
                x: this.hotCornerBottomLeft().x + this.hotAreaSize(),
                y: this.hotCornerBottomLeft().y,
            },
        });
        this.hotResizableAreaBottomRight({
            topLeft: {
                x: this.hotCornerBottomRight().x - this.hotAreaSize(),
                y: this.hotCornerBottomRight().y - this.hotAreaSize(),
            },
            topRight: {
                x: this.hotCornerBottomRight().x,
                y: this.hotCornerBottomRight().y - this.hotAreaSize(),
            },
            bottomLeft: {
                x: this.hotCornerBottomRight().x - this.hotAreaSize(),
                y: this.hotCornerBottomRight().y,
            },
            bottomRight: {
                x: this.hotCornerBottomRight().x,
                y: this.hotCornerBottomRight().y,
            },
        });
        this.hotResizableAreaTop({
            topLeft: {
                x: this.hotCornerTopLeft().x + this.hotAreaSize(),
                y: this.hotCornerTopLeft().y,
            },
            topRight: {
                x: this.hotCornerTopRight().x - this.hotAreaSize(),
                y: this.hotCornerTopRight().y,
            },
            bottomLeft: {
                x: this.hotCornerTopLeft().x + this.hotAreaSize(),
                y: this.hotCornerTopLeft().y + this.hotAreaSize(),
            },
            bottomRight: {
                x: this.hotCornerTopRight().x - this.hotAreaSize(),
                y: this.hotCornerTopRight().y + this.hotAreaSize(),
            },
        });
        this.hotResizableAreaRight({
            topLeft: {
                x: this.hotCornerTopRight().x - this.hotAreaSize(),
                y: this.hotCornerTopRight().y + this.hotAreaSize(),
            },
            topRight: {
                x: this.hotCornerTopRight().x,
                y: this.hotCornerTopRight().y + this.hotAreaSize(),
            },
            bottomLeft: {
                x: this.hotCornerBottomRight().x - this.hotAreaSize(),
                y: this.hotCornerBottomRight().y - this.hotAreaSize(),
            },
            bottomRight: {
                x: this.hotCornerBottomRight().x,
                y: this.hotCornerBottomRight().y - this.hotAreaSize(),
            },
        });
        this.hotResizableAreaLeft({
            topLeft: {
                x: this.hotCornerTopLeft().x,
                y: this.hotCornerTopLeft().y + this.hotAreaSize(),
            },
            topRight: {
                x: this.hotCornerTopLeft().x + this.hotAreaSize(),
                y: this.hotCornerTopLeft().y + this.hotAreaSize(),
            },
            bottomLeft: {
                x: this.hotCornerBottomLeft().x,
                y: this.hotCornerBottomLeft().y - this.hotAreaSize(),
            },
            bottomRight: {
                x: this.hotCornerBottomLeft().x + this.hotAreaSize(),
                y: this.hotCornerBottomLeft().y - this.hotAreaSize(),
            },
        });
        this.hotResizableAreaBottom({
            topLeft: {
                x: this.hotCornerBottomLeft().x + this.hotAreaSize(),
                y: this.hotCornerBottomLeft().y - this.hotAreaSize(),
            },
            topRight: {
                x: this.hotCornerBottomRight().x - this.hotAreaSize(),
                y: this.hotCornerBottomRight().y - this.hotAreaSize(),
            },
            bottomLeft: {
                x: this.hotCornerBottomLeft().x + this.hotAreaSize(),
                y: this.hotCornerBottomLeft().y,
            },
            bottomRight: {
                x: this.hotCornerBottomRight().x - this.hotAreaSize(),
                y: this.hotCornerBottomRight().y,
            },
        });
        this.#updateCornerByRot(this.rotate());
    }

    get __isHorizontalFlipped() {
        let topLeft = this.cornerTopLeft();
        let topRight = this.cornerTopRight();
        let bottomLeft = this.cornerBottomLeft();
        let bottomRight = this.cornerBottomRight();
        if (this.rotate() !== 0) {
            topLeft = this.__rotateCorners(
                this.cornerTopLeft().x,
                this.cornerTopLeft().y,
                0
            );
            topRight = this.__rotateCorners(
                this.cornerTopRight().x,
                this.cornerTopRight().y,
                0
            );
            bottomLeft = this.__rotateCorners(
                this.cornerBottomLeft().x,
                this.cornerBottomLeft().y,
                0
            );
            bottomRight = this.__rotateCorners(
                this.cornerBottomRight().x,
                this.cornerBottomRight().y,
                0
            );
        }
        if (topLeft.x > topRight.x || bottomLeft.x > bottomRight.x) return true;
        return false;
    }
    get __isVerticalFlipped() {
        let topLeft = this.cornerTopLeft();
        let topRight = this.cornerTopRight();
        let bottomLeft = this.cornerBottomLeft();
        let bottomRight = this.cornerBottomRight();
        if (this.rotate() !== 0) {
            topLeft = this.__rotateCorners(
                this.cornerTopLeft().x,
                this.cornerTopLeft().y,
                0
            );
            topRight = this.__rotateCorners(
                this.cornerTopRight().x,
                this.cornerTopRight().y,
                0
            );
            bottomLeft = this.__rotateCorners(
                this.cornerBottomLeft().x,
                this.cornerBottomLeft().y,
                0
            );
            bottomRight = this.__rotateCorners(
                this.cornerBottomRight().x,
                this.cornerBottomRight().y,
                0
            );
        }
        if (topLeft.y > bottomLeft.y || topRight.y > bottomRight.y) return true;
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
                    this.canvas?.width
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
                    this.canvas?.height
                ) as O;
            else if (
                val.endsWith("vw") &&
                widthRelated !== undefined &&
                widthRelated === true
            )
                return fromVW(
                    Number(val.split("vw")[0]),
                    this.canvas?.width
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
        return this.__cacheOption(val, option, defaultOpt);
    }

    __cacheOption<T>(
        opt: T | undefined,
        option: keyof IBlock<BlockOptions>,
        defaultOpt: T
    ): T {
        // @Todo: fix type issue over the generic readonly a.k.a (as any)
        if (opt !== undefined) (this.ownOptions[option] as any) = opt;
        else if (this.ownOptions[option] === undefined)
            (this.ownOptions[option] as any) = defaultOpt;
        return this.ownOptions[option];
    }

    x(opt?: number | string): number {
        const cacheX = this.ownOptions["x"] || 0;
        const x = this.__valueHandler(opt, "x", 0, true);
        const diffX = x - cacheX;
        if (diffX !== 0) {
            if (this.ownOptions.position == "absolute") {
                if (this.left() !== undefined) this.left(this.left()! + diffX);
                else if (this.right() !== undefined)
                    this.right(this.right()! - diffX);
            }

            const cacheR = this.rotate();
            this.rotate(0);
            this.rotationCenterX(this.rotationCenterX() + diffX);

            this.#updateCordX("cornerTopLeft", diffX);
            this.#updateCordX("cornerTopRight", diffX);
            this.#updateCordX("cornerBottomLeft", diffX);
            this.#updateCordX("cornerBottomRight", diffX);

            this.#updateCordX("hotCornerTopLeft", diffX);
            this.#updateCordX("hotCornerTopRight", diffX);
            this.#updateCordX("hotCornerBottomLeft", diffX);
            this.#updateCordX("hotCornerBottomRight", diffX);

            this.#updateCordX("hotRotCornerTopLeft", diffX);
            this.#updateCordX("hotRotCornerTopRight", diffX);
            this.#updateCordX("hotRotCornerBottomLeft", diffX);
            this.#updateCordX("hotRotCornerBottomRight", diffX);

            this.#updateAreaCordX("hotResizableAreaTopLeft", diffX);
            this.#updateAreaCordX("hotResizableAreaTopRight", diffX);
            this.#updateAreaCordX("hotResizableAreaBottomLeft", diffX);
            this.#updateAreaCordX("hotResizableAreaBottomRight", diffX);
            this.#updateAreaCordX("hotResizableAreaTop", diffX);
            this.#updateAreaCordX("hotResizableAreaRight", diffX);
            this.#updateAreaCordX("hotResizableAreaLeft", diffX);
            this.#updateAreaCordX("hotResizableAreaBottom", diffX);

            this.#updateAreaCordX("hotRotatableAreaTopLeft", diffX);
            this.#updateAreaCordX("hotRotatableAreaTopRight", diffX);
            this.#updateAreaCordX("hotRotatableAreaBottomLeft", diffX);
            this.#updateAreaCordX("hotRotatableAreaBottomRight", diffX);

            this.rotate(cacheR);
        }
        return x;
    }

    y(opt?: number | string): number {
        const cacheY = this.ownOptions["y"] || 0;
        const y = this.__valueHandler(opt, "y", 0, true);
        const diffY = y - cacheY;
        if (cacheY !== y && diffY !== 0) {
            if (this.ownOptions.position == "absolute") {
                if (this.top() !== undefined) this.top(this.top()! + diffY);
                else if (this.bottom() !== undefined)
                    this.bottom(this.bottom()! - diffY);
            }
            const cacheR = this.rotate();
            this.rotate(0);
            this.rotationCenterY(this.rotationCenterY() + diffY);

            this.#updateCordY("cornerTopLeft", diffY);
            this.#updateCordY("cornerTopRight", diffY);
            this.#updateCordY("cornerBottomLeft", diffY);
            this.#updateCordY("cornerBottomRight", diffY);

            this.#updateCordY("hotCornerTopLeft", diffY);
            this.#updateCordY("hotCornerTopRight", diffY);
            this.#updateCordY("hotCornerBottomLeft", diffY);
            this.#updateCordY("hotCornerBottomRight", diffY);

            this.#updateCordY("hotRotCornerTopLeft", diffY);
            this.#updateCordY("hotRotCornerTopRight", diffY);
            this.#updateCordY("hotRotCornerBottomLeft", diffY);
            this.#updateCordY("hotRotCornerBottomRight", diffY);

            this.#updateAreaCordY("hotResizableAreaTopLeft", diffY);
            this.#updateAreaCordY("hotResizableAreaTopRight", diffY);
            this.#updateAreaCordY("hotResizableAreaBottomLeft", diffY);
            this.#updateAreaCordY("hotResizableAreaBottomRight", diffY);
            this.#updateAreaCordY("hotResizableAreaTop", diffY);
            this.#updateAreaCordY("hotResizableAreaRight", diffY);
            this.#updateAreaCordY("hotResizableAreaLeft", diffY);
            this.#updateAreaCordY("hotResizableAreaBottom", diffY);

            this.#updateAreaCordY("hotRotatableAreaTopLeft", diffY);
            this.#updateAreaCordY("hotRotatableAreaTopRight", diffY);
            this.#updateAreaCordY("hotRotatableAreaBottomLeft", diffY);
            this.#updateAreaCordY("hotRotatableAreaBottomRight", diffY);

            this.rotate(cacheR);
        }
        return y;
    }

    width(opt?: number | string): number {
        const cacheW = this.ownOptions.width || 0;
        const w = this.__valueHandler(opt, "width", 0, true);
        const diffW = w - cacheW;
        if (diffW !== 0) {
            const centerX = this.#getCenterX;
            const cacheR = this.rotate();
            this.rotate(0);
            if (this.cornerTopLeft().x > centerX) {
                this.#updateCordX("cornerTopLeft", diffW);
                this.#updateCordX("hotCornerTopLeft", diffW);
                this.#updateCordX("hotRotCornerTopLeft", diffW);
                this.#updateAreaCordX("hotResizableAreaTopLeft", diffW);
                this.#updateAreaCordX("hotRotatableAreaTopLeft", diffW);
            }
            if (this.cornerTopRight().x > centerX) {
                this.#updateCordX("cornerTopRight", diffW);
                this.#updateCordX("hotCornerTopRight", diffW);
                this.#updateCordX("hotRotCornerTopRight", diffW);
                this.#updateAreaCordX("hotResizableAreaTopRight", diffW);
                this.#updateAreaCordX("hotRotatableAreaTopRight", diffW);
            }
            if (this.cornerBottomLeft().x > centerX) {
                this.#updateCordX("cornerBottomLeft", diffW);
                this.#updateCordX("hotCornerBottomLeft", diffW);
                this.#updateCordX("hotRotCornerBottomLeft", diffW);
                this.#updateAreaCordX("hotResizableAreaBottomLeft", diffW);
                this.#updateAreaCordX("hotRotatableAreaBottomLeft", diffW);
            }
            if (this.cornerBottomRight().x > centerX) {
                this.#updateCordX("cornerBottomRight", diffW);
                this.#updateCordX("hotCornerBottomRight", diffW);
                this.#updateCordX("hotRotCornerBottomRight", diffW);
                this.#updateAreaCordX("hotResizableAreaBottomRight", diffW);
                this.#updateAreaCordX("hotRotatableAreaBottomRight", diffW);
            }

            if (
                this.cornerTopLeft().x > centerX ||
                this.cornerBottomLeft().x > centerX
            ) {
                this.hotResizableAreaBottom({
                    topLeft: {
                        x: this.hotResizableAreaBottom().topLeft.x + diffW,
                        y: this.hotResizableAreaBottom().topLeft.y,
                    },
                    bottomLeft: {
                        x: this.hotResizableAreaBottom().bottomLeft.x + diffW,
                        y: this.hotResizableAreaBottom().bottomLeft.y,
                    },
                    topRight: {
                        x: this.hotResizableAreaBottom().topRight.x,
                        y: this.hotResizableAreaBottom().topRight.y,
                    },
                    bottomRight: {
                        x: this.hotResizableAreaBottom().bottomRight.x,
                        y: this.hotResizableAreaBottom().bottomRight.y,
                    },
                });
                this.hotResizableAreaTop({
                    topLeft: {
                        x: this.hotResizableAreaTop().topLeft.x + diffW,
                        y: this.hotResizableAreaTop().topLeft.y,
                    },
                    bottomLeft: {
                        x: this.hotResizableAreaTop().bottomLeft.x + diffW,
                        y: this.hotResizableAreaTop().bottomLeft.y,
                    },
                    topRight: {
                        x: this.hotResizableAreaTop().topRight.x,
                        y: this.hotResizableAreaTop().topRight.y,
                    },
                    bottomRight: {
                        x: this.hotResizableAreaTop().bottomRight.x,
                        y: this.hotResizableAreaTop().bottomRight.y,
                    },
                });
                this.#updateAreaCordX("hotResizableAreaLeft", diffW);
            }

            if (
                this.cornerTopRight().x > centerX ||
                this.cornerBottomRight().x > centerX
            ) {
                this.hotResizableAreaBottom({
                    topLeft: {
                        x: this.hotResizableAreaBottom().topLeft.x,
                        y: this.hotResizableAreaBottom().topLeft.y,
                    },
                    bottomLeft: {
                        x: this.hotResizableAreaBottom().bottomLeft.x,
                        y: this.hotResizableAreaBottom().bottomLeft.y,
                    },
                    topRight: {
                        x: this.hotResizableAreaBottom().topRight.x + diffW,
                        y: this.hotResizableAreaBottom().topRight.y,
                    },
                    bottomRight: {
                        x: this.hotResizableAreaBottom().bottomRight.x + diffW,
                        y: this.hotResizableAreaBottom().bottomRight.y,
                    },
                });
                this.hotResizableAreaTop({
                    topLeft: {
                        x: this.hotResizableAreaTop().topLeft.x,
                        y: this.hotResizableAreaTop().topLeft.y,
                    },
                    bottomLeft: {
                        x: this.hotResizableAreaTop().bottomLeft.x,
                        y: this.hotResizableAreaTop().bottomLeft.y,
                    },
                    topRight: {
                        x: this.hotResizableAreaTop().topRight.x + diffW,
                        y: this.hotResizableAreaTop().topRight.y,
                    },
                    bottomRight: {
                        x: this.hotResizableAreaTop().bottomRight.x + diffW,
                        y: this.hotResizableAreaTop().bottomRight.y,
                    },
                });
                this.#updateAreaCordX("hotResizableAreaRight", diffW);
            }
            this.rotationCenterX(this.#getCenterX);
            this.rotate(cacheR);
        }
        return w;
    }

    height(opt?: number | string): number {
        const cacheH = this.ownOptions.height || 0;
        const h = this.__valueHandler(opt, "height", 0, false);
        const diffH = h - cacheH;
        if (diffH !== 0) {
            const centerY = this.#getCenterY;
            const cacheR = this.rotate();
            this.rotate(0);
            if (this.cornerTopLeft().y > centerY) {
                this.#updateCordY("cornerTopLeft", diffH);
                this.#updateCordY("hotCornerTopLeft", diffH);
                this.#updateCordY("hotRotCornerTopLeft", diffH);
                this.#updateAreaCordY("hotResizableAreaTopLeft", diffH);
                this.#updateAreaCordY("hotRotatableAreaTopLeft", diffH);
            }
            if (this.cornerTopRight().y > centerY) {
                this.#updateCordY("cornerTopRight", diffH);
                this.#updateCordY("hotCornerTopRight", diffH);
                this.#updateCordY("hotRotCornerTopRight", diffH);
                this.#updateAreaCordY("hotResizableAreaTopRight", diffH);
                this.#updateAreaCordY("hotRotatableAreaTopRight", diffH);
            }
            if (this.cornerBottomLeft().y > centerY) {
                this.#updateCordY("cornerBottomLeft", diffH);
                this.#updateCordY("hotCornerBottomLeft", diffH);
                this.#updateCordY("hotRotCornerBottomLeft", diffH);
                this.#updateAreaCordY("hotResizableAreaBottomLeft", diffH);
                this.#updateAreaCordY("hotRotatableAreaBottomLeft", diffH);
            }
            if (this.cornerBottomRight().y > centerY) {
                this.#updateCordY("cornerBottomRight", diffH);
                this.#updateCordY("hotCornerBottomRight", diffH);
                this.#updateCordY("hotRotCornerBottomRight", diffH);
                this.#updateAreaCordY("hotResizableAreaBottomRight", diffH);
                this.#updateAreaCordY("hotRotatableAreaBottomRight", diffH);
            }

            if (
                this.cornerTopLeft().y > centerY ||
                this.cornerTopRight().y > centerY
            ) {
                this.hotResizableAreaLeft({
                    topLeft: {
                        x: this.hotResizableAreaLeft().topLeft.x,
                        y: this.hotResizableAreaLeft().topLeft.y + diffH,
                    },
                    bottomLeft: {
                        x: this.hotResizableAreaLeft().bottomLeft.x,
                        y: this.hotResizableAreaLeft().bottomLeft.y,
                    },
                    topRight: {
                        x: this.hotResizableAreaLeft().topRight.x,
                        y: this.hotResizableAreaLeft().topRight.y + diffH,
                    },
                    bottomRight: {
                        x: this.hotResizableAreaLeft().bottomRight.x,
                        y: this.hotResizableAreaLeft().bottomRight.y,
                    },
                });
                this.hotResizableAreaRight({
                    topLeft: {
                        x: this.hotResizableAreaRight().topLeft.x,
                        y: this.hotResizableAreaRight().topLeft.y + diffH,
                    },
                    bottomLeft: {
                        x: this.hotResizableAreaRight().bottomLeft.x,
                        y: this.hotResizableAreaRight().bottomLeft.y,
                    },
                    topRight: {
                        x: this.hotResizableAreaRight().topRight.x,
                        y: this.hotResizableAreaRight().topRight.y + diffH,
                    },
                    bottomRight: {
                        x: this.hotResizableAreaRight().bottomRight.x,
                        y: this.hotResizableAreaRight().bottomRight.y,
                    },
                });
                this.#updateAreaCordY("hotResizableAreaTop", diffH);
            }

            if (
                this.cornerBottomLeft().y > centerY ||
                this.cornerBottomRight().y > centerY
            ) {
                this.hotResizableAreaLeft({
                    topLeft: {
                        x: this.hotResizableAreaLeft().topLeft.x,
                        y: this.hotResizableAreaLeft().topLeft.y,
                    },
                    bottomLeft: {
                        x: this.hotResizableAreaLeft().bottomLeft.x,
                        y: this.hotResizableAreaLeft().bottomLeft.y + diffH,
                    },
                    topRight: {
                        x: this.hotResizableAreaLeft().topRight.x,
                        y: this.hotResizableAreaLeft().topRight.y,
                    },
                    bottomRight: {
                        x: this.hotResizableAreaLeft().bottomRight.x,
                        y: this.hotResizableAreaLeft().bottomRight.y + diffH,
                    },
                });
                this.hotResizableAreaRight({
                    topLeft: {
                        x: this.hotResizableAreaRight().topLeft.x,
                        y: this.hotResizableAreaRight().topLeft.y,
                    },
                    bottomLeft: {
                        x: this.hotResizableAreaRight().bottomLeft.x,
                        y: this.hotResizableAreaRight().bottomLeft.y + diffH,
                    },
                    topRight: {
                        x: this.hotResizableAreaRight().topRight.x,
                        y: this.hotResizableAreaRight().topRight.y,
                    },
                    bottomRight: {
                        x: this.hotResizableAreaRight().bottomRight.x,
                        y: this.hotResizableAreaRight().bottomRight.y + diffH,
                    },
                });
                this.#updateAreaCordY("hotResizableAreaBottom", diffH);
            }
            this.rotationCenterY(this.#getCenterY);
            this.rotate(cacheR);
        }
        return h;
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
            this.ownOptions.width || 0,
            true
        );
    }
    maxHeight(opt?: number | string): number {
        return this.__valueHandler(
            opt,
            "maxHeight",
            this.ownOptions.height || 0,
            false
        );
    }
    position(opt?: Position) {
        // @TODO: z index has no effect on the static
        const pos = this.__valueHandler<Position, Position | undefined>(
            opt,
            "position",
            undefined
        );
        if (pos === "static") {
            if (
                !this.__runningEvents.drag &&
                !this.__runningEvents.resize &&
                !this.__runningEvents.rotate
            ) {
                if (this.top() !== undefined) this.y(this.top());
                else if (this.bottom() !== undefined)
                    this.y(
                        Math.abs(this.canvas?.height - this.#getRealHeight) -
                            this.bottom()!
                    );
                if (this.left() !== undefined) this.x(this.left());
                else if (this.right() !== undefined)
                    this.x(
                        Math.abs(this.canvas?.width - this.#getRealWidth) -
                            this.right()!
                    );
                this.rotationCenterX(this.#getCenterX);
                this.rotationCenterY(this.#getCenterY);
                this.rotate(0);
            }
        } else if (pos === "fixed") {
            if (this.top() !== undefined) this.y(this.top()!);
            else if (this.bottom() !== undefined)
                this.y(
                    Math.abs(this.canvas?.height - this.height()) -
                        this.bottom()!
                );
            if (this.left() !== undefined) this.x(+this.left()!);
            else if (this.right() !== undefined)
                this.x(
                    +Math.abs(this.canvas?.width - this.width()) - this.right()!
                );
        } else if (pos === "sticky") {
            if (this.top() !== undefined && this.#getTop.y <= this.top()!) {
                this.y(this.top());
            } else if (
                this.bottom() !== undefined &&
                this.#getBottom.y >= this.canvas?.height - this.bottom()!
            ) {
                this.y(
                    Math.abs(this.canvas?.height - this.#getRealHeight) -
                        this.bottom()!
                );
            }
            if (this.left() !== undefined && this.#getLeft.x <= this.left()!) {
                this.x(this.left());
            } else if (
                this.right() !== undefined &&
                this.#getRight.x >= this.canvas?.width - this.right()!
            ) {
                this.x(
                    Math.abs(this.canvas?.width - this.#getRealWidth) -
                        this.right()!
                );
            }
        } else if (pos === "absolute") {
            if (this.left() !== undefined)
                this.x(this.canvas?.__positionCords.x + this.left()!);
            else if (this.right() !== undefined)
                this.x(
                    this.canvas?.__positionCords.x +
                        Math.abs(this.canvas?.width - this.#getRealWidth) -
                        this.right()!
                );
            if (this.top() !== undefined) {
                this.y(this.canvas?.__positionCords.y + this.top());
            } else if (this.bottom() !== undefined)
                this.y(
                    this.canvas?.__positionCords.y +
                        Math.abs(this.canvas?.height - this.#getRealHeight) -
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
        return pos;
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

    cornerTopLeft(opt?: XY) {
        return this.__valueHandler(opt, "cornerTopLeft", { x: 0, y: 0 });
    }

    cornerTopRight(opt?: XY) {
        return this.__valueHandler(opt, "cornerTopRight", {
            x: 0,
            y: 0,
        });
    }

    cornerBottomLeft(opt?: XY) {
        return this.__valueHandler(opt, "cornerBottomLeft", {
            x: 0,
            y: 0,
        });
    }

    cornerBottomRight(opt?: XY) {
        return this.__valueHandler(opt, "cornerBottomRight", {
            x: 0,
            y: 0,
        });
    }

    hotCornerTopLeft(opt?: XY) {
        return this.__valueHandler(opt, "hotCornerTopLeft", {
            x: 0,
            y: 0,
        });
    }

    hotCornerTopRight(opt?: XY) {
        return this.__valueHandler(opt, "hotCornerTopRight", {
            x: 0,
            y: 0,
        });
    }

    hotCornerBottomLeft(opt?: XY) {
        return this.__valueHandler(opt, "hotCornerBottomLeft", {
            x: 0,
            y: 0,
        });
    }

    hotCornerBottomRight(opt?: XY) {
        return this.__valueHandler(opt, "hotCornerBottomRight", {
            x: 0,
            y: 0,
        });
    }

    hotRotCornerTopLeft(opt?: XY) {
        return this.__valueHandler(opt, "hotRotCornerTopLeft", {
            x: 0,
            y: 0,
        });
    }

    hotRotCornerTopRight(opt?: XY) {
        return this.__valueHandler(opt, "hotRotCornerTopRight", {
            x: 0,
            y: 0,
        });
    }

    hotRotCornerBottomLeft(opt?: XY) {
        return this.__valueHandler(opt, "hotRotCornerBottomLeft", {
            x: 0,
            y: 0,
        });
    }

    hotRotCornerBottomRight(opt?: XY) {
        return this.__valueHandler(opt, "hotRotCornerBottomRight", {
            x: 0,
            y: 0,
        });
    }

    hotRotatableAreaTopLeft(opt?: HotCornerArea) {
        return this.__valueHandler(opt, "hotRotatableAreaTopLeft", {
            topLeft: {
                x: 0,
                y: 0,
            },
            topRight: {
                x: 0,
                y: 0,
            },
            bottomLeft: {
                x: 0,
                y: 0,
            },
            bottomRight: {
                x: 0,
                y: 0,
            },
        });
    }

    hotRotatableAreaTopRight(opt?: HotCornerArea) {
        return this.__valueHandler(opt, "hotRotatableAreaTopRight", {
            topLeft: {
                x: 0,
                y: 0,
            },
            topRight: {
                x: 0,
                y: 0,
            },
            bottomLeft: {
                x: 0,
                y: 0,
            },
            bottomRight: {
                x: 0,
                y: 0,
            },
        });
    }

    hotRotatableAreaBottomLeft(opt?: HotCornerArea) {
        return this.__valueHandler(opt, "hotRotatableAreaBottomLeft", {
            topLeft: {
                x: 0,
                y: 0,
            },
            topRight: {
                x: 0,
                y: 0,
            },
            bottomLeft: {
                x: 0,
                y: 0,
            },
            bottomRight: {
                x: 0,
                y: 0,
            },
        });
    }

    hotRotatableAreaBottomRight(opt?: HotCornerArea) {
        return this.__valueHandler(opt, "hotRotatableAreaBottomRight", {
            topLeft: {
                x: 0,
                y: 0,
            },
            topRight: {
                x: 0,
                y: 0,
            },
            bottomLeft: {
                x: 0,
                y: 0,
            },
            bottomRight: {
                x: 0,
                y: 0,
            },
        });
    }

    hotResizableAreaTopLeft(opt?: HotCornerArea) {
        return this.__valueHandler(opt, "hotResizableAreaTopLeft", {
            topLeft: {
                x: 0,
                y: 0,
            },
            topRight: {
                x: 0,
                y: 0,
            },
            bottomLeft: {
                x: 0,
                y: 0,
            },
            bottomRight: {
                x: 0,
                y: 0,
            },
        });
    }

    hotResizableAreaTopRight(opt?: HotCornerArea) {
        return this.__valueHandler(opt, "hotResizableAreaTopRight", {
            topLeft: {
                x: 0,
                y: 0,
            },
            topRight: {
                x: 0,
                y: 0,
            },
            bottomLeft: {
                x: 0,
                y: 0,
            },
            bottomRight: {
                x: 0,
                y: 0,
            },
        });
    }

    hotResizableAreaBottomLeft(opt?: HotCornerArea) {
        return this.__valueHandler(opt, "hotResizableAreaBottomLeft", {
            topLeft: {
                x: 0,
                y: 0,
            },
            topRight: {
                x: 0,
                y: 0,
            },
            bottomLeft: {
                x: 0,
                y: 0,
            },
            bottomRight: {
                x: 0,
                y: 0,
            },
        });
    }

    hotResizableAreaBottomRight(opt?: HotCornerArea) {
        return this.__valueHandler(opt, "hotResizableAreaBottomRight", {
            topLeft: {
                x: 0,
                y: 0,
            },
            topRight: {
                x: 0,
                y: 0,
            },
            bottomLeft: {
                x: 0,
                y: 0,
            },
            bottomRight: {
                x: 0,
                y: 0,
            },
        });
    }

    hotResizableAreaTop(opt?: HotCornerArea) {
        return this.__valueHandler(opt, "hotResizableAreaTop", {
            topLeft: {
                x: 0,
                y: 0,
            },
            topRight: {
                x: 0,
                y: 0,
            },
            bottomLeft: {
                x: 0,
                y: 0,
            },
            bottomRight: {
                x: 0,
                y: 0,
            },
        });
    }

    hotResizableAreaBottom(opt?: HotCornerArea) {
        return this.__valueHandler(opt, "hotResizableAreaBottom", {
            topLeft: {
                x: 0,
                y: 0,
            },
            topRight: {
                x: 0,
                y: 0,
            },
            bottomLeft: {
                x: 0,
                y: 0,
            },
            bottomRight: {
                x: 0,
                y: 0,
            },
        });
    }

    hotResizableAreaLeft(opt?: HotCornerArea) {
        return this.__valueHandler(opt, "hotResizableAreaLeft", {
            topLeft: {
                x: 0,
                y: 0,
            },
            topRight: {
                x: 0,
                y: 0,
            },
            bottomLeft: {
                x: 0,
                y: 0,
            },
            bottomRight: {
                x: 0,
                y: 0,
            },
        });
    }

    hotResizableAreaRight(opt?: HotCornerArea) {
        return this.__valueHandler(opt, "hotResizableAreaRight", {
            topLeft: {
                x: 0,
                y: 0,
            },
            topRight: {
                x: 0,
                y: 0,
            },
            bottomLeft: {
                x: 0,
                y: 0,
            },
            bottomRight: {
                x: 0,
                y: 0,
            },
        });
    }

    hotTopFunc(opt?: (context: CanvasRenderingContext2D) => void) {
        return this.__valueHandler<typeof opt, typeof opt>(
            opt,
            "hotTopFunc",
            undefined
        );
    }
    hotLeftFunc(opt?: (context: CanvasRenderingContext2D) => void) {
        return this.__valueHandler<typeof opt, typeof opt>(
            opt,
            "hotLeftFunc",
            undefined
        );
    }
    hotRightFunc(opt?: (context: CanvasRenderingContext2D) => void) {
        return this.__valueHandler<typeof opt, typeof opt>(
            opt,
            "hotRightFunc",
            undefined
        );
    }
    hotBottomFunc(opt?: (context: CanvasRenderingContext2D) => void) {
        return this.__valueHandler<typeof opt, typeof opt>(
            opt,
            "hotBottomFunc",
            undefined
        );
    }
    hotCornerTopLeftFunc(opt?: (context: CanvasRenderingContext2D) => void) {
        return this.__valueHandler<typeof opt, typeof opt>(
            opt,
            "hotCornerTopLeftFunc",
            undefined
        );
    }
    hotCornerTopRightFunc(opt?: (context: CanvasRenderingContext2D) => void) {
        return this.__valueHandler<typeof opt, typeof opt>(
            opt,
            "hotCornerTopRightFunc",
            undefined
        );
    }
    hotCornerBottomLeftFunc(opt?: (context: CanvasRenderingContext2D) => void) {
        return this.__valueHandler<typeof opt, typeof opt>(
            opt,
            "hotCornerBottomLeftFunc",
            undefined
        );
    }
    hotCornerBottomRightFunc(
        opt?: (context: CanvasRenderingContext2D) => void
    ) {
        return this.__valueHandler<typeof opt, typeof opt>(
            opt,
            "hotCornerBottomRightFunc",
            undefined
        );
    }

    hotAreaSize(opt?: number) {
        return this.__valueHandler(opt, "hotAreaSize", 15);
    }

    rotationCenterX(opt?: number | string) {
        return this.__valueHandler(opt, "rotationCenterX", 0, true);
    }
    rotationCenterY(opt?: number | string) {
        return this.__valueHandler(opt, "rotationCenterY", 0, false);
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
        return this.__valueHandler(opt, "hotCornerStrokeColor", "blue");
    }
    hotCornerBackgroundColor(opt?: string) {
        return this.__valueHandler(opt, "hotCornerBackgroundColor", "white");
    }
    hotLineStrokeWidth(opt?: number) {
        return this.__valueHandler(opt, "hotTopStrokeWidth", 1.5);
    }
    hotLineStrokeColor(opt?: string) {
        return this.__valueHandler(opt, "hotTopStrokeColor", "blue");
    }
    hotAreaGap(opt?: number) {
        return this.__valueHandler(opt, "hotAreaGap", 0);
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

    set(options: IBlock<BlockOptions | T>): void {
        let before: any = {};
        let after: any = {};
        for (const [key, value] of Object.entries(options)) {
            const obj = getPrototype(this, key);
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
            this.canvas?.takeSnapshot(before, after);
            this.canvas?.invokeChange.call(this.canvas);
        }
    }
    scale(opt?: number) {
        const scale = this.__valueHandler(opt, "scale", 1);
        this.width(this.width() * scale);
        this.height(this.height() * scale);
    }
    bind(block: Block, ...options: (keyof BlockOptions)[]) {
        this.__bindOptions.push({ bindTo: block, options: options });
    }
    reset() {
        this.ownOptions = this.options;
    }
    rotate(opt?: number): number {
        const cacheRotate = this.ownOptions["rotate"] || 0;
        const rotate = this.__valueHandler(opt, "rotate", 0);
        const diffR = rotate - cacheRotate;
        if (diffR !== 0) {
            this.#updateCornerByRot(diffR);
        }
        return rotate;
    }

    #updateCornerByRot(radian: number) {
        this.#updateCornerbyRot("cornerTopLeft", radian);
        this.#updateCornerbyRot("cornerTopRight", radian);
        this.#updateCornerbyRot("cornerBottomLeft", radian);
        this.#updateCornerbyRot("cornerBottomRight", radian);

        this.#updateCornerbyRot("hotCornerTopLeft", radian);
        this.#updateCornerbyRot("hotCornerTopRight", radian);
        this.#updateCornerbyRot("hotCornerBottomLeft", radian);
        this.#updateCornerbyRot("hotCornerBottomRight", radian);

        this.#updateCornerbyRot("hotRotCornerTopLeft", radian);
        this.#updateCornerbyRot("hotRotCornerTopRight", radian);
        this.#updateCornerbyRot("hotRotCornerBottomLeft", radian);
        this.#updateCornerbyRot("hotRotCornerBottomRight", radian);

        this.#updateCornerAreabyRot("hotResizableAreaTopLeft", radian);
        this.#updateCornerAreabyRot("hotResizableAreaTopRight", radian);
        this.#updateCornerAreabyRot("hotResizableAreaBottomLeft", radian);
        this.#updateCornerAreabyRot("hotResizableAreaBottomRight", radian);
        this.#updateCornerAreabyRot("hotResizableAreaTop", radian);
        this.#updateCornerAreabyRot("hotResizableAreaRight", radian);
        this.#updateCornerAreabyRot("hotResizableAreaLeft", radian);
        this.#updateCornerAreabyRot("hotResizableAreaBottom", radian);

        this.#updateCornerAreabyRot("hotRotatableAreaTopLeft", radian);
        this.#updateCornerAreabyRot("hotRotatableAreaTopRight", radian);
        this.#updateCornerAreabyRot("hotRotatableAreaBottomLeft", radian);
        this.#updateCornerAreabyRot("hotRotatableAreaBottomRight", radian);
    }

    get #getTop() {
        return {
            x: Math.min(
                this.cornerTopLeft().x,
                this.cornerTopRight().x,
                this.cornerBottomLeft().x,
                this.cornerBottomRight().x
            ),
            y: Math.min(
                this.cornerTopLeft().y,
                this.cornerTopRight().y,
                this.cornerBottomLeft().y,
                this.cornerBottomRight().y
            ),
        };
    }

    get #getBottom() {
        return {
            x: Math.max(
                this.cornerTopLeft().x,
                this.cornerTopRight().x,
                this.cornerBottomLeft().x,
                this.cornerBottomRight().x
            ),
            y: Math.max(
                this.cornerTopLeft().y,
                this.cornerTopRight().y,
                this.cornerBottomLeft().y,
                this.cornerBottomRight().y
            ),
        };
    }

    get #getLeft() {
        return {
            x: Math.min(
                this.cornerTopLeft().x,
                this.cornerTopRight().x,
                this.cornerBottomLeft().x,
                this.cornerBottomRight().x
            ),
            y: Math.min(
                this.cornerTopLeft().y,
                this.cornerTopRight().y,
                this.cornerBottomLeft().y,
                this.cornerBottomRight().y
            ),
        };
    }

    get #getRight() {
        return {
            x: Math.max(
                this.cornerTopLeft().x,
                this.cornerTopRight().x,
                this.cornerBottomLeft().x,
                this.cornerBottomRight().x
            ),
            y: Math.max(
                this.cornerTopLeft().y,
                this.cornerTopRight().y,
                this.cornerBottomLeft().y,
                this.cornerBottomRight().y
            ),
        };
    }

    get #getRealWidth() {
        return this.#getRight.x - this.#getLeft.x;
    }
    get #getRealHeight() {
        return this.#getBottom.y - this.#getTop.y;
    }
    get #getCenterX() {
        return this.#getTop.x + this.#getRealWidth / 2;
    }
    get #getCenterY() {
        return this.#getTop.y + this.#getRealHeight / 2;
    }

    #updateCornerbyRot(corner: string, diffR: number) {
        const c = this.__rotateCorners(
            this.ownOptions[corner].x,
            this.ownOptions[corner].y,
            diffR
        );
        this.ownOptions[corner].x = c.x;
        this.ownOptions[corner].y = c.y;
    }

    #updateCornerAreabyRot(corner: string, diffR: number) {
        const a = this.__rotateCorners(
            this.ownOptions[corner].topLeft.x,
            this.ownOptions[corner].topLeft.y,
            diffR
        );
        const b = this.__rotateCorners(
            this.ownOptions[corner].topRight.x,
            this.ownOptions[corner].topRight.y,
            diffR
        );
        const c = this.__rotateCorners(
            this.ownOptions[corner].bottomLeft.x,
            this.ownOptions[corner].bottomLeft.y,
            diffR
        );
        const d = this.__rotateCorners(
            this.ownOptions[corner].bottomRight.x,
            this.ownOptions[corner].bottomRight.y,
            diffR
        );

        this.ownOptions[corner].topLeft = { x: a.x, y: a.y };
        this.ownOptions[corner].topRight = { x: b.x, y: b.y };
        this.ownOptions[corner].bottomLeft = { x: c.x, y: c.y };
        this.ownOptions[corner].bottomRight = { x: d.x, y: d.y };
    }

    #updateCordX(corner: string, x: number) {
        if (!this.ownOptions[corner]) return;
        this.ownOptions[corner].x = this.ownOptions[corner].x + x;
    }

    #updateAreaCordX(corner: string, x: number) {
        if (!this.ownOptions[corner]) return;
        this.ownOptions[corner].topLeft.x =
            this.ownOptions[corner].topLeft.x + x;
        this.ownOptions[corner].topRight.x =
            this.ownOptions[corner].topRight.x + x;
        this.ownOptions[corner].bottomLeft.x =
            this.ownOptions[corner].bottomLeft.x + x;
        this.ownOptions[corner].bottomRight.x =
            this.ownOptions[corner].bottomRight.x + x;
    }

    #updateCordY(corner: string, y: number) {
        if (!this.ownOptions[corner]) return;
        this.ownOptions[corner].y = this.ownOptions[corner].y + y;
    }

    #updateAreaCordY(corner: string, y: number) {
        if (!this.ownOptions[corner]) return;
        this.ownOptions[corner].topLeft.y =
            this.ownOptions[corner].topLeft.y + y;
        this.ownOptions[corner].topRight.y =
            this.ownOptions[corner].topRight.y + y;
        this.ownOptions[corner].bottomLeft.y =
            this.ownOptions[corner].bottomLeft.y + y;
        this.ownOptions[corner].bottomRight.y =
            this.ownOptions[corner].bottomRight.y + y;
    }

    __rotateCorners(x: number, y: number, radian: number) {
        return rotateCordinates(
            x,
            y,
            this.rotationCenterX(),
            this.rotationCenterY(),
            radian
        );
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
                    const obj = getPrototype(this, key);
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
        const topLeft = {
            x: this.cornerTopLeft().x,
            y: this.cornerTopLeft().y,
        };
        const topRight = {
            x: this.cornerTopRight().x,
            y: this.cornerTopRight().y,
        };
        const bottomLeft = {
            x: this.cornerBottomLeft().x,
            y: this.cornerBottomLeft().y,
        };
        const bottomRight = {
            x: this.cornerBottomRight().x,
            y: this.cornerBottomRight().y,
        };

        if (this.__isHorizontalFlipped) {
            topLeft.x = this.cornerTopRight().x;
            topLeft.y = this.cornerTopRight().y;
            topRight.x = this.cornerTopLeft().x;
            topRight.y = this.cornerTopLeft().y;

            bottomLeft.x = this.cornerBottomRight().x;
            bottomLeft.y = this.cornerBottomRight().y;
            bottomRight.x = this.cornerBottomLeft().x;
            bottomRight.y = this.cornerBottomLeft().y;
        }

        if (this.__isVerticalFlipped) {
            if (this.__isHorizontalFlipped) {
                topLeft.x = this.cornerBottomRight().x;
                topLeft.y = this.cornerBottomRight().y;
                topRight.x = this.cornerBottomLeft().x;
                topRight.y = this.cornerBottomLeft().y;

                bottomLeft.x = this.cornerTopRight().x;
                bottomLeft.y = this.cornerTopRight().y;
                bottomRight.x = this.cornerTopLeft().x;
                bottomRight.y = this.cornerTopLeft().y;
            } else {
                topLeft.x = this.cornerBottomLeft().x;
                topLeft.y = this.cornerBottomLeft().y;
                topRight.x = this.cornerBottomRight().x;
                topRight.y = this.cornerBottomRight().y;

                bottomLeft.x = this.cornerTopLeft().x;
                bottomLeft.y = this.cornerTopLeft().y;
                bottomRight.x = this.cornerTopRight().x;
                bottomRight.y = this.cornerTopRight().y;
            }
        }
        let inBound = checkInBound(
            x,
            y,
            topLeft.x,
            topLeft.y,
            topRight.x,
            topRight.y,
            bottomLeft.x,
            bottomLeft.y,
            bottomRight.x,
            bottomRight.y
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

    dblclick(_func: (event: MouseEvent) => void) {
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
        if (!selectable) return false;
        const click = (e: MouseEvent) => {
            const { x, y } = this.canvas?.getCursorPosition(e) || {
                x: 0,
                y: 0,
            };
            let inBound;
            if (this.__runningEvents.selected) {
                inBound = checkInBound(
                    x,
                    y,
                    this.hotCornerTopLeft().x,
                    this.hotCornerTopLeft().y,
                    this.hotCornerTopRight().x,
                    this.hotCornerTopRight().y,
                    this.hotCornerBottomLeft().x,
                    this.hotCornerBottomLeft().y,
                    this.hotCornerBottomRight().x,
                    this.hotCornerBottomRight().y
                );
                if (inBound) this.canvas?.takeRegister({ in: this.zIndex() });
                else this.canvas?.takeRegister({ out: this.zIndex() });
            } else inBound = this.checkInBound(e);

            if (inBound && this.canvas?.whoIsTheFirst(this.zIndex())) {
                this.__runningEvents.selected = true;
            } else this.__runningEvents.selected = false;
            this.canvas?.invokeChange(this);
        };
        this.#eventHandler("click", click);
        return selectable;
    }

    onRotate(opt?: (event: MouseEvent) => void) {
        const rotateE = this.__valueHandler<
            (event: MouseEvent) => void,
            ((event: MouseEvent) => void) | undefined
        >(opt, "onRotate", undefined);
        return (event: MouseEvent) => {
            rotateE?.(event);
        };
    }

    rotatable(opt?: boolean) {
        const rotatable = this.__valueHandler(opt, "rotatable", false);

        let topMove = false;
        let leftMove = false;
        const beforeValues: any = {};
        let inBound = false;

        const mousedown = (event: MouseEvent) => {
            if (this.__runningEvents.resize || this.__runningEvents.drag)
                return;
            if (inBound) {
                this.__runningEvents.rotate = true;
                beforeValues[this.nodeId!] = {
                    rotate: this.rotate(),
                };
                this.canvas?.takeRegister({ in: this.zIndex() });
            } else this.canvas?.takeRegister({ out: this.zIndex() });
        };

        const mousemove = (event: MouseEvent) => {
            if (
                !this.__runningEvents.selected ||
                this.__runningEvents.resize ||
                this.__runningEvents.drag
            )
                return;

            let { x, y } = this.canvas?.getCursorPosition(event);
            if (!this.__runningEvents.rotate) {
                let cursor: string | undefined = undefined;
                if (
                    checkInBound(
                        x,
                        y,
                        this.hotRotatableAreaTopLeft().topLeft.x,
                        this.hotRotatableAreaTopLeft().topLeft.y,
                        this.hotRotatableAreaTopLeft().topRight.x,
                        this.hotRotatableAreaTopLeft().topRight.y,
                        this.hotRotatableAreaTopLeft().bottomLeft.x,
                        this.hotRotatableAreaTopLeft().bottomLeft.y,
                        this.hotRotatableAreaTopLeft().bottomRight.x,
                        this.hotRotatableAreaTopLeft().bottomRight.y
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
                        this.hotRotatableAreaTopRight().topLeft.x,
                        this.hotRotatableAreaTopRight().topLeft.y,
                        this.hotRotatableAreaTopRight().topRight.x,
                        this.hotRotatableAreaTopRight().topRight.y,
                        this.hotRotatableAreaTopRight().bottomLeft.x,
                        this.hotRotatableAreaTopRight().bottomLeft.y,
                        this.hotRotatableAreaTopRight().bottomRight.x,
                        this.hotRotatableAreaTopRight().bottomRight.y
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
                        this.hotRotatableAreaBottomLeft().topLeft.x,
                        this.hotRotatableAreaBottomLeft().topLeft.y,
                        this.hotRotatableAreaBottomLeft().topRight.x,
                        this.hotRotatableAreaBottomLeft().topRight.y,
                        this.hotRotatableAreaBottomLeft().bottomLeft.x,
                        this.hotRotatableAreaBottomLeft().bottomLeft.y,
                        this.hotRotatableAreaBottomLeft().bottomRight.x,
                        this.hotRotatableAreaBottomLeft().bottomRight.y
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
                        this.hotRotatableAreaBottomRight().topLeft.x,
                        this.hotRotatableAreaBottomRight().topLeft.y,
                        this.hotRotatableAreaBottomRight().topRight.x,
                        this.hotRotatableAreaBottomRight().topRight.y,
                        this.hotRotatableAreaBottomRight().bottomLeft.x,
                        this.hotRotatableAreaBottomRight().bottomLeft.y,
                        this.hotRotatableAreaBottomRight().bottomRight.x,
                        this.hotRotatableAreaBottomRight().bottomRight.y
                    ) &&
                    this.rotationBottomRight()
                ) {
                    cursor = "cell";
                    topMove = false;
                    leftMove = false;
                }
                if (cursor) {
                    inBound = true;
                    this.#cursor = cursor;
                    this.canvas?.changeCursor(cursor);
                } else {
                    inBound = false;
                    if (
                        this.#cursor &&
                        ![
                            "ew-resize",
                            "ns-resize",
                            "nwse-resize",
                            "nesw-resize",
                        ].includes(this.#cursor)
                    ) {
                        this.#cursor = cursor;
                        this.canvas?.changeCursor(cursor);
                    }
                }
            }
            if (
                this.__runningEvents.rotate &&
                this.canvas?.whoIsTheFirst(this.zIndex())
            ) {
                let radian = Math.atan2(
                    y - this.rotationCenterY(),
                    x - this.rotationCenterX()
                );
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
                this.canvas?.invokeChange();
            }
        };

        const mouseup = () => {
            if (this.__runningEvents.rotate) {
                this.__runningEvents.rotate = false;
                this.canvas?.changeCursor("auto");
                inBound = false;
                const dummy: any = {};
                dummy[this.nodeId!] = { rotate: this.rotate() };
                this.canvas?.takeSnapshot(beforeValues, dummy);
            }
        };

        this.#eventHandler("mousedown", mousedown);
        this.#eventHandler("mousemove", mousemove);
        this.#eventHandler("mouseup", mouseup);

        return rotatable;
    }

    onResize(opt?: (event: MouseEvent) => void) {
        const resizeE = this.__valueHandler<
            (event: MouseEvent) => void,
            ((event: MouseEvent) => void) | undefined
        >(opt, "onResize", undefined);

        return (event: MouseEvent) => {
            resizeE?.(event);
        };
    }

    resizable(opt?: boolean): boolean {
        const resizable = this.__valueHandler(opt, "resizable", false);

        let initCords = { x: 0, y: 0 };
        let beforeCords = { x: 0, y: 0 };
        let beforeValues: any = {};

        let topResize = false;
        let leftResize = false;
        let widthResize = false;
        let heightResize = false;

        let inBound = false;
        const mousedown = (event: MouseEvent) => {
            if (this.__runningEvents.drag || this.__runningEvents.rotate)
                return;
            beforeCords = { x: 0, y: 0 };
            if (inBound) {
                initCords = this.canvas?.getCursorPosition(event);
                this.__runningEvents.resize = true;
                beforeValues[this.nodeId!] = {
                    cornerTopLeft: structuredClone(this.cornerTopLeft()),
                    cornerTopRight: structuredClone(this.cornerTopRight()),
                    cornerBottomLeft: structuredClone(this.cornerBottomLeft()),
                    cornerBottomRight: structuredClone(
                        this.cornerBottomRight()
                    ),

                    hotCornerTopLeft: structuredClone(this.hotCornerTopLeft()),
                    hotCornerTopRight: structuredClone(
                        this.hotCornerTopRight()
                    ),
                    hotCornerBottomLeft: structuredClone(
                        this.hotCornerBottomLeft()
                    ),
                    hotCornerBottomRight: structuredClone(
                        this.hotCornerBottomRight()
                    ),

                    hotRotCornerTopLeft: structuredClone(
                        this.hotRotCornerTopLeft()
                    ),
                    hotRotCornerTopRight: structuredClone(
                        this.hotRotCornerTopRight()
                    ),
                    hotRotCornerBottomLeft: structuredClone(
                        this.hotRotCornerBottomLeft()
                    ),
                    hotRotCornerBottomRight: structuredClone(
                        this.hotRotCornerBottomRight()
                    ),
                    hotRotatableAreaTopLeft: structuredClone(
                        this.hotRotatableAreaTopLeft()
                    ),
                    hotRotatableAreaTopRight: structuredClone(
                        this.hotRotatableAreaTopRight()
                    ),
                    hotRotatableAreaBottomLeft: structuredClone(
                        this.hotRotatableAreaBottomLeft()
                    ),
                    hotRotatableAreaBottomRight: structuredClone(
                        this.hotRotatableAreaBottomRight()
                    ),

                    hotResizableAreaTopLeft: structuredClone(
                        this.hotResizableAreaTopLeft()
                    ),
                    hotResizableAreaTopRight: structuredClone(
                        this.hotResizableAreaTopRight()
                    ),
                    hotResizableAreaBottomLeft: structuredClone(
                        this.hotResizableAreaBottomLeft()
                    ),
                    hotResizableAreaBottomRight: structuredClone(
                        this.hotResizableAreaBottomRight()
                    ),
                    hotResizableAreaTop: structuredClone(
                        this.hotResizableAreaTop()
                    ),
                    hotResizableAreaRight: structuredClone(
                        this.hotResizableAreaRight()
                    ),
                    hotResizableAreaLeft: structuredClone(
                        this.hotResizableAreaLeft()
                    ),
                    hotResizableAreaBottom: structuredClone(
                        this.hotResizableAreaBottom()
                    ),
                };
            }
        };

        const mousemove = (event: MouseEvent) => {
            if (
                !this.__runningEvents.selected ||
                this.__runningEvents.drag ||
                this.__runningEvents.rotate
            )
                return;

            const { x, y } = this.canvas?.getCursorPosition(event);
            if (!this.__runningEvents.resize) {
                let cursor: string | undefined = undefined;
                heightResize = widthResize = topResize = leftResize = false;
                if (
                    checkInBound(
                        x,
                        y,
                        this.hotResizableAreaLeft().topLeft.x,
                        this.hotResizableAreaLeft().topLeft.y,
                        this.hotResizableAreaLeft().topRight.x,
                        this.hotResizableAreaLeft().topRight.y,
                        this.hotResizableAreaLeft().bottomLeft.x,
                        this.hotResizableAreaLeft().bottomLeft.y,
                        this.hotResizableAreaLeft().bottomRight.x,
                        this.hotResizableAreaLeft().bottomRight.y
                    )
                ) {
                    leftResize = true;
                    widthResize = true;
                    cursor = "ew-resize";
                } else if (
                    checkInBound(
                        x,
                        y,
                        this.hotResizableAreaRight().topLeft.x,
                        this.hotResizableAreaRight().topLeft.y,
                        this.hotResizableAreaRight().topRight.x,
                        this.hotResizableAreaRight().topRight.y,
                        this.hotResizableAreaRight().bottomLeft.x,
                        this.hotResizableAreaRight().bottomLeft.y,
                        this.hotResizableAreaRight().bottomRight.x,
                        this.hotResizableAreaRight().bottomRight.y
                    )
                ) {
                    widthResize = true;
                    cursor = "ew-resize";
                } else if (
                    checkInBound(
                        x,
                        y,
                        this.hotResizableAreaTop().topLeft.x,
                        this.hotResizableAreaTop().topLeft.y,
                        this.hotResizableAreaTop().topRight.x,
                        this.hotResizableAreaTop().topRight.y,
                        this.hotResizableAreaTop().bottomLeft.x,
                        this.hotResizableAreaTop().bottomLeft.y,
                        this.hotResizableAreaTop().bottomRight.x,
                        this.hotResizableAreaTop().bottomRight.y
                    )
                ) {
                    topResize = true;
                    heightResize = true;
                    cursor = "ns-resize";
                } else if (
                    checkInBound(
                        x,
                        y,
                        this.hotResizableAreaBottom().topLeft.x,
                        this.hotResizableAreaBottom().topLeft.y,
                        this.hotResizableAreaBottom().topRight.x,
                        this.hotResizableAreaBottom().topRight.y,
                        this.hotResizableAreaBottom().bottomLeft.x,
                        this.hotResizableAreaBottom().bottomLeft.y,
                        this.hotResizableAreaBottom().bottomRight.x,
                        this.hotResizableAreaBottom().bottomRight.y
                    )
                ) {
                    cursor = "ns-resize";
                    heightResize = true;
                }

                if (
                    checkInBound(
                        x,
                        y,
                        this.hotResizableAreaTopLeft().topLeft.x,
                        this.hotResizableAreaTopLeft().topLeft.y,
                        this.hotResizableAreaTopLeft().topRight.x,
                        this.hotResizableAreaTopLeft().topRight.y,
                        this.hotResizableAreaTopLeft().bottomLeft.x,
                        this.hotResizableAreaTopLeft().bottomLeft.y,
                        this.hotResizableAreaTopLeft().bottomRight.x,
                        this.hotResizableAreaTopLeft().bottomRight.y
                    )
                ) {
                    topResize = true;
                    leftResize = true;
                    widthResize = true;
                    heightResize = true;
                    cursor = "nwse-resize";
                }
                if (
                    checkInBound(
                        x,
                        y,
                        this.hotResizableAreaTopRight().topLeft.x,
                        this.hotResizableAreaTopRight().topLeft.y,
                        this.hotResizableAreaTopRight().topRight.x,
                        this.hotResizableAreaTopRight().topRight.y,
                        this.hotResizableAreaTopRight().bottomLeft.x,
                        this.hotResizableAreaTopRight().bottomLeft.y,
                        this.hotResizableAreaTopRight().bottomRight.x,
                        this.hotResizableAreaTopRight().bottomRight.y
                    )
                ) {
                    topResize = true;
                    leftResize = false;
                    widthResize = true;
                    heightResize = true;
                    cursor = "nesw-resize";
                }
                if (
                    checkInBound(
                        x,
                        y,
                        this.hotResizableAreaBottomLeft().topLeft.x,
                        this.hotResizableAreaBottomLeft().topLeft.y,
                        this.hotResizableAreaBottomLeft().topRight.x,
                        this.hotResizableAreaBottomLeft().topRight.y,
                        this.hotResizableAreaBottomLeft().bottomLeft.x,
                        this.hotResizableAreaBottomLeft().bottomLeft.y,
                        this.hotResizableAreaBottomLeft().bottomRight.x,
                        this.hotResizableAreaBottomLeft().bottomRight.y
                    )
                ) {
                    topResize = false;
                    leftResize = true;
                    widthResize = true;
                    heightResize = true;
                    cursor = "nesw-resize";
                }
                if (
                    checkInBound(
                        x,
                        y,
                        this.hotResizableAreaBottomRight().topLeft.x,
                        this.hotResizableAreaBottomRight().topLeft.y,
                        this.hotResizableAreaBottomRight().topRight.x,
                        this.hotResizableAreaBottomRight().topRight.y,
                        this.hotResizableAreaBottomRight().bottomLeft.x,
                        this.hotResizableAreaBottomRight().bottomLeft.y,
                        this.hotResizableAreaBottomRight().bottomRight.x,
                        this.hotResizableAreaBottomRight().bottomRight.y
                    )
                ) {
                    topResize = false;
                    leftResize = false;
                    widthResize = true;
                    heightResize = true;
                    cursor = "nwse-resize";
                }
                if (cursor) {
                    inBound = true;
                    cursor = this.#chooseCursor(cursor);
                    this.#cursor = cursor;
                    this.canvas?.changeCursor(cursor);
                } else {
                    inBound = false;
                    if (this.#cursor !== "cell") {
                        this.#cursor = cursor;
                        this.canvas?.changeCursor(cursor);
                    }
                }
            }
            if (
                this.__runningEvents.resize &&
                this.canvas?.whoIsTheFirst(this.zIndex())
            ) {
                let diffX = x - initCords.x;
                let diffY = y - initCords.y;

                const cacheR = this.rotate();
                this.rotate(0);
                if (diffX !== 0 && widthResize) {
                    let diffW = diffX - beforeCords.x;
                    if (leftResize) {
                        this.#updateCordX("cornerTopLeft", diffW);
                        this.#updateCordX("hotCornerTopLeft", diffW);
                        this.#updateCordX("hotRotCornerTopLeft", diffW);
                        this.#updateAreaCordX("hotResizableAreaTopLeft", diffW);
                        this.#updateAreaCordX("hotRotatableAreaTopLeft", diffW);

                        this.#updateCordX("cornerBottomLeft", diffW);
                        this.#updateCordX("hotCornerBottomLeft", diffW);
                        this.#updateCordX("hotRotCornerBottomLeft", diffW);
                        this.#updateAreaCordX(
                            "hotResizableAreaBottomLeft",
                            diffW
                        );
                        this.#updateAreaCordX(
                            "hotRotatableAreaBottomLeft",
                            diffW
                        );

                        this.hotResizableAreaBottom({
                            topLeft: {
                                x:
                                    this.hotResizableAreaBottom().topLeft.x +
                                    diffW,
                                y: this.hotResizableAreaBottom().topLeft.y,
                            },
                            bottomLeft: {
                                x:
                                    this.hotResizableAreaBottom().bottomLeft.x +
                                    diffW,
                                y: this.hotResizableAreaBottom().bottomLeft.y,
                            },
                            topRight: {
                                x: this.hotResizableAreaBottom().topRight.x,
                                y: this.hotResizableAreaBottom().topRight.y,
                            },
                            bottomRight: {
                                x: this.hotResizableAreaBottom().bottomRight.x,
                                y: this.hotResizableAreaBottom().bottomRight.y,
                            },
                        });

                        this.hotResizableAreaTop({
                            topLeft: {
                                x: this.hotResizableAreaTop().topLeft.x + diffW,
                                y: this.hotResizableAreaTop().topLeft.y,
                            },
                            bottomLeft: {
                                x:
                                    this.hotResizableAreaTop().bottomLeft.x +
                                    diffW,
                                y: this.hotResizableAreaTop().bottomLeft.y,
                            },
                            topRight: {
                                x: this.hotResizableAreaTop().topRight.x,
                                y: this.hotResizableAreaTop().topRight.y,
                            },
                            bottomRight: {
                                x: this.hotResizableAreaTop().bottomRight.x,
                                y: this.hotResizableAreaTop().bottomRight.y,
                            },
                        });
                        this.#updateAreaCordX("hotResizableAreaLeft", diffW);
                    } else {
                        this.#updateCordX("cornerTopRight", diffW);
                        this.#updateCordX("hotCornerTopRight", diffW);
                        this.#updateCordX("hotRotCornerTopRight", diffW);
                        this.#updateAreaCordX(
                            "hotResizableAreaTopRight",
                            diffW
                        );
                        this.#updateAreaCordX(
                            "hotRotatableAreaTopRight",
                            diffW
                        );

                        this.#updateCordX("cornerBottomRight", diffW);
                        this.#updateCordX("hotCornerBottomRight", diffW);
                        this.#updateCordX("hotRotCornerBottomRight", diffW);
                        this.#updateAreaCordX(
                            "hotResizableAreaBottomRight",
                            diffW
                        );
                        this.#updateAreaCordX(
                            "hotRotatableAreaBottomRight",
                            diffW
                        );

                        this.hotResizableAreaBottom({
                            topLeft: {
                                x: this.hotResizableAreaBottom().topLeft.x,
                                y: this.hotResizableAreaBottom().topLeft.y,
                            },
                            bottomLeft: {
                                x: this.hotResizableAreaBottom().bottomLeft.x,
                                y: this.hotResizableAreaBottom().bottomLeft.y,
                            },
                            topRight: {
                                x:
                                    this.hotResizableAreaBottom().topRight.x +
                                    diffW,
                                y: this.hotResizableAreaBottom().topRight.y,
                            },
                            bottomRight: {
                                x:
                                    this.hotResizableAreaBottom().bottomRight
                                        .x + diffW,
                                y: this.hotResizableAreaBottom().bottomRight.y,
                            },
                        });
                        this.hotResizableAreaTop({
                            topLeft: {
                                x: this.hotResizableAreaTop().topLeft.x,
                                y: this.hotResizableAreaTop().topLeft.y,
                            },
                            bottomLeft: {
                                x: this.hotResizableAreaTop().bottomLeft.x,
                                y: this.hotResizableAreaTop().bottomLeft.y,
                            },
                            topRight: {
                                x:
                                    this.hotResizableAreaTop().topRight.x +
                                    diffW,
                                y: this.hotResizableAreaTop().topRight.y,
                            },
                            bottomRight: {
                                x:
                                    this.hotResizableAreaTop().bottomRight.x +
                                    diffW,
                                y: this.hotResizableAreaTop().bottomRight.y,
                            },
                        });
                        this.#updateAreaCordX("hotResizableAreaRight", diffW);
                    }
                    beforeCords.x = diffX;
                }
                if (diffY !== 0 && heightResize) {
                    let diffH = diffY - beforeCords.y;
                    if (topResize) {
                        this.#updateCordY("cornerTopLeft", diffH);
                        this.#updateCordY("hotCornerTopLeft", diffH);
                        this.#updateCordY("hotRotCornerTopLeft", diffH);
                        this.#updateAreaCordY("hotResizableAreaTopLeft", diffH);
                        this.#updateAreaCordY("hotRotatableAreaTopLeft", diffH);

                        this.#updateCordY("cornerTopRight", diffH);
                        this.#updateCordY("hotCornerTopRight", diffH);
                        this.#updateCordY("hotRotCornerTopRight", diffH);
                        this.#updateAreaCordY(
                            "hotResizableAreaTopRight",
                            diffH
                        );
                        this.#updateAreaCordY(
                            "hotRotatableAreaTopRight",
                            diffH
                        );

                        this.hotResizableAreaLeft({
                            topLeft: {
                                x: this.hotResizableAreaLeft().topLeft.x,
                                y:
                                    this.hotResizableAreaLeft().topLeft.y +
                                    diffH,
                            },
                            bottomLeft: {
                                x: this.hotResizableAreaLeft().bottomLeft.x,
                                y: this.hotResizableAreaLeft().bottomLeft.y,
                            },
                            topRight: {
                                x: this.hotResizableAreaLeft().topRight.x,
                                y:
                                    this.hotResizableAreaLeft().topRight.y +
                                    diffH,
                            },
                            bottomRight: {
                                x: this.hotResizableAreaLeft().bottomRight.x,
                                y: this.hotResizableAreaLeft().bottomRight.y,
                            },
                        });
                        this.hotResizableAreaRight({
                            topLeft: {
                                x: this.hotResizableAreaRight().topLeft.x,
                                y:
                                    this.hotResizableAreaRight().topLeft.y +
                                    diffH,
                            },
                            bottomLeft: {
                                x: this.hotResizableAreaRight().bottomLeft.x,
                                y: this.hotResizableAreaRight().bottomLeft.y,
                            },
                            topRight: {
                                x: this.hotResizableAreaRight().topRight.x,
                                y:
                                    this.hotResizableAreaRight().topRight.y +
                                    diffH,
                            },
                            bottomRight: {
                                x: this.hotResizableAreaRight().bottomRight.x,
                                y: this.hotResizableAreaRight().bottomRight.y,
                            },
                        });
                        this.#updateAreaCordY("hotResizableAreaTop", diffH);
                    } else {
                        this.#updateCordY("cornerBottomLeft", diffH);
                        this.#updateCordY("hotCornerBottomLeft", diffH);
                        this.#updateCordY("hotRotCornerBottomLeft", diffH);
                        this.#updateAreaCordY(
                            "hotResizableAreaBottomLeft",
                            diffH
                        );
                        this.#updateAreaCordY(
                            "hotRotatableAreaBottomLeft",
                            diffH
                        );

                        this.#updateCordY("cornerBottomRight", diffH);
                        this.#updateCordY("hotCornerBottomRight", diffH);
                        this.#updateCordY("hotRotCornerBottomRight", diffH);
                        this.#updateAreaCordY(
                            "hotResizableAreaBottomRight",
                            diffH
                        );
                        this.#updateAreaCordY(
                            "hotRotatableAreaBottomRight",
                            diffH
                        );

                        this.hotResizableAreaLeft({
                            topLeft: {
                                x: this.hotResizableAreaLeft().topLeft.x,
                                y: this.hotResizableAreaLeft().topLeft.y,
                            },
                            bottomLeft: {
                                x: this.hotResizableAreaLeft().bottomLeft.x,
                                y:
                                    this.hotResizableAreaLeft().bottomLeft.y +
                                    diffH,
                            },
                            topRight: {
                                x: this.hotResizableAreaLeft().topRight.x,
                                y: this.hotResizableAreaLeft().topRight.y,
                            },
                            bottomRight: {
                                x: this.hotResizableAreaLeft().bottomRight.x,
                                y:
                                    this.hotResizableAreaLeft().bottomRight.y +
                                    diffH,
                            },
                        });
                        this.hotResizableAreaRight({
                            topLeft: {
                                x: this.hotResizableAreaRight().topLeft.x,
                                y: this.hotResizableAreaRight().topLeft.y,
                            },
                            bottomLeft: {
                                x: this.hotResizableAreaRight().bottomLeft.x,
                                y:
                                    this.hotResizableAreaRight().bottomLeft.y +
                                    diffH,
                            },
                            topRight: {
                                x: this.hotResizableAreaRight().topRight.x,
                                y: this.hotResizableAreaRight().topRight.y,
                            },
                            bottomRight: {
                                x: this.hotResizableAreaRight().bottomRight.x,
                                y:
                                    this.hotResizableAreaRight().bottomRight.y +
                                    diffH,
                            },
                        });
                        this.#updateAreaCordY("hotResizableAreaBottom", diffH);
                    }
                    beforeCords.y = diffY;
                }
                this.rotate(cacheR);
                this.rotationCenterX(this.#getCenterX);
                this.rotationCenterY(this.#getCenterY);
                this.onResize()(event);
                this.canvas?.invokeChange();
            }
        };

        const mouseup = () => {
            if (this.__runningEvents.resize) {
                this.canvas?.changeCursor("auto");
                this.__runningEvents.resize = false;
                if (beforeCords.x !== 0 || beforeCords.y !== 0) {
                    const after: any = {};
                    after[this.nodeId!] = {
                        cornerTopLeft: this.cornerTopLeft(),
                        cornerTopRight: this.cornerTopRight(),
                        cornerBottomLeft: this.cornerBottomLeft(),
                        cornerBottomRight: this.cornerBottomRight(),
                        hotCornerTopLeft: this.hotCornerTopLeft(),
                        hotCornerTopRight: this.hotCornerTopRight(),
                        hotCornerBottomLeft: this.hotCornerBottomLeft(),
                        hotCornerBottomRight: this.hotCornerBottomRight(),
                        hotRotCornerTopLeft: this.hotRotCornerTopLeft(),
                        hotRotCornerTopRight: this.hotRotCornerTopRight(),
                        hotRotCornerBottomLeft: this.hotRotCornerBottomLeft(),
                        hotRotCornerBottomRight: this.hotRotCornerBottomRight(),
                        hotRotatableAreaTopLeft: this.hotRotatableAreaTopLeft(),
                        hotRotatableAreaTopRight:
                            this.hotRotatableAreaTopRight(),
                        hotRotatableAreaBottomLeft:
                            this.hotRotatableAreaBottomLeft(),
                        hotRotatableAreaBottomRight:
                            this.hotRotatableAreaBottomRight(),
                        hotResizableAreaTopLeft: this.hotResizableAreaTopLeft(),
                        hotResizableAreaTopRight:
                            this.hotResizableAreaTopRight(),
                        hotResizableAreaBottomLeft:
                            this.hotResizableAreaBottomLeft(),
                        hotResizableAreaBottomRight:
                            this.hotResizableAreaBottomRight(),
                        hotResizableAreaTop: this.hotResizableAreaTop(),
                        hotResizableAreaRight: this.hotResizableAreaRight(),
                        hotResizableAreaLeft: this.hotResizableAreaLeft(),
                        hotResizableAreaBottom: this.hotResizableAreaBottom(),
                    };
                    this.canvas?.takeSnapshot(beforeValues, after);
                }
            }
        };

        this.#eventHandler("mousedown", mousedown);
        this.#eventHandler("mousemove", mousemove);
        this.#eventHandler("mouseup", mouseup);
        return resizable;
    }

    #chooseCursor(defaultCursor: string) {
        const cursors: any = {
            "ew-resize": ["nwse-resize", "ns-resize", "nesw-resize"],
            "ns-resize": ["nesw-resize", "ew-resize", "nwse-resize"],
            "nesw-resize": ["ew-resize", "nwse-resize", "ns-resize"],
            "nwse-resize": ["ns-resize", "nesw-resize", "ew-resize"],
        };

        const angle = radianToDegree(
            Math.atan2(
                this.cornerTopRight().y +
                    Math.abs(
                        this.cornerTopRight().y - this.cornerBottomRight().y
                    ) /
                        2 -
                    this.rotationCenterY(),
                this.cornerTopRight().x - this.rotationCenterX()
            )
        );

        if (inRange(angle, -105, -20) || inRange(angle, 85, 125))
            return cursors[defaultCursor][2];
        else if (inRange(angle, -125, -105) || inRange(angle, 45, 85))
            return cursors[defaultCursor][1];
        else if (
            inRange(angle, -180, -125) ||
            inRange(angle, 145, 180) ||
            inRange(angle, 15, 45)
        )
            return cursors[defaultCursor][0];
        return defaultCursor;
    }

    onDrag(opt?: (event: MouseEvent) => void) {
        const dragE = this.__valueHandler<
            (event: MouseEvent) => void,
            ((event: MouseEvent) => void) | undefined
        >(opt, "onDrag", undefined);
        return (event: MouseEvent) => {
            dragE?.(event);
        };
    }

    draggable(opt?: boolean): boolean {
        const draggable = this.__valueHandler(opt, "draggable", false);

        let initCords = { x: 0, y: 0 };
        let beforeCords = { x: 0, y: 0 };
        let beforeValues: any = {};

        this.mousedown((event) => {
            if (this.__runningEvents.resize || this.__runningEvents.rotate)
                return;
            initCords = this.canvas?.getCursorPosition(event);
            beforeCords = { x: 0, y: 0 };
            beforeValues[this.nodeId!] = {
                x: this.x(),
                y: this.y(),
            };
            this.__runningEvents.drag = true;
        });

        const mousemove = (event: MouseEvent) => {
            if (
                this.__runningEvents.resize ||
                this.__runningEvents.rotate ||
                !this.__runningEvents.drag
            )
                return;
            if (this.canvas?.whoIsTheFirst(this.zIndex())) {
                const { x, y } = this.canvas?.getCursorPosition(event);
                let diffX = x - initCords.x;
                let diffY = y - initCords.y;
                if (diffX !== 0 && this.dragX()) {
                    const diff = diffX - beforeCords.x;
                    this.x(this.x() + diff);

                    beforeCords.x = diffX;
                }
                if (diffY !== 0 && this.dragY()) {
                    const diff = diffY - beforeCords.y;
                    this.y(this.y() + diff);

                    beforeCords.y = diffY;
                }
                this.onDrag()(event);
                this.canvas?.invokeChange();
            }
        };
        const mouseup = () => {
            if (this.__runningEvents.drag) {
                this.__runningEvents.drag = false;
                if (beforeCords.x !== 0 || beforeCords.y !== 0) {
                    const after: any = {};
                    after[this.nodeId!] = {
                        x: this.x(),
                        y: this.y(),
                    };
                    this.canvas?.takeSnapshot(beforeValues, after);
                    this.canvas?.invokeChange();
                }
            }
        };
        this.#eventHandler<MouseEvent>("mousemove", mousemove);
        this.#eventHandler<MouseEvent>("mouseup", mouseup);

        return draggable;
    }
}
