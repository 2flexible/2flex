/**
 * Verifies the examples of the repository.
 *
 * Every example is built and served, and it is opened in a browser. The
 * script checks that the example is drawn on its canvas and that it holds no
 * error, and it writes a screenshot of every example.
 *
 * Run it with:
 *
 * ```bash
 * pnpm run verify:examples
 * ```
 */
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { readdir, mkdir } from 'node:fs/promises'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as sleep } from 'node:timers/promises'

interface Painted {
    visible?: number
    tainted?: boolean
    error?: string
}

interface Failure {
    label: string
    problems: string[]
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const examplesRoot = join(root, 'examples', '2flex')
const shots = process.argv[2] ?? join(root, '.temp', 'example-shots')
const port = Number(process.argv[3] ?? 5300)

await mkdir(shots, { recursive: true })

const browser = await chromium.launch()
let portCursor = port
const failures: Failure[] = []

const sections = await readdir(examplesRoot, { withFileTypes: true })
for (const section of sections) {
    if (!section.isDirectory()) continue
    const examples = await readdir(join(examplesRoot, section.name), {
        withFileTypes: true,
    })
    for (const example of examples) {
        if (!example.isDirectory()) continue
        const dir = join(examplesRoot, section.name, example.name)
        const label = `${section.name}/${example.name}`

        const server = spawn(
            'npx',
            ['vite', 'preview', '--port', String(portCursor), '--strictPort'],
            { cwd: dir, stdio: 'ignore', detached: true }
        )
        const thisPort = portCursor++
        try {
            await sleep(2600)
            const page = await browser.newPage({
                viewport: { width: 900, height: 700 },
            })
            const errors: string[] = []
            page.on('console', (message) => {
                if (message.type() === 'error') errors.push(message.text())
            })
            page.on('pageerror', (error) => errors.push(error.message))
            await page.goto(`http://localhost:${thisPort}/`, {
                waitUntil: 'networkidle',
            })
            await page.waitForTimeout(1400)

            // the canvas is checked for the pixels that were drawn on it, a
            // canvas that holds a cross origin image cannot be read, so it is
            // left to the screenshot for it
            const painted: Painted = await page.evaluate(() => {
                const canvas = document.querySelector('canvas')
                if (!canvas) return { error: 'no canvas element' }
                const context = canvas.getContext('2d')
                if (!context) return { error: 'no 2d context' }
                try {
                    const data = context.getImageData(
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    )
                    let visible = 0
                    for (let i = 3; i < data.data.length; i += 4) {
                        if (data.data[i] > 0) visible++
                    }
                    return { visible, tainted: false }
                } catch {
                    // the canvas is tainted by a cross origin image
                    return { visible: -1, tainted: true }
                }
            })

            await page.screenshot({
                path: join(shots, `${section.name}--${example.name}.png`),
            })

            const problems: string[] = []
            if (errors.length) problems.push(`errors: ${errors.join(' | ')}`)
            if (painted.error) problems.push(painted.error)
            else if (!painted.tainted && painted.visible === 0)
                problems.push('nothing was painted on the canvas')

            if (problems.length) {
                failures.push({ label, problems })
                console.log(`FAIL ${label}: ${problems.join(' | ')}`)
            } else {
                console.log(`OK   ${label} (${painted.visible} px)`)
            }
            await page.close()
        } catch (error) {
            failures.push({ label, problems: [String(error)] })
            console.log(`FAIL ${label}: ${String(error)}`)
        } finally {
            // the server runs in its own group, so the whole group is killed
            // to leave no process behind
            if (server.pid !== undefined)
                try {
                    process.kill(-server.pid, 'SIGKILL')
                } catch {
                    // the server is already gone
                }
        }
    }
}

await browser.close()
console.log(`\n${failures.length} failed`)
process.exit(failures.length ? 1 : 0)
