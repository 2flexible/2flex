import { Block } from "./Block";
import { BlockOptions, BlockElements } from "./types";

// each shape extends form common shape
export class Shape extends Block {
    constructor(options: BlockOptions) {
        super(options);
    }
    lineWidth() {
        this.context.lineWidth = this.options.lineWidth!;
    }
}
