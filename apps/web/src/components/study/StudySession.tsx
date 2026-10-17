import {
  formatInterval,
  levelInfo,
  parseMemory,
  preview,
  type Rating,
  RATINGS,
  type StudyQueue,
  xpForReview,
} from '@askesis/core'
import { Link, useNavigate } from '@tanstack/react-router'
import confetti from 'canvas-confetti'
import clsx from 'clsx'
import { Clock, Coins, Flame, Info, Keyboard, Settings2, Tag, X, Zap } from 'lucide-react'
import { AnimatePresence, motion, useAnimate, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { capture } from '../../lib/analytics.ts'
import { fmtInt } from '../../lib/format.ts'
import { sfx } from '../../lib/sfx.ts'
import { useUserDataMutation } from '../../lib/queries.ts'
import { submitReview } from '../../server/askesis.functions.ts'
import { updateCard } from '../../server/library.functions.ts'
import { buryCard, undoReview } from '../../server/study.functions.ts'
import { LevelUpOverlay } from '../askesis/Celebrations.tsx'
import { CardText, stripMarkup } from '../askesis/CardText.tsx'
import { DeckGlyph, Kbd, Ring } from '../askesis/ui.tsx'
import { CARD_ACTIONS, type CardActionId, CardActionsSheet } from './CardActions.tsx'
import { EditCardModal } from './EditCardModal.tsx'
import { DEFAULT_SESSION_PREFS, useStoredState } from './prefs.ts'
import { PrefsPanel } from './PrefsPanel.tsx'
import { MODE_INFO, type StudySearch } from './search.ts'
import { EmptyQueue, SessionSummary } from './SessionEnd.tsx'
import { COMBO_MILESTONES, comboTier, initSession, remaining, type SessionConfig, sessionReducer } from './sessionState.ts'
import { ShortcutsSheet } from './ShortcutsSheet.tsx'

// Confetti draws on a canvas, so it needs literal colors rather than CSS variables.
const BRAND = ['#c6f432', '#a397ff', '#ff8a3d', '#16a5a5']
const KIND_LABEL = { new: 'New', learning: 'Learning', review: 'Review' } as const

interface Toast {
  id: number
  title: string
  detail?: string
  tone: 'flame' | 'good' | 'error' | 'info'
}

interface Floater {
  id: number
  xp: number
  key: (typeof RATINGS)[number]['key']
}

/** Short-lived pops by the card: a lucky coin find, or a combo milestone. */
type PopInput = { kind: 'lucky'; coins: number } | { kind: 'combo'; combo: number }
type Pop = PopInput & { id: number }

const GRADE_SOUND: Record<Rating, () => void> = { 1: sfx.again, 2: sfx.good, 3: sfx.good, 4: sfx.easy }

function clock(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = String(s % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`
}

/** Short fronts (a kanji, a single word) render larger. */
function sizeFor(text: string): 'xl' | 'lg' | 'md' {
  const length = stripMarkup(text).length
  if (length <= 4) return 'xl'
  if (length <= 24) return 'lg'
  return 'md'
}

/** Keys pressed while typing in a field belong to the field. */
function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

/**
 * The focused study screen. The reducer in sessionState.ts runs the queue
 * locally; answers, undo, bury, suspend and edits are sent to the API alongside.
 */
export function StudySession({ queue, search }: { queue: StudyQueue; search: StudySearch }) {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const [prefs, setPrefs] = useStoredState('askesis-study-prefs', DEFAULT_SESSION_PREFS)
  const motionOk = !reduceMotion && prefs.animate

  const deckById = useMemo(() => new Map(queue.decks.map((d) => [d.id, d])), [queue.decks])
  const config = useMemo<SessionConfig>(
    () => ({
      reschedules: queue.reschedules,
      dayEnd: Date.parse(queue.dayEnd),
      learnAheadMs: queue.learnAheadMinutes * 60_000,
      goal: queue.progress.goal,
      presetFor: (card) => {
        const deck = deckById.get(card.deckId)
        return deck ? queue.presets[deck.presetId] : undefined
      },
    }),
    [queue, deckById],
  )
  const reducer = useMemo(() => sessionReducer(config), [config])
  // `now` is irrelevant for the first pick (no learning cards yet), so 0 keeps SSR deterministic.
  const [state, dispatch] = useReducer(reducer, null, () =>
    initSession(queue.cards, queue.progress, config, Date.parse(queue.now), queue.mode === 'scheduled' || queue.mode === 'quick'),
  )
  // The session runs on its own state, so writes only mark the other pages stale.
  const { mutateAsync: saveAnswer } = useUserDataMutation(submitReview, { refetch: false })
  const { mutateAsync: undoAnswer } = useUserDataMutation(undoReview, { refetch: false })
  const { mutateAsync: buryUntilTomorrow } = useUserDataMutation(buryCard, { refetch: false })
  const { mutateAsync: patchCard } = useUserDataMutation(updateCard, { refetch: false })

  const [now, setNow] = useState<number | null>(null)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [floaters, setFloaters] = useState<Floater[]>([])
  const [pops, setPops] = useState<Pop[]>([])
  /** Coins from lucky finds this session (kept by the server even if the answer is undone). */
  const [coins, setCoins] = useState(0)
  const [levelUp, setLevelUp] = useState<{ level: number; title: string; rankUp: boolean } | null>(null)
  const [panel, setPanel] = useState<'none' | 'prefs' | 'keys' | 'edit' | 'exit' | 'actions'>('none')
  const [busy, setBusy] = useState(false)
  const shownAt = useRef(0)
  const nextId = useRef(0)
  /** Each answer's save, so undo never races the request it is undoing. */
  const saves = useRef(new Map<string, Promise<boolean>>())
  const cardRef = useRef<HTMLElement | null>(null)
  // The outgoing card detaches after the next one mounts (popLayout), so keep the newest.
  const setCardRef = useCallback((el: HTMLElement | null) => {
    if (el) cardRef.current = el
  }, [])

  // Clocks run only after mount, so the server render has no time in it. The
  // session clock stops when the summary shows; an undo from there resumes it
  // without counting the time spent on the summary.
  const ended = state.finished || (!state.current && state.waitingUntil === null)
  const endedAt = useRef<number | null>(null)
  useEffect(() => {
    const at = Date.now()
    setNow(at)
    if (ended) {
      endedAt.current = at
      return
    }
    const paused = endedAt.current === null ? 0 : at - endedAt.current
    endedAt.current = null
    setStartedAt((start) => (start === null ? at : start + paused))
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [ended])

  useEffect(() => {
    if (now !== null && state.waitingUntil !== null) dispatch({ type: 'tick', now })
  }, [now, state.waitingUntil])

  // Changes every time a card is shown, including the same card again (a learning
  // step, Later, undo): restarts the answer timer and moves focus to the card.
  const currentKey = state.current ? `${state.current.id}:${state.current.memory.reps}:${state.history.length}` : null
  useEffect(() => {
    shownAt.current = Date.now()
    cardRef.current?.focus({ preventScroll: true })
  }, [currentKey])

  const toast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = ++nextId.current
    setToasts((list) => [...list.slice(-2), { ...t, id }])
    setTimeout(() => setToasts((list) => list.filter((x) => x.id !== id)), 3500)
  }, [])

  const celebrate = useCallback(
    (big: boolean) => {
      if (!prefs.confetti || reduceMotion) return
      confetti({
        particleCount: big ? 160 : 70,
        spread: big ? 100 : 60,
        origin: { x: 0.5, y: 0.75 },
        colors: BRAND,
        disableForReducedMotion: true,
      })
    },
    [prefs.confetti, reduceMotion],
  )

  const addPop = useCallback((p: PopInput, ms: number) => {
    const id = ++nextId.current
    setPops((list) => [...list, { ...p, id }])
    setTimeout(() => setPops((list) => list.filter((x) => x.id !== id)), ms)
  }, [])

  const card = state.current
  const deck = card ? deckById.get(card.deckId) : undefined
  const preset = card ? config.presetFor(card) : undefined
  const left = remaining(state)
  const done = state.history.length
  const total = done + left.total

  const intervals = useMemo(() => {
    if (!card || !state.revealed || !preset || !queue.reschedules) return null
    const at = new Date()
    const dues = preview(parseMemory(card.memory), at, preset)
    return Object.fromEntries(
      Object.entries(dues).map(([r, due]) => [r, formatInterval(due.getTime() - at.getTime())]),
    ) as Record<Rating, string>
  }, [card, state.revealed, preset, queue.reschedules])

  // ── Actions ──

  const reveal = useCallback(() => {
    sfx.reveal()
    dispatch({ type: 'reveal' })
  }, [])

  const grade = useCallback(
    (rating: Rating) => {
      if (!card || !state.revealed || busy) return
      const at = Date.now()
      // Answer time is capped at a minute, so a break doesn't count as study time.
      const ms = Math.min(60_000, Math.max(0, at - shownAt.current))
      capture('study_card_rated', {
        rating,
        card_kind: card.kind,
        study_mode: queue.mode,
        reschedules: queue.reschedules,
      })
      dispatch({ type: 'answer', rating, now: at, ms })
      GRADE_SOUND[rating]()

      if (queue.reschedules) {
        const streakAfter = state.studiedToday ? state.streak : state.streak + 1
        const id = ++nextId.current
        const key = RATINGS[rating - 1]!.key
        setFloaters((f) => [...f, { id, xp: xpForReview(rating, card.kind === 'new', streakAfter), key }])
        setTimeout(() => setFloaters((f) => f.filter((x) => x.id !== id)), 1100)

        const save = saveAnswer({ data: { cardId: card.id, rating, durationMs: ms } })
          .then((result) => {
            dispatch({ type: 'serverMemory', cardId: card.id, memory: result.memory })
            if (result.leech)
              toast({ title: 'Leech', detail: 'You keep forgetting this card. It was tagged “leech”.', tone: 'info' })
            const drop = result.drop
            if (drop) {
              setCoins((c) => c + drop)
              addPop({ kind: 'lucky', coins: drop }, 2600)
              sfx.coins()
            }
            return true
          })
          .catch(() => {
            toast({ title: 'That answer wasn’t saved', detail: 'Check your connection. You can keep going.', tone: 'error' })
            return false
          })
        saves.current.set(card.id, save)

        if (!state.studiedToday)
          toast({ title: `${streakAfter}-day streak!`, detail: 'Your streak is safe for today.', tone: 'flame' })
        if (state.reviewsToday < queue.progress.goal && state.reviewsToday + 1 >= queue.progress.goal) {
          toast({ title: 'Daily goal complete', detail: 'Bonus XP earned.', tone: 'good' })
          celebrate(true)
        }
      }
    },
    [
      card,
      state.revealed,
      state.studiedToday,
      state.streak,
      state.reviewsToday,
      busy,
      queue,
      toast,
      celebrate,
      addPop,
      saveAnswer,
    ],
  )

  const undo = useCallback(async () => {
    const last = state.history.at(-1)
    if (!last || busy) return
    if (!queue.reschedules) return dispatch({ type: 'undo', now: Date.now() })
    setBusy(true)
    try {
      const saved = await (saves.current.get(last.card.id) ?? Promise.resolve(false))
      // An answer that never reached the server only needs undoing here.
      if (!saved) return dispatch({ type: 'undo', now: Date.now() })
      const { card: restored, undoneDrop } = await undoAnswer({ data: { cardId: last.card.id } })
      saves.current.delete(last.card.id)
      if (undoneDrop) setCoins((c) => Math.max(0, c - undoneDrop))
      dispatch({ type: 'undo', restored, now: Date.now() })
    } catch {
      toast({ title: 'Couldn’t undo', detail: 'Try again in a moment.', tone: 'error' })
    } finally {
      setBusy(false)
    }
  }, [state.history, busy, queue.reschedules, toast, undoAnswer])

  // Bury and suspend take the card out right away; a failed request only shows a toast.
  const bury = useCallback(async () => {
    if (!card) return
    dispatch({ type: 'remove', now: Date.now() })
    try {
      await buryUntilTomorrow({ data: { id: card.id } })
      toast({ title: 'Buried until tomorrow', tone: 'info' })
    } catch {
      toast({ title: 'Couldn’t bury that card', tone: 'error' })
    }
  }, [card, toast, buryUntilTomorrow])

  const suspend = useCallback(async () => {
    if (!card) return
    dispatch({ type: 'remove', now: Date.now() })
    try {
      await patchCard({ data: { id: card.id, patch: { suspended: true } } })
      toast({ title: 'Card suspended', detail: 'Unsuspend it from the Decks page.', tone: 'info' })
    } catch {
      toast({ title: 'Couldn’t suspend that card', tone: 'error' })
    }
  }, [card, toast, patchCard])

  const skip = useCallback(() => dispatch({ type: 'skip', now: Date.now() }), [])

  const saveEdit = useCallback(
    async (patch: { front: string; back: string; hint: string; extra: string }) => {
      if (!card) return
      const updated = await patchCard({ data: { id: card.id, patch } })
      dispatch({
        type: 'edit',
        card: {
          ...card,
          front: updated.front,
          back: updated.back,
          hint: updated.hint ?? undefined,
          extra: updated.extra ?? undefined,
        },
      })
      setPanel('none')
      toast({ title: 'Card updated', tone: 'good' })
    },
    [card, toast, patchCard],
  )

  const exit = useCallback(() => {
    if (done > 0 && !state.finished) setPanel('exit')
    else void navigate({ to: '/dashboard' })
  }, [done, state.finished, navigate])

  // Combo milestones: a pop by the card, a pulse on the badge and a chime. Each fires
  // once: undoing and re-answering the same card doesn't repeat it.
  const [comboScope, animateCombo] = useAnimate<HTMLSpanElement>()
  const lastCombo = useRef(0)
  const milestonesAt = useRef(new Set<number>())
  useEffect(() => {
    const before = lastCombo.current
    lastCombo.current = state.combo
    const hit = COMBO_MILESTONES.find((m) => before < m && state.combo >= m)
    if (!hit || milestonesAt.current.has(done)) return
    milestonesAt.current.add(done)
    addPop({ kind: 'combo', combo: hit }, 1400)
    // Just after the answer's own chime, so the two don't blur together.
    setTimeout(sfx.combo, 120)
    if (motionOk && comboScope.current) {
      void animateCombo('.study-bar__combo-ring', { opacity: [0.9, 0], scale: [1, 2.4] }, { duration: 0.7, ease: 'easeOut' })
      void animateCombo('svg', { scale: [1, 1.5, 1], rotate: [0, -12, 0] }, { duration: 0.45 })
    }
  }, [state.combo, done, addPop, motionOk, comboScope, animateCombo])

  // Crossing a level mid-session gets the full-screen moment, or a toast with
  // celebrations turned off. A level is only celebrated once, even after undo.
  const startXp = queue.progress.totalXp
  const shownLevel = useRef(levelInfo(startXp))
  useEffect(() => {
    if (!queue.reschedules) return
    const info = levelInfo(startXp + state.xp)
    if (info.level <= shownLevel.current.level) return
    const rankUp = info.title !== shownLevel.current.title
    shownLevel.current = info
    if (prefs.confetti) return setLevelUp({ level: info.level, title: info.title, rankUp })
    sfx.levelUp()
    toast({ title: `Level ${info.level}!`, detail: rankUp ? `You’re now a ${info.title}.` : undefined, tone: 'good' })
  }, [state.xp, startXp, queue.reschedules, prefs.confetti, toast])

  const closeLevelUp = useCallback(() => {
    setLevelUp(null)
    cardRef.current?.focus({ preventScroll: true })
  }, [])

  // A small cheer when a session that changed something wraps up (after a level-up
  // moment on the last answer, which has its own confetti).
  const cheered = useRef(false)
  useEffect(() => {
    if (state.finished && done > 0 && !levelUp && !cheered.current) {
      cheered.current = true
      celebrate(false)
    }
  }, [state.finished, done, levelUp, celebrate])

  // ── Keyboard ──

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // The level-up overlay (Esc, Enter on its button) and the edit modal handle their own keys.
      if (levelUp || panel === 'edit' || isTyping(e.target)) return
      if (e.key === 'Escape') {
        e.preventDefault()
        if (panel !== 'none') setPanel('none')
        else exit()
        return
      }
      if (panel !== 'none') return
      const key = e.key.toLowerCase()
      if ((e.ctrlKey || e.metaKey) && key === 'z') {
        e.preventDefault()
        void undo()
        return
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (key === ' ' || key === 'enter') {
        // A focused button handles Space/Enter itself.
        if (e.target instanceof HTMLButtonElement) return
        e.preventDefault()
        if (!state.current) return
        if (!state.revealed) reveal()
        else grade(3)
      } else if (['1', '2', '3', '4'].includes(key) && state.revealed) {
        e.preventDefault()
        grade(Number(key) as Rating)
      } else {
        const action = shortcutFor(key)
        if (action) {
          // Shortcut keys must not also type into whatever gets focus next (the edit form).
          e.preventDefault()
          action()
        }
      }
    }

    /** Letter shortcuts; all but undo and help need a card on screen. */
    function shortcutFor(key: string): (() => void) | null {
      if (key === 'z') return () => void undo()
      if (key === '?') return () => setPanel('keys')
      if (!state.current) return null
      if (key === 'b') return () => void bury()
      if (key === 's') return () => void suspend()
      if (key === 'e') return () => setPanel('edit')
      if (key === 'l') return skip
      return null
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [levelUp, panel, state, reveal, grade, undo, bury, suspend, skip, exit])

  // ── Render ──

  const { deckLabel, soloDeck } = useMemo(() => {
    const ids = new Set(queue.cards.map((c) => c.deckId))
    const decks = queue.decks.filter((d) => ids.has(d.id))
    if (decks.length === 1) return { deckLabel: decks[0]!.path, soloDeck: decks[0]! }
    if (decks.length === 0 || !search.decks) return { deckLabel: search.decks ? 'Selected decks' : 'All decks', soloDeck: null }
    return { deckLabel: `${decks.length} decks`, soloDeck: null }
  }, [queue, search.decks])

  // "a / b · not c" for a custom study by tag ("a + b" when every tag is required).
  const tagLabel = useMemo(() => {
    const include = search.tags?.split(',').filter(Boolean) ?? []
    const exclude = search.xtags?.split(',').filter(Boolean) ?? []
    return [include.join(search.match === 'all' ? ' + ' : ' / '), exclude.length ? `not ${exclude.join(', ')}` : '']
      .filter(Boolean)
      .join(' · ')
  }, [search.tags, search.xtags, search.match])

  const style = {
    '--study-text-scale': { s: 0.85, m: 1, l: 1.2, xl: 1.45 }[prefs.textSize],
  } as React.CSSProperties

  const goal = queue.progress.goal

  // Shared by the side list (wide screens) and the compact toolbar under the answer buttons.
  const actions: Record<CardActionId, { run: () => void; disabled?: boolean }> = {
    undo: { run: () => void undo(), disabled: !state.history.length || busy },
    later: { run: skip },
    edit: { run: () => setPanel('edit') },
    bury: { run: () => void bury() },
    suspend: { run: () => void suspend() },
  }

  return (
    <div
      className={clsx(
        'study-session',
        prefs.focusMode && 'is-focus',
        !prefs.animate && 'no-motion',
        !prefs.keyHints && 'no-hints',
        prefs.align === 'left' && 'is-left',
      )}
      style={style}
    >
      <header className="study-bar">
        <button type="button" className="icon-btn" onClick={exit} aria-label="End session">
          <X size={18} />
        </button>
        <div className="study-bar__title">
          {soloDeck && <DeckGlyph icon={soloDeck.icon} size="sm" />}
          <span className="study-bar__deck">{deckLabel}</span>
          {queue.mode !== 'scheduled' && (
            <span className={clsx('chip study-bar__mode', queue.mode === 'cram' && 'is-practice')}>
              {MODE_INFO[queue.mode].label}
            </span>
          )}
          {tagLabel && (
            <span className="chip study-bar__mode study-bar__tags" title={`Tags: ${tagLabel}`}>
              <Tag size={12} aria-hidden />
              <span className="study-bar__tags-text">{tagLabel}</span>
            </span>
          )}
        </div>

        <div className="study-bar__stats">
          {prefs.showCounts && (
            <span className="study-counts" aria-label={`${left.new} new, ${left.learning} learning, ${left.review} review left`}>
              <span className="study-counts__n study-counts__n--new">{left.new}</span>
              <span className="study-counts__n study-counts__n--learning">{left.learning}</span>
              <span className="study-counts__n study-counts__n--review">{left.review}</span>
            </span>
          )}
          {prefs.showTimer && (
            <span className="study-bar__timer tabular" aria-label="Session time">
              <Clock size={14} />
              {now !== null && startedAt !== null ? clock(now - startedAt) : '0:00'}
            </span>
          )}
          {queue.reschedules && (
            <span className="study-bar__xp" title="XP earned this session">
              <Zap size={13} fill="currentColor" />+{fmtInt(state.xp)}
            </span>
          )}
          <AnimatePresence>
            {state.combo >= 3 && (
              // One badge for the whole streak of correct answers; only the number re-mounts
              // to pop, so an exiting copy never sits next to the new one.
              <motion.span
                key="combo"
                ref={comboScope}
                className={`study-bar__combo study-bar__combo--t${comboTier(state.combo)}`}
                title={`${state.combo} in a row without Again`}
                initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 500, damping: 18 }}
              >
                <span className="study-bar__combo-ring" aria-hidden />
                <Flame size={12} fill="currentColor" />
                <motion.span
                  key={state.combo}
                  initial={reduceMotion ? false : { scale: 1.45 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 600, damping: 20 }}
                >
                  {state.combo}
                </motion.span>
              </motion.span>
            )}
          </AnimatePresence>
          {queue.reschedules && (
            <span className="study-bar__goal" title={`${state.reviewsToday} of ${goal} reviews today`}>
              <Ring
                value={state.reviewsToday / goal}
                size={26}
                stroke={3.5}
                color={state.reviewsToday >= goal ? 'var(--c-mature)' : 'var(--accent)'}
              />
            </span>
          )}
          <button
            type="button"
            className="icon-btn"
            onClick={() => setPanel(panel === 'keys' ? 'none' : 'keys')}
            aria-label="Keyboard shortcuts"
          >
            <Keyboard size={17} />
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setPanel(panel === 'prefs' ? 'none' : 'prefs')}
            aria-label="Session preferences"
            aria-expanded={panel === 'prefs'}
          >
            <Settings2 size={17} />
          </button>
        </div>
        <div
          className="study-progress"
          role="progressbar"
          aria-label="Session progress"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={done}
        >
          <div className="study-progress__fill" style={{ width: `${total ? (done / total) * 100 : 100}%` }} />
        </div>
      </header>

      {panel === 'prefs' && <PrefsPanel prefs={prefs} onChange={setPrefs} onClose={() => setPanel('none')} />}

      <main className="study-stage">
        {state.finished || (!card && state.waitingUntil === null) ? (
          done === 0 && state.removed === 0 ? (
            <EmptyQueue search={search} mode={queue.mode} />
          ) : levelUp ? null : (
            // Waits for a level-up moment on the last answer, so its count-ups are seen.
            <SessionSummary
              history={state.history}
              elapsed={now !== null && startedAt !== null ? now - startedAt : 0}
              xp={state.xp}
              coins={coins}
              bestCombo={state.bestCombo}
              startXp={startXp}
              streak={state.streak}
              reschedules={queue.reschedules}
              animate={motionOk}
              search={search}
            />
          )
        ) : !card ? (
          <div className="study-wait">
            <p className="eyebrow">Learning cards</p>
            <p className="study-wait__title">Next card in</p>
            <p className="study-wait__clock tabular">
              {now !== null && state.waitingUntil !== null ? clock(state.waitingUntil - now) : '…'}
            </p>
            <p className="study-wait__note">
              {state.learning.length} {state.learning.length === 1 ? 'card is waiting for its' : 'cards are waiting for their'}{' '}
              next learning step.
            </p>
            <div className="study-wait__actions">
              <button type="button" className="btn btn--primary" onClick={() => dispatch({ type: 'showNow' })}>
                Show now
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => dispatch({ type: 'finish' })}>
                Finish session
              </button>
            </div>
          </div>
        ) : (
          <div className="study-layout">
            <div className="study-main">
              <div className="study-card-wrap">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.article
                    key={currentKey}
                    ref={setCardRef}
                    tabIndex={-1}
                    className={clsx('study-card', state.revealed && 'is-revealed')}
                    aria-live="polite"
                    initial={reduceMotion || !prefs.animate ? false : { opacity: 0, y: 24, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={
                      reduceMotion || !prefs.animate ? { opacity: 0 } : { opacity: 0, y: -16, transition: { duration: 0.18 } }
                    }
                    transition={{ type: 'spring', stiffness: 360, damping: 32 }}
                  >
                    <div className="study-card__meta">
                      {deck && <span className="study-card__deck">{deck.path}</span>}
                      <span className={`study-card__kind study-card__kind--${card.kind}`}>
                        <span className="dot" />
                        {KIND_LABEL[card.kind]}
                      </span>
                    </div>
                    <div className="study-card__body">
                      <CardText text={card.front} className={`study-card__front study-card__front--${sizeFor(card.front)}`} />
                      {card.hint && <p className="study-card__hint">{card.hint}</p>}
                      {state.revealed && (
                        <motion.div
                          className="study-card__answer"
                          initial={reduceMotion || !prefs.animate ? false : { opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.22 }}
                        >
                          <CardText text={card.back} className="study-card__back" />
                          {card.extra && <CardText text={card.extra} className="study-card__extra" />}
                        </motion.div>
                      )}
                    </div>
                  </motion.article>
                </AnimatePresence>
                <div className="study-floaters" aria-hidden>
                  <AnimatePresence>
                    {floaters.map((f) => (
                      <motion.span
                        key={f.id}
                        className={`study-floater study-floater--${f.key}`}
                        initial={{ opacity: 0, y: 0, scale: 0.8 }}
                        animate={{ opacity: [0, 1, 1, 0], y: -48, scale: 1 }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      >
                        <Zap size={13} fill="currentColor" />+{f.xp} XP
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
                {/* Combo milestones rise on the other side, opposite the XP. */}
                <div className="study-floaters study-floaters--start" aria-hidden>
                  <AnimatePresence>
                    {pops.map((p) =>
                      p.kind === 'combo' ? (
                        <motion.span
                          key={p.id}
                          className={`study-pop study-pop--combo study-pop--t${comboTier(p.combo)}`}
                          initial={{ opacity: 0, y: 0, scale: motionOk ? 0.6 : 1 }}
                          animate={{ opacity: [0, 1, 1, 0], y: motionOk ? -40 : 0, scale: 1 }}
                          transition={{ duration: 1.3, ease: 'easeOut' }}
                        >
                          <Flame size={13} fill="currentColor" />×{p.combo} combo
                        </motion.span>
                      ) : null,
                    )}
                  </AnimatePresence>
                </div>
                {/* Lucky finds, centred near the top of the card; they fade out by themselves. */}
                <div className="study-pops" role="status" aria-live="polite">
                  <AnimatePresence>
                    {pops.map((p) =>
                      p.kind === 'lucky' ? (
                        <motion.span
                          key={p.id}
                          className="study-pop study-pop--lucky"
                          initial={motionOk ? { opacity: 0, y: 12, scale: 0.6 } : { opacity: 0 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={motionOk ? { opacity: 0, y: -20, transition: { duration: 0.4 } } : { opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 520, damping: 15 }}
                        >
                          <motion.span
                            className="study-pop__coin"
                            initial={motionOk ? { rotateY: 0 } : false}
                            animate={{ rotateY: 360 }}
                            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
                          >
                            <Coins size={16} aria-hidden />
                          </motion.span>
                          Lucky find! <strong>+{fmtInt(p.coins)} coins</strong>
                        </motion.span>
                      ) : null,
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="study-dock">
                {!state.revealed ? (
                  <button type="button" className="btn btn--primary study-reveal" onClick={reveal}>
                    Show answer <Kbd>Space</Kbd>
                  </button>
                ) : (
                  <div className="study-grades" role="group" aria-label="How well did you remember?">
                    {RATINGS.map(({ rating, label, key }) => (
                      <button
                        key={rating}
                        type="button"
                        className={`study-grade study-grade--${key}`}
                        onClick={() => grade(rating)}
                        disabled={busy}
                      >
                        {prefs.showIntervals && (
                          <span className="study-grade__interval tabular">
                            {queue.reschedules ? (intervals?.[rating] ?? '') : rating === 1 ? 'again soon' : 'done'}
                          </span>
                        )}
                        <span className="study-grade__label">{label}</span>
                        <Kbd>{rating}</Kbd>
                      </button>
                    ))}
                  </div>
                )}
                <div className="study-tools" role="toolbar" aria-label="Card actions">
                  {CARD_ACTIONS.map(({ id, label, key, icon: Icon, blurb }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={actions[id].run}
                      disabled={actions[id].disabled}
                      aria-label={label}
                      aria-keyshortcuts={key}
                      title={`${blurb} (${key})`}
                    >
                      <Icon size={15} /> <span>{label}</span> <Kbd>{key}</Kbd>
                    </button>
                  ))}
                  <button
                    type="button"
                    className="study-tools__info"
                    onClick={() => setPanel('actions')}
                    aria-label="What do these actions do?"
                    aria-haspopup="dialog"
                    title="What do these actions do?"
                  >
                    <Info size={15} />
                  </button>
                </div>
              </div>
            </div>

            <aside className="study-actions" aria-labelledby="study-actions-title">
              <p id="study-actions-title" className="study-actions__title">
                Card actions
              </p>
              <ul className="study-actions__list">
                {CARD_ACTIONS.map(({ id, label, key, icon: Icon, blurb }) => (
                  <li key={id}>
                    <button
                      type="button"
                      className="study-action"
                      onClick={actions[id].run}
                      disabled={actions[id].disabled}
                      aria-label={label}
                      aria-describedby={`study-action-${id}`}
                      aria-keyshortcuts={key}
                    >
                      <span className="study-action__icon" aria-hidden>
                        <Icon size={15} />
                      </span>
                      <span className="study-action__label">{label}</span>
                      <Kbd>{key}</Kbd>
                      <span id={`study-action-${id}`} className="study-action__blurb">
                        {blurb}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        )}
      </main>

      <AnimatePresence>
        {levelUp && (
          <LevelUpOverlay
            key={levelUp.level}
            level={levelUp.level}
            title={levelUp.title}
            rankUp={levelUp.rankUp}
            onDone={closeLevelUp}
          />
        )}
      </AnimatePresence>

      {panel === 'keys' && <ShortcutsSheet onClose={() => setPanel('none')} />}
      {panel === 'actions' && <CardActionsSheet onClose={() => setPanel('none')} />}
      {panel === 'edit' && card && <EditCardModal card={card} onSave={saveEdit} onClose={() => setPanel('none')} />}
      {panel === 'exit' && (
        <div className="study-modal" role="dialog" aria-modal="true" aria-labelledby="exit-title">
          <div className="study-modal__panel study-modal__panel--sm">
            <h2 id="exit-title" className="study-modal__title">
              End this session?
            </h2>
            <p className="study-modal__text">
              {queue.reschedules
                ? `Your ${done} ${done === 1 ? 'answer is' : 'answers are'} saved. ${left.total} ${left.total === 1 ? 'card stays' : 'cards stay'} in the queue.`
                : 'Practice answers aren’t saved.'}
            </p>
            <div className="study-modal__actions">
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPanel('none')} autoFocus>
                Keep studying
              </button>
              <Link to="/dashboard" className="btn btn--primary btn--sm">
                End session
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="toasts" role="status" aria-live="polite">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              className={`toast toast--study-${t.tone}`}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
            >
              <span className="toast__icon">
                {t.tone === 'flame' ? <Flame size={17} fill="currentColor" /> : <Zap size={17} />}
              </span>
              <div className="toast__text">
                <p className="toast__title">{t.title}</p>
                {t.detail && <p className="toast__detail">{t.detail}</p>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
