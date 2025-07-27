import { Canvas, TextBlock, Block, Layer, Rectangle } from "./2flex/2flex";

const canvas = new Canvas("canvas", 800, 400, { "background-color": "black" });

const text_a = new TextBlock("First Text", {
    x: 0,
    y: 10,
    color: "blue",
    fontFamily: "KulminoituvaRegular",
    stroke: 2,
    strokeColor: "white",
    fontSize: 40,
    // lineWidth: 10,
});

const text_b = new TextBlock("SecondText", {
    x: 400,
    y: 2,
    color: "white",
    // strokeColor: "red",
    fontSize: 20,
    // stroke: 2,
    // fontFamily: "KulminoituvaRegular",
    // fontSize: 35,
});
const block = new Block();
// text_b.click((e) => {
//     console.log("clicked");
//     // text_b.set({ fontSize: 20 });
//     // text_a.set({ fontSize: 40 });
// });
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
canvas.add(text_a, text_b, rect);
// rect.set({ color: "red" });

block.add(text_a, text_b);

// console.log(block.find());
