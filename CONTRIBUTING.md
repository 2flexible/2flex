# How to contribute

Thank you for taking the time to contribute to 2flex.

## Getting started

The repository is a monorepo that is managed with [pnpm](https://pnpm.io) and
[Nx](https://nx.dev). Install the dependencies once:

```bash
pnpm install
```

The library itself lives in `packages/2flex`. Run the checks of the whole
repository with:

```bash
pnpm run check
```

## The documentation

The documentation lives in the `docs` folder of this repository. The website
reads it from here, so a page is written once and is served everywhere.

| Folder     | What it holds                                        |
| ---------- | ---------------------------------------------------- |
| `docs`     | The guides, written by hand in markdown              |
| `docs/api` | The reference of the API, generated from the sources |

### Writing a page

A page is a markdown file with a frontmatter:

```markdown
---
id: my-page
title: My Page
description: A short sentence about the page, it is used in the search.
---

The body of the page.
```

The pages follow the conventions of the documentation:

- A note is written as an alert of GitHub: `> [!NOTE]`, `> [!WARNING]` or
  `> [!TIP]`.
- A block of code can hold a title: ` ```ts title="scene.ts" `.
- The tabs of the package managers are written as a directive:
  `<!-- ::start:tabs variant="package-manager" -->`.

### Adding the page to the navigation

Every page has to be listed in `docs/config.json`. The file holds the
sections of the sidebar, the tabs they belong to and the path of every page:

```json
{
    "sections": [
        {
            "label": "Guide",
            "tab": "guides",
            "children": [{ "label": "My Page", "to": "my-page" }]
        }
    ]
}
```

The `to` of a page is the path of its file without the extension. A page of
the reference uses the slug of the symbol it documents, for example
`api/canvas` for the file `docs/api/canvas.md`.

The file is checked against the schema of the documentation,
`docs/config.schema.json`, so only the fields of the schema are allowed and a
typo in a path is caught. The check runs with the rest of the documentation:

```bash
pnpm run test:docs
```

### The reference of the API

The pages under `docs/api` are generated from the sources of the library. They
are written by [TypeDoc](https://typedoc.org) and are committed to the
repository, so the website does not have to run it.

Regenerate them with:

```bash
pnpm run generate-docs
```

> **Do not change the files under `docs/api` by hand.** They are overwritten
> the next time the reference is generated. The text of a page comes from the
> comments of the sources, so the description of a class belongs into the
> doc comment of the class.

The `autofix` workflow regenerates the reference on every push to `main` and
commits the result. A pull request does not carry the regenerated files, they
are added by the workflow when the change is merged.

### Checking the links

The links of the documentation are checked with:

```bash
pnpm run test:docs
```

The check runs in the `ci` workflow as well.

## The examples

The examples live in the `examples/2flex` folder. Every use case of the
library has an example of its own, and every example is a project that is
started on its own, so it is written the way a consumer of the package
writes the code.

| Folder                       | What it holds                   |
| ---------------------------- | ------------------------------- |
| `examples/2flex/<group>`     | A group of examples             |
| `examples/2flex/<group>/<e>` | The project of a single example |

The files of an example:

| File          | What it holds                                |
| ------------- | -------------------------------------------- |
| `index.html`  | The page, it holds the `canvas` element      |
| `src/main.ts` | The code of the example                      |
| `meta.json`   | The title and the description of the example |

An example is started from its own folder:

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

### Adding an example

The files that are the same for every example are written by a script, so
they are not copied by hand. The folder of the example and its `meta.json`
are written first, then the script fills the rest:

```bash
pnpm run scaffold-examples
```

The index of the examples is written from the `meta.json` of the examples,
so it stays in sync with them:

```bash
pnpm run write-examples-index
```

### Checking the examples

Every example is built, served and opened in a browser, the script checks that
it is drawn on its canvas and that it holds no error:

```bash
pnpm run verify:examples
```

## Writing the code

The code is formatted and linted by [Vite+](https://viteplus.dev). Run the
checks with:

```bash
pnpm run check
```

The formatter can be run on its own with `pnpm run format`, the linter with
`pnpm run lint`.

## Committing

The changes are published with [changesets](https://github.com/changesets/changesets). Add a changeset for every change that is visible to the users of the library:

```bash
pnpm run changeset
```

A changeset holds a short sentence about the change and the kind of it, a
patch, a minor or a major version.
