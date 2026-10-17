import { createFileRoute, notFound } from '@tanstack/react-router'
import { DocArticle } from '../../components/docs/DocsLayout.tsx'
import { findDoc } from '../../components/docs/pages.tsx'
import { absoluteUrl, breadcrumbs, jsonLd, ORGANIZATION, seo } from '../../lib/seo.ts'

// One static page per doc. Unknown slugs throw notFound in the loader, so a
// direct request gets a real 404. The loader imports pages.tsx lazily because
// loaders stay in the router's main chunk: a static import there would put every
// doc in every page's JavaScript. The component is code-split, so it can import
// pages.tsx statically.
export const Route = createFileRoute('/docs/$slug')({
  loader: async ({ params }) => {
    const docs = await import('../../components/docs/pages.tsx')
    const doc = docs.findDoc(params.slug)
    if (!doc) throw notFound()
    return { slug: doc.slug, title: doc.title, summary: doc.summary, section: doc.section, faq: doc.faq ?? [] }
  },
  head: ({ loaderData: doc }) => {
    if (!doc) return {}
    const path = `/docs/${doc.slug}`
    const { meta, links } = seo({ title: `${doc.title} · Askesis docs`, description: doc.summary, path, type: 'article' })
    return {
      meta: [
        ...meta,
        jsonLd(
          {
            '@type': 'TechArticle',
            headline: doc.title,
            description: doc.summary,
            url: absoluteUrl(path),
            articleSection: doc.section,
            publisher: { '@id': ORGANIZATION['@id'] },
          },
          ...(doc.faq.length
            ? [
                {
                  '@type': 'FAQPage',
                  mainEntity: doc.faq.map((f) => ({
                    '@type': 'Question',
                    name: f.q,
                    acceptedAnswer: { '@type': 'Answer', text: f.a },
                  })),
                },
              ]
            : []),
          breadcrumbs([
            { name: 'Askesis', path: '/' },
            { name: 'Docs', path: '/docs' },
            { name: doc.title, path },
          ]),
        ),
      ],
      links,
    }
  },
  component: DocPageRoute,
})

function DocPageRoute() {
  const { slug } = Route.useLoaderData()
  return <DocArticle doc={findDoc(slug)!} />
}
