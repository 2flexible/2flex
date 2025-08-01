import { Block } from "./Block";
import { BlockOptions, IBlock } from "./types";

// each shape extends form common shape
export class Shape extends Block {
    constructor(options?: IBlock<BlockOptions>) {
        super(options);
    }
    __initSet(): void {
        super.__initSet();
        this.draw();
    }

    draw() {
        this.color();

        this.fill();
        this.stroke();
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
        this.context.beginPath();
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
        this.options.fill = option || this.options.fill || false;
        if (this.options.fill) {
            this.context.fill();
        }
        return this.options.fill;
    }

    clip(option?: boolean): boolean {
        return super.clip(option);
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
