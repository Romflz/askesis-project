import type { PublicDeck } from './types.ts'

// [Greek, name · sound or pronunciation · meaning, kind, example or note]
// Pronunciation follows Modern Greek, with the stressed vowel marked as in Greek spelling.
const CARDS: [string, string, string, string][] = [
  // The 24 letters
  ['Α α', 'Alpha · a, as in “father”', 'Vowel', 'αγάπη (aghápi) · love. In math, α often names an angle'],
  ['Β β', 'Beta · v, as in “van”', 'Consonant', 'βιβλίο (vivlío) · book. Greeks call the letter víta'],
  [
    'Γ γ',
    'Gamma · gh, a soft throaty g; y before e and i sounds',
    'Consonant',
    'γάτα (gháta) · cat; γυναίκα (yinéka) · woman. In physics, γ rays are high-energy radiation',
  ],
  [
    'Δ δ',
    'Delta · dh, like the th in “this”',
    'Consonant',
    'δέκα (dhéka) · ten. In math and science, Δ means “change in”, as in Δt',
  ],
  ['Ε ε', 'Epsilon · e, as in “pet”', 'Vowel', 'εδώ (edhó) · here. In math, ε stands for a very small amount'],
  ['Ζ ζ', 'Zeta · z, as in “zoo”', 'Consonant', 'ζωή (zoí) · life'],
  ['Η η', 'Eta · i, like the ee in “meet”', 'Vowel', 'ήλιος (ílios) · sun. In engineering, η often stands for efficiency'],
  ['Θ θ', 'Theta · th, as in “think”', 'Consonant', 'θάλασσα (thálasa) · sea. In math, θ is the usual name for an angle'],
  [
    'Ι ι',
    'Iota · i, like the ee in “meet”',
    'Vowel',
    'ιστορία (istoría) · history; story. The smallest letter, hence “not one iota”',
  ],
  ['Κ κ', 'Kappa · k, as in “kite”', 'Consonant', 'κόσμος (kózmos) · world; people'],
  ['Λ λ', 'Lambda · l, as in “lamp”', 'Consonant', 'λεμόνι (lemóni) · lemon. In physics, λ stands for wavelength'],
  [
    'Μ μ',
    'Mu · m, as in “map”',
    'Consonant',
    'μήλο (mílo) · apple. In science, μ means micro-, one millionth: 1 μm is a micrometer',
  ],
  ['Ν ν', 'Nu · n, as in “net”', 'Consonant', 'νησί (nisí) · island. The lowercase looks like a Latin v, but sounds n'],
  ['Ξ ξ', 'Xi · ks, as in “box”', 'Consonant', 'ξέρω (kséro) · I know'],
  ['Ο ο', 'Omicron · o, as in “more”', 'Vowel', 'όνομα (ónoma) · name. Sounds the same as ω'],
  [
    'Π π',
    'Pi · p, as in “pen”',
    'Consonant',
    'πόρτα (pórta) · door. In math, π ≈ 3.14159, a circle’s circumference divided by its diameter',
  ],
  [
    'Ρ ρ',
    'Rho · r, tapped or rolled',
    'Consonant',
    'ρολόι (rolói) · clock; watch. Looks like a Latin P, but sounds r. In physics, ρ often stands for density',
  ],
  [
    'Σ σ',
    'Sigma · s, as in “sun”',
    'Consonant',
    'σπίτι (spíti) · house; home. In math, Σ means “sum of”; in statistics, σ is the standard deviation',
  ],
  ['Τ τ', 'Tau · t, as in “top”', 'Consonant', 'τραπέζι (trapézi) · table'],
  ['Υ υ', 'Upsilon · i, like the ee in “meet”', 'Vowel', 'ύπνος (ípnos) · sleep. Today ι, η and υ all sound the same'],
  ['Φ φ', 'Phi · f, as in “fun”', 'Consonant', 'φίλος (fílos) · friend. In math, φ is the golden ratio, about 1.618'],
  [
    'Χ χ',
    'Chi · h, like the ch in Scottish “loch”',
    'Consonant',
    'χέρι (héri) · hand. Before e and i sounds it’s softer, like the h in “huge”. In statistics, χ² is the chi-squared test',
  ],
  ['Ψ ψ', 'Psi · ps, as in “lapse”', 'Consonant', 'ψωμί (psomí) · bread. In physics, ψ is the wave function'],
  [
    'Ω ω',
    'Omega · o, the same sound as ο',
    'Vowel',
    'ώρα (óra) · hour; time. In physics, Ω is the ohm, the unit of electrical resistance',
  ],
  [
    'ς',
    'Final sigma · s, used only at the end of a word',
    'Letter form',
    'δρόμος (dhrómos) · street; road. Anywhere else in a word, sigma is σ',
  ],
  // First words and phrases
  ['γεια σου', 'ya su · hi; bye', 'Greeting, informal', 'To one friend. To a stranger or a group: γεια σας (ya sas)'],
  ['καλημέρα', 'kaliméra · good morning', 'Greeting', 'Literally “good day”. Used until about midday'],
  ['καλησπέρα', 'kalispéra · good evening', 'Greeting', 'Used from late afternoon on'],
  ['καληνύχτα', 'kaliníhta · good night', 'Farewell', 'Said when leaving at night or going to bed'],
  ['αντίο', 'andío · goodbye', 'Farewell', 'A more final goodbye; γεια σου is the everyday way to say bye'],
  ['ευχαριστώ', 'efharistó · thank you', 'Phrase', 'ευ sounds “ef” here. Ευχαριστώ πολύ (efharistó polí) · thank you very much'],
  ['παρακαλώ', 'parakaló · please; you’re welcome', 'Phrase', 'Also the reply to ευχαριστώ, and “can I help you?” in shops'],
  ['ναι', 'ne · yes', 'Word', 'Sounds like “neh”, which English speakers easily mistake for “no”'],
  ['όχι', 'óhi · no', 'Word', 'The χ before ι is soft, like the h in “huge”'],
  ['συγγνώμη', 'sighnómi · sorry; excuse me', 'Phrase', 'For apologizing or getting someone’s attention. Also spelled συγνώμη'],
  [
    'Τι κάνεις;',
    'ti kánis? · how are you?',
    'Question, informal',
    'Polite or plural: Τι κάνετε; (ti kánete?). Greek writes its question mark as ;',
  ],
  ['καλά', 'kalá · well; fine', 'Word', 'A common reply: Καλά, ευχαριστώ (kalá, efharistó) · fine, thanks'],
  ['Με λένε…', 'me léne… · my name is…', 'Phrase', 'Literally “they call me…”: Με λένε Μαρία'],
  ['Χαίρω πολύ', 'héro polí · nice to meet you', 'Phrase', 'Literally “I’m very glad”. αι sounds like e'],
  [
    'Δεν καταλαβαίνω',
    'dhen katalavéno · I don’t understand',
    'Phrase',
    'Δεν (dhen) makes a verb negative: καταλαβαίνω · I understand',
  ],
  [
    'Μιλάτε αγγλικά;',
    'miláte angliká? · do you speak English?',
    'Question',
    'γγ sounds like the ng in “finger”. Informal: Μιλάς αγγλικά; (milás angliká?)',
  ],
  ['Πόσο κάνει;', 'póso káni? · how much is it?', 'Question', 'Literally “how much does it make?”'],
  [
    'Πού είναι…;',
    'pu íne…? · where is…?',
    'Question',
    'Πού είναι η τουαλέτα; (pu íne i tualéta?) · where is the toilet? The accent tells πού, “where?”, from που, “that”',
  ],
  ['εντάξει', 'endáksi · OK; all right', 'Word', 'ντ sounds like d or nd'],
  ['ωραία', 'oréa · nice; lovely; great', 'Word', 'Πολύ ωραία (polí oréa) · very nice'],
  ['νερό', 'neró · water', 'Word', 'Ένα νερό, παρακαλώ (éna neró, parakaló) · a water, please'],
  ['καφές', 'kafés · coffee', 'Word', 'Ελληνικός καφές (elinikós kafés) · Greek coffee'],
  ['σήμερα', 'símera · today', 'Word', 'Σήμερα είναι Δευτέρα (símera íne dheftéra) · today is Monday'],
  ['αύριο', 'ávrio · tomorrow', 'Word', 'Τα λέμε αύριο (ta léme ávrio) · see you tomorrow'],
  ['Ελλάδα', 'Eládha · Greece', 'Word', 'ελληνικά (eliniká) · the Greek language'],
]

