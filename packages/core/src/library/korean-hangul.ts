import type { PublicDeck } from './types.ts'

// [Hangul, Revised Romanization, kind, example or note]
const LETTERS: [string, string, string, string][] = [
  // The 14 basic consonants
  ['ㄱ', 'g · k at the end of a syllable', 'Consonant', '가방 (gabang) · bag. At the end: 책 (chaek) · book'],
  ['ㄴ', 'n', 'Consonant', '나무 (namu) · tree'],
  ['ㄷ', 'd · t at the end of a syllable', 'Consonant', '다리 (dari) · leg; bridge'],
  ['ㄹ', 'r before a vowel · l at the end of a syllable', 'Consonant', '라면 (ramyeon) · instant noodles; 물 (mul) · water'],
  ['ㅁ', 'm', 'Consonant', '머리 (meori) · head; hair'],
  ['ㅂ', 'b · p at the end of a syllable', 'Consonant', '바다 (bada) · sea'],
  [
    'ㅅ',
    's · t at the end of a syllable',
    'Consonant',
    '사람 (saram) · person. Before ㅣ it sounds like “sh”: 시 (si) · poem; o’clock',
  ],
  ['ㅇ', 'silent at the start · ng at the end of a syllable', 'Consonant', '아이 (ai) · child; 강 (gang) · river'],
  ['ㅈ', 'j · t at the end of a syllable', 'Consonant', '자전거 (jajeongeo) · bicycle'],
  ['ㅊ', 'ch · t at the end of a syllable', 'Consonant', '친구 (chingu) · friend. Aspirated: ㅈ with a puff of air'],
  ['ㅋ', 'k', 'Consonant', '커피 (keopi) · coffee. Aspirated ㄱ'],
  ['ㅌ', 't', 'Consonant', '토마토 (tomato) · tomato. Aspirated ㄷ'],
  ['ㅍ', 'p', 'Consonant', '포도 (podo) · grapes. Aspirated ㅂ'],
  ['ㅎ', 'h', 'Consonant', '하나 (hana) · one'],
  // The 5 double (tense) consonants
  [
    'ㄲ',
    'kk · k at the end of a syllable',
    'Double consonant',
    '꼬리 (kkori) · tail. Tense, with no puff of air; at the end: 밖 (bak) · outside',
  ],
  ['ㄸ', 'tt', 'Double consonant', '딸 (ttal) · daughter. Tense ㄷ'],
  ['ㅃ', 'pp', 'Double consonant', '빵 (ppang) · bread. Tense ㅂ'],
  [
    'ㅆ',
    'ss · t at the end of a syllable',
    'Double consonant',
    '쌀 (ssal) · uncooked rice; at the end: 있다 (itda) · to be there; to have',
  ],
  ['ㅉ', 'jj', 'Double consonant', '짜다 (jjada) · to be salty. Tense ㅈ'],
  // The 10 basic vowels
  ['ㅏ', 'a', 'Vowel', '아버지 (abeoji) · father'],
  ['ㅑ', 'ya', 'Vowel', '야구 (yagu) · baseball'],
  ['ㅓ', 'eo', 'Vowel', '어머니 (eomeoni) · mother. An open “uh”, close to the vowel in “up”'],
  ['ㅕ', 'yeo', 'Vowel', '여자 (yeoja) · woman'],
  ['ㅗ', 'o', 'Vowel', '오이 (oi) · cucumber'],
  ['ㅛ', 'yo', 'Vowel', '요리 (yori) · cooking; dish'],
  ['ㅜ', 'u', 'Vowel', '우유 (uyu) · milk'],
  ['ㅠ', 'yu', 'Vowel', '유리 (yuri) · glass'],
  ['ㅡ', 'eu', 'Vowel', '음악 (eumak) · music. Like “oo” said with spread, unrounded lips'],
  ['ㅣ', 'i', 'Vowel', '이름 (ireum) · name'],
  // The 11 compound vowels
  ['ㅐ', 'ae', 'Compound vowel', '개 (gae) · dog. Like the “e” in “bed”; in modern Seoul speech it sounds the same as ㅔ'],
  ['ㅒ', 'yae', 'Compound vowel', '얘기 (yaegi) · talk; story'],
  ['ㅔ', 'e', 'Compound vowel', '네 (ne) · yes'],
  ['ㅖ', 'ye', 'Compound vowel', '시계 (sigye) · clock; watch'],
  ['ㅘ', 'wa', 'Compound vowel', '사과 (sagwa) · apple. ㅗ + ㅏ'],
  ['ㅙ', 'wae', 'Compound vowel', '왜 (wae) · why. ㅗ + ㅐ'],
  ['ㅚ', 'oe', 'Compound vowel', '회사 (hoesa) · company. ㅗ + ㅣ, usually pronounced like “we”'],
  ['ㅝ', 'wo', 'Compound vowel', '뭐 (mwo) · what. ㅜ + ㅓ'],
  ['ㅞ', 'we', 'Compound vowel', '웨이터 (weiteo) · waiter. ㅜ + ㅔ'],
  ['ㅟ', 'wi', 'Compound vowel', '귀 (gwi) · ear. ㅜ + ㅣ'],
  ['ㅢ', 'ui', 'Compound vowel', '의사 (uisa) · doctor. ㅡ + ㅣ'],
  // Building syllable blocks
  ['가', 'ga', 'Syllable', 'ㄱ + ㅏ. A vertical vowel sits to the right of the consonant'],
  ['고', 'go', 'Syllable', 'ㄱ + ㅗ. A horizontal vowel sits below the consonant'],
  ['아', 'a', 'Syllable', 'ㅇ + ㅏ. A syllable can’t start with a bare vowel, so a silent ㅇ fills the first slot'],
  ['한', 'han', 'Syllable', 'ㅎ + ㅏ + ㄴ. A final consonant (batchim) goes at the bottom'],
  ['밥', 'bap', 'Syllable', 'ㅂ + ㅏ + ㅂ: cooked rice; a meal. A final ㅂ is an unreleased p'],
  ['닭', 'dak', 'Syllable', 'ㄷ + ㅏ + ㄺ: chicken. Of a double final consonant, usually only one is pronounced'],
  ['한글', 'Hangeul · the Korean alphabet', 'Word', 'Created under King Sejong and published in 1446'],
  ['한국', 'Hanguk · Korea', 'Word', '한국어 (Hangugeo) · the Korean language'],
  ['안녕하세요', 'annyeonghaseyo · hello', 'Word', 'The everyday polite greeting, for any time of day'],
  [
    '감사합니다',
    'gamsahamnida · thank you',
    'Word',
    'Formal. The ㅂ before ㄴ is pronounced m, and romanization follows the sound',
  ],
]

