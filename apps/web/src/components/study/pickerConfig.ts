import type { DeckNode, StudyInput } from '@askesis/contracts'
import { type StudyMode, type StudyOrder, toSearch, toStudyInput } from './search.ts'

// What the /study page and its custom study popup remember on this device.

export interface PickerConfig {
  all: boolean
  deckIds: string[]
  /** Required tags (any or all of them, per tagMatch). */
  tags: string[]
  tagMatch: 'any' | 'all'
  /** Cards with any of these tags are left out. */
  excludeTags: string[]
  mode: StudyMode
  order: StudyOrder
  limit: number
  aheadDays: number
  forgottenDays: number
}

export const DEFAULT_CONFIG: PickerConfig = {
  all: true,
  deckIds: [],
  tags: [],
  tagMatch: 'any',
  excludeTags: [],
  mode: 'scheduled',
  order: 'mixed',
  limit: 50,
  aheadDays: 3,
  forgottenDays: 7,
}

/** The session a config describes; each mode only carries the params it uses, so links stay short. */
export function inputFor(c: PickerConfig, deckIds: string[]): Partial<StudyInput> {
  return {
    deckIds,
    tags: c.tags,
    tagMatch: c.tagMatch,
    excludeTags: c.excludeTags,
    mode: c.mode,
    order: c.order,
    limit: c.mode === 'scheduled' ? undefined : c.limit,
    aheadDays: c.mode === 'ahead' ? c.aheadDays : undefined,
    forgottenDays: c.mode === 'forgotten' ? c.forgottenDays : undefined,
  }
}

/**
 * The input for a session's preview, normalized the way the session URL is, so
 * equal choices share one cached count. Order never changes the counts, so it's
 * left out and switching it costs no request.
 */
export function previewInput(c: PickerConfig, deckIds: string[]): StudyInput {
  return toStudyInput(toSearch({ ...inputFor(c, deckIds), order: 'mixed' }))
}

export type Due = DeckNode['due']

export const sumDue = (list: Due[]): Due =>
  list.reduce((a, b) => ({ new: a.new + b.new, learning: a.learning + b.learning, review: a.review + b.review }), {
    new: 0,
    learning: 0,
    review: 0,
  })

/** A rough time estimate: about 8 seconds per review or learning card and 20 per new card. */
export const estimateMinutes = (due: Due) => ((due.review + due.learning) * 8 + due.new * 20) / 60

/** A number input's value, clamped to 1…max (blank or invalid counts as 1). */
export const clampCount = (value: string, max: number) => Math.max(1, Math.min(max, Number(value) || 1))
