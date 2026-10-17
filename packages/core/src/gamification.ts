import { weekday } from './time.ts'
import type { Achievement, AchievementIcon, AchievementTier, ChestTier, Quest, QuestMetric, Rating, TodayStats } from './types.ts'

// ── XP ────────────────────────────────────────────────────────────────────────
// Honest grading: Hard, Good and Easy pay the same, so XP never rewards
// inflating an answer. Again still pays, because showing up is the habit.

/** Extra XP for each day the daily goal is met. */
export const GOAL_BONUS = 50

/** +1% XP per streak day, up to +50%. */
export function streakMultiplier(streak: number): number {
  return 1 + Math.min(streak, 50) / 100
}

/** XP for one answer: 4 for Again or 8 for a pass, 4 more on a new card, times the streak multiplier. */
export function xpForReview(rating: Rating, firstSight: boolean, streak: number): number {
  const base = (rating === 1 ? 4 : 8) + (firstSight ? 4 : 0)
  return Math.round(base * streakMultiplier(streak))
}

// ── Levels ────────────────────────────────────────────────────────────────────

// Levels grow quadratically: level n starts at 250 × (n − 1)² XP.
const LEVEL_STEP = 250

/** Total XP needed to reach a level (level 1 starts at 0). */
export function xpToReach(level: number): number {
  return LEVEL_STEP * (level - 1) ** 2
}

/** Rank titles, each held from its level until the next rank's. */
export const RANKS: { level: number; title: string }[] = [
  { level: 1, title: 'Spark' },
  { level: 5, title: 'Neuron' },
  { level: 10, title: 'Dendrite' },
  { level: 15, title: 'Synapse' },
  { level: 20, title: 'Circuit' },
  { level: 30, title: 'Cortex' },
  { level: 40, title: 'Hippocampus' },
  { level: 50, title: 'Savant' },
  { level: 65, title: 'Polymath' },
  { level: 80, title: 'Engram' },
]

export interface LevelInfo {
  level: number
  /** The current rank, and the next one (null at the top). */
  title: string
  next: { level: number; title: string } | null
  /** XP earned within this level, XP the level spans, and their ratio (0–1). */
  into: number
  span: number
  progress: number
}

/** Level, rank and progress for a total XP. */
export function levelInfo(totalXp: number): LevelInfo {
  const level = Math.floor(Math.sqrt(totalXp / LEVEL_STEP)) + 1
  const floor = xpToReach(level)
  const span = xpToReach(level + 1) - floor
  const rankIndex = RANKS.findLastIndex((r) => r.level <= level)
  return {
    level,
    title: RANKS[rankIndex]!.title,
    next: RANKS[rankIndex + 1] ?? null,
    into: totalXp - floor,
    span,
    progress: (totalXp - floor) / span,
  }
}

// ── Achievements ──────────────────────────────────────────────────────────────

/**
 * One study day, aggregated. Achievements are evaluated over these in order, one
 * entry per calendar day from the first study day to today (empty days included).
 */
export interface DayAgg {
  date: string
  reviews: number
  passed: number
  graded: number
  newCards: number
  ms: number
  early: number
  late: number
  decks: number
  mature: number
  streak: number
  /** Days since the previous study day (0 when there was none). */
  gap: number
  goalMet: boolean
  /** Correct answers given in under 5 seconds. */
  quick: number
  /** Longest run of answers without an Again reached today; runs carry over between days. */
  run: number
  /** Cards forgotten as reviews that became mature again today. */
  recovered: number
  /** Longest time away, in days, of a card recalled today. */
  recallGap: number
  /** Distinct decks studied so far. */
  decksEver: number
}

interface Running {
  reviews: number
  newCards: number
  hours: number
  early: number
  late: number
  bestDay: number
  bestStreak: number
  bestAccuracy: number
  mostDecks: number
  longestComeback: number
  mature: number
  bestQuick: number
  bestMinutes: number
  bestRun: number
  recovered: number
  recallGap: number
  decksEver: number
  studyDays: number
  goalDays: number
  weekends: number
  /** Most study days in any 30-day window. */
  bestMonth: number
}

