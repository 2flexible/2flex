class Node {
    child_nodes;
    next;
    #listed_child_nodes;
    constructor() {
        this.child_nodes = [];
        this.next = undefined;
        this.#listed_child_nodes = [];
    }
    addChild(node) {
        this.next = node.shift();
        this.child_nodes.push(...node);
    }
    filterNodes(queries) {
        if (this.#listed_child_nodes.length === 0) {
            this.#listNodes();
        }
        if (queries) {
            this.#listed_child_nodes.filter((item) => {
                for (const [key, query] of Object.entries(queries)) {
                    if (item.options.hasOwnProperty(key) &&
                        Object.values(item.options).includes(query)) {
                        return item;
                    }
                }
            });
        }
        else {
            return this.#listed_child_nodes;
        }
    }
    #listNodes() {
        const Q = [];
        Q.push(this);
        while (Q.length > 0) {
            let current = Q.shift();
            if (current) {
                this.#listed_child_nodes.push(current);
            }
            if (current?.child_nodes) {
                Q.unshift(...current.child_nodes);
            }
            if (current?.next) {
                Q.unshift(current.next);
            }
        }
        this.#listed_child_nodes.shift();
    }
}
class Tree {
    #nodes;
    #head;
    #listed_nodes = [];
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
    // need a change
    pre_order_traversal(_func) {
        const Q = [];
        Q.push(this.#head);
        while (Q.length > 0) {
            let current = Q.shift();
            if (Object.getPrototypeOf(current).constructor.name !== "Node") {
                if (current) {
                    _func(current);
                    this.#listed_nodes.push(current);
                }
            }
            if (current?.child_nodes) {
                Q.unshift(...current.child_nodes);
            }
            if (current?.next) {
                Q.unshift(current.next);
            }
        }
        console.log(this.#listed_nodes);
    }
    checkNodes(_func) {
        this.#listed_nodes.forEach((item) => {
            _func(item);
        });
    }
    filter_nodes(queries) {
        return this.#listed_nodes.filter((item) => {
            for (const [key, query] of Object.entries(queries)) {
                if (item.options.hasOwnProperty(key) &&
                    Object.values(item.options).includes(query))
                    return item;
            }
        });
    }
}

class CanvasDOMManager {
    canvasId;
    constructor(canvasId) {
        this.canvasId = canvasId;
    }
    get context() {
        return this.canvas.getContext("2d");
    }
    get canvas() {
        const canvas = document.getElementById(this.canvasId);
        if (!canvas) {
            this.createCanvas();
        }
        return canvas;
    }
    // set canvas(canvas: HTMLCanvasElement) {
    //     const body = document.querySelector("body") as HTMLElement;
    //     body.appendChild(canvas);
    // }
    createCanvas() {
        const canvas = document.createElement("canvas");
        canvas.id = this.canvasId;
        const body = document.querySelector("body");
        body.appendChild(canvas);
    }
    changeStyle(options) {
        if (options !== undefined)
            for (const [key, value] of Object.entries(options)) {
                this.canvas.style.setProperty(key, `${value}`);
            }
    }
    addEventListener(_type, _func) {
        this.canvas.addEventListener(_type, (event) => {
            event.preventDefault();
            _func(event);
        }, { passive: false });
    }
    removeEventListener(_type, _func) {
        this.canvas.removeEventListener(_type, (event) => _func(event));
    }
}

