import {
    Shape,
    QuadraticCurveToOpt,
    BezierCurveToOpt,
    LineCapOpt,
    LineJoinOpt,
    LineDashOffset,
    Fill,
} from "../Shape";
import { IBlock, Position } from "../types";
import { Path } from "../Path";

interface Points {
    startX1?: number;
    startY1?: number;
    startX2?: number;
    startY2?: number;
    endX?: number;
    endY?: number;
    closePath?: boolean;
}
interface LineOptions extends BezierCurveToOpt, QuadraticCurveToOpt {
    points: Points[];
    dragStartX: boolean;
    dragStartY: boolean;
    dragStartX1: boolean;
    dragStartX2: boolean;
    dragStartY1: boolean;
    dragStartY2: boolean;
    dragEndX: boolean;
    dragEndY: boolean;
}

export class Line extends Shape {
    path?: Path;
    #startCords = { x: 0, y: 0 };

    constructor(options?: IBlock<LineOptions>) {
        super(options);
        this.options = options || {};
        this.path = new Path();
        this.#startCords = { x: this.x(), y: this.y() };
    }

    draw(_func?: (context: CanvasRenderingContext2D) => void): void {
        this.beginPath();
        this.path?.createPath();
        this.path?.path.moveTo(this.#startCords.x, this.#startCords.y);

        const points = this.points();
        if (!points) {
            let startX1 = this.startX1();
            let startY1 = this.startY1();
            let startX2 = this.startX2();
            let startY2 = this.startY2();
            let endX = this.endX();
            let endY = this.endY();

            if (startX1 && this.dragStartX1()) startX1 += this.#startCords.x;
            if (startX2 && this.dragStartX2()) startX2 += this.#startCords.x;
            if (startY1 && this.dragStartY1()) startY1 += this.#startCords.y;
            if (startY2 && this.dragStartY2()) startY2 += this.#startCords.y;
            if (endX && this.dragEndX()) endX += this.#startCords.x;
            if (endY && this.dragEndY()) endY += this.#startCords.y;

            if (startX1 && startY1 && !startX2 && !startY2) {
                this.path?.path.quadraticCurveTo(startX1, startY1, endX, endY);
            } else if (startX1 && startY1 && startX2 && startY2) {
                this.path?.path.bezierCurveTo(
                    startX1,
                    startY1,
                    startX2,
                    startY2,
                    endX,
                    endY
                );
            } else {
                this.path?.lineTo(endX, endY);
            }
        } else {
            for (let idx = 0; idx < points.length; idx++) {
                const point = points[idx];

                let startX1 = point.startX1;
                let startY1 = point.startY1;
                let startX2 = point.startX2;
                let startY2 = point.startY2;
                let endX = point.endX;
                let endY = point.endY;

                if (startX1 !== undefined) startX1 += this.canvasInit.x;
                if (startY1 !== undefined) startY1 += this.canvasInit.y;
                if (startX2 !== undefined) startX2 += this.canvasInit.x;
                if (startY2 !== undefined) startY2 += this.canvasInit.y;
                if (endX !== undefined) endX += this.canvasInit.x;
                if (endY !== undefined) endY += this.canvasInit.y;

                if (
                    startX1 !== undefined &&
                    startY1 !== undefined &&
                    startX2 === undefined &&
                    startY2 === undefined
                ) {
                    this.path?.path.quadraticCurveTo(
                        startX1,
                        startY1,
                        endX!,
                        endY!
                    );
                } else if (
                    startX1 !== undefined &&
                    startY1 !== undefined &&
                    startX2 !== undefined &&
                    startY2 !== undefined
                ) {
                    this.path?.path.bezierCurveTo(
                        startX1,
                        startY1,
                        startX2,
                        startY2,
                        endX!,
                        endY!
                    );
                } else {
                    this.path?.path.lineTo(endX!, endY!);
                }
                if (point.closePath) this.path!.path.closePath();
            }
        }
        if (this.closePath()) this.path!.path.closePath();
        if (this.fill()) this.context.fill(this.path!.path);
        if (this.stroke()) this.context.stroke(this.path!.path);
    }

    fill(opt?: Fill): boolean {
        return this.__cacheOption(opt, "fill", false);
    }
    stroke(opt?: Fill): boolean {
        return this.__cacheOption(opt, "stroke", false);
    }

    points(opt?: Points[]) {
        return this.__cacheOption(opt, "points", undefined);
    }
    checkInBound(_event: MouseEvent): boolean {
        const { x, y } = this.canvas.getCursorPosition(_event);
        return this.pointInStroke({ path: this.path!.path, x: x, y: y });
    }
    startX1(opt?: number) {
        return this.__cacheOption(opt, "startX1", 0);
    }
    startY1(opt?: number) {
        return this.__cacheOption(opt, "startY1", 0);
    }
    position(opt?: Position) {
        return this.__cacheOption(opt, "position", "static");
    }
    top(opt?: number) {
        if (this.position() === "static") opt = 0;
        return this.__cacheOption(opt, "top", 0);
    }
    bottom(opt?: number) {
        if (this.position() === "static") opt = 0;
        return this.__cacheOption(opt, "bottom", 0);
    }
    left(opt?: number) {
        if (this.position() === "static") opt = 0;
        return this.__cacheOption(opt, "left", 0);
    }
    right(opt?: number) {
        if (this.position() === "static") opt = 0;
        return this.__cacheOption(opt, "right", 0);
    }
    shadowBlur(opt?: number): number {
        return super.shadowBlur(opt);
    }
    shadowColor(opt?: string): string {
        return super.shadowColor(opt);
    }
    shadowOffsetX(opt?: number): number {
        return super.shadowOffsetX(opt);
    }
    shadowOffsetY(opt?: number): number {
        return super.shadowOffsetY(opt);
    }
    startX2(opt?: number) {
        return this.__cacheOption(opt, "startX2", 0);
    }
    startY2(opt?: number) {
        return this.__cacheOption(opt, "startY2", 0);
    }
    endX(opt?: number) {
        return this.__cacheOption(opt, "endX", 0);
    }
    endY(opt?: number) {
        return this.__cacheOption(opt, "endY", 0);
    }
    dragStartX(opt?: boolean) {
        return this.__cacheOption(opt, "dragStartX", true);
    }
    dragStartY(opt?: boolean) {
        return this.__cacheOption(opt, "dragStartY", true);
    }
    dragStartX1(opt?: boolean) {
        return this.__cacheOption(opt, "dragStartX1", true);
    }
    dragStartY1(opt?: boolean) {
        return this.__cacheOption(opt, "dragStartY1", true);
    }
    dragStartX2(opt?: boolean) {
        return this.__cacheOption(opt, "dragStartX2", true);
    }
    dragStartY2(opt?: boolean) {
        return this.__cacheOption(opt, "dragStartY2", true);
    }
    dragEndX(opt?: boolean) {
        return this.__cacheOption(opt, "dragEndX", true);
    }
    dragEndY(opt?: boolean) {
        return this.__cacheOption(opt, "dragEndY", true);
    }
    fillStyle(opt?: string): string {
        return super.fillStyle(opt);
    }
    lineWidth(opt?: number): number {
        const lineWidth = this.__cacheOption(opt, "lineWidth", 0);
        if (this.canvasInit.width === 0) this.canvasInit.width = lineWidth;
        this.context.lineWidth = this.canvasInit.width;
        return lineWidth;
    }
    lineCap(opt?: LineCapOpt): LineCapOpt {
        return super.lineCap(opt);
    }
    lineJoin(opt?: LineJoinOpt): LineJoinOpt {
        return super.lineJoin(opt);
    }
    lineDash(opt?: number[]) {
        return super.lineDash(opt);
    }
    lineDashOffset(opt?: LineDashOffset) {
        return super.lineDashOffset(opt);
    }
    strokeStyle(opt?: string): string {
        return super.strokeStyle(opt);
    }
    closePath(opt?: boolean): boolean {
        return this.__cacheOption(opt, "closePath", false);
    }
    blur(opt?: number): number {
        return super.blur(opt);
    }
    brightness(opt?: number): number {
        return super.brightness(opt);
    }
    contrast(opt?: number): number {
        return super.contrast(opt);
    }
    dropShadow(opt?: [number, number, number, string][]) {
        return super.dropShadow(opt);
    }
    grayscale(opt?: number): number {
        return super.grayscale(opt);
    }
    hueRotate(opt?: number): number {
        return super.hueRotate(opt);
    }
    opacity(opt?: number): number {
        return super.opacity(opt);
    }
    sepia(opt?: number): number {
        return super.sepia(opt);
    }
    clip(opt?: boolean): boolean {
        return super.clip(opt);
    }
    dragX(opt?: boolean) {
        return super.dragX(opt);
    }
    dragY(opt?: boolean) {
        return super.dragY(opt);
    }
    draggable(opt: boolean): boolean {
        const draggable = this.__cacheOption(opt, "draggable", true);
        if (!draggable) return false;

        let isMouseDown = false;

        let initX = 0;
        let initY = 0;

        let beforeX = 0;
        let beforeY = 0;

        this.mousedown((event) => {
            const { x, y } = this.canvas.getCursorPosition(event);
            initX = x;
            initY = y;
            if (event.button === 0) {
                isMouseDown = true;
                beforeX = 0;
                beforeY = 0;
            }
        });

        this.mousemove((event) => {
            if (isMouseDown) {
                const { x, y } = this.canvas.getCursorPosition(event);
                let diffX = x - initX;
                let diffY = y - initY;
                const startX1 = this.startX1();
                const startX2 = this.startX2();
                const endX = this.endX();
                const startY1 = this.startY1();
                const startY2 = this.startY2();
                const endY = this.endY();

                // const dragX1 =
                //     this.dragStartX1() && startX1 - 20 < x && x < startX1;
                // const dragX2 =
                //     this.dragStartX2() && startX2 - 20 < x && x < startX2;

                // const dragEndX =
                //     this.dragEndX() &&
                //     endX + 20 > x &&
                //     x > endX + this.#startCords.x;

                // const dragEndY =
                //     this.dragEndY() &&
                //     endY + 20 > y &&
                //     y > endY + this.#startCords.y;

                this.beforeInit.x = this.canvasInit.x;
                if (diffX !== 0 && this.dragX()) {
                    if (this.dragStartX()) this.canvasInit.x += diffX - beforeX;
                    // if (dragX1 || dragX2 || dragEndX)
                    this.#startCords.x += diffX - beforeX;
                    beforeX = diffX;
                }
                this.beforeInit.y = this.canvasInit.y;
                if (diffY !== 0 && this.dragY()) {
                    if (this.dragStartY()) this.canvasInit.y += diffY - beforeY;
                    // if (dragEndY)
                    this.#startCords.y += diffY - beforeY;
                    beforeY = diffY;
                }
                this.__adjustCordinates();
                this.canvas.invokeChange?.call(this.canvas);
            }
        });

        this.mouseup((event) => {
            isMouseDown = false;
        });
        return draggable;
    }
    set(options: IBlock<LineOptions>) {
        super.set(options);
    }
}
