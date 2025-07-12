"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const canvas_1 = require("canvas");
class Canvas {
    width;
    height;
    layers = [];
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
    getCanvas() {
        const canvas = (0, canvas_1.createCanvas)(this.width, this.height);
        const ctx = canvas.getContext("2d");
        return ctx;
    }
    add(layer) {
        this.layers.push(layer);
    }
}
exports.default = Canvas;
