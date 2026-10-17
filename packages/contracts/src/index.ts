import { z } from 'zod'

// Wire contracts shared by the Fastify API (request validation) and the
// Start app (search-param validation, server function input, typed results).

// ── Docs ─────────────────────────────────────────────────────────────────────

/** Docs per page in GET /docs. */
export const PAGE_SIZE = 10

export const docListQuery = z.object({
  q: z.string().trim().max(200).default(''),
  tag: z.string().trim().max(40).optional(),
  page: z.coerce.number().int().min(1).default(1),
})
export type DocListQuery = z.infer<typeof docListQuery>

export const slugParam = z.object({
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
})

export const createDocInput = z.object({
  title: z.string().trim().min(3).max(160),
  summary: z.string().trim().max(280).default(''),
  body: z.string().trim().min(1).max(100_000),
  tags: z.array(z.string().trim().toLowerCase().min(1).max(40)).max(8).default([]),
})
export type CreateDocInput = z.infer<typeof createDocInput>

export type DocSummary = {
  slug: string
  title: string
  summary: string
  tags: string[]
  updatedAt: string
  authorName: string | null
}

export type Doc = DocSummary & {
  body: string
  createdAt: string
}

export type DocListResult = {
  items: DocSummary[]
  total: number
  page: number
  pageCount: number
  tags: string[]
}

// ── Accounts ─────────────────────────────────────────────────────────────────

export type SessionUser = {
  id: string
  name: string
  email: string
  /** Public handle, as the user typed it (stored lowercased for uniqueness). Null until chosen. */
  username: string | null
  /** Patreon tier: 0 not a supporter, 1 Backer, 2 Insider, 3 Champion. */
  supportLevel: SupportLevel
}

export type SupportLevel = 0 | 1 | 2 | 3

/** Supporter tiers people can hold on their account (Sponsor is for companies, outside accounts). */
export const SUPPORT_TIERS: Record<Exclude<SupportLevel, 0>, string> = { 1: 'Backer', 2: 'Insider', 3: 'Champion' }

/** Reads a support level from untyped session data; anything unexpected counts as 0. */
export function toSupportLevel(value: unknown): SupportLevel {
  const n = Number(value)
  return n === 1 || n === 2 || n === 3 ? n : 0
}

// ── Usernames ────────────────────────────────────────────────────────────────

/** Handles that would collide with routes or look official. */
export const RESERVED_USERNAMES = new Set([
  'admin',
  'administrator',
  'api',
  'app',
  'askesis',
  'auth',
  'dashboard',
  'decks',
  'docs',
  'help',
  'login',
  'logout',
  'me',
  'moderator',
  'register',
  'root',
  'settings',
  'signin',
  'signup',
  'staff',
  'study',
  'support',
  'system',
  'team',
  'u',
  'user',
  'users',
  'www',
])

export const USERNAME_HINT = '3–24 characters: letters, numbers, underscores and dots'

export const usernameSchema = z
  .string()
  .trim()
  .min(3, 'At least 3 characters')
  .max(24, 'At most 24 characters')
  .regex(/^[a-zA-Z0-9_.]+$/, 'Only letters, numbers, underscores and dots')
  .refine((u) => !/^\.|\.$|\.\./.test(u), 'Dots can’t start, end or repeat')
  .refine((u) => !RESERVED_USERNAMES.has(u.toLowerCase()), 'That username is reserved')

// ── Askesis: deck presets and study settings ──────────────────────────────────

/** A learning/relearning step: minutes, hours or days, e.g. "1m", "10m", "1h", "1d". */
export const stepString = z
  .string()
  .trim()
  .regex(/^\d+(\.\d+)?[mhd]$/, 'Use a number followed by m, h or d (e.g. 10m)')

/**
 * How a group of decks schedules cards. The SM-2 fields (ease, bonuses,
 * modifiers) apply when FSRS is off; FSRS uses desired retention instead.
 * Steps, limits and the maximum interval apply to both.
 */
export const deckPresetInput = z.object({
  name: z.string().trim().min(1).max(60),
  // Daily limits
  newPerDay: z.number().int().min(0).max(9999),
  reviewsPerDay: z.number().int().min(0).max(99_999),
  // New cards
  learningSteps: z.array(stepString).max(10),
  graduatingInterval: z.number().int().min(1).max(36_500),
  easyInterval: z.number().int().min(1).max(36_500),
  newCardOrder: z.enum(['sequential', 'random']),
  // Lapses
  relearningSteps: z.array(stepString).max(10),
  minimumInterval: z.number().int().min(1).max(36_500),
  leechThreshold: z.number().int().min(1).max(99),
  leechAction: z.enum(['tag', 'suspend']),
  // Advanced
  maximumInterval: z.number().int().min(1).max(36_500),
  startingEase: z.number().min(1.31).max(5),
  easyBonus: z.number().min(1).max(5),
  intervalModifier: z.number().min(0.5).max(2),
  hardInterval: z.number().min(0.5).max(1.3),
  newInterval: z.number().min(0).max(1),
  // FSRS
  fsrs: z.boolean(),
  desiredRetention: z.number().min(0.7).max(0.99),
})
export type DeckPresetInput = z.infer<typeof deckPresetInput>

