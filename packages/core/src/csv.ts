// Delimited-text import and export.
//
// Files can carry the header lines common flashcard apps use for text
// import/export, so decks move between them and Askesis:
//
//   #separator:comma          comma | tab | semicolon | pipe (or the character)
//   #html:false               true: fields are HTML (converted to plain text on import)
//   #columns:deck,front,back  names for each column (we also accept a header row)
//   #deck column:1            1-based column holding the deck name ("Parent::Child")
//   #tags column:6            1-based column holding space-separated tags
//
// Without headers, the separator is detected and columns default to front, back.
//
// Exports also carry each card's ID in an `id` column. On import, a row with the
// ID of one of the user's cards updates that card even if its front changed;
// rows without one are matched by deck and front.
//
// Optional progress columns carry each card's scheduling (state, due, interval,
// ease, stability, difficulty, step, reps, lapses, last_review, suspended) and its
// review history, so an export imports back exactly where the learner left off.

import { CARD_ID } from '@askesis/contracts'

export type Separator = ',' | '\t' | ';' | '|'

export const SEPARATORS: Record<'comma' | 'tab' | 'semicolon' | 'pipe', Separator> = {
  comma: ',',
  tab: '\t',
  semicolon: ';',
  pipe: '|',
}

/** Joins a deck to its parents in a full name: "Japanese::Kanji". */
export const DECK_PATH_SEPARATOR = '::'

/** The progress columns, in export order. */
export const SCHEDULING_COLUMNS = [
  'state',
  'due',
  'interval',
  'ease',
  'stability',
  'difficulty',
  'step',
  'reps',
  'lapses',
  'last_review',
  'suspended',
] as const
export type SchedulingColumn = (typeof SCHEDULING_COLUMNS)[number] | 'history'

export type ColumnRole = 'front' | 'back' | 'deck' | 'tags' | 'hint' | 'extra' | 'id' | 'ignore' | SchedulingColumn

/** The content roles and their labels in the import dialog. */
export const COLUMN_ROLES: { role: ColumnRole; label: string }[] = [
  { role: 'front', label: 'Front' },
  { role: 'back', label: 'Back' },
  { role: 'deck', label: 'Deck' },
  { role: 'tags', label: 'Tags' },
  { role: 'hint', label: 'Hint' },
  { role: 'extra', label: 'Extra' },
  { role: 'id', label: 'Card ID' },
  { role: 'ignore', label: 'Ignore' },
]

export interface ParsedFile {
  separator: Separator
  html: boolean
  /** Column names from #columns or a detected header row. */
  columns: string[] | null
  deckColumn: number | null
  tagsColumn: number | null
  /** Plain-text notes exports from other flashcard apps can include a GUID and a note type column; both are skipped. */
  guidColumn: number | null
  notetypeColumn: number | null
  rows: string[][]
}

// ── Parsing ───────────────────────────────────────────────────────────────────

// Header lines of the common text format. Ones we don't use are still consumed, so they aren't read as cards.
const DIRECTIVE = /^#(separator|html|columns|deck column|tags column|notetype|notetype column|guid column|if matches|tags):(.*)$/i

/** Reads a delimited file: its header lines, the separator (detected if not declared) and the rows. */
export function parseDelimited(text: string): ParsedFile {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/)
  const directives = new Map<string, string>()
  let start = 0
  for (; start < lines.length; start++) {
    const match = DIRECTIVE.exec(lines[start]!.trim())
    if (!match) break
    directives.set(match[1]!.toLowerCase(), match[2]!.trim())
  }
  const body = lines.slice(start).join('\n')

  const separator = toSeparator(directives.get('separator')) ?? detectSeparator(body)
  const rows = parseRows(body, separator)
  let columns =
    directives
      .get('columns')
      ?.split(separator)
      .map((c) => c.trim()) ?? null

  // A first row made of known column names is a header, not a card.
  if (!columns && rows[0] && looksLikeHeader(rows[0])) columns = rows.shift()!.map((c) => c.trim())

  // "#deck column:1" and friends are 1-based.
  const index = (value: string | undefined) => {
    const n = value ? Number.parseInt(value, 10) : Number.NaN
    return Number.isFinite(n) && n >= 1 ? n - 1 : null
  }
  return {
    separator,
    html: directives.get('html')?.toLowerCase() === 'true',
    columns,
    deckColumn: index(directives.get('deck column')),
    tagsColumn: index(directives.get('tags column')),
    guidColumn: index(directives.get('guid column')),
    notetypeColumn: index(directives.get('notetype column')),
    rows,
  }
}

