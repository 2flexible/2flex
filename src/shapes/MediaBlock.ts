import { Block } from "./Block";
import type { IBlock } from "./types";
import type { RepeatOption } from "./Shape";

type ObjectFit = "contain" | "cover" | "fill";
type Smoothing = "low" | "medium" | "high";

interface ImageOptions {
    clipX?: number;
    clipY?: number;
    clipWidth?: number;
    clipHeight?: number;
    objectFit?: ObjectFit;
    smoothing?: boolean;
    smoothingQuality?: Smoothing;
    repeat?: RepeatOption;
}

export class MediaBlock extends Block {
    source: string;
    #cacheImage?: any;
    constructor(source: string, options: IBlock<ImageOptions>) {
        super(options);
        this.source = source;
        this.options = options;
    }

    render(): void {
        super.render()
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
        let x = this.x();
        let y = this.y();
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
                this.width(),
                this.height()
            );
            if (repeat === "repeat") {
                if (sizeW > this.width()) {
                    x = this.x();
                    y *= 2;
                    sizeW = width;
                } else {
                    sizeW *= 2;
                    x += sizeW;
                }
                if (sizeH > this.height() && sizeW > this.width()) break;
            } else if (repeat === "repeat-x") {
                if (sizeW > this.width()) break;
                sizeW *= 2;
                x += sizeW;
                break;
            } else if (repeat === "repeat-y") {
                if (sizeH > this.height()) break;
                sizeH *= 2;
                y += sizeH;
            }
        }
    }
    smoothing(opt?: boolean) {
        const enabled = this.__valueHandler(opt, "smoothing", false);
        this.context.imageSmoothingEnabled = enabled;
        return enabled;
    }
    smoothingQuality(opt?: Smoothing) {
        const quality = this.__valueHandler(opt, "smoothingQuality", "low");
        this.context.imageSmoothingQuality = quality;
        return quality;
    }
    repeat(opt?: RepeatOption) {
        return this.__valueHandler(opt, "repeat", "no-repeat");
    }
    clipX(opt?: number) {
        return this.__valueHandler(opt, "clipX", 0);
    }
    clipY(opt?: number) {
        return this.__valueHandler(opt, "clipY", 0);
    }
    clipWidth(opt?: number) {
        return this.__valueHandler(opt, "clipWidth", this.width());
    }
    clipHeight(opt?: number) {
        return this.__valueHandler(opt, "clipHeight", this.height());
    }
    objectFit(opt?: ObjectFit): ObjectFit {
        return this.__valueHandler(opt, "objectFit", "fill");
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
