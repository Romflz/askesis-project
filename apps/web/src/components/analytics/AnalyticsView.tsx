import { type Analytics, formatDay } from '@askesis/core'
import clsx from 'clsx'
import { Clock, Flame, Layers, Sprout, Target, Timer } from 'lucide-react'
import { fmtInt, fmtMinutes, fmtPct, plural } from '../../lib/format.ts'
import { DeckTablePanel, ToughCardsPanel } from './DeckTables.tsx'
import { CountsPanel, DifficultyPanel, IntervalsPanel, RecallPanel } from './Distributions.tsx'
import { fmtDuration, fmtSeconds, Kpi } from './parts.tsx'
import { AnswersPanel, HoursPanel, WeekdaysPanel } from './Patterns.tsx'
import { AddedPanel, ForecastPanel, RetentionPanel, ReviewsPanel } from './TimeCharts.tsx'

// The analytics page body: one filter row (range, deck) scoping everything
// below it, KPI tiles, then the charts and tables.

export type AnalyticsRangeParam = 30 | 90 | 365 | 'all'

export const RANGES: { value: AnalyticsRangeParam; label: string; short: string }[] = [
  { value: 30, label: '1 month', short: '1 mo' },
  { value: 90, label: '3 months', short: '3 mo' },
  { value: 365, label: '1 year', short: '1 yr' },
  { value: 'all', label: 'All time', short: 'All' },
]

export interface AnalyticsControls {
  range: AnalyticsRangeParam
  onRange: (range: AnalyticsRangeParam) => void
  onDeck: (deck: string | undefined) => void
  /** New numbers are loading: the current ones stay up, dimmed. */
  pending?: boolean
}

export function AnalyticsView({ data, controls }: { data: Analytics; controls: AnalyticsControls }) {
  return (
    <div className={clsx('analytics__body', controls.pending && 'is-pending')} aria-busy={controls.pending || undefined}>
      <Filters data={data} controls={controls} />
      <KpiRow data={data} />
      <div className="analytics__grid">
        <div className="an-area-forecast">
          <ForecastPanel data={data} />
        </div>
        <div className="an-area-counts">
          <CountsPanel data={data} />
        </div>
        <div className="an-area-reviews">
          <ReviewsPanel data={data} />
        </div>
        <div className="an-area-retention">
          <RetentionPanel data={data} />
        </div>
        <div className="an-area-answers">
          <AnswersPanel data={data} />
        </div>
        <div className="an-area-intervals">
          <IntervalsPanel data={data} />
        </div>
        <div className="an-area-difficulty">
          <DifficultyPanel data={data} />
        </div>
        <div className="an-area-recall">
          <RecallPanel data={data} />
        </div>
        <div className="an-area-hours">
          <HoursPanel data={data} />
        </div>
        <div className="an-area-weekdays">
          <WeekdaysPanel data={data} />
        </div>
        <div className="an-area-added">
          <AddedPanel data={data} />
        </div>
        <div className="an-area-decks">
          <DeckTablePanel data={data} />
        </div>
        <div className="an-area-tough">
          <ToughCardsPanel data={data} />
        </div>
      </div>
    </div>
  )
}

