---
id: first-scene
title: Your first scene
description: Build a working interactive scene from an empty page — a canvas, a card, text, and working interactions.
---

This page builds a small but complete scene: a canvas you can pan and zoom, a card you can select and drag, and a label inside it. Every concept introduced here is used by the rest of the documentation.

## 1. Put a canvas on the page

```html
<canvas id="scene" width="900" height="600"></canvas>
```

The `width` and `height` attributes here are just the element's intrinsic size. The library will set them to match the dimensions you pass to `Canvas`, scaled by the device pixel ratio.

## 2. Construct the canvas

```typescript


const canvas = new Canvas('scene', 900, 600, {
  backgroundColor: '#0f172a',
});
```

The fourth argument is an options object. Every key that is not one of the library's own options is treated as a CSS property and applied to the `<canvas>` element — which is how `backgroundColor` works here.

The canvas is now live. You can pan it by holding <kbd>Space</kbd> and dragging, and zoom it with <kbd>Ctrl</kbd> + scroll.

> [!NOTE] The canvas needs focus
>
> Click the canvas once. Until it has DOM focus, 2flex ignores keyboard input and most pointer gestures — this is deliberate, so a canvas on a page does not hijack the user's scroll wheel.

## 3. Add a shape

A `RectangleBlock` is a rectangle with a fill, a border, and optional corner radii.

```typescript


const canvas = new Canvas('scene', 900, 600, {
  backgroundColor: '#0f172a',
});

const card = new RectangleBlock({
  x: 120,
  y: 90,
  width: 260,
  height: 160,
  backgroundColor: '#3b82f6',
  borderRadius: 18,
  border: '2px solid rgba(255, 255, 255, 0.25)',
});

canvas.add(card);
```

Three things are happening in that option object:

- `x` and `y` position the block in **canvas coordinates** — the origin is the top-left of the canvas, not the top-left of the screen.
- `width` and `height` size it.
- `border` accepts a CSS-like shorthand string, `"2px solid #ffffff"`, which is parsed into a width, a style, and a colour.

> [!WARNING] The border shorthand splits on spaces
>
> The shorthand parser splits the string on whitespace and takes the first three tokens. The colour must be a single token — `"2px solid #ffffff"` works, but `"2px solid rgba(255, 255, 255, 0.25)"` does not, because the spaces inside `rgba()` break the split. For a colour with alpha, use the tuple form: `border: [2, 'solid', 'rgba(255, 255, 255, 0.25)']`.

`canvas.add(card)` puts the block into the scene. The scene updates on the next animation frame.

## 4. Add text inside the card

A block can hold children. A child's position is relative to its parent's content box, so the label sits inside the card's top-left corner plus the card's padding.

```typescript


const canvas = new Canvas('scene', 900, 600, {
  backgroundColor: '#0f172a',
});

const card = new RectangleBlock({
  x: 120,
  y: 90,
  width: 260,
  height: 160,
  padding: 20,
  backgroundColor: '#3b82f6',
  borderRadius: 18,
});

const title = new TextBlock({
  text: 'Hello 2flex',
  fontSize: 22,
  fontWeight: 'bold',
  color: '#ffffff',
});

const body = new TextBlock({
  text: 'Drag me, zoom in, edit me.',
  fontSize: 14,
  color: 'rgba(255, 255, 255, 0.85)',
  wrap: 'word',
});

card.addChild(title);
card.addChild(body);

canvas.add(card);
```

Two details worth noticing:

- **`padding` is a shorthand.** `padding: 20` sets all four sides. You can also set `paddingTop`, `paddingRight`, `paddingBottom`, and `paddingLeft` individually.
- **`wrap: 'word'`** makes the text break at word boundaries when it exceeds the block's width. Without it the default is `'nowrap'`, which lets text run past the edge.

## 5. Make it interactive

Interactions are opt-in. Add the flags you want and the library handles the pointer handling, hit testing, cursor changes, and hit areas.

```typescript
const card = new RectangleBlock({
  x: 120,
  y: 90,
  width: 260,
  height: 160,
  padding: 20,
  backgroundColor: '#3b82f6',
  borderRadius: 18,

  selectable: true,
  draggable: true,
  resizable: true,
  rotatable: true,
});
```

> [!WARNING] draggable requires selectable
>
> The drag handler checks `selectable` before it starts. A block with `draggable: true` but `selectable: false` will not move. Set both.

While the card is selected, 2flex draws its outline and four corner handles over it. To draw that chrome you need one more option:

```typescript
const card = new RectangleBlock({
  // ...
  selectable: true,
  draggable: true,
  hotLines: true,
});
```

## 6. React to changes

Each interaction has a callback that fires while it happens.

```typescript
const card = new RectangleBlock({
  // ...
  selectable: true,
  draggable: true,
  hotLines: true,

  onDraggable: (block) => {
    console.log('position', block.x(), block.y());
  },
});
```

`onDraggable`, `onResizable`, and `onRotatable` all receive the block as their only argument, and all fire on every pointer move while the interaction is in progress.

## 7. Add a custom event handler

Beyond the built-in interactions, you can listen for any DOM event on a block.

```typescript
card.click((event) => {
  console.log('clicked at', canvas.getCursorPosition(event));
});
```

The handler only fires when the click lands on the block. 2flex tests against the actual drawn shape — the rounded corners of a rectangle, the arc of a circle, the stroke of a line — not just its bounding box.

> [!NOTE] Only the topmost block wins
>
> When two blocks overlap, the event goes to the one with the higher z-index. See [Events](/docs/events/) for how to control that.

## 8. Update the block later

Options are read and written through the same method. Calling it with no argument reads; calling it with a value writes.

```typescript
// Read
const width = card.width();

// Write
card.width(320);

// Write several at once — this also records an undo step
card.set({
  width: 320,
  height: 200,
  backgroundColor: '#8b5cf6',
});
```

> [!NOTE] Use set() to redraw and to record the change
>
> Writing an option directly updates the value, but it does not schedule a redraw and it does not record an undo step. `set()` does both, and it records one entry for the whole change — which is why it is the better choice when you change more than one option.

## 9. Put it together

```typescript title="scene.ts"


const canvas = new Canvas('scene', 900, 600, {
  backgroundColor: '#0f172a',
});

const card = new RectangleBlock({
  x: 120,
  y: 90,
  width: 260,
  height: 160,
  padding: 20,
  backgroundColor: '#3b82f6',
  borderRadius: 18,
  selectable: true,
  draggable: true,
  resizable: true,
  hotLines: true,
  onDraggable: (block) => {
    console.log(block.x(), block.y());
  },
});

const title = new TextBlock({
  text: 'Hello 2flex',
  fontSize: 22,
  fontWeight: 'bold',
  color: '#ffffff',
});

const body = new TextBlock({
  text: 'Drag me, zoom in, edit me.',
  fontSize: 14,
  color: 'rgba(255, 255, 255, 0.85)',
  wrap: 'word',
});

card.addChild(title);
card.addChild(body);
canvas.add(card);
```

## What you have now

- A pannable, zoomable infinite surface.
- A card with rounded corners, a border, and padding.
- Two text blocks laid out inside it.
- Selection, dragging, and resizing, with visible handles.

From here the documentation branches. If you want to arrange many blocks in a grid or a column, go to [Layout](/docs/layout/). If you want to draw arbitrary paths, go to [Custom drawing](/docs/custom-drawing/). If you want the card to move on its own, go to [Animation](/docs/animation/).
