import type { SchedulerPreset } from './schedule.ts'

// Wire types for the dashboard and study sessions, sent from the API to the web
// app. Everything is JSON-safe: dates travel as ISO strings or day keys.

/** Matches ts-fsrs: Again = 1, Hard = 2, Good = 3, Easy = 4. */
export type Rating = 1 | 2 | 3 | 4

/** Card buckets: mature means an interval of 21 days or more. */
export type CardKind = 'new' | 'learning' | 'young' | 'mature'

/** The queue a card is studied from; relearning cards are in learning. */
export type DueKind = 'new' | 'learning' | 'review'

export interface DueCounts {
  new: number
  learning: number
  review: number
}

/** A card's scheduling state, serialized (see `Memory` in schedule.ts). */
export interface CardState {
  state: 0 | 1 | 2 | 3
  due: string
  interval: number
  ease: number
  stability: number
  difficulty: number
  step: number
  reps: number
  lapses: number
  lastReview: string | null
}

export interface QueueCard {
  id: string
  deckId: string
  kind: DueKind
  front: string
  /** Small line under the prompt, e.g. a reading or a category. */
  hint?: string
  back: string
  extra?: string
  memory: CardState
}

export type DeckIcon = 'kana' | 'brain' | 'code' | 'spanish' | 'flask' | 'globe' | 'spark' | 'book'

export interface DeckRow {
  id: string
  name: string
  parentId: string | null
  presetId: string
  icon: DeckIcon
  /** Due in this deck itself; parents add their children's counts when displayed. */
  due: DueCounts
  /** Totals below include subdecks. */
  total: number
  mature: number
  /** True retention over the last 30 days (review cards only), 0–1. */
  retention: number | null
  lastStudied: string | null
}

export interface HeatmapDay {
  date: string
  reviews: number
  /** Passed reviews of review-state cards, and how many there were. */
  passed: number
  graded: number
  minutes: number
}

export interface ForecastPoint {
  date: string
  young: number
  mature: number
}

export interface ReviewsPoint {
  date: string
  learning: number
  young: number
  mature: number
}

export interface RetentionPoint {
  week: string
  retention: number | null
  reviews: number
}

export interface HourPoint {
  hour: number
  reviews: number
  retention: number | null
}

export type AnswerCounts = Record<'again' | 'hard' | 'good' | 'easy', number>

export type CollectionCounts = Record<CardKind | 'suspended', number>

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export type AchievementIcon =
  | 'spark'
  | 'hundred'
  | 'run'
  | 'flame'
  | 'fire'
  | 'infinity'
  | 'crown'
  | 'layers'
  | 'mountain'
  | 'tree'
  | 'network'
  | 'target'
  | 'sunrise'
  | 'moon'
  | 'shuffle'
  | 'hourglass'
  | 'rebound'
  | 'book'
  | 'cog'
  | 'tent'
  | 'compass'
  | 'sprout'
  | 'revive'
  | 'zap'
  | 'timer'
  | 'headphones'
  | 'flag'
  | 'chain'
  | 'calendar'
  | 'telescope'

export interface Achievement {
  id: string
  name: string
  description: string
  tier: AchievementTier
  icon: AchievementIcon
  value: number
  target: number
  unlockedAt: string | null
  secret: boolean
}

export type QuestMetric = 'reviews' | 'newCards' | 'decks' | 'minutes' | 'correct' | 'xp' | 'mature' | 'young' | 'run' | 'quick'

export interface Quest {
  id: string
  title: string
  metric: QuestMetric
  target: number
  progress: number
  xp: number
  coins: number
  /** The reward has been collected (complete quests are claimed by hand). */
  claimed: boolean
}

export type ChestTier = 'bronze' | 'silver' | 'gold' | 'diamond'

/** Today's chest: one per study day, better the longer the streak. */
export interface DailyChest {
  tier: ChestTier
  /** What today's chest gave, once opened. */
  opened: { xp: number; coins: number } | null
  /** The next tier and the streak it needs, if any. */
  next: { tier: ChestTier; streak: number } | null
  /** Today's place (1–7) in the run of chests opened on consecutive days. */
  day: number
  /** Day 7 of a run: double rewards and a streak freeze if the bank has room. */
  weekly: boolean
}

export interface WeekDay {
  date: string
  /** `none`: before the learner's first study day. */
  status: 'done' | 'freeze' | 'missed' | 'today' | 'upcoming' | 'none'
}

export interface TodayStats {
  reviews: number
  passed: number
  graded: number
  newCards: number
  minutes: number
  xp: number
  decks: string[]
  /** Answers other than Again. */
  correct: number
  /** Answers on mature cards (interval of 21 days or more). */
  mature: number
  /** Answers on young review cards (interval under 21 days). */
  young: number
  /** Longest run of answers without an Again today. */
  run: number
  /** Answers other than Again given in under five seconds. */
  quick: number
}

export interface Dashboard {
  isDemo: boolean
  now: string
  /** Hour of `now` on the server, so the greeting renders the same on both sides. */
  localHour: number
  today: string
  /** End of the current study day; learning cards due before it count as due today. */
  dayEnd: string
  goal: number
  todayStats: TodayStats
  due: DueCounts
  secondsPerReview: number
  streak: {
    current: number
    longest: number
    /** Streak freezes banked (weekly chests add them), up to `maxFreezes`. */
    freezes: number
    maxFreezes: number
    studiedToday: boolean
    week: WeekDay[]
  }
  totalXp: number
  /** Coins earned: daily goals, chests, quests, lucky finds and the welcome bonus. */
  coins: number
  chest: DailyChest
  /** Extra reward for claiming every quest of the day. */
  questBonus: { xp: number; coins: number; claimed: boolean }
  /** The new-account bonus, on the day it was given (shown once). */
  welcome: { xp: number; coins: number } | null
  decks: DeckRow[]
  heatmap: HeatmapDay[]
  forecast: ForecastPoint[]
  reviews: ReviewsPoint[]
  retention: RetentionPoint[]
  answers: AnswerCounts
  collection: CollectionCounts
  /** Mean FSRS retrievability across review cards right now, 0–1. */
  recall: number
  hours: HourPoint[]
  achievements: Achievement[]
  quests: Quest[]
  rolloverHour: number
  totals: { reviews: number; hours: number; daysStudied: number; since: string }
}

/** A study session's queue, as returned by POST /me/study/queue. */
export interface StudyQueue {
  mode: 'scheduled' | 'quick' | 'new' | 'ahead' | 'forgotten' | 'cram'
  /** False in cram mode: answers are practice and don't change scheduling. */
  reschedules: boolean
  cards: QueueCard[]
  decks: { id: string; name: string; path: string; icon: DeckIcon; presetId: string }[]
  presets: Record<string, SchedulerPreset>
  /** Totals of what's in the queue right now. */
  counts: DueCounts
  /** When the queue was built. The session starts its clock here, so server and browser pick the same first card. */
  now: string
  dayEnd: string
  learnAheadMinutes: number
  /** For the session header: progress toward the day's goal, streak and level. */
  progress: { totalXp: number; streak: number; studiedToday: boolean; reviewsToday: number; goal: number }
}
