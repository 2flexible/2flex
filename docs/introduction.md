---
id: introduction
title: Introduction
description: An overview of 2flex, the block-based infinite canvas library for JavaScript and TypeScript.
---

2flex is a canvas library built on a **block philosophy**. Everything you draw is a block, and every block is configured with familiar CSS-like options.

If you know CSS, most of the customization will look familiar — a block behaves much like styling a `<div>`, except the coordinate space is an infinite canvas instead of a document.

> [!NOTE] One class to rule them all
>
> Every block in the library inherits from the `Block` class. If you want your own block type, extend `Block` and you inherit every feature it has — see [Custom blocks](/docs/custom-block/).

## The mental model

There are only two concepts you need to start:

1. A **`Canvas`** — the surface you render onto. It owns the viewport, handles pan and zoom, and holds the scene.
2. A **`Block`** — a piece of content living on that canvas. Blocks can be nested inside other blocks.

```
Canvas
└── Block (a card)
    ├── RectangleBlock (background)
    └── TextBlock (label)
```

## Your first canvas

A canvas is constructed with an id, a width, and a height. The id is a normal HTML id — it must be unique per canvas, otherwise the canvases overlap.

```javascript


const canvas = new Canvas('my-canvas', 800, 400);
```

Blocks are positioned relative to the top-left of the canvas. When you pan the canvas, the blocks move with it — their `x` and `y` are canvas coordinates, not screen coordinates.

```javascript
const block = new RectangleBlock({
  x: 10,
  y: 30,
  width: 100,
  height: 100,
  backgroundColor: 'blue',
});
```

Finally, add the block to the canvas and it renders.

```javascript
canvas.add(block);
```

> [!WARNING] Options are optional
>
> Every option has a default. If you omit `width` and `height` they default to `0` and the block renders nothing visible.

## What a block gives you

Every block ships with interaction and layout features built in — you enable them with options rather than wiring up event listeners yourself:

- **Transformations** — drag, resize, rotate, and flip
- **Layout** — Flexbox and Grid containers, padding, margin, min/max sizing
- **Positioning** — relative, absolute, fixed, and sticky
- **Events** — mouse and keyboard handlers with hit testing
- **Animation** — a keyframe engine with easing, direction, and compositing

[Learn more about blocks →](/docs/the-block/)

## The block family

The core package ships the blocks you will reach for most:

| Block            | Purpose                                                    |
| ---------------- | ---------------------------------------------------------- |
| `Block`          | Generic container — grouping, custom behaviour, no visuals |
| `LayoutBlock`    | Flexbox or Grid container for arranging children           |
| `ShapeBlock`     | Canvas-2D style drawing with fills, strokes, and gradients |
| `RectangleBlock` | Solid rectangle with border and radius options             |
| `CircleBlock`    | Circle, arc, and pie shapes via start/end angles           |
| `LineBlock`      | Straight and cubic Bézier lines with control points        |
| `TextBlock`      | Editable, wrappable text with font control                 |
| `ImageBlock`     | Images with clipping, object-fit, and repetition           |
| `VideoBlock`     | Video playback on the canvas                               |

## Custom shapes

`ShapeBlock` gives you direct access to the native 2D context, so you can draw anything the Canvas API supports while keeping all the block features.

```javascript
const shape = new ShapeBlock({ x: 0, y: 0, width: 100, height: 100 });

shape.draw((context) => {
  context.rect(0, 0, 100, 40);
  context.fillStyle = 'blue';
  context.fill();
  context.stroke();
});
```

[Learn more about shapes →](/docs/custom-shape/)

## Next steps

- [Installation](/docs/install/) — add 2flex to your project
- [The Block](/docs/the-block/) — the full feature set of a block
- [API reference](/api/canvas) — every class, option, and utility
