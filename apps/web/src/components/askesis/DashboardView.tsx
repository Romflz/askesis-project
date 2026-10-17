import type { SessionUser } from '@askesis/contracts'
import { type Dashboard, formatDay, levelInfo } from '@askesis/core'
import type { ReactNode } from 'react'
import { fmtInt } from '../../lib/format.ts'
import { ActivityHeatmap } from './ActivityHeatmap.tsx'
import { ChestCard } from './ChestCard.tsx'
import { DashboardMoments } from './DashboardMoments.tsx'
import { DeckTree } from './DeckTree.tsx'
import { InsightsChart } from './InsightsChart.tsx'
import { LoginPrompt } from './LoginPrompt.tsx'
import { LevelCard } from './LevelCard.tsx'
import { QuestsCard } from './QuestsCard.tsx'
import { type RewardApi, SessionProvider, useSession } from './session.tsx'
import { AnswerBreakdown, BestHourChart, CollectionCard } from './StatCards.tsx'
import { StreakCard } from './StreakCard.tsx'
import { TodayHero } from './TodayHero.tsx'
import { Toasts } from './Toasts.tsx'
import { TopBar } from './TopBar.tsx'
import { Trophies } from './Trophies.tsx'

/**
 * The full dashboard. The public home page renders it with simulated data; the
 * signed-in /dashboard renders it with the user's collection and `rewards`.
 * `children` are extra sections below the grid: the perks of a free account for
 * visitors, then the Patreon support section that closes both pages.
 */
export function DashboardView({
  data,
  user,
  rewards,
  guest = false,
  children,
}: {
  data: Dashboard
  user: SessionUser | null
  rewards?: RewardApi
  /** A signed-out visitor: everything is visible; account-only actions open a login popup. */
  guest?: boolean
  children?: ReactNode
}) {
  return (
    <SessionProvider data={data} rewards={rewards} guest={guest}>
      <DashboardTopBar user={user} />
      <main className="home">
        <div className="home__grid">
          <div className="area-hero">
            <TodayHero user={user} />
          </div>
          <div className="area-side home__side">
            <StreakCard />
            <LevelCard />
          </div>
          <div className="area-decks">
            <DeckTree />
          </div>
          <div className="area-quests home__side">
            <ChestCard />
            <QuestsCard />
          </div>
          <div className="area-insights">
            <InsightsChart />
          </div>
          <div className="area-hours">
            <BestHourChart />
          </div>
          <div className="area-heatmap">
            <ActivityHeatmap />
          </div>
          <div className="area-stats home__side">
            <CollectionCard />
            <AnswerBreakdown />
          </div>
          <div className="area-trophies">
            <Trophies />
          </div>
        </div>
        {children}
        <Footer />
      </main>
      <Toasts />
      <DashboardMoments />
      {guest && <GuestLoginPrompt />}
    </SessionProvider>
  )
}

// The popup's copy lives in the session, so any card can open it with promptLogin().
function GuestLoginPrompt() {
  const { loginPrompt, promptLogin } = useSession()
  return <LoginPrompt copy={loginPrompt} redirect="/dashboard" onClose={() => promptLogin(null)} />
}

function DashboardTopBar({ user }: { user: SessionUser | null }) {
  const { data } = useSession()
  const level = levelInfo(data.totalXp)
  // No pills for visitors, nor for a signed-in user looking at the sample on the
  // home page: the demo's streak, level and coins aren't theirs.
  if (!user || data.isDemo) return <TopBar user={user} />
  return (
    <TopBar
      user={user}
      stats={{
        streak: data.streak.current,
        studiedToday: data.streak.studiedToday,
        level: level.level,
        levelProgress: level.progress,
        coins: data.coins,
      }}
    />
  )
}

function Footer() {
  const { data } = useSession()
  return (
    <footer className="home__footer">
      <span>
        {data.isDemo ? (
          'Free, open source and private: your cards stay yours.'
        ) : data.totals.reviews > 0 ? (
          <>
            {fmtInt(data.totals.reviews)} reviews over {fmtInt(data.totals.daysStudied)} days since{' '}
            {formatDay(data.totals.since, { month: 'long', year: 'numeric' })} · {fmtInt(data.totals.hours)} hours
          </>
        ) : (
          'Your first review starts the history.'
        )}
      </span>
      <span>
        Open source spaced repetition. Scheduling by SM-2 or{' '}
        <a href="https://github.com/open-spaced-repetition/ts-fsrs" target="_blank" rel="noreferrer">
          FSRS
        </a>
        .
      </span>
    </footer>
  )
}
