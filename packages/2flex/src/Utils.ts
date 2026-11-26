import { type BaseBlock, type BaseBlockOptions } from './BaseBlock'
import {
    type BlockOptionsOf,
    type CubicBezier,
    type Easing,
    type JumpPosition,
    type LinearEasing,
    type OwnOptionAccessors,
    type RGBA,
    type ShortHandRelativeType,
    type StepsEasing,
} from './types'
import { RelativeType } from './types'
import { Node } from './Node'

/**
 * Converts a percentage into pixels.
 *
 * @param from - The percentage.
 * @param parentSize - The size of the parent the percentage is related to.
 */
export function fromPercentage(from: number, parentSize: number) {
    return (from * parentSize) / 100
}
/**
 * Converts a percentage of the width of the viewport into pixels.
 *
 * @param from - The percentage.
 * @param parentWidth - The width of the viewport.
 */
export function fromVW(from: number, parentWidth: number) {
    return (from * parentWidth) / 100
}
/**
 * Converts a percentage of the height of the viewport into pixels.
 *
 * @param from - The percentage.
 * @param parentHeight - The height of the viewport.
 */
export function fromVH(from: number, parentHeight: number) {
    return (from * parentHeight) / 100
}
/**
 * Converts a value of the root font size into pixels.
 *
 * @param from - The value.
 * @param parentSize - The size of the root font.
 */
export function fromRem(from: number, parentSize: number) {
    return from * parentSize
}
/**
 * Converts a value of the font size into pixels.
 *
 * @param from - The value.
 * @param parentSize - The size of the font.
 */
export function fromEm(from: number, parentSize: number) {
    return from * parentSize
}
/**
 * Converts a value of centimeters into pixels.
 *
 * @param from - The value in centimeters.
 */
export function fromCm(from: number) {
    return from * 37.8
}
/**
 * Converts a value of millimeters into pixels.
 *
 * @param from - The value in millimeters.
 */
export function fromMm(from: number) {
    return (fromCm(1) / 10) * from
}
/**
 * Converts a value of quarter centimeters into pixels.
 *
 * @param from - The value in quarter centimeters.
 */
export function fromQ(from: number) {
    return (fromCm(1) / 40) * from
}
/**
 * Converts a value of inches into pixels.
 *
 * @param from - The value in inches.
 */
export function fromIn(from: number) {
    return fromCm(2.54) * from
}
/**
 * Converts a value of picas into pixels.
 *
 * @param from - The value in picas.
 */
export function fromPc(from: number) {
    return (fromIn(1) / 6) * from
}
/**
 * Converts a value of points into pixels.
 *
 * @param from - The value in points.
 */
export function fromPt(from: number) {
    return (fromIn(1) / 72) * from
}

export function xIntersect(
    box1: { left: number; right: number },
    box2: { left: number; right: number }
) {
    return Math.max(
        0,
        Math.min(box1.right, box2.right) - Math.max(box1.left, box2.left)
    )
}
export function yIntersect(
    box1: { top: number; bottom: number },
    box2: { top: number; bottom: number }
) {
    return Math.max(
        0,
        Math.min(box1.bottom, box2.bottom) - Math.max(box1.top, box2.top)
    )
}

export function checkInBound(
    pointX: number,
    pointY: number,
    px1: number,
    py1: number,
    px2: number,
    py2: number,
    px3: number,
    py3: number,
    px4: number,
    py4: number
): boolean {
    if (
        // top
        (pointX - px1) * (py2 - py1) - (pointY - py1) * (px2 - px1) <= 0 &&
        // bottom
        (pointX - px3) * (py4 - py3) - (pointY - py3) * (px4 - px3) >= 0 &&
        // left
        (pointX - px1) * (py3 - py1) - (pointY - py1) * (px3 - px1) >= 0 &&
        // right
        (pointX - px2) * (py4 - py2) - (pointY - py2) * (px4 - px2) <= 0
    )
        return true
    return false
}

/**
 * Converts an angle in radians into degrees.
 *
 * @param radian - The angle in radians.
 */
export function radianToDegree(radian: number): number {
    return (radian * 180) / Math.PI
}

/**
 * Converts an angle in degrees into radians.
 *
 * @param degree - The angle in degrees.
 */
