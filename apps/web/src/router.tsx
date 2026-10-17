import { QueryClient } from '@tanstack/react-query'
import { createRouter, isNotFound, isRedirect } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { routeTree } from './routeTree.gen'

/** Called by TanStack Start: once per request on the server, once in the browser. */
export function getRouter() {
  // One client per request on the server, so cached data never crosses users.
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // A redirect to /login or a 404 won't change on a retry; send the user on straight away.
        retry: (failures, error) => failures < 2 && !isRedirect(error) && !isNotFound(error),
      },
    },
  })
  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // A new page starts at the top straight away, without a scroll animation.
    scrollRestorationBehavior: 'instant',
    defaultPreload: 'intent',
    defaultNotFoundComponent: () => (
      <main className="page">
        <h1>Not found</h1>
        <p>That page doesn’t exist.</p>
      </main>
    ),
  })
  // Sends the queries loaded during SSR along with the page, wraps the app in a
  // QueryClientProvider, and turns redirect() thrown by queries and mutations into navigation.
  setupRouterSsrQueryIntegration({ router, queryClient })
  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
