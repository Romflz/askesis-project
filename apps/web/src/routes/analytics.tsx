import type { AnalyticsQuery, AnalyticsRange } from '@askesis/contracts'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, type SearchSchemaInput, stripSearchParams, useRouterState } from '@tanstack/react-router'
import { Brain, CalendarClock, ChartColumn, Clock, Info, Layers, Target } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { type AnalyticsControls, type AnalyticsRangeParam, AnalyticsView } from '../components/analytics/AnalyticsView.tsx'
import { LoginPrompt, type LoginPromptCopy } from '../components/askesis/LoginPrompt.tsx'
import { absoluteUrl, breadcrumbs, jsonLd, ORGANIZATION, seo } from '../lib/seo.ts'
import { queries } from '../lib/queries.ts'
import { int, uuid } from '../lib/search-params.ts'

const TITLE = 'Flashcard analytics: retention, forecasts and FSRS stats · Askesis'
const DESCRIPTION =
  'See what’s due next, your true retention by week, review intervals, FSRS difficulty and recall, your best study hours and your toughest cards, deck by deck. Free and open source.'

interface AnalyticsSearch {
  range: AnalyticsRangeParam
  deck?: string
}

const DEFAULTS = { range: 90 } as const

const PROMPT_SEEN = 'askesis-analytics-prompt'
const SAMPLE_PROMPT: LoginPromptCopy = {
  title: 'Log in to see your analytics',
  text: 'This is a sample learner. Log in to see your own forecast, retention, intervals and toughest cards, or create a free account to start.',
}
const FILTER_PROMPT: LoginPromptCopy = {
  title: 'Log in to filter your stats',
  text: 'Ranges and deck filters work on your own reviews. Log in, or create a free account, to explore them.',
}

// The router reads `?range=30` as a number; anything unexpected falls back to three months.
function parseSearch(search: Partial<AnalyticsSearch> & SearchSchemaInput): AnalyticsSearch {
  const days = int(search.range, 30, 365)
  const range: AnalyticsRangeParam =
    search.range === 'all' ? 'all' : days === 30 || days === 90 || days === 365 ? days : DEFAULTS.range
  return { range, deck: uuid(search.deck) }
}

const toQuery = (search: AnalyticsSearch): AnalyticsQuery => ({
  range: String(search.range) as AnalyticsRange,
  deck: search.deck,
})

// Public and indexable: visitors see a sample learner's analytics and a login
// popup (SSR, cached like the home page); signed-in users get their own,
// filtered by range and deck from the URL so views can be bookmarked.
export const Route = createFileRoute('/analytics')({
  validateSearch: parseSearch,
  search: { middlewares: [stripSearchParams(DEFAULTS)] },
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(queries.analytics(context.user ? toQuery(deps) : null)),
  head: ({ loaderData }) => {
    // Signed-in users get a plain tab title; the page is the same URL either way.
    const title = loaderData && !loaderData.isDemo ? 'Analytics · Askesis' : TITLE
    const { meta, links } = seo({ title, description: DESCRIPTION, path: '/analytics' })
    return {
      meta: [
        ...meta,
        jsonLd(
          {
            '@type': 'WebPage',
            '@id': absoluteUrl('/analytics#page'),
            name: 'Flashcard analytics',
            description: DESCRIPTION,
            url: absoluteUrl('/analytics'),
            isPartOf: { '@id': absoluteUrl('/#website') },
            publisher: { '@id': ORGANIZATION['@id'] },
          },
          breadcrumbs([
            { name: 'Askesis', path: '/' },
            { name: 'Analytics', path: '/analytics' },
          ]),
        ),
      ],
      links,
    }
  },
  component: AnalyticsPage,
})

