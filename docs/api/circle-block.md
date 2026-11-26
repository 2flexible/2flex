---
title: CircleBlock
description: A circle, an ellipse, an arc, or a pie slice.
slug: circle-block
---

# Class: CircleBlock\<T\>

A circle, an ellipse, an arc or a pie slice.

## Type Parameters

| Type Parameter                                                                              | Default type                                    |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| <a id="type-parameter-t"></a> `T` _extends_ [`CircleBlockOptions`](circle-block-options.md) | [`CircleBlockOptions`](circle-block-options.md) |

## Constructors

### Constructor

```ts
new CircleBlock<T>(options): CircleBlock<T>;
```

#### Parameters

| Parameter | Type                                            |
| --------- | ----------------------------------------------- |
| `options` | [`CircleBlockOptions`](circle-block-options.md) |

#### Returns

`CircleBlock`\<`T`\>

## Properties

### backgroundColor

```ts
backgroundColor: OptionAccessor<CircleBlockOptions, "backgroundColor">;
```

---

### border

```ts
border: OptionAccessor<CircleBlockOptions, "border">;
```

---

### borderColor

```ts
borderColor: OptionAccessor<CircleBlockOptions, "borderColor">;
```

---

### borderStyle

```ts
borderStyle: OptionAccessor<CircleBlockOptions, "borderStyle">;
```

---

### borderWidth

```ts
borderWidth: OptionAccessor<CircleBlockOptions, "borderWidth">;
```

---

### startAngle

```ts
startAngle: OptionAccessor<CircleBlockOptions, "startAngle">;
```

---

### endAngle

```ts
endAngle: OptionAccessor<CircleBlockOptions, "endAngle">;
```

---

### innerRadius

```ts
innerRadius: OptionAccessor<CircleBlockOptions, "innerRadius">;
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

---

### \_\_clipShape()

```ts
__clipShape(): void;
```

#### Returns

`void`
