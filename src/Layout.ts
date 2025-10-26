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

    #startXPos: number[] = [];
    #startYPos: number[] = [];

    #gapColumnsByRow: number[] = [];
    #gapRowsByColumn: number[] = [];

    #sizes: any = {};

    constructor(options: IBlock<LayoutOptions>) {
        super(options);
        this.options = { ...defaultOpt, ...options };
    }
    __initSet() {
        super.__initSet();
    }
    layout(opt?: ILayout) {
        const layout = this.__cacheOption(this.options.flex, 0, opt);
        this.#sizeByColsRow();

        if (layout === "flex") {
            switch (this.options.flexDirection) {
                case "column":
                    // this.#flexColumn(this._childs as any);
                    break;
                case "column-reverse":
                    this.#flexColumnReverse();
                    break;
                case "row":
                    this.#flexRow();
                    break;
                case "row-reverse":
                    this.#flexRowReverse();
                    break;
                default:
                    break;
            }
        } else if (layout == "grid") {
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
        if (this.options.wrap != "wrap" && this.options.wrap != "wrap-reverse")
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

    get #isOutofLayout() {
        if (
            this.options.height - this.#sizes.containerH > 0 &&
            this.options.width - this.#sizes.containerW > 0
        )
            return true;
        return false;
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
            if (this.#isFlexCol) {
                this.#startY = 0;
            } else {
                this.#startX = 0;
                this.#flexRow();
            }
        };
        const _func2 = () => {
            if (this.#isFlexCol) {
                this.#startX = 0;
            } else {
                if (this.#isWrap) {
                    this.#startY = 0;
                    this.#flexRow();
                }
            }
        };
        const _func3 = () => {};
        const _func4 = () => {
            if (this.#isFlexCol) this.#startX = 0;
            else this.#startY = 0;
        };
        this.#checkLayoutType(_type, _func1, _func2, _func3, _func4);
    }

    #end(_type: TypeContent) {
        const _func1 = () => {
            if (this.#isOutofLayout) {
                if (this.#isFlexCol) {
                    this.#startY = this.options.height - this.#sizes.containerH;
                } else {
                    if (this.#isWrap) {
                        this.#sizes.rows.width.forEach((item: number) => {
                            this.#startXPos.push(this.options.width - item);
                        });
                    } else {
                        this.#startX =
                            this.options.width - this.#sizes.containerW;
                    }
                    this.#flexRow();
                }
            }
        };
        const _func2 = () => {
            if (this.#isOutofLayout) {
                if (this.#isFlexCol) {
                    this.#startX = this.options.width - this.#sizes.w;
                } else {
                    if (this.#isWrap) {
                        this.#startY =
                            this.options.height - this.#sizes.containerH;
                        this.#flexRow();
                    }
                }
            }
        };
        const _func3 = () => {};
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
                // this._childs.forEach((element: any) => {
                //     if (this.#isWrap) {
                //         itemsWidth +=
                //             element.options.width + this.options.gapColumn;
                //         if (!startY) {
                //             startY = size["rowsH"][idxs];
                //             if (size["containerH"] < this.options.height)
                //                 initY = Math.abs(
                //                     this.options.height - size["containerH"]
                //                 );
                //         }

                //         if (this.options.width <= itemsWidth) {
                //             itemsWidth = element.options.width;
                //             idxs += 1;
                //             const maxHeight = size["rowsH"][idxs];
                //             startY += maxHeight
                //                 ? maxHeight
                //                 : element.options.height;
                //         }
                //     } else {
                //         startY = this.options.height;
                //     }

                //     element.options.y =
                //         initY + Math.abs(startY - element.options.height);
                // });
            }
        };
        this.#checkLayoutType(_type, _func1, _func2, _func3, _func4);
    }
    #center(_type: TypeContent) {
        const _func1 = () => {
            if (this.#isOutofLayout) {
                if (this.#isFlexCol) {
                    this.#startY =
                        (this.options.height - this.#sizes.containerH) / 2;
                } else {
                    if (this.#isWrap) {
                        this.#sizes.rows.width.forEach((item: number) => {
                            this.#startXPos.push(
                                (this.options.width - item) / 2
                            );
                        });
                    } else {
                        this.#startX =
                            (this.options.width - this.#sizes.containerW) / 2;
                    }

                    this.#flexRow();
                }
            }
        };
        const _func2 = () => {
            if (this.#isOutofLayout) {
                if (this.#isFlexCol) {
                    this.#startX = this.options.width - this.#sizes.w;
                } else {
                    if (this.#isWrap) {
                        this.#startY =
                            (this.options.height - this.#sizes.containerH) /
                            this.#sizes.rows.nItems;
                        this.#flexRow();
                    }
                }
            }
        };
        const _func3 = () => {};
        const _func4 = () => {
            if (this.#isFlexCol) {
                this._childs.forEach((element: any) => {
                    element.options.x = Math.abs(
                        this.options.width / 2 - element.options.width / 2
                    );
                });
            } else {
                let itemsWidth = 0;
                let idxs = 0;
                let startY = 0;
                let maxHeight = 0;
                let initY = 0;
                // this._childs.forEach((element: any) => {
                //     if (this.#isWrap) {
                //         itemsWidth +=
                //             element.options.width + this.options.gapColumn;

                //         if (!maxHeight) {
                //             maxHeight = size["rows"]["height"][idxs];
                //             if (size["containerH"] < this.options.height)
                //                 initY = Math.abs(
                //                     this.options.height / 2 -
                //                         size["containerH"] / 2
                //                 );
                //         }

                //         if (this.options.width <= itemsWidth) {
                //             itemsWidth = element.options.width;
                //             idxs += 1;
                //             startY += maxHeight;
                //             maxHeight = size["rows"]["height"][idxs]
                //                 ? size["rows"]["height"][idxs]
                //                 : element.options.height;
                //         }
                //     } else {
                //         maxHeight = this.options.height;
                //     }
                //     element.options.y =
                //         initY +
                //         startY +
                //         Math.abs(maxHeight / 2 - element.options.height / 2);
                // });
            }
        };
        this.#checkLayoutType(_type, _func1, _func2, _func3, _func4);
    }
    #spaceBetween(_type: TypeContent) {
        const _func1 = () => {
            if (this.#isOutofLayout) {
                if (this.#isFlexCol)
                    this.options.gapRow +=
                        (this.options.height - this.#sizes.containerH) /
                        (this._childs.length - 1);
                else {
                    if (this.#isWrap) {
                        this.#sizes.rows.width.forEach(
                            (item: number, index: number) => {
                                const idx = this.#sizes.rows.cols[index] - 1;
                                this.#gapColumnsByRow.push(
                                    (this.options.width - item) / idx
                                );
                            }
                        );
                    } else {
                        this.options.gapColumn +=
                            (this.options.width - this.#sizes.containerW) /
                            (this._childs.length - 1);
                    }
                    this.#flexRow();
                }
            }
        };
        const _func2 = () => {
            if (this.#isOutofLayout) {
                if (this.#isFlexCol) {
                } else {
                    if (this.#isWrap) {
                        this.options.gapRow =
                            (this.options.height - this.#sizes.containerH) /
                            (this.#sizes.rows.nItems - 1);
                        this.#flexRow();
                    }
                }
            }
        };

        this.#checkLayoutType(_type, _func1, _func2);
    }
    #spaceAround(_type: TypeContent) {
        const _func1 = () => {
            if (this.#isOutofLayout) {
                if (this.#isFlexCol) {
                    this.options.gapRow =
                        (this.options.height - this.#sizes.containerH) /
                        this._childs.length;
                    this.#startY = this.options.gapRow / 2;
                } else {
                    if (this.#isWrap) {
                        this.#sizes.rows.width.forEach(
                            (item: number, index: number) => {
                                const cols = this.#sizes.rows.cols[index];
                                const gap = (this.options.width - item) / cols;
                                this.#gapColumnsByRow.push(gap);
                                this.#startXPos.push(gap / 2);
                            }
                        );
                    } else {
                        this.options.gapColumn =
                            (this.options.width - this.#sizes.containerW) /
                            this._childs.length;
                        this.#startX = this.options.gapColumn / 2;
                    }
                    this.#flexRow();
                }
            }
        };
        const _func2 = () => {
            if (this.#isFlexCol) {
            } else {
                if (this.#isWrap) {
                    this.options.gapRow =
                        (this.options.height - this.#sizes.containerH) /
                        this.#sizes.rows.nItems;
                    this.#startY = this.options.gapRow / 2;
                    this.#flexRow();
                }
            }
        };

        this.#checkLayoutType(_type, _func1, _func2);
    }
    #spaceEvenly(_type: TypeContent) {
        const _func1 = () => {
            if (this.#isOutofLayout) {
                if (this.#isFlexCol) {
                    this.options.gapRow +=
                        (this.options.height - this.#sizes.containerH) /
                        (this._childs.length + 1);
                    this.#startY = this.options.gapRow;
                } else {
                    if (this.#isWrap) {
                        this.#sizes.rows.width.forEach(
                            (item: number, index: number) => {
                                const cols = this.#sizes.rows.cols[index];
                                const gap =
                                    (this.options.width - item) / (cols + 1);
                                this.#gapColumnsByRow.push(gap);
                                this.#startXPos.push(gap);
                            }
                        );
                    } else {
                        this.options.gapColumn +=
                            (this.options.width - this.#sizes.containerW) /
                            (this._childs.length + 1);
                        this.#startX = this.options.gapColumn;
                    }
                    this.#flexRow();
                }
            }
        };
        const _func2 = () => {
            if (this.#isFlexCol) {
            } else {
                if (this.#isWrap) {
                    this.options.gapRow =
                        (this.options.height - this.#sizes.containerH) /
                        (this.#sizes.rows.nItems + 1);
                    this.#startY = this.options.gapRow;
                    this.#flexRow();
                }
            }
        };

        this.#checkLayoutType(_type, _func1, _func2);
    }

    #sizeByColsRow() {
        interface info {
            nItems: number;
            width: number[];
            height: number[];
            rows?: number[];
            cols?: number[];
        }

        const cols: info = {
            nItems: 0,
            width: [],
            height: [],
            rows: [],
        };
        const rows: info = {
            nItems: 0,
            width: [],
            height: [],
            cols: [],
            // minH: [],
        };

        let col = 0;

        let containerW = 0;
        let containerH = 0;

        let blocksW = 0;
        let blocksH = 0;

        const blocks = this._childs as any;

        let wrapWidth = 0;
        let idx = 0;
        while (idx < blocks.length) {
            const item = blocks[idx];
            if (this.#isWrap) wrapWidth += item.options.width;

            cols["nItems"] += 1;
            cols["width"].push(blocksW as number);

            if (idx === blocks.length - 1) {
                if (!(wrapWidth >= this.options.width)) {
                    blocksW += item.options.width;
                    col += 1;
                }
                rows["cols"]?.push(col);
                rows["width"].push(blocksW);
                rows["height"].push(blocksH);
                rows["nItems"] += 1;
                blocksW = item.options.width;
                blocksH = item.options.height;
                col = 1;
            }

            if (this.#isWrap) {
                if (wrapWidth >= this.options.width) {
                    rows["width"].push(blocksW);
                    rows["height"].push(blocksH);
                    rows["cols"]?.push(col);
                    rows["nItems"] += 1;
                    wrapWidth = item.options.width;
                    blocksW = 0;
                    blocksH = 0;
                    col = 0;
                }
            }

            blocksW += item.options.width;
            blocksH =
                blocksH < item.options.height ? item.options.height : blocksH;
            col += 1;
            idx += 1;
        }

        containerW = Math.max(...rows["width"]);
        containerH = rows["height"].reduce((prev, curr) => prev + curr, 0);
        this.#sizes = {
            rows: rows,
            cols: cols,
            containerW: containerW,
            containerH: containerH,
        };
    }
    #flexRow() {
        const block = this._childs as BlockElements[];
        let idx = 0;
        let rowIdx = 0;
        let colIdx = 0;

        let startX = this.#startXPos[rowIdx] || this.#startX;
        let startY = this.#startYPos[rowIdx] || this.#startY;

        let sharedColumnGap = 0;
        let gapCol = this.#gapColumnsByRow[rowIdx] || this.options.gapColumn;
        let gapRow = this.#gapRowsByColumn[rowIdx] || this.options.gapRow;

        console.log(this.#sizes);
        while (block.length - 1 >= idx) {
            const colsByRow = (this.#sizes.rows.cols as number[])[rowIdx];
            const rowsW = this.#sizes.rows.width[rowIdx];
            const rowsH = this.#sizes.rows.height[rowIdx];
            if (this.#isWrap) {
                if (colIdx === colsByRow && this.#sizes.rows.nItems > 0) {
                    rowIdx += 1;
                    startX = this.#startXPos[rowIdx] || this.#startX;
                    if (this.#startYPos[rowIdx])
                        startY += this.#startYPos[rowIdx];
                    startY += rowsH + gapRow;
                    gapCol = this.#gapColumnsByRow[rowIdx] || gapCol;
                    colIdx = 0;
                }
            } else {
                if (colsByRow && rowsW && rowsW >= this.options.width) {
                    sharedColumnGap =
                        Math.abs(this.options.width - rowsW) / colsByRow;
                    if (block.length - 1 !== idx) sharedColumnGap += gapCol;
                }
            }
            let endY = (this._childs[idx] as any).options.height;
            (this._childs[idx] as any).options.y = startY;
            (this._childs[idx] as any).options.height = endY;

            const endX =
                (this._childs[idx] as any).options.width - sharedColumnGap;
            (this._childs[idx] as any).options.x = startX;
            (this._childs[idx] as any).options.width = endX;

            startX += gapCol + endX;
            idx += 1;
            colIdx += 1;
        }
    }
    #flexRowReverse() {}

    // need to adjust width heigt to be responsiable
    // #flexColumn() {
    //     let idx = 0;
    //     let sharedGap = 0;
    //     if (this.options.height <= this.#blocksSize.h)
    //         sharedGap =
    //             Math.abs(this.options.height - this.#blocksSize.h) /
    //             this._childs.length;

    //     let startY = this.#startY;
    //     while (block.length - 1 >= idx) {
    //         let endY = (this._childs[idx] as any).options.height - sharedGap;

    //         (this._childs[idx] as any).options.y = startY;
    //         (this._childs[idx] as any).options.height = endY;
    //         startY += this.options.gapRow + endY;
    //         idx += 1;
    //     }
    // }
    #flexColumnReverse() {}
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
