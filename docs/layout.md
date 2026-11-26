---
id: layout
title: Layout
description: Arrange children with Flexbox and Grid containers — direction, wrapping, alignment, gaps, and grid templates.
---

`LayoutBlock` is a container that arranges its children. It implements a useful subset of Flexbox and Grid.

```typescript


const row = new LayoutBlock({
  layout: 'flex',
  flexDirection: 'row',
  gap: 12,
  padding: 16,
});

for (let i = 0; i < 4; i++) {
  row.addChild(
    new RectangleBlock({
      width: 80,
      height: 40,
      backgroundColor: '#3b82f6',
    }),
  );
}
```

## Choosing a layout mode

| Value           | Behaviour                                                            |
| --------------- | -------------------------------------------------------------------- |
| `'flex'`        | A flex container. Its children flow along the main axis.             |
| `'inline-flex'` | Same as `'flex'`, but the container sizes itself to fit its content. |
| `'grid'`        | A grid container. Children are placed into rows and columns.         |
| `'inline-grid'` | Same as `'grid'`, but the container sizes itself to fit its content. |

`inline-flex` and `inline-grid` compute their own width and height from their children when you have not set them explicitly. The regular versions keep whatever size you gave them.

> [!NOTE] Children with absolute or fixed positions are skipped
>
> The layout algorithm only flows children whose `position` is `relative` (or unset). A child with `position: 'absolute'` or `'fixed'` is positioned by the scene instead, and does not take up space in the flow. See [Positioning](/docs/positioning/).

## Flex direction

`flexDirection` sets the main axis.

| Value              | Children are placed along |
| ------------------ | ------------------------- |
| `'row'` (default)  | Left to right             |
| `'column'`         | Top to bottom             |
| `'row-reverse'`    | Right to left             |
| `'column-reverse'` | Bottom to top             |

```typescript
const column = new LayoutBlock({
  layout: 'flex',
  flexDirection: 'column',
  gap: 8,
});
```

> [!WARNING] Reverse directions are not implemented yet
>
> In version 1.2.0, `'row-reverse'` and `'column-reverse'` fall through to the forward algorithm. The children are placed in normal order. Use `order` on the children, or reverse the order you add them in, if you need the reversed arrangement.

## Wrapping

`flexWrap` controls whether children stay on one line or start a new one.

| Value                | Behaviour                                       |
| -------------------- | ----------------------------------------------- |
| `'nowrap'` (default) | All children on one line, overflowing if needed |
| `'wrap'`             | Children wrap onto a new line at the edge       |
| `'wrap-reverse'`     | Wraps onto the previous line                    |

```typescript
const grid = new LayoutBlock({
  layout: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  width: 200,
});
```

> [!WARNING] wrap-reverse wraps forward
>
> `'wrap-reverse'` counts as wrapped — `alignContent` applies to it — but the rows are still filled in the normal direction, with no vertical reversal.

`flexFlow` is a shorthand that sets direction and wrap together.

```typescript
const wrapped = new LayoutBlock({
  layout: 'flex',
  flexFlow: ['column', 'wrap'],
});
```

## Main axis distribution

`justifyContent` distributes the children along the main axis.

| Value                | Behaviour                                                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| `'normal'` (default) | Children are placed at the start of the axis                                                    |
| `'start'`            | Children are packed at the start of the axis                                                    |
| `'end'`              | Children are packed at the end of the axis                                                      |
| `'center'`           | Children are centred, with equal space on either side                                           |
| `'space-between'`    | The first child is at the start, the last at the end, and the space is distributed between them |
| `'space-around'`     | Each child gets equal space around it                                                           |
| `'space-evenly'`     | The space is distributed evenly, including the edges                                            |

```typescript
const spread = new LayoutBlock({
  layout: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: 400,
});
```

## Cross axis alignment

`alignItems` aligns the children along the cross axis.

| Value                | Behaviour                                           |
| -------------------- | --------------------------------------------------- |
| `'normal'` (default) | Children stretch to fill the cross axis             |
| `'start'`            | Children are aligned to the start of the cross axis |
| `'end'`              | Children are aligned to the end of the cross axis   |
| `'center'`           | Children are centred on the cross axis              |
| `'stretch'`          | Children are stretched to fill the cross axis       |

> [!NOTE] alignContent is for wrapped content
>
> `alignContent` distributes the **lines** of a wrapped flex container along the cross axis. It only has an effect when `flexWrap` is `'wrap'` or `'wrap-reverse'`, or in a grid container.

