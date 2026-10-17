import type { DeckNode } from '@askesis/contracts'
import { useCallback, useEffect, useState } from 'react'

// Helpers shared by the decks manager.

export interface TreeNode extends DeckNode {
  children: TreeNode[]
  depth: number
  /** Own cards plus every subdeck's. */
  totalCards: number
  /** Own due counts plus every subdeck's. */
  totalDue: DeckNode['due']
}

/** Nests decks under their parents, sorted by name at each level, with totals rolled up from subdecks. */
export function buildTree(decks: DeckNode[]): TreeNode[] {
  const nodes = new Map<string, TreeNode>(
    decks.map((d) => [d.id, { ...d, children: [], depth: 0, totalCards: d.cards, totalDue: { ...d.due } }]),
  )
  const roots: TreeNode[] = []
  for (const node of nodes.values()) {
    const parent = node.parentId ? nodes.get(node.parentId) : undefined
    if (parent) parent.children.push(node)
    else roots.push(node)
  }
  const sort = (list: TreeNode[]) => list.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
  const finish = (list: TreeNode[], depth: number) => {
    sort(list)
    for (const node of list) {
      node.depth = depth
      finish(node.children, depth + 1)
      for (const child of node.children) {
        node.totalCards += child.totalCards
        node.totalDue.new += child.totalDue.new
        node.totalDue.learning += child.totalDue.learning
        node.totalDue.review += child.totalDue.review
      }
    }
  }
  finish(roots, 0)
  return roots
}

/** Depth-first list, optionally skipping collapsed branches. */
export function flatten(tree: TreeNode[], collapsed: string[] = []): TreeNode[] {
  const out: TreeNode[] = []
  const walk = (list: TreeNode[]) => {
    for (const node of list) {
      out.push(node)
      if (!collapsed.includes(node.id)) walk(node.children)
    }
  }
  walk(tree)
  return out
}

/** A deck and all its subdecks. */
export function descendantIds(decks: DeckNode[], id: string): string[] {
  const out = [id]
  for (let i = 0; i < out.length; i++) for (const d of decks) if (d.parentId === out[i]) out.push(d.id)
  return out
}

/** Saves text as a file through a temporary link. */
export function downloadText(filename: string, content: string, type = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Revoking right away can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 1_000)
}

/** Readable message for an API failure surfaced through a server function. */
export function errorMessage(error: unknown, fallback = 'Something went wrong. Try again.'): string {
  // apiFetch errors end with the API's status code ("… failed with 409").
  const text = error instanceof Error ? error.message : String(error)
  if (text.includes('409')) return 'A deck with that name already exists there.'
  if (text.includes('400')) return 'That isn’t allowed (a deck can’t move into itself).'
  if (text.includes('404')) return 'That item no longer exists. Refresh and try again.'
  if (text.includes('413')) return 'That file is too large to send at once.'
  return fallback
}

/**
 * Per-browser view preferences (columns, density…). Read after mount so server
 * and client render the same first frame.
 */
export function usePrefs<T extends object>(key: string, defaults: T): [T, (patch: Partial<T>) => void] {
  const [value, setValue] = useState(defaults)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw) setValue((v) => ({ ...v, ...JSON.parse(raw) }))
    } catch {
      // Storage unavailable or corrupt: keep defaults.
    }
  }, [key])
  const update = useCallback(
    (patch: Partial<T>) =>
      setValue((v) => {
        const next = { ...v, ...patch }
        try {
          localStorage.setItem(key, JSON.stringify(next))
        } catch {
          // Not persisted; still applies for this visit.
        }
        return next
      }),
    [key],
  )
  return [value, update]
}

/** Current time, but only after hydration (relative dates differ between server and client). */
export function useNow(intervalMs = 30_000): number | null {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    setNow(Date.now())
    const timer = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])
  return now
}

/** "in 3d", "2h ago" or "now". */
export function relativeDue(dueIso: string, now: number): string {
  const diff = Date.parse(dueIso) - now
  const abs = Math.abs(diff)
  const minutes = Math.round(abs / 60_000)
  const hours = Math.round(abs / 3_600_000)
  const days = Math.round(abs / 86_400_000)
  const span =
    minutes < 60 ? `${Math.max(1, minutes)}m` : hours < 36 ? `${hours}h` : days < 60 ? `${days}d` : `${Math.round(days / 30)}mo`
  if (diff <= 0) return minutes < 1 ? 'now' : `${span} ago`
  return `in ${span}`
}
