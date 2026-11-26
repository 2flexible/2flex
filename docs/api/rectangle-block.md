---
title: RectangleBlock
description: A rectangle with a fill, an outline, and per-corner radii.
slug: rectangle-block
---

# Class: RectangleBlock\<T\>

A rectangle with a fill, an outline and rounded corners.

## Type Parameters

| Type Parameter                                                                                    | Default type                                          |
| ------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| <a id="type-parameter-t"></a> `T` _extends_ [`RectangleBlockOptions`](rectangle-block-options.md) | [`RectangleBlockOptions`](rectangle-block-options.md) |

## Constructors

### Constructor

```ts
new RectangleBlock<T>(options): RectangleBlock<T>;
```

#### Parameters

| Parameter | Type                                                  |
| --------- | ----------------------------------------------------- |
| `options` | [`RectangleBlockOptions`](rectangle-block-options.md) |

#### Returns

`RectangleBlock`\<`T`\>

## Properties

### backgroundColor

```ts
backgroundColor: OptionAccessor<RectangleBlockOptions, "backgroundColor">;
```

---

### border

```ts
border: OptionAccessor<RectangleBlockOptions, "border">;
```

---

### borderBottom

```ts
borderBottom: OptionAccessor<RectangleBlockOptions, "borderBottom">;
```

---

### borderColor

```ts
borderColor: OptionAccessor<RectangleBlockOptions, "borderColor">;
```

---

### borderLeft

```ts
borderLeft: OptionAccessor<RectangleBlockOptions, "borderLeft">;
```

---

### borderRadius

```ts
borderRadius: OptionAccessor<RectangleBlockOptions, "borderRadius">;
```

---

### borderRight

```ts
borderRight: OptionAccessor<RectangleBlockOptions, "borderRight">;
```

---

### borderStyle

```ts
borderStyle: OptionAccessor<RectangleBlockOptions, "borderStyle">;
```

---

### borderTop

```ts
borderTop: OptionAccessor<RectangleBlockOptions, "borderTop">;
```

---

### borderWidth

```ts
borderWidth: OptionAccessor<RectangleBlockOptions, "borderWidth">;
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

### \_\_clipShape()

```ts
__clipShape(): void;
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
