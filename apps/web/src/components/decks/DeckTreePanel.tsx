import type { DeckNode, LibraryPayload } from '@askesis/contracts'
import clsx from 'clsx'
import {
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  Download,
  FolderInput,
  FolderPlus,
  Layers,
  MoreHorizontal,
  Palette,
  Pencil,
  SlidersHorizontal,
  Text,
  Trash2,
} from 'lucide-react'
import { useMemo } from 'react'
import { fmtInt } from '../../lib/format.ts'
import { DeckGlyph } from '../askesis/ui.tsx'
import type { DeckFocus } from './DeckDialog.tsx'
import { buildTree, flatten, type TreeNode } from './lib.ts'
import { Menu, MenuItem, MenuSeparator } from './Popover.tsx'

/** What deck rows, menus and the header can ask the decks manager to do. */
export interface DeckActions {
  select: (id: string | undefined) => void
  newSubdeck: (parentId: string) => void
  edit: (deck: DeckNode, focus: DeckFocus) => void
  exportDeck: (id: string) => void
  remove: (deck: TreeNode) => void
}

/** The ⋯ menu for a deck, shared by the tree rows and the deck header. */
export function DeckMenu({
  deck,
  actions,
  triggerClassName = 'icon-btn',
}: {
  deck: TreeNode
  actions: DeckActions
  triggerClassName?: string
}) {
  return (
    <Menu
      label={`${deck.name} actions`}
      trigger={(props, open) => (
        <button
          type="button"
          {...props}
          className={clsx(triggerClassName, 'deckmgr-menu-trigger', open && 'is-open')}
          aria-label={`More actions for ${deck.name}`}
          title="More actions"
        >
          <MoreHorizontal size={16} />
        </button>
      )}
    >
      <MenuItem icon={<FolderPlus size={15} />} onSelect={() => actions.newSubdeck(deck.id)}>
        New subdeck
      </MenuItem>
      <MenuSeparator />
      <MenuItem icon={<Pencil size={15} />} onSelect={() => actions.edit(deck, 'name')}>
        Rename
      </MenuItem>
      <MenuItem icon={<FolderInput size={15} />} onSelect={() => actions.edit(deck, 'parent')}>
        Move to another deck
      </MenuItem>
      <MenuItem icon={<Palette size={15} />} onSelect={() => actions.edit(deck, 'icon')}>
        Change icon
      </MenuItem>
      <MenuItem icon={<SlidersHorizontal size={15} />} onSelect={() => actions.edit(deck, 'preset')}>
        Scheduling preset
      </MenuItem>
      <MenuItem icon={<Text size={15} />} onSelect={() => actions.edit(deck, 'description')}>
        Description
      </MenuItem>
      <MenuSeparator />
      <MenuItem icon={<Download size={15} />} onSelect={() => actions.exportDeck(deck.id)}>
        Export
      </MenuItem>
      <MenuItem icon={<Trash2 size={15} />} danger onSelect={() => actions.remove(deck)}>
        Delete
      </MenuItem>
    </Menu>
  )
}

/** New, learning and review counts as colored badges; `compact` drops the words. */
export function DueBadges({ due, compact = false }: { due: DeckNode['due']; compact?: boolean }) {
  const total = due.new + due.learning + due.review
  if (total === 0) return <span className={clsx('due-badges', compact && 'due-badges--compact', 'is-clear')}>Nothing due</span>
  return (
    <span className={clsx('due-badges', compact && 'due-badges--compact')}>
      {(
        [
          ['new', due.new, 'new'],
          ['learning', due.learning, 'learning'],
          ['review', due.review, 'due'],
        ] as const
      ).map(([kind, n, label]) =>
        n > 0 ? (
          <span key={kind} className={`due-badge due-badge--${kind}`} title={`${fmtInt(n)} ${label}`}>
            <span className="dot" />
            {fmtInt(n)}
            {!compact && <span className="due-badge__label">{label}</span>}
          </span>
        ) : null,
      )}
    </span>
  )
}

