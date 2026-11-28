---
id: line
title: Line
description: The LineBlock — straight and cubic Bézier lines with control points, stickiness, and joining.
---

`LineBlock` draws lines between points. It is the most interactive of the shapes, with draggable endpoints and editable control points.

```javascript


const line = new LineBlock({
  width: 120,
  height: 120,
  startX: 120,
  startY: 120,
  endX: 240,
  endY: 240,
  lineColor: 'white',
  lineWidth: 30,
});
```

| Option      | Type     | Description                    |
| ----------- | -------- | ------------------------------ |
| `startX`    | `number` | Start point x                  |
| `startY`    | `number` | Start point y                  |
| `endX`      | `number` | End point x                    |
| `endY`      | `number` | End point y                    |
| `lineColor` | `string` | Stroke colour                  |
| `lineWidth` | `number` | Stroke width                   |
| `fillColor` | `string` | Fill colour (for closed paths) |

## Bézier curves

Add control points to turn the line into a cubic Bézier curve.

```javascript
const curve = new LineBlock({
  width: 200,
  height: 200,
  startX: 40,
  startY: 160,
  startControlX: 280,
  startControlY: 20,
  endX: 340,
  endY: 160,
  endControlX: 200,
  endControlY: 310,
  lineColor: 'white',
  lineWidth: 4,
});
```

| Option          | Type     | Description           |
| --------------- | -------- | --------------------- |
| `startControlX` | `number` | Start control point x |
| `startControlY` | `number` | Start control point y |
| `endControlX`   | `number` | End control point x   |
| `endControlY`   | `number` | End control point y   |

## Draggable endpoints

Set `editable` to true to let users drag the endpoints and control points.

```javascript
const line = new LineBlock({
  width: 200,
  height: 200,
  startX: 40,
  startY: 160,
  endX: 340,
  endY: 160,
  lineColor: 'white',
  lineWidth: 4,
  editable: true,
});
```

## Control point styling

```javascript
const line = new LineBlock({
  width: 200,
  height: 200,
  startX: 40,
  startY: 160,
  endX: 340,
  endY: 160,
  controlPointsSize: 12,
  controlPointStrokeColor: 'red',
  controlLineWidth: 2,
});
```

| Option                    | Type     | Default  |
| ------------------------- | -------- | -------- |
| `controlPointsSize`       | `number` | `5`      |
| `controlPointStrokeColor` | `string` | `"blue"` |
| `controlLineWidth`        | `number` | `2`      |

## Sticky endpoints

An endpoint can be bound to another block, so the line follows it as it moves. The `x` and `y` values are offsets from the target block's origin.

```javascript
const start = new RectangleBlock({ width: 80, height: 80, backgroundColor: 'red' });
const end = new RectangleBlock({ width: 80, height: 80, backgroundColor: 'blue' });

const line = new LineBlock({
  width: 300,
  height: 300,
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0,
  lineColor: 'white',
  lineWidth: 2,
  stickyStart: { block: start, x: start.width(), y: start.height() },
  stickyEnd: { block: end, x: 0, y: 0 },
});
```

## Editing control points

Control points can be added and removed at runtime. The index is the position of the point in the line's control point list.

```javascript
const line = new LineBlock({ width: 200, height: 200 });

line.addControlPoint({ x: 100, y: 50 }, 0);
line.addControlPointToHead({ x: 0, y: 0 });
line.addControlPointToTail({ x: 200, y: 150 });

line.removeControlPoint(0);
line.removeControlPointHead();
line.removeControlPointTail();
```

See the [LineBlock API](/api/line-block) for the full list of methods.

## Closing the path

Set `closeLine` to draw a line back to the start, and use `fillColor` to fill the enclosed shape.

```javascript
const triangle = new LineBlock({
  width: 200,
  height: 200,
  startX: 100,
  startY: 20,
  endX: 180,
  endY: 180,
  lineColor: 'white',
  lineWidth: 3,
  closeLine: true,
  fillColor: 'rgba(59, 130, 246, 0.4)',
});
```

## Reference

- [LineBlock API](/api/line-block)
- [ShapeBlock API](/api/shape-block) — inherited drawing options
