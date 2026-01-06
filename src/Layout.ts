import { Block } from "./Block";
import type { IBlock } from "./types";

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

type GridAutoFlow = "row" | "column" | "dense" | "row dense" | "column dense";

type TypeContent =
    | "justifyContent"
    | "justifyItems"
    | "alignContent"
    | "alignItems";

interface FlexLayout {
    flexDirection: FlexDirecton;
    flexWrap: FlexWrap;
    flexFlow: FlexFlow;
}

type Gap = number | number[];

interface GridLayout {
    // grid-template-rows / grid-template-columns|grid-template-areas|grid-template-rows / [grid-auto-flow] grid-auto-columns|[grid-auto-flow] grid-auto-rows / grid-template-columns
    grid: number[];
    // @Todo: add Name assignamed to each grid
    gridTemplateAreas: string[];
    // gridTemplate: grid-template-rows / grid-template-columns
    gridTemplate: number[];
    gridTemplateColumns: number[] | number;
    gridTemplateRows: number[] | number;

    gap: Gap;
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

export class Layout extends Block {
    #containerX?: number = undefined;
    #containerY?: number = undefined;

    #startXPos: number[] = [];
    #startYPos: number[] = [];

    #columnsGap: number[] = [];
    #rowsGap: number[] = [];

    #blocksWidth: number[] = [];
    #blocksHeight: number[] = [];

    #layoutCols: number[] = [];
    #layoutRows: number[] = [];

    #invokerLayout?: () => void;
    #justifyInvoker?: () => void;
    #justifyItemsInvoker?: () => void;
    #alignInvoker?: () => void;
    #alignItemsInvoker?: () => void;

    #childBlocks: Block[] = [];

