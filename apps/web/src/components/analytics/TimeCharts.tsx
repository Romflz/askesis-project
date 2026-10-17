import { type Analytics, TARGET_RETENTION } from '@askesis/core'
import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, Tooltip, XAxis, YAxis } from 'recharts'
import { fmtCompact, fmtInt, fmtMinutes, fmtPct, plural } from '../../lib/format.ts'
import { AXIS, Legend, type SeriesSpec } from '../askesis/charts.tsx'
import {
  BUCKET_LABEL,
  bucketTick,
  bucketTitle,
  BucketTable,
  ChartPanel,
  CURSOR,
  DUE_SERIES,
  fmtDuration,
  fmtSeconds,
  KIND_SERIES,
  MAX_BAR,
  PRIMARY,
  StackTip,
  TipRow,
} from './parts.tsx'

// Charts over time: what's due next, reviews and time spent, retention by
// week, and cards added.

const HEIGHT = 240
/** Room on the right for the last date label, centered on the last bar or point. */
const MARGIN = { top: 5, right: 18, bottom: 0, left: 0 }

function horizonText(days: number): string {
  if (days <= 92) return plural(days, 'day')
  if (days <= 731) return `${Math.round(days / 30.4)} months`
  return `${(days / 365).toFixed(1)} years`
}

export function ForecastPanel({ data }: { data: Analytics }) {
  const f = data.forecast
  const title = (row: Record<string, unknown>) => bucketTitle(row as { date: string; end: string }, f.bucket)
  return (
    <ChartPanel
      id="forecast"
      eyebrow="Future due"
      title="What’s coming up"
      headline={
        <>
          <strong>{fmtInt(f.tomorrow)}</strong> due tomorrow · {fmtInt(Math.round(f.perDay))}/day over the next{' '}
          {horizonText(f.horizon)}
        </>
      }
      legend={<Legend series={DUE_SERIES} />}
      note={
        <>
          {fmtInt(f.dueToday)} due today{f.overdue > 0 && <>, {fmtInt(f.overdue)} of them overdue</>}. Review cards only; learning
          steps come back the same day.
        </>
      }
      empty={f.total === 0 && f.dueToday === 0 && 'Nothing scheduled yet. Study some new cards and their reviews show up here.'}
      table={() => <BucketTable bucket={f.bucket} rows={f.points} series={DUE_SERIES} newestFirst={false} />}
      height={HEIGHT}
    >
      <BarChart data={f.points} responsive style={{ width: '100%', height: HEIGHT }} barCategoryGap="18%" margin={MARGIN}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="date" {...AXIS} tickFormatter={(d: string) => bucketTick(d, f.bucket)} minTickGap={18} />
        <YAxis {...AXIS} width={40} tickFormatter={fmtCompact} allowDecimals={false} />
        <Tooltip cursor={CURSOR} content={(p) => <StackTip tip={p} title={title} series={DUE_SERIES} format={fmtInt} />} />
        {DUE_SERIES.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label}
            stackId="due"
            fill={s.color}
            stroke="var(--surface)"
            strokeWidth={1}
            maxBarSize={MAX_BAR}
            radius={i === DUE_SERIES.length - 1 ? [4, 4, 0, 0] : 0}
            animationDuration={500}
          />
        ))}
      </BarChart>
    </ChartPanel>
  )
}

type Metric = 'count' | 'time'

