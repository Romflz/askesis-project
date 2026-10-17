import confetti from 'canvas-confetti'
import { CloudOff, Coins, PartyPopper, Sparkles, Trophy, X } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { sfx } from '../../lib/sfx.ts'
import { useSession, type SessionEvent } from './session.tsx'

/** Confetti colors. canvas-confetti draws on a canvas, so CSS variables can't be used. */
const BRAND = ['#c6f432', '#a397ff', '#ff8a3d', '#16a5a5']

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

type ToastEvent = Exclude<SessionEvent, { type: 'level' }>

function content(e: ToastEvent) {
  switch (e.type) {
    case 'claimed':
      return {
        icon: <Coins size={18} />,
        title: 'Reward claimed',
        detail: `${e.title} · +${e.xp} XP · +${plural(e.coins, 'coin')}`,
      }
    case 'bonus':
      return {
        icon: <Sparkles size={18} />,
        title: 'All quests done!',
        detail: `Bonus +${e.xp} XP · +${plural(e.coins, 'coin')}`,
      }
    case 'welcome':
      return {
        icon: <PartyPopper size={18} />,
        title: 'Welcome bonus',
        detail: `+${e.xp} XP and +${plural(e.coins, 'coin')} to get you started`,
      }
    case 'trophy':
      return { icon: <Trophy size={18} />, title: 'New trophy', detail: `${e.title} · ${e.tier}` }
    case 'error':
      return { icon: <CloudOff size={18} />, title: 'Not saved', detail: e.message }
  }
}

/** The sound for an event, if any (level-ups play their own with the overlay). */
function sound(e: ToastEvent) {
  if (e.type === 'claimed' || e.type === 'bonus' || e.type === 'welcome') sfx.coins()
  else if (e.type === 'trophy') sfx.quest()
}

/**
 * The toast stack for session events. Each toast closes itself after a few
 * seconds and can be dismissed by hand.
 */
export function Toasts() {
  const { events: all, dismiss } = useSession()
  // Level-ups get the full-screen moment instead (DashboardMoments).
  const events = all.filter((e): e is ToastEvent => e.type !== 'level')
  const reduceMotion = useReducedMotion()
  // `events` changes with every update; each toast plays its sound and confetti once.
  const celebrated = useRef(new Set<number>())

  useEffect(() => {
    for (const e of events) {
      if (celebrated.current.has(e.id)) continue
      celebrated.current.add(e.id)
      setTimeout(() => dismiss(e.id), 4000)
      sound(e)
      if (!reduceMotion && (e.type === 'bonus' || e.type === 'trophy')) {
        confetti({
          particleCount: 140,
          spread: 90,
          origin: { x: 0.5, y: 0.15 },
          colors: BRAND,
          disableForReducedMotion: true,
        })
      }
    }
  }, [events, dismiss, reduceMotion])

  return (
    <div className="toasts" role="status" aria-live="polite">
      <AnimatePresence initial={false}>
        {events.map((e) => {
          const c = content(e)
          return (
            <motion.div
              key={e.id}
              layout
              className={`toast toast--${e.type}`}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -16, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            >
              <span className="toast__icon">{c.icon}</span>
              <div className="toast__text">
                <p className="toast__title">{c.title}</p>
                <p className="toast__detail">{c.detail}</p>
              </div>
              <button type="button" className="toast__close" onClick={() => dismiss(e.id)} aria-label="Dismiss">
                <X size={14} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
