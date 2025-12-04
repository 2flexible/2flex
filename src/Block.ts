import { Node } from "./Tree";
import {
    checkInBound,
    fromCm,
    fromEm,
    fromIn,
    fromMm,
    fromPc,
    fromPercentage,
    fromPt,
    fromQ,
    fromRem,
    fromVH,
    fromVW,
} from "./Utils";

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
interface HotAreas {
    top: CanvasInit;
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
    #runningEvents = { drag: false, rotate: false, resize: false };
    hotAreas: any = {
        hotCornerTopLeft: {
            _func: null,
            x: 0,
            y: 0,
        },
        hotCornerTopRight: {
            _func: null,
            x: 0,
            y: 0,
        },
        hotCornerBottomLeft: {
            _func: null,
            x: 0,
            y: 0,
        },
        hotCornerBottomRight: {
            _func: null,
            x: 0,
            y: 0,
        },
        hotTop: {
            _func: null,
            x: 0,
            y: 0,
        },
        hotLeft: {
            _func: null,
            x: 0,
            y: 0,
        },
        hotRight: {
            _func: null,
            x: 0,
            y: 0,
        },
        hotBottom: {
            _func: null,
            x: 0,
            y: 0,
        },
    };
    #rotateDegree = 0;
    __filters: string[] = [];

