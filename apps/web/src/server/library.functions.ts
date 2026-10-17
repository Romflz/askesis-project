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
  type ImportResult,
  type LibraryPayload,
  renameTagInput,
} from '@askesis/contracts'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { apiFetch } from './api.server.ts'

// Decks, cards, tags and CSV transfer. Thin wrappers over the API's /me/* routes.

const json = (data: unknown) => JSON.stringify(data)
type Ok = { ok: true }

export const getLibrary = createServerFn({ method: 'GET' }).handler(() => apiFetch<LibraryPayload>('/me/library'))

export const createDeck = createServerFn({ method: 'POST' })
  .validator(deckInput)
  .handler(({ data }) => apiFetch<{ id: string; existed: boolean }>('/me/decks', { method: 'POST', body: json(data) }))

export const updateDeck = createServerFn({ method: 'POST' })
  .validator(z.object({ id: idParam.shape.id, patch: deckUpdate }))
  .handler(({ data }) => apiFetch<Ok>(`/me/decks/${data.id}`, { method: 'PATCH', body: json(data.patch) }))

export const deleteDeck = createServerFn({ method: 'POST' })
  .validator(idParam)
  .handler(({ data }) => apiFetch<Ok>(`/me/decks/${data.id}`, { method: 'DELETE' }))

export const listCards = createServerFn({ method: 'GET' })
  .validator(cardListQuery.partial())
  .handler(({ data }) => {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(data)) if (v !== undefined && v !== '') params.set(k, String(v))
    return apiFetch<CardListResult>(`/me/cards?${params}`)
  })

export const createCard = createServerFn({ method: 'POST' })
  .validator(cardInput)
  .handler(({ data }) => apiFetch<CardListItem>('/me/cards', { method: 'POST', body: json(data) }))

export const updateCard = createServerFn({ method: 'POST' })
  .validator(z.object({ id: idParam.shape.id, patch: cardUpdate }))
  .handler(({ data }) => apiFetch<CardListItem>(`/me/cards/${data.id}`, { method: 'PATCH', body: json(data.patch) }))

export const deleteCard = createServerFn({ method: 'POST' })
  .validator(idParam)
  .handler(({ data }) => apiFetch<Ok>(`/me/cards/${data.id}`, { method: 'DELETE' }))

export const bulkCards = createServerFn({ method: 'POST' })
  .validator(cardBulkInput)
  .handler(({ data }) => apiFetch<Ok>('/me/cards/bulk', { method: 'POST', body: json(data) }))

export const renameTag = createServerFn({ method: 'POST' })
  .validator(renameTagInput)
  .handler(({ data }) => apiFetch<Ok>('/me/tags/rename', { method: 'POST', body: json(data) }))

export const deleteTag = createServerFn({ method: 'POST' })
  .validator(deleteTagInput)
  .handler(({ data }) => apiFetch<Ok>('/me/tags/delete', { method: 'POST', body: json(data) }))

/** Rows are parsed in the browser (parseDelimited/buildRows from @askesis/core) and validated again here. */
export const importCards = createServerFn({ method: 'POST' })
  .validator(importInput)
  .handler(({ data }) => apiFetch<ImportResult>('/me/import', { method: 'POST', body: json(data) }))

export const exportCards = createServerFn({ method: 'POST' })
  .validator(exportInput)
  .handler(({ data }) => apiFetch<ExportResult>('/me/export', { method: 'POST', body: json(data) }))
