import { Shape } from "../Shape";
import { BlockOptions, IBlock, InitialShapes } from "../types";

export class Star extends Shape {
    constructor(options?: IBlock<BlockOptions>) {
        super(options);
    }
    __initSet(): void {
        super.__initSet();
    }
    __drawInit() {
        this.beginPath()
        /* calculcate this */
        // function strokeStar(x, y, r, n, inset) {
        //     ctx.save();
        //     ctx.beginPath();
        //     ctx.translate(x, y);
        //     ctx.moveTo(0, 0 - r);
        //     for (var i = 0; i < n; i++) {
        //         ctx.rotate(Math.PI / n);
        //         ctx.lineTo(0, 0 - r * inset);
        //         ctx.rotate(Math.PI / n);
        //         ctx.lineTo(0, 0 - r);
        //     }
        //     ctx.closePath();
        //     ctx.fill();
        //     ctx.restore();
        // }
        // strokeStar(0, 50, 20, 5, 2);
    }
}
