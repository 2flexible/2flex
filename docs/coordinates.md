---
id: coordinates
title: Coordinates
description: How positions, sizes, corners, flips, and the render lifecycle work — the geometry model behind every block.
---

Every block is described by a rectangle in a coordinate space. This page explains that space, the properties derived from it, and the order in which the library recomputes them.

## Canvas coordinates

A block's `x` and `y` are positions in **canvas space** — the coordinate system of the scene, not of the screen.

The origin `(0, 0)` is the top-left of the canvas element at zoom 1 and pan 0. As you pan and zoom, the canvas moves but the block's `x` and `y` do not. That is what makes a scene persistent: you can save `x` and `y` and restore it later, and it lands in the same place.

```typescript
const block = new RectangleBlock({ x: 100, y: 50, width: 80, height: 40 });

// Always 100, 50 — no matter where the viewport is scrolled to.
console.log(block.x(), block.y());
```

To convert a pointer position into canvas coordinates, use the canvas:

```typescript
const { x, y } = canvas.getCursorPosition(event);
```

## Width and height

`width` and `height` define the block's box. Both default to `0`, which means the block renders nothing.

```typescript
const block = new RectangleBlock({
  x: 0,
  y: 0,
  width: 200,
  height: 100,
});
```

> [!NOTE] Sizes are clamped
>
> Width and height are clamped to a maximum magnitude of 4096 pixels. A positive value is clamped to `[1, 4096]` and a negative value to `[-4096, -1]`. Values outside that range are silently adjusted, not rejected.

### Negative sizes mean flipped

A negative width or height flips the block along that axis. This is how the library represents a mirrored shape — the same mechanism CSS uses for negative `scaleX`.

```typescript
const flipped = new RectangleBlock({
  width: -100,   // mirrored on x
  height: 60,
});
```

The library tracks this for you. It exposes `horizontalFlip` and `verticalFlip` as booleans, computed from the corner positions rather than stored separately.

> [!NOTE] The options are `horizontalFlip` and `verticalFlip`
>
> Both options are declared on the `BaseBlockOptions` interface and are registered on every block, so they are available on all of them.

## The four corners

Under the hood, every block tracks its four corners rather than a plain box:

| Corner              | Meaning                          |
| ------------------- | -------------------------------- |
| `cornerTopLeft`     | Top-left of the bounding box     |
| `cornerTopRight`    | Top-right of the bounding box    |
| `cornerBottomLeft`  | Bottom-left of the bounding box  |
| `cornerBottomRight` | Bottom-right of the bounding box |

You do not normally set these by hand — the library computes them from `x`, `y`, `width`, and `height`. But they are readable, and they are the ground truth for hit testing and for clipping.

```typescript
const corners = block.getOptionCurrent('cornerTopLeft');
console.log(corners);   // { x: 0, y: 0 }
```

Setting them directly is possible but not recommended — the next layout pass will overwrite them.

## Derived measurements

Some values are computed from the corners after every layout pass. These are plain properties, not options, so you read them directly rather than calling them.

| Property      | What it is                                                   |
| ------------- | ------------------------------------------------------------ |
| `boundingBox` | The four corners as an object, including any stroke overhang |
| `realWidth`   | The width of the bounding box after rotation                 |
| `realHeight`  | The height of the bounding box after rotation                |
| `realCenterX` | The horizontal centre of the bounding box                    |
| `realCenterY` | The vertical centre of the bounding box                      |

```typescript
// A 100x50 block rotated 45 degrees has a larger bounding box.
const box = new RectangleBlock({ width: 100, height: 50, rotate: Math.PI / 4 });

box.realWidth;   // ~106
box.realHeight;  // ~106
```

> [!NOTE] rotationCenter defaults to 'parent'
>
> A block's rotation centre defaults to `'parent'`, which means it inherits the centre of its parent block. Set `rotationCenter: 'self'` to rotate around its own centre instead. See [Transformation](/docs/transform/).

## Scale

`scale` multiplies the block's size. It is applied on top of `width` and `height` during initialization, and the difference between the current and cached scale is applied incrementally afterwards.

```typescript
const block = new RectangleBlock({
  width: 100,
  height: 100,
  scale: 2,
});

block.width();   // 200 — the scale is folded into the size
```

> [!NOTE] Scale is applied once, at initialization
>
> The scale factor is multiplied into `width` and `height` when the block is first initialized. Changing `scale` later does not re-apply the factor to the already-scaled size — it applies the difference between the new and the previous scale. To change a block's size, set `width` and `height` directly.

## Rotation is in radians

