import { Shape } from "../Shape";
import { IBlock, BorderStyle } from "../types";

export interface RectOptions {
    // border-radius: [top-left, top-right, bottom-right, bottom-left]
    borderRadius: number[];
}
export class Rectangle extends Shape {
    constructor(options: IBlock<RectOptions>) {
        super(options);
        this.options = options;
    }

    draw(_func?: ((context: this) => void) | undefined): void {
        this.beginPath();

        this.backgroundColor();

        this.roundRect({
            x: this.canvasInit.x,
            y: this.canvasInit.y,
            width: this.canvasInit.width,
            height: this.canvasInit.height,
            borderRadius: this.borderRadius() || [0],
        });

        this.fill();
        this.stroke();
    }

    borderRadius(opt?: number[]): number[] | undefined {
        return this.__cacheOption(opt, "borderRadius", undefined);
    }
    backgroundColor(opt?: string) {
        super.fillStyle(opt);
        return this.__cacheOption(opt, "backgroundColor", "black");
    }

    border(opt?: string) {
        const border = this.__cacheOption(opt, "border", "");
        this.options.stroke = true;
        const { borderStyleArrWidth } = this.#borderParser(border);

        if (this.borderStyle() === "dotted") {
            this.lineDash(borderStyleArrWidth);
        }
        return border;
    }
    borderWidth(opt?: number) {
        const borderWidth = this.__cacheOption(opt, "borderWidth", 0);
        super.lineWidth(borderWidth);
        return borderWidth;
    }
    borderColor(opt?: string) {
        const borderColor = this.__cacheOption(opt, "borderColor", "");
        super.strokeStyle(borderColor);
        return this.options.borderColor;
    }

    borderStyle(opt?: "solid" | "dotted"): string {
        return this.__cacheOption(opt, "borderStyle", "dotted");
    }

    borderTop(opt?: string) {
        const borderTop = this.__cacheOption(opt, "borderRight", "");
        this.options.stroke = true;
        let { borderStyleArrWidth } = this.#borderParser(borderTop);
        borderStyleArrWidth.pop();
        if (this.borderStyle() === "dotted") {
            this.lineDash([
                ...borderStyleArrWidth,
                this.canvasInit.height * 2 + this.canvasInit.width,
            ]);
        } else {
            this.lineDash([
                this.canvasInit.width,
                this.canvasInit.width + 2 * this.canvasInit.height,
                0,
                0,
            ]);
        }

        return borderTop;
    }

    borderRight(opt?: string) {
        const borderRight = this.__cacheOption(opt, "borderRight", "");
        this.options.stroke = true;
        const { borderStyleArrHeight } = this.#borderParser(borderRight);
        borderStyleArrHeight.pop();

        if (this.borderStyle() === "dotted") {
            this.lineDash([
                0,
                this.canvasInit.width,
                ...borderStyleArrHeight,
                this.canvasInit.width + this.canvasInit.height,
            ]);
        } else if (this.borderStyle() === "solid") {
            this.lineDash([
                0,
                this.canvasInit.width,
                this.canvasInit.height,
                this.canvasInit.width + this.canvasInit.height,
            ]);
        }
        return borderRight;
    }
    borderBottom(opt?: string) {
        const borderBottom = this.__cacheOption(opt, "borderBottom", "");
        this.options.stroke = true;

        let { borderStyleArrWidth } = this.#borderParser(borderBottom);
        if (this.borderStyle() === "dotted") {
            this.lineDash([
                0,
                this.canvasInit.width + this.canvasInit.height,
                ...borderStyleArrWidth,
            ]);
        } else if (this.borderStyle() === "solid") {
            this.lineDash([
                0,
                this.canvasInit.width + this.canvasInit.height,
                this.canvasInit.width,
                0,
            ]);
        }

        return borderBottom;
    }
    borderLeft(opt?: string) {
        const borderLeft = this.__cacheOption(opt, "borderLeft", "");
        this.options.stroke = true;
        let { borderStyleArrHeight } = this.#borderParser(borderLeft);

        if (this.borderStyle() === "dotted") {
            this.lineDash([
                0,
                this.canvasInit.width * 2 + this.canvasInit.height,
                ...borderStyleArrHeight,
            ]);
        } else if (this.borderStyle() === "solid") {
            this.lineDash([
                0,
                this.canvasInit.width * 2 + this.canvasInit.height,
                this.canvasInit.height,
                this.canvasInit.width,
            ]);
        }
        return borderLeft;
    }
    // border size, style(required), color
    #borderParser(obj?: string) {
        const border = obj?.split(" ") || [];

        // need to impliment css unit converter for different size, ex, px, em, rem etc.
        const borderWidth = Number(border[0]);
        const borderStyle = border[1] as BorderStyle;
        const borderColor = border[2];

        const borderStyleArrWidth = [];
        const borderStyleArrHeight = [];
        if (borderStyle === "dotted") {
            let total = 0;
            const step = this.canvasInit.width / (this.canvasInit.width / 4);
            while (total < this.canvasInit.width) {
                borderStyleArrWidth.push(step, step);
                total += step * 2;
            }

            total = 0;
            const stepHeight =
                this.canvasInit.height / (this.canvasInit.height / 4);
            while (total < this.canvasInit.height) {
                borderStyleArrHeight.push(
                    stepHeight,
                    stepHeight,
                    stepHeight,
                    stepHeight
                );
                total += stepHeight * 2;
            }
        }
        this.borderWidth(borderWidth);
        this.borderStyle(borderStyle);
        this.borderColor(borderColor);
        return { borderStyleArrWidth, borderStyleArrHeight };
    }
    clip(opt?: boolean): boolean {
        return super.clip(opt);
    }
    dragX(opt?: boolean) {
        return super.dragX(opt);
    }
    dragY(opt?: boolean) {
        return super.dragY(opt);
    }
    draggable(opt?: boolean): boolean {
        return super.draggable(opt);
    }

    selectable(opt?: boolean): boolean {
        return super.selectable(opt);
    }

    set(options: IBlock<RectOptions>) {
        super.set(options);
    }
}
