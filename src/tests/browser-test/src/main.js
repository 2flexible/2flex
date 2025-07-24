import { Canvas, TextBlock } from "./2flex/2flex";

const canvas = new Canvas(200, 200);

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
    x: 0,
    y: 0,
    color: "red",
    fontFamily: "KulminoituvaRegular",
    fontSize: 35,
    draggable: true,
});

text_b.click((e) => {
    console.log("clicked");
    text_b.set({ fontSize: 20 });
    text_a.set({ fontSize: 40 });
});
text_b.click((e) => {
    console.log("second clicked");
    text_a.set({ fontSize: 40 });
});
canvas.add(text_a, text_b);

// text_a.set({ fontSize: 42 });

const sayHello = (event) => console.log("hello");
canvas.canvas.addEventListener("mousemove", sayHello);
canvas.canvas.removeEventListener("mousemove", sayHello);
