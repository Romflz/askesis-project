import type { SessionUser } from '@askesis/contracts'
import { useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import clsx from 'clsx'
import { ArrowDown, Check, UserPlus, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { TARGET_RETENTION, type DueKind, formatDay, streakMultiplier } from '@askesis/core'
import { fmtInt, fmtMinutes } from '../../lib/format.ts'
import { queries } from '../../lib/queries.ts'
import { PracticePicker } from '../practice/PracticePicker.tsx'
import { toSearch } from '../study/search.ts'
import { useSession } from './session.tsx'
import { AnimatedNumber, Ring } from './ui.tsx'

/** Cards in a quick study: a few minutes' work. */
const QUICK_CARDS = 20

function greetingFor(hour: number): string {
  if (hour < 5) return 'Burning the midnight oil'
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

/** Server hour first (no hydration mismatch), then the viewer's own clock. */
function useGreeting(serverHour: number): string {
  const [hour, setHour] = useState(serverHour)
  useEffect(() => setHour(new Date().getHours()), [])
  return greetingFor(hour)
}

const DUE_LABELS: Record<DueKind, string> = { new: 'New', learning: 'Learning', review: 'Review' }

/** The daily goal ring with today's XP and the streak boost. */
function GoalProgress() {
  const { data } = useSession()
  const { todayStats, goal, streak } = data
  const goalDone = todayStats.reviews >= goal
  return (
    <>
      <Ring
        value={todayStats.reviews / goal}
        size={184}
        stroke={12}
        color={goalDone ? 'var(--c-mature)' : 'var(--accent)'}
        className="hero__ring"
      >
        <div>
          <div className="hero__goal-value">
            {goalDone ? <Check size={44} strokeWidth={2.5} /> : <AnimatedNumber value={todayStats.reviews} />}
          </div>
          <div className="hero__goal-label">{goalDone ? 'Goal complete' : `of ${goal} reviews`}</div>
        </div>
      </Ring>
      <div className="hero__goal-chips">
        <span className="chip chip--xp">
          <Zap size={13} fill="currentColor" />
          <span>
            +<AnimatedNumber value={todayStats.xp} /> XP today
          </span>
        </span>
        <span className="chip" title="XP multiplier from your streak (up to ×1.5)">
          ×{streakMultiplier(streak.current).toFixed(2)} streak boost
        </span>
      </div>
    </>
  )
}

/** The top of the dashboard: greeting, what's due today, a time estimate and the daily goal. */
export function TodayHero({ user }: { user: SessionUser | null }) {
  const { data } = useSession()
  const { due } = data
  const total = due.new + due.learning + due.review
  // A new card takes about two and a half times as long as a review.
  const seconds = (due.review + due.learning) * data.secondsPerReview + due.new * data.secondsPerReview * 2.5
  const greeting = useGreeting(data.localHour)
  const firstName = user?.name.split(' ')[0]
  const [picking, setPicking] = useState(false)
  const queryClient = useQueryClient()
  // The deck list loads on hover, so the visitors' picker usually opens with it ready.
  const prefetchDecks = () => void queryClient.prefetchQuery(queries.practiceIndex())
  // On your own dashboard with nothing due there is nothing to pick from; the demo
  // shows a sample learner's numbers, not the signed-in user's.
  const caughtUp = !data.isDemo && total === 0

  return (
    <section className="panel hero" aria-labelledby="hero-title">
      <div className="hero__backdrop" aria-hidden />
      <div className="hero__main">
        <div className="hero__meta">
          <span className="eyebrow">{formatDay(data.today, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          {data.isDemo && (
            <span className="chip chip--demo" title="A simulated learner’s dashboard. Sign up to see your own.">
              Sample learner
            </span>
          )}
        </div>

        <h1 id="hero-title" className="hero__greeting">
          {greeting}
          {firstName ? `, ${firstName}` : ''}.
        </h1>

        {total > 0 ? (
          <>
            <p className="hero__headline">
              <span className="hero__count">
                <AnimatedNumber value={total} />
              </span>
              <span className="hero__count-label">
                cards ready
                <br />
                for review
              </span>
            </p>
            <p className="hero__sub">
              About {fmtMinutes(seconds / 60)}.{' '}
              {due.review > 0
                ? `Reviewing now keeps ${fmtInt(due.review)} memories above ${Math.round(TARGET_RETENTION * 100)}% recall.`
                : `${fmtInt(due.new)} new ${due.new === 1 ? 'card' : 'cards'} to learn today.`}
            </p>
          </>
        ) : (
          <p className="hero__headline hero__headline--done">
            <span className="hero__count">All caught up</span>
          </p>
        )}

        <ul className="hero__due" aria-label="Due today">
          {(Object.keys(DUE_LABELS) as DueKind[]).map((kind) => (
            <li key={kind} className={clsx('due-chip', `due-chip--${kind}`, due[kind] === 0 && 'is-empty')}>
              <span className="dot" />
              <span className="due-chip__value tabular">
                <AnimatedNumber value={due[kind]} />
              </span>
              <span className="due-chip__label">{DUE_LABELS[kind]}</span>
            </li>
          ))}
        </ul>

        <div className="hero__actions">
          {/* Signed in: a short session of the due cards closest to being forgotten.
              Visitors: pick a free practice deck. */}
          {!user ? (
            <button
              type="button"
              className="btn btn--primary"
              aria-haspopup="dialog"
              onClick={() => setPicking(true)}
              onPointerEnter={prefetchDecks}
              onFocus={prefetchDecks}
            >
              <Zap size={16} fill="currentColor" />
              Quick study
            </button>
          ) : caughtUp ? (
            <button type="button" className="btn btn--primary" disabled>
              <Zap size={16} fill="currentColor" />
              Quick study
            </button>
          ) : (
            <Link to="/study/session" search={toSearch({ mode: 'quick', limit: QUICK_CARDS })} className="btn btn--primary">
              <Zap size={16} fill="currentColor" />
              Quick study
            </Link>
          )}
          {data.isDemo && !user ? (
            <Link to="/register" className="btn btn--ghost">
              <UserPlus size={16} />
              {/* "Create account" on phones, where both buttons share a row. */}
              <span>
                Create <span className="hero__wide-only">your </span>account
              </span>
            </Link>
          ) : (
            <a href="#decks" className="btn btn--ghost">
              <ArrowDown size={16} />
              Browse decks
            </a>
          )}
        </div>
        <p className="hero__hint">
          {!user
            ? 'Pick a free deck and start right away, no account needed.'
            : caughtUp
              ? 'Nothing is due right now. Custom study on the Study page can review ahead or add new cards.'
              : `Up to ${QUICK_CARDS} of today’s cards, the ones you’re closest to forgetting first.`}
        </p>
        {!user && <PracticePicker open={picking} onClose={() => setPicking(false)} />}
      </div>

      <aside className="hero__goal" aria-label="Daily goal">
        <GoalProgress />
      </aside>
    </section>
  )
}
