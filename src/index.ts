const NULL = Symbol('p-null')

class FactoryP<T = any> extends Promise<Awaited<T>[]> {
  promises = new Set<T | Promise<T>>()

  get promise(): Promise<Awaited<T>[]> {
    return Promise.all([...Array.from(this.items), ...Array.from(this.promises)])
      .then(l => l.filter((i: any) => i !== NULL))
  }

  constructor(public items: Iterable<T> = []) {
    super(() => {})
  }

  add(...args: (T | Promise<T>)[]) {
    args.forEach((i) => {
      this.promises.add(i)
    })
  }

  map<U>(fn: (value: Awaited<T>, index: number) => U): FactoryP<Promise<U>> {
    return new FactoryP(Array.from(this.items).map(async(i, idx) => {
      const v = await i
      if ((v as any) === NULL)
        return NULL as unknown as U
      return fn(v, idx)
    }))
  }

  filter(fn: (value: Awaited<T>, index: number) => boolean | Promise<boolean>): FactoryP<Promise<T>> {
    return new FactoryP(Array.from(this.items)
      .map(async(i, idx) => {
        const v = await i
        const r = await fn(v, idx)
        if (!r)
          return NULL as unknown as T
        return v
      }),
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

export function P<T = any>(items?: Iterable<T>): FactoryP<T> {
  return new FactoryP(items)
}
