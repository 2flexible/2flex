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
    gapColumn: 0,
    gapRow: 0,
};
type JustifyContent =
    | "normal"
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
    | "normal"
    | "space-evenly"
    | "space-around"
    | "space-between"
    | "center"
    | "start"
    | "end"
    // only applies to grid
    | "stretch";

// this will differ based on flexbox and grid system
type AlignItems = "normal" | "start" | "center" | "end" | "stretch";

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
type FlexFlow = [FlexDirecton, FlexWrap];

type FlexGrow = number | "all";
type FlexShrink = number;
type FlexBasis = string;

type Flex = [FlexGrow, FlexShrink, FlexBasis];

type TypeContent =
    | "justifyContent"
    | "justifyItems"
    | "alignContent"
    | "alignItems";

interface FlexLayout {
    // flex: flex-grow flex-shrink flex-basis
    flex: Flex;

    flexGrow: FlexGrow;
    flexShrink: FlexShrink;
    flexBasis: FlexBasis;

    flexDirection: FlexDirecton;
    flexWrap: FlexWrap;
    flexFlow: FlexFlow;
}
// @Todo: all numbers will change to string due to unit converting
interface GridLayout {
    // grid-template-rows / grid-template-columns|grid-template-areas|grid-template-rows / [grid-auto-flow] grid-auto-columns|[grid-auto-flow] grid-auto-rows / grid-template-columns
    // @Todo: add Name assignamed to each grid
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

    justifyItems: JustifyItems;
}
type ILayout = "flex" | "inline-flex" | "grid" | "inline-grid";

interface LayoutOptions extends DefaultLayoutOpt, GridLayout, FlexLayout {
    layout: ILayout;
    justifyContent: JustifyContent;
    alignContent: AlignContent;
    alignItems: AlignItems;
}

// Layer spesical type of block whcih defines group of blocks
// @todo: some of the methods won't be triggered by the invoker
export class Layout extends Block {
    #startX = 0;
    #startY = 0;

    constructor(options: IBlock<LayoutOptions>) {
        super(options);
        this.options = { ...defaultOpt, ...options };
    }
    __initSet() {
        super.__initSet();
    }
    layout(opt?: ILayout) {
        const layout = this.__cacheOption(this.options.flex, 0, opt);

        if (layout === "flex") {
            switch (this.options.flexDirection) {
                case "column":
                    this.#flexColumn(this._childs as any);
                    break;
                case "column-reverse":
                    this.#flexColumnReverse(this._childs as any);
                    break;
                case "row":
                    this.#flexRow(this._childs as any);
                    break;
                case "row-reverse":
                    this.#flexRowReverse(this._childs as any);
                    break;
                default:
                    break;
            }
        } else {
            // this.#layoutGrid(this._childs as any);
        }
        return layout;
    }
    flex(opt?: Flex) {
        const flex = this.__cacheOption(this.options.flex, 0, opt);

        this.options.flexGrow = flex[0] || this.options.flexGrow;
        this.options.flexShrink = flex[1] || this.options.flexGrow;
        this.options.flexBasis = flex[2] || this.options.flexGrow;

        return flex;
    }
    flexFlow(opt?: FlexFlow) {
        const flexFlow = this.__cacheOption(this.options.flexFlow, 0, opt);
        this.options.flexDirection = flexFlow[0] || this.options.flexDirection;
        this.options.flexWrap = flexFlow[1] || this.options.flexWrap;
        return flexFlow;
    }
    flexGrow(opt?: FlexGrow) {
        return this.__cacheOption(this.options.flexGrow, 0, opt);
    }
    flexShrink(opt?: FlexShrink) {
        return this.__cacheOption(this.options.flexShrink, 0, opt);
    }
    flexBasis(opt?: FlexBasis) {
        return this.__cacheOption(this.options.flexBasis, 0, opt);
    }
    flexDirection(opt?: FlexDirecton) {
        return this.__cacheOption(this.options.flexDirection, 0, opt);
    }
    flexWrap(opt?: FlexWrap) {
        return this.__cacheOption(this.options.flexWrap, 0, opt);
    }

    gap(opt?: number | number[]) {
        const gap = this.__cacheOption(this.options.gapColumn, 0, opt);

        if (opt instanceof Array) {
            this.options.gapColumn = opt[0] || gap;
            this.options.gapRow = opt[1] || gap;
        } else {
            this.options.gapColumn = gap;
            this.options.gapRow = gap;
        }
        return gap;
    }

