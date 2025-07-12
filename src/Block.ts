// Each element in the canvas is block
import { Shape } from "./Shape";
import { TextBlock } from "./TextBlock";

type Element = Shape | TextBlock;

export class Block {
    elements: Element[] = [];
    type: unknown | Element;

    x: number = 0;
    y: number = 0;
    resize: boolean = true;

    constructor(
        type: unknown | Element = undefined,
        x: number = 0,
        y: number = 0,
        resize: boolean = false
    ) {
        this.type = type;
        this.x = x;
        this.y = y;
    }

    add(element: Element): void {
        this.elements.push(element);
    }

    resizeBox(width: number, height: number, x: number, y: number) {}
}

// export interface BlockInterface extends Block {
//     width: number;
//     height: number;
// }
