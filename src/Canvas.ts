import { Tree } from "./Tree";
import {
    BlockElements,
    CursorPos,
    ICustomEvents,
    IStyle,
    IRemovedEvents,
} from "./types";
import { CanvasDOMManager } from "./DOMManager";

export interface CanvasOptions {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    color?: string;
    stroke?: string;
    margin?: string;
}

const defaultCanvasOpt = {
    x: 0,
    y: 0,
    color: "#FFFFFF",
};

export class Canvas {
    width: number;
    height: number;
    domCanvas: CanvasDOMManager;
    options: CanvasOptions;
    canvasEvents: any[] = [];

    #tree = new Tree();

    constructor(
        width: number,
        height: number,
        options: CanvasOptions | undefined = undefined
    ) {
        this.width = width || 200;
        this.height = height || 200;
        this.options = { ...options, ...defaultCanvasOpt };
        this.domCanvas = new CanvasDOMManager();
        this.#initCanvas();
    }

    get context() {
        this.domCanvas.changeStyle();
        return this.domCanvas.context;
    }

    get canvas() {
        return this.domCanvas.canvas;
    }

    #initCanvas() {
        this.canvas;
    }

    add(...block: BlockElements[]) {
        this.#tree.addNodes(block);

        this.#tree.pre_order_traversal((element: any) => {
            element._context = this.context;
            element.canvas = this;
            element.__initSet();
            element.invoker = this.invokeChange;
            // element.eventInvoker = this.invokeEventChanges;
            this.#handleStyleChanges(element);
            this.canvasEvents.push(...element.events);
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

        for (const item of this.canvasEvents) {
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
        this.canvasEvents = uniqeEvents;

        this.canvasEvents?.forEach((elem: any) => {
            this.domCanvas.addEventListener(elem.eventType, (event) => {
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
        this.context?.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.#tree.pre_order_traversal((element: any) => {
            this.#handleStyleChanges(element);
            // this.#handleEvents(element);
        });
    }
    // invokeEventChanges(new_event: any = undefined) {
    //     this.#tree.pre_order_traversal((element: any) => {
    //         element.removedEvents?.forEach((elem: IRemovedEvents) => {
    //             this.domCanvas.removeEventListener(elem.eventType, elem.method);
    //         });
    //         if (new_event) {
    //             element.events?.forEach((elem: any) => {
    //                 if (elem.eventType === new_event.eventType) {
    //                     this.domCanvas.addEventListener(
    //                         elem.eventType,
    //                         (event) => {
    //                             const cursor = this.getCursorPosition(event);
    //                             elem.method(event, cursor);
    //                         }
    //                     );
    //                 }
    //             });
    //         }
    //     });
    // }
}
