"use strict";
class Shape {
    constructor({ x, y, width, height, resize = true }) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.resize = resize;
    }
}
