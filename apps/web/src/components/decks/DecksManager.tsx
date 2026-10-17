import type { CardListResult, LibraryPayload } from '@askesis/contracts'
import { DECK_PATH_SEPARATOR } from '@askesis/core'
import clsx from 'clsx'
import { BookOpenText, ChevronDown, Download, FolderPlus, Upload } from 'lucide-react'
import { useMemo, useState } from 'react'
import { fmtInt } from '../../lib/format.ts'
import { useUserDataMutation } from '../../lib/queries.ts'
import { deleteDeck } from '../../server/library.functions.ts'
import { CardBrowser, type BrowserSearch } from './CardBrowser.tsx'
import { CardEditor, type EditorState } from './CardEditor.tsx'
import { DeckDialog, type DeckDialogState } from './DeckDialog.tsx'
import { DeckHeader } from './DeckHeader.tsx'
import { type DeckActions, DeckTreePanel } from './DeckTreePanel.tsx'
import { Dialog } from './Dialog.tsx'
import { ExportDialog } from './ExportDialog.tsx'
import { ImportDialog } from './ImportDialog.tsx'
import { descendantIds, errorMessage, type TreeNode, usePrefs } from './lib.ts'
import { TagsPanel } from './TagsPanel.tsx'
import { ToastProvider, useToast } from './Toasts.tsx'

interface Props {
  library: LibraryPayload
  cards: CardListResult
  search: BrowserSearch
  setSearch: (patch: Partial<BrowserSearch>) => void
}

/**
 * The /decks page: the deck tree and tags on the side, the selected deck's
 * header and card browser in the main column, and the dialogs they open.
 */
export function DecksManager(props: Props) {
  return (
    <ToastProvider>
      <Manager {...props} />
    </ToastProvider>
  )
}

