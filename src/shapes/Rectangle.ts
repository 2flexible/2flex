import { Shape } from "../Shape";
import { IBlock, IDefaultBlockOpt, BorderStyle, InitialShapes } from "../types";

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

export interface IRectangleOptions extends DefaultRectOpt, InitialShapes {
   
}

export class Rectangle extends Shape {
    constructor(options?: IBlock<IRectangleOptions>) {
        super(options);
        this.options = { ...defaultOpt, ...options };
    }
    __initSet(): void {
        super.__initSet();
    }

    __drawInit() {
        this.beginPath()

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
    
    backgroundColor(opt?: string) {
        this.options.backgroundColor = super.fillStyle(opt)
        return this.options.backgroundColor
    }
    
    border(opt?: string) {
        this.options.border = opt || this.options.border || [];
        const { borderStyleArrWidth } = this.#borderParser(this.options.border);

        if (this.options.borderStyle === "dotted") {
            this.setLineDash(borderStyleArrWidth);
        }
        super.stroke(true);
        return this.options.border;
    }
    borderWidth(opt?: number) {
        this.options.borderWidth = super.lineWidth(opt)
        return this.options.borderWidth
    }
    borderColor(opt?: string) {
        this.options.borderColor = super.strokeStyle(opt)
        return this.options.borderColor;
    }

    borderStyle(opt?: "solid" | "dotted") {
        this.options.borderStyle = opt || this.options.borderStyle || "solid";

        return this.options.borderStyle;
    }

    borderTop(opt?: number) {
        this.options.borderTop = opt || this.options.borderTop;
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

    borderRight(opt?: number) {
        this.options.borderRight = opt || this.options.borderRight;
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
    borderBottom(opt?: number) {
        this.options.borderBottom = opt || this.options.borderBottom;
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
    borderLeft(opt?: number) {
        this.options.borderLeft = opt || this.options.borderLeft;
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
        const borderStyle = border[1] as BorderStyle;
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
    clip(opt?: boolean): boolean {
        return super.clip(opt);
    }
    dragX(opt?: boolean) {
        return super.dragX(opt);
    }
    dragY(opt?: boolean) {
        return super.dragY(opt);
    }
    draggable(opt: boolean): boolean {
        return super.draggable(opt);
    }

    selectable(opt?: boolean): boolean {
        return super.selectable(opt);
    }

    set(options: IBlock<IRectangleOptions>) {
        super.set(options);
    }
}
