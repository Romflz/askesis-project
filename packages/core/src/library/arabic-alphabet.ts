import type { PublicDeck } from './types.ts'

// Joined forms are drawn with a tatweel (ـ, U+0640), the stretching stroke, so any font shapes the letter as it
// would inside a word. Everything is ordinary Arabic text; no presentation-form characters.
const TATWEEL = 'ـ'

function forms(letter: string, joinsNext: boolean): string {
  return joinsNext
    ? `Joins the next letter: initial ${letter}${TATWEEL}, medial ${TATWEEL}${letter}${TATWEEL}, final ${TATWEEL}${letter}`
    : `Never joins the next letter, so it has two shapes: ${letter} and ${TATWEEL}${letter}`
}

// [letter, name · sound, joins the next letter, example word, note]
const LETTERS: [string, string, boolean, string, string?][] = [
  ['ا', 'Alif · long ā, as in “father”', false, 'باب (bāb) · door', 'At the start of a word it usually carries hamza: أ or إ'],
  ['ب', 'Bā’ · b, as in “bed”', true, 'بيت (bayt) · house'],
  ['ت', 'Tā’ · t, as in “ten”', true, 'تمر (tamr) · dates (the fruit)', 'Like ب with two dots above'],
  ['ث', 'Thā’ · th, as in “think”', true, 'ثلاثة (thalātha) · three', 'Like ب with three dots above'],
  ['ج', 'Jīm · j, as in “jam”', true, 'جمل (jamal) · camel', 'Said as a hard g in Egypt'],
  ['ح', 'Ḥā’ · ḥ, a breathy h from deep in the throat', true, 'حليب (ḥalīb) · milk', 'Like ج without the dot'],
  ['خ', 'Khā’ · kh, like the ch in Scottish “loch”', true, 'خبز (khubz) · bread', 'Like ج with the dot above'],
  ['د', 'Dāl · d, as in “dog”', false, 'دار (dār) · house; home'],
  ['ذ', 'Dhāl · th, as in “this”', false, 'ذهب (dhahab) · gold', 'Like د with a dot'],
  ['ر', 'Rā’ · r, tapped or rolled', false, 'رجل (rajul) · man'],
  ['ز', 'Zāy · z, as in “zoo”', false, 'زيت (zayt) · oil', 'Like ر with a dot'],
  ['س', 'Sīn · s, as in “sun”', true, 'سمك (samak) · fish'],
  ['ش', 'Shīn · sh, as in “shop”', true, 'شمس (shams) · sun', 'Like س with three dots'],
  ['ص', 'Ṣād · ṣ, a heavy s said with the tongue pulled back', true, 'صديق (ṣadīq) · friend'],
  [
    'ض',
    'Ḍād · ḍ, a heavy d',
    true,
    'ضيف (ḍayf) · guest',
    'Like ص with a dot. Arabic is nicknamed “the language of the ḍād”, a sound once thought unique to it',
  ],
  ['ط', 'Ṭā’ · ṭ, a heavy t', true, 'طالب (ṭālib) · student'],
  [
    'ظ',
    'Ẓā’ · ẓ, a heavy th as in “this”',
    true,
    'ظل (ẓill) · shade; shadow',
    'Like ط with a dot. Many speakers say it as a heavy z',
  ],
  ['ع', 'ʿAyn · ʿ, a tight sound from deep in the throat, with no English match', true, 'عين (ʿayn) · eye; spring'],
  ['غ', 'Ghayn · gh, like a gargled French r', true, 'غرفة (ghurfa) · room', 'Like ع with a dot'],
  ['ف', 'Fā’ · f, as in “fun”', true, 'فيل (fīl) · elephant'],
  ['ق', 'Qāf · q, a k said far back in the throat', true, 'قلم (qalam) · pen', 'Two dots above, where ف has one'],
  ['ك', 'Kāf · k, as in “kite”', true, 'كتاب (kitāb) · book'],
  ['ل', 'Lām · l, as in “lamp”', true, 'ليل (layl) · night', 'Followed by alif, it joins into لا'],
  ['م', 'Mīm · m, as in “moon”', true, 'ماء (mā’) · water'],
  ['ن', 'Nūn · n, as in “noon”', true, 'نور (nūr) · light', 'At the start or in the middle, it looks like ب with the dot above'],
  ['ه', 'Hā’ · h, as in “hat”', true, 'هلال (hilāl) · crescent moon', 'Its four shapes look quite different from each other'],
  [
    'و',
    'Wāw · w, or long ū as in “food”',
    false,
    'ولد (walad) · boy',
    'On its own, و means “and”, written joined to the next word',
  ],
  [
    'ي',
    'Yā’ · y, or long ī as in “meet”',
    true,
    'يد (yad) · hand',
    'At the start or in the middle, it looks like ب with two dots below',
  ],
]

