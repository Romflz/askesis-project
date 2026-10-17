import type { DeckPresetInput } from '@askesis/contracts'
import { default_w, fsrs, forgetting_curve, type Card, type FSRS, type Grade, type Steps } from 'ts-fsrs'
import { DAY_MS } from './time.ts'
import type { CardKind, CardState, Rating } from './types.ts'

// Card scheduling, driven by a deck preset.
//
// - SM-2 mode follows the publicly documented SM-2 deck options (learning
//   steps, graduating/easy intervals, ease, hard/easy multipliers, interval
//   modifier, lapse "new interval"). It is written from that documented
//   behavior; no code from other apps is used.
// - FSRS mode uses ts-fsrs (MIT), the reference FSRS implementation.

/** The threshold between young and mature cards. */
export const MATURE_DAYS = 21

/** A card's scheduling state. Works for both algorithms. */
export interface Memory {
  /** ts-fsrs's State: 0 new, 1 learning, 2 review, 3 relearning. */
  state: 0 | 1 | 2 | 3
  due: Date
  /** Scheduled interval in days (0 while learning a new card). */
  interval: number
  /** SM-2 ease factor, e.g. 2.5 = 250%. 0 until the card first graduates. */
  ease: number
  /** FSRS memory state; 0 when unknown. */
  stability: number
  difficulty: number
  /** Index into the learning or relearning steps. */
  step: number
  reps: number
  lapses: number
  lastReview: Date | null
}

/** The deck preset fields the scheduler reads. */
export type SchedulerPreset = Pick<
  DeckPresetInput,
  | 'learningSteps'
  | 'graduatingInterval'
  | 'easyInterval'
  | 'relearningSteps'
  | 'minimumInterval'
  | 'maximumInterval'
  | 'startingEase'
  | 'easyBonus'
  | 'intervalModifier'
  | 'hardInterval'
  | 'newInterval'
  | 'fsrs'
  | 'desiredRetention'
>

/** The four answer buttons, in order. */
export const RATINGS: { rating: Rating; label: string; key: 'again' | 'hard' | 'good' | 'easy' }[] = [
  { rating: 1, label: 'Again', key: 'again' },
  { rating: 2, label: 'Hard', key: 'hard' },
  { rating: 3, label: 'Good', key: 'good' },
  { rating: 4, label: 'Easy', key: 'easy' },
]

/** A card that has never been studied. */
export function newMemory(due: Date): Memory {
  return { state: 0, due, interval: 0, ease: 0, stability: 0, difficulty: 0, step: 0, reps: 0, lapses: 0, lastReview: null }
}

/** A card's bucket (new, learning, young or mature); relearning cards count as learning. */
export function cardKind(m: Memory): CardKind {
  if (m.state === 0) return 'new'
  if (m.state === 1 || m.state === 3) return 'learning'
  return m.interval >= MATURE_DAYS ? 'mature' : 'young'
}

/** In the learning or relearning steps. */
export function isLearning(m: Memory): boolean {
  return m.state === 1 || m.state === 3
}

export function isMature(m: Memory): boolean {
  return m.state === 2 && m.interval >= MATURE_DAYS
}

/** "10m" → 10, "1h" → 60, "1d" → 1440. */
export function stepMinutes(step: string): number {
  const value = Number.parseFloat(step)
  const unit = step.at(-1)
  return unit === 'd' ? value * 1440 : unit === 'h' ? value * 60 : value
}

export interface AnswerOptions {
  /** Spread review intervals a little so cards learned together don't stay clumped. */
  fuzz?: boolean
  random?: () => number
}

/** The card's state after answering it with `rating` at `now`. */
export function answer(m: Memory, rating: Rating, now: Date, preset: SchedulerPreset, opts: AnswerOptions = {}): Memory {
  return preset.fsrs ? answerFsrs(m, rating, now, preset, opts) : answerSm2(m, rating, now, preset, opts)
}

/** When each button would bring the card back, without fuzz (for the button labels). */
export function preview(m: Memory, now: Date, preset: SchedulerPreset): Record<Rating, Date> {
  const out = {} as Record<Rating, Date>
  for (const { rating } of RATINGS) out[rating] = answer(m, rating, now, preset, { fuzz: false }).due
  return out
}

/** Probability of recalling the card at `now`, 0–1, from the FSRS forgetting curve. */
export function retrievability(m: Memory, now: Date): number {
  if (m.state === 0 || !m.lastReview) return 0
  const elapsed = Math.max(0, (now.getTime() - m.lastReview.getTime()) / DAY_MS)
  // Cards scheduled by SM-2 have no FSRS stability; their interval is a fair stand-in,
  // since a card is due roughly when recall drops to the target.
  const stability = m.stability > 0 ? m.stability : Math.max(0.5, m.interval)
  return forgetting_curve(default_w, elapsed, stability)
}

