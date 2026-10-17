import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const ts = (...lines: string[]) => code('ts', ...lines)

const CARDS: CardContent[] = [
  {
    front: '`type` vs `interface`',
    back: 'Both describe object shapes; interfaces can be reopened and merged, type aliases can also name unions, tuples, primitives and mapped types',
  },
  {
    front: 'What is declaration merging?',
    back: 'Two `interface` declarations with the same name merge into one with all members',
    extra: ts('interface User { id: string }', 'interface User { name: string }', "const u: User = { id: '1', name: 'Ada' }"),
  },
  {
    front: 'What can you do with a value of type `string | number` before narrowing?',
    back: 'Only what both members support (e.g. `toString()`)',
  },
  {
    front: 'Narrow a union with `typeof`',
    back: ts(
      'function format(v: string | number) {',
      "  if (typeof v === 'number') return v.toFixed(2)",
      '  return v.trim() // v is string here',
      '}',
    ),
  },
  {
    front: 'Narrow with the `in` operator',
    back: ts('function move(a: Fish | Bird) {', "  if ('swim' in a) a.swim()", '  else a.fly()', '}'),
  },
  {
    front: 'What is a discriminated union?',
    back: 'A union whose members share a literal property (like `kind`) that narrows the type when checked',
    extra: ts(
      'type Shape =',
      "  | { kind: 'circle'; r: number }",
      "  | { kind: 'square'; size: number }",
      '',
      'function area(s: Shape) {',
      "  if (s.kind === 'circle') return Math.PI * s.r ** 2",
      '  return s.size ** 2',
      '}',
    ),
  },
  {
    front: 'How do you make a `switch` over a union exhaustive?',
    back: 'Assign the value to `never` in the default branch; a new, unhandled member becomes a compile error',
    extra: ts('default: {', '  const unreachable: never = s', '  throw new Error(`Unhandled: ${unreachable}`)', '}'),
  },
  {
    front: '`unknown` vs `any`',
    back: '`any` switches type checking off; `unknown` accepts anything but must be narrowed before use',
  },
  {
    front: 'What is the `never` type?',
    back: 'The type with no values: functions that always throw, impossible branches, the empty union',
  },
  {
    front: 'Can a `() => void` callback type accept a function that returns a value?',
    back: 'Yes. `void` there means the return value is ignored, so `arr.forEach(x => list.push(x))` type-checks',
  },
  {
    front: 'Write a user-defined type guard',
    back: ts('function isString(x: unknown): x is string {', "  return typeof x === 'string'", '}'),
  },
  {
    front: 'Write an assertion function',
    back: ts('function assert(cond: unknown, msg?: string): asserts cond {', '  if (!cond) throw new Error(msg)', '}'),
    extra: 'Declare it with `function` or an explicitly typed const; TypeScript rejects calls through an unannotated arrow.',
  },
  {
    front: 'A generic function returning the first element',
    back: ts('function first<T>(items: T[]): T | undefined {', '  return items[0]', '}'),
  },
  {
    front: 'Constrain a type parameter',
    back: ts('function longest<T extends { length: number }>(a: T, b: T): T {', '  return a.length >= b.length ? a : b', '}'),
  },
  {
    front: 'What does `keyof` produce?',
    back: 'A union of an object type’s keys',
    extra: ts("type K = keyof { a: 1; b: 2 } // 'a' | 'b'"),
  },
  {
    front: '`typeof` in a type position',
    back: 'The type of a value',
    extra: ts(
      'const config = { port: 3000, host: "localhost" }',
      'type Config = typeof config // { port: number; host: string }',
    ),
  },
  {
    front: 'What is an indexed access type?',
    back: 'Looking up a property’s type by key, like `Config["port"]`; `T[number]` gives an array’s element type',
  },
  {
    front: 'Type a safe property getter',
    back: ts('function get<T, K extends keyof T>(obj: T, key: K): T[K] {', '  return obj[key]', '}'),
  },
  {
    front: 'What is a mapped type?',
    back: 'A type built by iterating over keys',
    extra: ts('type Flags<T> = { [K in keyof T]: boolean }'),
  },
  {
    front: 'Remove `readonly` and `?` in a mapped type',
    back: 'Prefix the modifier with `-`',
    extra: ts('type Concrete<T> = { -readonly [K in keyof T]-?: T[K] }'),
  },
  {
    front: 'Rename keys in a mapped type',
    back: 'Use an `as` clause',
    extra: ts('type Getters<T> = {', '  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]', '}'),
  },
  { front: 'Conditional type syntax', back: ts('type IsString<T> = T extends string ? true : false') },
  {
    front: 'What is `IsString<string | number>` if `IsString<T> = T extends string ? true : false`?',
    back: '`boolean`: conditional types distribute over unions when `T` is a bare type parameter',
    extra: 'Wrap both sides in brackets (`[T] extends [string]`) to stop distribution.',
  },
  {
    front: 'What does `infer` do?',
    back: 'Captures a type inside a conditional type',
    extra: ts('type ElementOf<T> = T extends (infer U)[] ? U : never'),
  },
  {
    front: '`Partial<T>` vs `Required<T>`',
    back: '`Partial` makes every property optional; `Required` makes every property required',
  },
  {
    front: '`Pick<T, K>` vs `Omit<T, K>`',
    back: '`Pick` keeps only the listed keys; `Omit` keeps everything except them',
    extra: ts("type Preview = Pick<Post, 'id' | 'title'>"),
  },
  {
    front: 'What is `Record<K, V>`?',
    back: 'An object type with keys `K` and values `V`',
    extra: ts('const counts: Record<string, number> = {}'),
  },
  { front: 'Get a function’s return and parameter types', back: '`ReturnType<typeof fn>` and `Parameters<typeof fn>`' },
  {
    front: 'What does `Awaited<T>` do?',
    back: 'Unwraps promises recursively',
    extra: ts('type N = Awaited<Promise<Promise<number>>> // number'),
  },
  {
    front: '`Exclude<T, U>` vs `Extract<T, U>`',
    back: '`Exclude` removes union members assignable to `U`; `Extract` keeps only those',
    extra: ts("type BC = Exclude<'a' | 'b' | 'c', 'a'> // 'b' | 'c'"),
  },
  {
    front: 'What does `NonNullable<T>` remove?',
    back: '`null` and `undefined`',
    extra: ts('type S = NonNullable<string | null> // string'),
  },
  {
    front: 'Type an array that can’t be modified',
    back: '`readonly string[]` (or `ReadonlyArray<string>`); `push` and index assignment are errors',
  },
  {
    front: 'What does `as const` do?',
    back: 'Infers the narrowest literal types and makes everything `readonly`',
    extra: ts("const dirs = ['up', 'down'] as const // readonly ['up', 'down']"),
  },
  {
    front: 'Turn an `as const` array into a union type',
    back: ts("const dirs = ['up', 'down'] as const", "type Dir = (typeof dirs)[number] // 'up' | 'down'"),
  },
  {
    front: 'What does `satisfies` do?',
    back: 'Checks a value against a type without widening the value’s inferred type',
    extra: ts(
      "const routes = { home: '/', docs: '/docs' } satisfies Record<string, string>",
      'routes.docs // ok; routes.blog is an error',
    ),
  },
  {
    front: '`as` vs `satisfies`',
    back: '`as` overrides the checker and can hide mistakes; `satisfies` validates and keeps the precise type',
  },
  {
    front: 'What does the `!` in `el!.focus()` do?',
    back: 'Asserts the value isn’t `null` or `undefined`. It’s erased at compile time; there’s no runtime check',
  },
  {
    front: 'String enum vs union of string literals',
    back: 'A union adds no runtime code and accepts plain strings; an `enum` generates a runtime object you must import',
    extra:
      'Enums aren’t erasable syntax, so tools that only strip types (like Node’s built-in TypeScript support) can’t run them.',
  },
  {
    front: 'Template literal type',
    back: ts("type Handler = `on${Capitalize<'click' | 'focus'>}` // 'onClick' | 'onFocus'"),
  },
  { front: 'Labeled tuple type', back: ts('type Point = [x: number, y: number]') },
  {
    front: 'Type a function that concatenates two tuples',
    back: ts(
      'function concat<A extends unknown[], B extends unknown[]>(a: [...A], b: [...B]): [...A, ...B] {',
      '  return [...a, ...b]',
      '}',
    ),
  },
  {
    front: '`name?: string` vs `name: string | undefined`',
    back: 'With `?` the key may be missing; with `| undefined` the key must be present (its value may be `undefined`)',
  },
  {
    front: 'What does `strict: true` enable?',
    back: 'A family of checks, including `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes` and `useUnknownInCatchVariables`',
  },
  {
    front: 'What changes with `strictNullChecks`?',
    back: '`null` and `undefined` are no longer assignable to other types unless the type includes them',
  },
  {
    front: 'What does `noUncheckedIndexedAccess` do?',
    back: 'Index access on arrays and index signatures returns `T | undefined`, so you must handle the missing case',
  },
  {
    front: 'Write function overloads',
    back: ts(
      'function parse(x: string): number',
      'function parse(x: number): string',
      'function parse(x: string | number) {',
      "  return typeof x === 'string' ? Number(x) : String(x)",
      '}',
    ),
    extra: 'Callers only see the overload signatures, not the implementation signature.',
  },
  {
    front: 'What does `import type` do?',
    back: 'Imports something only for type checking; it’s removed from the emitted JavaScript',
    extra: ts("import type { User } from './types'"),
  },
  {
    front: 'What does `verbatimModuleSyntax` enforce?',
    back: 'Imports without `type` are kept in the output as written, so type-only imports must be marked with `type`',
  },
  { front: 'Index signature', back: 'Allows any key of a given type', extra: ts('type Scores = { [player: string]: number }') },
  { front: 'Default for a type parameter', back: ts('type ApiResponse<T = unknown> = { data: T; status: number }') },
]

export const TYPESCRIPT: PublicDeck = {
  slug: 'typescript-essentials',
  title: 'TypeScript flashcards: 50 essentials with code',
  shortTitle: 'TypeScript',
  category: 'programming',
  level: 'intermediate',
  icon: 'code',
  description:
    'Learn the TypeScript you use every day: narrowing, generics, keyof, mapped and conditional types, utility types, satisfies and strict mode, with code on every card.',
  intro:
    'Fifty cards that take you from unions and narrowing to generics, mapped types, conditional types and `infer`, plus the utility types and compiler flags you meet in real projects. Each answer is short and most come with a snippet you could paste into a TypeScript file.',
  faq: [
    {
      q: 'Do I need to know JavaScript first?',
      a: 'Yes. TypeScript adds types on top of JavaScript, so this deck assumes you already write JavaScript.',
    },
    {
      q: 'Which TypeScript version does it cover?',
      a: 'TypeScript 5.x: satisfies, strict mode flags and modern module settings like verbatimModuleSyntax.',
    },
    {
      q: 'Is it useful for interviews?',
      a: 'Yes. Narrowing, generics, keyof and utility types are common interview topics for TypeScript roles.',
    },
  ],
  cards: CARDS,
}
