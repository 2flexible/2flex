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
        return super.width(opt)
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
        this.options.fontFamily =
            opt || this.options.fontFamily || "sans-serif";

        return this.options.fontFamily;
    }
    fontSize(opt?: string) {
        this.options.fontSize = opt || this.options.fontSize || "10px";
        return this.options.fontSize;
    }
    fontWeight(opt?: FontWeight) {
        this.options.fontWeight = opt || this.options.fontWeight || 100;

        return this.options.fontWeight;
    }

    fontVariant(opt?: FontVariant) {
        this.options.fontVariant = opt || this.options.fontVariant || "normal";

        return this.options.fontVariant;
    }

    fontStyle(opt?: FontStyle) {
        this.options.fontStyle = opt || this.options.fontVariant || "normal";

        return this.options.fontStyle;
    }
    fontStretch(opt?: FontStretch) {
        this.options.fontStretch = opt || this.options.fontStretch || "normal";

        this.context.fontStretch = this.options.fontStretch;

        return this.options.fontStretch;
    }

    fontKerning(opt?: FontKerning) {
        this.options.fontKerning = opt || this.options.fontKerning || "auto";
        this.context.fontKerning = this.options.fontKerning;
        return this.options.fontKerning;
    }

    fontVariantCaps(opt?: FontVariantCaps) {
        this.options.fontVariantCaps =
            opt || this.options.fontVariantCaps || "normal";

        this.context.fontVariantCaps = this.options.fontVariantCaps;

        return this.options.fontVariantCaps;
    }

    wordSpacing(opt?: string) {
        this.options.wordSpacing =
            `${opt}px` || this.options.wordSpacing || "0px";
        this.context.wordSpacing = this.options.wordSpacing;
        return this.options.wordSpacing;
    }

    color(opt?: string) {
        this.options.color = opt || this.options.color || "black";
        this.context.fillStyle = this.options.color;
        return this.options.color;
    }

    strokeWidth(opt?: number) {
        this.options.strokeWidth = opt || this.options.strokeWidth || 0;
        this.context.lineWidth = this.options.strokeWidth;
        return this.options.strokeWidth;
    }

    strokeColor(opt?: string) {
        this.options.strokeColor = opt || this.options.strokeColor || "black";
        this.context.strokeStyle = this.options.strokeColor;
        return this.options.strokeColor;
    }

    stroke(opt?: boolean) {
        this.options.stroke = opt || this.options.stroke || false;
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

        return this.options.stroke;
    }

    direction(opt?: TextDirection) {
        this.context.direction = opt || this.options.direction || "ltr";
        this.options.direction = this.context.direction;
        return this.options.direction;
    }

    letterSpacing(opt?: string) {
        this.context.letterSpacing = opt || this.options.letterSpacing || "0px";
        this.options.letterSpacing = this.context.letterSpacing;
        return this.options.letterSpacing;
    }

    textRendering(opt?: TextRendering) {
        this.context.textRendering =
            opt || this.options.textRendering || "auto";
        this.options.textRendering = this.context.textRendering;
        return this.options.textRendering;
    }
    textAlign(opt?: TextAlign) {
        this.context.textAlign = opt || this.options.textAlign || "start";
        this.options.align = this.context.align;
        return this.options.align;
    }
    textBaseline(opt?: TextBaseline) {
        this.context.textBaseline =
            opt || this.options.textBaseline || "alphabetic";
        this.options.baseline = this.context.baseline;
        return this.options.baseline;
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

    selectable(opt: boolean): boolean {
        return super.selectable(opt);
    }

    set(options: IBlock<IText>) {
        super.set(options);
    }
}
