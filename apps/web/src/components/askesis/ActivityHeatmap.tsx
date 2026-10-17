import clsx from 'clsx'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { formatDay, type HeatmapDay } from '@askesis/core'
import { fmtInt, fmtPct, plural } from '../../lib/format.ts'
import { useSession } from './session.tsx'
import { PanelHeader } from './ui.tsx'

/** Quartile cut points over study days, so the scale adapts to each learner. */
function thresholds(days: HeatmapDay[]): number[] {
  const counts = days
    .map((d) => d.reviews)
    .filter((n) => n > 0)
    .sort((a, b) => a - b)
  if (counts.length === 0) return [1, 2, 3]
  const at = (q: number) => counts[Math.min(counts.length - 1, Math.floor(q * counts.length))]!
  return [at(0.25), at(0.5), at(0.75)]
}

/** The live region's text for the active day. */
function describe(day: HeatmapDay): string {
  const date = formatDay(day.date, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  if (day.reviews === 0) return `${date}: no reviews`
  const recall = day.graded ? `, ${fmtPct(day.passed / day.graded)} recall` : ''
  return `${date}: ${plural(day.reviews, 'review')}${recall}, ${day.minutes} min`
}

/**
 * A year of daily reviews, one column per week. Hover or arrow keys move a
 * tooltip between days, and a live region reads the active day aloud.
 */
export function ActivityHeatmap() {
  const { data } = useSession()
  const { todayStats, today } = data

  // The last cell follows reviews done in this session.
  const days = useMemo(
    () =>
      data.heatmap.map((d) =>
        d.date === today
          ? {
              ...d,
              reviews: todayStats.reviews,
              passed: todayStats.passed,
              graded: todayStats.graded,
              minutes: Math.round(todayStats.minutes),
            }
          : d,
      ),
    [data.heatmap, today, todayStats],
  )
  const cuts = useMemo(() => thresholds(days), [days])
  const level = (n: number) => (n === 0 ? 0 : n <= cuts[0]! ? 1 : n <= cuts[1]! ? 2 : n <= cuts[2]! ? 3 : 4)

  const weeks = Math.ceil(days.length / 7)
  const studied = days.filter((d) => d.reviews > 0)
  const total = studied.reduce((n, d) => n + d.reviews, 0)
  const firstStudy = days.findIndex((d) => d.reviews > 0)
  const eligible = firstStudy < 0 ? 0 : days.length - firstStudy

  const [active, setActive] = useState<number | null>(null)
  const [tip, setTip] = useState<{ left: number; top: number } | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // On narrow screens, start scrolled to the most recent weeks.
    const el = scrollRef.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [])

  useLayoutEffect(() => {
    // Centered over the first or last weeks, the tooltip would stick out of the panel and widen the page.
    const el = tipRef.current
    const wrap = wrapRef.current
    if (!el || !wrap || !tip) return
    const half = el.offsetWidth / 2
    const left = Math.min(Math.max(tip.left, half), wrap.clientWidth - half)
    el.style.setProperty('--shift', `${left - tip.left}px`)
  }, [tip])

  function show(index: number | null) {
    setActive(index)
    if (index === null) return setTip(null)
    const cell = wrapRef.current?.querySelector<HTMLElement>(`[data-index="${index}"]`)
    const wrap = wrapRef.current
    if (!cell || !wrap) return
    const a = cell.getBoundingClientRect()
    const b = wrap.getBoundingClientRect()
    setTip({ left: a.left - b.left + a.width / 2, top: a.top - b.top })
  }

  function onKeyDown(e: KeyboardEvent) {
    const moves: Record<string, number> = { ArrowLeft: -7, ArrowRight: 7, ArrowUp: -1, ArrowDown: 1 }
    let next: number | null = null
    if (e.key in moves) next = (active ?? days.length - 1) + moves[e.key]!
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = days.length - 1
    else if (e.key === 'Escape') return show(null)
    if (next === null) return
    e.preventDefault()
    show(Math.max(0, Math.min(days.length - 1, next)))
  }

  const activeDay = active === null ? null : days[active]

  return (
    <section className="panel heatmap" id="activity" aria-labelledby="heatmap-title">
      <PanelHeader eyebrow="Activity" title={<span id="heatmap-title">{fmtInt(total)} reviews in the last year</span>} />

      <dl className="heatmap__stats">
        <div>
          <dt>Daily average</dt>
          <dd>{fmtInt(studied.length ? Math.round(total / studied.length) : 0)}</dd>
        </div>
        <div>
          <dt>Days learned</dt>
          <dd>{eligible ? fmtPct(studied.length / eligible) : '—'}</dd>
        </div>
        <div>
          <dt>Longest streak</dt>
          <dd>{plural(data.streak.longest, 'day')}</dd>
        </div>
        <div>
          <dt>Current streak</dt>
          <dd>{plural(data.streak.current, 'day')}</dd>
        </div>
      </dl>

      <div className="heatmap__wrap" ref={wrapRef}>
        <div className="heatmap__scroll" ref={scrollRef}>
          <div className="heatmap__frame" style={{ '--weeks': weeks } as React.CSSProperties}>
            <div
              className="heatmap__grid"
              tabIndex={0}
              role="group"
              aria-label="Daily reviews for the past year. Use arrow keys to move between days."
              aria-describedby="heatmap-live"
              onKeyDown={onKeyDown}
              onBlur={() => show(null)}
              onPointerLeave={() => show(null)}
              onPointerOver={(e) => {
                const index = (e.target as HTMLElement).dataset.index
                if (index !== undefined) show(Number(index))
              }}
            >
              {days.map((d, i) => (
                <span
                  key={d.date}
                  data-index={i}
                  className={clsx('heat-cell', `heat-cell--${level(d.reviews)}`, i === active && 'is-active')}
                />
              ))}
            </div>
          </div>
        </div>

        {activeDay && tip && (
          <div ref={tipRef} className="tip heatmap__tip" style={{ left: tip.left, top: tip.top }}>
            <div className="tip__title">{formatDay(activeDay.date, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
            <div className="tip__row">
              <span className="tip__value">{fmtInt(activeDay.reviews)}</span>
              <span className="tip__label">reviews</span>
            </div>
            {activeDay.graded > 0 && (
              <div className="tip__row">
                <span className="tip__value">{fmtPct(activeDay.passed / activeDay.graded)}</span>
                <span className="tip__label">recall</span>
              </div>
            )}
            {activeDay.minutes > 0 && (
              <div className="tip__row">
                <span className="tip__value">{activeDay.minutes} min</span>
                <span className="tip__label">studied</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="heatmap__legend" aria-hidden>
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <span key={l} className={`heat-cell heat-cell--${l}`} />
        ))}
        <span>More</span>
      </div>

      <p id="heatmap-live" className="sr-only" aria-live="polite">
        {activeDay ? describe(activeDay) : ''}
      </p>
    </section>
  )
}
