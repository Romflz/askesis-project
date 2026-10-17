import type { PublicDeck } from './types.ts'

// Codes are written with . and - here, then shown as · and − and spoken the way operators say them:
// “dah” for a dash, “di” for a dot inside a character and “dit” for a dot at its end.
const show = (code: string) => [...code].map((c) => (c === '.' ? '·' : '−')).join(' ')
const say = (code: string) => [...code].map((c, i) => (c === '-' ? 'dah' : i === code.length - 1 ? 'dit' : 'di')).join('-')

// [character, code, hint, memory aid or usage note]
const SIGNS: [string, string, string, string][] = [
  // Letters
  ['A', '.-', 'Letter', 'The reverse of N'],
  ['B', '-...', 'Letter', 'The reverse of V'],
  ['C', '-.-.', 'Letter', 'Sounds like N twice'],
  ['D', '-..', 'Letter', 'The reverse of U'],
  ['E', '.', 'Letter', 'A single dit: the shortest code, for the most common letter in English'],
  ['F', '..-.', 'Letter', 'The reverse of L'],
  ['G', '--.', 'Letter', 'The reverse of W'],
  ['H', '....', 'Letter', 'Four dits. E, I, S and H each add one more'],
  ['I', '..', 'Letter', 'Two dits. Swap dits for dahs and you get M'],
  ['J', '.---', 'Letter', 'A dit followed by O'],
  ['K', '-.-', 'Letter', 'R with dits and dahs swapped. On its own it means “over to you”'],
  ['L', '.-..', 'Letter', 'The reverse of F'],
  ['M', '--', 'Letter', 'Two dahs. T, M and O each add one more'],
  ['N', '-.', 'Letter', 'The reverse of A'],
  ['O', '---', 'Letter', 'Three dahs, the middle of SOS'],
  ['P', '.--.', 'Letter', 'Reads the same both ways. Swap dits and dahs and you get X'],
  ['Q', '--.-', 'Letter', 'The reverse of Y'],
  ['R', '.-.', 'Letter', 'Reads the same both ways. Swap dits and dahs and you get K'],
  ['S', '...', 'Letter', 'Three dits, the start and end of SOS'],
  ['T', '-', 'Letter', 'A single dah, for the second most common letter in English'],
  ['U', '..-', 'Letter', 'The reverse of D'],
  ['V', '...-', 'Letter', 'The reverse of B. Its rhythm matches the opening of Beethoven’s Fifth Symphony'],
  ['W', '.--', 'Letter', 'The reverse of G'],
  ['X', '-..-', 'Letter', 'Reads the same both ways. Also used as the multiplication sign'],
  ['Y', '-.--', 'Letter', 'The reverse of Q'],
  ['Z', '--..', 'Letter', 'Two dahs, then two dits'],
  // Digits: always five elements
  ['1', '.----', 'Digit', 'Digits 1 to 5 start with as many dits as the digit, then dahs to make five'],
  ['2', '..---', 'Digit', 'Two dits, then dahs to make five'],
  ['3', '...--', 'Digit', 'Three dits, then dahs to make five'],
  ['4', '....-', 'Digit', 'Four dits, then a dah'],
  ['5', '.....', 'Digit', 'All dits. Every digit is five elements long'],
  ['6', '-....', 'Digit', 'Digits 6 to 9 start with dahs, one for 6 up to four for 9, then dits to make five'],
  ['7', '--...', 'Digit', 'Two dahs, then dits to make five'],
  ['8', '---..', 'Digit', 'Three dahs, then dits to make five'],
  ['9', '----.', 'Digit', 'Four dahs, then a dit'],
  ['0', '-----', 'Digit', 'All dahs: the opposite of 5'],
  // Punctuation
  ['.', '.-.-.-', 'Full stop (period)', 'A three times'],
  [',', '--..--', 'Comma', 'Two dahs, two dits, two dahs'],
  ['?', '..--..', 'Question mark', 'The comma with dits and dahs swapped. Also used to ask for a repeat'],
  ['/', '-..-.', 'Slash', 'X followed by a dit'],
  ['@', '.--.-.', 'At sign', 'A and C run together. Added to the international standard in 2004'],
  ['-', '-....-', 'Hyphen', '6 followed by a dah'],
  ["'", '.----.', 'Apostrophe', '1 followed by a dit'],
  ['(', '-.--.', 'Opening bracket', 'Y followed by a dit'],
  [')', '-.--.-', 'Closing bracket', 'Sounds like K twice'],
  // Procedural signals: two letters sent as one character, with no gap between them
  ['SOS', '...---...', 'Signal: distress', 'Sent as one unbroken signal, not as three letters. It doesn’t stand for anything'],
  ['AR', '.-.-.', 'Signal: end of message', 'A and R run together. The same code as +'],
  ['SK', '...-.-', 'Signal: end of contact', 'S and K run together, the last signal of a conversation'],
  ['BT', '-...-', 'Signal: break', 'B and T run together, to separate parts of a message. The same code as ='],
  ['HH', '........', 'Signal: error', 'Eight dits, like H twice. The operator then resends the last word'],
]

export const MORSE_CODE: PublicDeck = {
  slug: 'morse-code',
  title: 'Morse code: letters, digits and signals',
  shortTitle: 'Morse code',
  category: 'cs',
  level: 'beginner',
  icon: 'globe',
  description:
    'Learn International Morse code: all 26 letters, the 10 digits, common punctuation and signals like SOS, each with its rhythm and a memory aid.',
  intro:
    'Morse code spells each character as a short pattern of dots and dashes, called dits and dahs. This deck covers the 26 letters, the 10 digits, common punctuation and the signals operators use to break and end a message, in International Morse. Each card shows a character; recall its code, then check how it sounds and a memory aid.',
  faq: [
    {
      q: 'Should I learn Morse code by sight or by sound?',
      a: 'By sound, if you want to receive it. Operators learn each character as a rhythm, di-dah for A, rather than counting dots and dashes. Saying the rhythm aloud as you review helps.',
    },
    {
      q: 'How long are the dits, dahs and gaps?',
      a: 'A dah lasts as long as three dits. The gap inside a character is one dit long, between characters three dits, and between words seven dits.',
    },
    {
      q: 'What does SOS stand for?',
      a: 'Nothing. It was chosen because its pattern, three dits, three dahs and three dits, is easy to send and hard to mistake. It’s sent as one unbroken signal, not as three separate letters.',
    },
    {
      q: 'What are signals like AR and SK?',
      a: 'Two letters sent as one character, with no gap, to manage a conversation. AR ends a message, SK ends the contact, BT separates parts of a message, and eight dits mark an error.',
    },
  ],
  cards: SIGNS.map(([front, code, hint, note]) => ({ front, back: show(code), hint, extra: `Said “${say(code)}”. ${note}` })),
}
