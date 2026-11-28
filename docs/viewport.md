---
id: viewport
title: Viewport
description: Configure the canvas viewport — pan, zoom, the input model, and reading the current view.
---

The `Canvas` owns the viewport. This page covers how it is configured, how the user moves around, and how to read or change the view from code.

```typescript
const canvas = new Canvas('scene', 900, 600, {
  zoomType: 'point',
  zoomSpeed: 1.3,
  moveSpeed: 120,
  positionX: -200,
  positionY: -150,
});
```

## Options

| Option             | Type                  | Default    | What it does                                      |
| ------------------ | --------------------- | ---------- | ------------------------------------------------- |
| `zoomSpeed`        | `number`              | `1.2`      | The multiplier applied per zoom-in step           |
| `zoomInvSpeed`     | `number`              | `0.8`      | The multiplier applied per zoom-out step          |
| `moveSpeed`        | `number`              | `100`      | How far the viewport scrolls per wheel notch      |
| `zoomType`         | `'center' \| 'point'` | `'center'` | Whether zoom centres on the canvas or the pointer |
| `keyboardMovement` | `boolean`             | `true`     | Enables wheel scrolling                           |
| `mouseMovement`    | `boolean`             | `true`     | Enables space-and-drag panning                    |
| `history`          | `boolean`             | `true`     | Enables the undo and redo stack                   |
| `historySize`      | `number`              | `100`      | The maximum number of undo steps kept             |
| `positionX`        | `number`              | `0`        | The initial horizontal viewport offset            |
| `positionY`        | `number`              | `0`        | The initial vertical viewport offset              |
| `positionZ`        | `number`              | `1`        | The initial zoom level                            |
| `fps`              | `number`              | `60`       | The target frame rate for the render loop         |
| `tileSize`         | `number`              | `256`      | The size of the render tiles, in pixels           |

The options object also accepts arbitrary CSS properties, which are applied to the `<canvas>` element.

> [!NOTE] positionZ is the zoom level
>
> `positionZ` sets the starting zoom. A value of `2` means everything is drawn at twice its size, and the canvas shows half as much of the scene.

## How the user moves around

### Panning

Hold <kbd>Space</kbd> and drag with the left mouse button. The cursor changes to `grab` while <kbd>Space</kbd> is held and `grabbing` while dragging.

This is the standard convention from design tools, and it leaves the plain mouse button free for interacting with your content.

### Zooming

Hold <kbd>Ctrl</kbd> and scroll the wheel. Each step multiplies the zoom by `zoomSpeed` or `zoomInvSpeed`.

`zoomType` decides what stays put:

| Value                | Behaviour                               |
| -------------------- | --------------------------------------- |
| `'center'` (default) | The centre of the canvas stays fixed    |
| `'point'`            | The point under the pointer stays fixed |

> [!NOTE] Use 'point' for map-like interfaces
>
> With `'center'`, zooming pulls the scene towards the middle of the viewport, which feels odd when you are inspecting a specific detail. With `'point'`, whatever is under the cursor stays under the cursor.

### Scrolling

Scroll the wheel without <kbd>Ctrl</kbd> to move the viewport vertically. Hold <kbd>Shift</kbd> to move it horizontally.

The scroll distance per notch is `moveSpeed`.

> [!NOTE] Scrollable regions take priority
>
> If the pointer is over a block with a scrollable overflow, the wheel scrolls that block instead of the viewport. This is how you scroll a panel that lives inside a pannable canvas.

> [!WARNING] The wheel only scrolls the canvas when it has focus
>
> Like the keyboard, the wheel is only handled when the canvas has DOM focus. On a page with other scrollable content, the canvas does not hijack the scroll wheel until the user has clicked into it.

## The view transform

`canvas.view` holds the current transform.

```typescript
const { tx, ty, scale } = canvas.view;

tx;     // the horizontal offset, in canvas pixels
ty;     // the vertical offset
scale;  // the zoom level
```

A canvas coordinate maps to a screen position like this:

```typescript
screenX = worldX * scale + tx;
screenY = worldY * scale + ty;
```

Changing the view directly works, but it does not trigger a re-render of the blocks that are pinned to the viewport.

> [!WARNING] Fixed and sticky blocks need a re-render
>
> A block with `position: 'fixed'` is positioned relative to the viewport, so it has to be recomputed when the view changes. If you set `canvas.view` directly, call `canvas.demandInvoke(block)` on the affected blocks to refresh them.

## Reading the current position

`currentPosition` returns the viewport offset and zoom in a single object.

```typescript
const { x, y, z } = canvas.currentPosition;
// x is tx, y is ty, z is scale
```

## Converting a pointer position

`getCursorPosition` converts a mouse or wheel event into canvas coordinates — the inverse of the screen transform.

```typescript
canvas.addEventListener('mousemove', (event) => {
  const { x, y } = canvas.getCursorPosition(event);
  console.log('canvas coordinates', x, y);
});
```

> [!NOTE] getCursorPosition accounts for the scroll offset
>
> It uses the canvas element's bounding rectangle, so the position is correct even when the page itself is scrolled or the canvas is offset by its layout.

## Moving the view from code

The internal movement helpers are not part of the public API, but you can set the view directly and refresh the affected blocks.

```typescript
// Centre the view on a block
function focusOn(block) {
  const scale = canvas.view.scale;
  const tx = canvas.width / 2 - (block.x() + block.width() / 2) * scale;
  const ty = canvas.height / 2 - (block.y() + block.height() / 2) * scale;

  canvas.view.tx = tx;
  canvas.view.ty = ty;

  // Refresh anything pinned to the viewport
  for (const b of canvas.find({ position: 'fixed' })) {
    canvas.demandInvoke(b);
  }
}
```

## Cursors

`changeCursor` sets the cursor on the canvas element.

```typescript
canvas.changeCursor('grab');
canvas.resetCursor();   // back to 'auto'
```

For a cursor that only applies while the pointer is over a particular block, register it against the block's id.

```typescript
canvas.registerCursor(block.nodeId!, 'pointer');
canvas.unregisterCursor(block.nodeId!, 'pointer');
```

The canvas keeps a registry of cursors and applies the one belonging to the block with the highest z-index, so the cursor reflects what is actually under the pointer.

## Clearing the canvas

`clearRect` wipes the pixels from the canvas element.

```typescript
canvas.clearRect();
```

> [!WARNING] This is not a scene reset
>
> `clearRect` clears the rendered pixels. It does not remove the blocks from the scene, and the next frame redraws them. To empty the scene, remove the blocks instead.

## The undo stack

With `history` enabled, the canvas records changes and lets you step through them.

```typescript
canvas.undo();
canvas.redo();
```

The keyboard shortcuts are bound while the canvas is focused: <kbd>Ctrl</kbd>+<kbd>Z</kbd> undoes and <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd> redoes.

> [!NOTE] What gets recorded
>
> Setting options with `block.set({...})` records a step, as do adding and removing child blocks, and finishing a drag, resize, or rotation. Writing an option directly — `block.width(200)` — records nothing and does not schedule a redraw.

## Next steps

- [Chrome](/docs/chrome/) — selection handles, overflow, and scrollbars.
- [Transform](/docs/transform/) — the interactions on blocks.
- [Serialization](/docs/api-index/) — saving and loading the scene.
