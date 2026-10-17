import type { Collection } from './collection.ts'
import { DECK_PATH_SEPARATOR } from './csv.ts'
import { MATURE_DAYS, retrievability } from './schedule.ts'
import { addDays, dayKey, dayStart, daysBetween, hourOf, weekday } from './time.ts'
import type { AnswerCounts, DeckIcon } from './types.ts'

// The analytics page. A time range and a deck filter (a deck and its subdecks)
// scope every number. Built in one pass over the review log and one over the
// cards, so big collections stay fast.

/** The default leech threshold: a card that lapsed this often is a leech. */
export const LEECH_LAPSES = 8

/** How much time one point on a time chart covers. */
export type AnalyticsBucket = 'day' | 'week' | 'month'

/** Review kinds; a new card's first answers count as learning. */
export type ReviewKind = 'learning' | 'relearning' | 'young' | 'mature'

export type KindCounts = Record<ReviewKind, number>

export interface AnalyticsOptions {
  /** Days of history ending today; null for all of it. */
  days: number | null
  /** Decks to include, each with its subdecks; omit or leave empty for every deck. */
  deckIds?: string[]
}

export interface AnalyticsDeck {
  id: string
  name: string
  /** Full name with its parents, e.g. "Japanese::Kanji". */
  path: string
  parentId: string | null
  depth: number
  icon: DeckIcon
}

/** Pass counts for a success rate: passed of graded (Again fails). */
export interface PassCounts {
  reviews: number
  passed: number
  graded: number
}

export interface AnalyticsKpis {
  reviews: number
  /** Total answer time, ms. */
  studyMs: number
  /** Mean time per answer, ms; answers without a recorded duration are left out. */
  answerMs: number | null
  /** True retention: the pass rate on review cards (young and mature), 0–1. */
  retention: number | null
  retentionYoung: number | null
  retentionMature: number | null
  /** Answers on review cards, the retention sample. */
  graded: number
  /** New cards answered for the first time. */
  learned: number
  daysStudied: number
  /** Consecutive study days up to today (freezes keep it alive), and the best run. */
  streak: number
  longestStreak: number
  /** The same totals over the equally long period just before; null for all time. */
  previous: { reviews: number; studyMs: number; retention: number | null; learned: number } | null
}

export interface ForecastBucket {
  /** First day of the bucket (YYYY-MM-DD) and its last day, inclusive. */
  date: string
  end: string
  young: number
  mature: number
}

export interface AnalyticsForecast {
  bucket: AnalyticsBucket
  /** Days ahead covered, starting tomorrow. */
  horizon: number
  points: ForecastBucket[]
  /** Review and learning cards due before the day rolls over, overdue included. */
  dueToday: number
  /** Review cards whose due day has passed. */
  overdue: number
  tomorrow: number
  total: number
  perDay: number
}

export interface ReviewsBucket {
  date: string
  end: string
  count: KindCounts
  /** Answer time per kind, ms. */
  ms: KindCounts
}

export interface RetentionBucket {
  date: string
  end: string
  young: number | null
  mature: number | null
  all: number | null
  youngReviews: number
  matureReviews: number
}

export interface AddedBucket {
  date: string
  end: string
  count: number
}

export interface HistogramBin {
  label: string
  count: number
}

export interface IntervalBin extends HistogramBin {
  /** Interval in days, inclusive; `max` null for the open-ended last bin. */
  min: number
  max: number | null
  mature: boolean
}

export interface AnalyticsDeckRow extends AnalyticsDeck {
  /** Totals include subdecks. */
  cards: number
  /** Review and learning cards due today, overdue included (before daily limits). */
  due: number
  reviews: number
  ms: number
  retention: number | null
  /** Share of unsuspended cards that are mature, 0–1. */
  mature: number | null
  /** Mean interval of review cards, days. */
  interval: number | null
  lapses: number
}

