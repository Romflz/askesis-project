import { type AnalyticsBucket, formatDay, formatInterval, DAY_MS } from '@askesis/core'
import clsx from 'clsx'
import { ArrowDownRight, ArrowUpRight, ChartColumn, Table2 } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import type { TooltipContentProps } from 'recharts'
import { fmtInt, fmtMinutes } from '../../lib/format.ts'
import type { SeriesSpec } from '../askesis/charts.tsx'
import { PanelHeader } from '../askesis/ui.tsx'

// Shared pieces for the analytics page: the chart panel (chart, table twin,
// headline), KPI tiles, and formatting for buckets and durations.

/** Card kinds on the reviews chart, in stack order (validated as a set, light and dark). */
export const KIND_SERIES: SeriesSpec[] = [
  { key: 'learning', label: 'Learning', color: 'var(--c-learn)' },
  { key: 'relearning', label: 'Relearning', color: 'var(--c-relearn)' },
  { key: 'young', label: 'Young', color: 'var(--c-young)' },
  { key: 'mature', label: 'Mature', color: 'var(--c-mature)' },
]

export const DUE_SERIES: SeriesSpec[] = [
  { key: 'young', label: 'Young', color: 'var(--c-young)' },
  { key: 'mature', label: 'Mature', color: 'var(--c-mature)' },
]

export const RATING_SERIES: SeriesSpec[] = [
  { key: 'again', label: 'Again', color: 'var(--c-again)' },
  { key: 'hard', label: 'Hard', color: 'var(--c-hard)' },
  { key: 'good', label: 'Good', color: 'var(--c-good)' },
  { key: 'easy', label: 'Easy', color: 'var(--c-easy)' },
]

/** Single-series charts share one hue. */
export const PRIMARY = 'var(--c-new)'

/** Bars stay thin; the slot's leftover is air. */
export const MAX_BAR = 24

export const CURSOR = { fill: 'var(--surface-2)' }

// ── Formatting ──────────────────────────────────────────────────────────────

export function bucketTick(date: string, bucket: AnalyticsBucket): string {
  if (bucket === 'month') return `${formatDay(date, { month: 'short' })} ’${date.slice(2, 4)}`
  return formatDay(date, { month: 'short', day: 'numeric' })
}

export function bucketTitle(p: { date: string; end: string }, bucket: AnalyticsBucket): string {
  if (bucket === 'day') return formatDay(p.date, { weekday: 'short', month: 'short', day: 'numeric' })
  if (bucket === 'month') return formatDay(p.date, { month: 'long', year: 'numeric' })
  if (p.date === p.end) return formatDay(p.date, { month: 'short', day: 'numeric' })
  return `${formatDay(p.date, { month: 'short', day: 'numeric' })} – ${formatDay(p.end, { month: 'short', day: 'numeric' })}`
}

/** "Day", "Week" or "Month": the first column of a bucketed table. */
export const BUCKET_LABEL: Record<AnalyticsBucket, string> = { day: 'Day', week: 'Week', month: 'Month' }

/** Study time: minutes up to ten hours, then whole hours. */
export function fmtDuration(ms: number): string {
  const minutes = ms / 60_000
  if (minutes <= 0) return '0 min'
  return minutes >= 600 ? `${Math.round(minutes / 60)} h` : fmtMinutes(minutes)
}

export const fmtSeconds = (ms: number) => `${(ms / 1000).toFixed(1)} s`

/** An interval in days, compact: "4d", "1.2mo", "2.1y". */
export const fmtDays = (days: number) => formatInterval(Math.max(1, days) * DAY_MS)

// ── Panels ──────────────────────────────────────────────────────────────────

/**
 * A chart in a panel: eyebrow, title and a one-line headline, the chart, and
 * a table view with the same numbers (toggle top right). `empty` replaces the
 * chart with a note when there's nothing to plot yet.
 */
