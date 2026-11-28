---
title: LineBlockOptions
description: The `LineBlockOptions` API of the 2flex library.
slug: line-block-options
---

# Interface: LineBlockOptions

## Indexable

```ts
[key: `${string}-${number}`]: number | boolean | StickTo | undefined
```

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

### fill?

```ts
fill?: Fill;
```

The style the shape is filled with.

---

### fillStyle?

```ts
fillStyle?: ResolvedAs<string | CanvasGradient | CanvasPattern, string | CanvasGradient | CanvasPattern | undefined>;
```

The way a shape is filled.

---

### stroke?

```ts
stroke?: Stroke;
```

The style the outline of the shape is drawn with.

---

### strokeStyle?

```ts
strokeStyle?: ResolvedAs<string | CanvasGradient | CanvasPattern, string | CanvasGradient | CanvasPattern | undefined>;
```

The way an outline is drawn.

---

### lineTo?

```ts
lineTo?: XY;
```

The point a line is drawn to.

---

### lineWidth?

```ts
lineWidth?: RelativeType;
```

The width of the line.

---

### lineDash?

```ts
lineDash?: LineDash;
```

The dashes the line is drawn with.

---

### lineCap?

```ts
lineCap?: CanvasLineCap;
```

The way the ends of the line are drawn.

---

### lineDashOffset?

```ts
lineDashOffset?: number;
```

The distance the dashes are moved by.

---

### lineJoin?

```ts
lineJoin?: CanvasLineJoin;
```

The way the corners of the line are drawn.

---

### miterLimit?

```ts
miterLimit?: number;
```

The limit of the length of the corners of the line.

---

### arc?

```ts
arc?: Arc;
```

The arc or the circle that is drawn.

---

### arcTo?

```ts
arcTo?: ArcTo;
```

The arc that is drawn to the corner between two lines.

---

### ellipse?

```ts
ellipse?: Ellipse;
```

The ellipse that is drawn.

---

### bezierCurveTo?

```ts
bezierCurveTo?: BezierCurveToOpt;
```

The curve of a Bézier that is drawn.

---

### quadraticCurveTo?

```ts
quadraticCurveTo?: QuadraticCurveToOpt;
```

The curve of a quadratic Bézier that is drawn.

---

### rect?

```ts
rect?: RectOpt;
```

The rectangle that is drawn.

---

### roundRect?

```ts
roundRect?: RoundRectOpt;
```

The rectangle with rounded corners that is drawn.

---

### fillRect?

```ts
fillRect?: RectOpt;
```

The rectangle that is filled.

---

### strokeRect?

```ts
strokeRect?: RectOpt;
```

The rectangle whose outline is drawn.

---

### pointInPath?

```ts
pointInPath?: PointInPath;
```

The point that is tested against the path of the shape.

---

### pointInStroke?

```ts
pointInStroke?: PointInStroke;
```

The point that is tested against the outline of the shape.

---

### moveTo?

```ts
moveTo?: XY;
```

The point the path of the shape starts at.

---

### radialGradient?

```ts
radialGradient?: RadialGradient;
```

The radial gradient that is used to fill the shape.

---

### linearGradient?

```ts
linearGradient?: LinearGradient;
```

The linear gradient that is used to fill the shape.

---

### conicGradient?

```ts
conicGradient?: ConicGradient;
```

The conic gradient that is used to fill the shape.

---

### colorStops?

```ts
colorStops?: GradientStops[];
```

The stops of the gradient.

---

### blur?

```ts
blur?: RelativeType | RelativeType[];
```

The blur that is applied to the shape.

---

### brightness?

```ts
brightness?: RelativeType | RelativeType[];
```

The brightness that is applied to the shape.

---

### contrast?

```ts
contrast?: RelativeType | RelativeType[];
```

The contrast that is applied to the shape.

---

### dropShadow?

```ts
dropShadow?: DropShadow | DropShadow[];
```