export function degreeToRadian(degree: number): number {
    return (degree * Math.PI) / 180
}

export function rotateCordinatesByRadian(
    x: number,
    y: number,
    centerX: number,
    centerY: number,
    radian: number
) {
    return {
        x:
            (x - centerX) * Math.cos(radian) -
            (y - centerY) * Math.sin(radian) +
            centerX,
        y:
            (x - centerX) * Math.sin(radian) +
            (y - centerY) * Math.cos(radian) +
            centerY,
    }
}

/**
 * Cubic Bezier solver adapted from https://github.com/gre/bezier-easing
 * (c) 2014 Gaëtan Renaudeau
 */
const { cbrt, sqrt, PI } = Math

export function bezierEasing(
    mX1: number,
    mY1: number,
    mX2: number,
    mY2: number
): CubicBezier {
    if (mX1 === mY1 && mX2 === mY2) {
        return ((x: number) => x) as CubicBezier
    }

    const a = 6 * (3 * mX1 - 3 * mX2 + 1)
    const b = 6 * (mX2 - 2 * mX1)
    const c = 3 * mX1
    const a2 = a * a
    const b2 = b * b
    const d = b / a
    const e = (3 * b * c) / a2 - (b2 * b) / (a2 * a)
    const w1 = (2 * c) / a - b2 / a2
    const w = w1 * w1 * w1
    const o = 3 / a
    const ay = 3 * mY1 - 3 * mY2 + 1
    const by = mY2 - 2 * mY1
    const cy = 3 * mY1

    return ((x: number) => {
        if (x === 0 || x === 1) return x
        let t: number
        if (a) {
            const q = e + o * x
            const s = q * q + w
            if (s > 0) {
                const root = sqrt(s)
                t = cbrt(q + root) + cbrt(q - root) - d
            } else {
                const l = cbrt(sqrt(-w))
                const angle = q ? Math.atan(sqrt(-s) / q) : -PI / 2
                let phi: number
                if (o < 0) {
                    phi = (q > 0 ? 2 * PI : PI) - angle
                } else if (d < 0) {
                    phi = (q > 0 ? 2 * PI : -3 * PI) + angle
                } else {
                    phi = (q > 0 ? 0 : PI) + angle
                }
                t = 2 * l * Math.cos(phi / 3) - d
            }
        } else {
            t = x
        }
        return ((ay * t + 3 * by) * t + cy) * t
    }) as CubicBezier
}

export function cubicBezier(
    p0: number,
    p1: number,
    p2: number,
    p3: number,
    t: number
) {
    return (
        p0 * (1 - t) ** 3 +
        3 * p1 * t * (1 - t) ** 2 +
        3 * p2 * (1 - t) * t ** 2 +
        p3 * t ** 3
    )
}

/**
 * Calculates the value between two numbers.
 *
 * @param start - The number the calculation starts at.
 * @param end - The number the calculation ends at.
 * @param t - The position between the two numbers, from `0` to `1`.
 */
export function lerp(start: number, end: number, t: number) {
    return start + (end - start) * t
}

export function linear(...args: number[]): LinearEasing {
    const nTimes = 1 / (args.length - 1)
    return (t: number) => {
        const c = Math.min(1, Math.max(0, t))
        const stepB = Math.min(
            args.length - 1,
            Math.max(0, Math.floor(c / nTimes))
        )
        const x0 = stepB * nTimes
        const x1 = Math.min(1, (stepB + 1) * nTimes)
        const y0 = args[stepB]
        const y1 = args[Math.min(stepB + 1, args.length - 1)]
        const localT = x1 === x0 ? 0 : (c - x0) / (x1 - x0)
        return y0 + localT * (y1 - y0)
    }
}

export function steps(step: number, position: JumpPosition): StepsEasing {
    return (t: number) => {
        const c = Math.min(1, Math.max(0, t))
        switch (position) {
            case 'jump-start':
                return Math.min(1, (Math.floor(c * step) + 1) / step)
            case 'jump-end':
                return Math.floor(c * step) / step
            case 'jump-none':
                if (step <= 1) return c >= 1 ? 1 : 0
                return Math.min(1, Math.floor(c * step) / (step - 1))
            case 'jump-both':
                return (Math.floor(c * step) + 1) / (step + 1)
        }
    }
}

