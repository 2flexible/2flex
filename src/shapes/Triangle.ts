import { Shape } from "../Shape";
import { IDefaultBlockOpt, IBlock, InitialShapes } from "../types";

interface DefaultTriangleOpt {
    side?: number;
}

const defaultOpt: IDefaultBlockOpt<DefaultTriangleOpt> = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    selectable: true,
    draggable: true,
    zIndex: 0,
    size: 100,
};

interface TriangleOptions extends DefaultTriangleOpt, InitialShapes {}
export class Triangle extends Shape {
    constructor(options?: IBlock<TriangleOptions>) {
        super(options);
        this.options = { ...defaultOpt, ...options };
    }

    __initSet(): void {
        super.__initSet();
    }

    __drawInit() {
        this.beginPath();
        this.backgroundColor();

        const { x1, x2, y1 } = this.#calcTopPoint();
        this.context.moveTo(this.initCords.x, this.initCords.y);
        this.context.lineTo(x1, y1);
        this.context.lineTo(x2, y1);
        this.context.closePath();
        this.fill();
        this.stroke();
    }
    #calcTopPoint() {
        let x = this.initCords.x || this.options.x;
        let y = this.initCords.y || this.options.y;

        let sides = this.options.sides || this.options.size;
        let bottom = this.options.bottom || this.options.size;
        console.log(this.options.bottom);
        x += bottom / 2;

        this.initCords.x = x;

        const x1 = x + bottom / 2;
        const x2 = Math.abs(bottom - x1);
        // const y1 = ((Math.sqrt(3) * 1) / 2) * side + y;
        const y1 = Math.sqrt(sides ** 2 - bottom ** 2 / 4) + y;
        console.log(this.options.size);
        return { x1, x2, y1 };
    }
    width(opt?: number): number {
        this.options.bottom = super.width(opt);
        return this.options.bottom;
    }

    height(opt?: number): number {
        this.options.sides = super.height(opt);
        return this.options.sides;
    }
    backgroundColor(opt?: string) {
        this.options.backgroundColor = super.fillStyle(opt);
        return this.options.backgroundColor;
    }
    checkInBound(_event: MouseEvent): boolean {
        const width = this.options.width;
        const height = this.options.height;

        const { x, y } = this.canvas.getCursorPosition(_event);

        if (
            x >= this.initCords.x! &&
            x <= this.initCords.x! + width &&
            y >= this.initCords.y! &&
            y <= this.initCords.y! + height
        ) {
            return true;
        }

        return false;
    }
    // borderColor(opt?: string){
    //     return super.borderColor(opt)
    // }
    size(opt?: number) {
        this.options.side = opt || this.options.side || 100;
        return this.options.side;
    }

    find(queries?: IBlock<TriangleOptions>) {
        return this.filterNodes(queries);
    }
    clip_path() {
        const { x1, x2, y1 } = this.#calcTopPoint();
        this.initCords.x = this.initCords.x || this.options.x;
        this.initCords.y = this.initCords.y || this.options.y;

        this.canvas.clipping_path.moveTo(this.initCords.x, this.initCords.y);
        this.canvas.clipping_path.lineTo(x1, y1);
        this.canvas.clipping_path.lineTo(x2, y1);
        this.canvas.clipping_path.closePath();
    }

    // do not show clip
    clip(opt?: boolean): boolean {
        return super.clip(opt);
    }

    draggable(opt: boolean): boolean {
        return super.draggable(opt);
    }

    selectable(opt?: boolean): boolean {
        return super.selectable(opt);
    }

    set(options: IBlock<TriangleOptions>) {
        super.set(options);
    }
}
