import { Link, useNavigate } from '@tanstack/react-router'
import clsx from 'clsx'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { type DeckRow, type DueCounts, formatDay } from '@askesis/core'
import { fmtInt, fmtPct } from '../../lib/format.ts'
import { useSession } from './session.tsx'
import { DeckGlyph, PanelHeader } from './ui.tsx'

function Count({ value, kind }: { value: number; kind: keyof DueCounts }) {
  return <span className={clsx('deck-count', `deck-count--${kind}`, value === 0 && 'is-zero')}>{fmtInt(value)}</span>
}

function sum(rows: DueCounts[]): DueCounts {
  return rows.reduce((a, b) => ({ new: a.new + b.new, learning: a.learning + b.learning, review: a.review + b.review }), {
    new: 0,
    learning: 0,
    review: 0,
  })
}

/** The deck table: due counts per deck (subdecks roll up into their parent), recall and mastery. */
export function DeckTree() {
  const { data } = useSession()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState<string[]>([])
  // Real decks open in the deck manager; the sample decks on the home page don't exist there.
  const linked = !data.isDemo
  const roots = data.decks.filter((d) => d.parentId === null)
  const childrenOf = (id: string) => data.decks.filter((d) => d.parentId === id)
  const dueOf = (deck: DeckRow): DueCounts => sum([deck.due, ...childrenOf(deck.id).map(dueOf)])
  const totalCards = roots.reduce((n, d) => n + d.total, 0)

  /** A deck's row followed by its subdecks' rows (unless it's collapsed). */
  function row(deck: DeckRow, depth: number): React.ReactElement[] {
    const kids = childrenOf(deck.id)
    const open = !collapsed.includes(deck.id)
    const due = dueOf(deck)
    const mastery = deck.total ? deck.mature / deck.total : 0
    return [
      <tr
        key={deck.id}
        className={clsx('deck-row', depth > 0 && 'deck-row--child', linked && 'is-linked')}
        // The whole row opens the deck; the name is the keyboard-accessible link.
        onClick={(e) => {
          if (!linked || (e.target as HTMLElement).closest('a, button')) return
          void navigate({ to: '/decks', search: { deck: deck.id } })
        }}
      >
        <th scope="row" className="deck-row__name">
          <div className="deck-row__name-inner" style={{ '--depth': depth } as React.CSSProperties}>
            {kids.length > 0 ? (
              <button
                type="button"
                className={clsx('deck-row__toggle', open && 'is-open')}
                aria-expanded={open}
                aria-label={`${open ? 'Collapse' : 'Expand'} ${deck.name}`}
                onClick={() => setCollapsed((c) => (open ? [...c, deck.id] : c.filter((id) => id !== deck.id)))}
              >
                <ChevronRight size={14} />
              </button>
            ) : (
              <span className="deck-row__toggle-spacer" />
            )}
            <DeckGlyph icon={deck.icon} size={depth > 0 ? 'sm' : 'md'} />
            <div className="deck-row__label">
              {linked ? (
                <Link to="/decks" search={{ deck: deck.id }} className="deck-row__title deck-row__link">
                  {deck.name}
                </Link>
              ) : (
                <span className="deck-row__title">{deck.name}</span>
              )}
              <span className="deck-row__sub">
                {fmtInt(deck.total)} cards
                {deck.lastStudied && <> · {formatDay(deck.lastStudied, { month: 'short', day: 'numeric' })}</>}
              </span>
            </div>
          </div>
        </th>
        <td className="num">
          <Count value={due.new} kind="new" />
        </td>
        <td className="num">
          <Count value={due.learning} kind="learning" />
        </td>
        <td className="num">
          <Count value={due.review} kind="review" />
        </td>
        <td className="num deck-row__optional">{deck.retention === null ? '—' : fmtPct(deck.retention, 1)}</td>
        <td className="deck-row__optional deck-row__mastery">
          <div className="deck-mastery" title={`${fmtInt(deck.mature)} of ${fmtInt(deck.total)} cards mature`}>
            <div className="deck-mastery__track">
              <div className="deck-mastery__fill" style={{ width: `${mastery * 100}%` }} />
            </div>
            <span className="tabular">{fmtPct(mastery)}</span>
          </div>
        </td>
      </tr>,
      ...(open ? kids.flatMap((k) => row(k, depth + 1)) : []),
    ]
  }

  return (
    <section className="panel decks" id="decks" aria-labelledby="decks-title">
      <PanelHeader
        eyebrow="Decks"
        title={
          <span id="decks-title">
            {fmtInt(totalCards)} cards across {roots.length} decks
          </span>
        }
      />
      <div className="decks__scroll">
        <table className="decks__table">
          <thead>
            <tr>
              <th scope="col">Deck</th>
              <th scope="col" className="num">
                <span className="deck-head deck-head--new">New</span>
              </th>
              <th scope="col" className="num">
                <span className="deck-head deck-head--learning">Learn</span>
              </th>
              <th scope="col" className="num">
                <span className="deck-head deck-head--review">Due</span>
              </th>
              <th scope="col" className="num deck-row__optional" title="True retention over the last 30 days">
                Recall
              </th>
              <th scope="col" className="deck-row__optional" title="Share of cards with an interval of 21+ days">
                Mature
              </th>
            </tr>
          </thead>
          <tbody>{roots.flatMap((d) => row(d, 0))}</tbody>
        </table>
      </div>
    </section>
  )
}