interface AchievementDef {
  id: string
  name: string
  description: string
  tier: AchievementTier
  icon: AchievementIcon
  target: number
  secret?: boolean
  measure: (r: Running) => number
}

const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first-spark',
    name: 'First Spark',
    description: 'Finish your first review.',
    tier: 'bronze',
    icon: 'spark',
    target: 1,
    measure: (r) => r.reviews,
  },
  {
    id: '1k',
    name: '1K Club',
    description: '1,000 lifetime reviews.',
    tier: 'bronze',
    icon: 'layers',
    target: 1_000,
    measure: (r) => r.reviews,
  },
  {
    id: 'century',
    name: 'Century',
    description: '100 reviews in a single day.',
    tier: 'bronze',
    icon: 'hundred',
    target: 100,
    measure: (r) => r.bestDay,
  },
  {
    id: 'kindling',
    name: 'Kindling',
    description: 'Keep a 7-day streak.',
    tier: 'bronze',
    icon: 'flame',
    target: 7,
    measure: (r) => r.bestStreak,
  },
  {
    id: 'clockwork',
    name: 'Clockwork',
    description: 'Study on 25 days out of any 30.',
    tier: 'bronze',
    icon: 'cog',
    target: 25,
    measure: (r) => r.bestMonth,
  },
  {
    id: 'weekend-warrior',
    name: 'Weekend Warrior',
    description: 'Study on both days of 10 weekends.',
    tier: 'bronze',
    icon: 'tent',
    target: 10,
    measure: (r) => r.weekends,
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Study 5 different decks.',
    tier: 'bronze',
    icon: 'compass',
    target: 5,
    measure: (r) => r.decksEver,
  },
  {
    id: 'sprout',
    name: 'Sprout',
    description: '100 mature cards at once.',
    tier: 'bronze',
    icon: 'sprout',
    target: 100,
    measure: (r) => r.mature,
  },
  {
    id: 'second-wind',
    name: 'Second Wind',
    description: 'Bring a forgotten card back to mature.',
    tier: 'bronze',
    icon: 'revive',
    target: 1,
    measure: (r) => r.recovered,
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: '500 reviews before 8 AM.',
    tier: 'bronze',
    icon: 'sunrise',
    target: 500,
    measure: (r) => r.early,
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: '500 reviews after 11 PM.',
    tier: 'bronze',
    icon: 'moon',
    target: 500,
    measure: (r) => r.late,
  },
  {
    id: 'comeback',
    name: 'Comeback',
    description: 'Return after a break of a week or more.',
    tier: 'bronze',
    icon: 'rebound',
    target: 7,
    secret: true,
    measure: (r) => r.longestComeback,
  },
  {
    id: 'wildfire',
    name: 'Wildfire',
    description: 'Keep a 30-day streak.',
    tier: 'silver',
    icon: 'fire',
    target: 30,
    measure: (r) => r.bestStreak,
  },
  {
    id: '10k',
    name: '10K Club',
    description: '10,000 lifetime reviews.',
    tier: 'silver',
    icon: 'layers',
    target: 10_000,
    measure: (r) => r.reviews,
  },
  {
    id: 'deep-roots',
    name: 'Deep Roots',
    description: '500 mature cards at once.',
    tier: 'silver',
    icon: 'tree',
    target: 500,
    measure: (r) => r.mature,
  },
  {
    id: 'sharpshooter',
    name: 'Sharpshooter',
    description: '95% recall over 100+ review cards in a day.',
    tier: 'silver',
    icon: 'target',
    target: 95,
    measure: (r) => r.bestAccuracy,
  },
  {
    id: 'on-a-roll',
    name: 'On a Roll',
    description: '100 answers in a row without an Again.',
    tier: 'silver',
    icon: 'zap',
    target: 100,
    measure: (r) => r.bestRun,
  },
  {
    id: 'quick-draw',
    name: 'Quick Draw',
    description: '100 correct answers under 5 seconds in a day.',
    tier: 'silver',
    icon: 'timer',
    target: 100,
    measure: (r) => r.bestQuick,
  },
  {
    id: 'deep-focus',
    name: 'Deep Focus',
    description: '60 minutes of review in a single day.',
    tier: 'silver',
    icon: 'headphones',
    target: 60,
    measure: (r) => r.bestMinutes,
  },
  {
    id: 'goal-getter',
    name: 'Goal Getter',
    description: 'Hit your daily goal on 100 days.',
    tier: 'silver',
    icon: 'flag',
    target: 100,
    measure: (r) => r.goalDays,
  },
  {
    id: 'lexicon',
    name: 'Lexicon',
    description: 'Learn 1,000 new cards.',
    tier: 'silver',
    icon: 'book',
    target: 1_000,
    measure: (r) => r.newCards,
  },
  {
    id: 'polymath',
    name: 'Polymath',
    description: 'Study 6 decks in one day.',
    tier: 'silver',
    icon: 'shuffle',
    target: 6,
    measure: (r) => r.mostDecks,
  },
  {
    id: 'eternal-flame',
    name: 'Eternal Flame',
    description: 'Keep a 100-day streak.',
    tier: 'gold',
    icon: 'infinity',
    target: 100,
    measure: (r) => r.bestStreak,
  },
  {
    id: 'unbroken',
    name: 'Unbroken',
    description: 'Keep a 180-day streak.',
    tier: 'gold',
    icon: 'chain',
    target: 180,
    measure: (r) => r.bestStreak,
  },
  {
    id: 'marathon',
    name: 'Marathon',
    description: '400 reviews in a single day.',
    tier: 'gold',
    icon: 'run',
    target: 400,
    measure: (r) => r.bestDay,
  },
  {
    id: '50k',
    name: '50K Club',
    description: '50,000 lifetime reviews.',
    tier: 'gold',
    icon: 'layers',
    target: 50_000,
    measure: (r) => r.reviews,
  },
  {
    id: 'scholar',
    name: 'Scholar',
    description: '250 hours of focused review.',
    tier: 'gold',
    icon: 'hourglass',
    target: 250,
    measure: (r) => r.hours,
  },
  {
    id: 'devotion',
    name: 'Devotion',
    description: 'Study on 300 different days.',
    tier: 'gold',
    icon: 'calendar',
    target: 300,
    measure: (r) => r.studyDays,
  },
  {
    id: 'encyclopedic',
    name: 'Encyclopedic',
    description: 'Learn 10,000 new cards.',
    tier: 'gold',
    icon: 'book',
    target: 10_000,
    measure: (r) => r.newCards,
  },
  {
    id: 'ltp',
    name: 'Long-Term Potentiation',
    description: '2,000 mature cards at once.',
    tier: 'gold',
    icon: 'network',
    target: 2_000,
    measure: (r) => r.mature,
  },
  {
    id: 'phoenix',
    name: 'Phoenix',
    description: 'Bring 1,000 forgotten cards back to mature.',
    tier: 'gold',
    icon: 'revive',
    target: 1_000,
    measure: (r) => r.recovered,
  },
  {
    id: '100k',
    name: '100K Club',
    description: '100,000 lifetime reviews.',
    tier: 'platinum',
    icon: 'mountain',
    target: 100_000,
    measure: (r) => r.reviews,
  },
  {
    id: 'engram',
    name: 'Engram',
    description: '10,000 mature cards at once.',
    tier: 'platinum',
    icon: 'network',
    target: 10_000,
    measure: (r) => r.mature,
  },
  {
    id: 'year',
    name: 'Year of Recall',
    description: 'Keep a 365-day streak.',
    tier: 'platinum',
    icon: 'crown',
    target: 365,
    measure: (r) => r.bestStreak,
  },
  {
    id: 'thousand-days',
    name: 'Thousand Days',
    description: 'Study on 1,000 different days.',
    tier: 'platinum',
    icon: 'calendar',
    target: 1_000,
    measure: (r) => r.studyDays,
  },
  {
    id: 'time-capsule',
    name: 'Time Capsule',
    description: 'Recall a card after a year away.',
    tier: 'platinum',
    icon: 'telescope',
    target: 365,
    measure: (r) => r.recallGap,
  },
]

