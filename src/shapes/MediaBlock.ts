import type { IBlock } from "../types";
import { Shape } from "../Shape";

type ObjectFit = "contain" | "cover" | "fill";
type Smoothing = "low" | "medium" | "high";
type Repeat = number | "fill";
type MediaSource = string | HTMLImageElement;

interface ImageOptions {
    clipX?: number;
    clipY?: number;
    clipWidth?: number;
    clipHeight?: number;
    objectFit?: ObjectFit;
    smoothing?: boolean;
    smoothingQuality?: Smoothing;
    repeatX?: Repeat;
    repeatY?: Repeat;
}

export class MediaBlock extends Shape<ImageOptions> {
    source: MediaSource;
    #cacheImage?: any;
    constructor(source: MediaSource, options: IBlock<ImageOptions>) {
        super(options);
        this.source = source;
    }

    draw(_func?: (context: CanvasRenderingContext2D) => void): void {
        if (!this.#cacheImage) {
            if (typeof this.source === "string") {
                this.#cacheImage = new Image();
                this.#cacheImage.src = this.source;
            } else this.#cacheImage = this.source;
            this.#cacheImage.addEventListener("load", () => this.#drawImage());
        } else this.#drawImage();
    }

    #drawImage() {
        const fit = this.objectFit();
        let width = this.#cacheImage.width;
        let height = this.#cacheImage.height;

        let wrapW = 0;
        let wrapH = 0;
        let x = this.x();
        let y = this.y();

        let clipW = width;
        let clipH = height;

        let cacheW = clipW;
        let cacheH = clipH;
        if (!this.isRepeat) {
            if (fit === "contain") {
                if (width > this.width()) {
                    clipW += Math.abs(width - this.width());
                    width = this.width();
                    clipH += clipW - cacheW;
                    height = this.height();
                } else if (height > this.height()) {
                    clipH += Math.abs(height - this.height());
                    height = this.height();
                    clipW += clipH - cacheH;
                    width = this.width();
                }
                cacheW = clipW;
                cacheH = clipH;
            } else if (fit === "cover") {
                width = this.clipWidth();
                height = this.clipHeight();
            }
            this.context?.drawImage(
                this.#cacheImage,
                this.clipX(),
                this.clipY(),
                clipW,
                clipH,
                x,
                y,
                width,
                height
            );
        } else {
            let wPerImage = width;
            let hPerImage = height;
            if (this.repeatX() !== undefined) {
                if (this.repeatX() === "fill") wPerImage = width;
                else wPerImage = this.width() / this.repeatX()!;
            }

            if (this.repeatY() !== undefined) {
                if (this.repeatY() === "fill") hPerImage = height;
                else hPerImage = this.height() / this.repeatY()!;
            }

            while (this.width() > Math.ceil(wrapW)) {
                while (this.height() > Math.ceil(wrapH)) {
                    this.context?.drawImage(
                        this.#cacheImage,
                        this.clipX(),
                        this.clipY(),
                        width - this.clipX(),
                        height - this.clipY(),
                        x,
                        y,
                        wPerImage,
                        hPerImage
                    );
                    wrapH += hPerImage || this.height();
                    y += hPerImage || this.height();
                }
                wrapW += wPerImage || this.width();
                x += wPerImage || this.width();
                wrapH = 0;
                y = this.y();
            }
        }
    }

    get isRepeat() {
        return this.repeatX() !== undefined || this.repeatY() !== undefined;
    }

    smoothing(opt?: boolean) {
        const enabled = this.__valueHandler(opt, "smoothing", false);
        if (this.context) this.context.imageSmoothingEnabled = enabled;
        return enabled;
    }
    smoothingQuality(opt?: Smoothing) {
        const quality = this.__valueHandler(opt, "smoothingQuality", "low");
        if (this.context) this.context.imageSmoothingQuality = quality;
        return quality;
    }
    repeatX(opt?: Repeat) {
        return this.__valueHandler(opt, "repeatX", undefined);
    }
    repeatY(opt?: Repeat) {
        return this.__valueHandler(opt, "repeatY", undefined);
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
    objectFit(opt?: ObjectFit) {
        return this.__valueHandler(opt, "objectFit", "fill");
    }
}
