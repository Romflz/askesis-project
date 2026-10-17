import {
  assignPresetInput,
  type ChestResult,
  claimQuestInput,
  type DeckPreset,
  deckPresetInput,
  idParam,
  pushSubscriptionInput,
  reviewInput,
  type RewardResult,
  type SettingsPayload,
  userSettingsInput,
} from '@askesis/contracts'
import type { CardState, Dashboard } from '@askesis/core'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { apiFetch } from './api.server.ts'

// The signed-in user's dashboard, answers, rewards, settings and reminders.
// Thin wrappers over the API's /me/* routes.

const json = (data: unknown) => JSON.stringify(data)

// ── Dashboard and reviews ─────────────────────────────────────────────────────

export const getMyDashboard = createServerFn({ method: 'GET' }).handler(() => apiFetch<Dashboard>('/me/dashboard'))

/** Grades a card. The API reschedules it and returns the authoritative memory state. */
export const submitReview = createServerFn({ method: 'POST' })
  .validator(reviewInput)
  .handler(({ data }) =>
    // `drop`: coins from a lucky find, rolled on the server for some answers.
    apiFetch<{ memory: CardState; leech: boolean; drop?: number }>('/me/reviews', { method: 'POST', body: json(data) }),
  )

// ── Rewards ───────────────────────────────────────────────────────────────────

export const openChest = createServerFn({ method: 'POST' }).handler(() =>
  apiFetch<ChestResult>('/me/chest/open', { method: 'POST' }),
)

export const claimQuest = createServerFn({ method: 'POST' })
  .validator(claimQuestInput)
  .handler(({ data }) => apiFetch<RewardResult>('/me/quests/claim', { method: 'POST', body: json(data) }))

// ── Settings and deck presets ─────────────────────────────────────────────────

export const getSettings = createServerFn({ method: 'GET' }).handler(() => apiFetch<SettingsPayload>('/me/settings'))

export const saveSettings = createServerFn({ method: 'POST' })
  .validator(userSettingsInput)
  .handler(({ data }) => apiFetch<{ ok: true }>('/me/settings', { method: 'PUT', body: json(data) }))

export const createPreset = createServerFn({ method: 'POST' })
  .validator(deckPresetInput)
  .handler(({ data }) => apiFetch<DeckPreset>('/me/presets', { method: 'POST', body: json(data) }))

export const updatePreset = createServerFn({ method: 'POST' })
  .validator(z.object({ id: idParam.shape.id, preset: deckPresetInput }))
  .handler(({ data }) => apiFetch<DeckPreset>(`/me/presets/${data.id}`, { method: 'PUT', body: json(data.preset) }))

export const deletePreset = createServerFn({ method: 'POST' })
  .validator(idParam)
  .handler(({ data }) => apiFetch<{ ok: true }>(`/me/presets/${data.id}`, { method: 'DELETE' }))

export const assignDeckPreset = createServerFn({ method: 'POST' })
  .validator(z.object({ deckId: idParam.shape.id, presetId: assignPresetInput.shape.presetId }))
  .handler(({ data }) =>
    apiFetch<{ ok: true }>(`/me/decks/${data.deckId}/preset`, { method: 'PUT', body: json({ presetId: data.presetId }) }),
  )

// ── Sample data ───────────────────────────────────────────────────────────────

/** Replaces the user's decks, cards and rewards with ~11 months of simulated history. Destructive. */
export const loadSampleData = createServerFn({ method: 'POST' }).handler(() =>
  apiFetch<{ ok: true; cards: number; reviews: number }>('/me/sample', { method: 'POST' }),
)

// ── Reminders ─────────────────────────────────────────────────────────────────

/** Whether the server can send Web Push (VAPID keys set), its public key, and this user's subscribed devices. */
export const getPushStatus = createServerFn({ method: 'GET' }).handler(() =>
  apiFetch<{ enabled: boolean; publicKey: string | null; devices: number }>('/me/push'),
)

export const subscribePush = createServerFn({ method: 'POST' })
  .validator(pushSubscriptionInput)
  .handler(({ data }) => apiFetch<{ ok: true }>('/me/push/subscribe', { method: 'POST', body: json(data) }))

export const unsubscribePush = createServerFn({ method: 'POST' })
  .validator(pushSubscriptionInput.pick({ endpoint: true }))
  .handler(({ data }) => apiFetch<{ ok: true }>('/me/push/unsubscribe', { method: 'POST', body: json(data) }))

/** Sends a test notification to every device the user subscribed. */
export const sendTestPush = createServerFn({ method: 'POST' }).handler(() =>
  apiFetch<{ sent: number; devices: number }>('/me/push/test', { method: 'POST' }),
)
