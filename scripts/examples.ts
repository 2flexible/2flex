/**
 * The examples of the repository.
 *
 * The examples live in a folder per package, the folder of the core library
 * holds the examples of the library, the folder of the react package holds
 * the examples of the react bindings. An example that holds a `meta.json` is
 * an example, a folder that holds examples is a section of them.
 */
import { readdir, readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export const examplesRoot = join(root, 'examples')

export interface ExampleMeta {
    title: string
    description: string
    /**
     * The kind of the example, it decides how the project of the example is
     * written. An example without it is a plain one.
     */
    kind?: 'react'
}

export interface Example {
    /**
     * The name of the package the example belongs to.
     */
    package: string
    /**
     * The name of the section of the example, it is the name of the example
     * when it does not belong to a section.
     */
    section: string
    /**
     * The name of the example.
     */
    name: string
    /**
     * The path of the folder of the example.
     */
    dir: string
    /**
     * The title of the example.
     */
    title: string
    /**
     * The description of the example.
     */
    description: string
    /**
     * The kind of the example.
     */
    kind?: 'react'
}

const metaOf = async (dir: string): Promise<ExampleMeta | null> => {
    try {
        const meta = await readFile(join(dir, 'meta.json'), 'utf8')
        return JSON.parse(meta) as ExampleMeta
    } catch {
        return null
    }
}

/**
 * Reads every example of the repository.
 */
export const readExamples = async (): Promise<Example[]> => {
    const examples: Example[] = []
    const packages = await readdir(examplesRoot, { withFileTypes: true })
    for (const packageEntry of packages) {
        if (!packageEntry.isDirectory()) continue
        const packageDir = join(examplesRoot, packageEntry.name)
        const entries = await readdir(packageDir, { withFileTypes: true })
        for (const entry of entries) {
            if (!entry.isDirectory()) continue
            const dir = join(packageDir, entry.name)
            const meta = await metaOf(dir)
            // a folder that holds a meta file is an example of its own
            if (meta) {
                examples.push({
                    package: packageEntry.name,
                    section: entry.name,
                    name: entry.name,
                    dir,
                    ...meta,
                })
                continue
            }
            // a folder that holds no meta file is a section of examples
            const sectionEntries = await readdir(dir, { withFileTypes: true })
            for (const sectionEntry of sectionEntries) {
                if (!sectionEntry.isDirectory()) continue
                const sectionDir = join(dir, sectionEntry.name)
                const sectionMeta = await metaOf(sectionDir)
                if (!sectionMeta) continue
                examples.push({
                    package: packageEntry.name,
                    section: entry.name,
                    name: sectionEntry.name,
                    dir: sectionDir,
                    ...sectionMeta,
                })
            }
        }
    }
    return examples
}
