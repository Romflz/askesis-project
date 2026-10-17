import { levelInfo, RATINGS } from '@askesis/core'
import { Link } from '@tanstack/react-router'
import { CalendarClock, Coffee, Coins, Flame, PartyPopper, RotateCcw, Sparkles, TrendingUp, Zap } from 'lucide-react'
import { animate as tween, AnimatePresence, motion, useMotionValue, useTransform } from 'motion/react'
import { useEffect, useState } from 'react'
import { fmtInt, fmtPct } from '../../lib/format.ts'
import { MODE_INFO, type StudyMode, type StudySearch } from './search.ts'
import { comboTier, type HistoryEntry } from './sessionState.ts'

/** In RATINGS order: Again, Hard, Good, Easy. */
const RATING_COLORS = ['var(--c-again)', 'var(--c-hard)', 'var(--c-good)', 'var(--c-easy)']

/** "45s", "12m 05s" or "1h 20m". */
function duration(ms: number): string {
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ${String(s % 60).padStart(2, '0')}s`
  return `${Math.floor(m / 60)}h ${m % 60}m`
}

/**
 * Counts up to `value` after `delay` seconds. A later change (a lucky find landing
 * after the summary opened) ticks on from where it was.
 */
function CountUp({ value, run, delay = 0 }: { value: number; run: boolean; delay?: number }) {
  const count = useMotionValue(run ? 0 : value)
  const text = useTransform(count, (v) => fmtInt(Math.round(v)))
  useEffect(() => {
    if (!run) return count.set(value)
    const controls = tween(count, value, { duration: 1.3, delay, ease: 'easeOut' })
    return () => controls.stop()
  }, [count, value, run, delay])
  return <motion.span>{text}</motion.span>
}

/** Seconds before the level bar starts moving, after the count-ups get going. */
const BAR_DELAY = 0.5

/**
 * Level progress from where the session started to where it ended. Crossing a
 * level fills the bar, swaps in the new level and carries on from empty.
 */
function LevelProgress({ startXp, endXp, streak, run }: { startXp: number; endXp: number; streak: number; run: boolean }) {
  const from = levelInfo(startXp)
  const to = levelInfo(endXp)
  const gained = to.level > from.level
  const barSeconds = gained ? 1.8 : 1.1
  const [crossed, setCrossed] = useState(!run)

  useEffect(() => {
    if (!run || !gained) return setCrossed(true)
    // The bar is full halfway through its animation.
    const t = setTimeout(() => setCrossed(true), (BAR_DELAY + barSeconds / 2) * 1000)
    return () => clearTimeout(t)
  }, [run, gained, barSeconds])

  const pct = (p: number) => `${Math.min(100, p * 100)}%`
  const shown = crossed ? to : from
  return (
    <div className="study-end__level">
      <div className="study-end__level-row">
        <span>
          Level{' '}
          <motion.strong
            key={shown.level}
            className="study-end__level-n"
            initial={run && crossed && gained ? { scale: 1.6 } : false}
            animate={{ scale: 1 }}
          >
            {shown.level}
          </motion.strong>{' '}
          · {shown.title}
          <AnimatePresence>
            {gained && crossed && (
              <motion.span
                className="study-end__levelup"
                initial={run ? { opacity: 0, scale: 0.6 } : false}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              >
                <TrendingUp size={13} /> Level up!
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        <span className="study-end__streak">
          <Flame size={14} fill="currentColor" /> {streak}-day streak
        </span>
      </div>
      <div
        className="study-end__level-bar"
        role="progressbar"
        aria-label={`Level ${to.level} progress`}
        aria-valuemin={0}
        aria-valuemax={to.span}
        aria-valuenow={to.into}
      >
        <motion.div
          initial={run ? { width: pct(from.progress) } : false}
          animate={{ width: gained ? [pct(from.progress), '100%', '0%', pct(to.progress)] : pct(to.progress) }}
          transition={{ duration: barSeconds, delay: BAR_DELAY, ease: 'easeInOut', times: gained ? [0, 0.5, 0.5, 1] : undefined }}
        />
      </div>
      {/* Hidden (not removed) until the bar reaches the new level, so nothing moves. */}
      <p className="study-end__level-note tabular" style={{ visibility: crossed ? undefined : 'hidden' }}>
        {fmtInt(to.span - to.into)} XP to level {to.level + 1}
      </p>
    </div>
  )
}

/** Links to more studying with the same decks and tag filters. */
function MoreLinks({ search, exclude }: { search: StudySearch; exclude?: StudyMode }) {
  const base = { decks: search.decks, tags: search.tags, match: search.match, xtags: search.xtags }
  const options = [
    {
      mode: 'new' as const,
      icon: <Sparkles size={15} />,
      label: 'Extra new cards',
      search: { ...base, mode: 'new' as const, limit: 10 },
    },
    {
      mode: 'ahead' as const,
      icon: <CalendarClock size={15} />,
      label: 'Review ahead',
      search: { ...base, mode: 'ahead' as const },
    },
    {
      mode: 'forgotten' as const,
      icon: <RotateCcw size={15} />,
      label: 'Forgotten cards',
      search: { ...base, mode: 'forgotten' as const },
    },
    {
      mode: 'cram' as const,
      icon: <Flame size={15} />,
      label: 'Cram (practice)',
      search: { ...base, mode: 'cram' as const, limit: 30 },
    },
  ].filter((o) => o.mode !== exclude)
  return (
    <div className="study-more">
      {options.map((o) => (
        <Link key={o.mode} to="/study/session" search={o.search} className="study-more__link">
          {o.icon}
          {o.label}
        </Link>
      ))}
    </div>
  )
}

/** Shown when a session has no cards at all; suggests other modes for the same selection. */
export function EmptyQueue({ search, mode }: { search: StudySearch; mode: StudyMode }) {
  return (
    <div className="study-end study-end--empty">
      <Coffee size={30} className="study-end__icon" />
      <h1 className="study-end__title">{mode === 'scheduled' ? 'Nothing due right now' : 'No cards match'}</h1>
      <p className="study-end__lead">
        {mode === 'scheduled'
          ? 'You’re all caught up for today in this selection. Want to keep going?'
          : `${MODE_INFO[mode].label} found nothing in this selection. Try another mode or more decks.`}
      </p>
      <MoreLinks search={search} exclude={mode} />
      <div className="study-end__actions">
        <Link to="/study" className="btn btn--ghost">
          Change selection
        </Link>
        <Link to="/dashboard" className="btn btn--primary">
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}

/** The end-of-session screen: rewards, stats, the rating breakdown, level progress and what to study next. */
export function SessionSummary({
  history,
  elapsed,
  xp,
  coins,
  bestCombo,
  startXp,
  streak,
  reschedules,
  animate,
  search,
}: {
  history: HistoryEntry[]
  elapsed: number
  xp: number
  /** Coins from lucky finds this session. */
  coins: number
  bestCombo: number
  /** Total XP when the session started; the level bar runs from here to `startXp + xp`. */
  startXp: number
  streak: number
  reschedules: boolean
  /** Count-ups and the level bar animate (off for reduced motion). */
  animate: boolean
  search: StudySearch
}) {
  const n = history.length
  const counts = RATINGS.map(({ rating }) => history.filter((h) => h.rating === rating).length)
  const recalled = n ? (n - counts[0]!) / n : 0
  const answerMs = history.reduce((s, h) => s + h.ms, 0)

  return (
    <div className="study-end">
      <PartyPopper size={30} className="study-end__icon" />
      <h1 className="study-end__title">{reschedules ? 'Session complete' : 'Practice complete'}</h1>
      <p className="study-end__lead">
        {reschedules
          ? 'Every answer is saved and scheduled.'
          : 'Cram answers are practice only; when cards come back hasn’t changed.'}
      </p>

      {reschedules && (
        <dl className="study-end__rewards">
          <div className="study-end__reward study-end__reward--xp">
            <dt>XP earned</dt>
            <dd>
              <Zap size={20} fill="currentColor" aria-hidden />+<CountUp value={xp} run={animate} delay={0.2} />
            </dd>
          </div>
          {coins > 0 && (
            <div className="study-end__reward study-end__reward--coins">
              <dt>Lucky finds</dt>
              <dd>
                <Coins size={20} aria-hidden />+<CountUp value={coins} run={animate} delay={0.45} />
                <span className="sr-only"> coins</span>
              </dd>
            </div>
          )}
          <div className={`study-end__reward study-end__reward--combo study-end__reward--t${comboTier(bestCombo)}`}>
            <dt>Best combo</dt>
            <dd>
              <Flame size={20} fill="currentColor" aria-hidden />
              {bestCombo ? `×${bestCombo}` : '—'}
            </dd>
          </div>
        </dl>
      )}

      <dl className="study-end__stats">
        <div>
          <dt>Answered</dt>
          <dd>{fmtInt(n)}</dd>
        </div>
        <div>
          <dt>Recalled</dt>
          <dd>{n ? fmtPct(recalled) : '—'}</dd>
        </div>
        <div>
          <dt>Time</dt>
          <dd>{duration(elapsed)}</dd>
        </div>
        <div>
          <dt>Per card</dt>
          <dd>{n ? `${(answerMs / n / 1000).toFixed(1)}s` : '—'}</dd>
        </div>
        {!reschedules && (
          <div>
            <dt>Best run</dt>
            <dd>{bestCombo}</dd>
          </div>
        )}
      </dl>

      {n > 0 && (
        <div className="study-end__breakdown">
          <div className="study-end__bar" role="img" aria-label={RATINGS.map((r, i) => `${r.label}: ${counts[i]}`).join(', ')}>
            {counts.map((c, i) =>
              c > 0 ? (
                <span key={i} style={{ flexGrow: c, background: RATING_COLORS[i] }} title={`${RATINGS[i]!.label}: ${c}`} />
              ) : null,
            )}
          </div>
          <ul className="study-end__legend">
            {RATINGS.map((r, i) => (
              <li key={r.key}>
                <span className="dot" style={{ '--dot': RATING_COLORS[i] } as React.CSSProperties} />
                {r.label} <strong className="tabular">{counts[i]}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}

      {reschedules && <LevelProgress startXp={startXp} endXp={startXp + xp} streak={streak} run={animate} />}

      <p className="eyebrow study-end__more-title">Study more</p>
      <MoreLinks search={search} />
      <div className="study-end__actions">
        <Link to="/study" className="btn btn--ghost">
          Change selection
        </Link>
        <Link to="/dashboard" className="btn btn--primary">
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
