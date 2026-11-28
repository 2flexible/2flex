import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite-plus'
import { playwright } from 'vite-plus/test/browser-playwright'

export default defineConfig({
    // the package name resolves to the built `lib` output by default, which is
    // stale while developing, so tests are pointed at the sources instead
    resolve: {
        alias: {
            '@2flexible/2flex': fileURLToPath(
                new URL('../2flex/src/index.ts', import.meta.url)
            ),
            '@2flexible/2flex-react': fileURLToPath(
                new URL('./src/index.ts', import.meta.url)
            ),
        },
    },
    test: {
        // every worker runs a browser, the default of one worker per cpu
        // starts far more browsers than a machine can hold
        maxWorkers: 4,
        coverage: {
            enabled: false,
            provider: 'v8',
            include: ['src/**/*'],
            exclude: [
                'src/test/**',
                '**/node_modules/**',
                '**/dist/**',
                '**/tsbuild/**',
            ],
        },
        projects: [
            {
                // the bindings are tested in a real browser, the canvas of the
                // library needs a real rendering context
                extends: true,
                test: {
                    name: 'unit',
                    include: ['src/tests/unit/**/*.test.tsx'],
                    browser: {
                        enabled: true,
                        provider: playwright(),
                        instances: [{ browser: 'chromium' }],
                        headless: true,
                        screenshotFailures: false,
                    },
                },
            },
        ],
    },
    pack: {
        entry: ['src/index.ts'],
        sourcemap: true,
        clean: true,
        outDir: 'lib',
        dts: true,
        format: ['cjs', 'esm'],
        target: false,
        outExtensions: (context) => ({
            js: context.format === 'cjs' ? '.cjs' : '.js',
            dts: context.format === 'cjs' ? '.d.cts' : '.d.ts',
        }),
    },
})
