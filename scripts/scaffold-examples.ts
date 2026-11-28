/**
 * Scaffolds the standalone project of every example.
 *
 * The script writes the `package.json`, the `tsconfig.json` and the
 * `index.html` of an example, and it leaves the code of it alone, so the code
 * of an example is never overwritten.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readExamples, type ExampleMeta } from './examples.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const packageRoot = join(root, 'packages', '2flex')

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
 * The compiler options of a react example.
 *
 * A react example holds the jsx of the components, so the compiler needs to
 * know how the jsx is transformed.
 */
const REACT_COMPILER_OPTIONS = {
    ...TSCONFIG.compilerOptions,
    jsx: 'react-jsx',
}

const REACT_TSCONFIG = {
    compilerOptions: REACT_COMPILER_OPTIONS,
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
    description: string,
    kind?: ExampleMeta['kind'],
    prefix = '2flex'
): Promise<void> {
    const relativePackage = relative(dir, packageRoot).replaceAll('\\', '/')
    const name = dir.split('/').pop() ?? dir
    const isReact = kind === 'react'

    await mkdir(join(dir, 'src'), { recursive: true })

    await writeFile(
        join(dir, 'package.json'),
        JSON.stringify(
            {
                name: `${prefix}-example-${name}`,
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
                    ...(isReact
                        ? {
                              // the react package is a workspace project, a
                              // link to it always holds the build that is
                              // the newest one
                              '@2flexible/2flex-react': 'workspace:*',
                              react: '^19.3.1',
                              'react-dom': '^19.3.1',
                          }
                        : {}),
                },
                devDependencies: {
                    typescript: '~5.8.3',
                    vite: '^6.0.0',
                    ...(isReact
                        ? {
                              '@types/react': '^19.3.0',
                              '@types/react-dom': '^19.3.0',
                          }
                        : {}),
                },
            },
            null,
            4
        ) + '\n'
    )

    await writeFile(
        join(dir, 'tsconfig.json'),
        JSON.stringify(isReact ? REACT_TSCONFIG : TSCONFIG, null, 4) + '\n'
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
        ${
            isReact
                ? '<div id="root"></div>'
                : '<canvas id="canvas" width="600" height="400"></canvas>'
        }
        <p>${description}</p>
        <script type="module" src="/src/main.${isReact ? 'tsx' : 'ts'}"></script>
    </body>
</html>
`
    )
}

const examples = await readExamples()
for (const example of examples) {
    await scaffold(
        example.dir,
        example.title,
        example.description,
        example.kind,
        example.package
    )
    console.log('scaffolded', relative(root, example.dir))
}
