---
id: custom-blocks
title: Custom blocks
description: Extend Block to build your own block type with custom options, custom drawing, and custom hit testing.
---

Every block in the library descends from `Block`. When you extend it, you inherit the whole feature set — layout, transforms, events, animation, clipping, overflow, and serialization.

```typescript


class ProgressBlock extends Block {
  constructor(options) {
    super(options);

    this.addProperty('progress', 0, true);
    this.addProperty('color', '#3b82f6');
  }

  render() {
    super.render();

    const context = this.context;
    if (!context) return;

    const width = this.width() * this.progress();

    context.fillStyle = this.color();
    context.fillRect(0, 0, width, this.height());
  }
}
```

## Adding an option

`addProperty` registers a new option on the block. It takes four arguments.

| Argument       | Type                     | What it does                                  |
| -------------- | ------------------------ | --------------------------------------------- |
| `name`         | `string`                 | The option's name                             |
| `defaultValue` | `any`                    | The value used when none is set               |
| `widthRelated` | `boolean`                | Whether percentages resolve against the width |
| `handler`      | `(block, value) => void` | Called after the value is set                 |
| `converter`    | `(block, value) => any`  | Transforms the value before it is stored      |

```typescript
class ProgressBlock extends Block {
  constructor(options) {
    super(options);

    this.addProperty('progress', 0, true);
    this.addProperty('color', '#3b82f6');
  }
}
```

Once registered, the option behaves like any built-in one. Reading it with no argument returns the value; passing a value writes it.

```typescript
const bar = new ProgressBlock({ width: 200, height: 20, progress: 0.5 });

bar.progress();        // 0.5
bar.progress(0.75);    // writes
bar.set({ progress: 1 });  // writes and records an undo step
```

> [!NOTE] The name becomes the option name
>
> The `name` you pass is used as the option key. The method `block.progress()` is created on the prototype, so it is the same `progress` you would read from `getOptionCurrent('progress')`.

### widthRelated

The third argument decides how a percentage is resolved.

- `true` — percentages resolve against the **width** of the parent.
- `false` — percentages resolve against the **height** of the parent.

```typescript
this.addProperty('progress', 0, true);   // '50%' is half the parent's width
this.addProperty('lineHeight', 0, false);  // '50%' is half the parent's height
```

> [!WARNING] Getting it wrong is easy to miss
>
> A `widthRelated` option with the wrong flag still works, it just resolves percentages against the other axis. Nothing warns you.

### The handler

The handler runs every time the option is read or written. Use it to react to a change.

```typescript
class GlowBlock extends Block {
  constructor(options) {
    super(options);

    this.addProperty('glow', 0, false, (block, value) => {
      // runs on read and on write
      if (value > 0) {
        block.setOptionCurrent('shadowBlur', value * 10);
      }
    });
  }
}
```

### The converter

The converter transforms the value before it is stored. Use it to normalise or validate input.

```typescript
class ProgressBlock extends Block {
  constructor(options) {
    super(options);

    this.addProperty(
      'progress',
      0,
      true,
      undefined,
      (block, value) => Math.min(1, Math.max(0, value))
    );
  }
}
```

> [!NOTE] The converter runs on reads too
>
> Because the converter is part of the value handling, it runs when the option is read as well as when it is written. A converter that has side effects will fire on every read.

## Removing an option

`removeProperty` deletes an option and its cached value.

```typescript
block.removeProperty('progress');
```

## Drawing

Override `render` to draw the block. The `context` is the offscreen 2D context for the tile the block is being painted into.

```typescript
class StarBlock extends Block {
  constructor(options) {
    super(options);
    this.addProperty('points', 5);
    this.addProperty('innerRadius', 0.4);
  }

  render() {
    super.render();

    const context = this.context;
    if (!context) return;

    const cx = this.width() / 2;
    const cy = this.height() / 2;
    const outer = Math.min(cx, cy);
    const inner = outer * this.innerRadius();
    const points = this.points();

    context.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outer : inner;
      const angle = (Math.PI * i) / points - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;

      if (i === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.closePath();
    context.fillStyle = '#f59e0b';
    context.fill();
  }
}
```

