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

// Each element in the canvas is block
// each Block is Node
class Block extends Node {
    canvas;
    options;
    events = [];
    canvasInit = { x: 0, y: 0, width: 0, height: 0 };
    styleChanges = [];
    beforeCords = { x: 0, y: 0 };
    constructor(options) {
        super();
        this.options = options;
        this.canvasInit = {
            x: this.x(),
            y: this.y(),
            width: this.width(),
            height: this.height(),
        };
        this.beforeCords = {
            x: this.canvasInit.x,
            y: this.canvasInit.y,
        };
    }
    __initSet() { }
    get context() {
        return this.canvas?.context;
    }
    add(...block) {
        this.addChild(block);
        this.__adjustCordinates();
    }
    __adjustCordinates(before) {
        before = before ? before : this.beforeCords;
        this._childs?.forEach((item) => {
            if (item) {
                item.canvasInit.x +=
                    this.x() +
                        this.canvasInit.x -
                        before.x +
                        this.paddingLeft();
                item.canvasInit.y +=
                    this.y() + this.canvasInit.y - before.y + this.paddingTop();
                item.__adjustCordinates(before);
            }
        });
    }
    x(opt) {
        return this.__cacheOption(opt, "x", 0);
    }
    y(opt) {
        return this.__cacheOption(opt, "y", 0);
    }
    width(opt) {
        const width = this.__cacheOption(opt, "width", 0);
        this.canvasInit.width = width;
        return width;
    }
    height(opt) {
        const height = this.__cacheOption(opt, "height", 0);
        this.canvasInit.height = height;
        return height;
    }
    padding(opt) {
        this.options.padding = opt || this.options.padding || [];
        switch (this.options.padding.length) {
            case 1:
                this.options.paddingBottom =
                    this.options.paddingLeft =
                        this.options.paddingRight =
                            this.options.padding[0];
                break;
            case 2:
                this.options.paddingBottom = this.options.padding[0];
                this.options.paddingLeft = this.options.paddingRight =
                    this.options.padding[1];
                break;
            case 3:
                this.options.paddingBottom = this.options.padding[2];
                this.options.paddingLeft = this.options.paddingRight =
                    this.options.padding[1];
                break;
            case 4:
                this.options.paddingBottom = this.options.padding[1];
                this.options.paddingRight = this.options.padding[1];
                this.options.paddingLeft = this.options.padding[2];
                break;
        }
        this.options.paddingTop = this.options.padding[0];
        return this.options.padding;
    }
    paddingTop(opt) {
        return this.__cacheOption(opt, "paddingTop", 0);
    }
    paddingBottom(opt) {
        return this.__cacheOption(opt, "paddingBottom", 0);
    }
    paddingLeft(opt) {
        return this.__cacheOption(opt, "paddingLeft", 0);
    }
    paddingRight(opt) {
        return this.__cacheOption(opt, "paddingRight", 0);
    }
    flex(opt) {
        const flex = this.__cacheOption(opt, "flex", [
            this.flexGrow(),
            this.flexShrink(),
            this.flexBasis(),
        ]);
        this.flexGrow(flex[0]);
        this.flexShrink(flex[1]);
        this.flexBasis(flex[2]);
        return flex;
    }
    flexBasis(opt) {
        return this.__cacheOption(opt, "flexBasis", "auto");
    }
    flexShrink(opt) {
        return this.__cacheOption(opt, "flexShrink", 0);
    }
    flexGrow(opt) {
        return this.__cacheOption(opt, "flexGrow", 0);
    }
    order(opt) {
        return this.__cacheOption(opt, "order", undefined);
    }
    alignSelf(opt) {
        return this.__cacheOption(opt, "alignSelf", "auto");
    }
    justifySelf(opt) {
        return this.__cacheOption(opt, "justifySelf", "auto");
    }
    gridRow(opt) {
        return this.__cacheOption(opt, "gridRow", []);
    }
    gridRowStart(opt) {
        return this.__cacheOption(opt, "gridRowStart", 0);
    }
    gridRowEnd(opt) {
        return this.__cacheOption(opt, "gridRowEnd", 0);
    }
    gridColumn(opt) {
        return this.__cacheOption(opt, "gridColumn", []);
    }
    gridColumnStart(opt) {
        return this.__cacheOption(opt, "gridColumnStart", 0);
    }
    gridColumnEnd(opt) {
        return this.__cacheOption(opt, "gridColumnEnd", 0);
    }
    gridArea(opt) {
        const gridArea = this.__cacheOption(opt, "gridArea", []);
        this.gridRowStart(gridArea[0] || "auto");
        this.gridColumnStart(gridArea[1] || "auto");
        this.gridRowEnd(gridArea[2] || "auto");
        this.gridColumnEnd(gridArea[3] || "auto");
        return gridArea;
    }
    clip_path() {
        this.canvas.clipping_path.addRect(this.canvasInit.x, this.canvasInit.y, this.width(), this.height()
        // this.borderRadius()
        );
    }
    clip(opt) {
        const clip = this.__cacheOption(opt, "clip", false);
        if (clip) {
            this.clip_path();
            if (!this.fillRule())
                this.fillRule();
            this.context.clip(this.canvas.clipping_path.path, this.fillRule());
        }
        return clip;
    }
    fillRule(opt) {
        return this.__cacheOption(opt, "fillRule", "nonzero");
    }
    zIndex(opt) {
        return this.__cacheOption(opt, "zIndex", undefined);
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
    __cacheOption(opt, option, defaultOpt) {
        if (this.options) {
            if (opt)
                this.options[option] = opt;
            else if (this.options[option])
                return this.options[option];
            else
                this.options[option] = defaultOpt;
            return this.options[option];
        }
        return undefined;
    }
    reset() { }
    rotate(opt) {
        const rotate = this.__cacheOption(opt, "rotate", 0);
        this.context.rotate(rotate);
        return rotate;
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
        const { x, y } = this.canvas.getCursorPosition(_event);
        const borderWidth = this.options.borderWidth || 0;
        if (x >= this.canvasInit.x - borderWidth &&
            x <= this.canvasInit.x + this.width() + borderWidth &&
            y >= this.canvasInit.y - borderWidth &&
            y <= this.canvasInit.y + this.height() + borderWidth) {
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
        if (!opt && duplicat.length >= 1)
            return false;
        this.events.push({
            eventType: "selectable",
            method: () => { },
        });
        // let old_color = this.options.borderColor;
        // this.mousemove((event) => {
        //     if (!this.options.mousedown && this.checkInBound(event)) {
        //         this.set({ color: "yellow" });
        //     } else {
        //         this.set({ color: old_color });
        //     }
        // });
        this.options.selectable = this.__cacheOption(opt, "selectable", true);
        return this.options.selectable;
    }
    dragX(opt) {
        return this.__cacheOption(opt, "dragX", true);
    }
    dragY(opt) {
        return this.__cacheOption(opt, "dragY", true);
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
                this.beforeCords.x = this.canvasInit.x;
                if (diffX !== 0 && this.dragX()) {
                    this.canvasInit.x += diffX - beforeX;
                    beforeX = diffX;
                }
                this.beforeCords.y = this.canvasInit.y;
                if (diffY !== 0 && this.dragY()) {
                    this.canvasInit.y += diffY - beforeY;
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

// Layer spesical type of block whcih defines group of blocks
class Layout extends Block {
    #startX = 0;
    #startY = 0;
    #startXPos = [];
    #startYPos = [];
    #columnsGap = [];
    #rowsGap = [];
    #isNew = true;
    #invoker;
    #containerW = 0;
    #containerH = 0;
    #flexItems = { width: [], height: [], cols: [], rows: [] };
    #gridItems = { nCols: 0, nRows: 0, width: [], height: [] };
    constructor(options) {
        super(options);
        this.options = options;
    }
    __initSet() {
        super.__initSet();
        if (this.#invoker)
            this.#invoker();
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
        const layout = this.__cacheOption(opt, "layout", "flex");
        let order = 0;
        this._childs.forEach((item) => {
            if (!item.options.order) {
                order += 1;
                item.options.order = order;
            }
        });
        if (layout == "inline-flex" || layout == "inline-grid") {
            if (!this.canvasInit.width)
                this.canvasInit.width = this._childs.reduce((prev, curr) => prev + curr.canvasInit.width, 0);
            if (!this.canvasInit.height)
                this.canvasInit.height = this._childs.reduce((prev, curr) => prev + curr.canvasInit.height, 0);
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
    flexFlow(opt) {
        const flexFlow = this.__cacheOption(opt, "flexFlow", [
            this.flexDirection(),
            this.flexWrap(),
        ]);
        this.flexDirection(flexFlow[0]);
        this.flexWrap(flexFlow[1]);
        return flexFlow;
    }
    flexDirection(opt) {
        return this.__cacheOption(opt, "flexDirection", "row");
    }
    flexWrap(opt) {
        return this.__cacheOption(opt, "flexWrap", "nowrap");
    }
    placeContent(opt) {
        this.alignContent(opt);
        this.justifyContent(opt);
        return this.__cacheOption(opt, "placeContent", "start");
    }
    placeItems(opt) {
        this.alignItems(opt);
        this.justifyItems(opt);
        return this.__cacheOption(opt, "placeItems", "start");
    }
    gap(opt) {
        const gap = this.__cacheOption(opt, "gap", 0);
        let gapRow, gapColumn;
        gapRow = gapColumn = gap;
        if (opt instanceof Array) {
            gapRow = gap[0];
            gapColumn = gap[0];
        }
        this.gapColumn(gapRow);
        this.gapRow(gapColumn);
        return gap;
    }
    gridTemplate(opt) {
        const gridTemplate = this.__cacheOption(opt, "gridTemplate", []);
        this.gridTemplateRows(gridTemplate[0]);
        this.gridTemplateColumns(gridTemplate[1]);
        return gridTemplate;
    }
    gridAutoFlow(opt) {
        return this.__cacheOption(opt, "gridAutoFlow", "row");
    }
    gridTemplateColumns(opt) {
        return this.__cacheOption(opt, "gridTemplateColumns", []);
    }
    gridTemplateRows(opt) {
        return this.__cacheOption(opt, "gridTemplateRows", []);
    }
    gapColumn(opt) {
        return this.__cacheOption(opt, "gapColumn", 0);
    }
    gapRow(opt) {
        return this.__cacheOption(opt, "gapRow", 0);
    }
    columnStart(opt) {
        return this.__cacheOption(opt, "columnStart", 1);
    }
    columnEnd(opt) {
        return this.__cacheOption(opt, "columnEnd", 0);
    }
    justifyContent(opt) {
        const justifyContent = this.__cacheOption(opt, "justifyContent", "normal");
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
    // only works for grid layout
    justifyItems(opt) {
        const justifyItems = this.__cacheOption(opt, "justifyItems", "normal");
        const justify = "justifyItems";
        switch (justifyItems) {
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
        return justifyItems;
    }
    // in flexbox works with wrap option
    alignContent(opt) {
        const alignContent = this.__cacheOption(opt, "alignContent", "normal");
        if (!this.#isWrap && !this.#isGrid)
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
        const alignItems = this.__cacheOption(opt, "alignItems", "normal");
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
    get #isGrid() {
        if (this.options.layout === "grid" ||
            this.options.layout === "inline-grid")
            return true;
        return false;
    }
    get #isWrap() {
        return this.flexWrap() === "nowrap" ? false : true;
    }
    get #isOutofLayout() {
        if (this.canvasInit.height - this.#containerH > 0 &&
            this.canvasInit.width - this.#containerW > 0)
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
            if (this.#isGrid) {
                this.#startX = 0;
                this.#invoker = this.#gridLayout;
            }
            else {
                if (this.#isFlexCol) {
                    this.#startY = 0;
                    this.#invoker = this.#flexColumn;
                }
                else {
                    this.#startX = 0;
                    this.#invoker = this.#flexRow;
                }
            }
        };
        const _func2 = () => {
            if (this.#isGrid) {
                this.#startY = 0;
                this.#invoker = this.#gridLayout;
            }
            else {
                if (this.#isFlexCol) {
                    this.#startX = 0;
                    this.#invoker = this.#flexColumn;
                }
                else {
                    if (this.#isWrap) {
                        this.#startY = 0;
                        this.#invoker = this.#flexRow;
                    }
                }
            }
        };
        const _func3 = () => {
            if (this.#isGrid) {
                this.#startX = 0;
                this.#invoker = this.#gridLayout;
            }
        };
        const _func4 = () => {
            if (this.#isGrid) {
                this.#startY = 0;
                this.#invoker = this.#gridLayout;
            }
            else {
                if (this.#isFlexCol) {
                    this.#startX = 0;
                    this.#invoker = this.#flexColumn;
                }
                else {
                    this.#startY = 0;
                    this.#invoker = this.#flexRow;
                }
            }
        };
        this.#checkLayoutType(_type, _func1, _func2, _func3, _func4);
    }
    #end(_type) {
        const _func1 = () => {
            if (this.#isOutofLayout && !this.#isGrid) {
                if (this.#isFlexCol) {
                    if (this.#isWrap) {
                        this.#flexItems.height.forEach((item) => {
                            let startY = this.canvasInit.height - item;
                            startY = startY >= 0 ? startY : 0;
                            this.#startYPos.push(startY);
                        });
                    }
                    else {
                        const startY = this.canvasInit.height - this.#containerH;
                        this.#startY = startY > 0 ? startY : 0;
                    }
                    this.#invoker = this.#invoker = this.#flexColumn;
                }
                else {
                    if (this.#isWrap) {
                        this.#flexItems.width.forEach((item) => {
                            let startX = this.canvasInit.width - item;
                            startX = startX >= 0 ? startX : 0;
                            this.#startXPos.push(startX);
                        });
                    }
                    else {
                        const startX = this.canvasInit.width - this.#containerW;
                        this.#startX = startX > 0 ? startX : 0;
                    }
                    this.#invoker = this.#flexRow;
                }
            }
            if (this.#isGrid) {
                this.#startX = Math.abs(this.canvasInit.width -
                    this.#gridItems.width.reduce((a, c) => a + c, 0));
                this.#invoker = this.#gridLayout;
            }
        };
        const _func2 = () => {
            if (this.#isOutofLayout && this.#isWrap && !this.#isGrid) {
                if (this.#isFlexCol) {
                    const startX = this.canvasInit.width - this.#containerW;
                    this.#startX = startX > 0 ? startX : 0;
                    this.#invoker = this.#flexColumn;
                }
                else {
                    const startY = this.canvasInit.height - this.#containerH;
                    this.#startY = startY > 0 ? startY : 0;
                    this.#invoker = this.#flexRow;
                }
            }
            if (this.#isGrid) {
                this.#startY = Math.abs(this.canvasInit.height -
                    this.#gridItems.height.reduce((a, c) => a + c, 0));
                this.#invoker = this.#gridLayout;
            }
        };
        const _func3 = () => {
            if (this.#isGrid) {
                const blocks = this._childs;
                let idx = 0;
                let colIdx = 0;
                while (blocks.length > idx) {
                    const width = this.#gridItems.width[colIdx];
                    let startX = width - blocks[idx].canvasInit.width;
                    // startX = startX > 0 ? startX : 0;
                    this.#startXPos.push(startX);
                    idx += 1;
                    colIdx += 1;
                    if (colIdx === this.#gridItems.width.length)
                        colIdx = 0;
                }
                this.#gridLayout();
            }
        };
        const _func4 = () => {
            if (this.#isGrid) {
                const blocks = this._childs;
                let idx = 0;
                let rowIdx = 0;
                while (blocks.length > idx) {
                    const height = this.#gridItems.height[rowIdx];
                    let startY = height - blocks[idx].canvasInit.height;
                    // startY = startX > 0 ? startX : 0;
                    this.#startYPos.push(startY);
                    idx += 1;
                    rowIdx += 1;
                    if (rowIdx === this.#gridItems.height.length)
                        rowIdx = 0;
                }
                this.#gridLayout();
            }
            else {
                if (this.#isFlexCol) {
                    let rows = 0;
                    let idx = 0;
                    let containerW = this.canvasInit.width - this.#containerW;
                    containerW =
                        containerW > 0 && !this.#isWrap ? containerW : 0;
                    this.#flexItems.width.forEach((item) => {
                        for (let i = 0; i < this.#flexItems.rows[idx]; i++) {
                            const block = this._childs[i + rows];
                            this.#startXPos.push(containerW + (item - block.canvasInit.width));
                        }
                        rows += this.#flexItems.rows[idx];
                        idx++;
                    });
                    this.#flexColumn();
                }
                else {
                    let cols = 0;
                    let idx = 0;
                    let containerH = this.canvasInit.height - this.#containerH;
                    containerH =
                        containerH > 0 && !this.#isWrap ? containerH : 0;
                    this.#flexItems.height.forEach((item) => {
                        for (let i = 0; i < this.#flexItems.cols[idx]; i++) {
                            const block = this._childs[i + cols];
                            this.#startYPos.push(containerH + (item - block.canvasInit.height));
                        }
                        cols += this.#flexItems.cols[idx];
                        idx++;
                    });
                    this.#flexRow();
                }
            }
        };
        this.#checkLayoutType(_type, _func1, _func2, _func3, _func4);
    }
    #center(_type) {
        const _func1 = () => {
            if (this.#isOutofLayout && !this.#isGrid) {
                if (this.#isFlexCol) {
                    if (this.#isWrap) {
                        this.#flexItems.height.forEach((item) => {
                            let startY = this.canvasInit.height - item;
                            startY = startY > 0 ? startY : 0;
                            this.#startYPos.push(startY / 2);
                        });
                    }
                    else {
                        const startY = this.canvasInit.height - this.#containerH;
                        this.#startY = startY > 0 ? startY / 2 : 0;
                    }
                    this.#invoker = this.#flexColumn;
                }
                else {
                    if (this.#isWrap) {
                        this.#flexItems.width.forEach((item) => {
                            let startX = this.canvasInit.width - item;
                            startX = startX > 0 ? startX : 0;
                            this.#startXPos.push(startX / 2);
                        });
                    }
                    else {
                        const startX = this.canvasInit.width - this.#containerW;
                        this.#startX = startX > 0 ? startX / 2 : 0;
                    }
                    this.#invoker = this.#flexRow;
                }
            }
            if (this.#isGrid) {
                let startX = this.canvasInit.width / 2 -
                    this.#gridItems.width.reduce((a, c) => a + c, 0) / 2;
                this.#startX = startX > 0 ? startX : 0;
                this.#invoker = this.#gridLayout;
            }
        };
        const _func2 = () => {
            if (this.#isGrid) {
                const startY = this.canvasInit.height -
                    this.#gridItems.height.reduce((a, c) => a + c, 0);
                this.#startY = startY > 0 ? startY / this.#gridItems.nRows : 0;
                this.#invoker = this.#gridLayout;
            }
            else {
                if (this.#isOutofLayout && this.#isWrap) {
                    if (this.#isFlexCol) {
                        const startX = this.canvasInit.width - this.#containerW;
                        this.#startX =
                            startX > 0
                                ? startX / this.#flexItems.cols.length
                                : 0;
                        this.#invoker = this.#flexColumn;
                    }
                    else {
                        const startY = this.canvasInit.height - this.#containerH;
                        this.#startY =
                            startY > 0
                                ? startY / this.#flexItems.rows.length
                                : 0;
                        this.#invoker = this.#flexRow;
                    }
                }
            }
        };
        const _func3 = () => {
            if (this.#isGrid) {
                const blocks = this._childs;
                let idx = 0;
                let colIdx = 0;
                while (blocks.length > idx) {
                    let startX = this.#gridItems.width[colIdx] / 2 -
                        blocks[idx].canvasInit.width / 2;
                    // startX = startX > 0 ? startX : 0;
                    this.#startXPos.push(startX);
                    idx += 1;
                    colIdx += 1;
                    if (this.#gridItems.width.length === colIdx)
                        colIdx = 0;
                }
                this.#invoker = this.#gridLayout;
            }
        };
        const _func4 = () => {
            if (this.#isGrid) {
                const blocks = this._childs;
                let idx = 0;
                let rowIdx = 0;
                while (blocks.length > idx) {
                    const height = this.#gridItems.height[rowIdx];
                    let startY = height / 2 - blocks[idx].canvasInit.height / 2;
                    // startY = startX > 0 ? startX : 0;
                    this.#startYPos.push(startY);
                    idx += 1;
                    rowIdx += 1;
                    if (this.#gridItems.height.length === rowIdx)
                        rowIdx = 0;
                }
                this.#invoker = this.#gridLayout;
            }
            else {
                if (this.#isFlexCol) {
                    let rows = 0;
                    let idx = 0;
                    let containerW = this.canvasInit.width - this.#containerW;
                    containerW =
                        containerW > 0 && !this.#isWrap ? containerW : 0;
                    this.#flexItems.width.forEach((item) => {
                        for (let i = 0; i < this.#flexItems.rows[idx]; i++) {
                            const block = this._childs[i + rows];
                            this.#startXPos.push(containerW / 2 +
                                (item - block.canvasInit.width) / 2);
                        }
                        rows += this.#flexItems.rows[idx];
                        idx++;
                    });
                    this.#invoker = this.#flexColumn;
                }
                else {
                    let cols = 0;
                    let idx = 0;
                    let containerH = this.canvasInit.height - this.#containerH;
                    containerH =
                        containerH > 0 && !this.#isWrap ? containerH : 0;
                    this.#flexItems.height.forEach((item) => {
                        for (let i = 0; i < this.#flexItems.cols[idx]; i++) {
                            const block = this._childs[i + cols];
                            this.#startYPos.push(containerH / 2 +
                                (item - block.canvasInit.height) / 2);
                        }
                        cols += this.#flexItems.cols[idx];
                        idx++;
                    });
                    this.#invoker = this.#flexRow;
                }
            }
        };
        this.#checkLayoutType(_type, _func1, _func2, _func3, _func4);
    }
    #spaceBetween(_type) {
        const _func1 = () => {
            if (this.#isOutofLayout && !this.#isGrid) {
                if (this.#isFlexCol) {
                    if (this.#isWrap) {
                        this.#flexItems.height.forEach((item, index) => {
                            let gap = this.canvasInit.height - item;
                            gap =
                                gap > 0
                                    ? gap /
                                        (this.#flexItems.rows[index] - 1)
                                    : 0;
                            if (this.gapRow() > gap)
                                gap = this.gapRow();
                            this.#rowsGap.push(gap);
                        });
                    }
                    else {
                        let gap = this.canvasInit.height - this.#containerH;
                        gap = gap > 0 ? (gap /= this._childs.length - 1) : 0;
                        this.options.gapRow = this.gapRow() + gap;
                    }
                    this.#invoker = this.#flexColumn;
                }
                else {
                    if (this.#isWrap) {
                        this.#flexItems.width.forEach((item, index) => {
                            let gap = this.canvasInit.width - item;
                            gap =
                                gap > 0
                                    ? gap /
                                        (this.#flexItems.cols[index] - 1)
                                    : 0;
                            if (this.gapColumn() > gap)
                                gap = this.gapColumn();
                            this.#columnsGap.push(gap);
                        });
                    }
                    else {
                        let gap = this.canvasInit.width - this.#containerW;
                        gap = gap > 0 ? (gap /= this._childs.length - 1) : 0;
                        this.options.gapColumn = this.gapColumn() + gap;
                    }
                    this.#invoker = this.#flexRow;
                }
            }
            if (this.#isGrid) {
                let gap = this.canvasInit.width -
                    this.#gridItems.width.reduce((a, c) => a + c, 0);
                const nCols = this.#gridItems.nCols - 1 !== 0
                    ? this.#gridItems.nCols - 1
                    : 1;
                this.options.gapColumn =
                    this.gapColumn() + gap > 0 ? gap / nCols : 0;
                this.#invoker = this.#gridLayout;
            }
        };
        const _func2 = () => {
            if (this.#isOutofLayout && this.#isWrap && !this.#isGrid) {
                if (this.#isFlexCol) {
                    let gap = this.canvasInit.width - this.#containerW;
                    this.options.gapColumn =
                        gap > 0 ? gap / (this.#flexItems.cols.length - 1) : 0;
                    this.#invoker = this.#flexColumn;
                }
                else {
                    let gap = this.canvasInit.height - this.#containerH;
                    this.options.gapRow =
                        gap > 0 ? gap / (this.#flexItems.rows.length - 1) : 0;
                    this.#invoker = this.#flexRow;
                }
            }
            if (this.#isGrid) {
                let gap = this.canvasInit.height -
                    this.#gridItems.height.reduce((a, c) => a + c, 0);
                const nRows = this.#gridItems.nRows - 1 !== 0
                    ? this.#gridItems.nRows - 1
                    : 1;
                this.options.gapRow = this.gapRow() + gap > 0 ? gap / nRows : 0;
                this.#invoker = this.#gridLayout;
            }
        };
        this.#checkLayoutType(_type, _func1, _func2);
    }
    #spaceAround(_type) {
        const _func1 = () => {
            if (this.#isOutofLayout && !this.#isGrid) {
                if (this.#isFlexCol) {
                    if (this.#isWrap) {
                        this.#flexItems.height.forEach((item, index) => {
                            const cols = this.#flexItems.rows[index];
                            let gap = this.canvasInit.height - item;
                            gap = gap > 0 ? gap / cols : 0;
                            if (this.gapRow() > gap)
                                gap = this.gapRow();
                            this.#rowsGap.push(gap);
                            this.#startYPos.push(gap / 2);
                        });
                    }
                    else {
                        let gap = this.canvasInit.height - this.#containerH;
                        gap = gap > 0 ? gap / this._childs.length : 0;
                        this.options.gapRow = gap;
                        this.#startY = gap / 2;
                    }
                    this.#invoker = this.#flexColumn;
                }
                else {
                    if (this.#isWrap) {
                        this.#flexItems.width.forEach((item, index) => {
                            const cols = this.#flexItems.cols[index];
                            let gap = this.canvasInit.width - item;
                            gap = gap > 0 ? gap / cols : 0;
                            if (this.gapColumn() > gap)
                                gap = this.gapColumn();
                            this.#columnsGap.push(gap);
                            this.#startXPos.push(gap / 2);
                        });
                    }
                    else {
                        let gap = this.canvasInit.width - this.#containerW;
                        gap = gap > 0 ? gap / this._childs.length : 0;
                        this.options.gapColumn = gap;
                        this.#startX = gap / 2;
                    }
                    this.#invoker = this.#flexRow;
                }
            }
            if (this.#isGrid) {
                let gap = this.canvasInit.width -
                    this.#gridItems.width.reduce((a, c) => a + c, 0);
                gap = gap > 0 ? gap / this.#gridItems.nCols : 0;
                this.options.gapColumn = gap;
                this.#startX = gap / 2;
                this.#invoker = this.#gridLayout;
            }
        };
        const _func2 = () => {
            if (this.#isGrid) {
                let gap = this.canvasInit.height -
                    this.#gridItems.height.reduce((a, c) => a + c, 0);
                gap = gap > 0 ? gap / this.#gridItems.nRows : 0;
                this.options.gapRow = gap;
                this.#startY = gap / 2;
                this.#invoker = this.#gridLayout;
            }
            else {
                if (this.#isWrap) {
                    if (this.#isFlexCol) {
                        let gap = this.canvasInit.width - this.#containerW;
                        gap = gap > 0 ? gap / this.#flexItems.cols.length : 0;
                        this.options.gapColumn = gap;
                        this.#startX = gap / 2;
                        this.#invoker = this.#flexColumn;
                    }
                    else {
                        let gap = this.canvasInit.height - this.#containerH;
                        gap = gap > 0 ? gap / this.#flexItems.rows.length : 0;
                        this.options.gapRow = gap;
                        this.#startY = gap / 2;
                        this.#invoker = this.#flexRow;
                    }
                }
            }
        };
        this.#checkLayoutType(_type, _func1, _func2);
    }
    #spaceEvenly(_type) {
        const _func1 = () => {
            if (this.#isOutofLayout && !this.#isGrid) {
                if (this.#isFlexCol) {
                    if (this.#isWrap) {
                        this.#flexItems.height.forEach((item, index) => {
                            const rows = this.#flexItems.rows[index];
                            let gap = this.canvasInit.height - item;
                            gap = gap > 0 ? gap / (rows + 1) : 0;
                            if (this.gapRow() > gap)
                                gap = this.gapRow();
                            this.#rowsGap.push(gap);
                            this.#startYPos.push(gap);
                        });
                    }
                    else {
                        let gap = this.canvasInit.height - this.#containerH;
                        gap = gap > 0 ? gap / this._childs.length + 1 : 0;
                        this.options.gapRow = this.gapRow() + gap;
                        this.#startY = gap;
                    }
                    this.#invoker = this.#flexColumn;
                }
                else {
                    if (this.#isWrap) {
                        this.#flexItems.width.forEach((item, index) => {
                            const cols = this.#flexItems.cols[index];
                            let gap = this.canvasInit.width - item;
                            gap = gap > 0 ? gap / (cols + 1) : 0;
                            if (this.gapColumn() > gap)
                                gap = this.gapColumn();
                            this.#columnsGap.push(gap);
                            this.#startXPos.push(gap);
                        });
                    }
                    else {
                        let gap = this.canvasInit.width - this.#containerW;
                        gap = gap > 0 ? gap / (this._childs.length + 1) : 0;
                        this.options.gapColumn = this.gapColumn() + gap;
                        this.#startX = gap;
                    }
                    this.#invoker = this.#flexRow;
                }
            }
            if (this.#isGrid) {
                let gap = this.canvasInit.width -
                    this.#gridItems.width.reduce((a, c) => a + c, 0);
                gap = gap > 0 ? gap / (this.#gridItems.nCols + 1) : 0;
                this.options.gapColumn = gap;
                this.#startX = gap;
                this.#invoker = this.#gridLayout;
            }
        };
        const _func2 = () => {
            if (this.#isGrid) {
                let gap = this.canvasInit.height -
                    this.#gridItems.height.reduce((a, c) => a + c, 0);
                gap = gap > 0 ? gap / (this.#gridItems.nRows + 1) : 0;
                this.options.gapRow = gap;
                this.#startY = gap;
                this.#invoker = this.#gridLayout;
            }
            else {
                if (this.#isWrap) {
                    if (this.#isFlexCol) {
                        let gap = this.canvasInit.width - this.#containerW;
                        gap =
                            gap > 0
                                ? gap / (this.#flexItems.cols.length + 1)
                                : 0;
                        this.options.gapColumn = gap;
                        this.#startX = gap;
                        this.#invoker = this.#flexColumn;
                    }
                    else {
                        let gap = this.canvasInit.height - this.#containerH;
                        gap =
                            gap > 0
                                ? gap / (this.#flexItems.rows.length + 1)
                                : 0;
                        this.options.gapRow = gap;
                        this.#startY = gap;
                        this.#invoker = this.#flexRow;
                    }
                }
            }
        };
        this.#checkLayoutType(_type, _func1, _func2);
    }
    #flexRow() {
        const blocks = this._childs;
        blocks.sort((a, b) => a.options.order - b.options.order);
        let idx = 0;
        let col = 0;
        let rowIdx = 0;
        let blocksW = 0;
        let blocksH = 0;
        let wrapWidth = 0;
        let sharedColumnGap = 0;
        let dumpSharedColumnGap = 0;
        let sumWidths = 0;
        let startX = this.#startXPos[rowIdx] !== undefined
            ? this.#startXPos[rowIdx]
            : this.#startX;
        let startY = this.#startY;
        let gapCol = this.#columnsGap[rowIdx] !== undefined
            ? this.#columnsGap[rowIdx]
            : this.gapColumn();
        let gapRow = this.#rowsGap[rowIdx] !== undefined
            ? this.#rowsGap[rowIdx]
            : this.gapRow();
        if (!this.#isWrap) {
            sumWidths = blocks.reduce((prev, curr) => prev + curr.canvasInit.width, 0);
            let diffShrink = this.canvasInit.width - sumWidths;
            dumpSharedColumnGap = sharedColumnGap =
                Math.abs(diffShrink) / blocks.length;
            if (sumWidths > this.canvasInit.width) {
                let allShrinkSum = 0;
                let allDiff = 0;
                blocks.forEach((item) => {
                    if (item.flexShrink() !== 0) {
                        if (item.canvasInit.width -
                            sharedColumnGap * item.flexShrink() >
                            0) {
                            allShrinkSum += item.flexShrink();
                            allDiff += 1;
                        }
                    }
                });
                if (diffShrink < 0 && allShrinkSum > 1) {
                    sharedColumnGap -=
                        (sharedColumnGap * allShrinkSum -
                            sharedColumnGap * allDiff) /
                            (blocks.length - allDiff);
                }
                sharedColumnGap = Math.abs(sharedColumnGap);
            }
        }
        let flexAdjust = [];
        while (blocks.length > idx) {
            let block = blocks[idx];
            if (this.#isWrap)
                wrapWidth += block.canvasInit.width;
            if (wrapWidth > this.canvasInit.width ||
                blocks.length - 1 === idx) {
                let ccCol = col;
                if (blocks.length - 1 === idx)
                    ccCol += 1;
                else
                    ccCol -= 1;
                let diff = this.canvasInit.width - (blocksW + gapCol * ccCol);
                if (blocks.length - 1 === idx) {
                    diff -= block.canvasInit.width;
                    if (block.flexGrow())
                        flexAdjust.push({
                            idx: idx,
                            grow: block.flexGrow(),
                        });
                }
                if (diff > 0 && diff !== 0 && flexAdjust.length !== 0) {
                    const sumOf = flexAdjust.reduce((p, c) => p + c.grow, 0);
                    flexAdjust.forEach((item) => {
                        blocks[item.idx].canvasInit.width =
                            blocks[item.idx].canvasInit.width +
                                (diff / sumOf) * item.grow;
                    });
                    startX =
                        this.#startXPos[rowIdx] !== undefined
                            ? this.#startXPos[rowIdx]
                            : this.#startX;
                    idx = idx - col;
                    wrapWidth = 0;
                    blocksW = 0;
                    blocksH = 0;
                    col = 0;
                    continue;
                }
            }
            if (this.#isWrap) {
                if (wrapWidth > this.canvasInit.width) {
                    rowIdx += 1;
                    startY += blocksH + gapRow;
                    startX =
                        this.#startXPos[rowIdx] !== undefined
                            ? this.#startXPos[rowIdx]
                            : this.#startX;
                    gapCol =
                        this.#columnsGap[rowIdx] !== undefined
                            ? this.#columnsGap[rowIdx]
                            : this.gapColumn();
                    wrapWidth = block.canvasInit.width;
                    if (this.#isNew) {
                        this.#flexItems.width.push(blocksW);
                        this.#flexItems.height.push(blocksH);
                        this.#flexItems.cols.push(col);
                        this.#flexItems.rows.push(1);
                    }
                    blocksW = 0;
                    blocksH = 0;
                    col = 0;
                    flexAdjust = [];
                }
            }
            let endX = block.canvasInit.width;
            let gap = sharedColumnGap;
            if (!this.#isWrap) {
                if (block.flexShrink())
                    gap = dumpSharedColumnGap * block.flexShrink();
                if (idx !== blocks.length - 1)
                    endX -= gap + gapCol;
                else
                    endX -= gap;
                if (endX < 0) {
                    // startX += endX;
                    endX = 0;
                }
            }
            block.canvasInit.x = startX;
            block.canvasInit.y = startY;
            block.canvasInit.width = endX;
            if (block.flexBasis() !== "auto")
                block.canvasInit.width = block.flexBasis();
            if (this.#startYPos[idx] !== undefined) {
                block.canvasInit.y = startY + this.#startYPos[idx];
                block.canvasInit.y = startY + this.#startYPos[idx];
            }
            block.__adjustCordinates();
            blocksW += block.canvasInit.width;
            blocksH =
                blocksH < block.canvasInit.height
                    ? block.canvasInit.height
                    : blocksH;
            if (block.flexGrow())
                flexAdjust.push({ idx: idx, grow: block.flexGrow() });
            startX += gapCol + block.canvasInit.width;
            idx += 1;
            col += 1;
            wrapWidth += gapCol;
        }
        if (this.#isNew) {
            this.#flexItems.width.push(blocksW);
            this.#flexItems.height.push(blocksH);
            this.#flexItems.cols.push(col);
            this.#flexItems.rows.push(1);
            if (this.#isWrap) {
                this.#containerH = this.#flexItems.height.reduce((p, c) => p + c, 0);
                this.#containerW = Math.max(...this.#flexItems.width);
            }
            else {
                this.#containerH = Math.max(...this.#flexItems.height);
                this.#containerW = sumWidths;
            }
        }
        this.#isNew = false;
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
                width += block.canvasInit.width;
                if (width > this.canvasInit.width) {
                    dublicate.reverse();
                    childs.push(...dublicate);
                    dublicate = [];
                    width = 0;
                }
                width += this.gapColumn();
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
        blocks.sort((a, b) => a.options.order - b.options.order);
        let idx = 0;
        let row = 0;
        let colIdx = 0;
        let blocksW = 0;
        let blocksH = 0;
        let wrapHeight = 0;
        let sumHeights = 0;
        let sharedRowGap = 0;
        let dumpSharedRowGap = 0;
        let startX = this.#startX;
        let startY = this.#startYPos[colIdx] !== undefined
            ? this.#startYPos[colIdx]
            : this.#startY;
        let gapCol = this.#columnsGap[colIdx] !== undefined
            ? this.#columnsGap[colIdx]
            : this.gapColumn();
        let gapRow = this.#rowsGap[colIdx] !== undefined
            ? this.#rowsGap[colIdx]
            : this.gapRow();
        if (!this.#isWrap) {
            sumHeights = blocks.reduce((prev, curr) => prev + curr.canvasInit.height, 0);
            let diffShrink = this.canvasInit.width - sumHeights;
            sharedRowGap = Math.abs(diffShrink) / blocks.length;
            if (sumHeights > this.canvasInit.height) {
                let allShrinkSum = 0;
                let allDiff = 0;
                dumpSharedRowGap = sharedRowGap =
                    Math.abs(diffShrink) / blocks.length;
                blocks.forEach((item) => {
                    if (item.flexShrink() !== 0) {
                        if (item.canvasInit.height -
                            sharedRowGap * item.flexShrink() >
                            0) {
                            allShrinkSum += item.flexShrink();
                            allDiff += 1;
                        }
                    }
                });
                if (diffShrink < 0 && allShrinkSum > 1) {
                    sharedRowGap -=
                        (sharedRowGap * allShrinkSum - sharedRowGap * allDiff) /
                            (blocks.length - allDiff);
                }
                sharedRowGap = Math.abs(sharedRowGap);
            }
        }
        let flexAdjust = [];
        while (blocks.length > idx) {
            const block = blocks[idx];
            if (this.#isWrap)
                wrapHeight += block.canvasInit.height;
            if (wrapHeight > this.canvasInit.height ||
                blocks.length - 1 === idx) {
                let rrRow = row;
                if (blocks.length - 1 === idx)
                    rrRow += 1;
                else
                    rrRow -= 1;
                let diff = this.canvasInit.height - (blocksH + gapRow * rrRow);
                if (blocks.length - 1 === idx) {
                    diff -= block.canvasInit.height;
                    if (block.flexGrow())
                        flexAdjust.push({
                            idx: idx,
                            grow: block.flexGrow(),
                        });
                }
                if (diff > 0 && diff !== 0 && flexAdjust.length !== 0) {
                    const sumOf = flexAdjust.reduce((p, c) => p + c.grow, 0);
                    flexAdjust.forEach((item) => {
                        blocks[item.idx].canvasInit.height =
                            blocks[item.idx].canvasInit.height +
                                (diff / sumOf) * item.grow;
                    });
                    startY =
                        this.#startYPos[colIdx] !== undefined
                            ? this.#startYPos[colIdx]
                            : this.#startY;
                    idx = idx - row;
                    wrapHeight = 0;
                    blocksW = 0;
                    blocksH = 0;
                    row = 0;
                    continue;
                }
            }
            if (this.#isWrap) {
                if (wrapHeight > this.canvasInit.height) {
                    colIdx += 1;
                    startX += blocksW + gapCol;
                    startY =
                        this.#startYPos[colIdx] !== undefined
                            ? this.#startYPos[colIdx]
                            : this.#startY;
                    gapRow =
                        this.#rowsGap[colIdx] !== undefined
                            ? this.#rowsGap[colIdx]
                            : this.gapRow();
                    wrapHeight = block.canvasInit.height;
                    if (this.#isNew) {
                        this.#flexItems.width.push(blocksW);
                        this.#flexItems.height.push(blocksH);
                        this.#flexItems.rows.push(row);
                        this.#flexItems.cols.push(1);
                    }
                    blocksW = 0;
                    blocksH = 0;
                    row = 0;
                    flexAdjust = [];
                }
            }
            let endY = block.canvasInit.height;
            let gap = sharedRowGap;
            if (sharedRowGap) {
                if (block.flexShrink())
                    gap = dumpSharedRowGap * block.flexShrink();
                if (idx !== blocks.length - 1)
                    endY -= gap + gapRow;
                else
                    endY -= gap;
                if (endY < 0) {
                    // startY += endY;
                    endY = 0;
                }
            }
            block.canvasInit.y = startY;
            block.canvasInit.x = startX;
            block.canvasInit.height = endY;
            if (block.flexBasis() !== "auto")
                block.canvasInit.height = block.flexBasis();
            if (this.#startXPos[idx] !== undefined)
                block.canvasInit.x = startX + this.#startXPos[idx];
            block.canvasInit.x = startX + this.#startXPos[idx];
            block.__adjustCordinates();
            if (block.flexGrow())
                flexAdjust.push({ idx: idx, grow: block.flexGrow() });
            blocksW =
                blocksW <= block.canvasInit.width
                    ? block.canvasInit.width
                    : blocksW;
            blocksH += block.canvasInit.height;
            startY += gapRow + block.canvasInit.height;
            idx += 1;
            row += 1;
            wrapHeight += gapRow;
        }
        if (this.#isNew) {
            this.#flexItems.width.push(blocksW);
            this.#flexItems.height.push(blocksH);
            this.#flexItems.rows.push(row);
            this.#flexItems.cols.push(1);
            if (this.#isWrap) {
                this.#containerH = Math.max(...this.#flexItems.height);
                this.#containerW = this.#flexItems.width.reduce((p, c) => p + c, 0);
            }
            else {
                this.#containerH = sumHeights;
                this.#containerW = Math.max(...this.#flexItems.width);
            }
        }
        this.#isNew = false;
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
                height += block.canvasInit.height + this.gapRow();
                if (height > this.canvasInit.height) {
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
    #gridLayout() {
        const blocks = this._childs;
        blocks.sort((a, b) => a.options.order - b.options.order);
        let startX = this.#startX;
        let cols = this.gridTemplateColumns() || [0];
        const autoWidths = cols.filter((item) => item !== "auto");
        let rWidth = autoWidths.reduce((p, c) => p + c, 0);
        const diffCol = Math.abs(cols.length - autoWidths.length);
        if (diffCol)
            rWidth = (this.canvasInit.width - rWidth) / diffCol;
        else
            rWidth = this.canvasInit.width / cols.length;
        const autoHeights = this.gridTemplateRows().filter((item) => item !== "auto");
        const nRows = Math.ceil(blocks.length / cols.length);
        let rHeight = autoHeights.reduce((p, c) => p + c, 0);
        const diffRow = Math.abs(nRows - autoHeights.length);
        if (diffRow)
            rHeight = (this.canvasInit.height - rHeight) / diffRow;
        else
            rHeight = this.canvasInit.height / nRows;
        const maxColWidths = [];
        const maxRowHeights = [];
        this.#gridItems.nRows = nRows;
        this.#gridItems.nCols = cols.length;
        for (let colIdx = 0; colIdx < this.#gridItems.nCols; colIdx++) {
            let startY = this.#startY;
            for (let rowIdx = 0; rowIdx < this.#gridItems.nRows; rowIdx++) {
                let colStart = 0;
                let rowStart = 0;
                const idx = (this.#gridItems.nCols - 1) * rowIdx + rowIdx + colIdx;
                const block = blocks[idx];
                if (!block)
                    continue;
                if (maxColWidths[colIdx]) {
                    if (maxColWidths[colIdx] < block.canvasInit.width)
                        maxColWidths[colIdx] = block.canvasInit.width;
                    else if (!this.justifyContent() &&
                        rWidth > maxColWidths[colIdx])
                        maxColWidths[colIdx] = rWidth;
                }
                else
                    maxColWidths.push(block.canvasInit.width);
                if (!maxRowHeights[rowIdx])
                    maxRowHeights.push(block.canvasInit.height);
                if (maxRowHeights[rowIdx] < block.canvasInit.height)
                    maxRowHeights[rowIdx] = block.canvasInit.height;
                else if (!this.alignContent() &&
                    rHeight > maxRowHeights[rowIdx])
                    maxRowHeights[rowIdx] = rHeight;
                let endX = block.canvasInit.width;
                if (cols[colIdx] === "auto" || !cols[colIdx]) {
                    if (endX)
                        colStart = maxColWidths[colIdx];
                    else
                        colStart = endX = rWidth;
                }
                else {
                    colStart = cols[colIdx];
                    if (!endX)
                        endX = colStart;
                }
                let endY = block.canvasInit.height;
                if (this.gridTemplateRows()[rowIdx] === "auto" ||
                    !this.gridTemplateRows()[rowIdx]) {
                    if (endY)
                        rowStart = maxRowHeights[rowIdx];
                    else
                        rowStart = endY = rHeight;
                }
                else {
                    rowStart = this.gridTemplateRows()[rowIdx];
                    if (!endY)
                        endY = rowStart;
                }
                // if(block.options.gridColumnStart && block.options.gridColumnStart !== colIdx) continue
                block.canvasInit.width = endX;
                block.canvasInit.height = endY;
                block.canvasInit.x = startX;
                block.canvasInit.y = startY;
                if (this.#startYPos[idx] !== undefined) {
                    block.canvasInit.y += this.#startYPos[idx];
                    // block.canvasInit.y = block.y() + this.#startYPos[idx];
                }
                if (this.#startXPos[idx]) {
                    block.canvasInit.x += this.#startXPos[idx];
                    // block.canvasInit.x = block.x() + this.#startXPos[idx];
                }
                block.__adjustCordinates();
                startY += rowStart + this.gapRow();
            }
            startX += maxColWidths[colIdx] + this.gapColumn();
            if (this.#isNew)
                this.#gridItems.width.push(maxColWidths[colIdx]);
        }
        if (this.#isNew)
            this.#gridItems.height.push(...maxRowHeights);
        this.#isNew = false;
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
            if (el.options) {
                el.options.zIndex += zIndex;
                zIndex += 1;
            }
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
        if (!block.options)
            return;
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
        const ignore = [
            "layout",
            "alignItems",
            "justifyContent",
            "justifyItems",
            "alignContent",
            "gridTemplateColumns",
            "gridTemplateRows",
        ];
        this.#tree.checkNodes((element) => {
            if (_func)
                _func(element);
            this.#handleOptions(element, ignore);
            if (!(element instanceof Layout))
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
        return (event) => {
            if (event.ctrlKey) {
                if (event.deltaY < 0) {
                    this.context.scale(scale, scale);
                    this.invokeChange((elem) => {
                        elem.canvasInit.x = elem.canvasInit.x * scale;
                        elem.canvasInit.y = elem.canvasInit.y * scale;
                        elem.canvasInit.width = elem.canvasInit.width * scale;
                        elem.canvasInit.height = elem.canvasInit.height * scale;
                    });
                }
                else {
                    this.context.scale(invScale, invScale);
                    this.invokeChange((elem) => {
                        elem.canvasInit.x = elem.canvasInit.x * invScale;
                        elem.canvasInit.y = elem.canvasInit.y * invScale;
                        elem.canvasInit.width = elem.canvasInit.width * invScale;
                        elem.canvasInit.height = elem.canvasInit.height * invScale;
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

// each shape extends form common shape
class Shape extends Block {
    constructor(options) {
        super(options);
        this.options = options;
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
        const fill = this.__cacheOption(opt, "fill", false);
        if (fill)
            this.context.fill(path);
        return fill;
    }
    fillStyle(opt) {
        const fillStyle = this.__cacheOption(opt, "fillStyle", "black");
        this.context.fillStyle = fillStyle;
        return fillStyle;
    }
    stroke(opt, path) {
        const stroke = this.__cacheOption(opt, "stroke", false);
        if (stroke) {
            if (path)
                this.context.stroke(path);
            else
                this.context.stroke();
        }
        return stroke;
    }
    strokeStyle(opt) {
        const strokeStyle = this.__cacheOption(opt, "strokeStyle", "black");
        this.context.strokeStyle = strokeStyle;
        return strokeStyle;
    }
    lineCap(opt) {
        const lineCap = this.__cacheOption(opt, "lineCap", "butt");
        this.context.lineCap = lineCap;
        return lineCap;
    }
    lineWidth(opt) {
        const lineWidth = this.__cacheOption(opt, "lineWidth", 0);
        this.context.lineWidth = lineWidth;
        return lineWidth;
    }
    lineDash(opt) {
        const lineDash = this.__cacheOption(opt, "lineDash", []);
        this.context.setLineDash(lineDash);
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
    bezierCurve({ cpx1, cpy1, cpx2, cpy2, endX, endY, }) {
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
        x = x || this.canvasInit.x;
        y = y || this.canvasInit.y;
        this.context.moveTo(x, y);
    }
    pointInPath({ path, x, y, fillRule }) {
        fillRule = fillRule || "nonzero";
        if (path)
            this.context.isPointInPath(path, x, y, fillRule);
        else
            this.context.isPointInPath(x, y, fillRule);
    }
    pointInStroke({ path, x, y }) {
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
        const fontY = this.height() + this.canvasInit.y;
        this.context.fillText(this.text, this.canvasInit.x, fontY, this.options.maxWidth);
    }
    width(opt) {
        const text_measure = this.measureText();
        opt = opt || text_measure?.width;
        return super.width(opt);
    }
    height(opt) {
        const text_measure = this.measureText();
        opt = opt || text_measure?.hangingBaseline;
        return super.height(opt);
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
        return this.__cacheOption(opt, "fontFamily", "sans-serif");
    }
    fontSize(opt) {
        return this.__cacheOption(opt, "fontSize", "10px");
    }
    fontWeight(opt) {
        return this.__cacheOption(opt, "fontWeight", "normal");
    }
    fontVariant(opt) {
        return this.__cacheOption(opt, "fontVariant", "normal");
    }
    fontStyle(opt) {
        return this.__cacheOption(opt, "fontStyle", "normal");
    }
    fontStretch(opt) {
        const fontStretch = this.__cacheOption(opt, "fontStretch", "normal");
        this.context.fontStretch = fontStretch;
        return fontStretch;
    }
    fontKerning(opt) {
        const fontKerning = this.__cacheOption(opt, "fontKerning", "auto");
        this.context.fontKerning = fontKerning;
        return fontKerning;
    }
    fontVariantCaps(opt) {
        const fontVariantCaps = this.__cacheOption(opt, "fontVariantCaps", "normal");
        this.context.fontVariantCaps = fontVariantCaps;
        return fontVariantCaps;
    }
    wordSpacing(opt) {
        const wordSpacing = this.__cacheOption(`${opt}px`, "wordSpacing", "0px");
        this.context.wordSpacing = wordSpacing;
        return wordSpacing;
    }
    color(opt) {
        const color = this.__cacheOption(opt, "color", "black");
        this.context.fillStyle = color;
        return color;
    }
    strokeWidth(opt) {
        const strokeWidth = this.__cacheOption(opt, "strokeWidth", 0);
        this.context.lineWidth = strokeWidth;
        return strokeWidth;
    }
    strokeColor(opt) {
        const strokeColor = this.__cacheOption(opt, "strokeColor", "black");
        this.context.strokeStyle = strokeColor;
        return strokeColor;
    }
    stroke(opt) {
        const stroke = this.__cacheOption(opt, "stroke", false);
        if (opt) {
            this.setFont();
            this.strokeColor();
            this.strokeWidth();
            this.options.height = this.height();
            const fontY = this.height() + this.canvasInit.y;
            this.context.strokeText(this.text, this.canvasInit.x, fontY, this.options?.maxWidth);
        }
        return stroke;
    }
    direction(opt) {
        const direction = this.__cacheOption(opt, "direction", "ltr");
        this.context.direction = direction;
        return direction;
    }
    letterSpacing(opt) {
        const letterSpacing = this.__cacheOption(opt, "letterSpacing", "0px");
        this.context.letterSpacing = letterSpacing;
        return letterSpacing;
    }
    textRendering(opt) {
        const textRendering = this.__cacheOption(opt, "textRendering", "auto");
        this.context.textRendering = textRendering;
        return textRendering;
    }
    textAlign(opt) {
        const textAlign = this.__cacheOption(opt, "textAlign", "start");
        this.context.align = textAlign;
        return textAlign;
    }
    textBaseline(opt) {
        const textBaseline = this.__cacheOption(opt, "textBaseline", "alphabetic");
        this.context.baseline = textBaseline;
        return textBaseline;
    }
    find(queries) {
        return this.filterNodes(queries);
    }
    // @return: text width in pixels
    measureText() {
        return this.context?.measureText(this.text);
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

class Rectangle extends Shape {
    constructor(options) {
        super(options);
        this.options = options;
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
            x: this.canvasInit.x,
            y: this.canvasInit.y,
            width: this.canvasInit.width,
            height: this.canvasInit.height,
            borderRadius: this.borderRadius() || [0],
        });
    }
    borderRadius(opt) {
        return this.__cacheOption(opt, "borderRadius", undefined);
    }
    backgroundColor(opt) {
        super.fillStyle(opt);
        return this.__cacheOption(opt, "backgroundColor", "black");
    }
    border(opt) {
        const border = this.__cacheOption(opt, "border", "");
        this.options.stroke = true;
        const { borderStyleArrWidth } = this.#borderParser(border);
        if (this.borderStyle() === "dotted") {
            this.lineDash(borderStyleArrWidth);
        }
        return border;
    }
    borderWidth(opt) {
        const borderWidth = this.__cacheOption(opt, "borderWidth", 0);
        super.lineWidth(borderWidth);
        return borderWidth;
    }
    borderColor(opt) {
        const borderColor = this.__cacheOption(opt, "borderColor", "");
        super.strokeStyle(borderColor);
        return this.options.borderColor;
    }
    borderStyle(opt) {
        return this.__cacheOption(opt, "borderStyle", "dotted");
    }
    borderTop(opt) {
        const borderTop = this.__cacheOption(opt, "borderRight", "");
        this.options.stroke = true;
        let { borderStyleArrWidth } = this.#borderParser(borderTop);
        borderStyleArrWidth.pop();
        if (this.borderStyle() === "dotted") {
            this.lineDash([
                ...borderStyleArrWidth,
                this.canvasInit.height * 2 + this.canvasInit.width,
            ]);
        }
        else {
            this.lineDash([
                this.canvasInit.width,
                this.canvasInit.width + 2 * this.canvasInit.height,
                0,
                0,
            ]);
        }
        return borderTop;
    }
    borderRight(opt) {
        const borderRight = this.__cacheOption(opt, "borderRight", "");
        this.options.stroke = true;
        const { borderStyleArrHeight } = this.#borderParser(borderRight);
        borderStyleArrHeight.pop();
        if (this.borderStyle() === "dotted") {
            this.lineDash([
                0,
                this.canvasInit.width,
                ...borderStyleArrHeight,
                this.canvasInit.width + this.canvasInit.height,
            ]);
        }
        else if (this.borderStyle() === "solid") {
            this.lineDash([
                0,
                this.canvasInit.width,
                this.canvasInit.height,
                this.canvasInit.width + this.canvasInit.height,
            ]);
        }
        return borderRight;
    }
    borderBottom(opt) {
        const borderBottom = this.__cacheOption(opt, "borderBottom", "");
        this.options.stroke = true;
        let { borderStyleArrWidth } = this.#borderParser(borderBottom);
        if (this.borderStyle() === "dotted") {
            this.lineDash([
                0,
                this.canvasInit.width + this.canvasInit.height,
                ...borderStyleArrWidth,
            ]);
        }
        else if (this.borderStyle() === "solid") {
            this.lineDash([
                0,
                this.canvasInit.width + this.canvasInit.height,
                this.canvasInit.width,
                0,
            ]);
        }
        return borderBottom;
    }
    borderLeft(opt) {
        const borderLeft = this.__cacheOption(opt, "borderLeft", "");
        this.options.stroke = true;
        let { borderStyleArrHeight } = this.#borderParser(borderLeft);
        if (this.borderStyle() === "dotted") {
            this.lineDash([
                0,
                this.canvasInit.width * 2 + this.canvasInit.height,
                ...borderStyleArrHeight,
            ]);
        }
        else if (this.borderStyle() === "solid") {
            this.lineDash([
                0,
                this.canvasInit.width * 2 + this.canvasInit.height,
                this.canvasInit.height,
                this.canvasInit.width,
            ]);
        }
        return borderLeft;
    }
    // border size, style(required), color
    #borderParser(obj) {
        const border = obj?.split(" ") || [];
        // need to impliment css unit converter for different size, ex, px, em, rem etc.
        const borderWidth = Number(border[0]);
        const borderStyle = border[1];
        const borderColor = border[2];
        const borderStyleArrWidth = [];
        const borderStyleArrHeight = [];
        if (borderStyle === "dotted") {
            let total = 0;
            const step = this.canvasInit.width / (this.canvasInit.width / 4);
            while (total < this.canvasInit.width) {
                borderStyleArrWidth.push(step, step);
                total += step * 2;
            }
            total = 0;
            const stepHeight = this.canvasInit.height / (this.canvasInit.height / 4);
            while (total < this.canvasInit.height) {
                borderStyleArrHeight.push(stepHeight, stepHeight, stepHeight, stepHeight);
                total += stepHeight * 2;
            }
        }
        this.borderWidth(borderWidth);
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

class Ellipse extends Shape {
    constructor(options) {
        super(options);
        this.options = options;
        Ellipse.prototype.draggable = Shape.prototype.draggable;
    }
    __initSet() {
        super.__initSet();
    }
    __drawInit() {
        this.beginPath();
        this.backgroundColor();
        // cordinates need to calculate related to radius x and radius y
        this.context.ellipse(this.canvasInit.x, this.canvasInit.y, this.options.radiusX, this.options.radiusY, this.options.rotation, 0, 2 * Math.PI);
        this.fill();
        this.stroke();
    }
    backgroundColor(opt) {
        this.options.backgroundColor = super.fillStyle(opt);
        return this.options.backgroundColor;
    }
}

class Circle extends Shape {
    constructor(options) {
        super(options);
        this.options = options;
    }
    __initSet() {
        super.__initSet();
    }
    __drawInit() {
        this.beginPath();
        this.backgroundColor();
        const x = this.canvasInit.x + this.options.radius;
        const y = this.canvasInit.y + this.options.radius;
        let endAngle;
        if (!this.options.endAngle)
            endAngle = Math.PI * 2;
        this.context.arc(x, y, this.options.radius, this.options.startAngle, endAngle);
        super.fill();
        super.stroke();
    }
    radius(opt) {
        return this.__cacheOption(opt, "radius", 0);
    }
    startAngle(opt) {
        return this.__cacheOption(opt, "startAngle", 0);
    }
    endAngle(opt) {
        return this.__cacheOption(opt, "endAngle", 0);
    }
    width(opt) {
        this.options.radius = this.options.radius || this.canvasInit.width;
        return this.options.radius;
    }
    height(opt) {
        this.options.radius = this.options.radius || this.canvasInit.height;
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

class Line extends Shape {
    joinTo = undefined;
    path;
    #beforeX;
    #beforeY;
    constructor(options) {
        super(options);
        this.options = options;
        this.#beforeX = this.x();
        this.#beforeY = this.y();
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
            this.path.path.moveTo(this.canvasInit.x, this.canvasInit.y);
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
        const diffX = this.x() - this.#beforeX;
        if (diffX !== 0) {
            endX += diffX;
            if (cpx1)
                cpx1 += diffX;
            if (cpx2)
                cpx2 += diffX;
            this.#beforeX = this.x();
        }
        const diffY = this.y() - this.#beforeY;
        if (diffY !== 0) {
            endY += diffY;
            if (cpy1)
                cpy1 += diffY;
            if (cpy2)
                cpy2 += diffY;
            this.#beforeY = this.y();
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
    strokeWidth(opt) {
        const strokeWidth = this.__cacheOption(opt, "strokeWidth", 1);
        this.options.strokeWidth = super.lineWidth(strokeWidth);
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

export { Block, Canvas, CanvasDOMManager, Circle, Ellipse, Layout, Line, Rectangle, Shape, TextBlock };
