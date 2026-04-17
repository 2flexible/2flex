import { describe, it, expect } from 'vitest'
import {
    fromPercentage,
    fromVW,
    fromVH,
    fromRem,
    fromEm,
    fromCm,
    fromMm,
    fromQ,
    fromIn,
    fromPc,
    fromPt,
    xIntersect,
    yIntersect,
    checkInBound,
    radianToDegree,
    degreeToRadian,
    rotateCordinates,
    bezierEasing,
    cubicBezier,
    lerp,
    linear,
    steps,
    clamp,
    hexToRgba,
    hslToRgba,
    colorToRgba,
    rgbaRepresenter,
    rgbaToArray,
    getPrototype,
    getPrototypeInChain,
    getOwnPrototype,
    inRange,
} from '../../Utils'

describe('Utils', () => {
    describe('unit conversions', () => {
        it('fromPercentage converts percent to size', () => {
            expect(fromPercentage(50, 200)).toBe(100)
        })

        it('fromVW converts viewport width percentage', () => {
            expect(fromVW(25, 400)).toBe(100)
        })

        it('fromVH converts viewport height percentage', () => {
            expect(fromVH(10, 300)).toBe(30)
        })

        it('fromRem multiplies by parent size', () => {
            expect(fromRem(2, 16)).toBe(32)
        })

        it('fromEm multiplies by parent size', () => {
            expect(fromEm(1.5, 20)).toBe(30)
        })

        it('converts cm to px', () => {
            expect(fromCm(1)).toBe(37.8)
        })

        it('converts mm to px', () => {
            expect(fromMm(10)).toBeCloseTo(37.8)
        })

        it('converts Q to px', () => {
            expect(fromQ(40)).toBeCloseTo(37.8)
        })

        it('converts in to px', () => {
            expect(fromIn(1)).toBeCloseTo(96.012)
        })

        it('converts pc to px', () => {
            expect(fromPc(6)).toBeCloseTo(96.012)
        })

        it('converts pt to px', () => {
            expect(fromPt(72)).toBeCloseTo(96.012)
        })
   
    })

    describe('intersection helpers', () => {
        it('xIntersect returns overlap width', () => {
            expect(
                xIntersect({ left: 0, right: 10 }, { left: 5, right: 15 })
            ).toBe(5)
        })

        it('xIntersect returns 0 when boxes do not overlap', () => {
            expect(
                xIntersect({ left: 0, right: 10 }, { left: 10, right: 20 })
            ).toBe(0)
        })

        it('yIntersect returns overlap height', () => {
            expect(
                yIntersect({ top: 0, bottom: 10 }, { top: 2, bottom: 8 })
            ).toBe(6)
        })

        it('yIntersect returns 0 when boxes do not overlap', () => {
            expect(
                yIntersect({ top: 0, bottom: 5 }, { top: 6, bottom: 10 })
            ).toBe(0)
        })
    })

    describe('geometry helpers', () => {
        // Rectangle corners:
        // p1(0,0) p2(10,0) p3(0,10) p4(10,10)
        it('checkInBound returns true for inside point', () => {
            expect(checkInBound(5, 5, 0, 0, 10, 0, 0, 10, 10, 10)).toBe(true)
        })

        it('checkInBound returns false for outside point', () => {
            expect(checkInBound(12, 5, 0, 0, 10, 0, 0, 10, 10, 10)).toBe(false)
        })

        it('radianToDegree is inverse of degreeToRadian for π', () => {
            expect(radianToDegree(Math.PI)).toBeCloseTo(180)
        })
        it('degreeToRadian is inverse of radianToDegree for 180', () => {
            expect(degreeToRadian(180)).toBeCloseTo(Math.PI)
        })
   
        it('rotateCordinates rotates around center', () => {
            const out1 = rotateCordinates(2, 1, 1, 1, Math.PI / 2)
            expect(out1.x).toBeCloseTo(1)
            expect(out1.y).toBeCloseTo(2)
        })
    })

    describe('easing/math helpers', () => {
        it('bezierEasing returns function that maps 0->0 and 1->1', () => {
            const ease = bezierEasing(0.25, 0.1, 0.25, 1)
            expect(ease(0, 0.001)).toBeCloseTo(0, 4)
            expect(ease(1, 0.001)).toBeCloseTo(1, 4)
        })

        it('cubicBezier computes bezier point', () => {
            expect(cubicBezier(0, 0, 1, 1, 0.5)).toBeCloseTo(0.5)
        })

        it('lerp interpolates linearly', () => {
            expect(lerp(10, 20, 0)).toBe(10)
            expect(lerp(10, 20, 1)).toBe(20)
            expect(lerp(10, 20, 0.25)).toBe(12.5)
        })

        it.todo('linear easing returns exact first point at t=0', () => {
            const fn = linear(0, 10, 20)
            expect(fn(0)).toBe(0)
        })

        it.todo('steps easing returns stepped value', () => {
            const fn = steps(4, 'jump-start' as any)
            expect(fn(0.2)).toBeCloseTo(0.3)
        })

        it('clamp limits value into range', () => {
            expect(clamp(5, 0, 10)).toBe(5)
            expect(clamp(-1, 0, 10)).toBe(0)
            expect(clamp(11, 0, 10)).toBe(10)
        })
    })

    describe('color helpers', () => {
        it('hexToRgba converts full hex color', () => {
            expect(hexToRgba('#ff0000')).toBe('rgba(255, 0, 0, 1)')
        })

        it('hslToRgba converts hsl string', () => {
            expect(hslToRgba('hsl(0, 100%, 50%)')).toBe('rgba(255, 0, 0, 1)')
        })

        it('colorToRgba converts named color', () => {
            expect(colorToRgba('red')).toBe('rgba(255, 0, 0, 1)')
        })

        it('rgbaRepresenter and rgbaToArray round-trip rgba values', () => {
            const s = rgbaRepresenter([10, 20, 30, 0.5])
            expect(s).toBe('rgba(10, 20, 30, 0.5)')
            expect(rgbaToArray(s)).toEqual([10, 20, 30, 0.5])
        })

        it('rgbaToArray uses defaults when alpha is omitted', () => {
            expect(rgbaToArray('rgba(1, 2, 3)')).toEqual([1, 2, 3, 1])
        })
    })

    describe('prototype helpers', () => {
        class A {
            x = 1
            greet() {
                return 'a'
            }
        }
        class B extends A {
            onlyB() {
                return 'b-only'
            }
        }

        it('getOwnPrototype returns descriptor on same prototype', () => {
            const d = getOwnPrototype(B.prototype, 'onlyB')
            expect(d).toBeDefined()
            expect(typeof d?.value).toBe('function')
        })

        it('getPrototype returns descriptor from object prototype', () => {
            const b = new B()
            const d = getPrototype(b, 'greet')
            expect(d).toBeDefined()
            expect(typeof d?.value).toBe('function')
        })

        it('getPrototype can resolve inherited method in chain', () => {
            const d = getPrototypeInChain(B.prototype, 'greet')
            expect(d).toBeDefined()
            expect(typeof d?.value).toBe('function')
        })

        it('getPrototypeInChain returns undefined for missing key', () => {
            const d = getPrototypeInChain(B.prototype, 'doesNotExist')
            expect(d).toBeNull()
        })
    })

    describe('range helper', () => {
        it('inRange is inclusive at both ends', () => {
            expect(inRange(5, 5, 10)).toBe(true)
            expect(inRange(10, 5, 10)).toBe(true)
            expect(inRange(4, 5, 10)).toBe(false)
        })
    })
})
