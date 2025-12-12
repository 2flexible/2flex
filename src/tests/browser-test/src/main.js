import {
    Canvas,
    TextBlock,
    Block,
    Rectangle,
    Circle,
    Line,
    Layout,
    ImageBlock,
} from "./2flex/2flex";

const canvas = new Canvas("canvas", 800, 400, {
    "background-color": "black",
    // move: "mouse",
    // zoom: "point",
});

const text_a = new TextBlock("First Text", {
    x: 0,
    y: 0,
    fontFamily: "KulminoituvaRegular",
    color: "blue",
    borderWidth: 2,
    borderColor: "white",
    fontSize: "40px",
    selectable: true,
});

const text_b = new TextBlock("SecondText", {
    x: 0,
    y: 0,
    color: "yellow",
    fontSize: "50px",
    // strokeWidth: 0,
    // stroke: true,
    // clip: true,

    // borderWidth: 2,
    // fontFamily: "KulminoituvaRegular",
    // fontSize: 35,
});
const block = new Block();

// text_a.click((e) => {
//     text_a.set({ color: "red" });
//     console.log("second clicked");
//     text_a.set({ fontSize: 40 });
// });

// const layer = new Layer({ x: 20 });
// layer.add(text_a, text_b);
const rect = new Rectangle({
    x: 200,
    y: 0,
    width: 200,
    height: 200,
    borderWidth: 10,
    // borderRadius: [0, 20, 20, 0],
    backgroundColor: "white",
    // borderColor: "red",
    // border: "15 dotted red",
    borderRight: "12 dotted blue",
    borderBottom: "12 dotted orange",
    // borderLeft: "32 dotted blue",

    // stroke: true,
    fill: true,
    // clip: true,
});

const rect1 = new Rectangle({
    x: 0,
    y: 0,
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: [0, 20, 20, 0],
    backgroundColor: "yellow",
    stroke: true,
    borderColor: "red",
    fill: true,
});

// rect.add(circle);

const line1 = new Line({
    x: 0,
    y: 0,
    strokeStyle: "white",
    strokeWidth: 10,
    endX: 60,
    endY: 80,
    stroke: true,
});
const line2 = new Line({
    x: 10,
    y: 80,
    cpx1: 90,
    cpy1: 80,
    cpx2: 50,
    cpy2: 120,
    strokeWidth: 10,
    strokeStyle: "red",
    stroke: true,
    endX: 400,
    endY: 200,
});
const line3 = new Line({
    x: 90,
    y: 90,
    strokeStyle: "white",
    stroke: true,
    endX: 90,
    endY: 90,
});
const line4 = new Line({
    x: 20,
    y: 40,

    stroke: true,
    strokeWidth: 10,
    endX: 40,
    endY: 50,
});
const points = [
    { endX: 0, endY: 60 },
    { endX: 40, endY: 40 },
    { cpx1: 90, cpy1: 89, endX: 90, endY: 40 },
    { cpx1: 140, cpy1: 160, cpx2: 100, cpy2: 50, endX: 0, endY: 0 },
];
const linesOfPoint = new Line({
    x: 20,
    y: 80,
    strokeStyle: "white",
    stroke: true,
    strokeWidth: 10,
    points: points,
});

const block1 = new Rectangle({
    width: 100,
    height: 100,
    backgroundColor: "blue",
    fill: true,
    x: 300,
    y: 150,
    // flexBasis: 100,
    flexShrink: 1,
    // rotate: 90,
    // hidden: true,
    // flexGrow: 1,
    // border: "5 dotted red",
    // borderRight: "6 solid red",
    // margin: [0],
    gridColumnStart: 2,
    draggable: true,
    // rotatable: true,
    resizable: true,
    // borderRadius: [10, 100]
    // order: 4,
});

const block2 = new Rectangle({
    x: 10,
    y: 0,
    width: 40,
    height: 40,
    backgroundColor: "red",
    fill: true,
    // selectable: true,
    // draggable: true,
    // flexShrink: 2,
    // flexGrow: 5,
    // order:4,
});
const block3 = new Rectangle({
    width: 40,
    height: 100,
    backgroundColor: "yellow",
    fill: true,
    // flexGrow: 4,
    // flexShrink: 9,
    // order: 0,
});
const block4 = new Rectangle({
    width: 120,
    height: 40,
    backgroundColor: "orange",
    // flexShrink: 5,
    fill: true,
});
const block5 = new Rectangle({
    width: 100,
    height: 30,
    backgroundColor: "blue",
    fill: true,
    stroke: true,
    // flexGrow: 3,
});
const block6 = new Rectangle({
    width: 60,
    height: 80,
    backgroundColor: "orange",
    fill: true,
    // stroke: true,
    // borderWidth: 3,
    // borderColor: "red"
    // flexGrow: 1,
});
const block7 = new Rectangle({
    width: 90,
    height: 80,
    backgroundColor: "blue",
    fill: true,
    stroke: true,
});
const mainBlock = new Rectangle({
    width: 400,
    height: 300,
    border: "2 solid red",
    stroke: true,
    draggable: true,
    selectable: true,
});

