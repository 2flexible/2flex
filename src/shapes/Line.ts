import { Shape } from "../Shape";
import type { IBlock } from "../types";
import { checkInBound } from "../Utils";

interface ILineOptions {
    startX?: number;
    startY?: number;
    endX?: number;
    endY?: number;
    startControlX: number;
    startControlY: number;
    endControlX: number;
    endControlY: number;
    startDraggable?: boolean;
    endDraggable?: boolean;
    startControllable?: boolean;
    endControllable?: boolean;
    lineWidth?: number;
    lineColor?: number;
    backgroundColor?: number;
    closePath?: boolean;
    joinTo: Line;
}

export class Line extends Shape<ILineOptions> {
    path?: Path2D;
    pathC1?: Path2D;
    pathC2?: Path2D;
    pathC3?: Path2D;
    pathC4?: Path2D;
    #editable = false;

    constructor(options: IBlock<ILineOptions>) {
        super(options);

        this.dblclick((e) => (this.#editable = true));
        const click = (event: MouseEvent) => {
            const { x, y } = this.canvas?.getCursorPosition(event);
            if (
                !this.#pathInBound(x, y, this.pathC1!) &&
                !this.#pathInBound(x, y, this.pathC2!) &&
                !this.#pathInBound(x, y, this.pathC3!) &&
                !this.#pathInBound(x, y, this.pathC4!) &&
                !this.#pathInBound(x, y, this.path!)
            )
                this.#editable = false;
        };
        this.__eventHandler<MouseEvent>("click", click);
    }
    render(): void {
        super.render();
        if (this.#editable) this.__runningEvents.selected = false;
        if (this.__runningEvents.selected || this.#editable) this.__hotLines();
    }

    joinTo(opt?: Line) {
        return this.__valueHandler<Line, Line | undefined>(
            opt,
            "joinTo",
            undefined
        );
    }

    draw(_func?: (context: CanvasRenderingContext2D) => void): void {
        this.path = new Path2D();

        if (this.joinTo() !== undefined) {
            const joined = this.joinTo();
            this.path = joined!.path;
            // this.startX(joined!.endX());
            // this.startY(joined!.endY());
        } else {
            this.path!.moveTo(this.startX(), this.startY());
        }
        this.path!.bezierCurveTo(
            this.startControlX(),
            this.startControlY(),
            this.endControlX(),
            this.endControlY(),
            this.endX(),
            this.endY()
        );
        if (this.closePath()) this.path!.closePath();
        if (this.fill()) this.context.fill(this.path!);
        if (this.stroke()) this.context.stroke(this.path!);
    }

    __hotLines(): void {
        if (!this.#editable) {
            super.__hotLines();
            return;
        }

        this.context?.save();
        this.context?.translate(this.rotationCenterX(), this.rotationCenterY());
        this.context?.rotate(this.rotate());
        this.context?.translate(
            -this.rotationCenterX(),
            -this.rotationCenterY()
        );
        this.context.setLineDash([]);
        this.beginPath();
        this.context.moveTo(this.startX(), this.startY());
        this.context.bezierCurveTo(
            this.startControlX(),
            this.startControlY(),
            this.endControlX(),
            this.endControlY(),
            this.endX(),
            this.endY()
        );
        this.context.lineWidth = 1;
        this.context.strokeStyle = "blue";
        this.context.stroke();

        this.beginPath();
        this.pathC1 = new Path2D();
        this.pathC1.arc(this.startX(), this.startY(), 3, 0, Math.PI * 2);
        this.context.lineWidth = 2;
        this.context.strokeStyle = "blue";
        this.context.fillStyle = "white";
        this.context.stroke(this.pathC1);
        this.context.fill(this.pathC1);

        this.beginPath();
        this.pathC4 = new Path2D();
        this.pathC4.arc(this.endX(), this.endY(), 3, 0, Math.PI * 2);
        this.context.lineWidth = 2;
        this.context.strokeStyle = "blue";
        this.context.fillStyle = "white";
        this.context.stroke(this.pathC4);
        this.context.fill(this.pathC4);

        if (this.startControllable()) {
            this.beginPath();
            this.pathC2 = new Path2D();
            this.pathC2.arc(
                this.startControlX(),
                this.startControlY(),
                3,
                0,
                Math.PI * 2
            );
            this.pathC2.moveTo(this.startX(), this.startY());
            this.pathC2.lineTo(this.startControlX(), this.startControlY());
            this.context.lineWidth = 1;
            this.context.strokeStyle = "blue";
            this.context.fillStyle = "white";
            this.context.stroke(this.pathC2);
            this.context.fill(this.pathC2);
        }

        if (this.endControllable()) {
            this.beginPath();
            this.pathC3 = new Path2D();
            this.pathC3.arc(
                this.endControlX(),
                this.endControlY(),
                3,
                0,
                Math.PI * 2
            );
            this.pathC3.moveTo(this.endX(), this.endY());
            this.pathC3.lineTo(this.endControlX(), this.endControlY());
            this.context.lineWidth = 1;
            this.context.strokeStyle = "blue";
            this.context.fillStyle = "white";
            this.context.stroke(this.pathC3);
            this.context.fill(this.pathC3);
        }

        this.context?.restore();
    }

    checkInBound(_event: MouseEvent): boolean {
        const { x, y } = this.canvas.getCursorPosition(_event);
        let inBound;

        if (!this.__runningEvents.selected) {
            inBound = this.#pathInBound(x, y, this.path!);
        } else
            inBound = checkInBound(
                x,
                y,
                this.hotCornerTopLeft().x,
                this.hotCornerTopLeft().y,
                this.hotCornerTopRight().x,
                this.hotCornerTopRight().y,
                this.hotCornerBottomLeft().x,
                this.hotCornerBottomLeft().y,
                this.hotCornerBottomRight().x,
                this.hotCornerBottomRight().y
            );
        if (inBound) this.canvas?.takeRegister({ in: this.zIndex() });
        else this.canvas?.takeRegister({ out: this.zIndex() });
        return inBound;
    }

    x(opt?: number | string): number {
        const cacheX = this.ownOptions.x || 0;
        const x = super.x(opt);
        const diffX = x - cacheX;
        if (diffX !== 0) {
            this.startX(this.startX() + diffX);
            this.endX(this.endX() + diffX);
            this.startControlX(this.startControlX() + diffX);
            this.endControlX(this.endControlX() + diffX);
        }
        return x;
    }

    y(opt?: number | string): number {
        const cacheY = this.ownOptions.y || 0;
        const y = super.y(opt);
        const diffY = y - cacheY;
        if (diffY !== 0) {
            this.startY(this.startY() + diffY);
            this.endY(this.endY() + diffY);
            this.startControlY(this.startControlY() + diffY);
            this.endControlY(this.endControlY() + diffY);
        }
        return y;
    }

    startX(opt?: number) {
        const x = this.__valueHandler(opt, "startX", undefined);
        if (x === undefined) return this.x();
        return x;
    }
    startY(opt?: number) {
        const y = this.__valueHandler(opt, "startY", undefined);
        if (y === undefined) return this.y();
        return y;
    }
    endX(opt?: number) {
        const x = this.__valueHandler(opt, "endX", undefined);
        if (x === undefined) return this.x() + this.width();
        return x;
    }
    endY(opt?: number) {
        const y = this.__valueHandler(opt, "endY", undefined);
        if (y === undefined) return this.y() + this.height();
        return y;
    }
    startControlX(opt?: number) {
        const x = this.__valueHandler(opt, "startControlX", undefined);
        if (x === undefined) return this.startX();
        return x;
    }
    startControlY(opt?: number) {
        const y = this.__valueHandler(opt, "startControlY", undefined);
        if (y === undefined) return this.startY();
        return y;
    }
    endControlX(opt?: number) {
        const x = this.__valueHandler(opt, "endControlX", undefined);
        if (x === undefined) return this.endX();
        return x;
    }
    endControlY(opt?: number) {
        const y = this.__valueHandler(opt, "endControlY", undefined);
        if (y === undefined) return this.endY();
        return y;
    }
    startDraggable(opt?: boolean) {
        const draggable = this.__valueHandler(opt, "startDraggable", false);
        if (draggable)
            this.#draggablePoints(this.startX, this.startY, "pathC1");
        return draggable;
    }
    endDraggable(opt?: boolean) {
        const draggable = this.__valueHandler(opt, "endDraggable", false);
        if (draggable) this.#draggablePoints(this.endX, this.endY, "pathC4");
        return draggable;
    }

    startControllable(opt?: boolean) {
        const draggable = this.__valueHandler(opt, "startControllable", false);
        if (draggable)
            this.#draggablePoints(
                this.startControlX,
                this.startControlY,
                "pathC2"
            );
        return draggable;
    }
    endControllable(opt?: boolean) {
        const draggable = this.__valueHandler(opt, "endControllable", false);
        if (draggable)
            this.#draggablePoints(this.endControlX, this.endControlY, "pathC3");
        return draggable;
    }

    #pathInBound(x: number, y: number, path: Path2D) {
        return (
            this.pointInStroke({ path: path, x: x, y: y }) ||
            this.pointInPath({ path: path, x: x, y: y })
        );
    }

    #draggablePoints(xPoint: any, yPoint: any, path: string) {
        let initCords = { x: 0, y: 0 };
        let beforeCords = { x: 0, y: 0 };
        let beforeValues: any = {};
        let isRunning = false;

        const mousedown = (event: MouseEvent) => {
            const pointPaths: { [key: string]: Path2D } = {
                pathC1: this.pathC1!,
                pathC2: this.pathC2!,
                pathC3: this.pathC3!,
                pathC4: this.pathC4!,
            };
            const { x, y } = this.canvas?.getCursorPosition(event);
            const inBound = this.#pathInBound(x, y, pointPaths[path]);
            if (inBound) {
                initCords = { x: x, y: y };
                beforeCords = { x: 0, y: 0 };
                beforeValues[this.nodeId!] = {
                    x: xPoint.call(this),
                    y: yPoint.call(this),
                };

                isRunning = true;
                this.canvas?.takeRegister({ in: this.zIndex() });
            } else this.canvas?.takeRegister({ out: this.zIndex() });
        };

        const mousemove = (event: MouseEvent) => {
            if (isRunning) {
                this.__runningEvents.drag = false;
                this.canvas?.takeRegister({ in: this.zIndex() });
                if (this.canvas?.whoIsTheFirst(this.zIndex())) {
                    const { x, y } = this.canvas?.getCursorPosition(event);
                    let diffX = x - initCords.x;
                    let diffY = y - initCords.y;
                    if (diffX !== 0) {
                        const diff = diffX - beforeCords.x;
                        xPoint.call(this, xPoint.call(this) + diff);
                        beforeCords.x = diffX;
                    }
                    if (diffY !== 0) {
                        const diff = diffY - beforeCords.y;
                        yPoint.call(this, yPoint.call(this) + diff);
                        beforeCords.y = diffY;
                    }
                    this.canvas?.invokeChange();
                }
            }
        };
        const mouseup = () => {
            if (isRunning) {
                isRunning = false;
                if (beforeCords.x !== 0 || beforeCords.y !== 0) {
                    const after: any = {};
                    after[this.nodeId!] = {
                        x: xPoint.call(this),
                        y: yPoint.call(this),
                    };
                    this.canvas?.takeSnapshot(beforeValues, after);
                    this.canvas?.invokeChange();
                }
            }
        };
        this.__eventHandler<MouseEvent>("mousedown", mousedown);
        this.__eventHandler<MouseEvent>("mousemove", mousemove);
        this.__eventHandler<MouseEvent>("mouseup", mouseup);
    }

    closePath(opt?: boolean): boolean {
        return this.__valueHandler(opt, "closePath", false);
    }
    lineColor(opt?: string) {
        const lineColor = this.__valueHandler(opt, "lineColor", undefined);
        if (lineColor) {
            super.strokeStyle(lineColor);
            this.stroke(true);
        }

        return lineColor;
    }
    backgroundColor(opt?: string) {
        const backgroundColor = this.__valueHandler(
            opt,
            "backgroundColor",
            undefined
        );
        if (backgroundColor) {
            super.fillStyle(backgroundColor);
            this.fill(true);
        }
        return backgroundColor;
    }
}
