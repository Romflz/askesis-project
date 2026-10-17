import type { CardContent, Collection, CollectionCard, CollectionDeck, ReviewEntry } from './collection.ts'
import {
  answer,
  cardKind,
  isLearning,
  isMature,
  newMemory,
  retrievability,
  type Memory,
  type SchedulerPreset,
} from './schedule.ts'
import { addDays, type DayConfig, dayKey, dayStart, HOUR_MS, hourOf, localDayConfig } from './time.ts'
import type { Rating } from './types.ts'

// A deterministic, seeded simulation of one learner's last ~11 months, run
// through the real FSRS scheduler. It fills the dashboard and analytics that
// visitors see and the sample history a user can load (POST /me/sample), with
// every chart internally consistent.
//
// The output depends on the exact sequence of random numbers, so any change to
// what calls `rng()`, or in what order, changes the whole history.

const SEED = 0x5e1f
const HISTORY_DAYS = 340
/** The sample learner's daily goal, in reviews. */
export const DEMO_GOAL = 150

/** The sample learner schedules with FSRS at 90% desired retention. */
export const DEMO_PRESET_ID = 'demo-fsrs'
export const DEMO_PRESET: SchedulerPreset = {
  learningSteps: ['1m', '10m'],
  graduatingInterval: 1,
  easyInterval: 4,
  relearningSteps: ['10m'],
  minimumInterval: 1,
  maximumInterval: 36_500,
  startingEase: 2.5,
  easyBonus: 1.3,
  intervalModifier: 1,
  hardInterval: 1.2,
  newInterval: 0,
  fsrs: true,
  desiredRetention: 0.9,
}

interface DemoDeck extends Omit<CollectionDeck, 'presetId' | 'reviewsPerDay'> {
  size: number
  /** Day of the simulation the deck was added. */
  startDay: number
  /** Above 1 recalls better than the scheduler expects, below 1 worse. */
  skill: number
  content: CardContent[]
}

