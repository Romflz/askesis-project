import type { Collection, ReviewEntry } from './collection.ts'
import {
  chestTier,
  dailyQuests,
  type DayAgg,
  evaluateAchievements,
  CHEST_WEEK,
  GOAL_BONUS,
  GOAL_COINS,
  MAX_FREEZES,
  nextChestTier,
  QUEST_BONUS,
  questsFromOffers,
  xpForReview,
} from './gamification.ts'
import { cardKind, isLearning, isMature, retrievability } from './schedule.ts'
import { addDays, DAY_MS, dayKey, daysBetween, dayStart, hourOf, weekday } from './time.ts'
import type {
  AnswerCounts,
  Dashboard,
  DeckRow,
  DueCounts,
  ForecastPoint,
  HeatmapDay,
  HourPoint,
  Quest,
  RetentionPoint,
  ReviewsPoint,
  TodayStats,
  WeekDay,
} from './types.ts'

// The home dashboard, computed from a Collection: a day-by-day walk over the
// review log (streaks, XP, achievement inputs), then due counts, the deck tree,
// charts and today's quests and chest.

/** Answers on review cards, the usual sample for true retention. */
const isGraded = (log: ReviewEntry) => log.kind === 'young' || log.kind === 'mature'

/** The longest run of answers without an Again among the day's answers. */
function todayRun(logs: ReviewEntry[]): number {
  let run = 0
  let best = 0
  for (const l of logs) {
    run = l.rating === 1 ? 0 : run + 1
    best = Math.max(best, run)
  }
  return best
}

/** True retention: the share of graded answers that weren't Again; null without any. */
function passRate(logs: ReviewEntry[]): number | null {
  const graded = logs.filter(isGraded)
  if (graded.length === 0) return null
  return graded.filter((l) => l.rating > 1).length / graded.length
}

