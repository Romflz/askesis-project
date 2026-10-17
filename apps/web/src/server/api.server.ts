import { notFound, redirect } from '@tanstack/react-router'
import { getRequestHeader } from '@tanstack/react-start/server'

// Server-only (enforced by the .server.ts suffix): the API location and the
// forwarded session cookie never reach the client bundle.

export const API_URL = process.env.API_URL ?? 'http://127.0.0.1:4000'

/**
 * Calls the API as the current user by forwarding the incoming request's cookies.
 * A 401 (session gone) redirects to /login and a 404 becomes the router's
 * not-found page, so loaders and server functions don't handle either themselves.
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  const cookie = getRequestHeader('cookie')
  if (cookie) headers.set('cookie', cookie)
  if (init.body) headers.set('content-type', 'application/json')

  const res = await fetch(new URL(path, API_URL), { ...init, headers })
  if (res.status === 401) throw redirect({ to: '/login' })
  if (res.status === 404) throw notFound()
  if (!res.ok) throw new Error(`API ${init.method ?? 'GET'} ${path} failed with ${res.status}`)
  return (await res.json()) as T
}
