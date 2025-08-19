import {
    Shape,
    LineCapOpt,
    QuadraticCurveToOpt,
    BezierCurveToOpt,
} from "../Shape";
import { IBlock, IDefaultBlockOpt } from "../types";
import { Path } from "../Path";

interface DefaultLineOpt {}

const defaultOpt: IDefaultBlockOpt<DefaultLineOpt> = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    selectable: true,
    draggable: true,
    zIndex: 0,
    dragX: true,
    dragY: true,
};

export type LineJoinOpt = "miter" | "round" | "bevel";

interface LineOptions
    extends DefaultLineOpt,
        BezierCurveToOpt,
        QuadraticCurveToOpt {
    points: number[];
    lineDashOffset?: number;
    lineJoin: LineJoinOpt;
}
type Point = BezierCurveToOpt;

export class Line extends Shape {
    joinTo: Line | undefined = undefined;
    path: Path;
    #beforeX: number;
    #beforeY: number;

    constructor(options?: IBlock<LineOptions>) {
        super(options);
        this.options = { ...defaultOpt, ...options };
        this.#beforeX = this.options.x;
        this.#beforeY = this.options.y;
        this.path = new Path();
    }
    __initSet(): void {
        super.__initSet();
        // this.#beforeEndX = this.options.x;
        // this.#beforeEndY = this.options.y;
    }
    __drawInit() {
        if (!this.joinTo) {
            this.beginPath();
            this.path.createPath();
            this.path.path.moveTo(this.initCords.x!, this.initCords.y!);
            this.strokeStyle();
        }
        if (!this.options.points) {
            const { cpx1, cpy1, cpx2, cpy2, endX, endY } = this.#calcDiff(
                this.options.cpx1,
                this.options.cpy1,
                this.options.cpx2,
                this.options.cpy2,
                this.options.endX,
                this.options.endY
            );
            this.options.cpx1 = cpx1;
            this.options.cpy1 = cpy1;
            this.options.cpx2 = cpx2;
            this.options.cpy2 = cpy2;
            this.options.endX = endX;
            this.options.endY = endY;
            if (
                this.options.cpx1 &&
                this.options.cpy1 &&
                !this.options.cpx2 &&
                !this.options.cpy2
            ) {
                this.path!.path.quadraticCurveTo(
                    this.options.cpx1,
                    this.options.cpy1,
                    this.options.endX,
                    this.options.endY
                );
            } else if (
                this.options.cpx1 &&
                this.options.cpy1 &&
                this.options.cpx2 &&
                this.options.cpy2
            ) {
                this.path!.path.bezierCurveTo(
                    this.options.cpx1,
                    this.options.cpy1,
                    this.options.cpx2,
                    this.options.cpy2,
                    this.options.endX,
                    this.options.endY
                );
            } else {
                this.path.lineTo(this.options.endX, this.options.endY);
            }
        } else {
            this.#drawLines();
        }

        this.fill();
        this.stroke(this.options.stroke, this.path!.path);
    }

    dash(opt?: number[]) {
        this.options.dash = super.lineDash(opt);
        return this.options.dash;
    }
    points(opt?: object[]) {
        this.options.points = opt || this.options.points || [];
        return this.options.points;
    }
    checkInBound(_event: MouseEvent): boolean {
        const { x, y } = this.canvas.getCursorPosition(_event);
        return this.pointInStroke({ path: this.path!.path, x: x, y: y });
    }
    #calcDiff(
        cpx1: number,
        cpy1: number,
        cpx2: number,
        cpy2: number,
        endX: number,
        endY: number
    ) {
        const diffX = this.options.x - this.#beforeX;
        if (diffX !== 0) {
            endX += diffX;
            if (cpx1) cpx1 += diffX;
            if (cpx2) cpx2 += diffX;

            this.#beforeX = this.options.x;
        }
        const diffY = this.options.y - this.#beforeY;
        if (diffY !== 0) {
            endY += diffY;
            if (cpy1) cpy1 += diffY;
            if (cpy2) cpy2 += diffY;

            this.#beforeY = this.options.y;
        }
        return { cpx1, cpy1, cpx2, cpy2, endX, endY };
    }
    #drawLines() {
        const beforeX = this.#beforeX;
        const beforeY = this.#beforeY;
        this.options.points.forEach((point: Point, index: number, arr: []) => {
            const { cpx1, cpy1, cpx2, cpy2, endX, endY } = this.#calcDiff(
                point.cpx1,
                point.cpy1,
                point.cpx2,
                point.cpy2,
                point.endX,
                point.endY
            );
            this.options.points[index] = { cpx1, cpy1, cpx2, cpy2, endX, endY };
            if (
                cpx1 !== undefined &&
                cpy1 !== undefined &&
                cpx2 === undefined &&
                cpy2 === undefined
            ) {
                this.path!.path.quadraticCurveTo(cpx1, cpy1, endX, endY);
            } else if (
                cpx1 !== undefined &&
                cpy1 !== undefined &&
                cpx2 !== undefined &&
                cpy2 !== undefined
            ) {
                this.path!.path.bezierCurveTo(
                    cpx1,
                    cpy1,
                    cpx2,
                    cpy2,
                    endX,
                    endY
                );
            } else {
                this.path!.path.lineTo(endX, endY);
            }
            if (arr.length - 1 !== index) {
                this.#beforeX = beforeX;
                this.#beforeY = beforeY;
            }
        });
    }
    joinBorder(opt?: LineCapOpt) {
        return super.lineCap(opt);
    }

    join(line: Line) {
        line.joinTo = this;
        line.path = this.path;
    }
    strokeStyle(opt?: string) {
        super.strokeStyle(opt);
    }
    strokeWidth(opt?: number) {
        this.options.strokeWidth = opt || this.options.strokeWidth || 1;
        this.options.strokeWidth = super.lineWidth(this.options.strokeWidth);
        return this.options.strokeWidth;
    }
    fillStyle(opt?: string) {
        return super.fillStyle(opt);
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
        return super.draggable(opt);
    }

    selectable(opt?: boolean): boolean {
        return super.selectable(opt);
    }

    set(options: IBlock<LineOptions>) {
        super.set(options);
    }
}
