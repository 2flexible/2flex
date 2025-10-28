import {
    Canvas,
    TextBlock,
    Block,
    Rectangle,
    Circle,
    Line,
    Layout,
} from "./2flex/2flex";

const canvas = new Canvas("canvas", 800, 400, { "background-color": "black" });

const text_a = new TextBlock("First Text", {
    x: 0,
    y: 150,
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
    selectable: false,
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
    x: 0,
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
    clip: true,
});

const rect1 = new Rectangle({
    x: 400,
    y: 100,
    width: 200,
    height: 200,
    borderWidth: 2,
    borderRadius: [0, 20, 20, 0],
    backgroundColor: "yellow",
    stroke: true,
    borderColor: "red",
    fill: true,
});
const circle = new Circle({
    color: "red",
    fill: true,
    stroke: true,
    borderColor: "blue",
    borderWidth: 5,
});
rect.add(text_b);

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
    width: 140,
    height: 80,
    backgroundColor: "blue",
    fill: true,
});
const block2 = new Rectangle({
    width: 100,
    height: 120,
    backgroundColor: "red",
    fill: true,
});
const block3 = new Rectangle({
    width: 80,
    height: 80,
    backgroundColor: "yellow",
    fill: true,
});
const block4 = new Rectangle({
    width: 220,
    height: 40,
    backgroundColor: "orange",
    fill: true,
});
const block5 = new Rectangle({
    width: 200,
    height: 50,
    backgroundColor: "blue",
    fill: true,
    stroke: true,
});
const block6 = new Rectangle({
    width: 60,
    height: 120,
    backgroundColor: "orange",
    fill: true,
    stroke: true,
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
});

const random_blocks = [];

function createRandomBlocks() {
    const width = Math.floor(Math.random() * 300);
    const height = Math.floor(Math.random() * 100);

    const colors = ["blue", "red", "green", "yellow", "brown"];
    const color = colors[Math.floor(Math.random() * colors.length - 1)];
    for (let i = 0; i < colors.length; i++) {
        const text = new TextBlock("SecondText", {
            x: 0,
            y: 0,
            color: "white",
            fontSize: "32px",
            selectable: false,
        });
        const block = new Rectangle({
            width: width,
            height: height,
            backgroundColor: color,
            fill: true,
            stroke: true,
        }).add(text);
        random_blocks.push(block);
    }
}
createRandomBlocks()
const layout = new Layout({
    layout: "flex",
    flexDirection: "row-reverse",
    wrap: "wrap",
    width: 400,
    alignItems: "start",
    height: 300,
    gapColumn: 0,
    gapRow: 0,
});
layout.add(...random_blocks);
mainBlock.add(layout);
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
canvas.add(mainBlock);
// block.add(text_a, text_b);
// console.log(text_b.x(10))
// text_b.set()
// console.log(block.find());
// const cc = rect.backgroundColor("yellow");
// console.log(cc)
// rect.set()
