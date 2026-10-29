# @2flexible/2flex

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
