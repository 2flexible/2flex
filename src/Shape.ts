import { Block } from "./Block";
import {
    IBlock,
    CursorPos,
    RectOpt,
    RoundRectOpt,
    FillRule,
    FillStyle,
    Fill,
    strokeStyle,
    Storke,
    LineWidth,
    LineDash,
    LineCapOpt,
    GradientStops,
    LineJoinOpt,
    LineDashOffset,
    BezierCurveToOpt,
    QuadraticCurveToOpt,
    PointInPath,
    PointInStroke,
} from "./types";

export interface IShapeOptions {
    fill?: Fill;
    fillStyle?: FillStyle;

    stroke?: Storke;
    strokeStyle?: strokeStyle;

    line?: CursorPos;
    lineWidth?: LineWidth;
    lineDash?: LineDash[];
    lineCap?: LineCapOpt;

    bezierCurve?: BezierCurveToOpt;
    quadraticCurve?: QuadraticCurveToOpt;

    rect?: RectOpt;
    roundRect?: RoundRectOpt;
    strokeRect?: RectOpt;

    pointInPath?: PointInPath;
    pointInStroke?: PointInStroke;

    moveTo?: CursorPos;
}
// each shape extends form common shape
export class Shape extends Block {
    #gradient: any = null;
    constructor(options?: IBlock<IShapeOptions>) {
        super(options);
        this.options = options || {};
    }
    __initSet(): void {
        if (this.hidden()) return;
        super.__initSet();
        this.draw();
    }

    draw(_func?: (context: CanvasRenderingContext2D) => void) {
        if (_func) _func(this.context);
    }

    beginPath() {
        this.context.beginPath();
    }

    closePath(): void {
        this.context.closePath();
    }
    hidden(opt?: boolean) {
        return super.hidden(opt);
    }
    fill(opt?: Fill) {
        const fill = this.__cacheOption(opt, "fill", false);
        if (fill) this.context.fill();
        return fill;
    }
    fillStyle(opt?: FillStyle) {
        const fillStyle = this.__cacheOption(opt, "fillStyle", "black");
        this.context.fillStyle = fillStyle;
        return fillStyle;
    }

