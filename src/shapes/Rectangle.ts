import { Block } from "../Block";
import { Shape } from "../Shape";
import { BlockOptions, IBlock } from "../types";

export interface defaultBlockOptions {
    [key: string]: any;
    x: number;
    y: number;
    width: number;
    height: number;
    selectable: boolean;
    // border-radius: [top-left, top-right, bottom-right, bottom-left]
    borderRadius: number[];
}

const defaultOpt: defaultBlockOptions = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    selectable: true,
    borderRadius: [0],
};

export class Rectangle extends Block {
    options: defaultBlockOptions;

    constructor(options?: IBlock<BlockOptions>) {
        super(options);
        this.options = { ...defaultOpt, ...options };
    }
    __initSet(): void {
        if (this.options.color) {
            this.drawRectangle();
        }
        if (this.options.stroke || this.options.strokeColor) {
            this.stroke();
        }
    }

    drawRectangle() {
        this.context.beginPath();
        super.color();

        this.context.roundRect(
            this.options.x,
            this.options.y,
            this.options.width,
            this.options.height,
            this.options.radius
        );
        super.fill();
    }

    x(option?: number): number {
        return super.x(option);
    }

    y(option?: number): number {
        return super.y(option);
    }

    width(option?: number): number {
        return super.width(option);
    }
    height(option?: number): number {
        return super.height(option);
    }

    color(option?: string) {
        return super.color(option);
    }
    stroke(option?: number) {
        // this.context.beginPath();
        const stroke = super.stroke(option);
        
        super.strokeColor();
        
        this.context.stroke();
        
        // this.context.strokeRect(
        //     this.options.x,
        //     this.options.y,
        //     this.options.width,
        //     this.options.height
        // );
        return stroke;
    }
    draggable(option: boolean): boolean {
        return super.draggable(option);
    }

    selectable(option?: boolean): boolean {
        return super.selectable(option);
    }

    set(options: IBlock<BlockOptions>) {
        super.set(options);
    }
}
