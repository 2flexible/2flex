---
'@2flexible/2flex': patch
---

The canvas can be bound to an element, resized and released, so a framework can own it.

### The canvas

- Added `Canvas.fromElement()`, which binds a canvas to a `canvas` element of the page. The element is used as it is, it is not moved into the document and it is not dropped when the canvas is released. The id of the element is not needed.
- Added `Canvas.resize()`, which changes the size of the canvas, resizes its element and lays the scene out again.
- Added `Canvas.flush()`, which applies the changes that are waiting in the queue of the canvas right away, so a block is laid out and drawn without waiting for the next frame.
- Added `Canvas.destroy()`, which stops the render loop of the canvas and removes the listeners of its element and of the window.

### The options of a custom block

- An option of a custom block is recognized by the `set()` method of the block now. The option is a method of the class of the block, it is written with the helper of the base class, so it is an option like the ones that are registered with `addProperty`.
