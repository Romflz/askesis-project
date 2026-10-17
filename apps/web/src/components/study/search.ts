import type { STUDY_MODES, StudyInput } from '@askesis/contracts'
import { int, oneOf, str } from '../../lib/search-params.ts'

// URL contract for /study/session (other pages link here):
//   ?decks=<id,id>&tags=<a,b>&match=<any|all>&xtags=<c,d>&mode=<mode>&order=<mixed|due|random>&limit=<n>&ahead=<days>&forgotten=<days>
// tags are required (any or all of them, per match); cards with any xtags are left out.
// A tag also matches the tags below it: "lang" covers "lang::japanese".
// Every param is optional; bad values fall back to defaults instead of erroring.

export type StudyMode = (typeof STUDY_MODES)[number]
export type StudyOrder = StudyInput['order']
export const STUDY_ORDERS: readonly StudyOrder[] = ['mixed', 'due', 'random']

export interface StudySearch {
  decks?: string
  tags?: string
  match?: 'any' | 'all'
  xtags?: string
  mode?: StudyMode
  order?: StudyOrder
  limit?: number
  ahead?: number
  forgotten?: number
}

// Plain parsing rather than zod: validateSearch runs in the router on every navigation.
export function studySearch(search: Record<string, unknown>): StudySearch {
  return {
    decks: str(search.decks),
    tags: str(search.tags),
    match: oneOf(search.match, ['any', 'all']),
    xtags: str(search.xtags),
    // MODE_INFO has every mode (it's a Record<StudyMode, …>), so it doubles as the list.
    mode: oneOf(search.mode, Object.keys(MODE_INFO) as StudyMode[]),
    order: oneOf(search.order, STUDY_ORDERS),
    limit: int(search.limit, 1, 1_000),
    ahead: int(search.ahead, 1, 365),
    forgotten: int(search.forgotten, 1, 365),
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const list = (s: string | undefined) =>
  s
    ? s
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
    : []

/** The API's study input for a session URL, with defaults filled in and malformed deck ids dropped. */
export function toStudyInput(search: StudySearch): StudyInput {
  return {
    deckIds: list(search.decks).filter((id) => UUID.test(id)),
    tags: list(search.tags).slice(0, 20),
    tagMatch: search.match ?? 'any',
    excludeTags: list(search.xtags).slice(0, 20),
    mode: search.mode ?? 'scheduled',
    order: search.order ?? 'mixed',
    limit: search.limit ?? 100,
    aheadDays: search.ahead ?? 3,
    forgottenDays: search.forgotten ?? 7,
  }
}

/** Search params for a session, leaving out defaults so links stay short. */
export function toSearch(input: Partial<StudyInput>): StudySearch {
  const out: StudySearch = {}
  if (input.deckIds?.length) out.decks = input.deckIds.join(',')
  if (input.tags?.length) out.tags = input.tags.join(',')
  if (input.tags && input.tags.length > 1 && input.tagMatch === 'all') out.match = 'all'
  if (input.excludeTags?.length) out.xtags = input.excludeTags.join(',')
  if (input.mode && input.mode !== 'scheduled') out.mode = input.mode
  if (input.order && input.order !== 'mixed') out.order = input.order
  if (input.limit && input.limit !== 100) out.limit = input.limit
  if (input.aheadDays && input.aheadDays !== 3) out.ahead = input.aheadDays
  if (input.forgottenDays && input.forgottenDays !== 7) out.forgotten = input.forgottenDays
  return out
}

/** How each mode is presented; modes that don't reschedule are practice only. */
export const MODE_INFO: Record<StudyMode, { label: string; blurb: string; reschedules: boolean }> = {
  scheduled: { label: 'Today’s cards', blurb: 'Everything due today, within each deck’s daily limits.', reschedules: true },
  quick: {
    label: 'Quick study',
    blurb: 'Today’s cards you’re closest to forgetting first, new ones only if there’s room.',
    reschedules: true,
  },
  new: { label: 'Extra new cards', blurb: 'Learn more new cards than today’s limit allows.', reschedules: true },
  ahead: { label: 'Review ahead', blurb: 'Review cards that come due in the next few days.', reschedules: true },
  forgotten: { label: 'Forgotten cards', blurb: 'Go over cards you pressed Again on recently.', reschedules: true },
  cram: { label: 'Cram', blurb: 'Practice anything. Answers don’t change when cards come back.', reschedules: false },
}
