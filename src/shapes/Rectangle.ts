import { Block } from "../Block";
import { Shape } from "../Shape";
import { BlockOptions, IBlock } from "../types";

export class Rectangle extends Block {
    prevX: number | undefined = undefined;
    prevY: number | undefined = undefined;

    constructor(options?: IBlock<BlockOptions>) {
        super(options);
    }
    __initSet(): void {
        this.drawRectangle();
       
    }

    drawRectangle() {
        this.context.beginPath();
        super.color();

        // console.log(this.prevX, this.prevY);
        this.context.rect(
            this.options.x,
            this.options.y,
            this.options.width,
            this.options.height
        );
        super.fill();
    }

    color(option?: string) {
        super.color(option);
        super.fill();
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
