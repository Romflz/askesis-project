import type { LibraryPayload } from '@askesis/contracts'
import clsx from 'clsx'
import { Download, FileSpreadsheet, FileText, History, Table2, TrendingUp } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { fmtInt } from '../../lib/format.ts'
import { exportCards } from '../../server/library.functions.ts'
import { useStoredState } from '../study/prefs.ts'
import { DeckGlyph } from '../askesis/ui.tsx'
import { Dialog } from './Dialog.tsx'
import { buildTree, descendantIds, downloadText, errorMessage, flatten } from './lib.ts'
import { useToast } from './Toasts.tsx'

type Format = 'csv' | 'tsv' | 'txt'

const FORMATS: Record<Format, { label: string; ext: string; type: string; help: string; icon: React.ReactNode }> = {
  csv: {
    label: 'CSV',
    ext: 'csv',
    type: 'text/csv;charset=utf-8',
    help: 'Opens in spreadsheets; imports back into Askesis.',
    icon: <FileSpreadsheet size={18} />,
  },
  tsv: {
    label: 'TSV',
    ext: 'tsv',
    type: 'text/tab-separated-values;charset=utf-8',
    help: 'Tab-separated, safest for text full of commas.',
    icon: <Table2 size={18} />,
  },
  txt: {
    label: 'Plain text',
    ext: 'txt',
    type: 'text/plain;charset=utf-8',
    help: 'Tab-separated with header lines for deck and tags; other flashcard apps can import it.',
    icon: <FileText size={18} />,
  },
}

/**
 * Export whole decks (subdecks included) as CSV, TSV or plain text,
 * optionally with study progress and the full review history.
 */
