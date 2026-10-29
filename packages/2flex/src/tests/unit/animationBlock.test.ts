import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Block, Canvas } from '@2flexible/2flex'
import { rgbaToArray } from '../../Utils'
import { flush, removeCanvasElements, waitFor } from './helpers'

let block: Block
let canvas: Canvas

describe('AnimationBlock', () => {
    afterEach(() => {
        removeCanvasElements()
    })
    beforeEach(async () => {
        canvas = new Canvas('myCanvas', 400, 500)
        block = new Block({
            x: 0,
            y: 0,
            width: 100,
            height: 100,
        })
        canvas.add(block)
        await flush()
    })
    it('should generate a unique id for every animation', () => {
        const first = block.animate({ id: undefined, x: [0, 100] })
        const second = block.animate({ id: undefined, x: [0, 100] })
        expect(first).not.toBe(second)
    })
    it('should generate a unique id across blocks on the same canvas', () => {
        const otherBlock = new Block({ width: 50, height: 50 })
        canvas.add(otherBlock)
        expect(block.animate({ id: undefined, x: [0, 100] })).not.toBe(
            otherBlock.animate({ id: undefined, x: [0, 100] })
        )
    })
    it('should use the given animation id', () => {
        expect(block.animate({ id: 'myAnimation', x: [0, 100] })).toBe(
            'myAnimation'
        )
    })
    it('should apply the final keyframe value on animationFinish', () => {
        const animationId = block.animate({ id: 'finish', x: [0, 100] })
        block.animationFinish(animationId)
        expect(block.x()).toBe(100)
    })
    it('should use the first keyframe when direction is reverse', () => {
        const animationId = block.animate({ id: 'direction', x: [40, 100] })
        block.animationDirection(animationId, 'reverse')
        block.animationFinish(animationId)
        expect(block.x()).toBe(40)
    })
    it('should resolve the last of several keyframes', () => {
        const animationId = block.animate({
            id: 'multiple',
            x: [0, 50, 200],
        })
        block.animationFinish(animationId)
        expect(block.x()).toBe(200)
    })
    it('should add the keyframe value to the underlying one', async () => {
        block.set({ x: 50 })
        await flush()
        const animationId = block.animate({
            id: 'composite',
            composite: 'add',
            x: [0, 100],
        })
        block.animationFinish(animationId)
        expect(block.x()).toBe(150)
    })
    it('should interpolate a discrete value only at the end', async () => {
        const animationId = block.animate({
            id: 'discrete',
            x: [0, 100],
            hidden: [false, true],
        })
        block.animationStart(animationId)
        await flush(3)
        expect(block.hidden()).toBe(false)

        block.animationFinish(animationId)
        expect(block.hidden()).toBe(true)
    })
    it('should not run before it is started', async () => {
        const animationId = block.animate({ id: 'auto', x: [0, 100] })
        await flush(4)
        expect(block.x()).toBe(0)
        expect(animationId).toBe('auto')
    })
    it('should animate after animationStart', async () => {
        const animationId = block.animate({ id: 'start', x: [0, 100] })
        await flush()
        block.animationStart(animationId)
        await flush(4)
        expect(block.x()).toBeGreaterThan(0)
        expect(block.x()).toBeLessThan(100)
    })
    it('should run on its own with autoStart', async () => {
        block.animate({ id: 'autoStart', autoStart: true, x: [0, 100] })
        await flush(4)
        expect(block.x()).toBeGreaterThan(0)
        expect(block.x()).toBeLessThan(100)
    })
    it('should freeze the value while stopped', async () => {
        const animationId = block.animate({ id: 'stop', x: [0, 100] })
        block.animationStart(animationId)
        await flush(4)

        block.animationStop(animationId)
        const stoppedAt = block.x()
        expect(stoppedAt).toBeGreaterThan(0)

        await flush(4)
        expect(block.x()).toBe(stoppedAt)
    })
    it('should continue after being restarted', async () => {
        const animationId = block.animate({ id: 'restart', x: [0, 100] })
        block.animationStart(animationId)
        await flush(3)

        block.animationStop(animationId)
        const stoppedAt = block.x()

        block.animationStart(animationId)
        await flush(4)
        expect(block.x()).toBeGreaterThan(stoppedAt)
    })
    it('should finish and call onFinish when iterations are reached', async () => {
        let isFinished = false
        block.animate({
            id: 'iterations',
            autoStart: true,
            duration: 40,
            iterations: 1,
            onFinish: () => {
                isFinished = true
            },
            x: [0, 100],
        })
        expect(await waitFor(() => isFinished)).toBe(true)
        expect(block.x()).toBe(100)
    })
    it('should stop updating after removeAnimation', async () => {
        const animationId = block.animate({
            id: 'remove',
            autoStart: true,
            x: [0, 100],
        })
        await flush(3)

        block.removeAnimation(animationId)
        await flush()
        const removedAt = block.x()

        await flush(4)
        expect(block.x()).toBe(removedAt)
    })
    // keyframes go through the value converter of the animated option, so
    // every kind of value it accepts can be used as a breakpoint
    describe('keyframe value kinds', () => {
        it('should animate a number keyframe', () => {
            const animationId = block.animate({
                id: 'number',
                x: [0, 120],
            })
            block.animationFinish(animationId)
            expect(block.x()).toBe(120)
        })
        it('should animate a px keyframe', () => {
            const animationId = block.animate({
                id: 'px',
                x: ['0px', '75px'],
            })
            block.animationFinish(animationId)
            expect(block.x()).toBe(75)
        })
        it('should animate a percentage keyframe', () => {
            // 50% of the 400 wide canvas
            const animationId = block.animate({
                id: 'percentage',
                x: ['0%', '50%'],
            })
            block.animationFinish(animationId)
            expect(block.x()).toBe(200)
        })
        it('should animate a centimeter keyframe', () => {
            const animationId = block.animate({
                id: 'centimeter',
                x: ['1cm', '2cm'],
            })
            block.animationFinish(animationId)
            expect(block.x()).toBe(75.6)
        })
        it('should animate a color keyframe', () => {
            const animationId = block.animate({
                id: 'color',
                hotCornerBackgroundColor: ['red', 'blue'],
            })
            block.animationFinish(animationId)
            expect(block.hotCornerBackgroundColor()).toBe('rgba(0, 0, 255, 1)')
        })
        it('should interpolate a color keyframe', async () => {
            const animationId = block.animate({
                id: 'colorLerp',
                autoStart: true,
                hotCornerBackgroundColor: ['red', 'blue'],
            })
            await flush(4)

            const [r, , b] = rgbaToArray(
                block.hotCornerBackgroundColor()
            ) as number[]
            expect(r).toBeLessThan(255)
            expect(b).toBeGreaterThan(0)
        })
        it('should animate a boolean keyframe', () => {
            const animationId = block.animate({
                id: 'boolean',
                hidden: [true, false],
            })
            block.animationFinish(animationId)
            expect(block.hidden()).toBe(false)
        })
        it('should animate a string keyframe', () => {
            const animationId = block.animate({
                id: 'string',
                name: ['first', 'last'],
            })
            block.animationFinish(animationId)
            expect(block.name()).toBe('last')
        })
        it('should animate an array keyframe', () => {
            const animationId = block.animate({
                id: 'array',
                hotCornerRadius: [
                    [10, 20],
                    [30, 40],
                ],
            })
            block.animationFinish(animationId)
            expect(block.hotCornerRadius()).toEqual([30, 40])
        })
        it('should interpolate every item of an array keyframe', async () => {
            const animationId = block.animate({
                id: 'arrayLerp',
                autoStart: true,
                hotCornerRadius: [
                    [0, 100],
                    [100, 200],
                ],
            })
            await flush(4)

            const [first, second] = block.hotCornerRadius() as number[]
            expect(first).toBeGreaterThan(0)
            expect(first).toBeLessThan(100)
            expect(second).toBeGreaterThan(100)
            expect(second).toBeLessThan(200)
        })
        it('should pad array keyframes to the same arity', () => {
            const animationId = block.animate({
                id: 'arrayArity',
                hotCornerRadius: [[10], [20, 30, 40]],
            })
            block.animationFinish(animationId)
            expect(block.hotCornerRadius()).toEqual([20, 30, 40])
        })
        it('should animate an object keyframe', () => {
            const animationId = block.animate({
                id: 'object',
                rotatableTopLeft: [
                    { x: 0, y: 0 },
                    { x: 40, y: 60 },
                ],
            })
            block.animationFinish(animationId)
            expect(block.rotatableTopLeft()).toEqual({ x: 40, y: 60 })
        })
        it('should interpolate every key of an object keyframe', async () => {
            const animationId = block.animate({
                id: 'objectLerp',
                autoStart: true,
                rotatableTopLeft: [
                    { x: 0, y: 0 },
                    { x: 100, y: 200 },
                ],
            })
            await flush(4)

            const { x, y } = block.rotatableTopLeft() as {
                x: number
                y: number
            }
            expect(x).toBeGreaterThan(0)
            expect(x).toBeLessThan(100)
            expect(y).toBeGreaterThan(0)
            expect(y).toBeLessThan(200)
        })
        it('should animate multiple options at once', () => {
            const animationId = block.animate({
                id: 'multipleOptions',
                x: [10, 20],
                y: [30, 40],
                rotate: [0, 1.2],
            })
            block.animationFinish(animationId)
            expect(block.x()).toBe(20)
            expect(block.y()).toBe(40)
            expect(block.rotate()).toBe(1.2)
        })
    })
})
