import { Block } from "./Block";
import { BlockOptions, IBlock } from "./types";

// each shape extends form common shape
export class Shape extends Block {
    constructor(options: IBlock<BlockOptions> | undefined = undefined) {
        super(options);
    }
    lineWidth() {
        this.context.lineWidth = this.options.lineWidth!;
    }
    strokeWidth(option?: number) {
        this.context.lineWidth = this.options.strokeWidth || option;
    }
    fill() {}
    color(option?: string) {
        super.color(option);
        super.fill();
    }
}
