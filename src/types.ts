import { Shape } from "./Shape";
import { TextBlock } from "./TextBlock";
import { Rectangle } from "./shapes/index";
import { Node } from "./Tree";
import { Block } from "./Block";

// export type ShapeElements = Rectangle;

// Todo: need to impliment justify self, align-sef for each block, can be done with left, right, bottom top postiional values
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

// move these inside to Block
export interface BlockOptions {
    [key: string]: any;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
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
    clip?: boolean;
    fillRule?: string;
    zIndex?: number;
    draggable?: boolean;
    dragX?: boolean;
    dragY?: boolean;
    visible?: boolean;
    rotate?: number;
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
    resizable?: boolean;
    hidden?: boolean;
}
// extend margin as seperate margin top, left, bottom
export interface DefaultBlockOpt {
    [key: string]: any;
    x: number;
    y: number;
    width: number;
    height: number;
    selectable: boolean;
    zIndex: number;
}

export type IBlock<T> = T extends DefaultBlockOpt
    ? DefaultBlockOpt
    : BlockOptions & T;

export type BlockElements = Block | Shape | TextBlock;

type CanvasContext<T> = T extends CanvasRenderingContext2D
    ? CanvasRenderingContext2D
    : CanvasRenderingContext2D | null;

export interface CursorPos {
    x: number;
    y: number;
}

export type XY = [number, number];

export interface RectOpt extends CursorPos {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface RoundRectOpt extends RectOpt {
    // border-radius: [top-left, top-right, bottom-right, bottom-left]
    borderRadius: number[];
}

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

export interface IStyle {
    styleType: string;
    method: (args?: string) => void;
}

export type ICssProperties = {
    [key in keyof CSSStyleDeclaration]: CSSStyleDeclaration[key];
};

type Query = BlockOptions;

export type BorderStyle = "solid" | "dotted";

export interface InitialShapes {
    border?: string;
    borderLeft?: string;
    borderTop?: string;
    borderRight?: string;
    borderBottom?: string;
    // borderstyle can be extended for now just solid, dotted
    borderStyle?: BorderStyle;
    borderColor?: string;
    borderWidth?: number;
}
export interface GradientStops {
    stop: number;
    color: string;
}

export type RepeatOption = "repeat" | "repeat-x" | "repeat-y" | "no-repeat";

export type GradientType = "linear" | "conic" | "radial";
export type LineJoinOpt = "miter" | "round" | "bevel";
export type LineDashOffset = number;
export type LineDash = number[];
export type LineWidth = number;
export type LineCapOpt = "butt" | "round" | "square";
export type FillRule = "nonzero" | "evenodd";
export type strokeStyle = string;
export type FillStyle = string;
export type Fill = boolean;
export type Storke = boolean;
export interface QuadraticCurveToOpt {
    cpx1: number;
    cpy1: number;
    endX: number;
    endY: number;
}
export interface BezierCurveToOpt extends QuadraticCurveToOpt {
    cpx2: number;
    cpy2: number;
}

export interface PointInPath extends CursorPos {
    path?: Path2D;
    fillRule?: FillRule;
}
export interface PointInStroke extends CursorPos {
    path?: Path2D;
}
export type LinearEasing = (t: number) => number;
export type CubicBezier = (t: number, duration: number) => number;
export type StepsEasing = (t: number) => number;

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

export interface KeyFrame {
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

export type JumpPosition =
    | "jump-start"
    | "jump-end"
    | "jump-none"
    | "jump-both";
