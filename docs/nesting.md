---
id: nesting
title: Nesting
description: Build a tree of blocks — parent and child relationships, ordering, searching, and dependencies.
---

Blocks form a tree. A block can have children, and those children can have children in turn. Nesting is how you group content, apply shared transforms, and clip content to a shape.

## Adding a child

Use `addChild` to attach a block to another.

```typescript
const card = new RectangleBlock({ width: 200, height: 100 });
const label = new TextBlock({ text: 'Inside' });

card.addChild(label);
```

The child is now positioned relative to its parent's content box. Its `x` and `y` are offsets within the parent, not canvas coordinates.

> [!NOTE] A child does not need to be added to the canvas separately
>
> Adding a child to a block that is already in the scene adds it to the scene too. You only need `canvas.add(...)` for top-level blocks.

## Removing a child

`removeChild` detaches a block from its parent.

```typescript
card.removeChild(label);
```

Removing a block from the canvas entirely is a different operation:

```typescript
canvas.remove(card);   // removes the card and everything under it
```

> [!WARNING] removeChild leaves the block alive
>
> `removeChild` detaches the block from the tree, but the block object still exists. It keeps its options, and you can add it somewhere else later.

## Reading the tree

Every block exposes its place in the tree.

| Property     | What it is                                             |
| ------------ | ------------------------------------------------------ |
| `parentNode` | The parent block, or `undefined` for a top-level block |
| `childNodes` | A `Set` of the block's direct children                 |
| `nodeId`     | A number assigned when the block enters the scene      |

```typescript
card.parentNode;              // undefined at the top level
card.childNodes.size;         // 1
label.parentNode === card;    // true
```

> [!NOTE] nodeId is assigned lazily
>
> A block does not get its `nodeId` until the scene graph is built, which happens on the frame after it is added. A block you just constructed has `nodeId === undefined`.

## Traversing

Two traversal helpers cover most cases.

`listOnlyChilds` visits the direct children, in insertion order. It gives you the index and the count, which is useful when you need to know a child's position among its siblings.

```typescript
card.listOnlyChilds((child, index, total) => {
  console.log(index, 'of', total, child.getOptionCurrent('name'));
});
```

`listAllChilds` visits every descendant, depth first.

```typescript
card.listAllChilds((child) => {
  console.log(child);
});
```

## Ordering

The `order` option controls the sequence in which a `LayoutBlock` places its children. Lower values are placed first.

```typescript
const first = new RectangleBlock({ name: 'first', order: 0 });
const second = new RectangleBlock({ name: 'second', order: 1 });

const row = new LayoutBlock({ layout: 'flex', flexDirection: 'row' });
row.addChild(second);
row.addChild(first);
```

Children with no `order` are assigned one automatically, in the order they were added.

> [!NOTE] order is not z-index
>
> `order` sequences siblings within a layout container. `zIndex` controls what is drawn on top, across the entire scene — that is the only thing that determines stacking order.

## Searching

`find` on the canvas searches the whole scene. `findChilds` searches within one block.

```typescript
// Every block in the scene named 'avatar'
const avatars = canvas.find({ name: 'avatar' });

// Every descendant of the card with that name
const matches = card.findChilds({ name: 'avatar' });
```

Both take an options object and match on exact value equality. Multiple keys are combined with AND — a block must match all of them.

> [!NOTE] Searching by nodeId is special-cased
>
> `canvas.find({ nodeId: 42 })` uses a direct index lookup rather than walking the tree, so it is fast regardless of scene size.

## Naming blocks

The `name` option gives a block a label. It has no effect on rendering, but it makes the scene searchable and readable in the exported JSON.

```typescript
const avatar = new ImageBlock({
  name: 'avatar',
  source: '/avatar.png',
});
```

> [!WARNING] name must be unique for reliable searching
>
> `find` matches on value equality and returns every match. If two blocks share a name, both come back. Use a distinct name when you intend to look a block up by it.

## Dependencies

A block can declare that it depends on another. When the dependency changes, the dependent block is re-rendered.

```typescript
const title = new TextBlock({ text: 'Title' });
const badge = new TextBlock({ text: '1' });

badge.dependencies = [title];
```

You can also manage the set at runtime:

```typescript
badge.addDependecy(title);
badge.removeDependency(title);
```

> [!WARNING] The method name has a typo
>
> The method is `addDependecy` — with one `n` — while its counterpart is correctly spelled `removeDependency`. This is the name in the library, so it is the name you have to use.

Dependencies are how the `LineBlock` keeps a sticky endpoint attached to another block: the line declares a dependency on the block it is bound to, and when that block moves, the line re-renders. See [Lines](/docs/primitives/).

## Binding options between blocks

`bindTo` copies options from one block to another. The bound options are re-read every time the source block's layout is recomputed.

```typescript
// The shadow always matches the card's width and height
const shadow = new RectangleBlock({ backgroundColor: 'rgba(0, 0, 0, 0.2)' });

shadow.bindTo(card, ['width', 'height']);

// Later, when the card resizes, the shadow follows
card.width(300);
```

`unbind` removes a binding:

```typescript
shadow.unbind(card);
```

> [!NOTE] Binding is one-directional
>
> `bindTo(source, options)` means "take these options from `source`". To go the other way, bind in the other direction.

## Important

The `important` option overrides other options. When a block is asked for an option, the value in `important` wins.

```typescript
const block = new RectangleBlock({
  width: 100,
  important: {
    width: 200,   // this is what width() returns
  },
});

block.width();     // 200
```

This is useful when a parent needs to impose a constraint on a child without knowing how the child manages its own size.

## Next steps

- [Layout](/docs/layout/) — arrange children with Flexbox and Grid.
- [Positioning](/docs/positioning/) — take a child out of the flow.
- [Custom blocks](/docs/custom-blocks/) — build your own block type.
