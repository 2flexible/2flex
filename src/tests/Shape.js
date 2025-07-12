"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Shape = void 0;
class Shape {
    width;
    height;
    resize;
    constructor(width, height, resize = true) {
        this.width = width;
        this.height = height;
        this.resize = resize;
    }
}
exports.Shape = Shape;
