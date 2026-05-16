import { describe, it, expect, vi, beforeEach } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { Block, Canvas } from '@2flexible/2flex'
import { checkInBound, getPrototype } from '../../Utils'

let block: Block<any>
let canvas: Canvas

const blockOptions = {
    // ── Identity ───
    name: { value: 'myBlock', default: undefined },
    onRender: { value: () => {}, default: undefined },

    // ── Geometry ───
    x: { value: 120, default: 0 },
    y: { value: 75, default: 0 },
    width: { value: 240, default: 0 },
    height: { value: 160, default: 0 },
    minWidth: { value: 40, default: 0 },
    minHeight: { value: 30, default: 0 },
    maxWidth: { value: 600, default: 0 },
    maxHeight: { value: 400, default: 0 },

    // ── Positioning ──
    position: { value: 'absolute', default: undefined },
    top: { value: 20, default: undefined },
    bottom: { value: 10, default: undefined },
    left: { value: 15, default: undefined },
    right: { value: 25, default: undefined },

    // ── Interaction ───
    selectable: { value: true, default: false },

    // ── Padding ──
    padding: { value: [8, 16, 8, 16], default: [] },
    paddingTop: { value: 12, default: 0 },
    paddingRight: { value: 20, default: 0 },
    paddingBottom: { value: 12, default: 0 },
    paddingLeft: { value: 20, default: 0 },

    // ── Margin ──
    margin: { value: [4, 8, 4, 8], default: [] },
    marginTop: { value: 6, default: 0 },
    marginRight: { value: 10, default: 0 },
    marginBottom: { value: 6, default: 0 },
    marginLeft: { value: 10, default: 0 },

    // ── Stacking ──
    zIndex: { value: 3, default: undefined },

    // ── Drag ──
    draggable: { value: true, default: false },
    onDrag: { value: (event: MouseEvent) => {}, default: undefined },
    dragX: { value: true, default: true },
    dragY: { value: false, default: true },

    // ── Rotation ──
    rotate: { value: 0.45, default: 0 },
    rotatable: { value: true, default: false },
    onRotate: { value: (event: MouseEvent) => {}, default: undefined },
    rotationCenterX: { value: 120, default: 0 },
    rotationCenterY: { value: 80, default: 0 },

    // ── Layout order / flex ───
    order: { value: 2, default: undefined },
    flexBasis: { value: 150, default: 'auto' },

    // ── Resize ──
    resizable: { value: true, default: false },
    onResize: { value: (event: MouseEvent) => {}, default: undefined },
    resizeTopLeft: { value: true, default: true },
    resizeTopRight: { value: false, default: true },
    resizeBottomLeft: { value: true, default: true },
    resizeBottomRight: { value: false, default: true },
    resizeTop: { value: true, default: true },
    resizeRight: { value: false, default: true },
    resizeBottom: { value: true, default: true },
    resizeLeft: { value: false, default: true },
    horizontalFlipResize: { value: true, default: false },
    verticalFlipResize: { value: false, default: false },

    // ── Visibility ──
    hidden: { value: false, default: false },

    // ── Important override ──
    important: { value: { x: 50, y: 50 }, default: {} },

    // ── Hot area gap ──
    hotAreaGap: { value: 4, default: 0 },

    // ── Hot corners ──
    hotCornerSize: { value: 8, default: 5 },
    hotCornerRadius: { value: [3], default: [0] },
    hotCornerStrokeWidth: { value: 2, default: 0 },
    hotCornerStrokeColor: {
        value: 'rgba(59, 130, 246, 1)',
        default: 'rgba(0, 0, 255, 1)',
    },
    hotCornerBackgroundColor: {
        value: 'rgba(240, 249, 255, 1)',
        default: 'rgba(255, 255, 255, 1)',
    },

    // ── Hot lines ──
    hotLineStrokeWidth: { value: 2.5, default: 1.5 },
    hotLineStrokeColor: {
        value: 'rgba(99, 102, 241, 1)',
        default: 'rgba(0, 0, 255, 1)',
    },

    // ── Rotation corner flags ──
    rotationTopLeft: { value: true, default: true },
    rotationTopRight: { value: false, default: true },
    rotationBottomLeft: { value: true, default: true },
    rotationBottomRight: { value: false, default: true },

    // ── Corner coordinates ──
    cornerTopLeft: { value: { x: 0, y: 0 }, default: { x: 0, y: 0 } },
    cornerTopRight: { value: { x: 240, y: 0 }, default: { x: 0, y: 0 } },
    cornerBottomLeft: { value: { x: 0, y: 160 }, default: { x: 0, y: 0 } },
    cornerBottomRight: { value: { x: 240, y: 160 }, default: { x: 0, y: 0 } },

    // ── Hot corner coordinates ──
    hotCornerTopLeft: { value: { x: 2, y: 2 }, default: { x: 0, y: 0 } },
    hotCornerTopRight: { value: { x: 238, y: 2 }, default: { x: 0, y: 0 } },
    hotCornerBottomLeft: { value: { x: 2, y: 158 }, default: { x: 0, y: 0 } },
    hotCornerBottomRight: {
        value: { x: 238, y: 158 },
        default: { x: 0, y: 0 },
    },

    // ── Hot rotation corner coordinates ──
    hotRotCornerTopLeft: { value: { x: -8, y: -8 }, default: { x: 0, y: 0 } },
    hotRotCornerTopRight: { value: { x: 248, y: -8 }, default: { x: 0, y: 0 } },
    hotRotCornerBottomLeft: {
        value: { x: -8, y: 168 },
        default: { x: 0, y: 0 },
    },
    hotRotCornerBottomRight: {
        value: { x: 248, y: 168 },
        default: { x: 0, y: 0 },
    },

    // ── Hot rotatable areas (HotCornerArea) ──
    hotRotatableAreaTopLeft: {
        value: {
            topLeft: { x: -12, y: -12 },
            topRight: { x: 0, y: -12 },
            bottomLeft: { x: -12, y: 0 },
            bottomRight: { x: 0, y: 0 },
        },
        default: {
            topLeft: { x: 0, y: 0 },
            topRight: { x: 0, y: 0 },
            bottomLeft: { x: 0, y: 0 },
            bottomRight: { x: 0, y: 0 },
        },
    },
    hotRotatableAreaTopRight: {
        value: {
            topLeft: { x: 240, y: -12 },
            topRight: { x: 252, y: -12 },
            bottomLeft: { x: 240, y: 0 },
            bottomRight: { x: 252, y: 0 },
        },
        default: {
            topLeft: { x: 0, y: 0 },
            topRight: { x: 0, y: 0 },
            bottomLeft: { x: 0, y: 0 },
            bottomRight: { x: 0, y: 0 },
        },
    },
    hotRotatableAreaBottomLeft: {
        value: {
            topLeft: { x: -12, y: 160 },
            topRight: { x: 0, y: 160 },
            bottomLeft: { x: -12, y: 172 },
            bottomRight: { x: 0, y: 172 },
        },
        default: {
            topLeft: { x: 0, y: 0 },
            topRight: { x: 0, y: 0 },
            bottomLeft: { x: 0, y: 0 },
            bottomRight: { x: 0, y: 0 },
        },
    },
    hotRotatableAreaBottomRight: {
        value: {
            topLeft: { x: 240, y: 160 },
            topRight: { x: 252, y: 160 },
            bottomLeft: { x: 240, y: 172 },
            bottomRight: { x: 252, y: 172 },
        },
        default: {
            topLeft: { x: 0, y: 0 },
            topRight: { x: 0, y: 0 },
            bottomLeft: { x: 0, y: 0 },
            bottomRight: { x: 0, y: 0 },
        },
    },

    // ── Hot resizable areas – corners (HotCornerArea) ──
    hotResizableAreaTopLeft: {
        value: {
            topLeft: { x: -5, y: -5 },
            topRight: { x: 5, y: -5 },
            bottomLeft: { x: -5, y: 5 },
            bottomRight: { x: 5, y: 5 },
        },
        default: {
            topLeft: { x: 0, y: 0 },
            topRight: { x: 0, y: 0 },
            bottomLeft: { x: 0, y: 0 },
            bottomRight: { x: 0, y: 0 },
        },
    },
    hotResizableAreaTopRight: {
        value: {
            topLeft: { x: 235, y: -5 },
            topRight: { x: 245, y: -5 },
            bottomLeft: { x: 235, y: 5 },
            bottomRight: { x: 245, y: 5 },
        },
        default: {
            topLeft: { x: 0, y: 0 },
            topRight: { x: 0, y: 0 },
            bottomLeft: { x: 0, y: 0 },
            bottomRight: { x: 0, y: 0 },
        },
    },
    hotResizableAreaBottomLeft: {
        value: {
            topLeft: { x: -5, y: 155 },
            topRight: { x: 5, y: 155 },
            bottomLeft: { x: -5, y: 165 },
            bottomRight: { x: 5, y: 165 },
        },
        default: {
            topLeft: { x: 0, y: 0 },
            topRight: { x: 0, y: 0 },
            bottomLeft: { x: 0, y: 0 },
            bottomRight: { x: 0, y: 0 },
        },
    },
    hotResizableAreaBottomRight: {
        value: {
            topLeft: { x: 235, y: 155 },
            topRight: { x: 245, y: 155 },
            bottomLeft: { x: 235, y: 165 },
            bottomRight: { x: 245, y: 165 },
        },
        default: {
            topLeft: { x: 0, y: 0 },
            topRight: { x: 0, y: 0 },
            bottomLeft: { x: 0, y: 0 },
            bottomRight: { x: 0, y: 0 },
        },
    },

    // ── Hot resizable areas – edges (HotCornerArea) ──
    hotResizableAreaTop: {
        value: {
            topLeft: { x: 5, y: -5 },
            topRight: { x: 235, y: -5 },
            bottomLeft: { x: 5, y: 5 },
            bottomRight: { x: 235, y: 5 },
        },
        default: {
            topLeft: { x: 0, y: 0 },
            topRight: { x: 0, y: 0 },
            bottomLeft: { x: 0, y: 0 },
            bottomRight: { x: 0, y: 0 },
        },
    },
    hotResizableAreaRight: {
        value: {
            topLeft: { x: 235, y: 5 },
            topRight: { x: 245, y: 5 },
            bottomLeft: { x: 235, y: 155 },
            bottomRight: { x: 245, y: 155 },
        },
        default: {
            topLeft: { x: 0, y: 0 },
            topRight: { x: 0, y: 0 },
            bottomLeft: { x: 0, y: 0 },
            bottomRight: { x: 0, y: 0 },
        },
    },
    hotResizableAreaBottom: {
        value: {
            topLeft: { x: 5, y: 155 },
            topRight: { x: 235, y: 155 },
            bottomLeft: { x: 5, y: 165 },
            bottomRight: { x: 235, y: 165 },
        },
        default: {
            topLeft: { x: 0, y: 0 },
            topRight: { x: 0, y: 0 },
            bottomLeft: { x: 0, y: 0 },
            bottomRight: { x: 0, y: 0 },
        },
    },
    hotResizableAreaLeft: {
        value: {
            topLeft: { x: -5, y: 5 },
            topRight: { x: 5, y: 5 },
            bottomLeft: { x: -5, y: 155 },
            bottomRight: { x: 5, y: 155 },
        },
        default: {
            topLeft: { x: 0, y: 0 },
            topRight: { x: 0, y: 0 },
            bottomLeft: { x: 0, y: 0 },
            bottomRight: { x: 0, y: 0 },
        },
    },
}
beforeEach(() => {
    block = new Block({})
})
describe('Block', () => {
    describe('Constructor', () => {
        it('creates a Block instance', () => {
            expect(block).toBeDefined()
        })
        it('should not throw when creating a Block with options', () => {
            expect(
                () => new Block({ x: 100, y: 100, width: 300, height: 500 })
            ).not.toThrow()
        })
    })
    describe('Handling option values', () => {
        beforeEach(() => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                x: 20,
                y: 10,
                width: 100,
                height: 100,
                important: { y: 50 },
            })
        })
        it('should valueHandler get default when value is undefined', () => {
            expect(block.__valueHandler(undefined, 'customValue', 0)).toBe(0)
        })
        it('should valueHandler convert px to number', () => {
            expect(block.__valueHandler('20px', 'customValue', 0, true)).toBe(
                20
            )
        })
        it('should valueHandler convert % to number relative to parent width and height', () => {
            canvas.add(block)
            expect(block.__valueHandler('20%', 'customValue', 0, true)).toBe(80)
            expect(block.__valueHandler('20%', 'customValue', 0, false)).toBe(
                100
            )
        })
        it.todo(
            'should valueHandler convert rem to number relative to parent font size',
            () => {
                // parent ca be canvas or block itself
                canvas.add(block)
            }
        )
        it('should valueHandler convert vw to number relative to canvas width', () => {
            canvas.add(block)
            expect(block.__valueHandler('20vw', 'customValue', 0, true)).toBe(
                80
            )
        })
        it('should valueHandler convert vh to number relative to canvas height', () => {
            canvas.add(block)
            expect(block.__valueHandler('20vh', 'customValue', 0, false)).toBe(
                100
            )
        })
        it.skip('should valueHandler convert centimeters to number', () => {
            expect(block.__valueHandler('20cm', 'customValue', 0)).toBe(756)
        })
        it.skip('should valueHandler convert millimeters to number', () => {
            expect(block.__valueHandler('20mm', 'customValue', 0)).toBe(75.6)
        })
        it.skip('should valueHandler convert quarter-millimeters to number', () => {
            expect(block.__valueHandler('20q', 'customValue', 0)).toBe(100)
        })
        it.skip('should valueHandler convert inches to number', () => {
            expect(block.__valueHandler('20in', 'customValue', 0)).toBe(100)
        })
        it.skip('should valueHandler convert picas to number', () => {
            expect(block.__valueHandler('20pc', 'customValue', 0)).toBe(100)
        })
        it.skip('should valueHandler convert points to number', () => {
            expect(block.__valueHandler('20pt', 'customValue', 0)).toBe(100)
        })
        it('should valueHandler convert color to rgba', () => {
            expect(block.__valueHandler('green', 'customValue', 0)).toBe(
                'rgba(0, 128, 0, 1)'
            )
        })
        it('should valueHandler hexidecimal to rgba', () => {
            expect(block.__valueHandler('#800080', 'customValue', 0)).toBe(
                'rgba(128, 0, 128, 1)'
            )
        })
        it.skip('should valueHandler HSL(Hue, Saturation, Lightness) to rgba', () => {
            expect(
                block.__valueHandler('hsl(0, 0%, 50%)', 'customValue', 0)
            ).toBe('rgba(128, 0, 128, 1)')
        })
        it('should valueHandler convert array of values to correct value', () => {
            expect(
                block.__valueHandler(['20px', '10', 'white'], 'customValue', 0)
            ).toEqual([20, 10, 'rgba(255, 255, 255, 1)'])
        })
        it('should use set method for setting option value', () => {
            expect(() => block.set({ x: 20 })).not.toThrow()
            expect(block.x()).toBe(20)
        })
        it('should only output important value', () => {
            block.set({ important: { x: 40 } })
            expect(block.x()).toBe(40)
            expect(block.y()).toBe(50)
        })
    })
    describe('All options test', () => {
        for (const [key, val] of Object.entries(blockOptions)) {
            it(`option ${key} defaults to ${val.default}`, () => {
                const currentVal = getPrototype(block, key)?.value.call(block)
                expect(currentVal).toStrictEqual(val.default)
            })
            it(`option ${key} can be set to ${val.value}`, () => {
                const currentVal = getPrototype(block, key)?.value.call(
                    block,
                    val.value
                )
                expect(currentVal).toStrictEqual(val.value)
            })
        }
    })
    describe('Customizing')
    describe('Transformations')
    describe('Animations')
    describe('Helper Methods')

    describe('Events', () => {
        beforeEach(() => {
            canvas = new Canvas('myCanvas', 400, 500)
            block = new Block({
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                selectable: true,
            })
            canvas.add(block)
        })
        it('click event can be defined and working...', async () => {
            const currentCanvas = page.elementLocator(canvas.canvas)

            expect(() => block.click(() => {})).not.toThrow()
            block.click(() => {
                expect(true).toBeTruthy()
            })
            // additinally checking if click action inbound
            block.eventHandler('click', (e: MouseEvent) => {
                expect(block.checkInBound(e)).toBeTruthy()
            })
            await userEvent.click(currentCanvas, { position: { x: 10, y: 10 } })
        })
        it('click should not work on non selectable block', () => {
            block.set({ selectable: false })
            expect(block.selectable()).toBe(false)
        })
        it('registering event before adding block to canvas', () => {
            const customBlock = new Block({
                x: 20,
                y: 10,
                width: 100,
                height: 100,
                selectable: true,
            })
            //
            canvas.add(customBlock)
        })
    })
})
