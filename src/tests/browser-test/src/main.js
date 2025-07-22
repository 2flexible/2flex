import { Canvas, TextBlock } from "./2flex/2flex";

// const canvas = new Canvas(1200, 1200);
// canvas.canvas;
// canvas.context;

// const text_a = new Block({ width: 100, height: 100, color: "red" }).click(
//     () => {
//         console.log("clicked");
//     }
// );
// canvas.add(text_a);

// import { Canvas } from "./Canvas";

const canvas = new Canvas(200, 200);

const text_a = new TextBlock("First Text", {
    x: 0,
    y: 10,
    color: "blue",
    fontFamily: "KulminoituvaRegular",
    stroke: "blue",
    lineWidth: 10,
});

const text_b = new TextBlock("SecondText", {
    x: 0,
    y: 0,
    color: "red",
    fontFamily: "KulminoituvaRegular",
    fontSize: 35,
});

text_b.click((e) => {
    console.log("clicked");
    // text_a.set({ stroke: "red" });
    // text_a.set({ color: "black" });
});

canvas.add(text_a, text_b);
