import type { CardContent } from './collection.ts'
import type { DeckIcon } from './types.ts'

// Decks every new account starts with, so the first review session is one
// click away.

export interface StarterDeck {
  name: string
  description: string
  icon: DeckIcon
  cards: CardContent[]
}

export const STARTER_DECKS: StarterDeck[] = [
  {
    name: 'Askesis Basics',
    description: 'How spaced repetition and Askesis work.',
    icon: 'spark',
    cards: [
      {
        front: 'What is spaced repetition?',
        back: 'Reviewing material at growing intervals, timed for just before you would forget it',
      },
      {
        front: 'What does askesis mean?',
        back: 'Training through practice; the Greek word for exercise',
        extra: 'The Stoics used it for the daily exercises that build a habit of mind.',
      },
      {
        front: 'What is an engram?',
        back: 'The physical trace a memory leaves in the brain',
        extra: 'The term was coined by Richard Semon in 1904.',
      },
      {
        front: 'What does the Again button do?',
        back: 'Marks the card as forgotten; it comes back after a short relearning step',
      },
      { front: 'When should you press Hard?', back: 'When you recalled the answer, but only with real effort' },
      { front: 'What does Good do?', back: 'The normal answer: the card moves to its next step or a longer interval' },
      { front: 'When should you press Easy?', back: 'When the answer came instantly; the card jumps ahead further' },
      {
        front: 'What is a learning step?',
        back: 'A short, same-day delay (like 1m or 10m) a new card passes before it graduates',
      },
      {
        front: 'What is the graduating interval?',
        back: 'The first interval in days a card gets after its learning steps',
        extra: 'The default in Askesis is 1 day.',
      },
      { front: 'What is a mature card?', back: 'A card with an interval of 21 days or more' },
      { front: 'Who first described the forgetting curve?', back: 'Hermann Ebbinghaus, in 1885' },
      {
        front: 'How is the forgetting curve often modeled?',
        back: String.raw`\(R = e^{-t/S}\)`,
        extra: 'R is the chance of recall, t the time since the last review, S how stable the memory is.',
      },
      {
        front: 'How do you put math on a card?',
        back: 'Wrap LaTeX in `\\( … \\)` inline or `\\[ … \\]` for display, e.g. \\(e^{i\\pi} + 1 = 0\\)',
      },
      {
        front: 'How do you put code on a card?',
        back: 'Use a fenced block with a language:\n```ts\nconst answer: number = 42\n```',
        extra: 'Inline `code` works too.',
      },
      {
        front: 'What is FSRS?',
        back: 'The Free Spaced Repetition Scheduler, a model that predicts when you will forget each card',
        extra: 'Switch it on per deck preset in Settings.',
      },
      {
        front: 'What is desired retention in FSRS?',
        back: 'How likely you want to be to remember a card when it comes due',
        extra: 'Defaults to 90%.',
      },
      { front: 'What does a streak freeze do?', back: 'Covers one missed day automatically so your streak survives' },
    ],
  },
  {
    name: 'World Capitals',
    description: 'Twenty capitals people often get wrong.',
    icon: 'globe',
    cards: [
      ['Australia', 'Canberra'],
      ['Canada', 'Ottawa'],
      ['Turkey', 'Ankara'],
      ['Brazil', 'Brasília'],
      ['Switzerland', 'Bern'],
      ['New Zealand', 'Wellington'],
      ['Morocco', 'Rabat'],
      ['Vietnam', 'Hanoi'],
      ['Nigeria', 'Abuja'],
      ['Pakistan', 'Islamabad'],
      ['Kazakhstan', 'Astana'],
      ['Mongolia', 'Ulaanbaatar'],
      ['Bhutan', 'Thimphu'],
      ['Myanmar', 'Naypyidaw'],
      ['Tanzania', 'Dodoma'],
      ['Bolivia', 'Sucre (constitutional) and La Paz (seat of government)'],
      ['Sri Lanka', 'Sri Jayawardenepura Kotte'],
      ['Côte d’Ivoire', 'Yamoussoukro'],
      ['Burkina Faso', 'Ouagadougou'],
      ['Iceland', 'Reykjavík'],
    ].map(([country, capital]) => ({ front: country!, hint: 'Capital city', back: capital! })),
  },
]
