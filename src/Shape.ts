import { Block } from "./Block";
import { IBlock, CursorPos } from "./types";
import { RectangleOptions } from "./shapes/Rectangle";

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

export type borderStyle = "solid" | "dotted";

export interface RectOpt extends CursorPos {
    width: number;
    height: number;
}
export interface RoundRectOpt extends RectOpt {
    borderRadius: number[];
}

export type LineCapOpt = "butt" | "round" | "square";

export interface ShapeDefOptions {
    backgroundColor?: string;

    border?: string;
    // borderstyle can be extended for now just solid, dotted
    borderStyle?: borderStyle;
    borderColor?: string;
    borderWidth?: number;

    fill?: boolean;
    stroke?: boolean;

    lineTo: CursorPos;
    lineWidth?: number;
    setLineDash?: number[];
    lineCap?: LineCapOpt;

    rect: RectOpt;
    roundRect: RoundRectOpt;

    beginPath: boolean;
    moveTo?: CursorPos;
}
export type ShapeOptions = ShapeDefOptions & RectangleOptions;

// each shape extends form common shape
export class Shape extends Block {
    constructor(options?: IBlock<ShapeOptions>) {
        super(options);
    }
    __initSet(): void {
        super.__initSet();
        this.__drawInit();
    }

    __drawInit() {
        this.backgroundColor();

        this.draw();

        this.fill();
        this.stroke();
    }

    draw(_func?: (context: any) => void) {
        if (_func) _func(this.context);
    }
    border(opt?: string) {
        this.options.border = opt || this.options.border || [];
        return this.options.border;
    }
    backgroundColor(opt?: string) {
        this.options.backgroundColor =
            opt || this.options.backgroundColor || "black";
        this.context.fillStyle = this.options.backgroundColor;
        return this.options.backgroundColor;
    }
    beginPath(opt: boolean = true) {
        if (opt) return this.context.beginPath();
    }

    borderWidth(opt?: number) {
        this.options.borderWidth = opt || this.options.borderWidth || 1;
        this.context.lineWidth = this.options.borderWidth;
        return this.options.borderWidth;
    }

    borderColor(opt?: string) {
        this.options.strokeColor = opt || this.options.strokeColor || "black";
        this.context.strokeStyle = this.options.strokeColor;
        return this.options.borderColor;
    }

    fill(opt?: boolean) {
        this.options.fill = opt || this.options.fill || false;
        if (this.options.fill) {
            this.context.fill();
        }
        return this.options.fill;
    }

    stroke(opt?: boolean) {
        this.options.stroke = opt || this.options.stroke || false;
        if (this.options.stroke) {
            this.context.stroke();
        }
        return this.options.stroke;
    }
    lineCap(opt: LineCapOpt) {
        this.options.lineCap = opt || this.options.lineCap || "butt";
        this.context.lineCap = this.options.lineCap;
        return this.options.lineCap;
    }
    setLineDash(dashes: number[]) {
        this.context.setLineDash(dashes);
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

    set(options: IBlock<ShapeOptions>) {
        super.set(options);
    }
}

// new Shape({ width: 100, height: 100, setLineDash: [10, 10] }).draw((context) =>
//     context.setLineDash([10, 10])
// );
