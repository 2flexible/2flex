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
