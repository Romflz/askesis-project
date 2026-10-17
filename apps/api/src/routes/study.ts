import { idParam, type StudyInput, studyInput, type StudyPreview, undoInput } from '@askesis/contracts'
import {
  addDays,
  buildDashboard,
  type CardState,
  dayKey,
  dayStart,
  type DeckIcon,
  isLearning,
  parseMemory,
  type QueueCard,
  retrievability,
  serializeMemory,
  type StudyQueue,
} from '@askesis/core'
import { and, asc, desc, eq, gte, inArray, isNotNull, isNull, lt, lte, not, or, schema, type SQL, sql } from '@askesis/db'
import type { FastifyInstance } from 'fastify'
import { dayConfig, ensureSetup, loadCollection, memoryColumns, schedulerPreset, toMemory, toPreset } from '../collection.ts'
import { db } from '../db.ts'
import { requireSession } from '../http.ts'
import { deckPaths, hasTag, withDescendants } from '../library.ts'

const { deck, deckPreset, card, reviewLog, reward } = schema
type CardRow = typeof card.$inferSelect

/** A card row as a study session receives it. */
export function toQueueCard(c: CardRow): QueueCard {
  const memory = toMemory(c)
  return {
    id: c.id,
    deckId: c.deckId,
    kind: memory.state === 0 ? 'new' : isLearning(memory) ? 'learning' : 'review',
    front: c.front,
    back: c.back,
    hint: c.hint ?? undefined,
    extra: c.extra ?? undefined,
    memory: serializeMemory(memory),
  }
}

// Orders deck paths like a deck list: "Deck 2" before "Deck 10", ignoring case.
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

const byDue = (a: CardRow, b: CardRow) => +a.due - +b.due

