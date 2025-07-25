import { ICssProperties } from "./types";

export class CanvasDOMManager {
    canvasId: string;
    constructor(canvasId: string) {
        this.canvasId = canvasId;
    }

    get context(): CanvasRenderingContext2D {
        return this.canvas.getContext("2d")!;
    }

    get canvas(): HTMLCanvasElement {
        const canvas = document.getElementById(
            this.canvasId
        ) as HTMLCanvasElement;
        if (!canvas) {
            this.createCanvas();
        }
        return canvas;
    }

    // set canvas(canvas: HTMLCanvasElement) {
    //     const body = document.querySelector("body") as HTMLElement;
    //     body.appendChild(canvas);
    // }

    createCanvas() {
        const canvas = document.createElement("canvas") as HTMLCanvasElement;
        canvas.id = this.canvasId;
        const body = document.querySelector("body") as HTMLElement;
        body.appendChild(canvas);
    }

    changeStyle(options: ICssProperties | undefined) {
        if (options !== undefined)
            for (const [key, value] of Object.entries(options)) {
                this.canvas.style.setProperty(key, `${value}`);
            }
    }

    addEventListener(_type: string, _func: (event: any) => void) {
        this.canvas.addEventListener(_type, (event: any) => _func(event));
    }

    removeEventListener(_type: string, _func: (event: any) => void) {
        this.canvas.removeEventListener(_type, (event: any) => _func(event));
    }
}
