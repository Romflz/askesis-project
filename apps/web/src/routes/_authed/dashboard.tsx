import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { DashboardView } from '../../components/askesis/DashboardView.tsx'
import { SupportSection } from '../../components/askesis/SupportSection.tsx'
import type { RewardApi } from '../../components/askesis/session.tsx'
import { queries, useUserDataMutation } from '../../lib/queries.ts'
import { claimQuest, openChest } from '../../server/askesis.functions.ts'

// The signed-in dashboard. Full SSR: the loader runs on the server with the
// session cookie, so the first paint already shows the user's numbers.
export const Route = createFileRoute('/_authed/dashboard')({
  staticData: { ownChrome: true },
  loader: ({ context }) => context.queryClient.fetchQuery(queries.dashboard()),
  head: () => ({ meta: [{ title: 'Dashboard · Askesis' }] }),
  component: Dashboard,
})

function Dashboard() {
  const { data } = useSuspenseQuery(queries.dashboard())
  const { user } = Route.useRouteContext()
  // The dashboard applies rewards to its own state, so they only mark the cached
  // pages stale (analytics, …) instead of refetching this one.
  const { mutateAsync: chest } = useUserDataMutation(openChest, { refetch: false })
  const { mutateAsync: quest } = useUserDataMutation(claimQuest, { refetch: false })
  const rewards = useMemo<RewardApi>(
    () => ({ openChest: () => chest(undefined), claimQuest: (id) => quest({ data: { id } }) }),
    [chest, quest],
  )
  // Remount on a new snapshot (e.g. after changing settings) so local session state resets.
  return (
    <DashboardView key={data.now} data={data} user={user} rewards={rewards}>
      <SupportSection level={user.supportLevel} />
    </DashboardView>
  )
}
