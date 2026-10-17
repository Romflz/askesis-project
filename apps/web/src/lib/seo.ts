// Head tags for public pages: title, description, canonical URL, Open Graph,
// Twitter cards and JSON-LD. Private pages are noindex (see routes/_authed.tsx).

import { GITHUB_URL } from './links.ts'

export type LdJson = string | number | boolean | null | LdJson[] | { [key: string]: LdJson }

/** Public origin for absolute URLs (canonical, og:url, sitemap). Same on server and client. */
export const SITE_URL = ((import.meta.env.VITE_SITE_URL as string | undefined) || 'http://localhost:3000').replace(/\/+$/, '')
export const SITE_NAME = 'Askesis'
export const DEFAULT_IMAGE = '/og.png'

export const absoluteUrl = (path: string) => new URL(path, `${SITE_URL}/`).toString()

/** Meta tags and the canonical link for a public page, for a route's head(). */
export function seo({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  type = 'website',
  noindex = false,
}: {
  title: string
  description: string
  path: string
  image?: string
  type?: 'website' | 'article'
  noindex?: boolean
}) {
  const url = absoluteUrl(path)
  const img = absoluteUrl(image)
  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:type', content: type },
      { property: 'og:image', content: img },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:site_name', content: SITE_NAME },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: img },
      ...(noindex ? [{ name: 'robots', content: 'noindex' }] : []),
    ],
    links: [{ rel: 'canonical', href: url }],
  }
}

type MetaTag = React.JSX.IntrinsicElements['meta']

/**
 * A JSON-LD script tag. TanStack's <HeadContent/> renders `script:ld+json` meta
 * entries as <script type="application/ld+json"> (HTML-escaped), but
 * @tanstack/react-router types `meta` as plain <meta> props, hence the cast.
 */
export function jsonLd(...graph: { [key: string]: LdJson }[]): MetaTag {
  return { 'script:ld+json': { '@context': 'https://schema.org', '@graph': graph } } as unknown as MetaTag
}

/** The publisher in every page's JSON-LD. The home page includes the full node; other pages refer to its @id. */
export const ORGANIZATION = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  logo: absoluteUrl('/icons/icon-512.png'),
  sameAs: [GITHUB_URL],
}

/** BreadcrumbList structured data; `items` run from the home page to the current one. */
export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}
