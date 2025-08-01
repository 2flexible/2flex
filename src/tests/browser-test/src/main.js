import { Canvas, TextBlock, Block, Rectangle, Triangle } from "./2flex/2flex";

const canvas = new Canvas("canvas", 800, 400, { "background-color": "black" });

const text_a = new TextBlock("First Text", {
    x: 0,
    y: 150,
    fontFamily: "KulminoituvaRegular",
    color: "blue",
    strokeWidth: 2,
    strokeColor: "white",
    fontSize: "40px",
    selectable: true,
    // lineWidth: 10,
});

const text_b = new TextBlock("SecondText", {
    x: 0,
    y: 0,
    color: "yellow",
    strokeColor: "red",
    fontSize: "50px",
    selectable: false,

    // strokeWidth: 2,
    // fontFamily: "KulminoituvaRegular",
    // fontSize: 35,
});
const block = new Block();
const triangle = new Triangle({
    x: 0,
    y: 50,
    color: "red",
    fill: true,
    stroke: true,
    left: 90,
    bottom: 90,
    right: 45,
    // side: 40,
    // clip: true,
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
    clip: true,
    strokeWidth: 2,
    borderRadius: [0, 20, 20, 0],
    color: "white",
    stroke: true,
    strokeColor: "red",
    fill: true,
});

const rect1 = new Rectangle({
    x: 400,
    y: 100,
    width: 200,
    height: 200,
    clip: true,
    strokeWidth: 2,
    borderRadius: [0, 20, 20, 0],
    color: "white",
    stroke: true,
    strokeColor: "red",
    fill: true,
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
canvas.add(rect, text_a);
// block.add(text_a, text_b);

// console.log(block.find());
