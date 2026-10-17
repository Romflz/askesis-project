import type { CardListItem, LibraryPayload } from '@askesis/contracts'
import { DECK_PATH_SEPARATOR, formatInterval } from '@askesis/core'
import clsx from 'clsx'
import { Ban, CirclePlay, Code2, Eye, Trash2 } from 'lucide-react'
import { type KeyboardEvent, useEffect, useRef, useState } from 'react'
import { useUserDataMutation } from '../../lib/queries.ts'
import { createCard, deleteCard, updateCard } from '../../server/library.functions.ts'
import { CardText } from '../askesis/CardText.tsx'
import { Field, Select, TextInput } from '../settings/fields.tsx'
import { Dialog } from './Dialog.tsx'
import { errorMessage, usePrefs } from './lib.ts'
import { TagCombo } from './Pickers.tsx'
import { useToast } from './Toasts.tsx'

export type EditorState = { mode: 'new'; deckId?: string } | { mode: 'edit'; card: CardListItem } | null

/** Indexed by memory state. */
const STATE_LABEL = ['New', 'Learning', 'Review', 'Relearning'] as const

interface Draft {
  deckId: string
  front: string
  back: string
  hint: string
  extra: string
  tags: string[]
}

const empty = (deckId: string): Draft => ({ deckId, front: '', back: '', hint: '', extra: '', tags: [] })

