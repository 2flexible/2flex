import { Shape } from "../Shape";
import { ShapeInterface } from "../Shape";

class Rect extends Shape {
    width = 200;
    height = 200;

    constructor({ x, y, width, height, resize }: ShapeInterface) {
        super({ x, y, width, height, resize });
        this.width = width;
        this.height = height;
    }
}
export default Rect;
