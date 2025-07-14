import { Block } from "./Block";
import { BlockOptions, BlockElements } from "./types";

// each shape extends form common shape
export class Shape extends Block<BlockElements> {
    constructor(options: BlockOptions) {
        super(options);
    }
}