const DECKS: DemoDeck[] = [
  { id: 'ja', name: 'Japanese', parentId: null, icon: 'kana', newPerDay: 0, size: 0, startDay: 0, skill: 1, content: [] },
  {
    id: 'ja-vocab',
    name: 'Core Vocabulary',
    parentId: 'ja',
    icon: 'kana',
    newPerDay: 8,
    size: 6000,
    startDay: 0,
    skill: 0.97,
    content: [
      { front: '覚える', hint: 'おぼえる', back: 'to remember; to memorize' },
      { front: '忘れる', hint: 'わすれる', back: 'to forget' },
      { front: '記憶', hint: 'きおく', back: 'memory; recollection' },
      { front: '勉強', hint: 'べんきょう', back: 'study' },
      { front: '練習', hint: 'れんしゅう', back: 'practice; training' },
      { front: '毎日', hint: 'まいにち', back: 'every day' },
      { front: '図書館', hint: 'としょかん', back: 'library' },
      { front: '食べる', hint: 'たべる', back: 'to eat' },
    ],
  },
  {
    id: 'ja-kanji',
    name: 'Kanji',
    parentId: 'ja',
    icon: 'kana',
    newPerDay: 4,
    size: 2136,
    startDay: 45,
    skill: 0.9,
    content: [
      { front: '脳', hint: 'Kanji meaning', back: 'brain', extra: 'On: ノウ' },
      { front: '憶', hint: 'Kanji meaning', back: 'recollection; memory', extra: 'On: オク' },
      { front: '夢', hint: 'Kanji meaning', back: 'dream', extra: 'On: ム · Kun: ゆめ' },
      { front: '光', hint: 'Kanji meaning', back: 'light; ray', extra: 'On: コウ · Kun: ひかり' },
      { front: '学', hint: 'Kanji meaning', back: 'study; learning', extra: 'On: ガク · Kun: まな.ぶ' },
    ],
  },
  {
    id: 'neuro',
    name: 'Neuroscience',
    parentId: null,
    icon: 'brain',
    newPerDay: 3,
    size: 900,
    startDay: 20,
    skill: 1,
    content: [
      {
        front: 'Who coined the term “engram”?',
        back: 'Richard Semon, in 1904',
        extra: 'He used it for the physical trace a memory leaves in the brain.',
      },
      { front: 'Which structure is essential for forming new declarative memories?', back: 'The hippocampus' },
      {
        front: 'What is long-term potentiation (LTP)?',
        back: 'A lasting strengthening of synapses after high-frequency stimulation',
        extra: 'A leading cellular model of learning and memory.',
      },
      { front: 'What does the Ebbinghaus forgetting curve describe?', back: 'How retention decays over time without review' },
      { front: 'The main excitatory neurotransmitter in the CNS?', back: 'Glutamate' },
      { front: 'What does myelin do?', back: 'Insulates axons so signals travel faster' },
      {
        front: 'The Nernst equation for an ion’s equilibrium potential?',
        back: String.raw`\[E_{\text{ion}} = \frac{RT}{zF}\ln\frac{[\text{ion}]_{\text{out}}}{[\text{ion}]_{\text{in}}}\]`,
        extra: 'R gas constant, T temperature, z the ion’s charge, F Faraday’s constant.',
      },
    ],
  },
  {
    id: 'rust',
    name: 'Rust & Systems',
    parentId: null,
    icon: 'code',
    newPerDay: 3,
    size: 700,
    startDay: 105,
    skill: 1.03,
    content: [
      {
        front: 'What does the `?` operator do?',
        back: 'Returns early with the error (or `None`); otherwise unwraps the value',
        extra: 'Errors are converted with `From`.',
      },
      { front: '`&str` vs `String`?', back: '`&str` is a borrowed slice; `String` is an owned, growable buffer' },
      {
        front: 'When do you need `Arc` instead of `Rc`?',
        back: 'When ownership is shared across threads',
        extra: '`Arc` counts references atomically.',
      },
      {
        front: 'What does the borrow checker guarantee?',
        back: 'One mutable reference or any number of shared ones, and no reference outlives its data',
      },
      { front: 'What does `Rc<T>` give you?', back: 'Shared ownership through single-threaded reference counting' },
      {
        front:
          'What does this print?\n```rust\nlet v = vec![1, 2, 3];\nlet total: i32 = v.iter().map(|x| x * 2).sum();\nprintln!("{total}");\n```',
        back: '`12`',
        extra: 'Each element is doubled, then summed: 2 + 4 + 6.',
      },
      {
        front: 'Why doesn’t this compile?\n```rust\nlet s = String::from("hi");\nlet t = s;\nprintln!("{s}");\n```',
        back: '`s` was moved into `t`, so using it afterwards is an error',
        extra: 'error[E0382]: borrow of moved value: `s`',
      },
    ],
  },
  {
    id: 'es',
    name: 'Spanish B2',
    parentId: null,
    icon: 'spanish',
    newPerDay: 6,
    size: 3000,
    startDay: 150,
    skill: 1.05,
    content: [
      { front: 'aprovechar', back: 'to take advantage of; to make the most of' },
      { front: 'acordarse de', back: 'to remember' },
      { front: 'el recuerdo', back: 'memory; keepsake' },
      { front: 'sin embargo', back: 'however; nevertheless' },
      { front: 'echar de menos', back: 'to miss (someone or something)' },
      { front: 'llevar a cabo', back: 'to carry out' },
      { front: 'desarrollar', back: 'to develop' },
    ],
  },
  {
    id: 'chem',
    name: 'Organic Chemistry',
    parentId: null,
    icon: 'flask',
    newPerDay: 4,
    size: 600,
    startDay: 228,
    skill: 0.86,
    content: [
      { front: 'What is a nucleophile?', back: 'An electron-pair donor drawn to electron-poor centers' },
      {
        front: 'Stereochemical outcome of an SN2 reaction?',
        back: 'Inversion of configuration',
        extra: 'Also called Walden inversion.',
      },
      {
        front: 'What makes a compound aromatic?',
        back: 'Cyclic, planar, fully conjugated, with 4n+2 π electrons',
        extra: 'Hückel’s rule.',
      },
      { front: 'Markovnikov’s rule?', back: 'In HX addition, H goes to the carbon that already has more hydrogens' },
      { front: 'What defines a ketone?', back: 'A carbonyl group bonded to two carbon groups' },
      {
        front: String.raw`Degrees of unsaturation for \(\mathrm{C}_c\mathrm{H}_h\mathrm{N}_n\mathrm{X}_x\)?`,
        back: String.raw`\[\text{DoU} = \frac{2c + 2 + n - h - x}{2}\]`,
        extra: 'Each ring or π bond counts as one.',
      },
    ],
  },
  {
    id: 'geo',
    name: 'World Capitals',
    parentId: null,
    icon: 'globe',
    newPerDay: 5,
    size: 197,
    startDay: 272,
    skill: 1.1,
    content: [
      { front: 'Mongolia', hint: 'Capital city', back: 'Ulaanbaatar' },
      { front: 'Kazakhstan', hint: 'Capital city', back: 'Astana' },
      { front: 'Bhutan', hint: 'Capital city', back: 'Thimphu' },
      { front: 'Burkina Faso', hint: 'Capital city', back: 'Ouagadougou' },
      { front: 'Australia', hint: 'Capital city', back: 'Canberra' },
      { front: 'Myanmar', hint: 'Capital city', back: 'Naypyidaw' },
      { front: 'New Zealand', hint: 'Capital city', back: 'Wellington' },
    ],
  },
  {
    id: 'js',
    name: 'JavaScript',
    parentId: null,
    icon: 'code',
    newPerDay: 3,
    size: 420,
    startDay: 286,
    skill: 1.02,
    content: [
      {
        front: 'What does `typeof null` return?',
        back: '`"object"`',
        extra: 'A historical quirk of the language, kept for compatibility.',
      },
      { front: '`==` vs `===`?', back: '`===` compares without type coercion; `==` converts types first' },
      { front: 'What does `Array.prototype.at(-1)` return?', back: 'The last element of the array' },
      { front: 'What is a closure?', back: 'A function bundled with the variables of the scope it was created in' },
      {
        front: 'Microtask vs macrotask?',
        back: 'Promise callbacks (microtasks) run before the next timer or I/O callback (macrotasks)',
      },
    ],
  },
  {
    id: 'stats',
    name: 'Statistics',
    parentId: null,
    icon: 'book',
    newPerDay: 3,
    size: 300,
    startDay: 250,
    skill: 0.95,
    content: [
      {
        front: 'Median vs mean?',
        back: 'The median is the middle value and resists outliers; the mean is the average and doesn’t',
      },
      {
        front: 'What does a p-value measure?',
        back: 'How likely data at least this extreme would be if the null hypothesis were true',
      },
      { front: 'Correlation vs causation?', back: 'Two variables moving together doesn’t show that one causes the other' },
      { front: 'Standard error of the mean?', back: String.raw`\(\mathrm{SE} = \dfrac{\sigma}{\sqrt{n}}\)` },
      {
        front: 'What is a confidence interval?',
        back: 'A range built so that, over many samples, it contains the true value at the stated rate',
      },
    ],
  },
  {
    id: 'de',
    name: 'German A1',
    parentId: null,
    icon: 'spark',
    newPerDay: 5,
    size: 800,
    startDay: 296,
    skill: 1,
    content: [
      { front: 'das Gedächtnis', back: 'memory (the faculty)' },
      { front: 'lernen', back: 'to learn; to study' },
      { front: 'die Erinnerung', back: 'memory; recollection' },
      { front: 'vergessen', back: 'to forget' },
      { front: 'jeden Tag', back: 'every day' },
    ],
  },
  {
    id: 'linux',
    name: 'Linux & Shell',
    parentId: null,
    icon: 'code',
    newPerDay: 3,
    size: 350,
    startDay: 212,
    skill: 1.04,
    content: [
      { front: 'What does `chmod 755` set?', back: 'Owner read/write/execute; group and others read/execute' },
      { front: 'Show the last 20 lines of a file and keep following it', back: '`tail -n 20 -f file.log`' },
      { front: 'What does `2>&1` do?', back: 'Sends standard error to wherever standard output goes' },
      { front: 'Find files over 100 MB under the current directory', back: '`find . -type f -size +100M`' },
      { front: 'What does `$?` hold?', back: 'The exit status of the last command; 0 means success' },
    ],
  },
  {
    id: 'history',
    name: 'World History',
    parentId: null,
    icon: 'book',
    newPerDay: 3,
    size: 500,
    startDay: 312,
    skill: 1.06,
    content: [
      { front: 'When did the Berlin Wall fall?', back: '9 November 1989' },
      { front: 'Who printed with movable metal type in Europe around 1450?', back: 'Johannes Gutenberg' },
      { front: 'When was the Magna Carta sealed?', back: '1215' },
      { front: 'Which empire built Machu Picchu?', back: 'The Inca Empire' },
      { front: 'In what year did the French Revolution begin?', back: '1789' },
    ],
  },
]

