import { describe, it, expect } from 'vitest'
import { Node } from '../../Node'
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
    rotateCordinatesByRadian,
    bezierEasing,
    cubicBezier,
    lerp,
    linear,
    steps,
    clamp,
    namedColors,
    hexToRgba,
    hslToRgba,
    colorToRgba,
    rgbaRepresenter,
    rgbaToArray,
    getPrototype,
    getPrototypeInChain,
    getOwnPrototype,
    inRange,
    easingParser,
    shortHandParser,
    preOrderTraversal,
    postOrderTraversal,
    reversePostOrderTraversal,
    worldTileKey,
    stationaryPoints,
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

        it('converts zero', () => {
            expect(fromPercentage(0, 200)).toBe(0)
            expect(fromCm(0)).toBe(0)
            expect(fromIn(0)).toBe(0)
        })

        it('converts negative values', () => {
            expect(fromCm(-1)).toBe(-37.8)
            expect(fromRem(-1, 16)).toBe(-16)
        })

        it('converts values above 100%', () => {
            expect(fromPercentage(150, 200)).toBe(300)
            expect(fromQ(101)).toBeCloseTo(95.445)
        })

        it('uses the same inch value as 6 picas and 72 points', () => {
            expect(fromPt(72)).toBeCloseTo(fromIn(1))
            expect(fromPc(6)).toBeCloseTo(fromIn(1))
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

        it('xIntersect returns 0 when boxes only touch each other', () => {
            expect(
                xIntersect({ left: 0, right: 10 }, { left: 15, right: 20 })
            ).toBe(0)
        })

        it('xIntersect returns the whole box when it is inside the other one', () => {
            expect(
                xIntersect({ left: 0, right: 100 }, { left: 25, right: 75 })
            ).toBe(50)
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

        it('yIntersect returns the whole box when it is inside the other one', () => {
            expect(
                yIntersect({ top: 0, bottom: 100 }, { top: 25, bottom: 75 })
            ).toBe(50)
        })
    })

    describe('geometry helpers', () => {
        // rectangle corners:
        // p1(top left) p2(top right) p3(bottom left) p4(bottom right)
        type Corners = [
            number,
            number,
            number,
            number,
            number,
            number,
            number,
            number,
        ]
        const rectangleCorners: Corners = [0, 0, 10, 0, 0, 10, 10, 10]

        it('checkInBound returns true for inside point', () => {
            expect(checkInBound(5, 5, ...rectangleCorners)).toBe(true)
        })

        it('checkInBound returns true for point on a corner', () => {
            expect(checkInBound(0, 0, ...rectangleCorners)).toBe(true)
        })

        it('checkInBound returns false for outside point', () => {
            expect(checkInBound(12, 5, ...rectangleCorners)).toBe(false)
            expect(checkInBound(-1, 5, ...rectangleCorners)).toBe(false)
            expect(checkInBound(5, 11, ...rectangleCorners)).toBe(false)
        })

        it('checkInBound works with rotated corners', () => {
            const radian = Math.PI / 6
            const rotate = (x: number, y: number) =>
                rotateCordinatesByRadian(x, y, 0, 0, radian)
            const topLeft = rotate(-10, -5)
            const topRight = rotate(10, -5)
            const bottomLeft = rotate(-10, 5)
            const bottomRight = rotate(10, 5)
            const corners: Corners = [
                topLeft.x,
                topLeft.y,
                topRight.x,
                topRight.y,
                bottomLeft.x,
                bottomLeft.y,
                bottomRight.x,
                bottomRight.y,
            ]
            expect(checkInBound(0, 0, ...corners)).toBe(true)
            expect(checkInBound(11, 0, ...corners)).toBe(false)
        })

        it('radianToDegree is inverse of degreeToRadian for π', () => {
            expect(radianToDegree(Math.PI)).toBeCloseTo(180)
        })
        it('degreeToRadian is inverse of radianToDegree for 180', () => {
            expect(degreeToRadian(180)).toBeCloseTo(Math.PI)
        })
        it('converts zero and a full turn', () => {
            expect(radianToDegree(0)).toBe(0)
            expect(degreeToRadian(0)).toBe(0)
            expect(radianToDegree(Math.PI * 2)).toBeCloseTo(360)
            expect(degreeToRadian(360)).toBeCloseTo(Math.PI * 2)
        })

        it('rotateCordinatesByRadian rotates around center', () => {
            const out = rotateCordinatesByRadian(2, 1, 1, 1, Math.PI / 2)
            expect(out.x).toBeCloseTo(1)
            expect(out.y).toBeCloseTo(2)
        })
        it('rotateCordinatesByRadian keeps the point at zero angle', () => {
            expect(rotateCordinatesByRadian(2, 1, 1, 1, 0)).toEqual({
                x: 2,
                y: 1,
            })
        })
        it('rotateCordinatesByRadian turns the point upside down at π', () => {
            const out = rotateCordinatesByRadian(2, 1, 0, 0, Math.PI)
            expect(out.x).toBeCloseTo(-2)
            expect(out.y).toBeCloseTo(-1)
        })
        it('rotateCordinatesByRadian keeps the center in place', () => {
            expect(rotateCordinatesByRadian(5, 5, 5, 5, 1.234)).toEqual({
                x: 5,
                y: 5,
            })
        })
    })

    describe('easing/math helpers', () => {
        it('bezierEasing returns function that maps 0->0 and 1->1', () => {
            const ease = bezierEasing(0.25, 0.1, 0.25, 1)
            expect(ease(0, 0.001)).toBeCloseTo(0, 4)
            expect(ease(1, 0.001)).toBeCloseTo(1, 4)
        })

        it('bezierEasing returns identity when both points are linear', () => {
            const identity = bezierEasing(0, 0, 1, 1)
            expect(identity(0.25, 0.001)).toBe(0.25)
            expect(identity(0.75, 0.001)).toBe(0.75)
        })

        it('bezierEasing applies the css timing functions', () => {
            expect(bezierEasing(0.25, 0.1, 0.25, 1)(0.5, 1e-6)).toBeCloseTo(
                0.8024,
                4
            )
            expect(bezierEasing(0.42, 0, 1, 1)(0.5, 1e-6)).toBeCloseTo(
                0.3154,
                4
            )
            expect(bezierEasing(0, 0, 0.58, 1)(0.5, 1e-6)).toBeCloseTo(
                0.6846,
                4
            )
            expect(bezierEasing(0.42, 0, 0.58, 1)(0.5, 1e-6)).toBeCloseTo(
                0.5,
                4
            )
        })

        it('bezierEasing starts slow for ease-in and ends fast for ease-out', () => {
            expect(bezierEasing(0.42, 0, 1, 1)(0.25, 1e-6)).toBeLessThan(0.25)
            expect(bezierEasing(0, 0, 0.58, 1)(0.25, 1e-6)).toBeGreaterThan(
                0.25
            )
        })

        it('cubicBezier computes bezier point', () => {
            expect(cubicBezier(0, 0, 1, 1, 0.5)).toBeCloseTo(0.5)
        })

        it('cubicBezier returns the control points on both ends', () => {
            expect(cubicBezier(10, 20, 30, 40, 0)).toBe(10)
            expect(cubicBezier(10, 20, 30, 40, 1)).toBe(40)
        })

        it('cubicBezier follows the first control point at the beginning', () => {
            expect(cubicBezier(0, 1, 0, 1, 0.5)).toBeCloseTo(0.5)
        })

        it('lerp interpolates linearly', () => {
            expect(lerp(10, 20, 0)).toBe(10)
            expect(lerp(10, 20, 1)).toBe(20)
            expect(lerp(10, 20, 0.25)).toBe(12.5)
        })

        it('linear interpolates between every given point', () => {
            const fn = linear(0, 10, 20)
            expect(fn(0)).toBe(0)
            expect(fn(0.25)).toBe(5)
            expect(fn(0.5)).toBe(10)
            expect(fn(0.75)).toBe(15)
            expect(fn(1)).toBe(20)
        })

        it('linear with two points behaves like a plain lerp', () => {
            const fn = linear(0, 100)
            expect(fn(0.5)).toBe(50)
        })

        it('linear clamps values outside of the 0-1 range', () => {
            const fn = linear(0, 10, 20)
            expect(fn(-0.2)).toBe(0)
            expect(fn(1.5)).toBe(20)
        })

        it('steps jumps on the value boundaries', () => {
            const fn = steps(4, 'jump-start')
            expect(fn(0)).toBeCloseTo(0.25)
            expect(fn(0.2)).toBeCloseTo(0.25)
            expect(fn(0.25)).toBeCloseTo(0.5)
            expect(fn(0.75)).toBeCloseTo(1)
        })

        it('steps jump-end stays on the lower value until the next step', () => {
            const fn = steps(4, 'jump-end')
            expect(fn(0)).toBeCloseTo(0)
            expect(fn(0.24)).toBeCloseTo(0)
            expect(fn(0.25)).toBeCloseTo(0.25)
            expect(fn(1)).toBeCloseTo(1)
        })

        it('steps jump-none has no value on the first and last step', () => {
            const fn = steps(4, 'jump-none')
            expect(fn(0)).toBeCloseTo(0)
            expect(fn(0.25)).toBeCloseTo(1 / 3)
            expect(fn(0.75)).toBeCloseTo(1)
        })

        it('steps jump-both has values on the first and last step', () => {
            const fn = steps(4, 'jump-both')
            expect(fn(0)).toBeCloseTo(0.2)
            expect(fn(0.5)).toBeCloseTo(0.6)
            expect(fn(1)).toBeCloseTo(1)
        })

        it('steps with a single step', () => {
            expect(steps(1, 'jump-start')(0.5)).toBe(1)
            expect(steps(1, 'jump-end')(0.5)).toBe(0)
            expect(steps(1, 'jump-none')(0.5)).toBe(0)
            expect(steps(1, 'jump-none')(1)).toBe(1)
        })

        it('steps clamps values outside of the 0-1 range', () => {
            const fn = steps(4, 'jump-end')
            expect(fn(-1)).toBeCloseTo(0)
            expect(fn(2)).toBeCloseTo(1)
        })

        it('clamp limits value into range', () => {
            expect(clamp(5, 0, 10)).toBe(5)
            expect(clamp(-1, 0, 10)).toBe(0)
            expect(clamp(11, 0, 10)).toBe(10)
        })
    })

    describe('easing parser', () => {
        it('resolves linear to a plain interpolation', () => {
            const fn = easingParser('linear')
            expect(fn(0)).toBe(0)
            expect(fn(0.5)).toBe(0.5)
            expect(fn(1)).toBe(1)
        })

        it('resolves step-start and step-end to steps', () => {
            expect(easingParser('step-start')(0.5)).toBe(1)
            expect(easingParser('step-end')(0.5)).toBe(0)
        })

        it('resolves the css timing functions to bezier easings', () => {
            expect(easingParser('ease')(0.5)).toBeCloseTo(0.8024, 4)
            expect(easingParser('ease-in')(0.5)).toBeCloseTo(0.3154, 4)
            expect(easingParser('ease-out')(0.5)).toBeCloseTo(0.6846, 4)
            expect(easingParser('ease-in-out')(0.5)).toBeCloseTo(0.5, 4)
        })

        it('returns a given easing function as is', () => {
            const custom = () => 0.42
            expect(easingParser(custom as any)).toBe(custom)
        })
    })

    describe('shorthand parser', () => {
        it('expands a single value to all four sides', () => {
            expect(shortHandParser(5)).toEqual([5, 5, 5, 5])
            expect(shortHandParser(['10%'])).toEqual([
                '10%',
                '10%',
                '10%',
                '10%',
            ])
        })

        it('expands two values to top/bottom and left/right', () => {
            expect(shortHandParser([1, 2])).toEqual([1, 2, 1, 2])
        })

        it('expands three values like the css shorthand', () => {
            expect(shortHandParser([1, 2, 3])).toEqual([1, 2, 3, 2])
        })

        it('returns four values as they are', () => {
            const values: [number, number, number, number] = [1, 2, 3, 4]
            expect(shortHandParser(values)).toEqual([1, 2, 3, 4])
        })

        it('returns a string as it is', () => {
            expect(shortHandParser('auto')).toBe('auto')
        })
    })

    describe('color helpers', () => {
        it('namedColors maps css color keywords to hex values', () => {
            expect(namedColors.red).toBe('#ff0000')
            expect(namedColors.black).toBe('#000000')
            expect(namedColors.white).toBe('#ffffff')
            expect(Object.keys(namedColors)).toHaveLength(16)
        })

        it('hexToRgba converts full hex color', () => {
            expect(hexToRgba('#ff0000')).toBe('rgba(255, 0, 0, 1)')
            expect(hexToRgba('#000000')).toBe('rgba(0, 0, 0, 1)')
            expect(hexToRgba('#ffffff')).toBe('rgba(255, 255, 255, 1)')
            expect(hexToRgba('#123456')).toBe('rgba(18, 52, 86, 1)')
        })

        it('hexToRgba expands the shorthand hex color', () => {
            expect(hexToRgba('#f00')).toBe('rgba(255, 0, 0, 1)')
            expect(hexToRgba('#0f0')).toBe('rgba(0, 255, 0, 1)')
            expect(hexToRgba('#abc')).toBe('rgba(170, 187, 204, 1)')
        })

        it('hexToRgba reads the alpha channel', () => {
            expect(hexToRgba('#ff000080')).toBe('rgba(255, 0, 0, 0.5)')
            expect(hexToRgba('#ff000000')).toBe('rgba(255, 0, 0, 0)')
            expect(hexToRgba('#f008')).toBe('rgba(255, 0, 0, 0.53)')
        })

        it('hslToRgba converts hsl string', () => {
            expect(hslToRgba('hsl(0, 100%, 50%)')).toBe('rgba(255, 0, 0, 1)')
        })

        it('hslToRgba covers every hue sector', () => {
            expect(hslToRgba('hsl(60, 100%, 50%)')).toBe('rgba(255, 255, 0, 1)')
            expect(hslToRgba('hsl(120, 100%, 50%)')).toBe('rgba(0, 255, 0, 1)')
            expect(hslToRgba('hsl(180, 100%, 50%)')).toBe(
                'rgba(0, 255, 255, 1)'
            )
            expect(hslToRgba('hsl(240, 100%, 50%)')).toBe('rgba(0, 0, 255, 1)')
            expect(hslToRgba('hsl(300, 100%, 50%)')).toBe(
                'rgba(255, 0, 255, 1)'
            )
            expect(hslToRgba('hsl(30, 100%, 50%)')).toBe('rgba(255, 128, 0, 1)')
        })

        it('hslToRgba returns grey without saturation', () => {
            expect(hslToRgba('hsl(0, 0%, 100%)')).toBe('rgba(255, 255, 255, 1)')
            expect(hslToRgba('hsl(0, 0%, 0%)')).toBe('rgba(0, 0, 0, 1)')
            expect(hslToRgba('hsl(0, 0%, 50%)')).toBe('rgba(128, 128, 128, 1)')
        })

        it('hslToRgba normalizes the hue', () => {
            expect(hslToRgba('hsl(360, 100%, 50%)')).toBe('rgba(255, 0, 0, 1)')
            expect(hslToRgba('hsl(-120, 100%, 50%)')).toBe('rgba(0, 0, 255, 1)')
        })

        it('hslToRgba keeps the given alpha', () => {
            expect(hslToRgba('hsl(0, 100%, 50%, 0.5)')).toBe(
                'rgba(255, 0, 0, 0.5)'
            )
            expect(hslToRgba('hsl(0, 0%, 0%, 0)')).toBe('rgba(0, 0, 0, 0)')
        })

        it('colorToRgba converts named color', () => {
            expect(colorToRgba('red')).toBe('rgba(255, 0, 0, 1)')
            expect(colorToRgba('black')).toBe('rgba(0, 0, 0, 1)')
            expect(colorToRgba('white')).toBe('rgba(255, 255, 255, 1)')
        })

        it('colorToRgba converts every named color', () => {
            for (const name of Object.keys(namedColors)) {
                expect(colorToRgba(name)).toMatch(
                    /^rgba\(\d+, \d+, \d+, [\d.]+\)$/
                )
            }
        })

        it('rgbaRepresenter and rgbaToArray round-trip rgba values', () => {
            const s = rgbaRepresenter([10, 20, 30, 0.5])
            expect(s).toBe('rgba(10, 20, 30, 0.5)')
            expect(rgbaToArray(s)).toEqual([10, 20, 30, 0.5])
        })

        it('rgbaRepresenter uses fully transparent alpha as it is', () => {
            expect(rgbaRepresenter([10, 20, 30, 0])).toBe('rgba(10, 20, 30, 0)')
        })

        it('rgbaRepresenter uses alpha 1 when it is omitted', () => {
            expect(rgbaRepresenter([10, 20, 30])).toBe('rgba(10, 20, 30, 1)')
        })

        it('rgbaToArray uses defaults when alpha is omitted', () => {
            expect(rgbaToArray('rgba(1, 2, 3)')).toEqual([1, 2, 3, 1])
        })

        it('rgbaToArray reads decimals', () => {
            expect(rgbaToArray('rgba(10.5, 20, 30, 0.25)')).toEqual([
                10.5, 20, 30, 0.25,
            ])
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

        it('getOwnPrototype returns undefined for a missing key', () => {
            expect(getOwnPrototype(B.prototype, 'greet')).toBeUndefined()
        })

        it('getPrototype returns descriptor from object prototype', () => {
            const b = new B()
            const d = getPrototype(b, 'greet')
            expect(d).toBeDefined()
            expect(typeof d?.value).toBe('function')
        })

        it('getPrototype returns descriptor declared on the same prototype', () => {
            const b = new B()
            const d = getPrototype(b, 'onlyB')
            expect(d).toBeDefined()
            expect(typeof d?.value).toBe('function')
        })

        it('getPrototype resolves a method of a plain object prototype', () => {
            const d = getPrototype({ a: 1 }, 'hasOwnProperty')
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

        it('getPrototypeInChain resolves members of Node itself', () => {
            const d = getPrototypeInChain(Node.prototype, 'addChild')
            expect(d).toBeDefined()
            expect(typeof d?.value).toBe('function')
        })

        it('getPrototypeInChain stops on the end of the chain', () => {
            expect(getPrototypeInChain(Node.prototype, 'notThere')).toBeNull()
        })
    })

    describe('traversals', () => {
        // A has children B and C, B has child D
        const createTree = () => {
            const a = new Node()
            const b = new Node()
            const c = new Node()
            const d = new Node()
            a.addChild(b)
            a.addChild(c)
            b.addChild(d)
            return { a, b, c, d }
        }

        const collect =
            (traverse: (head: Node, func: (n: Node) => void) => void) =>
            (head: Node) => {
                const ids: number[] = []
                traverse(head, (node) => ids.push(node.nodeId as number))
                return ids
            }

        const preOrder = collect(preOrderTraversal)
        const postOrder = collect(postOrderTraversal)
        const reversePostOrder = collect(reversePostOrderTraversal)

        const withIds = () => {
            const { a, b, c, d } = createTree()
            a.nodeId = 1
            b.nodeId = 2
            c.nodeId = 3
            d.nodeId = 4
            return a
        }

        it('preOrderTraversal visits parents before children', () => {
            expect(preOrder(withIds())).toEqual([1, 2, 4, 3])
        })

        it('postOrderTraversal visits children before parents', () => {
            expect(postOrder(withIds())).toEqual([4, 2, 3, 1])
        })

        it('reversePostOrderTraversal walks the tree backwards', () => {
            expect(reversePostOrder(withIds())).toEqual([1, 3, 2, 4])
        })

        it('traversals visit a single node', () => {
            const a = new Node()
            a.nodeId = 1
            expect(preOrder(a)).toEqual([1])
            expect(postOrder(a)).toEqual([1])
            expect(reversePostOrder(a)).toEqual([1])
        })

        it('traversals do nothing without a head', () => {
            const visit = () => {
                throw new Error('should not be called')
            }
            expect(() =>
                preOrderTraversal(undefined as any, visit)
            ).not.toThrow()
            expect(() =>
                postOrderTraversal(undefined as any, visit)
            ).not.toThrow()
            expect(() =>
                reversePostOrderTraversal(undefined as any, visit)
            ).not.toThrow()
        })
    })

    describe('misc helpers', () => {
        it('worldTileKey joins the world position', () => {
            expect(worldTileKey(3, 5)).toBe('3,5')
            expect(worldTileKey(-1, 0)).toBe('-1,0')
        })

        it('inRange is inclusive at both ends', () => {
            expect(inRange(5, 5, 10)).toBe(true)
            expect(inRange(10, 5, 10)).toBe(true)
            expect(inRange(4, 5, 10)).toBe(false)
            expect(inRange(11, 5, 10)).toBe(false)
        })
    })

    describe('stationary points', () => {
        it('returns nothing for a monotonic curve', () => {
            expect(stationaryPoints(0, 0.2, 0.7, 1)).toEqual([])
        })

        it('returns the boundary value when the curve flattens on its end', () => {
            expect(stationaryPoints(0, 0.5, 1, 1)).toEqual([1])
        })

        it('returns one point for a curve with a single extremum', () => {
            expect(stationaryPoints(0.42, 0, 0.58, 1)[0]).toBeCloseTo(0.2743, 4)
            expect(stationaryPoints(0.42, 0, 0.58, 1)).toHaveLength(1)
        })

        it('returns one point for a double extremum', () => {
            expect(stationaryPoints(0, 1, 0, 1)[0]).toBeCloseTo(0.5)
            expect(stationaryPoints(0, 1, 0, 1)).toHaveLength(1)
        })

        it('returns both points of a curve with two extrema', () => {
            const points = stationaryPoints(0, 2, -1, 1)
            expect(points).toHaveLength(2)
            expect(points[0]).toBeCloseTo(0.2764, 4)
            expect(points[1]).toBeCloseTo(0.7236, 4)
        })
    })
})
