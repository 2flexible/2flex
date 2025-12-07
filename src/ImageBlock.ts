import { Block } from "./Block";
import { IBlock, RepeatOption } from "./types";

type ObjectFit = "contain" | "cover" | "fill";

interface ImageOptions {
    clipX?: number;
    clipY?: number;
    clipWidth?: number;
    clipHeight?: number;
    objectFit?: ObjectFit;
    repeat?: RepeatOption;
}

export class ImageBlock extends Block {
    source: string;
    #cacheImage?: any;
    constructor(source: string, options: IBlock<ImageOptions>) {
        super(options);
        this.source = source;
        this.options = options;
    }

    __initSet(): void {
        if (!this.#cacheImage) {
            this.#cacheImage = new Image();
            this.#cacheImage.src = this.source;
            this.#cacheImage.addEventListener("load", () => this.#drawImage());
        } else this.#drawImage();
    }

    #drawImage() {
        const fit = this.objectFit();
        let width = this.#cacheImage.width;
        let height = this.#cacheImage.height;
        let x = this.canvasInit.x;
        let y = this.canvasInit.y;
        const repeat = this.repeat();
        if (repeat === "no-repeat") {
            if (fit === "contain") {
                if (this.#cacheImage.width > this.#cacheImage.height) {
                    if (this.#cacheImage.width > this.width()) {
                        height += Math.abs(this.height() - this.width());
                    } else {
                        height += this.height();
                    }
                } else if (this.#cacheImage.width < this.#cacheImage.height) {
                    if (this.#cacheImage.height > this.height())
                        width +=
                            Math.abs(this.height() - this.width()) +
                            this.width();
                    else width += this.width();
                }
            }
            if (fit === "cover") {
                width = this.clipWidth();
                height = this.clipHeight();
            }
        }
        let sizeW = width;
        let sizeH = height;
        while (true) {
            this.context.drawImage(
                this.#cacheImage,
                this.clipX(),
                this.clipY(),
                width,
                height,
                x,
                y,
                this.canvasInit.width,
                this.canvasInit.height
            );
            if (repeat === "repeat") {
                if (sizeW > this.canvasInit.width) {
                    x = this.canvasInit.x;
                    y *= 2;
                    sizeW = width;
                } else {
                    sizeW *= 2;
                    x += sizeW;
                }
                if (
                    sizeH > this.canvasInit.height &&
                    sizeW > this.canvasInit.width
                )
                    break;
            } else if (repeat === "repeat-x") {
                if (sizeW > this.canvasInit.width) break;
                sizeW *= 2;
                x += sizeW;
                break;
            } else if (repeat === "repeat-y") {
                if (sizeH > this.canvasInit.height) break;
                sizeH *= 2;
                y += sizeH;
            }
        }
    }
    repeat(opt?: RepeatOption) {
        return this.__cacheOption(opt, "repeat", "no-repeat");
    }
    clipX(opt?: number) {
        return this.__cacheOption(opt, "clipX", 0);
    }
    clipY(opt?: number) {
        return this.__cacheOption(opt, "clipY", 0);
    }
    clipWidth(opt?: number) {
        return this.__cacheOption(opt, "clipWidth", this.width());
    }
    clipHeight(opt?: number) {
        return this.__cacheOption(opt, "clipHeight", this.height());
    }
    objectFit(opt?: ObjectFit): ObjectFit {
        return this.__cacheOption(opt, "objectFit", "fill");
    }
    clip(opt?: boolean): boolean {
        return super.clip(opt);
    }
    hidden(opt?: boolean): boolean {
        return super.hidden(opt);
    }
    dragX(opt?: boolean): boolean {
        return super.dragX(opt);
    }
    dragY(opt?: boolean): boolean {
        return super.dragY(opt);
    }
    draggable(opt?: boolean): boolean {
        return super.draggable(opt);
    }
    set(options: IBlock<ImageOptions>): void {
        super.set(options);
    }
}
