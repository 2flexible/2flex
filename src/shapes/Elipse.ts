import { Shape } from "../Shape";
import { IBlock, IDefaultBlockOpt } from "../types";

interface DefaultElipseOpt {
    radiusX: number;
    radiusY: number;
    rotation: number;
}

const defaultOpt: IDefaultBlockOpt<DefaultElipseOpt> = {
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
    radiusX: 10,
    radiusY: 10,
    rotation: 0,
};

interface ElipseOptions extends DefaultElipseOpt {}

export class Elipse extends Shape {
    constructor(options?: IBlock<ElipseOptions>) {
        super(options);
        this.options = { ...defaultOpt, ...options };
        Elipse.prototype.draggable = Shape.prototype.draggable;
        // Object.assign(Rectangle.prototype)
    }
    __initSet(): void {
        super.__initSet();
    }

    draw() {
        this.color();
        // cordinates need to calculate related to radius x and radius y
        this.context.ellipse(
            this.initCords.x,
            this.initCords.y,
            this.options.radiusX,
            this.options.radiusY,
            this.options.rotation,
            0,
            2 * Math.PI
        );
        this.fill();
        this.stroke();
    }
}
