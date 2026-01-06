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

    resizable(opt?: boolean): boolean {
        return super.resizable(opt);
    }

    selectable(opt?: boolean): boolean {
        return super.selectable(opt);
    }

    maxWidth(opt?: number | string): number {
        return super.maxWidth(opt);
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

    fontStretch(opt?: FontStretch) {
        return super.fontStretch(opt);
    }

    fontKerning(opt?: FontKerning) {
        return super.fontKerning(opt);
    }

    fontVariantCaps(opt?: FontVariantCaps) {
        return super.fontVariantCaps(opt);
    }

    wordSpacing(opt?: string) {
        return super.wordSpacing(opt);
    }

    color(opt?: string) {
        const color = this.__valueHandler(opt, "color", "black");
        super.fillStyle(color);
        return color;
    }

    strokeWidth(opt?: number) {
        return super.lineWidth(opt);
    }

    strokeColor(opt?: string) {
        return super.strokeStyle(opt);
    }

    direction(opt?: TextDirection) {
        return super.direction(opt);
    }

    letterSpacing(opt?: string) {
        return super.letterSpacing(opt);
    }

    textRendering(opt?: TextRendering) {
        return super.textRendering(opt);
    }
    // need to change for parent element instead of usign context align
    textAlign(opt?: TextAlign) {
        const textAlign = this.__valueHandler(opt, "textAlign", "start");
        return textAlign;
    }
    textBaseline(opt?: TextBaseline) {
        return super.textBaseline(opt);
    }
    blur(opt?: number) {
        return super.blur(opt);
    }
    brightness(opt?: number) {
        return super.brightness(opt);
    }
    contrast(opt?: number) {
        return super.contrast(opt);
    }
    dropShadow(opt?: [number, number, number, string][]) {
        return super.dropShadow(opt);
    }
    grayscale(opt?: number) {
        return super.grayscale(opt);
    }
    hueRotate(opt?: number) {
        return super.hueRotate(opt);
    }
    opacity(opt?: number) {
        return super.opacity(opt);
    }
    sepia(opt?: number) {
        return super.sepia(opt);
    }
    hidden(opt?: boolean): boolean {
        return super.hidden(opt);
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

    set(options: IBlock<IText>) {
        super.set(options);
    }
}
