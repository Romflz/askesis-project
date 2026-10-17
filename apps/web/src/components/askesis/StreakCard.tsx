import { Link } from '@tanstack/react-router'
import clsx from 'clsx'
import { Check, Flame, Snowflake, X } from 'lucide-react'
import { formatDay, type WeekDay } from '@askesis/core'
import { useSession } from './session.tsx'
import { AnimatedNumber, PanelHeader } from './ui.tsx'

const MARKS: Record<WeekDay['status'], React.ReactNode> = {
  done: <Check size={14} strokeWidth={3} />,
  freeze: <Snowflake size={14} strokeWidth={2.5} />,
  missed: <X size={13} strokeWidth={2.5} />,
  today: null,
  upcoming: null,
  none: null,
}

const STATUS_LABEL: Record<WeekDay['status'], string> = {
  done: 'studied',
  freeze: 'covered by a streak freeze',
  missed: 'missed',
  today: 'not studied yet',
  upcoming: 'upcoming',
  none: 'before you started',
}

/** The current streak, banked freezes and how this week has gone day by day. */
export function StreakCard() {
  const { data, guest } = useSession()
  const s = data.streak
  const best = s.current >= s.longest

  return (
    <section className="panel streak" aria-labelledby="streak-title">
      <PanelHeader
        eyebrow="Streak"
        aside={
          <span
            className="streak__freezes"
            title={`${s.freezes} of ${s.maxFreezes} streak freezes. A freeze covers one missed day automatically.`}
          >
            {Array.from({ length: s.maxFreezes }, (_, i) => (
              <Snowflake key={i} size={15} className={clsx(i < s.freezes && 'is-on')} />
            ))}
            <span className="sr-only">
              {s.freezes} of {s.maxFreezes} streak freezes
            </span>
          </span>
        }
      />

      <div className="streak__hero">
        <div className={clsx('streak__flame', !s.studiedToday && 'is-at-risk')} aria-hidden>
          <Flame size={34} strokeWidth={2} />
        </div>
        <div>
          <p id="streak-title" className="streak__count">
            <AnimatedNumber value={s.current} />
            <span> day streak</span>
          </p>
          <p className="streak__note">
            {!s.studiedToday
              ? 'Review today to keep it alive'
              : best
                ? 'Personal best. Keep it burning.'
                : `Longest: ${s.longest} days`}
          </p>
        </div>
      </div>

      <ol className="streak__week" aria-label="This week">
        {s.week.map((day) => (
          <li key={day.date} className={clsx('streak-day', `streak-day--${day.status}`)}>
            <span className="streak-day__label" aria-hidden>
              {formatDay(day.date, { weekday: 'narrow' })}
            </span>
            <span className="streak-day__mark">{MARKS[day.status]}</span>
            <span className="sr-only">
              {formatDay(day.date, { weekday: 'long' })}: {STATUS_LABEL[day.status]}
            </span>
          </li>
        ))}
      </ol>
      {guest && (
        <p className="streak__guest">
          Sample streak. <Link to="/login">Log in</Link> to track your own.
        </p>
      )}
    </section>
  )
}
