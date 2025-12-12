/*
    SvgBlock is a parser for a svg elements and attributes
*/

import { Block } from "./Block";
import { IBlock } from "./types";

interface ISvgOptions {}
class SvgBlock extends Block {
    constructor(options?: IBlock<ISvgOptions>) {
        super(options);
        this.options = options || {};
    }
}
