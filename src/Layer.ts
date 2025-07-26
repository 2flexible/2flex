import { Block } from "./Block";
import { BlockOptions } from "./types";

// Layer spesical type of block whcih defines group of blocks
export class Layer extends Block {
    constructor(options: BlockOptions) {
        super(options);
    }
    __initSet() {
        const all_childs = this.find();
        all_childs?.forEach((item: any) => {
            item.options.x = this.options.x + item.options.x;
            item.options.y = this.options.y + item.options.y;
        });
    }
}
