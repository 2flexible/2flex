import { Block } from "./Block";
import { BlockOptions, IBlock } from "./types";

// each shape extends form common shape
export class Shape extends Block {
    constructor(options?: IBlock<BlockOptions>) {
        super(options);
    }
    __initSet(): void {
        super.__initSet();
        this.__drawInit();
    }

    __drawInit() {
        this.color();

        this.draw();

        this.fill();
        this.stroke();
    }

    draw(_func?: (context: any) => void) {
        if (_func) _func(this.context);
    }

    color(option?: string) {
        this.context.beginPath();
        return super.color(option);
    }

    strokeWidth(option?: number) {
        return super.strokeWidth(option);
    }

    strokeColor(option?: string) {
        return super.strokeColor(option);
    }

    stroke(option?: boolean) {
        return super.stroke(option);
    }

    fill(option?: boolean) {
        this.options.fill = option || this.options.fill || false;
        if (this.options.fill) {
            this.context.fill();
        }
        return this.options.fill;
    }

    clip(option?: boolean): boolean {
        return super.clip(option);
    }
    // can be 2 different format, one option with optinos giving paramters, two like this
    moveTo(x?: number, y?: number) {
        x = x || this.initCords.x!
        y = y || this.initCords.y!
        this.context.moveTo(x, y);
    }
    setLineDash(dashes: number[]){
        this.context.setLineDash(dashes)
    }
    dragX(option?: boolean) {
        return super.dragX(option);
    }
    dragY(option?: boolean) {
        return super.dragY(option);
    }
    draggable(option: boolean): boolean {
        return super.draggable(option);
    }

    selectable(option?: boolean): boolean {
        return super.selectable(option);
    }

    set(options: IBlock<BlockOptions>) {
        super.set(options);
    }
}
