import { Block } from "./Block";
import { Layout } from "./Layout";
import { Shape } from "./Shape";
import { Rectangle, Circle, Line, MediaBlock, Text } from "./shapes/index";

// @Todo: fix type issue
export const defaultBlocks = [
    Block,
    Layout,
    Shape,
    Text,
    Rectangle,
    MediaBlock,
    Circle,
    Line,
] as any[];
