import {
  assignPresetInput,
  type ChestResult,
  claimQuestInput,
  type RewardResult,
  deckPresetInput,
  idParam,
  pushSubscriptionInput,
  reviewInput,
  type SettingsPayload,
  studyInput,
  userSettingsInput,
} from '@askesis/contracts'
import {
  answer,
  buildDashboard,
  type CardState,
  dayKey,
  MAX_FREEZES,
  rollChest,
  rollLuckyDrop,
  serializeMemory,
} from '@askesis/core'
import { simulateCollection } from '@askesis/core/demo'
import { and, asc, count, eq, schema } from '@askesis/db'
import type { FastifyInstance, FastifyRequest } from 'fastify'
import {
  dayConfig,
  ensureSetup,
  isTimeZone,
  loadCollection,
  memoryColumns,
  saveQuestOffers,
  schedulerPreset,
  toMemory,
  toPreset,
} from '../collection.ts'
import { db } from '../db.ts'
import { env } from '../env.ts'
import { requireSession } from '../http.ts'
import { pushEnabled, sendPush } from '../push.ts'
import { selectCards, toQueueCard } from './study.ts'

const { userSettings, deckPreset, deck, card, reviewLog, streakFreeze, pushSubscription, reward, dailyQuest } = schema

/** Cards in the dashboard's inline session. */
const QUICK_SESSION = 12

/** The device time zone the web app records in a cookie (see themeScript in the web app). */
export function zoneHint(request: FastifyRequest): string | undefined {
  const match = /(?:^|;\s*)askesis_tz=([^;]+)/.exec(request.headers.cookie ?? '')
  if (!match) return undefined
  try {
    return decodeURIComponent(match[1]!)
  } catch {
    return undefined
  }
}

