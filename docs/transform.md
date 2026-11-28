---
id: transform
title: Transformation
description: Drag, resize, rotate, and flip blocks — enabling each interaction, restricting it, and reacting to changes.
---

Every block can be dragged, resized, and rotated. None of it happens unless you ask for it — each interaction has its own opt-in flag.

```typescript
const block = new RectangleBlock({
  width: 200,
  height: 120,

  selectable: true,
  draggable: true,
  resizable: true,
  rotatable: true,
});
```

## Selection comes first

`selectable` is the foundation. It marks a block as the one under the pointer, and it is what the other interactions check before they start.

```typescript
const block = new RectangleBlock({
  selectable: true,
});
```

> [!WARNING] draggable requires selectable
>
> The drag handler checks `block.selectable()` when the pointer goes down. A block with `draggable: true` but `selectable: false` will not move. Set both.

## Dragging

`draggable` lets the user move a block with the pointer.

```typescript
const block = new RectangleBlock({
  selectable: true,
  draggable: true,

  onDraggable: (block) => {
    console.log(block.x(), block.y());
  },
});
```

`onDraggable` fires on every pointer move while the drag is in progress.

### Locking an axis

`draggableX` and `draggableY` let you lock movement to one axis. Both default to `true`.

```typescript
const slider = new RectangleBlock({
  selectable: true,
  draggable: true,
  draggableY: false,   // horizontal only
});
```

## Resizing

`resizable` draws eight handles around the block — four corners and four edges.

```typescript
const block = new RectangleBlock({
  width: 200,
  height: 120,
  minWidth: 80,
  maxWidth: 400,

  selectable: true,
  resizable: true,

  onResizable: (block) => {
    console.log(block.width(), block.height());
  },
});
```

### Choosing which handles appear

Each handle can be turned off individually.

| Option                 | Handle              |
| ---------------------- | ------------------- |
| `resizableTopLeft`     | Top-left corner     |
| `resizableTop`         | Top edge            |
| `resizableTopRight`    | Top-right corner    |
| `resizableRight`       | Right edge          |
| `resizableBottomRight` | Bottom-right corner |
| `resizableBottom`      | Bottom edge         |
| `resizableBottomLeft`  | Bottom-left corner  |
| `resizableLeft`        | Left edge           |

```typescript
const block = new RectangleBlock({
  selectable: true,
  resizable: true,
  resizableTop: false,
  resizableLeft: false,
  resizableTopLeft: false,
  resizableBottomLeft: false,
  // only the right and bottom handles remain
});
```

> [!NOTE] All handles are on by default
>
> Setting `resizable: true` enables every handle. The per-handle options let you turn individual ones off — there is no separate option to turn one on when `resizable` is false.

### Resizing a flipped block

On a horizontally flipped block, dragging a horizontal handle changes the width in the opposite direction. `horizontalFlipResize` and `verticalFlipResize` control whether the minimum size constraint still applies on that axis.

```typescript
const block = new RectangleBlock({
  selectable: true,
  resizable: true,
  horizontalFlipResize: true,
});
```

> [!NOTE] Both options default to off
>
> When `horizontalFlipResize` is off — the default — a horizontal resize on a flipped block is refused if it would take the width below `minWidth`. Turning it on lifts that restriction on that axis.

## Rotating

`rotatable` adds four rotation handles, one at each corner.

```typescript
const block = new RectangleBlock({
  width: 160,
  height: 160,
  selectable: true,
  rotatable: true,

  onRotatable: (block) => {
    console.log(block.rotate());
  },
});
```

### Choosing which handles appear

| Option                 | Handle              |
| ---------------------- | ------------------- |
| `rotatableTopLeft`     | Top-left corner     |
| `rotatableTopRight`    | Top-right corner    |
| `rotatableBottomLeft`  | Bottom-left corner  |
| `rotatableBottomRight` | Bottom-right corner |

```typescript
const block = new RectangleBlock({
  selectable: true,
  rotatable: true,
  rotatableBottomLeft: false,
  rotatableBottomRight: false,
});
```

### The rotation centre

`rotationCenter` decides the point the block turns around.

| Value                | Behaviour                                    |
| -------------------- | -------------------------------------------- |
| `'parent'` (default) | The block rotates around its parent's centre |
| `'self'`             | The block rotates around its own centre      |

```typescript
// Spins in place
const spinner = new RectangleBlock({
  width: 100,
  height: 100,
  selectable: true,
  rotatable: true,
  rotationCenter: 'self',
});
```

> [!NOTE] The default is 'parent'
>
> With the default, a child inside a rotating parent rotates around the parent's centre. That is usually what you want for grouped content — a card and its contents turn together. Set `'self'` for a block that should spin in place.

You can also set the centre explicitly with `rotationCenterX` and `rotationCenterY`. When `rotationCenter` is `'self'`, the library tracks the centre as the block moves.

## Flipping

`horizontalFlip` and `verticalFlip` mirror a block. They are booleans that the library maintains as the block's geometry changes — you rarely set them directly.

```typescript
const mirrored = new RectangleBlock({
  width: 120,
  height: 80,
  horizontalFlip: true,
});
```

> [!NOTE] Flips are derived, not stored
>
> The library recomputes `horizontalFlip` and `verticalFlip` from the corner positions on every layout pass. Setting them directly is overwritten. To flip a block persistently, set a negative `width` or `height` instead.

## Combining interactions

The three interactions can be combined freely, and the library arbitrates between them — dragging does not start while a resize handle is being grabbed, and rotating does not start while dragging.

```typescript
const node = new RectangleBlock({
  width: 180,
  height: 110,
  backgroundColor: '#8b5cf6',

  selectable: true,
  draggable: true,
  resizable: true,
  rotatable: true,
  hotLines: true,
});
```

> [!NOTE] Show the handles
>
> Set `hotLines: true` to draw the selection outline and the corner handles. Without it, the interactions work but the user has nothing to grab. See [Chrome](/docs/chrome/).

## Reading the result

After an interaction, the block's options hold the new values.

```typescript
console.log(block.x(), block.y());
console.log(block.width(), block.height());
console.log(block.rotate());       // radians
```

The corners are also updated, so `boundingBox` reflects the rotated shape.

## Recording the change

Dragging, resizing, and rotating each record an undo step when they finish. You can add your own by writing to the options inside a callback.

```typescript
onDraggable: (block) => {
  // Called on every move — this would record many steps
}
```

> [!WARNING] Record once, at the end
>
> The library already records the interaction as a single undo step when the pointer is released. If you call `block.set({...})` inside `onDraggable`, you will add an undo step per pointer move and flood the history. Let the built-in recording handle it.

## Next steps

- [Events](/docs/events/) — attach your own handlers.
- [Chrome](/docs/chrome/) — style the selection handles.
- [Animation](/docs/animation/) — move blocks without the user.
