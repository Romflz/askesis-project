import type { QueueCard } from '@askesis/core'
import { useEffect, useRef, useState } from 'react'
import { CardText } from '../askesis/CardText.tsx'

/** Edit a card mid-session; the preview renders LaTeX and code like the card does. */
export function EditCardModal({
  card,
  onSave,
  onClose,
}: {
  card: QueueCard
  onSave: (patch: { front: string; back: string; hint: string; extra: string }) => Promise<void>
  onClose: () => void
}) {
  const [front, setFront] = useState(card.front)
  const [back, setBack] = useState(card.back)
  const [hint, setHint] = useState(card.hint ?? '')
  const [extra, setExtra] = useState(card.extra ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const firstField = useRef<HTMLTextAreaElement>(null)

  useEffect(() => firstField.current?.focus(), [])

  async function save() {
    if (!front.trim()) return setError('The front can’t be empty.')
    setSaving(true)
    setError(null)
    try {
      await onSave({ front, back, hint, extra })
    } catch {
      setError('Couldn’t save. Try again.')
      setSaving(false)
    }
  }

  return (
    <div
      className="study-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-title"
      onKeyDown={(e) => {
        // Esc closes only this modal, not the session behind it.
        if (e.key === 'Escape') {
          e.stopPropagation()
          onClose()
        }
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void save()
      }}
    >
      <div className="study-modal__panel study-modal__panel--wide">
        <h2 id="edit-title" className="study-modal__title">
          Edit card
        </h2>
        <div className="study-edit">
          <div className="study-edit__fields">
            <label className="study-edit__field">
              <span>Front</span>
              <textarea
                ref={firstField}
                className="input study-edit__input"
                rows={3}
                value={front}
                onChange={(e) => setFront(e.target.value)}
              />
            </label>
            <label className="study-edit__field">
              <span>Back</span>
              <textarea className="input study-edit__input" rows={4} value={back} onChange={(e) => setBack(e.target.value)} />
            </label>
            <label className="study-edit__field">
              <span>Hint</span>
              <input className="input" value={hint} onChange={(e) => setHint(e.target.value)} />
            </label>
            <label className="study-edit__field">
              <span>Extra</span>
              <textarea className="input study-edit__input" rows={2} value={extra} onChange={(e) => setExtra(e.target.value)} />
            </label>
            <p className="study-edit__help">
              Math: <code>\( … \)</code> or <code>\[ … \]</code>. Code: <code>```lang</code> blocks or <code>`inline`</code>.
            </p>
          </div>
          <div className="study-edit__preview" aria-label="Preview">
            <p className="eyebrow">Preview</p>
            <CardText text={front || ' '} className="study-edit__front" />
            {hint && <p className="study-card__hint">{hint}</p>}
            <hr />
            <CardText text={back || ' '} className="study-edit__back" />
            {extra && <CardText text={extra} className="study-card__extra" />}
          </div>
        </div>
        {error && <p className="study-edit__error">{error}</p>}
        <div className="study-modal__actions">
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn--primary btn--sm" onClick={() => void save()} disabled={saving}>
            {saving ? 'Saving…' : 'Save'} <span className="kbd">⌘↵</span>
          </button>
        </div>
      </div>
    </div>
  )
}
