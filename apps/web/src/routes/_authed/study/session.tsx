import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { StudySession } from '../../../components/study/StudySession.tsx'
import { studySearch, toStudyInput } from '../../../components/study/search.ts'
import { queries } from '../../../lib/queries.ts'

// The focused study screen. Full-screen (own chrome); the queue is built on the
// server from the URL, so a session can be bookmarked or linked from anywhere.
export const Route = createFileRoute('/_authed/study/session')({
  staticData: { ownChrome: true },
  validateSearch: studySearch,
  loaderDeps: ({ search }) => search,
  // Every visit gets a fresh queue; the cached one only serves this session.
  loader: ({ context, deps }) => context.queryClient.fetchQuery({ ...queries.studyQueue(toStudyInput(deps)), staleTime: 0 }),
  head: () => ({ meta: [{ title: 'Studying · Askesis' }] }),
  component: Session,
})

function Session() {
  const search = Route.useSearch()
  const { data: queue } = useSuspenseQuery(queries.studyQueue(toStudyInput(search)))
  // A new selection is a new session: remount so its state starts fresh.
  return <StudySession key={JSON.stringify(search)} queue={queue} search={search} />
}
