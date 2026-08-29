import type { IBlockOptions } from './Block'

export type RelativeType = number | string

export type ShortHandRelativeType =
    | [RelativeType, RelativeType, RelativeType, RelativeType]
    | [RelativeType, RelativeType, RelativeType]
    | [RelativeType, RelativeType]
    | [RelativeType]
    | RelativeType

export type BlockConstructor<T = {}> = new (...args: any[]) => T

export interface HotCornerArea {
    topLeft: XY
    topRight: XY
    bottomLeft: XY
    bottomRight: XY
}

export type ICssProperties = {
    [key in keyof CSSStyleDeclaration]?: CSSStyleDeclaration[key]
}

export type XY = { x: number; y: number }

export type RGBA = [number, number, number, number]

export type Timestamp = number

export interface SnapshotObject {
    [key: string]: IBlockOptions
}

export type SnapshotSize = number

export type LinearEasing = (t: number) => number
export type CubicBezier = (t: number, duration: number) => number
export type StepsEasing = (t: number) => number

export type JumpPosition = 'jump-start' | 'jump-end' | 'jump-none' | 'jump-both'
export type CustomEvent<E = Event> = (event: E & Event) => void

export type inOut = { in?: number; out?: number }

export type Animator = (timestamp: number) => void
