/**
 * Generates the API reference under `docs/api` from the TypeScript sources of
 * the package.
 *
 * The output is committed to the repository so the documentation site can
 * serve it without running TypeDoc itself. The `autofix` workflow
 * regenerates it on every push to `main`.
 *
 * Run it with `pnpm run generate-docs`.
 */
import { spawn } from 'node:child_process'
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
    Application,
    Converter,
    type DeclarationReflection,
    ReflectionKind,
    type ProjectReflection,
    type TypeDocOptions,
} from 'typedoc'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const root = resolve(__dirname, '..')
const packageDir = resolve(root, 'packages/2flex')
const outputDir = resolve(root, 'docs/api')

/**
 * The description of the pages that are written by hand.
 */
const descriptions: Record<string, string> = {
    Canvas: 'The rendering surface — construction, options, scene management, history, and viewport control.',
    Block: 'The base of every block — the options, the children, and the handling of the events.',
    LayoutBlock:
        'A container that places its children with flexbox or with a grid.',
    ShapeBlock:
        'A block that draws onto the canvas with the calls of the rendering context.',
    RectangleBlock:
        'A rectangle with a fill, an outline, and per-corner radii.',
    CircleBlock: 'A circle, an ellipse, an arc, or a pie slice.',
    TextBlock: 'Editable, wrappable text with full font control.',
    LineBlock: 'A straight or cubic Bézier line with editable control points.',
    ImageBlock: 'An image with object-fit, clipping, and tiling.',
    VideoBlock: 'Video playback drawn onto the canvas.',
    utils: 'The helper functions of the library — units, colors, easing, and geometry.',
}

/**
 * The name of the symbol every page documents.
 *
 * The pages are named after the slug of the symbol, the title of the page
 * holds the name of the symbol.
 */
const symbols: Record<string, string> = {
    block: 'Block',
    'block-options': 'BlockOptions',
    'block-options-of': 'BlockOptionsOf',
    canvas: 'Canvas',
    'canvas-options': 'CanvasOptions',
    'canvas-view': 'CanvasView',
    'circle-block': 'CircleBlock',
    'circle-block-options': 'CircleBlockOptions',
    'color-type': 'ColorType',
    'image-block': 'ImageBlock',
    'image-block-options': 'ImageBlockOptions',
    'layout-block': 'LayoutBlock',
    'layout-block-options': 'LayoutBlockOptions',
    'line-block': 'LineBlock',
    'line-block-options': 'LineBlockOptions',
    'option-accessor': 'OptionAccessor',
    'option-accessors': 'OptionAccessors',
    'option-accessors-with': 'OptionAccessorsWith',
    'own-option-accessors': 'OwnOptionAccessors',
    'rectangle-block': 'RectangleBlock',
    'rectangle-block-options': 'RectangleBlockOptions',
    'resolved-as': 'ResolvedAs',
    'resolved-value': 'ResolvedValue',
    'shape-block': 'ShapeBlock',
    'shape-block-options': 'ShapeBlockOptions',
    'text-block': 'TextBlock',
    'text-block-options': 'TextBlockOptions',
    'text-type': 'TextType',
    utils: 'utils',
    'video-block': 'VideoBlock',
    'video-block-options': 'VideoBlockOptions',
}

const slugs: Record<string, string> = {
    Canvas: 'canvas',
    Block: 'block',
    LayoutBlock: 'layout-block',
    ShapeBlock: 'shape-block',
    RectangleBlock: 'rectangle-block',
    CircleBlock: 'circle-block',
    TextBlock: 'text-block',
    LineBlock: 'line-block',
    ImageBlock: 'image-block',
    VideoBlock: 'video-block',
    MediaLayoutBlock: 'media-layout-block',
}

/**
 * The utility functions have no class to hang them on, so they are collected
 * on a single page.
 */
const utilsSlug = 'utils'

/**
 * The names of the exported utility functions.
 */
