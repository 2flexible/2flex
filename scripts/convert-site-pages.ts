/**
 * Converts the pages of the documentation site into the markdown of the
 * `docs` folder of the library.
 *
 * The pages of the site were written for the site, they hold components of
 * the site and links to the site. This script turns them into plain markdown
 * the library can serve.
 *
 * Run it with `node scripts/convert-site-pages.ts`.
 */
import { spawn } from 'node:child_process'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const root = resolve(__dirname, '..')
const siteDir = resolve(root, '../2flexible-new.com/src/content')
const outputDir = resolve(root, 'docs')

/**
 * The pages of the site that are converted.
 *
 * The second version of the documentation is the newer one, it is used when
 * both hold a page with the same name.
 */
const sources: string[] = ['docs-v2', 'docs']

/**
 * The name of the file of a page of the site, without the folder.
 */
function nameOf(id: string): string {
    return basename(id)
}

/**
 * Removes the components of the site from a page.
 */
function stripComponents(content: string): string {
    return (
        content
            // the callout of the site becomes an alert of github
            .replace(
                /<Callout(?:\s+type="(\w+)")?(?:\s+title="([^"]*)")?\s*>([\s\S]*?)<\/Callout>/g,
                (_match, type, title, body) => {
                    const kind = type === 'warning' ? 'WARNING' : 'NOTE'
                    const heading = title ? ` ${title}` : ''
                    return `> [!${kind}]${heading}\n>\n${body
                        .trim()
                        .split('\n')
                        .map((line: string) => `> ${line}`)
                        .join('\n')}`
                }
            )
            // the block of code of the site becomes a block of markdown
            .replace(
                /<CodeBlock\s+code=\{`([\s\S]*?)`\}\s*language="(\w+)"(?:\s+title="([^"]*)")?\s*\/>/g,
                (_match, code, language, title) => {
                    const heading = title ? ` title="${title}"` : ''
                    return `\`\`\`${language}${heading}\n${code}\n\`\`\``
                }
            )
            // the tabs of the package managers become a directive of the
            // documentation
            .replace(
                /<InstallTabs[^>]*package="([^"]*)"[^>]*\/>/g,
                (_match, pkg) =>
                    [
                        '<!-- ::start:tabs variant="package-manager" -->',
                        '',
                        `\`\`\`bash`,
                        `npm install ${pkg}`,
                        'pnpm add ' + pkg,
                        'yarn add ' + pkg,
                        'bun add ' + pkg,
                        '```',
                        '',
                        '<!-- ::end:tabs -->',
                    ].join('\n')
            )
            // the remaining components of the site are dropped
            .replace(/<\/?[A-Z][A-Za-z]*(\s[^>]*)?\/>/g, '')
            .replace(/<\/?[A-Z][A-Za-z]*(\s[^>]*)?>/g, '')
            // the imports of the site are dropped
            .replace(/^import .*$/gm, '')
    )
}

/**
 * Rewrites the links of a page so they point to the pages of the library.
 */
function rewriteLinks(content: string): string {
    return (
        content
            // the links to the index of the api point to the first page of it
            .replace(/\]\(\/api\/?\)/g, '](/api/canvas/)')
            .replace(/\]\(\/docs-v2\/([^)]*)\)/g, (_match, path) =>
                rewriteLink(path, '')
            )
            .replace(/\]\(\/docs\/([^)]*)\)/g, (_match, path) =>
                rewriteLink(path, '')
            )
            .replace(/\]\(\/api\/([^)]*)\)/g, (_match, path) =>
                rewriteLink(path, '/api')
            )
    )
}

/**
 * The pages of the site that were moved.
 *
 * The library holds the pages under a flat folder, the site held them in
 * folders. The links of the older pages are rewritten with this table.
 */
const moved: Record<string, string> = {
    'guide/the-block': 'the-block',
    'guide/positions': 'positioning',
    'guide/transformation': 'transform',
    'guide/responsibility': 'layout',
    'guide/events': 'events',
    'guide/animation': 'animation',
    'advanced/custom-block': 'custom-block',
    'advanced/custom-shape': 'custom-shape',
    'advanced/customization': 'customization',
    'advanced/canvas': 'canvas',
    'advanced/units-and-utilities': 'units-and-utilities',
    'documentation/introduction': 'introduction',
    installation: 'install',
    introduction: 'introduction',
    'documentation/installation': 'install',
    'documentation/guide/the-block': 'the-block',
    'documentation/guide/positions': 'positioning',
    'documentation/guide/transformation': 'transform',
    'documentation/guide/responsibility': 'layout',
    'documentation/guide/events': 'events',
    'documentation/guide/animation': 'animation',
    'documentation/shapes/rectangle': 'rectangle',
    'documentation/shapes/circle': 'circle',
    'documentation/shapes/text': 'text',
    'documentation/shapes/line': 'line',
    'documentation/shapes/image': 'image',
    'documentation/shapes/video': 'video',
    'documentation/advanced_features/canvas': 'canvas',
    'documentation/advanced_features/custom_block': 'custom-block',
    'documentation/advanced_features/custom_shape': 'custom-shape',
    'documentation/advanced_features/customization': 'customization',
    'documentation/advanced_features/more_of_blocks': 'custom-blocks',
}

