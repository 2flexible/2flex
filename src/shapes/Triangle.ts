import { Block } from "../Block";
import { Shape } from "../Shape";
import { BlockOptions, IBlock } from "../types";

export class Triangle extends Block {
    constructor(options?: IBlock<BlockOptions>) {
        super(options);
    }
    __initSet(): void {
        super.__initSet();
        this.draw();
    }

    draw() {
        // this.context.restore();
        this.context.beginPath();
        this.color();

        let x = 0;
        let y = 0;

        let bottom = 155;
        let right = 60;
        let left = 165;

        y += right;
        x += bottom;
        right -= y;
        bottom -= x;

        const xDiff = Math.abs(
            (bottom ** 2 - left ** 2 - right ** 2) / (2 * left)
        );
        const y1 = Math.sqrt(
            (right ** 2 + left ** 2 + 2 * left * right ** 2 - bottom ** 2) /
                (2 * left)
        );

        let x1;

        if (bottom < left) {
            x1 = left - xDiff;
        } else {
            x1 = xDiff + left;
        }

        this.context.moveTo(x, y);
        this.context.lineTo(x1, y1);
        this.context.lineTo(y1, x1);
        this.context.closePath();

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
