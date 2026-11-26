import { definePlugin, defineRule } from 'vite-plus/lint/plugins'

// The public API of the package is made of blocks, but a handful of classes
// support them instead of being blocks themselves. They are listed here so
// the naming rules can tell them apart.
const SUPPORT_CLASSES = new Set([
    'Canvas',
    'CanvasDOMManager',
    'CanvasGrid',
    'CanvasScene',
    'DummyCanvas',
    'GridTile',
    'History',
    'Node',
    'RenderScheduler',
])

// The mixins are factories that return a class, they are named after the
// block they extend.
const MIXIN_CLASSES = new Set([
    'AnimationBlock',
    'DraggableBlock',
    'HotLineBlock',
    'OverflowBlock',
    'ResizableBlock',
    'RotatableBlock',
    'SelectableBlock',
])

// Every error the package reports is prefixed, so the origin of a message is
// recognizable in the console of an application that uses the library.
const ERROR_PREFIX = '[2flex]'

// The tests assert on the messages of the package, they are allowed to use
// messages without the prefix.
const isTestFile = (filename) =>
    typeof filename === 'string' &&
    (filename.includes('/tests/') || filename.endsWith('.test.ts'))

// `BlockConstructor` describes a constructor signature and `ResolvedValue`
// resolves to the type of a value, both need `any`.
const isTypesFile = (filename) =>
    typeof filename === 'string' && filename.endsWith('/types.ts')

const noEnum = defineRule({
    meta: {
        messages: {
            noEnum: 'Unexpected enum declaration. Use a string literal union type instead.',
        },
    },
    create(context) {
        return {
            TSEnumDeclaration(node) {
                context.report({ node, messageId: 'noEnum' })
            },
        }
    },
})

const noAccessModifiers = defineRule({
    meta: {
        messages: {
            noAccessModifiers:
                'Unexpected access modifier. Use a `#private` field or a `protected` convention instead.',
        },
    },
    create(context) {
        const report = (node) =>
            context.report({ node, messageId: 'noAccessModifiers' })

        return {
            ClassProperty(node) {
                if (node.accessibility) report(node)
            },
            MethodDefinition(node) {
                if (node.accessibility) report(node)
            },
            TSAbstractMethodDefinition(node) {
                if (node.accessibility) report(node)
            },
            PropertyDefinition(node) {
                if (node.accessibility) report(node)
            },
        }
    },
})

const requireBlockSuffix = defineRule({
    meta: {
        messages: {
            requireBlockSuffix:
                'Exported class "{{name}}" must end with "Block".',
        },
    },
    create(context) {
        return {
            ExportNamedDeclaration(node) {
                const declaration = node.declaration
                if (!declaration || declaration.type !== 'ClassDeclaration')
                    return
                const name = declaration.id?.name
                if (!name) return
                if (name.endsWith('Block')) return
                if (SUPPORT_CLASSES.has(name)) return
                if (MIXIN_CLASSES.has(name)) return
                context.report({
                    node: declaration.id,
                    messageId: 'requireBlockSuffix',
                    data: { name },
                })
            },
        }
    },
})

const requireOptionsSuffix = defineRule({
    meta: {
        messages: {
            requireOptionsSuffix:
                'Exported option type "{{name}}" must end with "Options".',
        },
    },
    create(context) {
        return {
            ExportNamedDeclaration(node) {
                const declaration = node.declaration
                if (!declaration) return
                const name = declaration.id?.name
                if (!name) return
                const isDeclaration =
                    declaration.type === 'TSInterfaceDeclaration' ||
                    declaration.type === 'TSTypeAliasDeclaration'
                if (!isDeclaration) return
                // an option bag is named after the options it holds, both the
                // singular and the plural form are recognized
                const isOptionBag =
                    name.endsWith('Options') || name.endsWith('Option')
                if (!isOptionBag) return
                if (name.endsWith('Options')) return
                context.report({
                    node: declaration.id,
                    messageId: 'requireOptionsSuffix',
                    data: { name },
                })
            },
        }
    },
})

const errorMessagePrefix = defineRule({
    meta: {
        messages: {
            errorMessagePrefix: 'Error message must start with "{{prefix}} ".',
        },
    },
    create(context) {
        if (isTestFile(context.filename)) return {}

        const check = (node) => {
            const argument = node.arguments?.[0]
            if (!argument) return
            // only literal messages are checked, a template literal can build
            // the message from a variable
            if (argument.type !== 'Literal') return
            if (typeof argument.value !== 'string') return
            if (argument.value.startsWith(ERROR_PREFIX)) return
            context.report({
                node: argument,
                messageId: 'errorMessagePrefix',
                data: { prefix: ERROR_PREFIX },
            })
        }

        return {
            ThrowStatement(node) {
                const argument = node.argument
                if (!argument) return
                if (argument.type !== 'NewExpression') return
                const callee = argument.callee
                if (callee.type !== 'Identifier') return
                if (!callee.name.endsWith('Error')) return
                check(argument)
            },
        }
    },
})

