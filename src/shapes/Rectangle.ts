import { Shape } from "../Shape";
import type { FillStyle } from "../Shape";
import type { IBlock } from "../types";

export type BorderStyle = "solid" | "dotted";

export interface IRectangleOptions {
    // border-radius: [top-left, top-right, bottom-right, bottom-left]
    borderRadius: number[];
    borderStyle: BorderStyle;
    borderWidth: number;
    borderColor: string;
    backgroundColor: number;
    border: string;
    borderTop: string;
    borderBottom: string;
    borderLeft: string;
    borderRight: string;
}

export class Rectangle extends Shape<IRectangleOptions> {
    constructor(options: IBlock<IRectangleOptions>) {
        super(options);
    }

    draw(
        _func?: ((context: CanvasRenderingContext2D) => void) | undefined
    ): void {
        // @Todo fix differnet borderBottoms
        const radius = this.borderRadius();
        this.context.beginPath();
        const cacheR = this.rotate();
        this.rotate(0);
        const topRightC1 = this.__rotateCorners(
            this.cornerTopRight().x - radius[1],
            this.cornerTopRight().y,
            cacheR
        );

        const bottomRightC1 = this.__rotateCorners(
            this.cornerBottomRight().x,
            this.cornerBottomRight().y + radius[1],
            cacheR
        );

        const topRightC2 = this.__rotateCorners(
            this.cornerTopLeft().x + radius[0],
            this.cornerTopLeft().y,
            cacheR
        );

        const bottomRightC2 = this.__rotateCorners(
            this.cornerBottomRight().x,
            this.cornerBottomRight().y - radius[2],
            cacheR
        );
        const bottomRightC0 = this.__rotateCorners(
            this.cornerBottomRight().x- radius[2],
            this.cornerBottomRight().y ,
            cacheR
        );

        const topLeftC2 = this.__rotateCorners(
            this.cornerTopLeft().x,
            this.cornerTopLeft().y + radius[0],
            cacheR
        );

        const topLeftC0 = this.__rotateCorners(
            this.cornerTopLeft().x + radius[0],
            this.cornerTopLeft().y,
            cacheR
        );

        const topLeftC3 = this.__rotateCorners(
            this.cornerBottomLeft().x,
            this.cornerBottomLeft().y - radius[3],
            cacheR
        );

        const bottomLeftC2 = this.__rotateCorners(
            this.cornerBottomLeft().x + radius[3],
            this.cornerBottomLeft().y,
            cacheR
        );
        this.rotate(cacheR);

        this.context.moveTo(topLeftC0.x, topLeftC0.y);
        this.context.lineTo(topRightC1.x, topRightC1.y);
        this.context.arcTo(
            this.cornerTopRight().x,
            this.cornerTopRight().y,
            bottomRightC1.x,
            bottomRightC1.y,
            radius[1]
        );
        this.context.lineTo(bottomRightC2.x, bottomRightC2.y);
        this.context.arcTo(
            this.cornerBottomRight().x,
            this.cornerBottomRight().y,
            bottomRightC0.x,
            bottomRightC0.y,
            radius[2]
        );
        this.context.lineTo(bottomLeftC2.x, bottomLeftC2.y);
        this.context.arcTo(
            this.cornerBottomLeft().x,
            this.cornerBottomLeft().y,
            topLeftC3.x,
            topLeftC3.y,
            radius[3]
        );
        this.context.lineTo(topLeftC2.x, topLeftC2.y);
        this.context.arcTo(
            this.cornerTopLeft().x,
            this.cornerTopLeft().y,
            topRightC2.x,
            topRightC2.y,
            radius[3]
        );
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

    backgroundColor(opt?: FillStyle) {
        const bg = this.__valueHandler(opt, "backgroundColor", "black");
        super.fillStyle(bg);
        this.fill(true);
        return bg;
    }

    border(opt?: string) {
        const border = this.__valueHandler(opt, "border", undefined);
        if (border) {
            const { borderStyleArrWidth } = this.#borderParser(border);
            if (this.borderStyle() === "dotted") {
                this.lineDash(borderStyleArrWidth);
            }
            this.stroke(true);
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
            this.stroke(true);
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
            this.stroke(true);
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
            this.stroke(true);
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
            this.stroke(true);
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
}
