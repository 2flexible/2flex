// src/Node.ts
var Node = class {
  childNodes;
  parentNode;
  nodeId;
  #sortedBy;
  constructor() {
    this.childNodes = [];
  }
  addChild(...node) {
    for (let i = 0; i < node.length; i++) {
      if (!this.childNodes.includes(node[i])) {
        node[i].parentNode = this;
        this.childNodes.push(node[i]);
      }
    }
    this.#sortedBy = void 0;
  }
  listAllChilds(_func) {
    const Q = [this];
    while (Q.length > 0) {
      let current = Q.shift();
      if (current && current !== this) _func(current);
      if (current?.childNodes) Q.unshift(...current.childNodes);
    }
  }
  listOnlyChilds(_func, sort, nodes) {
    const sortedNodes = nodes || this.childNodes;
    if (sort && this.#sortedBy !== sort) {
      sortedNodes.sort(
        (a, b) => a.ownOptions[sort] - b.ownOptions[sort]
      );
      this.#sortedBy = sort;
    }
    for (let i = 0, len = sortedNodes.length; i < len; i++) {
      _func(sortedNodes[i], i, sortedNodes.length);
    }
  }
  resetSort() {
    this.#sortedBy = void 0;
  }
  removeChild(child) {
    const getChild = (topNode, child2) => {
      topNode.listOnlyChilds((n) => {
        if (n.nodeId === child2.nodeId) {
          child2.parentNode = void 0;
          topNode.childNodes = topNode.childNodes.filter(
            (n2) => n2.nodeId !== child2.nodeId
          );
          return;
        }
        getChild(n, child2);
      });
    };
    getChild(this, child);
  }
};

