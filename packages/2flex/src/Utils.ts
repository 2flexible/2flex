import {
    CubicBezier,
    Easing,
    JumpPosition,
    LinearEasing,
    RelativeType,
    RGBA,
    ShortHandRelativeType,
    StepsEasing,
} from './types'
import { Node } from './Node'

export function fromPercentage(from: number, parentSize: number) {
    return (from * parentSize) / 100
}
export function fromVW(from: number, parentWidth: number) {
    return (from * parentWidth) / 100
}
export function fromVH(from: number, parentHeight: number) {
    return (from * parentHeight) / 100
}
export function fromRem(from: number, parentSize: number) {
    return from * parentSize
}
export function fromEm(from: number, parentSize: number) {
    return from * parentSize
}
export function fromCm(from: number) {
    return from * 37.8
}
export function fromMm(from: number) {
    return (fromCm(1) / 10) * from
}
export function fromQ(from: number) {
    return (fromCm(1) / 40) * from
}
export function fromIn(from: number) {
    return fromCm(2.54) * from
}
export function fromPc(from: number) {
    return (fromIn(1) / 6) * from
}
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

export function radianToDegree(radian: number): number {
    return (radian * 180) / Math.PI
}

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

export function lerp(start: number, end: number, t: number) {
    return start + (end - start) * t
}

export function linear(...args: number[]): LinearEasing {
    const nTimes = 1 / (args.length - 1)
    return (t: number) => {
        const stepB = Math.min(
            args.length - 1,
            Math.max(0, Math.floor(t / nTimes))
        )
        const x0 = stepB * nTimes
        const x1 = Math.min(1, (stepB + 1) * nTimes)
        const y0 = args[stepB]
        const y1 = args[Math.min(stepB + 1, args.length - 1)]
        const localT = x1 === x0 ? 0 : (t - x0) / (x1 - x0)
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

export function clamp(num: number, min: number, max: number) {
    return Math.min(Math.max(num, min), max)
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
export function hexToRgba(hex: string) {
    hex = hex.substring(1)
    let RR = hex.slice(0, 2) as any
    let GG = hex.slice(2, 4) as any
    let BB = hex.slice(4, 6) as any
    let AA = 1
    if (hex.length === 8) AA = parseInt(hex.slice(7, 9))
    if (hex.length === 2) {
        RR += RR
        GG += GG
        BB += BB
    }
    RR = parseInt(RR, 16)
    GG = parseInt(GG, 16)
    BB = parseInt(BB, 16)
    return rgbaRepresenter([RR, GG, BB])
}

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

export function colorToRgba(color: string) {
    return hexToRgba(namedColors[color])
}
export function rgbaRepresenter(rgba: number[]): string {
    return `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3] || 1})`
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
export function getPrototype(obj: any, key: string) {
    let proto = Object.getPrototypeOf(obj)
    if (!getOwnPrototype(proto, key)) {
        return getPrototypeInChain(
            Object.getPrototypeOf(obj.constructor.prototype),
            key
        )
    }
    return getOwnPrototype(proto, key)
}
export function getPrototypeInChain(proto: any, key: string) {
    if (!proto) return proto
    let p = getOwnPrototype(proto, key)
    if (p) return p
    else if (proto !== Node) {
        return getPrototypeInChain(Object.getPrototypeOf(proto), key)
    }
}
export function getOwnPrototype(proto: any, key: string) {
    return Object.getOwnPropertyDescriptor(proto, key)
}
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
    } else if (shortHandValue instanceof Array) {
        let shortHandList: (RelativeType | undefined)[] = []
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
