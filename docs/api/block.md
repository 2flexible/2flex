---
title: Block
description: The base of every block — the options, the children, and the handling of the events.
slug: block
---

# Class: Block\<T\>

A block that has no visuals of its own.

The class is the base of every block that draws something. It brings the
options of the mixins together, so a block can be moved, resized, rotated,
selected and animated.

## Type Parameters

| Type Parameter                                                                 | Default type                       |
| ------------------------------------------------------------------------------ | ---------------------------------- |
| <a id="type-parameter-t"></a> `T` _extends_ [`BlockOptions`](block-options.md) | [`BlockOptions`](block-options.md) |

## Constructors

### Constructor

```ts
new Block<T>(options): Block<T>;
```

#### Parameters

| Parameter | Type                               |
| --------- | ---------------------------------- |
| `options` | [`BlockOptions`](block-options.md) |

#### Returns

`Block`\<`T`\>

## Properties

### name

```ts
name: OptionAccessor<BaseBlockOptions, "name">;
```

The name of the block.

The name is used to find a block with [Canvas.find](canvas.md#find).

---

### x

```ts
x: OptionAccessor;
```

The horizontal position of the block.

The value is a number of pixels or a relative value, for example `50%`
or `2rem`.

---

### y

```ts
y: OptionAccessor;
```

The vertical position of the block.

---

### cornerTopLeft

```ts
cornerTopLeft: OptionAccessor;
```

The position of the top left corner of the block.

The corners are set by the layout of the parent, setting them by hand
takes the block out of the layout.

---

### cornerTopRight

```ts
cornerTopRight: OptionAccessor;
```

The position of the top right corner of the block.

---

### cornerBottomLeft

```ts
cornerBottomLeft: OptionAccessor;
```

The position of the bottom left corner of the block.

---

### cornerBottomRight

```ts
cornerBottomRight: OptionAccessor;
```

The position of the bottom right corner of the block.

---

### width

```ts
width: OptionAccessor;
```

The width of the block.

---

### height

```ts
height: OptionAccessor;
```

The height of the block.

---

### minWidth

```ts
minWidth: OptionAccessor;
```

The smallest width the block can have.

---

### minHeight

```ts
minHeight: OptionAccessor;
```

The smallest height the block can have.

---

### maxWidth

```ts
maxWidth: OptionAccessor;
```

The biggest width the block can have.

---

### maxHeight

```ts
maxHeight: OptionAccessor;
```

The biggest height the block can have.

---

### scale

```ts
scale: OptionAccessor;
```

The scale of the block.

---

### position

```ts
position: OptionAccessor;
```

The way the block is placed in its parent.

The value is `relative`, `absolute`, `fixed` or `sticky`.

---

### top

```ts
top: OptionAccessor;
```

The distance to the top edge of the parent.

---

### bottom

```ts
bottom: OptionAccessor;
```

The distance to the bottom edge of the parent.

---

### left

```ts
left: OptionAccessor;
```

The distance to the left edge of the parent.

---

### right

```ts
right: OptionAccessor;
```

The distance to the right edge of the parent.

---

### padding

```ts
padding: OptionAccessor<BaseBlockOptions, "padding">;
```

The space between the border of the block and its children.

---

### paddingTop

```ts
paddingTop: OptionAccessor;
```

The space between the top border of the block and its children.

---

### paddingRight

```ts
paddingRight: OptionAccessor;
```

The space between the right border of the block and its children.

---

### paddingBottom

```ts
paddingBottom: OptionAccessor;
```

The space between the bottom border of the block and its children.

---

### paddingLeft

```ts
paddingLeft: OptionAccessor;
```

The space between the left border of the block and its children.

---

### margin

```ts
margin: OptionAccessor<BaseBlockOptions, "margin">;
```

The space around the block.

---

### marginTop

```ts
marginTop: OptionAccessor;
```

The space above the block.

---

### marginRight

```ts
marginRight: OptionAccessor;
```

The space to the right of the block.

---

### marginBottom

```ts
marginBottom: OptionAccessor;
```

The space below the block.

---

### marginLeft

```ts
marginLeft: OptionAccessor;
```

The space to the left of the block.

---

### rotate

```ts
rotate: OptionAccessor;
```

The rotation of the block in radians.

---

### rotationCenterX

```ts
rotationCenterX: OptionAccessor;
```

The horizontal coordinate of the centre of the rotation.

---

### rotationCenterY

```ts
rotationCenterY: OptionAccessor;
```

The vertical coordinate of the centre of the rotation.

---

### rotationCenter

```ts
rotationCenter: OptionAccessor;
```

The point of the block the rotation turns around.

The value is `self`, `parent` or `custom`.

---

### horizontalFlip

```ts
horizontalFlip: OptionAccessor<BaseBlockOptions, "horizontalFlip">;
```

Whether the block is mirrored on its vertical axis.

---

### verticalFlip

```ts
verticalFlip: OptionAccessor<BaseBlockOptions, "verticalFlip">;
```

Whether the block is mirrored on its horizontal axis.

---

### zIndex

```ts
zIndex: OptionAccessor<BaseBlockOptions, "zIndex">;
```

The z index of the block.

The block takes part in the stacking order of the scene when the value
is set.

---

### order

```ts
order: OptionAccessor<BaseBlockOptions, "order">;
```

The order of the block in its parent.

---

### hidden

```ts
hidden: OptionAccessor<BaseBlockOptions, "hidden">;
```

Whether the block is drawn.

A hidden block is not drawn and its children are not drawn either.

---

### important

```ts
important: OptionAccessor;
```

The options that are set on the block itself and not on its parent.

---

### flexShrink

```ts
flexShrink: OptionAccessor<BaseBlockOptions, "flexShrink">;
```

---

### flexBasis

```ts
flexBasis: OptionAccessor;
```

---

### flexGrow

```ts
flexGrow: OptionAccessor<BaseBlockOptions, "flexGrow">;
```

---

### onRender

```ts
onRender: OptionAccessor;
```

---

### dependencies

```ts
dependencies: OptionAccessor;
```

---

### parentNode?

```ts
parentNode?: BaseBlock<BaseBlockOptions>;
```

The block this block is a child of.

---

### childNodes

```ts
childNodes: Set<BaseBlock<BaseBlockOptions>>;
```

The children of the block.

---

### canvas?

```ts
canvas?: Canvas;
```

The canvas the block is drawn on.

---

### context?

```ts
context?: OffscreenCanvasRenderingContext2D | null;
```

The rendering context of the canvas.

---

### options

```ts
options: OptionsMap;
```

The options of the block.

---

### cacheOptions

```ts
cacheOptions: OptionsMap;
```

The options of the block that were measured and cached.

---

### initOptions

```ts
initOptions: OptionsMap;
```

The options the block was created with.

---

### realWidth

```ts
realWidth: number;
```

The width of the block in pixels.

---

### realHeight

```ts
realHeight: number;
```

The height of the block in pixels.

---

### realCenterX

```ts
realCenterX: number;
```

The horizontal centre of the block in pixels.

---

### realCenterY

```ts
realCenterY: number;
```

The vertical centre of the block in pixels.

---

### boundingBox

```ts
boundingBox: HotCornerArea;
```

The area of the block that holds the handles of the transformation.

---

### \_\_childAdjustment?

```ts
__childAdjustment?: (b) => void;
```

#### Parameters

| Parameter | Type        |
| --------- | ----------- |
| `b`       | `BaseBlock` |

#### Returns

`void`

---

### \_\_childClipping?

```ts
__childClipping?: (b) => void;
```

#### Parameters

| Parameter | Type        |
| --------- | ----------- |
| `b`       | `BaseBlock` |

#### Returns

`void`

---

### \_\_childsContainer

```ts
__childsContainer: ChildsContainer;
```

---

### \_\_parentHidden

```ts
__parentHidden: boolean = false;
```

---

### \_\_parentRotate

```ts
__parentRotate: number = 0;
```

---

### \_\_rotateCache

```ts
__rotateCache: number = 0;
```

---

### \_\_applyOptionsOnly

```ts
__applyOptionsOnly: boolean = false;
```

---

### nodeId?

```ts
nodeId?: NodeId;
```

---

### \_\_clipPath?

```ts
__clipPath?: Path2D;
```

---

### clipChild?

```ts
clipChild?: (b) => void;
```

#### Parameters

| Parameter | Type        |
| --------- | ----------- |
| `b`       | `BaseBlock` |

#### Returns

`void`

---

### overflow

```ts
overflow: OptionAccessor<IOverflowOptions, "overflow">;
```

---

### overflowX

```ts
overflowX: OptionAccessor<IOverflowOptions, "overflowX">;
```

---

### overflowY

```ts
overflowY: OptionAccessor<IOverflowOptions, "overflowY">;
```

---

### overflowPositionX

```ts
overflowPositionX: OptionAccessor<IOverflowOptions, "overflowPositionX">;
```

---

### overflowPositionY

```ts
overflowPositionY: OptionAccessor<IOverflowOptions, "overflowPositionY">;
```

---

### hotCornerSize

```ts
hotCornerSize: OptionAccessor<IHotLineOptions, "hotCornerSize">;
```

---

### hotCornerRadius

```ts
hotCornerRadius: OptionAccessor<IHotLineOptions, "hotCornerRadius">;
```

---

### hotCornerStrokeWidth

```ts
hotCornerStrokeWidth: OptionAccessor<IHotLineOptions, "hotCornerStrokeWidth">;
```

---

### hotCornerStrokeColor

```ts
hotCornerStrokeColor: OptionAccessor<IHotLineOptions, "hotCornerStrokeColor">;
```

---

### hotCornerBackgroundColor

```ts
hotCornerBackgroundColor: OptionAccessor<IHotLineOptions, "hotCornerBackgroundColor">;
```

---

### hotLineStrokeWidth

```ts
hotLineStrokeWidth: OptionAccessor<IHotLineOptions, "hotLineStrokeWidth">;
```

---

### hotLineStrokeColor

```ts
hotLineStrokeColor: OptionAccessor<IHotLineOptions, "hotLineStrokeColor">;
```

---

### hotLines

```ts
hotLines: OptionAccessor<IHotLineOptions, "hotLines">;
```

---

### selectable

```ts
selectable: OptionAccessor<ISelectableOptions, "selectable">;
```

---

### resizable

```ts
resizable: OptionAccessor<IResizableOptions, "resizable">;
```

---

### resizableTop

```ts
resizableTop: OptionAccessor<IResizableOptions, "resizableTop">;
```

---

### resizableLeft

```ts
resizableLeft: OptionAccessor<IResizableOptions, "resizableLeft">;
```

---

### resizableRight

```ts
resizableRight: OptionAccessor<IResizableOptions, "resizableRight">;
```

---

### resizableBottom

```ts
resizableBottom: OptionAccessor<IResizableOptions, "resizableBottom">;
```

---

### resizableTopLeft

```ts
resizableTopLeft: OptionAccessor<IResizableOptions, "resizableTopLeft">;
```

---

### resizableTopRight

```ts
resizableTopRight: OptionAccessor<IResizableOptions, "resizableTopRight">;
```

---

### resizableBottomLeft

```ts
resizableBottomLeft: OptionAccessor<IResizableOptions, "resizableBottomLeft">;
```

---

### resizableBottomRight

```ts
resizableBottomRight: OptionAccessor<IResizableOptions, "resizableBottomRight">;
```

---

### hotResizableAreaTop

```ts
hotResizableAreaTop: OptionAccessor<IResizableOptions, "hotResizableAreaTop">;
```

---

### hotResizableAreaRight

```ts
hotResizableAreaRight: OptionAccessor<IResizableOptions, "hotResizableAreaRight">;
```

---

### hotResizableAreaLeft

```ts
hotResizableAreaLeft: OptionAccessor<IResizableOptions, "hotResizableAreaLeft">;
```

---

### hotResizableAreaBottom

```ts
hotResizableAreaBottom: OptionAccessor<IResizableOptions, "hotResizableAreaBottom">;
```

---

### hotResizableAreaTopLeft

```ts
hotResizableAreaTopLeft: OptionAccessor<IResizableOptions, "hotResizableAreaTopLeft">;
```

---

### hotResizableAreaTopRight

```ts
hotResizableAreaTopRight: OptionAccessor<IResizableOptions, "hotResizableAreaTopRight">;
```

---

### hotResizableAreaBottomLeft

```ts
hotResizableAreaBottomLeft: OptionAccessor<IResizableOptions, "hotResizableAreaBottomLeft">;
```

---

### hotResizableAreaBottomRight

```ts
hotResizableAreaBottomRight: OptionAccessor<IResizableOptions, "hotResizableAreaBottomRight">;
```

---

### onResizable

```ts
onResizable: OptionAccessor<IResizableOptions, "onResizable">;
```

---

### horizontalFlipResize

```ts
horizontalFlipResize: OptionAccessor<IResizableOptions, "horizontalFlipResize">;
```

---

### verticalFlipResize

```ts
verticalFlipResize: OptionAccessor<IResizableOptions, "verticalFlipResize">;
```

---

### hotResizableAreaSize

```ts
hotResizableAreaSize: OptionAccessor<IResizableOptions, "hotResizableAreaSize">;
```

---

### hotResizableAreaGap

```ts
hotResizableAreaGap: OptionAccessor<IResizableOptions, "hotResizableAreaGap">;
```

---

### rotatable

```ts
rotatable: OptionAccessor<IRotatableOptions, "rotatable">;
```

---

### rotatableTopLeft

```ts
rotatableTopLeft: OptionAccessor<IRotatableOptions, "rotatableTopLeft">;
```

---

### rotatableTopRight

```ts
rotatableTopRight: OptionAccessor<IRotatableOptions, "rotatableTopRight">;
```

---

### rotatableBottomLeft

```ts
rotatableBottomLeft: OptionAccessor<IRotatableOptions, "rotatableBottomLeft">;
```

---

### rotatableBottomRight

```ts
rotatableBottomRight: OptionAccessor<IRotatableOptions, "rotatableBottomRight">;
```

---

### hotRotatableAreaTopLeft

```ts
hotRotatableAreaTopLeft: OptionAccessor<IRotatableOptions, "hotRotatableAreaTopLeft">;
```

---

### hotRotatableAreaTopRight

```ts
hotRotatableAreaTopRight: OptionAccessor<IRotatableOptions, "hotRotatableAreaTopRight">;
```

---

### hotRotatableAreaBottomLeft

```ts
hotRotatableAreaBottomLeft: OptionAccessor<IRotatableOptions, "hotRotatableAreaBottomLeft">;
```

---

### hotRotatableAreaBottomRight

```ts
hotRotatableAreaBottomRight: OptionAccessor<IRotatableOptions, "hotRotatableAreaBottomRight">;
```

---

### onRotatable

```ts
onRotatable: OptionAccessor<IRotatableOptions, "onRotatable">;
```

---

### hotRotatableAreaSize

```ts
hotRotatableAreaSize: OptionAccessor<IRotatableOptions, "hotRotatableAreaSize">;
```

---

### hotRotatableAreaGap

```ts
hotRotatableAreaGap: OptionAccessor<IRotatableOptions, "hotRotatableAreaGap">;
```

---

### draggable

```ts
draggable: OptionAccessor<IDraggableOptions, "draggable">;
```

---

### draggableX

```ts
draggableX: OptionAccessor<IDraggableOptions, "draggableX">;
```

---

### draggableY

```ts
draggableY: OptionAccessor<IDraggableOptions, "draggableY">;
```

---

### onDraggable

```ts
onDraggable: OptionAccessor<IDraggableOptions, "onDraggable">;
```

## Accessors

### isMouseEventAllowed

#### Get Signature

```ts
get isMouseEventAllowed(): boolean;
```

##### Returns

`boolean`

---

### \_\_hasParentBlock

#### Get Signature

```ts
get __hasParentBlock(): boolean;
```

##### Returns

`boolean`

---

### \_\_parentWidth

#### Get Signature

```ts
get __parentWidth(): number;
```

##### Returns

`number`

---

### \_\_parentHeight

#### Get Signature

```ts
get __parentHeight(): number;
```

##### Returns

`number`

---

### \_\_isOverflowXScroll

#### Get Signature

```ts
get __isOverflowXScroll(): boolean;
```

##### Returns

`boolean`

---

### \_\_isOverflowYScroll

#### Get Signature

```ts
get __isOverflowYScroll(): boolean;
```

##### Returns

`boolean`

---

### \_\_isOverflowXAuto

#### Get Signature

```ts
get __isOverflowXAuto(): boolean;
```

##### Returns

`boolean`

---

### \_\_isOverflowYAuto

#### Get Signature

```ts
get __isOverflowYAuto(): boolean;
```

##### Returns

`boolean`

---

### \_\_isOverflowXAutoAllowScrool

#### Get Signature

```ts
get __isOverflowXAutoAllowScrool(): boolean;
```

##### Returns

`boolean`

---

### \_\_isOverflowYAutoAllowScrool

#### Get Signature

```ts
get __isOverflowYAutoAllowScrool(): boolean;
```

##### Returns

`boolean`

---

### \_\_isOverflowXScrollable

#### Get Signature

```ts
get __isOverflowXScrollable(): boolean;
```

##### Returns

`boolean`

---

### \_\_isOverflowYScrollable

#### Get Signature

```ts
get __isOverflowYScrollable(): boolean;
```

##### Returns

`boolean`

---

### \_\_overflowRightGap

#### Get Signature

```ts
get __overflowRightGap(): number;
```

##### Returns

`number`

---

### \_\_overflowBottomGap

#### Get Signature

```ts
get __overflowBottomGap(): number;
```

##### Returns

`number`

---

### \_\_isOverflowExists

#### Get Signature

```ts
get __isOverflowExists(): boolean;
```

##### Returns

`boolean`

---

### \_\_isOverflowYExists

#### Get Signature

```ts
get __isOverflowYExists(): boolean;
```

##### Returns

`boolean`

---

### \_\_isOverflowXExists

#### Get Signature

```ts
get __isOverflowXExists(): boolean;
```

##### Returns

`boolean`

---

### \_\_isOverflowVisible

#### Get Signature

```ts
get __isOverflowVisible(): boolean;
```

##### Returns

`boolean`

## Methods

### init()

```ts
init(): void;
```

#### Returns

`void`

---

### \_\_isHidden()

```ts
__isHidden(): boolean;
```

#### Returns

`boolean`

---

### \_\_zIndex()

```ts
__zIndex(): number | undefined;
```

#### Returns

`number` \| `undefined`

---

### \_\_opensStackingContext()

```ts
__opensStackingContext(): boolean;
```

#### Returns

`boolean`

---

### \_\_getdHighestChildOrder()

```ts
__getdHighestChildOrder(): number;
```

#### Returns

`number`

---

### \_\_deriveSizeFromChilds()

```ts
__deriveSizeFromChilds(): boolean;
```

#### Returns

`boolean`

---

### \_\_setDerivedWidth()

```ts
__setDerivedWidth(width): boolean;
```

#### Parameters

| Parameter | Type     |
| --------- | -------- |
| `width`   | `number` |

#### Returns

`boolean`

---

### \_\_setDerivedHeight()

```ts
__setDerivedHeight(height): boolean;
```

#### Parameters

| Parameter | Type     |
| --------- | -------- |
| `height`  | `number` |

#### Returns

`boolean`

---

### rotateCordinates()

```ts
rotateCordinates(radian): void;
```

#### Parameters

| Parameter | Type     |
| --------- | -------- |
| `radian`  | `number` |

#### Returns

`void`

---

### addProperty()

```ts
addProperty<TBlock, TVal, TResolved>(
   method,
   defaultValue,
   widthRelated?,
   func?,
   valueConverter?
): void;
```

#### Type Parameters

| Type Parameter                                                                          | Default type                      |
| --------------------------------------------------------------------------------------- | --------------------------------- |
| <a id="type-parameter-tblock"></a> `TBlock` _extends_ `BaseBlock`\<`BaseBlockOptions`\> | `BaseBlock`\<`BaseBlockOptions`\> |
| <a id="type-parameter-tval"></a> `TVal`                                                 | `unknown`                         |
| <a id="type-parameter-tresolved"></a> `TResolved`                                       | `TVal`                            |

#### Parameters

| Parameter         | Type                                                  |
| ----------------- | ----------------------------------------------------- |
| `method`          | `string`                                              |
| `defaultValue`    | `TResolved`                                           |
| `widthRelated?`   | `boolean`                                             |
| `func?`           | (`block`, `opt`) => `void`                            |
| `valueConverter?` | `ValueConverterFunc`\<`TVal`, `TResolved`, `TBlock`\> |

#### Returns

`void`

---

### removeProperty()

```ts
removeProperty(method): void;
```

#### Parameters

| Parameter | Type     |
| --------- | -------- |
| `method`  | `string` |

#### Returns

`void`

---

### getOptionCache()

#### Call Signature

```ts
getOptionCache<K>(key):
  | ResolvedValue<NonNullable<BaseBlockOptions[K]>>
  | undefined;
```

##### Type Parameters

| Type Parameter                                                       |
| -------------------------------------------------------------------- |
| <a id="type-parameter-k"></a> `K` _extends_ keyof `BaseBlockOptions` |

##### Parameters

| Parameter | Type |
| --------- | ---- |
| `key`     | `K`  |

##### Returns

\| [`ResolvedValue`](resolved-value.md)\<`NonNullable`\<`BaseBlockOptions`\[`K`\]\>\>
\| `undefined`

#### Call Signature

```ts
getOptionCache<V>(key): V | undefined;
```

##### Type Parameters

| Type Parameter                    | Default type |
| --------------------------------- | ------------ |
| <a id="type-parameter-v"></a> `V` | `unknown`    |

##### Parameters

| Parameter | Type     |
| --------- | -------- |
| `key`     | `string` |

##### Returns

`V` \| `undefined`

---

### getOptionCurrent()

#### Call Signature

```ts
getOptionCurrent<K>(key):
  | ResolvedValue<NonNullable<BaseBlockOptions[K]>>
  | undefined;
```

##### Type Parameters

| Type Parameter                                                         |
| ---------------------------------------------------------------------- |
| <a id="type-parameter-k-1"></a> `K` _extends_ keyof `BaseBlockOptions` |

##### Parameters

| Parameter | Type |
| --------- | ---- |
| `key`     | `K`  |

##### Returns

\| [`ResolvedValue`](resolved-value.md)\<`NonNullable`\<`BaseBlockOptions`\[`K`\]\>\>
\| `undefined`

#### Call Signature

```ts
getOptionCurrent<V>(key): V | undefined;
```

##### Type Parameters

| Type Parameter                      | Default type |
| ----------------------------------- | ------------ |
| <a id="type-parameter-v-1"></a> `V` | `unknown`    |

##### Parameters

| Parameter | Type     |
| --------- | -------- |
| `key`     | `string` |

##### Returns

`V` \| `undefined`

---

### setOptionCache()

```ts
setOptionCache(key, value): void;
```

#### Parameters

| Parameter | Type      |
| --------- | --------- |
| `key`     | `string`  |
| `value`   | `unknown` |

#### Returns

`void`

---

### setOptionCurrent()

```ts
setOptionCurrent(key, value): void;
```

#### Parameters

| Parameter | Type      |
| --------- | --------- |
| `key`     | `string`  |
| `value`   | `unknown` |

#### Returns

`void`

---

### \_\_refreshHeadBlock()

```ts
__refreshHeadBlock(): void;
```

#### Returns

`void`

---

### \_\_boxWidth()

```ts
__boxWidth(): number;
```

#### Returns

`number`

---

### \_\_boxHeight()

```ts
__boxHeight(): number;
```

#### Returns

`number`

---

### \_\_valueHandler()

```ts
__valueHandler<T, O>(
   opt,
   option,
   defaultOpt,
   widthRelated?,
   valueConverter?
): O;
```

#### Type Parameters

| Type Parameter                      |
| ----------------------------------- |
| <a id="type-parameter-t-1"></a> `T` |
| <a id="type-parameter-o"></a> `O`   |

#### Parameters

| Parameter         | Type                                                                |
| ----------------- | ------------------------------------------------------------------- |
| `opt`             | `T` \| `undefined`                                                  |
| `option`          | `string`                                                            |
| `defaultOpt`      | `O`                                                                 |
| `widthRelated?`   | `boolean`                                                           |
| `valueConverter?` | `ValueConverterFunc`\<`T`, `O`, `BaseBlock`\<`BaseBlockOptions`\>\> |

#### Returns

`O`

---

### \_\_initResolved()

```ts
__initResolved(key): unknown;
```

#### Parameters

| Parameter | Type     |
| --------- | -------- |
| `key`     | `string` |

#### Returns

`unknown`

---

### \_\_cacheOption()

```ts
__cacheOption<I, O>(
   opt,
   option,
   defaultOpt
):
  | {
}
  | O
  | null;
```

#### Type Parameters

| Type Parameter                      |
| ----------------------------------- |
| <a id="type-parameter-i"></a> `I`   |
| <a id="type-parameter-o-1"></a> `O` |

#### Parameters

| Parameter    | Type     |
| ------------ | -------- |
| `opt`        | `I`      |
| `option`     | `string` |
| `defaultOpt` | `O`      |

#### Returns

\| \{
\}
\| `O`
\| `null`

---

### \_\_valueConverter()

```ts
__valueConverter<T, O>(__namedParameters): O;
```

#### Type Parameters

| Type Parameter                      |
| ----------------------------------- |
| <a id="type-parameter-t-2"></a> `T` |
| <a id="type-parameter-o-2"></a> `O` |

#### Parameters

| Parameter                         | Type                                           |
| --------------------------------- | ---------------------------------------------- |
| `__namedParameters`               | \{ `val?`: `T`; `widthRelated?`: `boolean`; \} |
| `__namedParameters.val?`          | `T`                                            |
| `__namedParameters.widthRelated?` | `boolean`                                      |

#### Returns

`O`

---

### \_\_unitConverter()

```ts
__unitConverter(value, widthRelated?): number;
```

#### Parameters

| Parameter       | Type      |
| --------------- | --------- |
| `value`         | `string`  |
| `widthRelated?` | `boolean` |

#### Returns

`number`

---

### \_\_colorConverter()

```ts
__colorConverter(value): string;
```

#### Parameters

| Parameter | Type     |
| --------- | -------- |
| `value`   | `string` |

#### Returns

`string`

---

### \_\_translateX()

```ts
__translateX(x): void;
```

#### Parameters

| Parameter | Type     |
| --------- | -------- |
| `x`       | `number` |

#### Returns

`void`

---

### \_\_translateY()

```ts
__translateY(y): void;
```

#### Parameters

| Parameter | Type     |
| --------- | -------- |
| `y`       | `number` |

#### Returns

`void`

---

### \_\_addEvent()

```ts
__addEvent<E>(type, func): void;
```

#### Type Parameters

| Type Parameter                                      |
| --------------------------------------------------- |
| <a id="type-parameter-e"></a> `E` _extends_ `Event` |

#### Parameters

| Parameter | Type                 |
| --------- | -------------------- |
| `type`    | `string`             |
| `func`    | `CustomEvent`\<`E`\> |

#### Returns

`void`

---

### \_\_removeEvent()

```ts
__removeEvent<E>(type, func): void;
```

#### Type Parameters

| Type Parameter                                        |
| ----------------------------------------------------- |
| <a id="type-parameter-e-1"></a> `E` _extends_ `Event` |

#### Parameters

| Parameter | Type                 |
| --------- | -------------------- |
| `type`    | `string`             |
| `func`    | `CustomEvent`\<`E`\> |

#### Returns

`void`

---

### \_\_addAnimation()

```ts
__addAnimation(animationId, animator): void;
```

#### Parameters

| Parameter     | Type       |
| ------------- | ---------- |
| `animationId` | `string`   |
| `animator`    | `Animator` |

#### Returns

`void`

---

### \_\_removeAnimation()

```ts
__removeAnimation(animationId): void;
```

#### Parameters

| Parameter     | Type     |
| ------------- | -------- |
| `animationId` | `string` |

#### Returns

`void`

---

### \_\_registerZIndex()

```ts
__registerZIndex(): void;
```

#### Returns

`void`

---

### \_\_unregisterZIndex()

```ts
__unregisterZIndex(): void;
```

#### Returns

`void`

---

### \_\_ImFirst()

```ts
__ImFirst(): boolean | undefined;
```

#### Returns

`boolean` \| `undefined`

---

### \_\_addChildInternal()

```ts
__addChildInternal(block): void;
```

#### Parameters

| Parameter | Type        |
| --------- | ----------- |
| `block`   | `BaseBlock` |

#### Returns

`void`

---

### \_\_removeChildInternal()

```ts
__removeChildInternal(block): void;
```

#### Parameters

| Parameter | Type        |
| --------- | ----------- |
| `block`   | `BaseBlock` |

#### Returns

`void`

---

### \_\_invokeChange()

```ts
__invokeChange(): void;
```

#### Returns

`void`

---

### \_\_invokeDerivedSizeChanged()

```ts
__invokeDerivedSizeChanged(): void;
```

#### Returns

`void`

---

### \_\_applyOptions()

```ts
__applyOptions(): void;
```

#### Returns

`void`

---

### \_\_selectCursor()

```ts
__selectCursor(cursor): void;
```

#### Parameters

| Parameter | Type     |
| --------- | -------- |
| `cursor`  | `string` |

#### Returns

`void`

---

### \_\_resetCursor()

```ts
__resetCursor(cursor): void;
```

#### Parameters

| Parameter | Type     |
| --------- | -------- |
| `cursor`  | `string` |

#### Returns

`void`

---

### \_\_invokeHistory()

```ts
__invokeHistory(before, after): void;
```

#### Parameters

| Parameter | Type                            |
| --------- | ------------------------------- |
| `before`  | `Record`\<`string`, `unknown`\> |
| `after`   | `Record`\<`string`, `unknown`\> |

#### Returns

`void`

---

### \_\_generatePayload()

```ts
__generatePayload(): BlockPayload;
```

#### Returns

`BlockPayload`

---

### \_\_updateRunningEvent()

```ts
__updateRunningEvent(event, isActive): void;
```

#### Parameters

| Parameter  | Type      |
| ---------- | --------- |
| `event`    | `string`  |
| `isActive` | `boolean` |

#### Returns

`void`

---

### \_\_isRunningEventActive()

```ts
__isRunningEventActive(event): boolean;
```

#### Parameters

| Parameter | Type     |
| --------- | -------- |
| `event`   | `string` |

#### Returns

`boolean`

---

### \_\_disableRunningEvents()

```ts
__disableRunningEvents(): void;
```

#### Returns

`void`

---

### \_\_rotateCordiantesByCenter()

```ts
__rotateCordiantesByCenter(
   x,
   y,
   radian
): {
  x: number;
  y: number;
};
```

#### Parameters

| Parameter | Type     |
| --------- | -------- |
| `x`       | `number` |
| `y`       | `number` |
| `radian`  | `number` |

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

### \_\_rotation()

```ts
__rotation(): number;
```

#### Returns

`number`

---

### \_\_rotationCache()

```ts
__rotationCache(): number;
```

#### Returns

`number`

---

### \_\_resetParentRotation()

```ts
__resetParentRotation(): void;
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

### \_\_isInBoundTree()

```ts
__isInBoundTree(event): boolean;
```

#### Parameters

| Parameter | Type         |
| --------- | ------------ |
| `event`   | `MouseEvent` |

#### Returns

`boolean`

---

### listOnlyChilds()

```ts
listOnlyChilds<T>(_func): void;
```

#### Type Parameters

| Type Parameter                                                                  |
| ------------------------------------------------------------------------------- |
| <a id="type-parameter-t-3"></a> `T` _extends_ `BaseBlock`\<`BaseBlockOptions`\> |

#### Parameters

| Parameter | Type                                     |
| --------- | ---------------------------------------- |
| `_func`   | (`block`, `currIdx`, `arrLen`) => `void` |

#### Returns

`void`

---

### listAllChilds()

```ts
listAllChilds(_func): void;
```

Calls a function for every child of the block and for every child of
its children.

#### Parameters

| Parameter | Type                | Description                                  |
| --------- | ------------------- | -------------------------------------------- |
| `_func`   | (`block`) => `void` | The function that is called for every block. |

#### Returns

`void`

---

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

### addDependency()

```ts
addDependency(target): void;
```

#### Parameters

| Parameter | Type        |
| --------- | ----------- |
| `target`  | `BaseBlock` |

#### Returns

`void`

---

### removeDependency()

```ts
removeDependency(target): void;
```

#### Parameters

| Parameter | Type        |
| --------- | ----------- |
| `target`  | `BaseBlock` |

#### Returns

`void`

---

### bindTo()

```ts
bindTo(block, options): void;
```

#### Parameters

| Parameter | Type        |
| --------- | ----------- |
| `block`   | `BaseBlock` |
| `options` | `string`[]  |

#### Returns

`void`

---

### unbind()

```ts
unbind(block): void;
```

#### Parameters

| Parameter | Type        |
| --------- | ----------- |
| `block`   | `BaseBlock` |

#### Returns

`void`

---

### findChilds()

```ts
findChilds<TQuery>(queries): BaseBlock<BaseBlockOptions>[];
```

#### Type Parameters

| Type Parameter                                                                        |
| ------------------------------------------------------------------------------------- |
| <a id="type-parameter-tquery"></a> `TQuery` _extends_ `Partial`\<`BaseBlockOptions`\> |

#### Parameters

| Parameter | Type     |
| --------- | -------- |
| `queries` | `TQuery` |

#### Returns

`BaseBlock`\<`BaseBlockOptions`\>[]

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

### contextMenu()

```ts
contextMenu(_func): void;
```

Registers a handler for the event `contextmenu`.

#### Parameters

| Parameter | Type                | Description               |
| --------- | ------------------- | ------------------------- |
| `_func`   | (`event`) => `void` | The handler of the event. |

#### Returns

`void`

---

### click()

```ts
click(_func): void;
```

Registers a handler for the event `click`.

#### Parameters

| Parameter | Type                | Description               |
| --------- | ------------------- | ------------------------- |
| `_func`   | (`event`) => `void` | The handler of the event. |

#### Returns

`void`

---

### dblclick()

```ts
dblclick(_func): void;
```

Registers a handler for the event `dblclick`.

#### Parameters

| Parameter | Type                | Description               |
| --------- | ------------------- | ------------------------- |
| `_func`   | (`event`) => `void` | The handler of the event. |

#### Returns

`void`

---

### mousedown()

```ts
mousedown(_func): void;
```

Registers a handler for the event `mousedown`.

#### Parameters

| Parameter | Type                | Description               |
| --------- | ------------------- | ------------------------- |
| `_func`   | (`event`) => `void` | The handler of the event. |

#### Returns

`void`

---

### mouseup()

```ts
mouseup(_func): void;
```

Registers a handler for the event `mouseup`.

#### Parameters

| Parameter | Type                | Description               |
| --------- | ------------------- | ------------------------- |
| `_func`   | (`event`) => `void` | The handler of the event. |

#### Returns

`void`

---

### mousemove()

```ts
mousemove(_func): void;
```

Registers a handler for the event `mousemove`.

#### Parameters

| Parameter | Type                | Description               |
| --------- | ------------------- | ------------------------- |
| `_func`   | (`event`) => `void` | The handler of the event. |

#### Returns

`void`

---

### mouseenter()

```ts
mouseenter(_func): void;
```

Registers a handler for the event `mouseenter`.

#### Parameters

| Parameter | Type                | Description               |
| --------- | ------------------- | ------------------------- |
| `_func`   | (`event`) => `void` | The handler of the event. |

#### Returns

`void`

---

### mouseleave()

```ts
mouseleave(_func): void;
```

Registers a handler for the event `mouseleave`.

#### Parameters

| Parameter | Type                | Description               |
| --------- | ------------------- | ------------------------- |
| `_func`   | (`event`) => `void` | The handler of the event. |

#### Returns

`void`

---

### mouseover()

```ts
mouseover(_func): void;
```

Registers a handler for the event `mouseover`.

#### Parameters

| Parameter | Type                | Description               |
| --------- | ------------------- | ------------------------- |
| `_func`   | (`event`) => `void` | The handler of the event. |

#### Returns

`void`

---

### mouseout()

```ts
mouseout(_func): void;
```

Registers a handler for the event `mouseout`.

#### Parameters

| Parameter | Type                | Description               |
| --------- | ------------------- | ------------------------- |
| `_func`   | (`event`) => `void` | The handler of the event. |

#### Returns

`void`

---

### keydown()

```ts
keydown(_func): void;
```

Registers a handler for the event `keydown`.

#### Parameters

| Parameter | Type                | Description               |
| --------- | ------------------- | ------------------------- |
| `_func`   | (`event`) => `void` | The handler of the event. |

#### Returns

`void`

---

### keyup()

```ts
keyup(_func): void;
```

Registers a handler for the event `keyup`.

#### Parameters

| Parameter | Type                | Description               |
| --------- | ------------------- | ------------------------- |
| `_func`   | (`event`) => `void` | The handler of the event. |

#### Returns

`void`

---

### wheel()

```ts
wheel(_func): void;
```

Registers a handler for the event `wheel`.

#### Parameters

| Parameter | Type                | Description               |
| --------- | ------------------- | ------------------------- |
| `_func`   | (`event`) => `void` | The handler of the event. |

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

### updateChildsCordinate()

```ts
updateChildsCordinate(): void;
```

#### Returns

`void`

---

### \_\_overflowTranslateX()

```ts
__overflowTranslateX(x): void;
```

#### Parameters

| Parameter | Type     |
| --------- | -------- |
| `x`       | `number` |

#### Returns

`void`

---

### \_\_overflowTranslateY()

```ts
__overflowTranslateY(y): void;
```

#### Parameters

| Parameter | Type     |
| --------- | -------- |
| `y`       | `number` |

#### Returns

`void`

---

### animationStart()

```ts
animationStart(animationId): void;
```

#### Parameters

| Parameter     | Type     |
| ------------- | -------- |
| `animationId` | `string` |

#### Returns

`void`

---

### animationStop()

```ts
animationStop(animationId): void;
```

#### Parameters

| Parameter     | Type     |
| ------------- | -------- |
| `animationId` | `string` |

#### Returns

`void`

---

### animationFinish()

```ts
animationFinish(animationId): void;
```

#### Parameters

| Parameter     | Type     |
| ------------- | -------- |
| `animationId` | `string` |

#### Returns

`void`

---

### animationReverse()

```ts
animationReverse(animationId): void;
```

#### Parameters

| Parameter     | Type     |
| ------------- | -------- |
| `animationId` | `string` |

#### Returns

`void`

---

### animationDelay()

```ts
animationDelay(animationId, value): void;
```

#### Parameters

| Parameter     | Type     |
| ------------- | -------- |
| `animationId` | `string` |
| `value`       | `number` |

#### Returns

`void`

---

### animationPlaybackRate()

```ts
animationPlaybackRate(animationId, value): void;
```

#### Parameters

| Parameter     | Type     |
| ------------- | -------- |
| `animationId` | `string` |
| `value`       | `number` |

#### Returns

`void`

---

### animationDirection()

```ts
animationDirection(animationId, value): void;
```

#### Parameters

| Parameter     | Type        |
| ------------- | ----------- |
| `animationId` | `string`    |
| `value`       | `Direction` |

#### Returns

`void`

---

### animationDuration()

```ts
animationDuration(animationId, value): void;
```

#### Parameters

| Parameter     | Type     |
| ------------- | -------- |
| `animationId` | `string` |
| `value`       | `number` |

#### Returns

`void`

---

### animationIterationStart()

```ts
animationIterationStart(animationId, value): void;
```

#### Parameters

| Parameter     | Type     |
| ------------- | -------- |
| `animationId` | `string` |
| `value`       | `number` |

#### Returns

`void`

---

### animationIterations()

```ts
animationIterations(animationId, value): void;
```

#### Parameters

| Parameter     | Type     |
| ------------- | -------- |
| `animationId` | `string` |
| `value`       | `number` |

#### Returns

`void`

---

### animationAutoStart()

```ts
animationAutoStart(animationId, value): void;
```

#### Parameters

| Parameter     | Type      |
| ------------- | --------- |
| `animationId` | `string`  |
| `value`       | `boolean` |

#### Returns

`void`

---

### removeAnimation()

```ts
removeAnimation(animationId): void;
```

#### Parameters

| Parameter     | Type     |
| ------------- | -------- |
| `animationId` | `string` |

#### Returns

`void`

---

### animate()

```ts
animate(keyframes, callback?): string;
```

#### Parameters

| Parameter   | Type                |
| ----------- | ------------------- |
| `keyframes` | `AnimationKeyframe` |
| `callback?` | `CallbackAnimator`  |

#### Returns

`string`

---

### updateCords()

```ts
updateCords(): void;
```

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

### \_\_clipShape()

```ts
__clipShape(): void;
```

#### Returns

`void`
