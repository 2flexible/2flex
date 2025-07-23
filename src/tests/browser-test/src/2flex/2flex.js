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
            element.canvas = this;
            element.__initSet();
            element.invoker = this.invokeChange;
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
        for (const [key, value] of Object.entries(block.options)) {
            const proto = Object.getPrototypeOf(block);
            const obj = Object.getOwnPropertyDescriptor(proto, key);
            obj?.value.call(block, value);
        }
    }
    invokeChange() {
        console.log("cached");
        this.context?.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.#tree.pre_order_traversal((element) => {
            this.#handleStyleChanges(element);
        });
    }
}

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
    invoker = undefined;
    canvas;
    events = [];
    styleChanges = [];
    constructor(options = undefined) {
        super();
        this.options = { ...defaultOpt, ...options };
    }
    __initSet() { }
    add(...block) {
        this.addChild(block);
    }
    registerStyle(styles) {
        this.styleChanges.push(...styles);
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
        let cached = false;
        // this.styleChanges.forEach((change: IStyle) => {
        //     const option = options[change.styleType];
        //     const beforeOption = this.options[change.styleType];
        //     if (option) {
        //         if (option !== beforeOption) {
        //             change.method.call(this, option);
        //         } else {
        //             cached = true;
        //         }
        //     }
        // });
        for (const [key, value] of Object.entries(options)) {
            const proto = Object.getPrototypeOf(this);
            const obj = Object.getOwnPropertyDescriptor(proto, key);
            const beforeOption = this.options[key];
            if (value) {
                if (value !== beforeOption) {
                    obj?.value.call(this, value);
                }
                else {
                    cached = true;
                }
            }
        }
        if (!cached) {
            console.log(cached);
            this.invoker?.call(this.canvas);
        }
    }
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
        // const stylesMap = [
        //     { styleType: "fontFamily", method: this.fontFamily },
        //     { styleType: "fontWeight", method: this.fontWeight },
        //     { styleType: "fontSize", method: this.fontSize },
        //     { styleType: "fontStyle", method: this.fontStyle },
        //     { styleType: "fontVariant", method: this.fontVariant },
        //     { styleType: "textAlign", method: this.align },
        //     { styleType: "textBaseline", method: this.baseline },
        //     { styleType: "direction", method: this.direction },
        // ];
        // this.registerStyle(stylesMap);
    }
    #measureTextSize() {
        const text_measure = this.measureText();
        this.options.height =
            text_measure.actualBoundingBoxAscent +
                text_measure.actualBoundingBoxDescent;
        this.options.width = text_measure.width;
        this.fontY = this.options.height + this.options.y;
    }
    __initSet() {
        this.setFont();
    }
    #format_font() {
        const fontFamily = this.fontFamily();
        const fontSize = this.fontSize();
        const fontStyle = this.fontStyle();
        const fontWeight = this.fontWeight();
        const fontVariant = this.fontVariant();
        return `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize} ${fontFamily}`;
    }
    // it has to bee in this format: "fontStyle fontVariant fontWeight fontSize fontFamily"
    setFont(option) {
        this._context.font = option || this.#format_font();
        this.color();
        this.#measureTextSize();
        this._context.fillText(this.text, this.options.x, this.fontY, this.options?.maxWidth);
    }
    fontFamily(option) {
        if (option) {
            this.options.fontFamily = option;
            this.setFont();
        }
        return this.options.fontFamily || "sans-serif";
    }
    fontSize(option) {
        if (option) {
            this.options.fontSize = option;
            this.setFont();
        }
        return this.options.fontSize ? this.options.fontSize + "px" : "10px";
    }
    fontWeight(option) {
        if (option) {
            this.options.fontWeight = option;
            this.setFont();
        }
        return this.options.fontWeight || 100;
    }
    fontVariant(option) {
        if (option) {
            this.options.fontVariant = option;
            this.setFont();
        }
        return this.options.fontVariant || "normal";
    }
    fontStyle(option) {
        if (option) {
            this.options.fontStyle = option;
            this.setFont();
        }
        return this.options.fontStyle || "normal";
    }
    color(option) {
        this._context.fillStyle = this.options.color || option || "black";
        this.options.color = this._context.fillStyle;
    }
    stroke(option) {
        this._context.strokeStyle = this.options.stroke || option;
        this._context.strokeText(this.text, this.options.x, this.fontY, this.options?.maxWidth);
        this.options.strokeStyle = this._context.strokeStyle;
    }
    direction(option) {
        this._context.direction = this.options.direction || option;
        this.options.direction = this._context.direction;
    }
    textAlign(option) {
        this._context.textAlign = this.options.textAlign || option;
        this.options.align = this._context.align;
    }
    textBaseline(option) {
        this._context.textBaseline = this.options.textBaseline || option;
        this.options.baseline = this._context.baseline;
    }
    // returns: text width in pixels
    measureText() {
        return this._context.measureText(this.text);
    }
    set(options) {
        super.set(options);
    }
}

export { Block, Canvas, CanvasDOMManager, Layer, Shape, TextBlock };
