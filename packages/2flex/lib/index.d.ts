type NodeId = number | undefined;
declare class Node {
    #private;
    childNodes: Node[];
    parentNode?: Node;
    nodeId?: NodeId;
    constructor();
    addChild(...node: Node[]): void;
    listAllChilds<T>(_func: (element: T) => void): void;
    listOnlyChilds<B>(_func: (element: B, currIdx: number, arrLen: number) => void, sort?: string, nodes?: Node[]): void;
    resetSort(): void;
    removeChild(child: Node): void;
}

type IBlock<T> = IBlockOptions & T;
type ICssProperties = {
    [key in keyof CSSStyleDeclaration]: CSSStyleDeclaration[key];
};
interface SnapshotObject {
    [key: string]: IBlockOptions;
}
type SnapshotSize = number;
type LinearEasing = (t: number) => number;
type CubicBezier = (t: number, duration: number) => number;
type StepsEasing = (t: number) => number;
type CustomEvent<E = Event> = (event: E & Event) => void;
type inOut = {
    in?: number;
    out?: number;
};

type Easing = "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out" | "step-start" | "step-end" | LinearEasing | CubicBezier | StepsEasing;
type Direction = "normal" | "reverse" | "alternate" | "alternate-reverse";
type Composite$1 = "replace" | "add" | "accumulate";
type Delay = number;
type Iterations = number;
type Duration = number;
type IterationStart = number;
type PlaybackRate = number;
type AutoStart = boolean;
type AlignSelf = "normal" | "auto" | "center" | "start" | "end" | "stertch";
type JustifySelf = "normal" | "auto" | "center" | "start" | "end" | "stertch" | "left" | "right";
type FlexGrow = number;
type FlexShrink = number;
type FlexBasis = RelativeType;
type Flex = [FlexGrow, FlexShrink, FlexBasis];
type Position = "static" | "relative" | "absolute" | "sticky" | "fixed";
type XY = {
    x: number;
    y: number;
};
interface HotCornerArea {
    topLeft: XY;
    topRight: XY;
    bottomLeft: XY;
    bottomRight: XY;
}
type Overflow = "visible" | "hidden" | "clip" | "scroll" | "auto";
type RelativeType = number | string;
interface RunningEvents {
    drag: boolean;
    rotate: boolean;
    resize: boolean;
    selected: boolean;
}
type SelfType = "self" | "parent";
interface IBlockOptions {
    [key: string]: any;
    name?: string;
    x?: RelativeType;
    y?: RelativeType;
    width?: RelativeType;
    height?: RelativeType;
    minWidth?: RelativeType;
    minHeight?: RelativeType;
    maxWidth?: RelativeType;
    maxHeight?: RelativeType;
    position?: Position;
    top?: RelativeType;
    bottom?: RelativeType;
    left?: RelativeType;
    right?: RelativeType;
    overflow?: Overflow;
    overflowX?: Overflow;
    overflowY?: Overflow;
    selectable?: boolean;
    padding?: [RelativeType, RelativeType, RelativeType, RelativeType];
    paddingTop?: RelativeType;
    paddingRight?: RelativeType;
    paddingBottom?: RelativeType;
    paddingLeft?: RelativeType;
    margin?: [RelativeType, RelativeType, RelativeType, RelativeType];
    marginTop?: RelativeType;
    marginRight?: RelativeType;
    marginBottom?: RelativeType;
    marginLeft?: RelativeType;
    zIndex?: number;
    draggable?: boolean;
    onDrag?: (event: MouseEvent) => void;
    dragX?: boolean;
    dragY?: boolean;
    rotate?: number;
    onRotate?: (event: MouseEvent) => void;
    order?: number;
    alignSelf?: AlignSelf;
    justifySelf?: JustifySelf;
    flexShrink?: FlexShrink;
    flexBasis?: FlexBasis;
    flexGrow?: FlexGrow;
    gridRow?: number[];
    gridRowStart?: number;
    gridRowEnd?: number;
    gridColumn?: number[];
    gridColumnStart?: number;
    gridColumnEnd?: number;
    gridArea?: number[];
    hotAreaGap?: number;
    hotCornerSize?: number;
    hotCornerRadius?: number;
    hotCornerStrokeWidth?: number;
    hotCornerStrokeColor?: string;
    hotCornerBackgroundColor?: string;
    hotLineStrokeWidth?: number;
    hotLineStrokeColor?: string;
    hotLines?: boolean;
    rotationTopLeft?: boolean;
    rotationTopRight?: boolean;
    rotationBottomLeft?: boolean;
    rotationBottomRight?: boolean;
    resizeTopLeft?: boolean;
    resizeTopRight?: boolean;
    resizeBottomLeft?: boolean;
    resizeBottomRight?: boolean;
    resizeTop?: boolean;
    resizeLeft?: boolean;
    resizeRight?: boolean;
    resizeBottom?: boolean;
    horizontalFlipResize?: boolean;
    verticalFlipResize?: boolean;
    resizable?: boolean;
    onResize?: (event: MouseEvent) => void;
    hidden?: boolean;
    important?: IBlockOptions;
    rotationCenterX?: RelativeType;
    rotationCenterY?: RelativeType;
    rotationCenter?: SelfType;
    cornerTopLeft?: XY;
    cornerTopRight?: XY;
    cornerBottomLeft?: XY;
    cornerBottomRight?: XY;
    hotCornerTopLeft?: XY;
    hotCornerTopRight?: XY;
    hotCornerBottomLeft?: XY;
    hotCornerBottomRight?: XY;
    hotRotCornerTopLeft?: XY;
    hotRotCornerTopRight?: XY;
    hotRotCornerBottomLeft?: XY;
    hotRotCornerBottomRight?: XY;
    hotRotatableAreaTopLeft?: HotCornerArea;
    hotRotatableAreaTopRight?: HotCornerArea;
    hotRotatableAreaBottomLeft?: HotCornerArea;
    hotRotatableAreaBottomRight?: HotCornerArea;
    hotResizableAreaTopLeft?: HotCornerArea;
    hotResizableAreaTopRight?: HotCornerArea;
    hotResizableAreaBottomLeft?: HotCornerArea;
    hotResizableAreaBottomRight?: HotCornerArea;
    hotResizableAreaTop?: HotCornerArea;
    hotResizableAreaRight?: HotCornerArea;
    hotResizableAreaLeft?: HotCornerArea;
    hotResizableAreaBottom?: HotCornerArea;
    onRender?: () => void;
}
interface BlockPayload {
    nodeId: NodeId;
    name: string;
    options: IBlockOptions;
    ownOptions: IBlockOptions;
    childs: BlockPayload[];
    additionalParams: any[];
}
type BlockEvent = {
    [key: string]: {
        funcs: CustomEvent<any>[];
        identified: string[];
    };
};
interface BindOptions {
    bindTo: Block;
    options: (keyof IBlockOptions)[];
}
type IteratableOpts = {
    [K in keyof IBlockOptions]: IBlockOptions[K][];
};
interface KeyFrame {
    [key: string]: KeyFrame[keyof KeyFrame];
    id?: string;
    autoStart?: AutoStart;
    iterations?: Iterations;
    delay?: Delay;
    direction?: Direction;
    duration?: Duration;
    composite?: Composite$1;
    easing?: Easing;
    iterationStart?: IterationStart;
    playbackRate?: PlaybackRate;
    onFinish?: () => void;
}
type AnimationKeyframe = KeyFrame & IteratableOpts;
type AnimationId = string;
type Animator = (timestamp: number) => void;
type CallbackAnimator = (timestamp: number, easing: number) => void;
interface OverflowCords extends XY {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}
declare class Block<T = IBlockOptions> extends Node {
    #private;
    parentNode?: Block;
    childNodes: Block[];
    canvas?: Canvas;
    ownOptions: IBlock<T>;
    options: IBlock<T>;
    __hidden: boolean;
    __bindOptions: BindOptions[];
    __runningEvents: RunningEvents;
    __events: BlockEvent;
    __overflowCords: OverflowCords;
    __animations: Animator[];
    __clipPath?: Path2D;
    __childClipping?: (b: Block<T>) => void;
    __childAdjustment?: (b: Block<T>) => void;
    constructor(options: IBlock<T>);
    get context(): CanvasRenderingContext2D | undefined;
    render(): void;
    name(opt?: string): undefined;
    onRender(opt?: () => void): () => void;
    __isSelected(): void;
    generatePayload(): BlockPayload;
    addChild(...blocks: Block[]): void;
    removeChild(child: Block): void;
    __addChildInternal(...node: Block[]): void;
    __removeChildInternal(child: Block): void;
    findChilds(queries: IBlockOptions): Block<IBlockOptions>[];
    __clippingPath(): void;
    __clipShape(): void;
    __hotLines(): void;
    hotLines(opt?: boolean): boolean;
    __adjustChildBlocks(): void;
    get useCacheAdjust(): boolean;
    __initCordinates(): void;
    get __isHidden(): boolean;
    get __isHorizontalFlipped(): boolean;
    get __isVerticalFlipped(): boolean;
    __unitConverter<T, O>({ val, widthRelated, }: {
        val?: T;
        widthRelated?: boolean;
    }): O;
    get parentWidth(): number | undefined;
    get parentHeight(): number | undefined;
    get __leftSpace(): number;
    get __rightSpace(): number;
    get __topSpace(): number;
    get __bottomSpace(): number;
    get __widthSpaces(): number;
    get __heightSpaces(): number;
    __valueHandler<T, O>(opt: T | undefined, option: string, defaultOpt: O, widthRelated?: boolean): O;
    __cacheOption<T, O>(opt: T, option: keyof IBlock<IBlockOptions>, defaultOpt: O): any;
    setChangeCache(option: string, old?: any): void;
    getCacheValue(option: string): any;
    optionHasChanged(option: string, currentVal?: any): boolean;
    get cacheChanges(): {
        [key: string]: {
            oldValue: any;
        };
    };
    x(opt?: RelativeType): number;
    y(opt?: RelativeType): number;
    width(opt?: RelativeType): number;
    height(opt?: RelativeType): number;
    minWidth(opt?: RelativeType): number;
    minHeight(opt?: RelativeType): number;
    maxWidth(opt?: RelativeType): number;
    maxHeight(opt?: RelativeType): number;
    position(opt?: Position): Position | undefined;
    top(opt?: RelativeType): undefined;
    bottom(opt?: RelativeType): undefined;
    left(opt?: RelativeType): undefined;
    right(opt?: RelativeType): undefined;
    padding(opt?: number[] | number): number[];
    paddingTop(opt?: RelativeType): number;
    paddingBottom(opt?: RelativeType): number;
    paddingLeft(opt?: RelativeType): number;
    paddingRight(opt?: RelativeType): number;
    margin(opt?: number[]): number[];
    marginTop(opt?: RelativeType): number;
    marginBottom(opt?: RelativeType): number;
    marginLeft(opt?: RelativeType): number;
    marginRight(opt?: RelativeType): number;
    overflow(opt?: Overflow): string;
    overflowX(opt?: Overflow): string;
    overflowY(opt?: Overflow): string;
    cornerTopLeft(opt?: XY): {
        x: number;
        y: number;
    };
    cornerTopRight(opt?: XY): {
        x: number;
        y: number;
    };
    cornerBottomLeft(opt?: XY): {
        x: number;
        y: number;
    };
    cornerBottomRight(opt?: XY): {
        x: number;
        y: number;
    };
    hotCornerTopLeft(opt?: XY): {
        x: number;
        y: number;
    };
    hotCornerTopRight(opt?: XY): {
        x: number;
        y: number;
    };
    hotCornerBottomLeft(opt?: XY): {
        x: number;
        y: number;
    };
    hotCornerBottomRight(opt?: XY): {
        x: number;
        y: number;
    };
    hotRotCornerTopLeft(opt?: XY): {
        x: number;
        y: number;
    };
    hotRotCornerTopRight(opt?: XY): {
        x: number;
        y: number;
    };
    hotRotCornerBottomLeft(opt?: XY): {
        x: number;
        y: number;
    };
    hotRotCornerBottomRight(opt?: XY): {
        x: number;
        y: number;
    };
    hotRotatableAreaTopLeft(opt?: HotCornerArea): {
        topLeft: {
            x: number;
            y: number;
        };
        topRight: {
            x: number;
            y: number;
        };
        bottomLeft: {
            x: number;
            y: number;
        };
        bottomRight: {
            x: number;
            y: number;
        };
    };
    hotRotatableAreaTopRight(opt?: HotCornerArea): {
        topLeft: {
            x: number;
            y: number;
        };
        topRight: {
            x: number;
            y: number;
        };
        bottomLeft: {
            x: number;
            y: number;
        };
        bottomRight: {
            x: number;
            y: number;
        };
    };
    hotRotatableAreaBottomLeft(opt?: HotCornerArea): {
        topLeft: {
            x: number;
            y: number;
        };
        topRight: {
            x: number;
            y: number;
        };
        bottomLeft: {
            x: number;
            y: number;
        };
        bottomRight: {
            x: number;
            y: number;
        };
    };
    hotRotatableAreaBottomRight(opt?: HotCornerArea): {
        topLeft: {
            x: number;
            y: number;
        };
        topRight: {
            x: number;
            y: number;
        };
        bottomLeft: {
            x: number;
            y: number;
        };
        bottomRight: {
            x: number;
            y: number;
        };
    };
    hotResizableAreaTopLeft(opt?: HotCornerArea): {
        topLeft: {
            x: number;
            y: number;
        };
        topRight: {
            x: number;
            y: number;
        };
        bottomLeft: {
            x: number;
            y: number;
        };
        bottomRight: {
            x: number;
            y: number;
        };
    };
    hotResizableAreaTopRight(opt?: HotCornerArea): {
        topLeft: {
            x: number;
            y: number;
        };
        topRight: {
            x: number;
            y: number;
        };
        bottomLeft: {
            x: number;
            y: number;
        };
        bottomRight: {
            x: number;
            y: number;
        };
    };
    hotResizableAreaBottomLeft(opt?: HotCornerArea): {
        topLeft: {
            x: number;
            y: number;
        };
        topRight: {
            x: number;
            y: number;
        };
        bottomLeft: {
            x: number;
            y: number;
        };
        bottomRight: {
            x: number;
            y: number;
        };
    };
    hotResizableAreaBottomRight(opt?: HotCornerArea): {
        topLeft: {
            x: number;
            y: number;
        };
        topRight: {
            x: number;
            y: number;
        };
        bottomLeft: {
            x: number;
            y: number;
        };
        bottomRight: {
            x: number;
            y: number;
        };
    };
    hotResizableAreaTop(opt?: HotCornerArea): {
        topLeft: {
            x: number;
            y: number;
        };
        topRight: {
            x: number;
            y: number;
        };
        bottomLeft: {
            x: number;
            y: number;
        };
        bottomRight: {
            x: number;
            y: number;
        };
    };
    hotResizableAreaBottom(opt?: HotCornerArea): {
        topLeft: {
            x: number;
            y: number;
        };
        topRight: {
            x: number;
            y: number;
        };
        bottomLeft: {
            x: number;
            y: number;
        };
        bottomRight: {
            x: number;
            y: number;
        };
    };
    hotResizableAreaLeft(opt?: HotCornerArea): {
        topLeft: {
            x: number;
            y: number;
        };
        topRight: {
            x: number;
            y: number;
        };
        bottomLeft: {
            x: number;
            y: number;
        };
        bottomRight: {
            x: number;
            y: number;
        };
    };
    hotResizableAreaRight(opt?: HotCornerArea): {
        topLeft: {
            x: number;
            y: number;
        };
        topRight: {
            x: number;
            y: number;
        };
        bottomLeft: {
            x: number;
            y: number;
        };
        bottomRight: {
            x: number;
            y: number;
        };
    };
    hotTopFunc(opt?: (context: CanvasRenderingContext2D) => void): ((context: CanvasRenderingContext2D) => void) | undefined;
    hotLeftFunc(opt?: (context: CanvasRenderingContext2D) => void): ((context: CanvasRenderingContext2D) => void) | undefined;
    hotRightFunc(opt?: (context: CanvasRenderingContext2D) => void): ((context: CanvasRenderingContext2D) => void) | undefined;
    hotBottomFunc(opt?: (context: CanvasRenderingContext2D) => void): ((context: CanvasRenderingContext2D) => void) | undefined;
    hotCornerTopLeftFunc(opt?: (context: CanvasRenderingContext2D) => void): ((context: CanvasRenderingContext2D) => void) | undefined;
    hotCornerTopRightFunc(opt?: (context: CanvasRenderingContext2D) => void): ((context: CanvasRenderingContext2D) => void) | undefined;
    hotCornerBottomLeftFunc(opt?: (context: CanvasRenderingContext2D) => void): ((context: CanvasRenderingContext2D) => void) | undefined;
    hotCornerBottomRightFunc(opt?: (context: CanvasRenderingContext2D) => void): ((context: CanvasRenderingContext2D) => void) | undefined;
    hotAreaSize(opt?: number): number;
    rotationCenter(opt?: SelfType): string;
    rotationCenterX(opt?: RelativeType): number;
    rotationCenterY(opt?: RelativeType): number;
    rotationTopLeft(opt?: boolean): boolean;
    rotationTopRight(opt?: boolean): boolean;
    rotationBottomLeft(opt?: boolean): boolean;
    rotationBottomRight(opt?: boolean): boolean;
    resizeTopLeft(opt?: boolean): boolean;
    resizeTopRight(opt?: boolean): boolean;
    resizeBottomLeft(opt?: boolean): boolean;
    resizeBottomRight(opt?: boolean): boolean;
    resizeTop(opt?: boolean): boolean;
    resizeLeft(opt?: boolean): boolean;
    resizeRight(opt?: boolean): boolean;
    resizeBottom(opt?: boolean): boolean;
    horizontalFlipResize(opt?: boolean): boolean;
    verticalFlipResize(opt?: boolean): boolean;
    dragX(opt?: boolean): boolean;
    dragY(opt?: boolean): boolean;
    hotCornerSize(opt?: number): number;
    hotCornerRadius(opt?: number[]): number[];
    hotCornerStrokeWidth(opt?: number): number;
    hotCornerStrokeColor(opt?: string): string;
    hotCornerBackgroundColor(opt?: string): string;
    hotLineStrokeWidth(opt?: number): number;
    hotLineStrokeColor(opt?: string): string;
    hotAreaGap(opt?: number): number;
    hidden(opt?: boolean): boolean;
    important(opt?: IBlock<T>): IBlock<T> | undefined;
    flex(opt?: Flex): RelativeType[];
    flexBasis(opt?: FlexBasis): FlexBasis;
    flexShrink(opt?: FlexShrink): FlexShrink;
    flexGrow(opt?: FlexGrow): number;
    order(opt?: number): number | undefined;
    alignSelf(opt?: AlignSelf): string;
    justifySelf(opt?: JustifySelf): string;
    gridRow(opt?: number[]): never[];
    gridRowStart(opt?: RelativeType): number;
    gridRowEnd(opt?: RelativeType): number;
    gridColumn(opt?: number[]): never[];
    gridColumnStart(opt?: RelativeType): number;
    gridColumnEnd(opt?: RelativeType): number;
    gridArea(opt?: number[] | string): never[];
    zIndex(opt?: number): number | undefined;
    set(options: IBlock<IBlockOptions | T>): void;
    scale(opt?: number): void;
    __translate(t: {
        x: number;
        y: number;
    }): void;
    __overflowTranslate(t: {
        x: number;
        y: number;
    }): void;
    get isOverflowXScroll(): boolean;
    get isOverflowYScroll(): boolean;
    get isOverflowVisible(): boolean;
    bind(block: Block, options: (keyof IBlockOptions)[]): void;
    rotate(opt?: number): number;
    get getTop(): {
        x: number;
        y: number;
    };
    get getBottom(): {
        x: number;
        y: number;
    };
    get getLeft(): {
        x: number;
        y: number;
    };
    get getRight(): {
        x: number;
        y: number;
    };
    get getRealWidth(): number;
    get getRealHeight(): number;
    get getCenterX(): number;
    get getCenterY(): number;
    __rotateCorners(x: number, y: number, radian: number): {
        x: number;
        y: number;
    };
    animate(keyframes: AnimationKeyframe, callback?: CallbackAnimator): string;
    __animationHandler(animator: Animator): void;
    animationStart(animationId: AnimationId): void;
    animationStop(animationId: AnimationId): void;
    animationFinish(animationId: AnimationId): void;
    animationReverse(animationId: AnimationId): void;
    animationDelay(animationId: AnimationId, value: Delay): void;
    animationPlaybackRate(animationId: AnimationId, value: PlaybackRate): void;
    animationDirection(animationId: AnimationId, value: Direction): void;
    animationDuration(animationId: AnimationId, value: Duration): void;
    animationIterationStart(animationId: AnimationId, value: IterationStart): void;
    animationIterations(animationId: AnimationId, value: Iterations): void;
    animationAutoStart(animationId: AnimationId, value: AutoStart): void;
    easingHanndler(easing: Easing): (t: number, duration: number) => number;
    checkInBound(_event: any): boolean;
    registerZIndex(inOut: inOut): void;
    get ImFirst(): boolean | undefined;
    invokeChange(): void;
    contextMenu(_func: (event: MouseEvent) => void): void;
    click(_func: (event: MouseEvent) => void): void;
    dblclick(_func: (event: MouseEvent) => void): void;
    mousedown(_func: (event: MouseEvent) => void): void;
    mouseup(_func: (event: MouseEvent) => void): void;
    mousemove(_func: (event: MouseEvent) => void): void;
    mouseenter(_func: (event: MouseEvent) => void): void;
    mouseleave(_func: (event: MouseEvent) => void): void;
    /** @Todo
     mouseover and mouseout
     has little bug when two chidls cross each other there are isMouse over happens to be true but one is under so check in bound checks it under the higher z index element
    */
    mouseover(_func: (event: MouseEvent) => void): void;
    mouseout(_func: (event: MouseEvent) => void): void;
    keydown(_func: (event: KeyboardEvent) => void): void;
    keyup(_func: (event: KeyboardEvent) => void): void;
    wheel(_func: (event: WheelEvent) => void): void;
    eventHandler<E extends Event>(type: string, _func: CustomEvent<E>, identify?: string): void;
    selectable(opt?: boolean): boolean;
    onRotate(opt?: (event: MouseEvent) => void): (event: MouseEvent) => void;
    rotatable(opt?: boolean): boolean;
    onResize(opt?: (event: MouseEvent) => void): (event: MouseEvent) => void;
    resizable(opt?: boolean): boolean;
    onDrag(opt?: (event: MouseEvent) => void): (event: MouseEvent) => void;
    draggable(opt?: boolean): boolean;
}

