import { describe, expect, it } from 'vitest'
import timeSpan from 'time-span'
import { P } from '../src'

const timeout = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
// returns time of execution of the promise in ms
const executionTime = (promise: Promise<any>) => {
  const end = timeSpan()
  return promise.then(res => [res, end()])
}

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

  it('concurrency: 1', async() => {
    const items = Array.from({ length: 10 }, async(_, i) => {
      await timeout(i * 10)
      return i
    })
    const [result, time] = await executionTime(
      P(items, { concurrency: 1 })
        .map(async(i) => {
          await timeout(100)
          return i
        })
        .reduce((a, b) => a + b, 0),
    )
    expect(result).toEqual(45)
    expect(time).to.be.within(190, 210)
  })

  it('concurrency: 4', async() => {
    let running = 0

    const promises = Array.from({ length: 100 }, async() => {
      running++
      expect(running).to.be.lessThanOrEqual(4)
      running--
    })

    await P(promises, { concurrency: 4 })
  })

  it('fails with wrong format', async() => {
    try {
      await P([], { concurrency: 1.5 })
    }
    catch (e) {
      expect(e).toBeInstanceOf(TypeError)
    }

    try {
      await P([], { concurrency: 0 })
    }
    catch (e) {
      expect(e).toBeInstanceOf(TypeError)
    }
  })
})