function toSeparator(value: string | undefined): Separator | null {
  if (!value) return null
  const v = value.toLowerCase()
  if (v in SEPARATORS) return SEPARATORS[v as keyof typeof SEPARATORS]
  if (v === '\\t') return '\t'
  return ([',', '\t', ';', '|'] as const).find((s) => s === value) ?? null
}

/**
 * Picks the separator that splits the first lines most consistently: one that
 * gives every line the same number of fields beats one that doesn't, and more
 * fields break ties. Falls back to a comma.
 */
function detectSeparator(body: string): Separator {
  const sample = body
    .split('\n')
    .filter((l) => l.trim())
    .slice(0, 10)
  let best: Separator = ','
  let bestScore = 0
  for (const sep of ['\t', ',', ';', '|'] as const) {
    const counts = sample.map((line) => parseRows(line, sep)[0]?.length ?? 1)
    const min = Math.min(...counts)
    const consistent = counts.every((c) => c === counts[0])
    const score = min > 1 ? min + (consistent ? 10 : 0) : 0
    if (score > bestScore) {
      best = sep
      bestScore = score
    }
  }
  return best
}

/** RFC 4180 parsing: quoted fields, doubled quotes, newlines inside quotes. */
export function parseRows(text: string, separator: Separator): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else quoted = false
      } else field += ch
    } else if (ch === '"' && field === '') {
      // A quote only opens a field at its start; elsewhere it's literal.
      quoted = true
    } else if (ch === separator) {
      row.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      if (row.some((f) => f !== '')) rows.push(row)
      row = []
      field = ''
    } else field += ch
  }
  row.push(field)
  if (row.some((f) => f !== '')) rows.push(row)
  return rows
}

/** Column names we recognize (lowercase), mapped to their role. */
const ALIASES: Record<string, ColumnRole> = {
  front: 'front',
  question: 'front',
  term: 'front',
  word: 'front',
  back: 'back',
  answer: 'back',
  definition: 'back',
  meaning: 'back',
  deck: 'deck',
  tags: 'tags',
  tag: 'tags',
  hint: 'hint',
  reading: 'hint',
  extra: 'extra',
  notes: 'extra',
  note: 'extra',
  id: 'id',
  last_review: 'last_review',
  ...Object.fromEntries(SCHEDULING_COLUMNS.map((c) => [c, c])),
  history: 'history',
  reviews: 'history',
}

/** At least two known column names (or one, in a single-column file). */
function looksLikeHeader(row: string[]): boolean {
  const known = row.filter((c) => c.trim().toLowerCase() in ALIASES).length
  return known >= Math.min(2, row.length)
}

/** A sensible role for each column; the import UI lets the user change them. */
export function guessRoles(file: ParsedFile): ColumnRole[] {
  const width = Math.max(file.columns?.length ?? 0, ...file.rows.slice(0, 50).map((r) => r.length))
  const roles: ColumnRole[] = Array.from({ length: width }, () => 'ignore')
  if (file.columns) {
    file.columns.forEach((name, i) => {
      roles[i] = ALIASES[name.trim().toLowerCase()] ?? 'ignore'
    })
  }
  if (file.deckColumn !== null && file.deckColumn < width) roles[file.deckColumn] = 'deck'
  if (file.tagsColumn !== null && file.tagsColumn < width) roles[file.tagsColumn] = 'tags'
  const reserved = new Set([file.guidColumn, file.notetypeColumn].filter((i): i is number => i !== null))
  // Fill front/back into the first free columns, matching a basic note's first two
  // fields. Named, GUID and note type columns are never filled.
  for (const role of ['front', 'back'] as const) {
    if (roles.includes(role)) continue
    const free = roles.findIndex(
      (r, i) => r === 'ignore' && !reserved.has(i) && !(file.columns && ALIASES[file.columns[i]?.trim().toLowerCase() ?? '']),
    )
    if (free >= 0) roles[free] = role
  }
  // With no extra column named, a note's third field (e.g. "Back Extra") becomes the extra.
  if (!file.columns && !roles.includes('extra')) {
    const free = roles.findIndex((r, i) => r === 'ignore' && !reserved.has(i))
    if (free >= 0 && free > roles.indexOf('back')) roles[free] = 'extra'
  }
  return roles
}

