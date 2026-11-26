import { describe, it } from 'vite-plus/test'
import { RuleTester } from 'vite-plus/lint/plugins-dev'

import plugin from './2flex-rules.js'

RuleTester.describe = describe
RuleTester.it = it

const ruleTester = new RuleTester({
    languageOptions: { parserOptions: { lang: 'ts' } },
})

const rules = plugin.rules

ruleTester.run('2flex/no-enum', rules['no-enum'], {
    valid: ["export type Direction = 'normal' | 'reverse'", 'const value = 1'],
    invalid: [
        {
            name: 'an enum declaration',
            code: 'export enum Direction { Normal, Reverse }',
            errors: [{ messageId: 'noEnum' }],
        },
    ],
})

ruleTester.run('2flex/no-access-modifiers', rules['no-access-modifiers'], {
    valid: [
        'class A { #value = 1; get() { return this.#value } }',
        'class A { value = 1 }',
        'interface A { value: number }',
    ],
    invalid: [
        {
            name: 'a public class property',
            code: 'class A { public value = 1 }',
            errors: [{ messageId: 'noAccessModifiers' }],
        },
        {
            name: 'a private method',
            code: 'class A { private get() { return 1 } }',
            errors: [{ messageId: 'noAccessModifiers' }],
        },
    ],
})

ruleTester.run('2flex/require-block-suffix', rules['require-block-suffix'], {
    valid: [
        'export class RectangleBlock {}',
        'export class Block {}',
        'export class Canvas {}',
        'export class History {}',
        'export class Node {}',
        'export class GridTile {}',
        'export class RenderScheduler {}',
        'export class CanvasDOMManager {}',
        'export class DummyCanvas {}',
        'export class CanvasGrid {}',
        'export class CanvasScene {}',
        'class RectangleBlock {}',
    ],
    invalid: [
        {
            name: 'a class without the suffix',
            code: 'export class Rectangle {}',
            errors: [
                {
                    messageId: 'requireBlockSuffix',
                    data: { name: 'Rectangle' },
                },
            ],
        },
    ],
})

ruleTester.run('2flex/error-message-prefix', rules['error-message-prefix'], {
    valid: [
        "throw new TypeError('[2flex] Canvas.load() expected an object.')",
        "throw new Error('[2flex] boom')",
        'throw new TypeError(`[2flex] ${method} failed.`)',
    ],
    invalid: [
        {
            name: 'a message without the prefix',
            code: "throw new TypeError('expected an object')",
            errors: [{ messageId: 'errorMessagePrefix' }],
        },
    ],
})

ruleTester.run('2flex/no-internal-import', rules['no-internal-import'], {
    valid: [
        "import { Block } from './Block'",
        "import { Block } from '../BaseBlock'",
    ],
    invalid: [
        {
            name: 'a self reference to the package',
            code: "import { Block } from '@2flexible/2flex'",
            errors: [
                {
                    messageId: 'noInternalImport',
                    data: { source: '@2flexible/2flex' },
                },
            ],
        },
    ],
})

ruleTester.run('2flex/no-restricted-any', rules['no-restricted-any'], {
    valid: ['const value: unknown = 1', 'const value: string[] = []'],
    invalid: [
        {
            name: 'an explicit any',
            code: 'const value: any = 1',
            errors: [{ messageId: 'noRestrictedAny' }],
        },
    ],
})

ruleTester.run(
    '2flex/require-options-suffix',
    rules['require-options-suffix'],
    {
        valid: [
            'export interface BlockOptions { a: number }',
            'export type ShapeOptions = { b: number }',
            'export interface HotCornerArea { x: number }',
        ],
        invalid: [
            {
                name: 'an option interface without the plural suffix',
                code: 'export interface BlockOption { a: number }',
                errors: [
                    {
                        messageId: 'requireOptionsSuffix',
                        data: { name: 'BlockOption' },
                    },
                ],
            },
        ],
    }
)