function Filters({ data, controls }: { data: Analytics; controls: AnalyticsControls }) {
  const sameYear = data.from.slice(0, 4) === data.today.slice(0, 4)
  return (
    <div className="an-filters" role="group" aria-label="Filters">
      <div className="segmented an-filters__range" role="group" aria-label="Time range">
        {RANGES.map((r) => (
          <button
            key={r.value}
            type="button"
            aria-pressed={controls.range === r.value}
            aria-label={r.label}
            onClick={() => controls.onRange(r.value)}
          >
            <span className="an-filters__long">{r.label}</span>
            <span className="an-filters__short" aria-hidden>
              {r.short}
            </span>
          </button>
        ))}
      </div>
      <label className="an-filters__deck">
        <span className="sr-only">Deck</span>
        <select className="input select" value={data.deck ?? ''} onChange={(e) => controls.onDeck(e.target.value || undefined)}>
          <option value="">All decks</option>
          {/* An <option> can't hold markup, so non-breaking spaces indent the subdecks. */}
          {data.decks.map((d) => (
            <option key={d.id} value={d.id}>
              {'   '.repeat(d.depth)}
              {d.name}
            </option>
          ))}
        </select>
      </label>
      <p className="an-filters__span">
        {formatDay(
          data.from,
          sameYear ? { month: 'short', day: 'numeric' } : { month: 'short', day: 'numeric', year: 'numeric' },
        )}{' '}
        – {formatDay(data.today, { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>
    </div>
  )
}

/** Change against the previous period of the same length, e.g. "12% vs previous 30 days". */
function change(current: number, previous: number, period: string) {
  if (previous <= 0) return null
  const ratio = current / previous - 1
  if (Math.abs(ratio) < 0.005) return { text: `Same as previous ${period}`, up: null }
  return { text: `${fmtPct(Math.abs(ratio))} vs previous ${period}`, up: ratio > 0 }
}

/** A rate's change in percentage points, e.g. "1.5 pts vs previous 30 days". */
function pointsChange(current: number | null, previous: number | null, period: string) {
  if (current === null || previous === null) return null
  const points = (current - previous) * 100
  if (Math.abs(points) < 0.05) return { text: `Same as previous ${period}`, up: null }
  return { text: `${Math.abs(points).toFixed(1)} pts vs previous ${period}`, up: points > 0 }
}

const pctOrDash = (rate: number | null) => (rate === null ? '—' : fmtPct(rate, 1))

function KpiRow({ data }: { data: Analytics }) {
  const k = data.kpis
  const p = k.previous
  const days = data.span
  const period = data.days === 365 ? 'year' : plural(days, 'day')
  // Whole numbers from ten a day up; one decimal below that, dropping a trailing ".0".
  const perDay = (n: number) => (n / days >= 10 ? fmtInt(Math.round(n / days)) : (n / days).toFixed(1).replace(/\.0$/, ''))

  return (
    <div className="kpis">
      <Kpi
        icon={<Layers size={15} />}
        label="Reviews"
        value={fmtInt(k.reviews)}
        detail={`${perDay(k.reviews)} a day`}
        delta={p && change(k.reviews, p.reviews, period)}
      />
      <Kpi
        icon={<Clock size={15} />}
        label="Study time"
        value={fmtDuration(k.studyMs)}
        detail={k.studyMs ? `${fmtMinutes(k.studyMs / 60_000 / days)} a day` : 'Nothing timed yet'}
        delta={p && change(k.studyMs, p.studyMs, period)}
      />
      <Kpi
        icon={<Timer size={15} />}
        label="Average answer"
        value={k.answerMs === null ? '—' : fmtSeconds(k.answerMs)}
        detail={k.answerMs ? `${(60_000 / k.answerMs).toFixed(1)} cards a minute` : 'Nothing timed yet'}
      />
      <Kpi
        icon={<Target size={15} />}
        label="True retention"
        value={pctOrDash(k.retention)}
        detail={
          k.retention === null
            ? 'No review cards answered yet'
            : `Young ${pctOrDash(k.retentionYoung)} · mature ${pctOrDash(k.retentionMature)}`
        }
        delta={p && pointsChange(k.retention, p.retention, period)}
      />
      <Kpi
        icon={<Sprout size={15} />}
        label="Cards learned"
        value={fmtInt(k.learned)}
        detail={`${perDay(k.learned)} new a day`}
        delta={p && change(k.learned, p.learned, period)}
      />
      <Kpi
        icon={<Flame size={15} />}
        label="Streak"
        value={plural(k.streak, 'day')}
        detail={`Best ${fmtInt(k.longestStreak)} · studied ${fmtInt(k.daysStudied)} of ${plural(days, 'day')}`}
      />
    </div>
  )
}
