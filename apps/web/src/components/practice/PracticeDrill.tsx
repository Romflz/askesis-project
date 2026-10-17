import { DEFAULT_PRESET } from '@askesis/contracts'
import { answer, type CardContent, formatInterval, type Memory, newMemory, preview, type Rating, RATINGS } from '@askesis/core'
import clsx from 'clsx'
import { Eye, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useState, type KeyboardEvent } from 'react'
import { capture } from '../../lib/analytics.ts'
import { CardText, hasBlockContent, stripMarkup } from '../askesis/CardText.tsx'
import { Kbd } from '../askesis/ui.tsx'

// A no-account practice session on a public deck. Scheduling uses the default
// timings (the same as a new Askesis account); progress lives in this browser
// only.

/** The default learn-ahead limit. */
const LEARN_AHEAD_MS = 20 * 60_000

interface Stored {
  v: 1
  memories: (SerializedMemory | null)[]
  answered: number
}

type SerializedMemory = Omit<Memory, 'due' | 'lastReview'> & { due: string; lastReview: string | null }

const storageKey = (slug: string) => `askesis-practice:${slug}`

function load(slug: string, size: number): (Memory | null)[] | null {
  try {
    const raw = localStorage.getItem(storageKey(slug))
    if (!raw) return null
    const data = JSON.parse(raw) as Stored
    if (data.v !== 1 || data.memories.length !== size) return null
    return data.memories.map((m) =>
      m ? { ...m, due: new Date(m.due), lastReview: m.lastReview ? new Date(m.lastReview) : null } : null,
    )
  } catch {
    return null
  }
}

function save(slug: string, memories: (Memory | null)[], answered: number) {
  try {
    const data: Stored = {
      v: 1,
      answered,
      memories: memories.map((m) =>
        m ? { ...m, due: m.due.toISOString(), lastReview: m.lastReview?.toISOString() ?? null } : null,
      ),
    }
    localStorage.setItem(storageKey(slug), JSON.stringify(data))
  } catch {
    // Private mode or full storage: practice still works for this visit.
  }
}

/**
 * The next card: anything due now, then the next unseen card,
 * then (when nothing else is left) learning cards due within the learn-ahead limit.
 * `skip` avoids showing the card just answered unless it is the only option.
 */
function pick(memories: (Memory | null)[], now: number, skip: number | null): number | null {
  // Learning and relearning cards (states 1 and 3) may be shown up to the learn-ahead limit early.
  const learnAheadLimit = (m: Memory) => (m.state === 1 || m.state === 3 ? now + LEARN_AHEAD_MS : now)
  const earliest = (limit: (m: Memory) => number) => {
    let best: number | null = null
    memories.forEach((m, i) => {
      if (!m || i === skip || m.due.getTime() > limit(m)) return
      if (best === null || m.due < memories[best]!.due) best = i
    })
    return best
  }

  const due = earliest(() => now)
  if (due !== null) return due
  const unseen = memories.findIndex((m, i) => m === null && i !== skip)
  if (unseen >= 0) return unseen
  const ahead = earliest(learnAheadLimit)
  if (ahead !== null) return ahead
  const last = skip === null ? null : memories[skip]
  return last && last.due.getTime() <= learnAheadLimit(last) ? skip : null
}

