---
title: ShapeBlock
description: A block that draws onto the canvas with the calls of the rendering context.
slug: shape-block
---

# Class: ShapeBlock\<T\>

A block that draws onto the canvas.

The class gives a block access to the rendering context of the canvas. The
options of the block are the calls of the context, they are written to it
before the block is drawn.

## Type Parameters

| Type Parameter                                                                            | Default type                                  |
| ----------------------------------------------------------------------------------------- | --------------------------------------------- |
| <a id="type-parameter-t"></a> `T` _extends_ [`ShapeBlockOptions`](shape-block-options.md) | [`ShapeBlockOptions`](shape-block-options.md) |

## Constructors

### Constructor

```ts
new ShapeBlock<T>(options): ShapeBlock<T>;
```

#### Parameters

| Parameter | Type                                          |
| --------- | --------------------------------------------- |
| `options` | [`ShapeBlockOptions`](shape-block-options.md) |

#### Returns

`ShapeBlock`\<`T`\>

## Properties

### clip

```ts
clip: OptionAccessor<ShapeBlockOptions, "clip">;
```

---

### direction

```ts
direction: OptionAccessor<ShapeBlockOptions, "direction">;
```

---

### fill

```ts
fill: OptionAccessor<ShapeBlockOptions, "fill">;
```

---

### font

```ts
font: OptionAccessor<ShapeBlockOptions, "font">;
```

---

### fontKerning

```ts
fontKerning: OptionAccessor<ShapeBlockOptions, "fontKerning">;
```

---

### fontStretch

```ts
fontStretch: OptionAccessor<ShapeBlockOptions, "fontStretch">;
```

---

### fontVariantCaps

```ts
fontVariantCaps: OptionAccessor<ShapeBlockOptions, "fontVariantCaps">;
```

---

### letterSpacing

```ts
letterSpacing: OptionAccessor<ShapeBlockOptions, "letterSpacing">;
```

---

### stroke

```ts
stroke: OptionAccessor<ShapeBlockOptions, "stroke">;
```

---

### textAlign

```ts
textAlign: OptionAccessor<ShapeBlockOptions, "textAlign">;
```

---

### textRendering

```ts
textRendering: OptionAccessor<ShapeBlockOptions, "textRendering">;
```

---

### wordSpacing

```ts
wordSpacing: OptionAccessor<ShapeBlockOptions, "wordSpacing">;
```

---

### imageSmoothingEnabled

```ts
imageSmoothingEnabled: OptionAccessor<ShapeBlockOptions, "imageSmoothingEnabled">;
```

---

### rect

```ts
rect: OptionAccessor<ShapeBlockOptions, "rect">;
```

---

### fillStyle

```ts
fillStyle: OptionAccessor<ShapeBlockOptions, "fillStyle">;
```

---

### strokeStyle

```ts
strokeStyle: OptionAccessor<ShapeBlockOptions, "strokeStyle">;
```

---

### blur

```ts
blur: OptionAccessor<ShapeBlockOptions, "blur">;
```

---

### brightness

```ts
brightness: OptionAccessor<ShapeBlockOptions, "brightness">;
```

---

### contrast

```ts
contrast: OptionAccessor<ShapeBlockOptions, "contrast">;
```

---

### dropShadow

```ts
dropShadow: OptionAccessor<ShapeBlockOptions, "dropShadow">;
```

---

### grayscale

```ts
grayscale: OptionAccessor<ShapeBlockOptions, "grayscale">;
```

---

### hueRotate

```ts
hueRotate: OptionAccessor<ShapeBlockOptions, "hueRotate">;
```

---

### saturate

```ts
saturate: OptionAccessor<ShapeBlockOptions, "saturate">;
```

---

### sepia

```ts
sepia: OptionAccessor<ShapeBlockOptions, "sepia">;
```

---

### lineTo

```ts
lineTo: OptionAccessor<ShapeBlockOptions, "lineTo">;
```

---

### lineWidth

```ts
lineWidth: OptionAccessor<ShapeBlockOptions, "lineWidth">;
```

---

### lineDash

```ts
lineDash: OptionAccessor<ShapeBlockOptions, "lineDash">;
```

---

### lineCap

