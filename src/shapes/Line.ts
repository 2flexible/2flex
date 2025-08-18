import {
    Shape,
    LineCapOpt,
    QuadraticCurveToOpt,
    BezierCurveToOpt,
} from "../Shape";
import { IBlock, IDefaultBlockOpt, CursorPos } from "../types";

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

    constructor(options?: IBlock<LineOptions>) {
        super(options);
        this.options = { ...defaultOpt, ...options };
    }
    __initSet(): void {
        super.__initSet();
    }
    __drawInit() {
        if (!this.joinTo) {
            this.beginPath();
            this.move({ x: this.initCords.x, y: this.initCords.y });
            this.strokeStyle();
        }
        if (!this.options.points) {
            if (
                this.options.cpx1 &&
                this.options.cpy1 &&
                !this.options.cpx2 &&
                !this.options.cpy2
            ) {
                this.quadraticCurve({
                    cpx1: this.options.cpx1,
                    cpy1: this.options.cpy1,
                    endX: this.options.endX,
                    endY: this.options.endY,
                });
            } else if (
                this.options.cpx1 &&
                this.options.cpy1 &&
                this.options.cpx2 &&
                this.options.cpy2
            ) {
                this.bezierCurve({
                    cpx1: this.options.cpx1,
                    cpy1: this.options.cpy1,
                    cpx2: this.options.cpx2,
                    cpy2: this.options.cpy2,
                    endX: this.options.endX,
                    endY: this.options.endY,
                });
            } else {
                this.line({ x: this.options.endX, y: this.options.endY });
            }
        } else {
            this.#drawLines();
        }

        this.fill();
        this.stroke();
    }

    dash(opt?: number[]) {
        this.options.dash = super.lineDash(opt);
        return this.options.dash;
    }
    points(opt?: object[]) {
        this.options.points = opt || this.options.points || [];
        return this.options.points;
    }
    #drawLines() {
        this.options.points.forEach((point: Point) => {
            if (
                point.hasOwnProperty("cpx1") &&
                point.hasOwnProperty("cpy1") &&
                !point.hasOwnProperty("cpx2") &&
                !point.hasOwnProperty("cpx2")
            ) {
                this.quadraticCurve({
                    cpx1: point.cpx1,
                    cpy1: point.cpy1,
                    endX: point.endX,
                    endY: point.endY,
                });
            } else if (
                point.hasOwnProperty("cpx1") &&
                point.hasOwnProperty("cpy1") &&
                point.hasOwnProperty("cpx2") &&
                point.hasOwnProperty("cpx2")
            ) {
                this.bezierCurve({
                    cpx1: point.cpx1,
                    cpy1: point.cpy1,
                    cpx2: point.cpx2,
                    cpy2: point.cpy2,
                    endX: point.endX,
                    endY: point.endY,
                });
            } else {
                this.line({ x: point.endX, y: point.endY });
            }
        });
    }
    joinBorder(opt?: LineCapOpt) {
        return super.lineCap(opt);
    }

    join(line: Line) {
        line.joinTo = this;
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
        // this.#adjustCordinates();
        return super.draggable(opt);
    }

    selectable(opt?: boolean): boolean {
        return super.selectable(opt);
    }

    set(options: IBlock<LineOptions>) {
        super.set(options);
    }
}
