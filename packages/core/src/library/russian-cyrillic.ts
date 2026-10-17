import type { PublicDeck } from './types.ts'

// [Cyrillic, transliteration · sound or meaning, kind, example or note]
// Stress is marked with a combining acute accent (U+0301), as in learner dictionaries. One-syllable words and ё
// carry no mark.
const CARDS: [string, string, string, string][] = [
  // The 33 letters
  ['А а', 'a · as in “father”', 'Vowel', 'ма́ма (mama) · mum; mom'],
  ['Б б', 'b · as in “bed”', 'Consonant', 'ба́бушка (babushka) · grandmother'],
  ['В в', 'v · as in “van”', 'Consonant', 'вода́ (voda) · water. Looks like a Latin B, but sounds v'],
  [
    'Г г',
    'g · as in “go”',
    'Consonant',
    'го́род (gorod) · city. In the endings -ого and -его it’s said v: его́ (yego, said “yevo”) · him; his',
  ],
  ['Д д', 'd · as in “dog”', 'Consonant', 'де́ти (deti) · children'],
  ['Е е', 'ye · as in “yes”; e after a consonant', 'Vowel', 'ле́то (leto) · summer'],
  [
    'Ё ё',
    'yo · as in “yonder”',
    'Vowel',
    'ёлка (yolka) · fir tree; Christmas tree. Always stressed, and often printed as plain е',
  ],
  ['Ж ж', 'zh · like the s in “pleasure”', 'Consonant', 'жена́ (zhena) · wife'],
  ['З з', 'z · as in “zoo”', 'Consonant', 'зима́ (zima) · winter. Easy to mix up with the digit 3'],
  ['И и', 'i · like the ee in “meet”', 'Vowel', 'и́мя (imya) · first name. On its own, и means “and”'],
  ['Й й', 'y · as in “boy”', 'Consonant', 'музе́й (muzey) · museum. A short i that glides off the vowel before it, as in “hey”'],
  ['К к', 'k · as in “kite”', 'Consonant', 'ко́шка (koshka) · cat'],
  ['Л л', 'l · a dark l, as in “full”', 'Consonant', 'луна́ (luna) · moon'],
  ['М м', 'm · as in “map”', 'Consonant', 'мо́ре (more) · sea'],
  ['Н н', 'n · as in “net”', 'Consonant', 'не́бо (nebo) · sky. Looks like a Latin H, but sounds n'],
  ['О о', 'o · as in “more”, when stressed', 'Vowel', 'молоко́ (moloko) · milk, said “ma-la-KO”: without stress, о sounds like a'],
  ['П п', 'p · as in “pen”', 'Consonant', 'па́па (papa) · dad. Shaped like the Greek letter π'],
  ['Р р', 'r · tapped or rolled', 'Consonant', 'рука́ (ruka) · hand; arm. Looks like a Latin P, but sounds r'],
  ['С с', 's · as in “sun”', 'Consonant', 'соба́ка (sobaka) · dog. Looks like a Latin C, but sounds s'],
  ['Т т', 't · as in “top”', 'Consonant', 'телефо́н (telefon) · telephone. In handwriting, the lowercase looks like a Latin m'],
  ['У у', 'u · like the oo in “food”', 'Vowel', 'у́тро (utro) · morning. Looks like a Latin y, but sounds u'],
  ['Ф ф', 'f · as in “fun”', 'Consonant', 'фо́то (foto) · photo'],
  [
    'Х х',
    'kh · like the ch in Scottish “loch”',
    'Consonant',
    'хо́лодно (kholodno) · it’s cold. Looks like a Latin X, but sounds kh',
  ],
  ['Ц ц', 'ts · as in “cats”', 'Consonant', 'цена́ (tsena) · price'],
  ['Ч ч', 'ch · as in “cheese”', 'Consonant', 'часы́ (chasy) · clock; watch'],
  ['Ш ш', 'sh · as in “shop”, with the tongue pulled back', 'Consonant', 'шко́ла (shkola) · school'],
  [
    'Щ щ',
    'shch · a long, soft sh, as in “fresh sheep”',
    'Consonant',
    'о́вощи (ovoshchi) · vegetables. Looks like ш with a small tail',
  ],
  [
    'Ъ ъ',
    'Hard sign · no sound of its own; written ” or left out',
    'Sign',
    'Separates a prefix from a following е, ё, ю or я, which keep their y sound: подъе́зд (podyezd) · building entrance',
  ],
  ['Ы ы', 'y · like the i in “ill”, with the tongue pulled back', 'Vowel', 'ры́ба (ryba) · fish. Almost never starts a word'],
  [
    'Ь ь',
    'Soft sign · no sound of its own; written ’',
    'Sign',
    'Softens the consonant before it, as if a faint y followed: о́сень (osen’) · autumn',
  ],
  ['Э э', 'e · as in “met”', 'Vowel', 'эта́ж (etazh) · floor of a building. Unlike е, it has no y sound'],
  ['Ю ю', 'yu · as in “you”', 'Vowel', 'ю́бка (yubka) · skirt'],
  ['Я я', 'ya · as in “yard”', 'Vowel', 'я́блоко (yabloko) · apple. On its own, я means “I”'],
  // First words and phrases
  [
    'здра́вствуйте',
    'zdravstvuyte · hello',
    'Greeting, polite',
    'The first в is silent: “ZDRAST-vuy-tye”. For strangers, elders and groups',
  ],
  ['приве́т', 'privet · hi', 'Greeting, informal', 'For friends, family and children'],
  ['до свида́ния', 'do svidaniya · goodbye', 'Farewell', 'Literally “until the meeting”. Polite, for any situation'],
  ['пока́', 'poka · bye', 'Farewell, informal', 'For friends and family'],
  ['спаси́бо', 'spasibo · thank you', 'Phrase', 'большо́е спаси́бо (bol’shoye spasibo) · thank you very much'],
  ['пожа́луйста', 'pozhaluysta · please; you’re welcome', 'Phrase', 'Usually said “pa-ZHAL-sta”. Also the reply to спаси́бо'],
  ['да', 'da · yes', 'Word', 'Да, коне́чно (da, konechno) · yes, of course'],
  ['нет', 'net · no', 'Word', 'Also “there is no”: нет вре́мени (net vremeni) · there’s no time'],
  ['извини́те', 'izvinite · excuse me; sorry', 'Phrase', 'Polite; with friends, say извини́ (izvini)'],
  ['Как дела́?', 'kak dela? · how are you?', 'Question', 'Literally “how are things?” A common reply: хорошо́, спаси́бо'],
  ['хорошо́', 'khorosho · good; fine; OK', 'Word', 'Said “kha-ra-SHO”: both unstressed о sound like a'],
  ['Меня́ зову́т…', 'menya zovut… · my name is…', 'Phrase', 'Literally “they call me…”: Меня́ зову́т А́нна'],
  ['О́чень прия́тно', 'ochen’ priyatno · nice to meet you', 'Phrase', 'Literally “very pleasant”. Said after introductions'],
  [
    'Я не понима́ю',
    'ya ne ponimayu · I don’t understand',
    'Phrase',
    'Then: Повтори́те, пожа́луйста (povtorite, pozhaluysta) · please say that again',
  ],
  ['Ско́лько сто́ит?', 'skol’ko stoit? · how much does it cost?', 'Question', 'ско́лько · how much; how many. сто́ит · it costs'],
  [
    'Где туале́т?',
    'gde tualet? · where is the toilet?',
    'Question',
    'The same pattern works for anything: Где метро́? · where is the metro?',
  ],
  [
    'Вы говори́те по-англи́йски?',
    'vy govorite po-angliyski? · do you speak English?',
    'Question',
    'Вы is the polite or plural “you”; ты (ty) is informal',
  ],
]

