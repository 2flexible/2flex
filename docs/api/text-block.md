---
title: TextBlock
description: Editable, wrappable text with full font control.
slug: text-block
---

# Class: TextBlock\<T\>

A text that can be edited on the canvas.

## Type Parameters

| Type Parameter                                                                          | Default type                                |
| --------------------------------------------------------------------------------------- | ------------------------------------------- |
| <a id="type-parameter-t"></a> `T` _extends_ [`TextBlockOptions`](text-block-options.md) | [`TextBlockOptions`](text-block-options.md) |

## Constructors

### Constructor

```ts
new TextBlock<T>(options): TextBlock<T>;
```

#### Parameters

| Parameter | Type                                        |
| --------- | ------------------------------------------- |
| `options` | [`TextBlockOptions`](text-block-options.md) |

#### Returns

`TextBlock`\<`T`\>

## Properties

### color

```ts
color: OptionAccessor<TextBlockOptions, "color">;
```

---

### fontFamily

```ts
fontFamily: OptionAccessor<TextBlockOptions, "fontFamily">;
```

---

### fontSize

```ts
fontSize: OptionAccessor<TextBlockOptions, "fontSize">;
```

---

### fontStyle

```ts
fontStyle: OptionAccessor<TextBlockOptions, "fontStyle">;
```

---

### fontVariant

```ts
fontVariant: OptionAccessor<TextBlockOptions, "fontVariant">;
```

---

### fontWeight

```ts
fontWeight: OptionAccessor<TextBlockOptions, "fontWeight">;
```

---

### lineHeight

```ts
lineHeight: OptionAccessor<TextBlockOptions, "lineHeight">;
```

---

### strokeWidth

```ts
strokeWidth: OptionAccessor<TextBlockOptions, "strokeWidth">;
```

---

### wrap

```ts
wrap: OptionAccessor<TextBlockOptions, "wrap">;
```

---

### onEditable

```ts
onEditable: OptionAccessor<TextBlockOptions, "onEditable">;
```

---

### text

```ts
text: OptionAccessor<TextBlockOptions, "text">;
```

---

### editable

```ts
editable: OptionAccessor<TextBlockOptions, "editable">;
```

---

### strokeColor

```ts
strokeColor: OptionAccessor<TextBlockOptions, "strokeColor">;
```

---

### caret

```ts
caret: OptionAccessor<TextBlockOptions, "caret">;
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

### init()

```ts
init(): void;
```

#### Returns

`void`

---

### measureText()

```ts
measureText(text): TextMetrics | undefined;
```

#### Parameters

| Parameter | Type     |
| --------- | -------- |
| `text`    | `string` |

#### Returns

`TextMetrics` \| `undefined`

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