const utilityNames = new Set([
    'bezierEasing',
    'checkInBound',
    'clamp',
    'clampSize',
    'colorToRgba',
    'cubicBezier',
    'degreeToRadian',
    'extendBlock',
    'fromCm',
    'fromEm',
    'fromIn',
    'fromMm',
    'fromPc',
    'fromPercentage',
    'fromPt',
    'fromQ',
    'fromRem',
    'fromVH',
    'fromVW',
    'hexToRgba',
    'hslToRgba',
    'inRange',
    'lerp',
    'linear',
    'radianToDegree',
    'rotateCordinatesByRadian',
    'steps',
    'xIntersect',
    'yIntersect',
])

/**
 * The options of TypeDoc and of the markdown plugin.
 *
 * The plugin adds options of its own, they are not part of the type of
 * TypeDoc.
 */
type DocumentationOptions = TypeDocOptions & {
    /**
     * Writes the types of the properties as a block of code.
     */
    useCodeBlocks?: boolean
    /**
     * Writes the type of an object as the list of its properties.
     */
    expandObjects?: boolean
    /**
     * Writes the parameters of a function as a table.
     */
    parametersFormat?: 'table' | 'list'
}

const typedocOptions: DocumentationOptions = {
    // the entry point of the public API
    entryPoints: [resolve(packageDir, 'src/index.ts')],
    tsconfig: resolve(packageDir, 'tsconfig.json'),
    out: outputDir,
    // the tests are not part of the public API
    exclude: ['**/src/tests/**'],
    plugin: ['typedoc-plugin-markdown'],
    readme: 'none',
    // the links to the sources are not shown in the reference
    disableSources: true,
    // the internal names of the library must not leak into the documentation
    excludeInternal: true,
    excludePrivate: true,
    // a stable ordering keeps the diff of a regeneration small
    sort: ['source-order'],
    useCodeBlocks: true,
    expandObjects: true,
    parametersFormat: 'table',
    /**
     * Every block inherits more than two hundred accessors from `BaseBlock`.
     * Without this the same members would be repeated on all ten block
     * classes and the reference would grow to several megabytes. The members
     * are documented on the class that introduces them.
     */
    visibilityFilters: {
        protected: false,
        private: false,
        inherited: false,
        external: false,
    },
}

/**
 * Turns the name of a symbol into the slug of its page.
 */
function toSlug(name: string): string {
    return name
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
        .toLowerCase()
}

/**
 * The classes that keep the members they inherit.
 *
 * The blocks are built from mixin functions, so the members of `BaseBlock`
 * and of the mixins are inherited by every block. The members are documented
 * on the class that introduces them, except for `Block`, which is the page
 * that shows what every block has.
 */
const keepsInheritedMembers = new Set(['Block'])

/**
 * Removes the members a class inherits from one of its parents.
 *
 * Every block inherits more than two hundred accessors from `BaseBlock`.
 * Without this the same members would be repeated on all ten block classes
 * and the reference would grow to several megabytes. The members are
 * documented on the class that introduces them.
 */
function removeInheritedMembers(project: ProjectReflection): void {
    const classes = project.getReflectionsByKind(
        ReflectionKind.Class
    ) as DeclarationReflection[]
    /**
     * A member is inherited when it comes from a parent class. The blocks are
     * built from mixin functions, so the parent is not always a class the
     * documentation knows about.
     */
    const isInherited = (child: { inheritedFrom?: unknown }): boolean =>
        child.inheritedFrom !== undefined

    for (const reflection of classes) {
        if (keepsInheritedMembers.has(reflection.name)) {
            continue
        }

        reflection.children = reflection.children?.filter(
            (child) => !isInherited(child as { inheritedFrom?: unknown })
        )

        // the list of the children is cached, the groups are built from it
        reflection.childrenIncludingDocuments =
            reflection.childrenIncludingDocuments?.filter(
                (child) => !isInherited(child as { inheritedFrom?: unknown })
            )

        // the groups are cached as well, they have to be built again
        reflection.groups = undefined
    }
}

