import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const ts = (...lines: string[]) => code('ts', ...lines)
const html = (...lines: string[]) => code('html', ...lines)

const CARDS: CardContent[] = [
  {
    front: 'What is the Composition API?',
    back: 'Writing component logic with imported functions like `ref`, `computed` and `watch`, instead of the Options API’s `data`, `methods` and `computed` options',
    extra: 'Vue 3 supports both; the Composition API makes logic easier to reuse and to type.',
  },
  {
    front: 'What does `<script setup>` do?',
    back: 'Compile-time sugar for the Composition API: variables, functions and imports declared at its top level are usable directly in the template',
  },
  {
    front: 'What does `ref()` return?',
    back: 'A reactive object holding the value in `.value`; reading `.value` tracks it, writing it triggers updates',
    extra: ts('const count = ref(0)', 'count.value++'),
  },
  {
    front: 'Why don’t you write `.value` in templates?',
    back: 'Top-level refs are unwrapped automatically in the template, so `{{ count }}` reads `count.value`',
  },
  {
    front: '`ref()` vs `reactive()`',
    back: '`reactive()` makes an object deeply reactive through a Proxy, with no `.value`, but only works on objects, arrays, Maps and Sets; `ref()` holds any value',
    extra: 'The Vue docs recommend `ref()` as the default.',
  },
  {
    front: `Why does \`count\` stop updating?\n${ts('const state = reactive({ count: 0 })', 'let { count } = state')}`,
    back: 'Destructuring copies the current value into a plain variable, disconnected from the proxy. Keep using `state.count`, or destructure `toRefs(state)`',
  },
  {
    front: 'Why shouldn’t you replace a whole `reactive()` object?',
    back: 'The template and watchers track the original proxy; assigning a new object breaks that link. Mutate its properties, or use a `ref` and assign `.value`',
  },
  {
    front: 'What does `computed()` do?',
    back: 'Returns a read-only ref whose getter result is cached and only recomputed when one of its reactive dependencies changes',
    extra: ts('const fullName = computed(() => first.value + " " + last.value)'),
  },
  {
    front: 'A computed property vs a method called in the template',
    back: 'A computed value is cached until its dependencies change; a method runs again on every re-render',
  },
  {
    front: 'What should a computed getter never do?',
    back: 'Cause side effects: no mutating other state, async requests or DOM changes. Use a watcher for those',
  },
  {
    front: '`watch` vs `watchEffect`',
    back: '`watch` is lazy, watches explicit sources and passes new and old values; `watchEffect` runs immediately and tracks whatever reactive state it reads',
  },
  {
    front: `Why doesn’t this watcher work?\n${ts('const state = reactive({ count: 0 })', 'watch(state.count, (n) => console.log(n))')}`,
    back: '`state.count` passes a plain number, not a reactive source. Pass a getter: `watch(() => state.count, …)`',
  },
  {
    front: 'What do the `immediate` and `deep` watch options do?',
    back: '`immediate: true` also runs the callback once right away; `deep: true` fires on nested mutations too',
    extra: 'Watching a `reactive()` object directly is deep automatically.',
  },
  {
    front: 'How do you stop a watcher?',
    back: 'Call the function that `watch` or `watchEffect` returns; watchers created synchronously in `setup` stop automatically on unmount',
  },
  {
    front: 'Declare typed props in `<script setup>`',
    back: ts('const props = defineProps<{', '  title: string', '  count?: number', '}>()'),
    extra: '`defineProps` is a compiler macro, so it needs no import.',
  },
  {
    front: 'Can a child component change a prop?',
    back: 'No. Props flow one way, parent to child, and Vue warns on mutation; emit an event or copy the value into a local ref',
  },
  {
    front: 'Is destructuring `defineProps()` reactive?',
    back: 'Since Vue 3.5, yes: the compiler rewrites `title` to `props.title`. To watch one, pass a getter: `watch(() => title, …)`',
    extra: 'Before 3.5, destructured props lost reactivity.',
  },
  {
    front: 'Declare and emit an event in `<script setup>`',
    back: ts('const emit = defineEmits<{ change: [id: number] }>()', '', 'emit("change", 42)'),
    extra: 'The parent listens with `<Item @change="onChange" />`.',
  },
  { front: 'What is `@` in `@click="save"`?', back: 'Shorthand for `v-on:`, which listens to DOM events or component events' },
  {
    front: 'What is `:` in `:src="url"`?',
    back: 'Shorthand for `v-bind:`, which binds an attribute or prop to a JavaScript expression',
    extra: 'Since Vue 3.4, `:src` alone means `:src="src"`.',
  },
  {
    front: 'What does `v-model` do on an `<input>`?',
    back: 'Two-way binding: it sets the input’s value and updates the variable on every `input` event',
  },
  {
    front: 'What does `v-model` expand to on a component?',
    back: 'A `modelValue` prop plus a listener for the `update:modelValue` event',
    extra: html(
      '<Search v-model="query" />',
      '<!-- is short for -->',
      '<Search :modelValue="query" @update:modelValue="query = $event" />',
    ),
  },
  {
    front: 'What does `defineModel()` do?',
    back: 'Since Vue 3.4, it declares the `v-model` prop and event for you and returns a ref; assigning to it updates the parent',
    extra: ts('const model = defineModel<string>()', 'model.value = "new text"'),
  },
  {
    front: '`v-model` modifiers `.lazy`, `.number`, `.trim`',
    back: '`.lazy` syncs on `change` instead of `input`; `.number` casts the value to a number; `.trim` strips surrounding whitespace',
  },
  {
    front: '`v-if` vs `v-show`',
    back: '`v-if` creates and destroys the element; `v-show` always renders it and toggles CSS `display`',
    extra: 'Prefer `v-show` for things toggled often, `v-if` for conditions that rarely change.',
  },
  {
    front: 'Render a list with `v-for`',
    back: html('<li v-for="todo in todos" :key="todo.id">', '  {{ todo.text }}', '</li>'),
    extra: 'Use a stable unique `key`, not the index, when items can be reordered or removed.',
  },
  {
    front: 'What happens with `v-if` and `v-for` on the same element?',
    back: 'In Vue 3, `v-if` is evaluated first, so it can’t see the loop variable. Filter with a computed, or move `v-for` to a wrapping `<template>`',
    extra: 'Vue 2 had the opposite priority.',
  },
  {
    front: `What does this render?\n${html('<span v-for="n in 3">{{ n }}</span>')}`,
    back: 'Three spans containing 1, 2 and 3: a number range in `v-for` starts at 1, not 0',
  },
  {
    front: 'What do `.prevent` and `.stop` do on an event?',
    back: '`.prevent` calls `event.preventDefault()`; `.stop` calls `event.stopPropagation()`',
    extra: 'Example: `@submit.prevent="send"`. Key modifiers work too: `@keyup.enter="send"`.',
  },
  {
    front: 'Why is `v-html` risky?',
    back: 'It inserts raw HTML, so user-supplied content can inject scripts (XSS); `{{ }}` interpolation always escapes text',
  },
  {
    front: 'Toggle classes with `:class`',
    back: html(`<div :class="{ active: isActive, 'text-error': hasError }"></div>`),
    extra: 'Arrays work too: `:class="[base, { active: isActive }]"`.',
  },
  {
    front: 'What can go inside `{{ }}`?',
    back: 'A single JavaScript expression, like `ok ? "Yes" : "No"`; statements such as `if` or `let` aren’t allowed',
  },
  {
    front: 'Default and named slots',
    back: html(
      '<!-- Card.vue -->',
      '<header><slot name="header" /></header>',
      '<slot>Fallback content</slot>',
      '',
      '<!-- Parent -->',
      '<Card>',
      '  <template #header>Title</template>',
      '  Body text',
      '</Card>',
    ),
    extra: '`#header` is shorthand for `v-slot:header`.',
  },
  {
    front: 'What is a scoped slot?',
    back: 'A slot that passes data from the child back to the parent’s slot content',
    extra: html(
      '<!-- List.vue -->',
      '<slot :item="item" />',
      '',
      '<!-- Parent -->',
      '<List v-slot="{ item }">{{ item.name }}</List>',
    ),
  },
  {
    front: 'What goes in a single-file component (`.vue` file)?',
    back: 'A `<template>`, a `<script>` or `<script setup>` block and optional `<style>` blocks, compiled by a build tool such as Vite',
  },
  {
    front: 'What does `<style scoped>` do?',
    back: 'The compiler adds a `data-v-…` attribute to the component’s elements and rewrites its selectors, so the CSS applies only to this component',
    extra: 'A child component’s root element is still styled by the parent’s scoped CSS.',
  },
  {
    front: 'Which lifecycle hook is the first that can access the DOM?',
    back: '`onMounted`; undo timers and listeners in `onUnmounted`',
  },
  {
    front: 'Get a reference to a DOM element',
    back: ts(
      '// template: <input ref="search" />',
      'const search = useTemplateRef<HTMLInputElement>("search")',
      'onMounted(() => search.value?.focus())',
    ),
    extra:
      '`useTemplateRef` is Vue 3.5+; before that, declare `const search = ref(null)` with the same name. It is `null` until mounted.',
  },
  {
    front: 'What is `nextTick()` for?',
    back: 'Waiting until Vue has applied pending DOM updates after a state change: `await nextTick()`',
    extra: 'Vue batches DOM updates and applies them asynchronously.',
  },
  {
    front: 'What are `provide` and `inject`?',
    back: 'A way for an ancestor to pass data to any descendant without prop drilling',
    extra: ts(
      'provide("theme", theme)                // in an ancestor',
      'const theme = inject("theme", "light")  // in a descendant, with a default',
    ),
  },
  {
    front: 'What is a composable?',
    back: 'A function, named `useSomething` by convention, that uses the Composition API to package and reuse stateful logic',
    extra: ts(
      'export function useCounter() {',
      '  const count = ref(0)',
      '  const inc = () => count.value++',
      '  return { count, inc }',
      '}',
    ),
  },
  {
    front: 'Why can’t a parent call a `<script setup>` child’s function through a template ref?',
    back: '`<script setup>` components are closed by default; the child must list what it shares with `defineExpose({ reset })`',
  },
  {
    front: 'What is attribute fallthrough?',
    back: 'Attributes and listeners not declared as props or emits, like `class`, `style` and `id`, are added to the component’s root element',
    extra: 'Turn it off with `defineOptions({ inheritAttrs: false })` and read them with `useAttrs()`.',
  },
  {
    front: 'Create and mount a Vue 3 app with Pinia',
    back: ts('const app = createApp(App)', 'app.use(createPinia())', 'app.mount("#app")'),
  },
  {
    front: 'What is Pinia?',
    back: 'Vue’s official state management library and the successor to Vuex: stores with state, getters and actions, fully typed and devtools-friendly',
  },
  {
    front: 'Define a Pinia setup store',
    back: ts(
      'export const useCartStore = defineStore("cart", () => {',
      '  const items = ref<Item[]>([])',
      '  const count = computed(() => items.value.length)',
      '  function add(item: Item) {',
      '    items.value.push(item)',
      '  }',
      '  return { items, count, add }',
      '})',
    ),
    extra: 'Refs become state, computeds become getters, functions become actions. Return every piece of state.',
  },
  {
    front: `Why doesn’t \`count\` update?\n${ts('const store = useCounterStore()', 'const { count } = store')}`,
    back: 'Destructuring a store breaks reactivity. Use `const { count } = storeToRefs(store)`; actions can be destructured directly',
  },
  {
    front: 'How does Vue 3 track reactivity?',
    back: 'With JavaScript Proxies for `reactive()` and getters/setters for `ref()`; effects record what they read and re-run when it changes',
    extra: 'That is why adding a new property or setting an array index is reactive in Vue 3, unlike Vue 2.',
  },
  {
    front: 'What does `shallowRef()` do?',
    back: 'Only assigning `.value` is reactive; changes inside the value aren’t tracked. Useful for large or external objects',
  },
  {
    front: 'What does `<Teleport to="body">` do?',
    back: 'Renders its content into another DOM node, such as `body`, while it stays logically part of the component; handy for modals',
  },
]

