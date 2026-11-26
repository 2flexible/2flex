---
id: chrome
title: Chrome
description: Style the selection handles, control overflow and scrolling, and manage the extra blocks the library draws for you.
---

The library draws a few things on your behalf — the selection outline, the corner handles, and the scrollbars for overflow regions. This page covers how to style and control them.

## Selection handles

Set `hotLines: true` to draw the selection outline and corner handles over a selected block.

```typescript
const block = new RectangleBlock({
  width: 200,
  height: 120,
  selectable: true,
  resizable: true,
  hotLines: true,
});
```

The handles only appear while the block is selected. When it is not, nothing is drawn.

> [!NOTE] hotLines creates a separate block
>
> The outline is drawn by a hidden helper block that the library adds to the canvas. It tracks the block's geometry and rotation, and it is given a z-index above the block's own children so the handles are never covered.

### Styling the outline

| Option                     | Type                 | Default   | What it does                     |
| -------------------------- | -------------------- | --------- | -------------------------------- |
| `hotLineStrokeWidth`       | `number`             | `2.5`     | The width of the outline         |
| `hotLineStrokeColor`       | `string`             | `'blue'`  | The colour of the outline        |
| `hotCornerSize`            | `number`             | `10`      | The size of the corner handles   |
| `hotCornerRadius`          | `number \| number[]` | `[0]`     | The corner radius of the handles |
| `hotCornerBackgroundColor` | `string`             | `'white'` | The fill of the corner handles   |
| `hotCornerStrokeWidth`     | `number`             | `2.5`     | The border width of the handles  |
| `hotCornerStrokeColor`     | `string`             | `'blue'`  | The border colour of the handles |

```typescript
const block = new RectangleBlock({
  width: 200,
  height: 120,
  selectable: true,
  resizable: true,
  hotLines: true,

  hotLineStrokeColor: '#2563eb',
  hotLineStrokeWidth: 2,
  hotCornerSize: 12,
  hotCornerRadius: 3,
  hotCornerBackgroundColor: '#ffffff',
  hotCornerStrokeColor: '#2563eb',
});
```

> [!NOTE] Colours are normalised
>
> Like every other colour option, these accept a named colour, a hex value, or an `hsl()` function, and are converted to `rgba(...)` internally.

## Handle hit areas

The corners you grab are larger than the corner handles you see. Two options control the invisible hit area around them.

| Option                 | Type     | Default | What it does                                  |
| ---------------------- | -------- | ------- | --------------------------------------------- |
| `hotResizableAreaSize` | `number` | `15`    | The size of the resize hit area               |
| `hotResizableAreaGap`  | `number` | `0`     | How far the hit area extends beyond the block |
| `hotRotatableAreaSize` | `number` | `15`    | The size of the rotate hit area               |
| `hotRotatableAreaGap`  | `number` | `0`     | How far the hit area extends beyond the block |

```typescript
const block = new RectangleBlock({
  selectable: true,
  resizable: true,
  rotatable: true,
  hotLines: true,

  hotResizableAreaSize: 20,   // easier to grab
  hotResizableAreaGap: 4,
});
```

> [!NOTE] A larger hit area is easier to use but grabs more
>
> The resize hit areas extend around the edges and corners of the block. Making them larger makes the handles easier to grab, but they also take priority over content near the edge of the block.

## Overflow

The `overflow` option controls what happens to a block's children when they extend beyond its bounds.

| Value                 | Behaviour                                             |
| --------------------- | ----------------------------------------------------- |
| `'visible'` (default) | Children are drawn outside the block's bounds         |
| `'hidden'`            | Children outside the bounds are clipped and not drawn |
| `'scroll'`            | Children are clipped and a scrollbar is added         |
| `'auto'`              | A scrollbar appears only when the content overflows   |

`overflowX` and `overflowY` set the two axes independently.

```typescript
const panel = new LayoutBlock({
  layout: 'flex',
  flexDirection: 'column',
  width: 300,
  height: 200,
  overflow: 'auto',
  gap: 8,
});

for (let i = 0; i < 20; i++) {
  panel.addChild(
    new RectangleBlock({ width: 280, height: 32, backgroundColor: '#1e293b' }),
  );
}
```

> [!NOTE] Clipping follows the block's clip shape
>
> `RectangleBlock` clips its children to a rectangle, `CircleBlock` clips to its circle or arc, and every other block clips to its bounding box. The rectangle's clip is not rounded, even when `borderRadius` is set.

### Scrollbars

`'scroll'` and `'auto'` add scrollbars to the block. The scrollbars are separate blocks that the library manages — you do not add them yourself.

`'scroll'` always shows the scrollbar. `'auto'` shows it only when the content is actually larger than the block.

```typescript
const panel = new LayoutBlock({
  width: 300,
  height: 200,
  overflowX: 'scroll',
  overflowY: 'auto',
});
```

The user drags the scrollbar with the mouse. The scroll position is stored in `overflowPositionX` and `overflowPositionY`.

```typescript
panel.overflowPositionX();   // the current horizontal scroll offset
panel.overflowPositionY();
```

> [!WARNING] The scrollbars are fixed to the viewport
>
> The scrollbar blocks are created with `position: 'fixed'`, so they stay in the same screen position while the block itself scrolls underneath them.

### Sticky children

A `position: 'sticky'` child inside a scrollable parent sticks to the edge when you scroll.

```typescript
const panel = new LayoutBlock({
  layout: 'flex',
  flexDirection: 'column',
  width: 300,
  height: 200,
  overflowY: 'auto',
});

const header = new RectangleBlock({
  position: 'sticky',
  top: 0,
  width: 300,
  height: 40,
  backgroundColor: '#1e293b',
});

panel.addChild(header);
```

## The `hidden` option

`hidden` removes a block from rendering without removing it from the scene.

```typescript
block.hidden(true);
block.hidden(false);
```

A hidden block's children are hidden too.

## The `name` option

`name` labels a block. It has no visual effect, but it makes the scene searchable and readable in the exported JSON.

```typescript
const avatar = new ImageBlock({
  name: 'avatar',
  source: '/avatar.png',
});
```

## The `onRender` option

`onRender` is called every time the block is drawn. It receives the block.

```typescript
const block = new RectangleBlock({
  width: 100,
  height: 100,
  onRender: (block) => {
    // called before every repaint
  },
});
```

> [!WARNING] onRender runs on every frame
>
> This is a hot path. Keep the work in it minimal, and avoid changing options there — a write inside `onRender` can trigger another render.

## Next steps

- [Transform](/docs/transform/) — what the handles actually do.
- [Custom blocks](/docs/custom-blocks/) — draw your own chrome.
- [Animation](/docs/animation/) — animate the properties you can style.
