---
id: canvas
title: Canvas
description: Configure the canvas — pan, zoom, keyboard and mouse movement, history, and the initial viewport.
---

The `Canvas` owns the viewport, the scene, and the interaction settings that apply to everything on it.

```javascript


const canvas = new Canvas('my-canvas', 800, 400);
```

The first argument is the `id` of the `<canvas>` element, the second and third are its width and height in pixels.

## Options

The fourth argument is an optional options object.

```javascript
const canvas = new Canvas('my-canvas', 800, 400, {
  zoomSpeed: 1.2,
  zoomInvSpeed: 0.8,
  moveSpeed: 100,
  zoomType: 'center',
  keyboardMovement: true,
  mouseMovement: true,
  history: true,
  historySize: 100,
  positionX: 0,
  positionY: 0,
  positionZ: 1,
  fps: 60,
  tileSize: 256,
});
```

| Option             | Type                  | Default    | Description                                      |
| ------------------ | --------------------- | ---------- | ------------------------------------------------ |
| `zoomSpeed`        | `number`              | `1.2`      | Zoom multiplier per wheel step                   |
| `zoomInvSpeed`     | `number`              | `0.8`      | Zoom multiplier per inverse step                 |
| `moveSpeed`        | `number`              | `100`      | Pixels moved per keyboard step                   |
| `zoomType`         | `"center" \| "point"` | `"center"` | Whether zoom centres on the canvas or the cursor |
| `keyboardMovement` | `boolean`             | `true`     | Arrow keys pan the viewport                      |
| `mouseMovement`    | `boolean`             | `true`     | Mouse drag pans the viewport                     |
| `history`          | `boolean`             | `true`     | Enables undo and redo                            |
| `historySize`      | `number`              | `100`      | Maximum number of history entries                |
| `positionX`        | `number`              | `0`        | Initial viewport x                               |
| `positionY`        | `number`              | `0`        | Initial viewport y                               |
| `positionZ`        | `number`              | `1`        | Initial zoom level                               |
| `fps`              | `number`              | `60`       | Target frame rate                                |
| `tileSize`         | `number`              | `256`      | Size of the render tiles in pixels               |

> [!NOTE]
>
> The options object also accepts arbitrary CSS properties, which are applied to the underlying canvas element.

## Adding and removing blocks

```javascript
canvas.add(blockA, blockB);
canvas.remove(blockA);
```

Children added to a parent block do not need to be added to the canvas separately.

## Finding blocks

`find` queries the scene and returns every matching block.

```javascript
const matches = canvas.find({ name: 'my-block' });
```

## Undo and redo

With `history` enabled, block mutations recorded via `set` can be reverted.

```javascript
canvas.undo();
canvas.redo();
```

The history size is capped by `historySize`.

## Serialization

`export` produces a JSON string describing the scene, and `load` restores it.

```javascript
const payload = canvas.export();

canvas.load(payload);
```

> [!WARNING]
>
> `load` replaces the current scene. Custom block classes must be registered first with `registerBlocks` so they can be reconstructed.

## Registering custom blocks

```javascript


canvas.registerBlocks(MyBlock);
```

## Cursor control

```javascript
canvas.changeCursor('grab');
canvas.resetCursor();
```

Per-block cursors can be registered and unregistered with a node id.

```javascript
canvas.registerCursor(nodeId, 'pointer');
canvas.unregisterCursor(nodeId);
```

## Reference

- [Canvas API](/api/canvas)