/** Every achievement with its current value and the day it unlocked (null if still locked). */
export function evaluateAchievements(days: DayAgg[]): Achievement[] {
  const r: Running = {
    reviews: 0,
    newCards: 0,
    hours: 0,
    early: 0,
    late: 0,
    bestDay: 0,
    bestStreak: 0,
    bestAccuracy: 0,
    mostDecks: 0,
    longestComeback: 0,
    mature: 0,
    bestQuick: 0,
    bestMinutes: 0,
    bestRun: 0,
    recovered: 0,
    recallGap: 0,
    decksEver: 0,
    studyDays: 0,
    goalDays: 0,
    weekends: 0,
    bestMonth: 0,
  }
  const unlocked = new Map<string, string>()
  let month = 0

  for (const [i, day] of days.entries()) {
    r.reviews += day.reviews
    r.newCards += day.newCards
    r.hours += day.ms / 3_600_000
    r.early += day.early
    r.late += day.late
    r.bestDay = Math.max(r.bestDay, day.reviews)
    r.bestStreak = Math.max(r.bestStreak, day.streak)
    r.mostDecks = Math.max(r.mostDecks, day.decks)
    r.mature = day.mature
    if (day.reviews > 0) r.longestComeback = Math.max(r.longestComeback, day.gap)
    if (day.graded >= 100) {
      r.bestAccuracy = Math.max(r.bestAccuracy, Math.floor((day.passed / day.graded) * 100))
    }
    r.bestQuick = Math.max(r.bestQuick, day.quick)
    r.bestMinutes = Math.max(r.bestMinutes, Math.floor(day.ms / 60_000))
    r.bestRun = Math.max(r.bestRun, day.run)
    r.recovered += day.recovered
    r.recallGap = Math.max(r.recallGap, day.recallGap)
    r.decksEver = day.decksEver
    if (day.goalMet) r.goalDays += 1
    if (day.reviews > 0) {
      r.studyDays += 1
      // Sunday, with the Saturday before it studied too.
      if (weekday(day.date) === 6 && (days[i - 1]?.reviews ?? 0) > 0) r.weekends += 1
    }
    // Study days in the trailing 30-day window.
    month += (day.reviews > 0 ? 1 : 0) - ((days[i - 30]?.reviews ?? 0) > 0 ? 1 : 0)
    r.bestMonth = Math.max(r.bestMonth, month)
    for (const def of ACHIEVEMENTS) {
      if (!unlocked.has(def.id) && def.measure(r) >= def.target) unlocked.set(def.id, day.date)
    }
  }

  return ACHIEVEMENTS.map((def) => ({
    id: def.id,
    name: def.name,
    description: def.description,
    tier: def.tier,
    icon: def.icon,
    target: def.target,
    value: Math.floor(def.measure(r)),
    unlockedAt: unlocked.get(def.id) ?? null,
    secret: def.secret ?? false,
  }))
}

