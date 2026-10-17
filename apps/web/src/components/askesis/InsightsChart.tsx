import { Link } from '@tanstack/react-router'
import { ArrowRight, ChartColumn, Table2 } from 'lucide-react'
import { useId, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
  type XAxisTickContentProps,
} from 'recharts'
import { addDays, TARGET_RETENTION, formatDay } from '@askesis/core'
import { fmtCompact, fmtInt, fmtPct } from '../../lib/format.ts'
import { PHONE_QUERY, useMediaQuery } from '../../lib/media.ts'
import { AXIS, ChartTip, EdgeTick, Legend, type SeriesSpec } from './charts.tsx'
import { useSession } from './session.tsx'
import { PanelHeader } from './ui.tsx'

type Tab = 'forecast' | 'reviews' | 'retention'

const TABS: { id: Tab; label: string }[] = [
  { id: 'forecast', label: 'Forecast' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'retention', label: 'Retention' },
]

const FORECAST: SeriesSpec[] = [
  { key: 'young', label: 'Young', color: 'var(--c-young)' },
  { key: 'mature', label: 'Mature', color: 'var(--c-mature)' },
]

const REVIEWS: SeriesSpec[] = [
  { key: 'learning', label: 'Learning', color: 'var(--c-learn)' },
  { key: 'young', label: 'Young', color: 'var(--c-young)' },
  { key: 'mature', label: 'Mature', color: 'var(--c-mature)' },
]

const RETENTION: SeriesSpec[] = [{ key: 'retention', label: 'True retention', color: 'var(--accent-ink)' }]

const shortDay = (key: string) => formatDay(key, { month: 'short', day: 'numeric' })

/** First, middle and last keys: the only x labels on a phone-width chart. */
const edgeTicks = (keys: string[]) =>
  [...new Set([keys[0], keys[Math.floor((keys.length - 1) / 2)], keys.at(-1)])].filter((k): k is string => k !== undefined)

