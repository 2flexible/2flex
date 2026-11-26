---
id: api-index
title: API index
description: Every symbol exported by the 2flex package — the classes, the utility functions, and their signatures.
---

The package exports ten classes and twenty-seven utility functions. This page lists all of them.

## The classes

| Class            | Extends      | What it is                                     |
| ---------------- | ------------ | ---------------------------------------------- |
| `Canvas`         | —            | The rendering surface                          |
| `Block`          | —            | The base block — layout, events, animation     |
| `LayoutBlock`    | `Block`      | A Flexbox or Grid container                    |
| `ShapeBlock`     | `Block`      | Direct Canvas 2D drawing                       |
| `RectangleBlock` | `ShapeBlock` | A rectangle with a fill, border, and radii     |
| `CircleBlock`    | `ShapeBlock` | A circle, ellipse, arc, or pie slice           |
| `LineBlock`      | `ShapeBlock` | A straight or cubic Bézier line                |
| `TextBlock`      | `ShapeBlock` | Editable, wrappable text                       |
| `ImageBlock`     | `ShapeBlock` | An image with object-fit, clipping, and tiling |
| `VideoBlock`     | `ShapeBlock` | Video playback on the canvas                   |

### Canvas

```typescript
new Canvas(canvasId: string, width: number, height: number, options?: CanvasOptions)
```

**Options**

| Option             | Type                  | Default    |
| ------------------ | --------------------- | ---------- |
| `zoomSpeed`        | `number`              | `1.2`      |
| `zoomInvSpeed`     | `number`              | `0.8`      |
| `moveSpeed`        | `number`              | `100`      |
| `zoomType`         | `'center' \| 'point'` | `'center'` |
| `keyboardMovement` | `boolean`             | `true`     |
| `mouseMovement`    | `boolean`             | `true`     |
| `history`          | `boolean`             | `true`     |
| `historySize`      | `number`              | `100`      |
| `positionX`        | `number`              | `0`        |
| `positionY`        | `number`              | `0`        |
| `positionZ`        | `number`              | `1`        |
| `fps`              | `number`              | `60`       |
| `tileSize`         | `number`              | `256`      |

**Properties**

`canvasId`, `width`, `height`, `options`, `view`, `isFocused`, `isMouseEventAllowed`, `context`, `canvas`, `boundingClientRect`, `currentPosition`, `currentCursor`

**Methods**

`add`, `remove`, `export`, `load`, `registerBlocks`, `find`, `undo`, `redo`, `getCursorPosition`, `clearRect`, `changeCursor`, `resetCursor`, `registerCursor`, `unregisterCursor`, `registerZIndex`, `unregisterZIndex`, `whoIsTheFirst`

**Render queue**

`demandInvoke`, `demandAddBlock`, `demandRemoveBlock`, `demandHistory`, `demandAddEvent`, `demandRemoveEvent`, `demandAddAnimation`, `demandRemoveAnimation`, `demandRefreshHead`

### Saving and loading a scene

`export` serialises the whole scene to a JSON string.

```typescript
const payload = canvas.export();

// Later, or in another session
canvas.load(payload);
```

The payload holds the canvas's id, size, and options, plus every block in the scene with its options and its children.

> [!WARNING] Register custom classes before loading
>
> `load` rebuilds each block by looking up its constructor name among the registered classes. A class you have not registered cannot be constructed, and that branch of the tree is skipped. Call `canvas.registerBlocks(MyBlock)` before `load`.

> [!NOTE] Options are restored, not object state
>
> Only the options are serialised. Any state a block holds outside its options is not saved, and the block is rebuilt from a fresh instance.

### Block

```typescript
new Block(options: IBlockOptions)
```

**Geometry** — `x`, `y`, `width`, `height`, `minWidth`, `minHeight`, `maxWidth`, `maxHeight`, `scale`, `cornerTopLeft`, `cornerTopRight`, `cornerBottomLeft`, `cornerBottomRight`

**Positioning** — `position`, `top`, `right`, `bottom`, `left`

**Spacing** — `padding`, `paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft`, `margin`, `marginTop`, `marginRight`, `marginBottom`, `marginLeft`

**Rotation** — `rotate`, `rotationCenter`, `rotationCenterX`, `rotationCenterY`, `horizontalFlip`, `verticalFlip`

**Other** — `name`, `zIndex`, `order`, `hidden`, `important`, `onRender`, `dependencies`, `flexBasis`

**Selection** — `selectable`

**Dragging** — `draggable`, `draggableX`, `draggableY`, `onDraggable`

