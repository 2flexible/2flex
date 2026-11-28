---
title: LineBlock
description: A straight or cubic Bézier line with editable control points.
slug: line-block
---

# Class: LineBlock\<T\>

A straight or a curved line with editable control points.

## Type Parameters

| Type Parameter                                                                          | Default type                                |
| --------------------------------------------------------------------------------------- | ------------------------------------------- |
| <a id="type-parameter-t"></a> `T` _extends_ [`LineBlockOptions`](line-block-options.md) | [`LineBlockOptions`](line-block-options.md) |

## Indexable

```ts
[key: `${string}-${number}`]: OptionAccessor<LineBlockOptions, `${string}-${number}`>
```

## Constructors

### Constructor

```ts
new LineBlock<T>(options): LineBlock<T>;
```

#### Parameters

| Parameter | Type                                        |
| --------- | ------------------------------------------- |
| `options` | [`LineBlockOptions`](line-block-options.md) |

#### Returns

`LineBlock`\<`T`\>

## Properties

### editable

```ts
editable: OptionAccessor<LineBlockOptions, "editable">;
```

---

### controlPoints

```ts
controlPoints: OptionAccessor<LineBlockOptions, "controlPoints">;
```

---

### lineColor

```ts
lineColor: OptionAccessor<LineBlockOptions, "lineColor">;
```

---

### fillColor

```ts
fillColor: OptionAccessor<LineBlockOptions, "fillColor">;
```

---

### closeLine

```ts
closeLine: OptionAccessor<LineBlockOptions, "closeLine">;
```

---

### controlPointsSize

```ts
controlPointsSize: OptionAccessor<LineBlockOptions, "controlPointsSize">;
```

---

### controlLineWidth

```ts
controlLineWidth: OptionAccessor<LineBlockOptions, "controlLineWidth">;
```

---

### controlPointBackgroundColor

```ts
controlPointBackgroundColor: OptionAccessor<LineBlockOptions, "controlPointBackgroundColor">;
```

---

### controlPointStrokeColor

```ts
controlPointStrokeColor: OptionAccessor<LineBlockOptions, "controlPointStrokeColor">;
```

## Methods

### set()

```ts
set(options): void;
```

Writes a set of options at once.

The change is scheduled for the next frame, the block is not drawn
again right away.

#### Parameters

| Parameter | Type | Description           |
| --------- | ---- | --------------------- |
| `options` | `T`  | The options to write. |

#### Returns

`void`

---

### render()

```ts
render(): void;
```

Draws the block on the canvas.

The method is called by the canvas. A block that draws something of its
own overrides it.

#### Returns

`void`

---

### draw()

```ts
draw(_func?): void;
```

#### Parameters

| Parameter | Type       |
| --------- | ---------- |
| `_func?`  | `DrawFunc` |

#### Returns

`void`

---

### updateCordinates()

```ts
updateCordinates(): void;
```

#### Returns

`void`

---

### updateCords()

```ts
updateCords(): void;
```

#### Returns

`void`

---

### \_\_deriveSizeFromChilds()

```ts
__deriveSizeFromChilds(): boolean;
```

#### Returns

`boolean`

---

### addControlPoint()

```ts
addControlPoint(point, index): void;
```

#### Parameters

| Parameter | Type           |
| --------- | -------------- |
| `point`   | `ControlPoint` |
| `index`   | `number`       |

#### Returns

`void`

---

### removeControlPoint()

```ts
removeControlPoint(index): void;
```

#### Parameters

| Parameter | Type     |
| --------- | -------- |
| `index`   | `number` |

#### Returns

`void`

---

### addControlPointToTail()

```ts
addControlPointToTail(point): void;
```

#### Parameters

| Parameter | Type           |
| --------- | -------------- |
| `point`   | `ControlPoint` |

#### Returns

`void`

---

### addControlPointToHead()

```ts
addControlPointToHead(point): void;
```

#### Parameters

| Parameter | Type           |
| --------- | -------------- |
| `point`   | `ControlPoint` |

#### Returns

`void`

---

### removeControlPointTail()

```ts
removeControlPointTail(): void;
```

#### Returns

`void`

---

### removeControlPointHead()

```ts
removeControlPointHead(): void;
```

#### Returns

`void`

---

### checkInBound()

```ts
checkInBound(event): boolean;
```

Tells whether a point of the canvas is inside of the block.

#### Parameters

| Parameter | Type         | Description                          |
| --------- | ------------ | ------------------------------------ |
| `event`   | `MouseEvent` | The event the position is read from. |

#### Returns

`boolean`
