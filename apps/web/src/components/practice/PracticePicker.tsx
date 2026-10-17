import type { PublicCategorySlug } from '@askesis/core'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { useState } from 'react'
import { queries } from '../../lib/queries.ts'
import { Dialog } from '../decks/Dialog.tsx'
import { DeckTile } from './PracticeParts.tsx'

/**
 * Quick study for visitors: the free practice decks by topic. Picking one opens
 * its page, where the drill works without an account. The list loads when the
 * popup opens (or earlier, when the button is hovered).
 */
export function PracticePicker({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data } = useQuery({ ...queries.practiceIndex(), enabled: open })
  const [topic, setTopic] = useState<PublicCategorySlug | 'all'>('all')
  const decks = data ? (topic === 'all' ? data.decks : data.decks.filter((d) => d.category === topic)) : []

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="xl"
      className="practice-picker"
      title="Pick a deck to study"
      description="Free decks you can start right away, no account needed. Your progress is saved in this browser."
    >
      {data ? (
        <>
          <div className="practice-filters" role="group" aria-label="Filter by topic">
            <button
              type="button"
              aria-pressed={topic === 'all'}
              className={clsx('practice-chip', topic === 'all' && 'is-active')}
              onClick={() => setTopic('all')}
            >
              All topics
            </button>
            {data.categories.map((c) => (
              <button
                key={c.slug}
                type="button"
                aria-pressed={topic === c.slug}
                className={clsx('practice-chip', topic === c.slug && 'is-active')}
                onClick={() => setTopic(c.slug)}
              >
                {c.title}
              </button>
            ))}
          </div>
          <div className="practice-grid">
            {decks.map((d) => (
              <DeckTile key={d.slug} deck={d} />
            ))}
          </div>
        </>
      ) : (
        <p className="practice-picker__loading" role="status">
          Loading decks…
        </p>
      )}
    </Dialog>
  )
}
