import { DEFAULT_PRESET, DEFAULT_USER_SETTINGS, type DeckPreset, type DeckPresetInput } from '@askesis/contracts'
import {
  addDays,
  type CardKind,
  type Collection,
  type Dashboard,
  type DayConfig,
  type DeckIcon,
  dayKey,
  type Memory,
  type QuestMetric,
  type RewardKind,
  type SchedulerPreset,
  STARTER_DECKS,
  WELCOME_BONUS,
} from '@askesis/core'
import { and, asc, eq, schema } from '@askesis/db'
import { db } from './db.ts'
import { newIdentifiers } from './identifiers.ts'

const { userSettings, deckPreset, deck, card, reviewLog, streakFreeze, reward, dailyQuest } = schema

type CardRow = typeof card.$inferSelect
type PresetRow = typeof deckPreset.$inferSelect
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]

// ── Row mapping ───────────────────────────────────────────────────────────────

/** A card row's scheduling state. */
export function toMemory(row: CardRow): Memory {
  return {
    state: row.state as Memory['state'],
    due: row.due,
    interval: row.interval,
    ease: row.ease,
    stability: row.stability,
    difficulty: row.difficulty,
    step: row.step,
    reps: row.reps,
    lapses: row.lapses,
    lastReview: row.lastReview,
  }
}

/** The card columns that store a Memory, for inserts and updates. */
export function memoryColumns(m: Memory) {
  return {
    state: m.state,
    due: m.due,
    interval: m.interval,
    ease: m.ease,
    stability: m.stability,
    difficulty: m.difficulty,
    step: m.step,
    reps: m.reps,
    lapses: m.lapses,
    lastReview: m.lastReview,
  }
}

export function toPreset(row: PresetRow): DeckPreset {
  return {
    id: row.id,
    isDefault: row.isDefault,
    name: row.name,
    newPerDay: row.newPerDay,
    reviewsPerDay: row.reviewsPerDay,
    learningSteps: row.learningSteps,
    graduatingInterval: row.graduatingInterval,
    easyInterval: row.easyInterval,
    newCardOrder: row.newCardOrder,
    relearningSteps: row.relearningSteps,
    minimumInterval: row.minimumInterval,
    leechThreshold: row.leechThreshold,
    leechAction: row.leechAction,
    maximumInterval: row.maximumInterval,
    startingEase: row.startingEase,
    easyBonus: row.easyBonus,
    intervalModifier: row.intervalModifier,
    hardInterval: row.hardInterval,
    newInterval: row.newInterval,
    fsrs: row.fsrs,
    desiredRetention: row.desiredRetention,
  }
}

/**
 * The review log stores states and intervals; the dashboard wants buckets.
 * A review card is mature from a 21-day interval.
 */
function kindOf(state: number, interval: number): CardKind {
  if (state === 0) return 'new'
  if (state === 1 || state === 3) return 'learning'
  return interval >= 21 ? 'mature' : 'young'
}

// ── Setup ─────────────────────────────────────────────────────────────────────

export function isTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz })
    return true
  } catch {
    return false
  }
}

/**
 * Creates settings, the default preset and starter decks the first time a user
 * shows up, and returns the settings row. `timeZone` is the device's zone,
 * sent by the web app as a cookie.
 */
