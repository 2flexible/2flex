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
        this.context.ellipse(
            this.getCenterX,
            this.getCenterY,
            this.radiusX() / 2,
            this.radiusY() / 2,
            this.rotate(),
            this.startAngle(),
            this.endAngle()
        );
    }
    radius(opt?: number) {
        const radius = this.__valueHandler(opt, "radius", 0);
        this.radiusX(radius);
        this.radiusY(radius);
        return radius;
    }
    radiusX(opt?: number) {
        const cacheR = this.rotate();
        this.rotate(0);
        const r = this.__valueHandler(opt, "radiusX", 0);
        const diffR = this.width() - r;
        this.rotate(cacheR);
        if (diffR !== 0) return r + diffR;
        return r;
    }
    radiusY(opt?: number) {
        const cacheR = this.rotate();
        this.rotate(0);
        const r = this.__valueHandler(opt, "radiusY", 0);
        const diffR = this.height() - r;
        this.rotate(cacheR);
        if (diffR !== 0) return r + diffR;
        return r;
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
        this.fill(true);
        return backgroundColor;
    }
    borderWidth(opt?: number) {
        const borderWidth = this.__valueHandler(opt, "backgroundColor", 0);
        super.lineWidth(borderWidth);
        return borderWidth;
    }
}
