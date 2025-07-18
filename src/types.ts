import { Shape } from "./Shape";
import { TextBlock } from "./TextBlock";
import { Rect, Star } from "./shapes";
import { Node } from "./Tree";
import { Block } from ".";

export type ShapeElements = Rect | Star;

export interface BlockOptions {
    x: number;
    y: number;
    width?: number;
    height?: number;
    backgroundColor?: string;
    color?: string;
    stroke?: string;
    lineWidth?: number;
}

export type BlockElements = Block<BlockOptions> | Shape | TextBlock;

export type IBlock<T> = T extends BlockOptions
    ? BlockOptions
    : BlockOptions & T;
