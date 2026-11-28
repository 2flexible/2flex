/**
 * Writes the index of the examples.
 *
 * The index lists every example of the folders, it is read from the
 * `meta.json` of the examples, so it is always in sync with them.
 */
import { writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readExamples } from './examples.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const examples = await readExamples()
const packages = [...new Set(examples.map((example) => example.package))]

/**
 * The title of the index of a package and the example it starts from.
 */
const INDEXES: Record<string, { title: string; start: string }> = {
    '2flex': { title: 'The examples', start: '01-getting-started/first-scene' },
    '2flex-react': {
        title: 'The examples of the react bindings',
        start: 'shapes-as-components',
    },
}

for (const packageName of packages) {
    const ofPackage = examples.filter(
        (example) => example.package === packageName
    )
    const sections = [
        ...new Set(ofPackage.map((example) => example.section)),
    ].sort((a, b) => a.localeCompare(b))
    const packageDir = join(root, 'examples', packageName)
    const pathOf = (example: (typeof ofPackage)[number]) =>
        relative(packageDir, example.dir).replaceAll('\\', '/')

    const lines = [
        `# ${INDEXES[packageName].title}`,
        '',
        'Every example is a project of its own. It is started from the folder of',
        'the example, and the library is used the way a consumer of the package',
        'uses it.',
        '',
        '```bash',
        `cd examples/${packageName}/${INDEXES[packageName].start}`,
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
        const ofSection = ofPackage.filter(
            (example) => example.section === section
        )
        lines.push(`## ${section}`, '')
        lines.push(
            '| Example              | What it shows                            |'
        )
        lines.push(
            '| -------------------- | ---------------------------------------- |'
        )
        for (const example of ofSection) {
            lines.push(
                `| [${example.name}](${pathOf(example)}) | ${example.description} |`
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

    await writeFile(join(packageDir, 'README.md'), lines.join('\n'))
    console.log('the index was written', packageName)
}
