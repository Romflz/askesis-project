import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { UsernamePrompt } from '../components/auth/UsernamePrompt.tsx'

// Pathless layout guarding everything under it. Runs on the server for the
// first request, so anonymous users get a redirect before any HTML renders.
export const Route = createFileRoute('/_authed')({
  beforeLoad: ({ context, location }) => {
    if (!context.user) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
    return { user: context.user }
  },
  // Private pages stay out of search results.
  head: () => ({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] }),
  component: AuthedLayout,
})

function AuthedLayout() {
  const { user } = Route.useRouteContext()
  return (
    <>
      <Outlet />
      {/* Accounts created before usernames existed pick one once. */}
      {!user.username && <UsernamePrompt />}
    </>
  )
}
