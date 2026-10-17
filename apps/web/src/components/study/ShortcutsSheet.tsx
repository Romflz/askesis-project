import { X } from 'lucide-react'
import { Kbd } from '../askesis/ui.tsx'

// Keep in step with the keyboard handler in StudySession.
const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ['Space', 'Enter'], label: 'Show answer, then answer Good' },
  { keys: ['1'], label: 'Again' },
  { keys: ['2'], label: 'Hard' },
  { keys: ['3'], label: 'Good' },
  { keys: ['4'], label: 'Easy' },
  { keys: ['Z', '⌘/Ctrl Z'], label: 'Undo last answer' },
  { keys: ['L'], label: 'Later: move the card to the end' },
  { keys: ['E'], label: 'Edit card' },
  { keys: ['B'], label: 'Bury until tomorrow' },
  { keys: ['S'], label: 'Suspend card' },
  { keys: ['?'], label: 'Show these shortcuts' },
  { keys: ['Esc'], label: 'Close a panel, or end the session' },
]

/** The list of session keyboard shortcuts, opened with ? or the keyboard button. */
export function ShortcutsSheet({ onClose }: { onClose: () => void }) {
  return (
    <div className="study-modal" role="dialog" aria-modal="true" aria-labelledby="keys-title" onClick={onClose}>
      <div className="study-modal__panel" onClick={(e) => e.stopPropagation()}>
        <div className="study-prefs__head">
          <h2 id="keys-title" className="study-modal__title">
            Keyboard shortcuts
          </h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close shortcuts" autoFocus>
            <X size={16} />
          </button>
        </div>
        <ul className="study-keys">
          {SHORTCUTS.map((s) => (
            <li key={s.label}>
              <span className="study-keys__keys">
                {s.keys.map((k) => (
                  <Kbd key={k}>{k}</Kbd>
                ))}
              </span>
              <span>{s.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
