import type { AchievementTier } from '@askesis/core'
import type { ChestResult, RewardResult } from '@askesis/contracts'
import { type Dashboard, levelInfo, rollChest } from '@askesis/core'
import { createContext, type ReactNode, useCallback, useContext, useMemo, useReducer, useRef } from 'react'
import type { LoginPromptCopy } from './LoginPrompt.tsx'

// Client-side state for the dashboard (the public home page and /dashboard).
// The server snapshot seeds it; opening the chest and claiming quests update XP
// and coins right away. Both go through `rewards` on a live dashboard; the demo
// simulates them. Studying happens in the full session (/study/session).

export type SessionEvent =
  | { id: number; type: 'claimed'; title: string; xp: number; coins: number }
  | { id: number; type: 'bonus'; xp: number; coins: number }
  | { id: number; type: 'welcome'; xp: number; coins: number }
  | { id: number; type: 'trophy'; title: string; tier: AchievementTier }
  | { id: number; type: 'level'; level: number; title: string; rankUp: boolean }
  | { id: number; type: 'error'; message: string }

/** An event before the session gives it an id (Omit distributed over each member of the union). */
export type NewEvent = SessionEvent extends infer E ? (E extends SessionEvent ? Omit<E, 'id'> : never) : never

/** Server calls for rewards on a live dashboard. */
export interface RewardApi {
  openChest: () => Promise<ChestResult>
  claimQuest: (id: string) => Promise<RewardResult>
}

interface State {
  data: Dashboard
  events: SessionEvent[]
  nextEventId: number
  /** A full-screen moment (the chest) is up; the level-up waits for it. */
  overlay: boolean
  /** A visitor on the home page: no level-ups, and account-only actions ask them to log in. */
  guest: boolean
  /** The login popup a visitor triggered, if any. */
  loginPrompt: LoginPromptCopy | null
}

type Action =
  | { type: 'chest'; result: ChestResult }
  | { type: 'claimed'; id: string; result: RewardResult }
  | { type: 'notify'; events: NewEvent[] }
  | { type: 'overlay'; open: boolean }
  | { type: 'login'; copy: LoginPromptCopy | null }
  | { type: 'dismiss'; id: number }
  | { type: 'error'; message: string }

function init({ data, guest }: { data: Dashboard; guest: boolean }): State {
  return {
    data,
    events: [],
    nextEventId: 1,
    overlay: false,
    guest,
    loginPrompt: null,
  }
}

/** Adds events, plus a level-up event when the XP gain crosses a level. */
function withEvents(state: State, data: Dashboard, events: NewEvent[]): State {
  let id = state.nextEventId
  const all = [...state.events, ...events.map((e) => ({ ...e, id: id++ }) as SessionEvent)]
  const before = levelInfo(state.data.totalXp)
  const after = levelInfo(data.totalXp)
  if (!state.guest && after.level > before.level) {
    all.push({
      id: id++,
      type: 'level',
      level: after.level,
      title: after.title,
      rankUp: after.title !== before.title,
    })
  }
  return { ...state, data, events: all, nextEventId: id }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'dismiss':
      return { ...state, events: state.events.filter((e) => e.id !== action.id) }
    case 'error':
      return withEvents(state, state.data, [{ type: 'error', message: action.message }])
    case 'chest': {
      // The chest ceremony is the celebration, so no toast here.
      const { xp, coins, freeze } = action.result
      const data = {
        ...state.data,
        totalXp: state.data.totalXp + xp,
        coins: state.data.coins + coins,
        chest: { ...state.data.chest, opened: { xp, coins } },
        streak: freeze ? { ...state.data.streak, freezes: state.data.streak.freezes + 1 } : state.data.streak,
      }
      return withEvents(state, data, [])
    }
    case 'claimed': {
      const { xp, coins, bonus } = action.result
      const quest = state.data.quests.find((q) => q.id === action.id)
      const data = {
        ...state.data,
        totalXp: state.data.totalXp + xp + (bonus?.xp ?? 0),
        coins: state.data.coins + coins + (bonus?.coins ?? 0),
        quests: state.data.quests.map((q) => (q.id === action.id ? { ...q, claimed: true } : q)),
        questBonus: bonus ? { ...state.data.questBonus, claimed: true } : state.data.questBonus,
      }
      return withEvents(state, data, [
        { type: 'claimed', title: quest?.title ?? 'Quest', xp, coins },
        ...(bonus ? [{ type: 'bonus' as const, ...bonus }] : []),
      ])
    }
    case 'notify':
      return withEvents(state, state.data, action.events)
    case 'overlay':
      return { ...state, overlay: action.open }
    case 'login':
      return { ...state, loginPrompt: action.copy }
  }
}

