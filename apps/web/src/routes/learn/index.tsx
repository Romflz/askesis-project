import { createFileRoute, redirect } from '@tanstack/react-router'

// Topic hubs live at /learn/<topic>; the bare path goes to the deck catalog.
export const Route = createFileRoute('/learn/')({
  beforeLoad: () => {
    throw redirect({ to: '/practice', statusCode: 301 })
  },
})
