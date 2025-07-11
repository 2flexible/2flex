import Block from "./Block";
class Page {
    width = 200;
    height = 200;
    blocks: Block[] = [];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    add(block: Block) {
        this.blocks.push(block);
    }
}

export default Page;
