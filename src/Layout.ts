import { Block } from "./Block";
import {
    IBlock,
    IDefaultBlockOpt,
    BlockElements,
    FlexGrow,
    FlexShrink,
    FlexBasis,
} from "./types";

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
    wrap: "nowrap",
    flexDirection: "row",
    gridTemplateRows: [],
    gridTemplateColumns: [],
    paddingTop: 0,
    paddingLeft: 0,
    paddingRight: 0,
    paddingBottom: 0,
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

type AlignItems = "normal" | "start" | "center" | "end" | "stretch";

type PlaceContent = AlignContent & JustifyContent;

type PlaceItems = AlignItems & JustifyItems;

type FlexDirecton = "column" | "column-reverse" | "row" | "row-reverse";
type FlexWrap = "nowrap" | "wrap" | "wrap-reverse";
type FlexFlow = [FlexDirecton, FlexWrap];

type Flex = [FlexGrow, FlexShrink, FlexBasis];

type TypeContent =
    | "justifyContent"
    | "justifyItems"
    | "alignContent"
    | "alignItems";

interface FlexLayout {
    // flex: flex-grow flex-shrink flex-basis
    flex: Flex;
    flexDirection: FlexDirecton;
    flexWrap: FlexWrap;
    flexFlow: FlexFlow;
}
// @Todo: all numbers will change to string due to unit converting
interface GridLayout {
    // grid-template-rows / grid-template-columns|grid-template-areas|grid-template-rows / [grid-auto-flow] grid-auto-columns|[grid-auto-flow] grid-auto-rows / grid-template-columns
    grid: number[];
    // @Todo: add Name assignamed to each grid
    gridTemplateAreas: string[];
    // gridTemplate: grid-template-rows / grid-template-columns
    gridTemplate: number[];
    gridTemplateColumns: number[] | number;
    gridTemplateRows: number[] | number;

    gap: number;
    columnGap: number;
    rowGap: number;

    // @Todo: need to impliment
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
    #startX: number = 0;
    #startY: number = 0;

    #startXPos: number[] = [];
    #startYPos: number[] = [];

    #columnsGap: number[] = [];
    #rowsGap: number[] = [];

    #isNew: boolean = true;

    #containerW: number = 0;
    #containerH: number = 0;

