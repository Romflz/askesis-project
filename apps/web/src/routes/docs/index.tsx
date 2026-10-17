import { createFileRoute } from '@tanstack/react-router'
import { DocsHome } from '../../components/docs/DocsLayout.tsx'
import { absoluteUrl, breadcrumbs, jsonLd, ORGANIZATION, seo } from '../../lib/seo.ts'

const DOCS_TITLE = 'Docs · Askesis'
const DOCS_DESCRIPTION = 'How Askesis works: studying, scheduling, decks, import and export, and more.'

// The docs home: a card per page, from components/docs/pages.tsx. Full SSR.
export const Route = createFileRoute('/docs/')({
  head: () => {
    const { meta, links } = seo({ title: DOCS_TITLE, description: DOCS_DESCRIPTION, path: '/docs' })
    return {
      meta: [
        ...meta,
        jsonLd(
          {
            '@type': 'TechArticle',
            headline: 'Askesis documentation',
            description: DOCS_DESCRIPTION,
            url: absoluteUrl('/docs'),
            publisher: { '@id': ORGANIZATION['@id'] },
          },
          breadcrumbs([
            { name: 'Askesis', path: '/' },
            { name: 'Docs', path: '/docs' },
          ]),
        ),
      ],
      links,
    }
  },
  component: DocsHome,
})
