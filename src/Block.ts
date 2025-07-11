type Element = Shape;

export class Block {
    elements: Element[] = [];
    x: number = 0;
    y: number = 0;
    resize: boolean = true;

    constructor(x: number, y: number, resize: boolean) {
        this.x = x;
        this.y = y;
    }

    add(element: Element): void {
        this.elements.push(element);
    }

    resizeBox(width: number, height: number, x: number, y: number) {}
}

export interface BlockInterface extends Block {
    width: number;
    height: number;
}