    conicGradient({ angle, x, y }: { angle: number; x: number; y: number }) {
        this.#gradient = this.context.createConicGradient(angle, x, y);
        return this.#gradient;
    }
    radialGradient({
        x0,
        y0,
        r0,
        x1,
        y1,
        r1,
    }: {
        x0: number;
        y0: number;
        r0: number;
        x1: number;
        y1: number;
        r1: number;
    }) {
        this.#gradient = this.context.createRadialGradient(
            x0,
            y0,
            r0,
            x1,
            y1,
            r1
        );
        return this.#gradient;
    }
    linearGradient({
        x0,
        y0,
        x1,
        y1,
    }: {
        x0: number;
        y0: number;
        x1: number;
        y1: number;
    }) {
        this.#gradient = this.context.createLinearGradient(x0, y0, x1, y1);
        return this.#gradient;
    }
    colorStops(opt: GradientStops[]) {
        const stops = this.__cacheOption(opt, "colorStops", []);
        for (let stop of stops) {
            this.#gradient.addColorStop(stop.stop, stop.color);
        }
        return stops;
    }
    stroke(opt?: Storke) {
        const stroke = this.__cacheOption(opt, "stroke", false);
        if (stroke) this.context.stroke();
        return stroke;
    }
    strokeStyle(opt?: strokeStyle) {
        const strokeStyle = this.__cacheOption(opt, "strokeStyle", "black");
        this.context.strokeStyle = strokeStyle;
        return strokeStyle;
    }
    lineCap(opt?: LineCapOpt) {
        const lineCap = this.__cacheOption(opt, "lineCap", "butt");
        this.context.lineCap = lineCap;
        return lineCap;
    }

    lineWidth(opt?: LineWidth) {
        const lineWidth = this.__cacheOption(opt, "lineWidth", 0);
        this.context.lineWidth = lineWidth;
        return lineWidth;
    }
    shadowBlur(opt?: number) {
        const shadowBlur = this.__cacheOption(opt, "shadowBlur", 0);
        this.context.shadowBlur = shadowBlur;
        return shadowBlur;
    }
    shadowColor(opt?: string) {
        const shadowColor = this.__cacheOption(opt, "shadowColor", "black");
        this.context.shadowColor = shadowColor;
        return shadowColor;
    }
    shadowOffsetX(opt?: number) {
        const shadowOffsetX = this.__cacheOption(opt, "shadowOffsetX", 0);
        this.context.shadowOffsetX = shadowOffsetX;
        return shadowOffsetX;
    }
    shadowOffsetY(opt?: number) {
        const shadowOffsetY = this.__cacheOption(opt, "shadowOffsetY", 0);
        this.context.shadowOffsetY = shadowOffsetY;
        return shadowOffsetY;
    }
    filter(opt?: string) {
        const filter = this.__cacheOption(opt, "filter", "");
        this.context.filter = filter;
        return filter;
    }
    blur(opt?: number): number {
        return super.blur(opt);
    }
    brightness(opt?: number): number {
        return super.brightness(opt);
    }
    contrast(opt?: number): number {
        return super.contrast(opt);
    }
    dropShadow(opt?: [number, number, number, string][]) {
        return super.dropShadow(opt);
    }
    grayscale(opt?: number): number {
        return super.grayscale(opt);
    }
    hueRotate(opt?: number): number {
        return super.hueRotate(opt);
    }
    opacity(opt?: number): number {
        return super.opacity(opt);
    }
    sepia(opt?: number): number {
        return super.sepia(opt);
    }
    lineDash(opt?: LineDash) {
        const lineDash = this.__cacheOption(opt, "lineDash", []);
        this.context.setLineDash(lineDash);
        return lineDash;
    }
    lineDashOffset(opt?: LineDashOffset) {
        const lineDash = this.__cacheOption(opt, "lineDash", 0);
        this.context.lineDashOffset = lineDash;
        return lineDash;
    }

    line({ x, y }: CursorPos): void {
        this.context.lineTo(x, y);
    }
    quadraticCurve({ cpx1, cpy1, endX, endY }: QuadraticCurveToOpt): void {
        this.context.quadraticCurveTo(cpx1, cpy1, endX, endY);
    }

    bezierCurve({
        cpx1,
        cpy1,
        cpx2,
        cpy2,
        endX,
        endY,
    }: BezierCurveToOpt): void {
        this.context.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, endX, endY);
    }

    rect({ x, y, width, height }: RectOpt): void {
        this.context.rect(x, y, width, height);
    }
    roundRect({ x, y, width, height, borderRadius }: RoundRectOpt): void {
        this.context.roundRect(x, y, width, height, borderRadius);
    }
    strokeRect({ x, y, width, height }: RectOpt): void {
        this.context.strokeRect(x, y, width, height);
    }
    // can be 2 different format, one opt with optinos giving paramters, two like this
    moveTo({ x, y }: CursorPos): void {
        this.context.moveTo(x, y);
    }
    lineJoin(opt?: LineJoinOpt) {
        const lineJoin = this.__cacheOption(opt, "lineJoin", "miter");
        this.context.lineJoin = lineJoin;
        return lineJoin;
    }
    pointInPath({ path, x, y, fillRule }: PointInPath): void {
        fillRule = fillRule || "nonzero";
        if (path) this.context.isPointInPath(path, x, y, fillRule);
        else this.context.isPointInPath(x, y, fillRule);
    }
    pointInStroke({ path, x, y }: PointInStroke): boolean {
        if (path) return this.context.isPointInStroke(path, x, y);
        else return this.context.isPointInStroke(x, y);
    }
    clip(opt?: boolean): boolean {
        return super.clip(opt);
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
    set(options: IBlock<IShapeOptions>): void {
        super.set(options);
    }
}