/** mulberry32: a tiny seeded PRNG, so every render simulates the same learner. */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296
  }
}

/** Offset from today (in days) that a streak freeze covered. */
const FREEZE_OFFSET = 23
/** The current streak is at least this long. */
const STREAK_FLOOR = 68

/** The sample learner's collection as of `now`; deterministic for a given day and time zone. */
export function simulateCollection(now: Date, cfg: DayConfig = localDayConfig()): Collection {
  const rng = mulberry32(SEED)
  const nowMs = now.getTime()
  const today = dayKey(now, cfg)
  const first = addDays(today, -HISTORY_DAYS)
  const firstStart = dayStart(first, cfg)

  const cards: (CollectionCard & { deck: DemoDeck })[] = []
  for (const deck of DECKS) {
    for (let i = 0; i < deck.size; i++) {
      cards.push({
        id: `${deck.id}-${i}`,
        deckId: deck.id,
        deck,
        memory: newMemory(firstStart),
        suspended: rng() < 0.008,
        content: deck.content[i % deck.content.length]!,
        position: i,
      })
    }
  }
  const unseen = new Map(DECKS.map((d) => [d.id, cards.filter((c) => c.deck === d && !c.suspended)]))
  const active: typeof cards = []
  const logs: ReviewEntry[] = []

  for (let i = 0; i <= HISTORY_DAYS; i++) {
    const key = addDays(first, i)
    const offset = HISTORY_DAYS - i
    const start = dayStart(key, cfg).getTime()
    const end = dayStart(addDays(key, 1), cfg).getTime()
    const isToday = offset === 0

    // Today always, the freeze day never, otherwise every day of the current
    // streak. Before it: two breaks, and random skips (frequent at first).
    const onBreak = (i >= 96 && i <= 104) || (i >= 190 && i <= 192)
    const studied =
      isToday || (offset !== FREEZE_OFFSET && (offset <= STREAK_FLOOR || (!onBreak && rng() > (i < 10 ? 0.4 : 0.06))))

    if (studied) {
      const hour = isToday ? 7 : pickHour(rng)
      // The study day begins at the rollover hour, so count the local hour from there.
      let clock = start + ((hour - cfg.rolloverHour + 24) % 24) * HOUR_MS + Math.floor(rng() * 40) * 60_000
      // Today's session happened this morning and stopped part-way.
      const limit = isToday ? nowMs - 5 * 60_000 : end
      // Some days are lazy: part of the reviews and no new cards.
      const lazy = !isToday && rng() < 0.08
      const reviewShare = isToday ? 0.36 : lazy ? 0.65 : 1
      const newShare = isToday ? 0.4 : lazy ? 0 : 1
      const mood = 1 + (rng() - 0.5) * 0.05
      const learningQueue: typeof cards = []

      const study = (c: (typeof cards)[number]) => {
        const at = new Date(clock)
        const kind = cardKind(c.memory)
        const rating = pickRating(rng, c.memory, at, c.deck.skill, hourOf(at, cfg), mood)
        const ms = Math.round((kind === 'new' ? 9_000 : rating === 1 ? 11_000 : 5_200) * (0.6 + rng() * 0.9))
        c.memory = answer(c.memory, rating, at, DEMO_PRESET, { random: rng })
        logs.push({ t: clock, cardId: c.id, deckId: c.deckId, rating, kind, ms, matureAfter: isMature(c.memory) })
        clock += ms + 1_500
        if (isLearning(c.memory) && c.memory.due.getTime() < end) learningQueue.push(c)
      }

      if (clock < limit) {
        const due = active.filter((c) => c.memory.due.getTime() < end).sort((a, b) => +a.memory.due - +b.memory.due)
        const cap = Math.round(due.length * reviewShare)
        for (let n = 0; n < cap && clock < limit; n++) study(due[n]!)

        for (const deck of DECKS) {
          if (deck.startDay > i) continue
          const pool = unseen.get(deck.id)!
          const count = Math.min(pool.length, Math.round(deck.newPerDay * newShare))
          for (let n = 0; n < count && clock < limit; n++) {
            const c = pool.shift()!
            active.push(c)
            study(c)
          }
        }

        // Today's learning steps are still pending, so they show up as due.
        while (!isToday && learningQueue.length > 0 && clock < limit) {
          learningQueue.sort((a, b) => +a.memory.due - +b.memory.due)
          const c = learningQueue.shift()!
          if (c.memory.due.getTime() >= end) continue
          clock = Math.max(clock, c.memory.due.getTime())
          if (clock >= limit) break
          study(c)
        }
      }
    }
  }

  // When cards were added: each studied card when it first came up; the rest of
  // a deck arrived with it, when its first card did (decks never studied: unknown).
  // Read from the log after the run, so the random sequence above is untouched.
  const firstSeen = new Map<string, number>()
  const deckSeen = new Map<string, number>()
  for (const l of logs) {
    if (!firstSeen.has(l.cardId)) firstSeen.set(l.cardId, l.t)
    if (!deckSeen.has(l.deckId)) deckSeen.set(l.deckId, l.t)
  }

  return {
    now,
    day: cfg,
    dailyGoal: DEMO_GOAL,
    decks: DECKS.map(({ id, name, parentId, icon, newPerDay }) => ({
      id,
      name,
      parentId,
      icon,
      newPerDay,
      // Effectively no review limit: the simulation studies everything due.
      reviewsPerDay: 9_999,
      presetId: DEMO_PRESET_ID,
    })),
    presets: { [DEMO_PRESET_ID]: DEMO_PRESET },
    cards: cards.map(({ deck: _deck, ...card }) => ({ ...card, createdAt: firstSeen.get(card.id) ?? deckSeen.get(card.deckId) })),
    logs,
    freezes: [addDays(today, -FREEZE_OFFSET)],
    freezesLeft: 1,
    rewards: [],
  }
}