export async function meRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireSession)
  const uid = (request: { session: { user: { id: string } } | null }) => request.session!.user.id

  app.get('/me/dashboard', async (request) => {
    const userId = uid(request)
    const col = await loadCollection(userId, zoneHint(request))
    const dashboard = buildDashboard(col)
    await saveQuestOffers(userId, col, dashboard)
    // The inline quick session starts exactly where /study/session would: same
    // scheduler, same order, same daily limits.
    const { cards } = await selectCards(userId, studyInput.parse({}))
    return { ...dashboard, queue: cards.slice(0, QUICK_SESSION).map(toQueueCard) }
  })

  // ── Rewards: daily chest and quest claims ──
  // Each checks the dashboard (the source of truth for today's chest and quests);
  // a unique index on (user, day, kind, key) makes double claims impossible.

  app.post('/me/chest/open', async (request, reply): Promise<ChestResult> => {
    const userId = uid(request)
    const dash = buildDashboard(await loadCollection(userId, zoneHint(request)))
    if (dash.chest.opened) return reply.code(409).send({ error: 'already_opened', ...dash.chest.opened })
    const { tier, weekly } = dash.chest
    const roll = rollChest(tier, weekly)
    const result = await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(reward)
        .values({ userId, day: dash.today, kind: 'chest', key: 'daily', ...roll })
        .onConflictDoNothing()
        .returning({ id: reward.id })
      if (!row) return null
      // A weekly chest banks a streak freeze too, while the bank has room.
      let freeze = false
      if (weekly) {
        const [s] = await tx
          .select({ banked: userSettings.streakFreezes })
          .from(userSettings)
          .where(eq(userSettings.userId, userId))
        if (s && s.banked < MAX_FREEZES) {
          await tx
            .update(userSettings)
            .set({ streakFreezes: s.banked + 1 })
            .where(eq(userSettings.userId, userId))
          freeze = true
        }
      }
      return { ...roll, tier, weekly, freeze }
    })
    if (!result) return reply.code(409).send({ error: 'already_opened' })
    return result
  })

  app.post('/me/quests/claim', async (request, reply): Promise<RewardResult> => {
    const userId = uid(request)
    const { id } = claimQuestInput.parse(request.body)
    const col = await loadCollection(userId, zoneHint(request))
    const dash = buildDashboard(col)
    await saveQuestOffers(userId, col, dash)
    const quest = dash.quests.find((q) => q.id === id)
    if (!quest) return reply.code(404).send({ error: 'not_found' })
    if (quest.claimed) return reply.code(409).send({ error: 'already_claimed' })
    if (quest.progress < quest.target) return reply.code(409).send({ error: 'not_complete' })
    // Claiming the last open quest also pays the all-quests bonus, in the same insert.
    const lastOne = dash.quests.every((q) => q.id === id || q.claimed) && !dash.questBonus.claimed
    const rows = await db
      .insert(reward)
      .values([
        { userId, day: dash.today, kind: 'quest', key: quest.metric, xp: quest.xp, coins: quest.coins },
        ...(lastOne
          ? [{ userId, day: dash.today, kind: 'quest', key: 'bonus', xp: dash.questBonus.xp, coins: dash.questBonus.coins }]
          : []),
      ])
      .onConflictDoNothing()
      .returning({ key: reward.key })
    if (!rows.some((r) => r.key === quest.metric)) return reply.code(409).send({ error: 'already_claimed' })
    return {
      xp: quest.xp,
      coins: quest.coins,
      ...(rows.some((r) => r.key === 'bonus') && { bonus: { xp: dash.questBonus.xp, coins: dash.questBonus.coins } }),
    }
  })

  // Grading is authoritative here: the client previews the same scheduler, the server decides.
  app.post('/me/reviews', async (request, reply): Promise<{ memory: CardState; leech: boolean; drop?: number }> => {
    const userId = uid(request)
    const input = reviewInput.parse(request.body)
    const [row] = await db
      .select({ card, preset: deckPreset })
      .from(card)
      .innerJoin(deck, eq(deck.id, card.deckId))
      .innerJoin(deckPreset, eq(deckPreset.id, deck.presetId))
      .where(and(eq(card.id, input.cardId), eq(card.userId, userId)))
    if (!row) return reply.code(404).send({ error: 'not_found' })

    const preset = toPreset(row.preset)
    const before = toMemory(row.card)
    const now = new Date()
    const after = answer(before, input.rating, now, schedulerPreset(preset))

    // Leeches are flagged at the threshold, then every half-threshold of further lapses.
    const lapsed = input.rating === 1 && before.state === 2
    const overflow = after.lapses - preset.leechThreshold
    const leech = lapsed && overflow >= 0 && overflow % Math.max(1, Math.ceil(preset.leechThreshold / 2)) === 0
    const tags = leech && !row.card.tags.includes('leech') ? [...row.card.tags, 'leech'] : row.card.tags
    const suspended = row.card.suspended || (leech && preset.leechAction === 'suspend')

    // Now and then an answer turns up a few coins (a lucky find).
    const drop = rollLuckyDrop()
    const day = drop ? dayKey(now, dayConfig(await ensureSetup(userId))) : null

    await db.transaction(async (tx) => {
      await tx
        .update(card)
        .set({ ...memoryColumns(after), tags, suspended })
        .where(eq(card.id, row.card.id))
      const [log] = await tx
        .insert(reviewLog)
        .values({
          userId,
          cardId: row.card.id,
          deckId: row.card.deckId,
          rating: input.rating,
          stateBefore: before.state,
          stateAfter: after.state,
          intervalBefore: before.interval,
          intervalAfter: after.interval,
          easeAfter: after.ease,
          durationMs: input.durationMs,
          memoryBefore: serializeMemory(before),
          reviewedAt: now,
        })
        .returning({ id: reviewLog.id })
      if (drop && day) await tx.insert(reward).values({ userId, day, kind: 'drop', key: `review:${log!.id}`, coins: drop })
    })
    return { memory: serializeMemory(after), leech, ...(drop && { drop }) }
  })

  app.get('/me/settings', async (request): Promise<SettingsPayload> => {
    const userId = uid(request)
    const settings = await ensureSetup(userId, zoneHint(request))
    const [presets, decks, counts] = await Promise.all([
      db.select().from(deckPreset).where(eq(deckPreset.userId, userId)).orderBy(asc(deckPreset.createdAt)),
      db.select().from(deck).where(eq(deck.userId, userId)).orderBy(asc(deck.position), asc(deck.name)),
      db.select({ deckId: card.deckId, n: count() }).from(card).where(eq(card.userId, userId)).groupBy(card.deckId),
    ])
    const cardsByDeck = new Map(counts.map((c) => [c.deckId, c.n]))
    return {
      settings: {
        dailyGoal: settings.dailyGoal,
        rolloverHour: settings.rolloverHour,
        learnAheadMinutes: settings.learnAheadMinutes,
        timeZone: settings.timeZone,
        reminderHour: settings.reminderHour,
      },
      presets: presets.map(toPreset),
      decks: decks.map((d) => ({
        id: d.id,
        name: d.name,
        parentId: d.parentId,
        presetId: d.presetId,
        cards: cardsByDeck.get(d.id) ?? 0,
      })),
    }
  })

  app.put('/me/settings', async (request, reply) => {
    const userId = uid(request)
    const input = userSettingsInput.parse(request.body)
    if (!isTimeZone(input.timeZone)) return reply.code(400).send({ error: 'invalid_time_zone' })
    await ensureSetup(userId, zoneHint(request))
    await db.update(userSettings).set(input).where(eq(userSettings.userId, userId))
    return { ok: true }
  })

  app.post('/me/presets', async (request, reply) => {
    const userId = uid(request)
    const input = deckPresetInput.parse(request.body)
    await ensureSetup(userId, zoneHint(request))
    const [created] = await db
      .insert(deckPreset)
      .values({ ...input, userId })
      .returning()
    return reply.code(201).send(toPreset(created!))
  })

  app.put('/me/presets/:id', async (request, reply) => {
    const userId = uid(request)
    const { id } = idParam.parse(request.params)
    const input = deckPresetInput.parse(request.body)
    const [updated] = await db
      .update(deckPreset)
      .set(input)
      .where(and(eq(deckPreset.id, id), eq(deckPreset.userId, userId)))
      .returning()
    if (!updated) return reply.code(404).send({ error: 'not_found' })
    return toPreset(updated)
  })

  // Decks using a deleted preset fall back to the default one.
  app.delete('/me/presets/:id', async (request, reply) => {
    const userId = uid(request)
    const { id } = idParam.parse(request.params)
    const presets = await db.select().from(deckPreset).where(eq(deckPreset.userId, userId))
    const target = presets.find((p) => p.id === id)
    const fallback = presets.find((p) => p.isDefault)
    if (!target) return reply.code(404).send({ error: 'not_found' })
    if (target.isDefault || !fallback) return reply.code(400).send({ error: 'cannot_delete_default' })
    await db.transaction(async (tx) => {
      await tx
        .update(deck)
        .set({ presetId: fallback.id })
        .where(and(eq(deck.userId, userId), eq(deck.presetId, id)))
      await tx.delete(deckPreset).where(eq(deckPreset.id, id))
    })
    return { ok: true }
  })

  app.put('/me/decks/:id/preset', async (request, reply) => {
    const userId = uid(request)
    const { id } = idParam.parse(request.params)
    const { presetId } = assignPresetInput.parse(request.body)
    const [preset] = await db
      .select({ id: deckPreset.id })
      .from(deckPreset)
      .where(and(eq(deckPreset.id, presetId), eq(deckPreset.userId, userId)))
    if (!preset) return reply.code(404).send({ error: 'preset_not_found' })
    const [updated] = await db
      .update(deck)
      .set({ presetId })
      .where(and(eq(deck.id, id), eq(deck.userId, userId)))
      .returning({ id: deck.id })
    if (!updated) return reply.code(404).send({ error: 'not_found' })
    return { ok: true }
  })

  // ── Push reminders ──

  app.get('/me/push', async (request) => {
    const [row] = await db
      .select({ n: count() })
      .from(pushSubscription)
      .where(eq(pushSubscription.userId, uid(request)))
    return { enabled: pushEnabled, publicKey: pushEnabled ? env.VAPID_PUBLIC_KEY! : null, devices: row?.n ?? 0 }
  })

  app.post('/me/push/subscribe', async (request, reply) => {
    if (!pushEnabled) return reply.code(503).send({ error: 'push_disabled' })
    const userId = uid(request)
    const { endpoint, keys } = pushSubscriptionInput.parse(request.body)
    const userAgent = request.headers['user-agent']?.slice(0, 300) ?? null
    await ensureSetup(userId, zoneHint(request))
    await db
      .insert(pushSubscription)
      .values({ userId, endpoint, p256dh: keys.p256dh, auth: keys.auth, userAgent })
      // One row per browser: re-subscribing, or signing in as someone else, takes over the endpoint.
      .onConflictDoUpdate({ target: pushSubscription.endpoint, set: { userId, p256dh: keys.p256dh, auth: keys.auth, userAgent } })
    return { ok: true }
  })

  app.post('/me/push/unsubscribe', async (request) => {
    const { endpoint } = pushSubscriptionInput.pick({ endpoint: true }).parse(request.body)
    await db
      .delete(pushSubscription)
      .where(and(eq(pushSubscription.endpoint, endpoint), eq(pushSubscription.userId, uid(request))))
    return { ok: true }
  })

  app.post('/me/push/test', async (request, reply) => {
    if (!pushEnabled) return reply.code(503).send({ error: 'push_disabled' })
    const subs = await db
      .select()
      .from(pushSubscription)
      .where(eq(pushSubscription.userId, uid(request)))
    let sent = 0
    for (const sub of subs) {
      const ok = await sendPush(sub, {
        title: 'Reminders are on',
        body: 'Askesis will nudge you once a day when your cards reset.',
        url: '/dashboard',
        tag: 'askesis-test',
      })
      if (ok) sent += 1
    }
    return { sent, devices: subs.length }
  })

  // Replaces the collection with ~11 months of simulated history, for trying out
  // the dashboard. Destructive: the client confirms first.
  app.post('/me/sample', async (request) => {
    const userId = uid(request)
    const settings = await ensureSetup(userId, zoneHint(request))
    const sim = simulateCollection(new Date(), dayConfig(settings))

    await db.transaction(async (tx) => {
      await tx.delete(deck).where(eq(deck.userId, userId))
      await tx.delete(streakFreeze).where(eq(streakFreeze.userId, userId))
      await tx.delete(reward).where(eq(reward.userId, userId))
      await tx.delete(dailyQuest).where(eq(dailyQuest.userId, userId))
      await tx.delete(deckPreset).where(and(eq(deckPreset.userId, userId), eq(deckPreset.isDefault, false)))

      const [preset] = await tx
        .insert(deckPreset)
        .values({ userId, name: 'Sample (FSRS)', ...sim.presets[sim.decks[0]!.presetId]!, newPerDay: 8, reviewsPerDay: 9_999 })
        .returning({ id: deckPreset.id })

      // Top-level decks first (the sample nests one level deep), so a subdeck's
      // parent already has its real id.
      const deckIds = new Map<string, string>()
      const parentsFirst = [...sim.decks].sort((a, b) => Number(!!a.parentId) - Number(!!b.parentId))
      for (const [position, d] of parentsFirst.entries()) {
        const [created] = await tx
          .insert(deck)
          .values({
            userId,
            presetId: preset!.id,
            parentId: d.parentId ? deckIds.get(d.parentId) : null,
            name: d.name,
            icon: d.icon,
            position,
          })
          .returning({ id: deck.id })
        deckIds.set(d.id, created!.id)
      }

      // Inserted in batches to stay under Postgres's 65,535 bind parameters.
      const cardIds = new Map<string, string>()
      for (let i = 0; i < sim.cards.length; i += 2_000) {
        const batch = sim.cards.slice(i, i + 2_000)
        const rows = await tx
          .insert(card)
          .values(
            batch.map((c) => ({
              userId,
              deckId: deckIds.get(c.deckId)!,
              front: c.content.front,
              back: c.content.back,
              hint: c.content.hint,
              extra: c.content.extra,
              position: c.position,
              suspended: c.suspended,
              // Backdated with the simulated history (the "Added" chart reads it).
              createdAt: c.createdAt === undefined ? undefined : new Date(c.createdAt),
              ...memoryColumns(c.memory),
            })),
          )
          .returning({ id: card.id })
        batch.forEach((c, j) => cardIds.set(c.id, rows[j]!.id))
      }

      // The simulation logs buckets rather than exact intervals; store
      // representative values that map back to the same buckets.
      const stateOf = { new: 0, learning: 1, young: 2, mature: 2 } as const
      for (let i = 0; i < sim.logs.length; i += 4_000) {
        await tx.insert(reviewLog).values(
          sim.logs.slice(i, i + 4_000).map((l) => ({
            userId,
            cardId: cardIds.get(l.cardId)!,
            deckId: deckIds.get(l.deckId)!,
            rating: l.rating,
            stateBefore: stateOf[l.kind],
            intervalBefore: l.kind === 'mature' ? 21 : l.kind === 'young' ? 1 : 0,
            stateAfter: l.matureAfter ? 2 : l.rating === 1 ? 1 : 2,
            intervalAfter: l.matureAfter ? 21 : l.rating === 1 ? 0 : 1,
            easeAfter: 0,
            durationMs: l.ms,
            reviewedAt: new Date(l.t),
          })),
        )
      }
      if (sim.freezes.length) {
        await tx.insert(streakFreeze).values(sim.freezes.map((day) => ({ userId, day })))
      }
    })
    return { ok: true, cards: sim.cards.length, reviews: sim.logs.length }
  })
}
