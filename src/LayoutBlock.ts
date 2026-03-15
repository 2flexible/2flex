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

export class LayoutBlock extends Block<LayoutOptions> {
    #containerX?: number;
    #containerY?: number;

    #startXPos: number[];
    #startYPos: number[];

    #columnsGap: number[];
    #rowsGap: number[];

    #blocksWidth: number[];
    #blocksHeight: number[];

    #layoutCols: number[];
    #layoutRows: number[];

    #invokerLayout?: () => void;
    #justifyInvoker?: () => void;
    #justifyItemsInvoker?: () => void;
    #alignInvoker?: () => void;
    #alignItemsInvoker?: () => void;

    constructor(options: IBlock<LayoutOptions>) {
        super(options);
        this.options = options;

        this.#startXPos = [];
        this.#startYPos = [];
        this.#columnsGap = [];
        this.#rowsGap = [];
        this.#blocksWidth = [];
        this.#blocksHeight = [];
        this.#layoutCols = [];
        this.#layoutRows = [];
    }

    __adjustChildBlocks(): void {
        const cacheR = this.rotate();
        this.rotate(0);

        this.#invokerLayout?.();
        this.#justifyInvoker?.();
        if (this.#isGrid) this.#justifyItemsInvoker?.();
        this.#alignInvoker?.();
        this.#alignItemsInvoker?.();
        this.#invokerLayout?.();

        const centerX = this.getCenterX;
        const centerY = this.getCenterY;
        const containerW = this.#containerW;
        const containerH = this.#containerH;
        const realW = this.getRealWidth;
        const realH = this.getRealHeight;

        let adjustedW = 0;
        let adjustedH = 0;

        let z = this.zIndex() || 0;

        if (this.#isGrid) {
            adjustedW =
                (realW - containerW) / (this.#layoutCols[0] || 1) -
                    (this.__widthSpaces + this.gapColumn()) /
                        (this.#layoutCols[0] || 1) || 1;

            adjustedH =
                (realH - containerH) / (this.#layoutRows[0] || 1) -
                    (this.__heightSpaces + this.gapRow()) /
                        (this.#layoutRows[0] || 1) || 1;
        } else {
            adjustedW =
                (realW - containerW) / this.childNodes.length -
                    (this.__widthSpaces + this.gapColumn()) /
                        this.childNodes.length || 1;

            adjustedH =
                (realH - containerH) / this.childNodes.length -
                    (this.__heightSpaces + this.gapRow()) /
                        this.childNodes.length || 1;
        }

        this.listOnlyChilds((b: Block) => {
            b.rotationCenterX(centerX);
            b.rotationCenterY(centerY);
            if (b.__childAdjustment) b.__childAdjustment(b);
            const blockW = b.width();
            const blockH = b.height();

            let bWidthResize = 0;
            let bHeightResize = 0;

            if (this.#isGrid) {
                if (containerW > realW || blockW < b.maxWidth()) {
                    bWidthResize = adjustedW;
                }
                if (containerH > realH || blockH < b.maxHeight()) {
                    bHeightResize = adjustedH;
                }
            } else {
                if (this.#isFlexCol) {
                    if (this.#isWrap) {
                        if (blockH > realH || blockH < b.maxHeight())
                            bHeightResize = -(
                                blockH -
                                (realH - (this.__heightSpaces + this.gapRow()))
                            );

                        if (containerW > realW || blockW < b.maxWidth())
                            bWidthResize = adjustedW;
                    } else {
                        if (containerH > realH || blockH < b.maxHeight()) {
                            bHeightResize = adjustedH;
                        }
                        if (blockW > realW || blockW < b.maxWidth())
                            bWidthResize = -(
                                blockW -
                                (realW -
                                    (this.__widthSpaces + this.gapColumn()))
                            );
                    }
                } else {
                    if (this.#isWrap) {
                        if (blockW > realW || blockW < b.maxWidth())
                            bWidthResize = -(
                                blockW -
                                (realW -
                                    (this.__widthSpaces + this.gapColumn()))
                            );
                        if (containerH > realH || blockH < b.maxHeight())
                            bHeightResize = adjustedH;
                    } else {
                        if (containerW > realW || blockW < b.maxWidth()) {
                            bWidthResize = adjustedW;
                        }
                        if (blockH > realH || blockH < b.maxHeight())
                            bHeightResize = -(
                                blockH -
                                (realH - (this.__heightSpaces + this.gapRow()))
                            );
                    }
                }
            }
            const width = b.width() + bWidthResize;
            const height = b.height() + bHeightResize;

            const x =
                b.x() +
                this.__overflowCords.x +
                this.getLeft.x +
                this.marginLeft() +
                this.paddingLeft();
            const y =
                b.y() +
                this.__overflowCords.y +
                this.getTop.y +
                this.marginTop() +
                this.paddingTop();
            z += 1;

            b.__childAdjustment = (b) => {
                b.rotate(cacheR);
                b.x(x);
                b.y(y);
                b.width(width);
                b.height(height);
                b.zIndex(z);
            };
            if (this.__clipPath) {
                b.__childClipping = (b: Block) => {
                    b.context?.clip(this.__clipPath!, "nonzero");
                };
            }
        }, "order");
        this.#blocksWidth = [];
        this.#blocksHeight = [];
        this.#layoutCols = [];
        this.#layoutRows = [];
        this.#startXPos = [];
        this.#startYPos = [];
        this.#containerX = 0;
        this.#containerY = 0;
        this.#columnsGap = [];
        this.#rowsGap = [];
        this.rotate(cacheR);
    }

    layout(opt?: ILayout) {
        const layout = this.__valueHandler<ILayout, ILayout>(
            opt,
            "layout",
            "flex"
        );
        if (layout == "inline-flex" || layout == "inline-grid") {
            if (!this.getRealWidth)
                this.width(
                    this.childNodes.reduce(
                        (prev, curr) => prev + curr.width(),
                        0
                    )
                );

            if (!this.getRealHeight)
                this.height(
                    this.childNodes.reduce(
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
        const _justify_cont_func = () => {
            if (this.#isGrid) this.#containerX = 0;
            else {
                if (this.#isFlexCol) this.#containerY = 0;
                else this.#containerX = 0;
            }
        };
        const _align_cont_func = () => {
            if (this.#isGrid) this.#containerY = 0;
            else {
                if (this.#isFlexCol) this.#containerX = 0;
                else if (this.#isWrap) this.#containerY = 0;
            }
        };
        const _justify_func = () => {
            for (let i = 0, len = this.childNodes.length; i < len; i++) {
                this.#startXPos.push(0);
            }
        };
        const _align_func = () => {
            if (this.#isGrid) {
                for (let i = 0, len = this.childNodes.length; i < len; i++) {
                    this.#startYPos.push(0);
                }
            } else {
                if (this.#isFlexCol) {
                    let containerW = 0;
                    if (this.#containerX === undefined) {
                        containerW = this.getRealWidth - this.#containerW;
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
                        containerH = this.getRealHeight - this.#containerH;
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
        this.#checkLayoutType(
            _type,
            _justify_cont_func,
            _align_cont_func,
            _justify_func,
            _align_func
        );
    }
    #end(_type: TypeContent) {
        const _justify_cont_func = () => {
            if (this.#isGrid) {
                this.#containerX = Math.abs(
                    this.getRealWidth - this.#containerW
                );
            } else {
                if (this.#isFlexCol) {
                    if (this.#isWrap) {
                        for (
                            let i = 0, len = this.#blocksHeight.length;
                            i < len;
                            i++
                        ) {
                            const startY =
                                this.getRealHeight - this.#blocksHeight[i];
                            this.#startYPos.push(startY > 0 ? startY : 0);
                        }
                    } else {
                        const startY = this.getRealHeight - this.#containerH;
                        this.#containerY = startY > 0 ? startY : 0;
                    }
                } else {
                    if (this.#isWrap) {
                        for (
                            let i = 0, len = this.#blocksWidth.length;
                            i < len;
                            i++
                        ) {
                            let startX =
                                this.getRealWidth - this.#blocksWidth[i];
                            this.#startXPos.push(startX > 0 ? startX : 0);
                        }
                    } else {
                        const startX = this.getRealWidth - this.#containerW;
                        this.#containerX = startX > 0 ? startX : 0;
                    }
                }
            }
        };
        const _align_cont_func = () => {
            if (this.#isGrid) {
                this.#containerY = Math.abs(
                    this.getRealHeight - this.#containerH
                );
            } else {
                if (!this.#isWrap) return;
                if (this.#isFlexCol) {
                    const startX = this.getRealWidth - this.#containerW;
                    this.#containerX = startX > 0 ? startX : 0;
                } else {
                    const startY = this.getRealHeight - this.#containerH;
                    this.#containerY = startY > 0 ? startY : 0;
                }
            }
        };
        const _justify_func = () => {
            for (
                let i = 0, col = 0, len = this.childNodes.length;
                i < len;
                i++, col++
            ) {
                this.#startXPos.push(
                    this.#blocksWidth[col] - this.childNodes[i].width()
                );
                if (col === this.#blocksWidth.length) col = 0;
            }
        };
        const _align_func = () => {
            if (this.#isGrid) {
                for (
                    let i = 0, row = 0, len = this.childNodes.length;
                    i < len;
                    i++
                ) {
                    this.#startYPos.push(
                        this.#blocksHeight[row] - this.childNodes[i].height()
                    );
                    if (i === this.#blocksWidth.length - 1) row++;
                }
            } else {
                if (this.#isFlexCol) {
                    let containerW = 0;
                    if (this.#containerX === undefined) {
                        containerW = this.getRealWidth - this.#containerW;
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
                                        this.childNodes[j + rows].getRealWidth)
                            );
                        }
                    }
                } else {
                    let containerH = 0;
                    if (this.#containerY === undefined) {
                        containerH = this.getRealHeight - this.#containerH;
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
                                        this.childNodes[l + cols].getRealHeight)
                            );
                        }
                    }
                }
            }
        };
        this.#checkLayoutType(
            _type,
            _justify_cont_func,
            _align_cont_func,
            _justify_func,
            _align_func
        );
    }
    #center(_type: TypeContent) {
        const _justify_cont_func = () => {
            if (this.#isGrid) {
                let startX = this.getRealWidth / 2 - this.#containerW / 2;
                this.#containerX = startX > 0 ? startX : 0;
            } else {
                if (this.#isFlexCol) {
                    if (this.#isWrap) {
                        for (
                            let i = 0, len = this.#blocksHeight.length;
                            i < len;
                            i++
                        ) {
                            let startY =
                                this.getRealHeight - this.#blocksHeight[i];
                            this.#startYPos.push((startY > 0 ? startY : 0) / 2);
                        }
                    } else {
                        const startY = this.getRealHeight - this.#containerH;
                        this.#containerY = startY > 0 ? startY / 2 : 0;
                    }
                } else {
                    if (this.#isWrap) {
                        for (
                            let i = 0, len = this.#blocksWidth.length;
                            i < len;
                            i++
                        ) {
                            let startX =
                                this.getRealWidth - this.#blocksWidth[i];
                            this.#startXPos.push((startX > 0 ? startX : 0) / 2);
                        }
                    } else {
                        const startX = this.getRealWidth - this.#containerW;
                        this.#containerX = startX > 0 ? startX / 2 : 0;
                    }
                }
            }
        };
        const _align_cont_func = () => {
            if (this.#isGrid) {
                const startY = this.getRealHeight - this.#containerH;
                this.#containerY =
                    startY > 0 ? startY / this.#layoutRows[0] : 0;
            } else {
                if (!this.#isWrap) return;
                if (this.#isFlexCol) {
                    const startX = this.getRealWidth - this.#containerW;
                    this.#containerX =
                        startX > 0 ? startX / (this.#layoutCols.length + 1) : 0;
                } else {
                    const startY = this.getRealHeight - this.#containerH;
                    this.#containerY =
                        startY > 0 ? startY / (this.#layoutRows.length + 1) : 0;
                }
            }
        };
        const _justify_func = () => {
            for (
                let i = 0, col = 0, len = this.childNodes.length;
                i < len;
                i++, col++
            ) {
                this.#startXPos.push(
                    this.#blocksWidth[col] / 2 -
                        this.childNodes[i].getRealWidth / 2
                );
                if (this.#blocksWidth.length === col) col = 0;
            }
        };
        const _align_func = () => {
            if (this.#isGrid) {
                for (
                    let i = 0, row = 0, len = this.childNodes.length;
                    i < len;
                    i++, row++
                ) {
                    this.#startYPos.push(
                        this.#blocksHeight[row] / 2 -
                            this.childNodes[i].getRealHeight / 2
                    );
                    if (this.#blocksHeight.length - 1 === row) row = 0;
                }
            } else {
                if (this.#isFlexCol) {
                    let containerW = 0;
                    if (this.#containerX === undefined) {
                        containerW = this.getRealWidth - this.#containerW;
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
                                        this.childNodes[j + row].getRealWidth) /
                                        2
                            );
                        }
                    }
                } else {
                    let containerH = 0;
                    if (this.#containerY === undefined) {
                        containerH = this.getRealHeight - this.#containerH;
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
                                        this.childNodes[j + col]
                                            .getRealHeight) /
                                        2
                            );
                        }
                    }
                }
            }
        };
        this.#checkLayoutType(
            _type,
            _justify_cont_func,
            _align_cont_func,
            _justify_func,
            _align_func
        );
    }
    #spaceBetween(_type: TypeContent) {
        const _justify_cont_func = () => {
            if (this.#isGrid) {
                let gap = this.getRealWidth - this.#containerW;
                const nCols =
                    this.#layoutCols[0] - 1 !== 0 ? this.#layoutCols[0] - 1 : 1;
                this.gapColumn(gap > 0 ? gap / nCols : 0);
            } else {
                if (this.#isFlexCol) {
                    if (this.#isWrap) {
                        for (
                            let i = 0, len = this.#blocksHeight.length;
                            i < len;
                            i++
                        ) {
                            let gap =
                                this.getRealHeight - this.#blocksHeight[i];
                            gap =
                                gap > 0
                                    ? gap / (this.#layoutRows[i] - 1 || 1)
                                    : 0;
                            if (this.gapRow() > gap) gap = this.gapRow();
                            this.#rowsGap.push(gap);
                        }
                    } else {
                        let gap = this.getRealHeight - this.#containerH;
                        gap =
                            gap > 0
                                ? gap / (this.childNodes.length - 1 || 1)
                                : 0;
                        this.gapRow(gap);
                    }
                } else {
                    if (this.#isWrap) {
                        for (
                            let i = 0, len = this.#blocksWidth.length;
                            i < len;
                            i++
                        ) {
                            let gap = this.getRealWidth - this.#blocksWidth[i];
                            gap =
                                gap > 0
                                    ? gap / (this.#layoutCols[i] - 1 || 1)
                                    : 0;
                            if (this.gapColumn() > gap) gap = this.gapColumn();
                            this.#columnsGap.push(gap);
                        }
                    } else {
                        let gap = this.getRealWidth - this.#containerW;
                        this.gapColumn(
                            gap > 0
                                ? gap / (this.childNodes.length - 1 || 1)
                                : 0
                        );
                    }
                }
            }
        };
        const _align_cont_func = () => {
            if (this.#isGrid) {
                let gap = this.getRealHeight - this.#containerH;
                this.gapRow(gap > 0 ? gap / (this.#layoutRows[0] || 1) : 0);
            } else {
                if (!this.#isWrap) return;
                if (this.#isFlexCol) {
                    let gap = this.getRealWidth - this.#containerW;
                    this.gapColumn(
                        gap > 0 ? gap / (this.#layoutCols.length - 1 || 1) : 0
                    );
                    this.#containerX = 0;
                } else {
                    let gap = this.getRealHeight - this.#containerH;
                    this.gapRow(
                        gap > 0 ? gap / (this.#layoutRows.length - 1 || 1) : 0
                    );
                    this.#containerY = 0;
                }
            }
        };

        this.#checkLayoutType(_type, _justify_cont_func, _align_cont_func);
    }
    #spaceAround(_type: TypeContent) {
        const _justify_cont_func = () => {
            if (this.#isGrid) {
                let gap = this.getRealWidth - this.#containerW;
                gap = gap > 0 ? gap / this.#layoutCols[0] : 0;
                this.gapColumn(gap);
                this.#containerX = gap / 2;
            } else {
                if (this.#isFlexCol) {
                    if (this.#isWrap) {
                        for (
                            let i = 0, len = this.#blocksHeight.length;
                            i < len;
                            i++
                        ) {
                            let gap =
                                this.getRealHeight - this.#blocksHeight[i];
                            gap =
                                gap > 0 ? gap / (this.#layoutRows[i] || 1) : 0;
                            if (this.gapRow() > gap) gap = this.gapRow();
                            this.#rowsGap.push(gap);
                            this.#startYPos.push(gap / 2);
                        }
                    } else {
                        let gap = this.getRealHeight - this.#containerH;
                        gap = gap > 0 ? gap / this.childNodes.length : 0;
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
                            let gap = this.getRealWidth - this.#blocksWidth[i];
                            gap =
                                gap > 0 ? gap / (this.#layoutCols[i] || 1) : 0;
                            if (this.gapColumn() > gap) gap = this.gapColumn();
                            this.#columnsGap.push(gap);
                            this.#startXPos.push(gap / 2);
                        }
                    } else {
                        let gap = this.getRealWidth - this.#containerW;
                        gap = gap > 0 ? gap / this.childNodes.length : 0;
                        this.gapColumn(gap);
                        this.#containerX = gap / 2;
                    }
                }
            }
        };
        const _align_cont_func = () => {
            if (this.#isGrid) {
                let gap = this.getRealHeight - this.#containerH;
                gap = gap > 0 ? gap / this.#layoutRows[0] : 0;
                this.gapRow(gap);
                this.#containerY = gap / 2;
            } else {
                if (!this.#isWrap) return;
                if (this.#isFlexCol) {
                    let gap = this.getRealWidth - this.#containerW;
                    gap = gap > 0 ? gap / this.#layoutCols.length : 0;
                    this.gapColumn(gap);
                    this.#containerX = gap / 2;
                } else {
                    let gap = this.getRealHeight - this.#containerH;
                    gap = gap > 0 ? gap / this.#layoutRows.length : 0;
                    this.gapRow(gap);
                    this.#containerY = gap / 2;
                }
            }
        };

        this.#checkLayoutType(_type, _justify_cont_func, _align_cont_func);
    }
    #spaceEvenly(_type: TypeContent) {
        const _justify_cont_func = () => {
            if (this.#isGrid) {
                let gap = this.getRealWidth - this.#containerW;
                gap = gap > 0 ? gap / (this.#layoutCols[0] + 1) : 0;
                this.gapColumn(gap);
                this.#containerX = gap;
            } else {
                if (this.#isFlexCol) {
                    if (this.#isWrap) {
                        for (
                            let i = 0, len = this.#blocksHeight.length;
                            i < len;
                            i++
                        ) {
                            let gap =
                                this.getRealHeight - this.#blocksHeight[i];
                            gap = gap > 0 ? gap / (this.#layoutRows[i] + 1) : 0;
                            if (this.gapRow() > gap) gap = this.gapRow();
                            this.#rowsGap.push(gap);
                            this.#startYPos.push(gap);
                        }
                    } else {
                        let gap = this.getRealHeight - this.#containerH;
                        gap = gap > 0 ? gap / (this.childNodes.length + 1) : 0;
                        this.gapRow(gap);
                        this.#containerY = gap;
                    }
                } else {
                    if (this.#isWrap) {
                        for (
                            let i = 0, len = this.#blocksWidth.length;
                            i < len;
                            i++
                        ) {
                            let gap = this.getRealWidth - this.#blocksWidth[i];
                            gap =
                                gap > 0
                                    ? gap / (this.#layoutCols[i] + 1 || 1)
                                    : 0;
                            if (this.gapColumn() > gap) gap = this.gapColumn();
                            this.#columnsGap.push(gap);
                            this.#startXPos.push(gap);
                        }
                    } else {
                        let gap = this.getRealWidth - this.#containerW;
                        gap = gap > 0 ? gap / (this.childNodes.length + 1) : 0;
                        this.gapColumn(gap);
                        this.#containerX = gap;
                    }
                }
            }
        };
        const _align_cont_func = () => {
            if (this.#isGrid) {
                let gap = this.getRealHeight - this.#containerH;
                gap = gap > 0 ? gap / (this.#layoutRows[0] + 1) : 0;
                this.gapRow(gap);
                this.#containerY = gap;
            } else {
                if (!this.#isWrap) return;
                if (this.#isFlexCol) {
                    let gap = this.getRealWidth - this.#containerW;
                    gap =
                        gap > 0 ? gap / (this.#layoutCols.length + 1 || 1) : 0;
                    this.gapColumn(gap);
                    this.#containerX = gap;
                } else {
                    let gap = this.getRealHeight - this.#containerH;
                    gap =
                        gap > 0 ? gap / (this.#layoutRows.length + 1 || 1) : 0;
                    this.gapRow(gap);
                    this.#containerY = gap;
                }
            }
        };

        this.#checkLayoutType(_type, _justify_cont_func, _align_cont_func);
    }

    #flexRow() {
        this.#blocksWidth = [];
        this.#blocksHeight = [];
        this.#layoutCols = [];
        this.#layoutRows = [];

        let colIdx = 0;
        let rowIdx = 0;
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
            block.rotate(0);
            const blockW = block.width();
            if (this.#isWrap) {
                wrapWidth += blockW;
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

                    wrapWidth = blockW;
                }
            }
            const x = startX + block.marginLeft();
            const y = startY + (this.#startYPos[idx] || 0);

            if (containerH < block.getRealHeight)
                containerH = block.getRealHeight;

            let width: number | undefined;
            if (block.flexBasis() !== "auto")
                width = block.flexBasis() as number;

            block.__childAdjustment = (b: Block) => {
                b.x(x);
                b.y(y);
                if (width !== undefined) b.width(width);
            };
            wrapWidth += gapCol;
            startX += gapCol + blockW + block.marginRight();
            containerW += blockW;
            colIdx += 1;
        }, "order");
        this.#blocksWidth.push(containerW);
        this.#blocksHeight.push(containerH);
        this.#layoutCols.push(colIdx);
        this.#layoutRows.push(1);
    }

    #flexColumn() {
        this.#blocksWidth = [];
        this.#blocksHeight = [];
        this.#layoutCols = [];
        this.#layoutRows = [];

        let colIdx = 0;
        let rowIdx = 0;
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
            block.rotate(0);
            const blockH = block.height();

            if (this.#isWrap) {
                wrapHeight += blockH;
                if (wrapHeight > this.getRealHeight) {
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

                    wrapHeight = blockH;
                }
            }

            const x = startX + (this.#startXPos[idx] || 0);
            const y = startY + block.marginTop();

            if (containerW < block.getRealWidth)
                containerW = block.getRealWidth;

            let height: number | undefined;
            if (block.flexBasis() !== "auto")
                height = block.flexBasis() as number;

            block.__childAdjustment = (b: Block) => {
                b.x(x);
                b.y(y);
                if (height !== undefined) b.height(height);
            };
            wrapHeight += gapRow;
            startY += gapRow + blockH + block.marginBottom();
            containerH += blockH;
            rowIdx += 1;
        }, "order");
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
        this.#blocksWidth = [];
        this.#blocksHeight = [];
        this.#layoutCols = [];
        this.#layoutRows = [];

        const cols = this.gridTemplateColumns();
        const rows = this.gridTemplateRows();

        const autoWidths = cols.filter((item: any) => item !== "auto");
        let rWidth = (autoWidths as number[]).reduce(
            (p: number, c: number) => p + c,
            0
        );

        const diffCol = Math.abs(cols.length - autoWidths.length);

        if (diffCol) rWidth = (this.getRealWidth - rWidth) / diffCol;
        else rWidth = this.getRealWidth / cols.length;

        const autoHeights = this.gridTemplateRows().filter(
            (item: any) => item !== "auto"
        );
        const nRows = Math.ceil(this.childNodes.length / cols.length);

        let rHeight = (autoHeights as number[]).reduce(
            (p: number, c: number) => p + c,
            0
        );
        const diffRow = Math.abs(nRows - autoHeights.length);
        if (diffRow) rHeight = (this.getRealHeight - rHeight) / diffRow;
        else rHeight = this.getRealHeight / nRows;

        const maxColWidths: number[] = [];
        const maxRowHeights: number[] = [];

        this.#layoutRows = [nRows];
        this.#layoutCols = [cols.length];

        let startY = this.#containerY || 0;
        let rowCount = 0;
        let rowIdx = 0;
        while (rowIdx < this.#layoutRows[0]) {
            let startX = this.#containerX || 0;
            if (rowIdx == 0) {
                startY = this.#containerY || 0;
                rowCount = 0;
            }

            for (let colIdx = 0; colIdx < this.#layoutCols[0]; colIdx++) {
                let colStart = 0;
                let rowStart = 0;

                const idx =
                    (this.#layoutCols[0] - 1) * rowCount + rowCount + colIdx;

                const block = this.childNodes[idx];
                if (!block) continue;
                block.rotate(0);
                const blockW = block.width();
                const blockH = block.height();
                if (maxColWidths[colIdx]) {
                    if (Math.round(maxColWidths[colIdx]) < Math.round(blockW)) {
                        maxColWidths[colIdx] = blockW;
                        rowIdx -= rowIdx + 1;
                    } else if (
                        !this.justifyContent() &&
                        rWidth > maxColWidths[colIdx]
                    )
                        maxColWidths[colIdx] = rWidth;
                } else maxColWidths.push(blockW || 0);

                if (maxRowHeights[rowCount]) {
                    if (
                        Math.round(maxRowHeights[rowCount]) < Math.round(blockH)
                    )
                        maxRowHeights[rowCount] = blockH;
                    else if (
                        !this.alignContent() &&
                        rHeight > maxRowHeights[rowCount]
                    )
                        maxRowHeights[rowCount] = rHeight;
                } else maxRowHeights.push(blockH || 0);

                let endX = blockW;
                if (cols[colIdx] === "auto" || !cols[colIdx]) {
                    if (endX) colStart = maxColWidths[colIdx];
                    else colStart = endX = rWidth;
                } else {
                    colStart = cols[colIdx] as number;
                    if (!endX) endX = colStart;
                }

                let endY = blockH;
                if (rows[rowCount] === "auto" || !rows[rowCount]) {
                    if (endY) rowStart = maxRowHeights[rowCount];
                    else rowStart = endY = rHeight;
                } else {
                    rowStart = rows[rowCount] as number;
                    if (!endY) endY = rowStart;
                }
                const x = startX + (this.#startXPos[idx] || 0);
                const y = startY + (this.#startYPos[idx] || 0);

                block.__childAdjustment = (b: Block) => {
                    b.width(endX);
                    b.height(endY);
                    b.x(x);
                    b.y(y);
                };

                startX += colStart + this.gapColumn();
            }
            let startYD =
                !rows[rowCount] || rows[rowCount] === "auto"
                    ? maxRowHeights[rowCount]
                    : rows[rowCount];
            startY += (startYD as number) + this.gapRow();
            rowCount += 1;
            rowIdx += 1;
        }
        this.#blocksWidth = maxColWidths;
        this.#blocksHeight = maxRowHeights;
    }
}
