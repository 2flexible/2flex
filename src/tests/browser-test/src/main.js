import { Canvas, TextBlock, Block, Layer, Rectangle } from "./2flex/2flex";

const canvas = new Canvas("canvas", 800, 400, { "background-color": "black" });

const text_a = new TextBlock("First Text", {
    x: 200,
    y: 40,
    color: "blue",
    fontFamily: "KulminoituvaRegular",
    stroke: 2,
    strokeColor: "white",
    fontSize: 40,
    selectable: true,
    // lineWidth: 10,
});

const text_b = new TextBlock("SecondText", {
    x: 400,
    y: 2,
    color: "white",
    // strokeColor: "red",
    fontSize: 50,
    selectable: false,

    // stroke: 2,
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
    y: 50,
    width: 40,
    height: 120,
    color: "white",
});
// rect.add(text_a);
// text_b.set({ selectable: true });
// rect.set({ color: "red" });
rect.mousemove((e) => {
    console.log(e.clientX, rect.initX, rect.options.width);
    // console.log(e.clientY, rect.initY, rect.options.height);

    // text_b.set({ fontSize: 20 });
    // text_a.set({ fontSize: 40 });
});
// text_b.mouseleave((e) => {
// console.log("mouseleave");
// text_b.set({ fontSize: 20 });
// text_a.set({ fontSize: 40 });
// });
canvas.add(rect, text_a, text_b);
block.add(text_a, text_b);

// console.log(block.find());
