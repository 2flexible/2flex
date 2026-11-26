---
id: custom-shape
title: Custom Shape
description: Draw custom paths with ShapeBlock and the native canvas 2D context.
---

`ShapeBlock` gives you direct access to the native 2D context while keeping every block feature — transformations, layout, events, and animation.

```javascript


const shape = new ShapeBlock({ x: 0, y: 0, width: 100, height: 100 });
```

## Drawing with a callback

The `draw` method receives the rendering context and runs on every frame.

```javascript
const shape = new ShapeBlock({ x: 0, y: 0, width: 100, height: 100 });

shape.draw((context) => {
  context.rect(0, 0, 100, 40);
  context.fillStyle = 'blue';
  context.fill();
  context.stroke();
});
```

> [!NOTE]
>
> The context passed to `draw` is the block's own offscreen context, already translated to the block's origin and transformed by its rotation and scale.

## Using shape options instead

Many shapes can be expressed with options alone, without a callback.

```javascript
const shape = new ShapeBlock({
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  rect: { x: 0, y: 0, width: 100, height: 40 },
  fillStyle: 'blue',
  fill: { fill: true },
  stroke: { stroke: true },
});
```

## Fills and strokes

```javascript
const shape = new ShapeBlock({
  width: 200,
  height: 100,
  fill: { fill: true },
  fillStyle: '#3b82f6',
  stroke: { stroke: true },
  strokeStyle: '#1e3a8a',
  lineWidth: 4,
  lineCap: 'round',
  lineJoin: 'bevel',
  lineDash: [10, 5],
});
```

| Option        | Type       | Description                  |
| ------------- | ---------- | ---------------------------- |
| `fill`        | `Fill`     | Fill the current path        |
| `fillStyle`   | `string`   | Fill colour or gradient      |
| `stroke`      | `Stroke`   | Stroke the current path      |
| `strokeStyle` | `string`   | Stroke colour or gradient    |
| `lineWidth`   | `number`   | Stroke width                 |
| `lineCap`     | `string`   | `butt`, `round`, or `square` |
| `lineJoin`    | `string`   | `miter`, `round`, or `bevel` |
| `lineDash`    | `number[]` | Dash pattern                 |

## Paths

Path-building options mirror the canvas API.

```javascript
const shape = new ShapeBlock({
  width: 200,
  height: 200,
  moveTo: { x: 0, y: 0 },
  lineTo: { x: 100, y: 50 },
  quadraticCurveTo: { cpx1: 150, cpy1: 100, endX: 180, endY: 20 },
  bezierCurveTo: {
    cpx1: 190,
    cpy1: 60,
    cpx2: 200,
    cpy2: 100,
    endX: 180,
    endY: 160,
  },
  arc: { x: 100, y: 100, radius: 40, startAngle: 0, endAngle: Math.PI },
  ellipse: {
    x: 100,
    y: 100,
    radiusX: 60,
    radiusY: 30,
    rotation: 0,
    startAngle: 0,
    endAngle: Math.PI * 2,
  },
});
```

Available path options: `moveTo`, `lineTo`, `quadraticCurveTo`, `bezierCurveTo`, `arc`, `arcTo`, `ellipse`, `rect`, `roundRect`, `fillRect`, and `strokeRect`.

To close the path, call the `closePath` method — it is not an option.

```javascript
shape.closePath();
```

## Gradients

```javascript
const shape = new ShapeBlock({
  width: 200,
  height: 200,
  fill: { fill: true },
  linearGradient: { x0: 0, y0: 0, x1: 200, y1: 200 },
  colorStops: [
    { stop: 0, color: '#3b82f6' },
    { stop: 1, color: '#ef4444' },
  ],
});
```

| Gradient         | Description                                  |
| ---------------- | -------------------------------------------- |
| `linearGradient` | Linear gradient definition                   |
| `radialGradient` | Radial gradient definition                   |
| `conicGradient`  | Conic gradient definition                    |
| `colorStops`     | The colour stops for the gradient, top-level |

## Filters and effects

```javascript
const shape = new ShapeBlock({
  width: 200,
  height: 200,
  fill: { fill: true },
  fillStyle: '#3b82f6',
  blur: 4,
  brightness: 1.2,
  contrast: 1.1,
  grayscale: 0.3,
  sepia: 0.2,
  hueRotate: 45,
  saturate: 1.3,
  dropShadow: [4, 4, 8, 'rgba(0, 0, 0, 0.3)'],
});
```

## Shadows

```javascript
const shape = new ShapeBlock({
  width: 200,
  height: 200,
  fill: { fill: true },
  fillStyle: 'black',
  shadowBlur: 16,
  shadowColor: 'rgba(0, 0, 0, 0.4)',
  shadowOffsetX: 4,
  shadowOffsetY: 4,
});
```

## Reference

- [ShapeBlock API](/api/shape-block) — every drawing option
