import { ExternalLink } from 'lucide-react'
import { CARD_PROMPT } from '../../content/card-prompt.ts'
import { CARD_SPEC_MD } from '../../content/card-spec.ts'
import { PACKAGE_PROMPT } from '../../content/package-prompt.ts'
import { CopyButton } from '../askesis/CopyButton.tsx'

/** The full agent spec: copy it, open it raw, or read it inline. */
export function AgentSpec() {
  return (
    <div className="docs-agent">
      <div className="docs-agent__actions">
        <CopyButton text={CARD_SPEC_MD} label="Copy spec" />
        <a className="btn btn--ghost btn--sm" href="/llms.txt" target="_blank" rel="noreferrer">
          <ExternalLink size={15} /> Open /llms.txt
        </a>
      </div>
      <figure className="docs-code docs-agent__spec">
        <figcaption className="docs-code__label">askesis-card-spec.md</figcaption>
        <pre>
          <code>{CARD_SPEC_MD}</code>
        </pre>
      </figure>
    </div>
  )
}

/** A copy-paste prompt, shown in full with a copy button. */
function PromptBlock({ text, file }: { text: string; file: string }) {
  return (
    <div className="docs-agent">
      <div className="docs-agent__actions">
        <CopyButton text={text} label="Copy prompt" />
      </div>
      <figure className="docs-code docs-agent__spec">
        <figcaption className="docs-code__label">{file}</figcaption>
        <pre>
          <code>{text}</code>
        </pre>
      </figure>
    </div>
  )
}

/** The prompt that has a chat assistant write a deck as an importable CSV. */
export function CardPrompt() {
  return <PromptBlock text={CARD_PROMPT} file="make-a-deck-prompt.txt" />
}

/** The copy-paste prompt for converting a flashcard package (.apkg, .colpkg) with an AI assistant. */
export function PackagePrompt() {
  return <PromptBlock text={PACKAGE_PROMPT} file="package-to-askesis-prompt.txt" />
}
