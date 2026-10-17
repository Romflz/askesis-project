import { createFileRoute } from '@tanstack/react-router'
import { CARD_SPEC_MD } from '../content/card-spec.ts'
import { absoluteUrl } from '../lib/seo.ts'

// Plain-text spec for AI agents (the llms.txt convention): how to write card
// files and card syntax. The same text is shown on /docs/for-ai-agents.
const BODY = `${CARD_SPEC_MD}
---
Human-readable docs: ${absoluteUrl('/docs')}
This file: ${absoluteUrl('/llms.txt')}
`

export const Route = createFileRoute('/llms.txt')({
  server: {
    handlers: {
      GET: () =>
        new Response(BODY, {
          headers: { 'content-type': 'text/markdown; charset=utf-8', 'cache-control': 'public, max-age=300' },
        }),
    },
  },
})
