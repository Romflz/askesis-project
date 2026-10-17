import { PUBLIC_CATEGORIES, PUBLIC_DECKS } from '@askesis/core'
import { DOCS } from '../components/docs/pages.tsx'
import { absoluteUrl } from './seo.ts'

// The sitemap: public, indexable pages only. Served live at /sitemap.xml and
// written to a file by scripts/generate-sitemap.mjs, both from this list, so new
// decks, topics and docs show up without touching either.

export interface SitemapEntry {
  path: string
  priority: number
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly'
}

export function sitemapEntries(): SitemapEntry[] {
  return [
    { path: '/', priority: 1, changefreq: 'weekly' },
    { path: '/practice', priority: 0.9, changefreq: 'weekly' },
    ...PUBLIC_CATEGORIES.map((c) => ({ path: `/learn/${c.slug}`, priority: 0.8, changefreq: 'monthly' as const })),
    ...PUBLIC_DECKS.map((d) => ({ path: `/practice/${d.slug}`, priority: 0.8, changefreq: 'monthly' as const })),
    { path: '/analytics', priority: 0.6, changefreq: 'monthly' },
    { path: '/docs', priority: 0.6, changefreq: 'monthly' },
    ...DOCS.map((d) => ({ path: `/docs/${d.slug}`, priority: 0.5, changefreq: 'monthly' as const })),
    { path: '/about', priority: 0.5, changefreq: 'yearly' },
    { path: '/contact', priority: 0.4, changefreq: 'yearly' },
    { path: '/terms', priority: 0.2, changefreq: 'yearly' },
    { path: '/privacy', priority: 0.2, changefreq: 'yearly' },
    { path: '/cookies', priority: 0.2, changefreq: 'yearly' },
    { path: '/register', priority: 0.4, changefreq: 'yearly' },
  ]
}

const escapeXml = (s: string) =>
  s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!)

/** Content is static, so the build (or generation) date is a fair lastmod. */
export function sitemapXml(entries = sitemapEntries(), lastmod = new Date().toISOString().slice(0, 10)): string {
  const urls = entries
    .map(
      (e) =>
        `  <url>\n    <loc>${escapeXml(absoluteUrl(e.path))}</loc>\n    <lastmod>${lastmod}</lastmod>\n` +
        `    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority.toFixed(1)}</priority>\n  </url>`,
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}
