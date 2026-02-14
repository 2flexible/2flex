import { Block } from "./Block";
import type { IBlock } from "./types";

export interface CursorPos {
    x: number;
    y: number;
}

export type GradientType = "linear" | "conic" | "radial";
export type LineJoinOpt = "miter" | "round" | "bevel";
export type LineDashOffset = number;
export type LineDash = number[];
export type LineWidth = number;
export type LineCapOpt = "butt" | "round" | "square";
export type FillRule = "nonzero" | "evenodd";
export type strokeStyle = string;
export type FillStyle = string;
export type Fill = boolean;
export type Storke = boolean;
export type Font = string;

export interface DrawText {
    text: string;
    x: number;
    y: number;
    maxWidth: number;
}

export type FontStretch =
    | "normal"
    | "ultra-condensed"
    | "extra-condensed"
    | "condensed"
    | "semi-condensed"
    | "semi-expanded"
    | "expanded"
    | "extra-expanded"
    | "ultra-expanded";

export type TextAlign = "start" | "end" | "center" | "left" | "right";

export type TextDirection = "ltr" | "rtl";

export type TextBaseline =
    | "alphabetic"
    | "top"
    | "hanging"
    | "middle"
    | "ideographic"
    | "bottom";

export type FontKerning = "normal" | "auto" | "none";

export type FontVariantCaps =
    | "normal"
    | "small-caps"
    | "all-small-caps"
    | "petite-caps"
    | "all-petite-caps"
    | "unicase"
    | "titling-caps";

export type FontWeight =
    | "normal"
    | "bold"
    | "bolder"
    | "lighter"
    | 100
    | 200
    | 300
    | 400
    | 500
    | 600
    | 700
    | 800
    | 900;

export type FontStyle = "normal" | "italic" | "oblique";

export type FontVariant = "normal" | "small-caps";

export type TextRendering =
    | "auto"
    | "optimizeSpeed"
    | "optimizeLegibility"
    | "geometricPrecision";

export interface GradientStops {
    stop: number;
    color: string;
}
export interface QuadraticCurveToOpt {
    cpx1: number;
    cpy1: number;
    endX: number;
    endY: number;
}
export interface BezierCurveToOpt extends QuadraticCurveToOpt {
    cpx2: number;
    cpy2: number;
}
export interface RadialGradient {
    x0: number;
    y0: number;
    r0: number;
    x1: number;
    y1: number;
    r1: number;
}
export interface LinearGradient {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
}
export type RepeatOption = "repeat" | "repeat-x" | "repeat-y" | "no-repeat";
export interface Pattern {
    imageSource: string;
    repeat: RepeatOption;
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface ConicGradient {
    angle: number;
    x: number;
    y: number;
}
export interface RectOpt extends CursorPos {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface RoundRectOpt extends RectOpt {
    // border-radius: [top-left, top-right, bottom-right, bottom-left]
    borderRadius: number[];
}
export interface PointInPath extends CursorPos {
    path?: Path2D;
    fillRule?: FillRule;
}
export interface PointInStroke extends CursorPos {
    path?: Path2D;
}

interface ShapeFilters {
    [key: string]: string | undefined;
    blur?: string;
    brightness?: string;
    contrast?: string;
    dropShadow?: string;
    grayscale?: string;
    hueRotate?: string;
    saturate?: string;
    sepia?: string;
}

export type BaseFilters =
    | "blur"
    | "brightness"
    | "contrast"
    | "drop-shadow"
    | "grayscale"
    | "hue-rotate"
    | "opacity"
    | "saturate"
    | "sepia";

export interface IShapeOptions {
    fill?: Fill;
    fillStyle?: FillStyle;

    stroke?: Storke;
    strokeStyle?: strokeStyle;

    line?: CursorPos;
    lineWidth?: LineWidth;
    lineDash?: LineDash[];
    lineCap?: LineCapOpt;
    lineJoin?: LineJoinOpt;

    bezierCurve?: BezierCurveToOpt;
    quadraticCurve?: QuadraticCurveToOpt;

    rect?: RectOpt;
    roundRect?: RoundRectOpt;
    strokeRect?: RectOpt;

