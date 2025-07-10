interface ShapeInterface {
    x: number;
    y: number;
    width: number;
    height: number;
    resize: boolean;
}

class Shape implements ShapeInterface {
    x: number;
    y: number;
    width: number;
    height: number;
    resize: boolean;

    constructor({ x, y, width, height, resize = true }: Shape) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.resize = resize;
    }
}

export { Shape, ShapeInterface };
