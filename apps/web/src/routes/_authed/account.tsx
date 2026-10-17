import { createFileRoute, redirect } from '@tanstack/react-router'

// Account management lives in Settings; keep old links working.
export const Route = createFileRoute('/_authed/account')({
  beforeLoad: () => {
    throw redirect({ to: '/settings', hash: 'account' })
  },
})
