import clsx from 'clsx'
import { BookOpen, Brain, CodeXml, Coins, FlaskConical, Globe, Sparkles } from 'lucide-react'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { type DeckIcon } from '@askesis/core'
import { fmtInt } from '../../lib/format.ts'

/**
 * Renders the final value on the server; tweens from the previous value when it
 * changes. The tween engine (motion) loads on the first change, so pages that
 * only show numbers (the top bar on every page) don't ship it.
 */
export function AnimatedNumber({ value, format = fmtInt }: { value: number; format?: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const previous = useRef(value)

  useEffect(() => {
    const from = previous.current
    previous.current = value
    if (from === value) return
    let stop: (() => void) | undefined
    let cancelled = false
    void import('motion/react').then(({ animate }) => {
      if (cancelled) return
      const controls = animate(from, value, {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
        onUpdate: (v) => {
          if (ref.current) ref.current.textContent = format(Math.round(v))
        },
      })
      stop = () => controls.stop()
    })
    return () => {
      cancelled = true
      stop?.()
    }
    // `format` is usually an inline arrow; only a new value should restart the tween.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <span ref={ref}>{format(value)}</span>
}

/** A circular progress ring. `value` runs from 0 to 1; `children` sit in the middle. */
export function Ring({
  value,
  size = 120,
  stroke = 10,
  color = 'var(--accent)',
  track = 'var(--surface-3)',
  className,
  children,
}: {
  value: number
  size?: number
  stroke?: number
  color?: string
  track?: string
  className?: string
  children?: ReactNode
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c * (1 - Math.min(1, Math.max(0, value)))
  return (
    <div className={clsx('ring', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          className="ring__value"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      {children && <div className="ring__center">{children}</div>}
    </div>
  )
}

/** A thin progress bar. `value` runs from 0 to 1 and is announced as a percentage. */
export function Meter({ value, color, label }: { value: number; color?: string; label?: string }) {
  return (
    <div
      className="meter"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      style={{ '--meter-color': color } as CSSProperties}
    >
      <div className="meter__fill" style={{ width: `${Math.min(1, Math.max(0, value)) * 100}%` }} />
    </div>
  )
}

/** A panel's header: eyebrow, an optional h2 title (`id` is for aria-labelledby) and extras on the right. */
export function PanelHeader({
  eyebrow,
  title,
  aside,
  id,
}: {
  eyebrow: string
  title?: ReactNode
  aside?: ReactNode
  id?: string
}) {
  return (
    <header className="panel__header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        {title && (
          <h2 className="panel__title" id={id}>
            {title}
          </h2>
        )}
      </div>
      {aside && <div className="panel__aside">{aside}</div>}
    </header>
  )
}

const GLYPHS: Record<DeckIcon, ReactNode> = {
  kana: <span className="deck-glyph__text">あ</span>,
  spanish: <span className="deck-glyph__text">ñ</span>,
  brain: <Brain size={16} strokeWidth={2} />,
  code: <CodeXml size={16} strokeWidth={2} />,
  flask: <FlaskConical size={16} strokeWidth={2} />,
  globe: <Globe size={16} strokeWidth={2} />,
  spark: <Sparkles size={16} strokeWidth={2} />,
  book: <BookOpen size={16} strokeWidth={2} />,
}

/** A deck's icon in a tinted tile. It's hidden from screen readers, so whatever holds it carries the label. */
export function DeckGlyph({ icon, size = 'md' }: { icon: DeckIcon; size?: 'sm' | 'md' }) {
  return (
    <span className={clsx('deck-glyph', `deck-glyph--${icon}`, `deck-glyph--${size}`)} aria-hidden>
      {GLYPHS[icon]}
    </span>
  )
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="kbd">{children}</kbd>
}

/** The coin balance with a coin mark (dashboard chest card and top bar). */
export function CoinCount({ value, className }: { value: number; className?: string }) {
  return (
    <span className={clsx('coin-count', className)} title={`${fmtInt(value)} coins`}>
      <Coins size={15} aria-hidden />
      <AnimatedNumber value={value} />
      <span className="sr-only"> coins</span>
    </span>
  )
}