export interface ToughCard {
  id: string
  deckId: string
  deck: string
  front: string
  lapses: number
  reps: number
  /** Again answers in the range. */
  again: number
  interval: number
  state: 0 | 1 | 2 | 3
  suspended: boolean
  leech: boolean
  /** FSRS recall probability right now, for review cards. */
  recall: number | null
}

export interface Analytics {
  isDemo: boolean
  now: string
  today: string
  /** The range: null days means all time. */
  days: number | null
  from: string
  span: number
  bucket: AnalyticsBucket
  /** Every deck in tree order (for the filter), and the selected one. */
  decks: AnalyticsDeck[]
  deck: string | null
  kpis: AnalyticsKpis
  forecast: AnalyticsForecast
  reviews: ReviewsBucket[]
  retention: { bucket: AnalyticsBucket; points: RetentionBucket[] }
  counts: Record<'new' | 'learning' | 'relearning' | 'young' | 'mature' | 'suspended', number>
  intervals: { bins: IntervalBin[]; mean: number | null; median: number | null; longest: number | null; cards: number }
  /** FSRS difficulty (on a 0–1 scale) when cards have it, SM-2 ease otherwise. */
  difficulty: { mode: 'fsrs' | 'ease' | null; bins: HistogramBin[]; mean: number | null; cards: number }
  recall: { bins: HistogramBin[]; mean: number | null; cards: number }
  hours: (PassCounts & { hour: number })[]
  /** Monday = 0; `days` is how many of that weekday the range holds. */
  weekdays: (PassCounts & { weekday: number; days: number })[]
  answers: Record<'learning' | 'young' | 'mature', AnswerCounts>
  added: { points: AddedBucket[]; total: number }
  deckRows: AnalyticsDeckRow[]
  tough: ToughCard[]
}

const RATING_KEYS = ['again', 'hard', 'good', 'easy'] as const

const INTERVAL_BINS: { label: string; min: number; max: number | null }[] = [
  { label: '1d', min: 0, max: 1 },
  { label: '2d', min: 2, max: 2 },
  { label: '3–4d', min: 3, max: 4 },
  { label: '5–7d', min: 5, max: 7 },
  { label: '1–2w', min: 8, max: 14 },
  { label: '15–20d', min: 15, max: 20 },
  { label: '3w–1m', min: MATURE_DAYS, max: 30 },
  { label: '1–2m', min: 31, max: 60 },
  { label: '2–3m', min: 61, max: 90 },
  { label: '3–6m', min: 91, max: 182 },
  { label: '6m–1y', min: 183, max: 365 },
  { label: '1–2y', min: 366, max: 730 },
  { label: '2y+', min: 731, max: null },
]

/** Lower edges of the ease histogram's bins, in percent; the last bin is open-ended. */
const EASE_EDGES = [130, 150, 170, 190, 210, 230, 250, 270, 290, 310]

const kinds = (): KindCounts => ({ learning: 0, relearning: 0, young: 0, mature: 0 })
const answerCounts = (): AnswerCounts => ({ again: 0, hard: 0, good: 0, easy: 0 })
const rate = (passed: number, graded: number) => (graded ? passed / graded : null)