const noRestrictedAny = defineRule({
    meta: {
        messages: {
            noRestrictedAny:
                'Unexpected `any`. Use a concrete type or `unknown` instead.',
        },
    },
    create(context) {
        // the tests assert on the behaviour of the helpers and cast values on
        // purpose, the rule only applies to the library itself
        if (isTestFile(context.filename)) return {}
        if (isTypesFile(context.filename)) return {}

        // a mixin forwards its constructor arguments to the base class, the
        // rest parameter cannot be typed any other way
        const isMixinConstructor = (node) => {
            const source = context.sourceCode
            if (!source) return false
            // the parameter is a rest parameter named `args`, it is forwarded
            // to the base class unchanged
            let current = node
            for (let depth = 0; depth < 8 && current; depth++) {
                const parent = current.parent
                if (!parent) return false
                if (parent.type === 'RestElement') {
                    const before = source
                        .getText()
                        .slice(0, parent.range?.[0] ?? 0)
                    return /constructor\s*\(\s*$/.test(before)
                }
                current = parent
            }
            return false
        }

        return {
            TSAnyKeyword(node) {
                if (isMixinConstructor(node)) return
                context.report({ node, messageId: 'noRestrictedAny' })
            },
        }
    },
})

const noInternalImport = defineRule({
    meta: {
        messages: {
            noInternalImport:
                'Unexpected import of "{{source}}" inside the package. Use a relative path instead.',
        },
    },
    create(context) {
        // the tests import the package by name on purpose, they verify the
        // public api the way a consumer would use it
        if (isTestFile(context.filename)) return {}

        return {
            ImportDeclaration(node) {
                const source = node.source.value
                if (typeof source !== 'string') return
                if (!source.startsWith('@2flexible/2flex')) return
                context.report({
                    node: node.source,
                    messageId: 'noInternalImport',
                    data: { source },
                })
            },
        }
    },
})

const mixinOptionsNaming = defineRule({
    meta: {
        messages: {
            mixinOptionsNaming:
                'A mixin has to export an options interface named "I{{name}}Options".',
            mixinAccessors:
                'A mixin has to declare a non exported accessors interface named "{{name}}BlockAccessors".',
        },
    },
    create(context) {
        const filename = context.filename ?? ''
        if (!filename.includes('/mixins/')) return {}

        const mixinFile = filename.split('/').pop()?.replace(/\.ts$/, '') ?? ''
        // the mixin is named after the block it extends, the options
        // interface drops the "Block" part
        const mixinName = mixinFile.replace(/Block$/, '')
        const expectedOptions = `I${mixinName}Options`

        return {
            ExportNamedDeclaration(node) {
                const declaration = node.declaration
                if (!declaration) return
                if (declaration.type !== 'TSInterfaceDeclaration') return
                const name = declaration.id?.name
                if (!name) return
                // the options interface of a mixin has to be named after it
                if (name === expectedOptions) {
                    const heritage = declaration.extends ?? []
                    const extendsBaseOptions = heritage.some(
                        (entry) =>
                            entry.expression?.type === 'Identifier' &&
                            entry.expression.name === 'BaseBlockOptions'
                    )
                    if (!extendsBaseOptions)
                        context.report({
                            node: declaration.id,
                            messageId: 'mixinOptionsNaming',
                            data: { name: mixinName },
                        })
                    return
                }
                // any other exported interface is a naming violation, as long
                // as it looks like an options bag
                if (!name.endsWith('Options')) return
                context.report({
                    node: declaration.id,
                    messageId: 'mixinOptionsNaming',
                    data: { name: mixinName },
                })
            },
        }
    },
})

export default definePlugin({
    meta: {
        name: '2flex',
    },
    rules: {
        'no-enum': noEnum,
        'no-access-modifiers': noAccessModifiers,
        'require-block-suffix': requireBlockSuffix,
        'require-options-suffix': requireOptionsSuffix,
        'error-message-prefix': errorMessagePrefix,
        'no-restricted-any': noRestrictedAny,
        'no-internal-import': noInternalImport,
        'mixin-options-naming': mixinOptionsNaming,
    },
})
