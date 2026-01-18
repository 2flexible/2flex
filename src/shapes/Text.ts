import { Shape } from "../Shape";
import type {
    FontKerning,
    FontStretch,
    FontStyle,
    FontVariant,
    FontVariantCaps,
    FontWeight,
    TextAlign,
    TextBaseline,
    TextDirection,
    TextRendering,
} from "../Shape";
import type { IBlock } from "../types";

export interface IText {
    text?: string;
    color?: string;
    strokeWidth?: number;
    strokeColor?: string;
    stroke?: boolean;
    fontFamily?: string;
    fontWeight?: FontWeight;
    fontSize?: string;
    fontStyle?: FontStyle;
    fontVariant?: FontVariant;
    fontStretch?: FontStretch;
    fontKerning?: FontKerning;
    fontVariantCaps?: FontVariantCaps;
    textAlign?: TextAlign;
    textBaseline?: TextBaseline;
    textRendering?: TextRendering;
    wordSpacing?: string;
    letterSpacing?: string;
    direction?: TextDirection;
}

export class Text extends Shape<IText> {
    text: string;
    constructor(text: string, options: IBlock<IText>) {
        super(options);
        this.text = text;
        this.options.text = text;
    }

    draw(_func?: (context: CanvasRenderingContext2D) => void): void {
        super.font(this.#format_font);
        this.color();
        if (this.ownOptions.color) {
            super.fillText({
                text: this.text,
                x: this.x(),
                y: this.height() + this.y(),
                maxWidth: this.width(),
            });
        }

        if (this.ownOptions.strokeColor) {
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
        return this.__valueHandler(opt, "fontSize", 10, true);
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
        const color = this.__valueHandler(opt, "color", "black");
        super.fillStyle(color);
        return color;
    }
    // need to change for parent element instead of usign context align
    textAlign(opt?: TextAlign) {
        const textAlign = this.__valueHandler(opt, "textAlign", "start");
        return textAlign;
    }
}
