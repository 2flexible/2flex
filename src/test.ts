import { Canvas, Page, Block } from "./index";
import { Rect } from "./shapes/index";

const canvas = new Canvas(200, 200);

const layer = new Page(300, 300);

const block = new Block();

const rect = new Rect(200, 200);

block.add(rect);

layer.add(block);

canvas.add(layer);
