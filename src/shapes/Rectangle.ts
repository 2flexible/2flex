import { Shape } from "../Shape";
import { IBlock, IDefaultBlockOpt } from "../types";

interface DefaultRectOpt {
    borderRadius: number[];
}

// borderstyle can be extended
type borderStyle = "solid" | "dotted";
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
    border?: string;
    // borderstyle can be extended for now just solid, dotted
    borderStyle?: borderStyle;
    borderColor?: string;
    borderWidth?: number;

}

export class Rectangle extends Shape {
    constructor(options?: IBlock<RectangleOptions>) {
        super(options);
        this.options = { ...defaultOpt, ...options };
        Rectangle.prototype.draggable = Shape.prototype.draggable;
        // Object.assign(Rectangle.prototype)
    }
    __initSet(): void {
        super.__initSet();
    }

    __drawInit() {
        this.color();

        this.#drawRect();

        this.fill();
        this.stroke();
    }

    #drawRect() {
        this.context.roundRect(
            this.initCords.x,
            this.initCords.y,
            this.options.width,
            this.options.height,
            this.options.borderRadius
        );
    }
    color(option?: string) {
        return super.color(option);
    }

    borderWidth(option?: number) {
        return super.strokeWidth(option);
    }
    borderColor(option?: string) {
        return super.strokeColor(option);
    }
    borderStyle(option?: "solid" | "dotted") {
        this.options.borderStyle =
            option || this.options.borderStyle || "solid";

        return this.options.borderStyle;
    }
    // stroke(option?: boolean) {
    //     return super.stroke(option);
    // }

    fill(option?: boolean) {
        return super.fill(option);
    }

    clip(option?: boolean): boolean {
        return super.clip(option);
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

    border(option?: string) {
        this.options.border = option || this.options.border || [];

        const { borderStyleArrWidth } = this.#borderParser(this.options.border);

        if (this.options.borderStyle === "dotted") {
            this.context.setLineDash(borderStyleArrWidth);
        }
        super.stroke(true);
        return this.options.border;
    }
    // calculated for before version which is not implimented due to one hand asignment border sides
    /*
    #rectBorders(top?: number, left?: number, bottom?: number, right?: number) {
        const arr = [];
        top = top || this.options.borderTop;
        right = right || this.options.borderRight;
        bottom = bottom || this.options.borderBottom;
        left = left || this.options.borderLeft;

        if (top) {
            arr[0] = this.options.width;
            arr[1] = this.options.height;
        } else {
            arr[0] = 0;
            arr[1] = this.options.width;
        }

        if (right) {
            if (top) arr[1] = 0;
            arr[2] = this.options.height;
            arr[3] = this.options.width;
        } else {
            arr[2] = 0;
            if (!top) arr[3] = this.options.height;
        }

        if (bottom) {
            if (right) arr[3] = 0;
            arr[4] = this.options.width;
            arr[5] = this.options.height;
        } else {
            arr[4] = 0;
            if (!right) {
                arr[5] = this.options.width;
            }
        }

        if (left) {
            if (bottom) arr[5] = 0;
            arr[6] = this.options.height;
            arr[7] = this.options.width;
        } else {
            arr[6] = 0;
            if (!bottom) arr[7] = this.options.height;
        }
        return arr;
    }
    */

    borderTop(option?: number) {
        this.options.borderTop = option || this.options.borderTop;
        let { borderStyleArrWidth } = this.#borderParser(
            this.options.borderTop
        );
        borderStyleArrWidth.pop();

        if (this.options.borderStyle === "dotted") {
            this.context.setLineDash([
                ...borderStyleArrWidth,
                this.options.height * 2 + this.options.width,
            ]);
        } else {
            this.context.setLineDash([
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
            this.context.setLineDash([
                0,
                this.options.width,
                ...borderStyleArrHeight,
                this.options.width + this.options.height,
            ]);
        } else if (this.options.borderStyle === "solid") {
            this.context.setLineDash([
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
            this.context.setLineDash([
                0,
                this.options.width + this.options.height,
                ...borderStyleArrWidth,
            ]);
        } else if (this.options.borderStyle === "solid") {
            this.context.setLineDash([
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
            this.context.setLineDash([
                0,
                this.options.width * 2 + this.options.height,
                ...borderStyleArrHeight,
            ]);
        } else if (this.options.borderStyle === "solid") {
            this.context.setLineDash([
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