// src/CanvasTree.ts
var CanvasTree = class {
  head;
  #currentSnapshot;
  #snapshots;
  snapshotSize;
  #latestNodeId;
  nodes;
  constructor(snapshotSize) {
    this.head = new Node();
    this.snapshotSize = snapshotSize || 0;
    this.#currentSnapshot = 0;
    this.#snapshots = {};
    this.#latestNodeId = 1;
    this.nodes = [];
  }
  addNodes(node) {
    this.head.addChild(...node);
  }
  preOrderTraversal(_func) {
    this.refreshNodes();
    this.head.listAllChilds((current) => {
      if (current === this.head) return;
      this.assignNodeId(current);
      if (_func) _func(current);
      this.nodes.push(current);
    });
  }
  refreshNodes() {
    this.nodes = [];
  }
  assignNodeId(node) {
    if (node.nodeId === void 0) {
      node.nodeId = this.#latestNodeId;
      this.#latestNodeId += 1;
    }
  }
  takeSanpshot(timestamp, before, after) {
    for (const key of Object.keys(this.#snapshots)) {
      if (Number(key) > this.#currentSnapshot)
        delete this.#snapshots[Number(key)];
    }
    for (const key of Object.keys(this.#snapshots)) {
      if (this.snapshotSize < Object.entries(this.#snapshots).length) {
        delete this.#snapshots[Number(key)];
      } else break;
    }
    if (this.#snapshots[timestamp])
      this.#snapshots[timestamp] = {
        ...this.#snapshots[timestamp],
        ...after
      };
    else this.#snapshots[timestamp] = after;
    this.#currentSnapshot = timestamp;
    if (before)
      for (const key of Object.keys(this.#snapshots).reverse()) {
        if (Number(key) < this.#currentSnapshot) {
          for (let [kk, value] of Object.entries(before)) {
            this.#snapshots[Number(key)][kk] = {
              ...this.#snapshots[Number(key)][kk],
              ...value
            };
          }
          break;
        }
      }
  }
  snapshotInBack() {
    for (const key of Object.keys(this.#snapshots).reverse()) {
      if (Number(key) < this.#currentSnapshot) {
        this.#currentSnapshot = Number(key);
        break;
      }
    }
    console.log(this.#currentSnapshot, this.#snapshots);
    return this.#snapshots[this.#currentSnapshot];
  }
  snapshotInFuture() {
    for (const key of Object.keys(this.#snapshots)) {
      if (Number(key) > this.#currentSnapshot) {
        this.#currentSnapshot = Number(key);
        break;
      }
    }
    return this.#snapshots[this.#currentSnapshot];
  }
};

// src/DOMManager.ts
var CanvasDOMManager = class {
  canvasId;
  width;
  height;
  #domEvents = {};
  contextParams = {
    alpha: true,
    colorSpace: "srgb",
    colorType: "unorm8",
    desynchronized: false,
    willReadFrequently: false
  };
  constructor(canvasId, width, height) {
    this.canvasId = canvasId;
    this.width = width;
    this.height = height;
  }
  get canvas() {
    const canvas = document.getElementById(
      this.canvasId
    );
    if (!canvas) {
      this.createCanvas();
    }
    return canvas;
  }
  get context() {
    return this.canvas.getContext("2d", this.contextParams);
  }
  get pixelRatio() {
    return window.devicePixelRatio || 1;
  }
  createCanvas() {
    const canvas = document.createElement("canvas");
    canvas.id = this.canvasId;
    canvas.tabIndex = 0;
    canvas.width = this.width * this.pixelRatio;
    canvas.height = this.height * this.pixelRatio;
    canvas.style.width = this.width + "px";
    canvas.style.height = this.height + "px";
    document.querySelector("body")?.appendChild(canvas);
  }
  changeStyle(options) {
    for (const [key, value] of Object.entries(options)) {
      if (key in this.canvas.style)
        this.canvas.style.setProperty(key, value);
    }
  }
  addEventListener(_type, _func) {
    if (this.#domEvents[_type] && this.#domEvents[_type].includes(_func) || !_func)
      return;
    if (!this.#domEvents[_type]) this.#domEvents[_type] = [];
    this.#domEvents[_type].push(_func);
    this.canvas.addEventListener(_type, _func, { passive: false });
  }
  removeEventListener(_type, _func) {
    if (!this.#domEvents[_type]) return;
    this.#domEvents[_type] = this.#domEvents[_type].filter(
      (i) => i !== _func
    );
    this.canvas.removeEventListener(_type, _func);
  }
  getListener(event) {
    return this.#domEvents[event];
  }
};

// src/Utils.ts
function fromPercentage(from, parentS) {
  return from * parentS / 100;
}
function fromVW(from, canvasW) {
  return from * canvasW / 100;
}
function fromVH(from, canvasH) {
  return from * canvasH / 100;
}
function fromRem(from, parentS) {
  return from * parentS;
}
function fromEm(from, parentS) {
  return from * parentS;
}
function fromCm(from) {
  return from * 2.54;
}
function fromMm(from) {
  return fromCm(from) * 10;
}
function fromQ(from) {
  return fromCm(from) * 40;
}
function fromIn(from) {
  return fromCm(from) * 2.54;
}
function fromPc(from) {
  return fromIn(from) * 6;
}
function fromPt(from) {
  return fromIn(from) * 72;
}
function xIntersect(a, b) {
  return Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
}
function yIntersect(a, b) {
  return Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
}
function checkInBound(pointX, pointY, px1, py1, px2, py2, px3, py3, px4, py4) {
  if (
    // top
    (pointX - px1) * (py2 - py1) - (pointY - py1) * (px2 - px1) <= 0 && // bottom
    (pointX - px3) * (py4 - py3) - (pointY - py3) * (px4 - px3) >= 0 && // left
    (pointX - px1) * (py3 - py1) - (pointY - py1) * (px3 - px1) >= 0 && // right
    (pointX - px2) * (py4 - py2) - (pointY - py2) * (px4 - px2) <= 0
  )
    return true;
  return false;
}
function radianToDegree(rad) {
  return rad * 180 / Math.PI;
}
function rotateCordinates(x, y, centerX, centerY, radian) {
  return {
    x: (x - centerX) * Math.cos(radian) - (y - centerY) * Math.sin(radian) + centerX,
    y: (x - centerX) * Math.sin(radian) + (y - centerY) * Math.cos(radian) + centerY
  };
}
function bezierEasing(p1x, p1y, p2x, p2y) {
  const cx = 3 * p1x, bx = 3 * (p2x - p1x) - cx, ax = 1 - cx - bx, cy = 3 * p1y, by = 3 * (p2y - p1y) - cy, ay = 1 - cy - by;
  function sampleCurveX(t) {
    return ((ax * t + bx) * t + cx) * t;
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
      } else {
        t1 = t2;
      }
      t2 = (t1 - t0) / 2 + t0;
    }
    return t2;
  }
  return (x, duration) => {
    let t = solveCurveX(x, duration);
    return ((ay * t + by) * t + cy) * t;
  };
}
function cubicBezier(p0, p1, p2, p3, t) {
  return p0 * (1 - t) ** 3 + 3 * p1 * t * (1 - t) ** 2 + 3 * p2 * (1 - t) * t ** 2 + p3 * t ** 3;
}
function lerp(start, end, t) {
  return start + (end - start) * t;
}
function linear(...args) {
  const nTimes = 1 / (args.length - 1);
  return (t) => {
    const step = Math.ceil(t / nTimes);
    const stepB = Math.floor(t / nTimes);
    let x0 = stepB * nTimes;
    let x1 = step * nTimes;
    let y0 = args[stepB];
    let y1 = args[stepB + 1];
    if (typeof args[stepB] == "string") {
      const indicator = args[stepB].split(" ");
      y0 = Number(indicator[0]);
      x0 = Number(indicator[1].split("%")[0]) / 100;
      if (indicator[2]) x0 = Number(indicator[2].split("%")[0]) / 100;
    }
    if (typeof args[stepB + 1] == "string") {
      const indicator = args[stepB + 1].split(" ");
      y1 = Number(indicator[0]);
      x1 = Number(indicator[1].split("%")[0]) / 100;
      if (indicator[3]) x1 = Number(indicator[3].split("%")[0]) / 100;
    }
    const x = x0 + t * (x1 - x0);
    const y = y0 + x * (y1 - y0);
    return y;
  };
}
function steps(step, position) {
  const x = 1 / step;
  return (t) => {
    const stepness = Math.ceil(t / x);
    return x * t + x * stepness;
  };
}
function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}
var namedColors = {
  black: "#000000",
  silver: "#c0c0c0",
  gray: "#808080",
  white: "#ffffff",
  maroon: "#800000",
  red: "#ff0000",
  purple: "#800080",
  fuchsia: "#ff00ff",
  green: "#008000",
  lime: "#00ff00",
  olive: "#808000",
  yellow: "#ffff00",
  navy: "#000080",
  blue: "#0000ff",
  teal: "#008080",
  aqua: "#00ffff"
};
function hexToRgba(hex) {
  hex = hex.substring(1);
  let RR = hex.slice(0, 2);
  let GG = hex.slice(2, 4);
  let BB = hex.slice(4, 6);
  let AA = 1;
  if (hex.length === 8) AA = parseInt(hex.slice(7, 9));
  if (hex.length === 2) {
    RR += RR;
    GG += GG;
    BB += BB;
  }
  RR = parseInt(RR, 16);
  GG = parseInt(GG, 16);
  BB = parseInt(BB, 16);
  return `rgba(${RR}, ${GG}, ${BB}, ${AA})`;
}
function hslToRgba(hsl) {
  const colors = hsl.match(/\d+\.?\d*/g) || [];
  let H = 0;
  let S = 0;
  let L = 0;
  if (colors[0]) H = Number(colors[0]);
  if (colors[1]) S = Number(colors[1]) / 100;
  if (colors[2]) L = Number(colors[2]) / 100;
  if (S === 0) return rgbaRepresenter([L, L, L]);
  const C = (1 - (2 * L - 1)) * S;
  const Hd = H / 60;
  let RGB = { R: 0, G: 0, B: 0 };
  const X = C * (1 - Math.abs(Hd % 2 - 1));
  if (0 < Hd && Hd < 1) RGB = { R: C, G: X, B: 0 };
  else if (1 <= Hd && Hd <= 2) RGB = { R: X, G: C, B: 0 };
  else if (2 <= Hd && Hd <= 3) RGB = { R: 0, G: C, B: X };
  else if (3 <= Hd && Hd <= 4) RGB = { R: 0, G: X, B: C };
  else if (4 <= Hd && Hd <= 5) RGB = { R: X, G: 0, B: C };
  else if (5 <= Hd && Hd <= 6) RGB = { R: C, G: 0, B: X };
  const m = L - C / 2;
  RGB.R = (RGB.R + m) * 255;
  RGB.G = (RGB.G + m) * 255;
  RGB.B = (RGB.B + m) * 255;
  return rgbaRepresenter([RGB.R, RGB.G, RGB.B]);
}
function colorToRgba(color) {
  return hexToRgba(namedColors[color]);
}
function rgbaRepresenter(rgba) {
  return `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3] || 1})`;
}
function rgbaToArray(rgba) {
  const colors = rgba.match(/\d+\.?\d*/g) || [];
  let R = 0;
  let G = 0;
  let B = 0;
  let A = 1;
  if (colors[0]) R = Number(colors[0]);
  if (colors[1]) G = Number(colors[1]);
  if (colors[2]) B = Number(colors[2]);
  if (colors[3]) A = Number(colors[3]);
  return [R, G, B, A];
}
function getPrototype(obj, key) {
  let proto = Object.getPrototypeOf(obj);
  if (!getOwnPrototype(proto, key)) {
    return getPrototypeInChain(
      Object.getPrototypeOf(obj.constructor.prototype),
      key
    );
  }
  return getOwnPrototype(proto, key);
}
function getPrototypeInChain(proto, key) {
  if (!proto) return proto;
  let p = getOwnPrototype(proto, key);
  if (p) return p;
  else if (proto !== Node) {
    return getPrototypeInChain(Object.getPrototypeOf(proto), key);
  }
}
function getOwnPrototype(proto, key) {
  return Object.getOwnPropertyDescriptor(proto, key);
}
function inRange(value, great, less) {
  return value >= great && value <= less;
}

// src/Block.ts
var Block = class extends Node {
  canvas;
  ownOptions;
  options;
  __hidden = false;
  __bindOptions;
  __runningEvents;
  __events;
  #rotationCorners;
  __overflowCords;
  #keyframeIterations;
  __animations;
  #lastOrder;
  __clipPath;
  __childClipping;
  __childAdjustment;
  #changedCache;
  constructor(options) {
    super();
    this.options = { ...options };
    this.ownOptions = { ...options };
    this.__bindOptions = [];
    this.__runningEvents = {
      drag: false,
      rotate: false,
      resize: false,
      selected: false
    };
    this.__events = {};
    this.#changedCache = {};
    this.#rotationCorners = {
      topLeft: { x: 0, y: 0 },
      bottomLeft: { x: 0, y: 0 },
      topRight: { x: 0, y: 0 },
      bottomRight: { x: 0, y: 0 }
    };
    this.__overflowCords = {
      x: 0,
      y: 0,
      minX: 0,
      maxX: this.width(),
      minY: 0,
      maxY: this.height()
    };
    this.__animations = [];
    this.#keyframeIterations = {};
    this.#lastOrder = 0;
    this.setChangeCache("isVerticalFlipped", false);
    this.setChangeCache("isHorizontalFlipped", false);
    this.setChangeCache("clipWdith", 0);
    this.setChangeCache("clipHeight", 0);
    this.setChangeCache("clipX", 0);
    this.setChangeCache("clipY", 0);
    this.setChangeCache("setInBound", false);
  }
  get context() {
    return this.canvas?.context;
  }
  render() {
    this.__childClipping?.(this);
    this.__childAdjustment?.(this);
    this.position();
    this.__clippingPath();
    this.__adjustChildBlocks();
    if (this.__isHidden) return;
    this.__isSelected();
    this.onRender()?.();
  }
  name(opt) {
    return this.__valueHandler(opt, "name", void 0);
  }
  onRender(opt) {
    const onRender = this.__valueHandler(opt, "onRender", void 0);
    return () => {
      onRender?.();
    };
  }
  __isSelected() {
    if (this.__runningEvents.selected && this.hotLines()) {
      if (this.ImFirst) this.__hotLines();
      else this.__runningEvents.selected = false;
    }
  }
  generatePayload() {
    const childs = [];
    this.listOnlyChilds((b) => {
      childs.push(b.generatePayload());
    });
    return {
      nodeId: this.nodeId,
      name: this.constructor.name,
      options: this.options,
      ownOptions: this.ownOptions,
      childs,
      additionalParams: []
    };
  }
  addChild(...blocks) {
    this.setChangeCache("childNodes", this.childNodes.length);
    const exists = blocks.filter((r) => !this.childNodes.includes(r));
    let before = {};
    before[this.nodeId] = {
      childNodes: [...this.childNodes]
    };
    super.addChild(...exists);
    if (exists.length === 0) return;
    let z = this.zIndex() || 0;
    this.canvas?.invokeNodeListing();
    this.listOnlyChilds((b) => {
      if (b.order() === void 0) {
        b.order(this.#lastOrder);
        this.#lastOrder += 1;
      }
      z += 1;
      b.zIndex(z);
      this.canvas?.__handleOptions(b);
      this.canvas?.__collectEvents(b);
      this.canvas?.__collectAnimations(b);
      b.__initCordinates();
      this.canvas?.__takeInitSnaphshot(before);
      this.canvas?.__takeBlockSnapshot(this, before);
    });
    this.invokeChange();
  }
  removeChild(child) {
    if (!this.childNodes.includes(child)) return;
    let before = {};
    before[this.nodeId] = {
      childNodes: [...this.childNodes]
    };
    super.removeChild(child);
    child.__childAdjustment = void 0;
    child.__childClipping = void 0;
    this.canvas?.invokeNodeListing();
    this.canvas?.__clearEvents(child);
    this.canvas?.__takeBlockSnapshot(this, before);
  }
  __addChildInternal(...node) {
    super.addChild(...node);
  }
  __removeChildInternal(child) {
    super.removeChild(child);
  }
  findChilds(queries) {
    let blocks = [];
    this.listAllChilds((block) => {
      for (const [k, v] of Object.entries(queries)) {
        if (block.ownOptions[k] === v) blocks.push(block);
      }
    });
    return blocks;
  }
  __clippingPath() {
    const left = this.getLeft.x + this.__leftSpace;
    const right = this.getRealWidth - this.__widthSpaces;
    const top = this.getTop.y + this.__topSpace;
    const bottom = this.getRealHeight - this.__heightSpaces;
    if (!this.isOverflowVisible && (this.optionHasChanged("clipX", left) || this.optionHasChanged("clipY", top) || this.optionHasChanged("clipWdith", right) || this.optionHasChanged("clipHeight", bottom))) {
      this.__clipPath = new Path2D();
      this.__clipShape();
    }
  }
  __clipShape() {
    this.__clipPath?.rect(
      this.getLeft.x + this.__leftSpace,
      this.getTop.y + this.__topSpace,
      this.getRealWidth - this.__widthSpaces,
      this.getRealHeight - this.__heightSpaces
    );
  }
  __hotLines() {
    if (!this.context) return;
    const size = this.hotCornerSize();
    const radius = this.hotCornerRadius();
    const strokeWidth = this.hotCornerStrokeWidth();
    const strokeColor = this.hotCornerStrokeColor();
    const background = this.hotCornerBackgroundColor();
    const lineWidth = this.hotLineStrokeWidth();
    const lineColor = this.hotLineStrokeColor();
    this.context.save();
    this.context.setLineDash([]);
    this.context.beginPath();
    this.context.moveTo(
      this.hotCornerTopLeft().x,
      this.hotCornerTopLeft().y
    );
    if (!this.hotTopFunc()) {
      this.context.lineTo(
        this.hotCornerTopRight().x,
        this.hotCornerTopRight().y
      );
      this.context.lineWidth = lineWidth;
      this.context.strokeStyle = lineColor;
      this.context.stroke();
    } else this.hotTopFunc()?.(this.context);
    this.context.beginPath();
    this.context.moveTo(
      this.hotCornerTopLeft().x,
      this.hotCornerTopLeft().y
    );
    if (!this.hotLeftFunc()) {
      this.context.lineTo(
        this.hotCornerBottomLeft().x,
        this.hotCornerBottomLeft().y
      );
      this.context.lineWidth = lineWidth;
      this.context.strokeStyle = lineColor;
      this.context.stroke();
    } else this.hotLeftFunc()?.(this.context);
    this.context.beginPath();
    this.context.moveTo(
      this.hotCornerBottomLeft().x,
      this.hotCornerBottomLeft().y
    );
    if (!this.hotBottomFunc()) {
      this.context.lineTo(
        this.hotCornerBottomRight().x,
        this.hotCornerBottomRight().y
      );
      this.context.lineWidth = lineWidth;
      this.context.strokeStyle = lineColor;
      this.context.stroke();
    } else this.hotBottomFunc()?.(this.context);
    this.context.beginPath();
    this.context.moveTo(
      this.hotCornerBottomRight().x,
      this.hotCornerBottomRight().y
    );
    if (!this.hotRightFunc()) {
      this.context.lineTo(
        this.hotCornerTopRight().x,
        this.hotCornerTopRight().y
      );
      this.context.lineWidth = lineWidth;
      this.context.strokeStyle = lineColor;
      this.context.stroke();
    } else this.hotRightFunc()?.(this.context);
    this.context.beginPath();
    if (!this.hotCornerTopLeftFunc()) {
      this.context.roundRect(
        this.hotCornerTopLeft().x - size / 2,
        this.hotCornerTopLeft().y - size / 2,
        size,
        size,
        radius
      );
      this.context.lineWidth = strokeWidth;
      this.context.strokeStyle = strokeColor;
      this.context.fillStyle = background;
      this.context.fill();
      this.context.stroke();
    } else {
      this.hotCornerTopLeftFunc()?.(this.context);
    }
    this.context.beginPath();
    if (!this.hotCornerTopRightFunc()) {
      this.context.roundRect(
        this.hotCornerTopRight().x - size / 2,
        this.hotCornerTopRight().y - size / 2,
        size,
        size,
        radius
      );
      this.context.lineWidth = strokeWidth;
      this.context.strokeStyle = strokeColor;
      this.context.fillStyle = background;
      this.context.fill();
      this.context.stroke();
    } else {
      this.hotCornerTopRightFunc()?.(this.context);
    }
    this.context.beginPath();
    if (!this.hotCornerBottomLeftFunc()) {
      this.context.roundRect(
        this.hotCornerBottomLeft().x - size / 2,
        this.hotCornerBottomLeft().y - size / 2,
        size,
        size,
        radius
      );
      this.context.lineWidth = strokeWidth;
      this.context.strokeStyle = strokeColor;
      this.context.fillStyle = background;
      this.context.fill();
      this.context.stroke();
    } else {
      this.hotCornerBottomLeftFunc()?.(this.context);
    }
    this.context.beginPath();
    if (!this.hotCornerBottomRightFunc()) {
      this.context.roundRect(
        this.hotCornerBottomRight().x - size / 2,
        this.hotCornerBottomRight().y - size / 2,
        size,
        size,
        radius
      );
      this.context.lineWidth = strokeWidth;
      this.context.strokeStyle = strokeColor;
      this.context.fillStyle = background;
      this.context.fill();
      this.context.stroke();
    } else {
      this.hotCornerBottomRightFunc()?.(this.context);
    }
    this.context.restore();
  }
  hotLines(opt) {
    return this.__valueHandler(opt, "hotLines", true);
  }
  __adjustChildBlocks() {
    if (this.childNodes.length !== 0 || !this.useCacheAdjust) {
      const cacheR = this.rotate();
      this.rotate(0);
      let z = this.zIndex() || 0;
      const pWidth = this.width();
      const pHeight = this.height();
      const pPaddingLeft = this.paddingLeft();
      const pPaddingRight = this.paddingRight();
      const pPaddingTop = this.paddingTop();
      const pPaddingBottom = this.paddingBottom();
      const pMarginLeft = this.marginLeft();
      const pMarginRight = this.marginRight();
      const pMarginTop = this.marginTop();
      const pMarginBottom = this.marginBottom();
      const centerX = this.rotationCenterX();
      const centerY = this.rotationCenterY();
      const cornerLeftX = this.getLeft.x;
      const cornerTopY = this.getTop.y;
      let minX;
      let minY;
      let maxX = 0;
      let maxY = 0;
      this.listOnlyChilds((b) => {
        if (b.position() === "absolute") return;
        b.rotate(0);
        const blockW = this.width();
        const blockH = this.height();
        const initX = this.__unitConverter({
          val: b.options.x,
          widthRelated: true
        }) || 0;
        const initY = this.__unitConverter({
          val: b.options.y,
          widthRelated: true
        }) || 0;
        const x = initX + cornerLeftX + this.__overflowCords.x + pMarginLeft + pPaddingLeft;
        const y = initY + cornerTopY + this.__overflowCords.y + pMarginTop + pPaddingTop;
        let width, height;
        z += 1;
        if (pWidth - (pPaddingRight + pPaddingLeft) < b.width() && pWidth > b.minWidth() || blockW < b.maxWidth())
          width = blockW + -(blockW - (pWidth - (pPaddingRight + pPaddingLeft + pMarginRight)));
        if (pHeight - (pPaddingTop + pPaddingBottom) < blockH && pHeight > b.minHeight() || blockH < b.maxHeight()) {
          height = blockH + -(blockH - (pHeight - (pPaddingTop + pPaddingBottom + pMarginBottom)));
        }
        b.__childAdjustment = (b2) => {
          b2.hidden(this.hidden());
          if (b2.rotationCenter() === "parent") {
            b2.rotationCenterX(centerX);
            b2.rotationCenterY(centerY);
          }
          b2.rotate(cacheR);
          b2.x(x);
          b2.y(y);
          if (width !== void 0) b2.width(width);
          if (height !== void 0) b2.height(height);
          b2.zIndex(z);
        };
        if (this.__clipPath) {
          b.__childClipping = (b2) => {
            b2.context?.clip(this.__clipPath, "nonzero");
          };
        }
        if (width !== void 0 && width + x > maxX) {
          maxX = width + x;
        } else if (blockW + x > maxX) {
          maxX = blockW + x;
        }
        if (height !== void 0 && height + y > maxY) {
          maxY = height + y;
        } else if (blockW + y > maxY) {
          maxY = blockW + y;
        }
        if (minX === void 0 || x < minX) minX = x;
        if (minY === void 0 || y < minY) minY = y;
      });
      this.rotate(cacheR);
      this.__overflowCords.minX = minX || 0;
      this.__overflowCords.minY = minY || 0;
      this.__overflowCords.maxX = maxX;
      this.__overflowCords.maxY = maxY;
    }
  }
  get useCacheAdjust() {
    if (this.optionHasChanged("childNodes", this.childNodes.length) || this.optionHasChanged("x") || this.optionHasChanged("y") || this.optionHasChanged("width") || this.optionHasChanged("height") || this.optionHasChanged("minWidth") || this.optionHasChanged("minHeight") || this.optionHasChanged("maxWidth") || this.optionHasChanged("maxHeight") || this.optionHasChanged("zIndex") || this.optionHasChanged("paddingLeft") || this.optionHasChanged("paddingRight") || this.optionHasChanged("paddingBottom") || this.optionHasChanged("paddingTop") || this.optionHasChanged("marginLeft") || this.optionHasChanged("marginRight") || this.optionHasChanged("marginBottom") || this.optionHasChanged("marginTop") || this.optionHasChanged("rotationCenterX") || this.optionHasChanged("rotationCenterY") || this.optionHasChanged("rotate") || this.optionHasChanged("hidden"))
      return false;
    return true;
  }
  __initCordinates() {
    this.padding();
    this.margin();
    this.cornerTopLeft({
      x: this.x(),
      y: this.y()
    });
    this.cornerTopRight({
      x: this.x() + this.width(),
      y: this.y()
    });
    this.cornerBottomLeft({
      x: this.x(),
      y: this.y() + this.height()
    });
    this.cornerBottomRight({
      x: this.x() + this.width(),
      y: this.y() + this.height()
    });
    const centerX = this.getCenterX;
    const centerY = this.getCenterY;
    this.rotationCenterX(centerX);
    this.rotationCenterY(centerY);
    this.hotCornerTopLeft({
      x: this.cornerTopLeft().x - this.hotAreaGap(),
      y: this.cornerTopLeft().y - this.hotAreaGap()
    });
    this.hotCornerTopRight({
      x: this.cornerTopRight().x + this.hotAreaGap(),
      y: this.cornerTopRight().y - this.hotAreaGap()
    });
    this.hotCornerBottomLeft({
      x: this.cornerBottomLeft().x - this.hotAreaGap(),
      y: this.cornerBottomLeft().y + this.hotAreaGap()
    });
    this.hotCornerBottomRight({
      x: this.cornerBottomRight().x + this.hotAreaGap(),
      y: this.cornerBottomRight().y + this.hotAreaGap()
    });
    this.hotRotCornerTopLeft({
      x: this.hotCornerTopLeft().x - this.hotAreaSize(),
      y: this.hotCornerTopLeft().y - this.hotAreaSize()
    });
    this.hotRotCornerTopRight({
      x: this.hotCornerTopRight().x + this.hotAreaSize(),
      y: this.hotCornerTopRight().y - this.hotAreaSize()
    });
    this.hotRotCornerBottomLeft({
      x: this.hotCornerBottomLeft().x - this.hotAreaSize(),
      y: this.hotCornerBottomLeft().y + this.hotAreaSize()
    });
    this.hotRotCornerBottomRight({
      x: this.hotCornerBottomRight().x + this.hotAreaSize(),
      y: this.hotCornerBottomRight().y + this.hotAreaSize()
    });
    this.hotRotatableAreaTopLeft({
      topLeft: {
        x: this.hotRotCornerTopLeft().x,
        y: this.hotRotCornerTopLeft().y
      },
      topRight: {
        x: this.hotRotCornerTopLeft().x + this.hotAreaSize(),
        y: this.hotRotCornerTopLeft().y
      },
      bottomLeft: {
        x: this.hotRotCornerTopLeft().x,
        y: this.hotRotCornerTopLeft().y + this.hotAreaSize()
      },
      bottomRight: {
        x: this.hotRotCornerTopLeft().x + this.hotAreaSize(),
        y: this.hotRotCornerTopLeft().y + this.hotAreaSize()
      }
    });
    this.hotRotatableAreaTopRight({
      topLeft: {
        x: this.hotRotCornerTopRight().x - this.hotAreaSize(),
        y: this.hotRotCornerTopRight().y
      },
      topRight: {
        x: this.hotRotCornerTopRight().x,
        y: this.hotRotCornerTopRight().y
      },
      bottomLeft: {
        x: this.hotRotCornerTopRight().x - this.hotAreaSize(),
        y: this.hotRotCornerTopRight().y + this.hotAreaSize()
      },
      bottomRight: {
        x: this.hotRotCornerTopRight().x,
        y: this.hotRotCornerTopRight().y + this.hotAreaSize()
      }
    });
    this.hotRotatableAreaBottomLeft({
      topLeft: {
        x: this.hotRotCornerBottomLeft().x,
        y: this.hotRotCornerBottomLeft().y - this.hotAreaSize()
      },
      topRight: {
        x: this.hotRotCornerBottomLeft().x + this.hotAreaSize(),
        y: this.hotRotCornerBottomLeft().y - this.hotAreaSize()
      },
      bottomLeft: {
        x: this.hotRotCornerBottomLeft().x,
        y: this.hotRotCornerBottomLeft().y
      },
      bottomRight: {
        x: this.hotRotCornerBottomLeft().x + this.hotAreaSize(),
        y: this.hotRotCornerBottomLeft().y
      }
    });
    this.hotRotatableAreaBottomRight({
      topLeft: {
        x: this.hotRotCornerBottomRight().x - this.hotAreaSize(),
        y: this.hotRotCornerBottomRight().y - this.hotAreaSize()
      },
      topRight: {
        x: this.hotRotCornerBottomRight().x,
        y: this.hotRotCornerBottomRight().y - this.hotAreaSize()
      },
      bottomLeft: {
        x: this.hotRotCornerBottomRight().x - this.hotAreaSize(),
        y: this.hotRotCornerBottomRight().y
      },
      bottomRight: {
        x: this.hotRotCornerBottomRight().x,
        y: this.hotRotCornerBottomRight().y
      }
    });
    this.hotResizableAreaTopLeft({
      topLeft: {
        x: this.hotCornerTopLeft().x,
        y: this.hotCornerTopLeft().y
      },
      topRight: {
        x: this.hotCornerTopLeft().x + this.hotAreaSize(),
        y: this.hotCornerTopLeft().y
      },
      bottomLeft: {
        x: this.hotCornerTopLeft().x,
        y: this.hotCornerTopLeft().y + this.hotAreaSize()
      },
      bottomRight: {
        x: this.hotCornerTopLeft().x + this.hotAreaSize(),
        y: this.hotCornerTopLeft().y + this.hotAreaSize()
      }
    });
    this.hotResizableAreaTopRight({
      topLeft: {
        x: this.hotCornerTopRight().x - this.hotAreaSize(),
        y: this.hotCornerTopRight().y
      },
      topRight: {
        x: this.hotCornerTopRight().x,
        y: this.hotCornerTopRight().y
      },
      bottomLeft: {
        x: this.hotCornerTopRight().x - this.hotAreaSize(),
        y: this.hotCornerTopRight().y + this.hotAreaSize()
      },
      bottomRight: {
        x: this.hotCornerTopRight().x,
        y: this.hotCornerTopRight().y + this.hotAreaSize()
      }
    });
    this.hotResizableAreaBottomLeft({
      topLeft: {
        x: this.hotCornerBottomLeft().x,
        y: this.hotCornerBottomLeft().y - this.hotAreaSize()
      },
      topRight: {
        x: this.hotCornerBottomLeft().x + this.hotAreaSize(),
        y: this.hotCornerBottomLeft().y - this.hotAreaSize()
      },
      bottomLeft: {
        x: this.hotCornerBottomLeft().x,
        y: this.hotCornerBottomLeft().y
      },
      bottomRight: {
        x: this.hotCornerBottomLeft().x + this.hotAreaSize(),
        y: this.hotCornerBottomLeft().y
      }
    });
    this.hotResizableAreaBottomRight({
      topLeft: {
        x: this.hotCornerBottomRight().x - this.hotAreaSize(),
        y: this.hotCornerBottomRight().y - this.hotAreaSize()
      },
      topRight: {
        x: this.hotCornerBottomRight().x,
        y: this.hotCornerBottomRight().y - this.hotAreaSize()
      },
      bottomLeft: {
        x: this.hotCornerBottomRight().x - this.hotAreaSize(),
        y: this.hotCornerBottomRight().y
      },
      bottomRight: {
        x: this.hotCornerBottomRight().x,
        y: this.hotCornerBottomRight().y
      }
    });
    this.hotResizableAreaTop({
      topLeft: {
        x: this.hotCornerTopLeft().x,
        y: this.hotCornerTopLeft().y
      },
      topRight: {
        x: this.hotCornerTopRight().x,
        y: this.hotCornerTopRight().y
      },
      bottomLeft: {
        x: this.hotCornerTopLeft().x,
        y: this.hotCornerTopLeft().y + this.hotAreaSize()
      },
      bottomRight: {
        x: this.hotCornerTopRight().x,
        y: this.hotCornerTopRight().y + this.hotAreaSize()
      }
    });
    this.hotResizableAreaRight({
      topLeft: {
        x: this.hotCornerTopRight().x - this.hotAreaSize(),
        y: this.hotCornerTopRight().y
      },
      topRight: {
        x: this.hotCornerTopRight().x,
        y: this.hotCornerTopRight().y
      },
      bottomLeft: {
        x: this.hotCornerBottomRight().x - this.hotAreaSize(),
        y: this.hotCornerBottomRight().y
      },
      bottomRight: {
        x: this.hotCornerBottomRight().x,
        y: this.hotCornerBottomRight().y
      }
    });
    this.hotResizableAreaLeft({
      topLeft: {
        x: this.hotCornerTopLeft().x,
        y: this.hotCornerTopLeft().y
      },
      topRight: {
        x: this.hotCornerTopLeft().x + this.hotAreaSize(),
        y: this.hotCornerTopLeft().y
      },
      bottomLeft: {
        x: this.hotCornerBottomLeft().x,
        y: this.hotCornerBottomLeft().y
      },
      bottomRight: {
        x: this.hotCornerBottomLeft().x + this.hotAreaSize(),
        y: this.hotCornerBottomLeft().y
      }
    });
    this.hotResizableAreaBottom({
      topLeft: {
        x: this.hotCornerBottomLeft().x,
        y: this.hotCornerBottomLeft().y - this.hotAreaSize()
      },
      topRight: {
        x: this.hotCornerBottomRight().x,
        y: this.hotCornerBottomRight().y - this.hotAreaSize()
      },
      bottomLeft: {
        x: this.hotCornerBottomLeft().x,
        y: this.hotCornerBottomLeft().y
      },
      bottomRight: {
        x: this.hotCornerBottomRight().x,
        y: this.hotCornerBottomRight().y
      }
    });
    this.#rotationCorners = {
      topLeft: { ...this.hotRotCornerTopLeft() },
      bottomLeft: { ...this.hotRotCornerBottomLeft() },
      topRight: { ...this.hotRotCornerTopRight() },
      bottomRight: { ...this.hotRotCornerBottomRight() }
    };
    this.#updateCornerByRot(this.rotate());
  }
  get __isHidden() {
    return this.hidden() || this.__hidden;
  }
  get __isHorizontalFlipped() {
    let topLeft = this.cornerTopLeft();
    let topRight = this.cornerTopRight();
    let bottomLeft = this.cornerBottomLeft();
    let bottomRight = this.cornerBottomRight();
    if (this.rotate() !== 0) {
      topLeft = this.__rotateCorners(
        this.cornerTopLeft().x,
        this.cornerTopLeft().y,
        0
      );
      topRight = this.__rotateCorners(
        this.cornerTopRight().x,
        this.cornerTopRight().y,
        0
      );
      bottomLeft = this.__rotateCorners(
        this.cornerBottomLeft().x,
        this.cornerBottomLeft().y,
        0
      );
      bottomRight = this.__rotateCorners(
        this.cornerBottomRight().x,
        this.cornerBottomRight().y,
        0
      );
    }
    if (topLeft.x > topRight.x || bottomLeft.x > bottomRight.x) return true;
    return false;
  }
  get __isVerticalFlipped() {
    let topLeft = this.cornerTopLeft();
    let topRight = this.cornerTopRight();
    let bottomLeft = this.cornerBottomLeft();
    let bottomRight = this.cornerBottomRight();
    if (this.rotate() !== 0) {
      topLeft = this.__rotateCorners(
        this.cornerTopLeft().x,
        this.cornerTopLeft().y,
        0
      );
      topRight = this.__rotateCorners(
        this.cornerTopRight().x,
        this.cornerTopRight().y,
        0
      );
      bottomLeft = this.__rotateCorners(
        this.cornerBottomLeft().x,
        this.cornerBottomLeft().y,
        0
      );
      bottomRight = this.__rotateCorners(
        this.cornerBottomRight().x,
        this.cornerBottomRight().y,
        0
      );
    }
    if (topLeft.y > bottomLeft.y || topRight.y > bottomRight.y) return true;
    return false;
  }
  __unitConverter({
    val,
    widthRelated
  }) {
    if (val && typeof val === "string") {
      if (val in namedColors) {
        colorToRgba(val);
      } else if (val.startsWith("#")) {
        return hexToRgba(val);
      } else if (val.startsWith("hsl")) {
        return hslToRgba(val);
      } else if (/^\d/.test(val)) {
        const size = widthRelated ? this.parentWidth : this.parentHeight;
        const space = widthRelated ? this.__widthSpaces : this.__heightSpaces;
        if (val.endsWith("px")) return Number(val.split("px")[0]);
        else if (val.endsWith("%")) {
          return fromPercentage(
            Number(val.split("%")[0]),
            size || 1
          ) - space;
        } else if (val.endsWith("rem"))
          return fromRem(
            Number(val.split("rem")[0]),
            this.canvas?.width || 1
          ) - space;
        else if (val.endsWith("em")) {
          return fromEm(Number(val.split("em")[0]), size || 1) - space;
        } else if (val.endsWith("vh") && widthRelated !== void 0 && widthRelated === false)
          return fromVH(
            Number(val.split("vh")[0]),
            this.canvas?.height || 1
          ) - this.__heightSpaces;
        else if (val.endsWith("vw") && widthRelated !== void 0 && widthRelated === true)
          return fromVW(
            Number(val.split("vw")[0]),
            this.canvas?.width || 1
          ) - space;
        else if (val.endsWith("cm"))
          return fromCm(Number(val.split("cm")[0]));
        else if (val.endsWith("mm"))
          return fromMm(Number(val.split("mm")[0]));
        else if (val.endsWith("q"))
          return fromQ(Number(val.split("q")[0]));
        else if (val.endsWith("in"))
          return fromIn(Number(val.split("in")[0]));
        else if (val.endsWith("pc"))
          return fromPc(Number(val.split("pc")[0]));
        else if (val.endsWith("pt"))
          return fromPt(Number(val.split("pt")[0]));
      }
    }
    return val;
  }
  get parentWidth() {
    if (this.#isBlock) return this.parentNode?.width();
    return this.canvas?.width;
  }
  get parentHeight() {
    if (this.#isBlock) return this.parentNode?.height();
    return this.canvas?.height;
  }
  get #isBlock() {
    if (this.parentNode && Object.getPrototypeOf(this.parentNode).constructor.name !== "Node")
      return true;
    return false;
  }
  get __leftSpace() {
    return this.paddingLeft() + this.marginLeft();
  }
  get __rightSpace() {
    return this.paddingRight() + this.marginRight();
  }
  get __topSpace() {
    return this.paddingTop() + this.marginTop();
  }
  get __bottomSpace() {
    return this.paddingBottom() + this.marginBottom();
  }
  get __widthSpaces() {
    return this.__leftSpace + this.__rightSpace;
  }
  get __heightSpaces() {
    return this.__topSpace + this.__bottomSpace;
  }
  __valueHandler(opt, option, defaultOpt, widthRelated) {
    const important = this.ownOptions.important?.[option] !== void 0 ? this.ownOptions.important?.[option] : opt;
    const oldVal = this.ownOptions[option];
    const cached = this.__cacheOption(important, option, defaultOpt);
    let val = this.__unitConverter({
      val: cached,
      widthRelated
    });
    this.setChangeCache(option, oldVal);
    return val;
  }
  __cacheOption(opt, option, defaultOpt) {
    if (opt !== void 0) this.ownOptions[option] = opt;
    else if (this.ownOptions[option] === void 0)
      this.ownOptions[option] = defaultOpt;
    return this.ownOptions[option];
  }
  setChangeCache(option, old) {
    this.#changedCache[option] = { oldValue: old };
  }
  getCacheValue(option) {
    return this.#changedCache[option]?.oldValue;
  }
  optionHasChanged(option, currentVal) {
    if (this.#changedCache[option]) {
      if (Object.hasOwn(this.ownOptions, option))
        currentVal = this.ownOptions[option];
      const changed = this.#changedCache[option].oldValue !== currentVal;
      this.setChangeCache(option, currentVal);
      return changed;
    }
    return false;
  }
  get cacheChanges() {
    return this.#changedCache;
  }
  x(opt) {
    let cacheX = this.__unitConverter({
      val: this.ownOptions.x || 0,
      widthRelated: true
    });
    const x = this.__valueHandler(opt, "x", 0, true);
    const diffX = x - cacheX;
    if (diffX !== 0) {
      const cacheR = this.rotate();
      this.rotate(0);
      this.rotationCenterX(this.rotationCenterX() + diffX);
      this.cornerTopLeft({
        x: this.cornerTopLeft().x + diffX,
        y: this.cornerTopLeft().y
      });
      this.cornerTopRight({
        x: this.cornerTopRight().x + diffX,
        y: this.cornerTopRight().y
      });
      this.cornerBottomLeft({
        x: this.cornerBottomLeft().x + diffX,
        y: this.cornerBottomLeft().y
      });
      this.cornerBottomRight({
        x: this.cornerBottomRight().x + diffX,
        y: this.cornerBottomRight().y
      });
      this.rotate(cacheR);
    }
    return x;
  }
  y(opt) {
    let cacheY = this.__unitConverter({
      val: this.ownOptions.y || 0,
      widthRelated: false
    });
    const y = this.__valueHandler(opt, "y", 0, false);
    const diffY = y - cacheY;
    if (cacheY !== y && diffY !== 0) {
      const cacheR = this.rotate();
      this.rotate(0);
      this.rotationCenterY(this.rotationCenterY() + diffY);
      this.cornerTopLeft({
        x: this.cornerTopLeft().x,
        y: this.cornerTopLeft().y + diffY
      });
      this.cornerTopRight({
        x: this.cornerTopRight().x,
        y: this.cornerTopRight().y + diffY
      });
      this.cornerBottomLeft({
        x: this.cornerBottomLeft().x,
        y: this.cornerBottomLeft().y + diffY
      });
      this.cornerBottomRight({
        x: this.cornerBottomRight().x,
        y: this.cornerBottomRight().y + diffY
      });
      this.rotate(cacheR);
    }
    return y;
  }
  width(opt) {
    let cacheW = this.__unitConverter({
      val: this.ownOptions.width || 0,
      widthRelated: true
    });
    const w = this.__valueHandler(opt, "width", 0, true);
    if (w < this.minWidth() && !this.horizontalFlipResize())
      return this.minWidth();
    const diffW = w - cacheW;
    if (diffW !== 0) {
      const cacheR = this.rotate();
      this.rotate(0);
      this.rotationCenterX(this.rotationCenterX() + diffW / 2);
      this.cornerTopRight({
        x: this.cornerTopRight().x + diffW,
        y: this.cornerTopRight().y
      });
      this.cornerBottomRight({
        x: this.cornerBottomRight().x + diffW,
        y: this.cornerBottomRight().y
      });
      this.rotate(cacheR);
    }
    return w;
  }
  height(opt) {
    let cacheH = this.__unitConverter({
      val: this.ownOptions.height || 0,
      widthRelated: false
    });
    const h = this.__valueHandler(opt, "height", 0, false);
    if (h < this.minHeight() && !this.verticalFlipResize())
      return this.minHeight();
    const diffH = h - cacheH;
    if (diffH !== 0) {
      const cacheR = this.rotate();
      this.rotate(0);
      this.rotationCenterY(this.rotationCenterY() + diffH / 2);
      this.cornerBottomLeft({
        x: this.cornerBottomLeft().x,
        y: this.cornerBottomLeft().y + diffH
      });
      this.cornerBottomRight({
        x: this.cornerBottomRight().x,
        y: this.cornerBottomRight().y + diffH
      });
      this.rotate(cacheR);
    }
    return h;
  }
  minWidth(opt) {
    return this.__valueHandler(opt, "minWidth", 0, true);
  }
  minHeight(opt) {
    return this.__valueHandler(opt, "minHeight", 0, false);
  }
  maxWidth(opt) {
    return this.__valueHandler(opt, "maxWidth", this.width(), true);
  }
  maxHeight(opt) {
    return this.__valueHandler(opt, "maxHeight", this.height(), false);
  }
  position(opt) {
    const pos = this.__valueHandler(
      opt,
      "position",
      void 0
    );
    if (pos === "static") {
      if (!this.__runningEvents.drag && !this.__runningEvents.resize && !this.__runningEvents.rotate) {
        if (this.top() !== void 0) this.y(this.top());
        else if (this.bottom() !== void 0)
          this.y(
            Math.abs((this.canvas?.height || 1) - this.height()) - this.bottom()
          );
        if (this.left() !== void 0) this.x(this.left());
        else if (this.right() !== void 0)
          this.x(
            Math.abs((this.canvas?.width || 1) - this.width()) - this.right()
          );
        this.rotate(0);
      }
    } else if (pos === "fixed") {
      if (this.top() !== void 0) this.y(this.top());
      else if (this.bottom() !== void 0)
        this.y(
          Math.abs((this.canvas?.height || 1) - this.height()) - this.bottom()
        );
      if (this.left() !== void 0) this.x(+this.left());
      else if (this.right() !== void 0)
        this.x(
          +Math.abs((this.canvas?.width || 1) - this.width()) - this.right()
        );
    } else if (pos === "sticky") {
      if (this.top() !== void 0 && this.getTop.y <= this.top()) {
        this.y(this.top());
      } else if (this.bottom() !== void 0 && this.getBottom.y >= (this.canvas?.height || 1) - this.bottom()) {
        this.y(
          Math.abs((this.canvas?.height || 1) - this.height()) - this.bottom()
        );
      }
      if (this.left() !== void 0 && this.getLeft.x <= this.left()) {
        this.x(this.left());
      } else if (this.right() !== void 0 && this.getRight.x >= (this.canvas?.width || 1) - this.right()) {
        this.x(
          Math.abs((this.canvas?.width || 1) - this.width()) - this.right()
        );
      }
    } else if (pos === "absolute") {
      if (this.left() !== void 0) this.x(this.left());
      else if (this.right() !== void 0)
        this.x(
          Math.abs((this.canvas?.width || 1) - this.width()) - this.right()
        );
      if (this.top() !== void 0) {
        this.y(this.top());
      } else if (this.bottom() !== void 0)
        this.y(
          Math.abs((this.canvas?.height || 1) - this.height()) - this.bottom()
        );
    } else if (pos === "relative") {
      if (this.left() !== void 0) {
        this.x(this.x() + this.left());
      } else if (this.right() !== void 0)
        this.x(this.x() - this.right());
      if (this.top() !== void 0) this.y(this.y() + this.top());
      else if (this.bottom() !== void 0)
        this.y(this.y() - this.bottom());
    }
    return pos;
  }
  top(opt) {
    return this.__valueHandler(opt, "top", void 0, false);
  }
  bottom(opt) {
    return this.__valueHandler(opt, "bottom", void 0, false);
  }
  left(opt) {
    return this.__valueHandler(opt, "left", void 0, true);
  }
  right(opt) {
    return this.__valueHandler(opt, "right", void 0, true);
  }
  padding(opt) {
    const padding = this.__valueHandler(opt, "padding", []);
    if (typeof padding === "number") {
      this.paddingTop(padding);
      this.paddingBottom(padding);
      this.paddingLeft(padding);
      this.paddingRight(padding);
      return padding;
    }
    this.paddingTop(padding[0] || 0);
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
    return this.__valueHandler(opt, "paddingTop", 0, false);
  }
  paddingBottom(opt) {
    return this.__valueHandler(opt, "paddingBottom", 0, false);
  }
  paddingLeft(opt) {
    return this.__valueHandler(opt, "paddingLeft", 0, true);
  }
  paddingRight(opt) {
    return this.__valueHandler(opt, "paddingRight", 0, true);
  }
  margin(opt) {
    const margin = this.__valueHandler(opt, "margin", []);
    this.marginTop(margin[0] || 0);
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
    const cacheM = this.__unitConverter({
      val: this.ownOptions.marginTop,
      widthRelated: false
    }) || 0;
    const m = this.__valueHandler(opt, "marginTop", 0, false);
    const diffM = m - cacheM;
    if (diffM !== 0) this.y(this.y() + diffM);
    return m;
  }
  marginBottom(opt) {
    const cacheM = this.__unitConverter({
      val: this.ownOptions.marginBottom,
      widthRelated: false
    }) || 0;
    const m = this.__valueHandler(opt, "marginBottom", 0, false);
    const diffM = m - cacheM;
    if (diffM !== 0) this.y(this.y() - diffM);
    return m;
  }
  marginLeft(opt) {
    const cacheM = this.__unitConverter({
      val: this.ownOptions.marginLeft,
      widthRelated: true
    }) || 0;
    const m = this.__valueHandler(opt, "marginLeft", 0, true);
    const diffM = m - cacheM;
    if (diffM !== 0) this.x(this.x() + diffM);
    return m;
  }
  marginRight(opt) {
    const cacheM = this.__unitConverter({
      val: this.ownOptions.marginRight,
      widthRelated: true
    }) || 0;
    const m = this.__valueHandler(opt, "marginRight", 0, true);
    const diffM = m - cacheM;
    if (diffM !== 0) this.x(this.x() - diffM);
    return m;
  }
  overflow(opt) {
    return this.__valueHandler(opt, "overflow", "visible", false);
  }
  overflowX(opt) {
    return this.__valueHandler(opt, "overflowX", "visible", false);
  }
  overflowY(opt) {
    return this.__valueHandler(opt, "overflowY", "visible", false);
  }
  cornerTopLeft(opt) {
    const cacheCords = this.ownOptions.cornerTopLeft || { x: 0, y: 0 };
    const corner = this.__valueHandler(opt, "cornerTopLeft", {
      x: 0,
      y: 0
    });
    const diffX = corner.x - cacheCords.x;
    if (diffX !== 0) {
      this.hotCornerTopLeft({
        x: this.hotCornerTopLeft().x + diffX,
        y: this.hotCornerTopLeft().y
      });
      this.hotRotCornerTopLeft({
        x: this.hotRotCornerTopLeft().x + diffX,
        y: this.hotRotCornerTopLeft().y
      });
    }
    const diffY = corner.y - cacheCords.y;
    if (diffY !== 0) {
      this.hotCornerTopLeft({
        x: this.hotCornerTopLeft().x,
        y: this.hotCornerTopLeft().y + diffY
      });
      this.hotRotCornerTopLeft({
        x: this.hotRotCornerTopLeft().x,
        y: this.hotRotCornerTopLeft().y + diffY
      });
    }
    return corner;
  }
  cornerTopRight(opt) {
    const cacheCords = this.ownOptions.cornerTopRight || { x: 0, y: 0 };
    const corner = this.__valueHandler(opt, "cornerTopRight", {
      x: 0,
      y: 0
    });
    const diffX = corner.x - cacheCords.x;
    if (diffX !== 0) {
      this.hotCornerTopRight({
        x: this.hotCornerTopRight().x + diffX,
        y: this.hotCornerTopRight().y
      });
      this.hotRotCornerTopRight({
        x: this.hotRotCornerTopRight().x + diffX,
        y: this.hotRotCornerTopRight().y
      });
    }
    const diffY = corner.y - cacheCords.y;
    if (diffY !== 0) {
      this.hotCornerTopRight({
        x: this.hotCornerTopRight().x,
        y: this.hotCornerTopRight().y + diffY
      });
      this.hotRotCornerTopRight({
        x: this.hotRotCornerTopRight().x,
        y: this.hotRotCornerTopRight().y + diffY
      });
    }
    return corner;
  }
  cornerBottomLeft(opt) {
    const cacheCords = this.ownOptions.cornerBottomLeft || { x: 0, y: 0 };
    const corner = this.__valueHandler(opt, "cornerBottomLeft", {
      x: 0,
      y: 0
    });
    const diffX = corner.x - cacheCords.x;
    if (diffX !== 0) {
      this.hotCornerBottomLeft({
        x: this.hotCornerBottomLeft().x + diffX,
        y: this.hotCornerBottomLeft().y
      });
      this.hotRotCornerBottomLeft({
        x: this.hotRotCornerBottomLeft().x + diffX,
        y: this.hotRotCornerBottomLeft().y
      });
    }
    const diffY = corner.y - cacheCords.y;
    if (diffY !== 0) {
      this.hotCornerBottomLeft({
        x: this.hotCornerBottomLeft().x,
        y: this.hotCornerBottomLeft().y + diffY
      });
      this.hotRotCornerBottomLeft({
        x: this.hotRotCornerBottomLeft().x,
        y: this.hotRotCornerBottomLeft().y + diffY
      });
    }
    return corner;
  }
  cornerBottomRight(opt) {
    const cacheCords = this.ownOptions.cornerBottomRight || { x: 0, y: 0 };
    const corner = this.__valueHandler(opt, "cornerBottomRight", {
      x: 0,
      y: 0
    });
    const diffX = corner.x - cacheCords.x;
    if (diffX !== 0) {
      this.hotCornerBottomRight({
        x: this.hotCornerBottomRight().x + diffX,
        y: this.hotCornerBottomRight().y
      });
      this.hotRotCornerBottomRight({
        x: this.hotRotCornerBottomRight().x + diffX,
        y: this.hotRotCornerBottomRight().y
      });
    }
    const diffY = corner.y - cacheCords.y;
    if (diffY !== 0) {
      this.hotCornerBottomRight({
        x: this.hotCornerBottomRight().x,
        y: this.hotCornerBottomRight().y + diffY
      });
      this.hotRotCornerBottomRight({
        x: this.hotRotCornerBottomRight().x,
        y: this.hotRotCornerBottomRight().y + diffY
      });
    }
    return corner;
  }
  hotCornerTopLeft(opt) {
    const cacheCords = this.ownOptions.hotCornerTopLeft || { x: 0, y: 0 };
    const corner = this.__valueHandler(opt, "hotCornerTopLeft", {
      x: 0,
      y: 0
    });
    const diffX = corner.x - cacheCords.x;
    if (diffX !== 0) {
      this.#updateAreaCordX("hotResizableAreaTopLeft", diffX);
      if (this.ownOptions.hotResizableAreaTop) {
        this.ownOptions.hotResizableAreaTop.topLeft.x += diffX;
        this.ownOptions.hotResizableAreaTop.bottomLeft.x += diffX;
      }
      if (this.ownOptions.hotResizableAreaLeft) {
        this.ownOptions.hotResizableAreaLeft.topLeft.x += diffX;
        this.ownOptions.hotResizableAreaLeft.topRight.x += diffX;
      }
    }
    const diffY = corner.y - cacheCords.y;
    if (diffY !== 0) {
      this.#updateAreaCordY("hotResizableAreaTopLeft", diffY);
      if (this.ownOptions.hotResizableAreaTop) {
        this.ownOptions.hotResizableAreaTop.topLeft.y += diffY;
        this.ownOptions.hotResizableAreaTop.bottomLeft.y += diffY;
      }
      if (this.ownOptions.hotResizableAreaLeft) {
        this.ownOptions.hotResizableAreaLeft.topLeft.y += diffY;
        this.ownOptions.hotResizableAreaLeft.topRight.y += diffY;
      }
    }
    return corner;
  }
  hotCornerTopRight(opt) {
    const cacheCords = this.ownOptions.hotCornerTopRight || { x: 0, y: 0 };
    const corner = this.__valueHandler(opt, "hotCornerTopRight", {
      x: 0,
      y: 0
    });
    const diffX = corner.x - cacheCords.x;
    if (diffX !== 0) {
      this.#updateAreaCordX("hotResizableAreaTopRight", diffX);
      if (this.ownOptions.hotResizableAreaTop) {
        this.ownOptions.hotResizableAreaTop.topRight.x += diffX;
        this.ownOptions.hotResizableAreaTop.bottomRight.x += diffX;
      }
      if (this.ownOptions.hotResizableAreaRight) {
        this.ownOptions.hotResizableAreaRight.topRight.x += diffX;
        this.ownOptions.hotResizableAreaRight.topLeft.x += diffX;
      }
    }
    const diffY = corner.y - cacheCords.y;
    if (diffY !== 0) {
      this.#updateAreaCordY("hotResizableAreaTopRight", diffY);
      if (this.ownOptions.hotResizableAreaTop) {
        this.ownOptions.hotResizableAreaTop.topRight.y += diffY;
        this.ownOptions.hotResizableAreaTop.bottomRight.y += diffY;
      }
      if (this.ownOptions.hotResizableAreaRight) {
        this.ownOptions.hotResizableAreaRight.topRight.y += diffY;
        this.ownOptions.hotResizableAreaRight.topLeft.y += diffY;
      }
    }
    return corner;
  }
  hotCornerBottomLeft(opt) {
    const cacheCords = this.ownOptions.hotCornerBottomLeft || {
      x: 0,
      y: 0
    };
    const corner = this.__valueHandler(opt, "hotCornerBottomLeft", {
      x: 0,
      y: 0
    });
    const diffX = corner.x - cacheCords.x;
    if (diffX !== 0) {
      this.#updateAreaCordX("hotResizableAreaBottomLeft", diffX);
      if (this.ownOptions.hotResizableAreaBottom) {
        this.ownOptions.hotResizableAreaBottom.topLeft.x += diffX;
        this.ownOptions.hotResizableAreaBottom.bottomLeft.x += diffX;
      }
      if (this.ownOptions.hotResizableAreaLeft) {
        this.ownOptions.hotResizableAreaLeft.bottomLeft.x += diffX;
        this.ownOptions.hotResizableAreaLeft.bottomRight.x += diffX;
      }
    }
    const diffY = corner.y - cacheCords.y;
    if (diffY !== 0) {
      this.#updateAreaCordY("hotResizableAreaBottomLeft", diffY);
      if (this.ownOptions.hotResizableAreaBottom) {
        this.ownOptions.hotResizableAreaBottom.topLeft.y += diffY;
        this.ownOptions.hotResizableAreaBottom.bottomLeft.y += diffY;
      }
      if (this.ownOptions.hotResizableAreaLeft) {
        this.ownOptions.hotResizableAreaLeft.bottomLeft.y += diffY;
        this.ownOptions.hotResizableAreaLeft.bottomRight.y += diffY;
      }
    }
    return corner;
  }
  hotCornerBottomRight(opt) {
    const cacheCords = this.ownOptions.hotCornerBottomRight || {
      x: 0,
      y: 0
    };
    const corner = this.__valueHandler(opt, "hotCornerBottomRight", {
      x: 0,
      y: 0
    });
    const diffX = corner.x - cacheCords.x;
    if (diffX !== 0) {
      this.#updateAreaCordX("hotResizableAreaBottomRight", diffX);
      if (this.ownOptions.hotResizableAreaBottom) {
        this.ownOptions.hotResizableAreaBottom.topRight.x += diffX;
        this.ownOptions.hotResizableAreaBottom.bottomRight.x += diffX;
      }
      if (this.ownOptions.hotResizableAreaRight) {
        this.ownOptions.hotResizableAreaRight.bottomRight.x += diffX;
        this.ownOptions.hotResizableAreaRight.bottomLeft.x += diffX;
      }
    }
    const diffY = corner.y - cacheCords.y;
    if (diffY !== 0) {
      this.#updateAreaCordY("hotResizableAreaBottomRight", diffY);
      if (this.ownOptions.hotResizableAreaBottom) {
        this.ownOptions.hotResizableAreaBottom.topRight.y += diffY;
        this.ownOptions.hotResizableAreaBottom.bottomRight.y += diffY;
      }
      if (this.ownOptions.hotResizableAreaRight) {
        this.ownOptions.hotResizableAreaRight.bottomRight.y += diffY;
        this.ownOptions.hotResizableAreaRight.bottomLeft.y += diffY;
      }
    }
    return corner;
  }
  hotRotCornerTopLeft(opt) {
    const cacheCorner = this.ownOptions.hotRotCornerTopLeft || {
      x: 0,
      y: 0
    };
    const corner = this.__valueHandler(opt, "hotRotCornerTopLeft", {
      x: 0,
      y: 0
    });
    const diffX = corner.x - cacheCorner.x;
    if (diffX !== 0) {
      this.#updateAreaCordX("hotRotatableAreaTopLeft", diffX);
      this.#rotationCorners.topLeft.x = corner.x;
    }
    const diffY = corner.y - cacheCorner.y;
    if (diffY !== 0) {
      this.#updateAreaCordY("hotRotatableAreaTopLeft", diffY);
      this.#rotationCorners.topLeft.y = corner.y;
    }
    return corner;
  }
  hotRotCornerTopRight(opt) {
    const cacheCorner = this.ownOptions.hotRotCornerTopRight || {
      x: 0,
      y: 0
    };
    const corner = this.__valueHandler(opt, "hotRotCornerTopRight", {
      x: 0,
      y: 0
    });
    const diffX = corner.x - cacheCorner.x;
    if (diffX !== 0) {
      this.#updateAreaCordX("hotRotatableAreaTopRight", diffX);
      this.#rotationCorners.topRight.x = corner.x;
    }
    const diffY = corner.y - cacheCorner.y;
    if (diffY !== 0) {
      this.#updateAreaCordY("hotRotatableAreaTopRight", diffY);
      this.#rotationCorners.topRight.y = corner.y;
    }
    return corner;
  }
  hotRotCornerBottomLeft(opt) {
    const cacheCorner = this.ownOptions.hotRotCornerBottomLeft || {
      x: 0,
      y: 0
    };
    const corner = this.__valueHandler(opt, "hotRotCornerBottomLeft", {
      x: 0,
      y: 0
    });
    const diffX = corner.x - cacheCorner.x;
    if (diffX !== 0) {
      this.#updateAreaCordX("hotRotatableAreaBottomLeft", diffX);
      this.#rotationCorners.bottomLeft.x = corner.x;
    }
    const diffY = corner.y - cacheCorner.y;
    if (diffY !== 0) {
      this.#updateAreaCordY("hotRotatableAreaBottomLeft", diffY);
      this.#rotationCorners.bottomLeft.y = corner.y;
    }
    return corner;
  }
  hotRotCornerBottomRight(opt) {
    const cacheCorner = this.ownOptions.hotRotCornerBottomRight || {
      x: 0,
      y: 0
    };
    const corner = this.__valueHandler(opt, "hotRotCornerBottomRight", {
      x: 0,
      y: 0
    });
    const diffX = corner.x - cacheCorner.x;
    if (diffX !== 0) {
      this.#updateAreaCordX("hotRotatableAreaBottomRight", diffX);
      this.#rotationCorners.bottomRight.x = corner.x;
    }
    const diffY = corner.y - cacheCorner.y;
    if (diffY !== 0) {
      this.#updateAreaCordY("hotRotatableAreaBottomRight", diffY);
      this.#rotationCorners.bottomRight.y = corner.y;
    }
    return corner;
  }
  hotRotatableAreaTopLeft(opt) {
    return this.__valueHandler(opt, "hotRotatableAreaTopLeft", {
      topLeft: {
        x: 0,
        y: 0
      },
      topRight: {
        x: 0,
        y: 0
      },
      bottomLeft: {
        x: 0,
        y: 0
      },
      bottomRight: {
        x: 0,
        y: 0
      }
    });
  }
  hotRotatableAreaTopRight(opt) {
    return this.__valueHandler(opt, "hotRotatableAreaTopRight", {
      topLeft: {
        x: 0,
        y: 0
      },
      topRight: {
        x: 0,
        y: 0
      },
      bottomLeft: {
        x: 0,
        y: 0
      },
      bottomRight: {
        x: 0,
        y: 0
      }
    });
  }
  hotRotatableAreaBottomLeft(opt) {
    return this.__valueHandler(opt, "hotRotatableAreaBottomLeft", {
      topLeft: {
        x: 0,
        y: 0
      },
      topRight: {
        x: 0,
        y: 0
      },
      bottomLeft: {
        x: 0,
        y: 0
      },
      bottomRight: {
        x: 0,
        y: 0
      }
    });
  }
  hotRotatableAreaBottomRight(opt) {
    return this.__valueHandler(opt, "hotRotatableAreaBottomRight", {
      topLeft: {
        x: 0,
        y: 0
      },
      topRight: {
        x: 0,
        y: 0
      },
      bottomLeft: {
        x: 0,
        y: 0
      },
      bottomRight: {
        x: 0,
        y: 0
      }
    });
  }
  hotResizableAreaTopLeft(opt) {
    return this.__valueHandler(opt, "hotResizableAreaTopLeft", {
      topLeft: {
        x: 0,
        y: 0
      },
      topRight: {
        x: 0,
        y: 0
      },
      bottomLeft: {
        x: 0,
        y: 0
      },
      bottomRight: {
        x: 0,
        y: 0
      }
    });
  }
  hotResizableAreaTopRight(opt) {
    return this.__valueHandler(opt, "hotResizableAreaTopRight", {
      topLeft: {
        x: 0,
        y: 0
      },
      topRight: {
        x: 0,
        y: 0
      },
      bottomLeft: {
        x: 0,
        y: 0
      },
      bottomRight: {
        x: 0,
        y: 0
      }
    });
  }
  hotResizableAreaBottomLeft(opt) {
    return this.__valueHandler(opt, "hotResizableAreaBottomLeft", {
      topLeft: {
        x: 0,
        y: 0
      },
      topRight: {
        x: 0,
        y: 0
      },
      bottomLeft: {
        x: 0,
        y: 0
      },
      bottomRight: {
        x: 0,
        y: 0
      }
    });
  }
  hotResizableAreaBottomRight(opt) {
    return this.__valueHandler(opt, "hotResizableAreaBottomRight", {
      topLeft: {
        x: 0,
        y: 0
      },
      topRight: {
        x: 0,
        y: 0
      },
      bottomLeft: {
        x: 0,
        y: 0
      },
      bottomRight: {
        x: 0,
        y: 0
      }
    });
  }
  hotResizableAreaTop(opt) {
    return this.__valueHandler(opt, "hotResizableAreaTop", {
      topLeft: {
        x: 0,
        y: 0
      },
      topRight: {
        x: 0,
        y: 0
      },
      bottomLeft: {
        x: 0,
        y: 0
      },
      bottomRight: {
        x: 0,
        y: 0
      }
    });
  }
  hotResizableAreaBottom(opt) {
    return this.__valueHandler(opt, "hotResizableAreaBottom", {
      topLeft: {
        x: 0,
        y: 0
      },
      topRight: {
        x: 0,
        y: 0
      },
      bottomLeft: {
        x: 0,
        y: 0
      },
      bottomRight: {
        x: 0,
        y: 0
      }
    });
  }
  hotResizableAreaLeft(opt) {
    return this.__valueHandler(opt, "hotResizableAreaLeft", {
      topLeft: {
        x: 0,
        y: 0
      },
      topRight: {
        x: 0,
        y: 0
      },
      bottomLeft: {
        x: 0,
        y: 0
      },
      bottomRight: {
        x: 0,
        y: 0
      }
    });
  }
  hotResizableAreaRight(opt) {
    return this.__valueHandler(opt, "hotResizableAreaRight", {
      topLeft: {
        x: 0,
        y: 0
      },
      topRight: {
        x: 0,
        y: 0
      },
      bottomLeft: {
        x: 0,
        y: 0
      },
      bottomRight: {
        x: 0,
        y: 0
      }
    });
  }
  hotTopFunc(opt) {
    return this.__valueHandler(
      opt,
      "hotTopFunc",
      void 0
    );
  }
  hotLeftFunc(opt) {
    return this.__valueHandler(
      opt,
      "hotLeftFunc",
      void 0
    );
  }
  hotRightFunc(opt) {
    return this.__valueHandler(
      opt,
      "hotRightFunc",
      void 0
    );
  }
  hotBottomFunc(opt) {
    return this.__valueHandler(
      opt,
      "hotBottomFunc",
      void 0
    );
  }
  hotCornerTopLeftFunc(opt) {
    return this.__valueHandler(
      opt,
      "hotCornerTopLeftFunc",
      void 0
    );
  }
  hotCornerTopRightFunc(opt) {
    return this.__valueHandler(
      opt,
      "hotCornerTopRightFunc",
      void 0
    );
  }
  hotCornerBottomLeftFunc(opt) {
    return this.__valueHandler(
      opt,
      "hotCornerBottomLeftFunc",
      void 0
    );
  }
  hotCornerBottomRightFunc(opt) {
    return this.__valueHandler(
      opt,
      "hotCornerBottomRightFunc",
      void 0
    );
  }
  hotAreaSize(opt) {
    return this.__valueHandler(opt, "hotAreaSize", 15);
  }
  rotationCenter(opt) {
    return this.__valueHandler(opt, "rotationCenter", "self", true);
  }
  rotationCenterX(opt) {
    return this.__valueHandler(opt, "rotationCenterX", 0, true);
  }
  rotationCenterY(opt) {
    return this.__valueHandler(opt, "rotationCenterY", 0, false);
  }
  rotationTopLeft(opt) {
    return this.__valueHandler(opt, "rotationTopLeft", true);
  }
  rotationTopRight(opt) {
    return this.__valueHandler(opt, "rotationTopRight", true);
  }
  rotationBottomLeft(opt) {
    return this.__valueHandler(opt, "rotationBottomLeft", true);
  }
  rotationBottomRight(opt) {
    return this.__valueHandler(opt, "rotationBottomRight", true);
  }
  resizeTopLeft(opt) {
    return this.__valueHandler(opt, "resizeTopLeft", true);
  }
  resizeTopRight(opt) {
    return this.__valueHandler(opt, "resizeTopRight", true);
  }
  resizeBottomLeft(opt) {
    return this.__valueHandler(opt, "resizeBottomLeft", true);
  }
  resizeBottomRight(opt) {
    return this.__valueHandler(opt, "resizeBottomRight", true);
  }
  resizeTop(opt) {
    return this.__valueHandler(opt, "resizeTop", true);
  }
  resizeLeft(opt) {
    return this.__valueHandler(opt, "resizeLeft", true);
  }
  resizeRight(opt) {
    return this.__valueHandler(opt, "resizeRight", true);
  }
  resizeBottom(opt) {
    return this.__valueHandler(opt, "resizeBottom", true);
  }
  horizontalFlipResize(opt) {
    return this.__valueHandler(opt, "horizontalFlipResize", false);
  }
  verticalFlipResize(opt) {
    return this.__valueHandler(opt, "verticalFlipResize", false);
  }
  dragX(opt) {
    return this.__valueHandler(opt, "dragX", true);
  }
  dragY(opt) {
    return this.__valueHandler(opt, "dragY", true);
  }
  hotCornerSize(opt) {
    return this.__valueHandler(opt, "hotCornerSize", 5);
  }
  hotCornerRadius(opt) {
    return this.__valueHandler(opt, "hotCornerRadius", [0]);
  }
  hotCornerStrokeWidth(opt) {
    return this.__valueHandler(opt, "hotCornerStrokeWidth", 0);
  }
  hotCornerStrokeColor(opt) {
    return this.__valueHandler(opt, "hotCornerStrokeColor", "blue");
  }
  hotCornerBackgroundColor(opt) {
    return this.__valueHandler(opt, "hotCornerBackgroundColor", "white");
  }
  hotLineStrokeWidth(opt) {
    return this.__valueHandler(opt, "hotTopStrokeWidth", 1.5);
  }
  hotLineStrokeColor(opt) {
    return this.__valueHandler(opt, "hotTopStrokeColor", "blue");
  }
  hotAreaGap(opt) {
    return this.__valueHandler(opt, "hotAreaGap", 0);
  }
  hidden(opt) {
    return this.__valueHandler(opt, "hidden", false);
  }
  important(opt) {
    return this.__valueHandler(
      opt,
      "important",
      void 0
    );
  }
  flex(opt) {
    const flex = this.__valueHandler(opt, "flex", [
      this.flexGrow(),
      this.flexShrink(),
      this.flexBasis()
    ]);
    this.flexGrow(flex[0]);
    this.flexShrink(flex[1]);
    this.flexBasis(flex[2]);
    return flex;
  }
  flexBasis(opt) {
    return this.__valueHandler(opt, "flexBasis", "auto");
  }
  flexShrink(opt) {
    return this.__valueHandler(opt, "flexShrink", 0);
  }
  flexGrow(opt) {
    return this.__valueHandler(opt, "flexGrow", 0);
  }
  order(opt) {
    return this.__valueHandler(opt, "order", void 0);
  }
  alignSelf(opt) {
    return this.__valueHandler(opt, "alignSelf", "auto");
  }
  justifySelf(opt) {
    return this.__valueHandler(opt, "justifySelf", "auto");
  }
  gridRow(opt) {
    return this.__valueHandler(opt, "gridRow", []);
  }
  gridRowStart(opt) {
    return this.__valueHandler(opt, "gridRowStart", 0);
  }
  gridRowEnd(opt) {
    return this.__valueHandler(opt, "gridRowEnd", 0);
  }
  gridColumn(opt) {
    return this.__valueHandler(opt, "gridColumn", []);
  }
  gridColumnStart(opt) {
    return this.__valueHandler(opt, "gridColumnStart", 0);
  }
  gridColumnEnd(opt) {
    return this.__valueHandler(opt, "gridColumnEnd", 0);
  }
  gridArea(opt) {
    const gridArea = this.__valueHandler(opt, "gridArea", []);
    this.gridRowStart(gridArea[0] || "auto");
    this.gridColumnStart(gridArea[1] || "auto");
    this.gridRowEnd(gridArea[2] || "auto");
    this.gridColumnEnd(gridArea[3] || "auto");
    return gridArea;
  }
  zIndex(opt) {
    const cacheZ = this.ownOptions.zIndex || void 0;
    const z = this.__valueHandler(opt, "zIndex", void 0);
    if (z !== cacheZ) this.canvas?.refreshHead();
    return z;
  }
  set(options) {
    let before = {};
    let after = {};
    for (const [key, value] of Object.entries(options)) {
      const obj = getPrototype(this, key);
      let beforeValue = obj?.value.call(this);
      obj?.value.call(this, value);
      before[this.nodeId] = {};
      after[this.nodeId] = {};
      before[this.nodeId][key] = beforeValue;
      after[this.nodeId][key] = value;
    }
    if (Object.keys(before).length !== 0) {
      this.canvas?.takeSnapshot(before, after);
      this.invokeChange();
    }
  }
  scale(opt) {
    const scale = this.__valueHandler(opt, "scale", 1);
    this.width(this.width() * scale);
    this.height(this.height() * scale);
  }
  __translate(t) {
    if (this.ownOptions.position === "fixed") return;
    this.x(this.x() + t.x);
    this.y(this.y() + t.y);
    if (this.ownOptions.position == "absolute") {
      if (this.left() !== void 0) this.left(this.left() + t.x);
      else if (this.right() !== void 0)
        this.right(this.right() - t.x);
      if (this.top() !== void 0) this.top(this.top() + t.y);
      else if (this.bottom() !== void 0)
        this.bottom(this.bottom() - t.y);
    } else if (this.ownOptions.position == "relative") {
    }
  }
  // @TODO: need to fix limits on the overflow
  __overflowTranslate(t) {
    const x = this.__overflowCords.x + this.x();
    const y = this.__overflowCords.y + this.y();
    if (x >= this.__overflowCords.minX || x <= this.__overflowCords.maxX)
      this.__overflowCords.x += t.x;
    if (y >= this.__overflowCords.minY || y <= this.__overflowCords.maxY)
      this.__overflowCords.y += t.y;
  }
  get isOverflowXScroll() {
    return this.overflow() === "scroll" || this.overflowX() === "scroll";
  }
  get isOverflowYScroll() {
    return this.overflow() === "scroll" || this.overflowY() === "scroll";
  }
  get isOverflowVisible() {
    return this.overflow() === "visible" && this.overflowX() === "visible" && this.overflowY() === "visible";
  }
  bind(block, options) {
    this.__bindOptions.push({ bindTo: block, options });
  }
  rotate(opt) {
    const cacheRotate = this.ownOptions["rotate"] || 0;
    const rotate = this.__valueHandler(opt, "rotate", 0);
    const diffR = rotate - cacheRotate;
    if (diffR !== 0) this.#updateCornerByRot(diffR);
    return rotate;
  }
  #updateCornerByRot(radian) {
    this.#updateCornerbyRot("cornerTopLeft", radian);
    this.#updateCornerbyRot("cornerTopRight", radian);
    this.#updateCornerbyRot("cornerBottomLeft", radian);
    this.#updateCornerbyRot("cornerBottomRight", radian);
    this.#updateCornerbyRot("hotCornerTopLeft", radian);
    this.#updateCornerbyRot("hotCornerTopRight", radian);
    this.#updateCornerbyRot("hotCornerBottomLeft", radian);
    this.#updateCornerbyRot("hotCornerBottomRight", radian);
    this.#updateCornerbyRot("hotRotCornerTopLeft", radian);
    this.#updateCornerbyRot("hotRotCornerTopRight", radian);
    this.#updateCornerbyRot("hotRotCornerBottomLeft", radian);
    this.#updateCornerbyRot("hotRotCornerBottomRight", radian);
    this.#updateCornerAreabyRot("hotResizableAreaTopLeft", radian);
    this.#updateCornerAreabyRot("hotResizableAreaTopRight", radian);
    this.#updateCornerAreabyRot("hotResizableAreaBottomLeft", radian);
    this.#updateCornerAreabyRot("hotResizableAreaBottomRight", radian);
    this.#updateCornerAreabyRot("hotResizableAreaTop", radian);
    this.#updateCornerAreabyRot("hotResizableAreaRight", radian);
    this.#updateCornerAreabyRot("hotResizableAreaLeft", radian);
    this.#updateCornerAreabyRot("hotResizableAreaBottom", radian);
    this.#updateCornerAreabyRot("hotRotatableAreaTopLeft", radian);
    this.#updateCornerAreabyRot("hotRotatableAreaTopRight", radian);
    this.#updateCornerAreabyRot("hotRotatableAreaBottomLeft", radian);
    this.#updateCornerAreabyRot("hotRotatableAreaBottomRight", radian);
  }
  get getTop() {
    return {
      x: Math.min(
        this.cornerTopLeft().x,
        this.cornerTopRight().x,
        this.cornerBottomLeft().x,
        this.cornerBottomRight().x
      ),
      y: Math.min(
        this.cornerTopLeft().y,
        this.cornerTopRight().y,
        this.cornerBottomLeft().y,
        this.cornerBottomRight().y
      )
    };
  }
  get getBottom() {
    return {
      x: Math.max(
        this.cornerTopLeft().x,
        this.cornerTopRight().x,
        this.cornerBottomLeft().x,
        this.cornerBottomRight().x
      ),
      y: Math.max(
        this.cornerTopLeft().y,
        this.cornerTopRight().y,
        this.cornerBottomLeft().y,
        this.cornerBottomRight().y
      )
    };
  }
  get getLeft() {
    return {
      x: Math.min(
        this.cornerTopLeft().x,
        this.cornerTopRight().x,
        this.cornerBottomLeft().x,
        this.cornerBottomRight().x
      ),
      y: Math.min(
        this.cornerTopLeft().y,
        this.cornerTopRight().y,
        this.cornerBottomLeft().y,
        this.cornerBottomRight().y
      )
    };
  }
  get getRight() {
    return {
      x: Math.max(
        this.cornerTopLeft().x,
        this.cornerTopRight().x,
        this.cornerBottomLeft().x,
        this.cornerBottomRight().x
      ),
      y: Math.max(
        this.cornerTopLeft().y,
        this.cornerTopRight().y,
        this.cornerBottomLeft().y,
        this.cornerBottomRight().y
      )
    };
  }
  get getRealWidth() {
    return this.getRight.x - this.getLeft.x;
  }
  get getRealHeight() {
    return this.getBottom.y - this.getTop.y;
  }
  get getCenterX() {
    return this.getTop.x + this.getRealWidth / 2;
  }
  get getCenterY() {
    return this.getTop.y + this.getRealHeight / 2;
  }
  #updateCornerbyRot(corner, diffR) {
    const cordsArea = this.ownOptions[corner];
    if (!cordsArea) return;
    const c = this.__rotateCorners(cordsArea.x, cordsArea.y, diffR);
    cordsArea.x = c.x;
    cordsArea.y = c.y;
  }
  #updateCornerAreabyRot(corner, diffR) {
    const cordsArea = this.ownOptions[corner];
    if (!cordsArea) return;
    const a = this.__rotateCorners(
      cordsArea.topLeft.x,
      cordsArea.topLeft.y,
      diffR
    );
    const b = this.__rotateCorners(
      cordsArea?.topRight.x,
      cordsArea.topRight.y,
      diffR
    );
    const c = this.__rotateCorners(
      cordsArea.bottomLeft.x,
      cordsArea.bottomLeft.y,
      diffR
    );
    const d = this.__rotateCorners(
      cordsArea.bottomRight.x,
      cordsArea.bottomRight.y,
      diffR
    );
    cordsArea.topLeft = { x: a.x, y: a.y };
    cordsArea.topRight = { x: b.x, y: b.y };
    cordsArea.bottomLeft = { x: c.x, y: c.y };
    cordsArea.bottomRight = { x: d.x, y: d.y };
  }
  #updateAreaCordX(corner, x) {
    const cordsArea = this.ownOptions[corner];
    if (!cordsArea) return;
    cordsArea.topLeft.x += x;
    cordsArea.topRight.x += x;
    cordsArea.bottomLeft.x += x;
    cordsArea.bottomRight.x = cordsArea.bottomRight.x + x;
  }
  #updateAreaCordY(corner, y) {
    const cordsArea = this.ownOptions[corner];
    if (!cordsArea) return;
    cordsArea.topLeft.y += y;
    cordsArea.topRight.y += y;
    cordsArea.bottomLeft.y += y;
    cordsArea.bottomRight.y += y;
  }
  __rotateCorners(x, y, radian) {
    return rotateCordinates(
      x,
      y,
      this.rotationCenterX(),
      this.rotationCenterY(),
      radian
    );
  }
  animate(keyframes, callback) {
    const dumyFunc = () => {
    };
    const {
      id,
      autoStart,
      iterations,
      delay,
      direction,
      duration,
      easing,
      iterationStart,
      playbackRate,
      onFinish,
      composite,
      ...options
    } = keyframes;
    const animationId = id || String((/* @__PURE__ */ new Date()).getTime());
    this.#keyframeIterations[animationId] = {
      id: animationId,
      isRunning: true,
      isFinished: false,
      isReverse: false,
      iter: 0,
      startTime: 0,
      currentOptIdx: 0,
      maxKeyframeLen: 0,
      autoStart: autoStart || false,
      iterations: iterations || Infinity,
      delay: delay || 0,
      direction: direction || "normal",
      composite: composite || "replace",
      duration: duration || 1e3,
      easing: easing || "linear",
      iterationStart: iterationStart || 0,
      playbackRate: playbackRate || 1,
      onFinish: onFinish || dumyFunc
    };
    this.#keyframeIterations[animationId]["keyframes"] = {};
    let maxBreakPointLen = 0;
    for (let [key, keyframe] of Object.entries(options)) {
      const obj = getPrototype(this, key);
      let validKeyframe = keyframe;
      const keyframes2 = keyframe.map(
        (i) => this.__unitConverter({ val: i })
      );
      let category = typeof validKeyframe;
      if (keyframes2.includes("rgba")) {
        validKeyframe = keyframe.map((i) => rgbaToArray(i));
        category = "color";
      }
      if (composite && composite === "accumulate") {
        let stairCase = [0, 0, 0, 0];
        if (keyframes2.includes("rgba")) {
          for (const [i, rgbs] of Object.entries(validKeyframe)) {
            validKeyframe[Number(i)] = [
              rgbs[0] + stairCase[0],
              rgbs[1] + stairCase[1],
              rgbs[2] + stairCase[2],
              rgbs[3] + stairCase[3]
            ];
            stairCase = [
              rgbs[0] + stairCase[0],
              rgbs[1] + stairCase[1],
              rgbs[2] + stairCase[2],
              rgbs[3] + stairCase[3]
            ];
          }
        } else {
          let stairCase2 = 0;
          for (const [idx2, val] of Object.entries(validKeyframe)) {
            validKeyframe[Number(idx2)] = val + stairCase2;
            stairCase2 += val;
          }
        }
      }
      if (direction === "reverse" || direction === "alternate-reverse")
        validKeyframe.reverse();
      let iterDirection = 1;
      const idx = Math.round(
        (iterationStart || 0) * (validKeyframe.length - 1)
      );
      let currentVal = validKeyframe[idx];
      if (idx === validKeyframe.length - 1) iterDirection *= -1;
      if (validKeyframe.length > maxBreakPointLen)
        maxBreakPointLen = validKeyframe.length;
      this.#keyframeIterations[animationId]["keyframes"][key] = {
        currentIdx: idx,
        currentVal,
        breakPoints: validKeyframe,
        iterDirection,
        category,
        invoker: obj
      };
    }
    this.#keyframeIterations[animationId]["maxKeyframeLen"] = maxBreakPointLen;
    const animator = (timestamp) => {
      const anime = this.#keyframeIterations[animationId];
      if (anime.autoStart === false) return;
      let isFinished = anime.isFinished;
      if (anime.delay <= timestamp && !isFinished && anime.isRunning) {
        const playBackRate = anime.playbackRate;
        const direction2 = anime.direction;
        const currentOptIdx = anime.currentOptIdx;
        if (!anime.startTime) {
          anime.iter -= 1;
          anime.startTime = timestamp + anime.delay;
        }
        if (!anime.isRunning || !anime.keyframes) return;
        if (anime.iterations !== Infinity && anime.iter === anime.iterations) {
          isFinished = true;
          this.animationFinish(animationId);
          if (anime.onFinish) anime.onFinish();
        }
        const easing2 = this.easingHanndler(anime.easing)(
          clamp((timestamp - anime.startTime) / anime.duration, 0, 1),
          1 / anime.duration
        );
        if (callback) callback(timestamp, easing2);
        for (let [idx, [key, value]] of Object.entries(
          Object.entries(anime.keyframes)
        )) {
          if (anime.composite == "replace" && currentOptIdx !== Number(idx))
            continue;
          let valueT = value;
          if (isFinished) {
            let lastIdx = valueT.breakPoints.length - 1;
            if (anime.direction === "reverse" || anime.direction === "alternate-reverse")
              lastIdx = 0;
            valueT.invoker?.value.call(
              this,
              valueT.breakPoints[lastIdx]
            );
            continue;
          }
          let currentIdx = valueT.currentIdx;
          let iterDirection = valueT.iterDirection;
          let nextIdx = currentIdx + iterDirection;
          let startVal = valueT.breakPoints[currentIdx];
          let endVal = valueT.breakPoints[nextIdx];
          let currentVal = valueT.currentVal;
          let statement = null;
          valueT.invoker?.value.call(this, currentVal);
          if (valueT.category === "color") {
            const cancelOutR = startVal[0] < endVal[0] ? startVal[0] : endVal[0];
            const cancelOutG = startVal[1] < endVal[1] ? startVal[1] : endVal[1];
            const cancelOutB = startVal[2] < endVal[2] ? startVal[2] : endVal[2];
            const cancelOutA = startVal[3] < endVal[3] ? startVal[3] : endVal[3];
            const R = (lerp(startVal[0], endVal[0], easing2) - cancelOutR) * playBackRate + cancelOutR;
            const G = (lerp(startVal[1], endVal[1], easing2) - cancelOutG) * playBackRate + cancelOutG;
            const B = (lerp(startVal[2], endVal[2], easing2) - cancelOutB) * playBackRate + cancelOutB;
            const A = (lerp(startVal[3], endVal[3], easing2) - cancelOutA) * playBackRate + cancelOutA;
            currentVal = rgbaRepresenter([
              currentVal[0] + R,
              currentVal[1] + G,
              currentVal[2] + B,
              currentVal[3] + A
            ]);
            statement = (startVal[0] <= endVal[0] && currentVal[0] >= endVal[0] || startVal[0] >= endVal[0] && currentVal[0] <= endVal[0]) && (startVal[1] <= endVal[1] && currentVal[1] >= endVal[1] || startVal[1] >= endVal[1] && currentVal[1] <= endVal[1]) && (startVal[2] <= endVal[2] && currentVal[2] >= endVal[2] || startVal[2] >= endVal[2] && currentVal[2] <= endVal[2]) && (startVal[3] <= endVal[3] && currentVal[3] >= endVal[3] || startVal[3] >= endVal[3] && currentVal[3] <= endVal[3]);
          } else {
            const cancelOut = startVal < endVal ? startVal : endVal;
            currentVal = (lerp(startVal, endVal, easing2) - cancelOut) * playBackRate + cancelOut;
            statement = startVal <= endVal && currentVal >= endVal || startVal >= endVal && currentVal <= endVal;
          }
          if (statement) {
            currentIdx += iterDirection;
            if (currentIdx === valueT.breakPoints.length - 1)
              anime.currentOptIdx += 1;
            if (nextIdx === valueT.breakPoints.length - 1 || nextIdx === 0) {
              if (direction2 === "normal" || direction2 === "reverse") {
                currentIdx = 0;
                currentVal = valueT.breakPoints[0];
              } else if (direction2 == "alternate" || direction2 == "alternate-reverse") {
                valueT.iterDirection *= -1;
              }
            }
            anime.startTime = timestamp + anime.delay;
            valueT.currentIdx = currentIdx;
          }
          valueT.currentVal = currentVal;
        }
        if (anime.startTime && anime.startTime === timestamp + anime.delay) {
          anime.iter += 1;
        }
        if (anime.currentOptIdx >= Object.entries(anime.keyframes).length)
          anime.currentOptIdx = 0;
      }
    };
    this.__animationHandler(animator);
    return animationId;
  }
  __animationHandler(animator) {
    if (!this.canvas) this.__animations.push(animator);
    else this.canvas.registerAnimation(String(this.nodeId), animator);
  }
  animationStart(animationId) {
    const anime = this.#keyframeIterations[animationId];
    anime["isFinished"] = false;
    anime["autoStart"] = true;
    anime["isRunning"] = true;
    anime.iter = 0;
    anime.startTime = 0;
  }
  animationStop(animationId) {
    this.#keyframeIterations[animationId]["isRunning"] = false;
    this.#keyframeIterations[animationId]["autoStart"] = false;
  }
  animationFinish(animationId) {
    this.#keyframeIterations[animationId]["isFinished"] = true;
    this.#keyframeIterations[animationId]["isRunning"] = false;
    this.#keyframeIterations[animationId]["autoStart"] = false;
  }
  animationReverse(animationId) {
    const anime = this.#keyframeIterations[animationId];
    anime["isReverse"] = true;
    if (anime["direction"] === "normal") anime["direction"] = "reverse";
    else if (anime["direction"] === "reverse")
      anime["direction"] = "normal";
    else if (anime["direction"] === "alternate")
      anime["direction"] = "alternate-reverse";
    else if (anime["direction"] === "alternate-reverse")
      anime["direction"] = "alternate";
  }
  animationDelay(animationId, value) {
    this.#keyframeIterations[animationId]["delay"] = value;
  }
  animationPlaybackRate(animationId, value) {
    this.#keyframeIterations[animationId]["playbackRate"] = value;
  }
  animationDirection(animationId, value) {
    this.#keyframeIterations[animationId]["direction"] = value;
  }
  animationDuration(animationId, value) {
    this.#keyframeIterations[animationId]["duration"] = value;
  }
  animationIterationStart(animationId, value) {
    this.#keyframeIterations[animationId]["iterationStart"] = value;
  }
  animationIterations(animationId, value) {
    this.#keyframeIterations[animationId]["iterations"] = value;
  }
  animationAutoStart(animationId, value) {
    this.#keyframeIterations[animationId]["autoStart"] = value;
  }
  easingHanndler(easing) {
    if (easing === "linear") return linear(0, 1);
    else if (easing == "step-start") return steps(1, "jump-start");
    else if (easing == "step-end") return steps(1, "jump-end");
    else if (easing == "ease") return bezierEasing(0.25, 0.1, 0.25, 1);
    else if (easing == "ease-in") return bezierEasing(0.42, 0, 1, 1);
    else if (easing == "ease-out") return bezierEasing(0, 0, 0.58, 1);
    else if (easing == "ease-in-out") return bezierEasing(0.42, 0, 0.58, 1);
    else return easing;
  }
  checkInBound(_event) {
    const { x, y } = this.canvas?.getCursorPosition(_event) || {
      x: 0,
      y: 0
    };
    const topLeft = {
      x: this.cornerTopLeft().x,
      y: this.cornerTopLeft().y
    };
    const topRight = {
      x: this.cornerTopRight().x,
      y: this.cornerTopRight().y
    };
    const bottomLeft = {
      x: this.cornerBottomLeft().x,
      y: this.cornerBottomLeft().y
    };
    const bottomRight = {
      x: this.cornerBottomRight().x,
      y: this.cornerBottomRight().y
    };
    if (this.__isHorizontalFlipped) {
      topLeft.x = this.cornerTopRight().x;
      topLeft.y = this.cornerTopRight().y;
      topRight.x = this.cornerTopLeft().x;
      topRight.y = this.cornerTopLeft().y;
      bottomLeft.x = this.cornerBottomRight().x;
      bottomLeft.y = this.cornerBottomRight().y;
      bottomRight.x = this.cornerBottomLeft().x;
      bottomRight.y = this.cornerBottomLeft().y;
    }
    if (this.__isVerticalFlipped) {
      if (this.__isHorizontalFlipped) {
        topLeft.x = this.cornerBottomRight().x;
        topLeft.y = this.cornerBottomRight().y;
        topRight.x = this.cornerBottomLeft().x;
        topRight.y = this.cornerBottomLeft().y;
        bottomLeft.x = this.cornerTopRight().x;
        bottomLeft.y = this.cornerTopRight().y;
        bottomRight.x = this.cornerTopLeft().x;
        bottomRight.y = this.cornerTopLeft().y;
      } else {
        topLeft.x = this.cornerBottomLeft().x;
        topLeft.y = this.cornerBottomLeft().y;
        topRight.x = this.cornerBottomRight().x;
        topRight.y = this.cornerBottomRight().y;
        bottomLeft.x = this.cornerTopLeft().x;
        bottomLeft.y = this.cornerTopLeft().y;
        bottomRight.x = this.cornerTopRight().x;
        bottomRight.y = this.cornerTopRight().y;
      }
    }
    let inBound = checkInBound(
      x,
      y,
      topLeft.x,
      topLeft.y,
      topRight.x,
      topRight.y,
      bottomLeft.x,
      bottomLeft.y,
      bottomRight.x,
      bottomRight.y
    );
    if (inBound) this.registerZIndex({ in: this.zIndex() });
    else this.registerZIndex({ out: this.zIndex() });
    return inBound;
  }
  registerZIndex(inOut) {
    if (this.selectable()) this.canvas?.registerZIndex(inOut);
  }
  get ImFirst() {
    return this.canvas?.whoIsTheFirst(this.zIndex());
  }
  invokeChange() {
    this.canvas?.invokeChange();
  }
  contextMenu(_func) {
    const out = (event) => {
      if (this.checkInBound(event) && this.ImFirst) {
        _func(event);
        this.invokeChange();
      }
    };
    this.eventHandler("contextmenu", out);
  }
  click(_func) {
    const out = (event) => {
      if (this.checkInBound(event) && this.ImFirst) {
        _func(event);
        this.invokeChange();
      }
    };
    this.eventHandler("click", out);
  }
  dblclick(_func) {
    const out = (event) => {
      if (this.checkInBound(event) && this.ImFirst) {
        _func(event);
        this.invokeChange();
      }
    };
    this.eventHandler("dblclick", out);
  }
  mousedown(_func) {
    const out = (event) => {
      if (this.checkInBound(event) && this.ImFirst) {
        _func(event);
        this.invokeChange();
      }
    };
    this.eventHandler("mousedown", out);
  }
  mouseup(_func) {
    const out = (event) => {
      if (this.checkInBound(event) && this.ImFirst) {
        _func(event);
        this.invokeChange();
      }
    };
    this.eventHandler("mouseup", out);
  }
  mousemove(_func) {
    const out = (event) => {
      if (this.checkInBound(event) && this.ImFirst) {
        _func(event);
        this.invokeChange();
      }
    };
    this.eventHandler("mousemove", out);
  }
  mouseenter(_func) {
    let isMouseEnter = false;
    const enter = (event) => {
      if (this.checkInBound(event)) {
        if (this.ImFirst && !isMouseEnter) {
          _func(event);
          this.invokeChange();
          isMouseEnter = true;
        }
      } else isMouseEnter = false;
    };
    this.eventHandler("mousemove", enter);
  }
  mouseleave(_func) {
    let isMouseLeave = false;
    const leave = (event) => {
      if (!this.checkInBound(event)) {
        if (!this.ImFirst && !isMouseLeave) {
          _func(event);
          this.invokeChange();
          isMouseLeave = true;
        }
      } else isMouseLeave = false;
    };
    this.eventHandler("mousemove", leave);
  }
  /** @Todo
   mouseover and mouseout
   has little bug when two chidls cross each other there are isMouse over happens to be true but one is under so check in bound checks it under the higher z index element
  */
  mouseover(_func) {
    const mouseOver = {};
    let isMouseOver = false;
    let inBound = false;
    const over = (event) => {
      this.listAllChilds((b) => {
        if (mouseOver[b.nodeId] == void 0)
          mouseOver[b.nodeId] = b.checkInBound(event);
        if (!b.checkInBound(event)) {
          if (mouseOver[b.nodeId]) {
            mouseOver[b.nodeId] = false;
            isMouseOver = false;
          }
        } else if (mouseOver[b.nodeId] === false) {
          mouseOver[b.nodeId] = true;
          isMouseOver = true;
        }
      });
      if (this.checkInBound(event)) {
        if (!inBound) {
          inBound = true;
          isMouseOver = true;
        }
      } else {
        inBound = false;
        isMouseOver = false;
      }
      if (isMouseOver) {
        _func(event);
        this.invokeChange();
        isMouseOver = false;
      }
    };
    this.eventHandler("mousemove", over);
  }
  mouseout(_func) {
    const mouseLeave = {};
    let isMouseLeave = false;
    let outBound = false;
    const out = (event) => {
      if (!this.checkInBound(event)) {
        if (!outBound) {
          outBound = true;
          isMouseLeave = true;
        }
      } else {
        outBound = false;
        isMouseLeave = false;
      }
      this.listAllChilds((b) => {
        if (mouseLeave[b.nodeId] == void 0)
          mouseLeave[b.nodeId] = b.checkInBound(event);
        if (b.checkInBound(event)) {
          if (mouseLeave[b.nodeId]) {
            mouseLeave[b.nodeId] = false;
            isMouseLeave = true;
          }
        } else if (mouseLeave[b.nodeId] == false) {
          mouseLeave[b.nodeId] = true;
          isMouseLeave = true;
        }
      });
      if (isMouseLeave) {
        _func(event);
        this.invokeChange();
        isMouseLeave = false;
      }
    };
    this.eventHandler("mousemove", out);
  }
  keydown(_func) {
    const down = (event) => {
      if (this.canvas?.isFocused) {
        event.preventDefault();
        _func(event);
        this.invokeChange();
      }
    };
    this.eventHandler("keydown", down);
  }
  keyup(_func) {
    const up = (event) => {
      if (this.canvas?.isFocused) {
        event.preventDefault();
        _func(event);
        this.invokeChange();
      }
    };
    this.eventHandler("keyup", up);
  }
  wheel(_func) {
    const wheel = (event) => {
      if (this.canvas?.isFocused) {
        event.preventDefault();
        _func(event);
        this.invokeChange();
      }
    };
    this.eventHandler("wheel", wheel);
  }
  eventHandler(type, _func, identify) {
    if (!this.__events[type])
      this.__events[type] = { funcs: [], identified: [] };
    if (identify) {
      if (this.__events[type]["identified"].includes(identify)) return;
      else this.__events[type]["identified"].push(identify);
    }
    if (this.canvas)
      this.canvas?.registerEvent(type, _func);
    else this.__events[type]["funcs"].push(_func);
  }
  selectable(opt) {
    const selectable = this.__valueHandler(opt, "selectable", false);
    if (!selectable) return false;
    const click = (e) => {
      const { x, y } = this.canvas?.getCursorPosition(e) || {
        x: 0,
        y: 0
      };
      let inBound;
      if (this.__runningEvents.selected) {
        inBound = checkInBound(
          x,
          y,
          this.hotCornerTopLeft().x,
          this.hotCornerTopLeft().y,
          this.hotCornerTopRight().x,
          this.hotCornerTopRight().y,
          this.hotCornerBottomLeft().x,
          this.hotCornerBottomLeft().y,
          this.hotCornerBottomRight().x,
          this.hotCornerBottomRight().y
        );
      } else inBound = this.checkInBound(e);
      if (inBound) {
        this.registerZIndex({ in: this.zIndex() });
        if (this.ImFirst) this.__runningEvents.selected = true;
      } else {
        this.registerZIndex({ out: this.zIndex() });
        this.__runningEvents.selected = false;
      }
      if (this.optionHasChanged("setInBound", inBound)) {
        this.invokeChange();
      }
      this.setChangeCache("setInBound", inBound);
    };
    this.eventHandler("click", click, "selectable");
    return selectable;
  }
  onRotate(opt) {
    const rotateE = this.__valueHandler(opt, "onRotate", void 0);
    return (event) => {
      rotateE?.(event);
    };
  }
  rotatable(opt) {
    const rotatable = this.__valueHandler(opt, "rotatable", false);
    if (!rotatable) return rotatable;
    let topMove = false;
    let leftMove = false;
    const beforeValues = {};
    let inBound = false;
    const mousedown = (event) => {
      if (this.__runningEvents.resize || this.__runningEvents.drag)
        return;
      if (inBound) {
        this.__runningEvents.rotate = true;
        beforeValues[this.nodeId] = {
          rotate: this.rotate()
        };
        this.registerZIndex({ in: this.zIndex() });
      } else this.registerZIndex({ out: this.zIndex() });
    };
    const mousemove = (event) => {
      if (!this.__runningEvents.selected || this.__runningEvents.resize || this.__runningEvents.drag)
        return;
      let { x, y } = this.canvas?.getCursorPosition(event) || {
        x: 0,
        y: 0
      };
      if (!this.__runningEvents.rotate) {
        let cursor = void 0;
        if (checkInBound(
          x,
          y,
          this.hotRotatableAreaTopLeft().topLeft.x,
          this.hotRotatableAreaTopLeft().topLeft.y,
          this.hotRotatableAreaTopLeft().topRight.x,
          this.hotRotatableAreaTopLeft().topRight.y,
          this.hotRotatableAreaTopLeft().bottomLeft.x,
          this.hotRotatableAreaTopLeft().bottomLeft.y,
          this.hotRotatableAreaTopLeft().bottomRight.x,
          this.hotRotatableAreaTopLeft().bottomRight.y
        ) && this.rotationTopLeft()) {
          cursor = "cell";
          topMove = true;
          leftMove = true;
        } else if (checkInBound(
          x,
          y,
          this.hotRotatableAreaTopRight().topLeft.x,
          this.hotRotatableAreaTopRight().topLeft.y,
          this.hotRotatableAreaTopRight().topRight.x,
          this.hotRotatableAreaTopRight().topRight.y,
          this.hotRotatableAreaTopRight().bottomLeft.x,
          this.hotRotatableAreaTopRight().bottomLeft.y,
          this.hotRotatableAreaTopRight().bottomRight.x,
          this.hotRotatableAreaTopRight().bottomRight.y
        ) && this.rotationTopRight()) {
          cursor = "cell";
          topMove = true;
          leftMove = false;
        } else if (checkInBound(
          x,
          y,
          this.hotRotatableAreaBottomLeft().topLeft.x,
          this.hotRotatableAreaBottomLeft().topLeft.y,
          this.hotRotatableAreaBottomLeft().topRight.x,
          this.hotRotatableAreaBottomLeft().topRight.y,
          this.hotRotatableAreaBottomLeft().bottomLeft.x,
          this.hotRotatableAreaBottomLeft().bottomLeft.y,
          this.hotRotatableAreaBottomLeft().bottomRight.x,
          this.hotRotatableAreaBottomLeft().bottomRight.y
        ) && this.rotationBottomLeft()) {
          cursor = "cell";
          topMove = false;
          leftMove = true;
        } else if (checkInBound(
          x,
          y,
          this.hotRotatableAreaBottomRight().topLeft.x,
          this.hotRotatableAreaBottomRight().topLeft.y,
          this.hotRotatableAreaBottomRight().topRight.x,
          this.hotRotatableAreaBottomRight().topRight.y,
          this.hotRotatableAreaBottomRight().bottomLeft.x,
          this.hotRotatableAreaBottomRight().bottomLeft.y,
          this.hotRotatableAreaBottomRight().bottomRight.x,
          this.hotRotatableAreaBottomRight().bottomRight.y
        ) && this.rotationBottomRight()) {
          cursor = "cell";
          topMove = false;
          leftMove = false;
        }
        if (cursor) {
          inBound = true;
          this.canvas?.changeCursor(cursor);
        } else {
          inBound = false;
          if (this.canvas?.currentCursor && ![
            "ew-resize",
            "ns-resize",
            "nwse-resize",
            "nesw-resize"
          ].includes(this.canvas?.currentCursor)) {
            this.canvas?.changeCursor(cursor);
          }
        }
      }
      if (this.__runningEvents.rotate) {
        this.registerZIndex({ in: this.zIndex() });
        if (this.ImFirst || this.__runningEvents.rotate) {
          let radian = Math.atan2(
            y - this.rotationCenterY(),
            x - this.rotationCenterX()
          );
          if (topMove && leftMove) {
            this.rotate(
              radian - Math.atan2(
                this.#rotationCorners.topLeft.y - this.getCenterY,
                this.#rotationCorners.topLeft.x - this.getCenterX
              )
            );
          } else if (topMove && !leftMove) {
            this.rotate(
              radian - Math.atan2(
                this.#rotationCorners.topRight.y - this.getCenterY,
                this.#rotationCorners.topRight.x - this.getCenterX
              )
            );
          } else if (!topMove && !leftMove) {
            this.rotate(
              radian - Math.atan2(
                this.#rotationCorners.bottomRight.y - this.getCenterY,
                this.#rotationCorners.bottomRight.x - this.getCenterX
              )
            );
          } else if (!topMove && leftMove) {
            this.rotate(
              radian - Math.atan2(
                this.#rotationCorners.bottomLeft.y - this.getCenterY,
                this.#rotationCorners.bottomLeft.x - this.getCenterX
              )
            );
          }
          this.onRotate()(event);
          this.invokeChange();
        }
      }
    };
    const mouseup = () => {
      if (this.__runningEvents.rotate) {
        this.__runningEvents.rotate = false;
        this.canvas?.changeCursor("auto");
        inBound = false;
        const dummy = {};
        dummy[this.nodeId] = { rotate: this.rotate() };
        this.canvas?.takeSnapshot(beforeValues, dummy);
      }
    };
    this.eventHandler("mousedown", mousedown, "rotatableDown");
    this.eventHandler("mousemove", mousemove, "rotatableMove");
    this.eventHandler("mouseup", mouseup, "rotatableUp");
    return rotatable;
  }
  onResize(opt) {
    const resizeE = this.__valueHandler(opt, "onResize", void 0);
    return (event) => {
      resizeE?.(event);
    };
  }
  resizable(opt) {
    const resizable = this.__valueHandler(opt, "resizable", false);
    if (!resizable) return resizable;
    let initCords = { x: 0, y: 0 };
    let beforeCords = { x: 0, y: 0 };
    let beforeValues = {};
    let topResize = false;
    let leftResize = false;
    let bottomResize = false;
    let rightResize = false;
    let inBound = false;
    const mousedown = (event) => {
      if (this.__runningEvents.rotate) return;
      beforeCords = { x: 0, y: 0 };
      if (inBound) {
        initCords = this.canvas?.getCursorPosition(event) || {
          x: 0,
          y: 0
        };
        this.__runningEvents.resize = true;
        beforeValues[this.nodeId] = {
          x: this.x(),
          y: this.y(),
          width: this.width(),
          height: this.height()
        };
        this.registerZIndex({ in: this.zIndex() });
      } else this.registerZIndex({ out: this.zIndex() });
    };
    const mousemove = (event) => {
      if (!this.__runningEvents.selected || this.__runningEvents.rotate)
        return;
      const { x, y } = this.canvas?.getCursorPosition(event) || {
        x: 0,
        y: 0
      };
      if (!this.__runningEvents.resize) {
        let cursor = void 0;
        bottomResize = rightResize = topResize = leftResize = false;
        if (checkInBound(
          x,
          y,
          this.hotResizableAreaLeft().topLeft.x,
          this.hotResizableAreaLeft().topLeft.y,
          this.hotResizableAreaLeft().topRight.x,
          this.hotResizableAreaLeft().topRight.y,
          this.hotResizableAreaLeft().bottomLeft.x,
          this.hotResizableAreaLeft().bottomLeft.y,
          this.hotResizableAreaLeft().bottomRight.x,
          this.hotResizableAreaLeft().bottomRight.y
        ) || checkInBound(
          x,
          y,
          this.hotResizableAreaLeft().bottomLeft.x,
          this.hotResizableAreaLeft().bottomLeft.y,
          this.hotResizableAreaLeft().bottomRight.x,
          this.hotResizableAreaLeft().bottomRight.y,
          this.hotResizableAreaLeft().topLeft.x,
          this.hotResizableAreaLeft().topLeft.y,
          this.hotResizableAreaLeft().topRight.x,
          this.hotResizableAreaLeft().topRight.y
        )) {
          leftResize = true;
          cursor = "ew-resize";
        } else if (checkInBound(
          x,
          y,
          this.hotResizableAreaRight().topLeft.x,
          this.hotResizableAreaRight().topLeft.y,
          this.hotResizableAreaRight().topRight.x,
          this.hotResizableAreaRight().topRight.y,
          this.hotResizableAreaRight().bottomLeft.x,
          this.hotResizableAreaRight().bottomLeft.y,
          this.hotResizableAreaRight().bottomRight.x,
          this.hotResizableAreaRight().bottomRight.y
        ) || checkInBound(
          x,
          y,
          this.hotResizableAreaRight().bottomLeft.x,
          this.hotResizableAreaRight().bottomLeft.y,
          this.hotResizableAreaRight().bottomRight.x,
          this.hotResizableAreaRight().bottomRight.y,
          this.hotResizableAreaRight().topLeft.x,
          this.hotResizableAreaRight().topLeft.y,
          this.hotResizableAreaRight().topRight.x,
          this.hotResizableAreaRight().topRight.y
        )) {
          rightResize = true;
          cursor = "ew-resize";
        } else if (checkInBound(
          x,
          y,
          this.hotResizableAreaTop().topLeft.x,
          this.hotResizableAreaTop().topLeft.y,
          this.hotResizableAreaTop().topRight.x,
          this.hotResizableAreaTop().topRight.y,
          this.hotResizableAreaTop().bottomLeft.x,
          this.hotResizableAreaTop().bottomLeft.y,
          this.hotResizableAreaTop().bottomRight.x,
          this.hotResizableAreaTop().bottomRight.y
        ) || checkInBound(
          x,
          y,
          this.hotResizableAreaTop().topRight.x,
          this.hotResizableAreaTop().topRight.y,
          this.hotResizableAreaTop().topLeft.x,
          this.hotResizableAreaTop().topLeft.y,
          this.hotResizableAreaTop().bottomRight.x,
          this.hotResizableAreaTop().bottomRight.y,
          this.hotResizableAreaTop().bottomLeft.x,
          this.hotResizableAreaTop().bottomLeft.y
        )) {
          topResize = true;
          cursor = "ns-resize";
        } else if (checkInBound(
          x,
          y,
          this.hotResizableAreaBottom().topLeft.x,
          this.hotResizableAreaBottom().topLeft.y,
          this.hotResizableAreaBottom().topRight.x,
          this.hotResizableAreaBottom().topRight.y,
          this.hotResizableAreaBottom().bottomLeft.x,
          this.hotResizableAreaBottom().bottomLeft.y,
          this.hotResizableAreaBottom().bottomRight.x,
          this.hotResizableAreaBottom().bottomRight.y
        ) || checkInBound(
          x,
          y,
          this.hotResizableAreaBottom().topRight.x,
          this.hotResizableAreaBottom().topRight.y,
          this.hotResizableAreaBottom().topLeft.x,
          this.hotResizableAreaBottom().topLeft.y,
          this.hotResizableAreaBottom().bottomRight.x,
          this.hotResizableAreaBottom().bottomRight.y,
          this.hotResizableAreaBottom().bottomLeft.x,
          this.hotResizableAreaBottom().bottomLeft.y
        )) {
          cursor = "ns-resize";
          bottomResize = true;
        }
        if (checkInBound(
          x,
          y,
          this.hotResizableAreaTopLeft().topLeft.x,
          this.hotResizableAreaTopLeft().topLeft.y,
          this.hotResizableAreaTopLeft().topRight.x,
          this.hotResizableAreaTopLeft().topRight.y,
          this.hotResizableAreaTopLeft().bottomLeft.x,
          this.hotResizableAreaTopLeft().bottomLeft.y,
          this.hotResizableAreaTopLeft().bottomRight.x,
          this.hotResizableAreaTopLeft().bottomRight.y
        )) {
          topResize = true;
          leftResize = true;
          cursor = "nwse-resize";
        }
        if (checkInBound(
          x,
          y,
          this.hotResizableAreaTopRight().topLeft.x,
          this.hotResizableAreaTopRight().topLeft.y,
          this.hotResizableAreaTopRight().topRight.x,
          this.hotResizableAreaTopRight().topRight.y,
          this.hotResizableAreaTopRight().bottomLeft.x,
          this.hotResizableAreaTopRight().bottomLeft.y,
          this.hotResizableAreaTopRight().bottomRight.x,
          this.hotResizableAreaTopRight().bottomRight.y
        )) {
          topResize = true;
          rightResize = true;
          cursor = "nesw-resize";
        }
        if (checkInBound(
          x,
          y,
          this.hotResizableAreaBottomLeft().topLeft.x,
          this.hotResizableAreaBottomLeft().topLeft.y,
          this.hotResizableAreaBottomLeft().topRight.x,
          this.hotResizableAreaBottomLeft().topRight.y,
          this.hotResizableAreaBottomLeft().bottomLeft.x,
          this.hotResizableAreaBottomLeft().bottomLeft.y,
          this.hotResizableAreaBottomLeft().bottomRight.x,
          this.hotResizableAreaBottomLeft().bottomRight.y
        )) {
          bottomResize = true;
          leftResize = true;
          cursor = "nesw-resize";
        }
        if (checkInBound(
          x,
          y,
          this.hotResizableAreaBottomRight().topLeft.x,
          this.hotResizableAreaBottomRight().topLeft.y,
          this.hotResizableAreaBottomRight().topRight.x,
          this.hotResizableAreaBottomRight().topRight.y,
          this.hotResizableAreaBottomRight().bottomLeft.x,
          this.hotResizableAreaBottomRight().bottomLeft.y,
          this.hotResizableAreaBottomRight().bottomRight.x,
          this.hotResizableAreaBottomRight().bottomRight.y
        )) {
          bottomResize = true;
          rightResize = true;
          cursor = "nwse-resize";
        }
        if (cursor) {
          inBound = true;
          cursor = this.#chooseCursor(cursor);
          this.canvas?.changeCursor(cursor);
        } else {
          inBound = false;
          if (this.canvas?.currentCursor !== "cell") {
            this.canvas?.changeCursor(cursor);
          }
        }
      }
      if (this.__runningEvents.resize) {
        this.registerZIndex({ in: this.zIndex() });
        if (this.ImFirst || this.__runningEvents.resize) {
          let diffX = x - initCords.x;
          let diffY = y - initCords.y;
          const rightC = this.#rightCornerRad;
          const reverseX = rightC > 70 && rightC < 180 || rightC < -60 && rightC > -180 ? -1 : 1;
          const reverseY = rightC > 70 && rightC < 180 || rightC < -60 && rightC > -180 ? -1 : 1;
          let diffW = 0;
          let diffH = 0;
          if (diffX !== 0) {
            diffW = diffX - beforeCords.x;
            beforeCords.x = diffX;
          }
          if (diffY !== 0) {
            diffH = diffY - beforeCords.y;
            beforeCords.y = diffY;
          }
          let diffDx = 0;
          let diffDy = 0;
          if (this.canvas?.currentCursor === "ew-resize") {
            diffDx = diffW;
            diffDy = -diffW;
          } else if (this.canvas?.currentCursor === "ns-resize") {
            diffDx = diffH;
            diffDy = diffH;
          } else if (this.canvas?.currentCursor === "nwse-resize" || this.canvas?.currentCursor === "nesw-resize") {
            diffDx = diffW;
            diffDy = diffH;
          }
          if (leftResize) {
            const widthR = this.width() - diffDx * reverseX;
            if (widthR > 0 && !this.horizontalFlipResize() || this.horizontalFlipResize()) {
              this.x(this.x() + diffDx * reverseX);
              this.width(this.width() - diffDx * reverseX);
            }
          } else if (rightResize) {
            const widthR = this.width() + diffDx * reverseX;
            if (widthR > 0 && !this.horizontalFlipResize() || this.horizontalFlipResize()) {
              this.width(widthR);
            }
          }
          if (topResize) {
            const heightR = this.height() - diffDy * reverseY;
            if (heightR > 0 && !this.verticalFlipResize() || this.verticalFlipResize()) {
              this.y(this.y() + diffDy * reverseY);
              this.height(heightR);
            }
          } else if (bottomResize) {
            const heightR = this.height() + diffDy * reverseY;
            if (heightR > 0 && !this.verticalFlipResize() || this.verticalFlipResize()) {
              this.height(heightR);
            }
          }
          this.#adjustCordsToFLip();
          this.onResize()(event);
          this.invokeChange();
        }
      }
    };
    const mouseup = () => {
      if (this.__runningEvents.resize) {
        this.canvas?.changeCursor("auto");
        this.__runningEvents.resize = false;
        if (beforeCords.x !== 0 || beforeCords.y !== 0) {
          const after = {};
          after[this.nodeId] = {
            x: this.x(),
            y: this.y(),
            width: this.width(),
            height: this.height()
          };
          this.canvas?.takeSnapshot(beforeValues, after);
        }
      }
    };
    this.eventHandler("mousedown", mousedown, "resizableDown");
    this.eventHandler("mousemove", mousemove, "resizableMove");
    this.eventHandler("mouseup", mouseup, "resizableUp");
    return resizable;
  }
  #adjustCordsToFLip() {
    const hFlip = this.getCacheValue("isHorizontalFlipped");
    if (this.__isHorizontalFlipped !== hFlip) {
      this.setChangeCache("isHorizontalFlipped", !hFlip);
      this.#areaHorizontalFlip("hotResizableAreaLeft", !hFlip);
      this.#areaHorizontalFlip("hotResizableAreaRight", hFlip);
      this.#areaHorizontalFlip("hotResizableAreaTopLeft", !hFlip);
      this.#areaHorizontalFlip("hotResizableAreaTopRight", hFlip);
      this.#areaHorizontalFlip("hotResizableAreaBottomLeft", !hFlip);
      this.#areaHorizontalFlip("hotResizableAreaBottomRight", hFlip);
      this.#areaHorizontalFlip("hotRotatableAreaBottomLeft", hFlip);
      this.#areaHorizontalFlip("hotRotatableAreaBottomRight", !hFlip);
      this.#areaHorizontalFlip("hotRotatableAreaTopRight", !hFlip);
      this.#areaHorizontalFlip("hotRotatableAreaTopLeft", hFlip);
    }
    const vFlip = this.getCacheValue("isVerticalFlipped");
    if (this.__isVerticalFlipped !== vFlip) {
      this.setChangeCache("isVerticalFlipped", !vFlip);
      this.#areaVerticalFlip("hotResizableAreaTop", !vFlip);
      this.#areaVerticalFlip("hotResizableAreaBottom", vFlip);
      this.#areaVerticalFlip("hotResizableAreaTopLeft", !vFlip);
      this.#areaVerticalFlip("hotResizableAreaTopRight", !vFlip);
      this.#areaVerticalFlip("hotResizableAreaBottomLeft", vFlip);
      this.#areaVerticalFlip("hotResizableAreaBottomRight", vFlip);
      this.#areaVerticalFlip("hotRotatableAreaBottomLeft", !vFlip);
      this.#areaVerticalFlip("hotRotatableAreaBottomRight", !vFlip);
      this.#areaVerticalFlip("hotRotatableAreaTopRight", vFlip);
      this.#areaVerticalFlip("hotRotatableAreaTopLeft", vFlip);
    }
  }
  #areaHorizontalFlip(area, reverse) {
    const cornerArea = this.ownOptions[area];
    let flipArea = cornerArea.topLeft.x - cornerArea.topRight.x;
    if (reverse) flipArea = -flipArea;
    cornerArea.topLeft.x += flipArea;
    cornerArea.topRight.x += flipArea;
    cornerArea.bottomLeft.x += flipArea;
    cornerArea.bottomRight.x += flipArea;
  }
  #areaVerticalFlip(area, reverse) {
    const cornerArea = this.ownOptions[area];
    let flipArea = cornerArea.topLeft.y - cornerArea.bottomLeft.y;
    if (reverse) flipArea = -flipArea;
    cornerArea.topLeft.y += flipArea;
    cornerArea.topRight.y += flipArea;
    cornerArea.bottomLeft.y += flipArea;
    cornerArea.bottomRight.y += flipArea;
  }
  #chooseCursor(defaultCursor) {
    const cursors = {
      "ew-resize": ["nwse-resize", "ns-resize", "nesw-resize"],
      "ns-resize": ["nesw-resize", "ew-resize", "nwse-resize"],
      "nesw-resize": ["ew-resize", "nwse-resize", "ns-resize"],
      "nwse-resize": ["ns-resize", "nesw-resize", "ew-resize"]
    };
    const angle = this.#rightCornerRad;
    if (inRange(angle, -125, -85) || inRange(angle, 45, 70))
      return cursors[defaultCursor][1];
    else if (inRange(angle, -105, -20) || inRange(angle, 70, 105))
      return cursors[defaultCursor][2];
    else if (inRange(angle, -180, -125) || inRange(angle, 145, 180) || inRange(angle, 15, 45))
      return cursors[defaultCursor][0];
    return defaultCursor;
  }
  get #rightCornerRad() {
    return radianToDegree(
      Math.atan2(
        this.cornerTopRight().y + Math.abs(
          this.cornerTopRight().y - this.cornerBottomRight().y
        ) / 2 - this.rotationCenterY(),
        this.cornerTopRight().x - this.rotationCenterX()
      )
    );
  }
  onDrag(opt) {
    const dragE = this.__valueHandler(opt, "onDrag", void 0);
    return (event) => {
      dragE?.(event);
    };
  }
  draggable(opt) {
    const draggable = this.__valueHandler(opt, "draggable", false);
    if (!draggable) return draggable;
    let initCords = { x: 0, y: 0 };
    let beforeCords = { x: 0, y: 0 };
    let beforeValues = {};
    this.mousedown((event) => {
      if (this.__runningEvents.resize || this.__runningEvents.rotate)
        return;
      initCords = this.canvas?.getCursorPosition(event) || { x: 0, y: 0 };
      beforeCords = { x: 0, y: 0 };
      beforeValues[this.nodeId] = {
        x: this.x(),
        y: this.y()
      };
      this.__runningEvents.drag = true;
    });
    const mousemove = (event) => {
      if (this.__runningEvents.resize || this.__runningEvents.rotate)
        return;
      if (this.__runningEvents.drag) {
        this.registerZIndex({ in: this.zIndex() });
        if (this.ImFirst || this.__runningEvents.drag) {
          const { x, y } = this.canvas?.getCursorPosition(event) || {
            x: 0,
            y: 0
          };
          let diffX = x - initCords.x;
          let diffY = y - initCords.y;
          if (diffX !== 0 && this.dragX()) {
            const diff = diffX - beforeCords.x;
            this.x(this.x() + diff);
            beforeCords.x = diffX;
          }
          if (diffY !== 0 && this.dragY()) {
            const diff = diffY - beforeCords.y;
            this.y(this.y() + diff);
            beforeCords.y = diffY;
          }
          this.onDrag()(event);
          this.invokeChange();
        }
      }
    };
    const mouseup = () => {
      if (this.__runningEvents.drag) {
        this.__runningEvents.drag = false;
        if (beforeCords.x !== 0 || beforeCords.y !== 0) {
          const after = {};
          after[this.nodeId] = {
            x: this.x(),
            y: this.y()
          };
          this.canvas?.takeSnapshot(beforeValues, after);
          this.invokeChange();
        }
      }
    };
    this.eventHandler("mousemove", mousemove, "draggableMove");
    this.eventHandler("mouseup", mouseup, "draggableUp");
    return draggable;
  }
};

