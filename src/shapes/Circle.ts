import { Shape } from "../Shape";
import { IBlock } from "../types";

interface CircleOptions {
    radius?: number;
    startAngle?: number;
    endAngle?: number;
}

export class Circle extends Shape {
    constructor(options: IBlock<CircleOptions>) {
        super(options);
        this.options = options;
    }
    __initSet(): void {
        super.__initSet();
    }

    __drawInit() {
        this.beginPath();
        this.backgroundColor();

        const x = this.canvasInit.x + this.options.radius;
        const y = this.canvasInit.y + this.options.radius;
        let endAngle;
        if (!this.options.endAngle) endAngle = Math.PI * 2;
        this.context.arc(
            x,
            y,
            this.options.radius,
            this.options.startAngle,
            endAngle
        );

        super.fill();
        super.stroke();
    }
    radius(opt?: number) {
        return this.__cacheOption(opt, this.options.radius, 0);
    }
    startAngle(opt?: number) {
        return this.__cacheOption(opt, this.options.startAngle, 0);
    }
    endAngle(opt?: number) {
        return this.__cacheOption(opt, this.options.endAngle, 0);
    }
    width(opt?: number) {
        this.options.radius = this.options.radius || this.canvasInit.width;
        return this.options.radius;
    }
    height(opt?: number) {
        this.options.radius = this.options.radius || this.canvasInit.height;
        return this.options.radius;
    }
    backgroundColor(opt?: string) {
        this.options.backgroundColor = super.fillStyle(opt);
        return this.options.backgroundColor;
    }
    borderWidth(opt?: number) {
        this.options.borderWidth = super.lineWidth(opt);
        return this.options.borderWidth;
    }
    borderColor(opt?: string) {
        this.options.borderColor = super.strokeStyle(opt);
        return this.options.borderColor;
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
