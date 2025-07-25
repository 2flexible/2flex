import { Canvas, TextBlock } from "./2flex/2flex";

const canvas = new Canvas(200, 200, { x: 40 });

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
    y: 0,
    color: "red",
    fontFamily: "KulminoituvaRegular",
    fontSize: 35,
    draggable: true,
});

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
canvas.add(text_a, text_b);