// src/LayoutBlock.ts
var LayoutBlock = class extends Block {
  #containerX;
  #containerY;
  #startXPos;
  #startYPos;
  #columnsGap;
  #rowsGap;
  #blocksWidth;
  #blocksHeight;
  #layoutCols;
  #layoutRows;
  #invokerLayout;
  #justifyInvoker;
  #justifyItemsInvoker;
  #alignInvoker;
  #alignItemsInvoker;
  constructor(options) {
    super(options);
    this.options = options;
    this.#startXPos = [];
    this.#startYPos = [];
    this.#columnsGap = [];
    this.#rowsGap = [];
    this.#blocksWidth = [];
    this.#blocksHeight = [];
    this.#layoutCols = [];
    this.#layoutRows = [];
    this.layout();
  }
  __adjustChildBlocks() {
    if (this.childNodes.length === 0 || this.useCacheAdjust) return;
    const cacheR = this.rotate();
    this.rotate(0);
    this.#invokerLayout?.();
    this.#justifyInvoker?.();
    if (this.#isGrid) this.#justifyItemsInvoker?.();
    this.#alignInvoker?.();
    this.#alignItemsInvoker?.();
    this.#invokerLayout?.();
    const centerX = this.rotationCenterX();
    const centerY = this.rotationCenterY();
    const containerW = this.#containerW;
    const containerH = this.#containerH;
    const realW = this.width();
    const realH = this.height();
    const widthSpaces = this.__widthSpaces;
    const heightSpaces = this.__heightSpaces;
    let minX;
    let minY;
    let maxX = 0;
    let maxY = 0;
    let adjustedW = 0;
    let adjustedH = 0;
    let z = this.zIndex() || 0;
    if (this.#isGrid) {
      adjustedW = (realW - containerW) / (this.#layoutCols[0] || 1) - (this.__widthSpaces + this.gapColumn()) / (this.#layoutCols[0] || 1) || 1;
      adjustedH = (realH - containerH) / (this.#layoutRows[0] || 1) - (this.__heightSpaces + this.gapRow()) / (this.#layoutRows[0] || 1) || 1;
    } else {
      adjustedW = (realW - containerW) / this.childNodes.length - (this.__widthSpaces + this.gapColumn() * (this.childNodes.length - 1)) / this.childNodes.length;
      adjustedH = (realH - containerH) / this.childNodes.length - (this.__heightSpaces + this.gapRow() * (this.childNodes.length - 1)) / this.childNodes.length;
    }
    this.listOnlyChilds((b) => {
      b.rotate(0);
      b.__childAdjustment?.(b);
      const blockW = b.width();
      const blockH = b.height();
      let bWidthResize = 0;
      let bHeightResize = 0;
      if (this.#isGrid) {
        if (containerW > realW || blockW < b.maxWidth()) {
          bWidthResize = adjustedW;
        }
        if (containerH > realH || blockH < b.maxHeight()) {
          bHeightResize = adjustedH;
        }
      } else {
        if (this.#isFlexCol) {
          if (this.#isWrap) {
            if ((blockH > realH || blockH < b.maxHeight()) && blockH > b.minHeight())
              bHeightResize = -(blockH - (realH - (heightSpaces + this.gapRow())));
            if ((containerW > realW || blockW < b.maxWidth()) && blockW > b.minWidth())
              bWidthResize = adjustedW;
          } else {
            if ((containerH > realH || blockH < b.maxHeight()) && blockH > b.minHeight()) {
              bHeightResize = adjustedH;
            }
            if ((blockW > realW || blockW < b.maxWidth()) && blockW > b.minWidth())
              bWidthResize = -(blockW - (realW - (widthSpaces + this.gapColumn())));
          }
        } else {
          if (this.#isWrap) {
            if ((blockW > realW || blockW < b.maxWidth()) && blockW > b.minWidth())
              bWidthResize = -(blockW - (realW - (widthSpaces + this.gapColumn())));
            if ((containerH > realH || blockH < b.maxHeight()) && blockH > b.minHeight())
              bHeightResize = adjustedH;
          } else {
            if ((containerW > realW || blockW < b.maxWidth()) && blockW > b.minWidth()) {
              bWidthResize = adjustedW;
            }
            if ((blockH > realH || blockH < b.maxHeight()) && blockH > b.minHeight())
              bHeightResize = -(blockH - (realH - (heightSpaces + this.gapRow())));
          }
        }
      }
      const width = b.width() + bWidthResize;
      const height = b.height() + bHeightResize;
      const x = b.x() + this.__overflowCords.x + this.getLeft.x + this.marginLeft() + this.paddingLeft();
      const y = b.y() + this.__overflowCords.y + this.getTop.y + this.marginTop() + this.paddingTop();
      z += 1;
      b.__childAdjustment = (b2) => {
        b2.hidden(this.hidden());
        b2.x(x);
        b2.y(y);
        if (b2.rotationCenter() === "parent") {
          b2.rotationCenterX(centerX);
          b2.rotationCenterY(centerY);
        }
        b2.rotate(cacheR);
        b2.width(width);
        b2.height(height);
        b2.zIndex(z);
      };
      if (this.__clipPath) {
        b.__childClipping = (b2) => {
          b2.context?.clip(this.__clipPath, "nonzero");
        };
      }
      if (width !== void 0 && width + x > maxX) {
        maxX = width + x;
      } else if (blockW + x > maxX) {
        maxX = blockW + x;
      }
      if (height !== void 0 && height + y > maxY) {
        maxY = height + y;
      } else if (blockW + y > maxY) {
        maxY = blockW + y;
      }
      if (minX === void 0 || x < minX) minX = x;
      if (minY === void 0 || y < minY) minY = y;
    }, "order");
    this.#blocksWidth = [];
    this.#blocksHeight = [];
    this.#layoutCols = [];
    this.#layoutRows = [];
    this.#startXPos = [];
    this.#startYPos = [];
    this.#containerX = 0;
    this.#containerY = 0;
    this.#columnsGap = [];
    this.#rowsGap = [];
    this.__overflowCords.minX = minX || 0;
    this.__overflowCords.minY = minY || 0;
    this.__overflowCords.maxX = maxX;
    this.__overflowCords.maxY = maxY;
    this.rotate(cacheR);
  }
  layout(opt) {
    const layout = this.__valueHandler(
      opt,
      "layout",
      "flex"
    );
    if (layout == "inline-flex" || layout == "inline-grid") {
      if (!this.width())
        this.width(
          this.childNodes.reduce(
            (prev, curr) => prev + curr.width(),
            0
          )
        );
      if (!this.height())
        this.height(
          this.childNodes.reduce(
            (prev, curr) => prev + curr.height(),
            0
          )
        );
    }
    if (layout === "flex" || layout == "inline-flex") {
      switch (this.flexDirection()) {
        case "column":
          this.#invokerLayout = this.#flexColumn;
          break;
        case "column-reverse":
          this.#invokerLayout = this.#flexColumnReverse;
          break;
        case "row":
          this.#invokerLayout = this.#flexRow;
          break;
        case "row-reverse":
          this.#invokerLayout = this.#flexRowReverse;
          break;
        default:
          this.#invokerLayout = this.#flexRow;
          break;
      }
    } else if (layout == "grid" || layout == "inline-grid") {
      this.#invokerLayout = this.#gridLayout;
    }
    return layout;
  }
  flexFlow(opt) {
    const flexFlow = this.__valueHandler(opt, "flexFlow", [
      this.flexDirection(),
      this.flexWrap()
    ]);
    this.flexDirection(flexFlow[0]);
    this.flexWrap(flexFlow[1]);
    return flexFlow;
  }
  flexDirection(opt) {
    return this.__valueHandler(opt, "flexDirection", "row");
  }
  flexWrap(opt) {
    return this.__valueHandler(opt, "flexWrap", "nowrap");
  }
  placeContent(opt) {
    this.alignContent(opt);
    this.justifyContent(opt);
    return this.__valueHandler(opt, "placeContent", "start");
  }
  placeItems(opt) {
    this.alignItems(opt);
    this.justifyItems(opt);
    return this.__valueHandler(opt, "placeItems", "start");
  }
  gap(opt) {
    const gap = this.__valueHandler(opt, "gap", 0);
    let gapRow, gapColumn;
    gapRow = gapColumn = gap;
    if (typeof gap === "object") {
      gapRow = gap[0];
      gapColumn = gap[1];
    }
    this.gapColumn(gapRow);
    this.gapRow(gapColumn);
    return gap;
  }
  gridTemplate(opt) {
    const gridTemplate = this.__valueHandler(opt, "gridTemplate", []);
    this.gridTemplateRows(gridTemplate[0]);
    this.gridTemplateColumns(gridTemplate[1]);
    return gridTemplate;
  }
  gridAutoFlow(opt) {
    return this.__valueHandler(opt, "gridAutoFlow", "row");
  }
  gridTemplateColumns(opt) {
    return this.__valueHandler(opt, "gridTemplateColumns", [0]);
  }
  gridTemplateRows(opt) {
    return this.__valueHandler(opt, "gridTemplateRows", []);
  }
  gapColumn(opt) {
    return this.__valueHandler(opt, "gapColumn", 0);
  }
  gapRow(opt) {
    return this.__valueHandler(opt, "gapRow", 0);
  }
  columnStart(opt) {
    return this.__valueHandler(opt, "columnStart", 1);
  }
  columnEnd(opt) {
    return this.__valueHandler(opt, "columnEnd", 0);
  }
  justifyContent(opt) {
    const justifyContent = this.__valueHandler(opt, "justifyContent", "normal");
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
      // only for grid
      case "stretch":
        break;
      default:
        break;
    }
    return justifyContent;
  }
  // only works for grid layout
  justifyItems(opt) {
    const justifyItems = this.__valueHandler(
      opt,
      "justifyItems",
      "normal"
    );
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
      // only for grid
      case "stretch":
        break;
      default:
        break;
    }
    return justifyItems;
  }
  // in flexbox works with wrap option
  alignContent(opt) {
    const alignContent = this.__valueHandler(
      opt,
      "alignContent",
      "normal"
    );
    if (!this.#isWrap && !this.#isGrid) return alignContent;
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
      // only for grid
      case "stretch":
        break;
      default:
        break;
    }
    return alignContent;
  }
  alignItems(opt) {
    const alignItems = this.__valueHandler(
      opt,
      "alignItems",
      "normal"
    );
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
      // only for grid
      case "stretch":
        break;
      default:
        break;
    }
    return alignItems;
  }
  get #isFlexCol() {
    if (this.options.flexDirection === "column" || this.options.flexDirection === "column-reverse")
      return true;
    return false;
  }
  get #isGrid() {
    if (this.options.layout === "grid" || this.options.layout === "inline-grid")
      return true;
    return false;
  }
  get #isWrap() {
    return this.flexWrap() === "nowrap" ? false : true;
  }
  get #containerW() {
    if (this.#isGrid) return this.#blocksWidth.reduce((p, c) => p + c, 0);
    if (this.#isFlexCol) {
      if (this.#isWrap)
        return this.#blocksWidth.reduce((p, c) => p + c, 0);
      return Math.max(...this.#blocksWidth);
    } else {
      if (this.#isWrap) return Math.max(...this.#blocksWidth);
      return this.#blocksWidth.reduce((p, c) => p + c, 0);
    }
  }
  get #containerH() {
    if (this.#isGrid) return this.#blocksHeight.reduce((p, c) => p + c, 0);
    if (this.#isFlexCol) {
      if (this.#isWrap) return Math.max(...this.#blocksHeight);
      return this.#blocksHeight.reduce((p, c) => p + c, 0);
    } else {
      if (this.#isWrap)
        return this.#blocksHeight.reduce((p, c) => p + c, 0);
      return Math.max(...this.#blocksHeight);
    }
  }
  #checkLayoutType(_type, _justify_cont_func, _align_cont_func, _justify_func, _align_func) {
    switch (_type) {
      case "justifyContent":
        this.#justifyInvoker = _justify_cont_func;
        break;
      case "alignContent":
        this.#alignInvoker = _align_cont_func;
        break;
      case "justifyItems":
        this.#justifyItemsInvoker = _justify_func;
        break;
      case "alignItems":
        this.#alignItemsInvoker = _align_func;
        break;
      default:
        break;
    }
  }
  #start(_type) {
    const _justify_cont_func = () => {
      if (this.#isGrid) this.#containerX = 0;
      else {
        if (this.#isFlexCol) this.#containerY = 0;
        else this.#containerX = 0;
      }
    };
    const _align_cont_func = () => {
      if (this.#isGrid) this.#containerY = 0;
      else {
        if (this.#isFlexCol) this.#containerX = 0;
        else if (this.#isWrap) this.#containerY = 0;
      }
    };
    const _justify_func = () => {
      for (let i = 0, len = this.childNodes.length; i < len; i++) {
        this.#startXPos.push(0);
      }
    };
    const _align_func = () => {
      if (this.#isGrid) {
        for (let i = 0, len = this.childNodes.length; i < len; i++) {
          this.#startYPos.push(0);
        }
      } else {
        if (this.#isFlexCol) {
          let containerW = 0;
          if (this.#containerX === void 0) {
            containerW = this.width() - this.#containerW;
            containerW = containerW > 0 ? containerW / this.#blocksWidth.length : 0;
          }
          for (let i = 0, cols = 0, len = this.#blocksWidth.length; i < len; cols += containerW, i++) {
            for (let l = 0; l < this.#layoutRows[i]; l++) {
              this.#startXPos.push(cols);
            }
          }
        } else {
          let containerH = 0;
          if (this.#containerY === void 0) {
            containerH = this.height() - this.#containerH;
            containerH = containerH > 0 ? containerH / this.#blocksHeight.length : 0;
          }
          for (let i = 0, cols = 0, len = this.#blocksHeight.length; i < len; cols += containerH, i++) {
            for (let l = 0; l < this.#layoutCols[i]; l++) {
              this.#startYPos.push(cols);
            }
          }
        }
      }
    };
    this.#checkLayoutType(
      _type,
      _justify_cont_func,
      _align_cont_func,
      _justify_func,
      _align_func
    );
  }
  #end(_type) {
    const _justify_cont_func = () => {
      if (this.#isGrid) {
        this.#containerX = Math.abs(this.width() - this.#containerW);
      } else {
        if (this.#isFlexCol) {
          if (this.#isWrap) {
            for (let i = 0, len = this.#blocksHeight.length; i < len; i++) {
              const startY = this.height() - this.#blocksHeight[i];
              this.#startYPos.push(startY > 0 ? startY : 0);
            }
          } else {
            const startY = this.height() - this.#containerH;
            this.#containerY = startY > 0 ? startY : 0;
          }
        } else {
          if (this.#isWrap) {
            for (let i = 0, len = this.#blocksWidth.length; i < len; i++) {
              let startX = this.width() - this.#blocksWidth[i];
              this.#startXPos.push(startX > 0 ? startX : 0);
            }
          } else {
            const startX = this.width() - this.#containerW;
            this.#containerX = startX > 0 ? startX : 0;
          }
        }
      }
    };
    const _align_cont_func = () => {
      if (this.#isGrid) {
        this.#containerY = Math.abs(this.height() - this.#containerH);
      } else {
        if (!this.#isWrap) return;
        if (this.#isFlexCol) {
          const startX = this.width() - this.#containerW;
          this.#containerX = startX > 0 ? startX : 0;
        } else {
          const startY = this.height() - this.#containerH;
          this.#containerY = startY > 0 ? startY : 0;
        }
      }
    };
    const _justify_func = () => {
      for (let i = 0, col = 0, len = this.childNodes.length; i < len; i++, col++) {
        this.#startXPos.push(
          this.#blocksWidth[col] - this.childNodes[i].width()
        );
        if (col === this.#blocksWidth.length) col = 0;
      }
    };
    const _align_func = () => {
      if (this.#isGrid) {
        for (let i = 0, row = 0, len = this.childNodes.length; i < len; i++) {
          this.#startYPos.push(
            this.#blocksHeight[row] - this.childNodes[i].height()
          );
          if (i === this.#blocksWidth.length - 1) row++;
        }
      } else {
        if (this.#isFlexCol) {
          let containerW = 0;
          if (this.#containerX === void 0) {
            containerW = this.width() - this.#containerW;
            containerW = containerW > 0 ? containerW / this.#blocksWidth.length : 0;
          }
          for (let i = 0, rows = 0, len = this.#blocksWidth.length; i < len; rows += this.#layoutRows[i], i++) {
            let colW = containerW;
            for (let j = 0; j < this.#layoutRows[i]; j++) {
              if (colW !== 0) colW = (i + 1) * containerW;
              this.#startXPos.push(
                colW + (this.#blocksWidth[i] - this.childNodes[j + rows].width())
              );
            }
          }
        } else {
          let containerH = 0;
          if (this.#containerY === void 0) {
            containerH = this.height() - this.#containerH;
            containerH = containerH > 0 ? containerH / this.#blocksHeight.length : 0;
          }
          for (let i = 0, cols = 0, len = this.#blocksHeight.length; i < len; cols += this.#layoutCols[i], i++) {
            let colH = containerH;
            for (let l = 0; l < this.#layoutCols[i]; l++) {
              if (colH !== 0) colH = (i + 1) * containerH;
              this.#startYPos.push(
                colH + (this.#blocksHeight[i] - this.childNodes[l + cols].height())
              );
            }
          }
        }
      }
    };
    this.#checkLayoutType(
      _type,
      _justify_cont_func,
      _align_cont_func,
      _justify_func,
      _align_func
    );
  }
  #center(_type) {
    const _justify_cont_func = () => {
      if (this.#isGrid) {
        let startX = this.width() / 2 - this.#containerW / 2;
        this.#containerX = startX > 0 ? startX : 0;
      } else {
        if (this.#isFlexCol) {
          if (this.#isWrap) {
            for (let i = 0, len = this.#blocksHeight.length; i < len; i++) {
              let startY = this.height() - this.#blocksHeight[i];
              this.#startYPos.push((startY > 0 ? startY : 0) / 2);
            }
          } else {
            const startY = this.height() - this.#containerH;
            this.#containerY = startY > 0 ? startY / 2 : 0;
          }
        } else {
          if (this.#isWrap) {
            for (let i = 0, len = this.#blocksWidth.length; i < len; i++) {
              let startX = this.width() - this.#blocksWidth[i];
              this.#startXPos.push((startX > 0 ? startX : 0) / 2);
            }
          } else {
            const startX = this.width() - this.#containerW;
            this.#containerX = startX > 0 ? startX / 2 : 0;
          }
        }
      }
    };
    const _align_cont_func = () => {
      if (this.#isGrid) {
        const startY = this.height() - this.#containerH;
        this.#containerY = startY > 0 ? startY / this.#layoutRows[0] : 0;
      } else {
        if (!this.#isWrap) return;
        if (this.#isFlexCol) {
          const startX = this.width() - this.#containerW;
          this.#containerX = startX > 0 ? startX / (this.#layoutCols.length + 1) : 0;
        } else {
          const startY = this.height() - this.#containerH;
          this.#containerY = startY > 0 ? startY / (this.#layoutRows.length + 1) : 0;
        }
      }
    };
    const _justify_func = () => {
      for (let i = 0, col = 0, len = this.childNodes.length; i < len; i++, col++) {
        this.#startXPos.push(
          this.#blocksWidth[col] / 2 - this.childNodes[i].width() / 2
        );
        if (this.#blocksWidth.length === col) col = 0;
      }
    };
    const _align_func = () => {
      if (this.#isGrid) {
        for (let i = 0, row = 0, len = this.childNodes.length; i < len; i++, row++) {
          this.#startYPos.push(
            this.#blocksHeight[row] / 2 - this.childNodes[i].height() / 2
          );
          if (this.#blocksHeight.length - 1 === row) row = 0;
        }
      } else {
        if (this.#isFlexCol) {
          const startX = this.width() - this.#containerW;
          this.#containerX = startX > 0 ? startX / (this.#layoutCols.length + 1) : 0;
          for (let i = 0, row = 0, len = this.#blocksWidth.length; i < len; row += this.#layoutRows[i], i++) {
            for (let j = 0; j < this.#layoutRows[i]; j++) {
              this.#startXPos.push(
                (this.#blocksWidth[i] - this.childNodes[j + row].width()) / 2
              );
            }
          }
        } else {
          const startY = this.height() - this.#containerH;
          this.#containerY = startY > 0 ? startY / (this.#layoutRows.length + 1) : 0;
          for (let i = 0, col = 0, len = this.#blocksHeight.length; i < len; col += this.#layoutCols[i], i++) {
            for (let j = 0; j < this.#layoutCols[i]; j++) {
              this.#startYPos.push(
                (this.#blocksHeight[i] - this.childNodes[j + col].height()) / 2
              );
            }
          }
        }
      }
    };
    this.#checkLayoutType(
      _type,
      _justify_cont_func,
      _align_cont_func,
      _justify_func,
      _align_func
    );
  }
  #spaceBetween(_type) {
    const _justify_cont_func = () => {
      if (this.#isGrid) {
        let gap = this.width() - this.#containerW;
        const nCols = this.#layoutCols[0] - 1 !== 0 ? this.#layoutCols[0] - 1 : 1;
        this.gapColumn(gap > 0 ? gap / nCols : 0);
      } else {
        if (this.#isFlexCol) {
          if (this.#isWrap) {
            for (let i = 0, len = this.#blocksHeight.length; i < len; i++) {
              let gap = this.height() - this.#blocksHeight[i];
              gap = gap > 0 ? gap / (this.#layoutRows[i] - 1 || 1) : 0;
              if (this.gapRow() > gap) gap = this.gapRow();
              this.#rowsGap.push(gap);
            }
          } else {
            let gap = this.height() - this.#containerH;
            gap = gap > 0 ? gap / (this.childNodes.length - 1 || 1) : 0;
            this.gapRow(gap);
          }
        } else {
          if (this.#isWrap) {
            for (let i = 0, len = this.#blocksWidth.length; i < len; i++) {
              let gap = this.width() - this.#blocksWidth[i];
              gap = gap > 0 ? gap / (this.#layoutCols[i] - 1 || 1) : 0;
              if (this.gapColumn() > gap) gap = this.gapColumn();
              this.#columnsGap.push(gap);
            }
          } else {
            let gap = this.width() - this.#containerW;
            this.gapColumn(
              gap > 0 ? gap / (this.childNodes.length - 1 || 1) : 0
            );
          }
        }
      }
    };
    const _align_cont_func = () => {
      if (this.#isGrid) {
        let gap = this.height() - this.#containerH;
        this.gapRow(gap > 0 ? gap / (this.#layoutRows[0] || 1) : 0);
      } else {
        if (!this.#isWrap) return;
        if (this.#isFlexCol) {
          let gap = this.width() - this.#containerW;
          this.gapColumn(
            gap > 0 ? gap / (this.#layoutCols.length - 1 || 1) : 0
          );
          this.#containerX = 0;
        } else {
          let gap = this.height() - this.#containerH;
          this.gapRow(
            gap > 0 ? gap / (this.#layoutRows.length - 1 || 1) : 0
          );
          this.#containerY = 0;
        }
      }
    };
    this.#checkLayoutType(_type, _justify_cont_func, _align_cont_func);
  }
  #spaceAround(_type) {
    const _justify_cont_func = () => {
      if (this.#isGrid) {
        let gap = this.width() - this.#containerW;
        gap = gap > 0 ? gap / this.#layoutCols[0] : 0;
        this.gapColumn(gap);
        this.#containerX = gap / 2;
      } else {
        if (this.#isFlexCol) {
          if (this.#isWrap) {
            for (let i = 0, len = this.#blocksHeight.length; i < len; i++) {
              let gap = this.height() - this.#blocksHeight[i];
              gap = gap > 0 ? gap / (this.#layoutRows[i] || 1) : 0;
              if (this.gapRow() > gap) gap = this.gapRow();
              this.#rowsGap.push(gap);
              this.#startYPos.push(gap / 2);
            }
          } else {
            let gap = this.height() - this.#containerH;
            gap = gap > 0 ? gap / this.childNodes.length : 0;
            this.gapRow(gap);
            this.#containerY = gap / 2;
          }
        } else {
          if (this.#isWrap) {
            for (let i = 0, len = this.#blocksWidth.length; i < len; i++) {
              let gap = this.width() - this.#blocksWidth[i];
              gap = gap > 0 ? gap / (this.#layoutCols[i] || 1) : 0;
              if (this.gapColumn() > gap) gap = this.gapColumn();
              this.#columnsGap.push(gap);
              this.#startXPos.push(gap / 2);
            }
          } else {
            let gap = this.width() - this.#containerW;
            gap = gap > 0 ? gap / this.childNodes.length : 0;
            this.gapColumn(gap);
            this.#containerX = gap / 2;
          }
        }
      }
    };
    const _align_cont_func = () => {
      if (this.#isGrid) {
        let gap = this.height() - this.#containerH;
        gap = gap > 0 ? gap / this.#layoutRows[0] : 0;
        this.gapRow(gap);
        this.#containerY = gap / 2;
      } else {
        if (!this.#isWrap) return;
        if (this.#isFlexCol) {
          let gap = this.width() - this.#containerW;
          gap = gap > 0 ? gap / this.#layoutCols.length : 0;
          this.gapColumn(gap);
          this.#containerX = gap / 2;
        } else {
          let gap = this.height() - this.#containerH;
          gap = gap > 0 ? gap / this.#layoutRows.length : 0;
          this.gapRow(gap);
          this.#containerY = gap / 2;
        }
      }
    };
    this.#checkLayoutType(_type, _justify_cont_func, _align_cont_func);
  }
  #spaceEvenly(_type) {
    const _justify_cont_func = () => {
      if (this.#isGrid) {
        let gap = this.width() - this.#containerW;
        gap = gap > 0 ? gap / (this.#layoutCols[0] + 1) : 0;
        this.gapColumn(gap);
        this.#containerX = gap;
      } else {
        if (this.#isFlexCol) {
          if (this.#isWrap) {
            for (let i = 0, len = this.#blocksHeight.length; i < len; i++) {
              let gap = this.height() - this.#blocksHeight[i];
              gap = gap > 0 ? gap / (this.#layoutRows[i] + 1) : 0;
              if (this.gapRow() > gap) gap = this.gapRow();
              this.#rowsGap.push(gap);
              this.#startYPos.push(gap);
            }
          } else {
            let gap = this.height() - this.#containerH;
            gap = gap > 0 ? gap / (this.childNodes.length + 1) : 0;
            this.gapRow(gap);
            this.#containerY = gap;
          }
        } else {
          if (this.#isWrap) {
            for (let i = 0, len = this.#blocksWidth.length; i < len; i++) {
              let gap = this.width() - this.#blocksWidth[i];
              gap = gap > 0 ? gap / (this.#layoutCols[i] + 1 || 1) : 0;
              if (this.gapColumn() > gap) gap = this.gapColumn();
              this.#columnsGap.push(gap);
              this.#startXPos.push(gap);
            }
          } else {
            let gap = this.width() - this.#containerW;
            gap = gap > 0 ? gap / (this.childNodes.length + 1) : 0;
            this.gapColumn(gap);
            this.#containerX = gap;
          }
        }
      }
    };
    const _align_cont_func = () => {
      if (this.#isGrid) {
        let gap = this.height() - this.#containerH;
        gap = gap > 0 ? gap / (this.#layoutRows[0] + 1) : 0;
        this.gapRow(gap);
        this.#containerY = gap;
      } else {
        if (!this.#isWrap) return;
        if (this.#isFlexCol) {
          let gap = this.width() - this.#containerW;
          gap = gap > 0 ? gap / (this.#layoutCols.length + 1 || 1) : 0;
          this.gapColumn(gap);
          this.#containerX = gap;
        } else {
          let gap = this.height() - this.#containerH;
          gap = gap > 0 ? gap / (this.#layoutRows.length + 1 || 1) : 0;
          this.gapRow(gap);
          this.#containerY = gap;
        }
      }
    };
    this.#checkLayoutType(_type, _justify_cont_func, _align_cont_func);
  }
  #flexRow() {
    this.#blocksWidth = [];
    this.#blocksHeight = [];
    this.#layoutCols = [];
    this.#layoutRows = [];
    let colIdx = 0;
    let rowIdx = 0;
    let containerW = 0;
    let containerH = 0;
    let wrapWidth = 0;
    let startX = this.#startXPos[rowIdx] !== void 0 ? this.#startXPos[rowIdx] : this.#containerX || 0;
    let startY = this.#containerY || 0;
    let gapCol = this.#columnsGap[rowIdx] !== void 0 ? this.#columnsGap[rowIdx] : this.gapColumn();
    let gapRow = this.#rowsGap[rowIdx] !== void 0 ? this.#rowsGap[rowIdx] : this.gapRow();
    const layoutWidth = this.width();
    this.listOnlyChilds((block, idx) => {
      if (block.rotationCenter() === "parent") block.rotate(0);
      let blockW = block.width();
      if (block.flexBasis() !== "auto")
        blockW = block.flexBasis();
      if (this.#isWrap) {
        wrapWidth += blockW;
        if (wrapWidth > layoutWidth) {
          rowIdx += 1;
          startY += containerH + gapRow;
          startX = this.#startXPos[rowIdx] !== void 0 ? this.#startXPos[rowIdx] : this.#containerX || 0;
          gapCol = this.#columnsGap[rowIdx] !== void 0 ? this.#columnsGap[rowIdx] : this.gapColumn();
          this.#blocksWidth.push(containerW);
          this.#blocksHeight.push(containerH);
          this.#layoutCols.push(colIdx);
          this.#layoutRows.push(1);
          containerW = 0;
          containerH = 0;
          colIdx = 0;
          wrapWidth = blockW;
        }
      }
      const x = startX + block.marginLeft();
      const y = startY + (this.#startYPos[idx] || 0);
      if (containerH < block.height()) containerH = block.height();
      block.__childAdjustment = (b) => {
        b.x(x);
        b.y(y);
        b.width(blockW);
      };
      wrapWidth += gapCol;
      startX += gapCol + blockW + block.marginRight();
      containerW += blockW;
      colIdx += 1;
    }, "order");
    this.#blocksWidth.push(containerW);
    this.#blocksHeight.push(containerH);
    this.#layoutCols.push(colIdx);
    this.#layoutRows.push(1);
  }
  #flexColumn() {
    this.#blocksWidth = [];
    this.#blocksHeight = [];
    this.#layoutCols = [];
    this.#layoutRows = [];
    let colIdx = 0;
    let rowIdx = 0;
    let containerW = 0;
    let containerH = 0;
    let wrapHeight = 0;
    let startX = this.#containerX || 0;
    let startY = this.#startYPos[colIdx] !== void 0 ? this.#startYPos[colIdx] : this.#containerY || 0;
    let gapCol = this.#columnsGap[colIdx] !== void 0 ? this.#columnsGap[colIdx] : this.gapColumn();
    let gapRow = this.#rowsGap[colIdx] !== void 0 ? this.#rowsGap[colIdx] : this.gapRow();
    const layoutHeight = this.height();
    this.listOnlyChilds((block, idx) => {
      if (block.rotationCenter() === "parent") block.rotate(0);
      let blockH = block.height();
      if (block.flexBasis() !== "auto")
        blockH = block.flexBasis();
      if (this.#isWrap) {
        wrapHeight += blockH;
        if (wrapHeight > layoutHeight) {
          colIdx += 1;
          startX += containerW + gapCol;
          startY = this.#startYPos[colIdx] !== void 0 ? this.#startYPos[colIdx] : this.#containerY || 0;
          gapRow = this.#rowsGap[colIdx] !== void 0 ? this.#rowsGap[colIdx] : this.gapRow();
          this.#blocksWidth.push(containerW);
          this.#blocksHeight.push(containerH);
          this.#layoutCols.push(1);
          this.#layoutRows.push(rowIdx);
          containerW = 0;
          containerH = 0;
          rowIdx = 0;
          wrapHeight = blockH;
        }
      }
      const x = startX + (this.#startXPos[idx] || 0);
      const y = startY + block.marginTop();
      if (containerW < block.width()) containerW = block.width();
      block.__childAdjustment = (b) => {
        b.x(x);
        b.y(y);
        b.height(blockH);
      };
      wrapHeight += gapRow;
      startY += gapRow + blockH + block.marginBottom();
      containerH += blockH;
      rowIdx += 1;
    }, "order");
    this.#blocksWidth.push(containerW);
    this.#blocksHeight.push(containerH);
    this.#layoutCols.push(1);
    this.#layoutRows.push(rowIdx);
  }
  #flexRowReverse() {
    this.#flexRow();
  }
  #flexColumnReverse() {
    this.#flexColumn();
  }
  #gridLayout() {
    this.#blocksWidth = [];
    this.#blocksHeight = [];
    this.#layoutCols = [];
    this.#layoutRows = [];
    const cols = this.gridTemplateColumns();
    const rows = this.gridTemplateRows();
    const autoWidths = cols.filter((item) => item !== "auto");
    let rWidth = autoWidths.reduce(
      (p, c) => p + c,
      0
    );
    const diffCol = Math.abs(cols.length - autoWidths.length);
    if (diffCol) rWidth = (this.width() - rWidth) / diffCol;
    else rWidth = this.width() / cols.length;
    const autoHeights = this.gridTemplateRows().filter(
      (item) => item !== "auto"
    );
    const nRows = Math.ceil(this.childNodes.length / cols.length);
    let rHeight = autoHeights.reduce(
      (p, c) => p + c,
      0
    );
    const diffRow = Math.abs(nRows - autoHeights.length);
    if (diffRow) rHeight = (this.height() - rHeight) / diffRow;
    else rHeight = this.height() / nRows;
    const maxColWidths = [];
    const maxRowHeights = [];
    this.#layoutRows = [nRows];
    this.#layoutCols = [cols.length];
    let startY = this.#containerY || 0;
    let rowCount = 0;
    let rowIdx = 0;
    while (rowIdx < this.#layoutRows[0]) {
      let startX = this.#containerX || 0;
      if (rowIdx == 0) {
        startY = this.#containerY || 0;
        rowCount = 0;
      }
      for (let colIdx = 0; colIdx < this.#layoutCols[0]; colIdx++) {
        let colStart = 0;
        let rowStart = 0;
        const idx = (this.#layoutCols[0] - 1) * rowCount + rowCount + colIdx;
        const block = this.childNodes[idx];
        if (!block) continue;
        if (block.rotationCenter() === "parent") block.rotate(0);
        const blockW = block.width();
        const blockH = block.height();
        if (maxColWidths[colIdx]) {
          if (Math.round(maxColWidths[colIdx]) < Math.round(blockW)) {
            maxColWidths[colIdx] = blockW;
            rowIdx -= rowIdx + 1;
          } else if (!this.justifyContent() && rWidth > maxColWidths[colIdx])
            maxColWidths[colIdx] = rWidth;
        } else maxColWidths.push(blockW || 0);
        if (maxRowHeights[rowCount]) {
          if (Math.round(maxRowHeights[rowCount]) < Math.round(blockH))
            maxRowHeights[rowCount] = blockH;
          else if (!this.alignContent() && rHeight > maxRowHeights[rowCount])
            maxRowHeights[rowCount] = rHeight;
        } else maxRowHeights.push(blockH || 0);
        let endX = blockW;
        if (cols[colIdx] === "auto" || !cols[colIdx]) {
          if (endX) colStart = maxColWidths[colIdx];
          else colStart = endX = rWidth;
        } else {
          colStart = cols[colIdx];
          if (!endX) endX = colStart;
        }
        let endY = blockH;
        if (rows[rowCount] === "auto" || !rows[rowCount]) {
          if (endY) rowStart = maxRowHeights[rowCount];
          else rowStart = endY = rHeight;
        } else {
          rowStart = rows[rowCount];
          if (!endY) endY = rowStart;
        }
        const x = startX + (this.#startXPos[idx] || 0);
        const y = startY + (this.#startYPos[idx] || 0);
        block.__childAdjustment = (b) => {
          b.width(endX);
          b.height(endY);
          b.x(x);
          b.y(y);
        };
        startX += colStart + this.gapColumn();
      }
      let startYD = !rows[rowCount] || rows[rowCount] === "auto" ? maxRowHeights[rowCount] : rows[rowCount];
      startY += startYD + this.gapRow();
      rowCount += 1;
      rowIdx += 1;
    }
    this.#blocksWidth = maxColWidths;
    this.#blocksHeight = maxRowHeights;
  }
};

// src/ShapeBlock.ts
var ShapeBlock = class extends Block {
  #gradient;
  #dataPath;
  __filters = {};
  #filterStr;
  constructor(options) {
    super(options);
  }
  render() {
    this.__childClipping?.(this);
    this.__childAdjustment?.(this);
    this.position();
    this.__clippingPath();
    this.__adjustChildBlocks();
    if (this.__isHidden) return;
    this.beginPath();
    this.context?.save();
    this.context?.translate(this.rotationCenterX(), this.rotationCenterY());
    this.context?.rotate(this.rotate());
    this.context?.translate(
      -this.rotationCenterX(),
      -this.rotationCenterY()
    );
    this.#contextFilter();
    if (this.ownOptions.lineDash) this.lineDash();
    if (this.ownOptions.lineWidth) this.lineWidth();
    if (this.ownOptions.lineCap) this.lineCap();
    if (this.ownOptions.shadowBlur) this.shadowBlur();
    if (this.ownOptions.shadowColor) this.shadowColor();
    if (this.ownOptions.fillStyle) this.fillStyle();
    if (this.ownOptions.fillRect) this.fillRect();
    if (this.ownOptions.rect) this.rect();
    if (this.ownOptions.strokeStyle) this.strokeStyle();
    if (this.ownOptions.clip) this.clip();
    this.draw();
    if (this.ownOptions.fill) this.fill();
    if (this.ownOptions.stroke) this.stroke();
    this.context?.restore();
    this.__isSelected();
    this.onRender()?.();
  }
  draw(_func) {
    if (_func) _func(this.context);
  }
  beginPath() {
    this.context?.beginPath();
  }
  closePath() {
    this.context?.closePath();
    this.#dataPath?.closePath();
  }
  clip(opt) {
    const { path, fillRule } = this.__valueHandler(
      opt,
      "clip",
      {
        path: void 0,
        fillRule: "nonzero"
      }
    );
    if (path) return this.context?.clip(path, fillRule);
    else return this.context?.clip(fillRule);
  }
  fill(opt) {
    const fill = this.__valueHandler(opt, "fill", false);
    if (fill) {
      this.context?.fill();
      if (this.#dataPath) this.context?.fill(this.#dataPath);
    }
    return fill;
  }
  fillStyle(opt) {
    const fillStyle = this.__valueHandler(opt, "fillStyle", "black");
    if (this.context) this.context.fillStyle = fillStyle;
    return fillStyle;
  }
  conicGradient(opt) {
    const { angle, x, y } = this.__valueHandler(opt, "conicGradient", {
      angle: 0,
      x: 0,
      y: 0
    });
    this.#gradient = this.context?.createConicGradient(angle, x, y);
    return this.#gradient;
  }
  radialGradient(opt) {
    const { x0, y0, r0, x1, y1, r1 } = this.__valueHandler(
      opt,
      "radialGradient",
      {
        x0: 0,
        y0: 0,
        r0: 0,
        x1: 0,
        y1: 0,
        r1: 0
      }
    );
    this.#gradient = this.context?.createRadialGradient(
      x0,
      y0,
      r0,
      x1,
      y1,
      r1
    );
    return this.#gradient;
  }
  linearGradient(opt) {
    const { x0, y0, x1, y1 } = this.__valueHandler(opt, "linearGradient", {
      x0: 0,
      y0: 0,
      x1: 0,
      y1: 0
    });
    this.#gradient = this.context?.createLinearGradient(x0, y0, x1, y1);
    return this.#gradient;
  }
  colorStops(opt) {
    const stops = this.__valueHandler(
      opt,
      "colorStops",
      []
    );
    for (let stop of stops) {
      this.#gradient?.addColorStop(stop.stop, stop.color);
    }
    return stops;
  }
  stroke(opt) {
    const stroke = this.__valueHandler(opt, "stroke", false);
    if (stroke) {
      this.context?.stroke();
      if (this.#dataPath) this.context?.stroke(this.#dataPath);
    }
    return stroke;
  }
  strokeStyle(opt) {
    const strokeStyle = this.__valueHandler(opt, "strokeStyle", "black");
    if (this.context) this.context.strokeStyle = strokeStyle;
    return strokeStyle;
  }
  lineCap(opt) {
    const lineCap = this.__valueHandler(opt, "lineCap", "butt");
    if (this.context) this.context.lineCap = lineCap;
    return lineCap;
  }
  lineWidth(opt) {
    const lineWidth = this.__valueHandler(opt, "lineWidth", 0);
    if (this.context) this.context.lineWidth = lineWidth;
    return lineWidth;
  }
  shadowBlur(opt) {
    const shadowBlur = this.__valueHandler(opt, "shadowBlur", 0);
    if (this.context) this.context.shadowBlur = shadowBlur;
    return shadowBlur;
  }
  shadowColor(opt) {
    const shadowColor = this.__valueHandler(opt, "shadowColor", "black");
    if (this.context) this.context.shadowColor = shadowColor;
    return shadowColor;
  }
  shadowOffsetX(opt) {
    const shadowOffsetX = this.__valueHandler(opt, "shadowOffsetX", 0);
    if (this.context) this.context.shadowOffsetX = shadowOffsetX;
    return shadowOffsetX;
  }
  shadowOffsetY(opt) {
    const shadowOffsetY = this.__valueHandler(opt, "shadowOffsetY", 0);
    if (this.context) this.context.shadowOffsetY = shadowOffsetY;
    return shadowOffsetY;
  }
  lineDash(opt) {
    const lineDash = this.__valueHandler(opt, "lineDash", []);
    if (this.context) this.context.setLineDash(lineDash);
    return lineDash;
  }
  lineDashOffset(opt) {
    const lineDash = this.__valueHandler(opt, "lineDash", 0);
    if (this.context) this.context.lineDashOffset = lineDash;
    return lineDash;
  }
  line(opt) {
    const { x, y } = this.__valueHandler(opt, "line", { x: 0, y: 0 });
    this.context?.lineTo(x, y);
    this.#dataPath?.lineTo(x, y);
    return { x, y };
  }
  quadraticCurveTo(opt) {
    const { cpx1, cpy1, endX, endY } = this.__valueHandler(
      opt,
      "quadraticCurveTo",
      { cpx1: 0, cpy1: 0, endX: 0, endY: 0 }
    );
    this.context?.quadraticCurveTo(cpx1, cpy1, endX, endY);
    this.#dataPath?.quadraticCurveTo(cpx1, cpy1, endX, endY);
  }
  bezierCurveTo(opt) {
    const { cpx1, cpy1, cpx2, cpy2, endX, endY } = this.__valueHandler(
      opt,
      "bezierCurveTo",
      { cpx1: 0, cpy1: 0, cpx2: 0, cpy2: 0, endX: 0, endY: 0 }
    );
    this.context?.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, endX, endY);
    this.#dataPath?.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, endX, endY);
  }
  fillRect(opt) {
    const { x, y, width, height } = this.__valueHandler(opt, "fillRect", {
      x: this.x(),
      y: this.y(),
      width: this.width(),
      height: this.height()
    });
    this.context?.fillRect(
      this.x() + x,
      this.y() + y,
      this.width() - width,
      this.height() - height
    );
  }
  rect(opt) {
    const { x, y, width, height } = this.__valueHandler(opt, "rect", {
      x: this.x(),
      y: this.y(),
      width: this.width(),
      height: this.height()
    });
    this.context?.rect(
      this.x() + x,
      this.y() + y,
      this.width() - width,
      this.height() - height
    );
    this.#dataPath?.rect(
      this.x() + x,
      this.y() + y,
      this.width() - width,
      this.height() - height
    );
  }
  roundRect(opt) {
    const { x, y, width, height, borderRadius } = this.__valueHandler(
      opt,
      "roundRect",
      { x: 0, y: 0, width: 0, height: 0, borderRadius: [0] }
    );
    this.context?.roundRect(
      this.x() + x,
      this.y() + y,
      this.width() - width,
      this.height() - height,
      borderRadius
    );
    this.#dataPath?.roundRect(
      this.x() + x,
      this.y() + y,
      this.width() - width,
      this.height() - height,
      borderRadius
    );
  }
  strokeRect(opt) {
    const { x, y, width, height } = this.__valueHandler(opt, "strokeRect", {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    });
    this.context?.strokeRect(
      this.x() + x,
      this.y() + y,
      this.width() - width,
      this.height() - height
    );
  }
  arc(opt) {
    const arc = this.__valueHandler(opt, "arc", {
      x: 0,
      y: 0,
      radius: 0,
      startAngle: 0,
      endAngle: 0,
      counterclockwise: false
    });
    this.context?.arc(
      arc.x,
      arc.y,
      arc.radius,
      arc.startAngle,
      arc.endAngle,
      arc.counterclockwise
    );
    this.#dataPath?.arc(
      arc.x,
      arc.y,
      arc.radius,
      arc.startAngle,
      arc.endAngle,
      arc.counterclockwise
    );
    return;
  }
  arcTo(opt) {
    const arcTo = this.__valueHandler(opt, "arcTo", {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0,
      radius: 0
    });
    this.context?.arcTo(
      arcTo.x1,
      arcTo.y1,
      arcTo.x2,
      arcTo.y2,
      arcTo.radius
    );
    this.#dataPath?.arcTo(
      arcTo.x1,
      arcTo.y1,
      arcTo.x2,
      arcTo.y2,
      arcTo.radius
    );
    return;
  }
  ellipse(opt) {
    const ellipse = this.__valueHandler(opt, "ellipse", {
      x: 0,
      y: 0,
      radiusX: 0,
      radiusY: 0,
      rotation: 0,
      startAngle: 0,
      endAngle: 0,
      counterclockwise: false
    });
    this.context?.ellipse(
      ellipse.x,
      ellipse.y,
      ellipse.radiusX,
      ellipse.radiusY,
      ellipse.rotation,
      ellipse.startAngle,
      ellipse.endAngle,
      ellipse.counterclockwise
    );
    this.#dataPath?.ellipse(
      ellipse.x,
      ellipse.y,
      ellipse.radiusX,
      ellipse.radiusY,
      ellipse.rotation,
      ellipse.startAngle,
      ellipse.endAngle,
      ellipse.counterclockwise
    );
    return;
  }
  moveTo(opt) {
    const { x, y } = this.__valueHandler(opt, "moveTo", {
      x: 0,
      y: 0
    });
    this.context?.moveTo(this.x() + x, this.y() + y);
    this.#dataPath?.moveTo(this.x() + x, this.y() + y);
  }
  lineJoin(opt) {
    const lineJoin = this.__valueHandler(opt, "lineJoin", "miter");
    if (this.context) this.context.lineJoin = lineJoin;
    return lineJoin;
  }
  pointInPath(opt) {
    const { path, x, y, fillRule } = this.__valueHandler(
      opt,
      "pointInPath",
      {
        path: void 0,
        x: 0,
        y: 0,
        fillRule: void 0
      }
    );
    if (path)
      return this.context?.isPointInPath(
        path,
        x,
        y,
        fillRule || "nonzero"
      ) || false;
    else
      return this.context?.isPointInPath(x, y, fillRule || "nonzero") || false;
  }
  pointInStroke(opt) {
    const { path, x, y } = this.__valueHandler(opt, "pointInStroke", {
      path: void 0,
      x: 0,
      y: 0
    });
    if (path) return this.context?.isPointInStroke(path, x, y) || false;
    else return this.context?.isPointInStroke(x, y) || false;
  }
  font(opt) {
    const font = this.__valueHandler(opt, "font", "");
    if (this.context) this.context.font = font;
    return font;
  }
  fillText(opt) {
    const { text, x, y, maxWidth } = this.__valueHandler(opt, "fillText", {
      text: "",
      x: this.x(),
      y: this.y(),
      maxWidth: this.maxWidth()
    });
    this.context?.fillText(text, x, y, maxWidth);
  }
  strokeText(opt) {
    const { text, x, y, maxWidth } = this.__valueHandler(
      opt,
      "strokeText",
      {
        text: "",
        x: this.x(),
        y: this.y(),
        maxWidth: this.maxWidth()
      }
    );
    this.context?.strokeText(text, x, y, maxWidth);
  }
  fontStretch(opt) {
    const fontStretch = this.__valueHandler(opt, "fontStretch", "normal");
    if (this.context) this.context.fontStretch = fontStretch;
    return fontStretch;
  }
  fontKerning(opt) {
    const fontKerning = this.__valueHandler(opt, "fontKerning", "auto");
    if (this.context) this.context.fontKerning = fontKerning;
    return fontKerning;
  }
  fontVariantCaps(opt) {
    const fontVariantCaps = this.__valueHandler(
      opt,
      "fontVariantCaps",
      "normal"
    );
    if (this.context) this.context.fontVariantCaps = fontVariantCaps;
    return fontVariantCaps;
  }
  wordSpacing(opt) {
    const wordSpacing = this.__valueHandler(
      `${opt}px`,
      "wordSpacing",
      "0px"
    );
    if (this.context) this.context.wordSpacing = wordSpacing;
    return wordSpacing;
  }
  direction(opt) {
    const direction = this.__valueHandler(opt, "direction", "ltr");
    if (this.context) this.context.direction = direction;
    return direction;
  }
  letterSpacing(opt) {
    const letterSpacing = this.__valueHandler(opt, "letterSpacing", "0px");
    if (this.context) this.context.letterSpacing = letterSpacing;
    return letterSpacing;
  }
  textAlign(opt) {
    const textAlign = this.__valueHandler(opt, "textAlign", "start");
    if (this.context) this.context.textAlign = textAlign;
    return textAlign;
  }
  textBaseline(opt) {
    const textBaseline = this.__valueHandler(
      opt,
      "textBaseline",
      "alphabetic"
    );
    if (this.context) this.context.textBaseline = textBaseline;
    return textBaseline;
  }
  textRendering(opt) {
    const textRendering = this.__valueHandler(opt, "textRendering", "auto");
    if (this.context) this.context.textRendering = textRendering;
    return textRendering;
  }
  measureText(opt) {
    const text = this.__valueHandler(opt, "measureText", "");
    return this.context?.measureText(text);
  }
  #contextFilter() {
    if (!this.#filterStr) {
      const entries = Object.entries(this.__filters);
      if (entries.length !== 0) {
        let allStr = "";
        for (const [key, value] of Object.entries(this.__filters)) {
          if (value) allStr += ` ${key + value}`;
        }
        this.#filterStr = allStr;
      }
    }
    if (this.context && this.#filterStr) {
      this.context.filter = this.#filterStr;
    }
  }
  #filterHandler(filter, value) {
    if (value === void 0 || filter == void 0) return;
    switch (filter) {
      case "blur":
        value = value + "px";
        break;
      case "brightness":
        value = value + "%";
        break;
      case "contrast":
        value = value + "%";
        break;
      case "drop-shadow":
        let _s = "";
        value.forEach((i, idx, arr) => {
          if (typeof i == "string") _s += i;
          else {
            _s += `${i}px`;
          }
          if (idx !== arr.length - 1) _s += " ";
        });
        value = _s;
        break;
      case "grayscale":
        value = value + "%";
        break;
      case "hue-rotate":
        value = value + "deg";
        break;
      case "opacity":
        value = value + "%";
        break;
      case "saturate":
        value = value + "%";
        break;
      case "sepia":
        value = value + "%";
        break;
    }
    this.__filters[filter] = `(${value})`;
    this.#filterStr = void 0;
  }
  blur(opt) {
    const blur = this.__valueHandler(opt, "blur", void 0);
    this.#filterHandler("blur", blur);
    return blur;
  }
  brightness(opt) {
    const brightness = this.__valueHandler(opt, "brightness", void 0);
    this.#filterHandler("brightness", brightness);
    return brightness;
  }
  contrast(opt) {
    const contrast = this.__valueHandler(opt, "contrast", void 0);
    this.#filterHandler("contrast", contrast);
    return contrast;
  }
  dropShadow(opt) {
    const dropShadow = this.__valueHandler(opt, "dropShadow", void 0);
    this.#filterHandler("drop-shadow", dropShadow);
    return dropShadow;
  }
  grayscale(opt) {
    const grayscale = this.__valueHandler(opt, "grayscale", void 0);
    this.#filterHandler("grayscale", grayscale);
    return grayscale;
  }
  hueRotate(opt) {
    const hueRotate = this.__valueHandler(opt, "hueRotate", void 0);
    this.#filterHandler("hue-rotate", hueRotate);
    return hueRotate;
  }
  opacity(opt) {
    const opacity = this.__valueHandler(opt, "opacity", void 0);
    this.#filterHandler("opacity", opacity);
    return opacity;
  }
  saturate(opt) {
    const saturate = this.__valueHandler(opt, "saturate", void 0);
    this.#filterHandler("saturate", saturate);
    return saturate;
  }
  sepia(opt) {
    const sepia = this.__valueHandler(opt, "sepia", void 0);
    this.#filterHandler("sepia", sepia);
    return sepia;
  }
  pathData(opt) {
    const data = this.__valueHandler(opt, "pathData", void 0);
    if (data !== void 0) this.#dataPath = new Path2D(data);
    return data;
  }
};

// src/shapes/CircleBlock.ts
var CircleBlock = class extends ShapeBlock {
  constructor(options) {
    super(options);
  }
  draw(_func) {
    if (!this.context) return;
    this.context.lineJoin = "round";
    this.context.lineCap = "round";
    if (!this.#isAngleEmpty) {
      this.context.arc(
        this.getCenterX,
        this.getCenterY,
        this.innerRadius(),
        this.endAngle(),
        this.startAngle(),
        true
      );
    }
    this.context.ellipse(
      this.getCenterX,
      this.getCenterY,
      this.radiusX() / 2,
      this.radiusY() / 2,
      0,
      this.startAngle(),
      this.endAngle()
    );
    this.fillStyle(this.backgroundColor());
    this.fill();
    this.stroke();
    if (this.#isAngleEmpty) this.beginPath();
    this.context.arc(
      this.getCenterX,
      this.getCenterY,
      this.innerRadius(),
      this.endAngle(),
      this.startAngle(),
      true
    );
    this.fillStyle("transparent");
    this.fill(true);
  }
  get #isAngleEmpty() {
    if (this.startAngle() === 0 && this.endAngle() === Math.PI * 2)
      return true;
    return false;
  }
  radius(opt) {
    const radius = this.__valueHandler(opt, "radius", 0);
    this.radiusX(radius);
    this.radiusY(radius);
    return radius;
  }
  radiusX(opt) {
    const cacheR = this.rotate();
    this.rotate(0);
    const r = this.__valueHandler(opt, "radiusX", 0, true);
    const diffR = this.width() - r;
    this.rotate(cacheR);
    if (diffR !== 0) return r + diffR;
    return r;
  }
  radiusY(opt) {
    const cacheR = this.rotate();
    this.rotate(0);
    const r = this.__valueHandler(opt, "radiusY", 0);
    const diffR = this.height() - r;
    this.rotate(cacheR);
    if (diffR !== 0) return r + diffR;
    return r;
  }
  innerRadius(opt) {
    return this.__valueHandler(opt, "innerRadius", 0);
  }
  startAngle(opt) {
    return this.__valueHandler(opt, "startAngle", 0);
  }
  endAngle(opt) {
    return this.__valueHandler(opt, "endAngle", Math.PI * 2);
  }
  backgroundColor(opt) {
    const backgroundColor = this.__valueHandler(
      opt,
      "backgroundColor",
      "black"
    );
    super.fillStyle(backgroundColor);
    this.fill(true);
    return backgroundColor;
  }
  borderWidth(opt) {
    const borderWidth = this.__valueHandler(opt, "borderWidth", 0);
    super.lineWidth(borderWidth);
    return borderWidth;
  }
  borderColor(opt) {
    const borderColor = this.__valueHandler(opt, "borderColor", "black");
    super.strokeStyle(borderColor);
    return borderColor;
  }
  borderStyle(opt) {
    return this.__valueHandler(opt, "borderStyle", "solid");
  }
  border(opt) {
    const border = this.__valueHandler(
      opt,
      "border",
      void 0
    );
    if (border) {
      const borderParsed = border.split(" ") || [];
      const borderWidth = this.__unitConverter({
        val: borderParsed[0],
        widthRelated: true
      });
      this.borderWidth(borderWidth);
      this.borderStyle(borderParsed[1]);
      this.borderColor(borderParsed[2]);
      this.stroke(true);
    }
    return border;
  }
  __clipShape() {
    this.__clipPath?.ellipse(
      this.getCenterX,
      this.getCenterY,
      this.radiusX() / 2,
      this.radiusY() / 2,
      0,
      this.startAngle(),
      this.endAngle()
    );
  }
};

// src/shapes/ImageBlock.ts
var ImageBlock = class extends ShapeBlock {
  #cacheImage;
  constructor(source, options) {
    super(options);
    this.source(source);
  }
  draw(_func) {
    if (!this.#cacheImage) {
      if (typeof this.source() === "string") {
        this.#cacheImage = new Image();
        this.#cacheImage.src = this.source();
      } else this.#cacheImage = this.source();
      this.#cacheImage.addEventListener("load", () => this.#drawImage());
    } else this.#drawImage();
  }
  #drawImage() {
    const fit = this.objectFit();
    let width = this.#cacheImage.width;
    let height = this.#cacheImage.height;
    let wrapW = 0;
    let wrapH = 0;
    let x = this.x();
    let y = this.y();
    let clipW = this.clipWidth();
    let clipH = this.clipHeight();
    if (!this.isRepeat) {
      if (fit === "contain") {
        clipW = width;
        clipH = height;
        if (height > this.height()) {
          const aspectH = height / this.height();
          clipH *= aspectH;
          clipW *= aspectH;
        }
        if (width > this.width()) {
          const aspectW = width / this.width();
          clipW *= aspectW;
          clipH *= aspectW;
        }
      } else if (fit === "cover") {
        clipW = this.#cacheImage.width;
        clipH = this.#cacheImage.height;
      } else if (fit === "fill") {
        width = this.width();
        height = this.height();
        clipW = this.#cacheImage.width;
        clipH = this.#cacheImage.height;
      }
      this.context?.drawImage(
        this.#cacheImage,
        this.clipX(),
        this.clipY(),
        clipW,
        clipH,
        x,
        y,
        width,
        height
      );
    } else {
      let wPerImage = this.width();
      let hPerImage = this.height();
      if (this.repeatX() !== void 0) {
        if (this.repeatX() === "fill") wPerImage = width;
        else wPerImage = this.width() / this.repeatX();
      }
      if (this.repeatY() !== void 0) {
        if (this.repeatY() === "fill") hPerImage = height;
        else hPerImage = this.height() / this.repeatY();
      }
      while (this.height() > Math.ceil(wrapH)) {
        while (this.width() > Math.ceil(wrapW)) {
          this.context?.drawImage(
            this.#cacheImage,
            this.clipX(),
            this.clipY(),
            width - this.clipX(),
            height - this.clipY(),
            x,
            y,
            wPerImage,
            hPerImage
          );
          wrapW += wPerImage || this.width();
          x += wPerImage || this.width();
        }
        wrapH += hPerImage || this.height();
        y += hPerImage || this.height();
        wrapW = 0;
        x = this.x();
      }
    }
  }
  source(opt) {
    return this.__valueHandler(opt, "source", void 0);
  }
  get isRepeat() {
    return this.repeatX() !== void 0 || this.repeatY() !== void 0;
  }
  smoothing(opt) {
    const enabled = this.__valueHandler(opt, "smoothing", false);
    if (this.context) this.context.imageSmoothingEnabled = enabled;
    return enabled;
  }
  smoothingQuality(opt) {
    const quality = this.__valueHandler(opt, "smoothingQuality", "low");
    if (this.context) this.context.imageSmoothingQuality = quality;
    return quality;
  }
  repeatX(opt) {
    return this.__valueHandler(opt, "repeatX", void 0);
  }
  repeatY(opt) {
    return this.__valueHandler(opt, "repeatY", void 0);
  }
  clipX(opt) {
    return this.__valueHandler(opt, "clipX", 0);
  }
  clipY(opt) {
    return this.__valueHandler(opt, "clipY", 0);
  }
  clipWidth(opt) {
    return this.__valueHandler(opt, "clipWidth", this.width());
  }
  clipHeight(opt) {
    return this.__valueHandler(opt, "clipHeight", this.height());
  }
  objectFit(opt) {
    return this.__valueHandler(opt, "objectFit", void 0);
  }
};

// src/shapes/LineBlock.ts
var LineBlock = class extends ShapeBlock {
  path;
  pathLine;
  pathC1;
  pathC2;
  pathC3;
  pathC4;
  __joined = false;
  __editable = false;
  __points = { x: [], y: [] };
  __stickyStartBlock = {
    x: void 0,
    y: void 0,
    width: void 0,
    height: void 0
  };
  __stickyEndBlock = {
    x: void 0,
    y: void 0,
    width: void 0,
    height: void 0
  };
  #oldCords = {
    x: this.ownOptions.x || 0,
    y: this.ownOptions.y || 0,
    width: this.ownOptions.width || 0,
    height: this.ownOptions.height || 0
  };
  constructor(options) {
    super(options);
  }
  render() {
    this.#boundingBox();
    this.#handleSticky();
    super.render();
    if (this.__runningEvents.selected || this.__editable) {
      this.__hotLines();
      if (this.joinTo() !== void 0) this.joinTo().__hotLines();
    }
    if (this.__editable) this.__runningEvents.selected = false;
  }
  __initCordinates() {
    this.#boundingBox();
    this.ownOptions.x = this.#oldCords.x;
    this.ownOptions.y = this.#oldCords.y;
    this.ownOptions.width = this.#oldCords.width;
    this.ownOptions.height = this.#oldCords.height;
    super.__initCordinates();
  }
  joinTo(opt) {
    const join = this.__valueHandler(
      opt,
      "joinTo",
      void 0
    );
    if (join !== void 0) join.__joined = true;
    return join;
  }
  draw(_func) {
    if (this.joinTo() !== void 0) {
      const joined = this.joinTo();
      this.path = joined.path || new Path2D();
      this.startX(joined.endX());
      this.startY(joined.endY());
      this.zIndex(joined.zIndex());
      this.__editable = joined.__editable;
    } else {
      this.path = new Path2D();
      this.path.moveTo(this.startX(), this.startY());
    }
    if (this.lineType() === "cubicBezier") {
      this.path.bezierCurveTo(
        this.startControlX(),
        this.startControlY(),
        this.endControlX(),
        this.endControlY(),
        this.endX(),
        this.endY()
      );
    } else {
      this.path.lineTo(this.endX(), this.endY());
    }
    if (this.closePath()) this.path.closePath();
    if (this.fill()) this.context?.fill(this.path);
    if (this.stroke()) this.context?.stroke(this.path);
  }
  __hotLines() {
    if (!this.context) return;
    if (!this.__editable) {
      if (!this.__joined) super.__hotLines();
      return;
    }
    this.context?.save();
    this.context?.translate(this.rotationCenterX(), this.rotationCenterY());
    this.context?.rotate(this.rotate());
    this.context?.translate(
      -this.rotationCenterX(),
      -this.rotationCenterY()
    );
    this.context.setLineDash([]);
    this.beginPath();
    this.pathLine = new Path2D();
    this.pathLine.moveTo(this.startX(), this.startY());
    this.pathLine.bezierCurveTo(
      this.startControlX(),
      this.startControlY(),
      this.endControlX(),
      this.endControlY(),
      this.endX(),
      this.endY()
    );
    this.context.lineWidth = 1;
    this.context.strokeStyle = "blue";
    this.context.stroke(this.pathLine);
    this.beginPath();
    this.pathC1 = new Path2D();
    this.pathC1.arc(
      this.startX(),
      this.startY(),
      this.controlPointsSize(),
      0,
      Math.PI * 2
    );
    this.context.lineWidth = 2;
    this.context.strokeStyle = "blue";
    this.context.fillStyle = "white";
    this.context.stroke(this.pathC1);
    this.context.fill(this.pathC1);
    this.beginPath();
    this.pathC4 = new Path2D();
    this.pathC4.arc(
      this.endX(),
      this.endY(),
      this.controlPointsSize(),
      0,
      Math.PI * 2
    );
    this.context.lineWidth = 2;
    this.context.strokeStyle = "blue";
    this.context.fillStyle = "white";
    this.context.stroke(this.pathC4);
    this.context.fill(this.pathC4);
    if (this.startControllable() && this.lineType() === "cubicBezier") {
      this.beginPath();
      this.context.moveTo(this.startX(), this.startY());
      this.context.lineTo(this.startControlX(), this.startControlY());
      this.pathC2 = new Path2D();
      this.pathC2.arc(
        this.startControlX(),
        this.startControlY(),
        this.controlPointsSize(),
        0,
        Math.PI * 2
      );
      this.context.lineWidth = 1;
      this.context.strokeStyle = "blue";
      this.context.fillStyle = "white";
      this.context.stroke();
      this.context.stroke(this.pathC2);
      this.context.fill(this.pathC2);
    }
    if (this.endControllable() && this.lineType() === "cubicBezier") {
      this.beginPath();
      this.context.moveTo(this.endX(), this.endY());
      this.context.lineTo(this.endControlX(), this.endControlY());
      this.pathC3 = new Path2D();
      this.pathC3.arc(
        this.endControlX(),
        this.endControlY(),
        this.controlPointsSize(),
        0,
        Math.PI * 2
      );
      this.context.lineWidth = 1;
      this.context.strokeStyle = "blue";
      this.context.fillStyle = "white";
      this.context.stroke();
      this.context.stroke(this.pathC3);
      this.context.fill(this.pathC3);
    }
    this.context?.restore();
  }
  checkInBound(_event) {
    const { x, y } = this.canvas?.getCursorPosition(_event) || {
      x: 0,
      y: 0
    };
    let inBound = false;
    this.lineWidth();
    if (!this.__runningEvents.selected) {
      inBound = this.#pathInBound(x, y, this.path);
    } else if (!this.__editable) {
      inBound = checkInBound(
        x,
        y,
        this.hotCornerTopLeft().x,
        this.hotCornerTopLeft().y,
        this.hotCornerTopRight().x,
        this.hotCornerTopRight().y,
        this.hotCornerBottomLeft().x,
        this.hotCornerBottomLeft().y,
        this.hotCornerBottomRight().x,
        this.hotCornerBottomRight().y
      );
    }
    if (inBound) this.canvas?.registerZIndex({ in: this.zIndex() });
    else this.canvas?.registerZIndex({ out: this.zIndex() });
    return inBound;
  }
  lineType(opt) {
    return this.__valueHandler(opt, "type", "line");
  }
  x(opt) {
    let cacheX = this.__unitConverter({
      val: this.ownOptions.x || 0,
      widthRelated: false
    });
    const x = super.x(opt);
    const diffX = x - cacheX;
    if (diffX !== 0) {
      this.startX(this.startX() + diffX);
      this.endX(this.endX() + diffX);
    }
    return x;
  }
  y(opt) {
    let cacheY = this.__unitConverter({
      val: this.ownOptions.y || 0,
      widthRelated: false
    });
    const y = super.y(opt);
    const diffY = y - cacheY;
    if (diffY !== 0) {
      this.startY(this.startY() + diffY);
      this.endY(this.endY() + diffY);
    }
    return y;
  }
  width(opt) {
    let cacheW = this.__unitConverter({
      val: this.ownOptions.width || 0,
      widthRelated: false
    });
    const w = super.width(opt);
    if (w < this.minWidth() && !this.horizontalFlipResize())
      return this.minWidth();
    const diffW = w - cacheW;
    if (diffW !== 0) {
      const cR = this.rotate();
      this.rotate(0);
      const joined = this.joinTo();
      if (joined) {
        if (this.endX() > joined.startX()) {
          this.endX(this.endX() + diffW);
          joined.endX(joined.endX() + diffW);
        } else {
          joined.startX(joined.startX() + diffW);
          this.startX(this.startX() + diffW);
        }
      } else {
        if (this.endX() > this.startX()) this.endX(this.endX() + diffW);
        else this.startX(this.startX() + diffW);
      }
      this.rotate(cR);
    }
    return w;
  }
  height(opt) {
    const cacheH = this.__unitConverter({
      val: this.ownOptions.height || 0,
      widthRelated: false
    });
    const h = super.height(opt);
    if (h < this.minHeight() && !this.verticalFlipResize())
      return this.minHeight();
    const diffH = h - cacheH;
    if (diffH !== 0) {
      const cR = this.rotate();
      this.rotate(0);
      const joined = this.joinTo();
      if (joined) {
        if (this.endY() > joined.startY()) {
          this.endY(this.endY() + diffH);
          joined.endY(joined.endY() + diffH);
        } else {
          joined.startY(joined.startY() + diffH);
          this.startY(this.startY() + diffH);
        }
      } else {
        if (this.endY() > this.startY()) this.endY(this.endY() + diffH);
        else this.startY(this.startY() + diffH);
      }
      this.rotate(cR);
    }
    return h;
  }
  startX(opt) {
    const cacheX = this.__unitConverter({
      val: this.ownOptions.startX || 0,
      widthRelated: false
    });
    let x = this.__valueHandler(
      opt,
      "startX",
      void 0
    );
    if (x === void 0) x = this.x();
    const diffX = x - cacheX;
    if (diffX !== 0 && this.lineType() == "cubicBezier")
      this.startControlX(this.startControlX() + diffX);
    return x;
  }
  startY(opt) {
    const cacheY = this.__unitConverter({
      val: this.ownOptions.startY || 0,
      widthRelated: false
    });
    let y = this.__valueHandler(
      opt,
      "startY",
      void 0
    );
    if (y === void 0) y = this.y();
    const diffY = y - cacheY;
    if (diffY !== 0 && this.lineType() == "cubicBezier")
      this.startControlY(this.startControlY() + diffY);
    return y;
  }
  endX(opt) {
    const cacheX = this.__unitConverter({
      val: this.ownOptions.endX || 0,
      widthRelated: false
    });
    let x = this.__valueHandler(
      opt,
      "endX",
      void 0
    );
    if (x === void 0) x = this.x() + this.width();
    const diffX = x - cacheX;
    if (diffX !== 0 && this.lineType() == "cubicBezier")
      this.endControlX(this.endControlX() + diffX);
    return x;
  }
  endY(opt) {
    const cacheY = this.__unitConverter({
      val: this.ownOptions.endY || 0,
      widthRelated: false
    });
    let y = this.__valueHandler(
      opt,
      "endY",
      void 0
    );
    if (y === void 0) y = this.y() + this.height();
    const diffY = y - cacheY;
    if (diffY !== 0 && this.lineType() == "cubicBezier")
      this.endControlY(this.endControlY() + diffY);
    return y;
  }
  startControlX(opt) {
    const x = this.__valueHandler(opt, "startControlX", void 0);
    if (x === void 0) return this.startX();
    return x;
  }
  startControlY(opt) {
    const y = this.__valueHandler(opt, "startControlY", void 0);
    if (y === void 0) return this.startY();
    return y;
  }
  endControlX(opt) {
    const x = this.__valueHandler(opt, "endControlX", void 0);
    if (x === void 0) return this.endX();
    return x;
  }
  endControlY(opt) {
    const y = this.__valueHandler(opt, "endControlY", void 0);
    if (y === void 0) return this.endY();
    return y;
  }
  stickStart(opt) {
    return this.__valueHandler(opt, "stickStart", {
      block: void 0,
      x: 0,
      y: 0
    });
  }
  stickEnd(opt) {
    return this.__valueHandler(opt, "stickEnd", {
      block: void 0,
      x: 0,
      y: 0
    });
  }
  startDraggable(opt) {
    const draggable = this.__valueHandler(opt, "startDraggable", false);
    if (draggable)
      this.#draggablePoints(
        "startX",
        "startY",
        "pathC1",
        "startDraggable"
      );
    return draggable;
  }
  endDraggable(opt) {
    const draggable = this.__valueHandler(opt, "endDraggable", false);
    if (draggable)
      this.#draggablePoints("endX", "endY", "pathC4", "endDraggable");
    return draggable;
  }
  startControllable(opt) {
    const draggable = this.__valueHandler(opt, "startControllable", false);
    if (draggable && this.lineType() === "cubicBezier")
      this.#draggablePoints(
        "startControlX",
        "startControlY",
        "pathC2",
        "startControllable"
      );
    return draggable;
  }
  endControllable(opt) {
    const draggable = this.__valueHandler(opt, "endControllable", false);
    if (draggable && this.lineType() === "cubicBezier")
      this.#draggablePoints(
        "endControlX",
        "endControlY",
        "pathC3",
        "endControllable"
      );
    return draggable;
  }
  controlPointsSize(opt) {
    return this.__valueHandler(opt, "controlPointsSize", 4);
  }
  editable(opt) {
    const editable = this.__valueHandler(opt, "editable", false);
    if (!editable) return editable;
    const dblclick = (event) => {
      const { x, y } = this.canvas?.getCursorPosition(event) || {
        x: 0,
        y: 0
      };
      if (this.#pathInBound(x, y, this.path)) {
        this.__editable = true;
        this.canvas?.invokeChange();
      }
    };
    const click = (event) => {
      const { x, y } = this.canvas?.getCursorPosition(event) || {
        x: 0,
        y: 0
      };
      let editable2 = !this.#pathInBound(x, y, this.path) && !this.#pathInBound(x, y, this.pathC1) && !this.#pathInBound(x, y, this.pathC2) && !this.#pathInBound(x, y, this.pathC3) && !this.#pathInBound(x, y, this.pathC4);
      if (editable2) {
        this.__editable = false;
      }
      const join = this.joinTo();
      if (join !== void 0 && !this.#pathInBound(x, y, join.pathC1) && !this.#pathInBound(x, y, join.pathC2) && !this.#pathInBound(x, y, join.pathC3) && !this.#pathInBound(x, y, join.pathC4) && !this.#pathInBound(x, y, this.path)) {
        join.__editable = !editable2;
      }
    };
    this.eventHandler("click", click, "editableClick");
    this.eventHandler("dblclick", dblclick, "editableDlclick");
    return editable;
  }
  #pathInBound(x, y, path) {
    return this.pointInStroke({ path, x, y }) || this.pointInPath({ path, x, y });
  }
  #draggablePoints(xPoint, yPoint, path, identify) {
    let initCords = { x: 0, y: 0 };
    let beforeCords = { x: 0, y: 0 };
    let beforeValues = {};
    let isRunning = false;
    const callX = getPrototype(this, xPoint);
    const callY = getPrototype(this, yPoint);
    const mousedown = (event) => {
      isRunning = false;
      const pointPaths = {
        pathC1: this.pathC1,
        pathC2: this.pathC2,
        pathC3: this.pathC3,
        pathC4: this.pathC4
      };
      const { x, y } = this.canvas?.getCursorPosition(event) || {
        x: 0,
        y: 0
      };
      const inBound = this.#pathInBound(x, y, pointPaths[path]);
      if (inBound) {
        initCords = { x, y };
        beforeCords = { x: 0, y: 0 };
        beforeValues[this.nodeId] = {};
        beforeValues[this.nodeId][xPoint] = callX?.value.call(this);
        beforeValues[this.nodeId][yPoint] = callY?.value.call(this);
        isRunning = true;
        this.canvas?.registerZIndex({ in: this.zIndex() });
      } else this.canvas?.registerZIndex({ out: this.zIndex() });
    };
    const mousemove = (event) => {
      if (isRunning) {
        this.__runningEvents.drag = false;
        if (this.joinTo() !== void 0)
          this.joinTo().__runningEvents.drag = false;
        this.canvas?.registerZIndex({ in: this.zIndex() });
        if (this.canvas?.whoIsTheFirst(this.zIndex())) {
          const { x, y } = this.canvas?.getCursorPosition(event);
          let diffX = x - initCords.x;
          let diffY = y - initCords.y;
          if (diffX !== 0) {
            const diff = diffX - beforeCords.x;
            callX?.value.call(this, callX?.value.call(this) + diff);
            beforeCords.x = diffX;
          }
          if (diffY !== 0) {
            const diff = diffY - beforeCords.y;
            callY?.value.call(this, callY?.value.call(this) + diff);
            beforeCords.y = diffY;
          }
          this.canvas?.invokeChange();
        }
      }
    };
    const mouseup = () => {
      if (isRunning) {
        isRunning = false;
        if (beforeCords.x !== 0 || beforeCords.y !== 0) {
          const after = {};
          after[this.nodeId] = {};
          after[this.nodeId][xPoint] = callX?.value.call(this);
          after[this.nodeId][yPoint] = callY?.value.call(this);
          this.canvas?.takeSnapshot(beforeValues, after);
          this.canvas?.invokeChange();
        }
      }
    };
    this.eventHandler(
      "mousedown",
      mousedown,
      `${identify}Down`
    );
    this.eventHandler(
      "mousemove",
      mousemove,
      `${identify}Move`
    );
    this.eventHandler("mouseup", mouseup, `${identify}Up`);
  }
  #handleSticky() {
    if (this.stickStart() !== void 0 && this.stickStart().block !== void 0) {
      const b = this.stickStart().block;
      if (this.__stickyStartBlock.x !== void 0) {
        this.stickStart().x += b.x() - this.__stickyStartBlock.x;
      }
      if (this.__stickyStartBlock.y !== void 0) {
        this.stickStart().y += b.y() - this.__stickyStartBlock.y;
      }
      if (this.__stickyStartBlock.width !== void 0) {
        this.stickStart().x += b.width() - this.__stickyStartBlock.width;
      }
      if (this.__stickyStartBlock.height !== void 0) {
        this.stickStart().y += b.height() - this.__stickyStartBlock.height;
      }
      this.__stickyStartBlock.x = b.x();
      this.__stickyStartBlock.y = b.y();
      this.__stickyStartBlock.width = b.width();
      this.__stickyStartBlock.height = b.height();
      this.startX(this.stickStart().x);
      this.startY(this.stickStart().y);
    }
    if (this.stickEnd() !== void 0 && this.stickEnd().block !== void 0) {
      const b = this.stickEnd().block;
      if (this.__stickyEndBlock.x !== void 0) {
        this.stickEnd().x += b.x() - this.__stickyEndBlock.x;
      }
      if (this.__stickyEndBlock.y !== void 0) {
        this.stickEnd().y += b.y() - this.__stickyEndBlock.y;
      }
      if (this.__stickyEndBlock.width !== void 0) {
        this.stickEnd().x += b.width() - this.__stickyEndBlock.width;
      }
      if (this.__stickyEndBlock.height !== void 0) {
        this.stickEnd().y += b.height() - this.__stickyEndBlock.height;
      }
      this.__stickyEndBlock.x = b.x();
      this.__stickyEndBlock.y = b.y();
      this.__stickyEndBlock.width = b.width();
      this.__stickyEndBlock.height = b.height();
      this.endX(this.stickEnd().x);
      this.endY(this.stickEnd().y);
    }
  }
  #boundingBox() {
    const c1 = this.#findMinMax(
      this.startX(),
      this.startControlX(),
      this.endControlX(),
      this.endX()
    );
    const c2 = this.#findMinMax(
      this.startY(),
      this.startControlY(),
      this.endControlY(),
      this.endY()
    );
    this.__points.x = [this.startX(), this.endX(), ...c1];
    this.__points.y = [this.startY(), this.endY(), ...c2];
    const joined = this.joinTo();
    if (joined !== void 0) {
      this.__points.x = [...this.__points.x, ...joined.__points.x];
      this.__points.y = [...this.__points.y, ...joined.__points.y];
    }
    const xMin = Math.min(...this.__points.x);
    const yMin = Math.min(...this.__points.y);
    const xMax = Math.max(...this.__points.x);
    const yMax = Math.max(...this.__points.y);
    this.#oldCords.x = xMin;
    this.#oldCords.y = yMin;
    this.#oldCords.width = xMax - xMin;
    this.#oldCords.height = yMax - yMin;
    this.hotCornerTopLeft({
      x: xMin,
      y: yMin
    });
    this.hotCornerTopRight({
      x: xMax,
      y: yMin
    });
    this.hotCornerBottomLeft({
      x: xMin,
      y: yMax
    });
    this.hotCornerBottomRight({
      x: xMax,
      y: yMax
    });
  }
  #findMinMax(p0, p1, p2, p3) {
    const a = 3 * (-p0 + 3 * p1 - 3 * p2 + p3);
    const b = 6 * (p0 - 2 * p1 + p2);
    const c = 3 * (p1 - p0);
    const points = [];
    const D = Math.pow(b, 2) - 4 * a * c;
    if (D == 0) {
      cubicBezier;
      const t = -b / (2 * a);
      if (t >= 0 && t <= 1) points.push(t);
    } else if (D > 0) {
      const base = Math.sqrt(D);
      const t1 = (-b + base) / (2 * a);
      const t2 = (-b - base) / (2 * a);
      if (t1 >= 0 && t1 <= 1) points.push(t1);
      if (t2 >= 0 && t2 <= 1) points.push(t2);
    }
    return points.map((i) => {
      return cubicBezier(p0, p1, p2, p3, i);
    });
  }
  closePath(opt) {
    return this.__valueHandler(opt, "closePath", false);
  }
  lineColor(opt) {
    const lineColor = this.__valueHandler(opt, "lineColor", void 0);
    if (lineColor) {
      super.strokeStyle(lineColor);
      this.stroke(true);
    }
    return lineColor;
  }
  backgroundColor(opt) {
    const backgroundColor = this.__valueHandler(
      opt,
      "backgroundColor",
      void 0
    );
    if (backgroundColor) {
      super.fillStyle(backgroundColor);
      this.fill(true);
    }
    return backgroundColor;
  }
  scale(opt) {
    super.scale(opt);
    this.lineWidth(this.lineWidth() * (opt || 1));
  }
};

