import type { DeckNode, ImportInput, ImportResult, ImportRow, TagSummary } from '@askesis/contracts'
import { addDays, dayKey, dayStart, type DayConfig, DECK_PATH_SEPARATOR, splitDeckPath } from '@askesis/core'
import { and, eq, gte, inArray, schema, type SQL, sql } from '@askesis/db'
import { randomUUID } from 'node:crypto'
import { db } from './db.ts'
import { newIdentifiers } from './identifiers.ts'

const { deck, deckPreset, card, reviewLog } = schema

type DeckRow = typeof deck.$inferSelect
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]

// ── Deck tree helpers ─────────────────────────────────────────────────────────

/** Each deck's full "Parent::Child" path, by deck id. */
export function deckPaths(decks: Pick<DeckRow, 'id' | 'name' | 'parentId'>[]): Map<string, string> {
  const byId = new Map(decks.map((d) => [d.id, d]))
  const paths = new Map<string, string>()
  const pathOf = (id: string, seen = new Set<string>()): string => {
    const cached = paths.get(id)
    if (cached) return cached
    const d = byId.get(id)!
    // Guard against a corrupt cycle rather than recursing forever.
    const parent = d.parentId && !seen.has(d.parentId) ? pathOf(d.parentId, seen.add(id)) : null
    const path = parent ? `${parent}${DECK_PATH_SEPARATOR}${d.name}` : d.name
    paths.set(id, path)
    return path
  }
  for (const d of decks) pathOf(d.id)
  return paths
}

/** The given decks plus every deck below them. Ids missing from `decks` (someone else's) are ignored. */
export function withDescendants(decks: Pick<DeckRow, 'id' | 'parentId'>[], ids: string[]): string[] {
  const out = new Set<string>()
  const visit = (id: string) => {
    if (out.has(id)) return
    out.add(id)
    for (const d of decks) if (d.parentId === id) visit(d.id)
  }
  for (const id of ids) if (decks.some((d) => d.id === id)) visit(id)
  return [...out]
}

/** The user's default preset; ensureSetup creates it, and it can't be deleted. */
export async function defaultPresetId(userId: string, tx: Tx | typeof db = db): Promise<string> {
  const [row] = await tx
    .select({ id: deckPreset.id })
    .from(deckPreset)
    .where(and(eq(deckPreset.userId, userId), eq(deckPreset.isDefault, true)))
  return row!.id
}

/**
 * Finds or creates every deck along a "Parent::Child" path, matching names
 * case-insensitively, and returns the last deck's id. New subdecks inherit
 * their parent's preset.
 */
export async function upsertDeckPath(
  tx: Tx,
  userId: string,
  path: string,
  index: { decks: DeckRow[]; created: string[] },
  presetId: string,
): Promise<string> {
  let parentId: string | null = null
  let position = Math.max(0, ...index.decks.map((d) => d.position)) + 1
  const walked: string[] = []
  for (const name of splitDeckPath(path)) {
    walked.push(name)
    const existing = index.decks.find((d) => d.parentId === parentId && d.name.toLowerCase() === name.toLowerCase())
    if (existing) {
      parentId = existing.id
      continue
    }
    const parent = index.decks.find((d) => d.id === parentId)
    const [created]: DeckRow[] = await tx
      .insert(deck)
      .values({ userId, parentId, name, presetId: parent?.presetId ?? presetId, position: position++ })
      .returning()
    index.decks.push(created!)
    index.created.push(walked.join(DECK_PATH_SEPARATOR))
    parentId = created!.id
  }
  return parentId!
}

// ── Library overview ──────────────────────────────────────────────────────────

/**
 * The deck list with today's due counts for each deck on its own (not its
 * subdecks). New cards and reviews are capped by what's left of the preset's
 * daily limits; learning cards aren't limited.
 */