export type DeckPreset = DeckPresetInput & { id: string; isDefault: boolean }

/** Standard SM-2 defaults, so cards come back on the schedule experienced learners expect. */
export const DEFAULT_PRESET: DeckPresetInput = {
  name: 'Default',
  newPerDay: 20,
  reviewsPerDay: 200,
  learningSteps: ['1m', '10m'],
  graduatingInterval: 1,
  easyInterval: 4,
  newCardOrder: 'sequential',
  relearningSteps: ['10m'],
  minimumInterval: 1,
  leechThreshold: 8,
  leechAction: 'tag',
  maximumInterval: 36_500,
  startingEase: 2.5,
  easyBonus: 1.3,
  intervalModifier: 1,
  hardInterval: 1.2,
  newInterval: 0,
  fsrs: false,
  desiredRetention: 0.9,
}

export const userSettingsInput = z.object({
  /** Answers per study day that meet the daily goal. */
  dailyGoal: z.number().int().min(10).max(5_000),
  /** Hour (0–23) the study day rolls over ("next day starts at"). */
  rolloverHour: z.number().int().min(0).max(23),
  /** Learning cards due within this many minutes may be shown early. */
  learnAheadMinutes: z.number().int().min(0).max(240),
  timeZone: z.string().min(1).max(64),
  /** Local hour for the daily reminder (6 AM by default); null means "when my day resets". */
  reminderHour: z.number().int().min(0).max(23).nullable(),
})
export type UserSettings = z.infer<typeof userSettingsInput>

export const DEFAULT_USER_SETTINGS: UserSettings = {
  dailyGoal: 100,
  rolloverHour: 4,
  learnAheadMinutes: 20,
  timeZone: 'UTC',
  reminderHour: 6,
}

/** A PushSubscription as serialized by the browser (`subscription.toJSON()`). */
export const pushSubscriptionInput = z.object({
  endpoint: z.string().url().max(2048),
  keys: z.object({ p256dh: z.string().min(1).max(512), auth: z.string().min(1).max(512) }),
})
export type PushSubscriptionInput = z.infer<typeof pushSubscriptionInput>

/** One answer to a card. Rating: 1 Again, 2 Hard, 3 Good, 4 Easy. */
export const reviewInput = z.object({
  cardId: z.string().uuid(),
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  durationMs: z.number().int().min(0).max(3_600_000),
})
export type ReviewInput = z.infer<typeof reviewInput>

export const idParam = z.object({ id: z.string().uuid() })

export const assignPresetInput = z.object({ presetId: z.string().uuid() })

export type DeckSummary = { id: string; name: string; parentId: string | null; presetId: string; cards: number }

export type SettingsPayload = {
  settings: UserSettings
  presets: DeckPreset[]
  decks: DeckSummary[]
}

// ── Askesis: decks, cards, tags ───────────────────────────────────────────────

/** Keep in sync with DeckIcon in @askesis/core. */
export const DECK_ICONS = ['book', 'spark', 'kana', 'spanish', 'brain', 'code', 'flask', 'globe'] as const

/** One deck name segment; "::" builds hierarchy and is not allowed inside a name. */
export const deckName = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .refine((s) => !s.includes('::'), 'A deck name can’t contain "::"')

/** Hierarchical tags ("lpic1::chapter::01-intro") from imported decks can run long. */
export const TAG_MAX = 200

export const tagName = z.string().trim().min(1).max(TAG_MAX).regex(/^\S+$/, 'Tags can’t contain spaces')

export const deckInput = z.object({
  name: deckName,
  parentId: z.string().uuid().nullable().default(null),
  presetId: z.string().uuid().optional(),
  icon: z.enum(DECK_ICONS).default('book'),
  description: z.string().trim().max(500).default(''),
})
export type DeckInput = z.infer<typeof deckInput>

export const deckUpdate = z.object({
  name: deckName.optional(),
  parentId: z.string().uuid().nullable().optional(),
  presetId: z.string().uuid().optional(),
  icon: z.enum(DECK_ICONS).optional(),
  description: z.string().trim().max(500).optional(),
})
export type DeckUpdate = z.infer<typeof deckUpdate>

const cardText = z.string().max(20_000)

export const cardInput = z.object({
  deckId: z.string().uuid(),
  front: cardText.trim().min(1),
  back: cardText,
  hint: z.string().max(2_000).default(''),
  extra: cardText.default(''),
  tags: z.array(tagName).max(50).default([]),
})
export type CardInput = z.infer<typeof cardInput>