export async function ensureSetup(userId: string, timeZone?: string) {
  const [existing] = await db.select().from(userSettings).where(eq(userSettings.userId, userId))
  if (existing) return existing

  return db.transaction(async (tx) => {
    const [settings] = await tx
      .insert(userSettings)
      .values({
        userId,
        ...DEFAULT_USER_SETTINGS,
        timeZone: timeZone && isTimeZone(timeZone) ? timeZone : DEFAULT_USER_SETTINGS.timeZone,
      })
      .onConflictDoNothing()
      .returning()
    // Another request won the race and set everything up.
    if (!settings) return (await tx.select().from(userSettings).where(eq(userSettings.userId, userId)))[0]!

    const [preset] = await tx
      .insert(deckPreset)
      .values({ userId, ...DEFAULT_PRESET, isDefault: true })
      .returning({ id: deckPreset.id })
    for (const [i, starter] of STARTER_DECKS.entries()) {
      const [created] = await tx
        .insert(deck)
        .values({
          userId,
          presetId: preset!.id,
          name: starter.name,
          description: starter.description,
          icon: starter.icon,
          position: i,
        })
        .returning({ id: deck.id })
      const identifiers = await newIdentifiers(tx, userId, starter.cards.length)
      await tx.insert(card).values(
        starter.cards.map((c, position) => ({
          userId,
          deckId: created!.id,
          identifier: identifiers[position]!,
          ...c,
          position,
        })),
      )
    }
    // A labelled head start, so a new account's level bar isn't empty.
    await tx
      .insert(reward)
      .values({ userId, day: dayKey(new Date(), dayConfig(settings)), kind: 'welcome', key: 'welcome', ...WELCOME_BONUS })
    return settings
  })
}

export function dayConfig(settings: { timeZone: string; rolloverHour: number }): DayConfig {
  return { timeZone: settings.timeZone, rolloverHour: settings.rolloverHour }
}

// ── Loading ───────────────────────────────────────────────────────────────────

/**
 * Everything @askesis/core needs to build one user's dashboard or analytics.
 * Spends banked streak freezes on missed days along the way.
 */
export async function loadCollection(userId: string, timeZone?: string, now = new Date()): Promise<Collection> {
  let settings = await ensureSetup(userId, timeZone)
  const cfg = dayConfig(settings)

  const today = dayKey(now, cfg)
  const [presets, decks, cards, logs, freezes, rewards, offers] = await Promise.all([
    db.select().from(deckPreset).where(eq(deckPreset.userId, userId)),
    db.select().from(deck).where(eq(deck.userId, userId)).orderBy(asc(deck.position), asc(deck.name)),
    db.select().from(card).where(eq(card.userId, userId)),
    db
      .select({
        t: reviewLog.reviewedAt,
        cardId: reviewLog.cardId,
        deckId: reviewLog.deckId,
        rating: reviewLog.rating,
        stateBefore: reviewLog.stateBefore,
        intervalBefore: reviewLog.intervalBefore,
        stateAfter: reviewLog.stateAfter,
        intervalAfter: reviewLog.intervalAfter,
        ms: reviewLog.durationMs,
      })
      .from(reviewLog)
      .where(eq(reviewLog.userId, userId))
      .orderBy(asc(reviewLog.reviewedAt)),
    db.select({ day: streakFreeze.day }).from(streakFreeze).where(eq(streakFreeze.userId, userId)),
    db
      .select({ day: reward.day, kind: reward.kind, key: reward.key, xp: reward.xp, coins: reward.coins })
      .from(reward)
      .where(eq(reward.userId, userId))
      .orderBy(asc(reward.id)),
    db
      .select({ metric: dailyQuest.metric, target: dailyQuest.target, xp: dailyQuest.xp, coins: dailyQuest.coins })
      .from(dailyQuest)
      .where(and(eq(dailyQuest.userId, userId), eq(dailyQuest.day, today)))
      .orderBy(asc(dailyQuest.position)),
  ])

  const freezeDays = freezes.map((f) => f.day)
  const spent = await spendFreezesIfNeeded(userId, settings.streakFreezes, logs, freezeDays, now, cfg)
  if (spent.length) {
    freezeDays.push(...spent)
    settings = { ...settings, streakFreezes: settings.streakFreezes - spent.length }
  }

  const presetById = new Map(presets.map((p) => [p.id, p]))
  return {
    now,
    day: cfg,
    dailyGoal: settings.dailyGoal,
    decks: decks.map((d) => {
      const preset = presetById.get(d.presetId)!
      return {
        id: d.id,
        name: d.name,
        parentId: d.parentId,
        icon: d.icon as DeckIcon,
        presetId: d.presetId,
        newPerDay: preset.newPerDay,
        reviewsPerDay: preset.reviewsPerDay,
      }
    }),
    presets: Object.fromEntries(presets.map((p) => [p.id, schedulerPreset(toPreset(p))])),
    cards: cards.map((c) => ({
      id: c.id,
      deckId: c.deckId,
      // A buried card isn't due again until its bury ends.
      memory:
        c.buriedUntil && c.buriedUntil > now && c.buriedUntil > c.due ? { ...toMemory(c), due: c.buriedUntil } : toMemory(c),
      suspended: c.suspended,
      position: c.position,
      createdAt: c.createdAt.getTime(),
      content: { front: c.front, back: c.back, hint: c.hint ?? undefined, extra: c.extra ?? undefined },
    })),
    logs: logs.map((l) => ({
      t: l.t.getTime(),
      cardId: l.cardId,
      deckId: l.deckId,
      rating: l.rating as 1 | 2 | 3 | 4,
      kind: kindOf(l.stateBefore, l.intervalBefore),
      matureAfter: l.stateAfter === 2 && l.intervalAfter >= 21,
      ms: l.ms,
    })),
    freezes: freezeDays,
    freezesLeft: settings.streakFreezes,
    rewards: rewards.map((r) => ({ ...r, kind: r.kind as RewardKind })),
    questOffers: offers.map((o) => ({ ...o, metric: o.metric as QuestMetric })),
  }
}

