import { Canvas, TextBlock, Block, Layer, Rectangle } from "./2flex/2flex";

const canvas = new Canvas("canvas", { width: "800px" });

const text_a = new TextBlock("First Text", {
    x: 0,
    y: 10,
    color: "blue",
    fontFamily: "KulminoituvaRegular",
    stroke: "blue",
    fontSize: 20,
    lineWidth: 10,
});

const text_b = new TextBlock("SecondText", {
    x: 30,
    y: 2,
    color: "red",
    fontFamily: "KulminoituvaRegular",
    fontSize: 35,
    draggable: true,
});
const block = new Block();

text_b.click((e) => {
    console.log("clicked");
    // text_b.set({ fontSize: 20 });
    // text_a.set({ fontSize: 40 });
});
text_a.click((e) => {
    text_a.set({ color: "red" });
    console.log("second clicked");
    text_a.set({ fontSize: 40 });
});

const layer = new Layer({ x: 20 });
layer.add(text_a, text_b);
const rect = new Rectangle({ width: 40, height: 120, color: "red" });
// rect.add(text_a);
canvas.add(text_a, text_b, rect);

block.add(text_a, text_b);

console.log(block.find());
