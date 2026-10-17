import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeftRight, ArrowRight, Code, Gift, ShieldCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { GITHUB_URL } from '../lib/links.ts'
import { absoluteUrl, breadcrumbs, jsonLd, ORGANIZATION, seo } from '../lib/seo.ts'

const TITLE = 'About Askesis · Why we made it'
const DESCRIPTION =
  'Why we made Askesis: spaced repetition works, but the daily habit is hard. So we built free, private flashcards that play like a game.'

const VALUES: { icon: typeof Gift; title: string; text: ReactNode }[] = [
  {
    icon: Gift,
    title: 'Free for everyone',
    text: 'Every feature is free, with no paywalls and no ads. Patrons pay for hosting and development time.',
  },
  {
    icon: ShieldCheck,
    title: 'Private by default',
    text: 'No ads and no selling data. Analytics run only if you allow them, and your cards and review history stay yours.',
  },
  {
    icon: ArrowLeftRight,
    title: 'Your data moves with you',
    text: 'Bring decks in from CSV files and other flashcard apps with their progress, and export everything whenever you like.',
  },
  {
    icon: Code,
    title: 'Built in the open',
    text: (
      <>
        The code is public on{' '}
        <a href={GITHUB_URL} target="_blank" rel="noreferrer">
          GitHub
        </a>
        . Run your own copy for yourself, your family, a school or a community.
      </>
    ),
  },
]

export const Route = createFileRoute('/about')({
  head: () => {
    const { meta, links } = seo({ title: TITLE, description: DESCRIPTION, path: '/about' })
    return {
      meta: [
        ...meta,
        jsonLd(
          {
            '@type': 'AboutPage',
            '@id': absoluteUrl('/about#page'),
            name: 'About Askesis',
            description: DESCRIPTION,
            url: absoluteUrl('/about'),
            isPartOf: { '@id': absoluteUrl('/#website') },
            about: { '@id': ORGANIZATION['@id'] },
          },
          breadcrumbs([
            { name: 'Askesis', path: '/' },
            { name: 'About', path: '/about' },
          ]),
        ),
      ],
      links,
    }
  },
  component: About,
})

function About() {
  const { user } = Route.useRouteContext()
  return (
    <main className="info-page">
      <header className="info-hero">
        <p className="eyebrow">About</p>
        <h1 className="info-hero__title">Why we made Askesis</h1>
        <p className="info-hero__lead">
          Spaced repetition is the most reliable way we know to remember what we learn. The method was never the hard part.
          Showing up every day was.
        </p>
      </header>

      <div className="info-prose">
        <h2>Good tools, hard habit</h2>
        <p>
          We used flashcards for languages, exams and work, and it always went the same way. A few good weeks, then a busy one,
          then a pile of overdue cards that made opening the app feel like a chore. The scheduling did its job. We just stopped
          coming back.
        </p>
        <p>
          Most flashcard apps are built like tools: powerful, plain and easy to put off. Games are built the other way round, so
          that coming back tomorrow feels good. We wanted both in one place.
        </p>

        <h2>A game that respects the science</h2>
        <p>
          Askesis keeps proven scheduling, SM-2 or FSRS, and wraps it in a daily loop: streaks with freezes for the days life gets
          in the way, XP and levels, a daily chest, quests and trophies. Every review moves something forward, so even five
          minutes feels like progress.
        </p>
        <p>
          The game never bends the memory science. Hard, Good and Easy pay the same XP, so there’s no reason to press Easy on a
          card you struggled with, and every card comes back when the scheduler says it should.
        </p>
      </div>

      <section aria-labelledby="values-title">
        <h2 id="values-title" className="info-section-title">
          What we hold to
        </h2>
        <ul className="about-values">
          {VALUES.map((v) => (
            <li key={v.title} className="panel about-value">
              <span className="about-value__icon" aria-hidden>
                <v.icon size={18} />
              </span>
              <h3 className="about-value__title">{v.title}</h3>
              <p className="about-value__text">{v.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="info-prose">
        <h2>The name</h2>
        <p>
          <em>Askesis</em> is Greek for training through practice. Athletes used the word for their exercise, and the Stoics
          borrowed it for the small daily exercises that build a habit of mind. That’s the idea here too: a little practice every
          day adds up.
        </p>
      </div>

      <section className="panel about-cta" aria-labelledby="cta-title">
        <div>
          <h2 id="cta-title" className="about-cta__title">
            {user ? 'Keep the streak going' : 'Start with a free deck'}
          </h2>
          <p className="about-cta__text">
            {user
              ? 'Your cards for today are waiting on the dashboard.'
              : 'Practice any public deck in your browser, no account needed. Sign up when you want your progress to follow you.'}
          </p>
        </div>
        <div className="about-cta__actions">
          {user ? (
            <Link to="/dashboard" className="btn btn--primary">
              Go to the dashboard <ArrowRight size={15} />
            </Link>
          ) : (
            <>
              <Link to="/practice" className="btn btn--primary">
                Browse practice decks <ArrowRight size={15} />
              </Link>
              <Link to="/register" className="btn btn--ghost">
                Create an account
              </Link>
            </>
          )}
        </div>
      </section>

      <p className="info-footnote">
        Questions or ideas? <Link to="/contact">Get in touch</Link>.
      </p>
    </main>
  )
}
