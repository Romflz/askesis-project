import { CHEST_TIERS, CHEST_WEEK, type ChestTier } from '@askesis/core'
import clsx from 'clsx'
import { Check, Clock, Gift, Snowflake } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { ChestCeremony, type ChestReveal } from './Celebrations.tsx'
import { useSession } from './session.tsx'
import { CoinCount, PanelHeader } from './ui.tsx'

const TIER_NAME: Record<ChestTier, string> = { bronze: 'Bronze', silver: 'Silver', gold: 'Gold', diamond: 'Diamond' }

/** The chest (art from Spellwizard); it shakes now and then until it's opened (see _chest.scss). */
function ChestArt({ open }: { open: boolean }) {
  const reduceMotion = useReducedMotion()
  return (
    <span className={clsx('chest-art', open && 'is-open')} aria-hidden>
      <motion.span
        className="chest-art__glow"
        initial={false}
        animate={{ opacity: open ? 1 : 0.35, scale: open ? 1.15 : 0.85 }}
        transition={{ duration: reduceMotion ? 0 : 0.5 }}
      />
      <img src="/images/chest.png" alt="" width={96} height={96} draggable={false} decoding="async" className="chest-art__img" />
    </span>
  )
}

/** Seven slots for the current run of daily chests; the last one is the weekly chest. */
function ChestWeek({ day, opened }: { day: number; opened: boolean }) {
  return (
    <ol className="chest-week" aria-label={`Day ${day} of ${CHEST_WEEK} in a row`}>
      {Array.from({ length: CHEST_WEEK }, (_, i) => {
        const slot = i + 1
        const done = slot < day || (slot === day && opened)
        const today = slot === day && !opened
        return (
          <li
            key={slot}
            className={clsx('chest-week__slot', done && 'is-done', today && 'is-today', slot === CHEST_WEEK && 'is-weekly')}
          >
            {done ? <Check size={12} strokeWidth={3} /> : slot === CHEST_WEEK ? <Gift size={12} /> : slot}
            <span className="sr-only">{done ? ' opened' : today ? ' today' : ' to come'}</span>
          </li>
        )
      })}
    </ol>
  )
}

/**
 * Today's chest: one per study day, better with a longer streak, and every
 * seventh day in a row a weekly chest (double rewards, plus a streak freeze).
 */
export function ChestCard() {
  const { data, openChest, setOverlay, guest, promptLogin } = useSession()
  // null: no ceremony. `result: null`: the chest rattles while the reward is on its way.
  const [ceremony, setCeremony] = useState<{ result: ChestReveal | null } | null>(null)
  const { chest, coins, streak } = data
  const opened = chest.opened
  // Both values come from the server snapshot, so this renders the same on both sides.
  const resetsIn = Math.max(1, Math.ceil((Date.parse(data.dayEnd) - Date.parse(data.now)) / 3_600_000))
  const tier = CHEST_TIERS.find((t) => t.tier === chest.tier)!
  const double = chest.weekly ? 2 : 1

  async function open() {
    if (guest) {
      promptLogin({
        title: 'Log in to open your daily chest',
        text: 'Chests, coins and your streak are saved to your account. Log in, or create a free account to start collecting.',
      })
      return
    }
    // Holds back the level-up overlay until the ceremony closes.
    setOverlay(true)
    setCeremony({ result: null })
    const result = await openChest()
    if (result) setCeremony({ result })
    else close()
  }

  function close() {
    setCeremony(null)
    setOverlay(false)
  }

  return (
    <section
      className={clsx('panel chest', `chest--${chest.tier}`, chest.weekly && 'chest--weekly')}
      aria-labelledby="chest-title"
    >
      <PanelHeader
        eyebrow="Daily chest"
        title={
          <span id="chest-title">
            {opened ? 'Opened today' : chest.weekly ? 'Weekly chest ready' : `${TIER_NAME[chest.tier]} chest ready`}
          </span>
        }
        aside={<CoinCount value={coins} />}
      />

      <div className="chest__stage">
        <div className="chest__art">
          <ChestArt open={!!opened} />
        </div>
        <div className="chest__text">
          {opened ? (
            <p className="chest__result">
              Today’s chest gave <strong>+{opened.xp} XP</strong> and <strong>+{opened.coins} coins</strong>.
            </p>
          ) : (
            <p className="chest__lead">
              {chest.weekly && <strong>Day 7: double rewards and a streak freeze. </strong>}
              {tier.xp[0] * double}–{tier.xp[1] * double} XP and {tier.coins[0] * double}–{tier.coins[1] * double} coins inside.
            </p>
          )}
          {/* Opened, a disabled button keeps the same spot, so the card never changes height. */}
          {opened ? (
            <button type="button" className="btn btn--ghost btn--sm chest__open" disabled>
              <Clock size={15} /> Next chest in {resetsIn}h
            </button>
          ) : (
            <button type="button" className="btn btn--primary btn--sm chest__open" onClick={open} disabled={!!ceremony}>
              <Gift size={15} /> Open chest
            </button>
          )}
        </div>
      </div>

      <div className="chest__week">
        <ChestWeek day={chest.day} opened={!!opened} />
        <p className="chest__next">
          {chest.weekly && !opened ? (
            <>
              <Snowflake size={12} aria-hidden /> Today’s chest banks a streak freeze ({streak.freezes} of {streak.maxFreezes}).
            </>
          ) : (
            `Open a chest ${CHEST_WEEK} days in a row for a weekly chest.`
          )}
          {chest.next && ` ${TIER_NAME[chest.next.tier]} chests from a ${chest.next.streak}-day streak.`}
        </p>
      </div>

      <AnimatePresence>
        {ceremony && <ChestCeremony key="ceremony" tier={chest.tier} result={ceremony.result} onDone={close} />}
      </AnimatePresence>
    </section>
  )
}