/** A short label for a duration, as on the answer buttons: "<1m", "10m", "3d", "1.5mo", "2y". */
export function formatInterval(ms: number): string {
  const minutes = ms / 60_000
  if (minutes < 1) return '<1m'
  if (minutes < 60) return `${Math.round(minutes)}m`
  const hours = minutes / 60
  if (hours < 24) return `${Math.round(hours)}h`
  const days = hours / 24
  if (days < 30) return `${Math.round(days)}d`
  if (days < 365) return `${trim(days / 30)}mo`
  return `${trim(days / 365)}y`
}

function trim(n: number): string {
  return n.toFixed(1).replace(/\.0$/, '')
}

// ── SM-2 ──────────────────────────────────────────────────────────────────────

/** Ease never drops below 130%. */
const MIN_EASE = 1.3

function addMinutes(now: Date, minutes: number): Date {
  return new Date(now.getTime() + minutes * 60_000)
}

function addDaysTo(now: Date, days: number): Date {
  return new Date(now.getTime() + days * DAY_MS)
}

/**
 * Minutes until a learning card returns after Hard: on the first step, the
 * average of the first two steps, or 1.5× a lone step (at most a day longer);
 * on later steps, the current step again.
 */
function hardDelay(steps: number[], step: number): number {
  const current = steps[step] ?? steps.at(-1) ?? 1
  if (step === 0 && steps.length > 1) return (current + steps[1]!) / 2
  if (step === 0) return Math.min(current * 1.5, current + 1440)
  return current
}

/** Spreads an interval by about 5% (at least a day) either way; intervals under 3 days stay exact. */
function fuzzed(days: number, opts: AnswerOptions): number {
  if (opts.fuzz === false || days < 3) return days
  const spread = Math.max(1, Math.round(days * 0.05))
  const r = (opts.random ?? Math.random)()
  return days + Math.round((r * 2 - 1) * spread)
}

function answerSm2(m: Memory, rating: Rating, now: Date, p: SchedulerPreset, opts: AnswerOptions): Memory {
  const base: Memory = { ...m, reps: m.reps + 1, lastReview: now }
  // Whole days within the preset's minimum and maximum, and never below `min`.
  const clamp = (days: number, min: number) => Math.min(p.maximumInterval, Math.max(min, p.minimumInterval, Math.round(days)))

  // A card keeps the ease it already has; a first graduation gets the starting ease.
  const graduate = (days: number): Memory => {
    const interval = clamp(fuzzed(days, opts), 1)
    return { ...base, state: 2, step: 0, interval, ease: m.ease || p.startingEase, due: addDaysTo(now, interval) }
  }

  // New and learning cards walk through the learning steps.
  if (m.state === 0 || m.state === 1) {
    const steps = p.learningSteps.map(stepMinutes)
    const step = m.state === 0 ? 0 : Math.min(m.step, Math.max(0, steps.length - 1))
    if (rating === 4 || steps.length === 0) return graduate(rating === 4 ? p.easyInterval : p.graduatingInterval)
    if (rating === 1) return { ...base, state: 1, step: 0, due: addMinutes(now, steps[0]!) }
    if (rating === 2) return { ...base, state: 1, step, due: addMinutes(now, hardDelay(steps, step)) }
    // Good on a new card passes the first step.
    const next = m.state === 0 ? Math.min(1, steps.length) : step + 1
    if (next >= steps.length) return graduate(p.graduatingInterval)
    return { ...base, state: 1, step: next, due: addMinutes(now, steps[next]!) }
  }

  // Relearning: the lapse interval was set when the card was forgotten. Finishing
  // the steps returns the card to review with it; Easy skips there with a day more.
  if (m.state === 3) {
    const steps = p.relearningSteps.map(stepMinutes)
    const step = Math.min(m.step, Math.max(0, steps.length - 1))
    const back = (extra: number): Memory => {
      const interval = clamp(m.interval + extra, 1)
      return { ...base, state: 2, step: 0, interval, due: addDaysTo(now, interval) }
    }
    if (steps.length === 0) return back(rating === 4 ? 1 : 0)
    if (rating === 1) return { ...base, state: 3, step: 0, due: addMinutes(now, steps[0]!) }
    if (rating === 2) return { ...base, state: 3, step, due: addMinutes(now, hardDelay(steps, step)) }
    if (rating === 4 || step + 1 >= steps.length) return back(rating === 4 ? 1 : 0)
    return { ...base, state: 3, step: step + 1, due: addMinutes(now, steps[step + 1]!) }
  }

  // Review cards.
  const ease = m.ease || p.startingEase
  const elapsed = m.lastReview ? (now.getTime() - m.lastReview.getTime()) / DAY_MS : m.interval
  const late = Math.max(0, elapsed - m.interval)

  // Again is a lapse: ease drops 20 points (250% → 230%), the interval is
  // multiplied by the "new interval" setting, and the card goes through the
  // relearning steps, if there are any.
  if (rating === 1) {
    const interval = clamp(m.interval * p.newInterval, 1)
    const lapsed: Memory = { ...base, lapses: m.lapses + 1, ease: Math.max(MIN_EASE, ease - 0.2), interval }
    const steps = p.relearningSteps.map(stepMinutes)
    if (steps.length === 0) return { ...lapsed, state: 2, step: 0, due: addDaysTo(now, interval) }
    return { ...lapsed, state: 3, step: 0, due: addMinutes(now, steps[0]!) }
  }

  // The documented SM-2 review intervals. Days late count in full for Easy and
  // half for Good, and each button gives at least a day more than the one before.
  // With a hard multiplier above 1, Hard also beats the current interval.
  const mod = p.intervalModifier
  const hard = clamp(m.interval * p.hardInterval * mod, p.hardInterval > 1 ? m.interval + 1 : 1)
  const good = clamp((m.interval + late / 2) * ease * mod, hard + 1)
  const easy = clamp((m.interval + late) * ease * p.easyBonus * mod, good + 1)
  const days = rating === 2 ? hard : rating === 3 ? good : easy
  const interval = clamp(fuzzed(days, opts), 1)
  // Hard costs 15 points of ease, Easy adds 15, Good leaves it alone.
  const nextEase = rating === 2 ? Math.max(MIN_EASE, ease - 0.15) : rating === 4 ? ease + 0.15 : ease
  return { ...base, state: 2, step: 0, interval, ease: nextEase, due: addDaysTo(now, interval) }
}

