import { AnimatePresence } from 'motion/react'
import { useEffect, useRef } from 'react'
import { LevelUpOverlay } from './Celebrations.tsx'
import { type NewEvent, useSession } from './session.tsx'

const SEEN_TROPHIES = 'askesis-trophies-seen'
const SEEN_WELCOME = 'askesis-welcome-seen'

function readSet(key: string): Set<string> | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? new Set(JSON.parse(raw) as string[]) : null
  } catch {
    return null
  }
}

function writeSet(key: string, values: Iterable<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...values]))
  } catch {
    // Storage blocked: the notice may show again next visit, which is harmless.
  }
}

/**
 * The dashboard's one-off moments: the full-screen level-up (after any chest
 * ceremony), trophies earned since the last visit on this device, and the
 * new-account welcome bonus. The demo shows none of the remembered ones.
 */
export function DashboardMoments() {
  const { data, events, overlay, dismiss, notify } = useSession()
  // `data` changes with every answer; the news is only worked out once, on arrival.
  const announced = useRef(false)

  useEffect(() => {
    if (announced.current || data.isDemo) return
    announced.current = true
    const news: NewEvent[] = []

    if (data.welcome && !readSet(SEEN_WELCOME)) {
      news.push({ type: 'welcome', ...data.welcome })
      writeSet(SEEN_WELCOME, ['shown'])
    }

    // First visit on this device: only trophies earned today are news.
    const unlocked = data.achievements.filter((a) => a.unlockedAt)
    const seen = readSet(SEEN_TROPHIES) ?? new Set(unlocked.filter((a) => a.unlockedAt !== data.today).map((a) => a.id))
    const fresh = unlocked.filter((a) => !seen.has(a.id))
    // A few toasts at most, so a big import doesn't bury the page.
    for (const a of fresh.slice(0, 3)) news.push({ type: 'trophy', title: a.name, tier: a.tier })
    const unlockedIds = unlocked.map((a) => a.id)
    writeSet(SEEN_TROPHIES, unlockedIds)

    if (news.length) notify(...news)
  }, [data, notify])

  // The level-up waits until another full-screen moment (the chest) closes.
  const level = overlay ? undefined : events.find((e) => e.type === 'level')
  return (
    <AnimatePresence>
      {level?.type === 'level' && (
        <LevelUpOverlay
          key={level.id}
          level={level.level}
          title={level.title}
          rankUp={level.rankUp}
          onDone={() => dismiss(level.id)}
        />
      )}
    </AnimatePresence>
  )
}
