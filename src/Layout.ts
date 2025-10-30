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
    wrap: "nowrap",
    flexDirection: "row",
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
    #startX: number = 0;
    #startY: number = 0;

    #startXPos: number[] = [];
    #startYPos: number[] = [];

    #columnsGap: number[] = [];
    #rowsGap: number[] = [];

    #isNew: boolean = true;

    #containerW: number = 0;
    #containerH: number = 0;

    #rows: {
        nItems: number;
        width: number[];
        height: number[];
        cols: number[];
    } = { nItems: 0, width: [], height: [], cols: [] };

    #cols: {
        nItems: number;
        width: number[];
        height: number[];
        rows: number[];
    } = { nItems: 0, width: [], height: [], rows: [] };

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
            this.#gridLayout()
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
            if (this.#isFlexCol) {
                this.#startY = 0;
                this.#flexColumn();
            } else {
                this.#startX = 0;
                this.#flexRow();
            }
        };
        const _func2 = () => {
            if (this.#isFlexCol) {
                this.#startX = 0;
                this.#flexColumn();
            } else {
                if (this.#isWrap) {
                    this.#startY = 0;
                    this.#flexRow();
                }
            }
        };
        const _func3 = () => {};
        const _func4 = () => {
            if (this.#isFlexCol) {
                this.#startX = 0;
                this.#flexColumn();
            } else {
                this.#startY = 0;
                this.#flexRow();
            }
        };
        this.#checkLayoutType(_type, _func1, _func2, _func3, _func4);
    }

    #end(_type: TypeContent) {
        const _func1 = () => {
            if (this.#isOutofLayout) {
                if (this.#isFlexCol) {
                    if (this.#isWrap) {
                        this.#cols.height.forEach((item: number) => {
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
                        this.#rows.width.forEach((item: number) => {
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
        };
        const _func2 = () => {
            if (this.#isOutofLayout && this.#isWrap) {
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
        };
        const _func3 = () => {};
        const _func4 = () => {
            if (this.#isFlexCol) {
                let rows = 0;
                let idx = 0;
                let size = 0;

                this.#cols.width.forEach((item: number, index: number) => {
                    for (let i = 0; i < this.#cols.rows[idx]; i++) {
                        const block = (this._childs as any)[i + rows];
                        let containerW = this.options.width - this.#containerW;
                        containerW = containerW > 0 ? containerW : 0;
                        size =
                            containerW + Math.abs(item - block.options.width);
                        this.#startXPos.push(size);
                    }
                    rows += this.#cols.rows[idx];
                    idx++;
                });
                this.#flexColumn();
            } else {
                let cols = 0;
                let idx = 0;
                let size = 0;

                this.#rows.height.forEach((item: number, index: number) => {
                    for (let i = 0; i < this.#rows.cols[idx]; i++) {
                        const block = (this._childs as any)[i + cols];
                        let containerH = this.options.height - this.#containerH;
                        containerH = containerH > 0 ? containerH : 0;
                        size =
                            containerH + Math.abs(item - block.options.height);
                        this.#startYPos.push(size);
                    }
                    cols += this.#rows.cols[idx];
                    idx++;
                });
                this.#flexRow();
            }
        };
        this.#checkLayoutType(_type, _func1, _func2, _func3, _func4);
    }
    #center(_type: TypeContent) {
        const _func1 = () => {
            if (this.#isOutofLayout) {
                if (this.#isFlexCol) {
                    if (this.#isWrap) {
                        this.#cols.height.forEach((item: number) => {
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
                        this.#rows.width.forEach((item: number) => {
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
        };
        const _func2 = () => {
            if (this.#isOutofLayout && this.#isWrap) {
                if (this.#isFlexCol) {
                    const startX = this.options.width - this.#containerW;
                    this.#startX = startX > 0 ? startX / this.#cols.nItems : 0;
                    this.#flexColumn();
                } else {
                    const startY = this.options.height - this.#containerH;
                    this.#startY = startY > 0 ? startY / this.#rows.nItems : 0;
                    this.#flexRow();
                }
            }
        };
        const _func3 = () => {};
        const _func4 = () => {
            if (this.#isFlexCol) {
                let rows = 0;
                let idx = 0;
                let size = 0;
                let containerW = this.options.width - this.#containerW;
                containerW = containerW > 0 ? containerW : 0;
                this.#cols.width.forEach((item: number) => {
                    for (let i = 0; i < this.#cols.rows[idx]; i++) {
                        const block = (this._childs as any)[i + rows];
                        size =
                            containerW / 2 + (item - block.options.width) / 2;
                        this.#startXPos.push(size);
                    }
                    rows += this.#cols.rows[idx];
                    idx++;
                });
                this.#flexColumn();
            } else {
                let cols = 0;
                let idx = 0;
                let size = 0;
                let containerH = this.options.height - this.#containerH;
                containerH = containerH > 0 ? containerH : 0;
                this.#rows.height.forEach((item: number) => {
                    for (let i = 0; i < this.#rows.cols[idx]; i++) {
                        const block = (this._childs as any)[i + cols];
                        size =
                            containerH / 2 + (item - block.options.height) / 2;
                        this.#startYPos.push(size);
                    }
                    cols += this.#rows.cols[idx];
                    idx++;
                });
                this.#flexRow();
            }
        };
        this.#checkLayoutType(_type, _func1, _func2, _func3, _func4);
    }
    #spaceBetween(_type: TypeContent) {
        const _func1 = () => {
            if (this.#isOutofLayout) {
                if (this.#isFlexCol) {
                    if (this.#isWrap) {
                        this.#cols.height.forEach(
                            (item: number, index: number) => {
                                let gap = this.options.height - item;
                                gap =
                                    gap > 0
                                        ? gap / (this.#cols.rows[index] - 1)
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
                        this.#rows.width.forEach(
                            (item: number, index: number) => {
                                let gap = this.options.width - item;
                                gap =
                                    gap > 0
                                        ? gap / (this.#rows.cols[index] - 1)
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
        };
        const _func2 = () => {
            if (this.#isOutofLayout && this.#isWrap) {
                if (this.#isFlexCol) {
                    let gap = this.options.width - this.#containerW;
                    this.options.gapColumn =
                        gap > 0 ? gap / (this.#cols.nItems - 1) : 0;
                    this.#flexColumn();
                } else {
                    let gap = this.options.height - this.#containerH;
                    this.options.gapRow =
                        gap > 0 ? gap / (this.#rows.nItems - 1) : 0;
                    this.#flexRow();
                }
            }
        };

        this.#checkLayoutType(_type, _func1, _func2);
    }
    #spaceAround(_type: TypeContent) {
        const _func1 = () => {
            if (this.#isOutofLayout) {
                if (this.#isFlexCol) {
                    if (this.#isWrap) {
                        this.#cols.height.forEach(
                            (item: number, index: number) => {
                                const cols = this.#cols.rows[index];
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
                        this.#rows.width.forEach(
                            (item: number, index: number) => {
                                const cols = this.#rows.cols[index];
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
        };
        const _func2 = () => {
            if (this.#isWrap) {
                if (this.#isFlexCol) {
                    let gap = this.options.width - this.#containerW;
                    gap = gap > 0 ? gap / this.#cols.nItems : 0;
                    this.options.gapColumn = gap;
                    this.#startX = gap / 2;
                    this.#flexColumn();
                } else {
                    let gap = this.options.height - this.#containerH;
                    gap = gap > 0 ? gap / this.#rows.nItems : 0;
                    this.options.gapRow = gap;
                    this.#startY = gap / 2;
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
                    if (this.#isWrap) {
                        this.#cols.height.forEach(
                            (item: number, index: number) => {
                                const rows = this.#cols.rows[index];
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
                        this.#rows.width.forEach(
                            (item: number, index: number) => {
                                const cols = this.#rows.cols[index];
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
                        gap = gap > 0 ? gap / this._childs.length + 1 : 0;
                        this.options.gapColumn += gap;
                        this.#startX = gap;
                    }
                    this.#flexRow();
                }
            }
        };
        const _func2 = () => {
            if (this.#isWrap) {
                if (this.#isFlexCol) {
                    let gap = this.options.width - this.#containerW;
                    gap = gap > 0 ? gap / (this.#cols.nItems + 1) : 0;
                    this.options.gapColumn = gap;
                    this.#startX = gap;
                    this.#flexColumn();
                } else {
                    let gap = this.options.height - this.#containerH;
                    gap = gap > 0 ? gap / (this.#rows.nItems + 1) : 0;
                    this.options.gapRow = gap;
                    this.#startY = gap;
                    this.#flexRow();
                }
            }
        };

        this.#checkLayoutType(_type, _func1, _func2);
    }

    #flexRow() {
        const blocks = this._childs as BlockElements[];

        let idx = 0;
        let col = 0;

        let rowIdx = 0;
        let colIdx = 0;

        let blocksW = 0;
        let blocksH = 0;

        let wrapWidth = 0;
        let sharedColumnGap = 0;
        let posY = 0;

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
            if (sumWidths > this.options.width)
                sharedColumnGap =
                    Math.abs(this.options.width - sumWidths) / blocks.length;
        }

        while (blocks.length > idx) {
            const block = blocks[idx];

            if (this.#isWrap) wrapWidth += block.options.width;

            if (this.#startYPos[idx] !== undefined)
                startY = posY + this.#startYPos[idx];

            if (idx === blocks.length - 1) {
                if (!(wrapWidth > this.options.width)) {
                    blocksW += block.options.width;
                    blocksH =
                        blocksH <= block.options.height
                            ? block.options.height
                            : blocksH;
                    col += 1;
                }
                if (this.#isNew) {
                    this.#rows.width.push(blocksW);
                    this.#rows.height.push(blocksH);
                    this.#rows.cols.push(col);
                    this.#rows.nItems += 1;
                }
            }

            if (this.#isWrap) {
                if (wrapWidth > this.options.width) {
                    rowIdx += 1;
                    startY += blocksH + gapRow;
                    posY += blocksH + gapRow;

                    startX =
                        this.#startXPos[rowIdx] !== undefined
                            ? this.#startXPos[rowIdx]
                            : this.#startX;
                    gapCol =
                        this.#columnsGap[rowIdx] !== undefined
                            ? this.#columnsGap[rowIdx]
                            : this.options.gapColumn;

                    wrapWidth = block.options.width;

                    if (idx === blocks.length - 1) {
                        blocksW = block.options.width;
                        blocksH = block.options.height;
                        col = 1;
                    }
                    if (this.#isNew) {
                        this.#rows.width.push(blocksW);
                        this.#rows.height.push(blocksH);
                        this.#rows.cols.push(col);
                        this.#rows.nItems += 1;
                    }

                    blocksW = 0;
                    blocksH = 0;
                    col = 0;
                }
            }

            let endX = block.options.width;
            if (sharedColumnGap) {
                if (idx !== blocks.length - 1) endX -= sharedColumnGap + gapCol;
                else endX -= sharedColumnGap;
                if (endX < 0) {
                    startX += endX;
                    endX = 0;
                }
            }
            block.initCords.x = startX;
            block.options.x = startX;
            block.options.width = endX;

            block.initCords.y = startY;
            block.options.y = startY;
            block.options.height = block.options.height;

            block.__adjustCordinates();

            blocksW += block.options.width;
            blocksH =
                blocksH < block.options.height ? block.options.height : blocksH;

            if (this.#isNew && idx === blocks.length - 1) {
                if (this.#isWrap) {
                    this.#containerH = this.#rows.height.reduce(
                        (prev, curr) => prev + curr,
                        0
                    );
                    this.#containerW = Math.max(...this.#rows.width);
                } else {
                    this.#containerH = Math.max(...this.#rows.height);
                    this.#containerW = sumWidths;
                }

                this.#isNew = false;
            }

            startX += gapCol + endX;
            idx += 1;
            col += 1;
            colIdx += 1;
            wrapWidth += gapCol;
        }
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

        let idx = 0;
        let row = 0;

        let rowIdx = 0;
        let colIdx = 0;

        let blocksW = 0;
        let blocksH = 0;

        let wrapHeight = 0;
        let posX = 0;

        let sumHeights = 0;

        let sharedRowGap = 0;

        let startX = this.#startX;
        let startY =
            this.#startYPos[rowIdx] !== undefined
                ? this.#startYPos[rowIdx]
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
            if (sumHeights > this.options.height)
                sharedRowGap =
                    Math.abs(this.options.height - sumHeights) / blocks.length;
        }

        while (blocks.length > idx) {
            const block = blocks[idx];

            if (this.#isWrap) wrapHeight += block.options.height;

            if (this.#startXPos[idx] !== undefined)
                startX = posX + this.#startXPos[idx];

            if (idx === blocks.length - 1) {
                if (!(wrapHeight > this.options.height)) {
                    blocksH += block.options.height;
                    blocksW =
                        blocksW <= block.options.width
                            ? block.options.width
                            : blocksW;
                    row += 1;
                }
                if (this.#isNew) {
                    this.#cols.width.push(blocksW);
                    this.#cols.height.push(blocksH);
                    this.#cols.rows.push(row);
                    this.#cols.nItems += 1;
                }
            }
            if (this.#isWrap) {
                if (wrapHeight > this.options.height) {
                    colIdx += 1;
                    startX += blocksW + gapCol;
                    posX += blocksW + gapCol;

                    startY =
                        this.#startYPos[colIdx] !== undefined
                            ? this.#startYPos[colIdx]
                            : this.#startY;

                    gapRow =
                        this.#rowsGap[colIdx] !== undefined
                            ? this.#rowsGap[colIdx]
                            : this.options.gapRow;

                    wrapHeight = block.options.height;

                    if (idx === blocks.length - 1) {
                        blocksW = block.options.width;
                        blocksH = block.options.height;
                        row = 1;
                    }
                    if (this.#isNew) {
                        this.#cols.width.push(blocksW);
                        this.#cols.height.push(blocksH);
                        this.#cols.rows.push(row);
                        this.#cols.nItems += 1;
                    }
                    blocksW = 0;
                    blocksH = 0;
                    row = 0;
                }
            }

            let endY = block.options.height;
            if (sharedRowGap) {
                if (idx !== blocks.length - 1) endY -= sharedRowGap + gapRow;
                else endY -= sharedRowGap;
                if (endY < 0) {
                    startY += endY;
                    endY = 0;
                }
            }
            block.initCords.y = startY;
            block.options.y = startY;
            block.options.height = endY;

            block.initCords.x = startX;
            block.options.x = startX;
            block.options.width = block.options.width;

            block.__adjustCordinates();

            blocksW =
                blocksW <= block.options.width ? block.options.width : blocksW;
            blocksH += block.options.height;

            if (this.#isNew && idx === blocks.length - 1) {
                if (this.#isWrap) {
                    this.#containerH = Math.max(...this.#cols.height);
                    this.#containerW = this.#cols.width.reduce(
                        (prev, curr) => prev + curr,
                        0
                    );
                } else {
                    this.#containerH = sumHeights;
                    this.#containerW = Math.max(...this.#cols.width);
                }
                this.#isNew = false;
            }

            startY += gapRow + endY;
            idx += 1;
            row += 1;
            rowIdx += 1;
            wrapHeight += gapRow;
        }
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
    #gridLayout() {}
}
