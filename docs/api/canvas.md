---
title: Canvas
description: The rendering surface — construction, options, scene management, history, and viewport control.
slug: canvas
---

# Class: Canvas

The surface the blocks are drawn on.

The canvas owns the viewport, the scene, the render loop, the history and
the handling of the input. One canvas is bound to one `canvas` element.

```ts
const canvas = new Canvas('scene', 800, 600)
```

## Constructors

### Constructor

```ts
new Canvas(
   canvasId,
   width,
   height,
   options?
): Canvas;
```

Creates a canvas and binds it to an element of the page.

#### Parameters

| Parameter  | Type                                                    | Description                                                                         |
| ---------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `canvasId` | `string`                                                | The id of the `canvas` element to draw on.                                          |
| `width`    | `number`                                                | The width of the canvas in pixels.                                                  |
| `height`   | `number`                                                | The height of the canvas in pixels.                                                 |
| `options?` | [`CanvasOptions`](canvas-options.md) & `ICssProperties` | The options of the canvas and the style properties that are applied to the element. |

#### Returns

`Canvas`

## Properties

### canvasId

```ts
canvasId: string;
```

The id of the canvas element the instance is bound to.

---

### width

```ts
width: number;
```

The width of the canvas in pixels.

---

### height

```ts
height: number;
```

The height of the canvas in pixels.

---

### options?

```ts
options?: CanvasOptions & ICssProperties;
```

The options of the canvas, including the style properties.

---

### view

```ts
view: CanvasView;
```

The transform of the viewport.

---

### isFocused

```ts
isFocused: boolean;
```

Whether the canvas has the focus.

---

### isMouseEventAllowed

```ts
isMouseEventAllowed: boolean;
```

Whether the mouse events are delivered to the canvas.

## Accessors

### context

#### Get Signature

```ts
get context(): CanvasRenderingContext2D | null;
```

The rendering context of the canvas element.

##### Returns

`CanvasRenderingContext2D` \| `null`

---

### canvas

#### Get Signature

```ts
get canvas(): HTMLCanvasElement;
```

The canvas element the instance is bound to.

##### Returns

`HTMLCanvasElement`

---

### boundingClientRect

#### Get Signature

```ts
get boundingClientRect(): DOMRect;
```

The rectangle of the canvas element in the coordinates of the page.

##### Returns

`DOMRect`

---

### currentCursor

#### Get Signature

```ts
get currentCursor(): string;
```

The cursor that is applied to the canvas element.

The value is `auto` when no cursor is applied.

##### Returns

`string`

---

### currentPosition

#### Get Signature

```ts
get currentPosition(): CanvasCurrentPosition;
```

The position of the viewport in the coordinates of the canvas.

##### Returns

`CanvasCurrentPosition`

---

### renderScale

#### Get Signature

```ts
get renderScale(): number;
```

The scale the canvas draws in.

The scale is raised while the canvas is zoomed to keep the details
sharp. It falls back to `1` when the canvas came to a rest.

##### Returns

`number`

## Methods

### add()

```ts
add(...blocks): void;
```

Adds one or more blocks to the scene.

The blocks are added to the scene on the next frame.

#### Parameters

| Parameter   | Type                                |
| ----------- | ----------------------------------- |
| ...`blocks` | `BaseBlock`\<`BaseBlockOptions`\>[] |

#### Returns

`void`

---

### remove()

```ts
remove(...blocks): void;
```

Removes one or more blocks from the scene.

The blocks are removed from the scene on the next frame.

#### Parameters

| Parameter   | Type                                |
| ----------- | ----------------------------------- |
| ...`blocks` | `BaseBlock`\<`BaseBlockOptions`\>[] |

#### Returns

`void`

---

### export()

```ts
export(): string;
```

Serializes the scene into a JSON string.