export async function libraryDecks(userId: string, cfg: DayConfig, now = new Date()): Promise<DeckNode[]> {
  const today = dayKey(now, cfg)
  const start = dayStart(today, cfg)
  const end = dayStart(addDays(today, 1), cfg)
  // Raw SQL needs timestamps as ISO strings; postgres-js only serializes Dates for typed columns.
  const at = (d: Date) => sql`${d.toISOString()}::timestamptz`
  const visible = sql`(${card.buriedUntil} is null or ${card.buriedUntil} <= ${at(now)}) and not ${card.suspended}`

  const [decks, presets, counts, answeredToday] = await Promise.all([
    db.select().from(deck).where(eq(deck.userId, userId)),
    db.select().from(deckPreset).where(eq(deckPreset.userId, userId)),
    db
      .select({
        deckId: card.deckId,
        cards: sql<number>`count(*)::int`,
        suspended: sql<number>`count(*) filter (where ${card.suspended})::int`,
        unseen: sql<number>`count(*) filter (where ${card.state} = 0 and ${visible})::int`,
        learning: sql<number>`count(*) filter (where ${card.state} in (1, 3) and ${card.due} < ${at(end)} and ${visible})::int`,
        review: sql<number>`count(*) filter (where ${card.state} = 2 and ${card.due} < ${at(end)} and ${visible})::int`,
      })
      .from(card)
      .where(eq(card.userId, userId))
      .groupBy(card.deckId),
    db
      .select({
        deckId: reviewLog.deckId,
        newToday: sql<number>`count(*) filter (where ${reviewLog.stateBefore} = 0)::int`,
        reviewsToday: sql<number>`count(*) filter (where ${reviewLog.stateBefore} = 2)::int`,
      })
      .from(reviewLog)
      .where(and(eq(reviewLog.userId, userId), gte(reviewLog.reviewedAt, start)))
      .groupBy(reviewLog.deckId),
  ])

  const paths = deckPaths(decks)
  const presetById = new Map(presets.map((p) => [p.id, p]))
  const countBy = new Map(counts.map((c) => [c.deckId, c]))
  const todayBy = new Map(answeredToday.map((t) => [t.deckId, t]))
  return decks
    .map((d) => {
      const c = countBy.get(d.id)
      const t = todayBy.get(d.id)
      const p = presetById.get(d.presetId)!
      return {
        id: d.id,
        name: d.name,
        path: paths.get(d.id)!,
        parentId: d.parentId,
        presetId: d.presetId,
        icon: d.icon as DeckNode['icon'],
        description: d.description,
        position: d.position,
        cards: c?.cards ?? 0,
        suspended: c?.suspended ?? 0,
        due: {
          new: Math.max(0, Math.min(c?.unseen ?? 0, p.newPerDay - (t?.newToday ?? 0))),
          learning: c?.learning ?? 0,
          review: Math.max(0, Math.min(c?.review ?? 0, p.reviewsPerDay - (t?.reviewsToday ?? 0))),
        },
      }
    })
    .sort((a, b) => a.path.localeCompare(b.path))
}

/** A card carrying `tag` or any tag below it ("lang" matches "lang::japanese"), ignoring case. */
export function hasTag(tag: string): SQL {
  const t = tag.toLowerCase()
  return sql`exists (select 1 from unnest(${card.tags}) as ct(tag) where lower(ct.tag) = ${t} or starts_with(lower(ct.tag), ${`${t}::`}))`
}

/** Every level of every "::" tag, each with the distinct cards at or below it. */
export async function tagLevels(userId: string): Promise<TagSummary[]> {
  const rows = await db.execute<{ tag: string; cards: number }>(
    sql`select array_to_string(p.parts[1:i], '::') as tag, count(distinct ${card.id})::int as cards
        from ${card}
        cross join lateral unnest(${card.tags}) as t(tag)
        cross join lateral (select string_to_array(t.tag, '::') as parts) as p
        cross join lateral generate_series(1, cardinality(p.parts)) as i
        where ${card.userId} = ${userId}
        group by 1 order by 1`,
  )
  return rows.map((r) => ({ tag: r.tag, cards: Number(r.cards) }))
}

/** Tags exactly as written on cards, with how many cards carry each. */
export async function tagSummary(userId: string): Promise<TagSummary[]> {
  const rows = await db.execute<{ tag: string; cards: number }>(
    sql`select tag, count(*)::int as cards from ${card}, unnest(${card.tags}) as tag
        where ${card.userId} = ${userId} group by tag order by tag`,
  )
  return rows.map((r) => ({ tag: r.tag, cards: Number(r.cards) }))
}

