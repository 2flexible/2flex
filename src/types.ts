import { Shape } from "./Shape";
import { TextBlock } from "./TextBlock";
import { Rectangle, Star } from "./shapes/index";
import { Node } from "./Tree";
import { Block } from "./Block";

export type ShapeElements = Rectangle | Star;

// move these inside to Block
export interface BlockOptions {
    [key: string]: any;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    selectable?: boolean;
    backgroundColor?: string;
    color?: string;
    strokeWidth?: number;
    strokeColor?: string;
    lineWidth?: number;
    fill?: boolean;
    stroke?: boolean;
    padding?: string;
    margin?: string;
    clip?: boolean;
    draggable?: boolean;
}
// extend margin as seperate margin top, left, bottom

export type BlockElements = Block | Shape | TextBlock;

export type IBlock<T> = T extends BlockOptions
    ? BlockOptions
    : BlockOptions & T;

type CanvasContext<T> = T extends CanvasRenderingContext2D
    ? CanvasRenderingContext2D
    : CanvasRenderingContext2D | null;

export interface CursorPos {
    x: number;
    y: number;
}

type IMouseEvents =
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

export interface ICustomEvents {
    eventType: IMouseEvents;
    method: (event: MouseEvent, cursor: CursorPos) => void;
}

export interface IStyle {
    styleType: string;
    method: (args?: string) => void;
}

export type ICssProperties = {
    [key in keyof CSSStyleDeclaration]: CSSStyleDeclaration[key];
};

type Query = BlockOptions;
