import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, type SearchSchemaInput, stripSearchParams } from '@tanstack/react-router'
import { useCallback } from 'react'
import type { BrowserSearch, CardFilter, CardSort } from '../../components/decks/CardBrowser.tsx'
import { DecksManager } from '../../components/decks/DecksManager.tsx'
import { int, oneOf, str, uuid } from '../../lib/search-params.ts'
import { queries } from '../../lib/queries.ts'

// Every card filter (a Record, so a filter added to the contracts can't be missed).
const FILTERS = Object.keys({
  all: 1,
  new: 1,
  learning: 1,
  review: 1,
  due: 1,
  suspended: 1,
  leech: 1,
} satisfies Record<CardFilter, 1>) as CardFilter[]
const SORTS: CardSort[] = ['created', 'due', 'front', 'lapses']

const DEFAULTS = { q: '', filter: 'all', sort: 'created', page: 1, size: 50 } as const

// The browser state (deck, search, filters, page) lives in the URL, so views
// can be bookmarked and the back button works. Bad values fall back to defaults.
function parseSearch(search: Partial<BrowserSearch> & SearchSchemaInput): BrowserSearch {
  return {
    deck: uuid(search.deck),
    q: str(search.q, 200) ?? DEFAULTS.q,
    tag: str(search.tag, 200),
    filter: oneOf(search.filter, FILTERS) ?? DEFAULTS.filter,
    sort: oneOf(search.sort, SORTS) ?? DEFAULTS.sort,
    page: int(search.page, 1, Number.MAX_SAFE_INTEGER) ?? DEFAULTS.page,
    size: int(search.size, 10, 200) ?? DEFAULTS.size,
  }
}

export const Route = createFileRoute('/_authed/decks')({
  validateSearch: parseSearch,
  search: { middlewares: [stripSearchParams(DEFAULTS)] },
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    Promise.all([
      context.queryClient.ensureQueryData(queries.library()),
      context.queryClient.ensureQueryData(queries.cards(cardQuery(deps))),
    ]),
  head: () => ({ meta: [{ title: 'Decks · Askesis' }] }),
  component: Decks,
})

function cardQuery(search: BrowserSearch) {
  const { deck, q, tag, filter, sort, page, size } = search
  return { deckId: deck, q, tag, filter, sort, page, pageSize: size }
}

function Decks() {
  const search = Route.useSearch()
  const { data: library } = useSuspenseQuery(queries.library())
  const { data: cards } = useSuspenseQuery(queries.cards(cardQuery(search)))
  const navigate = Route.useNavigate()
  const setSearch = useCallback(
    (patch: Partial<BrowserSearch>) => void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true }),
    [navigate],
  )
  return <DecksManager library={library} cards={cards} search={search} setSearch={setSearch} />
}