const FEATURES = [
  {
    icon: <CalendarClock size={18} />,
    title: 'Future due',
    text: 'Tomorrow’s reviews and the weeks ahead, split into young and mature cards.',
  },
  {
    icon: <Target size={18} />,
    title: 'True retention',
    text: 'Your real pass rate on review cards, week by week, against a 90% target.',
  },
  {
    icon: <ChartColumn size={18} />,
    title: 'Reviews and time',
    text: 'Every answer by card kind (learning, relearning, young, mature), as counts or minutes.',
  },
  {
    icon: <Brain size={18} />,
    title: 'Memory, FSRS-style',
    text: 'Intervals, difficulty and the chance you’d recall each card right now.',
  },
  {
    icon: <Clock size={18} />,
    title: 'Your best hours',
    text: 'When in the day and week you study, and when you remember best.',
  },
  {
    icon: <Layers size={18} />,
    title: 'Decks and problem cards',
    text: 'Sortable numbers for every deck, plus the cards you forget most and your leeches.',
  },
]

function AnalyticsPage() {
  const { user } = Route.useRouteContext()
  const search = Route.useSearch()
  const { data } = useSuspenseQuery(queries.analytics(user ? toQuery(search) : null))
  const navigate = Route.useNavigate()
  const pending = useRouterState({ select: (s) => s.isLoading })
  const setSearch = useCallback(
    (patch: Partial<AnalyticsSearch>) =>
      void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true, resetScroll: false }),
    [navigate],
  )
  // Visitors see a sample learner; the login popup opens once per visit, and
  // again whenever they try to change the range or deck.
  const [prompt, setPrompt] = useState<LoginPromptCopy | null>(null)
  useEffect(() => {
    if (user) return
    try {
      if (sessionStorage.getItem(PROMPT_SEEN)) return
      sessionStorage.setItem(PROMPT_SEEN, '1')
    } catch {
      // Storage blocked: show it anyway.
    }
    setPrompt(SAMPLE_PROMPT)
  }, [user])
  const controls: AnalyticsControls = {
    range: user ? search.range : DEFAULTS.range,
    onRange: (range) => (user ? setSearch({ range }) : setPrompt(FILTER_PROMPT)),
    onDeck: (deck) => (user ? setSearch({ deck }) : setPrompt(FILTER_PROMPT)),
    pending: !!user && pending,
  }

  return (
    <main className="analytics">
      <header className="analytics__header">
        <p className="eyebrow">Analytics</p>
        <h1 className="analytics__title">How your memory is really doing</h1>
        <p className="analytics__lead">
          {user
            ? 'What’s due next, how well you remember, how far apart your reviews are and when you study best. Pick a range and a deck; everything below follows.'
            : 'Forecasts, true retention, intervals, FSRS difficulty and recall, your best hours and your toughest cards, all in one place.'}
        </p>
      </header>

      {user ? (
        <AnalyticsView data={data} controls={controls} />
      ) : (
        <>
          <p className="analytics__sample" role="note">
            <Info size={15} aria-hidden />
            <span>You’re looking at a sample learner’s last three months.</span>
            <button type="button" className="link-button" onClick={() => setPrompt(SAMPLE_PROMPT)}>
              Log in to see yours
            </button>
          </p>
          <AnalyticsView data={data} controls={controls} />
          <section className="panel perks analytics__perks" aria-labelledby="analytics-perks-title">
            <div className="perks__head">
              <div>
                <p className="eyebrow">What you’ll see</p>
                <h2 id="analytics-perks-title" className="perks__title">
                  Stats that tell you what to do next
                </h2>
                <p className="perks__lead">
                  Every chart has a table view, follows your time zone and day rollover, and can be narrowed to one deck and its
                  subdecks.
                </p>
              </div>
            </div>
            <ul className="perks__grid">
              {FEATURES.map((f) => (
                <li key={f.title} className="perk">
                  <span className="perk__icon">{f.icon}</span>
                  <span>
                    <span className="perk__title">{f.title}</span>
                    <span className="perk__text">{f.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
      {!user && <LoginPrompt copy={prompt} redirect="/analytics" onClose={() => setPrompt(null)} />}
    </main>
  )
}
