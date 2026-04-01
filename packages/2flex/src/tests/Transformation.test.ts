import { expect, test } from 'vitest'
import { Block } from '../Block'
test('set includes transform', () => {
    const block = new Block({ x: 0 })
    const newXCord = 21
    block.set({ x: newXCord })
    expect(block.x()).toBe(newXCord)
})
