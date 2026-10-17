import { sql } from 'drizzle-orm'
import {
  bigserial,
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core'
import { user } from './auth.ts'

// Study data: decks that share an options preset, cards with a
// scheduling state, and a review log.

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}

/** Per-user study settings (one row per user). */
export const userSettings = pgTable('user_settings', {
  userId: text('user_id')
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  /** Answers per study day that meet the daily goal. */
  dailyGoal: integer('daily_goal').notNull().default(100),
  /** Hour the study day rolls over ("next day starts at"). */
  rolloverHour: smallint('rollover_hour').notNull().default(4),
  learnAheadMinutes: smallint('learn_ahead_minutes').notNull().default(20),
  timeZone: text('time_zone').notNull().default('UTC'),
  /** Streak freezes in the bank; one covers one missed day. */
  streakFreezes: smallint('streak_freezes').notNull().default(1),
  /** Local hour for the daily push reminder (6 AM by default); null sends it when the study day resets. */
  reminderHour: smallint('reminder_hour').default(6),
  ...timestamps,
})

/**
 * A deck options preset (also known as an option group). Defaults match
 * DEFAULT_PRESET in @askesis/contracts.
 */
export const deckPreset = pgTable(
  'deck_preset',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    isDefault: boolean('is_default').notNull().default(false),
    // Daily limits
    newPerDay: integer('new_per_day').notNull().default(20),
    reviewsPerDay: integer('reviews_per_day').notNull().default(200),
    // New cards
    learningSteps: text('learning_steps')
      .array()
      .notNull()
      .default(sql`'{1m,10m}'::text[]`),
    graduatingInterval: integer('graduating_interval').notNull().default(1),
    easyInterval: integer('easy_interval').notNull().default(4),
    newCardOrder: text('new_card_order', { enum: ['sequential', 'random'] })
      .notNull()
      .default('sequential'),
    // Lapses
    relearningSteps: text('relearning_steps')
      .array()
      .notNull()
      .default(sql`'{10m}'::text[]`),
    minimumInterval: integer('minimum_interval').notNull().default(1),
    leechThreshold: integer('leech_threshold').notNull().default(8),
    leechAction: text('leech_action', { enum: ['tag', 'suspend'] })
      .notNull()
      .default('tag'),
    // Advanced (SM-2)
    maximumInterval: integer('maximum_interval').notNull().default(36_500),
    startingEase: real('starting_ease').notNull().default(2.5),
    easyBonus: real('easy_bonus').notNull().default(1.3),
    intervalModifier: real('interval_modifier').notNull().default(1),
    hardInterval: real('hard_interval').notNull().default(1.2),
    newInterval: real('new_interval').notNull().default(0),
    // FSRS
    fsrs: boolean('fsrs').notNull().default(false),
    desiredRetention: real('desired_retention').notNull().default(0.9),
    ...timestamps,
  },
  (t) => [
    index('deck_preset_user_idx').on(t.userId),
    // At most one default preset per user.
    uniqueIndex('deck_preset_one_default_idx')
      .on(t.userId)
      .where(sql`${t.isDefault}`),
  ],
)

/** Decks nest through `parentId` ("Parent::Child"); deleting one deletes its subdecks and their cards. */
export const deck = pgTable(
  'deck',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    parentId: uuid('parent_id').references((): AnyPgColumn => deck.id, { onDelete: 'cascade' }),
    // A preset in use can't be deleted; the API moves its decks to the default preset first.
    presetId: uuid('preset_id')
      .notNull()
      .references(() => deckPreset.id, { onDelete: 'restrict' }),
    name: text('name').notNull(),
    description: text('description').notNull().default(''),
    /** One of the DeckIcon names in @askesis/core. */
    icon: text('icon').notNull().default('book'),
    position: integer('position').notNull().default(0),
    ...timestamps,
  },
  (t) => [index('deck_user_idx').on(t.userId), index('deck_parent_idx').on(t.parentId)],
)

