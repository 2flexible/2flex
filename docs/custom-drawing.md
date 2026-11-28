---
id: custom-drawing
title: Custom drawing
description: Draw arbitrary paths, gradients, filters, and shadows with ShapeBlock, and reach the raw Canvas 2D context.
---

`ShapeBlock` is the base for every drawn shape. It gives you the whole Canvas 2D drawing surface as options, and a `draw` callback for anything the options do not cover.

```typescript


const shape = new ShapeBlock({
  width: 200,
  height: 200,
  draw: (context) => {
    context.beginPath();
    context.moveTo(0, 100);
    context.lineTo(100, 0);
    context.lineTo(200, 100);
    context.closePath();
    context.fillStyle = '#3b82f6';
    context.fill();
  },
});
```

> [!WARNING] draw is not a constructor option
>
> The `draw` option is not registered on the block, so passing it to the constructor has no effect. Call `shape.draw(fn)` after construction, or override the `draw` method in a subclass.

## The draw callback

`draw` receives the offscreen 2D context and is called every time the block is painted.

```typescript
const shape = new ShapeBlock({ width: 200, height: 200 });

shape.draw((context) => {
  context.strokeStyle = '#ef4444';
  context.lineWidth = 4;
  context.strokeRect(10, 10, 180, 180);
});
```

The context is the standard `OffscreenCanvasRenderingContext2D`, so everything you know from the Canvas 2D API works.

> [!NOTE] The context is translated for you
>
> The context is already translated to the block's `x` and `y` before your callback runs. Draw in the block's local coordinates — `(0, 0)` is the block's top-left corner.

## Paths

The library exposes the path-building operations as options, so you can describe a shape declaratively.

| Option             | Type                                                         | What it does            |
| ------------------ | ------------------------------------------------------------ | ----------------------- |
| `moveTo`           | `{ x, y }`                                                   | Starts a new sub-path   |
| `lineTo`           | `{ x, y }`                                                   | Draws a line to a point |
| `quadraticCurveTo` | `{ cpx1, cpy1, endX, endY }`                                 | A quadratic curve       |
| `bezierCurveTo`    | `{ cpx1, cpy1, cpx2, cpy2, endX, endY }`                     | A cubic curve           |
| `arc`              | `{ x, y, radius, startAngle, endAngle }`                     | An arc                  |
| `arcTo`            | `{ x1, y1, x2, y2, radius }`                                 | A rounded corner        |
| `ellipse`          | `{ x, y, radiusX, radiusY, rotation, startAngle, endAngle }` | An ellipse              |
| `rect`             | `{ x, y, width, height }`                                    | A rectangle             |
| `roundRect`        | `{ x, y, width, height, borderRadius }`                      | A rounded rectangle     |
| `fillRect`         | `{ x, y, width, height }`                                    | A filled rectangle      |
| `strokeRect`       | `{ x, y, width, height }`                                    | A stroked rectangle     |

```typescript
const arrow = new ShapeBlock({
  width: 200,
  height: 120,
  moveTo: { x: 0, y: 60 },
  lineTo: { x: 160, y: 60 },
  lineTo: { x: 130, y: 30 },
  lineTo: { x: 130, y: 90 },
  fill: { fill: true },
  fillStyle: '#22c55e',
});
```

> [!NOTE] closePath is a method, not an option
>
> `closePath()` and `beginPath()` are methods on the block, not options. Call them from a `draw` callback when you need them. The `closeLine` option exists on `LineBlock`, not on `ShapeBlock`.

## Fills and strokes