/** The drawer for adding or editing a card, with a live preview of how it renders. */
export function CardEditor({ state, library, onClose }: { state: EditorState; library: LibraryPayload; onClose: () => void }) {
  const toast = useToast()
  const [prefs, setPrefs] = usePrefs('askesis:card-editor', { mono: false, preview: true })
  const editing = state?.mode === 'edit' ? state.card : null
  const saveCard = useUserDataMutation((card: Draft) =>
    editing ? updateCard({ data: { id: editing.id, patch: card } }) : createCard({ data: card }),
  )
  const patchCard = useUserDataMutation(updateCard)
  const removeCard = useUserDataMutation(deleteCard)
  const busy = saveCard.isPending
  const [draft, setDraft] = useState<Draft>(() => empty(''))
  // A JSON snapshot of the loaded card, to tell when there are unsaved changes.
  const [baseline, setBaseline] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const frontRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!state) return
    const next =
      state.mode === 'edit'
        ? {
            deckId: state.card.deckId,
            front: state.card.front,
            back: state.card.back,
            hint: state.card.hint ?? '',
            extra: state.card.extra ?? '',
            tags: state.card.tags,
          }
        : empty(state.deckId ?? library.decks[0]?.id ?? '')
    setDraft(next)
    setBaseline(JSON.stringify(next))
    setError(null)
    setConfirmDelete(false)
    // Focus once the drawer has rendered its fields.
    requestAnimationFrame(() => frontRef.current?.focus())
  }, [state, library.decks])

  const dirty = JSON.stringify(draft) !== baseline
  const set =
    <K extends keyof Draft>(key: K) =>
    (value: Draft[K]) =>
      setDraft((d) => ({ ...d, [key]: value }))
  const deckOptions = library.decks.map((d) => ({ value: d.id, label: d.path.replaceAll(DECK_PATH_SEPARATOR, ' › ') }))
  const tagSuggestions = library.tags.map((t) => t.tag)

  function close() {
    if (dirty && !window.confirm('Discard your changes to this card?')) return
    onClose()
  }

  async function save(addAnother = false) {
    if (!draft.front.trim()) return setError('The front can’t be empty.')
    if (!draft.deckId) return setError('Pick a deck first.')
    setError(null)
    try {
      await saveCard.mutateAsync(draft)
      toast(editing ? 'Card saved' : 'Card added')
      if (addAnother) {
        // Keep deck and tags: adding a batch of similar cards is the common case.
        const next = { ...empty(draft.deckId), tags: draft.tags }
        setDraft(next)
        setBaseline(JSON.stringify(next))
        frontRef.current?.focus()
      } else onClose()
    } catch (e) {
      setError(errorMessage(e, 'Couldn’t save the card.'))
    }
  }

  async function toggleSuspend() {
    if (!editing) return
    try {
      await patchCard.mutateAsync({ data: { id: editing.id, patch: { suspended: !editing.suspended } } })
      toast(editing.suspended ? 'Card unsuspended' : 'Card suspended')
      onClose()
    } catch (e) {
      toast(errorMessage(e), 'error')
    }
  }

  async function remove() {
    if (!editing) return
    if (!confirmDelete) return setConfirmDelete(true)
    try {
      await removeCard.mutateAsync({ data: { id: editing.id } })
      toast('Card deleted')
      onClose()
    } catch (e) {
      toast(errorMessage(e), 'error')
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      void save()
    }
  }

  /** A multiline field for `Field`'s render prop; the front also takes the focus ref. */
  const textarea = (key: 'front' | 'back' | 'extra', rows: number, placeholder: string) => (p: { id: string }) => (
    <textarea
      {...p}
      ref={key === 'front' ? frontRef : undefined}
      className={clsx('input deckmgr-textarea', prefs.mono && 'is-mono')}
      rows={rows}
      value={draft[key]}
      onChange={(e) => set(key)(e.target.value)}
      placeholder={placeholder}
      spellCheck={!prefs.mono}
    />
  )

  return (
    <Dialog
      open={!!state}
      onClose={close}
      variant="drawer"
      size="xl"
      title={editing ? 'Edit card' : 'New card'}
      description={
        editing ? (
          <span className="deckmgr-sched">
            <span>{editing.suspended ? 'Suspended' : STATE_LABEL[editing.state]}</span>
            {editing.state > 0 && <span>Interval {formatInterval(editing.interval * 86_400_000)}</span>}
            {editing.ease > 0 && <span>Ease {Math.round(editing.ease * 100)}%</span>}
            <span>{editing.reps} reviews</span>
            <span>{editing.lapses} lapses</span>
            {editing.state > 0 && (
              <span>
                Due {new Date(editing.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </span>
        ) : (
          'Add it to any deck. Tags and the deck stay put for the next card.'
        )
      }
      footer={
        <>
          {editing && (
            <div className="deckmgr-editor__danger">
              <button type="button" className="btn btn--ghost btn--sm" onClick={toggleSuspend}>
                {editing.suspended ? <CirclePlay size={14} /> : <Ban size={14} />}
                {editing.suspended ? 'Unsuspend' : 'Suspend'}
              </button>
              <button
                type="button"
                className={clsx('btn btn--sm', confirmDelete ? 'btn--danger' : 'btn--ghost')}
                onClick={remove}
              >
                <Trash2 size={14} />
                {confirmDelete ? 'Click to delete' : 'Delete'}
              </button>
            </div>
          )}
          {error && <span className="deckmgr-form-error">{error}</span>}
          {!editing && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => save(true)} disabled={busy}>
              Save & add another
            </button>
          )}
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => save()}
            disabled={busy || (!!editing && !dirty)}
          >
            {busy ? 'Saving…' : 'Save'} <kbd className="kbd">⌘↵</kbd>
          </button>
        </>
      }
    >
      <div className={clsx('deckmgr-editor', prefs.preview && 'has-preview')} onKeyDown={onKeyDown}>
        <div className="deckmgr-editor__form">
          <div className="deckmgr-editor__toolbar">
            <Field label="Deck" className="deckmgr-editor__deck">
              {(p) => <Select {...p} value={draft.deckId} onChange={set('deckId')} options={deckOptions} />}
            </Field>
            <div className="deckmgr-editor__toggles">
              <button
                type="button"
                className={clsx('icon-btn', prefs.mono && 'is-on')}
                aria-pressed={prefs.mono}
                onClick={() => setPrefs({ mono: !prefs.mono })}
                title="Monospace editing"
                aria-label="Monospace editing"
              >
                <Code2 size={16} />
              </button>
              <button
                type="button"
                className={clsx('icon-btn', prefs.preview && 'is-on')}
                aria-pressed={prefs.preview}
                onClick={() => setPrefs({ preview: !prefs.preview })}
                title="Live preview"
                aria-label="Live preview"
              >
                <Eye size={16} />
              </button>
            </div>
          </div>
          <Field label="Front">{textarea('front', 4, 'Question, word or prompt')}</Field>
          <Field label="Back">{textarea('back', 4, 'Answer')}</Field>
          <div className="field-grid deckmgr-form__pair">
            <Field label="Hint" help="Shown under the front, e.g. a reading or a category.">
              {(p) => <TextInput {...p} value={draft.hint} onChange={set('hint')} maxLength={2000} />}
            </Field>
            <Field label="Tags">
              {(p) => <TagCombo id={p.id} value={draft.tags} onChange={set('tags')} suggestions={tagSuggestions} />}
            </Field>
          </div>
          <Field label="Extra" help="Shown after the answer: context, mnemonics, sources.">
            {textarea('extra', 3, 'Optional')}
          </Field>
          <p className="deckmgr-editor__help">
            Formatting: <code>{'\\( … \\)'}</code> inline math, <code>{'\\[ … \\]'}</code> display math, <code>```lang</code> code
            blocks, <code>`code`</code>, <code>**bold**</code>, <code>*italic*</code>.
          </p>
        </div>
        {prefs.preview && (
          <aside className="deckmgr-editor__preview" aria-label="Preview">
            <p className="eyebrow">Preview</p>
            <div className="deckmgr-preview-card">
              <div className="deckmgr-preview-card__face">
                {draft.front.trim() ? <CardText text={draft.front} /> : <p className="deckmgr-preview-card__empty">Front</p>}
                {draft.hint && <p className="deckmgr-preview-card__hint">{draft.hint}</p>}
              </div>
              <div className="deckmgr-preview-card__answer">
                {draft.back.trim() ? <CardText text={draft.back} /> : <p className="deckmgr-preview-card__empty">Back</p>}
                {draft.extra.trim() && <CardText text={draft.extra} className="deckmgr-preview-card__extra" />}
              </div>
            </div>
          </aside>
        )}
      </div>
    </Dialog>
  )
}