export const cardUpdate = z.object({
  deckId: z.string().uuid().optional(),
  front: cardText.trim().min(1).optional(),
  back: cardText.optional(),
  hint: z.string().max(2_000).optional(),
  extra: cardText.optional(),
  tags: z.array(tagName).max(50).optional(),
  suspended: z.boolean().optional(),
})
export type CardUpdate = z.infer<typeof cardUpdate>

export const CARD_FILTERS = ['all', 'new', 'learning', 'review', 'due', 'suspended', 'leech'] as const

export const cardListQuery = z.object({
  /** A deck and its subdecks; omit for every deck. */
  deckId: z.string().uuid().optional(),
  q: z.string().trim().max(200).default(''),
  tag: z.string().trim().max(TAG_MAX).optional(),
  filter: z.enum(CARD_FILTERS).default('all'),
  sort: z.enum(['created', 'due', 'front', 'lapses']).default('created'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(10).max(200).default(50),
})
export type CardListQuery = z.infer<typeof cardListQuery>

export type CardListItem = {
  id: string
  deckId: string
  front: string
  back: string
  hint: string | null
  extra: string | null
  tags: string[]
  suspended: boolean
  state: 0 | 1 | 2 | 3
  due: string
  interval: number
  ease: number
  reps: number
  lapses: number
  createdAt: string
}

export type CardListResult = { items: CardListItem[]; total: number; page: number; pageCount: number }

export const cardBulkInput = z.object({
  ids: z.array(z.string().uuid()).min(1).max(5_000),
  action: z.enum(['suspend', 'unsuspend', 'delete', 'move', 'addTag', 'removeTag', 'forget']),
  deckId: z.string().uuid().optional(),
  tag: tagName.optional(),
})
export type CardBulkInput = z.infer<typeof cardBulkInput>

export const renameTagInput = z.object({ from: tagName, to: tagName })
export const deleteTagInput = z.object({ tag: tagName })

export type TagSummary = { tag: string; cards: number }

export type DeckNode = {
  id: string
  name: string
  /** Full path, e.g. "Japanese::Kanji". */
  path: string
  parentId: string | null
  presetId: string
  icon: (typeof DECK_ICONS)[number]
  description: string
  position: number
  /** Cards in this deck only (not subdecks). */
  cards: number
  suspended: number
  /** Due today in this deck only, within its preset's daily limits. */
  due: { new: number; learning: number; review: number }
}

export type LibraryPayload = {
  decks: DeckNode[]
  presets: { id: string; name: string; isDefault: boolean }[]
  /** Tags as written on cards, with exact card counts. */
  tags: TagSummary[]
  /**
   * Every level of every tag ("lpic1", "lpic1::chapter" and "lpic1::chapter::01"
   * for "lpic1::chapter::01"), each with the distinct cards at or below it.
   */
  tagLevels: TagSummary[]
}

// ── Askesis: import / export ──────────────────────────────────────────────────

/** 0 new, 1 learning, 2 review, 3 relearning. */
const cardStateCode = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)])

/** A card's study progress as exported with `scheduling` on. */
export const importScheduling = z.object({
  state: cardStateCode,
  due: z.string().datetime(),
  interval: z.number().int().min(0).max(36_500),
  ease: z.number().min(0).max(10),
  stability: z.number().min(0).max(36_500),
  difficulty: z.number().min(0).max(10),
  step: z.number().int().min(0).max(100).default(0),
  reps: z.number().int().min(0),
  lapses: z.number().int().min(0),
  lastReview: z.string().datetime().nullable(),
})

/** One past answer from an exported review history. */
export const importReview = z.object({
  at: z.string().datetime(),
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  ms: z.number().int().min(0).max(3_600_000),
  stateBefore: cardStateCode,
  stateAfter: cardStateCode,
  intervalBefore: z.number().int().min(0).max(36_500),
  intervalAfter: z.number().int().min(0).max(36_500),
  ease: z.number().min(0).max(10),
})

/**
 * A card ID as files carry it (any UUID, lowercase). Looser than `z.uuid()` on
 * purpose: an ID that isn't one of the user's cards is simply not matched.
 */
export const CARD_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

export const importRow = z.object({
  /** The ID of an existing card (the `id` column of an export). That card is updated, whatever its front or deck. */
  id: z.string().regex(CARD_ID).optional(),
  /** Deck path ("Parent::Child"); null uses the import's default deck. */
  deck: z.string().trim().max(400).nullable(),
  front: cardText.trim().min(1),
  back: cardText,
  hint: z.string().max(2_000).optional(),
  extra: cardText.optional(),
  tags: z.array(z.string().trim().min(1).max(TAG_MAX)).max(50),
  scheduling: importScheduling.optional(),
  suspended: z.boolean().optional(),
  /** Past answers, oldest first. Merged into the review log without duplicates. */
  history: z.array(importReview).max(5_000).optional(),
})
export type ImportRow = z.infer<typeof importRow>