/** Forecast, recent reviews and weekly retention in one tabbed panel, each with a table view. */
export function InsightsChart() {
  const { data } = useSession()
  const [tab, setTab] = useState<Tab>('forecast')
  const [asTable, setAsTable] = useState(false)
  const panelId = useId()
  // Phones drop the y-axis numbers for width (the tooltip, headline and a dashed
  // average line carry the scale) and keep three date labels instead of five.
  const phone = useMediaQuery(PHONE_QUERY)

  // Today's bar follows the inline session: answers since the snapshot are counted as learning.
  const reviews = data.reviews.map((r) => {
    if (r.date !== data.today) return r
    const sessionAnswers = data.todayStats.reviews - (r.learning + r.young + r.mature)
    return { ...r, learning: r.learning + sessionAnswers }
  })
  const forecastAvg = data.forecast.reduce((n, d) => n + d.young + d.mature, 0) / data.forecast.length
  const tomorrow = data.forecast[0] ? data.forecast[0].young + data.forecast[0].mature : 0
  const reviewTotal = reviews.reduce((n, d) => n + d.learning + d.young + d.mature, 0)
  const recent = data.retention.slice(-4)
  const recentGraded = recent.reduce((n, w) => n + w.reviews, 0)
  const recentRetention = recentGraded ? recent.reduce((n, w) => n + (w.retention ?? 0) * w.reviews, 0) / recentGraded : null
  const retentionValues = data.retention.flatMap((w) => (w.retention === null ? [] : [w.retention]))
  const retentionFloor = Math.floor(Math.min(0.85, ...retentionValues) * 20) / 20

  // The second half of each headline drops to its own line on phones.
  const sub = (text: string) => (
    <span className="insights__sub">
      <span className="insights__sep"> · </span>
      {text}
    </span>
  )
  const headline = {
    forecast: (
      <>
        <strong>{fmtInt(tomorrow)}</strong> due tomorrow{sub(`${fmtInt(Math.round(forecastAvg))}/day over the next 30 days`)}
      </>
    ),
    reviews: (
      <>
        <strong>{fmtInt(reviewTotal)}</strong> reviews in 30 days{sub(`${fmtInt(Math.round(reviewTotal / 30))}/day`)}
      </>
    ),
    retention: (
      <>
        <strong>{recentRetention === null ? '—' : fmtPct(recentRetention, 1)}</strong> true retention over 4 weeks
        {sub(`target ${fmtPct(TARGET_RETENTION)}`)}
      </>
    ),
  }[tab]

  // X-axis and phone-only extras shared by the two bar charts.
  const dayAxis = (keys: string[]) =>
    phone
      ? {
          ticks: edgeTicks(keys),
          interval: 0 as const,
          tick: (p: XAxisTickContentProps) => <EdgeTick {...p} format={shortDay} />,
        }
      : { tickFormatter: shortDay, interval: 6 }
  const averageLine = (perDay: number) =>
    phone && perDay > 0 ? (
      <ReferenceLine y={perDay} stroke="var(--muted)" strokeDasharray="4 4" ifOverflow="extendDomain" />
    ) : null

  return (
    <section className="panel insights" id="insights" aria-labelledby="insights-title">
      <PanelHeader
        eyebrow="Insights"
        title={<span id="insights-title">How your memory is doing</span>}
        aside={
          <>
            {/* The full analytics page. Phones get a full-width link under the chart instead. */}
            <Link to="/analytics" className="btn btn--ghost btn--sm insights__all">
              All stats
              <ArrowRight size={15} aria-hidden />
            </Link>
            <button
              type="button"
              className="icon-btn"
              onClick={() => setAsTable((v) => !v)}
              aria-pressed={asTable}
              aria-label={asTable ? 'Show as chart' : 'Show as table'}
              title={asTable ? 'Show as chart' : 'Show as table'}
            >
              {asTable ? <ChartColumn size={17} /> : <Table2 size={17} />}
            </button>
          </>
        }
      />

      <div className="insights__bar">
        <div className="segmented" role="tablist" aria-label="Insight">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              aria-controls={panelId}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {tab !== 'retention' && (
          <Legend series={tab === 'forecast' ? FORECAST : REVIEWS}>
            {/* Keys the dashed average line, which only phones draw. */}
            {!asTable && (tab === 'forecast' ? forecastAvg : reviewTotal) > 0 && (
              <li className="chart-legend__avg">
                <span className="chart-legend__swatch chart-legend__swatch--dash" />
                Avg/day
              </li>
            )}
          </Legend>
        )}
      </div>

      <p className="insights__headline">{headline}</p>

      <div id={panelId} role="tabpanel" className="insights__panel">
        {asTable ? (
          <DataTable tab={tab} reviews={reviews} />
        ) : tab === 'forecast' ? (
          <BarChart data={data.forecast} responsive className="insights__chart" barCategoryGap="22%">
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" {...AXIS} {...dayAxis(data.forecast.map((d) => d.date))} />
            <YAxis {...AXIS} width={36} tickFormatter={fmtCompact} allowDecimals={false} hide={phone} />
            <Tooltip
              cursor={{ fill: 'var(--surface-2)' }}
              content={(p) => (
                <ChartTip
                  tip={p}
                  title={(l) => formatDay(l, { weekday: 'short', month: 'short', day: 'numeric' })}
                  series={FORECAST}
                  format={fmtInt}
                />
              )}
            />
            {FORECAST.map((s, i) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.label}
                stackId="due"
                fill={s.color}
                stroke="var(--surface)"
                strokeWidth={1}
                maxBarSize={18}
                radius={i === FORECAST.length - 1 ? [4, 4, 0, 0] : 0}
                animationDuration={600}
              />
            ))}
            {averageLine(forecastAvg)}
          </BarChart>
        ) : tab === 'reviews' ? (
          <BarChart data={reviews} responsive className="insights__chart" barCategoryGap="22%">
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" {...AXIS} {...dayAxis(reviews.map((d) => d.date))} />
            <YAxis {...AXIS} width={36} tickFormatter={fmtCompact} allowDecimals={false} hide={phone} />
            <Tooltip
              cursor={{ fill: 'var(--surface-2)' }}
              content={(p) => (
                <ChartTip
                  tip={p}
                  title={(l) => formatDay(l, { weekday: 'short', month: 'short', day: 'numeric' })}
                  series={REVIEWS}
                  format={fmtInt}
                />
              )}
            />
            {REVIEWS.map((s, i) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.label}
                stackId="reviews"
                fill={s.color}
                stroke="var(--surface)"
                strokeWidth={1}
                maxBarSize={18}
                radius={i === REVIEWS.length - 1 ? [4, 4, 0, 0] : 0}
                animationDuration={600}
              />
            ))}
            {averageLine(reviewTotal / 30)}
          </BarChart>
        ) : (
          <LineChart data={data.retention} responsive className="insights__chart">
            <CartesianGrid vertical={false} />
            {phone ? (
              <XAxis
                dataKey="week"
                {...AXIS}
                ticks={edgeTicks(data.retention.map((w) => w.week))}
                interval={0}
                tick={(p: XAxisTickContentProps) => <EdgeTick {...p} format={shortDay} />}
              />
            ) : (
              <XAxis dataKey="week" {...AXIS} tickFormatter={shortDay} interval={4} />
            )}
            <YAxis
              {...AXIS}
              width={44}
              domain={[retentionFloor, 1]}
              tickFormatter={(v: number) => fmtPct(v)}
              tickCount={5}
              hide={phone}
            />
            <ReferenceLine
              y={TARGET_RETENTION}
              stroke="var(--muted)"
              strokeDasharray="4 4"
              label={{ value: `Target ${fmtPct(TARGET_RETENTION)}`, position: 'insideBottomRight', className: 'chart-ref-label' }}
            />
            <Tooltip
              cursor={{ stroke: 'var(--line-strong)', strokeWidth: 1 }}
              content={(p) => (
                <ChartTip
                  tip={p}
                  title={(l) => `Week of ${formatDay(l, { month: 'short', day: 'numeric' })}`}
                  series={RETENTION}
                  format={(v) => fmtPct(v, 1)}
                />
              )}
            />
            <Line
              dataKey="retention"
              name="True retention"
              type="monotone"
              stroke="var(--accent-ink)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: 'var(--accent-ink)', stroke: 'var(--surface)', strokeWidth: 2 }}
              connectNulls
              animationDuration={700}
            />
          </LineChart>
        )}
      </div>

      <Link to="/analytics" className="btn btn--ghost btn--sm insights__more">
        See all stats
        <ArrowRight size={15} aria-hidden />
      </Link>
    </section>
  )
}