/** Answers per day, week or month, stacked by card kind, as a count or as time spent. */
export function ReviewsPanel({ data }: { data: Analytics }) {
  const [metric, setMetric] = useState<Metric>('count')
  const k = data.kpis
  const minutes = data.reviews.map((p) => (p.ms.learning + p.ms.relearning + p.ms.young + p.ms.mature) / 60_000)
  // Hours on the axis once a bucket passes three hours, minutes below that.
  const hours = Math.max(0, ...minutes) >= 180
  const scale = (ms: number) => (hours ? ms / 3_600_000 : ms / 60_000)
  const rows = data.reviews.map((p) => ({
    date: p.date,
    end: p.end,
    ...(metric === 'count'
      ? p.count
      : {
          learning: scale(p.ms.learning),
          relearning: scale(p.ms.relearning),
          young: scale(p.ms.young),
          mature: scale(p.ms.mature),
        }),
  }))
  const format = metric === 'count' ? fmtInt : (v: number) => fmtMinutes(hours ? v * 60 : v)
  const tick = metric === 'count' ? fmtCompact : (v: number) => (hours ? `${fmtCompact(v)}h` : `${Math.round(v)}m`)
  const title = (row: Record<string, unknown>) => bucketTitle(row as { date: string; end: string }, data.bucket)

  return (
    <ChartPanel
      id="reviews"
      eyebrow="Reviews"
      title="Every answer, by card kind"
      controls={
        <div className="segmented" role="group" aria-label="Measure">
          {(['count', 'time'] as const).map((m) => (
            <button key={m} type="button" aria-pressed={metric === m} onClick={() => setMetric(m)}>
              {m === 'count' ? 'Count' : 'Time'}
            </button>
          ))}
        </div>
      }
      headline={
        metric === 'count' ? (
          <>
            <strong>{fmtInt(k.reviews)}</strong> reviews · {fmtInt(Math.round(k.reviews / data.span))}/day · studied{' '}
            {fmtInt(k.daysStudied)} of {plural(data.span, 'day')}
          </>
        ) : (
          <>
            <strong>{fmtDuration(k.studyMs)}</strong> studied · {fmtMinutes(k.studyMs / 60_000 / data.span)}/day
            {k.answerMs !== null && <> · {fmtSeconds(k.answerMs)} per answer</>}
          </>
        )
      }
      legend={<Legend series={KIND_SERIES} />}
      empty={k.reviews === 0 && 'No reviews in this range yet.'}
      table={() => (
        <BucketTable
          bucket={data.bucket}
          rows={data.reviews.map((p) => ({ date: p.date, end: p.end, ...(metric === 'count' ? p.count : p.ms) }))}
          series={KIND_SERIES}
          format={metric === 'count' ? fmtInt : (ms) => fmtMinutes(ms / 60_000)}
        />
      )}
      height={HEIGHT}
    >
      <BarChart data={rows} responsive style={{ width: '100%', height: HEIGHT }} barCategoryGap="18%" margin={MARGIN}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="date" {...AXIS} tickFormatter={(d: string) => bucketTick(d, data.bucket)} minTickGap={18} />
        <YAxis {...AXIS} width={40} tickFormatter={tick} allowDecimals={metric === 'time'} />
        <Tooltip cursor={CURSOR} content={(p) => <StackTip tip={p} title={title} series={KIND_SERIES} format={format} />} />
        {KIND_SERIES.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label}
            stackId="reviews"
            fill={s.color}
            stroke="var(--surface)"
            strokeWidth={1}
            maxBarSize={MAX_BAR}
            radius={i === KIND_SERIES.length - 1 ? [4, 4, 0, 0] : 0}
            animationDuration={500}
          />
        ))}
      </BarChart>
    </ChartPanel>
  )
}

/** Fewest answers of a kind (young or mature) for a week's rate to be plotted. */
const MIN_SAMPLE = 20

const RETENTION_SERIES: SeriesSpec[] = [
  { key: 'young', label: 'Young', color: 'var(--c-young)' },
  { key: 'mature', label: 'Mature', color: 'var(--c-mature)' },
]

