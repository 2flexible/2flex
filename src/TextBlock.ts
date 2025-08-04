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

    constructor(text: string, options?: IBlock<IText>) {
        super(options);
        this.text = text;
        this.options.text = text;
    }

    __initSet() {
        super.__initSet();

        this.setFont();

        this.color();

        this.options.width = this.width();
        this.options.height = this.height();

        const fontY = this.options.height + this.initCords.y!;

        this.context.fillText(
            this.text,
            this.initCords.x,
            fontY,
            this.options.maxWidth
        );
    }

    // x(option?: number) {
    //     return super.x(option);
    // }

    // y(option?: number) {
    //     return super.y(option);
    // }

    width(option?: number) {
        const text_measure = this.measureText();
        this.options.width = option || text_measure.width;
        return this.options.width;
    }

    height(option?: number) {
        const text_measure = this.measureText();
        this.options.height = option || text_measure.hangingBaseline;
        return this.options.height;
    }

    #format_font() {
        const fontFamily = this.fontFamily();

        const fontSize = this.fontSize();

        const fontStyle = this.fontStyle();

        const fontWeight = this.fontWeight();

        const fontVariant = this.fontVariant();

        return `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize} ${fontFamily}`;
    }

    // option: it has to bee in this format: "fontStyle fontVariant fontWeight fontSize fontFamily"
    setFont(option?: string) {
        this.context.font = option || this.#format_font();
    }

    fontFamily(option?: string) {
        this.options.fontFamily =
            option || this.options.fontFamily || "sans-serif";

        return this.options.fontFamily;
    }
    fontSize(option?: string) {
        this.options.fontSize = option || this.options.fontSize || "10px";
        return this.options.fontSize;
    }
    fontWeight(option?: FontWeight) {
        this.options.fontWeight = option || this.options.fontWeight || 100;

        return this.options.fontWeight;
    }

    fontVariant(option?: FontVariant) {
        this.options.fontVariant =
            option || this.options.fontVariant || "normal";

        return this.options.fontVariant;
    }

    fontStyle(option?: FontStyle) {
        this.options.fontStyle = option || this.options.fontVariant || "normal";

        return this.options.fontStyle;
    }
    fontStretch(option?: FontStretch) {
        this.options.fontStretch =
            option || this.options.fontStretch || "normal";

        this.context.fontStretch = this.options.fontStretch;

        return this.options.fontStretch;
    }

    fontKerning(option?: FontKerning) {
        this.options.fontKerning = option || this.options.fontKerning || "auto";
        this.context.fontKerning = this.options.fontKerning;
        return this.options.fontKerning;
    }

    fontVariantCaps(option?: FontVariantCaps) {
        this.options.fontVariantCaps =
            option || this.options.fontVariantCaps || "normal";

        this.context.fontVariantCaps = this.options.fontVariantCaps;

        return this.options.fontVariantCaps;
    }

    wordSpacing(option?: string) {
        this.options.wordSpacing =
            `${option}px` || this.options.wordSpacing || "0px";
        this.context.wordSpacing = this.options.wordSpacing;
        return this.options.wordSpacing;
    }

    color(option?: string) {
        super.color(option);
    }

    strokeWidth(option?: number) {
        this.setFont();

        this.strokeColor();
        super.strokeWidth(option);

        const fontY = this.options.height + this.initCords.y!;

        this.context.strokeText(
            this.text,
            this.initCords.x,
            fontY,
            this.options?.maxWidth
        );

        return this.options.strokeWidth;
    }

    strokeColor(option?: string) {
        return super.strokeColor(option);
    }

    direction(option?: TextDirection) {
        this.context.direction = option || this.options.direction || "ltr";
        this.options.direction = this.context.direction;
        return this.options.direction;
    }

    letterSpacing(option?: string) {
        this.context.letterSpacing =
            option || this.options.letterSpacing || "0px";
        this.options.letterSpacing = this.context.letterSpacing;
        return this.options.letterSpacing;
    }

    textRendering(option?: TextRendering) {
        this.context.textRendering =
            option || this.options.textRendering || "auto";
        this.options.textRendering = this.context.textRendering;
        return this.options.textRendering;
    }
    textAlign(option?: TextAlign) {
        this.context.textAlign = option || this.options.textAlign || "start";
        this.options.align = this.context.align;
        return this.options.align;
    }
    textBaseline(option?: TextBaseline) {
        this.context.textBaseline =
            option || this.options.textBaseline || "alphabetic";
        this.options.baseline = this.context.baseline;
        return this.options.baseline;
    }

    // @return: text width in pixels
    measureText() {
        return this.context.measureText(this.text);
    }
    clip(option?: boolean) {
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

    selectable(option: boolean): boolean {
        return super.selectable(option);
    }

    set(options: IBlock<IText>) {
        super.set(options);
    }
}
