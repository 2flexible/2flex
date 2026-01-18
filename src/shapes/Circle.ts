import { Shape } from "../Shape";
import type { IBlock } from "../types";

interface CircleOptions {
    radius?: number;
    radiusX?: number;
    radiusY?: number;
    startAngle?: number;
    endAngle?: number;
}

export class Circle extends Shape<CircleOptions> {
    constructor(options: IBlock<CircleOptions>) {
        super(options);
    }
    draw(
        _func?: ((context: CanvasRenderingContext2D) => void) | undefined
    ): void {
        this.beginPath();
        this.backgroundColor();

        this.width(this.width() || this.radiusX());
        this.height(this.height() || this.radiusY());
        this.context.ellipse(
            this.x() + this.width() + this.lineWidth(),
            this.y() + this.height() + this.lineWidth(),
            this.width(),
            this.height(),
            this.rotate(),
            this.startAngle(),
            this.endAngle()
        );

        super.fill();
        super.stroke();
    }

    radius(opt?: number) {
        const radius = this.__valueHandler(opt, "radius", 0);
        this.radiusX(radius);
        this.radiusY(radius);
        return radius;
    }
    radiusX(opt?: number) {
        return this.__valueHandler(opt, "radiusX", 0);
    }
    radiusY(opt?: number) {
        return this.__valueHandler(opt, "radiusY", 0);
    }
    startAngle(opt?: number) {
        return this.__valueHandler(opt, "startAngle", 0);
    }
    endAngle(opt?: number) {
        return this.__valueHandler(opt, "endAngle", Math.PI * 2);
    }
    backgroundColor(opt?: string) {
        const backgroundColor = this.__valueHandler(
            opt,
            "backgroundColor",
            "black"
        );
        super.fillStyle(backgroundColor);
        return backgroundColor;
    }
    borderWidth(opt?: number) {
        const borderWidth = this.__valueHandler(opt, "backgroundColor", 0);
        super.lineWidth(borderWidth);
        return borderWidth;
    }
}