| Option           | Type                                  | What it does             |
| ---------------- | ------------------------------------- | ------------------------ |
| `fill`           | `{ fill: boolean, path?, fillRule? }` | Fills the current path   |
| `fillStyle`      | `string \| CanvasGradient`            | The fill colour          |
| `stroke`         | `{ stroke: boolean, path? }`          | Strokes the current path |
| `strokeStyle`    | `string \| CanvasGradient`            | The stroke colour        |
| `lineWidth`      | `number`                              | The stroke width         |
| `lineCap`        | `CanvasLineCap`                       | The line cap style       |
| `lineJoin`       | `CanvasLineJoin`                      | The line join style      |
| `miterLimit`     | `number`                              | The miter limit          |
| `lineDash`       | `number[]`                            | The dash pattern         |
| `lineDashOffset` | `number`                              | The dash offset          |

```typescript
const dashed = new ShapeBlock({
  width: 200,
  height: 100,
  moveTo: { x: 0, y: 50 },
  lineTo: { x: 200, y: 50 },
  stroke: { stroke: true },
  strokeStyle: '#64748b',
  lineWidth: 2,
  lineDash: [8, 4],
  lineCap: 'round',
});
```

> [!NOTE] fill and stroke are separate options
>
> Setting `fillStyle` does not fill anything, and setting `strokeStyle` does not stroke anything. The `fill` and `stroke` options are what actually paint the path.

## Gradients

Three gradient types are available. Each creates a `CanvasGradient` that is then used as the fill or stroke style.

| Option           | Type                         |
| ---------------- | ---------------------------- |
| `linearGradient` | `{ x0, y0, x1, y1 }`         |
| `radialGradient` | `{ x0, y0, r0, x1, y1, r1 }` |
| `conicGradient`  | `{ angle, x, y }`            |

The stops are added with `colorStops`.

```typescript
const gradient = new ShapeBlock({
  width: 200,
  height: 200,
  rect: { x: 0, y: 0, width: 200, height: 200 },
  linearGradient: { x0: 0, y0: 0, x1: 200, y1: 200 },
  colorStops: [
    { stop: 0, color: '#3b82f6' },
    { stop: 1, color: '#ec4899' },
  ],
  fill: { fill: true },
});
```

> [!WARNING] The gradient overrides the colour
>
> When a gradient is set, it takes precedence over `fillStyle` and `strokeStyle`. You do not need to set `fillStyle` at all when a gradient is present.

## Filters

The CSS filter functions are available as options.

| Option       | Type                                        | What it does           |
| ------------ | ------------------------------------------- | ---------------------- |
| `blur`       | `number \| number[]`                        | A Gaussian blur        |
| `brightness` | `number \| number[]`                        | Adjusts the brightness |
| `contrast`   | `number \| number[]`                        | Adjusts the contrast   |
| `grayscale`  | `number \| number[]`                        | Converts to grey       |
| `sepia`      | `number \| number[]`                        | Applies a sepia tone   |
| `hueRotate`  | `number \| number[]`                        | Rotates the hue        |
| `saturate`   | `number \| number[]`                        | Adjusts the saturation |
| `dropShadow` | `[number, number, number, string] \| array` | Adds a shadow          |

```typescript
const soft = new ShapeBlock({
  width: 200,
  height: 200,
  rect: { x: 20, y: 20, width: 160, height: 160 },
  fill: { fill: true },
  fillStyle: '#3b82f6',
  blur: 4,
  dropShadow: [4, 4, 12, 'rgba(0, 0, 0, 0.4)'],
});
```

> [!NOTE] Filters are cumulative
>
> Each filter option adds to the filter chain. Setting both `blur` and `dropShadow` applies the blur and then the shadow.

## Shadows

The older shadow properties are also available.

| Option          | Type     | What it does                  |
| --------------- | -------- | ----------------------------- |
| `shadowBlur`    | `number` | The blur radius of the shadow |
| `shadowColor`   | `string` | The colour of the shadow      |
| `shadowOffsetX` | `number` | The horizontal offset         |
| `shadowOffsetY` | `number` | The vertical offset           |

