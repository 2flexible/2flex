import { Shape } from "../Shape";
import type { QuadraticCurveToOpt, BezierCurveToOpt } from "../Shape";
import type { IBlock } from "../types";
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

export class Line extends Shape<LineOptions> {
    path?: Path;
    #startCords = { x: 0, y: 0 };

    constructor(options: IBlock<LineOptions>) {
        super(options);
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

                if (startX1 !== undefined) startX1 += this.x();
                if (startY1 !== undefined) startY1 += this.y();
                if (startX2 !== undefined) startX2 += this.x();
                if (startY2 !== undefined) startY2 += this.y();
                if (endX !== undefined) endX += this.x();
                if (endY !== undefined) endY += this.y();

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

    points(opt?: Points[]): Points[] {
        return this.__valueHandler<Points[], Points[]>(opt, "points", []);
    }
    checkInBound(_event: MouseEvent): boolean {
        const { x, y } = this.canvas.getCursorPosition(_event);
        return this.pointInStroke({ path: this.path!.path, x: x, y: y });
    }
    startX1(opt?: number) {
        return this.__valueHandler(opt, "startX1", 0);
    }
    startY1(opt?: number) {
        return this.__valueHandler(opt, "startY1", 0);
    }
    startX2(opt?: number) {
        return this.__valueHandler(opt, "startX2", 0);
    }
    startY2(opt?: number) {
        return this.__valueHandler(opt, "startY2", 0);
    }
    endX(opt?: number) {
        return this.__valueHandler(opt, "endX", 0);
    }
    endY(opt?: number) {
        return this.__valueHandler(opt, "endY", 0);
    }
    dragStartX(opt?: boolean) {
        return this.__valueHandler(opt, "dragStartX", true);
    }
    dragStartY(opt?: boolean) {
        return this.__valueHandler(opt, "dragStartY", true);
    }
    dragStartX1(opt?: boolean) {
        return this.__valueHandler(opt, "dragStartX1", true);
    }
    dragStartY1(opt?: boolean) {
        return this.__valueHandler(opt, "dragStartY1", true);
    }
    dragStartX2(opt?: boolean) {
        return this.__valueHandler(opt, "dragStartX2", true);
    }
    dragStartY2(opt?: boolean) {
        return this.__valueHandler(opt, "dragStartY2", true);
    }
    dragEndX(opt?: boolean) {
        return this.__valueHandler(opt, "dragEndX", true);
    }
    dragEndY(opt?: boolean) {
        return this.__valueHandler(opt, "dragEndY", true);
    }
    lineWidth(opt?: number): number {
        const lineWidth = this.__valueHandler(opt, "lineWidth", 0);
        if (this.width() === 0) this.width(lineWidth);
        this.context.lineWidth = this.width();
        return lineWidth;
    }
    closePath(opt?: boolean): boolean {
        return this.__valueHandler(opt, "closePath", false);
    }
}