    constructor(options?: BlockOptions) {
        super();
        this.options = options || {};
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
            this.context.rotate((this.#rotateDegree * Math.PI) / 180);
            this.context.translate(
                -(this.canvasInit.x + this.canvasInit.width / 2),
                -(this.canvasInit.y + this.canvasInit.height / 2)
            );
        } else {
            this.context.setTransform(1, 0, 0, 1, 0, 0);
        }
        this.hotLines();
    }

    get context(): CanvasRenderingContext2D {
        return this.canvas?.context;
    }

    hotTop(_func: (context: CanvasRenderingContext2D) => void) {
        this.hotAreas["hotTop"]["_func"] = _func;
    }
    hotLeft(_func: (context: CanvasRenderingContext2D) => void) {
        this.hotAreas["hotLeft"]["_func"] = _func;
    }
    hotRight(_func: (context: CanvasRenderingContext2D) => void) {
        this.hotAreas["hotRight"]["_func"] = _func;
    }
    hotBottom(_func: (context: CanvasRenderingContext2D) => void) {
        this.hotAreas["hotBottom"]["_func"] = _func;
    }

    hotCornerTopLeft(_func: (context: CanvasRenderingContext2D) => void) {
        this.hotAreas["hotCornerTopLeft"]["_func"] = _func;
    }
    hotCornerTopRight(_func: (context: CanvasRenderingContext2D) => void) {
        this.hotAreas["hotCornerTopRight"]["_func"] = _func;
    }
    hotCornerBottomLeft(_func: (context: CanvasRenderingContext2D) => void) {
        this.hotAreas["hotCornerBottomLeft"]["_func"] = _func;
    }
    hotCornerBottomRight(_func: (context: CanvasRenderingContext2D) => void) {
        this.hotAreas["hotCornerBottomRight"]["_func"] = _func;
    }

    hotLines() {
        const size = this.hotCornerSize();
        const gap = this.hotAreaGap();
        const radius = this.hotCornerRadius();
        const strokeWidth = this.hotCornerStrokeWidth();
        const strokeColor = this.hotCornerStrokeColor();
        const background = this.hotCornerBackgroundColor();
        const lineWidth = this.hotLineStrokeWidth();
        const lineColor = this.hotLineStrokeColor();

        this.hotAreas["hotCornerTopLeft"]["x"] = this.canvasInit.x - gap;
        this.hotAreas["hotCornerTopLeft"]["y"] = this.canvasInit.y - gap;
        this.hotAreas["hotCornerTopRight"]["x"] =
            this.canvasInit.x + this.canvasInit.width + gap;
        this.hotAreas["hotCornerTopRight"]["y"] = this.canvasInit.y - gap;
        this.hotAreas["hotCornerBottomLeft"]["x"] = this.canvasInit.x - gap;
        this.hotAreas["hotCornerBottomLeft"]["y"] =
            this.canvasInit.y + this.canvasInit.height + gap;
        this.hotAreas["hotCornerBottomRight"]["x"] =
            this.canvasInit.x + this.canvasInit.width + gap;
        this.hotAreas["hotCornerBottomRight"]["y"] =
            this.canvasInit.y + this.canvasInit.height + gap;

        this.context.beginPath();
        this.context.moveTo(
            this.hotAreas["hotCornerTopLeft"]["x"],
            this.hotAreas["hotCornerTopLeft"]["y"]
        );
        if (!this.hotAreas["hotTop"]["_func"]) {
            this.context.lineTo(
                this.hotAreas["hotCornerTopRight"]["x"],
                this.hotAreas["hotCornerTopRight"]["y"]
            );
            this.context.lineWidth = lineWidth;
            this.context.strokeStyle = lineColor;
            this.context.stroke();
        }

        this.context.beginPath();
        this.context.moveTo(
            this.hotAreas["hotCornerTopLeft"]["x"],
            this.hotAreas["hotCornerTopLeft"]["y"]
        );
        if (!this.hotAreas["hotLeft"]["_func"]) {
            this.context.lineTo(
                this.hotAreas["hotCornerBottomLeft"]["x"],
                this.hotAreas["hotCornerBottomLeft"]["y"]
            );
            this.context.lineWidth = lineWidth;
            this.context.strokeStyle = lineColor;
            this.context.stroke();
        }

        this.context.beginPath();
        this.context.moveTo(
            this.hotAreas["hotCornerBottomLeft"]["x"],
            this.hotAreas["hotCornerBottomLeft"]["y"]
        );
        if (!this.hotAreas["hotBottom"]["_func"]) {
            this.context.lineTo(
                this.hotAreas["hotCornerBottomRight"]["x"],
                this.hotAreas["hotCornerBottomRight"]["y"]
            );
            this.context.lineWidth = lineWidth;
            this.context.strokeStyle = lineColor;
            this.context.stroke();
        }

        this.context.beginPath();
        this.context.moveTo(
            this.hotAreas["hotCornerBottomRight"]["x"],
            this.hotAreas["hotCornerBottomRight"]["y"]
        );
        if (!this.hotAreas["hotRight"]["_func"]) {
            this.context.lineTo(
                this.hotAreas["hotCornerTopRight"]["x"],
                this.hotAreas["hotCornerTopRight"]["y"]
            );
            this.context.lineWidth = lineWidth;
            this.context.strokeStyle = lineColor;
            this.context.stroke();
        }

        this.context.beginPath();
        if (!this.hotAreas["hotCornerTopLeft"]["_func"]) {
            this.context.roundRect(
                this.hotAreas["hotCornerTopLeft"]["x"] - size / 2,
                this.hotAreas["hotCornerTopLeft"]["y"] - size / 2,
                size,
                size,
                radius
            );
            this.context.lineWidth = strokeWidth;
            this.context.strokeStyle = strokeColor;
            this.context.fillStyle = background;
            this.context.fill();
            this.context.stroke();
        } else {
            this.hotAreas["hotCornerTopLeft"]["_func"](this.context);
        }

        this.context.beginPath();
        if (!this.hotAreas["hotCornerTopRight"]["_func"]) {
            this.context.roundRect(
                this.hotAreas["hotCornerTopRight"]["x"] - size / 2,
                this.hotAreas["hotCornerTopRight"]["y"] - size / 2,
                size,
                size,
                radius
            );
            this.context.lineWidth = strokeWidth;
            this.context.strokeStyle = strokeColor;
            this.context.fillStyle = background;
            this.context.fill();
            this.context.stroke();
        } else {
            this.hotAreas["hotCornerTopRight"]["_func"](this.context);
        }

        this.context.beginPath();
        if (!this.hotAreas["hotCornerBottomLeft"]["_func"]) {
            this.context.roundRect(
                this.hotAreas["hotCornerBottomLeft"]["x"] - size / 2,
                this.hotAreas["hotCornerBottomLeft"]["y"] - size / 2,
                size,
                size,
                radius
            );
            this.context.lineWidth = strokeWidth;
            this.context.strokeStyle = strokeColor;
            this.context.fillStyle = background;
            this.context.fill();
            this.context.stroke();
        } else {
            this.hotAreas["hotCornerBottomLeft"]["_func"](this.context);
        }

        this.context.beginPath();
        if (!this.hotAreas["hotCornerBottomRight"]["_func"]) {
            this.context.roundRect(
                this.hotAreas["hotCornerBottomRight"]["x"] - size / 2,
                this.hotAreas["hotCornerBottomRight"]["y"] - size / 2,
                size,
                size,
                radius
            );
            this.context.lineWidth = strokeWidth;
            this.context.strokeStyle = strokeColor;
            this.context.fillStyle = background;
            this.context.fill();
            this.context.stroke();
        } else {
            this.hotAreas["hotCornerBottomRight"]["_func"](this.context);
        }
    }

    #rotateCords() {}

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

        let startRotX = 0;
        let startRotY = 0;

        let otherStartX = 0;
        let otherStartY = 0;

        const mousemove = (event: MouseEvent) => {
            if (this.#runningEvents.drag || this.#runningEvents.resize) return;

            let { x, y } = this.canvas.getCursorPosition(event);
            if (event.buttons == 0) {
                isMouseDown = false;
                this.#runningEvents.rotate = false;
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
                    this.#runningEvents.rotate = true;
                }
                const ltx = this.corners[0][0] - this.canvas.__positionCords.x;
                const lty = this.corners[0][1] - this.canvas.__positionCords.y;

                const rtx = this.corners[1][0] + this.canvas.__positionCords.x;
                const rty = this.corners[1][1] + this.canvas.__positionCords.y;

                const lbx = this.corners[2][0] - this.canvas.__positionCords.x;
                const lby = this.corners[2][1] - this.canvas.__positionCords.y;

                const rbx = this.corners[3][0] + this.canvas.__positionCords.x;
                const rby = this.corners[3][1] + this.canvas.__positionCords.y;

                const lttx = ltx - isReverseX * areaGap - gap;
                const ltty = lty - isReverseY * areaGap - gap;

                const rttx = rtx + isReverseX * areaGap + gap;
                const rtty = rty - isReverseY * areaGap - gap;

                const lbbx = lbx - isReverseX * areaGap - gap;
                const lbby = lby + isReverseY * areaGap + gap;

                const rbbx = rbx + isReverseX * areaGap + gap;
                const rbby = rby + isReverseY * areaGap + gap;

                if (
                    (y <= lty &&
                        y >= ltty &&
                        x <= ltx + isReverseX * areaGap + gap &&
                        x >= lttx) ||
                    (y <= lty + isReverseX * areaGap + gap &&
                        y >= ltty &&
                        x >= lttx &&
                        x <= ltx)
                ) {
                    topMove = true;
                    leftMove = true;
                    grap = true;
                    startRotX = this.corners[0][0];
                    startRotY = this.corners[0][1];
                    otherStartX = this.corners[2][0];
                    otherStartY = this.corners[2][1];
                } else if (
                    (y <= rty &&
                        y >= rtty &&
                        x >= rtx - isReverseX * areaGap - gap &&
                        x <= rttx) ||
                    (y <= rty + isReverseX * areaGap + gap &&
                        y >= rtty &&
                        x <= rttx &&
                        x >= rtx)
                ) {
                    topMove = true;
                    leftMove = false;
                    grap = true;
                    startRotX = this.corners[1][0];
                    startRotY = this.corners[1][1];
                    otherStartX = this.corners[0][0];
                    otherStartY = this.corners[0][1];
                } else if (
                    (y >= lby &&
                        y <= lbby &&
                        x <= lbx + isReverseX * areaGap + gap &&
                        x >= lbbx) ||
                    (y <= lbby &&
                        y >= lby - isReverseX * areaGap - gap &&
                        x >= lbbx &&
                        x <= lbx)
                ) {
                    topMove = false;
                    leftMove = true;
                    grap = true;
                    startRotX = this.corners[2][0];
                    startRotY = this.corners[2][1];
                    otherStartX = this.corners[3][0];
                    otherStartY = this.corners[3][1];
                } else if (
                    (y >= rby &&
                        y <= rbby &&
                        x >= rbx - isReverseX * areaGap - gap &&
                        x <= rbbx) ||
                    (y <= rbby &&
                        y >= rby - isReverseX * areaGap - gap &&
                        x <= rbbx &&
                        x >= rbx)
                ) {
                    topMove = false;
                    leftMove = false;
                    grap = true;
                    startRotX = this.corners[3][0];
                    startRotY = this.corners[3][1];
                    otherStartX = this.corners[1][0];
                    otherStartY = this.corners[1][1];
                } else {
                    grap = false;
                    isMouseDown = false;
                }
                if (grap) this.canvas.chageCursor("grab");
                else this.canvas.chageCursor();
            }
            if (isMouseDown) {
                this.#rotateDegree =
                    (Math.atan2(y - centerY, x - centerX) * 180) / Math.PI;
                const rad = (this.#rotateDegree * Math.PI) / 180;
                const endX = centerX + R * Math.cos(rad);
                const endY = centerY + R * Math.sin(rad);

                const diffX = endX - startRotX;
                const diffY = endY - startRotY;

                const rr = this.#rotateDegree - 90;
                const Rrad = (rr * Math.PI) / 180;

                const e1X = centerX + R * Math.cos(Rrad);
                const e1Y = centerY + R * Math.sin(Rrad);

                const eDiffX = e1X - otherStartX;
                const eDiffY = e1Y - otherStartY;
                if (this.#rotateDegree >= -180) {
                    if (topMove && leftMove) {
                        this.corners[0][0] += diffX;
                        this.corners[1][0] += -eDiffX;
                        this.corners[2][0] += eDiffX;
                        this.corners[3][0] += -diffX;

                        this.corners[0][1] += diffY;
                        this.corners[1][1] += -eDiffY;
                        this.corners[2][1] += eDiffY;
                        this.corners[3][1] += -diffY;
                        this.#rotateDegree += 135;
                    } else if (topMove && !leftMove) {
                        this.corners[0][0] += eDiffX;
                        this.corners[1][0] += diffX;
                        this.corners[2][0] += -diffX;
                        this.corners[3][0] += -eDiffX;

                        this.corners[0][1] += eDiffY;
                        this.corners[1][1] += diffY;
                        this.corners[2][1] += -diffY;
                        this.corners[3][1] += -eDiffY;
                        this.#rotateDegree += 45;
                    } else if (!topMove && !leftMove) {
                        this.corners[0][0] += -diffX;
                        this.corners[1][0] += eDiffX;
                        this.corners[2][0] += -eDiffX;
                        this.corners[3][0] += diffX;

                        this.corners[0][1] += -diffY;
                        this.corners[1][1] += eDiffY;
                        this.corners[2][1] += -eDiffY;
                        this.corners[3][1] += diffY;

                        this.#rotateDegree -= 45;
                    } else if (!topMove && leftMove) {
                        this.corners[0][0] += -eDiffX;
                        this.corners[1][0] += -diffX;
                        this.corners[2][0] += diffX;
                        this.corners[3][0] += eDiffX;

                        this.corners[0][1] += -eDiffY;
                        this.corners[1][1] += -diffY;
                        this.corners[2][1] += diffY;
                        this.corners[3][1] += eDiffY;

                        this.#rotateDegree -= 135;
                    }
                }
                startRotY = endY;
                startRotX = endX;

                otherStartX = e1X;
                otherStartY = e1Y;

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
            if (this.#runningEvents.drag || this.#runningEvents.rotate) return;

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
                this.#runningEvents.resize = false;
            }
            if (!isMouseDown) {
                if (event.buttons == 1) {
                    initX = x;
                    initY = y;
                    beforeX = 0;
                    beforeY = 0;
                    isMouseDown = true;
                    this.#runningEvents.resize = true;
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
                } else {
                    this.canvas.chageCursor();
                    topResize = false;
                    leftResize = false;
                    xResize = false;
                    yResize = false;
                    cornerResize = false;
                }
            }
            if (isMouseDown) {
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
                    const diff = diffY - beforeY;
                    if (topResize) {
                        if (this.canvasInit.height - diff < 0) {
                            this.canvasInit.height = 0;
                            return;
                        }
                        this.canvasInit.height -= diff;
                        this.canvasInit.y += diff;
                    } else {
                        if (this.canvasInit.height + diff < 0) {
                            this.canvasInit.height = 0;
                            return;
                        }
                        this.canvasInit.height += diff;
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
    __unitConverter(unit: string, val: number, parentS: number) {
        if (unit.endsWith("%")) fromPercentage(val, parentS);
        if (unit.endsWith("vh")) fromVH(val, this.canvas.height);
        if (unit.endsWith("vw")) fromVW(val, this.canvas.width);
        if (unit.endsWith("rem")) fromRem(val, parentS);
        if (unit.endsWith("em")) fromEm(val, parentS);
        if (unit.endsWith("cm")) fromCm(val);
        if (unit.endsWith("mm")) fromMm(val);
        if (unit.endsWith("q")) fromQ(val);
        if (unit.endsWith("in")) fromIn(val);
        if (unit.endsWith("pc")) fromPc(val);
        if (unit.endsWith("pt")) fromPt(val);
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
    hotCornerRadius(opt?: number[]) {
        return this.__cacheOption(opt, "hotCornerRadius", [0]);
    }
    hotCornerStrokeWidth(opt?: number) {
        return this.__cacheOption(opt, "hotCornerStrokeWidth", 0);
    }
    hotCornerStrokeColor(opt?: string) {
        return this.__cacheOption(opt, "hotCornerStrokeColor", "black");
    }
    hotCornerBackgroundColor(opt?: string) {
        return this.__cacheOption(opt, "hotCornerBackgroundColor", "white");
    }
    hotLineStrokeWidth(opt?: number) {
        return this.__cacheOption(opt, "hotTopStrokeWidth", 1);
    }
    hotLineStrokeColor(opt?: string) {
        return this.__cacheOption(opt, "hotTopStrokeColor", "blue");
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

    fillRule(opt?: CanvasFillRule): CanvasFillRule {
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

                if (value !== undefined) {
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
        this.#rotateDegree = rotate;
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
        const rad = ((this.#rotateDegree - 135) * Math.PI) / 180;
        const endX = centerX + R * Math.cos(rad);
        const endY = centerY + R * Math.sin(rad);

        const startRotX = this.corners[0][0];
        const startRotY = this.corners[0][1];
        const otherStartX = this.corners[2][0];
        const otherStartY = this.corners[2][1];

        const diffX = endX - startRotX;
        const diffY = endY - startRotY;

        const rr = (this.#rotateDegree - 135) - 90;
        const Rrad = (rr * Math.PI) / 180;

        const e1X = centerX + R * Math.cos(Rrad);
        const e1Y = centerY + R * Math.sin(Rrad);

        const eDiffX = e1X - otherStartX;
        const eDiffY = e1Y - otherStartY;

        console.log(diffX, diffY, eDiffX, eDiffY)

        this.corners[0][0] += diffX;
        this.corners[1][0] += -eDiffX;
        this.corners[2][0] += eDiffX;
        this.corners[3][0] += -diffX;

        this.corners[0][1] += diffY;
        this.corners[1][1] += -eDiffY;
        this.corners[2][1] += eDiffY;
        this.corners[3][1] += -diffY;
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

        const x1 = this.corners[0][0] + this.canvas.__positionCords.x;
        const y1 = this.corners[0][1] + this.canvas.__positionCords.y;

        const x2 = this.corners[1][0] + this.canvas.__positionCords.x;
        const y2 = this.corners[1][1] + this.canvas.__positionCords.y;

        const x3 = this.corners[2][0] + this.canvas.__positionCords.x;
        const y3 = this.corners[2][1] + this.canvas.__positionCords.y;

        const x4 = this.corners[3][0] + this.canvas.__positionCords.x;
        const y4 = this.corners[3][1] + this.canvas.__positionCords.y;

        return checkInBound(x, y, x1, y1, x2, y2, x3, y3, x4, y4);
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
                true
                // checkInBound(
                //     x,
                //     y,
                //     this.#boundries.x,
                //     this.#boundries.y,
                //     this.#boundries.x + this.#boundries.width,
                //     this.#boundries.y + this.#boundries.height
                // )
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
                true
                // !checkInBound(
                //     x,
                //     y,
                //     this.#boundries.x,
                //     this.#boundries.y,
                //     this.#boundries.width,
                //     this.#boundries.height
                // )
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
            if (this.#runningEvents.resize || this.#runningEvents.rotate)
                return;

            if (event.buttons == 0) {
                isMouseDown = false;
                this.#runningEvents.drag = false;
            }
            if (event.buttons == 1) {
                const { x, y } = this.canvas.getCursorPosition(event);
                if (!isMouseDown && this.checkInBound(event)) {
                    initX = x;
                    initY = y;
                    beforeX = 0;
                    beforeY = 0;
                    isMouseDown = true;
                    this.#runningEvents.drag = true;
                }
                if (isMouseDown) {
                    let diffX = x - initX;
                    let diffY = y - initY;
                    this.beforeInit.x = this.canvasInit.x;
                    if (diffX !== 0 && this.dragX()) {
                        this.canvasInit.x += diffX - beforeX;
                        this.corners[0][0] += diffX - beforeX;
                        this.corners[1][0] += diffX - beforeX;
                        this.corners[2][0] += diffX - beforeX;
                        this.corners[3][0] += diffX - beforeX;
                        beforeX = diffX;
                    }
                    this.beforeInit.y = this.canvasInit.y;
                    if (diffY !== 0 && this.dragY()) {
                        this.canvasInit.y += diffY - beforeY;
                        this.corners[0][1] += diffY - beforeY;
                        this.corners[1][1] += diffY - beforeY;
                        this.corners[2][1] += diffY - beforeY;
                        this.corners[3][1] += diffY - beforeY;
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
