import { Shape } from "../Shape";
import { IBlock } from "../types";

interface CircleOptions {
    radius?: number;
    radiusX?: number;
    radiusY?: number;
    startAngle?: number;
    endAngle?: number;
}

export class Circle extends Shape {
    constructor(options: IBlock<CircleOptions>) {
        super(options);
        this.options = options;
    }
    draw(_func?: ((context: this) => void) | undefined): void {
        this.beginPath();
        this.backgroundColor();

        this.canvasInit.width = this.canvasInit.width || this.radiusX();
        this.canvasInit.height = this.canvasInit.height || this.radiusY();
        this.context.ellipse(
            this.canvasInit.x + this.canvasInit.width + this.lineWidth(),
            this.canvasInit.y + this.canvasInit.height + this.lineWidth(),
            this.canvasInit.width,
            this.canvasInit.height,
            this.rotation(),
            this.startAngle(),
            this.endAngle()
        );

        super.fill();
        super.stroke();
    }

    radius(opt?: number) {
        const radius = this.__cacheOption(opt, "radius", 0);
        this.radiusX(radius);
        this.radiusY(radius);
        return radius;
    }
    radiusX(opt?: number) {
        return this.__cacheOption(opt, "radiusX", 0);
    }
    radiusY(opt?: number) {
        return this.__cacheOption(opt, "radiusY", 0);
    }
    rotation(opt?: number) {
        return this.__cacheOption(opt, "rotation", 0);
    }
    startAngle(opt?: number) {
        return this.__cacheOption(opt, "startAngle", 0);
    }
    endAngle(opt?: number) {
        return this.__cacheOption(opt, "endAngle", Math.PI * 2);
    }
    backgroundColor(opt?: string) {
        const backgroundColor = this.__cacheOption(
            opt,
            "backgroundColor",
            "black"
        );
        super.fillStyle(backgroundColor);
        return backgroundColor;
    }
    borderWidth(opt?: number) {
        const borderWidth = this.__cacheOption(opt, "backgroundColor", 0);
        super.lineWidth(borderWidth);
        return borderWidth;
    }
    borderColor(opt?: string) {
        const borderColor = this.__cacheOption(opt, "borderColor", "black");
        super.strokeStyle(borderColor);
        return borderColor;
    }
    dragX(opt?: boolean) {
        return super.dragX(opt);
    }
    dragY(opt?: boolean) {
        return super.dragY(opt);
    }
    draggable(opt: boolean): boolean {
        return super.draggable(opt);
    }
    selectable(opt?: boolean): boolean {
        return super.selectable(opt);
    }
    set(options: IBlock<CircleOptions>) {
        super.set(options);
    }
}
