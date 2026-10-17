import { Scale } from 'lucide-react'
import { CartesianGrid, ReferenceLine, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts'
import { type CollectionCounts, TARGET_RETENTION, RATINGS } from '@askesis/core'
import { fmtHour, fmtInt, fmtPct } from '../../lib/format.ts'
import { AXIS } from './charts.tsx'
import { useSession } from './session.tsx'
import { PanelHeader } from './ui.tsx'

/** In RATINGS order: Again, Hard, Good, Easy. */
const RATING_COLORS = ['var(--c-again)', 'var(--c-hard)', 'var(--c-good)', 'var(--c-easy)']

/** How often each answer button was pressed over the last 30 days. */
export function AnswerBreakdown() {
  const { data } = useSession()
  const total = Object.values(data.answers).reduce((a, b) => a + b, 0)
  const pass = total ? 1 - data.answers.again / total : 0

  return (
    <section className="panel answers" aria-labelledby="answers-title">
      <PanelHeader
        eyebrow="Answers · 30 days"
        title={
          <span id="answers-title" className="stat-title">
            {total ? (
              <>
                {fmtPct(pass, 1)} <span>answered correctly</span>
              </>
            ) : (
              <span>No answers yet</span>
            )}
          </span>
        }
      />
      <ul className="answers__list">
        {RATINGS.map(({ key, label }, i) => {
          const n = data.answers[key]
          const share = total ? n / total : 0
          return (
            <li key={key} className="answer-row">
              <span className="answer-row__label">
                <span className="dot" style={{ '--dot': RATING_COLORS[i] } as React.CSSProperties} />
                {label}
              </span>
              <span className="answer-row__track">
                <span className="answer-row__fill" style={{ width: `${share * 100}%`, background: RATING_COLORS[i] }} />
              </span>
              <span className="answer-row__pct tabular">{fmtPct(share, 1)}</span>
              <span className="answer-row__n tabular">{fmtInt(n)}</span>
            </li>
          )
        })}
      </ul>
      <p className="stat-note">
        <Scale size={14} />
        Hard, Good and Easy earn the same XP. Grade honestly and the scheduler does the rest.
      </p>
    </section>
  )
}

const STATES: { key: keyof CollectionCounts; label: string; color: string }[] = [
  { key: 'new', label: 'New', color: 'var(--c-new)' },
  { key: 'learning', label: 'Learning', color: 'var(--c-learn)' },
  { key: 'young', label: 'Young', color: 'var(--c-young)' },
  { key: 'mature', label: 'Mature', color: 'var(--c-mature)' },
  { key: 'suspended', label: 'Suspended', color: 'var(--c-suspended)' },
]

/** Cards by state as one stacked bar, plus the average recall across review cards. */
export function CollectionCard() {
  const { data } = useSession()
  const total = Object.values(data.collection).reduce((a, b) => a + b, 0)

  return (
    <section className="panel collection" aria-labelledby="collection-title">
      <PanelHeader
        eyebrow="Collection"
        title={
          <span id="collection-title" className="stat-title">
            {fmtInt(total)} <span>cards</span>
          </span>
        }
      />
      <div
        className="collection__bar"
        role="img"
        aria-label={STATES.map((s) => `${s.label}: ${fmtInt(data.collection[s.key])}`).join(', ')}
      >
        {STATES.filter((s) => data.collection[s.key] > 0).map((s) => (
          <span
            key={s.key}
            className="collection__segment"
            style={{ flexGrow: data.collection[s.key], background: s.color }}
            title={`${s.label}: ${fmtInt(data.collection[s.key])}`}
          />
        ))}
      </div>
      <ul className="collection__legend">
        {STATES.map((s) => (
          <li key={s.key}>
            <span className="collection__swatch" style={{ background: s.color }} />
            <span className="collection__label">{s.label}</span>
            <span className="collection__count tabular">{fmtInt(data.collection[s.key])}</span>
            <span className="collection__pct tabular">{total ? fmtPct(data.collection[s.key] / total) : '—'}</span>
          </li>
        ))}
      </ul>
      <div className="collection__recall">
        <span className="eyebrow">Average recall right now</span>
        <span className="collection__recall-value">
          {data.collection.young + data.collection.mature ? fmtPct(data.recall, 1) : '—'}
        </span>
        <span className="stat-note stat-note--inline">FSRS retrievability across review cards</span>
      </div>
    </section>
  )
}

interface HourDot {
  hour: number
  retention: number
  reviews: number
  best: boolean
}

/** Recall by hour of the day over 90 days, with the sharpest hour highlighted. */
export function BestHourChart() {
  const { data } = useSession()
  // Hours with only a handful of reviews are noise; require a real share of the volume.
  const volume = data.hours.reduce((n, h) => n + h.reviews, 0)
  const minReviews = Math.max(50, volume * 0.03)
  const points = data.hours.filter((h) => h.retention !== null && h.reviews >= minReviews) as HourDot[]
  const best = points.reduce<HourDot | null>((b, p) => (!b || p.retention > b.retention ? p : b), null)
  const dots = points.map((p) => ({ ...p, best: p.hour === best?.hour }))
  // The y axis starts at the 5% step below the lowest dot (85% at most) and ticks every 5%.
  const floor = Math.floor(Math.min(0.85, ...dots.map((d) => d.retention)) * 20) / 20
  const ticks = Array.from({ length: Math.round((1 - floor) * 20) + 1 }, (_, i) => floor + i * 0.05)

  return (
    <section className="panel best-hour" aria-labelledby="best-hour-title">
      <PanelHeader
        eyebrow="Sharpest hour · 90 days"
        title={
          <span id="best-hour-title" className="stat-title">
            {best ? (
              <>
                {fmtHour(best.hour)} <span>· {fmtPct(best.retention, 1)} recall</span>
              </>
            ) : (
              'Not enough data yet'
            )}
          </span>
        }
      />
      <div className="best-hour__chart">
        <ScatterChart responsive style={{ width: '100%', height: '100%' }} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis type="number" dataKey="hour" domain={[0, 23]} ticks={[0, 6, 12, 18, 23]} tickFormatter={fmtHour} {...AXIS} />
          <YAxis
            type="number"
            dataKey="retention"
            domain={[floor, 1]}
            ticks={ticks}
            tickFormatter={(v: number) => fmtPct(v)}
            width={44}
            {...AXIS}
          />
          <ZAxis type="number" dataKey="reviews" range={[40, 360]} />
          <ReferenceLine y={TARGET_RETENTION} stroke="var(--muted)" strokeDasharray="4 4" />
          <Tooltip
            cursor={false}
            content={({ active, payload }) => {
              const p = active ? (payload?.[0]?.payload as HourDot | undefined) : undefined
              if (!p) return null
              return (
                <div className="tip">
                  <div className="tip__title">
                    {fmtHour(p.hour)} – {fmtHour((p.hour + 1) % 24)}
                  </div>
                  <div className="tip__row">
                    <span className="tip__value">{fmtPct(p.retention, 1)}</span>
                    <span className="tip__label">recall</span>
                  </div>
                  <div className="tip__row">
                    <span className="tip__value">{fmtInt(p.reviews)}</span>
                    <span className="tip__label">reviews</span>
                  </div>
                </div>
              )
            }}
          />
          <Scatter
            data={dots}
            animationDuration={600}
            shape={(props: { cx?: number; cy?: number; size?: number; payload?: HourDot }) => {
              const r = Math.sqrt((props.size ?? 64) / Math.PI)
              const isBest = props.payload?.best
              return (
                <circle
                  cx={props.cx}
                  cy={props.cy}
                  r={r}
                  fill={isBest ? 'var(--accent-ink)' : 'var(--c-new)'}
                  fillOpacity={isBest ? 1 : 0.55}
                  stroke="var(--surface)"
                  strokeWidth={2}
                />
              )
            }}
          />
        </ScatterChart>
      </div>
      <p className="stat-note">
        Dot size shows how many reviews you do at that hour. Dashed line: your {fmtPct(TARGET_RETENTION)} target.
      </p>
    </section>
  )
}
