import { Shape } from "../Shape";
import type { RoundRectOpt, FillStyle } from "../Shape";
import type { IBlock } from "../types";
import { checkInBound } from "../Utils";

export type BorderStyle = "solid" | "dotted";

export class Rectangle extends Shape<RoundRectOpt> {
    #stroke = false;

    constructor(options: IBlock<RoundRectOpt>) {
        super(options);
    }

    draw(
        _func?: ((context: CanvasRenderingContext2D) => void) | undefined
    ): void {
        this.border();
        this.borderTop();
        this.borderBottom();
        this.borderLeft();
        this.borderRight();
        this.backgroundColor();

        // @Todo fix radius on different corners
        // @Todo fix differnet borderBottoms
        const radius = this.borderRadius();
        this.context.moveTo(
            this.cornerTopLeft().x + radius[0],
            this.cornerTopLeft().y
        );
        this.context.lineTo(
            this.cornerTopRight().x - radius[1],
            this.cornerTopRight().y
        );
        this.context.arcTo(
            this.cornerTopRight().x,
            this.cornerTopRight().y,
            this.cornerBottomRight().x,
            this.cornerBottomRight().y,
            radius[1]
        );
        this.context.lineTo(
            this.cornerBottomRight().x,
            this.cornerBottomRight().y - radius[2]
        );
        this.context.arcTo(
            this.cornerBottomRight().x,
            this.cornerBottomRight().y,
            this.cornerBottomRight().x - radius[3],
            this.cornerBottomRight().y,
            radius[2]
        );
        this.context.lineTo(
            this.cornerBottomLeft().x + radius[3],
            this.cornerBottomLeft().y
        );
        this.context.arcTo(
            this.cornerBottomLeft().x,
            this.cornerBottomLeft().y,
            this.cornerTopLeft().x,
            this.cornerTopLeft().y - radius[2],
            radius[3]
        );
        this.context.lineTo(
            this.cornerTopLeft().x,
            this.cornerTopLeft().y + radius[3]
        );
        this.context.arcTo(
            this.cornerTopLeft().x,
            this.cornerTopLeft().y,
            this.cornerTopRight().x + radius[3],
            this.cornerTopRight().y,
            radius[3]
        );

        super.fill(true);
        this.#stroke = false;
    }
    borderRadius(opt?: number[]): number[] {
        const radius = this.__valueHandler(opt, "borderRadius", [0, 0, 0, 0]);
        let defRadius: number[] = radius;
        switch (radius.length) {
            case 1:
                defRadius = [radius[0], radius[0], radius[0], radius[0]];
                break;
            case 2:
                defRadius = [radius[0], radius[0], radius[1], radius[1]];
                break;
            case 3:
                defRadius = [radius[0], radius[0], radius[1], radius[2]];
                break;
        }
        return defRadius;
    }

    #applyStroke() {
        if (this.#stroke) return;
        super.stroke();
        this.#stroke = true;
    }
    backgroundColor(opt?: FillStyle) {
        const bg = this.__valueHandler(opt, "backgroundColor", "black");
        super.fillStyle(bg);
        return bg;
    }

    border(opt?: string) {
        const border = this.__valueHandler(opt, "border", undefined);
        if (border) {
            const { borderStyleArrWidth } = this.#borderParser(border);
            if (this.borderStyle() === "dotted") {
                this.lineDash(borderStyleArrWidth);
            }
            this.#applyStroke();
        }
        return border;
    }
    borderWidth(opt?: number) {
        const borderWidth = this.__valueHandler(opt, "borderWidth", 0);
        super.lineWidth(borderWidth);
        return borderWidth;
    }
    borderColor(opt?: string) {
        const borderColor = this.__valueHandler(opt, "borderColor", "black");
        super.strokeStyle(borderColor);
        return borderColor;
    }