class Canvas {
    #domCanvas;
    options;
    #canvasEvents = [];
    canvasId;
    #tree = new Tree();
    constructor(canvasId, options = undefined) {
        this.canvasId = canvasId || "canvas";
        this.options = options;
        this.#domCanvas = new CanvasDOMManager(canvasId);
        this.#initCanvas();
    }
    get context() {
        return this.#domCanvas.context;
    }
    get canvas() {
        return this.#domCanvas.canvas;
    }
    #initCanvas() {
        this.canvas;
        this.#domCanvas.changeStyle(this.options);
        this.zoom(this.#zoomInOut());
        this.move(this.#canvasMoves());
    }
    add(...block) {
        this.#tree.addNodes(block);
        this.#tree.pre_order_traversal((element) => {
            element.canvas = this;
            element.__initSet();
            this.#handleStyleChanges(element);
            this.#canvasEvents.push(...element.events);
        });
        this.#handleEvents();
    }
    getCursorPosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const cursor = { x, y };
        return cursor;
    }
    #handleEvents() {
        // created events for every same type events beacuse canvas is same, but coridanets changing
        let uniqeEvents = [];
        for (const item of this.#canvasEvents) {
            const tempUniqe = uniqeEvents?.filter((_item) => _item.eventType === item.eventType);
            if (tempUniqe[0]) {
                const idx = uniqeEvents.indexOf(tempUniqe[0]);
                uniqeEvents.splice(idx, 1);
                tempUniqe[0].methods.push(item.method);
                uniqeEvents = [...uniqeEvents, tempUniqe[0]];
            }
            else {
                uniqeEvents.push({
                    eventType: item.eventType,
                    methods: [item.method],
                });
            }
        }
        this.#canvasEvents = uniqeEvents;
        this.#canvasEvents?.forEach((elem) => {
            this.#domCanvas.addEventListener(elem.eventType, (event) => {
                // const cursor = this.getCursorPosition(event);
                elem.methods?.forEach((_method) => {
                    _method(event);
                });
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
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.#tree.checkNodes((element) => {
            this.#handleStyleChanges(element);
        });
    }
    // we can do this later as and || or
    find(queries) {
        return this.#tree.filter_nodes(queries);
    }
    zoom(_func) {
        this.#domCanvas.removeEventListener("wheel", this.#zoomInOut);
        this.#domCanvas.addEventListener("wheel", (event) => _func(event));
    }
    #zoomInOut() {
        return (event) => {
            if (event.ctrlKey) {
                this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                if (event.deltaY < 0) {
                    this.#tree.checkNodes((element) => {
                        element.options.fontSize *= 1.25;
                        this.#handleStyleChanges(element);
                    });
                }
                else {
                    this.#tree.checkNodes((element) => {
                        element.options.fontSize /= 1.25;
                        this.#handleStyleChanges(element);
                    });
                }
            }
        };
    }
    move(_func) {
        this.#domCanvas.removeEventListener("wheel", this.#canvasMoves);
        this.#domCanvas.addEventListener("wheel", (event) => _func(event));
    }
    #canvasMoves() {
        return (event) => {
            if (event.ctrlKey) {
                return;
            }
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            if (event.shiftKey) {
                if (event.deltaY < 0) {
                    this.#tree.checkNodes((element) => {
                        element.options.x += 10;
                        this.#handleStyleChanges(element);
                    });
                }
                else {
                    this.#tree.checkNodes((element) => {
                        element.options.x -= 10;
                        this.#handleStyleChanges(element);
                    });
                }
            }
            else {
                if (event.deltaY < 0) {
                    this.#tree.checkNodes((element) => {
                        element.options.y += 10;
                        this.#handleStyleChanges(element);
                    });
                }
                else {
                    this.#tree.checkNodes((element) => {
                        element.options.y -= 10;
                        this.#handleStyleChanges(element);
                    });
                }
            }
        };
    }
}