**Resizing** — `resizable`, `resizableTopLeft`, `resizableTop`, `resizableTopRight`, `resizableRight`, `resizableBottomRight`, `resizableBottom`, `resizableBottomLeft`, `resizableLeft`, `onResizable`, `horizontalFlipResize`, `verticalFlipResize`, `hotResizableAreaTopLeft`, `hotResizableAreaTop`, `hotResizableAreaTopRight`, `hotResizableAreaRight`, `hotResizableAreaBottomRight`, `hotResizableAreaBottom`, `hotResizableAreaBottomLeft`, `hotResizableAreaLeft`, `hotResizableAreaSize`, `hotResizableAreaGap`

**Rotating** — `rotatable`, `rotatableTopLeft`, `rotatableTopRight`, `rotatableBottomLeft`, `rotatableBottomRight`, `onRotatable`, `hotRotatableAreaTopLeft`, `hotRotatableAreaTopRight`, `hotRotatableAreaBottomLeft`, `hotRotatableAreaBottomRight`, `hotRotatableAreaSize`, `hotRotatableAreaGap`

**Overflow** — `overflow`, `overflowX`, `overflowY`, `overflowPositionX`, `overflowPositionY`

**Hot chrome** — `hotLines`, `hotCornerSize`, `hotCornerRadius`, `hotCornerBackgroundColor`, `hotCornerStrokeWidth`, `hotCornerStrokeColor`, `hotLineStrokeWidth`, `hotLineStrokeColor`

**Properties** — `parentNode`, `childNodes`, `nodeId`, `canvas`, `context`, `options`, `cacheOptions`, `initWidth`, `initHeight`, `realWidth`, `realHeight`, `realCenterX`, `realCenterY`, `boundingBox`, `isMouseEventAllowed`

**Tree methods** — `addChild`, `removeChild`, `listOnlyChilds`, `listAllChilds`, `findChilds`, `bindTo`, `unbind`, `addDependecy`, `removeDependency`

**Option methods** — `set`, `addProperty`, `removeProperty`, `getOptionCache`, `getOptionCurrent`, `setOptionCache`, `setOptionCurrent`

**Geometry methods** — `render`, `init`, `updateCords`, `updateCordinates`, `updateChildsCordinate`, `rotateCordinates`, `checkInBound`

**Events** — `click`, `dblclick`, `mousedown`, `mouseup`, `mousemove`, `mouseenter`, `mouseleave`, `mouseover`, `mouseout`, `contextMenu`, `wheel`, `keydown`, `keyup`

**Animation** — `animate`, `animationStart`, `animationStop`, `animationFinish`, `animationReverse`, `animationDelay`, `animationDuration`, `animationIterations`, `animationIterationStart`, `animationPlaybackRate`, `animationDirection`, `animationAutoStart`, `removeAnimation`

### LayoutBlock

```typescript
new LayoutBlock(options: LayoutOptions)
```

**Layout** — `layout`, `flexFlow`, `flexDirection`, `flexWrap`, `justifyContent`, `justifyItems`, `alignItems`, `alignContent`, `placeContent`, `placeItems`, `gap`, `gapRow`, `gapColumn`

**Grid** — `gridTemplate`, `gridTemplateColumns`, `gridTemplateRows`, `gridAutoFlow`, `columnStart`, `columnEnd`

### ShapeBlock

```typescript
new ShapeBlock(options: IShapeOptions)
```

**Fill** — `fill`, `fillStyle`

**Stroke** — `stroke`, `strokeStyle`, `lineWidth`, `lineCap`, `lineJoin`, `miterLimit`, `lineDash`, `lineDashOffset`

**Paths** — `moveTo`, `lineTo`, `quadraticCurveTo`, `bezierCurveTo`, `arc`, `arcTo`, `ellipse`, `rect`, `roundRect`, `fillRect`, `strokeRect`

**Gradients** — `linearGradient`, `radialGradient`, `conicGradient`, `colorStops`

**Filters** — `blur`, `brightness`, `contrast`, `dropShadow`, `grayscale`, `hueRotate`, `saturate`, `sepia`

**Shadows** — `shadowBlur`, `shadowColor`, `shadowOffsetX`, `shadowOffsetY`

**Text** — `font`, `fillText`, `strokeText`, `fontStretch`, `fontKerning`, `fontVariantCaps`, `textAlign`, `textBaseline`, `textRendering`, `direction`, `wordSpacing`, `letterSpacing`

**Compositing** — `globalAlpha`, `globalCompositeOperation`, `drawImage`, `pattern`, `imageSmoothingEnabled`, `imageSmoothingQuality`

**Other** — `clip`

**Methods** — `render`, `draw`, `beginPath`, `closePath`, `pointInPath`, `pointInStroke`, `measureText`

### RectangleBlock

```typescript
new RectangleBlock(options: IRectangleOptions)
```

