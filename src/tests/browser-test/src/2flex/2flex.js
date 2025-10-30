class Node {
    child_nodes;
    next;
    #listed_child_nodes;
    _childs = [];
    constructor() {
        this.child_nodes = [];
        this.next = undefined;
        this.#listed_child_nodes = [];
    }
    addChild(node) {
        this._childs.push(...node);
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
        console.log(this.#listed_nodes);
    }
    checkNodes(_func, reverse) {
        let nodes = this.#listed_nodes;
        if (reverse)
            nodes = [...this.#listed_nodes].reverse();
        nodes.forEach((item) => {
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

class Path extends Path2D {
    path;
    constructor(path) {
        super(path);
        this.path = new Path2D(path);
    }
    addBackgroundPath(width, height) {
        this.path.rect(0, 0, width, height);
    }
    addRect(x, y, width, height, borderRadius) {
        this.path.roundRect(x, y, width, height, borderRadius);
    }
    lineTo(x, y) {
        this.path.lineTo(x, y);
    }
    createPath(path) {
        this.path = new Path2D(path);
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
    clipping_path;
    #tree = new Tree();
    cords = { x: 0, y: 0 };
    constructor(canvasId, width, height, options = undefined) {
        this.canvasId = canvasId || "canvas";
        this.options = options;
        this.width = width || 300;
        this.height = height || 300;
        this.clipping_path = new Path();
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
        this.context.save();
        // this.context.translate(100,100)
        this.move(this.#canvasMoves());
        window.onload = () => {
            this.#domCanvas.changeStyle(this.options);
            this.zoom(this.#zoomInOut());
        };
    }
    add(...block) {
        // block = block.reverse();
        this.#tree.addNodes(block);
        this.#tree.preOrderTraversal((element) => {
            element.canvas = this;
            this.#handleOptions(element);
            element.__initSet();
            this.#canvasEvents.push(...element.events);
        });
        let zIndex = 0;
        this.#tree.checkNodes((el) => {
            el.options.zIndex += zIndex;
            zIndex += 1;
        }, true);
        this.#handleEvents();
    }
    get canvasBounding() {
        return this.canvas.getBoundingClientRect();
    }
    getCursorPosition(event) {
        const rect = this.canvasBounding;
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
    #handleOptions(block, ignore) {
        for (const [key, value] of Object.entries(block.options)) {
            const proto = Object.getPrototypeOf(block);
            const obj = Object.getOwnPropertyDescriptor(proto, key);
            if (ignore && ignore.includes(key))
                return;
            if (obj) {
                obj.value.call(block, value);
            }
            else {
                block.options[key] = value;
            }
        }
    }
    invokeChange(_func) {
        // need to make for invidiual change rather than creating this path
        this.clipping_path.createPath();
        this.context.restore();
        this.context.save();
        this.clearRect();
        this.context.translate(this.cords.x, this.cords.y);
        const ignore = ["layout", "alignItems", "justifyContent", "justifyItems", "alignContent"];
        this.#tree.checkNodes((element) => {
            if (_func)
                _func(element);
            this.#handleOptions(element, ignore);
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
            let invoke = false;
            if (event.ctrlKey) {
                return;
            }
            if (event.shiftKey) {
                if (event.deltaY < 0) {
                    this.cords.x -= 10;
                    invoke = true;
                }
                else {
                    this.cords.x += 10;
                    invoke = true;
                }
            }
            else {
                if (event.deltaY < 0) {
                    this.cords.y += 10;
                    invoke = true;
                }
                else {
                    this.cords.y -= 10;
                    invoke = true;
                }
            }
            if (invoke)
                this.invokeChange();
        };
    }
}

const defaultOpt$5 = {
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    selectable: true,
    draggable: true,
    dragX: true,
    dragY: true,
    zIndex: 0,
    strokeWidth: 0,
};
// Each element in the canvas is block
// each Block is Node
class Block extends Node {
    canvas;
    options;
    events = [];
    initCords = {
        x: 0,
        y: 0,
    };
    styleChanges = [];
    constructor(options) {
        super();
        this.options = { ...defaultOpt$5, ...options };
        this.initCords.x = this.options.x;
        this.initCords.y = this.options.y;
    }
    __initSet() { }
    get context() {
        return this.canvas.context;
    }
    add(...block) {
        this.addChild(block);
        this.__adjustCordinates();
    }
    __adjustCordinates() {
        this._childs?.forEach((item) => {
            if (item) {
                item.initCords.x = this.initCords.x + item.options.x;
                item.initCords.y = this.initCords.y + item.options.y;
                item.__adjustCordinates();
            }
        });
    }
    x(opt) {
        this.options.x = opt || this.options.x;
        return this.options.x;
    }
    y(opt) {
        this.options.y = opt || this.options.y;
        return this.options.y;
    }
    width(opt) {
        this.options.width = opt || this.options.width;
        return this.options.width;
    }
    height(opt) {
        this.options.height = opt || this.options.height;
        return this.options.height;
    }
    clip_path() {
        this.canvas.clipping_path.addRect(this.initCords.x, this.initCords.y, this.options.width, this.options.height, this.options.borderRadius);
    }
    clip(opt) {
        this.options.clip = opt || this.options.clip || false;
        if (this.options.clip) {
            this.clip_path();
            if (!this.options.fillRule)
                this.fillRule();
            this.context.clip(this.canvas.clipping_path.path, this.options.fillRule);
        }
        return this.options.clip;
    }
    fillRule(opt) {
        this.options.fillRule = opt || this.options.fillRule || "nonzero";
        return this.options.fillRule;
    }
    zIndex(opt) {
        this.options.zIndex = opt || this.options.zIndex;
        return this.options.zIndex;
    }
    set(options) {
        let cached = false;
        if (options)
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
    __cacheOption(option, def, opt) {
        opt = opt || option || def;
        return opt;
    }
    reset() { }
    rotate(opt) {
        this.options.rotate = opt || this.options.angle || 0;
        this.context.rotate(this.options.angle);
        return this.options.rotate;
    }
    // had to come first for block scaling
    scale(x, y) {
        this.context.scale(x, y);
    }
    bind(block, options) { }
    find(queries) {
        return this.filterNodes(queries);
    }
    nthChild(opt) { }
    checkInBound(_event) {
        const width = this.options.width;
        const height = this.options.height;
        const { x, y } = this.canvas.getCursorPosition(_event);
        // include broder or stroke for dragging within them
        const diffX = Math.abs(this.initCords.x);
        const diffY = Math.abs(this.initCords.y);
        if (x >= diffX &&
            x <= this.initCords.x + width &&
            y >= diffY &&
            y <= this.initCords.y + height) {
            return true;
        }
        return false;
    }
    click(_func) {
        this.events.push({
            eventType: "click",
            method: (event) => {
                if (this.options.selectable && this.checkInBound(event)) {
                    _func(event);
                }
            },
        });
    }
    dbclick(_func) {
        this.events.push({
            eventType: "dblclick",
            method: (event) => {
                if (this.options.selectable && this.checkInBound(event)) {
                    _func(event);
                }
            },
        });
    }
    mousedown(_func) {
        this.events.push({
            eventType: "mousedown",
            method: (event) => {
                if (this.options.selectable && this.checkInBound(event)) {
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
            if (this.options.selectable && this.checkInBound(event)) {
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
            if (this.options.selectable && this.checkInBound(event)) {
                _func(event);
            }
        });
    }
    selectableAction(_func) {
        this.events.push({
            eventType: "mousemove",
            method: (event) => {
                if (!this.options.mousedown && this.checkInBound(event)) {
                    _func(event);
                }
            },
        });
    }
    selectable(opt) {
        const duplicat = this.events.filter((elem) => elem.eventType === "selectable");
        if (!opt || duplicat.length >= 1)
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
        this.options.selectable = opt;
        return this.options.selectable;
    }
    dragX(opt) {
        this.options.dragX = opt || this.options.dragX;
        return this.options.dragX;
    }
    dragY(opt) {
        this.options.dragY = opt || this.options.dragY;
        return this.options.dragY;
    }
    draggable(opt) {
        const duplicat = this.events.filter((elem) => elem.eventType === "draggable");
        if (!opt || duplicat.length >= 1 || !this.options.selectable)
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
                if (diffX !== 0 && this.options.dragX) {
                    this.initCords.x = this.initCords.x
                        ? this.initCords.x
                        : this.options.x;
                    this.initCords.x += diffX - beforeX;
                    beforeX = diffX;
                }
                if (diffY !== 0 && this.options.dragY) {
                    this.initCords.y = this.initCords.y
                        ? this.initCords.y
                        : this.options.y;
                    this.initCords.y += diffY - beforeY;
                    beforeY = diffY;
                }
                this.__adjustCordinates();
                this.canvas.invokeChange?.call(this.canvas);
            }
        });
        this.mouseup((event) => {
            isMouseDown = false;
            this.options.mousedown = isMouseDown;
        });
        this.options.draggable = opt;
        return this.options.draggable;
    }
}

const defaultOpt$4 = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    selectable: true,
    draggable: true,
    zIndex: 0,
    dragX: true,
    dragY: true,
    gapColumn: 0,
    gapRow: 0,
    wrap: "nowrap",
    flexDirection: "row",
};
// Layer spesical type of block whcih defines group of blocks
// @todo: some of the methods won't be triggered by the invoker
class Layout extends Block {
    #startX = 0;
    #startY = 0;
    #startXPos = [];
    #startYPos = [];
    #columnsGap = [];
    #rowsGap = [];
    #isNew = true;
    #containerW = 0;
    #containerH = 0;
    #rows = { nItems: 0, width: [], height: [], cols: [] };
    #cols = { nItems: 0, width: [], height: [], rows: [] };
    constructor(options) {
        super(options);
        this.options = { ...defaultOpt$4, ...options };
    }
    __initSet() {
        super.__initSet();
    }
    clip(opt) {
        return super.clip(opt);
    }
    dragX(opt) {
        return super.dragX(opt);
    }
    dragY(opt) {
        return super.dragY(opt);
    }
    draggable(opt) {
        return super.draggable(opt);
    }
    selectable(opt) {
        return super.selectable(opt);
    }
    set(options) {
        super.set(options);
    }
    layout(opt) {
        const layout = this.__cacheOption(this.options.flex, 0, opt);
        if (layout == "inline-flex" || layout == "inline-grid") {
            if (!this.options.width)
                this.options.width = this._childs.reduce((prev, curr) => prev + curr.options.width, 0);
            if (!this.options.height)
                this.options.height = this._childs.reduce((prev, curr) => prev + curr.options.height, 0);
        }
        if (layout === "flex" || layout == "inline-flex") {
            switch (this.options.flexDirection) {
                case "column":
                    this.#flexColumn();
                    break;
                case "column-reverse":
                    this.#flexColumnReverse();
                    break;
                case "row":
                    this.#flexRow();
                    break;
                case "row-reverse":
                    this.#flexRowReverse();
                    break;
                default:
                    this.#flexRow();
                    break;
            }
        }
        else if (layout == "grid" || layout == "inline-grid") {
            this.#gridLayout();
        }
        return layout;
    }
    flex(opt) {
        const flex = this.__cacheOption(this.options.flex, 0, opt);
        this.options.flexGrow = flex[0] || this.options.flexGrow;
        this.options.flexShrink = flex[1] || this.options.flexGrow;
        this.options.flexBasis = flex[2] || this.options.flexGrow;
        return flex;
    }
    flexFlow(opt) {
        const flexFlow = this.__cacheOption(this.options.flexFlow, 0, opt);
        this.options.flexDirection = flexFlow[0] || this.options.flexDirection;
        this.options.flexWrap = flexFlow[1] || this.options.flexWrap;
        return flexFlow;
    }
    flexGrow(opt) {
        return this.__cacheOption(this.options.flexGrow, 0, opt);
    }
    flexShrink(opt) {
        return this.__cacheOption(this.options.flexShrink, 0, opt);
    }
    flexBasis(opt) {
        return this.__cacheOption(this.options.flexBasis, 0, opt);
    }
    flexDirection(opt) {
        return this.__cacheOption(this.options.flexDirection, 0, opt);
    }
    flexWrap(opt) {
        return this.__cacheOption(this.options.flexWrap, 0, opt);
    }
    gap(opt) {
        const gap = this.__cacheOption(this.options.gapColumn, 0, opt);
        if (opt instanceof Array) {
            this.options.gapColumn = opt[0] || gap;
            this.options.gapRow = opt[1] || gap;
        }
        else {
            this.options.gapColumn = gap;
            this.options.gapRow = gap;
        }
        return gap;
    }
    gridArea(opt) { }
    gapColumn(opt) {
        return this.__cacheOption(this.options.gapColumn, 0, opt);
    }
    gapRow(opt) {
        return this.__cacheOption(this.options.gapRow, 0, opt);
    }
    columnStart(opt) {
        return this.__cacheOption(this.options.columnStart, 1, opt);
    }
    columnEnd(opt) {
        return this.__cacheOption(this.options.columnEnd, 0, opt);
    }
    justifyContent(opt) {
        const justifyContent = this.__cacheOption(this.options.justifyContent, "normal", opt);
        const justify = "justifyContent";
        switch (justifyContent) {
            case "space-evenly":
                this.#spaceEvenly(justify);
                break;
            case "space-around":
                this.#spaceAround(justify);
                break;
            case "space-between":
                this.#spaceBetween(justify);
                break;
            case "center":
                this.#center(justify);
                break;
            case "start":
                this.#start(justify);
                break;
            case "end":
                this.#end(justify);
                break;
        }
        return justifyContent;
    }
    // in flexbox works with wrap option
    alignContent(opt) {
        const alignContent = this.__cacheOption(this.options.alignContent, "normal", opt);
        if (this.options.wrap != "wrap" && this.options.wrap != "wrap-reverse")
            return alignContent;
        const align = "alignContent";
        switch (alignContent) {
            case "space-evenly":
                this.#spaceEvenly(align);
                break;
            case "space-around":
                this.#spaceAround(align);
                break;
            case "space-between":
                this.#spaceBetween(align);
                break;
            case "center":
                this.#center(align);
                break;
            case "start":
                this.#start(align);
                break;
            case "end":
                this.#end(align);
                break;
        }
        return alignContent;
    }
    alignItems(opt) {
        const alignItems = this.__cacheOption(this.options.alignItems, "normal", opt);
        const align = "alignItems";
        switch (alignItems) {
            case "center":
                this.#center(align);
                break;
            case "start":
                this.#start(align);
                break;
            case "end":
                this.#end(align);
                break;
        }
        return alignItems;
    }
    get #isFlexCol() {
        if (this.options.flexDirection === "column" ||
            this.options.flexDirection === "column-reverse")
            return true;
        return false;
    }
    get #isWrap() {
        return this.options.wrap === "nowrap" ? false : true;
    }
    get #isOutofLayout() {
        if (this.options.height - this.#containerH > 0 &&
            this.options.width - this.#containerW > 0)
            return true;
        return false;
    }
    #checkLayoutType(_type, _justify_cont_func, _align_cont_func, _justify_func, _align_func) {
        switch (_type) {
            case "justifyContent":
                _justify_cont_func && _justify_cont_func();
                break;
            case "alignContent":
                _align_cont_func && _align_cont_func();
                break;
            case "justifyItems":
                _justify_func && _justify_func();
                break;
            case "alignItems":
                _align_func && _align_func();
                break;
        }
    }
    #start(_type) {
        const _func1 = () => {
            if (this.#isFlexCol) {
                this.#startY = 0;
                this.#flexColumn();
            }
            else {
                this.#startX = 0;
                this.#flexRow();
            }
        };
        const _func2 = () => {
            if (this.#isFlexCol) {
                this.#startX = 0;
                this.#flexColumn();
            }
            else {
                if (this.#isWrap) {
                    this.#startY = 0;
                    this.#flexRow();
                }
            }
        };
        const _func3 = () => { };
        const _func4 = () => {
            if (this.#isFlexCol) {
                this.#startX = 0;
                this.#flexColumn();
            }
            else {
                this.#startY = 0;
                this.#flexRow();
            }
        };
        this.#checkLayoutType(_type, _func1, _func2, _func3, _func4);
    }
    #end(_type) {
        const _func1 = () => {
            if (this.#isOutofLayout) {
                if (this.#isFlexCol) {
                    if (this.#isWrap) {
                        this.#cols.height.forEach((item) => {
                            let startY = this.options.height - item;
                            startY = startY >= 0 ? startY : 0;
                            this.#startYPos.push(startY);
                        });
                    }
                    else {
                        const startY = this.options.height - this.#containerH;
                        this.#startY = startY > 0 ? startY : 0;
                    }
                    this.#flexColumn();
                }
                else {
                    if (this.#isWrap) {
                        this.#rows.width.forEach((item) => {
                            let startX = this.options.width - item;
                            startX = startX >= 0 ? startX : 0;
                            this.#startXPos.push(startX);
                        });
                    }
                    else {
                        const startX = this.options.width - this.#containerW;
                        this.#startX = startX > 0 ? startX : 0;
                    }
                    this.#flexRow();
                }
            }
        };
        const _func2 = () => {
            if (this.#isOutofLayout && this.#isWrap) {
                if (this.#isFlexCol) {
                    const startX = this.options.width - this.#containerW;
                    this.#startX = startX > 0 ? startX : 0;
                    this.#flexColumn();
                }
                else {
                    const startY = this.options.height - this.#containerH;
                    this.#startY = startY > 0 ? startY : 0;
                    this.#flexRow();
                }
            }
        };
        const _func3 = () => { };
        const _func4 = () => {
            if (this.#isFlexCol) {
                let rows = 0;
                let idx = 0;
                let size = 0;
                this.#cols.width.forEach((item, index) => {
                    for (let i = 0; i < this.#cols.rows[idx]; i++) {
                        const block = this._childs[i + rows];
                        let containerW = this.options.width - this.#containerW;
                        containerW = containerW > 0 ? containerW : 0;
                        size =
                            containerW + Math.abs(item - block.options.width);
                        this.#startXPos.push(size);
                    }
                    rows += this.#cols.rows[idx];
                    idx++;
                });
                this.#flexColumn();
            }
            else {
                let cols = 0;
                let idx = 0;
                let size = 0;
                this.#rows.height.forEach((item, index) => {
                    for (let i = 0; i < this.#rows.cols[idx]; i++) {
                        const block = this._childs[i + cols];
                        let containerH = this.options.height - this.#containerH;
                        containerH = containerH > 0 ? containerH : 0;
                        size =
                            containerH + Math.abs(item - block.options.height);
                        this.#startYPos.push(size);
                    }
                    cols += this.#rows.cols[idx];
                    idx++;
                });
                this.#flexRow();
            }
        };
        this.#checkLayoutType(_type, _func1, _func2, _func3, _func4);
    }
    #center(_type) {
        const _func1 = () => {
            if (this.#isOutofLayout) {
                if (this.#isFlexCol) {
                    if (this.#isWrap) {
                        this.#cols.height.forEach((item) => {
                            let startY = this.options.height - item;
                            startY = startY > 0 ? startY : 0;
                            this.#startYPos.push(startY / 2);
                        });
                    }
                    else {
                        const startY = this.options.height - this.#containerH;
                        this.#startY = startY > 0 ? startY / 2 : 0;
                    }
                    this.#flexColumn();
                }
                else {
                    if (this.#isWrap) {
                        this.#rows.width.forEach((item) => {
                            let startX = this.options.width - item;
                            startX = startX > 0 ? startX : 0;
                            this.#startXPos.push(startX / 2);
                        });
                    }
                    else {
                        const startX = this.options.width - this.#containerW;
                        this.#startX = startX > 0 ? startX / 2 : 0;
                    }
                    this.#flexRow();
                }
            }
        };
        const _func2 = () => {
            if (this.#isOutofLayout && this.#isWrap) {
                if (this.#isFlexCol) {
                    const startX = this.options.width - this.#containerW;
                    this.#startX = startX > 0 ? startX / this.#cols.nItems : 0;
                    this.#flexColumn();
                }
                else {
                    const startY = this.options.height - this.#containerH;
                    this.#startY = startY > 0 ? startY / this.#rows.nItems : 0;
                    this.#flexRow();
                }
            }
        };
        const _func3 = () => { };
        const _func4 = () => {
            if (this.#isFlexCol) {
                let rows = 0;
                let idx = 0;
                let size = 0;
                let containerW = this.options.width - this.#containerW;
                containerW = containerW > 0 ? containerW : 0;
                this.#cols.width.forEach((item) => {
                    for (let i = 0; i < this.#cols.rows[idx]; i++) {
                        const block = this._childs[i + rows];
                        size =
                            containerW / 2 + (item - block.options.width) / 2;
                        this.#startXPos.push(size);
                    }
                    rows += this.#cols.rows[idx];
                    idx++;
                });
                this.#flexColumn();
            }
            else {
                let cols = 0;
                let idx = 0;
                let size = 0;
                let containerH = this.options.height - this.#containerH;
                containerH = containerH > 0 ? containerH : 0;
                this.#rows.height.forEach((item) => {
                    for (let i = 0; i < this.#rows.cols[idx]; i++) {
                        const block = this._childs[i + cols];
                        size =
                            containerH / 2 + (item - block.options.height) / 2;
                        this.#startYPos.push(size);
                    }
                    cols += this.#rows.cols[idx];
                    idx++;
                });
                this.#flexRow();
            }
        };
        this.#checkLayoutType(_type, _func1, _func2, _func3, _func4);
    }
    #spaceBetween(_type) {
        const _func1 = () => {
            if (this.#isOutofLayout) {
                if (this.#isFlexCol) {
                    if (this.#isWrap) {
                        this.#cols.height.forEach((item, index) => {
                            let gap = this.options.height - item;
                            gap =
                                gap > 0
                                    ? gap / (this.#cols.rows[index] - 1)
                                    : 0;
                            if (this.options.gapRow > gap)
                                gap = this.options.gapRow;
                            this.#rowsGap.push(gap);
                        });
                    }
                    else {
                        let gap = this.options.height - this.#containerH;
                        gap = gap > 0 ? (gap /= this._childs.length - 1) : 0;
                        this.options.gapRow += gap;
                    }
                    this.#flexColumn();
                }
                else {
                    if (this.#isWrap) {
                        this.#rows.width.forEach((item, index) => {
                            let gap = this.options.width - item;
                            gap =
                                gap > 0
                                    ? gap / (this.#rows.cols[index] - 1)
                                    : 0;
                            if (this.options.gapColumn > gap)
                                gap = this.options.gapColumn;
                            this.#columnsGap.push(gap);
                        });
                    }
                    else {
                        let gap = this.options.width - this.#containerW;
                        gap = gap > 0 ? (gap /= this._childs.length - 1) : 0;
                        this.options.gapColumn += gap;
                    }
                    this.#flexRow();
                }
            }
        };
        const _func2 = () => {
            if (this.#isOutofLayout && this.#isWrap) {
                if (this.#isFlexCol) {
                    let gap = this.options.width - this.#containerW;
                    this.options.gapColumn =
                        gap > 0 ? gap / (this.#cols.nItems - 1) : 0;
                    this.#flexColumn();
                }
                else {
                    let gap = this.options.height - this.#containerH;
                    this.options.gapRow =
                        gap > 0 ? gap / (this.#rows.nItems - 1) : 0;
                    this.#flexRow();
                }
            }
        };
        this.#checkLayoutType(_type, _func1, _func2);
    }
    #spaceAround(_type) {
        const _func1 = () => {
            if (this.#isOutofLayout) {
                if (this.#isFlexCol) {
                    if (this.#isWrap) {
                        this.#cols.height.forEach((item, index) => {
                            const cols = this.#cols.rows[index];
                            let gap = this.options.height - item;
                            gap = gap > 0 ? gap / cols : 0;
                            if (this.options.gapRow > gap)
                                gap = this.options.gapRow;
                            this.#rowsGap.push(gap);
                            this.#startYPos.push(gap / 2);
                        });
                    }
                    else {
                        let gap = this.options.height - this.#containerH;
                        gap = gap > 0 ? gap / this._childs.length : 0;
                        this.options.gapRow = gap;
                        this.#startY = gap / 2;
                    }
                    this.#flexColumn();
                }
                else {
                    if (this.#isWrap) {
                        this.#rows.width.forEach((item, index) => {
                            const cols = this.#rows.cols[index];
                            let gap = this.options.width - item;
                            gap = gap > 0 ? gap / cols : 0;
                            if (this.options.gapColumn > gap)
                                gap = this.options.gapColumn;
                            this.#columnsGap.push(gap);
                            this.#startXPos.push(gap / 2);
                        });
                    }
                    else {
                        let gap = this.options.width - this.#containerW;
                        gap = gap > 0 ? gap / this._childs.length : 0;
                        this.options.gapColumn = gap;
                        this.#startX = gap / 2;
                    }
                    this.#flexRow();
                }
            }
        };
        const _func2 = () => {
            if (this.#isWrap) {
                if (this.#isFlexCol) {
                    let gap = this.options.width - this.#containerW;
                    gap = gap > 0 ? gap / this.#cols.nItems : 0;
                    this.options.gapColumn = gap;
                    this.#startX = gap / 2;
                    this.#flexColumn();
                }
                else {
                    let gap = this.options.height - this.#containerH;
                    gap = gap > 0 ? gap / this.#rows.nItems : 0;
                    this.options.gapRow = gap;
                    this.#startY = gap / 2;
                    this.#flexRow();
                }
            }
        };
        this.#checkLayoutType(_type, _func1, _func2);
    }
    #spaceEvenly(_type) {
        const _func1 = () => {
            if (this.#isOutofLayout) {
                if (this.#isFlexCol) {
                    if (this.#isWrap) {
                        this.#cols.height.forEach((item, index) => {
                            const rows = this.#cols.rows[index];
                            let gap = this.options.height - item;
                            gap = gap > 0 ? gap / (rows + 1) : 0;
                            if (this.options.gapRow > gap)
                                gap = this.options.gapRow;
                            this.#rowsGap.push(gap);
                            this.#startYPos.push(gap);
                        });
                    }
                    else {
                        let gap = this.options.height - this.#containerH;
                        gap = gap > 0 ? gap / this._childs.length + 1 : 0;
                        this.options.gapRow += gap;
                        this.#startY = gap;
                    }
                    this.#flexColumn();
                }
                else {
                    if (this.#isWrap) {
                        this.#rows.width.forEach((item, index) => {
                            const cols = this.#rows.cols[index];
                            let gap = this.options.width - item;
                            gap = gap > 0 ? gap / (cols + 1) : 0;
                            if (this.options.gapColumn > gap)
                                gap = this.options.gapColumn;
                            this.#columnsGap.push(gap);
                            this.#startXPos.push(gap);
                        });
                    }
                    else {
                        let gap = this.options.width - this.#containerW;
                        gap = gap > 0 ? gap / this._childs.length + 1 : 0;
                        this.options.gapColumn += gap;
                        this.#startX = gap;
                    }
                    this.#flexRow();
                }
            }
        };
        const _func2 = () => {
            if (this.#isWrap) {
                if (this.#isFlexCol) {
                    let gap = this.options.width - this.#containerW;
                    gap = gap > 0 ? gap / (this.#cols.nItems + 1) : 0;
                    this.options.gapColumn = gap;
                    this.#startX = gap;
                    this.#flexColumn();
                }
                else {
                    let gap = this.options.height - this.#containerH;
                    gap = gap > 0 ? gap / (this.#rows.nItems + 1) : 0;
                    this.options.gapRow = gap;
                    this.#startY = gap;
                    this.#flexRow();
                }
            }
        };
        this.#checkLayoutType(_type, _func1, _func2);
    }
    #flexRow() {
        const blocks = this._childs;
        let idx = 0;
        let col = 0;
        let rowIdx = 0;
        let blocksW = 0;
        let blocksH = 0;
        let wrapWidth = 0;
        let sharedColumnGap = 0;
        let posY = 0;
        let sumWidths = 0;
        let startX = this.#startXPos[rowIdx] !== undefined
            ? this.#startXPos[rowIdx]
            : this.#startX;
        let startY = this.#startY;
        let gapCol = this.#columnsGap[rowIdx] !== undefined
            ? this.#columnsGap[rowIdx]
            : this.options.gapColumn;
        let gapRow = this.#rowsGap[rowIdx] !== undefined
            ? this.#rowsGap[rowIdx]
            : this.options.gapRow;
        if (!this.#isWrap) {
            sumWidths = blocks.reduce((prev, curr) => prev + curr.options.width, 0);
            if (sumWidths > this.options.width)
                sharedColumnGap =
                    Math.abs(this.options.width - sumWidths) / blocks.length;
        }
        while (blocks.length > idx) {
            const block = blocks[idx];
            if (this.#isWrap)
                wrapWidth += block.options.width;
            if (this.#startYPos[idx] !== undefined)
                startY = posY + this.#startYPos[idx];
            if (idx === blocks.length - 1) {
                if (!(wrapWidth > this.options.width)) {
                    blocksW += block.options.width;
                    blocksH =
                        blocksH <= block.options.height
                            ? block.options.height
                            : blocksH;
                    col += 1;
                }
                if (this.#isNew) {
                    this.#rows.width.push(blocksW);
                    this.#rows.height.push(blocksH);
                    this.#rows.cols.push(col);
                    this.#rows.nItems += 1;
                }
            }
            if (this.#isWrap) {
                if (wrapWidth > this.options.width) {
                    rowIdx += 1;
                    startY += blocksH + gapRow;
                    posY += blocksH + gapRow;
                    startX =
                        this.#startXPos[rowIdx] !== undefined
                            ? this.#startXPos[rowIdx]
                            : this.#startX;
                    gapCol =
                        this.#columnsGap[rowIdx] !== undefined
                            ? this.#columnsGap[rowIdx]
                            : this.options.gapColumn;
                    wrapWidth = block.options.width;
                    if (idx === blocks.length - 1) {
                        blocksW = block.options.width;
                        blocksH = block.options.height;
                        col = 1;
                    }
                    if (this.#isNew) {
                        this.#rows.width.push(blocksW);
                        this.#rows.height.push(blocksH);
                        this.#rows.cols.push(col);
                        this.#rows.nItems += 1;
                    }
                    blocksW = 0;
                    blocksH = 0;
                    col = 0;
                }
            }
            let endX = block.options.width;
            if (sharedColumnGap) {
                if (idx !== blocks.length - 1)
                    endX -= sharedColumnGap + gapCol;
                else
                    endX -= sharedColumnGap;
                if (endX < 0) {
                    startX += endX;
                    endX = 0;
                }
            }
            block.initCords.x = startX;
            block.options.x = startX;
            block.options.width = endX;
            block.initCords.y = startY;
            block.options.y = startY;
            block.options.height = block.options.height;
            block.__adjustCordinates();
            blocksW += block.options.width;
            blocksH =
                blocksH < block.options.height ? block.options.height : blocksH;
            if (this.#isNew && idx === blocks.length - 1) {
                if (this.#isWrap) {
                    this.#containerH = this.#rows.height.reduce((prev, curr) => prev + curr, 0);
                    this.#containerW = Math.max(...this.#rows.width);
                }
                else {
                    this.#containerH = Math.max(...this.#rows.height);
                    this.#containerW = sumWidths;
                }
                this.#isNew = false;
            }
            startX += gapCol + endX;
            idx += 1;
            col += 1;
            wrapWidth += gapCol;
        }
    }
    #flexRowReverse() {
        if (this.#isWrap) {
            let idx = 0;
            let width = 0;
            let dublicate = [];
            let childs = [];
            const blocks = this._childs;
            while (blocks.length > idx) {
                const block = blocks[idx];
                width += block.options.width;
                if (width > this.options.width) {
                    dublicate.reverse();
                    childs.push(...dublicate);
                    dublicate = [];
                    width = 0;
                }
                width += this.options.gapColumn;
                dublicate.push(block);
                idx += 1;
            }
            dublicate.reverse();
            this._childs = [...childs, ...dublicate];
        }
        else {
            this._childs.reverse();
        }
        this.#flexRow();
    }
    #flexColumn() {
        const blocks = this._childs;
        let idx = 0;
        let row = 0;
        let rowIdx = 0;
        let colIdx = 0;
        let blocksW = 0;
        let blocksH = 0;
        let wrapHeight = 0;
        let posX = 0;
        let sumHeights = 0;
        let sharedRowGap = 0;
        let startX = this.#startX;
        let startY = this.#startYPos[rowIdx] !== undefined
            ? this.#startYPos[rowIdx]
            : this.#startY;
        let gapCol = this.#columnsGap[colIdx] !== undefined
            ? this.#columnsGap[colIdx]
            : this.options.gapColumn;
        let gapRow = this.#rowsGap[colIdx] !== undefined
            ? this.#rowsGap[colIdx]
            : this.options.gapRow;
        if (!this.#isWrap) {
            sumHeights = blocks.reduce((prev, curr) => prev + curr.options.height, 0);
            if (sumHeights > this.options.height)
                sharedRowGap =
                    Math.abs(this.options.height - sumHeights) / blocks.length;
        }
        while (blocks.length > idx) {
            const block = blocks[idx];
            if (this.#isWrap)
                wrapHeight += block.options.height;
            if (this.#startXPos[idx] !== undefined)
                startX = posX + this.#startXPos[idx];
            if (idx === blocks.length - 1) {
                if (!(wrapHeight > this.options.height)) {
                    blocksH += block.options.height;
                    blocksW =
                        blocksW <= block.options.width
                            ? block.options.width
                            : blocksW;
                    row += 1;
                }
                if (this.#isNew) {
                    this.#cols.width.push(blocksW);
                    this.#cols.height.push(blocksH);
                    this.#cols.rows.push(row);
                    this.#cols.nItems += 1;
                }
            }
            if (this.#isWrap) {
                if (wrapHeight > this.options.height) {
                    colIdx += 1;
                    startX += blocksW + gapCol;
                    posX += blocksW + gapCol;
                    startY =
                        this.#startYPos[colIdx] !== undefined
                            ? this.#startYPos[colIdx]
                            : this.#startY;
                    gapRow =
                        this.#rowsGap[colIdx] !== undefined
                            ? this.#rowsGap[colIdx]
                            : this.options.gapRow;
                    wrapHeight = block.options.height;
                    if (idx === blocks.length - 1) {
                        blocksW = block.options.width;
                        blocksH = block.options.height;
                        row = 1;
                    }
                    if (this.#isNew) {
                        this.#cols.width.push(blocksW);
                        this.#cols.height.push(blocksH);
                        this.#cols.rows.push(row);
                        this.#cols.nItems += 1;
                    }
                    blocksW = 0;
                    blocksH = 0;
                    row = 0;
                }
            }
            let endY = block.options.height;
            if (sharedRowGap) {
                if (idx !== blocks.length - 1)
                    endY -= sharedRowGap + gapRow;
                else
                    endY -= sharedRowGap;
                if (endY < 0) {
                    startY += endY;
                    endY = 0;
                }
            }
            block.initCords.y = startY;
            block.options.y = startY;
            block.options.height = endY;
            block.initCords.x = startX;
            block.options.x = startX;
            block.options.width = block.options.width;
            block.__adjustCordinates();
            blocksW =
                blocksW <= block.options.width ? block.options.width : blocksW;
            blocksH += block.options.height;
            if (this.#isNew && idx === blocks.length - 1) {
                if (this.#isWrap) {
                    this.#containerH = Math.max(...this.#cols.height);
                    this.#containerW = this.#cols.width.reduce((prev, curr) => prev + curr, 0);
                }
                else {
                    this.#containerH = sumHeights;
                    this.#containerW = Math.max(...this.#cols.width);
                }
                this.#isNew = false;
            }
            startY += gapRow + endY;
            idx += 1;
            row += 1;
            rowIdx += 1;
            wrapHeight += gapRow;
        }
    }
    #flexColumnReverse() {
        if (this.#isWrap) {
            let idx = 0;
            let height = 0;
            let dublicate = [];
            let childs = [];
            const blocks = this._childs;
            while (blocks.length > idx) {
                const block = blocks[idx];
                height += block.options.height + this.options.gapRow;
                if (height > this.options.height) {
                    dublicate.reverse();
                    childs.push(...dublicate);
                    dublicate = [];
                    height = 0;
                }
                dublicate.push(block);
                idx += 1;
            }
            dublicate.reverse();
            this._childs = [...childs, ...dublicate];
        }
        else {
            this._childs.reverse();
        }
        this.#flexColumn();
    }
    #gridLayout() { }
}