const random_blocks = [];

const layoutWidth = 400;
const layoutHeight = 400;

function createRandomBlocks() {
    const colors = ["blue", "red", "green", "yellow", "brown"];
    const say_hello = ["bonswa", "merhaba", "hello", "holla", "salam"];

    for (let i = 0; i < colors.length; i++) {
        const width = Math.floor(Math.random() * 400);
        const height = Math.floor(Math.random() * 200);

        const color = colors[Math.floor(Math.random() * colors.length)];
        const hello = say_hello[Math.floor(Math.random() * say_hello.length)];

        const text = new TextBlock(hello, {
            color: "white",
            fontSize: "32px",
            selectable: false,
        });
        const block = new Rectangle({
            width: width,
            height: height,
            backgroundColor: color,
            borderWidth: "black",
            fill: true,
            stroke: true,
        });
        block.add(text);
        random_blocks.push(block);
    }
}
createRandomBlocks();
block1.add(block2);
let isRed = true;

block2.bind(block1, ["backgroundColor"]);
// block1.mouseover((event) => {
//     const color = isRed ? "red" : "blue";
//     block1.set({ backgroundColor: color });
//     // isRed = !isRed;
// });
const layout = new Layout({
    layout: "flex",
    // flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    // alignContent: "space-around",
    // alignItems: "end",
    width: 400,
    height: 300,
    // resizable: true,
    // draggable: true,

    // gapRow: 120,
    // gapColumn: 20,
});

const gridLayout = new Layout({
    layout: "grid",
    gridTemplateColumns: ["auto", "auto", 100],
    // gridTemplateRows: ["auto", "auto"],
    width: 400,
    // justifyItems: "center",
    // alignContent: "space-evenly",
    // alignItems: "center",
    // justifyContent: "end",
    height: 300,
    gapRow: 0,
    gapColumn: 0,
});

const text1 = new TextBlock("text1", {
    color: "white",
    fontSize: "32px",
    selectable: false,
});
const text2 = new TextBlock("text2", {
    color: "yellow",
    fontSize: "32px",
    selectable: false,
});

// layout.add(block3, block1, block4, block5, block6);
// mainBlock.add(layout);
// line1.join(line2);
// line2.join(line3)
// line3.join(line4)

// text_b.set({ selectable: true });
// rect.set({ color: "red" });
// rect.mousemove((e) => {
//     // console.log(e.clientX, rect.initX, rect.options.width);
//     // console.log(e.clientY, rect.initY, rect.options.height);
//     // text_b.set({ fontSize: 20 });
//     // text_a.set({ fontSize: 40 });
// });
// text_b.mouseleave((e) => {
// console.log("mouseleave");
// text_b.set({ fontSize: 20 });
// text_a.set({ fontSize: 40 });
// });
const circle = new Circle({
    color: "red",
    borderColor: "red",
    borderWidth: 5,
    stroke: true,
    fill: true,
    // radius: 40,
    x: 300,
    y: 300,
    resizable: true,
    draggable: true,
    width: 40,
    height: 10,
    backgroundColor: "blue",
});
// block1.hotCornerTopLeft((ctx) => {
//     ctx.beginPath()
//     ctx.roundRect(
//         block1.hotAreas["hotCornerTopLeft"]["x"]-20,
//         block1.hotAreas["hotCornerTopLeft"]["y"],
//         22,
//         22,
//         [0]
//     );
//     ctx.fillStyle = "red"
//     ctx.fill()
// });

const img_blck = new ImageBlock(
    "https://i.pinimg.com/474x/18/4b/8f/184b8f2c10e30326f6ee92b3652408ac.jpg",
    { x: 100, y: 100, width: 700, height: 200, repeat: "repeat" }
);
block1.animate([{ x: [0, 100], duration: 2000 }]);
canvas.add(block1, block2);

// 1. Timeline, Document (Current TimeLine), Scrool (x, y scrool)(Canvas Movement), ViewPort (Canvas Boundires, Cavnas zoom)
// Current Timeline (currentTime: 1311.064, duration: null)
// 2. KeyFrame - [{ x: 8, y: 12, ease: "ease-in", duration: 1000, iterations: Infinity}]
// {{ x: [8, 2], y: [12, 2]}, {ease: "ease-in", duration: 1000, iterations: Infinity}}

