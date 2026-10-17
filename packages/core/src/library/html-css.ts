import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const html = (...lines: string[]) => code('html', ...lines)
const css = (...lines: string[]) => code('css', ...lines)

const CARDS: CardContent[] = [
  {
    front: 'Why use semantic elements like `<nav>`, `<main>` and `<article>`?',
    back: 'They tell browsers, screen readers and search engines what each part of the page is, for free',
  },
  {
    front: '`<article>` vs `<section>`',
    back: '`<article>` is self-contained and could stand alone; `<section>` groups related content, usually with a heading',
  },
  {
    front: 'How many visible `<main>` elements can a page have?',
    back: 'One, and it must not sit inside `<article>`, `<aside>`, `<header>`, `<footer>` or `<nav>`',
  },
  {
    front: '`<button>` vs `<a>`',
    back: 'A button performs an action; a link navigates. A clickable `<div>` is neither focusable nor announced correctly',
  },
  {
    front: 'What is the default `type` of a `<button>` inside a form?',
    back: '`submit`; use `type="button"` for buttons that shouldn’t submit',
  },
  {
    front: 'Connect a label to an input',
    back: html('<label for="email">Email</label>', '<input id="email" type="email" />'),
    extra: 'Wrapping the input inside the `<label>` works too.',
  },
  {
    front: 'What should `alt` contain?',
    back: 'A description of what the image conveys; use `alt=""` for purely decorative images',
  },
  {
    front: 'The first rule of ARIA',
    back: 'Use a native HTML element with the behavior you need before adding ARIA roles or attributes',
  },
  {
    front: '`aria-label` vs `aria-labelledby`',
    back: '`aria-label` gives a text label directly; `aria-labelledby` points to the ID of visible text that labels the element',
  },
  {
    front: 'What does `aria-live="polite"` do?',
    back: 'Screen readers announce changes inside the element when the user is idle',
  },
  {
    front: '`tabindex="0"` vs `tabindex="-1"`',
    back: '`0` adds the element to the Tab order; `-1` makes it focusable only from script. Avoid positive values',
  },
  { front: 'The CSS box model, inside out', back: 'Content, padding, border, margin' },
  {
    front: 'What does `box-sizing: border-box` change?',
    back: '`width` and `height` include padding and border, so adding padding doesn’t grow the box',
  },
  {
    front: 'What is margin collapsing?',
    back: 'Adjacent vertical margins of block elements merge into the larger one; it doesn’t happen between flex or grid items',
  },
  {
    front: 'Specificity order, highest first',
    back: 'Inline styles › IDs › classes, attributes and pseudo-classes › elements and pseudo-elements',
  },
  { front: 'Specificity of `#nav .item a`', back: '(1, 1, 1): one ID, one class, one element' },
  {
    front: 'How do cascade layers decide which rule wins?',
    back: 'Later layers beat earlier ones regardless of specificity, and unlayered styles beat all layers',
    extra: css('@layer reset, base, components;', '@layer base { a { color: blue } }'),
  },
  {
    front: '`:is()` vs `:where()`',
    back: 'Both match any selector in their list; `:where()` has zero specificity, `:is()` takes its most specific argument',
  },
  {
    front: 'What does `:has()` select?',
    back: 'An element that contains (or is followed by) a match, e.g. `.card:has(img)` is a card with an image',
  },
  {
    front: '`:focus` vs `:focus-visible`',
    back: '`:focus-visible` only matches when the browser would show a focus ring, typically for keyboard users, not mouse clicks',
  },
  { front: 'Flexbox vs grid', back: 'Flexbox lays out items along one axis; grid lays out rows and columns at the same time' },
  {
    front: 'Center a child horizontally and vertically',
    back: css('.parent {', '  display: grid;', '  place-items: center;', '}'),
    extra: 'With flexbox: `justify-content: center; align-items: center;`.',
  },
  { front: 'What is `flex: 1` short for?', back: '`flex-grow: 1; flex-shrink: 1; flex-basis: 0`' },
  {
    front: 'In a flex row, what do `justify-content` and `align-items` control?',
    back: '`justify-content` the main (horizontal) axis; `align-items` the cross (vertical) axis',
  },
  { front: 'What does `gap` do?', back: 'Adds space between flex or grid items without margins on the outer edges' },
  {
    front: 'What is the `fr` unit?',
    back: 'A share of the free space in a grid container',
    extra: css('grid-template-columns: 200px 1fr 2fr;'),
  },
  {
    front: 'A responsive card grid without media queries',
    back: css('grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));'),
  },
  {
    front: '`auto-fill` vs `auto-fit`',
    back: '`auto-fill` keeps empty tracks; `auto-fit` collapses them so the items stretch to fill the row',
  },
  {
    front: 'What is an absolutely positioned element positioned against?',
    back: 'Its nearest ancestor with a `position` other than `static` (or the initial containing block)',
  },
  {
    front: 'Why might `position: sticky` do nothing?',
    back: 'It sticks within its nearest scrolling ancestor; an ancestor with `overflow: hidden` or `auto` becomes that scroller',
  },
  {
    front: 'When is a `position: fixed` element not fixed to the viewport?',
    back: 'When an ancestor has `transform`, `filter`, `backdrop-filter` or `perspective`; that ancestor becomes its containing block',
  },
  {
    front: 'Why doesn’t `z-index: 9999` bring my element to the front?',
    back: 'z-index only competes inside one stacking context; if an ancestor forms a context, the element can’t rise above that ancestor’s siblings',
  },
  {
    front: 'What creates a stacking context?',
    back: 'For example: a positioned element with a `z-index`, `position: fixed` or `sticky`, `opacity` below 1, `transform`, `filter`, `isolation: isolate`',
  },
  {
    front: 'What does `isolation: isolate` do?',
    back: 'Creates a new stacking context and nothing else, to contain z-indexes inside a component',
  },
  { front: 'Does `z-index` work on a `position: static` element?', back: 'No, except on flex and grid items' },
  {
    front: 'What is the top layer?',
    back: 'Where modal `<dialog>`s (`showModal()`) and popovers render: above everything, whatever the z-index',
  },
  {
    front: '`rem` vs `em`',
    back: '`rem` is relative to the root font size; `em` to the element’s own font size (the parent’s, for `font-size` itself)',
  },
  {
    front: '`100vh` vs `100dvh` on phones',
    back: '`vh` uses the largest viewport and ignores the browser’s toolbars; `dvh` follows the visible area as toolbars appear and hide',
    extra: '`svh` and `lvh` are the smallest and largest viewport sizes.',
  },
  { front: 'Media query with range syntax', back: css('@media (width >= 768px) {', '  .sidebar { display: block; }', '}') },
  {
    front: 'Container query',
    back: 'Style an element by the size of its container instead of the viewport',
    extra: css(
      '.list { container-type: inline-size; }',
      '',
      '@container (min-width: 400px) {',
      '  .card { display: grid; }',
      '}',
    ),
  },
  {
    front: 'Custom property with a fallback',
    back: css(':root { --accent: #c6f432; }', '.btn { background: var(--accent, gold); }'),
    extra: 'Custom properties inherit and can change at runtime.',
  },
  {
    front: 'What are logical properties?',
    back: 'Direction-aware properties like `margin-inline-start` and `padding-block` that follow the writing direction (left-to-right or right-to-left)',
  },
  {
    front: '`transition` vs `animation`',
    back: 'A transition animates between two states when a property changes; an animation runs `@keyframes` and can start on its own and loop',
  },
  {
    front: 'Respect users who prefer less motion',
    back: css(
      '@media (prefers-reduced-motion: reduce) {',
      '  *, *::before, *::after {',
      '    animation: none !important;',
      '    transition: none !important;',
      '  }',
      '}',
    ),
  },
  {
    front: 'Which properties animate most smoothly?',
    back: '`transform` and `opacity`; they can run on the compositor without recalculating layout',
  },
  {
    front: 'What does `color-scheme: light dark` do?',
    back: 'Declares that the page supports both themes, so form controls, scrollbars and `light-dark()` follow the user’s setting',
  },
  {
    front: 'What does `light-dark()` do?',
    back: 'Picks the first color in a light color scheme and the second in a dark one',
    extra: css(':root { color-scheme: light dark; }', 'body { color: light-dark(#111, #eee); }'),
  },
  {
    front: 'What does `aspect-ratio` do?',
    back: 'Keeps a box’s width-to-height ratio',
    extra: css('.thumb { aspect-ratio: 16 / 9; width: 100%; }'),
  },
  { front: 'Clamp a font size between a minimum and maximum', back: css('h1 { font-size: clamp(1.75rem, 4vw, 3rem); }') },
  {
    front: 'Visually hide text but keep it for screen readers',
    back: 'Clip it to 1 px and position it absolutely (an “sr-only” class); `display: none` would hide it from screen readers too',
  },
]

export const HTML_CSS: PublicDeck = {
  slug: 'html-and-css',
  title: 'HTML & CSS flashcards: layout, cascade and accessibility',
  shortTitle: 'HTML & CSS',
  category: 'web',
  level: 'beginner',
  icon: 'code',
  description:
    'Fifty HTML and CSS cards: semantic HTML and accessible forms, specificity and cascade layers, flexbox and grid, stacking contexts and z-index, modern units and container queries.',
  intro:
    'Most CSS bugs come from a handful of rules: specificity, the box model, stacking contexts and how positioning works. These cards cover those, the layout tools you use daily (flexbox and grid), modern features like `:has()`, container queries, `dvh` and `light-dark()`, and the HTML that makes pages accessible.',
  faq: [
    {
      q: 'Is this deck for beginners?',
      a: 'Yes. It starts with the basics like the box model and semantic elements, then covers modern CSS.',
    },
    {
      q: 'Why is my z-index not working?',
      a: 'Usually an ancestor creates a stacking context. The cards on stacking contexts and isolation explain how to fix it.',
    },
    {
      q: 'Do the newer features work in all browsers?',
      a: 'Container queries, :has(), dvh and light-dark() work in current versions of all major browsers.',
    },
  ],
  cards: CARDS,
}
