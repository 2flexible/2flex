import { Shape } from "../Shape";
import { IBlock, IDefaultBlockOpt, InitialShapes } from "../types";
import { Triangle } from "./Triangle";
interface DefaultArrowOpt {
    tail: number;
    head: number;
}

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
    tail: 20,
    head: 10,
};

interface ArrowOptions extends DefaultArrowOpt, InitialShapes {}

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
    // @todo: calculate bottom of the object, and end destination of lineTo
    __drawInit() {
        // this.backgroundColor();
        const trianlge = new Triangle({
            x: this.options.x,
            y: this.options.y,
            size: this.options.head,
            color: this.options.color,
        });

        this.context.moveTo(30, 50);
        this.context.lineTo(150, 100);
        this.context.stroke();

        this.fill();
        this.stroke();
    }
}