type Composite = "source-over" | "source-in" | "source-out" | "source-atop" | "destination-over" | "destination-in" | "destination-out" | "destination-atop" | "lighter" | "copy" | "xor" | "multiply" | "screen" | "overlay" | "darken" | "lighten" | "color-dodge" | "color-burn" | "hard-light" | "soft-light" | "difference" | "exclusion" | "hue" | "saturation" | "color" | "luminosity";
interface CanvasOptions {
    zoomSpeed?: number;
    zoomInvSpeed?: number;
    moveSpeed?: number;
    zoom?: "center" | "point";
    keyboardMovement?: boolean;
    mouseMovement?: boolean;
    history?: boolean;
    historySize?: SnapshotSize;
    x?: number;
    y?: number;
    z?: number;
    fps?: number;
    alpha?: number;
    composite?: Composite;
}
declare class Canvas {
    #private;
    canvasId: string;
    width: number;
    height: number;
    options?: CanvasOptions & ICssProperties;
    currentCursor: string;
    __positionCords: {
        x: number;
        y: number;
        z: number;
    };
    constructor(canvasId?: string, width?: number, height?: number, options?: CanvasOptions & ICssProperties);
    get context(): CanvasRenderingContext2D;
    get canvas(): HTMLCanvasElement;
    setOptions(): void;
    add(...block: Block[]): void;
    remove(block: Block): void;
    export(): string;
    load(payload: string): void;
    registerBlocks(...blocks: Block[]): void;
    find(queries: IBlockOptions): Block[];
    get canvasBounding(): DOMRect;
    get isFocused(): boolean;
    getCursorPosition(event: MouseEvent): {
        x: number;
        y: number;
    };
    whoIsTheFirst(zIndex?: number): boolean;
    registerZIndex(inOutZ: inOut): void;
    __handleOptions(block: Block): void;
    __takeInitSnaphshot(block: Block): void;
    __takeBlockSnapshot<T>(parentBlock: Block<T>, before: any): void;
    __collectAnimations(block: Block): void;
    __clearAnimations(block: Block): void;
    registerAnimation(nodeId: string, func: Animator): void;
    removeAnimation(nodeId: string): void;
    __collectEvents(block: Block): void;
    __clearEvents<T>(block: Block<T>): void;
    registerEvent(event: string, callFunc: CustomEvent<Event>): void;
    removeEvent(event: string, callFunc: CustomEvent<Event>): void;
    invokeChange(_func?: (block: Block) => void): void;
    invokeNodeListing(): void;
    refreshHead(): void;
    takeSnapshot(before: SnapshotObject, after: SnapshotObject): void;
    inBoundElement(element: Block): boolean;
    animationInvoker(): void;
    clearRect(): void;
    changeCursor(cur?: string): void;
    undo(): void;
    redo(): void;
}

