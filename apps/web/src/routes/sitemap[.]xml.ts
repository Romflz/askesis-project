import { createFileRoute } from '@tanstack/react-router'
import { sitemapXml } from '../lib/sitemap.ts'

// Built once per server start: the page list only changes with a deploy.
const XML = sitemapXml()

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: () =>
        new Response(XML, {
          headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' },
        }),
    },
  },
})