The shadow that is dropped behind the shape.

---

### grayscale?

```ts
grayscale?: RelativeType | RelativeType[];
```

The amount of gray the shape is drawn with.

---

### hueRotate?

```ts
hueRotate?: RelativeType | RelativeType[];
```

The shift of the colors of the shape.

---

### saturate?

```ts
saturate?: RelativeType | RelativeType[];
```

The amount of color the shape is drawn with.

---

### sepia?

```ts
sepia?: RelativeType | RelativeType[];
```

The amount of sepia the shape is drawn with.

---

### shadowBlur?

```ts
shadowBlur?: RelativeType;
```

The blur of the shadow of the shape.

---

### shadowColor?

```ts
shadowColor?: ResolvedAs<ColorType, ColorType | undefined>;
```

The color of the shadow of the shape.

---

### shadowOffsetX?

```ts
shadowOffsetX?: RelativeType;
```

The horizontal offset of the shadow of the shape.

---

### shadowOffsetY?

```ts
shadowOffsetY?: RelativeType;
```

The vertical offset of the shadow of the shape.

---

### fillText?

```ts
fillText?: DrawText;
```

The text that is filled into the shape.

---

### strokeText?

```ts
strokeText?: DrawText;
```

The text whose outline is drawn.

---

### font?

```ts
font?: TextType;
```

The font the text is drawn with.

---

### fontStretch?

```ts
fontStretch?: CanvasFontStretch;
```

The width of the font.

---

### fontKerning?

```ts
fontKerning?: CanvasFontKerning;
```

The way the letters of the font are placed.

---

### fontVariantCaps?

```ts
fontVariantCaps?: CanvasFontVariantCaps;
```

The way the capitals of the font are drawn.

---

### textBaseline?

```ts
textBaseline?: CanvasTextBaseline;
```

The line the text is placed on.

---

### textRendering?

```ts
textRendering?: CanvasTextRendering;
```

The way the text is drawn.

---

### wordSpacing?

```ts
wordSpacing?: RelativeType;
```

The space between the words of the text.

---

### letterSpacing?

```ts
letterSpacing?: RelativeType;
```

The space between the letters of the text.

---

### direction?

```ts
direction?: CanvasDirection;
```

The direction the text is written in.

---

### textAlign?

```ts
textAlign?: CanvasTextAlign;
```

The way the text is aligned in its block.

---

### clip?

```ts
clip?: Clip;
```

The path the children of the block are clipped with.

---

### drawImage?

```ts
drawImage?: DrawImage;
```

The image that is drawn.

---

### pattern?

```ts
pattern?: Pattern;
```

The pattern the shape is filled with.

---

### imageSmoothingEnabled?

```ts
imageSmoothingEnabled?: boolean;
```

Whether the image is smoothed while it is scaled.

---

### imageSmoothingQuality?

```ts
imageSmoothingQuality?: ImageSmoothingQuality;
```

The quality of the smoothing of the image.

---

### globalCompositeOperation?

```ts
globalCompositeOperation?: GlobalCompositeOperation;
```

The way the shape is drawn onto the canvas.

---

### globalAlpha?

```ts
globalAlpha?: number;
```

The opacity the shape is drawn with.

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

---

### controlPoints?

```ts
controlPoints?: ControlPoint[];
```

---

### lineColor?

```ts
lineColor?: ColorType;
```

---

### fillColor?

```ts
fillColor?: ColorType;
```

---

### closeLine?

```ts
closeLine?: boolean;
```

---

### controlPointsSize?

```ts
controlPointsSize?: RelativeType;
```

---

### controlLineWidth?

```ts
controlLineWidth?: number;
```

---

### controlPointBackgroundColor?

```ts
controlPointBackgroundColor?: ColorType;
```

---

### controlPointStrokeColor?

```ts
controlPointStrokeColor?: ColorType;
```

---

### editable?

```ts
editable?: boolean;
```