> [!WARNING] Always call super.render()
>
> `super.render()` runs the base implementation, which handles the `onRender` callback and the `hidden` check. Skip it and the block will ignore `hidden` and your `onRender` handler will never fire.

## Custom hit testing

Override `checkInBound` to control what counts as a hit.

```typescript
class DonutBlock extends Block {
  checkInBound(event) {
    const { x, y } = this.canvas.getCursorPosition(event);
    const cx = this.width() / 2;
    const cy = this.height() / 2;
    const distance = Math.hypot(x - cx, y - cy);

    // Only the ring itself is a hit
    const outer = Math.min(cx, cy);
    return distance <= outer && distance >= outer * 0.6;
  }
}
```

> [!NOTE] checkInBound receives the event
>
> The coordinates are in the block's local space, so a block that has been rotated or moved still tests correctly against its own shape.

## Clipping children

A block's children are clipped to the block's shape when the block has an overflow that is not `visible`. Override `__clipShape` to draw that shape into `__clipPath`.

```typescript
class TriangleBlock extends Block {
  __clipShape() {
    const path = this.__clipPath;
    if (!path) return;

    path.moveTo(this.width() / 2, 0);
    path.lineTo(this.width(), this.height());
    path.lineTo(0, this.height());
    path.closePath();
  }
}
```

> [!NOTE] The path is built in canvas coordinates
>
> The shape is drawn with absolute canvas coordinates, not local ones. `RectangleBlock` uses `this.x()` and `this.y()` for this reason.

> [!WARNING] Clipping only happens when overflow is not visible
>
> The clip path is only created when the block's overflow is `'hidden'`, `'scroll'`, or `'auto'`. With the default `'visible'`, children are drawn outside the block and `__clipShape` is never called.

## Serializing custom blocks

`canvas.export()` records the constructor name of each block, and `canvas.load()` uses the registered classes to rebuild them.

Register your class before loading.

```typescript
canvas.registerBlocks(ProgressBlock);

const payload = canvas.export();

// ... later, in another session
canvas.load(payload);
```

> [!WARNING] Unregistered classes cannot be restored
>
> If a block's class is not registered, `load` cannot construct it and that branch of the tree is skipped. Register every custom block class before calling `load`.

> [!NOTE] Options are restored, not the class
>
> The export records the block's name and its options. When the block is rebuilt, the options are set on a fresh instance — so any state a block holds outside its options is not restored.

## A complete example

Here is a block that combines a custom option, custom drawing, and a custom hit test.

```typescript


export class GaugeBlock extends Block {
  constructor(options) {
    super(options);

    this.addProperty('value', 0, true);
    this.addProperty('trackColor', '#1e293b');
    this.addProperty('fillColor', '#22c55e');
    this.addProperty('thickness', 12);
  }

  render() {
    super.render();

    const context = this.context;
    if (!context) return;

    const width = this.width();
    const height = this.height();
    const thickness = this.thickness();

    context.fillStyle = this.trackColor();
    context.fillRect(0, 0, width, height);

    context.fillStyle = this.fillColor();
    context.fillRect(0, 0, width * this.value(), height);

    context.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    context.lineWidth = 1;
    context.strokeRect(0.5, 0.5, width - 1, height - 1);
  }

  checkInBound(event) {
    const { x, y } = this.canvas.getCursorPosition(event);
    return (
      x >= 0 && x <= this.width() && y >= 0 && y <= this.height()
    );
  }
}
```

## Next steps

- [The API reference](/docs/api-index/) — every exported symbol in one place.
- [Animation](/docs/animation/) — animate your custom options.
- [Custom drawing](/docs/custom-drawing/) — the Canvas 2D option surface.
