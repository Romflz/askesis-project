import { Link } from '@tanstack/react-router'
import { CalendarCheck, Clock, Flame, FolderTree, Keyboard, SlidersHorizontal } from 'lucide-react'

const POINTS = [
  {
    icon: <CalendarCheck size={18} />,
    title: 'Today’s cards',
    text: 'Reviews due today, learning cards whose next step is up, and new cards, within each deck’s daily limits. Start studying runs them.',
  },
  {
    icon: <FolderTree size={18} />,
    title: 'Decks and subdecks',
    text: 'Ticking a deck includes its subdecks. Each row shows what it has due: new cards, learning cards and reviews.',
  },
  {
    icon: <SlidersHorizontal size={18} />,
    title: 'Custom study',
    text: 'Go beyond today: extra new cards, cards due in the next few days, cards you forgot recently, or a cram. Tags narrow any of them.',
  },
  {
    icon: <Flame size={18} />,
    title: 'Cram is practice',
    text: 'Cram answers don’t change when cards come back and earn no XP. Every other mode schedules cards like a normal session.',
  },
  {
    icon: <Keyboard size={18} />,
    title: 'Answering',
    text: 'Space shows the answer, and 1 to 4 grade it: Again, Hard, Good, Easy. Hard, Good and Easy pay the same XP, so grade honestly.',
  },
  {
    icon: <Clock size={18} />,
    title: 'Your study day',
    text: 'It starts at the hour set in Settings (4 AM by default) in your time zone. Learning cards return within minutes; reviews after days.',
  },
]

/** A short guide under the /study picker: what each choice does. */
export function HowStudyWorks() {
  return (
    <section className="panel perks study-howto" aria-labelledby="study-howto-title">
      <div className="perks__head">
        <div>
          <p className="eyebrow">How it works</p>
          <h2 id="study-howto-title" className="perks__title">
            What each choice studies
          </h2>
          <p className="perks__lead">
            More in the docs:{' '}
            <Link to="/docs/$slug" params={{ slug: 'custom-study' }}>
              custom study and tags
            </Link>{' '}
            and{' '}
            <Link to="/docs/$slug" params={{ slug: 'scheduling' }}>
              how scheduling works
            </Link>
            .
          </p>
        </div>
      </div>
      <ul className="perks__grid">
        {POINTS.map((p) => (
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