/**
 * Decks are matched by full path (case-insensitive) and merged, never replaced.
 * A row matches an existing card by ID, or without one by the same front in the
 * same deck; matches are updated, skipped or duplicated.
 */
export const importInput = z.object({
  rows: z.array(importRow).min(1).max(50_000),
  defaultDeck: z.string().trim().min(1).max(400),
  duplicates: z.enum(['update', 'skip', 'duplicate']).default('update'),
})
export type ImportInput = z.infer<typeof importInput>

export type ImportResult = {
  decksCreated: string[]
  decksMerged: string[]
  added: number
  /** Cards the file changed. Matches identical to the card are `unchanged` and aren't written. */
  updated: number
  unchanged?: number
  skipped: number
  /** Cards (added or updated) that took studied progress from the file; new cards just stay new. */
  withProgress?: number
  /** Past answers added to the review log from the file's history column. */
  reviewsImported?: number
}

export const exportInput = z.object({
  /** Decks to export, with their subdecks. Empty exports everything. */
  deckIds: z.array(z.string().uuid()).max(1_000).default([]),
  /** Study progress: state, due date, interval, ease, memory, step, suspended. */
  scheduling: z.boolean().default(false),
  /** Every past answer, so stats, streaks and the heatmap can be restored. */
  history: z.boolean().default(false),
  separator: z.enum(['comma', 'tab', 'semicolon']).default('comma'),
})
export type ExportInput = z.infer<typeof exportInput>

export type ExportResult = { filename: string; content: string; cards: number }

// ── Askesis: study sessions ───────────────────────────────────────────────────

/**
 * - scheduled: today's queue, within daily limits (the normal session)
 * - quick: up to `limit` of today's cards, the ones closest to being forgotten first
 * - new: extra new cards beyond today's limit
 * - ahead: review cards due in the next `aheadDays` days
 * - forgotten: cards you pressed Again on in the last `forgottenDays` days
 * - cram: any cards, answers don't change scheduling
 */
export const STUDY_MODES = ['scheduled', 'quick', 'new', 'ahead', 'forgotten', 'cram'] as const

/**
 * Tag filters match hierarchically: a tag also matches the tags below it
 * ("lang" matches "lang::japanese"), ignoring case. `tags` are required (any
 * or all of them, per `tagMatch`); cards with any of `excludeTags` are left out.
 */
export const studyInput = z.object({
  deckIds: z.array(z.string().uuid()).max(500).default([]),
  tags: z.array(z.string().trim().min(1).max(TAG_MAX)).max(20).default([]),
  tagMatch: z.enum(['any', 'all']).default('any'),
  excludeTags: z.array(z.string().trim().min(1).max(TAG_MAX)).max(20).default([]),
  mode: z.enum(STUDY_MODES).default('scheduled'),
  order: z.enum(['mixed', 'due', 'random']).default('mixed'),
  limit: z.number().int().min(1).max(1_000).default(100),
  aheadDays: z.number().int().min(1).max(365).default(3),
  forgottenDays: z.number().int().min(1).max(365).default(7),
})
export type StudyInput = z.infer<typeof studyInput>

/** What a study selection holds, shown before starting. */
export type StudyPreview = {
  /** Cards in the session as configured (within limits). */
  session: number
  /** Unsuspended cards matching the decks and tag filters, in any state. */
  matching: number
  counts: { new: number; learning: number; review: number }
}

export const undoInput = z.object({ cardId: z.string().uuid() })

// ── Askesis: rewards ──────────────────────────────────────────────────────────

/** A quest id from the dashboard ("2026-10-15:reviews"). */
export const claimQuestInput = z.object({ id: z.string().min(1).max(80) })

export type RewardResult = {
  xp: number
  coins: number
  /** Claiming the day's last quest also pays the all-quests bonus. */
  bonus?: { xp: number; coins: number }
}

export type ChestResult = RewardResult & {
  tier: 'bronze' | 'silver' | 'gold' | 'diamond'
  /** The seventh chest in a row: double rewards. */
  weekly?: boolean
  /** A weekly chest also banks a streak freeze when there's room. */
  freeze?: boolean
}

// ── Askesis: analytics ────────────────────────────────────────────────────────

/** Days of history the analytics page covers, or all of it. */
export const ANALYTICS_RANGES = ['30', '90', '365', 'all'] as const
export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number]

/** GET /me/analytics: a range and, optionally, one deck (with its subdecks). */
export const analyticsQuery = z.object({
  range: z.enum(ANALYTICS_RANGES).default('90'),
  deck: z.string().uuid().optional(),
})
export type AnalyticsQuery = z.infer<typeof analyticsQuery>