/**
 * Keeps a number between two limits.
 *
 * @param num - The number that is kept between the limits.
 * @param min - The smallest number the result can be.
 * @param max - The biggest number the result can be.
 */
export function clamp(num: number, min: number, max: number) {
    return Math.min(Math.max(num, min), max)
}

/**
 * Keeps the size of a block at a value that can be drawn.
 *
 * @param value - The size that is kept.
 */
export function clampSize(value: number) {
    if (value > 0) return clamp(value, 1, 4096)
    if (value < 0) return clamp(value, -4096, -1)
    return 0
}

export const namedColors: { [key: string]: string } = {
    black: '#000000',
    silver: '#c0c0c0',
    gray: '#808080',
    white: '#ffffff',
    maroon: '#800000',
    red: '#ff0000',
    purple: '#800080',
    fuchsia: '#ff00ff',
    green: '#008000',
    lime: '#00ff00',
    olive: '#808000',
    yellow: '#ffff00',
    navy: '#000080',
    blue: '#0000ff',
    teal: '#008080',
    aqua: '#00ffff',
}
/**
 * Converts a hexadecimal color into a color with an alpha channel.
 *
 * @param hex - The color, for example `#ff0000`.
 */
export function hexToRgba(hex: string) {
    let value = hex.startsWith('#') ? hex.substring(1) : hex
    // the shorthand form repeats every digit, so `#f00` becomes `#ff0000` and
    // `#f008` becomes `#ff000088`, which then can be read as a regular one
    if (value.length === 3 || value.length === 4) {
        value = value
            .split('')
            .map((char) => char + char)
            .join('')
    }
    const R = parseInt(value.slice(0, 2), 16)
    const G = parseInt(value.slice(2, 4), 16)
    const B = parseInt(value.slice(4, 6), 16)
    const A =
        value.length >= 8
            ? Math.round((parseInt(value.slice(6, 8), 16) / 255) * 100) / 100
            : 1
    return rgbaRepresenter([R, G, B, A])
}

/**
 * Converts a color of the hsl space into a color with an alpha channel.
 *
 * @param hsl - The color, for example `hsl(0, 100%, 50%)`.
 */
export function hslToRgba(hsl: string): string {
    const colors = hsl.match(/-?\d+\.?\d*/g) || []
    const H = (((Number(colors[0]) || 0) % 360) + 360) % 360 // Normalize hue to 0-359
    const S = Math.min(1, Math.max(0, (Number(colors[1]) || 0) / 100))
    const L = Math.min(1, Math.max(0, (Number(colors[2]) || 0) / 100))
    const A = colors[3] !== undefined ? Number(colors[3]) : 1

    if (S === 0) {
        const val = Math.round(L * 255)
        return rgbaRepresenter([val, val, val, A])
    }

    const C = (1 - Math.abs(2 * L - 1)) * S
    const Hd = H / 60
    const X = C * (1 - Math.abs((Hd % 2) - 1))

    let r = 0,
        g = 0,
        b = 0

    if (0 <= Hd && Hd < 1) {
        r = C
        g = X
        b = 0
    } else if (1 <= Hd && Hd < 2) {
        r = X
        g = C
        b = 0
    } else if (2 <= Hd && Hd < 3) {
        r = 0
        g = C
        b = X
    } else if (3 <= Hd && Hd < 4) {
        r = 0
        g = X
        b = C
    } else if (4 <= Hd && Hd < 5) {
        r = X
        g = 0
        b = C
    } else if (5 <= Hd && Hd <= 6) {
        r = C
        g = 0
        b = X
    }

    const m = L - C / 2
    const R = Math.round((r + m) * 255)
    const G = Math.round((g + m) * 255)
    const B = Math.round((b + m) * 255)

    return rgbaRepresenter([R, G, B, A])
}

/**
 * Converts a color into a color with an alpha channel.
 *
 * The color can be written as a hexadecimal value or in the hsl space.
 *
 * @param color - The color that is converted.
 */