// each shape extends form common shape
class Shape extends Block {
    constructor(options) {
        super(options);
    }
    __initSet() {
        super.__initSet();
        this.__drawInit();
    }
    __drawInit() {
        this.fillStyle();
        this.draw();
        this.fill();
        this.stroke();
    }
    draw(_func) {
        if (_func)
            _func(this);
    }
    beginPath(opt = true) {
        if (opt)
            return this.context.beginPath();
    }
    fill(opt, path) {
        this.options.fill = opt || this.options.fill || false;
        if (this.options.fill) {
            this.context.fill(path);
        }
        return this.options.fill;
    }
    fillStyle(opt) {
        this.options.fillStyle = opt || this.options.fillStyle || "black";
        this.context.fillStyle = this.options.fillStyle;
        return this.options.fillStyle;
    }
    stroke(opt, path) {
        this.options.stroke = opt || this.options.stroke || false;
        if (this.options.stroke) {
            if (path)
                this.context.stroke(path);
            else
                this.context.stroke();
        }
        return this.options.stroke;
    }
    strokeStyle(opt) {
        this.options.strokeStyle = opt || this.options.strokeStyle || "black";
        this.context.strokeStyle = this.options.strokeStyle;
        return this.options.strokeStyle;
    }
    lineCap(opt) {
        this.options.lineCap = opt || this.options.lineCap || "butt";
        this.context.lineCap = this.options.lineCap;
        return this.options.lineCap;
    }
    lineWidth(opt) {
        this.options.lineWidth = opt || this.options.lineWidth || 0;
        this.context.lineWidth = this.options.lineWidth;
        return this.options.lineWidth;
    }
    lineDash(opt) {
        this.options.lineDash = opt || this.options.lineDash || [];
        this.context.setLineDash(opt);
    }
    closePath(opt) {
        if (opt)
            this.context.closePath();
    }
    line({ x, y }) {
        this.context.lineTo(x, y);
    }
    quadraticCurve({ cpx1, cpy1, endX, endY }) {
        this.context.quadraticCurveTo(cpx1, cpy1, endX, endY);
    }
    bezierCurve({ cpx1, cpy1, cpx2, cpy2, endX, endY }) {
        this.context.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, endX, endY);
    }
    rect({ x, y, width, height }) {
        this.context.rect(x, y, width, height);
    }
    roundRect({ x, y, width, height, borderRadius }) {
        this.context.roundRect(x, y, width, height, borderRadius);
    }
    strokeRect({ x, y, width, height }) {
        this.context.strokeRect(x, y, width, height);
    }
    // can be 2 different format, one opt with optinos giving paramters, two like this
    move({ x, y }) {
        x = x || this.initCords.x;
        y = y || this.initCords.y;
        this.context.moveTo(x, y);
    }
    pointInPath({ path, x, y, fillRule }) {
        x = x || this.options.x || 0;
        y = y || this.options.y || 0;
        fillRule = fillRule || "nonzero";
        if (path)
            this.context.isPointInPath(path, x, y, fillRule);
        else
            this.context.isPointInPath(x, y, fillRule);
    }
    pointInStroke({ path, x, y }) {
        x = x || this.options.x || 0;
        y = y || this.options.y || 0;
        if (path)
            return this.context.isPointInStroke(path, x, y);
        else
            return this.context.isPointInStroke(x, y);
    }
    clip(opt) {
        return super.clip(opt);
    }
    dragX(opt) {
        return super.dragX(opt);
    }
    dragY(opt) {
        return super.dragY(opt);
    }
    draggable(opt) {
        return super.draggable(opt);
    }
    selectable(opt) {
        return super.selectable(opt);
    }
    set(options) {
        super.set(options);
    }
}
// new Shape({ width: 100, height: 100, setLineDash: [10, 10] }).draw((context) =>
//     context.setLineDash([10, 10])
// );

