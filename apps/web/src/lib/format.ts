const int = new Intl.NumberFormat('en-US')
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })

export const fmtInt = (n: number) => int.format(n)
/** 1234 → "1.2K". */
export const fmtCompact = (n: number) => compact.format(n)
/** A 0–1 fraction as a percentage: 0.912 → "91%". */
export const fmtPct = (x: number, digits = 0) => `${(x * 100).toFixed(digits)}%`

/** An hour of the day, 0–23: 0 → "12 AM", 13 → "1 PM". */
export function fmtHour(hour: number): string {
  const h = hour % 12 === 0 ? 12 : hour % 12
  return `${h} ${hour < 12 ? 'AM' : 'PM'}`
}

/** A duration: "45 min", "1 h 20 min". Anything under a minute shows as "1 min", never "0 min". */
export function fmtMinutes(minutes: number): string {
  // Round the total first, so 119.6 minutes reads "2 h", not "1 h 60 min".
  const total = Math.max(1, Math.round(minutes))
  if (total < 60) return `${total} min`
  const h = Math.floor(total / 60)
  const m = total % 60
  return m ? `${h} h ${m} min` : `${h} h`
}

/** "1 card", "1,234 cards"; pass `many` for irregular plurals. */
export function plural(n: number, one: string, many = `${one}s`): string {
  return `${fmtInt(n)} ${n === 1 ? one : many}`
}