// src/shapes/RectangleBlock.ts
var RectangleBlock = class extends ShapeBlock {
  constructor(options) {
    super(options);
  }
  draw(_func) {
    const cacheR = this.rotate();
    this.rotate(0);
    this.context?.roundRect(
      this.x(),
      this.y(),
      this.width(),
      this.height(),
      this.borderRadius()
    );
    this.border();
    this.borderBottom();
    this.borderTop();
    this.borderLeft();
    this.borderRight();
    this.rotate(cacheR);
  }
  borderRadius(opt) {
    const radius = this.__valueHandler(opt, "borderRadius", [0, 0, 0, 0]);
    if (typeof radius === "number") {
      return [radius, radius, radius, radius];
    }
    let defRadius = radius;
    switch (radius.length) {
      case 1:
        defRadius = [radius[0], radius[0], radius[0], radius[0]];
        break;
      case 2:
        defRadius = [radius[0], radius[0], radius[1], radius[1]];
        break;
      case 3:
        defRadius = [radius[0], radius[0], radius[1], radius[2]];
        break;
    }
    return defRadius;
  }
  backgroundColor(opt) {
    const bg = this.__valueHandler(opt, "backgroundColor", "black");
    super.fillStyle(bg);
    this.fill(true);
    return bg;
  }
  border(opt) {
    const border = this.__valueHandler(opt, "border", void 0);
    if (border) {
      const { borderStyleArrWidth } = this.#borderParser(border);
      if (this.borderStyle() === "dotted") {
        this.lineDash(borderStyleArrWidth);
      }
      this.stroke(true);
    }
    return border;
  }
  borderWidth(opt) {
    const borderWidth = this.__valueHandler(opt, "borderWidth", void 0);
    super.lineWidth(borderWidth);
    return borderWidth;
  }
  borderColor(opt) {
    const borderColor = this.__valueHandler(opt, "borderColor", void 0);
    super.strokeStyle(borderColor);
    return borderColor;
  }
  borderStyle(opt) {
    return this.__valueHandler(opt, "borderStyle", void 0);
  }
  borderTop(opt) {
    const borderTop = this.__valueHandler(opt, "borderTop", void 0);
    if (borderTop) {
      let { borderStyleArrWidth } = this.#borderParser(borderTop);
      borderStyleArrWidth.pop();
      if (this.borderStyle() === "dotted") {
        this.lineDash([
          ...borderStyleArrWidth,
          this.getRealHeight * 2 + this.getRealWidth
        ]);
      } else {
        this.lineDash([
          this.getRealWidth,
          this.getRealWidth + 2 * this.getRealHeight,
          0,
          0
        ]);
      }
      this.stroke(true);
    }
    return borderTop;
  }
  borderRight(opt) {
    const borderRight = this.__valueHandler(opt, "borderRight", void 0);
    if (borderRight) {
      const { borderStyleArrHeight } = this.#borderParser(borderRight);
      borderStyleArrHeight.pop();
      if (this.borderStyle() === "dotted") {
        this.lineDash([
          0,
          this.getRealWidth,
          ...borderStyleArrHeight,
          this.getRealWidth + this.getRealHeight
        ]);
      } else if (this.borderStyle() === "solid") {
        this.lineDash([
          0,
          this.getRealWidth,
          this.getRealHeight,
          this.getRealWidth + this.getRealHeight
        ]);
      }
      this.stroke(true);
    }
    return borderRight;
  }
  borderBottom(opt) {
    const borderBottom = this.__valueHandler(
      opt,
      "borderBottom",
      void 0
    );
    if (borderBottom) {
      let { borderStyleArrWidth } = this.#borderParser(borderBottom);
      if (this.borderStyle() === "dotted") {
        this.lineDash([
          0,
          this.getRealWidth + this.getRealHeight,
          ...borderStyleArrWidth
        ]);
      } else if (this.borderStyle() === "solid") {
        this.lineDash([
          0,
          this.getRealWidth + this.getRealHeight,
          this.getRealWidth,
          0
        ]);
      }
      this.stroke(true);
    }
    return borderBottom;
  }
  borderLeft(opt) {
    const borderLeft = this.__valueHandler(opt, "borderLeft", void 0);
    if (borderLeft) {
      let { borderStyleArrHeight } = this.#borderParser(borderLeft);
      if (this.borderStyle() === "dotted") {
        this.lineDash([
          0,
          this.getRealWidth * 2 + this.getRealHeight,
          ...borderStyleArrHeight
        ]);
      } else if (this.borderStyle() === "solid") {
        this.lineDash([
          0,
          this.getRealWidth * 2 + this.getRealHeight,
          this.getRealHeight,
          this.getRealWidth
        ]);
      }
      this.stroke(true);
    }
    return borderLeft;
  }
  // border size, style(required), color
  #borderParser(obj) {
    const border = obj?.split(" ") || [];
    const borderWidth = this.__unitConverter({
      val: border[0],
      widthRelated: true
    });
    const borderStyle = border[1];
    const borderColor = border[2];
    const borderStyleArrWidth = [];
    const borderStyleArrHeight = [];
    if (borderStyle === "dotted") {
      let total = 0;
      const step = this.getRealWidth / (this.getRealWidth / 4);
      while (total < this.getRealWidth) {
        borderStyleArrWidth.push(step, step);
        total += step * 2;
      }
      total = 0;
      const stepHeight = this.getRealHeight / (this.getRealHeight / 4);
      while (total < this.getRealHeight) {
        borderStyleArrHeight.push(
          stepHeight,
          stepHeight,
          stepHeight,
          stepHeight
        );
        total += stepHeight * 2;
      }
    }
    if (this.borderWidth() === void 0) this.borderWidth(borderWidth);
    if (this.borderStyle() === void 0) this.borderStyle(borderStyle);
    if (this.borderColor() === void 0) this.borderColor(borderColor);
    return { borderStyleArrWidth, borderStyleArrHeight };
  }
  __clipShape() {
    this.__clipPath?.roundRect(
      this.getLeft.x + this.__leftSpace,
      this.getTop.y + this.__topSpace,
      this.getRealWidth - this.__widthSpaces,
      this.getRealHeight - this.__heightSpaces,
      this.borderRadius()
    );
  }
};

