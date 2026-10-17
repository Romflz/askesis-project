import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { HowStudyWorks } from '../../../components/study/HowStudyWorks.tsx'
import { StudyPicker } from '../../../components/study/StudyPicker.tsx'
import { queries } from '../../../lib/queries.ts'

// Session builder: pick decks, then today's cards or a custom study (mode, tags, count, order).
export const Route = createFileRoute('/_authed/study/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(queries.library()),
  head: () => ({ meta: [{ title: 'Study · Askesis' }] }),
  component: Study,
})

function Study() {
  const { data: library } = useSuspenseQuery(queries.library())
  return (
    <main className="study-page">
      <header className="study-page__header">
        <p className="eyebrow">Study</p>
        <h1 className="study-page__title">Build your session</h1>
        <p className="study-page__lead">
          Choose decks and subdecks, then study today’s cards, which follow each deck’s preset. Custom study adds new cards,
          reviews ahead, revisits forgotten cards or crams, and can narrow the session down by tags.
        </p>
      </header>
      <StudyPicker library={library} />
      <HowStudyWorks />
    </main>
  )
}
