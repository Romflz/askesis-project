import type { LibraryPayload } from '@askesis/contracts'

// Tags can be hierarchical ("lpic1::chapter::01-intro"). These
// helpers turn the flat list into a tree, rank search results and pick the most
// used tags, for the library sidebar and the study picker.

export const TAG_SEPARATOR = '::'

export interface TagNode {
  /** The full tag, e.g. "lpic1::chapter::01-intro". */
  path: string
  /** Its last level, e.g. "01-intro". */
  name: string
  /** Distinct cards with this tag or any tag below it. */
  cards: number
  /** Cards carry this exact tag (a parent level may exist only through its children). */
  real: boolean
  depth: number
  children: TagNode[]
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

/**
 * Every tag on a card plus each of its parent levels, as a sorted tree. Counts
 * come from `tagLevels` (distinct cards at or below a level), falling back to
 * the tag's own count.
 */
export function buildTagTree(library: Pick<LibraryPayload, 'tags' | 'tagLevels'>): { roots: TagNode[]; all: TagNode[] } {
  const counts = new Map(library.tagLevels.map((t) => [t.tag, t.cards]))
  const nodes = new Map<string, TagNode>()
  const roots: TagNode[] = []
  const ensure = (path: string): TagNode => {
    const existing = nodes.get(path)
    if (existing) return existing
    const parts = path.split(TAG_SEPARATOR)
    const node: TagNode = {
      path,
      name: parts.at(-1) || path,
      cards: counts.get(path) ?? 0,
      real: false,
      depth: parts.length - 1,
      children: [],
    }
    nodes.set(path, node)
    if (parts.length > 1) ensure(parts.slice(0, -1).join(TAG_SEPARATOR)).children.push(node)
    else roots.push(node)
    return node
  }
  for (const t of library.tags) {
    const node = ensure(t.tag)
    node.real = true
    if (!counts.has(t.tag)) node.cards = t.cards
  }
  const sort = (list: TagNode[]) => {
    list.sort((a, b) => collator.compare(a.name, b.name))
    for (const n of list) sort(n.children)
  }
  sort(roots)
  return { roots, all: [...nodes.values()] }
}

/** Rows to show for a tree with some groups expanded. */
export function visibleTagRows(roots: TagNode[], open: ReadonlySet<string>): TagNode[] {
  const out: TagNode[] = []
  const walk = (list: TagNode[]) => {
    for (const n of list) {
      out.push(n)
      if (n.children.length && open.has(n.path)) walk(n.children)
    }
  }
  walk(roots)
  return out
}

/** Every parent level of a tag: "a::b::c" → ["a", "a::b"]. */
export function tagAncestors(tag: string): string[] {
  const parts = tag.split(TAG_SEPARATOR)
  return parts.slice(1).map((_, i) => parts.slice(0, i + 1).join(TAG_SEPARATOR))
}

/**
 * Tags matching a query, best first: an exact tag, then a level named exactly
 * like the query, then levels starting with it, then anything containing it.
 * Several words must all appear. Ties go to the tag on more cards.
 */
export function searchTags(all: TagNode[], query: string): TagNode[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (!words.length) return []
  const first = words[0]!
  const scored: { node: TagNode; score: number }[] = []
  for (const node of all) {
    const path = node.path.toLowerCase()
    if (!words.every((w) => path.includes(w))) continue
    const name = node.name.toLowerCase()
    const levels = path.split(TAG_SEPARATOR)
    const score =
      path === first ? 0 : name === first ? 1 : name.startsWith(first) ? 2 : levels.some((l) => l.startsWith(first)) ? 3 : 4
    scored.push({ node, score })
  }
  return scored
    .sort((a, b) => a.score - b.score || b.node.cards - a.node.cards || collator.compare(a.node.path, b.node.path))
    .map((s) => s.node)
}

/** The tags on the most cards (only tags actually written on cards). */
export function mostUsedTags(all: TagNode[], count: number): TagNode[] {
  return all
    .filter((n) => n.real)
    .sort((a, b) => b.cards - a.cards || collator.compare(a.path, b.path))
    .slice(0, count)
}