// src/shapes/TextBlock.ts
var TextBlock = class extends ShapeBlock {
  #letterNode = {
    nodeId: 0,
    prev: void 0,
    next: void 0,
    letter: "",
    width: 0,
    wordWidth: 0,
    height: 0,
    x: 0,
    y: 0
  };
  #updateText;
  #stopTraverseSign = 0;
  #editable = false;
  #caretDrawer;
  #highlightDrawer;
  #words;
  constructor(text, options) {
    super(options);
    this.text(text);
    this.#words = [];
  }
  draw(_func) {
    const cacheR = this.rotate();
    this.rotate(0);
    super.font(this.#format_font);
    this.#updateText?.();
    this.#updateText = void 0;
    let words = this.#words;
    if (!this.useCacheText || this.#words.length === 0) {
      console.log("text working again");
      words = this.#wrapText();
    }
    let sumOfHeights = 0;
    if (this.resizeLineHeight())
      sumOfHeights = (this.height() - words.reduce((p, n) => p + n.height - this.y(), 0)) / (words.length - 1);
    let heightP = 0;
    let heights = 0;
    if (this.#editable) this.#highlightDrawer?.();
    for (let i = 0, len = words.length; i < len; i++) {
      if (i !== 0) heightP = sumOfHeights;
      if (this.fill()) {
        super.fillText({
          text: words[i].words,
          x: this.x(),
          y: words[i].height + heightP,
          maxWidth: words[i].width
        });
      }
      if (super.stroke()) {
        super.strokeText({
          text: words[i].words,
          x: this.x(),
          y: words[i].height + heightP,
          maxWidth: words[i].width
        });
      }
      if (i === len - 1) heights = words[i].height - this.y();
    }
    if (!this.resizeLineHeight()) this.height(heights);
    this.rotate(cacheR);
  }
  get useCacheText() {
    if (this.optionHasChanged("x") || this.optionHasChanged("y") || this.optionHasChanged("width") || this.optionHasChanged("height") || this.optionHasChanged("paddingLeft") || this.optionHasChanged("paddingRight") || this.optionHasChanged("paddingBottom") || this.optionHasChanged("paddingTop") || this.optionHasChanged("marginLeft") || this.optionHasChanged("marginRight") || this.optionHasChanged("marginBottom") || this.optionHasChanged("marginTop") || this.optionHasChanged("text") || this.optionHasChanged("rotationCenterX") || this.optionHasChanged("rotationCenterY") || this.optionHasChanged("rotate") || this.optionHasChanged("hidden"))
      return false;
    return true;
  }
  __hotLines() {
    if (!this.#editable) {
      super.__hotLines();
      this.#caretDrawer = void 0;
    } else {
      this.#caretDrawer?.();
    }
  }
  get #format_font() {
    return `${this.fontStyle()} ${this.fontVariant()} ${this.fontWeight()} ${this.fontSize()}px ${this.fontFamily()}`;
  }
  #wrapText() {
    const texts = [];
    let words = "";
    let wrapW = 0;
    let wrapH = 0;
    let heights = [];
    let heightW = 0;
    let wrapX = 0;
    const isWrap = this.wrap() !== "nowrap";
    this.#traverseLetterNodes((node) => {
      wrapW += isWrap ? this.isWrapWord ? node.wordWidth : node.width : 0;
      if (wrapW >= this.width() && this.wrap()) {
        wrapW = this.isWrapWord ? node.wordWidth : node.width;
        wrapX = 0;
        wrapH += Math.max(...heights);
        const wordM2 = super.measureText(words);
        heightW += wordM2?.actualBoundingBoxAscent || 0;
        texts.push({
          words,
          width: wordM2?.width || 0,
          height: this.y() + heightW
        });
        words = "";
        heights = [];
      }
      node.x = this.x() + wrapX;
      node.y = this.y() + wrapH;
      wrapX += node.width;
      words += node.letter;
      heights.push(node.height);
    });
    const wordM = super.measureText(words);
    texts.push({
      words,
      width: wordM?.width || 0,
      height: this.y() + heightW + (wordM?.actualBoundingBoxAscent || 0)
    });
    this.#words = texts;
    return texts;
  }
  editable(opt) {
    const editable = this.__valueHandler(opt, "editable", true);
    if (!editable) return editable;
    const beforeValues = {};
    let foundNode;
    let foundNodeId;
    const dummyLetter = {
      nodeId: void 0,
      prev: void 0,
      next: void 0,
      letter: "",
      width: 0,
      wordWidth: 0,
      height: 0,
      x: 0,
      y: 0
    };
    let dbClick = false;
    this.dblclick(() => {
      if (!this.isEditbale) return;
      this.#editable = true;
      dbClick = true;
      foundNode = void 0;
      foundNodeId = void 0;
      this.#caretDrawer = void 0;
      this.#drawHighlight(
        this.x(),
        this.y(),
        this.width(),
        this.height()
      );
    });
    const mousedown = (event) => {
      if (!this.checkInBound(event)) this.#editable = false;
      if (!this.#editable || this.isEditbale) return;
      this.#highlightDrawer = void 0;
      dbClick = false;
      const initCords = this.canvas?.getCursorPosition(event) || {
        x: 0,
        y: 0
      };
      this.#traverseLetterNodes((node) => {
        if (inRange(initCords.x, node.x, node.x + node.width) && inRange(initCords.y, node.y, node.y + node.height)) {
          if (inRange(initCords.x, node.x, node.x + node.width / 2)) {
            foundNode = node.prev || node;
          } else if (inRange(
            initCords.x,
            node.x + node.width / 2,
            node.x + node.width
          )) {
            foundNode = node;
          }
          this.#stopTraverse(true);
        }
      });
      if (foundNode) {
        foundNodeId = foundNode.nodeId;
        this.#drawCaret(
          foundNode.x + foundNode.width,
          foundNode.y + foundNode.height,
          foundNode.x + foundNode.width,
          foundNode.y
        );
      }
    };
    this.keydown((e) => {
      if (!this.#editable || this.isEditbale) return;
      beforeValues[this.nodeId] = {};
      if (dbClick) {
        foundNode = {
          nodeId: 0,
          prev: void 0,
          next: void 0,
          letter: "",
          width: 0,
          wordWidth: 0,
          height: 0,
          x: 0,
          y: 0
        };
        this.#letterNode = foundNode;
        foundNodeId = 0;
        this.#highlightDrawer = void 0;
        dbClick = false;
      }
      if (!foundNode || foundNodeId === void 0) return;
      if (e.key === "Backspace") {
        if (foundNodeId > 0) {
          this.#removeLetterNode(foundNode);
          foundNodeId -= 1;
        }
      } else if (e.key === "Tab") {
        dummyLetter.letter = "    ";
        this.#addAfter(foundNode, dummyLetter);
        foundNodeId += 4;
      } else {
        dummyLetter.letter = e.key;
        this.#addAfter(foundNode, dummyLetter);
        foundNodeId += 1;
      }
      foundNode = this.#findNode(foundNodeId);
      if (foundNode) {
        this.#drawCaret(
          foundNode.x + foundNode.width,
          foundNode.y + foundNode.height,
          foundNode.x + foundNode.width,
          foundNode.y
        );
      }
      this.onEdit()?.(e);
      dummyLetter.letter = "";
    });
    this.eventHandler("mousedown", mousedown, "editableClick");
    return editable;
  }
  get isEditbale() {
    return this.ownOptions["editable"] ? this.ownOptions["editable"] : false;
  }
  onEdit(opt) {
    const editE = this.__valueHandler(opt, "onEdit", void 0);
    return (event) => {
      editE?.(event);
    };
  }
  text(opt) {
    const cacheT = this.ownOptions.text || "";
    const text = this.__valueHandler(opt, "text", "");
    if (text !== cacheT) {
      this.#updateText = () => {
        const splitedText = text.split("");
        let x = 0;
        let prevNode = this.#letterNode;
        let pendingNode = void 0;
        let wordWidth = 0;
        const measure = super.measureText("");
        this.#letterNode.height = measure?.actualBoundingBoxAscent || 0;
        for (let i = 0, len = splitedText.length; i < len; i++) {
          const measure2 = super.measureText(splitedText[i]);
          const node = {
            nodeId: i + 1,
            prev: prevNode,
            next: void 0,
            letter: splitedText[i],
            width: measure2?.width || 0,
            wordWidth: 0,
            height: measure2?.actualBoundingBoxAscent || 0,
            x,
            y: measure2?.actualBoundingBoxAscent || 0 + this.y()
          };
          prevNode.next = node;
          prevNode = prevNode.next;
          if (!pendingNode) pendingNode = prevNode;
          wordWidth += measure2?.width || 0;
          if (splitedText[i] === " " || i === len - 1) {
            pendingNode.wordWidth = wordWidth;
            pendingNode = void 0;
            wordWidth = 0;
          }
          x += measure2?.width || 0;
        }
      };
    }
    return text;
  }
  #traverseLetterNodes(_func) {
    let next = this.#letterNode;
    this.#stopTraverse(false);
    while (next && this.#stopTraverseSign) {
      _func(next);
      next = next.next;
    }
  }
  #addAfter(targetNode, newNode) {
    let letters = "";
    this.#traverseLetterNodes((node) => {
      if (targetNode.nodeId === node.nodeId) {
        newNode.next = node.next;
        newNode.prev = node;
        node.next = newNode;
      }
      letters += node.letter;
    });
    this.text(letters);
    this.canvas?.invokeChange();
  }
  #addBefore(targetNode, newNode) {
    let prevNode = this.#letterNode;
    this.#traverseLetterNodes((node) => {
      if (targetNode.nodeId === node.nodeId) {
        prevNode.next = newNode;
        newNode.prev = prevNode;
        newNode.next = node;
        this.#stopTraverse(true);
      }
      prevNode = node;
    });
  }
  #findNode(nodeId) {
    let foundNode;
    this.#traverseLetterNodes((node) => {
      if (nodeId === node.nodeId) {
        foundNode = node;
        this.#stopTraverse(true);
      }
    });
    return foundNode;
  }
  #stopTraverse(stop) {
    if (stop) this.#stopTraverseSign = 0;
    else this.#stopTraverseSign = 1;
  }
  #removeLetterNode(targetNode) {
    let prevNode = this.#letterNode;
    let letters = "";
    this.#traverseLetterNodes((node) => {
      if (targetNode.nodeId === node.nodeId) {
        prevNode.next = node.next;
      } else letters += node.letter;
      prevNode = node;
    });
    this.text(letters);
    this.canvas?.invokeChange();
  }
  #drawCaret(x, y, width, height) {
    this.#caretDrawer = () => {
      if (!this.context) return;
      this.context.beginPath();
      this.context.moveTo(x, y);
      this.context.lineTo(width, height);
      this.context.strokeStyle = "red";
      this.context.lineWidth = 2;
      this.context.stroke();
    };
    this.canvas?.invokeChange();
  }
  #drawHighlight(x, y, width, height) {
    if (!this.context) return;
    this.#highlightDrawer = () => {
      if (!this.context) return;
      this.context.beginPath();
      this.context.fillStyle = "rgba(0, 13, 255, 0.47)";
      this.context.fillRect(x, y, width, height);
    };
    this.canvas?.invokeChange();
  }
  get isWrapWord() {
    return this.wrap() === "word";
  }
  fontFamily(opt) {
    return this.__valueHandler(opt, "fontFamily", "sans-serif");
  }
  fontSize(opt) {
    return this.__valueHandler(opt, "fontSize", 0, true);
  }
  fontWeight(opt) {
    return this.__valueHandler(opt, "fontWeight", "normal");
  }
  fontVariant(opt) {
    return this.__valueHandler(opt, "fontVariant", "normal");
  }
  fontStyle(opt) {
    return this.__valueHandler(opt, "fontStyle", "normal");
  }
  color(opt) {
    const color = this.__valueHandler(opt, "color", void 0);
    if (color) {
      super.fillStyle(color);
      super.fill(true);
    }
    return color;
  }
  strokeColor(opt) {
    const strokeColor = this.__valueHandler(opt, "strokeColor", void 0);
    if (strokeColor) {
      super.strokeStyle(strokeColor);
      this.stroke(true);
    }
    return strokeColor;
  }
  strokeWidth(opt) {
    const width = this.__valueHandler(opt, "border", 0);
    super.lineWidth(width);
    return width;
  }
  resizeLineHeight(opt) {
    return this.__valueHandler(opt, "resizeLineHeight", false);
  }
  wrap(opt) {
    return this.__valueHandler(opt, "wrap", "nowrap");
  }
  scale(opt) {
    super.scale(opt);
    this.fontSize(this.fontSize() * (opt || 1));
  }
  generatePayload() {
    const payload = super.generatePayload();
    payload.additionalParams = [this.text()];
    return payload;
  }
};

