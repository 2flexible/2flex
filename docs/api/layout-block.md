---
title: LayoutBlock
description: A container that places its children with flexbox or with a grid.
slug: layout-block
---

# Class: LayoutBlock\<T\>

A block that places its children with a layout.

The block lays its children out with flexbox or with a grid.

## Type Parameters

| Type Parameter                                                                              | Default type                                    |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| <a id="type-parameter-t"></a> `T` _extends_ [`LayoutBlockOptions`](layout-block-options.md) | [`LayoutBlockOptions`](layout-block-options.md) |

## Constructors

### Constructor

```ts
new LayoutBlock<T>(options): LayoutBlock<T>;
```

#### Parameters

| Parameter | Type                                            |
| --------- | ----------------------------------------------- |
| `options` | [`LayoutBlockOptions`](layout-block-options.md) |

#### Returns

`LayoutBlock`\<`T`\>

## Methods

### \_\_isOption()

```ts
__isOption(key): boolean;
```

#### Parameters

| Parameter | Type     |
| --------- | -------- |
| `key`     | `string` |

#### Returns

`boolean`

---

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

### updateCords()

```ts
updateCords(): void;
```

#### Returns

`void`

---

### addChild()

```ts
addChild(block): void;
```

Adds a child to the block.

The child is added to the scene on the next frame.

#### Parameters

| Parameter | Type        | Description       |
| --------- | ----------- | ----------------- |
| `block`   | `BaseBlock` | The block to add. |

#### Returns

`void`

---

### listOnlyChilds()

```ts
listOnlyChilds<T>(_func): void;
```

#### Type Parameters

| Type Parameter                                                                  |
| ------------------------------------------------------------------------------- |
| <a id="type-parameter-t-1"></a> `T` _extends_ `BaseBlock`\<`BaseBlockOptions`\> |

#### Parameters

| Parameter | Type                                     |
| --------- | ---------------------------------------- |
| `_func`   | (`block`, `currIdx`, `arrLen`) => `void` |

#### Returns

`void`

---

### removeChild()

```ts
removeChild(block): void;
```

Removes a child from the block.

The child is removed from the scene on the next frame.

#### Parameters

| Parameter | Type        | Description          |
| --------- | ----------- | -------------------- |
| `block`   | `BaseBlock` | The block to remove. |

#### Returns

`void`

---

### updateChildsCordinate()

```ts
updateChildsCordinate(): void;
```

#### Returns

`void`

---

### layout()

```ts
layout(opt?): ILayout;
```

#### Parameters

| Parameter | Type      |
| --------- | --------- |
| `opt?`    | `ILayout` |

#### Returns

`ILayout`

---

### flexFlow()

```ts
flexFlow(opt?): string[];
```

#### Parameters

| Parameter | Type       |
| --------- | ---------- |
| `opt?`    | `FlexFlow` |

#### Returns

`string`[]

---

### flexDirection()

```ts
flexDirection(opt?): string;
```

#### Parameters

| Parameter | Type           |
| --------- | -------------- |
| `opt?`    | `FlexDirecton` |

#### Returns

`string`

---

### flexWrap()

```ts
flexWrap(opt?): string;
```

#### Parameters

| Parameter | Type       |
| --------- | ---------- |
| `opt?`    | `FlexWrap` |

#### Returns

`string`

---

### placeContent()

```ts
placeContent(opt?): string;
```

#### Parameters

| Parameter | Type                                                                                                                            |
| --------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `opt?`    | \| `"normal"` \| `"center"` \| `"space-evenly"` \| `"space-around"` \| `"space-between"` \| `"start"` \| `"end"` \| `"stretch"` |

#### Returns

`string`

---

### placeItems()

```ts
placeItems(opt?): string;
```

#### Parameters

| Parameter | Type                                                            |
| --------- | --------------------------------------------------------------- |
| `opt?`    | `"normal"` \| `"center"` \| `"start"` \| `"end"` \| `"stretch"` |

#### Returns

`string`

---

### gap()

```ts
gap(opt?): Gap;
```

#### Parameters

| Parameter | Type  |
| --------- | ----- |
| `opt?`    | `Gap` |

#### Returns

`Gap`

---

### gridTemplate()

```ts
gridTemplate(opt?): never[];
```

#### Parameters

| Parameter | Type           |
| --------- | -------------- |
| `opt?`    | `GridTemplate` |

#### Returns

`never`[]

---

### gridAutoFlow()

```ts
gridAutoFlow(opt?): string;
```

#### Parameters

| Parameter | Type           |
| --------- | -------------- |
| `opt?`    | `GridAutoFlow` |

#### Returns

`string`

---

### gridTemplateColumns()

```ts
gridTemplateColumns(opt?): string[] | number[];
```

#### Parameters

| Parameter | Type                     |
| --------- | ------------------------ |
| `opt?`    | `string`[] \| `number`[] |

#### Returns

`string`[] \| `number`[]

---

### gridTemplateRows()

```ts
gridTemplateRows(opt?): string[] | number[];
```

#### Parameters

| Parameter | Type                     |
| --------- | ------------------------ |
| `opt?`    | `string`[] \| `number`[] |

#### Returns

`string`[] \| `number`[]

---

### gapColumn()

```ts
gapColumn(opt?): number;
```

#### Parameters

| Parameter | Type           |
| --------- | -------------- |
| `opt?`    | `RelativeType` |

#### Returns

`number`

---

### gapRow()

```ts
gapRow(opt?): number;
```

#### Parameters

| Parameter | Type           |
| --------- | -------------- |
| `opt?`    | `RelativeType` |

#### Returns

`number`

---

### columnStart()

```ts
columnStart(opt?): number;
```

#### Parameters

| Parameter | Type     |
| --------- | -------- |
| `opt?`    | `number` |

#### Returns

`number`

---

### columnEnd()

```ts
columnEnd(opt?): number;
```

#### Parameters

| Parameter | Type     |
| --------- | -------- |
| `opt?`    | `number` |

#### Returns

`number`

---

### justifyContent()

```ts
justifyContent(opt?): JustifyContent;
```

#### Parameters

| Parameter | Type             |
| --------- | ---------------- |
| `opt?`    | `JustifyContent` |

#### Returns

`JustifyContent`

---

### justifyItems()

```ts
justifyItems(opt?): JustifyItems;
```

#### Parameters

| Parameter | Type           |
| --------- | -------------- |
| `opt?`    | `JustifyItems` |

#### Returns

`JustifyItems`

---

### alignContent()

```ts
alignContent(opt?): AlignContent;
```

#### Parameters

| Parameter | Type           |
| --------- | -------------- |
| `opt?`    | `AlignContent` |

#### Returns

`AlignContent`

---

### alignItems()

```ts
alignItems(opt?): AlignItems;
```

#### Parameters

| Parameter | Type         |
| --------- | ------------ |
| `opt?`    | `AlignItems` |

#### Returns

`AlignItems`

---

### \_\_deriveSizeFromChilds()

```ts
__deriveSizeFromChilds(): boolean;
```

#### Returns

`boolean`