export function colorToRgba(color: string) {
    return hexToRgba(namedColors[color])
}
export function rgbaRepresenter(rgba: number[]): string {
    return `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${
        rgba[3] === undefined ? 1 : rgba[3]
    })`
}
export function rgbaToArray(rgba: string): RGBA {
    const colors = rgba.match(/\d+\.?\d*/g) || []
    let R = 0
    let G = 0
    let B = 0
    let A = 1
    if (colors[0]) R = Number(colors[0])
    if (colors[1]) G = Number(colors[1])
    if (colors[2]) B = Number(colors[2])
    if (colors[3]) A = Number(colors[3])
    return [R, G, B, A]
}
export function getPrototype(
    obj: object,
    key: string
): PropertyDescriptor | null | undefined {
    const proto = Object.getPrototypeOf(obj)
    if (!getOwnPrototype(proto, key)) {
        return getPrototypeInChain(
            Object.getPrototypeOf(obj.constructor.prototype),
            key
        )
    }
    return getOwnPrototype(proto, key)
}
export function getPrototypeInChain(
    proto: object | null,
    key: string
): PropertyDescriptor | null | undefined {
    if (!proto) return proto
    const p = getOwnPrototype(proto, key)
    if (p) return p
    else if (proto !== Node) {
        return getPrototypeInChain(Object.getPrototypeOf(proto), key)
    }
}
export function getOwnPrototype(
    proto: object,
    key: string
): PropertyDescriptor | undefined {
    return Object.getOwnPropertyDescriptor(proto, key)
}
/**
 * Tells whether a number is between two limits.
 *
 * @param value - The number that is checked.
 * @param great - The smallest number the result can be.
 * @param less - The biggest number the result can be.
 */
export function inRange(value: number, great: number, less: number) {
    return value >= great && value <= less
}

export function easingParser(easing: Easing): (t: number) => number {
    if (easing === 'linear') return linear(0, 1)
    if (easing === 'step-start') return steps(1, 'jump-start')
    if (easing === 'step-end') return steps(1, 'jump-end')
    if (easing === 'ease') {
        const b = bezierEasing(0.25, 0.1, 0.25, 1)
        return (t: number) => b(t, 1e-6)
    }
    if (easing === 'ease-in') {
        const b = bezierEasing(0.42, 0, 1, 1)
        return (t: number) => b(t, 1e-6)
    }
    if (easing === 'ease-out') {
        const b = bezierEasing(0, 0, 0.58, 1)
        return (t: number) => b(t, 1e-6)
    }
    if (easing === 'ease-in-out') {
        const b = bezierEasing(0.42, 0, 0.58, 1)
        return (t: number) => b(t, 1e-6)
    }
    return easing as (t: number) => number
}

export function shortHandParser(shortHandValue: ShortHandRelativeType) {
    if (typeof shortHandValue === 'number') {
        return [shortHandValue, shortHandValue, shortHandValue, shortHandValue]
    } else if (typeof shortHandValue === 'string') {
        if (!/\d/.test(shortHandValue)) return shortHandValue
        const parts = shortHandValue.trim().split(/\s+/)
        switch (parts.length) {
            case 1:
                return [parts[0], parts[0], parts[0], parts[0]]
            case 2:
                return [parts[0], parts[1], parts[0], parts[1]]
            case 3:
                return [parts[0], parts[1], parts[2], parts[1]]
            default:
                return [parts[0], parts[1], parts[2], parts[3]]
        }
    } else if (shortHandValue instanceof Array) {
        switch (shortHandValue.length) {
            case 1:
                return [
                    shortHandValue[0],
                    shortHandValue[0],
                    shortHandValue[0],
                    shortHandValue[0],
                ]
            case 2:
                return [
                    shortHandValue[0],
                    shortHandValue[1],
                    shortHandValue[0],
                    shortHandValue[1],
                ]
            case 3:
                return [
                    shortHandValue[0],
                    shortHandValue[1],
                    shortHandValue[2],
                    shortHandValue[1],
                ]
        }
    }
    return shortHandValue
}

export function preOrderTraversal<T extends Node>(
    head: T,
    func: (node: T) => void
) {
    if (!head) return
    func(head)
    for (const child of head.childNodes) {
        preOrderTraversal(child as T, func)
    }
}
export function postOrderTraversal<T extends Node>(
    head: T,
    func: (node: T) => void
) {
    if (!head) return
    for (const child of head.childNodes) {
        postOrderTraversal(child as T, func)
    }
    func(head)
}

