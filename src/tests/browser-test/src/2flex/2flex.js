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
    #isTransparent = false;
    constructor(canvasId, width, height) {
        this.canvasId = canvasId;
        this.width = width;
        this.height = height;
    }
    get context() {
        return this.canvas.getContext("2d", { alpha: this.#isTransparent });
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
        canvas.tabIndex = 0;
        const body = document.querySelector("body");
        body.appendChild(canvas);
    }
    changeStyle(options) {
        if (options !== undefined)
            for (const [key, value] of Object.entries(options)) {
                if (key === "backgroundColor" && value === "transparent")
                    this.#isTransparent = true;
                if (Object.hasOwn(this.canvas.style, key))
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

class Canvas {
    __domCanvas;
    options;
    #canvasEvents = {
        click: [],
        dbclick: [],
        mousedown: [],
        mouseup: [],
        mousemove: [],
        mouseenter: [],
        mouseleave: [],
        mouseout: [],
        mouseover: [],
    };
    canvasId;
    width;
    height;
    clipping_path;
    #tree = new Tree();
    #zoomSpeed = 1.2;
    #zoomInvSpeed = 0.8;
    #moveSpeed = 10;
    #animationStarted = false;
    currentCursor = "auto";
    __positionCords = { x: 0, y: 0 };
    #animations = [];
    constructor(canvasId, width, height, options) {
        this.canvasId = canvasId || "canvas";
        this.options = options;
        this.width = width || 300;
        this.height = height || 300;
        this.clipping_path = new Path();
        this.__domCanvas = new CanvasDOMManager(this.canvasId, this.width, this.height);
        this.#initCanvas();
    }
    get context() {
        return this.__domCanvas.context;
    }
    get canvas() {
        return this.__domCanvas.canvas;
    }
    #initCanvas() {
        this.canvas;
        this.context.save();
        window.onload = () => {
            if (this.options) {
                this.__domCanvas.changeStyle(this.options);
                if (this.options.move == "mouse") {
                    this.#handMove();
                }
                else if (this.options.move == "keyboard") {
                    this.#keyboardMove();
                }
                else {
                    this.#keyboardMove();
                    this.#handMove();
                }
                if (this.options.zoom == "point") {
                    this.#pointZoom();
                }
                else
                    this.#centerZoom();
            }
        };
    }
    add(...block) {
        this.#tree.addNodes(block);
        this.#tree.preOrderTraversal((element) => {
            element.canvas = this;
            this.#handleOptions(element);
            element.__initSet();
            this.#animations.push(...element.__animationOn);
            for (const key in element.__events) {
                this.#canvasEvents[key].push(...element.__events[key]);
            }
        });
        if (this.#animations.length !== 0)
            this.animationInvoker(this.#animations);
        let zIndex = 0;
        this.#tree.checkNodes((el) => {
            if (el.options) {
                el.canvasInit.zIndex = el.options.zIndex || 0 + zIndex;
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
        return { x, y };
    }
    #handleEvents() {
        // added unique events because canvas is same, but events changing
        for (const key in this.#canvasEvents) {
            if (this.#canvasEvents[key].length !== 0) {
                this.__domCanvas.addEventListener(key, (event) => {
                    for (const func of this.#canvasEvents[key]) {
                        func(event);
                    }
                });
            }
        }
    }
    #handleOptions(block, ignore) {
        if (!block.options)
            return;
        if (block.options["hidden"]) {
            const proto = Object.getPrototypeOf(block);
            const obj = Object.getOwnPropertyDescriptor(proto, "hidden");
            obj?.value.call(block, block.options["hidden"]);
            return;
        }
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
    // not need to invoke every options, need to take a considiration of the mouse events also
    invokeChange(_func) {
        // need to make for invidiual change rather than creating this path
        this.clipping_path.createPath();
        this.context.restore();
        this.context.save();
        this.clearRect();
        this.context.translate(this.__positionCords.x, this.__positionCords.y);
        this.#tree.checkNodes((element) => {
            if (_func)
                _func(element);
            // this.#handleOptions(element, ignore);
            element.__initSet();
        });
        // if (!this.#animationStarted) this.animator();
    }
    animationInvoker(animations) {
        function framer(timestemps) {
            for (let anime of animations) {
                anime(timestemps);
            }
            requestAnimationFrame(framer);
        }
        requestAnimationFrame(framer);
    }
    // we can do this later as and || or
    find(queries) {
        return this.#tree.filterNodes(queries);
    }
    #pointZoom() {
        const moveSpeed = this.options?.moveSpeed || this.#moveSpeed;
        this.__domCanvas.addEventListener("wheel", (event) => {
            if (event.ctrlKey) {
                const { x, y } = this.getCursorPosition(event);
                let scale = this.options?.zoomSpeed || this.#zoomSpeed;
                let invScale = this.options?.zoomInvSpeed || this.#zoomInvSpeed;
                if (event.deltaY < 0) {
                    this.invokeChange((elem) => {
                        elem.canvasInit.width *= scale;
                        elem.canvasInit.height *= scale;
                    });
                }
                else {
                    this.invokeChange((elem) => {
                        elem.canvasInit.width *= invScale;
                        elem.canvasInit.height *= invScale;
                    });
                }
                if (this.canvas.width / 2 < x && this.__positionCords.x < x)
                    this.__positionCords.x -= moveSpeed;
                else
                    this.__positionCords.x += moveSpeed;
                if (this.canvas.height / 2 < y && this.__positionCords.y < y)
                    this.__positionCords.y -= moveSpeed;
                else
                    this.__positionCords.y += moveSpeed;
            }
        });
    }
    #centerZoom() {
        const moveSpeed = this.options?.moveSpeed || this.#moveSpeed;
        this.__domCanvas.addEventListener("wheel", (event) => {
            if (event.ctrlKey) {
                let scale = this.options?.zoomSpeed || this.#zoomSpeed;
                let invScale = this.options?.zoomInvSpeed || this.#zoomInvSpeed;
                if (event.deltaY < 0) {
                    this.__positionCords.x -= moveSpeed;
                    this.__positionCords.y -= moveSpeed;
                    this.invokeChange((elem) => {
                        elem.canvasInit.width *= scale;
                        elem.canvasInit.height *= scale;
                    });
                }
                else {
                    this.__positionCords.x += moveSpeed;
                    this.__positionCords.y += moveSpeed;
                    this.invokeChange((elem) => {
                        elem.canvasInit.width *= invScale;
                        elem.canvasInit.height *= invScale;
                    });
                }
            }
        });
    }
    clearRect() {
        this.context.clearRect(0, 0, this.width, this.height);
    }
    chageCursor(cur) {
        cur = cur || "auto";
        return this.__domCanvas.changeStyle({
            cursor: cur,
        });
    }
    #handMove() {
        let initX = 0;
        let initY = 0;
        let beforeX = 0;
        let beforeY = 0;
        let isMouseDown = false;
        let isKeyDown = false;
        this.__domCanvas.canvas.focus();
        this.__domCanvas.addEventListener("keydown", (event) => {
            if (event.code == "Space") {
                if (!isKeyDown) {
                    this.__domCanvas.changeStyle({ cursor: "grab" });
                    isKeyDown = true;
                }
            }
        });
        this.__domCanvas.addEventListener("mousemove", (event) => {
            if (event.buttons == 0) {
                isMouseDown = false;
                if (isKeyDown)
                    this.__domCanvas.changeStyle({ cursor: "grab" });
            }
            if (event.buttons == 1 && isKeyDown) {
                if (!isMouseDown) {
                    initX = event.clientX;
                    initY = event.clientY;
                    beforeX = 0;
                    beforeY = 0;
                    isMouseDown = true;
                }
                if (isMouseDown) {
                    this.__domCanvas.changeStyle({
                        cursor: "grabbing",
                    });
                    let diffX = event.clientX - initX;
                    let diffY = event.clientY - initY;
                    if (diffX !== 0) {
                        this.__positionCords.x += diffX - beforeX;
                        beforeX = diffX;
                    }
                    if (diffY !== 0) {
                        this.__positionCords.y += diffY - beforeY;
                        beforeY = diffY;
                    }
                    this.invokeChange();
                }
            }
        });
        this.__domCanvas.addEventListener("keyup", (event) => {
            this.__domCanvas.changeStyle({ cursor: "auto" });
            isKeyDown = false;
        });
    }
    #keyboardMove() {
        const moveSpeed = this.options?.moveSpeed || this.#moveSpeed;
        this.__domCanvas.addEventListener("wheel", (event) => {
            if (event.ctrlKey) {
                return;
            }
            if (event.shiftKey) {
                if (event.deltaY < 0) {
                    this.__positionCords.x -= moveSpeed;
                }
                else {
                    this.__positionCords.x += moveSpeed;
                }
            }
            else {
                if (event.deltaY < 0) {
                    this.__positionCords.y += moveSpeed;
                }
                else {
                    this.__positionCords.y -= moveSpeed;
                }
            }
            this.invokeChange();
        });
    }
}

function fromVW(from, canvasW) {
    return (from * canvasW) / 100;
}
function fromVH(from, canvasH) {
    return (from * canvasH) / 100;
}
function checkInBound(pointX, pointY, px1, py1, px2, py2, px3, py3, px4, py4) {
    if (
    // top
    (pointX - px1) * (py2 - py1) - (pointY - py1) * (px2 - px1) <= 0 &&
        // bottom
        (pointX - px3) * (py4 - py3) - (pointY - py3) * (px4 - px3) >= 0 &&
        // left
        (pointX - px1) * (py3 - py1) - (pointY - py1) * (px3 - px1) >= 0 &&
        // right
        (pointX - px2) * (py4 - py2) - (pointY - py2) * (px4 - px2) <= 0)
        return true;
    return false;
}
function getRadiusByWH(width, height) {
    return Math.sqrt(height ** 2 + width ** 2) / 2;
}
function radianToDegree(rad) {
    return (rad * 180) / Math.PI;
}
function degreeToRadian(rad) {
    return (rad * Math.PI) / 180;
}
// This is based on `WebCore/platform/graphics/UnitBezier.h` in WebKit.
function cubicBezier(p1x, p1y, p2x, p2y, t, duration) {
    const cx = 3 * p1x, bx = 3 * (p2x - p1x) - cx, ax = 1 - cx - bx, cy = 3 * p1y, by = 3 * (p2y - p1y) - cy, ay = 1 - cy - by;
    function sampleCurveX(t) {
        return ((ax * t + bx) * t + cx) * t;
    }
    function solve(x, epsilon) {
        let t = solveCurveX(x, epsilon);
        return ((ay * t + by) * t + cy) * t;
    }
    function solveCurveX(x, epsilon) {
        let t0, t1, t2, x2, d2, i;
        for (t2 = x, i = 0; i < 8; i++) {
            x2 = sampleCurveX(t2) - x;
            if (Math.abs(x2) < epsilon) {
                return t2;
            }
            d2 = (3 * ax * t2 + 2 * bx) * t2 + cx;
            if (Math.abs(d2) < 1e-6) {
                break;
            }
            t2 = t2 - x2 / d2;
        }
        t0 = 0;
        t1 = 1;
        t2 = x;
        if (t2 < t0) {
            return t0;
        }
        if (t2 > t1) {
            return t1;
        }
        while (t0 < t1) {
            x2 = sampleCurveX(t2);
            if (Math.abs(x2 - x) < epsilon) {
                return t2;
            }
            if (x > x2) {
                t0 = t2;
            }
            else {
                t1 = t2;
            }
            t2 = (t1 - t0) / 2 + t0;
        }
        return t2;
    }
    return solve(t, duration);
}

