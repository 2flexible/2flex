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
const circle = new Circle({
    color: "red",
    fill: true,
    stroke: true,
    borderColor: "blue",
    borderWidth: 5,
});
rect.add(circle);

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
    x: 70,
    y: 50,
    // flexBasis: 100,
    flexShrink: 1,
    // flexGrow: 1,
    border: "20 dotted red",
    // borderRight: "6 solid red",
    gridColumnStart: 2,
    draggable: true,
    selectable: true,
    // order: 4,
});
const block2 = new Rectangle({
    width: 200,
    height: 100,
    backgroundColor: "red",
    fill: true,
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
const layout = new Layout({
    layout: "flex",
    // flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignContent: "space-around",
    // alignItems: "center",
    width: 400,
    height: 300,
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

layout.add(block1, block2, block3, block4, block5, block6);
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
// console.log(block1.x())
// block.add(text_a, text_b);
// console.log(text_b.x(10))
// text_b.set()
// console.log(block.find());
// const cc = rect.backgroundColor("yellow");
// console.log(cc)
// rect.set()