    gridArea(opt?: number[]) {}

    gapColumn(opt?: number) {
        return this.__cacheOption(this.options.gapColumn, 0, opt);
    }
    gapRow(opt?: number) {
        return this.__cacheOption(this.options.gapRow, 0, opt);
    }
    columnStart(opt?: number) {
        return this.__cacheOption(this.options.columnStart, 1, opt);
    }
    columnEnd(opt?: number) {
        return this.__cacheOption(this.options.columnEnd, 0, opt);
    }
    justifyContent(opt?: JustifyContent) {
        const justifyContent = this.__cacheOption(
            this.options.justifyContent,
            "normal",
            opt
        );
        const justify = "justifyContent";
        switch (justifyContent) {
            case "space-evenly":
                this.#spaceEvenly(justify);
                break;
            case "space-around":
                this.#spaceAround(justify);
                break;
            case "space-between":
                this.#spaceBetween(justify);
                break;
            case "center":
                this.#center(justify);
                break;
            case "start":
                this.#start(justify);
                break;
            case "end":
                this.#end(justify);
                break;
            // only for grid
            case "stretch":
                break;
            default:
                break;
        }
        return justifyContent;
    }
    // in flexbox works with wrap option
    alignContent(opt?: AlignContent) {
        const alignContent = this.__cacheOption(
            this.options.alignContent,
            "normal",
            opt
        );

        if (
            this.options.flexWrap != "wrap" ||
            this.options.flexWrap != "wrap-reverse"
        )
            return alignContent;

        const align = "alignContent";

        switch (alignContent) {
            case "space-evenly":
                this.#spaceEvenly(align);
                break;
            case "space-around":
                this.#spaceAround(align);
                break;
            case "space-between":
                this.#spaceBetween(align);
                break;
            case "center":
                this.#center(align);
                break;
            case "start":
                this.#start(align);
                break;
            case "end":
                this.#end(align);
                break;
            // only for grid
            case "stretch":
                break;
            default:
                break;
        }
        return alignContent;
    }
    alignItems(opt?: AlignItems) {
        const alignItems = this.__cacheOption(
            this.options.alignItems,
            "normal",
            opt
        );

        const align = "alignItems";

        switch (alignItems) {
            case "center":
                this.#center(align);
                break;
            case "start":
                this.#start(align);
                break;
            case "end":
                this.#end(align);
                break;
            // only for grid
            case "stretch":
                break;
            default:
                break;
        }
        return alignItems;
    }
    get #isFlexCol() {
        if (
            this.options.flexDirection === "column" ||
            this.options.flexDirection === "column-reverse"
        )
            return true;
        return false;
    }
    get #isWrap() {
        return this.options.wrap === "nowrap" ? false : true;
    }
    get #blocksSize() {
        let blocksW = 0;
        let blocksH = 0;

        this._childs.forEach((item: any) => {
            blocksW += item.options.width;
            blocksH += item.options.height;
        });
        blocksW += this.options.gapColumn;
        blocksH += this.options.gapRow;

        return { w: blocksW, h: blocksH };
    }
    #checkLayoutType(
        _type: TypeContent,
        _justify_cont_func?: () => void,
        _align_cont_func?: () => void,
        _justify_func?: () => void,
        _align_func?: () => void
    ) {
        switch (_type) {
            case "justifyContent":
                _justify_cont_func && _justify_cont_func();
                break;
            case "alignContent":
                _align_cont_func && _align_cont_func();
                break;
            case "justifyItems":
                _justify_func && _justify_func();
                break;
            case "alignItems":
                _align_func && _align_func();
                break;
            default:
                break;
        }
    }
    #start(_type: TypeContent) {
        const _func1 = () => {
            if (this.#isFlexCol) this.#startY = 0;
            else this.#startX = 0;
        };
        const _func2 = () => {
            if (this.#isFlexCol) this.#startX = 0;
            else this.#startY = 0;
        };
        const _func3 = () => {
            if (this.#isFlexCol) this.#startY = 0;
            else this.#startX = 0;
        };
        const _func4 = () => {
            if (this.#isFlexCol) this.#startX = 0;
            else this.#startY = 0;
        };
        this.#checkLayoutType(_type, _func1, _func2, _func3, _func4);
    }

    #end(_type: TypeContent) {
        const _func1 = () => {
            const size = this.#blocksSize;
            if (this.#isFlexCol) this.#startY = this.options.height - size.h;
            else this.#startX = this.options.width - size.w;
        };
        const _func2 = () => {
            const size = this.#blocksSize;
            if (this.#isFlexCol) this.#startX = this.options.width - size.w;
            else this.#startY = this.options.height - size.h;
        };
        const _func3 = () => {
            if (this.#isFlexCol) this.#startY = 0;
            else this.#startX = 0;
        };
        const _func4 = () => {
            if (this.#isFlexCol) {
                this._childs.forEach((element: any) => {
                    element.options.x = Math.abs(
                        this.options.width - element.options.width
                    );
                });
            } else {
                const size = this.#sizeByColsRow();
                let itemsWidth = 0;
                let idxs = 0;
                let startY = 0;
                let initY = 0;
                this._childs.forEach((element: any) => {
                    if (this.#isWrap) {
                        itemsWidth +=
                            element.options.width + this.options.gapColumn;
                        if (!startY) {
                            startY = size["rowsH"][idxs];
                            if (size["containerH"] < this.options.height)
                                initY = Math.abs(
                                    this.options.height - size["containerH"]
                                );
                        }

                        if (this.options.width <= itemsWidth) {
                            itemsWidth = element.options.width;
                            idxs += 1;
                            const maxHeight = size["rowsH"][idxs];
                            startY += maxHeight
                                ? maxHeight
                                : element.options.height;
                        }
                    } else {
                        startY = this.options.height;
                    }

                    element.options.y =
                        initY + Math.abs(startY - element.options.height);
                });
            }
        };
        this.#checkLayoutType(_type, _func1, _func2, _func3, _func4);
    }
    #center(_type: TypeContent) {
        const _func1 = () => {
            const size = this.#blocksSize;
            if (this.#isFlexCol)
                this.#startY = (this.options.height - size.h) / 2;
            else this.#startX = (this.options.width - size.w) / 2;
        };
        const _func2 = () => {
            const size = this.#blocksSize;
            if (this.#isFlexCol) this.#startX = this.options.width - size.w;
            else this.#startY = this.options.height - size.h;
        };
        const _func3 = () => {
            if (this.#isFlexCol) this.#startY = 0;
            else this.#startX = 0;
        };
        const _func4 = () => {
            if (this.#isFlexCol) {
                this._childs.forEach((element: any) => {
                    element.options.x = Math.abs(
                        this.options.width / 2 - element.options.width / 2
                    );
                });
            } else {
                const size = this.#sizeByColsRow();
                let itemsWidth = 0;
                let idxs = 0;
                let startY = 0;
                let maxHeight = 0;
                let initY = 0;
                this._childs.forEach((element: any) => {
                    if (this.#isWrap) {
                        itemsWidth +=
                            element.options.width + this.options.gapColumn;

                        if (!maxHeight) {
                            maxHeight = size["rowsH"][idxs];
                            if (size["containerH"] < this.options.height)
                                initY = Math.abs(
                                    this.options.height / 2 -
                                        size["containerH"] / 2
                                );
                        }

                        if (this.options.width <= itemsWidth) {
                            itemsWidth = element.options.width;
                            idxs += 1;
                            startY += maxHeight;
                            maxHeight = size["rowsH"][idxs]
                                ? size["rowsH"][idxs]
                                : element.options.height;
                        }
                    }else{
                        maxHeight = this.options.height
                    }
                    element.options.y =
                        initY +
                        startY +
                        Math.abs(maxHeight / 2 - element.options.height / 2);
                });
            }
        };
        this.#checkLayoutType(_type, _func1, _func2, _func3, _func4);
    }
    #spaceBetween(_type: TypeContent) {
        const _func1 = () => {
            if (
                this.options.height - this.#blocksSize.h > 0 &&
                this.options.width - this.#blocksSize.w > 0
            ) {
                const blocksHeight = this.#blocksSize.h - this.options.gapRow;
                const blocksWidth = this.#blocksSize.w - this.options.gapColumn;
                if (this.#isFlexCol)
                    this.options.gapRow +=
                        (this.options.height - blocksHeight) /
                        (this._childs.length - 1);
                else
                    this.options.gapColumn +=
                        (this.options.width - blocksWidth) /
                        (this._childs.length - 1);
            }
        };
        const _func2 = () => {
            if (this.#isFlexCol)
                this.options.gapColumn +=
                    (this.options.width - this.#blocksSize.w) /
                        this._childs.length -
                    1;
            else
                this.options.gapRow +=
                    (this.options.height - this.#blocksSize.h) /
                        this._childs.length -
                    1;
        };

        this.#checkLayoutType(_type, _func1, _func2);
    }
    #spaceAround(_type: TypeContent) {
        const _func1 = () => {
            if (
                this.options.height - this.#blocksSize.h > 0 &&
                this.options.width - this.#blocksSize.w > 0
            ) {
                const blocksHeight = this.#blocksSize.h - this.options.gapRow;
                const blocksWidth = this.#blocksSize.w - this.options.gapColumn;
                if (this.#isFlexCol) {
                    this.options.gapRow =
                        (this.options.height - blocksHeight) /
                        this._childs.length;
                    this.#startY = this.options.gapRow / 2;
                } else {
                    this.options.gapColumn =
                        (this.options.width - blocksWidth) /
                        this._childs.length;
                    this.#startX = this.options.gapColumn / 2;
                }
            }
        };
        const _func2 = () => {
            if (this.#isFlexCol)
                this.options.gapColumn +=
                    (this.options.width - this.#blocksSize.w) /
                        this._childs.length -
                    1;
            else
                this.options.gapRow +=
                    (this.options.height - this.#blocksSize.h) /
                        this._childs.length -
                    1;
        };

        this.#checkLayoutType(_type, _func1, _func2);
    }
    #spaceEvenly(_type: TypeContent) {
        const _func1 = () => {
            if (
                this.options.height - this.#blocksSize.h > 0 &&
                this.options.width - this.#blocksSize.w > 0
            ) {
                const blocksHeight = this.#blocksSize.h - this.options.gapRow;
                const blocksWidth = this.#blocksSize.w - this.options.gapColumn;
                if (this.#isFlexCol) {
                    this.options.gapRow +=
                        (this.options.height - blocksHeight) /
                        (this._childs.length + 1);
                    this.#startY = this.options.gapRow;
                } else {
                    this.options.gapColumn +=
                        (this.options.width - blocksWidth) /
                        (this._childs.length + 1);
                    this.#startX = this.options.gapColumn;
                }
            }
        };
        const _func2 = () => {
            if (this.#isFlexCol)
                this.options.gapColumn +=
                    (this.options.width - this.#blocksSize.w) /
                    (this._childs.length - 1);
            else
                this.options.gapRow +=
                    (this.options.height - this.#blocksSize.h) /
                    (this._childs.length - 1);
        };

        this.#checkLayoutType(_type, _func1, _func2);
    }

    // need to adjust width heigt to be responsiable
    #flexColumn(block: BlockElements[]) {
        let idx = 0;
        let sharedGap = 0;
        if (this.options.height <= this.#blocksSize.h)
            sharedGap =
                Math.abs(this.options.height - this.#blocksSize.h) /
                this._childs.length;

        let startY = this.#startY;
        while (block.length - 1 >= idx) {
            let endY = (this._childs[idx] as any).options.height - sharedGap;

            (this._childs[idx] as any).options.y = startY;
            (this._childs[idx] as any).options.height = endY;
            startY += this.options.gapRow + endY;
            idx += 1;
        }
    }
    #flexColumnReverse(block: BlockElements[]) {}

    #sizeByColsRow() {
        const rows: number[] = [];
        const colsW: number[] = [];
        const colsH: number[] = [];
        let row = 0;

        const colsByRow: number[] = [];
        const rowsW: number[] = [];
        const rowshByCols: number[] = [];
        let col = 0;

        let containerW = 0;
        let containerH = 0;

        let blocksW = 0;
        let blocksH = 0;

        let biggestH: number[] = [];

        this._childs.forEach((item: any, idx) => {
            biggestH.push(item.options.height);
            col += 1;
            blocksW += item.options.width;

            if (idx !== this._childs.length - 1)
                blocksW += this.options.gapColumn;

            if (this.#isWrap) {
                if (idx === this._childs.length - 1) {
                    colsByRow.push(col);
                    rowsW.push(blocksW);
                    containerW += blocksW;
                    let bigH = Math.max(...biggestH);
                    containerH += bigH;
                    rowshByCols.push(bigH + this.options.gapRow);
                    row += 1;
                    rows.push(row);
                }
                if (blocksW >= this.options.width) {
                    colsByRow.push(col);
                    rowsW.push(blocksW);
                    containerW += blocksW + this.options.gapColumn;
                    blocksW = item.options.width;
                    let bigH = Math.max(...biggestH);
                    biggestH = [];
                    biggestH.push(item.options.height);
                    containerH += bigH;
                    rowshByCols.push(bigH + this.options.gapRow);
                    row += 1;
                    rows.push(row);
                }
            } else if (idx === this._childs.length - 1) {
                rowsW.push(blocksW);
                colsByRow.push(col);
                rowshByCols.push(Math.max(...biggestH));
            }
        });

        return {
            rows: rows,
            cols: colsByRow,
            rowsW: rowsW,
            rowsH: rowshByCols,
            containerW: containerW,
            containerH: containerH,
        };
    }
    #flexRow(block: BlockElements[]) {
        const sizes = this.#sizeByColsRow();

        let colHeights = [];
        let idx = 0;
        let bigH = 0;
        let col = 0;
        let newCol = false;

        let startX = this.#startX;
        let startY = this.#startY;
        let sizeIdx = 0;
        let sizeRowIdx = 0;

        let sharedColumnGap = 0;
        let sharedRowGap = 0;
        console.log(sizes)
        while (block.length - 1 >= idx) {
            const rowN = sizes["rows"][sizeIdx];
            const colSize = 0;
            const colN = sizes["cols"][sizeRowIdx];
            const rowsW = sizes["rowsW"][sizeRowIdx];

            if (!this.#isWrap) {
                if (colN && rowsW)
                    sharedColumnGap =
                        Math.abs(this.options.width - rowsW) / colN;
            } else sharedColumnGap = 0;
            let endX =
                (this._childs[idx] as any).options.width - sharedColumnGap;
            if (this.#isWrap) {
                if (startX !== 0) col += endX + this.options.gapColumn;
                else col += endX;
                colHeights.push((this._childs[idx] as any).options.height);
                if (col >= this.options.width) {
                    const last: any = colHeights.pop();
                    bigH = Math.max(...colHeights);
                    bigH += startY + this.options.gapRow;
                    colHeights = [last];
                    startX = 0;
                    col = endX;
                    newCol = true;
                    sizeRowIdx += 1;
                    startY = bigH;
                }
                if (newCol) {
                    if (colN && colSize)
                        sharedRowGap =
                            Math.abs(this.options.height - colSize) / colN;
                    let endY =
                        (this._childs[idx] as any).options.height -
                        sharedRowGap;
                    (this._childs[idx] as any).options.y = bigH;
                    (this._childs[idx] as any).options.height = endY;
                    sizeIdx += 1;
                }
            }

            (this._childs[idx] as any).options.x = startX;
            (this._childs[idx] as any).options.width = endX;
            startX += this.options.gapColumn + endX;
            idx += 1;
        }
    }
    #flexRowReverse(block: BlockElements[]) {}
    // column start and end shoudl work together
    // #layoutGrid(block: BlockElements[]) {
    //     const columnStart = this.options.gridColumnStart;
    //     const columnEnd = this.options.gridColumnEnd;

    //     let rows = this.options.gridTemplateRows.length;
    //     let columns = this.options.gridTemplateColumns.length;

    //     // fix for columnsEnd and Columns start negative values
    //     if (columnEnd >= columns || columnEnd === 1)
    //         columns += Math.abs(columns - columnEnd);

    //     if (columnStart >= columns) {
    //         columns += Math.abs(columns - columnStart);
    //     }
    //     let idx = 0;

    //     let startY = block[columnEnd].options.y;
    //     let endY = block[columnEnd].options.height + startY;

    //     let gapRow = this.options.gapRow;
    //     let blockWidth = this.options.width / columns;

    //     let col = columnStart;
    //     // if(columnEnd )
    //     let c = block.length;

    //     while (columns < c) {
    //         c -= columns;
    //     }
    //     if (columnEnd > c) {
    //         col += columnEnd - c;
    //     }

    //     let startX = 0;

    //     let gapColumn = this.options.gapColumn;

    //     let colTimes = col;

    //     while (block.length - 1 > idx) {
    //         if (columns !== col) {
    //             startX += (colTimes - 1) * (blockWidth + gapColumn);
    //             let endX = blockWidth + startX;

    //             block[idx].options.x = startX;
    //             block[idx].options.width = endX;

    //             col++;
    //             colTimes = 2;
    //         } else {
    //             startX = 0;
    //             gapColumn = 0;
    //             col = 1;
    //         }
    //         block[idx + 1].options.y = endY + gapRow;
    //         idx++;
    //     }
    // }
}
