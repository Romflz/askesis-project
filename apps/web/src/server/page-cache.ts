import { createMiddleware } from '@tanstack/react-start'
import { createHash } from 'node:crypto'
import { brotliCompressSync, constants, gzipSync } from 'node:zlib'
import { hasSessionCookie } from './session-cookie.ts'

// Guest page cache: the public pages render the same HTML for every visitor who
// isn't signed in, so the first guest request renders them and later ones are
// served from memory, pre-compressed, with an ETag for cheap revalidation.
//
// Why not static prerendering: the root route renders the signed-in top bar
// from the session, and a prerendered file would show the guest bar to
// signed-in users. Requests with a session cookie always render fresh.
//
// Docs, practice, topic, about, contact and legal pages only change with a
// deploy (which empties the cache); the home page's and the analytics page's demos are built from the
// current time, so they're kept for a minute.

const PAGES: { match: RegExp; ttlMs: number }[] = [
  { match: /^\/(analytics)?$/, ttlMs: 60_000 },
  { match: /^\/(docs|practice)(\/[\w-]+)?$/, ttlMs: 60 * 60_000 },
  { match: /^\/learn\/[\w-]+$/, ttlMs: 60 * 60_000 },
  { match: /^\/(about|contact|terms|privacy|cookies)$/, ttlMs: 60 * 60_000 },
]

interface Entry {
  expires: number
  etag: string
  headers: [string, string][]
  body: { identity: Uint8Array<ArrayBuffer>; br: Uint8Array<ArrayBuffer>; gzip: Uint8Array<ArrayBuffer> }
}

const cache = new Map<string, Entry>()

export const guestPageCache = createMiddleware({ type: 'request' }).server(async ({ request, next }) => {
  if (import.meta.env.DEV || request.method !== 'GET') return next()
  const url = new URL(request.url)
  const page = url.search ? undefined : PAGES.find((p) => p.match.test(url.pathname))
  if (!page || hasSessionCookie(request.headers.get('cookie'))) return next()

  const key = url.pathname
  let entry = cache.get(key)
  if (!entry || entry.expires < Date.now()) {
    const result = await next()
    const res = result.response
    if (res.status !== 200 || !res.headers.get('content-type')?.includes('text/html') || res.headers.has('set-cookie')) {
      return result
    }
    entry = store(key, new Uint8Array(await res.arrayBuffer()), res.headers, page.ttlMs)
  }
  return respond(entry, request)
})

function store(key: string, html: Uint8Array<ArrayBuffer>, from: Headers, ttlMs: number): Entry {
  const headers: [string, string][] = []
  // These depend on the encoding and the request, so respond() sets them each time.
  from.forEach((value, name) => {
    if (!['content-length', 'content-encoding', 'etag', 'vary', 'cache-control'].includes(name)) headers.push([name, value])
  })
  const entry: Entry = {
    expires: Date.now() + ttlMs,
    etag: `"${createHash('sha1').update(html).digest('base64url').slice(0, 20)}"`,
    headers,
    body: {
      identity: html,
      br: new Uint8Array(brotliCompressSync(html, { params: { [constants.BROTLI_PARAM_QUALITY]: 9 } })),
      gzip: new Uint8Array(gzipSync(html, { level: 9 })),
    },
  }
  cache.set(key, entry)
  return entry
}

function respond(entry: Entry, request: Request): Response {
  const headers = new Headers(entry.headers)
  headers.set('etag', entry.etag)
  // Same URL, different HTML once signed in: browsers may keep it but must
  // revalidate, and shared caches must not keep it at all.
  headers.set('cache-control', 'private, no-cache')
  headers.set('vary', 'Accept-Encoding, Cookie')
  if (request.headers.get('if-none-match') === entry.etag) return new Response(null, { status: 304, headers })

  const accepts = request.headers.get('accept-encoding') ?? ''
  const encoding = /\bbr\b/.test(accepts) ? 'br' : /\bgzip\b/.test(accepts) ? 'gzip' : 'identity'
  if (encoding !== 'identity') headers.set('content-encoding', encoding)
  return new Response(entry.body[encoding], { status: 200, headers })
}