export const VUE: PublicDeck = {
  slug: 'vue-essentials',
  title: 'Vue essentials: 50 cards on the Composition API, reactivity and Pinia',
  shortTitle: 'Vue',
  category: 'web',
  level: 'beginner',
  icon: 'code',
  description:
    'Vue 3 fundamentals: ref vs reactive, computed and watch, props and emits, v-model, directives, slots, single-file components and Pinia stores.',
  intro:
    'Vue 3 is approachable, but its reactivity has rules worth memorizing: when a value needs .value, why destructuring a reactive object or a Pinia store loses updates, and how watch differs from watchEffect. These cards cover the Composition API with script setup, template directives, component communication and Pinia, with notes on what changed in Vue 3.4 and 3.5.',
  faq: [
    {
      q: 'Does this deck use the Options API or the Composition API?',
      a: 'The Composition API with script setup, which is what the Vue docs and most new projects use. The concepts behind directives, props and slots are the same in both.',
    },
    {
      q: 'Which Vue version does it cover?',
      a: 'Vue 3, including newer additions such as defineModel (3.4), reactive props destructure and useTemplateRef (3.5).',
    },
    {
      q: 'Should I use ref or reactive?',
      a: 'The Vue docs recommend ref as the default: it works with any value and survives destructuring and reassignment. reactive is fine for objects you only mutate in place.',
    },
    {
      q: 'Is Pinia required?',
      a: 'No. Small apps can share state with composables or provide and inject. Pinia adds devtools support, SSR safety and a consistent structure for larger apps.',
    },
  ],
  cards: CARDS,
}