```typescript
const raised = new ShapeBlock({
  width: 200,
  height: 200,
  rect: { x: 20, y: 20, width: 160, height: 160 },
  fill: { fill: true },
  fillStyle: '#ffffff',
  shadowColor: 'rgba(0, 0, 0, 0.25)',
  shadowBlur: 16,
  shadowOffsetX: 0,
  shadowOffsetY: 4,
});
```

## Clipping

`clip` clips everything drawn after it to a path.

| Option | Type                           | What it does    |
| ------ | ------------------------------ | --------------- |
| `clip` | `{ path?: Path2D, fillRule? }` | Clips to a path |

```typescript
const clipped = new ShapeBlock({
  width: 200,
  height: 200,
  clip: { fillRule: 'nonzero' },
});

clipped.draw((context) => {
  context.moveTo(100, 0);
  context.lineTo(200, 100);
  context.lineTo(100, 200);
  context.lineTo(0, 100);
  context.closePath();
  context.clip();
});
```

> [!NOTE] clip needs a path to clip against
>
> The `clip` option applies to the path that is current when the block is drawn. If you build the path with options, the path is built before the clip is applied. If you build it inside a `draw` callback, call `context.clip()` yourself.

## Compositing

| Option                     | Type                       | What it does                                   |
| -------------------------- | -------------------------- | ---------------------------------------------- |
| `globalAlpha`              | `number`                   | The global opacity                             |
| `globalCompositeOperation` | `GlobalCompositeOperation` | How the shape combines with what is beneath it |
| `imageSmoothingEnabled`    | `boolean`                  | Whether images are smoothed when scaled        |
| `imageSmoothingQuality`    | `ImageSmoothingQuality`    | The smoothing quality                          |

```typescript
const translucent = new ShapeBlock({
  width: 200,
  height: 200,
  rect: { x: 0, y: 0, width: 200, height: 200 },
  fill: { fill: true },
  fillStyle: 'rgba(59, 130, 246, 0.5)',
  globalAlpha: 0.8,
  globalCompositeOperation: 'multiply',
});
```

## Drawing images

`drawImage` draws an image source onto the block.

```typescript
const icon = new ShapeBlock({
  width: 64,
  height: 64,
  drawImage: {
    source: iconElement,
    x: 0,
    y: 0,
    width: 64,
    height: 64,
    clipX: 0,
    clipY: 0,
    clipWidth: 64,
    clipHeight: 64,
  },
});
```

`pattern` fills with a repeating image.

```typescript
const patterned = new ShapeBlock({
  width: 200,
  height: 200,
  rect: { x: 0, y: 0, width: 200, height: 200 },
  pattern: {
    image: tileElement,
    repetition: 'repeat',
  },
  fill: { fill: true },
});
```

## Hit testing

Two methods test whether a point is inside the drawn shape.

```typescript
shape.pointInPath({ x: 100, y: 100 });     // inside the path
shape.pointInStroke({ x: 100, y: 100 });   // on the stroke
```

Both accept an optional `path` to test against a specific path rather than the current one.

## Text on a shape

The Canvas 2D text options work on a `ShapeBlock` too.

| Option         | Type                        | What it does             |
| -------------- | --------------------------- | ------------------------ |
| `font`         | `string`                    | The CSS font shorthand   |
| `fillText`     | `{ text, x, y, maxWidth? }` | Fills text               |
| `strokeText`   | `{ text, x, y, maxWidth? }` | Strokes text             |
| `textAlign`    | `CanvasTextAlign`           | The horizontal alignment |
| `textBaseline` | `CanvasTextBaseline`        | The vertical alignment   |

```typescript
const label = new ShapeBlock({
  width: 200,
  height: 60,
  font: 'bold 24px sans-serif',
  fillText: { text: 'Label', x: 10, y: 40 },
  fillStyle: '#0f172a',
});
```

## Next steps

- [Custom blocks](/docs/custom-blocks/) — turn this into a reusable block type.
- [Animation](/docs/animation/) — animate the drawing options.
- [Primitives](/docs/primitives/) — the ready-made shapes.
