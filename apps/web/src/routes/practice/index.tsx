import type { PublicCategorySlug } from '@askesis/core'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import clsx from 'clsx'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { DeckTile } from '../../components/practice/PracticeParts.tsx'
import { fmtInt } from '../../lib/format.ts'
import { queries } from '../../lib/queries.ts'
import { absoluteUrl, breadcrumbs, jsonLd, ORGANIZATION, seo } from '../../lib/seo.ts'

const TITLE = 'Free flashcard decks: programming, web, databases, AI, DevOps, languages, science & engineering · Askesis'
const DESCRIPTION =
  'Free flashcards in your browser, no signup: JavaScript, Python, React, SQL, AWS, machine learning, Japanese, Spanish, chemistry, engineering and more.'

// The deck catalog. Public, indexable and fully server-rendered; the topic
// filter is local state, so every deck is in the HTML for crawlers.
export const Route = createFileRoute('/practice/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(queries.practiceIndex()),
  head: ({ loaderData }) => {
    const decks = loaderData?.decks ?? []
    const { meta, links } = seo({ title: TITLE, description: DESCRIPTION, path: '/practice' })
    return {
      meta: [
        ...meta,
        jsonLd(
          {
            '@type': 'CollectionPage',
            '@id': absoluteUrl('/practice#page'),
            name: 'Free flashcard decks',
            description: DESCRIPTION,
            url: absoluteUrl('/practice'),
            isPartOf: { '@id': absoluteUrl('/#website') },
            publisher: { '@id': ORGANIZATION['@id'] },
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: decks.length,
              itemListElement: decks.map((d, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                url: absoluteUrl(`/practice/${d.slug}`),
                name: d.title,
              })),
            },
          },
          breadcrumbs([
            { name: 'Askesis', path: '/' },
            { name: 'Practice', path: '/practice' },
          ]),
        ),
      ],
      links,
    }
  },
  component: PracticeIndex,
})

function PracticeIndex() {
  const {
    data: { decks: all, categories, totalCards },
  } = useSuspenseQuery(queries.practiceIndex())
  const [category, setCategory] = useState<PublicCategorySlug | 'all'>('all')
  const decks = category === 'all' ? all : all.filter((d) => d.category === category)

  return (
    <main className="practice-page">
      <header className="practice-hero">
        <p className="eyebrow">Free practice decks</p>
        <h1 className="practice-hero__title">Practice anything, free, right in your browser</h1>
        <p className="practice-hero__lead">
          {all.length} ready-made decks and {fmtInt(totalCards)} cards, scheduled with proven spaced-repetition timings. Start a
          deck in one click, no account needed. Sign up when you want your progress to follow you.
        </p>
      </header>

      <div className="practice-filters" role="group" aria-label="Filter by topic">
        <button
          type="button"
          aria-pressed={category === 'all'}
          className={clsx('practice-chip', category === 'all' && 'is-active')}
          onClick={() => setCategory('all')}
        >
          All topics
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            type="button"
            aria-pressed={category === c.slug}
            className={clsx('practice-chip', category === c.slug && 'is-active')}
            onClick={() => setCategory(c.slug)}
          >
            {c.title}
          </button>
        ))}
      </div>

      <h2 className="sr-only">Decks</h2>
      <div className="practice-grid">
        {decks.map((d) => (
          <DeckTile key={d.slug} deck={d} />
        ))}
      </div>

      <section className="practice-hubs" aria-labelledby="hubs-title">
        <h2 id="hubs-title" className="practice-section-title">
          Learn by topic
        </h2>
        <div className="practice-hubs__grid">
          {categories.map((c) => (
            <Link key={c.slug} to="/learn/$category" params={{ category: c.slug }} className="practice-hub">
              <span className="practice-hub__title">{c.headline}</span>
              <span className="practice-hub__desc">{c.description}</span>
              <span className="practice-hub__cta">
                Explore {c.inlineTitle} <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
