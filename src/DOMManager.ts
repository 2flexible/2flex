import { ICssProperties } from "./types";

interface ContextParamas {
    alpha?: boolean;
    colorSpace?: "srgb" | "display-p3";
    colorType?: "unorm8" | "float16";
    desynchronized?: boolean;
    willReadFrequently?: boolean;
}

export class CanvasDOMManager {
    canvasId: string;
    width: number;
    height: number;
    contextParams: ContextParamas = {
        alpha: true,
        colorSpace: "srgb",
        colorType: "unorm8",
        desynchronized: false,
        willReadFrequently: false,
    };

    constructor(canvasId: string, width: number, height: number) {
        this.canvasId = canvasId;
        this.width = width;
        this.height = height;
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

    get context(): CanvasRenderingContext2D {
        return this.canvas.getContext("2d", this.contextParams)!;
    }

    get pixelRatio() {
        return window.devicePixelRatio || 1;
    }

    createCanvas() {
        const canvas = document.createElement("canvas") as HTMLCanvasElement;
        canvas.id = this.canvasId;
        canvas.tabIndex = 0;
        canvas.width = this.width * this.pixelRatio;
        canvas.height = this.height * this.pixelRatio;
        canvas.style.width = this.width + "px";
        canvas.style.height = this.height + "px";
        document.querySelector("body")?.appendChild(canvas);
    }

    changeStyle(options: ICssProperties) {
        for (const [key, value] of Object.entries(options)) {
            if (Object.hasOwn(this.canvas.style, key))
                this.canvas.style.setProperty(key, value as string);
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