// ── Rows ──────────────────────────────────────────────────────────────────────

export interface ImportScheduling {
  state: 0 | 1 | 2 | 3
  due: string
  interval: number
  ease: number
  stability: number
  difficulty: number
  /** Position in the learning or relearning steps (0 when unknown). */
  step: number
  reps: number
  lapses: number
  lastReview: string | null
}

/** One past answer, as stored in the review log. */
export interface ImportReview {
  /** ISO 8601 time of the answer. */
  at: string
  rating: 1 | 2 | 3 | 4
  /** Time spent on the card, in milliseconds. */
  ms: number
  stateBefore: 0 | 1 | 2 | 3
  stateAfter: 0 | 1 | 2 | 3
  /** Intervals in days, before and after the answer. */
  intervalBefore: number
  intervalAfter: number
  /** Ease factor after the answer (2.5 = 250%); 0 when unknown. */
  ease: number
}

export interface ImportRowData {
  /** An existing card's ID (lowercase UUID), from the file's id column. */
  id?: string
  deck: string | null
  front: string
  back: string
  hint?: string
  extra?: string
  tags: string[]
  scheduling?: ImportScheduling
  /** Present only when the file has a suspended column. */
  suspended?: boolean
  /** Past answers, oldest first; present only when the file has a history column. */
  history?: ImportReview[]
}

/** Turns parsed rows into cards using the chosen column roles; rows without a front are skipped and counted. */
export function buildRows(file: ParsedFile, roles: ColumnRole[]): { rows: ImportRowData[]; skipped: number } {
  const clean = (value: string) => (file.html ? htmlToText(value) : value).trim()
  const rows: ImportRowData[] = []
  let skipped = 0
  for (const cells of file.rows) {
    const get = (role: ColumnRole) => {
      const i = roles.indexOf(role)
      return i >= 0 && i < cells.length ? clean(cells[i]!) : ''
    }
    const front = get('front')
    if (!front) {
      skipped += 1
      continue
    }
    const row: ImportRowData = {
      deck: normalizeDeckPath(get('deck')) || null,
      front,
      back: get('back'),
      tags: get('tags').split(/\s+/).filter(Boolean),
    }
    // Mapped columns always come through (even empty) so an update can clear a
    // field; unmapped ones stay undefined and leave existing values alone.
    // Anything but a UUID (another app's note ID, say) can't be one of ours.
    const id = get('id').toLowerCase()
    if (CARD_ID.test(id)) row.id = id
    if (roles.includes('hint')) row.hint = get('hint')
    if (roles.includes('extra')) row.extra = get('extra')
    const scheduling = readScheduling(get)
    if (scheduling) row.scheduling = scheduling
    if (roles.includes('suspended')) row.suspended = ['1', 'true', 'yes', 'y'].includes(get('suspended').toLowerCase())
    if (roles.includes('history')) {
      const history = parseHistory(get('history'))
      if (history.length) row.history = history
    }
    // Cloze notes ("{{c1::answer::hint}}") become one card per cloze number;
    // the note's second field (Back Extra) moves to the extra line. Each is a
    // new card, so none keeps the row's ID.
    const clozes = expandCloze(front)
    if (clozes) {
      for (const card of clozes) {
        rows.push({
          ...row,
          id: undefined,
          front: card.front,
          back: card.back,
          extra: [row.back, row.extra].filter(Boolean).join('\n\n') || undefined,
        })
      }
      continue
    }
    rows.push(row)
  }
  return { rows, skipped }
}

const CLOZE = /\{\{c(\d+)::([\s\S]*?)(?:::([\s\S]*?))?\}\}/g

/**
 * Turns a cloze text into question/answer pairs: for each cloze number the
 * front hides that deletion ("[…]" or "[hint]") and shows the others, the back
 * reveals it in bold. Returns null when the text has no clozes.
 */