export function ChartPanel({
  id,
  eyebrow,
  title,
  headline,
  legend,
  controls,
  table,
  note,
  empty,
  height = 240,
  className,
  children,
}: {
  id: string
  eyebrow: string
  title: ReactNode
  headline?: ReactNode
  legend?: ReactNode
  controls?: ReactNode
  table: () => ReactNode
  note?: ReactNode
  empty?: string | false
  height?: number
  className?: string
  children: ReactNode
}) {
  const [asTable, setAsTable] = useState(false)
  const titleId = `${id}-title`
  return (
    <section className={clsx('panel an-panel', className)} id={id} aria-labelledby={titleId}>
      <PanelHeader
        eyebrow={eyebrow}
        title={title}
        id={titleId}
        aside={
          <>
            {controls}
            <button
              type="button"
              className="icon-btn"
              onClick={() => setAsTable((v) => !v)}
              aria-pressed={asTable}
              aria-label={asTable ? 'Show as chart' : 'Show as table'}
              title={asTable ? 'Show as chart' : 'Show as table'}
              disabled={!!empty}
            >
              {asTable ? <ChartColumn size={17} /> : <Table2 size={17} />}
            </button>
          </>
        }
      />
      {headline && <p className="an-panel__headline">{headline}</p>}
      {legend && !asTable && !empty && <div className="an-panel__legend">{legend}</div>}
      <div className="an-panel__body" style={{ minHeight: height }}>
        {empty ? (
          <p className="an-empty">{empty}</p>
        ) : asTable ? (
          <div className="data-table-wrap" style={{ maxHeight: height }}>
            {table()}
          </div>
        ) : (
          children
        )}
      </div>
      {note && !empty && <p className="stat-note an-panel__note">{note}</p>}
    </section>
  )
}

/** A KPI tile: label, value, a detail line and an optional change against the previous period. */
export function Kpi({
  label,
  value,
  detail,
  delta,
  icon,
}: {
  label: string
  value: ReactNode
  detail?: ReactNode
  delta?: { text: string; up: boolean | null } | null
  icon: ReactNode
}) {
  return (
    <div className="kpi">
      <p className="kpi__label">
        <span className="kpi__icon" aria-hidden>
          {icon}
        </span>
        {label}
      </p>
      <p className="kpi__value">{value}</p>
      {detail && <p className="kpi__detail">{detail}</p>}
      {delta && (
        <p className="kpi__delta">
          {delta.up === true && <ArrowUpRight size={14} aria-hidden />}
          {delta.up === false && <ArrowDownRight size={14} aria-hidden />}
          {delta.text}
        </p>
      )}
    </div>
  )
}

/** Tooltip row: a short line key, the value, then the label. */
export function TipRow({ color, value, label }: { color?: string; value: ReactNode; label: ReactNode }) {
  return (
    <div className="tip__row">
      {color && <span className="tip__key" style={{ '--key': color } as React.CSSProperties} />}
      <span className="tip__value">{value}</span>
      <span className="tip__label">{label}</span>
    </div>
  )
}

type Row = Record<string, unknown>
type TipProps = Pick<TooltipContentProps, 'active' | 'payload'>

/** Tooltip for a stacked chart: every series (top of the stack first) and the total. */
export function StackTip({
  tip,
  title,
  series,
  format,
  total = true,
}: {
  tip: TipProps
  title: (row: Row) => string
  series: SeriesSpec[]
  format: (n: number) => string
  total?: boolean
}) {
  const { active, payload } = tip
  if (!active || !payload?.length) return null
  const row = payload[0]!.payload as Row
  const value = (key: string) => (typeof row[key] === 'number' ? (row[key] as number) : 0)
  return (
    <div className="tip">
      <div className="tip__title">{title(row)}</div>
      {[...series].reverse().map((s) => (
        <TipRow key={s.key} color={s.color} value={format(value(s.key))} label={s.label} />
      ))}
      {total && series.length > 1 && <TipRow value={format(series.reduce((n, s) => n + value(s.key), 0))} label="Total" />}
    </div>
  )
}

/** The table twin of a bucketed chart: one row per day, week or month, a column per series. */
export function BucketTable<R extends { date: string; end: string }>({
  bucket,
  rows,
  series,
  format = fmtInt,
  newestFirst = true,
  total = true,
}: {
  bucket: AnalyticsBucket
  rows: R[]
  series: SeriesSpec[]
  format?: (n: number) => string
  newestFirst?: boolean
  total?: boolean
}) {
  const ordered = newestFirst ? [...rows].reverse() : rows
  const value = (row: R, key: string) => {
    const v = (row as unknown as Row)[key]
    return typeof v === 'number' ? v : 0
  }
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th scope="col">{BUCKET_LABEL[bucket]}</th>
          {series.map((s) => (
            <th key={s.key} scope="col" className="num">
              {s.label}
            </th>
          ))}
          {total && series.length > 1 && (
            <th scope="col" className="num">
              Total
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {ordered.map((row) => (
          <tr key={row.date}>
            <th scope="row">{bucketTitle(row, bucket)}</th>
            {series.map((s) => (
              <td key={s.key} className="num">
                {format(value(row, s.key))}
              </td>
            ))}
            {total && series.length > 1 && <td className="num">{format(series.reduce((n, s) => n + value(row, s.key), 0))}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
