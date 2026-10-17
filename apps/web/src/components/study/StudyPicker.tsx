import type { DeckNode, LibraryPayload } from '@askesis/contracts'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import clsx from 'clsx'
import { ChevronRight, Flame, Play, SlidersHorizontal, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { fmtInt, fmtMinutes } from '../../lib/format.ts'
import { queries } from '../../lib/queries.ts'
import { oneOf } from '../../lib/search-params.ts'
import { buildTagTree } from '../../lib/tags.ts'
import { DeckGlyph } from '../askesis/ui.tsx'
import { CustomStudyDialog } from './CustomStudyDialog.tsx'
import { DEFAULT_CONFIG, type Due, estimateMinutes, inputFor, type PickerConfig, previewInput, sumDue } from './pickerConfig.ts'
import { useStoredState } from './prefs.ts'
import { STUDY_ORDERS, toSearch } from './search.ts'

/** Today's cards: the regular session, without the custom study choices. */
const TODAY: Partial<PickerConfig> = { mode: 'scheduled', tags: [], excludeTags: [], order: 'mixed' }

/**
 * The /study page: quick starts, a deck tree with checkboxes and today's count
 * for the selection. Start studying runs today's cards; Custom study opens a
 * popup for other modes, tags, card counts and order. The choices are
 * remembered on this device.
 */
export function StudyPicker({ library }: { library: LibraryPayload }) {
  const navigate = useNavigate()
  const [stored, setConfig, loaded] = useStoredState('askesis-study-config', DEFAULT_CONFIG)
  const [collapsed, setCollapsed] = useState<string[]>([])
  const [customOpen, setCustomOpen] = useState(false)
  const decks = library.decks

  const childrenOf = useMemo(() => {
    const map = new Map<string | null, DeckNode[]>()
    for (const d of decks) map.set(d.parentId, [...(map.get(d.parentId) ?? []), d])
    return map
  }, [decks])
  const byId = useMemo(() => new Map(decks.map((d) => [d.id, d])), [decks])
  const tagPaths = useMemo(() => new Set(buildTagTree(library).all.map((n) => n.path)), [library])
  const descendants = (id: string): string[] => (childrenOf.get(id) ?? []).flatMap((d) => [d.id, ...descendants(d.id)])
  const ancestors = (id: string): string[] => {
    const parent = byId.get(id)?.parentId
    return parent ? [parent, ...ancestors(parent)] : []
  }

  // Stored decks and tags that no longer exist are dropped, and an order this
  // version doesn't know falls back to the default; the rest of the config is
  // kept. Until storage is read, everything counts as selected (and the
  // selection is hidden, see .is-pending).
  const config: PickerConfig = useMemo(() => {
    const deckIds = stored.deckIds.filter((id) => byId.has(id))
    const known = (t: string) => tagPaths.has(t)
    const tags = stored.tags.filter(known)
    const excludeTags = (stored.excludeTags ?? []).filter((t) => known(t) && !tags.includes(t))
    const order = oneOf(stored.order, STUDY_ORDERS) ?? DEFAULT_CONFIG.order
    return { ...stored, deckIds, tags, excludeTags, order, all: stored.all || (deckIds.length === 0 && !loaded) }
  }, [stored, byId, tagPaths, loaded])

  const checked = useMemo(() => new Set(config.all ? decks.map((d) => d.id) : config.deckIds), [config, decks])

  /**
   * Checking a deck checks its subdecks. A deck stays checked only while all of
   * its subdecks are, because studying a deck always includes its subdecks.
   */
  function toggle(id: string) {
    const next = new Set(checked)
    if (next.has(id)) {
      for (const x of [id, ...descendants(id), ...ancestors(id)]) next.delete(x)
    } else {
      for (const x of [id, ...descendants(id)]) next.add(x)
      for (const a of ancestors(id)) {
        if ((childrenOf.get(a) ?? []).every((c) => next.has(c.id))) next.add(a)
        else break
      }
    }
    setConfig({ all: next.size === decks.length, deckIds: [...next] })
  }

  // A row counts its subdecks' cards too, and is indeterminate while only some subdecks are checked.
  const rolled = (d: DeckNode): Due => sumDue([d.due, ...descendants(d.id).map((id) => byId.get(id)!.due)])
  const partly = (d: DeckNode) => !checked.has(d.id) && descendants(d.id).some((id) => checked.has(id))

  // The API expands each deck to its subdecks, so send only the top checked decks.
  const deckIds = config.all ? [] : [...checked].filter((id) => !checked.has(byId.get(id)?.parentId ?? ''))
  const allDue = sumDue(decks.map((d) => d.due))
  const nothingSelected = !config.all && deckIds.length === 0
  const deckLabel = config.all
    ? 'all decks'
    : deckIds.length === 1
      ? (byId.get(deckIds[0]!)?.path ?? '1 deck')
      : `${fmtInt(deckIds.length)} decks`

  function start(overrides: Partial<PickerConfig> & { deckIds?: string[] } = {}) {
    const c = { ...config, ...overrides }
    void navigate({ to: '/study/session', search: toSearch(inputFor(c, overrides.deckIds ?? deckIds)) })
  }
  const startToday = (ids = deckIds) => start({ ...TODAY, deckIds: ids })

  // Today's count from the server, which applies each deck's daily limits exactly
  // as the session will. Until it arrives, the deck rows' sum stands in.
  const today = useQuery({
    ...queries.studyPreview(previewInput({ ...config, ...TODAY }, deckIds)),
    enabled: loaded && !nothingSelected,
  })
  const selectedDue = sumDue(decks.filter((d) => checked.has(d.id)).map((d) => d.due))
  const todayCounts = today.data?.counts ?? selectedDue
  const todayTotal = today.data?.session ?? selectedDue.new + selectedDue.learning + selectedDue.review

  /** A deck's row followed by its subdecks' rows, unless it is collapsed. */
  function row(d: DeckNode, depth: number): React.ReactNode[] {
    const kids = childrenOf.get(d.id) ?? []
    const open = !collapsed.includes(d.id)
    const due = rolled(d)
    const isChecked = checked.has(d.id)
    return [
      <li key={d.id} className="study-deck" style={{ '--depth': depth } as React.CSSProperties}>
        <div className="study-deck__main">
          {kids.length ? (
            <button
              type="button"
              className={clsx('study-deck__toggle', open && 'is-open')}
              aria-expanded={open}
              aria-label={`${open ? 'Collapse' : 'Expand'} ${d.name}`}
              onClick={() => setCollapsed((c) => (open ? [...c, d.id] : c.filter((x) => x !== d.id)))}
            >
              <ChevronRight size={14} />
            </button>
          ) : (
            <span className="study-deck__toggle-spacer" />
          )}
          <label className="study-deck__label">
            <input
              type="checkbox"
              className="study-check"
              checked={isChecked}
              ref={(el) => {
                if (el) el.indeterminate = partly(d)
              }}
              onChange={() => toggle(d.id)}
            />
            <DeckGlyph icon={d.icon} size="sm" />
            <span className="study-deck__name">{d.name}</span>
          </label>
          <span className="study-deck__counts tabular" aria-label={`${due.new} new, ${due.learning} learning, ${due.review} due`}>
            <span className={clsx('study-n study-n--new', !due.new && 'is-zero')}>{due.new}</span>
            <span className={clsx('study-n study-n--learning', !due.learning && 'is-zero')}>{due.learning}</span>
            <span className={clsx('study-n study-n--review', !due.review && 'is-zero')}>{due.review}</span>
          </span>
          <button
            type="button"
            className="study-deck__go"
            onClick={() => startToday([d.id])}
            aria-label={`Study ${d.path} now`}
            title="Study this deck now"
          >
            <Play size={13} fill="currentColor" />
          </button>
        </div>
      </li>,
      ...(open ? kids.flatMap((k) => row(k, depth + 1)) : []),
    ]
  }

  if (decks.length === 0) {
    return (
      <div className="panel study-picker__empty">
        <h2>No decks yet</h2>
        <p>Create a deck or import a CSV first, then come back to study it.</p>
        <Link to="/dashboard" className="btn btn--primary btn--sm">
          Back to dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className={clsx('study-picker', !loaded && 'is-pending')}>
      <div className="study-picker__quick">
        <button type="button" className="study-quick" onClick={() => start({ ...TODAY, all: true, deckIds: [] })}>
          <span className="study-quick__icon">
            <Play size={16} fill="currentColor" />
          </span>
          <span>
            <span className="study-quick__title">All due today</span>
            <span className="study-quick__meta tabular">
              {fmtInt(allDue.new)} new · {fmtInt(allDue.learning)} learning · {fmtInt(allDue.review)} review
            </span>
          </span>
        </button>
        <button type="button" className="study-quick" onClick={() => start({ ...TODAY, mode: 'new', limit: 10 })}>
          <span className="study-quick__icon study-quick__icon--new">
            <Sparkles size={16} />
          </span>
          <span>
            <span className="study-quick__title">10 extra new cards</span>
            <span className="study-quick__meta">From the decks selected below</span>
          </span>
        </button>
        <button
          type="button"
          className="study-quick"
          onClick={() => start({ ...TODAY, mode: 'cram', limit: 25, order: 'random' })}
        >
          <span className="study-quick__icon study-quick__icon--cram">
            <Flame size={16} />
          </span>
          <span>
            <span className="study-quick__title">Quick cram</span>
            <span className="study-quick__meta">25 random cards, practice only</span>
          </span>
        </button>
      </div>

      {/* Before the deck list, so phones reach the start buttons without scrolling past every
          deck; wide screens place it in the right-hand column. */}
      <aside className="panel study-picker__config" aria-labelledby="pick-today">
        <div>
          <p className="eyebrow">Today</p>
          <h2 id="pick-today" className="study-picker__title">
            {config.all ? 'All decks' : deckIds.length === 1 ? byId.get(deckIds[0]!)?.name : `${fmtInt(deckIds.length)} decks`}
          </h2>
        </div>
        <div className="study-summary" aria-live="polite">
          <p className="study-summary__big tabular">
            {fmtInt(nothingSelected ? 0 : todayTotal)} <span>{todayTotal === 1 ? 'card due' : 'cards due'}</span>
          </p>
          <p className="study-summary__meta tabular">
            {nothingSelected
              ? 'Pick at least one deck.'
              : todayTotal
                ? `${fmtInt(todayCounts.new)} new · ${fmtInt(todayCounts.learning)} learning · ${fmtInt(todayCounts.review)} review · about ${fmtMinutes(estimateMinutes(todayCounts))}`
                : 'Nothing due in this selection. Custom study can review ahead, add new cards or cram.'}
          </p>
        </div>
        <div className="study-starts">
          <button type="button" className="btn btn--primary study-start" onClick={() => startToday()} disabled={nothingSelected}>
            <Play size={16} fill="currentColor" /> Start studying
          </button>
          <button
            type="button"
            className="btn btn--ghost study-start study-start--custom"
            onClick={() => setCustomOpen(true)}
            disabled={nothingSelected}
            aria-haspopup="dialog"
          >
            <SlidersHorizontal size={16} /> Custom study
          </button>
        </div>
        <p className="study-summary__meta">
          Custom study picks a mode, tags, how many cards and their order, for the decks selected here.
        </p>
      </aside>

      <section className="panel study-picker__decks" aria-labelledby="pick-decks">
        <div className="study-picker__head">
          <div>
            <p className="eyebrow">Decks</p>
            <h2 id="pick-decks" className="study-picker__title">
              {config.all ? 'All decks' : `${deckIds.length} selected`}
            </h2>
          </div>
          <label className="study-all">
            <input
              type="checkbox"
              className="study-check"
              checked={config.all}
              onChange={() => setConfig({ all: !config.all, deckIds: config.all ? [] : decks.map((d) => d.id) })}
            />
            All decks
          </label>
        </div>
        <div className="study-deck-head" aria-hidden>
          <span>Deck</span>
          <span className="study-deck-head__counts">
            <span className="study-deck-head__n study-deck-head__n--new">New</span>
            <span className="study-deck-head__n study-deck-head__n--learning">Learn</span>
            <span className="study-deck-head__n study-deck-head__n--review">Due</span>
          </span>
        </div>
        <ul className="study-decks">{(childrenOf.get(null) ?? []).flatMap((d) => row(d, 0))}</ul>
      </section>

      <CustomStudyDialog
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        library={library}
        config={config}
        setConfig={setConfig}
        deckIds={deckIds}
        deckLabel={deckLabel}
        enabled={loaded && !nothingSelected}
        onStart={() => start()}
      />
    </div>
  )
}
