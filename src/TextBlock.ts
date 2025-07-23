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

interface IText {
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
    fontY: number = 0;

    constructor(text: string, options: IBlock<IText> | undefined = undefined) {
        super(options);
        this.text = text;
        // const stylesMap = [
        //     { styleType: "fontFamily", method: this.fontFamily },
        //     { styleType: "fontWeight", method: this.fontWeight },
        //     { styleType: "fontSize", method: this.fontSize },
        //     { styleType: "fontStyle", method: this.fontStyle },
        //     { styleType: "fontVariant", method: this.fontVariant },
        //     { styleType: "textAlign", method: this.align },
        //     { styleType: "textBaseline", method: this.baseline },
        //     { styleType: "direction", method: this.direction },
        // ];
        // this.registerStyle(stylesMap);
    }
    #measureTextSize() {
        const text_measure = this.measureText();
        this.options.height =
            text_measure.actualBoundingBoxAscent +
            text_measure.actualBoundingBoxDescent;

        this.options.width = text_measure.width;
        this.fontY = this.options.height + this.options.y;
    }

    __initSet() {
        this.setFont();
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
        this._context.font = option || this.#format_font();

        this.color();
        this.#measureTextSize();

        this._context.fillText(
            this.text,
            this.options.x,
            this.fontY,
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
        this._context.fillStyle = this.options.color || option || "black";
        this.options.color = this._context.fillStyle;
    }

    stroke(option?: string) {
        this._context.strokeStyle = this.options.stroke || option;
        this._context.strokeText(
            this.text,
            this.options.x,
            this.fontY,
            this.options?.maxWidth
        );
        this.options.strokeStyle = this._context.strokeStyle;
    }
    direction(option?: string) {
        this._context.direction = this.options.direction || option;
        this.options.direction = this._context.direction;
    }
    textAlign(option?: string) {
        this._context.textAlign = this.options.textAlign || option;
        this.options.align = this._context.align;
    }
    textBaseline(option?: string) {
        this._context.textBaseline = this.options.textBaseline || option;
        this.options.baseline = this._context.baseline;
    }

    // returns: text width in pixels
    measureText() {
        return this._context.measureText(this.text);
    }
    set(options: IBlock<IText>) {
        super.set(options);
    }
}