export function expandCloze(text: string): { front: string; back: string }[] | null {
  const numbers = [...new Set([...text.matchAll(CLOZE)].map((m) => Number(m[1])))].sort((a, b) => a - b)
  if (numbers.length === 0) return null
  return numbers.map((n) => ({
    front: text.replace(CLOZE, (_, num: string, answer: string, hint?: string) =>
      Number(num) === n ? `[${hint?.trim() || '…'}]` : answer,
    ),
    back: text.replace(CLOZE, (_, num: string, answer: string) => (Number(num) === n ? `**${answer}**` : answer)),
  }))
}

/**
 * A row's progress columns, or undefined unless both state and due are valid.
 * Other numbers fall back to 0 when missing or negative, and are kept in range.
 */
function readScheduling(get: (role: ColumnRole) => string): ImportScheduling | undefined {
  const state = Number(get('state'))
  const due = get('due')
  if (!get('state') || ![0, 1, 2, 3].includes(state) || Number.isNaN(Date.parse(due))) return undefined
  const n = (role: ColumnRole) => {
    const v = Number(get(role))
    return Number.isFinite(v) && v >= 0 ? v : 0
  }
  const last = get('last_review')
  return {
    state: state as ImportScheduling['state'],
    due: new Date(due).toISOString(),
    interval: Math.round(n('interval')),
    ease: n('ease'),
    stability: n('stability'),
    difficulty: Math.min(10, n('difficulty')),
    step: Math.min(100, Math.round(n('step'))),
    reps: Math.round(n('reps')),
    lapses: Math.round(n('lapses')),
    lastReview: last && !Number.isNaN(Date.parse(last)) ? new Date(last).toISOString() : null,
  }
}

// ── Review history ────────────────────────────────────────────────────────────
//
// The history column holds a card's past answers, oldest first, separated by
// ";". Each answer is up to eight space-separated values; only the first two
// are required:
//
//   <time ISO 8601> <rating 1-4> <ms> <state before> <state after> <interval before> <interval after> <ease after>
//   2026-03-01T09:12:00Z 3 5200 0 1 0 0 0;2026-03-01T09:22:40Z 3 3100 1 2 0 1 2.5

const STATES = [0, 1, 2, 3] as const

/**
 * Reads a history cell, oldest answer first. Entries without a valid time and
 * rating are dropped; missing states default to review (2), and other numbers
 * to 0, capped at an hour per answer and 100 years per interval.
 */
export function parseHistory(text: string): ImportReview[] {
  const out: ImportReview[] = []
  for (const entry of text.split(';')) {
    const [at, rating, ms, before, after, ivlBefore, ivlAfter, ease] = entry.trim().split(/\s+/)
    const r = Number(rating)
    if (!at || Number.isNaN(Date.parse(at)) || ![1, 2, 3, 4].includes(r)) continue
    const num = (v: string | undefined, max: number) => {
      const n = Number(v)
      return Number.isFinite(n) && n >= 0 ? Math.min(n, max) : 0
    }
    const state = (v: string | undefined, fallback: ImportReview['stateBefore']) =>
      STATES.find((x) => x === Number(v) && v !== undefined && v !== '') ?? fallback
    out.push({
      at: new Date(at).toISOString(),
      rating: r as ImportReview['rating'],
      ms: Math.round(num(ms, 3_600_000)),
      stateBefore: state(before, 2),
      stateAfter: state(after, 2),
      intervalBefore: Math.round(num(ivlBefore, 36_500)),
      intervalAfter: Math.round(num(ivlAfter, 36_500)),
      ease: num(ease, 10),
    })
  }
  return out.sort((a, b) => a.at.localeCompare(b.at))
}

/** Writes a history cell; `parseHistory` reads it back. */
export function formatHistory(reviews: ImportReview[]): string {
  return reviews
    .map((r) =>
      [
        r.at,
        r.rating,
        r.ms,
        r.stateBefore,
        r.stateAfter,
        r.intervalBefore,
        r.intervalAfter,
        Math.round(r.ease * 1000) / 1000,
      ].join(' '),
    )
    .join(';')
}

/** "Japanese :: Kanji" → "Japanese::Kanji"; drops empty segments. */
export function normalizeDeckPath(path: string): string {
  return splitDeckPath(path).join(DECK_PATH_SEPARATOR)
}

/** A full deck name's parts, from the top-level deck down, trimmed and with spaces collapsed. */
export function splitDeckPath(path: string): string[] {
  return path
    .split(DECK_PATH_SEPARATOR)
    .map((s) => s.trim().replace(/\s+/g, ' '))
    .filter(Boolean)
}