class TextBlock extends Block {
    text;
    constructor(text, options) {
        super(options);
        this.text = text;
        this.options.text = text;
    }
    __initSet() {
        super.__initSet();
        this.setFont();
        this.color();
        this.options.height = this.height();
        const fontY = this.options.height + this.initCords.y;
        this.context.fillText(this.text, this.initCords.x, fontY, this.options.maxWidth);
    }
    width(opt) {
        const text_measure = this.measureText();
        this.options.width = opt || text_measure.width;
        return this.options.width;
    }
    height(opt) {
        const text_measure = this.measureText();
        this.options.height = opt || text_measure.hangingBaseline;
        return this.options.height;
    }
    #format_font() {
        const fontFamily = this.fontFamily();
        const fontSize = this.fontSize();
        const fontStyle = this.fontStyle();
        const fontWeight = this.fontWeight();
        const fontVariant = this.fontVariant();
        return `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize} ${fontFamily}`;
    }
    // opt: it has to bee in this format: "fontStyle fontVariant fontWeight fontSize fontFamily"
    setFont(opt) {
        this.context.font = opt || this.#format_font();
    }
    fontFamily(opt) {
        this.options.fontFamily =
            opt || this.options.fontFamily || "sans-serif";
        return this.options.fontFamily;
    }
    fontSize(opt) {
        this.options.fontSize = opt || this.options.fontSize || "10px";
        return this.options.fontSize;
    }
    fontWeight(opt) {
        this.options.fontWeight = opt || this.options.fontWeight || 100;
        return this.options.fontWeight;
    }
    fontVariant(opt) {
        this.options.fontVariant = opt || this.options.fontVariant || "normal";
        return this.options.fontVariant;
    }
    fontStyle(opt) {
        this.options.fontStyle = opt || this.options.fontVariant || "normal";
        return this.options.fontStyle;
    }
    fontStretch(opt) {
        this.options.fontStretch = opt || this.options.fontStretch || "normal";
        this.context.fontStretch = this.options.fontStretch;
        return this.options.fontStretch;
    }
    fontKerning(opt) {
        this.options.fontKerning = opt || this.options.fontKerning || "auto";
        this.context.fontKerning = this.options.fontKerning;
        return this.options.fontKerning;
    }
    fontVariantCaps(opt) {
        this.options.fontVariantCaps =
            opt || this.options.fontVariantCaps || "normal";
        this.context.fontVariantCaps = this.options.fontVariantCaps;
        return this.options.fontVariantCaps;
    }
    wordSpacing(opt) {
        this.options.wordSpacing =
            `${opt}px` || this.options.wordSpacing || "0px";
        this.context.wordSpacing = this.options.wordSpacing;
        return this.options.wordSpacing;
    }
    color(opt) {
        this.options.color = opt || this.options.color || "black";
        this.context.fillStyle = this.options.color;
        return this.options.color;
    }
    strokeWidth(opt) {
        this.options.strokeWidth = opt || this.options.strokeWidth || 0;
        this.context.lineWidth = this.options.strokeWidth;
        return this.options.strokeWidth;
    }
    strokeColor(opt) {
        this.options.strokeColor = opt || this.options.strokeColor || "black";
        this.context.strokeStyle = this.options.strokeColor;
        return this.options.strokeColor;
    }
    stroke(opt) {
        this.options.stroke = opt || this.options.stroke || false;
        if (opt) {
            this.setFont();
            this.strokeColor();
            this.strokeWidth();
            this.options.height = this.height();
            const fontY = this.options.height + this.initCords.y;
            this.context.strokeText(this.text, this.initCords.x, fontY, this.options?.maxWidth);
        }
        return this.options.stroke;
    }
    direction(opt) {
        this.context.direction = opt || this.options.direction || "ltr";
        this.options.direction = this.context.direction;
        return this.options.direction;
    }
    letterSpacing(opt) {
        this.context.letterSpacing = opt || this.options.letterSpacing || "0px";
        this.options.letterSpacing = this.context.letterSpacing;
        return this.options.letterSpacing;
    }
    textRendering(opt) {
        this.context.textRendering =
            opt || this.options.textRendering || "auto";
        this.options.textRendering = this.context.textRendering;
        return this.options.textRendering;
    }
    textAlign(opt) {
        this.context.textAlign = opt || this.options.textAlign || "start";
        this.options.align = this.context.align;
        return this.options.align;
    }
    textBaseline(opt) {
        this.context.textBaseline =
            opt || this.options.textBaseline || "alphabetic";
        this.options.baseline = this.context.baseline;
        return this.options.baseline;
    }
    find(queries) {
        return this.filterNodes(queries);
    }
    // @return: text width in pixels
    measureText() {
        return this.context.measureText(this.text);
    }
    clip(opt) {
        return super.clip(opt);
    }
    dragX(opt) {
        return super.dragX(opt);
    }
    dragY(opt) {
        return super.dragY(opt);
    }
    draggable(opt) {
        return super.draggable(opt);
    }
    selectable(opt) {
        return super.selectable(opt);
    }
    set(options) {
        super.set(options);
    }
}

