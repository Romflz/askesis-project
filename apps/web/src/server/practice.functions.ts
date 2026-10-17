import {
  decksInCategory,
  getPublicCategory,
  getPublicDeck,
  plainText,
  PUBLIC_CATEGORIES,
  PUBLIC_DECKS,
  type PublicCategory,
  type PublicDeck,
} from '@askesis/core'
import { createServerFn } from '@tanstack/react-start'

// The public practice pages load their data through these server functions, so
// the deck library (dozens of decks, thousands of cards) stays on the server
// instead of shipping in every page's JavaScript. Each page gets only what it shows.

export type DeckTileData = Pick<PublicDeck, 'slug' | 'title' | 'shortTitle' | 'description' | 'icon' | 'level' | 'category'> & {
  cardCount: number
}

export type CategoryLink = Pick<PublicCategory, 'slug' | 'title' | 'headline' | 'description' | 'inlineTitle'>

const tile = (d: PublicDeck): DeckTileData => ({
  slug: d.slug,
  title: d.title,
  shortTitle: d.shortTitle,
  description: d.description,
  icon: d.icon,
  level: d.level,
  category: d.category,
  cardCount: d.cards.length,
})

const link = (c: PublicCategory): CategoryLink => ({
  slug: c.slug,
  title: c.title,
  headline: c.headline,
  description: c.description,
  inlineTitle: c.inlineTitle,
})

// Slugs come straight from the URL; lookups only need a bounded string.
const slugInput = (value: unknown) => String(value).slice(0, 120)

/** One deck's landing page: the deck, its topic, related decks and plain-text cards for JSON-LD. */
export const getDeckPage = createServerFn({ method: 'GET' })
  .validator(slugInput)
  .handler(({ data }) => {
    const deck = getPublicDeck(data)
    if (!deck) return null
    return {
      deck,
      category: link(getPublicCategory(deck.category)!),
      related: decksInCategory(deck.category)
        .filter((d) => d.slug !== deck.slug)
        .map(tile),
      plain: deck.cards.map((c) => ({ q: plainText(c.hint ? `${c.hint}: ${c.front}` : c.front), a: plainText(c.back) })),
    }
  })

/** The /practice index: every deck as a tile, and the topics. */
export const getPracticeIndex = createServerFn({ method: 'GET' }).handler(() => ({
  decks: PUBLIC_DECKS.map(tile),
  categories: PUBLIC_CATEGORIES.map(link),
  totalCards: PUBLIC_DECKS.reduce((n, d) => n + d.cards.length, 0),
}))

/** A topic landing page: the topic's copy and FAQ, its decks, and the other topics. */
export const getCategoryPage = createServerFn({ method: 'GET' })
  .validator(slugInput)
  .handler(({ data }) => {
    const category = getPublicCategory(data)
    if (!category) return null
    return {
      category,
      decks: decksInCategory(category.slug).map(tile),
      others: PUBLIC_CATEGORIES.filter((c) => c.slug !== category.slug).map(link),
    }
  })
