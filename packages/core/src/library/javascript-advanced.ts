import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const js = (...lines: string[]) => code('js', ...lines)

const CARDS: CardContent[] = [
  {
    front: `In what order does this log?\n${js(
      'console.log(1)',
      'setTimeout(() => console.log(2))',
      'queueMicrotask(() => console.log(3))',
      'Promise.resolve().then(() => console.log(4))',
      'console.log(5)',
    )}`,
    back: '`1 5 3 4 2`: synchronous code, then microtasks in the order they were queued, then the timer',
  },
  {
    front: `In what order does this log?\n${js(
      'async function f() {',
      "  console.log('a')",
      '  await null',
      "  console.log('b')",
      '}',
      'f()',
      "console.log('c')",
    )}`,
    back: '`a c b`: everything after `await` runs later as a microtask',
  },
  {
    front: `In what order does this log?\n${js(
      'Promise.resolve().then(() => {',
      "  console.log('m1')",
      "  setTimeout(() => console.log('t2'))",
      '})',
      'setTimeout(() => {',
      "  console.log('t1')",
      "  Promise.resolve().then(() => console.log('m2'))",
      '})',
    )}`,
    back: '`m1 t1 m2 t2`: after each task (like a timer callback) the microtask queue is drained before the next task',
  },
  {
    front: 'Can microtasks starve the page?',
    back: 'Yes. Microtasks queued by microtasks all run before rendering or the next timer, so an endless chain freezes the page',
  },
  {
    front: 'When does a `requestAnimationFrame` callback run?',
    back: 'Before the browser’s next repaint, usually about 60 times a second; it’s paused in background tabs',
  },
  {
    front: 'What does `Promise.withResolvers()` return?',
    back: '`{ promise, resolve, reject }`, so you can settle a promise from outside its executor (ES2024)',
  },
  {
    front: 'What happens to a rejected promise nobody handles?',
    back: 'Browsers fire an `unhandledrejection` event; Node.js crashes the process by default (since Node 15)',
  },
  {
    front: 'Sequential vs concurrent awaits',
    back: js(
      '// one after another',
      'for (const url of urls) await fetch(url)',
      '',
      '// all at once',
      'await Promise.all(urls.map((url) => fetch(url)))',
    ),
  },
  {
    front: 'Why write `return await` inside `try`?',
    back: 'Without `await`, a rejection happens after the function returns, so the surrounding `catch` never sees it',
    extra: js('try {', '  return await risky()', '} catch (err) {', '  return fallback', '}'),
  },
  {
    front: 'What does `for await...of` iterate?',
    back: 'Async iterables (and sync iterables of promises), awaiting each value in turn',
  },
  {
    front: 'What is an async generator?',
    back: 'An `async function*` that can `await` and `yield`; consume it with `for await`',
    extra: js(
      'async function* pages(url) {',
      '  while (url) {',
      '    const res = await (await fetch(url)).json()',
      '    yield res.items',
      '    url = res.next',
      '  }',
      '}',
    ),
  },
  {
    front: 'What does calling a generator function return?',
    back: 'An iterator; the body runs only when you call `next()`, pausing at each `yield`',
    extra: js('function* ids() {', '  let i = 0', '  while (true) yield i++', '}', 'const it = ids()', 'it.next().value // 0'),
  },
  {
    front: 'What does an iterator’s `next()` return?',
    back: '`{ value, done }`; `done` is `true` once the iterator is exhausted',
  },
  {
    front: 'Make an object iterable',
    back: 'Give it a `[Symbol.iterator]` method that returns an iterator (a generator is easiest)',
    extra: js(
      'const range = {',
      '  from: 1,',
      '  to: 3,',
      '  *[Symbol.iterator]() {',
      '    for (let i = this.from; i <= this.to; i++) yield i',
      '  },',
      '}',
      '[...range] // [1, 2, 3]',
    ),
  },
  { front: 'What does `Symbol.asyncIterator` enable?', back: 'Using an object with `for await...of`' },
  {
    front: 'What does `Symbol.toPrimitive` customize?',
    back: 'How an object converts to a primitive; it receives a hint: `"number"`, `"string"` or `"default"`',
  },
  {
    front: 'What does `Object.create(null)` give you?',
    back: 'An object with no prototype: no inherited keys like `toString`, handy as a plain dictionary',
  },
  {
    front: 'Class method vs arrow-function class field',
    back: 'Methods live once on the prototype; arrow fields are created per instance and keep `this` bound',
    extra: js(
      'class Button {',
      '  click() {}          // shared, on the prototype',
      '  onClick = () => {}  // per instance, `this` fixed',
      '}',
    ),
  },
  { front: 'Where do `static` class members live?', back: 'On the class (constructor) itself, not on instances' },
  {
    front: 'In a subclass constructor, what must happen before you use `this`?',
    back: 'A call to `super(...)`; using `this` first throws a ReferenceError',
  },
  {
    front: 'Precedence of the `this` binding rules',
    back: '`new` › explicit (`call`/`apply`/`bind`) › method call (`obj.fn()`) › default (`undefined` in strict mode)',
  },
  {
    front: 'Why is `this` undefined here?\n`const f = obj.method; f()`',
    back: 'The method was called without its object; bind it (`obj.method.bind(obj)`) or wrap it in an arrow',
    extra: 'In strict mode (modules, classes) it’s `undefined`; in sloppy scripts it’s the global object.',
  },
  {
    front: 'Can you change `this` by calling `bind` on a bound function?',
    back: 'No. The first `bind` wins; later `bind` calls can only add arguments',
  },
  {
    front: 'Break out of a nested loop',
    back: 'Label the outer loop and `break` to the label',
    extra: js(
      'outer: for (const row of grid) {',
      '  for (const cell of row) {',
      '    if (cell === target) break outer',
      '  }',
      '}',
    ),
  },
  {
    front: `What does this log?\n${js('for (var i = 0; i < 3; i++) {', '  setTimeout(() => console.log(i))', '}')}`,
    back: '`3 3 3`: one shared `var`. With `let`, each iteration gets its own binding and it logs `0 1 2`',
  },
  {
    front: 'How do closures cause memory leaks?',
    back: 'A closure keeps everything it captures alive while the function is reachable, so long-lived listeners and timers can pin large objects',
  },
  {
    front: 'What does `WeakRef` do?',
    back: 'Holds an object without keeping it alive; `ref.deref()` returns it, or `undefined` once it’s collected',
  },
  {
    front: 'What is `FinalizationRegistry` for?',
    back: 'Running a callback some time after a registered object is garbage-collected; timing isn’t guaranteed',
  },
  {
    front: 'A typical use of `WeakSet`',
    back: 'Marking objects (like “already processed”) without stopping them from being garbage-collected',
  },
  {
    front: 'What is a `Proxy`?',
    back: 'A wrapper that intercepts operations on an object through traps like `get`, `set` and `has`',
    extra: js(
      'const logged = new Proxy(target, {',
      '  get(t, key, receiver) {',
      "    console.log('read', key)",
      '    return Reflect.get(t, key, receiver)',
      '  },',
      '})',
    ),
  },
  {
    front: 'Why use `Reflect` inside proxy traps?',
    back: '`Reflect.get`, `Reflect.set` and friends perform the default operation, so a trap can add behavior and then forward',
  },
  {
    front: 'Define a getter and a setter',
    back: js(
      'const user = {',
      "  first: 'Ada', last: 'Lovelace',",
      '  get full() { return `${this.first} ${this.last}` },',
      "  set full(v) { [this.first, this.last] = v.split(' ') },",
      '}',
    ),
  },
  {
    front: 'Defaults of `writable`, `enumerable` and `configurable` with `Object.defineProperty`',
    back: 'All `false` unless you set them',
  },
  {
    front: 'Is `Object.freeze` deep?',
    back: 'No, it’s shallow: nested objects stay mutable. Writes to a frozen property fail silently, or throw in strict mode',
  },
  {
    front: 'What can’t `structuredClone` copy?',
    back: 'Functions and DOM nodes (it throws), and it drops prototypes, so class instances come back as plain objects',
  },
  {
    front: 'ES modules vs CommonJS',
    back: 'ESM `import`/`export` is static, loaded asynchronously and always strict; CommonJS `require` runs synchronously at call time',
  },
  {
    front: 'What is a live binding?',
    back: 'An ES module import that reflects later changes to the exported variable; CommonJS copies the value when you `require` it',
  },
  {
    front: 'Load a module on demand',
    back: js("const { render } = await import('./chart.js')"),
    extra: 'Dynamic `import()` returns a promise and enables code splitting.',
  },
  {
    front: 'Where is top-level `await` allowed?',
    back: 'In ES modules. Modules that import one wait for it to finish evaluating',
  },
  {
    front: 'Throttle',
    back: 'Run a function at most once per interval',
    extra: js(
      'function throttle(fn, ms) {',
      '  let last = 0',
      '  return (...args) => {',
      '    const now = Date.now()',
      '    if (now - last >= ms) {',
      '      last = now',
      '      fn(...args)',
      '    }',
      '  }',
      '}',
    ),
  },
  {
    front: 'Cancel a `fetch`',
    back: js(
      'const ctrl = new AbortController()',
      'fetch(url, { signal: ctrl.signal })',
      'ctrl.abort() // the fetch rejects with an AbortError',
    ),
  },
  {
    front: 'Give a `fetch` a timeout',
    back: js('fetch(url, { signal: AbortSignal.timeout(5000) })'),
    extra: 'It rejects with a TimeoutError after 5 seconds.',
  },
  {
    front: '`Uint8Array` vs `Uint8ClampedArray`',
    back: 'Both store bytes; out-of-range values wrap around in `Uint8Array` (256 → 0) and clamp to 0–255 in the clamped one',
  },
  {
    front: 'What does a template tag function receive?',
    back: 'The literal string parts, then the interpolated values',
    extra: js(
      'function upper(strings, ...values) {',
      "  return strings.reduce((out, s, i) => out + s + (values[i]?.toUpperCase() ?? ''), '')",
      '}',
      "upper`hi ${'ada'}!` // 'hi ADA!'",
    ),
  },
  { front: '`Object.is(-0, 0)` and `Object.is(NaN, NaN)`', back: '`false` and `true`, the opposite of `===`' },
  { front: '`[] + {}` and `[] + []`', back: "`'[object Object]'` and `''`: both sides convert to strings, then concatenate" },
  {
    front: "`'5' - 2` vs `'5' + 2`",
    back: "`3` vs `'52'`: `-` converts to numbers, `+` concatenates when either side is a string",
  },
  {
    front: '`0.1 + 0.2 === 0.3`',
    back: '`false`; floating-point rounding gives `0.30000000000000004`',
    extra: 'Compare with a tolerance: `Math.abs(a - b) < Number.EPSILON`.',
  },
  {
    front: 'Group array items by a key',
    back: js('Object.groupBy(cards, (c) => c.deck) // { Japanese: [...], Spanish: [...] }'),
    extra: 'ES2024. `Map.groupBy` does the same into a Map.',
  },
  { front: '`sort` vs `toSorted`', back: '`sort` reorders the array in place; `toSorted` returns a sorted copy (ES2023)' },
]

