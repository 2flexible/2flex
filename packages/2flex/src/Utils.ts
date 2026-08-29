import {
    CubicBezier,
    JumpPosition,
    LinearEasing,
    RelativeType,
    RGBA,
    ShortHandRelativeType,
    StepsEasing,
} from './types'
import { Node } from './Node'
import { Easing } from './AnimationBlock'

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

// This is based on `WebCore/platform/graphics/UnitBezier.h` in WebKit.
export function bezierEasing(
    p1x: number,
    p1y: number,
    p2x: number,
    p2y: number
): CubicBezier {
    const cx = 3 * p1x,
        bx = 3 * (p2x - p1x) - cx,
        ax = 1 - cx - bx,
        cy = 3 * p1y,
        by = 3 * (p2y - p1y) - cy,
        ay = 1 - cy - by
    function sampleCurveX(t: number) {
        return ((ax * t + bx) * t + cx) * t
    }

    function solveCurveX(x: number, epsilon: number) {
        let t0, t1, t2, x2, d2, i
        for (t2 = x, i = 0; i < 8; i++) {
            x2 = sampleCurveX(t2) - x
            if (Math.abs(x2) < epsilon) {
                return t2
            }
            d2 = (3 * ax * t2 + 2 * bx) * t2 + cx
            if (Math.abs(d2) < 1e-6) {
                break
            }
            t2 = t2 - x2 / d2
        }
        t0 = 0
        t1 = 1
        t2 = x
        if (t2 < t0) {
            return t0
        }
        if (t2 > t1) {
            return t1
        }
        while (t0 < t1) {
            x2 = sampleCurveX(t2)
            if (Math.abs(x2 - x) < epsilon) {
                return t2
            }
            if (x > x2) {
                t0 = t2
            } else {
                t1 = t2
            }
            t2 = (t1 - t0) / 2 + t0
        }
        return t2
    }

    return (x: number, duration: number) => {
        let t = solveCurveX(x, duration)
        return ((ay * t + by) * t + cy) * t
    }
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
        const step = Math.ceil(t / nTimes)
        const stepB = Math.floor(t / nTimes)

        let x0 = stepB * nTimes
        let x1 = step * nTimes
        let y0 = args[stepB]
        let y1 = args[stepB + 1]

        if (typeof args[stepB] == 'string') {
            const indicator = (args[stepB] as any).split(' ')
            y0 = Number(indicator[0])
            x0 = Number(indicator[1].split('%')[0]) / 100
            if (indicator[2]) x0 = Number(indicator[2].split('%')[0]) / 100
        }

        if (typeof args[stepB + 1] == 'string') {
            const indicator = (args[stepB + 1] as any).split(' ')
            y1 = Number(indicator[0])
            x1 = Number(indicator[1].split('%')[0]) / 100
            if (indicator[3]) x1 = Number(indicator[3].split('%')[0]) / 100
        }

        const x = x0 + t * (x1 - x0)
        const y = y0 + x * (y1 - y0)
        return y
    }
}

export function steps(step: number, position: JumpPosition): StepsEasing {
    const x = 1 / step
    return (t: number) => {
        const stepness = Math.ceil(t / x)
        return x * t + x * stepness
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

export function easingParser(
    easing: Easing
): (t: number, duration: number) => number {
    if (easing === 'linear') return linear(0, 1)
    else if (easing == 'step-start') return steps(1, 'jump-start')
    else if (easing == 'step-end') return steps(1, 'jump-end')
    else if (easing == 'ease') return bezierEasing(0.25, 0.1, 0.25, 1)
    else if (easing == 'ease-in') return bezierEasing(0.42, 0, 1, 1)
    else if (easing == 'ease-out') return bezierEasing(0, 0, 0.58, 1)
    else if (easing == 'ease-in-out') return bezierEasing(0.42, 0, 0.58, 1)
    else return easing
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
