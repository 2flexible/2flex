---
id: rectangle
title: Rectangle
description: The RectangleBlock — fills, border radius, and per-side border customization.
---

`RectangleBlock` extends [`ShapeBlock`](/api/shape-block) with the options you would expect from a box: a background colour, a border, and a corner radius.

```javascript


const block = new RectangleBlock({
  width: 120,
  height: 60,
  backgroundColor: 'black',
});
```

## Background colour

```javascript
const block = new RectangleBlock({
  width: 120,
  height: 60,
  backgroundColor: '#3b82f6',
});
```

## Border radius

The radius accepts a single value for all corners, or an array in the order `[top-left, top-right, bottom-right, bottom-left]`.

```javascript
// All corners
const uniform = new RectangleBlock({ width: 120, height: 60, borderRadius: 16 });

// Per-corner
const mixed = new RectangleBlock({
  width: 120,
  height: 60,
  borderRadius: [40, 50, 0, 0],
});
```

## Borders

The `border` option takes a CSS shorthand string.

```javascript
const block = new RectangleBlock({
  width: 120,
  height: 60,
  border: '30px solid white',
});
```

Individual sides can be targeted too.

```javascript
const block = new RectangleBlock({
  width: 120,
  height: 60,
  borderTop: '30px solid white',
  borderBottom: '2px solid black',
});
```

| Option         | Description |
| -------------- | ----------- |
| `border`       | All sides   |
| `borderTop`    | Top side    |
| `borderRight`  | Right side  |
| `borderBottom` | Bottom side |
| `borderLeft`   | Left side   |

For finer control, set the components directly.

```javascript
const block = new RectangleBlock({
  width: 120,
  height: 60,
  borderWidth: 2,
  borderColor: 'white',
  borderStyle: 'dashed',
});
```

| Option        | Type     | Default   |
| ------------- | -------- | --------- |
| `borderWidth` | `number` | `0`       |
| `borderColor` | `string` | `"white"` |
| `borderStyle` | `string` | `"solid"` |

## Reference

- [RectangleBlock API](/api/rectangle-block)
- [ShapeBlock API](/api/shape-block) — inherited drawing options
