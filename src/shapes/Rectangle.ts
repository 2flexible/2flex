import { Shape, borderStyle } from "../Shape";
import { IBlock, IDefaultBlockOpt } from "../types";

interface DefaultRectOpt {
    borderRadius: number[];
}

// borderstyle can be extended
const defaultOpt: IDefaultBlockOpt<DefaultRectOpt> = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    selectable: true,
    draggable: true,
    zIndex: 0,
    dragX: true,
    dragY: true,
    // border-radius: [top-left, top-right, bottom-right, bottom-left]
    borderRadius: [0],
};

interface RectangleOptions extends DefaultRectOpt {
    borderLeft?: string;
    borderTop?: string;
    borderRight?: string;
    borderBottom?: string;
}

export class Rectangle extends Shape {
    constructor(options?: IBlock<RectangleOptions>) {
        super(options);
        this.options = { ...defaultOpt, ...options };
    }
    __initSet(): void {
        super.__initSet();
    }

    __drawInit() {
        this.backgroundColor();

        this.#drawRect();

        this.fill();
        this.stroke();
    }

    #drawRect() {
        this.roundRect({
            x: this.initCords.x,
            y: this.initCords.y,
            width: this.options.width,
            height: this.options.height,
            borderRadius: this.options.borderRadius,
        });
    }
    backgroundColor(option?: string) {
        return super.backgroundColor(option);
    }
    border(option?: string) {
        this.options.border = super.border(option);
        const { borderStyleArrWidth } = this.#borderParser(this.options.border);

        if (this.options.borderStyle === "dotted") {
            this.setLineDash(borderStyleArrWidth);
        }
        super.stroke(true);
        return this.options.border;
    }
    borderWidth(option?: number) {
        return super.borderWidth(option);
    }
    borderColor(option?: string) {
        return super.borderColor(option);
    }

    borderStyle(option?: "solid" | "dotted") {
        this.options.borderStyle =
            option || this.options.borderStyle || "solid";

        return this.options.borderStyle;
    }

    borderTop(option?: number) {
        this.options.borderTop = option || this.options.borderTop;
        let { borderStyleArrWidth } = this.#borderParser(
            this.options.borderTop
        );
        borderStyleArrWidth.pop();

        if (this.options.borderStyle === "dotted") {
            this.setLineDash([
                ...borderStyleArrWidth,
                this.options.height * 2 + this.options.width,
            ]);
        } else {
            this.setLineDash([
                this.options.width,
                this.options.width + 2 * this.options.height,
                0,
                0,
            ]);
        }

        this.#drawRect();
        super.stroke(true);
        return this.options.borderTop;
    }

    borderRight(option?: number) {
        this.options.borderRight = option || this.options.borderRight;
        const { borderStyleArrHeight } = this.#borderParser(
            this.options.borderRight
        );
        borderStyleArrHeight.pop();

        if (this.options.borderStyle === "dotted") {
            this.setLineDash([
                0,
                this.options.width,
                ...borderStyleArrHeight,
                this.options.width + this.options.height,
            ]);
        } else if (this.options.borderStyle === "solid") {
            this.setLineDash([
                0,
                this.options.width,
                this.options.height,
                this.options.width,
            ]);
        }
        this.#drawRect();
        super.stroke(true);
        return this.options.borderRight;
    }
    borderBottom(option?: number) {
        this.options.borderBottom = option || this.options.borderBottom;
        let { borderStyleArrWidth } = this.#borderParser(
            this.options.borderBottom
        );
        if (this.options.borderStyle === "dotted") {
            this.setLineDash([
                0,
                this.options.width + this.options.height,
                ...borderStyleArrWidth,
            ]);
        } else if (this.options.borderStyle === "solid") {
            this.setLineDash([
                0,
                this.options.width + this.options.height,
                this.options.width,
                0,
            ]);
        }

        this.#drawRect();
        super.stroke(true);
        return this.options.borderBottom;
    }
    borderLeft(option?: number) {
        this.options.borderLeft = option || this.options.borderLeft;
        let { borderStyleArrHeight } = this.#borderParser(
            this.options.borderLeft
        );

        if (this.options.borderStyle === "dotted") {
            this.setLineDash([
                0,
                this.options.width * 2 + this.options.height,
                ...borderStyleArrHeight,
            ]);
        } else if (this.options.borderStyle === "solid") {
            this.setLineDash([
                0,
                this.options.width * 2 + this.options.height,
                this.options.height,
                this.options.width,
            ]);
        }
        this.#drawRect();
        super.stroke(true);
        return this.options.borderLeft;
    }
    // border size, style(required), color
    #borderParser(obj?: string) {
        const border = obj?.split(" ") || [];

        // need to impliment css unit converter for different size, ex, px, em, rem etc.
        const borderWitdh = Number(border[0]);
        const borderStyle = border[1] as borderStyle;
        const borderColor = border[2];

        const borderStyleArrWidth = [];
        const borderStyleArrHeight = [];

        if (borderStyle === "dotted") {
            let total = 0;
            const step = this.options.width / 21;
            while (total < this.options.width) {
                borderStyleArrWidth.push(step, step);
                total += step * 2;
            }

            total = 0;
            const stepHeight = this.options.height / 21;
            while (total < this.options.height) {
                borderStyleArrHeight.push(stepHeight, stepHeight);
                total += stepHeight * 2;
            }
        }
        this.borderWidth(borderWitdh);
        this.borderStyle(borderStyle);
        this.borderColor(borderColor);
        return { borderStyleArrWidth, borderStyleArrHeight };
    }
    clip(option?: boolean): boolean {
        return super.clip(option);
    }
    dragX(option?: boolean) {
        return super.dragX(option);
    }
    dragY(option?: boolean) {
        return super.dragY(option);
    }
    draggable(option: boolean): boolean {
        return super.draggable(option);
    }

    selectable(option?: boolean): boolean {
        return super.selectable(option);
    }

    set(options: IBlock<RectangleOptions>) {
        super.set(options);
    }
}
