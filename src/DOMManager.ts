import { ICssProperties } from "./types";

export class CanvasDOMManager {
    canvasId: string;
    width: number;
    height: number;
    #isTransparent = false;

    constructor(canvasId: string, width: number, height: number) {
        this.canvasId = canvasId;
        this.width = width;
        this.height = height;
    }

    get context(): CanvasRenderingContext2D {
        return this.canvas.getContext("2d", { alpha: this.#isTransparent })!;
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
        canvas.width = 800;
        canvas.height = 400;
        canvas.tabIndex = 0
        const body = document.querySelector("body") as HTMLElement;
        body.appendChild(canvas);
    }

    changeStyle(options: ICssProperties | undefined) {
        if (options !== undefined)
            for (const [key, value] of Object.entries(options)) {
                if (key === "backgroundColor" && value === "transparent")
                    this.#isTransparent = true;
                if (Object.hasOwn(this.canvas.style, key))
                    this.canvas.style.setProperty(key, `${value}`);
            }
    }

    addEventListener(_type: string, _func: (event: any) => void) {
        this.canvas.addEventListener(
            _type,
            (event: any) => {
                event.preventDefault();
                _func(event);
            },
            { passive: false }
        );
    }

    removeEventListener(_type: string, _func: (event: any) => void) {
        this.canvas.removeEventListener(_type, (event: any) => _func(event));
    }
}
