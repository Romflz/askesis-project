import type { PublicDeck } from '@askesis/core'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { CardText } from '../../components/askesis/CardText.tsx'
import { DeckGlyph } from '../../components/askesis/ui.tsx'
import { PracticeDrill } from '../../components/practice/PracticeDrill.tsx'
import { AddToDecks, DeckTile, Faq, LEVEL_LABEL } from '../../components/practice/PracticeParts.tsx'
import { queries } from '../../lib/queries.ts'
import { absoluteUrl, breadcrumbs, jsonLd, ORGANIZATION, seo } from '../../lib/seo.ts'

// A public deck's landing page: practice inline, every card listed (indexable), FAQ, sign-up CTA.
export const Route = createFileRoute('/practice/$slug')({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(queries.practiceDeck(params.slug)),
  head: ({ loaderData }) => {
    if (!loaderData) return {}
    const { deck, category, plain } = loaderData
    const path = `/practice/${deck.slug}`
    const { meta, links } = seo({
      title: `${deck.title} · Free flashcards · Askesis`,
      description: `${deck.description} Practice all ${deck.cards.length} cards free in your browser.`,
      path,
      image: `/og-${deck.category}.png`,
    })
    return {
      meta: [
        ...meta,
        jsonLd(
          // Google's Education Q&A markup for flashcard pages.
          {
            '@type': 'Quiz',
            '@id': absoluteUrl(`${path}#flashcards`),
            name: deck.title,
            description: deck.description,
            url: absoluteUrl(path),
            about: { '@type': 'Thing', name: category.title },
            educationalLevel: LEVEL_LABEL[deck.level],
            learningResourceType: 'Flashcard',
            inLanguage: 'en',
            isAccessibleForFree: true,
            publisher: { '@id': ORGANIZATION['@id'] },
            hasPart: plain.map((c) => ({
              '@type': 'Question',
              eduQuestionType: 'Flashcard',
              text: c.q,
              acceptedAnswer: { '@type': 'Answer', text: c.a },
            })),
          },
          breadcrumbs([
            { name: 'Askesis', path: '/' },
            { name: 'Practice', path: '/practice' },
            { name: category.title, path: `/learn/${category.slug}` },
            { name: deck.shortTitle, path },
          ]),
        ),
      ],
      links,
    }
  },
  component: DeckLanding,
})

function DeckLanding() {
  const { slug } = Route.useParams()
  const {
    data: { deck, category, related },
  } = useSuspenseQuery(queries.practiceDeck(slug))
  const { user } = Route.useRouteContext()

  return (
    <main className="practice-page">
      <nav className="practice-crumbs" aria-label="Breadcrumb">
        <Link to="/practice">Practice</Link>
        <ChevronRight size={13} aria-hidden />
        <Link to="/learn/$category" params={{ category: category.slug }}>
          {category.title}
        </Link>
        <ChevronRight size={13} aria-hidden />
        <span aria-current="page">{deck.shortTitle}</span>
      </nav>

      <header className="practice-deck-hero">
        <DeckGlyph icon={deck.icon} />
        <div>
          <h1 className="practice-deck-hero__title">{deck.title}</h1>
          <p className="practice-deck-hero__lead">{deck.description}</p>
          <div className="practice-deck-hero__meta">
            <span className="chip">{category.title}</span>
            <span className="chip">{LEVEL_LABEL[deck.level]}</span>
            <span className="chip">{deck.cards.length} cards</span>
            <span className="chip">Free</span>
          </div>
        </div>
      </header>

      <div className="practice-deck-layout">
        <section className="panel practice-deck-drill" aria-labelledby="drill-title">
          <p className="eyebrow">Practice now</p>
          <h2 id="drill-title" className="practice-panel-title">
            Study without an account
          </h2>
          <PracticeDrill slug={deck.slug} cards={deck.cards} />
        </section>

        <aside className="practice-deck-side">
          <section className="panel practice-cta">
            <p className="eyebrow">{user ? 'Keep it' : 'Free account'}</p>
            <h2 className="practice-panel-title">
              {user ? 'Add this deck to your collection' : 'Keep your streak and schedule'}
            </h2>
            <p className="practice-cta__text">
              {user
                ? 'Your reviews will count toward your streak, quests and trophies, and you can edit the cards.'
                : 'With a free account your progress syncs across devices, with streaks, daily reminders and stats.'}
            </p>
            <AddToDecks deck={deck} user={user} compact />
          </section>
          <section className="panel practice-about">
            <p className="eyebrow">About this deck</p>
            <p className="practice-about__text">{deck.intro}</p>
          </section>
        </aside>
      </div>

      <CardList deck={deck} />

      <Faq items={deck.faq} />

      {related.length > 0 && (
        <section aria-labelledby="related-title">
          <h2 id="related-title" className="practice-section-title">
            More in {category.title}
          </h2>
          <div className="practice-grid">
            {related.map((d) => (
              <DeckTile key={d.slug} deck={d} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

function CardList({ deck }: { deck: PublicDeck }) {
  return (
    <section className="practice-list" aria-labelledby="cards-title">
      <h2 id="cards-title" className="practice-section-title">
        All {deck.cards.length} cards
      </h2>
      <ol className="practice-list__grid">
        {deck.cards.map((c, i) => (
          <li key={c.front} className="practice-list__item">
            <span className="practice-list__n tabular">{i + 1}</span>
            <div className="practice-list__front">
              <CardText text={c.front} />
              {c.hint && <span className="practice-list__hint">{c.hint}</span>}
            </div>
            <div className="practice-list__back">
              <CardText text={c.back} />
              {c.extra && <CardText text={c.extra} className="practice-list__extra" />}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
