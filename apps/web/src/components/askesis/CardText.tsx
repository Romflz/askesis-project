import clsx from 'clsx'
import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import c from 'highlight.js/lib/languages/c'
import cpp from 'highlight.js/lib/languages/cpp'
import csharp from 'highlight.js/lib/languages/csharp'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
import css from 'highlight.js/lib/languages/css'
import dart from 'highlight.js/lib/languages/dart'
import elixir from 'highlight.js/lib/languages/elixir'
import go from 'highlight.js/lib/languages/go'
import graphql from 'highlight.js/lib/languages/graphql'
import haskell from 'highlight.js/lib/languages/haskell'
import ini from 'highlight.js/lib/languages/ini'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import kotlin from 'highlight.js/lib/languages/kotlin'
import markdown from 'highlight.js/lib/languages/markdown'
import php from 'highlight.js/lib/languages/php'
import python from 'highlight.js/lib/languages/python'
import ruby from 'highlight.js/lib/languages/ruby'
import rust from 'highlight.js/lib/languages/rust'
import sql from 'highlight.js/lib/languages/sql'
import swift from 'highlight.js/lib/languages/swift'
import typescript from 'highlight.js/lib/languages/typescript'
import vim from 'highlight.js/lib/languages/vim'
import x86asm from 'highlight.js/lib/languages/x86asm'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'
import katex from 'katex'
import { type ReactNode, useMemo } from 'react'

// Card content syntax (fields are plain text; nothing is ever parsed as HTML):
//
//   Math (KaTeX), MathJax-style delimiters:
//     \( … \)  inline        \[ … \]  display
//     $ … $    inline (no space just inside the $s, closing $ not followed by a digit,
//              so "$5 and $10" stays text; write \$ for a literal dollar)
//     $$ … $$  display
//   Code (highlight.js):
//     ```lang            fenced block; lang is optional (auto-detected when omitted)
//     …
//     ```
//     `code`             inline
//   Light markdown: **bold**, *italic* or _italic_. Line breaks are kept.
//
// Only KaTeX and highlight.js output is injected as HTML; both escape their input.

const LANGUAGES = {
  bash,
  c,
  cpp,
  csharp,
  css,
  dart,
  dockerfile,
  elixir,
  go,
  graphql,
  java,
  javascript,
  json,
  kotlin,
  markdown,
  php,
  python,
  ruby,
  rust,
  sql,
  swift,
  typescript,
  xml,
  yaml,
}
for (const [name, lang] of Object.entries(LANGUAGES)) hljs.registerLanguage(name, lang)
// highlight.js has no Terraform grammar; INI's `key = value` blocks are close enough for HCL.
hljs.registerLanguage('hcl', ini)
// redis-cli commands read like shell lines.
hljs.registerLanguage('redis', bash)
// Only used when a fence names them: left in auto-detection, they claim shell, TypeScript and Go snippets.
for (const [name, lang] of Object.entries({ haskell, vim, x86asm })) hljs.registerLanguage(name, lang)
const AUTO_LANGUAGES = Object.keys(LANGUAGES)

type Block = { type: 'text'; text: string } | { type: 'code'; lang: string; code: string } | { type: 'math'; tex: string }

// Inline code is matched too (and left in the text) so `\[ … \]` inside backticks stays literal.
const BLOCK = /```[ \t]*([\w+#.-]*)[ \t]*\r?\n([\s\S]*?)\r?\n?[ \t]*```|`[^`\n]+`|\\\[([\s\S]+?)\\\]|\$\$([\s\S]+?)\$\$/g

const INLINE = new RegExp(
  [
    /`([^`\n]+)`/.source, // 1: inline code
    /\\\(([\s\S]+?)\\\)/.source, // 2: \( math \)
    /(?<![\\$\w])\$(?![\s$])([^$\n]+?)(?<![\s\\])\$(?![\d$])/.source, // 3: $math$
    /\*\*(?!\s)([^*\n]+?)(?<!\s)\*\*/.source, // 4: **bold**
    /(?<![*\w])\*(?![\s*])([^*\n]+?)(?<!\s)\*(?![*\w])/.source, // 5: *italic*
    /(?<![\w])_(?![\s_])([^_\n]+?)(?<!\s)_(?![\w])/.source, // 6: _italic_
  ].join('|'),
  'g',
)

