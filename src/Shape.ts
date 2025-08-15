import { Block } from "./Block";
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

export interface IShapeOptions {
    fill?: boolean;
    stroke?: boolean;

    lineTo?: CursorPos;
    lineWidth?: number;
    lineDash?: number[];
    lineCap?: LineCapOpt;

    bezierCurve?: BezierCurveToOpt,
    quadraticCurve?: QuadraticCurveToOpt,

    rect: RectOpt;
    roundRect: RoundRectOpt;

    beginPath: boolean;
    moveTo?: CursorPos;


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

    fill(opt?: boolean) {
        this.options.fill = opt || this.options.fill || false;
        if (this.options.fill) {
            this.context.fill();
        }
        return this.options.fill;
    }
    fillStyle(opt?: string) {
        this.options.fillStyle = opt || this.options.fillStyle || "black";
        this.context.fillStyle = this.options.fillStyle;
        return this.options.fillStyle;
    }

    stroke(opt?: boolean) {
        this.options.stroke = opt || this.options.stroke || false;
        if (this.options.stroke) {
            this.context.stroke();
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

    setLineDash(opt?: number[]) {
        this.options.lineDash = opt || this.options.lineDash || [];
        this.context.setLineDash(opt);
    }
    quadraticCurveTo({ cpx1, cpy1, endX, endY }: QuadraticCurveToOpt) {
        this.context.quadraticCurveTo(cpx1, cpy1, endX, endY);
    }

    bezierCurveTo({ cpx1, cpy1, cpx2, cpy2, endX, endY }: BezierCurveToOpt) {
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
    moveTo({ x, y }: CursorPos) {
        x = x || this.initCords.x!;
        y = y || this.initCords.y!;
        this.context.moveTo(x, y);
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