// ── Import ────────────────────────────────────────────────────────────────────

/** The card columns set from an imported row's study progress. */
function progressColumns(s: NonNullable<ImportRow['scheduling']>) {
  return {
    state: s.state,
    due: new Date(s.due),
    interval: s.interval,
    ease: s.ease,
    stability: s.stability,
    difficulty: s.difficulty,
    reps: s.reps,
    lapses: s.lapses,
    lastReview: s.lastReview ? new Date(s.lastReview) : null,
    step: s.step ?? 0,
  }
}

type ImportHistory = NonNullable<ImportRow['history']>

/**
 * Adds past answers to the review log. Answers already logged for a card (same
 * moment, to the millisecond) are skipped, so importing a backup twice is safe.
 * Queries and inserts are chunked to stay under Postgres's 65,535 bind parameters.
 */
async function insertHistory(tx: Tx, userId: string, items: { cardId: string; deckId: string; history: ImportHistory }[]) {
  if (!items.length) return 0
  const known = new Set<string>()
  const cardIds = [...new Set(items.map((i) => i.cardId))]
  for (let i = 0; i < cardIds.length; i += 5_000) {
    const rows = await tx
      .select({ cardId: reviewLog.cardId, at: reviewLog.reviewedAt })
      .from(reviewLog)
      .where(and(eq(reviewLog.userId, userId), inArray(reviewLog.cardId, cardIds.slice(i, i + 5_000))))
    for (const r of rows) known.add(`${r.cardId}|${r.at.getTime()}`)
  }
  const logs: (typeof reviewLog.$inferInsert)[] = []
  for (const { cardId, deckId, history } of items) {
    for (const h of history) {
      const at = new Date(h.at)
      const key = `${cardId}|${at.getTime()}`
      if (known.has(key)) continue
      known.add(key)
      logs.push({
        userId,
        cardId,
        deckId,
        rating: h.rating,
        stateBefore: h.stateBefore,
        stateAfter: h.stateAfter,
        intervalBefore: h.intervalBefore,
        intervalAfter: h.intervalAfter,
        easeAfter: h.ease,
        durationMs: h.ms,
        reviewedAt: at,
      })
    }
  }
  for (let i = 0; i < logs.length; i += 4_000) await tx.insert(reviewLog).values(logs.slice(i, i + 4_000))
  return logs.length
}

/**
 * Imports rows in one transaction. Existing decks are merged into. A row with
 * the ID of one of the user's cards matches that card, which is updated, skipped
 * or added again, per `input.duplicates`; every other row is a new card.
 */
