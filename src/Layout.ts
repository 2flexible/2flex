import { Block } from "./Block";
import { IBlock, IDefaultBlockOpt, BlockElements } from "./types";

interface DefaultLayoutOpt {}

const defaultOpt: IDefaultBlockOpt<DefaultLayoutOpt> = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    selectable: true,
    draggable: true,
    zIndex: 0,
    dragX: true,
    dragY: true,
};
type JustifyContent =
    | "space-evenly"
    | "space-around"
    | "space-between"
    | "center"
    | "start"
    | "end"
    // only applies to grid
    | "stretch";

// for grid, inline-grid systems only
type JustifyItems =
    | "normal"
    | "stretch"
    | "start"
    | "end"
    | "center"
    // for ltr rtl writing mode
    | "left"
    | "right";

type AlignContent =
    | "space-evenly"
    | "space-around"
    | "space-between"
    | "center"
    | "start"
    | "end"
    // only applies to grid
    | "stretch";

// this will differ based on flexbox and grid system
type AlignItems = "start" | "center" | "end" | "stretch";

// Todo: need to impliment justify self, align-sef for each block, can be done with left, right, bottom top postiional values
type AlignSelf = "normal" | "auto" | "center" | "start" | "end" | "stertch";

type JustifySelf =
    | "normal"
    | "auto"
    | "center"
    | "start"
    | "end"
    | "stertch"
    // for rtl, ltr writind mode
    | "left"
    | "right";

type PlaceContent = AlignContent & JustifyContent;

type PlaceItems = AlignItems & JustifyItems;

type PlaceSelf = AlignSelf & JustifySelf;

type FlexDirecton = "column" | "column-reverse" | "row" | "row-reverse";
type FlexWrap = "nowrap" | "wrap" | "wrap-reverse";
interface FlexLayout {
    // flex: flex-grow flex-shrink flex-basis
    flex: number[];

    flexGrow: number;
    flexShrink: number;
    flexBasis: string;

    flexDirection: FlexDirecton;
    flexWrap: FlexWrap;
    flexFlow: [FlexDirecton, FlexWrap];
}
// @Todo: all numbers will change to string due to unit converting
interface GridLayout {
    // grid-template-rows / grid-template-columns|grid-template-areas|grid-template-rows / [grid-auto-flow] grid-auto-columns|[grid-auto-flow] grid-auto-rows / grid-template-columns
    grid: number[];

    // grid-area: grid-row-start / grid-column-start / grid-row-end / grid-column-end
    gridArea: number[];

    // grid-column: grid-column-start / grid-column-end
    gridColumn: number[];
    gridColumnStart: number;
    gridColumnEnd: number;

    // grid-row: grid-row-start / grid-row-end;
    gridRow: number[];
    gridRowStart: number;
    gridRowEnd: number;

    // gridTemplate: grid-template-rows / grid-template-columns
    gridTemplate: number[];
    gridTemplateColumns: number[] | number;
    gridTemplateRows: number[] | number;

    gridRowSize: number;
    gridColumnSize: number;

    gap: number;
    columnGap: number;
    rowGap: number;

    gridAutoFlow: "row" | "column" | "dense" | "row dense" | "column dense";
}

interface LayoutOptions extends DefaultLayoutOpt, GridLayout, FlexLayout {
    layout: "flex" | "inline-flex" | "grid" | "inline-grid";
}

// Layer spesical type of block whcih defines group of blocks
export class Layout extends Block {
    constructor(options: IBlock<LayoutOptions>) {
        super(options);
        this.options = { ...defaultOpt, ...options };
    }
    __initSet() {
        super.__initSet();
    }

    #layoutFlex(block: BlockElements[]) {
        if (this.options.flexDirection === "column") {
            this.#flexColumn(block);
        } else if (this.options.flexDirection === "row") {
            this.#flexRow(block);
        }
    }

    #flexColumn(block: BlockElements[]) {
        let idx = 0;
        while (block.length > idx + 1) {
            let startX = block[idx].options.x;
            let endX = block[idx].options.width + startX;
            block[idx + 1].options.x = endX + this.options.gap;
            idx++;
        }
    }

    #flexRow(block: BlockElements[]) {
        let idx = 0;
        while (block.length > idx + 1) {
            let startY = block[idx].options.y;
            let endY = block[idx].options.height + startY;
            block[idx + 1].options.x = endY + this.options.gap;
            idx++;
        }
    }

    #layoutGrid(block: BlockElements[]) {
        let column = 0;
        let row = 0;
        let idx = 0;

        while (block.length > row) {
            let startX = block[idx].options.x;
            let endX = block[idx].options.width + startX;

            let startY = block[idx].options.y;
            let endY = block[idx].options.height + startY;

            let gap = this.options.gap;
            let gapColumn = this.options.gapColumn;
            let gapRow = this.options.gapRow;

            if (block.length > idx + 1) {
                if (this.options.gridTemplateColumns % idx !== 0) {
                    column++;
                } else {
                    column = 0;
                    endX = 0;
                    gap = 0;
                    gapColumn = 0;
                    gapRow = 0;
                }
                block[idx + 1].options.x = endX + gap + gapColumn;
                block[idx + 1].options.y = endY + gap + gapRow;

                idx++;
            }
        }
    }
    add(...block: BlockElements[]) {
        super.add(...block);

        if (this.options.layout == "grid") {
            this.#layoutGrid(block);
        } else if (this.options.layout == "flex") {
            this.#layoutFlex(block);
        }
    }
}

// const layout = new Layout({x:0,y:0, layout: "flex"}).add()
