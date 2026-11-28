/**
 * Adds the documentation to the options of an interface.
 *
 * The options of a block are read one after the other, the descriptions come
 * from a table so the source of the library stays the only place the
 * documentation lives.
 */
import { readFile, writeFile } from 'node:fs/promises'

interface OptionDoc {
    name: string
    description: string
}

/**
 * Writes the comment of an option.
 */
function comment(indent: string, description: string): string {
    return [
        `${indent}/**`,
        ...description
            .split('\n')
            .map((line) => (line ? `${indent} * ${line}` : `${indent} *`)),
        `${indent} */`,
    ].join('\n')
}

/**
 * Reads the descriptions of the options of an interface and writes them into
 * the source of the library.
 *
 * @param path - The path of the file to change.
 * @param interfaceName - The name of the interface.
 * @param docs - The description of every option.
 */
export async function documentOptions(
    path: string,
    interfaceName: string,
    docs: OptionDoc[]
): Promise<void> {
    const content = await readFile(path, 'utf8')

    const start = content.indexOf(`export interface ${interfaceName}`)

    if (start === -1) {
        throw new Error(`${interfaceName} was not found in ${path}`)
    }

    const open = content.indexOf('{', start)
    const close = content.indexOf('\n}', open)

    if (open === -1 || close === -1) {
        throw new Error(`The body of ${interfaceName} was not found`)
    }

    const body = content.slice(open + 1, close)

    // the options are written in the order they appear in the interface
    const sorted = [...docs].sort(
        (a, b) =>
            body.indexOf(`\n    ${a.name}?`) - body.indexOf(`\n    ${b.name}?`)
    )

    let updated = body

    for (const doc of sorted) {
        // the option is written as `name?: Type` or `name: Type`. The line
        // break after the option is kept, the last option of the interface
        // has none.
        const pattern = new RegExp(
            `(\\n)([ \\t]*)${doc.name}(\\??: [^\\n]*)(\\n|$)`
        )

        const match = updated.match(pattern)

        if (!match || match.index === undefined) {
            throw new Error(`The option ${doc.name} was not found`)
        }

        // the comment is written before the option
        const option = updated.slice(
            match.index + match[1].length + match[2].length,
            match.index + match[0].length - match[4].length
        )

        updated =
            updated.slice(0, match.index) +
            match[1] +
            comment(match[2], doc.description) +
            '\n' +
            match[2] +
            option +
            match[4] +
            updated.slice(match.index + match[0].length)
    }

    await writeFile(
        path,
        content.slice(0, open + 1) + updated + content.slice(close)
    )
}
