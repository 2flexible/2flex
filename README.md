<p align="center">
  <a href="https://2flexible.com/2flex" target="_blank" rel="noopener noreferrer">
    <img height="150" src="./assets/logo.svg" alt="2flex logo">
  </a>
</p>
<br/>
<p align="center">
  <a href="https://www.npmjs.com/package/@2flexible/2flex"><img src="https://img.shields.io/npm/v/@2flexible/2flex.svg" alt="npm package"></a>
  <a href="https://www.npmjs.com/package/@2flexible/2flex"><img src="https://img.shields.io/npm/dm/@2flexible/2flex" alt="npm downloads"></a>
  <a href="https://github.com/2flexible/2flex/graphs/contributors">
<img alt="GitHub contributors" src="https://img.shields.io/github/contributors/2flexible/2flex">
  </a>
</p>
<p align="center">
 <a href="https://2flexible.com/">Playground</a> | <a href="https://2flexible.com/docs/">Introduction</a> | <a href="https://2flexible.com/docs/install/">Installation</a> | <a href="https://2flexible.com/docs/the-block/">Guide</a> | <a href="https://2flexible.com/api/canvas/">API Docs</a> | <a href="https://x.com/2flexiible">𝕏</a>
</p>

# 2flex

Too flexible canvas library.

## Quick Start

Install the 2flex package:

```bash
npm i @2flexible/2flex
```

Initialize your canvas, then create a block to add your canvas. That’s it.

```ts
import { RectangleBlock, Canvas } from "@2flexible/2flex";

const initCanvas = new Canvas("canvas", 600, 400, {
    "background-color": "black",
});

const block = new RectangleBlock({
    x: 0,
    y: 0,
    width: 40,
    height: 40,
    backgroundColor: "red",
});

initCanvas.add(block);
```

## Examples

Every use case of the library has an example of its own. They live in the
[examples](./examples/2flex/README.md) folder, and each one is a project
that is started on its own.

```bash
cd examples/2flex/01-getting-started/first-scene
pnpm install
pnpm dev
```

## Contribute

See [contributing guide](https://github.com/2flexible/2flex/blob/main/CONTRIBUTING.md) to learn about contributing to 2flex.

## License

This content is released under the [MIT License](http://opensource.org/licenses/MIT).

## Change Log

[Releases](https://github.com/2flexible/2flex/releases)
