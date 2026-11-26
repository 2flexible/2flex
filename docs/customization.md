---
id: customization
title: Customization
description: Tune the hot corners, hot lines, and interaction handles that make up a block's interactive chrome.
---

Blocks draw their own interaction handles — the resizable corners and edges, the rotation corners, and the control points. These are the "hot" elements, and every one of them is customizable.

## Hot corners

Hot corners are the handles used for resizing and rotating.

```javascript
const block = new RectangleBlock({
  width: 100,
  height: 100,
  selectable: true,
  resizable: true,
  rotatable: true,
});
```

### Size

```javascript
const block = new RectangleBlock({
  width: 100,
  height: 100,
  selectable: true,
  resizable: true,
  hotCornerSize: 12,
});
```

| Option            | Type       | Default |
| ----------------- | ---------- | ------- |
| `hotCornerSize`   | `number`   | `10`    |
| `hotCornerRadius` | `number[]` | `[0]`   |

### Colour and stroke

```javascript
const block = new RectangleBlock({
  width: 100,
  height: 100,
  selectable: true,
  resizable: true,
  hotCornerBackgroundColor: 'white',
  hotCornerStrokeColor: 'red',
  hotCornerStrokeWidth: 2,
});
```

| Option                     | Type     | Default   |
| -------------------------- | -------- | --------- |
| `hotCornerBackgroundColor` | `string` | `"white"` |
| `hotCornerStrokeColor`     | `string` | `"blue"`  |
| `hotCornerStrokeWidth`     | `number` | `2.5`     |

## Hot lines

Hot lines are the guides drawn along a block's edges while it is being resized.

```javascript
const block = new RectangleBlock({
  width: 100,
  height: 100,
  selectable: true,
  resizable: true,
  hotLineStrokeColor: 'red',
  hotLineStrokeWidth: 1,
});
```

| Option               | Type     | Default  |
| -------------------- | -------- | -------- |
| `hotLineStrokeColor` | `string` | `"blue"` |
| `hotLineStrokeWidth` | `number` | `2.5`    |

## Hot areas

Resizable and rotatable areas are the invisible regions that trigger a resize or rotation. They are separate from the visible corners.

```javascript
const block = new RectangleBlock({
  width: 100,
  height: 100,
  selectable: true,
  resizable: true,
  rotatable: true,
  hotResizableAreaSize: 20,
  hotResizableAreaGap: 4,
  hotRotatableAreaSize: 20,
  hotRotatableAreaGap: 4,
});
```

| Option                 | Type     | Default |
| ---------------------- | -------- | ------- |
| `hotResizableAreaSize` | `number` | `15`    |
| `hotResizableAreaGap`  | `number` | `0`     |
| `hotRotatableAreaSize` | `number` | `15`    |
| `hotRotatableAreaGap`  | `number` | `0`     |

### Per-area toggles

Each handle has an independent toggle. For resizing:

`resizableTopLeft`, `resizableTop`, `resizableTopRight`, `resizableRight`, `resizableBottomRight`, `resizableBottom`, `resizableBottomLeft`, `resizableLeft`.

For rotation:

`rotatableTopLeft`, `rotatableTopRight`, `rotatableBottomLeft`, `rotatableBottomRight`.

For the hot areas:

`hotResizableAreaTopLeft`, `hotResizableAreaTopRight`, `hotResizableAreaBottomLeft`, `hotResizableAreaBottomRight`, `hotResizableAreaTop`, `hotResizableAreaRight`, `hotResizableAreaBottom`, `hotResizableAreaLeft`, `hotRotatableAreaTopLeft`, `hotRotatableAreaTopRight`, `hotRotatableAreaBottomLeft`, `hotRotatableAreaBottomRight`.

```javascript
const block = new RectangleBlock({
  width: 100,
  height: 100,
  selectable: true,
  resizable: true,
  rotatable: true,
  resizableTop: false,
  resizableLeft: false,
  rotatableBottomRight: false,
});
```

## Overflow

When a block's children extend past its bounds, `overflow` controls whether they are clipped.

```javascript
const block = new RectangleBlock({
  width: 100,
  height: 100,
  overflow: 'hidden',
});
```

| Option              | Type     | Default     | Description              |
| ------------------- | -------- | ----------- | ------------------------ |
| `overflow`          | `string` | `"visible"` | Shorthand for both axes  |
| `overflowX`         | `string` | `"visible"` | Horizontal clipping      |
| `overflowY`         | `string` | `"visible"` | Vertical clipping        |
| `overflowPositionX` | `number` | `0`         | Horizontal scroll offset |
| `overflowPositionY` | `number` | `0`         | Vertical scroll offset   |

Both `overflow` and the axis-specific options accept `"visible"`, `"hidden"`, `"scroll"`, and `"auto"`.

## Reference

- [Block API](/api/block) — hot line options
- [Block API](/api/block) — resizable options
- [Block API](/api/block) — rotatable options
- [Block API](/api/block) — overflow options
