import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { DashboardView } from '../components/askesis/DashboardView.tsx'
import { GuestPerks } from '../components/askesis/GuestPerks.tsx'
import { SupportSection } from '../components/askesis/SupportSection.tsx'
import { queries } from '../lib/queries.ts'
import { absoluteUrl, jsonLd, ORGANIZATION, SITE_URL, seo } from '../lib/seo.ts'

const TITLE = 'Askesis · Spaced repetition that plays like a game'
const DESCRIPTION =
  'Free, open-source flashcards with SM-2 or FSRS scheduling, streaks, XP, quests and trophies. Practice languages, coding, IT, science and math in your browser.'

// Public home: the full dashboard on a simulated learner. Visitors can explore
// everything (nothing is saved; account-only actions open a login popup), and
// Quick study opens a free practice deck. Below: what an account adds and how to
// support the project.
// Signed-in users get their own dashboard at /dashboard.
export const Route = createFileRoute('/')({
  staticData: { ownChrome: true },
  loader: ({ context }) => context.queryClient.ensureQueryData(queries.demoDashboard()),
  head: () => {
    const { meta, links } = seo({ title: TITLE, description: DESCRIPTION, path: '/' })
    return {
      meta: [
        ...meta,
        jsonLd(
          {
            '@type': 'WebSite',
            '@id': `${SITE_URL}/#website`,
            name: 'Askesis',
            url: `${SITE_URL}/`,
            description: DESCRIPTION,
            inLanguage: 'en',
            publisher: { '@id': ORGANIZATION['@id'] },
          },
          ORGANIZATION,
          {
            '@type': 'SoftwareApplication',
            name: 'Askesis',
            url: `${SITE_URL}/`,
            description: DESCRIPTION,
            applicationCategory: 'EducationalApplication',
            operatingSystem: 'Web',
            image: absoluteUrl('/og.png'),
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            publisher: { '@id': ORGANIZATION['@id'] },
          },
        ),
      ],
      links,
    }
  },
  component: Home,
})

function Home() {
  const { data } = useSuspenseQuery(queries.demoDashboard())
  const { user } = Route.useRouteContext()
  return (
    <DashboardView data={data} user={user} guest={!user}>
      {!user && <GuestPerks />}
      <SupportSection level={user?.supportLevel} />
    </DashboardView>
  )
}
