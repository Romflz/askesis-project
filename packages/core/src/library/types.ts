import type { CardContent } from '../collection.ts'
import type { DeckIcon } from '../types.ts'

// Free public decks: practiced without an account on /practice, and copied into
// a user's collection with "Add to my decks".

export type PublicCategorySlug =
  | 'japanese'
  | 'languages'
  | 'programming'
  | 'web'
  | 'databases'
  | 'cs'
  | 'data-ai'
  | 'devops'
  | 'chemistry'
  | 'biology'
  | 'physics'
  | 'math'
  | 'engineering'

export interface PublicDeck {
  slug: string
  title: string
  /** For chips and breadcrumbs. */
  shortTitle: string
  category: PublicCategorySlug
  level: 'beginner' | 'intermediate' | 'advanced'
  icon: DeckIcon
  /** One or two sentences; used for meta descriptions. */
  description: string
  /** A short paragraph for the landing page. */
  intro: string
  faq: { q: string; a: string }[]
  cards: CardContent[]
}

export interface PublicCategory {
  slug: PublicCategorySlug
  title: string
  /** The title mid-sentence ("Explore …", "More … decks"); proper nouns keep their capitals. */
  inlineTitle: string
  /** Keyword-rich H1 for the landing page. */
  headline: string
  description: string
  intro: string
  benefits: { title: string; text: string }[]
  faq: { q: string; a: string }[]
}