**Options** — `backgroundColor`, `borderRadius`, `border`, `borderTop`, `borderRight`, `borderBottom`, `borderLeft`, `borderWidth`, `borderColor`, `borderStyle`

**Methods** — `draw`, `checkInBound`, `render`, `updateCords`

### CircleBlock

```typescript
new CircleBlock(options: ICircleOptions)
```

**Options** — `backgroundColor`, `startAngle`, `endAngle`, `innerRadius`, `border`, `borderWidth`, `borderColor`, `borderStyle`

**Methods** — `draw`, `checkInBound`, `render`, `updateCords`

### LineBlock

```typescript
new LineBlock(options: ILineOptions)
```

**Options** — `controlPoints`, `lineColor`, `fillColor`, `closeLine`, `controlPointsSize`, `controlLineWidth`, `controlPointBackgroundColor`, `controlPointStrokeColor`, `editable`, `stickyStart`, `stickyEnd`

**Per-point options** — `startX`, `startY`, `endX`, `endY`, `startControlX`, `startControlY`, `endControlX`, `endControlY`, `startDraggable`, `endDraggable`, `startControllable`, `endControllable`, `stickyStart`, `stickyEnd`

**Methods** — `draw`, `addControlPoint`, `addControlPointToHead`, `addControlPointToTail`, `removeControlPoint`, `removeControlPointHead`, `removeControlPointTail`, `checkInBound`, `render`, `updateCords`, `updateCordinates`

**Property** — `path`

### TextBlock

```typescript
new TextBlock(options: ITextOptions)
```

**Options** — `text`, `fontFamily`, `fontSize`, `fontWeight`, `fontVariant`, `fontStyle`, `color`, `strokeColor`, `strokeWidth`, `wrap`, `letterSpacing`, `lineHeight`, `editable`, `onEditable`, `caret`

**Methods** — `draw`, `measureText`, `checkInBound`, `render`, `init`, `updateCords`

### ImageBlock

```typescript
new ImageBlock(options: ImageOptions)
```

**Options** — `source`, `objectFit`, `clipX`, `clipY`, `clipWidth`, `clipHeight`, `repeatX`, `repeatY`

**Methods** — `draw`, `init`

**Property** — `mediaSource`

### VideoBlock

```typescript
new VideoBlock(options: VideoOptions)
```

**Options** — `source`, `objectFit`, `clipX`, `clipY`, `clipWidth`, `clipHeight`, `repeatX`, `repeatY`, `autoPlay`, `onPlay`

**Methods** — `draw`, `init`, `play`, `pause`

**Properties** — `mediaSource`, `isPlaying`, `isPaused`

## The utility functions

### Unit conversion

Each takes the number of units and the size to resolve against.

```typescript
fromPercentage(from: number, parentSize: number): number
fromVW(from: number, parentWidth: number): number
fromVH(from: number, parentHeight: number): number
fromRem(from: number, parentSize: number): number
fromEm(from: number, parentSize: number): number
fromCm(from: number): number
fromMm(from: number): number
fromQ(from: number): number
fromIn(from: number): number
fromPc(from: number): number
fromPt(from: number): number
```

### Geometry

```typescript
xIntersect(box1: { left, right }, box2: { left, right }): number
yIntersect(box1: { top, bottom }, box2: { top, bottom }): number
checkInBound(pointX, pointY, px1, py1, px2, py2, px3, py3, px4, py4): boolean
rotateCordinatesByRadian(x, y, centerX, centerY, radian): { x, y }
```

`checkInBound` tests a point against a quadrilateral given by its four corners in order.

### Angles

```typescript
radianToDegree(radian: number): number
degreeToRadian(degree: number): number
```

### Easing

```typescript
bezierEasing(mX1: number, mY1: number, mX2: number, mY2: number): (t, duration) => number
cubicBezier(p0, p1, p2, p3, t): number
linear(...points: number[]): (t: number) => number
steps(step: number, position: JumpPosition): (t: number) => number
```

`steps` takes a position of `'jump-start'`, `'jump-end'`, `'jump-none'`, or `'jump-both'`.

### Maths

```typescript
lerp(start: number, end: number, t: number): number
clamp(num: number, min: number, max: number): number
inRange(value: number, great: number, less: number): boolean
```

### Colour

```typescript
hexToRgba(hex: string): string
hslToRgba(hsl: string): string
colorToRgba(color: string): string
```

`hexToRgba` accepts `#rgb`, `#rgba`, `#rrggbb`, and `#rrggbbaa`. `colorToRgba` accepts one of the seventeen named colours. Both return an `rgba(...)` string.

## Where to go next

- [Overview](/docs/overview/) — the mental model.
- [Custom blocks](/docs/custom-blocks/) — build on `Block`.
- [The full API reference](/api/canvas) — the class-by-class reference.
