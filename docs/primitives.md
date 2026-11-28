---
id: primitives
title: Primitives
description: Draw rectangles, circles, arcs, and lines — fills, borders, corner radii, control points, and sticky endpoints.
---

The library ships four drawing primitives. Each one is a `ShapeBlock`, which means they all support the same options for fills, strokes, gradients, and filters.

## Rectangle

`RectangleBlock` draws a filled rectangle with optional borders and per-corner radii.

```typescript


const rect = new RectangleBlock({
  x: 0,
  y: 0,
  width: 200,
  height: 120,
  backgroundColor: '#3b82f6',
});
```

### Corner radius

`borderRadius` accepts a number, which applies to all four corners, or an array of four values in the order top-left, top-right, bottom-right, bottom-left.

```typescript
const rounded = new RectangleBlock({
  width: 200,
  height: 120,
  backgroundColor: '#3b82f6',
  borderRadius: 16,
});

const asymmetric = new RectangleBlock({
  width: 200,
  height: 120,
  backgroundColor: '#3b82f6',
  borderRadius: [24, 4, 24, 4],   // tl, tr, br, bl
});
```

> [!NOTE] Radii are scaled down if they overflow
>
> If two radii on the same edge add up to more than the width or height, they are scaled proportionally so they still fit.

### Borders

There are two ways to set a border.

The shorthand takes a string in the CSS format, or a tuple of `[width, style, colour]`.

```typescript
const outlined = new RectangleBlock({
  width: 200,
  height: 120,
  backgroundColor: '#3b82f6',
  border: '2px solid #1e40af',
});

const tuple = new RectangleBlock({
  width: 200,
  height: 120,
  backgroundColor: '#3b82f6',
  border: [2, 'solid', '#1e40af'],
});
```

> [!WARNING] The shorthand splits on spaces
>
> The string form is split on whitespace and the first three tokens are used. The colour must be a single token — `"2px solid #ffffff"` works, `"2px solid rgba(255, 255, 255, 0.3)"` does not. Use the tuple form for colours with spaces in them.

The styles are `'solid'` and `'dotted'`.

Each side can also be set on its own, which overrides the shorthand for that side.

| Option         | Sets            |
| -------------- | --------------- |
| `borderTop`    | The top edge    |
| `borderRight`  | The right edge  |
| `borderBottom` | The bottom edge |
| `borderLeft`   | The left edge   |

```typescript
const underlined = new RectangleBlock({
  width: 200,
  height: 120,
  backgroundColor: '#1e293b',
  borderBottom: '2px solid #38bdf8',
});
```

> [!NOTE] Per-side borders win over the shorthand
>
> When a side-specific border is set, the `border` shorthand is skipped for that side entirely, and the corner joins are drawn to match.

### Component border options

`borderWidth`, `borderColor`, and `borderStyle` set the border's parts individually. They are the fallback for the shorthand.

```typescript
const rect = new RectangleBlock({
  width: 200,
  height: 120,
  borderWidth: 2,
  borderColor: '#1e40af',
  borderStyle: 'dotted',
});
```

## Circle

`CircleBlock` draws an ellipse, an arc, or a pie slice, depending on its angles and inner radius.

```typescript


const circle = new CircleBlock({
  width: 120,
  height: 120,
  backgroundColor: '#8b5cf6',
});
```

The circle is inscribed in the block's box. A block with equal width and height gives a circle; unequal values give an ellipse.

### Angles

`startAngle` and `endAngle` are in **radians**. The default runs from `0` to `Math.PI * 2` — a full turn.

```typescript
const quarter = new CircleBlock({
  width: 120,
  height: 120,
  backgroundColor: '#8b5cf6',
  startAngle: 0,
  endAngle: Math.PI / 2,
});
```

> [!NOTE] Angles start at 3 o'clock
>
> An angle of `0` points to the right. Positive angles run clockwise on screen.

### Inner radius

`innerRadius` turns the shape into a ring or a pie slice.

```typescript
const ring = new CircleBlock({
  width: 120,
  height: 120,
  backgroundColor: 'none',
  innerRadius: 40,
  borderWidth: 0,
});

const pie = new CircleBlock({
  width: 120,
  height: 120,
  backgroundColor: '#f43f5e',
  innerRadius: 40,
  startAngle: 0,
  endAngle: Math.PI / 2,
});
```

> [!NOTE] A ring uses the even-odd fill rule
>
> When the shape is a full circle with an inner radius, it is filled with the `evenodd` rule so the hole is genuinely empty. A partial arc with an inner radius uses the `nonzero` rule and is filled as a solid slice.

### Borders

`CircleBlock` has `borderWidth`, `borderColor`, and `borderStyle`, plus a `border` shorthand in the same form as the rectangle's.

```typescript
const outlined = new CircleBlock({
  width: 120,
  height: 120,
  backgroundColor: '#8b5cf6',
  border: '3px solid #1e1b4b',
});
```

> [!WARNING] The circle's border shorthand has the same space-splitting rule
>
> `"3px solid #1e1b4b"` works. A colour with spaces inside it does not — use the tuple form.

## Line

`LineBlock` draws a straight line or a cubic Bézier curve. Its points are described with the `controlPoints` array — each entry is one segment, with a start and an end.

