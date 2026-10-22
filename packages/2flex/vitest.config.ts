import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
    // the package name resolves to the built `lib` output by default, which is
    // stale while developing, so tests are pointed at the sources instead
    resolve: {
        alias: {
            '@2flexible/2flex': fileURLToPath(
                new URL('./src/index.ts', import.meta.url)
            ),
        },
    },
    test: {
        include: ['src/tests/unit/**/*.test.ts'],
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
        browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
            headless: true,
            screenshotFailures: false,
        },
        // environment: 'jsdom',
    },
})
