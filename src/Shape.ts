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
    // border-radius: [top-left, top-right, bottom-right, bottom-left]
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

    rect?: RectOpt;
    roundRect?: RoundRectOpt;
    strokeRect?: RectOpt;

    begin?: boolean;
    close?: boolean;
    move?: CursorPos;

    pointInPath?: PointInPath;
    pointInStroke?: PointInStroke;
}
// each shape extends form common shape
export class Shape extends Block {
    constructor(options: IBlock<IShapeOptions>) {
        super(options);
        this.options = options;
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
        const fill = this.__cacheOption(opt, this.options.fill, false);
        if (fill) this.context.fill(path);
        return fill;
    }
    fillStyle(opt?: string) {
        const fill = this.__cacheOption(opt, this.options.fill, false);
        this.context.fillStyle = fill;
        return fill;
    }

    stroke(opt?: boolean, path?: Path2D) {
        const stroke = this.__cacheOption(opt, this.options.stroke, false);
        if (stroke) {
            if (path) this.context.stroke(path);
            else this.context.stroke();
        }
        return stroke;
    }

    strokeStyle(opt?: string) {
        const strokeStyle = this.__cacheOption(
            opt,
            this.options.strokeStyle,
            "black"
        );
        this.context.strokeStyle = strokeStyle;
        return strokeStyle;
    }
    lineCap(opt?: LineCapOpt) {
        const lineCap = this.__cacheOption(opt, this.options.lineCap, "butt");
        this.context.lineCap = lineCap;
        return lineCap;
    }

    lineWidth(opt?: number) {
        const lineWidth = this.__cacheOption(opt, this.options.lineWidth, 0);
        this.context.lineWidth = lineWidth;
        return lineWidth;
    }

    lineDash(opt?: number[]): void {
        const lineDash = this.__cacheOption(opt, this.options.lineDash, []);
        this.context.setLineDash(lineDash);
    }
    closePath(opt?: boolean): void {
        if (opt) this.context.closePath();
    }
    line({ x, y }: CursorPos): void {
        this.context.lineTo(x, y);
    }
    quadraticCurve({ cpx1, cpy1, endX, endY }: QuadraticCurveToOpt): void {
        this.context.quadraticCurveTo(cpx1, cpy1, endX, endY);
    }

    bezierCurve({
        cpx1,
        cpy1,
        cpx2,
        cpy2,
        endX,
        endY,
    }: BezierCurveToOpt): void {
        this.context.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, endX, endY);
    }

    rect({ x, y, width, height }: RectOpt): void {
        this.context.rect(x, y, width, height);
    }
    roundRect({ x, y, width, height, borderRadius }: RoundRectOpt): void {
        this.context.roundRect(x, y, width, height, borderRadius);
    }
    strokeRect({ x, y, width, height }: RectOpt): void {
        this.context.strokeRect(x, y, width, height);
    }
    // can be 2 different format, one opt with optinos giving paramters, two like this
    move({ x, y }: CursorPos): void {
        x = x || this.canvasInit.x;
        y = y || this.canvasInit.y;
        this.context.moveTo(x, y);
    }
    pointInPath({ path, x, y, fillRule }: PointInPath): void {
        x = x || this.options.x || 0;
        y = y || this.options.y || 0;
        fillRule = fillRule || "nonzero";
        if (path) this.context.isPointInPath(path, x, y, fillRule);
        else this.context.isPointInPath(x, y, fillRule);
    }
    pointInStroke({ path, x, y }: PointInStroke): boolean {
        x = x || this.options.x || 0;
        y = y || this.options.y || 0;
        if (path) return this.context.isPointInStroke(path, x, y);
        else return this.context.isPointInStroke(x, y);
    }
    clip(opt?: boolean): boolean {
        return super.clip(opt);
    }
    dragX(opt?: boolean): boolean {
        return super.dragX(opt);
    }
    dragY(opt?: boolean): boolean {
        return super.dragY(opt);
    }
    draggable(opt?: boolean): boolean {
        return super.draggable(opt);
    }

    selectable(opt?: boolean): boolean {
        return super.selectable(opt);
    }
    set(options: IBlock<IShapeOptions>): void {
        super.set(options);
    }
}

// new Shape({ width: 100, height: 100, setLineDash: [10, 10] }).draw((context) =>
//     context.setLineDash([10, 10])
// );