function splitBlocks(text: string): Block[] {
  const blocks: Block[] = []
  let last = 0
  for (const m of text.matchAll(BLOCK)) {
    if (m[0].startsWith('`') && !m[0].startsWith('```')) continue
    if (m.index > last) blocks.push({ type: 'text', text: text.slice(last, m.index) })
    if (m[2] !== undefined) blocks.push({ type: 'code', lang: (m[1] ?? '').toLowerCase(), code: m[2] })
    else blocks.push({ type: 'math', tex: (m[3] ?? m[4] ?? '').trim() })
    last = m.index + m[0].length
  }
  if (last < text.length) blocks.push({ type: 'text', text: text.slice(last) })
  // A block already starts on its own line; drop the newline that separated it.
  return blocks.map((b, i) => {
    if (b.type !== 'text') return b
    let t = b.text
    if (i > 0) t = t.replace(/^[ \t]*\r?\n/, '')
    if (i < blocks.length - 1) t = t.replace(/\r?\n[ \t]*$/, '')
    return { type: 'text', text: t }
  })
}

// Rendered math is cached across cards; the same formulas recur a lot.
const mathCache = new Map<string, string>()

function renderMath(tex: string, display: boolean): string {
  const key = `${display ? 'D' : 'I'}${tex}`
  let html = mathCache.get(key)
  if (html === undefined) {
    html = katex.renderToString(tex, {
      displayMode: display,
      throwOnError: false,
      trust: false,
      strict: 'ignore',
      output: 'htmlAndMathml',
    })
    if (mathCache.size > 500) mathCache.clear()
    mathCache.set(key, html)
  }
  return html
}

function renderCode(code: string, lang: string): { html: string; label: string | null } {
  if (lang && hljs.getLanguage(lang)) {
    return { html: hljs.highlight(code, { language: lang, ignoreIllegals: true }).value, label: lang }
  }
  return { html: hljs.highlightAuto(code, AUTO_LANGUAGES).value, label: lang || null }
}

const literal = (text: string) => text.replace(/\\\$/g, '$')

function renderInline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  let n = 0
  for (const m of text.matchAll(INLINE)) {
    if (m.index > last) out.push(literal(text.slice(last, m.index)))
    const k = `${key}.${n++}`
    if (m[1] !== undefined) {
      out.push(
        <code key={k} className="card-text__icode">
          {m[1]}
        </code>,
      )
    } else if (m[2] !== undefined || m[3] !== undefined) {
      out.push(
        <span
          key={k}
          className="card-text__imath"
          dangerouslySetInnerHTML={{ __html: renderMath((m[2] ?? m[3])!.trim(), false) }}
        />,
      )
    } else if (m[4] !== undefined) {
      out.push(<strong key={k}>{renderInline(m[4], k)}</strong>)
    } else {
      out.push(<em key={k}>{renderInline((m[5] ?? m[6])!, k)}</em>)
    }
    last = m.index + m[0].length
  }
  if (last < text.length) out.push(literal(text.slice(last)))
  return out
}

function render(text: string): ReactNode[] {
  return splitBlocks(text).map((block, i) => {
    const key = String(i)
    if (block.type === 'code') {
      const { html, label } = renderCode(block.code, block.lang)
      return (
        <div key={key} className="card-text__code">
          {label && <span className="card-text__lang">{label}</span>}
          <pre>
            <code className="hljs" dangerouslySetInnerHTML={{ __html: html }} />
          </pre>
        </div>
      )
    }
    if (block.type === 'math') {
      return <div key={key} className="card-text__math" dangerouslySetInnerHTML={{ __html: renderMath(block.tex, true) }} />
    }
    return <span key={key}>{renderInline(block.text, key)}</span>
  })
}

/** True when the text contains a code block or display math (they need full width). */
export function hasBlockContent(text: string): boolean {
  return /```|\\\[|\$\$/.test(text)
}

/** The text without markup delimiters, e.g. for sizing a card face by its length. */
export function stripMarkup(text: string): string {
  return text
    .replace(/```[\w+#.-]*/g, '')
    .replace(/\\[()[\]]|\$\$?|\*\*|`/g, '')
    .replace(/(?<![\w])[*_]|[*_](?![\w])/g, '')
    .trim()
}

/** A card field rendered with the syntax described at the top of this file. */
export function CardText({ text, className }: { text: string; className?: string }) {
  const content = useMemo(() => render(text), [text])
  return <div className={clsx('card-text', className)}>{content}</div>
}
