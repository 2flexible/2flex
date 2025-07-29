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
    preOrderTraversal(_func) {
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
        // console.log(this.#listed_nodes);
    }
    checkNodes(_func) {
        this.#listed_nodes.forEach((item) => {
            _func(item);
        });
    }
    filterNodes(queries) {
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
    width;
    height;
    constructor(canvasId, width, height) {
        this.canvasId = canvasId;
        this.width = width;
        this.height = height;
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
        canvas.width = 800;
        canvas.height = 400;
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

/*
@Todo
make checkpoint for canvas to load
export canvas model
make import model for canvas
*/
class Canvas {
    #domCanvas;
    options;
    #canvasEvents = [];
    canvasId;
    width;
    height;
    #tree = new Tree();
    constructor(canvasId, width, height, options = undefined) {
        this.canvasId = canvasId || "canvas";
        this.options = options;
        this.width = width || 300;
        this.height = height || 300;
        this.#domCanvas = new CanvasDOMManager(this.canvasId, this.width, this.height);
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
    getBoundingClientRect() {
        return this.canvas.getBoundingClientRect();
    }
    add(...block) {
        this.#tree.addNodes(block);
        this.#tree.preOrderTraversal((element) => {
            element.canvas = this;
            this.#handleStyleChanges(element);
            element.__initSet();
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
        // created events for every same type events beacuse canvas is same, but events changing
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
    invokeChange(_func) {
        this.clearRect();
        this.#tree.checkNodes((element) => {
            if (_func)
                _func(element);
            this.#handleStyleChanges(element);
            element.__initSet();
        });
    }
    // we can do this later as and || or
    find(queries) {
        return this.#tree.filterNodes(queries);
    }
    zoom(_func) {
        this.#domCanvas.removeEventListener("wheel", this.#zoomInOut);
        this.#domCanvas.addEventListener("wheel", (event) => _func(event));
    }
    // not workign correctyly due to x and y cordinates
    #zoomInOut() {
        let scale = 1.02;
        let invScale = 0.95;
        let xx = undefined;
        let yy = undefined;
        return (event) => {
            if (event.ctrlKey) {
                if (event.deltaY < 0) {
                    this.invokeChange((elem) => {
                        // const diffX = elem.options.x * scale - elem.options.x;
                        // elem.options.width += this.width * scale - this.width;
                        elem.options.width *= scale;
                        if (!xx) {
                            xx = elem.options.x;
                        }
                        if (!yy) {
                            yy = elem.options.y;
                        }
                        xx *= scale;
                        yy *= scale;
                        console.log("xx");
                        console.log(xx);
                        elem.initX = xx;
                        elem.initY = yy;
                        this.context.scale(1.02, 1.02);
                    });
                }
                else {
                    this.invokeChange((elem) => {
                        this.width /= invScale;
                        this.height /= invScale;
                        elem.options.width *= invScale;
                        elem.options.height *= invScale;
                        elem.options.x *= invScale;
                        elem.options.y *= invScale;
                        // invScale *= 0.95;
                        this.context.scale(invScale, invScale);
                    });
                }
            }
        };
    }
    clearRect() {
        this.context.clearRect(0, 0, this.width, this.height);
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
            if (event.shiftKey) {
                if (event.deltaY < 0) {
                    this.invokeChange((element) => (element.options.x += 10));
                }
                else {
                    this.invokeChange((element) => (element.options.x -= 10));
                }
            }
            else {
                if (event.deltaY < 0) {
                    this.invokeChange((element) => (element.options.y += 10));
                }
                else {
                    this.invokeChange((element) => (element.options.y -= 10));
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
    draggable: true,
};
// each Block is Node
class Block extends Node {
    initX;
    initY;
    canvas;
    options;
    // too much events pushing
    events = [];
    styleChanges = [];
    constructor(options) {
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
    x(option) {
        this.options.x = option || this.options.x;
        return this.options.x;
    }
    y(option) {
        this.options.y = option || this.options.y;
        return this.options.y;
    }
    width(option) {
        this.options.width = option || this.options.width;
        return this.options.width;
    }
    height(option) {
        this.options.height = option || this.options.height;
        return this.options.height;
    }
    color(option) {
        this.options.color = option || this.options.color || "black";
        this.context.fillStyle = this.options.color;
        return this.options.color;
    }
    strokeColor(option) {
        this.options.strokeColor =
            option || this.options.strokeColor || "black";
        this.context.strokeStyle = this.options.strokeColor;
        return this.options.strokeColor;
    }
    stroke(option) {
        this.options.stroke = option || this.options.stroke || 10;
        this.context.lineWidth = this.options.stroke;
        return this.options.stroke;
    }
    fill() {
        this.context.fill();
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
            this.canvas?.invokeChange.call(this.canvas);
        }
    }
    find(queries = undefined) {
        return this.filterNodes(queries);
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
                if (this.checkInBound(event)) {
                    _func(event);
                }
            },
        });
    }
    dbclick(_func) {
        this.events.push({
            eventType: "dblclick",
            method: (event) => {
                if (this.checkInBound(event)) {
                    _func(event);
                }
            },
        });
    }
    mousedown(_func) {
        this.events.push({
            eventType: "mousedown",
            method: (event) => {
                if (this.checkInBound(event)) {
                    _func(event);
                }
            },
        });
    }
    mouseup(_func) {
        this.events.push({
            eventType: "mouseup",
            method: (event) => {
                if (this.checkInBound(event)) {
                    _func(event);
                }
            },
        });
    }
    // unexcpected behavier due to not implimenting checkInbound
    mousemove(_func) {
        this.events.push({
            eventType: "mousemove",
            method: (event) => {
                _func(event);
            },
        });
    }
    mouseenter(_func) {
        this.options.mouseenter = true;
        this.mousemove((event) => {
            if (this.checkInBound(event)) {
                if (this.options.mouseenter) {
                    this.options.mouseenter = false;
                    _func(event);
                }
            }
            else {
                this.options.mouseenter = true;
            }
        });
    }
    mouseleave(_func) {
        this.options.mouseleave = false;
        this.mousemove((event) => {
            if (!this.checkInBound(event)) {
                if (this.options.mouseleave) {
                    _func(event);
                    this.options.mouseleave = false;
                }
            }
            else {
                this.options.mouseleave = true;
            }
        });
    }
    mouseout(_func) {
        this.mousemove((event) => {
            if (!this.checkInBound(event)) {
                _func(event);
            }
        });
    }
    mouseover(_func) {
        this.mousemove((event) => {
            if (this.checkInBound(event)) {
                _func(event);
            }
        });
    }
    selectable(option) {
        const duplicat = this.events.filter((elem) => elem.eventType === "selectable");
        if (!option || duplicat.length >= 1)
            return false;
        this.events.push({
            eventType: "selectable",
            method: () => { },
        });
        let old_color = this.options.color;
        this.mousemove((event) => {
            if (!this.options.mousedown && this.checkInBound(event)) {
                this.set({ color: "yellow" });
            }
            else {
                this.set({ color: old_color });
            }
        });
        this.options.selectable = option;
        return this.options.selectable;
    }
    draggable(option) {
        const duplicat = this.events.filter((elem) => elem.eventType === "draggable");
        if (!option || duplicat.length >= 1 || !this.options.selectable)
            return false;
        this.events.push({
            eventType: "draggable",
            method: () => { },
        });
        let isMouseDown = false;
        let initX = 0;
        let initY = 0;
        let beforeX = 0;
        let beforeY = 0;
        this.mousedown((event) => {
            const { x, y } = this.canvas.getCursorPosition(event);
            initX = x;
            initY = y;
            if (event.button === 0) {
                isMouseDown = true;
                beforeX = 0;
                beforeY = 0;
                this.options.mousedown = isMouseDown;
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
            isMouseDown = false;
            this.options.mousedown = isMouseDown;
        });
        this.options.draggable = option;
        return this.options.draggable;
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
    constructor(options = undefined) {
        super(options);
    }
    lineWidth() {
        this.context.lineWidth = this.options.lineWidth;
    }
    stroke(option) {
        this.context.lineWidth = this.options.stroke || option;
    }
    fill() { }
    color(option) {
        super.color(option);
        super.fill();
    }
}

class TextBlock extends Block {
    text;
    constructor(text, options) {
        super(options);
        this.text = text;
        this.options.text = text;
    }
    __initSet() {
        this.setFont();
        this.color();
        const fontY = this.#measureTextSize();
        this.context.fillText(this.text, this.options.x, fontY, this.options.maxWidth);
    }
    #measureTextSize() {
        const text_measure = this.measureText();
        this.options.height = text_measure.hangingBaseline;
        // text_measure.actualBoundingBoxAscent +
        // text_measure.actualBoundingBoxDescent;
        this.options.width = text_measure.width;
        return this.options.height + this.options.y;
    }
    x(option) {
        return super.x(option);
    }
    y(option) {
        return super.y(option);
    }
    #format_font() {
        const fontFamily = this.fontFamily();
        const fontSize = this.fontSize();
        const fontStyle = this.fontStyle();
        const fontWeight = this.fontWeight();
        const fontVariant = this.fontVariant();
        return `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize}px ${fontFamily}`;
    }
    // option: it has to bee in this format: "fontStyle fontVariant fontWeight fontSize fontFamily"
    setFont(option) {
        this.context.font = option || this.#format_font();
    }
    fontFamily(option) {
        this.options.fontFamily =
            option || this.options.fontFamily || "sans-serif";
        return this.options.fontFamily;
    }
    fontSize(option) {
        this.options.fontSize = option || this.options.fontSize || 10;
        return this.options.fontSize;
    }
    fontWeight(option) {
        this.options.fontWeight = option || this.options.fontWeight || 100;
        return this.options.fontWeight;
    }
    fontVariant(option) {
        this.options.fontVariant =
            option || this.options.fontVariant || "normal";
        return this.options.fontVariant;
    }
    fontStyle(option) {
        this.options.fontStyle = option || this.options.fontVariant || "normal";
        return this.options.fontStyle;
    }
    fontStretch(option) {
        this.options.fontStretch =
            option || this.options.fontStretch || "normal";
        return this.options.fontStretch;
    }
    fontKerning(option) {
        this.options.fontKerning =
            option || this.options.fontKerning || "auto";
        return this.options.fontKerning;
    }
    color(option) {
        super.color(option);
    }
    stroke(option) {
        this.setFont();
        this.strokeColor();
        super.stroke(option);
        const fontY = this.#measureTextSize();
        this.context.strokeText(this.text, this.options.x, fontY, this.options?.maxWidth);
        return this.options.stroke;
    }
    strokeColor(option) {
        return super.strokeColor(option);
    }
    direction(option) {
        this.context.direction = option || this.options.direction;
        this.options.direction = this.context.direction;
        return this.options.direction;
    }
    textAlign(option) {
        this.context.textAlign = option || this.options.textAlign;
        this.options.align = this.context.align;
        return this.options.align;
    }
    textBaseline(option) {
        this.context.textBaseline = option || this.options.textBaseline;
        this.options.baseline = this.context.baseline;
        return this.options.baseline;
    }
    // @return: text width in pixels
    measureText() {
        return this.context.measureText(this.text);
    }
    draggable(option) {
        return super.draggable(option);
    }
    selectable(option) {
        return super.selectable(option);
    }
    set(options) {
        super.set(options);
    }
}

class Rectangle extends Block {
    prevX = undefined;
    prevY = undefined;
    constructor(options) {
        super(options);
    }
    __initSet() {
        this.drawRectangle();
    }
    drawRectangle() {
        this.context.beginPath();
        super.color();
        // console.log(this.prevX, this.prevY);
        this.context.rect(this.options.x, this.options.y, this.options.width, this.options.height);
        super.fill();
    }
    color(option) {
        super.color(option);
        super.fill();
    }
    x(option) {
        return super.x(option);
    }
    y(option) {
        return super.y(option);
    }
    width(option) {
        return super.width(option);
    }
    height(option) {
        return super.height(option);
    }
    draggable(option) {
        return super.draggable(option);
    }
    selectable(option) {
        return super.selectable(option);
    }
    set(options) {
        super.set(options);
    }
}

export { Block, Canvas, CanvasDOMManager, Layer, Rectangle, Shape, TextBlock };
