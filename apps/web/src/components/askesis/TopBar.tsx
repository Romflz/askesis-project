import { type SessionUser, SUPPORT_TIERS } from '@askesis/contracts'
import { Link } from '@tanstack/react-router'
import clsx from 'clsx'
import {
  BookOpen,
  ChartColumn,
  Download,
  Flame,
  GraduationCap,
  Heart,
  House,
  Layers,
  LayoutDashboard,
  LogIn,
  type LucideIcon,
  Menu,
  Moon,
  Settings,
  Share,
  Sparkles,
  SquarePlus,
  Sun,
  X,
} from 'lucide-react'
import { type ReactNode, useEffect, useId, useRef, useState } from 'react'
import { fmtInt } from '../../lib/format.ts'
import { GITHUB_URL } from '../../lib/links.ts'
import { canInstall, INSTALL_DETECT_SCRIPT, type InstallMode, installMode, promptInstall } from '../../lib/pwa.ts'
import { GitHubMark } from './brands.tsx'
import { CoinCount, Ring } from './ui.tsx'

export function Logo({ size = 30 }: { size?: number }) {
  // A memory trace: a signal that climbs and settles on a bright node.
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="logo">
      <rect width="32" height="32" rx="9" fill="var(--accent)" />
      <path
        d="M6.5 19.5 11.5 12l5 8 4-5.5 3.5 2"
        fill="none"
        stroke="var(--on-accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24.5" cy="16.5" r="2.75" fill="var(--on-accent)" />
    </svg>
  )
}

const THEME_KEY = 'askesis-theme'

// The app was called Engram before; this moves what browsers saved under the old
// keys (theme, sound, study options, seen trophies) to the new ones, once.
const LEGACY_KEYS_SCRIPT = `try{Object.keys(localStorage).forEach(function(k){if(k.indexOf('engram')!==0)return;var n='askesis'+k.slice(6);if(localStorage.getItem(n)===null)localStorage.setItem(n,localStorage.getItem(k));localStorage.removeItem(k)});document.cookie='engram_tz=;path=/;max-age=0'}catch(e){}`

/**
 * Runs before first paint (inlined in <head>): applies the stored theme so it
 * never flashes, records the device's time zone in a cookie so a new account's
 * study day rolls over at local time from the first request, and marks whether
 * the browser can install the app (so the Install button never pops in).
 */
export const themeScript = `${LEGACY_KEYS_SCRIPT}try{var t=localStorage.getItem('${THEME_KEY}');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}try{document.cookie='askesis_tz='+encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone)+';path=/;max-age=31536000;samesite=lax'}catch(e){}${INSTALL_DETECT_SCRIPT}`

function ThemeToggle() {
  function toggle() {
    const root = document.documentElement
    const current = root.dataset.theme ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    const next = current === 'dark' ? 'light' : 'dark'
    root.dataset.theme = next
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      // Storage can be unavailable (private mode); the toggle still works for this page.
    }
  }
  return (
    <button type="button" className="icon-btn" onClick={toggle} aria-label="Toggle color theme">
      <Sun size={17} className="theme-icon-light" />
      <Moon size={17} className="theme-icon-dark" />
    </button>
  )
}

const INSTALL_HELP: Record<InstallMode, { title: string; steps: ReactNode[] }> = {
  ios: {
    title: 'Add Askesis to your Home Screen',
    steps: [
      <>
        Tap <Share size={15} aria-hidden className="install-pop__glyph" /> Share in Safari’s toolbar.
      </>,
      <>
        Choose <SquarePlus size={15} aria-hidden className="install-pop__glyph" /> <strong>Add to Home Screen</strong>.
      </>,
    ],
  },
  safari: {
    title: 'Add Askesis to your Dock',
    steps: [
      <>
        In the menu bar, choose <strong>File → Add to Dock</strong>.
      </>,
    ],
  },
  prompt: {
    title: 'Install Askesis',
    steps: [
      <>
        Use the install icon at the end of the address bar, or open the browser menu and choose <strong>Install Askesis</strong>{' '}
        (on phones, <strong>Add to Home screen</strong>).
      </>,
      <>If neither is there, Askesis is probably installed already.</>,
    ],
  },
  android: {
    title: 'Install Askesis',
    steps: [
      <>
        Open the browser menu <strong>⋮</strong> and choose <strong>Install</strong> or <strong>Add to Home screen</strong>.
      </>,
      <>Askesis then opens from your home screen like any other app.</>,
    ],
  },
  firefox: {
    title: 'Firefox can’t install web apps yet',
    steps: [
      <>
        To get Askesis as its own app with reminders, open it in <strong>Chrome</strong>, <strong>Edge</strong> or{' '}
        <strong>Brave</strong> and click <strong>Install app</strong> there.
      </>,
      <>
        Staying in Firefox? Right-click this tab and choose <strong>Pin Tab</strong> to keep Askesis one click away.
      </>,
      <>On Android, Firefox can install it: menu ⋮ → Install.</>,
    ],
  },
  other: {
    title: 'Install Askesis',
    steps: [
      <>
        Look for <strong>Install</strong> or <strong>Add to Home screen</strong> in your browser’s menu.
      </>,
      <>
        If your browser doesn’t offer it, open Askesis in <strong>Chrome</strong>, <strong>Edge</strong> or{' '}
        <strong>Safari</strong> to install it.
      </>,
    ],
  },
}