/** True retention by week or month, with young and mature cards as separate lines. */
export function RetentionPanel({ data }: { data: Analytics }) {
  const k = data.kpis
  const { bucket } = data.retention
  // A handful of answers makes a week's rate noise: those stay in the table, not on the line.
  const points = data.retention.points.map((p) => ({
    ...p,
    young: p.youngReviews >= MIN_SAMPLE ? p.young : null,
    mature: p.matureReviews >= MIN_SAMPLE ? p.mature : null,
  }))
  const values = points.flatMap((p) => [p.young, p.mature].filter((v): v is number => v !== null))
  // Steps of 5 points, or 10 when a rough patch stretches the scale.
  const low = Math.min(0.8, ...values)
  const steps = 1 - low > 0.3 ? 10 : 20
  const floor = Math.floor(low * steps) / steps
  const ticks = Array.from({ length: Math.round((1 - floor) * steps) + 1 }, (_, i) => floor + i / steps)
  const per = bucket === 'month' ? 'month' : 'week'

  return (
    <ChartPanel
      id="retention"
      eyebrow="Retention"
      title={`True retention by ${per}`}
      headline={
        <>
          <strong>{k.retention === null ? '—' : fmtPct(k.retention, 1)}</strong> true retention
          {k.retentionYoung !== null && <> · young {fmtPct(k.retentionYoung, 1)}</>}
          {k.retentionMature !== null && <> · mature {fmtPct(k.retentionMature, 1)}</>}
        </>
      }
      legend={<Legend series={RETENTION_SERIES} shape="line" />}
      note={`Pass rate on review cards: anything but Again counts. Dashed line: the ${fmtPct(TARGET_RETENTION)} target most decks aim for. ${per === 'week' ? 'Weeks' : 'Months'} with under ${MIN_SAMPLE} answers of a kind stay off the line.`}
      empty={k.graded === 0 && 'No reviews of review cards in this range yet.'}
      table={() => (
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">{BUCKET_LABEL[bucket]}</th>
              <th scope="col" className="num">
                Young
              </th>
              <th scope="col" className="num">
                Mature
              </th>
              <th scope="col" className="num">
                All
              </th>
              <th scope="col" className="num">
                Reviews
              </th>
            </tr>
          </thead>
          <tbody>
            {[...data.retention.points].reverse().map((p) => (
              <tr key={p.date}>
                <th scope="row">{bucketTitle(p, bucket)}</th>
                <td className="num">{p.young === null ? '—' : fmtPct(p.young, 1)}</td>
                <td className="num">{p.mature === null ? '—' : fmtPct(p.mature, 1)}</td>
                <td className="num">{p.all === null ? '—' : fmtPct(p.all, 1)}</td>
                <td className="num">{fmtInt(p.youngReviews + p.matureReviews)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      height={HEIGHT}
    >
      <LineChart data={points} responsive style={{ width: '100%', height: HEIGHT }} margin={{ ...MARGIN, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="date" {...AXIS} tickFormatter={(d: string) => bucketTick(d, bucket)} minTickGap={18} />
        <YAxis {...AXIS} width={44} domain={[floor, 1]} ticks={ticks} tickFormatter={(v: number) => fmtPct(v)} />
        <ReferenceLine y={TARGET_RETENTION} stroke="var(--muted)" strokeDasharray="4 4" />
        <Tooltip
          cursor={{ stroke: 'var(--line-strong)', strokeWidth: 1 }}
          content={({ active, payload }) => {
            const p = active ? (payload?.[0]?.payload as (typeof points)[number] | undefined) : undefined
            if (!p) return null
            return (
              <div className="tip">
                <div className="tip__title">{bucketTitle(p, bucket)}</div>
                <TipRow
                  color="var(--c-mature)"
                  value={p.mature === null ? '—' : fmtPct(p.mature, 1)}
                  label={`Mature · ${fmtInt(p.matureReviews)}`}
                />
                <TipRow
                  color="var(--c-young)"
                  value={p.young === null ? '—' : fmtPct(p.young, 1)}
                  label={`Young · ${fmtInt(p.youngReviews)}`}
                />
              </div>
            )
          }}
        />
        {RETENTION_SERIES.map((s) => (
          <Line
            key={s.key}
            dataKey={s.key}
            name={s.label}
            type="monotone"
            stroke={s.color}
            strokeWidth={2}
            dot={points.length <= 16 ? { r: 3, fill: s.color, stroke: 'var(--surface)', strokeWidth: 2 } : false}
            activeDot={{ r: 5, fill: s.color, stroke: 'var(--surface)', strokeWidth: 2 }}
            connectNulls
            animationDuration={600}
          />
        ))}
      </LineChart>
    </ChartPanel>
  )
}

const ADDED_SERIES: SeriesSpec[] = [{ key: 'count', label: 'Added', color: PRIMARY }]

export function AddedPanel({ data }: { data: Analytics }) {
  const { points, total } = data.added
  const title = (row: Record<string, unknown>) => bucketTitle(row as { date: string; end: string }, data.bucket)
  return (
    <ChartPanel
      id="added"
      eyebrow="Added"
      title="Cards added"
      headline={
        <>
          <strong>{fmtInt(total)}</strong> cards added · {fmtInt(Math.round(total / data.span))}/day
        </>
      }
      empty={total === 0 && 'No cards added in this range.'}
      table={() => <BucketTable bucket={data.bucket} rows={points} series={ADDED_SERIES} />}
      height={HEIGHT}
    >
      <BarChart data={points} responsive style={{ width: '100%', height: HEIGHT }} barCategoryGap="18%" margin={MARGIN}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="date" {...AXIS} tickFormatter={(d: string) => bucketTick(d, data.bucket)} minTickGap={18} />
        <YAxis {...AXIS} width={40} tickFormatter={fmtCompact} allowDecimals={false} />
        <Tooltip cursor={CURSOR} content={(p) => <StackTip tip={p} title={title} series={ADDED_SERIES} format={fmtInt} />} />
        <Bar dataKey="count" name="Added" fill={PRIMARY} maxBarSize={MAX_BAR} radius={[4, 4, 0, 0]} animationDuration={500} />
      </BarChart>
    </ChartPanel>
  )
}