export const JAVASCRIPT_ADVANCED: PublicDeck = {
  slug: 'javascript-advanced',
  title: 'Advanced JavaScript flashcards: event loop, generators and more',
  shortTitle: 'Advanced JS',
  category: 'programming',
  level: 'intermediate',
  icon: 'code',
  description:
    'Fifty advanced JavaScript cards: event-loop ordering puzzles, generators and async iteration, this binding, Proxy and Reflect, modules, AbortController and coercion edge cases.',
  intro:
    'The next step after the essentials: predict the output of event-loop puzzles, build iterables and async generators, reason about `this` and prototypes, and know the newer APIs like `Promise.withResolvers`, `Object.groupBy` and `AbortSignal.timeout`. Every snippet runs in a modern browser or Node.js.',
  faq: [
    {
      q: 'Should I start with this deck?',
      a: 'Start with JavaScript essentials. This deck assumes you know closures, promises and array methods.',
    },
    {
      q: 'Are the event-loop answers the same in Node.js?',
      a: 'Yes for these examples: microtasks run before the next timer callback in both browsers and Node.js.',
    },
    {
      q: 'Is it useful for senior interviews?',
      a: 'Yes. Event-loop ordering, this binding and generators are classic senior-level questions.',
    },
  ],
  cards: CARDS,
}
