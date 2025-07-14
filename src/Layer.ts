// Layer spesical type of block whcih defines group of blocks
import { Block } from "./Block";
import { BlockOptions } from "./types";

export class Layer extends Block<BlockOptions> {
    constructor(options: BlockOptions) {
        super(options);
    }
}
