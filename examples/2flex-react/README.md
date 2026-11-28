# The examples of the react bindings

Every example is a project of its own. It is started from the folder of
the example, and the library is used the way a consumer of the package
uses it.

```bash
cd examples/2flex-react/shapes-as-components
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

## custom-block

| Example                      | What it shows                             |
| ---------------------------- | ----------------------------------------- |
| [custom-block](custom-block) | A block of your own, used as a component. |

## shapes-as-components

| Example                                      | What it shows                                |
| -------------------------------------------- | -------------------------------------------- |
| [shapes-as-components](shapes-as-components) | A scene that is built with react components. |

## The files of an example

| File          | What it holds                                |
| ------------- | -------------------------------------------- |
| `index.html`  | The page, it holds the `canvas` element      |
| `src/main.ts` | The code of the example                      |
| `meta.json`   | The title and the description of the example |

The folders of the examples are scaffolded by
`scripts/scaffold-examples.ts`, it writes the files that are the same
for every example and it leaves the code alone.
