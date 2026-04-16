import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
    test: {
        coverage: {
            enabled: false,
            provider: 'v8',
            include: ['src/**/*'],
            exclude: ['src/test/**'],
        },
        browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
            headless: true,
        },
        // environment: 'jsdom',
    },
})
