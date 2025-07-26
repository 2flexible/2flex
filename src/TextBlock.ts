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

    constructor(text: string, options: IBlock<IText> | undefined = undefined) {
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

    // it has to bee in this format: "fontStyle fontVariant fontWeight fontSize fontFamily"
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
            this.options?.maxWidth
        );
    }

    fontFamily(option?: string) {
        if (option) {
            this.options.fontFamily = option;
            this.setFont();
        }

        return this.options.fontFamily || "sans-serif";
    }
    fontSize(option?: string) {
        if (option) {
            this.options.fontSize = option;
            this.setFont();
        }
        return this.options.fontSize ? this.options.fontSize + "px" : "10px";
    }
    fontWeight(option?: string) {
        if (option) {
            this.options.fontWeight = option;
            this.setFont();
        }
        return this.options.fontWeight || 100;
    }

    fontVariant(option?: string) {
        if (option) {
            this.options.fontVariant = option;
            this.setFont();
        }
        return this.options.fontVariant || "normal";
    }

    fontStyle(option?: string) {
        if (option) {
            this.options.fontStyle = option;
            this.setFont();
        }
        return this.options.fontStyle || "normal";
    }

    color(option?: string) {
        this.context.fillStyle = option ?? (this.options.color || "black");
        this.options.color = this.context.fillStyle;
    }

    stroke(option?: number) {
        this.context.lineWidth = this.options.stroke || option;

        this.context.strokeStyle = this.strokeColor();

        const fontY = this.#measureTextSize();
        this.context.strokeText(
            this.text,
            this.options.x,
            fontY,
            this.options?.maxWidth
        );
        this.options.strokeStyle = this.context.strokeStyle;
    }
    strokeColor(option?: string) {
        this.context.strokeStyle = this.options.strokeColor || option;
    }
    direction(option?: string) {
        this.context.direction = this.options.direction || option;
        this.options.direction = this.context.direction;
    }
    textAlign(option?: string) {
        this.context.textAlign = this.options.textAlign || option;
        this.options.align = this.context.align;
    }
    textBaseline(option?: string) {
        this.context.textBaseline = this.options.textBaseline || option;
        this.options.baseline = this.context.baseline;
    }

    // returns: text width in pixels
    measureText() {
        return this.context.measureText(this.text);
    }

    draggable(option: boolean): void {
        super.draggable(option);
    }

    selectable(option: boolean): void {
        super.selectable(option);
    }

    set(options: IBlock<IText>) {
        super.set(options);
    }
}
