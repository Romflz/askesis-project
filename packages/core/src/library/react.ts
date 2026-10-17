import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const tsx = (...lines: string[]) => code('tsx', ...lines)

const CARDS: CardContent[] = [
  { front: 'What is a React component?', back: 'A function that returns JSX; its name must start with a capital letter' },
  {
    front: 'Can a component change its props?',
    back: 'No. Props are read-only; change data through state or a callback from the parent',
  },
  {
    front: 'Why `className` instead of `class` in JSX?',
    back: 'JSX compiles to JavaScript, where `class` is a reserved word (likewise `htmlFor` for `for`)',
  },
  {
    front: `What renders when \`count\` is 0?\n${tsx('{count && <Badge count={count} />}')}`,
    back: 'A literal `0`. Use a boolean: `{count > 0 && <Badge count={count} />}`',
  },
  {
    front: 'What should a list item’s `key` be?',
    back: 'A stable ID unique among its siblings; array indexes break when items are reordered or removed',
  },
  {
    front: 'What happens when a component’s `key` changes?',
    back: 'React unmounts it and mounts a fresh one, resetting its state',
  },
  {
    front: 'What does `useState` return?',
    back: 'The current value and a setter; calling the setter schedules a re-render',
    extra: tsx('const [count, setCount] = useState(0)'),
  },
  {
    front: 'When should you pass a function to a state setter?',
    back: 'When the next state depends on the previous one',
    extra: tsx('setCount((c) => c + 1)'),
  },
  {
    front: `What is \`count\` after one click if it starts at 0?\n${tsx('function onClick() {', '  setCount(count + 1)', '  setCount(count + 1)', '}')}`,
    back: '`1`: both calls read the same snapshot. With `setCount(c => c + 1)` twice it would be `2`',
  },
  {
    front: 'Why doesn’t the state variable change right after calling its setter?',
    back: 'State is a snapshot for the current render; the new value shows up on the next render',
  },
  {
    front: 'What is automatic batching?',
    back: 'Since React 18, several state updates in the same event, timeout or promise are combined into one re-render',
  },
  {
    front: 'Add an item to an array in state',
    back: tsx('setItems([...items, item])'),
    extra: 'Never mutate state (`items.push`); React compares references.',
  },
  {
    front: 'What makes a component re-render?',
    back: 'Its state changes, its parent re-renders, or a context it reads changes',
  },
  {
    front: 'What is `useEffect` for?',
    back: 'Synchronizing a component with something outside React: subscriptions, timers, the DOM, network connections',
  },
  {
    front: 'Clean up an effect',
    back: 'Return a function; React runs it before the effect runs again and on unmount',
    extra: tsx('useEffect(() => {', '  const id = setInterval(tick, 1000)', '  return () => clearInterval(id)', '}, [])'),
  },
  {
    front: 'Effect dependency arrays: `[]`, `[a, b]`, omitted',
    back: '`[]` runs after mount only; `[a, b]` runs when `a` or `b` changes (compared with `Object.is`); omitted runs after every render',
  },
  {
    front: 'What is a stale closure in a hook?',
    back: 'An effect or callback that reads an old value because a dependency is missing from its array',
  },
  {
    front: 'Why do effects run twice in development?',
    back: 'StrictMode mounts, unmounts and remounts components once to expose missing cleanup; production runs them once',
  },
  {
    front: 'Should you sync derived data with an effect?',
    back: 'No. Compute it during render (`const total = items.length`); effects for derived state cause extra renders and bugs',
  },
  { front: 'What does `useMemo` do?', back: 'Caches a computed value between renders until its dependencies change' },
  {
    front: 'What does `useCallback` do?',
    back: 'Caches a function between renders, so children wrapped in `memo` don’t re-render needlessly',
    extra: '`useCallback(fn, deps)` equals `useMemo(() => fn, deps)`.',
  },
  { front: 'What does `memo` do?', back: 'Skips re-rendering a component when its props are shallowly equal to last time' },
  {
    front: 'What does the React Compiler do?',
    back: 'Adds memoization automatically at build time, so most manual `useMemo`, `useCallback` and `memo` become unnecessary',
  },
  {
    front: 'What is `useRef` for?',
    back: 'A mutable `.current` that survives re-renders without causing one; also a handle to a DOM node',
    extra: tsx('const input = useRef<HTMLInputElement>(null)', '// <input ref={input} />', 'input.current?.focus()'),
  },
  {
    front: 'How do you pass a ref to your own component in React 19?',
    back: 'As a regular `ref` prop; `forwardRef` is no longer needed for function components',
  },
  { front: 'Controlled input', back: tsx('<input value={name} onChange={(e) => setName(e.target.value)} />') },
  {
    front: 'Uncontrolled input',
    back: 'The DOM keeps the value; set it with `defaultValue` and read it with a ref or `FormData`',
  },
  {
    front: 'Provide and read context in React 19',
    back: tsx(
      'const Theme = createContext("light")',
      '',
      '<Theme value="dark">',
      '  <Page />',
      '</Theme>',
      '',
      'const theme = useContext(Theme) // "dark"',
    ),
    extra: 'Rendering the context itself as a provider replaces `<Theme.Provider>`.',
  },
  {
    front: 'Why can a context make many components re-render?',
    back: 'Every consumer re-renders when the provided value changes by reference; memoize object values',
  },
  {
    front: 'When is `useReducer` a better fit than `useState`?',
    back: 'When state has several related fields or many update types; updates go through a pure `(state, action) => next` function',
    extra: tsx('const [state, dispatch] = useReducer(reducer, initial)', "dispatch({ type: 'added', text })"),
  },
  {
    front: 'What is a custom hook?',
    back: 'A function whose name starts with `use` and that calls other hooks, to reuse stateful logic',
  },
  {
    front: 'The Rules of Hooks',
    back: 'Call hooks only at the top level of components or custom hooks, never in loops, conditions or nested functions',
  },
  {
    front: 'What does `use()` do in React 19?',
    back: 'Reads a promise (suspending until it resolves) or a context; unlike other hooks it can be called conditionally',
  },
  {
    front: 'What does `<Suspense>` do?',
    back: 'Shows its `fallback` while something inside it is suspended, such as lazy code or data read with `use`',
    extra: tsx('<Suspense fallback={<Spinner />}>', '  <Comments />', '</Suspense>'),
  },
  {
    front: 'What can’t an error boundary catch?',
    back: 'Errors in event handlers, async code like timeouts, server rendering, or the boundary itself',
    extra: 'Error boundaries are still written as class components.',
  },
  {
    front: 'What does `useTransition` do?',
    back: 'Marks a state update as non-urgent so typing and clicks stay responsive; `isPending` tells you it’s in progress',
    extra: tsx('const [isPending, startTransition] = useTransition()', 'startTransition(() => setTab(next))'),
  },
  {
    front: 'What does `useDeferredValue` do?',
    back: 'Gives you a version of a value that lags behind during heavy renders, like results trailing a search box',
  },
  {
    front: 'What is `useOptimistic` for?',
    back: 'Showing the expected result of an async action immediately, then settling on the real state when it finishes',
    extra: tsx('const [optimistic, addOptimistic] = useOptimistic(messages, (list, msg) => [...list, msg])'),
  },
  {
    front: 'What does `useActionState` return?',
    back: '`[state, formAction, isPending]`; the action receives the previous state and the form data',
    extra: tsx('const [error, submit, isPending] = useActionState(saveName, null)', '// <form action={submit}>'),
  },
  {
    front: 'What happens with `<form action={fn}>` in React 19?',
    back: 'Submitting calls `fn` with the `FormData`; it can be async, and React tracks the pending state',
  },
  {
    front: 'What does `useFormStatus` read?',
    back: 'The pending state of the parent `<form>`, from a component rendered inside it (it comes from `react-dom`)',
  },
  {
    front: 'What are React Server Components?',
    back: 'Components that run only on the server: they can be async and read data directly, ship no JavaScript, and can’t use state or effects',
  },
  {
    front: "What does `'use client'` mark?",
    back: 'A module (and what it imports) as client code: the boundary where Client Components start',
  },
  { front: "What does `'use server'` mark?", back: 'Server Functions that client code can call, for example as form actions' },
  {
    front: '`useLayoutEffect` vs `useEffect`',
    back: '`useLayoutEffect` runs after DOM changes but before paint, for measuring layout; it blocks painting',
  },
  {
    front: 'What is `useId` for?',
    back: 'Generating unique IDs that match between server and client, e.g. to link a label and an input',
  },
  {
    front: 'Group children without an extra DOM element',
    back: tsx('<>', '  <Title />', '  <Body />', '</>'),
    extra: 'Use `<Fragment key={id}>` when a fragment needs a key.',
  },
  {
    front: 'What does `createPortal` do?',
    back: 'Renders children into another DOM node (for modals and tooltips) while keeping React context and events',
  },
  { front: 'What is “lifting state up”?', back: 'Moving shared state to the closest common parent and passing it down as props' },
  {
    front: 'What causes a hydration mismatch?',
    back: 'The first client render differing from the server HTML, e.g. from `Date.now()`, random values or `window` checks',
    extra: 'Move client-only values into an effect, or render them after mount.',
  },
]

export const REACT: PublicDeck = {
  slug: 'react-essentials',
  title: 'React flashcards: hooks, rendering and React 19',
  shortTitle: 'React',
  category: 'web',
  level: 'intermediate',
  icon: 'code',
  description:
    'Fifty React cards: state and re-rendering, useEffect and cleanup, memoization, refs, context, Suspense and the React 19 APIs like use, useOptimistic and useActionState.',
  intro:
    'React is easy to start and easy to get subtly wrong. These cards cover how rendering and state snapshots really work, when effects run (and when you don’t need one), memoization and the React Compiler, and the newer React 19 features: actions, `use`, optimistic updates and Server Components.',
  faq: [
    { q: 'Which React version does this cover?', a: 'React 19, while noting where behavior has been the same since React 18.' },
    {
      q: 'Do I need TypeScript for these cards?',
      a: 'No. A few snippets use TypeScript generics on refs; the concepts are the same in plain JavaScript.',
    },
    {
      q: 'Does it cover Next.js?',
      a: 'Only the React parts it builds on, like Server Components and the use client and use server directives.',
    },
  ],
  cards: CARDS,
}