    pointInPath?: PointInPath;
    pointInStroke?: PointInStroke;

    moveTo?: CursorPos;

    radialGradient?: RadialGradient
    linearGradient?: LinearGradient
    conicGradient?: ConicGradient
    colorStops?: GradientStops[];

    createPattern?: Pattern;

    blur?: number;
    brightness?: number;
    contrast?: number;
    dropShadow?: number;
    grayscale?: number;
    hueRotate?: number;
    saturate?: number;
    sepia?: number;

    fillText?: DrawText;
    strokeText?: DrawText;
    fontWeight?: FontWeight;
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
export class Shape<T> extends Block<T | IShapeOptions> {
    #gradient: any = null;
    #cachePattern: any = null;
    __filters: ShapeFilters = {
        blur: undefined,
        brightness: undefined,
        contrast: undefined,
        dropShadow: undefined,
        grayscale: undefined,
        hueRotate: undefined,
        saturate: undefined,
        sepia: undefined,
    };

    constructor(options: IBlock<IShapeOptions>) {
        super(options);
    }
    render(): void {
        this.position();
        this.__adjustBlocks();
        if (this.hidden()) {
            this.listAllChilds((n: Block) => {
                n.hidden(true);
            });
            return;
        }
        this.beginPath();
        if (this.ownOptions.lineDash) this.lineDash();
        if (this.ownOptions.lineWidth) this.lineWidth();
        if (this.ownOptions.lineCap) this.lineCap();
        if (this.ownOptions.shadowBlur) this.shadowBlur();
        if (this.ownOptions.shadowColor) this.shadowColor();
        if (this.ownOptions.fillStyle) this.fillStyle();
        if (this.ownOptions.fillRect) this.fillRect();
        if (this.ownOptions.rect) this.rect();
        if (this.ownOptions.strokeStyle) this.strokeStyle();

        this.context.save();
        this.context.translate(this.rotationCenterX(), this.rotationCenterY());
        this.context.rotate(this.rotate());
        this.context.translate(
            -this.rotationCenterX(),
            -this.rotationCenterY()
        );
        this.draw();
        this.context.restore();

        if (this.ownOptions.fill) this.fill();
        if (this.ownOptions.stroke) this.stroke();

        this.#contextFilter();
        // this.showHotAreas();
        if (this.__runningEvents.selected) this.__hotLines();
    }

    draw(_func?: (context: CanvasRenderingContext2D) => void) {
        if (_func) _func(this.context);
    }

    beginPath() {
        this.context?.beginPath();
    }
    closePath(): void {
        this.context?.closePath();
    }
    fill(opt?: Fill) {
        const fill = this.__valueHandler(opt, "fill", false);
        if (fill) this.context?.fill();
        return fill;
    }
    fillStyle(opt?: FillStyle) {
        const fillStyle = this.__valueHandler(opt, "fillStyle", "black");
        if (this.context) this.context.fillStyle = fillStyle;
        return fillStyle;
    }

    conicGradient(opt?: ConicGradient) {
        const { angle, x, y } = this.__valueHandler(opt, "conicGradient", {
            angle: 0,
            x: 0,
            y: 0,
        });
        this.#gradient = this.context?.createConicGradient(angle, x, y);
        return this.#gradient;
    }
    radialGradient(opt?: RadialGradient) {
        const { x0, y0, r0, x1, y1, r1 } = this.__valueHandler(
            opt,
            "radialGradient",
            {
                x0: 0,
                y0: 0,
                r0: 0,
                x1: 0,
                y1: 0,
                r1: 0,
            }
        );
        this.#gradient = this.context?.createRadialGradient(
            x0,
            y0,
            r0,
            x1,
            y1,
            r1
        );
        return this.#gradient;
    }
    linearGradient(opt?: LinearGradient) {
        const { x0, y0, x1, y1 } = this.__valueHandler(opt, "linearGradient", {
            x0: 0,
            y0: 0,
            x1: 0,
            y1: 0,
        });
        this.#gradient = this.context?.createLinearGradient(x0, y0, x1, y1);
        return this.#gradient;
    }
    createPattern(opt?: Pattern) {
        const { imageSource, repeat, x, y, width, height } =
            this.__valueHandler(opt, "createPattern", {
                imageSource: "",
                repeat: "no-repeat",
                x: 0,
                y: 0,
                width: 0,
                height: 0,
            });
        let pattern = null;
        if (!this.#cachePattern) {
            this.#cachePattern = new Image();
            this.#cachePattern.src = imageSource;
            this.#cachePattern.addEventListener("load", () => {
                pattern = this.context?.createPattern(
                    this.#cachePattern,
                    repeat
                );
                this.fillStyle(pattern as any);
                this.fillRect({ x, y, width, height });
            });
        } else {
            pattern = this.context?.createPattern(this.#cachePattern, repeat);
            this.fillStyle(pattern as any);
            this.fillRect({ x, y, width, height });
        }
    }