// [front, back, hint, extra]
const ESSENTIALS: [string, string, string, string][] = [
  // Vowel and other marks, shown on ب
  ['بَ', 'Fatḥa · a short a: ba', 'Vowel mark', 'A small slanted stroke above the letter. كَتَبَ (kataba) · he wrote'],
  ['بِ', 'Kasra · a short i: bi', 'Vowel mark', 'A small slanted stroke below the letter. بِنْت (bint) · girl; daughter'],
  ['بُ', 'Ḍamma · a short u: bu', 'Vowel mark', 'A small curl, like a tiny و, above the letter. كُتُب (kutub) · books'],
  ['بْ', 'Sukūn · no vowel after the letter: b', 'Vowel mark', 'A small circle above the letter. قَلْب (qalb) · heart'],
  [
    'بّ',
    'Shadda · a doubled consonant: bb',
    'Mark',
    'A small w-shaped mark above the letter, usually with a vowel mark too. حُبّ (ḥubb) · love',
  ],
  [
    'بٌ',
    'Tanwīn · a doubled vowel mark that adds n: bun',
    'Mark',
    'Also بٍ (bin), and بًا (ban) with an extra alif, as in شكرًا (shukran). It marks an indefinite noun: كتابٌ (kitābun) · a book',
  ],
  // Special letters and forms
  [
    'ة',
    'Tā’ marbūṭa · a final -a, said -at when linked to a following word',
    'Letter form',
    'Only at the end of a word, and usually marks a feminine noun: مدرسة (madrasa) · school. Joined form ـة',
  ],
  [
    'ء',
    'Hamza · a glottal stop, the catch in “uh-oh”',
    'Sign',
    'Stands alone or sits on a seat: أ and إ (on alif), ؤ (on wāw), ئ (on a dotless yā’). سؤال (su’āl) · question',
  ],
  [
    'آ',
    'Alif madda · ’ā, a glottal stop plus long ā',
    'Letter form',
    'Written in place of hamza plus alif: آسف (āsif) · sorry, said by a man',
  ],
  [
    'ى',
    'Alif maqṣūra · long ā at the end of a word',
    'Letter form',
    'Shaped like ي without dots, and only at the end of a word: على (ʿalā) · on. Joined form ـى',
  ],
  [
    'لا',
    'Lām-alif · lā; on its own, the word “no”',
    'Letter form',
    'Lām followed by alif always joins into this shape. سلام (salām) · peace',
  ],
  [
    'ال',
    'al- · the',
    'Word',
    'Written joined to its noun: القمر (al-qamar) · the moon. Before sun letters (t, d, r, s, sh, n and others) the l is silent and the next letter doubles: الشمس (ash-shams) · the sun',
  ],
  // Greetings and first words
  [
    'السلام عليكم',
    'as-salāmu ʿalaykum · hello',
    'Greeting',
    'Literally “peace be upon you”. The reply: وعليكم السلام (wa-ʿalaykum as-salām) · and upon you be peace',
  ],
  ['مرحبا', 'marḥaban · hello', 'Greeting', 'Less formal than السلام عليكم. Just as common: أهلا (ahlan) · hi'],
  [
    'صباح الخير',
    'ṣabāḥ al-khayr · good morning',
    'Greeting',
    'Literally “morning of goodness”. The reply: صباح النور (ṣabāḥ an-nūr) · morning of light',
  ],
  ['مساء الخير', 'masā’ al-khayr · good evening', 'Greeting', 'The reply: مساء النور (masā’ an-nūr) · evening of light'],
  [
    'كيف حالك؟',
    'kayfa ḥāluk? · how are you?',
    'Question',
    'To a man kayfa ḥāluka, to a woman kayfa ḥāluki. A reply: بخير (bi-khayr) · fine',
  ],
  ['شكرا', 'shukran · thank you', 'Phrase', 'شكرا جزيلا (shukran jazīlan) · thank you very much'],
  ['عفوا', 'ʿafwan · you’re welcome; excuse me', 'Phrase', 'The usual reply to شكرا. Also a polite “pardon?”'],
  ['من فضلك', 'min faḍlak · please', 'Phrase', 'To a man min faḍlika, to a woman min faḍliki'],
  ['نعم', 'naʿam · yes', 'Word', 'The opposite: لا (lā) · no'],
  ['مع السلامة', 'maʿa as-salāma · goodbye', 'Farewell', 'Literally “with safety”'],
]

