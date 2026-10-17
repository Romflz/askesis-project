import { Link } from '@tanstack/react-router'
import clsx from 'clsx'
import { ArrowLeft, ArrowRight, ChevronDown, Search } from 'lucide-react'
import { useState } from 'react'
import { DOCS, type DocPage, SECTIONS } from './pages.tsx'
import { H2 } from './primitives.tsx'

/** Case-insensitive match on a page's title, summary or headings. */
function matches(doc: DocPage, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [doc.title, doc.summary, ...doc.headings.map((h) => h.label)].some((t) => t.toLowerCase().includes(q))
}

/** Sidebar navigation grouped by section, with a filter box. */
export function DocsNav({ current }: { current?: string }) {
  const [query, setQuery] = useState('')
  const visible = DOCS.filter((d) => matches(d, query))

  return (
    <nav className="docs-nav" aria-label="Documentation">
      <label className="docs-nav__search">
        <Search size={14} aria-hidden />
        <input
          type="search"
          placeholder="Filter topics"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Filter documentation topics"
        />
      </label>
      {SECTIONS.map((section) => {
        const docs = visible.filter((d) => d.section === section)
        if (docs.length === 0) return null
        return (
          <div key={section} className="docs-nav__group">
            <p className="docs-nav__section">{section}</p>
            <ul>
              {docs.map((doc) => (
                <li key={doc.slug}>
                  <Link
                    to="/docs/$slug"
                    params={{ slug: doc.slug }}
                    className={clsx('docs-nav__link', doc.slug === current && 'is-current')}
                    aria-current={doc.slug === current ? 'page' : undefined}
                  >
                    <doc.icon size={15} aria-hidden />
                    {doc.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
      {visible.length === 0 && <p className="docs-nav__empty">No topics match “{query}”.</p>}
    </nav>
  )
}

/** A doc page: navigation, the article and its FAQ, prev/next links and an "On this page" list. */
export function DocArticle({ doc }: { doc: DocPage }) {
  const index = DOCS.indexOf(doc)
  const prev = DOCS[index - 1]
  const next = DOCS[index + 1]

  return (
    <main className="docs">
      <div className="docs__layout">
        {/* Desktop: sticky sidebar. Phones: a disclosure above the article. */}
        <aside className="docs__sidebar">
          <DocsNav current={doc.slug} />
        </aside>
        <details className="docs__mobile-nav">
          <summary>
            <span>
              <span className="docs__mobile-label">Docs</span> {doc.title}
            </span>
            <ChevronDown size={16} aria-hidden />
          </summary>
          <DocsNav current={doc.slug} />
        </details>

        <article className="docs-article">
          <header className="docs-article__header">
            <p className="eyebrow">
              <Link to="/docs">Docs</Link> / {doc.section}
            </p>
            <h1 className="docs-article__title">{doc.title}</h1>
            <p className="docs-article__summary">{doc.summary}</p>
          </header>

          <div className="docs-prose">
            {doc.body()}
            {doc.faq && (
              <>
                <H2 id="faq">Questions</H2>
                <dl className="docs-faq">
                  {doc.faq.map((f) => (
                    <div key={f.q} className="docs-faq__item">
                      <dt>{f.q}</dt>
                      <dd>{f.a}</dd>
                    </div>
                  ))}
                </dl>
              </>
            )}
          </div>

          <nav className="docs-pager" aria-label="More docs">
            {prev ? (
              <Link to="/docs/$slug" params={{ slug: prev.slug }} className="docs-pager__link">
                <span className="docs-pager__dir">
                  <ArrowLeft size={14} aria-hidden /> Previous
                </span>
                <span className="docs-pager__title">{prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link to="/docs/$slug" params={{ slug: next.slug }} className="docs-pager__link docs-pager__link--next">
                <span className="docs-pager__dir">
                  Next <ArrowRight size={14} aria-hidden />
                </span>
                <span className="docs-pager__title">{next.title}</span>
              </Link>
            )}
          </nav>
        </article>

        <aside className="docs__toc" aria-label="On this page">
          <p className="eyebrow">On this page</p>
          <ul>
            {[...doc.headings, ...(doc.faq ? [{ id: 'faq', label: 'Questions' }] : [])].map((h) => (
              <li key={h.id}>
                <a href={`#${h.id}`}>{h.label}</a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </main>
  )
}

/** /docs: a card per page, in reading order. */
export function DocsHome() {
  return (
    <main className="docs">
      <header className="docs-hero">
        <p className="eyebrow">Documentation</p>
        <h1 className="docs-hero__title">Askesis docs</h1>
        <p className="docs-hero__lead">
          How studying, scheduling and everything around it work, in plain words. Start with the basics, or jump to a topic.
        </p>
        <Link to="/docs/$slug" params={{ slug: 'getting-started' }} className="btn btn--primary">
          Get started <ArrowRight size={16} aria-hidden />
        </Link>
      </header>

      <ul className="docs-home__grid" aria-label="Topics">
        {DOCS.map((doc) => (
          <li key={doc.slug}>
            <Link to="/docs/$slug" params={{ slug: doc.slug }} className="docs-card">
              <span className="docs-card__top">
                <span className="docs-card__icon">
                  <doc.icon size={18} aria-hidden />
                </span>
                <span className="docs-card__section">{doc.section}</span>
              </span>
              <span className="docs-card__title">{doc.title}</span>
              <span className="docs-card__summary">{doc.summary}</span>
              <span className="docs-card__topics">
                {doc.headings
                  .slice(0, 3)
                  .map((h) => h.label)
                  .join(' · ')}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
