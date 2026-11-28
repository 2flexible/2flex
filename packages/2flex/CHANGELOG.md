# @2flexible/2flex

## 1.2.2

### Patch Changes

- 389d9ac: The canvas can be bound to an element, resized and released, so a framework can own it.

  ### The canvas

  - Added `Canvas.fromElement()`, which binds a canvas to a `canvas` element of the page. The element is used as it is, it is not moved into the document and it is not dropped when the canvas is released. The id of the element is not needed.
  - Added `Canvas.resize()`, which changes the size of the canvas, resizes its element and lays the scene out again.
  - Added `Canvas.flush()`, which applies the changes that are waiting in the queue of the canvas right away, so a block is laid out and drawn without waiting for the next frame.
  - Added `Canvas.destroy()`, which stops the render loop of the canvas and removes the listeners of its element and of the window.

  ### The options of a custom block

  - An option of a custom block is recognized by the `set()` method of the block now. The option is a method of the class of the block, it is written with the helper of the base class, so it is an option like the ones that are registered with `addProperty`.

## 1.2.1

### Patch Changes

- 1900e66: Stability fixes and type-safety improvements across canvas, blocks, layout, shapes, text, and utilities.

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

## 1.2.0

### Minor Changes

- c117f9b: Major internal rewrite plus new block, canvas, layout, shape, text, media, animation, and utility features.

  ### Block architecture

  - Added `BaseBlock` with cached/current options, property registration/removal, dependencies, option binding, child management, geometry/corner helpers, bounding-box calculation, history hooks, and DOM event helpers.
  - Composed `Block` from new mixins: `SelectableBlock`, `DraggableBlock`, `ResizableBlock`, `RotatableBlock`, `OverflowBlock`, `HotLineBlock`, and `AnimationBlock`.
  - Added selectable, draggable, resizable, rotatable, overflow, hot-line, and animation options/callbacks, including per-edge/corner handles, min/max limits, flip-aware behavior, sticky/fixed children, scrollbars, clipping, and cursor/z-index handling.
  - Added `animate()` keyframe engine with duration, delay, iterations, iteration start, direction, easing (linear, CSS keywords, custom linear/cubic-bezier/steps), playback rate, composite modes, auto-start, callbacks, and unit-aware values.
  - Added `find`, `registerBlocks`, `export`, and `load` APIs; fixed nested payload import/export.
  - Added `inBound` and `getPrototype` helpers.

  ### Canvas

  - Rewrote canvas internals with `CanvasScene`, `CanvasGrid` tile caching, `Scheduler`, `History`, `DummyCanvas`, and updated `DOMManager`.
  - Added cached/demand rendering, z-index-aware DOM event dispatch and cursor resolution, hidden-block ordering, and performance improvements for pan/zoom.
  - Added undo/redo with history options, `find`, `registerBlocks`, payload export/load, and expanded canvas options: `zoomSpeed`, `zoomInvSpeed`, `moveSpeed`, `zoomType`, `keyboardMovement`, `mouseMovement`, `history`, `historySize`, `positionX/Y/Z`, `fps`, and `tileSize`.
  - Added cursor/view helpers and interaction fixes for space-drag panning, point/center zoom, keyboard movement, focus, mouse-leave event reset, coordinate updates, and style/option updates.

  ### Layout

  - Refactored `LayoutBlock` with flex row/column/reverse, wrap, grid templates, auto-flow, gaps, column/row start/end, justify/align/place content and items.
  - Added responsive relayout, child ordering/add/remove updates, margin/padding/gap handling, nowrap growth, content sizing, and grid-layout tests.

  ### Shapes

  - Rewrote `ShapeBlock` around a path-drawing API with fill/stroke/clip, gradients, colors, line styles, shadows, text drawing/measurement, `miterLimit`, `pointInPath`, `pointInStroke`, draw callbacks, filters, and array filter options.
  - Added flip support, improved borders/bounding boxes, context style isolation, and updated `RectangleBlock`/`CircleBlock`.
  - Expanded `LineBlock` with multiple control points, add/remove point APIs, per-point events, sticky endpoints/dependents, cubic-bezier stationary-point bounds, control-point helpers, inline hot lines, editable points, and bounding/cursor fixes.
  - Expanded `TextBlock` with selectable/editable text, caret animation, keyboard navigation/selection, copy/cut/paste, backspace/delete, select-all, dummy canvas measurement, letter spacing/line-height/font metrics, wrapping, multi-unit line heights, local-coordinate/bounding fixes, and `onEdit`.
  - Added `MediaLayoutBlock`; refactored `ImageBlock`/`VideoBlock` with source sizing, media layout, drawing, `onPlay`, and edit fixes.

  ### Utilities and types

  - Exported unit converters, geometry/intersection helpers, easing helpers, color converters, `lerp`, `clamp`, `inRange`, and other utilities from the package entry point.
  - Added `RelativeType`, `ShortHandRelativeType`, `BlockConstructor`, `HotCornerArea`, `SnapshotData`, `NodeId`, `XY`, and animation/easing types; removed obsolete snapshot/block types.
  - Added full unit conversion support in blocks and animations, plus color and utility calculation fixes.

  ### Fixes and stability

  - Fixed z-index ordering, hidden-block accounting, DOM event dispatch, cursor priority, clipping, child coordinates, flips/rotation, resizing inversion/direction, overflow translation, sticky/fixed positioning, scrollbars, and scrollbar constants.
  - Fixed rendering/caching invalidation, canvas pan/zoom coordinates, block coordinate updates, child add/remove, margins/padding, min/max sizes, viewport units, `important` overrides, `onRender` save/restore, history, and animation registration.
  - Applied type and API fixes across canvas, blocks, shapes, layout, DOM manager, and utilities; removed unused methods/values.

  ### Tests and tooling

  - Added a Vitest browser test suite with Playwright snapshots covering animation, base blocks, canvas, circle/rectangle/shape paths, draggable, hot-line, image/video/media, flex/grid layout, line, overflow, resizable, rotatable, selectable, text, and utilities.
  - Refactored/separated legacy tests for the new architecture, added shared test helpers, and made screenshot capture configurable.