`rotate` is an angle in **radians**, not degrees. The full turn is `Math.PI * 2`.

```typescript
const block = new RectangleBlock({
  width: 100,
  height: 100,
  rotate: Math.PI / 4,   // 45 degrees
});
```

The library exports helpers to convert between the two:

```typescript


const angle = degreeToRadian(45);   // 0.7853981633974483
const back = radianToDegree(angle); // 45
```

> [!NOTE] Rotation direction
>
> Positive angles rotate clockwise on screen, which is the opposite of the mathematical convention.

## Padding and margin

`padding` is space **inside** the block's box. It moves the content inward and grows the box.

`margin` is space **outside** the block's box. It pushes the block away from its siblings without changing its own size.

Both accept a shorthand:

```typescript
// One value — all four sides
padding: 20
margin: 10

// Two values — vertical, then horizontal
padding: [10, 24]

// Three values — top, horizontal, bottom
padding: [10, 24, 16]

// Four values — top, right, bottom, left
padding: [10, 24, 16, 8]
```

You can also set each side individually with `paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft`, and the matching `margin*` options.

## The layout lifecycle

When a block changes, the library does not recompute it immediately. It marks it dirty, and the next frame runs a fixed sequence.

```typescript
updateCords()
  → reset rotation to the cached value
  → apply the parent's child adjustment (if it has one)
  → updateCordinates()      // recompute x, y, width, height and the corners
  → updateChildsCordinate() // position this block's children
  → recompute the bounding box and the real measurements
  → copy the current options into the cache
```

Two consequences matter in practice.

**Positions are recomputed from the parent's layout.** If a child block has `position: 'relative'` with a `left` offset, that offset is applied on top of the position the parent assigned. If a child has no explicit position, the parent's layout algorithm decides where it goes.

**Reading a value right after writing it can give you the old value.** The write updates the option immediately, but the derived values — `boundingBox`, `realWidth`, the resolved corners — are only refreshed on the next frame.

> [!WARNING] Read after the frame, not before
>
> If you need to know a block's final size, read it after the next animation frame rather than immediately after setting `width`. In most code this does not matter, but in a layout callback it does.

## Units

Every size and position option accepts a number or a string with a unit.

| Unit  | Resolves against                                |
| ----- | ----------------------------------------------- |
| `px`  | Absolute pixels                                 |
| `%`   | The parent block's width or height              |
| `vw`  | The canvas width (width-related options only)   |
| `vh`  | The canvas height (height-related options only) |
| `rem` | The canvas width                                |
| `em`  | The parent block's size                         |
| `cm`  | 37.8 pixels                                     |
| `mm`  | 3.78 pixels                                     |
| `q`   | A quarter millimetre                            |
| `in`  | 96.08 pixels                                    |
| `pc`  | 16.01 pixels                                    |
| `pt`  | 1.33 pixels                                     |

```typescript
const card = new RectangleBlock({
  width: '50%',      // half the parent's width
  height: '10rem',   // 10x the canvas width, in pixels
  padding: '2em',   // relative to the parent block's size
});
```

> [!NOTE] Percentages are relative to the parent, not the canvas
>
> A block with no parent resolves percentages against the canvas. A block inside a card resolves them against the card. This is the CSS rule, and it makes nested layouts work the way you expect.

`rem` resolving against the canvas width is unusual, and is worth checking before you rely on it — the library's own `fromRem` helper multiplies by the canvas width.

## Colours

Colour options accept a named colour, a hex value, or an `hsl()` function.

```typescript
const block = new RectangleBlock({
  backgroundColor: 'red',                    // named
  borderColor: '#3b82f6',                    // hex
  borderWidth: 2,
});

const other = new RectangleBlock({
  backgroundColor: 'hsl(240, 80%, 60%)',     // hsl
});
```

The seventeen CSS named colours are supported: `black`, `silver`, `gray`, `white`, `maroon`, `red`, `purple`, `fuchsia`, `green`, `lime`, `olive`, `yellow`, `navy`, `blue`, `teal`, and `aqua`.

Hex values may be 3, 4, 6, or 8 digits — `#f00`, `#f008`, `#ff0000`, and `#ff000088` all work.

Internally, every colour is normalised to an `rgba(...)` string. That matters for animation: the keyframe engine interpolates colours numerically, so it needs them in a comparable form.

## Next steps

- [Nesting](/docs/nesting/) — how blocks become a tree.
- [Positioning](/docs/positioning/) — the four placement modes.
- [Transformation](/docs/transform/) — dragging, resizing, and rotating.
