import { type QuestMetric } from '@askesis/core'
import clsx from 'clsx'
import {
  BadgeCheck,
  Check,
  Clock,
  Coins,
  Gem,
  Layers,
  Link2,
  Rabbit,
  Shuffle,
  Sparkles,
  Sprout,
  Target,
  Timer,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { useSession } from './session.tsx'
import { Meter, PanelHeader } from './ui.tsx'

const ICONS: Record<QuestMetric, React.ReactNode> = {
  reviews: <Layers size={16} />,
  newCards: <Sparkles size={16} />,
  decks: <Shuffle size={16} />,
  minutes: <Clock size={16} />,
  correct: <Target size={16} />,
  xp: <Zap size={16} />,
  mature: <Gem size={16} />,
  young: <Sprout size={16} />,
  run: <Link2 size={16} />,
  quick: <Rabbit size={16} />,
}

/**
 * Today's quests. Finished quests are claimed by hand for their XP and coins,
 * and claiming them all pays a bonus. Visitors get the login popup instead.
 */
export function QuestsCard() {
  const { data, claimQuest, guest, promptLogin } = useSession()
  const [claiming, setClaiming] = useState<string | null>(null)
  // Both values come from the server snapshot, so this renders identically on both sides.
  const resetsIn = Math.max(1, Math.ceil((Date.parse(data.dayEnd) - Date.parse(data.now)) / 3_600_000))
  const done = data.quests.filter((q) => q.progress >= q.target).length
  const bonus = data.questBonus

  async function claim(id: string) {
    if (guest) {
      promptLogin({
        title: 'Log in to claim quest rewards',
        text: 'Quests pay XP and coins to your account. Log in, or create a free account, and today’s quests start counting.',
      })
      return
    }
    setClaiming(id)
    await claimQuest(id)
    setClaiming(null)
  }

  return (
    <section className="panel quests" aria-labelledby="quests-title">
      <PanelHeader
        eyebrow="Daily quests"
        title={
          <span id="quests-title">
            {done} of {data.quests.length} complete
          </span>
        }
        aside={
          <span className="quests__reset" title={`Quests reset when the study day rolls over at ${data.rolloverHour}:00`}>
            <Timer size={14} />
            {resetsIn}h
          </span>
        }
      />
      <div className="quests__scroll">
        <ul className="quests__list">
          {data.quests.map((q) => {
            const complete = q.progress >= q.target
            return (
              <li key={q.id} className={clsx('quest', complete && 'is-done')}>
                <span className="quest__icon">{complete ? <Check size={16} strokeWidth={3} /> : ICONS[q.metric]}</span>
                <div className="quest__body">
                  <div className="quest__row">
                    <span className="quest__title">{q.title}</span>
                    <span className="quest__rewards">
                      <span className="quest__xp">+{q.xp} XP</span>
                      <span className="quest__coins">
                        <Coins size={12} aria-hidden />+{q.coins}
                        <span className="sr-only"> coins</span>
                      </span>
                    </span>
                  </div>
                  <Meter value={q.progress / q.target} color={complete ? 'var(--c-mature)' : 'var(--xp)'} label={q.title} />
                  <div className="quest__foot">
                    <span className="quest__progress tabular">
                      {Math.min(q.progress, q.target)} / {q.target}
                    </span>
                    {complete &&
                      (q.claimed ? (
                        <span className="quest__claimed">
                          <BadgeCheck size={14} /> Claimed
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="btn btn--primary btn--sm quest__claim"
                          onClick={() => claim(q.id)}
                          disabled={claiming === q.id}
                        >
                          {claiming === q.id ? 'Claiming…' : 'Claim'}
                        </button>
                      ))}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
      {data.quests.length > 1 && (
        <p className={clsx('quests__bonus', bonus.claimed && 'is-claimed')}>
          <Sparkles size={15} aria-hidden />
          {bonus.claimed ? (
            <span>All quests done today. Bonus collected.</span>
          ) : (
            <span>
              Claim all {data.quests.length} for a bonus <strong>+{bonus.xp} XP</strong> and <strong>+{bonus.coins} coins</strong>
              .
            </span>
          )}
        </p>
      )}
    </section>
  )
}
