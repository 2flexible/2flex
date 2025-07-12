// Layer spesical type of block whcih defines group of blocks
import { Block } from "./Block";

class Layer extends Block {
    width = 200;
    height = 200;
    blocks: Block[] = [];
    _type = "layer";

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        resize: boolean
    ) {
        super(x, y, resize);
        this.width = width;
        this.height = height;
    }

    add(block: Block) {
        this.blocks.push(block);
    }
}

export default Layer;