// ── Daily quests ──────────────────────────────────────────────────────────────

interface QuestDef {
  metric: QuestMetric
  targets: number[]
  xp: number
  coins: number
  title: (n: number) => string
  /** The smallest target worth offering. */
  min: number
}

const QUEST_POOL: QuestDef[] = [
  { metric: 'reviews', targets: [80, 100, 120, 150], xp: 40, coins: 15, min: 10, title: (n) => `Review ${n} cards` },
  { metric: 'newCards', targets: [10, 15, 20], xp: 30, coins: 15, min: 3, title: (n) => `Learn ${n} new cards` },
  { metric: 'decks', targets: [2, 3, 4], xp: 25, coins: 10, min: 2, title: (n) => `Study ${n} different decks` },
  { metric: 'minutes', targets: [10, 15, 20], xp: 35, coins: 15, min: 5, title: (n) => `Study for ${n} minutes` },
  { metric: 'correct', targets: [40, 60, 80], xp: 35, coins: 15, min: 10, title: (n) => `Answer ${n} cards right` },
  { metric: 'xp', targets: [300, 500, 800], xp: 30, coins: 20, min: 100, title: (n) => `Earn ${n} XP from reviews` },
  { metric: 'mature', targets: [15, 25, 40], xp: 30, coins: 15, min: 5, title: (n) => `Review ${n} mature cards` },
  { metric: 'young', targets: [20, 30, 50], xp: 30, coins: 15, min: 5, title: (n) => `Review ${n} young cards` },
  { metric: 'run', targets: [15, 25, 40], xp: 35, coins: 15, min: 10, title: (n) => `Answer ${n} in a row without Again` },
  { metric: 'quick', targets: [20, 40, 60], xp: 30, coins: 15, min: 10, title: (n) => `Answer ${n} right in under 5 seconds` },
]