const defaultOpt = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    selectable: true,
};
// each Block is Node
class Block extends Node {
    canvas;
    options;
    events = [];
    styleChanges = [];
    constructor(options = undefined) {
        super();
        this.options = { ...defaultOpt, ...options };
    }
    __initSet() { }
    get context() {
        return this.canvas.context;
    }
    add(...block) {
        this.addChild(block);
    }
    registerStyle(styles) {
        this.styleChanges.push(...styles);
    }
    checkInBound(_event) {
        const width = this.options.width;
        const height = this.options.height;
        const { x, y } = this.canvas.getCursorPosition(_event);
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
            method: (event) => {
                _func(event);
            },
        });
    }
    mousedown(_func) {
        this.events.push({
            eventType: "mousedown",
            method: (event) => {
                _func(event);
            },
        });
    }
    mouseup(_func) {
        this.events.push({
            eventType: "mouseup",
            method: (event) => {
                _func(event);
            },
        });
    }
    mousemove(_func) {
        this.events.push({
            eventType: "mousemove",
            method: (event) => {
                _func(event);
            },
        });
    }
    selectable(option) {
        if (option === false)
            return;
        let old_color = this.options.color;
        this.mousemove((event) => {
            if (this.checkInBound(event)) {
                this.set({ color: "yellow" });
            }
            else {
                this.set({ color: old_color });
            }
        });
    }
    draggable(option = true) {
        const duplicat = this.events.filter((elem) => elem.eventType === "mousedown");
        if (option === false)
            return;
        if (duplicat.length > 1)
            return;
        let isMouseDown = false;
        let initX = 0;
        let initY = 0;
        let beforeX = 0;
        let beforeY = 0;
        this.mousedown((event) => {
            if (this.checkInBound(event)) {
                const { x, y } = this.canvas.getCursorPosition(event);
                initX = x;
                initY = y;
                if (event.button === 0) {
                    isMouseDown = true;
                    beforeX = 0;
                    beforeY = 0;
                }
            }
        });
        this.mousemove((event) => {
            if (isMouseDown) {
                const { x, y } = this.canvas.getCursorPosition(event);
                let diffX = x - initX;
                let diffY = y - initY;
                if (diffX !== 0) {
                    this.options.x += diffX - beforeX;
                    beforeX = diffX;
                }
                if (diffY !== 0) {
                    this.options.y += diffY - beforeY;
                    beforeY = diffY;
                }
                if (diffX !== 0 || diffY !== 0) {
                    this.canvas.invokeChange?.call(this.canvas);
                }
            }
        });
        this.mouseup((event) => {
            if (this.checkInBound(event)) ;
            isMouseDown = false;
        });
    }
    set(options) {
        let cached = false;
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
            this.canvas.invokeChange?.call(this.canvas);
        }
    }
    find(queries = undefined) {
        return this.filterNodes(queries);
    }
}

// Layer spesical type of block whcih defines group of blocks
class Layer extends Block {
    constructor(options) {
        super(options);
    }
    __initSet() {
        const all_childs = this.find();
        all_childs?.forEach((item) => {
            item.options.x = this.options.x + item.options.x;
            item.options.y = this.options.y + item.options.y;
        });
    }
}

// each shape extends form common shape
class Shape extends Block {
    constructor(options) {
        super(options);
    }
    lineWidth() {
        this.context.lineWidth = this.options.lineWidth;
    }
}

class TextBlock extends Block {
    text;
    constructor(text, options = undefined) {
        super(options);
        this.text = text;
        this.options.text = text;
    }
    #measureTextSize() {
        const text_measure = this.measureText();
        this.options.height =
            text_measure.actualBoundingBoxAscent +
                text_measure.actualBoundingBoxDescent;
        this.options.width = text_measure.width;
        return this.options.height + this.options.y;
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
        this.context.font = option || this.#format_font();
        this.color();
        const fontY = this.#measureTextSize();
        this.context.fillText(this.text, this.options.x, fontY, this.options?.maxWidth);
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
        this.context.fillStyle = option ?? (this.options.color || "black");
        this.options.color = this.context.fillStyle;
    }
    stroke(option) {
        this.context.strokeStyle = this.options.stroke || option;
        const fontY = this.#measureTextSize();
        this.context.strokeText(this.text, this.options.x, fontY, this.options?.maxWidth);
        this.options.strokeStyle = this.context.strokeStyle;
    }
    direction(option) {
        this.context.direction = this.options.direction || option;
        this.options.direction = this.context.direction;
    }
    textAlign(option) {
        this.context.textAlign = this.options.textAlign || option;
        this.options.align = this.context.align;
    }
    textBaseline(option) {
        this.context.textBaseline = this.options.textBaseline || option;
        this.options.baseline = this.context.baseline;
    }
    // returns: text width in pixels
    measureText() {
        return this.context.measureText(this.text);
    }
    draggable(option) {
        super.draggable(option);
    }
    selectable(option) {
        super.selectable(option);
    }
    set(options) {
        super.set(options);
    }
}

export { Block, Canvas, CanvasDOMManager, Layer, Shape, TextBlock };
