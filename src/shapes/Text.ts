import { Shape } from "../Shape";
import type {
    FontKerning,
    FontStretch,
    FontStyle,
    FontVariant,
    FontVariantCaps,
    FontWeight,
    strokeStyle,
    TextAlign,
    TextBaseline,
    TextDirection,
    TextRendering,
} from "../Shape";
import type { IBlock } from "../types";

export interface ITextOptions {
    text?: string;
    color?: string;
    strokeWidth?: number;
    strokeColor?: string;
    fontFamily?: string;
    fontWeight?: FontWeight;
    fontSize?: string;
    fontStyle?: FontStyle;
    fontVariant?: FontVariant;
    fontStretch?: FontStretch;
    fontKerning?: FontKerning;
    fontVariantCaps?: FontVariantCaps;
    textBaseline?: TextBaseline;
    textRendering?: TextRendering;
    wordSpacing?: string;
    letterSpacing?: string;
    direction?: TextDirection;
}

export class Text extends Shape<ITextOptions> {
    text: string;
    constructor(text: string, options: IBlock<ITextOptions>) {
        super(options);
        this.text = text;
        this.options.text = text;
    }

    draw(_func?: (context: CanvasRenderingContext2D) => void): void {
        super.font(this.#format_font);
        if (this.fill()) {
            super.fillText({
                text: this.text,
                x: this.x(),
                y: this.height() + this.y(),
                maxWidth: this.width(),
            });
        }

        if (super.stroke()) {
            super.strokeText({
                text: this.text,
                x: this.x(),
                y: this.height() + this.y(),
                maxWidth: this.width(),
            });
        }
    }

    width(opt?: number): number {
        const text_measure = super.measureText(this.text);
        return super.width(opt || text_measure?.width);
    }

    height(opt?: number): number {
        const text_measure = super.measureText(this.text);
        return super.height(opt || text_measure?.hangingBaseline);
    }

    get #format_font() {
        return `${this.fontStyle()} ${this.fontVariant()} ${this.fontWeight()} ${this.fontSize()}px ${this.fontFamily()}`;
    }

    fontFamily(opt?: string) {
        return this.__valueHandler(opt, "fontFamily", "sans-serif");
    }
    fontSize(opt?: number | string) {
        return this.__valueHandler(opt, "fontSize", 0, true);
    }
    fontWeight(opt?: FontWeight) {
        return this.__valueHandler(opt, "fontWeight", "normal");
    }
    fontVariant(opt?: FontVariant) {
        return this.__valueHandler(opt, "fontVariant", "normal");
    }
    fontStyle(opt?: FontStyle) {
        return this.__valueHandler(opt, "fontStyle", "normal");
    }
    color(opt?: string) {
        const color = this.__valueHandler(opt, "color", undefined);
        if (color) {
            super.fillStyle(color);
            super.fill(true);
        }
        return color;
    }
    strokeColor(opt?: strokeStyle) {
        const strokeColor = this.__valueHandler(opt, "strokeColor", undefined);
        if (strokeColor) {
            super.strokeStyle(strokeColor);
            this.stroke(true);
        }
        return strokeColor;
    }
    strokeWidth(opt?: number) {
        const width = this.__valueHandler(opt, "border", 0);
        super.lineWidth(width);
        return width;
    }
}
