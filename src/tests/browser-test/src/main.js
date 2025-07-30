import { Canvas, TextBlock, Block, Layer, Rectangle } from "./2flex/2flex";

const canvas = new Canvas("canvas", 800, 400, { "background-color": "black" });

const text_a = new TextBlock("First Text", {
    x: 0,
    y: 150,
    color: "blue",
    fontFamily: "KulminoituvaRegular",
    strokeWidth: 2,
    strokeColor: "white",
    fontSize: "40px",
    selectable: true,
    // lineWidth: 10,
});

const text_b = new TextBlock("SecondText", {
    x: 0,
    y: 0,
    color: "black",
    // strokeColor: "red",
    fontSize: "50px",
    selectable: false,

    // strokeWidth: 2,
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
    x: 100,
    y: 50,
    width: 200,
    height: 200,
    strokeWidth: 2,
    borderRadius: [0, 20, 20, 0],
    color: "white",
    stroke: true,
    strokeColor: "red",
    fill: true,
});
rect.add(text_a, text_b);
// text_b.set({ selectable: true });
// rect.set({ color: "red" });
rect.mousemove((e) => {
    // console.log(e.clientX, rect.initX, rect.options.width);
    // console.log(e.clientY, rect.initY, rect.options.height);
    // text_b.set({ fontSize: 20 });
    // text_a.set({ fontSize: 40 });
});
// text_b.mouseleave((e) => {
// console.log("mouseleave");
// text_b.set({ fontSize: 20 });
// text_a.set({ fontSize: 40 });
// });
canvas.add(rect);
// block.add(text_a, text_b);

// console.log(block.find());