export const ARABIC_ALPHABET: PublicDeck = {
  slug: 'arabic-alphabet',
  title: 'Arabic alphabet: all 28 letters and first words',
  shortTitle: 'Arabic alphabet',
  category: 'languages',
  level: 'beginner',
  icon: 'globe',
  description:
    'Learn to read Arabic: all 28 letters with their sounds and joined forms, the short vowel marks, and first greetings in Modern Standard Arabic.',
  intro:
    'Arabic is written right to left, and most letters join the one after them, changing shape as they do. This deck covers all 28 letters with their sound, joined forms and an example word, then the vowel marks, special letters like ة and ى, the word for “the” and ten everyday words and greetings. Everything is Modern Standard Arabic, the written language shared across the Arab world.',
  faq: [
    {
      q: 'Why do Arabic letters change shape?',
      a: 'Most letters join the letter after them, so each has up to four shapes: alone, at the start, in the middle and at the end of a word. Six letters (ا د ذ ر ز و) never join the next letter, which leaves small gaps inside words.',
    },
    {
      q: 'Why are the short vowels missing in most Arabic text?',
      a: 'Everyday Arabic writes only consonants and long vowels, and readers fill in the short vowels from context. The vowel marks appear in children’s books, dictionaries and religious texts, and on the vowel cards in this deck.',
    },
    {
      q: 'Which Arabic does this deck teach?',
      a: 'Modern Standard Arabic, used in writing, news and formal speech in every Arab country. Spoken dialects differ, but they use the same alphabet, and greetings like السلام عليكم are understood everywhere.',
    },
    {
      q: 'What do ā, ḥ, ʿ and ’ mean in the transliteration?',
      a: 'A line over a vowel makes it long. A dot under a letter marks a sound with no English match: ḥ is a breathy h, and ṣ, ḍ, ṭ and ẓ are heavy versions of s, d, t and th. ʿ is the letter ʿayn, and ’ is hamza, the catch in “uh-oh”.',
    },
  ],
  cards: [
    ...LETTERS.map(([letter, back, joinsNext, example, note]) => ({
      front: letter,
      back,
      hint: 'Letter',
      // "Example:" keeps the forms and the example word apart: two Arabic runs separated only by
      // punctuation would merge into one right-to-left run on screen.
      extra: [forms(letter, joinsNext), `Example: ${example}`, note].filter(Boolean).join('. '),
    })),
    ...ESSENTIALS.map(([front, back, hint, extra]) => ({ front, back, hint, extra })),
  ],
}
