import { Shape } from "../Shape";
import { IDefaultBlockOpt, IBlock } from "../types";

interface DefaultTriangleOpt {
    left: number;
    right: number;
    bottom: number;
}

const defaultOpt: IDefaultBlockOpt<DefaultTriangleOpt> = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    selectable: true,
    draggable: true,
    clip: true,
    zIndex: 0,
    left: 30,
    right: 30,
    bottom: 30,
};

interface RectangleOptions extends DefaultTriangleOpt {
    side?: number;
}
export class Triangle extends Shape {
    constructor(options?: IBlock<RectangleOptions>) {
        super(options);
        this.options = { ...defaultOpt, ...options };
    }

    __initSet(): void {
        super.__initSet();
    }

    // have some problems
    draw() {
        this.color();

        let x = this.options.x;
        let y = this.options.y;

        let bottom: number;
        let right: number;
        let left: number;

        if (!this.options.side) {
            bottom = this.options.bottom;
            right = this.options.right;
            left = this.options.left;
        } else {
            right = left = bottom = this.options.side;
        }
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

        let x1: number;

        if (bottom < left) {
            x1 = left - xDiff;
        } else {
            x1 = xDiff + left;
        }

        this.context.moveTo(x - this.options.x, y - this.options.y);
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

    side(option?: number) {
        this.options.side = option || this.options.side || 10;
        return this.options.side;
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

    set(options: IBlock<RectangleOptions>) {
        super.set(options);
    }
}