    borderStyle(opt?: BorderStyle): BorderStyle {
        return this.__valueHandler(opt, "borderStyle", "solid");
    }
    borderTop(opt?: string) {
        const borderTop = this.__valueHandler(opt, "borderRight", undefined);
        if (borderTop) {
            let { borderStyleArrWidth } = this.#borderParser(borderTop);
            borderStyleArrWidth.pop();
            if (this.borderStyle() === "dotted") {
                this.lineDash([
                    ...borderStyleArrWidth,
                    this.height() * 2 + this.width(),
                ]);
            } else {
                this.lineDash([
                    this.width(),
                    this.width() + 2 * this.height(),
                    0,
                    0,
                ]);
            }
            this.#applyStroke();
        }

        return borderTop;
    }

    borderRight(opt?: string) {
        const borderRight = this.__valueHandler(opt, "borderRight", undefined);

        if (borderRight) {
            const { borderStyleArrHeight } = this.#borderParser(borderRight);
            borderStyleArrHeight.pop();

            if (this.borderStyle() === "dotted") {
                this.lineDash([
                    0,
                    this.width(),
                    ...borderStyleArrHeight,
                    this.width() + this.height(),
                ]);
            } else if (this.borderStyle() === "solid") {
                this.lineDash([
                    0,
                    this.width(),
                    this.height(),
                    this.width() + this.height(),
                ]);
            }
            this.#applyStroke();
        }
        return borderRight;
    }
    borderBottom(opt?: string) {
        const borderBottom = this.__valueHandler(
            opt,
            "borderBottom",
            undefined
        );
        if (borderBottom) {
            let { borderStyleArrWidth } = this.#borderParser(borderBottom);
            if (this.borderStyle() === "dotted") {
                this.lineDash([
                    0,
                    this.width() + this.height(),
                    ...borderStyleArrWidth,
                ]);
            } else if (this.borderStyle() === "solid") {
                this.lineDash([
                    0,
                    this.width() + this.height(),
                    this.width(),
                    0,
                ]);
            }
            this.#applyStroke();
        }
        return borderBottom;
    }
    borderLeft(opt?: string) {
        const borderLeft = this.__valueHandler(opt, "borderLeft", undefined);
        if (borderLeft) {
            let { borderStyleArrHeight } = this.#borderParser(borderLeft);

            if (this.borderStyle() === "dotted") {
                this.lineDash([
                    0,
                    this.width() * 2 + this.height(),
                    ...borderStyleArrHeight,
                ]);
            } else if (this.borderStyle() === "solid") {
                this.lineDash([
                    0,
                    this.width() * 2 + this.height(),
                    this.height(),
                    this.width(),
                ]);
            }
            this.#applyStroke();
        }
        return borderLeft;
    }
    // border size, style(required), color
    #borderParser(obj?: string) {
        const border = obj?.split(" ") || [];

        const borderWidth = this.__unitConverter<string, number>({
            val: border[0],
            widthRelated: true,
        });
        const borderStyle = border[1] as BorderStyle;
        const borderColor = border[2];

        const borderStyleArrWidth = [];
        const borderStyleArrHeight = [];
        if (borderStyle === "dotted") {
            let total = 0;
            const step = this.width() / (this.width() / 4);
            while (total < this.width()) {
                borderStyleArrWidth.push(step, step);
                total += step * 2;
            }

            total = 0;
            const stepHeight = this.height() / (this.height() / 4);
            while (total < this.height()) {
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

    // @TODO: need to adjust border with to the x and width so corners will change related to this value

    // x(opt?: number | string): number {
    //     const cacheX = this.ownOptions["x"] || 0;
    //     let x = this.__valueHandler(opt, "x", 0, true)
    //     const diffX = x - cacheX;
    //     if (diffX !== 0) x = this.borderWidth() / 2 + diffX;
    //     return super.x(x)
    // }

    hotAreaGap(opt?: number): number {
        return super.hotAreaGap((opt || 0) + this.borderWidth() / 2);
    }
}
