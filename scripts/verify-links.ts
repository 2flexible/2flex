/**
 * Verifies the links of the documentation.
 *
 * Every link of a page has to point to a page that exists, the links to the
 * outside of the documentation are not checked. The script reads the pages of
 * the `docs` folder, the reference under `docs/api` is generated and checked
 * as well.
 *
 * The manifest of the navigation is checked against the schema of the
 * documentation, so a page that is not listed, or a field that does not
 * exist, is caught here.
 *
 * Run it with `pnpm run test:docs`.
 */
import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Ajv2020 } from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const root = resolve(__dirname, '..')
const docsDir = resolve(root, 'docs')
const configPath = resolve(docsDir, 'config.json')
const schemaPath = resolve(docsDir, 'config.schema.json')

/**
 * Checks the manifest of the navigation against the schema.
 *
 * The schema is the one of the repository, it is not fetched from the
 * outside, so the check works without a network connection.
 *
 * @returns The problems of the manifest, an empty list when it is valid.
 */
async function validateConfig(): Promise<string[]> {
    if (!existsSync(configPath)) {
        return ['The manifest of the navigation is missing']
    }

    if (!existsSync(schemaPath)) {
        return ['The schema of the manifest is missing']
    }

    let schema: unknown
    let config: unknown

    try {
        schema = JSON.parse(await readFile(schemaPath, 'utf8'))
    } catch (error) {
        return [`The schema of the manifest is not valid JSON: ${error}`]
    }

    try {
        config = JSON.parse(await readFile(configPath, 'utf8'))
    } catch (error) {
        return [`The manifest of the navigation is not valid JSON: ${error}`]
    }

    const ajv = new Ajv2020({ allErrors: true, strict: false })

    addFormats(ajv)

    const validate = ajv.compile(schema as object)

    if (validate(config)) {
        return []
    }

    return (validate.errors ?? []).map(
        (error) =>
            `${error.instancePath || '/'} ${error.message ?? 'is invalid'}`
    )
}

/**
 * Collects every markdown file of a folder.
 */
async function collectMarkdown(dir: string): Promise<string[]> {
    const entries = await readdir(dir, { withFileTypes: true })
    const files: string[] = []

    for (const entry of entries) {
        const path = resolve(dir, entry.name)

        if (entry.isDirectory()) {
            files.push(...(await collectMarkdown(path)))
            continue
        }

        if (entry.isFile() && entry.name.endsWith('.md')) {
            files.push(path)
        }
    }

    return files
}

/**
 * Removes the frontmatter of a page, the links of the frontmatter are not
 * checked.
 */
function stripFrontmatter(content: string): string {
    if (!content.startsWith('---')) {
        return content
    }

    const end = content.indexOf('\n---', 3)

    if (end === -1) {
        return content
    }

    return content.slice(end + 4)
}

/**
 * Collects the links of a page. The links of the code blocks are ignored, a
 * snippet can hold anything.
 */
function collectLinks(content: string): string[] {
    const links: string[] = []

    // the code blocks are removed, they are not part of the prose
    const prose = content.replace(/```[\s\S]*?```/g, '')

    for (const match of prose.matchAll(/\[[^\]]*\]\(([^)\s]+)/g)) {
        links.push(match[1])
    }

    return links
}

/**
 * Reads the routes of the documentation out of the manifest.
 *
 * The manifest maps the name of a page to the route it is served on. A link
 * of a page points to the route of the other page.
 */
async function readRoutes(): Promise<Set<string>> {
    const routes = new Set<string>()

    try {
        const manifest = JSON.parse(
            await readFile(resolve(docsDir, 'config.json'), 'utf8')
        )

        for (const section of manifest.sections ?? []) {
            for (const child of section.children ?? []) {
                const to = child.to

                // the pages of the guides are served under `/docs`, the pages
                // of the reference under `/api`
                if (to.startsWith('api/')) {
                    routes.add(`/api/${to.slice('api/'.length)}`)
                    continue
                }

                routes.add(`/docs/${to}`)
            }
        }
    } catch {
        // the manifest is not there, the links are checked against the files
    }

    return routes
}

/**
 * Checks whether a link points to a page of the documentation.
 */
function resolves(link: string, from: string, routes: Set<string>): boolean {
    // a link to the outside of the documentation
    if (
        link.startsWith('http://') ||
        link.startsWith('https://') ||
        link.startsWith('mailto:') ||
        link.startsWith('#')
    ) {
        return true
    }

    // the anchor of the link is not part of the path
    const path = link.split('#')[0]

    if (!path) {
        return true
    }

    // a link to a route of the documentation
    if (routes.has(path.replace(/\/$/, '')) || routes.has(path)) {
        return true
    }

    // the links of the pages are written relative to the page they are on
    const target = resolve(dirname(from), path)

    if (existsSync(target)) {
        return true
    }

    // a link to a page without the extension
    return existsSync(`${target}.md`)
}

async function main(): Promise<void> {
    if (!existsSync(docsDir)) {
        console.error('The docs folder does not exist')
        process.exit(1)
    }

    const problems = await validateConfig()

    if (problems.length > 0) {
        console.error(
            `\n❌ The manifest of the navigation does not match the schema:\n`
        )
        for (const problem of problems) {
            console.error(`   ${problem}`)
        }
        process.exit(1)
    }

    const files = await collectMarkdown(docsDir)
    const routes = await readRoutes()
    const broken: string[] = []

    /**
     * Every guide has to be listed in the manifest, a guide that is not
     * listed cannot be reached through the navigation.
     *
     * The pages of the reference are not checked, they are all served and
     * they are reached through the links of the other pages.
     */
    const listed = new Set<string>()

    for (const route of routes) {
        if (route.startsWith('/api/')) {
            continue
        }

        listed.add(route.replace('/docs/', ''))
    }

    for (const file of files) {
        const name = file.slice(docsDir.length + 1).replace(/\.md$/, '')

        if (name.startsWith('api/')) {
            continue
        }

        if (!listed.has(name)) {
            broken.push(`${file.slice(root.length + 1)} is not in the manifest`)
        }
    }

    for (const file of files) {
        const content = stripFrontmatter(await readFile(file, 'utf8'))

        for (const link of collectLinks(content)) {
            if (!resolves(link, file, routes)) {
                broken.push(`${file.slice(root.length + 1)} -> ${link}`)
            }
        }
    }

    if (broken.length > 0) {
        console.error(`\n❌ Found ${broken.length} broken links:\n`)
        for (const link of broken) {
            console.error(`   ${link}`)
        }
        process.exit(1)
    }

    console.log(`✅ Checked the links of ${files.length} pages`)
}

await main()
