---
id: the-block
title: The Block
description: The core building unit of every 2flex scene — geometry, transformations, CSS-like layout options, events, and animation.
---

The block is the essential building unit of the canvas. Every shape, layout, and custom element you create is a block, and every block inherits the same feature set.

## Defining a block

A block takes an options object. Nothing is required — omitted options fall back to their defaults.

```javascript


const block = new Block({ x: 0, y: 0, width: 100, height: 100 });
```

Blocks are drawn from the top-left corner of the canvas. Once placed, they stay anchored to canvas coordinates as the viewport moves.

> [!NOTE]
>
> Most of the time you will use a concrete subclass like `RectangleBlock` or `TextBlock`. `Block` itself is a visual-free container, useful for grouping and for [custom blocks](/docs/custom-block/).

## Transformations

Dragging, resizing, rotating, and selecting are opt-in. Enable them per block.

```javascript
const block = new RectangleBlock({
  width: 100,
  height: 100,
  selectable: true,
  resizable: true,
  draggable: true,
  rotatable: true,
});
```

| Option       | Effect                                             |
| ------------ | -------------------------------------------------- |
| `selectable` | The block responds to mouse events and hit testing |
| `draggable`  | The block can be moved by dragging                 |
| `resizable`  | Hot corners and edges appear for resizing          |
| `rotatable`  | Hot corners appear for rotating                    |

[Transformation guide →](/docs/transform/)

## Responsiveness

Min and max sizes let a block adapt to its parent or the canvas.

```javascript
const block = new RectangleBlock({
  width: 100,
  height: 100,
  minWidth: 30,
  maxWidth: 60,
  resizable: true,
});
```

`minWidth`, `minHeight`, `maxWidth`, and `maxHeight` accept the same unit strings as other size options — `px`, `%`, `rem`, and friends.

[Responsibility guide →](/docs/layout/)

## CSS-like layout options

Blocks support padding, margin, position, overflow, and z-index.

```javascript
const parent = new RectangleBlock({
  width: 200,
  height: 140,
  padding: 40,
  margin: 20,
  position: 'relative',
  overflow: 'hidden',
  zIndex: 9,
});

const child = new RectangleBlock({ x: 10, y: 10, width: 100, height: 100, zIndex: 11 });

parent.addChild(child);
```

[Positions guide →](/docs/positioning/)

## Events

Blocks expose the mouse and keyboard events you would expect from a DOM element.

```javascript
const block = new RectangleBlock({ width: 100, height: 100, selectable: true });

block.click(() => {
  block.set({ backgroundColor: 'red' });
});

block.mouseenter(() => {
  block.set({ backgroundColor: 'orange' });
});
```

The `set` method is preferred over assigning properties directly — it records a history entry and schedules a redraw.

[Events guide →](/docs/events/)

## Animation

Animations use a keyframe object. The `animate` method returns an id you can use to control playback later.

```javascript
const block = new RectangleBlock({ width: 100, height: 100, backgroundColor: 'aqua' });

const animationId = block.animate({
  backgroundColor: ['aqua', 'red', 'blue'],
  duration: 5000,
  autoStart: true,
  iterations: 1,
  easing: 'ease-in-out',
});
```

[Animation guide →](/docs/animation/)

## Creating your own block

Extend `Block` and define options as methods. The method name becomes the option name, and the value handler takes care of caching and unit conversion.

```javascript


export class MyBlock extends Block {
  constructor(options) {
    super(options);
  }

  myOption(option) {
    return super.__valueHandler(option, 'myOption', 'default');
  }
}
```

[Custom blocks →](/docs/custom-block/)

## Reference

- [Block API](/api/block) — the full option and method list