/**
 * "Install app": the browser's own install dialog where there is one
 * (Chromium), otherwise a short how-to for the browser in use (iOS, macOS
 * Safari, Android, Firefox). Always in the server markup; CSS shows it only
 * when <html data-install> says the browser can install the app, so it's laid
 * out before first paint.
 */
function InstallButton() {
  const [help, setHelp] = useState<InstallMode | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const popId = useId()

  useEffect(() => {
    if (!help) return
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setHelp(null)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setHelp(null)
      wrapRef.current?.querySelector<HTMLButtonElement>('.topbar__install')?.focus()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [help])

  async function install() {
    if (help) return setHelp(null)
    if (canInstall()) {
      await promptInstall()
      return
    }
    setHelp(installMode() ?? 'prompt')
  }

  return (
    <div className="topbar__install-wrap" ref={wrapRef}>
      <button
        type="button"
        className="btn btn--ghost btn--sm topbar__install"
        onClick={() => void install()}
        aria-expanded={help !== null}
        aria-controls={help ? popId : undefined}
        title="Install Askesis as an app"
      >
        <Download size={16} aria-hidden />
        <span className="topbar__install-label">Install app</span>
      </button>
      {help && (
        <div className="install-pop" id={popId} role="dialog" aria-label={INSTALL_HELP[help].title}>
          <p className="install-pop__title">{INSTALL_HELP[help].title}</p>
          <ol className="install-pop__steps">
            {INSTALL_HELP[help].steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
          {help !== 'firefox' && (
            <p className="install-pop__note">It opens in its own window, with reminders and no browser tabs.</p>
          )}
        </div>
      )}
    </div>
  )
}

export interface TopBarStats {
  streak: number
  studiedToday: boolean
  level: number
  levelProgress: number
  coins?: number
}

type NavTarget = '/' | '/dashboard' | '/study' | '/decks' | '/analytics' | '/practice' | '/docs' | '/settings'
type NavItem = { label: string; to: NavTarget; icon: LucideIcon }

// Visitors see the public site; signed-in users get the app.
const PUBLIC_NAV: NavItem[] = [
  { label: 'Home', to: '/', icon: House },
  { label: 'Practice', to: '/practice', icon: Sparkles },
  { label: 'Analytics', to: '/analytics', icon: ChartColumn },
  { label: 'Docs', to: '/docs', icon: BookOpen },
]

const APP_NAV: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Study', to: '/study', icon: GraduationCap },
  { label: 'Decks', to: '/decks', icon: Layers },
  { label: 'Analytics', to: '/analytics', icon: ChartColumn },
  { label: 'Practice', to: '/practice', icon: Sparkles },
  { label: 'Docs', to: '/docs', icon: BookOpen },
]

// Phones get an app-style tab bar instead of the top links.
const TABS: NavItem[] = [
  { label: 'Today', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Study', to: '/study', icon: GraduationCap },
  { label: 'Decks', to: '/decks', icon: Layers },
  { label: 'Settings', to: '/settings', icon: Settings },
]

/**
 * The header on every page. `stats` (streak, level, coins) comes from the
 * dashboard for signed-in users; other pages leave it out. Visitors get a menu
 * sheet on phones; signed-in users get a bottom tab bar instead.
 */
export function TopBar({ user, stats }: { user: SessionUser | null; stats?: TopBarStats }) {
  const [menuOpen, setMenuOpen] = useState(false)
  // Esc closes the phone menu.
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])
  const nav = user ? APP_NAV : PUBLIC_NAV
  // Supporters get a heart badge on their avatar and their tier in its tooltip.
  const supporterTier = user?.supportLevel ? SUPPORT_TIERS[user.supportLevel] : null
  return (
    <>
      <header className="topbar">
        <div className="topbar__inner">
          <Link to={user ? '/dashboard' : '/'} className="topbar__brand" aria-label="Askesis home">
            <Logo />
            <span className="topbar__wordmark">askesis</span>
          </Link>

          <nav className="topbar__nav" aria-label="Main">
            {nav.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="topbar__link"
                activeOptions={{ exact: item.to === '/' }}
                activeProps={{ 'aria-current': 'page' }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className={clsx('topbar__actions', !user && 'is-guest')}>
            {stats && (
              <>
                <span
                  className={clsx('topbar__pill topbar__pill--streak', !stats.studiedToday && 'is-at-risk')}
                  title={stats.studiedToday ? 'Streak extended today' : 'Review today to keep your streak'}
                >
                  <Flame size={16} strokeWidth={2.25} />
                  <span className="tabular">{fmtInt(stats.streak)}</span>
                  <span className="sr-only">day streak</span>
                </span>
                <span className="topbar__pill" title={`Level ${stats.level}`}>
                  <Ring value={stats.levelProgress} size={20} stroke={3} color="var(--xp)" />
                  <span>
                    <span className="topbar__pill-label">Lv</span> {stats.level}
                  </span>
                </span>
                {stats.coins !== undefined && (
                  <Link to="/shop" className="topbar__pill topbar__pill--coins" title="Shop · coming soon">
                    <CoinCount value={stats.coins} />
                  </Link>
                )}
              </>
            )}
            <InstallButton />
            <a
              href={GITHUB_URL}
              className="icon-btn topbar__github"
              target="_blank"
              rel="noreferrer"
              aria-label="Askesis on GitHub"
              title="Askesis on GitHub"
            >
              <GitHubMark />
            </a>
            <ThemeToggle />
            {user ? (
              <Link
                to="/settings"
                className="topbar__avatar"
                title={`${user.username ? `@${user.username}` : user.name}${supporterTier ? ` · Askesis ${supporterTier}` : ''} · Settings`}
              >
                {initials(user.name)}
                {supporterTier && (
                  <span
                    className={`supporter-badge supporter-badge--${user.supportLevel}`}
                    aria-label={`Askesis ${supporterTier}`}
                  >
                    <Heart size={9} fill="currentColor" strokeWidth={0} aria-hidden />
                  </span>
                )}
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn--ghost btn--sm topbar__signin">
                  Sign in
                </Link>
                <Link to="/register" className="btn btn--primary btn--sm">
                  Get started
                </Link>
                <button
                  type="button"
                  className="icon-btn topbar__menu-btn"
                  aria-label="Menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((o) => !o)}
                >
                  {/* Keyed so the new icon plays its turn-in animation when the menu toggles. */}
                  <span key={menuOpen ? 'close' : 'open'} className="topbar__menu-icon">
                    {menuOpen ? <X size={18} /> : <Menu size={18} />}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Always rendered for visitors so it can animate open and closed; inert while closed. */}
        {!user && (
          <nav className={clsx('topbar__sheet', menuOpen && 'is-open')} aria-label="Main" inert={!menuOpen}>
            <div className="topbar__sheet-inner">
              {[...nav, { label: 'Sign in', to: '/login' as const, icon: LogIn }].map((item, i) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="topbar__sheet-link"
                  style={{ '--i': i } as React.CSSProperties}
                  onClick={() => setMenuOpen(false)}
                >
                  <item.icon size={17} />
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>

      {user && (
        <nav className="tabbar" aria-label="App">
          {TABS.map((tab) => (
            <Link key={tab.label} to={tab.to} className="tabbar__item" activeProps={{ 'aria-current': 'page' }}>
              <tab.icon size={20} />
              <span>{tab.label}</span>
            </Link>
          ))}
        </nav>
      )}
    </>
  )
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('')
}
