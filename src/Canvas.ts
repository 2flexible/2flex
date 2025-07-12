import { createCanvas } from "canvas";
import Layer from "./Layer";
import { Tree } from "./Tree";
// const canvas = createCanvas(200, 200)
// const ctx = canvas.getContext("2d")

interface CanvasInterface {
    width: number;
    heihgt: number;
}

class Canvas {
    width: number;
    height: number;

    // layers: Layer[] = [];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    getCanvas() {
        const canvas = createCanvas(this.width, this.height);
        const ctx = canvas.getContext("2d");
        return ctx;
    }

    add(layer: Layer) {
        this.layers.push(layer);
    }
}
export default Canvas;
