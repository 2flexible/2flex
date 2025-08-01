import { Block } from "./Block";
import { IBlock } from "./types";

interface ILayout {
    layout: string;
}
// Layer spesical type of block whcih defines group of blocks
export class Layout extends Block {
    constructor(options: IBlock<ILayout>) {
        super(options);
    }
    __initSet() {}
}