/**
 * Removes the list of the types that extend a type.
 *
 * The list is only a cross reference, every type has a page of its own.
 */
function removeExtendedBy(project: ProjectReflection): void {
    const types = project.getReflectionsByKind(
        ReflectionKind.ClassOrInterface
    ) as DeclarationReflection[]

    for (const reflection of types) {
        reflection.extendedBy = undefined
    }
}

/**
 * Removes the list of the parents of a type.
 *
 * The parents of a block are built from mixin functions, so the name of the
 * parent is the mixin written out in full. The parents of a type are left
 * out, the type itself is enough.
 */
function removeExtends(project: ProjectReflection): void {
    const types = project.getReflectionsByKind(
        ReflectionKind.ClassOrInterface
    ) as DeclarationReflection[]

    for (const reflection of types) {
        reflection.extendedTypes = undefined
        reflection.typeHierarchy = undefined
    }
}

/**
 * Removes the cross references of the members to the members they come from.
 *
 * The blocks are built from mixin functions, so the name of the parent of a
 * member is the mixin it comes from, written out in full. It reads like a
 * mistake, so the references are left out. The member itself is written on
 * the page of the class it belongs to.
 */
function removeInheritanceReferences(project: ProjectReflection): void {
    const reflections = project.getReflectionsByKind(
        ReflectionKind.ClassOrInterface
    ) as DeclarationReflection[]

    for (const reflection of reflections) {
        for (const child of reflection.children ?? []) {
            const declaration = child as DeclarationReflection

            declaration.inheritedFrom = undefined
            declaration.overwrites = undefined
            declaration.implementationOf = undefined

            /**
             * The methods and the accessors hold the references on their
             * signature, not on the member itself.
             */
            for (const signature of declaration.signatures ?? []) {
                signature.inheritedFrom = undefined
                signature.overwrites = undefined
                signature.implementationOf = undefined
            }
        }
    }
}

/**
 * Removes the header of a page and repairs the links.
 *
 * The plugin starts every page with the name of the package and a link to
 * the index of the package. The pages are written into a directory per kind
 * by the plugin, but they are flattened afterwards, so the links have to be
 * repaired.
 */
function cleanPage(content: string): string {
    const cleaned = content
        .replace(/^\[\*\*@2flexible\/2flex\*\*\]\([^)]*\)\n\n\*\*\*\n\n/, '')
        .replace(/^\[@2flexible\/2flex\]\([^)]*\) \/ [^\n]*\n\n/, '')
        .replace(
            /\]\(\.\.(?:classes|interfaces|functions|type-aliases|modules|enumerations)\//g,
            ']('
        )
        .replace(/\]\(\.\.\/README\.md\)/g, '](')
        .replace(/\]\(README\.md\)/g, '](')

    // the pages are named after the slug of the symbol, the links of the
    // plugin still hold the name of the symbol
    return cleaned.replace(
        /\]\((?:\.\.\/)?(?:(?:classes|interfaces|functions|type-aliases|modules|enumerations)\/)?([A-Za-z0-9]+)\.md/g,
        (_match, name: string) => `](${toSlug(name)}.md`
    )
}

/**
 * Writes the frontmatter of a page. The markdown plugin does not write any,
 * the documentation site reads the title and the description from it.
 */
async function writeFrontmatter(
    path: string,
    title: string,
    description: string,
    slug: string
): Promise<void> {
    const content = await readFile(path, 'utf8')
    const body = cleanPage(content)

    const frontmatter = [
        '---',
        `title: ${title}`,
        `description: ${description}`,
        `slug: ${slug}`,
        '---',
        '',
    ].join('\n')

    await writeFile(path, frontmatter + body)
}

/**
 * Removes the trailing whitespace the markdown plugin leaves behind. The
 * formatter of the repository would do the same, but the generated files are
 * written after the formatter has run.
 */