    colorStops(opt?: GradientStops[]) {
        const stops = this.__valueHandler<GradientStops[], GradientStops[]>(
            opt,
            "colorStops",
            []
        );
        for (let stop of stops) {
            this.#gradient.addColorStop(stop.stop, stop.color);
        }
        return stops;
    }
    stroke(opt?: Storke) {
        const stroke = this.__valueHandler(opt, "stroke", false);
        if (stroke) this.context?.stroke();
        return stroke;
    }
    strokeStyle(opt?: strokeStyle) {
        const strokeStyle = this.__valueHandler(opt, "strokeStyle", "black");
        if (this.context) this.context.strokeStyle = strokeStyle;
        return strokeStyle;
    }
    lineCap(opt?: LineCapOpt) {
        const lineCap = this.__valueHandler(opt, "lineCap", "butt");
        if (this.context) this.context.lineCap = lineCap;
        return lineCap;
    }

    lineWidth(opt?: LineWidth) {
        const lineWidth = this.__valueHandler(opt, "lineWidth", 0);
        if (this.context) this.context.lineWidth = lineWidth;
        return lineWidth;
    }
    shadowBlur(opt?: number) {
        const shadowBlur = this.__valueHandler(opt, "shadowBlur", 0);
        if (this.context) this.context.shadowBlur = shadowBlur;
        return shadowBlur;
    }
    shadowColor(opt?: string) {
        const shadowColor = this.__valueHandler(opt, "shadowColor", "black");
        if (this.context) this.context.shadowColor = shadowColor;
        return shadowColor;
    }
    shadowOffsetX(opt?: number) {
        const shadowOffsetX = this.__valueHandler(opt, "shadowOffsetX", 0);
        if (this.context) this.context.shadowOffsetX = shadowOffsetX;
        return shadowOffsetX;
    }
    shadowOffsetY(opt?: number) {
        const shadowOffsetY = this.__valueHandler(opt, "shadowOffsetY", 0);
        if (this.context) this.context.shadowOffsetY = shadowOffsetY;
        return shadowOffsetY;
    }
    lineDash(opt?: LineDash) {
        const lineDash = this.__valueHandler(opt, "lineDash", []);
        if (this.context) this.context.setLineDash(lineDash);
        return lineDash;
    }
    lineDashOffset(opt?: LineDashOffset) {
        const lineDash = this.__valueHandler(opt, "lineDash", 0);
        if (this.context) this.context.lineDashOffset = lineDash;
        return lineDash;
    }

    line(opt?: CursorPos) {
        const { x, y } = this.__valueHandler(opt, "line", { x: 0, y: 0 });
        this.context?.lineTo(x, y);
        return { x, y };
    }

