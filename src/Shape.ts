import { Block, BlockInterface } from "./Block";

class Shape extends Block implements BlockInterface {
    width: number;
    height: number;
    resize: boolean;

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        resize: boolean = true
    ) {
        super(x, y, resize);
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.resize = resize;
    }
}

export { Shape, ShapeInterface };
