import type { Memory, SchedulerPreset } from './schedule.ts'
import type { DayConfig } from './time.ts'
import type { CardKind, DeckIcon, QuestMetric, Rating } from './types.ts'

// The raw shape the dashboard and analytics are computed from: decks, cards
// with their scheduling state, the review log and the reward ledger. The API
// builds it from Postgres; the demo builds it from a simulation.

export interface CollectionDeck {
  id: string
  name: string
  parentId: string | null
  icon: DeckIcon
  presetId: string
  newPerDay: number
  reviewsPerDay: number
}

export interface CardContent {
  front: string
  back: string
  hint?: string
  extra?: string
}

export interface CollectionCard {
  id: string
  deckId: string
  memory: Memory
  suspended: boolean
  content: CardContent
  /** Order new cards are introduced in. */
  position: number
  /** Epoch ms the card was added, when known (drives the "Added" chart). */
  createdAt?: number
}

export interface ReviewEntry {
  /** Epoch ms when the answer was given. */
  t: number
  cardId: string
  deckId: string
  rating: Rating
  /** Bucket the card was in before this answer. */
  kind: CardKind
  /** Whether the card was mature after this answer (drives mature-count history). */
  matureAfter: boolean
  /** Answer time; 0 when it wasn't recorded (e.g. imported history). */
  ms: number
}

export interface Collection {
  now: Date
  day: DayConfig
  dailyGoal: number
  decks: CollectionDeck[]
  presets: Record<string, SchedulerPreset>
  cards: CollectionCard[]
  /** Oldest first. */
  logs: ReviewEntry[]
  /** Study days a streak freeze covered. */
  freezes: string[]
  /** Freezes still banked: one to start with, more from weekly chests. */
  freezesLeft: number
  /** Claimed rewards (chests, quests, lucky finds, the welcome bonus), oldest first. */
  rewards: RewardEntry[]
  /** Today's quests as first offered, so they stay put all day (computed when absent). */
  questOffers?: QuestOffer[]
}

/** A quest as offered today: what it asks for and what it pays. */
export interface QuestOffer {
  metric: QuestMetric
  target: number
  xp: number
  coins: number
}

export type RewardKind = 'chest' | 'quest' | 'drop' | 'welcome'

export interface RewardEntry {
  /** Study day the reward belongs to. */
  day: string
  kind: RewardKind
  /**
   * Which reward of its kind: "daily" for the chest, the quest metric (or "bonus"
   * for clearing every quest), "review:<log id>" for a lucky find, "welcome".
   */
  key: string
  xp: number
  coins: number
}
