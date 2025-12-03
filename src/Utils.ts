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
    startX: number,
    startY: number,
    endX: number,
    endY: number
): boolean {
    if (
        pointX >= startX &&
        pointX <= endX &&
        pointY >= startY &&
        pointY <= endY
    ) {
        return true;
    }
    return false;
}