export function reversePostOrderTraversal<T extends Node>(
    head: T,
    func: (node: T) => void
) {
    if (!head) return
    func(head)
    const childs = [...head.childNodes]
    for (let i = childs.length - 1; i >= 0; i--) {
        reversePostOrderTraversal(childs[i] as T, func)
    }
}
export function worldTileKey(worldCol: number, worldRow: number): string {
    return `${worldCol},${worldRow}`
}

export function stationaryPoints(
    p0: number,
    p1: number,
    p2: number,
    p3: number
) {
    const a = 3 * (-p0 + 3 * p1 - 3 * p2 + p3)
    const b = 6 * (p0 - 2 * p1 + p2)
    const c = 3 * (p1 - p0)

    const points = []
    const D = Math.pow(b, 2) - 4 * a * c
    if (D === 0) {
        const t = -b / (2 * a)
        if (t >= 0 && t <= 1) points.push(t)
    } else if (D > 0) {
        const base = Math.sqrt(D)
        const t1 = (-b + base) / (2 * a)
        const t2 = (-b - base) / (2 * a)
        if (t1 >= 0 && t1 <= 1) points.push(t1)
        if (t2 >= 0 && t2 <= 1) points.push(t2)
    }
    return points.map((i) => {
        return cubicBezier(p0, p1, p2, p3, i)
    })
}

/**
 * Adds the typed option accessors and the method `set` to a block class.
 *
 * @returns A function that takes the class and returns it with the accessors.
 */
export function extendBlock<TOptions extends BaseBlockOptions>() {
    return <TBase extends abstract new (...args: never[]) => BaseBlock>(
        BaseClass: TBase
    ) =>
        BaseClass as unknown as (new (
            options: TOptions
        ) => InstanceType<TBase> & {
            set(options: TOptions): void
        } & OwnOptionAccessors<TOptions, BlockOptionsOf<InstanceType<TBase>>>) &
            Omit<TBase, 'prototype'>
}

export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function invalidArgument(
    method: string,
    field: string,
    expected: string,
    value: unknown
): never {
    let received: string = typeof value
    if (value === null) received = 'null'
    else if (Array.isArray(value)) received = 'an array'
    else if (typeof value === 'number' || typeof value === 'boolean')
        received = String(value)
    else if (typeof value === 'string')
        received = JSON.stringify(
            value.length > 60 ? value.slice(0, 60) + '…' : value
        )
    throw new TypeError(
        `[2flex] ${method} expected ${expected} at ${field}, but received ${received}.`
    )
}

export function requireRecord(method: string, field: string, value: unknown) {
    if (!isRecord(value)) invalidArgument(method, field, 'an object', value)
}

export function requireCallback(method: string, field: string, value: unknown) {
    if (typeof value !== 'function')
        invalidArgument(method, field, 'a function', value)
}

const relativeValuePattern =
    /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?(?:px|%|rem|em|vh|vw|cm|mm|q|in|pc|pt)?$/i

export function isRelativeValue(value: unknown) {
    // Non-finite numbers are handled by the existing block geometry fallbacks.
    return (
        typeof value === 'number' ||
        (typeof value === 'string' && relativeValuePattern.test(value.trim()))
    )
}

const relativeOptions = new Set([
    'x',
    'y',
    'width',
    'height',
    'minWidth',
    'minHeight',
    'maxWidth',
    'maxHeight',
    'scale',
    'top',
    'bottom',
    'left',
    'right',
    'rotate',
    'marginTop',
    'marginRight',
    'marginBottom',
    'marginLeft',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'rotationCenterX',
    'rotationCenterY',
    'flexBasis',
    'gapRow',
    'gapColumn',
])

const enumOptions = new Map<string, string[]>([
    ['layout', ['flex', 'inline-flex', 'grid', 'inline-grid']],
    ['flexDirection', ['row', 'row-reverse', 'column', 'column-reverse']],
    ['flexWrap', ['nowrap', 'wrap', 'wrap-reverse']],
    ['overflow', ['visible', 'hidden', 'scroll', 'auto']],
    ['objectFit', ['contain', 'cover', 'fill', 'scale-down']],
    ['wrap', ['letter', 'word', 'nowrap']],
    ['position', ['relative', 'absolute', 'sticky', 'fixed']],
    ['rotationCenter', ['self', 'parent']],
])

