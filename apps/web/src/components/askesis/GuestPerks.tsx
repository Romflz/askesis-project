import { Link } from '@tanstack/react-router'
import { Cloud, Coins, Flame, Gift, Scroll, Trophy } from 'lucide-react'

const PERKS = [
  {
    icon: <Flame size={18} />,
    title: 'Keep your streak',
    text: 'Streaks and freezes follow you, and reminders nudge you once a day.',
  },
  {
    icon: <Gift size={18} />,
    title: 'Daily chests',
    text: 'Open one every day for XP and coins; seven in a row is a weekly chest.',
  },
  {
    icon: <Scroll size={18} />,
    title: 'Quests and lucky finds',
    text: 'Six small goals a day, and the odd coin drop while you study.',
  },
  {
    icon: <Trophy size={18} />,
    title: '36 trophies',
    text: 'From your first review to a thousand study days. They can’t be lost.',
  },
  {
    icon: <Coins size={18} />,
    title: 'Levels and coins',
    text: 'Every answer earns XP, and your rank climbs from Spark to Engram.',
  },
  {
    icon: <Cloud size={18} />,
    title: 'Your decks, everywhere',
    text: 'Import from other flashcard apps with your progress, sync across devices, export anytime.',
  },
]

/**
 * Under the demo dashboard for visitors: what a free account unlocks. The demo
 * above already plays the same way, so this just says what gets saved.
 */
export function GuestPerks() {
  return (
    <section className="panel perks" aria-labelledby="perks-title">
      <div className="perks__head">
        <div>
          <p className="eyebrow">Free account</p>
          <h2 id="perks-title" className="perks__title">
            Everything above, saved and yours
          </h2>
          <p className="perks__lead">
            Try the free practice decks as much as you like. Sign up and it all starts counting for you, with two starter decks
            ready.
          </p>
        </div>
        <Link to="/register" className="btn btn--primary perks__cta">
          Create a free account
        </Link>
      </div>
      <ul className="perks__grid">
        {PERKS.map((p) => (
          <li key={p.title} className="perk">
            <span className="perk__icon">{p.icon}</span>
            <span>
              <span className="perk__title">{p.title}</span>
              <span className="perk__text">{p.text}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
