---
id: react
title: React
description: Build 2flex scenes with react components, and turn a block of your own into a component with one call.
---

The React bindings of 2flex let you build a scene as a tree of components. Every shape of the library is a component, the props of a component are the options of the block it holds, and a block of your own becomes a component with a single call.

## Installation

<!-- ::start:tabs variant="package-manager" -->

```bash
npm install @2flexible/2flex-react
pnpm add @2flexible/2flex-react
yarn add @2flexible/2flex-react
bun add @2flexible/2flex-react
```

<!-- ::end:tabs -->

The package needs React 18 or newer. React itself is a peer dependency, so the version of your application is the version that is used.

## The canvas

The `Canvas` component renders the `canvas` element and owns the canvas of the library. Every block that is rendered inside of it is added to the scene.

```tsx
import { Canvas, Rectangle } from '@2flexible/2flex-react';

function Scene() {
  return (
    <Canvas width={600} height={400}>
      <Rectangle x={40} y={40} width={160} height={100} backgroundColor="blue" />
    </Canvas>
  );
}
```

| Prop        | Type               | Default | Description                           |
| ----------- | ------------------ | ------- | ------------------------------------- |
| `width`     | `number`           | `600`   | The width of the canvas in pixels     |
| `height`    | `number`           | `400`   | The height of the canvas in pixels    |
| `style`     | `CSSProperties`    | —       | The styles of the canvas element      |
| `className` | `string`           | —       | The class name of the canvas element  |
| `id`        | `string`           | —       | The id of the canvas element          |
| `onReady`   | `(canvas) => void` | —       | Called with the canvas of the library |

Every option of the canvas of the library is a prop too, so `zoomType`, `positionX`, `history` and the rest of them are set on the component.

```tsx
<Canvas width={800} height={600} zoomType="point" positionX={-100} />
```

> [!NOTE] The canvas follows the size of the component
>
> When the `width` or the `height` prop changes, the canvas is resized. The element is laid out by react, the canvas only follows it.

## The blocks

Every shape of the library is a component.

| Component   | The block of the library |
| ----------- | ------------------------ |
| `Rectangle` | `RectangleBlock`         |
| `Circle`    | `CircleBlock`            |
| `Text`      | `TextBlock`              |
| `Line`      | `LineBlock`              |
| `Image`     | `ImageBlock`             |
| `Video`     | `VideoBlock`             |
| `Layout`    | `LayoutBlock`            |
| `Block`     | `Block`                  |

The props of a component are the options of its block. The name of an option is the name of the prop, and it can be written in camel case or in kebab case, both spellings are the same option.

```tsx
<Rectangle backgroundColor="blue" borderRadius={8} />
<Rectangle background-color="blue" border-radius={8} />
```

> [!TIP] The type of the props knows the options
>
> The props of a component are typed by the options of its block, so a typo in the name of a prop is caught by the compiler.

## Nesting

A block that is rendered inside of another block is attached to it as its child, so the parent lays it out.

```tsx
<Canvas width={600} height={400}>
  <Rectangle x={40} y={40} width={300} height={200} backgroundColor="#111827">
    <Circle width={60} height={60} backgroundColor="orange" />
    <Text x={80} y={10} text="Hello" color="white" fontSize={24} />
  </Rectangle>
</Canvas>
```

## The events of a block

The events of a block are given as props, the name of the event is the name of the prop.

```tsx
<Rectangle
  width={100}
  height={100}
  onClick={() => setSelected(true)}
  onMouseEnter={() => setHovered(true)}
/>
```

| Prop            | The event of the block |
| --------------- | ---------------------- |
| `onClick`       | `click`                |
| `onDblClick`    | `dblclick`             |
| `onMouseDown`   | `mousedown`            |
| `onMouseUp`     | `mouseup`              |
| `onMouseMove`   | `mousemove`            |
| `onMouseEnter`  | `mouseenter`           |
| `onMouseLeave`  | `mouseleave`           |
| `onMouseOver`   | `mouseover`            |
| `onMouseOut`    | `mouseout`             |
| `onContextMenu` | `contextmenu`          |
| `onWheel`       | `wheel`                |

> [!NOTE] The handler is registered once
>
> The handler of an event is registered on the block when the component is mounted. A change of the handler does not register it again, the handler of the moment is the one that is called.

## A block of your own

A block of your own becomes a component with `makeBlockComponent`. There is no boilerplate, no context to wire up and no manual attachment to the scene.

```tsx
import { Block, makeBlockComponent } from '@2flexible/2flex-react';

interface ProgressBlockOptions extends BlockOptions {
  progress?: number;
  progressColor?: string;
}

class ProgressBlock extends Block<ProgressBlockOptions> {
  progress(value?: number) {
    return super.__valueHandler(value, 'progress', 0);
  }

  progressColor(value?: string) {
    return super.__valueHandler(value, 'progressColor', '#22c55e');
  }

  render() {
    super.render();
    const context = this.context;
    if (!context) return;
    context.fillStyle = this.progressColor();
    context.fillRect(0, 0, this.width() * this.progress(), this.height());
  }
}

const Progress = makeBlockComponent(ProgressBlock);
```

The component is used like every other one, and its own options are known by the type of its props.

```tsx
<Progress width={200} height={20} progress={0.65} progressColor="#22c55e" />
```

> [!NOTE] The name of the component
>
> The component is named after the class of the block, so it is `ProgressBlock` above. Give it a name of its own when the name of the class does not fit.

```tsx
const Progress = makeBlockComponent(ProgressBlock, 'Progress');
```

## Reaching the block

The component holds the instance of the block and passes it to a ref.

```tsx
const ref = useRef<RectangleBlock>(null);

<Rectangle ref={ref} width={100} height={100} />;

ref.current?.width();
```

> [!NOTE] The ref is filled after the mount
>
> The block is created in an effect of the component, so the ref holds the block once the component is on the screen.

## Reaching the canvas

The `useCanvas` hook returns the canvas of the component. It is the way to reach the parts of the library that react does not cover, the history and the export of the scene for example.

```tsx
import { Canvas, useCanvas } from '@2flexible/2flex-react';

function Controls() {
  const canvas = useCanvas();
  return (
    <button onClick={() => canvas.undo()}>Undo</button>
  );
}
```

The `onReady` prop of the `Canvas` component passes the canvas to a function as well, it is handy when the canvas is needed outside of the tree.

```tsx
<Canvas onReady={(canvas) => save(canvas.export())} />
```

> [!WARNING] The hook is used inside of the canvas
>
> `useCanvas` throws when it is called outside of a `Canvas` component, there is no canvas to return in that case.

## Strict mode

The bindings work in strict mode. The block is created when the component is mounted and it is dropped when the component is unmounted, so the scene holds one block for every component of the tree.

```tsx
<StrictMode>
  <Canvas width={600} height={400}>
    <Rectangle x={40} y={40} width={160} height={100} />
  </Canvas>
</StrictMode>
```

## Reference

- [Custom blocks](/docs/custom-blocks/) — the block of your own, without react.
- [Custom shape](/docs/custom-shape/) — the drawing of your own.
- [The block](/docs/the-block/) — the options every block understands.
- [The examples of the react bindings](../examples/2flex-react/README.md) — the scenes that are built with the components.