/** Every number on the analytics page for a time range and deck filter, as of `col.now`. */
export function buildAnalytics(col: Collection, opts: AnalyticsOptions, isDemo = false): Analytics {
  const { now, day: cfg } = col
  const nowMs = now.getTime()
  const today = dayKey(now, cfg)
  const todayStart = dayStart(today, cfg).getTime()
  const dayEnd = dayStart(addDays(today, 1), cfg).getTime()

  // ── Deck tree (parents before children) and the filter's scope ──
  const deckById = new Map(col.decks.map((d) => [d.id, d]))
  const kids = new Map<string, string[]>()
  const roots: string[] = []
  for (const d of col.decks) {
    if (d.parentId && d.parentId !== d.id && deckById.has(d.parentId)) push(kids, d.parentId, d.id)
    else roots.push(d.id)
  }
  const decks: AnalyticsDeck[] = []
  const placed = new Set<string>()
  const walk = (id: string, depth: number, parentPath: string | null) => {
    if (placed.has(id)) return
    placed.add(id)
    const d = deckById.get(id)!
    const path = parentPath ? `${parentPath}${DECK_PATH_SEPARATOR}${d.name}` : d.name
    decks.push({ id, name: d.name, path, parentId: d.parentId, depth, icon: d.icon })
    for (const k of kids.get(id) ?? []) walk(k, depth + 1, path)
  }
  for (const id of roots) walk(id, 0, null)
  // Decks caught in a corrupt parent cycle have no root; list them rather than drop them.
  for (const d of col.decks) walk(d.id, 0, null)

  const subtrees = new Map<string, string[]>()
  const subtree = (id: string): string[] => {
    let out = subtrees.get(id)
    if (out) return out
    out = []
    const seen = new Set<string>()
    const stack = [id]
    while (stack.length) {
      const next = stack.pop()!
      if (seen.has(next)) continue
      seen.add(next)
      out.push(next)
      stack.push(...(kids.get(next) ?? []))
    }
    subtrees.set(id, out)
    return out
  }
  const selected = (opts.deckIds ?? []).filter((id) => deckById.has(id))
  const scope = selected.length ? new Set(selected.flatMap(subtree)) : null
  const inScope = (deckId: string) => !scope || scope.has(deckId)

  // ── Range: N days ending today, or everything since the first review or added card ──
  const firstLog = col.logs.find((l) => inScope(l.deckId))
  let from = today
  if (opts.days) from = addDays(today, -(Math.max(1, Math.round(opts.days)) - 1))
  else {
    let earliest = firstLog?.t ?? nowMs
    for (const c of col.cards)
      if (c.createdAt !== undefined && c.createdAt < earliest && inScope(c.deckId)) earliest = c.createdAt
    from = dayKey(earliest, cfg)
  }
  const span = daysBetween(from, today) + 1
  const bucket = bucketFor(span)
  const startMs = dayStart(from, cfg).getTime()
  const prevStartMs = opts.days ? dayStart(addDays(from, -span), cfg).getTime() : null

  const reviewSlots = slots(from, today, bucket)
  const reviews: ReviewsBucket[] = reviewSlots.list.map((s) => ({ ...s, count: kinds(), ms: kinds() }))
  const retBucket: AnalyticsBucket = bucket === 'month' ? 'month' : 'week'
  const retSlots = slots(from, today, retBucket)
  // yp/yn: young answers passed and given; mp/mn: the same for mature cards.
  const ret = retSlots.list.map(() => ({ yp: 0, yn: 0, mp: 0, mn: 0 }))
  const added: AddedBucket[] = reviewSlots.list.map((s) => ({ ...s, count: 0 }))

  // ── Review log: one pass, oldest first ──
  // The log stores relearning as learning; a learning answer on a card that has
  // already been a review card is relearning (a reset to new starts it over).
  const graduated = new Set<string>()
  const studyDays = new Set<string>()
  const rangeDays = new Set<string>()
  const hours = Array.from({ length: 24 }, (_, hour) => ({ hour, reviews: 0, passed: 0, graded: 0 }))
  const weekdays = Array.from({ length: 7 }, (_, wd) => ({ weekday: wd, reviews: 0, passed: 0, graded: 0, days: 0 }))
  const answers = { learning: answerCounts(), young: answerCounts(), mature: answerCounts() }
  const logsByDeck = new Map<string, { reviews: number; ms: number; passed: number; graded: number }>()
  const againByCard = new Map<string, number>()
  // KPI totals for the range, and for the equally long period before it.
  const k = { reviews: 0, ms: 0, timed: 0, timedMs: 0, yp: 0, yn: 0, mp: 0, mn: 0, learned: 0 }
  const prev = { reviews: 0, ms: 0, passed: 0, graded: 0, learned: 0 }
  // Bucket lookups per study day, computed once per day rather than per answer.
  const dayInfo = new Map<string, { slot: number; ret: number; weekday: number }>()

  for (const l of col.logs) {
    // Classify before the scope check: whether a card has graduated depends on
    // its whole history, not just the filtered part.
    let kind: ReviewKind
    if (l.kind === 'young' || l.kind === 'mature') {
      graduated.add(l.cardId)
      kind = l.kind
    } else if (l.kind === 'new') {
      graduated.delete(l.cardId)
      kind = 'learning'
    } else kind = graduated.has(l.cardId) ? 'relearning' : 'learning'

    if (scope && !scope.has(l.deckId)) continue
    const key = dayKey(l.t, cfg)
    studyDays.add(key)
    const graded = l.kind === 'young' || l.kind === 'mature'
    const passed = graded && l.rating > 1

    if (l.t < startMs) {
      if (prevStartMs !== null && l.t >= prevStartMs) {
        prev.reviews += 1
        prev.ms += l.ms
        if (graded) prev.graded += 1
        if (passed) prev.passed += 1
        if (l.kind === 'new') prev.learned += 1
      }
      continue
    }

    rangeDays.add(key)
    k.reviews += 1
    k.ms += l.ms
    // A duration of 0 means it wasn't recorded (e.g. imported history).
    if (l.ms > 0) {
      k.timed += 1
      k.timedMs += l.ms
    }
    if (l.kind === 'new') k.learned += 1
    if (l.kind === 'young') {
      k.yn += 1
      if (passed) k.yp += 1
    } else if (l.kind === 'mature') {
      k.mn += 1
      if (passed) k.mp += 1
    }

    let day = dayInfo.get(key)
    if (!day) {
      day = {
        slot: reviewSlots.index.get(bucketOf(key, bucket))!,
        ret: retSlots.index.get(bucketOf(key, retBucket))!,
        weekday: weekday(key),
      }
      dayInfo.set(key, day)
    }
    const slot = reviews[day.slot]
    if (slot) {
      slot.count[kind] += 1
      slot.ms[kind] += l.ms
    }
    const r = ret[day.ret]
    if (r && l.kind === 'young') {
      r.yn += 1
      if (passed) r.yp += 1
    } else if (r && l.kind === 'mature') {
      r.mn += 1
      if (passed) r.mp += 1
    }

    const h = hours[hourOf(l.t, cfg)]!
    const w = weekdays[day.weekday]!
    for (const agg of [h, w]) {
      agg.reviews += 1
      if (graded) agg.graded += 1
      if (passed) agg.passed += 1
    }
    answers[kind === 'young' || kind === 'mature' ? kind : 'learning'][RATING_KEYS[l.rating - 1]!] += 1

    const d = logsByDeck.get(l.deckId) ?? { reviews: 0, ms: 0, passed: 0, graded: 0 }
    d.reviews += 1
    d.ms += l.ms
    if (graded) d.graded += 1
    if (passed) d.passed += 1
    logsByDeck.set(l.deckId, d)
    if (l.rating === 1) againByCard.set(l.cardId, (againByCard.get(l.cardId) ?? 0) + 1)
  }

  for (let key = from; key <= today; key = addDays(key, 1)) weekdays[weekday(key)]!.days += 1

  // Streak over the filtered history, the way the dashboard counts it.
  const freezes = new Set(col.freezes)
  let streak = 0
  let longest = 0
  if (firstLog) {
    for (let key = dayKey(firstLog.t, cfg); key <= today; key = addDays(key, 1)) {
      if (studyDays.has(key)) streak += 1
      else if (!freezes.has(key) && key !== today) streak = 0
      longest = Math.max(longest, streak)
    }
  }

  // ── Cards: one pass ──
  const counts = { new: 0, learning: 0, relearning: 0, young: 0, mature: 0, suspended: 0 }
  const dueByDay = new Map<string, { young: number; mature: number }>()
  let maxDue = today
  let dueToday = 0
  let overdue = 0
  const intervalBins: IntervalBin[] = INTERVAL_BINS.map((b) => ({ ...b, count: 0, mature: b.min >= MATURE_DAYS }))
  const intervals: number[] = []
  const fsrsBins = Array.from({ length: 10 }, (_, i) => ({ label: `${i * 10}–${i * 10 + 10}%`, count: 0 }))
  const easeBins = EASE_EDGES.map((lo, i) => ({
    label: i === EASE_EDGES.length - 1 ? `${lo}%+` : `${lo}–${EASE_EDGES[i + 1]}%`,
    count: 0,
  }))
  let fsrsN = 0
  let fsrsSum = 0
  let easeN = 0
  let easeSum = 0
  const recallBins = [
    { label: '<50%', count: 0 },
    ...Array.from({ length: 10 }, (_, i) => ({ label: `${50 + i * 5}–${55 + i * 5}%`, count: 0 })),
  ]
  let recallN = 0
  let recallSum = 0
  // Totals per deck for its own cards; subdecks are added in per row below.
  const own = new Map<
    string,
    { cards: number; live: number; mature: number; ivSum: number; ivN: number; lapses: number; due: number }
  >()
  // Cards that have lapsed at least once: the candidates for the toughest-cards list.
  const lapsed: { card: Collection['cards'][number]; again: number }[] = []

  for (const c of col.cards) {
    if (!inScope(c.deckId)) continue
    const m = c.memory
    const o = own.get(c.deckId) ?? { cards: 0, live: 0, mature: 0, ivSum: 0, ivN: 0, lapses: 0, due: 0 }
    own.set(c.deckId, o)
    o.cards += 1
    o.lapses += m.lapses
    if (m.lapses > 0) lapsed.push({ card: c, again: againByCard.get(c.id) ?? 0 })
    if (c.createdAt !== undefined && c.createdAt >= startMs) {
      // A card stamped a moment after `now` (by the database clock) still counts as today's.
      const slot = added[reviewSlots.index.get(bucketOf(dayKey(Math.min(c.createdAt, nowMs), cfg), bucket))!]
      if (slot) slot.count += 1
    }
    if (c.suspended) {
      counts.suspended += 1
      continue
    }
    o.live += 1
    const due = m.due.getTime()
    if (m.state === 0) counts.new += 1
    else if (m.state === 1) counts.learning += 1
    else if (m.state === 3) counts.relearning += 1
    else if (m.interval >= MATURE_DAYS) counts.mature += 1
    else counts.young += 1

    if (m.state !== 0 && due < dayEnd) {
      dueToday += 1
      o.due += 1
    }
    if (m.state !== 0 && m.stability > 0) {
      fsrsN += 1
      // FSRS difficulty runs from 1 to 10; it's shown as 0–100%.
      const d = Math.min(1, Math.max(0, (m.difficulty - 1) / 9))
      fsrsSum += d
      fsrsBins[Math.min(9, Math.floor(d * 10))]!.count += 1
    }
    if (m.state !== 0 && m.ease > 0) {
      easeN += 1
      easeSum += m.ease
      const pct = m.ease * 100
      // The last bin whose lower edge is at or below the ease (the first bin also takes anything lower).
      let i = EASE_EDGES.length - 1
      while (i > 0 && pct < EASE_EDGES[i]!) i -= 1
      easeBins[i]!.count += 1
    }
    if (m.state !== 2) continue

    // Review cards: intervals, recall, the forecast.
    if (m.interval >= MATURE_DAYS) o.mature += 1
    o.ivSum += m.interval
    o.ivN += 1
    intervals.push(m.interval)
    intervalBins[INTERVAL_BINS.findIndex((b) => b.max === null || m.interval <= b.max)]!.count += 1
    const r = retrievability(m, now)
    recallN += 1
    recallSum += r
    // Bin 0 holds everything under 50%; then 5-point bins up to 100%.
    recallBins[r < 0.5 ? 0 : Math.min(10, 1 + Math.floor((r - 0.5) / 0.05))]!.count += 1
    if (due < todayStart) overdue += 1
    const key = dayKey(due, cfg)
    if (key > maxDue) maxDue = key
    const f = dueByDay.get(key) ?? { young: 0, mature: 0 }
    if (m.interval >= MATURE_DAYS) f.mature += 1
    else f.young += 1
    dueByDay.set(key, f)
  }

  // ── Future due: as far ahead as the range looks back (all time: up to the last due card) ──
  const horizon = opts.days ? span : Math.min(3650, Math.max(30, daysBetween(today, maxDue)))
  const tomorrowKey = addDays(today, 1)
  const fBucket = bucketFor(horizon)
  const fSlots = slots(tomorrowKey, addDays(today, horizon), fBucket)
  const forecastPoints: ForecastBucket[] = fSlots.list.map((s) => ({ ...s, young: 0, mature: 0 }))
  let forecastTotal = 0
  for (const [key, f] of dueByDay) {
    if (key < tomorrowKey) continue
    const slot = forecastPoints[fSlots.index.get(bucketOf(key, fBucket))!]
    if (!slot || key > slot.end) continue
    slot.young += f.young
    slot.mature += f.mature
    forecastTotal += f.young + f.mature
  }
  const tomorrow = dueByDay.get(tomorrowKey)

  // ── Intervals, difficulty ──
  intervals.sort((a, b) => a - b)
  const median =
    intervals.length === 0
      ? null
      : intervals.length % 2
        ? intervals[(intervals.length - 1) / 2]!
        : (intervals[intervals.length / 2 - 1]! + intervals[intervals.length / 2]!) / 2
  // FSRS cards carry a difficulty; SM-2 cards only an ease. Show whichever most cards have.
  const mode = fsrsN > 0 && fsrsN >= easeN ? 'fsrs' : easeN > 0 ? 'ease' : null

  // ── Per deck (with subdecks) ──
  const deckRows: AnalyticsDeckRow[] = decks
    .filter((d) => inScope(d.id))
    .map((d) => {
      const row = { cards: 0, live: 0, mature: 0, ivSum: 0, ivN: 0, lapses: 0, due: 0, reviews: 0, ms: 0, passed: 0, graded: 0 }
      for (const id of subtree(d.id)) {
        const o = own.get(id)
        if (o) {
          row.cards += o.cards
          row.live += o.live
          row.mature += o.mature
          row.ivSum += o.ivSum
          row.ivN += o.ivN
          row.lapses += o.lapses
          row.due += o.due
        }
        const l = logsByDeck.get(id)
        if (l) {
          row.reviews += l.reviews
          row.ms += l.ms
          row.passed += l.passed
          row.graded += l.graded
        }
      }
      return {
        ...d,
        cards: row.cards,
        due: row.due,
        reviews: row.reviews,
        ms: row.ms,
        retention: rate(row.passed, row.graded),
        mature: row.live ? row.mature / row.live : null,
        interval: row.ivN ? row.ivSum / row.ivN : null,
        lapses: row.lapses,
      }
    })

  // ── Toughest cards: most lapses, then most Agains lately ──
  const pathById = new Map(decks.map((d) => [d.id, d.path]))
  const tough: ToughCard[] = lapsed
    .sort((a, b) => b.card.memory.lapses - a.card.memory.lapses || b.again - a.again || b.card.memory.reps - a.card.memory.reps)
    .slice(0, 10)
    .map(({ card: c, again }) => ({
      id: c.id,
      deckId: c.deckId,
      deck: pathById.get(c.deckId) ?? '',
      front: c.content.front.slice(0, 240),
      lapses: c.memory.lapses,
      reps: c.memory.reps,
      again,
      interval: c.memory.interval,
      state: c.memory.state,
      suspended: c.suspended,
      leech: c.memory.lapses >= LEECH_LAPSES,
      recall: c.memory.state === 2 ? retrievability(c.memory, now) : null,
    }))

  return {
    isDemo,
    now: now.toISOString(),
    today,
    days: opts.days,
    from,
    span,
    bucket,
    decks,
    deck: selected[0] ?? null,
    kpis: {
      reviews: k.reviews,
      studyMs: k.ms,
      answerMs: k.timed ? k.timedMs / k.timed : null,
      retention: rate(k.yp + k.mp, k.yn + k.mn),
      retentionYoung: rate(k.yp, k.yn),
      retentionMature: rate(k.mp, k.mn),
      graded: k.yn + k.mn,
      learned: k.learned,
      daysStudied: rangeDays.size,
      streak,
      longestStreak: longest,
      previous:
        prevStartMs === null
          ? null
          : { reviews: prev.reviews, studyMs: prev.ms, retention: rate(prev.passed, prev.graded), learned: prev.learned },
    },
    forecast: {
      bucket: fBucket,
      horizon,
      points: forecastPoints,
      dueToday,
      overdue,
      tomorrow: tomorrow ? tomorrow.young + tomorrow.mature : 0,
      total: forecastTotal,
      perDay: forecastTotal / horizon,
    },
    reviews,
    retention: {
      bucket: retBucket,
      points: retSlots.list.map((s, i) => {
        const r = ret[i]!
        return {
          ...s,
          young: rate(r.yp, r.yn),
          mature: rate(r.mp, r.mn),
          all: rate(r.yp + r.mp, r.yn + r.mn),
          youngReviews: r.yn,
          matureReviews: r.mn,
        }
      }),
    },
    counts,
    intervals: {
      bins: intervalBins,
      mean: intervals.length ? intervals.reduce((a, b) => a + b, 0) / intervals.length : null,
      median,
      longest: intervals.at(-1) ?? null,
      cards: intervals.length,
    },
    difficulty: {
      mode,
      bins: mode === 'fsrs' ? fsrsBins : mode === 'ease' ? easeBins : [],
      mean: mode === 'fsrs' ? fsrsSum / fsrsN : mode === 'ease' ? easeSum / easeN : null,
      cards: mode === 'fsrs' ? fsrsN : mode === 'ease' ? easeN : 0,
    },
    recall: { bins: recallBins, mean: recallN ? recallSum / recallN : null, cards: recallN },
    hours,
    weekdays,
    answers,
    added: { points: added, total: added.reduce((n, a) => n + a.count, 0) },
    deckRows,
    tough,
  }
}

