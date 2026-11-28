# The examples

Every example is a project of its own. It is started from the folder of
the example, and the library is used the way a consumer of the package
uses it.

```bash
cd examples/2flex/01-getting-started/first-scene
pnpm install
pnpm dev
```

The scripts of every example are the same:

| Script           | Action                                   |
| ---------------- | ---------------------------------------- |
| `pnpm dev`       | Starts the dev server of the example     |
| `pnpm build`     | Type-checks the code and builds it       |
| `pnpm preview`   | Serves the built example                 |
| `pnpm typecheck` | Type-checks the code without building it |

## 01-getting-started

| Example                                                       | What it shows                                           |
| ------------------------------------------------------------- | ------------------------------------------------------- |
| [canvas-options](01-getting-started/canvas-options)           | The options of the canvas and the style of the element. |
| [first-scene](01-getting-started/first-scene)                 | A canvas and a red rectangle.                           |
| [units-and-utilities](01-getting-started/units-and-utilities) | The relative units and the helpers of the library.      |

## 02-blocks

| Example                                    | What it shows                                          |
| ------------------------------------------ | ------------------------------------------------------ |
| [block-basics](02-blocks/block-basics)     | Reading, writing and replacing the options of a block. |
| [box-model](02-blocks/box-model)           | The padding and the margin of a block.                 |
| [custom-block](02-blocks/custom-block)     | A block of your own, with options of your own.         |
| [custom-drawing](02-blocks/custom-drawing) | Drawing on the canvas with the context of a block.     |
| [nesting](02-blocks/nesting)               | A block that holds other blocks.                       |
| [positioning](02-blocks/positioning)       | The ways a block is placed on the canvas.              |
| [sizing](02-blocks/sizing)                 | The size of a block and its limits.                    |
| [transform](02-blocks/transform)           | Rotation, flipping and scaling of a block.             |
| [visibility](02-blocks/visibility)         | Hiding a block and stacking the blocks.                |

## 03-layout

| Example                              | What it shows                                 |
| ------------------------------------ | --------------------------------------------- |
| [flex-layout](03-layout/flex-layout) | Placing the children of a block with flexbox. |
| [grid-layout](03-layout/grid-layout) | Placing the children of a block with a grid.  |

## 04-shapes

| Example                          | What it shows                                            |
| -------------------------------- | -------------------------------------------------------- |
| [circle](04-shapes/circle)       | A circle, an arc or a donut.                             |
| [image](04-shapes/image)         | An image that is drawn onto the canvas.                  |
| [line](04-shapes/line)           | A straight or a curved line with its control points.     |
| [rectangle](04-shapes/rectangle) | A rectangle with a fill, an outline and rounded corners. |
| [text](04-shapes/text)           | Text that is drawn, wrapped and edited on the canvas.    |
| [video](04-shapes/video)         | A video that is played onto the canvas.                  |

## 05-interaction

| Example                                 | What it shows                                   |
| --------------------------------------- | ----------------------------------------------- |
| [draggable](05-interaction/draggable)   | Moving a block with the pointer.                |
| [events](05-interaction/events)         | The handlers of the mouse and the keyboard.     |
| [hot-lines](05-interaction/hot-lines)   | The outline that is drawn around a block.       |
| [overflow](05-interaction/overflow)     | Clipping and scrolling the children of a block. |
| [resizable](05-interaction/resizable)   | Resizing a block with its handles.              |
| [rotatable](05-interaction/rotatable)   | Rotating a block with its corners.              |
| [selectable](05-interaction/selectable) | Selecting a block with the pointer.             |

## 06-animation

| Example                                           | What it shows                                  |
| ------------------------------------------------- | ---------------------------------------------- |
| [keyframes](06-animation/keyframes)               | Animating the options of a block.              |
| [playback-control](06-animation/playback-control) | Starting, stopping and reversing an animation. |

## 07-canvas

| Example                              | What it shows                                  |
| ------------------------------------ | ---------------------------------------------- |
| [history](07-canvas/history)         | Undoing the actions and saving the scene.      |
| [scene-query](07-canvas/scene-query) | Finding the blocks of the scene.               |
| [viewport](07-canvas/viewport)       | Moving and zooming the viewport of the canvas. |

## The files of an example

| File          | What it holds                                |
| ------------- | -------------------------------------------- |
| `index.html`  | The page, it holds the `canvas` element      |
| `src/main.ts` | The code of the example                      |
| `meta.json`   | The title and the description of the example |

The folders of the examples are scaffolded by
`scripts/scaffold-examples.ts`, it writes the files that are the same
for every example and it leaves the code alone.