// ── FSRS ──────────────────────────────────────────────────────────────────────

// One ts-fsrs instance per distinct set of settings, reused across answers.
const engines = new Map<string, FSRS>()

function engine(p: SchedulerPreset, fuzz: boolean): FSRS {
  const key = JSON.stringify([p.desiredRetention, p.maximumInterval, p.learningSteps, p.relearningSteps, fuzz])
  let f = engines.get(key)
  if (!f) {
    f = fsrs({
      request_retention: p.desiredRetention,
      maximum_interval: p.maximumInterval,
      enable_fuzz: fuzz,
      // Without learning steps, even a new card's first answer is scheduled in days.
      enable_short_term: p.learningSteps.length > 0,
      learning_steps: p.learningSteps as Steps,
      relearning_steps: p.relearningSteps as Steps,
    })
    engines.set(key, f)
  }
  return f
}

function toFsrs(m: Memory): Card {
  // Cards that were scheduled by SM-2 get a starting memory state from their interval.
  const seeded = m.state === 2 && m.stability <= 0
  return {
    due: m.due,
    stability: seeded ? Math.max(0.5, m.interval) : m.stability,
    difficulty: seeded ? 5 : m.difficulty,
    elapsed_days: 0,
    scheduled_days: m.interval,
    learning_steps: m.step,
    reps: m.reps,
    lapses: m.lapses,
    state: m.state,
    last_review: m.lastReview ?? undefined,
  }
}

function answerFsrs(m: Memory, rating: Rating, now: Date, p: SchedulerPreset, opts: AnswerOptions): Memory {
  const card = engine(p, opts.fuzz !== false).next(toFsrs(m), now, rating as Grade).card
  return {
    state: card.state as Memory['state'],
    due: card.due,
    interval: card.scheduled_days,
    ease: m.ease,
    stability: card.stability,
    difficulty: card.difficulty,
    step: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    lastReview: card.last_review ?? now,
  }
}

// ── Serialization ─────────────────────────────────────────────────────────────

/** JSON-safe form of a card's state: dates become ISO strings. */
export function serializeMemory(m: Memory): CardState {
  return {
    state: m.state,
    due: m.due.toISOString(),
    interval: m.interval,
    ease: m.ease,
    stability: m.stability,
    difficulty: m.difficulty,
    step: m.step,
    reps: m.reps,
    lapses: m.lapses,
    lastReview: m.lastReview?.toISOString() ?? null,
  }
}

/** The inverse of `serializeMemory`. */
export function parseMemory(s: CardState): Memory {
  return { ...s, due: new Date(s.due), lastReview: s.lastReview ? new Date(s.lastReview) : null }
}

/** The default desired retention; the target line on retention charts. */
export const TARGET_RETENTION = 0.9