/** Fronts compare after trimming and collapsing whitespace, like a duplicate check should. */
export function frontKey(front: string): string {
  return front.trim().replace(/\s+/g, ' ')
}

// ── HTML from other apps' exports ─────────────────────────────────────────────

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }

/**
 * Exported fields are often HTML. Askesis stores plain text with light markup, so
 * imports keep line breaks, list items, bold/italic and LaTeX tags ([latex], [$], [$$]),
 * and drop the rest.
 */
export function htmlToText(html: string): string {
  return html
    .replace(/\[\$\$\]([\s\S]*?)\[\/\$\$\]/g, '\\[$1\\]')
    .replace(/\[\$\]([\s\S]*?)\[\/\$\]/g, '\\($1\\)')
    .replace(/\[latex\]([\s\S]*?)\[\/latex\]/gi, '\\[$1\\]')
    .replace(/\[sound:[^\]]*\]/gi, '')
    .replace(/<img[^>]*>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(div|p|li|h[1-6]|tr)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<(b|strong)>([\s\S]*?)<\/\1>/gi, '**$2**')
    .replace(/<(i|em)>([\s\S]*?)<\/\1>/gi, '*$2*')
    .replace(/<[^>]+>/g, '')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
      if (e.startsWith('#x') || e.startsWith('#X')) return String.fromCodePoint(Number.parseInt(e.slice(2), 16))
      if (e.startsWith('#')) return String.fromCodePoint(Number(e.slice(1)))
      return ENTITIES[e.toLowerCase()] ?? m
    })
    .replace(/\n{3,}/g, '\n\n')
}

// ── Export ────────────────────────────────────────────────────────────────────

export interface ExportCard {
  /** Saved cards have one; a template of new cards doesn't. */
  id?: string
  deck: string
  front: string
  back: string
  hint: string | null
  extra: string | null
  tags: string[]
  scheduling?: ImportScheduling
  suspended?: boolean
  history?: ImportReview[]
}

export interface ExportOptions {
  /** Adds the scheduling columns (state … suspended). */
  progress?: boolean
  /** Adds the history column with every past answer. */
  history?: boolean
}

/** Quotes a field when it holds a quote, a line break or the separator, or has edge spaces import would trim. */
function quote(value: string, separator: Separator): string {
  return /["\n\r]/.test(value) || value.includes(separator) || value !== value.trim() ? `"${value.replace(/"/g, '""')}"` : value
}

/** Serializes cards with the header lines other flashcard apps read. */
export function exportCsv(cards: ExportCard[], separator: Separator = ',', options: ExportOptions = {}): string {
  const progress = options.progress ?? cards.some((c) => c.scheduling)
  const history = options.history ?? cards.some((c) => c.history?.length)
  const ids = cards.some((c) => c.id)
  const columns = [
    'deck',
    'front',
    'back',
    'hint',
    'extra',
    'tags',
    ...(ids ? ['id'] : []),
    ...(progress ? SCHEDULING_COLUMNS : []),
    ...(history ? ['history'] : []),
  ]
  const name = Object.entries(SEPARATORS).find(([, s]) => s === separator)![0]
  const head = [`#separator:${name}`, '#html:false', `#columns:${columns.join(separator)}`, '#deck column:1', '#tags column:6']
  const lines = cards.map((c) => {
    const s = c.scheduling
    const cells = [c.deck, c.front, c.back, c.hint ?? '', c.extra ?? '', c.tags.join(' '), ...(ids ? [c.id ?? ''] : [])]
    if (progress) {
      // Every scheduling column but the last; `suspended` is filled for every card.
      cells.push(
        ...(s
          ? [s.state, s.due, s.interval, s.ease, s.stability, s.difficulty, s.step, s.reps, s.lapses, s.lastReview ?? ''].map(
              String,
            )
          : SCHEDULING_COLUMNS.slice(0, -1).map(() => '')),
        c.suspended ? '1' : '',
      )
    }
    if (history) cells.push(formatHistory(c.history ?? []))
    return cells.map((v) => quote(v, separator)).join(separator)
  })
  return `${head.join('\n')}\n${lines.join('\n')}\n`
}