/** The table view of the current tab: past days and weeks newest first, the forecast soonest first. */
function DataTable({ tab, reviews }: { tab: Tab; reviews: { date: string; learning: number; young: number; mature: number }[] }) {
  const { data } = useSession()
  if (tab === 'retention') {
    return (
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Week</th>
              <th scope="col" className="num">
                Retention
              </th>
              <th scope="col" className="num">
                Reviews
              </th>
            </tr>
          </thead>
          <tbody>
            {[...data.retention].reverse().map((w) => (
              <tr key={w.week}>
                <th scope="row">
                  {shortDay(w.week)} – {shortDay(addDays(w.week, 6))}
                </th>
                <td className="num">{w.retention === null ? '—' : fmtPct(w.retention, 1)}</td>
                <td className="num">{fmtInt(w.reviews)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  const rows = tab === 'forecast' ? data.forecast : [...reviews].reverse()
  const series = tab === 'forecast' ? FORECAST : REVIEWS
  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col">Day</th>
            {series.map((s) => (
              <th key={s.key} scope="col" className="num">
                {s.label}
              </th>
            ))}
            <th scope="col" className="num">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const row = r as unknown as Record<string, number> & { date: string }
            return (
              <tr key={row.date}>
                <th scope="row">{formatDay(row.date, { weekday: 'short', month: 'short', day: 'numeric' })}</th>
                {series.map((s) => (
                  <td key={s.key} className="num">
                    {fmtInt(row[s.key]!)}
                  </td>
                ))}
                <td className="num">{fmtInt(series.reduce((n, s) => n + row[s.key]!, 0))}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
