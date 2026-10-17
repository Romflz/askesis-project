import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, BrainCircuit, CalendarCheck, Flame, Sparkles } from 'lucide-react'
import { DeckTile, Faq } from '../../components/practice/PracticeParts.tsx'
import { queries } from '../../lib/queries.ts'
import { absoluteUrl, breadcrumbs, jsonLd, ORGANIZATION, seo } from '../../lib/seo.ts'

// Topic landing pages ("learn Japanese", "programming flashcards", …) built for
// search: keyword-rich copy, the topic's decks, FAQ, and a sign-up block.
export const Route = createFileRoute('/learn/$category')({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(queries.topic(params.category)),
  head: ({ loaderData }) => {
    if (!loaderData) return {}
    const { category, decks } = loaderData
    const path = `/learn/${category.slug}`
    const { meta, links } = seo({
      title: `${category.headline} · Askesis`,
      description: category.description,
      path,
      image: `/og-${category.slug}.png`,
    })
    return {
      meta: [
        ...meta,
        jsonLd(
          {
            '@type': 'CollectionPage',
            '@id': absoluteUrl(`${path}#page`),
            name: category.headline,
            description: category.description,
            url: absoluteUrl(path),
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
          {
            '@type': 'FAQPage',
            mainEntity: category.faq.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          },
          breadcrumbs([
            { name: 'Askesis', path: '/' },
            { name: 'Practice', path: '/practice' },
            { name: category.title, path },
          ]),
        ),
      ],
      links,
    }
  },
  component: LearnCategory,
})

const STEPS = [
  { icon: Sparkles, title: 'See a card', text: 'Recall the answer before you flip it. Effortful recall is what builds memory.' },
  { icon: BrainCircuit, title: 'Grade yourself', text: 'Again, Hard, Good or Easy. Each answer sets when the card comes back.' },
  {
    icon: CalendarCheck,
    title: 'Review just in time',
    text: 'Cards return right before you would forget them: minutes, then days, then months.',
  },
]

function LearnCategory() {
  const params = Route.useParams()
  const {
    data: { category, decks, others },
  } = useSuspenseQuery(queries.topic(params.category))
  const { user } = Route.useRouteContext()

  return (
    <main className="practice-page learn-page">
      <header className="learn-hero">
        <div className="learn-hero__copy">
          <p className="eyebrow">{category.title} · free flashcards</p>
          <h1 className="learn-hero__title">{category.headline}</h1>
          <p className="learn-hero__lead">{category.intro}</p>
          <div className="learn-hero__actions">
            <Link to="/practice/$slug" params={{ slug: decks[0]!.slug }} className="btn btn--primary">
              Start with {decks[0]!.shortTitle} <ArrowRight size={16} />
            </Link>
            {!user && (
              <Link to="/register" search={{ redirect: `/learn/${category.slug}` }} className="btn btn--ghost">
                Create a free account
              </Link>
            )}
          </div>
        </div>
        <ul className="learn-hero__benefits">
          {category.benefits.map((b) => (
            <li key={b.title} className="learn-benefit">
              <span className="learn-benefit__title">{b.title}</span>
              <span className="learn-benefit__text">{b.text}</span>
            </li>
          ))}
        </ul>
      </header>

      <section aria-labelledby="decks-title">
        <h2 id="decks-title" className="practice-section-title">
          {category.title} decks
        </h2>
        <div className="practice-grid">
          {decks.map((d) => (
            <DeckTile key={d.slug} deck={d} />
          ))}
        </div>
      </section>

      <section className="learn-steps" aria-labelledby="how-title">
        <h2 id="how-title" className="practice-section-title">
          How spaced repetition works
        </h2>
        <ol className="learn-steps__grid">
          {STEPS.map((s, i) => (
            <li key={s.title} className="learn-step">
              <span className="learn-step__icon" aria-hidden>
                <s.icon size={18} />
              </span>
              <span className="learn-step__n">Step {i + 1}</span>
              <span className="learn-step__title">{s.title}</span>
              <span className="learn-step__text">{s.text}</span>
            </li>
          ))}
        </ol>
      </section>

      <Faq items={category.faq} />

      <section className="learn-capture" aria-labelledby="capture-title">
        <Flame size={22} className="learn-capture__icon" aria-hidden />
        <h2 id="capture-title" className="learn-capture__title">
          {user ? 'Keep your streak going' : `Start learning ${category.inlineTitle} today`}
        </h2>
        <p className="learn-capture__text">
          {user
            ? 'Add any deck above to your collection and your reviews count toward streaks, quests and trophies.'
            : 'Free forever. Sync your progress, build a streak, get a daily reminder when your cards are ready, and see your stats grow.'}
        </p>
        <div className="learn-capture__actions">
          {user ? (
            <Link to="/dashboard" className="btn btn--primary">
              Go to your dashboard <ArrowRight size={16} />
            </Link>
          ) : (
            <Link to="/register" search={{ redirect: `/learn/${category.slug}` }} className="btn btn--primary">
              Create a free account <ArrowRight size={16} />
            </Link>
          )}
          <Link to="/practice" className="btn btn--ghost">
            Browse all decks
          </Link>
        </div>
      </section>

      <nav className="learn-others" aria-label="Other topics">
        {others.map((c) => (
          <Link key={c.slug} to="/learn/$category" params={{ category: c.slug }} className="practice-chip">
            {c.title}
          </Link>
        ))}
      </nav>
    </main>
  )
}