/** Days per point: daily up to three months, weekly up to two years, monthly beyond. */
function bucketFor(span: number): AnalyticsBucket {
  return span <= 92 ? 'day' : span <= 731 ? 'week' : 'month'
}

/** The bucket a day key falls in, keyed by its first day (weeks start on Monday). */
function bucketOf(key: string, bucket: AnalyticsBucket): string {
  if (bucket === 'day') return key
  if (bucket === 'week') return addDays(key, -weekday(key))
  return `${key.slice(0, 7)}-01`
}

/** The first day of the following bucket. */
function nextBucket(key: string, bucket: AnalyticsBucket): string {
  if (bucket === 'day') return addDays(key, 1)
  if (bucket === 'week') return addDays(key, 7)
  const [y, m] = key.split('-').map(Number) as [number, number]
  return m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`
}

/** Buckets covering [from, to], clamped to it, with a lookup by bucket key. */
function slots(from: string, to: string, bucket: AnalyticsBucket) {
  const list: { date: string; end: string }[] = []
  const index = new Map<string, number>()
  for (let key = bucketOf(from, bucket); key <= to; key = nextBucket(key, bucket)) {
    const end = addDays(nextBucket(key, bucket), -1)
    index.set(key, list.length)
    list.push({ date: key < from ? from : key, end: end > to ? to : end })
  }
  return { list, index }
}

function push<K, V>(map: Map<K, V[]>, key: K, value: V) {
  const list = map.get(key)
  if (list) list.push(value)
  else map.set(key, [value])
}
