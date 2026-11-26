---
id: custom-block
title: Custom Block
description: Extend the Block class to create your own block type with custom options.
---

Every block in the library inherits from `Block`. Extending it gives you the full feature set — layout, transformations, events, animation — plus whatever options you define.

```javascript


export class MyBlock extends Block {
  constructor(options) {
    super(options);
  }
}
```

## Custom options

Options are defined as methods. The method name becomes the option name, and its argument is the value you want to store.

The `__valueHandler` takes care of caching the value and converting units. Return the resolved value.

```javascript


export class MyBlock extends Block {
  constructor(options) {
    super(options);
  }

  myOption(option) {
    return super.__valueHandler(option, 'myOption', 'default');
  }

  myNumericOption(option) {
    return super.__valueHandler(option, 'myNumericOption', 0);
  }
}
```

```javascript
const block = new MyBlock({
  width: 100,
  height: 100,
  myOption: 'hello',
  myNumericOption: 42,
});
```

> [!NOTE]
>
> The third argument to `__valueHandler` is the default value. The fourth argument marks the option as width-related, so percentage values resolve against the parent's width rather than its height.

## Reading and writing options

Every option you define becomes a getter/setter pair.

```javascript
block.myOption();          // read
block.myOption('world');   // write
```

Writing directly bypasses the history and redraw scheduling. Prefer `set` when you want both.

```javascript
block.set({ myOption: 'world' });
```

## Removing an option

```javascript
block.removeProperty('myOption');
```

## A complete example

```javascript


export class ProgressBlock extends Block {
  constructor(options) {
    super(options);
  }

  progress(value) {
    return super.__valueHandler(value, 'progress', 0);
  }

  progressColor(value) {
    return super.__valueHandler(value, 'progressColor', '#22c55e');
  }

  render() {
    super.render();

    const context = this.context;
    if (!context) return;

    const width = this.realWidth;
    const height = this.realHeight;
    const ratio = Math.min(1, Math.max(0, this.progress()));

    context.fillStyle = 'rgba(0, 0, 0, 0.15)';
    context.fillRect(0, 0, width, height);

    context.fillStyle = this.progressColor();
    context.fillRect(0, 0, width * ratio, height);
  }
}
```

```javascript



const canvas = new Canvas('my-canvas', 400, 200);
const bar = new ProgressBlock({ width: 300, height: 16, progress: 0.65 });

canvas.add(bar);
```

## Registering the block for serialization

Custom blocks need to be registered on the canvas before `load` can reconstruct them.

```javascript
canvas.registerBlocks(ProgressBlock);
```

## Reference

- [Block API](/api/block) — `addProperty`, `__valueHandler`, `set`, and `removeProperty`
