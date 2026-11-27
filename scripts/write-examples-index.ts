/**
 * Writes the index of the examples.
 *
 * The index lists every example of the folders, it is read from the
 * `meta.json` of the examples, so it is always in sync with them.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const examplesRoot = join(root, 'examples', '2flex')

/**
 * The description of an example, it is held in its `meta.json`.
 */
interface ExampleMeta {
    title: string
    description: string
}

const sections = (await readdir(examplesRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name))

const lines = [
    '# The examples',
    '',
    'Every example is a project of its own. It is started from the folder of',
    'the example, and the library is used the way a consumer of the package',
    'uses it.',
    '',
    '```bash',
    'cd examples/2flex/01-getting-started/first-scene',
    'pnpm install',
    'pnpm dev',
    '```',
    '',
    'The scripts of every example are the same:',
    '',
    '| Script          | Action                                    |',
    '| --------------- | ----------------------------------------- |',
    '| `pnpm dev`      | Starts the dev server of the example      |',
    '| `pnpm build`    | Type-checks the code and builds it        |',
    '| `pnpm preview`  | Serves the built example                  |',
    '| `pnpm typecheck` | Type-checks the code without building it  |',
    '',
]

for (const section of sections) {
    const sectionDir = join(examplesRoot, section.name)
    const examples = (await readdir(sectionDir, { withFileTypes: true }))
        .filter((entry) => entry.isDirectory())
        .sort((a, b) => a.name.localeCompare(b.name))

    lines.push(`## ${section.name}`, '')
    lines.push(
        '| Example              | What it shows                            |'
    )
    lines.push(
        '| -------------------- | ---------------------------------------- |'
    )
    for (const example of examples) {
        const meta = JSON.parse(
            await readFile(join(sectionDir, example.name, 'meta.json'), 'utf8')
        ) as ExampleMeta
        lines.push(
            `| [${example.name}](${section.name}/${example.name}) | ${meta.description} |`
        )
    }
    lines.push('')
}

lines.push(
    '## The files of an example',
    '',
    '| File           | What it holds                                  |',
    '| -------------- | ---------------------------------------------- |',
    '| `index.html`   | The page, it holds the `canvas` element        |',
    '| `src/main.ts`  | The code of the example                        |',
    '| `meta.json`    | The title and the description of the example   |',
    '',
    'The folders of the examples are scaffolded by',
    '`scripts/scaffold-examples.ts`, it writes the files that are the same',
    'for every example and it leaves the code alone.',
    ''
)

await writeFile(join(examplesRoot, 'README.md'), lines.join('\n'))
console.log('the index was written')