// borderstyle can be extended
const defaultOpt$3 = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    selectable: true,
    draggable: true,
    zIndex: 0,
    dragX: true,
    dragY: true,
    // border-radius: [top-left, top-right, bottom-right, bottom-left]
    borderRadius: [0],
};
class Rectangle extends Shape {
    constructor(options) {
        super(options);
        this.options = { ...defaultOpt$3, ...options };
    }
    __initSet() {
        super.__initSet();
    }
    __drawInit() {
        this.beginPath();
        this.backgroundColor();
        this.#drawRect();
        this.fill();
        this.stroke();
    }
    #drawRect() {
        this.roundRect({
            x: this.initCords.x,
            y: this.initCords.y,
            width: this.options.width,
            height: this.options.height,
            borderRadius: this.options.borderRadius,
        });
    }
    backgroundColor(opt) {
        this.options.backgroundColor = super.fillStyle(opt);
        return this.options.backgroundColor;
    }
    border(opt) {
        this.options.border = opt || this.options.border || [];
        const { borderStyleArrWidth } = this.#borderParser(this.options.border);
        if (this.options.borderStyle === "dotted") {
            this.lineDash(borderStyleArrWidth);
        }
        super.stroke(true);
        return this.options.border;
    }
    borderWidth(opt) {
        this.options.borderWidth = super.lineWidth(opt);
        return this.options.borderWidth;
    }
    borderColor(opt) {
        this.options.borderColor = super.strokeStyle(opt);
        return this.options.borderColor;
    }
    borderStyle(opt) {
        this.options.borderStyle = opt || this.options.borderStyle || "solid";
        return this.options.borderStyle;
    }
    borderTop(opt) {
        this.options.borderTop = opt || this.options.borderTop;
        let { borderStyleArrWidth } = this.#borderParser(this.options.borderTop);
        borderStyleArrWidth.pop();
        if (this.options.borderStyle === "dotted") {
            this.lineDash([
                ...borderStyleArrWidth,
                this.options.height * 2 + this.options.width,
            ]);
        }
        else {
            this.lineDash([
                this.options.width,
                this.options.width + 2 * this.options.height,
                0,
                0,
            ]);
        }
        this.#drawRect();
        super.stroke(true);
        return this.options.borderTop;
    }
    borderRight(opt) {
        this.options.borderRight = opt || this.options.borderRight;
        const { borderStyleArrHeight } = this.#borderParser(this.options.borderRight);
        borderStyleArrHeight.pop();
        if (this.options.borderStyle === "dotted") {
            this.lineDash([
                0,
                this.options.width,
                ...borderStyleArrHeight,
                this.options.width + this.options.height,
            ]);
        }
        else if (this.options.borderStyle === "solid") {
            this.lineDash([
                0,
                this.options.width,
                this.options.height,
                this.options.width,
            ]);
        }
        this.#drawRect();
        super.stroke(true);
        return this.options.borderRight;
    }
    borderBottom(opt) {
        this.options.borderBottom = opt || this.options.borderBottom;
        let { borderStyleArrWidth } = this.#borderParser(this.options.borderBottom);
        if (this.options.borderStyle === "dotted") {
            this.lineDash([
                0,
                this.options.width + this.options.height,
                ...borderStyleArrWidth,
            ]);
        }
        else if (this.options.borderStyle === "solid") {
            this.lineDash([
                0,
                this.options.width + this.options.height,
                this.options.width,
                0,
            ]);
        }
        this.#drawRect();
        super.stroke(true);
        return this.options.borderBottom;
    }
    borderLeft(opt) {
        this.options.borderLeft = opt || this.options.borderLeft;
        let { borderStyleArrHeight } = this.#borderParser(this.options.borderLeft);
        if (this.options.borderStyle === "dotted") {
            this.lineDash([
                0,
                this.options.width * 2 + this.options.height,
                ...borderStyleArrHeight,
            ]);
        }
        else if (this.options.borderStyle === "solid") {
            this.lineDash([
                0,
                this.options.width * 2 + this.options.height,
                this.options.height,
                this.options.width,
            ]);
        }
        this.#drawRect();
        super.stroke(true);
        return this.options.borderLeft;
    }
    // border size, style(required), color
    #borderParser(obj) {
        const border = obj?.split(" ") || [];
        // need to impliment css unit converter for different size, ex, px, em, rem etc.
        const borderWitdh = Number(border[0]);
        const borderStyle = border[1];
        const borderColor = border[2];
        const borderStyleArrWidth = [];
        const borderStyleArrHeight = [];
        if (borderStyle === "dotted") {
            let total = 0;
            const step = this.options.width / 21;
            while (total < this.options.width) {
                borderStyleArrWidth.push(step, step);
                total += step * 2;
            }
            total = 0;
            const stepHeight = this.options.height / 21;
            while (total < this.options.height) {
                borderStyleArrHeight.push(stepHeight, stepHeight);
                total += stepHeight * 2;
            }
        }
        this.borderWidth(borderWitdh);
        this.borderStyle(borderStyle);
        this.borderColor(borderColor);
        return { borderStyleArrWidth, borderStyleArrHeight };
    }
    clip(opt) {
        return super.clip(opt);
    }
    dragX(opt) {
        return super.dragX(opt);
    }
    dragY(opt) {
        return super.dragY(opt);
    }
    draggable(opt) {
        return super.draggable(opt);
    }
    selectable(opt) {
        return super.selectable(opt);
    }
    set(options) {
        super.set(options);
    }
}

