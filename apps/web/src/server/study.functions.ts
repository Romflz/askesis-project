import { idParam, studyInput, type StudyPreview, undoInput } from '@askesis/contracts'
import type { QueueCard, StudyQueue } from '@askesis/core'
import { createServerFn } from '@tanstack/react-start'
import { apiFetch } from './api.server.ts'

// Study sessions. Answers are saved with submitReview (askesis.functions.ts),
// except in cram mode, where answers don't reschedule and nothing is sent.

const json = (data: unknown) => JSON.stringify(data)

/** The queue for one session, built from a selection (decks, tags, mode, order, limit). */
export const getStudyQueue = createServerFn({ method: 'POST' })
  .validator(studyInput)
  .handler(({ data }) => apiFetch<StudyQueue>('/me/study/queue', { method: 'POST', body: json(data) }))

/** What a selection would hold (session size, matching cards, counts by kind), shown before starting. */
export const previewStudy = createServerFn({ method: 'POST' })
  .validator(studyInput)
  .handler(({ data }) => apiFetch<StudyPreview>('/me/study/preview', { method: 'POST', body: json(data) }))

export const undoReview = createServerFn({ method: 'POST' })
  .validator(undoInput)
  // `undoneDrop`: coins from a lucky find on that answer, taken back with it.
  .handler(({ data }) =>
    apiFetch<{ card: QueueCard; undoneDrop?: number }>('/me/reviews/undo', { method: 'POST', body: json(data) }),
  )

/** Hides a card until the next study day starts (`until`, in the user's time zone and rollover hour). */
export const buryCard = createServerFn({ method: 'POST' })
  .validator(idParam)
  .handler(({ data }) => apiFetch<{ ok: true; until: string }>(`/me/cards/${data.id}/bury`, { method: 'POST' }))
