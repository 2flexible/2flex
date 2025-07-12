"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Block = void 0;
class Block {
    elements = [];
    block_type;
    x = 0;
    y = 0;
    resize = true;
    constructor(block_type, x = 0, y = 0, resize = false) {
        this.block_type = block_type;
        this.x = x;
        this.y = y;
    }
    add(element) {
        this.elements.push(element);
    }
    resizeBox(width, height, x, y) { }
}
exports.Block = Block;
// export interface BlockInterface extends Block {
//     width: number;
//     height: number;
// }
