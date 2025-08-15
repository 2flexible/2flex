import { Shape } from "../Shape";
import { IBlock, IDefaultBlockOpt, InitialShapes } from "../types";

interface DefaultCircleOpt {
    radius: number;
    startAngle: number;
    endAngle: number;
}

const defaultOpt: IDefaultBlockOpt<DefaultCircleOpt> = {
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    selectable: true,
    draggable: true,
    zIndex: 0,
    dragX: true,
    dragY: true,
    radius: 10,
    startAngle: 0,
    endAngle: Math.PI * 2,
};

interface CircleOptions extends DefaultCircleOpt, InitialShapes {}

export class Circle extends Shape {
    constructor(options?: IBlock<CircleOptions>) {
        super(options);
        this.options = { ...defaultOpt, ...options };
    }
    __initSet(): void {
        super.__initSet();
    }

    __drawInit() {
        this.beginPath();
        this.backgroundColor();

        const x = this.initCords.x + this.options.radius;
        const y = this.initCords.y + this.options.radius;

        this.context.arc(
            x,
            y,
            this.options.radius,
            this.options.startAngle,
            this.options.endAngle
        );

        super.fill();
        super.stroke();
    }
    width(opt?: number) {
        this.options.radius = this.options.radius || super.width(opt);
        return this.options.radius;
    }
    height(opt?: number) {
        this.options.radius = this.options.radius || super.height(opt);
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
