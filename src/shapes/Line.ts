import { Shape, LineCapOpt } from "../Shape";
import { IBlock, IDefaultBlockOpt } from "../types";

interface DefaultLineOpt {
    dash: number[];
}

const defaultOpt: IDefaultBlockOpt<DefaultLineOpt> = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    selectable: true,
    draggable: true,
    zIndex: 0,
    dragX: true,
    dragY: true,
    dash: [],
};

export type LineJoinOpt = "miter" | "round" | "bevel";

interface LineOptions extends DefaultLineOpt {
    cp1x: number;
    cp1y: number;
    cp2x: number;
    cp2y: number;
    endX: number;
    endY: number;

    lineDashOffset?: number;
    lineJoin: LineJoinOpt;
}

export class Line extends Shape {
    joinTo: Line | undefined = undefined;

    constructor(options?: IBlock<LineOptions>) {
        super(options);
        this.options = { ...defaultOpt, ...options };
    }
    __initSet(): void {
        super.__initSet();
    }
    // @todo: when combining two lines need to remove beginPath, can be bind or any other way
    __drawInit() {
        if(!this.joinTo) this.beginPath() 
        this.strokeStyle();

        this.moveTo({ x: this.initCords.x, y: this.initCords.y });

        if (
            !this.options.cpx1 &&
            !this.options.cpy1 &&
            this.options.cpx2 &&
            this.options.cpy2
        ) {
            this.quadraticCurveTo({
                cpx1: this.options.cpx1,
                cpy1: this.options.cpy1,
                endX: this.options.endX,
                endY: this.options.endY,
            });
        } else if (
            this.options.cpx1 &&
            this.options.cpy1 &&
            this.options.cpx2 &&
            this.options.cpy2
        ) {
            this.bezierCurveTo({
                cpx1: this.options.cpx1,
                cpy1: this.options.cpy1,
                cpx2: this.options.cpx2,
                cpy2: this.options.cpy2,
                endX: this.options.endX,
                endY: this.options.endY,
            });
        } else {
            this.context.lineTo(this.options.endX, this.options.endY);
        }

        this.fill();
        this.stroke();
    }

    dash(opt?: number[]) {
        this.options.dash = super.setLineDash(opt);;
        return this.context.getLineDash();
    }

    joinBorder(opt?: LineCapOpt){
        return super.lineCap(opt)
    }

    join(line: Line) {
        this.joinTo = line;
        this.#adjustCordinates()
    }

    #adjustCordinates() {
        if (this.joinTo) {
            this.joinTo.initCords.x = this.options.endX;
            this.joinTo.initCords.y = this.options.endY;
        }
    }
    strokeStyle(opt?: string){
        super.strokeStyle(opt)
    }
    fillStyle(opt?: string){
        return super.fillStyle(opt)
    }
    clip(opt?: boolean): boolean {
        return super.clip(opt);
    }
    dragX(opt?: boolean) {
        return super.dragX(opt);
    }
    dragY(opt?: boolean) {
        return super.dragY(opt);
    }
    draggable(opt: boolean): boolean {
        this.#adjustCordinates();
        return super.draggable(opt);
    }

    selectable(opt?: boolean): boolean {
        return super.selectable(opt);
    }

    set(options: IBlock<LineOptions>) {
        super.set(options);
    }
}

// const line1 = new Line({x: 0, y: 0, xend: 10, yEnd: 20})

// const line2 = new Line({x: 0, y: 0, xend: 10, yEnd: 20})

// const line3 = new Line({x: 0, y: 0, xend: 10, yEnd: 20})

// const line4 = new Line({x: 0, y: 0, xend: 10, yEnd: 20})

// line1.join(line2, line3, line4)
