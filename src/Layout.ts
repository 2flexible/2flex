import { Block } from "./Block";
import {
    IBlock,
    BlockElements,
    FlexGrow,
    FlexShrink,
    FlexBasis,
} from "./types";

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

type GridAutoFlow = "row" | "column" | "dense" | "row dense" | "column dense";

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

    gridAutoRows?: number[];
    gridAutoColumns?: number[];

    // @Todo: need to impliment
    gridAutoFlow: GridAutoFlow;

    justifyItems: JustifyItems;
}
type ILayout = "flex" | "inline-flex" | "grid" | "inline-grid";

interface LayoutOptions extends GridLayout, FlexLayout {
    layout: ILayout;
    justifyContent: JustifyContent;
    alignContent: AlignContent;
    alignItems: AlignItems;
    placeContent: PlaceContent;
    placeItems: PlaceItems;
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
        this.options = options;
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
            if (!this.canvasInit.width)
                this.canvasInit.width = (
                    this._childs as BlockElements[]
                ).reduce((prev, curr) => prev + curr.canvasInit.width, 0);

            if (!this.canvasInit.height)
                this.canvasInit.height = (
                    this._childs as BlockElements[]
                ).reduce((prev, curr) => prev + curr.canvasInit.height, 0);
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
        const flex = this.__cacheOption(opt, this.options.flex, 0);
        this.flexGrow(flex[0]);
        this.flexShrink(flex[1]);
        this.flexBasis(flex[2]);
        return flex;
    }
    flexFlow(opt?: FlexFlow) {
        const flexFlow = this.__cacheOption(opt, this.options.flexFlow, 0);
        this.flexDirection(flexFlow[0]);
        this.flexWrap(flexFlow[1]);
        return flexFlow;
    }
    flexGrow(opt?: FlexGrow) {
        return this.__cacheOption(opt, this.options.flexGrow, 0);
    }
    flexShrink(opt?: FlexShrink) {
        return this.__cacheOption(opt, this.options.flexShrink, 0);
    }
    flexBasis(opt?: FlexBasis) {
        return this.__cacheOption(opt, this.options.flexBasis, 0);
    }
    flexDirection(opt?: FlexDirecton) {
        return this.__cacheOption(opt, this.options.flexDirection, 0);
    }
    flexWrap(opt?: FlexWrap) {
        return this.__cacheOption(opt, this.options.flexWrap, "nowrap");
    }
    placeContent(opt?: PlaceContent) {
        this.alignContent(opt);
        this.justifyContent(opt);
        return this.__cacheOption(opt, this.options.placeContent, 0);
    }
    placeItems(opt?: PlaceItems) {
        this.alignItems(opt);
        this.justifyItems(opt);
        return this.__cacheOption(opt, this.options.placeItems, 0);
    }
    gap(opt?: number | number[]) {
        const gap = this.__cacheOption(opt, this.options.gapColumn, 0);
        if (opt instanceof Array) {
            this.gapColumn(opt[0] || gap);
            this.gapRow(opt[1] || gap);
        } else {
            this.gapColumn(gap);
            this.gapRow(gap);
        }
        return gap;
    }
    gridTemplate(opt?: number[]) {
        const gridTemplate = this.__cacheOption(
            opt,
            this.options.gridTemplate,
            []
        );
        this.gridTemplateRows(gridTemplate[0]);
        this.gridTemplateColumns(gridTemplate[1]);
        return gridTemplate;
    }
    gridAutoFlow(opt?: GridAutoFlow) {
        return this.__cacheOption(opt, this.options.gridAutoFlow, "row")
    }
    gridTemplateColumns(opt?: number[]) {
        return this.__cacheOption(opt, this.options.gridTemplateColumns, []);
    }
    gridTemplateRows(opt?: number[]) {
        return this.__cacheOption(this.options.gridTemplateRows, [], opt);
    }

    gapColumn(opt?: number) {
        return this.__cacheOption(opt, this.options.gapColumn, 0);
    }
    gapRow(opt?: number) {
        return this.__cacheOption(opt, this.options.gapRow, 0);
    }
    columnStart(opt?: number) {
        return this.__cacheOption(opt, this.options.columnStart, 1);
    }
    columnEnd(opt?: number) {
        return this.__cacheOption(opt, this.options.columnEnd, 0);
    }
    justifyContent(opt?: JustifyContent) {
        const justifyContent = this.__cacheOption(
            opt,
            this.options.justifyContent,
            "normal"
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
            opt,
            this.options.justifyItems,
            "normal"
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
            opt,
            this.options.alignContent,
            "normal"
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
            opt,
            this.options.alignItems,
            "normal"
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
        return this.flexWrap() === "nowrap" ? false : true;
    }
    get #isOutofLayout() {
        if (
            this.canvasInit.height - this.#containerH > 0 &&
            this.canvasInit.width - this.#containerW > 0
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
                            let startY = this.canvasInit.height - item;
                            startY = startY >= 0 ? startY : 0;
                            this.#startYPos.push(startY);
                        });
                    } else {
                        const startY =
                            this.canvasInit.height - this.#containerH;
                        this.#startY = startY > 0 ? startY : 0;
                    }
                    this.#flexColumn();
                } else {
                    if (this.#isWrap) {
                        this.#flexItems.width.forEach((item: number) => {
                            let startX = this.canvasInit.width - item;
                            startX = startX >= 0 ? startX : 0;
                            this.#startXPos.push(startX);
                        });
                    } else {
                        const startX = this.canvasInit.width - this.#containerW;
                        this.#startX = startX > 0 ? startX : 0;
                    }
                    this.#flexRow();
                }
            }
            if (this.#isGrid) {
                this.#startX = Math.abs(
                    this.canvasInit.width -
                        this.#gridItems.width.reduce((a, c) => a + c, 0)
                );
                this.#gridLayout();
            }
        };
        const _func2 = () => {
            if (this.#isOutofLayout && this.#isWrap && !this.#isGrid) {
                if (this.#isFlexCol) {
                    const startX = this.canvasInit.width - this.#containerW;
                    this.#startX = startX > 0 ? startX : 0;
                    this.#flexColumn();
                } else {
                    const startY = this.canvasInit.height - this.#containerH;
                    this.#startY = startY > 0 ? startY : 0;
                    this.#flexRow();
                }
            }
            if (this.#isGrid) {
                this.#startY = Math.abs(
                    this.canvasInit.height -
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
                    let startX = width - blocks[idx].canvasInit.width;
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
                    let startY = height - blocks[idx].canvasInit.height;
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
                    let containerW = this.canvasInit.width - this.#containerW;
                    containerW =
                        containerW > 0 && !this.#isWrap ? containerW : 0;
                    this.#flexItems.width.forEach((item: number) => {
                        for (let i = 0; i < this.#flexItems.rows[idx]; i++) {
                            const block = (this._childs as any)[i + rows];

                            this.#startXPos.push(
                                containerW + (item - block.canvasInit.width)
                            );
                        }
                        rows += this.#flexItems.rows[idx];
                        idx++;
                    });
                    this.#flexColumn();
                } else {
                    let cols = 0;
                    let idx = 0;
                    let containerH = this.canvasInit.height - this.#containerH;
                    containerH =
                        containerH > 0 && !this.#isWrap ? containerH : 0;
                    this.#flexItems.height.forEach((item: number) => {
                        for (let i = 0; i < this.#flexItems.cols[idx]; i++) {
                            const block = (this._childs as any)[i + cols];
                            this.#startYPos.push(
                                containerH + (item - block.canvasInit.height)
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
                            let startY = this.canvasInit.height - item;
                            startY = startY > 0 ? startY : 0;
                            this.#startYPos.push(startY / 2);
                        });
                    } else {
                        const startY =
                            this.canvasInit.height - this.#containerH;
                        this.#startY = startY > 0 ? startY / 2 : 0;
                    }

                    this.#flexColumn();
                } else {
                    if (this.#isWrap) {
                        this.#flexItems.width.forEach((item: number) => {
                            let startX = this.canvasInit.width - item;
                            startX = startX > 0 ? startX : 0;
                            this.#startXPos.push(startX / 2);
                        });
                    } else {
                        const startX = this.canvasInit.width - this.#containerW;
                        this.#startX = startX > 0 ? startX / 2 : 0;
                    }

                    this.#flexRow();
                }
            }
            if (this.#isGrid) {
                let startX =
                    this.canvasInit.width / 2 -
                    this.#gridItems.width.reduce((a, c) => a + c, 0) / 2;
                this.#startX = startX > 0 ? startX : 0;
                this.#gridLayout();
            }
        };
        const _func2 = () => {
            if (this.#isGrid) {
                const startY =
                    this.canvasInit.height -
                    this.#gridItems.height.reduce((a, c) => a + c, 0);
                this.#startY = startY > 0 ? startY / this.#gridItems.nRows : 0;
                this.#gridLayout();
            } else {
                if (this.#isOutofLayout && this.#isWrap) {
                    if (this.#isFlexCol) {
                        const startX = this.canvasInit.width - this.#containerW;
                        this.#startX =
                            startX > 0
                                ? startX / this.#flexItems.cols.length
                                : 0;
                        this.#flexColumn();
                    } else {
                        const startY =
                            this.canvasInit.height - this.#containerH;
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
                        blocks[idx].canvasInit.width / 2;
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
                    let startY = height / 2 - blocks[idx].canvasInit.height / 2;
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
                    let containerW = this.canvasInit.width - this.#containerW;
                    containerW =
                        containerW > 0 && !this.#isWrap ? containerW : 0;
                    this.#flexItems.width.forEach((item: number) => {
                        for (let i = 0; i < this.#flexItems.rows[idx]; i++) {
                            const block = (this._childs as any)[i + rows];
                            this.#startXPos.push(
                                containerW / 2 +
                                    (item - block.canvasInit.width) / 2
                            );
                        }
                        rows += this.#flexItems.rows[idx];
                        idx++;
                    });
                    this.#flexColumn();
                } else {
                    let cols = 0;
                    let idx = 0;
                    let containerH = this.canvasInit.height - this.#containerH;
                    containerH =
                        containerH > 0 && !this.#isWrap ? containerH : 0;
                    this.#flexItems.height.forEach((item: number) => {
                        for (let i = 0; i < this.#flexItems.cols[idx]; i++) {
                            const block = (this._childs as any)[i + cols];
                            this.#startYPos.push(
                                containerH / 2 +
                                    (item - block.canvasInit.height) / 2
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
                                let gap = this.canvasInit.height - item;
                                gap =
                                    gap > 0
                                        ? gap /
                                          (this.#flexItems.rows[index] - 1)
                                        : 0;

                                if (this.gapRow() > gap) gap = this.gapRow();
                                this.#rowsGap.push(gap);
                            }
                        );
                    } else {
                        let gap = this.canvasInit.height - this.#containerH;
                        gap = gap > 0 ? (gap /= this._childs.length - 1) : 0;
                        this.options.gapRow = this.gapRow() + gap;
                    }
                    this.#flexColumn();
                } else {
                    if (this.#isWrap) {
                        this.#flexItems.width.forEach(
                            (item: number, index: number) => {
                                let gap = this.canvasInit.width - item;
                                gap =
                                    gap > 0
                                        ? gap /
                                          (this.#flexItems.cols[index] - 1)
                                        : 0;
                                if (this.gapColumn() > gap)
                                    gap = this.gapColumn();
                                this.#columnsGap.push(gap);
                            }
                        );
                    } else {
                        let gap = this.canvasInit.width - this.#containerW;
                        gap = gap > 0 ? (gap /= this._childs.length - 1) : 0;
                        this.options.gapColumn = this.gapColumn() + gap;
                    }
                    this.#flexRow();
                }
            }
            if (this.#isGrid) {
                let gap =
                    this.canvasInit.width -
                    this.#gridItems.width.reduce((a, c) => a + c, 0);
                const nCols =
                    this.#gridItems.nCols - 1 !== 0
                        ? this.#gridItems.nCols - 1
                        : 1;

                this.options.gapColumn =
                    this.gapColumn() + gap > 0 ? gap / nCols : 0;
                this.#gridLayout();
            }
        };
        const _func2 = () => {
            if (this.#isOutofLayout && this.#isWrap && !this.#isGrid) {
                if (this.#isFlexCol) {
                    let gap = this.canvasInit.width - this.#containerW;
                    this.options.gapColumn =
                        gap > 0 ? gap / (this.#flexItems.cols.length - 1) : 0;
                    this.#flexColumn();
                } else {
                    let gap = this.canvasInit.height - this.#containerH;
                    this.options.gapRow =
                        gap > 0 ? gap / (this.#flexItems.rows.length - 1) : 0;
                    this.#flexRow();
                }
            }
            if (this.#isGrid) {
                let gap =
                    this.canvasInit.height -
                    this.#gridItems.height.reduce((a, c) => a + c, 0);
                const nRows =
                    this.#gridItems.nRows - 1 !== 0
                        ? this.#gridItems.nRows - 1
                        : 1;
                this.options.gapRow = this.gapRow() + gap > 0 ? gap / nRows : 0;
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
                                let gap = this.canvasInit.height - item;
                                gap = gap > 0 ? gap / cols : 0;
                                if (this.gapRow() > gap) gap = this.gapRow();
                                this.#rowsGap.push(gap);
                                this.#startYPos.push(gap / 2);
                            }
                        );
                    } else {
                        let gap = this.canvasInit.height - this.#containerH;
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
                                let gap = this.canvasInit.width - item;
                                gap = gap > 0 ? gap / cols : 0;
                                if (this.gapColumn() > gap)
                                    gap = this.gapColumn();
                                this.#columnsGap.push(gap);
                                this.#startXPos.push(gap / 2);
                            }
                        );
                    } else {
                        let gap = this.canvasInit.width - this.#containerW;
                        gap = gap > 0 ? gap / this._childs.length : 0;
                        this.options.gapColumn = gap;
                        this.#startX = gap / 2;
                    }
                    this.#flexRow();
                }
            }
            if (this.#isGrid) {
                let gap =
                    this.canvasInit.width -
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
                    this.canvasInit.height -
                    this.#gridItems.height.reduce((a, c) => a + c, 0);
                gap = gap > 0 ? gap / this.#gridItems.nRows : 0;
                this.options.gapRow = gap;
                this.#startY = gap / 2;
                this.#gridLayout();
            } else {
                if (this.#isWrap) {
                    if (this.#isFlexCol) {
                        let gap = this.canvasInit.width - this.#containerW;
                        gap = gap > 0 ? gap / this.#flexItems.cols.length : 0;
                        this.options.gapColumn = gap;
                        this.#startX = gap / 2;
                        this.#flexColumn();
                    } else {
                        let gap = this.canvasInit.height - this.#containerH;
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
                                let gap = this.canvasInit.height - item;
                                gap = gap > 0 ? gap / (rows + 1) : 0;
                                if (this.gapRow() > gap) gap = this.gapRow();
                                this.#rowsGap.push(gap);
                                this.#startYPos.push(gap);
                            }
                        );
                    } else {
                        let gap = this.canvasInit.height - this.#containerH;
                        gap = gap > 0 ? gap / this._childs.length + 1 : 0;
                        this.options.gapRow = this.gapRow() + gap;
                        this.#startY = gap;
                    }
                    this.#flexColumn();
                } else {
                    if (this.#isWrap) {
                        this.#flexItems.width.forEach(
                            (item: number, index: number) => {
                                const cols = this.#flexItems.cols[index];
                                let gap = this.canvasInit.width - item;
                                gap = gap > 0 ? gap / (cols + 1) : 0;
                                if (this.gapColumn() > gap)
                                    gap = this.gapColumn();
                                this.#columnsGap.push(gap);
                                this.#startXPos.push(gap);
                            }
                        );
                    } else {
                        let gap = this.canvasInit.width - this.#containerW;
                        gap = gap > 0 ? gap / (this._childs.length + 1) : 0;
                        this.options.gapColumn = this.gapColumn() + gap;
                        this.#startX = gap;
                    }
                    this.#flexRow();
                }
            }
            if (this.#isGrid) {
                let gap =
                    this.canvasInit.width -
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
                    this.canvasInit.height -
                    this.#gridItems.height.reduce((a, c) => a + c, 0);
                gap = gap > 0 ? gap / (this.#gridItems.nRows + 1) : 0;
                this.options.gapRow = gap;
                this.#startY = gap;
                this.#gridLayout();
            } else {
                if (this.#isWrap) {
                    if (this.#isFlexCol) {
                        let gap = this.canvasInit.width - this.#containerW;
                        gap =
                            gap > 0
                                ? gap / (this.#flexItems.cols.length + 1)
                                : 0;
                        this.options.gapColumn = gap;
                        this.#startX = gap;
                        this.#flexColumn();
                    } else {
                        let gap = this.canvasInit.height - this.#containerH;
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
        const blocks = this._childs as Block[];
        blocks.sort(
            (a, b) => (a.options.order as number) - (b.options.order as number)
        );

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
                : this.gapColumn();
        let gapRow =
            this.#rowsGap[rowIdx] !== undefined
                ? this.#rowsGap[rowIdx]
                : this.gapRow();
        if (!this.#isWrap) {
            sumWidths = blocks.reduce(
                (prev, curr) => prev + curr.canvasInit.width,
                0
            );
            let diffShrink = this.canvasInit.width - sumWidths;
            dumpSharedColumnGap = sharedColumnGap =
                Math.abs(diffShrink) / blocks.length;
            if (sumWidths > this.canvasInit.width) {
                let allShrinkSum = 0;
                let allDiff = 0;
                blocks.forEach((item) => {
                    if (item.flexShrink() !== 0) {
                        if (
                            item.canvasInit.width -
                                sharedColumnGap * item.flexShrink() >
                            0
                        ) {
                            allShrinkSum += item.flexShrink();
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
            if (this.#isWrap) wrapWidth += block.canvasInit.width;
            if (
                wrapWidth > this.canvasInit.width ||
                blocks.length - 1 === idx
            ) {
                let ccCol = col;
                if (blocks.length - 1 === idx) ccCol += 1;
                else ccCol -= 1;
                let diff = this.canvasInit.width - (blocksW + gapCol * ccCol);
                if (blocks.length - 1 === idx) {
                    diff -= block.canvasInit.width;
                    if (block.flexGrow())
                        flexAdjust.push({
                            idx: idx,
                            grow: block.flexGrow(),
                        });
                }
                if (diff > 0 && diff !== 0 && flexAdjust.length !== 0) {
                    const sumOf = flexAdjust.reduce(
                        (p, c) => p + (c.grow as number),
                        0
                    );
                    flexAdjust.forEach((item) => {
                        blocks[item.idx].canvasInit.width =
                            blocks[item.idx].canvasInit.width +
                            (diff / sumOf) * (item.grow as number);
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
                if (wrapWidth > this.canvasInit.width) {
                    rowIdx += 1;
                    startY += blocksH + gapRow;

                    startX =
                        this.#startXPos[rowIdx] !== undefined
                            ? this.#startXPos[rowIdx]
                            : this.#startX;
                    gapCol =
                        this.#columnsGap[rowIdx] !== undefined
                            ? this.#columnsGap[rowIdx]
                            : this.gapColumn();

                    wrapWidth = block.canvasInit.width;

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

            let endX = block.canvasInit.width;
            let gap = sharedColumnGap;
            if (!this.#isWrap) {
                if (block.flexShrink())
                    gap = dumpSharedColumnGap * block.flexShrink();

                if (idx !== blocks.length - 1) endX -= gap + gapCol;
                else endX -= gap;

                if (endX < 0) {
                    // startX += endX;
                    endX = 0;
                }
            }
            block.canvasInit.x = startX;
            block.canvasInit.y = startY;
            block.canvasInit.width = endX;

            if (block.flexBasis() !== "auto")
                block.canvasInit.width = block.flexBasis() as number;

            if (this.#startYPos[idx] !== undefined) {
                block.canvasInit.y = startY + this.#startYPos[idx];
                block.canvasInit.y = startY + this.#startYPos[idx];
            }

            block.__adjustCordinates();

            blocksW += block.canvasInit.width;
            blocksH =
                blocksH < block.canvasInit.height
                    ? block.canvasInit.height
                    : blocksH;

            if (block.flexGrow())
                flexAdjust.push({ idx: idx, grow: block.flexGrow() });
            startX += gapCol + block.canvasInit.width;
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
                width += block.canvasInit.width;
                if (width > this.canvasInit.width) {
                    dublicate.reverse();
                    childs.push(...dublicate);
                    dublicate = [];
                    width = 0;
                }
                width += this.gapColumn();
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
        blocks.sort(
            (a, b) => (a.options.order as number) - (b.options.order as number)
        );

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
                : this.gapColumn();
        let gapRow =
            this.#rowsGap[colIdx] !== undefined
                ? this.#rowsGap[colIdx]
                : this.gapRow();

        if (!this.#isWrap) {
            sumHeights = blocks.reduce(
                (prev, curr) => prev + curr.canvasInit.height,
                0
            );
            let diffShrink = this.canvasInit.width - sumHeights;
            sharedRowGap = Math.abs(diffShrink) / blocks.length;
            if (sumHeights > this.canvasInit.height) {
                let allShrinkSum = 0;
                let allDiff = 0;
                dumpSharedRowGap = sharedRowGap =
                    Math.abs(diffShrink) / blocks.length;
                blocks.forEach((item) => {
                    if (item.flexShrink() !== 0) {
                        if (
                            item.canvasInit.height -
                                sharedRowGap * item.flexShrink() >
                            0
                        ) {
                            allShrinkSum += item.flexShrink();
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

            if (this.#isWrap) wrapHeight += block.canvasInit.height;

            if (
                wrapHeight > this.canvasInit.height ||
                blocks.length - 1 === idx
            ) {
                let rrRow = row;
                if (blocks.length - 1 === idx) rrRow += 1;
                else rrRow -= 1;
                let diff = this.canvasInit.height - (blocksH + gapRow * rrRow);
                if (blocks.length - 1 === idx) {
                    diff -= block.canvasInit.height;
                    if (block.flexGrow())
                        flexAdjust.push({
                            idx: idx,
                            grow: block.flexGrow(),
                        });
                }
                if (diff > 0 && diff !== 0 && flexAdjust.length !== 0) {
                    const sumOf = flexAdjust.reduce(
                        (p, c) => p + (c.grow as number),
                        0
                    );
                    flexAdjust.forEach((item) => {
                        blocks[item.idx].canvasInit.height =
                            blocks[item.idx].canvasInit.height +
                            (diff / sumOf) * (item.grow as number);
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
                if (wrapHeight > this.canvasInit.height) {
                    colIdx += 1;
                    startX += blocksW + gapCol;

                    startY =
                        this.#startYPos[colIdx] !== undefined
                            ? this.#startYPos[colIdx]
                            : this.#startY;

                    gapRow =
                        this.#rowsGap[colIdx] !== undefined
                            ? this.#rowsGap[colIdx]
                            : this.gapRow();

                    wrapHeight = block.canvasInit.height;

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

            let endY = block.canvasInit.height;
            let gap = sharedRowGap;
            if (sharedRowGap) {
                if (block.flexShrink())
                    gap = dumpSharedRowGap * block.flexShrink();
                if (idx !== blocks.length - 1) endY -= gap + gapRow;
                else endY -= gap;

                if (endY < 0) {
                    // startY += endY;
                    endY = 0;
                }
            }
            block.canvasInit.y = startY;
            block.canvasInit.x = startX;
            block.canvasInit.height = endY;

            if (block.flexBasis() !== "auto")
                block.canvasInit.height = block.flexBasis() as number;

            if (this.#startXPos[idx] !== undefined)
                block.canvasInit.x = startX + this.#startXPos[idx];

            block.canvasInit.x = startX + this.#startXPos[idx];

            block.__adjustCordinates();

            if (block.flexGrow())
                flexAdjust.push({ idx: idx, grow: block.flexGrow() });

            blocksW =
                blocksW <= block.canvasInit.width
                    ? block.canvasInit.width
                    : blocksW;
            blocksH += block.canvasInit.height;

            startY += gapRow + block.canvasInit.height;
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
                height += block.canvasInit.height + this.gapRow();
                if (height > this.canvasInit.height) {
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
    #gridLayout() {
        const blocks = this._childs as BlockElements[];
        blocks.sort(
            (a, b) => (a.options.order as number) - (b.options.order as number)
        );

        let startX = this.#startX;
        let cols = this.gridTemplateColumns() || [0];

        const autoWidths = cols.filter((item: any) => item !== "auto");
        let rWidth = autoWidths.reduce((p: number, c: number) => p + c, 0);
        const diffCol = Math.abs(cols.length - autoWidths.length);
        if (diffCol) rWidth = (this.canvasInit.width - rWidth) / diffCol;
        else rWidth = this.canvasInit.width / cols.length;

        const autoHeights = this.gridTemplateRows().filter(
            (item: any) => item !== "auto"
        );
        const nRows = Math.ceil(blocks.length / cols.length);
        let rHeight = autoHeights.reduce((p: number, c: number) => p + c, 0);
        const diffRow = Math.abs(nRows - autoHeights.length);
        if (diffRow) rHeight = (this.canvasInit.height - rHeight) / diffRow;
        else rHeight = this.canvasInit.height / nRows;

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
                    if (maxColWidths[colIdx] < block.canvasInit.width)
                        maxColWidths[colIdx] = block.canvasInit.width;
                    else if (
                        !this.justifyContent() &&
                        rWidth > maxColWidths[colIdx]
                    )
                        maxColWidths[colIdx] = rWidth;
                } else maxColWidths.push(block.canvasInit.width);

                if (!maxRowHeights[rowIdx])
                    maxRowHeights.push(block.canvasInit.height);

                if (maxRowHeights[rowIdx] < block.canvasInit.height)
                    maxRowHeights[rowIdx] = block.canvasInit.height;
                else if (
                    !this.alignContent() &&
                    rHeight > maxRowHeights[rowIdx]
                )
                    maxRowHeights[rowIdx] = rHeight;

                let endX = block.canvasInit.width;

                if (cols[colIdx] === "auto" || !cols[colIdx]) {
                    if (endX) colStart = maxColWidths[colIdx];
                    else colStart = endX = rWidth;
                } else {
                    colStart = cols[colIdx];
                    if (!endX) endX = colStart;
                }

                let endY = block.canvasInit.height;
                if (
                    this.gridTemplateRows()[rowIdx] === "auto" ||
                    !this.gridTemplateRows()[rowIdx]
                ) {
                    if (endY) rowStart = maxRowHeights[rowIdx];
                    else rowStart = endY = rHeight;
                } else {
                    rowStart = this.gridTemplateRows()[rowIdx];
                    if (!endY) endY = rowStart;
                }

                // if(block.options.gridColumnStart && block.options.gridColumnStart !== colIdx) continue

                block.canvasInit.width = endX;
                block.canvasInit.height = endY;
                block.canvasInit.x = startX;
                block.canvasInit.y = startY;

                if (this.#startYPos[idx] !== undefined) {
                    block.canvasInit.y += this.#startYPos[idx];
                    // block.canvasInit.y = block.y() + this.#startYPos[idx];
                }

                if (this.#startXPos[idx]) {
                    block.canvasInit.x += this.#startXPos[idx];
                    // block.canvasInit.x = block.x() + this.#startXPos[idx];
                }

                block.__adjustCordinates();

                startY += rowStart + this.gapRow();
            }
            startX += maxColWidths[colIdx] + this.gapColumn();
            if (this.#isNew) this.#gridItems.width.push(maxColWidths[colIdx]);
        }
        if (this.#isNew) this.#gridItems.height.push(...maxRowHeights);
        this.#isNew = false;
    }
}
