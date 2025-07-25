import { CanvasOptions } from "./types";

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

    set canvas(canvas: HTMLCanvasElement) {
        const body = document.querySelector("body") as HTMLElement;
        body.appendChild(canvas);
    }

    createCanvas() {
        const canvas = document.createElement("canvas") as HTMLCanvasElement;
        canvas.id = "canvas";
        const body = document.querySelector("body") as HTMLElement;
        body.appendChild(canvas);
    }

    changeStyle(options: CanvasOptions) {
        for (const [key, value] of Object.entries(options)) {
            this.canvas.style.setProperty(key, value);
        }
    }

    addEventListener(_type: string, _func: (event: any) => void) {
        this.canvas.addEventListener(_type, (event: any) => _func(event));
    }

    removeEventListener(_type: string, _func: (event: any) => void) {
        this.canvas.removeEventListener(_type, (event: any) => _func(event));
    }
}
