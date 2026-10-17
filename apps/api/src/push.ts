import { buildDashboard, dayKey, hourOf } from '@askesis/core'
import { and, eq, isNull, ne, or, schema } from '@askesis/db'
import type { FastifyBaseLogger } from 'fastify'
import webpush from 'web-push'
import { dayConfig, loadCollection } from './collection.ts'
import { db } from './db.ts'
import { env } from './env.ts'

// Web Push: at most one reminder per user per day, sent at the hour they picked
// (6 AM by default) or when their study day resets if they chose that, in their
// own time zone, and only when something is due.

const { pushSubscription, userSettings } = schema

export const pushEnabled = Boolean(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY)
if (pushEnabled) webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY!, env.VAPID_PRIVATE_KEY!)

export interface PushPayload {
  title: string
  body: string
  url?: string
  tag?: string
}

type Sub = { id: string; endpoint: string; p256dh: string; auth: string }

/** Sends one notification; subscriptions the push service has dropped are deleted. */
export async function sendPush(sub: Sub, payload: PushPayload): Promise<boolean> {
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload),
      // An undelivered reminder expires after 12 hours, and a newer one with the same topic replaces it.
      { TTL: 12 * 3600, urgency: 'normal', topic: payload.tag ?? 'askesis' },
    )
    return true
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode
    if (status === 404 || status === 410) await db.delete(pushSubscription).where(eq(pushSubscription.id, sub.id))
    return false
  }
}

function plural(n: number, one: string, many = `${one}s`) {
  return `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`
}

/** Builds today's reminder from the learner's real queue, or null when nothing is due. */
async function reminderFor(userId: string, atReset: boolean): Promise<PushPayload | null> {
  const dash = buildDashboard(await loadCollection(userId))
  const { new: fresh, learning, review } = dash.due
  if (fresh + learning + review === 0) return null

  const reviews = review + learning
  const parts = [fresh && plural(fresh, 'new card'), reviews && plural(reviews, 'review')].filter(Boolean)
  // Estimate a new card at 2.5 times the learner's average review time.
  const seconds = reviews * dash.secondsPerReview + fresh * dash.secondsPerReview * 2.5
  const minutes = Math.max(1, Math.round(seconds / 60))
  const streak = dash.streak.current
  return {
    title: atReset ? 'Your Askesis day just started' : 'Time for Askesis',
    body: `${parts.join(' and ')} ready, about ${minutes} min. ${
      streak > 0 ? `Keep your ${plural(streak, 'day')} streak going.` : 'Start a streak today.'
    }`,
    url: '/dashboard',
    tag: 'askesis-daily',
  }
}

/** One pass over all subscribed users; safe to run often and from several processes. */
export async function runReminders(now = new Date()) {
  const rows = await db
    .select({
      id: pushSubscription.id,
      userId: pushSubscription.userId,
      endpoint: pushSubscription.endpoint,
      p256dh: pushSubscription.p256dh,
      auth: pushSubscription.auth,
      timeZone: userSettings.timeZone,
      rolloverHour: userSettings.rolloverHour,
      reminderHour: userSettings.reminderHour,
    })
    .from(pushSubscription)
    .innerJoin(userSettings, eq(userSettings.userId, pushSubscription.userId))

  const byUser = new Map<string, typeof rows>()
  for (const row of rows) byUser.set(row.userId, [...(byUser.get(row.userId) ?? []), row])

  let sent = 0
  for (const [userId, subs] of byUser) {
    // The settings columns are the same on every row of a user.
    const settings = subs[0]!
    const cfg = dayConfig(settings)
    const atReset = settings.reminderHour === null
    if (hourOf(now, cfg) !== (settings.reminderHour ?? settings.rolloverHour)) continue
    const today = dayKey(now, cfg)

    // Claim each subscription for today first, so concurrent runs never double-send.
    // The claim stands even if nothing is due: the queue is checked once a day.
    const claimed: Sub[] = []
    for (const sub of subs) {
      const [row] = await db
        .update(pushSubscription)
        .set({ lastSentDay: today })
        .where(
          and(eq(pushSubscription.id, sub.id), or(isNull(pushSubscription.lastSentDay), ne(pushSubscription.lastSentDay, today))),
        )
        .returning({ id: pushSubscription.id })
      if (row) claimed.push(sub)
    }
    if (claimed.length === 0) continue

    const payload = await reminderFor(userId, atReset)
    if (!payload) continue
    for (const sub of claimed) if (await sendPush(sub, payload)) sent += 1
  }
  return sent
}

/** Runs the reminder pass now and every two minutes; returns a function that stops it. */
export function startReminderJob(log: FastifyBaseLogger): () => void {
  if (!pushEnabled) {
    log.info('daily push reminders are off: set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY to enable them')
    return () => {}
  }
  const tick = () =>
    runReminders()
      .then((n) => n > 0 && log.info({ sent: n }, 'sent daily reminders'))
      .catch((error) => log.error(error, 'daily reminder run failed'))
  void tick()
  const timer = setInterval(tick, 2 * 60_000)
  return () => clearInterval(timer)
}