interface SessionValue extends State {
  dismiss: (id: number) => void
  /** Each resolves to the reward, or null when it failed (an error toast explains). */
  openChest: () => Promise<ChestResult | null>
  claimQuest: (id: string) => Promise<RewardResult | null>
  notify: (...events: NewEvent[]) => void
  setOverlay: (open: boolean) => void
  /** Visitors: show (or with null, close) the login popup. */
  promptLogin: (copy: LoginPromptCopy | null) => void
}

const SessionContext = createContext<SessionValue | null>(null)

/**
 * `rewards` claims rewards on a live dashboard. Without it the chest and quests
 * are a local preview, as on the public home page.
 */
export function SessionProvider({
  data,
  rewards,
  guest = false,
  children,
}: {
  data: Dashboard
  rewards?: RewardApi
  /** A visitor on the home page: everything works, nothing is saved. */
  guest?: boolean
  children: ReactNode
}) {
  const [state, dispatch] = useReducer(reducer, { data, guest }, init)
  // Reward calls read the latest state without re-creating the callbacks.
  const latest = useRef(state)
  latest.current = state

  const dismiss = useCallback((id: number) => dispatch({ type: 'dismiss', id }), [])

  const openChest = useCallback(async () => {
    const { chest } = latest.current.data
    if (chest.opened) return null
    try {
      const result = rewards
        ? await rewards.openChest()
        : {
            ...rollChest(chest.tier, chest.weekly),
            tier: chest.tier,
            weekly: chest.weekly,
            freeze: chest.weekly && latest.current.data.streak.freezes < latest.current.data.streak.maxFreezes,
          }
      dispatch({ type: 'chest', result })
      return result
    } catch {
      dispatch({ type: 'error', message: 'The chest didn’t open. Reload and try again.' })
      return null
    }
  }, [rewards])

  const claimQuest = useCallback(
    async (id: string) => {
      const { quests, questBonus } = latest.current.data
      const quest = quests.find((q) => q.id === id)
      if (!quest || quest.claimed || quest.progress < quest.target) return null
      try {
        const lastOne = quests.every((q) => q.id === id || q.claimed) && !questBonus.claimed
        const result = rewards
          ? await rewards.claimQuest(id)
          : { xp: quest.xp, coins: quest.coins, ...(lastOne && { bonus: { xp: questBonus.xp, coins: questBonus.coins } }) }
        dispatch({ type: 'claimed', id, result })
        return result
      } catch {
        dispatch({ type: 'error', message: 'That reward wasn’t claimed. Reload and try again.' })
        return null
      }
    },
    [rewards],
  )

  const notify = useCallback((...events: NewEvent[]) => dispatch({ type: 'notify', events }), [])
  const setOverlay = useCallback((open: boolean) => dispatch({ type: 'overlay', open }), [])
  const promptLogin = useCallback((copy: LoginPromptCopy | null) => dispatch({ type: 'login', copy }), [])

  const value = useMemo(
    () => ({ ...state, dismiss, openChest, claimQuest, notify, setOverlay, promptLogin }),
    [state, dismiss, openChest, claimQuest, notify, setOverlay, promptLogin],
  )
  return <SessionContext value={value}>{children}</SessionContext>
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext)
  if (!value) throw new Error('useSession must be used inside <SessionProvider>')
  return value
}