```typescript
const wrapped = new LayoutBlock({
  layout: 'flex',
  flexWrap: 'wrap',
  alignContent: 'space-between',
  height: 300,
});
```

## The place shorthands

`placeContent` sets `justifyContent` and `alignContent` at once. `placeItems` sets `justifyItems` and `alignItems`.

```typescript
const centred = new LayoutBlock({
  layout: 'flex',
  placeContent: 'center',
  placeItems: 'center',
});
```

> [!WARNING] placeContent accepts one value
>
> `placeContent` takes a single value and applies it to both axes. To use different values for each axis, set `justifyContent` and `alignContent` separately.

## Gaps

`gap` sets the space between children on both axes.

```typescript
const spaced = new LayoutBlock({
  layout: 'flex',
  gap: 16,
});
```

For different values per axis, use an array — the first value is the row gap, the second is the column gap.

```typescript
const spaced = new LayoutBlock({
  layout: 'flex',
  gap: [8, 24],   // 8px between rows, 24px between columns
});
```

You can also set `gapRow` and `gapColumn` directly.

## Flex basis

`flexBasis` overrides a child's size along the main axis. When it is set to anything other than `'auto'`, the child's own `width` or `height` is ignored for that axis.

```typescript
const child = new RectangleBlock({
  width: 40,
  flexBasis: 200,   // 200px along the main axis regardless of width
});
```

## Grid

Set `layout` to `'grid'` and define the tracks.

`gridTemplateColumns` is an array of column widths in pixels. `gridTemplateRows` is an array of row heights.

```typescript
const grid = new LayoutBlock({
  layout: 'grid',
  gridTemplateColumns: [120, 120, 120],
  gridTemplateRows: [80, 80],
  gap: 10,
});
```

Children are placed into the grid in order, filling each row before moving to the next.

`gridTemplate` is a shorthand that takes both at once — the first entry is the rows, the second is the columns.

```typescript
const grid = new LayoutBlock({
  layout: 'grid',
  gridTemplate: [[80, 80], [120, 120, 120]],
});
```

### Auto tracks

A track set to `'auto'` sizes itself to the content in it. Any remaining space in the container is distributed across the auto tracks.

```typescript
const grid = new LayoutBlock({
  layout: 'grid',
  gridTemplateColumns: [100, 'auto'],
  gridTemplateRows: ['auto'],
});
```

### Grid flow

`gridAutoFlow` is accepted and stored, but the layout algorithm always places children row-first — filling each row before moving to the next — regardless of its value.

```typescript
const grid = new LayoutBlock({
  layout: 'grid',
  gridTemplateColumns: [100, 100],
});
```

> [!WARNING] gridAutoFlow has no effect yet
>
> In version 1.2.0 the value is recorded but the grid layout always flows row-first. If you need a different flow, control the order in which you add the children.

### Grid item alignment

`justifyItems` aligns a child within its grid area, horizontally.

| Value                | Behaviour                        |
| -------------------- | -------------------------------- |
| `'normal'` (default) | The child keeps its own size     |
| `'start'`            | Aligned to the start of the area |
| `'end'`              | Aligned to the end of the area   |
| `'center'`           | Centred in the area              |
| `'stretch'`          | Stretched to fill the area       |

> [!WARNING] stretch is not implemented for grid items
>
> The `'stretch'` value is accepted but does not resize the child. Use `'normal'` and set the child's size explicitly.

## Container padding and margin

`padding` and `margin` work on a `LayoutBlock` just as they do on any other block. Padding insets the content area that children are placed into.

```typescript
const padded = new LayoutBlock({
  layout: 'flex',
  padding: [16, 24],   // 16px vertical, 24px horizontal
  gap: 8,
});
```

## Sizing children inside a layout

A layout container will shrink its children to fit when they overflow, but only in some configurations. If you want a child to keep its size, give the container a definite size and set the child's size explicitly.

> [!NOTE] Layout is not a browser engine
>
> The layout algorithm is a purpose-built implementation, not a port of the CSS specification. It covers the common cases — direction, wrap, distribution, alignment, gaps, and fixed or auto grid tracks — but there is no `subgrid`, no `fit-content`, no intrinsic sizing, and no `flex-grow` / `flex-shrink`. Test the specific arrangements you rely on.

## Next steps

- [Positioning](/docs/positioning/) — take children out of the flow.
- [Transformation](/docs/transform/) — make the container draggable and resizable.
- [Custom blocks](/docs/custom-blocks/) — build your own container.
