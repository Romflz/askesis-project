import clsx from 'clsx'
import {
  BookOpen,
  CalendarHeart,
  ChevronDown,
  Cog,
  Compass,
  Crown,
  Flag,
  Flame,
  FlameKindling,
  Footprints,
  Hash,
  Headphones,
  HeartPulse,
  Hourglass,
  Infinity as InfinityIcon,
  Layers,
  Link as LinkIcon,
  Lock,
  Moon,
  Mountain,
  Network,
  RotateCcw,
  Shuffle,
  Sparkles,
  Sprout,
  Sunrise,
  Target,
  Telescope,
  Tent,
  Timer,
  TreeDeciduous,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { type Achievement, type AchievementIcon, type AchievementTier, daysBetween, formatDay } from '@askesis/core'
import { fmtCompact, fmtInt } from '../../lib/format.ts'
import { useSession } from './session.tsx'
import { Meter, PanelHeader } from './ui.tsx'

const ICONS: Record<AchievementIcon, LucideIcon> = {
  spark: Sparkles,
  hundred: Hash,
  run: Footprints,
  flame: FlameKindling,
  fire: Flame,
  infinity: InfinityIcon,
  crown: Crown,
  layers: Layers,
  mountain: Mountain,
  tree: TreeDeciduous,
  network: Network,
  target: Target,
  sunrise: Sunrise,
  moon: Moon,
  shuffle: Shuffle,
  hourglass: Hourglass,
  rebound: RotateCcw,
  book: BookOpen,
  cog: Cog,
  tent: Tent,
  compass: Compass,
  sprout: Sprout,
  revive: HeartPulse,
  zap: Zap,
  timer: Timer,
  headphones: Headphones,
  flag: Flag,
  chain: LinkIcon,
  calendar: CalendarHeart,
  telescope: Telescope,
}

const TIERS: AchievementTier[] = ['bronze', 'silver', 'gold', 'platinum']
type Filter = 'all' | 'unlocked' | 'locked'

// How many trophies the collapsed grid shows at each breakpoint: two or three
// full rows. Keep in sync with `.trophies__grid.is-collapsed`. The toggle hides
// itself (`fits-*`) where the preview already shows everything.
const PREVIEW = { base: 6, sm: 8, lg: 9, xl: 12 }

/** Unlocked trophies first, newest first; then locked ones, closest to done first. */
function order(list: Achievement[]): Achievement[] {
  const unlocked = list.filter((a) => a.unlockedAt).sort((a, b) => b.unlockedAt!.localeCompare(a.unlockedAt!))
  const locked = list.filter((a) => !a.unlockedAt).sort((a, b) => b.value / b.target - a.value / a.target)
  return [...unlocked, ...locked]
}

/** Every trophy with its progress, filterable, and collapsed to a few rows until expanded. */
export function Trophies() {
  const { data } = useSession()
  const [filter, setFilter] = useState<Filter>('all')
  const [expanded, setExpanded] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  const all = data.achievements
  const unlockedCount = all.filter((a) => a.unlockedAt).length
  const shown = order(all).filter((a) => (filter === 'all' ? true : filter === 'unlocked' ? a.unlockedAt : !a.unlockedAt))
  const noun = filter === 'all' ? 'trophies' : filter === 'unlocked' ? 'unlocked' : 'in progress'

  const collapse = () => {
    setExpanded(false)
    // The list shrinks above the button; bring it back under the pointer.
    requestAnimationFrame(() => toggle.current?.scrollIntoView({ block: 'nearest' }))
  }

  return (
    <section className="panel trophies" id="trophies" aria-labelledby="trophies-title">
      <PanelHeader
        eyebrow="Trophies"
        title={
          <span id="trophies-title">
            {unlockedCount} of {all.length} unlocked
          </span>
        }
        aside={
          <div className="segmented" role="group" aria-label="Filter trophies">
            {(['all', 'unlocked', 'locked'] as Filter[]).map((f) => (
              <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : f === 'unlocked' ? 'Unlocked' : 'In progress'}
              </button>
            ))}
          </div>
        }
      />

      <ul className="trophies__tiers" aria-label="By tier">
        {TIERS.map((tier) => {
          const inTier = all.filter((a) => a.tier === tier)
          return (
            <li key={tier} className={`tier-pill tier-pill--${tier}`}>
              <span className="tier-pill__gem" />
              <span className="tier-pill__name">{tier}</span>
              <span className="tabular">
                {inTier.filter((a) => a.unlockedAt).length}/{inTier.length}
              </span>
            </li>
          )
        })}
      </ul>

      <ul id="trophies-grid" className={clsx('trophies__grid', !expanded && 'is-collapsed')}>
        {shown.map((a) => {
          const unlocked = a.unlockedAt !== null
          const hidden = a.secret && !unlocked
          const Icon = hidden ? Lock : ICONS[a.icon]
          const fresh = unlocked && daysBetween(a.unlockedAt!, data.today) <= 14
          // Big targets read better compact: "12.5K / 25K".
          const fmtCount = a.target >= 10_000 ? fmtCompact : fmtInt
          return (
            <li key={a.id} className={clsx('trophy', `trophy--${a.tier}`, unlocked ? 'is-unlocked' : 'is-locked')}>
              <div className="trophy__medal" aria-hidden>
                <Icon size={22} strokeWidth={2} />
              </div>
              <div className="trophy__body">
                <div className="trophy__head">
                  <p className="trophy__name">{hidden ? 'Secret trophy' : a.name}</p>
                  {fresh && <span className="trophy__new">New</span>}
                </div>
                <p className="trophy__desc">{hidden ? 'Keep studying to reveal it.' : a.description}</p>
                {unlocked ? (
                  <p className="trophy__meta">
                    <span className={`trophy__tier trophy__tier--${a.tier}`}>{a.tier}</span>
                    Unlocked {formatDay(a.unlockedAt!, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                ) : (
                  !hidden && (
                    <div className="trophy__progress">
                      <Meter value={a.value / a.target} color={`var(--tier-${a.tier})`} label={`${a.name} progress`} />
                      <span className="tabular">
                        {fmtCount(a.value)} / {fmtCount(a.target)}
                      </span>
                    </div>
                  )
                )}
              </div>
            </li>
          )
        })}
      </ul>

      {shown.length > PREVIEW.base && (
        <button
          ref={toggle}
          type="button"
          className={clsx(
            'btn btn--ghost btn--sm trophies__more',
            shown.length <= PREVIEW.sm && 'fits-sm',
            shown.length <= PREVIEW.lg && 'fits-lg',
            shown.length <= PREVIEW.xl && 'fits-xl',
          )}
          aria-expanded={expanded}
          aria-controls="trophies-grid"
          onClick={expanded ? collapse : () => setExpanded(true)}
        >
          {expanded ? 'Show fewer' : `Show all ${shown.length} ${noun}`}
          <ChevronDown size={16} aria-hidden />
        </button>
      )}
    </section>
  )
}
