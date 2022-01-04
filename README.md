# @antfu/p

[![NPM version](https://img.shields.io/npm/v/@antfu/p?color=a1b858&label=)](https://www.npmjs.com/package/@antfu/p)

I don't really sure what it is yet. But it's basically some tools for handling promises.

<details>
<summary>Without</summary>

```ts
const items = [1, 2, 3, 4, 5]

(await Promise.all(items
  .map(async i => {
    const v = await multiply(i, 3)
    const even = await isEven(v)
    return [even, v]
  })))
    .filter(x => x[0])
    .map(x => x[1])
```

</details>

```ts
import { P } from '@antfu/p'

const items = [1, 2, 3, 4, 5]

await P(items)
  .map(async i => await multiply(i, 3))
  .filter(async i => await isEven(i))
// [6, 12]
```

```ts
import { P } from '@antfu/p'

const p = P()

// collect promises that are not necessarily needed to be resolved right away
p.add(promiseTask1)

someOtherTasks()

p.add(promiseTask2)

someOtherTasks()

p.add(promiseTask3)

// resolve all collected promises
await p
// => Promise.all([promiseTask1, promiseTask2, promiseTask3])
```

```ts
import { P } from '@antfu/p'

// will limit the number of concurrent tasks
await P(myTasks, { concurrency: 5 })
```
## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg'/>
  </a>
</p>

## License

[MIT](./LICENSE) License © 2021 [Anthony Fu](https://github.com/antfu)
