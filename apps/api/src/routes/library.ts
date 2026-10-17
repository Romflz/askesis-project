import {
  cardBulkInput,
  cardInput,
  type CardListItem,
  cardListQuery,
  type CardListResult,
  cardUpdate,
  deckInput,
  deckUpdate,
  deleteTagInput,
  exportInput,
  type ExportResult,
  idParam,
  importInput,
  type LibraryPayload,
  renameTagInput,
} from '@askesis/contracts'
import { addDays, dayKey, dayStart, exportCsv, type ImportReview, SEPARATORS } from '@askesis/core'
import { and, arrayContains, asc, count, desc, eq, ilike, inArray, isNull, lt, lte, or, schema, sql } from '@askesis/db'
import type { FastifyInstance } from 'fastify'
import { dayConfig, ensureSetup } from '../collection.ts'
import { db } from '../db.ts'
import { requireSession } from '../http.ts'
import { newIdentifiers } from '../identifiers.ts'
import {
  deckPaths,
  defaultPresetId,
  hasTag,
  importRows,
  libraryDecks,
  tagLevels,
  tagSummary,
  withDescendants,
} from '../library.ts'

const { deck, deckPreset, card, reviewLog } = schema

// Escapes LIKE wildcards, so searching for "50%" or "a_b" matches them literally.
const escapeLike = (s: string) => s.replace(/[\\%_]/g, (m) => `\\${m}`)

function toItem(c: typeof card.$inferSelect): CardListItem {
  return {
    id: c.id,
    deckId: c.deckId,
    front: c.front,
    back: c.back,
    hint: c.hint,
    extra: c.extra,
    tags: c.tags,
    suspended: c.suspended,
    state: c.state as CardListItem['state'],
    due: c.due.toISOString(),
    interval: c.interval,
    ease: c.ease,
    reps: c.reps,
    lapses: c.lapses,
    createdAt: c.createdAt.toISOString(),
  }
}

