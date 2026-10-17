import { createFileRoute } from '@tanstack/react-router'
import { API_URL } from '../../../server/api.server.ts'

// Same-origin proxy to Better Auth on the Fastify API, so session cookies are
// first-party to the web app and the browser never needs the API's address.
async function proxy({ request }: { request: Request }) {
  const incoming = new URL(request.url)
  const headers = new Headers(request.headers)
  // The API (Fastify with trustProxy) rebuilds the URL the browser used from these.
  headers.delete('host')
  headers.set('x-forwarded-host', incoming.host)
  headers.set('x-forwarded-proto', incoming.protocol.slice(0, -1))

  const res = await fetch(new URL(incoming.pathname + incoming.search, API_URL), {
    method: request.method,
    headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
    // Required by Node's fetch to stream a request body.
    duplex: 'half',
    // OAuth redirects go back to the browser instead of being followed here.
    redirect: 'manual',
  } as RequestInit)

  // fetch has already decoded the body, so the upstream encoding and length no longer apply.
  const out = new Headers(res.headers)
  out.delete('content-encoding')
  out.delete('content-length')
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: out })
}

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: { GET: proxy, POST: proxy },
  },
})
