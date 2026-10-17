import type { LibraryPayload } from '@askesis/contracts'
import clsx from 'clsx'
import { Check, ChevronRight, ChevronsDownUp, Hash, Pencil, Search, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { fmtInt } from '../../lib/format.ts'
import { useUserDataMutation } from '../../lib/queries.ts'
import { buildTagTree, searchTags, TAG_SEPARATOR, type TagNode, tagAncestors, visibleTagRows } from '../../lib/tags.ts'
import { deleteTag, renameTag } from '../../server/library.functions.ts'
import { errorMessage } from './lib.ts'
import { useToast } from './Toasts.tsx'

/** Tag rows shown at first, and added by each "Show more". */
const PAGE = 60

/** Whether `tag` is `path` itself or one of the tags below it. */
const isAtOrBelow = (tag: string | undefined, path: string) => tag === path || !!tag?.startsWith(path + TAG_SEPARATOR)

/** "lpic1::chapter::01" with the parent levels muted, for search results. */
function TagPath({ node }: { node: TagNode }) {
  const parent = node.path.slice(0, node.path.length - node.name.length)
  return (
    <>
      {parent && <span className="deckmgr-tag__parent">{parent}</span>}
      {node.name}
    </>
  )
}

/**
 * Tags as a tree ("parent::child" levels). Selecting a tag filters
 * the card browser to it and everything below it; renaming or deleting a level
 * also covers the tags below it.
 */
export function TagsPanel({
  library,
  active,
  onSelect,
}: {
  library: Pick<LibraryPayload, 'tags' | 'tagLevels'>
  active: string | undefined
  onSelect: (tag: string | undefined) => void
}) {
  const toast = useToast()
  // The filter moves with the tag before the lists refetch, so they never show the old name's empty results.
  const renameMutation = useUserDataMutation(
    ({ node, to }: { node: TagNode; to: string }) => renameTag({ data: { from: node.path, to } }),
    {
      onSuccess: (_, { node, to }) => {
        toast(`Renamed “${node.path}” to “${to}”${node.children.length ? ', with the tags below it' : ''}`)
        if (active && isAtOrBelow(active, node.path)) onSelect(to + active.slice(node.path.length))
      },
    },
  )
  const deleteMutation = useUserDataMutation((node: TagNode) => deleteTag({ data: { tag: node.path } }), {
    onSuccess: (_, node) => {
      toast(`Removed “${node.path}”${node.children.length ? ' and the tags below it' : ''} from every card`)
      if (isAtOrBelow(active, node.path)) onSelect(undefined)
    },
  })
  const { roots, all } = useMemo(() => buildTagTree(library), [library])
  const [open, setOpen] = useState<Set<string>>(() => new Set())
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [confirming, setConfirming] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const [limit, setLimit] = useState(PAGE)

  // The selected tag's parents stay expanded so it's visible in the tree.
  useEffect(() => {
    if (active) setOpen((o) => new Set([...o, ...tagAncestors(active)]))
  }, [active])
  useEffect(() => setLimit(PAGE), [filter])

  const rows = filter.trim() ? searchTags(all, filter) : visibleTagRows(roots, open)
  const shown = rows.slice(0, limit)
  const searching = !!filter.trim()

  function toggle(path: string) {
    setOpen((o) => {
      const next = new Set(o)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  async function rename(node: TagNode) {
    // Tags can't contain spaces.
    const to = draft.trim().replace(/\s+/g, '_')
    setEditing(null)
    if (!to || to === node.path) return
    try {
      await renameMutation.mutateAsync({ node, to })
    } catch (e) {
      toast(errorMessage(e), 'error')
    }
  }

  async function remove(node: TagNode) {
    if (confirming !== node.path) return setConfirming(node.path)
    setConfirming(null)
    try {
      await deleteMutation.mutateAsync(node)
    } catch (e) {
      toast(errorMessage(e), 'error')
    }
  }

  return (
    <section className="deckmgr-tags" aria-labelledby="deckmgr-tags-title">
      <header className="deckmgr-side__head">
        <h2 id="deckmgr-tags-title" className="deckmgr-side__title">
          Tags <span className="deckmgr-side__count">{fmtInt(library.tags.length)}</span>
        </h2>
        {open.size > 0 && !searching && (
          <button
            type="button"
            className="icon-btn deckmgr-tree__collapse"
            onClick={() => setOpen(new Set())}
            title="Collapse all"
            aria-label="Collapse all tags"
          >
            <ChevronsDownUp size={15} />
          </button>
        )}
      </header>
      {library.tags.length === 0 ? (
        <p className="deckmgr-side__empty">No tags yet. Add them in the card editor or with bulk actions.</p>
      ) : (
        <>
          {library.tags.length > 8 && (
            <label className="deckmgr-tags__filter">
              <Search size={14} aria-hidden />
              <input
                className="input"
                type="search"
                placeholder="Find a tag"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                aria-label="Find a tag"
              />
            </label>
          )}
          {searching && (
            <p className="deckmgr-tags__note">
              {rows.length
                ? `${fmtInt(rows.length)} ${rows.length === 1 ? 'match' : 'matches'}`
                : `No tag matches “${filter.trim()}”.`}
            </p>
          )}
          <ul className="deckmgr-tags__list">
            {shown.map((node) => {
              const isOpen = open.has(node.path)
              const label = node.children.length ? `${node.path} and the tags below it` : node.path
              return (
                <li
                  key={node.path}
                  className={clsx('deckmgr-tag', active === node.path && 'is-active')}
                  style={{ '--depth': searching ? 0 : node.depth } as React.CSSProperties}
                >
                  {editing === node.path ? (
                    <form
                      className="deckmgr-tag__edit"
                      onSubmit={(e) => {
                        e.preventDefault()
                        void rename(node)
                      }}
                    >
                      <input
                        className="input"
                        value={draft}
                        autoFocus
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => e.key === 'Escape' && setEditing(null)}
                        aria-label={`New name for ${node.path}`}
                      />
                      <button type="submit" className="icon-btn" aria-label="Save tag name">
                        <Check size={14} />
                      </button>
                      <button type="button" className="icon-btn" onClick={() => setEditing(null)} aria-label="Cancel">
                        <X size={14} />
                      </button>
                    </form>
                  ) : (
                    <>
                      {!searching && node.children.length > 0 ? (
                        <button
                          type="button"
                          className={clsx('deckmgr-tag__toggle', isOpen && 'is-open')}
                          aria-expanded={isOpen}
                          aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${node.path}`}
                          onClick={() => toggle(node.path)}
                        >
                          <ChevronRight size={14} />
                        </button>
                      ) : (
                        <span className="deckmgr-tag__toggle-spacer" />
                      )}
                      <button
                        type="button"
                        className="deckmgr-tag__name"
                        onClick={() => onSelect(active === node.path ? undefined : node.path)}
                        aria-pressed={active === node.path}
                        title={`Show cards tagged ${label}`}
                      >
                        <Hash size={13} aria-hidden />
                        <span className="deckmgr-tag__label">{searching ? <TagPath node={node} /> : node.name}</span>
                        {!searching && node.children.length > 0 && (
                          <span className="deckmgr-tag__sub">{node.children.length}</span>
                        )}
                        <span className="deckmgr-tag__count">{fmtInt(node.cards)}</span>
                      </button>
                      <span className="deckmgr-tag__actions">
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => {
                            setEditing(node.path)
                            setDraft(node.path)
                          }}
                          aria-label={`Rename ${node.path}`}
                          title={node.children.length ? 'Rename (the tags below it follow)' : 'Rename'}
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          className={clsx('icon-btn', confirming === node.path && 'is-danger')}
                          onClick={() => remove(node)}
                          onBlur={() => confirming === node.path && setConfirming(null)}
                          aria-label={confirming === node.path ? `Confirm removing ${label}` : `Delete ${label}`}
                          title={confirming === node.path ? `Click again to remove ${label} from every card` : 'Delete tag'}
                        >
                          <Trash2 size={13} />
                        </button>
                      </span>
                    </>
                  )}
                </li>
              )
            })}
          </ul>
          {rows.length > shown.length && (
            <button type="button" className="link-button deckmgr-tags__more" onClick={() => setLimit((n) => n + PAGE)}>
              Show {fmtInt(Math.min(PAGE, rows.length - shown.length))} more · {fmtInt(rows.length - shown.length)} left
            </button>
          )}
        </>
      )}
    </section>
  )
}
