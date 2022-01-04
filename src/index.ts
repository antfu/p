import pLimit from 'p-limit'

/**
 * Internal marker for filtered items
 */
const VOID = Symbol('p-void')

export interface Options {
  /**
   * How many promises are resolved at the same time.
   */
  concurrency?: number | undefined
}

class PInstance<T = any> extends Promise<Awaited<T>[]> {
  private promises = new Set<T | Promise<T>>()

  get promise(): Promise<Awaited<T>[]> {
    let batch
    const items = [...Array.from(this.items), ...Array.from(this.promises)]

    if (this.options?.concurrency) {
      const limit = pLimit(this.options.concurrency)
      batch = Promise.all(items.map(p => limit(() => p)))
    }
    else {
      batch = Promise.all(items)
    }

    return batch.then(l => l.filter((i: any) => i !== VOID))
  }

  constructor(public items: Iterable<T> = [], public options?: Options) {
    super(() => {})
  }

  add(...args: (T | Promise<T>)[]) {
    args.forEach((i) => {
      this.promises.add(i)
    })
  }

  map<U>(fn: (value: Awaited<T>, index: number) => U): PInstance<Promise<U>> {
    return new PInstance(
      Array.from(this.items)
        .map(async(i, idx) => {
          const v = await i
          if ((v as any) === VOID)
            return VOID as unknown as U
          return fn(v, idx)
        }),
      this.options,
    )
  }

  filter(fn: (value: Awaited<T>, index: number) => boolean | Promise<boolean>): PInstance<Promise<T>> {
    return new PInstance(
      Array.from(this.items)
        .map(async(i, idx) => {
          const v = await i
          const r = await fn(v, idx)
          if (!r)
            return VOID as unknown as T
          return v
        }),
      this.options,
    )
  }

  forEach(fn: (value: Awaited<T>, index: number) => void): Promise<void> {
    return this.map(fn).then()
  }

  reduce<U>(fn: (previousValue: U, currentValue: Awaited<T>, currentIndex: number, array: Awaited<T>[]) => U, initialValue: U): Promise<U> {
    return this.promise.then(array => array.reduce(fn, initialValue))
  }

  clear() {
    this.promises.clear()
  }

  then(fn?: () => PromiseLike<any>) {
    const p = this.promise
    if (fn)
      return p.then(fn)
    else
      return p
  }

  catch(fn?: (err: unknown) => PromiseLike<any>) {
    return this.promise.catch(fn)
  }

  finally(fn?: () => void) {
    return this.promise.finally(fn)
  }
}

export function P<T = any>(items?: Iterable<T>, options?: Options): PInstance<T> {
  return new PInstance(items, options)
}

export type { PInstance }
export default P
