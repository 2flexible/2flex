import { Shape } from "./Shape";
import { TextBlock } from "./TextBlock";
import { Rect, Star } from "./shapes/index";
import { Node } from "./Tree";
import { Block } from "./Block";

export type ShapeElements = Rect | Star;

export interface BlockOptions {
    [key: string]: any;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    selectable?: boolean;
    backgroundColor?: string;
    color?: string;
    stroke?: string;
    lineWidth?: number;
    padding?: string;
    margin?: string;
    draggable?: boolean;
}

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
    | "mouseover";

export interface ICustomEvents {
    eventType: IMouseEvents;
    method: (event: MouseEvent, cursor: CursorPos) => void;
}

export interface IRemovedEvents {
    eventType: IMouseEvents;
    method: (_func: (event: MouseEvent) => void) => void;
}

export interface IStyle {
    styleType: string;
    method: (args?: string) => void;
}
export interface CanvasOptions {
    [key: string]: any;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    color?: string;
    stroke?: string;
    margin?: string;
}
