import { describe, expect, it } from 'vitest'
import { P } from '../src'

const timeout = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe('should', () => {
  it('p', async() => {
    const p = P()
    let dummy = 0
    p.add((async() => {
      await timeout(100)
      dummy += 1
      return 4
    })())
    expect(dummy).toBe(0)
    await p
    expect(dummy).toBe(1)
  })

  it('chain array map', async() => {
    expect(
      await P([1, 2, 3, 4, 5])
        .map(async(i) => {
          await timeout(10)
          return i * i
        })
        .filter(i => i > 10)
        .reduce((a, b) => a + b, 0),
    )
      .toEqual(41)
  })
})
