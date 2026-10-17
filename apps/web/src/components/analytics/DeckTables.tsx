import { type Analytics, type AnalyticsDeckRow, DECK_PATH_SEPARATOR, LEECH_LAPSES } from '@askesis/core'
import { Link } from '@tanstack/react-router'
import clsx from 'clsx'
import { ArrowDown, ArrowUp, ArrowUpRight, ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'
import { fmtInt, fmtPct, plural } from '../../lib/format.ts'
import { DeckGlyph, PanelHeader } from '../askesis/ui.tsx'
import { fmtDays, fmtDuration } from './parts.tsx'

// Per-deck numbers (sortable) and the cards that give you the most trouble.

type SortKey = 'deck' | 'cards' | 'due' | 'reviews' | 'retention' | 'mature' | 'interval' | 'lapses' | 'ms'

const COLUMNS: {
  key: Exclude<SortKey, 'deck'>
  label: string
  value: (r: AnalyticsDeckRow) => number | null
  format: (r: AnalyticsDeckRow) => string
}[] = [
  { key: 'cards', label: 'Cards', value: (r) => r.cards, format: (r) => fmtInt(r.cards) },
  { key: 'due', label: 'Due', value: (r) => r.due, format: (r) => fmtInt(r.due) },
  { key: 'reviews', label: 'Reviews', value: (r) => r.reviews, format: (r) => fmtInt(r.reviews) },
  {
    key: 'retention',
    label: 'Retention',
    value: (r) => r.retention,
    format: (r) => (r.retention === null ? '—' : fmtPct(r.retention, 1)),
  },
  { key: 'mature', label: 'Mature', value: (r) => r.mature, format: (r) => (r.mature === null ? '—' : fmtPct(r.mature)) },
  {
    key: 'interval',
    label: 'Avg interval',
    value: (r) => r.interval,
    format: (r) => (r.interval === null ? '—' : fmtDays(r.interval)),
  },
  { key: 'lapses', label: 'Lapses', value: (r) => r.lapses, format: (r) => fmtInt(r.lapses) },
  { key: 'ms', label: 'Time', value: (r) => r.ms, format: (r) => (r.ms ? fmtDuration(r.ms) : '—') },
]

/** Numbers for every deck, sortable by any column; a deck's name filters the page to it. */
export function DeckTablePanel({ data }: { data: Analytics }) {
  // `deck` ascending is the tree (parents, then their subdecks); descending is Z–A by full name.
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({ key: 'deck', desc: false })
  const column = COLUMNS.find((c) => c.key === sort.key)
  const rows = column
    ? [...data.deckRows].sort((a, b) => {
        const x = column.value(a)
        const y = column.value(b)
        // Empty values sink to the bottom either way.
        if (x === null || y === null) return x === y ? 0 : x === null ? 1 : -1
        return sort.desc ? y - x : x - y
      })
    : sort.desc
      ? [...data.deckRows].sort((a, b) => b.path.localeCompare(a.path))
      : data.deckRows
  const tree = sort.key === 'deck' && !sort.desc

  const header = (key: SortKey, label: string, numeric: boolean) => {
    const active = sort.key === key
    return (
      <th
        key={key}
        scope="col"
        className={clsx(numeric && 'num')}
        aria-sort={active ? (sort.desc ? 'descending' : 'ascending') : 'none'}
      >
        <button
          type="button"
          className={clsx('sort-btn', active && 'is-active')}
          // Numbers sort high to low first; names A–Z (the tree) first.
          onClick={() => setSort({ key, desc: active ? !sort.desc : numeric })}
        >
          {label}
          {active ? (
            sort.desc ? (
              <ArrowDown size={13} aria-hidden />
            ) : (
              <ArrowUp size={13} aria-hidden />
            )
          ) : (
            <ChevronsUpDown size={13} aria-hidden />
          )}
        </button>
      </th>
    )
  }

  const range = data.days ? `last ${plural(data.days, 'day')}` : 'all time'
  return (
    <section className="panel an-panel" id="decks" aria-labelledby="decks-title">
      <PanelHeader eyebrow="Decks" title="Deck by deck" id="decks-title" />
      <p className="an-panel__headline an-panel__headline--quiet">
        Totals include subdecks. Reviews, retention and time cover the {range}; the rest is now. Select a deck to filter the page.
      </p>
      {rows.length === 0 ? (
        <p className="an-empty">No decks yet.</p>
      ) : (
        <div className="data-table-wrap deck-table">
          <table className="data-table">
            <thead>
              <tr>
                {header('deck', 'Deck', false)}
                {COLUMNS.map((c) => header(c.key, c.label, true))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <th scope="row">
                    <Link
                      to="/analytics"
                      search={(prev) => ({ ...prev, deck: r.id })}
                      resetScroll={false}
                      className="deck-table__name"
                      style={{ paddingInlineStart: tree ? `${r.depth * 1.1}rem` : undefined }}
                      title={`Show analytics for ${r.path}`}
                    >
                      <DeckGlyph icon={r.icon} size="sm" />
                      <span>
                        {!tree && r.depth > 0 && (
                          <span className="deck-table__parent">{r.path.slice(0, r.path.length - r.name.length)}</span>
                        )}
                        {r.name}
                      </span>
                    </Link>
                  </th>
                  {COLUMNS.map((c) => (
                    <td key={c.key} className="num">
                      {c.format(r)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

/** Card text without markup, for a one-line preview. */
function preview(front: string): string {
  return front
    .replace(/```\w*\n?/g, '')
    .replace(/\\[()[\]]/g, '')
    .replace(/[`*_]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const STATE_LABEL = ['New', 'Learning', 'Review', 'Relearning'] as const

/** The cards with the most lapses, leeches flagged, each with a link to find it in Decks. */
export function ToughCardsPanel({ data }: { data: Analytics }) {
  const leeches = data.tough.filter((c) => c.leech).length
  return (
    <section className="panel an-panel" id="tough" aria-labelledby="tough-title">
      <PanelHeader eyebrow="Toughest cards" title="The cards you forget most" id="tough-title" />
      <p className="an-panel__headline an-panel__headline--quiet">
        Ranked by lapses (times forgotten after learning).{' '}
        {leeches > 0 && `${plural(leeches, 'leech', 'leeches')} at ${LEECH_LAPSES}+ lapses. `}Rewording or splitting a card often
        fixes it.
      </p>
      {data.tough.length === 0 ? (
        <p className="an-empty">No lapses yet. Cards you forget after learning them show up here.</p>
      ) : (
        <ol className="tough" style={{ '--rows': Math.ceil(data.tough.length / 2) } as React.CSSProperties}>
          {data.tough.map((c, i) => (
            <li key={c.id} className="tough__item">
              <span className="tough__rank tabular" aria-hidden>
                {i + 1}
              </span>
              <div className="tough__main">
                <p className="tough__front">{preview(c.front) || 'Untitled card'}</p>
                <p className="tough__meta">
                  <span className="tough__deck">{c.deck.split(DECK_PATH_SEPARATOR).at(-1)}</span>
                  <span>
                    {c.suspended ? 'Suspended' : STATE_LABEL[c.state]}
                    {c.state === 2 && ` · ${fmtDays(c.interval)}`}
                    {c.recall !== null && ` · ${fmtPct(c.recall)} recall`}
                  </span>
                </p>
              </div>
              <div className="tough__stats">
                <span className="tough__lapses">
                  <strong className="tabular">{fmtInt(c.lapses)}</strong> {c.lapses === 1 ? 'lapse' : 'lapses'}
                </span>
                {c.leech ? (
                  <span className="chip tough__leech">Leech</span>
                ) : (
                  c.again > 0 && <span className="tough__again">{fmtInt(c.again)}× Again lately</span>
                )}
              </div>
              <Link
                to="/decks"
                search={{ deck: c.deckId, q: c.front.split('\n')[0]!.slice(0, 120) }}
                className="icon-btn tough__open"
                aria-label={`Open “${preview(c.front).slice(0, 60)}” in Decks`}
                title="Open in Decks"
              >
                <ArrowUpRight size={17} />
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
