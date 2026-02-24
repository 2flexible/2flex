import type { IBlockOptions } from "./Block";

export type IBlock<T> = IBlockOptions & T;

export type ICssProperties = {
    [key in keyof CSSStyleDeclaration]: CSSStyleDeclaration[key];
};

export type RGBA = [number, number, number, number];

export type Timestamp = number;

export type SnapshotObject = { nodeId: IBlockOptions };

export type LinearEasing = (t: number) => number;
export type CubicBezier = (t: number, duration: number) => number;
export type StepsEasing = (t: number) => number;

export type JumpPosition =
    | "jump-start"
    | "jump-end"
    | "jump-none"
    | "jump-both";
export type CustomEvent<E = Event> = (event: E & Event) => void;