// Each element in the canvas is block
// each Block is Node
class Block extends Node {
    canvas;
    options;
    __events = {
        click: [],
        dbclick: [],
        mousedown: [],
        mouseup: [],
        mousemove: [],
        mouseenter: [],
        mouseleave: [],
        mouseout: [],
        mouseover: [],
    };
    // (x,y) as top left, top right, bottom left, bottom right.
    corners = [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
    ];
    canvasInit = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        zIndex: 0,
    };
    styleChanges = [];
    beforeInit = this.canvasInit;
    #boundries = this.canvasInit;
    #keyframeIterations = {};
    #lastAnimationId = 0;
    __animationOn = [];
    #isPosApplied = false;
    #center = { x: 0, y: 0 };
    #runningEvents = { drag: false, rotate: false, resize: false };
    hotAreaCorners = [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
    ];
    hotAreaRotCorners = [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
    ];
    hotAreas = {
        hotCornerTopLeft: {
            _func: null,
            x: 0,
            y: 0,
        },
        hotCornerTopRight: {
            _func: null,
            x: 0,
            y: 0,
        },
        hotCornerBottomLeft: {
            _func: null,
            x: 0,
            y: 0,
        },
        hotCornerBottomRight: {
            _func: null,
            x: 0,
            y: 0,
        },
        hotTop: {
            _func: null,
            x: 0,
            y: 0,
        },
        hotLeft: {
            _func: null,
            x: 0,
            y: 0,
        },
        hotRight: {
            _func: null,
            x: 0,
            y: 0,
        },
        hotBottom: {
            _func: null,
            x: 0,
            y: 0,
        },
    };
    #rotateDegree = 0;
    __filters = [];
    constructor(options) {
        super();
        this.options = options || {};
        this.padding();
        this.margin();
        this.canvasInit["x"] = this.x() + this.marginLeft();
        this.canvasInit["y"] = this.y() + this.marginTop();
        this.canvasInit["width"] =
            this.width() + this.paddingLeft() + this.paddingRight();
        this.canvasInit["height"] =
            this.height() + this.paddingTop() + this.paddingBottom();
        this.__updateCornerCords();
        this.beforeInit = {
            x: this.canvasInit.x,
            y: this.canvasInit.y,
            width: this.canvasInit.width,
            height: this.canvasInit.height,
        };
        const centerX = this.rotationCenterX() || this.canvasInit.width / 2;
        const centerY = this.rotationCenterY() || this.canvasInit.height / 2;
        this.#center = {
            x: this.canvasInit.x + centerX,
            y: this.canvasInit.y + centerY,
        };
        this.#boundries = this.beforeInit;
    }
    __initSet() {
        if (this.hidden())
            return;
        this.context.filter = this.__filters.join(" ");
        const pos = this.position();
        if (pos === "fixed" && !this.options.draggable) {
            if (this.options.top) {
                this.canvasInit.y =
                    -this.canvas.__positionCords.y + this.options.top;
            }
            else if (this.options.bottom) {
                this.canvasInit.y =
                    -this.canvas.__positionCords.y +
                        Math.abs(this.canvas.height - this.canvasInit.height);
                -this.options.bottom;
            }
            if (this.options.left) {
                this.canvasInit.x =
                    -this.canvas.__positionCords.x + this.left();
            }
            else if (this.options.right) {
                this.canvasInit.x =
                    -this.canvas.__positionCords.x +
                        Math.abs(this.canvas.width - this.canvasInit.width) -
                        this.options.right;
            }
        }
        if (pos === "sticky" && !this.options.draggable) {
            if (this.canvas.__positionCords.y < 0) {
                if (this.options.top &&
                    this.canvas.__positionCords.y <=
                        Math.abs(this.canvas.height - this.canvasInit.height) -
                            this.canvasInit.y) {
                    this.canvasInit.y =
                        -this.canvas.__positionCords.y + this.options.top;
                }
            }
            else {
                if (this.options.bottom &&
                    this.canvas.__positionCords.y + this.options.bottom >=
                        Math.abs(this.canvas.height - this.canvasInit.height) -
                            Math.abs(this.canvasInit.y)) {
                    this.canvasInit.y =
                        -this.canvas.__positionCords.y +
                            Math.abs(this.canvas.height - this.canvasInit.height) -
                            this.options.bottom;
                }
            }
            if (this.canvas.__positionCords.x < 0) {
                if (this.options.left &&
                    this.canvas.__positionCords.x <=
                        Math.abs(this.canvas.width - this.canvasInit.width) -
                            this.canvasInit.x) {
                    this.canvasInit.x =
                        -this.canvas.__positionCords.x + this.options.left;
                }
            }
            else {
                const diffX = Math.abs(this.canvas.width - this.canvasInit.width);
                if (this.options.right &&
                    this.canvas.__positionCords.x + this.options.right >=
                        diffX - Math.abs(this.canvasInit.x)) {
                    this.canvasInit.x =
                        -this.canvas.__positionCords.x +
                            diffX -
                            this.options.right;
                }
            }
        }
        if (pos === "absolute" && !this.#isPosApplied) {
            if (this.options.left !== undefined)
                this.canvasInit.x = this.options.left;
            else if (this.options.right !== undefined)
                this.canvasInit.x =
                    Math.abs(this.canvas.width - this.width()) -
                        this.options.right;
            if (this.options.top !== undefined)
                this.canvasInit.y = this.options.top;
            else if (this.options.bottom !== undefined)
                this.canvasInit.y =
                    Math.abs(this.canvas.height - this.height()) -
                        this.options.bottom;
            this.#isPosApplied = true;
        }
        if (pos === "relative" && !this.#isPosApplied) {
            if (this.options.left !== undefined)
                this.canvasInit.x += this.options.left;
            else if (this.options.right !== undefined)
                this.canvasInit.x -= this.options.right;
            if (this.options.top !== undefined)
                this.canvasInit.y += this.options.top;
            else if (this.options.bottom !== undefined)
                this.canvasInit.y -= this.options.bottom;
            this.#isPosApplied = true;
        }
        if (this.#rotateDegree !== 0) {
            this.context.translate(this.#center.x, this.#center.y);
            this.context.rotate((this.#rotateDegree * Math.PI) / 180);
            this.context.translate(-this.#center.x, -this.#center.y);
        }
        else {
            this.context.setTransform(1, 0, 0, 1, 0, 0);
        }
        this.hotLines();
    }
    get context() {
        return this.canvas?.context;
    }
    __updateCornerCords() {
        const gap = this.hotAreaGap();
        const ggap = 20;
        this.corners[0][0] = this.corners[2][0] = this.canvasInit.x;
        this.corners[1][1] = this.corners[0][1] = this.canvasInit.y;
        this.corners[1][0] = this.corners[3][0] =
            this.canvasInit.x + this.canvasInit.width;
        this.corners[3][1] = this.corners[2][1] =
            this.canvasInit.y + this.canvasInit.height;
        this.hotAreaCorners[2][0] = this.hotAreaCorners[0][0] =
            this.canvasInit.x - gap;
        this.hotAreaCorners[1][1] = this.hotAreaCorners[0][1] =
            this.canvasInit.y - gap;
        this.hotAreaCorners[3][0] = this.hotAreaCorners[1][0] =
            this.canvasInit.x + this.canvasInit.width + gap;
        this.hotAreaCorners[3][1] = this.hotAreaCorners[2][1] =
            this.canvasInit.y + this.canvasInit.height + gap;
        this.hotAreaRotCorners[2][0] = this.hotAreaRotCorners[0][0] =
            this.hotAreaCorners[0][0] - ggap;
        this.hotAreaRotCorners[1][1] = this.hotAreaRotCorners[0][1] =
            this.hotAreaCorners[0][1] - ggap;
        this.hotAreaRotCorners[3][0] = this.hotAreaRotCorners[1][0] =
            this.hotAreaCorners[1][0] + ggap;
        this.hotAreaRotCorners[3][1] = this.hotAreaRotCorners[2][1] =
            this.hotAreaCorners[2][1] + ggap;
    }
    hotTop(_func) {
        this.hotAreas["hotTop"]["_func"] = _func;
    }
    hotLeft(_func) {
        this.hotAreas["hotLeft"]["_func"] = _func;
    }
    hotRight(_func) {
        this.hotAreas["hotRight"]["_func"] = _func;
    }
    hotBottom(_func) {
        this.hotAreas["hotBottom"]["_func"] = _func;
    }
    hotCornerTopLeft(_func) {
        this.hotAreas["hotCornerTopLeft"]["_func"] = _func;
    }
    hotCornerTopRight(_func) {
        this.hotAreas["hotCornerTopRight"]["_func"] = _func;
    }
    hotCornerBottomLeft(_func) {
        this.hotAreas["hotCornerBottomLeft"]["_func"] = _func;
    }
    hotCornerBottomRight(_func) {
        this.hotAreas["hotCornerBottomRight"]["_func"] = _func;
    }
    hotLines() {
        const size = this.hotCornerSize();
        const gap = this.hotAreaGap();
        const radius = this.hotCornerRadius();
        const strokeWidth = this.hotCornerStrokeWidth();
        const strokeColor = this.hotCornerStrokeColor();
        const background = this.hotCornerBackgroundColor();
        const lineWidth = this.hotLineStrokeWidth();
        const lineColor = this.hotLineStrokeColor();
        this.hotAreas["hotCornerBottomLeft"]["x"] = this.hotAreas["hotCornerTopLeft"]["x"] = this.canvasInit.x - gap;
        this.hotAreas["hotCornerTopRight"]["y"] = this.hotAreas["hotCornerTopLeft"]["y"] = this.canvasInit.y - gap;
        this.hotAreas["hotCornerBottomRight"]["x"] = this.hotAreas["hotCornerTopRight"]["x"] = this.canvasInit.x + this.canvasInit.width + gap;
        this.hotAreas["hotCornerBottomRight"]["y"] = this.hotAreas["hotCornerBottomLeft"]["y"] = this.canvasInit.y + this.canvasInit.height + gap;
        this.context.beginPath();
        this.context.moveTo(this.hotAreas["hotCornerTopLeft"]["x"], this.hotAreas["hotCornerTopLeft"]["y"]);
        if (!this.hotAreas["hotTop"]["_func"]) {
            this.context.lineTo(this.hotAreas["hotCornerTopRight"]["x"], this.hotAreas["hotCornerTopRight"]["y"]);
            this.context.lineWidth = lineWidth;
            this.context.strokeStyle = lineColor;
            this.context.stroke();
        }
        this.context.beginPath();
        this.context.moveTo(this.hotAreas["hotCornerTopLeft"]["x"], this.hotAreas["hotCornerTopLeft"]["y"]);
        if (!this.hotAreas["hotLeft"]["_func"]) {
            this.context.lineTo(this.hotAreas["hotCornerBottomLeft"]["x"], this.hotAreas["hotCornerBottomLeft"]["y"]);
            this.context.lineWidth = lineWidth;
            this.context.strokeStyle = lineColor;
            this.context.stroke();
        }
        this.context.beginPath();
        this.context.moveTo(this.hotAreas["hotCornerBottomLeft"]["x"], this.hotAreas["hotCornerBottomLeft"]["y"]);
        if (!this.hotAreas["hotBottom"]["_func"]) {
            this.context.lineTo(this.hotAreas["hotCornerBottomRight"]["x"], this.hotAreas["hotCornerBottomRight"]["y"]);
            this.context.lineWidth = lineWidth;
            this.context.strokeStyle = lineColor;
            this.context.stroke();
        }
        this.context.beginPath();
        this.context.moveTo(this.hotAreas["hotCornerBottomRight"]["x"], this.hotAreas["hotCornerBottomRight"]["y"]);
        if (!this.hotAreas["hotRight"]["_func"]) {
            this.context.lineTo(this.hotAreas["hotCornerTopRight"]["x"], this.hotAreas["hotCornerTopRight"]["y"]);
            this.context.lineWidth = lineWidth;
            this.context.strokeStyle = lineColor;
            this.context.stroke();
        }
        this.context.beginPath();
        if (!this.hotAreas["hotCornerTopLeft"]["_func"]) {
            this.context.roundRect(this.hotAreas["hotCornerTopLeft"]["x"] - size / 2, this.hotAreas["hotCornerTopLeft"]["y"] - size / 2, size, size, radius);
            this.context.lineWidth = strokeWidth;
            this.context.strokeStyle = strokeColor;
            this.context.fillStyle = background;
            this.context.fill();
            this.context.stroke();
        }
        else {
            this.hotAreas["hotCornerTopLeft"]["_func"](this.context);
        }
        this.context.beginPath();
        if (!this.hotAreas["hotCornerTopRight"]["_func"]) {
            this.context.roundRect(this.hotAreas["hotCornerTopRight"]["x"] - size / 2, this.hotAreas["hotCornerTopRight"]["y"] - size / 2, size, size, radius);
            this.context.lineWidth = strokeWidth;
            this.context.strokeStyle = strokeColor;
            this.context.fillStyle = background;
            this.context.fill();
            this.context.stroke();
        }
        else {
            this.hotAreas["hotCornerTopRight"]["_func"](this.context);
        }
        this.context.beginPath();
        if (!this.hotAreas["hotCornerBottomLeft"]["_func"]) {
            this.context.roundRect(this.hotAreas["hotCornerBottomLeft"]["x"] - size / 2, this.hotAreas["hotCornerBottomLeft"]["y"] - size / 2, size, size, radius);
            this.context.lineWidth = strokeWidth;
            this.context.strokeStyle = strokeColor;
            this.context.fillStyle = background;
            this.context.fill();
            this.context.stroke();
        }
        else {
            this.hotAreas["hotCornerBottomLeft"]["_func"](this.context);
        }
        this.context.beginPath();
        if (!this.hotAreas["hotCornerBottomRight"]["_func"]) {
            this.context.roundRect(this.hotAreas["hotCornerBottomRight"]["x"] - size / 2, this.hotAreas["hotCornerBottomRight"]["y"] - size / 2, size, size, radius);
            this.context.lineWidth = strokeWidth;
            this.context.strokeStyle = strokeColor;
            this.context.fillStyle = background;
            this.context.fill();
            this.context.stroke();
        }
        else {
            this.hotAreas["hotCornerBottomRight"]["_func"](this.context);
        }
    }
    rotationCenterX(opt) {
        return this.__cacheOption(opt, "rotationCenterX", undefined);
    }
    rotationCenterY(opt) {
        return this.__cacheOption(opt, "rotationCenterY", undefined);
    }
    rotationTopLeft(opt) {
        return this.__cacheOption(opt, "rotationTopLeft", true);
    }
    rotationTopRight(opt) {
        return this.__cacheOption(opt, "rotationTopRight", true);
    }
    rotationBottomLeft(opt) {
        return this.__cacheOption(opt, "rotationBottomLeft", true);
    }
    rotationBottomRight(opt) {
        return this.__cacheOption(opt, "rotationBottomRight", true);
    }
    resizeTopLeft(opt) {
        return this.__cacheOption(opt, "resizeTopLeft", true);
    }
    resizeTopRight(opt) {
        return this.__cacheOption(opt, "resizeTopRight", true);
    }
    resizeBottomLeft(opt) {
        return this.__cacheOption(opt, "resizeBottomLeft", true);
    }
    resizeBottomRight(opt) {
        return this.__cacheOption(opt, "resizeBottomRight", true);
    }
    resizeTop(opt) {
        return this.__cacheOption(opt, "resizeTop", true);
    }
    resizeLeft(opt) {
        return this.__cacheOption(opt, "resizeLeft", true);
    }
    resizeRight(opt) {
        return this.__cacheOption(opt, "resizeRight", true);
    }
    resizeBottom(opt) {
        return this.__cacheOption(opt, "resizeBottom", true);
    }
    rotatable(opt) {
        const rotatable = this.__cacheOption(opt, "rotatable", true);
        if (!rotatable)
            return false;
        let isMouseDown = false;
        let topMove = false;
        let leftMove = false;
        let startRotX = 0;
        let startRotY = 0;
        let otherStartX = 0;
        let otherStartY = 0;
        const mousemove = (event) => {
            if (this.#runningEvents.drag || this.#runningEvents.resize)
                return;
            let cursor = undefined;
            let { x, y } = this.canvas.getCursorPosition(event);
            if (event.buttons == 0) {
                isMouseDown = false;
                this.#runningEvents.rotate = false;
            }
            const R = getRadiusByWH(this.canvasInit.width, this.canvasInit.height);
            if (!isMouseDown) {
                if (event.buttons === 1) {
                    isMouseDown = true;
                    this.#runningEvents.rotate = true;
                }
                const ltx = this.hotAreaCorners[0][0];
                const lty = this.hotAreaCorners[0][1];
                const rtx = this.hotAreaCorners[1][0];
                const rty = this.hotAreaCorners[1][1];
                const lbx = this.hotAreaCorners[2][0];
                const lby = this.hotAreaCorners[2][1];
                const rbx = this.hotAreaCorners[3][0];
                const rby = this.hotAreaCorners[3][1];
                const hltx = this.hotAreaRotCorners[0][0];
                const hlty = this.hotAreaRotCorners[0][1];
                const hrtx = this.hotAreaRotCorners[1][0];
                const hrty = this.hotAreaRotCorners[1][1];
                const hlbx = this.hotAreaRotCorners[2][0];
                const hlby = this.hotAreaRotCorners[2][1];
                const hrbx = this.hotAreaRotCorners[3][0];
                const hrby = this.hotAreaRotCorners[3][1];
                if (checkInBound(x, y, hltx, hlty, ltx, hlty, hltx, lty, ltx, lty) &&
                    this.rotationTopLeft()) {
                    cursor = "cell";
                    topMove = true;
                    leftMove = true;
                    startRotX = this.corners[0][0];
                    startRotY = this.corners[0][1];
                    otherStartX = this.corners[2][0];
                    otherStartY = this.corners[2][1];
                }
                else if (checkInBound(x, y, rtx, hrty, hrtx, hrty, rtx, rty, hrtx, rty) &&
                    this.rotationTopRight()) {
                    cursor = "cell";
                    topMove = true;
                    leftMove = false;
                    startRotX = this.corners[1][0];
                    startRotY = this.corners[1][1];
                    otherStartX = this.corners[0][0];
                    otherStartY = this.corners[0][1];
                }
                else if (checkInBound(x, y, hlbx, lby, lbx, lby, hlbx, hlby, lbx, lby) &&
                    this.rotationBottomLeft()) {
                    cursor = "cell";
                    topMove = false;
                    leftMove = true;
                    startRotX = this.corners[2][0];
                    startRotY = this.corners[2][1];
                    otherStartX = this.corners[3][0];
                    otherStartY = this.corners[3][1];
                }
                else if (checkInBound(x, y, rbx, rby, hrbx, rby, rbx, hrby, hrbx, hrby) &&
                    this.rotationBottomRight()) {
                    cursor = "cell";
                    topMove = false;
                    leftMove = false;
                    startRotX = this.corners[3][0];
                    startRotY = this.corners[3][1];
                    otherStartX = this.corners[1][0];
                    otherStartY = this.corners[1][1];
                }
                if (cursor)
                    this.#runningEvents.rotate = true;
                this.canvas.chageCursor(cursor);
            }
            if (isMouseDown) {
                const radianRot = Math.atan2(y - this.#center.y, x - this.#center.x);
                this.#rotateDegree = radianToDegree(radianRot);
                const endX = this.#center.x + R * Math.cos(radianRot);
                const endY = this.#center.y + R * Math.sin(radianRot);
                const diffX = endX - startRotX;
                const diffY = endY - startRotY;
                const Rrad = radianRot - degreeToRadian(90);
                const e1X = this.#center.x + R * Math.cos(Rrad);
                const e1Y = this.#center.y + R * Math.sin(Rrad);
                const eDiffX = e1X - otherStartX;
                const eDiffY = e1Y - otherStartY;
                if (this.#rotateDegree >= -180) {
                    if (topMove && leftMove) {
                        this.#updateCorners(diffX, diffY, eDiffX, eDiffY);
                        this.#rotateDegree += 135;
                    }
                    else if (topMove && !leftMove) {
                        this.#updateCorners(eDiffX, eDiffY, -diffX, -diffY);
                        this.#rotateDegree += 45;
                    }
                    else if (!topMove && !leftMove) {
                        this.#updateCorners(-diffX, -diffY, -eDiffX, -eDiffY);
                        this.#rotateDegree -= 45;
                    }
                    else if (!topMove && leftMove) {
                        this.#updateCorners(-eDiffX, -eDiffY, diffX, diffY);
                        this.#rotateDegree -= 135;
                    }
                }
                startRotY = endY;
                startRotX = endX;
                otherStartX = e1X;
                otherStartY = e1Y;
                this.canvas.invokeChange();
            }
        };
        this.__eventHandler("mousemove", mousemove);
        return rotatable;
    }
    #updateCorners(diffX, diffY, eDiffX, eDiffY) {
        this.corners[0][0] += diffX;
        this.corners[1][0] += -eDiffX;
        this.corners[2][0] += eDiffX;
        this.corners[3][0] += -diffX;
        this.corners[0][1] += diffY;
        this.corners[1][1] += -eDiffY;
        this.corners[2][1] += eDiffY;
        this.corners[3][1] += -diffY;
        this.hotAreaCorners[0][0] += diffX;
        this.hotAreaCorners[1][0] += -eDiffX;
        this.hotAreaCorners[2][0] += eDiffX;
        this.hotAreaCorners[3][0] += -diffX;
        this.hotAreaCorners[0][1] += diffY;
        this.hotAreaCorners[1][1] += -eDiffY;
        this.hotAreaCorners[2][1] += eDiffY;
        this.hotAreaCorners[3][1] += -diffY;
        this.hotAreaRotCorners[0][0] += diffX;
        this.hotAreaRotCorners[1][0] += -eDiffX;
        this.hotAreaRotCorners[2][0] += eDiffX;
        this.hotAreaRotCorners[3][0] += -diffX;
        this.hotAreaRotCorners[0][1] += diffY;
        this.hotAreaRotCorners[1][1] += -eDiffY;
        this.hotAreaRotCorners[2][1] += eDiffY;
        this.hotAreaRotCorners[3][1] += -diffY;
    }
    resizable(opt) {
        const resizable = this.__cacheOption(opt, "resizable", true);
        if (!resizable)
            return false;
        let isMouseDown = false;
        let initX = 0;
        let initY = 0;
        let beforeX = 0;
        let beforeY = 0;
        let topResize = false;
        let leftResize = false;
        let widthResize = false;
        let heightResize = false;
        let isLeft = false;
        let isTop = false;
        const mousemove = (event) => {
            if (this.#runningEvents.drag || this.#runningEvents.rotate)
                return;
            let cursor = undefined;
            const { x, y } = this.canvas.getCursorPosition(event);
            let ltx = this.corners[0][0];
            let lty = this.corners[0][1];
            let rtx = this.corners[1][0];
            let rty = this.corners[1][1];
            let lbx = this.corners[2][0];
            let lby = this.corners[2][1];
            let rbx = this.corners[3][0];
            let rby = this.corners[3][1];
            let hltx = this.hotAreaCorners[0][0];
            let hlty = this.hotAreaCorners[0][1];
            let hrtx = this.hotAreaCorners[1][0];
            let hrty = this.hotAreaCorners[1][1];
            let hlbx = this.hotAreaCorners[2][0];
            let hlby = this.hotAreaCorners[2][1];
            let hrbx = this.hotAreaCorners[3][0];
            let hrby = this.hotAreaCorners[3][1];
            if (event.buttons == 0) {
                isMouseDown = false;
                this.#runningEvents.resize = false;
                topResize = false;
                leftResize = false;
                widthResize = false;
                heightResize = false;
                isLeft = false;
                isTop = false;
            }
            if (!isMouseDown) {
                if (event.buttons == 1) {
                    initX = x;
                    initY = y;
                    beforeX = 0;
                    beforeY = 0;
                    isMouseDown = true;
                }
                if (checkInBound(x, y, hltx, hlty, ltx, lty, hlbx, hlby, lbx, lby)) {
                    isLeft = ltx >= hltx || lbx >= hlby ? true : false;
                    widthResize = true;
                    leftResize = true;
                    cursor = "w-resize";
                }
                else if (checkInBound(x, y, rtx, rty, hrtx, hrty, rbx, rby, hrbx, hrby)) {
                    isLeft = rtx >= hrtx || rbx >= hrbx ? true : false;
                    widthResize = true;
                    cursor = "w-resize";
                }
                else if (checkInBound(x, y, hltx, hlty, hrtx, hrty, ltx, lty, rtx, rty)) {
                    isTop = lty >= hlty || rty >= hrty ? true : false;
                    heightResize = true;
                    topResize = true;
                    cursor = "n-resize";
                }
                else if (checkInBound(x, y, lbx, lby, rbx, rby, hlbx, hlby, hrbx, hrby)) {
                    isTop = lby >= hlby || rby >= hrby ? true : false;
                    heightResize = true;
                    cursor = "n-resize";
                }
                if (checkInBound(x, y, hltx, hlty, ltx, lty, 0, 0, 0, 0)) {
                    isLeft = ltx >= hltx ? true : false;
                    isTop = lty >= hlty ? true : false;
                    topResize = true;
                    leftResize = true;
                    widthResize = true;
                    heightResize = true;
                    cursor = "nw-resize";
                }
                else if (checkInBound(x, y, hrtx, hrty, rtx, rty, 0, 0, 0, 0)) {
                    isLeft = rtx >= hrtx ? true : false;
                    isTop = rty >= hrty ? true : false;
                    topResize = true;
                    leftResize = false;
                    widthResize = true;
                    heightResize = true;
                    cursor = "nesw-resize";
                }
                else if (checkInBound(x, y, lbx, lby, hlbx, hlby, 0, 0, 0, 0)) {
                    isLeft = lbx >= hlbx ? true : false;
                    isTop = lby >= hlby ? true : false;
                    topResize = false;
                    leftResize = true;
                    widthResize = true;
                    heightResize = true;
                    cursor = "nesw-resize";
                }
                else if (checkInBound(x, y, rbx, rby, hrbx, hrby, 0, 0, 0, 0)) {
                    isLeft = rbx >= hrbx ? true : false;
                    isTop = rby >= hrby ? true : false;
                    topResize = false;
                    leftResize = false;
                    widthResize = true;
                    heightResize = true;
                    cursor = "nw-resize";
                }
                if (cursor)
                    this.#runningEvents.resize = true;
                this.canvas.chageCursor(cursor);
            }
            if (isMouseDown) {
                let diffX = x - initX;
                let diffY = y - initY;
                this.beforeInit.x = this.canvasInit.x;
                this.beforeInit.y = this.canvasInit.y;
                if (diffX !== 0 && widthResize) {
                    const diff = diffX - beforeX;
                    if (isLeft && this.canvasInit.width - diff > 0) {
                        this.canvasInit.width -= diff;
                        this.canvasInit.x += diff;
                    }
                    else if (!isLeft && this.canvasInit.width + diff > 0)
                        this.canvasInit.width += diff;
                    else
                        this.canvasInit.width = 0;
                    if (this.canvasInit.width !== 0) {
                        if (leftResize) {
                            this.corners[0][0] += diff;
                            this.corners[2][0] += diff;
                            this.hotAreaCorners[0][0] += diff;
                            this.hotAreaCorners[2][0] += diff;
                        }
                        else {
                            this.corners[1][0] += diff;
                            this.corners[3][0] += diff;
                            this.hotAreaCorners[1][0] += diff;
                            this.hotAreaCorners[3][0] += diff;
                        }
                        beforeX = diffX;
                    }
                }
                if (diffY !== 0 && heightResize) {
                    const diff = diffY - beforeY;
                    if (isTop && this.canvasInit.height - diff > 0) {
                        this.canvasInit.height -= diff;
                        this.canvasInit.y += diff;
                    }
                    else if (!isTop && this.canvasInit.height + diff > 0)
                        this.canvasInit.height += diff;
                    else
                        this.canvasInit.height = 0;
                    if (this.canvasInit.height !== 0) {
                        if (topResize) {
                            this.corners[0][1] += diff;
                            this.corners[1][1] += diff;
                            this.hotAreaCorners[0][1] += diff;
                            this.hotAreaCorners[1][1] += diff;
                        }
                        else {
                            this.corners[2][1] += diff;
                            this.corners[3][1] += diff;
                            this.hotAreaCorners[2][1] += diff;
                            this.hotAreaCorners[3][1] += diff;
                        }
                        beforeY = diffY;
                    }
                }
                this.__adjustCordinates();
                this.canvas.invokeChange();
            }
        };
        this.__eventHandler("mousemove", mousemove);
        return resizable;
    }
    add(...block) {
        this.addChild(block);
        this.__adjustCordinates();
        this.__adjustSpaces();
    }
    __adjustSpaces() {
        let boundaryX = this.canvasInit.x;
        let boundaryY = this.canvasInit.y;
        let boundaryWidth = boundaryX + this.canvasInit.width;
        let boundaryHeight = boundaryY + this.canvasInit.height;
        this._childs?.forEach((item) => {
            if (item) {
                item.canvasInit.x +=
                    this.x() +
                        this.marginLeft() +
                        this.paddingLeft() -
                        this.paddingRight();
                item.canvasInit.y +=
                    this.y() +
                        this.marginTop() +
                        this.paddingTop() -
                        this.paddingBottom();
                const w = item.canvasInit.width + item.canvasInit.x;
                const h = item.canvasInit.height + item.canvasInit.y;
                if (item.canvasInit.x < boundaryX)
                    boundaryX -= item.canvasInit.x;
                if (item.canvasInit.y < boundaryY)
                    boundaryY -= item.canvasInit.y;
                if (w > boundaryWidth)
                    boundaryWidth += boundaryWidth - w;
                if (h > boundaryHeight)
                    boundaryHeight += boundaryHeight - h;
            }
        });
        this.#boundries = {
            x: boundaryX,
            y: boundaryY,
            width: boundaryWidth,
            height: boundaryHeight,
        };
    }
    __adjustCordinates(before) {
        before = before || this.beforeInit;
        this._childs?.forEach((item) => {
            if (item) {
                item.canvasInit.x += this.canvasInit.x - before.x;
                item.canvasInit.y += this.canvasInit.y - before.y;
                item.__adjustCordinates(before);
            }
        });
    }
    __unitConverter(unit, val, parentS) {
        if (unit.endsWith("%"))
            ;
        if (unit.endsWith("vh"))
            fromVH(val, this.canvas.height);
        if (unit.endsWith("vw"))
            fromVW(val, this.canvas.width);
        if (unit.endsWith("rem"))
            ;
        if (unit.endsWith("em"))
            ;
        if (unit.endsWith("cm"))
            ;
        if (unit.endsWith("mm"))
            ;
        if (unit.endsWith("q"))
            ;
        if (unit.endsWith("in"))
            ;
        if (unit.endsWith("pc"))
            ;
        if (unit.endsWith("pt"))
            ;
    }
    x(opt) {
        const x = this.__cacheOption(opt, "x", 0);
        if (opt !== undefined)
            this.canvasInit.x = x;
        return x;
    }
    y(opt) {
        const y = this.__cacheOption(opt, "y", 0);
        if (opt !== undefined)
            this.canvasInit.y = y;
        return y;
    }
    width(opt) {
        const width = this.__cacheOption(opt, "width", 0);
        if (opt)
            this.canvasInit.width = width;
        return width;
    }
    height(opt) {
        const height = this.__cacheOption(opt, "height", 0);
        if (opt)
            this.canvasInit.height = height;
        return height;
    }
    position(opt) {
        return this.__cacheOption(opt, "position", "static");
    }
    top(opt) {
        if (this.position() === "static")
            opt = 0;
        return this.__cacheOption(opt, "top", 0);
    }
    bottom(opt) {
        if (this.position() === "static")
            opt = 0;
        return this.__cacheOption(opt, "bottom", 0);
    }
    left(opt) {
        if (this.position() === "static")
            opt = 0;
        return this.__cacheOption(opt, "left", 0);
    }
    right(opt) {
        if (this.position() === "static")
            opt = 0;
        return this.__cacheOption(opt, "right", 0);
    }
    hotCornerSize(opt) {
        return this.__cacheOption(opt, "hotCornerSize", 5);
    }
    hotCornerRadius(opt) {
        return this.__cacheOption(opt, "hotCornerRadius", [0]);
    }
    hotCornerStrokeWidth(opt) {
        return this.__cacheOption(opt, "hotCornerStrokeWidth", 0);
    }
    hotCornerStrokeColor(opt) {
        return this.__cacheOption(opt, "hotCornerStrokeColor", "black");
    }
    hotCornerBackgroundColor(opt) {
        return this.__cacheOption(opt, "hotCornerBackgroundColor", "white");
    }
    hotLineStrokeWidth(opt) {
        return this.__cacheOption(opt, "hotTopStrokeWidth", 1);
    }
    hotLineStrokeColor(opt) {
        return this.__cacheOption(opt, "hotTopStrokeColor", "blue");
    }
    hotAreaGap(opt) {
        return this.__cacheOption(opt, "hotAreaGap", 5);
    }
    blur(opt) {
        const blur = this.__cacheOption(opt, "blur", 0);
        if (blur)
            this.__filters.push(`blur(${blur}px)`);
        return blur;
    }
    brightness(opt) {
        const brightness = this.__cacheOption(opt, "brightness", 0);
        if (brightness)
            this.__filters.push(`brightness(${brightness}%)`);
        return brightness;
    }
    contrast(opt) {
        const contrast = this.__cacheOption(opt, "contrast", 0);
        if (contrast)
            this.__filters.push(`contrast(${contrast}%)`);
        return contrast;
    }
    dropShadow(opt) {
        const dropShadow = this.__cacheOption(opt, "dropShadow", []);
        let _s = "";
        dropShadow.forEach((i) => {
            if (i instanceof Number)
                _s += `${i}px`;
            else
                _s += i;
        });
        if (dropShadow)
            this.__filters.push(`drop-shadow(${_s})`);
        return dropShadow;
    }
    grayscale(opt) {
        const grayscale = this.__cacheOption(opt, "grayscale", 0);
        if (grayscale)
            this.__filters.push(`grayscale(${grayscale}%)`);
        return grayscale;
    }
    hueRotate(opt) {
        const hueRotate = this.__cacheOption(opt, "hueRotate", 0);
        if (hueRotate)
            this.__filters.push(`hue-rotate(${hueRotate}deg)`);
        return hueRotate;
    }
    opacity(opt) {
        const opacity = this.__cacheOption(opt, "opacity", 0);
        if (opacity)
            this.__filters.push(`opacity(${opacity}%)`);
        return opacity;
    }
    saturate(opt) {
        const saturate = this.__cacheOption(opt, "saturate", 0);
        if (saturate)
            this.__filters.push(`saturate(${saturate}%)`);
        return saturate;
    }
    sepia(opt) {
        const sepia = this.__cacheOption(opt, "sepia", 0);
        if (sepia)
            this.__filters.push(`sepia(${sepia}%)`);
        return sepia;
    }
    hidden(opt) {
        const hidden = this.__cacheOption(opt, "hidden", false);
        if (hidden) {
            this._childs.forEach((item) => ((item.options.hidden = true), item.options.hidden));
        }
        return hidden;
    }
    padding(opt) {
        const padding = this.__cacheOption(opt, "padding", undefined);
        if (!padding)
            return padding;
        this.paddingTop(padding[0]);
        switch (padding.length) {
            case 1:
                this.paddingBottom(padding[0]);
                this.paddingLeft(padding[0]);
                this.paddingRight(padding[0]);
                break;
            case 2:
                this.paddingBottom(padding[0]);
                this.paddingLeft(padding[1]);
                this.paddingRight(padding[1]);
                break;
            case 3:
                this.paddingLeft(padding[1]);
                this.paddingRight(padding[1]);
                this.paddingBottom(padding[2]);
                break;
            case 4:
                this.paddingRight(padding[1]);
                this.paddingBottom(padding[2]);
                this.paddingLeft(padding[3]);
                break;
        }
        return padding;
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
    margin(opt) {
        const margin = this.__cacheOption(opt, "margin", undefined);
        if (!margin)
            return margin;
        this.marginTop(margin[0]);
        switch (margin.length) {
            case 1:
                this.marginBottom(margin[0]);
                this.marginLeft(margin[0]);
                this.marginRight(margin[0]);
                break;
            case 2:
                this.marginBottom(margin[0]);
                this.marginLeft(margin[1]);
                this.marginRight(margin[1]);
                break;
            case 3:
                this.marginLeft(margin[1]);
                this.marginRight(margin[1]);
                this.marginBottom(margin[2]);
                break;
            case 4:
                this.marginRight(margin[1]);
                this.marginBottom(margin[2]);
                this.marginLeft(margin[3]);
                break;
        }
        return margin;
    }
    marginTop(opt) {
        return this.__cacheOption(opt, "marginTop", 0);
    }
    marginBottom(opt) {
        return this.__cacheOption(opt, "marginBottom", 0);
    }
    marginLeft(opt) {
        return this.__cacheOption(opt, "marginLeft", 0);
    }
    marginRight(opt) {
        return this.__cacheOption(opt, "marginRight", 0);
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
                if (value !== undefined) {
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
            if (opt !== undefined)
                this.options[option] = opt;
            else if (this.options[option] !== undefined)
                return this.options[option];
            else
                this.options[option] = defaultOpt;
            return this.options[option];
        }
        return undefined;
    }
    reset() { }
    rotate(opt) {
        this.#rotateDegree = this.__cacheOption(opt, "rotate", 0);
        const gap = this.hotAreaGap();
        const R = getRadiusByWH(this.canvasInit.width, this.canvasInit.height);
        const rad = degreeToRadian(this.#rotateDegree - 135);
        const diffX = this.#center.x + R * Math.cos(rad) - this.corners[0][0];
        const diffY = this.#center.y + R * Math.sin(rad) - this.corners[0][1];
        const Rrad = degreeToRadian(this.#rotateDegree - 225);
        const eDiffX = this.#center.x + R * Math.cos(Rrad) - this.corners[2][0];
        const eDiffY = this.#center.y + R * Math.sin(Rrad) - this.corners[2][1];
        const RR = getRadiusByWH(this.canvasInit.width + gap, this.canvasInit.height + gap);
        const diffRX = this.#center.x + RR * Math.cos(rad) - this.hotAreaCorners[0][0];
        const diffRY = this.#center.y + RR * Math.sin(rad) - this.hotAreaCorners[0][1];
        const eDiffRX = this.#center.x + RR * Math.cos(Rrad) - this.hotAreaCorners[2][0];
        const eDiffRY = this.#center.y + RR * Math.sin(Rrad) - this.hotAreaCorners[2][1];
        this.corners[0][0] += diffX;
        this.corners[1][0] += -eDiffX;
        this.corners[2][0] += eDiffX;
        this.corners[3][0] += -diffX;
        this.corners[0][1] += diffY;
        this.corners[1][1] += -eDiffY;
        this.corners[2][1] += eDiffY;
        this.corners[3][1] += -diffY;
        this.hotAreaCorners[0][0] += diffRX;
        this.hotAreaCorners[1][0] += -eDiffRX;
        this.hotAreaCorners[2][0] += eDiffRX;
        this.hotAreaCorners[3][0] += -diffRX;
        this.hotAreaCorners[0][1] += diffRY;
        this.hotAreaCorners[1][1] += -eDiffRY;
        this.hotAreaCorners[2][1] += eDiffRY;
        this.hotAreaCorners[3][1] += -diffRY;
        return this.#rotateDegree;
    }
    animate(keyframes, callback) {
        /*
        @property: keyframe
        [
            {x: [1,2,3], duration: 2000, ease: "ease-in"},
            etc.
        ]
        */
        const animationId = (this.#lastAnimationId += 1);
        this.#keyframeIterations[animationId] = {
            isRunning: true,
            isFinished: false,
            isReverse: false,
        };
        for (let [index, keyframe] of keyframes.entries()) {
            const essentials = {
                time: 0,
                iter: 0,
            };
            const composite = keyframe.composite || "replace";
            let maxLen = 0;
            for (let [key, value] of Object.entries(keyframe)) {
                if (key in this.options) {
                    if (composite === "add" && maxLen < value.length)
                        maxLen = value.length;
                    else if (composite === "accumulate") {
                        let prevVal = 0;
                        keyframe[key] = value.map((item, index) => {
                            if (!(index in [0, 1])) {
                                item += prevVal;
                            }
                            else {
                                prevVal += item;
                            }
                            return item;
                        });
                    }
                }
            }
            for (let [key, value] of Object.entries(keyframe)) {
                if (key in this.options) {
                    const proto = Object.getPrototypeOf(this);
                    const obj = Object.getOwnPropertyDescriptor(proto, key);
                    this.#keyframeIterations[animationId][index] = {
                        ...essentials,
                        initValues: { key: obj?.value.call(this) },
                    };
                    for (let i = value.length, maxVal = value[i - 1]; i < maxLen; i++)
                        value.push(maxVal);
                    this.#keyframeIterations[animationId][index][key] = {
                        currentIdx: 0,
                        currentVal: 0,
                        breakPoints: value,
                    };
                }
                else {
                    this.#keyframeIterations[animationId][index][key] = value;
                }
            }
            const animator = (timestemps) => {
                const anime = this.#keyframeIterations[animationId];
                const keyF = anime[index];
                let isFinished = keyF["isFinished"];
                const delay = keyF.delay || 0;
                keyF.playBackRate || 0;
                keyF.frameRate || 0;
                const direction = keyF.direction || "normal";
                const duration = keyF.duration || 0;
                const iterationStart = keyF.iterationStart || 0.0;
                const iterations = keyF.iterations || undefined;
                if (!anime["isRunning"])
                    return;
                if (keyF["iter"] === iterations)
                    isFinished = this.#keyframeIterations[animationId][index]["isFinished"] = true;
                if (isFinished) {
                    if (keyF.onFinish)
                        keyF.onFinish();
                    for (let [key, value] of Object.entries(keyF["initValues"])) {
                        const proto = Object.getPrototypeOf(this);
                        const obj = Object.getOwnPropertyDescriptor(proto, key);
                        obj?.value.call(this, value);
                        this.#keyframeIterations[animationId][index]["time"] = 0;
                    }
                    return;
                }
                if (callback)
                    callback(timestemps);
                if (keyF["iterations"])
                    this.#keyframeIterations[animationId][index]["iter"] += 1;
                const t = keyF["time"];
                const easing = this.easingHanndler(keyF.easing, t, duration);
                for (let [key, value] of Object.entries(keyF)) {
                    if (!(key in this.options))
                        continue;
                    let valueT = value;
                    let currentIdx = valueT["currentIdx"];
                    let iterDirection = valueT["iterDirection"];
                    let nextIdx = currentIdx + iterDirection;
                    let startVal = valueT["breakPoints"][currentIdx];
                    let endVal = valueT["breakPoints"][nextIdx];
                    let currentVal = keyF["currentVal"];
                    const proto = Object.getPrototypeOf(this);
                    const obj = Object.getOwnPropertyDescriptor(proto, key);
                    // [0, 100, 50]
                    if (delay <= timestemps / 1000) {
                        const modifiedVal = currentVal + easing * (endVal - startVal);
                        this.#keyframeIterations[animationId][index]["time"] +=
                            1 / (60 * (duration / 1000));
                        if ((startVal <= endVal &&
                            !(startVal <= modifiedVal <= endVal)) ||
                            (startVal >= endVal &&
                                !(startVal >= modifiedVal >= endVal))) {
                            currentIdx += 1;
                            if (iterDirection === valueT.length &&
                                iterDirection === 0) {
                                if (direction == "normal") {
                                    currentIdx = 0;
                                }
                                else if (direction == "reverse") {
                                    currentIdx = valueT.length - 1;
                                    iterDirection = -1;
                                }
                                else if (direction == "alternate" ||
                                    direction == "alternate-reverse") {
                                    iterDirection *= -1;
                                }
                            }
                            this.#keyframeIterations[animationId][index]["currentIdx"] = currentIdx;
                        }
                        this.#keyframeIterations[animationId][index]["currentVal"] = modifiedVal;
                        this.#keyframeIterations[animationId][index]["iterDirection"] = iterDirection;
                        if (iterationStart <=
                            currentVal / (startVal + endVal)) {
                            obj?.value.call(this, modifiedVal);
                        }
                    }
                }
            };
            this.__animationOn.push(animator);
        }
        return animationId;
    }
    animationStart(animationId) {
        this.#keyframeIterations[animationId]["isFinished"] = false;
        this.#keyframeIterations[animationId]["isRunning"] = true;
    }
    animationStop(animationId) {
        this.#keyframeIterations[animationId]["isRunning"] = false;
    }
    animationFinish(animationId) {
        this.#keyframeIterations[animationId]["isFinished"] = true;
    }
    animationReverse(animationId) {
        this.#keyframeIterations[animationId]["isFinished"] = false;
        this.#keyframeIterations[animationId]["isReverse"] = true;
    }
    animationUpdateDelay(animationId, keyFrameCount, value) {
        this.#keyframeIterations[animationId][keyFrameCount]["updateDelay"] =
            value;
    }
    animationPlayBackRate(animationId, keyFrameCount, value) {
        this.#keyframeIterations[animationId][keyFrameCount]["playBackRate"] =
            value;
    }
    animationFrameRate(animationId, keyFrameCount, value) {
        this.#keyframeIterations[animationId][keyFrameCount]["frameRate"] =
            value;
    }
    animationDirection(animationId, keyFrameCount, value) {
        this.#keyframeIterations[animationId][keyFrameCount]["direction"] =
            value;
    }
    animationDuration(animationId, keyFrameCount, value) {
        this.#keyframeIterations[animationId][keyFrameCount]["duration"] =
            value;
    }
    animationIterationStart(animationId, keyFrameCount, value) {
        this.#keyframeIterations[animationId][keyFrameCount]["iterationStart"] =
            value;
    }
    animationComposite(animationId, keyFrameCount, value) {
        this.#keyframeIterations[animationId][keyFrameCount]["composite"] =
            value;
    }
    animationIterations(animationId, keyFrameCount, value) {
        this.#keyframeIterations[animationId][keyFrameCount]["iterations"] =
            value;
    }
    easingHanndler(easing = "linear", t, duration) {
        if (easing instanceof String) {
            if (easing == "ease")
                return cubicBezier(0.25, 0.1, 0.25, 1, t, duration);
            else if (easing == "ease-in")
                return cubicBezier(0.42, 0, 1, 1, t, duration);
            else if (easing == "ease-out")
                return cubicBezier(0, 0, 0.58, 1, t, duration);
            else if (easing == "ease-in-out")
                return cubicBezier(0.42, 0, 0.58, 1, t, duration);
        }
        else if (easing instanceof Array) {
            if (easing.length == 4)
                return cubicBezier(0.42, 0, 0.58, 1, t, duration);
            // if (easing.length == 4) return cubicBezier(0.42, 0, 0.58, 1, t, duration);
        }
        return 0;
    }
    // had to come first for block scaling
    scale(x, y) {
        this.context.scale(x, y);
    }
    bind(block, options) {
        for (let opt of options) {
            this.options[opt] = block.options[opt];
        }
    }
    find(queries) {
        return this.filterNodes(queries);
    }
    nthChild(opt) { }
    checkInBound(_event) {
        const { x, y } = this.canvas.getCursorPosition(_event);
        this.options.borderWidth || 0;
        const x1 = this.corners[0][0] + this.canvas.__positionCords.x;
        const y1 = this.corners[0][1] + this.canvas.__positionCords.y;
        const x2 = this.corners[1][0] + this.canvas.__positionCords.x;
        const y2 = this.corners[1][1] + this.canvas.__positionCords.y;
        const x3 = this.corners[2][0] + this.canvas.__positionCords.x;
        const y3 = this.corners[2][1] + this.canvas.__positionCords.y;
        const x4 = this.corners[3][0] + this.canvas.__positionCords.x;
        const y4 = this.corners[3][1] + this.canvas.__positionCords.y;
        return checkInBound(x, y, x1, y1, x2, y2, x3, y3, x4, y4);
    }
    click(_func) {
        const out = (event) => {
            if (this.checkInBound(event)) {
                _func(event);
                this.canvas?.invokeChange.call(this.canvas);
            }
        };
        this.__eventHandler("click", out);
    }
    dbclick(_func) {
        const out = (event) => {
            if (this.checkInBound(event)) {
                _func(event);
                this.canvas?.invokeChange.call(this.canvas);
            }
        };
        this.__eventHandler("dblclick", out);
    }
    mousedown(_func) {
        const out = (event) => {
            if (this.checkInBound(event)) {
                _func(event);
                this.canvas?.invokeChange.call(this.canvas);
            }
        };
        this.__eventHandler("mousedown", out);
    }
    mouseup(_func) {
        const out = (event) => {
            if (this.checkInBound(event)) {
                _func(event);
                this.canvas?.invokeChange.call(this.canvas);
            }
        };
        this.__eventHandler("mouseup", out);
    }
    mousemove(_func) {
        const out = (event) => {
            if (this.checkInBound(event)) {
                _func(event);
                this.canvas?.invokeChange.call(this.canvas);
            }
        };
        this.__eventHandler("mousemove", out);
    }
    mouseenter(_func) {
        const enter = (event) => {
            const { x, y } = this.canvas.getCursorPosition(event);
            {
                _func(event);
                this.canvas?.invokeChange.call(this.canvas);
            }
        };
        this.__eventHandler("mousemove", enter);
    }
    mouseleave(_func) {
        const leave = (event) => {
            const { x, y } = this.canvas.getCursorPosition(event);
            {
                _func(event);
                this.canvas?.invokeChange.call(this.canvas);
            }
        };
        this.__eventHandler("mousemove", leave);
    }
    mouseout(_func) {
        const out = (event) => {
            if (!this.checkInBound(event)) {
                _func(event);
                this.canvas?.invokeChange.call(this.canvas);
            }
        };
        this.__eventHandler("mousemove", out);
    }
    mouseover(_func) {
        const over = (event) => {
            if (this.checkInBound(event)) {
                _func(event);
                this.canvas?.invokeChange.call(this.canvas);
            }
        };
        this.__eventHandler("mousemove", over);
    }
    __eventHandler(type, _func) {
        this.__events[type].push(_func);
    }
    dragX(opt) {
        return this.__cacheOption(opt, "dragX", true);
    }
    dragY(opt) {
        return this.__cacheOption(opt, "dragY", true);
    }
    draggable(opt) {
        const draggable = this.__cacheOption(opt, "draggable", true);
        if (!draggable)
            return false;
        let isMouseDown = false;
        let initX = 0;
        let initY = 0;
        let beforeX = 0;
        let beforeY = 0;
        const mousemove = (event) => {
            if (this.#runningEvents.resize || this.#runningEvents.rotate)
                return;
            if (event.buttons == 0) {
                isMouseDown = false;
                this.#runningEvents.drag = false;
            }
            if (event.buttons == 1) {
                const { x, y } = this.canvas.getCursorPosition(event);
                if (!isMouseDown && this.checkInBound(event)) {
                    initX = x;
                    initY = y;
                    beforeX = 0;
                    beforeY = 0;
                    isMouseDown = true;
                    this.#runningEvents.drag = true;
                }
                if (isMouseDown) {
                    let diffX = x - initX;
                    let diffY = y - initY;
                    this.beforeInit.x = this.canvasInit.x;
                    if (diffX !== 0 && this.dragX()) {
                        const diff = diffX - beforeX;
                        this.canvasInit.x += diff;
                        this.corners[0][0] += diff;
                        this.corners[1][0] += diff;
                        this.corners[2][0] += diff;
                        this.corners[3][0] += diff;
                        this.hotAreaCorners[0][0] += diff;
                        this.hotAreaCorners[1][0] += diff;
                        this.hotAreaCorners[2][0] += diff;
                        this.hotAreaCorners[3][0] += diff;
                        this.#center.x += diff;
                        beforeX = diffX;
                    }
                    this.beforeInit.y = this.canvasInit.y;
                    if (diffY !== 0 && this.dragY()) {
                        const diff = diffY - beforeY;
                        this.canvasInit.y += diff;
                        this.corners[0][1] += diff;
                        this.corners[1][1] += diff;
                        this.corners[2][1] += diff;
                        this.corners[3][1] += diff;
                        this.hotAreaCorners[0][1] += diff;
                        this.hotAreaCorners[1][1] += diff;
                        this.hotAreaCorners[2][1] += diff;
                        this.hotAreaCorners[3][1] += diff;
                        this.#center.y += diff;
                        beforeY = diffY;
                    }
                    this.__adjustCordinates();
                    this.canvas?.invokeChange();
                }
            }
        };
        this.__eventHandler("mousemove", mousemove);
        return draggable;
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
    #isLayoutInvoked = false;
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
        if (this.#invoker && !this.#isLayoutInvoked) {
            this.#invoker();
            this.#isLayoutInvoked = true;
        }
    }
    resizable(opt) {
        return super.resizable(opt);
    }
    hotAreaGap(opt) {
        return super.hotAreaGap(opt);
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
    hidden(opt) {
        return super.hidden(opt);
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
            block.__updateCornerCords();
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
            block.__updateCornerCords();
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

// each shape extends form common shape
class Shape extends Block {
    #gradient = null;
    #cachePattern = null;
    constructor(options) {
        super(options);
        this.options = options || {};
    }
    __initSet() {
        if (this.hidden())
            return;
        super.__initSet();
        this.draw();
    }
    draw(_func) {
        if (_func)
            _func(this.context);
    }
    beginPath() {
        this.context.beginPath();
    }
    closePath() {
        this.context.closePath();
    }
    hidden(opt) {
        return super.hidden(opt);
    }
    fill(opt) {
        const fill = this.__cacheOption(opt, "fill", false);
        if (fill)
            this.context.fill();
        return fill;
    }
    fillStyle(opt) {
        const fillStyle = this.__cacheOption(opt, "fillStyle", "black");
        this.context.fillStyle = fillStyle;
        return fillStyle;
    }
    conicGradient({ angle, x, y }) {
        this.#gradient = this.context.createConicGradient(angle, x, y);
        return this.#gradient;
    }
    radialGradient({ x0, y0, r0, x1, y1, r1, }) {
        this.#gradient = this.context.createRadialGradient(x0, y0, r0, x1, y1, r1);
        return this.#gradient;
    }
    linearGradient({ x0, y0, x1, y1, }) {
        this.#gradient = this.context.createLinearGradient(x0, y0, x1, y1);
        return this.#gradient;
    }
    createPattern({ imageSource, repeat, x, y, width, height, }) {
        let pattern = null;
        if (!this.#cachePattern) {
            this.#cachePattern = new Image();
            this.#cachePattern.src = imageSource;
            this.#cachePattern.addEventListener("load", () => {
                pattern = this.context.createPattern(this.#cachePattern, repeat);
                this.fillStyle(pattern);
                this.fillRect({ x, y, width, height });
            });
        }
        else {
            pattern = this.context.createPattern(this.#cachePattern, repeat);
            this.fillStyle(pattern);
            this.fillRect({ x, y, width, height });
        }
    }
    colorStops(opt) {
        const stops = this.__cacheOption(opt, "colorStops", []);
        for (let stop of stops) {
            this.#gradient.addColorStop(stop.stop, stop.color);
        }
        return stops;
    }
    stroke(opt) {
        const stroke = this.__cacheOption(opt, "stroke", false);
        if (stroke)
            this.context.stroke();
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
    shadowBlur(opt) {
        const shadowBlur = this.__cacheOption(opt, "shadowBlur", 0);
        this.context.shadowBlur = shadowBlur;
        return shadowBlur;
    }
    shadowColor(opt) {
        const shadowColor = this.__cacheOption(opt, "shadowColor", "black");
        this.context.shadowColor = shadowColor;
        return shadowColor;
    }
    shadowOffsetX(opt) {
        const shadowOffsetX = this.__cacheOption(opt, "shadowOffsetX", 0);
        this.context.shadowOffsetX = shadowOffsetX;
        return shadowOffsetX;
    }
    shadowOffsetY(opt) {
        const shadowOffsetY = this.__cacheOption(opt, "shadowOffsetY", 0);
        this.context.shadowOffsetY = shadowOffsetY;
        return shadowOffsetY;
    }
    filter(opt) {
        const filter = this.__cacheOption(opt, "filter", "");
        this.context.filter = filter;
        return filter;
    }
    blur(opt) {
        return super.blur(opt);
    }
    brightness(opt) {
        return super.brightness(opt);
    }
    contrast(opt) {
        return super.contrast(opt);
    }
    dropShadow(opt) {
        return super.dropShadow(opt);
    }
    grayscale(opt) {
        return super.grayscale(opt);
    }
    hueRotate(opt) {
        return super.hueRotate(opt);
    }
    opacity(opt) {
        return super.opacity(opt);
    }
    sepia(opt) {
        return super.sepia(opt);
    }
    lineDash(opt) {
        const lineDash = this.__cacheOption(opt, "lineDash", []);
        this.context.setLineDash(lineDash);
        return lineDash;
    }
    lineDashOffset(opt) {
        const lineDash = this.__cacheOption(opt, "lineDash", 0);
        this.context.lineDashOffset = lineDash;
        return lineDash;
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
    fillRect({ x, y, width, height }) {
        this.context.fillRect(x, y, width, height);
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
    moveTo({ x, y }) {
        this.context.moveTo(x, y);
    }
    lineJoin(opt) {
        const lineJoin = this.__cacheOption(opt, "lineJoin", "miter");
        this.context.lineJoin = lineJoin;
        return lineJoin;
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
    set(options) {
        super.set(options);
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
        this.context.textAlign = textAlign;
        return textAlign;
    }
    textBaseline(opt) {
        const textBaseline = this.__cacheOption(opt, "textBaseline", "alphabetic");
        this.context.textBaseline = textBaseline;
        return textBaseline;
    }
    blur(opt) {
        return super.blur(opt);
    }
    brightness(opt) {
        return super.brightness(opt);
    }
    contrast(opt) {
        return super.contrast(opt);
    }
    dropShadow(opt) {
        return super.dropShadow(opt);
    }
    grayscale(opt) {
        return super.grayscale(opt);
    }
    hueRotate(opt) {
        return super.hueRotate(opt);
    }
    opacity(opt) {
        return super.opacity(opt);
    }
    sepia(opt) {
        return super.sepia(opt);
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
    hidden(opt) {
        return super.hidden(opt);
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
    set(options) {
        super.set(options);
    }
}

class ImageBlock extends Block {
    source;
    #cacheImage;
    constructor(source, options) {
        super(options);
        this.source = source;
        this.options = options;
    }
    __initSet() {
        if (!this.#cacheImage) {
            this.#cacheImage = new Image();
            this.#cacheImage.src = this.source;
            this.#cacheImage.addEventListener("load", () => this.#drawImage());
        }
        else
            this.#drawImage();
    }
    #drawImage() {
        const fit = this.objectFit();
        let width = this.#cacheImage.width;
        let height = this.#cacheImage.height;
        let x = this.canvasInit.x;
        let y = this.canvasInit.y;
        const repeat = this.repeat();
        if (repeat === "no-repeat") {
            if (fit === "contain") {
                if (this.#cacheImage.width > this.#cacheImage.height) {
                    if (this.#cacheImage.width > this.width()) {
                        height += Math.abs(this.height() - this.width());
                    }
                    else {
                        height += this.height();
                    }
                }
                else if (this.#cacheImage.width < this.#cacheImage.height) {
                    if (this.#cacheImage.height > this.height())
                        width +=
                            Math.abs(this.height() - this.width()) +
                                this.width();
                    else
                        width += this.width();
                }
            }
            if (fit === "cover") {
                width = this.clipWidth();
                height = this.clipHeight();
            }
        }
        let sizeW = width;
        let sizeH = height;
        while (true) {
            this.context.drawImage(this.#cacheImage, this.clipX(), this.clipY(), width, height, x, y, this.canvasInit.width, this.canvasInit.height);
            if (repeat === "repeat") {
                if (sizeW > this.canvasInit.width) {
                    x = this.canvasInit.x;
                    y *= 2;
                    sizeW = width;
                }
                else {
                    sizeW *= 2;
                    x += sizeW;
                }
                if (sizeH > this.canvasInit.height &&
                    sizeW > this.canvasInit.width)
                    break;
            }
            else if (repeat === "repeat-x") {
                if (sizeW > this.canvasInit.width)
                    break;
                sizeW *= 2;
                x += sizeW;
                break;
            }
            else if (repeat === "repeat-y") {
                if (sizeH > this.canvasInit.height)
                    break;
                sizeH *= 2;
                y += sizeH;
            }
        }
    }
    repeat(opt) {
        return this.__cacheOption(opt, "repeat", "no-repeat");
    }
    clipX(opt) {
        return this.__cacheOption(opt, "clipX", 0);
    }
    clipY(opt) {
        return this.__cacheOption(opt, "clipY", 0);
    }
    clipWidth(opt) {
        return this.__cacheOption(opt, "clipWidth", this.width());
    }
    clipHeight(opt) {
        return this.__cacheOption(opt, "clipHeight", this.height());
    }
    objectFit(opt) {
        return this.__cacheOption(opt, "objectFit", "fill");
    }
    clip(opt) {
        return super.clip(opt);
    }
    hidden(opt) {
        return super.hidden(opt);
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
    set(options) {
        super.set(options);
    }
}

class Rectangle extends Shape {
    constructor(options) {
        super(options);
        this.options = options || {};
    }
    draw(_func) {
        this.beginPath();
        this.backgroundColor();
        this.roundRect({
            x: this.canvasInit.x,
            y: this.canvasInit.y,
            width: this.canvasInit.width,
            height: this.canvasInit.height,
            borderRadius: this.borderRadius() || [0],
        });
        this.fill();
        this.stroke();
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
    radialGradient({ x0, y0, r0, x1, y1, r1, }) {
        return super.radialGradient({ x0, y0, r0, x1, y1, r1 });
    }
    linearGradient({ x0, y0, x1, y1, }) {
        return super.linearGradient({ x0, y0, x1, y1 });
    }
    conicGradient({ angle, x, y }) {
        return super.conicGradient({ angle, x, y });
    }
    colorStops(opt) {
        return super.colorStops(opt);
    }
    resizable(opt) {
        return super.resizable(opt);
    }
    hotAreaGap(opt) {
        return super.hotAreaGap(opt);
    }
    rotatable(opt) {
        return super.rotatable(opt);
    }
    rotate(opt) {
        return super.rotate(opt);
    }
    hidden(opt) {
        return super.hidden(opt);
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
    position(opt) {
        return this.__cacheOption(opt, "position", "static");
    }
    top(opt) {
        if (this.position() === "static")
            opt = 0;
        return this.__cacheOption(opt, "top", 0);
    }
    bottom(opt) {
        if (this.position() === "static")
            opt = 0;
        return this.__cacheOption(opt, "bottom", 0);
    }
    left(opt) {
        if (this.position() === "static")
            opt = 0;
        return this.__cacheOption(opt, "left", 0);
    }
    right(opt) {
        if (this.position() === "static")
            opt = 0;
        return this.__cacheOption(opt, "right", 0);
    }
    shadowBlur(opt) {
        return super.shadowBlur(opt);
    }
    shadowColor(opt) {
        return super.shadowColor(opt);
    }
    shadowOffsetX(opt) {
        return super.shadowOffsetX(opt);
    }
    shadowOffsetY(opt) {
        return super.shadowOffsetY(opt);
    }
    blur(opt) {
        return super.blur(opt);
    }
    brightness(opt) {
        return super.brightness(opt);
    }
    contrast(opt) {
        return super.contrast(opt);
    }
    dropShadow(opt) {
        return super.dropShadow(opt);
    }
    grayscale(opt) {
        return super.grayscale(opt);
    }
    hueRotate(opt) {
        return super.hueRotate(opt);
    }
    opacity(opt) {
        return super.opacity(opt);
    }
    sepia(opt) {
        return super.sepia(opt);
    }
    padding(opt) {
        return super.padding(opt);
    }
    paddingLeft(opt) {
        return super.paddingLeft(opt);
    }
    paddingTop(opt) {
        return super.paddingTop(opt);
    }
    paddingBottom(opt) {
        return super.paddingBottom(opt);
    }
    paddingRight(opt) {
        return super.paddingRight(opt);
    }
    margin(opt) {
        return super.margin(opt);
    }
    marginLeft(opt) {
        return super.marginLeft(opt);
    }
    marginTop(opt) {
        return super.marginTop(opt);
    }
    marginBottom(opt) {
        return super.marginBottom(opt);
    }
    marginRight(opt) {
        return super.marginRight(opt);
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
    set(options) {
        super.set(options);
    }
}

class Circle extends Shape {
    constructor(options) {
        super(options);
        this.options = options || {};
    }
    draw(_func) {
        this.beginPath();
        this.backgroundColor();
        this.canvasInit.width = this.canvasInit.width || this.radiusX();
        this.canvasInit.height = this.canvasInit.height || this.radiusY();
        this.context.ellipse(this.canvasInit.x + this.canvasInit.width + this.lineWidth(), this.canvasInit.y + this.canvasInit.height + this.lineWidth(), this.canvasInit.width, this.canvasInit.height, this.rotation(), this.startAngle(), this.endAngle());
        super.fill();
        super.stroke();
    }
    radius(opt) {
        const radius = this.__cacheOption(opt, "radius", 0);
        this.radiusX(radius);
        this.radiusY(radius);
        return radius;
    }
    radiusX(opt) {
        return this.__cacheOption(opt, "radiusX", 0);
    }
    radiusY(opt) {
        return this.__cacheOption(opt, "radiusY", 0);
    }
    rotation(opt) {
        return this.__cacheOption(opt, "rotation", 0);
    }
    startAngle(opt) {
        return this.__cacheOption(opt, "startAngle", 0);
    }
    endAngle(opt) {
        return this.__cacheOption(opt, "endAngle", Math.PI * 2);
    }
    backgroundColor(opt) {
        const backgroundColor = this.__cacheOption(opt, "backgroundColor", "black");
        super.fillStyle(backgroundColor);
        return backgroundColor;
    }
    hidden(opt) {
        return super.hidden(opt);
    }
    radialGradient({ x0, y0, r0, x1, y1, r1, }) {
        return super.radialGradient({ x0, y0, r0, x1, y1, r1 });
    }
    linearGradient({ x0, y0, x1, y1, }) {
        return super.linearGradient({ x0, y0, x1, y1 });
    }
    conicGradient({ angle, x, y }) {
        return super.conicGradient({ angle, x, y });
    }
    colorStops(opt) {
        return super.colorStops(opt);
    }
    borderWidth(opt) {
        const borderWidth = this.__cacheOption(opt, "backgroundColor", 0);
        super.lineWidth(borderWidth);
        return borderWidth;
    }
    shadowBlur(opt) {
        return super.shadowBlur(opt);
    }
    shadowColor(opt) {
        return super.shadowColor(opt);
    }
    shadowOffsetX(opt) {
        return super.shadowOffsetX(opt);
    }
    shadowOffsetY(opt) {
        return super.shadowOffsetY(opt);
    }
    borderColor(opt) {
        const borderColor = this.__cacheOption(opt, "borderColor", "black");
        super.strokeStyle(borderColor);
        return borderColor;
    }
    padding(opt) {
        return super.padding(opt);
    }
    position(opt) {
        return this.__cacheOption(opt, "position", "static");
    }
    top(opt) {
        if (this.position() === "static")
            opt = 0;
        return this.__cacheOption(opt, "top", 0);
    }
    bottom(opt) {
        if (this.position() === "static")
            opt = 0;
        return this.__cacheOption(opt, "bottom", 0);
    }
    left(opt) {
        if (this.position() === "static")
            opt = 0;
        return this.__cacheOption(opt, "left", 0);
    }
    right(opt) {
        if (this.position() === "static")
            opt = 0;
        return this.__cacheOption(opt, "right", 0);
    }
    blur(opt) {
        return super.blur(opt);
    }
    brightness(opt) {
        return super.brightness(opt);
    }
    contrast(opt) {
        return super.contrast(opt);
    }
    dropShadow(opt) {
        return super.dropShadow(opt);
    }
    grayscale(opt) {
        return super.grayscale(opt);
    }
    hueRotate(opt) {
        return super.hueRotate(opt);
    }
    opacity(opt) {
        return super.opacity(opt);
    }
    sepia(opt) {
        return super.sepia(opt);
    }
    paddingLeft(opt) {
        return super.paddingLeft(opt);
    }
    paddingTop(opt) {
        return super.paddingTop(opt);
    }
    paddingBottom(opt) {
        return super.paddingBottom(opt);
    }
    paddingRight(opt) {
        return super.paddingRight(opt);
    }
    margin(opt) {
        return super.margin(opt);
    }
    marginLeft(opt) {
        return super.marginLeft(opt);
    }
    marginTop(opt) {
        return super.marginTop(opt);
    }
    marginBottom(opt) {
        return super.marginBottom(opt);
    }
    marginRight(opt) {
        return super.marginRight(opt);
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
    set(options) {
        super.set(options);
    }
}

class Line extends Shape {
    path;
    #startCords = { x: 0, y: 0 };
    constructor(options) {
        super(options);
        this.options = options || {};
        this.path = new Path();
        this.#startCords = { x: this.x(), y: this.y() };
    }
    draw(_func) {
        this.beginPath();
        this.path?.createPath();
        this.path?.path.moveTo(this.#startCords.x, this.#startCords.y);
        const points = this.points();
        if (!points) {
            let startX1 = this.startX1();
            let startY1 = this.startY1();
            let startX2 = this.startX2();
            let startY2 = this.startY2();
            let endX = this.endX();
            let endY = this.endY();
            if (startX1 && this.dragStartX1())
                startX1 += this.#startCords.x;
            if (startX2 && this.dragStartX2())
                startX2 += this.#startCords.x;
            if (startY1 && this.dragStartY1())
                startY1 += this.#startCords.y;
            if (startY2 && this.dragStartY2())
                startY2 += this.#startCords.y;
            if (endX && this.dragEndX())
                endX += this.#startCords.x;
            if (endY && this.dragEndY())
                endY += this.#startCords.y;
            if (startX1 && startY1 && !startX2 && !startY2) {
                this.path?.path.quadraticCurveTo(startX1, startY1, endX, endY);
            }
            else if (startX1 && startY1 && startX2 && startY2) {
                this.path?.path.bezierCurveTo(startX1, startY1, startX2, startY2, endX, endY);
            }
            else {
                this.path?.lineTo(endX, endY);
            }
        }
        else {
            for (let idx = 0; idx < points.length; idx++) {
                const point = points[idx];
                let startX1 = point.startX1;
                let startY1 = point.startY1;
                let startX2 = point.startX2;
                let startY2 = point.startY2;
                let endX = point.endX;
                let endY = point.endY;
                if (startX1 !== undefined)
                    startX1 += this.canvasInit.x;
                if (startY1 !== undefined)
                    startY1 += this.canvasInit.y;
                if (startX2 !== undefined)
                    startX2 += this.canvasInit.x;
                if (startY2 !== undefined)
                    startY2 += this.canvasInit.y;
                if (endX !== undefined)
                    endX += this.canvasInit.x;
                if (endY !== undefined)
                    endY += this.canvasInit.y;
                if (startX1 !== undefined &&
                    startY1 !== undefined &&
                    startX2 === undefined &&
                    startY2 === undefined) {
                    this.path?.path.quadraticCurveTo(startX1, startY1, endX, endY);
                }
                else if (startX1 !== undefined &&
                    startY1 !== undefined &&
                    startX2 !== undefined &&
                    startY2 !== undefined) {
                    this.path?.path.bezierCurveTo(startX1, startY1, startX2, startY2, endX, endY);
                }
                else {
                    this.path?.path.lineTo(endX, endY);
                }
                if (point.closePath)
                    this.path.path.closePath();
            }
        }
        if (this.closePath())
            this.path.path.closePath();
        if (this.fill())
            this.context.fill(this.path.path);
        if (this.stroke())
            this.context.stroke(this.path.path);
    }
    hidden(opt) {
        return super.hidden(opt);
    }
    fill(opt) {
        return this.__cacheOption(opt, "fill", false);
    }
    stroke(opt) {
        return this.__cacheOption(opt, "stroke", false);
    }
    points(opt) {
        return this.__cacheOption(opt, "points", undefined);
    }
    checkInBound(_event) {
        const { x, y } = this.canvas.getCursorPosition(_event);
        return this.pointInStroke({ path: this.path.path, x: x, y: y });
    }
    startX1(opt) {
        return this.__cacheOption(opt, "startX1", 0);
    }
    startY1(opt) {
        return this.__cacheOption(opt, "startY1", 0);
    }
    position(opt) {
        return this.__cacheOption(opt, "position", "static");
    }
    top(opt) {
        if (this.position() === "static")
            opt = 0;
        return this.__cacheOption(opt, "top", 0);
    }
    bottom(opt) {
        if (this.position() === "static")
            opt = 0;
        return this.__cacheOption(opt, "bottom", 0);
    }
    left(opt) {
        if (this.position() === "static")
            opt = 0;
        return this.__cacheOption(opt, "left", 0);
    }
    right(opt) {
        if (this.position() === "static")
            opt = 0;
        return this.__cacheOption(opt, "right", 0);
    }
    shadowBlur(opt) {
        return super.shadowBlur(opt);
    }
    shadowColor(opt) {
        return super.shadowColor(opt);
    }
    shadowOffsetX(opt) {
        return super.shadowOffsetX(opt);
    }
    shadowOffsetY(opt) {
        return super.shadowOffsetY(opt);
    }
    startX2(opt) {
        return this.__cacheOption(opt, "startX2", 0);
    }
    startY2(opt) {
        return this.__cacheOption(opt, "startY2", 0);
    }
    endX(opt) {
        return this.__cacheOption(opt, "endX", 0);
    }
    endY(opt) {
        return this.__cacheOption(opt, "endY", 0);
    }
    dragStartX(opt) {
        return this.__cacheOption(opt, "dragStartX", true);
    }
    dragStartY(opt) {
        return this.__cacheOption(opt, "dragStartY", true);
    }
    dragStartX1(opt) {
        return this.__cacheOption(opt, "dragStartX1", true);
    }
    dragStartY1(opt) {
        return this.__cacheOption(opt, "dragStartY1", true);
    }
    dragStartX2(opt) {
        return this.__cacheOption(opt, "dragStartX2", true);
    }
    dragStartY2(opt) {
        return this.__cacheOption(opt, "dragStartY2", true);
    }
    dragEndX(opt) {
        return this.__cacheOption(opt, "dragEndX", true);
    }
    dragEndY(opt) {
        return this.__cacheOption(opt, "dragEndY", true);
    }
    fillStyle(opt) {
        return super.fillStyle(opt);
    }
    lineWidth(opt) {
        const lineWidth = this.__cacheOption(opt, "lineWidth", 0);
        if (this.canvasInit.width === 0)
            this.canvasInit.width = lineWidth;
        this.context.lineWidth = this.canvasInit.width;
        return lineWidth;
    }
    lineCap(opt) {
        return super.lineCap(opt);
    }
    lineJoin(opt) {
        return super.lineJoin(opt);
    }
    lineDash(opt) {
        return super.lineDash(opt);
    }
    lineDashOffset(opt) {
        return super.lineDashOffset(opt);
    }
    strokeStyle(opt) {
        return super.strokeStyle(opt);
    }
    closePath(opt) {
        return this.__cacheOption(opt, "closePath", false);
    }
    blur(opt) {
        return super.blur(opt);
    }
    brightness(opt) {
        return super.brightness(opt);
    }
    contrast(opt) {
        return super.contrast(opt);
    }
    dropShadow(opt) {
        return super.dropShadow(opt);
    }
    grayscale(opt) {
        return super.grayscale(opt);
    }
    hueRotate(opt) {
        return super.hueRotate(opt);
    }
    opacity(opt) {
        return super.opacity(opt);
    }
    sepia(opt) {
        return super.sepia(opt);
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
        const draggable = this.__cacheOption(opt, "draggable", true);
        if (!draggable)
            return false;
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
            }
        });
        this.mousemove((event) => {
            if (isMouseDown) {
                const { x, y } = this.canvas.getCursorPosition(event);
                let diffX = x - initX;
                let diffY = y - initY;
                this.startX1();
                this.startX2();
                this.endX();
                this.startY1();
                this.startY2();
                this.endY();
                // const dragX1 =
                //     this.dragStartX1() && startX1 - 20 < x && x < startX1;
                // const dragX2 =
                //     this.dragStartX2() && startX2 - 20 < x && x < startX2;
                // const dragEndX =
                //     this.dragEndX() &&
                //     endX + 20 > x &&
                //     x > endX + this.#startCords.x;
                // const dragEndY =
                //     this.dragEndY() &&
                //     endY + 20 > y &&
                //     y > endY + this.#startCords.y;
                this.beforeInit.x = this.canvasInit.x;
                if (diffX !== 0 && this.dragX()) {
                    if (this.dragStartX())
                        this.canvasInit.x += diffX - beforeX;
                    // if (dragX1 || dragX2 || dragEndX)
                    this.#startCords.x += diffX - beforeX;
                    beforeX = diffX;
                }
                this.beforeInit.y = this.canvasInit.y;
                if (diffY !== 0 && this.dragY()) {
                    if (this.dragStartY())
                        this.canvasInit.y += diffY - beforeY;
                    // if (dragEndY)
                    this.#startCords.y += diffY - beforeY;
                    beforeY = diffY;
                }
                this.__adjustCordinates();
                this.canvas.invokeChange?.call(this.canvas);
            }
        });
        this.mouseup((event) => {
            isMouseDown = false;
        });
        return draggable;
    }
    set(options) {
        super.set(options);
    }
}

export { Block, Canvas, CanvasDOMManager, Circle, ImageBlock, Layout, Line, Rectangle, Shape, TextBlock };
