/**
 * Scaffolds the standalone project of every example.
 *
 * The script writes the `package.json`, the `tsconfig.json` and the
 * `index.html` of an example, and it leaves the `src/main.ts` alone, so the
 * code of an example is never overwritten.
 */
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const examplesRoot = join(root, 'examples', '2flex')
const packageRoot = join(root, 'packages', '2flex')

/**
 * The description of an example, it is held in its `meta.json`.
 */
interface ExampleMeta {
    title: string
    description: string
}

const TSCONFIG = {
    compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'bundler',
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        types: ['vite/client'],
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
        noEmit: true,
        isolatedModules: true,
        skipLibCheck: true,
        verbatimModuleSyntax: true,
    },
    include: ['src'],
}

/**
 * Writes the files of the project of an example.
 *
 * @param dir - The folder of the example.
 * @param title - The title of the page of the example.
 * @param description - The sentence under the title of the page.
 */
async function scaffold(
    dir: string,
    title: string,
    description: string
): Promise<void> {
    const relativePackage = relative(dir, packageRoot).replaceAll('\\', '/')
    const name = dir.split('/').pop() ?? dir

    await mkdir(join(dir, 'src'), { recursive: true })

    await writeFile(
        join(dir, 'package.json'),
        JSON.stringify(
            {
                name: `2flex-example-${name}`,
                private: true,
                version: '0.0.0',
                type: 'module',
                description,
                scripts: {
                    dev: 'vite',
                    build: 'tsc --noEmit && vite build',
                    preview: 'vite preview',
                    typecheck: 'tsc --noEmit',
                },
                dependencies: {
                    '@2flexible/2flex': `file:${relativePackage}`,
                },
                devDependencies: {
                    typescript: '~5.8.3',
                    vite: '^6.0.0',
                },
            },
            null,
            4
        ) + '\n'
    )

    await writeFile(
        join(dir, 'tsconfig.json'),
        JSON.stringify(TSCONFIG, null, 4) + '\n'
    )

    await writeFile(
        join(dir, 'index.html'),
        `<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>2flex — ${title}</title>
        <style>
            body {
                margin: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 12px;
                padding: 24px;
                background: #0b0f19;
                color: #e5e7eb;
                font-family: system-ui, sans-serif;
            }

            canvas {
                border-radius: 8px;
                background: #111827;
            }

            p {
                margin: 0;
                font-size: 14px;
                color: #9ca3af;
            }
        </style>
    </head>
    <body>
        <canvas id="canvas" width="600" height="400"></canvas>
        <p>${description}</p>
        <script type="module" src="/src/main.ts"></script>
    </body>
</html>
`
    )
}

const sections = await readdir(examplesRoot, { withFileTypes: true })
for (const section of sections) {
    if (!section.isDirectory()) continue
    const sectionDir = join(examplesRoot, section.name)
    const examples = await readdir(sectionDir, { withFileTypes: true })
    for (const example of examples) {
        if (!example.isDirectory()) continue
        const dir = join(sectionDir, example.name)
        const meta = JSON.parse(
            await readFile(join(dir, 'meta.json'), 'utf8')
        ) as ExampleMeta
        await scaffold(dir, meta.title, meta.description)
        console.log('scaffolded', relative(root, dir))
    }
}