## 1.2.0

### Minor Changes

- Major internal rewrite plus new block, canvas, layout, shape, text, media, animation, and utility features.

  ### Block architecture

  - Added `BaseBlock` with cached/current options, property registration/removal, dependencies, option binding, child management, geometry/corner helpers, bounding-box calculation, history hooks, and DOM event helpers.
  - Composed `Block` from new mixins: `SelectableBlock`, `DraggableBlock`, `ResizableBlock`, `RotatableBlock`, `OverflowBlock`, `HotLineBlock`, and `AnimationBlock`.
  - Added selectable, draggable, resizable, rotatable, overflow, hot-line, and animation options/callbacks, including per-edge/corner handles, min/max limits, flip-aware behavior, sticky/fixed children, scrollbars, clipping, and cursor/z-index handling.
  - Added `animate()` keyframe engine with duration, delay, iterations, iteration start, direction, easing (linear, CSS keywords, custom linear/cubic-bezier/steps), playback rate, composite modes, auto-start, callbacks, and unit-aware values.
  - Added `find`, `registerBlocks`, `export`, and `load` APIs; fixed nested payload import/export.
  - Added `inBound` and `getPrototype` helpers.

  ### Canvas

  - Rewrote canvas internals with `CanvasScene`, `CanvasGrid` tile caching, `Scheduler`, `History`, `DummyCanvas`, and updated `DOMManager`.
  - Added cached/demand rendering, z-index-aware DOM event dispatch and cursor resolution, hidden-block ordering, and performance improvements for pan/zoom.
  - Added undo/redo with history options, `find`, `registerBlocks`, payload export/load, and expanded canvas options: `zoomSpeed`, `zoomInvSpeed`, `moveSpeed`, `zoomType`, `keyboardMovement`, `mouseMovement`, `history`, `historySize`, `positionX/Y/Z`, `fps`, and `tileSize`.
  - Added cursor/view helpers and interaction fixes for space-drag panning, point/center zoom, keyboard movement, focus, mouse-leave event reset, coordinate updates, and style/option updates.

  ### Layout

  - Refactored `LayoutBlock` with flex row/column/reverse, wrap, grid templates, auto-flow, gaps, column/row start/end, justify/align/place content and items.
  - Added responsive relayout, child ordering/add/remove updates, margin/padding/gap handling, nowrap growth, content sizing, and grid-layout tests.

  ### Shapes

  - Rewrote `ShapeBlock` around a path-drawing API with fill/stroke/clip, gradients, colors, line styles, shadows, text drawing/measurement, `miterLimit`, `pointInPath`, `pointInStroke`, draw callbacks, filters, and array filter options.
  - Added flip support, improved borders/bounding boxes, context style isolation, and updated `RectangleBlock`/`CircleBlock`.
  - Expanded `LineBlock` with multiple control points, add/remove point APIs, per-point events, sticky endpoints/dependents, cubic-bezier stationary-point bounds, control-point helpers, inline hot lines, editable points, and bounding/cursor fixes.
  - Expanded `TextBlock` with selectable/editable text, caret animation, keyboard navigation/selection, copy/cut/paste, backspace/delete, select-all, dummy canvas measurement, letter spacing/line-height/font metrics, wrapping, multi-unit line heights, local-coordinate/bounding fixes, and `onEdit`.
  - Added `MediaLayoutBlock`; refactored `ImageBlock`/`VideoBlock` with source sizing, media layout, drawing, `onPlay`, and edit fixes.

  ### Utilities and types

  - Exported unit converters, geometry/intersection helpers, easing helpers, color converters, `lerp`, `clamp`, `inRange`, and other utilities from the package entry point.
  - Added `RelativeType`, `ShortHandRelativeType`, `BlockConstructor`, `HotCornerArea`, `SnapshotData`, `NodeId`, `XY`, and animation/easing types; removed obsolete snapshot/block types.
  - Added full unit conversion support in blocks and animations, plus color and utility calculation fixes.

  ### Fixes and stability

  - Fixed z-index ordering, hidden-block accounting, DOM event dispatch, cursor priority, clipping, child coordinates, flips/rotation, resizing inversion/direction, overflow translation, sticky/fixed positioning, scrollbars, and scrollbar constants.
  - Fixed rendering/caching invalidation, canvas pan/zoom coordinates, block coordinate updates, child add/remove, margins/padding, min/max sizes, viewport units, `important` overrides, `onRender` save/restore, history, and animation registration.
  - Applied type and API fixes across canvas, blocks, shapes, layout, DOM manager, and utilities; removed unused methods/values.

  ### Tests and tooling

  - Added a Vitest browser test suite with Playwright snapshots covering animation, base blocks, canvas, circle/rectangle/shape paths, draggable, hot-line, image/video/media, flex/grid layout, line, overflow, resizable, rotatable, selectable, text, and utilities.
  - Refactored/separated legacy tests for the new architecture, added shared test helpers, and made screenshot capture configurable.

## 1.1.0

### Minor Changes

- Too flexible infinite canvas library.
