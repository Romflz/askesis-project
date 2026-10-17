import { type SessionUser, toSupportLevel } from '@askesis/contracts'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import { API_URL } from './api.server.ts'
import { hasSessionCookie } from './session-cookie.ts'

/**
 * The signed-in user, or null for guests. Runs in the root route's beforeLoad, so
 * every page knows who is signed in; it asks Better Auth on the API directly.
 */
export const getSessionUser = createServerFn({ method: 'GET' }).handler(async (): Promise<SessionUser | null> => {
  const cookie = getRequestHeader('cookie')
  // Guests (with only the time zone cookie, say) never cost an API round trip.
  if (!hasSessionCookie(cookie)) return null
  const res = await fetch(new URL('/api/auth/get-session', API_URL), { headers: { cookie } })
  if (!res.ok) return null
  const session = (await res.json()) as {
    user: {
      id: string
      name: string
      email: string
      username?: string | null
      displayUsername?: string | null
      supportLevel?: number
    }
  } | null
  if (!session) return null
  const { id, name, email, username, displayUsername, supportLevel } = session.user
  // displayUsername keeps the capitalization the user chose; username is stored lowercased.
  return { id, name, email, username: displayUsername || username || null, supportLevel: toSupportLevel(supportLevel) }
})