export async function importRows(userId: string, input: ImportInput): Promise<ImportResult> {
  const rowDeckPath = (row: ImportRow) =>
    splitDeckPath(row.deck ?? input.defaultDeck).join(DECK_PATH_SEPARATOR) || input.defaultDeck

  return db.transaction(async (tx) => {
    const index = { decks: await tx.select().from(deck).where(eq(deck.userId, userId)), created: [] as string[] }
    const presetId = await defaultPresetId(userId, tx)

    // Resolve every deck path once; existing decks are merged into, never replaced.
    const deckIdByPath = new Map<string, string>()
    const merged = new Set<string>()
    for (const row of input.rows) {
      const path = rowDeckPath(row)
      const key = path.toLowerCase()
      if (deckIdByPath.has(key)) continue
      const createdBefore = index.created.length
      deckIdByPath.set(key, await upsertDeckPath(tx, userId, path, index, presetId))
      if (index.created.length === createdBefore || !index.created.some((p) => p.toLowerCase() === key)) merged.add(path)
    }

    const deckIds = [...new Set(deckIdByPath.values())]
    // Cards the file names by identifier, in any deck. Identifiers are unique per
    // user, so only this user's cards can match; another account's never does.
    const fields = { id: card.id, front: card.front, back: card.back, hint: card.hint, extra: card.extra }
    const fileIdentifiers = [...new Set(input.rows.flatMap((r) => (r.identifier ? [r.identifier] : [])))]
    const owned = []
    for (let i = 0; i < fileIdentifiers.length; i += 5_000) {
      owned.push(
        ...(await tx
          .select({ ...fields, identifier: card.identifier })
          .from(card)
          .where(and(eq(card.userId, userId), inArray(card.identifier, fileIdentifiers.slice(i, i + 5_000))))),
      )
    }
    const byIdentifier = new Map(owned.map((c) => [c.identifier, c]))
    // New cards go to the end of their deck.
    const nextPosition = new Map<string, number>()
    const ends = await tx
      .select({ deckId: card.deckId, end: sql<number>`max(${card.position}) + 1` })
      .from(card)
      .where(and(eq(card.userId, userId), inArray(card.deckId, deckIds)))
      .groupBy(card.deckId)
    for (const e of ends) nextPosition.set(e.deckId, Number(e.end))

    let updated = 0
    let unchanged = 0
    let skipped = 0
    let withProgress = 0
    const inserts: (typeof card.$inferInsert)[] = []
    // New cards without an identifier of their own get one after the loop.
    const needIdentifier: (typeof card.$inferInsert)[] = []
    const histories: { cardId: string; deckId: string; history: ImportHistory }[] = []
    // Only the first row with an identifier uses it, as in buildRows; a repeat is a new card.
    const used = new Set<string>()
    for (const row of input.rows) {
      const deckId = deckIdByPath.get(rowDeckPath(row).toLowerCase())!
      const identifier = row.identifier && !used.has(row.identifier) ? row.identifier : undefined
      if (identifier) used.add(identifier)
      // Only columns present in the file overwrite: a CSV without hint/extra keeps them.
      const content = {
        front: row.front,
        back: row.back,
        ...(row.hint !== undefined && { hint: row.hint || null }),
        ...(row.extra !== undefined && { extra: row.extra || null }),
      }

      // A card the user already has only takes the file's text. Its progress,
      // history, tags, deck and suspended flag stay as they are, and a card whose
      // text already matches isn't written at all.
      const found = identifier ? byIdentifier.get(identifier) : undefined
      if (found && input.duplicates !== 'duplicate') {
        if (input.duplicates === 'skip') skipped += 1
        else if ((Object.keys(content) as (keyof typeof content)[]).every((k) => content[k] === found[k])) unchanged += 1
        else {
          await tx
            .update(card)
            .set(content)
            .where(and(eq(card.id, found.id), eq(card.userId, userId)))
          Object.assign(found, content)
          updated += 1
        }
        continue
      }

      // A new card keeps the file's identifier, so importing the file again finds
      // it. A copy of a card the user has ("Import as new") needs a fresh one.
      const position = nextPosition.get(deckId) ?? 0
      nextPosition.set(deckId, position + 1)
      const s = row.scheduling
      const values: typeof card.$inferInsert = {
        id: randomUUID(),
        identifier: identifier && !found ? identifier : '',
        userId,
        deckId,
        ...content,
        tags: [...new Set(row.tags)],
        position,
        suspended: row.suspended ?? false,
        ...(s && progressColumns(s)),
      }
      if (!values.identifier) needIdentifier.push(values)
      if (s && s.state > 0) withProgress += 1
      if (row.history?.length) histories.push({ cardId: values.id!, deckId, history: row.history })
      inserts.push(values)
    }
    // Fresh ones must not clash with the user's cards or with any identifier in this file.
    const fresh = await newIdentifiers(tx, userId, needIdentifier.length, new Set(fileIdentifiers))
    needIdentifier.forEach((values, i) => (values.identifier = fresh[i]!))

    for (let i = 0; i < inserts.length; i += 2_000) await tx.insert(card).values(inserts.slice(i, i + 2_000))
    const reviewsImported = await insertHistory(tx, userId, histories)

    return {
      decksCreated: index.created,
      decksMerged: [...merged].filter((p) => !index.created.some((c) => c.toLowerCase() === p.toLowerCase())),
      added: inserts.length,
      updated,
      unchanged,
      skipped,
      withProgress,
      reviewsImported,
    }
  })
}