const defaultOpt$2 = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    selectable: true,
    draggable: true,
    zIndex: 0,
    dragX: true,
    dragY: true,
    // border-radius: [top-left, top-right, bottom-right, bottom-left]
    radiusX: 10,
    radiusY: 10,
    rotation: 0,
};
class Elipse extends Shape {
    constructor(options) {
        super(options);
        this.options = { ...defaultOpt$2, ...options };
        Elipse.prototype.draggable = Shape.prototype.draggable;
    }
    __initSet() {
        super.__initSet();
    }
    __drawInit() {
        this.beginPath();
        this.backgroundColor();
        // cordinates need to calculate related to radius x and radius y
        this.context.ellipse(this.initCords.x, this.initCords.y, this.options.radiusX, this.options.radiusY, this.options.rotation, 0, 2 * Math.PI);
        this.fill();
        this.stroke();
    }
    backgroundColor(opt) {
        this.options.backgroundColor = super.fillStyle(opt);
        return this.options.backgroundColor;
    }
}

const defaultOpt$1 = {
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    selectable: true,
    draggable: true,
    zIndex: 0,
    dragX: true,
    dragY: true,
    radius: 10,
    startAngle: 0,
    endAngle: Math.PI * 2,
};
class Circle extends Shape {
    constructor(options) {
        super(options);
        this.options = { ...defaultOpt$1, ...options };
    }
    __initSet() {
        super.__initSet();
    }
    __drawInit() {
        this.beginPath();
        this.backgroundColor();
        const x = this.initCords.x + this.options.radius;
        const y = this.initCords.y + this.options.radius;
        this.context.arc(x, y, this.options.radius, this.options.startAngle, this.options.endAngle);
        super.fill();
        super.stroke();
    }
    width(opt) {
        this.options.radius = this.options.radius || super.width(opt);
        return this.options.radius;
    }
    height(opt) {
        this.options.radius = this.options.radius || super.height(opt);
        return this.options.radius;
    }
    backgroundColor(opt) {
        this.options.backgroundColor = super.fillStyle(opt);
        return this.options.backgroundColor;
    }
    borderWidth(opt) {
        this.options.borderWidth = super.lineWidth(opt);
        return this.options.borderWidth;
    }
    borderColor(opt) {
        this.options.borderColor = super.strokeStyle(opt);
        return this.options.borderColor;
    }
    dragX(opt) {
        return super.dragX(opt);
    }
    dragY(opt) {
        return super.dragY(opt);
    }
    draggable(opt) {
        return super.draggable(opt);
    }
    selectable(opt) {
        return super.selectable(opt);
    }
    set(options) {
        super.set(options);
    }
}

