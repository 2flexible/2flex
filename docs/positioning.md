---
id: positioning
title: Positioning
description: Place blocks with relative, absolute, fixed, and sticky positioning, and constrain their size.
---

The `position` option decides how a block finds its place. There are four modes, and they behave differently enough that it is worth knowing each one.

```typescript
const block = new RectangleBlock({
  position: 'absolute',
  left: 100,
  top: 50,
  width: 80,
  height: 40,
});
```

## The four modes

| Value                  | Resolves against               | Moves when the viewport pans |
| ---------------------- | ------------------------------ | ---------------------------- |
| `'relative'` (default) | Its parent block's content box | Yes                          |
| `'absolute'`           | Its parent block's content box | Yes                          |
| `'fixed'`              | The canvas viewport            | No                           |
| `'sticky'`             | Its parent block's content box | No, until it reaches an edge |

### relative

The default. The block is placed in its parent's normal flow, and the `top`, `right`, `bottom`, and `left` options offset it from there.

```typescript
const label = new TextBlock({
  text: 'Offset',
  position: 'relative',
  left: 20,    // 20px to the right of where it would have been
  top: -5,     // 5px up
});
```

> [!NOTE] relative offsets do not affect siblings
>
> A `relative` block's offset moves it visually but leaves its space in the flow alone, exactly as CSS does. The siblings do not move.

### absolute

The block is taken out of the flow and positioned relative to its parent's content box. It does not affect the position of its siblings.

```typescript
const badge = new RectangleBlock({
  position: 'absolute',
  right: 8,
  bottom: 8,
  width: 24,
  height: 24,
});
```

Because absolute positioning is relative to the parent, an absolute child inside a `LayoutBlock` is skipped by the layout algorithm. See [Layout](/docs/layout/).

### fixed

The block is positioned relative to the canvas viewport and does **not** move when the canvas is panned or zoomed. This is how you pin a toolbar or a legend to the screen.

```typescript
const toolbar = new RectangleBlock({
  position: 'fixed',
  left: 12,
  top: 12,
  width: 200,
  height: 40,
});
```

> [!WARNING] fixed is ignored for children
>
> The fixed positioning calculation only runs for a block with no parent block. A child with `position: 'fixed'` is treated like a `relative` block, because its offset would otherwise be meaningless inside a parent that moves.

### sticky

A sticky block behaves like a relative block until it would scroll out of view, at which point it sticks to the edge.

```typescript
const header = new RectangleBlock({
  position: 'sticky',
  top: 0,
  width: 400,
  height: 48,
});
```

> [!NOTE] sticky needs a scrollable parent
>
> Sticky positioning only takes effect inside a parent that has `overflow` set to `'scroll'` or `'auto'`. In a plain container there is nothing to scroll, so the block stays where it was placed.

## Offsets

The four offset options are `top`, `right`, `bottom`, and `left`. Each accepts a number or a string with a unit.

```typescript
const block = new RectangleBlock({
  left: 40,
  top: '10%',
  right: '2rem',
});
```

Which offsets are honoured depends on the position mode:

| Mode       | `top` / `bottom` | `left` / `right` |
| ---------- | ---------------- | ---------------- |
| `relative` | Yes              | Yes              |
| `absolute` | Yes              | Yes              |
| `fixed`    | Yes              | Yes              |
| `sticky`   | Yes              | Yes              |

For `absolute` and `fixed`, if both `left` and `right` are set, `left` wins. The same is true of `top` and `bottom`.

> [!NOTE] right and bottom are relative to the parent's size
>
> For an absolutely positioned block, `right: 20` means "20 pixels from the parent's right edge", not "20 pixels from the block's own width". The library resolves it against the parent's dimensions.

## Sizing constraints

Four options constrain a block's size.

| Option      | Effect                                      |
| ----------- | ------------------------------------------- |
| `minWidth`  | The block will not shrink below this width  |
| `maxWidth`  | The block will not grow beyond this width   |
| `minHeight` | The block will not shrink below this height |
| `maxHeight` | The block will not grow beyond this height  |

```typescript
const resizable = new RectangleBlock({
  width: 100,
  height: 100,
  minWidth: 60,
  maxWidth: 300,
  minHeight: 60,
  maxHeight: 200,
  resizable: true,
});
```

> [!WARNING] maxWidth is measured against the initial size
>
> The maximum is applied against the width the block was created with, not against its current width. A block created at `width: 500` with `maxWidth: 300` is clamped to 300. But a block created at `width: 100` with `maxWidth: 300` is never clamped to 300 by the layout pass — it is bounded by its initial 100. When you resize interactively, the maximum is enforced against the live width instead.

## Which size wins

When you set `width` and `maxWidth` together, the constraint wins.

```typescript
const block = new RectangleBlock({ width: 500, maxWidth: 300 });

block.width();   // 300
```

The same applies to `minWidth` and `height` with `maxHeight` / `minHeight`.

## Positioning inside a layout container

A `LayoutBlock` places its children for you. If you want to override that placement for one child, take it out of the flow.

```typescript
const card = new LayoutBlock({
  layout: 'flex',
  flexDirection: 'row',
  padding: 16,
  gap: 12,
  width: 320,
  height: 120,
});

const body = new RectangleBlock({ width: 200, height: 40 });

// Placed by the flex layout
card.addChild(body);

// Positioned by hand, on top
const overlay = new RectangleBlock({
  position: 'absolute',
  right: 0,
  top: 0,
  width: 40,
  height: 40,
});
card.addChild(overlay);
```

## Hiding a block

`hidden` removes a block from rendering without removing it from the scene.

```typescript
block.hidden(true);    // not drawn
block.hidden(false);   // drawn again
```

> [!NOTE] hidden propagates to children
>
> A hidden parent's children are hidden too. The parent's `hidden` value is copied down to its children during the layout pass.

## Next steps

- [Layout](/docs/layout/) — arrange children with Flexbox and Grid.
- [Transformation](/docs/transform/) — drag, resize, and rotate.
- [Chrome](/docs/chrome/) — selection handles, overflow, and scrollbars.
