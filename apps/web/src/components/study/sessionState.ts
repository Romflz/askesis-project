import {
  answer as schedule,
  GOAL_BONUS,
  isLearning,
  parseMemory,
  type QueueCard,
  type Rating,
  type SchedulerPreset,
  serializeMemory,
  xpForReview,
} from '@askesis/core'

// The focused session's state machine. Card order: learning cards
// that are due come first, then the prepared queue; when only learning cards are
// left, ones due within the learn-ahead limit are shown early (never the card
// just answered), otherwise the session waits for the next one.

/** Combo milestones: each one heats the combo flame up a step. */
export const COMBO_MILESTONES = [10, 25, 50] as const

/** 0 below the first milestone, up to 3 from ×50. */
export function comboTier(combo: number): number {
  return COMBO_MILESTONES.filter((m) => combo >= m).length
}

export interface LearningEntry {
  card: QueueCard
  due: number
}

export interface HistoryEntry {
  /** The card as it was before this answer. */
  card: QueueCard
  rating: Rating
  xp: number
  ms: number
  /** A copy went back into the session (learning step, or a missed practice card). */
  requeued: boolean
  comboBefore: number
  startedStreak: boolean
}

export interface SessionState {
  queue: QueueCard[]
  learning: LearningEntry[]
  current: QueueCard | null
  revealed: boolean
  /** Set while only learning cards remain and none is due within the learn-ahead limit. */
  waitingUntil: number | null
  finished: boolean
  history: HistoryEntry[]
  combo: number
  bestCombo: number
  xp: number
  reviewsToday: number
  streak: number
  studiedToday: boolean
  /** Cards taken out of the session by bury or suspend. */
  removed: number
}

export interface SessionConfig {
  /** False for practice modes (cram): answers don't change scheduling. */
  reschedules: boolean
  /** When the study day ends (ms). Learning steps due after it leave the session. */
  dayEnd: number
  learnAheadMs: number
  /** Daily review goal; reaching it during the session adds the goal bonus. */
  goal: number
  presetFor: (card: QueueCard) => SchedulerPreset | undefined
}

export type SessionAction =
  | { type: 'reveal' }
  | { type: 'answer'; rating: Rating; now: number; ms: number }
  | { type: 'undo'; restored?: QueueCard; now: number }
  | { type: 'remove'; now: number }
  | { type: 'skip'; now: number }
  | { type: 'edit'; card: QueueCard }
  | { type: 'tick'; now: number }
  | { type: 'showNow' }
  | { type: 'finish' }
  | { type: 'serverMemory'; cardId: string; memory: QueueCard['memory'] }

/**
 * The starting state, with the first card already picked. With `holdLearning`
 * (today's cards), learning steps that aren't due yet wait like the ones answered
 * during the session: shown once due, or early when only they are left. Other
 * modes study what was asked for, due or not.
 */
export function initSession(
  cards: QueueCard[],
  progress: { streak: number; studiedToday: boolean; reviewsToday: number },
  config: SessionConfig,
  now: number,
  holdLearning = false,
): SessionState {
  const waits = (c: QueueCard) => holdLearning && (c.memory.state === 1 || c.memory.state === 3) && Date.parse(c.memory.due) > now
  return pick(
    {
      queue: cards.filter((c) => !waits(c)),
      learning: cards.filter(waits).map((card) => ({ card, due: Date.parse(card.memory.due) })),
      current: null,
      revealed: false,
      waitingUntil: null,
      finished: false,
      history: [],
      combo: 0,
      bestCombo: 0,
      xp: 0,
      reviewsToday: progress.reviewsToday,
      streak: progress.streak,
      studiedToday: progress.studiedToday,
      removed: 0,
    },
    now,
    config.learnAheadMs,
  )
}

/**
 * Puts the next card on screen (in the order described at the top), or waits, or finishes.
 * `answeredId` is the card just answered.
 */
function pick(state: SessionState, now: number, learnAheadMs: number, answeredId?: string): SessionState {
  const learning = [...state.learning].sort((a, b) => a.due - b.due)
  const base = { ...state, revealed: false, waitingUntil: null }
  const dueNow = learning[0] && learning[0].due <= now ? learning[0] : null
  if (dueNow) return { ...base, current: dueNow.card, learning: learning.slice(1) }
  if (state.queue.length) return { ...base, current: state.queue[0]!, queue: state.queue.slice(1), learning }
  // Showing a missed card again straight away only tests short-term memory, so
  // it waits for its step unless another card can go first.
  const ahead = learning.find((l) => l.due - now <= learnAheadMs && l.card.id !== answeredId)
  if (ahead) return { ...base, current: ahead.card, learning: learning.filter((l) => l !== ahead) }
  const next = learning[0]
  if (next) return { ...base, current: null, learning, waitingUntil: next.due }
  return { ...base, current: null, learning, finished: true }
}

const without = (cards: QueueCard[], id: string) => cards.filter((c) => c.id !== id)

/**
 * The session reducer for one config. It updates local state optimistically,
 * using the same scheduler as the API; the component saves each answer and
 * patches in the server's result with `serverMemory`.
 */
