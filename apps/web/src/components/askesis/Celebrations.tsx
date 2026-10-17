import { type ChestTier, RANKS } from '@askesis/core'
import confetti from 'canvas-confetti'
import { Coins, Snowflake, Sparkles, TrendingUp } from 'lucide-react'
import { animate, AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { fmtInt } from '../../lib/format.ts'
import { sfx } from '../../lib/sfx.ts'

// Full-screen moments for the big rewards: a level-up and opening the daily
// chest. Both are short, skippable (click, Esc or the button) and calm down
// under prefers-reduced-motion.

/** Confetti colors. canvas-confetti draws on a canvas, so CSS variables can't be used. */
const BRAND = ['#c6f432', '#a397ff', '#ff8a3d', '#16a5a5', '#f5c542']

/** Counts from 0 to `value` once `run` turns true. */
function CountUp({ value, run, duration = 0.9 }: { value: number; run: boolean; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !run) return
    const controls = animate(0, value, { duration, ease: 'easeOut', onUpdate: (v) => (el.textContent = fmtInt(Math.round(v))) })
    return () => controls.stop()
  }, [value, run, duration])
  return <span ref={ref}>{run ? fmtInt(value) : '0'}</span>
}

/** Fixed sparkle spots around the badge, so every level-up looks the same. */
const SPARKLES = [
  [-118, -40, 0.9],
  [112, -62, 0.7],
  [-84, 70, 0.6],
  [96, 58, 0.85],
  [-30, -104, 0.55],
  [40, 98, 0.65],
  [-140, 22, 0.5],
  [146, 4, 0.6],
] as const

/** Esc closes the overlay. */
function useOverlayKeys(onKey: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onKey()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onKey])
}

/** Renders into <body>, after hydration, since there's no document on the server. */
function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted ? createPortal(children, document.body) : null
}

/**
 * Level up: the new level in a glowing badge, sparkles and a chord. `rankUp`
 * says the rank title changed too (ranks change every few levels).
 */
export function LevelUpOverlay({
  level,
  title,
  rankUp = false,
  onDone,
}: {
  level: number
  title: string
  rankUp?: boolean
  onDone: () => void
}) {
  const nextRank = RANKS.find((r) => r.level > level)
  const reduceMotion = useReducedMotion() ?? false
  useOverlayKeys(onDone)
  useEffect(() => {
    sfx.levelUp()
    if (!reduceMotion)
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.45 }, colors: BRAND, disableForReducedMotion: true })
    const auto = setTimeout(onDone, 6500)
    return () => clearTimeout(auto)
  }, [onDone, reduceMotion])

  return (
    <Portal>
      <motion.div
        className="celebrate"
        role="dialog"
        aria-modal="true"
        aria-labelledby="levelup-title"
        onClick={(e) => e.target === e.currentTarget && onDone()}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="celebrate__card"
          initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        >
          <p className="celebrate__kicker">
            <TrendingUp size={14} /> Level up
          </p>
          <div className="celebrate__stage">
            <span className="celebrate__rays" aria-hidden />
            {!reduceMotion &&
              SPARKLES.map(([x, y, s], i) => (
                <motion.span
                  key={i}
                  className="celebrate__sparkle"
                  aria-hidden
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], x, y, scale: s }}
                  transition={{ duration: 1.4, delay: 0.15 + i * 0.05, ease: 'easeOut' }}
                >
                  <Sparkles size={18} />
                </motion.span>
              ))}
            <motion.span
              className="celebrate__badge"
              initial={reduceMotion ? false : { scale: 0.3, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 13, delay: 0.1 }}
            >
              {level}
            </motion.span>
          </div>
          <h2 id="levelup-title" className="celebrate__title">
            Level {level}
          </h2>
          <p className="celebrate__sub">
            {rankUp ? (
              <>
                New rank: you are now a <strong>{title}</strong>.
              </>
            ) : nextRank ? (
              <>
                {nextRank.level - level} {nextRank.level - level === 1 ? 'level' : 'levels'} to <strong>{nextRank.title}</strong>.
              </>
            ) : (
              <>
                The top rank: <strong>{title}</strong>.
              </>
            )}
          </p>
          <button type="button" className="btn btn--primary celebrate__button" onClick={onDone} autoFocus>
            Keep going
          </button>
        </motion.div>
      </motion.div>
    </Portal>
  )
}