/** Flashcard practice for a public deck, graded with the default preset and saved in localStorage. */
export function PracticeDrill({ slug, cards }: { slug: string; cards: CardContent[] }) {
  const [memories, setMemories] = useState<(Memory | null)[]>(() => cards.map(() => null))
  const [current, setCurrent] = useState<number | null>(0)
  const [revealed, setRevealed] = useState(false)
  const [answered, setAnswered] = useState(0)
  const [restored, setRestored] = useState(false)

  // Progress is per browser; read it only after hydration so the server render matches.
  useEffect(() => {
    const stored = load(slug, cards.length)
    if (stored) {
      setMemories(stored)
      setCurrent(pick(stored, Date.now(), null))
    }
    setRestored(true)
  }, [slug, cards.length])

  const card = current === null ? null : cards[current]!
  const memory = current === null ? null : (memories[current] ?? newMemory(new Date()))
  const intervals = useMemo(() => {
    if (!revealed || !memory) return null
    const now = new Date()
    const due = preview(memory, now, DEFAULT_PRESET)
    return Object.fromEntries(RATINGS.map(({ rating }) => [rating, formatInterval(due[rating].getTime() - now.getTime())]))
  }, [revealed, memory])

  const seen = memories.filter(Boolean).length
  const graduated = memories.filter((m) => m && m.state === 2).length

  function grade(rating: Rating) {
    if (current === null || !memory) return
    const next = memories.slice()
    next[current] = answer(memory, rating, new Date(), DEFAULT_PRESET)
    const count = answered + 1
    capture('practice_card_rated', { rating, public_deck_slug: slug })
    setMemories(next)
    setAnswered(count)
    setRevealed(false)
    setCurrent(pick(next, Date.now(), current))
    save(slug, next, count)
  }

  function reset() {
    capture('practice_progress_reset', { public_deck_slug: slug, answered_count: answered })
    const fresh = cards.map(() => null)
    setMemories(fresh)
    setAnswered(0)
    setRevealed(false)
    setCurrent(0)
    try {
      localStorage.removeItem(storageKey(slug))
    } catch {
      // Ignore: nothing stored.
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    // A focused button handles Space and Enter itself.
    if (e.target instanceof HTMLButtonElement && (e.key === 'Enter' || e.key === ' ')) return
    if (!revealed && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault()
      setRevealed(true)
    } else if (revealed && ['1', '2', '3', '4'].includes(e.key)) {
      e.preventDefault()
      grade(Number(e.key) as Rating)
    }
  }

  // Very short fronts (a kana, a kanji) get the large glyph style.
  const glyphFront = !!card && !hasBlockContent(card.front) && stripMarkup(card.front).length <= 4

  const nextDue = useMemo(() => {
    const dues = memories.filter((m): m is Memory => !!m).map((m) => m.due.getTime())
    return dues.length ? Math.min(...dues) : null
  }, [memories])

  return (
    <div className="practice-drill">
      <div className="practice-drill__bar">
        <span className="practice-drill__stat">
          <strong className="tabular">{seen}</strong> of {cards.length} seen
        </span>
        <span className="practice-drill__stat">
          <strong className="tabular">{graduated}</strong> graduated
        </span>
        <div className="practice-drill__progress" aria-hidden>
          <span style={{ width: `${(seen / cards.length) * 100}%` }} />
        </div>
        {restored && seen > 0 && (
          <button type="button" className="practice-drill__reset" onClick={reset}>
            <RotateCcw size={13} /> Reset
          </button>
        )}
      </div>

      {card ? (
        <div
          className={clsx('practice-card', revealed && 'is-revealed')}
          tabIndex={0}
          onKeyDown={onKeyDown}
          aria-label="Practice card. Space shows the answer; 1 to 4 grade it."
        >
          <div className="practice-card__body">
            <CardText text={card.front} className={clsx('practice-card__front', glyphFront && 'practice-card__front--glyph')} />
            {card.hint && <p className="practice-card__hint">{card.hint}</p>}
            {revealed && (
              <div className="practice-card__answer" aria-live="polite">
                <CardText text={card.back} className="practice-card__back" />
                {card.extra && <CardText text={card.extra} className="practice-card__extra" />}
              </div>
            )}
          </div>
          {!revealed ? (
            <button type="button" className="btn btn--primary btn--block" onClick={() => setRevealed(true)}>
              <Eye size={16} /> Show answer <Kbd>Space</Kbd>
            </button>
          ) : (
            <div className="practice-grades" role="group" aria-label="How well did you remember?">
              {RATINGS.map(({ rating, label, key }) => (
                <button key={rating} type="button" className={`grade__btn grade__btn--${key}`} onClick={() => grade(rating)}>
                  <span className="grade__interval tabular">{intervals?.[rating]}</span>
                  <span className="grade__label">{label}</span>
                  <Kbd>{rating}</Kbd>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="practice-card practice-card--done">
          <p className="practice-card__done-title">All caught up</p>
          <p className="practice-card__done-text">
            {nextDue
              ? `Your next card is due in ${formatInterval(Math.max(0, nextDue - Date.now()))}. Spaced repetition works best when you come back.`
              : 'You have practiced every card in this deck.'}
          </p>
        </div>
      )}
      <p className="practice-drill__note">
        Scheduled with the default Askesis timings. Progress is saved in this browser
        {answered > 0 ? ` · ${answered} ${answered === 1 ? 'answer' : 'answers'} this visit` : ''}.
      </p>
    </div>
  )
}
