import Shape from "./Shape";

type Element = Shape;

class Block {
    elements: Element[] = [];

    add(element: Element) {
        this.elements.push(element);
    }
}
export default Block;
