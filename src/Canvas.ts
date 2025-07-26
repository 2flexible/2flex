import { Tree } from "./Tree";
import {
    BlockElements,
    CursorPos,
    ICustomEvents,
    IStyle,
    IRemovedEvents,
    ICssProperties,
    BlockOptions,
    IBlock,
} from "./types";
import { CanvasDOMManager } from "./DOMManager";
import { IText } from "./TextBlock";

export class Canvas {
    #domCanvas: CanvasDOMManager;
    options: ICssProperties | undefined;
    #canvasEvents: any[] = [];
    canvasId: string;

    #tree = new Tree();

    constructor(
        canvasId: string = "canvas",
        options: ICssProperties | undefined = undefined
    ) {
        this.canvasId = canvasId;
        this.options = options;

        this.#domCanvas = new CanvasDOMManager(canvasId);
        this.#initCanvas();
    }

    get context(): CanvasRenderingContext2D {
        return this.#domCanvas.context;
    }

    get canvas(): HTMLCanvasElement {
        return this.#domCanvas.canvas;
    }

    #initCanvas() {
        this.canvas;
        this.#domCanvas.changeStyle(this.options);
    }

    add(...block: BlockElements[]) {
        this.#tree.addNodes(block);

        this.#tree.pre_order_traversal((element: any) => {
            element.canvas = this;
            element.__initSet();
            this.#handleStyleChanges(element);
            this.#canvasEvents.push(...element.events);
        });
        this.#handleEvents();
    }

    getCursorPosition(event: { clientX: number; clientY: number }) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const cursor: CursorPos = { x, y };
        return cursor;
    }

    #handleEvents() {
        // created events for every same type events beacuse canvas is same, but coridanets changing
        let uniqeEvents: any[] = [];

        for (const item of this.#canvasEvents) {
            const tempUniqe = uniqeEvents?.filter(
                (_item) => _item.eventType === item.eventType
            );
            if (tempUniqe[0]) {
                const idx = uniqeEvents.indexOf(tempUniqe[0]);
                uniqeEvents.splice(idx, 1);
                tempUniqe[0].methods.push(item.method);
                uniqeEvents = [...uniqeEvents, tempUniqe[0]];
            } else {
                uniqeEvents.push({
                    eventType: item.eventType,
                    methods: [item.method],
                });
            }
        }
        this.#canvasEvents = uniqeEvents;

        this.#canvasEvents?.forEach((elem: any) => {
            this.#domCanvas.addEventListener(elem.eventType, (event) => {
                // const cursor = this.getCursorPosition(event);
                elem.methods?.forEach((_method: any) => {
                    _method(event);
                });
            });
        });
    }

    #handleStyleChanges(block: BlockElements): void {
        for (const [key, value] of Object.entries(block.options)) {
            const proto = Object.getPrototypeOf(block);
            const obj = Object.getOwnPropertyDescriptor(proto, key);
            obj?.value.call(block, value);
        }
    }

    invokeChange() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.#tree.pre_order_traversal((element: any) => {
            this.#handleStyleChanges(element);
        });
    }
    // we can do this later as and || or
    find(queries: IBlock<BlockOptions & IText>) {
        return this.#tree.filter_nodes(queries);
    }
}