/**
 * Saves today's quests the first time they're offered, so their targets stay
 * the same all day even as learning steps add reviews.
 */
export async function saveQuestOffers(userId: string, col: Collection, dash: Dashboard) {
  if (col.questOffers?.length || dash.quests.length === 0 || dash.isDemo) return
  await db
    .insert(dailyQuest)
    .values(
      dash.quests.map((q, position) => ({
        userId,
        day: dash.today,
        metric: q.metric,
        target: q.target,
        xp: q.xp,
        coins: q.coins,
        position,
      })),
    )
    .onConflictDoNothing()
}

/** The preset fields the scheduler reads. */
export function schedulerPreset(p: DeckPresetInput): SchedulerPreset {
  return {
    learningSteps: p.learningSteps,
    graduatingInterval: p.graduatingInterval,
    easyInterval: p.easyInterval,
    relearningSteps: p.relearningSteps,
    minimumInterval: p.minimumInterval,
    maximumInterval: p.maximumInterval,
    startingEase: p.startingEase,
    easyBonus: p.easyBonus,
    intervalModifier: p.intervalModifier,
    hardInterval: p.hardInterval,
    newInterval: p.newInterval,
    fsrs: p.fsrs,
    desiredRetention: p.desiredRetention,
  }
}

/**
 * Spends banked freezes on the days missed since the last study day, when there
 * are enough of them to keep the streak alive (otherwise they stay banked).
 * Runs lazily when the collection loads, so no scheduled job is needed, and
 * covers several missed days even if the app wasn't opened in between.
 */
async function spendFreezesIfNeeded(
  userId: string,
  banked: number,
  logs: { t: Date }[],
  freezeDays: string[],
  now: Date,
  cfg: DayConfig,
): Promise<string[]> {
  if (banked <= 0 || logs.length === 0) return []
  const today = dayKey(now, cfg)
  const studied = new Set(logs.map((l) => dayKey(l.t, cfg)))
  const covered = (day: string) => studied.has(day) || freezeDays.includes(day)
  const missed: string[] = []
  let day = addDays(today, -1)
  while (!covered(day)) {
    missed.push(day)
    // A gap longer than the bank can't be saved; nothing before the first review counts.
    if (missed.length > banked || day <= dayKey(logs[0]!.t, cfg)) return []
    day = addDays(day, -1)
  }
  if (missed.length === 0) return []

  // A concurrent load may spend the same days: only rows actually inserted here
  // are taken from the bank.
  return db.transaction(async (tx: Tx) => {
    const rows = await tx
      .insert(streakFreeze)
      .values(missed.map((d) => ({ userId, day: d })))
      .onConflictDoNothing()
      .returning({ day: streakFreeze.day })
    if (rows.length > 0) {
      await tx
        .update(userSettings)
        .set({ streakFreezes: banked - rows.length })
        .where(eq(userSettings.userId, userId))
    }
    return rows.map((r) => r.day)
  })
}
