import { Canvas } from "./Canvas";
import { Block } from ".";
import { BlockOptions, IBlock } from "./types";

interface IText {
    fontFamily?: string;
    fontWeight?: number;
    fontSize?: number;
    textAlighn?: string;
    textBaseline?: string;
    direction?: string;
    maxWidth?: number;
}

export class TextBlock extends Block<IText> {
    text: string;
    constructor(text: string, options: IBlock<IText>) {
        super(options);
        this.text = text;
        console.log(this.context);
        this.__handleChanges();
    }

    #color() {
        // this.context.fillStyle = this.options?.color;

        this.context?.fillText(
            this.text,
            this.x,
            this.y,
            this.options?.maxWidth
        );
    }

    #storke() {
        // this.context.strokeStyle = this.options?.color;
        this.context?.strokeText(
            this.text,
            this.x,
            this.y,
            this.options?.maxWidth
        );
    }

    handleChanges(): void {
        this.__handleChanges();
    }
}

/* 
Todo - in css 

@font-face {
    font-family: 'KulminoituvaRegular';
    src: url('http://www.miketaylr.com/f/kulminoituva.ttf');
}
*/
const box1 = new Block({ x: 0, y: 0 });

const text_b = new TextBlock("Hey", {
    x: 0,
    y: 0,
    color: "red",
    fontFamily: "KulminoituvaRegular",
});

const canvas = new Canvas(200, 200);

box1.add(text_b);
canvas.add(box1);

console.log(box1);