    #flexItems: {
        width: number[];
        height: number[];
        cols: number[];
        rows: number[];
    } = { width: [], height: [], cols: [], rows: [] };

    #gridItems: {
        nCols: number;
        nRows: number;
        width: number[];
        height: number[];
    } = { nCols: 0, nRows: 0, width: [], height: [] };

    constructor(options: IBlock<LayoutOptions>) {
        super(options);
        this.options = { ...defaultOpt, ...options };
    }
    __initSet() {
        super.__initSet();
    }
    clip(opt?: boolean): boolean {
        return super.clip(opt);
    }
    dragX(opt?: boolean) {
        return super.dragX(opt);
    }
    dragY(opt?: boolean) {
        return super.dragY(opt);
    }
    draggable(opt: boolean): boolean {
        return super.draggable(opt);
    }

    selectable(opt?: boolean): boolean {
        return super.selectable(opt);
    }

    set(options: IBlock<LayoutOptions>) {
        super.set(options);
    }
    layout(opt?: ILayout) {
        const layout = this.__cacheOption(this.options.flex, 0, opt);
        let order = 0;
        this._childs.forEach((item: any) => {
            if (!item.options.order) {
                order += 1;
                item.options.order = order;
            }
        });
        if (layout == "inline-flex" || layout == "inline-grid") {
            if (!this.options.width)
                this.options.width = (this._childs as BlockElements[]).reduce(
                    (prev, curr) => prev + curr.options.width,
                    0
                );

            if (!this.options.height)
                this.options.height = (this._childs as BlockElements[]).reduce(
                    (prev, curr) => prev + curr.options.height,
                    0
                );
        }
        if (layout === "flex" || layout == "inline-flex") {
            switch (this.options.flexDirection) {
                case "column":
                    this.#flexColumn();
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
                    this.#flexRow();
                    break;
            }
        } else if (layout == "grid" || layout == "inline-grid") {
            this.#gridLayout();
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
    // only works for grid layout
    justifyItems(opt?: JustifyItems) {
        const justifyItems = this.__cacheOption(
            this.options.justifyItems,
            "normal",
            opt
        );
        const justify = "justifyItems";
        switch (justifyItems) {
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
        return justifyItems;
    }
    // in flexbox works with wrap option
    alignContent(opt?: AlignContent) {
        const alignContent = this.__cacheOption(
            this.options.alignContent,
            "normal",
            opt
        );
        if (
            this.options.wrap != "wrap" &&
            this.options.wrap != "wrap-reverse" &&
            !this.#isGrid
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
    get #isGrid() {
        if (
            this.options.layout === "grid" ||
            this.options.layout === "inline-grid"
        )
            return true;
        return false;
    }
    get #isWrap() {
        return this.options.wrap === "nowrap" ? false : true;
    }

    get #isOutofLayout() {
        if (
            this.options.height - this.#containerH > 0 &&
            this.options.width - this.#containerW > 0
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
            if (this.#isGrid) {
                this.#startX = 0;
                this.#gridLayout();
            } else {
                if (this.#isFlexCol) {
                    this.#startY = 0;
                    this.#flexColumn();
                } else {
                    this.#startX = 0;
                    this.#flexRow();
                }
            }
        };
        const _func2 = () => {
            if (this.#isGrid) {
                this.#startY = 0;
                this.#gridLayout();
            } else {
                if (this.#isFlexCol) {
                    this.#startX = 0;
                    this.#flexColumn();
                } else {
                    if (this.#isWrap) {
                        this.#startY = 0;
                        this.#flexRow();
                    }
                }
            }
        };
        const _func3 = () => {
            if (this.#isGrid) {
                this.#startX = 0;
                this.#gridLayout();
            }
        };
        const _func4 = () => {
            if (this.#isGrid) {
                this.#startY = 0;
                this.#gridLayout();
            } else {
                if (this.#isFlexCol) {
                    this.#startX = 0;
                    this.#flexColumn();
                } else {
                    this.#startY = 0;
                    this.#flexRow();
                }
            }
        };
        this.#checkLayoutType(_type, _func1, _func2, _func3, _func4);
    }

    #end(_type: TypeContent) {
        const _func1 = () => {
            if (this.#isOutofLayout && !this.#isGrid) {
                if (this.#isFlexCol) {
                    if (this.#isWrap) {
                        this.#flexItems.height.forEach((item: number) => {
                            let startY = this.options.height - item;
                            startY = startY >= 0 ? startY : 0;
                            this.#startYPos.push(startY);
                        });
                    } else {
                        const startY = this.options.height - this.#containerH;
                        this.#startY = startY > 0 ? startY : 0;
                    }
                    this.#flexColumn();
                } else {
                    if (this.#isWrap) {
                        this.#flexItems.width.forEach((item: number) => {
                            let startX = this.options.width - item;
                            startX = startX >= 0 ? startX : 0;
                            this.#startXPos.push(startX);
                        });
                    } else {
                        const startX = this.options.width - this.#containerW;
                        this.#startX = startX > 0 ? startX : 0;
                    }
                    this.#flexRow();
                }
            }
            if (this.#isGrid) {
                this.#startX = Math.abs(
                    this.options.width -
                        this.#gridItems.width.reduce((a, c) => a + c, 0)
                );
                this.#gridLayout();
            }
        };
        const _func2 = () => {
            if (this.#isOutofLayout && this.#isWrap && !this.#isGrid) {
                if (this.#isFlexCol) {
                    const startX = this.options.width - this.#containerW;
                    this.#startX = startX > 0 ? startX : 0;
                    this.#flexColumn();
                } else {
                    const startY = this.options.height - this.#containerH;
                    this.#startY = startY > 0 ? startY : 0;
                    this.#flexRow();
                }
            }
            if (this.#isGrid) {
                this.#startY = Math.abs(
                    this.options.height -
                        this.#gridItems.height.reduce((a, c) => a + c, 0)
                );
                this.#gridLayout();
            }
        };
        const _func3 = () => {
            if (this.#isGrid) {
                const blocks = this._childs as BlockElements[];
                let idx = 0;
                let colIdx = 0;
                while (blocks.length > idx) {
                    const width = this.#gridItems.width[colIdx];
                    let startX = width - blocks[idx].options.width;
                    // startX = startX > 0 ? startX : 0;
                    this.#startXPos.push(startX);
                    idx += 1;
                    colIdx += 1;
                    if (colIdx === this.#gridItems.width.length) colIdx = 0;
                }
                this.#gridLayout();
            }
        };
        const _func4 = () => {
            if (this.#isGrid) {
                const blocks = this._childs as BlockElements[];
                let idx = 0;
                let rowIdx = 0;
                while (blocks.length > idx) {
                    const height = this.#gridItems.height[rowIdx];
                    let startY = height - blocks[idx].options.height;
                    // startY = startX > 0 ? startX : 0;
                    this.#startYPos.push(startY);
                    idx += 1;
                    rowIdx += 1;
                    if (rowIdx === this.#gridItems.height.length) rowIdx = 0;
                }
                this.#gridLayout();
            } else {
                if (this.#isFlexCol) {
                    let rows = 0;
                    let idx = 0;
                    let containerW = this.options.width - this.#containerW;
                    containerW =
                        containerW > 0 && !this.#isWrap ? containerW : 0;
                    this.#flexItems.width.forEach((item: number) => {
                        for (let i = 0; i < this.#flexItems.rows[idx]; i++) {
                            const block = (this._childs as any)[i + rows];

                            this.#startXPos.push(
                                containerW + (item - block.options.width)
                            );
                        }
                        rows += this.#flexItems.rows[idx];
                        idx++;
                    });
                    this.#flexColumn();
                } else {
                    let cols = 0;
                    let idx = 0;
                    let containerH = this.options.height - this.#containerH;
                    containerH =
                        containerH > 0 && !this.#isWrap ? containerH : 0;
                    this.#flexItems.height.forEach((item: number) => {
                        for (let i = 0; i < this.#flexItems.cols[idx]; i++) {
                            const block = (this._childs as any)[i + cols];
                            this.#startYPos.push(
                                containerH + (item - block.options.height)
                            );
                        }
                        cols += this.#flexItems.cols[idx];
                        idx++;
                    });
                    this.#flexRow();
                }
            }
        };
        this.#checkLayoutType(_type, _func1, _func2, _func3, _func4);
    }
    #center(_type: TypeContent) {
        const _func1 = () => {
            if (this.#isOutofLayout && !this.#isGrid) {
                if (this.#isFlexCol) {
                    if (this.#isWrap) {
                        this.#flexItems.height.forEach((item: number) => {
                            let startY = this.options.height - item;
                            startY = startY > 0 ? startY : 0;
                            this.#startYPos.push(startY / 2);
                        });
                    } else {
                        const startY = this.options.height - this.#containerH;
                        this.#startY = startY > 0 ? startY / 2 : 0;
                    }

                    this.#flexColumn();
                } else {
                    if (this.#isWrap) {
                        this.#flexItems.width.forEach((item: number) => {
                            let startX = this.options.width - item;
                            startX = startX > 0 ? startX : 0;
                            this.#startXPos.push(startX / 2);
                        });
                    } else {
                        const startX = this.options.width - this.#containerW;
                        this.#startX = startX > 0 ? startX / 2 : 0;
                    }

                    this.#flexRow();
                }
            }
            if (this.#isGrid) {
                let startX =
                    this.options.width / 2 -
                    this.#gridItems.width.reduce((a, c) => a + c, 0) / 2;
                this.#startX = startX > 0 ? startX : 0;
                this.#gridLayout();
            }
        };
        const _func2 = () => {
            if (this.#isGrid) {
                const startY =
                    this.options.height -
                    this.#gridItems.height.reduce((a, c) => a + c, 0);
                this.#startY = startY > 0 ? startY / this.#gridItems.nRows : 0;
                this.#gridLayout();
            } else {
                if (this.#isOutofLayout && this.#isWrap) {
                    if (this.#isFlexCol) {
                        const startX = this.options.width - this.#containerW;
                        this.#startX =
                            startX > 0
                                ? startX / this.#flexItems.cols.length
                                : 0;
                        this.#flexColumn();
                    } else {
                        const startY = this.options.height - this.#containerH;
                        this.#startY =
                            startY > 0
                                ? startY / this.#flexItems.rows.length
                                : 0;
                        this.#flexRow();
                    }
                }
            }
        };
        const _func3 = () => {
            if (this.#isGrid) {
                const blocks = this._childs as BlockElements[];
                let idx = 0;
                let colIdx = 0;
                while (blocks.length > idx) {
                    let startX =
                        this.#gridItems.width[colIdx] / 2 -
                        blocks[idx].options.width / 2;
                    // startX = startX > 0 ? startX : 0;
                    this.#startXPos.push(startX);
                    idx += 1;
                    colIdx += 1;
                    if (this.#gridItems.width.length === colIdx) colIdx = 0;
                }
                this.#gridLayout();
            }
        };
        const _func4 = () => {
            if (this.#isGrid) {
                const blocks = this._childs as BlockElements[];
                let idx = 0;
                let rowIdx = 0;
                while (blocks.length > idx) {
                    const height = this.#gridItems.height[rowIdx];
                    let startY = height / 2 - blocks[idx].options.height / 2;
                    // startY = startX > 0 ? startX : 0;
                    this.#startYPos.push(startY);
                    idx += 1;
                    rowIdx += 1;
                    if (this.#gridItems.height.length === rowIdx) rowIdx = 0;
                }
                this.#gridLayout();
            } else {
                if (this.#isFlexCol) {
                    let rows = 0;
                    let idx = 0;
                    let containerW = this.options.width - this.#containerW;
                    containerW =
                        containerW > 0 && !this.#isWrap ? containerW : 0;
                    this.#flexItems.width.forEach((item: number) => {
                        for (let i = 0; i < this.#flexItems.rows[idx]; i++) {
                            const block = (this._childs as any)[i + rows];
                            this.#startXPos.push(
                                containerW / 2 +
                                    (item - block.options.width) / 2
                            );
                        }
                        rows += this.#flexItems.rows[idx];
                        idx++;
                    });
                    this.#flexColumn();
                } else {
                    let cols = 0;
                    let idx = 0;
                    let containerH = this.options.height - this.#containerH;
                    containerH =
                        containerH > 0 && !this.#isWrap ? containerH : 0;
                    this.#flexItems.height.forEach((item: number) => {
                        for (let i = 0; i < this.#flexItems.cols[idx]; i++) {
                            const block = (this._childs as any)[i + cols];
                            this.#startYPos.push(
                                containerH / 2 +
                                    (item - block.options.height) / 2
                            );
                        }
                        cols += this.#flexItems.cols[idx];
                        idx++;
                    });
                    this.#flexRow();
                }
            }
        };
        this.#checkLayoutType(_type, _func1, _func2, _func3, _func4);
    }
    #spaceBetween(_type: TypeContent) {
        const _func1 = () => {
            if (this.#isOutofLayout && !this.#isGrid) {
                if (this.#isFlexCol) {
                    if (this.#isWrap) {
                        this.#flexItems.height.forEach(
                            (item: number, index: number) => {
                                let gap = this.options.height - item;
                                gap =
                                    gap > 0
                                        ? gap /
                                          (this.#flexItems.rows[index] - 1)
                                        : 0;

                                if (this.options.gapRow > gap)
                                    gap = this.options.gapRow;
                                this.#rowsGap.push(gap);
                            }
                        );
                    } else {
                        let gap = this.options.height - this.#containerH;
                        gap = gap > 0 ? (gap /= this._childs.length - 1) : 0;
                        this.options.gapRow += gap;
                    }
                    this.#flexColumn();
                } else {
                    if (this.#isWrap) {
                        this.#flexItems.width.forEach(
                            (item: number, index: number) => {
                                let gap = this.options.width - item;
                                gap =
                                    gap > 0
                                        ? gap /
                                          (this.#flexItems.cols[index] - 1)
                                        : 0;
                                if (this.options.gapColumn > gap)
                                    gap = this.options.gapColumn;
                                this.#columnsGap.push(gap);
                            }
                        );
                    } else {
                        let gap = this.options.width - this.#containerW;
                        gap = gap > 0 ? (gap /= this._childs.length - 1) : 0;
                        this.options.gapColumn += gap;
                    }
                    this.#flexRow();
                }
            }
            if (this.#isGrid) {
                let gap =
                    this.options.width -
                    this.#gridItems.width.reduce((a, c) => a + c, 0);
                const nCols =
                    this.#gridItems.nCols - 1 !== 0
                        ? this.#gridItems.nCols - 1
                        : 1;

                this.options.gapColumn += gap > 0 ? gap / nCols : 0;
                this.#gridLayout();
            }
        };
        const _func2 = () => {
            if (this.#isOutofLayout && this.#isWrap && !this.#isGrid) {
                if (this.#isFlexCol) {
                    let gap = this.options.width - this.#containerW;
                    this.options.gapColumn =
                        gap > 0 ? gap / (this.#flexItems.cols.length - 1) : 0;
                    this.#flexColumn();
                } else {
                    let gap = this.options.height - this.#containerH;
                    this.options.gapRow =
                        gap > 0 ? gap / (this.#flexItems.rows.length - 1) : 0;
                    this.#flexRow();
                }
            }
            if (this.#isGrid) {
                let gap =
                    this.options.height -
                    this.#gridItems.height.reduce((a, c) => a + c, 0);
                const nRows =
                    this.#gridItems.nRows - 1 !== 0
                        ? this.#gridItems.nRows - 1
                        : 1;
                this.options.gapRow += gap > 0 ? gap / nRows : 0;
                this.#gridLayout();
            }
        };

        this.#checkLayoutType(_type, _func1, _func2);
    }
    #spaceAround(_type: TypeContent) {
        const _func1 = () => {
            if (this.#isOutofLayout && !this.#isGrid) {
                if (this.#isFlexCol) {
                    if (this.#isWrap) {
                        this.#flexItems.height.forEach(
                            (item: number, index: number) => {
                                const cols = this.#flexItems.rows[index];
                                let gap = this.options.height - item;
                                gap = gap > 0 ? gap / cols : 0;
                                if (this.options.gapRow > gap)
                                    gap = this.options.gapRow;
                                this.#rowsGap.push(gap);
                                this.#startYPos.push(gap / 2);
                            }
                        );
                    } else {
                        let gap = this.options.height - this.#containerH;
                        gap = gap > 0 ? gap / this._childs.length : 0;
                        this.options.gapRow = gap;
                        this.#startY = gap / 2;
                    }
                    this.#flexColumn();
                } else {
                    if (this.#isWrap) {
                        this.#flexItems.width.forEach(
                            (item: number, index: number) => {
                                const cols = this.#flexItems.cols[index];
                                let gap = this.options.width - item;
                                gap = gap > 0 ? gap / cols : 0;
                                if (this.options.gapColumn > gap)
                                    gap = this.options.gapColumn;
                                this.#columnsGap.push(gap);
                                this.#startXPos.push(gap / 2);
                            }
                        );
                    } else {
                        let gap = this.options.width - this.#containerW;
                        gap = gap > 0 ? gap / this._childs.length : 0;
                        this.options.gapColumn = gap;
                        this.#startX = gap / 2;
                    }
                    this.#flexRow();
                }
            }
            if (this.#isGrid) {
                let gap =
                    this.options.width -
                    this.#gridItems.width.reduce((a, c) => a + c, 0);
                gap = gap > 0 ? gap / this.#gridItems.nCols : 0;
                this.options.gapColumn = gap;
                this.#startX = gap / 2;
                this.#gridLayout();
            }
        };
        const _func2 = () => {
            if (this.#isGrid) {
                let gap =
                    this.options.height -
                    this.#gridItems.height.reduce((a, c) => a + c, 0);
                gap = gap > 0 ? gap / this.#gridItems.nRows : 0;
                this.options.gapRow = gap;
                this.#startY = gap / 2;
                this.#gridLayout();
            } else {
                if (this.#isWrap) {
                    if (this.#isFlexCol) {
                        let gap = this.options.width - this.#containerW;
                        gap = gap > 0 ? gap / this.#flexItems.cols.length : 0;
                        this.options.gapColumn = gap;
                        this.#startX = gap / 2;
                        this.#flexColumn();
                    } else {
                        let gap = this.options.height - this.#containerH;
                        gap = gap > 0 ? gap / this.#flexItems.rows.length : 0;
                        this.options.gapRow = gap;
                        this.#startY = gap / 2;
                        this.#flexRow();
                    }
                }
            }
        };

        this.#checkLayoutType(_type, _func1, _func2);
    }
    #spaceEvenly(_type: TypeContent) {
        const _func1 = () => {
            if (this.#isOutofLayout && !this.#isGrid) {
                if (this.#isFlexCol) {
                    if (this.#isWrap) {
                        this.#flexItems.height.forEach(
                            (item: number, index: number) => {
                                const rows = this.#flexItems.rows[index];
                                let gap = this.options.height - item;
                                gap = gap > 0 ? gap / (rows + 1) : 0;
                                if (this.options.gapRow > gap)
                                    gap = this.options.gapRow;
                                this.#rowsGap.push(gap);
                                this.#startYPos.push(gap);
                            }
                        );
                    } else {
                        let gap = this.options.height - this.#containerH;
                        gap = gap > 0 ? gap / this._childs.length + 1 : 0;
                        this.options.gapRow += gap;
                        this.#startY = gap;
                    }
                    this.#flexColumn();
                } else {
                    if (this.#isWrap) {
                        this.#flexItems.width.forEach(
                            (item: number, index: number) => {
                                const cols = this.#flexItems.cols[index];
                                let gap = this.options.width - item;
                                gap = gap > 0 ? gap / (cols + 1) : 0;
                                if (this.options.gapColumn > gap)
                                    gap = this.options.gapColumn;
                                this.#columnsGap.push(gap);
                                this.#startXPos.push(gap);
                            }
                        );
                    } else {
                        let gap = this.options.width - this.#containerW;
                        gap = gap > 0 ? gap / (this._childs.length + 1) : 0;
                        this.options.gapColumn += gap;
                        this.#startX = gap;
                    }
                    this.#flexRow();
                }
            }
            if (this.#isGrid) {
                let gap =
                    this.options.width -
                    this.#gridItems.width.reduce((a, c) => a + c, 0);
                gap = gap > 0 ? gap / (this.#gridItems.nCols + 1) : 0;
                this.options.gapColumn = gap;
                this.#startX = gap;
                this.#gridLayout();
            }
        };
        const _func2 = () => {
            if (this.#isGrid) {
                let gap =
                    this.options.height -
                    this.#gridItems.height.reduce((a, c) => a + c, 0);
                gap = gap > 0 ? gap / (this.#gridItems.nRows + 1) : 0;
                this.options.gapRow = gap;
                this.#startY = gap;
                this.#gridLayout();
            } else {
                if (this.#isWrap) {
                    if (this.#isFlexCol) {
                        let gap = this.options.width - this.#containerW;
                        gap =
                            gap > 0
                                ? gap / (this.#flexItems.cols.length + 1)
                                : 0;
                        this.options.gapColumn = gap;
                        this.#startX = gap;
                        this.#flexColumn();
                    } else {
                        let gap = this.options.height - this.#containerH;
                        gap =
                            gap > 0
                                ? gap / (this.#flexItems.rows.length + 1)
                                : 0;
                        this.options.gapRow = gap;
                        this.#startY = gap;
                        this.#flexRow();
                    }
                }
            }
        };

        this.#checkLayoutType(_type, _func1, _func2);
    }

    #flexRow() {
        const blocks = this._childs as BlockElements[];
        blocks.sort((a, b) => a.options.order - b.options.order);

        let idx = 0;
        let col = 0;

        let rowIdx = 0;

        let blocksW = 0;
        let blocksH = 0;

        let wrapWidth = 0;
        let sharedColumnGap = 0;
        let dumpSharedColumnGap = 0;

        let sumWidths = 0;

        let startX =
            this.#startXPos[rowIdx] !== undefined
                ? this.#startXPos[rowIdx]
                : this.#startX;

        let startY = this.#startY;

        let gapCol =
            this.#columnsGap[rowIdx] !== undefined
                ? this.#columnsGap[rowIdx]
                : this.options.gapColumn;
        let gapRow =
            this.#rowsGap[rowIdx] !== undefined
                ? this.#rowsGap[rowIdx]
                : this.options.gapRow;
        if (!this.#isWrap) {
            sumWidths = blocks.reduce(
                (prev, curr) => prev + curr.options.width,
                0
            );
            let diffShrink = this.options.width - sumWidths;
            dumpSharedColumnGap = sharedColumnGap =
                Math.abs(diffShrink) / blocks.length;
            if (sumWidths > this.options.width) {
                let allShrinkSum = 0;
                let allDiff = 0;
                blocks.forEach((item) => {
                    if (item.options.flexShrink !== 0) {
                        if (
                            item.options.width -
                                sharedColumnGap * item.options.flexShrink >
                            0
                        ) {
                            allShrinkSum += item.options.flexShrink;
                            allDiff += 1;
                        }
                    }
                });
                if (diffShrink < 0 && allShrinkSum > 1) {
                    sharedColumnGap -=
                        (sharedColumnGap * allShrinkSum -
                            sharedColumnGap * allDiff) /
                        (blocks.length - allDiff);
                }
                sharedColumnGap = Math.abs(sharedColumnGap);
            }
        }
        let flexAdjust = [];
        while (blocks.length > idx) {
            let block = blocks[idx];

            if (this.#isWrap) wrapWidth += block.options.width;
            if (wrapWidth > this.options.width || blocks.length - 1 === idx) {
                let ccCol = col;
                if (blocks.length - 1 === idx) ccCol += 1;
                else ccCol -= 1;
                let diff = this.options.width - (blocksW + gapCol * ccCol);
                if (blocks.length - 1 === idx) {
                    diff -= block.options.width;
                    if (block.options.flexGrow)
                        flexAdjust.push({
                            idx: idx,
                            grow: block.options.flexGrow,
                        });
                }
                if (diff > 0 && diff !== 0 && flexAdjust.length !== 0) {
                    const sumOf = flexAdjust.reduce((p, c) => p + c.grow, 0);
                    flexAdjust.forEach((item) => {
                        blocks[item.idx].options.width +=
                            (diff / sumOf) * item.grow;
                    });
                    startX =
                        this.#startXPos[rowIdx] !== undefined
                            ? this.#startXPos[rowIdx]
                            : this.#startX;
                    idx = idx - col;
                    wrapWidth = 0;
                    blocksW = 0;
                    blocksH = 0;
                    col = 0;
                    continue;
                }
            }

            if (this.#isWrap) {
                if (wrapWidth > this.options.width) {
                    rowIdx += 1;
                    startY += blocksH + gapRow;

                    startX =
                        this.#startXPos[rowIdx] !== undefined
                            ? this.#startXPos[rowIdx]
                            : this.#startX;
                    gapCol =
                        this.#columnsGap[rowIdx] !== undefined
                            ? this.#columnsGap[rowIdx]
                            : this.options.gapColumn;

                    wrapWidth = block.options.width;

                    if (this.#isNew) {
                        this.#flexItems.width.push(blocksW);
                        this.#flexItems.height.push(blocksH);
                        this.#flexItems.cols.push(col);
                        this.#flexItems.rows.push(1);
                    }

                    blocksW = 0;
                    blocksH = 0;
                    col = 0;
                    flexAdjust = [];
                }
            }

            let endX = block.options.width;
            let gap = sharedColumnGap;
            if (!this.#isFlexCol && !this.#isWrap) {
                if (block.options.flexShrink)
                    gap = dumpSharedColumnGap * block.options.flexShrink;

                if (idx !== blocks.length - 1) endX -= gap + gapCol;
                else endX -= gap;

                if (endX < 0) {
                    // startX += endX;
                    endX = 0;
                }
            }

            block.initCords.x = startX;
            block.options.x = startX;
            block.options.width = endX;

            block.initCords.y = startY;
            block.options.y = startY;
            block.options.height = block.options.height;

            if (block.options.flexBasis !== "auto")
                block.options.width = block.options.flexBasis;

            if (this.#startYPos[idx] !== undefined) {
                block.initCords.y = startY + this.#startYPos[idx];
                block.options.y = startY + this.#startYPos[idx];
            }

            block.__adjustCordinates();

            blocksW += block.options.width;
            blocksH =
                blocksH < block.options.height ? block.options.height : blocksH;

            if (block.options.flexGrow)
                flexAdjust.push({ idx: idx, grow: block.options.flexGrow });

            startX += gapCol + block.options.width;
            idx += 1;
            col += 1;
            wrapWidth += gapCol;
        }

        if (this.#isNew) {
            this.#flexItems.width.push(blocksW);
            this.#flexItems.height.push(blocksH);
            this.#flexItems.cols.push(col);
            this.#flexItems.rows.push(1);

            if (this.#isWrap) {
                this.#containerH = this.#flexItems.height.reduce(
                    (p, c) => p + c,
                    0
                );
                this.#containerW = Math.max(...this.#flexItems.width);
            } else {
                this.#containerH = Math.max(...this.#flexItems.height);
                this.#containerW = sumWidths;
            }
        }
        this.#isNew = false;
    }

    #flexRowReverse() {
        if (this.#isWrap) {
            let idx = 0;
            let width = 0;

            let dublicate: any = [];
            let childs: any = [];

            const blocks = this._childs as any;

            while (blocks.length > idx) {
                const block = blocks[idx];
                width += block.options.width;
                if (width > this.options.width) {
                    dublicate.reverse();
                    childs.push(...dublicate);
                    dublicate = [];
                    width = 0;
                }
                width += this.options.gapColumn;
                dublicate.push(block);
                idx += 1;
            }
            dublicate.reverse();
            this._childs = [...childs, ...dublicate];
        } else {
            this._childs.reverse();
        }
        this.#flexRow();
    }

    #flexColumn() {
        const blocks = this._childs as BlockElements[];
        blocks.sort((a, b) => a.options.order - b.options.order);

        let idx = 0;
        let row = 0;

        let colIdx = 0;

        let blocksW = 0;
        let blocksH = 0;

        let wrapHeight = 0;

        let sumHeights = 0;

        let sharedRowGap = 0;
        let dumpSharedRowGap = 0;

        let startX = this.#startX;
        let startY =
            this.#startYPos[colIdx] !== undefined
                ? this.#startYPos[colIdx]
                : this.#startY;

        let gapCol =
            this.#columnsGap[colIdx] !== undefined
                ? this.#columnsGap[colIdx]
                : this.options.gapColumn;
        let gapRow =
            this.#rowsGap[colIdx] !== undefined
                ? this.#rowsGap[colIdx]
                : this.options.gapRow;

        if (!this.#isWrap) {
            sumHeights = blocks.reduce(
                (prev, curr) => prev + curr.options.height,
                0
            );
            let diffShrink = this.options.width - sumHeights;
            sharedRowGap =
                Math.abs(diffShrink) / blocks.length;
            if (sumHeights > this.options.height) {
                let allShrinkSum = 0;
                let allDiff = 0;
                dumpSharedRowGap = sharedRowGap =
                    Math.abs(diffShrink) / blocks.length;
                blocks.forEach((item) => {
                    if (item.options.flexShrink !== 0) {
                        if (
                            item.options.height -
                                sharedRowGap * item.options.flexShrink >
                            0
                        ) {
                            allShrinkSum += item.options.flexShrink;
                            allDiff += 1;
                        }
                    }
                });
                if (diffShrink < 0 && allShrinkSum > 1) {
                    sharedRowGap -=
                        (sharedRowGap * allShrinkSum - sharedRowGap * allDiff) /
                        (blocks.length - allDiff);
                }
                sharedRowGap = Math.abs(sharedRowGap);
            }
        }

        let flexAdjust = [];
        while (blocks.length > idx) {
            const block = blocks[idx];

            if (this.#isWrap) wrapHeight += block.options.height;

            if (wrapHeight > this.options.height || blocks.length - 1 === idx) {
                let rrRow = row;
                if (blocks.length - 1 === idx) rrRow += 1;
                else rrRow -= 1;
                let diff = this.options.height - (blocksH + gapRow * rrRow);
                if (blocks.length - 1 === idx) {
                    diff -= block.options.height;
                    if (block.options.flexGrow)
                        flexAdjust.push({
                            idx: idx,
                            grow: block.options.flexGrow,
                        });
                }
                if (diff > 0 && diff !== 0 && flexAdjust.length !== 0) {
                    const sumOf = flexAdjust.reduce((p, c) => p + c.grow, 0);
                    flexAdjust.forEach((item) => {
                        blocks[item.idx].options.height +=
                            (diff / sumOf) * item.grow;
                    });
                    startY =
                        this.#startYPos[colIdx] !== undefined
                            ? this.#startYPos[colIdx]
                            : this.#startY;
                    idx = idx - row;
                    wrapHeight = 0;
                    blocksW = 0;
                    blocksH = 0;
                    row = 0;
                    continue;
                }
            }

            if (this.#isWrap) {
                if (wrapHeight > this.options.height) {
                    colIdx += 1;
                    startX += blocksW + gapCol;

                    startY =
                        this.#startYPos[colIdx] !== undefined
                            ? this.#startYPos[colIdx]
                            : this.#startY;

                    gapRow =
                        this.#rowsGap[colIdx] !== undefined
                            ? this.#rowsGap[colIdx]
                            : this.options.gapRow;

                    wrapHeight = block.options.height;

                    if (this.#isNew) {
                        this.#flexItems.width.push(blocksW);
                        this.#flexItems.height.push(blocksH);
                        this.#flexItems.rows.push(row);
                        this.#flexItems.cols.push(1);
                    }
                    blocksW = 0;
                    blocksH = 0;
                    row = 0;
                    flexAdjust = [];
                }
            }

            let endY = block.options.height;
            let gap = sharedRowGap;
            if (sharedRowGap) {
                if (block.options.flexShrink)
                    gap = dumpSharedRowGap * block.options.flexShrink;
                if (idx !== blocks.length - 1) endY -= gap + gapRow;
                else endY -= gap;

                if (endY < 0) {
                    // startY += endY;
                    endY = 0;
                }
            }
            block.initCords.y = startY;
            block.options.y = startY;
            block.options.height = endY;

            block.initCords.x = startX;
            block.options.x = startX;
            block.options.width = block.options.width;

            if (block.options.flexBasis !== "auto")
                block.options.height = block.options.flexBasis;

            if (this.#startXPos[idx] !== undefined)
                block.initCords.x = startX + this.#startXPos[idx];

            block.options.x = startX + this.#startXPos[idx];

            block.__adjustCordinates();

            if (block.options.flexGrow)
                flexAdjust.push({ idx: idx, grow: block.options.flexGrow });

            blocksW =
                blocksW <= block.options.width ? block.options.width : blocksW;
            blocksH += block.options.height;

            startY += gapRow + block.options.height;
            idx += 1;
            row += 1;
            wrapHeight += gapRow;
        }
        if (this.#isNew) {
            this.#flexItems.width.push(blocksW);
            this.#flexItems.height.push(blocksH);
            this.#flexItems.rows.push(row);
            this.#flexItems.cols.push(1);

            if (this.#isWrap) {
                this.#containerH = Math.max(...this.#flexItems.height);
                this.#containerW = this.#flexItems.width.reduce(
                    (p, c) => p + c,
                    0
                );
            } else {
                this.#containerH = sumHeights;
                this.#containerW = Math.max(...this.#flexItems.width);
            }
        }
        this.#isNew = false;
    }
    #flexColumnReverse() {
        if (this.#isWrap) {
            let idx = 0;
            let height = 0;

            let dublicate: any = [];
            let childs: any = [];

            const blocks = this._childs as any;

            while (blocks.length > idx) {
                const block = blocks[idx];
                height += block.options.height + this.options.gapRow;
                if (height > this.options.height) {
                    dublicate.reverse();
                    childs.push(...dublicate);
                    dublicate = [];
                    height = 0;
                }
                dublicate.push(block);
                idx += 1;
            }
            dublicate.reverse();
            this._childs = [...childs, ...dublicate];
        } else {
            this._childs.reverse();
        }
        this.#flexColumn();
    }
    gridTemplateColumns(opt?: number[]) {
        return this.__cacheOption(this.options.gridTemplateColumns, [], opt);
    }
    gridTemplateRows(opt?: number[]) {
        return this.__cacheOption(this.options.gridTemplateRows, [], opt);
    }

    #gridLayout() {
        const blocks = this._childs as BlockElements[];
        blocks.sort((a, b) => a.options.order - b.options.order);

        let startX = this.#startX;
        let cols = this.options.gridTemplateColumns || [0];

        const autoWidths = cols.filter((item: any) => item !== "auto");
        let rWidth = autoWidths.reduce((p: number, c: number) => p + c, 0);
        const diffCol = Math.abs(cols.length - autoWidths.length);
        if (diffCol) rWidth = (this.options.width - rWidth) / diffCol;
        else rWidth = this.options.width / cols.length;

        const autoHeights = this.options.gridTemplateRows.filter(
            (item: any) => item !== "auto"
        );
        const nRows = Math.ceil(blocks.length / cols.length);
        let rHeight = autoHeights.reduce((p: number, c: number) => p + c, 0);
        const diffRow = Math.abs(nRows - autoHeights.length);
        if (diffRow) rHeight = (this.options.height - rHeight) / diffRow;
        else rHeight = this.options.height / nRows;

        const maxColWidths: number[] = [];
        const maxRowHeights: number[] = [];

        this.#gridItems.nRows = nRows;
        this.#gridItems.nCols = cols.length;
        for (let colIdx = 0; colIdx < this.#gridItems.nCols; colIdx++) {
            let startY = this.#startY;

            for (let rowIdx = 0; rowIdx < this.#gridItems.nRows; rowIdx++) {
                let colStart = 0;
                let rowStart = 0;

                const idx =
                    (this.#gridItems.nCols - 1) * rowIdx + rowIdx + colIdx;
                const block = blocks[idx];
                if (!block) continue;

                if (maxColWidths[colIdx]) {
                    if (maxColWidths[colIdx] < block.options.width)
                        maxColWidths[colIdx] = block.options.width;
                    else if (
                        !this.options.justifyContent &&
                        rWidth > maxColWidths[colIdx]
                    )
                        maxColWidths[colIdx] = rWidth;
                } else maxColWidths.push(block.options.width);

                if (!maxRowHeights[rowIdx])
                    maxRowHeights.push(block.options.height);

                if (maxRowHeights[rowIdx] < block.options.height)
                    maxRowHeights[rowIdx] = block.options.height;
                else if (
                    !this.options.alignContent &&
                    rHeight > maxRowHeights[rowIdx]
                )
                    maxRowHeights[rowIdx] = rHeight;

                let endX = block.options.width;

                if (cols[colIdx] === "auto" || !cols[colIdx]) {
                    if (endX) colStart = maxColWidths[colIdx];
                    else colStart = endX = rWidth;
                } else {
                    colStart = cols[colIdx];
                    if (!endX) endX = colStart;
                }

                let endY = block.options.height;
                if (
                    this.options.gridTemplateRows[rowIdx] === "auto" ||
                    !this.options.gridTemplateRows[rowIdx]
                ) {
                    if (endY) rowStart = maxRowHeights[rowIdx];
                    else rowStart = endY = rHeight;
                } else {
                    rowStart = this.options.gridTemplateRows[rowIdx];
                    if (!endY) endY = rowStart;
                }

                // if(block.options.gridColumnStart && block.options.gridColumnStart !== colIdx) continue

                block.options.width = endX;
                block.options.height = endY;
                block.initCords.x = startX;
                block.options.x = startX;
                block.initCords.y = startY;
                block.options.y = startY;

                if (this.#startYPos[idx] !== undefined) {
                    block.initCords.y += this.#startYPos[idx];
                    block.options.y += this.#startYPos[idx];
                }

                if (this.#startXPos[idx]) {
                    block.initCords.x += this.#startXPos[idx];
                    block.options.x += this.#startXPos[idx];
                }

                block.__adjustCordinates();

                startY += rowStart + this.options.gapRow;
            }
            startX += maxColWidths[colIdx] + this.options.gapColumn;
            if (this.#isNew) this.#gridItems.width.push(maxColWidths[colIdx]);
        }
        if (this.#isNew) this.#gridItems.height.push(...maxRowHeights);
        this.#isNew = false;
    }
}