    constructor(options: IBlock<LayoutOptions>) {
        super(options);
        this.options = options;
    }
    addChild(...block: Block[]): void {
        super.addChild(...block);
        let order = 0;
        this.listOnlyChilds((b: Block, idx: number) => {
            if (b.order() === undefined) {
                b.order(order);
                order += 1;
            } else if (idx >= b.order()!) {
                b.order(b.order()! - 1);
            }
        });
        this.#childBlocks = this.child_nodes as Block[];
        this.#childBlocks.sort(
            (a, b) => (a.order() as number) - (b.order() as number)
        );
    }
    __adjustBlocks(): void {
        this.#invokerLayout?.();
        this.#justifyInvoker?.();
        if (this.#isGrid) this.#justifyItemsInvoker?.();
        this.#alignInvoker?.();
        this.#alignItemsInvoker?.();

        this.__handlePosition();

        this.listOnlyChilds((b: Block) => {
            let bWidthResize = 0;
            let bHeightResize = 0;

            if (this.#isGrid) {
                if (
                    this.#containerW > this.width() ||
                    b.width() < b.maxWidth()
                ) {
                    bWidthResize =
                        (this.width() - this.#containerW) /
                            this.gridTemplateColumns().length -
                        (this.paddingRight() +
                            this.paddingLeft() +
                            this.gapColumn()) /
                            this.gridTemplateColumns().length;
                }
                if (
                    this.#containerH > this.height() ||
                    b.height() < b.maxHeight()
                ) {
                    bHeightResize =
                        (this.height() - this.#containerH) /
                            this.gridTemplateRows().length -
                        (this.paddingTop() +
                            this.paddingBottom() +
                            this.gapRow()) /
                            this.gridTemplateRows().length;
                }
            } else {
                if (this.#isFlexCol) {
                    if (this.#isWrap) {
                        if (
                            b.height() > this.height() ||
                            b.height() < b.maxHeight()
                        )
                            bHeightResize = -(
                                b.height() -
                                (this.height() -
                                    (this.paddingBottom() +
                                        this.paddingTop() +
                                        this.gapRow()))
                            );

                        if (
                            this.#containerW > this.width() ||
                            b.width() < b.maxWidth()
                        )
                            bWidthResize = -(
                                this.#containerW -
                                (this.width() -
                                    (this.paddingLeft() +
                                        this.paddingRight() +
                                        this.gapColumn()))
                            );
                    } else {
                        if (
                            this.#containerH > this.height() ||
                            b.height() < b.maxHeight()
                        ) {
                            bHeightResize =
                                (this.height() - this.#containerH) /
                                    this.#childBlocks.length -
                                (this.paddingBottom() +
                                    this.paddingTop() +
                                    this.gapRow()) /
                                    this.#childBlocks.length;
                        }
                        if (
                            b.width() > this.width() ||
                            b.width() < b.maxWidth()
                        )
                            bWidthResize = -(
                                b.width() -
                                (this.width() -
                                    (this.paddingLeft() +
                                        this.paddingRight() +
                                        this.gapColumn()))
                            );
                    }
                } else {
                    if (this.#isWrap) {
                        if (
                            b.width() > this.width() ||
                            b.width() < b.maxWidth()
                        )
                            bWidthResize = -(
                                b.width() -
                                (this.width() -
                                    (this.paddingRight() +
                                        this.paddingLeft() +
                                        this.gapColumn()))
                            );
                        // @Todo: height bug when resizing
                        if (
                            this.#containerH > this.height() ||
                            b.height() < b.maxHeight()!
                        )
                            bHeightResize = -(
                                this.#containerH -
                                (this.height() -
                                    (this.paddingBottom() +
                                        this.paddingTop() +
                                        this.gapRow()))
                            );
                    } else {
                        if (
                            this.#containerW > this.width() ||
                            b.width() < b.maxWidth()
                        ) {
                            bWidthResize =
                                (this.width() - this.#containerW) /
                                    this.#childBlocks.length -
                                (this.paddingRight() +
                                    this.paddingLeft() +
                                    this.gapColumn()) /
                                    this.#childBlocks.length;
                        }
                        if (
                            b.height() > this.height() ||
                            b.height() < b.maxHeight()
                        )
                            bHeightResize = -(
                                b.height() -
                                (this.height() -
                                    (this.paddingTop() +
                                        this.paddingBottom() +
                                        this.gapRow()))
                            );
                    }
                }
            }
            let oldWidth = b.width();
            b.width(b.width() + bWidthResize);
            if (b.minWidth() > b.width()) b.width(oldWidth);

            let oldHeight = b.height();
            b.height(b.height() + bHeightResize);
            if (b.minHeight() > b.height()) b.height(oldHeight);

            b.__adjustBlocks();
        });

        this.#invokerLayout?.();

        this.listOnlyChilds((b: Block) => {
            b.x(b.x() + this.x() + this.marginLeft() + this.paddingLeft());
            b.y(b.y() + this.y() + this.marginTop() + this.paddingTop());
        });

        this.#blocksWidth = [];
        this.#blocksHeight = [];
        this.#layoutCols = [];
        this.#layoutRows = [];
    }
    x(opt?: number): number {
        return super.x(opt);
    }
    y(opt?: number): number {
        return super.y(opt);
    }
    padding(opt?: number[]): number[] {
        return super.padding(opt);
    }
    paddingLeft(opt?: number): number {
        return super.paddingLeft(opt);
    }
    paddingTop(opt?: number): number {
        return super.paddingTop(opt);
    }
    paddingBottom(opt?: number): number {
        return super.paddingBottom(opt);
    }
    paddingRight(opt?: number): number {
        return super.paddingRight(opt);
    }
    width(opt?: number): number {
        return super.width(opt);
    }
    height(opt?: number): number {
        return super.height(opt);
    }
    cornerX1(opt?: number): number {
        return super.cornerX1(opt);
    }
    cornerY1(opt?: number): number {
        return super.cornerY1(opt);
    }
    cornerX2(opt?: number): number {
        return super.cornerX2(opt);
    }
    cornerY2(opt?: number): number {
        return super.cornerY2(opt);
    }
    cornerX3(opt?: number): number {
        return super.cornerX3(opt);
    }
    cornerY3(opt?: number): number {
        return super.cornerY3(opt);
    }
    cornerX4(opt?: number): number {
        return super.cornerX4(opt);
    }
    cornerY4(opt?: number): number {
        return super.cornerY4(opt);
    }
    hotCornerX1(opt?: number): number {
        return super.hotCornerX1(opt);
    }
    hotCornerY1(opt?: number): number {
        return super.hotCornerY1(opt);
    }
    hotCornerX2(opt?: number): number {
        return super.hotCornerX2(opt);
    }
    hotCornerY2(opt?: number): number {
        return super.hotCornerY2(opt);
    }
    hotCornerX3(opt?: number): number {
        return super.hotCornerX3(opt);
    }
    hotCornerY3(opt?: number): number {
        return super.hotCornerY3(opt);
    }
    hotCornerX4(opt?: number): number {
        return super.hotCornerX4(opt);
    }
    hotCornerY4(opt?: number): number {
        return super.hotCornerY4(opt);
    }
    resizable(opt?: boolean): boolean {
        return super.resizable(opt);
    }
    hotAreaGap(opt?: number): number {
        return super.hotAreaGap(opt);
    }
    zIndex(opt?: number): number {
        return super.zIndex(opt);
    }
    dragX(opt?: boolean) {
        return super.dragX(opt);
    }
    dragY(opt?: boolean) {
        return super.dragY(opt);
    }
    selectable(opt?: boolean): boolean {
        return super.selectable(opt);
    }
    draggable(opt: boolean): boolean {
        return super.draggable(opt);
    }
    set(options: IBlock<LayoutOptions>) {
        super.set(options);
    }

    layout(opt?: ILayout) {
        const layout = this.__valueHandler<ILayout, ILayout>(
            opt,
            "layout",
            "flex"
        );
        if (layout == "inline-flex" || layout == "inline-grid") {
            if (!this.width())
                this.width(
                    this.#childBlocks.reduce(
                        (prev, curr) => prev + curr.width(),
                        0
                    )
                );

            if (!this.height())
                this.height(
                    this.#childBlocks.reduce(
                        (prev, curr) => prev + curr.height(),
                        0
                    )
                );
        }
        if (layout === "flex" || layout == "inline-flex") {
            switch (this.options.flexDirection) {
                case "column":
                    this.#invokerLayout = this.#flexColumn;
                    break;
                case "column-reverse":
                    this.#invokerLayout = this.#flexColumnReverse;
                    break;
                case "row":
                    this.#invokerLayout = this.#flexRow;
                    break;
                case "row-reverse":
                    this.#invokerLayout = this.#flexRowReverse;
                    break;
                default:
                    this.#invokerLayout = this.#flexRow;
                    break;
            }
        } else if (layout == "grid" || layout == "inline-grid") {
            this.#invokerLayout = this.#gridLayout;
        }
        return layout;
    }
    flexFlow(opt?: FlexFlow) {
        const flexFlow = this.__valueHandler(opt, "flexFlow", [
            this.flexDirection(),
            this.flexWrap(),
        ]);
        this.flexDirection(flexFlow[0] as FlexDirecton);
        this.flexWrap(flexFlow[1] as FlexWrap);
        return flexFlow;
    }
    flexDirection(opt?: FlexDirecton) {
        return this.__valueHandler(opt, "flexDirection", "row");
    }
    flexWrap(opt?: FlexWrap) {
        return this.__valueHandler(opt, "flexWrap", "nowrap");
    }
    placeContent(opt?: PlaceContent) {
        this.alignContent(opt);
        this.justifyContent(opt);
        return this.__valueHandler(opt, "placeContent", "start");
    }
    placeItems(opt?: PlaceItems) {
        this.alignItems(opt);
        this.justifyItems(opt);
        return this.__valueHandler(opt, "placeItems", "start");
    }
    gap(opt?: Gap) {
        const gap = this.__valueHandler<Gap, Gap>(opt, "gap", 0);
        let gapRow, gapColumn;
        gapRow = gapColumn = gap;
        if (typeof gap === "object") {
            gapRow = gap[0];
            gapColumn = gap[1];
        }
        this.gapColumn(gapRow as number);
        this.gapRow(gapColumn as number);
        return gap;
    }
    gridTemplate(opt?: number[][]) {
        const gridTemplate = this.__valueHandler(opt, "gridTemplate", []);
        this.gridTemplateRows(gridTemplate[0]);
        this.gridTemplateColumns(gridTemplate[1]);
        return gridTemplate;
    }
    gridAutoFlow(opt?: GridAutoFlow) {
        return this.__valueHandler(opt, "gridAutoFlow", "row");
    }
    gridTemplateColumns(opt?: number[] | string[]): number[] | string[] {
        return this.__valueHandler(opt, "gridTemplateColumns", [0]);
    }
    gridTemplateRows(opt?: number[] | string[]): number[] | string[] {
        return this.__valueHandler(opt, "gridTemplateRows", []);
    }
    gapColumn(opt?: number) {
        return this.__valueHandler(opt, "gapColumn", 0);
    }
    gapRow(opt?: number) {
        return this.__valueHandler(opt, "gapRow", 0);
    }
    columnStart(opt?: number) {
        return this.__valueHandler(opt, "columnStart", 1);
    }
    columnEnd(opt?: number) {
        return this.__valueHandler(opt, "columnEnd", 0);
    }
    hidden(opt?: boolean): boolean {
        return super.hidden(opt);
    }
    justifyContent(opt?: JustifyContent) {
        const justifyContent = this.__valueHandler<
            JustifyContent,
            JustifyContent
        >(opt, "justifyContent", "normal");
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
        const justifyItems = this.__valueHandler<JustifyItems, JustifyItems>(
            opt,
            "justifyItems",
            "normal"
        );
        const justify = "justifyItems";
        switch (justifyItems) {
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
        const alignContent = this.__valueHandler<AlignContent, AlignContent>(
            opt,
            "alignContent",
            "normal"
        );
        if (!this.#isWrap && !this.#isGrid) return alignContent;

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
        const alignItems = this.__valueHandler<AlignItems, AlignItems>(
            opt,
            "alignItems",
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
            this.height() - this.#containerH > 0 &&
            this.width() - this.#containerW > 0
        )
            return true;
        return false;
    }
    get #containerW() {
        if (this.#isGrid) return this.#blocksWidth.reduce((p, c) => p + c, 0);
        if (this.#isFlexCol) {
            if (this.#isWrap)
                return this.#blocksWidth.reduce((p, c) => p + c, 0);
            return Math.max(...this.#blocksWidth);
        } else {
            if (this.#isWrap) return Math.max(...this.#blocksWidth);
            return this.#blocksWidth.reduce((p, c) => p + c, 0);
        }
    }
    get #containerH() {
        if (this.#isGrid) return this.#blocksHeight.reduce((p, c) => p + c, 0);
        if (this.#isFlexCol) {
            if (this.#isWrap) return Math.max(...this.#blocksHeight);
            return this.#blocksHeight.reduce((p, c) => p + c, 0);
        } else {
            if (this.#isWrap)
                return this.#blocksHeight.reduce((p, c) => p + c, 0);
            return Math.max(...this.#blocksHeight);
        }
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
                this.#justifyInvoker = _justify_cont_func;
                break;
            case "alignContent":
                this.#alignInvoker = _align_cont_func;
                break;
            case "justifyItems":
                this.#justifyItemsInvoker = _justify_func;
                break;
            case "alignItems":
                this.#alignItemsInvoker = _align_func;
                break;
            default:
                break;
        }
    }
    #start(_type: TypeContent) {
        const _func1 = () => {
            if (this.#isGrid) {
                this.#containerX = 0;
            } else {
                if (this.#isFlexCol) {
                    this.#containerY = 0;
                } else {
                    this.#containerX = 0;
                }
            }
        };
        const _func2 = () => {
            if (this.#isGrid) {
                this.#containerY = 0;
            } else {
                if (this.#isFlexCol) {
                    this.#containerX = 0;
                } else {
                    if (this.#isWrap) {
                        this.#containerY = 0;
                    }
                }
            }
        };
        const _func3 = () => {
            for (let i = 0, len = this.#childBlocks.length; i < len; i++) {
                this.#startXPos.push(0);
            }
        };
        const _func4 = () => {
            if (this.#isGrid) {
                for (let i = 0, len = this.#childBlocks.length; i < len; i++) {
                    this.#startYPos.push(0);
                }
            } else {
                if (this.#isFlexCol) {
                    let containerW = 0;
                    if (this.#containerX === undefined) {
                        containerW = this.width() - this.#containerW;
                        containerW =
                            containerW > 0
                                ? containerW / this.#blocksWidth.length
                                : 0;
                    }
                    for (
                        let i = 0, cols = 0, len = this.#blocksWidth.length;
                        i < len;
                        cols += containerW, i++
                    ) {
                        for (let l = 0; l < this.#layoutRows[i]; l++) {
                            this.#startXPos.push(cols);
                        }
                    }
                } else {
                    let containerH = 0;
                    if (this.#containerY === undefined) {
                        containerH = this.height() - this.#containerH;
                        containerH =
                            containerH > 0
                                ? containerH / this.#blocksHeight.length
                                : 0;
                    }
                    for (
                        let i = 0, cols = 0, len = this.#blocksHeight.length;
                        i < len;
                        cols += containerH, i++
                    ) {
                        for (let l = 0; l < this.#layoutCols[i]; l++) {
                            this.#startYPos.push(cols);
                        }
                    }
                }
            }
        };
        this.#checkLayoutType(_type, _func1, _func2, _func3, _func4);
    }
    #end(_type: TypeContent) {
        const _func1 = () => {
            if (this.#isGrid) {
                this.#containerX = Math.abs(
                    this.width() - this.#blocksWidth.reduce((a, c) => a + c, 0)
                );
            } else {
                if (!this.#isOutofLayout) return;
                if (this.#isFlexCol) {
                    if (this.#isWrap) {
                        for (
                            let i = 0, len = this.#blocksHeight.length;
                            i < len;
                            i++
                        ) {
                            const startY =
                                this.height() - this.#blocksHeight[i];
                            this.#startYPos.push(startY > 0 ? startY : 0);
                        }
                    } else {
                        const startY = this.height() - this.#containerH;
                        this.#containerY = startY > 0 ? startY : 0;
                    }
                } else {
                    if (this.#isWrap) {
                        for (
                            let i = 0, len = this.#blocksWidth.length;
                            i < len;
                            i++
                        ) {
                            let startX = this.width() - this.#blocksWidth[i];
                            this.#startXPos.push(startX > 0 ? startX : 0);
                        }
                    } else {
                        const startX = this.width() - this.#containerW;
                        this.#containerX = startX > 0 ? startX : 0;
                    }
                }
            }
        };
        const _func2 = () => {
            if (this.#isGrid) {
                this.#containerY = Math.abs(
                    this.height() -
                        this.#blocksHeight.reduce((a, c) => a + c, 0)
                );
            } else {
                if (!this.#isOutofLayout && !this.#isWrap) return;
                if (this.#isFlexCol) {
                    const startX = this.width() - this.#containerW;
                    this.#containerX = startX > 0 ? startX : 0;
                } else {
                    const startY = this.height() - this.#containerH;
                    this.#containerY = startY > 0 ? startY : 0;
                }
            }
        };
        const _func3 = () => {
            for (
                let i = 0, col = 0, len = this.#childBlocks.length;
                i < len;
                i++, col++
            ) {
                this.#startXPos.push(
                    this.#blocksWidth[col] - this.#childBlocks[i].width()
                );
                if (col === this.#blocksWidth.length) col = 0;
            }
        };
        const _func4 = () => {
            if (this.#isGrid) {
                for (
                    let i = 0, row = 0, len = this.#childBlocks.length;
                    i < len;
                    i++
                ) {
                    this.#startYPos.push(
                        this.#blocksHeight[row] - this.#childBlocks[i].height()
                    );
                    if (i === this.#blocksWidth.length - 1) row++;
                }
            } else {
                if (this.#isFlexCol) {
                    let containerW = 0;
                    if (this.#containerX === undefined) {
                        containerW = this.width() - this.#containerW;
                        containerW =
                            containerW > 0
                                ? containerW / this.#blocksWidth.length
                                : 0;
                    }
                    for (
                        let i = 0, rows = 0, len = this.#blocksWidth.length;
                        i < len;
                        rows += this.#layoutRows[i], i++
                    ) {
                        let colW = containerW;
                        for (let j = 0; j < this.#layoutRows[i]; j++) {
                            if (colW !== 0) colW = (i + 1) * containerW;
                            this.#startXPos.push(
                                colW +
                                    (this.#blocksWidth[i] -
                                        this.#childBlocks[j + rows].width())
                            );
                        }
                    }
                } else {
                    let containerH = 0;
                    if (this.#containerY === undefined) {
                        containerH = this.height() - this.#containerH;
                        containerH =
                            containerH > 0
                                ? containerH / this.#blocksHeight.length
                                : 0;
                    }

                    for (
                        let i = 0, cols = 0, len = this.#blocksHeight.length;
                        i < len;
                        cols += this.#layoutCols[i], i++
                    ) {
                        let colH = containerH;
                        for (let l = 0; l < this.#layoutCols[i]; l++) {
                            if (colH !== 0) colH = (i + 1) * containerH;
                            this.#startYPos.push(
                                colH +
                                    (this.#blocksHeight[i] -
                                        this.#childBlocks[l + cols].height())
                            );
                        }
                    }
                }
            }
        };
        this.#checkLayoutType(_type, _func1, _func2, _func3, _func4);
    }
    #center(_type: TypeContent) {
        const _func1 = () => {
            if (this.#isGrid) {
                let startX =
                    this.width() / 2 -
                    this.#blocksWidth.reduce((a, c) => a + c, 0) / 2;
                this.#containerX = startX > 0 ? startX : 0;
            } else {
                if (!this.#isOutofLayout) return;
                if (this.#isFlexCol) {
                    if (this.#isWrap) {
                        for (
                            let i = 0, len = this.#blocksHeight.length;
                            i < len;
                            i++
                        ) {
                            let startY = this.height() - this.#blocksHeight[i];
                            this.#startYPos.push((startY > 0 ? startY : 0) / 2);
                        }
                    } else {
                        const startY = this.height() - this.#containerH;
                        this.#containerY = startY > 0 ? startY / 2 : 0;
                    }
                } else {
                    if (this.#isWrap) {
                        for (
                            let i = 0, len = this.#blocksWidth.length;
                            i < len;
                            i++
                        ) {
                            let startX = this.width() - this.#blocksWidth[i];
                            this.#startXPos.push((startX > 0 ? startX : 0) / 2);
                        }
                    } else {
                        const startX = this.width() - this.#containerW;
                        this.#containerX = startX > 0 ? startX / 2 : 0;
                    }
                }
            }
        };
        const _func2 = () => {
            if (this.#isGrid) {
                const startY =
                    this.height() -
                    this.#blocksHeight.reduce((a, c) => a + c, 0);
                this.#containerY =
                    startY > 0 ? startY / this.#layoutRows[0] : 0;
            } else {
                if (!this.#isOutofLayout && !this.#isWrap) return;
                if (this.#isFlexCol) {
                    const startX = this.width() - this.#containerW;
                    this.#containerX =
                        startX > 0 ? startX / this.#layoutCols.length : 0;
                } else {
                    const startY = this.height() - this.#containerH;
                    this.#containerY =
                        startY > 0 ? startY / this.#layoutRows.length : 0;
                }
            }
        };
        const _func3 = () => {
            for (
                let i = 0, col = 0, len = this.#childBlocks.length;
                i < len;
                i++, col++
            ) {
                this.#startXPos.push(
                    this.#blocksWidth[col] / 2 -
                        this.#childBlocks[i].width() / 2
                );
                if (this.#blocksWidth.length === col) col = 0;
            }
        };
        const _func4 = () => {
            if (this.#isGrid) {
                for (
                    let i = 0, row = 0, len = this.#childBlocks.length;
                    i < len;
                    i++, row++
                ) {
                    this.#startYPos.push(
                        this.#blocksHeight[row] / 2 -
                            this.#childBlocks[i].height() / 2
                    );
                    if (this.#blocksHeight.length - 1 === row) row = 0;
                }
            } else {
                if (this.#isFlexCol) {
                    let containerW = 0;
                    if (this.#containerX === undefined) {
                        containerW = this.width() - this.#containerW;
                        containerW = containerW > 0 ? containerW / 2 : 0;
                    }
                    for (
                        let i = 0, row = 0, len = this.#blocksWidth.length;
                        i < len;
                        row += this.#layoutRows[i], i++
                    ) {
                        let colW = containerW;
                        for (let j = 0; j < this.#layoutRows[i]; j++) {
                            if (colW !== 0) colW = (i + 1) * containerW;
                            this.#startXPos.push(
                                containerW +
                                    (this.#blocksWidth[i] -
                                        this.#childBlocks[j + row].width()) /
                                        2
                            );
                        }
                    }
                } else {
                    let containerH = 0;
                    if (this.#containerY === undefined) {
                        containerH = this.height() - this.#containerH;
                        containerH = containerH > 0 ? containerH / 2 : 0;
                    }
                    for (
                        let i = 0, col = 0, len = this.#blocksHeight.length;
                        i < len;
                        col += this.#layoutCols[i], i++
                    ) {
                        let colH = containerH;
                        for (let j = 0; j < this.#layoutCols[i]; j++) {
                            if (colH !== 0) colH = (i + 1) * containerH;
                            this.#startYPos.push(
                                containerH +
                                    (this.#blocksHeight[i] -
                                        this.#childBlocks[j + col].height()) /
                                        2
                            );
                        }
                    }
                }
            }
        };
        this.#checkLayoutType(_type, _func1, _func2, _func3, _func4);
    }
    #spaceBetween(_type: TypeContent) {
        const _func1 = () => {
            if (this.#isGrid) {
                let gap =
                    this.width() - this.#blocksWidth.reduce((a, c) => a + c, 0);
                const nCols =
                    this.#layoutCols[0] - 1 !== 0 ? this.#layoutCols[0] - 1 : 1;
                this.gapColumn(this.gapColumn() + (gap > 0 ? gap / nCols : 0));
            } else {
                if (!this.#isOutofLayout) return;
                if (this.#isFlexCol) {
                    if (this.#isWrap) {
                        for (
                            let i = 0, len = this.#blocksHeight.length;
                            i < len;
                            i++
                        ) {
                            let gap = this.height() - this.#blocksHeight[i];
                            gap = gap > 0 ? gap / (this.#layoutRows[i] - 1) : 0;
                            if (this.gapRow() > gap) gap = this.gapRow();
                            this.#rowsGap.push(gap);
                        }
                    } else {
                        let gap = this.height() - this.#containerH;
                        gap =
                            gap > 0 ? gap / (this.#childBlocks.length - 1) : 0;
                        this.gapRow(this.gapRow() + gap);
                    }
                } else {
                    if (this.#isWrap) {
                        for (
                            let i = 0, len = this.#blocksWidth.length;
                            i < len;
                            i++
                        ) {
                            let gap = this.width() - this.#blocksWidth[i];
                            gap = gap > 0 ? gap / (this.#layoutCols[i] - 1) : 0;
                            if (this.gapColumn() > gap) gap = this.gapColumn();
                            this.#columnsGap.push(gap);
                        }
                    } else {
                        let gap = this.width() - this.#containerW;
                        gap =
                            gap > 0 ? gap / (this.#childBlocks.length - 1) : 0;
                        this.gapColumn(this.gapColumn() + gap);
                    }
                }
            }
        };
        const _func2 = () => {
            if (this.#isGrid) {
                let gap =
                    this.height() -
                    this.#blocksHeight.reduce((a, c) => a + c, 0);
                const nRows =
                    this.#layoutRows[0] - 1 !== 0 ? this.#layoutRows[0] - 1 : 1;
                this.gapRow(this.gapRow() + (gap > 0 ? gap / nRows : 0));
            } else {
                if (!this.#isOutofLayout && !this.#isWrap) return;
                if (this.#isFlexCol) {
                    let gap = this.width() - this.#containerW;
                    this.gapColumn(
                        gap > 0 ? gap / (this.#layoutCols.length - 1) : 0
                    );
                    this.#containerX = 0;
                } else {
                    let gap = this.height() - this.#containerH;
                    this.gapRow(
                        gap > 0 ? gap / (this.#layoutRows.length - 1) : 0
                    );
                    this.#containerY = 0;
                }
            }
        };

        this.#checkLayoutType(_type, _func1, _func2);
    }
    #spaceAround(_type: TypeContent) {
        const _func1 = () => {
            if (this.#isGrid) {
                let gap =
                    this.width() - this.#blocksWidth.reduce((a, c) => a + c, 0);
                gap = gap > 0 ? gap / this.#layoutCols[0] : 0;
                this.gapColumn(gap);
                this.#containerX = gap / 2;
            } else {
                if (!this.#isOutofLayout) return;
                if (this.#isFlexCol) {
                    if (this.#isWrap) {
                        for (
                            let i = 0, len = this.#blocksHeight.length;
                            i < len;
                            i++
                        ) {
                            const cols = this.#layoutRows[i];
                            let gap = this.height() - this.#blocksHeight[i];
                            gap = gap > 0 ? gap / cols : 0;
                            if (this.gapRow() > gap) gap = this.gapRow();
                            this.#rowsGap.push(gap);
                            this.#startYPos.push(gap / 2);
                        }
                    } else {
                        let gap = this.height() - this.#containerH;
                        gap = gap > 0 ? gap / this.#childBlocks.length : 0;
                        this.gapRow(gap);
                        this.#containerY = gap / 2;
                    }
                } else {
                    if (this.#isWrap) {
                        for (
                            let i = 0, len = this.#blocksWidth.length;
                            i < len;
                            i++
                        ) {
                            const cols = this.#layoutCols[i];
                            let gap = this.width() - this.#blocksWidth[i];
                            gap = gap > 0 ? gap / cols : 0;
                            if (this.gapColumn() > gap) gap = this.gapColumn();
                            this.#columnsGap.push(gap);
                            this.#startXPos.push(gap / 2);
                        }
                    } else {
                        let gap = this.width() - this.#containerW;
                        gap = gap > 0 ? gap / this.#childBlocks.length : 0;
                        this.gapColumn(gap);
                        this.#containerX = gap / 2;
                    }
                }
            }
        };
        const _func2 = () => {
            if (this.#isGrid) {
                let gap =
                    this.height() -
                    this.#blocksHeight.reduce((a, c) => a + c, 0);
                gap = gap > 0 ? gap / this.#layoutRows[0] : 0;
                this.gapRow(gap);
                this.#containerY = gap / 2;
            } else {
                if (!this.#isWrap) return;
                if (this.#isFlexCol) {
                    let gap = this.width() - this.#containerW;
                    gap = gap > 0 ? gap / this.#layoutCols.length : 0;
                    this.gapColumn(gap);
                    this.#containerX = gap / 2;
                } else {
                    let gap = this.height() - this.#containerH;
                    gap = gap > 0 ? gap / this.#layoutRows.length : 0;
                    this.gapRow(gap);
                    this.#containerY = gap / 2;
                }
            }
        };

        this.#checkLayoutType(_type, _func1, _func2);
    }
    #spaceEvenly(_type: TypeContent) {
        const _func1 = () => {
            if (this.#isGrid) {
                let gap =
                    this.width() - this.#blocksWidth.reduce((a, c) => a + c, 0);
                gap = gap > 0 ? gap / (this.#layoutCols[0] + 1) : 0;
                this.gapColumn(gap);
                this.#containerX = gap;
            } else {
                if (!this.#isOutofLayout) return;
                if (this.#isFlexCol) {
                    if (this.#isWrap) {
                        for (
                            let i = 0, len = this.#blocksHeight.length;
                            i < len;
                            i++
                        ) {
                            const rows = this.#layoutRows[i];
                            let gap = this.height() - this.#blocksHeight[i];
                            gap = gap > 0 ? gap / (rows + 1) : 0;
                            if (this.gapRow() > gap) gap = this.gapRow();
                            this.#rowsGap.push(gap);
                            this.#startYPos.push(gap);
                        }
                    } else {
                        let gap = this.height() - this.#containerH;
                        gap =
                            gap > 0 ? gap / (this.#childBlocks.length + 1) : 0;
                        this.gapRow(this.gapRow() + gap);
                        this.#containerY = gap;
                    }
                } else {
                    if (this.#isWrap) {
                        for (
                            let i = 0, len = this.#blocksWidth.length;
                            i < len;
                            i++
                        ) {
                            let gap = this.width() - this.#blocksWidth[i];
                            gap = gap > 0 ? gap / (this.#layoutCols[i] + 1) : 0;
                            if (this.gapColumn() > gap) gap = this.gapColumn();
                            this.#columnsGap.push(gap);
                            this.#startXPos.push(gap);
                        }
                    } else {
                        let gap = this.width() - this.#containerW;
                        gap =
                            gap > 0 ? gap / (this.#childBlocks.length + 1) : 0;
                        this.gapColumn(this.gapColumn() + gap);
                        this.#containerX = gap;
                    }
                }
            }
        };
        const _func2 = () => {
            if (this.#isGrid) {
                let gap =
                    this.height() -
                    this.#blocksHeight.reduce((a, c) => a + c, 0);
                gap = gap > 0 ? gap / (this.#layoutRows[0] + 1) : 0;
                this.gapRow(gap);
                this.#containerY = gap;
            } else {
                if (!this.#isWrap) return;
                if (this.#isFlexCol) {
                    let gap = this.width() - this.#containerW;
                    gap = gap > 0 ? gap / (this.#layoutCols.length + 1) : 0;
                    this.gapColumn(gap);
                    this.#containerX = gap;
                } else {
                    let gap = this.height() - this.#containerH;
                    gap = gap > 0 ? gap / (this.#layoutRows.length + 1) : 0;
                    this.gapRow(gap);
                    this.#containerY = gap;
                }
            }
        };

        this.#checkLayoutType(_type, _func1, _func2);
    }

    #updateCorners(b: Block) {
        b.cornerX1();
        b.cornerX2();
        b.cornerX3();
        b.cornerX4();
        b.cornerY1();
        b.cornerY2();
        b.cornerY3();
        b.cornerY4();
        b.hotCornerX1();
        b.hotCornerX2();
        b.hotCornerX3();
        b.hotCornerX4();
        b.hotCornerY1();
        b.hotCornerY2();
        b.hotCornerY3();
        b.hotCornerY4();
        b.rotationCenterX();
        b.rotationCenterY();
    }

    #flexRow() {
        let colIdx = 0;
        let rowIdx = 0;
        let endW = 0;
        let containerW = 0;
        let containerH = 0;
        let wrapWidth = 0;

        let startX =
            this.#startXPos[rowIdx] !== undefined
                ? this.#startXPos[rowIdx]
                : this.#containerX || 0;

        let startY = this.#containerY || 0;

        let gapCol =
            this.#columnsGap[rowIdx] !== undefined
                ? this.#columnsGap[rowIdx]
                : this.gapColumn();
        let gapRow =
            this.#rowsGap[rowIdx] !== undefined
                ? this.#rowsGap[rowIdx]
                : this.gapRow();

        this.listOnlyChilds((block: Block, idx: number) => {
            endW = block.width();
            if (this.#isWrap) {
                wrapWidth += endW;
                if (wrapWidth > this.width()) {
                    rowIdx += 1;
                    startY += containerH + gapRow;
                    startX =
                        this.#startXPos[rowIdx] !== undefined
                            ? this.#startXPos[rowIdx]
                            : this.#containerX || 0;
                    gapCol =
                        this.#columnsGap[rowIdx] !== undefined
                            ? this.#columnsGap[rowIdx]
                            : this.gapColumn();

                    this.#blocksWidth.push(containerW);
                    this.#blocksHeight.push(containerH);
                    this.#layoutCols.push(colIdx);
                    this.#layoutRows.push(1);

                    containerW = 0;
                    containerH = 0;
                    colIdx = 0;

                    wrapWidth = endW;
                }
            }
            if (block.position() !== "absolute") {
                block.x(startX);
                block.y(startY + (this.#startYPos[idx] || 0));
            }
            if (containerH < block.height()) containerH = block.height();

            if (block.flexBasis() === "auto") block.width(endW);
            else block.width(block.flexBasis() as number);

            wrapWidth += gapCol;
            startX += gapCol + block.width();
            containerW += block.width();
            colIdx += 1;
            this.#updateCorners(block);
        });
        this.#blocksWidth.push(containerW);
        this.#blocksHeight.push(containerH);
        this.#layoutCols.push(colIdx);
        this.#layoutRows.push(1);
    }

    #flexColumn() {
        let colIdx = 0;
        let rowIdx = 0;
        let endH = 0;
        let containerW = 0;
        let containerH = 0;
        let wrapHeight = 0;

        let startX = this.#containerX || 0;

        let startY =
            this.#startYPos[colIdx] !== undefined
                ? this.#startYPos[colIdx]
                : this.#containerY || 0;

        let gapCol =
            this.#columnsGap[colIdx] !== undefined
                ? this.#columnsGap[colIdx]
                : this.gapColumn();
        let gapRow =
            this.#rowsGap[colIdx] !== undefined
                ? this.#rowsGap[colIdx]
                : this.gapRow();

        this.listOnlyChilds((block: Block, idx: number) => {
            endH = block.height();
            if (this.#isWrap) {
                wrapHeight += endH;
                if (wrapHeight > this.height()) {
                    colIdx += 1;
                    startX += containerW + gapCol;

                    startY =
                        this.#startYPos[colIdx] !== undefined
                            ? this.#startYPos[colIdx]
                            : this.#containerY || 0;
                    gapRow =
                        this.#rowsGap[colIdx] !== undefined
                            ? this.#rowsGap[colIdx]
                            : this.gapRow();

                    this.#blocksWidth.push(containerW);
                    this.#blocksHeight.push(containerH);
                    this.#layoutCols.push(1);
                    this.#layoutRows.push(rowIdx);

                    containerW = 0;
                    containerH = 0;
                    rowIdx = 0;

                    wrapHeight = endH;

                    this.#updateCorners(block);
                }
            }
            if (block.position() !== "absolute") {
                block.x(startX + (this.#startXPos[idx] || 0));
                block.y(startY);
            }
            if (containerW < block.width()) containerW = block.width();

            if (block.flexBasis() === "auto") block.height(endH);
            else block.width(block.flexBasis() as number);

            wrapHeight += gapRow;
            startY += gapRow + block.height();
            containerH += block.height();
            rowIdx += 1;
        });
        this.#blocksWidth.push(containerW);
        this.#blocksHeight.push(containerH);
        this.#layoutCols.push(1);
        this.#layoutRows.push(rowIdx);
    }

    #flexRowReverse() {
        // @Todo need to add alghorithm
        this.#flexRow();
    }
    #flexColumnReverse() {
        // @Todo need to add alghorithm
        this.#flexColumn();
    }
    #gridLayout() {
        let startX = this.#containerX || 0;

        let cols = this.gridTemplateColumns();

        const autoWidths = cols.filter((item: any) => item !== "auto");
        let rWidth = (autoWidths as number[]).reduce(
            (p: number, c: number) => p + c,
            0
        );

        const diffCol = Math.abs(cols.length - autoWidths.length);

        if (diffCol) rWidth = (this.width() - rWidth) / diffCol;
        else rWidth = this.width() / cols.length;

        const autoHeights = this.gridTemplateRows().filter(
            (item: any) => item !== "auto"
        );
        const nRows = Math.ceil(this.#childBlocks.length / cols.length);

        let rHeight = (autoHeights as number[]).reduce(
            (p: number, c: number) => p + c,
            0
        );
        const diffRow = Math.abs(nRows - autoHeights.length);
        if (diffRow) rHeight = (this.height() - rHeight) / diffRow;
        else rHeight = this.height() / nRows;

        const maxColWidths: number[] = [];
        const maxRowHeights: number[] = [];

        this.#layoutRows = [nRows];
        this.#layoutCols = [cols.length];

        for (let colIdx = 0; colIdx < this.#layoutCols[0]; colIdx++) {
            let startY = this.#containerY || 0;
            for (let rowIdx = 0; rowIdx < this.#layoutRows[0]; rowIdx++) {
                let colStart = 0;
                let rowStart = 0;

                const idx =
                    (this.#layoutCols[0] - 1) * rowIdx + rowIdx + colIdx;

                const block = this.#childBlocks[idx];
                if (!block) continue;

                if (maxColWidths[colIdx]) {
                    if (maxColWidths[colIdx] < block.width())
                        maxColWidths[colIdx] = block.width();
                    else if (
                        !this.justifyContent() &&
                        rWidth > maxColWidths[colIdx]
                    )
                        maxColWidths[colIdx] = rWidth;
                } else maxColWidths.push(block.width());

                if (!maxRowHeights[rowIdx]) maxRowHeights.push(block.height());

                if (maxRowHeights[rowIdx] < block.height())
                    maxRowHeights[rowIdx] = block.height();
                else if (
                    !this.alignContent() &&
                    rHeight > maxRowHeights[rowIdx]
                )
                    maxRowHeights[rowIdx] = rHeight;

                let endX = block.width();
                if (cols[colIdx] === "auto" || !cols[colIdx]) {
                    if (endX) colStart = maxColWidths[colIdx];
                    else colStart = endX = rWidth;
                } else {
                    colStart = cols[colIdx] as number;
                    if (!endX) endX = colStart;
                }

                let endY = block.height();
                if (
                    this.gridTemplateRows()[rowIdx] === "auto" ||
                    !this.gridTemplateRows()[rowIdx]
                ) {
                    if (endY) rowStart = maxRowHeights[rowIdx];
                    else rowStart = endY = rHeight;
                } else {
                    rowStart = this.gridTemplateRows()[rowIdx] as number;
                    if (!endY) endY = rowStart;
                }
                block.width(endX);
                block.height(endY);
                if (block.position() !== "absolute") {
                    block.x(startX + (this.#startXPos[idx] || 0));
                    block.y(startY + (this.#startYPos[idx] || 0));
                }
                startY += rowStart + this.gapRow();

                this.#updateCorners(block);
            }
            let startXD =
                cols[colIdx] === "auto" ? maxColWidths[colIdx] : cols[colIdx];
            startX += (startXD as number) + this.gapColumn();
            this.#blocksWidth.push(maxColWidths[colIdx]);
        }
        this.#blocksHeight.push(...maxRowHeights);
    }
}