export async function libraryRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireSession)
  const uid = (request: { session: { user: { id: string } } | null }) => request.session!.user.id

  async function ownedDecks(userId: string) {
    return db.select().from(deck).where(eq(deck.userId, userId))
  }

  app.get('/me/library', async (request): Promise<LibraryPayload> => {
    const userId = uid(request)
    const settings = await ensureSetup(userId)
    const [decks, presets, tags, levels] = await Promise.all([
      libraryDecks(userId, dayConfig(settings)),
      db
        .select({ id: deckPreset.id, name: deckPreset.name, isDefault: deckPreset.isDefault })
        .from(deckPreset)
        .where(eq(deckPreset.userId, userId))
        .orderBy(asc(deckPreset.createdAt)),
      tagSummary(userId),
      tagLevels(userId),
    ])
    return { decks, presets, tags, tagLevels: levels }
  })

  // ── Decks ──

  app.post('/me/decks', async (request, reply) => {
    const userId = uid(request)
    const input = deckInput.parse(request.body)
    await ensureSetup(userId)
    const decks = await ownedDecks(userId)
    if (input.parentId && !decks.some((d) => d.id === input.parentId)) return reply.code(404).send({ error: 'parent_not_found' })
    // Same name under the same parent: hand back the existing deck instead of a twin.
    const twin = decks.find((d) => d.parentId === input.parentId && d.name.toLowerCase() === input.name.toLowerCase())
    if (twin) return { id: twin.id, existed: true }
    const parent = decks.find((d) => d.id === input.parentId)
    const presetId = input.presetId ?? parent?.presetId ?? (await defaultPresetId(userId))
    const [created] = await db
      .insert(deck)
      .values({
        userId,
        name: input.name,
        parentId: input.parentId,
        presetId,
        icon: input.icon,
        description: input.description,
        position: Math.max(0, ...decks.map((d) => d.position)) + 1,
      })
      .returning({ id: deck.id })
    return reply.code(201).send({ id: created!.id, existed: false })
  })

  app.patch('/me/decks/:id', async (request, reply) => {
    const userId = uid(request)
    const { id } = idParam.parse(request.params)
    const input = deckUpdate.parse(request.body)
    const decks = await ownedDecks(userId)
    const current = decks.find((d) => d.id === id)
    if (!current) return reply.code(404).send({ error: 'not_found' })

    const parentId = input.parentId === undefined ? current.parentId : input.parentId
    if (parentId) {
      if (!decks.some((d) => d.id === parentId)) return reply.code(404).send({ error: 'parent_not_found' })
      if (withDescendants(decks, [id]).includes(parentId)) return reply.code(400).send({ error: 'cannot_move_into_itself' })
    }
    const name = input.name ?? current.name
    const clash = decks.find((d) => d.id !== id && d.parentId === parentId && d.name.toLowerCase() === name.toLowerCase())
    if (clash) return reply.code(409).send({ error: 'name_taken' })
    if (input.presetId) {
      const [preset] = await db
        .select({ id: deckPreset.id })
        .from(deckPreset)
        .where(and(eq(deckPreset.id, input.presetId), eq(deckPreset.userId, userId)))
      if (!preset) return reply.code(404).send({ error: 'preset_not_found' })
    }
    await db
      .update(deck)
      .set({ ...input, parentId })
      .where(eq(deck.id, id))
    return { ok: true }
  })

  // Deleting a deck deletes its subdecks and their cards (the client confirms first).
  app.delete('/me/decks/:id', async (request, reply) => {
    const userId = uid(request)
    const { id } = idParam.parse(request.params)
    const [deleted] = await db
      .delete(deck)
      .where(and(eq(deck.id, id), eq(deck.userId, userId)))
      .returning({ id: deck.id })
    if (!deleted) return reply.code(404).send({ error: 'not_found' })
    return { ok: true }
  })

  // ── Cards ──

  app.get('/me/cards', async (request): Promise<CardListResult> => {
    const userId = uid(request)
    const q = cardListQuery.parse(request.query)
    const settings = await ensureSetup(userId)
    const cfg = dayConfig(settings)
    const dayEnd = dayStart(addDays(dayKey(new Date(), cfg), 1), cfg)

    const deckIds = q.deckId ? withDescendants(await ownedDecks(userId), [q.deckId]) : null
    const filter = {
      all: undefined,
      new: eq(card.state, 0),
      learning: inArray(card.state, [1, 3]),
      review: eq(card.state, 2),
      // Buried cards aren't due until their bury ends, matching the study queue and deck counts.
      due: and(
        sql`${card.state} > 0`,
        lt(card.due, dayEnd),
        eq(card.suspended, false),
        or(isNull(card.buriedUntil), lte(card.buriedUntil, new Date())),
      ),
      suspended: eq(card.suspended, true),
      leech: arrayContains(card.tags, ['leech']),
    }[q.filter]
    const where = and(
      eq(card.userId, userId),
      deckIds ? (deckIds.length ? inArray(card.deckId, deckIds) : sql`false`) : undefined,
      q.q ? or(ilike(card.front, `%${escapeLike(q.q)}%`), ilike(card.back, `%${escapeLike(q.q)}%`)) : undefined,
      q.tag ? hasTag(q.tag) : undefined,
      filter,
    )
    const order = {
      created: [desc(card.createdAt), asc(card.position)],
      due: [asc(card.due)],
      front: [asc(card.front)],
      lapses: [desc(card.lapses), asc(card.due)],
    }[q.sort]

    const [rows, [totals]] = await Promise.all([
      db
        .select()
        .from(card)
        .where(where)
        .orderBy(...order)
        .limit(q.pageSize)
        .offset((q.page - 1) * q.pageSize),
      db.select({ total: count() }).from(card).where(where),
    ])
    const total = totals?.total ?? 0
    return { items: rows.map(toItem), total, page: q.page, pageCount: Math.max(1, Math.ceil(total / q.pageSize)) }
  })

  app.post('/me/cards', async (request, reply) => {
    const userId = uid(request)
    const input = cardInput.parse(request.body)
    const [target] = await db
      .select()
      .from(deck)
      .where(and(eq(deck.id, input.deckId), eq(deck.userId, userId)))
    if (!target) return reply.code(404).send({ error: 'deck_not_found' })
    const [last] = await db
      .select({ position: sql<number>`coalesce(max(${card.position}), -1)::int` })
      .from(card)
      .where(eq(card.deckId, input.deckId))
    const [identifier] = await newIdentifiers(db, userId, 1)
    const [created] = await db
      .insert(card)
      .values({
        userId,
        identifier: identifier!,
        ...input,
        hint: input.hint || null,
        extra: input.extra || null,
        tags: [...new Set(input.tags)],
        position: (last?.position ?? -1) + 1,
      })
      .returning()
    return reply.code(201).send(toItem(created!))
  })

  app.patch('/me/cards/:id', async (request, reply) => {
    const userId = uid(request)
    const { id } = idParam.parse(request.params)
    const input = cardUpdate.parse(request.body)
    if (input.deckId) {
      const [target] = await db
        .select({ id: deck.id })
        .from(deck)
        .where(and(eq(deck.id, input.deckId), eq(deck.userId, userId)))
      if (!target) return reply.code(404).send({ error: 'deck_not_found' })
    }
    const [updated] = await db
      .update(card)
      .set({
        ...input,
        ...(input.hint !== undefined && { hint: input.hint || null }),
        ...(input.extra !== undefined && { extra: input.extra || null }),
        ...(input.tags && { tags: [...new Set(input.tags)] }),
      })
      .where(and(eq(card.id, id), eq(card.userId, userId)))
      .returning()
    if (!updated) return reply.code(404).send({ error: 'not_found' })
    return toItem(updated)
  })

  app.delete('/me/cards/:id', async (request, reply) => {
    const userId = uid(request)
    const { id } = idParam.parse(request.params)
    const [deleted] = await db
      .delete(card)
      .where(and(eq(card.id, id), eq(card.userId, userId)))
      .returning({ id: card.id })
    if (!deleted) return reply.code(404).send({ error: 'not_found' })
    return { ok: true }
  })

  // Browser-style bulk actions on selected cards.
  app.post('/me/cards/bulk', async (request, reply) => {
    const userId = uid(request)
    const input = cardBulkInput.parse(request.body)
    const mine = and(eq(card.userId, userId), inArray(card.id, input.ids))
    switch (input.action) {
      case 'suspend':
      case 'unsuspend':
        await db
          .update(card)
          .set({ suspended: input.action === 'suspend' })
          .where(mine)
        break
      case 'delete':
        await db.delete(card).where(mine)
        break
      case 'move': {
        if (!input.deckId) return reply.code(400).send({ error: 'deck_required' })
        const [target] = await db
          .select({ id: deck.id })
          .from(deck)
          .where(and(eq(deck.id, input.deckId), eq(deck.userId, userId)))
        if (!target) return reply.code(404).send({ error: 'deck_not_found' })
        await db.update(card).set({ deckId: input.deckId }).where(mine)
        break
      }
      case 'addTag':
      case 'removeTag': {
        if (!input.tag) return reply.code(400).send({ error: 'tag_required' })
        const tags =
          input.action === 'addTag'
            ? sql`array(select distinct unnest(array_append(${card.tags}, ${input.tag}::text)))`
            : sql`array_remove(${card.tags}, ${input.tag}::text)`
        await db.update(card).set({ tags }).where(mine)
        break
      }
      case 'forget':
        // Back to new: scheduling resets, the review log stays.
        await db
          .update(card)
          .set({
            state: 0,
            due: new Date(),
            interval: 0,
            ease: 0,
            stability: 0,
            difficulty: 0,
            step: 0,
            reps: 0,
            lapses: 0,
            lastReview: null,
            buriedUntil: null,
          })
          .where(mine)
        break
    }
    return { ok: true }
  })

  // ── Tags ──

  app.get('/me/tags', async (request) => tagSummary(uid(request)))

  // Renaming or deleting a tag also covers the tags below it:
  // "lpic1::batch" → "lpic1::imports" renames "lpic1::batch::x" to "lpic1::imports::x".
  const underTag = (tag: string) =>
    sql`exists (select 1 from unnest(${card.tags}) as ct(tag) where ct.tag = ${tag} or starts_with(ct.tag, ${`${tag}::`}))`

  app.post('/me/tags/rename', async (request) => {
    const userId = uid(request)
    const { from, to } = renameTagInput.parse(request.body)
    await db
      .update(card)
      .set({
        tags: sql`array(select distinct case when ct.tag = ${from} then ${to}::text
          when starts_with(ct.tag, ${`${from}::`}) then ${to}::text || substr(ct.tag, length(${from}::text) + 1)
          else ct.tag end from unnest(${card.tags}) as ct(tag))`,
      })
      .where(and(eq(card.userId, userId), underTag(from)))
    return { ok: true }
  })

  app.post('/me/tags/delete', async (request) => {
    const userId = uid(request)
    const { tag } = deleteTagInput.parse(request.body)
    await db
      .update(card)
      .set({
        tags: sql`array(select ct.tag from unnest(${card.tags}) as ct(tag)
          where not (ct.tag = ${tag} or starts_with(ct.tag, ${`${tag}::`})))`,
      })
      .where(and(eq(card.userId, userId), underTag(tag)))
    return { ok: true }
  })

  // ── Import / export ──

  app.post('/me/import', { bodyLimit: 64 * 1024 * 1024 }, async (request) => {
    const userId = uid(request)
    const input = importInput.parse(request.body)
    await ensureSetup(userId)
    return importRows(userId, input)
  })

  app.post('/me/export', async (request): Promise<ExportResult> => {
    const userId = uid(request)
    const input = exportInput.parse(request.body)
    const progress = input.scheduling
    // History is only exported along with progress.
    const withHistory = progress && input.history
    const decks = await ownedDecks(userId)
    const paths = deckPaths(decks)
    const ids = input.deckIds.length ? withDescendants(decks, input.deckIds) : decks.map((d) => d.id)
    const cards = ids.length
      ? await db
          .select()
          .from(card)
          .where(and(eq(card.userId, userId), inArray(card.deckId, ids)))
          .orderBy(asc(card.deckId), asc(card.position))
      : []

    // Past answers for the exported cards, oldest first.
    const history = new Map<string, ImportReview[]>()
    if (withHistory && cards.length) {
      const logs = await db
        .select({
          cardId: reviewLog.cardId,
          at: reviewLog.reviewedAt,
          rating: reviewLog.rating,
          ms: reviewLog.durationMs,
          stateBefore: reviewLog.stateBefore,
          stateAfter: reviewLog.stateAfter,
          intervalBefore: reviewLog.intervalBefore,
          intervalAfter: reviewLog.intervalAfter,
          ease: reviewLog.easeAfter,
        })
        .from(reviewLog)
        .innerJoin(card, and(eq(card.id, reviewLog.cardId), eq(card.userId, reviewLog.userId)))
        .where(and(eq(reviewLog.userId, userId), inArray(card.deckId, ids)))
        .orderBy(asc(reviewLog.reviewedAt), asc(reviewLog.id))
      for (const l of logs) {
        const list = history.get(l.cardId) ?? []
        list.push({
          at: l.at.toISOString(),
          rating: l.rating as ImportReview['rating'],
          ms: l.ms,
          stateBefore: l.stateBefore as ImportReview['stateBefore'],
          stateAfter: l.stateAfter as ImportReview['stateAfter'],
          intervalBefore: l.intervalBefore,
          intervalAfter: l.intervalAfter,
          ease: l.ease,
        })
        history.set(l.cardId, list)
      }
    }

    const content = exportCsv(
      cards
        .map((c) => ({
          identifier: c.identifier,
          deck: paths.get(c.deckId)!,
          front: c.front,
          back: c.back,
          hint: c.hint,
          extra: c.extra,
          tags: c.tags,
          suspended: progress ? c.suspended : undefined,
          // New cards export as state 0 with no review, so they come back new.
          scheduling: progress
            ? {
                state: c.state as 0 | 1 | 2 | 3,
                due: c.due.toISOString(),
                interval: c.interval,
                ease: c.ease,
                stability: c.stability,
                difficulty: c.difficulty,
                step: c.step,
                reps: c.reps,
                lapses: c.lapses,
                lastReview: c.lastReview?.toISOString() ?? null,
              }
            : undefined,
          history: withHistory ? history.get(c.id) : undefined,
        }))
        .sort((a, b) => a.deck.localeCompare(b.deck)),
      SEPARATORS[input.separator],
      { progress, history: withHistory },
    )
    // File named after the deck, e.g. askesis-japanese-kanji-2026-10-15.csv.
    const single = input.deckIds.length === 1 ? paths.get(input.deckIds[0]!) : null
    const slug =
      (single ?? 'all-decks')
        .toLowerCase()
        .replace(/::/g, '-')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'decks'
    const ext = input.separator === 'tab' ? 'tsv' : 'csv'
    return { filename: `askesis-${slug}-${new Date().toISOString().slice(0, 10)}.${ext}`, content, cards: cards.length }
  })
}