export const KOREAN_HANGUL: PublicDeck = {
  slug: 'korean-hangul',
  title: 'Korean Hangul: all 40 letters and first syllables',
  shortTitle: 'Korean Hangul',
  category: 'languages',
  level: 'beginner',
  icon: 'globe',
  description:
    'Learn to read Korean: all 14 basic consonants, 5 double consonants and 21 vowels of Hangul, plus how letters stack into syllable blocks, with Revised Romanization.',
  intro:
    'Hangul was designed to be learned quickly: 24 basic letters plus doubled and combined forms, assembled into square syllable blocks. This deck covers every letter with an example word, then ten syllables and words that show how blocks are built, from 가 to 감사합니다.',
  faq: [
    {
      q: 'How long does it take to learn Hangul?',
      a: 'Many learners can sound out Hangul within a few days to a week of short daily sessions. Reading quickly takes more practice with real words.',
    },
    {
      q: 'Which romanization does this deck use?',
      a: 'The Revised Romanization of Korean, South Korea’s official system since 2000 and the one on road signs and in most textbooks (eo for ㅓ, eu for ㅡ).',
    },
    {
      q: 'Why do some consonants have two romanizations?',
      a: 'Their sound changes with position: ㄱ, ㄷ and ㅂ are g, d and b before a vowel but k, t and p at the end of a syllable, and ㄹ is r before a vowel but l at the end.',
    },
  ],
  cards: LETTERS.map(([front, back, hint, extra]) => ({ front, back, hint, extra })),
}