```ts
lineCap: OptionAccessor<ShapeBlockOptions, "lineCap">;
```

---

### lineDashOffset

```ts
lineDashOffset: OptionAccessor<ShapeBlockOptions, "lineDashOffset">;
```

---

### lineJoin

```ts
lineJoin: OptionAccessor<ShapeBlockOptions, "lineJoin">;
```

---

### miterLimit

```ts
miterLimit: OptionAccessor<ShapeBlockOptions, "miterLimit">;
```

---

### arc

```ts
arc: OptionAccessor<ShapeBlockOptions, "arc">;
```

---

### arcTo

```ts
arcTo: OptionAccessor<ShapeBlockOptions, "arcTo">;
```

---

### ellipse

```ts
ellipse: OptionAccessor<ShapeBlockOptions, "ellipse">;
```

---

### bezierCurveTo

```ts
bezierCurveTo: OptionAccessor<ShapeBlockOptions, "bezierCurveTo">;
```

---

### quadraticCurveTo

```ts
quadraticCurveTo: OptionAccessor<ShapeBlockOptions, "quadraticCurveTo">;
```

---

### roundRect

```ts
roundRect: OptionAccessor<ShapeBlockOptions, "roundRect">;
```

---

### fillRect

```ts
fillRect: OptionAccessor<ShapeBlockOptions, "fillRect">;
```

---

### strokeRect

```ts
strokeRect: OptionAccessor<ShapeBlockOptions, "strokeRect">;
```

---

### moveTo

```ts
moveTo: OptionAccessor<ShapeBlockOptions, "moveTo">;
```

---

### radialGradient

```ts
radialGradient: OptionAccessor<ShapeBlockOptions, "radialGradient">;
```

---

### linearGradient

```ts
linearGradient: OptionAccessor<ShapeBlockOptions, "linearGradient">;
```

---

### conicGradient

```ts
conicGradient: OptionAccessor<ShapeBlockOptions, "conicGradient">;
```

---

### colorStops

```ts
colorStops: OptionAccessor<ShapeBlockOptions, "colorStops">;
```

---

### shadowBlur

```ts
shadowBlur: OptionAccessor<ShapeBlockOptions, "shadowBlur">;
```

---

### shadowColor

```ts
shadowColor: OptionAccessor<ShapeBlockOptions, "shadowColor">;
```

---

### shadowOffsetX

```ts
shadowOffsetX: OptionAccessor<ShapeBlockOptions, "shadowOffsetX">;
```

---

### shadowOffsetY

```ts
shadowOffsetY: OptionAccessor<ShapeBlockOptions, "shadowOffsetY">;
```

---

### fillText

```ts
fillText: OptionAccessor<ShapeBlockOptions, "fillText">;
```

---

### strokeText

```ts
strokeText: OptionAccessor<ShapeBlockOptions, "strokeText">;
```

---

### textBaseline

```ts
textBaseline: OptionAccessor<ShapeBlockOptions, "textBaseline">;
```

---

### drawImage

```ts
drawImage: OptionAccessor<ShapeBlockOptions, "drawImage">;
```

---

### pattern

```ts
pattern: OptionAccessor<ShapeBlockOptions, "pattern">;
```

---

### imageSmoothingQuality

```ts
imageSmoothingQuality: OptionAccessor<ShapeBlockOptions, "imageSmoothingQuality">;
```

---

### globalCompositeOperation

```ts
globalCompositeOperation: OptionAccessor<ShapeBlockOptions, "globalCompositeOperation">;
```

---

### globalAlpha

```ts
globalAlpha: OptionAccessor<ShapeBlockOptions, "globalAlpha">;
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

### beginPath()

```ts
beginPath(): void;
```

#### Returns

`void`

---

### closePath()

```ts
closePath(): void;
```

#### Returns

`void`

---

### pointInPath()

```ts
pointInPath(point): boolean;
```

#### Parameters

| Parameter | Type          |
| --------- | ------------- |
| `point`   | `PointInPath` |

#### Returns

`boolean`

---

### pointInStroke()

```ts
pointInStroke(point): boolean | undefined;
```

#### Parameters

| Parameter | Type            |
| --------- | --------------- |
| `point`   | `PointInStroke` |

#### Returns

`boolean` \| `undefined`

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
