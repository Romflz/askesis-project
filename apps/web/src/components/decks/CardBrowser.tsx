import {
  CARD_FILTERS,
  type CardBulkInput,
  type CardListItem,
  type CardListResult,
  type LibraryPayload,
  TAG_MAX,
} from '@askesis/contracts'
import { DECK_PATH_SEPARATOR, formatInterval } from '@askesis/core'
import clsx from 'clsx'
import { ChevronDown, ChevronLeft, ChevronRight, Columns3, Plus, Rows3, Rows4, Search, Tag, Upload, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { fmtInt } from '../../lib/format.ts'
import { useUserDataMutation } from '../../lib/queries.ts'
import { TAG_SEPARATOR } from '../../lib/tags.ts'
import { bulkCards } from '../../server/library.functions.ts'
import { stripMarkup } from '../askesis/CardText.tsx'
import { DeckGlyph } from '../askesis/ui.tsx'
import { buildTree, errorMessage, flatten, relativeDue, useNow, usePrefs } from './lib.ts'
import { SearchList } from './Pickers.tsx'
import { Popover } from './Popover.tsx'
import { useToast } from './Toasts.tsx'

export type CardFilter = (typeof CARD_FILTERS)[number]
export type CardSort = 'created' | 'due' | 'front' | 'lapses'

export interface BrowserSearch {
  deck?: string
  q: string
  tag?: string
  filter: CardFilter
  sort: CardSort
  page: number
  size: number
}

const FILTER_LABELS: Record<CardFilter, string> = {
  all: 'All',
  new: 'New',
  learning: 'Learning',
  review: 'Review',
  due: 'Due today',
  suspended: 'Suspended',
  leech: 'Leeches',
}

const COLUMNS = [
  { key: 'back', label: 'Back' },
  { key: 'deck', label: 'Deck' },
  { key: 'tags', label: 'Tags' },
  { key: 'due', label: 'Due' },
  { key: 'interval', label: 'Interval' },
  { key: 'ease', label: 'Ease' },
  { key: 'reps', label: 'Reviews' },
  { key: 'lapses', label: 'Lapses' },
] as const
type ColumnKey = (typeof COLUMNS)[number]['key']

const DEFAULT_PREFS = {
  density: 'comfortable' as 'comfortable' | 'compact',
  columns: { back: true, deck: true, tags: true, due: true, interval: false, ease: false, reps: false, lapses: false } as Record<
    ColumnKey,
    boolean
  >,
}

/** Past-tense verbs for the toast after a bulk action. */
const BULK_DONE: Record<CardBulkInput['action'], string> = {
  suspend: 'suspended',
  unsuspend: 'unsuspended',
  delete: 'deleted',
  move: 'moved',
  addTag: 'tagged',
  removeTag: 'untagged',
  forget: 'reset to new',
}

/** Card text as a single plain line, for table cells and labels. */
function oneLine(text: string): string {
  return stripMarkup(text).replace(/\s+/g, ' ')
}

/**
 * The card table for the selected deck: search, tag and state filters, sorting,
 * paging, configurable columns and bulk actions on the selected rows.
 */
export function CardBrowser({
  cards,
  library,
  search,
  setSearch,
  onOpen,
  onNew,
  onImport,
}: {
  cards: CardListResult
  library: LibraryPayload
  search: BrowserSearch
  setSearch: (patch: Partial<BrowserSearch>) => void
  onOpen: (card: CardListItem) => void
  onNew: () => void
  onImport: () => void
}) {
  const toast = useToast()
  const bulk = useUserDataMutation(bulkCards)
  const now = useNow()
  const [prefs, setPrefs] = usePrefs('askesis:card-browser', DEFAULT_PREFS)
  const [query, setQuery] = useState(search.q)
  const [selected, setSelected] = useState<string[]>([])
  const busy = bulk.isPending

  // The search box writes to the URL once typing pauses, and follows the URL when
  // it changes elsewhere (back button, Clear filters).
  useEffect(() => setQuery(search.q), [search.q])
  useEffect(() => {
    if (query === search.q) return
    const timer = setTimeout(() => setSearch({ q: query, page: 1 }), 300)
    return () => clearTimeout(timer)
  }, [query, search.q, setSearch])

  // A new page of results starts with nothing selected.
  useEffect(() => setSelected([]), [cards])

  const deckNodes = useMemo(() => flatten(buildTree(library.decks)), [library.decks])
  const deckPath = useMemo(() => new Map(library.decks.map((d) => [d.id, d.path])), [library.decks])
  // Inside a deck without subdecks every card has the same deck, so the column is noise.
  const singleDeck = !!search.deck && !library.decks.some((d) => d.parentId === search.deck)
  const visible = COLUMNS.filter((c) => prefs.columns[c.key] && !(c.key === 'deck' && singleDeck))
  const pageIds = cards.items.map((c) => c.id)
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selected.includes(id))
  const someSelected = selected.length > 0 && !allSelected
  const filtered = !!(search.q || search.tag || search.filter !== 'all')
  const clearFilters = () => setSearch({ q: '', tag: undefined, filter: 'all', page: 1 })
  const selectedCards = cards.items.filter((c) => selected.includes(c.id))
  const selectedTags = [...new Set(selectedCards.flatMap((c) => c.tags))].sort()
  const anySuspended = selectedCards.some((c) => c.suspended)
  const anyActive = selectedCards.some((c) => !c.suspended)

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  async function runBulk(action: CardBulkInput['action'], extra: { deckId?: string; tag?: string } = {}) {
    if (!selected.length) return
    try {
      await bulk.mutateAsync({ data: { ids: selected, action, ...extra } })
      const n = selected.length
      const where =
        action === 'move' && extra.deckId ? ` to ${deckPath.get(extra.deckId)?.replaceAll(DECK_PATH_SEPARATOR, ' › ')}` : ''
      const tag = extra.tag ? ` #${extra.tag}` : ''
      toast(`${fmtInt(n)} ${n === 1 ? 'card' : 'cards'} ${BULK_DONE[action]}${tag}${where}`)
    } catch (e) {
      toast(errorMessage(e), 'error')
    }
  }

  function dueLabel(card: CardListItem): string {
    if (card.suspended) return 'Suspended'
    if (card.state === 0) return 'New'
    if (now === null) return '·'
    return relativeDue(card.due, now)
  }

  const deckItems = deckNodes.map((d) => ({
    value: d.id,
    label: d.name,
    meta: d.depth > 0 ? d.path.split(DECK_PATH_SEPARATOR).slice(0, -1).join(' › ') : undefined,
    depth: d.depth,
    icon: <DeckGlyph icon={d.icon} size="sm" />,
  }))
  const tagItems = library.tags.map((t) => ({ value: t.tag, label: `#${t.tag}`, meta: fmtInt(t.cards) }))
  const from = cards.total === 0 ? 0 : (cards.page - 1) * search.size + 1
  const to = Math.min(cards.total, cards.page * search.size)

  return (
    <section className="panel deckmgr-browser" aria-label="Cards">
      <div className="deckmgr-toolbar">
        <label className="deckmgr-search">
          <Search size={15} />
          <input
            type="search"
            placeholder="Search front and back"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search cards"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear search">
              <X size={14} />
            </button>
          )}
        </label>
        <Popover
          label="Filter by tag"
          placement="bottom-start"
          trigger={(props, open) => (
            <button type="button" {...props} className={clsx('deckmgr-chipbtn', search.tag && 'is-set', open && 'is-open')}>
              <Tag size={14} />
              {search.tag ? `#${search.tag}` : 'Any tag'}
              <ChevronDown size={14} />
            </button>
          )}
        >
          {(close) => (
            <div className="pop__section">
              {library.tags.length === 0 ? (
                <p className="pop__note">No tags yet. Add them in the card editor or with bulk actions.</p>
              ) : (
                <SearchList
                  items={[{ value: '', label: 'Any tag' }, ...tagItems]}
                  selected={search.tag ?? ''}
                  placeholder="Find a tag"
                  onPick={(tag) => {
                    setSearch({ tag: tag || undefined, page: 1 })
                    close()
                  }}
                />
              )}
            </div>
          )}
        </Popover>
        <select
          className="input select deckmgr-toolbar__sort"
          value={search.sort}
          onChange={(e) => setSearch({ sort: e.target.value as CardSort, page: 1 })}
          aria-label="Sort cards"
        >
          <option value="created">Newest first</option>
          <option value="due">Due soonest</option>
          <option value="front">Front A–Z</option>
          <option value="lapses">Most lapses</option>
        </select>
        <div className="deckmgr-toolbar__view">
          <button
            type="button"
            className="icon-btn"
            onClick={() => setPrefs({ density: prefs.density === 'compact' ? 'comfortable' : 'compact' })}
            aria-label={prefs.density === 'compact' ? 'Show roomier rows' : 'Show compact rows'}
            title={prefs.density === 'compact' ? 'Roomier rows' : 'Compact rows'}
          >
            {prefs.density === 'compact' ? <Rows3 size={16} /> : <Rows4 size={16} />}
          </button>
          <Popover
            label="Visible columns"
            placement="bottom-end"
            trigger={(props, open) => (
              <button
                type="button"
                {...props}
                className={clsx('icon-btn', open && 'is-on')}
                aria-label="Choose columns"
                title="Choose columns"
              >
                <Columns3 size={16} />
              </button>
            )}
          >
            <div className="pop__section">
              <p className="pop__heading">Show columns</p>
              {COLUMNS.map((c) => (
                <label key={c.key} className="pop__check">
                  <input
                    type="checkbox"
                    checked={prefs.columns[c.key]}
                    onChange={(e) => setPrefs({ columns: { ...prefs.columns, [c.key]: e.target.checked } })}
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </Popover>
        </div>
      </div>

      <div className="deckmgr-filters">
        <div className="segmented deckmgr-filters__states" role="group" aria-label="Filter by state">
          {CARD_FILTERS.map((f) => (
            <button key={f} type="button" aria-pressed={search.filter === f} onClick={() => setSearch({ filter: f, page: 1 })}>
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>
        {filtered && (
          <button type="button" className="link-button deckmgr-filters__clear" onClick={clearFilters}>
            Clear filters
          </button>
        )}
      </div>

      {cards.items.length === 0 ? (
        <div className="deckmgr-empty deckmgr-empty--inline">
          {filtered ? (
            <>
              <p className="deckmgr-empty__title">No cards match these filters</p>
              <p className="deckmgr-empty__text">Try a different search, state or tag.</p>
              <button type="button" className="btn btn--ghost btn--sm" onClick={clearFilters}>
                Clear filters
              </button>
            </>
          ) : (
            <>
              <p className="deckmgr-empty__title">{search.deck ? 'This deck has no cards yet' : 'You have no cards yet'}</p>
              <p className="deckmgr-empty__text">
                Write cards here, or bring in a CSV or a plain-text export from another flashcard app.
              </p>
              <div className="deckmgr-empty__actions">
                <button type="button" className="btn btn--primary btn--sm" onClick={onNew} disabled={library.decks.length === 0}>
                  <Plus size={15} /> Add a card
                </button>
                <button type="button" className="btn btn--ghost btn--sm" onClick={onImport}>
                  <Upload size={15} /> Import a file
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="deckmgr-table-wrap">
          <table className={clsx('deckmgr-table', prefs.density === 'compact' && 'is-compact')}>
            <thead>
              <tr>
                <th scope="col" className="deckmgr-table__check">
                  <input
                    type="checkbox"
                    aria-label="Select all on this page"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected
                    }}
                    onChange={() => setSelected(allSelected ? [] : pageIds)}
                  />
                </th>
                <th scope="col" className="deckmgr-col--front">
                  Front
                </th>
                {visible.map((c) => (
                  <th
                    key={c.key}
                    scope="col"
                    className={clsx(`deckmgr-col--${c.key}`, ['interval', 'ease', 'reps', 'lapses'].includes(c.key) && 'num')}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cards.items.map((card) => (
                <tr
                  key={card.id}
                  className={clsx(selected.includes(card.id) && 'is-selected', card.suspended && 'is-suspended')}
                  // A click anywhere on the row opens the card, except on the row's own controls.
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('input, button, a')) return
                    onOpen(card)
                  }}
                >
                  <td className="deckmgr-table__check">
                    <input
                      type="checkbox"
                      aria-label={`Select ${oneLine(card.front)}`}
                      checked={selected.includes(card.id)}
                      onChange={() => toggle(card.id)}
                    />
                  </td>
                  <td className="deckmgr-table__front">
                    <button type="button" className="deckmgr-table__open" onClick={() => onOpen(card)}>
                      {oneLine(card.front)}
                    </button>
                    {card.hint && <span className="deckmgr-table__hint">{card.hint}</span>}
                  </td>
                  {visible.map((c) => {
                    switch (c.key) {
                      case 'back':
                        return (
                          <td key={c.key} className="deckmgr-table__back">
                            {oneLine(card.back)}
                          </td>
                        )
                      case 'deck':
                        return (
                          <td
                            key={c.key}
                            className="deckmgr-table__deck"
                            title={deckPath.get(card.deckId)?.replaceAll(DECK_PATH_SEPARATOR, ' › ')}
                          >
                            {deckPath.get(card.deckId)?.split(DECK_PATH_SEPARATOR).at(-1)}
                          </td>
                        )
                      case 'tags':
                        return (
                          <td key={c.key} className="deckmgr-table__tags">
                            {card.tags.slice(0, 3).map((t) => (
                              <button
                                key={t}
                                type="button"
                                className={clsx('deckmgr-tagchip', t === 'leech' && 'is-leech')}
                                onClick={() => setSearch({ tag: t, page: 1 })}
                                title={`Show cards tagged #${t}`}
                              >
                                {/* Hierarchical tags show their last level; the title has the full path. */}
                                {t.split(TAG_SEPARATOR).at(-1)}
                              </button>
                            ))}
                            {card.tags.length > 3 && <span className="deckmgr-table__more">+{card.tags.length - 3}</span>}
                          </td>
                        )
                      case 'due':
                        return (
                          <td key={c.key} className="deckmgr-table__due">
                            <span
                              className={clsx('deckmgr-state', `deckmgr-state--${card.suspended ? 'suspended' : card.state}`)}
                            >
                              {card.state > 0 && !card.suspended && <span className="dot" />}
                              {dueLabel(card)}
                            </span>
                          </td>
                        )
                      case 'interval':
                        return (
                          <td key={c.key} data-label="Interval" className="num">
                            {card.state === 0 ? '—' : formatInterval(card.interval * 86_400_000)}
                          </td>
                        )
                      case 'ease':
                        return (
                          <td key={c.key} data-label="Ease" className="num">
                            {card.ease ? `${Math.round(card.ease * 100)}%` : '—'}
                          </td>
                        )
                      case 'reps':
                        return (
                          <td key={c.key} data-label="Reviews" className="num">
                            {card.reps}
                          </td>
                        )
                      case 'lapses':
                        return (
                          <td key={c.key} data-label="Lapses" className={clsx('num', card.lapses >= 4 && 'is-warn')}>
                            {card.lapses}
                          </td>
                        )
                    }
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {cards.total > 0 && (
        <footer className="deckmgr-pager">
          <span className="deckmgr-pager__info tabular">
            {fmtInt(from)}–{fmtInt(to)} of {fmtInt(cards.total)}
          </span>
          <select
            className="input select deckmgr-pager__size"
            value={search.size}
            onChange={(e) => setSearch({ size: Number(e.target.value), page: 1 })}
            aria-label="Cards per page"
          >
            {[25, 50, 100, 200].map((n) => (
              <option key={n} value={n}>
                {n} per page
              </option>
            ))}
          </select>
          <div className="deckmgr-pager__nav">
            <button
              type="button"
              className="icon-btn"
              disabled={cards.page <= 1}
              onClick={() => setSearch({ page: cards.page - 1 })}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="tabular">
              Page {cards.page} of {cards.pageCount}
            </span>
            <button
              type="button"
              className="icon-btn"
              disabled={cards.page >= cards.pageCount}
              onClick={() => setSearch({ page: cards.page + 1 })}
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </footer>
      )}

      {selected.length > 0 && (
        <div className="deckmgr-bulk" role="region" aria-label="Actions for selected cards">
          <span className="deckmgr-bulk__count">
            {fmtInt(selected.length)} selected
            <button type="button" className="link-button" onClick={() => setSelected([])}>
              Clear
            </button>
          </span>
          <div className="deckmgr-bulk__actions">
            {anyActive && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => runBulk('suspend')} disabled={busy}>
                Suspend
              </button>
            )}
            {anySuspended && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => runBulk('unsuspend')} disabled={busy}>
                Unsuspend
              </button>
            )}
            <Popover
              label="Move to deck"
              placement="top-start"
              trigger={(props) => (
                <button type="button" {...props} className="btn btn--ghost btn--sm" disabled={busy}>
                  Move to… <ChevronDown size={14} />
                </button>
              )}
            >
              {(close) => (
                <div className="pop__section">
                  <SearchList
                    items={deckItems}
                    placeholder="Find a deck"
                    onPick={(deckId) => {
                      close()
                      void runBulk('move', { deckId })
                    }}
                  />
                </div>
              )}
            </Popover>
            <Popover
              label="Add a tag"
              placement="top-start"
              trigger={(props) => (
                <button type="button" {...props} className="btn btn--ghost btn--sm" disabled={busy}>
                  Add tag… <ChevronDown size={14} />
                </button>
              )}
            >
              {(close) => (
                <div className="pop__section">
                  <SearchList
                    items={tagItems}
                    placeholder="Type a tag"
                    empty="Type a name to create a tag"
                    // Tags can't contain spaces.
                    create={(q) => q.replace(/\s+/g, '_').slice(0, TAG_MAX)}
                    onPick={(tag) => {
                      close()
                      void runBulk('addTag', { tag })
                    }}
                  />
                </div>
              )}
            </Popover>
            {selectedTags.length > 0 && (
              <Popover
                label="Remove a tag"
                placement="top-start"
                trigger={(props) => (
                  <button type="button" {...props} className="btn btn--ghost btn--sm" disabled={busy}>
                    Remove tag… <ChevronDown size={14} />
                  </button>
                )}
              >
                {(close) => (
                  <div className="pop__section">
                    <SearchList
                      items={selectedTags.map((t) => ({ value: t, label: `#${t}` }))}
                      placeholder="Find a tag"
                      onPick={(tag) => {
                        close()
                        void runBulk('removeTag', { tag })
                      }}
                    />
                  </div>
                )}
              </Popover>
            )}
            <ConfirmPopover
              label="Forget"
              text="Reset these cards to new? Their review history is kept."
              confirm="Reset to new"
              onConfirm={() => runBulk('forget')}
              disabled={busy}
            />
            <ConfirmPopover
              label="Delete"
              danger
              text={`Delete ${fmtInt(selected.length)} ${selected.length === 1 ? 'card' : 'cards'} and their review history?`}
              confirm="Delete for good"
              onConfirm={() => runBulk('delete')}
              disabled={busy}
            />
          </div>
        </div>
      )}
    </section>
  )
}

/** A bulk action button that asks for confirmation in a popover first. */
function ConfirmPopover({
  label,
  text,
  confirm,
  onConfirm,
  danger,
  disabled,
}: {
  label: string
  text: string
  confirm: string
  onConfirm: () => void
  danger?: boolean
  disabled?: boolean
}) {
  return (
    <Popover
      label={label}
      placement="top-start"
      trigger={(props) => (
        <button
          type="button"
          {...props}
          className={clsx('btn btn--ghost btn--sm', danger && 'deckmgr-bulk__danger')}
          disabled={disabled}
        >
          {label}…
        </button>
      )}
    >
      {(close) => (
        <div className="pop__section pop__confirm">
          <p>{text}</p>
          <div className="pop__confirm-actions">
            <button type="button" className="btn btn--ghost btn--sm" onClick={close}>
              Cancel
            </button>
            <button
              type="button"
              className={clsx('btn btn--sm', danger ? 'btn--danger' : 'btn--primary')}
              onClick={() => {
                close()
                onConfirm()
              }}
            >
              {confirm}
            </button>
          </div>
        </div>
      )}
    </Popover>
  )
}
