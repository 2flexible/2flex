import { IShapeOptions, Shape } from "../Shape";
import { IBlock, BorderStyle, InitialShapes } from "../types";

export interface RectOpt {
    // border-radius: [top-left, top-right, bottom-right, bottom-left]
    borderRadius: number[];
}
export class Rectangle extends Shape {
    constructor(options: IBlock<RectOpt>) {
        super(options);
        this.options = options;
    }
    __initSet(): void {
        super.__initSet();
    }

    __drawInit() {
        this.beginPath();

        this.backgroundColor();

        this.#drawRect();

        this.fill();
        this.stroke();
    }

    #drawRect() {
        this.roundRect({
            x: this.canvasInit.x,
            y: this.canvasInit.y,
            width: this.canvasInit.width,
            height: this.canvasInit.height,
            borderRadius: this.borderRadius() || [0],
        });
    }

    borderRadius(opt?: number[]): number[] | undefined {
        return this.__cacheOption(opt, this.options.borderRadius, undefined);
    }
    backgroundColor(opt?: string) {
        super.fillStyle(opt);
        return this.__cacheOption(opt, this.options.backgroundColor, "black");
    }

    border(opt?: string) {
        const border = this.__cacheOption(opt, this.options.border, []);
        const { borderStyleArrWidth } = this.#borderParser(border);

        if (this.options.borderStyle === "dotted") {
            this.lineDash(borderStyleArrWidth);
        }
        return border;
    }
    borderWidth(opt?: number) {
        this.options.borderWidth = super.lineWidth(opt);
        return this.options.borderWidth;
    }
    borderColor(opt?: string) {
        this.options.borderColor = super.strokeStyle(opt);
        return this.options.borderColor;
    }

    borderStyle(opt?: "solid" | "dotted") {
        return this.__cacheOption(opt, this.options.borderStyle, "solid");
    }

    borderTop(opt?: number) {
        const borderTop = this.__cacheOption(opt, this.options.borderRight, 0);
        this.options.borderTop = opt || this.options.borderTop;
        let { borderStyleArrWidth } = this.#borderParser(borderTop);
        borderStyleArrWidth.pop();

        if (this.options.borderStyle === "dotted") {
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

        this.#drawRect();
        super.stroke(true);
        return borderTop;
    }

    borderRight(opt?: number) {
        const borderRight = this.__cacheOption(
            opt,
            this.options.borderRight,
            0
        );
        const { borderStyleArrHeight } = this.#borderParser(borderRight);
        borderStyleArrHeight.pop();

        if (this.options.borderStyle === "dotted") {
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
                this.canvasInit.width,
            ]);
        }
        this.#drawRect();
        super.stroke(true);
        return borderRight;
    }
    borderBottom(opt?: number) {
        const borderBottom = this.__cacheOption(
            opt,
            this.options.borderBottom,
            0
        );

        let { borderStyleArrWidth } = this.#borderParser(borderBottom);
        if (this.options.borderStyle === "dotted") {
            this.lineDash([
                0,
                this.canvasInit.width + this.canvasInit.height,
                ...borderStyleArrWidth,
            ]);
        } else if (this.options.borderStyle === "solid") {
            this.lineDash([
                0,
                this.canvasInit.width + this.canvasInit.height,
                this.canvasInit.width,
                0,
            ]);
        }

        this.#drawRect();
        super.stroke(true);
        return borderBottom;
    }
    borderLeft(opt?: number) {
        const borderLeft = this.__cacheOption(opt, this.options.borderLeft, 0);
        let { borderStyleArrHeight } = this.#borderParser(borderLeft);

        if (this.options.borderStyle === "dotted") {
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
        this.#drawRect();
        super.stroke(true);
        return borderLeft;
    }
    // border size, style(required), color
    #borderParser(obj?: string) {
        const border = obj?.split(" ") || [];

        // need to impliment css unit converter for different size, ex, px, em, rem etc.
        const borderWitdh = Number(border[0]);
        const borderStyle = border[1] as BorderStyle;
        const borderColor = border[2];

        const borderStyleArrWidth = [];
        const borderStyleArrHeight = [];

        if (borderStyle === "dotted") {
            let total = 0;
            const step = this.canvasInit.width / 21;
            while (total < this.canvasInit.width) {
                borderStyleArrWidth.push(step, step);
                total += step * 2;
            }

            total = 0;
            const stepHeight = this.canvasInit.height / 21;
            while (total < this.canvasInit.height) {
                borderStyleArrHeight.push(stepHeight, stepHeight);
                total += stepHeight * 2;
            }
        }
        this.borderWidth(borderWitdh);
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

    set(options: IBlock<RectOpt>) {
        super.set(options);
    }
}
