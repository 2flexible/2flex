---
'@2flexible/2flex': patch
---

Stability fixes and type-safety improvements across canvas, blocks, layout, shapes, text, and utilities.

### Block architecture

- Block options are read and written through typed option accessors, so a block offers the accessors of its own options and of the options of its base blocks. An accessor returns the resolved value — a relative value is a number and a color is a string.
- Introduced resolved option types (`ResolvedValue`, `ResolvedAs`, `OptionAccessor`, `OptionAccessors`, `OwnOptionAccessors`, `OptionAccessorsWith`, `BlockOptionsOf`) and exported them.
- Added `extendBlock` to extend a block class with typed option accessors and `set(options)`.
- Added `BaseBlock` and `BaseBlockOptions` to the public API.
- Renamed and exported every block option type with an identical structure, and exported the option types of the canvas, layout, shape, rectangle, circle, image, video, line, and text blocks.
- Default values for the properties of the block classes, and removed the `initWidth`/`initHeight` options — the value a block was asked for is kept in its `initOptions`.
- Improved dependency management in `BaseBlock` so dependencies are invoked and handled reliably, and the sticky dependencies of `LineBlock` are fixed.
- The child block search matches the options of the child instead of the options of the parent.
- A block with a not finite size or position does not break the canvas anymore, and blocks with undefined sizes keep their measured size.
- Blocks support self-sizing based on the dimensions of their children.

### Canvas

- The zoom level scales the quality of the canvas, so the canvas stays sharp while it is zoomed.
- Improved block management in `CanvasGrid` to ensure proper tile updates.
- Enhanced validation and error handling across the canvas and the blocks — invalid option values are reported with a descriptive `TypeError`.
- A block with a z index paints over the hot lines and the scroll bars of its parent, and the z index of a block is relative to the stacking context of its parent.
- The mouseover and mouseout events respect the z index, and the mouse event handling of the row blocks ensures the correct z index management and event triggering.
- A line without control points does not hang the canvas anymore.
- The image block is drawn immediately, without waiting for the canvas to be interacted with.

### Layout

- A layout block measures its children by their shrunk size, so the children do not jump anymore.
- A layout block shares the free space between its children, and the children which do not fit into it stay inside its boundaries.
- A child of a layout block does not jump out of it when it is invoked before the layout.
- The absolute positioning of a block was updated, and the rotation of a child is separated from the rotation inherited from its parent, so the selection and the boundaries of the child match its painted area again.

### Shapes, text, and media

- The padding of a block is the space around its content box, and the width and height calculations account for the overflow gaps.
- The letters of a text block are drawn on the baseline of their line, the letter node coordinates are updated before the bounding box is derived, and the size of a text block is calculated from its text while it was not set.
- The text option is synchronized with the edits, the state of the text block is reflected properly, and the z index registration is released on escape and outside clicks.
- The source type of the media blocks accepts a string or a `CanvasImageSource`, and the media types of the image and video blocks were extended.
- The path property of `LineBlock` is encapsulated and is not accessible from the outside anymore.

### Utilities

- Added `clampSize` to keep a size within the supported range.
- The shorthand relative value parser supports the string notation (`"10px"`, `"10px 20px"`, …).
- The prototype helpers are typed and return a `PropertyDescriptor`.

### Tests

- Added and extended the unit tests of the block, canvas, canvas grid, hot line, image, layout, line, overflow, rectangle, resizable, rotatable, selectable, shape, text, and video blocks, including the cross axis behavior of the layout block and the absolute block behavior.