export interface ChestReveal {
  xp: number
  coins: number
  weekly?: boolean
  freeze?: boolean
}

const TIER_NAME: Record<ChestTier, string> = { bronze: 'Bronze', silver: 'Silver', gold: 'Gold', diamond: 'Diamond' }
/** The rattle before the reveal: long enough to build anticipation, short enough not to annoy. */
const RATTLE_MS = 1200

/**
 * Opening the daily chest: it rattles while the reward is rolled, then bursts
 * open with the XP and coins counting up. `result` is null while the server
 * call is in flight.
 */
export function ChestCeremony({ tier, result, onDone }: { tier: ChestTier; result: ChestReveal | null; onDone: () => void }) {
  const reduceMotion = useReducedMotion() ?? false
  // With reduced motion there's no rattle: the reward shows as soon as it arrives.
  const [waited, setWaited] = useState(reduceMotion)
  const revealed = waited && result !== null
  useOverlayKeys(onDone)

  useEffect(() => {
    if (reduceMotion) return
    sfx.rattle()
    const t = setTimeout(() => setWaited(true), RATTLE_MS)
    return () => clearTimeout(t)
  }, [reduceMotion])

  useEffect(() => {
    if (!revealed) return
    sfx.chest()
    const coins = setTimeout(() => sfx.coins(), 350)
    if (!reduceMotion)
      confetti({
        particleCount: result.weekly ? 160 : 90,
        spread: 80,
        origin: { y: 0.45 },
        colors: BRAND,
        disableForReducedMotion: true,
      })
    const auto = setTimeout(onDone, 8000)
    return () => {
      clearTimeout(coins)
      clearTimeout(auto)
    }
  }, [revealed, result, reduceMotion, onDone])

  // A click skips the rattle; once revealed it closes.
  const skip = () => (revealed ? onDone() : setWaited(true))

  return (
    <Portal>
      <motion.div
        className={`celebrate celebrate--chest celebrate--${tier} ${revealed ? 'is-revealed' : 'is-waiting'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chest-ceremony-title"
        onClick={(e) => e.target === e.currentTarget && skip()}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="celebrate__card"
          initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        >
          <p className="celebrate__kicker">
            {revealed ? (result.weekly ? 'Weekly chest ×2' : `${TIER_NAME[tier]} chest`) : 'Opening…'}
          </p>
          <button
            type="button"
            className="celebrate__stage celebrate__chest"
            onClick={skip}
            aria-label={revealed ? 'Close' : 'Skip the animation'}
          >
            <span className="celebrate__rays" aria-hidden />
            <motion.img
              src="/images/chest.png"
              alt=""
              width={96}
              height={96}
              draggable={false}
              className="celebrate__chest-img"
              animate={
                reduceMotion
                  ? {}
                  : revealed
                    ? { rotate: 0, scale: 1.12, y: -8 }
                    : { rotate: [0, -7, 7, -6, 6, -4, 4, -2, 2, 0], y: [0, 0, -2, -2, -4, -4, -2, -2, 0, 0] }
              }
              transition={
                revealed ? { type: 'spring', stiffness: 300, damping: 13 } : { duration: RATTLE_MS / 1000, ease: 'easeInOut' }
              }
            />
          </button>
          <h2 id="chest-ceremony-title" className="celebrate__title celebrate__reward">
            <span>
              +<CountUp value={result?.xp ?? 0} run={revealed} /> XP
            </span>
            <span className="celebrate__coins">
              <Coins size={22} aria-hidden /> +<CountUp value={result?.coins ?? 0} run={revealed} />
              <span className="sr-only"> coins</span>
            </span>
          </h2>
          <AnimatePresence>
            {revealed && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                {result.freeze && (
                  <p className="celebrate__extra">
                    <Snowflake size={15} /> +1 streak freeze banked
                  </p>
                )}
                <p className="celebrate__sub">
                  {result.weekly ? 'Seven days in a row. A new run starts tomorrow.' : 'Come back tomorrow for the next one.'}
                </p>
                <button type="button" className="btn btn--primary celebrate__button" onClick={onDone} autoFocus>
                  Collect
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </Portal>
  )
}
