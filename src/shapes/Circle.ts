import { Shape } from "../Shape";
import { IBlock, IDefaultBlockOpt } from "../types";

interface DefaultCircleOpt {
    radius: number;
}

const defaultOpt: IDefaultBlockOpt<DefaultCircleOpt> = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    selectable: true,
    draggable: true,
    zIndex: 0,
    dragX: true,
    dragY: true,
    radius: 10,
};

interface CircleOptions extends DefaultCircleOpt {}

export class Circle extends Shape {
    constructor(options?: IBlock<CircleOptions>) {
        super(options);
        this.options = { ...defaultOpt, ...options };
        Circle.prototype.draggable = Shape.prototype.draggable;
        // Object.assign(Rectangle.prototype)
    }
    __initSet(): void {
        super.__initSet();
    }

    draw() {
        this.color();
        const x = this.initCords.x + this.options.radius;
        const y = this.initCords.y + this.options.radius;

        this.context.arc(x, y, this.options.radius, 0, 2 * Math.PI);

        this.fill();
        this.stroke();
    }
}
