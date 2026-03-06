import { BlockPayload } from "../Block";
import { ShapeBlock } from "../ShapeBlock";
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
} from "../ShapeBlock";
import type { IBlock } from "../types";
import { inRange } from "../Utils";

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
    editable?: boolean;
    resizeLineHeight?: boolean;
}

export class TextBlock extends ShapeBlock<ITextOptions> {
    #splitedText: string[] = [];
    #letterSpecs: {
        [key: string]: { x: number; y: number; width: number; height: number };
    } = {};
    #letterNodes?: {
        prev: null;
        next: null;
        letter: string;
        width: number;
        height: number;
        x: number;
        y: number;
    };
    #updateText?: () => void;

    constructor(text: string, options: IBlock<ITextOptions>) {
        super(options);
        this.text(text);
    }

    draw(_func?: (context: CanvasRenderingContext2D) => void): void {
        const cacheR = this.rotate();
        this.rotate(0);
        super.font(this.#format_font);
        this.#updateText?.();
        this.#updateText = undefined;

        const words = this.#wrapText();
        let sumOfHeights = 0;

        if (this.resizeLineHeight())
            sumOfHeights =
                (this.height() -
                    words.reduce((p, n) => p + n.height - this.y(), 0)) /
                (words.length - 1);

        let heightP = 0;
        let heights = 0;
        for (let i = 0, len = words.length; i < len; i++) {
            if (i !== 0) heightP = sumOfHeights;
            if (this.fill()) {
                super.fillText({
                    text: words[i].words,
                    x: this.x(),
                    y: words[i].height + heightP,
                    maxWidth: words[i].width,
                });
            }

            if (super.stroke()) {
                super.strokeText({
                    text: words[i].words,
                    x: this.x(),
                    y: words[i].height + heightP,
                    maxWidth: words[i].width,
                });
            }
            if (i === len - 1) heights = words[i].height - this.y();
        }
        if (!this.resizeLineHeight()) this.height(heights);
        this.rotate(cacheR);
    }

    get #format_font() {
        return `${this.fontStyle()} ${this.fontVariant()} ${this.fontWeight()} ${this.fontSize()}px ${this.fontFamily()}`;
    }
    #wrapText() {
        const texts: { words: string; width: number; height: number }[] = [];
        let words = "";
        let wrapW = 0;
        let wrapH = 0;
        let heights = [];
        let heightW = 0;
        let wrapX = 0;
        const spaceW = super.measureText(" ").width;

        for (let [key, values] of Object.entries(this.#letterSpecs)) {
            wrapW += values.width + spaceW;
            if (wrapW > this.width()) {
                wrapW = values.width + spaceW;
                wrapX = 0;
                wrapH += Math.max(...heights);
                const wordM = super.measureText(words);
                heightW += wordM.hangingBaseline;
                texts.push({
                    words: words.slice(0, words.length - 1),
                    width: wordM.width,
                    height: this.y() + heightW,
                });
                words = "";
                heights = [];
            }
            this.#letterSpecs[key].x = this.x() + wrapX;
            this.#letterSpecs[key].y = this.y() + wrapH;
            wrapX += values.width + spaceW;
            words += key + " ";
            heights.push(values.height);
        }
        const wordM = super.measureText(words);
        texts.push({
            words: words.slice(0, words.length - 1),
            width: wordM.width,
            height: this.y() + heightW + wordM.hangingBaseline,
        });
        return texts;
    }

    editable(opt?: boolean) {
        const editable = this.__valueHandler(opt, "editable", false);
        if (!editable) return;
        const beforeValues: any = {};
        // using nodes
        let foundText;
        let foundTextIdx = 0;

        let foundLetter = "";
        let foundIdx = 0;
        this.mousedown((event: MouseEvent) => {
            super.font(this.#format_font);
            const initCords = this.canvas?.getCursorPosition(event);
            foundText = undefined;
            foundTextIdx = 0;

            for (const [key, values] of Object.entries(this.#letterSpecs)) {
                foundTextIdx += 1;
                if (
                    inRange(initCords.x, values.x, values.x + values.width) &&
                    inRange(initCords.y, values.y, values.y + values.height)
                ) {
                    foundText = key;
                    break;
                }
            }

            foundLetter = "";
            foundIdx = 0;

            if (foundText) {
                let realX = this.#letterSpecs[foundText].x;
                let realY = this.#letterSpecs[foundText].y;
                for (let [idk, letter] of Object.entries(foundText)) {
                    const measure = super.measureText(letter);
                    if (
                        inRange(initCords.x, realX, realX + measure.width) &&
                        inRange(
                            initCords.y,
                            realY,
                            realY + measure.hangingBaseline
                        )
                    ) {
                        foundLetter = letter;
                        foundIdx = Number(idk);
                        break;
                    }
                    realX += measure.width;
                }
            }
            console.log(foundLetter, foundIdx);
            beforeValues[this.nodeId!] = {};
        });
        this.keydown((e: KeyboardEvent) => {
            console.log(e.key);
            if (e.key === "Backspace") {
                if (foundIdx >= 0) foundIdx -= 1;
                else {
                }
            }
        });
    }

    text(opt?: string): string {
        const cacheT = this.ownOptions.text || "";
        const text = this.__valueHandler(opt, "text", "");
        if (text.length !== cacheT.length) {
            this.#updateText = () => {
                this.#splitedText = text.split(" ");
                let x = 0;
                const spaceW = super.measureText(" ").width;
                for (let i = 0, len = this.#splitedText.length; i < len; i++) {
                    const letter = this.#splitedText[i];
                    const measure = super.measureText(this.#splitedText[i]);
                    this.#letterSpecs[letter] = {
                        x: this.x() + x,
                        y: measure.hangingBaseline + this.y(),
                        width: measure.width,
                        height: measure.hangingBaseline,
                    };
                    x += measure.width + spaceW;
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

    resizeLineHeight(opt?: boolean) {
        return this.__valueHandler(opt, "resizeLineHeight", false);
    }
    scale(opt?: number): void {
        super.scale(opt);
        this.fontSize(this.fontSize() * (opt || 1));
    }

    generatePayload(): BlockPayload {
        const payload = super.generatePayload();
        payload.additionalParams = [this.text()];
        return payload;
    }
}
