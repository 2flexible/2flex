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

type Wrap = "letter" | "word" | "nowrap";

export interface ITextOptions {
    text?: string;
    color?: string;
    strokeWidth?: number;
    strokeColor?: string;
    fontFamily?: string;
    fontWeight?: FontWeight;
    fontSize?: number | string;
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
    wrap?: Wrap;
    onEdit?: () => void;
}

interface LetterNode {
    nodeId?: number;
    prev?: LetterNode;
    next?: LetterNode;
    letter?: string;
    width: number;
    wordWidth: number;
    height: number;
    x: number;
    y: number;
}

type Text = {
    words: string;
    width: number;
    height: number;
};

export class TextBlock extends ShapeBlock<ITextOptions> {
    #letterNode: LetterNode = {
        nodeId: 0,
        prev: undefined,
        next: undefined,
        letter: "",
        width: 0,
        wordWidth: 0,
        height: 0,
        x: 0,
        y: 0,
    };
    #updateText?: () => void;
    #stopTraverseSign = 0;
    #editable = false;
    #caretDrawer?: () => void;
    #highlightDrawer?: () => void;
    #words: Text[];

    constructor(text: string, options: IBlock<ITextOptions>) {
        super(options);
        this.text(text);
        this.#words = [];
    }

    draw(_func?: (context: CanvasRenderingContext2D) => void): void {
        const cacheR = this.rotate();
        this.rotate(0);
        super.font(this.#format_font);
        this.#updateText?.();
        this.#updateText = undefined;

        let words = this.#words;
        if (!this.useCacheText || this.#words.length === 0) {
            console.log("text working again");
            words = this.#wrapText();
        }
        let sumOfHeights = 0;

        if (this.resizeLineHeight())
            sumOfHeights =
                (this.height() -
                    words.reduce((p, n) => p + n.height - this.y(), 0)) /
                (words.length - 1);

        let heightP = 0;
        let heights = 0;

        if (this.#editable) this.#highlightDrawer?.();

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

    get useCacheText() {
        if (
            this.optionHasChanged("x") ||
            this.optionHasChanged("y") ||
            this.optionHasChanged("width") ||
            this.optionHasChanged("height") ||
            this.optionHasChanged("paddingLeft") ||
            this.optionHasChanged("paddingRight") ||
            this.optionHasChanged("paddingBottom") ||
            this.optionHasChanged("paddingTop") ||
            this.optionHasChanged("marginLeft") ||
            this.optionHasChanged("marginRight") ||
            this.optionHasChanged("marginBottom") ||
            this.optionHasChanged("marginTop") ||
            this.optionHasChanged("text") ||
            this.optionHasChanged("rotationCenterX") ||
            this.optionHasChanged("rotationCenterY") ||
            this.optionHasChanged("rotate") ||
            this.optionHasChanged("hidden")
        )
            return false;
        return true;
    }
    __hotLines(): void {
        if (!this.#editable) {
            super.__hotLines();
            this.#caretDrawer = undefined;
        } else {
            this.#caretDrawer?.();
        }
    }

    get #format_font() {
        return `${this.fontStyle()} ${this.fontVariant()} ${this.fontWeight()} ${this.fontSize()}px ${this.fontFamily()}`;
    }
    #wrapText(): Text[] {
        const texts: { words: string; width: number; height: number }[] = [];
        let words = "";
        let wrapW = 0;
        let wrapH = 0;
        let heights: number[] = [];
        let heightW = 0;
        let wrapX = 0;
        const isWrap = this.wrap() !== "nowrap";
        this.#traverseLetterNodes((node) => {
            wrapW += isWrap
                ? this.isWrapWord
                    ? node.wordWidth
                    : node.width
                : 0;
            if (wrapW >= this.width() && this.wrap()) {
                wrapW = this.isWrapWord ? node.wordWidth : node.width;
                wrapX = 0;
                wrapH += Math.max(...heights);
                const wordM = super.measureText(words);
                heightW += wordM?.actualBoundingBoxAscent || 0;
                texts.push({
                    words: words,
                    width: wordM?.width || 0,
                    height: this.y() + heightW,
                });
                words = "";
                heights = [];
            }

            node.x = this.x() + wrapX;
            node.y = this.y() + wrapH;
            wrapX += node.width;
            words += node.letter;
            heights.push(node.height);
        });
        const wordM = super.measureText(words);
        texts.push({
            words: words,
            width: wordM?.width || 0,
            height: this.y() + heightW + (wordM?.actualBoundingBoxAscent || 0),
        });
        this.#words = texts;
        return texts;
    }

    editable(opt?: boolean) {
        const editable = this.__valueHandler(opt, "editable", true);
        if (!editable) return editable;
        const beforeValues: any = {};

        let foundNode: LetterNode | undefined;
        let foundNodeId: number | undefined;
        const dummyLetter: LetterNode = {
            nodeId: undefined,
            prev: undefined,
            next: undefined,
            letter: "",
            width: 0,
            wordWidth: 0,
            height: 0,
            x: 0,
            y: 0,
        };

        let dbClick = false;

        this.dblclick(() => {
            if (!this.isEditbale) return;
            this.#editable = true;
            dbClick = true;
            foundNode = undefined;
            foundNodeId = undefined;
            this.#caretDrawer = undefined;
            this.#drawHighlight(
                this.x(),
                this.y(),
                this.width(),
                this.height()
            );
        });

        const mousedown = (event: MouseEvent) => {
            if (!this.checkInBound(event)) this.#editable = false;
            if (!this.#editable || this.isEditbale) return;
            this.#highlightDrawer = undefined;
            dbClick = false;
            const initCords = this.canvas?.getCursorPosition(event) || {
                x: 0,
                y: 0,
            };
            this.#traverseLetterNodes((node) => {
                if (
                    inRange(initCords.x, node.x, node.x + node.width) &&
                    inRange(initCords.y, node.y, node.y + node.height)
                ) {
                    if (inRange(initCords.x, node.x, node.x + node.width / 2)) {
                        foundNode = node.prev || node;
                    } else if (
                        inRange(
                            initCords.x,
                            node.x + node.width / 2,
                            node.x + node.width
                        )
                    ) {
                        foundNode = node;
                    }
                    this.#stopTraverse(true);
                }
            });
            if (foundNode) {
                foundNodeId = foundNode.nodeId;
                this.#drawCaret(
                    foundNode.x + foundNode.width,
                    foundNode.y + foundNode.height,
                    foundNode.x + foundNode.width,
                    foundNode.y
                );
            }
        };
        this.keydown((e: KeyboardEvent) => {
            if (!this.#editable || this.isEditbale) return;
            beforeValues[this.nodeId!] = {};
            if (dbClick) {
                foundNode = {
                    nodeId: 0,
                    prev: undefined,
                    next: undefined,
                    letter: "",
                    width: 0,
                    wordWidth: 0,
                    height: 0,
                    x: 0,
                    y: 0,
                };
                this.#letterNode = foundNode;
                foundNodeId = 0;
                this.#highlightDrawer = undefined;
                dbClick = false;
            }
            if (!foundNode || foundNodeId === undefined) return;
            if (e.key === "Backspace") {
                if (foundNodeId > 0) {
                    this.#removeLetterNode(foundNode);
                    foundNodeId -= 1;
                }
            } else if (e.key === "Tab") {
                dummyLetter.letter = "    ";
                this.#addAfter(foundNode, dummyLetter);
                foundNodeId += 4;
            } else {
                dummyLetter.letter = e.key;
                this.#addAfter(foundNode, dummyLetter);
                foundNodeId += 1;
            }
            foundNode = this.#findNode(foundNodeId);
            if (foundNode) {
                this.#drawCaret(
                    foundNode.x + foundNode.width,
                    foundNode.y + foundNode.height,
                    foundNode.x + foundNode.width,
                    foundNode.y
                );
            }
            this.onEdit()?.(e);
            dummyLetter.letter = "";
        });

        this.eventHandler("mousedown", mousedown, "editableClick");
        return editable;
    }

    get isEditbale() {
        return this.ownOptions["editable"]
            ? this.ownOptions["editable"]
            : false;
    }

    onEdit(opt?: (event: KeyboardEvent) => void) {
        const editE = this.__valueHandler<
            (event: KeyboardEvent) => void,
            ((event: KeyboardEvent) => void) | undefined
        >(opt, "onEdit", undefined);
        return (event: KeyboardEvent) => {
            editE?.(event);
        };
    }

    text(opt?: string): string {
        const cacheT = this.ownOptions.text || "";
        const text = this.__valueHandler(opt, "text", "");
        if (text !== cacheT) {
            this.#updateText = () => {
                const splitedText = text.split("");
                let x = 0;
                let prevNode = this.#letterNode;
                let pendingNode = undefined;
                let wordWidth = 0;
                const measure = super.measureText("");
                this.#letterNode.height = measure?.actualBoundingBoxAscent || 0;
                for (let i = 0, len = splitedText.length; i < len; i++) {
                    const measure = super.measureText(splitedText[i]);
                    const node = {
                        nodeId: i + 1,
                        prev: prevNode,
                        next: undefined,
                        letter: splitedText[i],
                        width: measure?.width || 0,
                        wordWidth: 0,
                        height: measure?.actualBoundingBoxAscent || 0,
                        x: x,
                        y: measure?.actualBoundingBoxAscent || 0 + this.y(),
                    };
                    prevNode.next = node;
                    prevNode = prevNode.next;
                    if (!pendingNode) pendingNode = prevNode;
                    wordWidth += measure?.width || 0;
                    if (splitedText[i] === " " || i === len - 1) {
                        pendingNode.wordWidth = wordWidth;
                        pendingNode = undefined;
                        wordWidth = 0;
                    }
                    x += measure?.width || 0;
                }
            };
        }
        return text;
    }

    #traverseLetterNodes(_func: (node: LetterNode) => void) {
        let next: LetterNode | undefined = this.#letterNode;
        this.#stopTraverse(false);
        while (next && this.#stopTraverseSign) {
            _func(next);
            next = next.next;
        }
    }

    #addAfter(targetNode: LetterNode, newNode: LetterNode) {
        let letters = "";
        this.#traverseLetterNodes((node) => {
            if (targetNode.nodeId === node.nodeId) {
                newNode.next = node.next;
                newNode.prev = node;
                node.next = newNode;
            }
            letters += node.letter;
        });
        this.text(letters);
        this.canvas?.invokeChange();
    }

    #addBefore(targetNode: LetterNode, newNode: LetterNode) {
        let prevNode = this.#letterNode;
        this.#traverseLetterNodes((node) => {
            if (targetNode.nodeId === node.nodeId) {
                prevNode.next = newNode;
                newNode.prev = prevNode;
                newNode.next = node;
                this.#stopTraverse(true);
            }
            prevNode = node;
        });
    }

    #findNode(nodeId: number): LetterNode | undefined {
        let foundNode;
        this.#traverseLetterNodes((node) => {
            if (nodeId === node.nodeId) {
                foundNode = node;
                this.#stopTraverse(true);
            }
        });
        return foundNode;
    }

    #stopTraverse(stop: boolean) {
        if (stop) this.#stopTraverseSign = 0;
        else this.#stopTraverseSign = 1;
    }
    #removeLetterNode(targetNode: LetterNode) {
        let prevNode = this.#letterNode;
        let letters = "";
        this.#traverseLetterNodes((node) => {
            if (targetNode.nodeId === node.nodeId) {
                prevNode.next = node.next;
            } else letters += node.letter;
            prevNode = node;
        });
        this.text(letters);
        this.canvas?.invokeChange();
    }

    #drawCaret(x: number, y: number, width: number, height: number) {
        this.#caretDrawer = () => {
            if (!this.context) return;
            this.context.beginPath();
            this.context.moveTo(x, y);
            this.context.lineTo(width, height);
            this.context.strokeStyle = "red";
            this.context.lineWidth = 2;
            this.context.stroke();
        };
        this.canvas?.invokeChange();
    }

    #drawHighlight(x: number, y: number, width: number, height: number) {
        if (!this.context) return;
        this.#highlightDrawer = () => {
            if (!this.context) return;
            this.context.beginPath();
            this.context.fillStyle = "rgba(0, 13, 255, 0.47)";
            this.context.fillRect(x, y, width, height);
        };
        this.canvas?.invokeChange();
    }

    get isWrapWord() {
        return this.wrap() === "word";
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

    wrap(opt?: Wrap) {
        return this.__valueHandler(opt, "wrap", "nowrap");
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