/** Everything the home page shows, as of `col.now`. */
export function buildDashboard(col: Collection, isDemo = false): Dashboard {
  const { now, day: cfg } = col
  const today = dayKey(now, cfg)
  const dayEnd = dayStart(addDays(today, 1), cfg)
  const goal = col.dailyGoal

  const byDay = new Map<string, ReviewEntry[]>()
  for (const log of col.logs) {
    const key = dayKey(log.t, cfg)
    const list = byDay.get(key)
    if (list) list.push(log)
    else byDay.set(key, [log])
  }
  const firstDay = [...byDay.keys()].sort()[0] ?? today
  const freezes = new Set(col.freezes)

  // ── Day-by-day pass: streaks, XP, mature counts and achievement inputs ──
  const matureCards = new Set<string>()
  // Cards forgotten as reviews that haven't been mature since, when each card
  // was last answered, and every deck studied so far.
  const lapsed = new Set<string>()
  const lastSeen = new Map<string, number>()
  const decksSeen = new Set<string>()
  const days: DayAgg[] = []
  let streak = 0
  let longest = 0
  let totalXp = 0
  let todayXp = 0
  let lastStudy: string | null = null
  // Answers in a row without an Again; the run carries over between days.
  let run = 0
  for (let key = firstDay; key <= today; key = addDays(key, 1)) {
    const logs = byDay.get(key) ?? []
    // A missed day breaks the streak unless a freeze covered it. Today can't
    // break it yet: there's still time to study.
    if (logs.length > 0) streak += 1
    else if (!freezes.has(key) && key !== today) streak = 0
    longest = Math.max(longest, streak)

    let recovered = 0
    for (const l of logs) {
      if (l.matureAfter) {
        matureCards.add(l.cardId)
        if (lapsed.delete(l.cardId)) recovered += 1
      } else matureCards.delete(l.cardId)
      if (l.rating === 1 && isGraded(l)) lapsed.add(l.cardId)
    }

    // XP is derived from the log, not stored, so it always matches the history.
    let xp = logs.reduce((sum, l) => sum + xpForReview(l.rating, l.kind === 'new', streak), 0)
    if (logs.length >= goal) xp += GOAL_BONUS
    totalXp += xp
    if (key === today) todayXp = xp

    const graded = logs.filter(isGraded)
    let early = 0
    let late = 0
    let quick = 0
    let bestRun = 0
    let recallGap = 0
    for (const l of logs) {
      // Early Bird counts 4–8 AM; Night Owl counts 11 PM–4 AM.
      const h = hourOf(l.t, cfg)
      if (h >= 4 && h < 8) early += 1
      if (h >= 23 || h < 4) late += 1
      // A duration of 0 means it wasn't recorded (e.g. imported history).
      if (l.rating > 1 && l.ms > 0 && l.ms < 5_000) quick += 1
      run = l.rating === 1 ? 0 : run + 1
      bestRun = Math.max(bestRun, run)
      const seen = lastSeen.get(l.cardId)
      if (seen !== undefined && l.rating > 1 && l.kind !== 'new') {
        recallGap = Math.max(recallGap, Math.floor((l.t - seen) / DAY_MS))
      }
      lastSeen.set(l.cardId, l.t)
      decksSeen.add(l.deckId)
    }
    days.push({
      date: key,
      reviews: logs.length,
      passed: graded.filter((l) => l.rating > 1).length,
      graded: graded.length,
      newCards: logs.filter((l) => l.kind === 'new').length,
      ms: logs.reduce((sum, l) => sum + l.ms, 0),
      early,
      late,
      decks: new Set(logs.map((l) => l.deckId)).size,
      mature: matureCards.size,
      streak,
      gap: logs.length > 0 && lastStudy ? daysBetween(lastStudy, key) : 0,
      goalMet: logs.length > 0 && logs.length >= goal,
      quick,
      run: bestRun,
      recovered,
      recallGap,
      decksEver: decksSeen.size,
    })
    if (logs.length > 0) lastStudy = key
  }

  const todayLogs = byDay.get(today) ?? []
  const todayAgg = days.at(-1)!
  const todayStats: TodayStats = {
    reviews: todayAgg.reviews,
    passed: todayAgg.passed,
    graded: todayAgg.graded,
    newCards: todayAgg.newCards,
    minutes: Math.round(todayAgg.ms / 60_000),
    xp: todayXp,
    decks: [...new Set(todayLogs.map((l) => l.deckId))],
    correct: todayLogs.filter((l) => l.rating > 1).length,
    mature: todayLogs.filter((l) => l.kind === 'mature').length,
    young: todayLogs.filter((l) => l.kind === 'young').length,
    run: todayRun(todayLogs),
    quick: todayAgg.quick,
  }

  // Stored rewards (chests, quests, lucky finds, the welcome bonus) on top of what the history earns.
  const rewardXp = col.rewards.reduce((sum, r) => sum + r.xp, 0)
  const goalCoins = days.filter((d) => d.goalMet).length * GOAL_COINS
  const coins = goalCoins + col.rewards.reduce((sum, r) => sum + r.coins, 0)
  const todayRewards = col.rewards.filter((r) => r.day === today)
  const chestToday = todayRewards.find((r) => r.kind === 'chest')
  const welcome = todayRewards.find((r) => r.kind === 'welcome')
  // The run of chests opened on consecutive days, ending today (or yesterday if
  // today's is still closed); every seventh is a weekly chest.
  const chestDays = new Set(col.rewards.filter((r) => r.kind === 'chest').map((r) => r.day))
  let chestRun = 0
  for (let d = chestToday ? today : addDays(today, -1); chestDays.has(d); d = addDays(d, -1)) chestRun += 1
  // An opened chest is the run's last day; a closed one would be the next.
  const chestDay = chestToday ? ((chestRun - 1) % CHEST_WEEK) + 1 : (chestRun % CHEST_WEEK) + 1
  const claimedQuests = new Set(todayRewards.filter((r) => r.kind === 'quest').map((r) => r.key))

  // ── What is due before the day rolls over, within each deck's daily limits ──
  const newToday = countBy(
    todayLogs.filter((l) => l.kind === 'new'),
    (l) => l.deckId,
  )
  const reviewedToday = countBy(todayLogs.filter(isGraded), (l) => l.deckId)
  const byDeck = groupBy(col.cards, (c) => c.deckId)
  const deckDue = new Map<string, DueCounts>()
  for (const deck of col.decks) {
    const cards = (byDeck.get(deck.id) ?? []).filter((c) => !c.suspended)
    const unseen = cards.filter((c) => c.memory.state === 0).length
    const reviews = cards.filter((c) => c.memory.state === 2 && c.memory.due < dayEnd).length
    deckDue.set(deck.id, {
      new: Math.max(0, Math.min(unseen, deck.newPerDay - (newToday.get(deck.id) ?? 0))),
      learning: cards.filter((c) => isLearning(c.memory) && c.memory.due < dayEnd).length,
      review: Math.max(0, Math.min(reviews, deck.reviewsPerDay - (reviewedToday.get(deck.id) ?? 0))),
    })
  }
  const due = sumDue([...deckDue.values()])

  // ── Deck tree (parents roll up their children) ──
  const since30 = dayStart(addDays(today, -29), cfg).getTime()
  const recent = col.logs.filter((l) => l.t >= since30)
  const recentByDeck = groupBy(recent, (l) => l.deckId)
  const lastByDeck = new Map<string, number>()
  for (const log of col.logs) lastByDeck.set(log.deckId, log.t)

  // A visited set guards against a corrupt parent cycle (the API refuses to create one).
  const childrenOf = new Map<string, string[]>()
  for (const d of col.decks) if (d.parentId) childrenOf.set(d.parentId, [...(childrenOf.get(d.parentId) ?? []), d.id])
  const descendants = (id: string, seen = new Set<string>([id])): string[] =>
    (childrenOf.get(id) ?? []).flatMap((child) =>
      seen.has(child) ? [] : (seen.add(child), [child, ...descendants(child, seen)]),
    )
  const deckRows: DeckRow[] = col.decks.map((deck) => {
    const ids = [deck.id, ...descendants(deck.id)]
    const cards = ids.flatMap((id) => byDeck.get(id) ?? [])
    const last = Math.max(0, ...ids.map((id) => lastByDeck.get(id) ?? 0))
    return {
      id: deck.id,
      name: deck.name,
      parentId: deck.parentId,
      presetId: deck.presetId,
      icon: deck.icon,
      due: deckDue.get(deck.id)!,
      total: cards.length,
      mature: cards.filter((c) => isMature(c.memory)).length,
      retention: passRate(ids.flatMap((id) => recentByDeck.get(id) ?? [])),
      lastStudied: last ? dayKey(last, cfg) : null,
    }
  })

  // ── Activity heatmap: whole weeks (Mon–Sun) covering the last year ──
  const yearAgo = addDays(today, -364)
  const heatStart = addDays(yearAgo, -weekday(yearAgo))
  const heatmap: HeatmapDay[] = []
  for (let key = heatStart; key <= today; key = addDays(key, 1)) {
    const logs = byDay.get(key) ?? []
    const graded = logs.filter(isGraded)
    heatmap.push({
      date: key,
      reviews: logs.length,
      passed: graded.filter((l) => l.rating > 1).length,
      graded: graded.length,
      minutes: Math.round(logs.reduce((s, l) => s + l.ms, 0) / 60_000),
    })
  }

  // ── Future due (review cards only), next 30 days ──
  const dueByDay = new Map<string, { young: number; mature: number }>()
  for (const c of col.cards) {
    if (c.suspended || c.memory.state !== 2) continue
    const key = dayKey(c.memory.due, cfg)
    const slot = dueByDay.get(key) ?? { young: 0, mature: 0 }
    if (isMature(c.memory)) slot.mature += 1
    else slot.young += 1
    dueByDay.set(key, slot)
  }
  const forecast: ForecastPoint[] = range(30).map((i) => {
    const date = addDays(today, i + 1)
    return { date, ...(dueByDay.get(date) ?? { young: 0, mature: 0 }) }
  })

  // ── Reviews per day by card type, last 30 days ──
  const reviews: ReviewsPoint[] = range(30).map((i) => {
    const date = addDays(today, i - 29)
    const logs = byDay.get(date) ?? []
    return {
      date,
      learning: logs.filter((l) => l.kind === 'new' || l.kind === 'learning').length,
      young: logs.filter((l) => l.kind === 'young').length,
      mature: logs.filter((l) => l.kind === 'mature').length,
    }
  })

  // ── True retention by week, last 26 weeks ──
  const thisWeek = addDays(today, -weekday(today))
  const retention: RetentionPoint[] = range(26).map((i) => {
    const week = addDays(thisWeek, (i - 25) * 7)
    const logs = range(7).flatMap((d) => byDay.get(addDays(week, d)) ?? [])
    return { week, retention: passRate(logs), reviews: logs.filter(isGraded).length }
  })

  const answers: AnswerCounts = { again: 0, hard: 0, good: 0, easy: 0 }
  const keys = ['again', 'hard', 'good', 'easy'] as const
  for (const log of recent) answers[keys[log.rating - 1]!] += 1

  const collection = { new: 0, learning: 0, young: 0, mature: 0, suspended: 0 }
  let recallSum = 0
  let recallN = 0
  for (const c of col.cards) {
    if (c.suspended) collection.suspended += 1
    else collection[cardKind(c.memory)] += 1
    if (!c.suspended && c.memory.state === 2) {
      recallSum += retrievability(c.memory, now)
      recallN += 1
    }
  }

  // ── Recall by hour of day, last 90 days ──
  const since90 = dayStart(addDays(today, -89), cfg).getTime()
  const byHour = groupBy(
    col.logs.filter((l) => l.t >= since90),
    (l) => hourOf(l.t, cfg),
  )
  const hours: HourPoint[] = range(24).map((hour) => {
    const logs = byHour.get(hour) ?? []
    return { hour, reviews: logs.length, retention: passRate(logs) }
  })

  // Mean answer time over the last 30 days, to a tenth of a second (8 s before any history).
  const recentMs = recent.reduce((s, l) => s + l.ms, 0)
  const secondsPerReview = recent.length ? Math.round(recentMs / recent.length / 100) / 10 : 8

  // ── This week's streak strip (Mon–Sun) ──
  const week: WeekDay[] = range(7).map((i) => {
    const date = addDays(thisWeek, i)
    let status: WeekDay['status']
    if (date > today) status = 'upcoming'
    else if (byDay.has(date)) status = 'done'
    else if (date < firstDay) status = 'none'
    else if (freezes.has(date)) status = 'freeze'
    else status = date === today ? 'today' : 'missed'
    return { date, status }
  })

  // ── Quests ──
  // Quests are saved when first offered (see the API), so targets don't drift
  // during the day as learning steps add reviews. Without saved offers they're
  // picked here, capped by what's left to study today.
  let quests: Quest[]
  if (col.questOffers?.length) quests = questsFromOffers(today, col.questOffers, todayStats, claimedQuests)
  else {
    const dueReviewCards = col.cards.filter((c) => !c.suspended && c.memory.state === 2 && c.memory.due < dayEnd)
    const decksWithDue = [...deckDue].filter(([, d]) => d.new + d.learning + d.review > 0).map(([id]) => id)
    const capacity = {
      reviews: todayStats.reviews + due.new + due.learning + due.review,
      newCards: todayStats.newCards + due.new,
      decks: new Set([...todayStats.decks, ...decksWithDue]).size,
      mature: todayStats.mature + dueReviewCards.filter((c) => isMature(c.memory)).length,
      young: todayStats.young + dueReviewCards.filter((c) => !isMature(c.memory)).length,
      secondsPerReview,
    }
    quests = dailyQuests(today, todayStats, capacity, claimedQuests)
  }

  return {
    isDemo,
    now: now.toISOString(),
    localHour: hourOf(now, cfg),
    today,
    dayEnd: dayEnd.toISOString(),
    goal,
    todayStats,
    due,
    secondsPerReview,
    streak: {
      current: streak,
      longest,
      freezes: col.freezesLeft,
      maxFreezes: MAX_FREEZES,
      studiedToday: todayLogs.length > 0,
      week,
    },
    totalXp: totalXp + rewardXp,
    coins,
    chest: {
      tier: chestTier(streak),
      opened: chestToday ? { xp: chestToday.xp, coins: chestToday.coins } : null,
      next: nextChestTier(streak),
      day: chestDay,
      weekly: chestDay === CHEST_WEEK,
    },
    questBonus: { ...QUEST_BONUS, claimed: claimedQuests.has('bonus') },
    welcome: welcome ? { xp: welcome.xp, coins: welcome.coins } : null,
    decks: deckRows,
    heatmap,
    forecast,
    reviews,
    retention,
    answers,
    collection,
    recall: recallN ? recallSum / recallN : 0,
    hours,
    achievements: evaluateAchievements(days),
    quests,
    rolloverHour: cfg.rolloverHour,
    totals: {
      reviews: col.logs.length,
      hours: Math.round(col.logs.reduce((s, l) => s + l.ms, 0) / 3_600_000),
      daysStudied: byDay.size,
      since: firstDay,
    },
  }
}

function sumDue(list: DueCounts[]): DueCounts {
  const total: DueCounts = { new: 0, learning: 0, review: 0 }
  for (const d of list) {
    total.new += d.new
    total.learning += d.learning
    total.review += d.review
  }
  return total
}

function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i)
}

function groupBy<T, K>(items: T[], key: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>()
  for (const item of items) {
    const k = key(item)
    const list = map.get(k)
    if (list) list.push(item)
    else map.set(k, [item])
  }
  return map
}

function countBy<T, K>(items: T[], key: (item: T) => K): Map<K, number> {
  const map = new Map<K, number>()
  for (const item of items) {
    const k = key(item)
    map.set(k, (map.get(k) ?? 0) + 1)
  }
  return map
}
