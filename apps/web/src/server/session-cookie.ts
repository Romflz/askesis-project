// Better Auth's session cookie ("__Secure-" prefixed when served over HTTPS).
// Without it a request can't be signed in, so it's a guest: no session lookup,
// and public pages can come from the guest page cache (server/page-cache.ts).

const SESSION_COOKIE = /(?:^|;\s*)(?:__Secure-)?better-auth\.session_token=/

export function hasSessionCookie(cookie: string | null | undefined): cookie is string {
  return !!cookie && SESSION_COOKIE.test(cookie)
}
