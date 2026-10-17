import { createFileRoute } from '@tanstack/react-router'
import { absoluteUrl } from '../lib/seo.ts'

// Crawl the public site; keep private app pages and the API out.
const ROBOTS = `User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /settings
Disallow: /decks
Disallow: /study
Disallow: /account
Disallow: /api/

Sitemap: ${absoluteUrl('/sitemap.xml')}
`

export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: () =>
        new Response(ROBOTS, {
          headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=86400' },
        }),
    },
  },
})