/** When a session starts: usually morning or evening, sometimes lunch or past midnight. */
function pickHour(rng: () => number): number {
  const r = rng()
  if (r < 0.52) return 7 + Math.floor(rng() * 3)
  if (r < 0.82) return 20 + Math.floor(rng() * 3)
  if (r < 0.93) return 12 + Math.floor(rng() * 2)
  return [23, 0, 1][Math.floor(rng() * 3)]!
}

// People recall a little better in the morning and worse past midnight.
function hourBoost(hour: number): number {
  if (hour >= 7 && hour <= 10) return 0.025
  if (hour >= 23 || hour < 4) return -0.06
  if (hour >= 20) return -0.015
  return 0
}

/**
 * A plausible answer. New cards use fixed odds scaled by the deck's skill; other
 * cards pass with their FSRS recall probability, nudged by skill, mood and hour.
 */
function pickRating(rng: () => number, card: Memory, at: Date, skill: number, hour: number, mood: number): Rating {
  const r = rng()
  if (card.state === 0) {
    const again = 0.3 / skill
    if (r < again) return 1
    if (r < again + 0.14) return 2
    return r < 0.9 ? 3 : 4
  }
  const base = isLearning(card) ? 0.8 : retrievability(card, at)
  const p = Math.min(0.995, Math.max(0.05, Math.pow(base, 1 / skill) * mood + hourBoost(hour)))
  if (r >= p) return 1
  const pass = rng()
  if (pass < 0.13) return 2
  return pass < 0.91 ? 3 : 4
}

let cached: { day: string; collection: Collection } | null = null

/** The simulated collection, recomputed once per study day. */
export function demoCollection(now = new Date(), cfg: DayConfig = localDayConfig()): Collection {
  const day = `${cfg.timeZone}:${cfg.rolloverHour}:${dayKey(now, cfg)}`
  if (cached?.day !== day) cached = { day, collection: simulateCollection(now, cfg) }
  return { ...cached.collection, now }
}