/** A quest's title for a target, e.g. "Review 80 cards". */
export function questTitle(metric: QuestMetric, target: number): string {
  return QUEST_POOL.find((q) => q.metric === metric)!.title(target)
}

/** Quests offered per day, from a pool of ten; "Review N cards" comes first. */
export const QUESTS_PER_DAY = 6
/** Collecting every quest of the day pays this on top. */
export const QUEST_BONUS = { xp: 50, coins: 30 }

/** Today's progress toward a quest's target. */
export function questProgress(metric: QuestMetric, stats: TodayStats): number {
  switch (metric) {
    case 'reviews':
      return stats.reviews
    case 'newCards':
      return stats.newCards
    case 'decks':
      return stats.decks.length
    case 'minutes':
      return Math.floor(stats.minutes)
    case 'correct':
      return stats.correct
    case 'xp':
      return stats.xp
    case 'mature':
      return stats.mature
    case 'young':
      return stats.young
    case 'run':
      return stats.run
    case 'quick':
      return stats.quick
  }
}

/** What today's cards make possible, so a small collection never gets an impossible quest. */
export interface QuestCapacity {
  reviews: number
  newCards: number
  decks: number
  mature: number
  young: number
  secondsPerReview: number
}

/**
 * The largest target today's cards can support. Metrics about answers are
 * estimated from the review count: 80% right, a run of 60%, half answered
 * quickly, 9 XP per answer.
 */
function questCap(metric: QuestMetric, c: QuestCapacity): number {
  // Rounded down to tens; below 10, the number itself.
  const tens = (n: number) => Math.floor(n / 10) * 10 || n
  switch (metric) {
    case 'reviews':
      return tens(c.reviews)
    case 'newCards':
      return c.newCards
    case 'decks':
      return c.decks
    case 'minutes':
      return Math.floor((c.reviews * c.secondsPerReview) / 60)
    case 'correct':
      return tens(Math.floor(c.reviews * 0.8))
    case 'xp':
      return Math.floor((c.reviews * 9) / 100) * 100
    case 'mature':
      return c.mature
    case 'young':
      return c.young
    case 'run':
      return tens(Math.floor(c.reviews * 0.6))
    case 'quick':
      return tens(Math.floor(c.reviews * 0.5))
  }
}

/**
 * Today's quests, picked deterministically from the date so they stay put on
 * reload: "Review N cards" first, then the rest of the pool in a shuffled order
 * until there are QUESTS_PER_DAY. Each target is capped at what today's cards
 * allow, and a quest whose cap falls below its minimum is skipped. `claimed`
 * holds the metrics already collected today.
 */
export function dailyQuests(
  today: string,
  stats: TodayStats,
  capacity: QuestCapacity,
  claimed: ReadonlySet<string> = new Set(),
): Quest[] {
  let seed = [...today].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)
  const next = () => {
    // xorshift: small, fast and stable across platforms.
    seed ^= seed << 13
    seed ^= seed >>> 17
    seed ^= seed << 5
    seed >>>= 0
    return seed
  }
  // Fisher-Yates shuffle of everything after "reviews".
  const others = QUEST_POOL.slice(1)
  for (let i = others.length - 1; i > 0; i--) {
    const j = next() % (i + 1)
    ;[others[i], others[j]] = [others[j]!, others[i]!]
  }
  const quests: Quest[] = []
  for (const q of [QUEST_POOL[0]!, ...others]) {
    if (quests.length === QUESTS_PER_DAY) break
    const target = Math.min(q.targets[next() % q.targets.length]!, questCap(q.metric, capacity))
    if (target < q.min) continue
    quests.push({
      id: `${today}:${q.metric}`,
      title: q.title(target),
      metric: q.metric,
      target,
      xp: q.xp,
      coins: q.coins,
      progress: questProgress(q.metric, stats),
      claimed: claimed.has(q.metric),
    })
  }
  return quests
}