function shuffle<T>(items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

/** Spreads `b` evenly through `a`, mixing new cards into reviews. */
function interleave<T>(a: T[], b: T[]): T[] {
  if (!a.length || !b.length) return [...a, ...b]
  const out: T[] = []
  const every = (a.length + b.length) / b.length
  let ai = 0
  let bi = 0
  for (let i = 0; ai < a.length || bi < b.length; i++) {
    if (bi < b.length && (ai >= a.length || (i + 1) % Math.max(2, Math.round(every)) === 0)) out.push(b[bi++]!)
    else out.push(a[ai++]!)
  }
  return out
}

/** Custom study by tag: require any or all of `tags`, leave out any of `excludeTags`. */
export function tagFilter(input: Pick<StudyInput, 'tags' | 'tagMatch' | 'excludeTags'>): SQL | undefined {
  const parts: (SQL | undefined)[] = []
  if (input.tags.length) parts.push(input.tagMatch === 'all' ? and(...input.tags.map(hasTag)) : or(...input.tags.map(hasTag)))
  if (input.excludeTags.length) parts.push(not(or(...input.excludeTags.map(hasTag))!))
  return parts.length ? and(...parts) : undefined
}

/**
 * Picks the cards for a session; shared by the queue, its preview and the
 * dashboard's quick session. `base` is the deck, tag and visibility filter
 * before any mode or limit applies.
 */
export async function selectCards(userId: string, input: StudyInput) {
  const settings = await ensureSetup(userId)
  const cfg = dayConfig(settings)
  const now = new Date()
  const today = dayKey(now, cfg)
  const todayStart = dayStart(today, cfg)
  const dayEnd = dayStart(addDays(today, 1), cfg)

  const [decks, presets] = await Promise.all([
    db.select().from(deck).where(eq(deck.userId, userId)),
    db.select().from(deckPreset).where(eq(deckPreset.userId, userId)),
  ])
  const deckIds = input.deckIds.length ? withDescendants(decks, input.deckIds) : decks.map((d) => d.id)
  const presetById = new Map(presets.map((p) => [p.id, toPreset(p)]))
  const deckById = new Map(decks.map((d) => [d.id, d]))

  const base = and(
    eq(card.userId, userId),
    deckIds.length ? inArray(card.deckId, deckIds) : sql`false`,
    eq(card.suspended, false),
    or(isNull(card.buriedUntil), lte(card.buriedUntil, now)),
    tagFilter(input),
  )

  let cards: CardRow[] = []
  // Quick study draws from today's cards too, within the same daily limits.
  if (input.mode === 'scheduled' || input.mode === 'quick') {
    const [rows, todayLogs] = await Promise.all([
      db
        .select()
        .from(card)
        .where(and(base, or(and(sql`${card.state} > 0`, lt(card.due, dayEnd)), eq(card.state, 0)))),
      db
        .select({ deckId: reviewLog.deckId, stateBefore: reviewLog.stateBefore })
        .from(reviewLog)
        .where(and(eq(reviewLog.userId, userId), gte(reviewLog.reviewedAt, todayStart))),
    ])
    const used = new Map<string, { fresh: number; reviews: number }>()
    for (const l of todayLogs) {
      const u = used.get(l.deckId) ?? { fresh: 0, reviews: 0 }
      if (l.stateBefore === 0) u.fresh += 1
      if (l.stateBefore === 2) u.reviews += 1
      used.set(l.deckId, u)
    }
    // Learning cards are never held back by the daily limits. Ones whose step is up
    // lead; ones due later today go last, and the session holds them until they're due.
    const learning = rows.filter((c) => c.state === 1 || c.state === 3).sort(byDue)
    const learningNow = learning.filter((c) => c.due <= now)
    const learningLater = learning.filter((c) => c.due > now)
    const reviews: CardRow[] = []
    const fresh: CardRow[] = []
    // Daily limits come from each deck's own preset. New cards are gathered deck
    // by deck in deck-list order.
    const paths = deckPaths(decks)
    const inListOrder = [...deckIds].sort((a, b) => collator.compare(paths.get(a) ?? '', paths.get(b) ?? ''))
    for (const id of inListOrder) {
      const preset = presetById.get(deckById.get(id)!.presetId)!
      const u = used.get(id) ?? { fresh: 0, reviews: 0 }
      const inDeck = rows.filter((c) => c.deckId === id)
      reviews.push(
        ...inDeck
          .filter((c) => c.state === 2)
          .sort(byDue)
          .slice(0, Math.max(0, preset.reviewsPerDay - u.reviews)),
      )
      const unseen = inDeck.filter((c) => c.state === 0).sort((a, b) => a.position - b.position)
      fresh.push(
        ...(preset.newCardOrder === 'random' ? shuffle(unseen) : unseen).slice(0, Math.max(0, preset.newPerDay - u.fresh)),
      )
    }
    if (input.mode === 'quick') {
      // What memory gains most from right now: learning steps that are up, then the due
      // reviews with the lowest chance of recall, then new cards if there's still room.
      // Learning steps due later wait for their time, so they're left out.
      const recall = new Map(reviews.map((c) => [c.id, retrievability(toMemory(c), now)]))
      cards = [...learningNow, ...reviews.sort((a, b) => recall.get(a.id)! - recall.get(b.id)!), ...fresh]
    }
    // "mixed" mixes new cards evenly into the reviews.
    else if (input.order === 'random') cards = [...learningNow, ...shuffle([...reviews, ...fresh]), ...learningLater]
    else if (input.order === 'due') cards = [...learningNow, ...reviews.sort(byDue), ...fresh, ...learningLater]
    else cards = [...learningNow, ...interleave(reviews.sort(byDue), fresh), ...learningLater]
  } else if (input.mode === 'new') {
    cards = await db
      .select()
      .from(card)
      .where(and(base, eq(card.state, 0)))
      .orderBy(asc(card.position))
      .limit(input.limit)
  } else if (input.mode === 'ahead') {
    const until = dayStart(addDays(today, input.aheadDays + 1), cfg)
    cards = await db
      .select()
      .from(card)
      .where(and(base, eq(card.state, 2), gte(card.due, dayEnd), lte(card.due, until)))
      .orderBy(asc(card.due))
      .limit(input.limit)
  } else if (input.mode === 'forgotten') {
    const since = dayStart(addDays(today, -input.forgottenDays + 1), cfg)
    const lapsed = db
      .selectDistinct({ id: reviewLog.cardId })
      .from(reviewLog)
      .where(and(eq(reviewLog.userId, userId), eq(reviewLog.rating, 1), gte(reviewLog.reviewedAt, since)))
    cards = await db
      .select()
      .from(card)
      .where(and(base, inArray(card.id, lapsed)))
      .orderBy(asc(card.due))
      .limit(input.limit)
  } else {
    // Cram: anything in the selection, answers are practice only.
    cards = await db
      .select()
      .from(card)
      .where(base)
      .orderBy(input.order === 'due' ? asc(card.due) : sql`random()`)
      .limit(input.limit)
  }

  if (input.mode !== 'scheduled' && input.mode !== 'quick') {
    if (input.order === 'random') cards = shuffle(cards)
    if (input.order === 'due') cards = [...cards].sort(byDue)
  }
  // Scheduled sessions ignore `limit` (the daily limits apply instead) but stay bounded.
  cards = cards.slice(0, input.mode === 'scheduled' ? 1_000 : input.limit)
  return { cards, decks, deckIds, presetById, settings, now, dayEnd, base }
}

export async function studyRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireSession)
  const uid = (request: { session: { user: { id: string } } | null }) => request.session!.user.id

  app.post('/me/study/queue', async (request): Promise<StudyQueue> => {
    const userId = uid(request)
    const input = studyInput.parse(request.body ?? {})
    const { cards, decks, deckIds, presetById, settings, now, dayEnd } = await selectCards(userId, input)

    const dash = buildDashboard(await loadCollection(userId))
    const paths = deckPaths(decks)
    const usedDecks = new Set(cards.map((c) => c.deckId))
    const queue = cards.map(toQueueCard)
    return {
      mode: input.mode,
      reschedules: input.mode !== 'cram',
      cards: queue,
      decks: decks
        .filter((d) => usedDecks.has(d.id) || deckIds.includes(d.id))
        .map((d) => ({ id: d.id, name: d.name, path: paths.get(d.id)!, icon: d.icon as DeckIcon, presetId: d.presetId })),
      presets: Object.fromEntries([...presetById].map(([id, p]) => [id, schedulerPreset(p)])),
      counts: {
        new: queue.filter((c) => c.kind === 'new').length,
        learning: queue.filter((c) => c.kind === 'learning').length,
        review: queue.filter((c) => c.kind === 'review').length,
      },
      now: now.toISOString(),
      dayEnd: dayEnd.toISOString(),
      learnAheadMinutes: settings.learnAheadMinutes,
      progress: {
        totalXp: dash.totalXp,
        streak: dash.streak.current,
        studiedToday: dash.streak.studiedToday,
        reviewsToday: dash.todayStats.reviews,
        goal: dash.goal,
      },
    }
  })

  // What a selection would study, for the picker's live summary.
  app.post('/me/study/preview', async (request): Promise<StudyPreview> => {
    const userId = uid(request)
    const input = studyInput.parse(request.body ?? {})
    const { cards, base } = await selectCards(userId, input)
    const [matching] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(card)
      .where(base)
    const kinds = cards.map((c) => toQueueCard(c).kind)
    return {
      session: cards.length,
      matching: Number(matching?.n ?? 0),
      counts: {
        new: kinds.filter((k) => k === 'new').length,
        learning: kinds.filter((k) => k === 'learning').length,
        review: kinds.filter((k) => k === 'review').length,
      },
    }
  })

  // Undo the latest answer on a card: restore its scheduling and drop the log entry.
  app.post('/me/reviews/undo', async (request, reply) => {
    const userId = uid(request)
    const { cardId } = undoInput.parse(request.body)
    const [last] = await db
      .select()
      .from(reviewLog)
      .where(and(eq(reviewLog.userId, userId), eq(reviewLog.cardId, cardId), isNotNull(reviewLog.memoryBefore)))
      .orderBy(desc(reviewLog.reviewedAt), desc(reviewLog.id))
      .limit(1)
    if (!last) return reply.code(404).send({ error: 'nothing_to_undo' })
    const before = parseMemory(last.memoryBefore as CardState)
    let undoneDrop = 0
    const restored = await db.transaction(async (tx) => {
      await tx.delete(reviewLog).where(eq(reviewLog.id, last.id))
      // A lucky find from that answer goes too, so answer → undo can't farm coins.
      const [drop] = await tx
        .delete(reward)
        .where(and(eq(reward.userId, userId), eq(reward.kind, 'drop'), eq(reward.key, `review:${last.id}`)))
        .returning({ coins: reward.coins })
      undoneDrop = drop?.coins ?? 0
      const [row] = await tx.update(card).set(memoryColumns(before)).where(eq(card.id, cardId)).returning()
      return row!
    })
    return { card: toQueueCard(restored), ...(undoneDrop && { undoneDrop }) }
  })

  // Bury: hide the card until the next study day.
  app.post('/me/cards/:id/bury', async (request, reply) => {
    const userId = uid(request)
    const { id } = idParam.parse(request.params)
    const settings = await ensureSetup(userId)
    const cfg = dayConfig(settings)
    const until = dayStart(addDays(dayKey(new Date(), cfg), 1), cfg)
    const [row] = await db
      .update(card)
      .set({ buriedUntil: until })
      .where(and(eq(card.id, id), eq(card.userId, userId)))
      .returning({ id: card.id })
    if (!row) return reply.code(404).send({ error: 'not_found' })
    return { ok: true, until: until.toISOString() }
  })
}