    quadraticCurveTo(opt?: QuadraticCurveToOpt): void {
        const { cpx1, cpy1, endX, endY } = this.__valueHandler(
            opt,
            "quadraticCurveTo",
            { cpx1: 0, cpy1: 0, endX: 0, endY: 0 }
        );
        this.context?.quadraticCurveTo(cpx1, cpy1, endX, endY);
    }
    bezierCurveTo(opt?: BezierCurveToOpt): void {
        const { cpx1, cpy1, cpx2, cpy2, endX, endY } = this.__valueHandler(
            opt,
            "bezierCurveTo",
            { cpx1: 0, cpy1: 0, cpx2: 0, cpy2: 0, endX: 0, endY: 0 }
        );
        this.context?.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, endX, endY);
    }
    fillRect(opt?: RectOpt) {
        const { x, y, width, height } = this.__valueHandler(opt, "fillRect", {
            x: this.x(),
            y: this.y(),
            width: this.width(),
            height: this.height(),
        });
        this.context?.fillRect(
            this.x() + x,
            this.y() + y,
            this.width() - width,
            this.height() - height
        );
    }
    rect(opt?: RectOpt): void {
        const { x, y, width, height } = this.__valueHandler(opt, "rect", {
            x: this.x(),
            y: this.y(),
            width: this.width(),
            height: this.height(),
        });
        this.context?.rect(
            this.x() + x,
            this.y() + y,
            this.width() - width,
            this.height() - height
        );
    }
    roundRect(opt?: RoundRectOpt): void {
        const { x, y, width, height, borderRadius } = this.__valueHandler(
            opt,
            "roundRect",
            { x: 0, y: 0, width: 0, height: 0, borderRadius: [0] }
        );

        this.context?.roundRect(
            this.x() + x,
            this.y() + y,
            this.width() - width,
            this.height() - height,
            borderRadius
        );
    }
    strokeRect(opt?: RectOpt): void {
        const { x, y, width, height } = this.__valueHandler(opt, "strokeRect", {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        });
        this.context?.strokeRect(
            this.x() + x,
            this.y() + y,
            this.width() - width,
            this.height() - height
        );
    }
    // can be 2 different format, one opt with optinos giving paramters, two like this
    moveTo(opt?: CursorPos): void {
        const { x, y } = this.__valueHandler(opt, "moveTo", {
            x: 0,
            y: 0,
        });
        this.context?.moveTo(this.x() + x, this.y() + y);
    }
    lineJoin(opt?: LineJoinOpt) {
        const lineJoin = this.__valueHandler(opt, "lineJoin", "miter");
        if (this.context) this.context.lineJoin = lineJoin;
        return lineJoin;
    }
    pointInPath(opt?: PointInPath): void {
        const { path, x, y, fillRule } = this.__valueHandler(
            opt,
            "pointInPath",
            {
                path: undefined,
                x: 0,
                y: 0,
                fillRule: undefined,
            }
        );
        if (path)
            this.context?.isPointInPath(path, x, y, fillRule || "nonzero");
        else this.context.isPointInPath(x, y, fillRule || "nonzero");
    }
    pointInStroke(opt: PointInStroke): boolean {
        const { path, x, y } = this.__valueHandler(opt, "pointInStroke", {
            path: undefined,
            x: 0,
            y: 0,
        });
        if (path) return this.context?.isPointInStroke(path, x, y);
        else return this.context?.isPointInStroke(x, y);
    }

    font(opt?: Font) {
        const font = this.__valueHandler(opt, "font", "");
        if (this.context) this.context.font = font;
        return font;
    }

    fillText(opt?: DrawText) {
        const { text, x, y, maxWidth } = this.__valueHandler(opt, "fillText", {
            text: "",
            x: this.x(),
            y: this.y(),
            maxWidth: this.maxWidth(),
        });
        this.context?.fillText(text, x, y, maxWidth);
    }

    strokeText(opt?: DrawText) {
        const { text, x, y, maxWidth } = this.__valueHandler(
            opt,
            "strokeText",
            {
                text: "",
                x: this.x(),
                y: this.y(),
                maxWidth: this.maxWidth(),
            }
        );
        this.context?.strokeText(text, x, y, maxWidth);
    }

    fontStretch(opt?: FontStretch) {
        const fontStretch = this.__valueHandler(opt, "fontStretch", "normal");
        if (this.context) this.context.fontStretch = fontStretch;
        return fontStretch;
    }

    fontKerning(opt?: FontKerning) {
        const fontKerning = this.__valueHandler(opt, "fontKerning", "auto");
        if (this.context) this.context.fontKerning = fontKerning;
        return fontKerning;
    }

    fontVariantCaps(opt?: FontVariantCaps) {
        const fontVariantCaps = this.__valueHandler(
            opt,
            "fontVariantCaps",
            "normal"
        );
        if (this.context) this.context.fontVariantCaps = fontVariantCaps;
        return fontVariantCaps;
    }

