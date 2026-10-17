import type { ImportInput, ImportResult, LibraryPayload } from '@askesis/contracts'
import {
  buildRows,
  type ColumnRole,
  COLUMN_ROLES,
  DECK_PATH_SEPARATOR,
  exportCsv,
  guessRoles,
  normalizeDeckPath,
  type ParsedFile,
  parseDelimited,
  SCHEDULING_COLUMNS,
} from '@askesis/core'
import { Link } from '@tanstack/react-router'
import clsx from 'clsx'
import { CheckCircle2, FileDown, FileUp, RotateCcw, Sparkles } from 'lucide-react'
import { type DragEvent, useMemo, useRef, useState } from 'react'
import { CARD_PROMPT } from '../../content/card-prompt.ts'
import { fmtInt } from '../../lib/format.ts'
import { useUserDataMutation } from '../../lib/queries.ts'
import { importCards } from '../../server/library.functions.ts'
import { CardText } from '../askesis/CardText.tsx'
import { CopyButton } from '../askesis/CopyButton.tsx'
import { PackageHelp } from './PackageHelp.tsx'
import { Dialog } from './Dialog.tsx'
import { downloadText, errorMessage } from './lib.ts'

// Large files go up in several requests so each stays under the API's body limit.
const CHUNK = 5_000
// Rows with review history are heavier, so a batch also closes at this many answers.
const CHUNK_REVIEWS = 40_000

/** Splits rows into request-sized batches. */
function batches<T extends { history?: unknown[] }>(rows: T[]): T[][] {
  const out: T[][] = []
  let current: T[] = []
  let reviews = 0
  for (const row of rows) {
    const n = row.history?.length ?? 0
    if (current.length && (current.length >= CHUNK || reviews + n > CHUNK_REVIEWS)) {
      out.push(current)
      current = []
      reviews = 0
    }
    current.push(row)
    reviews += n
  }
  if (current.length) out.push(current)
  return out
}

const SEPARATOR_NAMES: Record<string, string> = { ',': 'Comma', '\t': 'Tab', ';': 'Semicolon', '|': 'Pipe' }

/** Rows of the file shown in the column table at first, and added by each "Show more". */
const SHEET_PAGE = 50

const ROLE_OPTIONS: { role: ColumnRole; label: string }[] = [
  ...COLUMN_ROLES,
  ...SCHEDULING_COLUMNS.map((c) => ({ role: c, label: `Progress: ${c.replace('_', ' ')}` })),
  { role: 'history', label: 'Progress: review history' },
]

/** A small example file: deck paths, tags, LaTeX and a code block. */
function templateCsv(): string {
  return exportCsv([
    {
      deck: 'Spanish::Verbs',
      front: 'aprovechar',
      back: 'to make the most of',
      hint: '',
      extra: 'Aprovecha el día.',
      tags: ['b2', 'verbs'],
    },
    {
      deck: 'Math',
      front: String.raw`Derivative of \(x^2\)?`,
      back: String.raw`\(2x\)`,
      hint: '',
      extra: '',
      tags: ['calculus'],
    },
    {
      deck: 'Rust',
      front: 'What does `?` do?',
      back: 'Returns early with the error; otherwise unwraps the value.\n```rust\nlet n: i32 = "42".parse()?;\n```',
      hint: '',
      extra: '',
      tags: ['rust'],
    },
  ])
}

/**
 * Imports a CSV, TSV or plain-text notes file: map its columns, pick the target
 * deck and what to do with duplicates, then send it in batches. Package files
 * (.apkg, .colpkg) get a conversion guide instead.
 */
