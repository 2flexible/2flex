---
id: overview
title: Overview
description: What 2flex is, how its Canvas and Block model works, and what you can build with it.
---

2flex is an infinite canvas library for JavaScript and TypeScript. You describe a scene as a tree of **blocks**, each one positioned and styled with CSS-like options, and the library renders that tree onto a canvas element you own.

There is no scene graph format to learn, no component runtime, and no framework binding. You construct a `Canvas`, construct blocks, and add them.

```typescript title="scene.ts"


const canvas = new Canvas('scene', 800, 600);

const card = new RectangleBlock({
  x: 40,
  y: 40,
  width: 240,
  height: 140,
  backgroundColor: '#3b82f6',
  borderRadius: 16,
});

const label = new TextBlock({
  text: 'Hello 2flex',
  fontSize: 20,
  color: '#ffffff',
});

card.addChild(label);
canvas.add(card);
```

## The two concepts

Everything in the library reduces to two ideas.

**A `Canvas`** is the surface. It owns the viewport, the scene, the render loop, the undo history, and the global input handling. One canvas is bound to one `<canvas>` element.

**A `Block`** is a piece of content on that surface. A block has a size, a position, a set of options, and — optionally — children. A `RectangleBlock` with a `TextBlock` inside it is a card.

```
Canvas
└── RectangleBlock          ← the card
    └── TextBlock           ← the label
```

That is the whole model. Everything else in this documentation is detail on those two things.

## What a block gives you for free

Every block — including blocks you write yourself — inherits the same feature set. You turn these on with options rather than writing event handlers by hand.

| Capability         | What it gives you                                                    |
| ------------------ | -------------------------------------------------------------------- |
| **Transformation** | Drag, resize, rotate, and flip, with per-handle control              |
| **Layout**         | Flexbox and Grid containers, padding, margin, min/max sizing         |
| **Positioning**    | `relative`, `absolute`, `fixed`, and `sticky` placement              |
| **Events**         | Mouse and keyboard handlers with shape-accurate hit testing          |
| **Animation**      | A keyframe engine with easing, direction, iteration, and compositing |
| **Clipping**       | Children are clipped to their parent's bounds                        |
| **Overflow**       | Scrollable regions with automatic scrollbars                         |
| **Serialization**  | The whole scene round-trips through JSON                             |

## The blocks that ship with the package

| Block            | What it is                                                            |
| ---------------- | --------------------------------------------------------------------- |
| `Block`          | A container with no visuals of its own — the base for everything else |
| `LayoutBlock`    | A Flexbox or Grid container that arranges its children                |
| `ShapeBlock`     | Direct access to the Canvas 2D context, for custom drawing            |
| `RectangleBlock` | A rectangle with a fill, a border, and per-corner radii               |
| `CircleBlock`    | A circle, an ellipse, an arc, or a pie slice                          |
| `LineBlock`      | A straight or cubic Bézier line with editable control points          |
| `TextBlock`      | Editable, wrappable text with full font control                       |
| `ImageBlock`     | An image with object-fit, clipping, and tiling                        |
| `VideoBlock`     | Video playback drawn onto the canvas                                  |

`RectangleBlock`, `CircleBlock`, `TextBlock`, `ImageBlock`, and `VideoBlock` all extend `ShapeBlock`, which extends `Block`. So a rectangle is also a layout container, an event target, and an animatable node.

> [!NOTE] One base class
>
> Every block descends from `Block`. When you write your own block type, extend `Block` and you inherit all of the above — see [Custom blocks](/docs/custom-blocks/).

## How rendering works

The library renders on a fixed frame budget (`fps`, 60 by default) and batches work into a queue. When you change a block's options with `set()`, the block is marked dirty and re-rendered on the next frame. When you add or remove blocks, the scene graph and the spatial index are rebuilt.

The surface is divided into square **tiles** (`tileSize`, 256px by default). Each tile caches its own rendered bitmap, and only dirty tiles are repainted. This is what keeps large scenes responsive — a block far off-screen costs nothing until it comes into view.

You do not need to manage any of this. But it does explain one behaviour worth knowing: **the scene is redrawn asynchronously**. If you mutate a block and immediately read a computed value, you may read the previous frame's result. See [Coordinates](/docs/coordinates/) for how the block lifecycle works.

> [!WARNING] Mutations are queued, not immediate
>
> `canvas.add(block)`, `canvas.remove(block)`, and `block.set({...})` all schedule work for the next frame. The scene graph updates on that frame, not on the line you wrote it. Writing an option directly — `block.width(200)` — updates the value but does not schedule a redraw.

## What 2flex is good at

- **Whiteboards and diagram tools** — infinite surface, shapes, connectors, editable text.
- **Node editors** — nested blocks, drag to rearrange, live layout.
- **Annotators and image editors** — media blocks with clipping, selection handles, transforms.
- **Interactive maps and floor plans** — scaled content with pan and zoom.

## What it is not

2flex draws to a 2D canvas. There is no DOM output, no accessibility tree, and no text selection by the browser. If you need selectable, screen-reader-accessible text, build that part with regular HTML positioned over the canvas.

The layout engine is also not a browser engine. Flexbox is supported with the common subset, and Grid supports fixed and `auto` tracks, but there is no `subgrid`, no `fit-content`, and no intrinsic sizing. Text does not reflow its container the way HTML does.

> [!NOTE] Framework agnostic
>
> 2flex manipulates the DOM and a canvas element directly. It works the same in plain JavaScript, React, Vue, Svelte, or anything else — you just need the `<canvas>` element to exist when you construct the `Canvas`.

## Where to go next

- [Installation](/docs/install/) — add the package and confirm it works.
- [Your first scene](/docs/first-scene/) — build something real, step by step.
- [Coordinates](/docs/coordinates/) — understand the geometry model before you build on it.
