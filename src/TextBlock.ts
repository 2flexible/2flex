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

export interface IText {
    text?: string;
    fontFamily?: string;
    fontWeight?: number;
    fontSize?: number;
    fontStyle?: string;
    fontVariant?: string;
    textAlign?: TextAlign;
    textBaseline?: TextBaseline;
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
        this.setFont();
    }

    #measureTextSize() {
        const text_measure = this.measureText();
        this.options.height = text_measure.hangingBaseline;
        // text_measure.actualBoundingBoxAscent +
        // text_measure.actualBoundingBoxDescent;
        this.options.width = text_measure.width;
        return this.options.height + this.options.y;
    }

    x(option?: number) {
        return super.x(option);
    }

    y(option?: number) {
        return super.y(option);
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
        this.color();

        const fontY = this.#measureTextSize();
        // const x = this.x();
        // console.log(x);
        this.context.fillText(
            this.text,
            this.options.x,
            fontY,
            this.options.maxWidth
        );
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
    fontWeight(option?: string) {
        this.options.fontWeight = option || this.options.fontWeight || 100;

        return this.options.fontWeight;
    }

    fontVariant(option?: string) {
        this.options.fontVariant =
            option || this.options.fontVariant || "normal";

        return this.options.fontVariant;
    }

    fontStyle(option?: string) {
        this.options.fontStyle = option || this.options.fontVariant || "normal";

        return this.options.fontStyle;
    }

    color(option?: string) {
        super.color(option);
    }

    stroke(option?: number) {
        super.stroke(option);

        this.strokeColor();

        const fontY = this.#measureTextSize();

        this.context.strokeText(
            this.text,
            this.options.x,
            fontY,
            this.options?.maxWidth
        );

        return this.options.stroke;
    }

    strokeColor(option?: string) {
        this.context.strokeStyle = super.strokeColor(option);
        return this.options.strokeColor;
    }

    direction(option?: string) {
        this.context.direction = option || this.options.direction;
        this.options.direction = this.context.direction;
        return this.options.direction;
    }
    textAlign(option?: string) {
        this.context.textAlign = option || this.options.textAlign;
        this.options.align = this.context.align;
        return this.options.align;
    }
    textBaseline(option?: string) {
        this.context.textBaseline = option || this.options.textBaseline;
        this.options.baseline = this.context.baseline;
        return this.options.baseline;
    }

    // @return: text width in pixels
    measureText() {
        return this.context.measureText(this.text);
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