export const card = pgTable(
  'card',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    deckId: uuid('deck_id')
      .notNull()
      .references(() => deck.id, { onDelete: 'cascade' }),
    front: text('front').notNull(),
    back: text('back').notNull(),
    hint: text('hint'),
    extra: text('extra'),
    tags: text('tags')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    /** Order new cards are introduced in. */
    position: integer('position').notNull().default(0),
    suspended: boolean('suspended').notNull().default(false),
    /** Buried cards are hidden until the next study day. */
    buriedUntil: timestamp('buried_until', { withTimezone: true }),
    // Scheduling state (see Memory in @askesis/core). 0 new, 1 learning, 2 review, 3 relearning.
    state: smallint('state').notNull().default(0),
    due: timestamp('due', { withTimezone: true }).notNull().defaultNow(),
    interval: integer('interval').notNull().default(0),
    ease: real('ease').notNull().default(0),
    stability: real('stability').notNull().default(0),
    difficulty: real('difficulty').notNull().default(0),
    step: smallint('step').notNull().default(0),
    reps: integer('reps').notNull().default(0),
    lapses: integer('lapses').notNull().default(0),
    lastReview: timestamp('last_review', { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index('card_user_due_idx').on(t.userId, t.due), index('card_deck_state_idx').on(t.deckId, t.state, t.due)],
)

/** One row per answer. Stats, streaks, XP and the heatmap are all derived from it. */
export const reviewLog = pgTable(
  'review_log',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    cardId: uuid('card_id')
      .notNull()
      .references(() => card.id, { onDelete: 'cascade' }),
    deckId: uuid('deck_id')
      .notNull()
      .references(() => deck.id, { onDelete: 'cascade' }),
    /** 1 Again, 2 Hard, 3 Good, 4 Easy. */
    rating: smallint('rating').notNull(),
    stateBefore: smallint('state_before').notNull(),
    stateAfter: smallint('state_after').notNull(),
    intervalBefore: integer('interval_before').notNull(),
    intervalAfter: integer('interval_after').notNull(),
    easeAfter: real('ease_after').notNull(),
    durationMs: integer('duration_ms').notNull(),
    /** The card's full scheduling state before this answer, so it can be undone. */
    memoryBefore: jsonb('memory_before'),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('review_log_user_time_idx').on(t.userId, t.reviewedAt), index('review_log_card_idx').on(t.cardId)],
)

/**
 * XP and coins that don't come from the review log: the daily chest, quests and
 * the all-quests bonus, lucky finds, and the welcome bonus. The unique index on
 * (user, day, kind, key) makes sure nothing is claimed twice.
 */
export const reward = pgTable(
  'reward',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    /** Study day (YYYY-MM-DD in the user's time zone). */
    day: text('day').notNull(),
    /** chest | quest | drop | welcome (RewardKind in @askesis/core). */
    kind: text('kind').notNull(),
    /** "daily" for the chest, the quest metric or "bonus", "review:<log id>" for a lucky find, "welcome". */
    key: text('key').notNull(),
    xp: integer('xp').notNull().default(0),
    coins: integer('coins').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('reward_once_idx').on(t.userId, t.day, t.kind, t.key)],
)

/** The quests offered on a study day, saved when first shown so they stay put all day. */
export const dailyQuest = pgTable(
  'daily_quest',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    day: text('day').notNull(),
    metric: text('metric').notNull(),
    target: integer('target').notNull(),
    xp: integer('xp').notNull(),
    coins: integer('coins').notNull(),
    /** Display order. */
    position: smallint('position').notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.userId, t.day, t.metric] })],
)

/** Days a streak freeze was spent on. */
export const streakFreeze = pgTable(
  'streak_freeze',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    day: text('day').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.day] })],
)

/** A browser/device subscribed to Web Push (one row per installed app or browser). */
export const pushSubscription = pgTable(
  'push_subscription',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    endpoint: text('endpoint').notNull().unique(),
    p256dh: text('p256dh').notNull(),
    auth: text('auth').notNull(),
    userAgent: text('user_agent'),
    /** Study day the last daily reminder went out for, so each day sends once. */
    lastSentDay: text('last_sent_day'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('push_subscription_user_idx').on(t.userId)],
)
