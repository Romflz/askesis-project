// Small synthesized sound effects (WebAudio oscillators, no audio files).
// Three levels, remembered per device: 'off', 'rewards' (chests, coins, quests,
// level-ups; the default) and 'all' (also reveals and answers while studying).
// Browsers only allow audio after a user gesture, which every caller here is.

export type SoundLevel = 'off' | 'rewards' | 'all'

const KEY = 'askesis-sound'
const listeners = new Set<(level: SoundLevel) => void>()
let ctx: AudioContext | null = null

export function soundLevel(): SoundLevel {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'off' || v === 'all' ? v : 'rewards'
  } catch {
    return 'rewards'
  }
}

export function setSoundLevel(level: SoundLevel) {
  try {
    localStorage.setItem(KEY, level)
  } catch {
    // Storage blocked: the choice still applies until the page reloads.
  }
  for (const fn of listeners) fn(level)
}

export function onSoundLevel(fn: (level: SoundLevel) => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

interface Note {
  /** Hz */
  f: number
  /** Start, seconds from now. */
  t: number
  /** Length in seconds. */
  d: number
  type?: OscillatorType
  /** Peak volume, 0–1 (kept low; these play often). */
  v?: number
  /** Glide to this frequency over the note. */
  to?: number
}

function play(notes: Note[], kind: 'reward' | 'study') {
  const level = soundLevel()
  if (level === 'off' || (kind === 'study' && level !== 'all')) return
  if (typeof window === 'undefined' || !('AudioContext' in window)) return
  ctx ??= new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  const now = ctx.currentTime
  for (const n of notes) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = n.type ?? 'triangle'
    osc.frequency.setValueAtTime(n.f, now + n.t)
    if (n.to) osc.frequency.exponentialRampToValueAtTime(n.to, now + n.t + n.d)
    // Quick attack, smooth exponential release: no clicks.
    gain.gain.setValueAtTime(0.0001, now + n.t)
    gain.gain.exponentialRampToValueAtTime(n.v ?? 0.05, now + n.t + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + n.t + n.d)
    osc.connect(gain).connect(ctx.destination)
    osc.start(now + n.t)
    osc.stop(now + n.t + n.d + 0.02)
  }
}

const arpeggio = (freqs: number[], step: number, d: number, v = 0.05): Note[] => freqs.map((f, i) => ({ f, t: i * step, d, v }))

export const sfx = {
  // ── Studying ('all' only) ──
  /** Turning the card over. */
  reveal: () => play([{ f: 420, to: 640, t: 0, d: 0.09, type: 'sine', v: 0.035 }], 'study'),
  /** Again: a soft low blip, never a buzzer. */
  again: () => play([{ f: 300, to: 220, t: 0, d: 0.14, type: 'sine', v: 0.04 }], 'study'),
  /** Hard / Good: a short two-note chime. */
  good: () => play(arpeggio([660, 990], 0.06, 0.12, 0.035), 'study'),
  /** Easy: brighter, three notes. */
  easy: () => play(arpeggio([660, 990, 1320], 0.05, 0.12, 0.035), 'study'),

  // ── Rewards ──
  /** Coins landing in the purse. */
  coins: () => play(arpeggio([1568, 2093, 2637, 3136], 0.06, 0.16, 0.035), 'reward'),
  /** A combo milestone. */
  combo: () => play(arpeggio([880, 1175, 1568], 0.045, 0.1, 0.035), 'reward'),
  /** A quest finished or claimed. */
  quest: () => play(arpeggio([784, 1046, 1319], 0.08, 0.18, 0.045), 'reward'),
  /** The chest rattling before it opens. */
  rattle: () =>
    play(
      [0, 0.12, 0.24, 0.36, 0.48].map((t, i) => ({ f: 180 + i * 25, t, d: 0.07, type: 'square' as const, v: 0.018 })),
      'reward',
    ),
  /** The chest bursting open. */
  chest: () =>
    play(
      [
        { f: 392, to: 784, t: 0, d: 0.25, v: 0.05 },
        ...arpeggio([1046, 1319, 1568, 2093], 0.07, 0.22, 0.04).map((n) => ({ ...n, t: n.t + 0.18 })),
      ],
      'reward',
    ),
  /** Level up: a rising run into a held chord with a high sparkle. */
  levelUp: () =>
    play(
      [
        ...arpeggio([523, 659, 784, 1046, 1319], 0.09, 0.16, 0.05),
        { f: 523, t: 0.5, d: 1, v: 0.035 },
        { f: 784, t: 0.5, d: 1, v: 0.03 },
        { f: 1046, t: 0.5, d: 1.2, v: 0.04 },
        ...arpeggio([2093, 2637, 3136], 0.1, 0.12, 0.02).map((n) => ({ ...n, t: n.t + 0.6, type: 'sine' as const })),
      ],
      'reward',
    ),
}
