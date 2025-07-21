export class CanvasDOMManager {
    constructor() {}

    get context(): CanvasRenderingContext2D | null {
        return this.canvas.getContext("2d");
    }

    get canvas(): HTMLCanvasElement {
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        if (!canvas) {
            this.createCanvas();
        }
        return canvas;
    }
    createCanvas() {
        const canvas = document.createElement("canvas") as HTMLCanvasElement;
        canvas.id = "canvas";
        const body = document.querySelector("body") as HTMLElement;
        body.appendChild(canvas);
    }

    changeStyle() {
        this.canvas.style;
    }
}
