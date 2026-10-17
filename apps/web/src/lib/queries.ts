import type { AnalyticsQuery, CardListQuery, StudyInput } from '@askesis/contracts'
import { type QueryClient, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { notFound } from '@tanstack/react-router'
import { getDemoAnalytics, getMyAnalytics } from '../server/analytics.functions.ts'
import { getDemoDashboard } from '../server/dashboard.functions.ts'
import { getMyDashboard, getPushStatus, getSettings } from '../server/askesis.functions.ts'
import { getLibrary, listCards } from '../server/library.functions.ts'
import { getCategoryPage, getDeckPage, getPracticeIndex } from '../server/practice.functions.ts'
import { getStudyQueue, previewStudy } from '../server/study.functions.ts'

// Server data goes through TanStack Query. Route loaders fill the cache (on the
// server for the first request, so pages arrive rendered), components read it
// with useSuspenseQuery, and writes go through useUserDataMutation.
//
// Everything derived from the signed-in user's data lives under ['me'], so one
// invalidation after a write refetches what's on screen and marks the rest stale.
// Public pages only change with a deploy, so they never go stale.

const ME = ['me'] as const

/** Refetch on focus or reconnect only after an hour away (a new study day, say), not after a quick tab switch. */
const afterAnHour = (query: { state: { dataUpdatedAt: number } }) => Date.now() - query.state.dataUpdatedAt > 60 * 60_000

export const queries = {
  // The dashboard runs its own session state on top of the snapshot and remounts
  // on a new one, so it isn't refetched underneath a review: route loads use
  // fetchQuery, which waits for fresh data when this is stale.
  dashboard: () =>
    queryOptions({
      queryKey: [...ME, 'dashboard'],
      queryFn: () => getMyDashboard(),
      refetchOnMount: false,
      refetchOnWindowFocus: afterAnHour,
      refetchOnReconnect: afterAnHour,
    }),
  library: () => queryOptions({ queryKey: [...ME, 'library'], queryFn: () => getLibrary() }),
  cards: (query: Partial<CardListQuery>) =>
    queryOptions({ queryKey: [...ME, 'cards', query], queryFn: () => listCards({ data: query }) }),
  settings: () => queryOptions({ queryKey: [...ME, 'settings'], queryFn: () => getSettings() }),
  pushStatus: () => queryOptions({ queryKey: [...ME, 'push'], queryFn: () => getPushStatus() }),
  /** The signed-in user's analytics for a range and deck; null is the sample learner visitors see. */
  analytics: (query: AnalyticsQuery | null) =>
    queryOptions({
      queryKey: query ? [...ME, 'analytics', query] : ['demo', 'analytics'],
      queryFn: () => (query ? getMyAnalytics({ data: query }) : getDemoAnalytics()),
      ...(!query && { staleTime: Infinity }),
    }),
  studyPreview: (input: StudyInput) =>
    queryOptions({ queryKey: [...ME, 'study-preview', input], queryFn: () => previewStudy({ data: input }) }),
  // Outside ['me'] on purpose: a session keeps its own state from the queue it
  // started with, so writes never refetch it. The route loader fetches a new
  // queue for every visit instead.
  studyQueue: (input: StudyInput) =>
    queryOptions({ queryKey: ['study-queue', input], queryFn: () => getStudyQueue({ data: input }), staleTime: Infinity }),

  demoDashboard: () => queryOptions({ queryKey: ['demo', 'dashboard'], queryFn: () => getDemoDashboard(), staleTime: Infinity }),
  practiceIndex: () => queryOptions({ queryKey: ['practice', 'index'], queryFn: () => getPracticeIndex(), staleTime: Infinity }),
  practiceDeck: (slug: string) =>
    queryOptions({
      queryKey: ['practice', 'deck', slug],
      queryFn: async () => (await getDeckPage({ data: slug })) ?? notFoundPage(),
      staleTime: Infinity,
    }),
  topic: (slug: string) =>
    queryOptions({
      queryKey: ['practice', 'topic', slug],
      queryFn: async () => (await getCategoryPage({ data: slug })) ?? notFoundPage(),
      staleTime: Infinity,
    }),
}

/** Drops everything cached for the signed-in user, so nothing from one account can show in the next. */
export function clearUserData(queryClient: QueryClient) {
  queryClient.removeQueries({ queryKey: ME })
  queryClient.removeQueries({ queryKey: ['study-queue'] })
}

// Unknown slugs become the router's 404 page (a real 404 status on the server).
function notFoundPage(): never {
  throw notFound()
}

/**
 * useMutation for writes to the signed-in user's data. Afterwards everything
 * under ['me'] is invalidated, and the mutation settles once the queries on
 * screen have refetched; `onSuccess` runs before that. `refetch: false` only
 * marks them stale, for screens that keep their own state on top of a snapshot
 * (the dashboard, a study session).
 */
export function useUserDataMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: { refetch?: boolean; onSuccess?: (data: TData, variables: TVariables) => unknown } = {},
) {
  const queryClient = useQueryClient()
  const { refetch = true, onSuccess } = options
  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => onSuccess?.(data, variables),
    // After failures too: an import that stopped halfway has still saved its first batches.
    onSettled: () => queryClient.invalidateQueries({ queryKey: ME, refetchType: refetch ? 'active' : 'none' }),
  })
}
