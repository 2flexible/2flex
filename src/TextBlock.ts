import { Block } from "./Block";
import { IBlock } from "./types";

type TextAlign = "start" | "end" | "center" | "left" | "right";

type TextDirection = "ltr" | "rtl";

type TextBaseline =
    | "alphabetic"
    | "top"
    | "hanging"
    | "middle"
    | "ideographic"
    | "bottom";

type FontStretch =
    | "normal"
    | "ultra-condensed"
    | "extra-condensed"
    | "condensed"
    | "semi-condensed"
    | "semi-expanded"
    | "expanded"
    | "extra-expanded"
    | "ultra-expanded";

type FontKerning = "normal" | "auto" | "none";

type FontVariantCaps =
    | "normal"
    | "small-caps"
    | "all-small-caps"
    | "petite-caps"
    | "all-petite-caps"
    | "unicase"
    | "titling-caps";

type FontWeight =
    | "normal"
    | "bold"
    | "bolder"
    | "lighter"
    | 100
    | 200
    | 300
    | 400
    | 500
    | 600
    | 700
    | 800
    | 900;

type FontStyle = "normal" | "italic" | "oblique";

type FontVariant = "normal" | "small-caps";

type TextRendering =
    | "auto"
    | "optimizeSpeed"
    | "optimizeLegibility"
    | "geometricPrecision";

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
    maxWidth?: number;
}

export class TextBlock extends Block {
    text: string;
    constructor(text: string, options: IBlock<IText>) {
        super(options);
        this.text = text;
        this.options.text = text;
    }

    __initSet() {
        super.__initSet();

        this.setFont();

        this.color();

        this.options.height = this.height();

        const fontY = this.height() + this.canvasInit.y;

        this.context.fillText(
            this.text,
            this.canvasInit.x,
            fontY,
            this.options.maxWidth
        );
    }

    width(opt?: number): number {
        const text_measure = this.measureText();
        opt = opt || text_measure?.width;
        return super.width(opt);
    }

    height(opt?: number): number {
        const text_measure = this.measureText();
        opt = opt || text_measure?.hangingBaseline;
        return super.height(opt);
    }

    #format_font() {
        const fontFamily = this.fontFamily();

        const fontSize = this.fontSize();

        const fontStyle = this.fontStyle();

        const fontWeight = this.fontWeight();

        const fontVariant = this.fontVariant();

        return `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize} ${fontFamily}`;
    }

    // opt: it has to bee in this format: "fontStyle fontVariant fontWeight fontSize fontFamily"
    setFont(opt?: string) {
        this.context.font = opt || this.#format_font();
    }

    fontFamily(opt?: string) {
        return this.__cacheOption(opt, "fontFamily", "sans-serif");
    }
    fontSize(opt?: string) {
        return this.__cacheOption(opt, "fontSize", "10px");
    }
    fontWeight(opt?: FontWeight) {
        return this.__cacheOption(opt, "fontWeight", "normal");
    }

    fontVariant(opt?: FontVariant) {
        return this.__cacheOption(opt, "fontVariant", "normal");
    }

    fontStyle(opt?: FontStyle) {
        return this.__cacheOption(opt, "fontStyle", "normal");
    }
    fontStretch(opt?: FontStretch) {
        const fontStretch = this.__cacheOption(opt, "fontStretch", "normal");
        this.context.fontStretch = fontStretch;
        return fontStretch;
    }

    fontKerning(opt?: FontKerning) {
        const fontKerning = this.__cacheOption(opt, "fontKerning", "auto");
        this.context.fontKerning = fontKerning;
        return fontKerning;
    }

    fontVariantCaps(opt?: FontVariantCaps) {
        const fontVariantCaps = this.__cacheOption(
            opt,
            "fontVariantCaps",
            "normal"
        );
        this.context.fontVariantCaps = fontVariantCaps;
        return fontVariantCaps;
    }

    wordSpacing(opt?: string) {
        const wordSpacing = this.__cacheOption(
            `${opt}px`,
            "wordSpacing",
            "0px"
        );
        this.context.wordSpacing = wordSpacing;
        return wordSpacing;
    }

    color(opt?: string) {
        const color = this.__cacheOption(opt, "color", "black");
        this.context.fillStyle = color;
        return color;
    }

    strokeWidth(opt?: number) {
        const strokeWidth = this.__cacheOption(opt, "strokeWidth", 0);
        this.context.lineWidth = strokeWidth;
        return strokeWidth;
    }

    strokeColor(opt?: string) {
        const strokeColor = this.__cacheOption(opt, "strokeColor", "black");
        this.context.strokeStyle = strokeColor;
        return strokeColor;
    }

    stroke(opt?: boolean) {
        const stroke = this.__cacheOption(opt, "stroke", false);
        if (opt) {
            this.setFont();

            this.strokeColor();
            this.strokeWidth();

            this.options.height = this.height();
            const fontY = this.height() + this.canvasInit.y;

            this.context.strokeText(
                this.text,
                this.canvasInit.x,
                fontY,
                this.options?.maxWidth
            );
        }
        return stroke;
    }

    direction(opt?: TextDirection) {
        const direction = this.__cacheOption(opt, "direction", "ltr");
        this.context.direction = direction;
        return direction;
    }

    letterSpacing(opt?: string) {
        const letterSpacing = this.__cacheOption(opt, "letterSpacing", "0px");
        this.context.letterSpacing = letterSpacing;
        return letterSpacing;
    }

    textRendering(opt?: TextRendering) {
        const textRendering = this.__cacheOption(opt, "textRendering", "auto");
        this.context.textRendering = textRendering;
        return textRendering;
    }
    textAlign(opt?: TextAlign) {
        const textAlign = this.__cacheOption(opt, "textAlign", "start");
        this.context.textAlign = textAlign;
        return textAlign;
    }
    textBaseline(opt?: TextBaseline) {
        const textBaseline = this.__cacheOption(
            opt,
            "textBaseline",
            "alphabetic"
        );
        this.context.textBaseline = textBaseline;
        return textBaseline;
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
    find(queries?: IBlock<IText>) {
        return this.filterNodes(queries);
    }
    // @return: text width in pixels
    measureText() {
        return this.context?.measureText(this.text);
    }
    clip(opt?: boolean) {
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

    set(options: IBlock<IText>) {
        super.set(options);
    }
}