export function ExportDialog({
  open,
  initial,
  library,
  onClose,
}: {
  open: boolean
  /** Decks to preselect; empty selects everything. */
  initial: string[]
  library: LibraryPayload
  onClose: () => void
}) {
  const toast = useToast()
  const rows = useMemo(() => flatten(buildTree(library.decks)), [library.decks])
  const [selected, setSelected] = useState<string[]>([])
  // What to include is remembered per device; a backup keeps everything by default.
  const [include, setInclude] = useStoredState('askesis-export-include', { progress: true, history: true })
  const scheduling = include.progress
  // The API exports history only along with progress, so unticking progress turns history off too.
  const history = include.progress && include.history
  const [format, setFormat] = useState<Format>('csv')
  const [semicolons, setSemicolons] = useState(false)
  // A read, not a write: nothing to invalidate afterwards.
  const exportFile = useMutation({ mutationFn: exportCards })
  const busy = exportFile.isPending

  useEffect(() => {
    if (!open) return
    setSelected(
      initial.length ? [...new Set(initial.flatMap((id) => descendantIds(library.decks, id)))] : library.decks.map((d) => d.id),
    )
  }, [open, initial, library.decks])

  // Exporting a deck always includes its subdecks, so checking one checks the branch.
  function toggle(id: string) {
    const branch = descendantIds(library.decks, id)
    setSelected((s) => (s.includes(id) ? s.filter((x) => !branch.includes(x)) : [...new Set([...s, ...branch])]))
  }

  const cardCount = library.decks.filter((d) => selected.includes(d.id)).reduce((n, d) => n + d.cards, 0)
  const all = selected.length === library.decks.length

  async function run() {
    try {
      // Send only the top-most selected decks; the server adds their subdecks.
      const tops = selected.filter((id) => {
        const deck = library.decks.find((d) => d.id === id)
        return !deck?.parentId || !selected.includes(deck.parentId)
      })
      const separator = format === 'csv' ? (semicolons ? 'semicolon' : 'comma') : 'tab'
      const result = await exportFile.mutateAsync({ data: { deckIds: all ? [] : tops, scheduling, history, separator } })
      const ext = FORMATS[format].ext
      const filename = result.filename.replace(/\.(csv|tsv)$/, `.${ext}`)
      downloadText(filename, result.content, FORMATS[format].type)
      toast(`Exported ${fmtInt(result.cards)} cards`)
      onClose()
    } catch (e) {
      toast(errorMessage(e, 'The export failed.'), 'error')
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="md"
      title="Export cards"
      description="Subdecks come along with their parent. Askesis and other flashcard apps can import the file."
      footer={
        <>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn--primary btn--sm" onClick={run} disabled={busy || selected.length === 0}>
            <Download size={14} />
            {busy ? 'Exporting…' : `Export ${fmtInt(cardCount)} ${cardCount === 1 ? 'card' : 'cards'}`}
          </button>
        </>
      }
    >
      <div className="deckmgr-export">
        <div className="deckmgr-export__bar">
          <span className="eyebrow">
            {selected.length} of {library.decks.length} decks
          </span>
          <span>
            <button type="button" className="link-button" onClick={() => setSelected(library.decks.map((d) => d.id))}>
              All
            </button>
            {' · '}
            <button type="button" className="link-button" onClick={() => setSelected([])}>
              None
            </button>
          </span>
        </div>
        <ul className="deckmgr-export__list">
          {rows.map((d) => (
            <li key={d.id} style={{ '--depth': d.depth } as React.CSSProperties}>
              <label className={clsx('deckmgr-export__row', selected.includes(d.id) && 'is-checked')}>
                <input type="checkbox" checked={selected.includes(d.id)} onChange={() => toggle(d.id)} />
                <DeckGlyph icon={d.icon} size="sm" />
                <span className="deckmgr-export__name">{d.name}</span>
                <span className="deckmgr-export__n">{fmtInt(d.cards)}</span>
              </label>
            </li>
          ))}
        </ul>
        <fieldset className="deckmgr-formats">
          <legend className="field__label">Format</legend>
          <div className="deckmgr-formats__grid" role="radiogroup" aria-label="Format">
            {(Object.keys(FORMATS) as Format[]).map((f) => (
              <label key={f} className={clsx('deckmgr-format', format === f && 'is-checked')}>
                <input type="radio" name="export-format" value={f} checked={format === f} onChange={() => setFormat(f)} />
                {FORMATS[f].icon}
                <span className="deckmgr-format__name">
                  {FORMATS[f].label} <span className="deckmgr-format__ext">.{FORMATS[f].ext}</span>
                </span>
              </label>
            ))}
          </div>
          <p className="deckmgr-formats__help">{FORMATS[format].help}</p>
          {format === 'csv' && (
            <label className="pop__check deckmgr-formats__option">
              <input type="checkbox" checked={semicolons} onChange={(e) => setSemicolons(e.target.checked)} />
              Separate with semicolons (for spreadsheets set to a European locale)
            </label>
          )}
        </fieldset>
        <fieldset className="deckmgr-include">
          <legend className="field__label">Include</legend>
          <label className={clsx('deckmgr-include__item', scheduling && 'is-checked')}>
            <input type="checkbox" checked={scheduling} onChange={(e) => setInclude({ progress: e.target.checked })} />
            <TrendingUp size={18} aria-hidden />
            <span>
              <span className="deckmgr-include__title">Study progress</span>
              <span className="deckmgr-include__help">
                New cards stay new. Learning and review cards keep their due date, interval, ease, memory and learning step;
                suspended cards stay suspended. Untick to share cards so others start fresh.
              </span>
            </span>
          </label>
          <label className={clsx('deckmgr-include__item', history && 'is-checked', !scheduling && 'is-disabled')}>
            <input
              type="checkbox"
              checked={history}
              disabled={!scheduling}
              onChange={(e) => setInclude({ history: e.target.checked })}
            />
            <History size={18} aria-hidden />
            <span>
              <span className="deckmgr-include__title">Review history</span>
              <span className="deckmgr-include__help">
                Every past answer, so your heatmap, streak, XP and stats come back when you import the file.
              </span>
            </span>
          </label>
          {scheduling && format === 'txt' && (
            <p className="deckmgr-formats__help">Other apps skip these columns; Askesis restores them.</p>
          )}
        </fieldset>
      </div>
    </Dialog>
  )
}
