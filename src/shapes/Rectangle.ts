import { Shape } from "../Shape";
import { BlockOptions, IBlock } from "../types";

export class Rectangle extends Shape {
    constructor(options: IBlock<BlockOptions> | undefined = undefined) {
        super(options);
    }
    __initSet(): void {
        this.drawRectangle();
    }

    drawRectangle() {
        this.context.beginPath();
        // need to chagne to defautl values write custom getter
        this.context.fillStyle = this.options.color || "black";

        this.context.rect(
            this.options.x,
            this.options.y,
            this.options.width,
            this.options.height
        );
        this.context.fill();
    }
}
