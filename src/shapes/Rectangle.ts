import { Shape } from "../Shape";
import { IBlock, BorderStyle, RoundRectOpt, Position } from "../types";

export class Rectangle extends Shape {
    constructor(options: IBlock<RoundRectOpt>) {
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

    resizable(opt?: boolean): boolean {
        return super.resizable(opt);
    }
    hotAreaGap(opt?: number): number {
        return super.hotAreaGap(opt);
    }
    rotatable(opt?: boolean): boolean {
        return super.rotatable(opt);
    }
    rotate(opt?: number): number {
        return super.rotate(opt);
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
    position(opt?: Position) {
        return this.__cacheOption(opt, "position", "static");
    }
    top(opt?: number) {
        if (this.position() === "static") opt = 0;
        return this.__cacheOption(opt, "top", 0);
    }
    bottom(opt?: number) {
        if (this.position() === "static") opt = 0;
        return this.__cacheOption(opt, "bottom", 0);
    }
    left(opt?: number) {
        if (this.position() === "static") opt = 0;
        return this.__cacheOption(opt, "left", 0);
    }
    right(opt?: number) {
        if (this.position() === "static") opt = 0;
        return this.__cacheOption(opt, "right", 0);
    }
    shadowBlur(opt?: number): number {
        return super.shadowBlur(opt);
    }
    shadowColor(opt?: string): string {
        return super.shadowColor(opt);
    }
    shadowOffsetX(opt?: number): number {
        return super.shadowOffsetX(opt);
    }
    shadowOffsetY(opt?: number): number {
        return super.shadowOffsetY(opt);
    }
    blur(opt?: number): number {
        return super.blur(opt);
    }
    brightness(opt?: number): number {
        return super.brightness(opt);
    }
    contrast(opt?: number): number {
        return super.contrast(opt);
    }
    dropShadow(opt?: [number, number, number, string][]) {
        return super.dropShadow(opt);
    }
    grayscale(opt?: number): number {
        return super.grayscale(opt);
    }
    hueRotate(opt?: number): number {
        return super.hueRotate(opt);
    }
    opacity(opt?: number): number {
        return super.opacity(opt);
    }
    sepia(opt?: number): number {
        return super.sepia(opt);
    }
    padding(opt?: number[]): number[] | undefined {
        return super.padding(opt);
    }
    paddingLeft(opt?: number): number {
        return super.paddingLeft(opt);
    }
    paddingTop(opt?: number): number {
        return super.paddingTop(opt);
    }
    paddingBottom(opt?: number): number {
        return super.paddingBottom(opt);
    }
    paddingRight(opt?: number): number {
        return super.paddingRight(opt);
    }
    margin(opt?: number[]): number[] | undefined {
        return super.margin(opt);
    }
    marginLeft(opt?: number): number {
        return super.marginLeft(opt);
    }
    marginTop(opt?: number): number {
        return super.marginTop(opt);
    }
    marginBottom(opt?: number): number {
        return super.marginBottom(opt);
    }
    marginRight(opt?: number): number {
        return super.marginRight(opt);
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

    set(options: IBlock<RoundRectOpt>) {
        super.set(options);
    }
}
