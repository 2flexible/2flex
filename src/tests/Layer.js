"use strict";
// Layer spesical type of block whcih defines group of blocks
Object.defineProperty(exports, "__esModule", { value: true });
class Page {
    width = 200;
    height = 200;
    blocks = [];
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
    add(block) {
        this.blocks.push(block);
    }
}
exports.default = Page;
