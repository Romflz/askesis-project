import { ArchiveX, EyeOff, type LucideIcon, Pencil, SkipForward, Undo2, X } from 'lucide-react'
import { Kbd } from '../askesis/ui.tsx'

export type CardActionId = 'undo' | 'later' | 'edit' | 'bury' | 'suspend'

// What each session action does, for the desktop side list and the phone help sheet.
// Keep the blurbs in step with the reducer and API: Later only requeues within this
// session, Bury lasts until the next study day, Suspend until unsuspended in Decks.
export const CARD_ACTIONS: { id: CardActionId; label: string; key: string; icon: LucideIcon; blurb: string }[] = [
  { id: 'undo', label: 'Undo', key: 'Z', icon: Undo2, blurb: 'Take back your last answer' },
  { id: 'later', label: 'Later', key: 'L', icon: SkipForward, blurb: 'Move this card to the end of this session' },
  { id: 'edit', label: 'Edit', key: 'E', icon: Pencil, blurb: 'Fix a typo without leaving the session' },
  { id: 'bury', label: 'Bury', key: 'B', icon: EyeOff, blurb: 'Hide this card until tomorrow' },
  { id: 'suspend', label: 'Suspend', key: 'S', icon: ArchiveX, blurb: 'Stop showing this card until you unsuspend it in Decks' },
]

/** Explains the compact action buttons where the side list doesn't fit. */
export function CardActionsSheet({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="study-modal study-modal--sheet"
      role="dialog"
      aria-modal="true"
      aria-labelledby="actions-title"
      onClick={onClose}
    >
      <div className="study-modal__panel study-modal__panel--sm" onClick={(e) => e.stopPropagation()}>
        <div className="study-prefs__head">
          <h2 id="actions-title" className="study-modal__title">
            Card actions
          </h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close card actions" autoFocus>
            <X size={16} />
          </button>
        </div>
        <ul className="study-help">
          {CARD_ACTIONS.map(({ id, label, key, icon: Icon, blurb }) => (
            <li key={id}>
              <span className="study-help__icon" aria-hidden>
                <Icon size={16} />
              </span>
              <div>
                <p className="study-help__label">
                  {label} <Kbd>{key}</Kbd>
                </p>
                <p className="study-help__text">{blurb}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
