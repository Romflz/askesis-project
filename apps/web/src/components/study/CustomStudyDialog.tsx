import type { LibraryPayload } from '@askesis/contracts'
import { keepPreviousData, useQueries } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import clsx from 'clsx'
import {
  CalendarCheck,
  CalendarClock,
  ChevronRight,
  Flame,
  Minus,
  Play,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { fmtInt, fmtMinutes } from '../../lib/format.ts'
import { queries } from '../../lib/queries.ts'
import { buildTagTree, mostUsedTags, searchTags, type TagNode, visibleTagRows } from '../../lib/tags.ts'
import { Dialog } from '../decks/Dialog.tsx'
import { clampCount, estimateMinutes, type PickerConfig, previewInput } from './pickerConfig.ts'
import { MODE_INFO, type StudyMode } from './search.ts'

const MODES = Object.keys(MODE_INFO) as StudyMode[]

const MODE_ICONS: Record<StudyMode, React.ReactNode> = {
  scheduled: <CalendarCheck size={18} />,
  quick: <Zap size={18} />,
  new: <Sparkles size={18} />,
  ahead: <CalendarClock size={18} />,
  forgotten: <RotateCcw size={18} />,
  cram: <Flame size={18} />,
}

/** One-click card counts next to the number field. */
const LIMIT_PRESETS = [10, 25, 50, 100]

type TagState = 'off' | 'include' | 'exclude'

/** Clicking a tag's name cycles through the states in this order. */
const NEXT_TAG_STATE: Record<TagState, TagState> = { off: 'include', include: 'exclude', exclude: 'off' }

/** Tag rows shown at first, and added by each "Show more". */
const TAG_PAGE = 40

/** "a or b, without c" with each tag in bold. */
function describeTags(include: string[], match: 'any' | 'all', exclude: string[]): React.ReactNode {
  const list = (tags: string[], word: string) =>
    tags.map((t, i) => (
      <span key={t}>
        {i > 0 && (i === tags.length - 1 ? ` ${word} ` : ', ')}
        <b>{t}</b>
      </span>
    ))
  return (
    <>
      {include.length > 0 ? <>Cards tagged {list(include, match === 'all' ? 'and' : 'or')}</> : 'All cards'}
      {exclude.length > 0 && <>, without {list(exclude, 'or')}</>}.
    </>
  )
}

/**
 * Custom study for the decks picked on the /study page: a mode, tags to include
 * or leave out (covering child tags), how many cards and in what order. Every
 * mode's count loads together, before the popup even opens, so switching modes
 * shows its number straight away and each mode shows what it would hold.
 */
export function CustomStudyDialog({
  open,
  onClose,
  library,
  config,
  setConfig,
  deckIds,
  deckLabel,
  enabled,
  onStart,
}: {
  open: boolean
  onClose: () => void
  library: LibraryPayload
  config: PickerConfig
  setConfig: (patch: Partial<PickerConfig>) => void
  /** The top selected decks, as the API takes them (it adds their subdecks). */
  deckIds: string[]
  /** "All decks", "Japanese", "3 decks": where the cards come from. */
  deckLabel: string
  /** False until the stored choices are read, or while no deck is selected. */
  enabled: boolean
  onStart: () => void
}) {
  // Counts follow the choices once typing pauses; a mode switch needs no new request.
  const choicesKey = JSON.stringify({ ...config, mode: undefined, deckIds })
  const [settled, setSettled] = useState({ key: choicesKey, config, deckIds })
  useEffect(() => {
    const timer = setTimeout(() => setSettled({ key: choicesKey, config, deckIds }), 200)
    return () => clearTimeout(timer)
    // The key covers config and deckIds.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [choicesKey])
  const previews = useQueries({
    queries: MODES.map((mode) => ({
      ...queries.studyPreview(previewInput({ ...settled.config, mode }, settled.deckIds)),
      enabled,
      placeholderData: keepPreviousData,
    })),
  })
  const preview = previews[MODES.indexOf(config.mode)]?.data ?? null
  const updating = settled.key !== choicesKey || previews.some((p) => p.isPlaceholderData)

  // ── Tags ──
  const tagTree = useMemo(() => buildTagTree(library), [library])
  const [tagQuery, setTagQuery] = useState('')
  const [openTags, setOpenTags] = useState<Set<string>>(() => new Set())
  const [tagLimit, setTagLimit] = useState(TAG_PAGE)
  useEffect(() => setTagLimit(TAG_PAGE), [tagQuery])
  const tagState = (tag: string): TagState =>
    config.tags.includes(tag) ? 'include' : config.excludeTags.includes(tag) ? 'exclude' : 'off'
  /** Without `direct`, cycles off → include → exclude → off; with it, toggles that state. */
  function setTag(tag: string, direct?: Exclude<TagState, 'off'>) {
    const current = tagState(tag)
    const next: TagState = direct ? (current === direct ? 'off' : direct) : NEXT_TAG_STATE[current]
    setConfig({
      tags: next === 'include' ? [...config.tags, tag] : config.tags.filter((t) => t !== tag),
      excludeTags: next === 'exclude' ? [...config.excludeTags, tag] : config.excludeTags.filter((t) => t !== tag),
    })
  }
  const tagFilterOn = config.tags.length > 0 || config.excludeTags.length > 0
  const searching = tagQuery.trim().length > 0
  const tagRows = searching ? searchTags(tagTree.all, tagQuery) : visibleTagRows(tagTree.roots, openTags)
  const popular = useMemo(() => mostUsedTags(tagTree.all, 10), [tagTree])
  const nodeByPath = useMemo(() => new Map(tagTree.all.map((n) => [n.path, n])), [tagTree])
  const hasLevels = tagTree.all.some((n) => n.depth > 0)
  const noMatch = tagFilterOn && preview?.matching === 0

  function tagRow(node: TagNode) {
    const state = tagState(node.path)
    const isOpen = openTags.has(node.path)
    const parent = node.path.slice(0, node.path.length - node.name.length)
    return (
      <li
        key={node.path}
        className={clsx('tagf-row', state !== 'off' && `is-${state}`)}
        style={{ '--depth': searching ? 0 : node.depth } as React.CSSProperties}
      >
        {!searching && node.children.length > 0 ? (
          <button
            type="button"
            className={clsx('tagf-row__toggle', isOpen && 'is-open')}
            aria-expanded={isOpen}
            aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${node.path}`}
            onClick={() =>
              setOpenTags((o) => {
                const next = new Set(o)
                if (next.has(node.path)) next.delete(node.path)
                else next.add(node.path)
                return next
              })
            }
          >
            <ChevronRight size={14} />
          </button>
        ) : (
          <span className="tagf-row__toggle" aria-hidden />
        )}
        <button type="button" className="tagf-row__name" title={node.path} onClick={() => setTag(node.path)}>
          <span className="tagf-row__label">
            {searching && parent && <span className="tagf-row__parent">{parent}</span>}
            {node.name}
          </span>
          {!searching && node.children.length > 0 && (
            <span className="tagf-row__sub">
              {node.children.length} {node.children.length === 1 ? 'tag' : 'tags'}
            </span>
          )}
          <span className="tagf-row__n tabular">{fmtInt(node.cards)}</span>
        </button>
        <span className="tagf-row__btns">
          <button
            type="button"
            className="tagf-row__btn tagf-row__btn--in"
            aria-pressed={state === 'include'}
            aria-label={`Include ${node.path}`}
            title="Include: only study cards with this tag"
            onClick={() => setTag(node.path, 'include')}
          >
            <Plus size={13} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            className="tagf-row__btn tagf-row__btn--out"
            aria-pressed={state === 'exclude'}
            aria-label={`Exclude ${node.path}`}
            title="Exclude: leave out cards with this tag"
            onClick={() => setTag(node.path, 'exclude')}
          >
            <Minus size={13} strokeWidth={2.5} />
          </button>
        </span>
      </li>
    )
  }

  const summary = preview ? (
    <>
      <p className="study-summary__big tabular">
        {fmtInt(preview.session)}{' '}
        <span>{config.mode === 'scheduled' ? 'cards due' : preview.session === 1 ? 'card' : 'cards'}</span>
      </p>
      <p className="study-summary__meta tabular">
        {preview.session
          ? `${fmtInt(preview.counts.new)} new · ${fmtInt(preview.counts.learning)} learning · ${fmtInt(preview.counts.review)} review · about ${fmtMinutes(estimateMinutes(preview.counts))}`
          : noMatch
            ? 'No cards have these tags in the selected decks.'
            : 'No cards fit these choices right now.'}
      </p>
    </>
  ) : (
    <>
      <p className="study-summary__big tabular">
        – <span>cards</span>
      </p>
      <p className="study-summary__meta">Counting…</p>
    </>
  )

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="xl"
      className="custom-study"
      title="Custom study"
      description={
        <>
          From <b>{deckLabel}</b>. Pick what to study, narrow it down with tags and choose how many cards.
        </>
      }
      footer={
        <>
          <div className={clsx('custom-study__summary', updating && 'is-updating')} aria-live="polite">
            {summary}
            {config.mode === 'cram' && <p className="study-summary__meta">Practice only: answers don’t reschedule.</p>}
          </div>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={onStart}
            disabled={!enabled || !preview || preview.session === 0}
          >
            <Play size={15} fill="currentColor" /> Start custom study
          </button>
        </>
      }
    >
      <div className="custom-study__body">
        <section className="custom-study__section" aria-labelledby="cs-mode">
          <h3 id="cs-mode" className="custom-study__heading">
            What to study
          </h3>
          <div className="study-modes" role="radiogroup" aria-label="Study mode">
            {MODES.map((m, i) => {
              const count = previews[i]?.data?.session
              return (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={config.mode === m}
                  className={clsx('study-mode', config.mode === m && 'is-on', m === 'cram' && 'study-mode--cram')}
                  onClick={() => setConfig({ mode: m })}
                >
                  <span className="study-mode__top">
                    <span className="study-mode__icon">{MODE_ICONS[m]}</span>
                    <span className={clsx('study-mode__count tabular', count === 0 && 'is-empty')}>
                      {count === undefined ? '–' : fmtInt(count)}
                    </span>
                  </span>
                  <span className="study-mode__label">
                    {MODE_INFO[m].label}
                    {!MODE_INFO[m].reschedules && <span className="study-mode__badge">Practice</span>}
                  </span>
                  <span className="study-mode__blurb">{MODE_INFO[m].blurb}</span>
                </button>
              )
            })}
          </div>

          <div className="study-params">
            {config.mode !== 'scheduled' && (
              <div className="study-param">
                <label className="study-param__field">
                  <span>Up to</span>
                  <input
                    className="input"
                    type="number"
                    min={1}
                    max={1000}
                    value={config.limit}
                    onChange={(e) => setConfig({ limit: clampCount(e.target.value, 1000) })}
                  />
                  <span>cards</span>
                </label>
                <div className="segmented" role="group" aria-label="Number of cards">
                  {LIMIT_PRESETS.map((n) => (
                    <button key={n} type="button" aria-pressed={config.limit === n} onClick={() => setConfig({ limit: n })}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {config.mode === 'ahead' && (
              <label className="study-param study-param__field">
                <span>Due in the next</span>
                <input
                  className="input"
                  type="number"
                  min={1}
                  max={365}
                  value={config.aheadDays}
                  onChange={(e) => setConfig({ aheadDays: clampCount(e.target.value, 365) })}
                />
                <span>days</span>
              </label>
            )}
            {config.mode === 'forgotten' && (
              <label className="study-param study-param__field">
                <span>Forgotten in the last</span>
                <input
                  className="input"
                  type="number"
                  min={1}
                  max={365}
                  value={config.forgottenDays}
                  onChange={(e) => setConfig({ forgottenDays: clampCount(e.target.value, 365) })}
                />
                <span>days</span>
              </label>
            )}
            {/* Quick study orders by risk of forgetting, so there is no order to pick. */}
            {config.mode !== 'quick' && (
              <div className="study-param study-param--order">
                <span>Order</span>
                <div className="segmented" role="group" aria-label="Card order">
                  {(
                    [
                      ['mixed', 'Mixed'],
                      ['due', 'Due date'],
                      ['random', 'Random'],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={config.order === value}
                      onClick={() => setConfig({ order: value })}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="custom-study__section study-filter" aria-labelledby="cs-tags">
          <h3 id="cs-tags" className="custom-study__heading">
            Tags
          </h3>
          {library.tags.length === 0 ? (
            <p className="study-filter__lead">
              No tags yet. Tag cards in <Link to="/decks">Decks</Link> (or import a file with a tags column) to study one topic at
              a time.
            </p>
          ) : (
            <>
              <p className="study-filter__lead">
                <span className="study-filter__key study-filter__key--in">Include</span> tags to study only those cards,{' '}
                <span className="study-filter__key study-filter__key--out">exclude</span> tags to leave cards out. A tag covers
                the tags below it: <code>lpic1</code> also matches <code>lpic1::chapter::01</code>.
              </p>

              <div className="study-filter__controls">
                <label className="study-filter__search">
                  <Search size={14} aria-hidden />
                  <input
                    className="input"
                    type="search"
                    placeholder={`Search ${fmtInt(tagTree.all.length)} tags`}
                    aria-label="Search tags"
                    value={tagQuery}
                    onChange={(e) => setTagQuery(e.target.value)}
                  />
                </label>
                <div className="study-filter__match">
                  <span>Included tags</span>
                  <div className="segmented" role="group" aria-label="How included tags combine">
                    {(
                      [
                        ['any', 'Any of them'],
                        ['all', 'All of them'],
                      ] as const
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={config.tagMatch === value}
                        disabled={config.tags.length < 2}
                        onClick={() => setConfig({ tagMatch: value })}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {!searching && popular.length > 0 && (
                <div className="tagf-popular">
                  <p className="tagf-heading">Most used</p>
                  <div className="study-tags__list">
                    {popular.map((t) => {
                      const state = tagState(t.path)
                      return (
                        <button
                          key={t.path}
                          type="button"
                          className={clsx('study-tag', state === 'include' && 'is-on', state === 'exclude' && 'is-out')}
                          aria-label={`${t.path}, ${t.cards} cards, ${state === 'off' ? 'not used' : state === 'include' ? 'included' : 'excluded'}`}
                          title={`${t.path}. Click: include, again: exclude. Right-click: exclude.`}
                          onClick={(e) => setTag(t.path, e.shiftKey ? 'exclude' : undefined)}
                          onContextMenu={(e) => {
                            e.preventDefault()
                            setTag(t.path, 'exclude')
                          }}
                        >
                          {state === 'include' && <Plus size={12} strokeWidth={2.5} aria-hidden />}
                          {state === 'exclude' && <Minus size={12} strokeWidth={2.5} aria-hidden />}
                          <span className="study-tag__name">{t.name}</span>
                          <span className="study-tag__n tabular">{fmtInt(t.cards)}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="tagf-browse">
                <p className="tagf-heading">
                  {searching
                    ? tagRows.length
                      ? `${fmtInt(tagRows.length)} ${tagRows.length === 1 ? 'match' : 'matches'}, best first`
                      : `No tag matches “${tagQuery.trim()}”`
                    : hasLevels
                      ? 'All tags'
                      : 'All tags, A–Z'}
                  {!searching && openTags.size > 0 && (
                    <button type="button" className="link-button" onClick={() => setOpenTags(new Set())}>
                      Collapse all
                    </button>
                  )}
                </p>
                {tagRows.length > 0 && <ul className="tagf-list">{tagRows.slice(0, tagLimit).map(tagRow)}</ul>}
                {tagRows.length > tagLimit && (
                  <button type="button" className="link-button tagf-more" onClick={() => setTagLimit((n) => n + TAG_PAGE)}>
                    Show {fmtInt(Math.min(TAG_PAGE, tagRows.length - tagLimit))} more · {fmtInt(tagRows.length - tagLimit)} left
                  </button>
                )}
              </div>
            </>
          )}
        </section>

        {library.tags.length > 0 && (
          <section className="custom-study__section custom-study__selected" aria-labelledby="cs-selected">
            <div className="study-picker__head">
              <h3 id="cs-selected" className="custom-study__heading">
                Selected tags
              </h3>
              {tagFilterOn && (
                <button type="button" className="link-button" onClick={() => setConfig({ tags: [], excludeTags: [] })}>
                  Clear tags
                </button>
              )}
            </div>
            {tagFilterOn ? (
              <>
                <div className="tagf-selected" aria-label="Selected tags">
                  {[
                    ...config.tags.map((t) => ['include', t] as const),
                    ...config.excludeTags.map((t) => ['exclude', t] as const),
                  ].map(([state, t]) => (
                    <span key={t} className={clsx('study-tag', state === 'include' ? 'is-on' : 'is-out')} title={t}>
                      {state === 'include' ? (
                        <Plus size={12} strokeWidth={2.5} aria-hidden />
                      ) : (
                        <Minus size={12} strokeWidth={2.5} aria-hidden />
                      )}
                      <span className="study-tag__name">{t}</span>
                      <span className="study-tag__n tabular">{fmtInt(nodeByPath.get(t)?.cards ?? 0)}</span>
                      <button
                        type="button"
                        className="tagf-selected__remove"
                        aria-label={`Remove ${t}`}
                        onClick={() => setTag(t, state)}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <p className="study-filter__summary">
                  {describeTags(config.tags, config.tagMatch, config.excludeTags)}
                  {preview && (
                    <span className="tabular">
                      {' '}
                      {fmtInt(preview.matching)} {preview.matching === 1 ? 'card matches' : 'cards match'} in the selected decks.
                    </span>
                  )}
                </p>
              </>
            ) : (
              <p className="study-filter__summary">
                None: the session draws from every card in the selected decks. Use + to study only a tag and − to leave one out.
              </p>
            )}
          </section>
        )}
      </div>
    </Dialog>
  )
}