async function trimTrailingWhitespace(dir: string): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true })

    await Promise.all(
        entries.map(async (entry) => {
            const path = resolve(dir, entry.name)

            if (entry.isDirectory()) {
                await trimTrailingWhitespace(path)
                return
            }

            if (!entry.isFile() || !path.endsWith('.md')) {
                return
            }

            const markdown = await readFile(path, 'utf8')
            const trimmed = markdown.replace(/[ \t]+$/gm, '')

            if (trimmed !== markdown) {
                await writeFile(path, trimmed)
            }
        })
    )
}

/**
 * Formats the generated pages with the formatter of the repository.
 *
 * The workflow that regenerates the documentation runs the formatter over the
 * whole repository afterwards. If the formatter changed the generated pages,
 * the workflow would commit the changes and the next run would generate them
 * again. Formatting the pages here keeps the two in step.
 */
async function formatGeneratedPages(): Promise<void> {
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
 * Collects the utility functions on a single page.
 *
 * The functions are small helpers that belong together, the documentation
 * site has always shown them on one page.
 */
async function collectUtilityFunctions(): Promise<void> {
    const entries = await readdir(outputDir, { withFileTypes: true })

    const pages = entries.filter(
        (entry) => entry.isFile() && entry.name.endsWith('.md')
    )

    const parts: string[] = []

    for (const page of pages) {
        const name = page.name.replace(/\.md$/, '')

        if (!utilityNames.has(name)) {
            continue
        }

        parts.push(
            cleanPage(await readFile(resolve(outputDir, page.name), 'utf8'))
        )

        await rm(resolve(outputDir, page.name))
    }

    if (parts.length === 0) {
        return
    }

    await writeFile(resolve(outputDir, `${utilsSlug}.md`), parts.join('\n\n'))
}

async function generate(): Promise<void> {
    await rm(outputDir, { recursive: true, force: true })
    await mkdir(outputDir, { recursive: true })

    const app = await Application.bootstrapWithPlugins(typedocOptions)

    app.converter.on(Converter.EVENT_RESOLVE_END, (context) => {
        removeInheritedMembers(context.project)
        removeInheritanceReferences(context.project)
        removeExtendedBy(context.project)
        removeExtends(context.project)
    })

    const project = await app.convert()

    if (!project) {
        console.error(
            'Could not convert the sources to a documentation project'
        )
        process.exit(1)
    }

    await app.generateOutputs(project)

    // the pages are written into a directory per kind, the documentation site
    // expects a flat list of pages
    const kinds = await readdir(outputDir, { withFileTypes: true })

    for (const kind of kinds) {
        if (!kind.isDirectory()) {
            continue
        }

        const kindDir = resolve(outputDir, kind.name)
        const pages = await readdir(kindDir, { withFileTypes: true })

        for (const page of pages) {
            if (!page.isFile() || !page.name.endsWith('.md')) {
                continue
            }

            const name = page.name.replace(/\.md$/, '')

            await writeFile(
                resolve(outputDir, `${toSlug(name)}.md`),
                await readFile(resolve(kindDir, page.name), 'utf8')
            )
        }

        await rm(kindDir, { recursive: true, force: true })
    }

    // the index of the package lists every page, it is not a page itself
    await rm(resolve(outputDir, 'README.md'), { force: true })

    await collectUtilityFunctions()

    const written = await readdir(outputDir, { withFileTypes: true })

    for (const file of written) {
        if (!file.isFile() || !file.name.endsWith('.md')) {
            continue
        }

        const name = file.name.replace(/\.md$/, '')

        // the page is named after the slug, the title holds the name of the
        // symbol it documents
        const symbol = symbols[name] ?? name

        await writeFrontmatter(
            resolve(outputDir, file.name),
            symbol,
            descriptions[symbol] ??
                `The \`${symbol}\` API of the 2flex library.`,
            name
        )
    }

    await trimTrailingWhitespace(outputDir)
    await formatGeneratedPages()

    console.log(`\n✅ The API reference was written to ${outputDir}`)
}

await generate()
