import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { onSoundLevel, setSoundLevel, sfx, type SoundLevel, soundLevel } from '../../lib/sfx.ts'
import { Switch } from '../settings/fields.tsx'
import type { SessionPrefs } from './prefs.ts'

const SIZES: { value: SessionPrefs['textSize']; label: string }[] = [
  { value: 's', label: 'S' },
  { value: 'm', label: 'M' },
  { value: 'l', label: 'L' },
  { value: 'xl', label: 'XL' },
]

const SOUNDS: { value: SoundLevel; label: string; hint: string }[] = [
  { value: 'off', label: 'Off', hint: 'No sounds' },
  { value: 'rewards', label: 'Rewards only', hint: 'Lucky finds, combos and level-ups' },
  { value: 'all', label: 'All', hint: 'Rewards, plus revealing and answering cards' },
]

const TOGGLES: { key: keyof SessionPrefs; label: string; description: string }[] = [
  { key: 'showIntervals', label: 'Interval previews', description: 'Show when each button brings the card back.' },
  { key: 'showCounts', label: 'Remaining counts', description: 'New, learning and review cards left.' },
  { key: 'showTimer', label: 'Session timer', description: 'Elapsed time in the top bar.' },
  { key: 'keyHints', label: 'Keyboard hints', description: 'Key labels on buttons.' },
  { key: 'animate', label: 'Card animations', description: 'Slide cards in and fade answers.' },
  { key: 'confetti', label: 'Celebrations', description: 'Confetti and level-up moments for goals and finished sessions.' },
  {
    key: 'focusMode',
    label: 'Focus mode',
    description: 'Fade the top bar until you point at it and keep card actions compact.',
  },
]

/** Session display options (saved per device) and the sound level shared with the rest of the app. */
export function PrefsPanel({
  prefs,
  onChange,
  onClose,
}: {
  prefs: SessionPrefs
  onChange: (patch: Partial<SessionPrefs>) => void
  onClose: () => void
}) {
  // The sound level lives in sfx.ts (shared with the dashboard); read it after mount.
  const [sound, setSound] = useState<SoundLevel>('rewards')
  useEffect(() => {
    setSound(soundLevel())
    return onSoundLevel(setSound)
  }, [])

  const pickSound = (level: SoundLevel) => {
    setSoundLevel(level)
    // A sample, so the choice is audible right away.
    if (level === 'all') sfx.good()
    else if (level === 'rewards') sfx.combo()
  }

  return (
    <aside className="study-prefs panel" aria-label="Session preferences">
      <div className="study-prefs__head">
        <p className="eyebrow">Session preferences</p>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close preferences">
          <X size={16} />
        </button>
      </div>
      <div className="study-prefs__row">
        <span>Text size</span>
        <div className="segmented" role="group" aria-label="Text size">
          {SIZES.map((s) => (
            <button
              key={s.value}
              type="button"
              aria-pressed={prefs.textSize === s.value}
              onClick={() => onChange({ textSize: s.value })}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <div className="study-prefs__row">
        <span>Alignment</span>
        <div className="segmented" role="group" aria-label="Card alignment">
          {(['center', 'left'] as const).map((a) => (
            <button key={a} type="button" aria-pressed={prefs.align === a} onClick={() => onChange({ align: a })}>
              {a === 'center' ? 'Center' : 'Left'}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="study-prefs__row">
          <span>Sounds</span>
          <div className="segmented" role="group" aria-label="Sounds" aria-describedby="study-prefs-sound">
            {SOUNDS.map((s) => (
              <button key={s.value} type="button" aria-pressed={sound === s.value} onClick={() => pickSound(s.value)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <p id="study-prefs-sound" className="study-prefs__hint">
          {SOUNDS.find((s) => s.value === sound)!.hint}.
        </p>
      </div>
      <div className="study-prefs__toggles">
        {TOGGLES.map((t) => (
          <Switch
            key={t.key}
            label={t.label}
            description={t.description}
            checked={Boolean(prefs[t.key])}
            onChange={(checked) => onChange({ [t.key]: checked } as Partial<SessionPrefs>)}
          />
        ))}
      </div>
      <p className="study-prefs__note">Saved on this device.</p>
    </aside>
  )
}
