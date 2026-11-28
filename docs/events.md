---
id: events
title: Events
description: Attach mouse and keyboard handlers to blocks, control hit testing and stacking precedence, and build custom interactions.
---

Every block can handle DOM events. You register a handler with a method named after the event, and the library calls it when the event happens over that block.

```typescript
block.click((event) => {
  console.log('clicked');
});
```

## The available handlers

| Method        | Event         | Notes                                                         |
| ------------- | ------------- | ------------------------------------------------------------- |
| `click`       | `click`       |                                                               |
| `dblclick`    | `dblclick`    |                                                               |
| `mousedown`   | `mousedown`   |                                                               |
| `mouseup`     | `mouseup`     |                                                               |
| `mousemove`   | `mousemove`   |                                                               |
| `mouseenter`  | `mousemove`   | Fires once when the pointer enters                            |
| `mouseleave`  | `mousemove`   | Fires once when the pointer leaves                            |
| `mouseover`   | `mousemove`   | Fires while the pointer is over the block or a child          |
| `mouseout`    | `mousemove`   | Fires while the pointer is outside the block and its children |
| `contextMenu` | `contextmenu` |                                                               |
| `wheel`       | `wheel`       |                                                               |
| `keydown`     | `keydown`     |                                                               |
| `keyup`       | `keyup`       |                                                               |

> [!NOTE] The enter and leave handlers are built on mousemove
>
> `mouseenter`, `mouseleave`, `mouseover`, and `mouseout` are implemented on top of `mousemove`. The library tracks the pointer's state to fire them at the right moment.

## Hit testing is shape-aware

A handler only fires when the event lands on the block's actual drawn shape, not just its bounding box.

- A `RectangleBlock` tests against its rounded-rectangle path, so the corners outside the radius do not trigger it.
- A `CircleBlock` tests against its arc.
- A `LineBlock` tests against the stroke of the line.
- A `TextBlock` tests against the individual letter boxes.

```typescript
// The transparent corner of a rounded rectangle is not a hit
const card = new RectangleBlock({
  width: 200,
  height: 200,
  borderRadius: 60,
});

card.click(() => console.log('hit the rounded shape'));
```

> [!NOTE] A selected block uses its bounding box
>
> The precise shape test applies while the block is not selected. Once it is selected, the hit test falls back to the bounding box, so the whole rectangle stays grabbable and the drag does not jump when you grab a corner.

You can test a position yourself with `checkInBound`:

```typescript
if (block.checkInBound(event)) {
  // the pointer is over this block
}
```

## Only the topmost block receives the event

When two blocks overlap, the event goes to the one with the higher z-index. The others are skipped.

> [!WARNING] z-index is assigned automatically, and it depends on the tree
>
> A block with no explicit `zIndex` is assigned one when the scene graph is built. The assignment uses a reverse post-order traversal, so a parent always sits below its children, and among siblings the one added **first** ends up on top. Adding or removing blocks in the tree can change the assignment.
>
> If you need a specific stacking order, set `zIndex` explicitly.

```typescript
const behind = new RectangleBlock({ width: 100, height: 100, zIndex: 1 });
const inFront = new RectangleBlock({ width: 100, height: 100, zIndex: 2 });
```

## Events need focus

Keyboard handlers only fire when the canvas has DOM focus.

```typescript
canvas.isFocused;   // true after the user clicks the canvas
```

> [!NOTE] Click the canvas first
>
> This is deliberate. A canvas that grabbed the keyboard on page load would break every other control on the page. The user has to click the canvas once before keyboard input reaches your blocks.

The `keydown` and `keyup` handlers also call `preventDefault`, so the key does not scroll the page.

## Events on children

A child's event does not bubble to its parent in the DOM sense. The library dispatches each handler to every block whose hit test passes, and the block's own z-index decides the order.

If you want a click anywhere inside a card to count as a click on the card, register the handler on the card and check whether the child is under the pointer:

```typescript
card.click((event) => {
  const { x, y } = canvas.getCursorPosition(event);
  console.log('clicked the card or one of its children');
});
```

## Removing a handler

There is no public `off` method. Handlers are removed by passing `undefined` to the registration method, which is what the internal mixins do when an interaction is turned off.

> [!WARNING] Handlers are not removable through the public API
>
> `block.click(handler)` registers a handler. `block.click(undefined)` will not unregister it. If you need to toggle a handler, keep a flag in your closure and check it inside the handler — the library will still call it, but it will do nothing.

```typescript
let enabled = true;

const handler = (event) => {
  if (!enabled) return;
  console.log('clicked');
};

block.click(handler);

// Later
enabled = false;
```

## Building a custom interaction

For anything the built-in interactions do not cover, use `mousemove` plus `checkInBound`.

Here is a hover effect:

```typescript
let hovering = false;

block.mousemove((event) => {
  const inside = block.checkInBound(event);

  if (inside && !hovering) {
    hovering = true;
    block.set({ backgroundColor: '#2563eb' });
  } else if (!inside && hovering) {
    hovering = false;
    block.set({ backgroundColor: '#1e293b' });
  }
});
```

> [!WARNING] set() records an undo step
>
> Every call to `block.set({...})` records a history entry. A hover effect that calls `set` on every pointer move will flood the undo stack. Guard the call so it only fires when the state actually changes — as in the example above, `set` is called twice per hover, not on every pointer move.

> [!NOTE] Direct assignment does not re-render
>
> Writing an option directly — `block.backgroundColor('#2563eb')` — updates the value but does not mark the block for redraw and does not record history. Only `set()` and the built-in event handlers do both. Use `set()` when you want the change to appear and be undoable.

## Cursor feedback

The built-in interactions change the cursor over their handles. For a custom interaction, set it yourself.

```typescript
block.mousemove((event) => {
  if (block.checkInBound(event)) {
    canvas.changeCursor('pointer');
  } else {
    canvas.resetCursor();
  }
});
```

You can also register a cursor against a block's id, which lets the canvas pick the cursor of the topmost block under the pointer:

```typescript
canvas.registerCursor(block.nodeId!, 'pointer');
// ...
canvas.unregisterCursor(block.nodeId!, 'pointer');
```

> [!NOTE] nodeId may not be set yet
>
> A block's `nodeId` is assigned when the scene graph is built, which happens on the frame after it is added. Register the cursor after that frame, or look the id up with `canvas.find({ name: 'my-block' })`.

## Next steps

- [Transformation](/docs/transform/) — the built-in interactions.
- [Viewport](/docs/viewport/) — pan and zoom.
- [Text](/docs/text/) — in-canvas text editing.
