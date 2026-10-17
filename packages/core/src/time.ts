// Study days. A day key is a calendar date (`YYYY-MM-DD`) in the learner's time
// zone, shifted by the rollover hour (4 AM by default) so a late-night session
// still counts toward the day it started in.
//
// Keys are plain dates, so arithmetic on them (addDays, weekday, formatting) is
// done in UTC and never depends on the machine's time zone.

export const HOUR_MS = 3_600_000
export const DAY_MS = 86_400_000

/** Where a learner's study days fall: an IANA time zone and the local hour a new day starts. */
export interface DayConfig {
  timeZone: string
  rolloverHour: number
}

/** Day settings in this machine's time zone. */
export function localDayConfig(rolloverHour = 4): DayConfig {
  return { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, rolloverHour }
}

// ── Time-zone offsets (cached per hour; they only change at DST boundaries) ───

const formatters = new Map<string, Intl.DateTimeFormat>()
const offsets = new Map<string, number>()

/**
 * A time zone's UTC offset at an instant, in ms. Intl has no direct offset API,
 * so this formats the instant as wall-clock fields and compares them with UTC.
 */
function offsetMs(t: number, timeZone: string): number {
  const bucket = `${timeZone}:${Math.floor(t / HOUR_MS)}`
  const cached = offsets.get(bucket)
  if (cached !== undefined) return cached

  let fmt = formatters.get(timeZone)
  if (!fmt) {
    fmt = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    })
    formatters.set(timeZone, fmt)
  }
  const p: Record<string, number> = {}
  for (const part of fmt.formatToParts(new Date(t))) p[part.type] = Number(part.value)
  // `% 24` because some engines print midnight as hour 24 even with h23. The
  // formatter drops seconds, so compare at minute precision.
  const asUtc = Date.UTC(p.year!, p.month! - 1, p.day!, p.hour! % 24, p.minute!)
  const offset = asUtc - Math.floor(t / 60_000) * 60_000
  // Keeps a long-running server's cache bounded.
  if (offsets.size > 50_000) offsets.clear()
  offsets.set(bucket, offset)
  return offset
}

/** Wall-clock fields of an instant in a time zone, read via getUTC* on the result. */
function wallClock(t: number, timeZone: string): Date {
  return new Date(t + offsetMs(t, timeZone))
}

/**
 * The instant a wall-clock time occurs in a time zone. The first guess uses the
 * offset at the naive UTC time; one correction with the offset at that guess
 * gets it right when a DST change falls in between.
 */
function fromWallClock(y: number, m: number, d: number, h: number, timeZone: string): Date {
  const guess = Date.UTC(y, m - 1, d, h)
  let t = guess - offsetMs(guess, timeZone)
  const corrected = guess - offsetMs(t, timeZone)
  if (corrected !== t) t = corrected
  return new Date(t)
}

// ── Keys ──────────────────────────────────────────────────────────────────────

function keyOf(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parts(key: string): [number, number, number] {
  const [y, m, d] = key.split('-').map(Number)
  return [y!, m!, d!]
}

/** The study day an instant belongs to. */
export function dayKey(date: Date | number, cfg: DayConfig): string {
  const t = typeof date === 'number' ? date : date.getTime()
  return keyOf(wallClock(t - cfg.rolloverHour * HOUR_MS, cfg.timeZone))
}

/** Local hour (0–23) of an instant. */
export function hourOf(date: Date | number, cfg: DayConfig): number {
  const t = typeof date === 'number' ? date : date.getTime()
  return wallClock(t, cfg.timeZone).getUTCHours()
}

/** When a study day begins (its rollover hour, in the learner's time zone). */
export function dayStart(key: string, cfg: DayConfig): Date {
  const [y, m, d] = parts(key)
  return fromWallClock(y, m, d, cfg.rolloverHour, cfg.timeZone)
}

/** The day key `n` days later (earlier when negative). */
export function addDays(key: string, n: number): string {
  const [y, m, d] = parts(key)
  return keyOf(new Date(Date.UTC(y, m - 1, d + n)))
}

/** Whole days from `a` to `b`; negative when `b` comes first. */
export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = parts(a)
  const [by, bm, bd] = parts(b)
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / DAY_MS)
}

/** Monday = 0 … Sunday = 6. */
export function weekday(key: string): number {
  const [y, m, d] = parts(key)
  return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7
}

/** Formats a day key; the same output on server and client. */
export function formatDay(key: string, options: Intl.DateTimeFormatOptions): string {
  const [y, m, d] = parts(key)
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString('en-US', { ...options, timeZone: 'UTC' })
}
