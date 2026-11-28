---
title: LayoutBlockOptions
description: The `LayoutBlockOptions` API of the 2flex library.
slug: layout-block-options
---

# Interface: LayoutBlockOptions

## Properties

### name?

```ts
name?: ResolvedAs<string, string | undefined>;
```

The name of the block.

The name is used to find a block with [Canvas.find](canvas.md#find).

---

### x?

```ts
x?: RelativeType;
```

The horizontal position of the block.

The value is a number of pixels or a relative value, for example `50%`
or `2rem`.

---

### y?

```ts
y?: RelativeType;
```

The vertical position of the block.

---

### cornerTopLeft?

```ts
cornerTopLeft?: XY;
```

The position of the top left corner of the block.

The corners are set by the layout of the parent, setting them by hand
takes the block out of the layout.

---

### cornerTopRight?

```ts
cornerTopRight?: XY;
```

The position of the top right corner of the block.

---

### cornerBottomLeft?

```ts
cornerBottomLeft?: XY;
```

The position of the bottom left corner of the block.

---

### cornerBottomRight?

```ts
cornerBottomRight?: XY;
```

The position of the bottom right corner of the block.

---

### width?

```ts
width?: RelativeType;
```

The width of the block.

---

### height?

```ts
height?: RelativeType;
```

The height of the block.

---

### minWidth?

```ts
minWidth?: RelativeType;
```

The smallest width the block can have.

---

### minHeight?

```ts
minHeight?: RelativeType;
```

The smallest height the block can have.

---

### maxWidth?

```ts
maxWidth?: RelativeType;
```

The biggest width the block can have.

---

### maxHeight?

```ts
maxHeight?: RelativeType;
```

The biggest height the block can have.

---

### scale?

```ts
scale?: RelativeType;
```

The scale of the block.

---

### position?

```ts
position?: Position;
```

The way the block is placed in its parent.

The value is `relative`, `absolute`, `fixed` or `sticky`.

---

### top?

```ts
top?: RelativeType;
```

The distance to the top edge of the parent.

---

### bottom?

```ts
bottom?: RelativeType;
```

The distance to the bottom edge of the parent.

---

### left?

```ts
left?: RelativeType;
```

The distance to the left edge of the parent.

---

### right?

```ts
right?: RelativeType;
```

The distance to the right edge of the parent.

---

### padding?

```ts
padding?: ResolvedAs<ShortHandRelativeType, ShortHandRelativeType | undefined>;
```

The space between the border of the block and its children.

---

### paddingTop?

```ts
paddingTop?: RelativeType;
```

The space between the top border of the block and its children.

---

### paddingRight?

```ts
paddingRight?: RelativeType;
```

The space between the right border of the block and its children.

---

### paddingBottom?

```ts
paddingBottom?: RelativeType;
```

The space between the bottom border of the block and its children.

---

### paddingLeft?

```ts
paddingLeft?: RelativeType;
```

The space between the left border of the block and its children.

---

### margin?

```ts
margin?: ResolvedAs<ShortHandRelativeType, ShortHandRelativeType | undefined>;
```

The space around the block.

---

### marginTop?

```ts
marginTop?: RelativeType;
```

The space above the block.

---

### marginRight?

```ts
marginRight?: RelativeType;
```

The space to the right of the block.

---

### marginBottom?

```ts
marginBottom?: RelativeType;
```

The space below the block.

---

### marginLeft?

```ts
marginLeft?: RelativeType;
```

The space to the left of the block.

---

### rotate?

```ts
rotate?: RelativeType;
```

The rotation of the block in radians.

---

### rotationCenterX?

```ts
rotationCenterX?: RelativeType;
```

The horizontal coordinate of the centre of the rotation.

---

### rotationCenterY?

```ts
rotationCenterY?: RelativeType;
```

The vertical coordinate of the centre of the rotation.

---

### rotationCenter?

```ts
rotationCenter?: SelfType;
```

The point of the block the rotation turns around.

The value is `self`, `parent` or `custom`.

---

### horizontalFlip?

```ts
horizontalFlip?: boolean;
```

Whether the block is mirrored on its vertical axis.

---

### verticalFlip?

```ts
verticalFlip?: boolean;
```

Whether the block is mirrored on its horizontal axis.

---

### zIndex?

```ts
zIndex?: number;
```

The z index of the block.

The block takes part in the stacking order of the scene when the value
is set.

---

### order?

```ts
order?: number;
```

The order of the block in its parent.

---

### hidden?

```ts
hidden?: boolean;
```

Whether the block is drawn.

A hidden block is not drawn and its children are not drawn either.

---

### important?

```ts
important?: BaseBlockOptions;
```

The options that are set on the block itself and not on its parent.

---

### flexShrink?

```ts
flexShrink?: number;
```

---

### flexBasis?

```ts
flexBasis?: FlexBasis;
```

---

### flexGrow?

```ts
flexGrow?: number;
```

---

### onRender?

```ts
onRender?: onRender;
```

---

### dependencies?

```ts
dependencies?: Dependencies;
```

---

### flexDirection?

```ts
flexDirection?: FlexDirecton;
```

---

### flexWrap?

```ts
flexWrap?: FlexWrap;
```

---

### flexFlow?

```ts
flexFlow?: FlexFlow;
```

---

### grid?

```ts
grid?: Grid;
```

---

### gridTemplateAreas?

```ts
gridTemplateAreas?: GridTemplateAreas;
```

---

### gridTemplate?

```ts
gridTemplate?: GridTemplate;
```

---

### gridTemplateColumns?

```ts
gridTemplateColumns?: GridTemplateColumns;
```

---

### gridTemplateRows?

```ts
gridTemplateRows?: GridTemplateRows;
```

---

### gridAutoRows?

```ts
gridAutoRows?: GridAutoRows;
```

---

### gridAutoColumns?

```ts
gridAutoColumns?: GridAutoColumns;
```

---

### gridAutoFlow?

```ts
gridAutoFlow?: GridAutoFlow;
```

---

### justifyItems?

```ts
justifyItems?: JustifyItems;
```

---

### layout?

```ts
layout?: ILayout;
```

The way the children of the block are placed.

The value is `flex` or `grid`.

---

### justifyContent?

```ts
justifyContent?: JustifyContent;
```

The way the children are placed along the main axis.

---

### alignContent?

```ts
alignContent?: AlignContent;
```

The way the rows of the children are placed along the cross axis.

---

### alignItems?

```ts
alignItems?: AlignItems;
```

The way the children are placed along the cross axis.

---

### placeContent?

```ts
placeContent?:
  | "normal"
  | "center"
  | "space-evenly"
  | "space-around"
  | "space-between"
  | "start"
  | "end"
  | "stretch";
```

The way the children are placed along both axes.

---

### placeItems?

```ts
placeItems?: "normal" | "center" | "start" | "end" | "stretch";
```

The way every child is placed along both axes.

---

### gap?

```ts
gap?: Gap;
```

The space between the children.

---

### gapColumn?

```ts
gapColumn?: RelativeType;
```

The space between the columns of the children.

---

### gapRow?

```ts
gapRow?: RelativeType;
```

The space between the rows of the children.

---

### draggable?

```ts
draggable?: boolean;
```

---

### draggableX?

```ts
draggableX?: boolean;
```

---

### draggableY?

```ts
draggableY?: boolean;
```

---

### onDraggable?

```ts
onDraggable?: (event) => void;
```

#### Parameters

| Parameter | Type         |
| --------- | ------------ |
| `event`   | `MouseEvent` |

#### Returns

`void`

---

### hotCornerSize?

```ts
hotCornerSize?: number;
```

---

### hotCornerRadius?

```ts
hotCornerRadius?: number;
```

---

### hotCornerStrokeWidth?

```ts
hotCornerStrokeWidth?: number;
```

---

### hotCornerStrokeColor?

```ts
hotCornerStrokeColor?: ColorType;
```

---

### hotCornerBackgroundColor?

```ts
hotCornerBackgroundColor?: ColorType;
```

---

### hotLineStrokeWidth?

```ts
hotLineStrokeWidth?: number;
```

---

### hotLineStrokeColor?

```ts
hotLineStrokeColor?: ColorType;
```

---

### hotLines?

```ts
hotLines?: boolean;
```

---

### overflow?

```ts
overflow?: Overflow;
```

---

### overflowX?

```ts
overflowX?: Overflow;
```

---

### overflowY?

```ts
overflowY?: Overflow;
```

---

### overflowPositionX?

```ts
overflowPositionX?: number;
```

---

### overflowPositionY?

```ts
overflowPositionY?: number;
```

---

### resizable?

```ts
resizable?: boolean;
```

---

### resizableTop?

```ts
resizableTop?: boolean;
```

---

### resizableLeft?

```ts
resizableLeft?: boolean;
```

---

### resizableRight?

```ts
resizableRight?: boolean;
```

---

### resizableBottom?

```ts
resizableBottom?: boolean;
```

---

### resizableTopLeft?

```ts
resizableTopLeft?: boolean;
```

---

### resizableTopRight?

```ts
resizableTopRight?: boolean;
```

---

### resizableBottomLeft?

```ts
resizableBottomLeft?: boolean;
```

---

### resizableBottomRight?

```ts
resizableBottomRight?: boolean;
```

---

### hotResizableAreaTop?

```ts
hotResizableAreaTop?: HotCornerArea;
```

---

### hotResizableAreaRight?

```ts
hotResizableAreaRight?: HotCornerArea;
```

---

### hotResizableAreaLeft?

```ts
hotResizableAreaLeft?: HotCornerArea;
```

---

### hotResizableAreaBottom?

```ts
hotResizableAreaBottom?: HotCornerArea;
```

---

### hotResizableAreaTopLeft?

```ts
hotResizableAreaTopLeft?: HotCornerArea;
```

---

### hotResizableAreaTopRight?

```ts
hotResizableAreaTopRight?: HotCornerArea;
```

---

### hotResizableAreaBottomLeft?

```ts
hotResizableAreaBottomLeft?: HotCornerArea;
```

---

### hotResizableAreaBottomRight?

```ts
hotResizableAreaBottomRight?: HotCornerArea;
```

---

### onResizable?

```ts
onResizable?: (event) => void;
```

#### Parameters

| Parameter | Type         |
| --------- | ------------ |
| `event`   | `MouseEvent` |

#### Returns

`void`

---

### horizontalFlipResize?

```ts
horizontalFlipResize?: boolean;
```

---

### verticalFlipResize?

```ts
verticalFlipResize?: boolean;
```

---

### hotResizableAreaSize?

```ts
hotResizableAreaSize?: number;
```

---

### hotResizableAreaGap?

```ts
hotResizableAreaGap?: number;
```

---

### rotatable?

```ts
rotatable?: boolean;
```

---

### rotatableTopLeft?

```ts
rotatableTopLeft?: boolean;
```

---

### rotatableTopRight?

```ts
rotatableTopRight?: boolean;
```

---

### rotatableBottomLeft?

```ts
rotatableBottomLeft?: boolean;
```

---

### rotatableBottomRight?

```ts
rotatableBottomRight?: boolean;
```

---

### hotRotatableAreaTopLeft?

```ts
hotRotatableAreaTopLeft?: HotCornerArea;
```

---

### hotRotatableAreaTopRight?

```ts
hotRotatableAreaTopRight?: HotCornerArea;
```

---

### hotRotatableAreaBottomLeft?

```ts
hotRotatableAreaBottomLeft?: HotCornerArea;
```

---

### hotRotatableAreaBottomRight?

```ts
hotRotatableAreaBottomRight?: HotCornerArea;
```

---

### onRotatable?

```ts
onRotatable?: (event) => void;
```

#### Parameters

| Parameter | Type         |
| --------- | ------------ |
| `event`   | `MouseEvent` |

#### Returns

`void`

---

### hotRotatableAreaSize?

```ts
hotRotatableAreaSize?: number;
```

---

### hotRotatableAreaGap?

```ts
hotRotatableAreaGap?: number;
```

---

### selectable?

```ts
selectable?: boolean;
```