// src/shapes/VideoBlock.ts
var VideoBlock = class extends ShapeBlock {
  #cacheVideo;
  #events = {
    isPlaying: false,
    isPaused: false
  };
  constructor(source, options) {
    super(options);
    this.source(source);
  }
  draw(_func) {
    if (!this.#cacheVideo) {
      this.#cacheVideo = this.source();
      if (this.#cacheVideo) this.#drawVideo();
    } else {
      this.context?.drawImage(
        this.#cacheVideo,
        0,
        0,
        this.width(),
        this.height(),
        this.x(),
        this.y(),
        this.width(),
        this.height()
      );
    }
  }
  #drawVideo() {
    const videoPlayAnimator = (timestamp) => {
      if (!this.#cacheVideo) return;
      if (this.isPlaying) this.onPlay()(timestamp);
    };
    this.__animationHandler(videoPlayAnimator);
  }
  source(opt) {
    return this.__valueHandler(opt, "source", void 0);
  }
  pause() {
    this.#cacheVideo?.pause();
    this.#events.isPlaying = false;
    this.#events.isPaused = true;
  }
  play() {
    this.#cacheVideo?.play();
    this.#events.isPlaying = true;
    this.#events.isPaused = false;
  }
  get isPlaying() {
    return this.#events.isPlaying;
  }
  get isPaused() {
    return this.#events.isPaused;
  }
  onPlay(func) {
    const onPlay = this.__valueHandler(func, "onPlay", void 0);
    return (timestamp) => {
      if (onPlay) onPlay?.(timestamp);
    };
  }
};