interface CursorPos {
    x: number;
    y: number;
}
type LineJoinOpt = "miter" | "round" | "bevel";
type LineDashOffset = number;
type LineDash = number[];
type LineWidth = number;
type LineCapOpt = "butt" | "round" | "square";
type FillRule = CanvasFillRule;
type strokeStyle = string;
type FillStyle = string;
type Fill = boolean;
type Storke = boolean;
type Font = string;
interface DrawText {
    text: string;
    x: number;
    y: number;
    maxWidth: number;
}
type FontStretch = "normal" | "ultra-condensed" | "extra-condensed" | "condensed" | "semi-condensed" | "semi-expanded" | "expanded" | "extra-expanded" | "ultra-expanded";
type TextAlign = "start" | "end" | "center" | "left" | "right";
type TextDirection = "ltr" | "rtl";
type TextBaseline = "alphabetic" | "top" | "hanging" | "middle" | "ideographic" | "bottom";
type FontKerning = "normal" | "auto" | "none";
type FontVariantCaps = "normal" | "small-caps" | "all-small-caps" | "petite-caps" | "all-petite-caps" | "unicase" | "titling-caps";
type FontWeight = "normal" | "bold" | "bolder" | "lighter" | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
type FontStyle = "normal" | "italic" | "oblique";
type FontVariant = "normal" | "small-caps";
type TextRendering = "auto" | "optimizeSpeed" | "optimizeLegibility" | "geometricPrecision";
interface GradientStops {
    stop: number;
    color: string;
}
interface QuadraticCurveToOpt {
    cpx1: number;
    cpy1: number;
    endX: number;
    endY: number;
}
interface BezierCurveToOpt extends QuadraticCurveToOpt {
    cpx2: number;
    cpy2: number;
}
interface RadialGradient {
    x0: number;
    y0: number;
    r0: number;
    x1: number;
    y1: number;
    r1: number;
}
interface LinearGradient {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
}
interface ConicGradient {
    angle: number;
    x: number;
    y: number;
}
interface RectOpt extends CursorPos {
    x: number;
    y: number;
    width: number;
    height: number;
}
interface RoundRectOpt extends RectOpt {
    borderRadius: number[];
}
interface PointInPath extends CursorPos {
    path?: Path2D;
    fillRule?: FillRule;
}
interface PointInStroke extends CursorPos {
    path?: Path2D;
}
interface Clip {
    path?: Path2D;
    fillRule?: CanvasFillRule;
}
interface ShapeFilters {
    [key: string]: string | undefined;
    blur?: string;
    brightness?: string;
    contrast?: string;
    dropShadow?: string;
    grayscale?: string;
    hueRotate?: string;
    saturate?: string;
    sepia?: string;
}
interface Arc {
    x: number;
    y: number;
    radius: number;
    startAngle: number;
    endAngle: number;
    counterclockwise?: boolean;
}
interface ArcTo {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    radius: number;
}
interface Ellipse {
    x: number;
    y: number;
    radiusX: number;
    radiusY: number;
    rotation: number;
    startAngle: number;
    endAngle: number;
    counterclockwise?: number;
}
interface IShapeOptions {
    fill?: Fill;
    fillStyle?: FillStyle;
    stroke?: Storke;
    strokeStyle?: strokeStyle;
    line?: CursorPos;
    lineWidth?: LineWidth;
    lineDash?: LineDash[];
    lineCap?: LineCapOpt;
    lineJoin?: LineJoinOpt;
    bezierCurve?: BezierCurveToOpt;
    quadraticCurve?: QuadraticCurveToOpt;
    rect?: RectOpt;
    roundRect?: RoundRectOpt;
    strokeRect?: RectOpt;
    pointInPath?: PointInPath;
    pointInStroke?: PointInStroke;
    moveTo?: CursorPos;
    radialGradient?: RadialGradient;
    linearGradient?: LinearGradient;
    conicGradient?: ConicGradient;
    colorStops?: GradientStops[];
    blur?: number;
    brightness?: number;
    contrast?: number;
    dropShadow?: number;
    grayscale?: number;
    hueRotate?: number;
    saturate?: number;
    sepia?: number;
    fillText?: DrawText;
    strokeText?: DrawText;
    fontWeight?: FontWeight;
    fontStyle?: FontStyle;
    fontVariant?: FontVariant;
    fontStretch?: FontStretch;
    fontKerning?: FontKerning;
    fontVariantCaps?: FontVariantCaps;
    textBaseline?: TextBaseline;
    textRendering?: TextRendering;
    wordSpacing?: string;
    letterSpacing?: string;
    direction?: TextDirection;
    clip?: Clip;
    pathData?: string;
}
declare class ShapeBlock<T> extends Block<T | IShapeOptions> {
    #private;
    __filters: ShapeFilters;
    constructor(options: IBlock<IShapeOptions>);
    render(): void;
    draw(_func?: (context: CanvasRenderingContext2D) => void): void;
    beginPath(): void;
    closePath(): void;
    clip(opt?: Clip): void | undefined;
    fill(opt?: Fill): boolean;
    fillStyle(opt?: FillStyle): string;
    conicGradient(opt?: ConicGradient): CanvasGradient | undefined;
    radialGradient(opt?: RadialGradient): CanvasGradient | undefined;
    linearGradient(opt?: LinearGradient): CanvasGradient | undefined;
    colorStops(opt?: GradientStops[]): GradientStops[];
    stroke(opt?: Storke): boolean;
    strokeStyle(opt?: strokeStyle): string;
    lineCap(opt?: LineCapOpt): string;
    lineWidth(opt?: LineWidth): number;
    shadowBlur(opt?: number): number;
    shadowColor(opt?: string): string;
    shadowOffsetX(opt?: number): number;
    shadowOffsetY(opt?: number): number;
    lineDash(opt?: LineDash): never[];
    lineDashOffset(opt?: LineDashOffset): number;
    line(opt?: CursorPos): {
        x: number;
        y: number;
    };
    quadraticCurveTo(opt?: QuadraticCurveToOpt): void;
    bezierCurveTo(opt?: BezierCurveToOpt): void;
    fillRect(opt?: RectOpt): void;
    rect(opt?: RectOpt): void;
    roundRect(opt?: RoundRectOpt): void;
    strokeRect(opt?: RectOpt): void;
    arc(opt?: Arc): void;
    arcTo(opt?: ArcTo): void;
    ellipse(opt?: Ellipse): void;
    moveTo(opt?: CursorPos): void;
    lineJoin(opt?: LineJoinOpt): string;
    pointInPath(opt?: PointInPath): boolean;
    pointInStroke(opt: PointInStroke): boolean;
    font(opt?: Font): string;
    fillText(opt?: DrawText): void;
    strokeText(opt?: DrawText): void;
    fontStretch(opt?: FontStretch): string;
    fontKerning(opt?: FontKerning): string;
    fontVariantCaps(opt?: FontVariantCaps): string;
    wordSpacing(opt?: string): string;
    direction(opt?: TextDirection): string;
    letterSpacing(opt?: string): string;
    textAlign(opt?: TextAlign): string;
    textBaseline(opt?: TextBaseline): string;
    textRendering(opt?: TextRendering): string;
    measureText(opt?: string): TextMetrics | undefined;
    blur(opt?: number): undefined;
    brightness(opt?: number): undefined;
    contrast(opt?: number): undefined;
    dropShadow(opt?: [number, number, number, string][]): undefined;
    grayscale(opt?: number): undefined;
    hueRotate(opt?: number): undefined;
    opacity(opt?: number): undefined;
    saturate(opt?: number): undefined;
    sepia(opt?: number): undefined;
    pathData(opt?: string): undefined;
}

