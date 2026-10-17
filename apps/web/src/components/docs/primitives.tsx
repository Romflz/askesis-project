import { Link } from '@tanstack/react-router'
import clsx from 'clsx'
import { Info, Lightbulb, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'

// Building blocks for doc pages. Content is plain JSX so pages can mix prose,
// tables and examples without a markdown pipeline.

/** A section heading with a # link. Its id must match an entry in the page's `headings`. */
export function H2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="docs-h2">
      <a href={`#${id}`} className="docs-anchor" aria-hidden tabIndex={-1}>
        #
      </a>
      {children}
    </h2>
  )
}

export function H3({ children }: { children: ReactNode }) {
  return <h3 className="docs-h3">{children}</h3>
}

const CALLOUT_ICONS = { tip: Lightbulb, note: Info, warn: TriangleAlert }

export function Callout({
  tone = 'note',
  title,
  children,
}: {
  tone?: 'tip' | 'note' | 'warn'
  title?: string
  children: ReactNode
}) {
  const Icon = CALLOUT_ICONS[tone]
  return (
    <aside className={clsx('docs-callout', `docs-callout--${tone}`)}>
      <Icon size={16} aria-hidden />
      <div>
        {title && <p className="docs-callout__title">{title}</p>}
        <div className="docs-callout__body">{children}</div>
      </div>
    </aside>
  )
}

/** A literal code block, shown as written minus the blank first and last lines a template literal leaves. */
export function Code({ code, label }: { code: string; label?: string }) {
  return (
    <figure className="docs-code">
      {label && <figcaption className="docs-code__label">{label}</figcaption>}
      <pre>
        <code>{code.replace(/^\n/, '').replace(/\n\s*$/, '')}</code>
      </pre>
    </figure>
  )
}

/** Inline code. */
export function C({ children }: { children: ReactNode }) {
  return <code className="docs-inline-code">{children}</code>
}

export function Table({ head, rows }: { head: ReactNode[]; rows: ReactNode[][] }) {
  return (
    <div className="docs-table-wrap">
      <table className="docs-table">
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** A rating chip colored like the answer buttons. */
export function Rating({ kind, children }: { kind: 'again' | 'hard' | 'good' | 'easy'; children: ReactNode }) {
  return <span className={clsx('docs-rating', `docs-rating--${kind}`)}>{children}</span>
}

export function Steps({ children }: { children: ReactNode }) {
  return <ol className="docs-steps">{children}</ol>
}

/** A link to another doc page (client-side navigation). */
export function DocLink({ slug, hash, children }: { slug: string; hash?: string; children: ReactNode }) {
  return (
    <Link to="/docs/$slug" params={{ slug }} hash={hash}>
      {children}
    </Link>
  )
}
