// import { createCanvas } from "canvas";

import { createCanvas } from "canvas";
import Page from "./Layer";
// const canvas = createCanvas(200, 200)
// const ctx = canvas.getContext("2d")

class Canvas {
    // default height, width
    width = 200;
    height = 200;
    pages: Page[] = [];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    getCanvas() {
        const canvas = createCanvas(this.width, this.height);
        const ctx = canvas.getContext("2d");
        return ctx;
    }

    add(page: Page) {
        this.pages.push(page);
    }

    #node() {
        const node_list = [];
        for (let layer of this.pages) {
        }
    }

    #tree() {}
}
export default Canvas;