interface VideoOptions {
}
declare class VideoBlock extends ShapeBlock<VideoOptions> {
    #private;
    constructor(source: HTMLVideoElement, options: IBlock<VideoOptions>);
    draw(_func?: (context: CanvasRenderingContext2D) => void): void;
    source(opt?: HTMLVideoElement): undefined;
    pause(): void;
    play(): void;
    get isPlaying(): boolean;
    get isPaused(): boolean;
    onPlay(func?: (timestamp: number) => undefined): (timestamp: number) => void;
}

type BorderStyle$1 = "solid" | "dotted";
interface ICircleOptions {
    radius?: number;
    radiusX?: number;
    radiusY?: number;
    startAngle?: number;
    endAngle?: number;
    backgroundColor: number;
    border: string;
    borderStyle: BorderStyle$1;
    borderWidth: number;
    borderColor: string;
}
declare class CircleBlock extends ShapeBlock<ICircleOptions> {
    #private;
    constructor(options: IBlock<ICircleOptions>);
    draw(_func?: (context: CanvasRenderingContext2D) => void): void;
    radius(opt?: number): number;
    radiusX(opt?: number): number;
    radiusY(opt?: number): number;
    innerRadius(opt?: number): number;
    startAngle(opt?: number): number;
    endAngle(opt?: number): number;
    backgroundColor(opt?: string): string;
    borderWidth(opt?: number): number;
    borderColor(opt?: string): string;
    borderStyle(opt?: BorderStyle$1): BorderStyle$1;
    border(opt?: string): string | undefined;
    __clipShape(): void;
}