export function ImportDialog({ open, library, onClose }: { open: boolean; library: LibraryPayload; onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [parsed, setParsed] = useState<ParsedFile | null>(null)
  const [roles, setRoles] = useState<ColumnRole[]>([])
  const [defaultDeck, setDefaultDeck] = useState('Imported')
  const [duplicates, setDuplicates] = useState<ImportInput['duplicates']>('update')
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [packageFile, setPackageFile] = useState<string | null>(null)
  const [shownRows, setShownRows] = useState(SHEET_PAGE)

  function reset() {
    setShownRows(SHEET_PAGE)
    setFileName(null)
    setParsed(null)
    setRoles([])
    setProgress(null)
    setResult(null)
    setError(null)
    setPackageFile(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  function close() {
    if (progress) return
    reset()
    onClose()
  }

  async function readFile(file: File) {
    setShownRows(SHEET_PAGE)
    setError(null)
    setResult(null)
    setPackageFile(null)
    if (/\.(apkg|colpkg)$/i.test(file.name)) {
      setPackageFile(file.name)
      if (inputRef.current) inputRef.current.value = ''
      return
    }
    if (file.size > 60 * 1024 * 1024) return setError('That file is over 60 MB. Split it into smaller files.')
    const contents = parseDelimited(await file.text())
    if (contents.rows.length === 0) return setError('No rows found in that file.')
    setFileName(file.name)
    setParsed(contents)
    setRoles(guessRoles(contents))
    // Suggest a deck named after the file.
    setDefaultDeck(
      file.name
        .replace(/\.(csv|tsv|txt)$/i, '')
        .replace(/[_-]+/g, ' ')
        .trim() || 'Imported',
    )
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) void readFile(file)
  }

  const built = useMemo(() => (parsed ? buildRows(parsed, roles) : null), [parsed, roles])
  const fallbackDeck = normalizeDeckPath(defaultDeck) || 'Imported'
  const hasDeckColumn = roles.includes('deck')
  const frontColumn = roles.indexOf('front')
  const missingFront = !roles.includes('front')
  const deckPaths = library.decks.map((d) => d.path)
  // Where the rows will land, and whether each deck is new or merged (names match case-insensitively).
  const targetDecks = useMemo(() => {
    if (!built) return []
    const counts = new Map<string, number>()
    for (const r of built.rows) {
      const path = r.deck ?? fallbackDeck
      counts.set(path, (counts.get(path) ?? 0) + 1)
    }
    return [...counts].map(([path, n]) => {
      const existing = deckPaths.find((p) => p.toLowerCase() === path.toLowerCase())
      return { path: existing ?? path, n, exists: !!existing }
    })
  }, [built, fallbackDeck, deckPaths])

  // The whole file is one mutation, sent in batches, so the deck lists refresh once at the end.
  const importFile = useUserDataMutation(async (file: NonNullable<typeof built>) => {
    const total = file.rows.length
    const sum: ImportResult = {
      decksCreated: [],
      decksMerged: [],
      added: 0,
      updated: 0,
      unchanged: 0,
      skipped: file.skipped,
      withProgress: 0,
      reviewsImported: 0,
    }
    setProgress({ done: 0, total })
    let done = 0
    // Rows with an identifier go first, so the ones the server makes up for the rest
    // (checked against the cards already saved) can't clash with a later batch's.
    const ordered = [...file.rows.filter((r) => r.identifier), ...file.rows.filter((r) => !r.identifier)]
    for (const rows of batches(ordered)) {
      const r = await importCards({ data: { rows, defaultDeck: fallbackDeck, duplicates } })
      sum.added += r.added
      sum.updated += r.updated
      sum.unchanged = (sum.unchanged ?? 0) + (r.unchanged ?? 0)
      sum.skipped += r.skipped
      sum.withProgress = (sum.withProgress ?? 0) + (r.withProgress ?? 0)
      sum.reviewsImported = (sum.reviewsImported ?? 0) + (r.reviewsImported ?? 0)
      sum.decksCreated.push(...r.decksCreated.filter((d) => !sum.decksCreated.includes(d)))
      sum.decksMerged.push(...r.decksMerged.filter((d) => !sum.decksMerged.includes(d)))
      done += rows.length
      setProgress({ done, total })
    }
    // Decks created by an earlier chunk show up as "merged" in later ones.
    sum.decksMerged = sum.decksMerged.filter((d) => !sum.decksCreated.some((c) => c.toLowerCase() === d.toLowerCase()))
    return sum
  })

  async function run() {
    if (!built || built.rows.length === 0) return
    setError(null)
    try {
      setResult(await importFile.mutateAsync(built))
    } catch (e) {
      setError(errorMessage(e, 'The import failed. Nothing after the last finished batch was saved.'))
    } finally {
      setProgress(null)
    }
  }

  const preview = built?.rows.slice(0, 3) ?? []
  // Cards with real progress: reviewed at least once, or suspended. New ones simply stay new.
  const withProgress = built?.rows.filter((r) => (r.scheduling && r.scheduling.state > 0) || r.suspended).length ?? 0
  const pastReviews = built?.rows.reduce((n, r) => n + (r.history?.length ?? 0), 0) ?? 0

  return (
    <Dialog
      open={open}
      onClose={close}
      size="xl"
      title="Import cards"
      description="CSV, TSV or a plain-text notes export (.txt) from another flashcard app. Decks with the same name are merged: cards are added, never wiped."
      footer={
        result ? (
          <>
            <button type="button" className="btn btn--ghost btn--sm" onClick={reset}>
              <RotateCcw size={14} /> Import another file
            </button>
            <button type="button" className="btn btn--primary btn--sm" onClick={close}>
              Done
            </button>
          </>
        ) : (
          <>
            {error && <span className="deckmgr-form-error">{error}</span>}
            <button type="button" className="btn btn--ghost btn--sm" onClick={close} disabled={!!progress}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={run}
              disabled={!built || built.rows.length === 0 || missingFront || !!progress}
            >
              {progress
                ? `Importing ${fmtInt(progress.done)} / ${fmtInt(progress.total)}…`
                : built
                  ? `Import ${fmtInt(built.rows.length)} ${built.rows.length === 1 ? 'card' : 'cards'}`
                  : 'Import'}
            </button>
          </>
        )
      }
    >
      {result ? (
        <div className="deckmgr-import-result">
          <CheckCircle2 size={28} />
          <p className="deckmgr-import-result__title">Import finished</p>
          <dl className="deckmgr-import-result__stats">
            <div>
              <dt>Added</dt>
              <dd>{fmtInt(result.added)}</dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>{fmtInt(result.updated)}</dd>
            </div>
            {(result.unchanged ?? 0) > 0 && (
              <div>
                <dt>Unchanged</dt>
                <dd>{fmtInt(result.unchanged!)}</dd>
              </div>
            )}
            <div>
              <dt>Skipped</dt>
              <dd>{fmtInt(result.skipped)}</dd>
            </div>
          </dl>
          {((result.withProgress ?? 0) > 0 || (result.reviewsImported ?? 0) > 0) && (
            <p className="deckmgr-import-result__decks">
              {(result.withProgress ?? 0) > 0 && <>Progress kept for {fmtInt(result.withProgress!)} cards. </>}
              {(result.reviewsImported ?? 0) > 0 && (
                <>{fmtInt(result.reviewsImported!)} past reviews restored to your history, heatmap and streak.</>
              )}
            </p>
          )}
          {result.decksCreated.length > 0 && (
            <p className="deckmgr-import-result__decks">
              <strong>New decks:</strong> {result.decksCreated.map((d) => d.replaceAll(DECK_PATH_SEPARATOR, ' › ')).join(', ')}
            </p>
          )}
          {result.decksMerged.length > 0 && (
            <p className="deckmgr-import-result__decks">
              <strong>Merged into existing:</strong>{' '}
              {result.decksMerged
                .map((d) =>
                  (deckPaths.find((p) => p.toLowerCase() === d.toLowerCase()) ?? d).replaceAll(DECK_PATH_SEPARATOR, ' › '),
                )
                .join(', ')}
            </p>
          )}
        </div>
      ) : !parsed ? (
        <div className="deckmgr-import-start">
          <label
            className={clsx('deckmgr-drop', dragging && 'is-dragging')}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <FileUp size={28} />
            <span className="deckmgr-drop__title">Drop a .csv, .tsv or .txt file</span>
            <span className="deckmgr-drop__text">or click to choose one</span>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.tsv,.txt,.apkg,.colpkg,text/csv,text/tab-separated-values,text/plain"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void readFile(file)
              }}
            />
          </label>
          {error && <p className="deckmgr-form-error">{error}</p>}
          <PackageHelp fileName={packageFile} />
          <div className="deckmgr-import-help">
            <p>
              Columns can be named in a header row (<code>front</code>, <code>back</code>, <code>deck</code>, <code>tags</code>,{' '}
              <code>hint</code>, <code>extra</code>, <code>identifier</code>) or with header lines like{' '}
              <code>#separator:tab</code> and <code>#deck column:1</code>. Without either, the first column is the front and the
              second the back.
            </p>
            <button type="button" className="link-button" onClick={() => downloadText('askesis-template.csv', templateCsv())}>
              <FileDown size={14} /> Download a template CSV
            </button>
          </div>
          <div className="deckmgr-import-ai">
            <Sparkles size={18} aria-hidden />
            <div>
              <p className="deckmgr-import-ai__title">Let an AI assistant write the cards</p>
              <p>
                Copy the prompt into ChatGPT, Claude or Gemini, fill in your topic or attach your notes, and import the file it
                gives you.{' '}
                <Link to="/docs/$slug" params={{ slug: 'for-ai-agents' }} hash="prompt">
                  Read the prompt
                </Link>
              </p>
            </div>
            <CopyButton text={CARD_PROMPT} label="Copy AI prompt" className="btn--ghost" />
          </div>
        </div>
      ) : (
        <div className="deckmgr-import">
          <div className="deckmgr-import__meta">
            <span className="chip">{fileName}</span>
            <span className="chip">{SEPARATOR_NAMES[parsed.separator]} separated</span>
            <span className="chip">{parsed.html ? 'HTML fields' : 'Plain text'}</span>
            <span className="chip">{fmtInt(parsed.rows.length)} rows</span>
            <button type="button" className="link-button" onClick={reset}>
              Choose another file
            </button>
          </div>

          <section className="deckmgr-import__section">
            <h3 className="eyebrow">Your file</h3>
            <p className="deckmgr-import__hint">
              Each row is one card ({fmtInt(parsed.rows.length)} in this file). Pick what each column holds, and the cards below
              follow.
            </p>
            {/* Focusable so the keyboard can scroll it sideways when the file has many columns. */}
            <div className="deckmgr-sheet" role="region" aria-label="The first rows of the file" tabIndex={0}>
              <table>
                <thead>
                  <tr>
                    <th scope="col" className="deckmgr-sheet__corner">
                      <span className="sr-only">Card</span>
                    </th>
                    {roles.map((role, i) => {
                      const name = parsed.columns?.[i]
                      return (
                        <th key={i} scope="col" data-role={role}>
                          <select
                            className="input select"
                            aria-label={`What column ${i + 1}${name ? ` (${name})` : ''} holds`}
                            value={role}
                            onChange={(e) => {
                              const next = [...roles]
                              const picked = e.target.value as ColumnRole
                              // One column per role (except Ignore): picking it elsewhere frees the old one.
                              if (picked !== 'ignore') next.forEach((r, j) => r === picked && (next[j] = 'ignore'))
                              next[i] = picked
                              setRoles(next)
                            }}
                          >
                            {ROLE_OPTIONS.map((o) => (
                              <option key={o.role} value={o.role}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                          <span className="deckmgr-sheet__name">
                            Column {i + 1}
                            {name && ` · ${name}`}
                          </span>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {parsed.rows.slice(0, shownRows).map((row, r) => {
                    // A row without a front isn't imported; it stays in the table, marked, so the count adds up.
                    const skipped = frontColumn < 0 || !row[frontColumn]?.trim()
                    return (
                      <tr key={r} className={clsx(skipped && 'is-skipped')}>
                        <th scope="row">{skipped ? `Row ${r + 1}: skipped` : `Card ${r + 1}`}</th>
                        {roles.map((role, i) => {
                          const value = row[i]?.trim() ?? ''
                          return (
                            <td key={i} data-role={role} title={value || undefined}>
                              {value || <span className="deckmgr-sheet__empty">empty</span>}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {parsed.rows.length > shownRows && (
              <button type="button" className="link-button" onClick={() => setShownRows((n) => n + SHEET_PAGE)}>
                Show {fmtInt(Math.min(SHEET_PAGE, parsed.rows.length - shownRows))} more ·{' '}
                {fmtInt(parsed.rows.length - shownRows)} left
              </button>
            )}
            {missingFront && <p className="deckmgr-form-error">Pick which column is the front.</p>}
          </section>

          <section className="deckmgr-import__section">
            <h3 className="eyebrow">
              How the cards will look{' '}
              {built && built.skipped > 0 && (
                <span className="deckmgr-import__n">· {fmtInt(built.skipped)} rows without a front will be skipped</span>
              )}
              {built && built.repeatedIdentifiers > 0 && (
                <span className="deckmgr-import__n">
                  · {fmtInt(built.repeatedIdentifiers)} {built.repeatedIdentifiers === 1 ? 'row repeats' : 'rows repeat'} an
                  earlier row’s identifier; only the first updates that card
                </span>
              )}
            </h3>
            <div className="deckmgr-import__preview">
              {preview.map((row, i) => (
                <article key={i} className="deckmgr-preview-card deckmgr-preview-card--small">
                  <p className="deckmgr-preview-card__deck">
                    {(row.deck ?? fallbackDeck).replaceAll(DECK_PATH_SEPARATOR, ' › ')}
                    {row.scheduling && <span> · scheduling kept</span>}
                  </p>
                  <div className="deckmgr-preview-card__face">
                    <CardText text={row.front} />
                    {row.hint && <p className="deckmgr-preview-card__hint">{row.hint}</p>}
                  </div>
                  <div className="deckmgr-preview-card__answer">
                    {row.back ? <CardText text={row.back} /> : <p className="deckmgr-preview-card__empty">No back</p>}
                  </div>
                  {row.tags.length > 0 && (
                    <p className="deckmgr-preview-card__tags">
                      {row.tags.map((t) => (
                        <span key={t} className="deckmgr-tagchip">
                          {t}
                        </span>
                      ))}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>

          <div className="deckmgr-import__options">
            <section className="deckmgr-import__section">
              <h3 className="eyebrow">Deck</h3>
              <label className="field__label" htmlFor="import-deck">
                {hasDeckColumn ? 'For rows without a deck' : 'Import into'}
              </label>
              <input
                id="import-deck"
                className="input"
                list="import-deck-paths"
                value={defaultDeck}
                onChange={(e) => setDefaultDeck(e.target.value)}
                placeholder="Deck or Parent::Child"
              />
              <datalist id="import-deck-paths">
                {deckPaths.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
              <ul className="deckmgr-import__targets">
                {targetDecks.slice(0, 6).map((t) => (
                  <li key={t.path}>
                    <span className={clsx('deckmgr-import__badge', t.exists ? 'is-merge' : 'is-new')}>
                      {t.exists ? 'merge' : 'new'}
                    </span>
                    {t.path.replaceAll(DECK_PATH_SEPARATOR, ' › ')}
                    <span className="deckmgr-import__n">{fmtInt(t.n)}</span>
                  </li>
                ))}
                {targetDecks.length > 6 && <li className="deckmgr-import__n">+{targetDecks.length - 6} more decks</li>}
              </ul>
            </section>
            <section className="deckmgr-import__section">
              <h3 className="eyebrow">Cards that already exist</h3>
              <p className="deckmgr-import__hint">
                Matched by identifier (the identifier column of an Askesis export). Rows without one are added as new cards.
              </p>
              <div className="deckmgr-radios" role="radiogroup" aria-label="Duplicates">
                {(
                  [
                    ['update', 'Update them', 'Replace front, back, hint and extra; keep progress, history, tags and deck.'],
                    ['skip', 'Skip them', 'Leave existing cards exactly as they are.'],
                    ['duplicate', 'Import as new', 'Add a second copy.'],
                  ] as const
                ).map(([value, label, help]) => (
                  <label key={value} className={clsx('deckmgr-radio', duplicates === value && 'is-checked')}>
                    <input
                      type="radio"
                      name="duplicates"
                      value={value}
                      checked={duplicates === value}
                      onChange={() => setDuplicates(value)}
                    />
                    <span>
                      <strong>{label}</strong>
                      <span>{help}</span>
                    </span>
                  </label>
                ))}
              </div>
            </section>
          </div>

          {(withProgress > 0 || pastReviews > 0) && (
            <p className="deckmgr-import__progress">
              This file includes study progress for {fmtInt(withProgress)} {withProgress === 1 ? 'card' : 'cards'}
              {pastReviews > 0 && (
                <>
                  {' '}
                  and {fmtInt(pastReviews)} past {pastReviews === 1 ? 'review' : 'reviews'}
                </>
              )}
              . It comes in with the cards you don’t have yet. Cards you already have keep their own progress and history; only
              their text is updated.
            </p>
          )}
        </div>
      )}
    </Dialog>
  )
}
