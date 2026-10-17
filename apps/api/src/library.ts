import type { DeckNode, ImportInput, ImportResult, ImportRow, TagSummary } from '@askesis/contracts'
import { addDays, dayKey, dayStart, type DayConfig, DECK_PATH_SEPARATOR, frontKey, splitDeckPath } from '@askesis/core'
import { and, eq, gte, inArray, schema, type SQL, sql } from '@askesis/db'
import { randomUUID } from 'node:crypto'
import { db } from './db.ts'

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
 * the ID of one of the user's cards, or else with the front of a card already in
 * its deck, matches that card, which is updated, skipped or added again, per
 * `input.duplicates`.
 */
export async function importRows(userId: string, input: ImportInput): Promise<ImportResult> {
  const rowDeckPath = (row: ImportRow) =>
    splitDeckPath(row.deck ?? input.defaultDeck).join(DECK_PATH_SEPARATOR) || input.defaultDeck
  const cardKey = (deckId: string, front: string) => `${deckId}\u0000${frontKey(front)}`

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
    const fields = {
      id: card.id,
      deckId: card.deckId,
      front: card.front,
      back: card.back,
      hint: card.hint,
      extra: card.extra,
      suspended: card.suspended,
      tags: card.tags,
      position: card.position,
      lastReview: card.lastReview,
    }
    const existing = await tx
      .select(fields)
      .from(card)
      .where(and(eq(card.userId, userId), inArray(card.deckId, deckIds)))
    const byKey = new Map(existing.map((c) => [cardKey(c.deckId, c.front), c]))
    // Cards the file names by ID can be in any deck. An ID that isn't one of this
    // user's cards (a file someone shared, a deleted card) matches nothing.
    const byId = new Map(existing.map((c) => [c.id, c]))
    const elsewhere = [...new Set(input.rows.flatMap((r) => (r.id && !byId.has(r.id) ? [r.id] : [])))]
    for (let i = 0; i < elsewhere.length; i += 5_000) {
      const found = await tx
        .select(fields)
        .from(card)
        .where(and(eq(card.userId, userId), inArray(card.id, elsewhere.slice(i, i + 5_000))))
      for (const c of found) byId.set(c.id, c)
    }
    const nextPosition = new Map<string, number>()
    for (const c of existing) nextPosition.set(c.deckId, Math.max(nextPosition.get(c.deckId) ?? 0, c.position + 1))
    const takePosition = (deckId: string) => {
      const position = nextPosition.get(deckId) ?? 0
      nextPosition.set(deckId, position + 1)
      return position
    }

    let updated = 0
    let unchanged = 0
    let skipped = 0
    let withProgress = 0
    const inserts: (typeof card.$inferInsert)[] = []
    // Cards added earlier in this same import, by key, so a repeated front merges too.
    const pending = new Map<string, typeof card.$inferInsert>()
    const histories: { cardId: string; deckId: string; history: ImportHistory }[] = []
    for (const row of input.rows) {
      const deckId = deckIdByPath.get(rowDeckPath(row).toLowerCase())!
      const key = cardKey(deckId, row.front)
      // Only columns present in the file overwrite: a CSV without hint/extra keeps them.
      const content = {
        front: row.front,
        back: row.back,
        ...(row.hint !== undefined && { hint: row.hint || null }),
        ...(row.extra !== undefined && { extra: row.extra || null }),
      }

      if (input.duplicates !== 'duplicate') {
        const found = (row.id ? byId.get(row.id) : undefined) ?? byKey.get(key)
        if (found) {
          if (input.duplicates === 'skip') skipped += 1
          else {
            // Content is replaced and tags are merged. Progress from the file only
            // wins when it's newer than the card's own last review, so restoring an
            // old backup never rolls back study done since.
            const tags = [...new Set([...found.tags, ...row.tags])]
            const s = row.scheduling
            const newer = s?.lastReview && (!found.lastReview || new Date(s.lastReview) > found.lastReview)
            // A card matched by ID follows the file into another deck, at its end.
            const moved = found.deckId !== deckId
            if (row.history?.length) histories.push({ cardId: found.id, deckId, history: row.history })
            // Rows that match their card exactly aren't written, so re-importing an export only touches what changed.
            const same =
              !moved &&
              tags.length === found.tags.length &&
              (Object.keys(content) as (keyof typeof content)[]).every((k) => content[k] === found[k]) &&
              (row.suspended === undefined || row.suspended === found.suspended) &&
              !(s && newer)
            if (same) {
              unchanged += 1
              continue
            }
            const position = moved ? takePosition(deckId) : found.position
            await tx
              .update(card)
              .set({
                ...content,
                tags,
                ...(moved && { deckId, position }),
                ...(row.suspended !== undefined && { suspended: row.suspended }),
                ...(s && newer && progressColumns(s)),
              })
              .where(eq(card.id, found.id))
            Object.assign(found, content, { tags, deckId, position })
            if (row.suspended !== undefined) found.suspended = row.suspended
            // Its front may have changed; later rows with the new front match it too.
            byKey.set(key, found)
            if (s && newer) withProgress += 1
            updated += 1
          }
          continue
        }
        const earlier = pending.get(key)
        if (earlier) {
          if (input.duplicates === 'skip') skipped += 1
          else {
            Object.assign(earlier, content, { tags: [...new Set([...(earlier.tags ?? []), ...row.tags])] })
            if (row.history?.length) histories.push({ cardId: earlier.id!, deckId, history: row.history })
          }
          continue
        }
      }

      const position = takePosition(deckId)
      const s = row.scheduling
      const values: typeof card.$inferInsert = {
        id: randomUUID(),
        userId,
        deckId,
        ...content,
        tags: [...new Set(row.tags)],
        position,
        suspended: row.suspended ?? false,
        ...(s && progressColumns(s)),
      }
      if (s && s.state > 0) withProgress += 1
      if (row.history?.length) histories.push({ cardId: values.id!, deckId, history: row.history })
      inserts.push(values)
      if (input.duplicates !== 'duplicate') pending.set(key, values)
    }

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
