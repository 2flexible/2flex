import { Node } from "./Tree";
import { checkInBound } from "./Utils";

import {
    BlockElements,
    IBlock,
    BlockOptions,
    IStyle,
    AlignSelf,
    JustifySelf,
    Flex,
    FlexGrow,
    FlexShrink,
    FlexBasis,
    Position,
    IMouseEvents,
    XY,
} from "./types";

interface CanvasInit {
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex?: number;
}
type Corners = [XY, XY, XY, XY];
// Each element in the canvas is block
// each Block is Node
export class Block extends Node {
    canvas: any;
    options: BlockOptions;
    __events: any = {
        click: [],
        dbclick: [],
        mousedown: [],
        mouseup: [],
        mousemove: [],
        mouseenter: [],
        mouseleave: [],
        mouseout: [],
        mouseover: [],
    };
    // (x,y) as top left, top right, bottom left, bottom right.
    corners: Corners = [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
    ];

    canvasInit: CanvasInit = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        zIndex: 0,
    };
    styleChanges: IStyle[] = [];
    beforeInit = this.canvasInit;
    #boundries = this.canvasInit;
    #isPosApplied = false;
    #isResizing = false;
    #isRotating = false;
    #rotateDegree = 0;
    __filters: string[] = [];

    constructor(options: BlockOptions) {
        super();
        this.options = options;
        this.padding();
        this.margin();

        this.canvasInit["x"] = this.x() + this.marginLeft();
        this.canvasInit["y"] = this.y() + this.marginTop();
        this.canvasInit["width"] =
            this.width() + this.paddingLeft() + this.paddingRight();
        this.canvasInit["height"] =
            this.height() + this.paddingTop() + this.paddingBottom();

        this.corners[0][0] = this.corners[2][0] = this.canvasInit.x;
        this.corners[1][1] = this.corners[0][1] = this.canvasInit.y;
        this.corners[1][0] = this.corners[3][0] =
            this.canvasInit.x + this.canvasInit.width;
        this.corners[3][1] = this.corners[2][1] =
            this.canvasInit.y + this.canvasInit.height;

        this.beforeInit = {
            x: this.canvasInit.x,
            y: this.canvasInit.y,
            width: this.canvasInit.width,
            height: this.canvasInit.height,
        };
        this.#boundries = this.beforeInit;
    }

    __initSet() {
        this.context.filter = this.__filters.join(" ");
        const pos = this.position();
        if (pos === "fixed" && !this.options.draggable) {
            if (this.options.top) {
                this.canvasInit.y =
                    -this.canvas.__positionCords.y + this.options.top;
            } else if (this.options.bottom) {
                this.canvasInit.y =
                    -this.canvas.__positionCords.y +
                    Math.abs(this.canvas.height - this.canvasInit.height);
                -this.options.bottom;
            }

            if (this.options.left) {
                this.canvasInit.x =
                    -this.canvas.__positionCords.x + this.left();
            } else if (this.options.right) {
                this.canvasInit.x =
                    -this.canvas.__positionCords.x +
                    Math.abs(this.canvas.width - this.canvasInit.width) -
                    this.options.right;
            }
        }
        if (pos === "sticky" && !this.options.draggable) {
            if (this.canvas.__positionCords.y < 0) {
                if (
                    this.options.top &&
                    this.canvas.__positionCords.y <=
                        Math.abs(this.canvas.height - this.canvasInit.height) -
                            this.canvasInit.y
                ) {
                    this.canvasInit.y =
                        -this.canvas.__positionCords.y + this.options.top;
                }
            } else {
                if (
                    this.options.bottom &&
                    this.canvas.__positionCords.y + this.options.bottom >=
                        Math.abs(this.canvas.height - this.canvasInit.height) -
                            Math.abs(this.canvasInit.y)
                ) {
                    this.canvasInit.y =
                        -this.canvas.__positionCords.y +
                        Math.abs(this.canvas.height - this.canvasInit.height) -
                        this.options.bottom;
                }
            }
            if (this.canvas.__positionCords.x < 0) {
                if (
                    this.options.left &&
                    this.canvas.__positionCords.x <=
                        Math.abs(this.canvas.width - this.canvasInit.width) -
                            this.canvasInit.x
                ) {
                    this.canvasInit.x =
                        -this.canvas.__positionCords.x + this.options.left;
                }
            } else {
                const diffX = Math.abs(
                    this.canvas.width - this.canvasInit.width
                );
                if (
                    this.options.right &&
                    this.canvas.__positionCords.x + this.options.right >=
                        diffX - Math.abs(this.canvasInit.x)
                ) {
                    this.canvasInit.x =
                        -this.canvas.__positionCords.x +
                        diffX -
                        this.options.right;
                }
            }
        }
        if (pos === "absolute" && !this.#isPosApplied) {
            if (this.options.left !== undefined)
                this.canvasInit.x = this.options.left;
            else if (this.options.right !== undefined)
                this.canvasInit.x =
                    Math.abs(this.canvas.width - this.width()) -
                    this.options.right;
            if (this.options.top !== undefined)
                this.canvasInit.y = this.options.top;
            else if (this.options.bottom !== undefined)
                this.canvasInit.y =
                    Math.abs(this.canvas.height - this.height()) -
                    this.options.bottom;
            this.#isPosApplied = true;
        }
        if (pos === "relative" && !this.#isPosApplied) {
            if (this.options.left !== undefined)
                this.canvasInit.x += this.options.left;
            else if (this.options.right !== undefined)
                this.canvasInit.x -= this.options.right;
            if (this.options.top !== undefined)
                this.canvasInit.y += this.options.top;
            else if (this.options.bottom !== undefined)
                this.canvasInit.y -= this.options.bottom;
            this.#isPosApplied = true;
        }
        if (this.#rotateDegree !== 0) {
            this.context.translate(
                this.canvasInit.x + this.canvasInit.width / 2,
                this.canvasInit.y + this.canvasInit.height / 2
            );
            this.rotate((this.#rotateDegree * Math.PI) / 180);
            this.context.translate(
                -(this.canvasInit.x + this.canvasInit.width / 2),
                -(this.canvasInit.y + this.canvasInit.height / 2)
            );
        } else {
            this.context.setTransform(1, 0, 0, 1, 0, 0);
        }
        this.hotLines();
    }

    get context() {
        return this.canvas?.context;
    }

    hotLines(resizable: boolean = true) {
        const width = this.hotCornerSize();
        const height = this.hotCornerSize();
        const gap = this.hotAreaGap();
        let cornerX = this.canvasInit.x - gap;
        let cornerY = this.canvasInit.y - gap;

        let up = 1;
        let turn = 1;

        this.context.beginPath();
        for (let i = 0; i < 4; i++) {
            if (resizable)
                this.context.roundRect(
                    cornerX - width / 2,
                    cornerY - height / 2,
                    width,
                    height,
                    [0]
                );
            this.context.moveTo(cornerX, cornerY);
            if (i % 2 == 0) {
                cornerX += up * this.canvasInit.width + 2 * gap * up;
                up = -1;
            } else {
                cornerY += turn * this.canvasInit.height + 2 * gap * turn;
                turn = -1;
            }
            this.context.lineTo(cornerX, cornerY);
        }
        if (resizable) {
            this.context.fillStyle = "white";
            this.context.fill();
        }
        this.context.strokeStyle = "blue";
        this.context.stroke();
    }

    rotatable(opt?: boolean) {
        const rotatable = this.__cacheOption(opt, "rotatable", true);
        if (!rotatable) return false;

        let isMouseDown = false;

        const areaGap = this.hotAreaGap();
        const cornerSize = this.hotCornerSize();
        const gap = 10;
        let grap = false;
        let topMove = false;
        let leftMove = false;
        let isReverseX = 2;
        let isReverseY = 2;

        let startRotX =
            this.canvasInit.width / 2 +
            this.canvasInit.x +
            this.canvas.__positionCords.x;
        let startRotY =
            this.canvasInit.height / 2 +
            this.canvasInit.y +
            this.canvas.__positionCords.y;

        const mousemove = (event: MouseEvent) => {
            let { x, y } = this.canvas.getCursorPosition(event);
            // console.log(x, y);
            if (event.buttons == 0) {
                isMouseDown = false;
            }
            const centerX =
                this.canvasInit.x -
                this.canvas.__positionCords.x +
                this.canvasInit.width / 2;
            const centerY =
                this.canvasInit.y -
                this.canvas.__positionCords.y +
                this.canvasInit.height / 2;
            const R =
                Math.sqrt(
                    this.canvasInit.height ** 2 + this.canvasInit.width ** 2
                ) / 2;
            if (!isMouseDown) {
                if (event.buttons === 1) {
                    isMouseDown = true;
                    this.#isRotating = false;
                }
                const ltx = this.corners[0][0] - this.canvas.__positionCords.x;
                const lty = this.corners[0][1] - this.canvas.__positionCords.y;

                const rtx = this.corners[1][0] + this.canvas.__positionCords.x;
                const rty = this.corners[1][1] + this.canvas.__positionCords.y;

                const lbx = this.corners[2][0] - this.canvas.__positionCords.x;
                const lby = this.corners[2][1] - this.canvas.__positionCords.y;

                const rbx = this.corners[3][0] + this.canvas.__positionCords.x;
                const rby = this.corners[3][1] + this.canvas.__positionCords.y;

                console.log(isReverseX, isReverseY);
                console.log(centerY, rty, ltx);

                const lttx = ltx - isReverseX * areaGap + gap;
                const ltty = lty - isReverseY * areaGap + gap;

                const rttx = rtx + isReverseX * areaGap + gap;
                const rtty = rty + isReverseY * areaGap + gap;

                const lbbx = lbx - isReverseX * areaGap + gap;
                const lbby = lby - isReverseY * areaGap + gap;

                const rbbx = rbx + isReverseX * areaGap + gap;
                const rbby = rby + isReverseY * areaGap + gap;

                if (y <= lty && y >= ltty && x <= ltx && x >= lttx) {
                    topMove = true;
                    leftMove = true;
                    grap = true;
                } else if (y <= rty && y >= rtty && x >= rtx && x <= rttx) {
                    topMove = true;
                    leftMove = false;
                    grap = true;
                } else if (y >= lby && y <= lbby && x <= lbx && x >= lbbx) {
                    topMove = false;
                    leftMove = true;
                    grap = true;
                } else if (
                    ((y >= rby && y <= rbby) ||
                        (y <= rby && y >= rby - areaGap - gap)) &&
                    ((x >= rbx && x <= rbbx) ||
                        (x <= rbx && x >= rbx - areaGap - gap))
                ) {
                    topMove = false;
                    leftMove = false;
                    grap = true;
                } else {
                    grap = false;
                    isMouseDown = false;
                }
                console.log(x <= rbx && x >= rbx - areaGap - gap);
                if (grap) this.canvas.chageCursor("grab");
                else this.canvas.chageCursor();
            }
            if (isMouseDown) {
                this.#rotateDegree =
                    (Math.atan2(y - centerY, x - centerX) * 180) / Math.PI;
                const rad = (this.#rotateDegree * Math.PI) / 180;

                if (this.#rotateDegree >= -180) {
                    if (topMove && leftMove) {
                        this.#rotateDegree += 135;
                    } else if (topMove && !leftMove) {
                        this.#rotateDegree += 45;
                    } else if (!topMove && !leftMove) {
                        this.#rotateDegree -= 45;
                    } else if (!topMove && leftMove) {
                        this.#rotateDegree -= 135;
                    }
                }

                const endX = this.canvasInit.x + R * Math.cos(rad);
                const diffX = endX - startRotX;
                startRotX = endX;

                this.corners[0][0] += -diffX;
                this.corners[1][0] += -diffX;
                this.corners[2][0] += diffX;
                this.corners[3][0] += diffX;

                const endY = this.canvasInit.y + R * Math.sin(rad);
                const diffY = endY - startRotY;
                startRotY = endY;

                this.corners[0][1] += -diffY;
                this.corners[1][1] += diffY;
                this.corners[2][1] += -diffY;
                this.corners[3][1] += diffY;

                // if (this.corners[0][0] === centerX || this.corners[1][0] === centerX) isReverseX *= -1;
                // if (this.corners[0][1] === centerY || this.corners[3][1] === centerY) isReverseY *= -1;

                this.#isRotating = true;
                this.canvas.invokeChange();
            }
        };

        this.__eventHandler("mousemove", mousemove);

        return rotatable;
    }

    resizable(opt?: boolean): boolean {
        const resizable = this.__cacheOption(opt, "resizable", true);
        if (!resizable) return false;

        let isMouseDown = false;

        let initX = 0;
        let initY = 0;

        let beforeX = 0;
        let beforeY = 0;

        const areaGap = this.hotAreaGap();
        const cornerSize = this.hotCornerSize();

        let topResize = true;
        let leftResize = true;
        let xResize = false;
        let yResize = false;
        let cornerResize = false;

        const mousemove = (event: MouseEvent) => {
            const { x, y } = this.canvas.getCursorPosition(event);
            const l = this.canvasInit.x - this.canvas.__positionCords.x;
            const r =
                this.canvasInit.x +
                this.canvasInit.width +
                this.canvas.__positionCords.x;

            const t = this.canvasInit.y - this.canvas.__positionCords.y;
            const b =
                this.canvasInit.y +
                this.canvasInit.height +
                this.canvas.__positionCords.y;

            // left left, right right
            const ll = l - areaGap * 2;
            const rr = r + areaGap * 2;
            const tt = t - areaGap * 2;
            const bb = b + areaGap * 2;

            let inBound = false;

            if (event.buttons == 0) {
                isMouseDown = false;
            }
            if (!isMouseDown) {
                if (event.buttons == 1) {
                    initX = x;
                    initY = y;
                    beforeX = 0;
                    beforeY = 0;
                    isMouseDown = true;
                }

                if (x >= ll && x <= l && y >= t && y <= b) {
                    leftResize = true;
                    xResize = true;
                    yResize = false;
                    cornerResize = false;
                    inBound = true;
                }

                if (x <= rr && x >= r && y >= t && y <= b) {
                    leftResize = false;
                    xResize = true;
                    yResize = false;
                    cornerResize = false;
                    inBound = true;
                }

                if (y >= tt && y <= t && x >= l && x <= r) {
                    topResize = true;
                    xResize = false;
                    yResize = true;
                    cornerResize = false;
                    inBound = true;
                }

                if (y <= bb && y >= b && x >= l && x <= r) {
                    topResize = false;
                    xResize = false;
                    yResize = true;
                    cornerResize = false;
                    inBound = true;
                }

                if (y <= t && y >= tt && x <= l && x >= ll) {
                    topResize = true;
                    leftResize = true;
                    cornerResize = true;
                    inBound = true;
                }
                if (y <= t && y >= tt && x >= r && x <= rr) {
                    topResize = true;
                    leftResize = false;
                    cornerResize = true;
                    inBound = true;
                }
                if (y >= b && y <= bb && x <= l && x >= ll) {
                    topResize = false;
                    leftResize = true;
                    cornerResize = true;
                    inBound = true;
                }
                if (y >= b && y <= bb && x >= r && x <= rr) {
                    topResize = false;
                    leftResize = false;
                    cornerResize = true;
                    inBound = true;
                }
                if (inBound) {
                    let cursor;
                    if (!cornerResize)
                        cursor = xResize ? "w-resize" : "n-resize";
                    else {
                        xResize = true;
                        yResize = true;
                        if (
                            (topResize && leftResize) ||
                            (!topResize && !leftResize)
                        )
                            cursor = "nw-resize";
                        if (
                            (topResize && !leftResize) ||
                            (!topResize && leftResize)
                        )
                            cursor = "nesw-resize";
                    }
                    this.canvas.chageCursor(cursor);
                    this.#isResizing = true;
                } else {
                    this.canvas.chageCursor();
                    topResize = false;
                    leftResize = false;
                    xResize = false;
                    yResize = false;
                    cornerResize = false;
                    this.#isResizing = false;
                }
            }
            if (isMouseDown && !this.#isRotating) {
                let diffX = x - initX;
                let diffY = y - initY;
                this.beforeInit.x = this.canvasInit.x;
                this.beforeInit.y = this.canvasInit.y;

                if (diffX !== 0 && this.dragX() && xResize) {
                    if (leftResize) {
                        this.canvasInit.width -= diffX - beforeX;
                        this.canvasInit.x += diffX - beforeX;
                    } else {
                        this.canvasInit.width += diffX - beforeX;
                    }
                    beforeX = diffX;
                }
                if (diffY !== 0 && this.dragY() && yResize) {
                    if (topResize) {
                        this.canvasInit.height -= diffY - beforeY;
                        this.canvasInit.y += diffY - beforeY;
                    } else {
                        this.canvasInit.height += diffY - beforeY;
                    }
                    beforeY = diffY;
                }
                this.__adjustCordinates();
                this.canvas.invokeChange();
            }
        };

        this.__eventHandler("mousemove", mousemove);
        return resizable;
    }

    add(...block: BlockElements[]): void {
        this.addChild(block);
        this.__adjustCordinates();
        this.__adjustSpaces();
    }
    __adjustSpaces() {
        let boundaryX = this.canvasInit.x;
        let boundaryY = this.canvasInit.y;
        let boundaryWidth = boundaryX + this.canvasInit.width;
        let boundaryHeight = boundaryY + this.canvasInit.height;
        this._childs?.forEach((item: any) => {
            if (item) {
                item.canvasInit.x +=
                    this.x() +
                    this.marginLeft() +
                    this.paddingLeft() -
                    this.paddingRight();
                item.canvasInit.y +=
                    this.y() +
                    this.marginTop() +
                    this.paddingTop() -
                    this.paddingBottom();

                const w = item.canvasInit.width + item.canvasInit.x;
                const h = item.canvasInit.height + item.canvasInit.y;
                if (item.canvasInit.x < boundaryX)
                    boundaryX -= item.canvasInit.x;
                if (item.canvasInit.y < boundaryY)
                    boundaryY -= item.canvasInit.y;
                if (w > boundaryWidth) boundaryWidth += boundaryWidth - w;
                if (h > boundaryHeight) boundaryHeight += boundaryHeight - h;
            }
        });
        this.#boundries = {
            x: boundaryX,
            y: boundaryY,
            width: boundaryWidth,
            height: boundaryHeight,
        };
    }
    __adjustCordinates(before?: any): void {
        before = before || this.beforeInit;
        this._childs?.forEach((item: any) => {
            if (item) {
                item.canvasInit.x += this.canvasInit.x - before.x;
                item.canvasInit.y += this.canvasInit.y - before.y;
                item.__adjustCordinates(before);
            }
        });
    }

    x(opt?: number): number {
        const x = this.__cacheOption(opt, "x", 0);
        if (opt !== undefined) this.canvasInit.x = x;
        return x;
    }

    y(opt?: number): number {
        const y = this.__cacheOption(opt, "y", 0);
        if (opt !== undefined) this.canvasInit.y = y;
        return y;
    }

    width(opt?: number): number {
        const width = this.__cacheOption(opt, "width", 0);
        if (opt) this.canvasInit.width = width;
        return width;
    }

    height(opt?: number): number {
        const height = this.__cacheOption(opt, "height", 0);
        if (opt) this.canvasInit.height = height;
        return height;
    }
    position(opt?: Position) {
        return this.__cacheOption(opt, "position", "static");
    }
    top(opt?: number) {
        if (this.position() === "static") opt = 0;
        return this.__cacheOption(opt, "top", 0);
    }
    bottom(opt?: number) {
        if (this.position() === "static") opt = 0;
        return this.__cacheOption(opt, "bottom", 0);
    }
    left(opt?: number) {
        if (this.position() === "static") opt = 0;
        return this.__cacheOption(opt, "left", 0);
    }
    right(opt?: number) {
        if (this.position() === "static") opt = 0;
        return this.__cacheOption(opt, "right", 0);
    }
    hotCornerSize(opt?: number) {
        return this.__cacheOption(opt, "hotCornerSize", 5);
    }
    hotAreaGap(opt?: number) {
        return this.__cacheOption(opt, "hotAreaGap", 5);
    }
    blur(opt?: number) {
        const blur = this.__cacheOption(opt, "blur", 0);
        if (blur) this.__filters.push(`blur(${blur}px)`);
        return blur;
    }
    brightness(opt?: number) {
        const brightness = this.__cacheOption(opt, "brightness", 0);
        if (brightness) this.__filters.push(`brightness(${brightness}%)`);
        return brightness;
    }
    contrast(opt?: number) {
        const contrast = this.__cacheOption(opt, "contrast", 0);
        if (contrast) this.__filters.push(`contrast(${contrast}%)`);
        return contrast;
    }
    dropShadow(opt?: [number, number, number, string][]) {
        const dropShadow = this.__cacheOption(opt, "dropShadow", []);
        let _s = "";
        dropShadow.forEach((i) => {
            if (i instanceof Number) _s += `${i}px`;
            else _s += i;
        });
        if (dropShadow) this.__filters.push(`drop-shadow(${_s})`);
        return dropShadow;
    }
    grayscale(opt?: number) {
        const grayscale = this.__cacheOption(opt, "grayscale", 0);
        if (grayscale) this.__filters.push(`grayscale(${grayscale}%)`);
        return grayscale;
    }
    hueRotate(opt?: number) {
        const hueRotate = this.__cacheOption(opt, "hueRotate", 0);
        if (hueRotate) this.__filters.push(`hue-rotate(${hueRotate}deg)`);
        return hueRotate;
    }
    opacity(opt?: number) {
        const opacity = this.__cacheOption(opt, "opacity", 0);
        if (opacity) this.__filters.push(`opacity(${opacity}%)`);
        return opacity;
    }
    saturate(opt?: number) {
        const saturate = this.__cacheOption(opt, "saturate", 0);
        if (saturate) this.__filters.push(`saturate(${saturate}%)`);
        return saturate;
    }
    sepia(opt?: number) {
        const sepia = this.__cacheOption(opt, "sepia", 0);
        if (sepia) this.__filters.push(`sepia(${sepia}%)`);
        return sepia;
    }

    padding(opt?: number[]) {
        const padding = this.__cacheOption(opt, "padding", undefined);
        if (!padding) return padding;
        this.paddingTop(padding[0]);
        switch (padding.length) {
            case 1:
                this.paddingBottom(padding[0]);
                this.paddingLeft(padding[0]);
                this.paddingRight(padding[0]);
                break;
            case 2:
                this.paddingBottom(padding[0]);
                this.paddingLeft(padding[1]);
                this.paddingRight(padding[1]);
                break;
            case 3:
                this.paddingLeft(padding[1]);
                this.paddingRight(padding[1]);
                this.paddingBottom(padding[2]);
                break;
            case 4:
                this.paddingRight(padding[1]);
                this.paddingBottom(padding[2]);
                this.paddingLeft(padding[3]);
                break;
        }
        return padding;
    }
    paddingTop(opt?: number) {
        return this.__cacheOption(opt, "paddingTop", 0);
    }
    paddingBottom(opt?: number) {
        return this.__cacheOption(opt, "paddingBottom", 0);
    }
    paddingLeft(opt?: number) {
        return this.__cacheOption(opt, "paddingLeft", 0);
    }
    paddingRight(opt?: number) {
        return this.__cacheOption(opt, "paddingRight", 0);
    }
    margin(opt?: number[]) {
        const margin = this.__cacheOption(opt, "margin", undefined);
        if (!margin) return margin;
        this.marginTop(margin[0]);
        switch (margin.length) {
            case 1:
                this.marginBottom(margin[0]);
                this.marginLeft(margin[0]);
                this.marginRight(margin[0]);
                break;
            case 2:
                this.marginBottom(margin[0]);
                this.marginLeft(margin[1]);
                this.marginRight(margin[1]);
                break;
            case 3:
                this.marginLeft(margin[1]);
                this.marginRight(margin[1]);
                this.marginBottom(margin[2]);
                break;
            case 4:
                this.marginRight(margin[1]);
                this.marginBottom(margin[2]);
                this.marginLeft(margin[3]);
                break;
        }
        return margin;
    }
    marginTop(opt?: number) {
        return this.__cacheOption(opt, "marginTop", 0);
    }
    marginBottom(opt?: number) {
        return this.__cacheOption(opt, "marginBottom", 0);
    }
    marginLeft(opt?: number) {
        return this.__cacheOption(opt, "marginLeft", 0);
    }
    marginRight(opt?: number) {
        return this.__cacheOption(opt, "marginRight", 0);
    }
    flex(opt?: Flex) {
        const flex = this.__cacheOption(opt, "flex", [
            this.flexGrow(),
            this.flexShrink(),
            this.flexBasis(),
        ]);
        this.flexGrow(flex[0] as FlexGrow);
        this.flexShrink(flex[1] as FlexShrink);
        this.flexBasis(flex[2]) as FlexBasis;
        return flex;
    }

    flexBasis(opt?: FlexBasis): FlexBasis {
        return this.__cacheOption(opt, "flexBasis", "auto");
    }

    flexShrink(opt?: FlexShrink): FlexShrink {
        return this.__cacheOption(opt, "flexShrink", 0);
    }

    flexGrow(opt?: FlexGrow) {
        return this.__cacheOption(opt, "flexGrow", 0);
    }

    order(opt?: number): undefined | number {
        return this.__cacheOption(opt, "order", undefined);
    }

    alignSelf(opt?: AlignSelf) {
        return this.__cacheOption(opt, "alignSelf", "auto");
    }
    justifySelf(opt?: JustifySelf) {
        return this.__cacheOption(opt, "justifySelf", "auto");
    }
    gridRow(opt?: number[]) {
        return this.__cacheOption(opt, "gridRow", []);
    }
    gridRowStart(opt?: number | string) {
        return this.__cacheOption(opt, "gridRowStart", 0);
    }
    gridRowEnd(opt?: number | string) {
        return this.__cacheOption(opt, "gridRowEnd", 0);
    }
    gridColumn(opt?: number[]) {
        return this.__cacheOption(opt, "gridColumn", []);
    }
    gridColumnStart(opt?: number | string) {
        return this.__cacheOption(opt, "gridColumnStart", 0);
    }
    gridColumnEnd(opt?: number | string) {
        return this.__cacheOption(opt, "gridColumnEnd", 0);
    }
    gridArea(opt?: number[] | string) {
        const gridArea = this.__cacheOption(opt, "gridArea", []);
        this.gridRowStart(gridArea[0] || "auto");
        this.gridColumnStart(gridArea[1] || "auto");
        this.gridRowEnd(gridArea[2] || "auto");
        this.gridColumnEnd(gridArea[3] || "auto");
        return gridArea;
    }
    clip_path() {
        this.canvas.clipping_path.addRect(
            this.canvasInit.x,
            this.canvasInit.y,
            this.width(),
            this.height()
            // this.borderRadius()
        );
    }

    clip(opt?: boolean) {
        const clip = this.__cacheOption(opt, "clip", false);
        if (clip) {
            this.clip_path();

            if (!this.fillRule()) this.fillRule();

            this.context.clip(this.canvas.clipping_path.path, this.fillRule());
        }
        return clip;
    }

    fillRule(opt?: string) {
        return this.__cacheOption(opt, "fillRule", "nonzero");
    }

    zIndex(opt?: number): number | undefined {
        return this.__cacheOption(opt, "zIndex", undefined);
    }

    set(options?: IBlock<BlockOptions>): void {
        let cached = false;
        if (options)
            for (const [key, value] of Object.entries(options)) {
                const proto = Object.getPrototypeOf(this);
                const obj = Object.getOwnPropertyDescriptor(proto, key);

                const beforeOption = this.options[key];

                if (value) {
                    if (value !== beforeOption) {
                        obj?.value.call(this, value);
                    } else {
                        cached = true;
                    }
                }
            }

        if (!cached) {
            this.canvas?.invokeChange.call(this.canvas);
        }
    }

    __cacheOption<T>(opt: T | undefined, option: string, defaultOpt: T): T {
        if (this.options) {
            if (opt !== undefined) this.options[option] = opt;
            else if (this.options[option] !== undefined)
                return this.options[option];
            else this.options[option] = defaultOpt;
            return this.options[option];
        }
        return undefined as T;
    }

    reset() {}

    rotate(opt?: number): number {
        const rotate = this.__cacheOption(opt, "rotate", 0);
        this.context.rotate(rotate);
        return rotate;
    }
    // had to come first for block scaling
    scale(x: number, y: number) {
        this.context.scale(x, y);
    }
    bind(block: BlockElements[], options?: IBlock<BlockOptions>) {}

    find(queries?: IBlock<BlockOptions>) {
        return this.filterNodes(queries);
    }
    nthChild(opt?: number) {}
    checkInBound(_event: any): boolean {
        const { x, y } = this.canvas.getCursorPosition(_event);
        const borderWidth = this.options.borderWidth || 0;
        const startX =
            this.canvasInit.x - borderWidth + this.canvas.__positionCords.x;
        const endX =
            this.canvasInit.x +
            this.canvasInit.width +
            borderWidth +
            this.canvas.__positionCords.x;

        const startY =
            this.canvasInit.y - borderWidth + this.canvas.__positionCords.y;
        const endY =
            this.canvasInit.y +
            this.canvasInit.height +
            borderWidth +
            this.canvas.__positionCords.y;
        return checkInBound(x, y, startX, startY, endX, endY);
    }

    click(_func: (event: MouseEvent) => void) {
        const out = (event: MouseEvent) => {
            if (this.checkInBound(event)) {
                _func(event);
                this.canvas?.invokeChange.call(this.canvas);
            }
        };
        this.__eventHandler<MouseEvent>("click", out);
    }

    dbclick(_func: (event: MouseEvent) => void) {
        const out = (event: MouseEvent) => {
            if (this.checkInBound(event)) {
                _func(event);
                this.canvas?.invokeChange.call(this.canvas);
            }
        };
        this.__eventHandler<MouseEvent>("dblclick", out);
    }

    mousedown(_func: (event: MouseEvent) => void) {
        const out = (event: MouseEvent) => {
            if (this.checkInBound(event)) {
                _func(event);
                this.canvas?.invokeChange.call(this.canvas);
            }
        };
        this.__eventHandler<MouseEvent>("mousedown", out);
    }

    mouseup(_func: (event: MouseEvent) => void) {
        const out = (event: MouseEvent) => {
            if (this.checkInBound(event)) {
                _func(event);
                this.canvas?.invokeChange.call(this.canvas);
            }
        };
        this.__eventHandler<MouseEvent>("mouseup", out);
    }

    mousemove(_func: (event: MouseEvent) => void) {
        const out = (event: MouseEvent) => {
            if (this.checkInBound(event)) {
                _func(event);
                this.canvas?.invokeChange.call(this.canvas);
            }
        };
        this.__eventHandler<MouseEvent>("mousemove", out);
    }

    mouseenter(_func: (event: MouseEvent) => void) {
        const enter = (event: MouseEvent) => {
            const { x, y } = this.canvas.getCursorPosition(event);
            if (
                checkInBound(
                    x,
                    y,
                    this.#boundries.x,
                    this.#boundries.y,
                    this.#boundries.x + this.#boundries.width,
                    this.#boundries.y + this.#boundries.height
                )
            ) {
                _func(event);
                this.canvas?.invokeChange.call(this.canvas);
            }
        };
        this.__eventHandler<MouseEvent>("mousemove", enter);
    }

    mouseleave(_func: (event: MouseEvent) => void) {
        const leave = (event: MouseEvent) => {
            const { x, y } = this.canvas.getCursorPosition(event);
            if (
                !checkInBound(
                    x,
                    y,
                    this.#boundries.x,
                    this.#boundries.y,
                    this.#boundries.width,
                    this.#boundries.height
                )
            ) {
                _func(event);
                this.canvas?.invokeChange.call(this.canvas);
            }
        };
        this.__eventHandler<MouseEvent>("mousemove", leave);
    }

    mouseout(_func: (event: MouseEvent) => void) {
        const out = (event: MouseEvent) => {
            if (!this.checkInBound(event)) {
                _func(event);
                this.canvas?.invokeChange.call(this.canvas);
            }
        };
        this.__eventHandler<MouseEvent>("mousemove", out);
    }

    mouseover(_func: (event: MouseEvent) => void) {
        const over = (event: MouseEvent) => {
            if (this.checkInBound(event)) {
                _func(event);
                this.canvas?.invokeChange.call(this.canvas);
            }
        };
        this.__eventHandler<MouseEvent>("mousemove", over);
    }

    __eventHandler<E>(type: IMouseEvents, _func: (event: E) => void) {
        this.__events[type].push(_func);
    }
    dragX(opt?: boolean) {
        return this.__cacheOption(opt, "dragX", true);
    }
    dragY(opt?: boolean): boolean {
        return this.__cacheOption(opt, "dragY", true);
    }
    draggable(opt?: boolean): boolean {
        const draggable = this.__cacheOption(opt, "draggable", true);
        if (!draggable) return false;

        let isMouseDown = false;

        let initX = 0;
        let initY = 0;

        let beforeX = 0;
        let beforeY = 0;

        const mousemove = (event: MouseEvent) => {
            if (event.buttons == 0) isMouseDown = false;
            if (event.buttons == 1 && !this.#isResizing && !this.#isRotating) {
                const { x, y } = this.canvas.getCursorPosition(event);
                if (!isMouseDown && this.checkInBound(event)) {
                    initX = x;
                    initY = y;
                    beforeX = 0;
                    beforeY = 0;
                    isMouseDown = true;
                }
                if (isMouseDown) {
                    let diffX = x - initX;
                    let diffY = y - initY;
                    this.beforeInit.x = this.canvasInit.x;
                    if (diffX !== 0 && this.dragX()) {
                        this.canvasInit.x += diffX - beforeX;
                        beforeX = diffX;
                    }
                    this.beforeInit.y = this.canvasInit.y;
                    if (diffY !== 0 && this.dragY()) {
                        this.canvasInit.y += diffY - beforeY;
                        beforeY = diffY;
                    }
                    this.__adjustCordinates();
                    this.canvas?.invokeChange();
                }
            }
        };

        this.__eventHandler<MouseEvent>("mousemove", mousemove);

        return draggable;
    }
}