/** The library sidebar: "All decks" and the collapsible deck tree, with a menu per deck. */
export function DeckTreePanel({
  library,
  selected,
  collapsed,
  onCollapse,
  actions,
}: {
  library: LibraryPayload
  selected: string | undefined
  collapsed: string[]
  onCollapse: (ids: string[]) => void
  actions: DeckActions
}) {
  const tree = useMemo(() => buildTree(library.decks), [library.decks])
  const rows = flatten(tree, collapsed)
  // Decks with subdecks, the only ones that can collapse.
  const parents = library.decks.filter((d) => library.decks.some((c) => c.parentId === d.id)).map((d) => d.id)
  const totals = tree.reduce(
    (t, d) => ({
      cards: t.cards + d.totalCards,
      due: {
        new: t.due.new + d.totalDue.new,
        learning: t.due.learning + d.totalDue.learning,
        review: t.due.review + d.totalDue.review,
      },
    }),
    { cards: 0, due: { new: 0, learning: 0, review: 0 } },
  )
  const allCollapsed = parents.length > 0 && parents.every((id) => collapsed.includes(id))

  return (
    <nav className="deckmgr-tree" aria-label="Decks">
      <header className="deckmgr-side__head">
        <h2 className="deckmgr-side__title">Library</h2>
        {parents.length > 0 && (
          <button
            type="button"
            className="icon-btn deckmgr-tree__collapse"
            onClick={() => onCollapse(allCollapsed ? [] : parents)}
            title={allCollapsed ? 'Expand all' : 'Collapse all'}
            aria-label={allCollapsed ? 'Expand all decks' : 'Collapse all decks'}
          >
            {allCollapsed ? <ChevronsUpDown size={15} /> : <ChevronsDownUp size={15} />}
          </button>
        )}
      </header>
      <ul className="deckmgr-tree__list">
        <li>
          <div className={clsx('deckmgr-tree__row', !selected && 'is-selected')}>
            <span className="deckmgr-tree__toggle-spacer" />
            <button
              type="button"
              className="deckmgr-tree__name"
              onClick={() => actions.select(undefined)}
              aria-current={!selected ? 'page' : undefined}
            >
              <span className="deckmgr-tree__all-icon">
                <Layers size={15} />
              </span>
              <span className="deckmgr-tree__label">
                <span className="deckmgr-tree__title">All decks</span>
                <span className="deckmgr-tree__meta">
                  <span className="deckmgr-tree__cards">{fmtInt(totals.cards)} cards</span>
                  <DueBadges due={totals.due} compact />
                </span>
              </span>
            </button>
          </div>
        </li>
        {rows.map((deck) => {
          const open = !collapsed.includes(deck.id)
          return (
            <li key={deck.id}>
              <div
                className={clsx('deckmgr-tree__row', selected === deck.id && 'is-selected')}
                style={{ '--depth': deck.depth } as React.CSSProperties}
              >
                {deck.children.length > 0 ? (
                  <button
                    type="button"
                    className={clsx('deckmgr-tree__toggle', open && 'is-open')}
                    aria-expanded={open}
                    onClick={() => onCollapse(open ? [...collapsed, deck.id] : collapsed.filter((id) => id !== deck.id))}
                    aria-label={`${open ? 'Collapse' : 'Expand'} ${deck.name}`}
                  >
                    <ChevronRight size={14} />
                  </button>
                ) : (
                  <span className="deckmgr-tree__toggle-spacer" />
                )}
                <button
                  type="button"
                  className="deckmgr-tree__name"
                  onClick={() => actions.select(deck.id)}
                  title={deck.description || undefined}
                  aria-current={selected === deck.id ? 'page' : undefined}
                >
                  <DeckGlyph icon={deck.icon} size={deck.depth > 0 ? 'sm' : 'md'} />
                  <span className="deckmgr-tree__label">
                    <span className="deckmgr-tree__title">{deck.name}</span>
                    <span className="deckmgr-tree__meta">
                      <span className="deckmgr-tree__cards">
                        {fmtInt(deck.totalCards)} {deck.totalCards === 1 ? 'card' : 'cards'}
                      </span>
                      <DueBadges due={deck.totalDue} compact />
                    </span>
                  </span>
                </button>
                <span className="deckmgr-tree__actions">
                  <DeckMenu deck={deck} actions={actions} />
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