export function validateBlockOption(
    method: string,
    field: string,
    key: string,
    value: unknown,
    blockClass: typeof BaseBlock
) {
    if (value === undefined) return
    if (relativeOptions.has(key)) {
        if (
            !isRelativeValue(value) &&
            !(key === 'flexBasis' && value === 'auto')
        )
            invalidArgument(
                method,
                field,
                key === 'flexBasis'
                    ? 'a number, length, or "auto"'
                    : 'a number or supported length',
                value
            )
        return
    }

    const accepted = enumOptions.get(key)
    if (accepted) {
        if (typeof value !== 'string' || !accepted.includes(value))
            invalidArgument(
                method,
                field,
                accepted.map((item) => JSON.stringify(item)).join(' or '),
                value
            )
        return
    }

    switch (key) {
        case 'flexFlow':
            if (
                !Array.isArray(value) ||
                value.length !== 2 ||
                value[0] === undefined ||
                value[1] === undefined
            )
                invalidArgument(
                    method,
                    field,
                    'a [flexDirection, flexWrap] pair',
                    value
                )
            validateBlockOption(
                method,
                field + '[0]',
                'flexDirection',
                value[0],
                blockClass
            )
            validateBlockOption(
                method,
                field + '[1]',
                'flexWrap',
                value[1],
                blockClass
            )
            break
        case 'gap':
            if (
                !isRelativeValue(value) &&
                (!Array.isArray(value) ||
                    value.length !== 2 ||
                    !value.every(isRelativeValue))
            )
                invalidArgument(
                    method,
                    field,
                    'a length or a pair of lengths',
                    value
                )
            break
        case 'drawFunc':
        case 'onEditable':
        case 'onRender':
            requireCallback(method, field, value)
            break
        case 'text':
        case 'name':
            if (typeof value !== 'string')
                invalidArgument(method, field, 'a string', value)
            break
        case 'horizontalFlip':
        case 'verticalFlip':
        case 'hidden':
        case 'editable':
        case 'imageSmoothingEnabled':
            if (typeof value !== 'boolean')
                invalidArgument(method, field, 'a boolean', value)
            break
        case 'order':
        case 'flexGrow':
        case 'flexShrink':
            if (typeof value !== 'number')
                invalidArgument(method, field, 'a number', value)
            break
        case 'controlPoints':
            if (!Array.isArray(value) || !value.every(isRecord))
                invalidArgument(
                    method,
                    field,
                    'an array of control point objects',
                    value
                )
            break
        case 'cornerTopLeft':
        case 'cornerTopRight':
        case 'cornerBottomLeft':
        case 'cornerBottomRight':
            if (
                !isRecord(value) ||
                typeof value.x !== 'number' ||
                typeof value.y !== 'number'
            )
                invalidArgument(
                    method,
                    field,
                    'a point with numeric x and y',
                    value
                )
            break
        case 'margin':
        case 'padding': {
            const parts =
                typeof value === 'string' ? value.trim().split(/\s+/) : value
            if (
                typeof value !== 'number' &&
                (!Array.isArray(parts) ||
                    parts.length < 1 ||
                    parts.length > 4 ||
                    !parts.every(isRelativeValue))
            )
                invalidArgument(
                    method,
                    field,
                    'one to four numbers or supported lengths',
                    value
                )
            break
        }
        case 'dependencies':
            if (
                !Array.isArray(value) ||
                !value.every((block) => block instanceof blockClass)
            )
                invalidArgument(method, field, 'an array of BaseBlocks', value)
            break
        case 'important':
            if (!isRecord(value))
                invalidArgument(method, field, 'an object', value)
            for (const [option, override] of Object.entries(value)) {
                if (option !== 'important')
                    validateBlockOption(
                        method,
                        field + '.' + option,
                        option,
                        override,
                        blockClass
                    )
            }
            break
    }
}

