import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const js = (...lines: string[]) => code('js', ...lines)

const CARDS: CardContent[] = [
  {
    front: '`==` vs `===`',
    back: '`===` compares without type coercion; `==` converts types first',
    extra: js("0 == ''   // true", "0 === ''  // false"),
  },
  {
    front: '`let` vs `const`',
    back: 'Both are block-scoped; a `const` binding can’t be reassigned',
    extra: 'Objects declared with `const` can still be mutated.',
  },
  { front: 'How is `var` scoped?', back: 'To the enclosing function, and it is hoisted (initialized as `undefined`)' },
  {
    front: 'Temporal dead zone',
    back: 'A `let`/`const` variable exists from the start of its block but throws a ReferenceError if used before its declaration',
  },
  {
    front: 'What is a closure?',
    back: 'A function that keeps access to variables from the scope where it was created',
    extra: js(
      'function counter() {',
      '  let n = 0',
      '  return () => ++n',
      '}',
      'const next = counter()',
      'next() // 1',
      'next() // 2',
    ),
  },
  {
    front: 'What is `this` inside an arrow function?',
    back: 'Arrows have no own `this`; they use `this` from the enclosing scope',
  },
  { front: '`typeof null`', back: "`'object'`, a long-standing quirk of the language" },
  { front: 'How do you check that a value is an array?', back: '`Array.isArray(value)`', extra: "`typeof []` is `'object'`." },
  { front: 'The falsy values', back: "`false`, `0`, `-0`, `0n`, `''`, `null`, `undefined`, `NaN`" },
  { front: '`NaN === NaN`', back: '`false`; use `Number.isNaN(x)`' },
  { front: 'What does `a ?? b` return?', back: '`b` only when `a` is `null` or `undefined`, otherwise `a`' },
  {
    front: '`||` vs `??`',
    back: "`||` falls back on any falsy value (like `0` or `''`); `??` only on `null`/`undefined`",
    extra: js('0 || 10  // 10', '0 ?? 10  // 0'),
  },
  {
    front: 'Optional chaining',
    back: '`a?.b` returns `undefined` instead of throwing when `a` is `null` or `undefined`',
    extra: js('user?.address?.city', 'callback?.()'),
  },
  { front: 'Object destructuring with a default', back: js('const { name, age = 30 } = user') },
  { front: 'Swap two variables', back: js('[a, b] = [b, a]') },
  { front: 'Concatenate arrays with spread', back: js('const all = [...a, ...b]') },
  { front: 'Shallow-copy an object and override a key', back: js('const next = { ...state, done: true }') },
  {
    front: 'Rest parameters',
    back: 'Collect remaining arguments into an array',
    extra: js('function sum(...nums) {', '  return nums.reduce((a, b) => a + b, 0)', '}'),
  },
  { front: 'Template literal', back: js('const msg = `Hi ${name}, you have ${count} cards`') },
  { front: 'What does `map` return?', back: 'A new array with each element transformed by the callback' },
  { front: 'What does `filter` return?', back: 'A new array with the elements that pass the test' },
  { front: 'Sum an array with `reduce`', back: js('[1, 2, 3].reduce((sum, x) => sum + x, 0) // 6') },
  {
    front: '`find` vs `filter`',
    back: '`find` returns the first match (or `undefined`); `filter` returns every match in a new array',
  },
  { front: '`some` vs `every`', back: '`some` is true if any element passes; `every` is true only if all pass' },
  { front: 'What does `forEach` return?', back: 'Always `undefined`. You can’t `break` out of it; use `for...of` instead' },
  {
    front: '`for...of` vs `for...in`',
    back: '`for...of` iterates values of an iterable; `for...in` iterates enumerable property keys',
  },
  {
    front: 'What is a Promise?',
    back: 'An object for a value that will be available later: pending, then fulfilled or rejected',
  },
  { front: 'What does an `async` function return?', back: 'Always a Promise; `await` inside it pauses until a promise settles' },
  { front: '`Promise.all`', back: 'Resolves with all results when every promise resolves; rejects on the first rejection' },
  {
    front: '`Promise.allSettled`',
    back: 'Waits for every promise and never rejects; gives each one’s status and value or reason',
  },
  {
    front: '`Promise.race` vs `Promise.any`',
    back: '`race` settles like the first promise to settle; `any` resolves with the first to fulfil',
  },
  {
    front: `In what order does this log?\n${js("setTimeout(() => console.log('timeout'), 0)", "Promise.resolve().then(() => console.log('micro'))", "console.log('sync')")}`,
    back: '`sync`, `micro`, `timeout`: promise callbacks (microtasks) run before the next timer (macrotask)',
  },
  {
    front: 'Can you call a function declaration before it appears?',
    back: 'Yes. Function declarations are hoisted with their body',
  },
  {
    front: '`this` in a plain function call in strict mode',
    back: '`undefined`',
    extra: 'In sloppy mode it is the global object.',
  },
  {
    front: '`call`, `apply`, `bind`',
    back: '`call(thisArg, ...args)`, `apply(thisArg, argsArray)`; `bind` returns a new function with `this` fixed',
  },
  {
    front: 'What is the prototype chain?',
    back: 'Objects inherit properties from their prototype, and its prototype, up to `null`',
  },
  {
    front: 'Class syntax',
    back: 'Sugar over prototypes',
    extra: js('class Deck {', '  constructor(name) { this.name = name }', '  rename(n) { this.name = n }', '}'),
  },
  {
    front: 'Private class field',
    back: 'Declared with `#`; only accessible inside the class body',
    extra: js('class Counter {', '  #n = 0', '  inc() { return ++this.#n }', '}'),
  },
  { front: 'Deep-copy an object', back: '`structuredClone(obj)`', extra: 'Spread (`{ ...obj }`) only copies one level.' },
  { front: 'Convert between objects and JSON', back: '`JSON.stringify(obj)` and `JSON.parse(text)`' },
  { front: '`Map` vs plain object', back: 'A Map accepts keys of any type, keeps insertion order and has `.size`' },
  { front: 'Remove duplicates from an array', back: js('const unique = [...new Set(items)]') },
  { front: 'WeakMap', back: 'A map whose keys are objects held weakly, so they can still be garbage-collected' },
  { front: 'Symbol', back: 'A unique, immutable primitive, often used as a non-colliding property key' },
  {
    front: 'Named vs default export',
    back: js(
      "export function load() {}     // import { load } from './x.js'",
      "export default function () {} // import anything from './x.js'",
    ),
  },
  {
    front: 'When is strict mode on automatically?',
    back: 'Inside ES modules and class bodies',
    extra: 'Elsewhere, enable it with `"use strict"`.',
  },
  {
    front: 'Debounce',
    back: 'Delay a function until calls have stopped for a while',
    extra: js(
      'function debounce(fn, ms) {',
      '  let timer',
      '  return (...args) => {',
      '    clearTimeout(timer)',
      '    timer = setTimeout(() => fn(...args), ms)',
      '  }',
      '}',
    ),
  },
  {
    front: '`includes` vs `indexOf`',
    back: '`includes` returns a boolean and finds `NaN`; `indexOf` returns a position and can’t find `NaN`',
  },
  {
    front: "`parseInt('42px', 10)`",
    back: '`42`; it reads digits until the first non-digit',
    extra: "`Number('42px')` is `NaN`.",
  },
  { front: '`Array.from({ length: 3 }, (_, i) => i)`', back: '`[0, 1, 2]`' },
]

export const JAVASCRIPT: PublicDeck = {
  slug: 'javascript-essentials',
  title: 'JavaScript essentials: 50 core concepts',
  shortTitle: 'JavaScript',
  category: 'programming',
  level: 'intermediate',
  icon: 'code',
  description:
    'Master the JavaScript every developer uses daily: scope, closures, equality, array methods, promises, async/await and the event loop.',
  intro:
    'Fifty cards on the parts of JavaScript that trip people up in code reviews and interviews: coercion, `this`, hoisting, closures, promise combinators and the event loop. Answers are short; where it helps, the card shows a runnable snippet.',
  faq: [
    {
      q: 'Is this deck good for interview prep?',
      a: 'Yes. It covers the questions that come up most: closures, this, equality, promises and the event loop.',
    },
    {
      q: 'Do I need to know another language first?',
      a: 'No, but it assumes you have written a little JavaScript and know what variables, functions and arrays are.',
    },
    {
      q: 'Does it cover TypeScript?',
      a: 'Not yet. Everything here applies to TypeScript too, since TypeScript compiles to JavaScript.',
    },
  ],
  cards: CARDS,
}
