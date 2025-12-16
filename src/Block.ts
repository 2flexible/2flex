import { Node } from "./Tree";
import {
    checkInBound,
    degreeToRadian,
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
    getRadiusByWH,
    radianToDegree,
    cubicBezier,
    lerp,
    linear,
    steps,
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
    CursorPos,
    KeyFrame,
    Easing,
    Delay,
    PlaybackRate,
    Direction,
    Duration,
    IterationStart,
    Composite,
    Iterations,
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

    #keyframeIterations: any = {};
    #lastAnimationId: number = 0;
    __animationOn: any = [];
    #isPosApplied = false;
    #center: CursorPos = { x: 0, y: 0 };
    #runningEvents = { drag: false, rotate: false, resize: false };

    hotAreaCorners: Corners = [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
    ];

    hotAreaRotCorners: Corners = [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
    ];

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

        this.__updateCornerCords();

        this.beforeInit = {
            x: this.canvasInit.x,
            y: this.canvasInit.y,
            width: this.canvasInit.width,
            height: this.canvasInit.height,
        };
        const centerX = this.rotationCenterX() || this.canvasInit.width / 2;
        const centerY = this.rotationCenterY() || this.canvasInit.height / 2;
        this.#center = {
            x: this.canvasInit.x + centerX,
            y: this.canvasInit.y + centerY,
        };
        this.#boundries = this.beforeInit;
    }

    __initSet() {
        if (this.hidden()) return;
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
            this.context.translate(this.#center.x, this.#center.y);
            this.context.rotate((this.#rotateDegree * Math.PI) / 180);
            this.context.translate(-this.#center.x, -this.#center.y);
        } else {
            this.context.setTransform(1, 0, 0, 1, 0, 0);
        }
        this.hotLines();
    }

    get context(): CanvasRenderingContext2D {
        return this.canvas?.context;
    }

    __updateCornerCords() {
        const gap = this.hotAreaGap();
        const ggap = 20;
        this.corners[0][0] = this.corners[2][0] = this.canvasInit.x;
        this.corners[1][1] = this.corners[0][1] = this.canvasInit.y;
        this.corners[1][0] = this.corners[3][0] =
            this.canvasInit.x + this.canvasInit.width;
        this.corners[3][1] = this.corners[2][1] =
            this.canvasInit.y + this.canvasInit.height;

        this.hotAreaCorners[2][0] = this.hotAreaCorners[0][0] =
            this.canvasInit.x - gap;
        this.hotAreaCorners[1][1] = this.hotAreaCorners[0][1] =
            this.canvasInit.y - gap;
        this.hotAreaCorners[3][0] = this.hotAreaCorners[1][0] =
            this.canvasInit.x + this.canvasInit.width + gap;
        this.hotAreaCorners[3][1] = this.hotAreaCorners[2][1] =
            this.canvasInit.y + this.canvasInit.height + gap;

        this.hotAreaRotCorners[2][0] = this.hotAreaRotCorners[0][0] =
            this.hotAreaCorners[0][0] - ggap;
        this.hotAreaRotCorners[1][1] = this.hotAreaRotCorners[0][1] =
            this.hotAreaCorners[0][1] - ggap;
        this.hotAreaRotCorners[3][0] = this.hotAreaRotCorners[1][0] =
            this.hotAreaCorners[1][0] + ggap;
        this.hotAreaRotCorners[3][1] = this.hotAreaRotCorners[2][1] =
            this.hotAreaCorners[2][1] + ggap;
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

        this.hotAreas["hotCornerBottomLeft"]["x"] = this.hotAreas[
            "hotCornerTopLeft"
        ]["x"] = this.canvasInit.x - gap;

        this.hotAreas["hotCornerTopRight"]["y"] = this.hotAreas[
            "hotCornerTopLeft"
        ]["y"] = this.canvasInit.y - gap;

        this.hotAreas["hotCornerBottomRight"]["x"] = this.hotAreas[
            "hotCornerTopRight"
        ]["x"] = this.canvasInit.x + this.canvasInit.width + gap;

        this.hotAreas["hotCornerBottomRight"]["y"] = this.hotAreas[
            "hotCornerBottomLeft"
        ]["y"] = this.canvasInit.y + this.canvasInit.height + gap;

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

    rotationCenterX(opt?: number) {
        return this.__cacheOption(opt, "rotationCenterX", undefined);
    }
    rotationCenterY(opt?: number) {
        return this.__cacheOption(opt, "rotationCenterY", undefined);
    }
    rotationTopLeft(opt?: boolean) {
        return this.__cacheOption(opt, "rotationTopLeft", true);
    }
    rotationTopRight(opt?: boolean) {
        return this.__cacheOption(opt, "rotationTopRight", true);
    }
    rotationBottomLeft(opt?: boolean) {
        return this.__cacheOption(opt, "rotationBottomLeft", true);
    }
    rotationBottomRight(opt?: boolean) {
        return this.__cacheOption(opt, "rotationBottomRight", true);
    }

    resizeTopLeft(opt?: boolean) {
        return this.__cacheOption(opt, "resizeTopLeft", true);
    }
    resizeTopRight(opt?: boolean) {
        return this.__cacheOption(opt, "resizeTopRight", true);
    }
    resizeBottomLeft(opt?: boolean) {
        return this.__cacheOption(opt, "resizeBottomLeft", true);
    }
    resizeBottomRight(opt?: boolean) {
        return this.__cacheOption(opt, "resizeBottomRight", true);
    }
    resizeTop(opt?: boolean) {
        return this.__cacheOption(opt, "resizeTop", true);
    }
    resizeLeft(opt?: boolean) {
        return this.__cacheOption(opt, "resizeLeft", true);
    }
    resizeRight(opt?: boolean) {
        return this.__cacheOption(opt, "resizeRight", true);
    }
    resizeBottom(opt?: boolean) {
        return this.__cacheOption(opt, "resizeBottom", true);
    }

    rotatable(opt?: boolean) {
        const rotatable = this.__cacheOption(opt, "rotatable", true);
        if (!rotatable) return false;

        let isMouseDown = false;

        let topMove = false;
        let leftMove = false;

        let startRotX = 0;
        let startRotY = 0;

        let otherStartX = 0;
        let otherStartY = 0;

        const mousemove = (event: MouseEvent) => {
            if (this.#runningEvents.drag || this.#runningEvents.resize) return;
            let cursor = undefined;
            let { x, y } = this.canvas.getCursorPosition(event);
            if (event.buttons == 0) {
                isMouseDown = false;
                this.#runningEvents.rotate = false;
            }
            const R = getRadiusByWH(
                this.canvasInit.width,
                this.canvasInit.height
            );
            if (!isMouseDown) {
                if (event.buttons === 1) {
                    isMouseDown = true;
                    this.#runningEvents.rotate = true;
                }
                const ltx = this.hotAreaCorners[0][0];
                const lty = this.hotAreaCorners[0][1];
                const rtx = this.hotAreaCorners[1][0];
                const rty = this.hotAreaCorners[1][1];
                const lbx = this.hotAreaCorners[2][0];
                const lby = this.hotAreaCorners[2][1];
                const rbx = this.hotAreaCorners[3][0];
                const rby = this.hotAreaCorners[3][1];

                const hltx = this.hotAreaRotCorners[0][0];
                const hlty = this.hotAreaRotCorners[0][1];
                const hrtx = this.hotAreaRotCorners[1][0];
                const hrty = this.hotAreaRotCorners[1][1];
                const hlbx = this.hotAreaRotCorners[2][0];
                const hlby = this.hotAreaRotCorners[2][1];
                const hrbx = this.hotAreaRotCorners[3][0];
                const hrby = this.hotAreaRotCorners[3][1];
                if (
                    checkInBound(
                        x,
                        y,
                        hltx,
                        hlty,
                        ltx,
                        hlty,
                        hltx,
                        lty,
                        ltx,
                        lty
                    ) &&
                    this.rotationTopLeft()
                ) {
                    cursor = "cell";
                    topMove = true;
                    leftMove = true;
                    startRotX = this.corners[0][0];
                    startRotY = this.corners[0][1];
                    otherStartX = this.corners[2][0];
                    otherStartY = this.corners[2][1];
                } else if (
                    checkInBound(
                        x,
                        y,
                        rtx,
                        hrty,
                        hrtx,
                        hrty,
                        rtx,
                        rty,
                        hrtx,
                        rty
                    ) &&
                    this.rotationTopRight()
                ) {
                    cursor = "cell";
                    topMove = true;
                    leftMove = false;
                    startRotX = this.corners[1][0];
                    startRotY = this.corners[1][1];
                    otherStartX = this.corners[0][0];
                    otherStartY = this.corners[0][1];
                } else if (
                    checkInBound(
                        x,
                        y,
                        hlbx,
                        lby,
                        lbx,
                        lby,
                        hlbx,
                        hlby,
                        lbx,
                        lby
                    ) &&
                    this.rotationBottomLeft()
                ) {
                    cursor = "cell";
                    topMove = false;
                    leftMove = true;
                    startRotX = this.corners[2][0];
                    startRotY = this.corners[2][1];
                    otherStartX = this.corners[3][0];
                    otherStartY = this.corners[3][1];
                } else if (
                    checkInBound(
                        x,
                        y,
                        rbx,
                        rby,
                        hrbx,
                        rby,
                        rbx,
                        hrby,
                        hrbx,
                        hrby
                    ) &&
                    this.rotationBottomRight()
                ) {
                    cursor = "cell";
                    topMove = false;
                    leftMove = false;
                    startRotX = this.corners[3][0];
                    startRotY = this.corners[3][1];
                    otherStartX = this.corners[1][0];
                    otherStartY = this.corners[1][1];
                }
                if (cursor) this.#runningEvents.rotate = true;
                this.canvas.chageCursor(cursor);
            }
            if (isMouseDown) {
                const radianRot = Math.atan2(
                    y - this.#center.y,
                    x - this.#center.x
                );
                this.#rotateDegree = radianToDegree(radianRot);
                const endX = this.#center.x + R * Math.cos(radianRot);
                const endY = this.#center.y + R * Math.sin(radianRot);

                const diffX = endX - startRotX;
                const diffY = endY - startRotY;

                const Rrad = radianRot - degreeToRadian(90);

                const e1X = this.#center.x + R * Math.cos(Rrad);
                const e1Y = this.#center.y + R * Math.sin(Rrad);

                const eDiffX = e1X - otherStartX;
                const eDiffY = e1Y - otherStartY;
                if (this.#rotateDegree >= -180) {
                    if (topMove && leftMove) {
                        this.#updateCorners(diffX, diffY, eDiffX, eDiffY);
                        this.#rotateDegree += 135;
                    } else if (topMove && !leftMove) {
                        this.#updateCorners(eDiffX, eDiffY, -diffX, -diffY);
                        this.#rotateDegree += 45;
                    } else if (!topMove && !leftMove) {
                        this.#updateCorners(-diffX, -diffY, -eDiffX, -eDiffY);
                        this.#rotateDegree -= 45;
                    } else if (!topMove && leftMove) {
                        this.#updateCorners(-eDiffX, -eDiffY, diffX, diffY);
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
    #updateCorners(
        diffX: number,
        diffY: number,
        eDiffX: number,
        eDiffY: number
    ) {
        this.corners[0][0] += diffX;
        this.corners[1][0] += -eDiffX;
        this.corners[2][0] += eDiffX;
        this.corners[3][0] += -diffX;

        this.corners[0][1] += diffY;
        this.corners[1][1] += -eDiffY;
        this.corners[2][1] += eDiffY;
        this.corners[3][1] += -diffY;

        this.hotAreaCorners[0][0] += diffX;
        this.hotAreaCorners[1][0] += -eDiffX;
        this.hotAreaCorners[2][0] += eDiffX;
        this.hotAreaCorners[3][0] += -diffX;
        this.hotAreaCorners[0][1] += diffY;
        this.hotAreaCorners[1][1] += -eDiffY;
        this.hotAreaCorners[2][1] += eDiffY;
        this.hotAreaCorners[3][1] += -diffY;

        this.hotAreaRotCorners[0][0] += diffX;
        this.hotAreaRotCorners[1][0] += -eDiffX;
        this.hotAreaRotCorners[2][0] += eDiffX;
        this.hotAreaRotCorners[3][0] += -diffX;
        this.hotAreaRotCorners[0][1] += diffY;
        this.hotAreaRotCorners[1][1] += -eDiffY;
        this.hotAreaRotCorners[2][1] += eDiffY;
        this.hotAreaRotCorners[3][1] += -diffY;
    }
    resizable(opt?: boolean): boolean {
        const resizable = this.__cacheOption(opt, "resizable", true);
        if (!resizable) return false;

        let isMouseDown = false;
        let initX = 0;
        let initY = 0;
        let beforeX = 0;
        let beforeY = 0;

        let topResize = false;
        let leftResize = false;
        let widthResize = false;
        let heightResize = false;
        let isLeft = false;
        let isTop = false;

        const mousemove = (event: MouseEvent) => {
            if (this.#runningEvents.drag || this.#runningEvents.rotate) return;
            let cursor: undefined | string = undefined;

            const { x, y } = this.canvas.getCursorPosition(event);

            let ltx = this.corners[0][0];
            let lty = this.corners[0][1];
            let rtx = this.corners[1][0];
            let rty = this.corners[1][1];
            let lbx = this.corners[2][0];
            let lby = this.corners[2][1];
            let rbx = this.corners[3][0];
            let rby = this.corners[3][1];

            let hltx = this.hotAreaCorners[0][0];
            let hlty = this.hotAreaCorners[0][1];
            let hrtx = this.hotAreaCorners[1][0];
            let hrty = this.hotAreaCorners[1][1];
            let hlbx = this.hotAreaCorners[2][0];
            let hlby = this.hotAreaCorners[2][1];
            let hrbx = this.hotAreaCorners[3][0];
            let hrby = this.hotAreaCorners[3][1];

            if (event.buttons == 0) {
                isMouseDown = false;
                this.#runningEvents.resize = false;
                topResize = false;
                leftResize = false;
                widthResize = false;
                heightResize = false;
                isLeft = false;
                isTop = false;
            }
            if (!isMouseDown) {
                if (event.buttons == 1) {
                    initX = x;
                    initY = y;
                    beforeX = 0;
                    beforeY = 0;
                    isMouseDown = true;
                }
                if (
                    checkInBound(
                        x,
                        y,
                        hltx,
                        hlty,
                        ltx,
                        lty,
                        hlbx,
                        hlby,
                        lbx,
                        lby
                    )
                ) {
                    isLeft = ltx >= hltx || lbx >= hlby ? true : false;
                    widthResize = true;
                    leftResize = true;
                    cursor = "w-resize";
                } else if (
                    checkInBound(
                        x,
                        y,
                        rtx,
                        rty,
                        hrtx,
                        hrty,
                        rbx,
                        rby,
                        hrbx,
                        hrby
                    )
                ) {
                    isLeft = rtx >= hrtx || rbx >= hrbx ? true : false;
                    widthResize = true;
                    cursor = "w-resize";
                } else if (
                    checkInBound(
                        x,
                        y,
                        hltx,
                        hlty,
                        hrtx,
                        hrty,
                        ltx,
                        lty,
                        rtx,
                        rty
                    )
                ) {
                    isTop = lty >= hlty || rty >= hrty ? true : false;
                    heightResize = true;
                    topResize = true;
                    cursor = "n-resize";
                } else if (
                    checkInBound(
                        x,
                        y,
                        lbx,
                        lby,
                        rbx,
                        rby,
                        hlbx,
                        hlby,
                        hrbx,
                        hrby
                    )
                ) {
                    isTop = lby >= hlby || rby >= hrby ? true : false;
                    heightResize = true;
                    cursor = "n-resize";
                }

                if (checkInBound(x, y, hltx, hlty, ltx, lty, 0, 0, 0, 0)) {
                    isLeft = ltx >= hltx ? true : false;
                    isTop = lty >= hlty ? true : false;
                    topResize = true;
                    leftResize = true;
                    widthResize = true;
                    heightResize = true;
                    cursor = "nw-resize";
                } else if (
                    checkInBound(x, y, hrtx, hrty, rtx, rty, 0, 0, 0, 0)
                ) {
                    isLeft = rtx >= hrtx ? true : false;
                    isTop = rty >= hrty ? true : false;
                    topResize = true;
                    leftResize = false;
                    widthResize = true;
                    heightResize = true;
                    cursor = "nesw-resize";
                } else if (
                    checkInBound(x, y, lbx, lby, hlbx, hlby, 0, 0, 0, 0)
                ) {
                    isLeft = lbx >= hlbx ? true : false;
                    isTop = lby >= hlby ? true : false;
                    topResize = false;
                    leftResize = true;
                    widthResize = true;
                    heightResize = true;
                    cursor = "nesw-resize";
                } else if (
                    checkInBound(x, y, rbx, rby, hrbx, hrby, 0, 0, 0, 0)
                ) {
                    isLeft = rbx >= hrbx ? true : false;
                    isTop = rby >= hrby ? true : false;
                    topResize = false;
                    leftResize = false;
                    widthResize = true;
                    heightResize = true;
                    cursor = "nw-resize";
                }
                if (cursor) this.#runningEvents.resize = true;
                this.canvas.chageCursor(cursor);
            }

            if (isMouseDown) {
                let diffX = x - initX;
                let diffY = y - initY;
                this.beforeInit.x = this.canvasInit.x;
                this.beforeInit.y = this.canvasInit.y;
                if (diffX !== 0 && widthResize) {
                    const diff = diffX - beforeX;
                    if (isLeft && this.canvasInit.width - diff > 0) {
                        this.canvasInit.width -= diff;
                        this.canvasInit.x += diff;
                    } else if (!isLeft && this.canvasInit.width + diff > 0)
                        this.canvasInit.width += diff;
                    else this.canvasInit.width = 0;

                    if (this.canvasInit.width !== 0) {
                        if (leftResize) {
                            this.corners[0][0] += diff;
                            this.corners[2][0] += diff;
                            this.hotAreaCorners[0][0] += diff;
                            this.hotAreaCorners[2][0] += diff;
                        } else {
                            this.corners[1][0] += diff;
                            this.corners[3][0] += diff;
                            this.hotAreaCorners[1][0] += diff;
                            this.hotAreaCorners[3][0] += diff;
                        }
                        beforeX = diffX;
                    }
                }
                if (diffY !== 0 && heightResize) {
                    const diff = diffY - beforeY;
                    if (isTop && this.canvasInit.height - diff > 0) {
                        this.canvasInit.height -= diff;
                        this.canvasInit.y += diff;
                    } else if (!isTop && this.canvasInit.height + diff > 0)
                        this.canvasInit.height += diff;
                    else this.canvasInit.height = 0;

                    if (this.canvasInit.height !== 0) {
                        if (topResize) {
                            this.corners[0][1] += diff;
                            this.corners[1][1] += diff;
                            this.hotAreaCorners[0][1] += diff;
                            this.hotAreaCorners[1][1] += diff;
                        } else {
                            this.corners[2][1] += diff;
                            this.corners[3][1] += diff;
                            this.hotAreaCorners[2][1] += diff;
                            this.hotAreaCorners[3][1] += diff;
                        }
                        beforeY = diffY;
                    }
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

    hidden(opt?: boolean) {
        const hidden = this.__cacheOption(opt, "hidden", false);
        if (hidden) {
            (this._childs as Block[]).forEach(
                (item) => ((item.options.hidden = true), item.options.hidden)
            );
        }
        return hidden;
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
        this.#rotateDegree = this.__cacheOption(opt, "rotate", 0);
        const gap = this.hotAreaGap();

        const R = getRadiusByWH(this.canvasInit.width, this.canvasInit.height);
        const rad = degreeToRadian(this.#rotateDegree - 135);

        const diffX = this.#center.x + R * Math.cos(rad) - this.corners[0][0];
        const diffY = this.#center.y + R * Math.sin(rad) - this.corners[0][1];

        const Rrad = degreeToRadian(this.#rotateDegree - 225);
        const eDiffX = this.#center.x + R * Math.cos(Rrad) - this.corners[2][0];
        const eDiffY = this.#center.y + R * Math.sin(Rrad) - this.corners[2][1];

        const RR = getRadiusByWH(
            this.canvasInit.width + gap,
            this.canvasInit.height + gap
        );

        const diffRX =
            this.#center.x + RR * Math.cos(rad) - this.hotAreaCorners[0][0];
        const diffRY =
            this.#center.y + RR * Math.sin(rad) - this.hotAreaCorners[0][1];
        const eDiffRX =
            this.#center.x + RR * Math.cos(Rrad) - this.hotAreaCorners[2][0];
        const eDiffRY =
            this.#center.y + RR * Math.sin(Rrad) - this.hotAreaCorners[2][1];

        this.corners[0][0] += diffX;
        this.corners[1][0] += -eDiffX;
        this.corners[2][0] += eDiffX;
        this.corners[3][0] += -diffX;

        this.corners[0][1] += diffY;
        this.corners[1][1] += -eDiffY;
        this.corners[2][1] += eDiffY;
        this.corners[3][1] += -diffY;

        this.hotAreaCorners[0][0] += diffRX;
        this.hotAreaCorners[1][0] += -eDiffRX;
        this.hotAreaCorners[2][0] += eDiffRX;
        this.hotAreaCorners[3][0] += -diffRX;

        this.hotAreaCorners[0][1] += diffRY;
        this.hotAreaCorners[1][1] += -eDiffRY;
        this.hotAreaCorners[2][1] += eDiffRY;
        this.hotAreaCorners[3][1] += -diffRY;

        return this.#rotateDegree;
    }
    animate(keyframes: KeyFrame[], callback?: (timestamp: number) => void) {
        const animationId = (this.#lastAnimationId += 1);
        this.#keyframeIterations[animationId] = {
            isRunning: true,
            isFinished: false,
            isReverse: false,
        };
        for (let [index, keyframe] of keyframes.entries()) {
            const composite = keyframe.composite || "replace";

            let maxLen = 0;
            for (let [key, value] of Object.entries(keyframe)) {
                if (key in this.options) {
                    if (composite === "add" && maxLen < value.length)
                        maxLen = value.length;
                    else if (composite === "accumulate") {
                        let prevVal = 0;
                        (keyframe as any)[key] = value.map(
                            (item: number, index: number) => {
                                if (!(index in [0, 1])) {
                                    item += prevVal;
                                } else {
                                    prevVal += item;
                                }
                                return item;
                            }
                        );
                    }
                }
            }
            let direction = keyframe["direction"] || "normal";
            const iterationStart = keyframe["iterationStart"] || 0.0;

            for (let [key, value] of Object.entries(keyframe)) {
                if (key in this.options) {
                    const proto = Object.getPrototypeOf(this);
                    const obj = Object.getOwnPropertyDescriptor(proto, key);
                    this.#keyframeIterations[animationId][index] = {
                        iter: 1,
                        initValues: {},
                        prevTime: 0,
                        elapsedTime: 0,
                    };
                    this.#keyframeIterations[animationId][index]["initValues"][
                        key
                    ] = obj?.value.call(this);
                    for (
                        let i = value.length, maxVal = value[i - 1];
                        i < maxLen;
                        i++
                    )
                        value.push(maxVal);
                    if (
                        direction === "reverse" ||
                        direction === "alternate-reverse"
                    )
                        value.reverse();

                    let currentVal = value[0];
                    let idx = 0;
                    let iterDirection = 1;
                    if (iterationStart) {
                        idx = Math.round(iterationStart * value.length - 1);
                        if (direction === "normal" || direction === "reverse")
                            idx = 0;
                        currentVal = value[idx];
                        if (idx === value.length - 1) iterDirection *= -1;
                    }
                    this.#keyframeIterations[animationId][index][key] = {
                        currentIdx: idx,
                        currentVal: currentVal,
                        breakPoints: value,
                        iterDirection: iterDirection,
                        invoker: obj,
                    };
                } else {
                    this.#keyframeIterations[animationId][index][key] = value;
                }
            }
            const animator = (timestamp: number) => {
                const anime = this.#keyframeIterations[animationId];
                const keyF = anime[index];
                let isFinished = anime["isFinished"];
                const delay = keyF.delay || 0;

                if (callback) callback(timestamp);

                if (delay <= timestamp && !isFinished && anime["isRunning"]) {
                    const playBackRate = keyF.playbackRate || 1;
                    const direction = keyF.direction || "normal";
                    const duration = keyF.duration || 0;
                    const iterations = keyF.iterations || undefined;
                    const iter = keyF.iter;
                    const elapsedTime = anime["elapsedTime"];
                    const prevTime = anime["prevTime"];

                    this.#keyframeIterations[animationId]["elapsedTime"] =
                        timestamp - prevTime;
                    this.#keyframeIterations[animationId]["prevTime"] =
                        timestamp;

                    if (!anime["isRunning"]) return;
                    if (iter === iterations + 1)
                        isFinished = this.#keyframeIterations[animationId][
                            "isFinished"
                        ] = true;

                    if (
                        iterations !== undefined &&
                        iterations !== Infinity &&
                        Math.floor((duration * iter) / 1000) ===
                            Math.floor(timestamp / 1000)
                    )
                        this.#keyframeIterations[animationId][index][
                            "iter"
                        ] += 1;
                    const easing = this.easingHanndler(keyF.easing || "ease")(
                        elapsedTime / duration || 0,
                        duration
                    );
                    for (let [key, value] of Object.entries(keyF)) {
                        if (!(key in this.options)) continue;
                        let valueT = value as any;

                        if (isFinished) {
                            if (keyF.onFinish) keyF.onFinish();
                            valueT.invoker?.value.call(
                                this,
                                valueT["breakPoints"][0]
                            );
                            continue;
                        }

                        let currentIdx = valueT["currentIdx"];
                        let iterDirection = valueT["iterDirection"];
                        let nextIdx = currentIdx + iterDirection;

                        let startVal = valueT["breakPoints"][currentIdx];
                        let endVal = valueT["breakPoints"][nextIdx];
                        let currentVal = valueT["currentVal"];

                        currentVal +=
                            (lerp(startVal, endVal, easing) - startVal) *
                            playBackRate;

                        if (
                            (startVal <= endVal && currentVal >= endVal) ||
                            (startVal >= endVal && currentVal <= endVal)
                        ) {
                            currentIdx += iterDirection;
                            if (
                                nextIdx === valueT["breakPoints"].length - 1 ||
                                nextIdx === 0
                            ) {
                                if (
                                    direction == "normal" ||
                                    direction === "reverse"
                                ) {
                                    currentIdx = 0;
                                    currentVal = valueT["breakPoints"][0];
                                    this.#keyframeIterations[animationId][
                                        index
                                    ]["time"] = 0;
                                } else if (
                                    direction == "alternate" ||
                                    direction == "alternate-reverse"
                                ) {
                                    iterDirection *= -1;
                                    this.#keyframeIterations[animationId][
                                        index
                                    ]["time"] = 0;
                                }
                            }
                            this.#keyframeIterations[animationId][index][key][
                                "currentIdx"
                            ] = currentIdx;
                        }
                        this.#keyframeIterations[animationId][index][key][
                            "currentVal"
                        ] = currentVal;
                        this.#keyframeIterations[animationId][index][key][
                            "iterDirection"
                        ] = iterDirection;

                        valueT.invoker?.value.call(this, currentVal);
                    }
                }
                this.__initSet();
            };
            this.__animationOn.push(animator);
        }
        return animationId;
    }

    animationStart(animationId: number) {
        this.#keyframeIterations[animationId]["isFinished"] = false;
        this.#keyframeIterations[animationId]["isRunning"] = true;
    }
    animationStop(animationId: number) {
        this.#keyframeIterations[animationId]["isRunning"] = false;
    }
    animationFinish(animationId: number) {
        this.#keyframeIterations[animationId]["isFinished"] = true;
    }
    animationReverse(animationId: number) {
        this.#keyframeIterations[animationId]["isFinished"] = false;
        this.#keyframeIterations[animationId]["isReverse"] = true;
    }
    animationUpdateDelay(
        animationId: number,
        keyFrameCount: number,
        value: Delay
    ) {
        this.#keyframeIterations[animationId][keyFrameCount]["updateDelay"] =
            value;
    }
    animationPlaybackRate(
        animationId: number,
        keyFrameCount: number,
        value: PlaybackRate
    ) {
        this.#keyframeIterations[animationId][keyFrameCount]["playbackRate"] =
            value;
    }
    animationDirection(
        animationId: number,
        keyFrameCount: number,
        value: Direction
    ) {
        this.#keyframeIterations[animationId][keyFrameCount]["direction"] =
            value;
    }
    animationDuration(
        animationId: number,
        keyFrameCount: number,
        value: Duration
    ) {
        this.#keyframeIterations[animationId][keyFrameCount]["duration"] =
            value;
    }
    animationIterationStart(
        animationId: number,
        keyFrameCount: number,
        value: IterationStart
    ) {
        this.#keyframeIterations[animationId][keyFrameCount]["iterationStart"] =
            value;
    }
    animationComposite(
        animationId: number,
        keyFrameCount: number,
        value: Composite
    ) {
        this.#keyframeIterations[animationId][keyFrameCount]["composite"] =
            value;
    }
    animationIterations(
        animationId: number,
        keyFrameCount: number,
        value: Iterations
    ) {
        this.#keyframeIterations[animationId][keyFrameCount]["iterations"] =
            value;
    }

    easingHanndler(easing: Easing): (t: number, duration: number) => number {
        if(easing === "linear") return linear(0, 1)
        else if(easing == "step-start") return steps(1, "jump-start")
        else if(easing == "step-end") return steps(1, "jump-end")
        else if (easing == "ease") return cubicBezier(0.25, 0.1, 0.25, 1);
        else if (easing == "ease-in") return cubicBezier(0.42, 0, 1, 1);
        else if (easing == "ease-out") return cubicBezier(0, 0, 0.58, 1);
        else if (easing == "ease-in-out") return cubicBezier(0.42, 0, 0.58, 1);
        else return easing
    }
    // had to come first for block scaling
    scale(x: number, y: number) {
        this.context.scale(x, y);
    }
    bind(block: Block, options: string[]) {
        for (let opt of options) {
            this.options[opt] = block.options[opt];
        }
    }

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
                        const diff = diffX - beforeX;
                        this.canvasInit.x += diff;
                        this.corners[0][0] += diff;
                        this.corners[1][0] += diff;
                        this.corners[2][0] += diff;
                        this.corners[3][0] += diff;

                        this.hotAreaCorners[0][0] += diff;
                        this.hotAreaCorners[1][0] += diff;
                        this.hotAreaCorners[2][0] += diff;
                        this.hotAreaCorners[3][0] += diff;
                        this.#center.x += diff;
                        beforeX = diffX;
                    }
                    this.beforeInit.y = this.canvasInit.y;
                    if (diffY !== 0 && this.dragY()) {
                        const diff = diffY - beforeY;
                        this.canvasInit.y += diff;
                        this.corners[0][1] += diff;
                        this.corners[1][1] += diff;
                        this.corners[2][1] += diff;
                        this.corners[3][1] += diff;

                        this.hotAreaCorners[0][1] += diff;
                        this.hotAreaCorners[1][1] += diff;
                        this.hotAreaCorners[2][1] += diff;
                        this.hotAreaCorners[3][1] += diff;

                        this.#center.y += diff;
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
