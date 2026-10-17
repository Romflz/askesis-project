import { type Analytics, RATINGS, TARGET_RETENTION } from '@askesis/core'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, Tooltip, XAxis, YAxis } from 'recharts'
import { fmtCompact, fmtHour, fmtInt, fmtPct } from '../../lib/format.ts'
import { AXIS, Legend } from '../askesis/charts.tsx'
import { ChartPanel, CURSOR, MAX_BAR, PRIMARY, RATING_SERIES, TipRow } from './parts.tsx'

// Study patterns: when you review and how well, and how you grade.

/** Below this many review-card answers a slot's success rate is noise, so it isn't plotted. */
const MIN_GRADED = 10

interface Slot {
  key: number
  label: string
  title: string
  /** Bars: reviews (hours) or reviews per day (weekdays). */
  value: number
  reviews: number
  rate: number | null
}

/**
 * Two charts on one x-axis: volume as bars on top, success rate as a line
 * below (each with its own scale; never two y-axes on one plot). Hovering
 * either shows both.
 */
function VolumeAndRate({ id, slots, valueLabel, ticks }: { id: string; slots: Slot[]; valueLabel: string; ticks?: number[] }) {
  const rates = slots.flatMap((s) => (s.rate === null ? [] : [s.rate]))
  // The rate axis starts at the 10% step below the lowest rate, 80% at most.
  const low = Math.min(0.8, ...rates)
  const floor = Math.floor(low * 10) / 10
  // One tooltip for both charts; syncId keeps them on the same slot.
  const tip = ({ active, payload }: { active?: boolean; payload?: readonly { payload?: unknown }[] }) => {
    const s = active ? (payload?.[0]?.payload as Slot | undefined) : undefined
    if (!s) return null
    return (
      <div className="tip">
        <div className="tip__title">{s.title}</div>
        <TipRow color={PRIMARY} value={fmtInt(Math.round(s.value))} label={valueLabel} />
        <TipRow color="var(--accent-ink)" value={s.rate === null ? '—' : fmtPct(s.rate, 1)} label="success rate" />
      </div>
    )
  }
  const xTick = (key: number) => slots[key]?.label ?? ''
  return (
    <div className="pattern">
      <BarChart
        data={slots}
        syncId={id}
        responsive
        style={{ width: '100%', height: 150 }}
        margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
        barCategoryGap="16%"
      >
        <CartesianGrid vertical={false} />
        <XAxis dataKey="key" hide />
        <YAxis {...AXIS} width={44} tickFormatter={fmtCompact} allowDecimals={false} tickCount={4} />
        <Tooltip cursor={CURSOR} content={tip} />
        <Bar
          dataKey="value"
          name={valueLabel}
          fill={PRIMARY}
          maxBarSize={MAX_BAR}
          radius={[4, 4, 0, 0]}
          animationDuration={500}
        />
      </BarChart>
      <p className="pattern__label">Success rate</p>
      <LineChart
        data={slots}
        syncId={id}
        responsive
        style={{ width: '100%', height: 120 }}
        margin={{ top: 6, right: 8, bottom: 0, left: 0 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis dataKey="key" scale="band" {...AXIS} tickFormatter={xTick} ticks={ticks} interval={0} />
        <YAxis {...AXIS} width={44} domain={[floor, 1]} tickCount={3} tickFormatter={(v: number) => fmtPct(v)} />
        <ReferenceLine y={TARGET_RETENTION} stroke="var(--muted)" strokeDasharray="4 4" />
        <Tooltip cursor={{ stroke: 'var(--line-strong)', strokeWidth: 1 }} content={tip} />
        <Line
          dataKey="rate"
          name="Success rate"
          type="monotone"
          stroke="var(--accent-ink)"
          strokeWidth={2}
          dot={{ r: slots.length <= 7 ? 4 : 3, fill: 'var(--accent-ink)', stroke: 'var(--surface)', strokeWidth: 2 }}
          activeDot={{ r: 5, fill: 'var(--accent-ink)', stroke: 'var(--surface)', strokeWidth: 2 }}
          // Hours or weekdays with too few answers stay gaps rather than a made-up curve.
          connectNulls={false}
          animationDuration={600}
        />
      </LineChart>
    </div>
  )
}

function SlotTable({ slots, head, valueLabel }: { slots: Slot[]; head: string; valueLabel: string }) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th scope="col">{head}</th>
          <th scope="col" className="num">
            {valueLabel}
          </th>
          <th scope="col" className="num">
            Success rate
          </th>
        </tr>
      </thead>
      <tbody>
        {slots.map((s) => (
          <tr key={s.key}>
            <th scope="row">{s.title}</th>
            <td className="num">{fmtInt(Math.round(s.value))}</td>
            <td className="num">{s.rate === null ? '—' : fmtPct(s.rate, 1)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** The slot with the best success rate among those with a real share of the volume. */
function sharpest(slots: Slot[]): Slot | null {
  const volume = slots.reduce((n, s) => n + s.reviews, 0)
  const floor = Math.max(30, volume * 0.03)
  return slots.reduce<Slot | null>(
    (best, s) => (s.rate !== null && s.reviews >= floor && (!best || s.rate > best.rate!) ? s : best),
    null,
  )
}

/** Reviews and success rate by hour of the day. */
export function HoursPanel({ data }: { data: Analytics }) {
  const slots: Slot[] = data.hours.map((h) => ({
    key: h.hour,
    label: fmtHour(h.hour),
    title: `${fmtHour(h.hour)} – ${fmtHour((h.hour + 1) % 24)}`,
    value: h.reviews,
    reviews: h.reviews,
    rate: h.graded >= MIN_GRADED ? h.passed / h.graded : null,
  }))
  const total = slots.reduce((n, s) => n + s.reviews, 0)
  const busiest = slots.reduce((b, s) => (s.reviews > b.reviews ? s : b), slots[0]!)
  const best = sharpest(slots)
  return (
    <ChartPanel
      id="hours"
      eyebrow="Hourly breakdown"
      title="When in the day you study"
      headline={
        total > 0 && (
          <>
            Busiest at <strong>{busiest.label}</strong> · {fmtPct(busiest.reviews / total)} of reviews
            {best && (
              <>
                {' '}
                · sharpest at {best.label} ({fmtPct(best.rate!, 1)})
              </>
            )}
          </>
        )
      }
      note={`Bars: reviews started in each hour. Line: pass rate on review cards; dashed at ${fmtPct(TARGET_RETENTION)}.`}
      empty={total === 0 && 'No reviews in this range yet.'}
      table={() => <SlotTable slots={slots} head="Hour" valueLabel="Reviews" />}
      height={290}
    >
      <VolumeAndRate id="hours" slots={slots} valueLabel="reviews" ticks={[0, 6, 12, 18]} />
    </ChartPanel>
  )
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

/** Average reviews a day and success rate by weekday. */
export function WeekdaysPanel({ data }: { data: Analytics }) {
  const slots: Slot[] = data.weekdays.map((w) => ({
    key: w.weekday,
    label: WEEKDAYS[w.weekday]!.slice(0, 3),
    title: WEEKDAYS[w.weekday]!,
    value: w.days ? w.reviews / w.days : 0,
    reviews: w.reviews,
    rate: w.graded >= MIN_GRADED ? w.passed / w.graded : null,
  }))
  const total = slots.reduce((n, s) => n + s.reviews, 0)
  const busiest = slots.reduce((b, s) => (s.value > b.value ? s : b), slots[0]!)
  const best = sharpest(slots)
  return (
    <ChartPanel
      id="weekdays"
      eyebrow="Weekdays"
      title="Your week"
      headline={
        total > 0 && (
          <>
            <strong>{busiest.title}s</strong> are busiest · {fmtInt(Math.round(busiest.value))} reviews a day
            {best && <> · sharpest on {best.title}s</>}
          </>
        )
      }
      note="Bars: average reviews on that weekday across the range. Line: pass rate on review cards."
      empty={total === 0 && 'No reviews in this range yet.'}
      table={() => <SlotTable slots={slots} head="Day" valueLabel="Reviews per day" />}
      height={290}
    >
      <VolumeAndRate id="weekdays" slots={slots} valueLabel="reviews per day" />
    </ChartPanel>
  )
}

const KIND_ROWS = [
  { key: 'learning', label: 'Learning' },
  { key: 'young', label: 'Young' },
  { key: 'mature', label: 'Mature' },
] as const

/** The share of each answer button, by card kind (learning, young, mature). */
export function AnswersPanel({ data }: { data: Analytics }) {
  const rows = KIND_ROWS.map(({ key, label }) => {
    const c = data.answers[key]
    const n = c.again + c.hard + c.good + c.easy
    const share = (v: number) => (n ? v / n : 0)
    return { key, label, n, counts: c, again: share(c.again), hard: share(c.hard), good: share(c.good), easy: share(c.easy) }
  })
  const total = rows.reduce((n, r) => n + r.n, 0)
  const again = rows.reduce((n, r) => n + r.counts.again, 0)

  return (
    <ChartPanel
      id="answers"
      eyebrow="Answer buttons"
      title="How you grade, by card kind"
      headline={
        total > 0 && (
          <>
            <strong>{fmtPct(1 - again / total, 1)}</strong> answered correctly · {fmtInt(total)} answers
          </>
        )
      }
      legend={<Legend series={RATING_SERIES} />}
      empty={total === 0 && 'No answers in this range yet.'}
      table={() => (
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Kind</th>
              {RATINGS.map((r) => (
                <th key={r.key} scope="col" className="num">
                  {r.label}
                </th>
              ))}
              <th scope="col" className="num">
                Correct
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key}>
                <th scope="row">{r.label}</th>
                {RATINGS.map(({ key }) => (
                  <td key={key} className="num">
                    {fmtInt(r.counts[key])}
                  </td>
                ))}
                <td className="num">{r.n ? fmtPct(1 - r.again, 1) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      height={200}
    >
      <BarChart
        layout="vertical"
        data={rows}
        responsive
        style={{ width: '100%', height: 150 }}
        barCategoryGap="30%"
        margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
      >
        <XAxis type="number" domain={[0, 1]} hide />
        <YAxis type="category" dataKey="label" {...AXIS} width={72} />
        <Tooltip
          cursor={CURSOR}
          content={({ active, payload }) => {
            const r = active ? (payload?.[0]?.payload as (typeof rows)[number] | undefined) : undefined
            if (!r) return null
            return (
              <div className="tip">
                <div className="tip__title">
                  {r.label} · {fmtInt(r.n)} answers
                </div>
                {[...RATING_SERIES].reverse().map((s) => (
                  <TipRow
                    key={s.key}
                    color={s.color}
                    value={fmtPct(r[s.key as 'again'], 1)}
                    label={`${s.label} · ${fmtInt(r.counts[s.key as 'again'])}`}
                  />
                ))}
              </div>
            )
          }}
        />
        {RATING_SERIES.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label}
            stackId="answers"
            fill={s.color}
            stroke="var(--surface)"
            strokeWidth={1}
            maxBarSize={22}
            radius={i === RATING_SERIES.length - 1 ? [0, 4, 4, 0] : 0}
            animationDuration={500}
          />
        ))}
      </BarChart>
      <dl className="answers-split">
        {rows.map((r) => (
          <div key={r.key}>
            <dt>{r.label}</dt>
            <dd>
              {r.n ? fmtPct(1 - r.again, 1) : '—'} <span>correct · {fmtInt(r.n)}</span>
            </dd>
          </div>
        ))}
      </dl>
    </ChartPanel>
  )
}