export const GREEK_ALPHABET: PublicDeck = {
  slug: 'greek-alphabet',
  title: 'Greek alphabet: all 24 letters and first words',
  shortTitle: 'Greek alphabet',
  category: 'languages',
  level: 'beginner',
  icon: 'globe',
  description:
    'Learn the Greek alphabet: all 24 letters with their Modern Greek sounds and uses in math and science, then 25 first words and phrases.',
  intro:
    'Greek letters turn up everywhere from π to Δt, but in Greece they spell a living language. This deck covers all 24 letters with their Modern Greek sound, an example word and, where it helps, their use in math and science, then final sigma and 25 first words and phrases, from γεια σου to ευχαριστώ.',
  faq: [
    {
      q: 'Is this ancient or modern Greek?',
      a: 'Modern Greek. The letters are the same, but some sounds have changed: β is now v, δ is the th in “this”, and η and υ sound like i. Math and science use the same letters, usually with their English names.',
    },
    {
      q: 'Why do the words have accent marks?',
      a: 'Greek marks the stressed syllable of every word with two or more syllables. One-syllable words go without, apart from a few like πού, “where?”, where the accent tells two words apart.',
    },
    {
      q: 'Why do ι, η and υ sound the same?',
      a: 'Over the centuries they merged into one sound, the ee in “meet”, and so did ει and οι. Likewise ο and ω both sound o, and αι sounds like ε. Spelling keeps the old distinctions.',
    },
    {
      q: 'How do the pronunciation guides work?',
      a: 'They spell Greek as it sounds: v for β, gh or y for γ, dh for δ, h for χ, and i for ι, η and υ, with an accent on the stressed vowel.',
    },
  ],
  cards: CARDS.map(([front, back, hint, extra]) => ({ front, back, hint, extra })),
}