/** Today's quests from the saved offers, with live progress. */
export function questsFromOffers(
  today: string,
  offers: { metric: QuestMetric; target: number; xp: number; coins: number }[],
  stats: TodayStats,
  claimed: ReadonlySet<string>,
): Quest[] {
  return offers.map((o) => ({
    id: `${today}:${o.metric}`,
    title: questTitle(o.metric, o.target),
    metric: o.metric,
    target: o.target,
    xp: o.xp,
    coins: o.coins,
    progress: questProgress(o.metric, stats),
    claimed: claimed.has(o.metric),
  }))
}

// ── Coins, chests and streak freezes ──────────────────────────────────────────
//
// Coins come from the daily chest, claimed quests, lucky finds, the welcome
// bonus and every day the daily goal is met. Chest, quest, drop and welcome
// rewards are stored as they happen; goal coins are derived from the review
// history like XP. Every account starts with one streak freeze; after that,
// freezes come from weekly chests.

/** Coins for each day the daily goal was met. */
export const GOAL_COINS = 10
/** Given once, when an account is created (labelled, so the head start has a reason). */
export const WELCOME_BONUS = { xp: 100, coins: 50 }
/** Any answer has this chance of turning up a few coins: a small surprise, never a grind. */
export const LUCKY_DROP = { chance: 1 / 25, coins: [5, 20] as [number, number] }
/** Opening the chest this many days in a row makes the last one a weekly chest. */
export const CHEST_WEEK = 7
/** Streak freezes the bank holds; a weekly chest adds one while there's room. */
export const MAX_FREEZES = 2

/** Coins found on one answer, or null (most of the time). */
export function rollLuckyDrop(random: () => number = Math.random): number | null {
  if (random() >= LUCKY_DROP.chance) return null
  const [lo, hi] = LUCKY_DROP.coins
  return lo + Math.floor(random() * (hi - lo + 1))
}

/** Chest tiers by the streak they need, with their XP and coin ranges (inclusive). */
export const CHEST_TIERS: { tier: ChestTier; streak: number; xp: [number, number]; coins: [number, number] }[] = [
  { tier: 'bronze', streak: 0, xp: [20, 40], coins: [10, 20] },
  { tier: 'silver', streak: 7, xp: [40, 70], coins: [20, 35] },
  { tier: 'gold', streak: 30, xp: [60, 100], coins: [35, 55] },
  { tier: 'diamond', streak: 100, xp: [100, 160], coins: [60, 90] },
]

/** The best chest tier a streak has reached. */
export function chestTier(streak: number): ChestTier {
  return CHEST_TIERS.findLast((t) => streak >= t.streak)!.tier
}

/** The next tier up and the streak it needs; null at the top. */
export function nextChestTier(streak: number): { tier: ChestTier; streak: number } | null {
  const next = CHEST_TIERS.find((t) => t.streak > streak)
  return next ? { tier: next.tier, streak: next.streak } : null
}

/** What a chest of this tier holds (doubled for a weekly chest); `random` returns [0, 1). */
export function rollChest(tier: ChestTier, weekly = false, random: () => number = Math.random): { xp: number; coins: number } {
  const t = CHEST_TIERS.find((c) => c.tier === tier)!
  const pick = ([lo, hi]: [number, number]) => (lo + Math.floor(random() * (hi - lo + 1))) * (weekly ? 2 : 1)
  return { xp: pick(t.xp), coins: pick(t.coins) }
}
