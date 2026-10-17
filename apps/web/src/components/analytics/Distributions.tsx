import type { Analytics, HistogramBin, IntervalBin } from '@askesis/core'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts'
import { fmtCompact, fmtInt, fmtPct } from '../../lib/format.ts'
import { AXIS, Legend, type SeriesSpec } from '../askesis/charts.tsx'
import { ChartPanel, CURSOR, DUE_SERIES, fmtDays, MAX_BAR, PRIMARY, TipRow } from './parts.tsx'

// Where the collection stands right now: card states, intervals, difficulty
// and FSRS recall. These follow the deck filter; the time range doesn't apply.

const HEIGHT = 220

type CountKey = keyof Analytics['counts']

const STATES: (SeriesSpec & { key: CountKey; hint: string })[] = [
  { key: 'new', label: 'New', color: 'var(--c-new)', hint: 'Not studied yet' },
  { key: 'learning', label: 'Learning', color: 'var(--c-learn)', hint: 'In their first steps' },
  { key: 'relearning', label: 'Relearning', color: 'var(--c-relearn)', hint: 'Forgotten, back in steps' },
  { key: 'young', label: 'Young', color: 'var(--c-young)', hint: 'Interval under 21 days' },
  { key: 'mature', label: 'Mature', color: 'var(--c-mature)', hint: 'Interval of 21 days or more' },
  { key: 'suspended', label: 'Suspended', color: 'var(--c-suspended)', hint: 'Left out of study' },
]

