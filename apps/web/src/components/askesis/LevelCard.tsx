import { Zap } from 'lucide-react'
import { useId } from 'react'
import { levelInfo } from '@askesis/core'
import { fmtCompact, fmtInt } from '../../lib/format.ts'
import { useSession } from './session.tsx'
import { AnimatedNumber, PanelHeader } from './ui.tsx'

function LevelBadge({ level }: { level: number }) {
  // SVG ids are global to the document, so each badge needs its own gradient id.
  const id = useId()
  return (
    <div className="level__badge">
      <svg viewBox="0 0 56 62" aria-hidden>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--xp)' }} />
            <stop offset="1" style={{ stopColor: 'color-mix(in oklab, var(--xp) 55%, var(--c-young))' }} />
          </linearGradient>
        </defs>
        <path
          d="M28 3 51.5 16.5v29L28 59 4.5 45.5v-29Z"
          fill={`url(#${id})`}
          stroke={`url(#${id})`}
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <path d="M28 9 46 19.5v23L28 53 10 42.5v-23Z" fill="none" stroke="rgb(255 255 255 / 0.25)" strokeWidth="1" />
      </svg>
      <span className="level__number">{level}</span>
    </div>
  )
}

/** Level, rank title and XP progress toward the next level. */
export function LevelCard() {
  const { data } = useSession()
  const info = levelInfo(data.totalXp)

  return (
    <section className="panel level" aria-labelledby="level-title">
      <PanelHeader
        eyebrow="Level"
        aside={
          <span className="chip chip--xp" title={`${fmtInt(data.totalXp)} XP earned`}>
            <Zap size={13} fill="currentColor" />
            {fmtCompact(data.totalXp)} XP
          </span>
        }
      />
      <div className="level__hero">
        <LevelBadge level={info.level} />
        <div>
          <p id="level-title" className="level__title">
            {info.title}
          </p>
          <p className="level__next">
            {info.next ? `Next rank: ${info.next.title} at Lv ${info.next.level}` : 'Highest rank reached'}
          </p>
        </div>
      </div>
      <div
        className="level__bar"
        role="progressbar"
        aria-label={`Progress to level ${info.level + 1}`}
        aria-valuemin={0}
        aria-valuemax={info.span}
        aria-valuenow={info.into}
      >
        <div className="level__bar-fill" style={{ width: `${info.progress * 100}%` }} />
      </div>
      <div className="level__bar-meta tabular">
        <span>
          <AnimatedNumber value={info.into} /> / {fmtInt(info.span)} XP
        </span>
        <span>
          {fmtInt(info.span - info.into)} to Lv {info.level + 1}
        </span>
      </div>
    </section>
  )
}
