import { BlockPayload } from "../Block";
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
    #splitedText: string[] = [];
    #lettersWidth: number[] = [];
    #updateText?: () => void;

    constructor(text: string, options: IBlock<ITextOptions>) {
        super(options);
        this.text(text);
    }

    draw(_func?: (context: CanvasRenderingContext2D) => void): void {
        const cacheR = this.rotate();
        this.rotate(0);
        super.font(this.#format_font);
        const text_measure = super.measureText(this.text());
        this.#updateText?.();
        this.#updateText = undefined;
        let words = [this.text()];
        if (text_measure.width > this.getRealWidth)
            words = this.#responsiveText(text_measure.width);
        let wrapH = this.getTop.y;
        for (let i = 0, len = words.length; i < len; i++) {
            wrapH += text_measure.hangingBaseline;
            if (this.fill()) {
                super.fillText({
                    text: words[i],
                    x: this.getLeft.x,
                    y: wrapH,
                    maxWidth: text_measure.width,
                });
            }

            if (super.stroke()) {
                super.strokeText({
                    text: words[i],
                    x: this.getLeft.x,
                    y: wrapH,
                    maxWidth: text_measure.width,
                });
            }
        }
        this.rotate(cacheR);
    }

    get #format_font() {
        return `${this.fontStyle()} ${this.fontVariant()} ${this.fontWeight()} ${this.fontSize()}px ${this.fontFamily()}`;
    }

    #responsiveText(width: number) {
        let realWidth = width;
        const texts = [];
        let wordIdx = 0;
        let words = "";
        let additonalSplit: string[] = [];
        let lenWords = 0;
        while (
            realWidth > this.getRealWidth &&
            wordIdx < this.#splitedText.length
        ) {
            additonalSplit = [];
            lenWords += this.#lettersWidth[wordIdx];
            if (lenWords >= this.getRealWidth) {
                texts.push(words);
                words = "";
                lenWords = this.#lettersWidth[wordIdx];
                additonalSplit = this.#splitedText.slice(
                    wordIdx,
                    this.#splitedText.length
                );
                realWidth = super.measureText(additonalSplit.join(" ")).width;
            }
            words += this.#splitedText[wordIdx] + " ";
            wordIdx += 1;
        }
        if (additonalSplit.length !== 0) texts.push(additonalSplit.join(" "));
        return texts;
    }

    text(opt?: string): string {
        const cacheT = this.ownOptions.text || "";
        const text = this.__valueHandler(opt, "text", "");
        if (text.length !== cacheT.length) {
            this.#updateText = () => {
                this.#splitedText = text.split(" ");
                const spaceW = super.measureText(" ").width;
                for (let i = 0, len = this.#splitedText.length; i < len; i++) {
                    this.#lettersWidth.push(
                        super.measureText(this.#splitedText[i]).width + spaceW
                    );
                }
            };
        }
        return text;
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

    scale(opt?: number): void {
        super.scale(opt);
        this.fontSize(this.fontSize() * (opt || 1));
    }

    generatePayload(): BlockPayload {
        const payload  = super.generatePayload()
        payload.additionalParams = [this.text()]
        return payload
    }
}