/**
 * Rewrites a link of the site so it points to a page of the library.
 */
function rewriteLink(path: string, prefix: string): string {
    const [page, anchor] = path.split('#')

    // the pages of the api are named after the symbol they document
    if (prefix === '/api') {
        const name = page.replace(/\/$/, '')
        const slug = apiSlugs[name] ?? name

        return `](/api/${slug}${anchor ? `#${anchor}` : ''})`
    }

    // the trailing slash of the site is not part of the name of the page
    const name = page.replace(/\/$/, '')
    const target = moved[name] ?? name

    // the pages of the guides are served under `/docs`
    if (!target) {
        return '](/'
    }

    if (target.startsWith('api/')) {
        return `](/api/${target.slice(4)}/${anchor ? `#${anchor}` : ''})`
    }

    return `](/docs/${target}/${anchor ? `#${anchor}` : ''})`
}

/**
 * The slugs of the pages of the api.
 *
 * The site used a slug for every page, the library names the pages after the
 * symbol they document.
 */
const apiSlugs: Record<string, string> = {
    canvas: 'canvas',
    block: 'block',
    'base-block': 'base-block',
    'layout-block': 'layout-block',
    'shape-block': 'shape-block',
    'rectangle-block': 'rectangle-block',
    'circle-block': 'circle-block',
    'text-block': 'text-block',
    'line-block': 'line-block',
    'image-block': 'image-block',
    'video-block': 'video-block',
    utils: 'utils',
}

/**
 * Reads the frontmatter of a page.
 */
function readFrontmatter(content: string): {
    data: Record<string, string>
    body: string
} {
    if (!content.startsWith('---')) {
        return { data: {}, body: content }
    }

    const end = content.indexOf('\n---', 3)

    if (end === -1) {
        return { data: {}, body: content }
    }

    const header = content.slice(4, end)
    const body = content.slice(end + 4).replace(/^\n+/, '')

    const data: Record<string, string> = {}

    for (const line of header.split('\n')) {
        const match = line.match(/^(\w+):\s*(.*)$/)

        if (match) {
            data[match[1]] = match[2].trim()
        }
    }

    return { data, body }
}

/**
 * Writes the frontmatter of a page.
 */
function frontmatter(data: Record<string, string>): string {
    return [
        '---',
        `id: ${data.id ?? ''}`,
        `title: ${data.title ?? ''}`,
        `description: ${data.description ?? ''}`,
        '---',
        '',
    ].join('\n')
}

/**
 * Formats the pages with the formatter of the repository.
 *
 * The workflow that regenerates the documentation runs the formatter over the
 * whole repository afterwards. If the formatter changed the pages, the
 * workflow would commit the changes and the next run would write them again.
 * Formatting the pages here keeps the two in step.
 */
async function formatPages(): Promise<void> {
    await new Promise<void>((resolvePromise, rejectPromise) => {
        const child = spawn('npx', ['vp', 'fmt', '--write', outputDir], {
            cwd: root,
            stdio: 'inherit',
        })

        child.on('error', rejectPromise)

        child.on('close', (code) => {
            if (code === 0) {
                resolvePromise()
                return
            }

            rejectPromise(
                new Error(`The formatter failed with the code ${code}`)
            )
        })
    })
}

/**
 * Converts the pages of the site into the markdown of the library.
 */
async function main(): Promise<void> {
    const written = new Map<string, string>()

    for (const source of sources) {
        const dir = resolve(siteDir, source)

        let files: string[] = []

        try {
            files = (
                await readdir(dir, { recursive: true, withFileTypes: true })
            )
                .filter(
                    (entry) => entry.isFile() && entry.name.endsWith('.mdx')
                )
                .map((entry) => resolve(entry.parentPath, entry.name))
        } catch {
            continue
        }

        for (const file of files) {
            const content = await readFile(file, 'utf8')
            const { data, body } = readFrontmatter(content)

            const id = data.id ?? nameOf(file).replace(/\.mdx$/, '')
            const name = nameOf(id)

            // the newer version of a page wins, the older one is skipped
            if (written.has(name)) {
                continue
            }

            const page = frontmatter({
                id: name,
                title: data.title ?? name,
                description: data.description ?? '',
            })

            const markdown = rewriteLinks(stripComponents(body)).trim()

            const target = resolve(outputDir, `${name}.md`)

            await mkdir(dirname(target), { recursive: true })
            await writeFile(target, `${page}${markdown}\n`)

            written.set(name, target)
        }
    }

    await formatPages()

    console.log(`✅ Wrote ${written.size} pages to ${outputDir}`)
}

await main()
