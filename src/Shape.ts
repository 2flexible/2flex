import { Block } from "./Block";
import { Path } from "./Path";
import { IBlock, CursorPos } from "./types";

export interface QuadraticCurveToOpt {
    cpx1: number;
    cpy1: number;
    endX: number;
    endY: number;
}

export interface BezierCurveToOpt extends QuadraticCurveToOpt {
    cpx2: number;
    cpy2: number;
}

export interface RectOpt extends CursorPos {
    width: number;
    height: number;
}
export interface RoundRectOpt extends RectOpt {
    borderRadius: number[];
}

export type LineCapOpt = "butt" | "round" | "square";

export type FillRule = "nonzero" | "evenodd";

interface PointInPath extends CursorPos {
    path?: Path2D;
    fillRule?: FillRule;
}
interface PointInStroke extends CursorPos {
    path?: Path2D;
}
export interface IShapeOptions {
    fill?: boolean;
    fillStyle?: string;

    stroke?: boolean;
    strokeStyle?: string;

    line?: CursorPos;
    lineWidth?: number;
    lineDash?: number[];
    lineCap?: LineCapOpt;

    bezierCurve?: BezierCurveToOpt;
    quadraticCurve?: QuadraticCurveToOpt;

    rect: RectOpt;
    roundRect: RoundRectOpt;
    strokeRect: RectOpt;

    begin?: boolean;
    close?: boolean;
    move?: CursorPos;

    pointInPath?: PointInPath;
    pointInStroke?: PointInStroke;
}
// each shape extends form common shape
export class Shape extends Block {
    constructor(options?: IBlock<IShapeOptions>) {
        super(options);
    }
    __initSet(): void {
        super.__initSet();
        this.__drawInit();
    }

    __drawInit() {
        this.fillStyle();

        this.draw();

        this.fill();
        this.stroke();
    }

    draw(_func?: (context: this) => void) {
        if (_func) _func(this);
    }

    beginPath(opt: boolean = true) {
        if (opt) return this.context.beginPath();
    }

    fill(opt?: boolean, path?: Path) {
        this.options.fill = opt || this.options.fill || false;
        if (this.options.fill) {
            this.context.fill(path);
        }
        return this.options.fill;
    }
    fillStyle(opt?: string) {
        this.options.fillStyle = opt || this.options.fillStyle || "black";
        this.context.fillStyle = this.options.fillStyle;
        return this.options.fillStyle;
    }

    stroke(opt?: boolean, path?: Path2D) {
        this.options.stroke = opt || this.options.stroke || false;
        if (this.options.stroke) {
            if (path) this.context.stroke(path);
            else this.context.stroke();
        }
        return this.options.stroke;
    }

    strokeStyle(opt?: string) {
        this.options.strokeStyle = opt || this.options.strokeStyle || "black";
        this.context.strokeStyle = this.options.strokeStyle;
        return this.options.strokeStyle;
    }
    lineCap(opt?: LineCapOpt) {
        this.options.lineCap = opt || this.options.lineCap || "butt";
        this.context.lineCap = this.options.lineCap;
        return this.options.lineCap;
    }

    lineWidth(opt?: number) {
        this.options.lineWidth = opt || this.options.lineWidth || 0;
        this.context.lineWidth = this.options.lineWidth;
        return this.options.lineWidth;
    }

    lineDash(opt?: number[]) {
        this.options.lineDash = opt || this.options.lineDash || [];
        this.context.setLineDash(opt);
    }
    closePath(opt?: boolean) {
        if (opt) this.context.closePath();
    }
    line({ x, y }: CursorPos) {
        this.context.lineTo(x, y);
    }
    quadraticCurve({ cpx1, cpy1, endX, endY }: QuadraticCurveToOpt) {
        this.context.quadraticCurveTo(cpx1, cpy1, endX, endY);
    }

    bezierCurve({ cpx1, cpy1, cpx2, cpy2, endX, endY }: BezierCurveToOpt) {
        this.context.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, endX, endY);
    }

    rect({ x, y, width, height }: RectOpt) {
        this.context.rect(x, y, width, height);
    }
    roundRect({ x, y, width, height, borderRadius }: RoundRectOpt) {
        this.context.roundRect(x, y, width, height, borderRadius);
    }
    strokeRect({ x, y, width, height }: RectOpt) {
        this.context.strokeRect(x, y, width, height);
    }
    // can be 2 different format, one opt with optinos giving paramters, two like this
    move({ x, y }: CursorPos) {
        x = x || this.initCords.x!;
        y = y || this.initCords.y!;
        this.context.moveTo(x, y);
    }
    pointInPath({ path, x, y, fillRule }: PointInPath) {
        x = x || this.options.x || 0;
        y = y || this.options.y || 0;
        fillRule = fillRule || "nonzero";
        if (path) this.context.isPointInPath(path, x, y, fillRule);
        else this.context.isPointInPath(x, y, fillRule);
    }
    pointInStroke({ path, x, y }: PointInStroke) {
        x = x || this.options.x || 0;
        y = y || this.options.y || 0;
        if (path) return this.context.isPointInStroke(path, x, y);
        else return this.context.isPointInStroke(x, y);
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

    set(options: IBlock<IShapeOptions>) {
        super.set(options);
    }
}

// new Shape({ width: 100, height: 100, setLineDash: [10, 10] }).draw((context) =>
//     context.setLineDash([10, 10])
// );
