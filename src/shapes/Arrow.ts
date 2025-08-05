import { Shape } from "../Shape";
import { IBlock, IDefaultBlockOpt } from "../types";

interface DefaultArrowOpt {}

const defaultOpt: IDefaultBlockOpt<DefaultArrowOpt> = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    selectable: true,
    draggable: true,
    zIndex: 0,
    dragX: true,
    dragY: true,
};

interface ArrowOptions extends DefaultArrowOpt {}

export class Arrow extends Shape {
    constructor(options?: IBlock<ArrowOptions>) {
        super(options);
        this.options = { ...defaultOpt, ...options };
        Arrow.prototype.draggable = Shape.prototype.draggable;
        // Object.assign(Rectangle.prototype)
    }
    __initSet(): void {
        super.__initSet();
    }

    draw() {
        this.color();

        this.fill();
        this.stroke();
    }
}
