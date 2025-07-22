class Node {
    child_nodes;
    next;
    constructor() {
        this.child_nodes = [];
        this.next = undefined;
    }
    addChild(node) {
        this.next = node.shift();
        this.child_nodes.push(...node);
    }
}
class Tree {
    #nodes;
    #head;
    constructor() {
        this.#nodes = [];
        this.#head = new Node();
    }
    addNodes(node) {
        if (this.#head.next === undefined) {
            this.#head.addChild(node);
        }
        this.#nodes.push(...node);
    }
    pre_order_traversal(_func) {
        const Q = [];
        Q.push(this.#head);
        // const S = [];
        while (Q.length > 0) {
            let current = Q.shift();
            if (Object.getPrototypeOf(current).constructor.name !== "Node") {
                _func(current);
            }
            // S.push(current);
            if (current?.child_nodes) {
                Q.unshift(...current.child_nodes);
            }
            if (current?.next) {
                Q.unshift(current.next);
            }
        }
        // return S;
    }
}

class CanvasDOMManager {
    constructor() { }
    get context() {
        return this.canvas.getContext("2d");
    }
    get canvas() {
        const canvas = document.getElementById("canvas");
        if (!canvas) {
            this.createCanvas();
        }
        return canvas;
    }
    createCanvas() {
        const canvas = document.createElement("canvas");
        canvas.id = "canvas";
        const body = document.querySelector("body");
        body.appendChild(canvas);
    }
    changeStyle() {
        this.canvas.style;
    }
    addEventListener(_type, _func) {
        this.canvas.addEventListener(_type, (event) => _func(event));
    }
}

const defaultCanvasOpt = {
    x: 0,
    y: 0,
    color: "#FFFFFF",
};
class Canvas {
    width;
    height;
    domCanvas;
    options;
    #tree = new Tree();
    constructor(width, height, options = undefined) {
        this.width = width || 200;
        this.height = height || 200;
        this.options = { ...options, ...defaultCanvasOpt };
        this.domCanvas = new CanvasDOMManager();
        this.#initCanvas();
    }
    get context() {
        return this.domCanvas.context;
    }
    get canvas() {
        return this.domCanvas.canvas;
    }
    #initCanvas() {
        this.canvas;
        // this.canvas.width = this.width;
        // this.canvas.height = this.height;
        // this.canvas.style.background = this.options.color;
    }
    add(...block) {
        this.#tree.addNodes(block);
        this.#tree.pre_order_traversal((element) => {
            element._context = this.context;
            element.__initSet();
            this.#handleStyleChanges(element);
            this.#handleEvents(element);
        });
    }
    getCursorPosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const cursor = { x, y };
        return cursor;
    }
    #handleEvents(element) {
        element.events?.forEach((elem) => {
            this.domCanvas.addEventListener(elem.eventType, (event) => {
                const cursor = this.getCursorPosition(event);
                elem.method(event, cursor);
            });
        });
    }
    #handleStyleChanges(block) {
        const proto = Object.getPrototypeOf(block);
        for (const option in block.options) {
            const obj = Object.getOwnPropertyDescriptor(proto, `__${option}`);
            obj?.value.call(block);
        }
    }
}

// Each element in the canvas is block
const defaultOpt = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
};
// each Block is Node
class Block extends Node {
    options;
    _context;
    events = [];
    constructor(options = undefined) {
        super();
        this.options = { ...defaultOpt, ...options };
    }
    __initSet() { }
    add(...block) {
        this.addChild(block);
    }
    checkInBound(_event, cursor) {
        const width = this.options.width;
        const height = this.options.height;
        const { x, y } = cursor;
        if (x >= this.options.x &&
            x <= this.options.x + width &&
            y >= this.options.y &&
            y <= this.options.y + height)
            return true;
        return false;
    }
    click(_func) {
        this.events.push({
            eventType: "click",
            method: (event, cursor) => {
                if (this.checkInBound(event, cursor)) {
                    _func(event);
                }
            },
        });
    }
    set(options) {
        for (const [key, value] of Object.entries(options)) {
            if (key in Object.keys(this.options)) ;
            else {
                return;
            }
        }
        this.options = { ...this.options, ...options };
    }
    #resizeBox(width, height, x, y) { }
}

// Layer spesical type of block whcih defines group of blocks
class Layer extends Block {
    constructor(options) {
        super(options);
    }
}

// each shape extends form common shape
class Shape extends Block {
    constructor(options) {
        super(options);
    }
    lineWidth() {
        this._context.lineWidth = this.options.lineWidth;
    }
}

class TextBlock extends Block {
    text;
    fontY = 0;
    constructor(text, options = undefined) {
        super(options);
        this.text = text;
        // this.#initSet();
    }
    #measureText() {
        const text_measure = this.measureText();
        this.options.height =
            text_measure.actualBoundingBoxAscent +
                text_measure.actualBoundingBoxDescent;
        this.options.width = text_measure.width;
        this.fontY = this.options.height + this.options.y;
    }
    __initSet() {
        this._context.font = this.#format_font();
        this._context.fillStyle = this.options?.color || "black";
        this.#measureText();
        this._context.fillText(this.text, this.options.x, this.fontY, this.options?.maxWidth);
    }
    #format_font() {
        const fontFamily = this.options.fontFamily || "sans-serif";
        const fontSize = this.options.fontSize
            ? this.options.fontSize + "px"
            : "10px";
        const fontWeight = this.options.fontWeight || 100;
        const fontStyle = this.options.fontStyle || "normal";
        const fontVariant = this.options.fontVariant || "normal";
        return `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize} ${fontFamily}`;
    }
    __stroke() {
        this._context.strokeStyle = this.options.stroke;
        this._context.strokeText(this.text, this.options.x, this.fontY, this.options?.maxWidth);
    }
    __direction() {
        this._context.direction = this.options.direction;
    }
    __align() {
        this._context.textAlign = this.options.textAlign;
    }
    __baseline() {
        this._context.textBaseline = this.options.textBaseline;
    }
    set(options) {
        super.set(options);
    }
    // returns: text width in pixels
    measureText() {
        return this._context.measureText(this.text);
    }
}
/*
Todo - in css

@font-face {
    font-family: 'KulminoituvaRegular';
    src: url('http://www.miketaylr.com/f/kulminoituva.ttf');
}
*/
// import { Canvas } from "./Canvas";
// const canvas = new Canvas(200, 200);
// const box1 = new Block({ x: 0, y: 0 });
// const text_a = new TextBlock("First Text", {
//     x: 0,
//     y: 0,
//     color: "red",
//     fontFamily: "KulminoituvaRegular",
//     stroke: "red",
//     lineWidth: 10,
// });
// const text_b = new TextBlock("Second Text", {
//     x: 0,
//     y: 50,
//     color: "red",
//     fontFamily: "KulminoituvaRegular",
// });
// text_b.click((e) => {
//     text_a.options.color = "black";
//     text_a.set({ color: "black" });
// });
// canvas.add(text_b);
// console.log(text_b._context.strokeStyle);

export { Block, Canvas, CanvasDOMManager, Layer, Shape, TextBlock };