const ctx = canvas.context;

function draw(x, y, opacity) {
    ctx.fillStyle = "red";
    ctx.filter = `opacity(${opacity}%)`;
    ctx.fillRect(x, y, 80, 80);
}
let t = 0;
let iterX = 0;
let direction = 1;
let x1 = 0.1;
let y1 = 0.9;
let x2 = 0.9;
let y2 = 0.1;
let lastBounch = 0;
let opacity = 0;
let lastTime = 0;
let mm = 60;
const fps = 60;
const endX = 200;
const frameInterval = 1000 / fps;
let lastDist = 0;

let increment = 1 / (5 * 60);
let currentTime = 0;
const duration = 25;
function frame(timestamp) {
    canvas.clearRect(0, 0, canvas.width, canvas.height);

    const A = { x: 0, y: 0 };
    const B = { x: 0.68, y: -0.6 };
    const C = { x: 0.32, y: 1.6 };
    const D = { x: 1, y: 1 };
    // const { x, y } = lerp(A, B, t);
    // const { x, y } = quadricCurve(A, B, C, t);

    // if (tt !== lastTime) {
    //     lastTime = timestamp;
    //     mm *= 60;
    // }
    // console.log(tt)
    requestAnimationFrame(frame);
    let diffT = 0;
    diffT = (timestamp - lastTime) / 10000;
    lastTime = timestamp;
    if (!diffT) return;
    const tt = Math.floor(timestamp / 1000);
    const y = cubicBezier(1, 0.47, 0, 0.64, currentTime, 1 / (60 * duration));
    console.log(endX * y);
    currentTime += 1 / (60 * duration);

    // const { x, y } = cubicBezire(0.1, 0.9, 0.9, 0.1, currentTime);
    // console.log(y);
    iterX += direction * y * endX;
    if (iterX < 0 && direction < 0) {
        direction *= -1;
        t = 0;
        currentTime = 0;
    }
    if (iterX >= 300 && direction > 0) {
        direction *= -1;
        t = 0;
        currentTime = 0;
    }
    opacity = 100;
    draw(iterX, 0, opacity);

    let deltatT = timestamp - (lastTime || 0);
    // if (lastTime && deltatT < 33) return;
    // console.log(deltatT)

    // console.log(Math.floor(timestamp / 1000), aid);
    // lastTime = timestamp;

    if (y == 4) {
        // cancelAnimationFrame(100);
        // canvas.canvas.updatePlaybackRate(y)
    } else {
        // requestAnimationFrame(frame);
    }
}
// frame();
function lerp(A, B, t) {
    // b(t) = (1 − t)b0 + tb1
    // these alghorithms can be simplified
    const x = (1 - t) * A.x + t * B.x;
    const y = (1 - t) * A.y + t * B.y;
    return { x, y };
}

function quadricCurve(A, B, C, t) {
    const x =
        Math.pow(1 - t, 2) * A.x + 2 * t * B.x * (1 - t) + Math.pow(t, 2) * C.x;
    const y =
        Math.pow(1 - t, 2) * A.y + 2 * t * B.y * (1 - t) + Math.pow(t, 2) * C.y;
    return { x, y };
}
function cubicBezire2(x1, y1, x2, y2, t) {
    const A = { x: 0, y: 0 };
    const D = { x: 1, y: 1 };
    const x =
        Math.pow(1 - t, 3) * A.x +
        3 * t * x1 * Math.pow(1 - t, 2) +
        3 * x2 * Math.pow(1 - t, 2) +
        Math.pow(t, 3) * D.x;
    const y =
        Math.pow(1 - x, 3) * A.y +
        3 * x * y1 * Math.pow(1 - x, 2) +
        3 * y2 * Math.pow(1 - x, 2) +
        Math.pow(x, 3) * D.y;
    return { x, y };
}
// block1.animate([])
function cubicBezier(p1x, p1y, p2x, p2y, t, duration) {
    const cx = 3 * p1x,
        bx = 3 * (p2x - p1x) - cx,
        ax = 1 - cx - bx,
        cy = 3 * p1y,
        by = 3 * (p2y - p1y) - cy,
        ay = 1 - cy - by;
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
            } else {
                t1 = t2;
            }
            t2 = (t1 - t0) / 2 + t0;
        }
        return t2;
    }
    return solve(t, duration);
}

// console.log(block1.x())
// block.add(text_a, text_b);
// console.log(text_b.x(10))
// text_b.set()
// console.log(block.find());
// const cc = rect.backgroundColor("yellow");
// console.log(cc)
// rect.set()
// block1.set({ rotate: 0 });
