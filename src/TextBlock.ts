import { Canvas } from "./Canvas";
import { Block } from ".";
import { BlockOptions, IBlock } from "./types";

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

export class TextBlock extends Block<IText> {
    text: string;

    constructor(text: string, options: IBlock<IText>) {
        super(options);
        this.text = text;
        this.#initSet();
    }

    #initSet() {
        const text_measure = this.measureText();
        this.options.height =
            text_measure.actualBoundingBoxAscent +
            text_measure.actualBoundingBoxDescent;

        this.options.width = text_measure.width;

        this._context.font = this.#format_font();
        this._context.fillStyle = this.options?.color || "black";
        this._context.fillText(
            this.text,
            this.x,
            this.y,
            this.options.maxWidth
        );
    }

    #format_font() {
        const fontFamily = this.options.fontFamily || "sans-serif";

        const fontSize = this.options.fontSize
            ? this.options.fontSize + "px"
            : "10px";

        const fontWeight = this.options.fontWeight || 100;

        const fontStyle = this.options.fontStyle || "normal";

        const fontVariant = this.options.fontVariant || "normal";

        return `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize} ${fontFamily}`;
    }

    private stroke() {
        this._context.strokeStyle = this.options.stroke!;
        this._context.strokeText(
            this.text,
            this.x,
            this.y,
            this.options?.maxWidth
        );
    }

    private direction() {
        this._context.direction = this.options.direction!;
    }
    private align() {
        this._context.textAlign = this.options.textAlign!;
    }
    private baseline() {
        this._context.textBaseline = this.options.textBaseline!;
    }

    // returns text width in pixels
    measureText() {
        return this._context.measureText(this.text);
    }
}

/* 
Todo - in css 

@font-face {
    font-family: 'KulminoituvaRegular';
    src: url('http://www.miketaylr.com/f/kulminoituva.ttf');
}
*/
// const box1 = new Block({ x: 0, y: 0 });

const text_b = new TextBlock("Hey", {
    x: 0,
    y: 0,
    color: "red",
    fontFamily: "KulminoituvaRegular",
    stroke: "red",
    lineWidth: 10,
});

text_b.click(function () {});

const canvas = new Canvas(200, 200);
canvas.add(text_b);
console.log(text_b._context.strokeStyle);
