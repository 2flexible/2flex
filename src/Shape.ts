import { Block } from "./Block";
import { IBlock, CursorPos } from "./types";

export type borderStyle = "solid" | "dotted";

export interface RectOpt extends CursorPos {
    width: number;
    height: number;
}
export interface RoundRectOpt extends RectOpt {
    borderRadius: number[];
}
export interface ShapeOptions {
    backgroundColor?: string;

    border?: string;
    // borderstyle can be extended for now just solid, dotted
    borderStyle?: borderStyle;
    borderColor?: string;
    borderWidth?: number;

    fill?: boolean;
    stroke?: boolean;

    lineWidth?: number;
    setLineDash?: number[];

    rect: RectOpt;
    roundRect: RoundRectOpt;

    moveTo?: CursorPos;
}
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
    border(option?: string) {
        this.options.border = option || this.options.border || [];
        return this.options.border;
    }
    backgroundColor(option?: string) {
        this.context.beginPath();
        this.options.backgroundColor =
            option || this.options.backgroundColor || "black";
        this.context.fillStyle = this.options.backgroundColor;
        return this.options.backgroundColor;
    }

    borderWidth(option?: number) {
        this.options.borderWidth = option || this.options.borderWidth || 1;
        this.context.lineWidth = this.options.borderWidth;
        return this.options.borderWidth;
    }

    borderColor(option?: string) {
        this.options.strokeColor =
            option || this.options.strokeColor || "black";
        this.context.strokeStyle = this.options.strokeColor;
        return this.options.borderColor;
    }

    fill(option?: boolean) {
        this.options.fill = option || this.options.fill || false;
        if (this.options.fill) {
            this.context.fill();
        }
        return this.options.fill;
    }

    stroke(option?: boolean) {
        this.options.stroke = option || this.options.stroke || false;
        if (this.options.stroke) {
            this.context.stroke();
        }
        return this.options.stroke;
    }
    setLineDash(dashes: number[]) {
        this.context.setLineDash(dashes);
    }

    rect({ x, y, width, height }: RectOpt) {
        return this.context.rect(x, y, width, height);
    }
    roundRect({ x, y, width, height, borderRadius }: RoundRectOpt) {
        return this.context.roundRect(x, y, width, height, borderRadius);
    }
    strokeRect({ x, y, width, height }: RectOpt) {
        return this.context.strokeRect(x, y, width, height);
    }
    // can be 2 different format, one option with optinos giving paramters, two like this
    moveTo({ x, y }: CursorPos) {
        x = x || this.initCords.x!;
        y = y || this.initCords.y!;
        return this.context.moveTo(x, y);
    }

    clip(option?: boolean): boolean {
        return super.clip(option);
    }
    dragX(option?: boolean) {
        return super.dragX(option);
    }
    dragY(option?: boolean) {
        return super.dragY(option);
    }
    draggable(option: boolean): boolean {
        return super.draggable(option);
    }

    selectable(option?: boolean): boolean {
        return super.selectable(option);
    }

    set(options: IBlock<ShapeOptions>) {
        super.set(options);
    }
}

// new Shape({ width: 100, height: 100, setLineDash: [10, 10] }).draw((context) =>
//     context.setLineDash([10, 10])
// );
