import clsx from 'clsx'
import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

/** Copies `text` to the clipboard and says so for two seconds. */
export function CopyButton({ text, label, className }: { text: string; label: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      className={clsx('btn btn--sm', className ?? 'btn--primary')}
      onClick={async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
    >
      {copied ? <Check size={15} /> : <Copy size={15} />}
      {copied ? 'Copied' : label}
    </button>
  )
}
