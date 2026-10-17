import type { SessionUser } from '@askesis/contracts'
import { practiceCardIdentifier, type PublicDeck } from '@askesis/core'
import type { DeckTileData } from '../../server/practice.functions.ts'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Check, LoaderCircle, Plus, UserPlus } from 'lucide-react'
import { useUserDataMutation } from '../../lib/queries.ts'
import { importCards } from '../../server/library.functions.ts'
import { DeckGlyph } from '../askesis/ui.tsx'

export const LEVEL_LABEL = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' } as const

/** A deck tile linking to its landing page. */
export function DeckTile({ deck }: { deck: DeckTileData }) {
  return (
    <Link to="/practice/$slug" params={{ slug: deck.slug }} className="practice-tile">
      <div className="practice-tile__head">
        <DeckGlyph icon={deck.icon} />
        <span className="practice-tile__level">{LEVEL_LABEL[deck.level]}</span>
      </div>
      <h3 className="practice-tile__title">{deck.shortTitle}</h3>
      <p className="practice-tile__desc">{deck.description}</p>
      <span className="practice-tile__foot">
        {deck.cardCount} cards <ArrowRight size={14} />
      </span>
    </Link>
  )
}

/** An FAQ list built on native <details>, so it opens before hydration and needs no state. */
export function Faq({ items, title = 'Frequently asked questions' }: { items: { q: string; a: string }[]; title?: string }) {
  return (
    <section className="practice-faq" aria-labelledby="faq-title">
      <h2 id="faq-title" className="practice-section-title">
        {title}
      </h2>
      <div className="practice-faq__list">
        {items.map((item) => (
          <details key={item.q} className="practice-faq__item">
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

/**
 * Signed in: copy the deck into the user's collection (merging by deck name and
 * skipping cards they already have). Anonymous: sign up, then come back here.
 */
export function AddToDecks({ deck, user, compact = false }: { deck: PublicDeck; user: SessionUser | null; compact?: boolean }) {
  const addDeck = useUserDataMutation(async () =>
    importCards({
      data: {
        defaultDeck: deck.shortTitle,
        duplicates: 'skip',
        // A fixed identifier per card, so adding the deck again skips the cards already added.
        rows: await Promise.all(
          deck.cards.map(async (c) => ({
            identifier: await practiceCardIdentifier(deck.slug, c.front),
            deck: null,
            front: c.front,
            back: c.back,
            hint: c.hint,
            extra: c.extra,
            tags: [deck.slug],
          })),
        ),
      },
    }),
  )

  if (!user) {
    return (
      <Link to="/register" search={{ redirect: `/practice/${deck.slug}` }} className="btn btn--primary">
        <UserPlus size={16} /> {compact ? 'Create a free account' : 'Create a free account to keep your progress'}
      </Link>
    )
  }

  const result = addDeck.data
  const status = addDeck.isError
    ? 'Couldn’t add the deck. Try again.'
    : result
      ? result.added > 0
        ? `${result.added} ${result.added === 1 ? 'card' : 'cards'} added to “${deck.shortTitle}”${result.skipped ? `, ${result.skipped} you already had ${result.skipped === 1 ? 'was' : 'were'} skipped` : ''}.`
        : 'You already have every card from this deck; nothing new was added.'
      : `Adds the cards to a deck named “${deck.shortTitle}”. Cards you already have are skipped.`

  return (
    <div className="practice-add">
      <button type="button" className="btn btn--primary" onClick={() => addDeck.mutate()} disabled={addDeck.isPending}>
        {addDeck.isPending ? <LoaderCircle size={16} className="auth-spin" /> : result ? <Check size={16} /> : <Plus size={16} />}
        {result ? 'Added to your decks' : 'Add to my decks'}
      </button>
      <p className="practice-add__status" role="status">
        {status}
      </p>
      {result && (
        <Link to="/dashboard" className="practice-add__link">
          Go to your dashboard <ArrowRight size={14} />
        </Link>
      )}
    </div>
  )
}
