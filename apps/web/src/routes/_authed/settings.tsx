import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { AccountCard, DeckAssignments, SampleData } from '../../components/settings/DeckSettings.tsx'
import { NotificationsCard } from '../../components/settings/NotificationsCard.tsx'
import { PresetEditor } from '../../components/settings/PresetEditor.tsx'
import { StudySettings } from '../../components/settings/StudySettings.tsx'
import { queries } from '../../lib/queries.ts'

export const Route = createFileRoute('/_authed/settings')({
  loader: ({ context }) => context.queryClient.ensureQueryData(queries.settings()),
  head: () => ({ meta: [{ title: 'Settings · Askesis' }] }),
  component: Settings,
})

// In-page navigation; each id is the anchor on its card (/account redirects to #account).
const SECTIONS = [
  { id: 'study', label: 'Study' },
  { id: 'notifications', label: 'Reminders' },
  { id: 'presets', label: 'Deck presets' },
  { id: 'decks', label: 'Decks' },
  { id: 'sample', label: 'Sample data' },
  { id: 'account', label: 'Account' },
]

function Settings() {
  const {
    data: { settings, presets, decks },
  } = useSuspenseQuery(queries.settings())
  const { user } = Route.useRouteContext()
  const deckCount: Record<string, number> = {}
  for (const d of decks) deckCount[d.presetId] = (deckCount[d.presetId] ?? 0) + 1

  return (
    <main className="settings">
      <header className="settings__header">
        <p className="eyebrow">Settings</p>
        <h1 className="settings__title">Tune how Askesis schedules your cards</h1>
        <p className="settings__lead">
          Every scheduling option, from learning steps to ease, with a live preview of when cards come back.
        </p>
      </header>
      <div className="settings__layout">
        <nav className="settings__nav" aria-label="Settings sections">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`}>
              {s.label}
            </a>
          ))}
        </nav>
        <div className="settings__content">
          <StudySettings settings={settings} />
          <NotificationsCard settings={settings} />
          <PresetEditor presets={presets} deckCount={deckCount} />
          <DeckAssignments decks={decks} presets={presets} />
          <SampleData />
          <AccountCard user={user} />
        </div>
      </div>
    </main>
  )
}
