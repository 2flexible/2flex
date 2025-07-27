import { Block } from "../Block";
import { Shape } from "../Shape";
import { BlockOptions, IBlock } from "../types";

export class Rectangle extends Block {
    constructor(options?: IBlock<BlockOptions>) {
        super(options);
    }
    __initSet(): void {
        this.drawRectangle();
    }

    drawRectangle() {
        this.context.beginPath();
        super.color();

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
