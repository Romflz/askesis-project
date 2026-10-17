import clsx from 'clsx'
import { Check, ChevronDown, ClipboardCopy, Package } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PACKAGE_PROMPT } from '../../content/package-prompt.ts'

/**
 * Askesis can't read .apkg/.colpkg files itself, so this walks the user through
 * converting one to a CSV with an AI assistant that can run Python.
 */
export function PackageHelp({ fileName }: { fileName?: string | null }) {
  const [open, setOpen] = useState(!!fileName)
  const [showPrompt, setShowPrompt] = useState(false)
  const [copied, setCopied] = useState(false)

  // Dropping a package opens the guide.
  useEffect(() => {
    if (fileName) setOpen(true)
  }, [fileName])

  async function copy() {
    try {
      await navigator.clipboard.writeText(PACKAGE_PROMPT)
      setCopied(true)
      setTimeout(() => setCopied(false), 2_000)
    } catch {
      // Clipboard blocked: show the prompt so it can be copied by hand.
      setShowPrompt(true)
    }
  }

  return (
    <section className={clsx('package-help', open && 'is-open', fileName && 'is-alert')}>
      <button type="button" className="package-help__toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Package size={16} />
        <span>{fileName ? `${fileName} is a flashcard package` : 'Have a flashcard package (.apkg or .colpkg)?'}</span>
        <ChevronDown size={16} className="package-help__chevron" />
      </button>
      {open && (
        <div className="package-help__body">
          <p>
            Askesis imports CSV files. An AI assistant that can run code converts your package in a minute, keeping each card’s
            progress:
          </p>
          <ol className="package-help__steps">
            <li>Copy the conversion prompt.</li>
            <li>In ChatGPT, Claude or Gemini, attach your package and paste the prompt.</li>
            <li>Import the CSV it gives you here.</li>
          </ol>
          <div className="package-help__actions">
            <button type="button" className="btn btn--primary btn--sm" onClick={copy}>
              {copied ? <Check size={14} /> : <ClipboardCopy size={14} />}
              {copied ? 'Copied' : 'Copy prompt'}
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setShowPrompt((s) => !s)}
              aria-expanded={showPrompt}
            >
              {showPrompt ? 'Hide prompt' : 'View prompt'}
            </button>
            <a className="link-button" href="/docs/import-export#apkg">
              How this works
            </a>
          </div>
          {showPrompt && (
            <pre className="package-help__prompt" tabIndex={0} aria-label="Conversion prompt">
              {PACKAGE_PROMPT}
            </pre>
          )}
        </div>
      )}
    </section>
  )
}
