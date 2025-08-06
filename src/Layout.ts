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
interface FlexLayout {
    flexDirection: "column" | "row";
}
interface GapLayout {
    gridTemplateColumns: number[] | number;
    gap: number;
    columnGap: number;
}

interface LayoutOptions extends DefaultLayoutOpt, GapLayout, FlexLayout {
    layout: "flex" | "grid";
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
