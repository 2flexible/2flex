import {
    CubicBezier,
    JumpPosition,
    LinearEasing,
    RGBA,
    StepsEasing,
} from "./types";

export function fromPercentage(from: number, parentS: number) {
    return (from * parentS) / 100;
}
export function fromVW(from: number, canvasW: number) {
    return (from * canvasW) / 100;
}
export function fromVH(from: number, canvasH: number) {
    return (from * canvasH) / 100;
}
//  root size shoold be cavnas fonts size via styleing or options passing value
export function fromRem(from: number, parentS: number) {
    return from * parentS;
}
export function fromEm(from: number, parentS: number) {
    return from * parentS;
}
export function fromCm(from: number) {
    return from * 2.54;
}
export function fromMm(from: number) {
    return fromCm(from) * 10;
}
export function fromQ(from: number) {
    return fromCm(from) * 40;
}
export function fromIn(from: number) {
    return fromCm(from) * 2.54;
}
export function fromPc(from: number) {
    return fromIn(from) * 6;
}
export function fromPt(from: number) {
    return fromIn(from) * 72;
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
        return true;
    return false;
}

export function radianToDegree(rad: number): number {
    return (rad * 180) / Math.PI;
}

export function degreeToRadian(rad: number): number {
    return (rad * Math.PI) / 180;
}

export function rotateCordinates(
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
    };
}

// This is based on `WebCore/platform/graphics/UnitBezier.h` in WebKit.
export function cubicBezier(
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
        ay = 1 - cy - by;
    function sampleCurveX(t: number) {
        return ((ax * t + bx) * t + cx) * t;
    }

    function solveCurveX(x: number, epsilon: number) {
        let t0, t1, t2, x2, d2, i;
        for (t2 = x, i = 0; i < 8; i++) {
            x2 = sampleCurveX(t2) - x;
            if (Math.abs(x2) < epsilon) {
                return t2;
            }
            d2 = (3 * ax * t2 + 2 * bx) * t2 + cx;
            if (Math.abs(d2) < 1e-6) {
                break;
            }
            t2 = t2 - x2 / d2;
        }
        t0 = 0;
        t1 = 1;
        t2 = x;
        if (t2 < t0) {
            return t0;
        }
        if (t2 > t1) {
            return t1;
        }
        while (t0 < t1) {
            x2 = sampleCurveX(t2);
            if (Math.abs(x2 - x) < epsilon) {
                return t2;
            }
            if (x > x2) {
                t0 = t2;
            } else {
                t1 = t2;
            }
            t2 = (t1 - t0) / 2 + t0;
        }
        return t2;
    }

    return (x: number, duration: number) => {
        let t = solveCurveX(x, duration);
        return ((ay * t + by) * t + cy) * t;
    };
}

export function lerp(start: number, end: number, t: number) {
    return start + (end - start) * t;
}

export function linear(...args: number[]): LinearEasing {
    const nTimes = 1 / (args.length - 1);
    return (t: number) => {
        const step = Math.ceil(t / nTimes);
        const stepB = Math.floor(t / nTimes);

        let x0 = stepB * nTimes;
        let x1 = step * nTimes;
        let y0 = args[stepB];
        let y1 = args[stepB + 1];

        if (typeof args[stepB] == "string") {
            const indicator = (args[stepB] as any).split(" ");
            y0 = Number(indicator[0]);
            x0 = Number(indicator[1].split("%")[0]) / 100;
            if (indicator[2]) x0 = Number(indicator[2].split("%")[0]) / 100;
        }

        if (typeof args[stepB + 1] == "string") {
            const indicator = (args[stepB + 1] as any).split(" ");
            y1 = Number(indicator[0]);
            x1 = Number(indicator[1].split("%")[0]) / 100;
            if (indicator[3]) x1 = Number(indicator[3].split("%")[0]) / 100;
        }

        const x = x0 + t * (x1 - x0);
        const y = y0 + x * (y1 - y0);
        return y;
    };
}

export function steps(step: number, position: JumpPosition): StepsEasing {
    const x = 1 / step;
    return (t: number) => {
        const stepness = Math.ceil(t / x);
        return x * t + x * stepness;
    };
}
export const namedColors: { [key: string]: string } = {
    black: "#000000",
    silver: "#c0c0c0",
    gray: "#808080",
    white: "#ffffff",
    maroon: "#800000",
    red: "#ff0000",
    purple: "#800080",
    fuchsia: "#ff00ff",
    green: "#008000",
    lime: "#00ff00",
    olive: "#808000",
    yellow: "#ffff00",
    navy: "#000080",
    blue: "#0000ff",
    teal: "#008080",
    aqua: "#00ffff",
};
export function hexToRgba(hex: string): RGBA {
    hex = hex.substring(1);
    let RR = hex.slice(0, 2) as any;
    let GG = hex.slice(2, 4) as any;
    let BB = hex.slice(4, 6) as any;
    let AA = 1;
    if (hex.length === 8) AA = parseInt(hex.slice(7, 9));
    if (hex.length === 2) {
        RR += RR;
        GG += GG;
        BB += BB;
    }
    RR = parseInt(RR, 16);
    GG = parseInt(GG, 16);
    BB = parseInt(BB, 16);
    return [RR, GG, BB, AA];
}

export function hslToRgba() {}

export function colorToRgba(color: string): RGBA {
    return hexToRgba(namedColors[color]);
}
export function rgbaRepresenter(rgba: string): string {
    return `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3] || 1})`;
}
export function getProperty(obj: any, key: string) {
    return Object.getOwnPropertyDescriptor(Object.getPrototypeOf(obj), key);
}
export function inRange(value:number, great:number, less:number){
    return value >= great && value <= less
}