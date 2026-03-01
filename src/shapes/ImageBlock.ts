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

        let clipW = this.clipWidth();
        let clipH = this.clipHeight();

        if (!this.isRepeat) {
            if (fit === "contain") {
                clipW = width;
                clipH = height;
                if (height > this.height()) {
                    const aspectH = height / this.height();
                    clipH *= aspectH;
                    clipW *= aspectH;
                }
                if (width > this.width()) {
                    const aspectW = width / this.width();
                    clipW *= aspectW;
                    clipH *= aspectW;
                }
            } else if (fit === "cover") {
                clipW = this.#cacheImage.width;
                clipH = this.#cacheImage.height;
            } else if (fit === "fill") {
                width = this.width();
                height = this.height();
                clipW = this.#cacheImage.width;
                clipH = this.#cacheImage.height;
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
            let wPerImage = this.width();
            let hPerImage = this.height();
            if (this.repeatX() !== undefined) {
                if (this.repeatX() === "fill") wPerImage = width;
                else wPerImage = this.width() / this.repeatX()!;
            }

            if (this.repeatY() !== undefined) {
                if (this.repeatY() === "fill") hPerImage = height;
                else hPerImage = this.height() / this.repeatY()!;
            }

            while (this.height() > Math.ceil(wrapH)) {
                while (this.width() > Math.ceil(wrapW)) {
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
                    wrapW += wPerImage || this.width();
                    x += wPerImage || this.width();
                }
                wrapH += hPerImage || this.height();
                y += hPerImage || this.height();
                wrapW = 0;
                x = this.x();
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
        return this.__valueHandler(opt, "objectFit", undefined);
    }
}