    wordSpacing(opt?: string) {
        const wordSpacing = this.__valueHandler(
            `${opt}px`,
            "wordSpacing",
            "0px"
        );
        if (this.context) this.context.wordSpacing = wordSpacing;
        return wordSpacing;
    }

    direction(opt?: TextDirection) {
        const direction = this.__valueHandler(opt, "direction", "ltr");
        if (this.context) this.context.direction = direction;
        return direction;
    }

    letterSpacing(opt?: string) {
        const letterSpacing = this.__valueHandler(opt, "letterSpacing", "0px");
        if (this.context) this.context.letterSpacing = letterSpacing;
        return letterSpacing;
    }

    textAlign(opt?: TextAlign) {
        const textAlign = this.__valueHandler(opt, "textAlign", "start");
        if (this.context) this.context.textAlign = textAlign;
        return textAlign;
    }

    textBaseline(opt?: TextBaseline) {
        const textBaseline = this.__valueHandler(
            opt,
            "textBaseline",
            "alphabetic"
        );
        if (this.context) this.context.textBaseline = textBaseline;
        return textBaseline;
    }

    textRendering(opt?: TextRendering) {
        const textRendering = this.__valueHandler(opt, "textRendering", "auto");
        if (this.context) this.context.textRendering = textRendering;
        return textRendering;
    }

    measureText(opt?: string) {
        const text = this.__valueHandler(opt, "measureText", "");
        return this.context?.measureText(text);
    }

    #contextFilter() {
        let allStr = "";
        for (const [key, value] of Object.entries(this.__filters)) {
            if (value) allStr += ` ${key + value}`;
        }
        this.context.filter = allStr;
    }

    #filterHandler(filter?: BaseFilters, value?: string | number | number[]) {
        if (value === undefined || filter == undefined) return;
        switch (filter) {
            case "blur":
                value = value + "px";
                break;
            case "brightness":
                value = value + "%";
                break;
            case "contrast":
                value = value + "%";
                break;
            case "drop-shadow":
                let _s = "";
                (value as number[]).forEach((i) => {
                    if (typeof i == "string") _s += `${i}px`;
                    else _s += i;
                });
                value = _s;
                break;
            case "grayscale":
                value = value + "%";
                break;
            case "hue-rotate":
                value = value + "deg";
                break;
            case "opacity":
                value = value + "%";
                break;
            case "saturate":
                value = value + "%";
                break;
            case "sepia":
                value = value + "%";
                break;
        }
        this.__filters[filter] = `(${value})`;
    }

    blur(opt?: number) {
        const blur = this.__valueHandler(opt, "blur", undefined);
        this.#filterHandler("blur", blur);
        return blur;
    }
    brightness(opt?: number) {
        const brightness = this.__valueHandler(opt, "brightness", undefined);
        this.#filterHandler("brightness", brightness);
        return brightness;
    }
    contrast(opt?: number) {
        const contrast = this.__valueHandler(opt, "contrast", undefined);
        this.#filterHandler("contrast", contrast);
        return contrast;
    }
    dropShadow(opt?: [number, number, number, string][]) {
        const dropShadow = this.__valueHandler(opt, "dropShadow", []);
        this.#filterHandler("drop-shadow", dropShadow);
        return dropShadow;
    }
    grayscale(opt?: number) {
        const grayscale = this.__valueHandler(opt, "grayscale", undefined);
        this.#filterHandler("grayscale", grayscale);
        return grayscale;
    }
    hueRotate(opt?: number) {
        const hueRotate = this.__valueHandler(opt, "hueRotate", undefined);
        this.#filterHandler("hue-rotate", hueRotate);
        return hueRotate;
    }
    opacity(opt?: number) {
        const opacity = this.__valueHandler(opt, "opacity", undefined);

        this.#filterHandler("opacity", opacity);
        return opacity;
    }
    saturate(opt?: number) {
        const saturate = this.__valueHandler(opt, "saturate", undefined);

        this.#filterHandler("saturate", saturate);
        return saturate;
    }
    sepia(opt?: number) {
        const sepia = this.__valueHandler(opt, "sepia", undefined);
        this.#filterHandler("sepia", sepia);
        return sepia;
    }
}
