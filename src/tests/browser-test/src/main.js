import {
    Canvas,
    TextBlock,
    Block,
    Rectangle,
    Triangle,
    Circle,
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
const triangle = new Triangle({
    x: 100,
    y: 40,
    width: 50,
    color: "white",
    fill: true,
    borderColor: "red",
    stroke: true,
    // size: 100,
    // clip: true,
    // side: 40,
});
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
    color: "white",
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
canvas.add(rect);
// block.add(text_a, text_b);
// console.log(text_b.x(10))
// text_b.set()
// console.log(block.find());
// const cc = rect.backgroundColor("yellow");
// console.log(cc)
// rect.set()