// src/defaultBlocks.ts
var defaultBlocks = [
  Block,
  LayoutBlock,
  ShapeBlock,
  RectangleBlock,
  CircleBlock,
  LineBlock,
  TextBlock,
  ImageBlock,
  VideoBlock
];

// src/Canvas.ts
var Canvas = class {
  canvasId;
  width;
  height;
  options;
  #context;
  #htmlCanvas;
  #boundingClient;
  #domCanvas;
  #tree;
  #canvasEvents;
  #defaultOptions;
  currentCursor;
  #higherBlockZIndex;
  #handledNodes;
  #initTime;
  #isFocused = false;
  #animations;
  #reservedAnimation;
  #registeredBlocks;
  __positionCords;
  constructor(canvasId, width, height, options) {
    this.canvasId = canvasId || "canvas";
    this.options = options;
    this.width = width || 300;
    this.height = height || 300;
    this.currentCursor = "auto";
    this.#higherBlockZIndex = 0;
    this.#handledNodes = {};
    this.#canvasEvents = {};
    this.#defaultOptions = {
      history: true,
      historySize: 100,
      zoom: "center",
      zoomSpeed: 1.2,
      zoomInvSpeed: 0.8,
      moveSpeed: 10,
      keyboardMovement: true,
      mouseMovement: true,
      x: 0,
      y: 0,
      z: 1,
      fps: 60,
      composite: "source-over",
      alpha: 1
    };
    this.#animations = {};
    this.__positionCords = { x: 0, y: 0, z: 1 };
    if (this.options) this.setOptions();
    this.#tree = new CanvasTree(this.#defaultOptions.historySize);
    this.#domCanvas = new CanvasDOMManager(
      this.canvasId,
      this.width,
      this.height
    );
    this.#initTime = (/* @__PURE__ */ new Date()).getTime();
    this.#registeredBlocks = defaultBlocks;
    this.#initCanvas();
  }
  get context() {
    if (!this.#context) this.#context = this.#domCanvas.context;
    return this.#context;
  }
  get canvas() {
    if (!this.#htmlCanvas) this.#htmlCanvas = this.#domCanvas.canvas;
    return this.#htmlCanvas;
  }
  setOptions() {
    if (this.options?.history)
      this.#defaultOptions.history = this.options.history;
    if (this.options?.zoom) this.#defaultOptions.zoom = this.options.zoom;
    if (this.options?.zoomSpeed)
      this.#defaultOptions.zoomSpeed = this.options.zoomSpeed;
    if (this.options?.zoomInvSpeed)
      this.#defaultOptions.zoomInvSpeed = this.options.zoomInvSpeed;
    if (this.options?.moveSpeed)
      this.#defaultOptions.moveSpeed = this.options.moveSpeed;
    if (this.options?.keyboardMovement)
      this.#defaultOptions.keyboardMovement = this.options.keyboardMovement;
    if (this.options?.mouseMovement)
      this.#defaultOptions.mouseMovement = this.options.mouseMovement;
    if (this.options?.x) this.#defaultOptions.x = this.options.x;
    if (this.options?.y) this.#defaultOptions.y = this.options.y;
    if (this.options?.z) this.#defaultOptions.z = this.options.z;
    if (this.options?.fps) this.#defaultOptions.fps = this.options.fps;
    if (this.options?.historySize)
      this.#defaultOptions.historySize = this.options.historySize;
    this.__positionCords = {
      x: this.#defaultOptions.x,
      y: this.#defaultOptions.y,
      z: this.#defaultOptions.z
    };
  }
  #initCanvas() {
    this.canvas;
    this.context.save();
    window.onload = () => {
      if (this.options) {
        this.context.globalCompositeOperation = this.options.composite || this.#defaultOptions.composite;
        this.context.globalAlpha = this.options.alpha || this.#defaultOptions.alpha;
        let styleOptions = {};
        for (let [key, value] of Object.entries(this.options)) {
          if (!Object.hasOwn(this.#defaultOptions, key))
            styleOptions[key] = value;
        }
        this.#domCanvas.changeStyle(this.options);
      }
      if (this.#defaultOptions.history) this.#snapshotHandler();
      if (this.#defaultOptions.mouseMovement) this.#handMove();
      if (this.#defaultOptions.keyboardMovement) this.#keyboardMove();
      if (this.#defaultOptions.zoom == "point") this.#pointZoom();
      else if (this.#defaultOptions.zoom == "center") this.#centerZoom();
      this.canvas.addEventListener("focusin", () => {
        this.#isFocused = true;
      });
      this.canvas.addEventListener("focusout", () => {
        this.#isFocused = false;
      });
      this.#setCanvasPosition();
      this.#setCanvasZoom();
    };
  }
  add(...block) {
    this.#tree.addNodes(block);
    this.#initTime = (/* @__PURE__ */ new Date()).getTime();
    this.#tree.preOrderTraversal((b) => {
      if (!this.#handledNodes[b.nodeId]) {
        this.__handleOptions(b);
        this.__collectEvents(b);
        this.__collectAnimations(b);
        this.__takeInitSnaphshot(b);
        b.__initCordinates();
        b.__hidden = !this.inBoundElement(b);
        b.render();
      }
    });
    this.#registerDomEvent();
  }
  remove(block) {
    this.#tree.head.removeChild(block);
    this.__clearEvents(block);
    this.__clearAnimations(block);
    this.invokeNodeListing();
  }
  export() {
    const payload = {
      canvas: {
        canvasId: this.canvasId,
        width: this.width,
        height: this.height,
        options: this.options
      },
      blocks: []
    };
    this.#tree.head.listOnlyChilds((block) => {
      payload.blocks.push(block.generatePayload());
    });
    return JSON.stringify(payload);
  }
  load(payload) {
    const parsedPayload = JSON.parse(payload);
    const canvasOpt = parsedPayload.canvas;
    this.canvasId = canvasOpt.canvasId;
    this.options = canvasOpt.options;
    this.width = canvasOpt.width;
    this.height = canvasOpt.height;
    if (this.options) this.setOptions();
    this.#initCanvas();
    const blocks = parsedPayload.blocks;
    const constructedBlocks = [];
    const checkBlock = (block) => {
      const exists = this.find({ nodeId: block.nodeId });
      const childs = [];
      let foundBlock;
      if (exists && exists[0]) {
        foundBlock = exists[0];
      } else {
        const found = this.#registeredBlocks.filter(
          (b) => b.name === block.name
        );
        let invokeClass = found[0];
        if (invokeClass)
          if (block.additionalParams.length !== 0)
            foundBlock = new invokeClass(
              ...block.additionalParams,
              block.options || {}
            );
          else {
            foundBlock = new invokeClass(block.options || {});
          }
      }
      foundBlock.ownOptions = block.ownOptions || block.options;
      if (block.childs?.length !== 0)
        for (let i = 0, len = block.childs.length; i < len; i++) {
          const childBlock = checkBlock(block.childs[i]);
          if (childBlock) childs.push(childBlock);
        }
      foundBlock.addChild(...childs);
      return foundBlock;
    };
    for (let i = 0, len = blocks.length; i < len; i++) {
      const b = checkBlock(blocks[i]);
      if (b) constructedBlocks.push(b);
    }
    this.add(...constructedBlocks);
  }
  registerBlocks(...blocks) {
    this.#registeredBlocks.push(blocks);
  }
  find(queries) {
    let blocks = [];
    this.#tree.head.listAllChilds((block) => {
      for (const [k, v] of Object.entries(queries)) {
        if (block.ownOptions[k] === v || k === "nodeId" && block.nodeId === v)
          blocks.push(block);
      }
    });
    return blocks;
  }
  get canvasBounding() {
    if (!this.#boundingClient)
      this.#boundingClient = this.canvas.getBoundingClientRect();
    return this.#boundingClient;
  }
  get isFocused() {
    return this.#isFocused;
  }
  getCursorPosition(event) {
    return {
      x: event.pageX - this.canvasBounding.left,
      y: event.pageY - this.canvasBounding.top
    };
  }
  whoIsTheFirst(zIndex) {
    return this.#higherBlockZIndex === zIndex;
  }
  registerZIndex(inOutZ) {
    let inBlock = inOutZ["in"];
    let outBlock = inOutZ["out"];
    if (inBlock && inBlock > this.#higherBlockZIndex) {
      this.#higherBlockZIndex = inBlock;
    } else if (outBlock && outBlock === this.#higherBlockZIndex) {
      this.#higherBlockZIndex = 0;
    }
  }
  __handleOptions(block) {
    if (!block.ownOptions || this.#handledNodes[block.nodeId]) return;
    block.canvas = this;
    this.#handleBindOptions(block);
    for (const [key, value] of Object.entries(block.ownOptions)) {
      getPrototype(block, key)?.value.call(block, value);
    }
    if (block.zIndex() === void 0) {
      block.ownOptions.zIndex = block.nodeId;
    }
    this.#handledNodes[block.nodeId] = true;
  }
  #handleBindOptions(block) {
    if (block.__bindOptions.length !== 0) {
      for (const opt of block.__bindOptions) {
        for (const key of opt.options) {
          getPrototype(block, key)?.value.call(
            block,
            opt.bindTo.ownOptions[key]
          );
        }
      }
    }
  }
  __takeInitSnaphshot(block) {
    const dummy = {};
    dummy[block.nodeId] = { ...block.ownOptions };
    this.#tree.takeSanpshot(this.#initTime, null, dummy);
  }
  __takeBlockSnapshot(parentBlock, before) {
    const after = {};
    after[parentBlock.nodeId] = {
      childNodes: [...parentBlock.childNodes]
    };
    this.#tree.takeSanpshot(this.#initTime, before, after);
  }
  __collectAnimations(block) {
    for (const func of block.__animations) {
      this.registerAnimation(String(block.nodeId), func);
    }
  }
  __clearAnimations(block) {
    this.removeAnimation(String(block.nodeId));
  }
  registerAnimation(nodeId, func) {
    if (!this.#animations[nodeId])
      this.#animations[nodeId] = { animations: [] };
    this.#animations[nodeId].animations.push(func);
    this.#buildAnimatonFunc(nodeId, this.#animations[nodeId].animations);
    this.#handleAnimation();
  }
  #buildAnimatonFunc(nodeId, animations) {
    this.#animations[nodeId].func = (timestamp) => {
      for (const func of animations) func(timestamp);
    };
  }
  removeAnimation(nodeId) {
    delete this.#animations[nodeId];
    this.#handleAnimation();
  }
  __collectEvents(block) {
    for (const key in block.__events) {
      for (const event of block.__events[key]["funcs"])
        this.registerEvent(key, event);
    }
  }
  __clearEvents(block) {
    for (const key in block.__events) {
      for (const event of block.__events[key]["funcs"])
        this.removeEvent(key, event);
    }
  }
  registerEvent(event, callFunc) {
    if (!this.#canvasEvents[event])
      this.#canvasEvents[event] = { func: void 0, events: [] };
    if (this.#canvasEvents[event].events.includes(callFunc) || typeof callFunc !== "function")
      return;
    this.#canvasEvents[event].events.push(callFunc);
    const events = this.#canvasEvents[event].events;
    this.#buildEventFunc(event, events);
  }
  removeEvent(event, callFunc) {
    if (this.#canvasEvents[event] && !this.#canvasEvents[event].events.includes(callFunc) || typeof callFunc !== "function")
      return;
    this.#canvasEvents[event].events = this.#canvasEvents[event].events.filter((i) => i !== callFunc);
    const events = this.#canvasEvents[event].events;
    this.#buildEventFunc(event, events);
  }
  #buildEventFunc(event, events) {
    this.#canvasEvents[event].func = (e) => {
      for (const func of events) func(e);
    };
  }
  #registerDomEvent() {
    for (const key in this.#canvasEvents) {
      const func = this.#canvasEvents[key].func;
      if (func !== void 0) {
        const eventFunc = this.#domCanvas.getListener(key);
        if (eventFunc && !eventFunc.includes(func)) {
          for (let i = 0, len = eventFunc.length; i < len; i++) {
            this.#domCanvas.removeEventListener(key, eventFunc[i]);
          }
        }
        this.#domCanvas.addEventListener(key, func);
        this.#canvasEvents[key].func = void 0;
      }
    }
  }
  invokeChange(_func) {
    this.context.restore();
    this.context.save();
    this.clearRect();
    this.#registerDomEvent();
    this.#tree.head.listOnlyChilds(
      (b) => {
        if (this.#handledNodes[b.nodeId]) {
          this.#handleBindOptions(b);
          if (_func) _func(b);
          b.__hidden = !this.inBoundElement(b);
          b.render();
        }
      },
      "zIndex",
      this.#tree.nodes
    );
  }
  invokeNodeListing() {
    this.#initTime = (/* @__PURE__ */ new Date()).getTime();
    this.#tree.preOrderTraversal();
  }
  refreshHead() {
    this.#tree.head.resetSort();
  }
  takeSnapshot(before, after) {
    if (this.#defaultOptions.history)
      this.#tree.takeSanpshot((/* @__PURE__ */ new Date()).getTime(), before, after);
  }
  inBoundElement(element) {
    const x = xIntersect(
      { left: 0, right: this.canvasBounding.width },
      {
        left: Math.min(
          element.ownOptions.cornerTopLeft?.x || 0,
          element.ownOptions.cornerTopRight?.x || 0,
          element.ownOptions.cornerBottomLeft?.x || 0,
          element.ownOptions.cornerBottomRight?.x || 0
        ),
        right: Math.max(
          element.ownOptions.cornerTopLeft?.x || 0,
          element.ownOptions.cornerTopRight?.x || 0,
          element.ownOptions.cornerBottomLeft?.x || 0,
          element.ownOptions.cornerBottomRight?.x || 0
        )
      }
    );
    const y = yIntersect(
      { top: 0, bottom: this.canvasBounding.height },
      {
        top: Math.min(
          element.ownOptions.cornerTopLeft?.y || 0,
          element.ownOptions.cornerTopRight?.y || 0,
          element.ownOptions.cornerBottomLeft?.y || 0,
          element.ownOptions.cornerBottomRight?.y || 0
        ),
        bottom: Math.max(
          element.ownOptions.cornerTopLeft?.y || 0,
          element.ownOptions.cornerTopRight?.y || 0,
          element.ownOptions.cornerBottomLeft?.y || 0,
          element.ownOptions.cornerBottomRight?.y || 0
        )
      }
    );
    if (x * y <= 0) return false;
    return true;
  }
  #handleAnimation() {
    if (Object.entries(this.#animations).length !== 0 && this.#reservedAnimation === void 0)
      this.animationInvoker();
    else if (Object.entries(this.#animations).length === 0 && this.#reservedAnimation !== void 0) {
      cancelAnimationFrame(this.#reservedAnimation);
    }
  }
  animationInvoker() {
    let lastFrame = 0;
    const framer = (timestamp) => {
      const obj = Object.entries(this.#animations);
      if (obj.length === 0) return;
      requestAnimationFrame(framer);
      const delta = timestamp - lastFrame;
      if (lastFrame && delta < this.#defaultOptions.fps / 1e3) return;
      for (let [nodeId, anime] of obj) {
        anime.func?.(timestamp);
      }
      const execTime = delta % this.#defaultOptions.fps;
      lastFrame = timestamp - execTime;
      this.invokeChange();
    };
    this.#reservedAnimation = requestAnimationFrame(framer);
  }
  #pointZoom() {
    window.addEventListener(
      "wheel",
      (event) => {
        if (this.#defaultOptions.zoom !== "point" || !this.#isFocused)
          return;
        if (event.ctrlKey) {
          event.preventDefault();
          const { x, y } = this.getCursorPosition(event);
          let scale = this.#defaultOptions.zoomSpeed;
          let invScale = this.#defaultOptions.zoomInvSpeed;
          let beforeX = this.__positionCords.x;
          let beforeY = this.__positionCords.y;
          if (event.deltaY < 0) {
            const scaleFactor = this.__positionCords.z * scale / this.__positionCords.z;
            this.__positionCords.x += (x - beforeX) * scaleFactor;
            this.__positionCords.y -= (y - beforeY) * scaleFactor;
            this.invokeChange((block) => {
              block.__translate({
                x: this.__positionCords.x - beforeX,
                y: 0
              });
              block.scale(scale);
            });
            this.__positionCords.z *= scale;
          } else {
            const scaleFactor = this.__positionCords.z * invScale / (this.__positionCords.z - 1);
            this.__positionCords.x -= (x - beforeX) * scaleFactor;
            this.__positionCords.y -= (y - beforeY) * scaleFactor;
            this.invokeChange((block) => {
              block.__translate({
                x: this.__positionCords.x - beforeX,
                y: this.__positionCords.y - beforeY
              });
              block.scale(invScale);
            });
            this.__positionCords.z *= invScale;
          }
        }
      },
      { passive: false }
    );
  }
  #centerZoom() {
    window.addEventListener(
      "wheel",
      (event) => {
        if (this.#defaultOptions.zoom !== "center" || !this.#isFocused)
          return;
        event.preventDefault();
        if (event.ctrlKey) {
          let scale = this.#defaultOptions.zoomSpeed;
          let invScale = this.#defaultOptions.zoomInvSpeed;
          let beforeX = this.__positionCords.x;
          let beforeY = this.__positionCords.y;
          const x = this.canvasBounding.right / 2;
          const y = this.canvasBounding.bottom / 2;
          this.invokeChange((block) => {
            if (event.deltaY < 0) {
              this.__positionCords.x += (x - beforeX) * (this.__positionCords.z * scale / this.__positionCords.z - 1);
              console.log(this.__positionCords.x);
              block.__translate({
                x: beforeX - this.__positionCords.x,
                y: 0
              });
              block.scale(scale);
              this.__positionCords.z *= scale;
            } else {
              this.__positionCords.x += x / (this.__positionCords.z * invScale) - x / this.__positionCords.z;
              this.__positionCords.y += y / (this.__positionCords.z * invScale) - y / this.__positionCords.z;
              block.__translate({
                x: this.__positionCords.x - beforeX,
                y: this.__positionCords.y - beforeY
              });
              block.scale(invScale);
              this.__positionCords.z *= invScale;
            }
          });
        }
      },
      { passive: false }
    );
  }
  clearRect() {
    this.context.clearRect(
      0,
      0,
      this.canvasBounding.width,
      this.canvasBounding.height
    );
  }
  changeCursor(cur) {
    cur = cur || "auto";
    this.currentCursor = cur;
    return this.#domCanvas.changeStyle({
      cursor: cur
    });
  }
  #handMove() {
    let initX = 0;
    let initY = 0;
    let beforeX = 0;
    let beforeY = 0;
    let isMouseDown = false;
    let isKeyDown = false;
    window.addEventListener("keydown", (event) => {
      if (!this.#defaultOptions.mouseMovement) return;
      if (event.code == "Space") {
        if (!isKeyDown) {
          this.#domCanvas.changeStyle({ cursor: "grab" });
          isKeyDown = true;
        }
      }
    });
    window.addEventListener(
      "mousemove",
      (event) => {
        if (!this.#defaultOptions.mouseMovement || !this.#isFocused)
          return;
        event.preventDefault();
        if (event.buttons == 0) {
          isMouseDown = false;
          if (isKeyDown)
            this.#domCanvas.changeStyle({
              cursor: "grab"
            });
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
            this.#domCanvas.changeStyle({
              cursor: "grabbing"
            });
            let diffX = event.clientX - initX;
            let diffY = event.clientY - initY;
            if (diffX !== 0) {
              this.invokeChange((block) => {
                block.__translate({ x: diffX - beforeX, y: 0 });
              });
              this.__positionCords.x += diffX;
              beforeX = diffX;
            }
            if (diffY !== 0) {
              this.invokeChange((block) => {
                block.__translate({ x: 0, y: diffY - beforeY });
              });
              this.__positionCords.y += diffY;
              beforeY = diffY;
            }
          }
        }
      },
      { passive: false }
    );
    window.addEventListener("keyup", (event) => {
      if (!this.#defaultOptions.mouseMovement) return;
      this.#domCanvas.changeStyle({ cursor: "auto" });
      isKeyDown = false;
    });
  }
  #setCanvasPosition() {
    this.invokeChange((block) => {
      block.__translate({
        x: block.x() + this.__positionCords.x,
        y: block.y() + this.__positionCords.y
      });
    });
  }
  #setCanvasZoom() {
    this.invokeChange((block) => {
      block.scale(this.#defaultOptions.z);
    });
  }
  #keyboardMove() {
    const moveSpeed = this.#defaultOptions.moveSpeed;
    window.addEventListener(
      "wheel",
      (event) => {
        if (!this.#defaultOptions.keyboardMovement || !this.#isFocused)
          return;
        if (event.ctrlKey) return;
        event.preventDefault();
        let inBound = false;
        if (event.shiftKey) {
          if (event.deltaY < 0) {
            this.invokeChange((block) => {
              if (block.checkInBound(event) && block.isOverflowXScroll) {
                block.__overflowTranslate({
                  x: -moveSpeed,
                  y: 0
                });
                inBound = true;
              } else block.__translate({ x: -moveSpeed, y: 0 });
            });
            if (!inBound) this.__positionCords.x -= moveSpeed;
          } else {
            this.invokeChange((block) => {
              if (block.checkInBound(event) && block.isOverflowXScroll) {
                block.__overflowTranslate({
                  x: moveSpeed,
                  y: 0
                });
                inBound = true;
              } else block.__translate({ x: moveSpeed, y: 0 });
            });
            if (!inBound) this.__positionCords.x += moveSpeed;
          }
        } else {
          if (event.deltaY < 0) {
            this.invokeChange((block) => {
              if (block.checkInBound(event) && block.isOverflowYScroll) {
                block.__overflowTranslate({
                  x: 0,
                  y: moveSpeed
                });
                inBound = true;
              } else block.__translate({ x: 0, y: moveSpeed });
            });
            if (!inBound) this.__positionCords.y += moveSpeed;
          } else {
            this.invokeChange((block) => {
              if (block.checkInBound(event) && block.isOverflowYScroll) {
                block.__overflowTranslate({
                  x: 0,
                  y: -moveSpeed
                });
                inBound = true;
              } else block.__translate({ x: 0, y: -moveSpeed });
            });
            if (!inBound) this.__positionCords.y -= moveSpeed;
          }
        }
      },
      { passive: false }
    );
  }
  undo() {
    const obj = this.#tree.snapshotInBack();
    console.log(obj);
    this.#invokeHistory(obj);
  }
  redo() {
    const obj = this.#tree.snapshotInFuture();
    this.#invokeHistory(obj);
  }
  #invokeHistory(obj) {
    this.invokeChange((b) => {
      if (Object.keys(obj).includes(String(b.nodeId))) {
        for (let [key, value] of Object.entries(obj[b.nodeId])) {
          if (key === "childNodes") {
            if (b.childNodes.length !== value.length) {
              if (value.length > b.childNodes.length) {
                for (let i = 0; i < value.length; i++) {
                  if (!value.includes(
                    b.childNodes[i]
                  )) {
                    b.__addChildInternal(value[i]);
                    this.#tree.assignNodeId(
                      value[i]
                    );
                    this.__handleOptions(value[i]);
                  }
                }
              } else {
                for (let i = 0; i < b.childNodes.length; i++) {
                  if (!b.childNodes.includes(value[i])) {
                    b.childNodes[i].nodeId = void 0;
                    b.__removeChildInternal(
                      b.childNodes[i]
                    );
                  }
                }
              }
              this.invokeNodeListing();
              this.invokeChange();
              return;
            }
          } else getPrototype(b, key)?.value.call(b, value);
        }
      }
    });
    this.invokeChange();
  }
  #snapshotHandler() {
    window.addEventListener("keydown", (e) => {
      if (!this.#defaultOptions.history || !this.#isFocused) return;
      if (e.key === "Z" && e.ctrlKey) this.redo();
      else if (e.key === "z" && e.ctrlKey) this.undo();
    });
  }
};
export {
  Block,
  Canvas,
  CircleBlock,
  ImageBlock,
  LayoutBlock,
  LineBlock,
  RectangleBlock,
  ShapeBlock,
  TextBlock,
  VideoBlock,
  bezierEasing,
  cubicBezier
};
//# sourceMappingURL=index.js.map