type ObjectFit = "contain" | "cover" | "fill";
type Smoothing = "low" | "medium" | "high";
type Repeat = number | "fill";
type ImageSource = string | HTMLImageElement;
interface ImageOptions {
    clipX?: number;
    clipY?: number;
    clipWidth?: number;
    clipHeight?: number;
    objectFit?: ObjectFit;
    smoothing?: boolean;
    smoothingQuality?: Smoothing;
    repeatX?: Repeat;
    repeatY?: Repeat;
}
declare class ImageBlock extends ShapeBlock<ImageOptions> {
    #private;
    constructor(source: ImageSource, options: IBlock<ImageOptions>);
    draw(_func?: (context: CanvasRenderingContext2D) => void): void;
    source(opt?: ImageSource): undefined;
    get isRepeat(): boolean;
    smoothing(opt?: boolean): boolean;
    smoothingQuality(opt?: Smoothing): string;
    repeatX(opt?: Repeat): undefined;
    repeatY(opt?: Repeat): undefined;
    clipX(opt?: number): number;
    clipY(opt?: number): number;
    clipWidth(opt?: number): number;
    clipHeight(opt?: number): number;
    objectFit(opt?: ObjectFit): undefined;
}

interface StickyLine {
    block?: Block;
    x: number;
    y: number;
}
type LineType = "line" | "cubicBezier";
interface ILineOptions {
    lineType: LineType;
    startX?: number;
    startY?: number;
    endX?: number;
    endY?: number;
    startControlX: number;
    startControlY: number;
    endControlX: number;
    endControlY: number;
    startDraggable?: boolean;
    endDraggable?: boolean;
    startControllable?: boolean;
    endControllable?: boolean;
    lineWidth?: number;
    lineColor?: number;
    backgroundColor?: number;
    closePath?: boolean;
    joinTo?: LineBlock;
    controlPointsSize?: number;
    editable?: boolean;
    stickStart?: StickyLine;
    stickEnd?: StickyLine;
}
declare class LineBlock extends ShapeBlock<ILineOptions> {
    #private;
    path?: Path2D;
    pathLine?: Path2D;
    pathC1?: Path2D;
    pathC2?: Path2D;
    pathC3?: Path2D;
    pathC4?: Path2D;
    __joined: boolean;
    __editable: boolean;
    __points: {
        x: number[];
        y: number[];
    };
    __stickyStartBlock: {
        x?: number;
        y?: number;
        width?: number;
        height?: number;
    };
    __stickyEndBlock: {
        x?: number;
        y?: number;
        width?: number;
        height?: number;
    };
    constructor(options: IBlock<ILineOptions>);
    render(): void;
    __initCordinates(): void;
    joinTo(opt?: LineBlock): LineBlock | undefined;
    draw(_func?: (context: CanvasRenderingContext2D) => void): void;
    __hotLines(): void;
    checkInBound(_event: MouseEvent): boolean;
    lineType(opt?: LineType): string;
    x(opt?: number | string): number;
    y(opt?: number | string): number;
    width(opt?: number | string): number;
    height(opt?: number | string): number;
    startX(opt?: number): number;
    startY(opt?: number): number;
    endX(opt?: number): number;
    endY(opt?: number): number;
    startControlX(opt?: number): number;
    startControlY(opt?: number): number;
    endControlX(opt?: number): number;
    endControlY(opt?: number): number;
    stickStart(opt?: StickyLine): StickyLine;
    stickEnd(opt?: StickyLine): StickyLine;
    startDraggable(opt?: boolean): boolean;
    endDraggable(opt?: boolean): boolean;
    startControllable(opt?: boolean): boolean;
    endControllable(opt?: boolean): boolean;
    controlPointsSize(opt?: number): number;
    editable(opt?: boolean): boolean;
    closePath(opt?: boolean): boolean;
    lineColor(opt?: string): undefined;
    backgroundColor(opt?: string): undefined;
    scale(opt?: number): void;
}

