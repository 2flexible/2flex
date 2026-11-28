import { defineConfig } from 'vite-plus'

export default defineConfig({
    lint: {
        plugins: [
            'eslint',
            'typescript',
            'unicorn',
            'oxc',
            'import',
            'vitest',
            'promise',
        ],
        jsPlugins: [
            { name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' },
            { name: '2flex', specifier: './lint/2flex-rules.js' },
        ],
        env: { browser: true, es2024: true },
        options: { typeAware: true, typeCheck: true },
        rules: {
            'vite-plus/prefer-vite-plus-imports': 'error',

            // project conventions, enforced by the local plugin
            '2flex/no-enum': 'error',
            '2flex/no-access-modifiers': 'error',
            '2flex/require-block-suffix': 'error',
            '2flex/require-options-suffix': 'error',
            '2flex/error-message-prefix': 'error',
            '2flex/no-restricted-any': 'error',
            '2flex/no-internal-import': 'error',
            '2flex/mixin-options-naming': 'error',

            // correctness
            eqeqeq: 'error',
            'no-var': 'error',
            'no-empty': 'error',
            'no-throw-literal': 'error',
            'no-useless-constructor': 'error',
            'no-else-return': 'error',
            radix: 'error',
            'prefer-const': 'error',

            // modules and types
            'import/no-duplicates': 'error',
            'import/consistent-type-specifier-style': [
                'error',
                'prefer-inline',
            ],
            'typescript/consistent-type-imports': [
                'error',
                {
                    prefer: 'type-imports',
                    fixStyle: 'inline-type-imports',
                },
            ],
            'typescript/consistent-type-exports': 'error',
            'typescript/no-explicit-any': 'error',
            'typescript/no-namespace': 'error',
            'typescript/no-wrapper-object-types': 'error',

            // modern javascript
            'unicorn/prefer-node-protocol': 'error',
            'unicorn/prefer-at': 'error',
            'unicorn/prefer-spread': 'error',
            'unicorn/no-new-array': 'error',
            'unicorn/prefer-string-starts-ends-with': 'error',
            'oxc/no-accumulating-spread': 'error',
            'oxc/no-map-spread': 'error',
            'promise/prefer-await-to-then': 'error',
            'promise/catch-or-return': 'error',
        },
        overrides: [
            {
                // a config file is loaded by the bundler and has to use a
                // default export
                files: ['**/vite.config.ts', '**/vite.config.js'],
                rules: { 'import/no-default-export': 'off' },
            },
            {
                files: ['packages/2flex/src/tests/**/*.ts'],
                rules: {
                    'vitest/no-focused-tests': 'error',
                    'vitest/no-disabled-tests': 'error',
                    'vitest/no-identical-title': 'error',
                    'vitest/no-standalone-expect': 'error',
                    'vitest/require-top-level-describe': 'error',
                    'vitest/consistent-test-it': 'error',
                    // the suites name the class under test in PascalCase
                    'vitest/prefer-lowercase-title': 'off',
                    // the tests assert on the behavior of loosely typed
                    // values and cast them on purpose
                    'typescript/no-explicit-any': 'off',
                },
            },
            {
                // the examples are meant to be read by a consumer of the
                // package, they import it by its name
                files: ['examples/**/*.ts', 'examples/**/*.tsx'],
                rules: { '2flex/no-internal-import': 'off' },
            },
            {
                // the mixins take their constructor arguments as a rest
                // parameter and forward them to the base class
                files: ['packages/2flex/src/mixins/**/*.ts'],
                rules: { 'typescript/no-explicit-any': 'off' },
            },
            {
                // `BlockConstructor` describes a constructor signature and
                // cannot be expressed without `any`
                files: ['packages/2flex/src/types.ts'],
                rules: { 'typescript/no-explicit-any': 'off' },
            },
            {
                // the react package is a separate package, it imports the
                // library by its name
                files: ['packages/2flex-react/src/**'],
                rules: { '2flex/no-internal-import': 'off' },
            },
            {
                // `BlockConstructor` describes a constructor signature and
                // cannot be expressed without `any`
                files: ['packages/2flex-react/src/types.ts'],
                rules: { 'typescript/no-explicit-any': 'off' },
            },
        ],
    },
    fmt: {
        trailingComma: 'es5',
        tabWidth: 4,
        semi: false,
        singleQuote: true,
        printWidth: 80,
        sortPackageJson: false,
        // the code blocks of the documentation are read by the users of the
        // package, they keep the style of the surrounding text
        embeddedLanguageFormatting: 'off',
        ignorePatterns: [
            '**/.nx/cache',
            '**/tsbuild',
            '**/lib',
            // the code of conduct is a legal document, it is kept as it was
            // written
            'CODE_OF_CONDUCT.md',
        ],
        overrides: [
            {
                // the workflows of github actions use the conventional
                // indentation of two spaces
                files: ['.github/**/*.yml', '.github/**/*.yaml'],
                options: { tabWidth: 2 },
            },
        ],
    },
    test: {
        projects: [
            {
                // the custom lint rules are tested with the rule tester, they
                // run in node because they do not touch the DOM
                extends: true,
                test: {
                    name: 'lint-rules',
                    include: ['lint/**/*.test.ts'],
                },
            },
        ],
    },
    staged: {
        '*': 'vp check --fix',
    },
})
