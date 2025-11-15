import { Shape } from "../Shape";
import { IBlock } from "../types";

interface EllipseOptions {
    radiusX: number;
    radiusY: number;
    rotation: number;
}

export class Ellipse extends Shape {
    constructor(options: IBlock<EllipseOptions>) {
        super(options);
        this.options = options;
        Ellipse.prototype.draggable = Shape.prototype.draggable;
    }
    __initSet(): void {
        super.__initSet();
    }

    __drawInit() {
        this.beginPath();
        this.backgroundColor();
        // cordinates need to calculate related to radius x and radius y
        this.context.ellipse(
            this.canvasInit.x,
            this.canvasInit.y,
            this.options.radiusX,
            this.options.radiusY,
            this.options.rotation,
            0,
            2 * Math.PI
        );
        this.fill();
        this.stroke();
    }
    backgroundColor(opt?: string) {
        this.options.backgroundColor = super.fillStyle(opt);
        return this.options.backgroundColor;
    }
}