type BorderStyle = "solid" | "dotted" | undefined;
interface IRectangleOptions {
    borderRadius: number[];
    borderStyle: BorderStyle;
    borderWidth: number;
    borderColor: string;
    backgroundColor: number;
    border: string;
    borderTop: string;
    borderBottom: string;
    borderLeft: string;
    borderRight: string;
}
declare class RectangleBlock extends ShapeBlock<IRectangleOptions> {
    #private;
    constructor(options: IBlock<IRectangleOptions>);
    draw(_func?: ((context: CanvasRenderingContext2D) => void) | undefined): void;
    borderRadius(opt?: number[] | number): number[];
    backgroundColor(opt?: FillStyle): string;
    border(opt?: string): undefined;
    borderWidth(opt?: number): undefined;
    borderColor(opt?: string): undefined;
    borderStyle(opt?: BorderStyle): BorderStyle;
    borderTop(opt?: string): undefined;
    borderRight(opt?: string): undefined;
    borderBottom(opt?: string): undefined;
    borderLeft(opt?: string): undefined;
    __clipShape(): void;
}

type Wrap = "letter" | "word" | "nowrap";
interface ITextOptions {
    text?: string;
    color?: string;
    strokeWidth?: number;
    strokeColor?: string;
    fontFamily?: string;
    fontWeight?: FontWeight;
    fontSize?: number | string;
    fontStyle?: FontStyle;
    fontVariant?: FontVariant;
    fontStretch?: FontStretch;
    fontKerning?: FontKerning;
    fontVariantCaps?: FontVariantCaps;
    textBaseline?: TextBaseline;
    textRendering?: TextRendering;
    wordSpacing?: string;
    letterSpacing?: string;
    direction?: TextDirection;
    editable?: boolean;
    resizeLineHeight?: boolean;
    wrap?: Wrap;
    onEdit?: () => void;
}
declare class TextBlock extends ShapeBlock<ITextOptions> {
    #private;
    constructor(text: string, options: IBlock<ITextOptions>);
    draw(_func?: (context: CanvasRenderingContext2D) => void): void;
    get useCacheText(): boolean;
    __hotLines(): void;
    editable(opt?: boolean): boolean;
    get isEditbale(): any;
    onEdit(opt?: (event: KeyboardEvent) => void): (event: KeyboardEvent) => void;
    text(opt?: string): string;
    get isWrapWord(): boolean;
    fontFamily(opt?: string): string;
    fontSize(opt?: number | string): number;
    fontWeight(opt?: FontWeight): string;
    fontVariant(opt?: FontVariant): string;
    fontStyle(opt?: FontStyle): string;
    color(opt?: string): undefined;
    strokeColor(opt?: strokeStyle): undefined;
    strokeWidth(opt?: number): number;
    resizeLineHeight(opt?: boolean): boolean;
    wrap(opt?: Wrap): string;
    scale(opt?: number): void;
    generatePayload(): BlockPayload;
}