export function sessionReducer(config: SessionConfig) {
  return (state: SessionState, action: SessionAction): SessionState => {
    switch (action.type) {
      case 'reveal':
        return state.current ? { ...state, revealed: true } : state

      case 'answer': {
        const card = state.current
        if (!card || !state.revealed) return state
        let learning = state.learning
        let queue = state.queue
        let requeued = false

        if (config.reschedules) {
          const preset = config.presetFor(card)
          if (preset) {
            const next = schedule(parseMemory(card.memory), action.rating, new Date(action.now), preset)
            if (isLearning(next) && next.due.getTime() < config.dayEnd) {
              learning = [
                ...learning,
                { card: { ...card, kind: 'learning', memory: serializeMemory(next) }, due: next.due.getTime() },
              ]
              requeued = true
            }
          }
        } else if (action.rating === 1) {
          // Practice: a missed card comes back at the end until you get it.
          queue = [...queue, card]
          requeued = true
        }

        const startedStreak = config.reschedules && !state.studiedToday
        const streak = startedStreak ? state.streak + 1 : state.streak
        const reviewsToday = state.reviewsToday + (config.reschedules ? 1 : 0)
        let xp = config.reschedules ? xpForReview(action.rating, card.kind === 'new', streak) : 0
        if (config.reschedules && state.reviewsToday < config.goal && reviewsToday >= config.goal) xp += GOAL_BONUS
        const combo = action.rating > 1 ? state.combo + 1 : 0

        return pick(
          {
            ...state,
            queue,
            learning,
            history: [
              ...state.history,
              { card, rating: action.rating, xp, ms: action.ms, requeued, comboBefore: state.combo, startedStreak },
            ],
            combo,
            bestCombo: Math.max(state.bestCombo, combo),
            xp: state.xp + xp,
            reviewsToday,
            streak,
            studiedToday: state.studiedToday || config.reschedules,
          },
          action.now,
          config.learnAheadMs,
          card.id,
        )
      }

      case 'undo': {
        const last = state.history.at(-1)
        if (!last) return state
        const id = last.card.id
        let queue = state.queue
        let learning = state.learning
        // Take back the copy this answer put back: a learning step, or a missed
        // practice card at the end of the queue.
        if (last.requeued) {
          learning = learning.filter((l) => l.card.id !== id)
          const at = queue.map((c) => c.id).lastIndexOf(id)
          if (!config.reschedules && at >= 0) queue = [...queue.slice(0, at), ...queue.slice(at + 1)]
        }
        // Whatever was on screen goes back to the front, unless it is the same card.
        if (state.current && state.current.id !== id) queue = [state.current, ...queue]
        // `restored` is the server's copy after undoing; without it the card as it was before the answer.
        return {
          ...state,
          queue,
          learning,
          current: action.restored ?? last.card,
          revealed: false,
          waitingUntil: null,
          finished: false,
          history: state.history.slice(0, -1),
          combo: last.comboBefore,
          xp: state.xp - last.xp,
          reviewsToday: state.reviewsToday - (config.reschedules ? 1 : 0),
          streak: last.startedStreak ? state.streak - 1 : state.streak,
          studiedToday: last.startedStreak ? false : state.studiedToday,
        }
      }

      case 'remove': {
        if (!state.current) return state
        const id = state.current.id
        return pick(
          {
            ...state,
            queue: without(state.queue, id),
            learning: state.learning.filter((l) => l.card.id !== id),
            removed: state.removed + 1,
          },
          action.now,
          config.learnAheadMs,
        )
      }

      case 'skip': {
        if (!state.current) return state
        // Nothing else left: keep the card, just hide its answer again.
        if (state.queue.length === 0 && state.learning.length === 0) return { ...state, revealed: false }
        return pick({ ...state, queue: [...state.queue, state.current] }, action.now, config.learnAheadMs)
      }

      case 'edit': {
        const swap = (c: QueueCard) => (c.id === action.card.id ? { ...c, ...contentOf(action.card) } : c)
        return {
          ...state,
          current: state.current ? swap(state.current) : null,
          queue: state.queue.map(swap),
          learning: state.learning.map((l) => ({ ...l, card: swap(l.card) })),
        }
      }

      case 'tick':
        if (state.waitingUntil !== null && action.now >= state.waitingUntil) return pick(state, action.now, config.learnAheadMs)
        return state

      // Skip the wait and show the next learning card early.
      case 'showNow': {
        if (state.current || !state.learning.length) return state
        const [next, ...rest] = [...state.learning].sort((a, b) => a.due - b.due)
        return { ...state, current: next!.card, learning: rest, waitingUntil: null, revealed: false }
      }

      case 'finish':
        return { ...state, current: null, waitingUntil: null, finished: true }

      case 'serverMemory': {
        // The server is authoritative (its fuzz may differ); refresh a requeued copy.
        const fix = (c: QueueCard) => (c.id === action.cardId ? { ...c, memory: action.memory } : c)
        return {
          ...state,
          learning: state.learning.map((l) =>
            l.card.id === action.cardId ? { card: fix(l.card), due: Date.parse(action.memory.due) } : l,
          ),
        }
      }
    }
  }
}

function contentOf(card: QueueCard) {
  return { front: card.front, back: card.back, hint: card.hint, extra: card.extra }
}

/** Cards left in the session by kind, including the one on screen. */
export function remaining(state: SessionState) {
  const cards = [...(state.current ? [state.current] : []), ...state.queue, ...state.learning.map((l) => l.card)]
  return {
    new: cards.filter((c) => c.kind === 'new').length,
    learning: cards.filter((c) => c.kind === 'learning').length,
    review: cards.filter((c) => c.kind === 'review').length,
    total: cards.length,
  }
}
