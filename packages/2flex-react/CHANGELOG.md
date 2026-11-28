# @2flexible/2flex-react

## 0.2.0

### Minor Changes

- 389d9ac: The first release of the react bindings of 2flex.

  ### The components

  - Added the `Canvas` component, which renders the `canvas` element and owns the canvas of the library. Every block that is rendered inside of it is added to the scene.
  - Added a component for every shape of the library: `Rectangle`, `Circle`, `Text`, `Line`, `Image`, `Video`, `Layout` and `Block`.
  - The props of a component are the options of its block, the name of an option can be written in camel case or in kebab case. The type of the props knows the options of the block, so a typo is caught by the compiler.
  - The events of a block are given as props, so `onClick` is the click of the block and `onMouseEnter` is the enter of the mouse into it.

  ### A block of your own

  - Added `makeBlockComponent()`, which turns a block of the library into a component of react. A custom block becomes a component with one call, the options of the block are the props of the component and they are typed.
  - Added the `useCanvas()` and the `useBlock()` hooks, they return the canvas of the component and the block the component is nested into.

### Patch Changes

- Updated dependencies [389d9ac]
  - @2flexible/2flex@1.2.2
