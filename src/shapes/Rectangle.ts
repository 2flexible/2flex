import { Block } from "../Block";
import { Shape } from "../Shape";
import { BlockOptions, IBlock } from "../types";

interface RectangleOptions {
    // border-radius: [top-left, top-right, bottom-right, bottom-left]
    borderRadius: number[];
}

export class Rectangle extends Block {
    constructor(options?: IBlock<RectangleOptions>) {
        super(options);
    }
    __initSet(): void {
        super.__initSet();
        this.drawRectangle();
    }

    drawRectangle() {
        this.context.beginPath();
        this.color();

        this.context.roundRect(
            this.options.x,
            this.options.y,
            this.options.width,
            this.options.height,
            this.options.borderRadius
        );
        this.fill();
        super.stroke();
    }

    x(option?: number): number {
        return super.x(option);
    }

    y(option?: number): number {
        return super.y(option);
    }

    width(option?: number): number {
        return super.width(option);
    }
    height(option?: number): number {
        return super.height(option);
    }

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

    draggable(option: boolean): boolean {
        return super.draggable(option);
    }

    selectable(option?: boolean): boolean {
        return super.selectable(option);
    }

    set(options: IBlock<BlockOptions>) {
        super.set(options);
    }
}
