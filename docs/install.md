---
id: install
title: Installation
description: Install the 2flex package with npm, pnpm, yarn, or bun, then verify it renders.
---

2flex is published as a single package with no runtime dependencies.

<!-- ::start:tabs variant="package-manager" -->

```bash
npm install @2flexible/2flex
pnpm add @2flexible/2flex
yarn add @2flexible/2flex
bun add @2flexible/2flex
```

<!-- ::end:tabs -->

## Requirements

- **A browser with Canvas 2D support.** The library uses `OffscreenCanvas` for offscreen tile rendering and `Path2D` for hit testing. Every current browser supports both.
- **A `<canvas>` element in the document.** The library binds to an element by its `id`.
- **TypeScript 4.4 or newer** if you want the shipped type declarations. They are included in the package — there is no separate `@types` install.

> [!NOTE] No build step required
>
> The package ships ESM and CommonJS builds with type declarations attached. Import it and go.

## Importing

The package is ESM-first, with a CommonJS build for compatibility.

```javascript title="ESM"

```

```javascript title="CommonJS"
const { Canvas, RectangleBlock } = require('@2flexible/2flex');
```

You can import everything, or pull in only the blocks you need. Tree-shaking works because each class lives in its own module.

```typescript


```

## The canvas element

2flex does not create the `<canvas>` for you. You provide it, and the library takes it over: it sets the width and height attributes, applies the device pixel ratio, and attaches its own event listeners.

```html
<canvas id="scene" width="800" height="600"></canvas>
```

> [!WARNING] The id must match exactly
>
> The string you pass to `new Canvas(id, ...)` is the element's `id`. If it does not match, the library silently creates a new canvas element and appends it to the body — and your scene will render somewhere you are not looking.

If the element already exists in the document, 2flex will use it. If it does not, 2flex creates one with the given id and appends it to `<body>`.

## Verify the installation

Drop this into a page and you should see a blue rectangle in the top-left corner.

```html
<canvas id="scene" width="800" height="600"></canvas>

<script type="module">
  import { Canvas, RectangleBlock } from '@2flexible/2flex';

  const canvas = new Canvas('scene', 800, 600);

  canvas.add(
    new RectangleBlock({
      x: 40,
      y: 40,
      width: 160,
      height: 100,
      backgroundColor: 'blue',
    }),
  );
</script>
```

Nothing rendered? Work through these in order:

1. **Is the id right?** `new Canvas('scene', ...)` needs `<canvas id="scene">`. A mismatch is the most common cause.
2. **Did the canvas get focus?** Pan and zoom only work when the canvas has DOM focus. Click it once.
3. **Is the size zero?** `width` and `height` default to `0`. A block with no size renders nothing.
4. **Are you inside a component lifecycle?** Construct the `Canvas` after the element is in the DOM.

## Using it in a framework

2flex is framework-agnostic — it works with the DOM directly, with no adapter. The one rule is that the `<canvas>` element must exist before you construct the `Canvas`.

**React.** Construct in an effect, and clean up when the component unmounts:

```tsx



export function Scene() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = new Canvas(ref.current!.id, 800, 600);
    canvas.add(
      new RectangleBlock({
        x: 40,
        y: 40,
        width: 160,
        height: 100,
        backgroundColor: 'blue',
      }),
    );
    return () => {
      canvas.remove(...);
    };
  }, []);

  return <canvas id="scene" width={800} height={600} ref={ref} />;
}
```

> [!WARNING] React 18+ Strict Mode double-invokes effects
>
> In development, Strict Mode mounts, unmounts, and remounts your component. Construct the `Canvas` inside the effect rather than at module scope, or you will end up with two render loops fighting over the same element.

**Vue.** Use a `ref` on the template element and construct in `onMounted`:

```vue
<script setup>



const el = ref();

onMounted(() => {
  const canvas = new Canvas('scene', 800, 600);
  canvas.add(
    new RectangleBlock({
      x: 40,
      y: 40,
      width: 160,
      height: 100,
      backgroundColor: 'blue',
    }),
  );
});
</script>

<template>
  <canvas id="scene" width="800" height="600" ref="el" />
</template>
```

## TypeScript

The package ships its own declarations, so there is nothing extra to install and nothing to declare.

```json title="tsconfig.json"
{
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "bundler",
    "target": "ES2022"
  }
}
```

Every exported class takes a single options object. The option types are structural, so you can build them incrementally.

```typescript


type RectangleOptions = ConstructorParameters<typeof RectangleBlock>[0];

const options: RectangleOptions = {
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  backgroundColor: 'blue',
};

const block = new RectangleBlock(options);
```

> [!NOTE] Option interfaces are not exported
>
> `IBlockOptions`, `IShapeOptions`, `IRectangleOptions`, and the other option interfaces exist in the source, but the package's public entry point only exports the classes and the utility functions. Use `ConstructorParameters` to reach an option type when you need one for a variable annotation.

## Next steps

- [Your first scene](/docs/first-scene/) — build a working scene from scratch.
- [Coordinates](/docs/coordinates/) — the geometry model.
- [Building scenes](/docs/nesting/) — nesting blocks together.
