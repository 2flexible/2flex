import { Block } from "../Block";
import { Shape } from "../Shape";
import { BlockOptions, IBlock, IDefaultBlockOpt } from "../types";

interface DefaultRectOpt {
    borderRadius: number[];
}

const defaultOpt: IDefaultBlockOpt<DefaultRectOpt> = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    selectable: true,
    draggable: true,
    zIndex: 0,
    dragX: true,
    dragY: true,
    // border-radius: [top-left, top-right, bottom-right, bottom-left]
    borderRadius: [],
};

interface RectangleOptions extends DefaultRectOpt {}

export class Rectangle extends Shape {
    constructor(options?: IBlock<RectangleOptions>) {
        super(options);
        this.options = { ...defaultOpt, ...options };
        Rectangle.prototype.draggable = Shape.prototype.draggable;
        // Object.assign(Rectangle.prototype)
    }
    __initSet(): void {
        super.__initSet();
    }

    draw() {
        this.color();

        this.context.roundRect(
            this.initCords.x,
            this.initCords.y,
            this.options.width,
            this.options.height,
            this.options.borderRadius
        );

        this.fill();
        this.stroke();
    }

    // x(option?: number): number {
    //     return super.x(option);
    // }

    // y(option?: number): number {
    //     return super.y(option);
    // }

    // width(option?: number): number {
    //     return super.width(option);
    // }
    // height(option?: number): number {
    //     return super.height(option);
    // }

    color(option?: string) {
        return super.color(option);
    }

    strokeWidth(option?: number) {
        return super.strokeWidth(option);
    }
    strokeColor(option?: string) {
        return super.strokeColor(option);
    }
    stroke(option?: boolean) {
        return super.stroke(option);
    }

    fill(option?: boolean) {
        return super.fill(option);
    }

    clip(option?: boolean): boolean {
        return super.clip(option);
    }

    // draggable(option: boolean): boolean {
    //     return super.draggable(option);
    // }

    selectable(option?: boolean): boolean {
        return super.selectable(option);
    }

    set(options: IBlock<BlockOptions>) {
        super.set(options);
    }
}
