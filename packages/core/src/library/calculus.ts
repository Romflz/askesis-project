import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'

const r = String.raw

const CARDS: CardContent[] = [
  // Derivatives
  { front: r`\(\dfrac{d}{dx}\,c\) (a constant)`, back: r`\(0\)` },
  { front: r`\(\dfrac{d}{dx}\,x^n\)`, back: r`\(n\,x^{n-1}\)`, extra: 'The power rule.' },
  { front: r`\(\dfrac{d}{dx}\,e^x\)`, back: r`\(e^x\)` },
  { front: r`\(\dfrac{d}{dx}\,a^x\)`, back: r`\(a^x \ln a\)` },
  { front: r`\(\dfrac{d}{dx}\,\ln x\)`, back: r`\(\dfrac{1}{x}\)` },
  { front: r`\(\dfrac{d}{dx}\,\log_a x\)`, back: r`\(\dfrac{1}{x \ln a}\)` },
  { front: r`\(\dfrac{d}{dx}\,\sin x\)`, back: r`\(\cos x\)` },
  { front: r`\(\dfrac{d}{dx}\,\cos x\)`, back: r`\(-\sin x\)` },
  { front: r`\(\dfrac{d}{dx}\,\tan x\)`, back: r`\(\sec^2 x\)` },
  { front: r`\(\dfrac{d}{dx}\,\cot x\)`, back: r`\(-\csc^2 x\)` },
  { front: r`\(\dfrac{d}{dx}\,\sec x\)`, back: r`\(\sec x \tan x\)` },
  { front: r`\(\dfrac{d}{dx}\,\csc x\)`, back: r`\(-\csc x \cot x\)` },
  { front: r`\(\dfrac{d}{dx}\,\arcsin x\)`, back: r`\(\dfrac{1}{\sqrt{1 - x^2}}\)` },
  { front: r`\(\dfrac{d}{dx}\,\arccos x\)`, back: r`\(-\dfrac{1}{\sqrt{1 - x^2}}\)` },
  { front: r`\(\dfrac{d}{dx}\,\arctan x\)`, back: r`\(\dfrac{1}{1 + x^2}\)` },
  { front: r`\(\dfrac{d}{dx}\,\sinh x\)`, back: r`\(\cosh x\)` },
  { front: r`\(\dfrac{d}{dx}\,\cosh x\)`, back: r`\(\sinh x\)` },
  { front: r`\(\dfrac{d}{dx}\,\sqrt{x}\)`, back: r`\(\dfrac{1}{2\sqrt{x}}\)` },
  { front: r`\(\dfrac{d}{dx}\,\dfrac{1}{x}\)`, back: r`\(-\dfrac{1}{x^2}\)` },
  { front: 'Product rule', back: r`\((fg)' = f'g + fg'\)` },
  { front: 'Quotient rule', back: r`\(\left(\dfrac{f}{g}\right)' = \dfrac{f'g - fg'}{g^2}\)` },
  { front: 'Chain rule', back: r`\(\dfrac{d}{dx}\,f(g(x)) = f'(g(x))\,g'(x)\)` },
  { front: 'Definition of the derivative', back: r`\[f'(x) = \lim_{h \to 0} \frac{f(x + h) - f(x)}{h}\]` },
  // Limits
  { front: r`\(\displaystyle\lim_{x \to 0} \frac{\sin x}{x}\)`, back: r`\(1\)` },
  { front: r`\(\displaystyle\lim_{x \to 0} \frac{1 - \cos x}{x}\)`, back: r`\(0\)` },
  { front: r`\(\displaystyle\lim_{n \to \infty} \left(1 + \frac{1}{n}\right)^n\)`, back: r`\(e\)` },
  { front: r`\(\displaystyle\lim_{x \to 0} \frac{e^x - 1}{x}\)`, back: r`\(1\)` },
  {
    front: 'L’Hôpital’s rule',
    back: r`For \(\tfrac{0}{0}\) or \(\tfrac{\infty}{\infty}\) forms: \(\displaystyle\lim \frac{f}{g} = \lim \frac{f'}{g'}\), if the right side exists`,
  },
  // Integrals
  { front: r`\(\displaystyle\int x^n\,dx\) for \(n \neq -1\)`, back: r`\(\dfrac{x^{n+1}}{n + 1} + C\)` },
  { front: r`\(\displaystyle\int \frac{1}{x}\,dx\)`, back: r`\(\ln\lvert x\rvert + C\)` },
  { front: r`\(\displaystyle\int e^x\,dx\)`, back: r`\(e^x + C\)` },
  { front: r`\(\displaystyle\int a^x\,dx\)`, back: r`\(\dfrac{a^x}{\ln a} + C\)` },
  { front: r`\(\displaystyle\int \sin x\,dx\)`, back: r`\(-\cos x + C\)` },
  { front: r`\(\displaystyle\int \cos x\,dx\)`, back: r`\(\sin x + C\)` },
  { front: r`\(\displaystyle\int \sec^2 x\,dx\)`, back: r`\(\tan x + C\)` },
  { front: r`\(\displaystyle\int \frac{1}{1 + x^2}\,dx\)`, back: r`\(\arctan x + C\)` },
  { front: r`\(\displaystyle\int \frac{1}{\sqrt{1 - x^2}}\,dx\)`, back: r`\(\arcsin x + C\)` },
  {
    front: r`\(\displaystyle\int \tan x\,dx\)`,
    back: r`\(-\ln\lvert\cos x\rvert + C\)`,
    extra: r`Equivalently \(\ln\lvert\sec x\rvert + C\).`,
  },
  { front: r`\(\displaystyle\int \sec x\,dx\)`, back: r`\(\ln\lvert\sec x + \tan x\rvert + C\)` },
  {
    front: r`\(\displaystyle\int \ln x\,dx\)`,
    back: r`\(x \ln x - x + C\)`,
    extra: 'Integrate by parts with u = ln x, dv = dx.',
  },
  { front: 'Integration by parts', back: r`\(\displaystyle\int u\,dv = uv - \int v\,du\)` },
  { front: 'Substitution rule', back: r`\(\displaystyle\int f(g(x))\,g'(x)\,dx = \int f(u)\,du\) with \(u = g(x)\)` },
  {
    front: 'Fundamental theorem of calculus, part 1',
    back: r`\[\frac{d}{dx}\int_a^x f(t)\,dt = f(x)\]`,
    extra: 'For f continuous on the interval.',
  },
  {
    front: 'Fundamental theorem of calculus, part 2',
    back: r`\[\int_a^b f(x)\,dx = F(b) - F(a)\]`,
    extra: r`Where \(F\) is any antiderivative of \(f\).`,
  },
  { front: r`\(\displaystyle\int_0^1 x^2\,dx\)`, back: r`\(\dfrac{1}{3}\)` },
  { front: r`\(\displaystyle\int_{-\infty}^{\infty} e^{-x^2}\,dx\)`, back: r`\(\sqrt{\pi}\)`, extra: 'The Gaussian integral.' },
  // Theorems and series
  {
    front: 'Mean value theorem',
    back: r`If \(f\) is continuous on \([a, b]\) and differentiable on \((a, b)\), some \(c\) in \((a, b)\) has \(f'(c) = \dfrac{f(b) - f(a)}{b - a}\)`,
  },
  {
    front: 'Second derivative test',
    back: r`If \(f'(c) = 0\): \(f''(c) > 0\) means a local minimum, \(f''(c) < 0\) a local maximum`,
  },
  { front: r`Taylor series of \(e^x\)`, back: r`\[e^x = \sum_{n=0}^{\infty} \frac{x^n}{n!}\]` },
  { front: r`Taylor series of \(\sin x\)`, back: r`\[\sin x = x - \frac{x^3}{3!} + \frac{x^5}{5!} - \cdots\]` },
]

export const CALCULUS: PublicDeck = {
  slug: 'calculus',
  title: 'Calculus: 50 derivatives, integrals and limits',
  shortTitle: 'Calculus',
  category: 'math',
  level: 'intermediate',
  icon: 'brain',
  description:
    'Memorize the derivatives, integrals, limits and theorems every calculus course relies on, written out in clean LaTeX.',
  intro:
    'Exams reward the formulas you can recall instantly: derivatives of trig and inverse trig functions, standard integrals, the classic limits and the fundamental theorem. Each card shows one expression; recall the result, then flip to check.',
  faq: [
    {
      q: 'Does this deck cover multivariable calculus?',
      a: 'No. It covers single-variable calculus: differentiation, integration, limits and Taylor series.',
    },
    {
      q: 'Why memorize formulas if I understand the ideas?',
      a: 'Instant recall frees your working memory for the actual problem. Spaced repetition gets you there with little daily effort.',
    },
    { q: 'How are formulas displayed?', a: 'With LaTeX rendered by KaTeX, so they look like your textbook.' },
  ],
  cards: CARDS,
}
