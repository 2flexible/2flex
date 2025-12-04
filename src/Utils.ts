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
    const top = (pointX - px1) * (py2 - py1) - (pointY - py1) * (px2 - px1);
    const bottom = (pointX - px3) * (py4 - py3) - (pointY - py3) * (px4 - px3);
    const left = (pointX - px1) * (py3 - py1) - (pointY - py1) * (px3 - px1);
    const right = (pointX - px2) * (py4 - py2) - (pointY - py2) * (px4 - px2);
    if (top <= 0 && bottom >= 0 && left >= 0 && right <= 0) return true;
    return false;
}
