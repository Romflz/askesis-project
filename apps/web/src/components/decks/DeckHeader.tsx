import type { LibraryPayload } from '@askesis/contracts'
import { ChevronRight, FolderPlus, Layers, Pencil, Plus, SlidersHorizontal } from 'lucide-react'
import { useMemo } from 'react'
import { fmtInt } from '../../lib/format.ts'
import { DeckGlyph } from '../askesis/ui.tsx'
import { type DeckActions, DeckMenu, DueBadges } from './DeckTreePanel.tsx'
import { buildTree, flatten, type TreeNode } from './lib.ts'

/**
 * What you're looking at: breadcrumbs, the deck's name and numbers, and the
 * actions you most likely want next (add a card, edit). Studying lives on /study.
 */
export function DeckHeader({
  library,
  deckId,
  actions,
  onAddCard,
  onNewDeck,
}: {
  library: LibraryPayload
  deckId: string | undefined
  actions: DeckActions
  onAddCard: () => void
  onNewDeck: () => void
}) {
  const nodes = useMemo(() => flatten(buildTree(library.decks)), [library.decks])
  const deck = nodes.find((d) => d.id === deckId)

  // No deck selected: a summary of the whole library.
  if (!deck) {
    const roots = nodes.filter((d) => d.depth === 0)
    const due = roots.reduce(
      (t, d) => ({
        new: t.new + d.totalDue.new,
        learning: t.learning + d.totalDue.learning,
        review: t.review + d.totalDue.review,
      }),
      { new: 0, learning: 0, review: 0 },
    )
    const cards = roots.reduce((n, d) => n + d.totalCards, 0)
    return (
      <section className="panel deckhead" aria-labelledby="deckhead-title">
        <div className="deckhead__main">
          <span className="deckhead__icon">
            <Layers size={20} />
          </span>
          <div className="deckhead__text">
            <h2 id="deckhead-title" className="deckhead__title">
              All decks
            </h2>
            <p className="deckhead__stats">
              <span>
                {fmtInt(library.decks.length)} {library.decks.length === 1 ? 'deck' : 'decks'}
              </span>
              <span>{fmtInt(cards)} cards</span>
              <DueBadges due={due} />
            </p>
          </div>
        </div>
        <div className="deckhead__actions">
          <button type="button" className="btn btn--primary btn--sm" onClick={onAddCard}>
            <Plus size={15} /> Add card
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onNewDeck}>
            <FolderPlus size={15} /> New deck
          </button>
        </div>
      </section>
    )
  }

  // Breadcrumbs: walk up from the deck to its top-level ancestor.
  const trail: TreeNode[] = []
  for (let d: TreeNode | undefined = deck; d; d = nodes.find((n) => n.id === d!.parentId)) trail.unshift(d)
  const preset = library.presets.find((p) => p.id === deck.presetId)
  const subdecks = deck.children.length

  return (
    <section className="panel deckhead" aria-labelledby="deckhead-title">
      <nav className="deckhead__crumbs" aria-label="Breadcrumb">
        <ol>
          <li>
            <button type="button" onClick={() => actions.select(undefined)}>
              All decks
            </button>
          </li>
          {trail.map((d, i) => (
            <li key={d.id}>
              <ChevronRight size={13} aria-hidden />
              {i === trail.length - 1 ? (
                <span aria-current="page">{d.name}</span>
              ) : (
                <button type="button" onClick={() => actions.select(d.id)}>
                  {d.name}
                </button>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <div className="deckhead__body">
        <div className="deckhead__main">
          <DeckGlyph icon={deck.icon} />
          <div className="deckhead__text">
            <h2 id="deckhead-title" className="deckhead__title">
              {deck.name}
            </h2>
            {deck.description && <p className="deckhead__description">{deck.description}</p>}
            <p className="deckhead__stats">
              <span>
                {fmtInt(deck.totalCards)} {deck.totalCards === 1 ? 'card' : 'cards'}
                {subdecks > 0 && ` in ${subdecks + 1} decks`}
              </span>
              {deck.suspended > 0 && <span>{fmtInt(deck.suspended)} suspended</span>}
              <DueBadges due={deck.totalDue} />
              {preset && (
                <a className="deckhead__preset" href="/settings#presets" title="Scheduling preset (edit in Settings)">
                  <SlidersHorizontal size={13} /> {preset.name}
                </a>
              )}
            </p>
          </div>
        </div>
        <div className="deckhead__actions">
          <button type="button" className="btn btn--primary btn--sm" onClick={onAddCard}>
            <Plus size={15} /> Add card
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => actions.edit(deck, 'name')}>
            <Pencil size={14} /> Edit deck
          </button>
          <DeckMenu deck={deck} actions={actions} triggerClassName="btn btn--ghost btn--sm deckhead__more" />
        </div>
      </div>
    </section>
  )
}