type JustifyContent = "normal" | "space-evenly" | "space-around" | "space-between" | "center" | "start" | "end" | "stretch";
type JustifyItems = "normal" | "stretch" | "start" | "end" | "center" | "left" | "right";
type AlignContent = "normal" | "space-evenly" | "space-around" | "space-between" | "center" | "start" | "end" | "stretch";
type AlignItems = "normal" | "start" | "center" | "end" | "stretch";
type PlaceContent = AlignContent & JustifyContent;
type PlaceItems = AlignItems & JustifyItems;
type FlexDirecton = "column" | "column-reverse" | "row" | "row-reverse";
type FlexWrap = "nowrap" | "wrap" | "wrap-reverse";
type FlexFlow = [FlexDirecton, FlexWrap];
type GridAutoFlow = "row" | "column" | "dense" | "row dense" | "column dense";
interface FlexLayout {
    flexDirection: FlexDirecton;
    flexWrap: FlexWrap;
    flexFlow: FlexFlow;
}
type Gap = number | number[];
interface GridLayout {
    grid: number[];
    gridTemplateAreas: string[];
    gridTemplate: number[];
    gridTemplateColumns: number[] | number;
    gridTemplateRows: number[] | number;
    gap: Gap;
    columnGap: number;
    rowGap: number;
    gridAutoRows?: number[];
    gridAutoColumns?: number[];
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
declare class LayoutBlock extends Block<LayoutOptions> {
    #private;
    constructor(options: IBlock<LayoutOptions>);
    __adjustChildBlocks(): void;
    layout(opt?: ILayout): ILayout;
    flexFlow(opt?: FlexFlow): string[];
    flexDirection(opt?: FlexDirecton): string;
    flexWrap(opt?: FlexWrap): string;
    placeContent(opt?: PlaceContent): string;
    placeItems(opt?: PlaceItems): string;
    gap(opt?: Gap): Gap;
    gridTemplate(opt?: number[][]): never[];
    gridAutoFlow(opt?: GridAutoFlow): string;
    gridTemplateColumns(opt?: number[] | string[]): number[] | string[];
    gridTemplateRows(opt?: number[] | string[]): number[] | string[];
    gapColumn(opt?: number): number;
    gapRow(opt?: number): number;
    columnStart(opt?: number): number;
    columnEnd(opt?: number): number;
    justifyContent(opt?: JustifyContent): JustifyContent;
    justifyItems(opt?: JustifyItems): JustifyItems;
    alignContent(opt?: AlignContent): AlignContent;
    alignItems(opt?: AlignItems): AlignItems;
}

declare function bezierEasing(p1x: number, p1y: number, p2x: number, p2y: number): CubicBezier;
declare function cubicBezier(p0: number, p1: number, p2: number, p3: number, t: number): number;

export { Block, Canvas, CircleBlock, ImageBlock, LayoutBlock, LineBlock, RectangleBlock, ShapeBlock, TextBlock, VideoBlock, bezierEasing, cubicBezier };
