import { DECK_ICONS, type DeckNode, type LibraryPayload } from '@askesis/contracts'
import { DECK_PATH_SEPARATOR } from '@askesis/core'
import clsx from 'clsx'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useUserDataMutation } from '../../lib/queries.ts'
import { createDeck, updateDeck } from '../../server/library.functions.ts'
import { Field, Select, TextInput } from '../settings/fields.tsx'
import { DeckGlyph } from '../askesis/ui.tsx'
import { Dialog } from './Dialog.tsx'
import { descendantIds, errorMessage } from './lib.ts'
import { useToast } from './Toasts.tsx'

/** The field to focus when the dialog opens from a deck menu item. */
export type DeckFocus = 'name' | 'parent' | 'icon' | 'preset' | 'description'

export type DeckDialogState =
  { mode: 'create'; parentId: string | null } | { mode: 'edit'; deck: DeckNode; focus: DeckFocus } | null

const ICON_LABELS: Record<(typeof DECK_ICONS)[number], string> = {
  book: 'Book',
  spark: 'Spark',
  kana: 'Japanese',
  spanish: 'Spanish',
  brain: 'Brain',
  code: 'Code',
  flask: 'Science',
  globe: 'Geography',
}

/** Create a deck (a "Parent::Child" path creates the whole chain) or edit one. */
export function DeckDialog({
  state,
  library,
  onClose,
  onCreated,
}: {
  state: DeckDialogState
  library: LibraryPayload
  onClose: () => void
  onCreated?: (id: string) => void
}) {
  const toast = useToast()
  const editing = state?.mode === 'edit' ? state.deck : null
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState('')
  const [icon, setIcon] = useState<(typeof DECK_ICONS)[number]>('book')
  const [presetId, setPresetId] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!state) return
    setError(null)
    if (state.mode === 'edit') {
      setName(state.deck.name)
      setParentId(state.deck.parentId ?? '')
      setIcon(state.deck.icon)
      setPresetId(state.deck.presetId)
      setDescription(state.deck.description)
    } else {
      const parent = library.decks.find((d) => d.id === state.parentId)
      setName('')
      setParentId(state.parentId ?? '')
      setIcon(parent?.icon ?? 'book')
      setPresetId(parent?.presetId ?? library.presets.find((p) => p.isDefault)?.id ?? '')
      setDescription('')
    }
    // Focus the field the menu item was about, once the dialog has rendered.
    requestAnimationFrame(() => {
      const focus = state.mode === 'edit' ? state.focus : 'name'
      formRef.current?.querySelector<HTMLElement>(`[data-focus="${focus}"]`)?.focus()
    })
  }, [state, library])

  // A deck can't move into itself or one of its subdecks.
  const blocked = useMemo(() => (editing ? descendantIds(library.decks, editing.id) : []), [editing, library.decks])
  const parents = [
    { value: '', label: 'No parent (top level)' },
    ...library.decks
      .filter((d) => !blocked.includes(d.id))
      .map((d) => ({ value: d.id, label: d.path.replaceAll(DECK_PATH_SEPARATOR, ' › ') })),
  ]
  const presets = library.presets.map((p) => ({ value: p.id, label: p.isDefault ? `${p.name} (default)` : p.name }))
  const segments = name
    .split(DECK_PATH_SEPARATOR)
    .map((s) => s.trim())
    .filter(Boolean)

  // One mutation per save, so the deck lists refresh once even when "A::B::C" creates three decks.
  // It resolves to the created deck, or null after an edit.
  const save = useUserDataMutation(
    async (): Promise<{ id: string; existed: boolean } | null> => {
      if (editing) {
        // Send only the fields that changed.
        await updateDeck({
          data: {
            id: editing.id,
            patch: {
              ...(segments[0] !== editing.name && { name: segments[0] }),
              ...((parentId || null) !== editing.parentId && { parentId: parentId || null }),
              ...(icon !== editing.icon && { icon }),
              ...(presetId && presetId !== editing.presetId && { presetId }),
              ...(description !== editing.description && { description }),
            },
          },
        })
        return null
      }
      // "A::B::C" creates (or reuses) each level; the last one gets the chosen look.
      let parent: string | null = parentId || null
      let created = { id: '', existed: false }
      for (const [i, segment] of segments.entries()) {
        const last = i === segments.length - 1
        created = await createDeck({
          data: {
            name: segment,
            parentId: parent,
            icon: last ? icon : 'book',
            description: last ? description : '',
            ...(presetId && { presetId }),
          },
        })
        parent = created.id
      }
      return created
    },
    {
      onSuccess: (created) => {
        if (!created) return toast('Deck saved')
        toast(created.existed ? 'That deck already exists, so it was opened instead' : 'Deck created')
        onCreated?.(created.id)
      },
    },
  )

  async function submit() {
    if (!state || segments.length === 0) return setError('Give the deck a name.')
    if (editing && segments.length > 1) return setError('Use “Parent” to move a deck; a name can’t contain "::".')
    setError(null)
    try {
      await save.mutateAsync()
      onClose()
    } catch (e) {
      setError(errorMessage(e))
    }
  }

  return (
    <Dialog
      open={!!state}
      onClose={onClose}
      title={editing ? `Edit “${editing.name}”` : parentId ? 'New subdeck' : 'New deck'}
      description={
        editing
          ? editing.path.replaceAll(DECK_PATH_SEPARATOR, ' › ')
          : parentId
            ? `Inside ${library.decks.find((d) => d.id === parentId)?.path.replaceAll(DECK_PATH_SEPARATOR, ' › ') ?? 'the selected deck'}.`
            : 'Tip: type “Spanish::Verbs” to create a deck and a subdeck at once.'
      }
      footer={
        <>
          {error && <span className="deckmgr-form-error">{error}</span>}
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="deck-dialog-form" className="btn btn--primary btn--sm" disabled={save.isPending}>
            {save.isPending ? 'Saving…' : editing ? 'Save deck' : 'Create deck'}
          </button>
        </>
      }
    >
      <form
        id="deck-dialog-form"
        ref={formRef}
        className="deckmgr-form"
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
      >
        <Field
          label="Name"
          help={editing ? undefined : 'If a deck with this name already exists here, it’s opened instead of duplicated.'}
        >
          {(p) => (
            <TextInput
              {...p}
              data-focus="name"
              value={name}
              onChange={setName}
              maxLength={240}
              placeholder={parentId ? 'e.g. Verbs' : 'e.g. Spanish'}
              required
            />
          )}
        </Field>
        <div className="field-grid deckmgr-form__pair">
          <Field label="Parent">
            {(p) => <Select {...p} data-focus="parent" value={parentId} onChange={setParentId} options={parents} />}
          </Field>
          <Field label="Preset" help="How cards in this deck are scheduled.">
            {(p) => <Select {...p} data-focus="preset" value={presetId} onChange={setPresetId} options={presets} />}
          </Field>
        </div>
        <fieldset className="deckmgr-icons">
          <legend className="field__label">Icon</legend>
          <div className="deckmgr-icons__grid" role="radiogroup" aria-label="Deck icon">
            {DECK_ICONS.map((i, index) => (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={icon === i}
                aria-label={ICON_LABELS[i]}
                title={ICON_LABELS[i]}
                data-focus={index === 0 ? 'icon' : undefined}
                className={clsx('deckmgr-icons__option', icon === i && 'is-selected')}
                onClick={() => setIcon(i)}
              >
                <DeckGlyph icon={i} />
              </button>
            ))}
          </div>
        </fieldset>
        <Field label="Description" help="Shown in the deck header.">
          {(p) => (
            <textarea
              {...p}
              data-focus="description"
              className="input deckmgr-textarea"
              rows={3}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What’s in this deck?"
            />
          )}
        </Field>
      </form>
    </Dialog>
  )
}