The payload holds the blocks of the scene and their options. A block
that was written by a custom class can only be restored when the class
is registered with [Canvas.registerBlocks](#registerblocks).

#### Returns

`string`

---

### load()

```ts
load(payload): void;
```

Restores a scene from a payload that was made by
[Canvas.export](#export).

The payload replaces the current scene. Register the custom block
classes with [Canvas.registerBlocks](#registerblocks) before the payload is
loaded, so the blocks can be restored.

#### Parameters

| Parameter | Type     |
| --------- | -------- |
| `payload` | `string` |

#### Returns

`void`

---

### registerBlocks()

```ts
registerBlocks(...blocks): void;
```

Registers the custom block classes of the scene.

The classes are needed to restore a scene that was serialized while it
held blocks of a custom class.

#### Parameters

| Parameter   | Type                   |
| ----------- | ---------------------- |
| ...`blocks` | _typeof_ `BaseBlock`[] |

#### Returns

`void`

---

### find()

```ts
find(queries): BaseBlock<BaseBlockOptions>[];
```

Searches the scene and returns every block that matches the query.

#### Parameters

| Parameter | Type         | Description                                 |
| --------- | ------------ | ------------------------------------------- |
| `queries` | `BlockQuery` | The options the blocks are matched against. |

#### Returns

`BaseBlock`\<`BaseBlockOptions`\>[]

---

### undo()

```ts
undo(): void;
```

Reverts the last action of the history.

#### Returns

`void`

---

### redo()

```ts
redo(): void;
```

Applies the last action that was reverted.

#### Returns

`void`

---

### getCursorPosition()

```ts
getCursorPosition(event): {
  x: number;
  y: number;
};
```

Converts the position of an event into the coordinates of the canvas.

#### Parameters

| Parameter | Type                         | Description                          |
| --------- | ---------------------------- | ------------------------------------ |
| `event`   | `MouseEvent` \| `WheelEvent` | The event the position is read from. |

#### Returns

```ts
{
  x: number;
  y: number;
}
```

##### x

```ts
x: number;
```

##### y

```ts
y: number;
```

---

### clearRect()

```ts
clearRect(): void;
```

Removes every block from the scene.

#### Returns

`void`

---

### changeCursor()

```ts
changeCursor(cur?): void;
```

Sets the cursor of the canvas element.

#### Parameters

| Parameter | Type     | Description                             |
| --------- | -------- | --------------------------------------- |
| `cur?`    | `string` | The value of the CSS property `cursor`. |

#### Returns

`void`

---

### resetCursor()

```ts
resetCursor(): void;
```

Restores the default cursor of the canvas element.

#### Returns

`void`

---

### registerCursor()

```ts
registerCursor(nodeId, cursor): void;
```

Registers a cursor for a block.

The cursor is applied when the pointer is over the block.

#### Parameters

| Parameter | Type     | Description                             |
| --------- | -------- | --------------------------------------- |
| `nodeId`  | `number` | The id of the block.                    |
| `cursor`  | `string` | The value of the CSS property `cursor`. |

#### Returns

`void`

---

### unregisterCursor()

```ts
unregisterCursor(nodeId, cursor): void;
```

Removes a cursor that was registered for a block.

#### Parameters

| Parameter | Type     | Description                             |
| --------- | -------- | --------------------------------------- |
| `nodeId`  | `number` | The id of the block.                    |
| `cursor`  | `string` | The value of the CSS property `cursor`. |

#### Returns

`void`

---

### \_\_releaseCanvasCursor()

```ts
__releaseCanvasCursor(): void;
```

#### Returns

`void`

---

### whoIsTheFirst()

```ts
whoIsTheFirst(nodeId): boolean;
```

Tells whether a block is the topmost one of the stacking order.

#### Parameters

| Parameter | Type     | Description          |
| --------- | -------- | -------------------- |
| `nodeId`  | `number` | The id of the block. |

#### Returns

`boolean`

---

### registerZIndex()

```ts
registerZIndex(nodeId, zIndex?): void;
```

Registers the z index of a block.

The block takes part in the stacking order of the scene.

#### Parameters

| Parameter | Type     | Description               |
| --------- | -------- | ------------------------- |
| `nodeId`  | `number` | The id of the block.      |
| `zIndex?` | `number` | The z index of the block. |

#### Returns

`void`

---

### unregisterZIndex()

```ts
unregisterZIndex(nodeId): void;
```

Removes the z index that was registered for a block.

#### Parameters

| Parameter | Type     | Description          |
| --------- | -------- | -------------------- |
| `nodeId`  | `number` | The id of the block. |

#### Returns

`void`

---

### demandInvoke()

```ts
demandInvoke(block): void;
```

#### Parameters

| Parameter | Type        |
| --------- | ----------- |
| `block`   | `BaseBlock` |

#### Returns

`void`

---

### demandAddBlock()

```ts
demandAddBlock(block): void;
```

#### Parameters

| Parameter | Type        |
| --------- | ----------- |
| `block`   | `BaseBlock` |

#### Returns

`void`

---

### demandRemoveBlock()

```ts
demandRemoveBlock(block): void;
```

#### Parameters

| Parameter | Type        |
| --------- | ----------- |
| `block`   | `BaseBlock` |

#### Returns

`void`

---

### demandHistory()

```ts
demandHistory(
   nodeId,
   before,
   after
): void;
```

#### Parameters

| Parameter | Type                            |
| --------- | ------------------------------- |
| `nodeId`  | `number`                        |
| `before`  | `Record`\<`string`, `unknown`\> |
| `after`   | `Record`\<`string`, `unknown`\> |

#### Returns

`void`

---

### demandAddEvent()

```ts
demandAddEvent(
   block,
   event,
   func
): void;
```

#### Parameters

| Parameter | Type                     |
| --------- | ------------------------ |
| `block`   | `BaseBlock`              |
| `event`   | `string`                 |
| `func`    | `CustomEvent`\<`Event`\> |

#### Returns

`void`

---

### demandRemoveEvent()

```ts
demandRemoveEvent(event, func): void;
```

#### Parameters

| Parameter | Type                     |
| --------- | ------------------------ |
| `event`   | `string`                 |
| `func`    | `CustomEvent`\<`Event`\> |

#### Returns

`void`

---

### demandAddAnimation()

```ts
demandAddAnimation(animationId, animation): void;
```

Schedules an animation to be registered.

#### Parameters

| Parameter     | Type       | Description                                       |
| ------------- | ---------- | ------------------------------------------------- |
| `animationId` | `string`   | The id of the animation.                          |
| `animation`   | `Animator` | The function that draws a frame of the animation. |

#### Returns

`void`

---

### demandRemoveAnimation()

```ts
demandRemoveAnimation(animationId): void;
```

Schedules an animation to be removed.

#### Parameters

| Parameter     | Type     | Description              |
| ------------- | -------- | ------------------------ |
| `animationId` | `string` | The id of the animation. |

#### Returns

`void`

---

### demandRefreshHead()

```ts
demandRefreshHead(): void;
```

Schedules the topmost block of the stacking order to be drawn again.

#### Returns

`void`
