export function unitConverter(opt: string) {}
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
