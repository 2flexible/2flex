import type { BaseBlock, BaseBlockOptions } from './BaseBlock'

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
export type SnapshotData = { [key: string]: Object }
export type NodeId = number | undefined

export type XY = { x: number; y: number }

export type RGBA = [number, number, number, number]

export type Timestamp = number

export type LinearEasing = (t: number) => number
export type CubicBezier = (t: number, duration: number) => number
export type StepsEasing = (t: number) => number

export type JumpPosition = 'jump-start' | 'jump-end' | 'jump-none' | 'jump-both'
export type CustomEvent<E = Event> = (event: E & Event) => void

export type AnimationId = string
export type Animator = (timestamp: number) => void

export type Easing =
    | 'linear'
    | 'ease'
    | 'ease-in'
    | 'ease-out'
    | 'ease-in-out'
    | 'step-start'
    | 'step-end'
    | LinearEasing
    | CubicBezier
    | StepsEasing
export type Direction = 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
export type Composite = 'replace' | 'add' | 'accumulate'

export type ColorType = string & { __color?: never }
export type TextType = string & { __text?: never }

export type ResolvedAs<Raw, Resolved = Raw> = Raw & {
    readonly __resolvedAs?: Resolved
}

type IsMarked<T> = T extends unknown
    ? T extends { __color?: never }
        ? true
        : T extends { __text?: never }
          ? true
          : false
    : false

type ResolvedMember<T> = T extends unknown
    ? T extends string
      ? string extends T
          ? IsMarked<T> extends true
              ? T
              : number
          : T
      : T extends number
        ? number
        : T extends [infer A, infer B, infer C, infer D]
          ? A extends string
              ? string extends A
                  ? [number, number, number, number]
                  : never
              : never
          : T extends [infer A, infer B, infer C]
            ? A extends string
                ? string extends A
                    ? [number, number, number]
                    : never
                : never
            : T extends [infer A, infer B]
              ? A extends string
                  ? string extends A
                      ? [number, number]
                      : never
                  : never
              : T extends [infer A]
                ? A extends string
                    ? string extends A
                        ? [number]
                        : never
                    : never
                : T
        : never

type IsAny<T> = 0 extends 1 & T ? true : false

export type ResolvedValue<T> = T extends unknown
    ? IsAny<T> extends true
        ? any
        : T extends { readonly __resolvedAs?: infer R }
          ? R
          : ResolvedMember<T>
    : never

export type OptionAccessor<O, K extends keyof O> = {
    (): ResolvedValue<NonNullable<O[K]>>
    (
        value: undefined extends ResolvedValue<NonNullable<O[K]>>
            ? NonNullable<O[K]> | undefined
            : NonNullable<O[K]>
    ): ResolvedValue<NonNullable<O[K]>>
}

export type OptionAccessors<O> = {
    [K in keyof O]-?: OptionAccessor<O, K>
}

export type OwnOptionAccessors<O, Base> = {
    [K in Exclude<keyof O, keyof Base>]-?: OptionAccessor<O, K>
}

export type OptionAccessorsWith<O, OV> = Omit<O, keyof OV> & OV

export type BlockOptionsOf<B> =
    B extends BaseBlock<infer O> ? O : BaseBlockOptions


export interface ScrollableBlock extends BaseBlock {
    __overflowTranslateX(x: number): void
    __overflowTranslateY(y: number): void
    readonly __isOverflowXScrollable: boolean
    readonly __isOverflowYScrollable: boolean
}