import type { TooltipContentProps, XAxisTickContentProps } from 'recharts'

// Shared pieces for Recharts charts. Axis, grid and tick styling lives in
// styles/home/_charts.scss so charts follow the theme without props.

/** One series in a chart: its data key, legend label and color (usually a CSS variable). */
export interface SeriesSpec {
  key: string
  label: string
  color: string
}

/** Props spread onto every XAxis and YAxis: labels only, no tick marks or axis lines. */
export const AXIS = {
  tickLine: false,
  axisLine: false,
  tickMargin: 8,
} as const

/**
 * An X-axis label for sparse axes on narrow charts: the first label starts at
 * its tick and the last one ends at it, so neither runs off the chart's edge.
 */
export function EdgeTick({
  x,
  y,
  payload,
  index,
  visibleTicksCount,
  format,
}: XAxisTickContentProps & { format: (v: string) => string }) {
  const anchor = index === 0 ? 'start' : index === visibleTicksCount - 1 ? 'end' : 'middle'
  return (
    <text x={x} y={y} dy="0.71em" textAnchor={anchor} className="recharts-cartesian-axis-tick-value">
      {format(String(payload.value))}
    </text>
  )
}

/**
 * Tooltip body: one row per series, value first and name second, keyed with a
 * short line. Rows run in reverse so they match a stacked chart (top first).
 */
export function ChartTip({
  tip,
  title,
  series,
  format,
}: {
  tip: Pick<TooltipContentProps, 'active' | 'payload' | 'label'>
  title: (label: string) => string
  series: SeriesSpec[]
  format: (n: number) => string
}) {
  const { active, payload, label } = tip
  if (!active || !payload?.length) return null
  const row = payload[0]!.payload as Record<string, number>
  return (
    <div className="tip">
      <div className="tip__title">{title(String(label))}</div>
      {[...series].reverse().map((s) => (
        <div key={s.key} className="tip__row">
          <span className="tip__key" style={{ '--key': s.color } as React.CSSProperties} />
          <span className="tip__value">{row[s.key] == null ? '—' : format(row[s.key]!)}</span>
          <span className="tip__label">{s.label}</span>
        </div>
      ))}
    </div>
  )
}

/** Chart key. `children` are extra `<li>` entries for marks that aren't series (a reference line). */
export function Legend({
  series,
  shape = 'rect',
  children,
}: {
  series: SeriesSpec[]
  shape?: 'rect' | 'line'
  children?: React.ReactNode
}) {
  return (
    <ul className="chart-legend">
      {series.map((s) => (
        <li key={s.key}>
          <span
            className={`chart-legend__swatch chart-legend__swatch--${shape}`}
            style={{ '--key': s.color } as React.CSSProperties}
          />
          {s.label}
        </li>
      ))}
      {children}
    </ul>
  )
}