export function CountsPanel({ data }: { data: Analytics }) {
  const total = STATES.reduce((n, s) => n + data.counts[s.key], 0)
  const slices = STATES.map((s) => ({ ...s, value: data.counts[s.key] })).filter((s) => s.value > 0)
  const share = (n: number) => (total ? fmtPct(n / total, 1) : '—')
  const table = () => (
    <table className="data-table">
      <thead>
        <tr>
          <th scope="col">State</th>
          <th scope="col" className="num">
            Cards
          </th>
          <th scope="col" className="num">
            Share
          </th>
        </tr>
      </thead>
      <tbody>
        {STATES.map((s) => (
          <tr key={s.key}>
            <th scope="row">{s.label}</th>
            <td className="num">{fmtInt(data.counts[s.key])}</td>
            <td className="num">{share(data.counts[s.key])}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )

  return (
    <ChartPanel
      id="counts"
      eyebrow="Card counts"
      title={
        <span className="stat-title">
          {fmtInt(total)} <span>cards</span>
        </span>
      }
      empty={total === 0 && 'No cards here yet.'}
      table={table}
      height={HEIGHT}
    >
      <div className="counts">
        <div className="counts__donut">
          <PieChart width={176} height={176}>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="label"
              innerRadius={58}
              outerRadius={86}
              startAngle={90}
              endAngle={-270}
              stroke="var(--surface)"
              strokeWidth={2}
              animationDuration={600}
            >
              {slices.map((s) => (
                <Cell key={s.key} fill={s.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                const s = active ? (payload?.[0]?.payload as (typeof slices)[number] | undefined) : undefined
                if (!s) return null
                return (
                  <div className="tip">
                    <div className="tip__title">{s.label}</div>
                    <TipRow color={s.color} value={fmtInt(s.value)} label={`cards · ${share(s.value)}`} />
                  </div>
                )
              }}
            />
          </PieChart>
          <div className="counts__center" aria-hidden>
            <span className="counts__center-value">{total ? fmtPct((data.counts.young + data.counts.mature) / total) : '—'}</span>
            <span className="counts__center-label">in review</span>
          </div>
        </div>
        <ul className="counts__legend">
          {STATES.map((s) => (
            <li key={s.key} title={s.hint}>
              <span className="collection__swatch" style={{ background: s.color }} />
              <span className="collection__label">{s.label}</span>
              <span className="collection__count tabular">{fmtInt(data.counts[s.key])}</span>
              <span className="collection__pct tabular">{share(data.counts[s.key])}</span>
            </li>
          ))}
        </ul>
      </div>
    </ChartPanel>
  )
}

/** A histogram of cards: one bar per bin, value and share in the tooltip and table. */
function Histogram<T extends HistogramBin>({
  bins,
  color,
  title,
}: {
  bins: T[]
  color: (bin: T) => string
  title: (bin: T) => string
}) {
  const total = bins.reduce((n, b) => n + b.count, 0)
  return (
    <BarChart data={bins} responsive style={{ width: '100%', height: HEIGHT }} barCategoryGap="14%">
      <CartesianGrid vertical={false} />
      <XAxis dataKey="label" {...AXIS} minTickGap={10} />
      <YAxis {...AXIS} width={40} tickFormatter={fmtCompact} allowDecimals={false} />
      <Tooltip
        cursor={CURSOR}
        content={({ active, payload }) => {
          const bin = active ? (payload?.[0]?.payload as T | undefined) : undefined
          if (!bin) return null
          return (
            <div className="tip">
              <div className="tip__title">{title(bin)}</div>
              <TipRow
                color={color(bin)}
                value={fmtInt(bin.count)}
                label={`cards · ${total ? fmtPct(bin.count / total, 1) : '—'}`}
              />
            </div>
          )
        }}
      />
      <Bar dataKey="count" name="Cards" maxBarSize={MAX_BAR} radius={[4, 4, 0, 0]} animationDuration={500}>
        {bins.map((b) => (
          <Cell key={b.label} fill={color(b)} />
        ))}
      </Bar>
    </BarChart>
  )
}

function HistogramTable<T extends HistogramBin>({ bins, head, label }: { bins: T[]; head: string; label: (bin: T) => string }) {
  const total = bins.reduce((n, b) => n + b.count, 0)
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th scope="col">{head}</th>
          <th scope="col" className="num">
            Cards
          </th>
          <th scope="col" className="num">
            Share
          </th>
        </tr>
      </thead>
      <tbody>
        {bins.map((b) => (
          <tr key={b.label}>
            <th scope="row">{label(b)}</th>
            <td className="num">{fmtInt(b.count)}</td>
            <td className="num">{total ? fmtPct(b.count / total, 1) : '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const intervalRange = (b: IntervalBin) =>
  b.max === null
    ? `${fmtInt(b.min)}+ days`
    : b.min === b.max || b.max === 1
      ? `${b.max} ${b.max === 1 ? 'day' : 'days'}`
      : `${b.min}–${b.max} days`

export function IntervalsPanel({ data }: { data: Analytics }) {
  const iv = data.intervals
  return (
    <ChartPanel
      id="intervals"
      eyebrow="Review intervals"
      title="How far apart reviews are"
      headline={
        iv.mean !== null && (
          <>
            <strong>{fmtDays(iv.mean)}</strong> average · median {fmtDays(iv.median!)} · longest {fmtDays(iv.longest!)}
          </>
        )
      }
      legend={<Legend series={DUE_SERIES} />}
      empty={iv.cards === 0 && 'No review cards yet.'}
      table={() => <HistogramTable bins={iv.bins} head="Interval" label={intervalRange} />}
      height={HEIGHT}
    >
      <Histogram bins={iv.bins} color={(b) => (b.mature ? 'var(--c-mature)' : 'var(--c-young)')} title={intervalRange} />
    </ChartPanel>
  )
}

/** FSRS difficulty, or SM-2 ease when most of the reviewed cards are scheduled with SM-2. */
export function DifficultyPanel({ data }: { data: Analytics }) {
  const d = data.difficulty
  const fsrs = d.mode === 'fsrs'
  return (
    <ChartPanel
      id="difficulty"
      eyebrow={fsrs ? 'Difficulty · FSRS' : d.mode === 'ease' ? 'Ease · SM-2' : 'Difficulty'}
      title={d.mode === 'ease' ? 'How fast intervals grow' : 'How hard your cards are'}
      headline={
        d.mean !== null && (
          <>
            <strong>{fsrs ? fmtPct(d.mean) : `${Math.round(d.mean * 100)}%`}</strong> average {fsrs ? 'difficulty' : 'ease'} ·{' '}
            {fmtInt(d.cards)} cards
          </>
        )
      }
      note={
        fsrs
          ? 'FSRS rates each card from 0% (easy) to 100% (hard) by how you answer it. The far right is worth rewriting or splitting.'
          : 'Each Good multiplies the interval by the card’s ease. Again and Hard lower it, Easy raises it.'
      }
      empty={d.mode === null && 'No reviewed cards yet.'}
      table={() => <HistogramTable bins={d.bins} head={fsrs ? 'Difficulty' : 'Ease'} label={(b) => b.label} />}
      height={HEIGHT}
    >
      <Histogram bins={d.bins} color={() => PRIMARY} title={(b) => `${fsrs ? 'Difficulty' : 'Ease'} ${b.label}`} />
    </ChartPanel>
  )
}

export function RecallPanel({ data }: { data: Analytics }) {
  const r = data.recall
  return (
    <ChartPanel
      id="recall"
      eyebrow="Retrievability"
      title="Recall if asked right now"
      headline={
        r.mean !== null && (
          <>
            <strong>{fmtPct(r.mean, 1)}</strong> average · {fmtInt(r.cards)} review cards
          </>
        )
      }
      note="FSRS’s estimate of the chance you’d remember each review card if it came up now. It dips as cards near their due date."
      empty={r.cards === 0 && 'No review cards yet.'}
      table={() => <HistogramTable bins={r.bins} head="Recall" label={(b) => b.label} />}
      height={HEIGHT}
    >
      <Histogram bins={r.bins} color={() => PRIMARY} title={(b) => `Recall ${b.label}`} />
    </ChartPanel>
  )
}
