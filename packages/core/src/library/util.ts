/** A fenced code block for card text. */
export const code = (lang: string, ...lines: string[]) => `\`\`\`${lang}\n${lines.join('\n')}\n\`\`\``

/** LaTeX commands with a close Unicode equivalent, for plain-text snippets. */
const SYMBOLS: Record<string, string> = {
  to: '→',
  rightarrow: '→',
  leftarrow: '←',
  Rightarrow: '⇒',
  iff: '⇔',
  implies: '⇒',
  rightleftharpoons: '⇌',
  infty: '∞',
  approx: '≈',
  neq: '≠',
  ne: '≠',
  leq: '≤',
  le: '≤',
  geq: '≥',
  ge: '≥',
  times: '×',
  div: '÷',
  cdot: '·',
  cdots: '⋯',
  ldots: '…',
  dots: '…',
  int: '∫',
  iint: '∬',
  oint: '∮',
  sum: 'Σ',
  prod: 'Π',
  partial: '∂',
  nabla: '∇',
  pm: '±',
  mp: '∓',
  lvert: '|',
  rvert: '|',
  lVert: '‖',
  rVert: '‖',
  mid: '|',
  nmid: '∤',
  parallel: '‖',
  oplus: '⊕',
  bmod: 'mod',
  in: '∈',
  notin: '∉',
  subset: '⊂',
  subseteq: '⊆',
  cup: '∪',
  cap: '∩',
  emptyset: '∅',
  forall: '∀',
  exists: '∃',
  perp: '⊥',
  sim: '~',
  propto: '∝',
  equiv: '≡',
  circ: '∘',
  degree: '°',
  prime: '′',
  ell: 'ℓ',
  langle: '⟨',
  rangle: '⟩',
  alpha: 'α',
  beta: 'β',
  gamma: 'γ',
  delta: 'δ',
  epsilon: 'ε',
  varepsilon: 'ε',
  theta: 'θ',
  lambda: 'λ',
  mu: 'μ',
  nu: 'ν',
  pi: 'π',
  rho: 'ρ',
  sigma: 'σ',
  tau: 'τ',
  phi: 'φ',
  varphi: 'φ',
  chi: 'χ',
  psi: 'ψ',
  omega: 'ω',
  Gamma: 'Γ',
  Delta: 'Δ',
  Theta: 'Θ',
  Lambda: 'Λ',
  Sigma: 'Σ',
  Phi: 'Φ',
  Psi: 'Ψ',
  Omega: 'Ω',
}

/** Readable Unicode for common LaTeX, e.g. \dfrac{1}{x} → (1)/(x), \int → ∫, \sin → sin. */
function texToText(tex: string): string {
  // Matrices read row by row: [a b; c d].
  let out = tex.replace(
    /\\begin\{[pbvV]?matrix\}([\s\S]*?)\\end\{[pbvV]?matrix\}/g,
    (_m, body: string) =>
      `[${body
        .replace(/\s*\\\\\s*/g, '; ')
        .replace(/\s*&\s*/g, ' ')
        .trim()}]`,
  )
  // Each pattern only matches braces with no braces inside, so repeated passes
  // unwrap nested groups from the inside out; four levels covers card math.
  for (let i = 0; i < 4; i++) {
    out = out
      .replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)')
      .replace(/\\sqrt\{([^{}]*)\}/g, '√($1)')
      .replace(/\\binom\{([^{}]*)\}\{([^{}]*)\}/g, 'C($1, $2)')
      .replace(/\\pmod\{([^{}]*)\}/g, ' (mod $1)')
      .replace(/\\(?:mathrm|text|operatorname|mathbf|mathbb|mathcal|boldsymbol|bar|hat|vec|overline)\{([^{}]*)\}/g, ' $1')
      // Unbrace sub/superscripts so fractions around them can reduce on the next pass.
      .replace(/([_^])\{([^{}]*)\}/g, '$1$2')
  }
  return out
    .replace(/\\(?:mathrm|text|operatorname|mathbf|mathbb|mathcal|boldsymbol)(?![a-zA-Z])/g, '')
    .replace(/\\(?:displaystyle|left|right|quad|big|Big|bigg|Bigg)(?![a-zA-Z])|\\[,;! ]/g, ' ')
    .replace(/\\([a-zA-Z]+)/g, (_m, name: string) => SYMBOLS[name] ?? name)
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Text outside code: math becomes readable Unicode, markdown delimiters are dropped. */
function stripMarkup(text: string): string {
  return (
    text
      .replace(/\\\(([\s\S]+?)\\\)|\\\[([\s\S]+?)\\\]|\$\$([\s\S]+?)\$\$/g, (_m, a, b, c) => texToText(a ?? b ?? c))
      .replace(/\\[()[\]]|\$\$?|\*\*/g, '')
      // A * or _ at a word's edge is emphasis; inside a word (snake_case) it stays.
      .replace(/(?<![\w])[*_]|[*_](?![\w])/g, '')
  )
}

// A fenced block (its language tag dropped) or inline code.
const CODE = /```[\w+#.-]*\n?([\s\S]*?)```|`([^`\n]+)`/g

/**
 * Card text without markup, for search snippets and structured data: math becomes
 * readable Unicode, code fences and markdown delimiters are dropped. Code keeps its
 * text verbatim, so `$HOME` or `*.log` in a command survive.
 */
export function plainText(text: string): string {
  let out = ''
  let last = 0
  for (const m of text.matchAll(CODE)) {
    out += stripMarkup(text.slice(last, m.index)) + (m[1] ?? m[2])
    last = m.index + m[0].length
  }
  return (out + stripMarkup(text.slice(last))).replace(/\s+/g, ' ').trim()
}