export const RUSSIAN_CYRILLIC: PublicDeck = {
  slug: 'russian-cyrillic',
  title: 'Russian Cyrillic: all 33 letters and first words',
  shortTitle: 'Russian Cyrillic',
  category: 'languages',
  level: 'beginner',
  icon: 'globe',
  description:
    'Learn to read Russian: all 33 Cyrillic letters with their sounds and an example word each, then 17 first words and phrases, with stress marked.',
  intro:
    'Cyrillic looks harder than it is: a few letters match English, a handful are false friends like В, Н and Р, and the rest are new. This deck covers all 33 letters with their sound, a transliteration and an example word, then 17 first words and phrases, from приве́т to спаси́бо. Stress is marked with an accent, as in learner dictionaries.',
  faq: [
    {
      q: 'How long does it take to learn the Cyrillic alphabet?',
      a: 'Many learners can sound out Russian words within a week or two of short daily sessions. The false friends (В, Н, Р, С, У and Х) take the most practice.',
    },
    {
      q: 'What do the accent marks mean?',
      a: 'They show the stressed syllable. Russian stress is hard to predict and changes how vowels sound, so learner materials mark it; everyday Russian text doesn’t. One-syllable words carry no mark, and ё is always stressed.',
    },
    {
      q: 'Which transliteration does this deck use?',
      a: 'A simple English-based one: zh for Ж, kh for Х, ts for Ц, shch for Щ, ya and yu for Я and Ю, and ’ for the soft sign. It’s the style used in most phrasebooks.',
    },
    {
      q: 'Why do two letters have no sound?',
      a: 'The soft sign ь makes the consonant before it soft, as if a faint y followed. The hard sign ъ is rarer: it separates a prefix from a following е, ё, ю or я, so they keep their y sound.',
    },
  ],
  cards: CARDS.map(([front, back, hint, extra]) => ({ front, back, hint, extra })),
}
