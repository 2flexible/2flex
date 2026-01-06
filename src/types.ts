import type { BlockOptions } from "./Block";

export type IBlock<T> = BlockOptions & T;

export type ICssProperties = {
    [key in keyof CSSStyleDeclaration]: CSSStyleDeclaration[key];
};

export type RGBA = [number, number, number, number];

export type Timestamp = number;

export type SnapshotObject = { nodeId: BlockOptions };

export type LinearEasing = (t: number) => number;
export type CubicBezier = (t: number, duration: number) => number;
export type StepsEasing = (t: number) => number;

export type JumpPosition =
    | "jump-start"
    | "jump-end"
    | "jump-none"
    | "jump-both";


type valueB<T> = T extends number ? number : string