```typescript


const line = new LineBlock({
  controlPoints: [
    { startX: 0, startY: 0, endX: 200, endY: 80 },
  ],
  lineColor: '#22c55e',
  lineWidth: 3,
});
```

The line's `width` and `height` are derived from its points, so you do not set them.

> [!WARNING] Points live in controlPoints, not at the top level
>
> The path is built from the `controlPoints` array. Top-level `startX`, `startY`, `endX`, and `endY` options are accepted by the constructor but are not what the line is drawn from — a line built that way renders nothing. Always describe the points inside `controlPoints`.

### Curves

Set the control points on a segment to turn it into a cubic Bézier.

```typescript
const curve = new LineBlock({
  controlPoints: [
    {
      startX: 0,
      startY: 100,
      endX: 200,
      endY: 100,
      startControlX: 50,
      startControlY: 0,
      endControlX: 150,
      endControlY: 200,
    },
  ],
  lineColor: '#22c55e',
  lineWidth: 3,
});
```

> [!NOTE] All four control values are needed
>
> A segment is drawn as a Bézier only when all four of `startControlX`, `startControlY`, `endControlX`, and `endControlY` are set. If any is missing, the segment is drawn as a straight line.

### Fill and close

`fillColor` fills the closed region between the points, and `closeLine` closes the path.

```typescript
const closed = new LineBlock({
  controlPoints: [
    { startX: 0, startY: 0, endX: 100, endY: 0 },
    { startX: 100, startY: 0, endX: 50, endY: 100 },
    { startX: 50, startY: 100, endX: 0, endY: 0 },
  ],
  closeLine: true,
  fillColor: 'rgba(34, 197, 94, 0.25)',
  lineColor: '#22c55e',
  lineWidth: 2,
});
```

### Multiple segments

Each entry in `controlPoints` is one segment. The end of one segment is the start of the next.

```typescript
const polyline = new LineBlock({
  controlPoints: [
    { startX: 0, startY: 0, endX: 60, endY: 40 },
    { startX: 60, startY: 40, endX: 120, endY: 0 },
    { startX: 120, startY: 0, endX: 180, endY: 40 },
  ],
  lineColor: '#f97316',
  lineWidth: 3,
});
```

### Editing the points

Set `editable: true` and the user can drag the endpoints and control points.

```typescript
const editable = new LineBlock({
  controlPoints: [
    { startX: 0, startY: 0, endX: 200, endY: 80 },
  ],
  lineColor: '#22c55e',
  lineWidth: 3,
  editable: true,
});
```

You can also add and remove points at runtime.

```typescript
line.addControlPoint({ startX: 100, startY: 40, endX: 140, endY: 90 }, 1);
line.addControlPointToTail({ startX: 240, startY: 120, endX: 280, endY: 160 });
line.addControlPointToHead({ startX: -40, startY: -20, endX: 0, endY: 0 });

line.removeControlPoint(1);
line.removeControlPointHead();
line.removeControlPointTail();
```

> [!NOTE] Per-point options
>
> Each point entry can carry its own options: `startDraggable`, `endDraggable`, `startControllable`, `endControllable`, `stickyStart`, and `stickyEnd`. These control whether that specific handle can be moved, and whether that endpoint is bound to another block.

### Control point styling

| Option                        | Type     | Default   | What it does                             |
| ----------------------------- | -------- | --------- | ---------------------------------------- |
| `controlPointsSize`           | `number` | `5`       | The radius of the control point handles  |
| `controlLineWidth`            | `number` | `2`       | The width of the control lines           |
| `controlPointBackgroundColor` | `string` | `'white'` | The fill of the control point handles    |
| `controlPointStrokeColor`     | `string` | `'blue'`  | The outline of the control point handles |

```typescript
const editable = new LineBlock({
  // ...
  editable: true,
  controlPointsSize: 7,
  controlLineWidth: 1.5,
  controlPointBackgroundColor: '#ffffff',
  controlPointStrokeColor: '#22c55e',
});
```

### Sticky endpoints

A sticky endpoint is attached to another block and follows it as it moves. The binding lives on the point, inside `controlPoints`.

```typescript
const node = new RectangleBlock({
  x: 100,
  y: 100,
  width: 60,
  height: 60,
});

const connector = new LineBlock({
  controlPoints: [
    {
      startX: 0,
      startY: 0,
      endX: 100,
      endY: 100,
      stickyEnd: { block: node, x: 30, y: 30 },
    },
  ],
  lineColor: '#64748b',
  lineWidth: 2,
});
```

`stickyStart` and `stickyEnd` each take a `block` and optional `x` and `y` offsets, measured from the target block's top-left corner.

> [!WARNING] The binding belongs on the point
>
> `stickyEnd` and `stickyStart` are read from the individual point entries, not from the top level of the options object. A top-level `stickyEnd` is accepted but is not applied.

> [!NOTE] Sticky endpoints create a dependency
>
> The line declares a dependency on the block it is bound to, so moving that block re-renders the line. The dependency is removed automatically when the point is removed.

## Next steps

- [Text](/docs/text/) — editable, wrappable text.
- [Media](/docs/media/) — images and video.
- [Custom drawing](/docs/custom-drawing/) — arbitrary paths, gradients, and filters.