export function validateCanvasSettings(
    method: string,
    path: string,
    canvasId: unknown,
    width: unknown,
    height: unknown,
    options: unknown
) {
    if (typeof canvasId !== 'string' || !canvasId.trim())
        invalidArgument(
            method,
            path + 'canvasId',
            'a nonempty string',
            canvasId
        )
    for (const [field, value] of Object.entries({ width, height })) {
        if (typeof value !== 'number' || !Number.isFinite(value) || value < 0)
            invalidArgument(
                method,
                path + field,
                'a finite nonnegative number',
                value
            )
    }
    if (typeof document === 'undefined')
        throw new Error(`[2flex] ${method} requires a browser document.`)
    const element = document.getElementById(canvasId)
    if (element && !(element instanceof HTMLCanvasElement))
        throw new TypeError(
            `[2flex] ${method} expected a <canvas> for ${path}canvasId "${canvasId}", but found <${element.localName}>.`
        )

    if (options === undefined) return
    if (!isRecord(options))
        invalidArgument(method, path + 'options', 'an object', options)
    for (const [key, value] of Object.entries(options)) {
        if (value === undefined) continue
        const field = path + 'options.' + key
        switch (key) {
            case 'zoomSpeed':
            case 'zoomInvSpeed':
            case 'positionZ':
            case 'fps':
            case 'tileSize':
            case 'maxQuality':
                if (
                    typeof value !== 'number' ||
                    !Number.isFinite(value) ||
                    value <= 0
                )
                    invalidArgument(
                        method,
                        field,
                        'a finite positive number',
                        value
                    )
                break
            case 'qualitySettleDelay':
                if (
                    typeof value !== 'number' ||
                    !Number.isFinite(value) ||
                    value < 0
                )
                    invalidArgument(
                        method,
                        field,
                        'a finite nonnegative number',
                        value
                    )
                break
            case 'positionX':
            case 'positionY':
            case 'moveSpeed':
                if (typeof value !== 'number' || !Number.isFinite(value))
                    invalidArgument(method, field, 'a finite number', value)
                break
            case 'historySize':
                if (
                    typeof value !== 'number' ||
                    !Number.isInteger(value) ||
                    value < 0
                )
                    invalidArgument(
                        method,
                        field,
                        'a nonnegative integer',
                        value
                    )
                break
            case 'history':
            case 'keyboardMovement':
            case 'mouseMovement':
                if (typeof value !== 'boolean')
                    invalidArgument(method, field, 'a boolean', value)
                break
            case 'zoomType':
                if (value !== 'center' && value !== 'point')
                    invalidArgument(method, field, '"center" or "point"', value)
                break
        }
    }
}

export function validateBlockArguments(
    method: string,
    blocks: readonly unknown[],
    blockClass: typeof BaseBlock
) {
    for (const [index, block] of blocks.entries()) {
        if (!(block instanceof blockClass))
            invalidArgument(
                method,
                `argument ${index + 1}`,
                'a BaseBlock',
                block
            )
    }
}

export function validateLoadBlocks(
    value: unknown,
    path: string,
    ids: Set<number>
) {
    const method = 'Canvas.load()'
    if (!Array.isArray(value))
        invalidArgument(method, path, 'an array of blocks', value)
    for (const [index, block] of value.entries()) {
        const field = `${path}[${index}]`
        if (!isRecord(block))
            invalidArgument(method, field, 'a block object', block)
        if (typeof block.name !== 'string' || !block.name.trim())
            invalidArgument(
                method,
                field + '.name',
                'a nonempty string',
                block.name
            )
        if (block.nodeId !== undefined) {
            if (
                typeof block.nodeId !== 'number' ||
                !Number.isInteger(block.nodeId)
            )
                invalidArgument(
                    method,
                    field + '.nodeId',
                    'an integer',
                    block.nodeId
                )
            if (ids.has(block.nodeId))
                throw new TypeError(
                    `[2flex] ${method} found duplicate nodeId ${block.nodeId} at ${field}.nodeId.`
                )
            ids.add(block.nodeId)
        }
        if (block.options !== undefined)
            requireRecord(method, field + '.options', block.options)
        if (block.cacheOptions !== undefined)
            requireRecord(method, field + '.cacheOptions', block.cacheOptions)
        validateLoadBlocks(block.childs, field + '.childs', ids)
    }
}

export function validateBlockConstructors(
    blocks: readonly unknown[],
    blockClass: typeof BaseBlock
) {
    for (const [index, block] of blocks.entries()) {
        if (
            block !== blockClass &&
            !(
                typeof block === 'function' &&
                block.prototype instanceof blockClass
            )
        )
            invalidArgument(
                'Canvas.registerBlocks()',
                `argument ${index + 1}`,
                'a BaseBlock class',
                block
            )
    }
}