function Manager({ library, cards, search, setSearch }: Props) {
  const toast = useToast()
  const removeDeck = useUserDataMutation((deck: TreeNode) => deleteDeck({ data: { id: deck.id } }), {
    onSuccess: (_, deck) => {
      toast(`Deleted “${deck.name}”`)
      // If the open deck was deleted (or sat inside it), step up to the parent before the lists refetch.
      if (search.deck && descendantIds(library.decks, deck.id).includes(search.deck)) {
        setSearch({ deck: deck.parentId ?? undefined, page: 1 })
      }
      setDeleting(null)
    },
  })
  const [prefs, setPrefs] = usePrefs('askesis:decks', { collapsed: [] as string[], sideOpen: false })
  const [deckDialog, setDeckDialog] = useState<DeckDialogState>(null)
  const [editor, setEditor] = useState<EditorState>(null)
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState<string[] | null>(null)
  const [deleting, setDeleting] = useState<TreeNode | null>(null)

  const selectedDeck = library.decks.find((d) => d.id === search.deck)
  const totalCards = useMemo(() => library.decks.reduce((n, d) => n + d.cards, 0), [library.decks])

  const actions: DeckActions = {
    select: (id) => {
      setSearch({ deck: id, page: 1 })
      setPrefs({ sideOpen: false })
    },
    newSubdeck: (parentId) => setDeckDialog({ mode: 'create', parentId }),
    edit: (deck, focus) => setDeckDialog({ mode: 'edit', deck, focus }),
    exportDeck: (id) => setExporting([id]),
    remove: (deck) => setDeleting(deck),
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      await removeDeck.mutateAsync(deleting)
    } catch (e) {
      toast(errorMessage(e), 'error')
    }
  }

  const hasDecks = library.decks.length > 0
  const newDeck = () => setDeckDialog({ mode: 'create', parentId: search.deck ?? null })

  return (
    <main className="deckmgr">
      <header className="deckmgr__header">
        <div>
          <h1 className="deckmgr__title">Decks</h1>
          <p className="deckmgr__lead">
            {hasDecks
              ? `${fmtInt(library.decks.length)} ${library.decks.length === 1 ? 'deck' : 'decks'}, ${fmtInt(totalCards)} cards, ${fmtInt(library.tags.length)} ${library.tags.length === 1 ? 'tag' : 'tags'}`
              : 'Your decks and cards live here.'}
          </p>
        </div>
        <div className="deckmgr__actions">
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setImporting(true)}>
            <Upload size={15} /> Import
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setExporting([])} disabled={!hasDecks}>
            <Download size={15} /> Export
          </button>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => setDeckDialog({ mode: 'create', parentId: null })}
          >
            <FolderPlus size={15} /> New deck
          </button>
        </div>
      </header>

      {!hasDecks ? (
        <section className="panel deckmgr-start" aria-labelledby="deckmgr-start-title">
          <h2 id="deckmgr-start-title" className="deckmgr-start__title">
            Start your library
          </h2>
          <p className="deckmgr-start__text">
            A deck is a stack of cards you study together. Nest decks with subdecks, like Spanish › Verbs.
          </p>
          <div className="deckmgr-start__options">
            <button
              type="button"
              className="deckmgr-start__option"
              onClick={() => setDeckDialog({ mode: 'create', parentId: null })}
            >
              <FolderPlus size={22} />
              <strong>Create a deck</strong>
              <span>Name it, pick an icon, then add cards one by one.</span>
            </button>
            <button type="button" className="deckmgr-start__option" onClick={() => setImporting(true)}>
              <Upload size={22} />
              <strong>Import a file</strong>
              <span>CSV, TSV or a plain-text notes export (.txt) from another flashcard app.</span>
            </button>
            <a className="deckmgr-start__option" href="/docs/import-export">
              <BookOpenText size={22} />
              <strong>See the file format</strong>
              <span>Column names, deck paths and how merging works.</span>
            </a>
          </div>
        </section>
      ) : (
        <div className="deckmgr__layout">
          <aside className={clsx('deckmgr-side', prefs.sideOpen && 'is-open')}>
            <button
              type="button"
              className="deckmgr-side__toggle"
              aria-expanded={prefs.sideOpen}
              onClick={() => setPrefs({ sideOpen: !prefs.sideOpen })}
            >
              <span>
                <span className="deckmgr-side__toggle-label">Deck</span>
                {selectedDeck ? selectedDeck.path.replaceAll(DECK_PATH_SEPARATOR, ' › ') : 'All decks'}
              </span>
              <ChevronDown size={16} />
            </button>
            <div className="deckmgr-side__body">
              <div className="panel deckmgr-side__panel">
                <DeckTreePanel
                  library={library}
                  selected={search.deck}
                  collapsed={prefs.collapsed}
                  onCollapse={(collapsed) => setPrefs({ collapsed })}
                  actions={actions}
                />
              </div>
              <div className="panel deckmgr-side__panel">
                <TagsPanel library={library} active={search.tag} onSelect={(tag) => setSearch({ tag, page: 1 })} />
              </div>
            </div>
          </aside>
          <div className="deckmgr__main">
            <DeckHeader
              library={library}
              deckId={search.deck}
              actions={actions}
              onAddCard={() => setEditor({ mode: 'new', deckId: search.deck })}
              onNewDeck={newDeck}
            />
            <CardBrowser
              cards={cards}
              library={library}
              search={search}
              setSearch={setSearch}
              onOpen={(card) => setEditor({ mode: 'edit', card })}
              onNew={() => setEditor({ mode: 'new', deckId: search.deck })}
              onImport={() => setImporting(true)}
            />
          </div>
        </div>
      )}

      <DeckDialog
        state={deckDialog}
        library={library}
        onClose={() => setDeckDialog(null)}
        onCreated={(id) => setSearch({ deck: id, page: 1 })}
      />
      <CardEditor state={editor} library={library} onClose={() => setEditor(null)} />
      <ImportDialog open={importing} library={library} onClose={() => setImporting(false)} />
      <ExportDialog open={exporting !== null} initial={exporting ?? []} library={library} onClose={() => setExporting(null)} />
      <Dialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        size="sm"
        title={deleting ? `Delete “${deleting.name}”?` : ''}
        footer={
          <>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setDeleting(null)}>
              Keep it
            </button>
            <button type="button" className="btn btn--danger btn--sm" onClick={confirmDelete} disabled={removeDeck.isPending}>
              {removeDeck.isPending ? 'Deleting…' : 'Delete deck'}
            </button>
          </>
        }
      >
        {deleting && (
          <p className="deckmgr-confirm">
            This deletes {deleting.children.length > 0 ? 'the deck, its subdecks' : 'the deck'} and{' '}
            <strong>
              {fmtInt(deleting.totalCards)} {deleting.totalCards === 1 ? 'card' : 'cards'}
            </strong>{' '}
            with their review history. Export it first if you might want it back.
          </p>
        )}
      </Dialog>
    </main>
  )
}
