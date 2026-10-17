import { Link } from '@tanstack/react-router'
import { Brain, CodeXml, Flame, Timer, Zap } from 'lucide-react'
import type { ReactNode } from 'react'
import { Logo } from '../askesis/TopBar.tsx'

// Deterministic "review history" levels for the decorative mosaic, so server
// and client render the same cells.
function mosaic(cols: number, rows: number): number[] {
  const cells: number[] = []
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      // The classic shader hash: cheap pseudo-random noise in [0, 1) from the cell position.
      const n = Math.sin(c * 12.9898 + r * 78.233) * 43758.5453
      const noise = n - Math.floor(n)
      // Activity ramps up toward recent weeks, with a few rest days.
      const trend = c / cols
      const v = noise * 0.7 + trend * 0.6
      cells.push(noise < 0.08 ? 0 : v < 0.35 ? 1 : v < 0.6 ? 2 : v < 0.85 ? 3 : 4)
    }
  }
  return cells
}

const DESKTOP_CELLS = mosaic(44, 7)
const MOBILE_CELLS = mosaic(18, 3)

// The intervals the default preset gives a brand-new card.
const GRADES = [
  { label: 'Again', interval: '1m', tone: 'again' },
  { label: 'Hard', interval: '6m', tone: 'hard' },
  { label: 'Good', interval: '10m', tone: 'good' },
  { label: 'Easy', interval: '4d', tone: 'easy' },
] as const

const FACTS = [
  { icon: <Timer size={16} />, text: 'Proven SM-2 timings' },
  { icon: <Brain size={16} />, text: 'FSRS scheduling' },
  { icon: <CodeXml size={16} />, text: 'Open source' },
]

function Mosaic({ cells, rows, className }: { cells: number[]; rows: number; className: string }) {
  return (
    <div className={className} style={{ '--rows': rows } as React.CSSProperties} aria-hidden>
      {cells.map((level, i) => (
        <span key={i} className={`auth-cell auth-cell--${level}`} style={{ '--i': i } as React.CSSProperties} />
      ))}
    </div>
  )
}

/**
 * The frame for the login and register pages: a decorative brand panel on wide
 * screens beside the form card (which gets a compact brand strip on phones).
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div className="auth">
      <aside className="auth-visual">
        <Link to="/" className="auth-brand" aria-label="Askesis home">
          <Logo size={32} />
          <span>askesis</span>
        </Link>

        <div className="auth-visual__copy">
          <p className="eyebrow">Spaced repetition, gamified</p>
          <h2 className="auth-visual__title">
            Remember
            <br />
            everything.
          </h2>
          <p className="auth-visual__lede">
            Askesis brings each card back right before you would forget it, and turns the daily habit into streaks, quests and
            trophies.
          </p>
        </div>

        <div className="auth-stage" aria-hidden>
          <Mosaic cells={DESKTOP_CELLS} rows={7} className="auth-mosaic" />

          <div className="auth-demo">
            <div className="auth-demo__card">
              <div className="auth-demo__meta">
                <span className="auth-demo__deck">Japanese · Core</span>
                <span className="auth-demo__kind">New</span>
              </div>
              <p className="auth-demo__front">記憶</p>
              <p className="auth-demo__hint">きおく</p>
              <p className="auth-demo__back">memory</p>
            </div>
            <div className="auth-demo__grades">
              {GRADES.map((g) => (
                <span key={g.label} className={`auth-grade auth-grade--${g.tone}`}>
                  <span className="auth-grade__interval">{g.interval}</span>
                  {g.label}
                </span>
              ))}
            </div>
            <span className="auth-float auth-float--xp">
              <Zap size={13} fill="currentColor" />
              +12 XP
            </span>
            <span className="auth-float auth-float--streak">
              <Flame size={13} fill="currentColor" />
              Streak +1
            </span>
          </div>
        </div>

        <ul className="auth-facts">
          {FACTS.map((f) => (
            <li key={f.text}>
              {f.icon}
              {f.text}
            </li>
          ))}
        </ul>
      </aside>

      <main className="auth-main">
        <div className="auth-main__glow" aria-hidden />
        <div className="auth-card">
          <div className="auth-mobile-head">
            <Link to="/" className="auth-brand" aria-label="Askesis home">
              <Logo size={30} />
              <span>askesis</span>
            </Link>
            <Mosaic cells={MOBILE_CELLS} rows={3} className="auth-mosaic auth-mosaic--strip" />
          </div>

          <header className="auth-card__header">
            <h1 className="auth-card__title">{title}</h1>
            <p className="auth-card__subtitle">{subtitle}</p>
          </header>

          {children}

          <p className="auth-card__footer">{footer}</p>
        </div>
      </main>
    </div>
  )
}
