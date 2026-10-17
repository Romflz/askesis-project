import { TAG_MAX } from '@askesis/contracts'
import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  size,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react'
import clsx from 'clsx'
import { Check, Plus, Search, X } from 'lucide-react'
import { type KeyboardEvent, type ReactNode, useContext, useEffect, useId, useMemo, useRef, useState } from 'react'
import { PortalRootContext } from './Popover.tsx'

export interface PickItem {
  value: string
  label: string
  /** Shown dimmed after the label (a path, a count). */
  meta?: string
  depth?: number
  icon?: ReactNode
}

/**
 * A searchable list for use inside a <Popover>: type to filter, arrows to move,
 * Enter to pick. `create` offers the typed text as a new value (e.g. a new tag).
 */
export function SearchList({
  items,
  onPick,
  placeholder = 'Search…',
  empty = 'Nothing matches',
  selected,
  create,
}: {
  items: PickItem[]
  onPick: (value: string) => void
  placeholder?: string
  empty?: string
  selected?: string
  create?: (query: string) => string | null
}) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const listId = useId()
  const listRef = useRef<HTMLUListElement>(null)

  const q = query.trim().toLowerCase()
  const filtered = q ? items.filter((i) => i.label.toLowerCase().includes(q) || i.meta?.toLowerCase().includes(q)) : items
  const created = create && q && !items.some((i) => i.value.toLowerCase() === q) ? create(query.trim()) : null
  const rows: (PickItem & { isCreate?: boolean })[] = created
    ? [...filtered, { value: created, label: `Create “${created}”`, isCreate: true }]
    : filtered

  useEffect(() => setActive(0), [query])
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(rows.length - 1, a + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(0, a - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const row = rows[active]
      if (row) onPick(row.value)
    }
  }

  return (
    <div className="picker">
      <label className="picker__search">
        <Search size={14} />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          role="combobox"
          aria-expanded
          aria-controls={listId}
          aria-activedescendant={rows[active] ? `${listId}-${active}` : undefined}
          aria-autocomplete="list"
        />
      </label>
      <ul className="picker__list" role="listbox" id={listId} ref={listRef}>
        {rows.length === 0 && <li className="picker__empty">{empty}</li>}
        {rows.map((row, i) => (
          <li
            key={`${row.value}-${i}`}
            id={`${listId}-${i}`}
            data-index={i}
            role="option"
            aria-selected={i === active}
            className={clsx('picker__option', i === active && 'is-active', row.isCreate && 'is-create')}
            // Search results drop the tree indent.
            style={{ '--depth': q ? 0 : (row.depth ?? 0) } as React.CSSProperties}
            onMouseEnter={() => setActive(i)}
            // Keep focus in the search box.
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onPick(row.value)}
          >
            {row.isCreate ? <Plus size={14} /> : row.icon}
            <span className="picker__label">{row.label}</span>
            {row.meta && <span className="picker__meta">{row.meta}</span>}
            {selected === row.value && <Check size={14} className="picker__check" />}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Tags as chips with suggestions: Enter, space or comma adds; Backspace on empty removes the last. */
export function TagCombo({
  value,
  onChange,
  suggestions,
  id,
  placeholder = 'Add tags…',
}: {
  value: string[]
  onChange: (tags: string[]) => void
  suggestions: string[]
  id?: string
  placeholder?: string
}) {
  const [draft, setDraft] = useState('')
  const [focused, setFocused] = useState(false)
  const [active, setActive] = useState(0)
  const [navigated, setNavigated] = useState(false)
  const root = useContext(PortalRootContext)
  const listId = useId()

  const options = useMemo(() => {
    const q = draft.trim().toLowerCase()
    return suggestions.filter((s) => !value.includes(s) && (!q || s.toLowerCase().includes(q))).slice(0, 8)
  }, [draft, suggestions, value])
  const open = focused && options.length > 0

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: (o) => !o && setFocused(false),
    placement: 'bottom-start',
    strategy: 'fixed',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(4),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      size({ apply: ({ rects, elements }) => void (elements.floating.style.minWidth = `${rects.reference.width}px`) }),
    ],
  })
  const { getFloatingProps } = useInteractions([useDismiss(context)])

  useEffect(() => {
    setActive(0)
    setNavigated(false)
  }, [draft])

  // Pasted text may hold several tags; each is trimmed, capped and added once.
  function add(raw: string) {
    const tags = raw
      .split(/[\s,]+/)
      .map((t) => t.trim().slice(0, TAG_MAX))
      .filter(Boolean)
    if (tags.length) onChange([...new Set([...value, ...tags])])
    setDraft('')
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    const typed = draft.trim()
    if (open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault()
      setNavigated(true)
      setActive((a) => (e.key === 'ArrowDown' ? Math.min(options.length - 1, a + 1) : Math.max(0, a - 1)))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      // A suggestion wins when the user moved to it or it completes what they typed.
      const suggestion = options[active]
      if (open && suggestion && (navigated || (typed && suggestion.toLowerCase().startsWith(typed.toLowerCase()))))
        add(suggestion)
      else if (typed) add(typed)
    } else if ((e.key === ' ' || e.key === ',') && typed) {
      e.preventDefault()
      add(typed)
    } else if (e.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1))
    } else if (e.key === 'Escape' && open) {
      // Close the suggestions without closing a surrounding dialog.
      e.preventDefault()
      e.stopPropagation()
      setFocused(false)
    }
  }

  return (
    <div className="taginput" ref={refs.setReference}>
      {value.map((tag) => (
        <span key={tag} className="taginput__chip">
          {tag}
          <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))} aria-label={`Remove tag ${tag}`}>
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        id={id}
        className="taginput__input"
        value={draft}
        placeholder={value.length ? '' : placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false)
          if (draft.trim()) add(draft)
        }}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        spellCheck={false}
      />
      {open && (
        <FloatingPortal root={root ?? undefined}>
          <ul
            ref={refs.setFloating}
            style={floatingStyles}
            id={listId}
            role="listbox"
            className="pop picker__list picker__list--floating"
            {...getFloatingProps()}
          >
            {options.map((o, i) => (
              <li
                key={o}
                role="option"
                aria-selected={i === active}
                className={clsx('picker__option', i === active && 'is-active')}
                onMouseEnter={() => setActive(i)}
                // Picks on mousedown and keeps focus, so the input's blur doesn't add the half-typed draft.
                onMouseDown={(e) => {
                  e.preventDefault()
                  add(o)
                }}
              >
                <span className="picker__label">#{o}</span>
              </li>
            ))}
          </ul>
        </FloatingPortal>
      )}
    </div>
  )
}