const defaultOpt = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    selectable: true,
    draggable: true,
    zIndex: 0,
    dragX: true,
    dragY: true,
};
class Line extends Shape {
    joinTo = undefined;
    path;
    #beforeX;
    #beforeY;
    constructor(options) {
        super(options);
        this.options = { ...defaultOpt, ...options };
        this.#beforeX = this.options.x;
        this.#beforeY = this.options.y;
        this.path = new Path();
    }
    __initSet() {
        super.__initSet();
        // this.#beforeEndX = this.options.x;
        // this.#beforeEndY = this.options.y;
    }
    __drawInit() {
        if (!this.joinTo) {
            this.beginPath();
            this.path.createPath();
            this.path.path.moveTo(this.initCords.x, this.initCords.y);
            this.strokeStyle();
        }
        if (!this.options.points) {
            const { cpx1, cpy1, cpx2, cpy2, endX, endY } = this.#calcDiff(this.options.cpx1, this.options.cpy1, this.options.cpx2, this.options.cpy2, this.options.endX, this.options.endY);
            this.options.cpx1 = cpx1;
            this.options.cpy1 = cpy1;
            this.options.cpx2 = cpx2;
            this.options.cpy2 = cpy2;
            this.options.endX = endX;
            this.options.endY = endY;
            if (this.options.cpx1 &&
                this.options.cpy1 &&
                !this.options.cpx2 &&
                !this.options.cpy2) {
                this.path.path.quadraticCurveTo(this.options.cpx1, this.options.cpy1, this.options.endX, this.options.endY);
            }
            else if (this.options.cpx1 &&
                this.options.cpy1 &&
                this.options.cpx2 &&
                this.options.cpy2) {
                this.path.path.bezierCurveTo(this.options.cpx1, this.options.cpy1, this.options.cpx2, this.options.cpy2, this.options.endX, this.options.endY);
            }
            else {
                this.path.lineTo(this.options.endX, this.options.endY);
            }
        }
        else {
            this.#drawLines();
        }
        this.fill();
        this.stroke(this.options.stroke, this.path.path);
    }
    dash(opt) {
        this.options.dash = super.lineDash(opt);
        return this.options.dash;
    }
    points(opt) {
        this.options.points = opt || this.options.points || [];
        return this.options.points;
    }
    checkInBound(_event) {
        const { x, y } = this.canvas.getCursorPosition(_event);
        return this.pointInStroke({ path: this.path.path, x: x, y: y });
    }
    #calcDiff(cpx1, cpy1, cpx2, cpy2, endX, endY) {
        const diffX = this.options.x - this.#beforeX;
        if (diffX !== 0) {
            endX += diffX;
            if (cpx1)
                cpx1 += diffX;
            if (cpx2)
                cpx2 += diffX;
            this.#beforeX = this.options.x;
        }
        const diffY = this.options.y - this.#beforeY;
        if (diffY !== 0) {
            endY += diffY;
            if (cpy1)
                cpy1 += diffY;
            if (cpy2)
                cpy2 += diffY;
            this.#beforeY = this.options.y;
        }
        return { cpx1, cpy1, cpx2, cpy2, endX, endY };
    }
    #drawLines() {
        const beforeX = this.#beforeX;
        const beforeY = this.#beforeY;
        this.options.points.forEach((point, index, arr) => {
            const { cpx1, cpy1, cpx2, cpy2, endX, endY } = this.#calcDiff(point.cpx1, point.cpy1, point.cpx2, point.cpy2, point.endX, point.endY);
            this.options.points[index] = { cpx1, cpy1, cpx2, cpy2, endX, endY };
            if (cpx1 !== undefined &&
                cpy1 !== undefined &&
                cpx2 === undefined &&
                cpy2 === undefined) {
                this.path.path.quadraticCurveTo(cpx1, cpy1, endX, endY);
            }
            else if (cpx1 !== undefined &&
                cpy1 !== undefined &&
                cpx2 !== undefined &&
                cpy2 !== undefined) {
                this.path.path.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, endX, endY);
            }
            else {
                this.path.path.lineTo(endX, endY);
            }
            if (arr.length - 1 !== index) {
                this.#beforeX = beforeX;
                this.#beforeY = beforeY;
            }
        });
    }
    joinBorder(opt) {
        return super.lineCap(opt);
    }
    join(line) {
        line.joinTo = this;
        line.path = this.path;
    }
    strokeStyle(opt) {
        super.strokeStyle(opt);
    }
    strokeWidth(opt) {
        this.options.strokeWidth = opt || this.options.strokeWidth || 1;
        this.options.strokeWidth = super.lineWidth(this.options.strokeWidth);
        return this.options.strokeWidth;
    }
    fillStyle(opt) {
        return super.fillStyle(opt);
    }
    clip(opt) {
        return super.clip(opt);
    }
    dragX(opt) {
        return super.dragX(opt);
    }
    dragY(opt) {
        return super.dragY(opt);
    }
    draggable(opt) {
        return super.draggable(opt);
    }
    selectable(opt) {
        return super.selectable(opt);
    }
    set(options) {
        super.set(options);
    }
}

export { Block, Canvas, CanvasDOMManager, Circle, Elipse, Layout, Line, Rectangle, Shape, TextBlock };
